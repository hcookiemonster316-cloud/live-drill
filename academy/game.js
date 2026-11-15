// Patrol City: game loop, camera, input, people and traffic, lighting, dispatch, learning scenes and HUD.
import { N, TW, TH, T, CH, iso, unIso, buildDistrict, drawGround, setRes, setSun, RES, drawBuilding, drawProp, car, person, personFast, dog, vehicle, rideArt, CAR_COLORS, shade } from './world.js';
import { DISTRICTS, NPCS, LANDMARKS, CALLS, OBSERVE, SHIFTS, SHIFT_MIN, PHONETIC, QUICK, UNITS, STATS, unitName } from './data.js';
import * as L from './learn.js';
import { startNet } from './net.js';
import { peopleFor } from './npcgen.js';
import { WORLD, LORE, CAST, CHAPTERS, SIDE, MAIN_TITLE } from './story.js';
import { SIDE2, SIDE_CAST, LORE2 } from './sidequests.js';
import { VOICES, ANYONE } from './voices.js';
import { createMiniGames } from './minigames.js';
import { installLife } from './life.js';
import { installOffDuty } from './offduty.js';
import { installAcademy } from './academy.js';
import { installEvents } from './events.js';
SIDE2.forEach((q) => { if (!SIDE.some((o) => o.id === q.id)) SIDE.push(q); }); LORE2.forEach((e) => { if (!LORE.some((o) => o.id === e.id)) LORE.push(e); });
import { createMusic } from './music.js';
import { createScore } from './score.js';
import { BRANCHES, SKILLS, skillById, skillPoints, canLearn } from './skills.js';
import { ITEMS, RARITY, SLOTS, OUTFITS, itemById, slotOf, roll, reveal, collectionHTML, equipHTML, itemCardHTML, gearTotals, looks } from './items.js';
import { ENTER, buildInterior, drawFurn, staffDraw, visitorDraw, STAFF_LINES } from './interiors.js';

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const S = L.loadState();
S.gear = S.gear || {}; S.outfit = OUTFITS[S.outfit] ? S.outfit : 'std'; if (S.flair) { delete S.flair; } if (S.items && S.items.vest && !S.gear.uniform) S.gear.uniform = 'vest';
const cv = $('view'), ctx = cv.getContext('2d');
const DRS = { k: 1, ts: [], at: 0, refresh: 16.7, hz: 0 }; // dynamic resolution state (see drsTick)
// measure the screen's refresh rate once, right away, while almost nothing is drawing (a 120 Hz phone shows ~8.3 ms frames)
{ let n = 0, prev = 0; const d = []; const f = (t) => { if (prev) d.push(t - prev); prev = t; if (++n < 45) requestAnimationFrame(f); else { d.sort((a, b) => a - b); DRS.hz = Math.max(6.5, Math.min(17.5, d[Math.floor(d.length * .25)] || 16.7)); } }; requestAnimationFrame(f); }
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
function beep(f, d, type, v, when) { if (!S.sound) return; const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = type || 'square'; o.frequency.value = f; const vv = (v || .04) * (S.cfg ? S.cfg.sfx : 1); o.connect(g); g.connect(a.destination); const t = a.currentTime + (when || 0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vv, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + Math.max(.03, d)); o.start(t); o.stop(t + d + .03); }
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
let SUN = null, SPR_LIT = 1, lampT = 0;
// building sprites are drawn the first time they come on screen and dropped again when long unseen
function buildSprites() {
  const h = hourNow(); NIGHT = isNight(h); SUN = sunFor(h); setSun(inside ? 0 : SUN.len); SPR_LIT = !NIGHT ? 0 : h >= 18 && h < 23 ? 1.5 : h >= 23 || h < 2 ? 1 : .5; lampsUpdate(h);
  SPR = W.buildings.map((b) => { const A = iso(b.x, b.y), Bp = iso(b.x + b.w, b.y), C = iso(b.x + b.w, b.y + b.d), Dp = iso(b.x, b.y + b.d), ex = b.dome ? 60 : 30;
    return { b, depth: b.x + b.w - 1 + b.y + b.d - 1 + .9, bx: Dp[0] - 6, by: A[1] - b.h - ex, bw: Bp[0] - Dp[0] + 80, bh: C[1] - A[1] + b.h + ex + 40, canvas: null, lights: [] }; });
}
// when the hour changes the light changes: sprites are marked stale and redrawn a few per frame, still showing the old drawing until then
let RELIT = 0;
function relightSprites() { const h = hourNow(); NIGHT = isNight(h); SUN = sunFor(h); setSun(inside ? 0 : SUN.len); SPR_LIT = !NIGHT ? 0 : h >= 18 && h < 23 ? 1.5 : h >= 23 || h < 2 ? 1 : .5; lampsUpdate(h); SPR.forEach((s) => { if (s.canvas) s.stale = 1; }); }
function spriteOf(s) { if (!s.canvas || (s.stale && RELIT < 3)) { if (s.canvas) RELIT++; s.stale = 0; Object.assign(s, drawBuilding(s.b, NIGHT ? SPR_LIT : false, SUN)); } s.used = performance.now(); return s; }
// never drop a building that was on screen in the last second (dropping visible ones made them flash in and out)
function trimSprites() { const live = SPR.filter((s) => s.canvas), t = performance.now(), recent = live.filter((s) => t - s.used < 1000).length, cap = Math.max(recent + 12, Math.round(120 / Math.max(1, RES * RES * .6))); if (live.length < cap + 20) return; live.filter((s) => t - s.used >= 1000).sort((a, b) => a.used - b.used).slice(0, live.length - cap).forEach((s) => { s.canvas = null; s.lights = []; }); }
// street lights come on one by one at dusk and go off one by one at dawn; each has its own photocell
function lampsUpdate(h) { if (!W || !W.props) return; if (h == null) h = hourNow(); W.props.forEach((p) => { if (p.t !== 'lamp') return; const k = ((p.x * 7.13 + p.y * 3.71) % 1 + 1) % 1; p.on = inside ? true : (h >= 18.1 + k * .9 || h < 5.7 + k * .7); }); }
function focus() { return ATTRACT || !P ? unIso(cam.x, cam.y) : [P.x, P.y]; }
// ground chunks around the camera
function groundDraw(z) {
  if (G.canvas) { ctx.drawImage(G.canvas, -G.ox, -G.oy, G.canvas.lw || G.canvas.width, G.canvas.lh || G.canvas.height); return; }
  const hw = cv.width / 2 / z + 80, hh = cv.height / 2 / z + 80, pts = [unIso(cam.x - hw, cam.y - hh), unIso(cam.x + hw, cam.y - hh), unIso(cam.x - hw, cam.y + hh), unIso(cam.x + hw, cam.y + hh)];
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), M = Math.ceil(N / CH) - 1, cx0 = Math.max(0, Math.floor(Math.min(...xs) / CH)), cx1 = Math.min(M, Math.floor(Math.max(...xs) / CH)), cy0 = Math.max(0, Math.floor(Math.min(...ys) / CH)), cy1 = Math.min(M, Math.floor(Math.max(...ys) / CH));
  let made = 0; const now = performance.now();
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
    const k = cx + ',' + cy; let c = G.chunks.get(k);
    if (!c) { if (made >= 1 && G.chunks.size > 4) { G.miss = 1; continue; } c = drawGround(W, cx, cy); G.chunks.set(k, c); made++; }
    c.used = now; ctx.drawImage(c.canvas, -c.ox, -c.oy, c.canvas.lw, c.canvas.lh);
  }
  // with time to spare, prepare one chunk just outside the view so walking and driving stay smooth
  if (!made) { const M2 = Math.ceil(N / CH) - 1; outer: for (let cy = Math.max(0, cy0 - 1); cy <= Math.min(M2, cy1 + 1); cy++) for (let cx = Math.max(0, cx0 - 1); cx <= Math.min(M2, cx1 + 1); cx++) { const k = cx + ',' + cy; if (!G.chunks.has(k)) { const c2 = drawGround(W, cx, cy); c2.used = now; G.chunks.set(k, c2); break outer; } } }
  // keep everything on screen (plus a margin); only chunks that have been off screen for a while are dropped
  const vis = (cx1 - cx0 + 1) * (cy1 - cy0 + 1), cap = Math.max(vis + 10, Math.round(52 / Math.pow(Math.min(2, RES), 2))); if (G.chunks.size > cap + 6) [...G.chunks.entries()].filter((e) => now - e[1].used > 1500).sort((a, b) => a[1].used - b[1].used).slice(0, G.chunks.size - cap).forEach(([k]) => G.chunks.delete(k));
}

let sprHour = -1;
function load(did) {
  refreshGear();
  inside = null; if (net && net.inside) net.inside(-1);
  W = buildDistrict(did); G = { chunks: new Map() }; buildSprites(); sprHour = Math.floor(hourNow());
  P.x = W.spawn[0] + .5; P.y = W.spawn[1] + .5; P.path = []; P.inCar = false;
  pcar = W.carSpot ? { x: W.carSpot[0], y: W.carSpot[1], dir: 0, bar: false } : null; setTimeout(() => { LIFE.setup(); OFF.setup(); ACAD.setup(); EVT.setup(); }, 0);
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
  exploreInit(); liveInit(); placeRegulars(); ambienceInit(); SS = { rp: 0, calls: 0, right: 0, answered: 0, ords: {} }; COMBO = 0; bestCombo = 0; ordersInit(); comboHud(); abilitiesInit(); $('hExp').textContent = 'Explored ' + Math.floor(exCount / exTotal * 100) + '%';
  cam.x = iso(P.x, P.y)[0]; cam.y = iso(P.x, P.y)[1]; cam.free = false;
  hud(); radio('Dispatch', 'All units, ' + shiftOf().name.toLowerCase() + ' in ' + W.D.name + ' is on. ' + S.cs + ', you are in service.');
  CHAT.list = []; CHAT.seen = new Set(); if (net && net.chatOn) net.chatOn(did, chatIn); if (MG) MG.watch(did);
  if (net) Promise.resolve(net.join(did, S.shift, { cs: S.cs, unit: S.unit, flair: myTokens(), x: P.x, y: P.y, rank: L.rankOf(S.xp).name })).then(commsJoin).catch(() => {});
}
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const SKIN = ['#f1c9a5', '#e0b48f', '#c68e63', '#a26a42', '#7a4b2a', '#5a3620'], SHIRT = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#ecf0f1', '#16a085', '#d35400', '#7f8c8d', '#f5b7b1'], HAIR = ['#2b1d14', '#4a3020', '#8a5a2b', '#d8b46a', '#1a1a1a', '#9a9a9a'];
function nearTile(list, r) { const c = focus(); for (let k = 0; k < 60; k++) { const t = list[Math.floor(Math.random() * list.length)]; if (t && Math.hypot(t[0] - c[0], t[1] - c[1]) < r) return t; } return list[Math.floor(Math.random() * list.length)]; }
function newPed() { const s = nearTile(W.walk, 22); return { top: FX && FX.cold ? (Math.random() < .5 ? 'jacket' : 'hoodie') : undefined, x: s[0] + .5, y: s[1] + .5, path: [], wait: Math.random() * 3, sp: 1.1 + Math.random() * .7, skin: rnd(SKIN), shirt: rnd(SHIRT), hair: rnd(HAIR), pants: rnd(['#3b4a5c', '#2c3e50', '#5d4037', '#455a64', '#1c1c1c']), ph: Math.random() * 9, face: 1 }; }
function newCar() { const roads = [], c0 = focus(); for (let i = 0; i < 120; i++) { const x = Math.floor(c0[0] + (Math.random() - .5) * 44), y = Math.floor(c0[1] + (Math.random() - .5) * 44); if (roadPass(x, y)) { roads.push([x, y]); break; } } const s = roads[0] || [0, 0]; return { x: s[0] + .5, y: s[1] + .5, path: [], sp: 2.6 + Math.random() * 1.6, color: rnd(CAR_COLORS), dir: 0 }; }
function newCitizen() { const s = nearTile(W.walk, 26); return { x: s[0] + .5, y: s[1] + .5, skin: rnd(SKIN), shirt: rnd(SHIRT), hair: rnd(HAIR), ph: Math.random() * 9, face: -1, les: rnd(W.D.lessons) }; }
function newObserve() { const did = W.did, ls = W.D.lessons.filter((l) => OBSERVE[l]); const les = rnd(ls.length ? ls : W.D.lessons); const o = rnd(OBSERVE[les] || [['Something looks out of place', 'door']]); const s = nearTile(W.walk, 30); return { x: s[0] + .5, y: s[1] + .5, les, text: o[0], kind: o[1], seen: false, t0: performance.now() }; void did; }

// ---------- dispatch ----------
function dispatchCall() {
  const fav = U().fav.filter((l) => W.D.lessons.indexOf(l) >= 0 && !L.mastery(S, l).done), les = fav.length && Math.random() < .3 ? fav[Math.floor(Math.random() * fav.length)] : L.weakest(S, W.did), list = CALLS[les] || [['Assist a citizen', 3, 'any', 'Citizen flagging down an officer.']], c = EVT.stormCall() || rnd(list);
  const lot = c[2] !== 'any' && W.lots.filter((l) => l.kind === c[2] || (c[2] === 'parking' && (l.kind === 'parking' || l.kind === 'lot'))).sort((a, b) => Math.hypot(a.door[0] - P.x, a.door[1] - P.y) - Math.hypot(b.door[0] - P.x, b.door[1] - P.y))[0];
  const pk = c[2] === 'parking' && !lot && W.parking.length ? (() => { const near = W.parking.filter((t) => Math.hypot(t[0] - P.x, t[1] - P.y) < 30); return rnd(near.length ? near : W.parking); })() : null;
  const spot = lot ? lot.door : pk || nearTile(W.walk, 28), where = lot ? (lot.name || (LANDMARKS[lot.kind] || {}).name || 'the ' + lot.kind) : pk ? 'the parking lot at ' + ((W.lots.find((l) => !l.sub && pk[0] > l.ox && pk[0] < l.ox + 8 && pk[1] > l.oy && pk[1] < l.oy + 9) || {}).name || 'a business') : 'block ' + (100 + spot[1] * 10) + ' ' + ['Main St', 'Bay St', 'Oak Ave', 'Pine St', 'Harbor Rd'][spot[0] % 5];
  call = { les, title: c[0], prio: c[1], text: c[3], x: spot[0] + .5, y: spot[1] + .5, where, t0: clock, accepted: false, backup: false };
  if (c[1] === 1) shake(5, .5); radio('Dispatch', S.cs + ', ' + (c[1] === 1 ? 'priority one, ' : '') + c[0].toLowerCase() + ' at ' + where + '. ' + c[3]); chirp(); callCard();
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
// flood out from where you are and find the reachable tile closest to the goal
function reachClosest(sx, sy, tx, ty, pass) {
  sx = Math.floor(sx); sy = Math.floor(sy); const seen = new Uint8Array(N * N), q = [sy * N + sx]; seen[q[0]] = 1; let best = null, bd = 1e9, h = 0;
  while (h < q.length && h < 25000) { const k = q[h++], x = k % N, y = (k - x) / N, d = Math.hypot(x + .5 - tx, y + .5 - ty); if (d < bd) { bd = d; best = [x, y]; }
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b; if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue; const nk = ny * N + nx; if (seen[nk] || !pass(nx, ny)) continue; seen[nk] = 1; q.push(nk); } }
  return best && (best[0] !== sx || best[1] !== sy) ? [best[0] + .5, best[1] + .5] : null;
}
function goTo(x, y, onArrive) {
  const pass = P.boat ? (a, b) => W.at(a, b) === T.WATER : P.inCar ? ridePass() : (a, b) => W.walkable(a, b) && !gateBlock(a, b) && W.at(a, b) !== T.WATER;
  let p = astar(P.x, P.y, x, y, pass, !P.inCar || !DRIVES()), short = false;
  if (!p) { const c = reachClosest(P.x, P.y, x, y, pass); if (c) { p = astar(P.x, P.y, c[0], c[1], pass, !P.inCar); short = !!p && Math.hypot(c[0] - x, c[1] - y) > 1.5; } }
  if (!p) { toast('No way through from here.'); return; }
  if (p.length) { const e = p[p.length - 1]; short = Math.hypot(e[0] - x, e[1] - y) > 1.8; }
  if (short) { const done = onArrive; onArrive = () => { toast(P.inCar ? 'This is as close as the car gets. Hop out and walk the rest.' : P.boat ? 'This is as close as the boat gets.' : 'This is as close as you can get.'); if (done) done(); }; }
  P.path = p; P.onArrive = onArrive || null; cam.free = false;
}
function gateBlock(x, y) { return W.gates.some((g) => !S.unlocked.includes(g.to) && Math.abs(g.x - x) <= 1 && Math.abs(g.y - y) <= 1 && false); }
function stepAlong(e, dt, sp) {
  if (!e.path.length) { e.moving = false; return true; }
  const [tx, ty] = e.path[0], dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy), m = sp * dt;
  if (Math.abs(dx - dy) > .01) e.face = dx - dy > 0 ? 1 : -1; e.back = dx + dy < -.01; e.stride = (e.stride || 0) + Math.min(m, d);
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
  { const hr = Math.floor(hourNow()); if (hr !== sprHour) { sprHour = hr; const was = NIGHT; relightSprites(); if (was !== NIGHT && NIGHT && !inside) LIFE.nightLamps(); if (was !== NIGHT) radio('Dispatch', NIGHT ? 'All units, sunset. Lights on.' : 'All units, sunrise.'); } }
  const st = ST(), sp = P.boat ? 8 * (1 + gp('drive') / 100) : P.inCar ? (call && call.accepted ? 6.6 : 4.8) * U().ride.speed * (.88 + st.res * .06) * (1 + gp('drive') / 100) * LIFE.carMult() * RIDES[RIDE()].sp : (2.9 + st.res * .2) * (1 + gp('speed') / 100); const spB = sp * (clock < BUFF.speedTo ? (BUFF.speedMul || 1.25) : 1);
  if (P.path.length) { const done = stepAlong(P, dt, spB); if (done && P.onArrive) { const f = P.onArrive; P.onArrive = null; f(); } }
  else P.moving = false;
  if (P.inCar && pcar) { pcar.x = P.x; pcar.y = P.y; pcar.dir = P.dir; pcar.bar = !!(call && call.accepted); }
  if (P.boat && pboat) { pboat.x = P.x; pboat.y = P.y; pboat.dir = P.dir; }
  if (S.unit === 'k9' && !P.inCar && !P.boat) { const tx = P.x - (P.face > 0 ? .7 : -.7) * .7, ty = P.y + .55, d = Math.hypot(tx - K9.x, ty - K9.y); K9.moving = d > .08; if (d > 6) { K9.x = tx; K9.y = ty; } else { K9.x += (tx - K9.x) * Math.min(1, dt * 4); K9.y += (ty - K9.y) * Math.min(1, dt * 4); } K9.face = P.face; }
  if (!cam.free) { const [ix, iy] = iso(P.x, P.y); cam.x += (ix - cam.x) * Math.min(1, dt * 6); cam.y += (iy - 22 - cam.y) * Math.min(1, dt * 6); }
  { const f = focus(); peds.forEach((p, k) => { if (Math.hypot(p.x - f[0], p.y - f[1]) > 30) peds[k] = newPed(); }); traffic.forEach((c, k) => { if (Math.hypot(c.x - f[0], c.y - f[1]) > 34) traffic[k] = newCar(); }); }
  peds.forEach((p) => { if (p.wait > 0) { p.wait -= dt; p.moving = false; return; } if (!p.path.length) { const t = nearTile(W.walk, 24); const path = Math.hypot(t[0] - p.x, t[1] - p.y) < 16 ? astar(p.x, p.y, t[0], t[1], pedPass, true) : null; if (path) p.path = path; else p.wait = 1; return; } if (stepAlong(p, dt, p.sp)) p.wait = 1 + Math.random() * 4; });
  traffic.forEach((c) => { if (c.stopped) return; if (!c.path.length) { for (let k = 0; k < 6; k++) { const x = Math.floor(c.x + (Math.random() - .5) * 40), y = Math.floor(c.y + (Math.random() - .5) * 40); if (roadPass(x, y)) { const p = astar(c.x, c.y, x, y, roadPass, false); if (p && p.length > 3) { c.path = p; break; } } } return; } stepAlong(c, dt, c.sp); });
  // arrive on a call
  if (call && !inside && Math.hypot(call.x - P.x, call.y - P.y) < 1.7 && !scene) { const c = call; call = null; callCard(); openCallScene(c); }
  if (!call && !scene && !S.x6 && !S.offDuty) { nextCall -= dt; if (nextCall <= 0) dispatchCall(); }
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
  LIFE.update(dt); OFF.tick(dt); ACAD.tick(dt); EVT.dailyTick(dt); storyUpdate(dt); objectiveHud(); trackerHud(dt); trailUpdate(dt); loreCheck(dt); tipsUpdate(dt); musicUpdate(dt); trophyCheck(dt); squadTick(dt); factWatch(); lampT -= dt; if (lampT <= 0) { lampT = 4; lampsUpdate(); }
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
  let fresh = 0; RELIT = 0; SPR.forEach((s) => { if (s.bx + s.bw > vx0 && s.bx < vx1 && s.by + s.bh > vy0 && s.by < vy1) { if (!s.canvas) { if (fresh > 6) return; fresh++; } spriteOf(s);
    const b = s.b, near = !ATTRACT && s.depth > pd && P.x < b.x + b.w + 2.5 && P.y < b.y + b.d + 2.5 && P.x > b.x - 3 && P.y > b.y - 3,
      cover = !ATTRACT && s.depth > pd && pix > s.x + 6 && pix < s.x + s.canvas.lw - 6 && piy - 30 > s.y + 10 && piy - 6 < s.y + s.canvas.lh;
    const target = near || cover ? .3 : 1; s.al = s.al == null ? 1 : s.al + (target - s.al) * .18;
    list.push({ d: s.depth, f: () => { if (s.al < .98) { ctx.globalAlpha = s.al; ctx.drawImage(s.canvas, s.x, s.y, s.canvas.lw, s.canvas.lh); ctx.globalAlpha = 1; } else ctx.drawImage(s.canvas, s.x, s.y, s.canvas.lw, s.canvas.lh); } }); } });
  W.props.forEach((p) => { const [sx, sy] = iso(p.x, p.y); if (vis(sx, sy)) list.push({ d: p.x + p.y, f: p.t === 'furn' ? () => { const fade = p.wall && !p.front && p.x > P.x - .3 && p.y > P.y - .3 && (p.x + p.y) - (P.x + P.y) < 4.5; if (fade) ctx.globalAlpha = .28; drawFurn(ctx, p, sx, sy, now, W.wallCol); ctx.globalAlpha = 1; } : () => drawProp(ctx, p, sx, sy, now, NIGHT) }); });
  if (inside) { W.staff.forEach((st) => { list.push({ d: st.x + st.y, f: () => { staffDraw(ctx, st, now); if (st.npc) { const [sx, sy] = iso(st.x, st.y); if (Math.hypot(st.x - P.x, st.y - P.y) < 6) label(sx, sy - 48, st.npc.icon + ' ' + st.npc.name, '#fde68a'); if (!talkedNow[st.npc.id]) bubble(sx, sy - 66, '💬', '#fde68a', now); } } }); }); W.visitors.forEach((v) => { list.push({ d: v.x + v.y, f: () => visitorDraw(ctx, v, now) }); }); }
  else { doorMarks(list, vis, now); regsDraw(list, vis, now); }
  // locked gates get a barricade
  W.gates.forEach((g) => { const [sx, sy] = iso(g.x + .5, g.y + 1); if (!vis(sx, sy)) return; const open = S.unlocked.includes(g.to); list.push({ d: g.x + g.y + 1.5, f: () => gateArt(sx, sy, open, g, now) }); });
  peds.forEach((p) => { const [sx, sy] = iso(p.x, p.y); if (vis(sx, sy)) list.push({ d: p.x + p.y, f: () => personFast(ctx, sx, sy, p, now, p._pk || (p._pk = 'p' + p.ph + (p.shirt || '') + (p.skin || '') + (p.kit ? JSON.stringify(p.kit) : ''))) }); });
  citizens.forEach((p) => { const [sx, sy] = iso(p.x, p.y); if (vis(sx, sy)) list.push({ d: p.x + p.y, f: () => { person(ctx, sx, sy, p, now); bubble(sx, sy - 46, '?', '#f5b800', now); } }); });
  traffic.forEach((c) => { const off = laneOff(c), [sx, sy] = iso(c.x + off[0], c.y + off[1]); if (vis(sx, sy)) list.push({ d: c.x + c.y, f: () => car(ctx, sx, sy, c.dir, c.color, false, now, NIGHT, 1) }); });
  if (!inside && !ATTRACT) LIFE.drawKid(list, vis, now);
  if (pcar && !P.inCar) { const [sx, sy] = iso(pcar.x, pcar.y); list.push({ d: pcar.x + pcar.y, f: () => { if (RIDE() !== 'car') rideArt(ctx, sx, sy, pcar.dir || 0, RIDE(), now, false, RIDE() === 'horse' ? () => {} : () => {}, false); else vehicle(ctx, sx, sy, pcar.dir, LIFE.ride(U().ride), now, NIGHT, false); if (Math.hypot(pcar.x - P.x, pcar.y - P.y) < 5) label(sx, sy - 40, RIDE() === 'car' ? 'Your ' + U().ride.label.toLowerCase() : 'Your ' + RIDES[RIDE()].name.toLowerCase(), '#f5b800'); } }); }
  if (pboat && !P.boat) { const [sx, sy] = iso(pboat.x, pboat.y); list.push({ d: pboat.x + pboat.y, f: () => { vehicle(ctx, sx, sy, pboat.dir, { kind: 'boat' }, now, NIGHT, false); if (Math.hypot(pboat.x - P.x, pboat.y - P.y) < 6) label(sx, sy - 30, 'Patrol boat', '#7dd3fc'); } }); }
  if (S.unit === 'k9' && !P.inCar && !P.boat) { const [sx, sy] = iso(K9.x, K9.y); list.push({ d: K9.x + K9.y, f: () => dog(ctx, sx, sy, K9.face, K9.moving, now) }); }
  Object.keys(others).forEach((k) => { const o = others[k]; if ((o.n == null ? -1 : o.n) !== (inside ? inside.idx : -1)) return; const [sx, sy] = iso(o.rx, o.ry); if (!vis(sx, sy)) return; list.push({ d: o.rx + o.ry, f: () => { const ou = unitOf(o.u); if (o.v) vehicle(ctx, sx, sy, o.d || 0, o.v === 2 ? { kind: 'boat' } : ou.ride, now, NIGHT, o.st === 'call'); else { const ck = (o.f || '') + '|' + o.u; if (o._ck !== ck) { const tk = String(o.f || 'ostd').split(','), of = (tk.find((t) => /^o(std|pt|unit)$/.test(t)) || 'ostd').slice(1), lk = looks(tk); o._ck = ck; o._kit = kitWith(kitOf(of, o.u), o.f ? lk : {}); o._fl = Object.assign({}, outfitLook(of), lk); o._po = { kit: o._kit, s: 1 }; }
      const po = o._po; po.moving = o.moving; po.face = o.face || 1; po.back = o.back; po.stride = o.stride; po.skin = o.skin; personFast(ctx, sx, sy, po, now, 'o' + ck + (o.skin || '')); if (o.u === 'k9') dog(ctx, sx - 14, sy + 6, 1, o.moving, now); if (cam.z > .6 || DRAWN_OTHERS < 25) flair(o._fl, sx, sy, now, 1); } const mate = S.squad && o.g === S.squad.code; if (mate) { ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(sx, sy, 15, 7.5, 0, 0, Math.PI * 2); ctx.stroke(); } if (mate || o.nearRank < (innerWidth < 700 ? 10 : 18)) label(sx, sy - (o.v ? 40 : 50), (o.k ? '[' + o.k + '] ' : '') + ou.icon + ' ' + o.c + (o.sh && o.sh !== S.shift ? ' · ' + ({ day: 'Day', mid: 'Mid', night: 'Night' }[o.sh] || '') : ''), '#9cc3ff'); if (!(mate || o.nearRank < 8)) { /* bubbles only for the closest few */ } else if (o.say && performance.now() - o.sayAt < 7000) speech(sx, sy - (o.v ? 52 : 68), o.say.length > 34 ? o.say.slice(0, 32) + '…' : o.say); else if (o.q && now - o.qAt < 6000) speech(sx, sy - (o.v ? 52 : 68), QUICK[o.q.k] || ''); } }); });
  if (!ATTRACT) { const [sx, sy] = iso(P.x, P.y); list.push({ d: P.x + P.y, f: () => { if (P.boat) vehicle(ctx, sx, sy, P.dir, { kind: 'boat' }, now, NIGHT, call && call.accepted); else if (P.inCar && RIDE() !== 'car') rideArt(ctx, sx, sy, P.dir || 0, RIDE(), now, !!(P.path && P.path.length), riderFn(now), (call && call.accepted) || STOPLIGHTS); else if (P.inCar) vehicle(ctx, sx, sy, P.dir, LIFE.ride(U().ride), now, NIGHT, (call && call.accepted) || STOPLIGHTS); else person(ctx, sx, sy, { kit: kitWith(myKit(), myLooks()), moving: P.moving, face: P.face, back: P.back, stride: P.stride, glance: false, skin: S.skin || '#c68e63', s: 1.08 }, now); } }); }
  liveDraw(list, vis, now); if (!ATTRACT) storyCast(list, vis, now);
  ambienceGround(); vfxGround(now, vis); if (!ATTRACT) trailDraw(now);
  list.sort((a, b) => a.d - b.d).forEach((e) => e.f());
  ambienceWorld(now); sirenWash(now);
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
    const hole = (ix, iy, r, k) => { const [x, y] = toS(ix, iy), rr = r * z * s; if (x < -rr || y < -rr || x > lc.width + rr || y > lc.height + rr) return; lx.globalAlpha = k; lx.drawImage(radSprite('#000'), x - rr, y - rr, rr * 2, rr * 2); lx.globalAlpha = 1; };
    W.props.forEach((p) => { if (p.t === 'lamp' && p.on) { const [ix, iy] = iso(p.x, p.y); hole(ix + 10, iy - 6, 92, .85); } if (p.t === 'canopy') { const [ix, iy] = iso(p.x, p.y); hole(ix, iy, 110, .9); } if (p.t === 'mast') { const [ix, iy] = iso(p.x, p.y); hole(ix, iy - 200, 16, .9); } });
    SPR.forEach((sp) => { if (sp.canvas) sp.lights.forEach((q) => hole(q[0], q[1], 34, .55)); }); trimSprites();
    traffic.forEach((c) => { const off = laneOff(c), [ix, iy] = iso(c.x + off[0], c.y + off[1]), f = [[1, .5], [-1, .5], [-1, -.5], [1, -.5]][c.dir]; hole(ix + f[0] * 34, iy + f[1] * 34, 56, .7); });
    { const [ix, iy] = iso(P.x, P.y); hole(ix, iy - 10, (P.inCar || P.boat ? 120 : 96) * BUFF.light * (1 + gp('light') / 100), .8); }
    Object.keys(others).forEach((k) => { const o = others[k]; if (o.nearRank > 24) return; const [ix, iy] = iso(o.rx, o.ry); hole(ix, iy - 10, 70, .6); });
    const marks = markerPoints(); marks.forEach((m) => hole(m[0], m[1], 50, .7));
    FX.events.forEach((e) => { const [ix, iy] = iso(e.x, e.y); hole(ix, iy - 10, 70, .7); });
    ctx.drawImage(lc, 0, 0, cv.width, cv.height);
    // additive glows
    ctx.globalCompositeOperation = 'lighter';
    const glow = (ix, iy, r, col) => { const x = cv.width / 2 + (ix - cam.x) * z, y = cv.height / 2 + (iy - cam.y) * z, rr = r * z; if (x < -rr || y < -rr || x > cv.width + rr || y > cv.height + rr) return; ctx.drawImage(radSprite(col), x - rr, y - rr, rr * 2, rr * 2); };
    W.props.forEach((p) => { if (p.t === 'lamp' && p.on) { const [ix, iy] = iso(p.x, p.y); glow(ix + 10, iy - 37, 18, 'rgba(255,220,150,.55)'); glow(ix + 10, iy - 37, 46, 'rgba(255,200,120,.12)'); glow(ix + 10, iy - 2, 40, 'rgba(255,190,110,.10)'); } });
    // lit windows and signs spill a little warm light; cars show headlights and taillights
    SPR.forEach((sp) => { if (sp.canvas) sp.lights.forEach((q, k) => { if (k % 2 === 0) glow(q[0], q[1], 16, 'rgba(255,214,140,.10)'); }); });
    if (dk.a > .3) { const beam = (sx, sy, dir) => { const f = [[1, .5], [-1, .5], [-1, -.5], [1, -.5]][dir & 3], x0 = sx + f[0] * 14, y0 = sy + f[1] * 14 - 4, x1 = sx + f[0] * 120, y1 = sy + f[1] * 120, nx = -f[1] * 34, ny = f[0] * 34, X = (v) => cv.width / 2 + (v - cam.x) * z, Yy = (v) => cv.height / 2 + (v - cam.y) * z; const bg = ctx.createLinearGradient(X(x0), Yy(y0), X(x1), Yy(y1)); bg.addColorStop(0, 'rgba(255,245,215,.22)'); bg.addColorStop(1, 'rgba(255,245,215,0)'); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(X(x0 - nx * .15), Yy(y0 - ny * .15)); ctx.lineTo(X(x1 - nx), Yy(y1 - ny)); ctx.lineTo(X(x1 + nx), Yy(y1 + ny)); ctx.lineTo(X(x0 + nx * .15), Yy(y0 + ny * .15)); ctx.closePath(); ctx.fill(); };
      traffic.forEach((c) => { const off = laneOff(c), [ix, iy] = iso(c.x + off[0], c.y + off[1]); beam(ix, iy, c.dir); }); if (P.inCar && !inside) { const [ix, iy] = iso(P.x, P.y); beam(ix, iy, P.dir || 0); } }
    if (dk.a > .3) traffic.forEach((c) => { const off = laneOff(c), [ix, iy] = iso(c.x + off[0], c.y + off[1]), f = [[1, .5], [-1, .5], [-1, -.5], [1, -.5]][c.dir]; glow(ix + f[0] * 22, iy + f[1] * 22 - 6, 26, 'rgba(255,245,210,.20)'); glow(ix - f[0] * 14, iy - f[1] * 14 - 6, 9, 'rgba(255,40,30,.45)'); });
    ambienceGlow(glow, now);
    const bar = (x, y, on) => { const ph = Math.floor(now / 180) % 2; glow(x, y - 22, 46, on ? (ph ? 'rgba(255,40,40,.45)' : 'rgba(40,90,255,.45)') : 'rgba(0,0,0,0)'); };
    if ((P.inCar || P.boat) && call && call.accepted) { const [ix, iy] = iso(P.x, P.y); bar(ix, iy, true); }
    Object.keys(others).forEach((k) => { const o = others[k]; if (o.v && o.st === 'call') { const [ix, iy] = iso(o.rx, o.ry); bar(ix, iy, true); } });
    ctx.globalCompositeOperation = 'source-over';
  }
  grade(); rainDraw(); EVT.drawFog();
  // markers drawn above the lighting so they stay readable
  ctx.setTransform(z, 0, 0, z, cv.width / 2 - cam.x * z, cv.height / 2 - cam.y * z);
  if (!ATTRACT) { guideDraw(now, z); if (!inside) { EVT.draw(now); LIFE.draw(now); OFF.draw(now); ACAD.draw(now); regs.forEach((r) => { if (OFF.arcReady(r.n.id)) { const [sx, sy] = iso(r.x, r.y); bubble(sx, sy - 92, '💛', '#f472b6', now); } }); } storyMarker(now); floatsDraw(now); pingsDraw(now); if (SELF_SAY.text && performance.now() - SELF_SAY.at < 6000) { const [sx, sy] = iso(P.x, P.y); speech(sx, sy - (P.inCar ? 52 : 70), SELF_SAY.text.length > 34 ? SELF_SAY.text.slice(0, 32) + '…' : SELF_SAY.text); } }
  if (call) { const [sx, sy] = iso(call.x, call.y); ring(sx, sy, call.prio === 1 ? '#ff4d4d' : '#f5b800', now); bubble(sx, sy - 40, '📻', call.prio === 1 ? '#ff4d4d' : '#f5b800', now); label(sx, sy - 66, call.title, '#ffffff'); }
  infos.forEach((i) => { const [sx, sy] = iso(i.x, i.y); bubble(sx, sy - 30, 'i', i.cool > 0 ? '#6b7280' : '#3b82f6', now); });
  observes.forEach((o) => { if (!o.seen) return; const [sx, sy] = iso(o.x, o.y); ring(sx, sy, '#a855f7', now); bubble(sx, sy - 30, '!', '#a855f7', now); });
  Object.keys(others).forEach((k) => { const o = others[k]; if (o.b && o.b.t && N0() - o.b.t < 180000) { const [sx, sy] = iso(o.b.x, o.b.y); ring(sx, sy, '#3b82f6', now); bubble(sx, sy - 40, '🚓', '#3b82f6', now); label(sx, sy - 66, 'Backup: ' + o.c, '#9cc3ff'); } });
  if ((MINI_N = (MINI_N + 1) % 3) === 0) drawMini();
}
const N0 = () => (net ? net.now() : Date.now());
// specialty rides: the marked car, a motorcycle, a patrol bicycle and the mounted unit's horse (Judge II)
const RIDES = { car: { name: 'Patrol car', icon: '🚓', sp: 1, need: 'Standard issue', ok: () => true },
  moto: { name: 'Police motorcycle', icon: '🏍️', sp: 1.2, need: 'Make 5 traffic stops', ok: () => st('stops') >= 5 },
  bike: { name: 'Patrol bicycle', icon: '🚲', sp: .85, need: 'Finish 3 PT workouts', ok: () => st('pt') >= 3 },
  horse: { name: 'Judge II (mounted unit)', icon: '🐎', sp: .8, need: 'Find 10 department patches or finish 3 friendship stories', ok: () => st('patches') >= 10 || st('arcs') >= 3 } };
const RIDE = () => (RIDES[S.ride] && RIDES[S.ride].ok() ? S.ride : 'car'), DRIVES = () => RIDE() === 'car' || RIDE() === 'moto';
const ridePass = () => (DRIVES() ? (a, b) => W.drivable(a, b) : (a, b) => W.walkable(a, b) && !gateBlock(a, b) && W.at(a, b) !== T.WATER);
function motorPool() {
  const draw = () => { openModal('<div class="sceneHead"><b>MOTOR POOL</b><h2>Choose your ride</h2><p>Specialty rides unlock as you earn them. Bikes and horses can use sidewalks, parks and plazas.</p></div><div class="rides">' + Object.keys(RIDES).map((k) => { const r = RIDES[k], ok = r.ok(); return '<button type="button" data-rd="' + k + '" class="' + (RIDE() === k ? 'on' : '') + (ok ? '' : ' locked') + '"' + (ok ? '' : ' disabled') + '><span>' + (ok ? r.icon : '🔒') + '</span><b>' + r.name + '</b><small>' + (RIDE() === k ? 'Checked out' : ok ? 'Available' : r.need) + '</small></button>'; }).join('') + '</div><div class="qAct"><button type="button" id="mClose">Done</button></div>');
    $('mClose').onclick = closeModal; document.querySelectorAll('[data-rd]').forEach((b) => b.onclick = () => { if (P.inCar) exitCar(); S.ride = b.dataset.rd; saveS(); stat('ride_' + S.ride); if (pcar && W.carSpot) { pcar.x = W.carSpot[0]; pcar.y = W.carSpot[1]; } hud(); toast(RIDES[S.ride].icon + ' ' + RIDES[S.ride].name + ' checked out. It\'s parked out front.'); draw(); }); };
  draw();
}
const riderFn = (now) => (x, y, o) => person(ctx, x, y, Object.assign({ kit: kitWith(myKit(), myLooks()), skin: S.skin || '#c68e63', glance: false }, o), now);
// community trust, block by block: every choice that builds or costs trust is remembered where it happened
function blockTrust(n) { const lot = inside ? inside.lot : null, x = lot ? lot.ox + 4 : P.x, y = lot ? lot.oy + 4 : P.y, bx = Math.floor((x - 2) / 11), by = Math.floor((y - 2) / 11); if (bx < 0 || by < 0 || bx > 12 || by > 12) return; S.btrust = S.btrust || {}; const d = (S.btrust[W.did] = S.btrust[W.did] || {}), k = bx + ',' + by; d[k] = Math.max(-10, Math.min(10, (d[k] || 0) + n)); stat('trustAct'); }
const TMAP = {};
function trustMap(did) {
  did = did == null ? W.did : did; if (!TMAP[did]) { const Wd = did === W.did && !inside ? W : buildDistrict(did); TMAP[did] = Wd.lots.filter((l) => !l.sub || true).map((l) => ({ bx: Math.floor((l.ox - 2) / 11), by: Math.floor((l.oy - 2) / 11), name: l.name, zone: l.zone, gen: l.gen })); }
  const blocks = {}; TMAP[did].forEach((l) => { const k = l.bx + ',' + l.by; if (!blocks[k] || (!l.gen && blocks[k].gen)) blocks[k] = l; });
  const T2 = (S.btrust || {})[did] || {}, ZC = { core: '#56606f', civic: '#5d5872', commercial: '#6e6048', residential: '#3d4656', industrial: '#4d4a47', rural: '#5f5744', waterfront: '#2b5566' };
  const cells = []; for (let by = 0; by < 13; by++) for (let bx = 0; bx < 13; bx++) { const b = blocks[bx + ',' + by], v = T2[bx + ',' + by] || 0, here = !inside && did === W.did && Math.floor((P.x - 2) / 11) === bx && Math.floor((P.y - 2) / 11) === by;
    cells.push('<button type="button" class="tmCell' + (here ? ' here' : '') + '" style="--z:' + (b ? ZC[b.zone] || '#334155' : '#0c4a6e') + ';--t:' + (v > 0 ? 'rgba(34,197,94,' + (.25 + v / 10 * .65) + ')' : v < 0 ? 'rgba(239,68,68,' + (.25 - v / 10 * .65) + ')' : 'transparent') + '" title="' + esc((b && b.name) || (b ? b.zone : 'River')) + (v ? ' · trust ' + (v > 0 ? '+' : '') + v : '') + '" data-tc="' + esc(((b && b.name) || (b ? b.zone : 'River')) + '|' + v) + '"></button>'); }
  const tabs = DISTRICTS.map((D, d) => S.unlocked.includes(d) ? '<button type="button" data-td="' + d + '" class="' + (d === did ? 'on' : '') + '">' + esc(D.name) + '</button>' : '').join('');
  openModal('<div class="sceneHead"><b>COMMUNITY TRUST</b><h2>' + esc(DISTRICTS[did].name) + '</h2><p>Every block remembers how you treated people there. Green: they trust you. Red: you have work to do. District trust: ' + Math.round(S.trust[did] == null ? 50 : S.trust[did]) + '/100.</p></div><div class="lkTabs">' + tabs + '</div><div class="tmGrid">' + cells.join('') + '</div><div class="tmLeg"><span style="--c:#22c55e">Trusts you</span><span style="--c:#ef4444">Work to do</span>' + Object.keys(ZC).map((z) => '<span style="--c:' + ZC[z] + '">' + z + '</span>').join('') + '</div><p class="lkSum" id="tmInfo">Tap a block to see what people there think of you.</p>' +
    '<div class="qAct"><button type="button" class="ghost" id="tmMini">' + (S.cfg.trustMini ? 'Hide on minimap' : 'Show on minimap') + '</button><button type="button" id="mClose">Close</button></div>');
  $('mClose').onclick = closeModal; $('tmMini').onclick = () => { S.cfg.trustMini = !S.cfg.trustMini; saveS(); trustMap(did); };
  document.querySelectorAll('[data-td]').forEach((b) => b.onclick = () => trustMap(+b.dataset.td));
  document.querySelectorAll('[data-tc]').forEach((b) => b.onclick = () => { const [n, v] = b.dataset.tc.split('|'); $('tmInfo').textContent = n + ': ' + (+v > 0 ? 'trust +' + v + '. People here know you.' : +v < 0 ? 'trust ' + v + '. Rebuild it: listen, explain, follow through.' : 'neutral. Nothing memorable yet, good or bad.'); });
  stat('trustMap');
}
// life in the city: self-initiated work, traffic stops, your patrol car (see life.js)
let STOPLIGHTS = false;
const LIFE = installLife({ S, L, get W() { return W; }, get P() { return P; }, get pcar() { return pcar; }, get inside() { return inside; }, NIGHT: () => NIGHT, traffic: () => traffic, call: () => call, clock: () => clock, rain: () => !!FX.rain,
  dialogue: (...a) => dialogue(...a), sayAs: (...a) => sayAs(...a), award: (...a) => award(...a), stat: (...a) => stat(...a), ord: (...a) => ord(...a), toast: (m) => toast(m), banner: (...a) => banner(...a), beep: (...a) => beep(...a), chirp: () => chirp(), good: () => good(), bad: () => bad(), radio: (...a) => radio(...a),
  saveS: () => saveS(), hud: () => hud(), openModal: (h) => openModal(h), closeModal: () => closeModal(), $: (id) => $(id), esc: (x) => esc(x), iso: (x, y) => iso(x, y), get ctx() { return ctx; }, bubble: (...a) => bubble(...a), label: (...a) => label(...a), person: (...a) => person(...a),
  rideKind: () => RIDE(), motorPool: () => motorPool(), goTo: (...a) => goTo(...a), doorSpot: (l) => doorSpot(l), whereAt: (x, y) => { const n = nearestLotTo(x, y); return n ? 'near ' + n : 'on patrol'; }, lights: (on) => { STOPLIGHTS = on; } });
// off the clock: off-duty mode, leisure, ride-alongs, homes, morale and friendship stories (see offduty.js)
const OFF = installOffDuty({ S, L, get W() { return W; }, get P() { return P; }, get inside() { return inside; }, call: () => call, paused: () => paused || !!scene,
  dialogue: (...a) => dialogue(...a), sayAs: (...a) => sayAs(...a), award: (...a) => award(...a), stat: (...a) => stat(...a), toast: (m) => toast(m), banner: (...a) => banner(...a), beep: (...a) => beep(...a), good: () => good(), bad: () => bad(), radio: (...a) => radio(...a),
  saveS: () => saveS(), hud: () => hud(), openModal: (h) => openModal(h), closeModal: () => closeModal(), $: (id) => $(id), esc: (x) => esc(x), iso: (x, y) => iso(x, y), bubble: (...a) => bubble(...a), label: (...a) => label(...a), doorSpot: (l) => doorSpot(l), queueLoot: (...a) => queueLoot(...a),
  refreshLook: () => { refreshGear(); hud(); }, daily: () => EVT.dailyText(), dailyCard: () => EVT.dailyCard(), clearCall: () => { if (call && !call.accepted) { call = null; callCard(); } }, items: () => ITEMS, trophies: () => { const t = TROPHIES.filter((x) => (S.trophies || {})[x[0]]); return { n: t.length, list: t.map((x) => x[1]) }; } });
// academy life: PT, inspection, class standing (see academy.js)
const ACAD = installAcademy({ S, get W() { return W; }, get P() { return P; }, get inside() { return inside; }, net: () => net, doorSpot: (l) => doorSpot(l), iso: (x, y) => iso(x, y), bubble: (...a) => bubble(...a), label: (...a) => label(...a),
  openModal: (h) => openModal(h), closeModal: () => closeModal(), $: (id) => $(id), esc: (x) => esc(x), dialogue: (...a) => dialogue(...a), sayAs: (...a) => sayAs(...a), award: (...a) => award(...a), stat: (...a) => stat(...a), toast: (m) => toast(m), banner: (...a) => banner(...a), beep: (...a) => beep(...a), saveS: () => saveS(), queueLoot: (...a) => queueLoot(...a),
  mood: (n) => OFF.mood(n), pay: (n, what) => { if ((S.cash || 0) < n) { toast('Not enough cash for ' + what + ' ($' + n + ').'); bad(); return false; } S.cash -= n; saveS(); hud(); return true; } });
// the calendar: weather and seasons, weekly city events, collectibles (see events.js)
const LANDMARK_LIST = (() => { const out = []; DISTRICTS.forEach((D, d) => { const put = (e) => { if (e && e.strip) return e.strip.forEach(put); const nm = Array.isArray(e) ? e[1] : (LANDMARKS[e] || {}).name; if (nm && e !== 'parking') out.push({ k: d + ':' + nm, name: nm }); }; D.lots.forEach(put); }); return out; })();
const EVT = installEvents({ S, L, get W() { return W; }, get P() { return P; }, get inside() { return inside; }, get ctx() { return ctx; }, net: () => net, doorSpot: (l) => doorSpot(l), sayAs: (...a) => sayAs(...a), dialogue: (...a) => dialogue(...a), award: (...a) => award(...a), stat: (...a) => stat(...a),
  toast: (m) => toast(m), banner: (...a) => banner(...a), good: () => good(), beep: (...a) => beep(...a), saveS: () => saveS(), queueLoot: (...a) => queueLoot(...a), openModal: (h) => openModal(h), closeModal: () => closeModal(), $: (id) => $(id), esc: (x) => esc(x),
  iso: (x, y) => iso(x, y), bubble: (...a) => bubble(...a), label: (...a) => label(...a), dname: (d) => DISTRICTS[d].name, allLandmarks: () => LANDMARK_LIST, refreshLook: () => { refreshGear(); hud(); if (net && net.flair) net.flair(myTokens()); } });
// the Rec Room: multiplayer mini games (see minigames.js)
const MG = createMiniGames({ get net() { return net; }, now: () => N0(), esc: (x) => esc(x), S, L, PHON: PHONETIC, beep: (...a) => { if (S.sound) beep(...a); }, toast: (m) => toast(m), saveS: () => saveS(),
  award: (n, why) => award(n, why), stat: (k) => stat(k), cs: () => S.cs, icon: () => U().icon, did: () => W.did, dname: () => W.D.name, lessons: () => W.D.lessons,
  pause: (on) => { paused = on; if (on) { P.path = []; } if (S.sound) music.start(on ? 'title' : moodNow()); },
  get squadPost() { return net && S.squad ? (m) => { try { net.post(net.sqChatPath(S.squad.code), { c: S.cs, m }); } catch (e) {} } : null; } });
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
let MINI_N = 0;
function drawMini() {
  const m = $('mini'); if (!m) return; const g = m.getContext('2d'), s = m.width / N;
  if (!m.base || m.w !== W) { const b = document.createElement('canvas'); b.width = m.width; b.height = m.height; const bg = b.getContext('2d'); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = W.at(x, y); if (!v) continue; bg.fillStyle = v === T.ROAD ? '#515866' : v === T.BLDG ? '#9aa3b0' : v === T.WATER ? '#2d6c97' : v === T.GRASS ? '#3f6b2f' : v === T.LOT ? '#3a3f47' : '#7a756b'; bg.fillRect(x * s, y * s, s + .5, s + .5); } m.base = b; m.w = W; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, m.width, m.height);
  const Z = inside ? 1 : 2.8; g.save(); g.translate(m.width / 2, m.height / 2); g.rotate(Math.PI / 4); g.scale(.72 * Z, .72 * Z); if (inside) g.translate(-m.width / 2, -m.height / 2); else g.translate(-P.x * s, -P.y * s); g.drawImage(m.base, 0, 0);
  const dot = (x, y, c, r) => { g.fillStyle = c; g.beginPath(); g.arc(x * s, y * s, r / Z, 0, Math.PI * 2); g.fill(); };
  if (S.cfg.trustMini && !inside) { const T2 = (S.btrust || {})[W.did] || {}; Object.keys(T2).forEach((k) => { const v = T2[k]; if (!v) return; const [bx, by] = k.split(',').map(Number); g.fillStyle = v > 0 ? 'rgba(34,197,94,' + (.2 + v / 10 * .5) + ')' : 'rgba(239,68,68,' + (.2 - v / 10 * .5) + ')'; g.fillRect((2 + bx * 11) * s, (2 + by * 11) * s, 9 * s, 9 * s); }); }
  if (call) dot(call.x, call.y, call.prio === 1 ? '#ff4d4d' : '#f5b800', 5);
  Object.keys(others).forEach((k) => dot(others[k].rx, others[k].ry, S.squad && others[k].g === S.squad.code ? '#34d399' : '#60a5fa', 3.2));
  infos.forEach((i) => dot(i.x, i.y, '#3b82f6', 2.5)); if (!inside) SIDE.forEach((q) => { if (!sideAvail(q)) return; const r = regs.find((x) => x.n.id === q.giver); if (r) dot(r.x, r.y, '#38bdf8', 3.4); }); citizens.forEach((c) => dot(c.x, c.y, '#f5b800', 2.2));
  if (!inside) { if (!fogC || fogC.did !== W.did) { fogC = document.createElement('canvas'); fogC.width = m.width; fogC.height = m.height; fogC.did = W.did; const fg = fogC.getContext('2d'); fg.fillStyle = 'rgba(6,10,20,.84)'; fg.fillRect(0, 0, m.width, m.height); const str = S.explored[exKey()] || ''; for (let i = 0; i < N * N; i++) if (str[i] === '1') fg.clearRect((i % N) * s, Math.floor(i / N) * s, s + .6, s + .6); } g.drawImage(fogC, 0, 0); W.secrets.forEach((x) => { if (S.found[x.id]) dot(x.x, x.y, '#a78bfa', 3); }); regs.forEach((r) => { if ((S.npc || {})[r.n.id]) dot(r.x, r.y, '#fde68a', 2.6); }); }
  { const t = stepTarget(); if (t && !t.exit) { g.fillStyle = '#f5b800'; g.beginPath(); const q = 1 / Z; g.moveTo(t.x * s, t.y * s - 6 * q); g.lineTo(t.x * s + 5 * q, t.y * s); g.lineTo(t.x * s, t.y * s + 6 * q); g.lineTo(t.x * s - 5 * q, t.y * s); g.closePath(); g.fill(); } }
  { const d = [[1, 0], [0, 1], [-1, 0], [0, -1]][(P.dir || 0) & 3], q = 1 / Z, px = P.x * s, py = P.y * s, L2 = 7 * q, W3 = 4.5 * q, nx = -d[1], ny = d[0]; g.fillStyle = 'rgba(245,184,0,.18)'; g.beginPath(); g.arc(px, py, 11 * q, 0, Math.PI * 2); g.fill(); g.fillStyle = '#f5b800'; g.strokeStyle = '#fff'; g.lineWidth = 1.4 * q; g.beginPath(); g.moveTo(px + d[0] * L2, py + d[1] * L2); g.lineTo(px - d[0] * L2 * .6 + nx * W3, py - d[1] * L2 * .6 + ny * W3); g.lineTo(px - d[0] * L2 * .25, py - d[1] * L2 * .25); g.lineTo(px - d[0] * L2 * .6 - nx * W3, py - d[1] * L2 * .6 - ny * W3); g.closePath(); g.fill(); g.stroke(); }
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
  if (next) { S.mile[exKey()] = next; saveS(); banner('🧭', 'Explorer · ' + next + '% of ' + W.D.name, next === 100 ? 'Every street walked. The district knows your name.' : 'Keep wandering. There is more out there.'); queueLoot('Exploration reward: ' + next + '%', 1, next === 100 ? 'r' : next >= 50 ? 'u' : 'c'); }
}
function liveInit() {
  const h = hourNow(), night = isNight(h), R2 = Math.random;
  FX = { rain: R2() < .25, drops: [], birds: [], events: [], train: null, trainT: 25 + R2() * 30, sail: null, caches: [], disc: {} };
  { const wx = EVT.weather(); FX.rain = wx.rain; FX.storm = wx.storm; FX.wind = wx.wind; FX.cold = wx.cold; if (wx.storm) setTimeout(() => { radio('Dispatch', 'All units, tropical storm conditions in ' + W.D.name + '. Expect trees down, flooding and signals out.'); banner('🌀', 'Tropical storm', 'Heavy rain and wind this shift. Storm calls take priority.'); }, 3000); else if (wx.fog) setTimeout(() => radio('Dispatch', 'Heads up: dense fog this morning. Use your low beams.'), 2600); else if (wx.cold) setTimeout(() => radio('Dispatch', 'Cold snap tonight. Check on anyone sleeping outside.'), 2600); }
  BUFF.speedTo = -1; BUFF.speedMul = 0; BUFF.light = 1; BUFF.wait = 0;
  if (FX.rain && !FX.storm) setTimeout(() => radio('Dispatch', 'All units, rain moving through ' + W.D.name + '. Drive careful.'), 2500);
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
  W.lots.forEach((l) => { if (!l.name) return; const k = W.did + ':' + l.name; if (S.disc[k] || Math.hypot(l.door[0] - P.x, l.door[1] - P.y) > 4.5) return; S.disc[k] = 1; if (l.gen) { saveS(); ord('place'); FLOATS.push({ x: P.x, y: P.y, t: performance.now(), text: l.name, sub: 'new place' }); return; } saveS(); ord('place'); banner('📍', 'Discovered: ' + l.name, (LANDMARKS[l.kind] || {}).note || W.D.name); award(10, 'new place'); });
  if (W.promenade) { const k = W.did + ':prom'; if (!S.disc[k] && Math.hypot(W.promenade.x + 1 - P.x, W.promenade.y + 4 - P.y) < 4) { S.disc[k] = 1; saveS(); banner('📍', 'Discovered: ' + W.promenade.name, 'Walk only. No cars, all vibes.'); award(10, 'new place'); } }
  W.secrets.forEach((x) => { if (S.found[x.id] || P.inCar || Math.hypot(x.x - P.x, x.y - P.y) > 1.9 + gp('secret') * .5) return; S.found[x.id] = 1; saveS(); ord('secret'); banner('🗝️', 'Secret spot: ' + x.name, x.text, true); beep(784, .1, 'triangle', .05); beep(1175, .2, 'triangle', .05, .12); queueLoot('Secret spot: ' + x.name, 1, hasSk('inv4') ? 'r' : 'u'); });
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
  if (FX.rain) { for (let i = 0; i < (FX.storm ? 16 : 6); i++) FX.drops.push({ x: Math.random() * 1.3, y: -.05, v: (FX.storm ? 1.5 : .9) + Math.random() * .5 }); FX.drops.forEach((d) => { d.y += d.v * dt; d.x -= (.12 + (FX.wind || 0) * .6) * dt; }); FX.drops = FX.drops.filter((d) => d.y < 1.05); }
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
const myLooks = () => Object.assign({}, outfitLook(S.outfit), looks(Object.values(S.gear || {})), (!S.offDuty && EVT.gearLook()) || {});
const kitOf = (outfit, unitId) => { const o = OUTFITS[outfit || 'std']; return o && o.kit ? o.kit : unitOf(unitId).kit; };
const myKit = () => (S.offDuty ? { shirt: S.civShirt || '#2563eb', pants: '#334155', hat: 'none', plain: true } : kitOf(S.outfit, S.unit));
const myTokens = () => ['o' + (S.outfit || 'std')].concat(Object.values(S.gear || {})).join(',');
// gear that changes how you look: hats swap the kit's cover; the rest is drawn on top
function kitWith(kit, L) { if (!L.hat && !L.boots && !L.camelbak) return kit; const k = Object.assign({}, kit); if (L.hat && !(k.shorts)) { k.hat = L.hat; k.hatCol = L.hatCol; } if (L.boots) k.boots = L.boots; if (L.camelbak) k.camelbak = true; return k; }
function flair(L, sx, sy, now, s) {
  if (L.twinkle && !L.shine) { const k = (((now + sx * 37) % 3200) + 3200) % 3200 / 3200; if (k < .14) { const a = k / .14, r = (1 - Math.abs(a * 2 - 1)) * 5 * s; ctx.save(); ctx.translate(sx + (a < .5 ? -3 : 3) * s, sy - 1); ctx.fillStyle = '#ffffff'; ctx.globalAlpha = .95; ctx.beginPath(); for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? r * .25 : r; ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); } }
  if (L.shine) for (let k = 0; k < L.shine; k++) { const a = now / 300 + k * 2.1; sparkle(sx + Math.cos(a) * 7 * s, sy - 2 + Math.sin(a * 1.3) * 2, now + k * 200, '#ffffff'); }
  if (L.vest) { ctx.fillStyle = 'rgba(214,255,58,.9)'; ctx.beginPath(); ctx.roundRect(sx - 9 * s, sy - 25 * s, 18 * s, 16 * s, 3 * s); ctx.fill(); ctx.fillStyle = '#c0c0c0'; ctx.fillRect(sx - 9 * s, sy - 17 * s, 18 * s, 2 * s); }
  if (L.cord) { ctx.strokeStyle = L.cord; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(sx - 6 * s, sy - 23 * s); ctx.quadraticCurveTo(sx - 9 * s, sy - 17 * s, sx - 5 * s, sy - 15 * s); ctx.stroke(); }
  if (L.poncho) { ctx.fillStyle = 'rgba(77,94,58,.92)'; ctx.beginPath(); ctx.moveTo(sx, sy - 27 * s); ctx.lineTo(sx + 10 * s, sy - 9 * s); ctx.lineTo(sx - 10 * s, sy - 9 * s); ctx.closePath(); ctx.fill(); }
  if (L.brass) sparkle(sx + 3 * s, sy - 21 * s, now, '#ffe27a');
  if (L.glow) { ctx.fillStyle = 'rgba(245,184,0,' + (.25 + Math.sin(now / 300) * .15) + ')'; ctx.beginPath(); ctx.ellipse(sx, sy - 34 * s, 10 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill(); }
  if (L.clipboard) { ctx.fillStyle = '#8b5a2b'; ctx.fillRect(sx + 6 * s, sy - 20 * s, 7 * s, 9 * s); ctx.fillStyle = '#fff'; ctx.fillRect(sx + 7 * s, sy - 18 * s, 5 * s, 6 * s); ctx.fillStyle = '#9ca3af'; ctx.fillRect(sx + 8 * s, sy - 21 * s, 3 * s, 2 * s); }
}
let FLASH = 0;
function rainDraw() { if (!FX.rain) return; ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!inside) { ctx.strokeStyle = 'rgba(210,225,245,.55)'; ctx.lineWidth = 1 * dpr; for (let i = 0; i < 26; i++) { const k = (performance.now() / 380 + i * .137) % 1, x = ((i * 7919) % 997) / 997 * cv.width, y = (((i * 3571) % 991) / 991 * .85 + .1) * cv.height; ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.ellipse(x, y, (1 + k * 6) * dpr, (.5 + k * 2.4) * dpr, 0, 0, Math.PI * 2); ctx.stroke(); } ctx.globalAlpha = 1; }
  if ((NIGHT || FX.storm) && !inside && !ATTRACT && Math.random() < (FX.storm ? .004 : .0009) && S.cfg.motion) { FLASH = 1; if (S.sound) setTimeout(() => { const a = audio(); if (!a) return; const t = a.currentTime, n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2); n.buffer = b; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180; const gg = a.createGain(); gg.gain.setValueAtTime(.0001, t); gg.gain.exponentialRampToValueAtTime(.35 * S.cfg.sfx, t + .3); gg.gain.exponentialRampToValueAtTime(.0001, t + 2); n.connect(f); f.connect(gg); gg.connect(a.destination); n.start(t); }, 900); }
  if (FLASH > 0) { ctx.fillStyle = 'rgba(220,230,255,' + (FLASH * .35) + ')'; ctx.fillRect(0, 0, cv.width, cv.height); FLASH -= .06; } ctx.fillStyle = 'rgba(30,40,60,.18)'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.strokeStyle = 'rgba(190,210,235,.45)'; ctx.lineWidth = 1.2 * dpr; ctx.beginPath(); FX.drops.forEach((d) => { const x = d.x * cv.width, y = d.y * cv.height; ctx.moveTo(x, y); ctx.lineTo(x - 4 * dpr, y + 14 * dpr); }); ctx.stroke(); }
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
  S.items[item.id] = (S.items[item.id] || 0) + 1; saveS(); paused = true;
  const act = await reveal(item, where, { isNew, canEquip: item.slot && slotOpen(item.slot) && (S.gear || {})[item.slot] !== item.id, lockHint: item.slot && !slotOpen(item.slot) ? 'Goes in your ' + slotOf(item.slot).name + ' slot. ' + slotOf(item.slot).hint + '.' : '', sound: (notes) => { if (!S.sound) return; notes.forEach((f, i) => beep(f, .22 + (i === notes.length - 1 ? .4 : 0), 'triangle', .05, i * .09)); } });
  paused = false; looting = false; useItem(item, act); if (lootQ.length) setTimeout(runLoot, 500);
}
const slotOpen = (sid) => S.xp >= slotOf(sid).need;
function equip(item) {
  S.gear = S.gear || {}; const sl = item.slot; if (!slotOpen(sl)) { toast(slotOf(sl).name + ' slot: ' + slotOf(sl).hint + '.'); return; }
  const was = S.gear[sl]; if (was === item.id) { delete S.gear[sl]; toast('Took off: ' + item.name + '.'); } else { S.gear[sl] = item.id; toast('Equipped: ' + item.name + (was ? ' (swapped out ' + itemById(was).name + ')' : '') + '.'); }
  refreshGear(); saveS(); hud(); if (net && net.flair) net.flair(myTokens());
}
function useItem(item, act) {
  if (act === 'equip') equip(item);
  if (act === 'use') {
    if (!item.reuse) { S.items[item.id]--; if (S.items[item.id] <= 0) delete S.items[item.id]; }
    stat('used'); if (item.effect === 'shake') { BUFF.speedTo = clock + 180; BUFF.speedMul = 1.25; } if (item.effect === 'energy') { BUFF.speedTo = clock + 120; BUFF.speedMul = 1.4; } if (item.effect === 'coffee' || item.effect === 'pot') BUFF.wait += 60; if (item.effect === 'light') BUFF.light = 1.5;
    saveS(); toast(item.useText || 'Used.');
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
  document.querySelectorAll('[data-of]').forEach((b) => b.onclick = () => { S.outfit = b.dataset.of; refreshGear(); saveS(); hud(); if (net && net.flair) net.flair(myTokens()); locker(); });
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
// ---------- going inside buildings ----------
function doorSpot(l) { if (l.bld) return [l.bld.x + l.bld.w / 2, l.bld.y + l.bld.d + .05]; const b = W.buildings.find((b2) => b2.x >= l.ox && b2.x <= l.ox + 8 && b2.y >= l.oy && b2.y <= l.oy + 8); if (!b) return [l.door[0] + .5, l.door[1] - .2]; return [b.x + b.w / 2, b.y + b.d + .05]; }
function doorMarks(list, vis, now) {
  if (P.inCar || P.boat) return;
  W.lots.forEach((l) => { if (!ENTER[l.kind]) return; const [dx, dy] = doorSpot(l); if (Math.hypot(dx - P.x, dy - P.y) > 7) return; const [sx, sy] = iso(dx, dy); if (!vis(sx, sy)) return; list.push({ d: dx + dy + 2, f: () => { const k = (Math.sin(now / 300) + 1) / 2; ctx.fillStyle = 'rgba(245,184,0,' + (.25 + k * .25) + ')'; ctx.beginPath(); ctx.ellipse(sx, sy, 16, 8, 0, 0, Math.PI * 2); ctx.fill(); bubble(sx, sy - 26, '🚪', '#f5b800', now); } }); });
}
function enterBuilding(l) { stat('inside'); if (l && l.name) { S.inside = S.inside || {}; S.inside[W.did + ':' + l.name] = 1; }
  if (inside || P.inCar || P.boat) return;
  const idx = W.lots.indexOf(l), I = buildInterior(l, W, idx);
  inside = { idx, lot: l, O: { W, G, SPR, peds, traffic, citizens, infos, observes, FX, pcar, pboat, NIGHT, x: P.x, y: P.y } };
  W = I; G = I.ground; SPR = []; peds = []; traffic = []; pcar = null; pboat = null; setSun(0);
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
  const k = W.did + ':in:' + l.kind; if (!S.disc[k]) { S.disc[k] = 1; saveS(); award(10, 'new place'); }
}
function exitBuilding() {
  if (!inside) return; const O = inside.O, l = inside.lot;
  setSun(SUN ? SUN.len : 0);
  W = O.W; G = O.G; SPR = O.SPR; peds = O.peds; traffic = O.traffic; citizens = O.citizens; infos = O.infos; observes = O.observes; FX = O.FX; pcar = O.pcar; pboat = O.pboat;
  inside = null; const [dx, dy] = doorSpot(l); P.x = dx; P.y = dy + .8; P.path = []; K9.x = P.x - .6; K9.y = P.y; cam.free = false; relightSprites();
  $('hDist').textContent = W.D.name; $('hExp').textContent = 'Explored ' + Math.floor(exCount / exTotal * 100) + '%'; beep(440, .08, 'triangle', .04); beep(330, .1, 'triangle', .04, .08);
  if (net && net.inside) net.inside(-1);
}

// ---------- story campaign ----------
// one chapter per district; each step is a place to go and a scene that plays there, inside the world
S.story = S.story || {}; S.lore = S.lore || {}; S.found = S.found || {}; S.disc = S.disc || {}; S.explored = S.explored || {}; S.mile = S.mile || {}; S.items = S.items || {}; S.npc = S.npc || {};
const chap = () => CHAPTERS.find((c) => c.d === W.did);
// side cases: S.side[id] is the step reached (absent = not taken yet); S.track is the case shown on the HUD
S.side = S.side || {}; S.track = S.track || 'main';
const sideQ = (id) => SIDE.find((q) => q.id === id);
const sideOpen = (q) => S.unlocked.includes(q.d) && (S.story[q.req[0]] || 0) >= q.req[1];
const sideAvail = (q) => q.d === W.did && sideOpen(q) && S.side[q.id] == null;
const sideLive = (q) => S.side[q.id] != null && S.side[q.id] < q.steps.length;
const sideClosed = (q) => S.side[q.id] != null && S.side[q.id] >= q.steps.length;
function activeQ() {
  const t = S.track !== 'main' ? sideQ(S.track) : null, mk = (q) => ({ side: true, q, i: S.side[q.id], step: q.steps[S.side[q.id]], title: q.title });
  if (t && t.d === W.did && sideLive(t)) return mk(t);
  const c = chap(); if (c) { const i = S.story[c.d] || 0; if (i < c.steps.length) return { side: false, q: c, i, step: c.steps[i], title: c.title }; }
  const o = SIDE.find((q) => q.d === W.did && sideLive(q)); return o ? mk(o) : null;
}
const chStep = () => { const a = activeQ(); return a ? a.step : null; };
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
const offerNo = {};
function offerSide(q) {
  storyBusy = true; paused = true; P.path = []; LASTCHOICE = null;
  const lines = q.offer.concat([['choice', [{ t: 'Take the case', accept: true }, { t: 'Not right now', reply: [[q.giver, 'No problem. You know where to find me.']] }]]]);
  dialogue(lines, () => {
    storyBusy = false; paused = false; storyCool = 1.5;
    if (LASTCHOICE && LASTCHOICE.accept) { S.side[q.id] = 0; S.track = q.id; saveS(); music.sting('accept'); banner('📁', 'Side case opened: ' + q.title, q.blurb); objectiveFlash(); }
    else offerNo[q.id] = performance.now() + 90000;
  });
}
function sideDone(q) {
  const rw = q.reward || {}; if (S.track === q.id) S.track = 'main'; saveS(); music.sting('done');
  const n = SIDE.filter(sideClosed).length;
  openModal('<div class="chEnd side"><span class="chKick">Side case closed</span><h2>' + esc(q.title) + '</h2><p>' + esc(DISTRICTS[q.d].name) + '</p><div class="chStamp">CASE CLOSED</div><p class="chNext">' + n + ' of ' + SIDE.length + ' side cases closed. People remember how you handled this one.</p></div><div class="qAct"><button type="button" id="mDone">Back to patrol</button></div>');
  good(); $('mDone').onclick = () => { closeModal(); award(rw.rp || 100, 'side case'); if (rw.loot) queueLoot('Side case: ' + q.title, 1, rw.loot); };
}
function storyUpdate(dt) {
  storyCool -= dt; if (storyBusy || scene || storyCool > 0 || !$('modal').hidden) return;
  if (!inside) for (const q of SIDE) { if (!sideAvail(q) || (offerNo[q.id] || 0) > performance.now()) continue; const r = regs.find((x) => x.n.id === q.giver); if (r && Math.hypot(r.x - P.x, r.y - P.y) < 1.8) { offerSide(q); return; } }
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
  if (o.trust) blockTrust(o.trust);
  if (o.trust) { S.trust[W.did] = Math.max(0, Math.min(100, (S.trust[W.did] == null ? 50 : S.trust[W.did]) + o.trust * 4 * (o.trust > 0 && hasSk('com2') ? 1.5 : 1))); }
  if (o.npc) Object.keys(o.npc).forEach((id) => { S.npc[id] = Math.max(0, Math.min(6, (S.npc[id] || 0) + o.npc[id])); });
  saveS();
}
// ---------- cinematic scenes ----------
// dialogue(lines, done, opts) plays a letterboxed scene over the live world. Line types:
//   [speakerId, text, cond?]      a spoken line (speaker from CAST, NPCS or TEMP); '(over the radio)' marks radio
//   ['narr', text]                narration, no portrait
//   ['choice', [{ t, reply, ... }]] the player chooses; each option can set flags, trust and friendships
//   ['q', question, speakerId]    a chapter question asked inside the scene; the speaker reacts to the answer
//   ['fx', fn]                    run something mid-scene
// opts: { focus: [x, y], zoom, kicker } frames the camera on the scene and labels it.
const TEMP = Object.assign({}, SIDE_CAST);
// after a right answer: praise, then a tip about something else worth doing nearby
function hintLine() {
  const opts = [], nm = (id) => { const n = NPCS.find((x) => x.id === id); return n ? n.name : id; };
  const av = inside ? [] : SIDE.filter(sideAvail); if (av.length) { const q = rnd(av); opts.push(nm(q.giver) + ' has been asking for an officer. Look for the blue mark.', 'Word is ' + nm(q.giver) + ' could use a hand. Might be worth a stop.'); }
  const live = SIDE.filter((q) => sideLive(q) && S.track !== q.id); if (live.length) { const q = rnd(live); opts.push('Don\'t forget "' + q.title + '". Next up: ' + q.steps[S.side[q.id]].goal.toLowerCase() + '.'); }
  try { const m = L.districtMastery(S, W.did); if (!m.ready) opts.push((m.facts.total - m.facts.done) + ' facts left in ' + W.D.name + ' before your Final Call. Navarro runs fact drills from the City board.'); else opts.push('You\'re cleared for the ' + W.D.name + ' Final Call. Open the City board when you\'re ready.'); } catch (e) {}
  if (citizens.length) opts.push('There\'s a citizen out there flagging down an officer. Keep an eye out for the yellow question mark.');
  const un = SIDE.filter((q) => q.d === W.did && !sideOpen(q)).length; if (un) opts.push('Keep the main case moving and more people in ' + W.D.name + ' will start trusting you with their problems.');
  if (S.x6) opts.push('You\'re still X6. Go X8 when you want calls again.');
  return opts.length ? rnd(opts) : 'Keep it up.';
}
const PRAISE = ['Exactly right.', 'That\'s it, by the book.', 'Good. That\'s how it\'s done.', 'Right answer. You were listening in class.', 'Correct. Nice.'];
const CORRECT = ['Not quite. Here\'s how it actually works:', 'Close, but no. Remember this:', 'Careful. The chapter says otherwise:', 'That\'s not it. For next time:'];
const CINE = { on: false, x: 0, y: 0, z: 1, z0: 1, back: 0 };
function cineFocus(x, y, z) { const [ix, iy] = iso(x, y); CINE.on = true; CINE.x = ix; CINE.y = iy - 18; CINE.z0 = CINE.z0 && CINE.back > 0 ? CINE.z0 : cam.z; CINE.z = Math.min(2.2, Math.max(cam.z, z || (innerWidth < 600 ? 1.35 : 1.7))); CINE.back = 0; }
function cineRelease() { if (!CINE.on) return; CINE.on = false; CINE.back = 1; }
function cineCam(dt) {
  if (!S.cfg || S.cfg.motion === false) { if (CINE.on) { cam.x = CINE.x; cam.y = CINE.y; } return; }
  const k = Math.min(1, dt * 2.6);
  if (CINE.on) { cam.free = true; cam.x += (CINE.x - cam.x) * k; cam.y += (CINE.y - cam.y) * k; cam.z += (CINE.z - cam.z) * k; }
  else if (CINE.back > 0) { cam.z += (CINE.z0 - cam.z) * k; CINE.back -= dt * 1.2; if (CINE.back <= 0) { cam.z = CINE.z0; cam.free = false; CINE.z0 = 0; } }
}
function scoreAnswer(q, ans, retry) {
  const ok = L.isRight(q, ans); L.record(S, q, ok); SS.answered++;
  if (ok && retry) { SS.right++; stat('right'); stat('retryRight'); COMBO = 0; good(); }
  else if (ok) { SS.right++; stat('right'); S.bestCombo = Math.max(S.bestCombo || 0, COMBO + 1); COMBO++; bestCombo = Math.max(bestCombo, COMBO); ord('right'); if (COMBO === 5) ord('streak'); good(); } else { COMBO = 0; bad(); }
  comboHud(); return ok;
}
function dialogue(lines, done, opts) {
  opts = opts || {}; const box = $('dlg'); let seq = lines.slice(), i = -1, typing = null, full = '';
  const res = { right: 0, n: 0, choices: [] };
  const who = (id) => TEMP[id] || CAST[id] || NPCS.find((n) => n.id === id) || { name: id, icon: '💬', role: '' };
  const kick = opts.kicker ? '<div class="dlgKick">' + esc(opts.kicker) + '</div>' : '';
  const next = () => { do { i++; } while (i < seq.length && !condOk(seq[i])); if (i < seq.length) show(); else end(); };
  const frame = (inner, cls) => { box.innerHTML = '<div class="dlgBar top">' + kick + '</div><div class="dlgBar bot"></div><div class="dlgPanel' + (cls || '') + '">' + inner + '</div>'; box.hidden = false; requestAnimationFrame(() => box.classList.add('on')); };
  const show = () => {
    const ln = seq[i];
    if (ln[0] === 'fx') { try { ln[1](res); } catch (e) {} return next(); }
    if (ln[0] === 'choice') {
      const opts2 = ln[1];
      frame('<div class="dlgTxt"><b>Your call</b><small>' + esc(ln[2] || 'What do you do?') + '</small><div class="dlgOpts">' + opts2.map((o, k) => '<button type="button" data-k="' + k + '"><span class="kk">' + (k + 1) + '</span>' + esc(o.t) + '</button>').join('') + '</div></div>', ' dlgChoice'); box.onclick = null;
      box.querySelectorAll('[data-k]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); const o = opts2[+b.dataset.k]; res.choices.push(o); applyChoice(o); beep(660, .08, 'triangle', .04); if (o.fx) { try { o.fx(res); } catch (er) {} } seq.splice(i + 1, 0, ...(o.reply || [])); box.onclick = click; next(); });
      return;
    }
    if (ln[0] === 'q') {
      const q = ln[1], sp = ln[2] || 'castillo', c = who(sp); let picked = []; window.__curQ = q;
      frame('<div class="dlgPort"><span>' + c.icon + '</span></div><div class="dlgTxt"><b>' + esc(c.name) + '</b><small>' + esc(L.lessonName(q.les != null ? q.les : W.D.lessons[0]) || '') + '</small><p class="dlgQ">' + esc(q.stem) + '</p>' + (q.multi ? '<em class="dlgHint">Select all that apply, then confirm.</em>' : '') + '<div class="dlgOpts q">' + q.opts.map((o, k) => '<button type="button" data-k="' + k + '"><span class="kk">' + 'ABCDEF'[k] + '</span>' + esc(o) + '</button>').join('') + '</div>' + (q.multi ? '<div class="dlgConfirm"><button type="button" id="dlgOk" disabled>Confirm</button></div>' : '') + '</div>', ' dlgChoice dlgQuiz'); box.onclick = null;
      let tries = 0;
      const finish = () => { const ans = q.multi ? picked.slice() : picked[0];
        // a wrong first answer gets one more try (no streak, but it still counts and completes the fact)
        if (tries === 0 && !L.isRight(q, ans)) { tries = 1; bad(); COMBO = 0; comboHud();
          box.querySelectorAll('[data-k]').forEach((b) => { const k = +b.dataset.k; if (!q.multi && k === ans) { b.disabled = true; b.classList.add('no'); } b.classList.remove('sel'); }); picked = [];
          const tx = box.querySelector('.dlgTxt small'); if (tx) tx.innerHTML = '<b class="dlgRetry">Not quite. One more try.</b>'; if (q.multi && $('dlgOk')) $('dlgOk').disabled = true; return; }
        const ok = scoreAnswer(q, ans, tries > 0); res.n++; if (ok) res.right++; if (tries && ok) res.retry = (res.retry || 0) + 1;
        box.querySelectorAll('[data-k]').forEach((b) => { const k = +b.dataset.k, isC = q.multi ? q.c.indexOf(k) >= 0 : k === q.c; b.disabled = true; b.classList.add(isC ? 'ok' : picked.indexOf(k) >= 0 ? 'no' : 'dim'); });
        const fact = (q.fact || q.ex || '').trim(); setTimeout(() => { const V = VOICES[sp] || VOICES[String(sp).replace(/^reg_/, '')] || ANYONE, nx = seq[i + 1], more = !nx || nx[0] !== 'q', add = [[sp, ok ? rnd(tries ? V.r : V.p) : rnd(CORRECT) + (fact ? ' ' + fact : ''), { quiz: ok ? 'ok' : 'no' }]];
          if (more && !opts.noFollow) { add.push([sp, rnd(V.a)]); if (ok && sp !== 'exhibita' && Math.random() < .4) add.push([sp, (V === ANYONE ? 'Oh, and officer? ' : 'Oh, and one more thing. ') + hintLine()]); }
          seq.splice(i + 1, 0, ...add); box.onclick = click; next(); }, 750); };
      box.querySelectorAll('[data-k]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); const k = +b.dataset.k; if (q.multi) { const at = picked.indexOf(k); if (at >= 0) picked.splice(at, 1); else picked.push(k); b.classList.toggle('sel'); $('dlgOk').disabled = !picked.length; } else { picked = [k]; finish(); } });
      if (q.multi) $('dlgOk').onclick = (e) => { e.stopPropagation(); if (picked.length) finish(); };
      return;
    }
    const narr = ln[0] === 'narr', id = narr ? '' : ln[0], text = narr ? ln[1] : ln[1], c = narr ? null : who(id), radio = !narr && /^\(over the radio\)/.test(text), mood = ln[2] && ln[2].quiz;
    full = text.replace(/^\(over the radio\)\s*/, '');
    frame(narr ? '<div class="dlgTxt narr"><p id="dlgP"></p></div><i class="dlgNext">▸</i>' : '<div class="dlgPort' + (radio ? ' radio' : '') + (mood ? ' ' + mood : '') + '"><span>' + (radio ? '📻' : c.icon) + '</span></div><div class="dlgTxt"><b>' + esc(c.name) + (radio ? ' <em>on the radio</em>' : '') + '</b><small>' + esc(c.role || '') + '</small><p id="dlgP"></p></div><i class="dlgNext">▸</i>', narr ? ' dlgNarr' : '');
    const spd = { slow: 1, normal: 2, fast: 4, instant: 999 }[S.cfg.text] || 2; let k = 0; const el = $('dlgP'); clearInterval(typing); typing = setInterval(() => { k += spd; el.textContent = full.slice(0, k); if (k >= full.length) { clearInterval(typing); typing = null; } }, 22);
    if (radio) chirp(); else if (!narr && S.sound) beep(520 + (id.length * 37) % 300, .05, 'triangle', .025);
  };
  document.body.classList.add('cine'); if (opts.focus) cineFocus(opts.focus[0], opts.focus[1], opts.zoom);
  const end = () => { document.body.classList.remove('cine'); box.classList.remove('on'); if (opts.focus) cineRelease(); setTimeout(() => { if (!box.classList.contains('on')) { box.hidden = true; box.innerHTML = ''; } }, 250); box.onclick = null; removeEventListener('keydown', keys); done && done(res); };
  const click = () => { if (typing) { clearInterval(typing); typing = null; $('dlgP').textContent = full; return; } next(); };
  const keys = (e) => { if (box.hidden) return; const b = box.querySelector('[data-k="' + (parseInt(e.key, 10) - 1) + '"]') || (/^[a-f]$/i.test(e.key) ? box.querySelector('.dlgOpts.q [data-k="' + ('abcdef'.indexOf(e.key.toLowerCase())) + '"]') : null); if (b && !b.disabled) { b.click(); e.preventDefault(); return; } if ((e.key === ' ' || e.key === 'Enter') && box.onclick) { e.preventDefault(); click(); } };
  addEventListener('keydown', keys);
  box.onclick = click;
  next();
}
function playStep(st) {
  storyBusy = true; paused = true; P.path = [];
  const A = activeQ(), c = A.q, idx = A.i, last = idx === c.steps.length - 1;
  const finish = () => {
    if (A.side) S.side[c.id] = idx + 1; else S.story[c.d] = idx + 1; if (st.set) S.flags[st.set] = Date.now(); saveS(); ord('story'); storyBusy = false; paused = false; storyCool = 2;
    if (last) (A.side ? sideDone(c) : chapterDone(c)); else { const nx = chStep(); if (nx) objectiveFlash(nx.goal); }
  };
  const afterQuiz = () => { if (st.after) dialogue(st.after, finish); else finish(); };
  const tg = stepTarget();
  dialogue(st.say || [], () => {
    if (!st.quiz) return afterQuiz();
    const les = W.D.lessons.indexOf(st.quiz.les) >= 0 ? [st.quiz.les] : W.D.lessons; const qs = L.pickFacts(S, les, st.quiz.n || 2); const sp = st.who || 'castillo';
    dialogue(qs.map((q, k) => ['q', q, k % 2 && st.who !== 'castillo' ? 'castillo' : sp]), (r) => {
      paused = true; award(r.right * 20, 'story');
      if (r.right < Math.ceil(qs.length / 2)) { dialogue([[st.who || 'castillo', r.right ? 'Close, but not by the book yet. Think it through and try me again.' : 'Not quite. Review it, then come back and we will run it again.']], () => { storyBusy = false; paused = false; storyCool = 4; }); return; }
      afterQuiz();
    });
  }, { focus: tg ? [tg.x, tg.y] : [P.x, P.y], kicker: (A.side ? 'SIDE CASE · ' : '') + c.title.toUpperCase() });
}
function chapterDone(c) {
  const rw = c.steps[c.steps.length - 1].reward || {}; S.lore['ch' + c.d] = 1; saveS();
  openModal('<div class="chEnd"><span class="chKick">Chapter ' + (c.d + 1) + ' complete</span><h2>' + esc(c.title) + '</h2><p>' + esc(c.sub) + '</p><div class="chStamp">CASE NOTES FILED</div>' +
    '<p class="chNext">' + (c.d < 4 ? 'Next: Chapter ' + (c.d + 2) + ', ' + esc(CHAPTERS[c.d + 1].title) + '. It opens when ' + esc(DISTRICTS[c.d + 1].name) + ' does.' : 'The story is complete. Port Meridian is yours to keep patrolling.') + '</p><p class="chLore">New entries in your Field Journal · +1 skill point</p></div><div class="qAct"><button type="button" id="mDone">Back to patrol</button></div>');
  good(); music.sting('done'); setTimeout(() => beep(1047, .3, 'triangle', .05), 200);
  $('mDone').onclick = () => { closeModal(); if (rw.rp) award(rw.rp, 'chapter complete'); if (rw.loot) queueLoot('Chapter ' + (c.d + 1) + ': ' + c.title, 1, rw.loot); };
}
function objectiveFlash(text) { const el = $('objBar'); if (!el) return; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
function objectiveHud() {
  const el = $('objBar'), A = activeQ(), st = A && A.step, t = stepTarget();
  if ((!st || !t) && !scene) { const G = guideTarget(), q = S.track !== 'main' ? sideQ(S.track) : null; if (G && q && sideLive(q)) { const d = Math.hypot(G.x - P.x, G.y - P.y), [tx, ty] = iso(G.x, G.y), [px, py] = iso(P.x, P.y), txt = (inside ? 'Head outside, then to ' : 'Head to ') + DISTRICTS[q.d].name + ': ' + q.steps[S.side[q.id]].goal;
    if (el.dataset.t !== txt) { el.dataset.t = txt; el.innerHTML = '<i class="objArr">➤</i><span><small>Side case · ' + esc(q.title) + '</small><b>' + esc(txt) + '</b></span><em id="objD"></em>'; el.classList.add('side'); }
    el.hidden = false; el.querySelector('.objArr').style.transform = 'rotate(' + Math.atan2(ty - py, tx - px) + 'rad)'; $('objD').textContent = Math.round(d * 4) * 5 + ' ft'; return; } }
  if (!st || !t || scene) { el.hidden = true; return; }
  const d = Math.hypot(t.x - P.x, t.y - P.y), [tx, ty] = iso(t.x, t.y), [px, py] = iso(P.x, P.y), ang = Math.atan2(ty - py, tx - px);
  const txt = t.exit ? 'Head outside: ' + st.goal : st.goal;
  if (el.dataset.t !== txt) { el.dataset.t = txt; el.innerHTML = '<i class="objArr">➤</i><span><small>' + (A.side ? 'Side case · ' : '') + esc(A.title) + '</small><b>' + esc(txt) + '</b></span><em id="objD"></em>'; el.classList.toggle('side', !!A.side); }
  el.hidden = false; el.querySelector('.objArr').style.transform = 'rotate(' + ang + 'rad)'; $('objD').textContent = d < 2.5 ? 'here' : Math.round(d * 4) * 5 + ' ft';
}
function storyMarker(now) {
  if (!inside) SIDE.forEach((q) => { if (!sideAvail(q)) return; const r = regs.find((x) => x.n.id === q.giver); if (!r) return; const [sx, sy] = iso(r.x, r.y); bubble(sx, sy - 66, '!', '#38bdf8', now); });
  const t = stepTarget(); if (!t || t.exit) return; const A = activeQ(), col = A && A.side ? '#38bdf8' : '#f5b800';
  const [sx, sy] = iso(t.x, t.y), b = Math.sin(now / 300) * 4;
  ctx.fillStyle = A && A.side ? 'rgba(56,189,248,.18)' : 'rgba(245,184,0,.18)'; ctx.beginPath(); ctx.moveTo(sx - 8, sy); ctx.lineTo(sx - 3, sy - 120); ctx.lineTo(sx + 3, sy - 120); ctx.lineTo(sx + 8, sy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(sx, sy - 62 + b); ctx.lineTo(sx + 9, sy - 74 + b); ctx.lineTo(sx, sy - 86 + b); ctx.lineTo(sx - 9, sy - 74 + b); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
}
// story characters stand where their scene happens
function storyCast(list, vis, now) {
  const st = chStep(); if (!st || (st.npc && !st.inside)) return; const tmp = TEMP[st.who] && !CAST[st.who] && !NPCS.some((x) => x.id === st.who) ? TEMP[st.who] : null, c = CAST[st.who], n = !c && !tmp && NPCS.find((x) => x.id === st.who); if (!c && !n && !tmp) return; const t = stepTarget(); if (!t || t.exit || t.door) return;
  if (!inside && st.inside) return;
  const x = inside ? t.x : t.x + .8, y = inside ? t.y : t.y - .2, [sx, sy] = iso(x, y);
  if (!vis(sx, sy)) return;
  list.push({ d: x + y, f: () => { if (tmp) { { const h = [...st.who].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7); person(ctx, sx, sy, { ph: h % 997, shirt: ['#c0392b', '#2e86de', '#16a085', '#8e44ad', '#e67e22', '#2c3e50', '#d35400', '#27ae60'][h % 8], skin: ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#a0662f'][(h >> 3) % 6], hair: ['#2b1d14', '#5a3825', '#1a1a1a', '#b07b3c', '#9a9a9a'][(h >> 5) % 5], moving: false, face: -1, s: /age 9|teen/i.test(tmp.name) ? .82 : 1 }, now); } label(sx, sy - 50, tmp.icon + ' ' + tmp.name, '#7dd3fc'); return; } if (c) { person(ctx, sx, sy, { kit: c.look, skin: c.skin, hair: '#1a1a1a', moving: false, face: -1, s: 1.04 }, now); label(sx, sy - 50, c.icon + ' ' + c.name, '#f5b800'); return; } if (n.cat) cat(sx, sy, now); else { const lk = n.look || {}; person(ctx, sx, sy, { kit: npcKit(lk), hair: lk.hair, skin: lk.skin, moving: false, face: -1 }, now); } label(sx, sy - (n.cat ? 26 : 48), n.icon + ' ' + n.name, '#7dd3fc'); } });
}
function unlockLore() { let n = 0; LORE.forEach((e) => { if (S.lore[e.id]) return; const w = e.when; if (w === 'start' || (w[0] === 'd' && S.unlocked.includes(+w.slice(1))) || (w.slice(0, 2) === 'ch' && S.lore[w])) { S.lore[e.id] = 1; n++; } }); if (n) saveS(); return n; }
let jTab = 'story';
function journal() {
  const tabs = '<div class="lkTabs"><button type="button" data-j="map" class="' + (jTab === 'map' ? 'on' : '') + '">Districts</button><button type="button" data-j="story" class="' + (jTab === 'story' ? 'on' : '') + '">Quests</button><button type="button" data-j="cast" class="' + (jTab === 'cast' ? 'on' : '') + '">People</button><button type="button" data-j="lore" class="' + (jTab === 'lore' ? 'on' : '') + '">Lore</button></div>';
  if (jTab === 'map') return districtBoard(tabs);
  let body = '';
  if (jTab === 'story') body = CHAPTERS.map((c) => { const i = S.story[c.d] || 0, done = i >= c.steps.length, open = S.unlocked.includes(c.d); return '<div class="jCh' + (done ? ' done' : '') + (open ? '' : ' locked') + '"><div class="jChH"><span>Chapter ' + (c.d + 1) + '</span><b>' + (open ? esc(c.title) : '🔒 Locked') + '</b><small>' + esc(c.sub) + '</small></div><div class="jSteps">' + c.steps.map((st, k) => '<i class="' + (k < i ? 'ok' : k === i && open ? 'cur' : '') + '" title="' + esc(st.goal) + '"></i>').join('') + '</div>' + (open && !done ? '<p>Now: ' + esc(c.steps[i].goal) + '</p>' : done ? '<p>Case closed.</p>' : '<p>Opens with ' + esc(DISTRICTS[c.d].name) + '.</p>') + '</div>'; }).join('');
  if (jTab === 'story') {
    const tr = (id) => '<button type="button" class="jTrack' + (S.track === id ? ' on' : '') + '" data-tr="' + id + '">' + (S.track === id ? 'Tracking' : 'Track') + '</button>';
    body = '<div class="jSec"><b>Main storyline · ' + esc(MAIN_TITLE) + '</b>' + tr('main') + '</div>' + body + '<div class="jSec"><b>Side cases · ' + SIDE.filter(sideClosed).length + '/' + SIDE.length + ' closed</b></div>' + DISTRICTS.map((D) => { const qs = SIDE.filter((q) => q.d === D.id), live = qs.filter(sideLive).length, av = qs.filter((q) => sideOpen(q) && S.side[q.id] == null).length; return '<details class="jDist"' + (D.id === W.did || live ? ' open' : '') + '><summary><i style="background:' + D.color + '"></i><b>' + esc(D.name) + '</b><span>' + qs.filter(sideClosed).length + '/' + qs.length + ' closed' + (live ? ' · ' + live + ' active' : '') + (av ? ' · <em>' + av + ' new</em>' : '') + '</span></summary>' + qs.map((q) => {
      const open = sideOpen(q), st = S.side[q.id], done = sideClosed(q), live = sideLive(q), giver = NPCS.find((n) => n.id === q.giver) || {};
      return '<div class="jCh side' + (done ? ' done' : '') + (open ? '' : ' locked') + '"><div class="jChH"><span>' + esc(DISTRICTS[q.d].name) + '</span><b>' + (open || st != null ? esc(q.title) : '🔒 Not yet') + '</b><small>' + (open || st != null ? esc(q.blurb) : 'Keep going with the main story in ' + esc(DISTRICTS[q.d].name) + '.') + '</small></div>' +
        (live ? '<div class="jSteps">' + q.steps.map((x, k) => '<i class="' + (k < st ? 'ok' : k === st ? 'cur' : '') + '"></i>').join('') + '</div><p>Now: ' + esc(q.steps[st].goal) + '</p>' + tr(q.id) : done ? '<p>Case closed.</p>' : open ? '<p>Find ' + esc(giver.icon || '') + ' ' + esc(giver.name || 'someone') + ' in ' + esc(DISTRICTS[q.d].name) + '. Look for the blue <b>!</b></p>' : '') + '</div>';
    }).join('') + '</details>'; }).join('');
  }
  if (jTab === 'cast') { const met = (id) => Object.keys(CAST).indexOf(id) >= 0 ? CHAPTERS.some((c) => c.steps.slice(0, S.story[c.d] || 0).some((st) => st.who === id || (st.say || []).some((l) => l[0] === id))) : false; body = Object.keys(CAST).map((id) => { const c = CAST[id], m = met(id); return '<div class="jP' + (m ? '' : ' unk') + '"><span>' + (m ? c.icon : '❔') + '</span><div><b>' + (m ? esc(c.name) : 'Not met yet') + '</b><small>' + (m ? esc(c.role) : '') + '</small>' + (m ? '<p>' + esc(c.bio) + '</p>' : '') + '</div></div>'; }).join('') + '<p class="lkSum">Regulars you have befriended: ' + Object.keys(S.npc || {}).filter((k) => S.npc[k] > 0).length + '</p>'; }
  if (jTab === 'lore') { const hint = (w) => w === 'start' ? '' : /^d\d$/.test(w) ? 'Opens with ' + DISTRICTS[+w[1]].name + '.' : w.slice(0, 2) === 'ch' ? 'Keep going with the main story.' : w.slice(0, 5) === 'side:' ? 'Close a side case in ' + ((sideQ(w.slice(5)) && DISTRICTS[sideQ(w.slice(5)).d].name) || 'the city') + '.' : w.slice(0, 6) === 'visit:' ? 'Explore ' + (LORE_DIST[w.slice(6)] || 'the city') + '.' : '';
    const grp = [['The city', (e) => e.when === 'start' || /^d\d$/.test(e.when)], ['The story', (e) => e.when.slice(0, 2) === 'ch'], ['Places', (e) => e.when.slice(0, 6) === 'visit:'], ['Side cases', (e) => e.when.slice(0, 5) === 'side:']];
    body = '<p class="lkSum">' + LORE.filter((e) => S.lore[e.id]).length + ' of ' + LORE.length + ' entries discovered</p>' + grp.map(([nm, f]) => { const es = LORE.filter(f); return '<div class="jSec"><b>' + nm + ' · ' + es.filter((e) => S.lore[e.id]).length + '/' + es.length + '</b></div>' + es.map((e) => S.lore[e.id] ? '<details class="jLore"' + (JLORE === e.id ? ' open' : '') + '><summary>' + esc(e.title) + '</summary><p>' + esc(e.text) + '</p></details>' : '<div class="jLore unk">??? <small>' + esc(hint(e.when) || 'Keep patrolling to uncover this.') + '</small></div>').join(''); }).join(''); JLORE = null; }
  openModal('<div class="sceneHead"><b>FIELD JOURNAL · ' + esc(WORLD.city.toUpperCase()) + '</b><h2>' + ({ story: 'Quests', cast: 'The people you know', lore: 'Port Meridian' })[jTab] + '</h2><p>' + esc(S.cs) + ' · ' + esc(unitName(U())) + '</p></div>' + tabs + '<div class="jBody">' + body + '</div><div class="qAct"><button type="button" class="ghost" id="mClose">Close</button></div>');
  $('mClose').onclick = closeModal; document.querySelectorAll('[data-j]').forEach((b) => b.onclick = () => { jTab = b.dataset.j; journal(); }); document.querySelectorAll('[data-tr]').forEach((b) => b.onclick = () => { S.track = b.dataset.tr; saveS(); beep(660, .06, 'triangle', .04); journal(); });
}

// ---------- quest tracker: every open case at a glance, plus a GPS trail on the ground ----------
const TRAIL = { t: 0, path: null };
function trailUpdate(dt) {
  TRAIL.t -= dt; if (TRAIL.t > 0) return; TRAIL.t = .7;
  const t = stepTarget(); if (!t || scene || ATTRACT || (S.cfg && S.cfg.trail === false) || Math.hypot(t.x - P.x, t.y - P.y) < 3) { TRAIL.path = null; return; }
  const pass = P.boat ? (a, b) => W.at(a, b) === T.WATER : P.inCar ? ridePass() : (a, b) => W.walkable(a, b) && !gateBlock(a, b) && W.at(a, b) !== T.WATER;
  TRAIL.path = astar(P.x, P.y, t.x, t.y, pass, !P.inCar); if (!TRAIL.path) { const c = reachClosest(P.x, P.y, t.x, t.y, pass); if (c) TRAIL.path = astar(P.x, P.y, c[0], c[1], pass, !P.inCar); }
}
function trailDraw(now) {
  const p = TRAIL.path; if (!p || p.length < 3 || document.body.classList.contains('cine')) return; const A = activeQ(), col = A && A.side ? '56,189,248' : '245,184,0', n = Math.min(p.length - 1, 80);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 1; i < n; i += 2) {
    const a = p[i], b = p[i + 1], [x0, y0] = iso(a[0], a[1]), [x1, y1] = iso(b[0], b[1]);
    const al = (.28 + .6 * Math.pow((Math.sin(i * .55 - now / 170) + 1) / 2, 3)) * Math.min(1, (n - i) / 12 + .25);
    ctx.save(); ctx.translate(x0, y0); ctx.scale(1, .5); ctx.rotate(Math.atan2((y1 - y0) * 2, x1 - x0));
    ctx.strokeStyle = 'rgba(0,0,0,' + (al * .35) + ')'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-6, -7); ctx.lineTo(3, 0); ctx.lineTo(-6, 7); ctx.stroke();
    ctx.strokeStyle = 'rgba(' + col + ',' + al + ')'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-6, -7); ctx.lineTo(3, 0); ctx.lineTo(-6, 7); ctx.stroke(); ctx.restore();
  }
}
let trkT = 0;
function trackerList() {
  const A = activeQ(), out = [], seen = new Set();
  const add = (side, q, cur) => { const key = side ? q.id : 'main' + q.d; if (seen.has(key)) return; seen.add(key); const i = side ? S.side[q.id] : (S.story[q.d] || 0); out.push({ side, q, i, cur, here: q.d === W.did, key, track: side ? q.id : 'main' }); };
  if (A) add(A.side, A.q, true);
  const c = chap(); if (c && (S.story[c.d] || 0) < c.steps.length) add(false, c, false);
  SIDE.filter((q) => q.d === W.did && sideLive(q)).forEach((q) => add(true, q, false));
  SIDE.filter((q) => q.d !== W.did && sideLive(q)).forEach((q) => add(true, q, false));
  return out;
}
function trackerHud(dt) {
  const el = $('qTrack'); if (!el) return; trkT -= dt; if (trkT > 0) return; trkT = .4;
  if (ATTRACT || scene) { el.hidden = true; return; }
  const list = trackerList(), avail = inside ? 0 : SIDE.filter(sideAvail).length, mini = S.cfg && S.cfg.trackMin != null ? S.cfg.trackMin : innerWidth < 620;
  if (!list.length && !avail) { el.hidden = true; return; }
  const t = stepTarget(), dist = t ? Math.hypot(t.x - P.x, t.y - P.y) : 0;
  const key = W.did + '|' + !!inside + '|' + mini + '|' + avail + '|' + list.map((r) => r.key + r.i + r.cur).join(',') + '|' + S.track;
  if (el.dataset.k !== key) {
    el.dataset.k = key; el.classList.toggle('min', !!mini);
    const rows = list.slice(0, 4).map((r) => { const st = r.q.steps[r.i]; return '<div class="qtRow' + (r.cur ? ' cur' : '') + (r.side ? ' side' : '') + '" data-qt="' + r.track + '"><i>' + (r.side ? '📁' : '★') + '</i><div><small>' + (r.side ? 'Side case' : 'Main · Ch. ' + (r.q.d + 1)) + (r.here ? '' : ' · ' + esc(DISTRICTS[r.q.d].name)) + '</small><b>' + esc(r.q.title) + '</b><p>' + esc(st ? st.goal : '') + '</p><span class="qtPips">' + r.q.steps.map((x, k) => '<u class="' + (k < r.i ? 'ok' : k === r.i ? 'now' : '') + '"></u>').join('') + '</span></div>' + (r.cur ? '<button type="button" class="qtGo" title="Guide me there">🧭<em id="qtD"></em></button>' : '') + '</div>'; }).join('');
    el.innerHTML = '<button type="button" class="qtHead" id="qtTog"><span>📋 Cases</span><b>' + list.length + (avail ? ' <em>+' + avail + ' new</em>' : '') + '</b><i>' + (mini ? '▸' : '▾') + '</i></button>' + (mini ? '' : rows + (list.length > 4 ? '<div class="qtMore">+' + (list.length - 4) + ' more in your Field Journal</div>' : '') + (avail ? '<div class="qtNew">' + avail + ' new case' + (avail > 1 ? 's' : '') + ' in ' + esc(W.D.name) + '. Look for the blue <b>!</b></div>' : ''));
    $('qtTog').onclick = (e) => { e.stopPropagation(); S.cfg.trackMin = !mini; saveS(); trkT = 0; el.dataset.k = ''; };
    el.querySelectorAll('[data-qt]').forEach((rw) => rw.onclick = (e) => { if (e.target.closest('.qtGo')) return; S.track = rw.dataset.qt; saveS(); beep(660, .06, 'triangle', .04); objectiveFlash(); TRAIL.t = 0; trkT = 0; });
    const go = el.querySelector('.qtGo'); if (go) go.onclick = (e) => { e.stopPropagation(); const tg = stepTarget(); if (!tg) return; if (tg.exit && inside) { exitBuilding(); return; } goTo(tg.x, tg.y); beep(880, .06, 'triangle', .04); };
  }
  el.hidden = false; { let top = 0; ['hExp', 'hCombo'].forEach((id) => { const e = $(id); if (e && !e.hidden && e.offsetParent !== null) { const r = e.getBoundingClientRect(); if (r.height) top = Math.max(top, r.bottom); } }); if (top) el.style.top = (top + 8) + 'px'; }
  const dd = $('qtD'); if (dd) dd.textContent = !t ? '' : t.exit ? 'exit' : dist < 2.5 ? 'here' : Math.round(dist * 4) * 5 + ' ft';
}

// the guide arrow: whenever a case is tracked, an arrow at your feet points the way (and one at the screen edge when it's off screen)
function guideTarget() {
  const t = stepTarget(); if (t) { const p = TRAIL.path, a = p && p.length > 4 ? p[Math.min(4, p.length - 1)] : null; return { x: t.x, y: t.y, ax: a ? a[0] : t.x, ay: a ? a[1] : t.y, side: (activeQ() || {}).side, lab: t.exit ? 'Exit' : '' }; }
  const q = S.track !== 'main' ? sideQ(S.track) : null, d = q && sideLive(q) ? q.d : null; if (d == null || d === W.did) return null;
  if (inside) return { x: W.door[0], y: W.door[1], ax: W.door[0], ay: W.door[1], side: true, lab: 'Exit' };
  const g = W.gates.find((x) => x.to === d) || W.gates.find((x) => S.unlocked.includes(x.to)); if (!g) return null;
  return { x: g.x + .5, y: g.y + .5, ax: g.x + .5, ay: g.y + .5, side: true, lab: DISTRICTS[d].name };
}
function guideDraw(now, z) {
  if (scene || document.body.classList.contains('cine')) return; const G = guideTarget(); if (!G) return; const dist = Math.hypot(G.x - P.x, G.y - P.y); if (dist < 2) return;
  const col = G.side ? '56,189,248' : '245,184,0', [px, py] = iso(P.x, P.y), [ax, ay] = iso(G.ax, G.ay), ang = Math.atan2((ay - py) * 2, ax - px), pul = 1 + Math.sin(now / 220) * .08;
  ctx.save(); ctx.translate(px, py); ctx.scale(1, .5); ctx.rotate(ang); ctx.translate(40 + Math.sin(now / 260) * 4, 0); ctx.scale(pul, pul);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.moveTo(16, 2); ctx.lineTo(-8, -14); ctx.lineTo(-3, 2); ctx.lineTo(-8, 18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(' + col + ',.95)'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-8, -16); ctx.lineTo(-3, 0); ctx.lineTo(-8, 16); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  // off screen: pin an arrow to the edge of the screen
  const [tx, ty] = iso(G.x, G.y), sx = cv.width / 2 + (tx - cam.x) * z, sy = cv.height / 2 + (ty - 40 - cam.y) * z, m = 46 * (cv.width / innerWidth);
  if (sx > m && sy > m && sx < cv.width - m && sy < cv.height - m) return;
  const cx = cv.width / 2, cy = cv.height / 2, a2 = Math.atan2(sy - cy, sx - cx), k = Math.min((cv.width / 2 - m) / Math.abs(Math.cos(a2) || 1e-6), (cv.height / 2 - m * 1.6) / Math.abs(Math.sin(a2) || 1e-6)), ex = cx + Math.cos(a2) * k, ey = cy + Math.sin(a2) * k, sc = cv.width / innerWidth;
  ctx.save(); ctx.setTransform(sc, 0, 0, sc, 0, 0); const X = ex / sc, Y = ey / sc;
  ctx.fillStyle = 'rgba(8,14,28,.85)'; ctx.beginPath(); ctx.arc(X, Y, 22, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(' + col + ',1)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.translate(X, Y); ctx.rotate(a2); ctx.fillStyle = 'rgba(' + col + ',1)'; ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-6, -9); ctx.lineTo(-2, 0); ctx.lineTo(-6, 9); ctx.closePath(); ctx.fill(); ctx.rotate(-a2);
  ctx.font = '800 10px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const lab = G.lab || (Math.round(dist * 4) * 5 + ' ft'); const w = ctx.measureText(lab).width + 10, ly = Y > cv.height / sc / 2 ? -34 : 34;
  ctx.fillStyle = 'rgba(8,14,28,.85)'; ctx.beginPath(); ctx.roundRect(-w / 2, ly - 8, w, 16, 8); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(lab, 0, ly); ctx.restore();
}

// ---------- lore: discovered by exploring, by the story and by closing side cases ----------
const loreQ = []; let loreT = 3, loreBusy = false;
function loreCheck(dt) {
  loreT -= dt; if (loreT > 0 || ATTRACT) return; loreT = 1.2; const fresh = [];
  LORE.forEach((e) => {
    if (S.lore[e.id]) return; const w = e.when; let ok = false;
    if (w === 'start') { S.lore[e.id] = 1; saveS(); return; } // the opening entries are in the journal from day one
    if (w[0] === 'd' && /^d\d$/.test(w)) ok = S.unlocked.includes(+w.slice(1));
    else if (w.slice(0, 2) === 'ch') ok = !!S.lore[w];
    else if (w.slice(0, 5) === 'side:') { const q = sideQ(w.slice(5)); ok = !!q && sideClosed(q); }
    else if (w.slice(0, 6) === 'visit:' && !inside) { const nm = w.slice(6), l = W.lots.find((x) => x.name && x.name.indexOf(nm) >= 0); if (l) { const [dx, dy] = doorSpot(l); ok = Math.hypot(dx - P.x, dy - P.y) < 4.5; } }
    if (ok) { S.lore[e.id] = 1; fresh.push(e); }
  });
  if (fresh.length) { saveS(); loreQ.push(fresh); stat('lore', fresh.length); setTimeout(lorePop, 300); }
}
function lorePop() {
  if (loreBusy || !loreQ.length) return; if (scene || storyBusy || looting || MG.busy || !$('modal').hidden || !$('dlg').hidden) { setTimeout(lorePop, 700); return; }
  loreBusy = true; const es = loreQ.shift(), e = es[0], many = es.length > 1, tot = LORE.length, have = LORE.filter((x) => S.lore[x.id]).length;
  const el = document.createElement('div'); el.className = 'lorePop';
  el.innerHTML = '<canvas class="lpFx"></canvas><div class="lpCard"><div class="lpBook"><span>📜</span></div><small>' + (many ? es.length + ' lore entries discovered' : 'Lore discovered') + ' · ' + have + ' of ' + tot + '</small><h2>' + esc(many ? es.map((x) => x.title).join(' · ') : e.title) + '</h2><p>' + esc(many ? 'New pages in your Field Journal.' : e.text) + '</p><div class="lpBtns"><button type="button" data-a="read">' + 'Read in journal' + '</button><button type="button" class="ghost" data-a="ok">Back to patrol</button></div></div>';
  document.body.appendChild(el); paused = true;
  const fx = el.querySelector('.lpFx'), g = fx.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1); fx.width = innerWidth * dpr; fx.height = innerHeight * dpr;
  let parts = [], raf = 0; for (let i = 0; i < 70; i++) { const a = Math.random() * Math.PI * 2, v = (2 + Math.random() * 6) * dpr; parts.push({ x: fx.width / 2, y: fx.height * .42, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2 * dpr, s: (1.5 + Math.random() * 3) * dpr, life: 1 }); }
  const loop = () => { g.clearRect(0, 0, fx.width, fx.height); parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vx *= .97; p.vy = p.vy * .97 + .03 * dpr; p.life -= .007; g.globalAlpha = Math.max(0, p.life); g.fillStyle = '#ffe9a8'; g.beginPath(); g.arc(p.x, p.y, p.s, 0, 7); g.fill(); }); parts = parts.filter((p) => p.life > 0); if (Math.random() < .25) parts.push({ x: Math.random() * fx.width, y: fx.height + 5, vx: 0, vy: -1.2 * dpr, s: 1.6 * dpr, life: 1 }); raf = requestAnimationFrame(loop); }; loop();
  requestAnimationFrame(() => el.classList.add('in'));
  if (S.sound) [523, 659, 784, 1047, 1319].forEach((f, i) => beep(f, .5, 'sine', .025, i * .11));
  const close = (read) => { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => { cancelAnimationFrame(raf); el.remove(); paused = false; loreBusy = false; if (read) { jTab = 'lore'; JLORE = e.id; journal(); } else setTimeout(lorePop, 400); }, 380); };
  el.querySelectorAll('[data-a]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); close(b.dataset.a === 'read'); });
}
let JLORE = null;
const LORE_DIST = {}; DISTRICTS.forEach((D) => { const put = (x) => { if (Array.isArray(x) && x[1]) LORE_DIST[x[1]] = D.name; else if (x && x.strip) x.strip.forEach(put); }; D.lots.forEach(put); });

// ---------- field abilities from the skill tree ----------
let ABIL = {};
function abilitiesInit() { ABIL = {}; SKILLS.forEach((k) => { if (k.active && hasSk(k.id)) ABIL[k.active.key] = { left: k.active.uses, icon: k.active.icon, name: k.name, until: 0 }; }); abilHud(); }
function abilHud() {
  const el = $('abil'); if (!el) return; const keys = Object.keys(ABIL);
  el.hidden = !keys.length || !!inside && false; el.innerHTML = keys.map((k) => '<button type="button" data-ab="' + k + '" class="' + (ABIL[k].left ? '' : 'used') + (ABIL[k].until > clock ? ' on' : '') + '" title="' + esc(ABIL[k].name) + '"><span>' + ABIL[k].icon + '</span><em>' + ABIL[k].left + '</em></button>').join('');
  el.querySelectorAll('[data-ab]').forEach((b) => b.onclick = () => useAbility(b.dataset.ab));
}
function useAbility(k) { stat('ab_' + k);
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
function learn(id) { S.skills = S.skills || {}; S.skills[id] = Date.now(); saveS(); refreshGear(); abilitiesInit(); hud(); beep(784, .12, 'triangle', .05); beep(1175, .2, 'triangle', .05, .1); }

// ---------- ambience: clouds, fireflies, steam, wet reflections, color grade ----------
let AMB = { grass: [], holes: [] };
function ambienceInit() {
  AMB = { grass: [], holes: [], water: [], puddles: [] }; if (!W || W.inside) return;
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const v = W.at(x, y); if (v === T.GRASS && (x * 7 + y * 13) % 5 === 0) AMB.grass.push([x + .5, y + .5, Math.random() * 9]); if (v === T.ROAD && x % 11 === 1 && y % 11 === 6) AMB.holes.push([x + .5, y + .5]); if (v === T.WATER && (x + y * 3) % 2 === 0) AMB.water.push([x, y]); if ((v === T.ROAD || v === T.LOT || v === T.WALK) && ((x * 92821) ^ (y * 68917)) % 23 === 0) AMB.puddles.push([x + .3 + ((x * 7) % 5) / 12, y + .3 + ((y * 11) % 5) / 12, .6 + ((x + y) % 4) / 6]); }
}
function ambienceGround() { if (inside) return; AMB.holes.forEach(([x, y]) => { const [sx, sy] = iso(x, y); ctx.fillStyle = '#2b3038'; ctx.beginPath(); ctx.ellipse(sx, sy, 9, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#4a515c'; ctx.lineWidth = 1; ctx.stroke(); }); }
function vfxGround(now, vis) { // under the objects: puddles in the rain, sparkles on the water
  if (inside) return; const h = hourNow(), day = h >= 7 && h < 18.5;
  if (FX.rain) AMB.puddles.forEach(([x, y, r]) => { const [sx, sy] = iso(x, y); if (!vis(sx, sy)) return; const pg = ctx.createRadialGradient(sx - 4, sy - 2, 1, sx, sy, 16 * r); pg.addColorStop(0, day ? 'rgba(200,220,240,.35)' : 'rgba(255,220,160,.22)'); pg.addColorStop(.7, 'rgba(60,80,110,.25)'); pg.addColorStop(1, 'rgba(60,80,110,0)'); ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(sx, sy, 18 * r, 8 * r, 0, 0, Math.PI * 2); ctx.fill();
    const k = ((now / 700 + x * 3.1) % 1); ctx.strokeStyle = 'rgba(220,235,250,' + (.5 * (1 - k)) + ')'; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(sx + Math.sin(x * 9) * 6, sy + Math.cos(y * 7) * 2, 1 + k * 7, .5 + k * 3.5, 0, 0, Math.PI * 2); ctx.stroke(); });
  if (S.cfg.quality !== 'low') { const tw = now / 1000; for (let i = 0; i < AMB.water.length; i += 1) { const [x, y] = AMB.water[i], ph = (x * 1.7 + y * 2.3), k = Math.sin(tw * 2.2 + ph) ; if (k < .86) continue; const [sx, sy] = iso(x + .5 + Math.sin(ph) * .3, y + .5 + Math.cos(ph) * .3); if (!vis(sx, sy)) continue; const a = (k - .86) / .14; ctx.fillStyle = day ? 'rgba(255,255,255,' + (.8 * a) + ')' : 'rgba(255,240,200,' + (.45 * a) + ')'; ctx.beginPath(); ctx.moveTo(sx - 4 * a, sy); ctx.lineTo(sx, sy - 1.5 * a); ctx.lineTo(sx + 4 * a, sy); ctx.lineTo(sx, sy + 1.5 * a); ctx.fill(); } }
}
function sirenWash(now) { // emergency lights wash over the street, day and night
  if (inside) return; const ph = Math.floor(now / 160) % 2, night = NIGHT, src = [];
  if ((P.inCar || P.boat) && call && call.accepted) src.push([P.x, P.y]);
  Object.keys(others).forEach((k) => { const o = others[k]; if (o.v && o.st === 'call') src.push([o.rx, o.ry]); });
  if (!src.length) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  src.forEach(([x, y]) => { const [sx, sy] = iso(x, y); [[-1, ph ? '255,40,40' : '40,90,255'], [1, ph ? '40,90,255' : '255,40,40']].forEach(([d, c]) => { const gx = sx + d * 26, gy = sy + 4, gg = ctx.createRadialGradient(gx, gy, 2, gx, gy, 90); gg.addColorStop(0, 'rgba(' + c + ',' + (night ? .45 : .2) + ')'); gg.addColorStop(1, 'rgba(' + c + ',0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(gx, gy, 90, 46, 0, 0, Math.PI * 2); ctx.fill(); }); });
  ctx.restore();
}
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
  if (FX.rain && !inside) W.props.forEach((p) => { if (p.t !== 'lamp' || !p.on) return; const [ix, iy] = iso(p.x, p.y); glow(ix + 10, iy + 10, 22, 'rgba(255,214,150,.22)'); glow(ix + 10, iy + 26, 14, 'rgba(255,214,150,.14)'); });
}
function grade(dk) { // screen-space color grade by time of day
  if (S.cfg.quality === 'low') return;
  const h = hourNow(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, cv.height);
  if (h >= 6 && h < 8.5) { g.addColorStop(0, 'rgba(255,170,120,.16)'); g.addColorStop(1, 'rgba(255,220,180,0)'); }
  else if (h >= 8.5 && h < 16.5) { g.addColorStop(0, 'rgba(255,240,210,.07)'); g.addColorStop(1, 'rgba(120,170,255,.05)'); }
  else if (h >= 16.5 && h < 19.5) { g.addColorStop(0, 'rgba(255,110,90,.16)'); g.addColorStop(1, 'rgba(255,170,90,.08)'); }
  else { g.addColorStop(0, 'rgba(40,70,160,.12)'); g.addColorStop(1, 'rgba(10,20,60,.06)'); }
  if (S.cfg.quality === 'ultra') { ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalCompositeOperation = 'source-over'; } else { ctx.globalAlpha = .55; ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalAlpha = 1; }
  if (inside) return;
  const night = h >= 19.5 || h < 5.5, day = h >= 8 && h < 17;
  if (night) { ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,.28)'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalCompositeOperation = 'source-over'; }
  else if (day) { // the sun sits up and to the left; a soft warm bloom from that corner
    const s = ctx.createRadialGradient(cv.width * .1, -cv.height * .1, 0, cv.width * .1, -cv.height * .1, Math.max(cv.width, cv.height) * .9);
    s.addColorStop(0, 'rgba(255,236,190,' + (FX.rain ? .04 : .14) + ')'); s.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = s; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalCompositeOperation = 'source-over';
  }
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
  lampT -= dt; if (lampT <= 0) { lampT = 4; lampsUpdate(); }
  attT += dt;
  const cx = N / 2 + Math.cos(attT * .045) * 13, cy = N / 2 + Math.sin(attT * .06) * 11, [ix, iy] = iso(cx, cy);
  cam.x += (ix - cam.x) * Math.min(1, dt * .8); cam.y += (iy - cam.y) * Math.min(1, dt * .8);
  { const f = focus(); peds.forEach((p, k) => { if (Math.hypot(p.x - f[0], p.y - f[1]) > 30) peds[k] = newPed(); }); traffic.forEach((c, k) => { if (Math.hypot(c.x - f[0], c.y - f[1]) > 34) traffic[k] = newCar(); }); }
  peds.forEach((p) => { if (p.wait > 0) { p.wait -= dt; p.moving = false; return; } if (!p.path.length) { const t = nearTile(W.walk, 24); const path = Math.hypot(t[0] - p.x, t[1] - p.y) < 16 ? astar(p.x, p.y, t[0], t[1], pedPass, true) : null; if (path) p.path = path; else p.wait = 1; return; } if (stepAlong(p, dt, p.sp)) p.wait = 1 + Math.random() * 4; });
  traffic.forEach((c) => { if (c.stopped) return; if (!c.path.length) { for (let k = 0; k < 6; k++) { const x = Math.floor(c.x + (Math.random() - .5) * 40), y = Math.floor(c.y + (Math.random() - .5) * 40); if (roadPass(x, y)) { const p = astar(c.x, c.y, x, y, roadPass, false); if (p && p.length > 3) { c.path = p; break; } } } return; } stepAlong(c, dt, c.sp); });
  if (FX.rain) { for (let i = 0; i < (FX.storm ? 16 : 6); i++) FX.drops.push({ x: Math.random() * 1.3, y: -.05, v: (FX.storm ? 1.5 : .9) + Math.random() * .5 }); FX.drops.forEach((d) => { d.y += d.v * dt; d.x -= (.12 + (FX.wind || 0) * .6) * dt; }); FX.drops = FX.drops.filter((d) => d.y < 1.05); }
  if (FX.sail) { FX.sail.y += FX.sail.dir * dt * .5; if (FX.sail.y > N - 4 || FX.sail.y < 3) FX.sail.dir *= -1; }
}
function endAttract() { ATTRACT = false; document.body.classList.remove('attract'); musT = 0; }
// adaptive score (music.js): the mood follows what is happening on the street
const music = createScore(() => audio(), createMusic(() => audio())); // the recorded Patrol City score, with the synth score as a fallback
// browsers only let audio start from a tap or key press: every tap makes sure the music is actually running
// (this also wakes it after the phone locks or the tab goes to the background)
['pointerdown', 'touchend', 'keydown'].forEach((ev) => addEventListener(ev, () => { if (!S.sound) return; const a = audio(); if (!a) return; if (a.state !== 'running' && a.resume) { try { const r = a.resume(); if (r && r.catch) r.catch(() => {}); } catch (e) {} } if (!music.mood) { try { music.volume(S.cfg ? S.cfg.music : .8); music.start(ATTRACT ? 'title' : moodNow()); } catch (e) {} } }, { passive: true, capture: true }));
document.addEventListener('visibilitychange', () => { if (document.hidden || !S.sound || !AC) return; if (AC.state !== 'running' && AC.resume) AC.resume().catch(() => {}); });
let musT = 0;
function moodNow() {
  if (ATTRACT) return 'title';
  if (document.body.classList.contains('cine')) { const A = activeQ(); return A && A.side ? 'side' : 'story'; }
  if (scene) return 'scene';
  if (call && call.accepted && (call.prio === 1 || BUFF.speedTo > clock)) return 'urgent';
  if (call) return 'call';
  if (inside) return 'inside';
  if (P.boat) return 'water';
  const h = hourNow(); return h >= 19 || h < 6 ? 'night' : 'day';
}
function musicUpdate(dt) { musT -= dt; if (musT > 0) return; musT = .8; if (!S.sound) return; music.rain(FX.rain); music.start(moodNow()); }
function titleScreen() {
  const t = $('title'); t.hidden = false;
  t.innerHTML = '<div class="tiBadge"><svg viewBox="0 0 64 72"><defs><linearGradient id="tiG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#f5b800"/><stop offset="1" stop-color="#a86f00"/></linearGradient></defs><path d="M32 3l25 9v19c0 18-11 31-25 38C18 62 7 49 7 31V12z" fill="url(#tiG)" stroke="#5c3d00" stroke-width="1.6"/><path d="M32 10l19 7v14c0 14-8 24-19 30-11-6-19-16-19-30V17z" fill="#0b1630" stroke="#ffe27a" stroke-width="1.2"/><path d="M32 17l3 6.2 6.8 1-4.9 4.8 1.2 6.8-6.1-3.2-6.1 3.2 1.2-6.8-4.9-4.8 6.8-1z" fill="#ffe27a"/><text x="32" y="52" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="800" font-size="8" fill="#ffe27a" letter-spacing="1">PMPD</text></svg></div>' +
    '<h1 class="tiLogo"><span>PATROL</span><span>CITY</span><i class="tiShine"></i></h1><div class="tiSub">' + esc(WORLD.city.toUpperCase()) + ' · FIELD IMMERSION PROGRAM</div><div class="tiClass">' + esc(WORLD.tagline.split('·')[1] || '') + ' · Chapter 5</div>' +
    '<div class="tiMenu"></div><div class="tiVer">' + STUDIO.ver + ' · A ' + STUDIO.name.replace(/\b(\w)(\w*)/g, (m, a, b) => a + b.toLowerCase()) + ' production</div><div class="tiFoot"><button type="button" id="tiSnd">' + (S.sound ? '🔊 Sound on' : '🔇 Sound off') + '</button><span>A training simulation. Every scenario is a sim round.</span></div>';
  requestAnimationFrame(() => t.classList.add('in'));
  $('tiSnd').onclick = (e) => { e.stopPropagation(); S.sound = !S.sound; saveS(); $('tiSnd').textContent = S.sound ? '🔊 Sound on' : '🔇 Sound off'; if (S.sound) { audio(); music.start('title'); } else music.stop(); };
  let started = false; const go = () => { if (started) return; started = true; audio(); if (S.sound) music.start('title'); if (S.sound) { beep(392, .5, 'triangle', .05); beep(587, .7, 'triangle', .05, .15); } t.classList.add('out'); setTimeout(() => { t.hidden = true; t.classList.remove('in', 'out'); if (!S.seenIntro) coldOpen(startScreen); else startScreen(); }, 900); };
  mainMenu(go); t.onclick = null; if (S.sound) { audio(); music.volume(S.cfg.music); music.start('title'); }
}
// first time only: the world in four lines, over the city
function coldOpen(done) {
  const el = $('intro'); let i = 0; el.hidden = false;
  const show = () => { el.classList.remove('in'); void el.offsetWidth; if (i >= WORLD.intro.length) { el.classList.remove('in'); setTimeout(() => { el.hidden = true; S.seenIntro = 1; saveS(); done(); }, 600); return; } el.innerHTML = '<p class="inLine">' + esc(WORLD.intro[i]) + '</p><small>Tap to continue · <button type="button" id="inSkip">Skip</button></small>'; el.classList.add('in'); $('inSkip').onclick = (e) => { e.stopPropagation(); i = 99; show(); }; i++; };
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
  if (!inside && LIFE.tapViolator(near)) return;
  if (!inside && EVT.tap(near, reach)) return;
  if (!inside) for (const a of LIFE.acts) if (near(a.x, a.y, 30)) return reach(a.x, a.y, () => LIFE.run(a));
  if (!inside) for (const a of ACAD.acts) if (near(a.x, a.y, 30)) return reach(a.x, a.y, () => ACAD.run(a));
  if (!inside) for (const a of OFF.acts) if (near(a.x, a.y, 30)) return (P.boat ? a.boat : true) ? (Math.hypot(a.x - P.x, a.y - P.y) < (P.boat ? 3 : 1.9) ? OFF.run(a) : goTo(a.x, a.y, () => OFF.run(a))) : null;
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
    for (const st of W.staff) if (near(st.x, st.y, 30)) return reach(st.x, st.y + 1, () => { if (st.npc) return npcTalk({ n: st.npc, x: st.x, y: st.y }); const L2 = STAFF_LINES(W.key), id = sayAs('staff', { name: st.name || 'Staff', icon: st.icon || '🙂', role: st.role || W.name }); if (!st.talked) { st.talked = true; award(3, 'small talk'); }
      dialogue([[id, L2[Math.floor(Math.random() * L2.length)]], ['choice', [
        { t: 'Anything I should know about this place?', reply: [[id, W.blurb || 'Not much to tell. We keep it running, that\'s all.']] },
        { t: 'Mind if I take a look around?', reply: [[id, 'Go right ahead, officer. Just don\'t touch the coffee machine. It\'s temperamental.']], fx: () => { const sc = (W.secrets || []).find((x) => !S.found[x.id]); if (sc) PINGS.push({ x: sc.x, y: sc.y, t: performance.now(), c: '#a855f7' }); } },
        { t: 'Thanks. Have a good shift.', reply: [[id, 'You too. Stay safe.']] }]]], null, { focus: [st.x, st.y], kicker: (W.name || '').toUpperCase() }); });
  } else if (!P.inCar && !P.boat) {
    for (const l of W.lots) { if (!ENTER[l.kind] || Math.hypot(l.door[0] + .5 - P.x, l.door[1] - P.y) > 9) continue; const [dx, dy] = doorSpot(l); if (near(dx, dy, 26)) return reach(dx, dy + .7, () => enterBuilding(l)); }
  }
  if (pboat && !P.boat && !P.inCar && near(pboat.x, pboat.y, 34)) return reach(pboat.dock[0], pboat.dock[1], enterBoat);
  if (P.boat) { const [wx, wy] = unIso(ix, iy); if (W.at(Math.floor(wx), Math.floor(wy)) !== T.WATER) { toast('Docking. Tap the water to keep patrolling.'); return exitBoat(); } }
  const [wx, wy] = unIso(ix, iy); goTo(wx, wy);
}
addEventListener('keydown', (e) => { if (scene || paused || e.target.closest('input,textarea')) return; const k = { ArrowUp: [-1, -1], w: [-1, -1], ArrowDown: [1, 1], s: [1, 1], ArrowLeft: [-1, 1], a: [-1, 1], ArrowRight: [1, -1], d: [1, -1] }[e.key]; if (!k) return; e.preventDefault(); goTo(P.x + k[0] * 1.6, P.y + k[1] * 1.6); });
function enterCar() { P.inCar = true; P.x = pcar.x; P.y = pcar.y; const ok = ridePass(), r = nearest(Math.floor(P.x), Math.floor(P.y), (x, y) => ok(x, y)); if (r) { P.x = r[0] + .5; P.y = r[1] + .5; } toast(RIDE() === 'car' ? 'In your ' + U().ride.label.toLowerCase() + '. Tap the road to drive; lights and siren come on when you respond to a call.' : RIDE() === 'moto' ? 'On the police motorcycle. Fast and nimble, roads only.' : RIDE() === 'bike' ? 'On the patrol bike. Sidewalks, parks and plazas are all yours.' : 'Mounted up on Judge II. People love the horse. Parks and sidewalks are fine.'); hud(); }
function enterBoat() { if (!pboat) return; stat('boat'); P.boat = true; P.x = pboat.x; P.y = pboat.y; P.path = []; toast('Patrol boat launched. Tap the water to move; tap the shore to dock.'); hud(); }
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
      const ans = q.multi ? picked.slice() : picked[0], ok = L.isRight(q, ans); L.record(S, q, ok); SS.answered++; if (ok) { SS.right++; stat('right'); S.bestCombo = Math.max(S.bestCombo || 0, COMBO + 1); COMBO++; bestCombo = Math.max(bestCombo, COMBO); ord('right'); if (COMBO === 5) ord('streak'); } else COMBO = 0; comboHud(); if (ok) { right++; good(); } else bad();
      opts.forEach((b) => { const k = +b.dataset.k, isC = q.multi ? q.c.indexOf(k) >= 0 : k === q.c; b.disabled = true; if (isC) b.classList.add('ok'); else if (picked.indexOf(k) >= 0) b.classList.add('no'); });
      $('qFb').innerHTML = '<div class="fb ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? (COMBO >= 3 ? '🔥 ' + COMBO + ' in a row. ' : 'Correct.') : 'Not quite.' + (bestCombo >= 3 && COMBO === 0 ? ' Streak reset.' : '')) + '</b> ' + esc(q.fact || q.ex) + ' <em>p. ' + esc(q.pg) + '</em></div>';
      const go = $('qGo'); go.disabled = false; go.textContent = i < qs.length - 1 ? 'Next' : 'Finish'; go.onclick = () => { i++; if (i < qs.length) show(); else { saveS(); done({ right, n: qs.length }); } };
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
  const before = L.rankOf(S.xp).name; const sqm = squadMult(); if (sqm > 1) { stat('sqRP', Math.round(xp * (sqm - 1))); } xp = Math.round(xp * comboMult() * sqm * LIFE.rpMult() * OFF.rpMult() * (P.inCar && RIDE() === 'horse' ? 1.03 : 1)); S.cash = (S.cash || 0) + Math.round(xp * .4); S.xp += xp; SS.rp += xp; ACAD.weekAdd('rp', xp); const after = L.rankOf(S.xp).name; saveS(); hud();
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
  music.sting('promo'); shake(8, .6);
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
  if (!S.orders || S.orders.key !== key) { const pool = ORDERS.slice().sort(() => Math.random() - .5).slice(0, 3); S.orders = { key, list: pool.map((o) => ({ id: o[0], text: o[1], need: o[2], have: 0, done: false })) }; saveS(); }
  ordersHud();
}
function ord(id, n) {
  SS.ords[id] = (SS.ords[id] || 0) + (n || 1); if (!S.orders) return; let changed = false;
  S.orders.list.forEach((o) => { if (o.id !== id || o.done) return; o.have = Math.min(o.need, o.have + (n || 1)); changed = true; if (o.have >= o.need) { o.done = true; FLOATS.push({ x: P.x, y: P.y, t: performance.now() + 300, text: 'ORDER COMPLETE', sub: o.text }); beep(784, .12, 'triangle', .05); beep(1175, .2, 'triangle', .05, .1); setTimeout(() => award(60, 'shift order'), 300); if (S.orders.list.every((x) => x.done)) setTimeout(() => queueLoot('All shift orders complete', 1, 'r'), 900); else queueLoot('Shift order: ' + o.text, .4); } });
  if (changed) { saveS(); ordersHud(); }
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
// ---------- every interaction is a scene with choices ----------
const sayAs = (id, o) => { TEMP[id] = { name: o.name, icon: o.icon || '💬', role: o.role || '' }; return id; };
const CALLER = [['Caller', '📞'], ['Witness', '👀'], ['Neighbor', '🏠'], ['Store clerk', '🧾'], ['Resident', '🚪']];
function sceneEnd(kind, x, y) { stat('scenes'); }
let factReady = null;
function factWatch() {
  if (inside || ATTRACT) return; const m = L.districtMastery(S, W.did);
  if (S.newFact) { ACAD.weekAdd('f', S.newFact); FLOATS.push({ x: P.x, y: P.y, t: performance.now() + 200, text: 'FACT ✓' + (S.newFact > 1 ? ' ×' + S.newFact : ''), sub: m.facts.done + ' / ' + m.facts.total + ' in ' + W.D.name }); S.newFact = 0; saveS(); hud(); }
  if (factReady === null) factReady = m.ready; else if (m.ready && !factReady) { factReady = true; banner('🚨', 'District Final Call unlocked', 'Every fact in ' + W.D.name + ' is complete. Open the City map to take it.'); music.sting('done'); } else factReady = m.ready;
}
// regulars: a conversation with real options, not a menu
function npcTalk(r) {
  const n = r.n, f = S.npc[n.id] || 0, first = !talkedNow[n.id]; talkedNow[n.id] = talkedNow[n.id] || 1;
  const id = NPCS.find((x) => x.id === n.id) ? n.id : sayAs('reg_' + n.id, { name: n.name, icon: n.icon, role: n.role });
  const tier = f >= 6 ? 'best friends' : f >= 3 ? 'friends' : f >= 1 ? 'knows your name' : 'stranger';
  const line = n.lines[(f + (S.calls || 0)) % n.lines.length], helped = talkedNow[n.id] === 2;
  if (first) award(2, 'small talk');
  const help = () => { const les = W.D.lessons.indexOf(n.help) >= 0 ? n.help : rnd(W.D.lessons), q = L.pickFacts(S, [les], 1)[0];
    return [[id, n.cat ? '(The cat stares at you, waiting for the correct answer.)' : rnd(['Since you asked. Settle something for me.', 'Okay, cadet. Quick one, I\'ve been wondering about this.', 'You\'re the expert. Tell me this:'])], ['q', q, id],
      ['fx', (res) => { talkedNow[n.id] = 2; if (res.right) { ord('regular'); stat('helped'); const nf = Math.min(6, f + 1); S.npc[n.id] = nf; saveS(); award(Math.round(15 * rapMult() * (1 + gp('rpCit') / 100)), n.name + ' remembers that'); if (nf === 3 && f < 3) setTimeout(() => { banner(n.icon, n.name + ' is your friend now', 'They have something for you.'); queueLoot('A gift from ' + n.name, 1, 'u'); }, 600); else if (nf === 6 && f < 6) setTimeout(() => { banner(n.icon, 'Best friends with ' + n.name, 'They saved the good stuff for you.'); queueLoot('A gift from ' + n.name, 1, 'e'); }, 600); } else award(3, 'gave it a shot'); }]]; };
  const tip = () => { const sec = (W.secrets || []).filter((x) => !S.found[x.id]).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
    if (f >= 1 && sec) return [[id, 'Between you and me? People keep poking around near ' + (nearestLotTo(sec.x, sec.y) || 'the old lot') + '. Never found out why.'], ['fx', () => { PINGS.push({ x: sec.x, y: sec.y, t: performance.now(), c: '#a855f7' }); stat('tips'); }]];
    if (f >= 1) return [[id, 'Something felt off over that way, earlier. Might be nothing.'], ['fx', () => { const o = newObserve(); observes.push(o); o.seen = true; PINGS.push({ x: o.x, y: o.y, t: performance.now(), c: '#a855f7' }); stat('tips'); }]];
    return [[id, 'I don\'t really know you yet, cadet. Maybe next time.']]; };
  const V = VOICES[n.id] || ANYONE, bye = { t: n.cat ? 'Back away slowly' : 'Take care. I\'ll check on you later.', bye: true, reply: [[id, n.cat ? '(The cat blinks once. You have been dismissed.)' : rnd(['Stay safe out there, cadet.', 'You too, officer. Well, almost-officer.', 'See you around.', 'Come back anytime.'])]] };
  const arc = OFF.arcOption(n);
  const topics = [{ k: 'chat', t: n.cat ? 'Crouch down and say hello' : 'How\'s it going today?', reply: [[id, line]], fx: () => { if (f < 1 && !n.cat && Math.random() < .5) { S.npc[n.id] = Math.max(S.npc[n.id] || 0, 1); saveS(); } } }];
  if (arc) topics.unshift(Object.assign({ k: 'arc' }, arc));
  if (!helped) topics.push({ k: 'help', t: n.cat ? 'Offer an answer to the silent question' : 'Anything I can help you with?', reply: help() });
  if (!n.cat) topics.push({ k: 'tip', t: 'Seen anything unusual around here?', reply: tip() });
  if (!n.cat) topics.push({ k: 'more', t: rnd(['So what\'s your story?', 'How long have you been around here?', 'What\'s the neighborhood really like?']), reply: [[id, rnd(V.a)], [id, n.lines[(f + 1 + (S.calls || 0)) % n.lines.length]]] });
  // after each topic the talk keeps going: the menu comes back with what's left, until you say goodbye
  const menu = (left) => left.map((o) => Object.assign({}, o, { reply: o.reply.concat(left.length > 1 ? [['choice', menu(left.filter((x) => x !== o)).concat([bye]), rnd(['What else?', 'Anything else on your mind?', 'Keep talking, or head out?'])]] : [[id, rnd(['Well, I\'ll let you get back to it.', 'Anyway. Don\'t let me keep you.', 'Good talking with you.'])]]) }));
  const opts = menu(topics).concat([bye]);
  dialogue([[id, n.cat ? '(Exhibit A regards you from a sunny spot.)' : f >= 3 ? rnd(['There\'s my favorite cadet!', 'Hey, you! Come here, come here.', 'Look who it is.']) : f >= 1 ? rnd(['Oh, hey. Back again?', 'Cadet! Good to see you.']) : rnd(['Can I help you, officer?', 'Oh! Hello there.', 'Afternoon, officer.'])], ['choice', opts, 'You and ' + n.name.split(' ')[0] + ' are ' + tier + '.']], () => sceneEnd('npc'), { focus: [r.x || P.x, r.y || P.y], kicker: n.name.toUpperCase() + ' · ' + (n.role || '').toUpperCase() });
}
function nearestLotTo(x, y) { let best = null, bd = 1e9; (inside ? inside.O.W : W).lots.forEach((l) => { if (!l.name) return; const d = Math.hypot(l.door[0] - x, l.door[1] - y); if (d < bd) { bd = d; best = l.name; } }); return best; }
// calls: dispatch, arrival, your approach, the people on scene, then how you wrap it up
function openCallScene(c) { openCallSceneQ(c); }
function openCallSceneQ(c) {
  if (net) net.status('call'); paused = true;
  const n = c.prio === 1 ? 4 : 3, qs = L.pickFacts(S, [c.les], n), fast = clock - c.t0 < 40, a = approachFor(c.les), cl = rnd(CALLER), cid = sayAs('caller', { name: cl[0], icon: cl[1], role: c.where });
  const lines = [['narr', c.title + '. ' + c.where + '.'], ['velvet', '(over the radio) ' + S.cs + ', you\'re on scene. ' + c.text]];
  if (a) lines.push(['choice', a.opts, a.q]);
  lines.push([cid, rnd(['Officer! Over here. Thank goodness.', 'You got here fast. Okay, here\'s what happened.', 'I\'m the one who called. It\'s been a whole thing.', 'Finally. Let me tell you what I saw.'])]);
  qs.forEach((q, k) => { lines.push(['q', q, k % 2 ? 'castillo' : cid]); if (k === 0 && qs.length > 2) lines.push(['choice', [
    { t: 'Keep the scene calm and explain each step', eff2: 'calm', trust: 1, reply: [[cid, 'Okay. Okay, thank you for telling me what\'s happening.']] },
    { t: 'Stay focused and keep it brief', eff2: 'brief', reply: [[cid, 'Sure. Right. Whatever you need.']] },
    { t: 'Ask if anyone else saw what happened', eff2: 'canvass', reply: [[cid, 'The lady in the blue house was outside. She might know more.']], fx: () => { const z = newCitizen(); z.les = c.les; citizens.push(z); } }], 'Everyone is watching how you handle this.']); });
  lines.push(['choice', [
    { t: 'Give them a case number and your contact info', trust: 1, reply: [[cid, 'A case number. Okay. I feel better knowing someone wrote it down.']], fx: () => { c.wrap = 'case'; } },
    { t: 'Point them to resources that can help next time', reply: [[cid, 'I didn\'t know half of that existed. Thank you.']], fx: () => { c.wrap = 'resources'; } },
    { t: 'Clear the scene and get back in service', reply: [[cid, 'Oh. Okay. Bye, then.']], fx: () => { c.wrap = 'quick'; nextCall = Math.max(8, nextCall - 10); } }], 'How do you wrap it up?']);
  dialogue(lines, (res) => {
    paused = false; const eff = (res.choices.find((o) => o.eff) || {}).eff; c.eff = eff; if (eff) consequence(eff, c);
    const r = { right: res.right, n: res.n };
    S.calls++; SS.calls++; stat('p' + c.prio); if (inside) stat('inCall'); if (NIGHT) stat('nightCalls'); const effM = (APPROACH_BONUS[c.eff] || 1) * ((APPROACH_BONUS[c.eff] || 1) > 1 && hasSk('tac2') ? 1.15 : 1) * (c.prio === 1 && hasSk('tac4') ? 1.25 : 1); ord('call'); if (c.prio === 1) ord('pri1'); const mult = callMult(c) * effM, xp = Math.round((r.right * 25 + (fast ? 15 : 0) + (r.right === r.n ? 20 : 0) + (c.wrap === 'case' || c.wrap === 'resources' ? 10 : 0)) * mult); S.trust[W.did] = Math.max(0, Math.min(100, (S.trust[W.did] || 50) + (r.right - (r.n - r.right)) * (S.unit === 'brt' && (c.les === 9 || c.les === 10) ? 2 : 1)));
    openModal('<div class="sceneHead done"><b>CALL CLEARED</b><h2>' + r.right + ' of ' + r.n + ' handled by the book</h2><p>' + (fast ? 'Quick response bonus. ' : '') + (mult > 1.01 ? U().icon + ' ' + esc(U().perk) + ' bonus. ' : '') + (c.wrap === 'case' ? 'You left them a case number. ' : c.wrap === 'resources' ? 'You connected them with resources. ' : '') + (r.right === r.n ? 'Clean call. ' : 'Review what you missed in the hub.') + '</p></div>' + masteryLine() + '<div class="qAct"><button type="button" id="mDone">Back in service</button></div>');
    $('mDone').onclick = () => { closeModal(); radio(S.cs, 'Clear, back in service.'); award(xp, 'call cleared'); queueLoot('Found on scene: ' + c.title, r.right === r.n ? .6 : .3); nextCall = (25 + Math.random() * 25) * (S.unit === 'patrol' ? .75 : 1); if (net) net.backup(null); };
  }, { focus: [c.x, c.y], kicker: (c.prio === 1 ? 'PRIORITY 1' : c.prio === 2 ? 'PRIORITY 2' : 'ROUTINE') + ' · ' + c.where.toUpperCase() });
}
function streetLife(e) {
  if (e.k === 'music') { const id = sayAs('busker', { name: 'Street Musician', icon: '🎸', role: 'Founders Plaza regular' });
    dialogue([[id, rnd(['Officer! Any requests? I know three songs and one of them is the academy fight song. There is no academy fight song. I made one up.', 'Evening, officer. This next one is called "Ode to the Gig Line."'])], ['choice', [
      { t: 'Drop a dollar in the case', reply: [[id, 'A patron of the arts! This one\'s for you.']], fx: () => { if (!e.tipped) { e.tipped = true; award(8, 'community morale'); } } },
      { t: 'Request "anything but the PT playlist"', reply: [[id, 'A man of taste. Or woman of taste. Cadet of taste.']], fx: () => { if (!e.tipped) { e.tipped = true; award(5, 'community morale'); } } },
      { t: 'Remind him about the noise ordinance after 2200', reply: [[id, 'Fair. I\'ll wrap it up by ten. Promise.']], fx: () => { stat('ordinance'); } }]]], null, { focus: [e.x, e.y], kicker: 'STREET LIFE' }); }
  if (e.k === 'truck') { const id = sayAs('truck', { name: e.name || 'Food Truck', icon: '🌮', role: 'Parked for the shift' });
    dialogue([[id, rnd(['Officer! First taco is on the house.', 'Hungry? You look hungry. Cadets always look hungry.'])], ['choice', [
      { t: 'Thank her and pay anyway', trust: 1, reply: [[id, 'Ha! Okay, okay. Extra salsa for the honest one.']], fx: () => { if (!e.tipped) { e.tipped = true; award(6, 'integrity'); queueLoot(e.name, .45, 'c'); } S.flags.paidTruck = Date.now(); } },
      { t: 'Accept the free taco', reply: [[id, 'Enjoy! Tell your friends.'], ['narr', 'It is a very good taco. Somewhere, Sgt. Castillo frowns and does not know why.']], fx: () => { if (!e.tipped) { e.tipped = true; queueLoot(e.name, .35, 'c'); } S.flags.freeTaco = Date.now(); } },
      { t: 'Politely decline, you\'re on a call schedule', reply: [[id, 'Next time, then. I\'m here all week.']] }]]], null, { focus: [e.x, e.y], kicker: 'STREET LIFE' }); }
}
function citizenTalk(c) {
  const q = L.pickFacts(S, [c.les], 1)[0], id = sayAs('cit', { name: rnd(['Curious resident', 'Local business owner', 'Commuter', 'College student', 'Retired teacher']), icon: rnd(['🙋', '🧑‍💼', '🧑‍🎓', '👵', '🧔']), role: 'Has a question' });
  let rude = false;
  dialogue([[id, rnd(['Excuse me, officer? Quick question about something I read.', 'Officer, can I ask you something? My cousin says one thing, my neighbor says another.', 'Hi! Settle a bet for me?'])], ['choice', [
    { t: 'Of course. What\'s on your mind?', trust: 1, reply: [[id, 'Okay, so:']] },
    { t: 'Sure, but I\'ve only got a minute', reply: [[id, 'I\'ll be quick:']] },
    { t: 'I\'m busy. Call the non-emergency line', trust: -1, reply: [[id, 'Wow. Okay. I\'ll ask somebody else, I guess.']], fx: () => { rude = true; } }]],
    ['fx', () => {}]], (res) => {
    if (rude) { const i0 = citizens.indexOf(c); if (i0 >= 0) citizens[i0] = newCitizen(); radio('Dispatch', 'Complaint line got a call about a short-tempered cadet. Just so you know.'); return; }
    dialogue([['q', q, id]], (r) => { if (r.right) ord('citizen'); award(Math.round((r.right ? 15 : 5) * rapMult() * (S.unit === 'hoi' ? 1.5 : 1) * (1 + gp('rpCit') / 100)), 'citizen contact'); if (r.right && Math.random() < .35) radio('Dispatch', 'A resident called in to say a cadet was really helpful. Nice work.'); queueLoot('A thankful citizen hands you something', .15); const i0 = citizens.indexOf(c); if (i0 >= 0) citizens[i0] = newCitizen(); }, { focus: [c.x, c.y], kicker: 'CITIZEN CONTACT' });
  }, { focus: [c.x, c.y], kicker: 'CITIZEN CONTACT' });
}
function observeScene(o) {
  const q = L.pickFacts(S, [o.les], 1)[0];
  dialogue([['narr', 'Something\'s off. ' + o.text + '.'], ['choice', [
    { t: 'Hang back and watch a little longer', reply: [['narr', 'You take a minute. Details start to line up.']], fx: () => { o.watch = 1; } },
    { t: 'Walk up and take a closer look', reply: [['narr', 'Up close, it\'s clearer what you\'re looking at.']] },
    { t: 'Radio it in before doing anything', reply: [['velvet', '(over the radio) Copy, ' + S.cs + '. Logging it. Let me know what you find.']], fx: () => { o.radioed = 1; } }], 'How do you handle it?'],
    ['q', q, 'castillo']], (r) => { award(r.right ? 25 + (o.watch ? 5 : 0) + (o.radioed ? 5 : 0) : 5, 'sharp eyes'); queueLoot('Something\'s off: ' + o.text, o.watch ? .4 : .25); const i0 = observes.indexOf(o); if (i0 >= 0) observes[i0] = newObserve(); }, { focus: [o.x, o.y], kicker: 'SOMETHING\'S OFF' });
}
function infoPoint(i) {
  if (i.cool > 0) { toast('You checked ' + i.name + ' recently. Come back in a bit.'); return; }
  const f = L.fact(S, i.les); if (!f) return; const q = L.factQ(f.id);
  dialogue([['narr', i.name + '. ' + L.lessonName(i.les) + (f.done ? '. A fact you already know.' : '. A new fact.')], ['narr', f.text], ['choice', [
    { t: f.done ? 'Check yourself on it again' : 'Lock it in: check yourself now', reply: [['q', q, 'navarro']] },
    { t: 'Copy it into your notebook and move on', reply: [['narr', 'You write it down. Neatly. Navarro would be proud.']], fx: () => { award(4, 'notes'); } }], 'Study point']], (r) => { i.cool = S.unit === 'det' ? 60 : 120; ord('study'); if (r.n) award(Math.round((r.right ? 10 : 3) * rapMult() * (S.unit === 'sro' ? 2 : 1) * (1 + gp('rpStudy') / 100)), 'study point'); queueLoot('Left behind at ' + i.name, .1); }, { focus: [i.x, i.y], kicker: 'STUDY POINT · ' + i.name.toUpperCase() });
}
function backupScene(uid, o) {
  const ls = W.D.lessons.indexOf(6) >= 0 ? [6] : W.D.lessons, qs = L.pickFacts(S, ls, 2), id = sayAs('mate', { name: o.c, icon: (unitOf(o.u) || {}).icon || '🚓', role: 'Cadet requesting backup' });
  if (net) net.assist(uid); stat('assists'); if (S.squad && others[uid] && others[uid].g === S.squad.code) stat('sqAssist');
  dialogue([[id, '(over the radio) ' + S.cs + ', glad you\'re here. ' + (o.b.l || 'Need a second set of eyes.')], ['choice', [
    { t: 'Take cover position and watch the hands', reply: [[id, 'Copy, you\'re cover. I\'ll make contact.']] },
    { t: 'Watch the exits and the crowd', reply: [[id, 'Good call. Eyes out, I\'ve got the subject.']] },
    { t: 'Ask what they need from you', reply: [[id, 'Just be here. And maybe check this with me:']] }], 'You\'re the cover officer.'],
    ['q', qs[0], id], ['q', qs[1], 'castillo']], (r) => { award(20 + r.right * 15, 'backup'); if (net) net.assist(null); }, { focus: [o.b.x, o.b.y], kicker: 'BACKUP · COVER OFFICER' });
}

function masteryLine() {
  const m = L.districtMastery(S, W.did), f = m.facts;
  return '<div class="mLine"><b>' + esc(W.D.name) + ' facts</b><div class="mBars">' + W.D.lessons.map((l, k) => { const x = m.lessons[k].facts; return '<span title="' + esc(L.lessonName(l)) + ': ' + x.done + '/' + x.total + '" class="' + (x.done >= x.total ? 'done' : '') + '"><i style="width:' + Math.round(x.total ? x.done / x.total * 100 : 0) + '%"></i></span>'; }).join('') + '</div><small>' + f.done + ' of ' + f.total + ' facts completed' + (m.ready ? ' · District Final Call is ready' : '') + '</small></div>';
}

// ---------- district board and final call ----------
function districtBoard(tabs) {
  const rows = DISTRICTS.map((d) => {
    const un = S.unlocked.includes(d.id), cl = S.cleared.includes(d.id), m = L.districtMastery(S, d.id), here = W.did === d.id;
    return '<div class="dRow' + (here ? ' here' : '') + (un ? '' : ' locked') + '" style="--dc:' + d.color + '"><div class="dHead"><b>' + (un ? '' : '🔒 ') + esc(d.name) + '</b><span>' + esc(d.unit) + '</span></div>' +
      (un ? '<div class="dFacts"><b>' + m.facts.done + '</b> of ' + m.facts.total + ' facts completed</div><div class="dLes">' + d.lessons.map((l, k) => { const x = m.lessons[k].facts; return '<div class="dL"><span>' + esc(L.lessonName(l)) + ' <em>' + x.done + '/' + x.total + '</em></span><i><b style="width:' + Math.round(x.total ? x.done / x.total * 100 : 0) + '%" class="' + (x.done >= x.total ? 'ok' : '') + '"></b></i></div>'; }).join('') + '</div>' : '<p class="dLock">Complete every fact in the district before it and pass its Final Call.</p>') +
      '<div class="dAct">' + (cl ? '<span class="cleared">★ District cleared</span>' : '') + (un && !here ? '<button type="button" data-go="' + d.id + '">Patrol here</button>' : '') + (here && m.facts.done < m.facts.total ? '<button type="button" data-drill="1">Fact drill with Navarro</button>' : '') + (here && !cl ? '<button type="button" data-final="1" ' + (m.ready ? '' : 'disabled') + '>' + (m.ready ? 'Take the District Final Call' : 'Final Call · ' + (m.facts.total - m.facts.done) + ' facts to go') + '</button>' : '') + '</div></div>';
  }).join('');
  openModal('<div class="uNow" style="--uc:' + U().color + '"><span>' + U().icon + '</span><div><b>' + esc(unitName(U())) + '</b><small>' + esc(U().perk) + '</small></div><button type="button" id="uSw">Switch unit</button></div><div class="sceneHead"><b>CITY MAP · DISTRICTS</b><h2>Complete every fact to unlock the Final Call</h2><p>A fact is complete once you get its check right: at study points, on calls, with citizens and regulars, or in a fact drill. Pass a district\'s Final Call to transfer to the next district.</p></div>' + (S.cleared.length >= 5 ? '<div class="dExam"><b>Chapter 5 Final Exam</b><span>' + (S.graduated ? '★ Passed' : 'Every district cleared. Facts from the whole chapter, 85% to pass.') + '</span><button type="button" data-exam="1">' + (S.graduated ? 'Retake the exam' : 'Take the Chapter Exam') + '</button></div>' : '') + '' + (tabs || '') + '<div class="dList">' + rows + '</div><div class="qAct"><button type="button" class="ghost" id="mClose">Close</button></div>');
  $('mClose').onclick = closeModal; $('uSw').onclick = unitPicker; document.querySelectorAll('[data-j]').forEach((b) => b.onclick = () => { jTab = b.dataset.j; journal(); }); document.querySelectorAll('[data-tr]').forEach((b) => b.onclick = () => { S.track = b.dataset.tr; saveS(); beep(660, .06, 'triangle', .04); journal(); });
  document.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => { closeModal(); S.home = S.home == null ? +b.dataset.go : S.home; saveS(); clock = 0; travel(+b.dataset.go); });
  const fb = document.querySelector('[data-final]'); if (fb) fb.onclick = () => { closeModal(); finalCall(); };
  const dr = document.querySelector('[data-drill]'); if (dr) dr.onclick = () => { closeModal(); factDrill(); };
  const ex = document.querySelector('[data-exam]'); if (ex) ex.onclick = () => { closeModal(); chapterExam(); };
}
// fact drill: Navarro runs open facts with you, eight at a time
function factDrill() {
  const qs = L.pickFacts(S, W.D.lessons, 8), id = 'navarro';
  dialogue([[id, rnd(['Okay. Flashcards. Real ones, not the ones Pike drew on.', 'Fact drill. True or false, fast. I timed myself last night. Don\'t ask.', 'Let\'s knock out some facts. You\'ll thank me at the Final Call.'])]].concat(qs.map((q) => ['q', q, id])).concat([['fx', () => {}]]), (r) => {
    const fp = L.districtMastery(S, W.did).facts; award(r.right * 6, 'fact drill'); ord('study', 1);
    dialogue([[id, r.right + ' of ' + r.n + '. ' + (fp.done >= fp.total ? 'That\'s every fact in ' + W.D.name + '. The Final Call is open. Go.' : (fp.total - fp.done) + ' facts left in ' + W.D.name + '. Same time tomorrow?')]], null, { focus: [P.x, P.y] });
  }, { focus: [P.x, P.y], kicker: 'FACT DRILL · ' + W.D.name.toUpperCase() });
}
// the District Final Call: a major incident built from this district's facts. Pass to transfer.
function finalCall() {
  const m = L.districtMastery(S, W.did); if (!m.ready) { toast('Complete every fact in ' + W.D.name + ' first (' + m.facts.done + '/' + m.facts.total + ').'); return; }
  const facts = L.pickFacts(S, W.D.lessons, 10, { exam: true }), qs = L.pickFacts(S, W.D.lessons, 5, { exam: true }), nx = (W.did + 1) % 5, cid = sayAs('ic', { name: 'Incident Command', icon: '🛡️', role: W.D.name + ' · Final Call' });
  paused = true; music.set && music.start('urgent');
  const lines = [['narr', 'Major incident. ' + W.D.name + '. Every unit in the district is rolling.'], ['okonkwo', '(over the radio) ' + S.cs + ', this is your Final Call. Everything you learned in ' + W.D.name + ', all at once. Thirteen of fifteen by the book and you transfer out.'],
    ['choice', [{ t: 'Copy. Show me the scene.', reply: [['castillo', 'Breathe. Slow is smooth. Smooth is fast.']] }, { t: 'Request a moment to check my notes', reply: [['navarro', '(over the radio) You know this. You did every fact. Go.']] }], 'Ready?']];
  [...facts, ...qs].sort(() => Math.random() - .5).forEach((q, k) => lines.push(['q', q, k % 3 === 0 ? 'castillo' : k % 3 === 1 ? 'okonkwo' : cid]));
  dialogue(lines, (r) => {
    const pass = r.right >= 13; if (pass) { if (!S.cleared.includes(W.did)) S.cleared.push(W.did); if (!S.unlocked.includes(nx)) S.unlocked.push(nx); stat('finals'); } saveS(); paused = false;
    const allDone = S.cleared.length >= 5;
    openModal('<div class="sceneHead ' + (pass ? 'done' : 'p1') + '"><b>' + (pass ? 'DISTRICT CLEARED · TRANSFER APPROVED' : 'FINAL CALL · NOT YET') + '</b><h2>' + r.right + ' of ' + r.n + ' by the book</h2><p>' + (pass ? (allDone ? 'Every district cleared. The Chapter 5 Final Exam is open on the City map.' : 'Transfer orders are signed: ' + esc(DISTRICTS[nx].name) + ' is open. ' + esc(DISTRICTS[nx].unit) + '.') : 'You need 13 of 15. Review the facts you missed and come back.') + '</p></div><div class="qAct">' + (pass && !allDone ? '<button type="button" id="mGo">Transfer to ' + esc(DISTRICTS[nx].name) + '</button>' : '') + '<button type="button" class="' + (pass && !allDone ? 'ghost' : '') + '" id="mDone">' + (pass && !allDone ? 'Stay in ' + esc(W.D.name) + ' for now' : 'Back to patrol') + '</button></div>');
    if (pass) { good(); music.sting('promo'); shake(6, .5); }
    $('mDone').onclick = () => { closeModal(); award(pass ? 300 : 40, pass ? 'district cleared' : 'final call attempt'); if (pass) queueLoot('District cleared: ' + W.D.name, 1, 'r'); };
    if ($('mGo')) $('mGo').onclick = () => { closeModal(); award(300, 'district cleared'); queueLoot('District cleared: ' + W.D.name, 1, 'r'); S.home = nx; saveS(); clock = 0; travel(nx); };
  }, { focus: [P.x, P.y], kicker: 'DISTRICT FINAL CALL · ' + W.D.name.toUpperCase() });
}
// after all five districts: the Chapter 5 Final Exam, facts from the whole chapter, 85% to pass
function chapterExam() {
  const all = [0, 1, 2, 3, 4].flatMap((d) => DISTRICTS[d].lessons), facts = L.pickFacts(S, all, 50, { exam: true }), sp = ['castillo', 'okonkwo', 'navarro'];
  paused = true; music.start('story');
  dialogue([['narr', 'Patrol HQ, the training room. Fifty facts from the whole chapter.'], ['castillo', 'This is the whole chapter, cadet. Eighty-five percent. You\'ve done every one of these on the street already.'], ['choice', [{ t: 'Ready.', reply: [] }, { t: 'Give me a second.', reply: [['castillo', 'Take two. Then we start.']] }], 'Chapter 5 Final Exam']].concat(facts.map((q, k) => ['q', q, sp[k % 3]])), (r) => {
    paused = false; const pass = r.right / r.n >= .85; if (pass) { S.graduated = Date.now(); stat('exam'); } saveS();
    openModal('<div class="sceneHead ' + (pass ? 'done' : 'p1') + '"><b>' + (pass ? 'CHAPTER 5 · PASSED' : 'CHAPTER EXAM · NOT YET') + '</b><h2>' + r.right + ' of ' + r.n + ' (' + Math.round(r.right / r.n * 100) + '%)</h2><p>' + (pass ? 'Every district, every fact, and the whole chapter on one exam. Port Meridian is proud of you.' : 'You need 85%. Run fact drills in any district and try again.') + '</p></div><div class="qAct"><button type="button" id="mDone">' + (pass ? 'Carry on' : 'Back to patrol') + '</button></div>');
    if (pass) { music.sting('promo'); shake(8, .6); }
    $('mDone').onclick = () => { closeModal(); award(pass ? 1000 : 50, pass ? 'chapter exam passed' : 'exam attempt'); if (pass) queueLoot('Chapter 5 Final Exam', 1, 'l'); };
  }, { focus: [P.x, P.y], kicker: 'CHAPTER 5 FINAL EXAM' });
}
function gatePrompt(g) {
  const d = DISTRICTS[g.to];
  if (!S.unlocked.includes(g.to)) { toast('🔒 ' + d.name + ' is locked. Complete every fact in ' + W.D.name + ' and pass its Final Call to transfer.'); return; }
  openModal('<div class="sceneHead"><b>DISTRICT LINE</b><h2>Head into ' + esc(d.name) + '?</h2><p>' + esc(d.unit) + '. ' + esc(d.blurb) + '</p></div><div class="qAct"><button type="button" id="gGo">Patrol ' + esc(d.name) + '</button><button type="button" class="ghost" id="gNo">Stay here</button></div>');
  $('gGo').onclick = () => { closeModal(); travel(g.to); }; $('gNo').onclick = closeModal;
}
function endOfWatch() {
  scene = {}; const acc = SS.answered ? SS.right / SS.answered : 0, od = S.orders ? S.orders.list.filter((o) => o.done).length : 0;
  const score = acc * .6 + Math.min(SS.calls, 6) / 6 * .25 + od / 3 * .15, grade = score >= .92 ? 'S' : score >= .8 ? 'A' : score >= .65 ? 'B' : score >= .5 ? 'C' : 'D';
  stat('shifts'); stat('shift_' + S.shift); stat('grade' + grade); stat('d' + W.did + 'shifts');
  const note = { S: 'Outstanding watch. Castillo actually smiled. Witnesses are unsure.', A: 'Sharp work. The kind of shift people remember.', B: 'Solid shift. Clean up the misses and you\'re there.', C: 'You showed up and did the work. Now do it by the book.', D: 'Rough one. Every officer has them. Review, rest, come back.' }[grade];
  openModal('<div class="rpt"><div class="rptHead"><span>PORT MERIDIAN PD · SHIFT REPORT</span><b>' + esc(shiftOf().name) + ' · ' + esc(W.D.name) + '</b><small>' + esc(S.cs) + ' · ' + esc(unitName(U())) + '</small></div>' +
    '<div class="rptGrid"><div><em>' + SS.calls + '</em><span>Calls cleared</span></div><div><em>' + Math.round(acc * 100) + '%</em><span>Accuracy</span></div><div><em>' + bestCombo + '</em><span>Best streak</span></div><div><em>' + od + '/3</em><span>Shift orders</span></div><div><em>' + SS.rp + '</em><span>RP earned</span></div><div><em>' + esc(L.rankOf(S.xp).name) + '</em><span>Rank</span></div></div>' +
    '<div class="rptGrade g' + grade + '"><span>' + grade + '</span></div><p class="rptNote">' + esc(note) + '</p>' + masteryLine() + '</div><div class="qAct"><button type="button" id="eNext">Start next shift</button></div>');
  if (S.sound) [523, 659, 784].forEach((f, i) => beep(f, .25, 'triangle', .05, .5 + i * .1));
  $('eNext').onclick = () => { if (FX.storm) stat('stormShift'); const i = SHIFTS.findIndex((x) => x.id === S.shift); S.shift = SHIFTS[(i + 1) % 3].id; saveS(); clock = 0; closeModal(); load(W.did); award(grade === 'S' ? 120 : grade === 'A' ? 80 : 50, 'full shift · grade ' + grade); queueLoot('End of watch: found in your duty bag', 1, grade === 'S' ? 'r' : grade === 'A' ? 'u' : 'c'); };
}

// ---------- HUD ----------
// crisp line icons for the bottom bar (drawn, not emoji)
const ICON = {
  car: '<path d="M5 16h14M6.5 16l1.4-5.2A2 2 0 0 1 9.8 9.3h4.4a2 2 0 0 1 1.9 1.5L17.5 16"/><rect x="3.5" y="13" width="17" height="5" rx="1.6"/><circle cx="7.5" cy="18.5" r="1.6"/><circle cx="16.5" cy="18.5" r="1.6"/><path d="M10 6.5h4M12 4.5v2"/>',
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M12.5 8l-2.5 5 3 2.5 1 5M10 13l-2.5 7M12.5 8l3 3.5 3 .5M12.5 8L9 9.5 7.5 12.5"/>',
  anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v13M8 10h8M4.5 13.5A7.5 7.5 0 0 0 12 20a7.5 7.5 0 0 0 7.5-6.5"/>',
  comms: '<rect x="6" y="7" width="12" height="14" rx="2"/><path d="M9 3l3 4M9 11h6M9 14h6M9 17h3"/><circle cx="15" cy="17" r=".6"/>',
  target: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
  locker: '<path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7"/><rect x="4.5" y="7" width="15" height="13.5" rx="3"/><path d="M4.5 12.5h15M10.5 12.5v2.5h3v-2.5"/>',
  map: '<path d="M3.5 6.5l5.5-2.5 6 2.5 5.5-2.5v13.5l-5.5 2.5-6-2.5-5.5 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  menu: '<path d="M4.5 7h15M4.5 12h15M4.5 17h15"/>'
};
const ico = (k) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + '</svg>';
function setIcons() { [['bRadio', 'comms', 'Comms'], ['bMe', 'target', 'Center'], ['bLock', 'locker', 'Locker'], ['bMap', 'map', 'City'], ['bPause', 'menu', 'Menu']].forEach(([id, k, t]) => { const b = $(id); if (!b) return; const badge = b.querySelector('.bBadge'); b.innerHTML = '<i>' + ico(k) + '</i><span>' + t + '</span>'; if (badge) b.appendChild(badge); }); }
function hud() {
  const r = L.rankOf(S.xp), m = L.districtMastery(S, W.did);
  $('hCs').textContent = U().icon + ' ' + S.cs; $('hUnit').textContent = unitName(U()); $('hUnit').style.setProperty('--uc', U().color); $('hRank').textContent = r.name + ' · ' + S.xp + ' RP · $' + (S.cash || 0);
  $('hDist').textContent = inside ? W.name : W.D.name; $('hDist').style.setProperty('--dc', W.D.color);
  $('hMast').style.setProperty('--p', Math.round(m.pct * 100)); $('hMastN').textContent = Math.floor(m.pct * 100) + '%'; $('hMast').title = m.facts.done + ' of ' + m.facts.total + ' facts in ' + W.D.name;
  { const k = U().ride.kind, lab = P.boat ? 'Dock' : P.inCar ? 'Exit' : RIDE() === 'moto' ? 'Moto' : RIDE() === 'bike' ? 'Bike' : RIDE() === 'horse' ? 'Horse' : k === 'van' ? 'Van' : k === 'armored' || k === 'truck' ? 'Truck' : k === 'suv' ? 'SUV' : 'Car'; $('bCar').innerHTML = '<i>' + ico(P.boat ? 'anchor' : P.inCar ? 'walk' : 'car') + '</i><span>' + lab + '</span>'; } $('bCar').classList.toggle('on', P.inCar || P.boat);
  $('bSnd').innerHTML = '<i>' + ico(S.sound ? 'sound' : 'mute') + '</i><span>Sound</span>'; if (!setIcons.done) { setIcons.done = 1; setIcons(); }
}
function hudClock() { const t = (shiftOf().start * 60 + Math.floor(clock)) % 1440; const s = String(Math.floor(t / 60)).padStart(2, '0') + String(t % 60).padStart(2, '0') + ' hrs'; const el = $('hClock'); if (el.dataset.s !== s + EVT.WX.label) (el.dataset.s = s + EVT.WX.label, el.textContent = shiftOf().name + ' · ' + s + (EVT.WX.label ? ' ' + EVT.WX.label.split(' ')[0] : '')); }
const feed = [];
function radio(who, msg) { feed.push([who, msg]); while (feed.length > 30) feed.shift(); const el = $('radio'); el.innerHTML = feed.slice(-3).map((f) => '<div><b>' + esc(f[0]) + ':</b> ' + esc(f[1]) + '</div>').join(''); placeOrders(); }
function placeOrders() { const r = $('radio'), o = $('orders'); if (!r || !o) return; const b = r.getBoundingClientRect(); o.style.top = Math.max(b.bottom + 6, 0) + 'px'; }
addEventListener('resize', placeOrders);
function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 3800); }
$('bCar').onclick = () => { if (inside) { toast('Head outside first. The door is the glowing spot by the exit.'); return; } if (P.boat) exitBoat(); else if (P.inCar) exitCar(); else if (pcar) { if (Math.hypot(pcar.x - P.x, pcar.y - P.y) < 2.2) enterCar(); else { toast('Walking back to your ' + U().ride.label.toLowerCase() + '.'); goTo(pcar.x, pcar.y, enterCar); } } };
$('bMap').onclick = () => { jTab = chStep() ? 'story' : 'map'; journal(); }; $('bLock').onclick = locker;
$('bPause').onclick = () => pauseMenu();
$('bSnd').onclick = () => { S.sound = !S.sound; saveS(); hud(); if (S.sound) { audio(); music.start(moodNow()); } else music.stop(); };
$('bMe').onclick = () => { cam.free = false; }; { const mm = document.querySelector('.mini'); if (mm) mm.addEventListener('click', () => { cam.free = false; }); }
// X6 (busy): dispatch stops sending you calls. X8 (available): back in the rotation.
function statusBtn() { const b = $('bX'); if (!b) return; b.classList.toggle('busy', !!S.x6); b.innerHTML = '<i class="xCode">' + (S.x6 ? 'X6' : 'X8') + '</i><span><em class="lg">' + (S.x6 ? 'Busy' : 'Available') + '</em><em class="sm">' + (S.x6 ? 'Busy' : 'Avail') + '</em></span>'; b.title = S.x6 ? 'X6 (Busy): no calls. Tap to go X8 (Available).' : 'X8 (Available): taking calls. Tap to go X6 (Busy).'; }
function setStatus(busy) {
  if (busy && call && call.accepted) { toast('Clear your current call before going X6.'); return; }
  S.x6 = !!busy; saveS(); chirp(); statusBtn();
  if (busy) { radio(S.cs, 'X6.'); if (call) { call = null; callCard(); } setTimeout(() => radio('Dispatch', '10-4, ' + S.cs + ', X6. Holding your calls.'), 900); if (net) net.status('busy'); }
  else { radio(S.cs, 'X8.'); nextCall = Math.min(nextCall, 10); setTimeout(() => radio('Dispatch', '10-4, ' + S.cs + ', X8. Back in service.'), 900); if (net) net.status('patrol'); }
}
if ($('bX')) { $('bX').onclick = () => setStatus(!S.x6); statusBtn(); }
$('zIn').onclick = () => setZoom(cam.z * 1.2); $('zOut').onclick = () => setZoom(cam.z / 1.2);
$('bRadio').onclick = () => { const m = $('quick'); m.hidden = !m.hidden; $('bRadio').classList.remove('ping'); if (!m.hidden) { commsPanel(); setTimeout(() => { if (innerWidth > 700) { const i = $('chIn'); if (i) i.focus(); } }, 50); } };

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
  if (!$('quick').hidden && COMMS.tab === 'd') commsPanel();
}
function chatSend(text) {
  text = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 140); if (!text) return;
  if (Date.now() - CHAT.last < 2500) { toast('Easy on the radio. One message every few seconds.'); return; }
  CHAT.last = Date.now(); const m = clean(text);
  if (net && net.chatSend) net.chatSend(m, S.cs, S.shift); else radio(S.cs, m);
  SELF_SAY.text = m; SELF_SAY.at = performance.now(); chirp();
}
const SELF_SAY = { text: '', at: 0 };

// ---------- comms: district, city-wide, squad and direct messages, plus people and squads ----------
const COMMS = { tab: 'd', city: { list: [], seen: new Set() }, sq: { list: [], seen: new Set() }, dm: {}, dmOpen: null, inbox: {}, invites: {}, squad: null, unread: { d: 0, c: 0, s: 0, m: 0 }, started: false, sqStop: null, sqChatStop: null, cityStop: null, sqT: 0 };
S.squad = S.squad || null; S.dmRead = S.dmRead || {}; S.contacts = S.contacts || {};
const MAXSQ = 4;
function stat(k, n) { if (k === 'mgwin') ACAD.weekAdd('w', 1); S.stat = S.stat || {}; S.stat[k] = (S.stat[k] || 0) + (n == null ? 1 : n); }
const sqCode = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 6; i++) c += A[Math.floor(Math.random() * A.length)]; return c; };
const tagFrom = (n) => (String(n).toUpperCase().replace(/[^A-Z0-9 ]/g, '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('') || 'SQD').slice(0, 4).padEnd(2, 'X');
const meInfo = () => ({ c: S.cs, u: S.unit, r: L.rankOf(S.xp).name, d: W && W.did != null ? (inside ? inside.O.W.did : W.did) : 0, s: S.shift, st: call && call.accepted ? 'call' : 'patrol' });
function commsJoin() {
  if (!net || !net.listen) return;
  if (S.squad) net.squadTag(S.squad.code, S.squad.tag);
  if (COMMS.started) return; COMMS.started = true;
  COMMS.cityStop = net.listen(net.cityPath(), (all) => chanIn('c', all), 60);
  net.listen(net.inboxPath(), (all) => { COMMS.inbox = all; Object.keys(all).forEach((u) => { const m = all[u]; if (!m) return; S.contacts[u] = m.c; if (m.t > (S.dmRead[u] || 0) && N0() - m.t < 6e5 && !(COMMS.tab === 'm' && COMMS.dmOpen === u && !$('quick').hidden)) { if (!COMMS.dmToast || COMMS.dmToast[u] !== m.t) { COMMS.dmToast = COMMS.dmToast || {}; COMMS.dmToast[u] = m.t; radio('DM · ' + m.c, clean(m.m)); chirp(); } } }); badge(); if (!$('quick').hidden && COMMS.tab === 'm') commsPanel(); });
  net.listen(net.invPath(), (all) => { COMMS.invites = all; Object.keys(all).forEach((u) => { const v = all[u]; if (v && N0() - v.t < 6e5 && !(COMMS.seenInv || {})[u + v.t]) { COMMS.seenInv = COMMS.seenInv || {}; COMMS.seenInv[u + v.t] = 1; inviteCard(u, v); } }); badge(); });
  if (S.squad) squadListen(S.squad.code);
}
function chanIn(key, all) {
  const C = COMMS[key === 'c' ? 'city' : 'sq'], rows = Object.keys(all).map((k) => Object.assign({ k }, all[k])).filter((m) => m && m.m && m.t).sort((a, b) => a.t - b.t).slice(-60);
  rows.forEach((m) => { if (C.seen.has(m.k)) return; C.seen.add(m.k); C.list.push(m); if (C.list.length > 60) C.list.shift(); if (CHAT.muted.has(m.u) || m.u === myUid) return; S.contacts[m.u] = m.c;
    if (N0() - m.t < 60000) { radio((key === 'c' ? 'City · ' : (S.squad ? '[' + S.squad.tag + '] ' : '')) + m.c, clean(m.m)); if ($('quick').hidden || COMMS.tab !== key) { COMMS.unread[key]++; badge(); } } });
  if (!$('quick').hidden) commsPanel();
}
function badge() {
  const dmU = Object.keys(COMMS.inbox).filter((u) => COMMS.inbox[u] && COMMS.inbox[u].t > (S.dmRead[u] || 0)).length; COMMS.unread.m = dmU;
  const inv = Object.keys(COMMS.invites).filter((u) => COMMS.invites[u]).length, n = COMMS.unread.c + COMMS.unread.s + dmU + inv, b = $('bRadio'); if (!b) return;
  let el = b.querySelector('.bBadge'); if (!el) { el = document.createElement('em'); el.className = 'bBadge'; b.appendChild(el); } el.textContent = n > 9 ? '9+' : n; el.hidden = !n;
}
// ---- squads ----
function squadListen(code) {
  if (COMMS.sqStop) COMMS.sqStop(); if (COMMS.sqChatStop) COMMS.sqChatStop(); COMMS.sq = { list: [], seen: new Set() };
  COMMS.sqStop = net.listen('mmo/sq/' + code, (v) => {
    const i = v.i, m = v.m || {};
    if (!i || !m[myUid]) { if (S.squad && S.squad.code === code && COMMS.squad) { toast('You are no longer in ' + (S.squad.name || 'your squad') + '.'); squadDrop(); } else if (!i) squadDrop(); return; }
    const first = !COMMS.squad; COMMS.squad = { code, i, m }; S.squad = { code, name: i.n, tag: i.g, lead: i.l === myUid }; saveS(); net.squadTag(code, i.g);
    if (first) radio('[' + i.g + '] Squad', 'Squad channel open. ' + Object.keys(m).length + ' member' + (Object.keys(m).length === 1 ? '' : 's') + '.');
    if (!$('quick').hidden && (COMMS.tab === 's' || COMMS.tab === 'p')) commsPanel();
  });
  COMMS.sqChatStop = net.listen(net.sqChatPath(code), (all) => chanIn('s', all), 60);
  net.sqBeat(code, meInfo());
}
function squadDrop() { if (COMMS.sqStop) COMMS.sqStop(); if (COMMS.sqChatStop) COMMS.sqChatStop(); COMMS.sqStop = COMMS.sqChatStop = null; COMMS.squad = null; S.squad = null; saveS(); if (net) net.squadTag(null, null); if (!$('quick').hidden) commsPanel(); }
async function squadCreate(name) {
  if (!net) return toast('Squads need a connection.'); name = clean(String(name || '').trim()).slice(0, 24); if (name.length < 2) return toast('Give your squad a name (2 to 24 letters).');
  const code = sqCode(), tag = tagFrom(name);
  try { await net.sqCreate(code, name, tag); await net.sqJoin(code, meInfo()); } catch (e) { return toast('Could not create the squad. Try again.'); }
  S.squad = { code, name, tag, lead: true }; saveS(); stat('squadMade'); squadListen(code); music.sting('accept'); banner('🛡️', 'Squad formed: ' + name + ' [' + tag + ']', 'Share code ' + code + ' or invite cadets from People.');
}
async function squadJoin(code, from) {
  if (!net) return toast('Squads need a connection.'); code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 6) return toast('Squad codes are 6 letters and numbers.');
  if (S.squad && S.squad.code === code) return toast('You are already in this squad.');
  let v = null; try { v = await net.sqGet(code); } catch (e) {}
  if (!v || !v.i) return toast('No squad found with code ' + code + '.');
  if (Object.keys(v.m || {}).length >= MAXSQ) return toast(v.i.n + ' is full (' + MAXSQ + ' cadets).');
  if (S.squad) await squadLeave(true);
  try { await net.sqJoin(code, meInfo()); } catch (e) { return toast('Could not join. Try again.'); }
  if (from) net.invClear(from); S.squad = { code, name: v.i.n, tag: v.i.g, lead: false }; saveS(); stat('squadJoin'); squadListen(code); music.sting('accept');
  banner('🛡️', 'Joined ' + v.i.n + ' [' + v.i.g + ']', 'Squad channel is open. Stay close for the squad RP bonus.');
  net.post(net.sqChatPath(code), { c: S.cs, m: S.cs + ' joined the squad.' });
}
async function squadLeave(quiet) {
  if (!S.squad || !net) return; const sq = COMMS.squad, code = S.squad.code;
  if (sq && sq.i.l === myUid) { const rest = Object.keys(sq.m).filter((u) => u !== myUid); if (rest.length) { try { await net.sqLead(code, rest[0]); } catch (e) {} } }
  try { await net.sqLeave(code); } catch (e) {} squadDrop(); if (!quiet) toast('You left the squad.');
}
function nearSquad() { if (!S.squad) return 0; let n = 0; Object.keys(others).forEach((k) => { const o = others[k]; if (o.g === S.squad.code && Math.hypot(o.rx - P.x, o.ry - P.y) < 16) n++; }); return n; }
function squadMult() { return nearSquad() ? 1 + .1 + gp('rpSquad') / 100 : 1; }
function squadTick(dt) {
  if (!S.squad || !net) { if ($('sqChip')) $('sqChip').hidden = true; return; } COMMS.sqT -= dt; if (COMMS.sqT <= 0) { COMMS.sqT = 25; net.sqBeat(S.squad.code, meInfo()); }
  const n = nearSquad(), el = $('sqChip'); if (!el) return; el.hidden = !n; if (n) el.textContent = '🛡️ Squad +' + Math.round((squadMult() - 1) * 100) + '% RP';
}
function inviteCard(from, v) {
  const el = $('invCard'); if (!el) return;
  el.innerHTML = '<span>📨</span><div><b>' + esc(v.c) + '</b> invited you to <b>' + esc(v.n) + (v.g ? ' [' + esc(v.g) + ']' : '') + '</b></div><button type="button" id="ivY">Join</button><button type="button" class="ghost" id="ivN">Decline</button>';
  el.hidden = false; chirp();
  $('ivY').onclick = () => { el.hidden = true; squadJoin(v.s, from); }; $('ivN').onclick = () => { el.hidden = true; net.invClear(from); delete COMMS.invites[from]; badge(); };
  clearTimeout(inviteCard.t); inviteCard.t = setTimeout(() => { el.hidden = true; }, 20000);
}
// ---- the comms panel ----
const fmtT = (t) => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0'); };
function msgRows(rows, empty) {
  return rows.length ? rows.map((m) => { const me = m.u === myUid; return '<div class="chMsg' + (me ? ' me' : '') + '"><b>' + (me ? esc(m.c) : '<button type="button" class="chWho" data-u="' + esc(m.u) + '" data-c="' + esc(m.c) + '">' + esc(m.c) + '</button>') + (m.s && m.s !== S.shift ? ' <i>' + ({ day: 'Day', mid: 'Mid', night: 'Night' }[m.s] || '') + '</i>' : '') + (m.d != null && COMMS.tab === 'c' ? ' <i>' + esc((DISTRICTS[m.d] || {}).name || '') + '</i>' : '') + ' <time>' + fmtT(m.t) + '</time></b><span>' + esc(clean(m.m)) + '</span></div>'; }).join('') : '<p class="chEmpty">' + empty + '</p>';
}
function commsPanel() {
  const keep = $('chIn') && document.activeElement === $('chIn') ? $('chIn').value : ($('chIn') ? $('chIn').value : null), hadFocus = $('chIn') && document.activeElement === $('chIn'), keepId = ['sqName', 'sqCodeIn'].map((id) => $(id) ? [id, $(id).value] : null).filter(Boolean);
  const q = $('quick'), T = COMMS.tab, inv = Object.keys(COMMS.invites).filter((u) => COMMS.invites[u]).length;
  if (T === 'c') COMMS.unread.c = 0; if (T === 's') COMMS.unread.s = 0; badge();
  const tabs = [['d', '📻 District'], ['c', '🏙️ City'], ['s', '🛡️ Squad' + (S.squad ? ' [' + esc(S.squad.tag) + ']' : '')], ['m', '✉️ Direct'], ['p', '👥 People']];
  const cnt = { c: COMMS.unread.c, s: COMMS.unread.s + (S.squad ? 0 : inv), m: COMMS.unread.m };
  let body = '', form = '';
  const sendForm = (ph) => '<form class="chForm" id="chForm"><input id="chIn" maxlength="140" autocomplete="off" placeholder="' + esc(ph) + '" aria-label="Message"><button type="submit">Send</button></form>';
  if (T === 'd') { body = '<div class="chList" id="chList">' + msgRows(CHAT.list.filter((m) => !CHAT.muted.has(m.u)).slice(-40), 'Quiet channel. Say hi to the cadets on shift in ' + esc(W.D.name) + '.') + '</div><div class="chQuick">' + QUICK.map((t, k) => '<button type="button" data-q="' + k + '">' + esc(t) + '</button>').join('') + '</div>'; form = sendForm('Message ' + W.D.name + '…'); }
  if (T === 'c') { body = '<div class="chList" id="chList">' + msgRows(COMMS.city.list.filter((m) => !CHAT.muted.has(m.u)).slice(-40), 'The city-wide channel reaches every district and every shift.') + '</div>'; form = sendForm('Message all of Port Meridian…'); }
  if (T === 's') {
    if (!S.squad) {
      body = '<div class="sqNone">' + (inv ? '<div class="sqInv"><b>Invitations</b>' + Object.keys(COMMS.invites).filter((u) => COMMS.invites[u]).map((u) => { const v = COMMS.invites[u]; return '<div class="sqRow"><span>📨 <b>' + esc(v.n) + (v.g ? ' [' + esc(v.g) + ']' : '') + '</b><small>from ' + esc(v.c) + '</small></span><button type="button" data-ij="' + esc(u) + '">Join</button><button type="button" class="ghost" data-in="' + esc(u) + '">Decline</button></div>'; }).join('') + '</div>' : '') +
        '<h3>Start a squad</h3><p>Up to ' + MAXSQ + ' cadets. Squadmates share a private channel, see where everyone is from any district, and earn <b>+10% RP</b> when they work close together.</p><form class="chForm" id="sqMake"><input id="sqName" maxlength="24" placeholder="Squad name, e.g. Night Owls" autocomplete="off"><button type="submit">Create</button></form>' +
        '<h3>Join with a code</h3><form class="chForm" id="sqJoinF"><input id="sqCodeIn" maxlength="6" placeholder="6-character code" autocomplete="off" style="text-transform:uppercase"><button type="submit">Join</button></form></div>';
    } else {
      const sq = COMMS.squad, mem = sq ? sq.m : {}, lead = sq && sq.i.l === myUid;
      body = '<div class="sqHead"><div><b>' + esc(S.squad.name) + ' <em>[' + esc(S.squad.tag) + ']</em></b><small>Code <code id="sqCode">' + esc(S.squad.code) + '</code> <button type="button" class="ghost tiny" id="sqCopy">Copy</button></small></div><button type="button" class="ghost tiny" id="sqLeave">Leave</button></div>' +
        '<div class="sqMem">' + Object.keys(mem).map((u) => { const m = mem[u], on = N0() - (m.t || 0) < 90000, here = others[u], isLead = sq.i.l === u; return '<div class="sqRow' + (u === myUid ? ' me' : '') + '"><span><i class="dot' + (on ? ' on' : '') + '"></i><b>' + (isLead ? '⭐ ' : '') + esc(m.c) + '</b><small>' + esc(unitName(UNITS.find((x) => x.id === m.u) || UNITS[0])) + ' · ' + esc(m.r || '') + ' · ' + (on ? esc((DISTRICTS[m.d] || {}).name || '') + (m.st === 'call' ? ' · on a call' : '') : 'offline') + '</small></span>' +
          (u === myUid ? '' : '<button type="button" class="ghost tiny" data-dm="' + esc(u) + '" data-c="' + esc(m.c) + '">✉️</button>' + (here ? '<button type="button" class="ghost tiny" data-loc="' + esc(u) + '">📍</button>' : on && m.d !== W.did && S.unlocked.includes(m.d) ? '<button type="button" class="ghost tiny" data-go="' + m.d + '">Go</button>' : '') + (lead ? '<button type="button" class="ghost tiny" data-kick="' + esc(u) + '">✕</button>' : '')) + '</div>'; }).join('') + (Object.keys(mem).length < MAXSQ ? '<p class="sqHint">' + (MAXSQ - Object.keys(mem).length) + ' open spot' + (MAXSQ - Object.keys(mem).length === 1 ? '' : 's') + '. Invite cadets from People, or share the code.</p>' : '') + '</div>' +
        '<div class="chList short" id="chList">' + msgRows(COMMS.sq.list.slice(-40), 'Squad channel. Only your squad can see this.') + '</div><div class="chQuick"><button type="button" id="sqPing">📍 Share my location</button><button type="button" id="sqRally">🚓 Rally on me</button></div>';
      form = sendForm('Message your squad…');
    }
  }
  if (T === 'm') {
    if (COMMS.dmOpen) { const u = COMMS.dmOpen, c = S.contacts[u] || (others[u] || {}).c || 'Cadet', th = COMMS.dm[u] || { list: [] };
      body = '<div class="dmHead"><button type="button" class="ghost tiny" id="dmBack">‹ Back</button><b>' + esc(c) + '</b>' + (others[u] ? '<small>on shift here</small>' : '') + '</div><div class="chList" id="chList">' + msgRows(th.list.slice(-50), 'Direct messages are private between you and ' + esc(c) + '.') + '</div>'; form = sendForm('Message ' + c + '…');
    } else { const us = [...new Set(Object.keys(COMMS.inbox).concat(Object.keys(COMMS.dm)))].filter((u) => u !== myUid);
      body = '<div class="dmList">' + (us.length ? us.sort((a, b) => ((COMMS.inbox[b] || {}).t || 0) - ((COMMS.inbox[a] || {}).t || 0)).map((u) => { const ib = COMMS.inbox[u], un = ib && ib.t > (S.dmRead[u] || 0); return '<button type="button" class="dmRow' + (un ? ' un' : '') + '" data-dm="' + esc(u) + '" data-c="' + esc(S.contacts[u] || (ib || {}).c || 'Cadet') + '"><b>' + esc(S.contacts[u] || (ib || {}).c || 'Cadet') + '</b><small>' + (ib ? esc(clean(ib.m)) : 'Open conversation') + '</small>' + (un ? '<i></i>' : '') + '</button>'; }).join('') : '<p class="chEmpty">No messages yet. Tap any cadet\'s name in a channel or in People to message them directly.</p>') + '</div>';
    }
  }
  if (T === 'p') {
    const ks = Object.keys(others).sort((a, b) => Math.hypot(others[a].rx - P.x, others[a].ry - P.y) - Math.hypot(others[b].rx - P.x, others[b].ry - P.y));
    body = '<div class="pplList"><p class="pplNote">' + (ks.length ? ks.length + ' cadet' + (ks.length === 1 ? '' : 's') + ' on shift in ' + esc(W.D.name) + (S.shift === 'mid' ? ' (Day and Night can see you too)' : '') : 'Nobody else is on shift in ' + esc(W.D.name) + ' right now. Try the City channel to find squadmates.') + '</p>' +
      ks.map((k) => { const o = others[k], u = UNITS.find((x) => x.id === o.u) || UNITS[0], d = Math.hypot(o.rx - P.x, o.ry - P.y); return '<button type="button" class="pplRow" data-pp="' + esc(k) + '"><span class="pplIco">' + u.icon + '</span><span><b>' + (o.k ? '<em>[' + esc(o.k) + ']</em> ' : '') + esc(o.c) + '</b><small>' + esc(unitName(u)) + ' · ' + esc(o.r || 'Cadet') + ' · ' + ({ day: 'Day', mid: 'Mid', night: 'Night' }[o.sh] || '') + (o.st === 'call' ? ' · on a call' : '') + '</small></span><em>' + Math.round(d * 4) * 5 + ' ft</em></button>'; }).join('') + '</div>';
  }
  q.innerHTML = '<div class="chHead"><b>Comms</b><span>' + (Object.keys(others).length + 1) + ' on shift · ' + esc(W.D.name) + '</span><button type="button" id="chX" aria-label="Close">×</button></div><div class="chTabs">' + tabs.map(([k, t]) => '<button type="button" data-t="' + k + '" class="' + (T === k ? 'on' : '') + '">' + t + (cnt[k] ? '<i>' + cnt[k] + '</i>' : '') + '</button>').join('') + '</div>' + body + form + '<p class="chRule">Keep it professional. Everyone here is a cadet in training.</p>';
  const L2 = $('chList'); if (L2) L2.scrollTop = L2.scrollHeight;
  if (keep && $('chIn')) { $('chIn').value = keep; } if (hadFocus && $('chIn')) $('chIn').focus(); keepId.forEach(([id, v]) => { if ($(id)) $(id).value = v; });
  $('chX').onclick = () => { q.hidden = true; };
  q.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { COMMS.tab = b.dataset.t; COMMS.dmOpen = null; feSound('move'); commsPanel(); });
  q.querySelectorAll('[data-q]').forEach((b) => b.onclick = () => { radio(S.cs, QUICK[+b.dataset.q]); if (net) net.quick(+b.dataset.q); SELF_SAY.text = QUICK[+b.dataset.q]; SELF_SAY.at = performance.now(); chirp(); q.hidden = true; });
  q.querySelectorAll('.chWho').forEach((b) => b.onclick = () => profileCard(b.dataset.u, b.dataset.c));
  q.querySelectorAll('[data-pp]').forEach((b) => b.onclick = () => profileCard(b.dataset.pp, others[b.dataset.pp].c));
  q.querySelectorAll('[data-dm]').forEach((b) => b.onclick = () => openDM(b.dataset.dm, b.dataset.c));
  q.querySelectorAll('[data-ij]').forEach((b) => b.onclick = () => squadJoin(COMMS.invites[b.dataset.ij].s, b.dataset.ij));
  q.querySelectorAll('[data-in]').forEach((b) => b.onclick = () => { net.invClear(b.dataset.in); delete COMMS.invites[b.dataset.in]; commsPanel(); });
  q.querySelectorAll('[data-kick]').forEach((b) => b.onclick = () => { if (!confirmLite(b, 'Remove?')) return; net.sqLeave(S.squad.code, b.dataset.kick); });
  q.querySelectorAll('[data-loc]').forEach((b) => b.onclick = () => { const o = others[b.dataset.loc]; if (o) { const [sx, sy] = iso(o.rx, o.ry); cam.free = true; cam.x = sx; cam.y = sy; PINGS.push({ x: o.rx, y: o.ry, t: performance.now(), c: '#34d399' }); q.hidden = true; } });
  q.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => { q.hidden = true; travel(+b.dataset.go); });
  if ($('sqMake')) $('sqMake').onsubmit = (e) => { e.preventDefault(); squadCreate($('sqName').value); };
  if ($('sqJoinF')) $('sqJoinF').onsubmit = (e) => { e.preventDefault(); squadJoin($('sqCodeIn').value); };
  if ($('sqLeave')) $('sqLeave').onclick = (e) => { if (!confirmLite(e.target, 'Leave squad?')) return; squadLeave(); };
  if ($('sqCopy')) $('sqCopy').onclick = () => { try { navigator.clipboard.writeText(S.squad.code); toast('Squad code copied: ' + S.squad.code); } catch (e) { toast('Squad code: ' + S.squad.code); } };
  if ($('sqPing')) $('sqPing').onclick = () => { const lot = nearestLot(); net.post(net.sqChatPath(S.squad.code), { c: S.cs, m: '📍 ' + (lot ? 'near ' + lot : 'here') + ', ' + W.D.name + '.', d: W.did }); stat('sqPing'); };
  if ($('sqRally')) $('sqRally').onclick = () => { net.backup({ x: P.x, y: P.y, l: 'Squad rally: ' + S.squad.tag }); net.post(net.sqChatPath(S.squad.code), { c: S.cs, m: '🚓 Rally on me in ' + W.D.name + '. Look for the blue marker.', d: W.did }); stat('sqRally'); toast('Rally point set. Your squad can see your marker.'); };
  if ($('dmBack')) $('dmBack').onclick = () => { COMMS.dmOpen = null; commsPanel(); };
  if ($('chForm')) $('chForm').onsubmit = (e) => { e.preventDefault(); const v = $('chIn').value; $('chIn').value = ''; commsSend(v); };
}
function confirmLite(b, txt) { if (b.dataset.sure) return true; b.dataset.sure = 1; const was = b.textContent; b.textContent = txt; setTimeout(() => { if (b.isConnected) { delete b.dataset.sure; b.textContent = was; } }, 2500); return false; }
function nearestLot() { const outW = inside ? inside.O.W : W; let best = null, bd = 1e9; outW.lots.forEach((l) => { if (!l.name) return; const d = Math.hypot(l.door[0] - P.x, l.door[1] - P.y); if (d < bd) { bd = d; best = l.name; } }); return bd < 12 ? best : null; }
function commsSend(text) {
  const T = COMMS.tab; text = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 140); if (!text) return;
  if (T === 'd') return chatSend(text);
  if (Date.now() - CHAT.last < 2000) { toast('Easy on the radio. One message every few seconds.'); return; } CHAT.last = Date.now();
  const m = clean(text); if (!net) { toast('Comms need a connection.'); return; }
  if (T === 'c') { net.post(net.cityPath(), { c: S.cs, m, s: S.shift, d: W.did }); stat('city'); }
  if (T === 's' && S.squad) { net.post(net.sqChatPath(S.squad.code), { c: S.cs, m, s: S.shift, d: W.did }); stat('sqMsg'); }
  if (T === 'm' && COMMS.dmOpen) { net.dmSend(COMMS.dmOpen, m, S.cs); stat('dm'); }
  chirp();
}
function openDM(u, c) {
  if (u === myUid) return; if (c) S.contacts[u] = c; COMMS.tab = 'm'; COMMS.dmOpen = u; $('quick').hidden = false; closeModal();
  if (!COMMS.dm[u]) { COMMS.dm[u] = { list: [], seen: new Set() }; COMMS.dm[u].stop = net ? net.listen(net.dmPath(u), (all) => { const th = COMMS.dm[u]; Object.keys(all).map((k) => Object.assign({ k }, all[k])).sort((a, b) => a.t - b.t).forEach((m) => { if (th.seen.has(m.k)) return; th.seen.add(m.k); th.list.push(m); }); if (COMMS.dmOpen === u) { S.dmRead[u] = Date.now() + 1; badge(); if (!$('quick').hidden) commsPanel(); } }, 60) : null; }
  S.dmRead[u] = Date.now() + 1; saveS(); badge(); commsPanel();
}
function profileCard(u, c) {
  if (u === myUid) return; const o = others[u], un = o && (UNITS.find((x) => x.id === o.u) || UNITS[0]), mem = COMMS.squad && COMMS.squad.m[u], muted = CHAT.muted.has(u);
  openModal('<div class="ppCard"><div class="ppIco">' + (un ? un.icon : '👤') + '</div><h2>' + (o && o.k ? '<em>[' + esc(o.k) + ']</em> ' : '') + esc(c || (o && o.c) || 'Cadet') + '</h2><p>' + (o ? esc(unitName(un)) + ' · ' + esc(o.r || 'Cadet') + '<br>' + esc(W.D.name) + ' · ' + ({ day: 'Day', mid: 'Midshift', night: 'Night' }[o.sh] || '') + ' · ' + Math.round(Math.hypot(o.rx - P.x, o.ry - P.y) * 4) * 5 + ' ft away' : 'Not on shift in your district right now') + '</p>' + (mem ? '<p class="ppSq">🛡️ Your squadmate</p>' : '') + '</div>' +
    '<div class="ppAct"><button type="button" id="ppDm">✉️ Message</button>' + (S.squad && !mem && Object.keys((COMMS.squad || {}).m || {}).length < MAXSQ ? '<button type="button" id="ppInv">🛡️ Invite to ' + esc(S.squad.tag) + '</button>' : !S.squad ? '<button type="button" id="ppNew">🛡️ Start a squad together</button>' : '') + (o ? '<button type="button" id="ppLoc">📍 Show on map</button><button type="button" id="ppWave">👋 Wave</button>' : '') + '<button type="button" class="ghost" id="ppMute">' + (muted ? 'Unmute' : '🔇 Mute') + '</button></div><div class="qAct"><button type="button" class="ghost" id="mClose">Close</button></div>');
  $('mClose').onclick = closeModal; $('ppDm').onclick = () => openDM(u, c || o.c);
  if ($('ppInv')) $('ppInv').onclick = () => { net.invite(u, { s: S.squad.code, n: S.squad.name, g: S.squad.tag, c: S.cs }); stat('invites'); toast('Invite sent to ' + (c || o.c) + '.'); closeModal(); };
  if ($('ppNew')) $('ppNew').onclick = () => { closeModal(); COMMS.tab = 's'; $('quick').hidden = false; commsPanel(); setTimeout(() => { const i = $('sqName'); if (i) i.focus(); }, 50); toast('Name your squad, then invite ' + (c || o.c) + ' from People.'); };
  if ($('ppLoc')) $('ppLoc').onclick = () => { const [sx, sy] = iso(o.rx, o.ry); cam.free = true; cam.x = sx; cam.y = sy; PINGS.push({ x: o.rx, y: o.ry, t: performance.now(), c: '#60a5fa' }); closeModal(); };
  if ($('ppWave')) $('ppWave').onclick = () => { if (net) net.quick(8); SELF_SAY.text = '👋'; SELF_SAY.at = performance.now(); stat('waves'); closeModal(); };
  $('ppMute').onclick = () => { if (muted) CHAT.muted.delete(u); else CHAT.muted.add(u); try { localStorage.setItem('patrolcity:muted', JSON.stringify([...CHAT.muted])); } catch (e) {} toast(muted ? 'Unmuted.' : 'Muted. You won\'t see their messages.'); closeModal(); };
}
// short-lived map pings (locate a cadet)
const PINGS = [];
function pingsDraw(now) { for (let i = PINGS.length - 1; i >= 0; i--) { const p = PINGS[i], a = Math.max(0, (now - p.t) / 2400); if (a > 1) { PINGS.splice(i, 1); continue; } const [sx, sy] = iso(p.x, p.y); ctx.strokeStyle = p.c; ctx.globalAlpha = 1 - a; ctx.lineWidth = 3; for (let k = 0; k < 3; k++) { const r = ((a * 3 + k / 3) % 1) * 60; ctx.beginPath(); ctx.ellipse(sx, sy, r, r / 2, 0, 0, Math.PI * 2); ctx.stroke(); } ctx.globalAlpha = 1; } }

// ---------- multiplayer ----------
function onPlayers(all, uid) {
  myUid = uid; const now = N0(), seen = {};
  Object.keys(all).forEach((k) => {
    if (k === uid) return; const v = all[k]; if (!v || !v.t || now - v.t > 45000) return; seen[k] = 1;
    const o = others[k] || (others[k] = { rx: v.x, ry: v.y, skin: rnd(SKIN) });
    const close = (S.squad && v.g === S.squad.code) || Math.hypot((v.x || 0) - P.x, (v.y || 0) - P.y) < 40 || Object.keys(all).length < 16;
    if (v.q && (!o.q || o.q.t !== v.q.t) && now - v.q.t < 8000) { o.qAt = performance.now(); if (close) radio(v.c, QUICK[v.q.k] || ''); }
    if (v.b && v.b.t && (!o.b || o.b.t !== v.b.t) && now - v.b.t < 60000 && close) { radio(v.c, 'Requesting backup: ' + (v.b.l || '')); chirp(); toast(v.c + ' requests backup. Tap the blue marker to respond.'); }
    if (v.a === uid && o.a !== uid) { toast(v.c + ' arrived to back you up.'); good(); }
    Object.assign(o, { n: v.n, f: v.f, u: v.u, sh: v.s, tx: v.x, ty: v.y, c: v.c, v: v.v, d: v.d, st: v.st, q: v.q, b: v.b, a: v.a, g: v.g || null, k: v.k || null, r: v.r }); if (S.squad && v.g === S.squad.code && !o.sqHello) { o.sqHello = 1; toast('🛡️ Squadmate ' + v.c + ' is on shift nearby.'); }
  });
  Object.keys(others).forEach((k) => { if (!seen[k]) delete others[k]; });
  $('hOn').textContent = (Object.keys(others).length + 1) + ' on shift';
}
let DRAWN_OTHERS = 0, rankT = 0;
function rankOthers(dt) { rankT -= dt; if (rankT > 0) return; rankT = .5; const ks = Object.keys(others); DRAWN_OTHERS = ks.length; ks.map((k) => [k, Math.hypot(others[k].rx - P.x, others[k].ry - P.y)]).sort((a, b) => a[1] - b[1]).forEach(([k], i) => { others[k].nearRank = i; }); }
function smoothOthers(dt) { rankOthers(dt); Object.keys(others).forEach((k) => { const o = others[k]; if (o.tx == null) return; const dx = o.tx - o.rx, dy = o.ty - o.ry, dd = Math.hypot(dx, dy); o.moving = dd > .05; if (o.moving) { if (Math.abs(dx - dy) > .02) o.face = dx - dy > 0 ? 1 : -1; o.back = dx + dy < -.02; } const kk = Math.min(1, dt * 5); o.stride = (o.stride || 0) + dd * kk; o.rx += dx * kk; o.ry += dy * kk; }); }

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
    $('uGo').onclick = () => { if (P.inCar) exitCar(); if (P.boat) exitBoat(); S.unit = sel; S.unitsUsed = S.unitsUsed || {}; S.unitsUsed[sel] = 1; saveS(); closeModal(); load(W.did); }; $('uNo').onclick = closeModal; };
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
    $('stGo').onclick = () => { if (!unit || !csOk()) return; audio(); endAttract(); S.cs = csNow(); S.shift = shift; S.unit = unit; S.unitsUsed = S.unitsUsed || {}; S.unitsUsed[unit] = 1; if (S.home == null) { S.home = did; S.unlocked = [did]; } saveS(); $('start').hidden = true; clock = 0; travel(S.home != null && S.unlocked.includes(did) ? did : S.home, rollCall); };
  };
  draw(); $('start').hidden = false;
}
function rollCall() {
  const d = W.D;
  openModal('<div class="sceneHead"><b>ROLL CALL · ' + esc(shiftOf().name.toUpperCase()) + '</b><h2>' + esc(d.name) + '</h2><p>' + esc(d.blurb) + '</p></div><p class="fact">' + U().icon + ' <b>' + esc(unitName(U())) + '.</b> ' + esc(U().perk) + ': ' + esc(U().perkText) + '</p><p class="fact">Focus this shift: ' + d.lessons.map((l) => esc(L.lessonName(l))).join(' · ') + '.</p><ul class="how"><li>Tap the street to walk; tap your patrol car to drive.</li><li>Answer dispatch calls, help citizens with a <b>?</b>, check study points <b>i</b> and anything that looks off <b>!</b>.</li><li>Master every lesson here, then take the District Final Call to open the next district.</li></ul><div class="qAct"><button type="button" id="mDone">Hit the street</button></div>');
  $('mDone').onclick = closeModal;
}

// ---------- front end: studio boot, main menu, settings, pause, loading, trophies, photo mode, credits ----------
// Meridian Forge is the game's fictional in-world studio (it belongs to the Port Meridian setting).
const STUDIO = { name: 'MERIDIAN FORGE', sub: 'INTERACTIVE', engine: 'SENTRY ENGINE', ver: 'v1.5.0' };
S.cfg = Object.assign({ music: .8, sfx: .8, quality: 'high', shake: true, text: 'normal', motion: true }, S.cfg || {});
const fe = () => $('fe');
function feSound(kind) { if (!S.sound) return; if (kind === 'move') beep(880, .03, 'triangle', .02); else if (kind === 'ok') { beep(660, .06, 'triangle', .04); beep(990, .09, 'triangle', .035, .05); } else if (kind === 'back') beep(440, .07, 'triangle', .035); }
// low boom and shimmer for the studio logo
function boom() { const a = audio(); if (!a || !S.sound) return; const t = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(32, t + 1.6); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.5 * S.cfg.sfx, t + .04); g.gain.exponentialRampToValueAtTime(.0001, t + 2.2); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 2.3); [1047, 1319, 1568, 2093].forEach((f, i) => beep(f, 1.4, 'sine', .018, .5 + i * .09)); }
// one tap to start: browsers only allow sound after a tap, so the studio logos play after it
function bootSequence(done) {
  const el = fe(); el.hidden = false; el.className = 'fe boot';
  const quick = (() => { try { return sessionStorage.getItem('pc:booted') === '1'; } catch (e) { return false; } })();
  el.innerHTML = '<div class="bootGate"><div class="bgMark">PATROL CITY</div><button type="button" class="bgGo">Press to start</button><small>🎧 Best with sound</small></div>';
  const go = () => { el.onclick = null; audio(); try { sessionStorage.setItem('pc:booted', '1'); } catch (e) {} if (quick) { el.hidden = true; done(); return; } logos(); };
  el.onclick = go; addEventListener('keydown', function k(e) { if (el.querySelector('.bootGate')) { removeEventListener('keydown', k); go(); } });
  const logos = () => {
    const seq = [
      '<div class="stLogo"><svg viewBox="0 0 120 120" class="stMark"><defs><linearGradient id="mfG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#c98a00"/></linearGradient></defs><circle cx="60" cy="60" r="54" fill="none" stroke="url(#mfG)" stroke-width="3" class="draw"/><path d="M60 18 L71 49 L104 49 L77 68 L87 100 L60 81 L33 100 L43 68 L16 49 L49 49 Z" fill="none" stroke="url(#mfG)" stroke-width="3" stroke-linejoin="round" class="draw d2"/><path d="M38 74h44M44 84h32" stroke="#ffe9a8" stroke-width="3" stroke-linecap="round" class="draw d3"/></svg><b>' + STUDIO.name + '</b><span>' + STUDIO.sub + '</span><i class="stSweep"></i></div>',
      '<div class="stLogo eng"><div class="engMark"><i></i><i></i><i></i></div><b>' + STUDIO.engine + '</b><span>Real-time city simulation</span></div>',
      '<div class="advis"><h3>Training Simulation Advisory</h3><p>Patrol City is a training simulation. Every scenario uses <b>simulation rounds</b>. Nothing here replaces your agency\'s policy, your instructors, or the law.</p><p class="advSave"><span class="saveIco"></span>This game saves automatically. Don\'t close the page while this icon is showing.</p></div>'];
    let i = -1, tm = 0;
    const next = () => { clearTimeout(tm); i++; if (i >= seq.length) { el.onclick = null; el.classList.add('out'); setTimeout(() => { el.hidden = true; el.className = 'fe'; el.innerHTML = ''; done(); }, 700); return; }
      el.innerHTML = '<div class="bootSlide">' + seq[i] + '</div><button type="button" class="bootSkip">Skip ›</button>'; if (i === 0) boom(); if (i === 1) [523, 784].forEach((f, k) => beep(f, .5, 'triangle', .03, k * .12));
      el.querySelector('.bootSkip').onclick = (e) => { e.stopPropagation(); i = seq.length - 1; next(); };
      tm = setTimeout(next, i === 2 ? 4200 : 3200); };
    el.onclick = next; next();
  };
}
// ---- settings ----
function applyCfg() { music.volume(S.sound ? S.cfg.music : 0); resize(); }
function settingsPanel(back) {
  const c = S.cfg, seg = (k, opts) => '<div class="seg" data-k="' + k + '">' + opts.map(([v, t]) => '<button type="button" data-v="' + v + '" class="' + (String(c[k]) === String(v) ? 'on' : '') + '">' + t + '</button>').join('') + '</div>';
  const el = fe(); el.hidden = false; el.onclick = null; el.className = 'fe menuBg';
  el.innerHTML = '<div class="feCard"><div class="feHead"><span>Options</span><h2>Settings</h2></div><div class="setGrid">' +
    '<label>Sound<div class="seg" data-k="sound"><button type="button" data-v="true" class="' + (S.sound ? 'on' : '') + '">On</button><button type="button" data-v="false" class="' + (S.sound ? '' : 'on') + '">Off</button></div></label>' +
    '<label>Music volume<input type="range" min="0" max="1" step=".05" value="' + c.music + '" data-r="music"></label>' +
    '<label>Effects volume<input type="range" min="0" max="1" step=".05" value="' + c.sfx + '" data-r="sfx"></label>' +
    '<label>Graphics quality' + seg('quality', [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['ultra', 'Ultra 4K']]) + '</label>' +
    '<label>Text speed' + seg('text', [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast'], ['instant', 'Instant']]) + '</label>' +
    '<label>Camera shake' + seg('shake', [[true, 'On'], [false, 'Off']]) + '</label>' +
    '<label>Motion effects' + seg('motion', [[true, 'Full'], [false, 'Reduced']]) + '</label>' +
    '</div><div class="feBtns"><button type="button" class="feBtn" id="setBack">Back</button></div></div>';
  el.querySelectorAll('.seg button').forEach((b) => b.onclick = () => { const k = b.closest('.seg').dataset.k; let v = b.dataset.v; if (v === 'true') v = true; else if (v === 'false') v = false;
    if (k === 'sound') { S.sound = v; if (v) { audio(); music.start(ATTRACT ? 'title' : moodNow()); } else music.stop(); hud && !ATTRACT && hud(); } else c[k] = v; saveS(); applyCfg(); feSound('move'); settingsPanel(back); });
  el.querySelectorAll('[data-r]').forEach((r) => r.oninput = () => { c[r.dataset.r] = +r.value; applyCfg(); if (r.dataset.r === 'sfx') beep(880, .05, 'triangle', .04); }); el.querySelectorAll('[data-r]').forEach((r) => r.onchange = () => saveS());
  $('setBack').onclick = () => { feSound('back'); back(); };
}
// ---- trophies ----
const TROPHIES = [
  ['first', 'First Call', 'Clear your first call.', 'b', () => S.calls >= 1],
  ['calls25', 'Working the Beat', 'Clear 25 calls.', 's', () => S.calls >= 25],
  ['calls100', 'Seasoned', 'Clear 100 calls.', 'g', () => S.calls >= 100],
  ['stripes', 'Stripes', 'Reach Squad Leader 4.', 'b', () => S.xp >= 200],
  ['guide', 'Guide', 'Reach the rank of Guide.', 's', () => S.xp >= 2000],
  ['graduate', 'Graduate', 'Reach the rank of Graduate.', 'g', () => S.xp >= 9000],
  ['ch0', 'First Watch', 'Finish Chapter 1.', 'b', () => S.lore.ch0],
  ['ch1', 'Where the Car Came From', 'Finish Chapter 2.', 'b', () => S.lore.ch1],
  ['ch2', 'Everything Has a Serial Number', 'Finish Chapter 3.', 's', () => S.lore.ch2],
  ['ch3', 'Clear Every Corner', 'Finish Chapter 4.', 's', () => S.lore.ch3],
  ['ch4', 'By the Book', 'Finish the main story.', 'g', () => S.lore.ch4],
  ['side1', 'Off the Beaten Path', 'Close a side case.', 'b', () => SIDE.some(sideClosed)],
  ['sideall', 'Case Load', 'Close every side case.', 'g', () => SIDE.every(sideClosed)],
  ['honest', 'Honest Lunch', 'Pay for the hot dog.', 'b', () => S.flags.paidDelgado],
  ['notforsale', 'Not for Sale', 'Refuse to hear out Lassiter\'s offer.', 's', () => S.flags.firmArrest],
  ['custody', 'Chain of Custody', 'Hold the stolen TV as evidence.', 's', () => S.flags.heldEvidence],
  ['cat', 'Cat Whisperer', 'Earn Exhibit A\'s respect.', 'b', () => S.flags.catPatient],
  ['payforward', 'Pay It Forward', 'Teach Pike instead of doing his work.', 's', () => S.flags.helpedPike],
  ['time', 'Time Keeper', 'Decide the fate of the depot clock.', 'b', () => S.flags.clockFixed || S.flags.clockSlow],
  ['lemon', 'Lemon Bars', 'Help Grandma Ruth start a neighborhood watch.', 'b', () => S.flags.ruthWatch],
  ['drived', 'Driver\'s Ed', 'Set up practice for Tasha.', 'b', () => S.flags.tashaHelp],
  ['allaboard', 'All Aboard', 'Send the 1924 whistle to the depot.', 'b', () => S.flags.whistleMuseum],
  ['pillar', 'Pillar of the Community', 'Become friends with 5 regulars.', 's', () => Object.keys(S.npc || {}).filter((k) => S.npc[k] >= 3).length >= 5],
  ['offmap', 'Off the Map', 'Find 5 secret spots.', 's', () => Object.keys(S.found || {}).length >= 5],
  ['kitted', 'Fully Kitted', 'Collect 15 different items.', 's', () => Object.keys(S.items || {}).length >= 15],
  ['citywide', 'City Wide', 'Unlock all five districts.', 's', () => S.unlocked.length >= 5],
  ['carto', 'Cartographer', 'Explore half of a district.', 's', () => !inside && exTotal > 1 && exCount / exTotal >= .5]
];
const st = (k) => (S.stat || {})[k] || 0, flagN = () => Object.keys(S.flags || {}).length;
TROPHIES.push(
  ['p1', 'Hot Call', 'Clear a priority 1 call.', 'b', () => st('p1') >= 1],
  ['p1x10', 'Lights and Sirens', 'Clear 10 priority 1 calls.', 's', () => st('p1') >= 10],
  ['p1x50', 'First In', 'Clear 50 priority 1 calls.', 'g', () => st('p1') >= 50],
  ['p3x20', 'The Unglamorous Work', 'Clear 20 routine calls.', 's', () => st('p3') >= 20],
  ['calls250', 'Two Hundred Fifty', 'Clear 250 calls.', 'g', () => S.calls >= 250],
  ['night10', 'Creature of the Night', 'Clear 10 calls after dark.', 's', () => st('nightCalls') >= 10],
  ['right50', 'Studied', 'Answer 50 questions right.', 'b', () => st('right') >= 50],
  ['right250', 'Book Smart', 'Answer 250 questions right.', 's', () => st('right') >= 250],
  ['right1000', 'Walking Textbook', 'Answer 1,000 questions right.', 'g', () => st('right') >= 1000],
  ['streak10', 'On Fire', 'Hit a 10-answer streak.', 's', () => (S.bestCombo || 0) >= 10],
  ['streak25', 'Unstoppable', 'Hit a 25-answer streak.', 'g', () => (S.bestCombo || 0) >= 25],
  ['sl1', 'Squad Leader 1', 'Reach Squad Leader 1.', 's', () => S.xp >= 1200],
  ['vp', 'Vice President', 'Reach the rank of Vice President.', 's', () => S.xp >= 3000],
  ['statecert', 'State Certified', 'Reach the rank of State Certified.', 'g', () => S.xp >= 7200],
  ['shift1', 'End of Watch', 'Finish a full shift.', 'b', () => st('shifts') >= 1],
  ['shift10', 'Ten Shifts In', 'Finish 10 shifts.', 's', () => st('shifts') >= 10],
  ['gradeS', 'S-Rank Shift', 'Earn an S grade on a shift report.', 's', () => st('gradeS') >= 1],
  ['gradeS5', 'Model Cadet', 'Earn five S grades.', 'g', () => st('gradeS') >= 5],
  ['allshifts', 'Around the Clock', 'Finish a Day, a Midshift and a Night shift.', 's', () => st('shift_day') && st('shift_mid') && st('shift_night')],
  ['indoors', 'Knock Knock', 'Step inside 25 buildings.', 'b', () => st('inside') >= 25],
  ['places30', 'Regular Customer', 'Visit 30 different buildings.', 's', () => Object.keys(S.inside || {}).length >= 30],
  ['disc50', 'Tour Guide', 'Discover 50 places.', 's', () => Object.keys(S.disc || {}).length >= 50],
  ['disc200', 'Knows Every Street', 'Discover 200 places.', 'g', () => Object.keys(S.disc || {}).length >= 200],
  ['secrets15', 'Urban Legend', 'Find 15 secret spots.', 'g', () => Object.keys(S.found || {}).length >= 15],
  ['boat', 'Sea Legs', 'Take out the patrol boat.', 'b', () => st('boat') >= 1],
  ['code3', 'Code 3', 'Run Code 3 to a call.', 'b', () => st('ab_code3') >= 1],
  ['helped10', 'Good Neighbor', 'Help regulars 10 times.', 'b', () => st('helped') >= 10],
  ['bestie', 'Best Friends', 'Max out a friendship with a regular.', 's', () => Object.keys(S.npc || {}).some((k) => S.npc[k] >= 6)],
  ['bestie5', 'Everybody Knows Your Name', 'Max out five friendships.', 'g', () => Object.keys(S.npc || {}).filter((k) => S.npc[k] >= 6).length >= 5],
  ['items40', 'Supply Closet', 'Collect 40 different items.', 's', () => Object.keys(S.items || {}).length >= 40],
  ['items80', 'Quartermaster', 'Collect 80 different items.', 'g', () => Object.keys(S.items || {}).length >= 80],
  ['legend', 'Academy Legend', 'Find a Rank V item.', 's', () => Object.keys(S.items || {}).some((id) => (itemById(id) || {}).r === 'l')],
  ['boots', 'Birds Think They Are Lakes', 'Find the Unnaturally Shiny Boots.', 'g', () => (S.items || {}).boots],
  ['dingle', 'Dingle Dingle', 'Find whatever a Dingle Dingle is.', 'g', () => (S.items || {}).dingle],
  ['fullkit', 'Squared Away', 'Fill all five equipment slots.', 's', () => SLOTS.every((sl) => (S.gear || {})[sl.id])],
  ['snack', 'Snack Break', 'Use 10 consumables.', 'b', () => st('used') >= 10],
  ['photo', 'Say Cheese', 'Take a photo in photo mode.', 'b', () => st('photos') >= 1],
  ['photo20', 'Department Photographer', 'Take 20 photos.', 's', () => st('photos') >= 20],
  ['choices10', 'Consequences', 'Make 10 story choices.', 's', () => flagN() >= 10],
  ['seen', 'Plan First', 'Stop Pike and make a plan at the motel.', 'b', () => S.flags.plannedMotel],
  ['report', 'Write It Down', 'Write up the threat Rosa reported.', 'b', () => S.flags.reportedThreat],
  ['witness', 'Two Signatures', 'Inventory found property with a witness.', 'b', () => S.flags.walletWitness],
  ['perimeter', 'Contain, Then Search', 'Hold the perimeter at North Spur Yard.', 'b', () => S.flags.whistlePlan],
  ['allunits', 'Cross-Trained', 'Serve with three different specialty units.', 's', () => Object.keys(S.unitsUsed || {}).length >= 3],
  // multiplayer
  ['squadup', 'Squad Up', 'Create or join a squad.', 'b', () => st('squadMade') + st('squadJoin') >= 1],
  ['leader', 'Natural Leader', 'Create a squad.', 'b', () => st('squadMade') >= 1],
  ['fullsquad', 'Full Strength', 'Be in a squad with four cadets.', 's', () => COMMS.squad && Object.keys(COMMS.squad.m || {}).length >= 4],
  ['sqbonus', 'Better Together', 'Earn 500 RP from the squad bonus.', 's', () => st('sqRP') >= 500],
  ['sqbonus5k', 'Band of Cadets', 'Earn 5,000 RP from the squad bonus.', 'g', () => st('sqRP') >= 5000],
  ['assist', 'Backup Is Here', 'Back up another cadet.', 'b', () => st('assists') >= 1],
  ['assist25', 'Always Has Your Back', 'Back up other cadets 25 times.', 'g', () => st('assists') >= 25],
  ['sqassist', 'Squad Cover', 'Back up a squadmate.', 's', () => st('sqAssist') >= 1],
  ['rally', 'Rally Point', 'Rally your squad.', 'b', () => st('sqRally') >= 1],
  ['city', 'Citywide', 'Post on the City channel.', 'b', () => st('city') >= 1],
  ['dm', 'Direct Line', 'Send a direct message.', 'b', () => st('dm') >= 1],
  ['recruiter', 'Recruiter', 'Send 5 squad invites.', 's', () => st('invites') >= 5],
  ['wave', 'Friendly Wave', 'Wave at another cadet.', 'b', () => st('waves') >= 1],
  ['squadchat', 'Squad Chatter', 'Send 25 squad messages.', 's', () => st('sqMsg') >= 25]
);
TROPHIES.push(['fact1', 'Know This', 'Complete your first fact.', 'b', () => Object.keys(S.facts || {}).length >= 1], ['fact100', 'Fact Finder', 'Complete 100 facts.', 's', () => Object.keys(S.facts || {}).length >= 100], ['factall', 'Every Fact in the Chapter', 'Complete all 558 facts.', 'g', () => Object.keys(S.facts || {}).length >= 558], ['final1', 'Transfer Orders', 'Pass a District Final Call.', 's', () => st('finals') >= 1], ['exam', 'Chapter 5: Passed', 'Pass the Chapter 5 Final Exam.', 'g', () => !!S.graduated]);
TROPHIES.push(['lore1', 'Local History', 'Discover a piece of lore out in the city.', 'b', () => LORE.some((e) => e.when.slice(0, 6) === 'visit:' && S.lore[e.id])], ['lore20', 'Town Historian', 'Discover 20 lore entries.', 's', () => LORE.filter((e) => S.lore[e.id]).length >= 20], ['loreall', 'Keeper of Port Meridian', 'Discover every lore entry.', 'g', () => LORE.every((e) => S.lore[e.id])], ['side10d', 'Neighborhood Fixture', 'Close all ten side cases in one district.', 's', () => DISTRICTS.some((D) => SIDE.filter((q) => q.d === D.id).every(sideClosed))], ['side25', 'Busy Beat', 'Close 25 side cases.', 's', () => SIDE.filter(sideClosed).length >= 25]);
TROPHIES.push(['mg1', 'Rec Room Regular', 'Play a mini game.', 'b', () => st('mg') >= 1], ['mgwin', 'Class Champion', 'Win a multiplayer mini game against other cadets.', 's', () => st('mgwin') >= 1], ['mgall', 'Well-Rounded', 'Play every Rec Room game.', 's', () => ['bowl', 'relay', 'bolo', 'run', 'gauntlet', 'spot', 'dispatch', 'squad'].every((g) => st('mg_' + g) >= 1)], ['mgace', 'Fact Bowl Ace', 'Score 5,600 or more in Fact Bowl.', 'g', () => st('mgbowlace') >= 1], ['mg10', 'Reigning Champ', 'Win 10 multiplayer mini games.', 'g', () => st('mgwin') >= 10]);
TROPHIES.push(['self1', 'Proactive', 'Do your first self-initiated activity.', 'b', () => st('self') >= 1], ['self25', 'Nobody Had to Call', 'Complete 25 self-initiated activities.', 's', () => st('self') >= 25], ['stop1', 'Lights On', 'Make a traffic stop.', 'b', () => st('stops') >= 1], ['stopA', 'Textbook Stop', 'Earn an A on a traffic stop.', 's', () => st('stopA') >= 1], ['stop10', 'Traffic Unit Material', 'Make 10 traffic stops.', 'g', () => st('stops') >= 10], ['decal', 'Custom Cruiser', 'Put a decal on your patrol car.', 'b', () => st('decal') >= 1], ['kidfound', 'Right Where You Left Him', 'Reunite a lost child with family.', 's', () => st('self_kid') >= 1]);
TROPHIES.push(['off1', 'Off the Clock', 'Go off duty and do something fun.', 'b', () => st('meals') + st('games') + st('skate') + st('fish') >= 1], ['fish10', 'Hooked', 'Catch 10 fish.', 's', () => st('fish') >= 10], ['mossback', 'Old Mossback', 'Land a legendary fish.', 'g', () => st('fishLegend') >= 1], ['skate5', 'Officer Kickflip', 'Land all five tricks with Dez.', 's', () => st('skate5') >= 1], ['ride3', 'Seen It From Every Seat', 'Do all three ride-alongs.', 's', () => st('ride_sam') && st('ride_hal') && st('ride_earl')], ['home1', 'Keys in Hand', 'Get a place of your own.', 's', () => st('homes') >= 1], ['arc1', 'Real Friends', 'Finish a friendship story.', 's', () => st('arcs') >= 1], ['arc10', 'Everybody Knows Your Name', 'Finish all ten friendship stories.', 'g', () => st('arcs') >= 10], ['gators', 'Believe in the Gators', 'See the Gators win at River Stadium.', 'b', () => st('gatorwin') >= 1]);
TROPHIES.push(['pt1', 'Hooah', 'Finish a PT workout.', 'b', () => st('pt') >= 1], ['ptex', 'Excellent Across the Board', 'Score Excellent on a weekly PT test.', 'g', () => st('ptex') >= 1], ['insp1', 'Squared Away', 'Stand a uniform inspection.', 'b', () => st('insp') >= 1], ['inspP', 'Outstanding', 'Pass inspection with every item perfect.', 's', () => st('inspPerfect') >= 1], ['lb1', 'Know Where You Stand', 'Check the class standing.', 'b', () => st('standing') >= 1]);
TROPHIES.push(['squad1', 'Sim Round Squad', 'Finish a squad scenario.', 'b', () => st('mg_squad') >= 1], ['squadwin', 'Mission Success', 'Finish a squad scenario at 80% or better.', 's', () => st('squadwin') >= 1], ['gaunt', 'Last One Standing', 'Play the Trivia Gauntlet.', 'b', () => st('mg_gauntlet') >= 1]);
TROPHIES.push(['ev1', 'Community Event', 'Help out at a city event.', 'b', () => st('evtasks') >= 1], ['evgoal', 'All Hands', 'Be part of a city event that reached its goal.', 's', () => st('evgoal') >= 1], ['patch5', 'Patch Collector', 'Find 5 department patches.', 'b', () => st('patches') >= 5], ['patch25', 'Department Historian', 'Find all 25 department patches.', 'g', () => st('patches') >= 25], ['pigeon30', 'Census Taker', 'Count all 30 pigeon flocks for Sgt. Pruitt.', 's', () => Object.keys(S.pigeons || {}).length >= 30], ['album10', 'Shutterbug', 'Photograph 10 landmarks.', 's', () => Object.keys(S.album || {}).length >= 10], ['storm1', 'Weathered It', 'Work a shift through a tropical storm.', 's', () => st('stormShift') >= 1]);
TROPHIES.push(['daily1', 'Daily Grind', 'Finish a daily challenge.', 'b', () => st('daily') >= 1], ['daily3', 'Clean Sweep', 'Finish all three daily challenges in one day.', 's', () => st('daily3') >= 1], ['moto', 'Motor Unit', 'Ride the police motorcycle.', 's', () => st('ride_moto') >= 1], ['bikecop', 'Pedal Patrol', 'Ride the patrol bicycle.', 's', () => st('ride_bike') >= 1], ['judge2', 'Judge II', 'Ride with the mounted unit.', 'g', () => st('ride_horse') >= 1], ['evgear', 'Dressed for the Occasion', 'Earn a city event outfit.', 's', () => st('evgear') >= 1], ['trustmap', 'Know Your Beat', 'Open the community trust map.', 'b', () => st('trustMap') >= 1]);
TROPHIES.push(['plat', 'Port Meridian\'s Finest', 'Earn every other trophy.', 'p', () => TROPHIES.every((t) => t[0] === 'plat' || (S.trophies || {})[t[0]])]);
const TIER = { b: ['Bronze', '#cd7f32'], s: ['Silver', '#c9d2dd'], g: ['Gold', '#f5b800'], p: ['Platinum', '#9ee7ff'] };
let trT = 3, trQ = [], trBusy = false;
function trophyCheck(dt) { trT -= dt; if (trT > 0 || ATTRACT) return; trT = 2; S.trophies = S.trophies || {}; let got = false; TROPHIES.forEach((t) => { if (S.trophies[t[0]]) return; let ok = false; try { ok = !!t[4](); } catch (e) {} if (ok) { S.trophies[t[0]] = Date.now(); trQ.push(t); got = true; } }); if (got) { saveS(); trophyToast(); } }
function trophyToast() {
  if (trBusy || !trQ.length) return; trBusy = true; const t = trQ.shift(), [tn, col] = TIER[t[3]], el = $('trToast');
  el.innerHTML = '<span class="trCup" style="--c:' + col + '">🏆</span><div><small>Trophy unlocked · ' + tn + '</small><b>' + esc(t[1]) + '</b><em>' + esc(t[2]) + '</em></div>'; el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
  if (S.sound) [784, 988, 1175, 1568].forEach((f, i) => beep(f, .4, 'sine', .03, i * .07));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => { el.hidden = true; trBusy = false; trophyToast(); }, 450); }, 4200);
}
function trophyRoom(back) {
  S.trophies = S.trophies || {}; const n = TROPHIES.filter((t) => S.trophies[t[0]]).length, el = fe(); el.hidden = false; el.onclick = null; el.className = 'fe menuBg';
  el.innerHTML = '<div class="feCard wide"><div class="feHead"><span>' + n + ' of ' + TROPHIES.length + ' · ' + Math.round(n / TROPHIES.length * 100) + '%</span><h2>Trophies</h2><div class="trBar"><i style="width:' + (n / TROPHIES.length * 100) + '%"></i></div></div><div class="trGrid">' +
    TROPHIES.map((t) => { const has = S.trophies[t[0]], [tn, col] = TIER[t[3]]; return '<div class="trItem' + (has ? ' has' : '') + '" style="--c:' + col + '"><span>' + (has ? '🏆' : '🔒') + '</span><div><b>' + esc(t[1]) + '</b><small>' + tn + (has ? ' · ' + new Date(has).toLocaleDateString() : '') + '</small><em>' + esc(t[2]) + '</em></div></div>'; }).join('') +
    '</div><div class="feBtns"><button type="button" class="feBtn" id="trBack">Back</button></div></div>';
  $('trBack').onclick = () => { feSound('back'); back(); };
}
// ---- credits (the fictional studio's team) ----
function credits(back) {
  const el = fe(); el.hidden = false; el.onclick = null; el.className = 'fe credits';
  const roll = [['A ' + STUDIO.name + ' Production', ''], ['PATROL CITY', 'big'], ['Game Director', 'Avery Lindqvist'], ['Creative Director', 'Marcus Okoye'], ['Lead Writer', 'Simone Delacroix'], ['Narrative Design', 'Theo Park · Rania Haddad'], ['Lead Designer', 'Jonah Whitfield'], ['Systems Design', 'Priya Raman · Cole Brennan'], ['Level & World Design', 'Inez Moreno · Dmitri Volkov · Hana Sato'], ['Art Director', 'Celeste Navarro'], ['Environment Art', 'Kofi Mensah · Lena Fischer · Omar Aziz'], ['Character Art', 'Mei Tanaka · Ruth Adeyemi'], ['Lighting & VFX', 'Gabriel Costa'], ['Lead Engineer', 'Nadia Petrov'], ['Engine (' + STUDIO.engine + ')', 'Samuel Achebe · Ilse Varga · Diego Ruiz'], ['Online & Chat', 'Tara Quinn'], ['Audio Director', 'Elias Montgomery'], ['Original Score', 'Elias Montgomery · Joy Ferreira'], ['Sound Design', 'Felix Brandt'], ['UX & Accessibility', 'Amara Osei'], ['QA Lead', 'Ben Carver'], ['Subject Matter Review', 'The Port Meridian Training Unit'], ['Featuring', 'Sgt. Dana Castillo · Lt. Ray Okonkwo · Marjorie "Velvet" Hale · Cadet Jordan Pike · Cadet Riley Navarro · Exhibit A, as herself'], ['Special Thanks', 'Class 26-04 · every cadet who studied for this · Mr. Delgado\'s hot dog cart'], ['', 'No cadets were harmed in the making of this game. Every scenario is a sim round.'], ['', 'Meridian Forge, the Port Meridian Police Department and everyone in Port Meridian are fictional.'], ['THANK YOU FOR PLAYING', 'big']];
  el.innerHTML = '<div class="crRoll">' + roll.map(([a, b]) => b === 'big' ? '<h2>' + esc(a) + '</h2>' : '<div class="crRow">' + (a ? '<small>' + esc(a) + '</small>' : '') + '<b>' + esc(b) + '</b></div>').join('') + '</div><button type="button" class="bootSkip" id="crBack">Back ›</button>';
  const r = el.querySelector('.crRoll'); r.style.animationDuration = Math.max(30, roll.length * 2.4) + 's'; r.addEventListener('animationend', () => back());
  $('crBack').onclick = (e) => { e.stopPropagation(); feSound('back'); back(); };
}
// ---- main menu on the title screen ----
function mainMenu(go) {
  const t = $('title'), has = !!S.cs, items = [[has ? 'Continue' : 'Begin Your Career', go, has ? S.cs + ' · ' + L.rankOf(S.xp).name : 'Port Meridian is waiting'], ['Settings', () => settingsPanel(menuBack)], ['Trophies', () => trophyRoom(menuBack), (S.trophies ? Object.keys(S.trophies).length : 0) + ' / ' + TROPHIES.length], ['Credits', () => credits(menuBack)]];
  function menuBack() { const el = fe(); el.hidden = true; el.innerHTML = ''; el.className = 'fe'; t.querySelector('.tiMenu button') && t.querySelector('.tiMenu button').focus(); }
  const m = t.querySelector('.tiMenu'); m.innerHTML = items.map((x, i) => '<button type="button" data-i="' + i + '"' + (i === 0 ? ' class="pri"' : '') + '><b>' + esc(x[0]) + '</b>' + (x[2] ? '<small>' + esc(x[2]) + '</small>' : '') + '</button>').join('');
  m.querySelectorAll('button').forEach((b) => { b.onmouseenter = () => feSound('move'); b.onclick = (e) => { e.stopPropagation(); feSound('ok'); items[+b.dataset.i][1](); }; });
  m.onkeydown = (e) => { const bs = [...m.querySelectorAll('button')], i = bs.indexOf(document.activeElement); if (e.key === 'ArrowDown') { bs[(i + 1) % bs.length].focus(); feSound('move'); e.preventDefault(); } if (e.key === 'ArrowUp') { bs[(i - 1 + bs.length) % bs.length].focus(); feSound('move'); e.preventDefault(); } };
  setTimeout(() => { const b = m.querySelector('button'); if (b) b.focus({ preventScroll: true }); }, 900);
}
// ---- pause menu ----
let PAUSED_BY_MENU = false;
function pauseMenu() {
  if (ATTRACT || PHOTO || !$('start').hidden) return; const el = fe(); if (!el.hidden) return;
  const was = paused; paused = true; PAUSED_BY_MENU = true; el.hidden = false; el.className = 'fe pauseBg';
  const close = () => { el.hidden = true; el.innerHTML = ''; el.className = 'fe'; paused = was; PAUSED_BY_MENU = false; };
  const items = [['Resume', close], ['Field Journal', () => { close(); journal(); }], ['Rec Room · Mini Games', () => { close(); MG.open(); }], [S.offDuty ? 'Go back on duty' : 'Go off duty', () => { close(); OFF.toggle(); }], ['PT', () => { close(); ACAD.ptMenu(); }], ['Uniform Inspection', () => { close(); ACAD.inspMenu(); }], ['Class Standing', () => { close(); ACAD.standing(); }], ['Daily Challenges', () => { close(); EVT.dailyCard(); }], ['This Week in the City', () => { close(); EVT.eventCard(); }], ['Collections', () => { close(); EVT.collections(); }], ['Community Trust Map', () => { close(); trustMap(); }], ['Locker', () => { close(); locker(); }], ['Photo Mode', () => { close(); photoMode(); }], ['Trophies', () => trophyRoom(pauseMenuAgain)], ['Settings', () => settingsPanel(pauseMenuAgain)], ['Quit to Title', () => { saveS(); location.reload(); }]];
  function pauseMenuAgain() { el.hidden = true; paused = was; PAUSED_BY_MENU = false; pauseMenu(); }
  const h = hourNow(), hh = String(Math.floor(h)).padStart(2, '0') + String(Math.floor((h % 1) * 60)).padStart(2, '0');
  el.innerHTML = '<div class="pmBox"><div class="pmHead"><small>' + esc(W.D.name) + ' · ' + hh + ' hrs</small><h2>Paused</h2><p>' + esc(S.cs) + ' · ' + esc(unitName(U())) + ' · ' + esc(L.rankOf(S.xp).name) + '</p></div><div class="tiMenu pm">' + items.map((x, i) => '<button type="button" data-i="' + i + '"' + (i === 0 ? ' class="pri"' : '') + '><b>' + x[0] + '</b></button>').join('') + '</div><div class="pmFoot">' + (activeQ() ? '<b>' + esc(activeQ().title) + '</b> · ' + esc(activeQ().step.goal) : 'Patrol your district') + '</div></div>';
  el.querySelectorAll('.tiMenu button').forEach((b) => { b.onmouseenter = () => feSound('move'); b.onclick = () => { feSound('ok'); items[+b.dataset.i][1](); }; });
  el.onclick = (e) => { if (e.target === el) close(); };
  setTimeout(() => { const b = el.querySelector('.tiMenu button'); if (b) b.focus({ preventScroll: true }); }, 50);
  pauseMenu.close = close;
}
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (PHOTO) { photoExit(); return; } const el = fe(); if (!el.hidden && PAUSED_BY_MENU && pauseMenu.close) { pauseMenu.close(); return; } if (!$('modal').hidden || !$('dlg').hidden) return; pauseMenu(); }
  if ((e.key === 'p' || e.key === 'P') && !e.target.closest('input,textarea') && !ATTRACT && $('modal').hidden && fe().hidden) { if (PHOTO) photoExit(); else photoMode(); }
});
// ---- loading screen between districts ----
const TIPS = ['Plan first, every time. Where do you park, where do you stand?', 'Regulars remember how you treat them. So does the city.', 'Side cases change the main story in ways you won\'t see coming.', 'Code 3 gets you there faster, but it costs you later.', 'Press P (or Menu › Photo Mode) for photo mode. Port Meridian is photogenic at 1900 hrs.', 'Equip gear in the Locker. The right boots matter more than you think.', 'Answer streaks multiply your RP. Keep the fire going.', 'Midshift sees both Day and Night units on the street.', 'Exhibit A does not come when called. Exhibit A comes when ready.'];
function travel(did, then) {
  if (FAST) { load(did); if (then) then(); return; }
  const D = DISTRICTS[did], lore = LORE.find((x) => x.when === 'd' + did) || LORE[0], el = $('ld');
  el.innerHTML = '<div class="ldArt" style="--h:' + [215, 18, 190, 32, 265][did] + '"></div><div class="ldTxt"><small>Now entering</small><h2>' + esc(D.name) + '</h2><p>' + esc(lore.text.split('. ')[0]) + '.</p></div><div class="ldFoot"><div class="ldTip"><b>Tip</b> ' + esc(rnd(TIPS)) + '</div><div class="ldBar"><i></i></div></div>';
  el.hidden = false; el.classList.remove('out'); paused = true;
  const bar = el.querySelector('.ldBar i'); let p = 0; const t0 = performance.now();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    load(did);
    const tick = () => { p = Math.min(1, (performance.now() - t0) / 1500); bar.style.width = (p * 100) + '%'; if (p < 1) requestAnimationFrame(tick); else { el.classList.add('out'); setTimeout(() => { el.hidden = true; paused = false; if (then) then(); setTimeout(chapterCard, 400); }, 500); } };
    tick();
  }));
}
// ---- cinematic chapter cards ----
const NUMW = ['One', 'Two', 'Three', 'Four', 'Five'];
function chapterCard(force) {
  if (FAST || inside) return; if (!$('modal').hidden || paused || !fe().hidden) { setTimeout(() => chapterCard(force), 700); return; }
  const c = chap(); S.cards = S.cards || {}; if (!c || (!force && (S.cards[c.d] || (S.story[c.d] || 0) > 0))) return; S.cards[c.d] = 1; saveS();
  const el = $('chCard'); el.innerHTML = '<div class="ccBars"></div><div class="ccIn"><small>Chapter ' + NUMW[c.d] + '</small><h2>' + esc(c.title) + '</h2><p>' + esc(c.sub) + '</p></div>'; el.hidden = false; el.classList.remove('out'); void el.offsetWidth; el.classList.add('in');
  music.sting('promo'); paused = true; document.body.classList.add('cine'); const end = () => { el.onclick = null; el.classList.add('out'); document.body.classList.remove('cine'); setTimeout(() => { el.hidden = true; el.classList.remove('in', 'out'); paused = false; }, 600); };
  const tm = setTimeout(end, 4200); el.onclick = () => { clearTimeout(tm); end(); };
}
// ---- autosave icon ----
let saveVisT = 0;
function saveS() { L.saveState(S); const now = performance.now(); if (now - saveVisT < 5000 || ATTRACT) return; saveVisT = now; const el = $('saving'); el.hidden = false; el.classList.add('in'); setTimeout(() => { el.classList.remove('in'); setTimeout(() => { el.hidden = true; }, 400); }, 1400); }
// ---- camera shake ----
const SHK = { t: 0, a: 0 };
function shake(a, d) { if (!S.cfg.shake || !S.cfg.motion) return; SHK.a = Math.max(SHK.a, a); SHK.t = Math.max(SHK.t, d || .4); }
function shakeUpdate(dt) { if (SHK.t <= 0) { if (cv.style.transform) cv.style.transform = ''; return; } SHK.t -= dt; const k = SHK.a * Math.max(0, SHK.t); cv.style.transform = 'translate(' + ((Math.random() - .5) * k * 2).toFixed(1) + 'px,' + ((Math.random() - .5) * k * 2).toFixed(1) + 'px)'; if (SHK.t <= 0) SHK.a = 0; }
// ---- photo mode ----
let PHOTO = null;
const FILTERS = [['Natural', 'none'], ['Noir', 'grayscale(1) contrast(1.3) brightness(.95)'], ['Golden Hour', 'sepia(.35) saturate(1.4) hue-rotate(-12deg) brightness(1.06)'], ['Midnight', 'saturate(.65) hue-rotate(18deg) brightness(.85) contrast(1.15)'], ['Vintage Film', 'sepia(.6) contrast(.92) brightness(1.08) saturate(.8)'], ['Vivid', 'saturate(1.65) contrast(1.12)']];
function photoMode() {
  if (PHOTO || ATTRACT) return; closeModal(); PHOTO = { f: 0, vig: true, mark: true, was: paused }; paused = true; document.body.classList.add('photo');
  const el = $('photo'); el.hidden = false;
  const draw = () => { el.innerHTML = '<div class="phTop"><b>PHOTO MODE</b><small>Drag to frame · pinch or ± to zoom</small></div><div class="phBar"><div class="phF">' + FILTERS.map((f, i) => '<button type="button" data-f="' + i + '" class="' + (i === PHOTO.f ? 'on' : '') + '">' + f[0] + '</button>').join('') + '</div><div class="phR"><button type="button" id="phV" class="' + (PHOTO.vig ? 'on' : '') + '">Vignette</button><button type="button" id="phM" class="' + (PHOTO.mark ? 'on' : '') + '">Logo</button><button type="button" id="phZo">−</button><button type="button" id="phZi">+</button><button type="button" class="phShot" id="phShot">📸 Capture</button><button type="button" id="phX">Exit</button></div></div><div class="phVig' + (PHOTO.vig ? '' : ' off') + '"></div>' + (PHOTO.mark ? '<div class="phMark"><b>PATROL CITY</b><small>' + esc(WORLD.city) + ' · ' + esc(W.D.name) + '</small></div>' : '');
    cv.style.filter = FILTERS[PHOTO.f][1] === 'none' ? '' : FILTERS[PHOTO.f][1];
    el.querySelectorAll('[data-f]').forEach((b) => b.onclick = () => { PHOTO.f = +b.dataset.f; feSound('move'); draw(); });
    $('phV').onclick = () => { PHOTO.vig = !PHOTO.vig; draw(); }; $('phM').onclick = () => { PHOTO.mark = !PHOTO.mark; draw(); };
    $('phZi').onclick = () => { cam.z = Math.min(2.6, cam.z * 1.15); }; $('phZo').onclick = () => { cam.z = Math.max(.5, cam.z / 1.15); };
    $('phShot').onclick = capture; $('phX').onclick = photoExit; };
  draw();
}
function capture() { try { const [cx, cy] = unIso(cam.x, cam.y); EVT.photo(cx, cy); } catch (e) {}
  const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const g = c.getContext('2d');
  g.filter = FILTERS[PHOTO.f][1]; g.drawImage(cv, 0, 0); g.filter = 'none';
  if (PHOTO.vig) { const v = g.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * .35, c.width / 2, c.height / 2, Math.max(c.width, c.height) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = v; g.fillRect(0, 0, c.width, c.height); }
  if (PHOTO.mark) { const s = c.width / 1400; g.font = '900 ' + Math.round(54 * s) + 'px "Barlow Condensed", sans-serif'; g.fillStyle = 'rgba(255,255,255,.92)'; g.textBaseline = 'bottom'; g.fillText('PATROL', 36 * s, c.height - 62 * s); g.fillStyle = '#f5b800'; g.fillText('CITY', 36 * s + g.measureText('PATROL ').width, c.height - 62 * s); g.font = '700 ' + Math.round(18 * s) + 'px system-ui'; g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText(WORLD.city + ' · ' + W.D.name + ' · ' + S.cs, 38 * s, c.height - 36 * s); }
  const fl = document.createElement('div'); fl.className = 'phFlash'; document.body.appendChild(fl); setTimeout(() => fl.remove(), 600);
  if (S.sound) { beep(2400, .03, 'square', .03); beep(1200, .06, 'square', .02, .05); }
  try { const a = document.createElement('a'); a.download = 'patrol-city-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.png'; a.href = c.toDataURL('image/png'); a.click(); } catch (e) { toast('Could not save the photo on this device.'); }
  S.photos = (S.photos || 0) + 1; stat('photos'); saveS();
}
function photoExit() { if (!PHOTO) return; cv.style.filter = ''; document.body.classList.remove('photo'); $('photo').hidden = true; $('photo').innerHTML = ''; paused = PHOTO.was; PHOTO = null; }

// ---------- boot ----------
const FAST = /[?&]skiptitle\b/.test(location.search); // test / dev: no logos or loading screens
function resize(drs) { const q = (S.cfg || {}).quality || 'high', dev = window.devicePixelRatio || 1; dpr = q === 'ultra' ? Math.min(3, Math.max(dev, 3840 / Math.max(innerWidth, innerHeight))) : Math.min(q === 'low' ? 1 : q === 'medium' ? 1.5 : 2, dev); const base = dpr; dpr = Math.max(Math.min(1, base), base * DRS.k);
  { const want = Math.min(q === 'low' ? 1 : q === 'medium' ? 1.5 : q === 'ultra' ? 3 : 2, Math.ceil(base * 1.25 * 2) / 2); if (want !== RES) { setRes(want); if (G && G.chunks) G.chunks.clear(); SPR.forEach((x) => { x.canvas = null; x.lights = []; }); } } cw = innerWidth; ch = innerHeight; cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); cv.style.width = cw + 'px'; cv.style.height = ch + 'px'; if (!S.zoom) cam.z = cw < 600 ? .85 : 1.15; else cam.z = S.zoom; }
addEventListener('resize', resize); resize();
// soft round light and shadow spots are drawn once per color and stamped, instead of building a new gradient for every lamp every frame
const RADS = new Map();
function radSprite(col) { let c = RADS.get(col); if (c) return c; if (RADS.size > 64) RADS.clear(); c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); RADS.set(col, c); return c; }
// dynamic resolution: watch the real frame rate against the screen's refresh rate (60, 90, 120 Hz...) and trade a little
// sharpness for smoothness when frames run long, then sharpen back up when there's headroom
function drsTick(now, ms) {
  if (S.cfg && S.cfg.drs === false) return; DRS.ts.push(ms); if (DRS.ts.length > 90) DRS.ts.shift(); if (now - DRS.at < 1500 || DRS.ts.length < 60) return; DRS.at = now;
  const sorted = DRS.ts.slice().sort((a, b) => a - b), best = sorted[Math.floor(sorted.length * .1)], med = sorted[Math.floor(sorted.length / 2)];
  DRS.refresh = DRS.hz ? Math.min(DRS.hz, Math.max(6.9, best)) : Math.max(6.9, Math.min(17, best)); // the screen's refresh interval
  let k = DRS.k; if (med > DRS.refresh * 1.3 && k > .6) k = Math.max(.6, k - .1); else if (med < DRS.refresh * 1.08 && k < 1) k = Math.min(1, k + .05);
  if (k !== DRS.k) { DRS.k = k; DRS.ts = []; resize(true); }
}
function frame(now) { const dt = Math.min(.05, (now - last) / 1000); drsTick(now, now - last); last = now; shakeUpdate(dt); cineCam(dt); if (W) { if (ATTRACT) attractUpdate(dt, now); else { update(dt, now); smoothOthers(dt); } render(now); } requestAnimationFrame(frame); }
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
  try { await L.loadBank('../ch5.json'); await L.loadFacts('facts.json'); S.facts = Object.fromEntries(Object.entries(S.facts || {}).filter(([k]) => k[0] === 'F')); } catch (e) { $('loading').textContent = 'Could not load the question bank. Check your connection and refresh.'; return; }
  $('loading').hidden = true;
  attractStart(); requestAnimationFrame(frame); applyCfg(); if (FAST) { S.seenIntro = 1; startScreen(); } else bootSequence(titleScreen);
  try { net = await startNet(onPlayers); if (net && W && !ATTRACT) { if (net.chatOn) net.chatOn(W.did, chatIn); MG.watch(W.did); EVT.watch(); } if (net && W && !ATTRACT) Promise.resolve(net.join(W.did, S.shift, { cs: S.cs, unit: S.unit, flair: myTokens(), x: P.x, y: P.y, rank: L.rankOf(S.xp).name })).then(commsJoin).catch(() => {}); } catch (e) { net = null; }
  if (!net) $('hOn').textContent = 'Offline';
})();
window.__pc = { S, cam, MG, LIFE, OFF, ACAD, EVT, motorPool, RIDE, trustMap, blockTrust, get FX() { return FX; }, get traffic() { return traffic; }, onPlayers: (a, u) => onPlayers(a, u), get others() { return others; }, closeModal: () => closeModal(), get citizens() { return citizens; }, get infos() { return infos; }, get observes() { return observes; }, citizenTalk: (c) => citizenTalk(c), infoPoint: (i) => infoPoint(i), observeScene: (o) => observeScene(o), streetLife: (e) => streetLife(e), dbg: () => ({ paused, storyBusy, storyCool, scene: !!scene, inside: !!inside, cine: document.body.className, overlays: [...document.body.children].filter((e) => !e.hidden && getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().width > 300).map((e) => e.id || e.className).join(",") }), get W() { return W; }, get G() { return G; }, get scene() { return scene; }, get music() { return music; }, moodNow: () => moodNow(), activeQ: () => activeQ(), get peds() { return peds; }, P, stepTarget, promotion, endOfWatch, journal, locker, useAbility, get regs() { return regs; }, npcTalk, queueLoot, enterBuilding, exitBuilding, get inside() { return inside; }, get FX() { return FX; }, enterBoat, unitPicker, setClock: (m) => { clock = m; }, get pboat() { return pboat; }, tapAt: (x, y) => { const [ix, iy] = iso(x, y); const r = cv.getBoundingClientRect(); tap(r.left + r.width / 2 + (ix - cam.x) * cam.z, r.top + r.height / 2 + (iy - 20 - cam.y) * cam.z); }, dispatchCall, get call() { return call; }, finalCall, districtBoard, goTo, load, get others() { return others; } };
