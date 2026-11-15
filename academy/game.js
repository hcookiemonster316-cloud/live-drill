// Patrol City: game loop, camera, input, people and traffic, lighting, dispatch, learning scenes and HUD.
import { N, TW, TH, T, CH, iso, unIso, buildDistrict, drawGround, drawBuilding, drawProp, car, person, dog, vehicle, CAR_COLORS, shade } from './world.js';
import { DISTRICTS, NPCS, LANDMARKS, CALLS, OBSERVE, SHIFTS, SHIFT_MIN, PHONETIC, QUICK, UNITS, STATS, unitName } from './data.js';
import * as L from './learn.js';
import { startNet } from './net.js';
import { peopleFor } from './npcgen.js';
import { WORLD, LORE, CAST, CHAPTERS } from './story.js';
import { BRANCHES, SKILLS, skillById, skillPoints, canLearn } from './skills.js';
import { ITEMS, RARITY, SLOTS, OUTFITS, itemById, slotOf, roll, reveal, collectionHTML, equipHTML, itemCardHTML, gearTotals, looks } from './items.js';
import { ENTER, buildInterior, drawFurn, staffDraw, visitorDraw, STAFF_LINES } from './interiors.js';

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const S = L.loadState();
S.gear = S.gear || {}; S.outfit = OUTFITS[S.outfit] ? S.outfit : 'std'; if (S.flair) { delete S.flair; } if (S.items && S.items.vest && !S.gear.uniform) S.gear.uniform = 'vest';
const cv = $('view'), ctx = cv.getContext('2d');
const lc = document.createElement('canvas'), lx = lc.getContext('2d');
let W = null, G = null, SPR = [], NIGHT = false, net = null, others = {}, myUid = '';
let cam = { x: 0, y: 0, z: 1, free: false }, dpr = 1, cw = 0, ch = 0;
const P = { x: 0, y: 0, path: [], face: 1, moving: false, inCar: false, dir: 0, onArrive: null };
let pcar = null, peds = [], traffic = [], citizens = [], infos = [], observes = [], call = null, scene = null, clock = 0, nextCall = 15, paused = false, toastT = 0;
const shiftOf = () => SHIFTS.find((s) => s.id === S.shift) || SHIFTS[0];
// ---------- specialty unit: stats and perks ----------
const unitOf = (id) => UNITS.find((u) => u.id === id) || UNITS[0];
const U = () => unitOf(S.unit);
const DBL = { k9: [18], neg: [4, 7, 14, 15], marine: [11, 16], brt: [9, 10], det: [3, 13], sro: [9, 12] }; // lessons whose calls pay double
// unit stats plus whatever gear is equipped (capped at 7)
let GT = {}; const refreshGear = () => { GT = gearTotals(S); Object.keys(S.skills || {}).forEach((id) => { const k = skillById(id); if (k && k.perk) Object.keys(k.perk).forEach((p) => { GT[p] = (GT[p] || 0) + k.perk[p]; }); }); };
const hasSk = (id) => !!(S.skills || {})[id];
const ST = () => { const b = U().st, o = {}; Object.keys(b).forEach((k) => { o[k] = Math.max(1, Math.min(7, b[k] + (GT[k] || 0))); }); return o; };
const gp = (k) => GT[k] || 0;
const rapMult = () => 1 + (ST().rap - 3) * .1;
const spotR = () => (3 + ST().per * .8) * (S.unit === 'k9' ? 2 : 1) + gp('spot');
const callWait = () => 90 + ST().com * 20 + gp('wait'); // game minutes before another unit takes the call
function callMult(c) { const u = U(); let m = (c.prio <= 2 ? 1 + (ST().tac - 3) * .1 : 1) * (1 + gp('rpCall') / 100); if (u.id === 'swat' && c.prio === 1) m *= 1.5; if (u.id === 'patrol') m *= 1.1; if ((DBL[u.id] || []).indexOf(c.les) >= 0) m *= 2; return m; }
let pboat = null; const K9 = { x: 0, y: 0, face: 1, moving: false };

// ---------- sound (tiny synth, no files) ----------
let AC = null; const audio = () => { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return AC; };
function beep(f, d, type, v, when) { if (!S.sound) return; const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = type || 'square'; o.frequency.value = f; g.gain.value = v || .04; o.connect(g); g.connect(a.destination); const t = a.currentTime + (when || 0); o.start(t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.stop(t + d + .02); }
const chirp = () => { beep(1400, .06, 'square', .03); beep(1900, .07, 'square', .03, .07); };
const good = () => { beep(660, .12, 'triangle', .06); beep(990, .18, 'triangle', .06, .1); };
const bad = () => beep(180, .22, 'sawtooth', .04);
let sirenT = 0;

// ---------- pathfinding (A*, 8 directions for walking, 4 for driving) ----------
function astar(sx, sy, tx, ty, pass, diag) {
  sx = Math.floor(sx); sy = Math.floor(sy); tx = Math.floor(tx); ty = Math.floor(ty);
  if (!pass(tx, ty)) { const alt = nearest(tx, ty, pass); if (!alt) return null; [tx, ty] = alt; }
  const NN = N * N, gS = new Float32Array(NN).fill(1e9), came = new Int32Array(NN).fill(-1), closed = new Uint8Array(NN), heap = [], hf = [];
  const h = (x, y) => { const dx = Math.abs(tx - x), dy = Math.abs(ty - y); return diag ? Math.max(dx, dy) + .414 * Math.min(dx, dy) : dx + dy; };
  const push = (k, f) => { heap.push(k); hf.push(f); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (hf[p] <= hf[i]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; [hf[p], hf[i]] = [hf[i], hf[p]]; i = p; } };
  const pop = () => { const top = heap[0], lk = heap.pop(), lf = hf.pop(); if (heap.length) { heap[0] = lk; hf[0] = lf; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < heap.length && hf[l] < hf[m]) m = l; if (r < heap.length && hf[r] < hf[m]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; [hf[m], hf[i]] = [hf[i], hf[m]]; i = m; } } return top; };
  const s0 = sy * N + sx, goal = ty * N + tx; if (s0 < 0 || s0 >= NN) return null; gS[s0] = 0; push(s0, h(sx, sy)); let guard = 0;
  const dirs = diag ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (heap.length && guard++ < 40000) {
    const k = pop(); if (closed[k]) continue; closed[k] = 1;
    if (k === goal) { const out = []; let c = k; while (c !== s0 && c >= 0) { out.push([c % N + .5, Math.floor(c / N) + .5]); c = came[c]; } return out.reverse(); }
    const x = k % N, y = (k - x) / N;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const nk = ny * N + nx; if (closed[nk] || !pass(nx, ny)) continue;
      if (dx && dy && (!pass(x + dx, y) || !pass(x, y + dy))) continue;
      const ng = gS[k] + (dx && dy ? 1.414 : 1); if (ng < gS[nk]) { gS[nk] = ng; came[nk] = k; push(nk, ng + h(nx, ny)); }
    }
  }
  return null;
}
function nearest(x, y, pass) { for (let r = 1; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (pass(x + dx, y + dy)) return [x + dx, y + dy]; return null; }
const pedPass = (x, y) => { const v = W.at(x, y); return (v === T.WALK || v === T.PLAZA) && !W.blocked.has(y * N + x); };
const roadPass = (x, y) => W.at(x, y) === T.ROAD && !W.blocked.has(y * N + x);

// ---------- loading a district ----------
// the hour on the shift clock drives daylight, shadows and lit windows (midshift goes from day into night)
let ATTRACT = false, attractHour = 21.4;
const hourNow = () => (ATTRACT ? attractHour : (shiftOf().start + clock / 60) % 24);
const isNight = (h) => h >= 18.75 || h < 6;
function sunFor(h) { return isNight(h) ? { len: 0, a: 0 } : { len: Math.round(18 + Math.abs(h - 12.5) * 6), a: .2 }; }
let SUN = null;
// building sprites are drawn the first time they come on screen and dropped again when long unseen
function buildSprites() {
  const h = hourNow(); NIGHT = isNight(h); SUN = sunFor(h);
  SPR = W.buildings.map((b) => { const A = iso(b.x, b.y), Bp = iso(b.x + b.w, b.y), C = iso(b.x + b.w, b.y + b.d), Dp = iso(b.x, b.y + b.d), ex = b.dome ? 60 : 30;
    return { b, depth: b.x + b.w - 1 + b.y + b.d - 1 + .9, bx: Dp[0] - 6, by: A[1] - b.h - ex, bw: Bp[0] - Dp[0] + 80, bh: C[1] - A[1] + b.h + ex + 40, canvas: null, lights: [] }; });
}
function spriteOf(s) { if (!s.canvas) Object.assign(s, drawBuilding(s.b, NIGHT, SUN)); s.used = performance.now(); return s; }
function trimSprites() { const live = SPR.filter((s) => s.canvas); if (live.length < 140) return; live.sort((a, b) => a.used - b.used).slice(0, live.length - 110).forEach((s) => { s.canvas = null; s.lights = []; }); }
function focus() { return ATTRACT || !P ? unIso(cam.x, cam.y) : [P.x, P.y]; }
// ground chunks around the camera
function groundDraw(z) {
  if (G.canvas) { ctx.drawImage(G.canvas, -G.ox, -G.oy); return; }
  const hw = cv.width / 2 / z + 80, hh = cv.height / 2 / z + 80, pts = [unIso(cam.x - hw, cam.y - hh), unIso(cam.x + hw, cam.y - hh), unIso(cam.x - hw, cam.y + hh), unIso(cam.x + hw, cam.y + hh)];
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), M = Math.ceil(N / CH) - 1, cx0 = Math.max(0, Math.floor(Math.min(...xs) / CH)), cx1 = Math.min(M, Math.floor(Math.max(...xs) / CH)), cy0 = Math.max(0, Math.floor(Math.min(...ys) / CH)), cy1 = Math.min(M, Math.floor(Math.max(...ys) / CH));
  let made = 0; const now = performance.now();
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
    const k = cx + ',' + cy; let c = G.chunks.get(k);
    if (!c) { if (made > 3 && G.chunks.size > 4) continue; c = drawGround(W, cx, cy); G.chunks.set(k, c); made++; }
    c.used = now; ctx.drawImage(c.canvas, -c.ox, -c.oy);
  }
  if (G.chunks.size > 48) [...G.chunks.entries()].sort((a, b) => a[1].used - b[1].used).slice(0, G.chunks.size - 40).forEach(([k]) => G.chunks.delete(k));
}

let sprHour = -1;
function load(did) {
  refreshGear();
  inside = null; if (net && net.inside) net.inside(-1);
  W = buildDistrict(did); G = { chunks: new Map() }; buildSprites(); sprHour = Math.floor(hourNow());
  P.x = W.spawn[0] + .5; P.y = W.spawn[1] + .5; P.path = []; P.inCar = false;
  pcar = W.carSpot ? { x: W.carSpot[0], y: W.carSpot[1], dir: 0, bar: false } : null;
  const h0 = hourNow(), busy = isNight(h0) ? (h0 >= 18.75 && h0 < 22 ? .6 : .38) : 1;
  peds = []; for (let i = 0; i < Math.round(30 * busy); i++) peds.push(newPed());
  traffic = []; for (let i = 0; i < Math.round(11 * busy) + 2; i++) traffic.push(newCar());
  citizens = []; infos = []; observes = []; call = null; nextCall = 12;
  W.lots.forEach((l) => { const lm = LANDMARKS[l.kind]; if (lm && lm.info != null && DISTRICTS[did].lessons.indexOf(lm.info) >= 0 && !infos.some((i) => i.kind === l.kind)) infos.push({ x: l.info[0] + .5, y: l.info[1] + .5, les: lm.info, name: lm.name, kind: l.kind, cool: 0 }); });
  const tr = S.trust[did] == null ? 50 : S.trust[did];
  for (let i = 0; i < (tr >= 70 ? 4 : tr < 30 ? 2 : 3) + (S.unit === 'hoi' ? 2 : 0); i++) citizens.push(newCitizen());
  for (let i = 0; i < 2 + (S.unit === 'det' ? 1 : 0); i++) observes.push(newObserve());
  pboat = null; P.boat = false; K9.x = P.x - .8; K9.y = P.y + .4;
  if (W.river && S.unit === 'marine') { const y = Math.max(2, Math.min(N - 3, Math.round(P.y))); pboat = { x: 36.6, y: y + .5, dir: 1, dock: [35.5, y + .5] }; }
  exploreInit(); liveInit(); placeRegulars(); ambienceInit(); SS = { rp: 0, calls: 0, right: 0, answered: 0, ords: {} }; COMBO = 0; bestCombo = 0; ordersInit(); comboHud(); unlockLore(); abilitiesInit(); $('hExp').textContent = 'Explored ' + Math.floor(exCount / exTotal * 100) + '%';
  cam.x = iso(P.x, P.y)[0]; cam.y = iso(P.x, P.y)[1]; cam.free = false;
  hud(); radio('Dispatch', 'All units, ' + shiftOf().name.toLowerCase() + ' in ' + W.D.name + ' is on. ' + S.cs + ', you are in service.');
  CHAT.list = []; CHAT.seen = new Set(); if (net && net.chatOn) net.chatOn(did, chatIn);
  if (net) net.join(did, S.shift, { cs: S.cs, unit: S.unit, flair: myTokens(), x: P.x, y: P.y, rank: L.rankOf(S.xp).name });
}
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const SKIN = ['#f1c9a5', '#e0b48f', '#c68e63', '#a26a42', '#7a4b2a', '#5a3620'], SHIRT = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#ecf0f1', '#16a085', '#d35400', '#7f8c8d', '#f5b7b1'], HAIR = ['#2b1d14', '#4a3020', '#8a5a2b', '#d8b46a', '#1a1a1a', '#9a9a9a'];
function nearTile(list, r) { const c = focus(); for (let k = 0; k < 60; k++) { const t = list[Math.floor(Math.random() * list.length)]; if (t && Math.hypot(t[0] - c[0], t[1] - c[1]) < r) return t; } return list[Math.floor(Math.random() * list.length)]; }
function newPed() { const s = nearTile(W.walk, 22); return { x: s[0] + .5, y: s[1] + .5, path: [], wait: Math.random() * 3, sp: 1.1 + Math.random() * .7, skin: rnd(SKIN), shirt: rnd(SHIRT), hair: rnd(HAIR), pants: rnd(['#3b4a5c', '#2c3e50', '#5d4037', '#455a64', '#1c1c1c']), ph: Math.random() * 9, face: 1 }; }
function newCar() { const roads = [], c0 = focus(); for (let i = 0; i < 120; i++) { const x = Math.floor(c0[0] + (Math.random() - .5) * 44), y = Math.floor(c0[1] + (Math.random() - .5) * 44); if (roadPass(x, y)) { roads.push([x, y]); break; } } const s = roads[0] || [0, 0]; return { x: s[0] + .5, y: s[1] + .5, path: [], sp: 2.6 + Math.random() * 1.6, color: rnd(CAR_COLORS), dir: 0 }; }
function newCitizen() { const s = nearTile(W.walk, 26); return { x: s[0] + .5, y: s[1] + .5, skin: rnd(SKIN), shirt: rnd(SHIRT), hair: rnd(HAIR), ph: 0, face: -1, les: rnd(W.D.lessons) }; }
function newObserve() { const did = W.did, ls = W.D.lessons.filter((l) => OBSERVE[l]); const les = rnd(ls.length ? ls : W.D.lessons); const o = rnd(OBSERVE[les] || [['Something looks out of place', 'door']]); const s = nearTile(W.walk, 30); return { x: s[0] + .5, y: s[1] + .5, les, text: o[0], kind: o[1], seen: false, t0: performance.now() }; void did; }

// ---------- dispatch ----------
function dispatchCall() {
  const fav = U().fav.filter((l) => W.D.lessons.indexOf(l) >= 0 && !L.mastery(S, l).done), les = fav.length && Math.random() < .3 ? fav[Math.floor(Math.random() * fav.length)] : L.weakest(S, W.did), list = CALLS[les] || [['Assist a citizen', 3, 'any', 'Citizen flagging down an officer.']], c = rnd(list);
  const lot = c[2] !== 'any' && W.lots.filter((l) => l.kind === c[2] || (c[2] === 'parking' && (l.kind === 'parking' || l.kind === 'lot'))).sort((a, b) => Math.hypot(a.door[0] - P.x, a.door[1] - P.y) - Math.hypot(b.door[0] - P.x, b.door[1] - P.y))[0];
  const spot = lot ? lot.door : nearTile(W.walk, 28), where = lot ? (LANDMARKS[lot.kind] || {}).name || 'the ' + lot.kind : 'block ' + (100 + spot[1] * 10) + ' ' + ['Main St', 'Bay St', 'Oak Ave', 'Pine St', 'Harbor Rd'][spot[0] % 5];
  call = { les, title: c[0], prio: c[1], text: c[3], x: spot[0] + .5, y: spot[1] + .5, where, t0: clock, accepted: false, backup: false };
  radio('Dispatch', S.cs + ', ' + (c[1] === 1 ? 'priority one, ' : '') + c[0].toLowerCase() + ' at ' + where + '. ' + c[3]); chirp(); callCard();
}
function callCard() {
  const el = $('callCard'); if (!call) { el.hidden = true; return; }
  el.hidden = false; el.className = 'callCard p' + call.prio;
  el.innerHTML = '<div class="ccTop"><b>' + (call.prio === 1 ? 'PRIORITY 1' : call.prio === 2 ? 'PRIORITY 2' : 'ROUTINE') + '</b><span>' + esc(L.lessonName(call.les)) + '</span></div><div class="ccT">' + esc(call.title) + '</div><div class="ccW">' + esc(call.where) + '</div>' +
    '<div class="ccB"><button type="button" id="ccGo">' + (call.accepted ? 'Navigate' : 'Respond') + '</button><button type="button" class="ghost" id="ccBk">' + (call.backup ? 'Backup requested' : 'Request backup') + '</button></div>';
  $('ccGo').onclick = () => { if (inside) exitBuilding(); call.accepted = true; if (net) net.status('call'); radio(S.cs, 'En route.'); goTo(call.x, call.y, () => {}); callCard(); };
  $('ccBk').onclick = () => { if (call.backup) return; call.backup = true; if (net) net.backup({ x: call.x, y: call.y, l: call.title.slice(0, 48) }); radio(S.cs, 'Requesting backup at ' + call.where + '.'); callCard(); };
}

// ---------- movement ----------
function goTo(x, y, onArrive) {
  const pass = P.boat ? (a, b) => W.at(a, b) === T.WATER : P.inCar ? (a, b) => W.drivable(a, b) : (a, b) => W.walkable(a, b) && !gateBlock(a, b) && W.at(a, b) !== T.WATER;
  const p = astar(P.x, P.y, x, y, pass, !P.inCar);
  if (!p) { toast('No way through from here.'); return; }
  P.path = p; P.onArrive = onArrive || null; cam.free = false;
}
function gateBlock(x, y) { return W.gates.some((g) => !S.unlocked.includes(g.to) && Math.abs(g.x - x) <= 1 && Math.abs(g.y - y) <= 1 && false); }
function stepAlong(e, dt, sp) {
  if (!e.path.length) { e.moving = false; return true; }
  const [tx, ty] = e.path[0], dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy), m = sp * dt;
  if (Math.abs(dx) > .01) e.face = dx - dy > 0 ? 1 : -1;
  if (Math.abs(dx) > Math.abs(dy)) e.dir = dx > 0 ? 0 : 2; else if (Math.abs(dy) > .01) e.dir = dy > 0 ? 1 : 3;
  e.moving = true;
  if (d <= m) { e.x = tx; e.y = ty; e.path.shift(); return !e.path.length; }
  e.x += dx / d * m; e.y += dy / d * m; return false;
}

// ---------- update ----------
let last = performance.now(), moveSent = 0;
function update(dt, now) {
  if (paused) return;
  clock += dt * .75; // one real second is 45 game seconds; a 12-hour shift takes 16 minutes
  { const hr = Math.floor(hourNow()); if (hr !== sprHour) { sprHour = hr; const was = NIGHT; buildSprites(); if (was !== NIGHT) radio('Dispatch', NIGHT ? 'All units, sunset. Lights on.' : 'All units, sunrise.'); } }
  const st = ST(), sp = P.boat ? 8 * (1 + gp('drive') / 100) : P.inCar ? (call && call.accepted ? 6.6 : 4.8) * U().ride.speed * (.88 + st.res * .06) * (1 + gp('drive') / 100) : (2.9 + st.res * .2) * (1 + gp('speed') / 100); const spB = sp * (clock < BUFF.speedTo ? (BUFF.speedMul || 1.25) : 1);
  if (P.path.length) { const done = stepAlong(P, dt, spB); if (done && P.onArrive) { const f = P.onArrive; P.onArrive = null; f(); } }
  else P.moving = false;
  if (P.inCar && pcar) { pcar.x = P.x; pcar.y = P.y; pcar.dir = P.dir; pcar.bar = !!(call && call.accepted); }
  if (P.boat && pboat) { pboat.x = P.x; pboat.y = P.y; pboat.dir = P.dir; }
  if (S.unit === 'k9' && !P.inCar && !P.boat) { const tx = P.x - (P.face > 0 ? .7 : -.7) * .7, ty = P.y + .55, d = Math.hypot(tx - K9.x, ty - K9.y); K9.moving = d > .08; if (d > 6) { K9.x = tx; K9.y = ty; } else { K9.x += (tx - K9.x) * Math.min(1, dt * 4); K9.y += (ty - K9.y) * Math.min(1, dt * 4); } K9.face = P.face; }
  if (!cam.free) { const [ix, iy] = iso(P.x, P.y); cam.x += (ix - cam.x) * Math.min(1, dt * 6); cam.y += (iy - 22 - cam.y) * Math.min(1, dt * 6); }
  { const f = focus(); peds.forEach((p, k) => { if (Math.hypot(p.x - f[0], p.y - f[1]) > 30) peds[k] = newPed(); }); traffic.forEach((c, k) => { if (Math.hypot(c.x - f[0], c.y - f[1]) > 34) traffic[k] = newCar(); }); }
  peds.forEach((p) => { if (p.wait > 0) { p.wait -= dt; p.moving = false; return; } if (!p.path.length) { const t = nearTile(W.walk, 24); const path = Math.hypot(t[0] - p.x, t[1] - p.y) < 16 ? astar(p.x, p.y, t[0], t[1], pedPass, true) : null; if (path) p.path = path; else p.wait = 1; return; } if (stepAlong(p, dt, p.sp)) p.wait = 1 + Math.random() * 4; });
  traffic.forEach((c) => { if (!c.path.length) { for (let k = 0; k < 6; k++) { const x = Math.floor(c.x + (Math.random() - .5) * 40), y = Math.floor(c.y + (Math.random() - .5) * 40); if (roadPass(x, y)) { const p = astar(c.x, c.y, x, y, roadPass, false); if (p && p.length > 3) { c.path = p; break; } } } return; } stepAlong(c, dt, c.sp); });
  // arrive on a call
  if (call && !inside && Math.hypot(call.x - P.x, call.y - P.y) < 1.7 && !scene) { const c = call; call = null; callCard(); openCallScene(c); }
  if (!call && !scene) { nextCall -= dt; if (nextCall <= 0) dispatchCall(); }
  if (call && clock - call.t0 > callWait() + BUFF.wait) { radio('Dispatch', S.cs + ', disregard; another unit took that call.'); call = null; callCard(); nextCall = 20; if (net) { net.status('patrol'); net.backup(null); } }
  // observation moments appear only up close
  observes.forEach((o) => { if (!o.seen && Math.hypot(o.x - P.x, o.y - P.y) < spotR()) { o.seen = true; toast((S.unit === 'k9' ? 'Your K9 alerts. ' : '') + 'Something\'s off: ' + o.text + '. Tap the ! to check it out.'); beep(880, .08, 'sine', .04); if (S.unit === 'k9') { beep(520, .07, 'square', .03, .1); beep(520, .07, 'square', .03, .22); } } });
  infos.forEach((i) => { if (i.cool > 0) i.cool -= dt; });
  // gates
  W.gates.forEach((g) => { if (Math.abs(P.x - (g.x + .5)) < 1.2 && Math.abs(P.y - (g.y + 1)) < 1.6 && !g.prompted) { g.prompted = true; gatePrompt(g); } else if (Math.hypot(P.x - (g.x + .5), P.y - (g.y + 1)) > 3) g.prompted = false; });
  // siren
  if ((P.inCar || P.boat) && call && call.accepted) { sirenT -= dt; if (sirenT <= 0) { sirenT = .9; beep(720, .42, 'sine', .018); beep(980, .42, 'sine', .018, .45); } }
  if (net && now - moveSent > 120) { moveSent = now; net.move(P.x, P.y, P.boat ? 2 : P.inCar ? 1 : 0, P.dir); }
  liveUpdate(dt);
  storyUpdate(dt); objectiveHud(); tipsUpdate(dt);
  if (inside && !P.path.length && Math.hypot(W.door[0] - P.x, W.door[1] - P.y) < .45) exitBuilding();
  hudClock();
  if (clock >= SHIFT_MIN && !scene) endOfWatch();
}

// ---------- drawing ----------
function darkness() {
  if (inside) return { a: 0, tint: null };
  const h = hourNow();
  if (h >= 7 && h < 17.5) return { a: 0, tint: null };
  if (h >= 17.5 && h < 20) { const k = (h - 17.5) / 2.5; return { a: k * .72, tint: k < .5 ? 'rgba(255,140,60,' + (.16 * (1 - k * 2)) + ')' : null, col: '10,14,38' }; }
  if (h >= 5 && h < 7) { const k = (h - 5) / 2; return { a: .74 * (1 - k), tint: k > .3 ? 'rgba(255,170,110,' + (.1 * k) + ')' : null, col: '8,12,34' }; }
  return { a: .74, tint: null, col: '8,12,34' };
}
function render(now) {
  const z = cam.z * dpr; ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0d1422'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(z, 0, 0, z, cv.width / 2 - cam.x * z, cv.height / 2 - cam.y * z);
  groundDraw(z);
  const vx0 = cam.x - cv.width / 2 / z - 120, vx1 = cam.x + cv.width / 2 / z + 120, vy0 = cam.y - cv.height / 2 / z - 300, vy1 = cam.y + cv.height / 2 / z + 140;
  const vis = (sx, sy) => sx > vx0 && sx < vx1 && sy > vy0 && sy < vy1;
  const list = [];
  // buildings between you and the camera fade so you can always see yourself (and others near you)
  const [pix, piy] = iso(P.x, P.y), pd = P.x + P.y;
  let fresh = 0; SPR.forEach((s) => { if (s.bx + s.bw > vx0 && s.bx < vx1 && s.by + s.bh > vy0 && s.by < vy1) { if (!s.canvas) { if (fresh > 6) return; fresh++; } spriteOf(s);
    const b = s.b, near = !ATTRACT && s.depth > pd && P.x < b.x + b.w + 2.5 && P.y < b.y + b.d + 2.5 && P.x > b.x - 3 && P.y > b.y - 3,
      cover = !ATTRACT && s.depth > pd && pix > s.x + 6 && pix < s.x + s.canvas.width - 6 && piy - 30 > s.y + 10 && piy - 6 < s.y + s.canvas.height;
    const target = near || cover ? .3 : 1; s.al = s.al == null ? 1 : s.al + (target - s.al) * .18;
    list.push({ d: s.depth, f: () => { if (s.al < .98) { ctx.globalAlpha = s.al; ctx.drawImage(s.canvas, s.x, s.y); ctx.globalAlpha = 1; } else ctx.drawImage(s.canvas, s.x, s.y); } }); } });
  W.props.forEach((p) => { const [sx, sy] = iso(p.x, p.y); if (vis(sx, sy)) list.push({ d: p.x + p.y, f: p.t === 'furn' ? () => { const fade = p.wall && !p.front && p.x > P.x - .3 && p.y > P.y - .3 && (p.x + p.y) - (P.x + P.y) < 4.5; if (fade) ctx.globalAlpha = .28; drawFurn(ctx, p, sx, sy, now, W.wallCol); ctx.globalAlpha = 1; } : () => drawProp(ctx, p, sx, sy, now, NIGHT) }); });
  if (inside) { W.staff.forEach((st) => { list.push({ d: st.x + st.y, f: () => { staffDraw(ctx, st, now); if (st.npc) { const [sx, sy] = iso(st.x, st.y); if (Math.hypot(st.x - P.x, st.y - P.y) < 6) label(sx, sy - 48, st.npc.icon + ' ' + st.npc.name, '#fde68a'); if (!talkedNow[st.npc.id]) bubble(sx, sy - 66, '💬', '#fde68a', now); } } }); }); W.visitors.forEach((v) => { list.push({ d: v.x + v.y, f: () => visitorDraw(ctx, v, now) }); }); }
  else { doorMarks(list, vis, now); regsDraw(list, vis, now); }
  // locked gates get a barricade
  W.gates.forEach((g) => { const [sx, sy] = iso(g.x + .5, g.y + 1); if (!vis(sx, sy)) return; const open = S.unlocked.includes(g.to); list.push({ d: g.x + g.y + 1.5, f: () => gateArt(sx, sy, open, g, now) }); });
  peds.forEach((p) => { const [sx, sy] = iso(p.x, p.y); if (vis(sx, sy)) list.push({ d: p.x + p.y, f: () => person(ctx, sx, sy, p, now) }); });
  citizens.forEach((p) => { const [sx, sy] = iso(p.x, p.y); if (vis(sx, sy)) list.push({ d: p.x + p.y, f: () => { person(ctx, sx, sy, p, now); bubble(sx, sy - 46, '?', '#f5b800', now); } }); });
  traffic.forEach((c) => { const off = laneOff(c), [sx, sy] = iso(c.x + off[0], c.y + off[1]); if (vis(sx, sy)) list.push({ d: c.x + c.y, f: () => car(ctx, sx, sy, c.dir, c.color, false, now, NIGHT, 1) }); });
  if (pcar && !P.inCar) { const [sx, sy] = iso(pcar.x, pcar.y); list.push({ d: pcar.x + pcar.y, f: () => { vehicle(ctx, sx, sy, pcar.dir, U().ride, now, NIGHT, false); if (Math.hypot(pcar.x - P.x, pcar.y - P.y) < 5) label(sx, sy - 40, 'Your ' + U().ride.label.toLowerCase(), '#f5b800'); } }); }
  if (pboat && !P.boat) { const [sx, sy] = iso(pboat.x, pboat.y); list.push({ d: pboat.x + pboat.y, f: () => { vehicle(ctx, sx, sy, pboat.dir, { kind: 'boat' }, now, NIGHT, false); if (Math.hypot(pboat.x - P.x, pboat.y - P.y) < 6) label(sx, sy - 30, 'Patrol boat', '#7dd3fc'); } }); }
  if (S.unit === 'k9' && !P.inCar && !P.boat) { const [sx, sy] = iso(K9.x, K9.y); list.push({ d: K9.x + K9.y, f: () => dog(ctx, sx, sy, K9.face, K9.moving, now) }); }
  Object.keys(others).forEach((k) => { const o = others[k]; if ((o.n == null ? -1 : o.n) !== (inside ? inside.idx : -1)) return; const [sx, sy] = iso(o.rx, o.ry); if (!vis(sx, sy)) return; list.push({ d: o.rx + o.ry, f: () => { const ou = unitOf(o.u); if (o.v) vehicle(ctx, sx, sy, o.d || 0, o.v === 2 ? { kind: 'boat' } : ou.ride, now, NIGHT, o.st === 'call'); else { person(ctx, sx, sy, { kit: kitWith(kitOf((String(o.f || '').split(',').find((t) => /^o(std|pt|unit)$/.test(t)) || 'ostd').slice(1), o.u), o.f ? looks(String(o.f).split(',')) : {}), moving: o.moving, face: 1, skin: o.skin, s: 1 }, now); if (o.u === 'k9') dog(ctx, sx - 14, sy + 6, 1, o.moving, now); { const tk = String(o.f || 'ostd').split(','), of = (tk.find((t) => /^o(std|pt|unit)$/.test(t)) || 'ostd').slice(1); flair(Object.assign({}, outfitLook(of), looks(tk)), sx, sy, now, 1); } } label(sx, sy - (o.v ? 40 : 50), ou.icon + ' ' + o.c + (o.sh && o.sh !== S.shift ? ' · ' + ({ day: 'Day', mid: 'Mid', night: 'Night' }[o.sh] || '') : ''), '#9cc3ff'); if (o.say && performance.now() - o.sayAt < 7000) speech(sx, sy - (o.v ? 52 : 68), o.say.length > 34 ? o.say.slice(0, 32) + '…' : o.say); else if (o.q && now - o.qAt < 6000) speech(sx, sy - (o.v ? 52 : 68), QUICK[o.q.k] || ''); } }); });
  if (!ATTRACT) { const [sx, sy] = iso(P.x, P.y); list.push({ d: P.x + P.y, f: () => { if (P.boat) vehicle(ctx, sx, sy, P.dir, { kind: 'boat' }, now, NIGHT, call && call.accepted); else if (P.inCar) vehicle(ctx, sx, sy, P.dir, U().ride, now, NIGHT, call && call.accepted); else person(ctx, sx, sy, { kit: kitWith(myKit(), myLooks()), moving: P.moving, face: P.face, skin: S.skin || '#c68e63', s: 1.08 }, now); } }); }
  liveDraw(list, vis, now); if (!ATTRACT) storyCast(list, vis, now);
  ambienceGround();
  list.sort((a, b) => a.d - b.d).forEach((e) => e.f());
  ambienceWorld(now);
  // player ghost outline so you never lose yourself behind a building
  { const [sx, sy] = iso(P.x, P.y); ctx.globalAlpha = .35; ctx.strokeStyle = '#f5b800'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(sx, sy, 13, 6.5, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
  if (P.path.length) { const [tx, ty] = P.path[P.path.length - 1], [sx, sy] = iso(tx, ty); ctx.strokeStyle = 'rgba(245,184,0,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(sx, sy, 10 + Math.sin(now / 150) * 2, 5, 0, 0, Math.PI * 2); ctx.stroke(); }
  // lighting
  const dk = darkness();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (dk.tint) { ctx.fillStyle = dk.tint; ctx.globalCompositeOperation = 'multiply'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalCompositeOperation = 'source-over'; }
  if (dk.a > 0.02) {
    const s = .5; if (lc.width !== Math.ceil(cv.width * s)) { lc.width = Math.ceil(cv.width * s); lc.height = Math.ceil(cv.height * s); }
    lx.setTransform(1, 0, 0, 1, 0, 0); lx.globalCompositeOperation = 'source-over'; lx.clearRect(0, 0, lc.width, lc.height);
    lx.fillStyle = 'rgba(' + (dk.col || '10,14,38') + ',' + dk.a + ')'; lx.fillRect(0, 0, lc.width, lc.height);
    lx.globalCompositeOperation = 'destination-out';
    const toS = (ix, iy) => [(cv.width / 2 + (ix - cam.x) * z) * s, (cv.height / 2 + (iy - cam.y) * z) * s];
    const hole = (ix, iy, r, k) => { const [x, y] = toS(ix, iy), rr = r * z * s; if (x < -rr || y < -rr || x > lc.width + rr || y > lc.height + rr) return; const gr = lx.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(0,0,0,' + k + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); lx.fillStyle = gr; lx.beginPath(); lx.arc(x, y, rr, 0, Math.PI * 2); lx.fill(); };
    W.props.forEach((p) => { if (p.t === 'lamp') { const [ix, iy] = iso(p.x, p.y); hole(ix + 10, iy - 6, 92, .85); } if (p.t === 'canopy') { const [ix, iy] = iso(p.x, p.y); hole(ix, iy, 110, .9); } if (p.t === 'mast') { const [ix, iy] = iso(p.x, p.y); hole(ix, iy - 200, 16, .9); } });
    SPR.forEach((sp) => { if (sp.canvas) sp.lights.forEach((q) => hole(q[0], q[1], 34, .55)); }); trimSprites();
    traffic.forEach((c) => { const off = laneOff(c), [ix, iy] = iso(c.x + off[0], c.y + off[1]), f = [[1, .5], [-1, .5], [-1, -.5], [1, -.5]][c.dir]; hole(ix + f[0] * 34, iy + f[1] * 34, 56, .7); });
    { const [ix, iy] = iso(P.x, P.y); hole(ix, iy - 10, (P.inCar || P.boat ? 120 : 96) * BUFF.light * (1 + gp('light') / 100), .8); }
    Object.keys(others).forEach((k) => { const o = others[k], [ix, iy] = iso(o.rx, o.ry); hole(ix, iy - 10, 70, .6); });
    const marks = markerPoints(); marks.forEach((m) => hole(m[0], m[1], 50, .7));
    FX.events.forEach((e) => { const [ix, iy] = iso(e.x, e.y); hole(ix, iy - 10, 70, .7); });
    ctx.drawImage(lc, 0, 0, cv.width, cv.height);
    // additive glows
    ctx.globalCompositeOperation = 'lighter';
    const glow = (ix, iy, r, col) => { const x = cv.width / 2 + (ix - cam.x) * z, y = cv.height / 2 + (iy - cam.y) * z, rr = r * z; if (x < -rr || y < -rr || x > cv.width + rr || y > cv.height + rr) return; const gr = ctx.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill(); };
    W.props.forEach((p) => { if (p.t === 'lamp') { const [ix, iy] = iso(p.x, p.y); glow(ix + 10, iy - 37, 18, 'rgba(255,220,150,.55)'); glow(ix + 10, iy - 37, 46, 'rgba(255,200,120,.12)'); } });
    ambienceGlow(glow, now);
    const bar = (x, y, on) => { const ph = Math.floor(now / 180) % 2; glow(x, y - 22, 46, on ? (ph ? 'rgba(255,40,40,.45)' : 'rgba(40,90,255,.45)') : 'rgba(0,0,0,0)'); };
    if ((P.inCar || P.boat) && call && call.accepted) { const [ix, iy] = iso(P.x, P.y); bar(ix, iy, true); }
    Object.keys(others).forEach((k) => { const o = others[k]; if (o.v && o.st === 'call') { const [ix, iy] = iso(o.rx, o.ry); bar(ix, iy, true); } });
    ctx.globalCompositeOperation = 'source-over';
  }
  grade(); rainDraw();
  // markers drawn above the lighting so they stay readable
  ctx.setTransform(z, 0, 0, z, cv.width / 2 - cam.x * z, cv.height / 2 - cam.y * z);
  if (!ATTRACT) { storyMarker(now); floatsDraw(now); if (SELF_SAY.text && performance.now() - SELF_SAY.at < 6000) { const [sx, sy] = iso(P.x, P.y); speech(sx, sy - (P.inCar ? 52 : 70), SELF_SAY.text.length > 34 ? SELF_SAY.text.slice(0, 32) + '…' : SELF_SAY.text); } }
  if (call) { const [sx, sy] = iso(call.x, call.y); ring(sx, sy, call.prio === 1 ? '#ff4d4d' : '#f5b800', now); bubble(sx, sy - 40, '📻', call.prio === 1 ? '#ff4d4d' : '#f5b800', now); label(sx, sy - 66, call.title, '#ffffff'); }
  infos.forEach((i) => { const [sx, sy] = iso(i.x, i.y); bubble(sx, sy - 30, 'i', i.cool > 0 ? '#6b7280' : '#3b82f6', now); });
  observes.forEach((o) => { if (!o.seen) return; const [sx, sy] = iso(o.x, o.y); ring(sx, sy, '#a855f7', now); bubble(sx, sy - 30, '!', '#a855f7', now); });
  Object.keys(others).forEach((k) => { const o = others[k]; if (o.b && o.b.t && N0() - o.b.t < 180000) { const [sx, sy] = iso(o.b.x, o.b.y); ring(sx, sy, '#3b82f6', now); bubble(sx, sy - 40, '🚓', '#3b82f6', now); label(sx, sy - 66, 'Backup: ' + o.c, '#9cc3ff'); } });
  drawMini();
}
const N0 = () => (net ? net.now() : Date.now());
function laneOff(c) { return [[0, .22], [-.22, 0], [0, -.22], [.22, 0]][c.dir] || [0, 0]; }
function markerPoints() { const m = []; if (call) m.push(iso(call.x, call.y)); infos.forEach((i) => m.push(iso(i.x, i.y))); observes.forEach((o) => o.seen && m.push(iso(o.x, o.y))); citizens.forEach((c) => m.push(iso(c.x, c.y))); return m; }
function ring(sx, sy, col, now) { const k = (now % 1400) / 1400; ctx.strokeStyle = col; ctx.globalAlpha = 1 - k; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(sx, sy, 12 + k * 26, (12 + k * 26) / 2, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
function bubble(sx, sy, txt, col, now) { const b = Math.sin(now / 260) * 3; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(sx, sy + b, 11, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx - 5, sy + b + 8); ctx.lineTo(sx + 5, sy + b + 8); ctx.lineTo(sx, sy + b + 15); ctx.fill(); ctx.fillStyle = col === '#f5b800' ? '#0b1630' : '#fff'; ctx.font = '800 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, sx, sy + b + 1); }
function label(sx, sy, txt, col) { ctx.font = '700 11px system-ui,sans-serif'; const w = ctx.measureText(txt).width + 12; ctx.fillStyle = 'rgba(8,14,28,.82)'; ctx.beginPath(); ctx.roundRect(sx - w / 2, sy - 9, w, 18, 9); ctx.fill(); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, sx, sy); }
function speech(sx, sy, txt) { ctx.font = '800 12px system-ui,sans-serif'; const w = ctx.measureText(txt).width + 16; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(sx - w / 2, sy - 11, w, 22, 8); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx - 4, sy + 10); ctx.lineTo(sx + 4, sy + 10); ctx.lineTo(sx, sy + 16); ctx.fill(); ctx.fillStyle = '#0b1630'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, sx, sy); }
function gateArt(sx, sy, open, g, now) {
  if (open) { label(sx, sy - 30, '→ ' + DISTRICTS[g.to].name, '#86efac'); return; }
  for (let k = -1; k <= 1; k++) { const x = sx + k * 18, y = sy + k * 9; ctx.fillStyle = '#f2f2f2'; ctx.fillRect(x - 12, y - 16, 24, 6); ctx.fillStyle = '#e2742b'; for (let s = 0; s < 4; s++) ctx.fillRect(x - 12 + s * 6, y - 16, 3, 6); ctx.fillStyle = '#555'; ctx.fillRect(x - 10, y - 10, 2, 10); ctx.fillRect(x + 8, y - 10, 2, 10); }
  ctx.fillStyle = Math.floor(now / 500) % 2 ? '#ff9f1a' : '#7a4a0a'; ctx.beginPath(); ctx.arc(sx, sy - 24, 3, 0, Math.PI * 2); ctx.fill();
  label(sx, sy - 40, '🔒 ' + DISTRICTS[g.to].name, '#fca5a5');
}
// minimap
function drawMini() {
  const m = $('mini'); if (!m) return; const g = m.getContext('2d'), s = m.width / N;
  if (!m.base || m.w !== W) { const b = document.createElement('canvas'); b.width = m.width; b.height = m.height; const bg = b.getContext('2d'); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = W.at(x, y); if (!v) continue; bg.fillStyle = v === T.ROAD ? '#515866' : v === T.BLDG ? '#9aa3b0' : v === T.WATER ? '#2d6c97' : v === T.GRASS ? '#3f6b2f' : v === T.LOT ? '#3a3f47' : '#7a756b'; bg.fillRect(x * s, y * s, s + .5, s + .5); } m.base = b; m.w = W; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, m.width, m.height);
  const Z = inside ? 1 : 2.8; g.save(); g.translate(m.width / 2, m.height / 2); g.rotate(Math.PI / 4); g.scale(.72 * Z, .72 * Z); if (inside) g.translate(-m.width / 2, -m.height / 2); else g.translate(-P.x * s, -P.y * s); g.drawImage(m.base, 0, 0);
  const dot = (x, y, c, r) => { g.fillStyle = c; g.beginPath(); g.arc(x * s, y * s, r / Z, 0, Math.PI * 2); g.fill(); };
  if (call) dot(call.x, call.y, call.prio === 1 ? '#ff4d4d' : '#f5b800', 5);
  Object.keys(others).forEach((k) => dot(others[k].rx, others[k].ry, '#60a5fa', 3.2));
  infos.forEach((i) => dot(i.x, i.y, '#3b82f6', 2.5)); citizens.forEach((c) => dot(c.x, c.y, '#f5b800', 2.2));
  if (!inside) { if (!fogC || fogC.did !== W.did) { fogC = document.createElement('canvas'); fogC.width = m.width; fogC.height = m.height; fogC.did = W.did; const fg = fogC.getContext('2d'); fg.fillStyle = 'rgba(6,10,20,.84)'; fg.fillRect(0, 0, m.width, m.height); const str = S.explored[exKey()] || ''; for (let i = 0; i < N * N; i++) if (str[i] === '1') fg.clearRect((i % N) * s, Math.floor(i / N) * s, s + .6, s + .6); } g.drawImage(fogC, 0, 0); W.secrets.forEach((x) => { if (S.found[x.id]) dot(x.x, x.y, '#a78bfa', 3); }); regs.forEach((r) => { if ((S.npc || {})[r.n.id]) dot(r.x, r.y, '#fde68a', 2.6); }); }
  { const t = stepTarget(); if (t && !t.exit) { g.fillStyle = '#f5b800'; g.beginPath(); const q = 1 / Z; g.moveTo(t.x * s, t.y * s - 6 * q); g.lineTo(t.x * s + 5 * q, t.y * s); g.lineTo(t.x * s, t.y * s + 6 * q); g.lineTo(t.x * s - 5 * q, t.y * s); g.closePath(); g.fill(); } }
  dot(P.x, P.y, '#ffffff', 4.2); dot(P.x, P.y, '#f5b800', 2.6);
  g.restore();
}

// ---------- exploration, street life, weather and loot ----------
// what changes each shift: weather, birds, a food truck, a street musician, road work, the freight train, boats
let inside = null;
let FX = { rain: false, drops: [], birds: [], events: [], train: null, trainT: 40, sail: null, caches: [], disc: {} };
const BUFF = { speedTo: -1, light: 1, wait: 0 };
const exKey = () => 'd' + W.did;
let fogC = null, exCount = 0, exTotal = 1;
function exploreInit() {
  S.explored = S.explored || {}; S.found = S.found || {}; S.disc = S.disc || {}; S.mile = S.mile || {}; S.items = S.items || {};
  let str = S.explored[exKey()] || ''; if (str.length !== N * N) str = '0'.repeat(N * N); S.explored[exKey()] = str;
  exTotal = 0; exCount = 0; for (let i = 0; i < N * N; i++) { const v = W.g[i]; if (v !== T.WATER) { exTotal++; if (str[i] === '1') exCount++; } }
  fogC = null;
}
function revealAround(cx, cy, r) {
  if (inside) return;
  let str = S.explored[exKey()], changed = false; const a = str.split('');
  for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) { if (x < 0 || y < 0 || x >= N || y >= N) continue; const i = y * N + x; if (a[i] === '1' || Math.hypot(x + .5 - cx, y + .5 - cy) > r) continue; a[i] = '1'; changed = true; if (W.g[i] !== T.WATER) exCount++; if (fogC) fogC.getContext('2d').clearRect(x * fogC.width / N, y * fogC.height / N, fogC.width / N + .6, fogC.height / N + .6); }
  if (!changed) return; S.explored[exKey()] = a.join('');
  const pct = Math.floor(exCount / exTotal * 100), done = S.mile[exKey()] || 0; $('hExp').textContent = 'Explored ' + pct + '%';
  const next = [25, 50, 75, 100].find((m) => m > done && pct >= m);
  if (next) { S.mile[exKey()] = next; L.saveState(S); banner('🧭', 'Explorer · ' + next + '% of ' + W.D.name, next === 100 ? 'Every street walked. The district knows your name.' : 'Keep wandering. There is more out there.'); queueLoot('Exploration reward: ' + next + '%', 1, next === 100 ? 'r' : next >= 50 ? 'u' : 'c'); }
}
function liveInit() {
  const h = hourNow(), night = isNight(h), R2 = Math.random;
  FX = { rain: R2() < .25, drops: [], birds: [], events: [], train: null, trainT: 25 + R2() * 30, sail: null, caches: [], disc: {} };
  BUFF.speedTo = -1; BUFF.speedMul = 0; BUFF.light = 1; BUFF.wait = 0;
  if (FX.rain) setTimeout(() => radio('Dispatch', 'All units, rain moving through ' + W.D.name + '. Drive careful.'), 2500);
  // birds on open ground, scattering when you get close
  const open = W.quiet.length ? W.quiet : W.walk;
  if (!night) for (let f = 0; f < 4; f++) { const c = open[Math.floor(R2() * open.length)]; for (let i = 0; i < 4 + Math.floor(R2() * 4); i++) FX.birds.push({ x: c[0] + R2() * 1.5, y: c[1] + R2() * 1.5, h: 0, vx: 0, vy: 0, vh: 0, ph: R2() * 9, fly: false }); }
  // street life: two or three things going on this shift
  const ev = ['music', 'truck', 'work'].sort(() => R2() - .5).slice(0, night ? 2 : 3);
  ev.forEach((k) => {
    if (k === 'music') { const c = (W.promenade ? [W.promenade.x + 1, W.promenade.y + 6] : open[Math.floor(R2() * open.length)]); FX.events.push({ k, x: c[0] + .5, y: c[1] + .5, tipped: false }); }
    if (k === 'truck') { const lots = W.parking.length ? W.parking : W.walk, c = lots[Math.floor(R2() * lots.length)]; FX.events.push({ k, x: c[0] + .5, y: c[1] + .5, name: ['Taco Tactics', 'Blue Line BBQ', 'The Donut Patrol', 'Code 4 Coffee', 'Miranda\'s Empanadas'][Math.floor(R2() * 5)] }); }
    if (k === 'work') { const roads = []; for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) if (W.at(x, y) === T.ROAD && W.at(x, y - 1) === T.ROAD && W.at(x, y + 1) === T.ROAD && W.at(x - 1, y) !== T.ROAD) roads.push([x, y]); const c = roads[Math.floor(R2() * roads.length)]; if (c) { FX.events.push({ k, x: c[0] + .5, y: c[1] + .5 }); for (let dy = -1; dy <= 1; dy++) W.blocked.add((c[1] + dy) * N + c[0]); setTimeout(() => radio('Dispatch', 'Heads up: road work has a lane closed in ' + W.D.name + '. Watch for cones.'), 6000); } }
  });
  if (W.river) FX.sail = { x: 40.5, y: 6, dir: 1 };
  // lost & found: three sparkles hidden on quiet ground this shift
  for (let i = 0; i < 3; i++) { const c = open[Math.floor(R2() * open.length)]; if (Math.hypot(c[0] - P.x, c[1] - P.y) > 8) FX.caches.push({ x: c[0] + .5, y: c[1] + .5 }); }
}
function liveUpdate(dt) {
  revealAround(P.x, P.y, (P.inCar || P.boat ? 6.5 : 5.5) + gp('explore'));
  // first look at a landmark, the promenade or a secret spot
  W.lots.forEach((l) => { if (!l.name) return; const k = W.did + ':' + l.name; if (S.disc[k] || Math.hypot(l.door[0] - P.x, l.door[1] - P.y) > 4.5) return; S.disc[k] = 1; if (l.gen) { L.saveState(S); ord('place'); FLOATS.push({ x: P.x, y: P.y, t: performance.now(), text: l.name, sub: 'new place' }); return; } L.saveState(S); ord('place'); banner('📍', 'Discovered: ' + l.name, (LANDMARKS[l.kind] || {}).note || W.D.name); award(10, 'new place'); });
  if (W.promenade) { const k = W.did + ':prom'; if (!S.disc[k] && Math.hypot(W.promenade.x + 1 - P.x, W.promenade.y + 4 - P.y) < 4) { S.disc[k] = 1; L.saveState(S); banner('📍', 'Discovered: ' + W.promenade.name, 'Walk only. No cars, all vibes.'); award(10, 'new place'); } }
  W.secrets.forEach((x) => { if (S.found[x.id] || P.inCar || Math.hypot(x.x - P.x, x.y - P.y) > 1.9 + gp('secret') * .5) return; S.found[x.id] = 1; L.saveState(S); ord('secret'); banner('🗝️', 'Secret spot: ' + x.name, x.text, true); beep(784, .1, 'triangle', .05); beep(1175, .2, 'triangle', .05, .12); queueLoot('Secret spot: ' + x.name, 1, hasSk('inv4') ? 'r' : 'u'); });
  // birds
  FX.birds.forEach((b) => { const d = Math.hypot(b.x - P.x, b.y - P.y); if (!b.fly && d < (P.inCar ? 3.5 : 2.2)) { b.fly = true; b.vx = (b.x - P.x) / (d || 1) * 3 + (Math.random() - .5); b.vy = (b.y - P.y) / (d || 1) * 3 + (Math.random() - .5); b.vh = 40 + Math.random() * 20; if (Math.random() < .2) beep(2200 + Math.random() * 600, .04, 'sine', .015); } if (b.fly) { b.x += b.vx * dt; b.y += b.vy * dt; b.h += b.vh * dt; } });
  FX.birds = FX.birds.filter((b) => b.h < 260);
  // freight train in Industrial Park
  if (W.railY != null) {
    if (!FX.train) { FX.trainT -= dt; if (FX.trainT <= 0) { FX.train = { x: -10, cars: 7, sp: 6 }; radio('Dispatch', 'Freight train coming through the Industrial Park crossings.'); } }
    else { FX.train.x += FX.train.sp * dt; if (FX.train.x - FX.train.cars * 2.2 > N + 4) { FX.train = null; FX.trainT = 60 + Math.random() * 60; } }
    const tx = FX.train ? FX.train.x : -99; W.props.forEach((p) => { if (p.t === 'xing') { const on = !!FX.train && p.x > tx - FX.train.cars * 2.2 - 3 && p.x < tx + 9; if (on && !p.on && Math.hypot(p.x - P.x, p.y - P.y) < 10) { beep(880, .12, 'square', .02); } p.on = on; } });
  }
  if (FX.sail) { FX.sail.y += FX.sail.dir * dt * .5; if (FX.sail.y > N - 4 || FX.sail.y < 3) FX.sail.dir *= -1; }
  if (FX.rain) { for (let i = 0; i < 6; i++) FX.drops.push({ x: Math.random(), y: -.05, v: .9 + Math.random() * .5 }); FX.drops.forEach((d) => { d.y += d.v * dt; d.x -= .12 * dt; }); FX.drops = FX.drops.filter((d) => d.y < 1.05); }
}
function liveDraw(list, vis, now) {
  FX.birds.forEach((b) => { const [sx, sy] = iso(b.x, b.y); if (!vis(sx, sy)) return; list.push({ d: b.x + b.y + (b.fly ? 50 : 0), f: () => bird(sx, sy - b.h, b, now) }); });
  FX.events.forEach((e) => { const [sx, sy] = iso(e.x, e.y); if (!vis(sx, sy)) return;
    if (e.k === 'music') list.push({ d: e.x + e.y, f: () => { person(ctx, sx, sy, { shirt: '#6d28d9', pants: '#1f2937', hair: '#1a1a1a', skin: '#a26a42', ph: 0 }, now); ctx.fillStyle = '#8b5a2b'; ctx.save(); ctx.translate(sx + 4, sy - 18); ctx.rotate(-.5); ctx.fillRect(-8, -2, 16, 4); ctx.beginPath(); ctx.ellipse(-8, 0, 5, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); ctx.font = '14px system-ui'; ctx.textAlign = 'center'; const k = (now / 900) % 1; ctx.globalAlpha = 1 - k; ctx.fillText('♪', sx + 10 + k * 8, sy - 44 - k * 22); ctx.globalAlpha = 1 - ((k + .5) % 1); ctx.fillText('♫', sx - 6 - ((k + .5) % 1) * 6, sy - 44 - ((k + .5) % 1) * 22); ctx.globalAlpha = 1; } });
    if (e.k === 'truck') list.push({ d: e.x + e.y, f: () => { vehicle(ctx, sx, sy, 1, { kind: 'van', body: '#f5b800', side: '#e6a800', stripe: '#d22d3d', scale: 1.3, text: 'FOOD' }, now, NIGHT, false); for (let k = 0; k < 3; k++) person(ctx, sx - 22 + k * 10, sy + 16 + k * 3, { shirt: SHIRT[(k * 3) % SHIRT.length], pants: '#2c3e50', hair: HAIR[k], skin: SKIN[k + 1], ph: k }, now); label(sx, sy - 46, e.name, '#ffd34d'); } });
    if (e.k === 'work') list.push({ d: e.x + e.y, f: () => { [[-1, -.4], [-1, .4], [1, -.4], [1, .4]].forEach(([a, b]) => { const [cx, cy] = iso(e.x + b * .6, e.y + a * 1.3); drawProp(ctx, { t: 'cone' }, cx, cy, now, NIGHT); }); person(ctx, sx, sy, { kit: { shirt: '#ff6b1a', pants: '#1f2937', hat: 'helmet', hatCol: '#f5d000', vest: '#d4ff3a', vestText: '' }, skin: '#c68e63', moving: false }, now); } });
  });
  if (FX.train) { for (let k = 0; k < FX.train.cars; k++) { const x = FX.train.x - k * 2.2; if (x < -3 || x > N + 3) continue; const [sx, sy] = iso(x, W.railY + .5); if (!vis(sx, sy)) continue; list.push({ d: x + W.railY + 1, f: () => drawProp(ctx, { t: 'boxcar', x, y: W.railY + .5, color: k === 0 ? '#f5b800' : ['#8b3a2a', '#2f5d7a', '#556b2f', '#7a6a55'][k % 4] }, sx, sy, now, NIGHT) }); } }
  if (FX.sail) { const [sx, sy] = iso(FX.sail.x, FX.sail.y); if (vis(sx, sy)) list.push({ d: FX.sail.x + FX.sail.y, f: () => sailboat(sx, sy, now) }); }
  FX.caches.forEach((c) => { if (!c.shown && Math.hypot(c.x - P.x, c.y - P.y) > spotR() + 1.5) return; const [sx, sy] = iso(c.x, c.y); list.push({ d: c.x + c.y, f: () => sparkle(sx, sy - 6, now, '#ffe27a') }); });
  W.secrets.forEach((x) => { const [sx, sy] = iso(x.x, x.y); if (!vis(sx, sy)) return; if (S.found[x.id]) list.push({ d: x.x + x.y, f: () => { ctx.font = '16px system-ui'; ctx.textAlign = 'center'; ctx.fillText('🗝️', sx, sy - 6); } }); else if (x.shown || Math.hypot(x.x - P.x, x.y - P.y) < 4 + gp('secret')) list.push({ d: x.x + x.y, f: () => sparkle(sx, sy - 6, now, '#c4b5fd') }); });
  if (!P.inCar && !P.boat) { const lk = myLooks(); if (Object.keys(lk).length) { const [sx, sy] = iso(P.x, P.y); list.push({ d: P.x + P.y + .01, f: () => flair(lk, sx, sy, now, 1.08) }); } }
}
function bird(sx, sy, b, now) { const fl = b.fly ? Math.sin(now / 50 + b.ph) * 3 : 0; if (!b.fly) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(sx, sy + 1, 3, 1.2, 0, 0, Math.PI * 2); ctx.fill(); } ctx.fillStyle = '#6b7280'; ctx.beginPath(); ctx.ellipse(sx, sy - 3 - (b.fly ? 0 : Math.abs(Math.sin(now / 400 + b.ph)) * 1.2), 3, 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx - 5, sy - 4 - fl); ctx.lineTo(sx, sy - 3); ctx.lineTo(sx + 5, sy - 4 - fl); ctx.stroke(); }
function sailboat(sx, sy, now) { const b = Math.sin(now / 500) * 1.5; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(sx, sy + 2, 16, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f2f2f2'; ctx.beginPath(); ctx.moveTo(sx - 14, sy - 4 + b); ctx.lineTo(sx + 14, sy - 4 + b); ctx.lineTo(sx + 9, sy + 2 + b); ctx.lineTo(sx - 10, sy + 2 + b); ctx.fill(); ctx.fillStyle = '#7a4a2a'; ctx.fillRect(sx - 1, sy - 34 + b, 2, 30); ctx.fillStyle = '#fff7e6'; ctx.beginPath(); ctx.moveTo(sx + 1, sy - 34 + b); ctx.lineTo(sx + 15, sy - 8 + b); ctx.lineTo(sx + 1, sy - 8 + b); ctx.fill(); ctx.fillStyle = '#e84a5f'; ctx.beginPath(); ctx.moveTo(sx - 1, sy - 30 + b); ctx.lineTo(sx - 12, sy - 9 + b); ctx.lineTo(sx - 1, sy - 9 + b); ctx.fill(); }
function sparkle(sx, sy, now, col) { const k = (Math.sin(now / 220) + 1) / 2, r = 5 + k * 5; ctx.save(); ctx.translate(sx, sy); ctx.rotate(now / 1200); ctx.fillStyle = col; ctx.globalAlpha = .55 + k * .45; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .3 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
const outfitLook = (o) => (OUTFITS[o] && OUTFITS[o].look) || {};
const myLooks = () => Object.assign({}, outfitLook(S.outfit), looks(Object.values(S.gear || {})));
const kitOf = (outfit, unitId) => { const o = OUTFITS[outfit || 'std']; return o && o.kit ? o.kit : unitOf(unitId).kit; };
const myKit = () => kitOf(S.outfit, S.unit);
const myTokens = () => ['o' + (S.outfit || 'std')].concat(Object.values(S.gear || {})).join(',');
// gear that changes how you look: hats swap the kit's cover; the rest is drawn on top
function kitWith(kit, L) { if (!L.hat && !L.boots && !L.camelbak) return kit; const k = Object.assign({}, kit); if (L.hat && !(k.shorts)) { k.hat = L.hat; k.hatCol = L.hatCol; } if (L.boots) k.boots = L.boots; if (L.camelbak) k.camelbak = true; return k; }
function flair(L, sx, sy, now, s) {
  if (L.twinkle && !L.shine) { const k = ((now + sx * 37) % 3200) / 3200; if (k < .14) { const a = k / .14, r = (1 - Math.abs(a * 2 - 1)) * 5 * s; ctx.save(); ctx.translate(sx + (a < .5 ? -3 : 3) * s, sy - 1); ctx.fillStyle = '#ffffff'; ctx.globalAlpha = .95; ctx.beginPath(); for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? r * .25 : r; ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); } }
  if (L.shine) for (let k = 0; k < L.shine; k++) { const a = now / 300 + k * 2.1; sparkle(sx + Math.cos(a) * 7 * s, sy - 2 + Math.sin(a * 1.3) * 2, now + k * 200, '#ffffff'); }
  if (L.vest) { ctx.fillStyle = 'rgba(214,255,58,.9)'; ctx.beginPath(); ctx.roundRect(sx - 9 * s, sy - 25 * s, 18 * s, 16 * s, 3 * s); ctx.fill(); ctx.fillStyle = '#c0c0c0'; ctx.fillRect(sx - 9 * s, sy - 17 * s, 18 * s, 2 * s); }
  if (L.cord) { ctx.strokeStyle = L.cord; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(sx - 6 * s, sy - 23 * s); ctx.quadraticCurveTo(sx - 9 * s, sy - 17 * s, sx - 5 * s, sy - 15 * s); ctx.stroke(); }
  if (L.poncho) { ctx.fillStyle = 'rgba(77,94,58,.92)'; ctx.beginPath(); ctx.moveTo(sx, sy - 27 * s); ctx.lineTo(sx + 10 * s, sy - 9 * s); ctx.lineTo(sx - 10 * s, sy - 9 * s); ctx.closePath(); ctx.fill(); }
  if (L.brass) sparkle(sx + 3 * s, sy - 21 * s, now, '#ffe27a');
  if (L.glow) { ctx.fillStyle = 'rgba(245,184,0,' + (.25 + Math.sin(now / 300) * .15) + ')'; ctx.beginPath(); ctx.ellipse(sx, sy - 34 * s, 10 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill(); }
  if (L.clipboard) { ctx.fillStyle = '#8b5a2b'; ctx.fillRect(sx + 6 * s, sy - 20 * s, 7 * s, 9 * s); ctx.fillStyle = '#fff'; ctx.fillRect(sx + 7 * s, sy - 18 * s, 5 * s, 6 * s); ctx.fillStyle = '#9ca3af'; ctx.fillRect(sx + 8 * s, sy - 21 * s, 3 * s, 2 * s); }
}
function rainDraw() { if (!FX.rain) return; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(30,40,60,.18)'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.strokeStyle = 'rgba(190,210,235,.45)'; ctx.lineWidth = 1.2 * dpr; ctx.beginPath(); FX.drops.forEach((d) => { const x = d.x * cv.width, y = d.y * cv.height; ctx.moveTo(x, y); ctx.lineTo(x - 4 * dpr, y + 14 * dpr); }); ctx.stroke(); }
// a top-of-screen banner for discoveries
let bannerT = 0;
function banner(icon, title, sub, secret) { const el = $('banner'); el.className = 'banner' + (secret ? ' secret' : ''); el.innerHTML = '<span>' + icon + '</span><div><b>' + esc(title) + '</b><small>' + esc(sub || '') + '</small></div>'; el.hidden = false; clearTimeout(bannerT); bannerT = setTimeout(() => el.hidden = true, 4200); }
// loot: queued so a reveal never lands on top of a question
const lootQ = [];
function queueLoot(where, chance, min) { if (Math.random() > Math.min(1, chance * (1 + gp('loot') / 100) + (chance < 1 ? gp('loot') / 200 : 0))) return; lootQ.push([where, min]); setTimeout(runLoot, 400); }
let looting = false;
async function runLoot() {
  if (looting || !lootQ.length) return; if (scene || !$('modal').hidden) { setTimeout(runLoot, 600); return; }
  looting = true; const [where, min] = lootQ.shift(), item = roll(S, min), isNew = !S.items[item.id];
  S.items[item.id] = (S.items[item.id] || 0) + 1; L.saveState(S); paused = true;
  const act = await reveal(item, where, { isNew, canEquip: item.slot && slotOpen(item.slot) && (S.gear || {})[item.slot] !== item.id, lockHint: item.slot && !slotOpen(item.slot) ? 'Goes in your ' + slotOf(item.slot).name + ' slot. ' + slotOf(item.slot).hint + '.' : '', sound: (notes) => { if (!S.sound) return; notes.forEach((f, i) => beep(f, .22 + (i === notes.length - 1 ? .4 : 0), 'triangle', .05, i * .09)); } });
  paused = false; looting = false; useItem(item, act); if (lootQ.length) setTimeout(runLoot, 500);
}
const slotOpen = (sid) => S.xp >= slotOf(sid).need;
function equip(item) {
  S.gear = S.gear || {}; const sl = item.slot; if (!slotOpen(sl)) { toast(slotOf(sl).name + ' slot: ' + slotOf(sl).hint + '.'); return; }
  const was = S.gear[sl]; if (was === item.id) { delete S.gear[sl]; toast('Took off: ' + item.name + '.'); } else { S.gear[sl] = item.id; toast('Equipped: ' + item.name + (was ? ' (swapped out ' + itemById(was).name + ')' : '') + '.'); }
  refreshGear(); L.saveState(S); hud(); if (net && net.flair) net.flair(myTokens());
}
function useItem(item, act) {
  if (act === 'equip') equip(item);
  if (act === 'use') {
    if (!item.reuse) { S.items[item.id]--; if (S.items[item.id] <= 0) delete S.items[item.id]; }
    if (item.effect === 'shake') { BUFF.speedTo = clock + 180; BUFF.speedMul = 1.25; } if (item.effect === 'energy') { BUFF.speedTo = clock + 120; BUFF.speedMul = 1.4; } if (item.effect === 'coffee' || item.effect === 'pot') BUFF.wait += 60; if (item.effect === 'light') BUFF.light = 1.5;
    L.saveState(S); toast(item.useText || 'Used.');
  }
}
let lockerTab = 'equip';
function locker() {
  const tabs = '<div class="lkTabs"><button type="button" data-t="equip" class="' + (lockerTab === 'equip' ? 'on' : '') + '">Equipment</button><button type="button" data-t="skills" class="' + (lockerTab === 'skills' ? 'on' : '') + '">Skills</button><button type="button" data-t="all" class="' + (lockerTab === 'all' ? 'on' : '') + '">Collection</button></div>';
  openModal('<div class="sceneHead"><b>YOUR LOCKER</b><h2>' + (lockerTab === 'equip' ? 'Gear up, ' + esc(S.cs) : lockerTab === 'skills' ? 'Training' : 'Everything you have found') + '</h2><p>' + (lockerTab === 'equip' ? 'Five slots, one item each. Duty Belt opens at Squad Leader 3 and Pocket & Carry at Guide.' : 'Five ranks, from Standard Issue to Academy Legend.') + '</p></div>' + tabs +
    (lockerTab === 'equip' ? equipHTML(S, S.xp, ST(), U().st) : lockerTab === 'skills' ? skillsHTML() : collectionHTML(S)) + '<div class="qAct"><button type="button" class="ghost" id="mClose">Close</button></div>');
  $('mClose').onclick = closeModal;
  document.querySelectorAll('.lkTabs [data-t]').forEach((b) => b.onclick = () => { lockerTab = b.dataset.t; locker(); });
  document.querySelectorAll('[data-sk]').forEach((b) => b.onclick = () => { learn(b.dataset.sk); locker(); });
  document.querySelectorAll('.lkItem[data-i]').forEach((b) => b.onclick = () => itemCard(itemById(b.dataset.i)));
  document.querySelectorAll('.eqSlot[data-slot]').forEach((b) => b.onclick = () => slotPick(b.dataset.slot));
  document.querySelectorAll('[data-of]').forEach((b) => b.onclick = () => { S.outfit = b.dataset.of; refreshGear(); L.saveState(S); hud(); if (net && net.flair) net.flair(myTokens()); locker(); });
}
function itemCard(it) {
  const on = Object.values(S.gear || {}).includes(it.id);
  openModal(itemCardHTML(it, S) + '<div class="qAct">' + (it.kind === 'use' ? '<button type="button" id="lkUse">Use it</button>' : it.kind === 'gear' ? '<button type="button" id="lkEq"' + (slotOpen(it.slot) ? '' : ' disabled') + '>' + (on ? 'Take it off' : slotOpen(it.slot) ? 'Equip' : slotOf(it.slot).hint) + '</button>' : '') + '<button type="button" class="ghost" id="lkBack">Back</button></div>');
  $('lkBack').onclick = locker; if ($('lkUse')) $('lkUse').onclick = () => { closeModal(); useItem(it, 'use'); }; if ($('lkEq')) $('lkEq').onclick = () => { equip(it); locker(); };
}
function slotPick(sid) {
  const sl = slotOf(sid), have = ITEMS.filter((x) => x.slot === sid && (S.items || {})[x.id]), cur = (S.gear || {})[sid];
  openModal('<div class="sceneHead"><b>' + sl.icon + ' ' + sl.name.toUpperCase() + ' SLOT</b><h2>Pick one</h2><p>' + esc(sl.hint) + '. Swapping is free.</p></div>' +
    (have.length ? '<div class="pickList">' + have.map((x) => '<button type="button" class="pickRow' + (x.id === cur ? ' on' : '') + '" data-i="' + x.id + '" style="--rc:' + RARITY[x.r].color + '"><span>' + x.icon + '</span><div><b>' + esc(x.name) + '</b><small>Rank ' + RARITY[x.r].short + ' · ' + Object.keys(x.perk).map((k) => esc(({ res: 'Response', per: 'Perception', rap: 'Rapport', com: 'Composure', tac: 'Tactics' })[k] ? (x.perk[k] > 0 ? '+' : '') + x.perk[k] + ' ' + ({ res: 'Response', per: 'Perception', rap: 'Rapport', com: 'Composure', tac: 'Tactics' })[k] : k)).join(', ') + '</small></div>' + (x.id === cur ? '<i>ON</i>' : '') + '</button>').join('') + '</div>' : '<p class="lkSum">Nothing for this slot yet. Keep patrolling: gear turns up on calls, inside buildings and in lost & found.</p>') +
    '<div class="qAct">' + (cur ? '<button type="button" class="ghost" id="spOff">Take off ' + esc(itemById(cur).name) + '</button>' : '') + '<button type="button" class="ghost" id="lkBack">Back</button></div>');
  $('lkBack').onclick = locker; if ($('spOff')) $('spOff').onclick = () => { equip(itemById(cur)); locker(); };
  document.querySelectorAll('.pickRow').forEach((b) => b.onclick = () => itemCard(itemById(b.dataset.i)));
}

// ---------- the regulars ----------
// where each one hangs out: a piece of their place's name, or a lot kind
const NPC_AT = { delgado: 'Founders Plaza', pruitt: 'Founders Park', dot: 'Night Owl', marcus: 'Bayfront', okafor: 'Library', kevin: 'Meridian', rosa: "Rosa's", earl: 'Earl', reyes: 'Iron Will', kim: 'Spin City', ruth: 'Maple Court', dez: 'Community', hal: 'Marina', bobby: 'Hook', johnson: 'Riverside School', miguel: 'Church', sam: 'firestation', gus: 'Riverside Park', gerald: 'Coastline', rusty: "Rusty's", dee: 'Truck Stop', carl: 'Lock-It', lupe: 'Lunch Pail', moore: 'courthouse', barnes: 'Barnes', ray: 'Freedom', hattie: 'Clerk', ramos: 'sallyport', exhibita: 'Justice Plaza' };
let regs = [], talkedNow = {};
function placeRegulars() {
  regs.forEach((r) => W.blocked.delete(Math.floor(r.y) * N + Math.floor(r.x))); regs = []; talkedNow = {}; S.npc = S.npc || {};
  const used = new Set(NPCS.map((n) => n.name)), byLot = new Map(), lotOf = (n) => { const at = NPC_AT[n.id] || n.home; return W.lots.find((l) => (l.name || '').indexOf(at) >= 0) || W.lots.find((l) => l.kind === at) || W.lots.find((l) => l.kind === n.home); };
  NPCS.filter((n) => n.d === W.did).forEach((n) => { const l = lotOf(n); if (l) { if (!byLot.has(l)) byLot.set(l, []); byLot.get(l).push(n); } });
  // every named place gets at least two named people; one of them may work inside
  W.lots.forEach((l) => {
    const hand = byLot.get(l) || [], need = Math.max(0, 2 - hand.length), info = (LANDMARKS[l.kind] || {}).info;
    const gen = need ? peopleFor(W.did, l, need, used, W.D.lessons, info) : [];
    l.staffNpcs = ENTER[l.kind] ? gen.filter((g) => g.inside) : [];
    hand.concat(gen.filter((g) => !l.staffNpcs.includes(g))).forEach((n) => putOutside(n, l));
  });
}
function putOutside(n, lot) {
  const used = (x, y) => regs.some((r) => Math.floor(r.x) === x && Math.floor(r.y) === y);
  const open = lot.kind === 'park' || lot.kind === 'plaza' || lot.kind === 'parking' || lot.kind === 'lot' || lot.kind === 'railyard' || lot.kind === 'stadium';
  const cand = []; if (open) { for (let y = lot.oy + 1; y <= lot.oy + 8; y++) for (let x = lot.ox + 1; x <= lot.ox + 8; x++) if (W.walkable(x, y) && W.at(x, y) !== T.ROAD && !used(x, y)) cand.push([x, y]); }
  if (!cand.length) { const d = lot.door; for (let dy = 0; dy <= 1; dy++) for (let dx = -3; dx <= 3; dx++) { const x = d[0] + dx, y = d[1] + dy; if (W.walkable(x, y) && W.at(x, y) !== T.ROAD && !used(x, y)) cand.push([x, y]); } }
  const c = cand.length ? cand[Math.floor(Math.random() * cand.length)] : lot.door;
  regs.push({ n, x: c[0] + .5, y: c[1] + .5, face: Math.random() < .5 ? 1 : -1, ph: Math.random() * 9, lot }); W.blocked.add(c[1] * N + c[0]);
}
function npcKit(L) { return { shirt: L.shirt, pants: L.pants, hat: L.cap ? 'cap' : L.hard ? 'helmet' : 'none', hatCol: L.cap || '#f5d000', vest: L.vest ? '#d4ff3a' : L.apron || null, vestText: '', tie: L.tie, plain: !!L.tie, patch: L.badge ? '#f5b800' : L.collar ? '#ffffff' : null }; }
function cat(sx, sy, now) { const t = Math.sin(now / 600) * 3; ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(sx, sy + 1, 7, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.ellipse(sx, sy - 5, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(sx + 6, sy - 10, 4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx + 3, sy - 13); ctx.lineTo(sx + 4, sy - 17); ctx.lineTo(sx + 6, sy - 13); ctx.moveTo(sx + 7, sy - 13); ctx.lineTo(sx + 9, sy - 17); ctx.lineTo(sx + 9.5, sy - 12); ctx.fill(); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx - 6, sy - 6); ctx.quadraticCurveTo(sx - 12, sy - 10 + t, sx - 10, sy - 16 + t); ctx.stroke(); ctx.fillStyle = '#111'; ctx.fillRect(sx + 6, sy - 11, 1.2, 1.2); ctx.fillRect(sx + 8, sy - 11, 1.2, 1.2); }
function regsDraw(list, vis, now) {
  regs.forEach((r) => { const [sx, sy] = iso(r.x, r.y); if (!vis(sx, sy)) return; const near = Math.hypot(r.x - P.x, r.y - P.y);
    list.push({ d: r.x + r.y, f: () => {
      if (r.n.cat) cat(sx, sy, now); else { const lk = r.n.look || {}; person(ctx, sx, sy, { kit: r.n.kit || npcKit(lk), hair: r.n.hair || lk.hair, skin: r.n.skin || lk.skin, moving: false, face: r.face, ph: r.ph }, now); if (r.n.glasses || lk.glasses) { ctx.fillStyle = '#111'; ctx.fillRect(sx - 4, sy - 29, 8, 1.2); } }
      if (near < 5.5) label(sx, sy - (r.n.cat ? 26 : 48), r.n.icon + ' ' + r.n.name, '#fde68a');
      if (!talkedNow[r.n.id] && near < 10) bubble(sx, sy - (r.n.cat ? 42 : 66), '💬', '#fde68a', now);
    } });
  });
}
const hearts = (f) => '<span class="hearts">' + [1, 2, 3, 4, 5, 6].map((k) => '<i class="' + (k <= f ? 'on' : '') + '">★</i>').join('') + '</span>';
function npcTalk(r) {
  const n = r.n, f = S.npc[n.id] || 0, first = !talkedNow[n.id]; talkedNow[n.id] = talkedNow[n.id] || 1;
  const line = n.lines[(f + (S.calls || 0)) % n.lines.length];
  const tier = f >= 6 ? 'Best friends' : f >= 3 ? 'Friend' : f >= 1 ? 'Knows your name' : 'Stranger';
  openModal('<div class="npcHead"><span class="npcIco">' + n.icon + '</span><div><b>' + esc(n.name) + '</b><small>' + esc(n.role) + (n.gen ? '' : ' · ' + esc(W.D.name)) + '</small>' + hearts(f) + '<em>' + tier + '</em></div></div><p class="npcLine">' + esc(line) + '</p>' +
    '<div class="qAct">' + (talkedNow[n.id] === 2 ? '' : '<button type="button" id="npHelp">' + (n.cat ? 'Earn its respect' : 'Help ' + esc(n.name.split(' ')[0]) + ' out') + '</button>') + '<button type="button" class="ghost" id="npBye">' + (n.cat ? 'Back away slowly' : 'Talk later') + '</button></div>');
  if (first) award(2, 'small talk');
  $('npBye').onclick = closeModal;
  if ($('npHelp')) $('npHelp').onclick = () => {
    const les = W.D.lessons.indexOf(n.help) >= 0 ? n.help : rnd(W.D.lessons), qs = L.pick(S, [les], 'q', 1);
    runQuestions('<div class="npcHead small"><span class="npcIco">' + n.icon + '</span><div><b>' + esc(n.name) + ' has a question</b><small>' + (n.cat ? 'The cat waits. Answer correctly.' : 'Get it right and they will remember you.') + '</small></div></div>', qs, (res) => {
      talkedNow[n.id] = 2;
      if (res.right) { ord('regular');
        const nf = Math.min(6, f + 1); S.npc[n.id] = nf; L.saveState(S);
        closeModal(); award(Math.round(15 * rapMult() * (1 + gp('rpCit') / 100)), n.name + ' remembers that');
        if (nf === 3 && f < 3) { banner(n.icon, n.name + ' is your friend now', 'They have something for you.'); queueLoot('A gift from ' + n.name, 1, 'u'); }
        else if (nf === 6 && f < 6) { banner(n.icon, 'Best friends with ' + n.name, 'They saved the good stuff for you.'); queueLoot('A gift from ' + n.name, 1, 'e'); }
      } else { closeModal(); toast(n.cat ? 'The cat looks unimpressed and licks a paw.' : '"No worries, cadet. Look it up and come back tomorrow."'); award(3, 'gave it a shot'); }
    });
  };
}

// ---------- going inside buildings ----------
function doorSpot(l) { if (l.bld) return [l.bld.x + l.bld.w / 2, l.bld.y + l.bld.d + .05]; const b = W.buildings.find((b2) => b2.x >= l.ox && b2.x <= l.ox + 8 && b2.y >= l.oy && b2.y <= l.oy + 8); if (!b) return [l.door[0] + .5, l.door[1] - .2]; return [b.x + b.w / 2, b.y + b.d + .05]; }
function doorMarks(list, vis, now) {
  if (P.inCar || P.boat) return;
  W.lots.forEach((l) => { if (!ENTER[l.kind]) return; const [dx, dy] = doorSpot(l); if (Math.hypot(dx - P.x, dy - P.y) > 7) return; const [sx, sy] = iso(dx, dy); if (!vis(sx, sy)) return; list.push({ d: dx + dy + 2, f: () => { const k = (Math.sin(now / 300) + 1) / 2; ctx.fillStyle = 'rgba(245,184,0,' + (.25 + k * .25) + ')'; ctx.beginPath(); ctx.ellipse(sx, sy, 16, 8, 0, 0, Math.PI * 2); ctx.fill(); bubble(sx, sy - 26, '🚪', '#f5b800', now); } }); });
}
function enterBuilding(l) {
  if (inside || P.inCar || P.boat) return;
  const idx = W.lots.indexOf(l), I = buildInterior(l, W, idx);
  inside = { idx, lot: l, O: { W, G, SPR, peds, traffic, citizens, infos, observes, FX, pcar, pboat, NIGHT, x: P.x, y: P.y } };
  W = I; G = I.ground; SPR = []; peds = []; traffic = []; pcar = null; pboat = null;
  citizens = I.citz.map((c) => Object.assign(newCitizen(), { x: c[0], y: c[1], les: rnd(I.D.lessons) }));
  const lmLes = (LANDMARKS[l.kind] || {}).info, inLes = lmLes != null && I.D.lessons.indexOf(lmLes) >= 0 ? lmLes : rnd(I.D.lessons);
  infos = I.infos.map((p) => ({ x: p[0], y: p[1], les: inLes, name: I.name, kind: 'in-' + l.kind, cool: 0 }));
  const obsLes = /warehouse|storage|lumber/.test(l.kind) ? 17 : /jail|sallyport/.test(l.kind) ? 20 : null;
  observes = I.obs.map((p) => { const les = obsLes != null && I.D.lessons.indexOf(obsLes) >= 0 ? obsLes : rnd(I.D.lessons); const o = rnd(OBSERVE[les] || [['Something looks out of place', 'door']]); return { x: p[0], y: p[1], les, text: o[0], kind: o[1], seen: false }; });
  FX = { rain: false, drops: [], birds: [], events: [], train: null, trainT: 1e9, sail: null, caches: I.caches.filter(() => Math.random() < .6), disc: {} };
  (l.staffNpcs || []).forEach((n, k) => { const st = I.staff[k]; if (st) { st.npc = n; st.kit = n.kit; st.skin = n.skin; } else { const c = I.walk[Math.floor(I.walk.length / 2)]; I.staff.push({ x: c[0] + .5, y: c[1] + .5, kit: n.kit, skin: n.skin, npc: n }); I.blocked.add(c[1] * N + c[0]); } });
  P.x = I.spawn[0]; P.y = I.spawn[1]; P.path = []; K9.x = P.x - .6; K9.y = P.y; cam.free = false;
  const [ix, iy] = iso(P.x, P.y); cam.x = ix; cam.y = iy;
  $('hDist').textContent = I.name; $('hExp').textContent = 'Inside'; beep(330, .08, 'triangle', .04); beep(440, .1, 'triangle', .04, .08);
  banner('🚪', I.name, I.blurb); ord('inside'); if (net && net.inside) net.inside(idx);
  const k = W.did + ':in:' + l.kind; if (!S.disc[k]) { S.disc[k] = 1; L.saveState(S); award(10, 'new place'); }
}
function exitBuilding() {
  if (!inside) return; const O = inside.O, l = inside.lot;
  W = O.W; G = O.G; SPR = O.SPR; peds = O.peds; traffic = O.traffic; citizens = O.citizens; infos = O.infos; observes = O.observes; FX = O.FX; pcar = O.pcar; pboat = O.pboat;
  inside = null; const [dx, dy] = doorSpot(l); P.x = dx; P.y = dy + .8; P.path = []; K9.x = P.x - .6; K9.y = P.y; cam.free = false; buildSprites();
  $('hDist').textContent = W.D.name; $('hExp').textContent = 'Explored ' + Math.floor(exCount / exTotal * 100) + '%'; beep(440, .08, 'triangle', .04); beep(330, .1, 'triangle', .04, .08);
  if (net && net.inside) net.inside(-1);
}

// ---------- story campaign ----------
// one chapter per district; each step is a place to go and a scene that plays there, inside the world
S.story = S.story || {}; S.lore = S.lore || {}; S.found = S.found || {}; S.disc = S.disc || {}; S.explored = S.explored || {}; S.mile = S.mile || {}; S.items = S.items || {}; S.npc = S.npc || {};
const chap = () => CHAPTERS.find((c) => c.d === W.did);
const chStep = () => { const c = chap(); if (!c) return null; const i = S.story[c.d] || 0; return i < c.steps.length ? c.steps[i] : null; };
function stepLot(st) { if (!st) return null; const outW = inside ? inside.O.W : W; return outW.lots.find((l) => (l.name || '').indexOf(st.at) >= 0) || outW.lots.find((l) => l.kind === st.at.toLowerCase()); }
// where the waypoint is, in the current map's coordinates
function stepTarget() {
  const st = chStep(); if (!st) return null; const lot = stepLot(st); if (!lot) return null;
  if (inside) { if (st.inside && inside.lot === lot) { const c = storyCharSpot(); return { x: c[0], y: c[1], here: true }; } return { x: W.door[0], y: W.door[1], exit: true }; }
  if (st.npc && !st.inside) { const r = regs.find((x) => x.n.id === st.npc); if (r) return { x: r.x, y: r.y + .9, lot }; }
  const [dx, dy] = doorSpot(lot); return { x: dx, y: dy + .6, lot, door: st.inside };
}
function storyCharSpot() { const w = W.walk, sp = W.spawn; let best = w[0], bd = 1e9; w.forEach((t) => { const d = Math.abs(Math.hypot(t[0] - sp[0], t[1] - sp[1]) - 3.2); if (d < bd && !W.blocked.has(t[1] * N + t[0])) { bd = d; best = t; } }); return [best[0] + .5, best[1] + .5]; }
let storyBusy = false, storyCool = 0;
function storyUpdate(dt) {
  storyCool -= dt; if (storyBusy || scene || storyCool > 0 || !$('modal').hidden) return;
  const st = chStep(), t = stepTarget(); if (!st || !t) return;
  if (t.exit || t.door) return; // walk to the door; the scene starts once inside
  if (Math.hypot(t.x - P.x, t.y - P.y) < (t.here ? 1.9 : 2.4)) playStep(st);
}
// a scene: letterboxed dialogue over the live world, then questions framed by the scene, then the wrap-up
S.flags = S.flags || {};
const condOk = (l) => { const c = l[2]; if (!c || typeof c !== 'object') return true; if (c.if && !S.flags[c.if]) return false; if (c.unless && S.flags[c.unless]) return false; return true; };
// choices change the world: a flag remembered for later scenes, community trust, and how the regulars see you
let LASTCHOICE = null;
function applyChoice(o) {
  LASTCHOICE = o;
  if (o.set) S.flags[o.set] = Date.now();
  if (o.trust) { S.trust[W.did] = Math.max(0, Math.min(100, (S.trust[W.did] == null ? 50 : S.trust[W.did]) + o.trust * 4 * (o.trust > 0 && hasSk('com2') ? 1.5 : 1))); }
  if (o.npc) Object.keys(o.npc).forEach((id) => { S.npc[id] = Math.max(0, Math.min(6, (S.npc[id] || 0) + o.npc[id])); });
  L.saveState(S);
}
function dialogue(lines, done) {
  const box = $('dlg'); let seq = lines.slice(), i = -1, typing = null, full = '';
  const who = (id) => CAST[id] || NPCS.find((n) => n.id === id) || { name: id, icon: '💬', role: '' };
  const next = () => { do { i++; } while (i < seq.length && !condOk(seq[i])); if (i < seq.length) show(); else end(); };
  const show = () => {
    const ln = seq[i];
    if (ln[0] === 'choice') {
      const opts = ln[1];
      box.innerHTML = '<div class="dlgBar top"></div><div class="dlgBar bot"></div><div class="dlgPanel dlgChoice"><div class="dlgTxt"><b>Your call</b><small>What do you do?</small><div class="dlgOpts">' + opts.map((o, k) => '<button type="button" data-k="' + k + '">' + esc(o.t) + '</button>').join('') + '</div></div></div>';
      box.hidden = false; requestAnimationFrame(() => box.classList.add('on')); box.onclick = null;
      box.querySelectorAll('[data-k]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); const o = opts[+b.dataset.k]; applyChoice(o); beep(660, .08, 'triangle', .04); seq.splice(i + 1, 0, ...(o.reply || [])); box.onclick = click; next(); });
      return;
    }
    const [id, text] = ln, c = who(id), radio = /^\(over the radio\)/.test(text); full = text.replace(/^\(over the radio\)\s*/, '');
    box.innerHTML = '<div class="dlgBar top"></div><div class="dlgBar bot"></div><div class="dlgPanel"><div class="dlgPort' + (radio ? ' radio' : '') + '"><span>' + (radio ? '📻' : c.icon) + '</span></div><div class="dlgTxt"><b>' + esc(c.name) + (radio ? ' <em>on the radio</em>' : '') + '</b><small>' + esc(c.role || '') + '</small><p id="dlgP"></p></div><i class="dlgNext">▸</i></div>';
    box.hidden = false; requestAnimationFrame(() => box.classList.add('on'));
    let k = 0; const el = $('dlgP'); clearInterval(typing); typing = setInterval(() => { k += 2; el.textContent = full.slice(0, k); if (k >= full.length) { clearInterval(typing); typing = null; } }, 22);
    if (radio) chirp(); else if (S.sound) beep(520 + (id.length * 37) % 300, .05, 'triangle', .025);
  };
  document.body.classList.add('cine');
  const end = () => { document.body.classList.remove('cine'); box.classList.remove('on'); setTimeout(() => { if (!box.classList.contains('on')) { box.hidden = true; box.innerHTML = ''; } }, 250); box.onclick = null; done && done(); };
  const click = () => { if (typing) { clearInterval(typing); typing = null; $('dlgP').textContent = full; return; } next(); };
  box.onclick = click;
  next();
}
function playStep(st) {
  storyBusy = true; paused = true; P.path = [];
  const c = chap(), idx = S.story[c.d] || 0, last = idx === c.steps.length - 1;
  const finish = () => {
    S.story[c.d] = idx + 1; L.saveState(S); ord('story'); storyBusy = false; paused = false; storyCool = 2;
    if (last) chapterDone(c); else { const nx = chStep(); if (nx) objectiveFlash(nx.goal); }
  };
  const afterQuiz = () => { if (st.after) dialogue(st.after, finish); else finish(); };
  dialogue(st.say || [], () => {
    if (!st.quiz) return afterQuiz();
    paused = false; const qs = L.pick(S, [W.D.lessons.indexOf(st.quiz.les) >= 0 ? st.quiz.les : rnd(W.D.lessons)], 'q', st.quiz.n || 2), w = CAST[st.who] || NPCS.find((n) => n.id === st.who) || {};
    runQuestions('<div class="npcHead small"><span class="npcIco">' + (w.icon || '🎖️') + '</span><div><b>' + esc(c.title) + '</b><small>' + esc(st.goal) + '</small></div></div>', qs, (r) => {
      closeModal(); paused = true; award(r.right * 20, 'story');
      if (r.right < Math.ceil(qs.length / 2)) { dialogue([[st.who || 'castillo', r.right ? 'Close, but not by the book yet. Think it through and try me again.' : 'Not quite. Review it, then come back and we will run it again.']], () => { storyBusy = false; paused = false; storyCool = 4; }); return; }
      afterQuiz();
    });
  });
}
function chapterDone(c) {
  const rw = c.steps[c.steps.length - 1].reward || {}; S.lore['ch' + c.d] = 1; L.saveState(S);
  openModal('<div class="chEnd"><span class="chKick">Chapter ' + (c.d + 1) + ' complete</span><h2>' + esc(c.title) + '</h2><p>' + esc(c.sub) + '</p><div class="chStamp">CASE NOTES FILED</div>' +
    '<p class="chNext">' + (c.d < 4 ? 'Next: Chapter ' + (c.d + 2) + ', ' + esc(CHAPTERS[c.d + 1].title) + '. It opens when ' + esc(DISTRICTS[c.d + 1].name) + ' does.' : 'The story is complete. Port Meridian is yours to keep patrolling.') + '</p><p class="chLore">New entries in your Field Journal · +1 skill point</p></div><div class="qAct"><button type="button" id="mDone">Back to patrol</button></div>');
  good(); setTimeout(() => beep(1047, .3, 'triangle', .05), 200);
  $('mDone').onclick = () => { closeModal(); if (rw.rp) award(rw.rp, 'chapter complete'); if (rw.loot) queueLoot('Chapter ' + (c.d + 1) + ': ' + c.title, 1, rw.loot); };
}
function objectiveFlash(text) { const el = $('objBar'); if (!el) return; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
function objectiveHud() {
  const el = $('objBar'), st = chStep(), t = stepTarget();
  if (!st || !t || scene) { el.hidden = true; return; }
  const d = Math.hypot(t.x - P.x, t.y - P.y), [tx, ty] = iso(t.x, t.y), [px, py] = iso(P.x, P.y), ang = Math.atan2(ty - py, tx - px);
  const txt = t.exit ? 'Head outside: ' + st.goal : st.goal;
  if (el.dataset.t !== txt) { el.dataset.t = txt; el.innerHTML = '<i class="objArr">➤</i><span><small>' + esc(chap().title) + '</small><b>' + esc(txt) + '</b></span><em id="objD"></em>'; }
  el.hidden = false; el.querySelector('.objArr').style.transform = 'rotate(' + ang + 'rad)'; $('objD').textContent = d < 2.5 ? 'here' : Math.round(d * 4) * 5 + ' ft';
}
function storyMarker(now) {
  const t = stepTarget(); if (!t || t.exit) return;
  const [sx, sy] = iso(t.x, t.y), b = Math.sin(now / 300) * 4;
  ctx.fillStyle = 'rgba(245,184,0,.18)'; ctx.beginPath(); ctx.moveTo(sx - 8, sy); ctx.lineTo(sx - 3, sy - 120); ctx.lineTo(sx + 3, sy - 120); ctx.lineTo(sx + 8, sy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f5b800'; ctx.beginPath(); ctx.moveTo(sx, sy - 62 + b); ctx.lineTo(sx + 9, sy - 74 + b); ctx.lineTo(sx, sy - 86 + b); ctx.lineTo(sx - 9, sy - 74 + b); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
}
// story characters stand where their scene happens
function storyCast(list, vis, now) {
  const st = chStep(); if (!st || !CAST[st.who] || st.npc) return; const t = stepTarget(); if (!t || t.exit || t.door) return;
  if (!inside && st.inside) return; const c = CAST[st.who];
  const x = inside ? t.x : t.x + .8, y = inside ? t.y : t.y - .2, [sx, sy] = iso(x, y);
  if (!vis(sx, sy)) return;
  list.push({ d: x + y, f: () => { person(ctx, sx, sy, { kit: c.look, skin: c.skin, hair: '#1a1a1a', moving: false, face: -1, s: 1.04 }, now); label(sx, sy - 50, c.icon + ' ' + c.name, '#f5b800'); } });
}
function unlockLore() { let n = 0; LORE.forEach((e) => { if (S.lore[e.id]) return; const w = e.when; if (w === 'start' || (w[0] === 'd' && S.unlocked.includes(+w.slice(1))) || (w.slice(0, 2) === 'ch' && S.lore[w])) { S.lore[e.id] = 1; n++; } }); if (n) L.saveState(S); return n; }
let jTab = 'story';
function journal() {
  unlockLore();
  const tabs = '<div class="lkTabs"><button type="button" data-j="map" class="' + (jTab === 'map' ? 'on' : '') + '">Districts</button><button type="button" data-j="story" class="' + (jTab === 'story' ? 'on' : '') + '">Story</button><button type="button" data-j="cast" class="' + (jTab === 'cast' ? 'on' : '') + '">People</button><button type="button" data-j="lore" class="' + (jTab === 'lore' ? 'on' : '') + '">Lore</button></div>';
  if (jTab === 'map') return districtBoard(tabs);
  let body = '';
  if (jTab === 'story') body = CHAPTERS.map((c) => { const i = S.story[c.d] || 0, done = i >= c.steps.length, open = S.unlocked.includes(c.d); return '<div class="jCh' + (done ? ' done' : '') + (open ? '' : ' locked') + '"><div class="jChH"><span>Chapter ' + (c.d + 1) + '</span><b>' + (open ? esc(c.title) : '🔒 Locked') + '</b><small>' + esc(c.sub) + '</small></div><div class="jSteps">' + c.steps.map((st, k) => '<i class="' + (k < i ? 'ok' : k === i && open ? 'cur' : '') + '" title="' + esc(st.goal) + '"></i>').join('') + '</div>' + (open && !done ? '<p>Now: ' + esc(c.steps[i].goal) + '</p>' : done ? '<p>Case closed.</p>' : '<p>Opens with ' + esc(DISTRICTS[c.d].name) + '.</p>') + '</div>'; }).join('');
  if (jTab === 'cast') { const met = (id) => Object.keys(CAST).indexOf(id) >= 0 ? CHAPTERS.some((c) => c.steps.slice(0, S.story[c.d] || 0).some((st) => st.who === id || (st.say || []).some((l) => l[0] === id))) : false; body = Object.keys(CAST).map((id) => { const c = CAST[id], m = met(id); return '<div class="jP' + (m ? '' : ' unk') + '"><span>' + (m ? c.icon : '❔') + '</span><div><b>' + (m ? esc(c.name) : 'Not met yet') + '</b><small>' + (m ? esc(c.role) : '') + '</small>' + (m ? '<p>' + esc(c.bio) + '</p>' : '') + '</div></div>'; }).join('') + '<p class="lkSum">Regulars you have befriended: ' + Object.keys(S.npc || {}).filter((k) => S.npc[k] > 0).length + '</p>'; }
  if (jTab === 'lore') body = LORE.map((e) => S.lore[e.id] ? '<details class="jLore"><summary>' + esc(e.title) + '</summary><p>' + esc(e.text) + '</p></details>' : '<div class="jLore unk">??? <small>Keep patrolling to uncover this.</small></div>').join('');
  openModal('<div class="sceneHead"><b>FIELD JOURNAL · ' + esc(WORLD.city.toUpperCase()) + '</b><h2>' + ({ story: 'The Gray Sedan', cast: 'The people you know', lore: 'Port Meridian' })[jTab] + '</h2><p>' + esc(S.cs) + ' · ' + esc(unitName(U())) + '</p></div>' + tabs + '<div class="jBody">' + body + '</div><div class="qAct"><button type="button" class="ghost" id="mClose">Close</button></div>');
  $('mClose').onclick = closeModal; document.querySelectorAll('[data-j]').forEach((b) => b.onclick = () => { jTab = b.dataset.j; journal(); });
}

// ---------- field abilities from the skill tree ----------
let ABIL = {};
function abilitiesInit() { ABIL = {}; SKILLS.forEach((k) => { if (k.active && hasSk(k.id)) ABIL[k.active.key] = { left: k.active.uses, icon: k.active.icon, name: k.name, until: 0 }; }); abilHud(); }
function abilHud() {
  const el = $('abil'); if (!el) return; const keys = Object.keys(ABIL);
  el.hidden = !keys.length || !!inside && false; el.innerHTML = keys.map((k) => '<button type="button" data-ab="' + k + '" class="' + (ABIL[k].left ? '' : 'used') + (ABIL[k].until > clock ? ' on' : '') + '" title="' + esc(ABIL[k].name) + '"><span>' + ABIL[k].icon + '</span><em>' + ABIL[k].left + '</em></button>').join('');
  el.querySelectorAll('[data-ab]').forEach((b) => b.onclick = () => useAbility(b.dataset.ab));
}
function useAbility(k) {
  const a = ABIL[k]; if (!a || !a.left || paused) return; a.left--;
  if (k === 'summon') { for (let i = 0; i < 2; i++) { const c = newCitizen(); const near = (inside ? W.walk : W.walk).filter((t) => Math.hypot(t[0] - P.x, t[1] - P.y) < 7 && Math.hypot(t[0] - P.x, t[1] - P.y) > 2); const t = near.length ? near[Math.floor(Math.random() * near.length)] : null; if (t) { c.x = t[0] + .5; c.y = t[1] + .5; } citizens.push(c); } radio(S.cs, 'Community Policing: a couple of locals want a word.'); }
  if (k === 'code3') { a.until = clock + 180; BUFF.speedTo = Math.max(BUFF.speedTo, clock + 180); BUFF.speedMul = Math.max(BUFF.speedMul || 1, 1.35); BUFF.wait += 40; radio(S.cs, 'Code 3, lights and siren.'); if (S.sound) { beep(720, .4, 'sine', .02); beep(980, .4, 'sine', .02, .45); } }
  if (k === 'canvass') { const R2 = 13; observes.forEach((o) => { if (Math.hypot(o.x - P.x, o.y - P.y) < R2) o.seen = true; }); FX.caches.forEach((c) => { c.shown = Math.hypot(c.x - P.x, c.y - P.y) < R2; }); W.secrets.forEach((x) => { if (Math.hypot(x.x - P.x, x.y - P.y) < R2) x.shown = true; }); FX.pulse = { t: performance.now() }; radio(S.cs, 'Canvassing the area.'); beep(440, .3, 'sine', .04); }
  abilHud();
}
// tips from regulars when you are a pillar of the district
let tipT = 90;
function tipsUpdate(dt) { if (!hasSk('com4') || inside) return; tipT -= dt; if (tipT > 0) return; tipT = 120 + Math.random() * 80; const r = regs.filter((x) => (S.npc || {})[x.n.id] > 0); const c = FX.caches.find((x) => !x.shown) || null; if (!r.length) return; const who = r[Math.floor(Math.random() * r.length)].n; if (c) { c.shown = true; radio(who.name, 'Psst, cadet. Saw something shiny out on the street. Check your map.'); } else { const o = newObserve(); o.seen = true; observes.push(o); radio(who.name, 'Cadet, something doesn\'t look right near ' + esc(W.D.name) + '. Thought you should know.'); } }
// the skill tree screen
function skillsHTML() {
  const lvl = [0, 200, 600, 1200, 2000, 3000, 4200, 5600, 7200, 9000].filter((t) => S.xp >= t).length, chd = CHAPTERS.filter((c) => (S.story[c.d] || 0) >= c.steps.length).length, pts = skillPoints(S, lvl, chd);
  return '<p class="lkSum"><b class="skPts">' + pts + '</b> skill point' + (pts === 1 ? '' : 's') + ' to spend. You earn one with every promotion and every story chapter.</p><div class="skTree">' + BRANCHES.map((b) => '<div class="skCol" style="--bc:' + b.color + '"><div class="skH"><span>' + b.icon + '</span><b>' + b.name + '</b><small>' + b.blurb + '</small></div>' +
    SKILLS.filter((k) => k.b === b.id).map((k) => { const has = hasSk(k.id), can = canLearn(S, k) && pts > 0; return '<button type="button" class="skNode' + (has ? ' has' : can ? ' can' : ' no') + (k.active ? ' act' : '') + '" data-sk="' + k.id + '"' + (has || !can ? ' disabled' : '') + '><i>' + (has ? '✓' : k.tier) + '</i><span><b>' + esc(k.name) + (k.active ? ' <em>Active</em>' : '') + '</b><small>' + esc(k.text) + '</small></span></button>'; }).join('') + '</div>').join('') + '</div>';
}
function learn(id) { S.skills = S.skills || {}; S.skills[id] = Date.now(); L.saveState(S); refreshGear(); abilitiesInit(); hud(); beep(784, .12, 'triangle', .05); beep(1175, .2, 'triangle', .05, .1); }

// ---------- ambience: clouds, fireflies, steam, wet reflections, color grade ----------
let AMB = { grass: [], holes: [] };
function ambienceInit() {
  AMB = { grass: [], holes: [] }; if (!W || W.inside) return;
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const v = W.at(x, y); if (v === T.GRASS && (x * 7 + y * 13) % 5 === 0) AMB.grass.push([x + .5, y + .5, Math.random() * 9]); if (v === T.ROAD && x % 11 === 1 && y % 11 === 6) AMB.holes.push([x + .5, y + .5]); }
}
function ambienceGround() { if (inside) return; AMB.holes.forEach(([x, y]) => { const [sx, sy] = iso(x, y); ctx.fillStyle = '#2b3038'; ctx.beginPath(); ctx.ellipse(sx, sy, 9, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#4a515c'; ctx.lineWidth = 1; ctx.stroke(); }); }
function ambienceWorld(now) { // drawn in world space, after objects, before lighting
  const h = hourNow(), day = h >= 7 && h < 18;
  if (day && !inside) { // cloud shadows drifting across the city
    ctx.save(); ctx.fillStyle = 'rgba(10,20,40,.10)';
    for (let k = 0; k < 4; k++) { const t = now / 1000 * 6 + k * 700, x = ((t % 2600) - 1300) + (k % 2) * 300, y = -200 + k * 380 + Math.sin(t / 900) * 40; ctx.beginPath(); ctx.ellipse(x, y + 300, 260, 110, -.25, 0, Math.PI * 2); ctx.ellipse(x + 160, y + 330, 180, 80, -.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  if (!inside) AMB.holes.forEach(([x, y], k) => { const [sx, sy] = iso(x, y);
    if (k % 2 === 0) for (let i = 0; i < 4; i++) { const a = ((now / 2600 + i / 4 + k * .17) % 1), r = 5 + a * 12; ctx.fillStyle = 'rgba(230,236,245,' + (.22 * (1 - a)) + ')'; ctx.beginPath(); ctx.arc(sx + Math.sin(a * 6 + i) * 6, sy - a * 46, r, 0, Math.PI * 2); ctx.fill(); } });
}
function ambienceGlow(glow, now) { // additive pass at night
  const h = hourNow(), night = h >= 19.5 || h < 5.5;
  if (night && !inside) AMB.grass.forEach(([x, y, ph]) => { const t = now / 1000 + ph, fx = x + Math.sin(t * .7) * .6, fy = y + Math.cos(t * .5) * .6, [ix, iy] = iso(fx, fy), on = (Math.sin(t * 2.3) + 1) / 2; if (on > .45) glow(ix, iy - 14 - Math.sin(t) * 6, 6 + on * 4, 'rgba(210,255,120,' + (.35 * on) + ')'); });
  if (FX.rain && !inside) W.props.forEach((p) => { if (p.t !== 'lamp') return; const [ix, iy] = iso(p.x, p.y); glow(ix + 10, iy + 10, 22, 'rgba(255,214,150,.22)'); glow(ix + 10, iy + 26, 14, 'rgba(255,214,150,.14)'); });
}
function grade(dk) { // screen-space color grade by time of day
  const h = hourNow(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, cv.height);
  if (h >= 6 && h < 8.5) { g.addColorStop(0, 'rgba(255,170,120,.16)'); g.addColorStop(1, 'rgba(255,220,180,0)'); }
  else if (h >= 8.5 && h < 16.5) { g.addColorStop(0, 'rgba(255,240,210,.07)'); g.addColorStop(1, 'rgba(120,170,255,.05)'); }
  else if (h >= 16.5 && h < 19.5) { g.addColorStop(0, 'rgba(255,110,90,.16)'); g.addColorStop(1, 'rgba(255,170,90,.08)'); }
  else { g.addColorStop(0, 'rgba(40,70,160,.12)'); g.addColorStop(1, 'rgba(10,20,60,.06)'); }
  ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalCompositeOperation = 'source-over';
}

// ---------- title screen: the city at night behind the logo, then the start screen ----------
let attT = 0;
function attractStart() {
  ATTRACT = true; document.body.classList.add('attract');
  const did = S.home != null ? S.home : 0;
  W = buildDistrict(did); G = { chunks: new Map() }; buildSprites();
  peds = []; for (let i = 0; i < 18; i++) peds.push(newPed()); traffic = []; for (let i = 0; i < 10; i++) traffic.push(newCar());
  citizens = []; infos = []; observes = []; call = null; regs = [];
  FX = { rain: Math.random() < .35, drops: [], birds: [], events: [], train: null, trainT: 1e9, sail: W.river ? { x: 40.5, y: 6, dir: 1 } : null, caches: [], disc: {} };
  cam.z = innerWidth < 600 ? .8 : 1.05; attT = 0; ambienceInit();
}
function attractUpdate(dt, now) {
  attT += dt;
  const cx = N / 2 + Math.cos(attT * .045) * 13, cy = N / 2 + Math.sin(attT * .06) * 11, [ix, iy] = iso(cx, cy);
  cam.x += (ix - cam.x) * Math.min(1, dt * .8); cam.y += (iy - cam.y) * Math.min(1, dt * .8);
  { const f = focus(); peds.forEach((p, k) => { if (Math.hypot(p.x - f[0], p.y - f[1]) > 30) peds[k] = newPed(); }); traffic.forEach((c, k) => { if (Math.hypot(c.x - f[0], c.y - f[1]) > 34) traffic[k] = newCar(); }); }
  peds.forEach((p) => { if (p.wait > 0) { p.wait -= dt; p.moving = false; return; } if (!p.path.length) { const t = nearTile(W.walk, 24); const path = Math.hypot(t[0] - p.x, t[1] - p.y) < 16 ? astar(p.x, p.y, t[0], t[1], pedPass, true) : null; if (path) p.path = path; else p.wait = 1; return; } if (stepAlong(p, dt, p.sp)) p.wait = 1 + Math.random() * 4; });
  traffic.forEach((c) => { if (!c.path.length) { for (let k = 0; k < 6; k++) { const x = Math.floor(c.x + (Math.random() - .5) * 40), y = Math.floor(c.y + (Math.random() - .5) * 40); if (roadPass(x, y)) { const p = astar(c.x, c.y, x, y, roadPass, false); if (p && p.length > 3) { c.path = p; break; } } } return; } stepAlong(c, dt, c.sp); });
  if (FX.rain) { for (let i = 0; i < 6; i++) FX.drops.push({ x: Math.random(), y: -.05, v: .9 + Math.random() * .5 }); FX.drops.forEach((d) => { d.y += d.v * dt; d.x -= .12 * dt; }); FX.drops = FX.drops.filter((d) => d.y < 1.05); }
  if (FX.sail) { FX.sail.y += FX.sail.dir * dt * .5; if (FX.sail.y > N - 4 || FX.sail.y < 3) FX.sail.dir *= -1; }
}
function endAttract() { ATTRACT = false; document.body.classList.remove('attract'); music.stop(); }
// original synth theme: a slow minor progression, a pulse of bass, a soft arpeggio and a hint of hi-hat
const music = (function () {
  let timer = 0, step = 0, nextT = 0, gain = null, on = false;
  const PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function note(f, t, d, type, v, cut) { const a = audio(); const o = a.createOscillator(), g = a.createGain(), fl = a.createBiquadFilter(); o.type = type; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = cut || 2400; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + Math.min(.6, d * .3)); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(fl); fl.connect(g); g.connect(gain); o.start(t); o.stop(t + d + .05); }
  function hat(t) { const a = audio(), b = a.createBuffer(1, 2205, 44100), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); src.buffer = b; f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = .025; src.connect(f); f.connect(g); g.connect(gain); src.start(t); }
  function tick() {
    const a = audio(); if (!a) return; const spb = 60 / 84 / 2;
    while (nextT < a.currentTime + .3) {
      const bar = Math.floor(step / 16) % 4, ch = PROG[bar], s16 = step % 16;
      if (s16 === 0) { ch.forEach((m) => { note(hz(m), nextT, spb * 16, 'sawtooth', .022, 900); note(hz(m) * 1.004, nextT, spb * 16, 'sawtooth', .018, 900); }); note(hz(ch[0] - 12), nextT, spb * 15, 'sine', .07, 400); }
      if (s16 % 4 === 0) note(hz(ch[0] - 24), nextT, spb * 2.5, 'sine', .09, 300);
      if (s16 % 2 === 0) note(hz(ch[(s16 / 2) % 3] + 12 + (s16 > 7 ? 7 : 0) * 0), nextT, spb * 1.6, 'triangle', .03, 3200);
      if (s16 % 4 === 2) hat(nextT);
      nextT += spb; step++;
    }
  }
  return {
    start() { if (on || !S.sound) return; const a = audio(); if (!a) return; on = true; gain = a.createGain(); gain.gain.setValueAtTime(0, a.currentTime); gain.gain.linearRampToValueAtTime(.9, a.currentTime + 2.5); gain.connect(a.destination); nextT = a.currentTime + .1; step = 0; timer = setInterval(tick, 100); },
    stop() { if (!on) return; on = false; const a = audio(); try { gain.gain.cancelScheduledValues(a.currentTime); gain.gain.setValueAtTime(gain.gain.value, a.currentTime); gain.gain.linearRampToValueAtTime(0, a.currentTime + 1.5); } catch (e) {} const g0 = gain; setTimeout(() => { clearInterval(timer); try { g0.disconnect(); } catch (e) {} }, 1600); }
  };
})();
function titleScreen() {
  const t = $('title'); t.hidden = false;
  t.innerHTML = '<div class="tiBadge"><svg viewBox="0 0 64 72"><defs><linearGradient id="tiG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#f5b800"/><stop offset="1" stop-color="#a86f00"/></linearGradient></defs><path d="M32 3l25 9v19c0 18-11 31-25 38C18 62 7 49 7 31V12z" fill="url(#tiG)" stroke="#5c3d00" stroke-width="1.6"/><path d="M32 10l19 7v14c0 14-8 24-19 30-11-6-19-16-19-30V17z" fill="#0b1630" stroke="#ffe27a" stroke-width="1.2"/><path d="M32 17l3 6.2 6.8 1-4.9 4.8 1.2 6.8-6.1-3.2-6.1 3.2 1.2-6.8-4.9-4.8 6.8-1z" fill="#ffe27a"/><text x="32" y="52" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="800" font-size="8" fill="#ffe27a" letter-spacing="1">PMPD</text></svg></div>' +
    '<h1 class="tiLogo"><span>PATROL</span><span>CITY</span><i class="tiShine"></i></h1><div class="tiSub">' + esc(WORLD.city.toUpperCase()) + ' · FIELD IMMERSION PROGRAM</div><div class="tiClass">' + esc(WORLD.tagline.split('·')[1] || '') + ' · Chapter 5</div>' +
    '<button type="button" class="tiGo" id="tiGo">Tap to begin</button><div class="tiFoot"><button type="button" id="tiSnd">' + (S.sound ? '🔊 Sound on' : '🔇 Sound off') + '</button><span>A training simulation. Every scenario is a sim round.</span></div>';
  requestAnimationFrame(() => t.classList.add('in'));
  $('tiSnd').onclick = (e) => { e.stopPropagation(); S.sound = !S.sound; L.saveState(S); $('tiSnd').textContent = S.sound ? '🔊 Sound on' : '🔇 Sound off'; if (S.sound) music.start(); else music.stop(); };
  let started = false; const go = () => { if (started) return; started = true; audio(); music.start(); if (S.sound) { beep(392, .5, 'triangle', .05); beep(587, .7, 'triangle', .05, .15); } t.classList.add('out'); setTimeout(() => { t.hidden = true; t.classList.remove('in', 'out'); if (!S.seenIntro) coldOpen(startScreen); else startScreen(); }, 900); };
  $('tiGo').onclick = go; t.onclick = (e) => { if (e.target.closest('#tiSnd')) return; go(); };
}
// first time only: the world in four lines, over the city
function coldOpen(done) {
  const el = $('intro'); let i = 0; el.hidden = false;
  const show = () => { el.classList.remove('in'); void el.offsetWidth; if (i >= WORLD.intro.length) { el.classList.remove('in'); setTimeout(() => { el.hidden = true; S.seenIntro = 1; L.saveState(S); done(); }, 600); return; } el.innerHTML = '<p class="inLine">' + esc(WORLD.intro[i]) + '</p><small>Tap to continue · <button type="button" id="inSkip">Skip</button></small>'; el.classList.add('in'); $('inSkip').onclick = (e) => { e.stopPropagation(); i = 99; show(); }; i++; };
  el.onclick = show; show();
}

// ---------- input ----------
let ptrs = new Map(), downAt = null, panFrom = null, pinch0 = 0, z0 = 1;
cv.addEventListener('pointerdown', (e) => { audio(); cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 1) { downAt = [e.clientX, e.clientY, performance.now()]; panFrom = [cam.x, cam.y]; } else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); z0 = cam.z; downAt = null; } });
cv.addEventListener('pointermove', (e) => { if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); setZoom(z0 * d / pinch0); return; } if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 10) { cam.free = true; cam.x = panFrom[0] - (e.clientX - downAt[0]) / cam.z; cam.y = panFrom[1] - (e.clientY - downAt[1]) / cam.z; } });
cv.addEventListener('pointerup', (e) => { ptrs.delete(e.pointerId); if (downAt && !cam.free && performance.now() - downAt[2] < 600) tap(e.clientX, e.clientY); else if (downAt && cam.free && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) <= 10) tap(e.clientX, e.clientY); downAt = null; });
cv.addEventListener('wheel', (e) => { e.preventDefault(); setZoom(cam.z * (e.deltaY < 0 ? 1.1 : .9)); }, { passive: false });
function setZoom(z) { cam.z = Math.max(.45, Math.min(2.2, z)); S.zoom = cam.z; }
function toWorld(px, py) { const r = cv.getBoundingClientRect(); const ix = (px - r.left - r.width / 2) / cam.z + cam.x, iy = (py - r.top - r.height / 2) / cam.z + cam.y; return [ix, iy]; }
function tap(px, py) {
  if (paused || scene) return;
  const [ix, iy] = toWorld(px, py), near = (x, y, r) => { const [sx, sy] = iso(x, y); return Math.hypot(sx - ix, (sy - 20) - iy) < r; };
  const reach = (x, y, fn) => { if (Math.hypot(x - P.x, y - P.y) < 1.9) fn(); else goTo(x, y, fn); };
  for (const c of FX.caches) if ((c.shown || Math.hypot(c.x - P.x, c.y - P.y) <= spotR() + 1.5) && near(c.x, c.y, 30)) return reach(c.x, c.y, () => { FX.caches.splice(FX.caches.indexOf(c), 1); ord('secret'); queueLoot('Lost & found', 1, hasSk('inv4') ? 'u' : 'c'); });
  for (const e of FX.events) if (near(e.x, e.y, 34) && e.k !== 'work') return reach(e.x, e.y, () => streetLife(e));
  if (!inside) for (const r of regs) if (near(r.x, r.y, 30)) return reach(r.x, r.y + .9, () => npcTalk(r));
  for (const c of citizens) if (near(c.x, c.y, 30)) return reach(c.x, c.y, () => citizenTalk(c));
  for (const i of infos) if (near(i.x, i.y, 28)) return reach(i.x, i.y, () => infoPoint(i));
  for (const o of observes) if (o.seen && near(o.x, o.y, 30)) return reach(o.x, o.y, () => observeScene(o));
  if (call && near(call.x, call.y, 34)) { call.accepted = true; callCard(); return goTo(call.x, call.y); }
  for (const k in others) { const o = others[k]; if (o.b && near(o.b.x, o.b.y, 34)) return reach(o.b.x, o.b.y, () => backupScene(k, o)); }
  if (pcar && !P.inCar && !P.boat && near(pcar.x, pcar.y, 34)) return reach(pcar.x, pcar.y, enterCar);
  if (inside) {
    if (near(W.door[0], W.door[1], 30)) return reach(W.door[0], W.door[1] - .6, exitBuilding);
    for (const st of W.staff) if (near(st.x, st.y, 30)) return reach(st.x, st.y + 1, () => { if (st.npc) return npcTalk({ n: st.npc }); const L2 = STAFF_LINES(W.key); toast(L2[Math.floor(Math.random() * L2.length)]); if (!st.talked) { st.talked = true; award(3, 'small talk'); } });
  } else if (!P.inCar && !P.boat) {
    for (const l of W.lots) { if (!ENTER[l.kind] || Math.hypot(l.door[0] + .5 - P.x, l.door[1] - P.y) > 9) continue; const [dx, dy] = doorSpot(l); if (near(dx, dy, 26)) return reach(dx, dy + .7, () => enterBuilding(l)); }
  }
  if (pboat && !P.boat && !P.inCar && near(pboat.x, pboat.y, 34)) return reach(pboat.dock[0], pboat.dock[1], enterBoat);
  if (P.boat) { const [wx, wy] = unIso(ix, iy); if (W.at(Math.floor(wx), Math.floor(wy)) !== T.WATER) { toast('Docking. Tap the water to keep patrolling.'); return exitBoat(); } }
  const [wx, wy] = unIso(ix, iy); goTo(wx, wy);
}
addEventListener('keydown', (e) => { if (scene || paused || e.target.closest('input,textarea')) return; const k = { ArrowUp: [-1, -1], w: [-1, -1], ArrowDown: [1, 1], s: [1, 1], ArrowLeft: [-1, 1], a: [-1, 1], ArrowRight: [1, -1], d: [1, -1] }[e.key]; if (!k) return; e.preventDefault(); goTo(P.x + k[0] * 1.6, P.y + k[1] * 1.6); });
function enterCar() { P.inCar = true; P.x = pcar.x; P.y = pcar.y; const r = nearest(Math.floor(P.x), Math.floor(P.y), (x, y) => W.drivable(x, y)); if (r) { P.x = r[0] + .5; P.y = r[1] + .5; } toast('In your ' + U().ride.label.toLowerCase() + '. Tap the road to drive; lights and siren come on when you respond to a call.'); hud(); }
function enterBoat() { if (!pboat) return; P.boat = true; P.x = pboat.x; P.y = pboat.y; P.path = []; toast('Patrol boat launched. Tap the water to move; tap the shore to dock.'); hud(); }
function exitBoat() { if (!P.boat) return; P.boat = false; P.path = []; pboat.x = P.x; pboat.y = P.y; const r = nearest(Math.floor(P.x), Math.floor(P.y), (x, y) => W.at(x, y) === T.SAND); if (r) { P.x = r[0] + .5; P.y = r[1] + .5; pboat.dock = [P.x, P.y]; } hud(); }
function exitCar() { if (!P.inCar) return; P.inCar = false; P.path = []; pcar.x = P.x; pcar.y = P.y; const r = nearest(Math.floor(P.x), Math.floor(P.y), (x, y) => W.walkable(x, y) && W.at(x, y) !== T.ROAD); if (r) { P.x = r[0] + .5; P.y = r[1] + .5; } hud(); }

// ---------- learning scenes ----------
function openModal(html) { const m = $('modal'); m.innerHTML = '<div class="mBox">' + html + '</div>'; m.hidden = false; paused = false; }
function closeModal() { $('modal').hidden = true; scene = null; }
// a run of questions with feedback; done(result) at the end
function runQuestions(head, qs, done) {
  let i = 0, right = 0; scene = { qs };
  const show = () => {
    const q = qs[i]; let picked = [];
    openModal(head + '<div class="qProg">' + qs.map((_, k) => '<i class="' + (k < i ? 'd' : k === i ? 'c' : '') + '"></i>').join('') + '</div>' +
      (q.kind === 'tf' ? '<div class="qKind">True or false?</div>' : q.kind === 'jq' ? '<div class="qKind">Fill the blank</div>' : '') +
      '<p class="qStem">' + esc(q.stem) + '</p>' + (q.multi ? '<p class="qHint">Select all that apply.</p>' : '') +
      '<div class="qOpts">' + q.opts.map((o, k) => '<button type="button" class="qOpt" data-k="' + k + '"><span>' + 'ABCDEF'[k] + '</span>' + esc(o) + '</button>').join('') + '</div><div class="qFb" id="qFb"></div><div class="qAct"><button type="button" id="qGo" disabled>' + (q.multi ? 'Submit' : 'Pick an answer') + '</button></div>');
    const opts = [...document.querySelectorAll('.qOpt')];
    const submit = () => {
      const ans = q.multi ? picked.slice() : picked[0], ok = L.isRight(q, ans); L.record(S, q, ok); SS.answered++; if (ok) { SS.right++; COMBO++; bestCombo = Math.max(bestCombo, COMBO); ord('right'); if (COMBO === 5) ord('streak'); } else COMBO = 0; comboHud(); if (ok) { right++; good(); } else bad();
      opts.forEach((b) => { const k = +b.dataset.k, isC = q.multi ? q.c.indexOf(k) >= 0 : k === q.c; b.disabled = true; if (isC) b.classList.add('ok'); else if (picked.indexOf(k) >= 0) b.classList.add('no'); });
      $('qFb').innerHTML = '<div class="fb ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? (COMBO >= 3 ? '🔥 ' + COMBO + ' in a row. ' : 'Correct.') : 'Not quite.' + (bestCombo >= 3 && COMBO === 0 ? ' Streak reset.' : '')) + '</b> ' + esc(q.fact || q.ex) + ' <em>p. ' + esc(q.pg) + '</em></div>';
      const go = $('qGo'); go.disabled = false; go.textContent = i < qs.length - 1 ? 'Next' : 'Finish'; go.onclick = () => { i++; if (i < qs.length) show(); else { L.saveState ? L.saveState(S) : 0; done({ right, n: qs.length }); } };
    };
    opts.forEach((b) => b.onclick = () => { const k = +b.dataset.k; if (q.multi) { const at = picked.indexOf(k); if (at >= 0) picked.splice(at, 1); else picked.push(k); b.classList.toggle('sel'); $('qGo').disabled = !picked.length; } else { picked = [k]; submit(); } });
    $('qGo').onclick = () => { if (q.multi && picked.length) submit(); };
  };
  show();
}
const FLOATS = [];
let COMBO = 0, bestCombo = 0;
const comboMult = () => 1 + Math.min(COMBO, 10) * .03;
function award(xp, why) {
  const before = L.rankOf(S.xp).name; xp = Math.round(xp * comboMult()); S.xp += xp; SS.rp += xp; const after = L.rankOf(S.xp).name; L.saveState(S); hud();
  FLOATS.push({ x: P.x, y: P.y, t: performance.now(), text: '+' + xp + ' RP', sub: why + (COMBO >= 3 ? ' · 🔥x' + comboMult().toFixed(2).replace(/0$/, '') : '') });
  if (after !== before) setTimeout(() => promotion(after), 700);
  if (net) net.status('patrol');
}
function floatsDraw(now) {
  for (let k = FLOATS.length - 1; k >= 0; k--) { const f = FLOATS[k], a = (now - f.t) / 1600; if (a > 1) { FLOATS.splice(k, 1); continue; } const [sx, sy] = iso(f.x, f.y), y = sy - 70 - a * 46 - k * 4;
    ctx.globalAlpha = a < .15 ? a / .15 : 1 - Math.max(0, (a - .6) / .4); ctx.textAlign = 'center'; ctx.font = '900 17px "Barlow Condensed",system-ui'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(8,14,28,.85)'; ctx.strokeText(f.text, sx, y); ctx.fillStyle = '#f5b800'; ctx.fillText(f.text, sx, y);
    ctx.font = '700 10px system-ui'; ctx.lineWidth = 3; ctx.strokeText(f.sub, sx, y + 13); ctx.fillStyle = '#e5e7eb'; ctx.fillText(f.sub, sx, y + 13); ctx.globalAlpha = 1; }
}
// the promotion ceremony
function promotion(rank) {
  const lvl = [0, 200, 600, 1200, 2000, 3000, 4200, 5600, 7200, 9000].filter((t) => S.xp >= t).length, opened = SLOTS.filter((sl) => sl.need && S.xp >= sl.need && S.xp - sl.need < 400);
  const el = document.createElement('div'); el.className = 'promo';
  el.innerHTML = '<canvas class="rvFx"></canvas><div class="promoRays"></div><div class="promoBox"><div class="promoBadge"><svg viewBox="0 0 64 72"><defs><linearGradient id="pbG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#d49b00"/></linearGradient></defs><path d="M32 3l25 9v19c0 18-11 31-25 38C18 62 7 49 7 31V12z" fill="url(#pbG)" stroke="#7a5600" stroke-width="2"/><path d="M32 10l19 7v14c0 14-8 24-19 30-11-6-19-16-19-30V17z" fill="#13234a" stroke="#ffe27a" stroke-width="1.5"/><path d="M32 15l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8z" fill="#ffe27a"/><text x="32" y="51" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="800" font-size="17" fill="#fff">' + lvl + '</text></svg></div>' +
    '<span class="promoKick">Promoted</span><h2>' + esc(rank) + '</h2><p>' + esc(S.cs) + ' · ' + esc(unitName(U())) + '</p>' + '<p class="promoNew">+1 skill point · spend it in your Locker</p>' + (opened.length ? '<p class="promoNew">New equipment slot: ' + opened.map((x) => x.icon + ' ' + x.name).join(', ') + '</p>' : '') + '<p class="promoQ">"' + esc(['Stand where it counts.', 'Train like it matters. Because it will.', 'Slow is smooth. Smooth is fast.', 'Write it down while it is fresh.', 'Watch the hands.'][lvl % 5]) + '" · Sgt. Castillo</p><button type="button">Carry on</button></div>';
  document.body.appendChild(el); paused = true;
  if (S.sound) [392, 523, 659, 784, 1047].forEach((f, i) => beep(f, .35, 'triangle', .05, i * .12));
  const fx = el.querySelector('canvas'), g = fx.getContext('2d'), d = Math.min(2, devicePixelRatio || 1); fx.width = innerWidth * d; fx.height = innerHeight * d; let ps = [];
  for (let i = 0; i < 180; i++) { const a = Math.random() * Math.PI * 2, v = (3 + Math.random() * 9) * d; ps.push({ x: fx.width / 2, y: fx.height * .38, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3 * d, c: ['#f5b800', '#fff3b0', '#ffffff', '#3b82f6'][i % 4], s: (3 + Math.random() * 4) * d, l: 1 }); }
  let raf = 0; const loop = () => { g.clearRect(0, 0, fx.width, fx.height); ps.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += .22 * d; p.l -= .007; g.globalAlpha = Math.max(0, p.l); g.fillStyle = p.c; g.fillRect(p.x, p.y, p.s, p.s / 2); }); ps = ps.filter((p) => p.l > 0); raf = requestAnimationFrame(loop); }; loop();
  setTimeout(() => el.classList.add('in'), 20);
  el.querySelector('button').onclick = () => { cancelAnimationFrame(raf); el.classList.add('out'); setTimeout(() => el.remove(), 300); paused = false; };
}
// ---------- shift orders: three objectives a shift ----------
const ORDERS = [
  ['call', 'Clear 3 calls', 3], ['pri1', 'Clear a priority 1 call', 1], ['citizen', 'Help 2 citizens with a question', 2], ['regular', 'Help out 2 regulars', 2],
  ['right', 'Answer 12 questions right', 12], ['streak', 'Hit a 5-answer streak', 1], ['place', 'Discover 2 new places', 2], ['secret', 'Find a secret spot or lost & found', 1],
  ['inside', 'Visit 3 buildings', 3], ['study', 'Check 3 study points', 3], ['story', 'Finish a story scene', 1]
];
let SS = { rp: 0, calls: 0, right: 0, answered: 0, ords: {} };
function ordersInit() {
  try { $('orders').classList.toggle('open', !!localStorage.getItem('patrolcity:ordOpen')); } catch (e) {}
  const key = new Date().toDateString() + ':' + S.shift + ':' + W.did;
  if (!S.orders || S.orders.key !== key) { const pool = ORDERS.slice().sort(() => Math.random() - .5).slice(0, 3); S.orders = { key, list: pool.map((o) => ({ id: o[0], text: o[1], need: o[2], have: 0, done: false })) }; L.saveState(S); }
  ordersHud();
}
function ord(id, n) {
  SS.ords[id] = (SS.ords[id] || 0) + (n || 1); if (!S.orders) return; let changed = false;
  S.orders.list.forEach((o) => { if (o.id !== id || o.done) return; o.have = Math.min(o.need, o.have + (n || 1)); changed = true; if (o.have >= o.need) { o.done = true; FLOATS.push({ x: P.x, y: P.y, t: performance.now() + 300, text: 'ORDER COMPLETE', sub: o.text }); beep(784, .12, 'triangle', .05); beep(1175, .2, 'triangle', .05, .1); setTimeout(() => award(60, 'shift order'), 300); if (S.orders.list.every((x) => x.done)) setTimeout(() => queueLoot('All shift orders complete', 1, 'r'), 900); else queueLoot('Shift order: ' + o.text, .4); } });
  if (changed) { L.saveState(S); ordersHud(); }
}
function comboHud() { const el = $('hCombo'); if (!el) return; el.hidden = COMBO < 2; el.innerHTML = '🔥 <b>' + COMBO + '</b><small>x' + comboMult().toFixed(2) + '</small>'; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
function ordersHud() {
  const el = $('orders'); if (!el || !S.orders) return; const L2 = S.orders.list, d = L2.filter((o) => o.done).length;
  el.innerHTML = '<button type="button" class="ordHead" id="ordT"><b>Shift Orders</b><span>' + d + '/3</span></button><div class="ordList">' + L2.map((o) => '<div class="' + (o.done ? 'ok' : '') + '"><i>' + (o.done ? '✓' : '') + '</i><span>' + esc(o.text) + '</span><em>' + o.have + '/' + o.need + '</em></div>').join('') + '</div>';
  $('ordT').onclick = () => { el.classList.toggle('open'); try { localStorage.setItem('patrolcity:ordOpen', el.classList.contains('open') ? '1' : ''); } catch (e) {} };
}

// judgment calls on the way in: each choice is reasonable, and each has a consequence that shows up later
const APPROACH = [
  { les: [4, 12, 17, 1], q: 'Lights and siren all the way in?', opts: [
    { t: 'Siren off a few blocks out, roll in quiet', eff: 'quiet', reply: [['velvet', '(over the radio) Copy, quiet approach. Units on scene shortly.']] },
    { t: 'Lights and siren all the way to the door', eff: 'loud', reply: [['velvet', '(over the radio) Copy, emergency response. Clear the intersections.']] }] },
  { les: [4, 14, 15, 7, 16], q: 'Where do you park?', opts: [
    { t: 'A few doors down, out of view', eff: 'smart', reply: [['castillo', '(over the radio) Good. Never park in front of the address.']] },
    { t: 'Right out front, it\'s faster', eff: 'front', trust: -1, reply: [['castillo', '(over the radio) Out front? Everyone inside just watched you arrive.']] }] },
  { les: [8, 9, 10, 11, 13], q: 'How do you start?', opts: [
    { t: 'Talk to the neighbors first', eff: 'neighbors', trust: 1, reply: [['velvet', '(over the radio) Copy. Neighbor on the porch is waving you over.']] },
    { t: 'Go straight to the door', eff: 'direct', reply: [['velvet', '(over the radio) Copy, you\'re on scene.']] }] },
  { les: [1, 5, 0, 3], q: 'The subject hasn\'t noticed you yet.', opts: [
    { t: 'Watch from a distance for a minute', eff: 'observe', reply: [['castillo', '(over the radio) Good. What are the hands doing? What\'s around him?']] },
    { t: 'Walk right up and make contact', eff: 'contact', reply: [['castillo', '(over the radio) Okay. Stay sharp. Watch those hands.']] }] }
];
function approachFor(les) { const a = APPROACH.filter((x) => x.les.indexOf(les) >= 0); return a.length ? a[Math.floor(Math.random() * a.length)] : null; }
// consequences, some immediate and some later in the shift
function consequence(eff, c) {
  if (eff === 'loud' && (c.les === 4 || c.les === 17)) setTimeout(() => { const o = newObserve(); o.les = c.les; o.text = 'Fresh footprints leading away from the call you just cleared. Someone heard you coming'; observes.push(o); radio('Dispatch', 'Caller says someone ran out the back when the siren got close.'); }, 9000);
  if (eff === 'neighbors') { const n = newCitizen(); n.les = c.les; citizens.push(n); radio('Dispatch', 'The neighbor you spoke with wants to tell you something else. Look for them nearby.'); }
  if (eff === 'front') S.trust[W.did] = Math.max(0, (S.trust[W.did] == null ? 50 : S.trust[W.did]) - 2);
  if (eff === 'observe' && Math.random() < .5) setTimeout(() => queueLoot('Spotted while you watched: dropped by the subject', 1, 'c'), 1200);
}
const APPROACH_BONUS = { quiet: 1.25, smart: 1.2, neighbors: 1.1, observe: 1.2, loud: .9, front: .85, direct: 1, contact: .95 };
function openCallScene(c) {
  const a = Math.random() < .65 ? approachFor(c.les) : null;
  if (a) { paused = true; LASTCHOICE = null; return dialogue([['velvet', '(over the radio) ' + c.title + ', ' + c.where + '. ' + a.q], ['choice', a.opts]], () => { paused = false; const eff = LASTCHOICE && LASTCHOICE.eff; c.eff = eff; consequence(eff, c); openCallSceneQ(c); }); }
  openCallSceneQ(c);
}
function openCallSceneQ(c) {
  if (net) net.status('call');
  const n = c.prio === 1 ? 4 : 3, qs = L.pick(S, [c.les], 'q', n), fast = clock - c.t0 < 40;
  runQuestions('<div class="sceneHead p' + c.prio + '"><b>ON SCENE · ' + esc(c.where) + '</b><h2>' + esc(c.title) + '</h2><p>' + esc(c.text) + '</p></div>', qs, (r) => {
    S.calls++; SS.calls++; const effM = (APPROACH_BONUS[c.eff] || 1) * ((APPROACH_BONUS[c.eff] || 1) > 1 && hasSk('tac2') ? 1.15 : 1) * (c.prio === 1 && hasSk('tac4') ? 1.25 : 1); ord('call'); if (c.prio === 1) ord('pri1'); const mult = callMult(c) * effM, xp = Math.round((r.right * 25 + (fast ? 15 : 0) + (r.right === r.n ? 20 : 0)) * mult); S.trust[W.did] = Math.max(0, Math.min(100, (S.trust[W.did] || 50) + (r.right - (r.n - r.right)) * (S.unit === 'brt' && (c.les === 9 || c.les === 10) ? 2 : 1)));
    openModal('<div class="sceneHead done"><b>CALL CLEARED</b><h2>' + r.right + ' of ' + r.n + ' handled by the book</h2><p>' + (fast ? 'Quick response bonus. ' : '') + (mult > 1.01 ? U().icon + ' ' + esc(U().perk) + ' bonus. ' : '') + (r.right === r.n ? 'Clean call. ' : 'Review what you missed in the hub.') + '</p></div>' + masteryLine() + '<div class="qAct"><button type="button" id="mDone">Back in service</button></div>');
    $('mDone').onclick = () => { closeModal(); radio(S.cs, 'Clear, back in service.'); award(xp, 'call cleared'); queueLoot('Found on scene: ' + c.title, r.right === r.n ? .6 : .3); nextCall = (25 + Math.random() * 25) * (S.unit === 'patrol' ? .75 : 1); if (net) net.backup(null); };
  });
}
function streetLife(e) {
  if (e.k === 'music') { const lines = ['The musician nods and plays the academy fight song. There is no academy fight song. He made one up.', 'He takes requests. You request "anything but the PT playlist." He respects that.', 'He plays a slow ballad called "Ode to the Gig Line." It hits different.']; toast(lines[Math.floor(Math.random() * lines.length)]); if (!e.tipped) { e.tipped = true; award(5, 'community morale'); } }
  if (e.k === 'truck') { const lines = ['"Officer! First taco is on the house." You politely pay anyway. Integrity is a lifestyle.', 'The owner asks if you are a real cop. You say "In training." She gives you extra salsa for honesty.', 'The line is twelve people deep. Eleven are from the fire station.']; toast(lines[Math.floor(Math.random() * lines.length)]); if (!e.tipped) { e.tipped = true; award(5, 'community morale'); queueLoot(e.name, .35, 'c'); } }
}
function citizenTalk(c) {
  const qs = L.pick(S, [c.les], 'jq', 1);
  runQuestions('<div class="sceneHead cit"><b>CITIZEN CONTACT</b><h2>"Officer, quick question about something I read..."</h2></div>', qs, (r) => { closeModal(); if (r.right) ord('citizen'); award(Math.round((r.right ? 15 : 5) * rapMult() * (S.unit === 'hoi' ? 1.5 : 1) * (1 + gp('rpCit') / 100)), 'citizen contact'); queueLoot('A thankful citizen hands you something', .15); const i = citizens.indexOf(c); if (i >= 0) citizens[i] = newCitizen(); });
}
function observeScene(o) {
  const qs = L.pick(S, [o.les], 'q', 1);
  runQuestions('<div class="sceneHead obs"><b>SOMETHING\'S OFF</b><h2>' + esc(o.text) + '</h2><p>What does the chapter say?</p></div>', qs, (r) => { closeModal(); award(r.right ? 25 : 5, 'sharp eyes'); queueLoot('Something\'s off: ' + o.text, .25); const i = observes.indexOf(o); if (i >= 0) observes[i] = newObserve(); });
}
function infoPoint(i) {
  if (i.cool > 0) { toast('You checked ' + i.name + ' recently. Come back in a bit.'); return; }
  const f = L.fact(S, i.les); if (!f) return;
  openModal('<div class="sceneHead info"><b>' + esc(i.name.toUpperCase()) + ' · ' + esc(L.lessonName(i.les)) + '</b><h2>Know this</h2></div><p class="fact">' + esc(f.text) + ' <em>p. ' + esc(f.pg) + '</em></p><div class="qAct"><button type="button" id="mGo">Got it · quick check</button></div>');
  $('mGo').onclick = () => { const qs = L.pick(S, [i.les], 'tq', 1); runQuestions('<div class="sceneHead info"><b>QUICK CHECK</b></div>', qs, (r) => { closeModal(); i.cool = S.unit === 'det' ? 60 : 120; ord('study'); award(Math.round((r.right ? 10 : 3) * rapMult() * (S.unit === 'sro' ? 2 : 1) * (1 + gp('rpStudy') / 100)), 'study point'); queueLoot('Left behind at ' + i.name, .1); }); };
}
function backupScene(uid, o) {
  const ls = W.D.lessons.indexOf(6) >= 0 ? [6] : W.D.lessons, qs = L.pick(S, ls, 'q', 2);
  if (net) net.assist(uid);
  runQuestions('<div class="sceneHead p2"><b>BACKUP · COVER OFFICER</b><h2>You arrive to back up ' + esc(o.c) + '</h2><p>' + esc(o.b.l || '') + '</p></div>', qs, (r) => { closeModal(); award(20 + r.right * 15, 'backup'); if (net) net.assist(null); });
}
function masteryLine() {
  const m = L.districtMastery(S, W.did);
  return '<div class="mLine"><b>' + esc(W.D.name) + ' mastery</b><div class="mBars">' + W.D.lessons.map((l, k) => { const x = m.lessons[k]; return '<span title="' + esc(L.lessonName(l)) + '" class="' + (x.done ? 'done' : '') + '"><i style="width:' + Math.round(Math.min(1, x.n / 8) * x.pct * 100) + '%"></i></span>'; }).join('') + '</div><small>' + m.done + ' of ' + m.total + ' lessons mastered' + (m.ready ? ' · District Final Call is ready' : '') + '</small></div>';
}

// ---------- district board and final call ----------
function districtBoard(tabs) {
  const rows = DISTRICTS.map((d) => {
    const un = S.unlocked.includes(d.id), cl = S.cleared.includes(d.id), m = L.districtMastery(S, d.id), here = W.did === d.id;
    return '<div class="dRow' + (here ? ' here' : '') + (un ? '' : ' locked') + '" style="--dc:' + d.color + '"><div class="dHead"><b>' + (un ? '' : '🔒 ') + esc(d.name) + '</b><span>' + esc(d.unit) + '</span></div>' +
      (un ? '<div class="dLes">' + d.lessons.map((l, k) => { const x = m.lessons[k]; return '<div class="dL"><span>' + esc(L.lessonName(l)) + '</span><i><b style="width:' + Math.round(Math.min(1, x.n / 8) * x.pct * 100) + '%" class="' + (x.done ? 'ok' : '') + '"></b></i></div>'; }).join('') + '</div>' : '<p class="dLock">Master the district before it to unlock.</p>') +
      '<div class="dAct">' + (cl ? '<span class="cleared">★ District cleared</span>' : '') + (un && !here ? '<button type="button" data-go="' + d.id + '">Patrol here</button>' : '') + (here && !cl ? '<button type="button" data-final="1" ' + (m.ready ? '' : 'disabled') + '>' + (m.ready ? 'Take the District Final Call' : 'Final Call · master every lesson first') + '</button>' : '') + '</div></div>';
  }).join('');
  openModal('<div class="uNow" style="--uc:' + U().color + '"><span>' + U().icon + '</span><div><b>' + esc(unitName(U())) + '</b><small>' + esc(U().perk) + '</small></div><button type="button" id="uSw">Switch unit</button></div><div class="sceneHead"><b>CITY MAP · DISTRICTS</b><h2>Master a district to open the next one</h2><p>A lesson is mastered at 80% or better over your last ten answers on it (at least eight).</p></div>' + (tabs || '') + '<div class="dList">' + rows + '</div><div class="qAct"><button type="button" class="ghost" id="mClose">Close</button></div>');
  $('mClose').onclick = closeModal; $('uSw').onclick = unitPicker; document.querySelectorAll('[data-j]').forEach((b) => b.onclick = () => { jTab = b.dataset.j; journal(); });
  document.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => { closeModal(); S.home = S.home == null ? +b.dataset.go : S.home; L.saveState(S); clock = 0; load(+b.dataset.go); });
  const fb = document.querySelector('[data-final]'); if (fb) fb.onclick = finalCall;
}
function finalCall() {
  const qs = L.pick(S, W.D.lessons, 'q', 10);
  runQuestions('<div class="sceneHead p1"><b>DISTRICT FINAL CALL · ' + esc(W.D.name.toUpperCase()) + '</b><h2>Major incident. Everything you have learned here.</h2><p>Handle 8 of 10 by the book to clear the district.</p></div>', qs, (r) => {
    const pass = r.right >= 8, nx = (W.did + 1) % 5;
    if (pass) { if (!S.cleared.includes(W.did)) S.cleared.push(W.did); if (!S.unlocked.includes(nx)) S.unlocked.push(nx); }
    L.saveState(S);
    openModal('<div class="sceneHead ' + (pass ? 'done' : 'p1') + '"><b>' + (pass ? 'DISTRICT CLEARED' : 'NOT YET') + '</b><h2>' + r.right + ' of 10</h2><p>' + (pass ? DISTRICTS[nx].name + ' is now open. The barricade on the road out is down.' : 'You need 8 of 10. Keep working calls, then try again.') + '</p></div><div class="qAct"><button type="button" id="mDone">Back to patrol</button></div>');
    $('mDone').onclick = () => { closeModal(); award(pass ? 300 : 40, pass ? 'district cleared' : 'final call attempt'); if (pass) queueLoot('District cleared: ' + W.D.name, 1, 'r'); };
  });
}
function gatePrompt(g) {
  const d = DISTRICTS[g.to];
  if (!S.unlocked.includes(g.to)) { toast('🔒 ' + d.name + ' is locked. Master ' + W.D.name + ' and pass its Final Call to open it.'); return; }
  openModal('<div class="sceneHead"><b>DISTRICT LINE</b><h2>Head into ' + esc(d.name) + '?</h2><p>' + esc(d.unit) + '. ' + esc(d.blurb) + '</p></div><div class="qAct"><button type="button" id="gGo">Patrol ' + esc(d.name) + '</button><button type="button" class="ghost" id="gNo">Stay here</button></div>');
  $('gGo').onclick = () => { closeModal(); load(g.to); }; $('gNo').onclick = closeModal;
}
function endOfWatch() {
  scene = {}; const acc = SS.answered ? SS.right / SS.answered : 0, od = S.orders ? S.orders.list.filter((o) => o.done).length : 0;
  const score = acc * .6 + Math.min(SS.calls, 6) / 6 * .25 + od / 3 * .15, grade = score >= .92 ? 'S' : score >= .8 ? 'A' : score >= .65 ? 'B' : score >= .5 ? 'C' : 'D';
  const note = { S: 'Outstanding watch. Castillo actually smiled. Witnesses are unsure.', A: 'Sharp work. The kind of shift people remember.', B: 'Solid shift. Clean up the misses and you\'re there.', C: 'You showed up and did the work. Now do it by the book.', D: 'Rough one. Every officer has them. Review, rest, come back.' }[grade];
  openModal('<div class="rpt"><div class="rptHead"><span>PORT MERIDIAN PD · SHIFT REPORT</span><b>' + esc(shiftOf().name) + ' · ' + esc(W.D.name) + '</b><small>' + esc(S.cs) + ' · ' + esc(unitName(U())) + '</small></div>' +
    '<div class="rptGrid"><div><em>' + SS.calls + '</em><span>Calls cleared</span></div><div><em>' + Math.round(acc * 100) + '%</em><span>Accuracy</span></div><div><em>' + bestCombo + '</em><span>Best streak</span></div><div><em>' + od + '/3</em><span>Shift orders</span></div><div><em>' + SS.rp + '</em><span>RP earned</span></div><div><em>' + esc(L.rankOf(S.xp).name) + '</em><span>Rank</span></div></div>' +
    '<div class="rptGrade g' + grade + '"><span>' + grade + '</span></div><p class="rptNote">' + esc(note) + '</p>' + masteryLine() + '</div><div class="qAct"><button type="button" id="eNext">Start next shift</button></div>');
  if (S.sound) [523, 659, 784].forEach((f, i) => beep(f, .25, 'triangle', .05, .5 + i * .1));
  $('eNext').onclick = () => { const i = SHIFTS.findIndex((x) => x.id === S.shift); S.shift = SHIFTS[(i + 1) % 3].id; L.saveState(S); clock = 0; closeModal(); load(W.did); award(grade === 'S' ? 120 : grade === 'A' ? 80 : 50, 'full shift · grade ' + grade); queueLoot('End of watch: found in your duty bag', 1, grade === 'S' ? 'r' : grade === 'A' ? 'u' : 'c'); };
}

// ---------- HUD ----------
function hud() {
  const r = L.rankOf(S.xp), m = L.districtMastery(S, W.did);
  $('hCs').textContent = U().icon + ' ' + S.cs; $('hUnit').textContent = unitName(U()); $('hUnit').style.setProperty('--uc', U().color); $('hRank').textContent = r.name + ' · ' + S.xp + ' RP';
  $('hDist').textContent = inside ? W.name : W.D.name; $('hDist').style.setProperty('--dc', W.D.color);
  $('hMast').style.setProperty('--p', Math.round(m.pct * 100)); $('hMastN').textContent = m.done + '/' + m.total;
  { const k = U().ride.kind, lab = P.boat ? 'Dock' : P.inCar ? 'Exit' : k === 'van' ? 'Van' : k === 'armored' || k === 'truck' ? 'Truck' : k === 'suv' ? 'SUV' : 'Car'; $('bCar').innerHTML = '<i>' + (P.boat ? '⚓' : P.inCar ? '🚶' : '🚓') + '</i>' + lab; } $('bCar').classList.toggle('on', P.inCar || P.boat);
  $('bSnd').innerHTML = '<i>' + (S.sound ? '🔊' : '🔇') + '</i>Sound';
}
function hudClock() { const t = (shiftOf().start * 60 + Math.floor(clock)) % 1440; const s = String(Math.floor(t / 60)).padStart(2, '0') + String(t % 60).padStart(2, '0') + ' hrs'; const el = $('hClock'); if (el.textContent !== s) el.textContent = shiftOf().name + ' · ' + s; }
const feed = [];
function radio(who, msg) { feed.push([who, msg]); while (feed.length > 30) feed.shift(); const el = $('radio'); el.innerHTML = feed.slice(-3).map((f) => '<div><b>' + esc(f[0]) + ':</b> ' + esc(f[1]) + '</div>').join(''); placeOrders(); }
function placeOrders() { const r = $('radio'), o = $('orders'); if (!r || !o) return; const b = r.getBoundingClientRect(); o.style.top = Math.max(b.bottom + 6, 0) + 'px'; }
addEventListener('resize', placeOrders);
function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 3800); }
$('bCar').onclick = () => { if (inside) { toast('Head outside first. The door is the glowing spot by the exit.'); return; } if (P.boat) exitBoat(); else if (P.inCar) exitCar(); else if (pcar) { if (Math.hypot(pcar.x - P.x, pcar.y - P.y) < 2.2) enterCar(); else { toast('Walking back to your ' + U().ride.label.toLowerCase() + '.'); goTo(pcar.x, pcar.y, enterCar); } } };
$('bMap').onclick = () => { jTab = chStep() ? 'story' : 'map'; journal(); }; $('bLock').onclick = locker;
$('bSnd').onclick = () => { S.sound = !S.sound; L.saveState(S); hud(); };
$('bMe').onclick = () => { cam.free = false; };
$('zIn').onclick = () => setZoom(cam.z * 1.2); $('zOut').onclick = () => setZoom(cam.z / 1.2);
$('bRadio').onclick = () => { const m = $('quick'); m.hidden = !m.hidden; $('bRadio').classList.remove('ping'); if (!m.hidden) { chatPanel(); setTimeout(() => { if (innerWidth > 700) { const i = $('chIn'); if (i) i.focus(); } }, 50); } };

// ---------- district chat ----------
// in the radio feed, as bubbles over each cadet, and in the Radio panel with history and quick replies
const CHAT = { list: [], seen: new Set(), last: 0, muted: new Set(JSON.parse((() => { try { return localStorage.getItem('patrolcity:muted') || '[]'; } catch (e) { return '[]'; } })())) };
const BAD = /\b(f+u+c+k+\w*|s+h+i+t+\w*|b+i+t+c+h+\w*|a+s+s+h+o+l+e+\w*|d+a+m+n+\w*|c+u+n+t+\w*|d+i+c+k+\w*|p+u+s+s+y+\w*|b+a+s+t+a+r+d+\w*|n+i+g+g+\w*|f+a+g+\w*|r+e+t+a+r+d+\w*|w+h+o+r+e+\w*|s+l+u+t+\w*)\b/gi;
const clean = (t) => String(t).replace(BAD, (w) => w[0] + '*'.repeat(Math.max(2, w.length - 1)));
function chatIn(all) {
  const rows = Object.keys(all).map((k) => Object.assign({ k }, all[k])).filter((m) => m && m.m && m.t).sort((a, b) => a.t - b.t).slice(-60);
  rows.forEach((m) => {
    if (CHAT.seen.has(m.k)) return; CHAT.seen.add(m.k); CHAT.list.push(m); if (CHAT.list.length > 60) CHAT.list.shift();
    if (CHAT.muted.has(m.u)) return; const fresh = N0() - m.t < 60000;
    if (fresh) { radio(m.c, clean(m.m)); const o = others[m.u]; if (o) { o.say = clean(m.m); o.sayAt = performance.now(); } if (m.u !== myUid) { const b = $('bRadio'); if (b && $('quick').hidden) b.classList.add('ping'); } }
  });
  if (!$('quick').hidden) chatPanel();
}
function chatSend(text) {
  text = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 140); if (!text) return;
  if (Date.now() - CHAT.last < 2500) { toast('Easy on the radio. One message every few seconds.'); return; }
  CHAT.last = Date.now(); const m = clean(text);
  if (net && net.chatSend) net.chatSend(m, S.cs, S.shift); else radio(S.cs, m);
  SELF_SAY.text = m; SELF_SAY.at = performance.now(); chirp();
}
const SELF_SAY = { text: '', at: 0 };
function chatPanel() {
  const q = $('quick'), mine = (m) => m.u === myUid, rows = CHAT.list.filter((m) => !CHAT.muted.has(m.u)).slice(-30);
  q.innerHTML = '<div class="chHead"><b>📻 ' + esc(W.D.name) + ' channel</b><span>' + (Object.keys(others).length + 1) + ' on shift</span><button type="button" id="chX" aria-label="Close">×</button></div>' +
    '<div class="chList" id="chList">' + (rows.length ? rows.map((m) => '<div class="chMsg' + (mine(m) ? ' me' : '') + '"><b>' + esc(m.c) + (m.s && m.s !== S.shift ? ' <i>' + ({ day: 'Day', mid: 'Mid', night: 'Night' }[m.s] || '') + '</i>' : '') + '</b><span>' + esc(clean(m.m)) + '</span>' + (mine(m) ? '' : '<button type="button" class="chMute" data-u="' + esc(m.u) + '" title="Mute this cadet">🔇</button>') + '</div>').join('') : '<p class="chEmpty">Quiet channel. Say hi to the cadets on shift in ' + esc(W.D.name) + '.</p>') + '</div>' +
    '<div class="chQuick">' + QUICK.map((t, k) => '<button type="button" data-q="' + k + '">' + esc(t) + '</button>').join('') + '</div>' +
    '<form class="chForm" id="chForm"><input id="chIn" maxlength="140" autocomplete="off" placeholder="Message ' + esc(W.D.name) + '…" aria-label="Chat message"><button type="submit">Send</button></form><p class="chRule">Keep it professional. Everyone on this channel is a cadet in training.</p>';
  const L2 = $('chList'); L2.scrollTop = L2.scrollHeight;
  $('chX').onclick = () => { q.hidden = true; };
  q.querySelectorAll('[data-q]').forEach((b) => b.onclick = () => { radio(S.cs, QUICK[+b.dataset.q]); if (net) net.quick(+b.dataset.q); SELF_SAY.text = QUICK[+b.dataset.q]; SELF_SAY.at = performance.now(); chirp(); q.hidden = true; });
  q.querySelectorAll('.chMute').forEach((b) => b.onclick = () => { CHAT.muted.add(b.dataset.u); try { localStorage.setItem('patrolcity:muted', JSON.stringify([...CHAT.muted])); } catch (e) {} toast('Muted. You won\'t see their messages.'); chatPanel(); });
  $('chForm').onsubmit = (e) => { e.preventDefault(); const v = $('chIn').value; $('chIn').value = ''; chatSend(v); };
}

// ---------- multiplayer ----------
function onPlayers(all, uid) {
  myUid = uid; const now = N0(), seen = {};
  Object.keys(all).forEach((k) => {
    if (k === uid) return; const v = all[k]; if (!v || !v.t || now - v.t > 45000) return; seen[k] = 1;
    const o = others[k] || (others[k] = { rx: v.x, ry: v.y, skin: rnd(SKIN) });
    if (v.q && (!o.q || o.q.t !== v.q.t) && now - v.q.t < 8000) { o.qAt = performance.now(); radio(v.c, QUICK[v.q.k] || ''); }
    if (v.b && v.b.t && (!o.b || o.b.t !== v.b.t) && now - v.b.t < 60000) { radio(v.c, 'Requesting backup: ' + (v.b.l || '')); chirp(); toast(v.c + ' requests backup. Tap the blue marker to respond.'); }
    if (v.a === uid && o.a !== uid) { toast(v.c + ' arrived to back you up.'); good(); }
    Object.assign(o, { n: v.n, f: v.f, u: v.u, sh: v.s, tx: v.x, ty: v.y, c: v.c, v: v.v, d: v.d, st: v.st, q: v.q, b: v.b, a: v.a });
  });
  Object.keys(others).forEach((k) => { if (!seen[k]) delete others[k]; });
  $('hOn').textContent = (Object.keys(others).length + 1) + ' on shift';
}
function smoothOthers(dt) { Object.keys(others).forEach((k) => { const o = others[k]; if (o.tx == null) return; const dx = o.tx - o.rx, dy = o.ty - o.ry; o.moving = Math.hypot(dx, dy) > .05; o.rx += dx * Math.min(1, dt * 5); o.ry += dy * Math.min(1, dt * 5); }); }

// ---------- unit picker ----------
function unitCards(sel) {
  return '<div class="uList">' + UNITS.map((u) => '<button type="button" class="uCard' + (u.id === sel ? ' on' : '') + '" data-u="' + u.id + '" style="--uc:' + u.color + '">' +
    '<div class="uTop"><span class="uIco">' + u.icon + '</span><div><b>' + esc(u.name) + '</b><em>(In Training)</em></div></div>' +
    '<div class="uStats">' + STATS.map((x) => '<div title="' + esc(x[2]) + '"><span>' + x[1] + '</span><i>' + [1, 2, 3, 4, 5].map((k) => '<b class="' + (k <= u.st[x[0]] ? 'f' : '') + '"></b>').join('') + '</i></div>').join('') + '</div>' +
    '<p class="uPerk"><b>' + esc(u.perk) + ':</b> ' + esc(u.perkText) + '</p><p class="uRide">' + esc(u.ride.label) + '</p></button>').join('') + '</div>';
}
function unitPicker() {
  let sel = S.unit;
  const draw = () => { openModal('<div class="sceneHead"><b>SPECIALTY UNIT</b><h2>Switch your training unit</h2><p>Your rank and RP stay with you.</p></div>' + unitCards(sel) + '<div class="qAct"><button type="button" id="uGo">Train with ' + esc(unitOf(sel).name) + '</button><button type="button" class="ghost" id="uNo">Cancel</button></div>');
    document.querySelectorAll('.uCard').forEach((b) => b.onclick = () => { sel = b.dataset.u; draw(); });
    $('uGo').onclick = () => { if (P.inCar) exitCar(); if (P.boat) exitBoat(); S.unit = sel; L.saveState(S); closeModal(); load(W.did); }; $('uNo').onclick = closeModal; };
  draw();
}

// ---------- start screen ----------
function callsign(did) { return (did + 1) + '-' + rnd(PHONETIC) + '-' + (10 + Math.floor(Math.random() * 89)); }
function startScreen() {
  let did = S.home != null ? S.home : 0, shift = SHIFTS.some((x) => x.id === S.shift) ? S.shift : 'day', unit = S.unit || '';
  // call sign: district number - phonetic letter - unit number the cadet picks
  const old = /^\d-([A-Za-z]+)-(\d{1,3})$/.exec(S.cs || ''); let phon = old && PHONETIC.includes(old[1]) ? old[1] : 'Adam', num = old ? old[2] : '';
  const csNow = () => (did + 1) + '-' + phon + '-' + (num || '##');
  const draw = () => {
    $('start').innerHTML = '<div class="stBox"><div class="stBrand"><span class="stBadge">★</span><div><b>PATROL CITY</b><small>Learn the job on the street · Chapter 5</small></div></div>' +
      '<label class="stL">Your call sign</label><div class="stCs"><b id="stCsNow">' + esc(csNow()) + '</b></div>' +
      '<div class="stCsPick"><span class="stPre" title="Your district number">' + (did + 1) + '</span><select id="stPhon" aria-label="Phonetic letter">' + PHONETIC.map((p) => '<option' + (p === phon ? ' selected' : '') + '>' + p + '</option>').join('') + '</select><input id="stNum" inputmode="numeric" maxlength="3" placeholder="Unit #" aria-label="Unit number, 1 to 999" value="' + esc(num) + '"></div><p class="stNote">The first number is your district. Pick your phonetic letter and type your unit number (1 to 999).</p>' +
      '<label class="stL">Pick your shift</label><div class="stS">' + SHIFTS.map((s) => '<button type="button" class="' + (s.id === shift ? 'on' : '') + '" data-s="' + s.id + '"><b>' + s.name + '</b><span>' + s.hours + '</span><small>' + s.note + '</small></button>').join('') + '</div>' +
      (S.home == null ? '<label class="stL">Pick your district</label><div class="stD">' + DISTRICTS.map((d) => '<button type="button" class="' + (d.id === did ? 'on' : '') + '" data-d="' + d.id + '" style="--dc:' + d.color + '"><b>' + esc(d.name) + '</b><span>' + esc(d.unit) + '</span></button>').join('') + '</div><p class="stNote">You start locked to this district. Master it to open the next one.</p>' : '<p class="stNote">Your district: <b>' + esc(DISTRICTS[S.home].name) + '</b>. Change districts from the city map once others are open.</p>') +
      '<label class="stL">Today\'s uniform</label><div class="stS stO">' + ['std', 'pt', 'unit'].map((k) => '<button type="button" class="' + (k === (S.outfit || 'std') ? 'on' : '') + '" data-o="' + k + '"><b>' + OUTFITS[k].icon + ' ' + OUTFITS[k].name + '</b><span>' + esc(OUTFITS[k].text) + '</span></button>').join('') + '</div>' +
      '<label class="stL">Pick your specialty unit</label>' + unitCards(unit) +
      
      '<button type="button" class="stGo" id="stGo">Start roll call</button><p class="stFine">Sim training game for FBRTP cadets. Answers come from your Chapter 5 study material.</p></div>';
    const csOk = () => /^[1-9]\d{0,2}$/.test(num);
    const goState = () => { const b = $('stGo'); b.disabled = !unit || !csOk(); b.textContent = !csOk() ? 'Type your unit number' : !unit ? 'Pick a specialty unit' : 'Start roll call'; $('stCsNow').textContent = csNow(); };
    $('stPhon').onchange = (e) => { phon = e.target.value; goState(); };
    $('stNum').oninput = (e) => { num = e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 3); e.target.value = num; goState(); };
    document.querySelectorAll('[data-d]').forEach((b) => b.onclick = () => { did = +b.dataset.d; draw(); });
    document.querySelectorAll('[data-s]').forEach((b) => b.onclick = () => { shift = b.dataset.s; draw(); });
    document.querySelectorAll('.uCard').forEach((b) => b.onclick = () => { unit = b.dataset.u; draw(); });
    document.querySelectorAll('[data-o]').forEach((b) => b.onclick = () => { S.outfit = b.dataset.o; draw(); });
    goState();
    $('stGo').onclick = () => { if (!unit || !csOk()) return; audio(); endAttract(); S.cs = csNow(); S.shift = shift; S.unit = unit; if (S.home == null) { S.home = did; S.unlocked = [did]; } L.saveState(S); $('start').hidden = true; clock = 0; load(S.home != null && S.unlocked.includes(did) ? did : S.home); rollCall(); };
  };
  draw(); $('start').hidden = false;
}
function rollCall() {
  const d = W.D;
  openModal('<div class="sceneHead"><b>ROLL CALL · ' + esc(shiftOf().name.toUpperCase()) + '</b><h2>' + esc(d.name) + '</h2><p>' + esc(d.blurb) + '</p></div><p class="fact">' + U().icon + ' <b>' + esc(unitName(U())) + '.</b> ' + esc(U().perk) + ': ' + esc(U().perkText) + '</p><p class="fact">Focus this shift: ' + d.lessons.map((l) => esc(L.lessonName(l))).join(' · ') + '.</p><ul class="how"><li>Tap the street to walk; tap your patrol car to drive.</li><li>Answer dispatch calls, help citizens with a <b>?</b>, check study points <b>i</b> and anything that looks off <b>!</b>.</li><li>Master every lesson here, then take the District Final Call to open the next district.</li></ul><div class="qAct"><button type="button" id="mDone">Hit the street</button></div>');
  $('mDone').onclick = closeModal;
}

// ---------- boot ----------
function resize() { dpr = Math.min(2, window.devicePixelRatio || 1); cw = innerWidth; ch = innerHeight; cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); cv.style.width = cw + 'px'; cv.style.height = ch + 'px'; if (!S.zoom) cam.z = cw < 600 ? .85 : 1.15; else cam.z = S.zoom; }
addEventListener('resize', resize); resize();
function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; if (W) { if (ATTRACT) attractUpdate(dt, now); else { update(dt, now); smoothOthers(dt); } render(now); } requestAnimationFrame(frame); }
// ---------- the unlock from the study hub ----------
// The hub opens this page with a pass code once the cadet passes a 100-question test at 85% or better.
function hubCheck(s) { let h = 2166136261; const t = s + '|patrol-city'; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); }
function unlocked() {
  const q = new URLSearchParams(location.search), code = q.get('pass');
  if (/[?&]mock\b/.test(location.search)) return true;
  if (code) {
    const [body, sig] = code.split('.');
    try { const d = JSON.parse(decodeURIComponent(escape(atob(body.replace(/-/g, '+').replace(/_/g, '/'))))); if (sig === hubCheck(body) && d.n >= 100 && d.p >= 85) { localStorage.setItem('patrolcity:pass', JSON.stringify(d)); } } catch (e) {}
    q.delete('pass'); try { history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '')); } catch (e) {}
  }
  try { const d = JSON.parse(localStorage.getItem('patrolcity:pass') || 'null'); return !!(d && d.n >= 100 && d.p >= 85); } catch (e) { return false; }
}
function lockedScreen() {
  const hub = 'https://claude.ai/artifact/FCt8dGZe3PWnASYvu2u6iF';
  $('loading').hidden = true; const st = $('start'); st.hidden = false;
  st.innerHTML = '<div class="stBox lockBox"><div class="stBrand"><span class="stBadge">🔒</span><div><b>PATROL CITY</b><small>Learn the job on the street · Chapter 5</small></div></div>' +
    '<h2 class="lockH">Earn your way onto the street</h2><p class="lockP">Patrol City opens from your Chapter 5 study hub once you pass a <b>100-question test with 85% or better</b>. Then tap <b>Play Patrol City</b> in the hub\'s Game Center and you\'re in for good on this device.</p>' +
    '<a class="stGo lockGo" href="' + hub + '">Open the study hub</a><p class="stFine">Already unlocked on another device? Open Patrol City from the hub on this one too.</p></div>';
}

(async function boot() {
  if (!unlocked()) { lockedScreen(); return; }
  $('loading').textContent = 'Loading the city…';
  try { await L.loadBank('../ch5.json'); } catch (e) { $('loading').textContent = 'Could not load the question bank. Check your connection and refresh.'; return; }
  $('loading').hidden = true;
  attractStart(); requestAnimationFrame(frame); if (/[?&]skiptitle\b/.test(location.search)) { S.seenIntro = 1; startScreen(); } else titleScreen();
  try { net = await startNet(onPlayers); if (net && W && !ATTRACT) { if (net.chatOn) net.chatOn(W.did, chatIn); } if (net && W && !ATTRACT) net.join(W.did, S.shift, { cs: S.cs, unit: S.unit, flair: myTokens(), x: P.x, y: P.y, rank: L.rankOf(S.xp).name }); } catch (e) { net = null; }
  if (!net) $('hOn').textContent = 'Offline';
})();
window.__pc = { S, get W() { return W; }, get G() { return G; }, get peds() { return peds; }, P, stepTarget, promotion, endOfWatch, journal, locker, useAbility, get regs() { return regs; }, npcTalk, queueLoot, enterBuilding, exitBuilding, get inside() { return inside; }, get FX() { return FX; }, enterBoat, unitPicker, setClock: (m) => { clock = m; }, get pboat() { return pboat; }, tapAt: (x, y) => { const [ix, iy] = iso(x, y); const r = cv.getBoundingClientRect(); tap(r.left + r.width / 2 + (ix - cam.x) * cam.z, r.top + r.height / 2 + (iy - 20 - cam.y) * cam.z); }, dispatchCall, get call() { return call; }, finalCall, districtBoard, goTo, load, get others() { return others; } };
