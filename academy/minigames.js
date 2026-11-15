// Academy Rec Room: quick multiplayer mini games for cadets on shift.
// No weapons, no live fire: knowledge, radio, observation and PT, the same skills the academy trains.
// A room lives at mmo/gm/{code}: m (the host's meta: game, state, start time, seed) and p/{uid} (each player's own answers).
// Every screen is worked out from the shared start time and seed, so all players see the same round at the same moment.

export const GAMES = {
  bowl: { name: 'Fact Bowl', icon: '🧠', blurb: 'Everyone gets the same chapter fact. Fastest right answer scores most, and every right answer counts toward your facts.', rounds: 8, round: 21000, ans: 18000, tag: '8 questions · 3 min' },
  relay: { name: 'Phonetic Relay', icon: '📻', blurb: 'A plate comes over the radio. Pick the correct phonetic read-back before anyone else.', rounds: 8, round: 9000, ans: 7000, tag: '8 plates · 75 sec' },
  bolo: { name: 'BOLO Spotter', icon: '🔎', blurb: 'Study the BOLO for three seconds, then find the exact vehicle in the lot. Near-misses everywhere.', rounds: 6, round: 13500, show: 3500, ans: 10500, tag: '6 lots · 80 sec' },
  run: { name: 'PT Cadence Run', icon: '🏃', blurb: 'A 100-meter run called in cadence. Tap on the beat to stretch your stride. Off-beat taps barely move you.', dur: 25000, dist: 100, beat: 500, tag: '1 race · 25 sec' }
};
const BOTS = [{ id: 'bot_pike', c: 'Cadet Pike', u: '😎', acc: .66, fast: .9 }, { id: 'bot_navarro', c: 'Cadet Navarro', u: '📓', acc: .86, fast: 1.25 }, { id: 'bot_brooks', c: 'Cadet Brooks', u: '🚓', acc: .74, fast: 1 }];
const LEAD = 4000; // countdown before the first round
const mul = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const CODE = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

// ---------- content, identical for everyone from the seed ----------
const NEAR = { A: 'H', B: 'D', C: 'Z', D: 'B', E: 'I', F: 'S', G: 'J', H: 'A', I: 'Y', J: 'G', K: 'Q', L: 'R', M: 'N', N: 'M', O: 'U', P: 'T', Q: 'K', R: 'L', S: 'F', T: 'P', U: 'O', V: 'B', W: 'V', X: 'S', Y: 'I', Z: 'C' };
function relayRound(seed, k, PHON) {
  const r = mul(seed * 31 + k * 977), L = 'ABCDEFGHJKLMNPRSTUVWXYZ', letters = [0, 1, 2].map(() => L[Math.floor(r() * L.length)]), nums = [0, 1, 2].map(() => Math.floor(r() * 10));
  const word = (ch) => PHON[ch.charCodeAt(0) - 65] || ch, say = (ls, ns) => ls.map(word).join(' ') + ', ' + ns.join('-');
  const right = say(letters, nums), opts = [right], tries = [
    () => { const ls = letters.slice(), i = Math.floor(r() * 3); ls[i] = NEAR[ls[i]] || ls[i]; return say(ls, nums); },
    () => { const ns = nums.slice(), i = Math.floor(r() * 2); [ns[i], ns[i + 1]] = [ns[i + 1], ns[i]]; return say(letters, ns); },
    () => { const ls = letters.slice(); [ls[0], ls[1]] = [ls[1], ls[0]]; return say(ls, nums); },
    () => { const ls = letters.slice(), i = 2 - Math.floor(r() * 2); ls[i] = NEAR[ls[i]] || ls[i]; return say(ls, nums); },
    () => { const ns = nums.slice(), i = Math.floor(r() * 3); ns[i] = (ns[i] + 1 + Math.floor(r() * 8)) % 10; return say(letters, ns); }];
  for (let g = 0; opts.length < 4 && g < 40; g++) { const o = tries[Math.floor(r() * tries.length)](); if (opts.indexOf(o) < 0) opts.push(o); }
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  return { plate: letters.join('') + '-' + nums.join(''), opts, c: opts.indexOf(right) };
}
const VT = [['sedan', '🚗'], ['SUV', '🚙'], ['pickup', '🛻'], ['van', '🚐']], VC = [['red', '#c0392b'], ['blue', '#2563eb'], ['white', '#e5e7eb'], ['black', '#1f2937'], ['silver', '#9ca3af'], ['green', '#15803d']], VD = ['dented rear bumper', 'roof rack', 'tinted windows', 'missing hubcap', 'bumper sticker', 'cracked windshield'];
function boloRound(seed, k) {
  const r = mul(seed * 17 + k * 7919), pk = (a) => Math.floor(r() * a.length), plate = () => 'ABCDEFGHJKLMNPRSTUVWXYZ'[pk('ABCDEFGHJKLMNPRSTUVWXYZ')] + 'ABCDEFGHJKLMNPRSTUVWXYZ'[pk('ABCDEFGHJKLMNPRSTUVWXYZ')] + Math.floor(1000 + r() * 9000);
  const bolo = { t: pk(VT), c: pk(VC), d: pk(VD), p: plate() }, cars = [Object.assign({}, bolo)];
  const tweak = (n) => { const c = Object.assign({}, bolo); const keys = ['t', 'c', 'd', 'p'].sort(() => r() - .5).slice(0, n); keys.forEach((kk) => { if (kk === 'p') c.p = r() < .6 ? c.p.slice(0, 2) + String((+c.p.slice(2) + 1 + Math.floor(r() * 8)) % 10000).padStart(4, '1') : c.p[1] + c.p[0] + c.p.slice(2); else { const arr = kk === 't' ? VT : kk === 'c' ? VC : VD; let v = c[kk]; while (v === c[kk]) v = pk(arr); c[kk] = v; } }); return c; };
  const key = (c) => c.t + '|' + c.c + '|' + c.d + '|' + c.p;
  for (let g = 0; cars.length < 8 && g < 80; g++) { const c = tweak(g < 30 ? 1 : 2); if (!cars.some((o) => key(o) === key(c))) cars.push(c); }
  for (let i = cars.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cars[i], cars[j]] = [cars[j], cars[i]]; }
  return { bolo, cars, c: cars.findIndex((o) => key(o) === key(bolo)) };
}
const carTxt = (c) => VC[c.c][0] + ' ' + VT[c.t][0] + ', plate ' + c.p + ', ' + VD[c.d];

// ---------- scoring, worked out the same way on every screen ----------
function roundPts(g, a, ans) {
  if (!a) return 0; const G = GAMES[g];
  if (a.k === ans) return (g === 'bowl' ? 500 : 400) + Math.max(0, Math.floor((g === 'bowl' ? 500 : 600) * (1 - a.ms / (G.ans - (G.show || 0)))));
  if (g === 'bowl' && a.k2 === ans) return 150;
  return 0;
}
export function standings(meta, players, answerOf) {
  const g = meta.g, rows = Object.keys(players || {}).map((id) => { const p = players[id]; let s = 0;
    if (g === 'run') s = p.f ? 2000 + Math.floor((GAMES.run.dur - p.f) / 10) : Math.floor((p.x || 0) * 10);
    else for (let k = 0; k < GAMES[g].rounds; k++) s += roundPts(g, (p.a || {})[k], answerOf(k));
    return { id, c: p.c, u: p.u, s, bot: /^bot_/.test(id) }; });
  return rows.sort((a, b) => b.s - a.s);
}

// ---------- the Rec Room ----------
export function createMiniGames(dep) {
  const { esc } = dep; let el = null, room = null, raf = 0, glStop = null, roomStop = null, lobbies = {}, lastRender = '', toldLobby = {};
  const now = () => dep.now();
  const me = () => (dep.net ? dep.net.uid : 'me');
  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  function shell() { if (!el) { el = mk('div', 'mg'); el.id = 'mg'; document.body.appendChild(el); } el.hidden = false; requestAnimationFrame(() => el.classList.add('in')); dep.pause(true); }
  function close() { stopRoom(); if (el) { el.classList.remove('in'); setTimeout(() => { if (el && !el.classList.contains('in')) { el.hidden = true; el.innerHTML = ''; } }, 250); } dep.pause(false); }
  function stopRoom() { cancelAnimationFrame(raf); raf = 0; if (roomStop) roomStop(); roomStop = null; if (room && !room.local && dep.net) { try { dep.net.grm('mmo/gm/' + room.code + '/p/' + me()); if (room.meta && room.meta.h === me()) { dep.net.grm('mmo/gl/' + room.d + '/' + room.code); if (room.meta.st !== 'play') dep.net.grm('mmo/gm/' + room.code + '/m'); } } catch (e) {} } room = null; }
  // open lobbies in this district (and a heads-up when someone opens one)
  function watch(did) {
    if (glStop) glStop(); glStop = null; lobbies = {}; if (!dep.net) return;
    glStop = dep.net.gon('mmo/gl/' + did, (v) => { lobbies = v || {}; Object.keys(lobbies).forEach((c) => { const l = lobbies[c]; if (!l || l.h === me() || toldLobby[c] || now() - l.t > 6e5) return; toldLobby[c] = 1; dep.toast('🎮 ' + l.c + ' opened a ' + GAMES[l.g].name + ' room. Menu → Rec Room to join (code ' + c + ').'); }); if (el && !el.hidden && !room) hub(); });
  }
  function hub() {
    shell(); stopRoom(); const d = dep.did(), open = Object.keys(lobbies).filter((c) => lobbies[c] && now() - lobbies[c].t < 6e5);
    el.innerHTML = '<div class="mgCard wide"><div class="mgHead"><span>Academy Rec Room · ' + esc(dep.dname()) + '</span><h2>Mini games</h2><p>Play with whoever is on shift. Sim training only: brains, radio, eyes and legs.</p></div>' +
      (open.length ? '<div class="mgSec">Open rooms nearby</div><div class="mgRooms">' + open.map((c) => { const l = lobbies[c]; return '<button type="button" class="mgRoom" data-join="' + c + '"><span>' + GAMES[l.g].icon + '</span><b>' + esc(GAMES[l.g].name) + '</b><small>' + esc(l.c) + ' · ' + (l.n || 1) + ' in room · ' + c + '</small><em>Join</em></button>'; }).join('') + '</div>' : '') +
      '<div class="mgSec">Pick a game</div><div class="mgGames">' + Object.keys(GAMES).map((g) => { const G = GAMES[g]; return '<div class="mgGame"><div class="mgGI">' + G.icon + '</div><div class="mgGT"><b>' + G.name + '</b><small>' + G.tag + '</small><p>' + G.blurb + '</p><div class="mgGB">' + (dep.net ? '<button type="button" data-host="' + g + '">Host a room</button>' : '') + '<button type="button" class="ghost" data-solo="' + g + '">Practice vs. classmates</button></div></div></div>'; }).join('') + '</div>' +
      (dep.net ? '<div class="mgJoin"><input id="mgCode" maxlength="5" placeholder="Room code" autocomplete="off" autocapitalize="characters"><button type="button" id="mgJoinGo">Join</button></div>' : '<p class="mgNote">Multiplayer needs a connection. Practice mode works offline.</p>') +
      '<div class="mgAct"><button type="button" class="ghost" id="mgX">Back to patrol</button></div></div>';
    el.querySelector('#mgX').onclick = close;
    el.querySelectorAll('[data-host]').forEach((b) => b.onclick = () => host(b.dataset.host));
    el.querySelectorAll('[data-solo]').forEach((b) => b.onclick = () => practice(b.dataset.solo));
    el.querySelectorAll('[data-join]').forEach((b) => b.onclick = () => join(b.dataset.join));
    const go = el.querySelector('#mgJoinGo'); if (go) go.onclick = () => { const c = (el.querySelector('#mgCode').value || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (c.length === 5) join(c); else dep.toast('Room codes are 5 characters.'); };
  }
  const myEntry = () => ({ c: dep.cs(), u: dep.icon(), t: dep.net ? dep.net.TS : Date.now() });
  async function host(g) {
    const code = CODE(), d = dep.did(), uid = me(), base = 'mmo/gm/' + code;
    try {
      await dep.net.gset(base + '/m', { g, h: uid, st: 'lobby', t: dep.net.TS, n: dep.cs(), d });
      await dep.net.gset(base + '/p/' + uid, myEntry());
      await dep.net.gset('mmo/gl/' + d + '/' + code, { g, h: uid, c: dep.cs(), t: dep.net.TS, n: 1 });
      dep.net.gbye(base + '/p/' + uid); dep.net.gbye(base + '/m'); dep.net.gbye('mmo/gl/' + d + '/' + code);
    } catch (e) { dep.toast('Could not open a room right now.'); return; }
    enter({ code, d, local: false });
  }
  async function join(code) {
    let v = null; try { v = await dep.net.gget('mmo/gm/' + code); } catch (e) {}
    if (!v || !v.m) { dep.toast('No room with code ' + code + '.'); return; }
    if (v.m.st === 'play') { dep.toast('That game already started. Catch the next one.'); return; }
    if (Object.keys(v.p || {}).length >= 24) { dep.toast('That room is full.'); return; }
    try { await dep.net.gset('mmo/gm/' + code + '/p/' + me(), myEntry()); dep.net.gbye('mmo/gm/' + code + '/p/' + me()); } catch (e) { dep.toast('Could not join that room.'); return; }
    enter({ code, d: v.m.d, local: false });
  }
  function practice(g) {
    const players = { me: { c: dep.cs(), u: dep.icon(), t: Date.now() } }; BOTS.forEach((b) => { players[b.id] = { c: b.c, u: b.u, t: Date.now() }; });
    room = { code: 'PRACTICE', local: true, meta: { g, h: 'me', st: 'lobby', n: dep.cs() }, players, uid: 'me' }; shell(); loop();
  }
  function enter(r) {
    shell(); room = Object.assign(r, { meta: null, players: {}, uid: me() });
    roomStop = dep.net.gon('mmo/gm/' + r.code, (v) => { if (!room) return; if (!v || !v.m) { dep.toast('The host closed the room.'); hub(); return; } const was = room.meta && room.meta.st; room.meta = v.m; room.players = v.p || {}; if (was === 'play' && v.m.st === 'lobby') { room.awarded = false; room.mine = {}; } if (room.meta.h === me() && v.m.st === 'lobby') { try { dep.net.gupd('mmo/gl/' + room.d + '/' + room.code, { n: Object.keys(room.players).length }); } catch (e) {} } });
    loop();
  }
  // host: start the game for everyone
  async function start() {
    const g = room.meta.g, seed = Math.floor(Math.random() * 1e9), m = { st: 'play', seed, t0: now() + LEAD };
    if (g === 'bowl') m.fq = dep.L.pickFactIds(dep.S, dep.lessons(), GAMES.bowl.rounds).map((x) => x.join(':')).join(',');
    Object.keys(room.players).forEach((id) => { const p = room.players[id]; delete p.a; delete p.x; delete p.f; });
    room.mine = {}; room.awarded = false; room.bot = {};
    if (room.local) { Object.assign(room.meta, m); return; }
    const up = { m: Object.assign({}, room.meta, m) }; Object.keys(room.players).forEach((id) => { up['p/' + id + '/a'] = null; up['p/' + id + '/x'] = null; up['p/' + id + '/f'] = null; });
    try { await dep.net.gupd('mmo/gm/' + room.code, up); dep.net.grm('mmo/gl/' + room.d + '/' + room.code); } catch (e) { dep.toast('Could not start. Try again.'); }
  }
  async function again() {
    if (room.local) { room.meta.st = 'lobby'; room.awarded = false; Object.values(room.players).forEach((p) => { delete p.a; delete p.x; delete p.f; }); lastRender = ''; return; }
    if (room.meta.h !== me()) return;
    try { await dep.net.gupd('mmo/gm/' + room.code + '/m', { st: 'lobby' }); await dep.net.gset('mmo/gl/' + room.d + '/' + room.code, { g: room.meta.g, h: me(), c: dep.cs(), t: dep.net.TS, n: Object.keys(room.players).length }); } catch (e) {}
  }
  // answers: written to my own entry (bots' answers live only in practice rooms)
  function answer(k, val, ms, second) {
    const mine = (room.mine = room.mine || {}), a = mine[k] = mine[k] || {}; if (second) { a.k2 = val; a.ms2 = ms; } else { a.k = val; a.ms = ms; }
    if (room.local) { const p = room.players.me; p.a = p.a || {}; p.a[k] = Object.assign({}, a); return; }
    try { dep.net.gupd('mmo/gm/' + room.code + '/p/' + me() + '/a/' + k, second ? { k2: val, ms2: ms } : { k: val, ms }); } catch (e) {}
  }
  // ---------- the round clock ----------
  const plan = (m) => { const G = GAMES[m.g]; return m.g === 'run' ? { end: m.t0 + G.dur + 3000 } : { end: m.t0 + G.rounds * G.round }; };
  function phase() {
    const m = room.meta, G = GAMES[m.g], t = now() - m.t0;
    if (t < 0) return { pre: true, left: -t };
    if (m.g === 'run') return t < G.dur ? { run: true, t } : t < G.dur + 3000 ? { runEnd: true, t } : { done: true };
    const k = Math.floor(t / G.round); if (k >= G.rounds) return { done: true };
    const rt = t - k * G.round, show = G.show || 0;
    return { k, rt, memo: rt < show, open: rt >= show && rt < G.ans, reveal: rt >= G.ans, left: (rt < show ? show - rt : G.ans - rt) };
  }
  const qCache = {};
  function content(k) {
    const m = room.meta, key = m.g + m.seed + ':' + k; if (qCache[key]) return qCache[key];
    let c = null;
    if (m.g === 'relay') c = relayRound(m.seed, k, dep.PHON);
    else if (m.g === 'bolo') c = boloRound(m.seed, k);
    else if (m.g === 'bowl') { const ids = String(m.fq || '').split(','), x = (ids[k] || '').split(':'); const q = x[0] ? dep.L.factQFixed(x[0], +x[1], mul(m.seed + k * 131)) : null; c = q ? { q, c: q.c } : null; }
    qCache[key] = c; return c;
  }
  const answerOf = (k) => { const c = content(k); return c ? c.c : -1; };
  // practice classmates: answer each round with their own speed and accuracy
  function botsTick(P) {
    if (!room.local || !room.meta || room.meta.st !== 'play') return; const m = room.meta, G = GAMES[m.g]; room.bot = room.bot || {};
    BOTS.forEach((b) => { const p = room.players[b.id]; if (!p) return;
      if (m.g === 'run') { if (P.run) { const st = room.bot[b.id] = room.bot[b.id] || { x: 0, next: 0 }; if (P.t >= st.next) { st.next = P.t + G.beat; st.x += (Math.random() < b.acc ? 3 : Math.random() < .5 ? 1.5 : .3) * (.9 + Math.random() * .2); p.x = Math.min(G.dist, st.x); if (p.x >= G.dist && !p.f) p.f = P.t; } } return; }
      if (P.k == null || !P.open) return; const key = b.id + P.k; if (room.bot[key] == null) room.bot[key] = (G.show || 0) + Math.min(G.ans - (G.show || 0) - 400, (1200 + Math.random() * 4200) * b.fast);
      if (P.rt >= room.bot[key] && !((p.a || {})[P.k])) { const right = Math.random() < b.acc, c = content(P.k); let k2 = right ? c.c : (c.c + 1 + Math.floor(Math.random() * 3)) % (c.q ? c.q.opts.length : c.opts ? c.opts.length : c.cars.length); p.a = p.a || {}; p.a[P.k] = { k: k2, ms: Math.round(room.bot[key] - (G.show || 0)) }; }
    });
  }
  // ---------- drawing ----------
  let tapAt = [], runX = 0, runSent = 0, lastBeat = -1;
  function loop() {
    cancelAnimationFrame(raf);
    const step = () => { raf = requestAnimationFrame(step); if (!room) return; try { draw(); } catch (e) { console.warn(e); } };
    lastRender = ''; step();
  }
  const podium = (rows) => rows.slice(0, 12).map((r, i) => '<div class="mgRow' + (r.id === room.uid ? ' me' : '') + '"><i>' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</i><span>' + esc(r.u || '👮') + '</span><b>' + esc(r.c) + (r.bot ? ' <em>practice</em>' : '') + '</b><strong>' + r.s + '</strong></div>').join('');
  function draw() {
    if (!room.meta) { if (lastRender !== 'wait') { lastRender = 'wait'; el.innerHTML = '<div class="mgCard"><p class="mgNote">Connecting to the room…</p></div>'; } return; }
    const m = room.meta, G = GAMES[m.g];
    if (m.st === 'lobby') return lobbyView();
    const P = phase(); botsTick(P);
    if (P.done) return results();
    if (P.pre) { const n = Math.ceil(P.left / 1000); if (lastRender !== 'pre' + n) { lastRender = 'pre' + n; el.innerHTML = '<div class="mgCard mgPre"><span>' + G.icon + ' ' + esc(G.name) + '</span><div class="mgCount">' + n + '</div><p>' + esc(G.blurb) + '</p></div>'; dep.beep(n > 1 ? 523 : 784, .12, 'triangle', .05); } return; }
    if (m.g === 'run') return runView(P);
    roundView(P);
  }
  function lobbyView() {
    const m = room.meta, G = GAMES[m.g], ids = Object.keys(room.players), isHost = room.local || m.h === me(), key = 'lobby' + ids.join(',') + isHost;
    if (lastRender === key) return; lastRender = key;
    el.innerHTML = '<div class="mgCard"><div class="mgHead"><span>' + G.icon + ' ' + esc(G.name) + (room.local ? ' · practice' : '') + '</span><h2>' + (room.local ? 'Practice round' : 'Room ' + room.code) + '</h2><p>' + esc(G.blurb) + '</p></div>' +
      (room.local ? '' : '<div class="mgCode"><small>Room code</small><b>' + room.code + '</b><small>Anyone on shift can join with this code.</small></div>') +
      '<div class="mgSec">' + ids.length + ' cadet' + (ids.length > 1 ? 's' : '') + ' in the room</div><div class="mgList">' + ids.map((id) => { const p = room.players[id]; return '<div class="mgRow' + (id === room.uid ? ' me' : '') + '"><span>' + esc(p.u || '👮') + '</span><b>' + esc(p.c) + (id === m.h || (room.local && id === 'me') ? ' <em>host</em>' : '') + '</b></div>'; }).join('') + '</div>' +
      '<div class="mgAct">' + (isHost ? '<button type="button" id="mgStart">Start' + (ids.length < 2 && !room.local ? ' (solo)' : '') + '</button>' : '<p class="mgNote">Waiting for the host to start…</p>') + (!room.local && dep.squadPost ? '<button type="button" class="ghost" id="mgInv">Invite my squad</button>' : '') + '<button type="button" class="ghost" id="mgLeave">Leave</button></div></div>';
    const s = el.querySelector('#mgStart'); if (s) s.onclick = () => { s.disabled = true; start(); };
    const inv = el.querySelector('#mgInv'); if (inv) inv.onclick = () => { dep.squadPost('🎮 Join my ' + G.name + ' room: code ' + room.code + ' (Menu → Rec Room)'); inv.disabled = true; inv.textContent = 'Squad invited'; };
    el.querySelector('#mgLeave').onclick = () => hub();
  }
  function roundView(P) {
    const m = room.meta, G = GAMES[m.g], k = P.k, c = content(k), mine = (room.mine || {})[k] || ((room.players[room.uid] || {}).a || {})[k] || null;
    const myAns = mine ? mine.k : null, second = m.g === 'bowl' && mine && mine.k !== c.c && mine.k2 == null && P.open;
    const key = 'r' + k + (P.memo ? 'm' : P.open ? 'o' : 'r') + (mine ? 'a' + mine.k + '_' + (mine.k2 == null ? '' : mine.k2) : '');
    if (lastRender !== key) {
      lastRender = key; const head = '<div class="mgBar"><span>' + G.icon + ' ' + esc(G.name) + '</span><b>Round ' + (k + 1) + ' of ' + G.rounds + '</b><i id="mgT"></i></div>';
      let body = '';
      if (m.g === 'bowl') body = '<p class="mgQ">' + esc(c.q.stem) + '</p>' + opts(c.q.opts, mine, c.c, P, second);
      if (m.g === 'relay') body = '<div class="mgPlate"><small>Read this plate back over the radio</small><b>' + c.plate + '</b></div>' + opts(c.opts, mine, c.c, P, false);
      if (m.g === 'bolo') body = P.memo ? '<div class="mgBolo"><small>BE ON THE LOOKOUT</small><span>' + VT[c.bolo.t][1] + '</span><b>' + esc(carTxt(c.bolo)) + '</b><i style="background:' + VC[c.bolo.c][1] + '"></i></div>' :
        '<p class="mgQ">Which vehicle matches the BOLO exactly?</p><div class="mgLot">' + c.cars.map((v, i) => '<button type="button" data-o="' + i + '" class="mgCar' + cls(i, mine, c.c, P) + '"' + (mine || !P.open ? ' disabled' : '') + '><span>' + VT[v.t][1] + '</span><i style="background:' + VC[v.c][1] + '"></i><b>' + v.p + '</b><small>' + esc(VC[v.c][0] + ' ' + VT[v.t][0]) + '<br>' + esc(VD[v.d]) + '</small></button>').join('') + '</div>' + (P.reveal ? '<p class="mgEx">BOLO: ' + esc(carTxt(c.bolo)) + '</p>' : '');
      if (P.reveal && m.g === 'bowl') body += '<p class="mgEx">' + esc(c.q.fact || c.q.ex || '') + '</p>';
      if (P.reveal && m.g === 'relay') body += '<p class="mgEx">Plate ' + c.plate + ': ' + esc(c.opts[c.c]) + '</p>';
      const rows = standings(m, room.players, answerOf).slice(0, 5);
      el.innerHTML = '<div class="mgCard mgPlay">' + head + body + (second ? '<p class="mgRetry">Not quite. One more try for partial points.</p>' : '') + '<div class="mgMini">' + rows.map((r, i) => '<span class="' + (r.id === room.uid ? 'me' : '') + '">' + (i + 1) + '. ' + esc(r.c.replace(/^Cadet /, '')) + ' <b>' + r.s + '</b></span>').join('') + '</div></div>';
      el.querySelectorAll('[data-o]').forEach((b) => b.onclick = () => {
        const P2 = phase(); if (!P2.open || P2.k !== k) return; const o = +b.dataset.o, ms = Math.round(P2.rt - (G.show || 0)), cur = (room.mine || {})[k];
        if (cur && !(m.g === 'bowl' && cur.k !== c.c && cur.k2 == null)) return;
        const sec = !!cur; answer(k, o, ms, sec); const ok = o === c.c; dep.beep(ok ? 880 : 220, .12, ok ? 'triangle' : 'sawtooth', .04);
        if (m.g === 'bowl' && (ok || sec)) { dep.L.record(dep.S, c.q, ok); dep.saveS(); }
      });
      if (P.reveal) { const got = roundPts(m.g, mine, c.c); dep.beep(got ? 1047 : 330, .15, 'triangle', .03); }
    }
    const t = el.querySelector('#mgT'); if (t) t.textContent = P.reveal ? 'next…' : Math.ceil(P.left / 1000) + 's';
  }
  const cls = (i, mine, ans, P) => (P.reveal || (mine && (mine.k === ans || mine.k2 != null || room.meta.g !== 'bowl'))) ? (i === ans ? ' ok' : mine && (mine.k === i || mine.k2 === i) ? ' no' : ' dim') : mine && mine.k === i ? ' no' : '';
  function opts(list, mine, ans, P, second) { return '<div class="mgOpts">' + list.map((o, i) => '<button type="button" data-o="' + i + '" class="' + cls(i, mine, ans, P) + '"' + ((mine && !second) || !P.open || (second && mine.k === i) ? ' disabled' : '') + '><span>' + 'ABCD'[i] + '</span>' + esc(o) + '</button>').join('') + '</div>'; }
  // PT run: tap on the beat
  const CALLS = ['Left... left... left, right, left', 'Pick it up, cadet, pick it up', 'Eyes up, chest out, hold that pace', 'Every step counts, every breath too', 'One more block and the finish line'];
  function runView(P) {
    const m = room.meta, G = GAMES.run, ids = Object.keys(room.players);
    if (lastRender.slice(0, 3) !== 'run') {
      lastRender = 'run'; runX = 0; runSent = 0; lastBeat = -1;
      el.innerHTML = '<div class="mgCard mgPlay"><div class="mgBar"><span>🏃 PT Cadence Run</span><b id="mgCall">' + CALLS[0] + '</b><i id="mgT"></i></div><div class="mgTrack" id="mgTrack"></div><div class="mgBeat"><i id="mgPulse"></i></div><button type="button" class="mgTap" id="mgTap">TAP ON THE BEAT</button><p class="mgNote">Space bar works too.</p></div>';
      const tap = (e) => { if (e) e.preventDefault(); const P2 = phase(); if (!P2.run) return; const t = P2.t, ph = t % G.beat, d = Math.min(ph, G.beat - ph), gain = d < 90 ? 3 : d < 180 ? 1.5 : .3; runX = Math.min(G.dist, runX + gain); const b = el.querySelector('#mgTap'); if (b) { b.classList.remove('good', 'ok', 'bad'); void b.offsetWidth; b.classList.add(d < 90 ? 'good' : d < 180 ? 'ok' : 'bad'); }
        const p = room.players[room.uid] || {}; p.x = runX; if (runX >= G.dist && !p.f) { p.f = t; push(true); dep.beep(1319, .3, 'triangle', .05); } };
      el.querySelector('#mgTap').addEventListener('pointerdown', tap);
      el._key = (e) => { if (e.code === 'Space' && room && room.meta && room.meta.g === 'run') tap(e); }; addEventListener('keydown', el._key);
    }
    const push = (force) => { const t = performance.now(); if (!force && t - runSent < 300) return; runSent = t; const p = room.players[room.uid] || {}; if (room.local) return; try { dep.net.gupd('mmo/gm/' + room.code + '/p/' + me(), p.f ? { x: runX, f: p.f } : { x: runX }); } catch (e) {} };
    if (P.run) push(false);
    const bt = P.run ? Math.floor(P.t / G.beat) : -1; if (bt !== lastBeat && P.run) { lastBeat = bt; dep.beep(bt % 4 === 0 ? 660 : 440, .05, 'square', .03); const pl = el.querySelector('#mgPulse'); if (pl) { pl.classList.remove('on'); void pl.offsetWidth; pl.classList.add('on'); } if (bt % 8 === 0) { const c = el.querySelector('#mgCall'); if (c) c.textContent = CALLS[(bt / 8) % CALLS.length]; } }
    const tr = el.querySelector('#mgTrack'); if (tr) { const rows = ids.map((id) => { const p = room.players[id]; return { id, c: p.c, u: p.u, x: id === room.uid ? runX : (p.x || 0), f: p.f }; }).sort((a, b) => (a.id === room.uid ? -1 : b.id === room.uid ? 1 : b.x - a.x)).slice(0, 10);
      tr.innerHTML = rows.map((r) => '<div class="mgLane' + (r.id === room.uid ? ' me' : '') + '"><b>' + esc(r.c.replace(/^Cadet /, '')) + '</b><div><i style="left:' + (r.x / G.dist * 100) + '%">' + (r.f ? '🏁' : '🏃') + '</i></div><em>' + Math.round(r.x) + 'm</em></div>').join(''); }
    const t = el.querySelector('#mgT'); if (t) t.textContent = P.run ? Math.ceil((G.dur - P.t) / 1000) + 's' : 'time!';
  }
  function results() {
    const m = room.meta, G = GAMES[m.g]; if (el._key) { removeEventListener('keydown', el._key); el._key = null; }
    if (m.g === 'run' && !room.local) { const p = room.players[room.uid]; if (p && runX > (p.x || 0)) p.x = runX; }
    const rows = standings(m, room.players, answerOf), humans = rows.filter((r) => !r.bot).length, myRank = rows.findIndex((r) => r.id === room.uid), key = 'res' + rows.map((r) => r.id + r.s).join(',');
    if (!room.awarded) {
      room.awarded = true; const place = myRank + 1, vs = room.local ? rows.length : humans, rp = room.local ? 20 + (place === 1 ? 30 : 0) : 40 + (vs >= 2 ? [0, 120, 70, 40][place] || 10 : 0);
      dep.award(rp, G.name); dep.stat('mg'); dep.stat('mg_' + m.g); if (place === 1 && vs >= 2 && !room.local) dep.stat('mgwin'); if (place === 1 && room.local) dep.stat('mgpwin');
      if (m.g === 'bowl') { const mine = rows[myRank]; if (mine && mine.s >= G.rounds * 700) dep.stat('mgbowlace'); }
      if (!room.local && m.h === me()) { try { dep.net.gupd('mmo/gm/' + room.code + '/m', { st: 'done' }); } catch (e) {} }
      dep.beep(place === 1 ? 1047 : 659, .4, 'triangle', .05);
    }
    if (lastRender === key) return; lastRender = key;
    const isHost = room.local || m.h === me();
    el.innerHTML = '<div class="mgCard"><div class="mgHead"><span>' + G.icon + ' ' + esc(G.name) + ' · final</span><h2>' + (myRank === 0 ? 'You won!' : 'You placed ' + (myRank + 1) + ' of ' + rows.length) + '</h2><p>' + (m.g === 'bowl' ? 'Every right answer counted toward your chapter facts.' : 'Good training. Same time next shift?') + '</p></div><div class="mgList">' + podium(rows) + '</div>' +
      '<div class="mgAct">' + (isHost ? '<button type="button" id="mgAgain">Play again</button>' : '<p class="mgNote">The host can start another round.</p>') + '<button type="button" class="ghost" id="mgHub">Other games</button><button type="button" class="ghost" id="mgX">Back to patrol</button></div></div>';
    const a = el.querySelector('#mgAgain'); if (a) a.onclick = () => again();
    el.querySelector('#mgHub').onclick = () => hub(); el.querySelector('#mgX').onclick = close;
  }
  return { open: hub, watch, close, get busy() { return !!(el && !el.hidden); } };
}
