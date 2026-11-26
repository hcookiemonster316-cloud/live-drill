// Lassiter in person (Action plan, Step F: "Lassiter as vivid as the partners"). Once the pawn log puts his name on a
// stolen TV, Victor Lassiter starts turning up on your beat in his own staged scenes: the same gray sedan, the same
// white shirt and dark tie, in whatever district you're working. He talks to you directly. What he wants (a car, a
// beat, people who wave), his flaw (everybody takes something) and his wound (week nine, 2003) come out a piece at a
// time, and how you handle each meeting is a real policy call: a consensual talk, a stop you can't justify, a gift you
// shouldn't take.
// Loop: drive the city -> he finds you -> you choose -> the city remembers. It feeds the case file (each meeting is a
// searchable note), Castillo's trust, the NEXT SHIFT teaser and his lines at the courthouse arrest. After the arrest
// he writes you once from the County Jail.

const LOOK = { name: 'Victor Lassiter', icon: '🕶️', role: 'Person of interest', look: { shirt: '#e5e7eb', pants: '#1f2937', tie: '#111827', plain: true, hat: 'none' }, skin: '#f1c9a5' };

// each meeting: when it's due, where he is, what he says, and three ways to handle it (one is the right call)
export const MEET = [
  { k: 'coffee', due: (st, n) => st(2) >= 3 && st(4) < 3,
    radio: 'Gray sedan idling at {at}. The plate comes back to the pawn file. Castillo says go talk to him, keep it civil, no stop.',
    say: [['narr', 'The gray sedan is parked legally, engine running. The man leaning on it is holding two coffees.'],
      ['lassiter', 'You must be Dana\'s new cadet. I bought you a coffee. Cream, no sugar. I asked around.'],
      ['lassiter', 'Victor. Vic, to people I like. I\'m told my name came up at River Pawn. Small city.']],
    ch: [{ t: 'Ask if he has a minute to talk', set: 'lasAsk', good: 1, reply: [['lassiter', 'A minute? Look at that. You asked. Nobody asks anymore.'], ['lassiter', 'I sold this car last year, by the way. To a man whose name I can\'t remember. Write that down.']],
        note: 'Talked with Victor Lassiter at {at}. He stayed to talk. Says he sold the gray sedan last year, can\'t name the buyer.', cas: ['Good. A consensual talk, and he chose to stay. Everything he said is in your notes now.', 4] },
      { t: 'Order him to step away from his car', set: 'lasOrder', reply: [['lassiter', 'Order me? On what, exactly? I\'m parked legally, drinking coffee. Ask Dana what reasonable suspicion means.'], ['narr', 'He gets in, waves, and drives off. You have nothing to hold him on, and he knows it.']],
        note: 'Victor Lassiter at {at}, gray sedan. Left when ordered out of the car. No grounds to hold him.', cas: ['He\'s right, and I hate that he\'s right. No suspicion, no stop. Next time ask. Don\'t order.', -3] },
      { t: 'Take the coffee and thank him', set: 'lasCoffee', reply: [['lassiter', 'See? Everybody takes something. It\'s only coffee. Today.']],
        note: 'Victor Lassiter at {at} gave me a coffee. I took it.', cas: ['Pour it out. We don\'t take gifts. Not even coffee. Not from him most of all.', -4] }],
    bye: [['lassiter', 'See you around, cadet. This city is smaller than it looks.'], ['narr', 'He pulls away at exactly the speed limit, signaling every turn.']] },
  { k: 'photo', due: (st) => st(3) >= 2 && st(4) < 3,
    radio: 'Caller says a man in a white shirt and dark tie has been standing at {at} for an hour. Description matches Lassiter.',
    say: [['narr', 'No car this time. He\'s just standing there, hands in his pockets, like he\'s been waiting for a bus that doesn\'t run.'],
      ['lassiter', 'You found my photo. Lock-It sent me a letter. "Unit opened under warrant." Very polite.'],
      ['lassiter', 'Did she tell you why I washed out? She tells it like a lesson. It was a Friday. I had a box at the door by noon.'],
      ['lassiter', 'I was good at this, you know. Faster than her on the driving course. I\'d be a sergeant by now.']],
    ch: [{ t: 'Tell him you can\'t talk about the case', set: 'lasQuiet', good: 1, reply: [['lassiter', 'Good answer. She trained you well. That\'s the thing about Dana. Everything she touches turns out right.']],
        note: 'Victor Lassiter at {at} brought up the Lock-It warrant and the academy photo. I didn\'t discuss the case.', cas: ['You kept your mouth shut about an open case. That\'s harder than it sounds with him.', 3] },
      { t: 'Ask what he wanted to be back then', set: 'lasWant', good: 1, reply: [['lassiter', 'A cop. Just a cop. A car, a beat, people who wave at you.'], ['lassiter', '(quieter) Don\'t put that in your notes.']],
        note: 'Victor Lassiter at {at}. Said all he ever wanted was "a car, a beat, people who wave."', cas: ['He told you that? He never told me that. Not in twenty years.', 2] },
      { t: 'Ask him where he was last Tuesday', set: 'lasPush', reply: [['lassiter', 'Being a private citizen. You\'d need a reason to ask me that properly, cadet, and you don\'t have one. Not yet.']],
        note: 'Asked Victor Lassiter at {at} about his whereabouts. He declined. He knows how far the case has gotten.', cas: ['You showed him how much we don\'t have. Let the paper do the asking.', -2] }],
    bye: [['narr', 'He touches two fingers to his brow, the old academy salute, and walks off without looking back.']] },
  { k: 'light', due: (st, n) => st(3) >= n(3) && st(4) < 3,
    radio: 'Heads up. That gray sedan has been circling {at}. It just pulled in behind you.',
    say: [['narr', 'The gray sedan pulls up beside your car at a red light. The window comes down.'],
      ['lassiter', 'Justice Row next, isn\'t it? Hattie at the clerk\'s office has the cleanest handwriting in the county. Say hello.'],
      ['lassiter', 'Free advice, cadet. When this goes to court, they read every word you wrote. Every word. Make sure you like them.']],
    ch: [{ t: 'Tell him you\'ll see him at the courthouse', set: 'lasSee', reply: [['lassiter', 'I\'ll wear the good tie.']],
        note: 'Victor Lassiter pulled beside me at {at}. Knows the case is going to Justice Row.', cas: ['He likes being told he\'s important. Don\'t give him that.', -1] },
      { t: 'Say nothing and wait for the light', set: 'lasSilent', good: 1, reply: [['narr', 'You give him nothing. He waits, smiles, and the light turns green.'], ['lassiter', 'Smart.']],
        note: 'Victor Lassiter pulled beside me at {at} and warned me about my reports. I didn\'t engage.', cas: ['Nothing said, nothing to twist in court. That\'s the job.', 3] },
      { t: 'Ask him why he\'s telling you this now', set: 'lasWhy', good: 1, reply: [['lassiter', 'Because somebody should have told me. Nobody did.']],
        note: 'Victor Lassiter pulled beside me at {at}. Said somebody should have warned him once, and nobody did.', cas: ['That\'s the most honest thing he\'s said in twenty years. Write it down anyway.', 1] }],
    bye: [['narr', 'He signals, merges, and is gone before the next light.']] }
];
// after the arrest: one letter from the County Jail, waiting at the start of a shift
const LETTER = (f) => [['narr', 'Roll call. There\'s an envelope in your box. County Jail return address, pencil handwriting.'],
  ['lassiter', 'Cadet. They give you one sheet and a short pencil in here, so I\'ll be quick.'],
  f.lasAsk ? ['lassiter', 'You asked me if I had a minute, that first day at the curb. I keep thinking about that.'] : f.lasCoffee ? ['lassiter', 'You took the coffee. I knew you would. Don\'t take the next thing. There\'s always a next thing.'] : ['lassiter', 'You never once gave me what I wanted from you. I don\'t know if that makes you good or just careful.'],
  f.lasWant ? ['lassiter', 'Don\'t tell her what I said about the car and the beat. Or do. I don\'t know anymore.'] : ['lassiter', 'Tell Dana the photo was mine. She can keep it. I don\'t have a wall in here.'],
  ['beat', { ms: 1800 }], ['lassiter', 'Your report was clean. I read it four times. I hated every word, and I couldn\'t find a single mistake. - V.'],
  ['choice', [{ t: 'Log the letter and tell your sergeant', las: 'logged', good: 1 }, { t: 'Keep the letter in your locker', las: 'kept' }, { t: 'Write him back to close the loop', las: 'wrote' }]]];
const LETTER_END = { logged: [['castillo', 'Contact from a defendant goes in the file, every time. Thank you for bringing it to me.'], ['beat', { ms: 1600 }], ['castillo', '(reading it) ...Week nine. He still writes his V the same way.', { gesture: 'away' }]],
  kept: [['narr', 'You put it in your locker. Two days later Castillo asks if anything came for you from the jail.'], ['castillo', 'Anything a defendant sends the arresting officer gets logged. All of it. Bring it in.']],
  wrote: [['castillo', 'You don\'t write back to a defendant in your own case. Ever. Anything you say becomes something the defense reads.'], ['castillo', 'Log it. I\'ll tell the prosecutor before somebody else does.']] };

export function installLassiter(H) {
  const S = H.S, st = (d) => (S.story && S.story[d]) || 0, len = (d) => H.steps(d);
  const L = () => (S.las = S.las || { seen: {} });
  let here = null, shownAt = 0;
  const due = () => MEET.find((m) => !L().seen[m.k] && m.due(st, len)) || null;
  const letterDue = () => st(4) >= len(4) && !L().letter;
  const fill = (s, at) => String(s).replace(/\{at\}/g, at);
  // every few seconds on the street: if a meeting is due and you've been out a while, he shows up nearby
  function tick(force) { // force: tests skip the waiting
    if (here && !H.alive(here)) here = null;
    if (here || !H.free() || (!force && (H.onStreetFor() < 25000 || Date.now() - shownAt < 60000))) return;
    if (letterDue()) return letter();
    const m = due(); if (!m || (!force && L().shift === H.shiftNo())) return; // one meeting a shift
    const r = H.place(Object.assign({ id: 'lassiter', las: m.k }, LOOK)); if (!r) return;
    here = r; shownAt = Date.now(); L().shift = H.shiftNo(); H.saveS();
    H.radio('Dispatch', fill(m.radio, H.where(r))); H.ping(r);
  }
  // you walk up to him: his scene, your call, and everything it changes
  function talk(r) {
    const m = MEET.find((x) => x.k === r.n.las); if (!m) return false; const at = H.where(r);
    const ch = m.ch.map((o) => ({ t: o.t, set: o.set, reply: o.reply, _o: o }));
    H.dialogue(m.say.concat([['choice', ch.sort(() => Math.random() - .5)]], m.bye), () => {
      const o = (H.lastChoice() || {})._o || m.ch[0]; L().seen[m.k] = o.set; H.saveS();
      H.note(fill(o.note, at)); H.drop(r); here = null;
      const pm = H.pmem('castillo'); pm.t = Math.max(0, Math.min(100, pm.t + o.cas[1])); pm.log = (pm.log || []).concat([[Date.now(), 'lassiter:' + o.set]]).slice(-30); H.saveS();
      H.later(() => H.radio('Sgt. Castillo', o.cas[0]), 2200);
      if (o.good) H.award(40, 'handled Lassiter'); H.stat('lassiter');
    }, { focus: [r.x, r.y], kicker: 'VICTOR LASSITER' });
    return true;
  }
  function letter() {
    L().letter = 'open'; H.saveS(); shownAt = Date.now();
    const lines = LETTER(S.flags || {}), ch = lines[lines.length - 1][1];
    H.dialogue(lines, () => { const o = H.lastChoice() || ch[0], k = o.las || 'logged'; L().letter = k; H.saveS(); H.note('Letter from Victor Lassiter, County Jail. ' + ({ logged: 'Logged and given to Sgt. Castillo.', kept: 'Kept it, then logged it when asked.', wrote: 'Wrote back. Castillo told the prosecutor.' })[k]);
      const pm = H.pmem('castillo'); pm.t = Math.max(0, Math.min(100, pm.t + ({ logged: 3, kept: -2, wrote: -4 })[k])); H.saveS();
      H.later(() => H.dialogue(LETTER_END[k], () => {}), 400); if (k === 'logged') H.award(40, 'logged a letter from a defendant'); }, { kicker: 'A LETTER' });
  }
  // the end-of-watch teaser: he'll find you next shift
  const hook = () => { const m = due(); return m ? { k: 'las', w: 8, icon: '🕶️', t: m.k === 'coffee' ? 'A gray sedan has been seen on your beat. The plate is the one from the pawn file.' : m.k === 'photo' ? 'Somebody in a white shirt and dark tie has been asking which car is yours.' : 'The gray sedan again. It keeps turning up wherever you\'re working.' } : letterDue() ? { k: 'las', w: 8, icon: '✉️', t: 'Something came for you from the County Jail. It\'s in your box.' } : null; };
  return { tick, talk, hook, due, letterDue, MEET };
}
