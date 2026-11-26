// Teach it back (Action plan, Step F: Learning). Late in the game a newer cadet, Mia Rivera, catches you at the
// driving course and asks how you do something. You explain it in your own choice of words: three pieces, in the order
// you'd say them, picked from things a cadet might say (some right, some the mistakes everybody makes). The game checks
// the idea, not the wording: your explanation needs the key ideas and none of the mistakes. Then she tries it on the
// course, and what happens shows whether your explanation was any good.
// Loop: your career grows -> you teach -> what you taught is tested on someone else. It reads the fact record (the
// technique's facts) and feeds it (a clean explanation counts as getting those facts right), and the mentor tally.

export const TECH = [
  { id: 'abs', ask: 'The car ahead stops short and I panic. How do you stop fast in a car with ABS?', fact: /ABS slows and stops|steady downward pressure on the pedal/i,
    key: [['Push the brake hard and keep it down', 'k'], ['Let the ABS do the pumping for you', 'k'], ['Keep steering where you want to go', 'k']],
    bad: [['Pump the pedal so the wheels don\'t lock', 'Pumping fights the ABS. It\'s already pumping for you.'], ['Ease off when the pedal buzzes', 'That buzz is the ABS working. Letting up is how you hit the car ahead.'], ['Pull the parking brake to help', 'The parking brake only grabs the rear wheels. The back end comes around.']],
    good: 'She stomps the pedal and holds it. The pedal chatters, the car stops straight, a car length short of the cones.', badOut: 'She does exactly what you said. The car stops late, and a cone goes under the bumper.' },
  { id: 'shuffle', ask: 'Batista keeps yelling about my hands on the wheel. What am I supposed to do in a turn?', fact: /shuffling the wheel|slide the right hand up to 12/i,
    key: [['Feed the wheel hand to hand, push then pull', 'k'], ['Keep both hands on the wheel the whole time', 'k'], ['Don\'t cross your arms over the wheel', 'k']],
    bad: [['Spin it with one palm, it\'s faster', 'One palm means one hand on the wheel when the car does something you didn\'t expect.'], ['Let it slide through your hands coming out', 'Letting it spin back on its own is how the car overshoots the lane.'], ['Hold at ten and two and cross over', 'Crossing your arms locks you up, and the airbag puts your arms in your face.']],
    good: 'She shuffles it around, hands never leaving the wheel. Batista doesn\'t yell. That\'s the highest praise he gives.', badOut: 'She tries it your way and loses the wheel halfway through. Batista yells. At you, this time.' },
  { id: 'apex', ask: 'The curve on the back half of the course keeps pushing me wide. How do you take it?', fact: /late apexing|drive deep into the curve before turning/i,
    key: [['Slow down before the curve, not in it', 'k'], ['Turn in late, then hit the inside past the middle', 'k'], ['Look through the curve to where you\'re going', 'k']],
    bad: [['Turn in early and cut the corner tight', 'Turn in early and the curve runs out before your car does. That\'s the push wide.'], ['Brake hard halfway through the turn', 'Braking hard mid-curve takes the grip off the front tires. That\'s understeer.'], ['Keep your eyes on the cone right in front', 'You go where you look. Look at the cone and that\'s where the car goes.']],
    good: 'She sets her speed early, turns in late and clips the inside past the middle. She comes out of the curve on the line.', badOut: 'She does it your way. The car pushes wide again, two wheels over the paint.' },
  { id: 'back', ask: 'Backing is the thing I hate. What\'s the trick?', fact: /drive slowly in reverse|Many crashes happen while backing/i,
    key: [['Walk around the car before you back up', 'k'], ['Turn your body and look out the back', 'k'], ['Go slow, slower than feels right', 'k']],
    bad: [['Trust the backup camera and go', 'The camera can\'t see what\'s beside the bumper. The cutout behind the car is the lesson.'], ['Back up quick so you\'re not in the way', 'Fast in reverse is how the cardboard kid gets flattened.'], ['Use the side mirrors and nothing else', 'Mirrors alone leave a blind spot the size of a person.']],
    good: 'She walks the car, turns all the way around in the seat and creeps back. The cardboard kid survives.', badOut: 'She backs the way you said. There\'s a soft crunch. The cardboard kid did not survive.' },
  { id: 'night', ask: 'Night drill is tomorrow. Anything I should know?', fact: /darkness lengthens the time|peripheral vision decreases/i,
    key: [['Slow down so you can stop inside your headlights', 'k'], ['Look a little away from oncoming lights', 'k'], ['Give yourself more distance than in daylight', 'k']],
    bad: [['Leave your high beams on so you see more', 'High beams in someone\'s eyes and now two people can\'t see.'], ['Drive like daytime, your reactions are the same', 'Your reactions are the same. What you can see in time is not.'], ['Stare right at the oncoming headlights', 'Look into the lights and you\'re blind for seconds after they pass.']],
    good: 'On the night drill she keeps it inside her lights and spots the dark-clothed dummy at the edge of the beam.', badOut: 'On the night drill she\'s going too fast for her lights. The dummy comes out of the dark too late.' },
  { id: 'pursuit', ask: 'Everybody wants to be in a pursuit. When do you call it off?', fact: /terminat|decision to start or continue|duty of protection/i,
    key: [['When the danger is bigger than catching him', 'k'], ['Follow your agency\'s policy, not the adrenaline', 'k'], ['A traffic offense isn\'t worth someone\'s life', 'k']],
    bad: [['Never, once you start you finish it', 'Pinellas Park says otherwise. Your choice to keep going is the one the court looks at.'], ['When your supervisor yells at you, not before', 'It\'s your call too, and it starts before anyone yells.'], ['Only if you lose sight of him', 'By then the danger was already bigger than the catch.']],
    good: 'In the sim she calls off the chase at the school zone. The helicopter picks him up two miles later.', badOut: 'In the sim she stays on him through the school zone. The sim ends early. The instructor doesn\'t say anything.' }
];

export function installTeach(H) {
  const S = H.S, T = () => (S.teach = S.teach || { done: {}, n: 0 });
  const ready = () => (S.cleared || []).length >= 3 || (S.calls || 0) >= 120; // late in the game
  const next = () => TECH.find((t) => !T().done[t.id]) || null;
  function play(force) {
    const t = force ? TECH.find((x) => x.id === force) : next(); if (!t) return false; const rv = H.sayAs('rookie', { name: 'Mia Rivera', icon: '🔰', role: 'Newer cadet' });
    // the pieces, shuffled: every right idea and every mistake, worded the way a cadet would say it
    const chips = t.key.map((k) => ({ t: k[0], ok: 1 })).concat(t.bad.map((b) => ({ t: b[0], why: b[1] }))).sort(() => Math.random() - .5);
    H.dialogue([['narr', 'The driving course, between runs. A cadet from the newer class is waiting by your car with her helmet still on.'], [rv, 'Hey, you\'re ' + (S.cs || 'the one everyone says to ask') + ', right? Can I ask you something?'], [rv, t.ask],
      ['fx', () => {}]], () => build(t, chips, rv), { kicker: 'TEACH IT BACK' });
    return true;
  }
  // you build the explanation: pick three pieces, in the order you'd say them
  function build(t, chips, rv) {
    const pick = []; const html = () => '<div class="sceneHead"><b>TEACH IT BACK</b><h2>Explain it your way</h2><p>Pick three things to tell her, in the order you\'d say them.</p></div>' +
      '<p class="tbSay">' + (pick.length ? pick.map((i) => H.esc(chips[i].t)).join('. ') + '.' : '<i>Your explanation goes here.</i>') + '</p><div class="tbChips">' + chips.map((c, i) => '<button type="button" class="tbChip' + (pick.includes(i) ? ' on' : '') + '" data-tb="' + i + '">' + (pick.includes(i) ? (pick.indexOf(i) + 1) + ' · ' : '') + H.esc(c.t) + '</button>').join('') + '</div>' +
      '<div class="qAct"><button type="button" class="ghost" id="tbLater">Not now</button><button type="button" class="ghost" id="tbClear">Start over</button><button type="button" id="tbSay"' + (pick.length < 3 ? ' disabled' : '') + '>Tell her</button></div>';
    const draw = () => { H.openModal(html()); document.querySelectorAll('[data-tb]').forEach((b) => b.onclick = () => { const i = +b.dataset.tb, at = pick.indexOf(i); if (at >= 0) pick.splice(at, 1); else if (pick.length < 3) pick.push(i); draw(); });
      document.getElementById('tbClear').onclick = () => { pick.length = 0; draw(); }; document.getElementById('tbLater').onclick = () => { H.closeModal(); H.toast('🔰 Rivera will catch you another time.'); }; const go = document.getElementById('tbSay'); if (go) go.onclick = () => { H.closeModal(); judge(t, pick.map((i) => chips[i]), rv); }; };
    draw();
  }
  // the check is the idea: at least two of the key ideas and none of the mistakes
  function judge(t, said, rv) {
    const keys = said.filter((c) => c.ok).length, bad = said.find((c) => c.why), ok = keys >= 2 && !bad, st = T();
    const lines = [['narr', 'You tell her: "' + said.map((c) => c.t).join('. ') + '."'], ['narr', ok ? t.good : t.badOut]];
    if (ok) lines.push([rv, 'Okay. That actually makes sense. Thank you.'], ['narr', 'Batista, across the lot, gives you a small nod. Teaching it is how you know you know it.']);
    else lines.push(['castillo', '(walking over) ' + (bad ? bad.why : 'You left out the part that matters most.') + ' Try it again with her.']);
    H.dialogue(lines, () => { if (ok) { st.done[t.id] = Date.now(); st.n++; H.stat('taught'); H.award(60, 'taught a newer cadet'); H.creditFacts(t.fact); } H.saveS(); if (!ok) setTimeout(() => build(t, [...t.key.map((k) => ({ t: k[0], ok: 1 })), ...t.bad.map((b) => ({ t: b[0], why: b[1] }))].sort(() => Math.random() - .5), rv), 600); }, { kicker: 'TEACH IT BACK' });
  }
  // now and then on the street, once you're late in the game: Rivera finds you
  function tick(force) { const st = T(); if (!H.free() || !next() || (!force && (!ready() || H.onStreetFor() < 60000 || Date.now() - (st.last || 0) < 12 * 60000))) return false; st.last = Date.now(); H.saveS(); return play(); }
  return { tick, play, judge, ready, TECH };
}
