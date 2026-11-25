// Your reports go to court. A pursuit that ends in an arrest files a case; a couple of shifts later you are called to
// testify. The defense reads your pursuit report against the radio log: a report that matches holds, a report that
// doesn't gets picked apart, and how you answer for it matters. The prosecutor then needs the case law from the chapter
// that fits what you did out there (Pinellas Park, Lewis, Brower, Scott). The verdict comes from all three: the paper,
// your honesty on the stand and the law. It lands in your case file and the courthouse remembers.
// facts in facts_vo.json, by what happened at the end of the pursuit
const LAW = { term: ['F239', 'F240', 'F258', 'F241'], air: ['F253', 'F255', 'F254'], lost: ['F253', 'F255', 'F239'], sticks: ['F266', 'F247', 'F250'] };
const MISS = { cover: ['You walked up to that car without cover. Before you knew who was inside.', 'walked up without cover'], cuffs: ['The cuffs weren\'t double-locked. My client\'s wrist was bruised by the time he got to the jail.', 'didn\'t double-lock the cuffs'], search: ['You didn\'t search my client at the scene. So how do we know what was on him and what wasn\'t?', 'skipped the search'] };
const HOW = { arrest: 'you made the arrest', term: 'you terminated the pursuit', air: 'you handed the pursuit to Air One', lost: 'you lost sight and broadcast the description', sticks: 'it ended on stop sticks' };
const AGO = ['this morning', 'last shift', 'two shifts ago', 'three shifts ago'];

export function installCourt(H) {
  const S = H.S, C = () => (S.court = S.court || { pend: [], hist: [] });
  // a pursuit arrest files a case: what the report got wrong comes with it
  function file(o) { const c = C(); c.pend.push({ how: LAW[o.how] || o.how === 'arrest' ? o.how : 'sticks', les: o.les, miss: o.miss || [], x: o.x, y: o.y, did: o.did, title: o.title || '', ordered: !!o.ordered, wrong: o.wrong | 0, filed: !!o.filed, proc: o.procOk | 0, where: o.where || 'the east side', sh: H.shift(), due: H.shift() + 2, t: Date.now() }); while (c.pend.length > 3) c.pend.shift(); H.saveS(); }
  let wait = -1;
  function onShift() { if (C().pend.some((p) => p.due <= H.shift())) wait = 16; } /* after the shift briefing settles */
  let kq = null; // the defense attorney, waiting on the steps after court
  function tick(dt) { if (kq && H.free()) { const k = kq; kq = null; keane(k); } if (wait < 0) return; wait -= dt; if (wait > 0) return; if (!H.free()) { wait = 4; return; } wait = -1; const p = C().pend.find((x) => x.due <= H.shift()); if (p) testify(p); }
  function testify(p) {
    const def = H.sayAs('defense', { name: 'Marisol Keane', icon: '⚖️', role: 'Defense attorney' }), ada = H.sayAs('ada', { name: 'ADA Ruth Fenwick', icon: '🏛️', role: 'Assistant State Attorney' });
    const ago = AGO[Math.min(3, H.shift() - p.sh)] || 'a while back', st = { honest: null };
    const lines = [['narr', p.how === 'arrest' ? 'Court day. County Courthouse, courtroom 3B. The arrest at ' + p.where + (p.title ? ' (' + p.title.toLowerCase() + ')' : '') + ', ' + ago + '. Before you go in, remember how you made it.' : 'Court day. County Courthouse, courtroom 3B. The arrest from your pursuit near ' + p.where + ', ' + ago + '. Before you go in, remember: ' + HOW[p.how] + '.'], ['hattie', 'Officer, you\'re up. Raise your right hand.']];
    const m0 = (p.miss || [])[0];
    if (p.how === 'arrest' && m0) lines.push([def, 'Officer. ' + MISS[m0][0]], ['choice', [{ t: 'That\'s right. I should have, and I didn\'t.', fx: () => { st.honest = true; }, reply: [[def, '...Thank you, officer. That\'s refreshing.'], ['narr', 'The jury writes it down, but a couple of them look at you differently. Owning it costs you less than defending it would have.']] },
        { t: 'I followed procedure the whole time.', fx: () => { st.honest = false; }, reply: [[def, 'Your own report says otherwise, officer. Your Honor, I have nothing further.'], ['narr', 'The judge looks at you over her glasses for a long second.']] },
        { t: 'Everybody does it that way on the street.', fx: () => { st.honest = false; }, reply: [[def, 'Everybody. So the training is optional? No further questions.']] }], 'The defense has your report']);
    else if (!p.filed) lines.push([def, 'Officer, there is no pursuit report in the file. None. So the jury has only your memory, weeks later. No further questions.']);
    else if (p.wrong) lines.push([def, 'Officer, your report says one thing. The radio log, recorded at the time, says another. ' + (p.wrong > 1 ? 'More than once.' : 'Once.') + ' Which one should this jury believe?'],
      ['choice', [{ t: 'The radio log. My report has a mistake, and I own it.', fx: () => { st.honest = true; }, reply: [[def, '...Thank you for your candor, officer.'], ['narr', 'A couple of jurors nod. Owning it costs you less than defending it would have.']] },
        { t: 'My report is accurate. The log must be wrong.', fx: () => { st.honest = false; }, reply: [[def, 'The log is a recording, officer. Your Honor, I\'d ask the jury to note that.'], ['narr', 'The judge writes something down. That is never good.']] },
        { t: 'I don\'t recall the details anymore.', fx: () => { st.honest = false; }, reply: [[def, 'You don\'t recall. And yet you signed this report. No further questions.']] }], 'The defense has your report and the radio log']);
    else lines.push([def, 'Your report matches the radio log line for line, officer. Time, place, the reason you stopped. ...No further questions on the report.']);
    // the law that fits what you did: two questions at most, from the prosecutor's redirect
    const ids = p.how === 'arrest' ? lawFor(p) : (LAW[p.how] || LAW.sticks).filter((id) => H.factQ(id)).sort(() => Math.random() - .5).slice(0, 2);
    lines.push([ada, 'Redirect, Your Honor. Officer, the defense is going to argue you shouldn\'t have been out there at all. Help the jury with the law.']);
    ids.forEach((id) => { const q = H.factQ(id); if (q) lines.push(['q', q, ada]); });
    H.dialogue(lines, (res) => {
      const paper = p.how === 'arrest' ? Math.max(0, (m0 ? (st.honest ? 1 : 0) : 2) - (p.wrong > 1 ? 1 : 0)) : !p.filed ? 0 : !p.wrong ? 2 : st.honest ? 1 : 0, law = res.right || 0, score = paper + law + (p.proc >= 3 ? 1 : 0);
      const v = score >= 4 ? 'held' : score >= 2 ? 'plea' : 'lost';
      const words = { held: p.how === 'arrest' ? 'The case held. Guilty as charged.' : 'The case held. Guilty on the fleeing charge.', plea: 'He took a plea to a lesser charge. Not a loss, not a win.', lost: p.how === 'arrest' && (p.miss || []).length ? 'Case dismissed. The arrest didn\'t hold up.' : 'Case dismissed. The paperwork didn\'t hold up.' }[v];
      const why = p.how === 'arrest' ? (m0 ? (st.honest ? 'You ' + MISS[m0][1] + ' and owned it on the stand.' : 'You ' + MISS[m0][1] + ' and denied it on the stand.') : 'Every step of the arrest was by the book.') : !p.filed ? 'There was no report.' : p.wrong ? (st.honest ? 'Your report had a mistake and you owned it on the stand.' : 'Your report had a mistake and you stood behind it.') : 'Your report matched the log.';
      C().pend = C().pend.filter((x) => x !== p); C().hist.push({ v, how: p.how, x: p.x, y: p.y, did: p.did, where: p.where, sh: H.shift(), how: p.how, paper, law, n: res.n || 0, honest: st.honest, words: words + ' ' + why, t: Date.now() }); if (C().hist.length > 20) C().hist.shift(); H.saveS(); if (H.watch) H.watch(words + ' ' + why); if (H.partnerNote) H.partnerNote({ v, honest: st.honest }); /* your partner heard how you testified */
      H.trust(4, v === 'held' ? 3 : v === 'plea' ? 1 : -3);
      // the block where it happened hears how it went
      if (v === 'lost' && p.how === 'arrest' && H.walked) H.walked(p); /* he's back on the street */
      if (p.x != null && H.blockAt && (p.did == null || p.did === H.did())) { H.blockAt(p.x, p.y, v === 'held' ? 2 : v === 'lost' ? -2 : 0); if (v !== 'plea') setTimeout(() => H.toast(v === 'held' ? '🏘️ Word gets back to ' + p.where + ': the case held. People there sleep a little easier.' : '🏘️ Word gets back to ' + p.where + ': he walked. People there wonder why they bothered calling.'), 4200); } H.award(v === 'held' ? 120 : v === 'plea' ? 60 : 20, 'court testimony'); H.stat('court'); if (v === 'held') H.stat('courtWon');
      H.debrief({ title: 'Court day', where: 'County Courthouse', extra: [['📝', 'Your report', paper * 5, 10, why], ['⚖️', 'The law', law * 5, 10, law + ' of ' + (res.n || 0) + ' answers the jury needed'], ['🏛️', 'Verdict', v === 'held' ? 10 : v === 'plea' ? 5 : 0, 10, words]], right: res.right, n: res.n, qs: res.qs || [] });
      const K = (S.keane = S.keane || { n: 0 }); if (K.n < 3 || Math.random() < .3) kq = { v, paper, honest: st.honest }; H.saveS();
    }, { kicker: 'COURT · TESTIMONY' });
  }
  // People who disagree for good reasons (Step F): Marisol Keane isn't the villain of your court day. She reads every
  // word because what you write follows her client for life, and when your report had a hole in it, she was right.
  function keane(k) {
    const def = H.sayAs('defense', { name: 'Marisol Keane', icon: '⚖️', role: 'Defense attorney' }), K = (S.keane = S.keane || { n: 0 }), first = !K.n; K.n++; H.saveS();
    const hole = k.paper < 2, lines = [['narr', 'Outside, on the courthouse steps, the defense attorney is waiting for a cab. She nods you over.']];
    if (first) lines.push([def, 'Marisol Keane. You probably think I\'m the enemy.'], [def, 'My client is nineteen. Whatever you write in a report follows him for the rest of his life: jobs, apartments, loans. So I read every word. Somebody has to.']);
    if (hole) lines.push([def, k.honest ? 'Your report had a hole in it today. You owned it on the stand, which almost nobody does. I noticed.' : 'Your report had a hole in it today. I didn\'t put it there. I just read it out loud.'],
      ['choice', [{ t: 'Tell her she was right about the report', set: 'keaneRight', reply: [[def, 'Then fix the habit, not the paragraph. That\'s the only advice I give away for free.']] },
        { t: 'Tell her she twisted what you wrote', reply: [[def, 'I didn\'t twist anything, officer. I read it to twelve people, slowly.']] }]]);
    else lines.push([def, k.v === 'held' ? 'Today it held, because your paper was clean. I\'d rather lose to that than win on a sloppy report. Strange thing for me to say.' : 'Clean report today. The rest wasn\'t up to you.'],
      ['choice', [{ t: 'Ask why she does this work', set: 'keaneWhy', reply: [[def, 'My cousin did eight months on a report nobody checked. One wrong line. That\'s why I read every word.']] },
        { t: 'Tell her you\'ll see her next time', reply: [[def, 'You will. Bring the same report.']] }]]);
    if (k.v === 'held' && !hole) S.flags.keaneHeld = Date.now();
    H.dialogue(lines, () => H.stat('keane'), { kicker: 'THE COURTHOUSE STEPS' });
  }
  // two questions from the lesson the call was about (the prosecutor needs the law that fits what happened)
  function lawFor(p) { const out = []; for (let i = 0; i < 8 && out.length < 2; i++) { const id = H.lessonQ ? H.lessonQ(p.les) : null; if (id && out.indexOf(id) < 0 && H.factQ(id)) out.push(id); } return out.length ? out : LAW.sticks.filter((id) => H.factQ(id)).slice(0, 2); }
  const threads = () => C().pend.map((p) => ({ icon: '⚖️', text: p.how === 'arrest' ? 'Court date: the arrest at ' + p.where : 'Court date: the pursuit arrest near ' + p.where, sub: p.due <= H.shift() ? 'You\'ll be called this shift' : 'Subpoena for a later shift', why: p.how === 'arrest' ? ((p.miss || []).length ? 'The defense will ask why you ' + MISS[p.miss[0]][1] + '.' : 'Every step of the arrest was by the book.') : p.filed ? (p.wrong ? 'Your report doesn\'t match the radio log in ' + p.wrong + ' place' + (p.wrong > 1 ? 's' : '') + '.' : 'Your report matches the radio log.') : 'No report was filed.' }));
  return { file, onShift, tick, testify, threads, LAW, get waiting() { return wait; } };
}
