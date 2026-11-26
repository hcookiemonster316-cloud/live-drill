// A practice exam that feels like the real one (Action plan, Step F: Learning). Fifty questions from the whole chapter
// in the real test's format: four options, one right answer, nothing like "all of the above", and no feedback until you
// hand it in. It runs at the state exam's pace (200 questions in 3 hours, about 54 seconds each), so 45 minutes for 50,
// with a clock you can see. Then you get your score against the 85% you need, every miss with the fact behind it, and
// the score the readiness meter predicted for those exact questions, so you learn to trust (or doubt) the meter.
// Per the project rules it's split into saved stages of three; the clock stops while you've stepped away.
// Loop: your career (Your Path) -> the exam -> what you missed comes back over the radio as review calls. It reads the
// fact record and the readiness meter, and feeds spaced review (every miss is due again) and the meter's calibration.

export const PX = { N: 50, SEC: 54, PASS: 85 };

// how likely you are to get a fact right, from what the game has seen you do with it
export function pFact(S, fid) {
  const f = (S.facts || {})[fid], m = (S.fmiss || {})[fid], seen = (S.fseen || {})[fid], rv = (S.frev || {})[fid] || 0;
  if (f && !m) return Math.min(.97, .9 + .02 * rv); // learned and not missed since; each clean spaced review firms it up
  if (f && m) return .58;                            // learned once, missed since
  if (seen) return .45;                              // seen, never gotten right
  return .34;                                        // never seen: a guess plus general sense
}
// the meter's own correction: how far off its last few predictions were (actual minus predicted), capped
export function calib(S) { const h = (S.pex && S.pex.hist) || []; if (!h.length) return 0; const l = h.slice(-3); return Math.max(-.12, Math.min(.12, l.reduce((a, x) => a + (x.got / x.n - x.pred / x.n), 0) / l.length)); }
export function predict(S, fids) { const k = calib(S); return Math.round(fids.reduce((a, id) => a + Math.max(.05, Math.min(.99, pFact(S, id) + k)), 0)); }

export function installPractice(H) {
  const S = H.S, esc = H.esc;
  const P = () => (S.pex = S.pex || { hist: [] });
  const left = (run) => Math.max(0, PX.N * PX.SEC - (run.used || 0));
  const clock = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  // the meter's prediction for a typical 50-question exam (the whole chapter, weighted the way the exam draws)
  function expected() { const all = H.allFactIds(); if (!all.length) return null; const k = calib(S), m = all.reduce((a, id) => a + Math.max(.05, Math.min(.99, pFact(S, id) + k)), 0) / all.length; return Math.round(m * PX.N); }
  function start() {
    H.stagedRun('pexam', { total: PX.N, speakers: ['okonkwo'], hideScore: true, kicker: 'PRACTICE EXAM',
      kick: (i, n) => { const run = (S.runs || {}).pexam; return 'PRACTICE EXAM · ' + Math.min(PX.N, i * 3 + 1) + '–' + Math.min(PX.N, i * 3 + 3) + ' OF ' + PX.N + (run ? ' · ' + clock(left(run)) + ' LEFT' : ''); },
      pick: (k, i, run) => { if (!run.ids) { run.ids = H.drawIds(PX.N); run.pred = predict(S, run.ids); run.used = 0; run.ans = []; } run.t0 = Date.now();
        return H.examQsSingle(run.ids.slice(i * 3, i * 3 + k)).map((q) => Object.assign(q, { exam: 1 })); },
      intro: (run) => [['narr', 'The testing room at the academy. Forty desks, a wall clock, a proctor who has done this a thousand times.'],
        ['okonkwo', 'Practice exam. ' + PX.N + ' questions, four choices each, one right answer. You have ' + Math.round(PX.N * PX.SEC / 60) + ' minutes. That\'s the pace of the real one.'],
        ['okonkwo', 'You won\'t know how you did until you hand it in. If you step away, the clock stops with you. Begin.']],
      onStage: (r, i, run) => { const dt = (Date.now() - (run.t0 || Date.now())) / 1000; run.used = (run.used || 0) + dt; const late = run.used > PX.N * PX.SEC;
        (r.qs || []).forEach((x) => run.ans.push({ fid: x.fid, ok: x.ok && !late, stem: x.stem, fact: x.fact, late })); },
      done: (r, run) => finish(run) });
  }
  function finish(run) {
    const n = run.ans.length || PX.N, got = run.ans.filter((a) => a.ok).length, pct = Math.round(100 * got / n), pass = pct >= PX.PASS, late = run.ans.filter((a) => a.late).length;
    const p = P(); p.hist.push({ t: Date.now(), n, got, pred: run.pred }); p.hist = p.hist.slice(-12); p.best = Math.max(p.best || 0, got);
    H.saveS(); H.stat('practiceExam'); H.award(20 + got * 2, 'practice exam');
    const miss = run.ans.filter((a) => !a.ok), off = got - run.pred;
    const html = '<div class="sceneHead"><b>PRACTICE EXAM · RESULTS</b><h2>' + got + ' of ' + n + ' · ' + pct + '%</h2><p>' + (pass ? 'That\'s a pass. You need ' + PX.PASS + '%.' : 'Not a pass yet. You need ' + PX.PASS + '%, ' + Math.max(0, Math.ceil(n * PX.PASS / 100) - got) + ' more right.') +
      ' Time used: ' + clock(Math.min(run.used, PX.N * PX.SEC)) + ' of ' + clock(PX.N * PX.SEC) + (late ? ' · ' + late + ' answered after time ran out (counted wrong, like the real one)' : '') + '.</p></div>' +
      '<div class="pxPred"><small>THE READINESS METER</small><p>Predicted <b>' + run.pred + '</b> for these questions; you got <b>' + got + '</b> (' + (off === 0 ? 'right on' : (off > 0 ? '+' : '') + off) + '). ' + (Math.abs(off) <= 3 ? 'The meter has your number.' : 'The meter adjusts to how you actually test.') + '</p></div>' +
      (miss.length ? '<p class="finLbl">What you missed (' + miss.length + '), all coming back as review calls</p><ul class="pxMiss">' + miss.slice(0, 20).map((a) => '<li><b>' + esc(a.stem) + '</b><small>' + esc(a.fact || '') + '</small></li>').join('') + '</ul>' + (miss.length > 20 ? '<p class="lkSum">And ' + (miss.length - 20) + ' more.</p>' : '') : '') +
      '<div class="qAct"><button type="button" id="mDone">Back to patrol</button></div>';
    H.openModal(html); const b = document.getElementById('mDone'); if (b) b.onclick = () => H.closeModal();
  }
  // a line for the readiness meter: the predicted score, the last result, and the button
  function card() { const e = expected(); if (e == null) return ''; const h = P().hist, last = h[h.length - 1];
    return '<div class="pxCard"><p><b>' + e + ' of ' + PX.N + '</b> predicted on a practice exam (' + Math.round(100 * e / PX.N) + '%)' + (last ? ' · last time ' + last.got + ', predicted ' + last.pred : '') + '</p><button type="button" class="ghost" id="pathPx">📝 Practice exam · ' + PX.N + ' questions, ' + Math.round(PX.N * PX.SEC / 60) + ' min</button></div>'; }
  return { start, card, expected, finish };
}
