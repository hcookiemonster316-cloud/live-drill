// Better together (Phase 4, item 12).
// 1) Co-op jobs: when two officers work one call, each gets a different job from the chapter. The lead unit keeps
//    dispatch and the second unit updated; the second unit clears its own intersections, or in a pursuit paces the
//    violator at a six-second gap instead of cutting ahead (the Pinellas Park lesson).
// 2) Squad weekly goals: calls, backups for each other, answers by the book and the study group's sim exam, scaled to
//    the squad's size. Each member writes one small record for the week; the squad's total is the sum.
// 3) The study group's sim exam: the same 15 questions for every member this week (seeded by squad code and week),
//    in five saved stages of three. The squad sees everyone's score and the questions the group missed most.
// Network: one listener on this week's records, and your own record written at most once a minute.

// every option set: one right answer, two wrong ones of the same kind and length (the reply gives the rule)
const JOBS = {
  lead: { name: 'Lead unit', brief: 'Your job on this one: lead unit. A second car is running to the call behind you.',
    q: 'A second unit is running behind you. What is your job on the way in?',
    opts: [['Keep dispatch and the second unit updated the whole way in', 1], ['Leave the radio to the second unit and just focus on driving', 0], ['Slow down so the second unit can close up right behind you', 0]],
    ok: 'Good. Everybody rolling to this call knows where you are.', no: 'Stay in contact with dispatch and the other responding units, and let them keep a proper gap behind you.' },
  cross: { name: 'Second unit', brief: 'Your job on this one: second unit. You follow the lead car in and you clear your own way.',
    q: 'The lead car crosses a red light ahead of you. What do you do at it?',
    opts: [['Slow, check every lane yourself and make eye contact first', 1], ['Follow straight through while the lead car is holding traffic', 0], ['Rely on your siren, since drivers stopped for the lead car', 0]],
    ok: 'Right. Drivers who stopped for the first car may pull out in front of the second.', no: 'Approach every intersection yourself: yield or stop when needed and make eye contact. A siren is not a shield.' },
  chase: { name: 'Second unit in the pursuit', brief: 'Your job on this one: second unit in a pursuit. The primary unit leads; you back them up.',
    q: 'You join the pursuit behind the primary unit. How do you run it?',
    opts: [['Pace at a six-second gap and keep dispatch updated on turns', 1], ['Cut down a side street to get ahead and box the car in', 0], ['Pull up beside the primary so you can take over the lead', 0]],
    ok: 'That\'s backup in a pursuit: a safe distance, and everyone on the radio.', no: 'Pace the violator at a six-second distance and stay in contact. An officer cutting in from a side street is how two people died in Pinellas Park.' }
};
const GOALS = [['c', '🚓', 'Calls cleared', 10], ['b', '🛡️', 'Backups for each other', 2], ['r', '📘', 'Answers by the book', 30], ['x', '📝', 'Everyone takes the sim exam', 1]];
const EXAM_N = 15;

export function installTogether(H) {
  const S = H.S, esc = H.esc, L = H.L;
  const wk = () => H.weekKey();
  const roll = () => { if (!S.sqw || S.sqw.w !== wk()) S.sqw = { w: wk(), c: 0, b: 0, r: 0 }; return S.sqw; };
  roll();

  // ================= 1) co-op jobs =================
  // the primary unit leads the run in; the second unit clears its own intersections, or backs up a pursuit at a safe distance
  const jobFor = (title, primary) => (primary ? 'lead' : /pursuit|fleeing|chase/i.test(title || '') ? 'chase' : 'cross');
  function jobLines(k, coach) {
    const J = JOBS[k]; if (!J) return [];
    const opts = J.opts.map(([t, ok]) => ({ t, ok: ok || undefined, job: k, reply: ok ? [[coach, '(over the radio) ' + J.ok]] : [[coach, '(over the radio) ' + J.no]] })).sort(() => Math.random() - .5);
    return [['narr', J.brief], ['choice', opts, J.q]];
  }
  const jobName = (k) => (JOBS[k] || {}).name || '';
  const jobOk = (res, k) => !!(res && res.choices || []).find((o) => o.job === k && o.ok);

  // ================= 2) squad weekly goals =================
  let code = null, WK = {}, stop = null, dirty = false, flushT = 0, wkSeen = null;
  const net = () => H.net(), me = () => H.myUid();
  function watch() {
    const sq = H.squad(), c = sq ? sq.code : null, w = wk();
    if (c === code && w === wkSeen) return; if (stop) stop(); stop = null; code = c; wkSeen = w; WK = {};
    const n = net(); if (!n || !code) return;
    stop = n.gon('mmo/sq/' + code + '/wk/' + w, (v) => { WK = v || {}; check(); H.refresh && H.refresh(); });
    dirty = true; // tell the squad you're in this week, even before your first call
  }
  function bump(k, n) { if (!H.squad()) return; roll()[k] += n || 1; dirty = true; }
  function flush() {
    const n = net(); if (!dirty || !n || !code || !me()) return; dirty = false; const w = roll(), rec = { c: w.c, b: w.b, r: Math.min(w.r, 50000), t: n.TS };
    if (w.x != null) { rec.x = w.x; rec.xm = w.xm || 0; }
    try { n.gset('mmo/sq/' + code + '/wk/' + w.w + '/' + me(), rec); } catch (e) {}
  }
  // the squad's records this week, with yours always up to date
  function recs() { const R = Object.assign({}, WK), u = me(); if (u) { const w = roll(), mine = R[u] || {}; R[u] = Object.assign({}, mine, { c: Math.max(mine.c || 0, w.c), b: Math.max(mine.b || 0, w.b), r: Math.max(mine.r || 0, w.r) }, w.x != null ? { x: w.x, xm: w.xm || 0 } : {}); } return R; }
  function members() { const sq = H.squad(); return sq && sq.m ? Object.keys(sq.m) : []; }
  function progress() {
    const R = recs(), ms = members(), m = Math.max(1, ms.length);
    return GOALS.map(([k, icon, name, per]) => {
      const have = k === 'x' ? ms.filter((u) => R[u] && R[u].x != null).length : ms.reduce((a, u) => a + ((R[u] || {})[k] || 0), 0);
      const need = k === 'x' ? m : per * m, solo = k === 'b' && m < 2;
      return { k, icon, name, have: Math.min(have, need), need, done: !solo && have >= need, solo };
    });
  }
  function check() {
    if (!code) return; const w = wk(); S.sqwDone = S.sqwDone || {};
    for (const g of progress()) { const key = w + ':' + code + ':' + g.k; if (!g.done || S.sqwDone[key]) continue; S.sqwDone[key] = 1; H.saveS(); H.toast('🏅 Squad goal met: ' + g.name + '. +150 RP for everyone in ' + (H.squad().i ? H.squad().i.n : 'your squad') + '.'); H.award(150, 'squad goal: ' + g.name.toLowerCase()); }
    for (const k of Object.keys(S.sqwDone)) if (k.slice(0, w.length) !== w) delete S.sqwDone[k];
  }
  function tick(dt) { flushT -= dt; if (flushT > 0) return; flushT = 60; watch(); flush(); }

  // ================= 3) the study group's sim exam =================
  const seed = () => 'sqx:' + code + ':' + wk();
  const examQs = () => L.groupExamIds(seed(), EXAM_N);
  function qAt(ids, i) { const [f, q] = ids[i]; return L.factQFixed(f, q, L.seedRand(seed() + ':' + i)); }
  function exam() {
    watch(); if (!code) { H.toast('The sim exam is for study groups. Make or join a squad in Comms first.'); return; }
    const ids = examQs(), w = roll(), again = w.x != null;
    H.stagedRun('sqx' + w.w + code, { total: EXAM_N, kicker: 'STUDY GROUP · SIM EXAM', speakers: ['navarro', 'okonkwo', 'castillo'],
      init: (run) => { run.mask = 0; },
      pick: (k, i) => Array.from({ length: k }, (_, j) => qAt(ids, i * 3 + j)),
      onStage: (r, i, run) => { (r.qs || []).forEach((q, j) => { if (!q.ok) run.mask = (run.mask || 0) | (1 << (i * 3 + j)); }); },
      intro: (run, n) => [['navarro', 'Study group sim exam. Everyone in ' + ((H.squad().i || {}).n || 'your squad') + ' gets the same ' + EXAM_N + ' questions this week, in ' + n + ' short stages of three. You can step away between stages.'],
        ['navarro', again ? 'You already have a score in for the group. This run is practice and won\'t change it.' : 'When everyone\'s done, look at the questions the group missed and talk them through together.']],
      done: (r, run) => {
        if (!again) { w.x = r.right; w.xm = run.mask || 0; dirty = true; flush(); H.saveS(); check(); }
        H.award(again ? 10 : 20 + r.right * 4, 'study group sim exam'); H.openModal('<div class="sceneHead"><b>STUDY GROUP · SIM EXAM</b><h2>' + r.right + ' of ' + r.n + ' by the book</h2><p>' + (again ? 'Practice run. Your group score stays at ' + w.x + '.' : 'Your score is in for the group.') + '</p></div>' + examBoard() + '<div class="qAct"><button type="button" id="sxDone">Back to patrol</button></div>');
        const b = document.getElementById('sxDone'); if (b) b.onclick = () => H.closeModal();
      } });
  }
  // everyone's score, and the questions most of the group missed
  function examBoard() {
    if (!code) return ''; const R = recs(), sq = H.squad(), ms = members(), ids = examQs(), miss = new Array(EXAM_N).fill(0); let took = 0;
    const rows = ms.map((u) => { const r = R[u] || {}, c = ((sq.m || {})[u] || {}).c || 'Cadet'; if (r.x != null) { took++; for (let i = 0; i < EXAM_N; i++) if ((r.xm || 0) & (1 << i)) miss[i]++; } return '<div class="sqRow' + (u === me() ? ' me' : '') + '"><span><b>' + esc(c) + '</b></span><em>' + (r.x != null ? r.x + ' / ' + EXAM_N : 'not yet') + '</em></div>'; }).join('');
    const top = miss.map((n, i) => [n, i]).filter(([n]) => n > 0).sort((a, b) => b[0] - a[0]).slice(0, 3);
    const talk = top.length ? '<p class="sqHint">Missed most by the group. Talk these through together:</p><ol class="sxMiss">' + top.map(([n, i]) => { const q = qAt(ids, i); return q ? '<li><b>' + esc(q.stem) + '</b><small>' + n + ' of ' + took + ' missed it. ' + esc(q.fact || '') + '</small></li>' : ''; }).join('') + '</ol>' : (took ? '<p class="sqHint">Nobody in the group has missed a question yet.</p>' : '');
    return '<div class="sxBoard">' + rows + '</div>' + talk;
  }

  // ================= the squad panel's "This week" section =================
  function panel() {
    watch(); if (!code) return ''; const P = progress(), w = roll();
    return '<div class="sqWeek"><h3>This week</h3>' + P.map((g) => '<div class="sqGoal' + (g.done ? ' done' : '') + '"><span>' + g.icon + ' ' + esc(g.name) + '</span><em>' + (g.solo ? 'needs a second member' : g.have + ' / ' + g.need) + '</em><i style="width:' + (g.solo ? 0 : Math.round(g.have / g.need * 100)) + '%"></i></div>').join('') +
      '<div class="chQuick"><button type="button" id="sqExam">📝 ' + (w.x != null ? 'Sim exam: practice again (' + w.x + '/' + EXAM_N + ')' : 'Take this week\'s sim exam') + '</button></div>' +
      '<details class="sxWrap"><summary>Study group results</summary>' + examBoard() + '</details></div>';
  }
  function bind(root) { const b = root.querySelector('#sqExam'); if (b) b.onclick = () => { H.closePanels && H.closePanels(); exam(); }; }
  const css = document.createElement('style');
  css.textContent = '.sqWeek{margin:10px 0 4px}.sqWeek h3{margin:0 0 6px;font-size:.9em;letter-spacing:.06em;text-transform:uppercase;color:#94a3b8}' +
    '.sqGoal{position:relative;display:flex;justify-content:space-between;gap:8px;padding:6px 9px;margin:4px 0;border-radius:8px;background:rgba(148,163,184,.12);overflow:hidden;font-size:.86em}.sqGoal i{position:absolute;left:0;bottom:0;height:3px;background:#f5b800}.sqGoal.done{background:rgba(52,211,153,.16)}.sqGoal.done i{background:#34d399}.sqGoal em{font-style:normal;color:#cbd5e1}' +
    '.sxBoard .sqRow{display:flex;justify-content:space-between}.sxBoard em{font-style:normal}.sxMiss{margin:6px 0;padding-left:20px;font-size:.86em;line-height:1.35}.sxMiss small{display:block;color:#94a3b8;margin:2px 0 6px}.sxWrap summary{cursor:pointer;margin:6px 0;color:#fde68a}';
  document.head.appendChild(css);

  return { jobFor, jobLines, jobName, jobOk, bump, tick, flush, panel, bind, exam, progress };
}
