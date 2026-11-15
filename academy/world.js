// Patrol City world: district maps (tiles, buildings, props) and the isometric art, all drawn in code.
import { DISTRICTS, LANDMARKS } from './data.js';

export const N = 46, TW = 64, TH = 32;
// tile kinds
export const T = { ROAD: 1, WALK: 2, GRASS: 3, PLAZA: 4, LOT: 5, WATER: 6, BLDG: 7, FENCE: 8, SAND: 9, GRAVEL: 10, RAIL: 11 };
const WALKABLE = new Set([T.ROAD, T.WALK, T.GRASS, T.PLAZA, T.LOT, T.SAND, T.GRAVEL, T.RAIL]);
const DRIVABLE = new Set([T.ROAD, T.LOT]);

export function iso(x, y) { return [(x - y) * TW / 2, (x + y) * TH / 2]; }
export function unIso(sx, sy) { const a = sx / (TW / 2), b = sy / (TH / 2); return [(a + b) / 2, (b - a) / 2]; }

function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const isRoadLine = (v) => v % 11 === 0 || v % 11 === 1;

// ---------- building the district map ----------
export function buildDistrict(did) {
  const D = DISTRICTS[did], R = rng(9001 + did * 7919);
  const g = new Uint8Array(N * N), at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 0 : g[y * N + x]);
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < N && y < N) g[y * N + x] = v; };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) set(x, y, isRoadLine(x) || isRoadLine(y) ? T.ROAD : T.WALK);
  const W = { did, D, g, at, set, buildings: [], props: [], lots: [], lights: [], doors: {}, parking: [], walk: [], gates: [], spawn: null, carSpot: null, river: !!D.river };
  if (D.river) for (let y = 0; y < N; y++) for (let x = 35; x < N; x++) set(x, y, x === 35 ? T.SAND : T.WATER);
  let li = 0;
  for (let by = 0; by < 4; by++) for (let bx = 0; bx < 4; bx++) {
    const ox = 2 + bx * 11, oy = 2 + by * 11;
    if (D.river && bx === 3) continue;
    const kind = D.lots[li % D.lots.length]; li++;
    for (let y = oy + 1; y <= oy + 7; y++) for (let x = ox + 1; x <= ox + 7; x++) set(x, y, T.GRASS);
    const lot = { kind, ox, oy, bx, by, name: (LANDMARKS[kind] || {}).name || '', door: [ox + 4, oy + 8], info: [ox + 6, oy + 8] };
    W.lots.push(lot);
    fill(W, lot, R);
    // street lights at block corners
    [[ox, oy], [ox + 8, oy], [ox, oy + 8], [ox + 8, oy + 8]].forEach(([x, y]) => W.props.push({ t: 'lamp', x: x + .5, y: y + .5 }));
  }
  // gates to the neighbouring districts (west road and east road)
  W.gates.push({ to: (did + 4) % 5, x: 0, y: 11, dir: 'w' }, { to: (did + 1) % 5, x: D.river ? 33 : N - 1, y: D.river ? 0 : 22, dir: D.river ? 'n' : 'e' });
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = at(x, y); if (v === T.WALK) W.walk.push([x, y]); if (v === T.LOT) W.parking.push([x, y]); }
  const st = W.lots.find((l) => l.kind === 'hq' || l.kind === 'substation') || W.lots[0];
  W.spawn = [st.ox + 4, st.oy + 8]; W.station = st;
  W.walkable = (x, y) => WALKABLE.has(at(x, y)) && !W.blocked.has(y * N + x);
  W.drivable = (x, y) => DRIVABLE.has(at(x, y)) && !W.blocked.has(y * N + x);
  W.blocked = new Set();
  W.props.forEach((p) => { if (p.block) W.blocked.add(Math.floor(p.y) * N + Math.floor(p.x)); });
  return W;
}

const PAL = {
  downtown: ['#8ea3b8', '#7b8fa6', '#a7b5c4', '#6f8299', '#c2c9d2', '#566a82'],
  commercial: ['#d9b48f', '#c9a27a', '#e0c9a6', '#b58f6b', '#d6d0c4', '#a77b5c'],
  residential: ['#e8d8b8', '#cfe0d0', '#e7c9b7', '#d4dbe6', '#f1e3c6', '#c9d8b8'],
  industrial: ['#9aa0a6', '#8b9198', '#b0a48f', '#7f878f', '#a3a9ad', '#8a8170'],
  civic: ['#e6e1d6', '#d8d2c4', '#cfc8b8', '#ece7dc', '#c9c3b5', '#b9b2a2']
};
function B(W, x, y, w, d, h, o) { W.buildings.push(Object.assign({ x, y, w, d, h }, o)); for (let yy = y; yy < y + d; yy++) for (let xx = x; xx < x + w; xx++) W.set(xx, yy, T.BLDG); }
function P(W, t, x, y, o) { W.props.push(Object.assign({ t, x, y }, o)); }
function area(W, x0, y0, x1, y1, v) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) W.set(x, y, v); }

function fill(W, L, R) {
  const { ox, oy, kind } = L, th = W.D.theme, pal = PAL[th], pick = (a) => a[Math.floor(R() * a.length)];
  const x0 = ox + 1, y0 = oy + 1, x1 = ox + 7, y1 = oy + 7, lm = LANDMARKS[kind] || {};
  const tree = (x, y, k) => P(W, k || (W.river ? 'palm' : 'tree'), x + .5, y + .5, { block: true, s: .8 + R() * .4 });
  const park = (cars) => { for (let i = 0; i < cars; i++) { const x = x0 + Math.floor(R() * 7), y = y1 - Math.floor(R() * 2); if (W.at(x, y) === T.LOT) P(W, 'car', x + .5, y + .5, { parked: true, color: pick(CAR_COLORS), dir: R() < .5 ? 0 : 2, block: true }); } };
  switch (kind) {
    case 'tower': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0 + 1, y0 + 1, 5, 4, 150 + Math.floor(R() * 140), { style: 'glass', color: pick(pal), sign: '' }); tree(x0, y1); tree(x1, y1); break;
    case 'hq': case 'substation': {
      area(W, x0, y0, x1, y1, T.LOT); const big = kind === 'hq';
      B(W, x0 + 1, y0, big ? 5 : 4, big ? 4 : 3, big ? 70 : 52, { style: 'brick', color: '#3d4f7a', sign: 'POLICE', trim: '#f5b800' });
      P(W, 'flag', x1 - .2, y0 + .6, { block: true });
      for (let i = 0; i < 3; i++) P(W, 'car', x0 + 1.5 + i * 2, y1 - .5, { parked: true, police: true, dir: 0, block: true });
      W.carSpot = [x0 + 1.5, y1 - 2.5]; break;
    }
    case 'dispatch': area(W, x0, y0, x1, y1, T.LOT); B(W, x0 + 1, y0 + 1, 5, 4, 58, { style: 'concrete', color: '#c4ccd6', sign: 'DISPATCH', dishes: true }); park(3); break;
    case 'radio': P(W, 'mast', x0 + 3.5, y0 + 3.5, { block: true }); B(W, x0 + 5, y0 + 1, 2, 2, 22, { style: 'concrete', color: '#b7bec7' }); tree(x0, y1); tree(x0 + 1, y1); break;
    case 'bank': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0 + 1, y0 + 1, 5, 4, 84, { style: 'stone', color: '#ddd5c4', sign: 'BANK', columns: true }); tree(x0, y1); tree(x1, y1); break;
    case 'records': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0 + 1, y0 + 1, 4, 4, 64, { style: 'concrete', color: '#aab6c3', sign: 'RECORDS' }); tree(x1, y0); tree(x1, y1); break;
    case 'diner': area(W, x0, y0, x1, y1, T.LOT); B(W, x0 + 1, y0 + 1, 4, 3, 34, { style: 'diner', color: '#f2efe8', sign: 'DINER', trim: '#d22d3d' }); park(3); break;
    case 'garage': B(W, x0, y0, 7, 6, 74, { style: 'garage', color: '#9aa1a8', sign: 'PARK' }); break;
    case 'parking': case 'lot': area(W, x0, y0, x1, y1, kind === 'lot' ? T.GRAVEL : T.LOT); if (kind === 'parking') { for (let i = 0; i < 6; i++) { const x = x0 + Math.floor(R() * 7), y = y0 + Math.floor(R() * 7); if (W.at(x, y) === T.LOT && !W.props.some((p) => Math.floor(p.x) === x && Math.floor(p.y) === y)) P(W, 'car', x + .5, y + .5, { parked: true, color: pick(CAR_COLORS), dir: R() < .5 ? 0 : 1, block: true }); } P(W, 'lamp', x0 + 3.5, y0 + 3.5); } else { P(W, 'crate', x0 + 2.5, y0 + 2.5, { block: true }); P(W, 'crate', x0 + 5.5, y0 + 4.5, { block: true }); } break;
    case 'shop': case 'pawn': case 'pharmacy': case 'bonds': case 'defender': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 7, 3, 38 + Math.floor(R() * 14), { style: 'shop', color: pick(pal), sign: lm.sign || pick(['MARKET', 'CAFE', 'SALON', 'DELI', 'BOOKS', 'NAILS']), awning: pick(['#d22d3d', '#1f7a5a', '#2c5aa0', '#d98a1c']) }); park(3); break;
    case 'plaza': area(W, x0, y0, x1, y1, T.PLAZA); P(W, 'fountain', x0 + 3.5, y0 + 3.5, { block: true }); tree(x0 + 1, y0 + 1); tree(x1 - 1, y0 + 1); tree(x0 + 1, y1 - 1); tree(x1 - 1, y1 - 1); P(W, 'bench', x0 + 3.5, y1 - .3); break;
    case 'park': for (let i = 0; i < 9; i++) { const x = x0 + Math.floor(R() * 7), y = y0 + Math.floor(R() * 7); if (W.at(x, y) === T.GRASS) tree(x, y); } area(W, x0 + 3, y0, x0 + 3, y1, T.PLAZA); P(W, 'bench', x0 + 3.5, y0 + 2.5); P(W, 'bench', x0 + 3.5, y0 + 5.5); break;
    case 'gas': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 3, 2, 32, { style: 'shop', color: '#f2f2f2', sign: 'GAS', awning: '#d22d3d' }); P(W, 'canopy', x0 + 4.5, y0 + 4, { block: false }); P(W, 'pump', x0 + 3.5, y0 + 4.5, { block: true }); P(W, 'pump', x0 + 5.5, y0 + 4.5, { block: true }); park(2); break;
    case 'mall': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 7, 3, 42, { style: 'shop', color: '#e3d3bb', sign: 'PLAZA', awning: '#2c5aa0', fronts: 4 }); park(5); break;
    case 'motel': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 7, 2, 50, { style: 'motel', color: '#e8c39e', sign: 'MOTEL', trim: '#1f7a5a' }); B(W, x1 - 1, y0 + 2, 2, 3, 50, { style: 'motel', color: '#e8c39e', trim: '#1f7a5a' }); park(3); break;
    case 'autoshop': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 5, 4, 40, { style: 'bays', color: '#c9ccd0', sign: 'AUTO' }); park(4); break;
    case 'houses': for (let i = 0; i < 4; i++) { const hx = x0 + (i % 2) * 4, hy = y0 + Math.floor(i / 2) * 4; B(W, hx, hy, 2, 2, 26, { style: 'house', color: pick(pal), roof: pick(['#8a4b3c', '#5b6470', '#7a5a3a', '#3f5466']) }); W.set(hx + 2, hy + 1, T.PLAZA); tree(hx + 2, hy + (i < 2 ? 2 : 0) + (R() < .5 ? 0 : 0)); } break;
    case 'apartments': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 6, 4, 112, { style: 'apartments', color: pick(pal), sign: '' }); park(3); tree(x1, y0); break;
    case 'firestation': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0, y0, 5, 4, 48, { style: 'bays', color: '#b5302b', sign: 'FIRE 3', trim: '#f2f2f2' }); P(W, 'firetruck', x0 + 2.5, y1 - .5, { block: true }); break;
    case 'stadium': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 7, 6, 58, { style: 'stadium', color: '#cfd5dc' }); break;
    case 'church': B(W, x0 + 1, y0 + 1, 4, 5, 46, { style: 'stone', color: '#efe8da', roof: '#5b6470' }); P(W, 'steeple', x0 + 2.5, y0 + 1.5, { block: true }); tree(x1, y1); tree(x0, y1); break;
    case 'school': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0, y0, 6, 4, 44, { style: 'brick', color: '#a65a42', sign: 'SCHOOL', trim: '#f2f2f2' }); tree(x1, y1); tree(x0, y1); break;
    case 'warehouse': area(W, x0, y0, x1, y1, T.GRAVEL); B(W, x0 + 1, y0, 6, 5, 52, { style: 'corrugated', color: pick(['#8f9aa4', '#a5937a', '#7f8b84', '#9c8f86']), sign: 'WHSE ' + String.fromCharCode(65 + Math.floor(R() * 6)), docks: true }); for (let x = x0; x <= x1; x++) if (x !== x0 + 3) W.set(x, y1, T.FENCE); break;
    case 'storage': area(W, x0, y0, x1, y1, T.GRAVEL); for (let i = 0; i < 3; i++) B(W, x0, y0 + i * 2 + 1, 7, 1, 20, { style: 'storage', color: '#d1d4d6', trim: '#e2742b' }); break;
    case 'railyard': area(W, x0, y0, x1, y1, T.GRAVEL); for (let x = x0; x <= x1; x++) { W.set(x, y0 + 2, T.RAIL); W.set(x, y0 + 5, T.RAIL); } P(W, 'boxcar', x0 + 2, y0 + 2.5, { block: true, color: '#8b3a2a' }); P(W, 'boxcar', x0 + 5, y0 + 5.5, { block: true, color: '#2f5d7a' }); break;
    case 'lumber': area(W, x0, y0, x1, y1, T.GRAVEL); B(W, x0, y0, 3, 3, 30, { style: 'corrugated', color: '#a5937a', sign: 'LUMBER' }); for (let i = 0; i < 5; i++) P(W, 'lumberstack', x0 + 4.5 + (i % 2) * 1.6, y0 + 1 + Math.floor(i / 2) * 2, { block: true }); break;
    case 'courthouse': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0, y0, 7, 5, 92, { style: 'stone', color: '#ece6d8', sign: 'COURT', columns: true, dome: true }); tree(x0, y1); tree(x1, y1); break;
    case 'jail': area(W, x0, y0, x1, y1, T.GRAVEL); B(W, x0 + 1, y0 + 1, 5, 4, 72, { style: 'jail', color: '#b9b4a6', sign: 'JAIL' }); for (let x = x0; x <= x1; x++) { W.set(x, y0, T.FENCE); if (x !== x0 + 3) W.set(x, y1, T.FENCE); } for (let y = y0; y <= y1; y++) { W.set(x0, y, T.FENCE); W.set(x1, y, T.FENCE); } break;
    case 'sallyport': area(W, x0, y0, x1, y1, T.LOT); B(W, x0 + 1, y0, 5, 3, 44, { style: 'bays', color: '#b9b4a6', sign: 'SALLY PORT' }); P(W, 'car', x0 + 3.5, y1 - 1.5, { parked: true, police: true, dir: 1, block: true }); break;
    default: area(W, x0, y0, x1, y1, T.GRASS); tree(x0 + 2, y0 + 2); tree(x0 + 4, y0 + 5);
  }
}
export const CAR_COLORS = ['#c0392b', '#2c3e50', '#ecf0f1', '#7f8c8d', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#34495e', '#d35400', '#bdc3c7', '#16a085'];

// ---------- art ----------
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = Math.max(0, Math.min(255, Math.round(r * f))); g = Math.max(0, Math.min(255, Math.round(g * f))); b = Math.max(0, Math.min(255, Math.round(b * f))); return 'rgb(' + r + ',' + g + ',' + b + ')'; };
export { shade };

// ground: drawn once per district into one large canvas
export function drawGround(W) {
  const pad = 80, w = N * TW + pad * 2, h = N * TH + pad * 2, c = document.createElement('canvas');
  c.width = w; c.height = h; const g = c.getContext('2d'), R = rng(77 + W.did);
  const ox = N * TW / 2 + pad, oy = pad;
  g.fillStyle = '#1a2230'; g.fillRect(0, 0, w, h);
  const dia = (x, y) => { const [sx, sy] = iso(x, y); g.beginPath(); g.moveTo(ox + sx, oy + sy); g.lineTo(ox + sx + TW / 2, oy + sy + TH / 2); g.lineTo(ox + sx, oy + sy + TH); g.lineTo(ox + sx - TW / 2, oy + sy + TH / 2); g.closePath(); };
  const col = { [T.ROAD]: '#3b4048', [T.WALK]: '#b8b2a5', [T.GRASS]: '#5d8f3f', [T.PLAZA]: '#d2c8b3', [T.LOT]: '#4b5059', [T.WATER]: '#2d6c97', [T.BLDG]: '#6b6b6b', [T.FENCE]: '#7f8a6e', [T.SAND]: '#d9c58f', [T.GRAVEL]: '#8d877c', [T.RAIL]: '#7d756a' };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const v = W.at(x, y); let c0 = col[v] || '#555';
    if (v === T.GRASS) c0 = shade('#5d8f3f', .9 + R() * .2); if (v === T.WATER) c0 = shade('#2d6c97', .92 + R() * .12);
    dia(x, y); g.fillStyle = c0; g.fill();
    const [sx, sy] = iso(x, y), cx = ox + sx, cy = oy + sy + TH / 2;
    if (v === T.WALK || v === T.PLAZA) { g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 1; dia(x, y); g.stroke(); }
    if (v === T.GRASS) { for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(255,255,255,' + (.04 + R() * .06) + ')'; g.fillRect(cx - 18 + R() * 36, cy - 6 + R() * 12, 2, 2); } }
    if (v === T.LOT && (x + y) % 2 === 0) { g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx - 14, cy - 7 + 7); g.lineTo(cx - 2, cy - 1 + 7); g.stroke(); }
    if (v === T.ROAD) {
      for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,' + R() * .05 + ')'; g.fillRect(cx - 20 + R() * 40, cy - 6 + R() * 12, 1.5, 1.5); }
      const rr = isRoadLine(y), rc = isRoadLine(x);
      if (rr && !rc && y % 11 === 0 && x % 2 === 0) { // dashed centre line on the edge between the two lanes (row road)
        const [ax, ay] = iso(x, y + 1), [bx2, by2] = iso(x + 1, y + 1); g.strokeStyle = '#e7c34a'; g.lineWidth = 2; g.beginPath(); g.moveTo(ox + ax + (bx2 - ax) * .2, oy + ay + (by2 - ay) * .2); g.lineTo(ox + ax + (bx2 - ax) * .8, oy + ay + (by2 - ay) * .8); g.stroke();
      }
      if (rc && !rr && x % 11 === 0 && y % 2 === 0) {
        const [ax, ay] = iso(x + 1, y), [bx2, by2] = iso(x + 1, y + 1); g.strokeStyle = '#e7c34a'; g.lineWidth = 2; g.beginPath(); g.moveTo(ox + ax + (bx2 - ax) * .2, oy + ay + (by2 - ay) * .2); g.lineTo(ox + ax + (bx2 - ax) * .8, oy + ay + (by2 - ay) * .8); g.stroke();
      }
      if (rr && !rc && (x % 11 === 2 || x % 11 === 10)) { g.strokeStyle = 'rgba(240,240,240,.85)'; g.lineWidth = 3; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(cx + k * 6 - 6, cy + k * 3 - 3 + 3); g.lineTo(cx + k * 6 + 6, cy + k * 3 + 3 - 9); g.stroke(); } }
      if (rc && !rr && (y % 11 === 2 || y % 11 === 10)) { g.strokeStyle = 'rgba(240,240,240,.85)'; g.lineWidth = 3; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(cx + k * 6 - 6, cy - k * 3 + 3); g.lineTo(cx + k * 6 + 6, cy - k * 3 + 9); g.stroke(); } }
    }
    if (v === T.RAIL) { g.strokeStyle = '#4a3b2c'; g.lineWidth = 3; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(cx - 24 + k * 13, cy - 4 + k * 0); g.lineTo(cx - 18 + k * 13, cy + 6); g.stroke(); } g.strokeStyle = '#b8b8b8'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx - 32, cy - 2); g.lineTo(cx, cy + 14); g.moveTo(cx - 22, cy - 8); g.lineTo(cx + 10, cy + 8); g.stroke(); }
    if (v === T.FENCE) { g.strokeStyle = '#c7ccd1'; g.lineWidth = 1; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(cx - 24 + k * 9, cy - 10); g.lineTo(cx - 24 + k * 9, cy + 2); g.stroke(); } }
    if (v === T.WATER) { g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 10 + R() * 6, cy); g.quadraticCurveTo(cx, cy - 3, cx + 10, cy); g.stroke(); }
  }
  // curbs: darker edge where a walkway meets a road
  g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (W.at(x, y) === T.WALK) {
    const e = (nx, ny, a, b) => { if (W.at(nx, ny) === T.ROAD) { const [ax, ay] = iso(a[0], a[1]), [bx2, by2] = iso(b[0], b[1]); g.beginPath(); g.moveTo(ox + ax, oy + ay); g.lineTo(ox + bx2, oy + by2); g.stroke(); } };
    e(x + 1, y, [x + 1, y], [x + 1, y + 1]); e(x, y + 1, [x, y + 1], [x + 1, y + 1]); e(x - 1, y, [x, y], [x, y + 1]); e(x, y - 1, [x, y], [x + 1, y]);
  }
  return { canvas: c, ox, oy };
}

// a building drawn once into its own canvas; night version lights some windows
export function drawBuilding(b, night, sun) {
  const R = rng(b.x * 131 + b.y * 977 + b.h);
  const A = iso(b.x, b.y), Bp = iso(b.x + b.w, b.y), C = iso(b.x + b.w, b.y + b.d), Dp = iso(b.x, b.y + b.d);
  const extra = b.dome ? 60 : b.style === 'house' ? 26 : 30, shLen = sun ? sun.len : 0;
  const minX = Dp[0] - 6, maxX = Bp[0] + 6 + shLen, minY = A[1] - b.h - extra, maxY = C[1] + 6 + shLen * .5;
  const c = document.createElement('canvas'); c.width = Math.ceil(maxX - minX); c.height = Math.ceil(maxY - minY);
  const g = c.getContext('2d'), tx = (p) => [p[0] - minX, p[1] - minY];
  const poly = (pts, fill) => { g.beginPath(); pts.forEach((p, i) => { const q = tx(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } };
  const up = (p, h) => [p[0], p[1] - h];
  // cast shadow on the ground toward the lower right
  if (sun && sun.len) { g.globalAlpha = sun.a; poly([Bp, C, Dp, [Dp[0] + sun.len, Dp[1] + sun.len * .5], [C[0] + sun.len, C[1] + sun.len * .5], [Bp[0] + sun.len, Bp[1] + sun.len * .5]], '#0b1220'); g.globalAlpha = 1; }
  const base = b.color || '#999', left = shade(base, .78), right = shade(base, .62), top = shade(base, 1.08);
  const h = b.h;
  // walls
  poly([Dp, C, up(C, h), up(Dp, h)], left);
  poly([C, Bp, up(Bp, h), up(C, h)], right);
  // wall texture
  const face = (P0, P1, shadeF, cols, rows, opts) => {
    const len = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const t0 = (k + .18) / cols, t1 = (k + .82) / cols, v0 = opts.base + r * opts.step, v1 = v0 + opts.wh;
      if (v1 > h - 6) continue;
      const pa = [P0[0] + (P1[0] - P0[0]) * t0, P0[1] + (P1[1] - P0[1]) * t0], pb = [P0[0] + (P1[0] - P0[0]) * t1, P0[1] + (P1[1] - P0[1]) * t1];
      const lit = night && R() < (opts.lit || .35);
      poly([up(pa, v0), up(pb, v0), up(pb, v1), up(pa, v1)], lit ? (R() < .3 ? '#ffe9a8' : '#ffd36b') : opts.glass || shade('#1d2a3a', shadeF));
      if (!lit && !night) { g.globalAlpha = .25; poly([up(pa, v1 - 2), up(pb, v1 - 2), up(pb, v1), up(pa, v1)], '#ffffff'); g.globalAlpha = 1; }
      if (lit && opts.onLit) opts.onLit(pa, pb, v0);
    }
    return len;
  };
  const st = b.style;
  const winLit = [];
  const onLit = (pa, pb, v0) => { if (winLit.length < 6) winLit.push([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2 - v0 - 6]); };
  if (st === 'glass') {
    const rows = Math.floor((h - 10) / 14);
    face(Dp, C, 1.0, b.w * 3, rows, { base: 8, step: 14, wh: 10, glass: shade('#5b7aa0', .9), lit: .4, onLit });
    face(C, Bp, .8, b.d * 3, rows, { base: 8, step: 14, wh: 10, glass: shade('#4a6788', .9), lit: .4, onLit });
  } else if (st === 'house') {
    face(Dp, C, 1, 2, 1, { base: 8, step: 10, wh: 10, lit: .6, onLit });
    face(C, Bp, .8, 2, 1, { base: 8, step: 10, wh: 10, lit: .5, onLit });
  } else if (st === 'storage') {
    for (let k = 0; k < b.w * 2; k++) { const t0 = (k + .15) / (b.w * 2), t1 = (k + .85) / (b.w * 2); const pa = [Dp[0] + (C[0] - Dp[0]) * t0, Dp[1] + (C[1] - Dp[1]) * t0], pb = [Dp[0] + (C[0] - Dp[0]) * t1, Dp[1] + (C[1] - Dp[1]) * t1]; poly([pa, pb, up(pb, 15), up(pa, 15)], b.trim || '#e2742b'); }
  } else if (st === 'corrugated' || st === 'bays' || st === 'garage' || st === 'stadium') {
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1;
    for (let k = 0; k < b.w * 6; k++) { const t = k / (b.w * 6), p = [Dp[0] + (C[0] - Dp[0]) * t, Dp[1] + (C[1] - Dp[1]) * t], q0 = tx(p), q1 = tx(up(p, h)); g.beginPath(); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); g.stroke(); }
    if (st === 'bays' || b.docks) { const n = st === 'bays' ? Math.max(2, b.w - 1) : b.w; for (let k = 0; k < n; k++) { const t0 = (k + .15) / n, t1 = (k + .85) / n, pa = [Dp[0] + (C[0] - Dp[0]) * t0, Dp[1] + (C[1] - Dp[1]) * t0], pb = [Dp[0] + (C[0] - Dp[0]) * t1, Dp[1] + (C[1] - Dp[1]) * t1]; poly([pa, pb, up(pb, Math.min(30, h - 10)), up(pa, Math.min(30, h - 10))], st === 'bays' && b.trim === '#f2f2f2' ? '#d9dde1' : '#5a6068'); g.strokeStyle = 'rgba(255,255,255,.18)'; for (let s = 1; s < 5; s++) { const a = tx(up(pa, s * 6)), bb = tx(up(pb, s * 6)); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(bb[0], bb[1]); g.stroke(); } } }
    if (st === 'garage') { for (let f = 1; f < 4; f++) { poly([up(Dp, f * 18 - 8), up(C, f * 18 - 8), up(C, f * 18), up(Dp, f * 18)], '#2b3036'); poly([up(C, f * 18 - 8), up(Bp, f * 18 - 8), up(Bp, f * 18), up(C, f * 18)], '#24282d'); } }
    if (st === 'stadium') { face(Dp, C, 1, b.w * 2, 2, { base: 10, step: 18, wh: 8, lit: .9, onLit }); }
  } else {
    const rows = Math.max(1, Math.floor((h - 14) / 18));
    face(Dp, C, 1, b.w * 2, rows, { base: st === 'shop' || st === 'diner' ? 4 : 10, step: 18, wh: st === 'shop' || st === 'diner' ? 16 : 11, lit: st === 'apartments' ? .5 : .35, onLit, glass: st === 'shop' || st === 'diner' ? shade('#a9c7dd', .85) : null });
    face(C, Bp, .8, b.d * 2, rows, { base: 10, step: 18, wh: 11, lit: .3, onLit });
    if (st === 'apartments') { g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; for (let r = 1; r < rows; r++) { const a = tx(up(Dp, r * 18 + 2)), bb = tx(up(C, r * 18 + 2)); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(bb[0], bb[1]); g.stroke(); } }
    if (b.columns) { for (let k = 0; k <= b.w * 2; k++) { const t = k / (b.w * 2), p = [Dp[0] + (C[0] - Dp[0]) * t, Dp[1] + (C[1] - Dp[1]) * t]; poly([[p[0] - 2, p[1] - 1], [p[0] + 2, p[1] + 1], up([p[0] + 2, p[1] + 1], h * .62), up([p[0] - 2, p[1] - 1], h * .62)], '#f6f2ea'); } poly([up(Dp, h * .62), up(C, h * .62), up(C, h * .7), up(Dp, h * .7)], shade(base, .95)); }
  }
  if (b.awning) { const aw = 7; poly([up(Dp, 18), up(C, 18), [C[0] + 8, C[1] + 4 - 18 + aw], [Dp[0] + 8, Dp[1] + 4 - 18 + aw]], b.awning); g.globalAlpha = .25; for (let k = 0; k < b.w * 3; k += 2) { const t0 = k / (b.w * 3), t1 = (k + 1) / (b.w * 3), pa = [Dp[0] + (C[0] - Dp[0]) * t0, Dp[1] + (C[1] - Dp[1]) * t0], pb = [Dp[0] + (C[0] - Dp[0]) * t1, Dp[1] + (C[1] - Dp[1]) * t1]; poly([up(pa, 18), up(pb, 18), [pb[0] + 8, pb[1] - 7], [pa[0] + 8, pa[1] - 7]], '#ffffff'); } g.globalAlpha = 1; }
  if (b.trim) { poly([up(Dp, h - 5), up(C, h - 5), up(C, h), up(Dp, h)], b.trim); poly([up(C, h - 5), up(Bp, h - 5), up(Bp, h), up(C, h)], shade(b.trim, .8)); }
  // roof
  if (st === 'house') {
    const rh = 22, m1 = [(A[0] + Dp[0]) / 2, (A[1] + Dp[1]) / 2], m2 = [(Bp[0] + C[0]) / 2, (Bp[1] + C[1]) / 2];
    const roof = b.roof || '#7a5a3a';
    poly([up(A, h), up(Bp, h), up(m2, h + rh), up(m1, h + rh)], shade(roof, .8));
    poly([up(Dp, h), up(C, h), up(m2, h + rh), up(m1, h + rh)], roof);
    poly([up(C, h), up(Bp, h), up(m2, h + rh)], shade(base, .55));
  } else {
    poly([up(A, h), up(Bp, h), up(C, h), up(Dp, h)], st === 'stadium' ? '#3f8a3a' : top);
    if (st === 'stadium') { g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.5; const m = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2 - h]; const q = tx(m); g.beginPath(); g.ellipse(q[0], q[1], 18, 9, 0, 0, Math.PI * 2); g.stroke(); poly([up([A[0], A[1] + 6], h + 1), up([Bp[0] - 12, Bp[1]], h + 1), up([C[0], C[1] - 6], h + 1), up([Dp[0] + 12, Dp[1]], h + 1)], null); }
    // parapet
    g.strokeStyle = shade(base, 1.25); g.lineWidth = 2; poly([up(A, h), up(Bp, h), up(C, h), up(Dp, h)]); g.stroke();
    // roof units
    if (st !== 'stadium' && st !== 'storage') for (let k = 0; k < Math.min(3, b.w); k++) { const cx = b.x + 1 + R() * (b.w - 1.5), cy = b.y + .5 + R() * (b.d - 1.2); mini(g, tx, cx, cy, .5, .4, 7, h, '#c7ccd2'); }
    if (b.dishes) { const p = tx(up(iso(b.x + b.w * .6, b.y + b.d * .4), h + 10)); g.fillStyle = '#eef1f4'; g.beginPath(); g.ellipse(p[0], p[1], 8, 5, -.5, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#8a9099'; g.stroke(); }
    if (b.dome) { const p = tx(up(iso(b.x + b.w / 2, b.y + b.d / 2), h)); const gr = g.createRadialGradient(p[0] - 8, p[1] - 30, 4, p[0], p[1] - 16, 34); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#9aa9b5'); g.fillStyle = gr; g.beginPath(); g.ellipse(p[0], p[1] - 4, 28, 14, 0, Math.PI, 0); g.lineTo(p[0] + 28, p[1] - 4); g.ellipse(p[0], p[1] - 4, 28, 30, 0, 0, Math.PI, true); g.fill(); }
  }
  // sign on the front (left) face
  if (b.sign) {
    const [px, py] = tx(up([Dp[0] + (C[0] - Dp[0]) * .5, Dp[1] + (C[1] - Dp[1]) * .5], Math.min(h - 8, st === 'shop' || st === 'diner' ? 28 : h * .78)));
    g.save(); g.translate(px, py); g.transform(1, .5, 0, 1, 0, 0);
    g.font = '800 ' + (b.sign.length > 6 ? 10 : 12) + 'px "Barlow Condensed",system-ui,sans-serif'; const tw = g.measureText(b.sign).width + 10;
    g.fillStyle = night ? 'rgba(10,16,30,.92)' : 'rgba(10,16,30,.85)'; g.fillRect(-tw / 2, -9, tw, 15);
    g.fillStyle = b.sign === 'POLICE' ? '#f5b800' : night ? '#ffe9a8' : '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.sign, 0, -1.5); g.restore();
    if (night) winLit.push([px + minX, py + minY]);
  }
  // edge highlight
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; const e0 = tx(C), e1 = tx(up(C, h)); g.beginPath(); g.moveTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.stroke();
  return { canvas: c, x: minX, y: minY, lights: winLit.map((p) => [p[0], p[1]]) };
}
function mini(g, tx, x, y, w, d, h, base, color) {
  const A = iso(x, y), B2 = iso(x + w, y), C = iso(x + w, y + d), D2 = iso(x, y + d), up = (p, k) => [p[0], p[1] - k];
  const poly = (pts, f) => { g.beginPath(); pts.forEach((p, i) => { const q = tx(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.fillStyle = f; g.fill(); };
  poly([up(D2, base), up(C, base), up(C, base + h), up(D2, base + h)], shade(color, .8));
  poly([up(C, base), up(B2, base), up(B2, base + h), up(C, base + h)], shade(color, .65));
  poly([up(A, base + h), up(B2, base + h), up(C, base + h), up(D2, base + h)], color);
}

// props, people and cars are drawn each frame (cheap shapes)
export function drawProp(g, p, sx, sy, t, night) {
  switch (p.t) {
    case 'tree': case 'palm': {
      const s = p.s || 1; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sx + 6, sy + 4, 16 * s, 7 * s, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#5b3d25'; g.fillRect(sx - 2, sy - (p.t === 'palm' ? 34 : 18) * s, 4, (p.t === 'palm' ? 34 : 18) * s);
      if (p.t === 'palm') { g.strokeStyle = '#2f7a35'; g.lineWidth = 4; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + Math.sin(t / 900 + p.x) * .06; g.beginPath(); g.moveTo(sx, sy - 34 * s); g.quadraticCurveTo(sx + Math.cos(a) * 12, sy - 40 * s, sx + Math.cos(a) * 20 * s, sy - 30 * s + Math.sin(a) * 6); g.stroke(); } break; }
      const sway = Math.sin(t / 1100 + p.x * 3) * 1.2;
      [[0, -30, 15, '#3f7a33'], [-7, -24, 11, '#4b8a3b'], [7, -25, 11, '#3a7030'], [2, -36, 10, '#58994a']].forEach(([dx, dy, r, c]) => { g.fillStyle = night ? shade(c, .7) : c; g.beginPath(); g.arc(sx + dx * s + sway, sy + dy * s, r * s, 0, Math.PI * 2); g.fill(); });
      g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(sx - 4 * s + sway, sy - 38 * s, 5 * s, 0, Math.PI * 2); g.fill(); break;
    }
    case 'lamp': g.fillStyle = '#2b2f36'; g.fillRect(sx - 1.5, sy - 40, 3, 40); g.fillRect(sx - 1.5, sy - 40, 12, 3); g.fillStyle = night ? '#fff3c4' : '#d9dde2'; g.fillRect(sx + 7, sy - 38, 6, 3); break;
    case 'flag': g.fillStyle = '#c9ced4'; g.fillRect(sx - 1, sy - 56, 2, 56); { const w = Math.sin(t / 300) * 2; g.fillStyle = '#b22234'; g.fillRect(sx + 1, sy - 56, 18, 10 + w * .2); g.fillStyle = '#3c3b6e'; g.fillRect(sx + 1, sy - 56, 8, 5); } break;
    case 'mast': { g.strokeStyle = '#c0392b'; g.lineWidth = 2; for (let k = 0; k < 9; k++) { const y0 = sy - k * 22, y1 = sy - (k + 1) * 22, w0 = 14 - k * 1.3, w1 = 14 - (k + 1) * 1.3; g.strokeStyle = k % 2 ? '#e8e8e8' : '#c0392b'; g.beginPath(); g.moveTo(sx - w0, y0); g.lineTo(sx - w1, y1); g.moveTo(sx + w0, y0); g.lineTo(sx + w1, y1); g.moveTo(sx - w0, y0); g.lineTo(sx + w1, y1); g.stroke(); } const blink = Math.floor(t / 700) % 2; g.fillStyle = blink ? '#ff3b30' : '#6b1a16'; g.beginPath(); g.arc(sx, sy - 200, 3, 0, Math.PI * 2); g.fill(); break; }
    case 'fountain': g.fillStyle = '#9aa3ab'; g.beginPath(); g.ellipse(sx, sy, 26, 13, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#4f8fbf'; g.beginPath(); g.ellipse(sx, sy - 2, 22, 10, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(220,240,255,.8)'; for (let k = 0; k < 6; k++) { const a = t / 400 + k; g.beginPath(); g.arc(sx + Math.cos(a) * 6, sy - 14 - Math.abs(Math.sin(a)) * 8, 2, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#b8c0c7'; g.fillRect(sx - 2, sy - 16, 4, 14); break;
    case 'bench': g.fillStyle = '#6b4a2f'; g.fillRect(sx - 12, sy - 8, 24, 4); g.fillStyle = '#3a3a3a'; g.fillRect(sx - 10, sy - 4, 2, 6); g.fillRect(sx + 8, sy - 4, 2, 6); break;
    case 'pump': g.fillStyle = '#d22d3d'; g.fillRect(sx - 5, sy - 22, 10, 22); g.fillStyle = '#f2f2f2'; g.fillRect(sx - 4, sy - 20, 8, 6); break;
    case 'canopy': { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(sx + 10, sy + 10, 60, 24, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#c9ced4'; [[-34, 0], [34, 0], [0, -17], [0, 17]].forEach(([dx, dy]) => g.fillRect(sx + dx - 2, sy + dy - 44, 4, 44)); g.fillStyle = '#f2f2f2'; g.beginPath(); g.moveTo(sx, sy - 70); g.lineTo(sx + 64, sy - 38); g.lineTo(sx, sy - 6); g.lineTo(sx - 64, sy - 38); g.closePath(); g.fill(); g.fillStyle = '#d22d3d'; g.beginPath(); g.moveTo(sx - 64, sy - 38); g.lineTo(sx, sy - 6); g.lineTo(sx, sy); g.lineTo(sx - 64, sy - 32); g.closePath(); g.fill(); g.beginPath(); g.moveTo(sx, sy - 6); g.lineTo(sx + 64, sy - 38); g.lineTo(sx + 64, sy - 32); g.lineTo(sx, sy); g.closePath(); g.fillStyle = '#a3212e'; g.fill(); break; }
    case 'crate': box(g, sx, sy, 22, 14, '#8a6d47'); break;
    case 'lumberstack': box(g, sx, sy, 28, 12, '#c49a5c'); box(g, sx, sy - 12, 24, 10, '#b88c50'); break;
    case 'boxcar': box(g, sx, sy, 60, 30, p.color || '#8b3a2a', 1.6); break;
    case 'steeple': box(g, sx, sy - 46, 16, 26, '#efe8da'); g.fillStyle = '#5b6470'; g.beginPath(); g.moveTo(sx, sy - 110); g.lineTo(sx + 12, sy - 72); g.lineTo(sx - 12, sy - 72); g.closePath(); g.fill(); break;
    case 'firetruck': car(g, sx, sy, 1, '#c0392b', false, t, night, 1.5); break;
    case 'car': car(g, sx, sy, p.dir || 0, p.color || '#888', !!p.police, t, night, 1, p.lightbar); break;
  }
}
function box(g, sx, sy, w, h, color, len) {
  const L = (len || 1) * w * .5, W2 = w * .35;
  const pts = (k) => [[sx - L, sy - L * .5 - k], [sx + W2, sy - L * .5 - W2 * .5 + L * .5 - k], [sx + L * 0 + W2 - L, sy], [sx, sy]];
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sx + 4, sy + 2, L + 4, (L + 4) * .45, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = shade(color, .75); g.beginPath(); g.moveTo(sx - L, sy - L * .5 + L * .5); g.lineTo(sx, sy + 0); g.lineTo(sx, sy - h); g.lineTo(sx - L, sy - h); g.closePath(); g.fill();
  g.fillStyle = shade(color, .6); g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + W2 * 1.4, sy - W2 * .7); g.lineTo(sx + W2 * 1.4, sy - W2 * .7 - h); g.lineTo(sx, sy - h); g.closePath(); g.fill();
  g.fillStyle = color; g.beginPath(); g.moveTo(sx - L, sy - h); g.lineTo(sx, sy - h); g.lineTo(sx + W2 * 1.4, sy - W2 * .7 - h); g.lineTo(sx - L + W2 * 1.4, sy - W2 * .7 - h); g.closePath(); g.fill();
  void pts;
}

// cars: dir 0 = along +x, 1 = along +y, 2 = along -x, 3 = along -y
export function car(g, sx, sy, dir, color, police, t, night, scale, bar) {
  const s = scale || 1, along = dir % 2 === 0, L = 24 * s, Wd = 11 * s, H = 9 * s;
  // axis vectors in screen space
  const ax = along ? [L * .5 * 1.0, L * .25] : [-L * .5, L * .25], aw = along ? [-Wd * .5, Wd * .25] : [Wd * .5, Wd * .25];
  const P = (u, v, h) => [sx + ax[0] * u + aw[0] * v, sy + ax[1] * u + aw[1] * v - h];
  const quad = (a, b, c, d, f) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fillStyle = f; g.fill(); };
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(sx + 3, sy + 3, L * .62, L * .34, 0, 0, Math.PI * 2); g.fill();
  const body = police ? '#14171c' : color, side = police ? '#f2f2f2' : shade(color, .78), side2 = police ? '#dcdcdc' : shade(color, .64);
  // lower body: two visible sides then top
  quad(P(-1, 1, 0), P(1, 1, 0), P(1, 1, H), P(-1, 1, H), side);
  quad(P(1, -1, 0), P(1, 1, 0), P(1, 1, H), P(1, -1, H), side2);
  quad(P(-1, -1, H), P(1, -1, H), P(1, 1, H), P(-1, 1, H), body);
  // cabin
  const cH = H + 7 * s;
  quad(P(-.45, .85, H), P(.45, .85, H), P(.35, .7, cH), P(-.4, .7, cH), '#2a3a4c');
  quad(P(.45, -.85, H), P(.45, .85, H), P(.35, .7, cH), P(.35, -.7, cH), '#1d2b3a');
  quad(P(-.4, -.7, cH), P(.35, -.7, cH), P(.35, .7, cH), P(-.4, .7, cH), police ? '#f2f2f2' : shade(color, 1.1));
  g.globalAlpha = .35; quad(P(-.42, .82, H + 1), P(.1, .82, H + 1), P(0, .72, cH - 1), P(-.38, .72, cH - 1), '#bfe3ff'); g.globalAlpha = 1;
  if (police) {
    const on = bar && Math.floor(t / 180) % 2;
    quad(P(-.1, -.6, cH), P(.1, -.6, cH), P(.1, 0, cH + 3), P(-.1, 0, cH + 3), on ? '#ff2d2d' : '#7a1a1a');
    quad(P(-.1, 0, cH + 3), P(.1, 0, cH + 3), P(.1, .6, cH), P(-.1, .6, cH), !on && bar ? '#2d6bff' : '#1a2f7a');
    g.fillStyle = '#f5b800'; const b0 = P(-.1, 1, H * .55); g.fillRect(b0[0] - 2, b0[1] - 2, 4, 3);
  }
  // headlights / tail lights on the front end (u = +1 side)
  const hl = P(1, .55, H * .55), hr = P(1, -.55, H * .55);
  g.fillStyle = night ? '#fff6cc' : '#e9edf0'; g.fillRect(hl[0] - 2, hl[1] - 1.5, 4, 3); g.fillRect(hr[0] - 2, hr[1] - 1.5, 4, 3);
}

// people: officer or civilian, walking frame from time
export function person(g, sx, sy, o, t) {
  const s = o.s || 1, walk = o.moving ? Math.sin(t / 90 + (o.ph || 0)) : 0, face = o.face || 1;
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(sx + 2, sy + 1, 9 * s, 4 * s, 0, 0, Math.PI * 2); g.fill();
  const pants = o.officer ? '#1b2a4a' : o.pants || '#3b4a5c', shirt = o.officer ? '#22355e' : o.shirt || '#c0392b', skin = o.skin || '#e0b48f';
  g.fillStyle = pants; g.fillRect(sx - 4 * s, sy - 12 * s, 3.5 * s, 12 * s + walk * 2 * s); g.fillRect(sx + .5 * s, sy - 12 * s, 3.5 * s, 12 * s - walk * 2 * s);
  g.fillStyle = shirt; g.beginPath(); g.roundRect(sx - 6 * s, sy - 24 * s, 12 * s, 13 * s, 3 * s); g.fill();
  g.fillStyle = shade(shirt.length === 7 ? shirt : '#22355e', .8); g.fillRect(sx - 7.5 * s, sy - 23 * s + walk * s, 2.5 * s, 10 * s); g.fillRect(sx + 5 * s, sy - 23 * s - walk * s, 2.5 * s, 10 * s);
  if (o.officer) { g.fillStyle = '#f5b800'; g.fillRect(sx + (face > 0 ? 1 : -4) * s, sy - 21 * s, 3 * s, 3 * s); g.fillStyle = '#111'; g.fillRect(sx - 6 * s, sy - 13 * s, 12 * s, 2 * s); }
  g.fillStyle = skin; g.beginPath(); g.arc(sx, sy - 28 * s, 5 * s, 0, Math.PI * 2); g.fill();
  if (o.officer) { g.fillStyle = '#16213d'; g.beginPath(); g.ellipse(sx, sy - 32 * s, 6 * s, 2.6 * s, 0, 0, Math.PI * 2); g.fill(); g.fillRect(sx - 4.5 * s, sy - 35 * s, 9 * s, 3.5 * s); g.fillStyle = '#f5b800'; g.fillRect(sx - 1 * s, sy - 34.5 * s, 2 * s, 2 * s); }
  else { g.fillStyle = o.hair || '#2b1d14'; g.beginPath(); g.arc(sx, sy - 30 * s, 5 * s, Math.PI, 0); g.fill(); }
}
