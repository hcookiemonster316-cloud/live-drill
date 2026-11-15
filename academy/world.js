// Patrol City world: district maps (tiles, buildings, props) and the isometric art, all drawn in code.
import { DISTRICTS, LANDMARKS } from './data.js';

export const N = 145, TW = 64, TH = 32; // 13 x 13 city blocks per district
const NB = 13;
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
  const RIVX = 2 + (NB - 1) * 11; // Riverside: the last block column is river
  if (D.river) for (let y = 0; y < N; y++) for (let x = RIVX; x < N; x++) set(x, y, x === RIVX ? T.SAND : T.WATER);
  // the hand-built places go in the middle of the district, spiraling out from the station; the rest fills in by theme
  const order = []; for (let by = 0; by < NB; by++) for (let bx = 0; bx < NB; bx++) if (!(D.river && bx === NB - 1)) order.push([bx, by]);
  order.sort((a, b) => (Math.hypot(a[0] - 6, a[1] - 6) - Math.hypot(b[0] - 6, b[1] - 6)) || (a[1] - b[1]) || (a[0] - b[0]));
  const used = new Set(D.lots.flatMap((e) => (e && e.strip ? e.strip.map((x) => x[1]) : Array.isArray(e) ? [e[1]] : [])));
  order.forEach(([bx, by], li) => {
    const ox = 2 + bx * 11, oy = 2 + by * 11;
    const entry = li < D.lots.length ? D.lots[li] : genEntry(W.D.theme, R, used, bx, by);
    for (let y = oy + 1; y <= oy + 7; y++) for (let x = ox + 1; x <= ox + 7; x++) set(x, y, T.GRASS);
    if (entry && entry.strip) { strip(W, entry.strip, ox, oy, R); if (li >= D.lots.length) W.lots.slice(-4).forEach((l) => { l.gen = true; }); }
    else {
      const [kind, nm, sg] = Array.isArray(entry) ? entry : [entry];
      const lot = { kind, ox, oy, bx, by, name: nm || (LANDMARKS[kind] || {}).name || '', sign: sg, door: [ox + 4, oy + 8], info: [ox + 6, oy + 8], gen: li >= D.lots.length };
      W.lots.push(lot);
      fill(W, lot, R);
      lot.bld = W.buildings.filter((b) => b.x >= ox + 1 && b.x <= ox + 7 && b.y >= oy + 1 && b.y <= oy + 7).sort((a, b) => b.w * b.d - a.w * a.d)[0] || null;
    }
    [[ox, oy], [ox + 8, oy], [ox, oy + 8], [ox + 8, oy + 8]].forEach(([x, y]) => W.props.push({ t: 'lamp', x: x + .5, y: y + .5 }));
  });
  // every business gets a customer parking row along its front, with curb cuts to the street
  const OPEN = new Set(['houses', 'park', 'plaza', 'lot', 'railyard', 'stadium', 'apartments', 'radio', 'church', 'parking', 'garage', 'storage', 'scrapyard', 'jail', 'warehouse', 'lumber', 'marina', 'firestation']);
  W.lots.forEach((l) => {
    if (l.sub || OPEN.has(l.kind)) return; const y = l.oy + 7;
    for (let x = l.ox + 1; x <= l.ox + 7; x++) { if (at(x, y) === T.BLDG || at(x, y) === T.FENCE) return; }
    W.props = W.props.filter((p) => !(Math.floor(p.y) === y && Math.floor(p.x) >= l.ox + 1 && Math.floor(p.x) <= l.ox + 7 && (p.t === 'tree' || p.t === 'palm' || p.t === 'bench' || p.t === 'bush')));
    for (let x = l.ox + 1; x <= l.ox + 7; x++) set(x, y, T.LOT);
    [l.ox + 2, l.ox + 6].forEach((x) => { if (R() < .75) P(W, 'car', x + .5, y + .5, { parked: true, color: CAR_COLORS[Math.floor(R() * CAR_COLORS.length)], dir: 1, block: true }); });
  });
  features(W, R);
  // driveways: every paved lot gets curb cuts through the sidewalk to the road below it
  W.lots.forEach((l) => {
    if (l.sub) return; const { ox, oy } = l, propAt = (x, y) => W.props.some((p) => p.block && Math.floor(p.x) === x && Math.floor(p.y) === y);
    [ox + 3, ox + 5, ox + 1, ox + 7].filter((x) => { const g = at(x, oy + 7); return (g === T.LOT || g === T.GRAVEL) && !propAt(x, oy + 7) && at(x, oy + 8) === T.WALK && at(x, oy + 9) === T.ROAD; }).slice(0, 2).forEach((x) => { set(x, oy + 7, T.LOT); set(x, oy + 8, T.LOT); });
  });
  // gates to the neighbouring districts (west road and east road)
  W.gates.push({ to: (did + 4) % 5, x: 0, y: 66, dir: 'w' }, { to: (did + 1) % 5, x: D.river ? 121 : N - 1, y: D.river ? 0 : 77, dir: D.river ? 'n' : 'e' });
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = at(x, y); if (v === T.WALK) W.walk.push([x, y]); if (v === T.LOT) W.parking.push([x, y]); }
  const st = W.lots.find((l) => l.kind === 'hq' || l.kind === 'substation') || W.lots[0];
  W.spawn = [st.ox + 4, st.oy + 8]; W.station = st;
  W.walkable = (x, y) => WALKABLE.has(at(x, y)) && !W.blocked.has(y * N + x);
  W.drivable = (x, y) => DRIVABLE.has(at(x, y)) && !W.blocked.has(y * N + x);
  W.blocked = new Set();
  W.props.forEach((p) => { if (p.block) W.blocked.add(Math.floor(p.y) * N + Math.floor(p.x)); });
  return W;
}

// ---------- filling the rest of the district: named businesses, streets and parks that fit the theme ----------
const OWN = ['Rosa', 'Tony', 'Big Mike', 'Lucky', 'Sunny', 'Mama Lu', 'Hector', 'Dee', 'Frank', 'Carmen', 'Earl', 'Nina', 'Ray', 'Gus', 'Tasha', 'Benny', 'Ollie', 'Pearl', 'Ike', 'Lupe', 'Moe', 'Vic', 'Ada', 'Jules'];
const TREE = ['Cypress', 'Magnolia', 'Palmetto', 'Live Oak', 'Sabal', 'Mangrove', 'Pecan', 'Orange Blossom', 'Hibiscus', 'Bayberry', 'Jasmine', 'Sawgrass', 'Heron', 'Pelican', 'Ibis', 'Osprey', 'Manatee', 'Seminole', 'Ponce', 'Coquina'];
const STREET = ['Lane', 'Court', 'Way', 'Circle', 'Drive', 'Terrace', 'Row', 'Place'];
const NOUN = { shop: ['Market', 'Grocery', 'Mini Mart', 'Variety', 'Corner Store', 'Bodega'], cafe: ['Coffee', 'Bakery', 'Bagels', 'Donuts', 'Café', 'Juice Bar'], pizza: ['Pizza', 'Pizzeria', 'Slice Shop', 'Subs & Pizza'], barber: ['Barbershop', 'Cuts', 'Fades'], laundromat: ['Laundry', 'Wash & Fold', 'Laundromat'], nails: ['Nails', 'Salon', 'Beauty Bar'], books: ['Books', 'Comics', 'Used Books'], pharmacy: ['Pharmacy', 'Drugs', 'Rx'], clinic: ['Family Clinic', 'Dental', 'Urgent Care', 'Animal Hospital'], diner: ['Diner', 'Grill', 'Kitchen', 'Lunch Counter'], autoshop: ['Auto Repair', 'Tire & Lube', 'Transmission', 'Body Shop'], gym: ['Gym', 'Fitness', 'Boxing Club', 'CrossTrain'], office: ['Insurance', 'Tax Service', 'Law Office', 'Realty', 'Accounting'] };
const SIGNS = { shop: 'MARKET', cafe: 'CAFE', pizza: 'PIZZA', barber: 'BARBER', laundromat: 'LAUNDRY', nails: 'NAILS', books: 'BOOKS', pharmacy: 'Rx', clinic: 'CLINIC', diner: 'DINER', autoshop: 'AUTO', gym: 'GYM', office: 'OFFICE' };
const MIX = {
  downtown: [['strip', 26], ['tower', 18], ['apartments', 10], ['parking', 7], ['park', 7], ['plaza', 4], ['diner', 4], ['clinic', 4], ['bank', 3], ['garage', 3], ['library', 2], ['shop', 6], ['gym', 3], ['houses', 3]],
  commercial: [['strip', 24], ['houses', 16], ['apartments', 9], ['gas', 7], ['autoshop', 7], ['motel', 5], ['mall', 5], ['carwash', 4], ['shop', 7], ['park', 6], ['parking', 4], ['diner', 3], ['gym', 3]],
  residential: [['houses', 44], ['apartments', 13], ['park', 10], ['strip', 9], ['church', 4], ['school', 3], ['shop', 6], ['clinic', 3], ['pawn', 2], ['diner', 3], ['firestation', 1], ['marina', 2]],
  industrial: [['warehouse', 32], ['storage', 9], ['lot', 9], ['scrapyard', 7], ['lumber', 6], ['railyard', 5], ['parking', 6], ['autoshop', 7], ['truckstop', 4], ['diner', 4], ['houses', 6], ['gas', 5]],
  civic: [['tower', 18], ['strip', 18], ['parking', 11], ['apartments', 10], ['plaza', 7], ['park', 8], ['shop', 7], ['diner', 5], ['bonds', 4], ['houses', 8], ['clinic', 4]]
};
const STRIPMIX = { downtown: ['cafe', 'barber', 'books', 'pizza', 'nails', 'office', 'shop', 'laundromat'], commercial: ['laundromat', 'shop', 'pharmacy', 'nails', 'pizza', 'cafe', 'barber', 'gym'], residential: ['cafe', 'shop', 'barber', 'laundromat', 'pizza', 'pharmacy', 'books'], industrial: ['diner', 'shop', 'autoshop', 'cafe'], civic: ['office', 'cafe', 'shop', 'office', 'pizza', 'books'] };
function genEntry(theme, R, used, bx, by) {
  const pick = (a) => a[Math.floor(R() * a.length)], mix = MIX[theme] || MIX.downtown, tot = mix.reduce((a, m) => a + m[1], 0);
  let t = R() * tot, kind = mix[0][0]; for (const m of mix) { t -= m[1]; if (t <= 0) { kind = m[0]; break; } }
  const uniq = (fn) => { let n = ''; for (let k = 0; k < 20 && (!n || used.has(n)); k++) n = fn(); used.add(n); return n; };
  const biz = (k) => { const n = uniq(() => pick(OWN) + '’s ' + pick(NOUN[k] || ['Shop'])); return [k, n, SIGNS[k] || n.split(' ').pop().toUpperCase().slice(0, 9)]; };
  if (kind === 'strip') { const pool = STRIPMIX[theme] || STRIPMIX.downtown; return { strip: [0, 1, 2, 3].map(() => biz(pick(pool))) }; }
  if (NOUN[kind]) return biz(kind);
  const named = {
    houses: () => uniq(() => pick(TREE) + ' ' + pick(STREET)), apartments: () => uniq(() => pick(TREE) + ' ' + pick(['Apartments', 'Gardens', 'Towers', 'Commons', 'Village'])),
    park: () => uniq(() => pick(TREE) + ' ' + pick(['Park', 'Green', 'Commons', 'Playground'])), plaza: () => uniq(() => pick(TREE) + ' Plaza'),
    tower: () => uniq(() => pick(['Harbor', 'Meridian', 'Bayfront', 'Gulf', 'Sunbelt', 'Citrus', 'Coastal', 'Riverview']) + ' ' + pick(['Tower', 'Center', 'Building', 'Plaza Tower'])),
    parking: () => uniq(() => pick(['Lot', 'Parking', 'Park & Pay']) + ' ' + (10 + Math.floor(R() * 89))), garage: () => uniq(() => pick(TREE) + ' Parking Garage'),
    warehouse: () => uniq(() => pick(['Gulf', 'Coastal', 'Sunshine', 'Bayside', 'Delta', 'Keystone', 'Atlas', 'Pioneer', 'Summit', 'Anchor']) + ' ' + pick(['Freight', 'Supply', 'Logistics', 'Packaging', 'Distribution', 'Steel', 'Foods'])),
    storage: () => uniq(() => pick(['Store-All', 'Secure', 'Keep-It', 'Space Place', 'StashBox']) + ' Storage'), lot: () => uniq(() => 'Vacant Lot ' + (100 + Math.floor(R() * 800))),
    scrapyard: () => uniq(() => pick(OWN) + '’s Salvage'), lumber: () => uniq(() => pick(TREE) + ' Lumber'), railyard: () => uniq(() => pick(['South', 'East', 'Old', 'Spur']) + ' Rail Yard'),
    truckstop: () => uniq(() => pick(['Interstate', 'Big Wheel', 'Gator', 'Sunrise']) + ' Truck Stop'), gas: () => uniq(() => pick(['QuickFuel', 'Gas & Go', 'Sun Fuel', 'Fill-Up', 'Gator Gas']) + ' #' + (2 + Math.floor(R() * 40))),
    motel: () => uniq(() => pick(TREE) + ' Motor Inn'), mall: () => uniq(() => pick(TREE) + ' Shopping Center'), carwash: () => uniq(() => pick(['Sparkle', 'Bubbles', 'Shine', 'Splash']) + ' Car Wash'),
    bank: () => uniq(() => pick(['Coastal', 'Citrus', 'Harbor', 'Meridian']) + ' ' + pick(['Bank', 'Credit Union', 'Savings'])), library: () => uniq(() => pick(TREE) + ' Branch Library'),
    church: () => uniq(() => pick(['Grace', 'Faith', 'New Hope', 'St. Mark’s', 'Cornerstone', 'Unity']) + ' ' + pick(['Church', 'Chapel', 'Fellowship'])), school: () => uniq(() => pick(TREE) + ' ' + pick(['Elementary', 'Middle School', 'Academy'])),
    pawn: () => uniq(() => pick(OWN) + '’s Pawn'), firestation: () => uniq(() => 'Fire Station ' + (4 + Math.floor(R() * 20))), marina: () => uniq(() => pick(TREE) + ' Boat Ramp'), bonds: () => uniq(() => pick(['Liberty', 'Quick', 'Sunrise', 'Ace']) + ' Bail Bonds')
  };
  const signs = { tower: '', houses: '', apartments: '', park: '', plaza: '', parking: '', lot: '', railyard: '', garage: 'PARK', warehouse: null, storage: 'STORAGE', scrapyard: 'SALVAGE', lumber: 'LUMBER', truckstop: 'TRUCKS', gas: 'GAS', motel: 'MOTEL', mall: 'SHOPS', carwash: 'WASH', bank: 'BANK', library: 'LIBRARY', church: '', school: 'SCHOOL', pawn: 'PAWN', firestation: 'FIRE', marina: 'BOATS', bonds: 'BONDS' };
  const n = named[kind] ? named[kind]() : kind, sg = signs[kind] === null ? n.split(' ')[0].toUpperCase().slice(0, 9) : signs[kind];
  return [kind, n, sg];
}

// ---------- what makes each district its own place ----------
// a walk-only promenade over one road segment, street dressing, Riverside's pier, Industrial's rail line,
// and secret spots that only show up when you wander close
const SECRETS = [
  [['The Bench Where Cadets Cry', 'Quiet. Shady. Slightly damp. Many a PT test has been mourned here.'], ['The Pigeon Council', 'Twelve pigeons. One agenda. They have been watching your patrol technique.'], ['The Mystery Puddle', 'It has not rained in nine days. The puddle remains.']],
  [['The Cart Return Nobody Uses', 'A monument to human nature. Every cart is somewhere else.'], ['The Legendary Vending Machine', 'It only takes exact change and it only gives exact disappointment.'], ['Shortcut Behind the Plaza', 'Every delivery driver in Eastside knows it. Now you do too.']],
  [['The Lucky Fishing Spot', 'Old-timers say the bass here know the Florida Statutes.'], ['The Tree Fort Treaty', 'Neighborhood kids signed a peace accord here in 2019. It mostly holds.'], ['The Gator Lookout', 'He is not here right now. That is the scary part.']],
  [['The Forklift Graveyard', 'Where forklifts go when they have seen too much.'], ['The Echo Corner', 'Say "clear" and the warehouse says it back. Spooky. Helpful.'], ['The Break Room Microwave', 'Abandoned behind Warehouse C. Still smells like fish. From 2016.']],
  [['The Bailiff\'s Secret Smoke Bench', 'Officially it does not exist. Unofficially it has a cushion.'], ['The Courthouse Cat', 'Has attended more trials than most attorneys. Undefeated.'], ['The Lost Parking Ticket Wall', 'Hundreds of tickets taped up by someone with a lot of feelings.']]
];
function features(W, R) {
  const at = W.at, set = W.set, d = W.did, rnd = (a) => a[Math.floor(R() * a.length)];
  // a road segment between two blocks becomes a walk-only promenade
  const prom = [[66, 57, 'v', 'fountain'], [77, 68, 'v', 'stall'], [55, 79, 'v', 'tree'], [66, 46, 'v', 'tree'], [77, 57, 'v', 'flag']][d];
  if (prom) { const [px, py, , k] = prom; for (let y = py; y <= py + 8; y++) for (let x = px; x <= px + 1; x++) set(x, y, T.PLAZA);
    for (let y = py + 1; y <= py + 7; y += 2) { const left = (y - py) % 4 === 1; if (k === 'stall') P(W, 'stall', px + (left ? .5 : 1.5), y + .5, { color: rnd(['#d22d3d', '#1f7a5a', '#2c5aa0', '#d98a1c', '#8e44ad']), block: true }); else if (k === 'fountain' && y === py + 3) P(W, 'fountain', px + 1, y + 1, { block: true }); else if (k === 'flag') P(W, left ? 'flag' : 'bench', px + (left ? .3 : 1.6), y + .5, { block: left }); else P(W, left ? 'tree' : 'bench', px + (left ? .4 : 1.6), y + .5, { block: left, s: .8 }); }
    W.promenade = { x: px, y: py, name: ['Main Street Promenade', 'Eastside Market Street', 'Riverside Greenway', 'Old Freight Path', 'Civic Mall'][d] };
  }
  // street dressing on sidewalks next to roads
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
    if (at(x, y) !== T.WALK) continue; const nearRoad = at(x + 1, y) === T.ROAD || at(x - 1, y) === T.ROAD || at(x, y + 1) === T.ROAD || at(x, y - 1) === T.ROAD; if (!nearRoad) continue;
    const r = R(); if (r < .025) P(W, 'hydrant', x + .5, y + .5); else if (r < .045) P(W, 'bin', x + .5, y + .5); else if (r < .085 && W.D.theme !== 'industrial') P(W, 'bush', x + .5, y + .5, { s: .7 + R() * .5, c: rnd(['#3f7d3a', '#4b8b3f', '#356b34']) }); else if (r < .1 && W.D.theme === 'residential') P(W, 'flowers', x + .5, y + .5, { c: rnd(['#e84a5f', '#f6c445', '#c77dff', '#ff8fab']) });
  }
  if (W.river) { // fishing pier into the river, a boardwalk bench line and boats
    const RX = 2 + (NB - 1) * 11, py = 70; for (let x = RX + 1; x <= RX + 6; x++) { set(x, py, T.PLAZA); set(x, py + 1, T.PLAZA); }
    P(W, 'bench', RX + 6.3, py + 1); P(W, 'lamp', RX + 1.5, py + .5); P(W, 'lamp', RX + 5.5, py + .5);
    for (let y = 4; y < N - 2; y += 6) P(W, 'bench', RX + .5, y + .5);
    W.pier = { x: RX + 1, y: py };
  }
  if (W.D.theme === 'industrial') { // a freight line crossing the whole district; trains run on it during the shift
    const ry = 98; for (let x = 0; x < N; x++) if (at(x, ry) !== T.BLDG) set(x, ry, T.RAIL);
    for (let x = 0; x < N; x++) if (at(x, ry - 1) === T.ROAD && at(x - 1, ry - 1) !== T.ROAD) { P(W, 'xing', x - .3, ry - .3); P(W, 'xing', x + 2.3, ry + 1.3); }
    W.railY = ry;
  }
  // secret spots: quiet tiles away from the road
  const quiet = []; for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) { const v = at(x, y); if ((v === T.GRASS || v === T.GRAVEL || v === T.PLAZA || v === T.SAND) && ![[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]].some(([a, b]) => at(x + a, y + b) === T.ROAD)) quiet.push([x, y]); }
  const picked = [];
  W.secrets = (SECRETS[d] || []).map((s2, i) => {
    let q = null;
    if (W.river && i === 0) q = [2 + (NB - 1) * 11 + 6, 71];
    for (let k = 0; !q && k < 200; k++) { const c = quiet[Math.floor(R() * quiet.length)]; if (c && picked.every((o) => Math.hypot(o[0] - c[0], o[1] - c[1]) > 12)) q = c; }
    q = q || quiet[Math.floor(R() * quiet.length)] || [5 + i * 9, 5]; picked.push(q);
    return { id: d + ':' + i, name: s2[0], text: s2[1], x: q[0] + .5, y: q[1] + .5 };
  });
  W.quiet = quiet;
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

// a block of four storefronts around a little courtyard, each its own place
function strip(W, list, ox, oy, R) {
  const x0 = ox + 1, y0 = oy + 1; area(W, x0, y0, x0 + 6, y0 + 6, T.PLAZA);
  const spots = [[x0, y0, 3, 2], [x0 + 4, y0, 3, 2], [x0, y0 + 4, 3, 2], [x0 + 4, y0 + 4, 3, 2]], aw = ['#d22d3d', '#1f7a5a', '#2c5aa0', '#d98a1c', '#8e44ad', '#0e7490'];
  list.forEach((e, i) => {
    const [kind, nm, sg] = e, [bx, by, w, d] = spots[i], pal = PAL[W.D.theme];
    const b = { x: bx, y: by, w, d, h: 30 + Math.floor(R() * 16), style: 'shop', color: pal[Math.floor(R() * pal.length)], sign: sg || (LANDMARKS[kind] || {}).sign || 'SHOP', awning: aw[(i + Math.floor(R() * 6)) % 6] };
    W.buildings.push(b); for (let yy = by; yy < by + d; yy++) for (let xx = bx; xx < bx + w; xx++) W.set(xx, yy, T.BLDG);
    W.lots.push({ kind, ox, oy, name: nm, sign: sg, bld: b, door: [bx + 1, by + d], info: [bx + (i % 2 ? 0 : 2), by + d], sub: true });
  });
  P(W, 'bench', x0 + 3.5, y0 + 2.5); P(W, 'tree', x0 + 3.5, y0 + 3.5, { block: true, s: .8 }); P(W, 'lamp', x0 + 3.5, y0 + 6.5);
}

function fill(W, L, R) {
  const { ox, oy, kind } = L, th = W.D.theme, pal = PAL[th], pick = (a) => a[Math.floor(R() * a.length)];
  const x0 = ox + 1, y0 = oy + 1, x1 = ox + 7, y1 = oy + 7, lm = LANDMARKS[kind] || {}, sg = (d) => (L.sign ? L.sign : d);
  const tree = (x, y, k) => P(W, k || (W.river ? 'palm' : 'tree'), x + .5, y + .5, { block: true, s: .8 + R() * .4 });
  const park = (cars) => { for (let i = 0; i < cars; i++) { const x = x0 + Math.floor(R() * 7), y = y1 - Math.floor(R() * 2); if (W.at(x, y) === T.LOT) P(W, 'car', x + .5, y + .5, { parked: true, color: pick(CAR_COLORS), dir: R() < .5 ? 0 : 2, block: true }); } };
  switch (kind) {
    case 'tower': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0 + 1, y0 + 1, 5, 4, 150 + Math.floor(R() * 140), { style: 'glass', color: pick(pal), sign: L.sign || '' }); tree(x0, y1); tree(x1, y1); break;
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
    case 'diner': area(W, x0, y0, x1, y1, T.LOT); B(W, x0 + 1, y0 + 1, 4, 3, 34, { style: 'diner', color: '#f2efe8', sign: sg('DINER'), trim: '#d22d3d' }); park(3); break;
    case 'garage': B(W, x0, y0, 7, 6, 74, { style: 'garage', color: '#9aa1a8', sign: 'PARK' }); break;
    case 'parking': case 'lot': area(W, x0, y0, x1, y1, kind === 'lot' ? T.GRAVEL : T.LOT); if (kind === 'parking') { for (let i = 0; i < 6; i++) { const x = x0 + Math.floor(R() * 7), y = y0 + Math.floor(R() * 7); if (W.at(x, y) === T.LOT && !W.props.some((p) => Math.floor(p.x) === x && Math.floor(p.y) === y)) P(W, 'car', x + .5, y + .5, { parked: true, color: pick(CAR_COLORS), dir: R() < .5 ? 0 : 1, block: true }); } P(W, 'lamp', x0 + 3.5, y0 + 3.5); } else { P(W, 'crate', x0 + 2.5, y0 + 2.5, { block: true }); P(W, 'crate', x0 + 5.5, y0 + 4.5, { block: true }); } break;
    case 'shop': case 'pawn': case 'pharmacy': case 'bonds': case 'defender': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 7, 3, 38 + Math.floor(R() * 14), { style: 'shop', color: pick(pal), sign: L.sign || lm.sign || pick(['MARKET', 'CAFE', 'SALON', 'DELI', 'BOOKS', 'NAILS']), awning: pick(['#d22d3d', '#1f7a5a', '#2c5aa0', '#d98a1c']) }); park(3); break;
    case 'plaza': area(W, x0, y0, x1, y1, T.PLAZA); P(W, 'fountain', x0 + 3.5, y0 + 3.5, { block: true }); tree(x0 + 1, y0 + 1); tree(x1 - 1, y0 + 1); tree(x0 + 1, y1 - 1); tree(x1 - 1, y1 - 1); P(W, 'bench', x0 + 3.5, y1 - .3); break;
    case 'park': for (let i = 0; i < 9; i++) { const x = x0 + Math.floor(R() * 7), y = y0 + Math.floor(R() * 7); if (W.at(x, y) === T.GRASS) tree(x, y); } area(W, x0 + 3, y0, x0 + 3, y1, T.PLAZA); P(W, 'bench', x0 + 3.5, y0 + 2.5); P(W, 'bench', x0 + 3.5, y0 + 5.5); break;
    case 'gas': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 3, 2, 32, { style: 'shop', color: '#f2f2f2', sign: sg('GAS'), awning: '#d22d3d' }); P(W, 'canopy', x0 + 4.5, y0 + 4, { block: false }); P(W, 'pump', x0 + 3.5, y0 + 4.5, { block: true }); P(W, 'pump', x0 + 5.5, y0 + 4.5, { block: true }); park(2); break;
    case 'mall': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 7, 3, 42, { style: 'shop', color: '#e3d3bb', sign: 'PLAZA', awning: '#2c5aa0', fronts: 4 }); park(5); break;
    case 'motel': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 7, 2, 50, { style: 'motel', color: '#e8c39e', sign: 'MOTEL', trim: '#1f7a5a' }); B(W, x1 - 1, y0 + 2, 2, 3, 50, { style: 'motel', color: '#e8c39e', trim: '#1f7a5a' }); park(3); break;
    case 'autoshop': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 5, 4, 40, { style: 'bays', color: '#c9ccd0', sign: 'AUTO' }); park(4); break;
    case 'houses': for (let i = 0; i < 4; i++) { const top = i < 2, hx = x0 + (i % 2) * 4, hy = top ? y0 : y0 + 4; B(W, hx, hy, 2, 2, 26, { style: 'house', color: pick(pal), roof: pick(['#8a4b3c', '#5b6470', '#7a5a3a', '#3f5466']) });
      // each home's driveway runs to its street: the top row to the road above, the bottom row to the road below
      const dx = hx + 2, rows = top ? [oy, oy + 1, oy + 2] : [oy + 5, oy + 6, oy + 7, oy + 8]; rows.forEach((yy) => W.set(dx, yy, T.LOT)); if (R() < .7) P(W, 'car', dx + .5, (top ? oy + 1.5 : oy + 6.5), { parked: true, color: pick(CAR_COLORS), dir: 1, block: true });
      if (R() < .5) tree(hx + (i % 2 ? -1 : 2) + (i % 2 ? 0 : 1), hy + (top ? 2 : -1)); W.set(hx, hy + (top ? 2 : -1), T.PLAZA); } break;
    case 'apartments': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 6, 4, 112, { style: 'apartments', color: pick(pal), sign: L.sign || '' }); park(3); tree(x1, y0); break;
    case 'firestation': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0, y0, 5, 4, 48, { style: 'bays', color: '#b5302b', sign: 'FIRE 3', trim: '#f2f2f2' }); P(W, 'firetruck', x0 + 2.5, y1 - .5, { block: true }); break;
    case 'stadium': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 7, 6, 58, { style: 'stadium', color: '#cfd5dc' }); break;
    case 'church': B(W, x0 + 1, y0 + 1, 4, 5, 46, { style: 'stone', color: '#efe8da', roof: '#5b6470' }); P(W, 'steeple', x0 + 2.5, y0 + 1.5, { block: true }); tree(x1, y1); tree(x0, y1); break;
    case 'school': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0, y0, 6, 4, 44, { style: 'brick', color: '#a65a42', sign: 'SCHOOL', trim: '#f2f2f2' }); tree(x1, y1); tree(x0, y1); break;
    case 'warehouse': area(W, x0, y0, x1, y1, T.GRAVEL); B(W, x0 + 1, y0, 6, 5, 52, { style: 'corrugated', color: pick(['#8f9aa4', '#a5937a', '#7f8b84', '#9c8f86']), sign: sg('WHSE ' + String.fromCharCode(65 + Math.floor(R() * 6))), docks: true }); for (let x = x0; x <= x1; x++) if (x !== x0 + 3) W.set(x, y1, T.FENCE); break;
    case 'storage': area(W, x0, y0, x1, y1, T.GRAVEL); for (let i = 0; i < 3; i++) B(W, x0, y0 + i * 2 + 1, 7, 1, 20, { style: 'storage', color: '#d1d4d6', trim: '#e2742b' }); break;
    case 'railyard': area(W, x0, y0, x1, y1, T.GRAVEL); for (let x = x0; x <= x1; x++) { W.set(x, y0 + 2, T.RAIL); W.set(x, y0 + 5, T.RAIL); } P(W, 'boxcar', x0 + 2, y0 + 2.5, { block: true, color: '#8b3a2a' }); P(W, 'boxcar', x0 + 5, y0 + 5.5, { block: true, color: '#2f5d7a' }); break;
    case 'lumber': area(W, x0, y0, x1, y1, T.GRAVEL); B(W, x0, y0, 3, 3, 30, { style: 'corrugated', color: '#a5937a', sign: 'LUMBER' }); for (let i = 0; i < 5; i++) P(W, 'lumberstack', x0 + 4.5 + (i % 2) * 1.6, y0 + 1 + Math.floor(i / 2) * 2, { block: true }); break;
    case 'courthouse': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0, y0, 7, 5, 92, { style: 'stone', color: '#ece6d8', sign: 'COURT', columns: true, dome: true }); tree(x0, y1); tree(x1, y1); break;
    case 'jail': area(W, x0, y0, x1, y1, T.GRAVEL); B(W, x0 + 1, y0 + 1, 5, 4, 72, { style: 'jail', color: '#b9b4a6', sign: 'JAIL' }); for (let x = x0; x <= x1; x++) { W.set(x, y0, T.FENCE); if (x !== x0 + 3) W.set(x, y1, T.FENCE); } for (let y = y0; y <= y1; y++) { W.set(x0, y, T.FENCE); W.set(x1, y, T.FENCE); } break;
    case 'sallyport': area(W, x0, y0, x1, y1, T.LOT); B(W, x0 + 1, y0, 5, 3, 44, { style: 'bays', color: '#b9b4a6', sign: 'SALLY PORT' }); P(W, 'car', x0 + 3.5, y1 - 1.5, { parked: true, police: true, dir: 1, block: true }); break;
    case 'library': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0, y0, 6, 4, 56, { style: 'stone', color: '#d8cfbf', sign: sg('LIBRARY'), columns: true }); tree(x1, y0); tree(x1, y1); P(W, 'bench', x0 + 2.5, y1 - .3); P(W, 'bench', x0 + 4.5, y1 - .3); break;
    case 'transit': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0, y0, 7, 2, 34, { style: 'concrete', color: '#c8d0da', sign: sg('TRANSIT') }); P(W, 'canopy', x0 + 3.5, y0 + 4, { block: false }); P(W, 'bus', x0 + 2, y0 + 4.5, { block: true, color: '#2c7be5' }); P(W, 'bus', x0 + 5, y0 + 5.8, { block: true, color: '#16a34a' }); P(W, 'bench', x0 + .5, y1 - .3); break;
    case 'clinic': area(W, x0, y0, x1, y1, T.LOT); B(W, x0 + 1, y0, 5, 4, 44, { style: 'concrete', color: '#f2f4f7', sign: sg('CLINIC'), trim: '#d22d3d' }); P(W, 'car', x0 + 3.5, y1 - 1.5, { parked: true, color: '#f2f2f2', dir: 0, block: true }); park(2); break;
    case 'carwash': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 4, 3, 30, { style: 'bays', color: '#7dd3fc', sign: sg('WASH') }); P(W, 'canopy', x0 + 5, y0 + 4.5, { block: false }); park(2); break;
    case 'gym': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 6, 4, 40, { style: 'brick', color: '#7a2e2e', sign: sg('BOXING'), trim: '#f5b800' }); park(3); break;
    case 'center': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0, y0, 5, 3, 36, { style: 'brick', color: '#b0703f', sign: sg('COMMUNITY') }); P(W, 'hoop', x0 + 2.5, y0 + 5.5, { block: true }); P(W, 'hoop', x0 + 5.5, y0 + 5.5, { block: true }); tree(x1, y0); break;
    case 'marina': area(W, x0, y0, x1, y1, T.PLAZA); B(W, x0, y0, 3, 2, 26, { style: 'shop', color: '#f2f2f2', sign: sg('MARINA'), awning: '#0369a1' }); P(W, 'boatT', x0 + 1.5, y0 + 4.5, { block: true }); P(W, 'boatT', x0 + 4.5, y0 + 4.5, { block: true }); P(W, 'boatT', x0 + 4.5, y0 + 1.5, { block: true }); P(W, 'flag', x1 - .2, y1 - .3, { block: true }); break;
    case 'scrapyard': area(W, x0, y0, x1, y1, T.GRAVEL); B(W, x0, y0, 2, 2, 22, { style: 'corrugated', color: '#8a8170', sign: sg('SCRAP') }); for (let i = 0; i < 6; i++) P(W, 'scrap', x0 + 3 + (i % 3) * 1.5, y0 + 1 + Math.floor(i / 3) * 3, { block: true, s: .8 + R() * .5 }); P(W, 'car', x0 + 1.5, y1 - 1.5, { parked: true, color: '#7a5a3a', dir: 1, block: true }); for (let x = x0; x <= x1; x++) if (x !== x0 + 3) W.set(x, y1, T.FENCE); break;
    case 'truckstop': area(W, x0, y0, x1, y1, T.LOT); B(W, x0, y0, 4, 3, 34, { style: 'diner', color: '#f2efe8', sign: sg('TRUCKS'), trim: '#2563eb' }); P(W, 'canopy', x0 + 4.5, y0 + 4.5, { block: false }); P(W, 'semi', x0 + 2, y1 - .8, { block: true, color: '#2563eb' }); P(W, 'semi', x0 + 5, y1 - .8, { block: true, color: '#b91c1c' }); break;
    default: area(W, x0, y0, x1, y1, T.GRASS); tree(x0 + 2, y0 + 2); tree(x0 + 4, y0 + 5);
  }
}
export const CAR_COLORS = ['#c0392b', '#2c3e50', '#ecf0f1', '#7f8c8d', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#34495e', '#d35400', '#bdc3c7', '#16a085'];

// ---------- art ----------
const shade = (hex, f) => { let r, g, b; hex = String(hex); if (hex[0] === '#') { const h6 = hex.length === 4 ? hex.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3') : hex, n = parseInt(h6.slice(1, 7), 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; } else { const m = hex.match(/\d+(\.\d+)?/g) || [128, 128, 128]; r = +m[0]; g = +m[1]; b = +m[2]; } r = Math.max(0, Math.min(255, Math.round(r * f))); g = Math.max(0, Math.min(255, Math.round(g * f))); b = Math.max(0, Math.min(255, Math.round(b * f))); return 'rgb(' + r + ',' + g + ',' + b + ')'; };
export { shade };

// ground: drawn once per district into one large canvas
// the ground is drawn in chunks of CH x CH tiles, only around the camera, and cached
export const CH = 16;
export function drawGround(W, cx, cy) {
  const x0 = cx * CH, y0 = cy * CH, x1 = Math.min(N, x0 + CH) - 1, y1 = Math.min(N, y0 + CH) - 1, pad = 4;
  const w = (x1 - x0 + y1 - y0 + 2) * TW / 2 + pad * 2, h = (x1 - x0 + y1 - y0 + 2) * TH / 2 + pad * 2, [c, g] = hiCanvas(w, h, Math.min(2, RES));
  const ox = -(x0 - y1 - 1) * TW / 2 + pad, oy = -(x0 + y0) * TH / 2 + pad;
  let seed = 0; const R = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const dia = (x, y) => { const [sx, sy] = iso(x, y); g.beginPath(); g.moveTo(ox + sx, oy + sy); g.lineTo(ox + sx + TW / 2, oy + sy + TH / 2); g.lineTo(ox + sx, oy + sy + TH); g.lineTo(ox + sx - TW / 2, oy + sy + TH / 2); g.closePath(); };
  const col = { [T.ROAD]: '#3b4048', [T.WALK]: '#b8b2a5', [T.GRASS]: '#5d8f3f', [T.PLAZA]: '#d2c8b3', [T.LOT]: '#4b5059', [T.WATER]: '#2d6c97', [T.BLDG]: '#6b6b6b', [T.FENCE]: '#7f8a6e', [T.SAND]: '#d9c58f', [T.GRAVEL]: '#8d877c', [T.RAIL]: '#7d756a' };
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    seed = (x * 73856093) ^ (y * 19349663) ^ (W.did * 83492791); const v = W.at(x, y); let c0 = col[v] || '#555';
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
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (W.at(x, y) === T.WALK) {
    const e = (nx, ny, a, b) => { if (W.at(nx, ny) === T.ROAD) { const [ax, ay] = iso(a[0], a[1]), [bx2, by2] = iso(b[0], b[1]); g.beginPath(); g.moveTo(ox + ax, oy + ay); g.lineTo(ox + bx2, oy + by2); g.stroke(); } };
    e(x + 1, y, [x + 1, y], [x + 1, y + 1]); e(x, y + 1, [x, y + 1], [x + 1, y + 1]); e(x - 1, y, [x, y], [x, y + 1]); e(x, y - 1, [x, y], [x + 1, y]);
  }
  return { canvas: c, ox, oy };
}

// a building drawn once into its own canvas; night version lights some windows
// render scale for cached art (buildings, ground): 1 = standard, up to 3 for 4K
export let RES = 1; export function setRes(k) { RES = k; }
export function hiCanvas(w, h, k) { const c = document.createElement('canvas'); k = k || 1; c.width = Math.ceil(w * k); c.height = Math.ceil(h * k); c.lw = c.width / k; c.lh = c.height / k; const g = c.getContext('2d'); g.scale(k, k); return [c, g]; }
export function drawBuilding(b, night, sun) {
  const R = rng(b.x * 131 + b.y * 977 + b.h);
  const A = iso(b.x, b.y), Bp = iso(b.x + b.w, b.y), C = iso(b.x + b.w, b.y + b.d), Dp = iso(b.x, b.y + b.d);
  const extra = b.dome ? 60 : b.style === 'house' ? 26 : 30, shLen = sun ? sun.len : 0;
  const minX = Dp[0] - 6, maxX = Bp[0] + 6 + shLen, minY = A[1] - b.h - extra, maxY = C[1] + 6 + shLen * .5;
  const [c, g] = hiCanvas(maxX - minX, maxY - minY, RES), tx = (p) => [p[0] - minX, p[1] - minY];
  const poly = (pts, fill) => { g.beginPath(); pts.forEach((p, i) => { const q = tx(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } };
  const up = (p, h) => [p[0], p[1] - h];
  // cast shadow on the ground toward the lower right
  if (sun && sun.len) { g.globalAlpha = sun.a; poly([Bp, C, Dp, [Dp[0] + sun.len, Dp[1] + sun.len * .5], [C[0] + sun.len, C[1] + sun.len * .5], [Bp[0] + sun.len, Bp[1] + sun.len * .5]], '#0b1220'); g.globalAlpha = 1; }
  const base = b.color || '#999', left = shade(base, .78), right = shade(base, .62), top = shade(base, 1.08);
  const h = b.h;
  // walls
  poly([Dp, C, up(C, h), up(Dp, h)], left);
  poly([C, Bp, up(Bp, h), up(C, h)], right);
  { // panel courses, then ambient occlusion toward the ground and a warm bounce near the top
    const st0 = b.style; if (st0 !== 'glass' && st0 !== 'house') { g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = .6; for (let y = 6; y < h - 4; y += 6) { const a1 = tx(up(Dp, y)), b1 = tx(up(C, y)), c1 = tx(up(Bp, y)); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); g.lineTo(c1[0], c1[1]); g.stroke(); } }
    const yT = tx(up(C, h))[1], yB = tx(C)[1], ao = g.createLinearGradient(0, yT, 0, yB + 8); ao.addColorStop(0, 'rgba(255,240,220,.08)'); ao.addColorStop(.6, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,.28)');
    poly([Dp, C, up(C, h), up(Dp, h)], ao); poly([C, Bp, up(Bp, h), up(C, h)], ao);
  }
  // wall texture
  const face = (P0, P1, shadeF, cols, rows, opts) => {
    const len = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]);
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const t0 = (k + .18) / cols, t1 = (k + .82) / cols, v0 = opts.base + r * opts.step, v1 = v0 + opts.wh;
      if (v1 > h - 6) continue;
      const pa = [P0[0] + (P1[0] - P0[0]) * t0, P0[1] + (P1[1] - P0[1]) * t0], pb = [P0[0] + (P1[0] - P0[0]) * t1, P0[1] + (P1[1] - P0[1]) * t1];
      const lit = night && R() < (opts.lit || .35) * (typeof night === 'number' ? night : 1);
      poly([up(pa, v0), up(pb, v0), up(pb, v1), up(pa, v1)], lit ? (R() < .3 ? '#ffe9a8' : '#ffd36b') : opts.glass || (night ? shade('#121a28', shadeF) : shade(R() < .5 ? '#5f7fa3' : '#4f6e93', shadeF)));
      if (!lit && !night) { g.globalAlpha = .28; poly([up(pa, v1 - 2.5), up(pb, v1 - 2.5), up(pb, v1), up(pa, v1)], '#ffffff'); g.globalAlpha = .12; poly([pa.map((x, i) => x + (pb[i] - pa[i]) * .1).map((x, i) => i ? x - v1 + 1 : x), pa.map((x, i) => x + (pb[i] - pa[i]) * .35).map((x, i) => i ? x - v1 + 1 : x), pa.map((x, i) => x + (pb[i] - pa[i]) * .2).map((x, i) => i ? x - v0 - 1 : x), pa.map((x, i) => x + (pb[i] - pa[i]) * -.05).map((x, i) => i ? x - v0 - 1 : x)], '#ffffff'); g.globalAlpha = 1; }
      poly([up(pa, v0 - 1.6), up(pb, v0 - 1.6), up(pb, v0), up(pa, v0)], 'rgba(235,238,242,.55)');
      if (opts.wh > 9 && Math.abs(pb[0] - pa[0]) > 7) { const m0 = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2], q0 = tx(up(m0, v0)), q1 = tx(up(m0, v1)); g.strokeStyle = 'rgba(20,26,36,.55)'; g.lineWidth = .8; g.beginPath(); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); g.stroke(); }
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
    g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = .7; for (let k = 1; k < 5; k++) { const f = k / 5, a1 = tx([Dp[0] + (m1[0] - Dp[0]) * f, Dp[1] + (m1[1] - Dp[1]) * f - h - rh * f]), b1 = tx([C[0] + (m2[0] - C[0]) * f, C[1] + (m2[1] - C[1]) * f - h - rh * f]); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); g.stroke(); }
    mini(g, tx, b.x + b.w * .7, b.y + b.d * .3, .35, .35, rh + 4, h, '#8a5a44');
    { const d0 = [Dp[0] + (C[0] - Dp[0]) * .62, Dp[1] + (C[1] - Dp[1]) * .62], d1 = [Dp[0] + (C[0] - Dp[0]) * .74, Dp[1] + (C[1] - Dp[1]) * .74]; poly([d0, d1, up(d1, 14), up(d0, 14)], '#5b3a22'); poly([up(d0, 14), up(d1, 14), up(d1, 15.5), up(d0, 15.5)], '#f2efe8'); if (night) { const q = up([(d0[0] + d1[0]) / 2, (d0[1] + d1[1]) / 2], 18); winLit.push([q[0], q[1]]); } }
  } else {
    { const r0 = tx(up(A, h)), r1 = tx(up(C, h)), rg = g.createLinearGradient(r0[0], r0[1], r1[0], r1[1]); rg.addColorStop(0, shade(st === 'stadium' ? '#3f8a3a' : top, 1.08)); rg.addColorStop(1, shade(st === 'stadium' ? '#3f8a3a' : top, .9)); poly([up(A, h), up(Bp, h), up(C, h), up(Dp, h)], rg); }
    if (st !== 'stadium') { g.save(); poly([up(A, h), up(Bp, h), up(C, h), up(Dp, h)]); g.clip(); const n = Math.min(260, b.w * b.d * 10); for (let k = 0; k < n; k++) { const q = tx(up(iso(b.x + R() * b.w, b.y + R() * b.d), h)); g.fillStyle = R() < .5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.07)'; g.fillRect(q[0], q[1], 1.2, 1.2); } g.restore();
      poly([up(A, h), up(Bp, h), up(Bp, h + 3), up(A, h + 3)], shade(base, .9)); poly([up(A, h), up(Dp, h), up(Dp, h + 3), up(A, h + 3)], shade(base, .8)); poly([up(Dp, h), up(C, h), up(C, h + 3), up(Dp, h + 3)], shade(base, 1.0)); poly([up(C, h), up(Bp, h), up(Bp, h + 3), up(C, h + 3)], shade(base, .82)); }
    if (st === 'stadium') { g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.5; const m = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2 - h]; const q = tx(m); g.beginPath(); g.ellipse(q[0], q[1], 18, 9, 0, 0, Math.PI * 2); g.stroke(); poly([up([A[0], A[1] + 6], h + 1), up([Bp[0] - 12, Bp[1]], h + 1), up([C[0], C[1] - 6], h + 1), up([Dp[0] + 12, Dp[1]], h + 1)], null); }
    // parapet
    g.strokeStyle = shade(base, 1.25); g.lineWidth = 2; poly([up(A, h), up(Bp, h), up(C, h), up(Dp, h)]); g.stroke();
    // roof units
    if (st !== 'stadium' && st !== 'storage') for (let k = 0; k < Math.min(3, b.w); k++) { const cx = b.x + 1 + R() * (b.w - 1.5), cy = b.y + .5 + R() * (b.d - 1.2); mini(g, tx, cx, cy, .5, .4, 7, h, '#c7ccd2'); }
    if (b.dishes) { const p = tx(up(iso(b.x + b.w * .6, b.y + b.d * .4), h + 10)); g.fillStyle = '#eef1f4'; g.beginPath(); g.ellipse(p[0], p[1], 8, 5, -.5, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#8a9099'; g.stroke(); }
    if (b.dome) { const p = tx(up(iso(b.x + b.w / 2, b.y + b.d / 2), h)); const gr = g.createRadialGradient(p[0] - 8, p[1] - 30, 4, p[0], p[1] - 16, 34); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#9aa9b5'); g.fillStyle = gr; g.beginPath(); g.ellipse(p[0], p[1] - 4, 28, 14, 0, Math.PI, 0); g.lineTo(p[0] + 28, p[1] - 4); g.ellipse(p[0], p[1] - 4, 28, 30, 0, 0, Math.PI, true); g.fill(); }
  }
  // an entrance on the front face
  if (st !== 'house' && st !== 'storage' && st !== 'stadium' && h > 16) {
    const f0 = .44, f1 = .56, d0 = [Dp[0] + (C[0] - Dp[0]) * f0, Dp[1] + (C[1] - Dp[1]) * f0], d1 = [Dp[0] + (C[0] - Dp[0]) * f1, Dp[1] + (C[1] - Dp[1]) * f1], dh = st === 'garage' || st === 'bays' || st === 'corrugated' ? 13 : 15;
    poly([[d0[0] - 1.2, d0[1] - .6], [d1[0] + 1.2, d1[1] + .6], up([d1[0] + 1.2, d1[1] + .6], dh + 1.5), up([d0[0] - 1.2, d0[1] - .6], dh + 1.5)], shade(base, .55));
    const dg = g.createLinearGradient(0, tx(up(d0, dh))[1], 0, tx(d0)[1]); dg.addColorStop(0, night ? '#2a2414' : '#20303f'); dg.addColorStop(1, night ? '#5a4720' : '#3c5670');
    poly([d0, d1, up(d1, dh), up(d0, dh)], st === 'shop' || st === 'diner' || st === 'glass' ? dg : '#2a2f36');
    const mid = [(d0[0] + d1[0]) / 2, (d0[1] + d1[1]) / 2], q0 = tx(mid), q1 = tx(up(mid, dh)); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = .7; g.beginPath(); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); g.stroke();
    if (night) { const q = up(mid, dh + 4); winLit.push([q[0], q[1]]); }
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
  return { canvas: c, x: minX, y: minY, lights: winLit.slice(0, 10).map((p) => [p[0], p[1]]) };
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
    case 'hydrant': g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sx + 2, sy + 1, 5, 2.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#c0392b'; g.fillRect(sx - 3, sy - 10, 6, 10); g.fillRect(sx - 5, sy - 7, 10, 3); g.fillStyle = '#e74c3c'; g.beginPath(); g.arc(sx, sy - 10, 3, Math.PI, 0); g.fill(); return;
    case 'bin': g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sx + 2, sy + 1, 6, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#2f4f3a'; g.fillRect(sx - 4, sy - 12, 8, 12); g.fillStyle = '#3d6b4c'; g.fillRect(sx - 5, sy - 13, 10, 2.5); return;
    case 'bush': { const s = p.s || 1; g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(sx + 3, sy + 2, 10 * s, 4 * s, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = p.c || '#3f7d3a'; [[-4, -5, 6], [4, -5, 6], [0, -8, 7]].forEach(([a, b, r]) => { g.beginPath(); g.arc(sx + a * s, sy + b * s, r * s, 0, Math.PI * 2); g.fill(); }); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(sx - 1 * s, sy - 11 * s, 3 * s, 0, Math.PI * 2); g.fill(); return; }
    case 'flowers': g.fillStyle = '#3f7d3a'; g.beginPath(); g.ellipse(sx, sy - 2, 9, 4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = p.c || '#e84a5f'; for (let k = 0; k < 7; k++) { const a = k * 2.4; g.beginPath(); g.arc(sx + Math.cos(a) * 6, sy - 3 + Math.sin(a) * 2.5, 1.8, 0, Math.PI * 2); g.fill(); } return;
    case 'stall': { const c = p.color || '#d22d3d'; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sx + 3, sy + 3, 16, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#8a6a48'; g.fillRect(sx - 11, sy - 12, 22, 10); g.fillStyle = '#c9a77a'; g.fillRect(sx - 12, sy - 14, 24, 3); g.fillStyle = '#555'; g.fillRect(sx - 11, sy - 30, 2, 18); g.fillRect(sx + 9, sy - 30, 2, 18); g.fillStyle = c; g.beginPath(); g.moveTo(sx - 15, sy - 28); g.lineTo(sx, sy - 38); g.lineTo(sx + 15, sy - 28); g.lineTo(sx, sy - 22); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(sx - 7, sy - 33); g.lineTo(sx, sy - 38); g.lineTo(sx + 1, sy - 22); g.closePath(); g.fill(); ['#e74c3c', '#f1c40f', '#27ae60', '#e67e22'].forEach((f, k) => { g.fillStyle = f; g.beginPath(); g.arc(sx - 7 + k * 4.5, sy - 15, 2, 0, Math.PI * 2); g.fill(); }); return; }
    case 'xing': { const on = p.on && Math.floor(t / 300) % 2; g.fillStyle = '#ddd'; g.fillRect(sx - 1, sy - 30, 2, 30); g.save(); g.translate(sx, sy - 26); g.rotate(.6); g.fillStyle = '#fff'; g.fillRect(-8, -1.5, 16, 3); g.rotate(-1.2); g.fillRect(-8, -1.5, 16, 3); g.restore(); g.fillStyle = '#222'; g.fillRect(sx - 6, sy - 21, 12, 5); g.fillStyle = on ? '#ff3b3b' : '#4a1515'; g.beginPath(); g.arc(sx - 3, sy - 18.5, 2, 0, Math.PI * 2); g.fill(); g.fillStyle = !on && p.on ? '#ff3b3b' : '#4a1515'; g.beginPath(); g.arc(sx + 3, sy - 18.5, 2, 0, Math.PI * 2); g.fill(); return; }
    case 'cone': g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sx + 1, sy + 1, 5, 2.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ff6b1a'; g.beginPath(); g.moveTo(sx - 4, sy); g.lineTo(sx, sy - 12); g.lineTo(sx + 4, sy); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.fillRect(sx - 2.4, sy - 6, 4.8, 2); return;
    case 'tree': case 'palm': {
      const s = p.s || 1; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sx + 6, sy + 4, 16 * s, 7 * s, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#5b3d25'; g.fillRect(sx - 2, sy - (p.t === 'palm' ? 34 : 18) * s, 4, (p.t === 'palm' ? 34 : 18) * s);
      if (p.t === 'palm') { g.strokeStyle = '#2f7a35'; g.lineWidth = 4; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + Math.sin(t / 900 + p.x) * .06; g.beginPath(); g.moveTo(sx, sy - 34 * s); g.quadraticCurveTo(sx + Math.cos(a) * 12, sy - 40 * s, sx + Math.cos(a) * 20 * s, sy - 30 * s + Math.sin(a) * 6); g.stroke(); } break; }
      const sway = Math.sin(t / 1100 + p.x * 3) * 1.2, seed = Math.floor(p.x * 7 + p.y * 13), hue = ['#3f7a33', '#477f2f', '#3a6f3c', '#4f8a36'][seed & 3];
      // trunk shading and a canopy built from lit clumps (light from the upper left), with an outline for definition
      g.fillStyle = '#3e2816'; g.fillRect(sx + .5, sy - 18 * s, 1.6, 18 * s);
      const clumps = [[0, -28, 14], [-8, -23, 10], [8, -24, 10], [-3, -36, 10], [5, -34, 9], [0, -20, 9]];
      clumps.forEach(([dx, dy, r]) => { g.fillStyle = 'rgba(10,25,10,.45)'; g.beginPath(); g.arc(sx + dx * s + sway + .8, sy + dy * s + .8, r * s + 1, 0, Math.PI * 2); g.fill(); });
      clumps.forEach(([dx, dy, r], i) => { const cx2 = sx + dx * s + sway, cy2 = sy + dy * s, cg = g.createRadialGradient(cx2 - r * .45 * s, cy2 - r * .5 * s, r * .1 * s, cx2, cy2, r * s); cg.addColorStop(0, shade(hue, night ? .85 : 1.35)); cg.addColorStop(.6, night ? shade(hue, .65) : hue); cg.addColorStop(1, shade(hue, night ? .45 : .7)); g.fillStyle = cg; g.beginPath(); g.arc(cx2, cy2, r * s, 0, Math.PI * 2); g.fill(); });
      if (!night) { g.fillStyle = 'rgba(255,255,220,.16)'; for (let k = 0; k < 5; k++) { const a = (seed + k * 2.4) % 6.28; g.beginPath(); g.arc(sx + Math.cos(a) * 8 * s + sway - 3, sy - 32 * s + Math.sin(a) * 5 * s, 1.6 * s, 0, Math.PI * 2); g.fill(); } }
      break;
    }
    case 'lamp': g.fillStyle = '#2b2f36'; g.fillRect(sx - 1.5, sy - 40, 3, 40); g.fillRect(sx - 1.5, sy - 40, 12, 3); g.fillStyle = (p.on != null ? p.on : night) ? '#fff3c4' : '#9aa1a9'; g.fillRect(sx + 7, sy - 38, 6, 3); break;
    case 'flag': g.fillStyle = '#c9ced4'; g.fillRect(sx - 1, sy - 56, 2, 56); { const w = Math.sin(t / 300) * 2; g.fillStyle = '#b22234'; g.fillRect(sx + 1, sy - 56, 18, 10 + w * .2); g.fillStyle = '#3c3b6e'; g.fillRect(sx + 1, sy - 56, 8, 5); } break;
    case 'mast': { g.strokeStyle = '#c0392b'; g.lineWidth = 2; for (let k = 0; k < 9; k++) { const y0 = sy - k * 22, y1 = sy - (k + 1) * 22, w0 = 14 - k * 1.3, w1 = 14 - (k + 1) * 1.3; g.strokeStyle = k % 2 ? '#e8e8e8' : '#c0392b'; g.beginPath(); g.moveTo(sx - w0, y0); g.lineTo(sx - w1, y1); g.moveTo(sx + w0, y0); g.lineTo(sx + w1, y1); g.moveTo(sx - w0, y0); g.lineTo(sx + w1, y1); g.stroke(); } const blink = Math.floor(t / 700) % 2; g.fillStyle = blink ? '#ff3b30' : '#6b1a16'; g.beginPath(); g.arc(sx, sy - 200, 3, 0, Math.PI * 2); g.fill(); break; }
    case 'fountain': g.fillStyle = '#9aa3ab'; g.beginPath(); g.ellipse(sx, sy, 26, 13, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#4f8fbf'; g.beginPath(); g.ellipse(sx, sy - 2, 22, 10, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(220,240,255,.8)'; for (let k = 0; k < 6; k++) { const a = t / 400 + k; g.beginPath(); g.arc(sx + Math.cos(a) * 6, sy - 14 - Math.abs(Math.sin(a)) * 8, 2, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#b8c0c7'; g.fillRect(sx - 2, sy - 16, 4, 14); break;
    case 'bench': g.fillStyle = '#6b4a2f'; g.fillRect(sx - 12, sy - 8, 24, 4); g.fillStyle = '#3a3a3a'; g.fillRect(sx - 10, sy - 4, 2, 6); g.fillRect(sx + 8, sy - 4, 2, 6); break;
    case 'pump': g.fillStyle = '#d22d3d'; g.fillRect(sx - 5, sy - 22, 10, 22); g.fillStyle = '#f2f2f2'; g.fillRect(sx - 4, sy - 20, 8, 6); break;
    case 'canopy': { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(sx + 10, sy + 10, 60, 24, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#c9ced4'; [[-34, 0], [34, 0], [0, -17], [0, 17]].forEach(([dx, dy]) => g.fillRect(sx + dx - 2, sy + dy - 44, 4, 44)); g.fillStyle = '#f2f2f2'; g.beginPath(); g.moveTo(sx, sy - 70); g.lineTo(sx + 64, sy - 38); g.lineTo(sx, sy - 6); g.lineTo(sx - 64, sy - 38); g.closePath(); g.fill(); g.fillStyle = '#d22d3d'; g.beginPath(); g.moveTo(sx - 64, sy - 38); g.lineTo(sx, sy - 6); g.lineTo(sx, sy); g.lineTo(sx - 64, sy - 32); g.closePath(); g.fill(); g.beginPath(); g.moveTo(sx, sy - 6); g.lineTo(sx + 64, sy - 38); g.lineTo(sx + 64, sy - 32); g.lineTo(sx, sy); g.closePath(); g.fillStyle = '#a3212e'; g.fill(); break; }
    case 'crate': box(g, sx, sy, 22, 14, '#8a6d47'); break;
    case 'bus': box(g, sx, sy, 70, 26, p.color || '#2c7be5', 1.5); g.fillStyle = 'rgba(190,227,255,.7)'; g.fillRect(sx - 22, sy - 30, 40, 5); break;
    case 'semi': box(g, sx, sy, 64, 30, '#d6d9dd', 1.7); box(g, sx + 26, sy + 13, 18, 28, p.color || '#2563eb', .9); break;
    case 'boatT': boat(g, sx, sy - 8, 0, t, false); g.fillStyle = '#374151'; g.fillRect(sx - 14, sy - 4, 28, 3); break;
    case 'scrap': { const s2 = p.s || 1; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sx + 3, sy + 3, 20 * s2, 9 * s2, 0, 0, Math.PI * 2); g.fill(); ['#6b7280', '#92400e', '#4b5563', '#7c2d12', '#9ca3af'].forEach((c, k) => { g.fillStyle = c; g.beginPath(); g.moveTo(sx - 18 * s2 + k * 6, sy); g.lineTo(sx - 8 * s2 + k * 5, sy - (14 + k * 3) * s2); g.lineTo(sx + 2 * s2 + k * 4, sy); g.closePath(); g.fill(); }); break; }
    case 'hoop': g.fillStyle = '#6b7280'; g.fillRect(sx - 1, sy - 34, 3, 34); g.fillStyle = '#fff'; g.fillRect(sx - 9, sy - 42, 18, 12); g.strokeStyle = '#f97316'; g.lineWidth = 2; g.beginPath(); g.ellipse(sx, sy - 29, 5, 2, 0, 0, Math.PI * 2); g.stroke(); break;
    case 'lumberstack': box(g, sx, sy, 28, 12, '#c49a5c'); box(g, sx, sy - 12, 24, 10, '#b88c50'); break;
    case 'boxcar': box(g, sx, sy, 60, 30, p.color || '#8b3a2a', 1.6); break;
    case 'steeple': box(g, sx, sy - 46, 16, 26, '#efe8da'); g.fillStyle = '#5b6470'; g.beginPath(); g.moveTo(sx, sy - 110); g.lineTo(sx + 12, sy - 72); g.lineTo(sx - 12, sy - 72); g.closePath(); g.fill(); break;
    case 'firetruck': drawVehicle(g, sx, sy, p.dir || 1, { kind: 'van', body: '#b91c1c', side: '#b91c1c', stripe: '#f5f5f5', bar: 'full', scale: 1.5, text: 'ENGINE 3' }, t, night, false); break;
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

// people: civilians, or cadets in a unit kit (o.kit from data.js UNITS). Shaded, outlined, with faces and hair styles.
export function person(g, sx, sy, o, t) {
  const s = o.s || 1, ph = o.ph || 0, mv = !!o.moving, cyc = t / 95 + ph, walk = mv ? Math.sin(cyc) : 0, bob = mv ? Math.abs(Math.cos(cyc)) * .9 : Math.sin(t / 1100 + ph) * .3, face = o.face || 1;
  const K = o.kit || (o.officer ? { shirt: '#22355e', pants: '#1b2a4a', hat: 'cap', hatCol: '#16213d', patch: '#f5b800' } : null);
  const pants = K ? K.pants : o.pants || '#3b4a5c', shirt = K ? K.shirt : o.shirt || '#c0392b', skin = o.skin || '#e0b48f', hair = o.hair || '#2b1d14';
  const hs = o.hs != null ? o.hs : Math.floor(((ph * 9301 + 49297) % 233280) / 233280 * 6 + 6) % 6;
  const OL = 'rgba(12,16,26,.55)', lw = .7 * s, Y = sy - bob * s;
  const R = (x, y, w, h, r, fill, stroke) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); } };
  // contact shadow
  const sh = g.createRadialGradient(sx + 1, sy, 0, sx + 1, sy, 9 * s); sh.addColorStop(0, 'rgba(0,0,0,.38)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.beginPath(); g.ellipse(sx + 1, sy, 9 * s, 4 * s, 0, 0, Math.PI * 2); g.fill();
  if (K && K.camelbak) R(sx + (face > 0 ? -8.5 : 2.5) * s, Y - 25 * s, 6 * s, 12 * s, 2 * s, '#1f2937', true);
  // legs: back leg first, a step forward and back when walking
  const shoe = K && K.boots ? K.boots : K && K.plain ? '#1f2937' : o.shoes || '#16181d';
  const leg = (x, sw, back) => {
    const lx = sx + x * s + sw * 1.4 * s * face, top = Y - 12 * s, len = 11 * s - Math.max(0, -sw) * .8 * s;
    if (K && K.shorts) { R(lx, top + 3 * s, 3.4 * s, len - 3 * s, 1.2 * s, back ? shade(skin, .85) : skin, true); g.fillStyle = K.socks || '#111'; g.fillRect(lx, top + len - 2.6 * s, 3.4 * s, 1.5 * s); }
    else R(lx, top, 3.6 * s, len, 1.4 * s, back ? shade(pants, .78) : pants, true);
    R(lx - (face < 0 ? 1.4 * s : 0), top + len - 1.2 * s, 4.8 * s, 2.4 * s, 1.1 * s, back ? shade(shoe, .8) : shoe, true);
    if (K && K.boots && !back && (K.twinkle || K.shine)) { g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(lx + 1 * s, top + len - .8 * s, 1.2 * s, .6 * s); }
  };
  leg(-3.9, -walk, true); leg(.4, walk, false);
  if (K && K.shorts) R(sx - 4.6 * s, Y - 13 * s, 9.2 * s, 5.2 * s, 1.5 * s, pants, true);
  // back arm
  const arm = (side, sw, back) => {
    const ax = sx + side * 6.2 * s, ay = Y - 23 * s, ang = sw * .45 * face;
    g.save(); g.translate(ax, ay); g.rotate(ang); R(-1.4 * s, 0, 2.8 * s, 9.5 * s, 1.3 * s, back ? shade(shirt, .7) : shade(shirt, .88), true);
    g.beginPath(); g.arc(0, 10.4 * s, 1.5 * s, 0, Math.PI * 2); g.fillStyle = back ? shade(skin, .85) : skin; g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); g.restore();
  };
  arm(-face, walk, true);
  // torso: shoulders wider than the waist, lit from the upper left
  const tg = g.createLinearGradient(sx - 6 * s, 0, sx + 6 * s, 0); tg.addColorStop(0, shade(shirt, 1.08)); tg.addColorStop(.55, shirt); tg.addColorStop(1, shade(shirt, .74));
  g.beginPath(); g.moveTo(sx - 6.4 * s, Y - 22.5 * s); g.quadraticCurveTo(sx - 6.6 * s, Y - 24.6 * s, sx - 4 * s, Y - 24.8 * s); g.lineTo(sx + 4 * s, Y - 24.8 * s); g.quadraticCurveTo(sx + 6.6 * s, Y - 24.6 * s, sx + 6.4 * s, Y - 22.5 * s); g.lineTo(sx + 5.2 * s, Y - 11.5 * s); g.lineTo(sx - 5.2 * s, Y - 11.5 * s); g.closePath();
  g.fillStyle = tg; g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke();
  // collar
  g.fillStyle = shade(shirt, .7); g.beginPath(); g.moveTo(sx - 2.4 * s, Y - 24.8 * s); g.lineTo(sx, Y - 22 * s); g.lineTo(sx + 2.4 * s, Y - 24.8 * s); g.closePath(); g.fill();
  if (K) {
    if (K.vest) { const vg = g.createLinearGradient(sx - 6 * s, 0, sx + 6 * s, 0); vg.addColorStop(0, shade(K.vest === true ? '#d4ff3a' : K.vest === 'xxxl' ? '#d4ff3a' : K.vest, 1.05)); vg.addColorStop(1, shade(K.vest === true || K.vest === 'xxxl' ? '#d4ff3a' : K.vest, .78)); R(sx - (K.vest === 'xxxl' ? 7.6 : 6.3) * s, Y - 23.4 * s, (K.vest === 'xxxl' ? 15.2 : 12.6) * s, (K.vest === 'xxxl' ? 13 : 10.8) * s, 2 * s, vg, true); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(sx - 6 * s, Y - 17 * s, 12 * s, 1 * s);
      if (K.vestText) { g.fillStyle = K.vest === '#f97316' ? '#111' : '#fff'; g.font = '800 ' + 2.6 * s + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(K.vestText, sx, Y - 20 * s); } }
    if (K.tie) { g.fillStyle = K.tie; g.beginPath(); g.moveTo(sx - 1 * s, Y - 23.5 * s); g.lineTo(sx + 1 * s, Y - 23.5 * s); g.lineTo(sx + 1.4 * s, Y - 15 * s); g.lineTo(sx, Y - 13.5 * s); g.lineTo(sx - 1.4 * s, Y - 15 * s); g.fill(); }
    if (K.lanyard) { g.strokeStyle = K.lanyard; g.lineWidth = 1 * s; g.beginPath(); g.moveTo(sx - 3 * s, Y - 24 * s); g.lineTo(sx, Y - 17 * s); g.lineTo(sx + 3 * s, Y - 24 * s); g.stroke(); g.fillStyle = '#fff'; g.fillRect(sx - 1.5 * s, Y - 17 * s, 3 * s, 3.4 * s); }
    // duty belt with a buckle, name tag and shoulder patch
    R(sx - 5.4 * s, Y - 13.4 * s, 10.8 * s, 2.2 * s, .6 * s, '#0e1014'); g.fillStyle = '#c9b46a'; g.fillRect(sx - .9 * s, Y - 13.2 * s, 1.8 * s, 1.8 * s);
    g.fillStyle = K.patch || '#f5b800'; if (K.plain) g.fillRect(sx + 2 * s, Y - 13.2 * s, 2.4 * s, 2.4 * s); else if (!K.vest) { g.fillRect(sx + (face > 0 ? 1.4 : -4.2) * s, Y - 21.4 * s, 2.8 * s, 2.6 * s); g.fillStyle = '#e5e7eb'; g.fillRect(sx + (face > 0 ? -4.2 : 1.4) * s, Y - 20.6 * s, 2.8 * s, .9 * s); }
  } else if (o.pantsBelt !== false) { g.fillStyle = shade(pants, .6); g.fillRect(sx - 5.2 * s, Y - 12.6 * s, 10.4 * s, 1.2 * s); }
  // front arm swings opposite the front leg
  arm(face, -walk, false);
  // neck and head
  g.fillStyle = shade(skin, .82); g.fillRect(sx - 1.6 * s, Y - 26.5 * s, 3.2 * s, 2.4 * s);
  const hg = g.createRadialGradient(sx - 1.6 * s, Y - 30 * s, .5 * s, sx, Y - 28 * s, 6 * s); hg.addColorStop(0, shade(skin, 1.1)); hg.addColorStop(1, shade(skin, .82));
  g.beginPath(); g.ellipse(sx, Y - 28.6 * s, 4.9 * s, 5.4 * s, 0, 0, Math.PI * 2); g.fillStyle = hg; g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke();
  // ear on the far side, eyes and a hint of a nose toward the facing side
  g.fillStyle = shade(skin, .8); g.beginPath(); g.ellipse(sx - face * 4.4 * s, Y - 28.4 * s, 1.1 * s, 1.5 * s, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1b1b1f'; g.beginPath(); g.arc(sx + face * 1.1 * s, Y - 28.1 * s, .5 * s, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(sx + face * 3.4 * s, Y - 28.1 * s, .45 * s, 0, Math.PI * 2); g.fill();
  g.strokeStyle = shade(skin, .62); g.lineWidth = .6 * s; g.beginPath(); g.moveTo(sx + face * 4.6 * s, Y - 28.2 * s); g.lineTo(sx + face * 5 * s, Y - 26.8 * s); g.stroke();
  g.beginPath(); g.moveTo(sx + face * 1.6 * s, Y - 25.6 * s); g.lineTo(sx + face * 3.4 * s, Y - 25.8 * s); g.stroke();
  // headwear, or hair
  const hat = K ? K.hat : 'hair', hc = K && K.hatCol || '#16213d';
  const capTop = (col) => { const cg = g.createLinearGradient(sx - 5 * s, 0, sx + 5 * s, 0); cg.addColorStop(0, shade(col, 1.15)); cg.addColorStop(1, shade(col, .75)); g.beginPath(); g.ellipse(sx, Y - 30.6 * s, 5.4 * s, 4.4 * s, 0, Math.PI, 0); g.lineTo(sx + 5.4 * s, Y - 30 * s); g.lineTo(sx - 5.4 * s, Y - 30 * s); g.closePath(); g.fillStyle = cg; g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); };
  if (hat === 'cap') { capTop(hc); g.fillStyle = shade(hc, .7); g.beginPath(); g.ellipse(sx + face * 4.2 * s, Y - 30 * s, 4 * s, 1.3 * s, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = K.patch || '#f5b800'; g.fillRect(sx + face * .4 * s - 1 * s, Y - 33.2 * s, 2 * s, 1.6 * s); }
  else if (hat === 'helmet') { const cg = g.createRadialGradient(sx - 2 * s, Y - 33 * s, 1, sx, Y - 30 * s, 7 * s); cg.addColorStop(0, shade(hc, 1.3)); cg.addColorStop(1, shade(hc, .8)); g.beginPath(); g.ellipse(sx, Y - 30 * s, 6.4 * s, 5.6 * s, 0, Math.PI * 1.02, -.02); g.closePath(); g.fillStyle = cg; g.fill(); g.strokeStyle = OL; g.stroke(); g.fillStyle = shade(hc, .7); g.fillRect(sx - 6.4 * s, Y - 30.4 * s, 12.8 * s, 1.8 * s); }
  else if (hat === 'boonie') { g.fillStyle = shade(hc, .85); g.beginPath(); g.ellipse(sx, Y - 30.6 * s, 8 * s, 2.4 * s, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = OL; g.stroke(); capTop(hc); }
  else if (hat === 'campaign') { g.fillStyle = shade(hc, .85); g.beginPath(); g.ellipse(sx, Y - 31 * s, 9 * s, 3 * s, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); const cg = g.createLinearGradient(sx - 4 * s, 0, sx + 4 * s, 0); cg.addColorStop(0, shade(hc, 1.2)); cg.addColorStop(1, shade(hc, .8)); g.beginPath(); g.moveTo(sx - 4.5 * s, Y - 31.4 * s); g.lineTo(sx - 2.6 * s, Y - 38.4 * s); g.lineTo(sx, Y - 36.8 * s); g.lineTo(sx + 2.6 * s, Y - 38.4 * s); g.lineTo(sx + 4.5 * s, Y - 31.4 * s); g.closePath(); g.fillStyle = cg; g.fill(); g.stroke(); g.fillStyle = '#111'; g.fillRect(sx - 4.5 * s, Y - 32.8 * s, 9 * s, 1.4 * s); }
  else if (hat === 'sweatband') { g.fillStyle = hair; g.beginPath(); g.ellipse(sx, Y - 30.4 * s, 5.2 * s, 4.2 * s, 0, Math.PI, 0); g.fill(); g.fillStyle = hc; R(sx - 5.3 * s, Y - 31.6 * s, 10.6 * s, 2.2 * s, 1 * s, hc); }
  else if (hat === 'headset') { g.fillStyle = hair; g.beginPath(); g.ellipse(sx, Y - 30.4 * s, 5.2 * s, 4.2 * s, 0, Math.PI, 0); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 1.2 * s; g.beginPath(); g.arc(sx, Y - 29.4 * s, 5.8 * s, Math.PI * 1.1, -.1); g.stroke(); g.fillStyle = '#111'; R(sx - face * 6.2 * s, Y - 30 * s, 2.2 * s, 3.2 * s, .8 * s, '#111'); g.strokeStyle = '#111'; g.lineWidth = .7 * s; g.beginPath(); g.moveTo(sx - face * 5 * s, Y - 27.5 * s); g.quadraticCurveTo(sx + face * 1 * s, Y - 24.5 * s, sx + face * 3 * s, Y - 25.6 * s); g.stroke(); }
  else {
    // six hair styles: crop, buzz, side part, bun, long, curls
    const hcol = hair, dark = shade(hcol, .7); g.fillStyle = hcol; g.strokeStyle = OL; g.lineWidth = lw;
    if (hs === 1) { g.globalAlpha = .9; g.beginPath(); g.ellipse(sx, Y - 30.2 * s, 5 * s, 3.8 * s, 0, Math.PI, 0); g.fill(); g.globalAlpha = 1; }
    else if (hs === 4) { g.beginPath(); g.moveTo(sx - 5.4 * s, Y - 23 * s); g.lineTo(sx - 5.6 * s, Y - 30 * s); g.ellipse(sx, Y - 30.4 * s, 5.6 * s, 5 * s, 0, Math.PI, 0); g.lineTo(sx + 5.4 * s, Y - 23 * s); g.lineTo(sx + 3.6 * s, Y - 24 * s); g.lineTo(sx + 4 * s, Y - 29.5 * s); g.lineTo(sx - 4 * s, Y - 29.5 * s); g.lineTo(sx - 3.6 * s, Y - 24 * s); g.closePath(); g.fill(); g.stroke(); }
    else if (hs === 5) { for (let k = 0; k < 7; k++) { const a = Math.PI + k / 6 * Math.PI; g.beginPath(); g.arc(sx + Math.cos(a) * 4.4 * s, Y - 30 * s + Math.sin(a) * 4 * s, 1.9 * s, 0, Math.PI * 2); g.fill(); } }
    else { g.beginPath(); g.ellipse(sx, Y - 30.4 * s, 5.4 * s, 4.8 * s, 0, Math.PI, 0); g.lineTo(sx + 5.4 * s, Y - 29 * s); g.lineTo(sx - 5.4 * s, Y - 29 * s); g.closePath(); g.fill(); g.stroke(); }
    if (hs === 2) { g.fillStyle = dark; g.beginPath(); g.moveTo(sx - face * 1 * s, Y - 34.8 * s); g.quadraticCurveTo(sx + face * 4 * s, Y - 34 * s, sx + face * 5.2 * s, Y - 30 * s); g.lineTo(sx + face * 2 * s, Y - 31.6 * s); g.closePath(); g.fill(); }
    if (hs === 3) { g.beginPath(); g.arc(sx - face * 2 * s, Y - 35 * s, 2.4 * s, 0, Math.PI * 2); g.fillStyle = hcol; g.fill(); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(sx - 1.6 * s, Y - 33 * s, 1.8 * s, .8 * s, -.3, 0, Math.PI * 2); g.fill();
  }
}

// a working dog that trots beside its handler
export function dog(g, sx, sy, face, moving, t) {
  const b = moving ? Math.sin(t / 70) * 1.2 : 0, f = face || 1;
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sx + 1, sy + 1, 8, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3a2614'; g.fillRect(sx - 6, sy - 5 + b, 2, 5); g.fillRect(sx + 4, sy - 5 - b, 2, 5);
  g.fillStyle = '#8b5a2b'; g.beginPath(); g.ellipse(sx, sy - 7, 8, 3.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2b1a0c'; g.beginPath(); g.ellipse(sx - f * 1, sy - 9, 5, 2.2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8b5a2b'; g.beginPath(); g.arc(sx + f * 8, sy - 11, 3.4, 0, Math.PI * 2); g.fill(); g.fillRect(sx + f * 9 - (f < 0 ? 4 : 0), sy - 11, 4, 2.4);
  g.fillStyle = '#2b1a0c'; g.beginPath(); g.moveTo(sx + f * 6.5, sy - 13.5); g.lineTo(sx + f * 7.5, sy - 17.5); g.lineTo(sx + f * 9, sy - 13.5); g.fill();
  g.strokeStyle = '#8b5a2b'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(sx - f * 8, sy - 8); g.lineTo(sx - f * 11, sy - 12 + b); g.stroke();
  g.fillStyle = '#c0392b'; g.fillRect(sx + f * 5 - 1, sy - 10, 2, 2);
}

// ---------- vehicles: one renderer for every car, truck, van and SUV ----------
// local coordinates: u runs nose (+1) to tail (-1), v runs across, h is height in px. dir 0..3 = +x, +y, -x, -y.
function rig(sx, sy, dir, s, hl, hw) {
  const U = [[1, 0], [0, 1], [-1, 0], [0, -1]][dir & 3], V = [-U[1], U[0]];
  const P = (u, v, h) => { const wx = U[0] * u * hl + V[0] * v * hw, wy = U[1] * u * hl + V[1] * v * hw; return [sx + (wx - wy) * 32 * s, sy + (wx + wy) * 16 * s - h * s]; };
  // which faces point toward the camera: exactly one end and one side
  const uVis = U[0] + U[1] > 0 ? 1 : -1, vVis = V[0] + V[1] > 0 ? 1 : -1;
  return { P, uVis, vVis, U };
}
function vQuad(g, pts, fill, line) { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = fill; g.fill(); if (line) { g.strokeStyle = line; g.lineWidth = .6; g.stroke(); } }
function lerpP(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
export function drawVehicle(g, sx, sy, dir, v, t, night, on) {
  const s = v.scale || 1, kind = v.kind || 'sedan', tall = { armored: 1.55, van: 1.45, suv: 1.2, truck: 1.15 }[kind] || 1;
  const hl = kind === 'van' || kind === 'armored' ? .44 : .41, hw = .2, H = 8.5 * tall, R = rig(sx, sy, dir, s, hl, hw), P = R.P, uE = R.uVis, vE = R.vVis;
  const body = v.body, sideCol = v.side || body, line = 'rgba(8,12,20,.45)';
  // soft shadow
  const c0 = P(0, 0, 0), sg = g.createRadialGradient(c0[0] + 2, c0[1] + 2, 2, c0[0] + 2, c0[1] + 2, 22 * s); sg.addColorStop(0, 'rgba(0,0,0,.42)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sg; g.beginPath(); g.ellipse(c0[0] + 2, c0[1] + 2, 22 * s, 11 * s, 0, 0, Math.PI * 2); g.fill();
  // wheels on the visible side (drawn first so the body overlaps their tops)
  [-.62, .62].forEach((u) => { const w = P(u, vE * 1.02, 2.4); g.fillStyle = '#0d0f12'; g.beginPath(); g.ellipse(w[0], w[1], 3.3 * s, 2.6 * s, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6b7280'; g.beginPath(); g.ellipse(w[0], w[1], 1.5 * s, 1.2 * s, 0, 0, Math.PI * 2); g.fill(); });
  // lower body: visible end and side, then the top
  const h0 = 2.2, sideFace = [P(-1, vE, h0), P(1, vE, h0), P(1, vE, H), P(-1, vE, H)], endFace = [P(uE, -1, h0), P(uE, 1, h0), P(uE, 1, H), P(uE, -1, H)];
  const sGrad = g.createLinearGradient(0, sideFace[2][1], 0, sideFace[0][1]); sGrad.addColorStop(0, shade(sideCol, .95)); sGrad.addColorStop(1, shade(sideCol, .68));
  vQuad(g, sideFace, sGrad, line); vQuad(g, endFace, shade(sideCol, .6), line);
  // police two-tone doors / unit stripe
  if (v.doors) { vQuad(g, [P(-.42, vE, h0 + .5), P(.32, vE, h0 + .5), P(.32, vE, H - .3), P(-.42, vE, H - .3)], v.doors); }
  if (v.stripe) { vQuad(g, [P(-1, vE, H * .42), P(1, vE, H * .42), P(1, vE, H * .62), P(-1, vE, H * .62)], v.stripe); vQuad(g, [P(uE, -1, H * .42), P(uE, 1, H * .42), P(uE, 1, H * .62), P(uE, -1, H * .62)], shade(v.stripe, .8)); }
  // door seams and handle
  g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = .6; [-.42, .32].forEach((u) => { const a = P(u, vE, h0 + .4), b = P(u, vE, H - .4); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); });
  // bumper
  vQuad(g, [P(uE, -1, h0), P(uE, 1, h0), P(uE, 1, h0 + 1.6), P(uE, -1, h0 + 1.6)], '#1f2329');
  const top = [P(-1, -1, H), P(1, -1, H), P(1, 1, H), P(-1, 1, H)], tg = g.createLinearGradient(top[0][0], top[0][1], top[2][0], top[2][1]); tg.addColorStop(0, shade(body, 1.22)); tg.addColorStop(1, shade(body, .95));
  vQuad(g, top, tg, line);
  // cabin (a box on top for vans and armored trucks, a sloped greenhouse for the rest)
  const boxy = kind === 'van' || kind === 'armored';
  const c = boxy ? { a: -1, b: .62, ta: -1, tb: .5, w: 1, tw: .96, h: 6.5 } : kind === 'truck' ? { a: -.05, b: .5, ta: .02, tb: .38, w: .86, tw: .74, h: 6.8 } : kind === 'suv' ? { a: -.92, b: .45, ta: -.88, tb: .3, w: .88, tw: .78, h: 7.4 } : { a: -.55, b: .4, ta: -.45, tb: .22, w: .86, tw: .72, h: 6.8 };
  const cH = H + c.h, ca = uE > 0 ? c.b : c.a, cat = uE > 0 ? c.tb : c.ta;
  const cSide = [P(c.a, vE * c.w, H), P(c.b, vE * c.w, H), P(c.tb, vE * c.tw, cH), P(c.ta, vE * c.tw, cH)], cEnd = [P(ca, -c.w, H), P(ca, c.w, H), P(cat, c.tw, cH), P(cat, -c.tw, cH)];
  vQuad(g, cSide, shade(sideCol, boxy ? .9 : .85), line); vQuad(g, cEnd, shade(sideCol, .66), line);
  // glass: side windows split by a pillar, plus the windshield or rear window
  const glass = (q, k) => { const gg = g.createLinearGradient(q[3][0], q[3][1], q[1][0], q[1][1]); gg.addColorStop(0, night ? '#0e1622' : '#9cc2e6'); gg.addColorStop(.45, night ? '#152234' : '#3c5b7d'); gg.addColorStop(1, night ? '#0b111b' : '#1d2c3e'); vQuad(g, q, gg); if (!night) { g.globalAlpha = .35 * (k || 1); vQuad(g, [lerpP(q[0], q[1], .1), lerpP(q[0], q[1], .3), lerpP(q[3], q[2], .22), lerpP(q[3], q[2], .05)], '#ffffff'); g.globalAlpha = 1; } };
  const inset = (q, a, b) => [lerpP(lerpP(q[0], q[3], a), lerpP(q[1], q[2], a), b), lerpP(lerpP(q[1], q[2], a), lerpP(q[0], q[3], a), b), lerpP(lerpP(q[1], q[2], 1 - a * .6), lerpP(q[0], q[3], 1 - a * .6), b), lerpP(lerpP(q[0], q[3], 1 - a * .6), lerpP(q[1], q[2], 1 - a * .6), b)];
  if (boxy) glass(inset(cSide, .22, .08), .8);
  else { const mid = .5, w1 = inset([cSide[0], lerpP(cSide[0], cSide[1], mid), lerpP(cSide[3], cSide[2], mid), cSide[3]], .14, .1), w2 = inset([lerpP(cSide[0], cSide[1], mid), cSide[1], cSide[2], lerpP(cSide[3], cSide[2], mid)], .14, .1); glass(w1); glass(w2); }
  glass(inset(cEnd, .12, .1), 1.2);
  const roof = [P(c.ta, -c.tw, cH), P(c.tb, -c.tw, cH), P(c.tb, c.tw, cH), P(c.ta, c.tw, cH)], rg = g.createLinearGradient(roof[0][0], roof[0][1], roof[2][0], roof[2][1]); rg.addColorStop(0, shade(v.roof || body, 1.25)); rg.addColorStop(1, shade(v.roof || body, 1));
  vQuad(g, roof, rg, line);
  if (kind === 'truck') { vQuad(g, [P(-1, -1, H), P(-.1, -1, H), P(-.1, 1, H), P(-1, 1, H)], '#0b2536'); const q = P(-.55, 0, H + 3); g.fillStyle = '#e2e8f0'; g.beginPath(); g.ellipse(q[0], q[1], 6 * s, 2.8 * s, 0, 0, Math.PI * 2); g.fill(); }
  if (kind === 'armored') { g.fillStyle = '#14180f'; for (let k = -2; k <= 1; k++) { const q = P(k * .3 + .1, vE, H * .7); g.fillRect(q[0] - 1.2 * s, q[1] - 1, 2.4 * s, 2.4 * s); } }
  // roof text (unit number)
  if (v.roofText) { const q = P(c.ta * .4 + c.tb * .6, 0, cH + .2); g.save(); g.translate(q[0], q[1]); g.scale(1, .5); g.rotate(R.U[0] ? Math.PI / 4 : -Math.PI / 4); g.fillStyle = '#111'; g.font = '800 ' + 5 * s + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(v.roofText, 0, 0); g.restore(); }
  // side text
  if (v.text) { const q = P(-.05, vE, H * .52), a = P(-1, vE, 0), b = P(1, vE, 0); let ex = b[0] - a[0], ey = b[1] - a[1]; if (ex < 0) { ex = -ex; ey = -ey; } const L = Math.hypot(ex, ey); g.save(); g.translate(q[0], q[1]); g.transform(ex / L, ey / L, 0, 1, 0, 0); g.fillStyle = v.stripe || v.doors ? '#0b0b0b' : '#ffffff'; g.font = '800 ' + 3.6 * s + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(v.text, 0, 0); g.restore(); }
  // light bar
  const blink = on && Math.floor(t / 160) % 2;
  if (v.bar === 'full') { const lbH = cH + 2.2, a0 = c.ta * .5 + c.tb * .5; vQuad(g, [P(a0 - .06, -.62, cH), P(a0 + .06, -.62, cH), P(a0 + .06, .62, cH), P(a0 - .06, .62, cH)], '#111'); vQuad(g, [P(a0 - .06, -.6, lbH), P(a0 + .06, -.6, lbH), P(a0 + .06, 0, lbH), P(a0 - .06, 0, lbH)], blink ? '#ff3b3b' : on ? '#7a1a1a' : '#5a1616'); vQuad(g, [P(a0 - .06, 0, lbH), P(a0 + .06, 0, lbH), P(a0 + .06, .6, lbH), P(a0 - .06, .6, lbH)], on && !blink ? '#3b7bff' : '#16285e'); vQuad(g, [P(uE > 0 ? a0 + .06 : a0 - .06, -.6, cH), P(uE > 0 ? a0 + .06 : a0 - .06, .6, cH), P(uE > 0 ? a0 + .06 : a0 - .06, .6, lbH), P(uE > 0 ? a0 + .06 : a0 - .06, -.6, lbH)], '#2a2f37'); }
  else if (on) { const q = P(uE, blink ? .45 : -.45, H * .7); g.fillStyle = blink ? '#ff3b3b' : '#3b7bff'; g.beginPath(); g.arc(q[0], q[1], 1.6 * s, 0, Math.PI * 2); g.fill(); }
  if (v.bar === 'grille' && on) { const q = P(uE, 0, H * .5); g.fillStyle = blink ? '#ff3b3b' : '#3b7bff'; g.fillRect(q[0] - 2 * s, q[1] - 1, 4 * s, 2); }
  // lights on the visible end: headlights at the nose, tail lights at the back
  const lc = uE > 0 ? (night ? '#fff7d6' : '#eef2f5') : (night ? '#ff4a3d' : '#b42318');
  [-.62, .62].forEach((vv) => { const q = [P(uE, vv - .16, H * .55), P(uE, vv + .16, H * .55), P(uE, vv + .16, H * .78), P(uE, vv - .16, H * .78)]; vQuad(g, q, lc); });
  if (v.push && uE > 0) vQuad(g, [P(1.08, -.6, h0), P(1.08, .6, h0), P(1.08, .6, H * .8), P(1.08, -.6, H * .8)], '#16181c');
  // specular glint along the roof edge
  if (!night) { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = .8; const a = P(-1, vE, H), b = P(1, vE, H); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
}
export function car(g, sx, sy, dir, color, police, t, night, scale, bar) {
  if (police) return drawVehicle(g, sx, sy, dir, { kind: 'sedan', body: '#111418', side: '#111418', doors: '#f2f2f2', bar: 'full', push: true, text: 'POLICE', scale: scale || 1 }, t, night, bar);
  return drawVehicle(g, sx, sy, dir, { kind: (color.charCodeAt(1) + color.charCodeAt(2)) % 5 === 0 ? 'suv' : 'sedan', body: color, side: color, scale: scale || 1 }, t, night, false);
}
export function vehicle(g, sx, sy, dir, v, t, night, on) {
  if (v.kind === 'boat') return boat(g, sx, sy, dir, t, on);
  const spec = Object.assign({}, v); if (v.body === '#14171c') { spec.doors = '#f2f2f2'; spec.push = true; spec.side = v.body; }
  return drawVehicle(g, sx, sy, dir, spec, t, night, on);
}

function boat(g, sx, sy, dir, t, on) {
  const along = dir % 2 === 0, sg = dir >= 2 ? -1 : 1, bob = Math.sin(t / 400) * 1.2, L = 30, Wd = 12;
  const ax = along ? [sg * L * .5, sg * L * .25] : [-sg * L * .5, sg * L * .25], aw = along ? [-Wd * .5, Wd * .25] : [Wd * .5, Wd * .25];
  const P = (u, w, h) => [sx + ax[0] * u + aw[0] * w, sy + ax[1] * u + aw[1] * w - h + bob];
  const poly = (pts, f) => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fillStyle = f; g.fill(); };
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.5; g.beginPath(); const w0 = P(-1.2, 0, -2); g.ellipse(w0[0], w0[1], 10, 4, 0, 0, Math.PI * 2); g.stroke();
  poly([P(-1, 1, 0), P(.7, 1, 0), P(1.15, 0, 2), P(.7, -1, 0), P(-1, -1, 0)], '#0b4a6f');
  poly([P(-1, 1, 0), P(.7, 1, 0), P(.7, 1, 5), P(-1, 1, 5)], '#f2f2f2');
  poly([P(-1, 1, 5), P(.7, 1, 5), P(1.15, 0, 6), P(.7, -1, 5), P(-1, -1, 5)], '#dfe7ee');
  poly([P(-1, 1, 2), P(.7, 1, 2), P(.7, 1, 3.2), P(-1, 1, 3.2)], '#0369a1');
  poly([P(-.4, .7, 5), P(.25, .7, 5), P(.15, .6, 12), P(-.35, .6, 12)], '#24323f');
  poly([P(-.35, -.6, 12), P(.15, -.6, 12), P(.15, .6, 12), P(-.35, .6, 12)], '#f2f2f2');
  const blink = on && Math.floor(t / 180) % 2; g.fillStyle = blink ? '#ff2d2d' : on ? '#2d6bff' : '#1a2f7a'; const q = P(-.1, 0, 14); g.fillRect(q[0] - 3, q[1] - 2, 6, 3);
}
