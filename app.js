import { connect } from './db.js';
import * as SQ from './squads.js';

// ================================================================ shared
const CFG = window.LIVE_CONFIG || {};
const params = new URLSearchParams(location.search);
const MOCK = params.has('mock');
const MQ = MOCK ? '&mock' : '';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = (n) => Math.round(n || 0).toLocaleString('en-US');
const SHAPES = [
  '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
  '<path d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z"/>',
  '<circle cx="12" cy="12" r="8.5"/>',
  '<rect x="4" y="4" width="16" height="16" rx="2.5"/>'
];
const shape = (i) => '<svg viewBox="0 0 24 24" class="shp" aria-hidden="true">' + SHAPES[i] + '</svg>';
const TEAMS = ['Alpha', 'Bravo', 'Charlie', 'Delta'];
const tn = (g, t) => String((g && g.tnames && g.tnames[t]) || TEAMS[t] || 'Team');
const MODES = {
  classic: ['Classic quiz', 'Quick-fire multiple choice on everyone\'s phone. Faster right answers score more.'],
  raid: ['Boss Raid', 'The whole group fights one boss together. Every right answer is a hit; fast ones hit twice.'],
  tf: ['True/False Showdown', 'One statement at a time, straight from the chapter or with one detail changed. Call it fast.'],
  board: ['Team Category Board', 'Jeopardy-style clues by lesson. Teams take turns picking tiles; answer in the form of a question.']
};
const DANGLE = {
  win: ['First place. Do not let it go to your head; there is not much room up there.', 'You won. I will allow one (1) smile. Not that one. Smaller.', 'Top of the board. Your instructors will be told. They will not care, but they will be told.'],
  podium: ['Podium finish. Respectable. Barely, but respectable.', 'Top three. The academy has seen worse. Recently. From you.', 'Close to the top. Close does not count, except here, where it does. Slightly.'],
  rest: ['That was a performance. Of what, I am still deciding.', 'You finished. That is the nicest thing I can say about it.', 'Back to the hub, cadet. The book is not going to read itself, and neither, apparently, are you.'],
  report: ['Report received. Your squad thanks you. I do not, but your squad does.', 'Logged. Filed. Initialed. Do it again tomorrow.', 'You reported in. Somewhere, a sergeant nodded. Once.'],
  squad: ['A squad is only as strong as its least-studied member. Do not be that member.', 'Teamwork makes the dream work. I do not have dreams. I have checklists.', 'Your squad is watching. So am I. I am always watching.']
};
export const dangle = (k) => { const a = DANGLE[k] || DANGLE.rest; return '<div class="dangle"><span class="dgIcon" aria-hidden="true">DD</span><p><b>Deputy Dangle:</b> ' + a[Math.floor(Math.random() * a.length)] + '</p></div>'; };
const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem('live:' + k)); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem('live:' + k, JSON.stringify(v)); } catch (e) {} }
};
let api = null;
const banks = {};
async function bank(ch) {
  if (banks[ch]) return banks[ch];
  const c = (CFG.chapters || []).find((x) => x.id === ch);
  if (!c) throw new Error('Unknown chapter');
  const r = await fetch(c.file); banks[ch] = await r.json(); return banks[ch];
}
function view(html) { $('app').innerHTML = html; window.scrollTo(0, 0); }
// header: the chapter's name and a way back to its study hub
function setHub(chId) {
  const c = (CFG.chapters || []).find((x) => x.id === chId) || (CFG.chapters || [])[0]; if (!c) return;
  $('ttl').innerHTML = esc(c.title + ' Study Hub') + '<small>' + esc(CFG.siteName || 'Live') + '</small>';
  const a = $('hubLink'); if (c.hub) { a.href = c.hub; a.hidden = false; $('hubTxt').textContent = 'Back to ' + c.title; } else a.hidden = true;
  HUB = c;
}
let HUB = null;
const hubBtn = () => (HUB && HUB.hub ? '<a class="btn hubBtn backHub" href="' + esc(HUB.hub) + '">Back to ' + esc(HUB.title) + ' Study Hub</a>' : '');
// opened from the hub: going back closes this tab, which leaves the hub showing; otherwise it goes to the hub here
const FROM_HUB = params.get('from') === 'hub' || sessionStorage.getItem('fromHub') === '1';
if (FROM_HUB) { try { sessionStorage.setItem('fromHub', '1'); } catch (e) {} }
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('#hubLink, .backHub'); if (!a || !FROM_HUB) return;
  e.preventDefault();
  // close this tab (the hub is still open in the one before it); if the phone won't allow that, say where the hub is instead of opening another copy
  try { window.close(); } catch (x) {}
  setTimeout(() => {
    if (document.hidden) return;
    let m = $('backNote');
    if (!m) { m = document.createElement('div'); m.id = 'backNote'; m.className = 'backNote'; document.body.appendChild(m); }
    m.innerHTML = '<b>Your study hub is still open in your other tab.</b><span>Switch back to it with your browser\'s tab button, or close this tab. Nothing here is lost.</span><button type="button">OK</button>';
    m.querySelector('button').onclick = () => m.remove();
  }, 300);
});
function toast(t) { const e = document.createElement('div'); e.className = 'toast'; e.textContent = t; document.body.appendChild(e); setTimeout(() => e.remove(), 2600); }
const CTX = { CFG, params, MQ, MOCK, store, esc: (x) => esc(x), fmt: (x) => fmt(x), view: (h) => view(h), toast: (t) => toast(t), hubBtn: () => hubBtn(), dangle: (k) => dangle(k), ready: () => ready(), weekKey: (t) => weekKey(t), get api() { return api; } };
async function ready() {
  if (api) return api;
  if (!MOCK && !(CFG.firebase && CFG.firebase.apiKey)) throw new Error('setup');
  api = await connect(CFG.firebase, MOCK); return api;
}
const notReady = (e) => '<section class="card"><h1>Almost ready</h1><p>' + (e && e.message === 'setup' ? 'This site needs its Firebase settings in <code>config.js</code>. Follow the setup guide.' : 'Could not reach the game server. Check your internet and reload.') + '</p></section>';
const points = (ms, dur) => Math.round(1000 * (1 - Math.min(1, Math.max(0, ms / (dur * 1000))) / 2));
const place = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const arr = (x) => (Array.isArray(x) ? x : x ? Object.keys(x).sort((a, b) => a - b).map((k) => x[k]) : []);
const norm = (g) => { if (g) { g.set = arr(g.set); g.ord = arr(g.ord); if (g.cols) g.cols = arr(g.cols).map((c) => Object.assign({}, c, { q: arr(c.q) })); } return g; };
const ranked = (g) => {
  const ps = g.players || {}, sc = g.scores || {};
  return Object.keys(ps).map((u) => ({ u, name: ps[u].name, team: (g.team || {})[u], s: (sc[u] && sc[u].s) || 0, st: (sc[u] && sc[u].st) || 0, d: (sc[u] && sc[u].d) || 0 })).sort((a, b) => b.s - a.s || a.name.localeCompare(b.name));
};
// what the options are for the current question, and whether a picked option is right
// each mode has its own style of question: Kahoot-style multiple choice (q), true/false statements (tq), Jeopardy clues (jq)
function rowOf(g, b) {
  if (g.mode === 'board') return b.jq[g.cur.q];
  if (g.mode === 'tf') { const t = b.tq[g.set[g.qi]]; return [g.tv ? t[0] : t[1][g.fi % t[1].length], ['True', 'False'], g.tv ? 0 : 1, t[2], t[3], t[4], t[0]]; }
  return b.q[g.set[g.qi]];
}
function optionsOf(g, row) {
  if (g.mode === 'tf') return [{ t: 'True', k: 0 }, { t: 'False', k: 1 }];
  return g.ord.map((oi, k) => ({ t: row[1][oi], k }));
}
function isRight(g, row, a) {
  if (g.mode === 'tf') return a === row[2];
  return g.ord[a] === row[2];
}
const rightIndex = (g, row) => (g.mode === 'tf' ? row[2] : g.ord.indexOf(row[2]));
const qLabel = (g) => (g.mode === 'board' ? (g.cur && g.cur.fin ? 'Final question' : (g.cols[g.cur.c].t + ' · ' + tileVal(g.cur.r) + (g.cur.dd ? ' · Daily Double' : ''))) : 'Question ' + (g.qi + 1) + ' of ' + g.set.length);
const tileVal = (r) => (r + 1) * 100;

// ================================================================ join
function home(msg) {
  const pin = params.get('pin') || '';
  view('<section class="card join"><div class="brand">' + esc(CFG.siteName || 'Live Drill') + '</div><h1>Join a game</h1>' +
    '<form id="joinF" autocomplete="off"><label>Game PIN<input id="pin" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="123456" value="' + esc(pin) + '"></label>' +
    '<label>Nickname<input id="nick" maxlength="16" placeholder="Your name" value="' + esc(store.get('nick') || '') + '"></label>' +
    '<button type="submit" class="main">Enter</button></form>' + (msg ? '<p class="err" role="alert">' + esc(msg) + '</p>' : '') +
    '<p class="small"><a href="?host' + MQ + '">Host a game</a> · <a href="?boards' + MQ + '">Leaderboards</a> · <a href="?squads' + MQ + '">Squads</a></p></section>');
  $('joinF').onsubmit = (e) => { e.preventDefault(); join($('pin').value.trim(), $('nick').value.trim()); };
  (pin ? $('nick') : $('pin')).focus();
}
async function join(pin, nick) {
  if (!/^\d{6}$/.test(pin)) return home('Enter the 6-digit PIN shown on the host screen.');
  nick = nick.replace(/\s+/g, ' ').slice(0, 16);
  if (nick.length < 2) return home('Pick a nickname of at least 2 characters.');
  view('<section class="card center"><div class="spin"></div><p>Joining…</p></section>');
  try { await ready(); } catch (e) { return home(e.message === 'setup' ? 'This site is not connected to its database yet.' : 'Could not connect. Check your internet and try again.'); }
  const g = await api.get('games/' + pin);
  if (!g || !g.host) return home('No game with that PIN. Check the number on the host screen.');
  if (g.state === 'end') return home('That game has ended.');
  const taken = Object.entries(g.players || {}).some(([u, p]) => u !== api.uid && p.name.toLowerCase() === nick.toLowerCase());
  if (taken) return home('Someone already has that nickname in this game.');
  if (!(g.players || {})[api.uid] && Object.keys(g.players || {}).length >= (CFG.maxPlayers || 50)) return home('That game is full.');
  let info = {}; try { info = await SQ.joinInfo(); } catch (e) {}
  await api.set('games/' + pin + '/players/' + api.uid, Object.assign({ name: nick, at: api.TS }, info));
  store.set('nick', nick); store.set('player', { pin });
  play(pin);
}

// ================================================================ player
function play(pin) {
  let g = null, b = null, lastKey = '', tick = null;
  const me = () => api.uid;
  const stop = api.on('games/' + pin, async (v) => {
    if (!v) { clearInterval(tick); stop(); store.set('player', null); return home('The host closed the game.'); }
    g = norm(v); setHub(g.ch);
    if (!g.players || !g.players[me()]) { clearInterval(tick); stop(); store.set('player', null); return home('You were removed from the game.'); }
    if (!b) { try { b = await bank(g.ch); } catch (e) {} }
    const mine = g.answers && g.answers[g.qk] && g.answers[g.qk][me()] ? 'a' : '';
    const key = [g.state, g.qk, mine, (g.team || {})[me()], g.turn, JSON.stringify(g.tiles || {}), g.state !== 'q' ? JSON.stringify(g.scores || {}) + JSON.stringify(g.tscore || {}) + g.hp : ''].join('|');
    if (key === lastKey) return; lastKey = key;
    clearInterval(tick); render();
  });
  function render() {
    const name = g.players[me()].name, list = ranked(g), mine = list.findIndex((x) => x.u === me()), myS = list[mine] || { s: 0, st: 0 };
    const team = (g.team || {})[me()];
    const head = '<div class="pbar"><b>' + esc(name) + (team != null ? ' <em class="tm t' + team + '">' + tn(g, team) + '</em>' : '') + '</b><span>' + fmt(myS.s) + ' pts</span></div>';
    if (g.state === 'lobby') return view(head + '<section class="card center"><h2>You\'re in</h2><p>' + esc(MODES[g.mode][0]) + '. ' + (team != null ? 'You are on team <b>' + tn(g, team) + '</b>. ' : '') + 'Watch the host screen; the game starts soon.</p><div class="pulse"></div></section>');
    if (g.state === 'pick') {
      if (team !== g.turn) return view(head + '<section class="card center"><h2>' + tn(g, g.turn) + ' is choosing</h2><p>Get ready to answer.</p><div class="pulse"></div></section>');
      view(head + '<section class="card"><h2>Your team\'s pick</h2><p class="small">Anyone on ' + tn(g, team) + ' can choose. The first tap counts.</p>' + boardGrid(g, true) + '</section>');
      document.querySelectorAll('.btile:not(:disabled)').forEach((x) => x.onclick = () => { document.querySelectorAll('.btile').forEach((y) => y.disabled = true); x.classList.add('picked'); api.set('games/' + pin + '/picks/' + me(), { c: +x.dataset.c, r: +x.dataset.r, t: api.TS }).catch(() => {}); });
      return;
    }
    if (g.state === 'q') {
      const answered = g.answers && g.answers[g.qk] && g.answers[g.qk][me()];
      if (answered) return view(head + '<section class="card center"><h2>Answer locked in</h2><p>Waiting for the others…</p><div class="pulse"></div></section>');
      const row = b ? rowOf(g, b) : null, show = g.phones && row, opts = row ? optionsOf(g, row) : g.ord.map((_, k) => ({ t: 'ABCD'[k], k }));
      view(head + '<div class="qcount">' + esc(qLabel(g)) + '<span id="pt"></span></div>' + (show ? '<p class="pq' + (g.mode === 'board' ? ' clue' : '') + '">' + esc(row[0]) + '</p>' : '') +
        '<div class="pans' + (show ? ' txt' : '') + (g.mode === 'tf' ? ' tf' : '') + '">' + opts.map((o) => '<button class="opt o' + (g.mode === 'tf' ? (o.k ? 3 : 2) : o.k) + '" data-k="' + o.k + '">' + shape(g.mode === 'tf' ? (o.k ? 3 : 2) : o.k) + '<span>' + esc(show || g.mode === 'tf' ? o.t : 'ABCD'[o.k]) + '</span></button>').join('') + '</div>');
      document.querySelectorAll('.pans .opt').forEach((x) => x.onclick = async () => {
        document.querySelectorAll('.pans .opt').forEach((y) => { y.disabled = true; y.classList.toggle('picked', y === x); });
        try { await api.set('games/' + pin + '/answers/' + g.qk + '/' + me(), { a: +x.dataset.k, t: api.TS }); } catch (e) { console.warn('answer not saved', e); toast(/permission/i.test(String(e && (e.code || e.message))) ? 'That answer came in after the question closed.' : 'Could not send your answer: ' + String(e && (e.code || e.message) || 'connection problem')); document.querySelectorAll('.pans .opt').forEach((y) => { y.disabled = false; y.classList.remove('picked'); }); }
      });
      tick = setInterval(() => { const p = $('pt'); if (p && typeof g.qStart === 'number') p.textContent = Math.max(0, Math.ceil((g.qStart + g.dur * 1000 - api.now()) / 1000)) + 's'; }, 250);
      return;
    }
    if (g.state === 'reveal' || g.state === 'board') {
      const sc = (g.scores || {})[me()] || {}, ok = sc.ok && sc.q === g.qk;
      let extra = '';
      if (g.mode === 'raid') extra = '<p>' + (ok ? 'You hit the boss for <b>' + sc.h + '</b>.' : '') + ' Boss health: <b>' + Math.max(0, g.hp) + '</b> of ' + g.hpMax + '</p>';
      if (g.mode === 'board' && team != null) { const ts = g.tscore || {}, order = Object.keys(ts).sort((x, y) => ts[y] - ts[x]); extra = '<p>Team ' + tn(g, team) + ': <b>' + fmt(ts[team]) + '</b> (' + place(order.indexOf(String(team)) + 1) + ')</p>'; }
      return view(head + '<section class="card center res ' + (ok ? 'ok' : 'no') + '"><h2>' + (ok ? 'Correct' : sc.q === g.qk && sc.none ? 'Time\'s up' : 'Not this time') + '</h2>' +
        (ok ? '<p class="gain">+' + fmt(sc.g) + '</p>' + (sc.st >= 2 ? '<p>Answer streak ' + sc.st + '</p>' : '') : '<p>' + (sc.q === g.qk ? 'Streak reset. Get the next one.' : '') + '</p>') + extra +
        '<p class="rank">You are in <b>' + place(mine + 1) + '</b> place' + (mine > 0 ? ', ' + fmt(list[mine - 1].s - myS.s) + ' behind ' + esc(list[mine - 1].name) : '') + '.</p></section>');
    }
    if (g.state === 'end') {
      store.set('player', null);
      let head2 = mine === 0 ? 'You won' : 'Final: ' + place(mine + 1) + ' place';
      if (g.mode === 'raid') head2 = g.hp <= 0 ? 'Boss defeated' : 'The boss escaped';
      if (g.mode === 'board' && team != null) { const ts = g.tscore || {}, order = Object.keys(ts).sort((x, y) => ts[y] - ts[x]); head2 = order[0] === String(team) ? 'Team ' + tn(g, team) + ' wins' : 'Team ' + tn(g, team) + ': ' + place(order.indexOf(String(team)) + 1); }
      try { const ck = 'live:credit:' + pin + ':' + (g.created || ''); if (!sessionStorage.getItem(ck)) { sessionStorage.setItem(ck, '1'); SQ.liveCredit(myS.s, MODES[g.mode][0], mine + 1, list.length).catch(() => {}); } } catch (e) {}
      return view(head + '<section class="card center"><h2>' + head2 + '</h2><p class="gain">' + fmt(myS.s) + ' points</p><p>You finished ' + place(mine + 1) + ' of ' + list.length + (g.mode === 'raid' ? ', with ' + (myS.d || 0) + ' hits on the boss' : '') + '.</p>' + dangle(mine === 0 ? 'win' : mine < 3 ? 'podium' : 'rest') + '<a class="btn main" href="./' + (MOCK ? '?mock' : '') + '">Play again</a>' + (SQ.me() ? '<a class="btn hubBtn" href="?squads' + MQ + '">My squads</a>' : '') + hubBtn() + '</section>');
    }
  }
}
function boardGrid(g, tappable) {
  const cols = g.cols, t = g.tiles || {};
  return '<div class="bgrid" style="grid-template-columns:repeat(' + cols.length + ',minmax(0,1fr))">' + cols.map((c) => '<div class="bhead">' + esc(c.t) + '</div>').join('') +
    [0, 1, 2, 3, 4].map((r) => cols.map((c, ci) => { const k = ci + '_' + r, done = t[k]; return '<button class="btile' + (done ? ' done t' + (done - 1) : '') + '" data-c="' + ci + '" data-r="' + r + '"' + (done || !tappable ? ' disabled' : '') + '>' + (done ? tn(g, done - 1)[0] : tileVal(r)) + '</button>'; }).join('')).join('') + '</div>';
}

// ================================================================ host setup
async function hostSetup(msg) {
  try { await ready(); } catch (e) { return view(notReady(e)); }
  const prev = store.get('hostPin');
  if (prev) { const g = await api.get('games/' + prev); if (g && g.host === api.uid && g.state !== 'end') return host(prev); }
  const chs = CFG.chapters || [];
  const last = store.get('hostSet') || {};
  const pick = (v, ok) => (ok ? v : null);
  const chId = pick(params.get('ch'), chs.some((c) => c.id === params.get('ch'))) || pick(last.ch, chs.some((c) => c.id === last.ch)) || (chs[0] || {}).id;
  setHub(chId);
  const b = await bank(chId);
  const order = b.lessons.map((l, i) => i).sort((x, y) => b.lessons[x].localeCompare(b.lessons[y], undefined, { numeric: true }));
  const chosen = new Set((last.ch === chId && last.les) || []);
  let mode = MODES[params.get('mode')] ? params.get('mode') : MODES[last.mode] ? last.mode : 'classic';
  view('<section class="card host"><div class="brand">' + esc(CFG.siteName || 'Live Drill') + ' · Host</div><h1>Host a live game</h1>' + (msg ? '<p class="err">' + esc(msg) + '</p>' : '') +
    (chs.length > 1 ? '<label>Chapter<select id="hc">' + chs.map((c) => '<option value="' + esc(c.id) + '"' + (c.id === chId ? ' selected' : '') + '>' + esc(c.title) + '</option>').join('') + '</select></label>' : '<p class="chap">' + esc((chs[0] || {}).title || '') + '</p>') +
    '<fieldset><legend>Game</legend><div class="modes" id="hm">' + Object.keys(MODES).map((k) => '<button type="button" class="mode' + (k === mode ? ' on' : '') + '" data-m="' + k + '"><b>' + MODES[k][0] + '</b><span>' + MODES[k][1] + '</span></button>').join('') + '</div></fieldset>' +
    '<fieldset><legend>Lessons</legend><div class="chips" id="hl"><button type="button" class="chip' + (chosen.size ? '' : ' on') + '" data-l="all">All lessons</button>' +
    order.map((i) => '<button type="button" class="chip' + (chosen.has(i) ? ' on' : '') + '" data-l="' + i + '">' + esc(b.lessons[i]) + '</button>').join('') + '</div></fieldset>' +
    '<div class="row3"><label id="hnL">Questions<select id="hn">' + [5, 10, 15, 20, 30].map((n) => '<option' + (n === (last.n || 10) ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' +
    '<label id="htL">Teams<select id="ht">' + [2, 3, 4].map((n) => '<option' + (n === (last.teams || 2) ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' +
    '<label>Seconds each<select id="hd">' + [10, 15, 20, 30, 45].map((n) => '<option' + (n === (last.dur || 20) ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label></div>' +
    '<label class="tick" id="hsqL"><input type="checkbox" id="hsq"' + (last.bySquad ? ' checked' : '') + '> Team Category Board: make teams from players\' squads (squad vs squad)</label>' +
    '<label class="tick"><input type="checkbox" id="hp"' + (last.phones === false ? '' : ' checked') + '> Show the question and answers on players\' phones (turn off when everyone can see your screen)</label>' +
    '<button class="main" id="hgo">Create game</button><p class="small"><a href="./' + (MOCK ? '?mock' : '') + '">Join a game</a> · <a href="?boards' + MQ + '">Leaderboards</a></p></section>');
  const showOpts = () => { $('hnL').hidden = mode === 'board'; $('htL').hidden = mode !== 'board'; $('hsqL').hidden = mode !== 'board'; };
  showOpts();
  if ($('hc')) $('hc').onchange = () => { store.set('hostSet', Object.assign(last, { ch: $('hc').value, les: [] })); hostSetup(); };
  $('hm').onclick = (e) => { const m = e.target.closest('.mode'); if (!m) return; mode = m.dataset.m; document.querySelectorAll('.mode').forEach((x) => x.classList.toggle('on', x === m)); showOpts(); };
  $('hl').onclick = (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    if (c.dataset.l === 'all') chosen.clear(); else { const i = +c.dataset.l; chosen.has(i) ? chosen.delete(i) : chosen.add(i); }
    document.querySelectorAll('#hl .chip').forEach((x) => x.classList.toggle('on', x.dataset.l === 'all' ? !chosen.size : chosen.has(+x.dataset.l)));
  };
  $('hgo').onclick = async () => {
    const n = +$('hn').value, dur = +$('hd').value, phones = $('hp').checked, teams = +$('ht').value, bySquad = $('hsq').checked;
    // Kahoot-sized multiple choice (question up to 120 characters, answers up to 75), true/false statements, or Jeopardy clues
    const src = mode === 'tf' ? b.tq : mode === 'board' ? b.jq : b.q, lesOf = (r) => (mode === 'tf' ? r[2] : r[3]);
    const fits = (r) => mode !== 'classic' && mode !== 'raid' || (r[0].length <= 120 && r[1].every((o) => o.length <= 75));
    const pool = src.map((r, i) => i).filter((i) => fits(src[i]) && (!chosen.size || chosen.has(lesOf(src[i]))));
    const seen = new Set(), uniq = [];
    for (const i of shuffle(pool)) { const k = (mode === 'tf' ? src[i][0] : src[i][1][src[i][2]]).toLowerCase(); if (!seen.has(k)) { seen.add(k); uniq.push(i); } }
    const game = { host: api.uid, ch: chId, mode, dur, phones, state: 'lobby', qi: -1, qk: '-', created: api.TS };
    if (mode === 'board') {
      const byL = {}; uniq.forEach((i) => { (byL[b.jq[i][3]] = byL[b.jq[i][3]] || []).push(i); });
      const ls = shuffle(Object.keys(byL).filter((l) => byL[l].length >= 5)).slice(0, 5);
      if (ls.length < 3) return hostSetup('Team Category Board needs at least 3 lessons with 5 clues each. Pick more lessons, or All lessons.');
      const w = (i) => b.jq[i][0].length + b.jq[i][1].reduce((a, o) => a + o.length, 0);
      game.cols = ls.map((l) => ({ t: b.lessons[l].replace(/^Lesson\s+/, '').replace(/^([\d.]+):\s*/, '$1 '), q: byL[l].slice(0, 5).sort((x, y) => w(x) - w(y)) }));
      const used = new Set(game.cols.flatMap((c) => c.q));
      game.fin = uniq.find((i) => !used.has(i));
      game.dd = Math.floor(Math.random() * game.cols.length) + '_' + (1 + Math.floor(Math.random() * 4));
      game.teams = teams; game.bySquad = bySquad; game.turn = 0; game.tscore = Object.fromEntries([...Array(teams).keys()].map((t) => [t, 0]));
    } else {
      if (uniq.length < n) return hostSetup('Only ' + uniq.length + ' different questions in those lessons. Pick more lessons or fewer questions.');
      game.set = uniq.slice(0, n);
    }
    store.set('hostSet', { ch: chId, les: [...chosen], n, dur, phones, mode, teams, bySquad });
    $('hgo').disabled = true;
    let pin = '';
    for (let t = 0; t < 8; t++) { const p = String(100000 + Math.floor(Math.random() * 900000)); if (!(await api.get('games/' + p))) { pin = p; break; } }
    if (!pin) return hostSetup('Could not make a PIN. Try again.');
    await api.set('games/' + pin, game);
    store.set('hostPin', pin); host(pin);
  };
}

// ================================================================ host game
function host(pin) {
  let g = null, b = null, lastKey = '', tick = null, busy = false;
  const base = 'games/' + pin;
  const joinUrl = location.origin + location.pathname.replace(/index\.html$/, '') + '?pin=' + pin + MQ;
  const set = (patch) => api.update(base, patch);
  const stop = api.on(base, async (v) => {
    if (!v) { stop(); store.set('hostPin', null); return hostSetup(); }
    g = norm(v); setHub(g.ch); if (!b) b = await bank(g.ch);
    // board mode: put new players on the smallest team, and take the active team's first pick
    if (g.mode === 'board') {
      const tm = g.team || {}, ps = Object.keys(g.players || {}), need = ps.filter((u) => tm[u] == null);
      if (need.length) {
        const size = [...Array(g.teams).keys()].map((t) => ps.filter((u) => tm[u] === t).length), patch = {};
        const sqTeam = Object.assign({}, g.sqTeam || {}), names = arr(g.tnames).slice();
        need.forEach((u) => {
          const pl = g.players[u] || {}; let t = -1;
          // squad vs squad: each squad gets its own team while there are teams left; others fill the smallest team
          if (g.bySquad && pl.sq) { if (sqTeam[pl.sq] != null) t = sqTeam[pl.sq]; else { const free = size.findIndex((x, i) => x === 0 && !names[i]); if (free >= 0) { t = free; sqTeam[pl.sq] = t; names[t] = String(pl.sqn || pl.sq).slice(0, 24); patch['sqTeam/' + pl.sq] = t; patch['tnames/' + t] = names[t]; } } }
          if (t < 0) t = size.indexOf(Math.min(...size));
          size[t]++; patch['team/' + u] = t;
        });
        set(patch);
      }
      if (g.state === 'pick' && g.picks && !busy) {
        const first = Object.entries(g.picks).filter(([u, p]) => tm[u] === g.turn && !(g.tiles || {})[p.c + '_' + p.r] && g.cols[p.c]).sort((x, y) => x[1].t - y[1].t)[0];
        if (first) { busy = true; await openTile(first[1].c, first[1].r); busy = false; return; }
      }
    }
    const ans = g.answers && g.answers[g.qk] ? Object.keys(g.answers[g.qk]).length : 0;
    const key = [g.state, g.qk, Object.keys(g.players || {}).join(','), JSON.stringify(g.team || {}), ans, JSON.stringify(g.scores || {}), JSON.stringify(g.tiles || {}), g.turn].join('|');
    if (key === lastKey) return; lastKey = key;
    render(ans);
  });
  const qPatch = (row) => ({ ord: shuffle(row[1].map((_, k) => k)), tv: Math.random() < 0.5, fi: Math.floor(Math.random() * 3), qStart: api.TS, state: 'q' });
  const ask = (i) => set(Object.assign(g.mode === 'tf' ? qPatch(['', [0, 1]]) : qPatch(b.q[g.set[i]]), { qi: i, qk: String(i) }));
  const openTile = (c, r) => set(Object.assign(qPatch(b.jq[g.cols[c].q[r]]), { cur: { c, r, q: g.cols[c].q[r], dd: g.dd === c + '_' + r }, qk: 'b' + c + '_' + r, picks: null }));
  const openFinal = () => set(Object.assign(qPatch(b.jq[g.fin]), { cur: { fin: true, q: g.fin }, qk: 'fin' }));
  async function startGame() {
    if (g.mode === 'raid') { const n = Object.keys(g.players || {}).length; const hp = Math.max(4, Math.round(n * g.set.length * 0.65)); await set({ hp, hpMax: hp }); }
    if (g.mode === 'board') return set({ state: 'pick' });
    return ask(0);
  }
  async function reveal() {
    if (busy || g.state !== 'q') return; busy = true; clearInterval(tick);
    const row = rowOf(g, b), ans = (g.answers && g.answers[g.qk]) || {}, sc = g.scores || {}, out = {}, patch = { state: 'reveal' };
    let hits = 0; const teamRight = {}, teamSize = {};
    Object.keys(g.players || {}).forEach((u) => {
      const p = sc[u] || { s: 0, st: 0, d: 0 }, a = ans[u];
      const late = a && a.t > g.qStart + g.dur * 1000 + 1500;
      const ok = !!a && !late && isRight(g, row, a.a);
      const st = ok ? (p.st || 0) + 1 : 0, ms = ok ? a.t - g.qStart : 0;
      const gain = ok ? points(ms, g.dur) + Math.min(500, (st - 1) * 100) : 0;
      const h = ok ? (ms < g.dur * 1000 / 3 ? 2 : 1) : 0; hits += h;
      out[u] = { s: (p.s || 0) + gain, st, g: gain, ok, q: g.qk, none: !a || late, h, d: (p.d || 0) + h };
      const t = (g.team || {})[u]; if (t != null) { teamSize[t] = (teamSize[t] || 0) + 1; if (ok) teamRight[t] = (teamRight[t] || 0) + 1; }
    });
    patch.scores = out;
    if (g.mode === 'raid') patch.hp = g.hp - hits;
    if (g.mode === 'board') {
      const ts = Object.assign({}, g.tscore || {}), val = g.cur.fin ? 1000 : tileVal(g.cur.r), gains = {};
      for (let t = 0; t < g.teams; t++) {
        const f = teamSize[t] ? (teamRight[t] || 0) / teamSize[t] : 0, picker = !g.cur.fin && t === g.turn;
        let v = Math.round(val * f * (picker ? 1.5 : 1) * (picker && g.cur.dd ? 2 : 1) / 10) * 10;
        if (picker && f === 0) v = -Math.round(val / 2) * (g.cur.dd ? 2 : 1);
        ts[t] = (ts[t] || 0) + v; gains[t] = v;
      }
      patch.tscore = ts; patch.tgain = gains;
      if (!g.cur.fin) { patch['tiles/' + g.cur.c + '_' + g.cur.r] = g.turn + 1; patch.turn = (g.turn + 1) % g.teams; }
    }
    await set(patch); busy = false;
  }
  function next() {
    if (g.mode === 'board') {
      if (g.cur.fin) return set({ state: 'end' });
      const left = g.cols.length * 5 - Object.keys(g.tiles || {}).length;
      return set({ state: 'board' }).then(() => (left <= 0 ? null : null));
    }
    if (g.mode === 'raid' && g.hp <= 0) return set({ state: 'end' });
    return set({ state: g.qi + 1 >= g.set.length ? 'end' : 'board' });
  }
  function afterBoard() {
    if (g.mode === 'board') { const left = g.cols.length * 5 - Object.keys(g.tiles || {}).length; return left > 0 ? set({ state: 'pick' }) : (g.fin != null ? openFinal() : set({ state: 'end' })); }
    return ask(g.qi + 1);
  }
  const teamBar = () => '<div class="tbar">' + [...Array(g.teams).keys()].map((t) => '<div class="tcard t' + t + (g.state === 'pick' && t === g.turn ? ' turn' : '') + '"><span>' + tn(g, t) + ' · ' + Object.values(g.team || {}).filter((x) => x === t).length + '</span><b>' + fmt((g.tscore || {})[t]) + '</b></div>').join('') + '</div>';
  const bossBar = () => '<div class="boss"><div class="bname">The Chapter Boss<span>' + Math.max(0, g.hp) + ' / ' + g.hpMax + '</span></div><div class="hp"><i style="width:' + Math.max(0, 100 * g.hp / g.hpMax) + '%"></i></div></div>';
  function render(ans) {
    clearInterval(tick);
    const players = Object.entries(g.players || {});
    const bar = '<div class="hbar"><span>PIN <b>' + pin + '</b></span><span>' + esc(MODES[g.mode][0]) + ' · ' + players.length + ' player' + (players.length === 1 ? '' : 's') + '</span><button class="ghost" id="hEnd">End game</button></div>';
    const top = bar + (g.mode === 'board' ? teamBar() : '') + (g.mode === 'raid' && g.hpMax ? bossBar() : '');
    if (g.state === 'lobby') {
      view(top + '<section class="card lobby"><div class="pinBox"><span>Go to</span><b class="url">' + esc(joinUrl.replace(/^https?:\/\//, '').replace(/\?.*$/, '')) + '</b><span>and enter PIN</span><b class="bigpin">' + pin.replace(/(\d{3})(\d{3})/, '$1 $2') + '</b></div>' +
        '<div class="qr" id="qr"></div><div class="plist">' + (players.length ? players.map(([u, p]) => { const t = (g.team || {})[u]; return '<button class="pl' + (t != null ? ' t' + t : '') + '" data-u="' + esc(u) + '" title="Tap to remove">' + esc(p.name) + '</button>'; }).join('') : '<p class="small">Waiting for players…</p>') + '</div>' +
        '<button class="main" id="hStart"' + (players.length ? '' : ' disabled') + '>Start ' + esc(MODES[g.mode][0]) + (g.set.length ? ' (' + g.set.length + ' questions)' : '') + '</button></section>');
      drawQR(joinUrl);
      document.querySelectorAll('.pl').forEach((x) => x.onclick = () => { if (window.confirm('Remove ' + x.textContent + ' from the game?')) api.remove(base + '/players/' + x.dataset.u); });
      $('hStart').onclick = startGame;
    } else if (g.state === 'pick') {
      view(top + '<section class="card"><h2>' + tn(g, g.turn) + ', pick a tile</h2><p class="small">Anyone on team ' + tn(g, g.turn) + ' picks on their phone, or tap a tile here. One tile hides a Daily Double.</p>' + boardGrid(g, true) + '</section>');
      document.querySelectorAll('.btile:not(:disabled)').forEach((x) => x.onclick = () => openTile(+x.dataset.c, +x.dataset.r));
    } else if (g.state === 'q') {
      const row = rowOf(g, b), opts = optionsOf(g, row);
      view(top + '<div class="qcount">' + esc(qLabel(g)) + '</div><section class="card hq">' + (g.cur && g.cur.dd ? '<p class="dd">Daily Double for ' + tn(g, g.turn) + '</p>' : '') + '<p class="lesson">' + esc(b.lessons[row[3]] || '') + (g.mode === 'tf' ? ' · True or false?' : '') + '</p><h2 class="stem' + (g.mode === 'board' ? ' clue' : '') + '">' + esc(row[0]) + '</h2>' +
        '<div class="timer"><div class="ring" id="ring">' + g.dur + '</div><div class="acount"><b>' + ans + '</b><span>of ' + players.length + ' answered</span></div></div>' +
        '<div class="hans' + (g.mode === 'tf' ? ' tf' : '') + '">' + opts.map((o) => { const s = g.mode === 'tf' ? (o.k ? 3 : 2) : o.k; return '<div class="opt o' + s + '">' + shape(s) + '<span>' + esc(o.t) + '</span></div>'; }).join('') + '</div>' +
        '<p class="small">Players answer on their own phones at the join link.</p><button class="ghost" id="hSkip">Show answer now</button></section>');
      $('hSkip').onclick = reveal;
      const run = () => { const left = (g.qStart + g.dur * 1000 - api.now()) / 1000, r = $('ring'); if (r) { r.textContent = Math.max(0, Math.ceil(left)); r.classList.toggle('low', left <= 5); } if (left <= 0 || (players.length && ans >= players.length)) reveal(); };
      if (typeof g.qStart === 'number') { run(); tick = setInterval(run, 200); }
    } else if (g.state === 'reveal') {
      const row = rowOf(g, b), A = (g.answers && g.answers[g.qk]) || {}, opts = optionsOf(g, row), cnt = opts.map(() => 0);
      Object.values(A).forEach((a) => { if (cnt[a.a] != null) cnt[a.a]++; });
      const max = Math.max(1, ...cnt), right = rightIndex(g, row);
      const sym = (k) => (g.mode === 'tf' ? (k ? 3 : 2) : k);
      let note = '';
      if (g.mode === 'board') note = '<div class="tgain">' + [...Array(g.teams).keys()].map((t) => '<span class="t' + t + '">' + tn(g, t) + ' ' + ((g.tgain || {})[t] >= 0 ? '+' : '') + fmt((g.tgain || {})[t]) + '</span>').join('') + '</div>';
      if (g.mode === 'raid') note = '<p class="tgain">' + (g.hp <= 0 ? '<b>The boss is down!</b>' : 'The group dealt <b>' + Object.values(g.scores || {}).reduce((a, x) => a + (x.q === g.qk ? x.h : 0), 0) + '</b> damage.') + '</p>';
      view(top + '<div class="qcount">' + esc(qLabel(g)) + '</div><section class="card hq"><h2 class="stem' + (g.mode === 'board' ? ' clue' : '') + '">' + esc(row[0]) + '</h2>' + note +
        '<div class="bars">' + opts.map((o) => '<div class="barc o' + sym(o.k) + (o.k === right ? ' right' : ' dim') + '"><b>' + cnt[o.k] + '</b><div class="bw"><i style="height:' + (6 + 94 * cnt[o.k] / max) + '%"></i></div>' + shape(sym(o.k)) + '</div>').join('') + '</div>' +
        '<div class="hans' + (g.mode === 'tf' ? ' tf' : '') + '">' + opts.map((o) => '<div class="opt o' + sym(o.k) + (o.k === right ? ' right' : ' dim') + '">' + shape(sym(o.k)) + '<span>' + esc(o.t) + '</span></div>').join('') + '</div>' +
        (g.mode === 'tf' && row[2] === 1 ? '<p class="why"><b>The chapter says:</b> ' + esc(row[6]) + '</p>' : '') +
        (row[4] ? '<p class="why">' + esc(row[4]) + (row[5] ? ' <em>p. ' + esc(row[5]) + '</em>' : '') + '</p>' : '') + '<button class="main" id="hNext">Next</button></section>');
      $('hNext').onclick = next;
    } else if (g.state === 'board') {
      let body;
      if (g.mode === 'board') body = '<h2>Standings</h2>' + boardGrid(g, false) + '<h3>Top players</h3><ol class="lb">' + ranked(g).slice(0, 5).map((x) => '<li><span>' + esc(x.name) + (x.team != null ? ' <em>' + tn(g, x.team) + '</em>' : '') + '</span><b>' + fmt(x.s) + '</b></li>').join('') + '</ol>';
      else if (g.mode === 'raid') body = '<h2>Damage dealt</h2><ol class="lb">' + ranked(g).sort((x, y) => y.d - x.d).slice(0, 5).map((x) => '<li><span>' + esc(x.name) + '</span><b>' + x.d + ' hits</b></li>').join('') + '</ol>';
      else body = '<h2>Leaderboard</h2><ol class="lb">' + ranked(g).slice(0, 5).map((x) => '<li><span>' + esc(x.name) + (x.st >= 3 ? ' <em>' + x.st + ' in a row</em>' : '') + '</span><b>' + fmt(x.s) + '</b></li>').join('') + '</ol>';
      const leftTiles = g.mode === 'board' ? g.cols.length * 5 - Object.keys(g.tiles || {}).length : 1;
      view(top + '<section class="card board">' + body + '<button class="main" id="hNext">' + (g.mode === 'board' ? (leftTiles > 0 ? tn(g, g.turn) + ' picks next' : 'Final question') : 'Next question') + '</button></section>');
      $('hNext').onclick = afterBoard;
    } else if (g.state === 'end') {
      const list = ranked(g), top3 = list.slice(0, 3);
      let title = 'Final results', extra = '';
      if (g.mode === 'raid') { title = g.hp <= 0 ? 'Boss defeated' : 'The boss escaped'; extra = '<p class="center">' + (g.hp <= 0 ? 'The group brought it down. Top damage below.' : 'It had ' + g.hp + ' health left. Run it back.') + '</p>'; }
      if (g.mode === 'board') {
        const ts = g.tscore || {}, order = Object.keys(ts).sort((x, y) => ts[y] - ts[x]);
        title = 'Team ' + tn(g, order[0]) + ' wins';
        extra = '<div class="tbar end">' + order.map((t) => '<div class="tcard t' + t + '"><span>' + tn(g, t) + '</span><b>' + fmt(ts[t]) + '</b></div>').join('') + '</div><h3>Most valuable players</h3>';
      }
      const podium = [1, 0, 2].filter((i) => top3[i]).map((i) => '<div class="pod p' + (i + 1) + '"><span>' + esc(top3[i].name) + '</span><b>' + fmt(top3[i].s) + '</b><i>' + (i + 1) + '</i></div>').join('');
      view('<section class="card end"><h1>' + esc(title) + '</h1>' + extra + '<div class="podium">' + podium + '</div><ol class="lb all">' + list.map((x) => '<li><span>' + esc(x.name) + '</span><b>' + fmt(x.s) + '</b></li>').join('') + '</ol>' +
        '<div class="row2"><button class="main" id="hAgain">New game</button><button class="ghost" id="hClose">Close game</button></div>' + hubBtn() + '</section>');
      store.set('hostPin', null);
      $('hAgain').onclick = $('hClose').onclick = async () => { stop(); await api.remove(base); hostSetup(); };
      confetti();
    }
    const e = $('hEnd'); if (e) e.onclick = async () => { if (!window.confirm('End this game now?')) return; if (g.state === 'lobby') { stop(); store.set('hostPin', null); await api.remove(base); hostSetup(); } else { if (g.state === 'q') await reveal(); set({ state: 'end' }); } };
  }
}
function drawQR(url) {
  const box = $('qr'); if (!box || typeof window.qrcode !== 'function') return;
  try { const q = window.qrcode(0, 'M'); q.addData(url); q.make(); box.innerHTML = q.createSvgTag({ cellSize: 5, margin: 2, scalable: true }); } catch (e) {}
}
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('div'); c.className = 'confetti';
  for (let i = 0; i < 60; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + '%'; p.style.animationDelay = Math.random() * 0.8 + 's'; p.style.background = ['#f5b800', '#3563c9', '#16a34a', '#e11d48'][i % 4]; c.appendChild(p); }
  document.body.appendChild(c); setTimeout(() => c.remove(), 4000);
}

// ================================================================ leaderboards
// Scores come from the study hub as a code in the link: base64url(JSON {ch, g, d, s, t}) + '.' + check.
const GAMES = {
  speed: ['Speed Round', 'points'], streak: ['Streak Survival', 'in a row'], tf: ['True/False Blitz', 'points'], board: ['Category Board', 'points'],
  boss: ['Lesson Boss Battle', 'points'], match: ['Mix & Match', 'seconds', true], memory: ['Memory Flip', 'flips', true], typing: ['Typing Challenge', 'of 10']
};
const DIFF = { E: 'Easy', N: 'Normal', H: 'Hard' };
const MAX = { speed: 400, streak: 600, tf: 600, board: 60000, boss: 3000, match: 3600, memory: 999, typing: 10 };
function check(s) { let h = 2166136261; const t = s + '|fbrtp-live'; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); }
function readBlob(code) {
  try { const [body, k] = String(code).split('.'); if (check(body) !== k) return null; return JSON.parse(decodeURIComponent(escape(atob(body.replace(/-/g, '+').replace(/_/g, '/'))))); } catch (e) { return null; }
}
function readCode(code) {
  try {
    const [body, k] = code.split('.'); if (check(body) !== k) return null;
    const j = JSON.parse(decodeURIComponent(escape(atob(body.replace(/-/g, '+').replace(/_/g, '/')))));
    if (!GAMES[j.g] || !DIFF[j.d] || typeof j.s !== 'number' || j.s < 0 || j.s > MAX[j.g]) return null;
    if (!(CFG.chapters || []).some((c) => c.id === j.ch)) return null;
    return Object.assign(j, { key: k });
  } catch (e) { return null; }
}
const weekKey = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
async function postScore(code, msg) {
  const j = readCode(code);
  if (!j) return view('<section class="card center"><h1>That score link is broken</h1><p>Go back to the study hub and tap Post score again.</p><a class="btn main" href="?boards' + MQ + '">See the leaderboards</a></section>');
  try { await ready(); } catch (e) { return view(notReady(e)); }
  const posted = store.get('posted') || {};
  const G = GAMES[j.g], ch = (CFG.chapters || []).find((c) => c.id === j.ch); setHub(j.ch);
  if (posted[j.key]) return boards(j.ch, j.g, j.d, 'Already posted. Here is where you stand.');
  view('<section class="card join"><div class="brand">Post your score</div><h1>' + esc(G[0]) + '</h1><p class="big">' + fmt(j.s) + ' <span class="small">' + esc(G[1]) + '</span></p><p class="small">' + esc(ch.title) + ' · ' + DIFF[j.d] + '</p>' +
    '<form id="postF"><label>Name on the board<input id="nick" maxlength="16" value="' + esc(store.get('nick') || '') + '" placeholder="Your name"></label><button class="main">Post score</button></form>' + (msg ? '<p class="err">' + esc(msg) + '</p>' : '') + '</section>');
  $('postF').onsubmit = async (e) => {
    e.preventDefault();
    const name = $('nick').value.trim().replace(/\s+/g, ' ').slice(0, 16);
    if (name.length < 2) return postScore(code, 'Use at least 2 characters.');
    store.set('nick', name);
    const rep = params.get('rep') ? readBlob(params.get('rep')) : null;
    const entry = { name, s: j.s, t: api.TS, u: api.uid }; if (rep && rep.r) entry.r = String(rep.r).slice(0, 20);
    const k = j.g + '_' + j.d;
    try {
      await api.set('lb/' + j.ch + '/' + k + '/all/' + j.key, entry);
      await api.set('lb/' + j.ch + '/' + k + '/w' + weekKey(j.t) + '/' + j.key, entry);
    } catch (err) { return postScore(code, 'Could not post that score. It may already be on the board.'); }
    posted[j.key] = 1; store.set('posted', posted);
    if (rep) { try { await SQ.report(rep, true); } catch (x) {} }
    try { const wk = await api.top('lb/' + j.ch + '/' + k + '/w' + weekKey(j.t), 25, !!G[2]); const at = wk.findIndex((r) => r.k === j.key); if (at >= 0) await SQ.scoreFeed(G[0] + ' (' + DIFF[j.d] + ')', at + 1); } catch (x) {}
    boards(j.ch, j.g, j.d, 'Posted.', j.key);
  };
}
async function boards(ch, game, diff, note, mineKey) {
  try { await ready(); } catch (e) { return view(notReady(e)); }
  const chs = CFG.chapters || [];
  ch = ch || params.get('ch') || (chs[0] || {}).id; game = game || params.get('g') || 'speed'; diff = diff || params.get('d') || 'N';
  let period = store.get('lbPeriod') || 'w';
  async function draw() {
    setHub(ch);
    const G = GAMES[game], low = !!G[2], k = game + '_' + diff, path = 'lb/' + ch + '/' + k + '/' + (period === 'w' ? 'w' + weekKey(api.now()) : 'all');
    const rows = (await api.top(path, 25, low)) || [];
    view('<section class="card host"><div class="brand">' + esc(CFG.siteName || 'Live Drill') + '</div><h1>Leaderboards</h1>' + (note ? '<p class="ok">' + esc(note) + '</p>' : '') +
      (chs.length > 1 ? '<label>Chapter<select id="lbc">' + chs.map((c) => '<option value="' + esc(c.id) + '"' + (c.id === ch ? ' selected' : '') + '>' + esc(c.title) + '</option>').join('') + '</select></label>' : '') +
      '<div class="chips" id="lbg">' + Object.keys(GAMES).map((x) => '<button class="chip' + (x === game ? ' on' : '') + '" data-g="' + x + '">' + GAMES[x][0] + '</button>').join('') + '</div>' +
      '<div class="seg" id="lbd">' + Object.keys(DIFF).map((x) => '<button class="' + (x === diff ? 'on' : '') + '" data-d="' + x + '">' + DIFF[x] + '</button>').join('') + '</div>' +
      '<div class="seg" id="lbp"><button class="' + (period === 'w' ? 'on' : '') + '" data-p="w">This week</button><button class="' + (period === 'a' ? 'on' : '') + '" data-p="a">All time</button></div>' +
      (rows.length ? '<ol class="lb all">' + rows.map((r) => '<li class="' + (r.k === mineKey || r.u === api.uid ? 'me' : '') + '"><span>' + esc(r.name) + (r.r ? ' <em class="rk">' + esc(r.r) + '</em>' : '') + '</span><b>' + fmt(r.s) + ' <small>' + esc(G[1]) + '</small></b></li>').join('') + '</ol>' : '<p class="small">No scores yet. Finish ' + esc(G[0]) + ' on ' + DIFF[diff] + ' in the study hub and tap Post score.</p>') +
      hubBtn() + '<p class="small"><a href="./' + (MOCK ? '?mock' : '') + '">Join a game</a> · <a href="?host' + MQ + '">Host a game</a></p></section>');
    if ($('lbc')) $('lbc').onchange = () => { ch = $('lbc').value; note = ''; draw(); };
    $('lbg').onclick = (e) => { const c = e.target.closest('.chip'); if (c) { game = c.dataset.g; note = ''; draw(); } };
    $('lbd').onclick = (e) => { const c = e.target.closest('button'); if (c) { diff = c.dataset.d; note = ''; draw(); } };
    $('lbp').onclick = (e) => { const c = e.target.closest('button'); if (c) { period = c.dataset.p; store.set('lbPeriod', period); note = ''; draw(); } };
  }
  draw();
}

// ================================================================ start
(async function start() {
  try { if (CFG.siteName) document.title = CFG.siteName; } catch (e) {}
  setHub(params.get('ch'));
  SQ.init(CTX);
  if (params.get('id')) { try { await ready(); await SQ.fromLink(); } catch (e) {} }
  if (params.get('report')) { const j = readBlob(params.get('report')); if (!j) return view('<section class="card center"><h1>That report link is broken</h1><p>Go back to the study hub and tap Report in again.</p></section>'); try { await ready(); } catch (e) { return view(notReady(e)); } setHub(j.ch); return SQ.report(j); }
  if (params.has('tv')) return SQ.tvPage();
  if (params.has('squads')) return SQ.squadsPage();
  if (params.get('squad')) return SQ.squadPage(params.get('squad'));
  if (params.has('squadboard')) return SQ.boardPage();
  if (params.get('post')) return postScore(params.get('post'));
  if (params.has('boards')) return boards();
  if (params.has('host')) return hostSetup();
  const was = store.get('player');
  if (was && was.pin && !params.get('pin')) {
    try { await ready(); const g = await api.get('games/' + was.pin); if (g && g.players && g.players[api.uid] && g.state !== 'end') return play(was.pin); } catch (e) {}
    store.set('player', null);
  }
  home();
})();
