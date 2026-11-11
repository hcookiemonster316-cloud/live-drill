// SQUADS: player identity, squads (create, join, leave), Report in from the study hub, weekly squad points and goals,
// the achievement feed, study hall and squad streaks, the opt-in readiness board, events, squad-vs-squad boards and TV mode.
// Identity: the hub makes a player code (pid + secret). The site proves it once per browser by writing the secret under
// links/{pid}/{uid}; the database rules check that link before any write made as that player.
let C = null;
export function init(ctx) { C = ctx; }
const MAX_SQUADS = 3;
const $ = (id) => document.getElementById(id);
const esc = (s) => C.esc(s);
const fmt = (n) => C.fmt(n);
const day = (t) => { const d = new Date(t || Date.now()); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from({ length: 5 }, () => CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)]).join('');
const keyNow = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const ICON = {
  squad: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14.5 14.6c3 .1 5.5 2.4 5.5 5.4"/></svg>',
  flame: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2c1 3.5 5 5.5 5 11a5 5 0 0 1-10 0c0-2.4 1.2-4 2.5-5.2-.1 1.8.6 3 1.8 3.7C11 8.6 11.4 5.5 12 2z"/></svg>',
  dot: '<i class="sqDot"></i>'
};

// ---------------------------------------------------------------- events (set in config.js)
export function activeEvent(t) {
  const d = day(t);
  return (C.CFG.events || []).find((e) => e.from <= d && d <= e.to) || null;
}
export function eventBanner() {
  const e = activeEvent(); if (!e) return '';
  return '<div class="evBanner"><b>' + esc(e.name) + '</b><span>' + (e.x > 1 ? 'x' + e.x + ' squad points' : '') + (e.note ? ' · ' + esc(e.note) : '') + ' · until ' + esc(e.to) + '</span></div>';
}

// ---------------------------------------------------------------- identity
// the mock database (?mock) shares one browser between test players, so it keeps the code per tab
const idGet = () => { if (C.MOCK) { try { return JSON.parse(sessionStorage.getItem('live:id')); } catch (e) { return null; } } return C.store.get('id'); };
const idSet = (v) => { if (C.MOCK) sessionStorage.setItem('live:id', JSON.stringify(v)); else C.store.set('id', v); };
export const me = () => idGet();
export async function claim(pid, k) {
  if (!/^[a-z0-9]{10}$/.test(pid || '') || !/^[a-z0-9]{16}$/.test(k || '')) throw new Error('code');
  const api = await C.ready();
  if (C.MOCK) { const s = await api.get('secrets/' + pid); if (s && s !== k) throw new Error('code'); if (!s) await api.set('secrets/' + pid, k); }
  else { try { await api.set('secrets/' + pid, k); } catch (e) { /* already set: the link below checks it */ } }
  try { await api.set('links/' + pid + '/' + api.uid, k); } catch (e) { throw new Error('code'); }
  idSet({ pid, k });
  return { pid, k };
}
// the hub passes its code as ?id=pid.k on every link
export async function fromLink() {
  const raw = C.params.get('id'); if (!raw) return me();
  const [pid, k] = raw.split('.');
  const cur = me(); if (cur && cur.pid === pid && cur.k === k) return cur;
  try { return await claim(pid, k); } catch (e) { return cur; }
}
const profile = async (pid) => (await C.api.get('players/' + pid)) || {};
const mySquads = (P) => Object.keys((P && P.sq) || {});

// ---------------------------------------------------------------- squad maths
function weekOf(sq, wk) { const w = ((sq.week || {})[wk]) || {}; return Object.keys(w).map((p) => Object.assign({ p }, w[p])); }
function squadWeek(sq, wk) { return weekOf(sq, wk).reduce((a, x) => ({ pts: a.pts + (x.pts || 0), cor: a.cor + (x.cor || 0), boss: a.boss + (x.boss || 0), games: a.games + (x.games || 0) }), { pts: 0, cor: 0, boss: 0, games: 0 }); }
const goalOf = (sq) => Object.assign({ kind: 'cor', target: 300 }, sq.goal || {});
const GOAL_KIND = { cor: ['right answers', 'cor'], boss: ['bosses beaten', 'boss'], games: ['games played', 'games'], pts: ['squad points', 'pts'] };
function streakOf(members) {
  // consecutive days, counting back from today (or yesterday if nobody has gone yet today), with at least one member active
  const active = new Set(); members.forEach((m) => Object.keys((m.P && m.P.days) || {}).forEach((d) => active.add(d)));
  let n = 0, t = Date.now(); if (!active.has(day(t))) t -= 864e5;
  while (active.has(day(t)) && n < 400) { n++; t -= 864e5; }
  return n;
}
async function addContribution(pid, P, add, feedItems) {
  const api = C.api, wk = 'w' + C.weekKey(api.now()), ev = activeEvent(), x = ev && ev.x > 1 ? ev.x : 1;
  const out = [];
  for (const sid of mySquads(P)) {
    const sq = await api.get('squads/' + sid); if (!sq || !(sq.members || {})[pid]) continue;
    const before = squadWeek(sq, wk), cur = (((sq.week || {})[wk]) || {})[pid] || {};
    const pts = Math.round((add.pts || 0) * x);
    const next = { n: P.n || 'Cadet', pts: (cur.pts || 0) + pts, cor: (cur.cor || 0) + (add.cor || 0), boss: (cur.boss || 0) + (add.boss || 0), games: (cur.games || 0) + (add.games || 0) };
    await api.set('squads/' + sid + '/week/' + wk + '/' + pid, next);
    const g = goalOf(sq), f = GOAL_KIND[g.kind][1], had = before[f], now = had + (next[f] - (cur[f] || 0));
    const items = feedItems.slice();
    if (had < g.target && now >= g.target) items.push({ kind: 'goal', text: 'pushed the squad past this week\'s goal: ' + fmt(g.target) + ' ' + GOAL_KIND[g.kind][0] });
    for (const it of items) await api.set('feed/' + sid + '/' + keyNow(), { p: pid, n: P.n || 'Cadet', kind: it.kind, text: it.text, t: api.TS });
    out.push({ sid, name: sq.name, pts, goal: g, prog: now });
  }
  return out;
}
export async function liveCredit(gamePts, modeName, place, players) {
  const id = me(); if (!id) return;
  const P = await profile(id.pid); if (!mySquads(P).length) return;
  const feed = place === 1 && players >= 3 ? [{ kind: 'win', text: 'won a live ' + modeName + ' game against ' + (players - 1) + ' others' }] : [];
  await C.api.update('players/' + id.pid, { ['days/' + day()]: 1, last: C.api.TS });
  await addContribution(id.pid, P, { pts: Math.round(gamePts / 20), games: 1 }, feed);
}
export async function scoreFeed(gameName, rankOnWeek) {
  const id = me(); if (!id || rankOnWeek > 3) return;
  const P = await profile(id.pid); if (!mySquads(P).length) return;
  await addContribution(id.pid, P, {}, [{ kind: 'board', text: 'took #' + rankOnWeek + ' on ' + gameName + ' this week' }]);
}
export async function joinInfo() {
  // what a live-game player entry carries: player id, primary squad, rank
  const id = me(); if (!id) return {};
  const P = await profile(id.pid), sq = mySquads(P)[0];
  const out = { pid: id.pid }; if (P.r) out.rank = P.r;
  if (sq) { const s = await C.api.get('squads/' + sq + '/name'); out.sq = sq; out.sqn = s || sq; }
  return out;
}

// ---------------------------------------------------------------- Report in
export async function report(j, quiet) {
  const api = await C.ready();
  let id;
  try { id = await claim(j.pid, j.k); } catch (e) { if (!quiet) C.view('<section class="card center"><h1>That report link is broken</h1><p>Go back to the study hub and tap Report in again.</p></section>'); return null; }
  const P = await profile(id.pid);
  if (!P.n && !quiet) return askName(id.pid, () => report(j));
  const prev = ((P.tot || {})[j.ch]) || null, s = j.s || {};
  const d = prev ? { qc: Math.max(0, (s.qc || 0) - (prev.qc || 0)), gc: Math.max(0, (s.gc || 0) - (prev.gc || 0)), gb: Math.max(0, (s.gb || 0) - (prev.gb || 0)), gg: Math.max(0, (s.gg || 0) - (prev.gg || 0)) } : { qc: 0, gc: 0, gb: 0, gg: 0 };
  const today = day(), firstToday = !(P.days || {})[today];
  const pts = d.qc * 10 + d.gc * 5 + d.gb * 100 + (firstToday ? 20 : 0);
  const feed = [];
  if (P.l && j.l > P.l) feed.push({ kind: 'rank', text: 'was promoted to ' + j.r });
  if (d.gb > 0) feed.push({ kind: 'boss', text: 'beat ' + (d.gb === 1 ? 'a lesson boss' : d.gb + ' lesson bosses') });
  if (firstToday && P.days && Object.keys(P.days).length === 0) feed.push({ kind: 'join', text: 'reported in for the first time' });
  const patch = { r: j.r || P.r || 'Cadet', l: j.l || P.l || 1, last: api.TS, ['days/' + today]: 1, ['tot/' + j.ch]: s };
  if (P.share) patch.rd = { acc: j.ra == null ? null : j.ra, cov: j.rc || 0, ch: j.ch, at: api.TS };
  await api.update('players/' + id.pid, patch);
  const P2 = Object.assign({}, P, patch);
  const res = await addContribution(id.pid, P2, { pts, cor: d.qc + d.gc, boss: d.gb, games: d.gg }, feed);
  if (quiet) return res;
  const ev = activeEvent();
  C.view(eventBanner() + '<section class="card center"><div class="brand">Reported in</div><h1>' + (prev ? '+' + fmt(pts * (ev && ev.x > 1 ? ev.x : 1)) + ' squad points' : 'You\'re on the roster') + '</h1>' +
    (prev ? '<p>' + [d.qc + d.gc ? fmt(d.qc + d.gc) + ' right answers' : '', d.gb ? d.gb + ' boss' + (d.gb > 1 ? 'es' : '') : '', firstToday ? 'first report today +20' : ''].filter(Boolean).join(' · ') + '</p>' : '<p>From now on, every right answer, boss and game you report adds to your squads.</p>') +
    (res.length ? '<div class="sqMini">' + res.map((r) => '<a class="sqCard" href="?squad=' + r.sid + C.MQ + '"><b>' + esc(r.name) + '</b><span>' + fmt(r.prog) + ' / ' + fmt(r.goal.target) + ' ' + GOAL_KIND[r.goal.kind][0] + '</span><i class="bar"><i style="width:' + Math.min(100, 100 * r.prog / r.goal.target) + '%"></i></i></a>').join('') + '</div>' : '<p class="small">You are not in a squad yet.</p>') +
    C.dangle('report') + '<a class="btn main" href="?squads' + C.MQ + '">' + (res.length ? 'Open my squads' : 'Join or create a squad') + '</a>' + C.hubBtn() + '</section>');
  return res;
}
function askName(pid, then) {
  C.view('<section class="card join"><div class="brand">Your cadet profile</div><h1>Pick your name</h1><p class="small">This is how your squads and the leaderboards will see you.</p><form id="nmF"><label>Name<input id="nm" maxlength="16" value="' + esc(C.store.get('nick') || '') + '"></label><button class="main">Save</button></form></section>');
  $('nmF').onsubmit = async (e) => { e.preventDefault(); const n = $('nm').value.trim().replace(/\s+/g, ' ').slice(0, 16); if (n.length < 2) return; C.store.set('nick', n); await C.api.update('players/' + pid, { n }); then(); };
  $('nm').focus();
}

// ---------------------------------------------------------------- My squads
export async function squadsPage(msg) {
  const api = await C.ready();
  const id = await fromLink();
  if (!id) return noId();
  const P = await profile(id.pid);
  if (!P.n) return askName(id.pid, () => squadsPage(msg));
  const join = C.params.get('join');
  if (join && !msg && !mySquads(P).includes(join.toUpperCase())) return joinSquad(id, P, join.toUpperCase());
  const wk = 'w' + C.weekKey(api.now()), list = [];
  for (const sid of mySquads(P)) { const sq = await api.get('squads/' + sid); if (sq) list.push(Object.assign({ sid }, sq)); }
  C.view(eventBanner() + '<section class="card host"><div class="brand">Squads</div><h1>My squads</h1>' + (msg ? '<p class="' + (msg.ok ? 'ok' : 'err') + '">' + esc(msg.t) + '</p>' : '') +
    '<div class="sqMe"><span>' + ICON.squad + '</span><div><b>' + esc(P.n) + '</b><small>' + esc(P.r || 'Cadet') + '</small></div><button class="ghost" id="sqRename">Change name</button></div>' +
    (list.length ? '<div class="sqMini">' + list.map((sq) => { const w = squadWeek(sq, wk), g = goalOf(sq), prog = w[GOAL_KIND[g.kind][1]]; return '<a class="sqCard" href="?squad=' + sq.sid + C.MQ + '"><b>' + esc(sq.name) + '</b><span>' + Object.keys(sq.members || {}).length + ' members · ' + fmt(w.pts) + ' pts this week</span><i class="bar"><i style="width:' + Math.min(100, 100 * prog / g.target) + '%"></i></i><small>' + fmt(prog) + ' / ' + fmt(g.target) + ' ' + GOAL_KIND[g.kind][0] + '</small></a>'; }).join('') + '</div>' : '<p class="small">You are not in a squad yet. Join one with a code from a classmate, or create your own.</p>') +
    (list.length < MAX_SQUADS ? '<div class="row2 sqForms"><form id="sqJoin"><label>Join with a code<input id="sqCode" maxlength="5" placeholder="ABCDE" autocapitalize="characters"></label><button class="main">Join</button></form>' +
      '<form id="sqNew"><label>Create a squad<input id="sqName" maxlength="24" placeholder="Class 26-03"></label><button class="main">Create</button></form></div>' : '<p class="small">You are in the most squads allowed (' + MAX_SQUADS + '). Leave one to join another.</p>') +
    '<div class="sqLinks"><a class="btn" href="?squadboard' + C.MQ + '">All squads this week</a><a class="btn" href="?tv' + C.MQ + '">TV mode</a></div>' +
    '<details class="sqCode"><summary>Your player code</summary><p>Keep this to use your squads on another phone or browser. In the study hub it is under Live and multiplayer.</p><code>' + id.pid + '-' + id.k + '</code>' +
    '<form id="sqUse"><label>Use a different player code<input id="sqUseIn" placeholder="xxxxxxxxxx-xxxxxxxxxxxxxxxx"></label><button class="ghost">Use code</button></form></details>' +
    '<label class="tick"><input type="checkbox" id="sqShare"' + (P.share ? ' checked' : '') + '> Share my exam readiness (accuracy and coverage) with my squads</label>' + C.hubBtn() + '</section>');
  $('sqRename').onclick = () => askName(id.pid, () => squadsPage({ ok: 1, t: 'Name saved.' }));
  const jf = $('sqJoin'); if (jf) jf.onsubmit = (e) => { e.preventDefault(); joinSquad(id, P, $('sqCode').value.trim().toUpperCase()); };
  const nf = $('sqNew'); if (nf) nf.onsubmit = async (e) => {
    e.preventDefault(); const name = $('sqName').value.trim().replace(/\s+/g, ' ').slice(0, 24); if (name.length < 2) return squadsPage({ t: 'Give the squad a name of at least 2 characters.' });
    let sid = ''; for (let i = 0; i < 8 && !sid; i++) { const c = newCode(); if (!(await api.get('squads/' + c))) sid = c; }
    await api.set('squads/' + sid, { name, owner: id.pid, created: api.TS, goal: { kind: 'cor', target: 300 }, members: { [id.pid]: { at: api.TS } } });
    await api.update('players/' + id.pid, { ['sq/' + sid]: 1 });
    await api.set('feed/' + sid + '/' + keyNow(), { p: id.pid, n: P.n, kind: 'join', text: 'created the squad', t: api.TS });
    location.search = '?squad=' + sid + C.MQ;
  };
  $('sqUse').onsubmit = async (e) => { e.preventDefault(); const [p, k] = $('sqUseIn').value.trim().toLowerCase().split('-'); try { await claim(p, k); squadsPage({ ok: 1, t: 'Player code switched.' }); } catch (x) { squadsPage({ t: 'That player code does not match.' }); } };
  $('sqShare').onchange = (e) => api.update('players/' + id.pid, e.target.checked ? { share: true } : { share: null, rd: null });
}
async function joinSquad(id, P, code) {
  const api = C.api;
  if (!/^[A-Z2-9]{5}$/.test(code)) return squadsPage({ t: 'Squad codes are 5 letters and numbers.' });
  if (mySquads(P).includes(code)) return location.search = '?squad=' + code + C.MQ;
  if (mySquads(P).length >= MAX_SQUADS) return squadsPage({ t: 'You can be in ' + MAX_SQUADS + ' squads at once. Leave one first.' });
  const sq = await api.get('squads/' + code);
  if (!sq) return squadsPage({ t: 'No squad with that code.' });
  await api.set('squads/' + code + '/members/' + id.pid, { at: api.TS });
  await api.update('players/' + id.pid, { ['sq/' + code]: 1 });
  await api.set('feed/' + code + '/' + keyNow(), { p: id.pid, n: P.n, kind: 'join', text: 'joined the squad', t: api.TS });
  location.search = '?squad=' + code + C.MQ;
}
function noId() {
  C.view('<section class="card center"><h1>Squads start in your study hub</h1><p>Open the hub, go to Games, and tap <b>Squads</b> under Live and multiplayer. That links this browser to your cadet profile.</p>' +
    '<form id="sqUse"><label>Or paste your player code<input id="sqUseIn" placeholder="xxxxxxxxxx-xxxxxxxxxxxxxxxx"></label><button class="main">Use code</button></form>' + C.hubBtn() + '</section>');
  $('sqUse').onsubmit = async (e) => { e.preventDefault(); const [p, k] = $('sqUseIn').value.trim().toLowerCase().split('-'); try { await claim(p, k); squadsPage(); } catch (x) { noId(); C.toast('That player code does not match.'); } };
}

// ---------------------------------------------------------------- one squad
export async function squadPage(sid) {
  const api = await C.ready();
  const id = await fromLink();
  sid = String(sid || '').toUpperCase();
  const sq = await api.get('squads/' + sid);
  if (!sq) return C.view('<section class="card center"><h1>Squad not found</h1><p>It may have been closed.</p><a class="btn main" href="?squads' + C.MQ + '">My squads</a></section>');
  const wk = 'w' + C.weekKey(api.now()), pids = Object.keys(sq.members || {});
  const members = []; for (const p of pids) members.push({ p, P: await profile(p) });
  const w = ((sq.week || {})[wk]) || {}, today = day();
  const rows = members.map((m) => Object.assign({ p: m.p, n: m.P.n || 'Cadet', r: m.P.r || 'Cadet', on: !!(m.P.days || {})[today], rd: m.P.share ? m.P.rd : null }, w[m.p] || {})).sort((a, b) => (b.pts || 0) - (a.pts || 0) || a.n.localeCompare(b.n));
  const tot = squadWeek(sq, wk), g = goalOf(sq), prog = tot[GOAL_KIND[g.kind][1]], streak = streakOf(members), isMember = id && pids.includes(id.pid), isOwner = id && sq.owner === id.pid;
  const feed = await api.last('feed/' + sid, 25);
  const ready = rows.filter((r) => r.rd && r.rd.acc != null);
  const joinUrl = location.origin + location.pathname + '?squads&join=' + sid + C.MQ;
  C.view(eventBanner() + '<section class="card host sq"><div class="brand">Squad · code <b>' + sid + '</b></div><h1>' + esc(sq.name) + '</h1>' +
    '<div class="sqStats"><div><b>' + fmt(tot.pts) + '</b><span>points this week</span></div><div><b>' + ICON.flame + streak + '</b><span>day squad streak</span></div><div><b>' + rows.filter((r) => r.on).length + '/' + rows.length + '</b><span>studied today</span></div></div>' +
    '<div class="sqGoal"><div><b>Weekly goal</b><span>' + fmt(prog) + ' / ' + fmt(g.target) + ' ' + GOAL_KIND[g.kind][0] + '</span></div><i class="bar big"><i style="width:' + Math.min(100, 100 * prog / g.target) + '%"></i></i>' + (prog >= g.target ? '<p class="ok">Goal reached this week.</p>' : '') + '</div>' +
    C.dangle('squad') + '<h3>This week</h3><ol class="lb all sqRows">' + rows.map((r) => '<li class="' + (id && r.p === id.pid ? 'me' : '') + '"><span>' + (r.on ? '<i class="sqDot on" title="Studied today"></i>' : '<i class="sqDot" title="Not yet today"></i>') + esc(r.n) + ' <em class="rk">' + esc(r.r) + '</em>' + (r.p === sq.owner ? ' <em class="rk">leader</em>' : '') + '</span><b>' + fmt(r.pts || 0) + '</b></li>').join('') + '</ol>' +
    (ready.length ? '<h3>Readiness board</h3><div class="rdList">' + ready.map((r) => '<div class="rd"><span>' + esc(r.n) + '</span><i class="bar"><i style="width:' + r.rd.acc + '%"></i></i><b>' + r.rd.acc + '%</b><small>' + r.rd.cov + '% covered</small></div>').join('') + '</div><p class="small">Members who chose to share their practice accuracy and how much of the chapter they have covered.</p>' : '') +
    '<h3>Squad feed</h3>' + (feed.length ? '<ul class="feed">' + feed.map((f) => '<li class="k-' + esc(f.kind) + '"><b>' + esc(f.n) + '</b> ' + esc(f.text) + '<time>' + ago(f.t) + '</time></li>').join('') + '</ul>' : '<p class="small">Nothing yet. Report in from the study hub to get it started.</p>') +
    (isMember ? '<div class="sqShare"><span>Invite with code <b>' + sid + '</b></span><button class="ghost" id="sqCopy">Copy invite link</button></div>' : (id ? '<button class="main" id="sqJoinBtn">Join this squad</button>' : '')) +
    (isOwner ? '<details class="sqOwner"><summary>Squad leader tools</summary><form id="sqRen"><label>Squad name<input id="sqRenIn" maxlength="24" value="' + esc(sq.name) + '"></label><button class="ghost">Rename</button></form>' +
      '<form id="sqGoalF" class="row2"><label>Goal<select id="sqGk">' + Object.keys(GOAL_KIND).map((k) => '<option value="' + k + '"' + (k === g.kind ? ' selected' : '') + '>' + GOAL_KIND[k][0] + '</option>').join('') + '</select></label><label>Target<input id="sqGt" type="number" min="1" max="100000" value="' + g.target + '"></label><button class="ghost">Set goal</button></form>' +
      (rows.length > 1 ? '<p class="small">Remove a member:</p><div class="chips">' + rows.filter((r) => r.p !== id.pid).map((r) => '<button class="chip" data-rm="' + r.p + '">' + esc(r.n) + '</button>').join('') + '</div>' : '') + '</details>' : '') +
    '<div class="sqLinks"><a class="btn" href="?squads' + C.MQ + '">My squads</a><a class="btn" href="?squadboard' + C.MQ + '">All squads</a><a class="btn" href="?tv&squad=' + sid + C.MQ + '">TV mode</a>' + (isMember ? '<button class="ghost" id="sqLeave">Leave squad</button>' : '') + '</div>' + C.hubBtn() + '</section>');
  const cp = $('sqCopy'); if (cp) cp.onclick = async () => { try { if (navigator.share) await navigator.share({ title: 'Join ' + sq.name, text: 'Join my squad ' + sq.name + ' (code ' + sid + ')', url: joinUrl }); else { await navigator.clipboard.writeText(joinUrl); C.toast('Invite link copied'); } } catch (e) {} };
  const jb = $('sqJoinBtn'); if (jb) jb.onclick = async () => joinSquad(id, await profile(id.pid), sid);
  const lv = $('sqLeave'); if (lv) lv.onclick = async () => {
    if (!window.confirm('Leave ' + sq.name + '? Your points this week stay with the squad.')) return;
    const P = await profile(id.pid);
    if (isOwner) { const others = pids.filter((p) => p !== id.pid); if (others.length) await api.update('squads/' + sid, { owner: others[0] }); }
    await api.set('feed/' + sid + '/' + keyNow(), { p: id.pid, n: P.n || 'Cadet', kind: 'leave', text: 'left the squad', t: api.TS });
    await api.remove('squads/' + sid + '/members/' + id.pid);
    await api.update('players/' + id.pid, { ['sq/' + sid]: null });
    if (pids.length === 1) await api.remove('squads/' + sid);
    location.search = '?squads' + C.MQ;
  };
  if (isOwner) {
    $('sqRen').onsubmit = async (e) => { e.preventDefault(); const n = $('sqRenIn').value.trim().slice(0, 24); if (n.length >= 2) { await api.update('squads/' + sid, { name: n }); squadPage(sid); } };
    $('sqGoalF').onsubmit = async (e) => { e.preventDefault(); const t = Math.max(1, Math.min(100000, Math.round(+$('sqGt').value || 0))); await api.update('squads/' + sid, { goal: { kind: $('sqGk').value, target: t } }); squadPage(sid); };
    document.querySelectorAll('[data-rm]').forEach((b) => b.onclick = async () => { if (!window.confirm('Remove ' + b.textContent + ' from the squad?')) return; await api.remove('squads/' + sid + '/members/' + b.dataset.rm); squadPage(sid); });
  }
}
function ago(t) { const s = Math.max(0, (Date.now() - (t || 0)) / 1000); return s < 90 ? 'just now' : s < 5400 ? Math.round(s / 60) + ' min ago' : s < 129600 ? Math.round(s / 3600) + ' h ago' : Math.round(s / 86400) + ' d ago'; }

// ---------------------------------------------------------------- all squads this week
async function allSquads() {
  const api = C.api, wk = 'w' + C.weekKey(api.now()), all = (await api.get('squads')) || {};
  return Object.keys(all).map((sid) => Object.assign({ sid, w: squadWeek(all[sid], wk), size: Object.keys(all[sid].members || {}).length }, all[sid])).sort((a, b) => b.w.pts - a.w.pts);
}
export async function boardPage() {
  await C.ready(); const id = await fromLink(); const P = id ? await profile(id.pid) : {}; const mine = mySquads(P);
  const list = (await allSquads()).slice(0, 50);
  C.view(eventBanner() + '<section class="card host"><div class="brand">Squads</div><h1>All squads this week</h1>' +
    (list.length ? '<ol class="lb all">' + list.map((s) => '<li class="' + (mine.includes(s.sid) ? 'me' : '') + '"><span><a href="?squad=' + s.sid + C.MQ + '">' + esc(s.name) + '</a> <em class="rk">' + s.size + ' members</em></span><b>' + fmt(s.w.pts) + '</b></li>').join('') + '</ol>' : '<p class="small">No squads yet.</p>') +
    '<p class="small">Squad points: 10 per right practice answer, 5 per right game answer, 100 per boss beaten, 20 for the first report of the day, plus live-game points. Events can multiply them.</p>' +
    '<div class="sqLinks"><a class="btn" href="?squads' + C.MQ + '">My squads</a><a class="btn" href="?tv' + C.MQ + '">TV mode</a></div>' + C.hubBtn() + '</section>');
}

// ---------------------------------------------------------------- TV mode
export async function tvPage() {
  await C.ready(); document.body.classList.add('tv');
  const focus = (C.params.get('squad') || '').toUpperCase();
  let slide = 0, timer = null;
  async function draw() {
    const api = C.api, wk = 'w' + C.weekKey(api.now()), list = await allSquads(), ev = activeEvent();
    const slides = [];
    slides.push('<h2>Squad standings · this week</h2><ol class="tvList">' + list.slice(0, 8).map((s, i) => '<li class="' + (s.sid === focus ? 'me' : '') + '"><i>' + (i + 1) + '</i><span>' + esc(s.name) + '</span><b>' + fmt(s.w.pts) + '</b></li>').join('') + '</ol>');
    const fs = focus ? list.find((s) => s.sid === focus) : list[0];
    if (fs) {
      const g = goalOf(fs), prog = fs.w[GOAL_KIND[g.kind][1]], rows = weekOf(fs, wk).sort((a, b) => (b.pts || 0) - (a.pts || 0)).slice(0, 8);
      slides.push('<h2>' + esc(fs.name) + '</h2><div class="tvGoal"><span>Weekly goal: ' + fmt(prog) + ' / ' + fmt(g.target) + ' ' + GOAL_KIND[g.kind][0] + '</span><i class="bar big"><i style="width:' + Math.min(100, 100 * prog / g.target) + '%"></i></i></div><ol class="tvList">' + rows.map((r, i) => '<li><i>' + (i + 1) + '</i><span>' + esc(r.n) + '</span><b>' + fmt(r.pts) + '</b></li>').join('') + '</ol>');
      const feed = await api.last('feed/' + fs.sid, 8);
      if (feed.length) slides.push('<h2>' + esc(fs.name) + ' · latest</h2><ul class="tvFeed">' + feed.map((f) => '<li><b>' + esc(f.n) + '</b> ' + esc(f.text) + '<time>' + ago(f.t) + '</time></li>').join('') + '</ul>');
    }
    const ch = (C.CFG.chapters || [])[0];
    if (ch) { const rows = await api.top('lb/' + ch.id + '/speed_N/w' + C.weekKey(api.now()), 8, false); if (rows.length) slides.push('<h2>Speed Round · Normal · this week</h2><ol class="tvList">' + rows.map((r, i) => '<li><i>' + (i + 1) + '</i><span>' + esc(r.name) + (r.r ? ' <em>' + esc(r.r) + '</em>' : '') + '</span><b>' + fmt(r.s) + '</b></li>').join('') + '</ol>'); }
    slide = slide % slides.length;
    C.view('<div class="tvWrap">' + (ev ? '<div class="evBanner big"><b>' + esc(ev.name) + '</b><span>' + (ev.x > 1 ? 'x' + ev.x + ' squad points' : '') + (ev.note ? ' · ' + esc(ev.note) : '') + '</span></div>' : '') + '<div class="tvSlide">' + slides[slide] + '</div><div class="tvDots">' + slides.map((_, i) => '<i class="' + (i === slide ? 'on' : '') + '"></i>').join('') + '</div><a class="tvExit" href="?squads' + C.MQ + '">Exit TV mode</a></div>');
  }
  await draw();
  timer = setInterval(() => { slide++; draw(); }, 12000);
}
