// Interiors: every enterable building has its own floor plan, drawn as a tiny map.
// Legend:  # wall   . floor   D exit door (bottom wall)   W wall with a board/screen
//   L locker  k computer desk  d desk  h chair  T table  c counter  s shelf  F cooler  X display case
//   v vault wall  B bed  p pew  r rack  x crate  C cell bars  S stool  b booth seat  P plant  u couch  V tv
//   J judge's bench  R railing  a altar  M mailboxes  K forklift  E fire engine  A car on a lift  U storage door  Z stairs
//   @ staff  ? citizen with a question  i study point  * secret spot  $ lost & found  o something's off
import { N, TW, TH, T, iso, person, drawProp, vehicle } from './world.js';

const PLANS = {
  hq: { name: 'Patrol HQ', floor: 'tile', wall: '#3d4f7a', blurb: 'Roll call room, locker room and the watch commander\'s desk.', plan: [
    '##############',
    '#LLLLLL#WWWWW#',
    '#......#.k.k.#',
    '#..@...#.....#',
    '#......#..@..#',
    '###.####..i..#',
    '#hhhh.hhhh...#',
    '#hhhh.hhhh.*.#',
    '#............#',
    '#....dd...$..#',
    '#.?..@.....P.#',
    '######D#######'] },
  substation: { name: 'District Substation', floor: 'tile', wall: '#3d4f7a', blurb: 'Report room, lockers and a coffee maker with a long history.', plan: [
    '############',
    '#LLLL#WWWWW#',
    '#....#.k.k.#',
    '#.@..#...i.#',
    '##.###.....#',
    '#.....@..*.#',
    '#.TT.......#',
    '#.TT..?..P.#',
    '#####D######'] },
  dispatch: { name: 'Dispatch Center', floor: 'carpet', wall: '#5b6b80', blurb: 'Consoles, headsets and the calm voices that send you everywhere.', plan: [
    '##############',
    '#WWWWWWWWWWWW#',
    '#k.k.k..k.k.k#',
    '#............#',
    '#k.k.@..k.k.k#',
    '#............#',
    '#..TTTT...i..#',
    '#..hhhh...?..#',
    '#P....*.....P#',
    '######D#######'] },
  records: { name: 'Records · FCIC Terminal', floor: 'lino', wall: '#7b8794', blurb: 'Filing shelves, the records counter and the terminal everyone fights over.', plan: [
    '############',
    '#ssss.ssss.#',
    '#..........#',
    '#ssss.ssss.#',
    '#.....*....#',
    '#ssss.ssss.#',
    '#..........#',
    '#cccc..k.i.#',
    '#.@....k...#',
    '#......?..P#',
    '#####D######'] },
  bank: { name: 'First Coast Bank', floor: 'marble', wall: '#b5a98f', blurb: 'Teller line, the lobby and a vault door you are not opening.', plan: [
    '##############',
    '#vvvv..d..d.*#',
    '#v..v........#',
    '#v$.v..@..@..#',
    '#vv.v........#',
    '#....cc..cccc#',
    '#............#',
    '#.P..?....i.P#',
    '#............#',
    '######D#######'] },
  diner: { name: 'Night Owl Diner', floor: 'checker', wall: '#d22d3d', blurb: 'Booths, a long counter and coffee that has seen things.', plan: [
    '##############',
    '#FF....@....F#',
    '#cccccccccc..#',
    '#.S.S.S.S.S..#',
    '#............#',
    '#bT.bT..Tb.Tb#',
    '#............#',
    '#bT.bT..Tb.?.#',
    '#..i.....*...#',
    '#P....D......#'.replace('D', '.'),
    '######D#######'] },
  store: { name: 'Corner Store', floor: 'lino', wall: '#8a7f6a', blurb: 'Aisles, coolers and a clerk who has seen every excuse.', plan: [
    '############',
    '#FFFF.FFFF.#',
    '#..........#',
    '#.ss.ss.ss.#',
    '#.ss.ss.ss.#',
    '#..........#',
    '#.ss.ss.ss*#',
    '#.ss.ss.ss.#',
    '#.....?....#',
    '#cc@...i..P#',
    '#####D######'] },
  gas: { name: 'Gas & Go', floor: 'lino', wall: '#d22d3d', blurb: 'Hot dogs of uncertain age, coolers and the lottery line.', plan: [
    '############',
    '#FFFFFFFF..#',
    '#.........*#',
    '#.ss..ss...#',
    '#.ss..ss.T.#',
    '#........T.#',
    '#.cc...?...#',
    '#@.c...i..P#',
    '#####D######'] },
  pawn: { name: 'River Pawn', floor: 'wood', wall: '#5b4a3a', blurb: 'Glass cases, guitars on the wall and a pawn log by the register.', plan: [
    '############',
    '#rrrr.rrrr*#',
    '#..........#',
    '#.XX..XX...#',
    '#..........#',
    '#.XX..XX.i.#',
    '#..........#',
    '#XXcc.@ccXX#',
    '#.?........#',
    '#####D######'] },
  motel: { name: 'Eastgate Motel', floor: 'carpet', wall: '#c08a5e', blurb: 'Front desk, a hallway and three rooms with very loud air conditioners.', plan: [
    '##############',
    '#B.V.#B.V.#B*#',
    '#B...#B...#B.#',
    '#..h.#..h.#..#',
    '###.####.###.#',
    '#............#',
    '#.........?..#',
    '#cc@...i....P#',
    '######D#######'] },
  autoshop: { name: 'Auto Shop', floor: 'concrete', wall: '#7f8a94', blurb: 'Two lifts, a wall of tools and a radio stuck on classic rock.', plan: [
    '##############',
    '#rrrr..rrrr.*#',
    '#............#',
    '#..A.....A...#',
    '#............#',
    '#.@.......x..#',
    '#.......i.xx.#',
    '#cc..?.......#',
    '######D#######'] },
  firestation: { name: 'Fire Station 3', floor: 'concrete', wall: '#b5302b', blurb: 'The engine bay, turnout gear and a kitchen that out-cooks yours.', plan: [
    '##############',
    '#LLLLLL..TT.*#',
    '#........TT..#',
    '#..E.........#',
    '#........@...#',
    '#.......i....#',
    '#....?.......#',
    '######D#######'] },
  church: { name: 'Community Church', floor: 'wood', wall: '#d8d0bf', blurb: 'Quiet pews, warm light and a food pantry by the side door.', plan: [
    '############',
    '#P..aaa..P.#',
    '#....@.....#',
    '#pppp.pppp.#',
    '#..........#',
    '#pppp.pppp*#',
    '#..........#',
    '#pppp.pppp.#',
    '#..i...?...#',
    '#####D######'] },
  school: { name: 'Riverside School', floor: 'lino', wall: '#a65a42', blurb: 'A classroom, the front office and a hallway full of posters.', plan: [
    '##############',
    '#WWWWWW#ssss*#',
    '#..d...#.....#',
    '#......#..@..#',
    '#hd.hd.#cccc.#',
    '#......#.....#',
    '#hd.hd.....i.#',
    '#......#.....#',
    '#hd.hd.#..?.P#',
    '######D#######'] },
  apartments: { name: 'Apartments', floor: 'carpet', wall: '#8f7c68', blurb: 'Lobby, mailboxes and a hallway of doors with stories behind them.', plan: [
    '############',
    '#Z.U.U.U.U.#',
    '#..........#',
    '#.........*#',
    '#U.U.U.U.U.#',
    '#..........#',
    '#MMM...i...#',
    '#.@....?..P#',
    '#####D######'] },
  houses: { name: 'Residence', floor: 'wood', wall: '#c9b48f', blurb: 'Living room, kitchen and a family photo wall.', plan: [
    '##########',
    '#B..#cc.*#',
    '#B..#...F#',
    '#...#.TT.#',
    '##.##....#',
    '#.uu.V...#',
    '#....i.?.#',
    '#P.@.....#',
    '####D#####'] },
  warehouse: { name: 'Warehouse', floor: 'concrete', wall: '#8f9aa4', blurb: 'Tall racks, blind corners and a lot of places to check. Search it like the book says.', plan: [
    '##############',
    '#rrr.rrr.rrr*#',
    '#............#',
    '#rrr.rrr.rrr.#',
    '#.....o......#',
    '#rrr.rrr.rrr.#',
    '#............#',
    '#xx..K....i..#',
    '#xxx...$..x..#',
    '######D#######'] },
  storage: { name: 'Storage Office', floor: 'concrete', wall: '#c56a2b', blurb: 'The rental office and a corridor of roll-up doors.', plan: [
    '############',
    '#UUUUUUUUU*#',
    '#..........#',
    '#UUUU.o.UUU#',
    '#..........#',
    '#cc@...i...#',
    '#.....?...P#',
    '#####D######'] },
  courthouse: { name: 'County Courthouse', floor: 'marble', wall: '#cfc6b2', blurb: 'Courtroom 2A: the bench, the jury box and the gallery.', plan: [
    '##############',
    '#WWW.JJJJ.WWW#',
    '#.....@......#',
    '#jj.........*#',
    '#jj..TT..TT..#',
    '#jj..hh..hh..#',
    '#RRRRR..RRRRR#',
    '#pppp....pppp#',
    '#pppp..i.pppp#',
    '#..?.........#',
    '######D#######'] },
  jail: { name: 'County Jail · Booking', floor: 'concrete', wall: '#9a958a', blurb: 'Booking counter, property room and holding cells.', plan: [
    '##############',
    '#C..C#C..C#s*#',
    '#C..C#C..C#..#',
    '#CC.C#CC.C#..#',
    '#............#',
    '#....o.......#',
    '#ccccc..@..i.#',
    '#...?........#',
    '######D#######'] },
  office: { name: 'Office', floor: 'carpet', wall: '#7b8794', blurb: 'Desks, files and a waiting area with very old magazines.', plan: [
    '############',
    '#ss.d..d.s*#',
    '#...h..h...#',
    '#..........#',
    '#.d..@..d..#',
    '#.h.....h..#',
    '#.......i..#',
    '#hhh..?...P#',
    '#####D######'] },
  tower: { name: 'Office Tower Lobby', floor: 'marble', wall: '#6f8299', blurb: 'Security desk, elevators and a fountain nobody throws coins in.', plan: [
    '############',
    '#UU.UU.UU.*#',
    '#..........#',
    '#.P......P.#',
    '#...cccc...#',
    '#....@.....#',
    '#.i....?...#',
    '#P........P#',
    '#####D######'] }
};
// building kinds that can be entered and which plan they use
export const ENTER = { hq: 'hq', substation: 'substation', dispatch: 'dispatch', records: 'records', bank: 'bank', diner: 'diner', shop: 'store', pharmacy: 'store', mall: 'store', gas: 'gas', pawn: 'pawn', motel: 'motel', autoshop: 'autoshop', firestation: 'firestation', church: 'church', school: 'school', apartments: 'apartments', houses: 'houses', warehouse: 'warehouse', lumber: 'warehouse', storage: 'storage', courthouse: 'courthouse', jail: 'jail', sallyport: 'jail', bonds: 'office', defender: 'office', tower: 'tower' };

// staff: what they look like and what they say when you talk to them
const STAFF = {
  hq: [{ shirt: '#22355e', pants: '#1b2a4a', hat: 'cap', hatCol: '#16213d', patch: '#f5b800' }, ['"Roll call is at 0545. That means 0530."', '"You call that a gig line? Fix it before the sergeant sees it."', '"Grab a radio, check your batteries, then check them again."']],
  substation: [{ shirt: '#22355e', pants: '#1b2a4a', hat: 'cap', hatCol: '#16213d', patch: '#f5b800' }, ['"The coffee maker was here before the building. Respect it."', '"Paperwork is due before end of watch. Ask me how I know."']],
  dispatch: [{ shirt: '#334155', pants: '#1f2937', hat: 'headset', patch: '#9ca3af' }, ['"I hear everything. Yes, even that."', '"Clear and concise on the radio, cadet. Nobody needs the director\'s cut."', '"If you key up and say \'umm\' one more time..."']],
  records: [{ shirt: '#7c3aed', pants: '#1f2937', hat: 'none', patch: '#ddd6fe', lanyard: '#7c3aed' }, ['"Confirm the hit before you act on it. Always."', '"The terminal is not for checking your ex. We log everything."']],
  bank: [{ shirt: '#e5e7eb', pants: '#374151', hat: 'none', tie: '#1e3a8a', plain: true }, ['"Can I help you, officer? Oh, in training. Can I help you, almost-officer?"', '"The vault is on a time lock. So is my lunch break."']],
  diner: [{ shirt: '#f2f2f2', pants: '#111', hat: 'none', patch: '#d22d3d' }, ['"Coffee? Of course coffee. Sit anywhere, hon."', '"The pie is fresh. The coffee is... present."', '"Third shift always tips the best. Don\'t ask me why."']],
  store: [{ shirt: '#1f7a5a', pants: '#1f2937', hat: 'cap', hatCol: '#1f7a5a' }, ['"Restroom is for customers. You are a customer now. Buy gum."', '"That guy? He comes in every day and buys one banana."']],
  gas: [{ shirt: '#d22d3d', pants: '#1f2937', hat: 'cap', hatCol: '#d22d3d' }, ['"Hot dogs are two for three. Their age is a mystery to us all."', '"Pump four only takes cash. It has opinions."']],
  pawn: [{ shirt: '#5b4a3a', pants: '#1f2937', hat: 'none' }, ['"Everything we take in goes in the log. Serial numbers, photos, ID. All of it."', '"That guitar was Elvis\'s. Probably. Possibly. No."']],
  motel: [{ shirt: '#1f7a5a', pants: '#1f2937', hat: 'none' }, ['"Room 12 again? I\'ll get the key."', '"The ice machine works. It just makes very small ice."']],
  autoshop: [{ shirt: '#3b5b7a', pants: '#2a3a4a', hat: 'cap', hatCol: '#d22d3d' }, ['"Your patrol car makes a noise? They all make a noise."', '"Check your tire pressure before shift. Seriously."']],
  firestation: [{ shirt: '#1f2937', pants: '#1f2937', hat: 'none', patch: '#d22d3d' }, ['"You hungry? We made chili. We always made chili."', '"Stage until we tell you it\'s safe. Then come get your report."']],
  church: [{ shirt: '#1f2937', pants: '#1f2937', hat: 'none', patch: '#fff' }, ['"Our pantry is open Tuesdays. Send anyone who needs it."', '"You look tired, young one. There are cookies in the back."']],
  school: [{ shirt: '#7c3aed', pants: '#374151', hat: 'none', lanyard: '#7c3aed' }, ['"Sign in at the front office, please. Yes, even you."', '"The kids want to know if you have a dog. The K9 cadets are very popular here."']],
  apartments: [{ shirt: '#4b5563', pants: '#1f2937', hat: 'cap', hatCol: '#374151' }, ['"Building manager. I have a key for everything except my own office."', '"Mrs. Alvarez in 3C makes the best flan. That is not police business. Still true."']],
  houses: [{ shirt: '#c0392b', pants: '#2c3e50', hat: 'none' }, ['"Thanks for stopping by, officer. Want some lemonade?"', '"The neighbor\'s dog is the real problem around here."']],
  warehouse: [{ shirt: '#f97316', pants: '#1f2937', hat: 'helmet', hatCol: '#f5d000', vest: '#d4ff3a' }, ['"Key holder here. Alarm went off at the back door again."', '"Watch the forklift. It has the right of way and it knows it."']],
  storage: [{ shirt: '#c56a2b', pants: '#1f2937', hat: 'cap', hatCol: '#c56a2b' }, ['"Unit 14 is paid up. Unit 15 smells weird. Not my business."']],
  courthouse: [{ shirt: '#111827', pants: '#111827', hat: 'none', patch: '#f5b800' }, ['"All rise. Just kidding. Sit. Court\'s in recess."', '"Write your reports like a defense attorney will read them. Because one will."']],
  jail: [{ shirt: '#4b5563', pants: '#1f2937', hat: 'none', patch: '#f5b800' }, ['"Search them before they come through my door. Every time."', '"Property bag sealed and inventoried, or I send you back out."']],
  office: [{ shirt: '#e5e7eb', pants: '#374151', hat: 'none', tie: '#7f1d1d', plain: true }, ['"Take a number. We are currently serving number 3. Your number is 74."', '"Have a seat. The magazines are from 2009. Very vintage."']],
  tower: [{ shirt: '#111827', pants: '#111827', hat: 'cap', hatCol: '#111827', patch: '#9ca3af' }, ['"Elevator three is haunted. Take two."', '"You need to sign in. Everyone signs in. Even the pizza guy."']]
};
const SECRETS = {
  hq: ['The Sergeant\'s Snack Drawer', 'Full of beef jerky and a note that says "I counted these."'],
  substation: ['The Lost Pen Graveyard', 'Under the report-room desk. Forty-one pens. None of them work.'],
  dispatch: ['The Calm Chair', 'Ergonomic, heated and legendary. Nobody else is allowed to sit in it.'],
  records: ['The Misfiled Box from 1998', 'Labeled "MISC (DO NOT OPEN)". You do not open it.'],
  bank: ['The Pen Chained to the Desk', 'Chained up for its own protection. It has escaped twice.'],
  diner: ['The Booth Where Every Shift Ends', 'Carved initials from twenty years of third shift.'],
  store: ['The Expired Snack Shelf', 'Discounted for a reason. That reason is time.'],
  gas: ['The Roller Grill of Destiny', 'The hot dog in slot 3 has been turning since Tuesday.'],
  pawn: ['The Cursed Accordion', 'Nobody pawned it. It was just here one morning.'],
  motel: ['The Ice Machine Shrine', 'Someone left a thank-you note for the ice machine.'],
  autoshop: ['The Calendar from 2003', 'Still on February. Nobody will turn the page.'],
  firestation: ['The Chili Recipe Vault', 'A locked recipe box with a sign: "CAPTAIN ONLY".'],
  church: ['The Choir\'s Secret Kazoo', 'Used once, at Easter. Never spoken of again.'],
  school: ['The Lost & Found Mountain', 'Two hundred hoodies and one trombone.'],
  apartments: ['The Package Pile', 'Every package for apartment 4B. There is no apartment 4B.'],
  houses: ['The Junk Drawer', 'Batteries, rubber bands, a single key to nothing. Every house has one.'],
  warehouse: ['The Forklift Name Tag', 'Its name is Gerald. Gerald has seen things.'],
  storage: ['The Unit Nobody Rents', 'Unit 13. Discounted 90%. Still nobody rents it.'],
  courthouse: ['The Judge\'s Candy Jar', 'Peppermints only. A strong legal precedent.'],
  jail: ['The Booking Photo Wall of Fame', 'Not the arrestees. The staff\'s worst ID photos.'],
  office: ['The Ancient Fax Machine', 'It still beeps every morning at 0900. Nobody knows who it is calling.'],
  tower: ['The Fake Ficus', 'Watered daily by the night guard. Out of respect.']
};
export const STAFF_LINES = (k) => (STAFF[k] || STAFF.office)[1];

// ---------- building an interior as a small map ----------
export function buildInterior(lot, outW, idx) {
  const key = ENTER[lot.kind], pl = PLANS[key], rows = pl.plan, h = rows.length, w = rows[0].length;
  const ox = Math.floor((N - w) / 2), oy = Math.floor((N - h) / 2);
  const g = new Uint8Array(N * N), at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 0 : g[y * N + x]), set = (x, y, v) => { if (x >= 0 && y >= 0 && x < N && y < N) g[y * N + x] = v; };
  const I = { inside: true, key, kind: lot.kind, name: lot.name || pl.name, blurb: pl.blurb, did: outW.did, D: outW.D, g, at, set, buildings: [], props: [], lots: [], lights: [], parking: [], walk: [], quiet: [], gates: [], secrets: [], staff: [], citz: [], infos: [], obs: [], caches: [], river: false, blocked: new Set(), floor: pl.floor, wallCol: pl.wall, w, h, ox, oy };
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
    const ch = rows[r][c], x = ox + c, y = oy + r;
    if (ch === ' ') continue;
    if (ch === '#' || ch === 'W' || ch === 'v' || ch === 'U') { set(x, y, T.BLDG); I.props.push({ t: 'furn', k: ch === '#' ? 'wall' : ch, x: x + .5, y: y + .5, front: r === h - 1 || c === w - 1, block: true }); continue; }
    set(x, y, T.PLAZA);
    if (ch === 'D') { I.door = [x + .5, y + .5]; I.props.push({ t: 'furn', k: 'door', x: x + .5, y: y + .5 }); continue; }
    if ('LkdhTcsFXBprxCSbPuVJRaMKEAZj'.indexOf(ch) >= 0) { I.props.push({ t: 'furn', k: ch, x: x + .5, y: y + .5, block: ch !== 'h' && ch !== 'S' && ch !== 'j' }); if (ch !== 'h' && ch !== 'S' && ch !== 'j') I.blocked.add(y * N + x); continue; }
    I.walk.push([x, y]);
    if (ch === '@') { I.staff.push({ x: x + .5, y: y + .5, kit: (STAFF[key] || STAFF.office)[0] }); I.blocked.add(y * N + x); }
    if (ch === '?') I.citz.push([x + .5, y + .5]);
    if (ch === 'i') I.infos.push([x + .5, y + .5]);
    if (ch === 'o') I.obs.push([x + .5, y + .5]);
    if (ch === '$') I.caches.push({ x: x + .5, y: y + .5 });
    if (ch === '*') { const s = SECRETS[key] || SECRETS.office; I.secrets.push({ id: 'in:' + outW.did + ':' + key + ':' + idx, name: s[0], text: s[1], x: x + .5, y: y + .5 }); }
  }
  I.quiet = I.walk.slice();
  I.spawn = [I.door[0], I.door[1] - 1];
  I.walkable = (x, y) => at(x, y) === T.PLAZA && !I.blocked.has(y * N + x);
  I.drivable = () => false;
  I.ground = drawFloor(I);
  return I;
}

// ---------- art ----------
const FLOORS = { tile: ['#d9dde3', '#cfd4db'], carpet: ['#4b5d7a', '#46577a'], lino: ['#e4ddcf', '#d9d1c1'], marble: ['#efece6', '#e2ddd4'], wood: ['#b98a5e', '#ad7f55'], concrete: ['#a3a8ad', '#9ba0a5'], checker: ['#f2f2f2', '#2b2b2b'] };
function drawFloor(I) {
  const pad = 80, c = document.createElement('canvas'); c.width = N * TW + pad * 2; c.height = N * TH + pad * 2;
  const g = c.getContext('2d'), ox = N * TW / 2 + pad, oy = pad, F = FLOORS[I.floor] || FLOORS.tile;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const v = I.at(x, y); if (!v) continue;
    const [sx, sy] = iso(x, y); const X = sx + ox, Y = sy + oy;
    g.beginPath(); g.moveTo(X, Y); g.lineTo(X + TW / 2, Y + TH / 2); g.lineTo(X, Y + TH); g.lineTo(X - TW / 2, Y + TH / 2); g.closePath();
    g.fillStyle = v === T.BLDG ? '#2a2f38' : I.floor === 'wood' ? (y % 2 ? F[0] : F[1]) : F[(x + y) % 2]; g.fill();
    if (I.floor === 'wood' && v !== T.BLDG) { g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 1; g.stroke(); }
    if (I.floor === 'carpet' && v !== T.BLDG && (x * 7 + y * 3) % 5 === 0) { g.fillStyle = 'rgba(255,255,255,.04)'; g.fill(); }
  }
  // soft light pools from the ceiling
  for (let y = I.oy + 2; y < I.oy + I.h - 1; y += 4) for (let x = I.ox + 2; x < I.ox + I.w - 1; x += 4) { const [sx, sy] = iso(x, y); const gr = g.createRadialGradient(sx + ox, sy + oy + TH / 2, 0, sx + ox, sy + oy + TH / 2, 90); gr.addColorStop(0, 'rgba(255,240,200,.16)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(sx + ox - 90, sy + oy - 74, 180, 180); }
  return { canvas: c, ox, oy };
}
const sh = (hex, f) => { const n = parseInt(hex.slice(1), 16); const r = Math.min(255, Math.round((n >> 16) * f)), gg = Math.min(255, Math.round(((n >> 8) & 255) * f)), b = Math.min(255, Math.round((n & 255) * f)); return 'rgb(' + r + ',' + gg + ',' + b + ')'; };
// an iso box on a tile: a and b are half-sizes in tiles along x and y, h is height in pixels
function prism(g, sx, sy, a, b, h, col, lift) {
  const X = [TW / 2, TH / 2], Y = [-TW / 2, TH / 2], up = lift || 0, pt = (u, v, z) => [sx + X[0] * u + Y[0] * v, sy + X[1] * u + Y[1] * v - z - up];
  const poly = (ps, f) => { g.beginPath(); ps.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = f; g.fill(); };
  poly([pt(-a, b, 0), pt(a, b, 0), pt(a, b, h), pt(-a, b, h)], sh(col, .78));
  poly([pt(a, -b, 0), pt(a, b, 0), pt(a, b, h), pt(a, -b, h)], sh(col, .64));
  poly([pt(-a, -b, h), pt(a, -b, h), pt(a, b, h), pt(-a, b, h)], col);
  return pt;
}
const shadow = (g, sx, sy, r) => { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(sx + 2, sy + 2, r, r / 2, 0, 0, Math.PI * 2); g.fill(); };
export function drawFurn(g, p, sx, sy, t, wallCol) {
  const k = p.k;
  switch (k) {
    case 'wall': prism(g, sx, sy, .5, .5, p.front ? 8 : 58, wallCol || '#7b8794'); return;
    case 'W': { prism(g, sx, sy, .5, .5, 58, wallCol || '#7b8794'); const pt = (u, v, z) => [sx + TW / 2 * u - TW / 2 * v, sy + TH / 2 * u + TH / 2 * v - z]; const q = [pt(-.4, .5, 18), pt(.4, .5, 18), pt(.4, .5, 46), pt(-.4, .5, 46)]; g.fillStyle = '#1f4d3a'; g.beginPath(); q.forEach((p2, i) => (i ? g.lineTo(p2[0], p2[1]) : g.moveTo(p2[0], p2[1]))); g.closePath(); g.fill(); return; }
    case 'v': prism(g, sx, sy, .5, .5, 58, '#8e979f'); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(sx, sy - 30, 6, 0, Math.PI * 2); g.fill(); return;
    case 'U': prism(g, sx, sy, .5, .5, 58, wallCol || '#7b8794'); { const pt = (u, v, z) => [sx + TW / 2 * u - TW / 2 * v, sy + TH / 2 * u + TH / 2 * v - z]; g.fillStyle = '#e2742b'; g.beginPath(); [pt(-.38, .5, 0), pt(.38, .5, 0), pt(.38, .5, 34), pt(-.38, .5, 34)].forEach((p2, i) => (i ? g.lineTo(p2[0], p2[1]) : g.moveTo(p2[0], p2[1]))); g.closePath(); g.fill(); } return;
    case 'door': g.fillStyle = 'rgba(245,184,0,.25)'; g.beginPath(); g.ellipse(sx, sy + TH / 2, 22, 10, 0, 0, Math.PI * 2); g.fill(); return;
    case 'L': shadow(g, sx, sy, 14); prism(g, sx, sy, .42, .3, 42, '#5d6d7e'); g.strokeStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(sx, sy - 4); g.lineTo(sx, sy - 40); g.stroke(); return;
    case 'k': shadow(g, sx, sy, 14); prism(g, sx, sy, .45, .32, 15, '#6b5a48'); { const pt = prism(g, sx, sy, .16, .05, 13, '#1f2937', 15); const s0 = pt(-.13, .06, 3), s1 = pt(.13, .06, 11); g.fillStyle = Math.floor(t / 1500 + sx) % 3 ? '#38bdf8' : '#22c55e'; g.fillRect(s0[0], s1[1], s1[0] - s0[0], s0[1] - s1[1]); } return;
    case 'd': shadow(g, sx, sy, 14); prism(g, sx, sy, .45, .32, 15, '#8b6b4a'); g.fillStyle = '#f2f2f2'; g.fillRect(sx - 5, sy - 19, 8, 4); return;
    case 'h': case 'j': prism(g, sx, sy, .16, .16, 8, k === 'j' ? '#7a4a2a' : '#374151'); prism(g, sx - 3, sy - 2, .16, .04, 18, k === 'j' ? '#7a4a2a' : '#374151'); return;
    case 'T': shadow(g, sx, sy, 16); prism(g, sx, sy, .42, .42, 14, '#9a7552'); return;
    case 'c': prism(g, sx, sy, .5, .4, 18, '#c9b79c'); prism(g, sx, sy, .5, .42, 2, '#e8dcc6', 18); return;
    case 's': shadow(g, sx, sy, 14); prism(g, sx, sy, .45, .28, 32, '#8a8f96'); ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#9b59b6'].forEach((cc, i) => { g.fillStyle = cc; g.fillRect(sx - 12 + i * 5, sy - 14 - (i % 2) * 10, 3, 5); }); return;
    case 'F': prism(g, sx, sy, .45, .35, 40, '#dfe7ee'); { const pt = (u, v, z) => [sx + TW / 2 * u - TW / 2 * v, sy + TH / 2 * u + TH / 2 * v - z]; g.fillStyle = 'rgba(125,211,252,.55)'; g.beginPath(); [pt(-.4, .35, 6), pt(.4, .35, 6), pt(.4, .35, 36), pt(-.4, .35, 36)].forEach((p2, i) => (i ? g.lineTo(p2[0], p2[1]) : g.moveTo(p2[0], p2[1]))); g.closePath(); g.fill(); } return;
    case 'X': prism(g, sx, sy, .45, .35, 14, '#5b4a3a'); prism(g, sx, sy, .42, .32, 6, 'rgba(180,220,255,.45)'.length ? '#a7c7dc' : '#a7c7dc', 14); g.fillStyle = '#f5b800'; g.fillRect(sx - 3, sy - 22, 3, 2); g.fillStyle = '#e5e7eb'; g.fillRect(sx + 4, sy - 20, 4, 2); return;
    case 'B': shadow(g, sx, sy, 16); prism(g, sx, sy, .45, .48, 10, '#e8e8f0'); prism(g, sx - 10, sy - 5, .14, .38, 4, '#ffffff', 10); prism(g, sx + 4, sy + 2, .25, .44, 2, '#5b7fbf', 10); return;
    case 'p': prism(g, sx, sy, .5, .18, 10, '#7a4a2a'); prism(g, sx + 3, sy - 2, .5, .04, 22, '#6a3e22'); return;
    case 'r': shadow(g, sx, sy, 16); prism(g, sx, sy, .48, .32, 52, '#3d5a80'); [14, 30, 46].forEach((z) => prism(g, sx, sy, .4, .26, 8, ['#b08850', '#c19a6b', '#a07a48'][z % 3], z - 8)); return;
    case 'x': shadow(g, sx, sy, 12); prism(g, sx, sy, .36, .36, 22, '#b08850'); g.strokeStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.moveTo(sx - 10, sy - 6); g.lineTo(sx + 10, sy - 18); g.stroke(); return;
    case 'C': g.strokeStyle = '#4b5563'; g.lineWidth = 2; for (let i = -3; i <= 3; i++) { const a = [sx + i * 4.5, sy + i * 2.2 + 8]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[0], a[1] - 46); g.stroke(); } g.fillStyle = '#4b5563'; g.fillRect(sx - 15, sy - 44, 30, 3); return;
    case 'S': g.fillStyle = '#c0392b'; g.beginPath(); g.ellipse(sx, sy - 10, 6, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#9ca3af'; g.fillRect(sx - 1, sy - 10, 2, 10); return;
    case 'b': prism(g, sx, sy, .45, .22, 10, '#b52a35'); prism(g, sx - 4, sy - 2, .45, .06, 24, '#9e2430'); return;
    case 'P': g.fillStyle = '#8b5a2b'; prism(g, sx, sy, .16, .16, 10, '#8b5a2b'); g.fillStyle = '#2f7a35'; [[-6, -16, 7], [5, -18, 7], [0, -24, 8]].forEach(([a, b, r]) => { g.beginPath(); g.arc(sx + a, sy + b, r, 0, Math.PI * 2); g.fill(); }); return;
    case 'u': shadow(g, sx, sy, 16); prism(g, sx, sy, .45, .3, 10, '#5b6b8a'); prism(g, sx - 4, sy - 2, .45, .07, 20, '#4b5a78'); return;
    case 'V': prism(g, sx, sy, .3, .12, 10, '#3a2a1a'); prism(g, sx, sy, .34, .03, 22, '#111827', 10); g.fillStyle = Math.floor(t / 900) % 2 ? '#2563eb' : '#7c3aed'; g.fillRect(sx - 9, sy - 28, 16, 9); return;
    case 'J': prism(g, sx, sy, .5, .45, 28, '#6b4226'); prism(g, sx, sy, .52, .47, 3, '#8b5a2b', 28); return;
    case 'R': prism(g, sx, sy, .5, .07, 12, '#8b5a2b'); return;
    case 'a': prism(g, sx, sy, .48, .3, 14, '#efe8da'); g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(sx - 6, sy - 22, 2.5, 0, Math.PI * 2); g.arc(sx + 6, sy - 22, 2.5, 0, Math.PI * 2); g.fill(); return;
    case 'M': prism(g, sx, sy, .45, .2, 28, '#9aa3ad'); g.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.fillRect(sx - 12 + i * 8, sy - 22 + j * 8 + i * 4, 5, 3); return;
    case 'K': shadow(g, sx, sy, 14); prism(g, sx, sy, .3, .22, 14, '#f5b800'); prism(g, sx + 9, sy - 4, .05, .2, 40, '#374151'); prism(g, sx - 3, sy - 1, .18, .14, 12, '#222', 14); return;
    case 'E': drawProp(g, { t: 'firetruck' }, sx, sy, t, false); return;
    case 'A': prism(g, sx, sy, .1, .5, 18, '#6b7280'); vehicle(g, sx, sy - 18, 0, { kind: 'sedan', body: ['#c0392b', '#2980b9', '#7f8c8d'][Math.floor(sx) % 3], side: '#555', scale: 1 }, t, false, false); return;
    case 'Z': for (let i = 0; i < 4; i++) prism(g, sx + i * 3, sy - i * 1.5, .45 - i * .08, .45, 8 + i * 8, '#8f7c68'); return;
  }
}
export function staffDraw(g, s, t) { const [sx, sy] = iso(s.x, s.y); person(g, sx, sy, { kit: s.kit, skin: s.skin || '#c68e63', moving: false, face: -1 }, t); }
