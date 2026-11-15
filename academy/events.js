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
  { id: 'july4', d: 2, name: 'Fourth of July on the River', icon: '🎆', at: 'Riverside Park', date: [7, 4], blurb: 'Fireworks over the river. The busiest night of the year.' }
];
export function eventOfWeek(d) {
  d = d || new Date(); const s = season(d), y = d.getFullYear(), j4 = new Date(y, 6, 4); if (Math.abs(d - j4) < 4 * 864e5) return EVENTS.find((e) => e.id === 'july4');
  const pool = EVENTS.filter((e) => !e.date && (!e.season || e.season === s.id)), k = hash(weekKey()) % pool.length; return pool[k];
}
const TASKS = {
  any: [['🚦', 'Traffic post', 'Cars are backing up at the closure. A driver leans out the window.', [['Calmly point them to the detour and keep traffic moving', 1], ['Wave everyone through the closure', 0], ['Argue with the driver', 0]]],
    ['🧒', 'Lost child', 'A girl in a festival T-shirt can\'t find her dad.', [['Stay with her, get a description and radio it out', 1], ['Tell her to wait by the stage alone', 0], ['Walk the whole festival with her', 0]]],
    ['👥', 'Crowd control', 'People are pushing toward the front to see.', [['Calmly redirect people and open a second viewing area', 1], ['Shout at everyone to back up', 0], ['Let it sort itself out', 0]]],
    ['💧', 'Hydration station', 'An older man looks pale and dizzy in the heat.', [['Get him water and shade, and call EMS to check him', 1], ['Tell him to go home', 0], ['Keep walking', 0]]],
    ['❓', 'Visitor questions', 'A family from out of town is totally lost.', [['Give clear directions and point out the first aid tent', 1], ['Shrug', 0], ['Tell them to use their phone', 0]]]],
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
    const W = H.W, lot = ev.at ? W.lots.find((l) => (l.name || '').indexOf(ev.at) >= 0) : null, list = ev.id === 'hurricane' ? TASKS.hurricane.concat(TASKS.any.slice(1, 3)) : TASKS.any;
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
      '<div class="qAct"><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal;
  }
  function eventCard() {
    const k = weekKey() + ev.id, mine = S.evMine[k] || 0, pct = Math.min(100, Math.round(evSum / GOAL * 100));
    H.openModal('<div class="sceneHead"><b>THIS WEEK IN PORT MERIDIAN · ' + season().icon + ' ' + season().name.toUpperCase() + '</b><h2>' + ev.icon + ' ' + H.esc(ev.name) + '</h2><p>' + H.esc(ev.blurb) + '</p></div>' +
      '<div class="evBar"><small>City goal: ' + evSum + ' / ' + GOAL + ' tasks by everyone on the server</small><div><i style="width:' + pct + '%"></i></div><small>Your tasks this week: ' + mine + ' · rewards at 5 and 15</small></div>' +
      '<p class="lkSum">' + (ev.d === -1 ? 'Happening in every district.' : 'Happening in ' + H.esc(H.dname(ev.d)) + (ev.at ? ' around ' + H.esc(ev.at) : '') + '. Look for the task markers.') + '</p><p class="lkSum">Today\'s weather: ' + WX.label + '</p>' +
      '<div class="qAct"><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal;
  }
  const flap = (now, i) => Math.sin(now / 160 + i * 1.7);
  return {
    weather, setup, watch, eventCard, collections, photo, get ev() { return ev; }, get WX() { return WX; },
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
      patches.forEach((p) => { const d = Math.hypot(P.x - p.x, P.y - p.y); if (d > 6) return; const [sx, sy] = iso(p.x, p.y); ctx.globalAlpha = Math.min(1, (6 - d) / 3); ctx.font = '16px system-ui'; ctx.textAlign = 'center'; ctx.fillText('🎖️', sx, sy - 6 + Math.sin(now / 300) * 3); const tw = (now / 120) % 6; ctx.fillStyle = '#fff7c2'; ctx.beginPath(); ctx.arc(sx + 8, sy - 18 - tw, 1.6, 0, 7); ctx.fill(); ctx.globalAlpha = 1; });
      flocks.forEach((f) => { const d = Math.hypot(P.x - f.x, P.y - f.y); if (d > 14) return; const [sx, sy] = iso(f.x, f.y); for (let i = 0; i < f.n; i++) { const ox = ((i * 37) % 23) - 11, oy = ((i * 53) % 11) - 5, b = flap(now, i) > .85 ? -2 : 0; ctx.fillStyle = i % 3 ? '#8a8f99' : '#6b7280'; ctx.beginPath(); ctx.ellipse(sx + ox, sy + oy + b, 3.2, 2.2, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#4b5563'; ctx.beginPath(); ctx.arc(sx + ox + 2.6, sy + oy - 1.6 + b, 1.3, 0, 7); ctx.fill(); } if (d < 6) H.label(sx, sy - 18, '🐦 Count the flock', '#e5e7eb'); });
    },
    drawFog() { if (!WX.fog || H.inside) return; const ctx = H.ctx, c = ctx.canvas; ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, 'rgba(205,214,224,' + WX.fog * .55 + ')'); g.addColorStop(1, 'rgba(205,214,224,' + WX.fog * .25 + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height); }
  };
}
