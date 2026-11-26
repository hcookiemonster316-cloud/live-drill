// The last facts, staged (Action plan, Step F: Learning). Facts that no scene decision covers (mostly the court cases,
// definitions and the numbers) used to come up only as quiz questions. Now each one is taught in a short staged scene:
//   court     a mock hearing at the county courthouse for cadets: the county attorney puts the case on the screen,
//             staged around what happened (the truck past the curve, the dash-cam tape, the side-street car)
//   briefing  the driving course or the motor pool: Instructor Batista with a toy cruiser, a junked steering wheel,
//             three curves on the whiteboard, a spike strip dropped on the table
//   story     your partner in the car, quiet at a red light, telling you something true about the job
// One or two questions per scene (never more than three), and a fact that's taught this way stays out of the plain quiz
// until you've met it here. Loop: patrol -> a scene finds you between calls -> the fact is yours -> it comes back in
// review and on the exam. It reads the decision matcher and the fact record, and feeds the readiness meter and review.

const CASES = [ // [match, staging lines, the attorney's line]
  [/DeShaney|special relationship|Merely pursuing creates no special/i, [['narr', 'Courtroom 3B, empty except for the cadets in the jury box. The county attorney writes one word on the whiteboard: DeShaney.']], 'A little boy was beaten by his own father. The county knew there were problems. The family sued the county. Here\'s what the Supreme Court said.'],
  [/Pinellas Park|foreseeable and preventable|doctrine of negligence|duty of care|negligence standard/i, [['narr', 'She puts up a diagram of an intersection. An unmarked car noses out of a side street. Two small squares sit at the corner.'], ['narr', 'Nobody in the jury box says anything.']], 'Two sisters were waiting to cross. Then the pursuit came through. This is the Florida case. This is the one that applies to you.'],
  [/Brower|Garner|roadblock/i, [['narr', 'A photo fills the screen: an 18-wheeler parked across a two-lane road, just past a blind curve. A police car beside it, headlights aimed up the road.']], 'They wanted him stopped. Look at where they put the truck. Look at those headlights.'],
  [/Lewis|shock(s|ing)? the conscience|deliberate indifference/i, [['narr', 'A motorcycle, a sixteen-year-old on the back, a cruiser behind them at a hundred miles an hour. She doesn\'t say any of that out loud. She just lets the slide sit there.']], 'The court asked one question about this pursuit: did it shock the conscience?'],
  [/Scott v|Scott,|Scott does not|Harris/i, [['narr', 'She plays dash-cam video with the sound off. The car ahead, the bump at the rear quarter panel, the car leaving the road.'], ['narr', 'She stops it there.']], 'This one went all the way to the Supreme Court because of that tape.'],
  [/agency policy|liability/i, [['narr', 'She holds up a thick binder with your agency\'s seal on it and sets it down on the rail of the jury box, hard.']], 'Every one of these cases comes back to this.']
];
const BRIEF = { // per lesson: [where, staging], with Instructor Batista or Sgt. Castillo
  0: ['The motor pool', [['narr', 'Batista pops the hood of a cruiser nobody has checked yet and hands you a flashlight.']]],
  1: ['The academy nurse\'s office', [['narr', 'An eye chart on the back of the door. The nurse covers your left eye with a plastic spoon and points at the fourth line.']]],
  2: ['The driving course', [['narr', 'Rain on the classroom windows. Batista doesn\'t even look up from his coffee. He just points outside.']]],
  3: ['The driving course', [['narr', 'Batista buckles a crash dummy into a seat in the corner of the classroom and pats it on the shoulder.']]],
  4: ['The driving course classroom', [['narr', 'Batista sets a toy cruiser on the whiteboard tray and rocks it with one finger. The nose dips. The body leans. The back end swings.']]],
  5: ['The driving course classroom', [['narr', 'Batista holds up a steering wheel he pulled off a junked car, hands at nine and three, and turns it slowly.']]],
  6: ['The driving course', [['narr', 'Batista puts an egg on the brake pedal of the training car. "Don\'t break it," he says. "Then do it again, faster."']]],
  7: ['The driving course classroom', [['narr', 'Three curves on the whiteboard. Batista puts a dot on the inside of each one, in a different place.']]],
  8: ['The back lot', [['narr', 'A row of cones and one kid-sized cardboard cutout behind the training car. Batista doesn\'t explain the cutout.']]],
  9: ['The driving course at night', [['narr', 'Batista kills the lot lights. For a few seconds nobody can see anything at all.']]],
  10: ['Roll call', [['narr', 'Castillo turns the sound up on a dash-cam clip: siren, radio, someone breathing too fast. Then she turns it off.']]],
  11: ['Roll call', [['narr', 'Castillo drops a coiled spike strip on the table. It clatters. Everyone looks at it.']]]
};
const STORY = [ // a partner's war story opener, by speaker
  ['walsh', 'You want to know something about this job nobody puts on the poster?'], ['walsh', '(at a red light, not looking at you) Twenty-four years. Let me tell you about a night in \'09.'],
  ['park', 'Okay, this is going to sound like a lecture, but it isn\'t. It happened to my training officer.'], ['castillo', 'I\'m going to tell you something I learned the hard way. Listen to the whole thing.']
];

export function installStage(H) {
  const S = H.S, L = H.L;
  const ST = () => (S.stage = S.stage || { seen: {}, n: 0 });
  let staged = null; // fact ids no scene decision covers
  function set() { if (staged && staged.size) return staged; staged = new Set(L.allFacts().filter((f) => !H.decisionsFor(f.text).length).map((f) => f.id)); L.setStaged(staged); return staged; }
  const kindOf = (f) => (CASES.some((c) => c[0].test(f.text)) ? 'court' : /\bis (the|a|an|how|when|telling)\b|means|refers to|describes|types of|is the distance|is when/i.test(f.text) ? 'briefing' : 'story');
  // the next fact to stage: one you haven't learned, from the lessons you can reach, the ones not yet staged first
  function next() { const s = set(), les = new Set(H.lessons()), fs = S.facts || {}, seen = ST().seen;
    const open = L.allFacts().filter((f) => s.has(f.id) && les.has(f.les) && !fs[f.id]); if (!open.length) return null;
    open.sort((a, b) => (seen[a.id] || 0) - (seen[b.id] || 0) || a.les - b.les); return open[0]; }
  // a second fact for the same scene: same kind and lesson (or the same case), not yet learned
  function partner(f, kind) { const s = set(), fs = S.facts || {}; return L.allFacts().find((g) => g.id !== f.id && s.has(g.id) && !fs[g.id] && g.les === f.les && kindOf(g) === kind && (kind !== 'court' || CASES.find((c) => c[0].test(f.text)) === CASES.find((c) => c[0].test(g.text)))) || null; }
  function lines(f) {
    const kind = kindOf(f), g = partner(f, kind), qs = [f, g].filter(Boolean).map((x) => L.factQ(x.id)).filter(Boolean);
    if (kind === 'court') { const c = CASES.find((x) => x[0].test(f.text)), at = H.sayAs('cattorney', { name: 'Dee Holloway', icon: '⚖️', role: 'Assistant county attorney' });
      const keane = H.sayAs('defense', { name: 'Marisol Keane', icon: '⚖️', role: 'Defense attorney' }), kSays = (S.keane && S.keane.n) && Math.random() < .5;
      return { kind, kicker: 'COUNTY COURTHOUSE · CADET COURT DAY', lines: [['narr', 'Court day for the cadets: the county attorney runs a mock hearing so you know what your pursuit looks like from a witness stand.']].concat(c[1], [[at, c[2]]], qs.map((q) => ['q', q, at]),
        kSays ? [[keane, '(from the back row) And when I\'m on the other side, that case is the first thing I read to the jury. Remember that.']] : [[at, 'That\'s the case that should be in your head at two in the morning with your foot on the gas.']]) }; }
    if (kind === 'briefing') { const b = BRIEF[f.les] || BRIEF[4], who = f.les >= 10 ? 'castillo' : H.sayAs('evoc', { name: 'Ray Batista', icon: '🏁', role: 'Driving course instructor' });
      return { kind, kicker: b[0].toUpperCase(), lines: b[1].concat([[who, f.les >= 10 ? 'Two minutes. Then you\'re on the street with it.' : 'Watch. Then tell me what you saw.']], qs.map((q) => ['q', q, who]), [[who, f.les >= 10 ? 'That\'s roll call. Go to work.' : 'Good. Car three. Show me.']]) }; }
    const pt = H.partner(), sp = pt ? pt.id : 'castillo', key = pt ? pt.k : 'castillo', op = STORY.filter((x) => x[0] === key); const o = (op.length ? op : STORY)[(Math.random() * (op.length || STORY.length)) | 0];
    return { kind, kicker: 'IN THE CAR', lines: [['narr', 'A slow stretch between calls. The radio is quiet for once.'], [sp, o[1]]].concat(qs.map((q) => ['q', q, sp]), [[sp, 'Anyway. That\'s the story. Don\'t make me tell it twice.']]) };
  }
  // every few seconds on the street: a staged scene now and then, never in the middle of anything
  function tick(force) { const st = ST(); if (!H.free() || (!force && (H.onStreetFor() < 45000 || Date.now() - (st.last || 0) < 5 * 60000))) return false;
    const f = next(); if (!f) return false; const sc = lines(f); st.last = Date.now(); st.n++; [f].forEach((x) => { st.seen[x.id] = Date.now(); }); H.saveS();
    H.dialogue(sc.lines, () => H.stat('staged'), { kicker: sc.kicker }); return sc.kind; }
  return { tick, next, kindOf, lines, set };
}
