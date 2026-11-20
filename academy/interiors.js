// Interiors: every enterable building has its own floor plan, drawn as a tiny map.
// Legend:  # wall   . floor   D exit door (bottom wall)   W wall with a board/screen
//   L locker  k computer desk  d desk  h chair  T table  c counter  s shelf  F cooler  X display case
//   v vault wall  B bed  p pew  r rack  x crate  C cell bars  S stool  b booth seat  P plant  u couch  V tv
//   J judge's bench  R railing  a altar  M mailboxes  K forklift  E fire engine  A car on a lift  U storage door  Z stairs
//   @ staff  ? citizen with a question  i study point  * secret spot  $ lost & found  o something's off
import { N, TW, TH, T, iso, person, drawProp, vehicle, hiCanvas, GRES } from './world.js';

const PLANS = {
  hq: { name: 'Patrol HQ', floor: 'tile', floor2: 'carpet', rug: '#1f3a6b', wall: '#3d4f7a', blurb: 'Locker room, the roll call briefing room, the watch commander\'s office and the front desk.', plan: [
    '##6###3##9999##1##',
    '#LLLLL#zhhhhh#dd&#',
    '#.....#.hhhhh#.@.#',
    '#==.*.#......#H.H#',
    '#.....#..i...#...#',
    '###_#####_####_###',
    '#................#',
    '#P.ccc@ccc....NQO#',
    '#........:::::..y#',
    '#.==.."..:::::...#',
    '#.......?:::::..$#',
    '#P.............P.#',
    '########D#########'] },
  substation: { name: 'District Substation', floor: 'tile', floor2: 'carpet', rug: '#1f3a6b', wall: '#3d4f7a', blurb: 'Locker room, the report room and a break room coffee maker with a long history.', plan: [
    '###1##6##9999###',
    '#LLLL#kk.kk#QO.#',
    '#....#.....#...#',
    '#=*..#..@..#t..#',
    '#....#.i...#N..#',
    '##_###_#####_###',
    '#..............#',
    '#P..cc@cc....=.#',
    '#.......?....=P#',
    '#..."......$...#',
    '#######D########'] },
  dispatch: { name: 'Dispatch Center', floor: 'carpet', floor2: 'lino', rug: '#334155', wall: '#5b6b80', blurb: 'The console floor under the big screens, plus a break room for the calm voices that send you everywhere.', plan: [
    '##555555555555####',
    '#k.k.k.k.k.k.k.k.#',
    '#................#',
    '#k.k.k.@.k.k.k.k.#',
    '#................#',
    '#######_##########',
    '#,,,,,,,,#QNO..*.#',
    '#,tt,,tt,#.......#',
    '#,,,,i,,,#..T....#',
    '#,,?,,,,,_..h....#',
    '#P,,,,,,,#P...."P#',
    '####D#############'] },
  records: { name: 'Records · FCIC Terminal', floor: 'lino', rug: '#475569', wall: '#7b8794', blurb: 'Rows of files, the records counter and the terminal everyone fights over.', plan: [
    '###1###6####1###',
    '#HHHH.HHHH.ssss#',
    '#..............#',
    '#ssss.ssss.ssss#',
    '#.......*......#',
    '#ssss.ssss.ssss#',
    '#..@......@....#',
    '#cccc..ccck..Y.#',
    '#....?.....i...#',
    '#.::::::..=="..#',
    '#P.::::::.....P#',
    '#######D########'] },
  bank: { name: 'Bank', floor: 'marble', floor2: 'carpet', rug: '#7f1d1d', wall: '#b5a98f', blurb: 'Teller line, private offices, the ATMs and a vault door someone left open.', plan: [
    '##2###6####2###3##',
    '#vvvvvv#.d.....d.#',
    '#v,,,$v#.h..&..h.#',
    '#v,*,,v#.........#',
    '#vvv_vv#..@...@..#',
    '#.......cccccccc.#',
    '#................#',
    '#.%%%%%%...I.I...#',
    '#..."......::::..#',
    '#.==...?...::::.P#',
    '#P.....i........P#',
    '########D#########'] },
  diner: { name: 'Diner', floor: 'checker', floor2: 'tile', rug: '#b91c1c', wall: '#c2410c', blurb: 'Booths, a long counter, a jukebox and coffee that has seen things.', plan: [
    '##777###1###1###1#',
    '#Fgg.wF#Q...@...~#',
    '#,,,@,,_.........#',
    '#,,,*,,#cccccccc.#',
    '########SSSSSSSS.#',
    '#................#',
    '#bTb..bTb..tSS...#',
    '#................#',
    '#bTb..bTb..t.."..#',
    '#.....?....i.....#',
    '#P..............P#',
    '########D#########'] },
  store: { name: 'Store', floor: 'lino', rug: '#334155', wall: '#8a7f6a', blurb: 'Aisles, coolers, the register and a clerk who has heard every excuse.', plan: [
    '##1##8888##1##3#',
    '#FFFFFF.FFFFF.*#',
    '#..............#',
    '#.ss.ss.ss.ss..#',
    '#.ss.ss.ss.ss..#',
    '#..............#',
    '#.ss.ss.ss.ss.N#',
    '#.ss.ss.ss.ss.N#',
    '#....".....?...#',
    '#qq@q...i....yP#',
    '#..............#',
    '#######D########'] },
  gas: { name: 'Gas Station', floor: 'lino', rug: '#334155', wall: '#b91c1c', blurb: 'Hot dogs of uncertain age, the coffee bar, coolers and the lottery line.', plan: [
    '##1##7777##1##3#',
    '#FFFFFFFFF.QQ.*#',
    '#..............#',
    '#.ss.ss.ss..N..#',
    '#.ss.ss.ss..N..#',
    '#..........."..#',
    '#qqgq.....?....#',
    '#.@.........i.P#',
    '#..............#',
    '#P............P#',
    '#######D########'] },
  pawn: { name: 'Pawn Shop', floor: 'wood', rug: '#7c2d12', wall: '#5b4a3a', blurb: 'Guitars on the wall, glass cases of everything and the pawn log by the register.', plan: [
    '##2##8888##2##3#',
    '#rrrrr.rrrrr.*.#',
    '#..............#',
    '#.XXX..XXX..XX.#',
    '#..............#',
    '#.XXX..XXX..XX.#',
    '#..............#',
    '#XXcc.@cccXX.H.#',
    '#..?.....i.....#',
    '#.::::::..."...#',
    '#P....y.......P#',
    '#######D########'] },
  motel: { name: 'Motel', floor: 'carpet', floor2: 'tile', rug: '#9a3412', wall: '#c08a5e', blurb: 'Front desk, a hallway and three rooms with very loud air conditioners.', plan: [
    '#1#2##1#2##1#2####',
    '#Bn.V#Bn.V#Bn.V*.#',
    '#B..e#B..e#B.....#',
    '#:::w#:::w#:::w..#',
    '##_####_####_#####',
    '#................#',
    '#.@.....?..N.O...#',
    '#qqqq.......==..P#',
    '#...i..:::::.."..#',
    '#P...$.:::::....P#',
    '########D#########'] },
  autoshop: { name: 'Auto Shop', floor: 'concrete', floor2: 'lino', rug: '#334155', wall: '#7f8a94', blurb: 'Two lifts, a wall of tools, the parts counter and a waiting room with terrible coffee.', plan: [
    '##1###1###4###3###',
    '#rrrrrr..rrrrrr.*#',
    '#................#',
    '#..A......A......#',
    '#................#',
    '#..xx.....@......#',
    '#................#',
    '####_#############',
    '#,,,,,,qq@q,NQO,P#',
    '#,==,,,i,,,",,,,?#',
    '#P,,,,,,,,,,,,,,P#',
    '########D#########'] },
  firestation: { name: 'Fire Station', floor: 'concrete', floor2: 'tile', rug: '#7f1d1d', wall: '#b5302b', blurb: 'The engine bay, turnout gear, the bunk room and a kitchen that out-cooks yours.', plan: [
    '#1##6##3###4##1##1##',
    '#GGGGGG........LLLL#',
    '#..................#',
    '#..E.......E.......#',
    '#..................#',
    '#..................#',
    '#........@.........#',
    '#####_#######_######',
    '#,,,,,,,,,#uu.uu.uu#',
    '#gwwF,,tt,#........#',
    '#,,,,,?,,,#..*..ee.#',
    '#P,i,,,,,,_.......P#',
    '####D###############'] },
  church: { name: 'Church', floor: 'wood', floor2: 'tile', rug: '#7f1d1d', wall: '#d8d0bf', blurb: 'The sanctuary, an organ, quiet pews and a food pantry by the side door.', plan: [
    '##1##1#2#1##1###',
    '#^..&.aaa.&...P#',
    '#.....z.@......#',
    '#..............#',
    '#pppppp.pppppp.#',
    '#..............#',
    '#pppppp.pppppp.#',
    '#......:.......#',
    '#pppppp:pppppp.#',
    '#......:.."....#',
    '##_####:###_####',
    '#x.s.#.i.:#.s*s#',
    '#xx..#?..:#...P#',
    '#########D######'] },
  school: { name: 'School', floor: 'lino', floor2: 'carpet', rug: '#1e3a8a', wall: '#a65a42', blurb: 'A classroom, the library corner, the front office and a hallway of lockers.', plan: [
    '#1#99999999#1#3##1##',
    '#..d.......#[[[[.*.#',
    '#..........#.......#',
    '#hd.hd.hd..#..t.t..#',
    '#..........#.......#',
    '#hd.hd.hd..#.ee..P.#',
    '#..........#.......#',
    '#hd.hd.hd..#H.cc@cc#',
    '#####_#######_######',
    '#..................#',
    '#LLLLLL..i..?..LLLL#',
    '#P....."..........P#',
    '#########D##########'] },
  apartments: { name: 'Apartments', floor: 'carpet', floor2: 'tile', rug: '#78350f', wall: '#8f7c68', blurb: 'The lobby, mailboxes, stairs and a hallway of doors with stories behind them.', plan: [
    '##U##U##U##U####',
    '#..............#',
    '#.P....*....P..#',
    '#######..#######',
    '#MMMM....:::.ZZ#',
    '#.......@:::...#',
    '#.==....?:::.i.#',
    '#P...."......yP#',
    '#######D########'] },
  houses: { name: 'Residence', floor: 'wood', floor2: 'tile', rug: '#9a3412', wall: '#c9b48f', blurb: 'Living room, kitchen, den and a bedroom down the hall.', plan: [
    '##1##2###1##1###',
    '#Bn.#gwwF.#.V..#',
    '#B..#.....#.e..#',
    '#:*:#tt...#.e..#',
    '##_####_###_####',
    '#..............#',
    '#.eee..:::::.V.#',
    '#......:::::...#',
    '#.l..i.:::::.?.#',
    '#P....@.......P#',
    '########D#######'] },
  warehouse: { name: 'Warehouse', floor: 'concrete', floor2: 'lino', rug: '#334155', wall: '#8f9aa4', blurb: 'Tall racks, blind corners, a forklift named Gerald and a small office. Search it like the book says.', plan: [
    '#1###4####3####1####',
    '#rrrr.rrrr.rrrr.*..#',
    '#..................#',
    '#rrrr.rrrr.rrrr.xx.#',
    '#........!.........#',
    '#rrrr.rrrr.rrrr.x..#',
    '#..................#',
    '#rrrr.rrrr.rrrr..K.#',
    '#..................#',
    '#xxx..xx......$....#',
    '###########_########',
    '#H.d...@...,i,.....#',
    '#H.h......?......QO#',
    '#####D##############'] },
  storage: { name: 'Storage Office', floor: 'concrete', floor2: 'lino', rug: '#334155', wall: '#c56a2b', blurb: 'The rental counter and a corridor of roll-up doors.', plan: [
    '##UUUU##UUUU##3#',
    '#..............#',
    '#UUUU.!..UUUU*.#',
    '#..............#',
    '#UUUU....UUUU..#',
    '#..............#',
    '######_#########',
    '#qq@q,,,,,,N,O,#',
    '#,,,,,,i,,,?,,P#',
    '#P,,,,,,,,,,,,,#',
    '#####D##########'] },
  courthouse: { name: 'Courthouse', floor: 'marble', floor2: 'carpet', rug: '#7f1d1d', wall: '#cfc6b2', blurb: 'Courtroom 2A: the bench, the jury box, counsel tables and the gallery.', plan: [
    '#6###2###6666###2#3#',
    '#...&..JJJJJJ..&...#',
    '#........@.........#',
    '#jjj.....z.....H.*.#',
    '#jjj...............#',
    '#jjj..TTT....TTT...#',
    '#.....hhh....hhh...#',
    '#RRRRRRRR..RRRRRRRR#',
    '#..................#',
    '#pppppppp..pppppppp#',
    '#........::........#',
    '#pppppppp::pppppppp#',
    '#...."...::..i..?..#',
    '#########D##########'] },
  jail: { name: 'County Jail · Booking', floor: 'concrete', floor2: 'lino', rug: '#334155', wall: '#9a958a', blurb: 'Holding cells, the property room and the booking counter.', plan: [
    '#3###4####6####8####',
    '#C.=C#C.=C#C.=C#H*H#',
    '#C..C#C..C#C..C#...#',
    '#CC_C#CC_C#CC_C#...#',
    '#..................#',
    '#...!.........."...#',
    '#ccccccc.@cc.Y..k..#',
    '#........,,,,,,,,,,#',
    '#..==....,,,,i,,?,,#',
    '#P.......,,,,,,,,,P#',
    '#########D##########'] },
  office: { name: 'Office', floor: 'carpet', floor2: 'tile', rug: '#1e3a8a', wall: '#7b8794', blurb: 'A private office, an open office and a waiting area with very old magazines.', plan: [
    '##1##2##4##1##3#',
    '#HH.d.#..d.HH*.#',
    '#...h.#..h.....#',
    '#.....#..@.....#',
    '###_###........#',
    '#..............#',
    '#.Y..dk...dk...#',
    '#....h....h..O.#',
    '#===..?..i...".#',
    '#P.:::::......P#',
    '#######D########'] },
  tower: { name: 'Office Tower Lobby', floor: 'marble', rug: '#1e293b', wall: '#6f8299', blurb: 'Elevators, the security desk and a lobby with a fake ficus.', plan: [
    '##U##U##U####6##3#',
    '#................#',
    '#.P....&..&....P.#',
    '#................#',
    '#.....qqqqqq...*.#',
    '#......@..@......#',
    '#.%%%%......%%%%.#',
    '#................#',
    '#.==..:::::...==.#',
    '#..i..:::::..?.".#',
    '#P..............P#',
    '########D#########'] },
  cafe: { name: 'Café', floor: 'wood', floor2: 'tile', rug: '#78350f', wall: '#6b4226', blurb: 'Espresso machines, a pastry case, comfy couches and a bar along the window.', plan: [
    '##7777##2##1##1#',
    '#QQgFw.#.e..e.*#',
    '#..@...#.:::...#',
    '#ccccc.#.:::.l.#',
    '#..............#',
    '#.t.t.t..SSSS..#',
    '#..............#',
    '#.t.t."..i..?..#',
    '#P............P#',
    '#######D########'] },
  barber: { name: 'Barbershop', floor: 'checker', rug: '#1f2937', wall: '#1e3a8a', blurb: 'Four chairs, a wall of mirrors and the best gossip in the district.', plan: [
    '##2##2##8##3##',
    '#w.w.w.w..H*.#',
    '#m.m.m.m.....#',
    '#..@...@.....#',
    '#............#',
    '#.====..qq...#',
    '#......"...i.#',
    '#.ee..?......#',
    '#P..........P#',
    '######D#######'] },
  books: { name: 'Bookstore', floor: 'wood', rug: '#14532d', wall: '#5b4a3a', blurb: 'Shelves to the ceiling, a reading nook and a cat who judges your choices.', plan: [
    '##2##1###1##2###',
    '#[[[[.[[[[.[[*.#',
    '#..............#',
    '#.[[.[[.[[.[[..#',
    '#.[[.[[.[[.[[..#',
    '#..............#',
    '#.ee..:::.tS...#',
    '#.l...:::.."...#',
    '#qq@...i....?.P#',
    '#P.............#',
    '#######D########'] },
  pizza: { name: 'Pizzeria', floor: 'checker', floor2: 'tile', rug: '#991b1b', wall: '#166534', blurb: 'Brick ovens, red booths and a jukebox stuck on one song.', plan: [
    '##7777##1##2##1#',
    '#gggF.ww#..~..*#',
    '#..@....#......#',
    '#cccq.@.#bTb.N.#',
    '#..............#',
    '#.t..t..bTb.bTb#',
    '#..............#',
    '#.t..t."..i..?.#',
    '#P............P#',
    '#######D########'] },
  library: { name: 'Library', floor: 'carpet', floor2: 'wood', rug: '#7f1d1d', wall: '#8b7355', blurb: 'Stacks, study tables, public computers and a circulation desk ruled with quiet authority.', plan: [
    '#1##1##6##3##1##1###',
    '#[[[[[.[[[[[.[[[[[.#',
    '#..................#',
    '#[[[[[.[[[[[.[[[[[.#',
    '#..................#',
    '#[[[[[.[[[[[.....*.#',
    '#..................#',
    '#.TTT.TTT...kk.kk..#',
    '#.hhh.hhh..........#',
    '#.......i.......l..#',
    '#qqqq@qq...::::..".#',
    '#.......?..::::....#',
    '#P.ee............P.#',
    '#########D##########'] },
  transit: { name: 'Transit Center', floor: 'tile', rug: '#1e293b', wall: '#64748b', blurb: 'Departure boards, rows of benches and a ticket window with a long line.', plan: [
    '#55555##3##8888##1##',
    '#..................#',
    '#.====..====..====.#',
    '#..................#',
    '#.====..====..====.#',
    '#..................#',
    '#.NN.O..qq@qq...*..#',
    '#........!.........#',
    '#..i....."....?....#',
    '#P..y..........y..P#',
    '#########D##########'] },
  clinic: { name: 'Clinic', floor: 'tile', floor2: 'lino', rug: '#0e7490', wall: '#94a3b8', blurb: 'Two exam rooms, the doctor\'s office, the front desk and a very quiet waiting room.', plan: [
    '##3##2##6##2##1###',
    '#B.w#B.w#H.k.d.*.#',
    '#B..#B..#...h....#',
    '#.:.#.:.#........#',
    '##_###_###_#######',
    '#................#',
    '#qqqq@qq....O.Q..#',
    '#................#',
    '#.===.===...e.e..#',
    '#.."...?...i.....#',
    '#P...:::::.....P.#',
    '########D#########'] },
  laundromat: { name: 'Laundromat', floor: 'lino', rug: '#334155', wall: '#0e7490', blurb: 'Rows of washers and dryers, a folding table and machine seven, the quarter-eater.', plan: [
    '##1##4##1##3##1#',
    '#ffffffffff.N.*#',
    '#..............#',
    '#.ffff..ffff...#',
    '#.ffff..ffff...#',
    '#..............#',
    '#.TTT..====..O.#',
    '#.."..?....i...#',
    '#qq@.........yP#',
    '#######D########'] },
  salon: { name: 'Nail Salon', floor: 'tile', rug: '#9d174d', wall: '#db2777', blurb: 'Manicure tables, pedicure chairs and a wall of a thousand polish colors.', plan: [
    '##2##8##2##1##',
    '#T.T.T.T..H*.#',
    '#h@h.h.h.....#',
    '#............#',
    '#m.m.m...ww..#',
    '#............#',
    '#.eee..qq....#',
    '#..."..?..i..#',
    '#P..........P#',
    '######D#######'] },
  gym: { name: 'Boxing Gym', floor: 'concrete', rug: '#1d4ed8', wall: '#7a2e2e', blurb: 'The ring, heavy bags, a weight rack and a coach who sees everything.', plan: [
    '#4##2##8888##3##2###',
    '#WWWW..o.o.o..LLLL.#',
    '#..................#',
    '#..RRRRRRRRR.......#',
    '#..R:::::::R...*...#',
    '#..R:::@:::R.......#',
    '#..R:::::::R.......#',
    '#..RRRR_RRRR.......#',
    '#..................#',
    '#.o.o.o....=====...#',
    '#.."..i....?...O.N.#',
    '#P................P#',
    '#########D##########'] },
  center: { name: 'Community Center', floor: 'wood', floor2: 'lino', rug: '#166534', wall: '#b0703f', blurb: 'The game room, a big hall with folding tables and a kitchen that runs on volunteers.', plan: [
    '#1##4##2##9999##1###',
    '#{..{..#.T.T.T.T.*.#',
    '#......#.h.h.h.h...#',
    '#......_...........#',
    '#..V...#.T.T.T.T...#',
    '#.ee...#.h.h.h.h...#',
    '####_###...........#',
    '#..................#',
    '#gwwF..@...::::....#',
    '#cccc......::::..N.#',
    '#..i..?..."........#',
    '#P................P#',
    '#########D##########'] },
  marina: { name: 'Marina & Bait', floor: 'wood', rug: '#0369a1', wall: '#0e7490', blurb: 'Tackle on the walls, live bait tanks, coolers and fishing stories of questionable accuracy.', plan: [
    '##1##8##1##2##1#',
    '#rrrr.FFFF..ss*#',
    '#..............#',
    '#.ss.ss.xx.xx..#',
    '#..............#',
    '#.XXX.......e..#',
    '#..............#',
    '#qq@q...."..?..#',
    '#P....i.......P#',
    '#######D########'] },
  truckstop: { name: 'Truck Stop', floor: 'lino', floor2: 'checker', rug: '#1e3a8a', wall: '#2563eb', blurb: 'A grill counter, booths, a convenience store and coffee strong enough to drive on.', plan: [
    '#7777##1##1##888##3#',
    '#gggww.F#FFFFFF.QQ.#',
    '#..@...._........*.#',
    '#cccccc.#.ss.ss.ss.#',
    '#SSSSSS..........N.#',
    '#..................#',
    '#bTb.bTb...ss.ss...#',
    '#..................#',
    '#bTb.bTb..qq@qq..y.#',
    '#..."...i.....?....#',
    '#P................P#',
    '#########D##########'] }
};
// building kinds that can be entered and which plan they use
export const ENTER = { hq: 'hq', substation: 'substation', dispatch: 'dispatch', records: 'records', bank: 'bank', diner: 'diner', shop: 'store', pharmacy: 'store', mall: 'store', gas: 'gas', pawn: 'pawn', motel: 'motel', autoshop: 'autoshop', carwash: 'autoshop', firestation: 'firestation', church: 'church', school: 'school', apartments: 'apartments', houses: 'houses', warehouse: 'warehouse', lumber: 'warehouse', storage: 'storage', scrapyard: 'storage', courthouse: 'courthouse', jail: 'jail', sallyport: 'jail', bonds: 'office', defender: 'office', office: 'office', tower: 'tower',
  cafe: 'cafe', barber: 'barber', books: 'books', pizza: 'pizza', library: 'library', transit: 'transit', clinic: 'clinic', laundromat: 'laundromat', nails: 'salon', gym: 'gym', center: 'center', marina: 'marina', bait: 'marina', truckstop: 'truckstop' };

// staff: what they look like and what they say when you talk to them
const K = (shirt, pants, hat, extra) => Object.assign({ shirt, pants, hat: hat || 'none' }, extra || {});
const STAFF = {
  hq: [[K('#22355e', '#1b2a4a', 'cap', { hatCol: '#16213d', patch: '#f5b800' })], ['"Roll call is at 0545. That means 0530."', '"You call that a gig line? Fix it before the sergeant sees it."', '"Grab a radio, check your batteries, then check them again."', '"Shirt stays on? Boot bands on? Then why does your uniform look like that?"']],
  substation: [[K('#22355e', '#1b2a4a', 'cap', { hatCol: '#16213d', patch: '#f5b800' })], ['"The coffee maker was here before the building. Respect it."', '"Paperwork is due before end of watch. Ask me how I know."']],
  dispatch: [[K('#334155', '#1f2937', 'headset', { patch: '#9ca3af' })], ['"I hear everything. Yes, even that."', '"Clear and concise on the radio, cadet. Nobody needs the director\'s cut."', '"If you key up and say \'umm\' one more time..."']],
  records: [[K('#7c3aed', '#1f2937', 'none', { patch: '#ddd6fe', lanyard: '#7c3aed' })], ['"Confirm the hit before you act on it. Always."', '"The terminal is not for checking your ex. We log everything."', '"Forgot your RSA token? Then you forgot how to log in. Congratulations."']],
  bank: [[K('#e5e7eb', '#374151', 'none', { tie: '#1e3a8a', plain: true })], ['"Can I help you, officer? Oh, in training. Can I help you, almost-officer?"', '"The vault is on a time lock. So is my lunch break."']],
  diner: [[K('#f2f2f2', '#111', 'none', { patch: '#d22d3d', apron: '#ffffff' })], ['"Coffee? Of course coffee. Sit anywhere, hon."', '"The pie is fresh. The coffee is... present."', '"Third shift always tips the best. Don\'t ask me why."']],
  store: [[K('#1f7a5a', '#1f2937', 'cap', { hatCol: '#1f7a5a' })], ['"Restroom is for customers. You are a customer now. Buy gum."', '"That guy? He comes in every day and buys one banana."']],
  gas: [[K('#d22d3d', '#1f2937', 'cap', { hatCol: '#d22d3d' })], ['"Hot dogs are two for three. Their age is a mystery to us all."', '"Pump four only takes cash. It has opinions."']],
  pawn: [[K('#5b4a3a', '#1f2937')], ['"Everything we take in goes in the log. Serial numbers, photos, ID. All of it."', '"That guitar was Elvis\'s. Probably. Possibly. No."']],
  motel: [[K('#1f7a5a', '#1f2937')], ['"Room 12 again? I\'ll get the key."', '"The ice machine works. It just makes very small ice."']],
  autoshop: [[K('#3b5b7a', '#2a3a4a', 'cap', { hatCol: '#d22d3d' })], ['"Your patrol car makes a noise? They all make a noise."', '"Check your tire pressure before shift. Seriously."']],
  firestation: [[K('#1f2937', '#1f2937', 'none', { patch: '#d22d3d' })], ['"You hungry? We made chili. We always made chili."', '"Stage until we tell you it\'s safe. Then come get your report."']],
  church: [[K('#1f2937', '#1f2937', 'none', { patch: '#fff' })], ['"Our pantry is open Tuesdays. Send anyone who needs it."', '"You look tired, young one. There are cookies in the back."']],
  school: [[K('#7c3aed', '#374151', 'none', { lanyard: '#7c3aed' })], ['"Sign in at the front office, please. Yes, even you."', '"The kids want to know if you have a dog. The K9 cadets are very popular here."']],
  apartments: [[K('#4b5563', '#1f2937', 'cap', { hatCol: '#374151' })], ['"Building manager. I have a key for everything except my own office."', '"Mrs. Alvarez in 3C makes the best flan. That is not police business. Still true."']],
  houses: [[K('#c0392b', '#2c3e50')], ['"Thanks for stopping by, officer. Want some lemonade?"', '"The neighbor\'s dog is the real problem around here."']],
  warehouse: [[K('#f97316', '#1f2937', 'helmet', { hatCol: '#f5d000', vest: '#d4ff3a', vestText: '' })], ['"Key holder here. Alarm went off at the back door again."', '"Watch the forklift. It has the right of way and it knows it."']],
  storage: [[K('#c56a2b', '#1f2937', 'cap', { hatCol: '#c56a2b' })], ['"Unit 14 is paid up. Unit 15 smells weird. Not my business."']],
  courthouse: [[K('#111827', '#111827', 'none', { patch: '#f5b800' })], ['"All rise. Just kidding. Sit. Court\'s in recess."', '"Write your reports like a defense attorney will read them. Because one will."']],
  jail: [[K('#4b5563', '#1f2937', 'none', { patch: '#f5b800' })], ['"Search them before they come through my door. Every time."', '"Property bag sealed and inventoried, or I send you back out."']],
  office: [[K('#e5e7eb', '#374151', 'none', { tie: '#7f1d1d', plain: true })], ['"Take a number. We are currently serving number 3. Your number is 74."', '"Have a seat. The magazines are from 2009. Very vintage."']],
  tower: [[K('#111827', '#111827', 'cap', { hatCol: '#111827', patch: '#9ca3af' })], ['"Elevator three is haunted. Take two."', '"You need to sign in. Everyone signs in. Even the pizza guy."']],
  cafe: [[K('#6b4226', '#1f2937', 'none', { apron: '#1f2937' })], ['"One cop discount coffee, coming up. Cadets get the cadet discount: a smile."', '"Oat milk? Almond? Regular? Okay, regular. You look like a regular."']],
  barber: [[K('#111827', '#374151', 'none', { apron: '#e5e7eb' })], ['"High and tight? Academy cut? Say less."', '"Sit still. Last cadet flinched and now he has a part he did not ask for."', '"I hear everything in this chair. Everything."']],
  books: [[K('#14532d', '#374151', 'none', { lanyard: '#14532d' })], ['"Police procedurals are in the back. They get everything wrong. People love them."', '"Yes, the cat is for sale. No, not really. The cat owns the store."']],
  pizza: [[K('#f2f2f2', '#111', 'none', { apron: '#d22d3d' })], ['"Slice of Justice special: pepperoni, sausage and a side of due process."', '"We deliver to the substation. They tip in donuts. It is a fair trade."']],
  library: [[K('#7c3aed', '#374151', 'none', { lanyard: '#7c3aed' })], ['"Shh. Including your radio."', '"Your textbooks are due. Both of them. Do not make me come to the academy."']],
  transit: [[K('#1e3a8a', '#1f2937', 'cap', { hatCol: '#1e3a8a' })], ['"The 14 is late. The 14 is always late. The 14 has been late since 1997."', '"Lost and found has three umbrellas and one very confused parrot."']],
  clinic: [[K('#7dd3fc', '#7dd3fc', 'none', { lanyard: '#0e7490' })], ['"Sign in, please. Insurance card, ID, and a list of every way you hurt yourself at PT."', '"Hydrate, cadet. Your CamelBak should be full, not decorative."']],
  laundromat: [[K('#e5e7eb', '#374151', 'none')], ['"Machine seven eats quarters. Machine seven has always eaten quarters."', '"Somebody left a whole PT uniform in dryer three. Shirt, shorts, black ankle socks. Yours?"']],
  salon: [[K('#f9a8d4', '#374151', 'none', { apron: '#fff' })], ['"Short and clean for the academy, right? Regulation nails. I know the rules."', '"You need to relax, hon. Your shoulders are up by your ears."']],
  gym: [[K('#111827', '#d22d3d', 'none')], ['"Hands up! Chin down! Oh, you just came in to talk. Still: hands up."', '"Best fights are the ones you never have to throw a punch in."']],
  center: [[K('#166534', '#374151', 'cap', { hatCol: '#166534' })], ['"Free pizza Thursdays. Bring your class. Bring the K9."', '"We teach kids to play chess here. Some of them could teach your sergeant."']],
  marina: [[K('#556b2f', '#5d4037', 'cap', { hatCol: '#556b2f' })], ['"Live shrimp, cold drinks and the best fishing gossip on the river."', '"Biggest fish I ever caught? Still in the river. Out of respect."']],
  truckstop: [[K('#2563eb', '#1f2937', 'cap', { hatCol: '#f5b800' })], ['"Coffee is fresh every four hours whether it needs it or not."', '"Eleven states, one shower. Shower shoes required. Trust me."']]
};
const SECRETS = {
  hq: ['The Sergeant\'s Snack Drawer', 'Full of beef jerky and a note that says "I counted these."'],
  substation: ['The Lost Pen Graveyard', 'Under the report-room desk. Forty-one issued pens. None of them work.'],
  dispatch: ['The Calm Chair', 'Ergonomic, heated and legendary. Nobody else is allowed to sit in it.'],
  records: ['The Misfiled Box from 1998', 'Labeled "MISC (DO NOT OPEN)". You do not open it.'],
  bank: ['The Pen Chained to the Desk', 'Chained up for its own protection. It has escaped twice.'],
  diner: ['The Walk-In Cooler Mystery', 'A single pie labeled "SARGE. TOUCH IT AND DIE."'],
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
  tower: ['The Fake Ficus', 'Watered daily by the night guard. Out of respect.'],
  cafe: ['The Tip Jar Manifesto', 'A three-page essay taped to the tip jar about the meaning of foam.'],
  barber: ['The Wall of Bad Haircuts', 'Polaroids of every cadet who said "just a little off the top."'],
  books: ['The Cat\'s Throne', 'A cushion on top of the true crime shelf. Do not sit there.'],
  pizza: ['The Secret Menu', '"The Rookie": cheese, extra cheese, and a pep talk.'],
  library: ['The Highlighted Vehicle Operations Chapter', 'Every single line is yellow. A previous cadet was here.'],
  transit: ['The Lost Umbrella Pile', 'Forty-three umbrellas. It has never once rained in here.'],
  clinic: ['The Sticker Drawer', 'For brave patients. Every cadet who comes in leaves with a dinosaur sticker.'],
  laundromat: ['Machine Seven\'s Quarter Stash', 'Forty dollars in quarters behind the panel. Machine seven has been saving.'],
  salon: ['The Polish Wall', 'Nine hundred colors. Three of them are named after cops.'],
  gym: ['The Mouthguard Graveyard', 'A bucket labeled "LOST". You do not reach in.'],
  center: ['The Chess Trophy Case', 'A ten-year-old has beaten every officer in the district.'],
  marina: ['The Wall of Fish Lies', 'Photos of enormous fish. Several are clearly the same fish.'],
  truckstop: ['The Shower Shoe Hall of Fame', 'A shelf of abandoned shower shoes from all fifty states.']
};
export const STAFF_LINES = (k) => (STAFF[k] || STAFF.office)[1];

// furniture that blocks walking; anything else listed here can be walked over
const FURN = 'LkdhjTcsFXBprxCSbPeuVJRaMKEAZGHINOQYgltqwyz=%^&~fmWo[{n';
const SOFT = 'hjS';
const WALLS = '#123456789vU';
// ---------- building an interior as a small map ----------
export function buildInterior(lot, outW, idx) {
  const key = ENTER[lot.kind], pl = PLANS[key], rows = pl.plan, h = rows.length, w = rows[0].length;
  const ox = Math.floor((N - w) / 2), oy = Math.floor((N - h) / 2);
  const g = new Uint8Array(N * N), at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 0 : g[y * N + x]), set = (x, y, v) => { if (x >= 0 && y >= 0 && x < N && y < N) g[y * N + x] = v; };
  const I = { inside: true, key, kind: lot.kind, name: lot.name || pl.name, blurb: pl.blurb, did: outW.did, D: outW.D, g, at, set, buildings: [], props: [], lots: [], lights: [], parking: [], walk: [], quiet: [], gates: [], secrets: [], staff: [], visitors: [], citz: [], infos: [], obs: [], caches: [], river: false, blocked: new Set(), floor: pl.floor, floor2: pl.floor2 || pl.floor, rug: pl.rug || '#334155', wallCol: pl.wall, w, h, ox, oy, mat: {} };
  const ch = (c, r) => (r < 0 || c < 0 || r >= h || c >= w ? ' ' : rows[r][c]);
  const isWall = (c, r) => WALLS.indexOf(ch(c, r)) >= 0;
  const kits = (STAFF[key] || STAFF.office)[0];
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
    const k = ch(c, r), x = ox + c, y = oy + r;
    if (k === ' ') continue;
    if (WALLS.indexOf(k) >= 0) {
      set(x, y, T.BLDG);
      const front = r === h - 1 || c === w - 1, border = r === 0 || c === 0 || front;
      const face = !isWall(c, r + 1) && ch(c, r + 1) !== ' ' ? 'y' : !isWall(c + 1, r) && ch(c + 1, r) !== ' ' ? 'x' : null;
      I.props.push({ t: 'furn', k: k === '#' || /\d/.test(k) ? 'wall' : k, deco: /\d/.test(k) ? +k : 0, face, x: x + .5, y: y + .5, front, h: front ? 8 : border ? 64 : 46, wall: true, block: true });
      continue;
    }
    set(x, y, T.PLAZA);
    I.mat[y * N + x] = k === ',' ? 2 : k === ':' ? 3 : 1;
    if (k === 'D') { I.door = [x + .5, y + .5]; I.props.push({ t: 'furn', k: 'door', x: x + .5, y: y + .5 }); continue; }
    if (FURN.indexOf(k) >= 0) { I.props.push({ t: 'furn', k, x: x + .5, y: y + .5, block: SOFT.indexOf(k) < 0, seed: (c * 7 + r * 13) % 10 }); if (SOFT.indexOf(k) < 0) I.blocked.add(y * N + x); else I.walk.push([x, y]); continue; }
    I.walk.push([x, y]);
    if (k === '@') { I.staff.push({ x: x + .5, y: y + .5, kit: kits[I.staff.length % kits.length] }); I.blocked.add(y * N + x); }
    if (k === '"') { I.visitors.push({ x: x + .5, y: y + .5, seed: c * 31 + r * 17 }); I.blocked.add(y * N + x); }
    if (k === '?') I.citz.push([x + .5, y + .5]);
    if (k === 'i') I.infos.push([x + .5, y + .5]);
    if (k === '!') I.obs.push([x + .5, y + .5]);
    if (k === '$') I.caches.push({ x: x + .5, y: y + .5 });
    if (k === '*') { const s2 = SECRETS[key] || SECRETS.office; I.secrets.push({ id: 'in:' + outW.did + ':' + key + ':' + idx, name: s2[0], text: s2[1], x: x + .5, y: y + .5 }); }
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
  const pad = 80, x0 = I.ox - 1, y0 = I.oy - 1, x1 = I.ox + I.w, y1 = I.oy + I.h;
  const [c, g] = hiCanvas((x1 - x0 + y1 - y0 + 2) * TW / 2 + pad * 2, (x1 - x0 + y1 - y0 + 2) * TH / 2 + pad * 2, GRES), ox = -(x0 - y1 - 1) * TW / 2 + pad, oy = -(x0 + y0) * TH / 2 + pad;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const v = I.at(x, y); if (!v) continue;
    const [sx, sy] = iso(x, y); const X = sx + ox, Y = sy + oy, m = I.mat[y * N + x] || 1;
    const tile = () => { g.beginPath(); g.moveTo(X, Y); g.lineTo(X + TW / 2, Y + TH / 2); g.lineTo(X, Y + TH); g.lineTo(X - TW / 2, Y + TH / 2); g.closePath(); };
    tile();
    if (v === T.BLDG) { g.fillStyle = '#2a2f38'; g.fill(); continue; }
    const kind = m === 2 ? I.floor2 : I.floor, F = FLOORS[kind] || FLOORS.tile;
    g.fillStyle = kind === 'wood' ? (y % 2 ? F[0] : F[1]) : F[(x + y) % 2]; g.fill();
    if (kind === 'wood') { g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 1; g.stroke(); }
    if (kind === 'carpet' && (x * 7 + y * 3) % 5 === 0) { g.fillStyle = 'rgba(255,255,255,.04)'; g.fill(); }
    if (m === 3) { // rug: inset diamond with a border
      g.save(); g.translate(X, Y + TH / 2); g.scale(.92, .92); g.beginPath(); g.moveTo(0, -TH / 2); g.lineTo(TW / 2, 0); g.lineTo(0, TH / 2); g.lineTo(-TW / 2, 0); g.closePath(); g.fillStyle = I.rug; g.fill(); g.restore();
      const edge = (dx, dy) => (I.mat[(y + dy) * N + x + dx] !== 3);
      g.strokeStyle = 'rgba(245,184,0,.55)'; g.lineWidth = 2; g.beginPath();
      if (edge(0, -1)) { g.moveTo(X, Y + 2); g.lineTo(X + TW / 2 - 4, Y + TH / 2); } if (edge(1, 0)) { g.moveTo(X + TW / 2 - 4, Y + TH / 2); g.lineTo(X, Y + TH - 2); }
      if (edge(0, 1)) { g.moveTo(X, Y + TH - 2); g.lineTo(X - TW / 2 + 4, Y + TH / 2); } if (edge(-1, 0)) { g.moveTo(X - TW / 2 + 4, Y + TH / 2); g.lineTo(X, Y + 2); }
      g.stroke();
    }
    // soft contact shadow along walls
    if (I.at(x, y - 1) === T.BLDG) { g.fillStyle = 'rgba(0,0,0,.10)'; g.beginPath(); g.moveTo(X, Y); g.lineTo(X + TW / 2, Y + TH / 2); g.lineTo(X + TW / 2 - 8, Y + TH / 2 + 4); g.lineTo(X - 8, Y + 4); g.closePath(); g.fill(); }
    if (I.at(x - 1, y) === T.BLDG) { g.fillStyle = 'rgba(0,0,0,.10)'; g.beginPath(); g.moveTo(X, Y); g.lineTo(X - TW / 2, Y + TH / 2); g.lineTo(X - TW / 2 + 8, Y + TH / 2 + 4); g.lineTo(X + 8, Y + 4); g.closePath(); g.fill(); }
  }
  for (let y = I.oy + 2; y < I.oy + I.h - 1; y += 4) for (let x = I.ox + 2; x < I.ox + I.w - 1; x += 4) { const [sx, sy] = iso(x, y); const gr = g.createRadialGradient(sx + ox, sy + oy + TH / 2, 0, sx + ox, sy + oy + TH / 2, 90); gr.addColorStop(0, 'rgba(255,240,200,.16)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(sx + ox - 90, sy + oy - 74, 180, 180); }
  return { canvas: c, ox, oy };
}
const sh = (hex, f) => { if (hex[0] !== '#') return hex; const n = parseInt(hex.slice(1), 16); const r = Math.min(255, Math.round((n >> 16) * f)), gg = Math.min(255, Math.round(((n >> 8) & 255) * f)), b = Math.min(255, Math.round((n & 255) * f)); return 'rgb(' + r + ',' + gg + ',' + b + ')'; };
// an iso box on a tile: a and b are half-sizes in tiles along x and y, h is height in pixels; ox/oy shift it in tiles
function prism(g, sx, sy, a, b, h, col, lift, ox, oy) {
  const X = [TW / 2, TH / 2], Y = [-TW / 2, TH / 2], up = lift || 0, u0 = ox || 0, v0 = oy || 0, pt = (u, v, z) => [sx + X[0] * (u + u0) + Y[0] * (v + v0), sy + X[1] * (u + u0) + Y[1] * (v + v0) - z - up];
  const poly = (ps, f) => { g.beginPath(); ps.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = f; g.fill(); };
  poly([pt(-a, b, 0), pt(a, b, 0), pt(a, b, h), pt(-a, b, h)], sh(col, .78));
  poly([pt(a, -b, 0), pt(a, b, 0), pt(a, b, h), pt(a, -b, h)], sh(col, .64));
  poly([pt(-a, -b, h), pt(a, -b, h), pt(a, b, h), pt(-a, b, h)], col);
  return pt;
}
// a flat picture on a wall face ('y' faces south-west, 'x' faces south-east); u runs along the wall, z is height
function onFace(g, sx, sy, face, u0, u1, z0, z1, fill) {
  const pt = face === 'y' ? (u, z) => [sx + TW / 2 * u - TW / 2 * .5, sy + TH / 2 * u + TH / 2 * .5 - z] : (u, z) => [sx + TW / 2 * .5 - TW / 2 * u, sy + TH / 2 * .5 + TH / 2 * u - z];
  g.beginPath(); [pt(u0, z0), pt(u1, z0), pt(u1, z1), pt(u0, z1)].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = fill; g.fill();
}
const shadow = (g, sx, sy, r) => { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(sx + 2, sy + 2, r, r / 2, 0, 0, Math.PI * 2); g.fill(); };
const ART = ['#b45309', '#1d4ed8', '#047857', '#9d174d', '#7c3aed', '#0e7490'];
function deco(g, sx, sy, p, t) {
  const f = p.face; if (!f || p.front) return;
  switch (p.deco) {
    case 1: onFace(g, sx, sy, f, -.36, .36, 20, 50, '#cfe7f7'); onFace(g, sx, sy, f, -.36, .36, 33, 36, 'rgba(255,255,255,.6)'); onFace(g, sx, sy, f, -.02, .02, 20, 50, '#e5e7eb'); break;
    case 2: onFace(g, sx, sy, f, -.26, .26, 24, 46, '#6b4226'); onFace(g, sx, sy, f, -.21, .21, 27, 43, ART[(Math.round(sx) >> 3) % ART.length]); onFace(g, sx, sy, f, -.1, .14, 29, 37, 'rgba(255,255,255,.35)'); break;
    case 3: onFace(g, sx, sy, f, -.12, .12, 40, 52, '#f8fafc'); onFace(g, sx, sy, f, -.01, .01, 45, 51, '#111'); onFace(g, sx, sy, f, -.01, .08, 45, 46.5, '#111'); break;
    case 4: onFace(g, sx, sy, f, -.38, .38, 22, 48, '#b07a45'); [[-.3, -.1, 38, 46, '#fef3c7'], [-.05, .2, 34, 45, '#bfdbfe'], [.1, .32, 25, 33, '#fecaca'], [-.3, -.05, 25, 34, '#fff']].forEach((q) => onFace(g, sx, sy, f, q[0], q[1], q[2], q[3], q[4])); break;
    case 5: onFace(g, sx, sy, f, -.48, .48, 26, 54, '#0f172a'); onFace(g, sx, sy, f, -.44, .44, 28, 52, Math.floor(t / 2000 + sx) % 2 ? '#1e3a8a' : '#065f46'); onFace(g, sx, sy, f, -.36, .1, 44, 47, 'rgba(255,255,255,.55)'); onFace(g, sx, sy, f, -.36, .26, 36, 38, 'rgba(255,255,255,.35)'); break;
    case 6: onFace(g, sx, sy, f, -.2, .2, 30, 54, '#1e3a8a'); onFace(g, sx, sy, f, -.12, .12, 36, 48, '#f5b800'); break;
    case 7: onFace(g, sx, sy, f, -.48, .48, 34, 56, '#111827'); [38, 42, 46, 50].forEach((z) => onFace(g, sx, sy, f, -.4, .25, z, z + 1.6, '#fbbf24')); break;
    case 8: onFace(g, sx, sy, f, -.42, .42, 38, 50, '#f5b800'); onFace(g, sx, sy, f, -.36, .36, 40, 48, '#111827'); break;
    case 9: onFace(g, sx, sy, f, -.5, .5, 22, 50, '#f8fafc'); onFace(g, sx, sy, f, -.4, .1, 42, 43.5, '#1d4ed8'); onFace(g, sx, sy, f, -.4, .3, 36, 37.5, '#dc2626'); onFace(g, sx, sy, f, -.4, -.05, 30, 31.5, '#1d4ed8'); break;
  }
}
export function drawFurn(g, p, sx, sy, t, wallCol) {
  const k = p.k, wc = wallCol || '#7b8794';
  switch (k) {
    case 'wall': prism(g, sx, sy, .5, .5, p.h || 58, wc); if (p.h > 8) { prism(g, sx, sy, .5, .5, 3, sh(wc, 1.25), p.h); deco(g, sx, sy, p, t); } return;
    case 'v': prism(g, sx, sy, .5, .5, p.h || 58, '#8e979f'); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(sx, sy - 30, 6, 0, Math.PI * 2); g.fill(); return;
    case 'U': prism(g, sx, sy, .5, .5, p.h || 58, wc); if (p.face) { onFace(g, sx, sy, p.face, -.38, .38, 0, 36, '#e2742b'); for (let z = 6; z < 34; z += 5) onFace(g, sx, sy, p.face, -.38, .38, z, z + 1, 'rgba(0,0,0,.18)'); } return;
    case 'door': g.fillStyle = 'rgba(245,184,0,.25)'; g.beginPath(); g.ellipse(sx, sy + TH / 2, 22, 10, 0, 0, Math.PI * 2); g.fill(); return;
    case 'L': shadow(g, sx, sy, 14); prism(g, sx, sy, .42, .3, 44, ['#5d6d7e', '#4b5d73', '#64748b'][p.seed % 3]); g.strokeStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(sx, sy - 4); g.lineTo(sx, sy - 42); g.stroke(); g.fillStyle = '#cbd5e1'; g.fillRect(sx - 4, sy - 26, 2, 4); g.fillRect(sx + 3, sy - 22, 2, 4); return;
    case 'k': shadow(g, sx, sy, 14); prism(g, sx, sy, .45, .32, 15, '#6b5a48'); { const pt = prism(g, sx, sy, .16, .05, 13, '#1f2937', 15); const s0 = pt(-.13, .06, 3), s1 = pt(.13, .06, 11); g.fillStyle = Math.floor(t / 1500 + sx) % 3 ? '#38bdf8' : '#22c55e'; g.fillRect(s0[0], s1[1], s1[0] - s0[0], s0[1] - s1[1]); prism(g, sx, sy, .14, .06, 1, '#374151', 15, .2, .18); } return;
    case 'd': shadow(g, sx, sy, 14); prism(g, sx, sy, .45, .32, 15, '#8b6b4a'); g.fillStyle = '#f2f2f2'; g.fillRect(sx - 5, sy - 19, 8, 4); g.fillStyle = '#d97706'; g.fillRect(sx + 5, sy - 21, 3, 4); return;
    case 'h': case 'j': prism(g, sx, sy, .16, .16, 8, k === 'j' ? '#7a4a2a' : '#374151'); prism(g, sx, sy, .16, .04, 18, k === 'j' ? '#7a4a2a' : '#374151', 0, 0, -.14); return;
    case 'T': shadow(g, sx, sy, 16); prism(g, sx, sy, .42, .42, 14, '#9a7552'); if (p.seed % 2) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(sx - 4, sy - 16, 4, 2, 0, 0, Math.PI * 2); g.fill(); } return;
    case 't': shadow(g, sx, sy, 12); g.fillStyle = '#4b5563'; g.fillRect(sx - 1.5, sy - 13, 3, 13); g.fillStyle = '#c9a77a'; g.beginPath(); g.ellipse(sx, sy - 14, 14, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e8d5b5'; g.beginPath(); g.ellipse(sx, sy - 15, 12, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(sx + 3, sy - 16, 3, 1.6, 0, 0, Math.PI * 2); g.fill(); return;
    case 'c': prism(g, sx, sy, .5, .4, 18, '#a8916f'); prism(g, sx, sy, .5, .42, 2, '#e8dcc6', 18); return;
    case 'q': prism(g, sx, sy, .5, .4, 18, '#57534e'); prism(g, sx, sy, .5, .42, 2, '#d6d3d1', 18); if (p.seed % 3 === 0) { prism(g, sx, sy, .16, .12, 8, '#1f2937', 20); g.fillStyle = '#22c55e'; g.fillRect(sx - 3, sy - 29, 5, 2); } return;
    case 's': shadow(g, sx, sy, 14); prism(g, sx, sy, .45, .28, 34, '#8a8f96'); for (let z = 6; z < 34; z += 9) { prism(g, sx, sy, .45, .3, 1.5, '#cbd5e1', z); ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#9b59b6', '#f97316'].forEach((cc, i) => { g.fillStyle = cc; g.fillRect(sx - 13 + i * 4.6, sy - z - 6 + i * 1.2 - 2, 3, 5); }); } return;
    case '[': shadow(g, sx, sy, 14); prism(g, sx, sy, .46, .26, 46, '#5b3a1e'); for (let z = 4; z < 44; z += 10) { ['#7f1d1d', '#1e3a8a', '#14532d', '#78350f', '#4c1d95', '#b45309', '#334155'].forEach((cc, i) => { g.fillStyle = cc; g.fillRect(sx - 14 + i * 4, sy - z - 8 + i * 1.6 - 1, 3, 7 + (i % 2)); }); } return;
    case 'F': prism(g, sx, sy, .45, .35, 42, '#dfe7ee'); onFace(g, sx, sy - 0, 'y', -.4, .4, 4, 38, 'rgba(125,211,252,.5)'); ['#ef4444', '#22c55e', '#f59e0b', '#3b82f6'].forEach((c, i) => { g.fillStyle = c; g.fillRect(sx - 12 + i * 6, sy - 14 - (i % 2) * 10, 3, 6); }); return;
    case 'X': prism(g, sx, sy, .45, .35, 14, '#5b4a3a'); prism(g, sx, sy, .42, .32, 8, '#bcd7e8', 14); g.fillStyle = '#f5b800'; g.fillRect(sx - 3, sy - 24, 3, 2); g.fillStyle = '#e5e7eb'; g.fillRect(sx + 4, sy - 22, 4, 2); g.fillStyle = '#111'; g.fillRect(sx - 9, sy - 22, 4, 2); return;
    case 'B': shadow(g, sx, sy, 16); prism(g, sx, sy, .45, .48, 10, '#e8e8f0'); prism(g, sx, sy, .4, .14, 4, '#ffffff', 10, -.04, -.3); prism(g, sx, sy, .46, .32, 3, ['#5b7fbf', '#b45309', '#047857'][p.seed % 3], 10, 0, .14); return;
    case 'u': prism(g, sx, sy, .45, .3, 6, '#9ca3af'); prism(g, sx, sy, .45, .3, 4, '#1e3a8a', 6); prism(g, sx, sy, .45, .3, 4, '#1e3a8a', 26); g.fillStyle = '#6b7280'; g.fillRect(sx - 15, sy - 32, 2, 32); g.fillRect(sx + 13, sy - 28, 2, 28); return;
    case 'n': prism(g, sx, sy, .2, .2, 12, '#7a5a3a'); g.fillStyle = '#fde68a'; g.beginPath(); g.arc(sx, sy - 20, 4, 0, Math.PI * 2); g.fill(); return;
    case 'p': prism(g, sx, sy, .5, .18, 10, '#7a4a2a'); prism(g, sx, sy, .5, .04, 22, '#6a3e22', 0, 0, -.16); return;
    case 'r': shadow(g, sx, sy, 16); prism(g, sx, sy, .48, .32, 54, '#3d5a80'); [12, 28, 44].forEach((z, i) => prism(g, sx, sy, .4, .26, 9, ['#b08850', '#c19a6b', '#a07a48'][(i + p.seed) % 3], z - 9)); return;
    case 'x': shadow(g, sx, sy, 12); prism(g, sx, sy, .36, .36, 22, '#b08850'); g.strokeStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.moveTo(sx - 10, sy - 6); g.lineTo(sx + 10, sy - 18); g.stroke(); if (p.seed % 2) prism(g, sx, sy, .22, .22, 12, '#c19a6b', 22); return;
    case 'C': g.strokeStyle = '#4b5563'; g.lineWidth = 2; for (let i = -3; i <= 3; i++) { const a = [sx + i * 4.5, sy + i * 2.2 + 8]; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[0], a[1] - 46); g.stroke(); } g.fillStyle = '#4b5563'; g.fillRect(sx - 15, sy - 44, 30, 3); return;
    case 'S': g.fillStyle = '#c0392b'; g.beginPath(); g.ellipse(sx, sy - 10, 6, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#9ca3af'; g.fillRect(sx - 1, sy - 10, 2, 10); return;
    case 'b': prism(g, sx, sy, .45, .22, 10, '#b52a35'); prism(g, sx, sy, .45, .06, 26, '#9e2430', 0, 0, -.18); return;
    case 'P': prism(g, sx, sy, .16, .16, 10, ['#8b5a2b', '#e5e7eb', '#1f2937'][p.seed % 3]); g.fillStyle = '#2f7a35'; [[-6, -16, 7], [5, -18, 7], [0, -24, 8], [-2, -30, 5]].forEach(([a, b, r]) => { g.beginPath(); g.arc(sx + a, sy + b, r, 0, Math.PI * 2); g.fill(); }); g.fillStyle = '#3f9142'; g.beginPath(); g.arc(sx + 2, sy - 22, 4, 0, Math.PI * 2); g.fill(); return;
    case 'e': shadow(g, sx, sy, 16); prism(g, sx, sy, .45, .3, 10, ['#5b6b8a', '#7c2d12', '#365314'][p.seed % 3]); prism(g, sx, sy, .45, .07, 20, ['#4b5a78', '#6b2510', '#2d4410'][p.seed % 3], 0, 0, -.22); prism(g, sx, sy, .08, .3, 15, ['#4b5a78', '#6b2510', '#2d4410'][p.seed % 3], 0, .4, 0); return;
    case 'V': prism(g, sx, sy, .3, .12, 10, '#3a2a1a'); prism(g, sx, sy, .34, .03, 22, '#111827', 10); g.fillStyle = Math.floor(t / 900) % 2 ? '#2563eb' : '#7c3aed'; g.fillRect(sx - 9, sy - 28, 16, 9); return;
    case 'J': prism(g, sx, sy, .5, .45, 30, '#6b4226'); prism(g, sx, sy, .52, .47, 3, '#8b5a2b', 30); return;
    case 'R': prism(g, sx, sy, .5, .07, 12, '#8b5a2b'); prism(g, sx, sy, .06, .06, 16, '#6b4226', 0, .44, 0); return;
    case 'a': prism(g, sx, sy, .48, .3, 14, '#efe8da'); prism(g, sx, sy, .5, .32, 2, '#7f1d1d', 14); g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(sx - 6, sy - 22, 2.5, 0, Math.PI * 2); g.arc(sx + 6, sy - 22, 2.5, 0, Math.PI * 2); g.fill(); return;
    case 'M': prism(g, sx, sy, .45, .2, 30, '#9aa3ad'); g.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.fillRect(sx - 12 + i * 8, sy - 26 + j * 7 + i * 4, 5, 3); return;
    case 'K': shadow(g, sx, sy, 14); prism(g, sx, sy, .3, .22, 14, '#f5b800'); prism(g, sx, sy, .05, .2, 40, '#374151', 0, .32, 0); prism(g, sx, sy, .18, .14, 12, '#222', 14); return;
    case 'E': drawProp(g, { t: 'firetruck' }, sx, sy, t, false); return;
    case 'A': prism(g, sx, sy, .1, .5, 18, '#6b7280'); vehicle(g, sx, sy - 18, 0, { kind: 'sedan', body: ['#c0392b', '#2980b9', '#7f8c8d'][p.seed % 3], side: '#555', scale: 1 }, t, false, false); return;
    case 'Z': for (let i = 0; i < 4; i++) prism(g, sx, sy, .45 - i * .08, .45, 8 + i * 8, '#8f7c68', 0, i * .08, 0); return;
    case 'G': prism(g, sx, sy, .45, .1, 40, '#4b5563'); ['#a16207', '#a16207', '#a16207'].forEach((c, i) => prism(g, sx, sy, .12, .1, 26, c, 8, -.3 + i * .3, .14)); g.fillStyle = '#d4ff3a'; g.fillRect(sx - 10, sy - 22, 20, 2); return;
    case 'H': shadow(g, sx, sy, 10); prism(g, sx, sy, .3, .28, 34, '#94a3b8'); for (let z = 6; z < 34; z += 9) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(sx - 6, sy - z - 2, 8, 1.5); } return;
    case 'I': prism(g, sx, sy, .3, .26, 36, '#1e3a8a'); g.fillStyle = '#7dd3fc'; g.fillRect(sx - 6, sy - 30, 9, 7); g.fillStyle = '#f5b800'; g.fillRect(sx - 6, sy - 20, 9, 2); return;
    case 'N': prism(g, sx, sy, .38, .3, 46, ['#b91c1c', '#1d4ed8', '#047857'][p.seed % 3]); g.fillStyle = 'rgba(190,227,255,.7)'; g.fillRect(sx - 10, sy - 40, 12, 22); ['#f59e0b', '#ef4444', '#22c55e'].forEach((c, i) => { g.fillStyle = c; g.fillRect(sx - 8 + i * 3, sy - 36 + i * 6, 2, 3); }); return;
    case 'O': prism(g, sx, sy, .18, .18, 22, '#e5e7eb'); g.fillStyle = 'rgba(147,197,253,.85)'; g.beginPath(); g.ellipse(sx, sy - 30, 6, 8, 0, 0, Math.PI * 2); g.fill(); return;
    case 'Q': prism(g, sx, sy, .4, .3, 18, '#57534e'); prism(g, sx, sy, .16, .12, 14, '#111827', 18); g.fillStyle = '#7c2d12'; g.fillRect(sx + 4, sy - 22, 4, 4); if (Math.floor(t / 1600) % 3 === 0) { g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(sx - 2, sy - 40 - (t % 1600) / 80, 2.5, 0, Math.PI * 2); g.fill(); } return;
    case 'Y': prism(g, sx, sy, .34, .28, 22, '#d1d5db'); prism(g, sx, sy, .3, .24, 3, '#6b7280', 22); g.fillStyle = '#22c55e'; g.fillRect(sx + 6, sy - 22, 2, 2); return;
    case 'g': prism(g, sx, sy, .45, .35, 20, '#9ca3af'); prism(g, sx, sy, .45, .37, 2, '#374151', 20); g.fillStyle = Math.floor(t / 400) % 2 ? '#f97316' : '#ef4444'; g.beginPath(); g.arc(sx - 5, sy - 24, 2.4, 0, Math.PI * 2); g.arc(sx + 5, sy - 22, 2.4, 0, Math.PI * 2); g.fill(); return;
    case 'w': prism(g, sx, sy, .45, .35, 18, '#e5e7eb'); g.fillStyle = '#93c5fd'; g.beginPath(); g.ellipse(sx, sy - 20, 7, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#9ca3af'; g.fillRect(sx - 1, sy - 30, 2, 9); return;
    case 'l': g.fillStyle = '#374151'; g.fillRect(sx - 1, sy - 34, 2, 34); g.fillStyle = '#fde68a'; g.beginPath(); g.moveTo(sx - 7, sy - 34); g.lineTo(sx + 7, sy - 34); g.lineTo(sx + 4, sy - 42); g.lineTo(sx - 4, sy - 42); g.closePath(); g.fill(); return;
    case 'y': prism(g, sx, sy, .14, .14, 14, '#374151'); return;
    case 'z': prism(g, sx, sy, .2, .16, 26, '#6b4226'); prism(g, sx, sy, .26, .2, 3, '#8b5a2b', 26); return;
    case '=': prism(g, sx, sy, .48, .16, 8, '#7a5a3a'); prism(g, sx, sy, .06, .14, 8, '#374151', -8, .4, 0); return;
    case '%': g.fillStyle = '#d4a017'; g.fillRect(sx - 1.5, sy - 18, 3, 18); g.strokeStyle = '#991b1b'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, sy - 16); g.quadraticCurveTo(sx + 16, sy - 6, sx + 32, sy); g.stroke(); return;
    case '^': prism(g, sx, sy, .45, .3, 24, '#1f2937'); prism(g, sx, sy, .45, .1, 2, '#f8fafc', 18, 0, .2); return;
    case '&': g.fillStyle = '#9ca3af'; g.fillRect(sx - 1, sy - 46, 2, 46); g.fillStyle = '#1e3a8a'; g.fillRect(sx + 1, sy - 46, 14, 9); g.fillStyle = '#b91c1c'; for (let i = 0; i < 3; i++) g.fillRect(sx + 1, sy - 37 + i * 3, 18, 1.5); g.fillStyle = '#f5b800'; g.beginPath(); g.arc(sx, sy - 47, 2, 0, Math.PI * 2); g.fill(); return;
    case '~': prism(g, sx, sy, .34, .26, 34, '#7c2d12'); g.fillStyle = Math.floor(t / 250) % 3 === 0 ? '#f472b6' : Math.floor(t / 250) % 3 === 1 ? '#facc15' : '#38bdf8'; g.beginPath(); g.arc(sx - 2, sy - 32, 7, Math.PI, 0); g.fill(); return;
    case 'f': prism(g, sx, sy, .42, .38, 30, '#f8fafc'); g.fillStyle = '#94a3b8'; g.beginPath(); g.arc(sx - 4, sy - 14, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = (p.seed + Math.floor(t / 300)) % 4 ? '#bfdbfe' : '#e0f2fe'; g.beginPath(); g.arc(sx - 4, sy - 14, 5, 0, Math.PI * 2); g.fill(); return;
    case 'm': prism(g, sx, sy, .1, .1, 10, '#9ca3af'); prism(g, sx, sy, .3, .3, 8, '#111827', 10); prism(g, sx, sy, .3, .06, 22, '#111827', 10, 0, -.24); return;
    case 'W': prism(g, sx, sy, .45, .14, 8, '#374151'); g.fillStyle = '#111'; g.fillRect(sx - 16, sy - 24, 32, 2); g.beginPath(); g.arc(sx - 14, sy - 23, 6, 0, Math.PI * 2); g.arc(sx + 14, sy - 23, 6, 0, Math.PI * 2); g.fill(); return;
    case 'o': g.strokeStyle = '#6b7280'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx, sy - 56); g.lineTo(sx, sy - 40); g.stroke(); g.fillStyle = '#991b1b'; g.beginPath(); g.roundRect(sx - 6, sy - 40, 12, 30, 5); g.fill(); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(sx + 1, sy, 6, 3, 0, 0, Math.PI * 2); g.fill(); return;
    case '{': shadow(g, sx, sy, 18); prism(g, sx, sy, .46, .36, 14, '#5b3a1e'); prism(g, sx, sy, .4, .3, 1, '#15803d', 14); g.fillStyle = '#fff'; g.beginPath(); g.arc(sx + 4, sy - 16, 1.8, 0, Math.PI * 2); g.fill(); g.fillStyle = '#dc2626'; g.beginPath(); g.arc(sx - 4, sy - 17, 1.8, 0, Math.PI * 2); g.fill(); return;
  }
}
export function staffDraw(g, s, t) { const [sx, sy] = iso(s.x, s.y); person(g, sx, sy, { kit: s.kit, skin: s.skin || '#c68e63', moving: false, face: -1 }, t); }
const VSHIRT = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#ecf0f1', '#16a085', '#d35400'], VSKIN = ['#f1c9a5', '#e0b48f', '#c68e63', '#a26a42', '#7a4b2a', '#5a3620'], VHAIR = ['#2b1d14', '#4a3020', '#8a5a2b', '#d8b46a', '#1a1a1a', '#9a9a9a'];
export function visitorDraw(g, v, t) { const [sx, sy] = iso(v.x, v.y); person(g, sx, sy, { shirt: VSHIRT[v.seed % 8], pants: ['#3b4a5c', '#2c3e50', '#5d4037'][v.seed % 3], skin: VSKIN[v.seed % 6], hair: VHAIR[(v.seed >> 2) % 6], moving: false, ph: v.seed, face: v.seed % 2 ? 1 : -1 }, t); }
