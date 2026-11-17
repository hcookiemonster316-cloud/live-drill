// Patrol City: game loop, camera, input, people and traffic, lighting, dispatch, learning scenes and HUD.
import { N, TW, TH, T, CH, iso, unIso, buildDistrict, drawGround, setRes, setGroundRes, frameStart, setSun, RES, GRES, drawBuilding, drawProp, car, person, personFast, dog, dogFast, vehicle, rideArt, CAR_COLORS, shade, drawPropFast, hiCanvas } from './world.js';
import { DISTRICTS, NPCS, LANDMARKS, CALLS, OBSERVE, SHIFTS, SHIFT_MIN, PHONETIC, QUICK, UNITS, STATS, unitName } from './data.js';
import * as L from './learn.js';
import { startNet } from './net.js';
import { peopleFor } from './npcgen.js';
import { WORLD, LORE, CAST, CHAPTERS, SIDE, MAIN_TITLE } from './story.js';
import { SIDE2, SIDE_CAST, LORE2 } from './sidequests.js';
import { SAGAS, SAGA_CAST, SAGA_LORE, QITEMS, MAIN_ADDS } from './sagas.js';
import { TALES, TALE_CAST, TALE_ITEMS, TALE_LORE, TALE_MEMORY, NOTES, DISTRICT_VOICE, RECAST } from './tales.js';
import { ACT2, ACT2_CAST, ACT2_ITEMS, ACT2_LORE, NOTE_SETS, SET_NOTES, MARKS, MEMORY2, HOOKS, DEEDS } from './act2.js';
for (const k in MEMORY2) TALE_MEMORY[k] = (TALE_MEMORY[k] || []).concat(MEMORY2[k].filter((m) => !(TALE_MEMORY[k] || []).some((x) => x[0] === m[0])));
import { LORE_PEOPLE, LORE_PLACES } from './people2.js';
import { VOICES, ANYONE } from './voices.js';
import { createMiniGames } from './minigames.js';
import { installLife } from './life.js';
import { installOffDuty } from './offduty.js';
import { installAcademy } from './academy.js';
import { installEvents } from './events.js';
import { installPolish } from './polish.js';
import { installEpic } from './epic.js';
import { installOnboard } from './onboard.js';
import { installFeel } from './feel.js';
import { installSafe } from './safe.js';
import { installNGPlus } from './ngplus.js';
import { installPremium } from './premium.js';
import { installCoop, QUICK_EXTRA } from './coop.js';
import { installRewards } from './rewards.js';
import { installCity } from './city.js';
if (QUICK.length < 10) QUICK.push(QUICK_EXTRA);
SIDE2.forEach((q) => { if (!SIDE.some((o) => o.id === q.id)) SIDE.push(q); }); SAGAS.forEach((q) => { if (!SIDE.some((o) => o.id === q.id)) SIDE.push(q); }); SAGA_LORE.forEach((e) => { if (!LORE.some((o) => o.id === e.id)) LORE.push(e); });
TALES.forEach((q) => { if (!SIDE.some((o) => o.id === q.id)) SIDE.push(q); }); TALE_LORE.forEach((e) => { if (!LORE.some((o) => o.id === e.id)) LORE.push(e); }); Object.assign(QITEMS, TALE_ITEMS);
ACT2.forEach((q) => { if (!SIDE.some((o) => o.id === q.id)) SIDE.push(q); }); ACT2_LORE.forEach((e) => { if (!LORE.some((o) => o.id === e.id)) LORE.push(e); }); Object.assign(QITEMS, ACT2_ITEMS);
SET_NOTES.forEach((n) => { if (!NOTES.some((o) => o.id === n.id)) NOTES.push(n); }); NOTE_SETS.forEach((c) => LORE.push({ id: 'c_' + c.id, when: 'note:' + c.d, title: c.title, text: c.find + ' ' + ACT2_ITEMS[c.item].read }));
NOTES.forEach((n) => { if (!LORE.some((o) => o.id === n.id)) LORE.push({ id: n.id, when: 'note:' + n.d, title: n.title, text: n.text }); });
// older side cases hand the radio to the district's own officer instead of Sgt. Castillo
(() => { const nm = { duarte: 'Cpl. Duarte', whitfield: 'Ofc. Whitfield', saito: 'Sgt. Saito' }, swap = (to) => (L) => (L || []).forEach((l) => { if (!Array.isArray(l)) return; if (l[0] === 'choice') return l[1].forEach((o) => swap(to)(o.reply)); if (l[0] === 'castillo') l[0] = to; if (typeof l[1] === 'string') l[1] = l[1].replace(/Sgt\. Castillo|Castillo/g, nm[to]); });
  for (const to in RECAST) RECAST[to].forEach((id) => { const q = SIDE.find((x) => x.id === id); if (!q) return; const sw = swap(to); sw(q.offer); q.steps.forEach((st) => { if (st.who === 'castillo') st.who = to; st.goal = st.goal.replace(/Sgt\. Castillo|Castillo/g, nm[to]); sw(st.say); sw(st.after); }); }); })();
MAIN_ADDS.forEach((m) => { for (const ch of CHAPTERS) { const st = ch.steps.find((x) => x.goal === m.goal); if (!st) continue; if (m.add) st.say = m.pre ? m.add.concat(st.say || []) : (st.say || []).concat(m.add); if (m.give) st.give = m.give; if (m.take) st.take = m.take; if (m.twist) st.twist = m.twist; break; } }); LORE2.forEach((e) => { if (!LORE.some((o) => o.id === e.id)) LORE.push(e); }); LORE_PLACES.concat(LORE_PEOPLE).forEach((e) => { if (!LORE.some((o) => o.id === e.id || o.when === e.when)) LORE.push(e); });
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
const lc = document.createElement('canvas'), lx = lc.getContext('2d'), glc = document.createElement('canvas'), gx = glc.getContext('2d');
let W = null, G = null, SPR = [], NIGHT = false, net = null, others = {}, myUid = '';
// zUser is the zoom the player chose; zMul is a short effect (a punch-in); cam.z eases toward zUser x zMul (or a cinematic's zoom)
let EXA = null, EXK = null, exDirty = 0, exT = 0, REW = null, CITY = null;
const weekKeyFn = () => { const d = new Date(), j = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), w = Math.ceil(((d - j) / 864e5 + j.getUTCDay() + 1) / 7); return d.getUTCFullYear() + 'w' + String(w).padStart(2, '0'); };
let cam = { x: 0, y: 0, z: 1, zUser: 1, zMul: 1, free: false }, dpr = 1, cw = 0, ch = 0;
const P = { x: 0, y: 0, path: [], face: 1, moving: false, inCar: false, dir: 0, onArrive: null };
let OCOUNT = 0; let pcar = null, peds = [], traffic = [], citizens = [], infos = [], observes = [], call = null, scene = null, clock = 0, nextCall = 15, paused = false, toastT = 0;
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
const spotR = () => (3 + ST().per * .8) * (S.unit === 'k9' ? 2 * (CITY ? CITY.animalMult() : 1) : 1) + gp('spot');
const callWait = () => 90 + ST().com * 20 + gp('wait'); // game minutes before another unit takes the call
function callMult(c) { const u = U(); let m = (c.prio <= 2 ? 1 + (ST().tac - 3) * .1 : 1) * (1 + gp('rpCall') / 100); if (u.id === 'swat' && c.prio === 1) m *= 1.5; if (u.id === 'patrol') m *= 1.1; if ((DBL[u.id] || []).indexOf(c.les) >= 0) m *= 2; return m; }
let pboat = null; const K9 = { x: 0, y: 0, face: 1, moving: false };

// ---------- sound (tiny synth, no files) ----------
let AC = null; const audio = () => { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return AC; };
function beep(f, d, type, v, when) { if (!S.sound) return; const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = type || 'square'; o.frequency.value = f; const vv = (v || .04) * (S.cfg ? S.cfg.sfx : 1); o.connect(g); g.connect(a.destination); const t = a.currentTime + (when || 0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vv, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + Math.max(.03, d)); o.start(t); o.stop(t + d + .03); }
const chirp = (who) => { let v = S.cfg && S.cfg.vRadio != null ? S.cfg.vRadio : 1; if (!v) return; let f = 1; if (who) { let h = 7; for (const ch of String(who)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; f = .86 + (h % 9) * .035; } const mu = typeof inside !== 'undefined' && inside ? .55 : 1; v *= mu;
  beep(1400 * f * (mu < 1 ? .8 : 1), .06, 'square', .03 * v); beep(1900 * f * (mu < 1 ? .8 : 1), .07, 'square', .03 * v, .07); if (Math.random() < .5) beep(95 + Math.random() * 60, .05, 'sawtooth', .012 * v, .16); };
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
// a building on screen with no drawing yet is painted right away (never a pop-in); relights and buildings just off
// screen go to the sprite worker, and the old drawing stays up until the new one arrives
function spriteOf(s) {
  if (!s.canvas) { s.stale = 0; setSprite(s, drawBuilding(s.b, NIGHT ? SPR_LIT : false, SUN)); }
  else if (s.stale && !s.pending) { if (SPRW) sprAsk(s); else if (RELIT < 3) { RELIT++; s.stale = 0; setSprite(s, drawBuilding(s.b, NIGHT ? SPR_LIT : false, SUN)); } }
  s.used = performance.now(); return s; }
function setSprite(s, r) { if (s.canvas && s.canvas.close) s.canvas.close(); s.canvas = r.canvas; s.x = r.x; s.y = r.y; s.lights = r.lights; s.res = RES; }
let SPRW = null, SPRN = 0; const SPRJ = new Map();
try { if (typeof OffscreenCanvas !== 'undefined' && !/[?&]noworker\b/.test(location.search)) { SPRW = new Worker(new URL('./sprw.js', import.meta.url), { type: 'module' }); SPRW.onmessage = (e) => { const d = e.data, s = SPRJ.get(d.id); SPRJ.delete(d.id); if (!s) { if (d.bmp) d.bmp.close(); return; } s.pending = 0; if (d.fail) { SPRW = null; return; } if (d.res !== RES || s.gen !== SPRGEN) { if (d.bmp) d.bmp.close(); s.stale = 1; return; } d.bmp.lw = d.lw; d.bmp.lh = d.lh; s.stale = 0; setSprite(s, { canvas: d.bmp, x: d.x, y: d.y, lights: d.lights }); }; SPRW.onerror = () => { SPRW = null; }; } } catch (e) { SPRW = null; }
let SPRGEN = 0;
function sprAsk(s) { if (!SPRW || s.pending || SPRJ.size > 6) return; const id = ++SPRN; s.pending = 1; s.gen = SPRGEN; SPRJ.set(id, s); try { SPRW.postMessage({ id, b: s.b, lit: NIGHT ? SPR_LIT : false, sun: SUN, res: RES }); } catch (e) { SPRJ.delete(id); s.pending = 0; SPRW = null; } }
// never drop a building that was on screen in the last second (dropping visible ones made them flash in and out)
function trimSprites() { const live = SPR.filter((s) => s.canvas), t = performance.now(), recent = live.filter((s) => t - s.used < 1000).length, cap = Math.max(recent + 12, Math.round(120 / Math.max(1, RES * RES * .6))); if (live.length < cap + 20) return; live.filter((s) => t - s.used >= 1000).sort((a, b) => a.used - b.used).slice(0, live.length - cap).forEach((s) => { if (s.canvas && s.canvas.close) s.canvas.close(); s.canvas = null; s.lights = []; }); }
// street lights come on one by one at dusk and go off one by one at dawn; each has its own photocell
function lampsUpdate(h) { if (!W || !W.props) return; if (h == null) h = hourNow(); W.props.forEach((p) => { if (p.t !== 'lamp') return; const k = ((p.x * 7.13 + p.y * 3.71) % 1 + 1) % 1; p.on = inside ? true : (h >= 18.1 + k * .9 || h < 5.7 + k * .7); }); }
function focus() { return ATTRACT || !P ? unIso(cam.x, cam.y) : [P.x, P.y]; }
// ground chunks around the camera
// The street is composed once into a screen-sized buffer (plus a margin) and copied to the screen in one pixel-exact
// stroke. When the camera nears the edge of the buffer, the buffer slides over and only the newly uncovered strip is
// drawn. Same pixels as drawing every chunk every frame, a fraction of the work. While zooming, chunks draw directly.
let GB = null, GBX = null, gbZ = 0, gbStable = 0;
function chunkRange(ix0, iy0, ix1, iy1) {
  const pts = [unIso(ix0, iy0), unIso(ix1, iy0), unIso(ix0, iy1), unIso(ix1, iy1)], M = Math.ceil(N / CH) - 1;
  let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9; for (const p of pts) { if (p[0] < mnx) mnx = p[0]; if (p[0] > mxx) mxx = p[0]; if (p[1] < mny) mny = p[1]; if (p[1] > mxy) mxy = p[1]; }
  return [Math.max(0, Math.floor(mnx / CH)), Math.min(M, Math.floor(mxx / CH)), Math.max(0, Math.floor(mny / CH)), Math.min(M, Math.floor(mxy / CH))];
}
// draw the chunks covering an iso rectangle into g (whose transform is already set); returns false if a chunk was missing
let gMade = 0;
function chunksInto(g, ix0, iy0, ix1, iy1, now) {
  const [cx0, cx1, cy0, cy1] = chunkRange(ix0 - 80, iy0 - 80, ix1 + 80, iy1 + 80); let whole = true;
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
    const k = cx + ',' + cy; let c = G.chunks.get(k);
    if (!c) { if (gMade >= 1 && G.chunks.size > 4) { G.miss = 1; whole = false; continue; } c = drawGround(W, cx, cy); G.chunks.set(k, c); G.ver = (G.ver || 0) + 1; gMade++; }
    c.used = now; g.drawImage(c.canvas, -c.ox, -c.oy, c.canvas.lw, c.canvas.lh);
  }
  return whole;
}
function gbCanvas(old, w, h) { if (old && old.width === w && old.height === h) return old; const c = document.createElement('canvas'); c.width = w; c.height = h; c.g = c.getContext('2d', { alpha: false }); return c; }
// paint a device-pixel rectangle (relative to the iso origin) of the buffer
function gbPaint(b, rx, ry, rw, rh, z, now) {
  if (rw <= 0 || rh <= 0) return true; const g = b.c.g; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.beginPath(); g.rect(rx - b.x, ry - b.y, rw, rh); g.clip();
  g.fillStyle = '#0d1422'; g.fillRect(rx - b.x, ry - b.y, rw, rh); g.setTransform(z, 0, 0, z, -b.x, -b.y);
  const ok = chunksInto(g, rx / z, ry / z, (rx + rw) / z, (ry + rh) / z, now); g.restore(); return ok;
}
function groundDraw(z, tx, ty) {
  if (G.canvas) { ctx.drawImage(G.canvas, -G.ox, -G.oy, G.canvas.lw || G.canvas.width, G.canvas.lh || G.canvas.height); return; }
  const now = performance.now(), vw = cv.width, vh = cv.height; gMade = 0;
  gbStable = z === gbZ ? gbStable + 1 : 0; gbZ = z;
  const [cx0, cx1, cy0, cy1] = chunkRange(cam.x - vw / 2 / z - 80, cam.y - vh / 2 / z - 80, cam.x + vw / 2 / z + 80, cam.y + vh / 2 / z + 80);
  if (gbStable < 2 || S.cfg && S.cfg.gbuf === false) { GB = null; chunksInto(ctx, cam.x - vw / 2 / z, cam.y - vh / 2 / z, cam.x + vw / 2 / z, cam.y + vh / 2 / z, now); }
  else {
    // the screen, in device pixels measured from the iso origin
    const sx = -tx, sy = -ty, m = Math.round(Math.max(vw, vh) * .2), bw = vw + m * 2, bh = vh + m * 2;
    if (!GB || GB.z !== z || GB.G !== G || GB.gen !== G.gen || GB.c.width !== bw || GB.c.height !== bh || (!GB.whole && GB.ver !== G.ver)) {
      GB = { c: gbCanvas(GB && GB.c, bw, bh), x: sx - m, y: sy - m, z, G, gen: G.gen, ver: G.ver };
      GB.whole = gbPaint(GB, GB.x, GB.y, bw, bh, z, now); GB.ver = G.ver;
    } else if (sx < GB.x || sy < GB.y || sx + vw > GB.x + bw || sy + vh > GB.y + bh) {
      // slide: copy what is still in view, then draw only the uncovered strips
      const nx = sx - m, ny = sy - m, nb = { c: gbCanvas(GBX && GBX !== GB.c ? GBX : null, bw, bh), x: nx, y: ny, z, G, gen: G.gen };
      const g = nb.c.g; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#0d1422'; g.fillRect(0, 0, bw, bh); g.drawImage(GB.c, GB.x - nx, GB.y - ny);
      const ox0 = Math.max(nx, GB.x), oy0 = Math.max(ny, GB.y), ox1 = Math.min(nx + bw, GB.x + bw), oy1 = Math.min(ny + bh, GB.y + bh); let ok = GB.whole;
      if (ox0 >= ox1 || oy0 >= oy1) ok = gbPaint(nb, nx, ny, bw, bh, z, now);
      else { ok = gbPaint(nb, nx, ny, bw, oy0 - ny, z, now) && ok; ok = gbPaint(nb, nx, oy1, bw, ny + bh - oy1, z, now) && ok; ok = gbPaint(nb, nx, oy0, ox0 - nx, oy1 - oy0, z, now) && ok; ok = gbPaint(nb, ox1, oy0, nx + bw - ox1, oy1 - oy0, z, now) && ok; }
      GBX = GB.c; nb.whole = ok; nb.ver = G.ver; GB = nb;
    }
    // keep chunks under the buffer marked as in use so the memory budget never drops them
    if (gbStable % 30 === 0) chunkRangeTouch(GB, z, now);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(GB.c, GB.x + tx, GB.y + ty); ctx.restore();
  }
  // chunks just outside the view are prepared in idle time (between frames), never inside a frame, so walking and driving stay smooth
  G.view = [cx0, cx1, cy0, cy1]; if (!G.idle) { G.idle = 1; idleSoon(groundAhead); }
  // memory budget for cached ground: only chunks that have been off screen for a while are dropped, oldest first
  if ((G.tick = (G.tick || 0) + 1) % 20) return;
  let bytes = 0; G.chunks.forEach((c) => { bytes += c.canvas.width * c.canvas.height * 4; });
  if (bytes > GROUND_BUDGET && G.chunks.size > (cx1 - cx0 + 1) * (cy1 - cy0 + 1) + 4) { const old = [...G.chunks.entries()].filter((e) => now - e[1].used > 1500).sort((a, b) => a[1].used - b[1].used); for (const [k, c] of old) { if (bytes <= GROUND_BUDGET * .85) break; bytes -= c.canvas.width * c.canvas.height * 4; G.chunks.delete(k); } }
}
function chunkRangeTouch(b, z, now) { const [a0, a1, b0, b1] = chunkRange(b.x / z - 80, b.y / z - 80, (b.x + b.c.width) / z + 80, (b.y + b.c.height) / z + 80); for (let cy = b0; cy <= b1; cy++) for (let cx = a0; cx <= a1; cx++) { const c = G.chunks.get(cx + ',' + cy); if (c) c.used = now; } }
// how much memory cached ground may use, by device class
const GROUND_BUDGET = (navigator.deviceMemory >= 8 ? 320 : navigator.deviceMemory >= 4 ? 200 : navigator.deviceMemory ? 110 : (innerWidth < 700 ? 150 : 260)) * 1e6;
const idleSoon = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 250 }) : setTimeout(() => fn({ timeRemaining: () => 12, didTimeout: false }), 40));
let camPrev = null;
function groundAhead(dl) {
  G.idle = 0; if (!W || !G || G.canvas || inside || !G.view) return; const t0 = performance.now(), [cx0, cx1, cy0, cy1] = G.view, M2 = Math.ceil(N / CH) - 1;
  // look further ahead in the direction the camera is moving
  const vx = camPrev ? cam.x - camPrev[0] : 0, vy = camPrev ? cam.y - camPrev[1] : 0; camPrev = [cam.x, cam.y];
  const ccx = (cx0 + cx1) / 2 + Math.sign(vx + vy * 2) * .8, ccy = (cy0 + cy1) / 2 + Math.sign(vy * 2 - vx) * .8, want = [];
  for (let cy = Math.max(0, cy0 - 2); cy <= Math.min(M2, cy1 + 2); cy++) for (let cx = Math.max(0, cx0 - 2); cx <= Math.min(M2, cx1 + 2); cx++) if (!G.chunks.has(cx + ',' + cy)) want.push([Math.hypot(cx - ccx, cy - ccy), cx, cy]);
  want.sort((a, b) => a[0] - b[0]);
  let built = 0; for (const [, cx, cy] of want) { if (built && (dl.timeRemaining() < 8 || performance.now() - t0 > 10)) break; const c2 = drawGround(W, cx, cy); c2.used = performance.now(); G.chunks.set(cx + ',' + cy, c2); G.ver = (G.ver || 0) + 1; built++; if (built >= 2) break; }
  if (want.length > built) { G.idle = 1; idleSoon(groundAhead); }
}

let sprHour = -1;
function load(did) {
  refreshGear();
  inside = null; if (net && net.inside) net.inside(-1);
  W = PREBUILT.get(did) || buildDistrict(did); PREBUILT.delete(did); G = { chunks: new Map() }; buildSprites(); sprHour = Math.floor(hourNow()); setTimeout(prebuildSoon, 4000);
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
  if (net) Promise.resolve(net.join(did, S.shift, { cs: S.cs, unit: S.unit, flair: myTokens(), x: P.x, y: P.y, rank: L.rankOf(S.xp).name })).then(commsJoin).then(() => COOP.joinDistrict()).catch(() => {});
}
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const SKIN = ['#f1c9a5', '#e0b48f', '#c68e63', '#a26a42', '#7a4b2a', '#5a3620'], SHIRT = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#ecf0f1', '#16a085', '#d35400', '#7f8c8d', '#f5b7b1'], HAIR = ['#2b1d14', '#4a3020', '#8a5a2b', '#d8b46a', '#1a1a1a', '#9a9a9a'];
function nearTile(list, r) { const c = focus(); for (let k = 0; k < 60; k++) { const t = list[Math.floor(Math.random() * list.length)]; if (t && Math.hypot(t[0] - c[0], t[1] - c[1]) < r) return t; } return list[Math.floor(Math.random() * list.length)]; }
function newPed() { const p = newPed0(); return CITY ? CITY.seasonLook(p) : p; }
function newPed0() { const s = nearTile(W.walk, 22), h = typeof hourNow === 'function' ? hourNow() : 12, r = Math.random(), base = { top: FX && FX.cold ? (Math.random() < .5 ? 'jacket' : 'hoodie') : undefined, x: s[0] + .5, y: s[1] + .5, path: [], wait: Math.random() * 3, sp: 1.1 + Math.random() * .7, s: Math.round((.92 + Math.random() * .16) * 20) / 20, skin: rnd(SKIN), shirt: rnd(SHIRT), hair: rnd(HAIR), pants: rnd(['#3b4a5c', '#2c3e50', '#5d4037', '#455a64', '#1c1c1c']), ph: Math.random() * 9, face: 1 };
  if (r < .12 && h > 5 && h < 20) return Object.assign(base, { jog: true, sp: 2.4 + Math.random() * .6, top: 'tank', acc: 'none', pants: rnd(['#111827', '#1d4ed8', '#be185d']), shoes: rnd(['#f2f2f2', '#22d3ee', '#f97316']) });
  if (r < .21) return Object.assign(base, { dog: rnd(['#8b5a2b', '#f5deb3', '#2b2b2b', '#c08040', '#e5e7eb']), sp: .9 + Math.random() * .3 });
  if (r < .33 && h >= 15 && h < 18.5) return Object.assign(base, { kid: true, s: .72, bike: Math.random() < .55, sp: 1.6 + Math.random() * .6, acc: rnd(['backpack', 'none']) });
  return base; }
function newCar() { const roads = [], c0 = focus(); for (let i = 0; i < 120; i++) { const x = Math.floor(c0[0] + (Math.random() - .5) * 44), y = Math.floor(c0[1] + (Math.random() - .5) * 44); if (roadPass(x, y)) { roads.push([x, y]); break; } } const s = roads[0] || [0, 0]; const c = { x: s[0] + .5, y: s[1] + .5, path: [], sp: 2.6 + Math.random() * 1.6, color: rnd(CAR_COLORS), dir: 0 };
  if (!traffic.some((t) => t.bus) && !inside) Object.assign(c, { bus: true, sp: 2.1, v: { kind: 'van', body: '#f59e0b', side: '#f59e0b', text: 'ROUTE 9', scale: 1.35 } });
  else if (Math.random() < .14) Object.assign(c, { v: { kind: 'van', body: rnd(['#f5f5f5', '#78350f', '#1d4ed8']), side: '#f5f5f5', text: rnd(['PARCEL', 'FRESH', 'EXPRESS']) }, sp: 2.4 });
  return c; }
function newCitizen() { const s = nearTile(W.walk, 26); return { x: s[0] + .5, y: s[1] + .5, skin: rnd(SKIN), shirt: rnd(SHIRT), hair: rnd(HAIR), ph: Math.random() * 9, face: -1, les: rnd(W.D.lessons) }; }
function newObserve() { const did = W.did, ls = W.D.lessons.filter((l) => OBSERVE[l]); const les = rnd(ls.length ? ls : W.D.lessons); const o = rnd(OBSERVE[les] || [['Something looks out of place', 'door']]); const s = nearTile(W.walk, 30); return { x: s[0] + .5, y: s[1] + .5, les, text: o[0], kind: o[1], seen: false, t0: performance.now() }; void did; }

// ---------- dispatch ----------
function dispatchCall() {
  const fav = U().fav.filter((l) => W.D.lessons.indexOf(l) >= 0 && !L.mastery(S, l).done), les = fav.length && Math.random() < .3 ? fav[Math.floor(Math.random() * fav.length)] : L.weakest(S, W.did), list = CALLS[les] || [['Assist a citizen', 3, 'any', 'Citizen flagging down an officer.']]; let c = NG.remix(EVT.stormCall() || EP.wxCall() || rnd(list));
  const th = PREM.threadCall(); if (th) c = th.c;
  const pur = !th && pcar && !inside && !P.boat && c[1] !== 1 && Math.random() < .12 && S.cfg.pursuits !== false; if (!pur && !th) { const sc = CITY.seasonCall(); if (sc) c = sc; }
  if (pur) c = ['Vehicle fails to stop for a red light', 1, 'any', 'Driver ran the light on Main and won\'t pull over. Your call how this goes. Policy first.'];
  const lot = c[2] !== 'any' && W.lots.filter((l) => l.kind === c[2] || (c[2] === 'parking' && (l.kind === 'parking' || l.kind === 'lot'))).sort((a, b) => Math.hypot(a.door[0] - P.x, a.door[1] - P.y) - Math.hypot(b.door[0] - P.x, b.door[1] - P.y))[0];
  const pk = c[2] === 'parking' && !lot && W.parking.length ? (() => { const near = W.parking.filter((t) => Math.hypot(t[0] - P.x, t[1] - P.y) < 30); return rnd(near.length ? near : W.parking); })() : null;
  const spot = lot ? lot.door : pk || nearTile(W.walk, 28), where = lot ? (lot.name || (LANDMARKS[lot.kind] || {}).name || 'the ' + lot.kind) : pk ? 'the parking lot at ' + ((W.lots.find((l) => !l.sub && pk[0] > l.ox && pk[0] < l.ox + 8 && pk[1] > l.oy && pk[1] < l.oy + 9) || {}).name || 'a business') : 'block ' + (100 + spot[1] * 10) + ' ' + ['Main St', 'Bay St', 'Oak Ave', 'Pine St', 'Harbor Rd'][spot[0] % 5];
  call = { les, title: c[0], prio: c[1], text: c[3], x: spot[0] + .5, y: spot[1] + .5, where, kind: lot ? lot.kind : pk ? 'parking' : 'street', t0: clock, accepted: false, backup: false };
  if (th) { call.thread = th.t; th.t.at = 1e12; saveS(); }
  if (pur) { const r0 = nearest(Math.floor(call.x), Math.floor(call.y), roadPass); if (r0) { call.x = r0[0] + .5; call.y = r0[1] + .5; } call.pursuit = true; call.where = 'Main and ' + rnd(['Bay', 'Oak', 'Pine', 'Harbor']); }
  PREM.buzz(c[1] === 1 ? 'p1' : 'call'); setTimeout(() => { if (call && !call.accepted) PREM.callIntro(call); }, 650);
  if (c[1] === 1) { shake(5, .5); EP.zoomPunch(); if (S.sound) setTimeout(() => music.sting('p1'), 300); } radio('Dispatch', S.cs + ', ' + (c[1] === 1 ? 'priority one, ' : '') + c[0].toLowerCase() + ' at ' + where + '. ' + c[3]); chirp(); callCard();
}
function callCard() {
  const el = $('callCard'); if (!call) { el.hidden = true; return; }
  el.hidden = false; el.className = 'callCard p' + call.prio;
  el.innerHTML = '<div class="ccTop"><b>' + (call.prio === 1 ? 'PRIORITY 1' : call.prio === 2 ? 'PRIORITY 2' : 'ROUTINE') + '</b><span>' + esc(L.lessonName(call.les)) + '</span></div><div class="ccT">' + esc(call.title) + '</div><div class="ccW">' + esc(call.where) + '</div>' +
    '<div class="ccB"><button type="button" id="ccGo">' + (call.accepted ? 'Navigate' : 'Respond') + '</button><button type="button" class="ghost" id="ccBk">' + (call.backup ? 'Code 4 · cancel backup' : 'Request backup') + '</button></div>' + (call.backup ? '<div class="ccBkS">' + bkStatus() + '</div>' : '');
  $('ccGo').onclick = () => { if (inside) exitBuilding(); call.accepted = true; if (net) net.status('call'); radio(S.cs, 'En route.'); goTo(call.x, call.y, () => {}); callCard(); };
  $('ccBk').onclick = () => { if (call.backup) { bkCancel('Code 4. No further units needed.'); return; } const c0 = call; COOP.wantPicker((n) => { if (call !== c0) return; requestBackup(c0, n); radio(S.cs, 'Requesting ' + (n === 'any' ? 'backup' : COOP.wantLabel(n).replace(/^\S+ /, '') + ' unit') + ' at ' + c0.where + '.'); chirp(S.cs); callCard(); }); };
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
  const st = ST(), sp = P.boat ? 8 * (1 + gp('drive') / 100) : P.inCar ? (call && call.accepted ? 6.6 : 4.8) * U().ride.speed * (.88 + st.res * .06) * (1 + gp('drive') / 100) * LIFE.carMult() * RIDES[RIDE()].sp * (RIDE() === 'horse' && CITY ? CITY.animalMult() : 1) : (2.9 + st.res * .2) * (1 + gp('speed') / 100); const spB = sp * (clock < BUFF.speedTo ? (BUFF.speedMul || 1.25) : 1);
  // the cruiser has weight: speed builds over a second, bleeds off near the stop, and the nose dips when braking
  let spW = spB; if (P.inCar && !P.boat && S.cfg.motion !== false) { const left = P.path.length ? Math.hypot(P.path[P.path.length - 1][0] - P.x, P.path[P.path.length - 1][1] - P.y) + (P.path.length - 1) * .7 : 0, want = P.path.length ? spB * Math.min(1, Math.max(.32, left / 3.2)) : 0, v0 = P.vel || 0;
    P.vel = v0 + (want - v0) * (1 - Math.exp(-dt * (want > v0 ? 1.9 : 4.5))); spW = Math.max(.9, P.vel); P.pitch = (P.pitch || 0) * Math.exp(-dt * 5) + Math.max(-1, Math.min(1, (v0 - P.vel) / Math.max(dt, .001) / 9)) * (1 - Math.exp(-dt * 5)); } else { P.vel = 0; P.pitch = 0; }
  if (PUR && PUR.sus) spW *= PUR.mode * (Math.hypot(PUR.sus.x - P.x, PUR.sus.y - P.y) < 2.2 ? .7 : 1);
  if (P.path.length) { const done = stepAlong(P, dt, spW); if (done && P.onArrive) { const f = P.onArrive; P.onArrive = null; f(); } }
  else P.moving = false;
  if (P.inCar && pcar) { pcar.x = P.x; pcar.y = P.y; pcar.dir = P.dir; pcar.bar = !!(call && call.accepted); }
  if (P.boat && pboat) { pboat.x = P.x; pboat.y = P.y; pboat.dir = P.dir; }
  if (S.unit === 'k9' && !P.inCar && !P.boat) { const tx = P.x - (P.face > 0 ? .7 : -.7) * .7, ty = P.y + .55, d = Math.hypot(tx - K9.x, ty - K9.y); K9.moving = d > .08; if (d > 6) { K9.x = tx; K9.y = ty; } else { K9.x += (tx - K9.x) * Math.min(1, dt * 4); K9.y += (ty - K9.y) * Math.min(1, dt * 4); } K9.face = P.face; }
  if (!cam.free) { const [ix, iy] = iso(P.x, P.y), kf = 1 - Math.exp(-dt * 6); cam.x += (ix - cam.x) * kf; cam.y += (iy - 22 - cam.y) * kf; }
  { const f = focus(); peds.forEach((p, k) => { if (Math.hypot(p.x - f[0], p.y - f[1]) > 30) peds[k] = newPed(); }); traffic.forEach((c, k) => { if (Math.hypot(c.x - f[0], c.y - f[1]) > 34) traffic[k] = newCar(); }); }
  peds.forEach((p) => { if (p.wait > 0) { p.wait -= dt; p.moving = false; return; } if (!p.path.length) { const t = nearTile(W.walk, 24); const path = Math.hypot(t[0] - p.x, t[1] - p.y) < 16 ? astar(p.x, p.y, t[0], t[1], pedPass, true) : null; if (path) p.path = path; else p.wait = 1; return; } if (stepAlong(p, dt, p.sp)) p.wait = 1 + Math.random() * 4; });
  const lights = P.inCar && call && call.accepted && !inside; TRF = (TRF + 1) % 3; const fv = focus();
  traffic.forEach((c, ci) => { if (lights && !c.yieldT && Math.hypot(c.x - P.x, c.y - P.y) < 5.5) { c.yieldT = 2.6; c.yieldK = 0; } if (c.yieldT > 0) { c.yieldT -= dt; c.yieldK = Math.min(1, (c.yieldK || 0) + dt * 2.5); c.moving = false; if (c.yieldT <= 0) { c.yieldT = 0; c.yieldK = 0; } return; }
    if (Math.abs(c.x - fv[0]) + Math.abs(c.y - fv[1]) > 22 && ci % 3 !== TRF) return; const cdt = Math.abs(c.x - fv[0]) + Math.abs(c.y - fv[1]) > 22 ? dt * 3 : dt;
    if (c.stopped) return; if (c.stopT > 0) { c.stopT -= cdt; c.moving = false; return; } if (!c.path.length) { if (c.bus && !c.stopT0) { c.stopT = 3.5; c.stopT0 = 1; return; } c.stopT0 = 0; for (let k = 0; k < 6; k++) { const x = Math.floor(c.x + (Math.random() - .5) * 40), y = Math.floor(c.y + (Math.random() - .5) * 40); if (roadPass(x, y)) { const p = astar(c.x, c.y, x, y, roadPass, false); if (p && p.length > 3) { c.path = p; break; } } } return; } stepAlong(c, cdt, c.sp); });
  // arrive on a call
  if (call && call.pursuit && call.accepted && P.inCar && !PUR && !inside && Math.hypot(call.x - P.x, call.y - P.y) < 5) purStart(call);
  else if (call && !inside && Math.hypot(call.x - P.x, call.y - P.y) < 1.7 && !scene && !heldByLeave() && !RING && !PUR) ringOpen(call);
  if (PUR) purTick(dt);
  if (!call && !scene && !S.x6 && !S.offDuty && !RIDING) { nextCall -= dt; if (nextCall <= 0) dispatchCall(); }
  if (call && clock - call.t0 > callWait() + BUFF.wait) { radio('Dispatch', S.cs + ', disregard; another unit took that call.'); if (call.backup && net) net.backup(null); call = null; callCard(); nextCall = 20; if (net) { net.status('patrol'); net.backup(null); } }
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
// static things (props, doors, manholes) keep their screen position and their draw entry, so a frame allocates almost nothing for them
// districts you can travel to next are built ahead of time between frames, so a transfer loads instantly
const PREBUILT = new Map();
function prebuildSoon() { idleSoon((dl) => { if (!W || ATTRACT) return; const next = (S.unlocked || []).filter((d) => d !== W.did && !PREBUILT.has(d)).slice(0, 2 - PREBUILT.size); if (!next.length || dl.timeRemaining() < 20 && !dl.didTimeout) { if (next.length) setTimeout(prebuildSoon, 3000); return; } try { PREBUILT.set(next[0], buildDistrict(next[0])); } catch (e) {} if (next.length > 1) setTimeout(prebuildSoon, 2000); }); }
let RNOW = 0, RZ = 1, RES_CAP = 2, resWant = 0, resN = 0;
// sprite resolution follows the on-screen scale once the zoom has settled for a moment (never while pinching)
function spriteResTick(now) {
  const q = (S.cfg || {}).quality || 'high', lo = q === 'low' ? 1 : 1.25, t = Math.max(lo, Math.min(RES_CAP, Math.floor(zoomTarget() * dpr * 10 + .02) / 10));
  if (t === RES) { resN = 0; return; } if (t !== resWant) { resWant = t; resN = 0; } if (!now && ++resN < 24) return;
  setRes(t); resN = 0; SPR.forEach((x) => { if (x.canvas) x.stale = 1; });
}
const lightProps = () => W._lights || (W._lights = W.props.filter((p) => p.t === 'lamp' || p.t === 'canopy' || p.t === 'mast'));
const isoC = (o) => o._iso || (o._iso = iso(o.x, o.y));
function render(now) { RNOW = now; frameStart(); spriteResTick(false);
  const z = cam.z * dpr; RZ = z; ctx.setTransform(1, 0, 0, 1, 0, 0);
  // the camera lands on whole device pixels: crisper sprites, and the ground buffer copies 1:1 with no resampling
  const tx = Math.round(cv.width / 2 - cam.x * z), ty = Math.round(cv.height / 2 - cam.y * z);
  if (!GB || GB.z !== z || G.canvas || GB.G !== G) { ctx.fillStyle = '#0d1422'; ctx.fillRect(0, 0, cv.width, cv.height); }
  ctx.setTransform(z, 0, 0, z, tx, ty);
  groundDraw(z, tx, ty);
  const vx0 = cam.x - cv.width / 2 / z - 120, vx1 = cam.x + cv.width / 2 / z + 120, vy0 = cam.y - cv.height / 2 / z - 300, vy1 = cam.y + cv.height / 2 / z + 140;
  const vis = (sx, sy) => sx > vx0 && sx < vx1 && sy > vy0 && sy < vy1;
  const list = [];
  // buildings between you and the camera fade so you can always see yourself (and others near you)
  const [pix, piy] = iso(P.x, P.y), pd = P.x + P.y;
  let fresh = 0; RELIT = 0; const PF = (vx1 - vx0) * .5; SPR.forEach((s) => { if (!(s.bx + s.bw > vx0 && s.bx < vx1 && s.by + s.bh > vy0 && s.by < vy1)) { if (SPRW && (!s.canvas || s.stale) && s.bx + s.bw > vx0 - PF && s.bx < vx1 + PF && s.by + s.bh > vy0 - PF && s.by < vy1 + PF) sprAsk(s); return; } { if (!s.canvas) { if (fresh > 6) return; fresh++; } spriteOf(s);
    const b = s.b, near = !ATTRACT && s.depth > pd && P.x < b.x + b.w + 2.5 && P.y < b.y + b.d + 2.5 && P.x > b.x - 3 && P.y > b.y - 3,
      cover = !ATTRACT && s.depth > pd && pix > s.x + 6 && pix < s.x + s.canvas.lw - 6 && piy - 30 > s.y + 10 && piy - 6 < s.y + s.canvas.lh;
    const target = near || cover ? .3 : 1; s.al = s.al == null ? 1 : s.al + (target - s.al) * .18;
    if (!s._item || s._item.d !== s.depth) s._item = { d: s.depth, f: () => { if (s.al < .98) { ctx.globalAlpha = s.al; ctx.drawImage(s.canvas, Math.round(s.x * RZ) / RZ, Math.round(s.y * RZ) / RZ, s.canvas.lw, s.canvas.lh); ctx.globalAlpha = 1; } else ctx.drawImage(s.canvas, Math.round(s.x * RZ) / RZ, Math.round(s.y * RZ) / RZ, s.canvas.lw, s.canvas.lh); } }; list.push(s._item); } });
  W.props.forEach((p) => { const q = isoC(p), sx = q[0], sy = q[1]; if (!vis(sx, sy)) return; if (!p._item) p._item = { d: p.x + p.y, f: p.t === 'furn' ? () => { const fade = p.wall && !p.front && p.x > P.x - .3 && p.y > P.y - .3 && (p.x + p.y) - (P.x + P.y) < 4.5; if (fade) ctx.globalAlpha = .28; drawFurn(ctx, p, sx, sy, RNOW, W.wallCol); ctx.globalAlpha = 1; } : CITY.season === 'holiday' && p.t === 'lamp' ? () => { drawPropFast(ctx, p, sx, sy, RNOW, NIGHT); CITY.drawSeason(ctx, sx, sy, p, RNOW); } : () => drawPropFast(ctx, p, sx, sy, RNOW, NIGHT) }; list.push(p._item); });
  if (inside) { W.staff.forEach((st) => { list.push({ d: st.x + st.y, f: () => { staffDraw(ctx, st, now); if (st.npc) { const [sx, sy] = iso(st.x, st.y); if (Math.hypot(st.x - P.x, st.y - P.y) < 6) label(sx, sy - 48, st.npc.icon + ' ' + st.npc.name, '#fde68a'); if (!talkedNow[st.npc.id]) bubble(sx, sy - 66, '💬', '#fde68a', now); } } }); }); W.visitors.forEach((v) => { list.push({ d: v.x + v.y, f: () => visitorDraw(ctx, v, now) }); }); }
  else { doorMarks(list, vis, now); regsDraw(list, vis, now); }
  // locked gates get a barricade
  W.gates.forEach((g) => { const [sx, sy] = iso(g.x + .5, g.y + 1); if (!vis(sx, sy)) return; const open = S.unlocked.includes(g.to); list.push({ d: g.x + g.y + 1.5, f: () => gateArt(sx, sy, open, g, now) }); });
  peds.forEach((p) => { const [sx, sy] = iso(p.x, p.y); if (vis(sx, sy)) list.push({ d: p.x + p.y, f: () => {
    if (p.bike) { rideArt(ctx, sx, sy, p.dir || 0, 'bike', now, !!p.moving, (x, y, o) => person(ctx, x, y, Object.assign({ s: .72, shirt: p.shirt, skin: p.skin, hair: p.hair, pants: p.pants, ph: p.ph, glance: false, acc: p.acc }, o), now), false); return; }
    if (p.dog) { const side = p.face > 0 ? -1 : 1; dogFast(ctx, sx + side * 13, sy + 4, p.face || 1, !!p.moving, now); ctx.strokeStyle = 'rgba(30,30,30,.7)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(sx + side * 4, sy - 14); ctx.quadraticCurveTo(sx + side * 9, sy - 2, sx + side * 13, sy - 4); ctx.stroke(); }
    personFast(ctx, sx, sy, p, now, p._pk || (p._pk = 'p' + p.ph + (p.shirt || '') + (p.skin || '') + (p.top || '') + (p.kit ? JSON.stringify(p.kit) : ''))); } }); });
  citizens.forEach((p) => { const [sx, sy] = iso(p.x, p.y); if (vis(sx, sy)) list.push({ d: p.x + p.y, f: () => { person(ctx, sx, sy, p, now); bubble(sx, sy - 46, '?', '#f5b800', now); } }); });
  if (PUR && PUR.sus) { const c = PUR.sus, [sx, sy] = iso(c.x, c.y); if (vis(sx, sy)) list.push({ d: c.x + c.y, f: () => car(ctx, sx, sy, c.dir, c.color, false, now, NIGHT, 1) }); }
  traffic.forEach((c) => { const off = laneOff(c), [sx, sy] = iso(c.x + off[0], c.y + off[1]); if (vis(sx, sy)) list.push({ d: c.x + c.y, f: () => c.v ? vehicle(ctx, sx, sy, c.dir, c.v, now, NIGHT, false) : car(ctx, sx, sy, c.dir, c.color, false, now, NIGHT, 1) }); });
  if (!inside && !ATTRACT) { LIFE.drawKid(list, vis, now); PREM.drawSigns(list, vis, ctx); REW.draw(list, vis, ctx, now); CITY.draw(list, vis, ctx, now); }
  if (!inside && !ATTRACT) SIDE.forEach((q) => { if (!q.giverAt || !sideAvail(q)) return; const g = giverPos(q), t = TEMP[q.giver]; if (!g || !t) return; const [sx, sy] = iso(g.x, g.y); if (!vis(sx, sy)) return; const h = [...q.giver].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
    list.push({ d: g.x + g.y, f: () => { person(ctx, sx, sy, { ph: h % 997, shirt: ['#c0392b', '#2e86de', '#16a085', '#8e44ad', '#e67e22', '#2c3e50', '#d35400', '#27ae60'][h % 8], skin: ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#a0662f'][(h >> 3) % 6], hair: ['#2b1d14', '#5a3825', '#1a1a1a', '#b07b3c', '#9a9a9a'][(h >> 5) % 5], moving: false, face: -1, s: /age \d/.test(t.name) ? .82 : 1 }, now); label(sx, sy - 50, t.icon + ' ' + t.name, '#7dd3fc'); } }); });
  if (pcar && !P.inCar) { const [sx, sy] = iso(pcar.x, pcar.y); list.push({ d: pcar.x + pcar.y, f: () => { if (RIDE() !== 'car') rideArt(ctx, sx, sy, pcar.dir || 0, RIDE(), now, false, RIDE() === 'horse' ? () => {} : () => {}, false); else vehicle(ctx, sx, sy, pcar.dir, LIFE.ride(U().ride), now, NIGHT, false); if (Math.hypot(pcar.x - P.x, pcar.y - P.y) < 5) label(sx, sy - 40, RIDE() === 'car' ? 'Your ' + U().ride.label.toLowerCase() : 'Your ' + RIDES[RIDE()].name.toLowerCase(), '#f5b800'); } }); }
  if (pboat && !P.boat) { const [sx, sy] = iso(pboat.x, pboat.y); list.push({ d: pboat.x + pboat.y, f: () => { vehicle(ctx, sx, sy, pboat.dir, { kind: 'boat' }, now, NIGHT, false); if (Math.hypot(pboat.x - P.x, pboat.y - P.y) < 6) label(sx, sy - 30, 'Patrol boat', '#7dd3fc'); } }); }
  if (S.unit === 'k9' && !P.inCar && !P.boat) { const [sx, sy] = iso(K9.x, K9.y); list.push({ d: K9.x + K9.y, f: () => dogFast(ctx, sx, sy, K9.face, K9.moving, now) }); }
  Object.keys(others).forEach((k) => { const o = others[k]; if ((o.n == null ? -1 : o.n) !== (inside ? inside.idx : -1)) return; const [sx, sy] = iso(o.rx, o.ry); if (!vis(sx, sy)) return; list.push({ d: o.rx + o.ry, f: () => { const ou = unitOf(o.u); if (o.v) vehicle(ctx, sx, sy, o.d || 0, o.v === 2 ? { kind: 'boat' } : ou.ride, now, NIGHT, o.st === 'call'); else { const ck = (o.f || '') + '|' + o.u; if (o._ck !== ck) { const tk = String(o.f || 'ostd').split(','), of = (tk.find((t) => /^o(std|pt|unit)$/.test(t)) || 'ostd').slice(1), lk = looks(tk); o._ck = ck; o._kit = kitWith(kitOf(of, o.u), o.f ? lk : {}); o._fl = Object.assign({}, outfitLook(of), lk); o._po = { kit: o._kit, s: 1 }; }
      const po = o._po; po.moving = o.moving; po.face = o.face || 1; po.back = o.back; po.stride = o.stride; po.skin = o.skin; personFast(ctx, sx, sy, po, now, 'o' + ck + (o.skin || ''), OCOUNT > 20); if (o.u === 'k9') dogFast(ctx, sx - 14, sy + 6, 1, o.moving, now); if (cam.z > .6 || DRAWN_OTHERS < 25) flair(o._fl, sx, sy, now, 1); } const mate = S.squad && o.g === S.squad.code; if (mate) { ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(sx, sy, 15, 7.5, 0, 0, Math.PI * 2); ctx.stroke(); } if (mate || o.nearRank < (innerWidth < 700 ? 10 : 18)) label(sx, sy - (o.v ? 40 : 50), (o.k ? '[' + o.k + '] ' : '') + ou.icon + ' ' + o.c + (o.sh && o.sh !== S.shift ? ' · ' + ({ day: 'Day', mid: 'Mid', night: 'Night' }[o.sh] || '') : ''), '#9cc3ff'); if (!(mate || o.nearRank < 8)) { /* bubbles only for the closest few */ } else if (o.say && performance.now() - o.sayAt < 7000) speech(sx, sy - (o.v ? 52 : 68), o.say.length > 34 ? o.say.slice(0, 32) + '…' : o.say); else if (o.q && now - o.qAt < 6000) speech(sx, sy - (o.v ? 52 : 68), QUICK[o.q.k] || ''); } }); });
  if (!ATTRACT && !RIDING) { const [sx, sy] = iso(P.x, P.y); list.push({ d: P.x + P.y, f: () => { if (P.boat) vehicle(ctx, sx, sy, P.dir, { kind: 'boat' }, now, NIGHT, call && call.accepted); else if (P.inCar && RIDE() !== 'car') rideArt(ctx, sx, sy, P.dir || 0, RIDE(), now, !!(P.path && P.path.length), riderFn(now), (call && call.accepted) || STOPLIGHTS); else if (P.inCar) { FEEL.wetLights(ctx, sx, sy, now); const rl = FEEL.rollIn(ctx, sx, sy), dip = P.pitch || 0; if (dip) { ctx.save(); const f = [[1, .5], [-1, .5], [-1, -.5], [1, -.5]][P.dir & 3]; ctx.translate(sx, sy); ctx.rotate(dip * .035 * (f[0] > 0 ? 1 : -1)); ctx.translate(-sx, -sy + Math.abs(dip) * .8); } vehicle(ctx, sx, sy, P.dir, LIFE.ride(U().ride), now, NIGHT, (call && call.accepted) || STOPLIGHTS); if (dip) ctx.restore(); if (rl) ctx.restore(); } else person(ctx, sx, sy, { kit: kitWith(myKit(), myLooks()), moving: P.moving, face: P.face, back: P.back, stride: P.stride, glance: false, skin: S.skin || '#c68e63', s: 1.08 }, now); } }); }
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
    const toS = (ix, iy) => [(ix * z + tx) * s, (iy * z + ty) * s];
    const hole = (ix, iy, r, k) => { const [x, y] = toS(ix, iy), rr = r * z * s; if (x < -rr || y < -rr || x > lc.width + rr || y > lc.height + rr) return; lx.globalAlpha = k; lx.drawImage(radSprite('#000'), x - rr, y - rr, rr * 2, rr * 2); lx.globalAlpha = 1; };
    lightProps().forEach((p) => { const q = isoC(p), ix = q[0], iy = q[1]; if (p.t === 'lamp') { if (p.on) hole(ix + 10, iy - 6, 92, .85); } else if (p.t === 'canopy') hole(ix, iy, 110, .9); else if (p.t === 'mast') hole(ix, iy - 200, 16, .9); });
    SPR.forEach((sp) => { if (sp.canvas) sp.lights.forEach((q) => hole(q[0], q[1], 34, .55)); }); trimSprites();
    traffic.forEach((c) => { const off = laneOff(c), [ix, iy] = iso(c.x + off[0], c.y + off[1]), f = [[1, .5], [-1, .5], [-1, -.5], [1, -.5]][c.dir]; hole(ix + f[0] * 34, iy + f[1] * 34, 56, .7); });
    { const [ix, iy] = iso(P.x, P.y); hole(ix, iy - 10, (P.inCar || P.boat ? 120 : 96) * BUFF.light * (1 + gp('light') / 100), .8); }
    Object.keys(others).forEach((k) => { const o = others[k]; if (o.nearRank > 24) return; const [ix, iy] = iso(o.rx, o.ry); hole(ix, iy - 10, 70, .6); });
    const marks = markerPoints(); marks.forEach((m) => hole(m[0], m[1], 50, .7));
    FX.events.forEach((e) => { const [ix, iy] = iso(e.x, e.y); hole(ix, iy - 10, 70, .7); });
    ctx.drawImage(lc, 0, 0, cv.width, cv.height);
    // additive glows: soft light, so they gather on a half-resolution layer that is added to the frame in one pass
    ctx.globalCompositeOperation = 'lighter';
    if (glc.width !== lc.width || glc.height !== lc.height) { glc.width = lc.width; glc.height = lc.height; }
    gx.setTransform(1, 0, 0, 1, 0, 0); gx.globalCompositeOperation = 'source-over'; gx.clearRect(0, 0, glc.width, glc.height); gx.globalCompositeOperation = 'lighter'; let glowN = 0;
    const glow = (ix, iy, r, col) => { const x = (ix * z + tx) * s, y = (iy * z + ty) * s, rr = r * z * s; if (x < -rr || y < -rr || x > glc.width + rr || y > glc.height + rr) return; glowN++; gx.drawImage(radSprite(col), x - rr, y - rr, rr * 2, rr * 2); };
    lightProps().forEach((p) => { if (p.t === 'lamp' && p.on) { const q = isoC(p), ix = q[0], iy = q[1]; glow(ix + 10, iy - 37, 18, 'rgba(255,220,150,.55)'); glow(ix + 10, iy - 37, 46, 'rgba(255,200,120,.12)'); glow(ix + 10, iy - 2, 40, 'rgba(255,190,110,.10)'); } });
    if (FX.rain && !inside) { const glowE = (ix, iy, rx, ry, col) => { const x = (ix * z + tx) * s, y = (iy * z + ty) * s, w = rx * z * s, h = ry * z * s; if (x < -w || y < -h || x > glc.width + w || y > glc.height + h) return; glowN++; gx.drawImage(radSprite(col), x - w, y - h * .2, w * 2, h * 2); };
      lightProps().forEach((p) => { if (p.t === 'lamp' && p.on) { const q = isoC(p); glowE(q[0] + 10, q[1] + 4, 9, 26, 'rgba(255,205,130,.22)'); } }); }
    // lit windows and signs spill a little warm light; cars show headlights and taillights
    SPR.forEach((sp) => { if (sp.canvas) sp.lights.forEach((q, k) => { if (k % 2 === 0) glow(q[0], q[1], 16, 'rgba(255,214,140,.10)'); }); });
    if (dk.a > .3) { const beam = (sx, sy, dir) => { const f = [[1, .5], [-1, .5], [-1, -.5], [1, -.5]][dir & 3], x0 = sx + f[0] * 14, y0 = sy + f[1] * 14 - 4, x1 = sx + f[0] * 120, y1 = sy + f[1] * 120, nx = -f[1] * 34, ny = f[0] * 34, X = (v) => cv.width / 2 + (v - cam.x) * z, Yy = (v) => cv.height / 2 + (v - cam.y) * z; const bg = ctx.createLinearGradient(X(x0), Yy(y0), X(x1), Yy(y1)); bg.addColorStop(0, 'rgba(255,245,215,.22)'); bg.addColorStop(1, 'rgba(255,245,215,0)'); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(X(x0 - nx * .15), Yy(y0 - ny * .15)); ctx.lineTo(X(x1 - nx), Yy(y1 - ny)); ctx.lineTo(X(x1 + nx), Yy(y1 + ny)); ctx.lineTo(X(x0 + nx * .15), Yy(y0 + ny * .15)); ctx.closePath(); ctx.fill(); };
      traffic.forEach((c) => { const off = laneOff(c), [ix, iy] = iso(c.x + off[0], c.y + off[1]); beam(ix, iy, c.dir); }); if (P.inCar && !inside) { const [ix, iy] = iso(P.x, P.y); beam(ix, iy, P.dir || 0); } }
    if (dk.a > .3) traffic.forEach((c) => { const off = laneOff(c), [ix, iy] = iso(c.x + off[0], c.y + off[1]), f = [[1, .5], [-1, .5], [-1, -.5], [1, -.5]][c.dir]; glow(ix + f[0] * 22, iy + f[1] * 22 - 6, 26, 'rgba(255,245,210,.20)'); glow(ix - f[0] * 14, iy - f[1] * 14 - 6, 9, 'rgba(255,40,30,.45)'); });
    ambienceGlow(glow, now);
    const bar = (x, y, on) => { const ph = Math.floor(now / 180) % 2; glow(x, y - 22, 46, on ? (ph ? 'rgba(255,40,40,.45)' : 'rgba(40,90,255,.45)') : 'rgba(0,0,0,0)'); };
    if ((P.inCar || P.boat) && call && call.accepted) { const [ix, iy] = iso(P.x, P.y); bar(ix, iy, true); }
    Object.keys(others).forEach((k) => { const o = others[k]; if (o.v && o.st === 'call') { const [ix, iy] = iso(o.rx, o.ry); bar(ix, iy, true); } });
    if (glowN) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(glc, 0, 0, cv.width, cv.height); }
    ctx.globalCompositeOperation = 'source-over';
  }
  grade(); rainDraw(); EVT.drawFog(); if (!ATTRACT) { EP.skyDraw(ctx, cv, now); EP.fxDraw(ctx, cv); }
  // markers drawn above the lighting so they stay readable
  ctx.setTransform(z, 0, 0, z, cv.width / 2 - cam.x * z, cv.height / 2 - cam.y * z);
  ringPlace(z, tx, ty);
  if (!ATTRACT) { guideDraw(now, z); if (!inside) { EVT.draw(now); LIFE.draw(now); OFF.draw(now); ACAD.draw(now); POL.drawBarks(ctx); EP.clueDraw(now); regs.forEach((r) => { if (OFF.arcReady(r.n.id)) { const [sx, sy] = iso(r.x, r.y); bubble(sx, sy - 92, '💛', '#f472b6', now); } }); } storyMarker(now); floatsDraw(now); pingsDraw(now); if (SELF_SAY.text && performance.now() - SELF_SAY.at < 6000) { const [sx, sy] = iso(P.x, P.y); speech(sx, sy - (P.inCar ? 52 : 70), SELF_SAY.text.length > 34 ? SELF_SAY.text.slice(0, 32) + '…' : SELF_SAY.text); } }
  if (call) { const [sx, sy] = iso(call.x, call.y); ring(sx, sy, call.prio === 1 ? '#ff4d4d' : '#f5b800', now); bubble(sx, sy - 40, '📻', call.prio === 1 ? '#ff4d4d' : '#f5b800', now); label(sx, sy - 66, call.title, '#ffffff'); }
  infos.forEach((i) => { const [sx, sy] = iso(i.x, i.y); bubble(sx, sy - 30, '📖', i.cool > 0 ? '#6b7280' : '#8b5cf6', now); });
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
  dialogue: (...a) => dialogue(...a), sayAs: (...a) => sayAs(...a), award: (...a) => award(...a), stat: (...a) => stat(...a), ord: (...a) => ord(...a), toast: (m) => toast(m), banner: (...a) => banner(...a), beep: (...a) => beep(...a), chirp: (w) => chirp(w), good: () => good(), bad: () => bad(), radio: (...a) => radio(...a),
  saveS: () => saveS(), hud: () => hud(), openModal: (h) => openModal(h), closeModal: () => closeModal(), $: (id) => $(id), esc: (x) => esc(x), iso: (x, y) => iso(x, y), get ctx() { return ctx; }, bubble: (...a) => bubble(...a), label: (...a) => label(...a), person: (...a) => person(...a),
  rideKind: () => RIDE(), motorPool: () => motorPool(), goTo: (...a) => goTo(...a), doorSpot: (l) => doorSpot(l), whereAt: (x, y) => { const n = nearestLotTo(x, y); return n ? 'near ' + n : 'on patrol'; }, lights: (on) => { STOPLIGHTS = on; } });
// off the clock: off-duty mode, leisure, ride-alongs, homes, morale and friendship stories (see offduty.js)
const OFF = installOffDuty({ mood: (m) => { DLGMOOD = m; }, S, L, get W() { return W; }, get P() { return P; }, get inside() { return inside; }, call: () => call, paused: () => paused || !!scene,
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
let POLMOOD = null, DLGMOOD = null, COVER = null;
const PREM = installPremium({ S, esc: (x) => esc(x), inside: () => !!inside, busy: () => stageBusy(), clockStr: () => { const h = hourNow(); return String(Math.floor(h)).padStart(2, '0') + String(Math.floor(h % 1 * 60)).padStart(2, '0') + ' hrs'; }, setPaused: (v) => { paused = v; }, cineFocus: (x, y, z) => cineFocus(x, y, z), cineRelease: () => cineRelease(),
  saveS: () => saveS(), sting: (k) => music.sting(k), W: () => W, P, callTitles: () => Object.values(CALLS).flat().map((c) => c[0]), hourAt: (t) => (shiftOf().start + t / 60) % 24, beep: (...a) => beep(...a), radio: (w, m) => radio(w, m), clock: () => clock, iso: (x, y) => iso(x, y), hiCanvas: (...a) => hiCanvas(...a), toast: (m) => toast(m), shiftKey: () => new Date().toDateString() + S.shift });
let RIDING = false;
CITY = installCity({ S, esc: (x) => esc(x), W: () => W, P, N, inside: () => !!inside, busy: () => stageBusy() || !!scene || !!RING || RIDING || !!PUR, net: () => net, weekKey: weekKeyFn, radio: (w, m) => radio(w, m), buzz: (k) => PREM.buzz(k), openModal: (h) => openModal(h), closeModal: () => closeModal(), toast: (m) => toast(m), banner: (...a) => banner(...a),
  sayAs: (...a) => sayAs(...a), dialogue: (...a) => dialogue(...a), award: (...a) => award(...a), stat: (...a) => stat(...a), queueLoot: (...a) => queueLoot(...a), saveS: () => saveS(), dname: (d) => (DISTRICTS[d] || {}).name || 'the district', hour: () => hourNow(), iso: (x, y) => iso(x, y), ring: (...a) => ring(...a), bubble: (...a) => bubble(...a), ride: () => RIDE(),
  rankName: () => L.rankOf(S.xp).name, trackName: (k) => REW.trackName(k), trackIds: () => REW.trackIds(), ptMenu: () => ACAD.ptMenu() });
REW = installRewards({ S, share: () => CITY.shareCard(), esc: (x) => esc(x), W: () => W, P, N, inside: () => !!inside, busy: () => stageBusy() || !!scene || !!RING || RIDING, banner: (...a) => banner(...a), award: (...a) => award(...a), queueLoot: (...a) => queueLoot(...a), stat: (...a) => stat(...a), saveS: () => saveS(), toast: (m) => toast(m),
  openModal: (h) => openModal(h), closeModal: () => closeModal(), setPaused: (v) => { paused = v; }, cineFocus: (x, y, z) => cineFocus(x, y, z), cineRelease: () => cineRelease(), buzz: (k) => PREM.buzz(k), sting: (k) => { if (S.sound) music.sting(k); }, reveal: (x, y, r) => revealAround(x, y, r), dname: () => W.D.name, LORE, iso: (x, y) => iso(x, y), ring: (...a) => ring(...a), bubble: (...a) => bubble(...a), sparkle: (...a) => sparkle(...a), NOTES, NOTE_SETS, MARKS, qGive: (id) => qGive(id), sideQ: (id) => sideQ(id), sideOpen: (q) => sideOpen(q), sideClosed: (q) => sideClosed(q), nm: (id) => giverName(id), dialogueOpen: () => !!scene || storyBusy, hiCanvas: (...a) => hiCanvas(...a), S });
const COOP = installCoop({ S, esc: (x) => esc(x), net: () => net, weekKey: () => { const d = new Date(), j = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), w = Math.ceil(((d - j) / 864e5 + j.getUTCDay() + 1) / 7); return d.getUTCFullYear() + 'w' + String(w).padStart(2, '0'); },
  W: () => W, stat: (...a) => stat(...a), toast: (m) => toast(m), banner: (...a) => banner(...a), buzz: (k) => PREM.buzz(k), saveS: () => saveS(), L, dialogue: (...a) => dialogue(...a), sayAs: (...a) => sayAs(...a), award: (...a) => award(...a), busy: () => stageBusy() || !!scene || !!RING,
  setRiding: (v) => { RIDING = v; P.path = []; if (v) { if (P.inCar) exitCar(); call = null; callCard(); } if (net) net.status(v ? 'busy' : 'patrol'); }, follow: (x, y) => { const k = .25; P.x += (x + .45 - P.x) * k; P.y += (y + .35 - P.y) * k; P.path = []; },
  openModal: (h) => openModal(h), closeModal: () => closeModal(), callTitles: () => Object.values(CALLS).flat(), dname: (d) => DISTRICTS[d] ? DISTRICTS[d].name : 'another district', queueLoot: (...a) => queueLoot(...a), now: () => N0(), radio: (w, m) => radio(w, m), beep: (...a) => beep(...a),
  squadMembers: () => Object.keys((COMMS.squad || {}).m || {}).map((u) => Object.assign({ uid: u }, COMMS.squad.m[u])), squadCall: (a, done) => squadCall(a, done),
  anyEnRoute: () => Object.keys(others).some((k) => others[k].a === myUid + '|go' || others[k].a === myUid), aidTravel: (d, then) => { if (inside) exitBuilding(); travel(d, then); }, bkGo: (uid, x, y, c, l) => { BKGO = { uid, x, y, c, l, t: performance.now() }; if (net) net.assist(uid + '|go'); goTo(x, y, () => {}); },
  quick: (k, t) => { if (net) net.quick(k); radio(S.cs, t); chirp(S.cs); SELF_SAY.text = t; SELF_SAY.at = performance.now(); stat('ptt'); } });
// a squad leader's assignment becomes a normal call, already accepted and routed
function squadCall(a, done) { const parts = a.l.split(' · '); call = { les: L.weakest(S, W.did), title: parts[0], prio: a.p || 2, text: 'Assigned by your squad leader.', x: a.x, y: a.y, where: parts[1] || 'the assigned address', kind: 'street', t0: clock, accepted: true, backup: false, sq: done }; if (net) net.status('call'); radio(S.cs, 'Copy the assignment. En route to ' + call.where + '.'); callCard(); goTo(call.x, call.y, () => {}); }
// street gossip: a hook for a story waiting in this district, or a remark about one you finished
const condOK = (w) => w.slice(0, 5) === 'side:' ? sideClosed(sideQ(w.slice(5)) || {}) : w.slice(0, 5) === 'main:' ? (S.story[+w.slice(5)] || 0) >= CHAPTERS[+w.slice(5)].steps.length : !!S.flags[w.slice(5)];
function gossipLine() { if (!W || inside) return null; const hooks = SIDE.filter((q) => HOOKS[q.id] && sideAvail(q)).map((q) => HOOKS[q.id]), deeds = DEEDS.filter(([w, d]) => (d < 0 || d === W.did) && condOK(w)).map((x) => x[2]);
  if (hooks.length && (!deeds.length || Math.random() < .6)) return rnd(hooks); return deeds.length ? rnd(deeds) : null; }
const POL = installPolish({ S, gossip: () => gossipLine(), storyNpc: () => { const st = chStep(); return st && st.npc; }, sessLines: () => PREM.sessLines(), NPCS, CHAPTERS, LANDMARKS, esc: (x) => esc(x), $: (id) => $(id), fe: () => fe(), openModal: (h) => openModal(h), closeModal: () => closeModal(), stat: (...a) => stat(...a), saveS: () => saveS(), award: (...a) => award(...a), banner: (...a) => banner(...a), toast: (m) => toast(m), beep: (...a) => beep(...a),
  sting: (k) => { if (S.sound) music.sting(k); }, setMood: (m) => { POLMOOD = m; }, get W() { return W; }, get P() { return P; }, get regs() { return regs; }, get peds() { return peds; }, get inside() { return inside; }, get LORE() { return LORE; },
  cine: () => document.body.classList.contains('cine'), paused: () => paused || !!scene, pause: (on) => { paused = on; }, hour: () => hourNow(), homeOf: (n) => NPC_AT[n.id] || n.home, moveReg: (r, lot) => moveReg(r, lot), faceTo: (r) => { r.face = P.x < r.x ? -1 : 1; },
  iso: (x, y) => iso(x, y), duck: (on) => { if (S.sound) music.volume(S.cfg.music * (on ? .35 : 1)); }, move: (dx, dy) => goTo(P.x + dx * 1.6, P.y + dy * 1.6), use: () => { if (!paused && !scene) tapAtWorld(P.x, P.y); }, journal: () => journal(),
  dname: (d) => DISTRICTS[d].name, activeQ: () => activeQ(), loreDist: (n) => LORE_DIST[n], sideQ: (id) => sideQ(id), placeIcon: (n) => { for (const D of DISTRICTS) { const f = (x) => Array.isArray(x) && x[1] === n ? x : x && x.strip ? x.strip.map(f).find(Boolean) : null; const hit = D.lots.map(f).find(Boolean); if (hit) return (LANDMARKS[hit[0]] || {}).icon || '📍'; } return '📍'; },
  loreHint: (w) => loreHint(w), wxBark: () => EP.wxBark(), ready: () => S.seenCine && !EP.busy && !looting && !loreBusy && !storyBusy && !ATTRACT && $('start').hidden && $('modal').hidden && fe().hidden && $('dlg').hidden && !document.querySelector('.lorePop'), hud: () => hud(), refreshLook: () => { refreshGear(); hud(); } });
const loreHint = (w) => w === 'start' ? '' : /^d\d$/.test(w) ? 'Opens with ' + DISTRICTS[+w[1]].name + '.' : w.slice(0, 2) === 'ch' ? 'Keep going with the main story.' : w.slice(0, 5) === 'side:' ? 'Close a side case in ' + ((sideQ(w.slice(5)) && DISTRICTS[sideQ(w.slice(5)).d].name) || 'the city') + '.' : w.slice(0, 6) === 'visit:' ? 'Explore ' + (LORE_DIST[w.slice(6)] || 'the city') + '.' : w.slice(0, 5) === 'note:' ? 'Something written somewhere in ' + DISTRICTS[+w.slice(5)].name + '. Look for a small glint by a doorway.' : w.slice(0, 7) === 'friend:' ? (() => { const n = NPCS.find((x) => x.id === w.slice(7)); return n ? 'Become friends with ' + (S.npc && S.npc[n.id] ? n.name : 'someone') + ' in ' + DISTRICTS[n.d].name + '.' : ''; })() : '';
const EP = installEpic({ S, comfort: () => PREM, NPCS, esc: (x) => esc(x), $: (id) => $(id), fe: () => fe(), openModal: (h) => openModal(h), closeModal: () => closeModal(), stat: (...a) => stat(...a), st: (k) => st(k), statOnce: (k) => { if (!st(k)) stat(k); }, saveS: () => saveS(), award: (...a) => award(...a), banner: (...a) => banner(...a), toast: (m) => toast(m), beep: (...a) => beep(...a),
  sting: (k) => { if (S.sound) music.sting(k); }, setMood: (m) => { POLMOOD = m; }, get W() { return W; }, get P() { return P; }, get inside() { return inside; }, get LORE() { return LORE; }, get cam() { return cam; }, get studio() { return STUDIO.name; },
  cine: () => document.body.classList.contains('cine'), pause: (on) => { paused = on; }, hour: () => hourNow(), iso: (x, y) => iso(x, y), dname: (d) => DISTRICTS[d].name, loreDist: (n) => LORE_DIST[n], loreAt: (n) => { const e = LORE.find((x) => x.when === 'visit:' + n); return e ? e.id : null; },
  radio: (w, m) => radio(w, m), chirp: (w) => chirp(w), wx: () => Object.assign({ label: '' }, EVT.WX || {}, { rain: FX.rain, storm: FX.storm, wind: FX.wind || 0, cold: FX.cold, fog: FX.fog || 0 }), sparkle: (x, y, now, c) => sparkle(x, y, now, c),
  dialogue: (l, d, o) => dialogue(l, d, o), week: () => ACAD.week(), weekKey: () => EVT.weekKey ? EVT.weekKey() : '', net: () => net, hasSkill: (id) => hasSk(id), ready: () => !ATTRACT && !looting && !loreBusy && !storyBusy && $('start').hidden && $('modal').hidden && fe().hidden && $('dlg').hidden && !document.querySelector('.lorePop, .tCard') && !paused && !scene });
const ON = installOnboard({ S, CHAPTERS, esc: (x) => esc(x), get P() { return P; }, get W() { return W; }, storyBusy: () => storyBusy, dlgOpen: () => !$('dlg').hidden, call: () => call, forceCall: () => { if (!call) nextCall = Math.min(nextCall, 2); },
  ready: () => !ATTRACT && !looting && !loreBusy && !storyBusy && !scene && !paused && $('start').hidden && $('modal').hidden && fe().hidden && $('dlg').hidden && !EP.busy && !!S.seenCine && !document.querySelector('.lorePop, .tCard'),
  banner: (...a) => banner(...a), award: (...a) => award(...a), beep: (...a) => beep(...a), saveS: () => saveS(), dname: (d) => DISTRICTS[d].name,
  toScreen: (x, y) => { const [ix, iy] = iso(x, y); return [(ix - cam.x) * cam.z + cw / 2, (iy - 20 - cam.y) * cam.z + ch / 2]; } });
const FEEL = installFeel({ S, $: (id) => $(id), audio: () => audio(), beep: (...a) => beep(...a), get P() { return P; }, get W() { return W; }, get regs() { return regs; }, get inside() { return inside; },
  paused: () => paused || !!scene, cine: () => document.body.classList.contains('cine'), wet: () => !!(FX.rain || FX.storm), lightsOn: () => !!(call && call.accepted) });
const SAFE = installSafe({ S, esc: (x) => esc(x), $: (id) => $(id), fe: () => fe(), toast: (m) => toast(m), saveS: () => saveS(), stat: (...a) => stat(...a), net: () => net, get W() { return W; }, get P() { return P; }, get inside() { return inside; },
  get version() { return STUDIO.ver; }, activeTitle: () => { const A = W && activeQ(); return A ? A.title + ': ' + (A.step && A.step.goal) : null; }, reconnect: () => {} });
const NG = installNGPlus({ S, esc: (x) => esc(x), $: (id) => $(id), fe: () => fe(), banner: (...a) => banner(...a), stat: (...a) => stat(...a), saveS: () => saveS(), snapshot: () => SAFE.snapshot(true), reload: () => location.reload() });
if (S.fto) L.setHard(true);
function moveReg(r, lot) { W.blocked.delete(Math.floor(r.y) * N + Math.floor(r.x)); regs = regs.filter((x) => x !== r); putOutside(r.n, lot); }
function tapAtWorld(x, y) { const [ix, iy] = iso(x, y), rc = cv.getBoundingClientRect(); tap(rc.left + rc.width / 2 + (ix - cam.x) * cam.z, rc.top + rc.height / 2 + (iy - 20 - cam.y) * cam.z); }
// the Rec Room: multiplayer mini games (see minigames.js)
const MG = createMiniGames({ get net() { return net; }, now: () => N0(), esc: (x) => esc(x), S, L, PHON: PHONETIC, beep: (...a) => { if (S.sound) beep(...a); }, toast: (m) => toast(m), saveS: () => saveS(),
  award: (n, why) => award(n, why), stat: (k) => stat(k), cs: () => S.cs, icon: () => U().icon, did: () => W.did, dname: () => W.D.name, lessons: () => W.D.lessons,
  pause: (on) => { paused = on; if (on) { P.path = []; } if (S.sound) music.start(on ? 'title' : moodNow()); },
  get squadPost() { return net && S.squad ? (m) => { try { net.post(net.sqChatPath(S.squad.code), { c: S.cs, m }); } catch (e) {} } : null; } });
// cars keep right; a car yielding to lights and sirens eases further over to the curb
function laneOff(c) { const k = .22 + (c.yieldK || 0) * .2; return [[0, k], [-k, 0], [0, -k], [k, 0]][c.dir] || [0, 0]; }
let TRF = 0;
function markerPoints() { const m = []; if (call) m.push(iso(call.x, call.y)); infos.forEach((i) => m.push(iso(i.x, i.y))); observes.forEach((o) => o.seen && m.push(iso(o.x, o.y))); citizens.forEach((c) => m.push(iso(c.x, c.y))); return m; }
function ring(sx, sy, col, now) { const k = (now % 1400) / 1400; ctx.strokeStyle = col; ctx.globalAlpha = 1 - k; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(sx, sy, 12 + k * 26, (12 + k * 26) / 2, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
function bubble(sx, sy, txt, col, now) { const b = Math.sin(now / 260) * 3; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(sx, sy + b, 11, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx - 5, sy + b + 8); ctx.lineTo(sx + 5, sy + b + 8); ctx.lineTo(sx, sy + b + 15); ctx.fill(); ctx.fillStyle = col === '#f5b800' ? '#0b1630' : '#fff'; ctx.font = '800 13px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, sx, sy + b + 1); }
// name tags are rendered once per text and colour, then stamped; dozens of players cost one drawImage each
const LABELC = new Map();
function label(sx, sy, txt, col) {
  const k = txt + '|' + col + '|' + RES; let c = LABELC.get(k);
  if (!c) { if (LABELC.size > 300) LABELC.clear(); ctx.font = '700 11px system-ui,sans-serif'; const w = Math.ceil(ctx.measureText(txt).width + 12), [cv, g] = hiCanvas(w + 2, 20, Math.max(1.5, RES));
    g.font = '700 11px system-ui,sans-serif'; g.fillStyle = 'rgba(8,14,28,.82)'; g.beginPath(); g.roundRect(1, 1, w, 18, 9); g.fill(); g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 1 + w / 2, 10); c = cv; LABELC.set(k, c); }
  ctx.drawImage(c, sx - c.lw / 2, sy - 10, c.lw, c.lh);
}
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
  infos.forEach((i) => dot(i.x, i.y, '#8b5cf6', 2.5)); if (!inside) SIDE.forEach((q) => { if (!sideAvail(q)) return; const r = giverPos(q); if (r) dot(r.x, r.y, '#38bdf8', 3.4); }); citizens.forEach((c) => dot(c.x, c.y, '#f5b800', 2.2));
  if (!inside) { if (!fogC || fogC.did !== W.did) { fogC = document.createElement('canvas'); fogC.width = m.width; fogC.height = m.height; fogC.did = W.did; const fg = fogC.getContext('2d'); fg.fillStyle = 'rgba(6,10,20,.84)'; fg.fillRect(0, 0, m.width, m.height); const str = S.explored[exKey()] || ''; for (let i = 0; i < N * N; i++) if (str[i] === '1') fg.clearRect((i % N) * s, Math.floor(i / N) * s, s + .6, s + .6); } g.drawImage(fogC, 0, 0); W.secrets.forEach((x) => { if (S.found[x.id]) dot(x.x, x.y, '#a78bfa', 3); }); REW.miniDots(dot); regs.forEach((r) => { if ((S.npc || {})[r.n.id]) dot(r.x, r.y, '#fde68a', 2.6); }); }
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
  exFlush(true); let str = S.explored[exKey()] || ''; if (str.length !== N * N) str = '0'.repeat(N * N); S.explored[exKey()] = str; EXA = new Uint8Array(N * N); EXK = exKey();
  exTotal = 0; exCount = 0; for (let i = 0; i < N * N; i++) { if (str.charCodeAt(i) === 49) EXA[i] = 1; const v = W.g[i]; if (v !== T.WATER) { exTotal++; if (EXA[i]) exCount++; } }
  fogC = null;
}
// the explored map lives in a byte array; it is written back to the save as text at most every few seconds
function exFlush(force) { if (!EXA || !exDirty || (!force && performance.now() - exT < 3000)) return; exT = performance.now(); exDirty = 0; const parts = []; for (let i = 0; i < EXA.length; i += 4096) parts.push(String.fromCharCode.apply(null, Array.from(EXA.subarray(i, i + 4096), (v) => (v ? 49 : 48)))); S.explored[EXK] = parts.join(''); }
function revealAround(cx, cy, r) {
  if (inside || !EXA || EXK !== exKey()) return;
  let changed = false; const a = EXA;
  for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) { if (x < 0 || y < 0 || x >= N || y >= N) continue; const i = y * N + x; if (a[i] || Math.hypot(x + .5 - cx, y + .5 - cy) > r) continue; a[i] = 1; changed = true; if (W.g[i] !== T.WATER) exCount++; if (fogC) fogC.getContext('2d').clearRect(x * fogC.width / N, y * fogC.height / N, fogC.width / N + .6, fogC.height / N + .6); }
  if (!changed) { exFlush(false); return; } exDirty = 1; exFlush(false);
  const pct = Math.floor(exCount / exTotal * 100), done = S.mile[exKey()] || 0; $('hExp').textContent = 'Explored ' + pct + '%';
  const next = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].find((m) => m > done && pct >= m);
  if (next) { S.mile[exKey()] = next; saveS(); banner('🧭', 'Explorer · ' + next + '% of ' + W.D.name, next === 100 ? 'Every street walked. The district knows your name.' : 'Keep wandering. There is more out there.'); queueLoot('Exploration reward: ' + next + '%', 1, next === 100 ? 'r' : next >= 50 ? 'u' : 'c'); award(10 + next, 'exploration'); }
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
const myLooks = () => Object.assign({}, outfitLook(S.outfit), looks(Object.values(S.gear || {})), (!S.offDuty && EVT.gearLook()) || {}, (!S.offDuty && POL.seasonLook()) || {});
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
// pop-up traffic control: one thing on screen at a time. Banners wait for conversations, menus, loot and cards to finish.
function stageBusy() { return !!(scene || storyBusy || looting || loreBusy || (typeof MG !== 'undefined' && MG.busy) || !$('modal').hidden || !$('dlg').hidden || !fe().hidden || (typeof EP !== 'undefined' && EP.busy) || document.querySelector('.tCard, .lorePop, .introCine, .gradCred')); }
const bannerQ = []; let bannerOn = false, bannerPoll = 0;
function banner(icon, title, sub, secret) { if (bannerQ.some((b) => b[1] === title)) return; bannerQ.push([icon, title, sub, secret]); pumpBanner(); }
function pumpBanner() {
  if (bannerOn || !bannerQ.length) return; if (stageBusy() || trBusy) { if (!bannerPoll) bannerPoll = setTimeout(() => { bannerPoll = 0; pumpBanner(); }, 600); return; }
  const [icon, title, sub, secret] = bannerQ.shift(), el = $('banner'); bannerOn = true;
  el.className = 'banner' + (secret ? ' secret' : ''); el.innerHTML = '<span>' + icon + '</span><div><b>' + esc(title) + '</b><small>' + esc(sub || '') + '</small></div>'; el.hidden = false;
  clearTimeout(bannerT); bannerT = setTimeout(() => { el.hidden = true; bannerOn = false; setTimeout(pumpBanner, 350); }, bannerQ.length ? 3200 : 4200);
}
// loot: queued so a reveal never lands on top of a question
const lootQ = [];
function queueLoot(where, chance, min) { if (Math.random() > Math.min(1, chance * (1 + gp('loot') / 100) + (chance < 1 ? gp('loot') / 200 : 0))) return; lootQ.push([where, min]); setTimeout(runLoot, 400); }
let looting = false;
async function runLoot() {
  if (looting || !lootQ.length) return; if (scene || storyBusy || loreBusy || !$('modal').hidden || !$('dlg').hidden || (typeof EP !== 'undefined' && EP.busy) || document.querySelector('.tCard, .lorePop, .introCine, .gradCred')) { setTimeout(runLoot, 600); return; }
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
const NPC_AT = { delgado: 'Founders Plaza', pruitt: 'Founders Park', dot: 'Night Owl', marcus: 'Bayfront Tower', okafor: 'Library', kevin: 'Meridian', rosa: "Rosa's", earl: 'Earl', reyes: 'Iron Will', kim: 'Spin City', ruth: 'Maple Court', dez: 'Community', hal: 'Marina', bobby: 'Hook', johnson: 'Riverside School', miguel: 'Church', sam: 'firestation', gus: 'Riverside Park', gerald: 'Coastline', rusty: "Rusty's", dee: 'Truck Stop', carl: 'Lock-It', lupe: 'Lunch Pail', shonda: 'Green Bin', moore: 'courthouse', barnes: 'Barnes', ray: 'Freedom', hattie: 'Clerk', ramos: 'sallyport', exhibita: 'Justice Plaza' };
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
function cat(sx, sy, now, g) { g = g || ctx; const t = Math.sin(now / 600) * 3; g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(sx, sy + 1, 7, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#f59e0b'; g.beginPath(); g.ellipse(sx, sy - 5, 7, 4.5, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(sx + 6, sy - 10, 4, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(sx + 3, sy - 13); g.lineTo(sx + 4, sy - 17); g.lineTo(sx + 6, sy - 13); g.moveTo(sx + 7, sy - 13); g.lineTo(sx + 9, sy - 17); g.lineTo(sx + 9.5, sy - 12); g.fill(); g.strokeStyle = '#f59e0b'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx - 6, sy - 6); g.quadraticCurveTo(sx - 12, sy - 10 + t, sx - 10, sy - 16 + t); g.stroke(); g.fillStyle = '#111'; g.fillRect(sx + 6, sy - 11, 1.2, 1.2); g.fillRect(sx + 8, sy - 11, 1.2, 1.2); }
function regsDraw(list, vis, now) {
  regs.forEach((r) => { const [sx, sy] = iso(r.x, r.y); if (!vis(sx, sy)) return; const near = Math.hypot(r.x - P.x, r.y - P.y);
    list.push({ d: r.x + r.y, f: () => {
      if (r.n.cat) cat(sx, sy, now); else { const lk = r.n.look || {}; person(ctx, sx, sy, { kit: r.n.kit || npcKit(lk), hair: r.n.hair || lk.hair, skin: r.n.skin || lk.skin, moving: false, face: r.face, ph: r.ph, wave: (r.waveT || 0) > performance.now() }, now); if (r.n.glasses || lk.glasses) { ctx.fillStyle = '#111'; ctx.fillRect(sx - 4, sy - 29, 8, 1.2); } }
      if (near < 5.5) label(sx, sy - (r.n.cat ? 26 : 48), r.n.icon + ' ' + r.n.name, '#fde68a');
      if (!talkedNow[r.n.id] && near < 10) bubble(sx, sy - (r.n.cat ? 42 : 66), '💬', '#fde68a', now);
    } });
  });
}
const hearts = (f) => '<span class="hearts">' + [1, 2, 3, 4, 5, 6].map((k) => '<i class="' + (k <= f ? 'on' : '') + '">★</i>').join('') + '</span>';
// ---------- going inside buildings ----------
function doorSpot(l) { if (l._ds) return l._ds; if (l.bld) return (l._ds = [l.bld.x + l.bld.w / 2, l.bld.y + l.bld.d + .05]); const b = W.buildings.find((b2) => b2.x >= l.ox && b2.x <= l.ox + 8 && b2.y >= l.oy && b2.y <= l.oy + 8); return (l._ds = !b ? [l.door[0] + .5, l.door[1] - .2] : [b.x + b.w / 2, b.y + b.d + .05]); }
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
const sideOpen = (q) => S.unlocked.includes(q.d) && (S.story[q.req[0]] || 0) >= q.req[1] && (!q.need || q.need(S));
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
// where a side case's giver waits: a regular at their usual spot, or a one-off person at the case's own place (giverAt)
const GSPOT = {};
function giverPos(q) {
  const r = regs.find((x) => x.n.id === q.giver); if (r) return r; if (!q.giverAt || !W || q.d !== W.did || inside) return null;
  const c = GSPOT[q.id]; if (c && c.w === W) return c; const l = W.lots.find((x) => (x.name || '').indexOf(q.giverAt) >= 0); if (!l) return null;
  const [dx, dy] = doorSpot(l), p = { x: dx + .8, y: dy + 1.2, w: W }; GSPOT[q.id] = p; return p;
}
const giverName = (id) => { const n = NPCS.find((x) => x.id === id) || CAST[id] || TEMP[id]; return n ? n.name : id; };
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
  if (rw.title) { S.titles = S.titles || {}; S.titles[rw.title] = 1; }
  openModal('<div class="chEnd side' + (q.saga ? ' saga' : '') + '"><span class="chKick">' + (q.saga ? 'Story arc complete' : 'Side case closed') + (rw.title ? ' · title: ' + esc(rw.title) : '') + '</span><h2>' + esc(q.title) + '</h2><p>' + esc(DISTRICTS[q.d].name) + '</p><div class="chStamp">CASE CLOSED</div><p class="chNext">' + n + ' of ' + SIDE.length + ' side cases closed. People remember how you handled this one.</p></div><div class="qAct"><button type="button" id="mDone">Back to patrol</button></div>');
  good(); $('mDone').onclick = () => { closeModal(); award(rw.rp || 100, 'side case'); if (rw.loot) queueLoot('Side case: ' + q.title, 1, rw.loot); };
}
function storyUpdate(dt) {
  storyCool -= dt; if (storyBusy || scene || storyCool > 0 || !$('modal').hidden || heldByLeave()) return;
  if (!inside) for (const q of SIDE) { if (!sideAvail(q) || (offerNo[q.id] || 0) > performance.now()) continue; const r = giverPos(q); if (r && Math.hypot(r.x - P.x, r.y - P.y) < 1.8) { offerSide(q); return; } }
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
const TEMP = Object.assign({}, SIDE_CAST, SAGA_CAST, TALE_CAST, ACT2_CAST);
// after a right answer: praise, then a tip about something else worth doing nearby
function hintLine() {
  const opts = [], nm = (id) => giverName(id);
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
function cineFocus(x, y, z) { const [ix, iy] = iso(x, y); CINE.on = true; CINE.x = ix; CINE.y = iy - 18; CINE.z = Math.min(2.2, Math.max(cam.zUser, z || (innerWidth < 600 ? 1.35 : 1.7))); CINE.back = 0; }
function cineRelease() { if (!CINE.on) return; CINE.on = false; CINE.back = 1; }
function cineCam(dt) {
  if (!S.cfg || S.cfg.motion === false) { if (CINE.on) { cam.x = CINE.x; cam.y = CINE.y; } cam.z = (CINE.on ? CINE.z : cam.zUser); if (!CINE.on && CINE.back > 0) { CINE.back = 0; cam.free = false; } return; }
  // one place eases the zoom, so cinematics, punch-ins, settings and resizes can never snap it
  const k = 1 - Math.exp(-dt * 2.6), kz = 1 - Math.exp(-dt * 3.2);
  if (CINE.on) { cam.free = true; cam.x += (CINE.x - cam.x) * k; cam.y += (CINE.y - cam.y) * k; }
  else if (CINE.back > 0) { CINE.back -= dt * 1.2; if (CINE.back <= 0) cam.free = false; }
  const tz = (CINE.on ? CINE.z : cam.zUser) * (cam.zMul || 1); if (Math.abs(tz - cam.z) < .0008) cam.z = tz; else cam.z += (tz - cam.z) * kz;
}
function zoomTarget() { return CINE.on ? CINE.z : cam.zUser; }
function scoreAnswer(q, ans, retry) {
  const ok = L.isRight(q, ans); L.record(S, q, ok); SS.answered++;
  if (ok && retry) { SS.right++; stat('right'); stat('retryRight'); COMBO = 0; good(); }
  else if (ok) { SS.right++; stat('right'); S.bestCombo = Math.max(S.bestCombo || 0, COMBO + 1); COMBO++; bestCombo = Math.max(bestCombo, COMBO); ord('right'); if (COMBO === 5) ord('streak'); good(); } else { COMBO = 0; bad(); }
  comboHud(); return ok;
}
// ---------- dialogue presentation: live portraits, voiced typewriter, rich text, tone-tagged choices, log, auto and skip ----------
const DLG_LOG = []; let DLG_HIDE_T = 0;
const hashStr = (s) => [...String(s)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
// how a speaker looks in their portrait (null: use their icon)
function portraitLook(id) {
  if (PLOOK[id]) return PLOOK[id];
  if (id === '@you') return { kit: kitWith(myKit(), myLooks()), skin: S.skin || '#c68e63', hair: '#1a1a1a' };
  const c = CAST[id]; if (c && c.look) return { kit: c.look, skin: c.skin, hair: '#1a1a1a' };
  const n = NPCS.find((x) => x.id === id); if (n) { if (n.cat) return { cat: true }; const lk = n.look || {}, r = regs.find((x) => x.n.id === id); return { kit: n.kit || npcKit(lk), hair: n.hair || lk.hair, skin: n.skin || lk.skin, ph: r ? r.ph : undefined }; }
  const t = TEMP[id]; if (t) { const h = hashStr(id); return { ph: h % 997, shirt: ['#c0392b', '#2e86de', '#16a085', '#8e44ad', '#e67e22', '#2c3e50', '#d35400', '#27ae60'][h % 8], skin: ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#a0662f'][(h >> 3) % 6], hair: ['#2b1d14', '#5a3825', '#1a1a1a', '#b07b3c', '#9a9a9a'][(h >> 5) % 5], kid: /age 9|teen|kid|child/i.test((t.name || '') + ' ' + (t.role || '')) }; }
  return null;
}
// a speaker's accent colour and voice (pitch, timbre) stay the same every time you meet them
function speakerStyle(id, lk) {
  let col; const h = hashStr(id); col = id === '@you' ? '#f5b800' : CAST[id] ? '#f5b800' : lk && (lk.kit ? lk.kit.shirt : lk.shirt) || ['#38bdf8', '#a78bfa', '#34d399', '#fb923c', '#f472b6'][h % 5];
  const rgb = /^#[0-9a-f]{6}$/i.test(col) ? [1, 3, 5].map((k) => parseInt(col.substr(k, 2), 16)) : null; if (rgb && !CAST[id] && id !== '@you' && (Math.max(...rgb) - Math.min(...rgb) < 40 || Math.max(...rgb) < 70)) col = ['#38bdf8', '#a78bfa', '#34d399', '#fb923c', '#f472b6'][h % 5];
  return { col, f: id === 'exhibita' ? 720 : 150 + (h % 9) * 24, wave: ['triangle', 'sine', 'triangle', 'square'][(h >> 4) % 4] };
}
const lighten = (hex, k) => { const n = parseInt(hex.slice(1), 16); const m = (v) => Math.round(v + (255 - v) * k); return 'rgb(' + m(n >> 16 & 255) + ',' + m(n >> 8 & 255) + ',' + m(n & 255) + ')'; };
// rich text: (stage directions), *emphasis*, ~wavy~, and shouted CAPS on an exclaimed line
function richChars(text) {
  const out = []; let dir = 0, em = false, wave = false; const loud = /!/.test(text);
  const caps = new Set(); if (loud) { const re = /\b[A-Z][A-Z'!]{3,}\b/g; let m; while ((m = re.exec(text))) for (let k = m.index; k < m.index + m[0].length; k++) caps.add(k); }
  for (let k = 0; k < text.length; k++) {
    const ch = text[k];
    if (ch === '*') { em = !em; continue; } if (ch === '~') { wave = !wave; continue; }
    if (ch === '(') dir++;
    out.push({ ch, cls: (dir ? 'dir ' : '') + (em ? 'em ' : '') + (wave ? 'wave ' : '') + (caps.has(k) ? 'shout' : '') });
    if (ch === ')' && dir) dir--;
  }
  return out;
}
function emoteFor(text, mood) {
  if (mood === 'ok') return '✨'; if (mood === 'no') return '📘';
  if (/\b(ha(ha)+|lol|laugh)/i.test(text)) return '😄'; if (/\b(cry|cried|crying|tears|miss (him|her)|passed away|died)\b/i.test(text)) return '💧';
  if (/!/.test(text) && /\b[A-Z]{4,}\b/.test(text)) return '❗'; if (/\?\s*["']?$/.test(text.trim())) return '❓'; if (/^\s*(\.\.\.|…)/.test(text)) return '💭';
  return '';
}
function toneOf(o) {
  const t = o.t || '', em = t.match(/^(\p{Extended_Pictographic})\uFE0F?\s*/u); if (em) return [em[1], '', em[0].length]; if (o.accept) return ['📁', 'Accept']; if (o.bye) return ['👋', 'Leave'];
  if (/^(not right now|decline|back away|walk away|leave)/i.test(t)) return ['✋', 'Decline'];
  if (/^(laugh|joke|trash talk|tease)/i.test(t)) return ['😄', 'Playful'];
  if (/^(offer|help|volunteer|promise|sign up|bring|connect|introduce|suggest|encourage|invite|give|sit|stay)/i.test(t)) return ['🤝', 'Support'];
  if (/^(report|call|check|search|look|follow|search)/i.test(t)) return ['📋', 'Investigate'];
  if (/^(ask|what|how|why|who|where)|\?$/i.test(t)) return ['❓', 'Ask'];
  if (/^(tell|say|explain|remind|praise)/i.test(t)) return ['💬', 'Talk'];
  return ['▸', ''];
}
// after walking away, the same person or call does not grab you again until you have moved off (or a little while passes)
let LEFT = null;
function leaveHere() { LEFT = { x: P.x, y: P.y, t: performance.now() }; }
function heldByLeave() { if (!LEFT) return false; if (Math.hypot(P.x - LEFT.x, P.y - LEFT.y) > 2.6 || performance.now() - LEFT.t > 25000) { LEFT = null; return false; } return true; }
function leaveDefault() { storyBusy = false; if (!PAUSED_BY_MENU) paused = false; scene = null; storyCool = 2; if (net) net.status('patrol'); if (S.sound) music.start(moodNow()); }
function dialogue(lines, done, opts) {
  opts = opts || {}; const box = $('dlg'); let seq = lines.slice(), i = -1, typing = null, full = '', auto = !!(S.cfg && S.cfg.autoDlg), skipping = false, autoT = 0, alive = true, lastSp = null, lastName = '';
  const res = { right: 0, n: 0, choices: [] };
  const who = (id) => TEMP[id] || CAST[id] || NPCS.find((n) => n.id === id) || { name: id, icon: '💬', role: '' };
  const kick = opts.kicker ? '<div class="dlgKick">' + esc(opts.kicker) + '</div>' : '';
  // the frame is built once; each line swaps the body so the portrait and controls can animate between speakers
  box.innerHTML = '<div class="dlgBar top">' + kick + '</div><div class="dlgBar bot"></div><div class="dlgMem" hidden></div>' +
    '<div class="dlgPanel"><div class="dlgPlate"><b></b><small></small></div><div class="dlgPortWrap"><div class="dlgPort"><canvas class="dlgCv" width="192" height="192"></canvas><span class="dlgIco"></span></div><span class="dlgEmo"></span></div>' +
    '<div class="dlgBody"></div><div class="dlgCtl"><button type="button" data-c="log" title="Conversation log">📜</button><button type="button" data-c="auto" title="Auto-advance">▶</button><button type="button" data-c="skip" title="Skip to the next choice">⏩</button><button type="button" data-c="leave" class="dlgLeave" title="Walk away (Esc)">🚶 Leave</button></div><i class="dlgNext">▸</i></div><div class="dlgLogBox" hidden></div>';
  clearTimeout(DLG_HIDE_T); const wasOpen = !box.hidden; box.hidden = false; if (wasOpen) box.classList.add('on'); else requestAnimationFrame(() => box.classList.add('on'));
  const panel = box.querySelector('.dlgPanel'), body = box.querySelector('.dlgBody'), plate = box.querySelector('.dlgPlate'), portW = box.querySelector('.dlgPortWrap'), port = box.querySelector('.dlgPort'), cvp = box.querySelector('.dlgCv'), ico = box.querySelector('.dlgIco'), emo = box.querySelector('.dlgEmo'), mem = box.querySelector('.dlgMem'), logBox = box.querySelector('.dlgLogBox');
  const ctl = (c) => box.querySelector('[data-c="' + c + '"]'); ctl('auto').classList.toggle('on', auto); if (opts.noSkip) ctl('skip').hidden = true; if (opts.noLeave) ctl('leave').hidden = true;
  // the live portrait: the speaker's own character, breathing, nodding when they talk
  const pg = cvp.getContext('2d'); let pLook = null, pTalk = 0, pNod = 0, pTilt = 0, pRaf = 0;
  const drawPort = (now) => {
    if (!alive) return; pRaf = requestAnimationFrame(drawPort); pg.setTransform(2, 0, 0, 2, 0, 0); pg.clearRect(0, 0, 96, 96); if (!pLook) return;
    pNod *= .9; pTilt += ((pTalk && full.trim().slice(-1) === '?' ? .06 : 0) - pTilt) * .08;
    const bob = (typing ? Math.abs(Math.sin(now / 90)) * 1.6 : Math.sin(now / 900) * .6) + pNod * 3, s = pLook.kid ? 2.9 : 3.4;
    pg.save(); pg.translate(48, 96); pg.rotate(pTilt); pg.translate(-48, -96);
    if (pLook.cat) { pg.translate(48, 72 - bob); pg.scale(3.4, 3.4); cat(0, 0, now, pg); }
    else person(pg, 50, 50 + 29 * s - bob, Object.assign({}, pLook, { s, moving: false, face: -1, glance: false, noShadow: true }), now);
    pg.restore();
  }; pRaf = requestAnimationFrame(drawPort);
  const setSpeaker = (id, c, radio, mood) => {
    const lk = id ? portraitLook(id) : null, st = speakerStyle(id || 'narr', lk), changed = id !== lastSp;
    pLook = lk; ico.textContent = lk ? '' : (radio ? '📻' : c ? c.icon : ''); port.className = 'dlgPort' + (radio ? ' radio' : '') + (mood ? ' ' + mood : '') + (lk ? '' : ' emoji');
    panel.style.setProperty('--acc', st.col); panel.style.setProperty('--accL', lighten(st.col.startsWith('#') ? st.col : '#f5b800', .55));
    if (changed && id) { portW.classList.remove('swap'); void portW.offsetWidth; portW.classList.add('swap'); }
    lastSp = id; return st;
  };
  const showEmote = (e) => { emo.textContent = e; emo.classList.remove('pop'); if (e) { void emo.offsetWidth; emo.classList.add('pop'); } };
  const remember = (txt) => { mem.textContent = txt; mem.hidden = false; mem.classList.remove('in'); void mem.offsetWidth; mem.classList.add('in'); beep(880, .1, 'sine', .025); beep(1320, .14, 'sine', .02, .09); clearTimeout(mem._t); mem._t = setTimeout(() => { mem.hidden = true; }, 2600); };
  const log = (name, text, col) => { DLG_LOG.push({ name, text, col }); if (DLG_LOG.length > 120) DLG_LOG.shift(); };
  const next = () => { clearTimeout(autoT); POL.hush(); do { i++; } while (i < seq.length && !condOk(seq[i])); if (i < seq.length) show(); else end(); };
  const setChoiceMode = (on) => { panel.classList.toggle('dlgChoice', on); box.onclick = on ? null : click; };
  const show = () => {
    const ln = seq[i]; panel.classList.remove('dlgNarr', 'dlgQuiz'); showEmote('');
    if (ln[0] === 'fx') { try { ln[1](res); } catch (e) {} return next(); }
    if (ln[0] === 'choice') {
      skipping = false; const opts2 = ln[1], ctxKey = hashStr((seq[0] && seq[0][1]) || '') % 99991;
      S.seenCh = S.seenCh || {}; setSpeaker('@you', null, false, '');
      plate.querySelector('b').textContent = 'You'; plate.querySelector('small').textContent = ln[2] || 'What do you do?';
      body.innerHTML = '<div class="dlgTxt"><div class="dlgOpts">' + opts2.map((o, k) => { const [ti, tl, cut] = toneOf(o), seen = S.seenCh[ctxKey + ':' + hashStr(o.t)]; return '<button type="button" data-k="' + k + '" class="' + (seen ? 'seen' : '') + '" style="--d:' + (k * 60) + 'ms"><span class="kk">' + (k + 1) + '</span><span class="tone" title="' + tl + '">' + ti + '</span><span class="ot">' + esc(cut ? o.t.slice(cut) : o.t) + '</span></button>'; }).join('') + '</div></div>';
      setChoiceMode(true); const bs = [...body.querySelectorAll('[data-k]')]; bs.forEach((b, k) => b.onmouseenter = () => b.focus());
      bs.forEach((b) => b.onclick = (e) => { e.stopPropagation(); const o = opts2[+b.dataset.k]; S.seenCh[ctxKey + ':' + hashStr(o.t)] = 1; const ks = Object.keys(S.seenCh); if (ks.length > 800) delete S.seenCh[ks[0]];
        res.choices.push(o); COOP.onChoice(o); if (o.take) qTake(o.take); if (o.give) qGive(o.give); applyChoice(o); beep(660, .08, 'triangle', .04); log('You', o.t, '#f5b800');
        if ((o.set || o.npc || o.trust > 0) && lastName && !o.accept && !o.bye) remember('🧠  ' + lastName + ' will remember that.');
        if (o.fx) { try { o.fx(res); } catch (er) {} } seq.splice(i + 1, 0, ...(o.reply || [])); setChoiceMode(false); next(); });
      return;
    }
    if (ln[0] === 'q') {
      skipping = false; const q = ln[1], sp = ln[2] || 'castillo', c = who(sp); let picked = []; window.__curQ = q; setSpeaker(sp, c, false, ''); panel.classList.add('dlgQuiz');
      plate.querySelector('b').textContent = c.name; plate.querySelector('small').textContent = L.lessonName(q.les != null ? q.les : W.D.lessons[0]) || '';
      body.innerHTML = '<div class="dlgTxt"><small class="dlgQs"></small><p class="dlgQ">' + esc(q.stem) + '</p>' + (q.multi ? '<em class="dlgHint">Select all that apply, then confirm.</em>' : '') + '<div class="dlgOpts q">' + q.opts.map((o, k) => '<button type="button" data-k="' + k + '" style="--d:' + (k * 50) + 'ms"><span class="kk">' + 'ABCDEF'[k] + '</span><span class="ot">' + esc(o) + '</span></button>').join('') + '</div>' + (q.multi ? '<div class="dlgConfirm"><button type="button" id="dlgOk" disabled>Confirm</button></div>' : '') + '</div>';
      setChoiceMode(true); log(c.name, q.stem, speakerStyle(sp, portraitLook(sp)).col);
      let tries = 0;
      const finish = () => { const ans = q.multi ? picked.slice() : picked[0];
        // a wrong first answer gets one more try (no streak, but it still counts and completes the fact)
        if (tries === 0 && !S.fto && !L.isRight(q, ans)) { tries = 1; bad(); COMBO = 0; comboHud(); showEmote('🤔'); port.classList.add('no'); setTimeout(() => port.classList.remove('no'), 700);
          body.querySelectorAll('[data-k]').forEach((b) => { const k = +b.dataset.k; if (!q.multi && k === ans) { b.disabled = true; b.classList.add('no'); } b.classList.remove('sel'); }); picked = [];
          const tx = body.querySelector('.dlgQs'); if (tx) tx.innerHTML = '<b class="dlgRetry">Not quite. One more try.</b>'; if (q.multi && $('dlgOk')) $('dlgOk').disabled = true; return; }
        const ok = scoreAnswer(q, ans, tries > 0); if (ok && COMBO >= 3 && COMBO % 3 === 0) EP.slowMo(.7); res.qs = res.qs || []; res.qs.push({ stem: q.stem, ok, fact: (q.fact || q.ex || '').trim() }); res.n++; if (ok) res.right++; if (tries && ok) res.retry = (res.retry || 0) + 1; showEmote(ok ? '✨' : '📘');
        body.querySelectorAll('[data-k]').forEach((b) => { const k = +b.dataset.k, isC = q.multi ? q.c.indexOf(k) >= 0 : k === q.c; b.disabled = true; b.classList.add(isC ? 'ok' : picked.indexOf(k) >= 0 ? 'no' : 'dim'); });
        const fact = (q.fact || q.ex || '').trim(); setTimeout(() => { const V = VOICES[sp] || VOICES[String(sp).replace(/^reg_/, '')] || ANYONE, nx = seq[i + 1], more = !nx || nx[0] !== 'q', add = [[sp, ok ? rnd(tries ? V.r : V.p) : rnd(CORRECT) + (fact ? ' ' + fact : ''), { quiz: ok ? 'ok' : 'no' }]];
          if (more && !opts.noFollow) { add.push([sp, rnd(V.a)]); if (ok && sp !== 'exhibita' && Math.random() < .4) add.push([sp, (V === ANYONE ? 'Oh, and officer? ' : 'Oh, and one more thing. ') + hintLine()]); }
          seq.splice(i + 1, 0, ...add); setChoiceMode(false); next(); }, 750); };
      body.querySelectorAll('[data-k]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); const k = +b.dataset.k; if (q.multi) { const at = picked.indexOf(k); if (at >= 0) picked.splice(at, 1); else picked.push(k); b.classList.toggle('sel'); $('dlgOk').disabled = !picked.length; } else { picked = [k]; finish(); } });
      if (q.multi) $('dlgOk').onclick = (e) => { e.stopPropagation(); if (picked.length) finish(); };
      return;
    }
    const narr = ln[0] === 'narr', id = narr ? '' : ln[0], text = ln[1], c = narr ? null : who(id), radio = !narr && /^\(over the radio\)/.test(text), mood = ln[2] && ln[2].quiz;
    full = text.replace(/^\(over the radio\)\s*/, '');
    const st = setSpeaker(narr ? null : id, c, radio, mood || '');
    if (!narr) lastName = (c.name || '').replace(/\s*\(.*\)$/, '').split(' ').filter((w) => !/^(Mr|Mrs|Ms|Dr|Sgt|Lt|Det|Judge|Father|Pastor|Coach|Captain|Tía|Doña|Miss)\.?$/.test(w))[0] || c.name;
    log(narr ? '' : c.name, full, st.col);
    if (skipping) return next();
    if (narr) panel.classList.add('dlgNarr');
    plate.querySelector('b').innerHTML = narr ? '' : esc(c.name) + (radio ? ' <em>📻 on the radio</em>' : ''); plate.querySelector('small').textContent = narr ? '' : c.role || '';
    const chars = richChars(full);
    body.innerHTML = '<div class="dlgTxt' + (narr ? ' narr' : '') + '"><p id="dlgP">' + chars.map((x, k) => '<span class="h ' + x.cls + '" style="--i:' + k + '">' + esc(x.ch) + '</span>').join('') + '</p></div>';
    const spans = body.querySelectorAll('#dlgP span'), base = 30 / ({ slow: .6, normal: 1, fast: 2, instant: 999 }[S.cfg.text] || 1);
    let k = 0; clearTimeout(typing); pTalk = narr ? 0 : 1;
    const step = () => {
      if (!alive) return; if (k >= spans.length) { typing = null; pTalk = 0; if (auto) { const go = () => { if (!alive || !box.onclick) return; if (POL.speaking) { autoT = setTimeout(go, 300); return; } next(); }; autoT = setTimeout(go, Math.max(1300, full.length * 42)); } return; }
      const sp = spans[k], ch = chars[k].ch; sp.classList.remove('h'); k++;
      if (!narr && S.sound && /[a-z0-9]/i.test(ch) && k % 2 === 1 && !/dir/.test(chars[k - 1].cls)) beep(st.f * (radio ? 1.6 : 1) * (.92 + ((k * 7) % 5) * .04), radio ? .03 : .045, radio ? 'square' : st.wave, radio ? .012 : .016);
      if (ch === '!' && !narr) pNod = 1;
      const nx = chars[k] ? chars[k].ch : ' ', pause = /[.!?]/.test(ch) && /[\s"')]/.test(nx) ? 9 : /[,;:]/.test(ch) ? 4 : ch === '—' ? 5 : 0;
      typing = setTimeout(step, base * (1 + pause));
    };
    typing = setTimeout(step, base > 100 ? 0 : 60);
    if (base > 100) { spans.forEach((s) => s.classList.remove('h')); k = spans.length; }
    const e = emoteFor(full, mood); if (e && !narr) setTimeout(() => alive && showEmote(e), 220);
    if (radio) chirp();
    if (!narr && POL.voiceOn(opts)) POL.speak(id, c.name, full, radio);
  };
  document.body.classList.add('cine'); if (opts.focus) cineFocus(opts.focus[0], opts.focus[1], opts.zoom);
  const end = () => { alive = false; POL.hush(); DLGMOOD = null; cancelAnimationFrame(pRaf); clearTimeout(typing); clearTimeout(autoT); document.body.classList.remove('cine'); box.classList.remove('on'); if (opts.focus) cineRelease(); clearTimeout(DLG_HIDE_T); DLG_HIDE_T = setTimeout(() => { if (!box.classList.contains('on')) { box.hidden = true; box.innerHTML = ''; } }, 250); box.onclick = null; removeEventListener('keydown', keys); saveS(); done && done(res); };
  const finishTyping = () => { clearTimeout(typing); typing = null; pTalk = 0; body.querySelectorAll('#dlgP span.h').forEach((s) => s.classList.remove('h')); if (auto) { const go = () => { if (!alive || !box.onclick) return; if (POL.speaking) { autoT = setTimeout(go, 300); return; } next(); }; autoT = setTimeout(go, Math.max(1300, full.length * 42)); } };
  const click = () => { if (!logBox.hidden) return; if (typing) { finishTyping(); return; } next(); };
  const openLog = () => { logBox.innerHTML = '<div class="dlgLogHead"><b>Conversation log</b><button type="button" data-c="close">Close</button></div><div class="dlgLogList">' + DLG_LOG.slice(-60).map((l) => '<div class="dlgLogRow' + (l.name ? '' : ' narr') + '" style="--acc:' + l.col + '">' + (l.name ? '<b>' + esc(l.name) + '</b>' : '') + '<p>' + esc(l.text.replace(/[*~]/g, '')) + '</p></div>').join('') + '</div>'; logBox.hidden = false; const ls = logBox.querySelector('.dlgLogList'); ls.scrollTop = ls.scrollHeight; logBox.querySelector('[data-c="close"]').onclick = (e) => { e.stopPropagation(); logBox.hidden = true; }; };
  ctl('log').onclick = (e) => { e.stopPropagation(); openLog(); };
  ctl('auto').onclick = (e) => { e.stopPropagation(); auto = !auto; S.cfg.autoDlg = auto; ctl('auto').classList.toggle('on', auto); if (auto && !typing && box.onclick) autoT = setTimeout(() => alive && box.onclick && next(), 900); else clearTimeout(autoT); };
  ctl('skip').onclick = (e) => { e.stopPropagation(); if (!box.onclick) return; skipping = true; finishTyping(); next(); };
  // walk away at any point: nothing is lost (answers already given still count), and the person is there when you come back
  let leaveArm = 0; const walkAway = () => { if (!alive || opts.noLeave) return; const b = ctl('leave'); if (Date.now() - leaveArm > 2200) { leaveArm = Date.now(); b.classList.add('arm'); b.textContent = 'Tap again to leave'; setTimeout(() => { if (alive && b) { b.classList.remove('arm'); b.textContent = '🚶 Leave'; } }, 2200); return; }
    const d = done; done = null; end(); leaveHere(); try { (opts.onLeave || leaveDefault)(res); } catch (er) {} toast('🚶 You stepped away. Come back anytime.'); };
  ctl('leave').onclick = (e) => { e.stopPropagation(); walkAway(); };
  logBox.onclick = (e) => e.stopPropagation();
  const keys = (e) => {
    if (box.hidden || !alive) return;
    if (!logBox.hidden) { if (e.key === 'Escape' || e.key === 'l' || e.key === 'L') { logBox.hidden = true; e.preventDefault(); } return; }
    if (e.key === 'Escape') { walkAway(); e.preventDefault(); return; }
    const opt = [...box.querySelectorAll('.dlgOpts [data-k]:not([disabled])')];
    if (opt.length && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { const at = opt.indexOf(document.activeElement); const nx = opt[(at + (e.key === 'ArrowDown' ? 1 : opt.length - 1) + (at < 0 && e.key === 'ArrowDown' ? 0 : 0)) % opt.length] || opt[0]; nx.focus(); e.preventDefault(); return; }
    const b = box.querySelector('[data-k="' + (parseInt(e.key, 10) - 1) + '"]') || (/^[a-f]$/i.test(e.key) ? box.querySelector('.dlgOpts.q [data-k="' + ('abcdef'.indexOf(e.key.toLowerCase())) + '"]') : null);
    if (b && !b.disabled) { b.click(); e.preventDefault(); return; }
    if (e.key === 'Enter' && opt.indexOf(document.activeElement) >= 0) { document.activeElement.click(); e.preventDefault(); return; }
    if ((e.key || '').toLowerCase() === ((S.cfg.keys || {}).log || 'l')) { openLog(); e.preventDefault(); return; }
    if ((e.key === ' ' || e.key === 'Enter') && box.onclick) { e.preventDefault(); click(); }
  };
  addEventListener('keydown', keys);
  box.onclick = click;
  next();
}
// ---------- quest items: things you carry for a story, which you can inspect in the menu ----------
S.qitems = S.qitems || {}; S.qkept = S.qkept || {};
function qGive(id) { const it = QITEMS[id]; if (!it || S.qitems[id]) return; S.qitems[id] = Date.now(); saveS(); setTimeout(() => banner(it.icon, 'Quest item: ' + it.name, it.text.length > 90 ? it.text.slice(0, 88) + '…' : it.text), 600); stat('qitems'); }
function qTake(id) { if (!S.qitems[id]) return; delete S.qitems[id]; S.qkept[id] = Date.now(); saveS(); }
function qItemsPanel(sel) {
  const have = Object.keys(S.qitems).filter((k) => QITEMS[k]), kept = Object.keys(S.qkept).filter((k) => QITEMS[k] && !S.qitems[k]), cur = sel || have[0] || kept[0], it = QITEMS[cur];
  const tile = (k, past) => '<button type="button" class="qiT' + (k === cur ? ' on' : '') + (past ? ' past' : '') + '" data-q="' + k + '"><span>' + QITEMS[k].icon + '</span><b>' + esc(QITEMS[k].name) + '</b></button>';
  openModal('<div class="sceneHead"><b>QUEST ITEMS</b><h2>What you\'re carrying</h2><p>Story items you pick up along the way. Look closely: some of them tell you where to go next.</p></div>' + (have.length || kept.length ? '<div class="qiWrap"><div class="qiList">' + have.map((k) => tile(k)).join('') + (kept.length ? '<small>Given away or returned</small>' + kept.map((k) => tile(k, 1)).join('') : '') + '</div>' + (it ? '<div class="qiView"><div class="qiBig">' + it.icon + '</div><h3>' + esc(it.name) + '</h3><p>' + esc(it.text) + '</p><button type="button" class="ghost" id="qiRead">🔍 Look closer</button><p class="qiRead" hidden>' + esc(it.read || '') + '</p></div>' : '') + '</div>' : '<p class="lkSum">Nothing yet. People will hand you things: photos, letters, keys. Keep them.</p>') + '<div class="qAct"><button type="button" id="mClose">Back</button></div>');
  document.querySelectorAll('.qiT').forEach((b) => b.onclick = () => qItemsPanel(b.dataset.q)); const r = $('qiRead'); if (r) r.onclick = () => { r.hidden = true; document.querySelector('.qiRead').hidden = false; beep(880, .06, 'triangle', .03); stat('qread'); }; $('mClose').onclick = closeModal;
}
// a turn in the story gets its own title card, after the scene that reveals it
function twistCard(t) { const el = document.createElement('div'); el.className = 'twist'; el.innerHTML = '<i class="tcBar t"></i><i class="tcBar b"></i><div class="twIn"><small>THE STORY TURNS</small><h2>' + esc(t.title) + '</h2><p>' + esc(t.text) + '</p><em>Tap to continue</em></div>'; document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on')); if (S.sound) music.sting('p1'); PREM.buzz('p1'); paused = true; const close = () => { el.classList.remove('on'); setTimeout(() => el.remove(), 450); paused = false; }; el.onclick = close; setTimeout(() => { if (el.isConnected) close(); }, 9000); stat('twists'); }
// a step can be skipped or required by an earlier choice, so the story branches
const stepOn = (st) => !(st.onlyIf && !S.flags[st.onlyIf]) && !(st.skipIf && S.flags[st.skipIf]);
function playStep(st) {
  if (st.need && !S.qitems[st.need]) { const it = QITEMS[st.need]; toast('You need ' + (it ? it.icon + ' ' + it.name : 'something') + ' for this. Check Quest Items.'); storyCool = 4; return; }
  storyBusy = true; paused = true; P.path = [];
  const A = activeQ(), c = A.q, idx = A.i;
  let nextI = idx + 1; while (nextI < c.steps.length && !stepOn(c.steps[nextI])) nextI++; const last = nextI >= c.steps.length;
  const finish = () => {
    if (st.give) qGive(st.give); if (st.take) qTake(st.take);
    if (A.side) S.side[c.id] = nextI; else S.story[c.d] = nextI; if (st.set) S.flags[st.set] = Date.now(); saveS(); ord('story'); storyBusy = false; paused = false; storyCool = 2;
    const go = () => { if (last) (A.side ? sideDone(c) : chapterDone(c)); else { const nx = chStep(); if (nx) objectiveFlash(nx.goal); } };
    if (st.twist) { twistCard(st.twist); setTimeout(go, 1200); } else go();
  };
  const afterQuiz = () => { if (st.after) dialogue(st.after, finish); else finish(); };
  const tg = stepTarget(), say = c.saga ? (st.say || []).map((l) => (l[0] === 'choice' ? ['choice', l[1].slice().sort(() => Math.random() - .5), l[2]] : l)) : st.say || [];
  dialogue(say, () => {
    if (!st.quiz) return afterQuiz();
    const les = W.D.lessons.indexOf(st.quiz.les) >= 0 ? [st.quiz.les] : W.D.lessons; const qs = L.pickFacts(S, les, st.quiz.n || 2); const sp = st.who || 'castillo', v2 = A.side ? DISTRICT_VOICE[c.d] || 'castillo' : 'castillo';
    dialogue(qs.map((q, k) => ['q', q, k % 2 && st.who !== v2 ? v2 : sp]), (r) => {
      paused = true; award(r.right * 20, 'story');
      if (r.right < Math.ceil(qs.length / 2)) { dialogue([[st.who || 'castillo', r.right ? 'Close, but not by the book yet. Think it through and try me again.' : 'Not quite. Review it, then come back and we will run it again.']], () => { storyBusy = false; paused = false; storyCool = 4; }); return; }
      afterQuiz();
    });
  }, { focus: tg ? [tg.x, tg.y] : [P.x, P.y], kicker: (A.side ? (c.saga ? 'STORY ARC · ' : 'SIDE CASE · ') : '') + c.title.toUpperCase(), voiced: !A.side });
}
function chapterDone(c) { EP.ending(c, () => chapterDone2(c)); }
function chapterDone2(c) {
  const rw = c.steps[c.steps.length - 1].reward || {}; S.lore['ch' + c.d] = 1; saveS();
  openModal('<div class="chEnd"><span class="chKick">Chapter ' + (c.d + 1) + ' complete</span><h2>' + esc(c.title) + '</h2><p>' + esc(c.sub) + '</p><div class="chStamp">CASE NOTES FILED</div>' +
    '<p class="chNext">' + (c.d < 4 ? 'Next: Chapter ' + (c.d + 2) + ', ' + esc(CHAPTERS[c.d + 1].title) + '. It opens when ' + esc(DISTRICTS[c.d + 1].name) + ' does.' : 'The story is complete. Port Meridian is yours to keep patrolling.') + '</p><p class="chLore">New entries in your Field Journal · +1 skill point</p></div><div class="qAct"><button type="button" id="mDone">Back to patrol</button></div>');
  good(); music.sting('done'); setTimeout(() => beep(1047, .3, 'triangle', .05), 200);
  $('mDone').onclick = () => { closeModal(); if (rw.rp) award(rw.rp, 'chapter complete'); if (rw.loot) queueLoot('Chapter ' + (c.d + 1) + ': ' + c.title, 1, rw.loot); if (c.d === 4 && !S.graduated) setTimeout(() => EP.graduation(), 1500); };
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
  if (!inside) SIDE.forEach((q) => { if (!sideAvail(q)) return; const r = giverPos(q); if (!r) return; const [sx, sy] = iso(r.x, r.y); bubble(sx, sy - 66, '!', '#38bdf8', now); });
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
      const open = sideOpen(q), st = S.side[q.id], done = sideClosed(q), live = sideLive(q), giver = NPCS.find((n) => n.id === q.giver) || TEMP[q.giver] || CAST[q.giver] || {};
      return '<div class="jCh side' + (done ? ' done' : '') + (open ? '' : ' locked') + '"><div class="jChH"><span>' + esc(DISTRICTS[q.d].name) + '</span><b>' + (open || st != null ? esc(q.title) : '🔒 Not yet') + '</b><small>' + (open || st != null ? esc(q.blurb) : 'Keep going with the main story in ' + esc(DISTRICTS[q.d].name) + '.') + '</small></div>' +
        (live ? '<div class="jSteps">' + q.steps.map((x, k) => '<i class="' + (k < st ? 'ok' : k === st ? 'cur' : '') + '"></i>').join('') + '</div><p>Now: ' + esc(q.steps[st].goal) + '</p>' + tr(q.id) : done ? '<p>Case closed.</p>' : open ? '<p>Find ' + esc(giver.icon || '') + ' ' + esc(giver.name || 'someone') + (q.giverAt ? ' at ' + esc(q.giverAt) : '') + ' in ' + esc(DISTRICTS[q.d].name) + '. Look for the blue <b>!</b></p>' : q.friend ? '<p>Become friends with ' + esc(giver.name || 'them') + ' to hear this story.</p>' : q.act ? '<p>Continues after the previous part of the Paper Trail.</p>' : '') + '</div>';
    }).join('') + '</details>'; }).join('');
  }
  if (jTab === 'cast') { const met = (id) => Object.keys(CAST).indexOf(id) >= 0 ? CHAPTERS.some((c) => c.steps.slice(0, S.story[c.d] || 0).some((st) => st.who === id || (st.say || []).some((l) => l[0] === id))) : false; body = Object.keys(CAST).map((id) => { const c = CAST[id], m = met(id); return '<div class="jP' + (m ? '' : ' unk') + '"><span>' + (m ? c.icon : '❔') + '</span><div><b>' + (m ? esc(c.name) : 'Not met yet') + '</b><small>' + (m ? esc(c.role) : '') + '</small>' + (m ? '<p>' + esc(c.bio) + '</p>' : '') + '</div></div>'; }).join('') + (() => { const known = NPCS.filter((n) => (S.npc || {})[n.id] > 0).length, tierOf = (f) => f >= 6 ? 'Best friends' : f >= 3 ? 'Friends' : f >= 1 ? 'Knows your name' : '', hearts = (f) => '💛'.repeat(Math.min(6, f)) + '<span style="opacity:.25">' + '🤍'.repeat(Math.max(0, 6 - f)) + '</span>'; return '<div class="jSec"><b>People you know · ' + known + '/' + NPCS.length + '</b></div>' + DISTRICTS.map((D) => { const ns = NPCS.filter((n) => n.d === D.id); return '<div class="jSec"><b>' + esc(D.name) + ' · ' + ns.filter((n) => (S.npc || {})[n.id] > 0).length + '/' + ns.length + '</b></div>' + ns.map((n) => { const f = (S.npc || {})[n.id] || 0, at0 = NPC_AT[n.id] || n.home, at = Object.keys(LORE_DIST).find((k) => LORE_DIST[k] === D.name && k.indexOf(at0) >= 0) || at0, arc = (S.arcs || {})[n.id] || 0; return f > 0 ? '<div class="jP"><span>' + n.icon + '</span><div><b>' + esc(n.name) + '</b><small>' + esc(n.role) + ' · ' + tierOf(f) + '</small><p>' + hearts(f) + (arc ? ' · story ' + arc + '/5' : '') + '<br>Usually near ' + esc(at) + '.</p></div></div>' : '<div class="jP unk"><span>❔</span><div><b>Not met yet</b><small>Someone ' + (/^[A-Z]/.test(at) ? 'hangs around ' + esc(at) : 'in ' + esc(D.name)) + '</small></div></div>'; }).join(''); }).join(''); })(); }
  if (jTab === 'lore') { const hint = loreHint;
    const grp = [['The city', (e) => e.when === 'start' || /^d\d$/.test(e.when)], ['The story', (e) => e.when.slice(0, 2) === 'ch'], ['Places', (e) => e.when.slice(0, 6) === 'visit:'], ['Side cases', (e) => e.when.slice(0, 5) === 'side:'], ['People', (e) => e.when.slice(0, 7) === 'friend:'], ['Notes & signs', (e) => e.when.slice(0, 5) === 'note:']];
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
  if (BKGO && !inside) return { x: BKGO.x, y: BKGO.y, ax: BKGO.x, ay: BKGO.y, side: false, lab: 'Backup' };
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
    else if (w.slice(0, 7) === 'friend:') ok = ((S.npc || {})[w.slice(7)] || 0) >= 2;
    else if (w.slice(0, 6) === 'visit:' && !inside) { const nm = w.slice(6), l = W.lots.find((x) => x.name && x.name.indexOf(nm) >= 0); if (l) { const [dx, dy] = doorSpot(l); ok = Math.hypot(dx - P.x, dy - P.y) < 4.5; } }
    if (ok) { S.lore[e.id] = 1; fresh.push(e); }
  });
  if (fresh.length) { saveS(); loreQ.push(fresh); stat('lore', fresh.length); setTimeout(lorePop, 300); }
}
function lorePop() {
  if (loreBusy || !loreQ.length) return; if (scene || storyBusy || looting || MG.busy || !$('modal').hidden || !$('dlg').hidden || !fe().hidden || EP.busy || document.querySelector('.tCard, .introCine, .gradCred')) { setTimeout(lorePop, 700); return; }
  loreBusy = true; PREM.onLore(); const es = loreQ.shift(), e = es[0], many = es.length > 1, tot = LORE.length, have = LORE.filter((x) => S.lore[x.id]).length;
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
  return '<p class="lkSum"><b class="skPts">' + pts + '</b> skill point' + (pts === 1 ? '' : 's') + ' to spend. You earn one with every promotion, story chapter, finished friendship story and case file set.</p><div class="skTree">' + BRANCHES.map((b) => '<div class="skCol" style="--bc:' + b.color + '"><div class="skH"><span>' + b.icon + '</span><b>' + b.name + '</b><small>' + b.blurb + '</small></div>' +
    SKILLS.filter((k) => k.b === b.id).map((k) => { const has = hasSk(k.id), can = canLearn(S, k) && pts > 0; return '<button type="button" class="skNode' + (has ? ' has' : can ? ' can' : ' no') + (k.active ? ' act' : '') + '" data-sk="' + k.id + '"' + (has || !can ? ' disabled' : '') + '><i>' + (has ? '✓' : k.tier) + '</i><span><b>' + esc(k.name) + (k.active ? ' <em>Active</em>' : '') + '</b><small>' + esc(k.text) + '</small></span></button>'; }).join('') + '</div>').join('') + '</div>';
}
function learn(id) { S.skills = S.skills || {}; S.skills[id] = Date.now(); saveS(); refreshGear(); abilitiesInit(); hud(); beep(784, .12, 'triangle', .05); beep(1175, .2, 'triangle', .05, .1); }

// ---------- ambience: clouds, fireflies, steam, wet reflections, color grade ----------
let AMB = { grass: [], holes: [] };
function ambienceInit() {
  AMB = { grass: [], holes: [], water: [], puddles: [] }; if (!W || W.inside) return;
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const v = W.at(x, y); if (v === T.GRASS && (x * 7 + y * 13) % 5 === 0) AMB.grass.push([x + .5, y + .5, Math.random() * 9]); if (v === T.ROAD && x % 11 === 1 && y % 11 === 6) AMB.holes.push([x + .5, y + .5]); if (v === T.WATER && (x + y * 3) % 2 === 0) AMB.water.push([x, y]); if ((v === T.ROAD || v === T.LOT || v === T.WALK) && ((x * 92821) ^ (y * 68917)) % 23 === 0) AMB.puddles.push([x + .3 + ((x * 7) % 5) / 12, y + .3 + ((y * 11) % 5) / 12, .6 + ((x + y) % 4) / 6]); }
}
function ambienceGround() { if (inside) return; const z = cam.z * dpr, hw = cv.width / 2 / z + 40, hh = cv.height / 2 / z + 40; AMB.holes.forEach((h) => { const q = h._iso || (h._iso = iso(h[0], h[1])), sx = q[0], sy = q[1]; if (sx < cam.x - hw || sx > cam.x + hw || sy < cam.y - hh || sy > cam.y + hh) return; ctx.drawImage(MANHOLE || (MANHOLE = manholeSprite()), sx - 10, sy - 5.5, 20, 11); }); }
let MANHOLE = null;
function manholeSprite() { const [c, g] = hiCanvas(20, 11, 3); g.fillStyle = '#2b3038'; g.beginPath(); g.ellipse(10, 5.5, 9, 4.5, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#4a515c'; g.lineWidth = 1; g.stroke(); return c; }
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
  if (!inside) { const z = cam.z * dpr, hw = cv.width / 2 / z + 60, hh = cv.height / 2 / z + 80; AMB.holes.forEach((h, k) => { if (k % 2) return; const q = h._iso || (h._iso = iso(h[0], h[1])), sx = q[0], sy = q[1]; if (sx < cam.x - hw || sx > cam.x + hw || sy < cam.y - hh || sy > cam.y + hh) return;
    if (k % 2 === 0) for (let i = 0; i < 4; i++) { const a = ((now / 2600 + i / 4 + k * .17) % 1), r = 5 + a * 12; ctx.fillStyle = 'rgba(230,236,245,' + (.22 * (1 - a)) + ')'; ctx.beginPath(); ctx.arc(sx + Math.sin(a * 6 + i) * 6, sy - a * 46, r, 0, Math.PI * 2); ctx.fill(); } }); }
}
function ambienceGlow(glow, now) { // additive pass at night
  const h = hourNow(), night = h >= 19.5 || h < 5.5;
  if (night && !inside) AMB.grass.forEach(([x, y, ph]) => { const t = now / 1000 + ph, fx = x + Math.sin(t * .7) * .6, fy = y + Math.cos(t * .5) * .6, [ix, iy] = iso(fx, fy), on = (Math.sin(t * 2.3) + 1) / 2; if (on > .45) glow(ix, iy - 14 - Math.sin(t) * 6, 6 + on * 4, 'rgba(210,255,120,' + (.35 * on) + ')'); });
  if (FX.rain && !inside) lightProps().forEach((p) => { if (p.t !== 'lamp' || !p.on) return; const q = isoC(p), ix = q[0], iy = q[1]; glow(ix + 10, iy + 10, 22, 'rgba(255,214,150,.22)'); glow(ix + 10, iy + 26, 14, 'rgba(255,214,150,.14)'); });
}
// the grade and the sun bloom are smooth gradients that only change with the hour band, so they are painted once at
// half resolution and stamped onto each frame (the same look, without re-rasterising two gradients every frame)
const GRADEC = new Map();
function gradeLayer(key, w, h, paint) { let c = GRADEC.get(key); if (!c) { if (GRADEC.size > 12) GRADEC.clear(); c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w / 2)); c.height = Math.max(1, Math.ceil(h / 2)); const g = c.getContext('2d'); g.scale(.5, .5); paint(g, w, h); GRADEC.set(key, c); } return c; }
function grade(dk) { // screen-space color grade by time of day
  if (S.cfg.quality === 'low') return;
  const h = hourNow(), W0 = cv.width, H0 = cv.height, ultra = S.cfg.quality === 'ultra'; ctx.setTransform(1, 0, 0, 1, 0, 0);
  const band = h >= 6 && h < 8.5 ? 0 : h >= 8.5 && h < 16.5 ? 1 : h >= 16.5 && h < 19.5 ? 2 : 3;
  const gl = gradeLayer('g' + band + ultra + W0 + 'x' + H0, W0, H0, (g) => { const gr = g.createLinearGradient(0, 0, 0, H0);
    if (band === 0) { gr.addColorStop(0, 'rgba(255,170,120,.16)'); gr.addColorStop(1, 'rgba(255,220,180,0)'); }
    else if (band === 1) { gr.addColorStop(0, 'rgba(255,240,210,.07)'); gr.addColorStop(1, 'rgba(120,170,255,.05)'); }
    else if (band === 2) { gr.addColorStop(0, 'rgba(255,110,90,.16)'); gr.addColorStop(1, 'rgba(255,170,90,.08)'); }
    else { gr.addColorStop(0, 'rgba(40,70,160,.12)'); gr.addColorStop(1, 'rgba(10,20,60,.06)'); }
    if (!ultra) g.globalAlpha = .55; g.fillStyle = gr; g.fillRect(0, 0, W0, H0); });
  if (ultra) ctx.globalCompositeOperation = 'soft-light'; ctx.drawImage(gl, 0, 0, W0, H0); ctx.globalCompositeOperation = 'source-over';
  if (inside) return;
  const night = h >= 19.5 || h < 5.5, day = h >= 8 && h < 17;
  if (night) { ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,.28)'; ctx.fillRect(0, 0, W0, H0); ctx.globalCompositeOperation = 'source-over'; }
  else if (day) { // the sun sits up and to the left; a soft warm bloom from that corner
    const bl = gradeLayer('b' + (FX.rain ? 1 : 0) + W0 + 'x' + H0, W0, H0, (g) => { const sg = g.createRadialGradient(W0 * .1, -H0 * .1, 0, W0 * .1, -H0 * .1, Math.max(W0, H0) * .9);
      sg.addColorStop(0, 'rgba(255,236,190,' + (FX.rain ? .04 : .14) + ')'); sg.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = sg; g.fillRect(0, 0, W0, H0); });
    ctx.globalCompositeOperation = 'screen'; ctx.drawImage(bl, 0, 0, W0, H0); ctx.globalCompositeOperation = 'source-over';
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
  cam.z = cam.zUser = innerWidth < 600 ? .8 : 1.05; attT = 0; ambienceInit();
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
let trackToast = 0; music.onTrack = (name, id) => { if (id === 'orig' || !S.sound || (S.cfg && S.cfg.nowPlaying === false)) return; const n = performance.now(); if (n - trackToast < 180000) return; trackToast = n; setTimeout(() => { if (!scene && !storyBusy && !call) toast('🎵 ' + name); }, 2500); };
// browsers only let audio start from a tap or key press: every tap makes sure the music is actually running
// (this also wakes it after the phone locks or the tab goes to the background)
['pointerdown', 'touchend', 'keydown'].forEach((ev) => addEventListener(ev, () => { if (!S.sound) return; const a = audio(); if (!a) return; if (a.state !== 'running' && a.resume) { try { const r = a.resume(); if (r && r.catch) r.catch(() => {}); } catch (e) {} } if (!music.mood) { try { music.volume(S.cfg ? S.cfg.music : .8); music.start(ATTRACT ? 'title' : moodNow()); } catch (e) {} } }, { passive: true, capture: true }));
document.addEventListener('visibilitychange', () => { if (document.hidden || !S.sound || !AC) return; if (AC.state !== 'running' && AC.resume) AC.resume().catch(() => {}); });
let musT = 0;
function moodNow() {
  if (ATTRACT) return 'title';
  if (POLMOOD) return POLMOOD;
  if (document.body.classList.contains('cine')) { if (DLGMOOD) return DLGMOOD; const A = activeQ(); return A && A.side ? 'side' : 'story'; }
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
cv.addEventListener('wheel', (e) => { e.preventDefault(); setZoom(cam.zUser * (e.deltaY < 0 ? 1.1 : .9)); }, { passive: false });
// pinch and the mouse wheel follow the fingers exactly; the + and - buttons glide
function setZoom(z, glide) { cam.zUser = Math.max(.45, Math.min(2.2, z)); S.zoom = cam.zUser; if (!glide && !CINE.on) cam.z = cam.zUser * (cam.zMul || 1); }
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
    for (const st of W.staff) if (near(st.x, st.y, 30)) return reach(st.x, st.y + 1, () => { if (st.npc) return npcTalk({ n: st.npc, x: st.x, y: st.y }); const L2 = STAFF_LINES(W.key), sw = STAFF_WHO[W.key] || ['Employee', '🙂'], id = sayAs('staff', { name: st.name || sw[0], icon: st.icon || sw[1], role: st.role || W.name }); if (!st.talked) { st.talked = true; award(3, 'small talk'); }
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
addEventListener('keydown', (e) => { if (scene || paused || ATTRACT || e.target.closest('input,textarea')) return; POL.onKey(e); });
function enterCar() { P.inCar = true; P.x = pcar.x; P.y = pcar.y; const ok = ridePass(), r = nearest(Math.floor(P.x), Math.floor(P.y), (x, y) => ok(x, y)); if (r) { P.x = r[0] + .5; P.y = r[1] + .5; } toast(RIDE() === 'car' ? 'In your ' + U().ride.label.toLowerCase() + '. Tap the road to drive; lights and siren come on when you respond to a call.' : RIDE() === 'moto' ? 'On the police motorcycle. Fast and nimble, roads only.' : RIDE() === 'bike' ? 'On the patrol bike. Sidewalks, parks and plazas are all yours.' : 'Mounted up on Judge II. People love the horse. Parks and sidewalks are fine.'); hud(); }
function enterBoat() { if (!pboat) return; stat('boat'); P.boat = true; P.x = pboat.x; P.y = pboat.y; P.path = []; toast('Patrol boat launched. Tap the water to move; tap the shore to dock.'); hud(); }
function exitBoat() { if (!P.boat) return; P.boat = false; P.path = []; pboat.x = P.x; pboat.y = P.y; const r = nearest(Math.floor(P.x), Math.floor(P.y), (x, y) => W.at(x, y) === T.SAND); if (r) { P.x = r[0] + .5; P.y = r[1] + .5; pboat.dock = [P.x, P.y]; } hud(); }
function exitCar() { if (!P.inCar) return; P.inCar = false; P.path = []; pcar.x = P.x; pcar.y = P.y; const r = nearest(Math.floor(P.x), Math.floor(P.y), (x, y) => W.walkable(x, y) && W.at(x, y) !== T.ROAD); if (r) { P.x = r[0] + .5; P.y = r[1] + .5; } hud(); }

// ---------- learning scenes ----------
function openModal(html) { const m = $('modal'); if (m.hidden && typeof FEEL !== 'undefined' && S.sound) FEEL.UI.open(); m.innerHTML = '<div class="mBox">' + html + '</div>'; m.hidden = false; paused = false; }
function closeModal() { if (!$('modal').hidden && typeof FEEL !== 'undefined' && S.sound) FEEL.UI.close(); $('modal').hidden = true; scene = null; }
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
  const before = L.rankOf(S.xp).name; const sqm = squadMult(); if (sqm > 1) { stat('sqRP', Math.round(xp * (sqm - 1))); } xp = Math.round(xp * comboMult() * sqm * LIFE.rpMult() * OFF.rpMult() * (P.inCar && RIDE() === 'horse' ? 1.03 : 1)); S.cash = (S.cash || 0) + Math.round(xp * .4); S.xp += xp; if (CITY) { if (/\bpt\b|pt test|workout|cadence/i.test(why || '')) CITY.onPT(xp); if (/new place|overlook|exploration/i.test(why || '')) CITY.beatAdd('explore', 1); if (/small talk|citizen contact/i.test(why || '')) CITY.beatAdd('talk', 1); } if (REW) { REW.onAward(xp, why); if (/citizen contact|small talk|call cleared|co-op call/i.test(why || '')) REW.rumor(); } SS.rp += xp; POL.seasonXP(xp); ACAD.weekAdd('rp', xp); const after = L.rankOf(S.xp).name; saveS(); hud();
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
// a speaker can carry the exact look they have in the street, so the dialogue portrait is the same person you walked up to
const PLOOK = {};
const sayAs = (id, o) => { TEMP[id] = { name: o.name, icon: o.icon || '💬', role: o.role || '' }; if (o.look) PLOOK[id] = o.look; else delete PLOOK[id]; return id; };
// who calls depends on where the call is: residents at homes, staff at businesses, workers at the yards
// the person you meet inside a place, when they aren't a named regular
const STAFF_WHO = { houses: ['Homeowner', '🏡'], apartments: ['Building manager', '🔧'], church: ['Church volunteer', '⛪'], school: ['Front office', '🏫'], hq: ['Desk sergeant', '🗂️'], substation: ['Duty officer', '🚓'], dispatch: ['Dispatcher', '🎧'], records: ['Records clerk', '📁'], bank: ['Teller', '💵'], diner: ['Waitress', '☕'], store: ['Store clerk', '🧾'], gas: ['Night clerk', '🧾'], pawn: ['Pawn clerk', '💍'], motel: ['Front desk', '🛎️'], autoshop: ['Mechanic', '🔧'], firestation: ['Firefighter', '🧑‍🚒'], warehouse: ['Shift supervisor', '📦'], storage: ['Rental clerk', '🔐'], courthouse: ['Court clerk', '🗂️'], jail: ['Booking deputy', '🧾'], office: ['Receptionist', '📞'] };
const CALLER_BY = {
  houses: [['Homeowner', '🏡'], ['Neighbor', '🏠'], ['Resident', '🚪']], apartments: [['Tenant', '🧑'], ['Neighbor', '🏠'], ['Building manager', '🔧']],
  shop: [['Store owner', '🛒'], ['Store clerk', '🧾'], ['Customer', '🛍️']], pharmacy: [['Pharmacist', '💊'], ['Store clerk', '🧾']], mall: [['Store manager', '🛍️'], ['Mall security', '🛡️'], ['Shopper', '👜']],
  gas: [['Night clerk', '🧾'], ['Customer', '⛽']], diner: [['Manager', '🍳'], ['Waitress', '☕'], ['Customer', '🍽️']], cafe: [['Barista', '☕'], ['Customer', '💻']], pizza: [['Owner', '🍕'], ['Delivery driver', '🛵']],
  barber: [['Barber', '✂️'], ['Customer', '💈']], nails: [['Salon owner', '💅'], ['Customer', '💁']], books: [['Bookseller', '📖']], laundromat: [['Attendant', '🧺'], ['Customer', '🧦']], carwash: [['Car wash attendant', '🫧']],
  autoshop: [['Service manager', '📋'], ['Mechanic', '🔧']], pawn: [['Pawn clerk', '💍']], bank: [['Bank manager', '💵'], ['Teller', '🧾']], motel: [['Night manager', '🛎️'], ['Guest', '🧳']], bait: [['Bait shop clerk', '🎣']],
  truckstop: [['Truck stop manager', '🍳'], ['Trucker', '🚚']], warehouse: [['Shift supervisor', '📦'], ['Security guard', '🔦'], ['Dock worker', '🚛']], lumber: [['Yard foreman', '🪵'], ['Security guard', '🔦']],
  storage: [['Rental clerk', '🔐'], ['Unit renter', '📦']], scrapyard: [['Scale operator', '⚖️'], ['Yard worker', '🦺']], railyard: [['Rail worker', '🚂'], ['Rail security', '🔦']],
  school: [['Principal', '🏫'], ['Teacher', '🍎'], ['School resource officer', '🛡️']], church: [['Pastor', '⛪'], ['Volunteer', '🥫']], center: [['Program director', '📣'], ['Youth coach', '🏀']],
  park: [['Park ranger', '🌲'], ['Witness', '👀'], ['Jogger', '🏃']], plaza: [['Witness', '👀'], ['Vendor', '🌭']], stadium: [['Stadium security', '🛡️'], ['Usher', '🎟️']], marina: [['Dock hand', '⚓'], ['Boat owner', '🛥️']],
  parking: [['Lot attendant', '🅿️'], ['Car owner', '🚗'], ['Witness', '👀']], lot: [['Property owner', '📋'], ['Witness', '👀']], library: [['Librarian', '📚']], transit: [['Station agent', '🎟️'], ['Bus driver', '🚌']],
  clinic: [['Nurse', '🩺'], ['Front desk', '📋']], gym: [['Gym owner', '🥊']], tower: [['Building security', '🛡️'], ['Office manager', '🏢']], office: [['Receptionist', '📞'], ['Office manager', '💼']],
  courthouse: [['Court deputy', '🛡️'], ['Clerk', '🗂️']], records: [['Records clerk', '📁']], bonds: [['Bail agent', '📄']], defender: [['Investigator', '🔎']], farm: [['Farmer', '🌾']], woods: [['Hiker', '🥾'], ['Neighbor', '🏠']],
  firestation: [['Fire captain', '🧑‍🚒']], jail: [['Booking deputy', '🧾']], sallyport: [['Transport deputy', '🚐']],
  garage: [['Garage attendant', '🅿️'], ['Car owner', '🚗']], radio: [['Radio technician', '📡']], dispatch: [['Dispatcher', '🎧']], hq: [['Desk sergeant', '🗂️']], substation: [['Duty officer', '🚓']],
  street: [['Caller', '📞'], ['Witness', '👀'], ['Passerby', '🚶'], ['Driver', '🚗']]
};
const CALLER = CALLER_BY.street, callerFor = (c) => rnd(CALLER_BY[c.kind] || ((LANDMARKS[c.kind] || {}).name ? [['Manager', '📋'], ['Employee', '🧾']] : CALLER));
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
  const lk0 = n.look || {}, look = n.cat ? { cat: true } : { kit: n.kit || npcKit(lk0), hair: n.hair || lk0.hair, skin: n.skin || lk0.skin, ph: r.ph };
  const id = NPCS.find((x) => x.id === n.id) ? n.id : sayAs('reg_' + n.id, { name: n.name, icon: n.icon, role: n.role, look }); PLOOK[id] = look;
  const tier = f >= 6 ? 'best friends' : f >= 3 ? 'friends' : f >= 1 ? 'knows your name' : 'stranger';
  const mem = (TALE_MEMORY[n.id] || []).filter(([w]) => w.slice(0, 5) === 'side:' ? sideClosed(sideQ(w.slice(5)) || {}) : w.slice(0, 5) === 'main:' ? (S.story[+w.slice(5)] || 0) >= CHAPTERS[+w.slice(5)].steps.length : !!S.flags[w.slice(5)]), line = mem.length && (first || Math.random() < .4) ? mem[(S.calls || 0) % mem.length][1] : n.lines[(f + (S.calls || 0)) % n.lines.length], helped = talkedNow[n.id] === 2;
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
  dialogue([[id, n.cat ? '(Exhibit A regards you from a sunny spot.)' : f >= 3 ? rnd(['There\'s my favorite cadet!', 'Hey, you! Come here, come here.', 'Look who it is.']) : f >= 1 ? rnd(['Oh, hey. Back again?', 'Cadet! Good to see you.']) : rnd(['Can I help you, officer?', 'Oh! Hello there.', 'Afternoon, officer.'])], ['choice', opts, (f > 0 ? '💛'.repeat(Math.min(6, f)) + '  ' : '') + n.name + ' · ' + tier.charAt(0).toUpperCase() + tier.slice(1)]], () => sceneEnd('npc'), { focus: [r.x || P.x, r.y || P.y], kicker: n.name.toUpperCase() + ' · ' + (n.role || '').toUpperCase() });
}
function nearestLotTo(x, y) { let best = null, bd = 1e9; (inside ? inside.O.W : W).lots.forEach((l) => { if (!l.name) return; const d = Math.hypot(l.door[0] - x, l.door[1] - y); if (d < bd) { bd = d; best = l.name; } }); return best; }
// calls: dispatch, arrival, your approach, the people on scene, then how you wrap it up
function openCallScene(c) { openCallSceneQ(c); }
function openCallSceneQ(c) {
  if (net) net.status('call'); paused = true;
  const n = 3, qs = L.pickFacts(S, [c.les], n), fast = clock - c.t0 < 40 * (hasSk('pat2') ? 1.5 : 1), a = approachFor(c.les), cl = callerFor(c), cid = sayAs('caller', { name: cl[0], icon: cl[1], role: c.where });
  const lines = [['narr', c.title + '. ' + c.where + '.'], ['velvet', '(over the radio) ' + S.cs + ', you\'re on scene. ' + c.text]];
  const cover = c.cover || (COVER && Date.now() - COVER.t < 180000 ? COVER.c : null); c.coop = cover;
  if (cover) lines.push(['castillo', '(over the radio) ' + cover + ' is on scene as your cover. Contact and cover, like we drilled it: you make contact and do the talking, they watch hands, exits and the crowd.'], ['choice', [
    { t: 'Signal your cover, then make contact', ok: 1, reply: [['narr', 'A nod. ' + cover + ' takes a position with a clear view of the caller\'s hands and the street.'], ['castillo', '(over the radio) Textbook.']] },
    { t: 'Both of you talk to the caller at once', reply: [['narr', 'Two officers talking over each other. Nobody is watching the street.'], ['castillo', '(over the radio) One talks, one watches. Reset.']] },
    { t: 'Send your cover to search the area alone', reply: [['narr', cover + ' heads off. Now nobody is covering you.'], ['castillo', '(over the radio) Cover stays with contact. Pull them back.']] }].sort(() => Math.random() - .5), 'Your cover officer is waiting for a signal.']);
  { const rv = EP.rivalCameo(); if (rv) lines.push(rv); const tr = NG.cameo(); if (tr) lines.push(tr); }
  if (a) lines.push(['choice', a.opts, a.q]);
  if (/warrant|arrest/i.test(c.title)) arrestLines(c).forEach((x) => lines.push(x));
  if (c.open === 'assess') lines.push(['narr', 'You stop short of the door and take in the whole scene: exits, hands, who is watching.']); else if (c.open === 'id') lines.push(['narr', 'You ask for ID up front. The caller fumbles for a wallet, then hands it over.']);
  lines.push([cid, rnd(['Officer! Over here. Thank goodness.', 'You got here fast. Okay, here\'s what happened.', 'I\'m the one who called. It\'s been a whole thing.', 'Finally. Let me tell you what I saw.'])]);
  PREM.threadLines(c, 'velvet').forEach((x) => lines.push(x));
  qs.forEach((q, k) => { lines.push(['q', q, k % 2 ? 'castillo' : cid]); if (k === 0 && qs.length > 2) lines.push(['choice', [
    { t: 'Keep the scene calm and explain each step', eff2: 'calm', trust: 1, reply: [[cid, 'Okay. Okay, thank you for telling me what\'s happening.']] },
    { t: 'Stay focused and keep it brief', eff2: 'brief', reply: [[cid, 'Sure. Right. Whatever you need.']] },
    { t: 'Ask if anyone else saw what happened', eff2: 'canvass', reply: [[cid, 'The lady in the blue house was outside. She might know more.']], fx: () => { const z = newCitizen(); z.les = c.les; citizens.push(z); } }], 'Everyone is watching how you handle this.']); });
  lines.push(['choice', [
    { t: 'Give them a case number and your contact info', trust: 1, reply: [[cid, 'A case number. Okay. I feel better knowing someone wrote it down.']], fx: () => { c.wrap = 'case'; } },
    { t: 'Point them to resources that can help next time', reply: [[cid, 'I didn\'t know half of that existed. Thank you.']], fx: () => { c.wrap = 'resources'; } },
    { t: 'Clear the scene and get back in service', reply: [[cid, 'Oh. Okay. Bye, then.']], fx: () => { c.wrap = 'quick'; nextCall = Math.max(8, nextCall - 10); } }], 'How do you wrap it up?']);
  dialogue(lines, (res) => {
    if (c.backup && net) { net.backup(null); c.backup = false; }
    if (c.sq) { try { c.sq(); } catch (e) {} } COOP.dgAdd(); CITY.beatAdd('calls', 1); if (c.thread && c.threadOk) CITY.openCase(c.thread, c.where); const cov = COVER && COVER.uid ? COVER : null; COOP.coopEnd(); if (cov) setTimeout(() => COOP.commendPrompt(cov.uid, cov.c, 'your cover officer'), 6000); setTimeout(() => toast(COOP.dgLine()), 3500);
    paused = false; const eff = (res.choices.find((o) => o.eff) || {}).eff; c.eff = eff; if (eff) consequence(eff, c);
    const r = { right: res.right, n: res.n };
    S.calls++; SS.calls++; NG.callCleared(); stat('p' + c.prio); if (inside) stat('inCall'); if (NIGHT) stat('nightCalls'); const effM = (APPROACH_BONUS[c.eff] || 1) * ((APPROACH_BONUS[c.eff] || 1) > 1 && hasSk('tac2') ? 1.15 : 1) * (c.prio === 1 && hasSk('tac4') ? 1.25 : 1); ord('call'); if (c.prio === 1) ord('pri1'); const mult = callMult(c) * effM * EP.callMult() * NG.mult() * (hasSk('pat3') && EP.repOf(W.did).idx >= 2 ? 1.1 : 1), xp = Math.round((r.right * 25 + (fast ? 15 : 0) + (r.right === r.n ? 20 : 0) + (c.wrap === 'case' || c.wrap === 'resources' ? 10 : 0)) * mult); S.trust[W.did] = Math.max(0, Math.min(100, (S.trust[W.did] || 50) + (r.right - (r.n - r.right)) * (S.unit === 'brt' && (c.les === 9 || c.les === 10) ? 2 : 1)));
    const coopOk = c.coop && res.choices.some((o) => o.ok), xpT = Math.round(xp * (coopOk ? 1.25 * (hasSk('pat4') ? 1.15 : 1) : 1)); if (FX.storm) stat('stormCall'); EP.squadCall(); if (c.coop) { stat('coop'); if (coopOk) stat('coopGood'); }
    const more = [c.posRow, PREM.threadDone(c), c.procOk != null ? ['🔗', 'Procedure', Math.round(c.procOk / 3 * 10), 10, c.procOk + ' of 3 arrest steps by the book'] : null].filter(Boolean); PREM.helped(c); PREM.seedThread(c);
    const report = (go) => (PREM.needsReport(c) ? PREM.report(c, (row) => go([row])) : go([]));
    EP.afterCall(c, (extra0) => report((rr) => POL.debrief({ extra: (extra0 || []).concat(more, rr), title: c.title, where: c.where, prio: c.prio, right: r.right, n: r.n, fast, resp: (clock - c.t0), approach: !a ? undefined : !c.eff ? null : (APPROACH_BONUS[c.eff] || 1) > 1 ? 'good' : 'ok', wrap: c.wrap, calm: res.choices.some((o) => o.eff2 === 'calm'), qs: res.qs || [], coop: coopOk ? c.coop : null, xp: xpT, role: c.coop ? 'Contact officer' : '' }, () => { closeModal(); radio(S.cs, 'Clear, back in service.'); award(Math.round(xpT * CITY.beatMult(c)), c.coop ? 'co-op call cleared' : 'call cleared'); queueLoot('Found on scene: ' + c.title, r.right === r.n ? .6 : .3); nextCall = (25 + Math.random() * 25) * (S.unit === 'patrol' ? .75 : 1); if (net) net.backup(null); COVER = null; })));
  }, { focus: [c.x, c.y], kicker: (c.prio === 1 ? 'PRIORITY 1' : c.prio === 2 ? 'PRIORITY 2' : 'ROUTINE') + ' · ' + c.where.toUpperCase(), onLeave: () => { leaveDefault(); c.accepted = true; call = c; callCard(); } });
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
  const q = L.pickFacts(S, [c.les], 1)[0], id = sayAs('cit', { look: Object.assign({}, c, { moving: false, path: null, x: 0, y: 0 }), name: rnd(['Curious resident', 'Local business owner', 'Commuter', 'College student', 'Retired teacher']), icon: rnd(['🙋', '🧑‍💼', '🧑‍🎓', '👵', '🧔']), role: 'Has a question' });
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
  if (net) net.assist(uid); stat('assists'); if (S.squad && others[uid] && others[uid].g === S.squad.code) stat('sqAssist'); COOP.coopStart(uid, 'cover'); COOP.ptAdd(uid, 10);
  dialogue([[id, '(over the radio) ' + S.cs + ', glad you\'re here. ' + (o.b.l || 'Need a second set of eyes.')], ['choice', [
    { t: 'Take a cover position with a clear view of the hands', ok: 1, reply: [[id, 'Copy, you\'re cover. I\'ll make contact.']] },
    { t: 'Walk up and start asking the caller questions too', reply: [[id, 'Hey, I\'ve got the talking. I need your eyes out.'], ['castillo', '(over the radio) Cover doesn\'t talk over contact. Watch the scene.']] },
    { t: 'Stand right behind your partner', reply: [[id, 'Give me some space. If you\'re behind me you can\'t see what I can\'t.'], ['castillo', '(over the radio) Cover takes an angle, not a shadow.']] }].sort(() => Math.random() - .5), 'You\'re the cover officer. Where do you set up?'],
    ['narr', 'Contact and cover: one officer makes contact and does the talking, the other watches hands, exits and the crowd. Training call, sim rules.'],
    ['q', qs[0], id], ['q', qs[1], 'castillo']], (r) => { if (net) net.assist(null); COOP.coopEnd(); setTimeout(() => { COOP.commendPrompt(uid, o.c, 'you backed them up'); if (COOP.aid) COOP.aidDone(); }, 2500); stat('coop'); const ok = r.choices.some((x) => x.ok); if (ok) stat('coopGood');
      POL.debrief({ title: 'Backup: ' + (o.b.l || 'cover officer'), where: W.D.name, prio: 2, right: r.right, n: r.n, fast: true, resp: 0, approach: ok ? 'good' : null, wrap: 'case', calm: ok, qs: r.qs || [], coop: ok ? o.c : null, xp: Math.round((20 + r.right * 15) * (ok ? 1.25 : 1)), role: 'Cover officer' }, () => { closeModal(); award(Math.round((20 + r.right * 15) * (ok ? 1.25 : 1)), 'co-op backup'); });
    }, { focus: [o.b.x, o.b.y], kicker: 'CO-OP TRAINING · COVER OFFICER' });
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
// fact drill: Navarro runs open facts with you, three at a time
function factDrill() {
  const qs = L.pickFacts(S, W.D.lessons, 3), id = 'navarro';
  dialogue([[id, rnd(['Okay. Flashcards. Real ones, not the ones Pike drew on.', 'Fact drill. True or false, fast. I timed myself last night. Don\'t ask.', 'Let\'s knock out some facts. You\'ll thank me at the Final Call.'])]].concat(qs.map((q) => ['q', q, id])).concat([['fx', () => {}]]), (r) => {
    const fp = L.districtMastery(S, W.did).facts; award(r.right * 6, 'fact drill'); ord('study', 1);
    dialogue([[id, r.right + ' of ' + r.n + '. ' + (fp.done >= fp.total ? 'That\'s every fact in ' + W.D.name + '. The Final Call is open. Go.' : (fp.total - fp.done) + ' facts left in ' + W.D.name + '. Same time tomorrow?')]], null, { focus: [P.x, P.y] });
  }, { focus: [P.x, P.y], kicker: 'FACT DRILL · ' + W.D.name.toUpperCase() });
}
// the District Final Call: a major incident built from this district's facts. Pass to transfer.
// long interactions come in short stages of at most three questions. Between stages you can keep going or step
// away; the run is saved and picks up at the same stage next time
function stagedRun(key, cfg) {
  S.runs = S.runs || {}; const per = 3, stages = Math.ceil(cfg.total / per); let run = S.runs[key];
  const kick = (i) => cfg.kicker + ' · STAGE ' + (i + 1) + ' OF ' + stages;
  const stage = (first) => {
    const i = run.stage, k = Math.min(per, cfg.total - i * per), qs = cfg.pick(k); paused = true;
    const lines = (first ? cfg.intro(run, stages) : []).concat(cfg.beat ? cfg.beat(i, stages) : []).concat(qs.map((q, j) => ['q', q, cfg.speakers[(i * per + j) % cfg.speakers.length]]));
    dialogue(lines, (r) => {
      run.right += r.right; run.n += r.n; run.stage++; saveS();
      if (run.stage >= stages) { delete S.runs[key]; saveS(); paused = false; cfg.done({ right: run.right, n: run.n }); return; }
      dialogue([['choice', [{ t: 'Keep going: stage ' + (run.stage + 1) + ' of ' + stages, go: 1, reply: [] }, { t: 'Step away for now (progress is saved)', reply: [] }], run.right + ' of ' + run.n + ' by the book so far']], (r2) => {
        if (r2.choices[0] && r2.choices[0].go) stage(false); else { paused = false; toast('💾 Saved at stage ' + (run.stage + 1) + ' of ' + stages + '. Pick it up anytime.'); }
      }, { focus: [P.x, P.y], kicker: kick(run.stage), noFollow: true, onLeave: () => { leaveDefault(); } });
    }, { focus: [P.x, P.y], kicker: kick(i), onLeave: () => { leaveDefault(); toast('💾 Saved at stage ' + (run.stage + 1) + ' of ' + stages + '.'); } });
  };
  const fresh = () => { run = S.runs[key] = { stage: 0, right: 0, n: 0, t: Date.now() }; saveS(); stage(true); };
  if (run && run.stage > 0 && run.stage < stages) { paused = true; dialogue([['choice', [{ t: 'Resume at stage ' + (run.stage + 1) + ' of ' + stages + ' (' + run.right + ' of ' + run.n + ' so far)', go: 1, reply: [] }, { t: 'Start over from stage 1', reply: [] }], cfg.kicker]], (r) => { if (r.choices[0] && r.choices[0].go) stage(true); else fresh(); }, { focus: [P.x, P.y], kicker: cfg.kicker }); }
  else fresh();
}
// the District Final Call: a major incident built from this district's facts, played in five short stages
const FINAL_BEATS = [['narr', 'Staging. Units pull up two blocks out and wait for a plan.'], ['narr', 'The perimeter goes up. Tape, cones, a lane closed.'], ['narr', 'Contact. Someone at the scene wants to talk, right now.'], ['narr', 'Evidence and witnesses. Nobody leaves without a name.'], ['narr', 'Wrap-up. Command wants it by the book before anyone clears.']];
function finalCall() {
  const m = L.districtMastery(S, W.did); if (!m.ready) { toast('Complete every fact in ' + W.D.name + ' first (' + m.facts.done + '/' + m.facts.total + ').'); return; }
  const nx = (W.did + 1) % 5, cid = sayAs('ic', { name: 'Incident Command', icon: '🛡️', role: W.D.name + ' · Final Call' }), did = W.did;
  music.set && music.start('urgent');
  stagedRun('final' + did, { total: 15, kicker: 'DISTRICT FINAL CALL · ' + W.D.name.toUpperCase(), speakers: ['castillo', 'okonkwo', cid], pick: (k) => L.pickFacts(S, W.D.lessons, k, { exam: true }),
    intro: (run, n) => [['narr', 'Major incident. ' + W.D.name + '. Every unit in the district is rolling.'], ['okonkwo', '(over the radio) ' + S.cs + ', this is your Final Call. Everything you learned in ' + W.D.name + '. ' + n + ' short stages, three questions each. Thirteen of fifteen by the book and you transfer out.'],
      ['choice', [{ t: 'Copy. Show me the scene.', reply: [['castillo', 'Breathe. Slow is smooth. Smooth is fast.']] }, { t: 'Request a moment to check my notes', reply: [['navarro', '(over the radio) You know this. You did every fact. Go.']] }], 'Ready?']],
    beat: (i) => [FINAL_BEATS[i % FINAL_BEATS.length]],
    done: (r) => {
      const pass = r.right / r.n >= 13 / 15 - 1e-9; if (pass) { if (!S.cleared.includes(did)) S.cleared.push(did); if (!S.unlocked.includes(nx)) S.unlocked.push(nx); stat('finals'); } saveS();
      const allDone = S.cleared.length >= 5;
      openModal('<div class="sceneHead ' + (pass ? 'done' : 'p1') + '"><b>' + (pass ? 'DISTRICT CLEARED · TRANSFER APPROVED' : 'FINAL CALL · NOT YET') + '</b><h2>' + r.right + ' of ' + r.n + ' by the book</h2><p>' + (pass ? (allDone ? 'Every district cleared. The Chapter 5 Final Exam is open on the City map.' : 'Transfer orders are signed: ' + esc(DISTRICTS[nx].name) + ' is open. ' + esc(DISTRICTS[nx].unit) + '.') : 'You need 13 of 15. Review the facts you missed and come back.') + '</p></div><div class="qAct">' + (pass && !allDone ? '<button type="button" id="mGo">Transfer to ' + esc(DISTRICTS[nx].name) + '</button>' : '') + '<button type="button" class="' + (pass && !allDone ? 'ghost' : '') + '" id="mDone">' + (pass && !allDone ? 'Stay in ' + esc(W.D.name) + ' for now' : 'Back to patrol') + '</button></div>');
      if (pass) { good(); music.sting('promo'); shake(6, .5); }
      $('mDone').onclick = () => { closeModal(); award(pass ? 300 : 40, pass ? 'district cleared' : 'final call attempt'); if (pass) queueLoot('District cleared: ' + W.D.name, 1, 'r'); };
      if ($('mGo')) $('mGo').onclick = () => { closeModal(); award(300, 'district cleared'); queueLoot('District cleared: ' + W.D.name, 1, 'r'); S.home = nx; saveS(); clock = 0; travel(nx); };
    } });
}
// after all five districts: the Chapter 5 Final Exam, facts from the whole chapter, 85% to pass, in stages of three
function chapterExam() {
  const all = [0, 1, 2, 3, 4].flatMap((d) => DISTRICTS[d].lessons); music.start('story');
  stagedRun('exam', { total: 50, kicker: 'CHAPTER 5 FINAL EXAM', speakers: ['castillo', 'okonkwo', 'navarro'], pick: (k) => L.pickFacts(S, all, k, { exam: true }),
    intro: (run, n) => [['narr', 'Patrol HQ, the training room. Fifty facts from the whole chapter.'], ['castillo', 'This is the whole chapter, cadet. Eighty-five percent. Three at a time; take a break between rounds whenever you need one. Your score keeps.'], ['choice', [{ t: 'Ready.', reply: [] }, { t: 'Give me a second.', reply: [['castillo', 'Take two. Then we start.']] }], 'Chapter 5 Final Exam']],
    done: (r) => {
      const pass = r.right / r.n >= .85; if (pass) { S.graduated = Date.now(); stat('exam'); } saveS();
      openModal('<div class="sceneHead ' + (pass ? 'done' : 'p1') + '"><b>' + (pass ? 'CHAPTER 5 · PASSED' : 'CHAPTER EXAM · NOT YET') + '</b><h2>' + r.right + ' of ' + r.n + ' (' + Math.round(r.right / r.n * 100) + '%)</h2><p>' + (pass ? 'Every district, every fact, and the whole chapter on one exam. Port Meridian is proud of you.' : 'You need 85%. Run fact drills in any district and try again.') + '</p></div><div class="qAct"><button type="button" id="mDone">' + (pass ? 'Carry on' : 'Back to patrol') + '</button></div>');
      if (pass) { music.sting('promo'); shake(8, .6); }
      $('mDone').onclick = () => { closeModal(); award(pass ? 1000 : 50, pass ? 'chapter exam passed' : 'exam attempt'); if (pass) queueLoot('Chapter 5 Final Exam', 1, 'l'); };
    } });
}
function gatePrompt(g) { PREM.buzz('gate');
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
  key: '<circle cx="8" cy="14" r="4"/><path d="M11 11.5l8.5-8.5M16 6l2.5 2.5M14 8l2 2"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>', star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>', book: '<path d="M4.5 5.5A2 2 0 0 1 6.5 3.5H19v15H6.5a2 2 0 0 0-2 2z"/><path d="M4.5 20.5V5.5M8.5 7.5h6"/>',
  pad: '<rect x="2.5" y="7" width="19" height="10.5" rx="5"/><path d="M7.5 10.5v4M5.5 12.5h4M15 11.5h.01M17.5 13.5h.01"/>', coffee: '<path d="M5 9h11v5.5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 14.5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v2.5M11 3.5v2.5"/>',
  dumbbell: '<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>', shirt: '<path d="M8.5 4l-5 3 2 4 2-1v10h9V10l2 1 2-4-5-3a3.5 3.5 0 0 1-7 0z"/>', bars: '<path d="M5 20V12M12 20V5M19 20v-5"/>',
  cal: '<rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M9 15l2 2 4-4"/>', city: '<path d="M3.5 20.5h17M5.5 20.5V9l5-3v14.5M10.5 20.5V4.5l8 3.5v12.5"/><path d="M13.5 10h2M13.5 13h2M13.5 16h2M7.5 12h1M7.5 15h1"/>',
  trophy: '<path d="M8 4.5h8v5a4 4 0 0 1-8 0z"/><path d="M8 6.5H5a3 3 0 0 0 3 4M16 6.5h3a3 3 0 0 1-3 4M12 13.5v3.5M8.5 20.5h7l-1-3.5h-5z"/>', puzzle: '<path d="M9.5 4.5h5v2.5a1.5 1.5 0 0 0 3 0V4.5h2v5h-2.5a1.5 1.5 0 0 0 0 3h2.5v7h-15v-7h2.5a1.5 1.5 0 0 0 0-3H4.5v-5h5z"/>',
  rival: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M16 4.5v8M16 4.5l4 1.6-4 1.6"/>', podium: '<path d="M9 9.5h6v11H9zM3.5 13.5H9v7H3.5zM15 15.5h5.5v5H15zM12 3.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z"/>',
  folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>', grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  heart: '<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>', camera: '<path d="M4 8.5a2 2 0 0 1 2-2h2.5l1.5-2h4l1.5 2H18a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2L18 18M6 18l1.8-1.8M16.2 7.8L18 6"/>', keys: '<rect x="3" y="7" width="18" height="10.5" rx="2"/><path d="M6.5 10.5h.01M9.5 10.5h.01M12.5 10.5h.01M15.5 10.5h.01M17.5 10.5h.01M7.5 14h9"/>',
  screen: '<rect x="3.5" y="4.5" width="17" height="11.5" rx="2"/><path d="M9 20h6M12 16v4"/>', cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5A3.8 3.8 0 0 1 17.5 18.5z"/><path d="M12 11v5M9.8 13.2L12 11l2.2 2.2"/>',
  redo: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>', flag: '<path d="M5.5 21V4M5.5 4.5h11l-2 4 2 4h-11"/>', power: '<path d="M12 3.5v8"/><path d="M7 6.5a7.5 7.5 0 1 0 10 0"/>',
  radio: '<rect x="3.5" y="8.5" width="17" height="11.5" rx="2.5"/><path d="M7 8.5l9-5M7.5 14h.01M7.5 16.5h.01M10.5 12.5h6v5h-6z"/>', eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  idcard: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><circle cx="8.5" cy="11" r="2"/><path d="M5.5 16a3 3 0 0 1 6 0M14 10h4M14 13.5h3"/>', chat: '<path d="M4.5 5.5h15v10h-9l-4.5 3.5v-3.5H4.5z"/><path d="M8.5 10.5h7"/>', badge: '<path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z"/><path d="M9.5 12l2 2 3.5-3.5"/>',
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
// desktop: the action bar has keyboard shortcuts, shown as small key caps on the buttons
const BAR_KEYS = { c: 'bCar', r: 'bRadio', f: 'bMe', k: 'bLock', m: 'bMap', x: 'bX' };
addEventListener('keydown', (e) => { if (e.ctrlKey || e.metaKey || e.altKey || (e.target.closest && e.target.closest('input,textarea,select'))) return; const id = BAR_KEYS[(e.key || '').toLowerCase()]; if (!id || ATTRACT || !$('start').hidden || !$('modal').hidden || !$('dlg').hidden || !fe().hidden) return; const b = $(id); if (b && b.offsetParent) { b.click(); e.preventDefault(); } });
function setIcons() { Object.entries(BAR_KEYS).forEach(([k, id]) => { const b = $(id); if (b) b.dataset.k = k.toUpperCase(); }); { const b = $('bPause'); if (b) b.dataset.k = 'Esc'; } [['bRadio', 'comms', 'Comms'], ['bMe', 'target', 'Center'], ['bLock', 'locker', 'Locker'], ['bMap', 'map', 'City'], ['bPause', 'menu', 'Menu']].forEach(([id, k, t]) => { const b = $(id); if (!b) return; const badge = b.querySelector('.bBadge'); b.innerHTML = '<i>' + ico(k) + '</i><span>' + t + '</span>'; if (badge) b.appendChild(badge); }); }
function hud() {
  const r = L.rankOf(S.xp), m = L.districtMastery(S, W.did);
  $('hCs').textContent = U().icon + ' ' + (S.fto ? 'FTO · ' : '') + S.cs; $('hUnit').textContent = unitName(U()); $('hUnit').style.setProperty('--uc', U().color); FEEL.rankLine(S.title ? '🏷️ ' + S.title + ' · ' : '', r.name, S.xp, S.cash || 0);
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
const toastQ = []; let toastOn = false;
function toast(t) { if (toastOn && $('toast').textContent === t) return; if (toastQ.indexOf(t) >= 0) return; if (toastQ.length >= 3) toastQ.shift(); toastQ.push(t); pumpToast(); }
function pumpToast() { if (toastOn || !toastQ.length) return; const el = $('toast'); el.textContent = toastQ.shift(); el.hidden = false; toastOn = true; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; toastOn = false; setTimeout(pumpToast, 250); }, toastQ.length ? 2600 : 3800); }
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
$('zIn').onclick = () => setZoom(cam.zUser * 1.2, true); $('zOut').onclick = () => setZoom(cam.zUser / 1.2, true);
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
function stat(k, n) { if (/^callGrade[SABCD]$/.test(k) && typeof PREM !== 'undefined') PREM.onCall(k.slice(9)); if (k === 'mgwin') ACAD.weekAdd('w', 1); S.stat = S.stat || {}; S.stat[k] = (S.stat[k] || 0) + (n == null ? 1 : n); }
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
    const first = !COMMS.squad; COMMS.squad = { code, i, m }; S.squad = { code, name: i.n, tag: i.g, lead: i.l === myUid }; saveS(); net.squadTag(code, i.g); if (first) COOP.squadWatch();
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
    '<div class="ppAct"><button type="button" id="ppDm">✉️ Message</button>' + (S.squad && !mem && Object.keys((COMMS.squad || {}).m || {}).length < MAXSQ ? '<button type="button" id="ppInv">🛡️ Invite to ' + esc(S.squad.tag) + '</button>' : !S.squad ? '<button type="button" id="ppNew">🛡️ Start a squad together</button>' : '') + (o ? '<button type="button" id="ppLoc">📍 Show on map</button><button type="button" id="ppWave">👋 Wave</button>' + (COOP.partnerOf(u) ? '' : '<button type="button" id="ppPt">🤝 Partner this week</button>') + (!COOP.riding ? '<button type="button" id="ppRide">🚓 Invite to ride along</button>' : '') + '<button type="button" id="ppCm">🎖️ Commend</button>' : '') + '<button type="button" class="ghost" id="ppMute">' + (muted ? 'Unmute' : '🔇 Mute') + '</button></div><div class="qAct"><button type="button" class="ghost" id="mClose">Close</button></div>');
  $('mClose').onclick = closeModal; $('ppDm').onclick = () => openDM(u, c || o.c);
  if ($('ppInv')) $('ppInv').onclick = () => { net.invite(u, { s: S.squad.code, n: S.squad.name, g: S.squad.tag, c: S.cs }); stat('invites'); toast('Invite sent to ' + (c || o.c) + '.'); closeModal(); };
  if ($('ppNew')) $('ppNew').onclick = () => { closeModal(); COMMS.tab = 's'; $('quick').hidden = false; commsPanel(); setTimeout(() => { const i = $('sqName'); if (i) i.focus(); }, 50); toast('Name your squad, then invite ' + (c || o.c) + ' from People.'); };
  if ($('ppLoc')) $('ppLoc').onclick = () => { const [sx, sy] = iso(o.rx, o.ry); cam.free = true; cam.x = sx; cam.y = sy; PINGS.push({ x: o.rx, y: o.ry, t: performance.now(), c: '#60a5fa' }); closeModal(); };
  if ($('ppPt')) $('ppPt').onclick = () => { COOP.partnerAsk(u, c || o.c, false); closeModal(); };
  if ($('ppRide')) $('ppRide').onclick = () => { COOP.partnerAsk(u, c || o.c, true); closeModal(); };
  if ($('ppCm')) $('ppCm').onclick = () => { closeModal(); COOP.commendPrompt(u, c || o.c, ''); };
  if ($('ppWave')) $('ppWave').onclick = () => { if (net) net.quick(8); SELF_SAY.text = '👋'; SELF_SAY.at = performance.now(); stat('waves'); closeModal(); };
  $('ppMute').onclick = () => { if (muted) CHAT.muted.delete(u); else CHAT.muted.add(u); try { localStorage.setItem('patrolcity:muted', JSON.stringify([...CHAT.muted])); } catch (e) {} toast(muted ? 'Unmuted.' : 'Muted. You won\'t see their messages.'); closeModal(); };
}
// short-lived map pings (locate a cadet)
const PINGS = [];
function pingsDraw(now) { for (let i = PINGS.length - 1; i >= 0; i--) { const p = PINGS[i], a = Math.max(0, (now - p.t) / 2400); if (a > 1) { PINGS.splice(i, 1); continue; } const [sx, sy] = iso(p.x, p.y); ctx.strokeStyle = p.c; ctx.globalAlpha = 1 - a; ctx.lineWidth = 3; for (let k = 0; k < 3; k++) { const r = ((a * 3 + k / 3) % 1) * 60; ctx.beginPath(); ctx.ellipse(sx, sy, r, r / 2, 0, 0, Math.PI * 2); ctx.stroke(); } ctx.globalAlpha = 1; } }

// ---------- multiplayer ----------
// ---------- vehicle pursuits, played by policy ----------
// You follow at a safe distance with lights and siren, call out your location, and make the calls policy asks for:
// terminate when the risk outweighs the offense, hand off to the air unit, never ram or box in alone. Sim rules.
let PUR = null;
const PUR_DEC = [
  { at: 7, text: 'The car swerves toward Pinecrest Elementary. School is letting out.', opts: [['Terminate the pursuit and broadcast the plate and direction', 'term', 20], ['Stay with it, lights and siren, and keep calling it out', 'go', 4], ['Close the gap to end it before the school', 'bad', 0]] },
  { at: 15, text: 'Air One is overhead and has eyes on the vehicle.', opts: [['Back off and let Air One track it', 'air', 20], ['Stay on its bumper so you don\'t lose it', 'bad', 0], ['Try to box it in with your car alone', 'bad', 0]] }
];
function purStart(c) {
  const ok = (x, y) => roadPass(x, y); let far = null;
  for (let k = 0; k < 40 && !far; k++) { const x = Math.floor(c.x + (Math.random() - .5) * 90), y = Math.floor(c.y + (Math.random() - .5) * 90); if (x > 1 && y > 1 && x < N - 2 && y < N - 2 && ok(x, y) && Math.hypot(x - c.x, y - c.y) > 30) far = [x, y]; }
  const path = far ? astar(Math.floor(c.x), Math.floor(c.y), far[0], far[1], ok, false) : null; if (!path || path.length < 12) { c.pursuit = false; return; }
  call = null; callCard(); ringClose(); const sus = { x: c.x, y: c.y, path, sp: 5.2, dir: 0, color: rnd(['#b91c1c', '#1f2937', '#e5e7eb', '#1d4ed8']) };
  PUR = { c, sus, t: 0, inBand: 0, tot: 0, calls: 0, need: 0, dec: 0, judge: [], mode: 1, cueT: 5, end: null };
  P.path = []; music.start && S.sound && music.start('urgent'); radio(S.cs, 'In pursuit, ' + c.where + '. ' + ['Red sedan', 'Dark coupe', 'Silver hatchback'][Math.floor(Math.random() * 3)] + ', one occupant.'); chirp(S.cs); PREM.buzz('p1'); shake(3, .3);
  const el = $('purHud'); el.hidden = false; el.innerHTML = '<div class="puTop"><b>🚨 PURSUIT</b><span id="puT">0s</span></div><div class="puBar"><i class="puBand"></i><i id="puMe"></i></div><small>Stay in the green: close enough to see, far enough to stop.</small><div class="puBtns"><button type="button" id="puBack">Back off</button><button type="button" id="puCall" class="call">📻 Call it out</button><button type="button" id="puEnd" class="end">Terminate</button></div>';
  $('puBack').onclick = () => { PUR.mode = PUR.mode === 1 ? .78 : 1; $('puBack').textContent = PUR.mode === 1 ? 'Back off' : 'Close up'; };
  $('puCall').onclick = () => { if (!PUR || PUR.need <= 0) return; PUR.calls++; PUR.need = 0; $('puCall').classList.remove('cue'); const dirs = ['east', 'south', 'west', 'north']; radio(S.cs, 'Still southbound… correction, ' + dirs[PUR.sus.dir & 3] + 'bound near ' + nearName(PUR.sus.x, PUR.sus.y) + ', speed increasing.'); chirp(S.cs); };
  $('puEnd').onclick = () => purEnd('term', true);
}
function nearName(x, y) { let b = null, bd = 1e9; W.lots.forEach((l) => { if (!l.name) return; const d = Math.hypot(l.door[0] - x, l.door[1] - y); if (d < bd) { bd = d; b = l.name; } }); return b || 'the next intersection'; }
function purTick(dt) {
  const R = PUR; if (!R || R.end || paused) return; R.t += dt; const s = R.sus;
  if (s.path.length) { const before = s.path.length; stepAlong(s, dt, s.sp * (R.handoff ? .9 : 1)); if (s.path.length < before || !P.path.length) P.path.push([s.x, s.y]); if (P.path.length > 40) P.path.splice(0, P.path.length - 40); }
  const d = Math.hypot(s.x - P.x, s.y - P.y); R.tot += dt; if (d >= 2.4 && d <= 7) R.inBand += dt;
  if (d < 2 && R.mode === 1) { P.vel = Math.min(P.vel || 0, s.sp * .7); }
  const me = $('puMe'); if (me) me.style.left = Math.min(100, d / 10 * 100) + '%'; const tt = $('puT'); if (tt) tt.textContent = Math.round(R.t) + 's';
  R.cueT -= dt; if (R.cueT <= 0) { R.cueT = 6; R.need = 3; const b = $('puCall'); if (b) b.classList.add('cue'); } if (R.need > 0) { R.need -= dt; if (R.need <= 0) { const b = $('puCall'); if (b) b.classList.remove('cue'); } }
  const dec = PUR_DEC[R.dec]; if (dec && R.t >= dec.at && !stageBusy()) { R.dec++; purDecide(dec); return; }
  if (!s.path.length || R.t > 32 || d > 16) purEnd(R.handoff ? 'air' : d > 16 ? 'lost' : 'stopped');
}
function purDecide(dec) {
  paused = true; const el = $('purDec'); el.hidden = false; const opts = dec.opts.slice().sort(() => Math.random() - .5);
  el.innerHTML = '<div class="pdIn"><small>DECISION · PURSUIT POLICY</small><p>' + esc(dec.text) + '</p>' + opts.map((o, k) => '<button type="button" data-k="' + k + '">' + esc(o[0]) + '</button>').join('') + '</div>'; PREM.buzz('gate');
  el.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => { const o = opts[+b.dataset.k]; el.hidden = true; paused = false; PUR.judge.push(o[2]);
    if (o[1] === 'term') purEnd('term', false); else if (o[1] === 'air') { PUR.handoff = true; PUR.mode = .72; radio('Air One', 'Air One has the vehicle. Ground units, back it down. We\'ll guide you in.'); chirp('Air One'); }
    else if (o[1] === 'bad') { radio('Sgt. Castillo', '(over the radio) ' + S.cs + ', negative. That\'s how people get hurt. Terminate. Now.'); chirp('castillo'); purEnd('term', false, true); } });
}
function purEnd(how, early, ordered) {
  const R = PUR; if (!R || R.end) return; R.end = how; $('purHud').hidden = true; $('purDec').hidden = true; P.path = []; P.vel = Math.min(P.vel || 0, 2);
  const judge = R.judge.length ? Math.round(R.judge.reduce((a, b) => a + b, 0) / R.judge.length) : (how === 'term' ? 16 : 10), band = R.tot ? R.inBand / R.tot : 0, cuesTot = Math.max(1, Math.floor(R.t / 6)), rows = [
    ['📏', 'Safe distance', Math.round(band * 15), 15, Math.round(band * 100) + '% of the pursuit in the safe zone'],
    ['📻', 'Radio', Math.min(10, Math.round(R.calls / cuesTot * 10)), 10, R.calls + ' location call-out' + (R.calls === 1 ? '' : 's')],
    ['⚖️', 'Judgement', ordered ? 0 : judge, 20, ordered ? 'Supervisor ordered the termination' : how === 'term' ? 'Terminated when the risk outweighed the offense' : how === 'air' ? 'Handed off to Air One' : 'Stayed safe and kept it called out']];
  const c = R.c; c.purRows = rows; radio(S.cs, how === 'term' ? 'Terminating pursuit. Lights off, slowing down.' : how === 'air' ? 'Backing off. Air One has it.' : 'Lost sight. Broadcasting the description.'); chirp(S.cs);
  const after = how === 'term' || how === 'lost' ? 'Air One followed the car to an apartment lot on the east side. The driver walked out with his hands up. 2-Baker-14 has him. Meet them for the arrest.' : 'Stop sticks ahead. The car rolls to a stop on flattened tires. The driver stays inside.';
  setTimeout(() => { PUR = null; const sp = nearest(Math.floor(P.x), Math.floor(P.y), (x, y) => W.at(x, y) === T.WALK) || [P.x, P.y]; c.x = sp[0] + .5; c.y = sp[1] + .5; c.title = 'Pursuit: arrest after the stop'; c.where = nearName(c.x, c.y);
    dialogue([['narr', after]].concat(arrestLines(c)).concat([['castillo', '(over the radio) Good. Now the part that keeps it legal.'], ['q', L.pickFacts(S, [L.weakest(S, W.did)], 1)[0], 'castillo']]), (res) => {
      const prow = ['🔗', 'Procedure', Math.round((c.procOk || 0) / 3 * 10), 10, (c.procOk || 0) + ' of 3 arrest steps by the book'], xp = 40 + rows.reduce((a, r) => a + r[2], 0) + prow[2] * 2 + res.right * 20;
      stat('pursuits'); if (how === 'term' || how === 'air') stat('pursuitSafe'); if ((c.procOk || 0) === 3) stat('arrestClean');
      POL.debrief({ extra: rows.concat([prow]), title: 'Pursuit and arrest', where: c.where, prio: 1, right: res.right, n: res.n, fast: true, resp: 0, wrap: 'case', calm: (c.procOk || 0) >= 2, qs: res.qs || [], xp, role: 'Primary unit' }, () => { closeModal(); award(Math.round(xp * .6), 'pursuit'); award(Math.round(xp * .4), 'arrest procedure'); nextCall = 30; if (net) net.status('patrol'); });
    }, { focus: [P.x, P.y], kicker: 'PURSUIT · ARREST', onLeave: () => { leaveDefault(); } });
  }, 1400);
}
// three by-the-book arrest steps (sim): commands from cover, handcuffing, search incident to arrest
function arrestLines(c) {
  c.procOk = 0; const ok = () => { c.procOk = (c.procOk || 0) + 1; }, sh = (a) => a.sort(() => Math.random() - .5);
  return [['choice', sh([{ t: 'Give clear commands from cover, one at a time', fx: ok, reply: [['narr', 'The driver follows each command. Hands visible the whole time.']] }, { t: 'Walk straight up to the driver\'s window', reply: [['castillo', '(over the radio) Cover first. You don\'t know what\'s in that car.']] }, { t: 'Shout several commands at the same time', reply: [['castillo', '(over the radio) One command at a time. Confusion gets people hurt.']] }]), 'Making contact'],
    ['choice', sh([{ t: 'Check the fit, then double-lock both cuffs', fx: ok, reply: [['narr', 'Snug, not tight, double-locked.']] }, { t: 'Cuff as tight as they go so they can\'t slip', reply: [['castillo', '(over the radio) Too tight is an injury and a complaint. Check fit, double-lock.']] }, { t: 'Skip the double-lock, it\'s a short ride', reply: [['castillo', '(over the radio) Unlocked cuffs tighten on their own. Double-lock every time.']] }]), 'Handcuffing'],
    ['choice', sh([{ t: 'Ask about sharp items, then search incident to arrest', fx: ok, reply: [['narr', 'He mentions a box cutter in his jacket pocket. You find it right where he said.']] }, { t: 'Skip the search, he\'s been calm the whole time', reply: [['castillo', '(over the radio) Calm isn\'t a search. Every arrest, every time.']] }, { t: 'Leave the search for the jail staff to do', reply: [['castillo', '(over the radio) The search happens at arrest. Your safety and his.']] }]), 'Search']];
}
// ---------- arriving on scene: context actions appear around the address, console style; walk off and they fold away ----------
let RING = null;
const RING_OPTS = [['contact', 'chat', 'Make contact'], ['assess', 'eye', 'Assess first'], ['id', 'idcard', 'ID first'], ['backup', 'radio', 'Backup']];
function ringOpen(c) {
  RING = { c, t: performance.now() }; P.path = []; PREM.buzz('tap'); const el = $('ring');
  el.innerHTML = '<div class="rgHub"><b>' + esc(c.title) + '</b><small>' + esc(c.where) + '</small></div>' + RING_OPTS.filter((o) => o[0] !== 'backup' || (net && !c.backup)).map((o, k) => '<button type="button" data-r="' + o[0] + '" style="--k:' + k + '"><i>' + ico(o[1]) + '</i><span>' + o[2] + '</span></button>').join('');
  el.hidden = false; requestAnimationFrame(() => el.classList.add('on')); beep(740, .06, 'triangle', .03);
  el.querySelectorAll('[data-r]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); ringPick(b.dataset.r); });
}
function ringClose() { const el = $('ring'); el.classList.remove('on'); setTimeout(() => { if (!RING) el.hidden = true; }, 220); RING = null; }
function ringPick(k) {
  const c = RING && RING.c; if (!c) return;
  if (k === 'backup') { COOP.wantPicker((n) => { if (!RING || RING.c !== c) return; requestBackup(c, n); radio(S.cs, 'On scene, requesting ' + (n === 'any' ? 'a cover unit' : 'a ' + COOP.wantLabel(n).replace(/^\S+ /, '') + ' unit') + '.'); chirp(S.cs); callCard(); const b = $('ring').querySelector('[data-r="backup"]'); if (b) b.remove(); }); return; }
  const d = Math.hypot(P.x - c.x, P.y - c.y);
  // positioning is part of the score: a clear view beats standing in the doorway
  c.posRow = k === 'assess' ? ['📐', 'Positioning', 10, 10, 'Stepped back and took in the scene first'] : d < .8 ? ['📐', 'Positioning', 3, 10, 'Stood in the doorway'] : ['📐', 'Positioning', 7, 10, 'Workable position'];
  c.open = k; ringClose(); call = null; callCard(); openCallScene(c);
}
function ringTick() { if (!RING) return; if (!call || call !== RING.c || Math.hypot(RING.c.x - P.x, RING.c.y - P.y) > 3 || inside) ringClose(); }
function ringPlace(z, tx, ty) { if (!RING) return; const [ix, iy] = iso(RING.c.x, RING.c.y), el = $('ring'); el.style.transform = 'translate(' + ((ix * z + tx) / dpr).toFixed(1) + 'px,' + ((iy * z + ty) / dpr - 30).toFixed(1) + 'px)'; }
// ---------- backup requests: ask, others accept, they get a route, arrive, and take the cover role ----------
let BKGO = null, BKQ = [], BKDECL = {}, BKT = 0;
function bkStatus() { const go = Object.keys(others).filter((k) => others[k].a === myUid + '|go').map((k) => others[k].c), on = Object.keys(others).filter((k) => others[k].a === myUid).map((k) => others[k].c);
  return on.length ? '🛡️ On scene: ' + on.map(esc).join(', ') : go.length ? '🚓 En route: ' + go.map(esc).join(', ') : '📻 Waiting for a unit to accept…'; }
function requestBackup(c, n) { c.backup = true; c.bkT = performance.now(); if (net) net.backup({ x: c.x, y: c.y, l: c.title.slice(0, 48), p: c.prio, n: n || 'any' }); }
function bkCancel(why) { if (call) call.backup = false; if (net) net.backup(null); radio(S.cs, why); callCard(); }
function bkOffer(uid, v) { if (!S.cfg || S.cfg.bkOff) return; if (!COOP.wantOk(v.b) && !COOP.partnerOf(uid)) return; const key = uid + ':' + v.b.t; if (BKDECL[key] || (BKGO && BKGO.uid === uid)) return; BKQ = BKQ.filter((x) => x.uid !== uid); BKQ.push({ uid, key, c: v.c, u: v.u, b: v.b, at: performance.now() }); }
function bkCardTick() {
  const el = $('bkCard'); BKQ = BKQ.filter((x) => others[x.uid] && others[x.uid].b && performance.now() - x.at < 45000);
  const r = BKQ[0], free = !stageBusy() && $('dlg').hidden && $('modal').hidden && !scene && !inside;
  if (!r || !free || BKGO) { if (!el.hidden) el.hidden = true; return; }
  if (el.dataset.k === r.key && !el.hidden) { const left = Math.max(0, 45 - (performance.now() - r.at) / 1000); el.style.setProperty('--left', (left / 45).toFixed(3)); return; }
  const d = Math.round(Math.hypot(r.b.x - P.x, r.b.y - P.y) * 4), un = unitOf(r.u) || {}; el.dataset.k = r.key; el.hidden = false; el.className = 'bkCard p' + (r.b.p || 2);
  el.innerHTML = '<div class="bkTop"><b>' + (r.b.p === 1 ? '🚨 PRIORITY BACKUP' : '📻 BACKUP REQUEST') + '</b><span>' + d + ' m away</span></div><div class="bkWho">' + (un.icon || '🚓') + ' <b>' + esc(r.c) + '</b> needs ' + (COOP.wantLabel(r.b.n) ? 'a ' + esc(COOP.wantLabel(r.b.n)) + ' unit' : 'a cover officer') + (COOP.partnerOf(r.uid) ? ' · <i class="bkPt">your partner</i>' : '') + '</div><div class="bkWhat">' + esc(r.b.l || 'Cover officer requested') + '</div>' +
    '<div class="bkBtns"><button type="button" id="bkYes">Accept · en route</button><button type="button" class="ghost" id="bkNo">Decline</button></div><i class="bkTime"></i>';
  $('bkYes').onclick = () => bkAccept(r); $('bkNo').onclick = () => { BKDECL[r.key] = 1; BKQ.shift(); el.hidden = true; };
}
function bkAccept(r) { BKQ = BKQ.filter((x) => x !== r); $('bkCard').hidden = true; BKGO = { uid: r.uid, x: r.b.x, y: r.b.y, c: r.c, l: r.b.l, t: performance.now() };
  if (net) net.assist(r.uid + '|go'); radio(S.cs, 'Copy, ' + r.c + '. En route to back you up.'); chirp(); if (inside) exitBuilding(); goTo(r.b.x, r.b.y, () => {}); toast('🧭 Follow the blue route to ' + r.c + '.'); }
function bkStood(msg) { BKGO = null; if (net) net.assist(null); toast('📻 ' + msg); }
function bkTick() {
  bkCardTick(); if (!BKGO) return; const o = others[BKGO.uid];
  if (!o || !o.b) { if (performance.now() - BKGO.t < 15000) return; return bkStood((BKGO.c || 'The unit') + ' cleared the call. Backup no longer needed.'); }
  if (Math.hypot(BKGO.x - P.x, BKGO.y - P.y) < 2 && !stageBusy() && $('dlg').hidden && !scene) { const uid = BKGO.uid; BKGO = null; backupScene(uid, o); }
  else if (performance.now() - BKGO.t > 240000) bkStood('Backup request timed out.');
}
function onPlayers(all, uid) {
  myUid = uid; COOP.online(uid); const now = N0(), seen = {};
  Object.keys(all).forEach((k) => {
    if (k === uid) return; const v = all[k]; if (!v || !v.t || now - v.t > 45000) return; seen[k] = 1;
    const o = others[k] || (others[k] = { rx: v.x, ry: v.y, skin: rnd(SKIN) });
    const close = COOP.partnerOf(k) || (S.squad && v.g === S.squad.code) || Math.hypot((v.x || 0) - P.x, (v.y || 0) - P.y) < 40 || Object.keys(all).length < 16;
    if (v.q && (!o.q || o.q.t !== v.q.t) && now - v.q.t < 8000) { o.qAt = performance.now(); if (close) radio(v.c, QUICK[v.q.k] || ''); }
    if (v.b && v.b.t && (!o.b || o.b.t !== v.b.t) && now - v.b.t < 60000 && close) { radio(v.c, 'Requesting backup: ' + (v.b.l || '')); chirp(v.c); bkOffer(k, v); PREM.buzz('backup'); }
    if (o.b && !v.b && BKGO && BKGO.uid === k) bkStood(v.c + ' is Code 4. Backup no longer needed. Thanks for rolling.');
    if (v.a === uid + '|go' && o.a !== v.a) { radio(v.c, 'En route to back you up.'); toast('🚓 ' + v.c + ' accepted your backup request and is en route.'); good(); setTimeout(() => call && callCard(), 0); }
    COOP.sawPlayer(k, v);
    if (v.a === uid && o.a !== uid) { toast('🛡️ ' + v.c + ' is on scene as your cover officer.'); good(); COVER = { c: v.c, t: Date.now(), uid: k }; COOP.coopStart(k, 'contact'); COOP.ptAdd(k, 10); if (call) call.cover = v.c; setTimeout(() => call && callCard(), 0); }
    Object.assign(o, { n: v.n, f: v.f, u: v.u, sh: v.s, tx: v.x, ty: v.y, c: v.c, v: v.v, d: v.d, st: v.st, q: v.q, b: v.b, a: v.a, g: v.g || null, k: v.k || null, r: v.r }); if (S.squad && v.g === S.squad.code && !o.sqHello) { o.sqHello = 1; toast('🛡️ Squadmate ' + v.c + ' is on shift nearby.'); }
  });
  Object.keys(others).forEach((k) => { if (!seen[k]) delete others[k]; });
  $('hOn').textContent = (Object.keys(others).length + 1) + ' on shift';
}
let DRAWN_OTHERS = 0, rankT = 0;
function rankOthers(dt) { rankT -= dt; if (rankT > 0) return; rankT = .5; const ks = Object.keys(others); DRAWN_OTHERS = ks.length; ks.map((k) => [k, Math.hypot(others[k].rx - P.x, others[k].ry - P.y)]).sort((a, b) => a[1] - b[1]).forEach(([k], i) => { others[k].nearRank = i; }); }
function smoothOthers(dt) { rankOthers(dt); OCOUNT = Object.keys(others).length; Object.keys(others).forEach((k) => { const o = others[k]; if (o.tx == null) return; const dx = o.tx - o.rx, dy = o.ty - o.ry, dd = Math.hypot(dx, dy); o.moving = dd > .05; if (o.moving) { if (Math.abs(dx - dy) > .02) o.face = dx - dy > 0 ? 1 : -1; o.back = dx + dy < -.02; } const kk = Math.min(1, dt * 5); o.stride = (o.stride || 0) + dd * kk; o.rx += dx * kk; o.ry += dy * kk; }); }

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
S.cfg = Object.assign({ music: .8, sfx: .8, quality: 'high', shake: true, text: 'normal', motion: true, autoQ: true }, S.cfg || {});
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
      '<div class="advis fbrtp"><small>MADE FOR</small><h3>FBRTP Cadets</h3><p>Every fact in Port Meridian comes from the Florida Basic Recruit Training Program. Learn it on the street, then prove it in class.</p></div>',
      '<div class="advis"><h3>Training Simulation Advisory</h3><p>Patrol City is a training simulation. Every scenario uses <b>simulation rounds</b>. Nothing here replaces your agency\'s policy, your instructors, or the law.</p><p class="advSave"><span class="saveIco"></span>This game saves automatically. Don\'t close the page while this icon is showing.</p></div>'];
    let i = -1, tm = 0;
    const next = () => { clearTimeout(tm); i++; if (i >= seq.length) { el.onclick = null; el.classList.add('out'); setTimeout(() => { el.hidden = true; el.className = 'fe'; el.innerHTML = ''; done(); }, 700); return; }
      el.innerHTML = '<div class="bootSlide">' + seq[i] + '</div><button type="button" class="bootSkip">Skip ›</button>'; if (i === 0) boom(); if (i === 1) [523, 784].forEach((f, k) => beep(f, .5, 'triangle', .03, k * .12));
      el.querySelector('.bootSkip').onclick = (e) => { e.stopPropagation(); i = seq.length - 1; next(); };
      tm = setTimeout(next, i === seq.length - 1 ? 4200 : 3200); };
    el.onclick = next; next();
  };
}
// ---- settings ----
function applyCfg() { music.volume(S.sound ? S.cfg.music : 0); resize(); if (typeof POL !== 'undefined') POL.applyA11y(); if (typeof EP !== 'undefined') EP.applyDisplay(); }
function settingsPanel(back) {
  const c = S.cfg, seg = (k, opts) => '<div class="seg" data-k="' + k + '">' + opts.map(([v, t]) => '<button type="button" data-v="' + v + '" class="' + (String(c[k]) === String(v) ? 'on' : '') + '">' + t + '</button>').join('') + '</div>';
  const el = fe(); el.hidden = false; el.onclick = null; el.className = 'fe menuBg';
  el.innerHTML = '<div class="feCard"><div class="feHead"><span>Options</span><h2>Settings</h2></div><div class="setGrid">' +
    '<label>Sound<div class="seg" data-k="sound"><button type="button" data-v="true" class="' + (S.sound ? 'on' : '') + '">On</button><button type="button" data-v="false" class="' + (S.sound ? '' : 'on') + '">Off</button></div></label>' +
    '<label>Music volume<input type="range" min="0" max="1" step=".05" value="' + c.music + '" data-r="music"></label>' +
    '<label>Effects volume<input type="range" min="0" max="1" step=".05" value="' + c.sfx + '" data-r="sfx"></label>' +
    '<label>Graphics quality' + seg('quality', [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['ultra', 'Ultra 4K']]) + '</label>' +
    '<label>Auto-adjust graphics' + seg('autoQ', [[true, 'On'], [false, 'Off']]) + '</label>' +
    '<label>Text speed' + seg('text', [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast'], ['instant', 'Instant']]) + '</label>' +
    '<label>Camera shake' + seg('shake', [[true, 'On'], [false, 'Off']]) + '</label>' +
    '<label>Motion effects' + seg('motion', [[true, 'Full'], [false, 'Reduced']]) + '</label>' +
    '<label>Voice acting' + seg('voice', [['story', 'Story scenes'], ['all', 'Everyone'], ['off', 'Off']]) + '</label>' +
    '<label>Text size' + seg('tsize', [['normal', 'Normal'], ['large', 'Large'], ['xl', 'Extra large']]) + '</label>' +
    '<label>Colour mode' + seg('cmode', [['none', 'Standard'], ['deut', 'Deuteranopia'], ['prot', 'Protanopia'], ['trit', 'Tritanopia'], ['hc', 'High contrast']]) + '</label>' +
    '<label>Font' + seg('font', [['default', 'Default'], ['readable', 'Atkinson Hyperlegible']]) + '</label>' +
    '</div><div class="feBtns"><button type="button" class="feBtn" id="setBack">Back</button></div></div>';
  el.querySelectorAll('.seg button').forEach((b) => b.onclick = () => { const k = b.closest('.seg').dataset.k; let v = b.dataset.v; if (v === 'true') v = true; else if (v === 'false') v = false;
    if (k === 'sound') { S.sound = v; if (v) { audio(); music.start(ATTRACT ? 'title' : moodNow()); } else music.stop(); hud && !ATTRACT && hud(); } else { c[k] = v; if (k === 'quality') c.qMax = v; } saveS(); applyCfg(); feSound('move'); settingsPanel(back); });
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
  ['drived', 'Driver\'s Ed', 'Set up practice for Kiara.', 'b', () => S.flags.tashaHelp],
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
TROPHIES.push(...EP.SECRETS);
TROPHIES.push(['callS1', 'Textbook', 'Earn an S rank on a call debrief.', 'b', () => st('callS') >= 1], ['callS10', 'By the Book, Every Time', 'Earn 10 S ranks on calls.', 'g', () => st('callS') >= 10], ['coop1', 'Contact and Cover', 'Handle a co-op training call the right way with another cadet.', 's', () => st('coopGood') >= 1], ['caseSet', 'Case Closed', 'Complete a district\'s case file set.', 'g', () => st('caseSet') >= 1], ['season10', 'Halfway There', 'Reach tier 10 on the Academy Season.', 's', () => S.season && S.season.xp >= 4000], ['friends10', 'Everybody Knows Your Name', 'Become friends with 10 regulars.', 's', () => Object.keys(S.npc || {}).filter((k) => S.npc[k] >= 3).length >= 10]);
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
  if (trBusy || !trQ.length) return; if (bannerOn || !$('modal').hidden || !$('dlg').hidden) { setTimeout(trophyToast, 900); return; } trBusy = true; const t = trQ.shift(), [tn, col] = TIER[t[3]], el = $('trToast');
  el.innerHTML = '<span class="trCup" style="--c:' + col + '">🏆</span><div><small>Trophy unlocked · ' + tn + '</small><b>' + esc(t[1]) + '</b><em>' + esc(t[2]) + '</em></div>'; el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
  if (S.sound) [784, 988, 1175, 1568].forEach((f, i) => beep(f, .4, 'sine', .03, i * .07));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => { el.hidden = true; trBusy = false; trophyToast(); }, 450); }, 4200);
}
function trophyRoom(back) {
  S.trophies = S.trophies || {}; const n = TROPHIES.filter((t) => S.trophies[t[0]]).length, el = fe(); el.hidden = false; el.onclick = null; el.className = 'fe menuBg';
  el.innerHTML = '<div class="feCard wide"><div class="feHead"><span>' + n + ' of ' + TROPHIES.length + ' · ' + Math.round(n / TROPHIES.length * 100) + '%</span><h2>Trophies</h2><div class="trBar"><i style="width:' + (n / TROPHIES.length * 100) + '%"></i></div></div><div class="trGrid">' +
    TROPHIES.map((t) => { const has = S.trophies[t[0]], [tn, col] = TIER[t[3]], hid = t[5] === 'secret' && !has; return '<div class="trItem' + (has ? ' has' : '') + '" style="--c:' + col + '"><span>' + (has ? '🏆' : hid ? '❔' : '🔒') + '</span><div><b>' + (hid ? 'Secret trophy' : esc(t[1])) + '</b><small>' + (hid ? 'Hidden' : tn) + (has ? ' · ' + new Date(has).toLocaleDateString() + (t[5] === 'secret' ? ' · secret' : '') : '') + '</small><em>' + (hid ? 'Keep exploring. You\'ll know it when you find it.' : esc(t[2])) + '</em></div></div>'; }).join('') +
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
  const m = t.querySelector('.tiMenu'); { const old = t.querySelector('.tiCont'); if (old) old.remove(); if (has) m.insertAdjacentHTML('beforebegin', ON.continueCard()); }
  m.innerHTML = items.map((x, i) => '<button type="button" data-i="' + i + '"' + (i === 0 ? ' class="pri"' : '') + '><b>' + esc(x[0]) + '</b>' + (x[2] ? '<small>' + esc(x[2]) + '</small>' : '') + '</button>').join('');
  m.querySelectorAll('button').forEach((b) => { b.onmouseenter = () => feSound('move'); b.onclick = (e) => { e.stopPropagation(); feSound('ok'); items[+b.dataset.i][1](); }; });
  m.onkeydown = (e) => { const bs = [...m.querySelectorAll('button')], i = bs.indexOf(document.activeElement); if (e.key === 'ArrowDown') { bs[(i + 1) % bs.length].focus(); feSound('move'); e.preventDefault(); } if (e.key === 'ArrowUp') { bs[(i - 1 + bs.length) % bs.length].focus(); feSound('move'); e.preventDefault(); } };
  setTimeout(() => { const b = m.querySelector('button'); if (b) b.focus({ preventScroll: true }); }, 900);
}
// ---- pause menu ----
let PAUSED_BY_MENU = false;
// the pause menu is grouped by what you want to do; every entry has an icon from the same set as the action bar
const PM_GROUPS = [['On duty', ['District Incident', 'My Beat', 'Investigations', 'Partner Care', 'Weekend PT Meet', 'Go off duty', 'Go back on duty', 'Squad Dispatch Board', 'Rec Room · Mini Games', 'PT', 'Uniform Inspection', 'Daily Challenges', 'This Week in the City', 'Photo Mode']],
  ['Progress', ['Service Record', 'Field Journal', 'Case Files', 'Mystery Board', 'Collections', 'Trophies', 'Academy Season', 'Class Standing', 'Leaderboards', 'Rival: Cadet Vance', 'Community Trust Map', 'Locker', 'Quest Items']],
  ['Options', ['Settings', 'Controls', 'Display & Audio', 'Saves & Backups', 'New Game+ · FTO', 'Report a problem', 'Quit to Title']]];
const PM_ICON = { 'Quest Items': 'key', 'District Incident': 'flag', 'My Beat': 'map', Investigations: 'folder', 'Partner Care': 'heart', 'Weekend PT Meet': 'dumbbell', 'Service Record': 'star', 'Squad Dispatch Board': 'map', 'Field Journal': 'book', 'Rec Room · Mini Games': 'pad', 'Go off duty': 'coffee', 'Go back on duty': 'badge', PT: 'dumbbell', 'Uniform Inspection': 'shirt', 'Class Standing': 'bars', 'Daily Challenges': 'cal', 'This Week in the City': 'city', 'Academy Season': 'trophy', 'Mystery Board': 'puzzle', 'Rival: Cadet Vance': 'rival', Leaderboards: 'podium', 'Case Files': 'folder', Collections: 'grid', 'Community Trust Map': 'heart', Locker: 'locker', 'Photo Mode': 'camera', Trophies: 'trophy', Settings: 'gear', Controls: 'keys', 'Display & Audio': 'screen', 'Saves & Backups': 'cloud', 'New Game+ · FTO': 'redo', 'Report a problem': 'flag', 'Quit to Title': 'power' };
const ICON_FILL_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
function pauseMenu() {
  if (ATTRACT || PHOTO || !$('start').hidden || looting || document.querySelector('.lorePop, .tCard, .introCine')) return; const el = fe(); if (!el.hidden) return;
  const was = paused; paused = true; PAUSED_BY_MENU = true; el.hidden = false; el.className = 'fe pauseBg';
  const close = () => { el.hidden = true; el.innerHTML = ''; el.className = 'fe'; paused = was; PAUSED_BY_MENU = false; };
  const items = [['Resume', close], ['Service Record', () => { close(); REW.panel(); }], ['Quest Items', () => { close(); qItemsPanel(); }], ['My Beat', () => { close(); CITY.beatPanel(); }], ['Investigations', () => { close(); CITY.casesPanel(); }], ['Weekend PT Meet', () => { close(); CITY.meetPanel(); }], ...(CITY.hasAnimal() ? [['Partner Care', () => { close(); CITY.animalPanel(); }]] : []), ...(CITY.live ? [['District Incident', () => { close(); CITY.pickRole(); }]] : []), ...(S.squad && S.squad.lead ? [['Squad Dispatch Board', () => { close(); COOP.board(); }]] : []), ['Field Journal', () => { close(); journal(); }], ['Rec Room · Mini Games', () => { close(); MG.open(); }], [S.offDuty ? 'Go back on duty' : 'Go off duty', () => { close(); OFF.toggle(); }], ['PT', () => { close(); ACAD.ptMenu(); }], ['Uniform Inspection', () => { close(); ACAD.inspMenu(); }], ['Class Standing', () => { close(); ACAD.standing(); }], ['Daily Challenges', () => { close(); EVT.dailyCard(); }], ['This Week in the City', () => { close(); EVT.eventCard(); }], ['Academy Season', () => { close(); POL.seasonPanel(); }], ['Mystery Board', () => { close(); EP.board(); }], ['Rival: Cadet Vance', () => { close(); EP.rivalPanel(); }], ['Leaderboards', () => { close(); EP.boards(); }], ['Case Files', () => { close(); POL.caseFiles(); }], ['Collections', () => { close(); EVT.collections(); }], ['Community Trust Map', () => { close(); trustMap(); }], ['Locker', () => { close(); locker(); }], ['Photo Mode', () => { close(); photoMode(); }], ['Trophies', () => trophyRoom(pauseMenuAgain)], ['Settings', () => settingsPanel(pauseMenuAgain)], ['Controls', () => POL.controlsPanel(pauseMenuAgain)], ['Display & Audio', () => EP.calibrate(pauseMenuAgain)], ['Saves & Backups', () => SAFE.savesPanel(pauseMenuAgain)], ['New Game+ · FTO', () => NG.panel(pauseMenuAgain)], ['Report a problem', () => SAFE.reportPanel(pauseMenuAgain)], ['Quit to Title', () => { saveS(); location.reload(); }]];
  ON.gateMenu(items); SAFE.cloudSave(false);
  function pauseMenuAgain() { el.hidden = true; paused = was; PAUSED_BY_MENU = false; pauseMenu(); }
  const h = hourNow(), hh = String(Math.floor(h)).padStart(2, '0') + String(Math.floor((h % 1) * 60)).padStart(2, '0');
  const groups = PM_GROUPS.map(([gname, labels]) => [gname, items.map((x, i) => [x, i]).filter(([x]) => labels.indexOf(x[0].replace(/ <i.*$/, '')) >= 0)]).filter((gx) => gx[1].length), used = new Set(groups.flatMap((gx) => gx[1].map((y) => y[1])));
  const rest = items.map((x, i) => [x, i]).filter(([x, i]) => i > 0 && !used.has(i)); if (rest.length) groups.splice(1, 0, ['More', rest]);
  const tile = ([x, i]) => { const base = x[0].replace(/ <i.*$/, ''), tag = x[0].indexOf('newTag') >= 0 ? '<i class="newTag">NEW</i>' : ''; return '<button type="button" class="pmT' + (/Quit|Report/.test(base) ? ' danger' : '') + '" data-i="' + i + '"><span class="uiIco">' + ico(PM_ICON[base] || PM_ICON[base.replace(/^Go (off|back on) duty$/, 'Go off duty')] || 'star') + '</span>' + esc(base) + tag + '</button>'; };
  el.innerHTML = '<div class="pmBox v2"><div class="pmTop"><div class="pmHead"><small>' + esc(W.D.name) + ' · ' + hh + ' hrs</small><h2>Paused</h2><p>' + esc(S.cs) + ' · ' + esc(unitName(U())) + ' · ' + esc(L.rankOf(S.xp).name) + '</p></div><button type="button" class="pmResume" data-i="0">' + ICON_FILL_PLAY + 'Resume</button></div><div class="pmSecs">' + groups.map(([gname, list]) => '<div class="pmSec"><small>' + gname + '</small><div class="pmGrid">' + list.map(tile).join('') + '</div></div>').join('') + '</div><div class="pmFoot">' + (activeQ() ? '<b>' + esc(activeQ().title) + '</b> · ' + esc(activeQ().step.goal) : 'Patrol your district') + '</div></div>';
  el.querySelectorAll('[data-i]').forEach((b) => { b.onmouseenter = () => feSound('move'); b.onclick = () => { feSound('ok'); items[+b.dataset.i][1](); }; });
  el.onclick = (e) => { if (e.target === el) close(); };
  setTimeout(() => { const b = el.querySelector('.pmResume'); if (b) b.focus({ preventScroll: true }); }, 50);
  pauseMenu.close = close;
}
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (PHOTO) { photoExit(); return; } const el = fe(); if (!el.hidden && PAUSED_BY_MENU && pauseMenu.close) { pauseMenu.close(); return; } if (!$('modal').hidden || !$('dlg').hidden) return; pauseMenu(); }
  if ((e.key || '').toLowerCase() === ((S.cfg.keys || {}).photo || 'p') && !e.target.closest('input,textarea') && !ATTRACT && $('modal').hidden && fe().hidden) { if (PHOTO) photoExit(); else photoMode(); }
});
// ---- loading screen between districts ----
const TIPS = ['Plan first, every time. Where do you park, where do you stand?', 'Regulars remember how you treat them. So does the city.', 'Side cases change the main story in ways you won\'t see coming.', 'Code 3 gets you there faster, but it costs you later.', 'Press P (or Menu › Photo Mode) for photo mode. Port Meridian is photogenic at 1900 hrs.', 'Equip gear in the Locker. The right boots matter more than you think.', 'Answer streaks multiply your RP. Keep the fire going.', 'Midshift sees both Day and Night units on the street.', 'Exhibit A does not come when called. Exhibit A comes when ready.'];
function travel(did, then) {
  if (FAST) { load(did); if (then) then(); return; }
  const D = DISTRICTS[did], mine = EP.loadLore(did), lore = mine || LORE.find((x) => x.when === 'd' + did) || LORE[0], el = $('ld'), rp = EP.repOf(did);
  el.innerHTML = EP.loadArt(did) + '<div class="ldTxt"><small>Now entering · <span style="color:' + rp.col + '">' + esc(rp.name) + '</span></small><h2>' + esc(D.name) + '</h2>' + (mine ? '<div class="ldLore"><b>📖 From your field journal: ' + esc(mine.title) + '</b><p>' + esc(mine.text) + '</p></div>' : '<p>' + esc(lore.text.split('. ')[0]) + '.</p>') + '</div><div class="ldFoot"><div class="ldTip"><b>Tip</b> ' + esc(rnd(TIPS.concat(EP.TIPS2))) + '</div><div class="ldBar"><i></i></div></div>';
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
function saveS() { exFlush(true); L.saveState(S); const now = performance.now(); if (now - saveVisT < 5000 || ATTRACT) return; saveVisT = now; const el = $('saving'); el.hidden = false; el.classList.add('in'); setTimeout(() => { el.classList.remove('in'); setTimeout(() => { el.hidden = true; }, 400); }, 1400); }
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
    $('phZi').onclick = () => { cam.zUser = Math.min(2.6, cam.zUser * 1.15); }; $('phZo').onclick = () => { cam.zUser = Math.max(.5, cam.zUser / 1.15); };
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
  { const want = Math.min(q === 'low' ? 1 : q === 'medium' ? 1.5 : q === 'ultra' ? 3 : 2, Math.ceil(base * 1.25 * 2) / 2); const gw = Math.min(2, want); if (gw !== GRES) { setGroundRes(gw); if (G && G.chunks) { G.chunks.clear(); G.gen = (G.gen || 0) + 1; } } RES_CAP = want; spriteResTick(true); } cw = innerWidth; ch = innerHeight; cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); cv.style.width = cw + 'px'; cv.style.height = ch + 'px'; cam.zUser = S.zoom || (cw < 600 ? .85 : 1.15); if (!ZINIT) { ZINIT = 1; cam.z = cam.zUser; } }
let ZINIT = 0;
addEventListener('resize', resize); resize();
// soft round light and shadow spots are drawn once per color and stamped, instead of building a new gradient for every lamp every frame
const RADS = new Map();
function radSprite(col) { let c = RADS.get(col); if (c) return c; if (RADS.size > 64) RADS.clear(); c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); RADS.set(col, c); return c; }
// dynamic resolution: watch the real frame rate against the screen's refresh rate (60, 90, 120 Hz...) and trade a little
// sharpness for smoothness when frames run long, then sharpen back up when there's headroom
function drsTick(now, ms) {
  if (S.cfg && S.cfg.drs === false) return; DRS.ts.push(ms); if (DRS.ts.length > 90) DRS.ts.shift(); if (now - DRS.at < 1500 || DRS.ts.length < 20) return; DRS.at = now;
  const sorted = DRS.ts.slice().sort((a, b) => a - b), best = sorted[Math.floor(sorted.length * .1)], med = sorted[Math.floor(sorted.length / 2)];
  DRS.refresh = DRS.hz ? Math.min(DRS.hz, Math.max(6.9, best)) : Math.max(6.9, Math.min(17, best)); // the screen's refresh interval
  let k = DRS.k; if (med > DRS.refresh * 1.3 && k > .6) k = Math.max(.6, k - .1); else if (med < DRS.refresh * 1.08 && k < 1) k = Math.min(1, k + .05);
  if (k !== DRS.k) { DRS.k = k; DRS.ts = []; resize(true); }
  // auto quality: if even the lowest resolution can't keep up, step the graphics tier down; step back up after a long smooth stretch
  if (S.cfg.autoQ !== false) { const tiers = ['low', 'medium', 'high', 'ultra'], qi = tiers.indexOf(S.cfg.quality), cap = tiers.indexOf(S.cfg.qMax || 'high');
    if (k <= .6 && med > DRS.refresh * 1.3) { DRS.lowN = (DRS.lowN || 0) + 1; DRS.hiN = 0; } else if (k >= 1 && med < DRS.refresh * 1.05) { DRS.hiN = (DRS.hiN || 0) + 1; DRS.lowN = 0; } else { DRS.lowN = 0; DRS.hiN = 0; }
    if (DRS.lowN >= 4 && qi > 0) { S.cfg.quality = tiers[qi - 1]; DRS.lowN = 0; DRS.k = 1; resize(true); saveS(); toast('⚙️ Graphics set to ' + S.cfg.quality + ' to keep things smooth.'); }
    else if (DRS.hiN >= 24 && qi < cap) { S.cfg.quality = tiers[qi + 1]; DRS.hiN = 0; resize(true); saveS(); } }
}
// a full-screen menu hides the city behind a blur: keep the last frame instead of redrawing (and re-blurring) it every frame
let FE_EL = null, coverN = 0;
function covered() { const e = FE_EL || (FE_EL = $('fe')); const c = !e.hidden && (e.classList.contains('menuBg') || (paused && e.classList.contains('pauseBg'))); coverN = c ? coverN + 1 : 0; return coverN > 18; }
// while the game is paused behind a conversation and the camera has settled, the street only has slow ambient motion
// (a tree sway, a blinking light), so it is redrawn every other frame; anything faster brings back every frame
let QS = 0;
function quietSkip() { const tz = (CINE.on ? CINE.z : cam.zUser) * (cam.zMul || 1), settled = Math.abs(cam.z - tz) < .001 && (!CINE.on || Math.abs(cam.x - CINE.x) + Math.abs(cam.y - CINE.y) < .6);
  if (!paused || !settled || ATTRACT || FX.rain || FX.storm || (call && call.prio === 1) || PHOTO) { QS = 0; return false; } return (QS = (QS + 1) % 2) === 1; }
function frame(now) { const dt = Math.min(.05, (now - last) / 1000) * (typeof EP !== 'undefined' ? EP.timeScale() : 1); drsTick(now, now - last); last = now; shakeUpdate(dt); cineCam(dt); if (W) { if (ATTRACT) attractUpdate(dt, now); else { update(dt, now); smoothOthers(dt); if ((BKT -= dt) <= 0) { BKT = .25; bkTick(); ringTick(); } COOP.tick(dt, others, call); REW.tick(dt); CITY.tick(dt); PREM.memoryBarks(dt); POL.tick(dt); EP.tick(dt); ON.tick(dt); FEEL.tick(dt); if (!S.seenCine && !EP.busy && W && !inside && !ATTRACT && $('start').hidden && $('modal').hidden && fe().hidden && $('dlg').hidden && !paused) EP.intro(); } if (!covered() && !quietSkip()) render(now); } requestAnimationFrame(frame); }
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
  try { await Promise.all([L.loadBank('../ch5.json'), L.loadFacts('facts.json')]); S.facts = Object.fromEntries(Object.entries(S.facts || {}).filter(([k]) => k[0] === 'F')); } catch (e) { $('loading').textContent = 'Could not load the question bank. Check your connection and refresh.'; return; }
  $('loading').hidden = true;
  attractStart(); requestAnimationFrame(frame); applyCfg(); if (FAST) { S.seenIntro = 1; startScreen(); } else bootSequence(titleScreen);
  COOP.pttInit(); { const b = $('ptt'); if (b) b.innerHTML = ico('radio'); }
  try { net = await startNet(onPlayers); if (net && W && !ATTRACT) { if (net.chatOn) net.chatOn(W.did, chatIn); MG.watch(W.did); EVT.watch(); } if (net && W && !ATTRACT) Promise.resolve(net.join(W.did, S.shift, { cs: S.cs, unit: S.unit, flair: myTokens(), x: P.x, y: P.y, rank: L.rankOf(S.xp).name })).then(commsJoin).catch(() => {}); } catch (e) { net = null; }
  if (!net) $('hOn').textContent = 'Offline';
})();
window.__pc = { gossip: () => gossipLine(), POL, EP, award: (n, w) => award(n, w), SAFE, ON, playStep: (st) => playStep(st), activeQ: () => activeQ(), SIDE, CHAPTERS, get storyBusy() { return storyBusy; }, chapterDone: (i) => chapterDone(CHAPTERS[i]), travel: (d, t) => travel(d, t), openCall: () => { call.accepted = true; openCallScene(call); }, backupScene: (u, o) => backupScene(u, o), hourNow: () => hourNow(), giverPos: (q) => giverPos(q), doorSpot: (l) => doorSpot(l), S, cam, MG, LIFE, OFF, ACAD, EVT, motorPool, RIDE, trustMap, blockTrust, get FX() { return FX; }, get traffic() { return traffic; }, onPlayers: (a, u) => onPlayers(a, u), get others() { return others; }, closeModal: () => closeModal(), get citizens() { return citizens; }, get infos() { return infos; }, get observes() { return observes; }, citizenTalk: (c) => citizenTalk(c), infoPoint: (i) => infoPoint(i), observeScene: (o) => observeScene(o), streetLife: (e) => streetLife(e), dbg: () => ({ paused, storyBusy, storyCool, scene: !!scene, inside: !!inside, cine: document.body.className, overlays: [...document.body.children].filter((e) => !e.hidden && getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().width > 300).map((e) => e.id || e.className).join(",") }), get W() { return W; }, get G() { return G; }, get scene() { return scene; }, get music() { return music; }, moodNow: () => moodNow(), activeQ: () => activeQ(), get peds() { return peds; }, P, stepTarget, promotion, endOfWatch, journal, locker, useAbility, get regs() { return regs; }, npcTalk, queueLoot, enterBuilding, exitBuilding, get inside() { return inside; }, get FX() { return FX; }, enterBoat, unitPicker, setClock: (m) => { clock = m; }, get pboat() { return pboat; }, tapAt: (x, y) => { const [ix, iy] = iso(x, y); const r = cv.getBoundingClientRect(); tap(r.left + r.width / 2 + (ix - cam.x) * cam.z, r.top + r.height / 2 + (iy - 20 - cam.y) * cam.z); }, dispatchCall, get call() { return call; }, finalCall, chapterExam, PREM, COOP, REW, get CITY() { return CITY; }, get PUR() { return PUR; }, profileCard: (u, c) => profileCard(u, c), get myUid() { return myUid; }, get RIDING() { return RIDING; }, get LEFT() { return LEFT; }, districtBoard, goTo, load, get others() { return others; } };

// repeat visits open from the device's cache (skipped in tests so they always run the files on disk)
if ('serviceWorker' in navigator && !/[?&](mock|skiptitle)\b/.test(location.search) && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
