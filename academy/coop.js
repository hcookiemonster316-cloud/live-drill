// Co-op layer: commendations, partner of the week, ride-alongs, the squad dispatch board, district goals,
// mutual aid across districts, unit-specific backup, a push-to-talk radio wheel and live partner choices in co-op scenes.
// Network traffic stays small: one listener per feature on your own inbox path, and short records that expire.
const COMMENDS = [['🛡️', 'Good cover'], ['🧘', 'Calm under pressure'], ['📻', 'Clear radio'], ['📘', 'By the book'], ['🤝', 'Great teamwork'], ['⚡', 'Fast response']];
const PT_RANKS = [[30, 'Bronze Partners', '#cd7f32'], [80, 'Silver Partners', '#c0c7d1'], [150, 'Gold Partners', '#f5b800']];
const CM_TITLES = [[3, 'Trusted Partner'], [10, 'Officer\'s Officer'], [25, 'The One You Call']];
const WANT = [['any', '🚓', 'Any unit'], ['k9', '🐕', 'K9'], ['swat', '🛡️', 'SWAT'], ['neg', '🗣️', 'Negotiator'], ['det', '🕵️', 'Detective'], ['sup', '⭐', 'Supervisor']];
const PTT = [[0, '10-4'], [1, 'En route'], [4, 'Code 4'], [9, 'Need a supervisor']];
export const QUICK_EXTRA = 'Need a supervisor';
export function installCoop(H) {
  const S = H.S, esc = H.esc, net = () => H.net(), wk = () => H.weekKey().replace('w', 'W');
  S.comms2 = S.comms2 || {}; S.cmSeen = S.cmSeen || 0; S.dg = S.dg || {};
  let stops = [], me = null;
  const card = (id) => { let el = document.getElementById(id); if (!el) { el = document.createElement('div'); el.id = id; el.className = 'coCard'; el.hidden = true; document.body.appendChild(el); } return el; };
  const isSup = () => !!(S.fto || S.graduated || S.graduatedOnce);

  // ================= start listening once online =================
  function online(uid) {
    if (me === uid) return; me = uid; stops.forEach((f) => f && f()); stops = []; const n = net(); if (!n) return;
    stops.push(n.gon('mmo/cm/' + uid, cmIn), n.gon('mmo/pt/' + uid, ptIn));
    joinDistrict();
  }
  let aidStop = null, dgStop = null, asStop = null;
  function joinDistrict() {
    const n = net(); if (!n || !me) return; const d = H.W() && H.W().did; if (d == null) return;
    if (aidStop) aidStop(); aidStop = n.gon('mmo/aid/' + d, aidIn);
    if (dgStop) dgStop(); dgStop = n.gon('mmo/ev/' + H.weekKey() + '/dg' + d, (v) => { dgSum = Object.values(v || {}).reduce((a, b) => a + (+b || 0), 0); dgCheck(); });
    squadWatch();
  }

  // ================= commendations =================
  function commendPrompt(uid, cs, why) {
    if (!uid || !net()) return; const el = card('cmCard');
    el.innerHTML = '<div class="coTop"><b>🎖️ COMMEND YOUR PARTNER</b><button type="button" class="coX">✕</button></div><p>' + esc(cs) + (why ? ' · ' + esc(why) : '') + '</p><div class="coChips">' + COMMENDS.map((c, k) => '<button type="button" data-k="' + k + '">' + c[0] + ' ' + c[1] + '</button>').join('') + '</div>';
    el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); const t = setTimeout(() => { el.hidden = true; }, 14000);
    el.querySelector('.coX').onclick = () => { clearTimeout(t); el.hidden = true; };
    el.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => { clearTimeout(t); el.hidden = true; send(uid, +b.dataset.k, cs); });
  }
  function send(uid, k, cs) { try { net().gset('mmo/cm/' + uid + '/' + me, { k, c: S.cs, t: net().TS }); } catch (e) {} H.stat('commendSent'); H.toast('🎖️ You commended ' + cs + ': ' + COMMENDS[k][1] + '.'); ptAdd(uid, 3); }
  function cmIn(v) {
    Object.keys(v || {}).forEach((from) => { const c = v[from]; if (!c || !c.t || c.t <= S.cmSeen) return; S.cmSeen = Math.max(S.cmSeen, c.t); const kk = COMMENDS[c.k] || COMMENDS[0];
      S.comms2[c.k] = (S.comms2[c.k] || 0) + 1; const tot = Object.values(S.comms2).reduce((a, b) => a + b, 0); H.stat('commends');
      H.banner(kk[0], c.c + ' commended you', kk[1] + '. That\'s ' + tot + ' commendation' + (tot > 1 ? 's' : '') + ' from other cadets.'); H.buzz('ok');
      CM_TITLES.forEach(([n, ti]) => { if (tot === n) { S.titles = S.titles || {}; S.titles[ti] = 1; H.banner('🏷️', 'Title unlocked: ' + ti, n + ' commendations from other cadets.'); } }); });
    H.saveS();
  }

  // ================= partner of the week + ride-along requests =================
  let ptQ = [];
  function partnerAsk(uid, cs, ride) { if (!net()) return; try { net().gset('mmo/pt/' + uid + '/' + me, { c: S.cs, w: wk(), ra: !!ride, t: net().TS }); } catch (e) {} H.toast(ride ? '🚓 Ride-along invite sent to ' + cs + '.' : '🤝 Partner request sent to ' + cs + '.'); }
  function ptIn(v) {
    Object.keys(v || {}).forEach((from) => { const r = v[from]; if (!r || r.w !== wk()) return;
      if (r.a) { // they accepted my request
        if (r.ra) { if (!RIDE.host) H.toast('🚓 ' + r.c + ' is riding along with you. Clear calls and they learn with you.'); RIDE.rider = { uid: from, c: r.c }; }
        else if (!S.partner || S.partner.uid !== from || S.partner.w !== wk()) { S.partner = { uid: from, c: r.c, w: wk(), pts: 0 }; H.saveS(); H.banner('🤝', 'Partners this week: ' + r.c, 'Shared calls, backup and ride-alongs earn partner rank.'); }
        try { net().grm('mmo/pt/' + me + '/' + from); } catch (e) {} return; }
      if (ptQ.some((x) => x.from === from && x.t === r.t)) return; ptQ.push({ from, c: r.c, ra: !!r.ra, t: r.t }); ptShow(); });
  }
  function ptShow() {
    const el = card('ptCard'), r = ptQ[0]; if (!r || !el.hidden) return;
    el.innerHTML = '<div class="coTop"><b>' + (r.ra ? '🚓 RIDE-ALONG INVITE' : '🤝 PARTNER REQUEST') + '</b></div><p><b>' + esc(r.c) + '</b> ' + (r.ra ? 'invites you to ride along. You\'ll travel with them and answer a question on each of their calls.' : 'wants to be your partner this week.') + '</p><div class="coBtns"><button type="button" id="ptYes">Accept</button><button type="button" class="ghost" id="ptNo">Not now</button></div>';
    el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); H.buzz('backup');
    const done = () => { el.hidden = true; ptQ.shift(); try { net().grm('mmo/pt/' + me + '/' + r.from); } catch (e) {} setTimeout(ptShow, 400); };
    el.querySelector('#ptNo').onclick = done;
    el.querySelector('#ptYes').onclick = () => { try { net().gset('mmo/pt/' + r.from + '/' + me, { c: S.cs, w: wk(), a: true, ra: r.ra, t: net().TS }); } catch (e) {}
      if (r.ra) rideStart(r.from, r.c); else { S.partner = { uid: r.from, c: r.c, w: wk(), pts: 0 }; H.saveS(); H.banner('🤝', 'Partners this week: ' + r.c, 'Back each other up to climb the partner ranks.'); } done(); };
  }
  function ptAdd(uid, n) {
    const p = S.partner; if (!p || p.uid !== uid) return; if (p.w !== wk()) { H.toast('🤝 Your partner week with ' + p.c + ' ended' + (p.rank ? ' at ' + p.rank : '') + '.'); S.partner = null; H.saveS(); return; }
    const was = p.pts || 0; p.pts = was + n; PT_RANKS.forEach(([need, name]) => { if (was < need && p.pts >= need) { p.rank = name; S.titles = S.titles || {}; S.titles[name] = 1; if (name === 'Gold Partners') { S.carSkins = S.carSkins || {}; S.carSkins.partners = { stripe: '#f5b800', text: 'PARTNERS' }; } H.banner('🤝', name + ' with ' + p.c, 'Partner rank up' + (name === 'Gold Partners' ? ' · car skin: PARTNERS' : '') + '.'); H.stat('ptRank'); } }); H.saveS();
  }
  const partnerOf = (uid) => S.partner && S.partner.uid === uid && S.partner.w === wk();

  // ================= ride-along =================
  // the rider travels with the host; on each of the host's calls the rider gets one question, and the host earns trainer points
  const RIDE = { host: null, rider: null, lastSt: null, lastRq: 0 };
  function rideStart(uid, c) { RIDE.host = { uid, c }; if (net()) net().ride(uid); H.setRiding(true); chip(); H.toast('🚓 Riding along with ' + c + '. Tap the chip at the top to end it.'); }
  function rideEnd(msg) { if (!RIDE.host) return; RIDE.host = null; if (net()) net().ride(null); H.setRiding(false); chip(); H.toast(msg || '🚓 Ride-along ended.'); }
  function chip() { const el = card('rideChip'); el.className = 'rideChip'; if (!RIDE.host) { el.hidden = true; return; } el.hidden = false; el.innerHTML = '🚓 Riding with <b>' + esc(RIDE.host.c) + '</b> · end'; el.onclick = () => rideEnd(); }
  function rideTick(others) {
    if (!RIDE.host) return; const o = others[RIDE.host.uid]; if (!o) return rideEnd('🚓 ' + RIDE.host.c + ' went off shift. Ride-along ended.');
    H.follow(o.rx, o.ry);
    if (o.st === 'call' && RIDE.lastSt !== 'call' && !H.busy()) { const q = H.L.pickFacts(S, H.W().D.lessons, 1)[0], id = H.sayAs('fto', { name: RIDE.host.c, icon: '🚓', role: 'Your ride-along officer' });
      H.dialogue([[id, '(in the car) On scene. Quick one before we get out:'], ['q', q, id]], (r) => { if (net()) net().rq(!!r.right); H.award(r.right ? 20 : 8, 'ride-along'); H.stat('rideQ'); ptAdd(RIDE.host && RIDE.host.uid, 2); }, { kicker: 'RIDE-ALONG', noFollow: true }); }
    RIDE.lastSt = o.st;
  }
  function hostSees(uid, v) { // the host notices the rider's answers
    if (!v.rq || !v.rq.t || v.rq.t <= RIDE.lastRq || v.ra !== me) return; RIDE.lastRq = v.rq.t; S.ftoPts = (S.ftoPts || 0) + (v.rq.ok ? 5 : 1); H.saveS();
    H.toast(v.rq.ok ? '🎓 ' + v.c + ' got the ride-along question right. +5 trainer points.' : '🎓 ' + v.c + ' missed one. Talk it through after the call.'); if (v.rq.ok) H.stat('rideTeach'); ptAdd(uid, 2);
  }

  // ================= squad dispatch board =================
  function squadWatch() {
    if (asStop) asStop(); asStop = null; const n = net(), sq = S.squad; if (!n || !sq || !me) return;
    asStop = n.gon('mmo/sq/' + sq.code + '/as/' + me, (a) => { if (!a || a.ok || !a.t || a.t === S.asSeen) return; S.asSeen = a.t; H.saveS(); asOffer(a); });
  }
  function asOffer(a) {
    const el = card('asCard'), here = H.W().did === a.d;
    el.innerHTML = '<div class="coTop"><b>🗺️ SQUAD DISPATCH</b></div><p>Your squad leader assigns you: <b>' + esc(a.l) + '</b>' + (here ? '' : ' (in ' + esc(H.dname(a.d)) + ')') + '</p><div class="coBtns"><button type="button" id="asYes">' + (here ? 'Copy, en route' : 'Can\'t, other district') + '</button><button type="button" class="ghost" id="asNo">Decline</button></div>';
    el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); H.buzz('backup');
    el.querySelector('#asNo').onclick = () => { el.hidden = true; };
    el.querySelector('#asYes').onclick = () => { el.hidden = true; if (!here) return; H.squadCall(a, () => { try { net().gupd('mmo/sq/' + S.squad.code + '/as/' + me, { ok: true }); } catch (e) {} H.award(40, 'squad dispatch'); H.stat('sqDispatch'); }); };
  }
  function board() {
    const sq = S.squad, n = net(); if (!sq || !n) { H.toast('Join a squad to use the dispatch board.'); return; } if (!sq.lead) { H.toast('Only the squad leader runs the dispatch board.'); return; }
    const W = H.W(), lots = W.lots.filter((l) => l.name), titles = H.callTitles(), mem = H.squadMembers().filter((m) => m.uid !== me), calls = [0, 1, 2].map(() => { const l = lots[Math.floor(Math.random() * lots.length)], t = titles[Math.floor(Math.random() * titles.length)]; return { x: l.door[0] + .5, y: l.door[1] + .5, l: (t[0] + ' · ' + l.name).slice(0, 48), p: t[1] }; });
    let pick = 0;
    const draw = () => H.openModal('<div class="sceneHead"><b>SQUAD DISPATCH BOARD · ' + esc(sq.tag) + '</b><h2>Assign your squad</h2><p>Pick a call, then the cadet to send. Finished assignments pay the whole squad.</p></div><div class="sdCalls">' + calls.map((c, k) => '<button type="button" data-c="' + k + '" class="' + (k === pick ? 'on' : '') + '"><b>' + (c.p === 1 ? '🚨' : '📻') + ' ' + esc(c.l) + '</b></button>').join('') + '</div><div class="sdMem">' +
      (mem.length ? mem.map((m) => '<button type="button" data-m="' + esc(m.uid) + '"><b>' + esc(m.c) + '</b><small>' + esc(H.dname(m.d)) + ' · ' + (m.st === 'call' ? 'on a call' : m.d === W.did ? 'available' : 'other district') + '</small></button>').join('') : '<p class="lkSum">No squadmates on shift right now.</p>') + '</div><div class="qAct"><button type="button" id="mClose">Close</button></div>');
    const bind = () => { document.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => { pick = +b.dataset.c; draw(); bind(); }); document.querySelectorAll('[data-m]').forEach((b) => b.onclick = () => { const c = calls[pick]; try { n.gset('mmo/sq/' + sq.code + '/as/' + b.dataset.m, { x: c.x, y: c.y, l: c.l, d: W.did, p: c.p || 2, t: n.TS }); } catch (e) {} H.toast('🗺️ Assigned: ' + c.l); H.stat('sqAssign'); b.disabled = true; }); const x = document.getElementById('mClose'); if (x) x.onclick = H.closeModal; };
    draw(); bind();
  }

  // ================= district weekly goal =================
  const DG_GOAL = 120; let dgSum = 0;
  function dgAdd() { const n = net(), d = H.W().did, k = H.weekKey() + ':' + d; S.dg[k] = (S.dg[k] || 0) + 1; H.saveS(); if (n) { try { n.gset('mmo/ev/' + H.weekKey() + '/dg' + d + '/' + me, Math.min(1000, S.dg[k])); } catch (e) {} } else { dgSum++; dgCheck(); } }
  function dgCheck() { const d = H.W() && H.W().did, k = H.weekKey() + ':' + d; if (d == null || dgSum < DG_GOAL || (S.dgDone || {})[k] || !(S.dg[k] > 0)) return; S.dgDone = S.dgDone || {}; S.dgDone[k] = 1; H.saveS(); H.banner('🏙️', H.dname(d) + ' weekly goal reached', DG_GOAL + ' calls cleared by everyone on shift this week. Reward unlocked.'); H.queueLoot(H.dname(d) + ' district goal', 1, 'e'); H.stat('dgGoal'); }
  const dgLine = () => { const d = H.W() && H.W().did; return d == null ? '' : '🏙️ ' + H.dname(d) + ' this week: ' + Math.min(dgSum, DG_GOAL) + '/' + DG_GOAL + ' calls'; };

  // ================= mutual aid =================
  // a backup request nobody in your district takes for 40 seconds is posted to the neighbouring districts too
  let aidPosted = null;
  function aidTick(call) {
    const n = net(), W = H.W(); if (!n || !W || !me) return;
    if (call && call.backup && !H.anyEnRoute() && !aidPosted && call.bkT && performance.now() - call.bkT > 40000) {
      const nb = [W.did - 1, W.did + 1].filter((d) => d >= 0 && d <= 4); aidPosted = nb;
      nb.forEach((d) => { try { n.gset('mmo/aid/' + d + '/' + me, { x: call.x, y: call.y, c: S.cs, f: W.did, l: call.title.slice(0, 48), s: S.shift, t: n.TS }); n.gbye('mmo/aid/' + d + '/' + me); } catch (e) {} });
      H.radio('Dispatch', S.cs + ', no units free in ' + H.dname(W.did) + '. Requesting mutual aid from neighbouring districts.');
    }
    if (aidPosted && (!call || !call.backup || H.anyEnRoute())) { aidPosted.forEach((d) => { try { n.grm('mmo/aid/' + d + '/' + me); } catch (e) {} }); aidPosted = null; }
  }
  let aidQ = [], aidSeen = {};
  function aidIn(v) {
    const now = H.now(); aidQ = Object.keys(v || {}).filter((u) => u !== me && v[u] && now - v[u].t < 180000 && !aidSeen[u + v[u].t]).map((u) => Object.assign({ uid: u }, v[u])); aidShow();
  }
  function aidShow() {
    const el = card('aidCard'), r = aidQ[0]; if (!r || !el.hidden || H.busy()) return; aidSeen[r.uid + r.t] = 1;
    el.innerHTML = '<div class="coTop"><b>🚨 MUTUAL AID REQUEST</b></div><p><b>' + esc(r.c) + '</b> in ' + esc(H.dname(r.f)) + ' needs a cover unit: ' + esc(r.l || 'backup') + '. Nobody there is free.</p><div class="coBtns"><button type="button" id="aidYes">Respond (temporary transfer)</button><button type="button" class="ghost" id="aidNo">Not now</button></div>';
    el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); H.buzz('p1');
    el.querySelector('#aidNo').onclick = () => { el.hidden = true; aidQ.shift(); };
    el.querySelector('#aidYes').onclick = () => { el.hidden = true; aidQ = []; S.aid = { back: H.W().did, uid: r.uid, c: r.c, x: r.x, y: r.y }; H.saveS(); H.radio(S.cs, 'Responding to mutual aid in ' + H.dname(r.f) + '.'); H.aidTravel(r.f, () => H.bkGo(r.uid, r.x, r.y, r.c, r.l)); };
  }
  function aidDone() { if (!S.aid) return; const back = S.aid.back; S.aid = null; H.saveS(); H.stat('mutualAid'); H.award(60, 'mutual aid');
    H.dialogue([['velvet', '(over the radio) ' + S.cs + ', thank you for the mutual aid. You\'re released back to ' + H.dname(back) + '.'], ['choice', [{ t: 'Head back to ' + H.dname(back), go: 1, reply: [] }, { t: 'Patrol here a while first', reply: [] }], 'Mutual aid complete']], (r) => { if (r.choices[0] && r.choices[0].go) H.aidTravel(back); }, { kicker: 'MUTUAL AID' }); }

  // ================= unit-specific backup =================
  function wantPicker(onPick) {
    const el = card('wantCard'); el.innerHTML = '<div class="coTop"><b>📻 REQUEST BACKUP</b><button type="button" class="coX">✕</button></div><p>Which unit do you need?</p><div class="coChips">' + WANT.map((w) => '<button type="button" data-w="' + w[0] + '">' + w[1] + ' ' + w[2] + '</button>').join('') + '</div>';
    el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
    el.querySelector('.coX').onclick = () => { el.hidden = true; };
    el.querySelectorAll('[data-w]').forEach((b) => b.onclick = () => { el.hidden = true; onPick(b.dataset.w); });
  }
  const wantOk = (b) => !b.n || b.n === 'any' || (b.n === 'sup' ? isSup() : S.unit === b.n);
  const wantLabel = (n) => { const w = WANT.find((x) => x[0] === n); return w && n !== 'any' ? w[1] + ' ' + w[2] : ''; };

  // ================= push-to-talk radio wheel =================
  function pttInit() {
    if (document.getElementById('ptt')) return; const b = document.createElement('button'); b.id = 'ptt'; b.type = 'button'; b.className = 'ptt'; b.innerHTML = '📻'; b.title = 'Radio shortcuts'; document.body.appendChild(b);
    const w = document.createElement('div'); w.id = 'pttW'; w.className = 'pttW'; w.hidden = true; w.innerHTML = PTT.map(([k, t], i) => '<button type="button" data-q="' + k + '" style="--i:' + i + '">' + esc(t) + '</button>').join(''); document.body.appendChild(w);
    b.onclick = (e) => { e.stopPropagation(); w.hidden = !w.hidden; if (!w.hidden) { w.classList.remove('on'); void w.offsetWidth; w.classList.add('on'); H.buzz('tap'); } };
    w.querySelectorAll('[data-q]').forEach((x) => x.onclick = (e) => { e.stopPropagation(); w.hidden = true; const k = +x.dataset.q; H.quick(k, x.textContent); H.buzz('tap'); });
    addEventListener('pointerdown', (e) => { if (!w.hidden && !w.contains(e.target) && e.target !== b) w.hidden = true; });
  }

  // ================= live partner choices in co-op scenes =================
  let COOP = null, ccSeen = {};
  function coopStart(uid, role) { COOP = { uid, role }; }
  function coopEnd() { COOP = null; }
  function onChoice(o) { if (!COOP || !net() || !o || !o.t) return; try { net().cc(o.t.slice(0, 90), COOP.role); } catch (e) {} }
  function partnerChoice(uid, v) {
    if (!COOP || uid !== COOP.uid || !v.cc || !v.cc.t || ccSeen[uid] === v.cc.t) return; ccSeen[uid] = v.cc.t; const box = document.querySelector('#dlg .dlgPanel'); if (!box) return;
    let ch = box.querySelector('.coLive'); if (!ch) { ch = document.createElement('div'); ch.className = 'coLive'; box.appendChild(ch); }
    ch.innerHTML = '<small>' + (v.cc.r === 'cover' ? '👀 COVER' : '🗣️ CONTACT') + ' · ' + esc(v.c) + '</small>' + esc(v.cc.x); ch.classList.remove('in'); void ch.offsetWidth; ch.classList.add('in'); H.beep(990, .05, 'sine', .02);
  }

  // ================= per presence update and per tick =================
  function sawPlayer(uid, v) { hostSees(uid, v); partnerChoice(uid, v); }
  let t = 0;
  function tick(dt, others, call) { rideTick(others); t -= dt; if (t > 0) return; t = 1; aidTick(call); if (!document.getElementById('ptCard') || document.getElementById('ptCard').hidden) ptShow(); if (aidQ.length) aidShow(); }

  return { online, joinDistrict, squadWatch, commendPrompt, partnerAsk, partnerOf, ptAdd, board, dgAdd, dgLine, aidDone, get aid() { return S.aid; }, wantPicker, wantOk, wantLabel, pttInit, coopStart, coopEnd, onChoice, sawPlayer, tick, get riding() { return !!RIDE.host; }, rideEnd, isSup };
}
