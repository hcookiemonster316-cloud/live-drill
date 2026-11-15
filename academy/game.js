// Patrol City: game loop, camera, input, people and traffic, lighting, dispatch, learning scenes and HUD.
import { N, TW, TH, T, iso, unIso, buildDistrict, drawGround, drawBuilding, drawProp, car, person, CAR_COLORS, shade } from './world.js';
import { DISTRICTS, LANDMARKS, CALLS, OBSERVE, SHIFTS, SHIFT_MIN, PHONETIC, QUICK } from './data.js';
import * as L from './learn.js';
import { startNet } from './net.js';

const $ = (id) => document.getElementById(id);
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const S = L.loadState();
const cv = $('view'), ctx = cv.getContext('2d');
const lc = document.createElement('canvas'), lx = lc.getContext('2d');
let W = null, G = null, SPR = [], NIGHT = false, net = null, others = {}, myUid = '';
let cam = { x: 0, y: 0, z: 1, free: false }, dpr = 1, cw = 0, ch = 0;
const P = { x: 0, y: 0, path: [], face: 1, moving: false, inCar: false, dir: 0, onArrive: null };
let pcar = null, peds = [], traffic = [], citizens = [], infos = [], observes = [], call = null, scene = null, clock = 0, nextCall = 15, paused = false, toastT = 0;
const shiftOf = () => SHIFTS.find((s) => s.id === S.shift) || SHIFTS[0];

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
  const open = [[sx, sy]], came = new Map(), gS = new Map([[sy * N + sx, 0]]), fS = new Map(), key = (x, y) => y * N + x, h = (x, y) => Math.hypot(tx - x, ty - y);
  fS.set(key(sx, sy), h(sx, sy)); const closed = new Set(); let guard = 0;
  const dirs = diag ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (open.length && guard++ < 6000) {
    let bi = 0; for (let i = 1; i < open.length; i++) if (fS.get(key(...open[i])) < fS.get(key(...open[bi]))) bi = i;
    const [x, y] = open.splice(bi, 1)[0], k = key(x, y);
    if (x === tx && y === ty) { const out = []; let c = k; while (c !== key(sx, sy)) { out.push([c % N + .5, Math.floor(c / N) + .5]); c = came.get(c); } return out.reverse(); }
    closed.add(k);
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy, nk = key(nx, ny); if (nx < 0 || ny < 0 || nx >= N || ny >= N || closed.has(nk) || !pass(nx, ny)) continue;
      if (dx && dy && (!pass(x + dx, y) || !pass(x, y + dy))) continue;
      const ng = gS.get(k) + (dx && dy ? 1.414 : 1); if (ng < (gS.has(nk) ? gS.get(nk) : 1e9)) { came.set(nk, k); gS.set(nk, ng); fS.set(nk, ng + h(nx, ny)); if (!open.some((o) => o[0] === nx && o[1] === ny)) open.push([nx, ny]); }
    }
  }
  return null;
}
function nearest(x, y, pass) { for (let r = 1; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (pass(x + dx, y + dy)) return [x + dx, y + dy]; return null; }
const pedPass = (x, y) => { const v = W.at(x, y); return (v === T.WALK || v === T.PLAZA) && !W.blocked.has(y * N + x); };
const roadPass = (x, y) => W.at(x, y) === T.ROAD;

// ---------- loading a district ----------
// the hour on the shift clock drives daylight, shadows and lit windows (midshift goes from day into night)
const hourNow = () => (shiftOf().start + clock / 60) % 24;
const isNight = (h) => h >= 18.75 || h < 6;
function sunFor(h) { return isNight(h) ? { len: 0, a: 0 } : { len: Math.round(18 + Math.abs(h - 12.5) * 6), a: .2 }; }
function buildSprites() { const h = hourNow(); NIGHT = isNight(h); const sun = sunFor(h); SPR = W.buildings.map((b) => Object.assign(drawBuilding(b, NIGHT, sun), { b, depth: b.x + b.w - 1 + b.y + b.d - 1 + .9 })); }
let sprHour = -1;
function load(did) {
  W = buildDistrict(did); G = drawGround(W); buildSprites(); sprHour = Math.floor(hourNow());
  P.x = W.spawn[0] + .5; P.y = W.spawn[1] + .5; P.path = []; P.inCar = false;
  pcar = W.carSpot ? { x: W.carSpot[0], y: W.carSpot[1], dir: 0, bar: false } : null;
  const h0 = hourNow(), busy = isNight(h0) ? (h0 >= 18.75 && h0 < 22 ? .6 : .38) : 1;
  peds = []; for (let i = 0; i < Math.round(30 * busy); i++) peds.push(newPed());
  traffic = []; for (let i = 0; i < Math.round(11 * busy) + 2; i++) traffic.push(newCar());
  citizens = []; infos = []; observes = []; call = null; nextCall = 12;
  W.lots.forEach((l) => { const lm = LANDMARKS[l.kind]; if (lm && lm.info != null && DISTRICTS[did].lessons.indexOf(lm.info) >= 0 && !infos.some((i) => i.kind === l.kind)) infos.push({ x: l.info[0] + .5, y: l.info[1] + .5, les: lm.info, name: lm.name, kind: l.kind, cool: 0 }); });
  for (let i = 0; i < 3; i++) citizens.push(newCitizen());
  for (let i = 0; i < 2; i++) observes.push(newObserve());
  cam.x = iso(P.x, P.y)[0]; cam.y = iso(P.x, P.y)[1]; cam.free = false;
  hud(); radio('Dispatch', 'All units, ' + shiftOf().name.toLowerCase() + ' in ' + W.D.name + ' is on. ' + S.cs + ', you are in service.');
  if (net) net.join(did, S.shift, { cs: S.cs, x: P.x, y: P.y, rank: L.rankOf(S.xp).name });
}
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const SKIN = ['#f1c9a5', '#e0b48f', '#c68e63', '#a26a42', '#7a4b2a', '#5a3620'], SHIRT = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#ecf0f1', '#16a085', '#d35400', '#7f8c8d', '#f5b7b1'], HAIR = ['#2b1d14', '#4a3020', '#8a5a2b', '#d8b46a', '#1a1a1a', '#9a9a9a'];
function newPed() { const s = rnd(W.walk); return { x: s[0] + .5, y: s[1] + .5, path: [], wait: Math.random() * 3, sp: 1.1 + Math.random() * .7, skin: rnd(SKIN), shirt: rnd(SHIRT), hair: rnd(HAIR), pants: rnd(['#3b4a5c', '#2c3e50', '#5d4037', '#455a64', '#1c1c1c']), ph: Math.random() * 9, face: 1 }; }
function newCar() { const roads = []; for (let i = 0; i < 40; i++) { const x = Math.floor(Math.random() * N), y = Math.floor(Math.random() * N); if (roadPass(x, y)) { roads.push([x, y]); break; } } const s = roads[0] || [0, 0]; return { x: s[0] + .5, y: s[1] + .5, path: [], sp: 2.6 + Math.random() * 1.6, color: rnd(CAR_COLORS), dir: 0 }; }
function newCitizen() { const s = rnd(W.walk); return { x: s[0] + .5, y: s[1] + .5, skin: rnd(SKIN), shirt: rnd(SHIRT), hair: rnd(HAIR), ph: 0, face: -1, les: rnd(W.D.lessons) }; }
function newObserve() { const did = W.did, ls = W.D.lessons.filter((l) => OBSERVE[l]); const les = rnd(ls.length ? ls : W.D.lessons); const o = rnd(OBSERVE[les] || [['Something looks out of place', 'door']]); const s = rnd(W.walk); return { x: s[0] + .5, y: s[1] + .5, les, text: o[0], kind: o[1], seen: false, t0: performance.now() }; void did; }

// ---------- dispatch ----------
function dispatchCall() {
  const les = L.weakest(S, W.did), list = CALLS[les] || [['Assist a citizen', 3, 'any', 'Citizen flagging down an officer.']], c = rnd(list);
  const lot = c[2] !== 'any' && W.lots.find((l) => l.kind === c[2] || (c[2] === 'parking' && (l.kind === 'parking' || l.kind === 'lot')) || (c[2] === 'houses' && l.kind === 'houses'));
  const spot = lot ? lot.door : rnd(W.walk), where = lot ? (LANDMARKS[lot.kind] || {}).name || 'the ' + lot.kind : 'block ' + (100 + spot[1] * 10) + ' ' + ['Main St', 'Bay St', 'Oak Ave', 'Pine St', 'Harbor Rd'][spot[0] % 5];
  call = { les, title: c[0], prio: c[1], text: c[3], x: spot[0] + .5, y: spot[1] + .5, where, t0: clock, accepted: false, backup: false };
  radio('Dispatch', S.cs + ', ' + (c[1] === 1 ? 'priority one, ' : '') + c[0].toLowerCase() + ' at ' + where + '. ' + c[3]); chirp(); callCard();
}
function callCard() {
  const el = $('callCard'); if (!call) { el.hidden = true; return; }
  el.hidden = false; el.className = 'callCard p' + call.prio;
  el.innerHTML = '<div class="ccTop"><b>' + (call.prio === 1 ? 'PRIORITY 1' : call.prio === 2 ? 'PRIORITY 2' : 'ROUTINE') + '</b><span>' + esc(L.lessonName(call.les)) + '</span></div><div class="ccT">' + esc(call.title) + '</div><div class="ccW">' + esc(call.where) + '</div>' +
    '<div class="ccB"><button type="button" id="ccGo">' + (call.accepted ? 'Navigate' : 'Respond') + '</button><button type="button" class="ghost" id="ccBk">' + (call.backup ? 'Backup requested' : 'Request backup') + '</button></div>';
  $('ccGo').onclick = () => { call.accepted = true; if (net) net.status('call'); radio(S.cs, 'En route.'); goTo(call.x, call.y, () => {}); callCard(); };
  $('ccBk').onclick = () => { if (call.backup) return; call.backup = true; if (net) net.backup({ x: call.x, y: call.y, l: call.title.slice(0, 48) }); radio(S.cs, 'Requesting backup at ' + call.where + '.'); callCard(); };
}

// ---------- movement ----------
function goTo(x, y, onArrive) {
  const pass = P.inCar ? (a, b) => W.drivable(a, b) : (a, b) => W.walkable(a, b) && !gateBlock(a, b);
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
  const sp = P.inCar ? (call && call.accepted ? 7.5 : 5.5) : 3.4;
  if (P.path.length) { const done = stepAlong(P, dt, sp); if (done && P.onArrive) { const f = P.onArrive; P.onArrive = null; f(); } }
  else P.moving = false;
  if (P.inCar && pcar) { pcar.x = P.x; pcar.y = P.y; pcar.dir = P.dir; pcar.bar = !!(call && call.accepted); }
  if (!cam.free) { const [ix, iy] = iso(P.x, P.y); cam.x += (ix - cam.x) * Math.min(1, dt * 6); cam.y += (iy - 22 - cam.y) * Math.min(1, dt * 6); }
  peds.forEach((p) => { if (p.wait > 0) { p.wait -= dt; p.moving = false; return; } if (!p.path.length) { const t = rnd(W.walk); const path = Math.hypot(t[0] - p.x, t[1] - p.y) < 16 ? astar(p.x, p.y, t[0], t[1], pedPass, true) : null; if (path) p.path = path; else p.wait = 1; return; } if (stepAlong(p, dt, p.sp)) p.wait = 1 + Math.random() * 4; });
  traffic.forEach((c) => { if (!c.path.length) { for (let k = 0; k < 6; k++) { const x = Math.floor(Math.random() * N), y = Math.floor(Math.random() * N); if (roadPass(x, y) && Math.hypot(x - c.x, y - c.y) < 24) { const p = astar(c.x, c.y, x, y, roadPass, false); if (p && p.length > 3) { c.path = p; break; } } } return; } stepAlong(c, dt, c.sp); });
  // arrive on a call
  if (call && Math.hypot(call.x - P.x, call.y - P.y) < 1.7 && !scene) { const c = call; call = null; callCard(); openCallScene(c); }
  if (!call && !scene) { nextCall -= dt; if (nextCall <= 0) dispatchCall(); }
  if (call && clock - call.t0 > 150) { radio('Dispatch', S.cs + ', disregard; another unit took that call.'); call = null; callCard(); nextCall = 20; if (net) { net.status('patrol'); net.backup(null); } }
  // observation moments appear only up close
  observes.forEach((o) => { if (!o.seen && Math.hypot(o.x - P.x, o.y - P.y) < 4.5) { o.seen = true; toast('Something\'s off: ' + o.text + '. Tap the ! to check it out.'); beep(880, .08, 'sine', .04); } });
  infos.forEach((i) => { if (i.cool > 0) i.cool -= dt; });
  // gates
  W.gates.forEach((g) => { if (Math.abs(P.x - (g.x + .5)) < 1.2 && Math.abs(P.y - (g.y + 1)) < 1.6 && !g.prompted) { g.prompted = true; gatePrompt(g); } else if (Math.hypot(P.x - (g.x + .5), P.y - (g.y + 1)) > 3) g.prompted = false; });
  // siren
  if (P.inCar && call && call.accepted) { sirenT -= dt; if (sirenT <= 0) { sirenT = .9; beep(720, .42, 'sine', .018); beep(980, .42, 'sine', .018, .45); } }
  if (net && now - moveSent > 120) { moveSent = now; net.move(P.x, P.y, P.inCar, P.dir); }
  hudClock();
  if (clock >= SHIFT_MIN && !scene) endOfWatch();
}

// ---------- drawing ----------
function darkness() {
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
  ctx.drawImage(G.canvas, -G.ox, -G.oy);
  const vx0 = cam.x - cv.width / 2 / z - 120, vx1 = cam.x + cv.width / 2 / z + 120, vy0 = cam.y - cv.height / 2 / z - 300, vy1 = cam.y + cv.height / 2 / z + 140;
  const vis = (sx, sy) => sx > vx0 && sx < vx1 && sy > vy0 && sy < vy1;
  const list = [];
  SPR.forEach((s) => { if (s.x + s.canvas.width > vx0 && s.x < vx1 && s.y + s.canvas.height > vy0 && s.y < vy1) list.push({ d: s.depth, f: () => ctx.drawImage(s.canvas, s.x, s.y) }); });
  W.props.forEach((p) => { const [sx, sy] = iso(p.x, p.y); if (vis(sx, sy)) list.push({ d: p.x + p.y, f: () => drawProp(ctx, p, sx, sy, now, NIGHT) }); });
  // locked gates get a barricade
  W.gates.forEach((g) => { const [sx, sy] = iso(g.x + .5, g.y + 1); if (!vis(sx, sy)) return; const open = S.unlocked.includes(g.to); list.push({ d: g.x + g.y + 1.5, f: () => gateArt(sx, sy, open, g, now) }); });
  peds.forEach((p) => { const [sx, sy] = iso(p.x, p.y); if (vis(sx, sy)) list.push({ d: p.x + p.y, f: () => person(ctx, sx, sy, p, now) }); });
  citizens.forEach((p) => { const [sx, sy] = iso(p.x, p.y); if (vis(sx, sy)) list.push({ d: p.x + p.y, f: () => { person(ctx, sx, sy, p, now); bubble(sx, sy - 46, '?', '#f5b800', now); } }); });
  traffic.forEach((c) => { const off = laneOff(c), [sx, sy] = iso(c.x + off[0], c.y + off[1]); if (vis(sx, sy)) list.push({ d: c.x + c.y, f: () => car(ctx, sx, sy, c.dir, c.color, false, now, NIGHT, 1) }); });
  if (pcar && !P.inCar) { const [sx, sy] = iso(pcar.x, pcar.y); list.push({ d: pcar.x + pcar.y, f: () => { car(ctx, sx, sy, pcar.dir, '#000', true, now, NIGHT, 1.05, false); if (Math.hypot(pcar.x - P.x, pcar.y - P.y) < 5) label(sx, sy - 34, 'Your patrol car', '#f5b800'); } }); }
  Object.keys(others).forEach((k) => { const o = others[k]; const [sx, sy] = iso(o.rx, o.ry); if (!vis(sx, sy)) return; list.push({ d: o.rx + o.ry, f: () => { if (o.v) car(ctx, sx, sy, o.d || 0, '#000', true, now, NIGHT, 1.05, o.st === 'call'); else person(ctx, sx, sy, { officer: true, moving: o.moving, face: 1, skin: o.skin, s: 1 }, now); label(sx, sy - (o.v ? 34 : 50), o.c + (o.sh && o.sh !== S.shift ? ' · ' + ({ day: 'Day', mid: 'Mid', night: 'Night' }[o.sh] || '') : ''), '#9cc3ff'); if (o.q && now - o.qAt < 6000) speech(sx, sy - (o.v ? 52 : 68), QUICK[o.q.k] || ''); } }); });
  { const [sx, sy] = iso(P.x, P.y); list.push({ d: P.x + P.y, f: () => { if (P.inCar) car(ctx, sx, sy, P.dir, '#000', true, now, NIGHT, 1.05, call && call.accepted); else person(ctx, sx, sy, { officer: true, moving: P.moving, face: P.face, skin: S.skin || '#c68e63', s: 1.08 }, now); } }); }
  list.sort((a, b) => a.d - b.d).forEach((e) => e.f());
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
    SPR.forEach((sp) => sp.lights.forEach((q) => hole(q[0], q[1], 34, .55)));
    traffic.forEach((c) => { const off = laneOff(c), [ix, iy] = iso(c.x + off[0], c.y + off[1]), f = [[1, .5], [-1, .5], [-1, -.5], [1, -.5]][c.dir]; hole(ix + f[0] * 34, iy + f[1] * 34, 56, .7); });
    { const [ix, iy] = iso(P.x, P.y); hole(ix, iy - 10, P.inCar ? 120 : 96, .8); }
    Object.keys(others).forEach((k) => { const o = others[k], [ix, iy] = iso(o.rx, o.ry); hole(ix, iy - 10, 70, .6); });
    const marks = markerPoints(); marks.forEach((m) => hole(m[0], m[1], 50, .7));
    ctx.drawImage(lc, 0, 0, cv.width, cv.height);
    // additive glows
    ctx.globalCompositeOperation = 'lighter';
    const glow = (ix, iy, r, col) => { const x = cv.width / 2 + (ix - cam.x) * z, y = cv.height / 2 + (iy - cam.y) * z, rr = r * z; if (x < -rr || y < -rr || x > cv.width + rr || y > cv.height + rr) return; const gr = ctx.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill(); };
    W.props.forEach((p) => { if (p.t === 'lamp') { const [ix, iy] = iso(p.x, p.y); glow(ix + 10, iy - 37, 18, 'rgba(255,220,150,.55)'); } });
    const bar = (x, y, on) => { const ph = Math.floor(now / 180) % 2; glow(x, y - 22, 46, on ? (ph ? 'rgba(255,40,40,.45)' : 'rgba(40,90,255,.45)') : 'rgba(0,0,0,0)'); };
    if (P.inCar && call && call.accepted) { const [ix, iy] = iso(P.x, P.y); bar(ix, iy, true); }
    Object.keys(others).forEach((k) => { const o = others[k]; if (o.v && o.st === 'call') { const [ix, iy] = iso(o.rx, o.ry); bar(ix, iy, true); } });
    ctx.globalCompositeOperation = 'source-over';
  }
  // markers drawn above the lighting so they stay readable
  ctx.setTransform(z, 0, 0, z, cv.width / 2 - cam.x * z, cv.height / 2 - cam.y * z);
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
  if (!m.base || m.did !== W.did) { const b = document.createElement('canvas'); b.width = m.width; b.height = m.height; const bg = b.getContext('2d'); for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = W.at(x, y); bg.fillStyle = v === T.ROAD ? '#515866' : v === T.BLDG ? '#9aa3b0' : v === T.WATER ? '#2d6c97' : v === T.GRASS ? '#3f6b2f' : v === T.LOT ? '#3a3f47' : '#7a756b'; bg.fillRect(x * s, y * s, s + .5, s + .5); } m.base = b; m.did = W.did; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, m.width, m.height);
  g.save(); g.translate(m.width / 2, m.height / 2); g.rotate(Math.PI / 4); g.scale(.72, .72 * .5 * 2); g.translate(-m.width / 2, -m.height / 2); g.drawImage(m.base, 0, 0);
  const dot = (x, y, c, r) => { g.fillStyle = c; g.beginPath(); g.arc(x * s, y * s, r, 0, Math.PI * 2); g.fill(); };
  if (call) dot(call.x, call.y, call.prio === 1 ? '#ff4d4d' : '#f5b800', 5);
  Object.keys(others).forEach((k) => dot(others[k].rx, others[k].ry, '#60a5fa', 3.2));
  infos.forEach((i) => dot(i.x, i.y, '#3b82f6', 2.5)); citizens.forEach((c) => dot(c.x, c.y, '#f5b800', 2.2));
  dot(P.x, P.y, '#ffffff', 4.2); dot(P.x, P.y, '#f5b800', 2.6);
  g.restore();
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
  for (const c of citizens) if (near(c.x, c.y, 30)) return reach(c.x, c.y, () => citizenTalk(c));
  for (const i of infos) if (near(i.x, i.y, 28)) return reach(i.x, i.y, () => infoPoint(i));
  for (const o of observes) if (o.seen && near(o.x, o.y, 30)) return reach(o.x, o.y, () => observeScene(o));
  if (call && near(call.x, call.y, 34)) { call.accepted = true; callCard(); return goTo(call.x, call.y); }
  for (const k in others) { const o = others[k]; if (o.b && near(o.b.x, o.b.y, 34)) return reach(o.b.x, o.b.y, () => backupScene(k, o)); }
  if (pcar && !P.inCar && near(pcar.x, pcar.y, 34)) return reach(pcar.x, pcar.y, enterCar);
  const [wx, wy] = unIso(ix, iy); goTo(wx, wy);
}
addEventListener('keydown', (e) => { if (scene || paused || e.target.closest('input,textarea')) return; const k = { ArrowUp: [-1, -1], w: [-1, -1], ArrowDown: [1, 1], s: [1, 1], ArrowLeft: [-1, 1], a: [-1, 1], ArrowRight: [1, -1], d: [1, -1] }[e.key]; if (!k) return; e.preventDefault(); goTo(P.x + k[0] * 1.6, P.y + k[1] * 1.6); });
function enterCar() { P.inCar = true; P.x = pcar.x; P.y = pcar.y; const r = nearest(Math.floor(P.x), Math.floor(P.y), (x, y) => W.drivable(x, y)); if (r) { P.x = r[0] + .5; P.y = r[1] + .5; } toast('In your patrol car. Tap the road to drive; lights and siren come on when you respond to a call.'); hud(); }
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
      const ans = q.multi ? picked.slice() : picked[0], ok = L.isRight(q, ans); L.record(S, q, ok); if (ok) { right++; good(); } else bad();
      opts.forEach((b) => { const k = +b.dataset.k, isC = q.multi ? q.c.indexOf(k) >= 0 : k === q.c; b.disabled = true; if (isC) b.classList.add('ok'); else if (picked.indexOf(k) >= 0) b.classList.add('no'); });
      $('qFb').innerHTML = '<div class="fb ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'Correct.' : 'Not quite.') + '</b> ' + esc(q.fact || q.ex) + ' <em>p. ' + esc(q.pg) + '</em></div>';
      const go = $('qGo'); go.disabled = false; go.textContent = i < qs.length - 1 ? 'Next' : 'Finish'; go.onclick = () => { i++; if (i < qs.length) show(); else { L.saveState ? L.saveState(S) : 0; done({ right, n: qs.length }); } };
    };
    opts.forEach((b) => b.onclick = () => { const k = +b.dataset.k; if (q.multi) { const at = picked.indexOf(k); if (at >= 0) picked.splice(at, 1); else picked.push(k); b.classList.toggle('sel'); $('qGo').disabled = !picked.length; } else { picked = [k]; submit(); } });
    $('qGo').onclick = () => { if (q.multi && picked.length) submit(); };
  };
  show();
}
function award(xp, why) { const before = L.rankOf(S.xp).name; S.xp += xp; const after = L.rankOf(S.xp).name; L.saveState(S); hud(); toast('+' + xp + ' RP · ' + why); if (after !== before) setTimeout(() => { chirp(); toast('Promoted to ' + after + '!'); }, 900); if (net) net.status('patrol'); }
function openCallScene(c) {
  if (net) net.status('call');
  const n = c.prio === 1 ? 4 : 3, qs = L.pick(S, [c.les], 'q', n), fast = clock - c.t0 < 40;
  runQuestions('<div class="sceneHead p' + c.prio + '"><b>ON SCENE · ' + esc(c.where) + '</b><h2>' + esc(c.title) + '</h2><p>' + esc(c.text) + '</p></div>', qs, (r) => {
    S.calls++; const xp = r.right * 25 + (fast ? 15 : 0) + (r.right === r.n ? 20 : 0); S.trust[W.did] = Math.min(100, (S.trust[W.did] || 50) + r.right - (r.n - r.right));
    openModal('<div class="sceneHead done"><b>CALL CLEARED</b><h2>' + r.right + ' of ' + r.n + ' handled by the book</h2><p>' + (fast ? 'Quick response bonus. ' : '') + (r.right === r.n ? 'Clean call. ' : 'Review what you missed in the hub.') + '</p></div>' + masteryLine() + '<div class="qAct"><button type="button" id="mDone">Back in service</button></div>');
    $('mDone').onclick = () => { closeModal(); radio(S.cs, 'Clear, back in service.'); award(xp, 'call cleared'); nextCall = 25 + Math.random() * 25; if (net) net.backup(null); };
  });
}
function citizenTalk(c) {
  const qs = L.pick(S, [c.les], 'jq', 1);
  runQuestions('<div class="sceneHead cit"><b>CITIZEN CONTACT</b><h2>"Officer, quick question about something I read..."</h2></div>', qs, (r) => { closeModal(); award(r.right ? 15 : 5, 'citizen contact'); const i = citizens.indexOf(c); if (i >= 0) citizens[i] = newCitizen(); });
}
function observeScene(o) {
  const qs = L.pick(S, [o.les], 'q', 1);
  runQuestions('<div class="sceneHead obs"><b>SOMETHING\'S OFF</b><h2>' + esc(o.text) + '</h2><p>What does the chapter say?</p></div>', qs, (r) => { closeModal(); award(r.right ? 25 : 5, 'sharp eyes'); const i = observes.indexOf(o); if (i >= 0) observes[i] = newObserve(); });
}
function infoPoint(i) {
  if (i.cool > 0) { toast('You checked ' + i.name + ' recently. Come back in a bit.'); return; }
  const f = L.fact(S, i.les); if (!f) return;
  openModal('<div class="sceneHead info"><b>' + esc(i.name.toUpperCase()) + ' · ' + esc(L.lessonName(i.les)) + '</b><h2>Know this</h2></div><p class="fact">' + esc(f.text) + ' <em>p. ' + esc(f.pg) + '</em></p><div class="qAct"><button type="button" id="mGo">Got it · quick check</button></div>');
  $('mGo').onclick = () => { const qs = L.pick(S, [i.les], 'tq', 1); runQuestions('<div class="sceneHead info"><b>QUICK CHECK</b></div>', qs, (r) => { closeModal(); i.cool = 120; award(r.right ? 10 : 3, 'study point'); }); };
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
function districtBoard() {
  const rows = DISTRICTS.map((d) => {
    const un = S.unlocked.includes(d.id), cl = S.cleared.includes(d.id), m = L.districtMastery(S, d.id), here = W.did === d.id;
    return '<div class="dRow' + (here ? ' here' : '') + (un ? '' : ' locked') + '" style="--dc:' + d.color + '"><div class="dHead"><b>' + (un ? '' : '🔒 ') + esc(d.name) + '</b><span>' + esc(d.unit) + '</span></div>' +
      (un ? '<div class="dLes">' + d.lessons.map((l, k) => { const x = m.lessons[k]; return '<div class="dL"><span>' + esc(L.lessonName(l)) + '</span><i><b style="width:' + Math.round(Math.min(1, x.n / 8) * x.pct * 100) + '%" class="' + (x.done ? 'ok' : '') + '"></b></i></div>'; }).join('') + '</div>' : '<p class="dLock">Master the district before it to unlock.</p>') +
      '<div class="dAct">' + (cl ? '<span class="cleared">★ District cleared</span>' : '') + (un && !here ? '<button type="button" data-go="' + d.id + '">Patrol here</button>' : '') + (here && !cl ? '<button type="button" data-final="1" ' + (m.ready ? '' : 'disabled') + '>' + (m.ready ? 'Take the District Final Call' : 'Final Call · master every lesson first') + '</button>' : '') + '</div></div>';
  }).join('');
  openModal('<div class="sceneHead"><b>CITY MAP · DISTRICTS</b><h2>Master a district to open the next one</h2><p>A lesson is mastered at 80% or better over your last ten answers on it (at least eight).</p></div><div class="dList">' + rows + '</div><div class="qAct"><button type="button" class="ghost" id="mClose">Close</button></div>');
  $('mClose').onclick = closeModal;
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
    $('mDone').onclick = () => { closeModal(); award(pass ? 300 : 40, pass ? 'district cleared' : 'final call attempt'); };
  });
}
function gatePrompt(g) {
  const d = DISTRICTS[g.to];
  if (!S.unlocked.includes(g.to)) { toast('🔒 ' + d.name + ' is locked. Master ' + W.D.name + ' and pass its Final Call to open it.'); return; }
  openModal('<div class="sceneHead"><b>DISTRICT LINE</b><h2>Head into ' + esc(d.name) + '?</h2><p>' + esc(d.unit) + '. ' + esc(d.blurb) + '</p></div><div class="qAct"><button type="button" id="gGo">Patrol ' + esc(d.name) + '</button><button type="button" class="ghost" id="gNo">Stay here</button></div>');
  $('gGo').onclick = () => { closeModal(); load(g.to); }; $('gNo').onclick = closeModal;
}
function endOfWatch() {
  scene = {}; const st = S.shiftStats || {};
  openModal('<div class="sceneHead done"><b>END OF WATCH</b><h2>' + esc(shiftOf().name) + ' complete</h2><p>Calls handled: ' + S.calls + ' all-time · Accuracy: ' + (S.answered ? Math.round(S.right / S.answered * 100) : 0) + '% · Rank: ' + esc(L.rankOf(S.xp).name) + '</p></div>' + masteryLine() + '<div class="qAct"><button type="button" id="eNext">Start next shift</button></div>');
  $('eNext').onclick = () => { const i = SHIFTS.findIndex((s) => s.id === S.shift); S.shift = SHIFTS[(i + 1) % 3].id; L.saveState(S); clock = 0; closeModal(); load(W.did); award(50, 'full shift'); };
  void st;
}

// ---------- HUD ----------
function hud() {
  const r = L.rankOf(S.xp), m = L.districtMastery(S, W.did);
  $('hCs').textContent = S.cs; $('hRank').textContent = r.name + ' · ' + S.xp + ' RP';
  $('hDist').textContent = W.D.name; $('hDist').style.setProperty('--dc', W.D.color);
  $('hMast').style.setProperty('--p', Math.round(m.pct * 100)); $('hMastN').textContent = m.done + '/' + m.total;
  $('bCar').textContent = P.inCar ? 'Exit car' : 'Car'; $('bCar').classList.toggle('on', P.inCar);
  $('bSnd').textContent = S.sound ? '🔊' : '🔇';
}
function hudClock() { const t = (shiftOf().start * 60 + Math.floor(clock)) % 1440; const s = String(Math.floor(t / 60)).padStart(2, '0') + String(t % 60).padStart(2, '0') + ' hrs'; const el = $('hClock'); if (el.textContent !== s) el.textContent = shiftOf().name + ' · ' + s; }
const feed = [];
function radio(who, msg) { feed.push([who, msg]); while (feed.length > 30) feed.shift(); const el = $('radio'); el.innerHTML = feed.slice(-3).map((f) => '<div><b>' + esc(f[0]) + ':</b> ' + esc(f[1]) + '</div>').join(''); }
function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 3800); }
$('bCar').onclick = () => { if (P.inCar) exitCar(); else if (pcar) { if (Math.hypot(pcar.x - P.x, pcar.y - P.y) < 2.2) enterCar(); else { toast('Walking back to your patrol car.'); goTo(pcar.x, pcar.y, enterCar); } } };
$('bMap').onclick = districtBoard;
$('bSnd').onclick = () => { S.sound = !S.sound; L.saveState(S); hud(); };
$('bMe').onclick = () => { cam.free = false; };
$('zIn').onclick = () => setZoom(cam.z * 1.2); $('zOut').onclick = () => setZoom(cam.z / 1.2);
$('bRadio').onclick = () => { const m = $('quick'); m.hidden = !m.hidden; };
$('quick').innerHTML = QUICK.map((q, k) => '<button type="button" data-q="' + k + '">' + esc(q) + '</button>').join('');
$('quick').querySelectorAll('button').forEach((b) => b.onclick = () => { $('quick').hidden = true; radio(S.cs, QUICK[+b.dataset.q]); if (net) net.quick(+b.dataset.q); chirp(); });

// ---------- multiplayer ----------
function onPlayers(all, uid) {
  myUid = uid; const now = N0(), seen = {};
  Object.keys(all).forEach((k) => {
    if (k === uid) return; const v = all[k]; if (!v || !v.t || now - v.t > 45000) return; seen[k] = 1;
    const o = others[k] || (others[k] = { rx: v.x, ry: v.y, skin: rnd(SKIN) });
    if (v.q && (!o.q || o.q.t !== v.q.t) && now - v.q.t < 8000) { o.qAt = performance.now(); radio(v.c, QUICK[v.q.k] || ''); }
    if (v.b && v.b.t && (!o.b || o.b.t !== v.b.t) && now - v.b.t < 60000) { radio(v.c, 'Requesting backup: ' + (v.b.l || '')); chirp(); toast(v.c + ' requests backup. Tap the blue marker to respond.'); }
    if (v.a === uid && o.a !== uid) { toast(v.c + ' arrived to back you up.'); good(); }
    Object.assign(o, { sh: v.s, tx: v.x, ty: v.y, c: v.c, v: v.v, d: v.d, st: v.st, q: v.q, b: v.b, a: v.a });
  });
  Object.keys(others).forEach((k) => { if (!seen[k]) delete others[k]; });
  $('hOn').textContent = (Object.keys(others).length + 1) + ' on shift';
}
function smoothOthers(dt) { Object.keys(others).forEach((k) => { const o = others[k]; if (o.tx == null) return; const dx = o.tx - o.rx, dy = o.ty - o.ry; o.moving = Math.hypot(dx, dy) > .05; o.rx += dx * Math.min(1, dt * 5); o.ry += dy * Math.min(1, dt * 5); }); }

// ---------- start screen ----------
function callsign(did) { return (did + 1) + '-' + rnd(PHONETIC) + '-' + (10 + Math.floor(Math.random() * 89)); }
function startScreen() {
  let did = S.home != null ? S.home : 0, shift = S.shift || 'day', cs = S.cs || callsign(did);
  const draw = () => {
    $('start').innerHTML = '<div class="stBox"><div class="stBrand"><span class="stBadge">★</span><div><b>PATROL CITY</b><small>Learn the job on the street · Chapter 5</small></div></div>' +
      '<label class="stL">Your call sign</label><div class="stCs"><b>' + esc(cs) + '</b><button type="button" id="stRe">New call sign</button></div>' +
      (S.home == null ? '<label class="stL">Pick your district</label><div class="stD">' + DISTRICTS.map((d) => '<button type="button" class="' + (d.id === did ? 'on' : '') + '" data-d="' + d.id + '" style="--dc:' + d.color + '"><b>' + esc(d.name) + '</b><span>' + esc(d.unit) + '</span></button>').join('') + '</div><p class="stNote">You start locked to this district. Master it to open the next one.</p>' : '<p class="stNote">Your district: <b>' + esc(DISTRICTS[S.home].name) + '</b>. Change districts from the city map once others are open.</p>') +
      '<label class="stL">Pick your shift</label><div class="stS">' + SHIFTS.map((s) => '<button type="button" class="' + (s.id === shift ? 'on' : '') + '" data-s="' + s.id + '"><b>' + s.name + '</b><span>' + s.hours + '</span><small>' + s.note + '</small></button>').join('') + '</div>' +
      '<button type="button" class="stGo" id="stGo">Start roll call</button><p class="stFine">Sim training game for FBRTP cadets. Answers come from your Chapter 5 study material.</p></div>';
    $('stRe').onclick = () => { cs = callsign(did); draw(); };
    document.querySelectorAll('[data-d]').forEach((b) => b.onclick = () => { did = +b.dataset.d; cs = callsign(did); draw(); });
    document.querySelectorAll('[data-s]').forEach((b) => b.onclick = () => { shift = b.dataset.s; draw(); });
    $('stGo').onclick = () => { audio(); S.cs = cs; S.shift = shift; if (S.home == null) { S.home = did; S.unlocked = [did]; } L.saveState(S); $('start').hidden = true; clock = 0; load(S.home != null && S.unlocked.includes(did) ? did : S.home); rollCall(); };
  };
  draw(); $('start').hidden = false;
}
function rollCall() {
  const d = W.D;
  openModal('<div class="sceneHead"><b>ROLL CALL · ' + esc(shiftOf().name.toUpperCase()) + '</b><h2>' + esc(d.name) + '</h2><p>' + esc(d.blurb) + '</p></div><p class="fact">Tonight\'s focus: ' + d.lessons.map((l) => esc(L.lessonName(l))).join(' · ') + '.</p><ul class="how"><li>Tap the street to walk; tap your patrol car to drive.</li><li>Answer dispatch calls, help citizens with a <b>?</b>, check study points <b>i</b> and anything that looks off <b>!</b>.</li><li>Master every lesson here, then take the District Final Call to open the next district.</li></ul><div class="qAct"><button type="button" id="mDone">Hit the street</button></div>');
  $('mDone').onclick = closeModal;
}

// ---------- boot ----------
function resize() { dpr = Math.min(2, window.devicePixelRatio || 1); cw = innerWidth; ch = innerHeight; cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); cv.style.width = cw + 'px'; cv.style.height = ch + 'px'; if (!S.zoom) cam.z = cw < 600 ? .85 : 1.15; else cam.z = S.zoom; }
addEventListener('resize', resize); resize();
function frame(now) { const dt = Math.min(.05, (now - last) / 1000); last = now; if (W) { update(dt, now); smoothOthers(dt); render(now); } requestAnimationFrame(frame); }
(async function boot() {
  $('loading').textContent = 'Loading the city…';
  try { await L.loadBank('../ch5.json'); } catch (e) { $('loading').textContent = 'Could not load the question bank. Check your connection and refresh.'; return; }
  $('loading').hidden = true;
  startScreen();
  requestAnimationFrame(frame);
  try { net = await startNet(onPlayers); if (net && W) net.join(W.did, S.shift, { cs: S.cs, x: P.x, y: P.y, rank: L.rankOf(S.xp).name }); } catch (e) { net = null; }
  if (!net) $('hOn').textContent = 'Offline';
})();
window.__pc = { S, get W() { return W; }, P, dispatchCall, get call() { return call; }, finalCall, districtBoard, goTo, load, get others() { return others; } };
