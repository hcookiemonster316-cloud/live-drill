// The living calendar: weather and seasons (from the real date), a city event every week that the whole server
// works on together, and collectibles (department patches, the pigeon census for Sgt. Pruitt, a landmark photo album).
const weekKey = () => { const d = new Date(), j = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), w = Math.ceil(((d - j) / 864e5 + j.getUTCDay() + 1) / 7); return d.getUTCFullYear() + 'w' + String(w).padStart(2, '0'); };
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
const mul = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export function season(d) {
  d = d || new Date(); const m = d.getMonth() + 1, day = d.getDate();
  if (m >= 6 && m <= 11) return { id: 'hurricane', name: 'Hurricane season', icon: '🌀' };
  if (m === 12 || m <= 2) return { id: 'cold', name: 'Cold-snap season', icon: '🧥' };
  if (m >= 3 && m <= 5) return { id: 'spring', name: 'Spring', icon: '🌼' };
  return { id: 'summer', name: 'Summer', icon: '☀️' };
}
// one event a week, picked from the date; some only happen in their season
const EVENTS = [
  { id: 'parade', d: 0, name: 'Founders Day Parade', icon: '🎺', at: 'Founders Plaza', blurb: 'Marching bands down Main Street, floats around the plaza. Crowds, lost kids and road closures.' },
  { id: 'nightmarket', d: 1, name: 'Eastside Night Market', icon: '🏮', at: 'Eastside Plaza', blurb: 'Food stalls fill the Eastside Plaza lot after dark. Traffic, crowds and very full stomachs.' },
  { id: 'riverfest', d: 2, name: 'River Fest', icon: '🎣', at: 'Riverside Park', blurb: 'Boat races, a fishing derby and music in Riverside Park.' },
  { id: 'homecoming', d: 2, name: 'Gators Homecoming', icon: '🏈', at: 'River Stadium', blurb: 'The biggest game of the year at River Stadium. Every seat sold.' },
  { id: 'rigshow', d: 3, name: 'Big Rig Show', icon: '🚛', at: 'Big Rig Truck Stop', blurb: 'Chrome, horns and a lot of trucks at the truck stop. Traffic posts needed.' },
  { id: 'lawday', d: 4, name: 'Law Day Open House', icon: '⚖️', at: 'Justice Plaza', blurb: 'The courthouse opens its doors. School groups, tours and a mock trial.' },
  { id: 'hurricane', d: -1, name: 'Hurricane Prep Week', icon: '🌀', at: null, season: 'hurricane', blurb: 'A storm is in the Gulf. Sandbags, wellness checks on older residents and evacuation routes, in every district.' },
  { id: 'halloween', d: 1, name: 'Trunk-or-Treat Safety Night', icon: '🎃', at: 'Eastside Community Center', win: [[10, 20], [10, 31]], blurb: 'Costumes, candy and a lot of small pedestrians after dark. Reflective bags, crosswalks and lost-kid stations.' },
  { id: 'turkeytrot', d: 0, name: 'Turkey Trot & Food Drive', icon: '🦃', at: 'Founders Park', win: [[11, 14], [11, 30]], blurb: 'A 5K through downtown and a food drive at the finish line. Road closures, runners and a lot of canned goods.' },
  { id: 'toydrive', d: 4, name: 'Blue Holiday Toy Drive', icon: '🎁', at: 'Justice Plaza', win: [[12, 1], [12, 24]], blurb: 'Officers collect and deliver toys for families across the county. Wrapping tables on Justice Plaza.' },
  { id: 'newyear', d: 0, name: 'New Year on the Bayfront', icon: '🎆', at: 'Bayfront Tower', win: [[12, 26], [1, 2]], blurb: 'Fireworks off the bay at midnight. Big crowds, safe rides home and a sober-driver tent.' },
  { id: 'july4', d: 2, name: 'Fourth of July on the River', icon: '🎆', at: 'Riverside Park', date: [7, 4], blurb: 'Fireworks over the river. The busiest night of the year.' }
];
export function eventOfWeek(d) {
  d = d || new Date(); const s = season(d), y = d.getFullYear(), j4 = new Date(y, 6, 4); if (Math.abs(d - j4) < 4 * 864e5) return EVENTS.find((e) => e.id === 'july4');
  const md = (d.getMonth() + 1) * 100 + d.getDate(), inWin = (w) => { const a = w[0][0] * 100 + w[0][1], b = w[1][0] * 100 + w[1][1]; return a <= b ? md >= a && md <= b : md >= a || md <= b; }; const hol = EVENTS.find((e) => e.win && inWin(e.win)); if (hol) return hol;
  const pool = EVENTS.filter((e) => !e.date && !e.win && (!e.season || e.season === s.id)), k = hash(weekKey()) % pool.length; return pool[k];
}
// what each event gives volunteers at 5 tasks: an outfit touch and a car skin
export const EV_GEAR = {
  parade: { outfit: 'Parade dress: gold cord and campaign hat', look: { cord: '#f5b800', brass: true, hat: 'campaign', hatCol: '#1e3a8a' }, skin: { stripe: '#f5b800', text: 'FOUNDERS DAY' } },
  nightmarket: { outfit: 'Night Market lantern glow', look: { glow: true, hat: 'cap', hatCol: '#be123c' }, skin: { stripe: '#f43f5e', text: 'NIGHT MARKET' } },
  riverfest: { outfit: 'River Fest boonie hat', look: { hat: 'boonie', hatCol: '#0e7490' }, skin: { stripe: '#14b8a6', text: 'RIVER FEST' } },
  homecoming: { outfit: 'Gators homecoming cap and cord', look: { hat: 'cap', hatCol: '#15803d', cord: '#f97316' }, skin: { stripe: '#16a34a', text: 'GO GATORS' } },
  rigshow: { outfit: 'Big Rig Show safety vest', look: { vest: true, hat: 'cap', hatCol: '#d4ff3a' }, skin: { stripe: '#f97316', text: 'BIG RIG SHOW' } },
  lawday: { outfit: 'Law Day clipboard and brass', look: { clipboard: true, brass: true }, skin: { stripe: '#9333ea', text: 'LAW DAY' } },
  hurricane: { outfit: 'Storm poncho and boonie', look: { poncho: true, hat: 'boonie', hatCol: '#4d5e3a' }, skin: { stripe: '#0ea5e9', text: 'STORM READY' } },
  halloween: { outfit: 'Reflective safety sash and orange cap', look: { vest: true, hat: 'cap', hatCol: '#f97316' }, skin: { stripe: '#f97316', text: 'TRUNK OR TREAT' } },
  turkeytrot: { outfit: 'Turkey Trot race bib and cap', look: { hat: 'cap', hatCol: '#b45309', cord: '#b45309' }, skin: { stripe: '#b45309', text: 'TURKEY TROT' } },
  toydrive: { outfit: 'Toy drive holiday cord', look: { cord: '#dc2626', brass: true, hat: 'cap', hatCol: '#166534' }, skin: { stripe: '#16a34a', text: 'TOY DRIVE' } },
  newyear: { outfit: 'New Year gold cord and shine', look: { cord: '#f5b800', brass: true, shine: 1 }, skin: { stripe: '#facc15', text: 'HAPPY NEW YEAR' } },
  july4: { outfit: 'Fourth of July cord and shine', look: { cord: '#dc2626', brass: true, shine: 1 }, skin: { stripe: '#dc2626', text: 'JULY 4TH' } }
};
// daily challenges: three a day, picked from the date, measured by the same counters as trophies
const DAILY = [['stops', 2, 'Make 2 traffic stops', '🚓'], ['self_plate', 3, 'Run 3 plates', '🔍'], ['fish', 1, 'Catch a fish', '🎣'], ['right', 10, 'Answer 10 questions right', '🧠'], ['helped', 2, 'Help 2 regulars with a question', '🤝'], ['mg', 1, 'Play a Rec Room game', '🎮'], ['pt', 1, 'Finish a PT workout', '🏋️'], ['meals', 1, 'Grab a bite off duty', '🍽️'], ['evtasks', 2, 'Help at this week\'s city event', '🎪'], ['self', 3, 'Do 3 self-initiated activities', '🧭'], ['rides', 1, 'Do a ride-along', '🚒'], ['pigeons', 2, 'Count 2 pigeon flocks', '🐦'], ['insp', 1, 'Stand uniform inspection', '🎖️'], ['tips', 1, 'Ask a regular if they\'ve seen anything', '👂'], ['arcParts', 1, 'Play a part of a friendship story', '💛'], ['inside', 2, 'Go inside 2 buildings', '🚪'], ['photos', 1, 'Take a photo in Photo Mode', '📸']];
const TASKS = {
  any: [['🚦', 'Traffic post', 'Cars are backing up at the closure. A driver leans out the window.', [['Calmly point them to the detour and keep traffic moving', 1], ['Wave everyone through the closure', 0], ['Argue with the driver', 0]]],
    ['🧒', 'Lost child', 'A girl in a festival T-shirt can\'t find her dad.', [['Stay with her, get a description and radio it out', 1], ['Tell her to wait by the stage alone', 0], ['Walk the whole festival with her', 0]]],
    ['👥', 'Crowd control', 'People are pushing toward the front to see.', [['Calmly redirect people and open a second viewing area', 1], ['Shout at everyone to back up', 0], ['Let it sort itself out', 0]]],
    ['💧', 'Hydration station', 'An older man looks pale and dizzy in the heat.', [['Get him water and shade, and call EMS to check him', 1], ['Tell him to go home', 0], ['Keep walking', 0]]],
    ['❓', 'Visitor questions', 'A family from out of town is totally lost.', [['Give clear directions and point out the first aid tent', 1], ['Shrug', 0], ['Tell them to use their phone', 0]]]],
  halloween: [['🎃', 'Lost trick-or-treater', 'A small pirate has lost his group. He is holding a very full bag.', [['Stay with him, get his name and his group\'s description, and radio it out', 1], ['Point him toward the houses with lights on', 0], ['Tell him to wait on the curb', 0]]],
    ['🚸', 'Dark crosswalk', 'A crowd of costumed kids is crossing mid-block between parked cars.', [['Guide them to the lit crosswalk and hand out glow sticks', 1], ['Let them cross; it\'s only one night', 0], ['Honk to scare them back', 0]]],
    ['🍬', 'Candy check', 'A parent asks if the candy from one house is safe.', [['Suggest checking for opened or homemade wrappers and tossing anything unsealed', 1], ['Tell her all candy is fine', 0], ['Take the whole bag', 0]]]],
  turkeytrot: [['🏃', 'Runner down', 'A runner is sitting on the curb, pale and dizzy at mile 2.', [['Get him water and shade and call EMS to check him', 1], ['Tell him to walk it off', 0], ['Keep the race moving', 0]]],
    ['🥫', 'Food drive', 'The donation table is overflowing and the boxes are falling.', [['Sort and stack the cans and help load the pantry van', 1], ['Guard the table and do nothing', 0], ['Tell people to stop donating', 0]]],
    ['🚧', 'Course closure', 'A driver wants through the closed race course.', [['Calmly point out the detour and keep the runners safe', 1], ['Let one car through quickly', 0], ['Argue with the driver', 0]]]],
  toydrive: [['🎁', 'Toy delivery', 'A family on the list is home. The kids are peeking through the blinds.', [['Knock, introduce yourselves and deliver the toys with the parent', 1], ['Leave the toys on the porch', 0], ['Hand them to the kids through the window', 0]]],
    ['📦', 'Package thief', 'A neighbor says boxes keep vanishing from porches.', [['Take a report, note times and cameras, and share delivery tips', 1], ['Tell her it\'s the holidays', 0], ['Search every porch', 0]]],
    ['🧣', 'Cold night', 'A man is sleeping on a bench and the temperature is dropping.', [['Check on him and offer a ride to the cold-night shelter', 1], ['Wake him and tell him to move along', 0], ['Leave him be', 0]]]],
  newyear: [['🎆', 'Fireworks crowd', 'People are pressing toward the seawall for a better view.', [['Calmly open a second viewing area and keep the seawall clear', 1], ['Shout at everyone to move', 0], ['Let them climb the wall', 0]]],
    ['🚕', 'Safe ride', 'A man fumbles his car keys and can barely stand.', [['Keep him out of the car and help him get a safe ride home', 1], ['Tell him to drive slowly', 0], ['Ignore it', 0]]],
    ['👂', 'Noise complaint', 'A neighbor says the party next door is shaking her windows.', [['Talk to the host, ask them to turn it down, and check on the neighbor', 1], ['Shut the party down immediately', 0], ['Tell her it\'s New Year\'s', 0]]]],
  hurricane: [['🧱', 'Sandbags', 'Residents are filling sandbags at the fire station.', [['Help and show them how to stack them like bricks', 1], ['Supervise from the car', 0], ['Tell them it won\'t flood', 0]]],
    ['👵', 'Wellness check', 'An older resident lives alone and hasn\'t answered her phone.', [['Knock, check on her, and make sure she has a plan and supplies', 1], ['Leave a voicemail', 0], ['Assume she left town', 0]]],
    ['🛣️', 'Evacuation route', 'Cars are lining up toward the highway.', [['Direct traffic onto the marked evacuation route', 1], ['Let people take shortcuts through neighborhoods', 0], ['Close the road', 0]]]]
};

export function installEvents(H) {
  const S = H.S; S.patches = S.patches || {}; S.pigeons = S.pigeons || {}; S.album = S.album || {}; S.evMine = S.evMine || {};
  let tasks = [], patches = [], flocks = [], ev = eventOfWeek(), evSum = 0, evStop = null, WX = { label: '' };
  const GOAL = 150;
  // ---------- weather for this shift ----------
  function weather() {
    const s = season(), r = Math.random(); let wx = { rain: r < .25, storm: false, fog: 0, wind: .1, cold: false };
    if (s.id === 'hurricane') { wx.rain = r < .4; wx.storm = r < .12 || ev.id === 'hurricane' && r < .3; if (wx.storm) { wx.rain = true; wx.wind = .9; } }
    if (s.id === 'cold') { wx.cold = Math.random() < .6; wx.fog = Math.random() < .35 ? .5 + Math.random() * .4 : 0; wx.rain = r < .15; }
    if (s.id === 'spring') { wx.fog = Math.random() < .2 ? .4 : 0; }
    wx.label = wx.storm ? '🌀 Tropical storm' : wx.fog ? '🌫️ Fog' : wx.rain ? '🌧️ Rain' : wx.cold ? '🧥 Cold snap' : s.id === 'hurricane' || s.id === 'summer' ? '☀️ Hot' : '🌤️ Fair';
    WX = wx; return wx;
  }
  const STORM_CALLS = [['Tree down blocking the road', 2, 'any', 'Large oak across both lanes. Public works is en route.'], ['Flooded intersection, car stalled', 2, 'any', 'Driver is stuck in rising water.'], ['Traffic lights out at a major intersection', 2, 'any', 'Power is out. Cars are not taking turns.'], ['Downed power line, sparking', 1, 'any', 'Line is down across a sidewalk. Keep people back.'], ['Older resident without power, needs oxygen', 1, 'any', 'Caller says her oxygen machine is off.']];

  // ---------- this week's event ----------
  function evActive(did) { return ev.d === -1 || ev.d === did; }
  function setup() {
    tasks = []; patches = []; flocks = []; const W = H.W; if (!W || H.inside) return;
    const r = mul(hash('patches' + W.did)), q = W.quiet && W.quiet.length ? W.quiet : W.walk;
    for (let i = 0; i < 5; i++) { const t = q[Math.floor(r() * q.length)], id = W.did + ':' + i; if (!S.patches[id]) patches.push({ id, x: t[0] + .5, y: t[1] + .5 }); }
    const r2 = mul(hash('pigeons' + W.did)), open = W.walk;
    for (let i = 0; i < 6; i++) { const t = open[Math.floor(r2() * open.length)], id = W.did + ':' + i; if (!S.pigeons[id]) flocks.push({ id, x: t[0] + .5, y: t[1] + .5, n: 4 + Math.floor(r2() * 9) }); }
    if (evActive(W.did)) spawnTasks();
  }
  function spawnTasks() {
    const W = H.W, lot = ev.at ? W.lots.find((l) => (l.name || '').indexOf(ev.at) >= 0) : null, list = TASKS[ev.id] && ev.id !== 'any' ? TASKS[ev.id].concat(TASKS.any.slice(1, 3)) : TASKS.any;
    const near = lot ? (() => { const [dx, dy] = H.doorSpot(lot); return W.walk.filter((t) => Math.hypot(t[0] - dx, t[1] - dy) < 12); })() : W.walk.filter(() => Math.random() < .02);
    const pool = near.length ? near : W.walk; while (tasks.length < 6) { const t = pool[Math.floor(Math.random() * pool.length)], k = list[Math.floor(Math.random() * list.length)]; tasks.push({ x: t[0] + .5, y: t[1] + .5, k }); }
    if (lot && !W._evDeco) { W._evDeco = 1; const [dx, dy] = H.doorSpot(lot); const cols = ['#d22d3d', '#1f7a5a', '#2c5aa0', '#d98a1c', '#8e44ad']; near.slice(0, 40).filter((_, i) => i % 6 === 0).forEach((t, i) => W.props.push({ t: i % 2 ? 'stall' : 'flag', x: t[0] + .5, y: t[1] + .5, color: cols[i % cols.length] })); }
  }
  function watch() {
    if (evStop) evStop(); evStop = null; const net = H.net(); if (!net) return;
    evStop = net.gon('mmo/ev/' + weekKey() + '/' + ev.id, (v) => { evSum = Object.values(v || {}).reduce((a, b) => a + (+b || 0), 0); if (evSum >= GOAL && !S.evDone) { S.evDone = weekKey(); H.saveS(); H.banner(ev.icon, ev.name + ': city goal reached!', 'Everyone who pitched in gets a reward. Thank you, Port Meridian.'); H.queueLoot(ev.name, 1, 'r'); H.stat('evgoal'); } });
  }
  function contribute() {
    const k = weekKey() + ev.id; S.evMine[k] = (S.evMine[k] || 0) + 1; H.saveS(); const net = H.net(); if (net) { try { net.gset('mmo/ev/' + weekKey() + '/' + ev.id + '/' + net.uid, S.evMine[k]); } catch (e) {} } else evSum++;
    const n = S.evMine[k]; if (n === 5 || n === 15) H.queueLoot(ev.name + ' volunteer', 1, n === 15 ? 'e' : 'u');
    if (n === 5 && EV_GEAR[ev.id] && !(S.evGear || {})[ev.id]) { S.evGear = S.evGear || {}; S.evGear[ev.id] = Date.now(); H.saveS(); H.banner(ev.icon, 'Event gear unlocked', EV_GEAR[ev.id].outfit + ' and a ' + EV_GEAR[ev.id].skin.text + ' car skin. Wear them from Collections.'); H.stat('evgear'); }
  }
  function runTask(t) {
    const [icon, title, text, opts] = t.k, id = H.sayAs('evp', { name: title, icon, role: ev.name }), les = H.W.D.lessons.indexOf(15) >= 0 ? [15, 16] : H.W.D.lessons;
    const shuffled = opts.map((o) => ({ t: o[0], ok: o[1], trust: o[1] ? 1 : -1, reply: [['narr', o[1] ? 'That\'s the way to do it.' : 'Not the best call. Think about what keeps everyone safe.']] })).sort(() => Math.random() - .5);
    H.dialogue([['narr', text], ['choice', shuffled], [id, 'One more thing, officer:'], ['q', H.L.pickFacts(S, les, 1)[0], id]], (r) => { tasks = tasks.filter((x) => x !== t); const ok = r.choices[0] && r.choices[0].ok; H.award(ok ? 50 : 25, ev.name); H.stat('evtasks'); contribute(); if (tasks.length < 3) spawnTasks(); }, { focus: [t.x, t.y], kicker: ev.icon + ' ' + ev.name.toUpperCase() + ' · ' + title.toUpperCase() });
  }
  // ---------- collectibles ----------
  function grabPatch(p) { S.patches[p.id] = Date.now(); H.saveS(); patches = patches.filter((x) => x !== p); const n = Object.keys(S.patches).length; H.banner('🎖️', 'Department patch found (' + n + '/25)', ['1911 marshal\'s patch', '1934 horse patrol patch', '1952 motor unit patch', '1970s dispatch patch', 'Hurricane 2004 relief patch'][Math.floor(Math.random() * 5)]); H.good(); H.stat('patches'); H.award(25, 'patch found'); if (n === 25) H.queueLoot('Every patch', 1, 'l'); }
  function countFlock(f) { S.pigeons[f.id] = f.n; H.saveS(); flocks = flocks.filter((x) => x !== f); const tot = Object.values(S.pigeons).reduce((a, b) => a + b, 0), n = Object.keys(S.pigeons).length; H.toast('🐦 Pigeon census: counted ' + f.n + ' here. ' + n + '/30 flocks, ' + tot + ' pigeons total.'); H.beep(1200, .05, 'triangle', .03); H.stat('pigeons'); if (n === 30) { H.banner('🐦', 'Pigeon census complete', 'Sgt. Pruitt will want to hear about this.'); H.queueLoot('Sgt. Pruitt\'s thanks', 1, 'e'); } }
  function photo(cx, cy) { const W = H.W; if (!W || H.inside) return; const l = W.lots.filter((x) => x.name && !x.gen).map((x) => { const [dx, dy] = H.doorSpot(x); return [x, Math.hypot(dx - cx, dy - cy)]; }).sort((a, b) => a[1] - b[1])[0]; if (!l || l[1] > 9) return; const k = W.did + ':' + l[0].name; if (S.album[k]) return; S.album[k] = Date.now(); H.saveS(); H.stat('album'); H.toast('📸 Added to your album: ' + l[0].name + ' (' + Object.keys(S.album).length + ')'); }
  function collections() {
    const named = H.allLandmarks(), ap = Object.keys(S.album).length, pc = Object.keys(S.patches).length, fl = Object.keys(S.pigeons).length, tot = Object.values(S.pigeons).reduce((a, b) => a + b, 0);
    H.openModal('<div class="sceneHead"><b>COLLECTIONS</b><h2>Your finds</h2><p>Patches hide in quiet corners. Pigeon flocks sit on sidewalks and plazas. Photos count when you take one near a named landmark in Photo Mode.</p></div>' +
      '<div class="colGrid"><div><span>🎖️</span><b>' + pc + '/25</b><small>Department patches</small></div><div><span>🐦</span><b>' + fl + '/30</b><small>Flocks counted · ' + tot + ' pigeons</small></div><div><span>📸</span><b>' + ap + '/' + named.length + '</b><small>Landmarks photographed</small></div></div>' +
      '<div class="jSec"><b>Patches by district</b></div><div class="colRow">' + [0, 1, 2, 3, 4].map((d) => '<span>' + H.dname(d) + ': ' + [0, 1, 2, 3, 4].map((i) => S.patches[d + ':' + i] ? '🎖️' : '▫️').join('') + '</span>').join('') + '</div>' +
      '<div class="jSec"><b>Photo album</b></div><div class="colAlbum">' + named.map((n) => '<span class="' + (S.album[n.k] ? 'has' : '') + '">' + (S.album[n.k] ? '📸 ' : '◻️ ') + H.esc(n.name) + '</span>').join('') + '</div>' +
      '<div class="jSec"><b>Event gear (earned at 5 event tasks)</b></div><div class="rides">' + Object.keys(EV_GEAR).map((id) => { const g = EV_GEAR[id], own = (S.evGear || {})[id], e = EVENTS.find((x) => x.id === id); return '<div class="evGear' + (own ? '' : ' locked') + '"><span>' + (own ? e.icon : '🔒') + '</span><b>' + H.esc(e.name) + '</b><small>' + H.esc(own ? g.outfit : 'Volunteer 5 times during ' + e.name) + '</small>' + (own ? '<div><button type="button" data-wear="' + id + '">' + (S.evWear === id ? 'Wearing ✓' : 'Wear') + '</button><button type="button" data-skin="' + id + '">' + ((S.car || {}).skinId === id ? 'On car ✓' : 'Car skin') + '</button></div>' : '') + '</div>'; }).join('') + '</div>' +
      '<div class="qAct"><button type="button" id="evOff">Plain uniform and car</button><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal;
    document.querySelectorAll('[data-wear]').forEach((b) => b.onclick = () => { S.evWear = S.evWear === b.dataset.wear ? null : b.dataset.wear; H.saveS(); H.refreshLook(); collections(); });
    document.querySelectorAll('[data-skin]').forEach((b) => b.onclick = () => { const id = b.dataset.skin; S.car = S.car || {}; if (S.car.skinId === id) { S.car.skinId = null; S.car.skinSpec = null; } else { S.car.skinId = id; S.car.skinSpec = EV_GEAR[id].skin; } H.saveS(); collections(); });
    H.$('evOff').onclick = () => { S.evWear = null; if (S.car) { S.car.skinId = null; S.car.skinSpec = null; } H.saveS(); H.refreshLook(); collections(); };
  }
  function eventCard() {
    const k = weekKey() + ev.id, mine = S.evMine[k] || 0, pct = Math.min(100, Math.round(evSum / GOAL * 100));
    H.openModal('<div class="sceneHead"><b>THIS WEEK IN PORT MERIDIAN · ' + season().icon + ' ' + season().name.toUpperCase() + '</b><h2>' + ev.icon + ' ' + H.esc(ev.name) + '</h2><p>' + H.esc(ev.blurb) + '</p></div>' +
      '<div class="evBar"><small>City goal: ' + evSum + ' / ' + GOAL + ' tasks by everyone on the server</small><div><i style="width:' + pct + '%"></i></div><small>Your tasks this week: ' + mine + ' · rewards at 5 and 15</small></div>' +
      '<p class="lkSum">' + (ev.d === -1 ? 'Happening in every district.' : 'Happening in ' + H.esc(H.dname(ev.d)) + (ev.at ? ' around ' + H.esc(ev.at) : '') + '. Look for the task markers.') + '</p><p class="lkSum">Today\'s weather: ' + WX.label + '</p>' +
      '<div class="qAct"><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal;
  }
  const dayKey = () => new Date().toISOString().slice(0, 10);
  function daily() {
    const d = dayKey(), st = S.stat || {}; if (!S.daily || S.daily.day !== d) { const r = mul(hash('daily' + d)), picks = []; while (picks.length < 3) { const i = Math.floor(r() * DAILY.length); if (picks.indexOf(i) < 0) picks.push(i); } S.daily = { day: d, picks, base: {}, done: {} }; picks.forEach((i) => { S.daily.base[DAILY[i][0]] = st[DAILY[i][0]] || 0; }); H.saveS(); }
    return S.daily.picks.map((i) => { const [k, n, t, icon] = DAILY[i], have = Math.min(n, (st[k] || 0) - (S.daily.base[k] || 0)); return { k, n, t, icon, have, done: have >= n }; });
  }
  let dT = 2;
  function dailyTick(dt) { dT -= dt; if (dT > 0) return; dT = 2; const list = daily(); list.forEach((c) => { if (c.done && !S.daily.done[c.k]) { S.daily.done[c.k] = 1; H.saveS(); H.award(60, 'daily challenge'); S.cash = (S.cash || 0) + 40; H.banner(c.icon, 'Daily challenge complete', c.t + ' · +40 cash'); H.stat('daily'); if (list.every((x) => S.daily.done[x.k])) { H.stat('daily3'); H.queueLoot('All three dailies', 1, 'r'); } } }); }
  const dailyText = () => { const l = daily(); return '☀️ ' + l.filter((c) => c.done).length + '/3'; };
  function dailyCard() { const l = daily(); H.openModal('<div class="sceneHead"><b>DAILY CHALLENGES · ' + dayKey() + '</b><h2>Today\'s three</h2><p>New ones every day. Each pays 60 RP and $40; all three earn a rare find.</p></div><div class="inList">' + l.map((c) => '<div class="' + (c.done ? 'ok' : '') + '"><i>' + (c.done ? '✓' : c.icon) + '</i><b>' + H.esc(c.t) + '</b><small>' + c.have + ' / ' + c.n + '</small></div>').join('') + '</div><div class="qAct"><button type="button" id="mClose">Close</button></div>'); H.$('mClose').onclick = H.closeModal; }
  const gearLook = () => (S.evWear && EV_GEAR[S.evWear] && (S.evGear || {})[S.evWear] ? EV_GEAR[S.evWear].look : null);
  const flap = (now, i) => Math.sin(now / 160 + i * 1.7);
  return {
    weather, setup, watch, eventCard, collections, photo, daily, dailyTick, dailyText, dailyCard, gearLook, get ev() { return ev; }, get WX() { return WX; }, weekKey: () => weekKey(),
    stormCall: () => (WX.storm && Math.random() < .55 ? STORM_CALLS[Math.floor(Math.random() * STORM_CALLS.length)] : null),
    tap(near, reach) {
      for (const t of tasks) if (near(t.x, t.y, 30)) { reach(t.x, t.y, () => runTask(t)); return true; }
      for (const p of patches) if (Math.hypot(p.x - H.P.x, p.y - H.P.y) < 6 && near(p.x, p.y, 26)) { reach(p.x, p.y, () => grabPatch(p)); return true; }
      for (const f of flocks) if (Math.hypot(f.x - H.P.x, f.y - H.P.y) < 9 && near(f.x, f.y, 30)) { reach(f.x, f.y + .8, () => countFlock(f)); return true; }
      return false;
    },
    draw(now) {
      const ctx = H.ctx, iso = H.iso, P = H.P;
      tasks.forEach((t) => { const [sx, sy] = iso(t.x, t.y); H.bubble(sx, sy - 34, t.k[0], '#ec4899', now); if (Math.hypot(P.x - t.x, P.y - t.y) < 5) H.label(sx, sy - 58, ev.name + ': ' + t.k[1], '#fbcfe8'); });
      patches.forEach((p) => { const d = Math.hypot(P.x - p.x, P.y - p.y); if (d > 6) return; const [sx, sy] = iso(p.x, p.y); ctx.globalAlpha = Math.min(1, (6 - d) / 3); ctx.font = '16px Meridian,system-ui'; ctx.textAlign = 'center'; ctx.fillText('🎖️', sx, sy - 6 + Math.sin(now / 300) * 3); const tw = (now / 120) % 6; ctx.fillStyle = '#fff7c2'; ctx.beginPath(); ctx.arc(sx + 8, sy - 18 - tw, 1.6, 0, 7); ctx.fill(); ctx.globalAlpha = 1; });
      flocks.forEach((f) => { const d = Math.hypot(P.x - f.x, P.y - f.y); if (d > 14) return; const [sx, sy] = iso(f.x, f.y); for (let i = 0; i < f.n; i++) { const ox = ((i * 37) % 23) - 11, oy = ((i * 53) % 11) - 5, b = flap(now, i) > .85 ? -2 : 0; ctx.fillStyle = i % 3 ? '#8a8f99' : '#6b7280'; ctx.beginPath(); ctx.ellipse(sx + ox, sy + oy + b, 3.2, 2.2, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#4b5563'; ctx.beginPath(); ctx.arc(sx + ox + 2.6, sy + oy - 1.6 + b, 1.3, 0, 7); ctx.fill(); } if (d < 6) H.label(sx, sy - 18, '🐦 Count the flock', '#e5e7eb'); });
    },
    drawFog() { if (!WX.fog || H.inside) return; const ctx = H.ctx, c = ctx.canvas; ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, 'rgba(205,214,224,' + WX.fog * .55 + ')'); g.addColorStop(1, 'rgba(205,214,224,' + WX.fog * .25 + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height); }
  };
}
