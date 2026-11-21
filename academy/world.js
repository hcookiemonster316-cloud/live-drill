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
  // zoning: every block belongs to a zone (downtown core, commercial, residential, industrial, rural, waterfront, civic),
  // the named places go in the zone they belong to, next to the places they belong with, and the rest fills in by zone
  const plan = PLAN[did], zoneAt = [], blocks = [];
  for (let by = 0; by < NB; by++) for (let bx = 0; bx < NB; bx++) { if (D.river && bx === NB - 1) continue; const z = plan.zone(bx, by); zoneAt[by * NB + bx] = z; blocks.push({ bx, by, z }); }
  W.zoneAt = (x, y) => zoneAt[Math.floor((y - 2) / 11) * NB + Math.floor((x - 2) / 11)] || null;
  const hand = D.lots.filter((e) => e !== 'parking'), used = new Set(hand.flatMap((e) => (e && e.strip ? e.strip.map((x) => x[1]) : Array.isArray(e) ? [e[1]] : [])));
  const nameOf = (e) => (e && e.strip ? e.strip[0][1] : Array.isArray(e) ? e[1] : (LANDMARKS[e] || {}).name || e), kindOf = (e) => (e && e.strip ? 'strip' : Array.isArray(e) ? e[0] : e);
  const taken = new Map(), placedAt = {};
  hand.forEach((e) => {
    const nm = nameOf(e), want = (plan.put && plan.put[nm]) || ZONE_OF[kindOf(e)] || 'commercial', near = plan.near && plan.near[nm] && placedAt[plan.near[nm]];
    const anchor = near || plan.center || [6, 6], free = blocks.filter((b) => !taken.has(b.by * NB + b.bx));
    const strict = !!(plan.put && plan.put[nm]), score = (b) => Math.hypot(b.bx - anchor[0], b.by - anchor[1]) + (b.z === want ? 0 : (ZONE_OK[want] || []).indexOf(b.z) >= 0 ? (strict ? 30 : 4) : 40);
    const b = free.sort((a, c) => score(a) - score(c))[0]; taken.set(b.by * NB + b.bx, e); placedAt[nm] = [b.bx, b.by];
  });
  blocks.forEach(({ bx, by, z }) => {
    const ox = 2 + bx * 11, oy = 2 + by * 11, hk = taken.has(by * NB + bx), entry = hk ? taken.get(by * NB + bx) : genEntry(z, W.D.theme, R, used, bx, by);
    for (let y = oy + 1; y <= oy + 7; y++) for (let x = ox + 1; x <= ox + 7; x++) set(x, y, T.GRASS);
    if (entry && entry.strip) { strip(W, entry.strip, ox, oy, R); if (!hk) W.lots.slice(-4).forEach((l) => { l.gen = true; }); }
    else {
      const [kind, nm, sg] = Array.isArray(entry) ? entry : [entry];
      const lot = { kind, ox, oy, bx, by, zone: z, name: nm || (LANDMARKS[kind] || {}).name || '', sign: sg, door: [ox + 4, oy + 8], info: [ox + 6, oy + 8], gen: !hk };
      W.lots.push(lot);
      fill(W, lot, R);
      lot.bld = W.buildings.filter((b) => b.x >= ox + 1 && b.x <= ox + 7 && b.y >= oy + 1 && b.y <= oy + 7).sort((a, b) => b.w * b.d - a.w * a.d)[0] || null;
    }
    if (z !== 'rural') [[ox, oy], [ox + 8, oy], [ox, oy + 8], [ox + 8, oy + 8]].forEach(([x, y]) => W.props.push({ t: 'lamp', x: x + .5, y: y + .5 }));
    else if ((bx + by) % 2 === 0) W.props.push({ t: 'lamp', x: ox + .5, y: oy + 8.5 });
  });
  // every business gets a customer parking row along its front, with curb cuts to the street
  const OPEN = new Set(['farm', 'woods', 'houses', 'park', 'plaza', 'lot', 'railyard', 'stadium', 'apartments', 'radio', 'church', 'parking', 'garage', 'storage', 'scrapyard', 'jail', 'warehouse', 'lumber', 'marina', 'firestation']);
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
// ---------- zoning ----------
// which zone each kind of place belongs in, and which other zones it can sit in at a pinch
const ZONE_OF = { hq: 'core', dispatch: 'core', records: 'core', bank: 'core', tower: 'core', plaza: 'core', library: 'core', garage: 'core', transit: 'core', clinic: 'core', radio: 'residential',
  substation: 'commercial', diner: 'commercial', strip: 'commercial', shop: 'commercial', gas: 'commercial', mall: 'commercial', motel: 'commercial', autoshop: 'commercial', carwash: 'commercial', gym: 'commercial', pawn: 'commercial', center: 'residential',
  houses: 'residential', apartments: 'residential', park: 'residential', church: 'residential', school: 'residential', firestation: 'residential', stadium: 'residential', marina: 'waterfront',
  warehouse: 'industrial', storage: 'industrial', railyard: 'industrial', scrapyard: 'industrial', lumber: 'industrial', truckstop: 'industrial', lot: 'industrial',
  courthouse: 'civic', jail: 'civic', sallyport: 'civic', bonds: 'commercial', defender: 'civic', farm: 'rural', woods: 'rural' };
const ZONE_OK = { core: ['civic', 'commercial'], civic: ['core', 'commercial'], commercial: ['core', 'civic', 'residential'], residential: ['commercial', 'waterfront', 'rural'], industrial: ['rural', 'commercial'], waterfront: ['residential'], rural: ['residential', 'industrial'] };
const ZMIX = {
  core: [['tower', 32], ['strip', 14], ['apartments', 10], ['plaza', 5], ['bank', 4], ['garage', 3], ['diner', 3], ['clinic', 3], ['park', 4]],
  civic: [['tower', 26], ['strip', 18], ['plaza', 8], ['park', 6], ['bonds', 5], ['apartments', 8], ['diner', 4], ['shop', 4]],
  commercial: [['strip', 30], ['shop', 8], ['diner', 6], ['gas', 6], ['autoshop', 5], ['mall', 5], ['motel', 3], ['carwash', 3], ['gym', 3], ['apartments', 6], ['clinic', 3]],
  residential: [['houses', 58], ['apartments', 12], ['park', 10], ['church', 4], ['school', 3], ['shop', 3]],
  industrial: [['warehouse', 42], ['storage', 10], ['scrapyard', 6], ['lumber', 6], ['railyard', 4], ['autoshop', 5], ['gas', 2]],
  rural: [['farm', 45], ['woods', 38], ['houses', 6]],
  waterfront: [['park', 34], ['marina', 14], ['strip', 14], ['houses', 14]]
};
const cheb = (bx, by, cx, cy) => Math.max(Math.abs(bx - cx), Math.abs(by - cy));
// one plan per district: zone(bx, by) for the 13 x 13 blocks; near: named places that sit next to another named place
const PLAN = [
  { // Central District: a downtown core around the station and the plaza, shops around it, neighborhoods at the edges
    zone: (bx, by) => { const d = cheb(bx, by, 6, 6); return d <= 2 ? 'core' : d <= 4 ? 'commercial' : 'residential'; },
    put: { 'Radio Tower': 'residential', 'Spokes & Spares': 'commercial', 'Founders Park': 'core', 'Downtown Urgent Care': 'commercial', 'Night Owl Diner': 'commercial' },
    near: { 'Dispatch Center': 'Patrol HQ', 'Records · FCIC Terminal': 'Patrol HQ', 'Founders Plaza': 'Patrol HQ', 'Downtown Transit Center': 'Founders Plaza', 'Founders Park': 'Founders Plaza', 'Central Library': 'Founders Park', 'First Coast Bank': 'Founders Plaza', 'City Garage': 'Meridian Office Tower', 'Grind & Badge Coffee': 'Patrol HQ', 'Night Owl Diner': 'Downtown Transit Center' } },
  { // Eastside: the highway corridor of gas, auto and motels through the middle, neighborhoods north and south, a fuel and auto corner by the east gate
    zone: (bx, by) => (by >= 5 && by <= 7) ? (bx >= 10 ? 'industrial' : 'commercial') : (bx >= 4 && bx <= 8 && (by === 4 || by === 8)) ? 'commercial' : (by <= 1 && bx <= 2) || (by >= 11 && bx >= 10) ? 'rural' : 'residential',
    put: { 'Fuel Depot': 'industrial', 'Eastside Community Center': 'residential', 'Iron Will Boxing Gym': 'commercial', 'Eastside Dog Park': 'residential' },
    near: { 'Maple Court': 'Eastside Community Center', 'Eastgate Apartments': 'Eastgate Motel', 'Birch Lane': 'Maple Court', 'Eastside Dog Park': 'Maple Court', "Big Earl's Auto": 'Gas & Go', 'Bubbles Car Wash': "Big Earl's Auto", 'Eastgate Motel': 'Eastside Plaza' } },
  { // Riverside: old neighborhoods, a small main street, the waterfront along the river, farmland and woods to the northwest
    zone: (bx, by) => bx >= 10 ? 'waterfront' : (bx <= 3 && by <= 3) ? 'rural' : (by === 6 && bx >= 3 && bx <= 8) ? 'commercial' : 'residential',
    put: { 'Willow Creek Farm': 'rural', 'Cypress Hammock': 'rural', 'Hook, Line & Sinker': 'waterfront', 'Riverwalk': 'waterfront', 'Heron Point': 'waterfront', 'Riverside Park': 'waterfront', 'River Stadium': 'waterfront', 'River Pawn': 'commercial' },
    near: { 'Hook, Line & Sinker': 'Riverside Marina', 'Riverside Marina': 'Riverside Park', 'River Stadium': 'Riverside Park', 'Riverside School': 'Community Church', 'Little Paddlers Daycare': 'Riverside School', 'River Bend Apartments': 'Willow Street', 'Fire Station 3': 'Willow Street' },
    center: [8, 6] },
  { // Industrial Park: warehouses and yards along the freight line, worker housing in the northeast, scrubland and pines on the far edges
    zone: (bx, by) => (bx <= 1 && by >= 8) || (by >= 11 && bx <= 4) ? 'rural' : (bx >= 9 && by <= 2) ? 'residential' : (by >= 5 && by <= 7 && bx >= 11) ? 'commercial' : 'industrial',
    put: { 'Substation': 'industrial', 'North Spur Pines': 'rural', 'Sandhill Sod Farm': 'rural', 'Big Rig Truck Stop': 'commercial', 'The Lunch Pail': 'commercial', 'Eastline Rail Yard': 'industrial', 'North Spur Yard': 'industrial' },
    near: { 'Eastline Rail Yard': 'Substation', 'North Spur Yard': 'Eastline Rail Yard', 'County Evidence Storage': 'Substation', "Rusty's Scrap & Salvage": 'Green Bin Recycling', 'Big Rig Truck Stop': 'Fuel Depot', 'The Lunch Pail': 'Big Rig Truck Stop' } },
  { // Justice Row: the courthouse square in the middle, law offices and bail bonds around it, homes at the edges
    zone: (bx, by) => { const d = cheb(bx, by, 6, 6); return d <= 2 ? 'civic' : d <= 4 ? 'commercial' : 'residential'; },
    put: { 'Veterans Memorial Park': 'residential', 'Freedom Bail Bonds': 'commercial', 'Courthouse Newsstand': 'civic' },
    near: { 'Justice Plaza': 'County Courthouse', 'Clerk of Court': 'County Courthouse', 'County Jail': 'County Courthouse', 'Sally Port': 'County Jail', 'Freedom Bail Bonds': 'County Jail', 'Public Defender': 'County Courthouse', "State Attorney's Office": 'County Courthouse', 'Barnes & Ruiz, Attorneys': 'Public Defender', 'Probation & Parole': 'County Jail' } }
];
const SIGNS = { shop: 'MARKET', cafe: 'CAFE', pizza: 'PIZZA', barber: 'BARBER', laundromat: 'LAUNDRY', nails: 'NAILS', books: 'BOOKS', pharmacy: 'Rx', clinic: 'CLINIC', diner: 'DINER', autoshop: 'AUTO', gym: 'GYM', office: 'OFFICE' };
const MIX = {
  downtown: [['strip', 26], ['tower', 18], ['apartments', 10], ['parking', 7], ['park', 7], ['plaza', 4], ['diner', 4], ['clinic', 4], ['bank', 3], ['garage', 3], ['library', 2], ['shop', 6], ['gym', 3], ['houses', 3]],
  commercial: [['strip', 24], ['houses', 16], ['apartments', 9], ['gas', 7], ['autoshop', 7], ['motel', 5], ['mall', 5], ['carwash', 4], ['shop', 7], ['park', 6], ['parking', 4], ['diner', 3], ['gym', 3]],
  residential: [['houses', 44], ['apartments', 13], ['park', 10], ['strip', 9], ['church', 4], ['school', 3], ['shop', 6], ['clinic', 3], ['pawn', 2], ['diner', 3], ['firestation', 1], ['marina', 2]],
  industrial: [['warehouse', 32], ['storage', 9], ['lot', 9], ['scrapyard', 7], ['lumber', 6], ['railyard', 5], ['parking', 6], ['autoshop', 7], ['truckstop', 4], ['diner', 4], ['houses', 6], ['gas', 5]],
  civic: [['tower', 18], ['strip', 18], ['parking', 11], ['apartments', 10], ['plaza', 7], ['park', 8], ['shop', 7], ['diner', 5], ['bonds', 4], ['houses', 8], ['clinic', 4]]
};
const STRIPMIX = { downtown: ['cafe', 'barber', 'books', 'pizza', 'nails', 'office', 'shop', 'laundromat'], commercial: ['laundromat', 'shop', 'pharmacy', 'nails', 'pizza', 'cafe', 'barber', 'gym'], residential: ['cafe', 'shop', 'barber', 'laundromat', 'pizza', 'pharmacy', 'books'], industrial: ['diner', 'shop', 'autoshop', 'cafe'], civic: ['office', 'cafe', 'shop', 'office', 'pizza', 'books'] };
function genEntry(zone, theme, R, used, bx, by) {
  const pick = (a) => a[Math.floor(R() * a.length)], mix = ZMIX[zone] || MIX[theme] || MIX.downtown, tot = mix.reduce((a, m) => a + m[1], 0);
  let t = R() * tot, kind = mix[0][0]; for (const m of mix) { t -= m[1]; if (t <= 0) { kind = m[0]; break; } }
  const uniq = (fn) => { let n = ''; for (let k = 0; k < 20 && (!n || used.has(n)); k++) n = fn(); used.add(n); return n; };
  const biz = (k) => { const n = uniq(() => pick(OWN) + '’s ' + pick(NOUN[k] || ['Shop'])); return [k, n, SIGNS[k] || n.split(' ').pop().toUpperCase().slice(0, 9)]; };
  if (kind === 'strip') { const pool = zone === 'waterfront' ? ['cafe', 'shop', 'pizza', 'bait'] : zone === 'core' ? STRIPMIX.downtown : STRIPMIX[theme] || STRIPMIX.downtown; return { strip: [0, 1, 2, 3].map(() => biz(pick(pool))) }; }
  if (NOUN[kind]) return biz(kind);
  const named = {
    houses: () => uniq(() => pick(TREE) + ' ' + pick(STREET)), farm: () => uniq(() => pick(OWN).replace(/^Big |^Mama /, '') + ' Family ' + pick(['Farm', 'Groves', 'Ranch', 'Nursery'])), woods: () => uniq(() => pick(TREE) + ' ' + pick(['Woods', 'Hammock', 'Preserve', 'Pines'])), apartments: () => uniq(() => pick(TREE) + ' ' + pick(['Apartments', 'Gardens', 'Towers', 'Commons', 'Village'])),
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

// each district's palette: Central steel and glass blues, Eastside brick and terracotta, Riverside painted pastels,
// the industrial park rust and oxide, Justice Row limestone
const PAL = {
  downtown: ['#7d9bb8', '#5f7f9e', '#9fb6cc', '#4e6b88', '#b8c7d6', '#6d8aa6'],
  commercial: ['#b5523b', '#9c4433', '#c8794d', '#d19a4c', '#a8553f', '#8a4a34'],
  residential: ['#f2e3a6', '#bfe3cf', '#f4c4b0', '#c8d9ef', '#e5d0ef', '#f7efd9'],
  industrial: ['#8a5a44', '#6f7d80', '#9a8f78', '#7a4b3a', '#5f6b6e', '#a28466'],
  civic: ['#ece5d3', '#e0d7c0', '#f2ecdd', '#d6ccb4', '#e8e1cf', '#cfc4aa']
};
// and its ground: sidewalks, plazas and grass tinted to match
const GROUND = {
  downtown: { walk: '#c1c5cc', plaza: '#d0d5dc', grass: '#4f8a52' },
  commercial: { walk: '#c9b39b', plaza: '#d6b394', grass: '#6a8f3c' },
  residential: { walk: '#cfc8b4', plaza: '#d9d0b4', grass: '#4c9a45' },
  industrial: { walk: '#a9a49b', plaza: '#b5ada0', grass: '#7d8a4e' },
  civic: { walk: '#d9d3c4', plaza: '#e4ddcc', grass: '#5d8f4a' }
};
// every building leans toward its district's palette (40%), so a street reads as Central, Eastside or Riverside at a glance
const hex2 = (c) => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const blend = (c, t, f) => { if (!/^#[0-9a-f]{6}$/i.test(c || '')) return c; const a = hex2(c), b = hex2(t); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * f).toString(16).padStart(2, '0')).join(''); };
function B(W, x, y, w, d, h, o) { const pal = PAL[W.D.theme]; if (o && o.color && pal && !o.keepColor) o = Object.assign({}, o, { color: blend(o.color, pal[(x * 31 + y * 17) % pal.length], .4) });
  W.buildings.push(Object.assign({ x, y, w, d, h, mat: W.D.theme }, o)); for (let yy = y; yy < y + d; yy++) for (let xx = x; xx < x + w; xx++) W.set(xx, yy, T.BLDG); }
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
    case 'farm': { // a farmhouse and barn by the road, crop rows behind, fence along the back
      const crop = pick(['#5f8f2f', '#7a9a2c', '#4f7f3a', '#8aa53a']);
      for (let y = y0; y <= y0 + 3; y++) for (let x = x0; x <= x1; x++) W.set(x, y, y % 2 ? T.SAND : T.GRASS);
      for (let y = y0; y <= y0 + 3; y++) if (y % 2 === 0) for (let x = x0; x <= x1; x++) if (R() < .85) P(W, 'bush', x + .5, y + .5, { s: .45 + R() * .2, c: crop });
      B(W, x0, y0 + 4, 3, 2, 30, { style: 'house', color: '#a0362b', roof: '#5b6470' }); B(W, x0 + 4, y0 + 4, 2, 2, 24, { style: 'house', color: pick(['#f1e3c6', '#e8d8b8', '#d4dbe6']), roof: '#7a5a3a' });
      for (let y = oy + 6; y <= oy + 8; y++) W.set(x0 + 6, y, T.GRAVEL); if (R() < .7) P(W, 'car', x0 + 6.5, oy + 6.5, { parked: true, color: pick(['#7a2e2e', '#2c3e50', '#556b2f', '#f2f2f2']), dir: 1, block: true });
      tree(x1, y1); break;
    }
    case 'woods': { // pines and oaks with a gravel trail through the middle
      for (let x = x0; x <= x1; x++) W.set(x, y0 + 3, T.GRAVEL); for (let y = y0 + 3; y <= y1; y++) W.set(x0 + 3, y, T.GRAVEL);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (W.at(x, y) === T.GRASS && R() < .55) tree(x, y, R() < .5 ? 'tree' : (W.river ? 'palm' : 'tree'));
      P(W, 'bench', x0 + 3.5, y0 + 3.5); break;
    }
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
const shade0 = (hex, f) => { let r, g, b; hex = String(hex); if (hex[0] === '#') { const h6 = hex.length === 4 ? hex.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3') : hex, n = parseInt(h6.slice(1, 7), 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; } else { const m = hex.match(/\d+(\.\d+)?/g) || [128, 128, 128]; r = +m[0]; g = +m[1]; b = +m[2]; } r = Math.max(0, Math.min(255, Math.round(r * f))); g = Math.max(0, Math.min(255, Math.round(g * f))); b = Math.max(0, Math.min(255, Math.round(b * f))); return 'rgb(' + r + ',' + g + ',' + b + ')'; };
const SHADEC = new Map();
// two-level cache (color, then factor): no key string is built per call, which matters when ground chunks are drawn (209 -> 45 ns a call)
let SHADEN = 0;
const shade = (hex, f) => { let m = SHADEC.get(hex); if (m === undefined) { if (SHADEN > 6000) { SHADEC.clear(); SHADEN = 0; } SHADEC.set(hex, m = new Map()); } let v = m.get(f); if (v === undefined) { v = shade0(hex, f); m.set(f, v); SHADEN++; } return v; };
export { shade };

// ground: drawn once per district into one large canvas
// the ground is drawn in chunks of CH x CH tiles, only around the camera, and cached
export const CH = 16;
// ground chunks are big canvases (about 8 MB each at full resolution); when the game drops an old chunk its canvas is
// kept and reused for the next chunk of the same size instead of allocating a new one
const GPOOL = [];
export function recycleGround(c) { if (c && c.canvas && GPOOL.length < 6 && GPOOL.indexOf(c.canvas) < 0) GPOOL.push(c.canvas); }
function groundCanvas(w, h, k) { const W2 = Math.ceil(w * k), H2 = Math.ceil(h * k), i = GPOOL.findIndex((c) => c.width === W2 && c.height === H2); if (i < 0) return hiCanvas(w, h, k);
  const c = GPOOL.splice(i, 1)[0], g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.clearRect(0, 0, c.width, c.height); g.scale(k, k); return [c, g]; }
export function drawGround(W, cx, cy) {
  const x0 = cx * CH, y0 = cy * CH, x1 = Math.min(N, x0 + CH) - 1, y1 = Math.min(N, y0 + CH) - 1, pad = 4;
  const w = (x1 - x0 + y1 - y0 + 2) * TW / 2 + pad * 2, h = (x1 - x0 + y1 - y0 + 2) * TH / 2 + pad * 2, [c, g] = groundCanvas(w, h, GRES);
  const ox = -(x0 - y1 - 1) * TW / 2 + pad, oy = -(x0 + y0) * TH / 2 + pad;
  let seed = 0; const R = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  // tile-space to canvas: (u, v) inside tile (x, y), 0..1 each
  const at = (x, y, u, v) => { const [sx, sy] = iso(x + u, y + v); return [ox + sx, oy + sy]; };
  const poly = (pts, f) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = f; g.fill(); };
  const seg = (a, b, col, wd) => { g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
  const tile = (x, y) => [at(x, y, 0, 0), at(x, y, 1, 0), at(x, y, 1, 1), at(x, y, 0, 1)];
  const band = (x, y, side, f, col) => { // a strip along one edge of the tile, f = depth (0..1)
    const q = side === 0 ? [[0, 0], [1, 0], [1, f], [0, f]] : side === 1 ? [[1, 0], [1, 1], [1 - f, 1], [1 - f, 0]] : side === 2 ? [[0, 1], [1, 1], [1, 1 - f], [0, 1 - f]] : [[0, 0], [0, 1], [f, 1], [f, 0]];
    poly(q.map(([u, v]) => at(x, y, u, v)), col);
  };
  const GD = GROUND[W.D.theme] || GROUND.downtown;
  const BASE = { [T.ROAD]: '#3a3f46', [T.WALK]: GD.walk, [T.GRASS]: GD.grass, [T.PLAZA]: GD.plaza, [T.LOT]: '#454a52', [T.WATER]: '#25618a', [T.BLDG]: '#55585c', [T.FENCE]: '#7f8a6e', [T.SAND]: '#dcc893', [T.GRAVEL]: '#8d877c', [T.RAIL]: '#7a7266' };
  const isW = (x, y) => W.at(x, y) === T.WATER;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    seed = (x * 73856093) ^ (y * 19349663) ^ (W.did * 83492791); R(); R();
    const v = W.at(x, y), base = BASE[v] || '#555', P4 = tile(x, y), [mx, my] = at(x, y, .5, .5);
    // base with a slight per-tile tone change, lit from the top corner
    const k = v === T.WALK || v === T.PLAZA ? .97 + R() * .06 : .985 + R() * .03, fc = shade(base, k);
    poly(P4, fc); g.strokeStyle = fc; g.lineWidth = .8; g.stroke(); // stroke hides hairline seams between tiles
    if (v === T.ROAD || v === T.LOT) {
      // aggregate speckle, tyre wear, the odd crack, patch or oil stain
      for (let i = 0; i < 16; i++) { const p = at(x, y, R(), R()); g.fillStyle = R() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.12)'; g.fillRect(p[0], p[1], 1.2, 1.2); }
      const rr = isRoadLine(y), rc = isRoadLine(x);
      if (v === T.ROAD && rr !== rc) { // lane wear: two darker wheel paths per lane
        [.3, .7].forEach((t0) => { const a = rr ? at(x, y, 0, t0) : at(x, y, t0, 0), b = rr ? at(x, y, 1, t0) : at(x, y, t0, 1); seg(a, b, 'rgba(0,0,0,.09)', 4); });
      }
      if (R() < .07) { g.strokeStyle = 'rgba(15,17,20,.55)'; g.lineWidth = .8; g.beginPath(); let p = at(x, y, .2 + R() * .3, .2 + R() * .3); g.moveTo(p[0], p[1]); for (let s2 = 0; s2 < 4; s2++) { p = [p[0] + (R() - .3) * 9, p[1] + (R() - .5) * 5]; g.lineTo(p[0], p[1]); } g.stroke(); }
      if (R() < .05) { const u = .1 + R() * .4, vv = .1 + R() * .4, s2 = .3 + R() * .2; poly([at(x, y, u, vv), at(x, y, u + s2, vv), at(x, y, u + s2, vv + s2), at(x, y, u, vv + s2)], 'rgba(20,22,26,.35)'); }
      if (v === T.LOT && R() < .3) { const p = at(x, y, .3 + R() * .4, .3 + R() * .4); g.fillStyle = 'rgba(10,10,12,.28)'; g.beginPath(); g.ellipse(p[0], p[1], 6 + R() * 5, 3 + R() * 2, 0, 0, Math.PI * 2); g.fill(); }
      if (v === T.LOT && (x + y) % 2 === 0) { seg(at(x, y, 0, .05), at(x, y, 0, .62), 'rgba(250,250,245,.75)', 1.4); seg(at(x, y, 0, .05), at(x, y, .12, .05), 'rgba(250,250,245,.6)', 1.4); }
      if (v === T.ROAD) {
        const nearX = (k2) => x % 11 === k2, nearY = (k2) => y % 11 === k2;
        // double yellow centre line between the two lanes, kept out of crosswalks and intersections
        if (rr && !rc && y % 11 === 0 && x % 11 >= 3 && x % 11 <= 9) { [-.05, .05].forEach((d) => seg(at(x, y, 0, 1 + d), at(x, y, 1, 1 + d), '#e2b93b', 1.3)); }
        if (rc && !rr && x % 11 === 0 && y % 11 >= 3 && y % 11 <= 9) { [-.05, .05].forEach((d) => seg(at(x, y, 1 + d, 0), at(x, y, 1 + d, 1), '#e2b93b', 1.3)); }
        // white edge lines along the curbs
        if (rr && !rc && x % 11 >= 3 && x % 11 <= 9) { if (y % 11 === 0) seg(at(x, y, 0, .1), at(x, y, 1, .1), 'rgba(240,240,236,.75)', 1.1); else seg(at(x, y, 0, .9), at(x, y, 1, .9), 'rgba(240,240,236,.75)', 1.1); }
        if (rc && !rr && y % 11 >= 3 && y % 11 <= 9) { if (x % 11 === 0) seg(at(x, y, .1, 0), at(x, y, .1, 1), 'rgba(240,240,236,.75)', 1.1); else seg(at(x, y, .9, 0), at(x, y, .9, 1), 'rgba(240,240,236,.75)', 1.1); }
        // zebra crosswalks and stop bars
        if (rr && !rc && (nearX(2) || nearX(10))) { for (let s2 = 0; s2 < 6; s2++) { const u = .12 + s2 * .14; poly([at(x, y, u, .04), at(x, y, u + .08, .04), at(x, y, u + .08, .96), at(x, y, u, .96)], 'rgba(244,244,240,.88)'); } }
        if (rc && !rr && (nearY(2) || nearY(10))) { for (let s2 = 0; s2 < 6; s2++) { const u = .12 + s2 * .14; poly([at(x, y, .04, u), at(x, y, .96, u), at(x, y, .96, u + .08), at(x, y, .04, u + .08)], 'rgba(244,244,240,.88)'); } }
        if (rr && !rc && nearX(3)) seg(at(x, y, .12, y % 11 === 0 ? .1 : .1), at(x, y, .12, .95), 'rgba(244,244,240,.8)', 2.4);
        if (rr && !rc && nearX(9)) seg(at(x, y, .88, .05), at(x, y, .88, .9), 'rgba(244,244,240,.8)', 2.4);
        if (rc && !rr && nearY(3)) seg(at(x, y, .1, .12), at(x, y, .95, .12), 'rgba(244,244,240,.8)', 2.4);
        if (rc && !rr && nearY(9)) seg(at(x, y, .05, .88), at(x, y, .9, .88), 'rgba(244,244,240,.8)', 2.4);
      }
    } else if (v === T.WALK) {
      // concrete slabs: two per tile, seams in the joints, a little staining
      seg(at(x, y, .5, 0), at(x, y, .5, 1), 'rgba(0,0,0,.10)', .9); seg(at(x, y, 0, .5), at(x, y, 1, .5), 'rgba(0,0,0,.10)', .9);
      seg(at(x, y, .51, 0), at(x, y, .51, 1), 'rgba(255,255,255,.18)', .6);
      for (let i = 0; i < 8; i++) { const p = at(x, y, R(), R()); g.fillStyle = R() < .5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.12)'; g.fillRect(p[0], p[1], 1.4, 1.4); }
      if (R() < .12) { const p = at(x, y, .2 + R() * .6, .2 + R() * .6); g.fillStyle = 'rgba(60,50,40,.10)'; g.beginPath(); g.ellipse(p[0], p[1], 5 + R() * 4, 2.5 + R() * 2, 0, 0, Math.PI * 2); g.fill(); }
    } else if (v === T.PLAZA) {
      // pavers in a running bond with mortar joints
      for (let r = 0; r < 4; r++) for (let q = 0; q < 2; q++) { const u0 = (q + (r % 2) * .5) / 2, a = Math.max(0, u0 - (r % 2 ? .5 : 0)), u1 = Math.min(1, u0 + .5); poly([at(x, y, u0 % 1, r / 4), at(x, y, Math.min(1, (u0 % 1) + .5), r / 4), at(x, y, Math.min(1, (u0 % 1) + .5), (r + 1) / 4), at(x, y, u0 % 1, (r + 1) / 4)], R() < .5 ? 'rgba(255,255,255,.05)' : 'rgba(120,90,60,.08)'); }
      for (let r = 1; r < 4; r++) seg(at(x, y, 0, r / 4), at(x, y, 1, r / 4), 'rgba(90,70,50,.22)', .7);
      for (let r = 0; r < 4; r++) { const u = r % 2 ? .25 : .5; seg(at(x, y, u, r / 4), at(x, y, u, (r + 1) / 4), 'rgba(90,70,50,.22)', .7); if (r % 2) seg(at(x, y, u + .5, r / 4), at(x, y, u + .5, (r + 1) / 4), 'rgba(90,70,50,.22)', .7); }
    } else if (v === T.GRASS) {
      // mottled lawn with blades, clover and the occasional flower
      for (let i = 0; i < 3; i++) { const p = at(x, y, R(), R()); g.fillStyle = R() < .5 ? 'rgba(30,60,20,.14)' : 'rgba(150,190,90,.12)'; g.beginPath(); g.ellipse(p[0], p[1], 6 + R() * 8, 3 + R() * 4, 0, 0, Math.PI * 2); g.fill(); }
      g.lineWidth = .8; for (let i = 0; i < 22; i++) { const p = at(x, y, R(), R()), l = 1.5 + R() * 2.2; g.strokeStyle = R() < .55 ? 'rgba(25,55,18,.5)' : 'rgba(170,215,110,.45)'; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] + (R() - .5) * 1.4, p[1] - l); g.stroke(); }
      if (R() < .14) { const p = at(x, y, .2 + R() * .6, .2 + R() * .6), fc = ['#fff8e1', '#ffd54f', '#f8bbd0', '#e1bee7'][Math.floor(R() * 4)]; for (let f = 0; f < 3; f++) { g.fillStyle = fc; g.beginPath(); g.arc(p[0] + (R() - .5) * 8, p[1] + (R() - .5) * 4, 1.1, 0, Math.PI * 2); g.fill(); } }
    } else if (v === T.WATER) {
      const gw = g.createRadialGradient(mx, my, 2, mx, my, 40); gw.addColorStop(0, 'rgba(255,255,255,.06)'); gw.addColorStop(1, 'rgba(0,20,40,.12)'); poly(P4, gw);
      g.strokeStyle = 'rgba(220,240,255,.22)'; g.lineWidth = .9; for (let i = 0; i < 3; i++) { const p = at(x, y, R(), R()); g.beginPath(); g.moveTo(p[0] - 6, p[1]); g.quadraticCurveTo(p[0], p[1] - 2.2, p[0] + 6, p[1]); g.stroke(); }
      [[x, y - 1, 0], [x + 1, y, 1], [x, y + 1, 2], [x - 1, y, 3]].forEach(([nx, ny, sd]) => { if (!isW(nx, ny) && W.at(nx, ny)) { band(x, y, sd, .18, 'rgba(200,235,250,.30)'); band(x, y, sd, .07, 'rgba(255,255,255,.35)'); } });
    } else if (v === T.SAND) {
      for (let i = 0; i < 26; i++) { const p = at(x, y, R(), R()); g.fillStyle = R() < .5 ? 'rgba(120,95,50,.18)' : 'rgba(255,250,230,.35)'; g.fillRect(p[0], p[1], 1, 1); }
      g.strokeStyle = 'rgba(150,120,70,.18)'; g.lineWidth = .8; for (let i = 0; i < 2; i++) { const a = at(x, y, .1, .2 + i * .4 + R() * .1), b = at(x, y, .9, .25 + i * .4 + R() * .1); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 3, b[0], b[1]); g.stroke(); }
    } else if (v === T.GRAVEL || v === T.RAIL) {
      for (let i = 0; i < 40; i++) { const p = at(x, y, R(), R()); g.fillStyle = ['rgba(60,55,50,.45)', 'rgba(200,195,185,.45)', 'rgba(120,112,100,.5)'][i % 3]; g.beginPath(); g.ellipse(p[0], p[1], 1.2 + R(), .8 + R() * .5, 0, 0, Math.PI * 2); g.fill(); }
      if (v === T.RAIL) {
        for (let k2 = 0; k2 < 4; k2++) { const u = .12 + k2 * .25; poly([at(x, y, u, .08), at(x, y, u + .1, .08), at(x, y, u + .1, .92), at(x, y, u, .92)], '#5a4130'); seg(at(x, y, u, .08), at(x, y, u, .92), 'rgba(255,255,255,.12)', .5); }
        [.3, .7].forEach((vv) => { seg(at(x, y, 0, vv), at(x, y, 1, vv), '#3d3f44', 2.2); seg(at(x, y, 0, vv - .02), at(x, y, 1, vv - .02), '#c9ccd1', .9); });
      }
    } else if (v === T.FENCE) {
      g.strokeStyle = 'rgba(210,214,220,.6)'; g.lineWidth = .6; for (let k2 = 0; k2 <= 6; k2++) { seg(at(x, y, k2 / 6, 0), at(x, y, 0, k2 / 6), 'rgba(210,214,220,.45)', .6); seg(at(x, y, k2 / 6, 1), at(x, y, 1, k2 / 6), 'rgba(210,214,220,.45)', .6); }
    }
    // contact shadow where the ground meets a building, and a soft edge where lawns meet paving
    if (v !== T.BLDG && v !== T.WATER) [[x, y - 1, 0], [x + 1, y, 1], [x, y + 1, 2], [x - 1, y, 3]].forEach(([nx, ny, sd]) => {
      const nv = W.at(nx, ny);
      if (nv === T.BLDG) { band(x, y, sd, .32, 'rgba(0,0,0,.10)'); band(x, y, sd, .16, 'rgba(0,0,0,.12)'); }
      else if (v === T.GRASS && (nv === T.WALK || nv === T.PLAZA || nv === T.ROAD)) band(x, y, sd, .08, 'rgba(20,40,10,.22)');
    });
  }
  // curbs: a lit curb top on the sidewalk side and a shadow where it drops to the road
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const v = W.at(x, y); if (v !== T.WALK && v !== T.PLAZA && v !== T.GRASS) continue;
    [[x, y - 1, 0], [x + 1, y, 1], [x, y + 1, 2], [x - 1, y, 3]].forEach(([nx, ny, sd]) => { const nv = W.at(nx, ny); if (nv !== T.ROAD && nv !== T.LOT) return;
      band(x, y, sd, .09, 'rgba(232,228,218,.95)'); band(x, y, sd, .025, 'rgba(255,255,255,.5)');
      const e = sd === 0 ? [at(x, y, 0, 0), at(x, y, 1, 0)] : sd === 1 ? [at(x, y, 1, 0), at(x, y, 1, 1)] : sd === 2 ? [at(x, y, 0, 1), at(x, y, 1, 1)] : [at(x, y, 0, 0), at(x, y, 0, 1)];
      seg([e[0][0], e[0][1] + 1.2], [e[1][0], e[1][1] + 1.2], 'rgba(0,0,0,.38)', 1.6); });
  }
  return { canvas: c, ox, oy };
}

// a building drawn once into its own canvas; night version lights some windows
// render scale for cached art (buildings, ground): 1 = standard, up to 3 for 4K
// RES: how many pixels a sprite has per world unit. It follows the on-screen scale (zoom x screen density), so cached
// sprites are stamped at 1:1 instead of being shrunk every frame, which is the expensive direction for a canvas.
// GRES is the ground's own resolution; the ground goes through a screen buffer, so it does not need to follow zoom.
export let RES = 1, GRES = 2; export function setRes(k) { RES = k; } export function setGroundRes(k) { GRES = k; }
// when RES changes, only a few sprites per frame are redrawn; the rest keep using their previous drawing until then
let MISS = 0; const LASTC = new Map(); export function frameStart() { MISS = 0; }
function reuse(base) { return MISS >= 6 ? LASTC.get(base) : null; }
function remember(base, c) { MISS++; if (LASTC.size > 4000) LASTC.clear(); LASTC.set(base, c); }
let SUNLEN = 0; export function setSun(len) { SUNLEN = len || 0; }
function castShadow(g, sx, sy, w, k) { if (!SUNLEN) return; const L = SUNLEN * k; g.save(); g.translate(sx + L * .42, sy + L * .21); g.rotate(.46); g.fillStyle = 'rgba(10,16,30,.20)'; g.beginPath(); g.ellipse(0, 0, L * .5 + w * .4, w * .45, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
export function hiCanvas(w, h, k) { k = k || 1; const c = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(1, 1); c.width = Math.ceil(w * k); c.height = Math.ceil(h * k); c.lw = c.width / k; c.lh = c.height / k; const g = c.getContext('2d'); g.scale(k, k); return [c, g]; }
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
      if (opts.deco) opts.deco(pa, pb, v0, v1, lit, r);
    }
    return len;
  };
  const st = b.style;
  const winLit = [];
  const qa = (pa, pb, f) => [pa[0] + (pb[0] - pa[0]) * f, pa[1] + (pb[1] - pa[1]) * f];
  // each district's signature material on its ordinary buildings: Eastside brick, Justice Row stone, Riverside painted
  // siding, rust streaks in the industrial park, a sky sheen on Central's glass
  const plain = !/^(glass|house|corrugated|bays|garage|stadium|storage|brick|stone|motel|jail)$/.test(st || '');
  const mortar = st === 'brick' || st === 'stone' || st === 'motel' || st === 'jail' ? st : plain && b.mat === 'commercial' ? 'brick' : plain && b.mat === 'civic' ? 'stone' : null;
  if (plain && b.mat === 'residential') { g.lineWidth = .5; [[Dp, C], [C, Bp]].forEach(([P0, P1]) => { for (let y = 2.4; y < h - 3; y += 2.4) { const a1 = tx(up(P0, y)), b1 = tx(up(P1, y)); g.strokeStyle = 'rgba(0,0,0,.09)'; g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(a1[0], a1[1] - .6); g.lineTo(b1[0], b1[1] - .6); g.stroke(); } }); }
  if (b.mat === 'industrial' && st !== 'glass' && st !== 'house') { [[Dp, C, b.w], [C, Bp, b.d]].forEach(([P0, P1, n]) => { for (let k = 0; k < Math.max(2, n); k++) { const t = (k + .3 + R() * .4) / Math.max(2, n), p = qa(P0, P1, t), q0 = tx(up(p, h - 2)), q1 = tx(up(p, h * (.35 + R() * .3))), gr = g.createLinearGradient(0, q0[1], 0, q1[1]); gr.addColorStop(0, 'rgba(120,52,24,.32)'); gr.addColorStop(1, 'rgba(120,52,24,0)'); g.fillStyle = gr; g.fillRect(q0[0] - 1.6, q0[1], 3.2 + R() * 2, q1[1] - q0[1]); } }); }
  if (b.mat === 'downtown' && st === 'glass' && !night) { const a0 = tx(up(Dp, h)), c0 = tx(C), gr = g.createLinearGradient(a0[0], a0[1], c0[0], c0[1]); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.45, 'rgba(220,240,255,.16)'); gr.addColorStop(.55, 'rgba(255,255,255,0)'); poly([Dp, C, up(C, h), up(Dp, h)], gr); }
  // brick and stone: mortar courses with staggered joints
  if (mortar) {
    const step = mortar === 'stone' ? 6 : 3.2, jw = mortar === 'stone' ? 12 : 6;
    [[Dp, C, b.w], [C, Bp, b.d]].forEach(([P0, P1, n]) => { const len = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), cnt = Math.floor(len / jw);
      g.strokeStyle = mortar === 'stone' ? 'rgba(0,0,0,.08)' : 'rgba(255,240,225,.10)'; g.lineWidth = .5;
      for (let y = step; y < h - 3; y += step) { const a1 = tx(up(P0, y)), b1 = tx(up(P1, y)); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); g.stroke();
        const off = (Math.round(y / step) % 2) * .5; for (let k = 0; k < cnt; k++) { const p0 = tx(up(qa(P0, P1, (k + off) / cnt), y)); g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p0[0], p0[1] - step); g.stroke(); } } });
  }
  // plinth: a darker base course for solid buildings
  if (st !== 'house' && st !== 'storage' && st !== 'stadium' && st !== 'shop' && st !== 'diner') { poly([Dp, C, up(C, 4), up(Dp, 4)], shade(base, .6)); poly([C, Bp, up(Bp, 4), up(C, 4)], shade(base, .5)); }
  const deco = (pa, pb, v0, v1, lit, r) => {
    const wv = v1 - v0;
    if (!lit && wv > 8 && R() < .3) { g.strokeStyle = night ? 'rgba(255,255,255,.05)' : 'rgba(235,240,245,.45)'; g.lineWidth = .6; for (let k = 1; k <= 3; k++) { const y = v1 - k * 1.6, a1 = tx(up(pa, y)), b1 = tx(up(pb, y)); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); g.stroke(); } }
    if (lit && R() < .35) { const cc = ['rgba(200,60,60,.35)', 'rgba(60,110,200,.3)', 'rgba(240,240,220,.35)'][Math.floor(R() * 3)]; poly([up(pa, v0), up(qa(pa, pb, .22), v0), up(qa(pa, pb, .22), v1), up(pa, v1)], cc); poly([up(qa(pa, pb, .78), v0), up(pb, v0), up(pb, v1), up(qa(pa, pb, .78), v1)], cc); }
    if (st === 'apartments' && r > 0) {
      if (R() < .22) { const m0 = qa(pa, pb, .3), m1 = qa(pa, pb, .7); poly([up(m0, v0 - 5), up(m1, v0 - 5), up(m1, v0 - 1.5), up(m0, v0 - 1.5)], '#cfd3d8'); poly([up(m0, v0 - 1.5), up(m1, v0 - 1.5), [m1[0] + 1.5, m1[1] - v0 + 2.2], [m0[0] + 1.5, m0[1] - v0 + 2.2]], '#e5e8eb'); }
      else if (R() < .35) { const e0 = [pa[0] - 2, pa[1] + 1], e1 = [pb[0] + 2, pb[1] + 1]; poly([up(e0, v0 - 2), up(e1, v0 - 2), [e1[0] + 4, e1[1] + 2 - v0 + 2], [e0[0] + 4, e0[1] + 2 - v0 + 2]], shade(base, .9)); g.strokeStyle = 'rgba(30,34,40,.7)'; g.lineWidth = .6; const r0 = tx([e0[0] + 4, e0[1] + 2 - v0 + 2 - 5]), r1 = tx([e1[0] + 4, e1[1] + 2 - v0 + 2 - 5]); g.beginPath(); g.moveTo(r0[0], r0[1]); g.lineTo(r1[0], r1[1]); g.stroke(); for (let k = 0; k <= 4; k++) { const q = qa([e0[0] + 4, e0[1] + 2 - v0 + 2], [e1[0] + 4, e1[1] + 2 - v0 + 2], k / 4), a1 = tx(q); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a1[0], a1[1] - 5); g.stroke(); } }
    }
  };
  const onLit = (pa, pb, v0) => { if (winLit.length < 6) winLit.push([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2 - v0 - 6]); };
  if (st === 'glass') {
    const rows = Math.floor((h - 10) / 14);
    face(Dp, C, 1.0, b.w * 3, rows, { base: 8, step: 14, wh: 10, glass: shade('#5b7aa0', .9), lit: .4, onLit, deco });
    face(C, Bp, .8, b.d * 3, rows, { base: 8, step: 14, wh: 10, glass: shade('#4a6788', .9), lit: .4, onLit, deco });
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
    face(Dp, C, 1, b.w * 2, rows, { base: st === 'shop' || st === 'diner' ? 4 : 10, step: 18, wh: st === 'shop' || st === 'diner' ? 16 : 11, lit: st === 'apartments' ? .5 : .35, onLit, deco, glass: st === 'shop' || st === 'diner' ? shade('#a9c7dd', .85) : null });
    face(C, Bp, .8, b.d * 2, rows, { base: 10, step: 18, wh: 11, lit: .3, onLit, deco });
    if (st === 'shop' || st === 'diner') { poly([Dp, C, up(C, 4), up(Dp, 4)], shade(base, .45)); g.strokeStyle = 'rgba(30,34,40,.75)'; g.lineWidth = 1; const n = b.w * 4; for (let k = 0; k <= n; k++) { const p0 = qa(Dp, C, k / n), a1 = tx(up(p0, 4)), b1 = tx(up(p0, 20)); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); g.stroke(); } const a1 = tx(up(Dp, 20.5)), b1 = tx(up(C, 20.5)); g.lineWidth = 1.6; g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]); g.stroke(); }
    if (st === 'apartments') { g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; for (let r = 1; r < rows; r++) { const a = tx(up(Dp, r * 18 + 2)), bb = tx(up(C, r * 18 + 2)); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(bb[0], bb[1]); g.stroke(); } }
    if (b.columns) { for (let k = 0; k <= b.w * 2; k++) { const t = k / (b.w * 2), p = [Dp[0] + (C[0] - Dp[0]) * t, Dp[1] + (C[1] - Dp[1]) * t]; poly([[p[0] - 2, p[1] - 1], [p[0] + 2, p[1] + 1], up([p[0] + 2, p[1] + 1], h * .62), up([p[0] - 2, p[1] - 1], h * .62)], '#f6f2ea'); } poly([up(Dp, h * .62), up(C, h * .62), up(C, h * .7), up(Dp, h * .7)], shade(base, .95)); }
  }
  if (b.awning) { const aw = 7; poly([up(Dp, 18), up(C, 18), [C[0] + 8, C[1] + 4 - 18 + aw], [Dp[0] + 8, Dp[1] + 4 - 18 + aw]], b.awning); g.globalAlpha = .25; for (let k = 0; k < b.w * 3; k += 2) { const t0 = k / (b.w * 3), t1 = (k + 1) / (b.w * 3), pa = [Dp[0] + (C[0] - Dp[0]) * t0, Dp[1] + (C[1] - Dp[1]) * t0], pb = [Dp[0] + (C[0] - Dp[0]) * t1, Dp[1] + (C[1] - Dp[1]) * t1]; poly([up(pa, 18), up(pb, 18), [pb[0] + 8, pb[1] - 7], [pa[0] + 8, pa[1] - 7]], '#ffffff'); } g.globalAlpha = 1; }
  if (st !== 'house' && st !== 'stadium' && st !== 'storage' && st !== 'corrugated' && st !== 'bays' && st !== 'garage') { // cornice with a shadow under it
    const o2 = 1.6; poly([up(Dp, h - 3.5), up(C, h - 3.5), [C[0] + o2, C[1] + o2 * .5 - h + 3.5], [Dp[0] + o2, Dp[1] + o2 * .5 - h + 3.5]], 'rgba(0,0,0,.18)');
    poly([up(Dp, h - 3), up(C, h - 3), up(C, h), up(Dp, h)], shade(base, 1.15)); poly([up(C, h - 3), up(Bp, h - 3), up(Bp, h), up(C, h)], shade(base, .9)); }
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
    if (R() < .4) { g.save(); poly([up(Dp, h), up(C, h), up(m2, h + rh), up(m1, h + rh)]); g.clip(); for (let k = 0; k < 3; k++) { const f0 = .15 + k * .22, a0 = qa(Dp, C, f0), a1 = qa(Dp, C, f0 + .18), lift = (z) => [z[0] + (m1[0] - Dp[0]) * .3, z[1] + (m1[1] - Dp[1]) * .3 - h - rh * .3]; const lift2 = (z) => [z[0] + (m1[0] - Dp[0]) * .75, z[1] + (m1[1] - Dp[1]) * .75 - h - rh * .75]; g.beginPath(); [lift(a0), lift(a1), lift2(a1), lift2(a0)].forEach((q, i) => { const t2 = tx(q); i ? g.lineTo(t2[0], t2[1]) : g.moveTo(t2[0], t2[1]); }); g.closePath(); g.fillStyle = '#1e3a5f'; g.fill(); g.strokeStyle = 'rgba(180,210,240,.5)'; g.lineWidth = .5; g.stroke(); } g.restore(); }
    { const p0 = qa(Dp, C, .55), p1 = qa(Dp, C, .82), o3 = 6; poly([p0, p1, [p1[0] + o3, p1[1] + o3 * .5], [p0[0] + o3, p0[1] + o3 * .5]], '#cdbfa8'); [p0, p1].forEach((q) => { const a1 = tx([q[0] + o3 - .5, q[1] + o3 * .5]); g.fillStyle = '#f2efe8'; g.fillRect(a1[0] - .8, a1[1] - 14, 1.6, 14); }); poly([up(p0, 14), up(p1, 14), [p1[0] + o3, p1[1] + o3 * .5 - 14], [p0[0] + o3, p0[1] + o3 * .5 - 14]], shade(b.roof || '#7a5a3a', .9)); }
    { const d0 = [Dp[0] + (C[0] - Dp[0]) * .62, Dp[1] + (C[1] - Dp[1]) * .62], d1 = [Dp[0] + (C[0] - Dp[0]) * .74, Dp[1] + (C[1] - Dp[1]) * .74]; poly([d0, d1, up(d1, 14), up(d0, 14)], '#5b3a22'); poly([up(d0, 14), up(d1, 14), up(d1, 15.5), up(d0, 15.5)], '#f2efe8'); if (night) { const q = up([(d0[0] + d1[0]) / 2, (d0[1] + d1[1]) / 2], 18); winLit.push([q[0], q[1]]); } }
  } else {
    { const r0 = tx(up(A, h)), r1 = tx(up(C, h)), rg = g.createLinearGradient(r0[0], r0[1], r1[0], r1[1]); rg.addColorStop(0, shade(st === 'stadium' ? '#3f8a3a' : top, 1.08)); rg.addColorStop(1, shade(st === 'stadium' ? '#3f8a3a' : top, .9)); poly([up(A, h), up(Bp, h), up(C, h), up(Dp, h)], rg); }
    if (st !== 'stadium') { g.save(); poly([up(A, h), up(Bp, h), up(C, h), up(Dp, h)]); g.clip(); const n = Math.min(260, b.w * b.d * 10); for (let k = 0; k < n; k++) { const q = tx(up(iso(b.x + R() * b.w, b.y + R() * b.d), h)); g.fillStyle = R() < .5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.07)'; g.fillRect(q[0], q[1], 1.2, 1.2); } g.restore();
      poly([up(A, h), up(Bp, h), up(Bp, h + 3), up(A, h + 3)], shade(base, .9)); poly([up(A, h), up(Dp, h), up(Dp, h + 3), up(A, h + 3)], shade(base, .8)); poly([up(Dp, h), up(C, h), up(C, h + 3), up(Dp, h + 3)], shade(base, 1.0)); poly([up(C, h), up(Bp, h), up(Bp, h + 3), up(C, h + 3)], shade(base, .82)); }
    if (st === 'stadium') { g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.5; const m = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2 - h]; const q = tx(m); g.beginPath(); g.ellipse(q[0], q[1], 18, 9, 0, 0, Math.PI * 2); g.stroke(); poly([up([A[0], A[1] + 6], h + 1), up([Bp[0] - 12, Bp[1]], h + 1), up([C[0], C[1] - 6], h + 1), up([Dp[0] + 12, Dp[1]], h + 1)], null); }
    // parapet
    g.strokeStyle = shade(base, 1.25); g.lineWidth = 2; poly([up(A, h), up(Bp, h), up(C, h), up(Dp, h)]); g.stroke();
    // roof units
    if (st !== 'stadium' && st !== 'storage') {
      for (let k = 0; k < Math.min(3, b.w); k++) { const cx = b.x + 1 + R() * (b.w - 1.5), cy = b.y + .5 + R() * (b.d - 1.2); mini(g, tx, cx, cy, .5, .4, 7, h, '#c7ccd2'); const q = tx(up(iso(cx + .25, cy + .2), h + 7)); g.fillStyle = '#5b636d'; g.beginPath(); g.ellipse(q[0], q[1], 5, 2.5, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#8b939d'; g.lineWidth = .7; g.beginPath(); g.moveTo(q[0] - 4, q[1]); g.lineTo(q[0] + 4, q[1]); g.moveTo(q[0], q[1] - 2); g.lineTo(q[0], q[1] + 2); g.stroke(); }
      for (let k = 0; k < 2; k++) { const q = tx(up(iso(b.x + .4 + R() * (b.w - .8), b.y + .4 + R() * (b.d - .8)), h)); g.fillStyle = '#9aa1a9'; g.fillRect(q[0] - 1, q[1] - 6, 2.2, 6); g.fillStyle = '#6b7280'; g.beginPath(); g.ellipse(q[0] + .1, q[1] - 6, 1.6, .8, 0, 0, Math.PI * 2); g.fill(); }
      if (b.w >= 3) mini(g, tx, b.x + .3, b.y + .3, .8, .7, 9, h, shade(base, .95));
      if ((st === 'apartments' || (st === 'brick' && h > 60)) && b.w >= 4) { const q = tx(up(iso(b.x + b.w - 1.2, b.y + 1.1), h)); g.strokeStyle = '#4b3a2a'; g.lineWidth = 1.2; [-5, 5].forEach((d) => { g.beginPath(); g.moveTo(q[0] + d, q[1]); g.lineTo(q[0] + d * .8, q[1] - 10); g.stroke(); }); const tg = g.createLinearGradient(q[0] - 7, 0, q[0] + 7, 0); tg.addColorStop(0, '#8a6a4a'); tg.addColorStop(1, '#5a4330'); g.fillStyle = tg; g.fillRect(q[0] - 7, q[1] - 24, 14, 14); g.beginPath(); g.ellipse(q[0], q[1] - 10, 7, 2.5, 0, 0, Math.PI); g.fill(); g.fillStyle = '#6b5038'; g.beginPath(); g.moveTo(q[0] - 7.5, q[1] - 24); g.lineTo(q[0], q[1] - 31); g.lineTo(q[0] + 7.5, q[1] - 24); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .6; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(q[0] - 7, q[1] - 24 + k * 3.5); g.lineTo(q[0] + 7, q[1] - 24 + k * 3.5); g.stroke(); } }
      if (st === 'glass' && h > 120) { const q = tx(up(iso(b.x + b.w / 2, b.y + b.d / 2), h)); g.strokeStyle = '#c7ccd1'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0], q[1] - 26); g.stroke(); g.fillStyle = '#ff3b3b'; g.beginPath(); g.arc(q[0], q[1] - 26, 1.6, 0, Math.PI * 2); g.fill(); if (night) winLit.push([q[0] + minX, q[1] - 26 + minY]); }
    }
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
    g.font = '800 ' + (b.sign.length > 6 ? 10 : 12) + 'px "Meridian",system-ui,sans-serif'; const tw = g.measureText(b.sign).width + 10;
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

// props are drawn once into a small cached sprite per look (trees sway by sliding the sprite); animated ones still draw live
const PROPC = new Map(), PROP_STATIC = new Set(['hydrant', 'bin', 'bush', 'flowers', 'stall', 'cone', 'bench', 'pump', 'canopy', 'crate', 'scrap', 'hoop', 'lumberstack', 'lamp']);
export function drawPropFast(g, p, sx, sy, t, night) {
  let key = null, ox = 0, q = p;
  if (p.t === 'tree' || p.t === 'palm') { const v = Math.floor(p.x * 7 + p.y * 13) & 3; key = p.t + '|' + v + '|' + (p.s || 1); ox = p.t === 'tree' ? Math.sin(t / 1100 + p.x * 3) * 1.2 : Math.sin(t / 900 + p.x) * .8; q = null; }
  else if (PROP_STATIC.has(p.t)) { key = p.t; if (p._pk == null) { let pk = ''; for (const k in p) if (k !== 'x' && k !== 'y' && k !== 't' && k !== 'on' && k[0] !== '_') pk += '|' + k + '=' + p[k]; p._pk = pk; } key += p._pk + (p.on ? '|on' : ''); }
  if (!key) return drawProp(g, p, sx, sy, t, night);
  key += '|' + (night ? 1 : 0); const base = 'p' + key; key += '|' + RES; let c = PROPC.get(key) || reuse(base);
  if (!c) { if (PROPC.size > 500) PROPC.clear(); const [cv, cg] = hiCanvas(120, 150, RES); if (!q) { q = {}; for (const k in p) if (k[0] !== '_') q[k] = p[k]; q.x = 0; q.y = Math.floor(p.x * 7 + p.y * 13) & 3; } drawProp(cg, q, 60, 130, 0, night); c = cv; PROPC.set(key, c); remember(base, c); }
  g.drawImage(c, sx - 60 + ox, sy - 130, c.lw, c.lh);
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

// people: civilians, or cadets in a unit kit (o.kit from data.js UNITS). Shaded, outlined, with faces, hair styles,
// body types, outfits (tee, jacket, hoodie, dress, tank top, button-up) and accessories for civilians.
const JACKETS = ['#2f3b4c', '#5a3e2b', '#3b5249', '#7a2e2e', '#1f2937', '#4b4f8a', '#6b5b3e'];
// a crowd-friendly person: each pose is drawn once into a small canvas and reused (8 walk frames per look and facing),
// so sixty cadets on screen cost sixty image copies instead of sixty full drawings
const PCACHE = new Map(), TAU = Math.PI * 2; let SHSPR = null;
let PHIT = 0; const PCAP = navigator.deviceMemory && navigator.deviceMemory < 4 ? 700 : 1200;
export function personFast(g, sx, sy, o, t, key, lod) {
  const s = o.s || 1, mv = !!o.moving, cyc = mv ? (o.stride != null ? o.stride * 6.4 : t / 95) + (o.ph || 0) : 0, fr0 = mv ? Math.floor((((cyc % TAU) + TAU) % TAU) / TAU * 8) : 0, fr = lod ? fr0 & 6 : fr0;
  // in a crowd, people facing left are the right-facing sprite mirrored, and sprites are a little softer: half the sprites, half the memory
  let flip = lod && (o.face || 1) < 0, sr = lod ? Math.min(RES, 1.5) : RES, k = key + '|' + fr + '|' + (flip ? 1 : o.face || 1) + '|' + (mv && o.back ? 1 : 0) + '|' + (mv ? 1 : 0) + '|' + s, base = 'h' + k; k += '|' + sr;
  let c = PCACHE.get(k);
  // least-recently-used eviction: a crowd never empties the whole cache at once
  if (c) { if (++PHIT % 8 === 0) { PCACHE.delete(k); PCACHE.set(k, c); } }
  if (!c) c = reuse(base);
  if (!c) { if (PCACHE.size > PCAP) { let n = 120; for (const kk of PCACHE.keys()) { PCACHE.delete(kk); if (--n <= 0) break; } } const [cv, cg] = hiCanvas(56, 84, sr); person(cg, 28, 74, Object.assign({}, o, { face: flip ? 1 : o.face, noShadow: true, glance: false, stride: mv ? ((fr + .5) / 8 * TAU - (o.ph || 0)) / 6.4 : null, moving: mv }), 0); c = cv; PCACHE.set(k, c); remember(base, c); }
  castShadow(g, sx, sy, 9 * s, .9 * s);
  if (!SHSPR) { const [cv, cg] = hiCanvas(24, 12, 2), gr = cg.createRadialGradient(12, 6, 0, 12, 6, 9); gr.addColorStop(0, 'rgba(0,0,0,.38)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); cg.fillStyle = gr; cg.beginPath(); cg.ellipse(12, 6, 9, 4, 0, 0, TAU); cg.fill(); SHSPR = cv; }
  g.drawImage(SHSPR, sx + 1 - 12 * s, sy - 6 * s, 24 * s, 12 * s);
  if (flip) { g.save(); g.translate(sx, 0); g.scale(-1, 1); g.drawImage(c, -28, sy - 74, c.lw, c.lh); g.restore(); } else g.drawImage(c, sx - 28, sy - 74, c.lw, c.lh);
}
export function person(g, sx, sy, o, t) {
  // age, build and facial hair: a teenager is a little shorter, older people stoop a little and go gray, the oldest use a cane
  const AG = o.age, elder = AG === 'elder', senior = AG === 'senior' || elder;
  const s = o.s || (AG === 'teen' ? .94 : 1), ph = o.ph || 0, mv = !!o.moving, cyc = (o.stride != null ? o.stride * 6.4 : t / 95) + ph, walk = mv ? Math.sin(cyc) : 0;
  const bob = mv ? (1 - Math.abs(Math.cos(cyc))) * 1.2 : Math.sin(t / 1100 + ph) * .3, back = !!o.back && mv;
  // idle: shift weight and glance around now and then
  const glance = !mv && o.glance !== false && Math.sin(t / 2300 + ph * 3.1) > .9 ? -1 : 1, face = (o.face || 1) * glance, lean = mv ? .5 * (o.face || 1) : Math.sin(t / 1700 + ph) * .25;
  const K = o.kit || (o.officer ? { shirt: '#22355e', pants: '#1b2a4a', hat: 'cap', hatCol: '#16213d', patch: '#f5b800' } : null);
  const rr = (k) => { const v = Math.sin((ph + 1.37) * (12.9898 + k * 7.233)) * 43758.5453; return v - Math.floor(v); };
  const civ = !K, bw = o.build === 'heavy' ? 1.18 : o.build === 'slim' ? .88 : civ ? .9 + rr(1) * .26 : 1, top = civ ? (o.top || ['tee', 'tee', 'jacket', 'hoodie', 'dress', 'tank', 'button', 'tee'][Math.floor(rr(2) * 8)]) : 'uniform';
  const acc = civ ? (o.acc || ['none', 'none', 'backpack', 'bag', 'phone', 'coffee', 'shopping', 'shades', 'none'][Math.floor(rr(3) * 9)]) : 'none';
  const pants = K ? K.pants : o.pants || '#3b4a5c', shirt = K ? K.shirt : o.shirt || '#c0392b', skin = o.skin || '#e0b48f', hair = senior && !o.hair ? (elder ? '#eef0f3' : '#c4c9d1') : civ && (o.old != null ? o.old : rr(13) < .13) && !o.kid ? ['#d1d5db', '#e5e7eb', '#9ca3af'][Math.floor(rr(14) * 3)] : o.hair || '#2b1d14', jacket = JACKETS[Math.floor(rr(4) * JACKETS.length)];
  const hs = o.hs != null ? o.hs : Math.floor(rr(5) * 9), old = civ && !o.kid && (o.old != null ? o.old : rr(13) < .13);
  const outer = top === 'jacket' ? jacket : top === 'hoodie' ? shade(shirt, .85) : shirt, sleeve = top === 'tank' ? 0 : top === 'tee' || top === 'dress' ? .45 : 1;
  const OL = 'rgba(12,16,26,.55)', lw = .7 * s, Y = sy - bob * s, W2 = (x) => x * bw, sx0 = sx;
  const RR = (x, y, w, h, r, fill, stroke) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); } };
  if (!o.noShadow) { castShadow(g, sx, sy, 9 * s * bw, .9 * s);
  // contact shadow
  const sh = g.createRadialGradient(sx + 1, sy, 0, sx + 1, sy, 9 * s); sh.addColorStop(0, 'rgba(0,0,0,.38)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.beginPath(); g.ellipse(sx + 1, sy, 9 * s * bw, 4 * s, 0, 0, Math.PI * 2); g.fill(); }
  if (K && K.camelbak) RR(sx + (face > 0 ? -8.5 : 2.5) * s, Y - 25 * s, 6 * s, 12 * s, 2 * s, '#1f2937', true);
  if (acc === 'backpack') RR(sx + (face > 0 ? -W2(9.4) : W2(3.6)) * s, Y - 24.5 * s, 6 * s, 11 * s, 2.2 * s, shade(jacket, 1.2), true);
  if (top === 'hoodie') { g.fillStyle = shade(outer, .8); g.beginPath(); g.ellipse(sx - face * 1.2 * s, Y - 26.5 * s, 5.4 * s, 3.4 * s, 0, 0, Math.PI * 2); g.fill(); }
  // legs: back leg first, a step forward and back when walking
  const shoe = K ? (K.boots || '#0b0b0b') : o.shoes || ['#16181d', '#f2f2f2', '#5d4037', '#16181d', '#b91c1c'][Math.floor(rr(6) * 5)];
  const bare = (K && K.shorts) || top === 'dress' || (civ && rr(7) < .12);
  const leg = (x, sw, back) => {
    const lift = mv ? Math.max(0, Math.cos(cyc + (back ? Math.PI : 0)) * (x < 0 ? 1 : -1)) * 1.6 * s : 0, lx = sx + x * s * bw + sw * 1.8 * s * face, tp = Y - 12 * s, len = 11 * s - Math.max(0, -sw) * .6 * s - lift;
    if (bare) { RR(lx, tp + 3 * s, 3.3 * s, len - 3 * s, 1.2 * s, back ? shade(skin, .85) : skin, true); if (K && K.socks) { g.fillStyle = K.socks; g.fillRect(lx, tp + len - 2.6 * s, 3.3 * s, 1.5 * s); } }
    else RR(lx, tp, 3.6 * s, len, 1.4 * s, back ? shade(pants, .78) : pants, true);
    RR(lx - (face < 0 ? 1.4 * s : 0), tp + len - 1.2 * s, 4.8 * s, 2.4 * s, 1.1 * s, back ? shade(shoe, .8) : shoe, true);
    if (K && K.boots && !back) { g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(lx + 1 * s, tp + len - .8 * s, 1.2 * s, .6 * s); }
  };
  leg(-3.9, -walk, true); leg(.4, walk, false);
  if (top === 'dress') { g.beginPath(); g.moveTo(sx - W2(5) * s, Y - 13 * s); g.lineTo(sx + W2(5) * s, Y - 13 * s); g.lineTo(sx + W2(6.6) * s, Y - 6 * s); g.lineTo(sx - W2(6.6) * s, Y - 6 * s); g.closePath(); g.fillStyle = shade(shirt, .92); g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); }
  else if ((K && K.shorts) || (civ && bare)) RR(sx - W2(4.6) * s, Y - 13 * s, W2(9.2) * s, 5.2 * s, 1.5 * s, pants, true);
  // arms with sleeves of the right length
  const arm = (side, sw, back, pose) => {
    const ax = sx + side * W2(6.2) * s, ay = Y - 23 * s, ang = pose === 'phone' ? -2.5 * side * -1 * face * 0 - 2.6 : pose === 'wave' ? (side > 0 ? -2.55 : 2.55) + Math.sin(t / 110) * .32 : sw * .45 * face;
    g.save(); g.translate(ax, ay); g.rotate(pose === 'phone' ? (side > 0 ? -2.75 : 2.75) : ang); if (pose === 'phone') g.scale(1, .52);
    RR(-1.4 * s, 0, 2.8 * s, 9.5 * s, 1.3 * s, back ? shade(skin, .85) : skin, true);
    if (sleeve > 0) RR(-1.5 * s, 0, 3 * s, 9.5 * s * sleeve + .5 * s, 1.3 * s, back ? shade(outer, .7) : shade(outer, .9), true);
    g.beginPath(); g.arc(0, 10.4 * s, 1.5 * s, 0, Math.PI * 2); g.fillStyle = back ? shade(skin, .85) : skin; g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke();
    if (!back && pose === 'coffee') { RR(-1.6 * s, 10 * s, 3.2 * s, 3.8 * s, .6 * s, '#f5f0e6', true); g.fillStyle = '#7a4b2a'; g.fillRect(-1.6 * s, 11.3 * s, 3.2 * s, 1 * s); }
    if (!back && pose === 'shopping') { g.strokeStyle = '#ddd'; g.lineWidth = .6 * s; g.beginPath(); g.arc(0, 11.6 * s, 1.4 * s, Math.PI, 0); g.stroke(); RR(-2.6 * s, 11.6 * s, 5.2 * s, 5.4 * s, .8 * s, ['#f5f5f5', '#c0392b', '#2980b9', '#f5b800'][Math.floor(rr(8) * 4)], true); }
    if (!back && pose === 'phone') { RR(-1 * s, 9 * s, 2 * s, 3.4 * s, .5 * s, '#111', false); }
    g.restore();
  };
  const pose = o.wave && !mv ? 'wave' : acc === 'coffee' ? 'coffee' : acc === 'shopping' ? 'shopping' : acc === 'phone' && !mv ? 'phone' : null;
  g.save(); g.translate(lean * s, 0);
  if (back) arm(face, -walk, true, null); else arm(-face, walk, true, null);
  // torso: shoulders wider than the waist, lit from the upper left
  const tg = g.createLinearGradient(sx - 6 * s, 0, sx + 6 * s, 0); tg.addColorStop(0, shade(outer, 1.08)); tg.addColorStop(.55, outer); tg.addColorStop(1, shade(outer, .74));
  g.beginPath(); g.moveTo(sx - W2(6.4) * s, Y - 22.5 * s); g.quadraticCurveTo(sx - W2(6.6) * s, Y - 24.6 * s, sx - W2(4) * s, Y - 24.8 * s); g.lineTo(sx + W2(4) * s, Y - 24.8 * s); g.quadraticCurveTo(sx + W2(6.6) * s, Y - 24.6 * s, sx + W2(6.4) * s, Y - 22.5 * s); g.lineTo(sx + W2(5.2) * s, Y - 11.5 * s); g.lineTo(sx - W2(5.2) * s, Y - 11.5 * s); g.closePath();
  g.fillStyle = tg; g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke();
  if (top === 'jacket') { g.fillStyle = shirt; g.beginPath(); g.moveTo(sx - 1.8 * s, Y - 24.6 * s); g.lineTo(sx + 1.8 * s, Y - 24.6 * s); g.lineTo(sx + 1.2 * s, Y - 11.6 * s); g.lineTo(sx - 1.2 * s, Y - 11.6 * s); g.closePath(); g.fill(); g.strokeStyle = shade(jacket, .6); g.lineWidth = .7 * s; g.beginPath(); g.moveTo(sx - 1.8 * s, Y - 24.6 * s); g.lineTo(sx - 3 * s, Y - 19 * s); g.moveTo(sx + 1.8 * s, Y - 24.6 * s); g.lineTo(sx + 3 * s, Y - 19 * s); g.stroke(); }
  if (top === 'hoodie') { g.fillStyle = shade(outer, .75); g.fillRect(sx - 3.5 * s, Y - 17 * s, 7 * s, 3.4 * s); g.strokeStyle = '#e5e7eb'; g.lineWidth = .5 * s; g.beginPath(); g.moveTo(sx - 1 * s, Y - 24 * s); g.lineTo(sx - 1 * s, Y - 20.5 * s); g.moveTo(sx + 1 * s, Y - 24 * s); g.lineTo(sx + 1 * s, Y - 20.5 * s); g.stroke(); }
  if (top === 'button' && !back) { g.fillStyle = 'rgba(255,255,255,.75)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(sx, Y - 22.5 * s + k * 2.7 * s, .45 * s, 0, Math.PI * 2); g.fill(); } }
  if (top !== 'hoodie' && !back) { g.fillStyle = shade(outer, .7); g.beginPath(); g.moveTo(sx - 2.4 * s, Y - 24.8 * s); g.lineTo(sx, Y - 22 * s); g.lineTo(sx + 2.4 * s, Y - 24.8 * s); g.closePath(); g.fill(); }
  if (acc === 'bag') { g.strokeStyle = '#3b2a1c'; g.lineWidth = 1 * s; g.beginPath(); g.moveTo(sx - face * W2(4) * s, Y - 24.5 * s); g.lineTo(sx + face * W2(4.6) * s, Y - 14 * s); g.stroke(); RR(sx + face * W2(4.4) * s - 2.6 * s, Y - 15 * s, 5.2 * s, 4.4 * s, 1 * s, '#7a4b2a', true); }
  if (acc === 'backpack') { g.strokeStyle = shade(jacket, .9); g.lineWidth = 1.1 * s; g.beginPath(); g.moveTo(sx + face * -2.5 * s, Y - 24.5 * s); g.lineTo(sx + face * -2 * s, Y - 16 * s); g.stroke(); }
  if (K) {
    if (K.vest) { const vc = K.vest === true || K.vest === 'xxxl' ? '#d4ff3a' : K.vest, big = K.vest === 'xxxl', vg = g.createLinearGradient(sx - 6 * s, 0, sx + 6 * s, 0); vg.addColorStop(0, shade(vc, 1.05)); vg.addColorStop(1, shade(vc, .78)); RR(sx - (big ? 7.6 : 6.3) * s, Y - 23.4 * s, (big ? 15.2 : 12.6) * s, (big ? 13 : 10.8) * s, 2 * s, vg, true); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(sx - 6 * s, Y - 17 * s, 12 * s, 1 * s);
      if (K.vestText) { g.fillStyle = K.vest === '#f97316' ? '#111' : '#fff'; g.font = '800 ' + 2.6 * s + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(K.vestText, sx, Y - 20 * s); } }
    if (K.tie && !back) { g.fillStyle = K.tie; g.beginPath(); g.moveTo(sx - 1 * s, Y - 23.5 * s); g.lineTo(sx + 1 * s, Y - 23.5 * s); g.lineTo(sx + 1.4 * s, Y - 15 * s); g.lineTo(sx, Y - 13.5 * s); g.lineTo(sx - 1.4 * s, Y - 15 * s); g.fill(); }
    if (K.lanyard && !back) { g.strokeStyle = K.lanyard; g.lineWidth = 1 * s; g.beginPath(); g.moveTo(sx - 3 * s, Y - 24 * s); g.lineTo(sx, Y - 17 * s); g.lineTo(sx + 3 * s, Y - 24 * s); g.stroke(); g.fillStyle = '#fff'; g.fillRect(sx - 1.5 * s, Y - 17 * s, 3 * s, 3.4 * s); }
    RR(sx - 5.4 * s, Y - 13.4 * s, 10.8 * s, 2.2 * s, .6 * s, '#0e1014'); if (!back) { g.fillStyle = '#c9b46a'; g.fillRect(sx - .9 * s, Y - 13.2 * s, 1.8 * s, 1.8 * s); }
    g.fillStyle = K.patch || '#f5b800'; if (back) {} else if (K.plain) g.fillRect(sx + 2 * s, Y - 13.2 * s, 2.4 * s, 2.4 * s); else if (!K.vest) { g.fillRect(sx + (face > 0 ? 1.4 : -4.2) * s, Y - 21.4 * s, 2.8 * s, 2.6 * s); g.fillStyle = '#e5e7eb'; g.fillRect(sx + (face > 0 ? -4.2 : 1.4) * s, Y - 20.6 * s, 2.8 * s, .9 * s); }
  } else if (top !== 'dress') { g.fillStyle = shade(pants, .6); g.fillRect(sx - W2(5.2) * s, Y - 12.6 * s, W2(10.4) * s, 1.2 * s); }
  if (back && acc === 'backpack') RR(sx - 3.4 * s, Y - 24.2 * s, 6.8 * s, 10.6 * s, 2.2 * s, shade(jacket, 1.2), true);
  if (back && K && K.camelbak) RR(sx - 3 * s, Y - 24.5 * s, 6 * s, 11 * s, 2 * s, '#1f2937', true);
  // front arm swings opposite the front leg (or holds a phone, a coffee, a bag)
  if (back) arm(-face, walk, false, null); else arm(face, -walk, false, pose);
  // a cane in the front hand
  if ((o.cane || (elder && o.cane !== false)) && !back) { const hx = sx + face * W2(7) * s, hy = Y - 13.5 * s; g.strokeStyle = '#5b3a1e'; g.lineWidth = 1.3 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx - face * .8 * s, hy - .6 * s); g.lineTo(hx + face * .6 * s, hy - 1.2 * s); g.moveTo(hx, hy - .8 * s); g.lineTo(hx + face * 1.6 * s, sy - bob * s - .4 * s); g.stroke(); g.lineCap = 'butt'; }
  // neck and head (older people carry the head a little forward and down)
  const stX = elder ? face * 1.4 * s : senior ? face * .5 * s : 0, stY = elder ? 1.4 * s : senior ? .5 * s : 0; g.save(); g.translate(stX, stY);
  g.fillStyle = shade(skin, .82); g.fillRect(sx - 1.6 * s, Y - 26.5 * s, 3.2 * s, 2.4 * s);
  const hg = g.createRadialGradient(sx - 1.6 * s, Y - 30 * s, .5 * s, sx, Y - 28 * s, 6 * s); hg.addColorStop(0, shade(skin, 1.1)); hg.addColorStop(1, shade(skin, .82));
  g.beginPath(); g.ellipse(sx, Y - 28.6 * s, 4.9 * s, 5.4 * s, 0, 0, Math.PI * 2); g.fillStyle = hg; g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke();
  g.fillStyle = shade(skin, .8); g.beginPath(); g.ellipse(sx - face * 4.4 * s, Y - 28.4 * s, 1.1 * s, 1.5 * s, 0, 0, Math.PI * 2); g.fill(); if (back) { g.beginPath(); g.ellipse(sx + face * 4.4 * s, Y - 28.4 * s, 1.1 * s, 1.5 * s, 0, 0, Math.PI * 2); g.fill(); }
  if (back) {}
  else if (acc === 'shades') { RR(sx + face * .2 * s - (face < 0 ? 4 * s : 0), Y - 29.2 * s, 4.4 * s, 1.6 * s, .6 * s, '#111'); }
  else { g.fillStyle = '#1b1b1f'; g.beginPath(); g.arc(sx + face * 1.1 * s, Y - 28.1 * s, .5 * s, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(sx + face * 3.4 * s, Y - 28.1 * s, .45 * s, 0, Math.PI * 2); g.fill(); }
  if (!back) { g.strokeStyle = shade(skin, .62); g.lineWidth = .6 * s; g.beginPath(); g.moveTo(sx + face * 4.6 * s, Y - 28.2 * s); g.lineTo(sx + face * 5 * s, Y - 26.8 * s); g.stroke();
  g.beginPath(); g.moveTo(sx + face * 1.6 * s, Y - 25.6 * s); g.lineTo(sx + face * 3.4 * s, Y - 25.8 * s); g.stroke(); }
  if (senior && !back) { g.strokeStyle = shade(skin, .7); g.lineWidth = .4 * s; g.beginPath(); g.moveTo(sx + face * 4.1 * s, Y - 29.6 * s); g.lineTo(sx + face * 4.9 * s, Y - 30.1 * s); g.moveTo(sx + face * 4.2 * s, Y - 27.4 * s); g.lineTo(sx + face * 4.9 * s, Y - 27.1 * s); g.stroke(); }
  if (o.beard && !back) { const bc = o.beardCol || (senior && !o.hair ? (elder ? '#f3f4f6' : '#cbd5e1') : hair); g.fillStyle = bc;
    if (o.beard === 'full' || o.beard === 'stubble') { if (o.beard === 'stubble') g.globalAlpha = .35; g.beginPath(); g.ellipse(sx + face * .9 * s, Y - 25.4 * s, 4.5 * s, 2.7 * s, 0, -.15, Math.PI + .15); g.fill(); g.globalAlpha = 1; }
    if (o.beard === 'full' || o.beard === 'mustache') { g.beginPath(); g.ellipse(sx + face * 2.6 * s, Y - 26.2 * s, 2 * s, .75 * s, 0, 0, Math.PI * 2); g.fill(); }
    if (o.beard === 'goatee') { g.beginPath(); g.ellipse(sx + face * 2.4 * s, Y - 24.4 * s, 1.3 * s, 1.5 * s, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(sx + face * 2.6 * s, Y - 26.2 * s, 1.8 * s, .6 * s, 0, 0, Math.PI * 2); g.fill(); } }
  if (o.glasses && !back) { g.strokeStyle = '#111'; g.lineWidth = .6 * s; g.beginPath(); g.arc(sx + face * 1.1 * s, Y - 28.1 * s, 1.2 * s, 0, Math.PI * 2); g.arc(sx + face * 3.4 * s, Y - 28.1 * s, 1.1 * s, 0, Math.PI * 2); g.stroke(); }
  // headwear, or hair
  const hat = K ? K.hat : civ && rr(9) < .14 ? 'civcap' : civ && rr(9) < .2 ? 'beanie' : civ && rr(9) < .25 ? 'sunhat' : 'hair', hc = K && K.hatCol || ['#1f2937', '#b91c1c', '#1d4ed8', '#f5f5f5', '#166534'][Math.floor(rr(10) * 5)];
  const capTop = (col) => { const cg = g.createLinearGradient(sx - 5 * s, 0, sx + 5 * s, 0); cg.addColorStop(0, shade(col, 1.15)); cg.addColorStop(1, shade(col, .75)); g.beginPath(); g.ellipse(sx, Y - 30.6 * s, 5.4 * s, 4.4 * s, 0, Math.PI, 0); g.lineTo(sx + 5.4 * s, Y - 30 * s); g.lineTo(sx - 5.4 * s, Y - 30 * s); g.closePath(); g.fillStyle = cg; g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); };
  if (back && hat !== 'helmet' && hat !== 'campaign') { g.fillStyle = hat === 'hair' ? hair : shade(hair, 1); g.beginPath(); g.ellipse(sx, Y - 28.4 * s, 5 * s, 5.2 * s, 0, Math.PI * 1.05, Math.PI * 1.95, true); g.fill(); }
  if (hat === 'beanie') { g.fillStyle = hc; g.beginPath(); g.ellipse(sx, Y - 30.8 * s, 5.6 * s, 5.2 * s, 0, Math.PI, 0); g.lineTo(sx + 5.6 * s, Y - 29.6 * s); g.lineTo(sx - 5.6 * s, Y - 29.6 * s); g.closePath(); g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); g.fillStyle = shade(hc, .75); g.fillRect(sx - 5.6 * s, Y - 31 * s, 11.2 * s, 1.6 * s); g.fillStyle = shade(hc, 1.25); g.beginPath(); g.arc(sx, Y - 36.2 * s, 1.4 * s, 0, Math.PI * 2); g.fill(); }
  else if (hat === 'sunhat') { g.fillStyle = hair; g.beginPath(); g.ellipse(sx, Y - 30.4 * s, 5.2 * s, 4.2 * s, 0, Math.PI, 0); g.fill(); const sc = ['#f5e6c8', '#e9d5a1', '#fde68a', '#f5f5f5'][Math.floor(rr(15) * 4)]; g.fillStyle = shade(sc, .9); g.beginPath(); g.ellipse(sx, Y - 31 * s, 9.5 * s, 2.6 * s, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); g.fillStyle = sc; g.beginPath(); g.ellipse(sx, Y - 32.4 * s, 4.6 * s, 3.4 * s, 0, Math.PI, 0); g.fill(); g.stroke(); g.fillStyle = hc; g.fillRect(sx - 4.6 * s, Y - 32.6 * s, 9.2 * s, 1.2 * s); }
  else if (hat === 'cap' || hat === 'civcap') { capTop(hc); if (back) { g.fillStyle = shade(hc, .6); g.beginPath(); g.ellipse(sx, Y - 30.4 * s, 4.6 * s, 1.1 * s, 0, 0, Math.PI); g.fill(); } else { g.fillStyle = shade(hc, .7); g.beginPath(); g.ellipse(sx + face * 4.2 * s, Y - 30 * s, 4 * s, 1.3 * s, 0, 0, Math.PI * 2); g.fill(); } if (hat === 'cap' && !back) { g.fillStyle = K.patch || '#f5b800'; g.fillRect(sx + face * .4 * s - 1 * s, Y - 33.2 * s, 2 * s, 1.6 * s); } }
  else if (hat === 'helmet') { const cg = g.createRadialGradient(sx - 2 * s, Y - 33 * s, 1, sx, Y - 30 * s, 7 * s); cg.addColorStop(0, shade(hc, 1.3)); cg.addColorStop(1, shade(hc, .8)); g.beginPath(); g.ellipse(sx, Y - 30 * s, 6.4 * s, 5.6 * s, 0, Math.PI * 1.02, -.02); g.closePath(); g.fillStyle = cg; g.fill(); g.strokeStyle = OL; g.stroke(); g.fillStyle = shade(hc, .7); g.fillRect(sx - 6.4 * s, Y - 30.4 * s, 12.8 * s, 1.8 * s); }
  else if (hat === 'boonie') { g.fillStyle = shade(hc, .85); g.beginPath(); g.ellipse(sx, Y - 30.6 * s, 8 * s, 2.4 * s, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = OL; g.stroke(); capTop(hc); }
  else if (hat === 'campaign') { g.fillStyle = shade(hc, .85); g.beginPath(); g.ellipse(sx, Y - 31 * s, 9 * s, 3 * s, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); const cg = g.createLinearGradient(sx - 4 * s, 0, sx + 4 * s, 0); cg.addColorStop(0, shade(hc, 1.2)); cg.addColorStop(1, shade(hc, .8)); g.beginPath(); g.moveTo(sx - 4.5 * s, Y - 31.4 * s); g.lineTo(sx - 2.6 * s, Y - 38.4 * s); g.lineTo(sx, Y - 36.8 * s); g.lineTo(sx + 2.6 * s, Y - 38.4 * s); g.lineTo(sx + 4.5 * s, Y - 31.4 * s); g.closePath(); g.fillStyle = cg; g.fill(); g.stroke(); g.fillStyle = '#111'; g.fillRect(sx - 4.5 * s, Y - 32.8 * s, 9 * s, 1.4 * s); }
  else if (hat === 'sweatband') { g.fillStyle = hair; g.beginPath(); g.ellipse(sx, Y - 30.4 * s, 5.2 * s, 4.2 * s, 0, Math.PI, 0); g.fill(); RR(sx - 5.3 * s, Y - 31.6 * s, 10.6 * s, 2.2 * s, 1 * s, hc); }
  else if (hat === 'headset') { g.fillStyle = hair; g.beginPath(); g.ellipse(sx, Y - 30.4 * s, 5.2 * s, 4.2 * s, 0, Math.PI, 0); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 1.2 * s; g.beginPath(); g.arc(sx, Y - 29.4 * s, 5.8 * s, Math.PI * 1.1, -.1); g.stroke(); RR(sx - face * 6.2 * s, Y - 30 * s, 2.2 * s, 3.2 * s, .8 * s, '#111'); g.strokeStyle = '#111'; g.lineWidth = .7 * s; g.beginPath(); g.moveTo(sx - face * 5 * s, Y - 27.5 * s); g.quadraticCurveTo(sx + face * 1 * s, Y - 24.5 * s, sx + face * 3 * s, Y - 25.6 * s); g.stroke(); }
  else {
    const hcol = hair, dark = shade(hcol, .7); g.fillStyle = hcol; g.strokeStyle = OL; g.lineWidth = lw;
    if (hs === 6) { // a bob: hair around the face, not over it
      g.beginPath(); g.moveTo(sx - face * 5.9 * s, Y - 23 * s); g.lineTo(sx - face * 5.9 * s, Y - 30 * s); g.ellipse(sx, Y - 30.4 * s, 5.9 * s, 5.2 * s, 0, face > 0 ? Math.PI : 0, face > 0 ? 0 : Math.PI, face < 0); g.lineTo(sx + face * 5.4 * s, Y - 27.6 * s); g.quadraticCurveTo(sx + face * 2.4 * s, Y - 31.4 * s, sx - face * .6 * s, Y - 30.2 * s); g.lineTo(sx - face * 1.4 * s, Y - 23 * s); g.closePath(); g.fill(); g.stroke(); }
    else if (hs === 7) { g.globalAlpha = .55; g.beginPath(); g.ellipse(sx, Y - 30.6 * s, 4.9 * s, 3.6 * s, 0, Math.PI, 0); g.fill(); g.globalAlpha = 1; }
    else if (hs === 8) { g.beginPath(); g.arc(sx - face * .4 * s, Y - 33.4 * s, 6.4 * s, Math.PI * .88, Math.PI * 2.12); g.closePath(); g.fill(); g.stroke(); }
    else if (hs === 1) { g.globalAlpha = .9; g.beginPath(); g.ellipse(sx, Y - 30.2 * s, 5 * s, 3.8 * s, 0, Math.PI, 0); g.fill(); g.globalAlpha = 1; }
    else if (hs === 4) { g.beginPath(); g.moveTo(sx - 5.4 * s, Y - 23 * s); g.lineTo(sx - 5.6 * s, Y - 30 * s); g.ellipse(sx, Y - 30.4 * s, 5.6 * s, 5 * s, 0, Math.PI, 0); g.lineTo(sx + 5.4 * s, Y - 23 * s); g.lineTo(sx + 3.6 * s, Y - 24 * s); g.lineTo(sx + 4 * s, Y - 29.5 * s); g.lineTo(sx - 4 * s, Y - 29.5 * s); g.lineTo(sx - 3.6 * s, Y - 24 * s); g.closePath(); g.fill(); g.stroke(); }
    else if (hs === 5) { for (let k = 0; k < 7; k++) { const a = Math.PI + k / 6 * Math.PI; g.beginPath(); g.arc(sx + Math.cos(a) * 4.4 * s, Y - 30 * s + Math.sin(a) * 4 * s, 1.9 * s, 0, Math.PI * 2); g.fill(); } }
    else { g.beginPath(); g.ellipse(sx, Y - 30.4 * s, 5.4 * s, 4.8 * s, 0, Math.PI, 0); g.lineTo(sx + 5.4 * s, Y - 29 * s); g.lineTo(sx - 5.4 * s, Y - 29 * s); g.closePath(); g.fill(); g.stroke(); }
    if (hs === 2) { g.fillStyle = dark; g.beginPath(); g.moveTo(sx - face * 1 * s, Y - 34.8 * s); g.quadraticCurveTo(sx + face * 4 * s, Y - 34 * s, sx + face * 5.2 * s, Y - 30 * s); g.lineTo(sx + face * 2 * s, Y - 31.6 * s); g.closePath(); g.fill(); }
    if (hs === 3) { g.beginPath(); g.arc(sx - face * 2 * s, Y - 35 * s, 2.4 * s, 0, Math.PI * 2); g.fillStyle = hcol; g.fill(); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(sx - 1.6 * s, Y - 33 * s, 1.8 * s, .8 * s, -.3, 0, Math.PI * 2); g.fill();
  }
  if (top === 'hoodie' && rr(11) < .4) { g.fillStyle = outer; g.beginPath(); g.ellipse(sx, Y - 30.6 * s, 5.9 * s, 5.4 * s, 0, Math.PI * .95, Math.PI * 2.05); g.fill(); g.strokeStyle = OL; g.lineWidth = lw; g.stroke(); }
  if (acc === 'phone' && !mv) { g.fillStyle = 'rgba(160,210,255,.5)'; g.beginPath(); g.arc(sx + face * 5.4 * s, Y - 27.5 * s, 1.1 * s, 0, Math.PI * 2); g.fill(); }
  g.restore(); g.restore();
}

// a working dog that trots beside its handler
export function dog(g, sx, sy, face, moving, t) {
  // a shepherd-type working dog: four-beat trot, wagging tail, ears up, tongue out on the move
  const f = face || 1, c = t / 85, OL = 'rgba(12,16,26,.5)', body = '#8b5a2b', saddle = '#2b1a0c', bob = moving ? Math.abs(Math.sin(c)) * 1 : Math.sin(t / 900) * .3;
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sx + 1, sy + 1, 9, 3, 0, 0, Math.PI * 2); g.fill();
  const leg = (x, ph, near) => { const sw = moving ? Math.sin(c + ph) * 2.2 : 0, lift = moving ? Math.max(0, Math.cos(c + ph)) * 1.4 : 0; g.strokeStyle = near ? '#4a2f18' : '#3a2412'; g.lineWidth = 1.9; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx + x * f, sy - 7 - bob); g.lineTo(sx + x * f + sw * f, sy - 1 - lift); g.stroke(); };
  leg(-5, Math.PI, false); leg(4.5, 0, false);
  const Y = sy - bob;
  // tail
  const wag = Math.sin(t / (moving ? 90 : 160)) * 3; g.strokeStyle = body; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx - f * 8, Y - 8.5); g.quadraticCurveTo(sx - f * 12, Y - 10 + wag * .3, sx - f * 13, Y - 6 + wag); g.stroke();
  // body with a dark saddle
  const bg = g.createLinearGradient(0, Y - 11, 0, Y - 4); bg.addColorStop(0, '#a46a35'); bg.addColorStop(1, '#6e4520');
  g.fillStyle = bg; g.beginPath(); g.ellipse(sx, Y - 7.5, 8.5, 3.8, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = OL; g.lineWidth = .7; g.stroke();
  g.fillStyle = saddle; g.beginPath(); g.ellipse(sx - f * 1.2, Y - 9.4, 5.2, 2.1, 0, 0, Math.PI * 2); g.fill();
  leg(-3.5, Math.PI * .5, true); leg(6, Math.PI * 1.5, true);
  // head, muzzle, ears, eye, collar, tongue
  const hx = sx + f * 8.2, hy = Y - 11.5; g.fillStyle = body; g.beginPath(); g.ellipse(hx, hy, 3.4, 3, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = OL; g.stroke();
  g.fillStyle = saddle; g.beginPath(); g.ellipse(hx + f * 3, hy + .9, 2.4, 1.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(hx + f * 5, hy + .4, .8, 0, Math.PI * 2); g.fill();
  g.fillStyle = saddle; [-1.3, .9].forEach((o, i) => { g.beginPath(); g.moveTo(hx + f * (o - 1), hy - 2); g.lineTo(hx + f * (o - .2), hy - 6.2 + i * .4); g.lineTo(hx + f * (o + .9), hy - 2); g.closePath(); g.fill(); });
  g.fillStyle = '#111'; g.beginPath(); g.arc(hx + f * 1.4, hy - .8, .55, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c0392b'; g.fillRect(hx - f * 2.6 - (f < 0 ? 1.6 : 0), hy + 1.2, 1.6, 2.2);
  if (moving) { g.fillStyle = '#e57373'; g.beginPath(); g.ellipse(hx + f * 3.4, hy + 2.6, .9, 1.4, 0, 0, Math.PI * 2); g.fill(); }
}
// dogs are drawn once per animation frame and stamped (a trot is 10 frames, standing is 8)
const DCACHE = new Map();
export function dogFast(g, sx, sy, face, moving, t) {
  const f = face < 0 ? -1 : 1, per = moving ? 534 : 1005, n = moving ? 10 : 8, fr = Math.floor(((t % per) + per) % per / per * n), base = 'd' + f + '|' + (moving ? 1 : 0) + '|' + fr, k = base + '|' + RES;
  let c = DCACHE.get(k) || reuse(base); if (!c) { if (DCACHE.size > 80) DCACHE.clear(); const [cv, cg] = hiCanvas(44, 34, RES); dog(cg, 22, 28, f, moving, fr * per / n); c = cv; DCACHE.set(k, c); remember(base, c); }
  g.drawImage(c, sx - 22, sy - 28, c.lw, c.lh);
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
  castShadow(g, sx, sy, 22 * s, .7 * s);
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
const VCACHE = new Map();
function vehicleFast(g, sx, sy, dir, v, t, night, on) {
  if (on) return drawVehicle(g, sx, sy, dir, v, t, night, on);
  let k = dir + '|' + (night ? 1 : 0) + '|' + Math.round(SUNLEN); for (const f in v) k += '|' + f + '=' + v[f]; const base = 'v' + k; k += '|' + RES;
  let c = VCACHE.get(k) || reuse(base);
  if (!c) { if (VCACHE.size > 260) { let n = 40; for (const kk of VCACHE.keys()) { VCACHE.delete(kk); if (--n <= 0) break; } } const sc = v.scale || 1, W = Math.ceil(150 * sc), Hh = Math.ceil(120 * sc), [cv, cg] = hiCanvas(W, Hh, RES); drawVehicle(cg, W / 2, Hh * .72, dir, v, 0, night, false); cv.ax = W / 2; cv.ay = Hh * .72; c = cv; VCACHE.set(k, c); remember(base, c); }
  g.drawImage(c, sx - c.ax, sy - c.ay, c.lw, c.lh);
}
export function car(g, sx, sy, dir, color, police, t, night, scale, bar) {
  if (police) return vehicleFast(g, sx, sy, dir, { kind: 'sedan', body: '#111418', side: '#111418', doors: '#f2f2f2', bar: 'full', push: true, text: 'POLICE', scale: scale || 1 }, t, night, bar);
  return vehicleFast(g, sx, sy, dir, { kind: (color.charCodeAt(1) + color.charCodeAt(2)) % 5 === 0 ? 'suv' : 'sedan', body: color, side: color, scale: scale || 1 }, t, night, false);
}
export function vehicle(g, sx, sy, dir, v, t, night, on) {
  if (v.kind === 'boat') return boat(g, sx, sy, dir, t, on);
  const spec = Object.assign({}, v); if (v.body === '#14171c') { spec.doors = '#f2f2f2'; spec.push = true; spec.side = v.body; }
  return vehicleFast(g, sx, sy, dir, spec, t, night, on);
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

// ---------- specialty rides: police motorcycle, patrol bicycle and the mounted unit's horse ----------
// dir: 0 +x, 1 +y, 2 -x, 3 -y. The rider is drawn with the same person() as everyone else.
export function rideArt(g, sx, sy, dir, kind, t, moving, rider, lights) {
  const K = kind === 'horse' ? 1.4 : kind === 'moto' ? 1.2 : 1; if (K !== 1) { const ride = rider; g.save(); g.translate(sx, sy); g.scale(K, K); g.translate(-sx, -sy); let rd = null; rideArt0(g, sx, sy, dir, kind, t, moving, (x, y, o) => { rd = [x, y, o]; }, lights); g.restore(); if (rd) ride(sx, sy - (sy - rd[1]) * K + (kind === 'horse' ? 7 : 2), rd[2]); return; }
  rideArt0(g, sx, sy, dir, kind, t, moving, rider, lights);
}
function rideArt0(g, sx, sy, dir, kind, t, moving, rider, lights) {
  const F = [[1, .5], [-1, .5], [-1, -.5], [1, -.5]][dir & 3], fx = F[0], back = F[1] < 0, OL = 'rgba(12,16,26,.55)';
  const at = (d, h) => [sx + fx * d, sy + F[1] * d * .5 - h];
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(sx, sy + 1, kind === 'horse' ? 18 : 14, kind === 'horse' ? 6 : 4.5, 0, 0, Math.PI * 2); g.fill();
  const wheel = (d, r, spin) => { const [x, y] = at(d, r); g.strokeStyle = '#111'; g.lineWidth = 2.6; g.beginPath(); g.ellipse(x, y, r * .55, r, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = 'rgba(200,200,200,.6)'; g.lineWidth = .8; const a = spin; g.beginPath(); g.moveTo(x + Math.cos(a) * r * .5, y + Math.sin(a) * r); g.lineTo(x - Math.cos(a) * r * .5, y - Math.sin(a) * r); g.stroke(); };
  const spin = moving ? t / 60 : 0;
  if (kind === 'bike') {
    wheel(-8, 6, spin); wheel(8, 6, spin + 1);
    const [ax, ay] = at(-8, 6), [bx, by] = at(8, 6), [cx, cy] = at(0, 12), [hx, hy] = at(7, 17);
    g.strokeStyle = '#1e3a8a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(ax, ay); g.lineTo(cx, cy); g.lineTo(bx, by); g.moveTo(cx, cy); g.lineTo(hx, hy); g.stroke();
    g.fillStyle = '#111'; g.fillRect(hx - 3, hy - 1, 6, 2); const [px, py] = at(-7, 9); g.fillStyle = '#0f172a'; g.fillRect(px - 4, py - 4, 8, 5); g.fillStyle = '#f5b800'; g.font = '700 3.5px system-ui'; g.textAlign = 'center'; g.fillText('POLICE', px, py - .5);
    rider(sx, sy - 9, { moving: false, face: fx > 0 ? 1 : -1, back, s: .92 });
  } else if (kind === 'moto') {
    wheel(-10, 6.5, spin); wheel(10, 6.5, spin + 1);
    const [cx, cy] = at(0, 9); g.fillStyle = '#f2f2f2'; g.strokeStyle = OL; g.lineWidth = .8; g.beginPath(); g.ellipse(cx, cy, 13, 5, Math.atan2(F[1] * .5, fx), 0, Math.PI * 2); g.fill(); g.stroke();
    const [tx, ty] = at(-3, 13); g.fillStyle = '#14171c'; g.beginPath(); g.ellipse(tx, ty, 6, 3, 0, 0, Math.PI * 2); g.fill();
    const [wx, wy] = at(9, 17); g.fillStyle = 'rgba(180,220,255,.7)'; g.fillRect(wx - 3, wy - 5, 6, 6); g.fillStyle = '#111'; g.fillRect(wx - 5, wy + 1, 10, 1.6);
    const [lx, ly] = at(-11, 14); const blink = Math.floor(t / 180) % 2; g.fillStyle = lights ? (blink ? '#ef4444' : '#2563eb') : '#7f1d1d'; g.beginPath(); g.arc(lx - 2, ly, 1.8, 0, 7); g.fill(); g.fillStyle = lights ? (blink ? '#2563eb' : '#ef4444') : '#1e3a8a'; g.beginPath(); g.arc(lx + 2, ly, 1.8, 0, 7); g.fill();
    rider(sx, sy - 8, { moving: false, face: fx > 0 ? 1 : -1, back, s: .92 });
  } else if (kind === 'horse') {
    const c = moving ? t / 110 : 0, bob = moving ? Math.abs(Math.sin(c)) * 1.6 : Math.sin(t / 800) * .4, body = '#5a3a22', dark = '#3b2414';
    // legs: four-beat walk
    [[-8, 0], [-5, 1.6], [6, .8], [9, 2.4]].forEach(([d, ph], i) => { const sw = moving ? Math.sin(c + ph) * 3 : 0, [x, y] = at(d + sw * .4, 0); g.strokeStyle = i % 2 ? dark : body; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x, y - 14 + bob); g.lineTo(x + sw * fx * .3, y); g.stroke(); g.fillStyle = '#1c1917'; g.fillRect(x + sw * fx * .3 - 1.5, y - 1, 3, 1.6); });
    const [bx, by] = at(0, 18 - bob); g.fillStyle = body; g.strokeStyle = OL; g.lineWidth = .9; g.beginPath(); g.ellipse(bx, by, 14, 6.5, Math.atan2(F[1] * .5, fx) * .6, 0, Math.PI * 2); g.fill(); g.stroke();
    const [nx, ny] = at(12, 24 - bob), [hx, hy] = at(16, 29 - bob); g.strokeStyle = body; g.lineWidth = 5; g.beginPath(); g.moveTo(...at(9, 20 - bob)); g.lineTo(nx, ny); g.stroke(); g.fillStyle = body; g.beginPath(); g.ellipse(hx, hy, 5, 3, Math.atan2(F[1] * .5, fx) + (fx > 0 ? .4 : -.4), 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = dark; g.beginPath(); g.ellipse(nx - fx * 1.5, ny - 2, 2.2, 5, 0, 0, Math.PI * 2); g.fill();
    const [tx, ty] = at(-14, 18 - bob); g.strokeStyle = dark; g.lineWidth = 2.4; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx - fx * 4, ty + 6, tx - fx * 2 + Math.sin(t / 300) * 1.5, ty + 11); g.stroke();
    const [sx2, sy2] = at(-1, 23 - bob); g.fillStyle = '#1e3a8a'; g.fillRect(sx2 - 6, sy2 - 2, 12, 4); g.fillStyle = '#f5b800'; g.font = '700 3px system-ui'; g.textAlign = 'center'; g.fillText('POLICE', sx2, sy2 + 1);
    rider(sx, sy - 22 + bob, { moving: false, face: fx > 0 ? 1 : -1, back, s: .9 });
  }
}
