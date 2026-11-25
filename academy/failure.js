// Failure opens a scene (Action plan, Step F: Learning). A wrong decision on a call doesn't only get corrected: now and
// then it leads somewhere, the way a mistake on the job really does.
//   cover      right after the call, the partner riding with you offers to leave it out of the report. Writing it the
//              way it happened is the right call; taking the cover turns into a report that doesn't match next shift.
//   complaint  next shift, the caller has filed a complaint. Lt. Okonkwo wants your statement, and first wants to see
//              that you know what the right move was (a second chance at the same decision).
//   again      next shift, Castillo pulls your camera footage at roll call, stops it a second before you decided, and
//              asks again. Get it right and the fact counts.
// At most one at a time, and not every shift. Every scene can be left, and has at most one question.
// It feeds the case file (a note), the readiness meter (the second chance counts toward the fact), partner trust and
// the NEXT SHIFT teaser.
const rnd = (a) => a[(Math.random() * a.length) | 0];
// the same decision, options in a new order (a second chance tests the idea, not where the button was)
const fresh = (q) => { const right = q.opts[q.c], opts = q.opts.slice().sort(() => Math.random() - .5); return Object.assign({}, q, { opts, c: opts.indexOf(right) }); };

export function installFailure(H) {
  const S = H.S, F = () => (S.fail = S.fail || { pend: null, last: -9, n: 0 });
  const clamp = (x) => Math.max(0, Math.min(100, x));
  // after a call: one wrong decision may open a scene
  function afterCall(c, res, force) {
    const miss = (res && res.qs || []).find((x) => x.q && !x.ok); if (!miss || !c) return null;
    const f = F(), sh = H.shiftNo(); if (f.pend || (!force && (sh - f.last < 2 || Math.random() > .5))) return null;
    const pt0 = H.partner(), pt = pt0 && pt0.k !== 'castillo' ? pt0 : null /* Castillo would never offer */, k = force || (pt && Math.random() < .4 ? 'cover' : Math.random() < .5 ? 'complaint' : 'again');
    if (k === 'cover' && !pt) return null;
    f.last = sh; f.pend = { k, sh, title: c.title, where: c.where || 'that address', q: miss.q, pt: pt ? pt.k : null }; H.saveS(); return f.pend;
  }
  // every few seconds on the street: play what's waiting (a cover offer right away; the rest next shift)
  function tick(force) {
    const f = F(), p = f.pend; if (!p || !H.free()) return;
    if (p.k !== 'cover' && !force && (p.sh >= H.shiftNo() || H.onStreetFor() < 15000)) return;
    f.pend = null; f.n++; H.saveS(); (({ cover, complaint, again, mismatch })[p.k] || again)(p);
  }
  const done = (txt, award, why) => { H.note(txt); if (award) H.award(award, why); H.stat('failScene'); };
  function cover(p) {
    const pt = H.partnerById(p.pt); if (!pt) return;
    const id = pt.id, trust = (d) => { const m = H.pmem(pt.k); m.t = clamp(m.t + d); H.saveS(); };
    const honest = { t: 'Write it the way it happened', reply: [[id, '...Yeah. Okay. That\'s the right answer. I\'d have thought a little less of you if you\'d said yes.']], fx: () => { trust(3); done('Wrote the ' + p.title + ' report the way it happened, mistake included. ' + pt.name + ' offered to leave it out.', 30, 'an honest report'); } };
    const take = { t: 'Leave it out the way they offered', reply: [[id, 'Done. Nobody has to know.'], ['narr', 'It sits wrong the whole way back to the car.']], fx: () => { trust(-1); const f = F(); f.pend = Object.assign({}, p, { k: 'mismatch', sh: H.shiftNo() }); H.saveS(); H.note('Left the mistake out of the ' + p.title + ' report.'); } };
    H.dialogue([['narr', 'Back in the car. ' + pt.name + ' doesn\'t start the engine right away.'],
      [id, rnd(['That last one, at ' + p.where + '. You don\'t have to put the part where it went sideways in the report. I didn\'t see anything.', 'About ' + p.where + '. Write it however you want. My report will match yours. That\'s what partners do.'])],
      ['choice', [honest, take, { t: 'Ask what they would do in your place', reply: [[id, 'Honestly? I\'d write it down. I covered for somebody once. It didn\'t help either of us.'], ['choice', [honest, take]]] }]]], () => {}, { kicker: 'AFTER THE CALL' });
  }
  function complaint(p) {
    const st = (d) => { S.trust = S.trust || {}; const did = H.did(); S.trust[did] = clamp((S.trust[did] == null ? 50 : S.trust[did]) + d); H.saveS(); };
    H.dialogue([['narr', 'Lt. Okonkwo catches you at the car before you pull out. He has a printout and he has already read it twice.'],
      ['okonkwo', 'A complaint came in about "' + p.title + '" at ' + p.where + '. I\'ve watched your camera. Before you give me a statement, show me you know what the right move was.'],
      ['q', fresh(p.q), 'okonkwo'],
      ['okonkwo', 'Now. Your statement.'],
      ['choice', [{ t: 'Tell it straight, the mistake included', reply: [['okonkwo', 'Sustained, and it goes in your file as a counseling note, not discipline. Honest statements are the only kind that survive a review.']], fx: () => { st(2); done('Complaint about ' + p.title + ' at ' + p.where + ': gave a full, honest statement. Sustained, counseling note.', 30, 'an honest statement'); } },
        { t: 'Leave out the part that went wrong', reply: [['okonkwo', 'The camera doesn\'t leave anything out. Now it isn\'t a mistake on a call, it\'s a truthfulness problem, and those end careers.'], ['okonkwo', 'Rewrite it. All of it. I\'ll wait.']], fx: () => { st(-2); done('Complaint about ' + p.title + ' at ' + p.where + ': left part of it out, and the camera showed it. Told to rewrite the statement.'); } },
        { t: 'Say the caller is overstating it', reply: [['okonkwo', 'Maybe they are. The video isn\'t. Try again, and this time just tell me what happened.']], fx: () => { st(-1); done('Complaint about ' + p.title + ' at ' + p.where + ': called the caller\'s account overstated. The video didn\'t back that up.'); } }]]], () => {}, { kicker: 'A CITIZEN COMPLAINT' });
  }
  function again(p) {
    H.dialogue([['narr', 'Roll call runs long. Castillo has your camera footage from ' + p.where + ' up on the screen and stops it one second before you decided.'],
      ['castillo', 'Second chance. Same moment, same people. What do you do?'],
      ['q', fresh(p.q), 'castillo'],
      ['castillo', 'That\'s why we watch the tape. Not to catch you. So the next one goes right.'],
      ['fx', () => { const m = H.pmem('castillo'); m.t = clamp(m.t + 1); done('Reviewed the camera from ' + p.title + ' at ' + p.where + ' with Sgt. Castillo.'); }]], () => {}, { kicker: 'RUN IT BACK' });
  }
  // the cover you took comes due: the radio log and the report don't match
  function mismatch(p) {
    H.dialogue([['castillo', 'The radio log from ' + p.where + ' and your report don\'t match. Your partner\'s report doesn\'t either. I\'m going to ask once.'],
      ['choice', [{ t: 'Tell her what happened and fix the report', reply: [['castillo', 'Thank you. Correct it today. Next time, the first version is the true one.']], fx: () => { const m = H.pmem('castillo'); m.t = clamp(m.t - 1); done('Corrected the ' + p.title + ' report after Sgt. Castillo found it didn\'t match the radio log.', 10, 'came clean'); } },
        { t: 'Say the report is accurate as written', reply: [['castillo', 'Then I\'ll let the log speak for itself. This goes up the chain, and it goes up with your name on it.']], fx: () => { const m = H.pmem('castillo'); m.t = clamp(m.t - 6); H.saveS(); done('Stood by a ' + p.title + ' report that didn\'t match the radio log. Sent up the chain.'); } }]]], () => {}, { kicker: 'THE REPORT' });
  }
  const hook = () => { const p = F().pend; if (!p || p.k === 'cover') return null;
    return p.k === 'complaint' ? { k: 'fail', w: 8.5, icon: '📝', t: 'A complaint came in about "' + p.title + '". Lt. Okonkwo wants your statement.' }
      : p.k === 'mismatch' ? { k: 'fail', w: 8.5, icon: '📝', t: 'Castillo is reading your ' + p.title + ' report against the radio log.' }
      : { k: 'fail', w: 4, icon: '📼', t: 'Castillo pulled your camera from ' + p.where + '. She wants to run it back with you.' }; };
  return { afterCall, tick, hook };
}
