// Other Lives: short playable chapters from someone else's side of the job, and flashbacks to the city's past told
// by the people who lived it. Plus the Port Meridian Gazette (the paper writes about what you actually did), Precinct
// Night (a weekly co-op night with bonus pay), and a Field Training Officer title for players who teach others.

export const LIVES = [
  { id: 'velvet', title: 'Thirty-One Years in the Chair', who: 'Velvet, dispatch', year: 'A Tuesday, 3:40 a.m.', icon: '🎧', open: () => true,
    lines: (sa) => [['narr', 'You are Velvet. The dispatch center at 3:40 in the morning: four screens, one cold coffee, and a radio that has been quiet for eleven minutes. Quiet makes you nervous.'],
      ['narr', 'Three lines light up at once.'], [sa.caller1, 'My car alarm keeps going off and I need somebody to come look at it.'], [sa.caller2, '(whispering) There\'s somebody in my backyard. I can see a flashlight.'], [sa.caller3, 'My baby\'s choking, she\'s choking, she can\'t...'],
      ['choice', [{ t: 'Take the choking baby first and start CPR coaching', set: 'vlvBaby', reply: [['velvet', 'Ma\'am, listen to my voice. Turn her face down along your arm. Five firm pats between the shoulder blades. Count them out loud with me.'], ['narr', 'Silence. Then a cough. Then the loudest, most beautiful crying you have ever heard over a phone line.']] },
        { t: 'Take the prowler call first, it could turn violent', set: 'vlvProwler', reply: [['velvet', 'Stay inside, lock the door, I\'m sending a car.'], ['narr', 'You switch lines. The mother is screaming now. You talk her through it, a minute later than you wanted. The baby coughs. Breathes. You don\'t breathe for a while.']] }], 'Three lines, one of you.'],
      ['velvet', '1-Adam-9, prowler, 400 block of Oak, caller is inside and whispering. 1-Adam-4, car alarm, Bay Street, low priority. Medics are rolling to the baby.'],
      ['narr', 'The prowler turns out to be a neighbor looking for his dog with a flashlight. The car alarm turns out to be a car alarm. The baby turns out fine.'],
      ['velvet', '(to nobody) Clear.'], ['narr', 'Thirty-one years. Nobody will ever know her face. Every officer in this city knows her voice, and so do a few hundred people who were having the worst night of their lives.']] },
  { id: 'depot', title: 'The Depot, 1998', who: 'Tasha, ER nurse', year: 'June 1998', icon: '🩺', open: (S, done) => done('badge214'),
    lines: (sa) => [['narr', 'You are Tasha, twenty-nine, eleven hours into a twelve-hour shift at Port Meridian General. The radio on the nurses\' station says the old depot is on fire.'],
      ['narr', 'The doors bang open. A firefighter carries in a boy, eight years old, soot on his face, coughing.'], [sa.kid, 'A police man carried me out. He had a hat. He said "hold on to my badge."'],
      ['choice', [{ t: 'Get the boy on oxygen and ask him his name', set: 'dpName', reply: [[sa.kid, 'Walt. ...Is the police man okay?'], ['narr', 'You don\'t know. You put the mask on his face and you tell him you\'ll find out, because that is what you say.']] },
        { t: 'Hand him to the next nurse and ask about the officer', set: 'dpAsk', reply: [['narr', 'The paramedic shakes his head once. Not here. You turn back to the boy, who is still holding something in his fist.']] }], 'The boy is coughing hard.'],
      ['narr', 'In his hand: a police badge. Number 214.'], [sa.kid, 'He told me to hold on to it. So I\'m holding on.'],
      ['narr', 'Two officers come through your ER that night with smoke in their lungs. One of them is a young patrolman named Okonkwo who will one day run the watch. One of them doesn\'t come in at all.'],
      ['narr', 'You never learn what happened to the badge. Twenty-eight years later, you will see it in a glass case at Patrol HQ and have to sit down.']] },
  { id: 'danny', title: 'The Night He Ran', who: 'Danny Ortega', year: 'Room 12, Eastgate Motel', icon: '🧑', open: (S) => (S.story[1] || 0) >= 5,
    lines: (sa) => [['narr', 'You are Danny Ortega, nineteen. You have a fresh scar on your jaw, a borrowed gray sedan in the lot, and forty dollars from a man named Vic.'],
      ['narr', 'Your phone buzzes. Abuela. Fourth voicemail today. You don\'t play it.'], [sa.friend, 'Vic says one more car and we\'re square. One more, Danny.'],
      ['choice', [{ t: 'Play your grandmother\'s voicemail', set: 'dnVoice', reply: [[sa.rosa, '(voicemail) Mijo. I made the arroz you like. It\'s on the stove. You don\'t have to say anything. Just come eat.'], ['narr', 'You listen to it twice. You don\'t call back. You don\'t know how.']] },
        { t: 'Put the phone face down on the bed', set: 'dnHide', reply: [['narr', 'The screen glows through the bedspread. Abuela. You leave it there.']] }], 'The phone keeps buzzing.'],
      ['narr', 'A knock. "Police." Through the curtain: two cadets and a sergeant who looks like she has seen every version of this night before.'],
      ['narr', 'Your hospital bracelet from the accident is still in your pocket. You don\'t know why you kept it. You push it under the mattress, as if that hides anything.'],
      ['narr', 'Later, behind a boxcar, out of breath, a cadet will say your grandmother asked them to bring you home. That is the moment you stop running. You don\'t know it yet.']] },
  { id: 'landing', title: 'Cypress Landing, 1958', who: 'Pearl, age 23', year: 'Spring 1958', icon: '🛶', open: (S, done) => done('drowned'), flash: true,
    lines: (sa) => [['narr', 'You are Pearl, twenty-three, in a borrowed canoe. Cypress Landing is three feet under water and rising an inch an hour. The dam gates closed last night. Nobody believed they would.'],
      [sa.boy, 'Miss Pearl! The Batistes are on their roof!'], ['narr', 'Six kids in four canoes. You started calling yourselves the River Rats this morning, as a joke. It stopped being a joke around noon.'],
      ['choice', [{ t: 'Paddle to the Batistes first', set: 'plBat', reply: [['narr', 'Mrs. Batiste hands down her grandbaby, then a quilt, then a Bible with a pressed rose in Psalms. "Take the book. I can\'t take everything, take the book."'], ['narr', 'You take the book. Somewhere between the roof and the ridge, it goes over the side. You will think about that rose for sixty-eight years.']] },
        { t: 'Send the faster canoes ahead and stay with the youngest', set: 'plKids', reply: [['narr', 'You keep little Eli\'s father\'s canoe in sight the whole way. Never leave a paddler. Somebody carves it into the railing later. You don\'t know who.']] }], 'The water is still rising.'],
      ['narr', 'By dark, forty-one families are on the ridge. Nobody drowned. The town did.'], ['narr', 'Never leave a paddler. You were the oldest River Rat. You are the last one.']] },
  { id: 'carried', title: 'Carried, 1968', who: 'Sgt. Booker', year: 'Overseas, 1968', icon: '🪖', open: (S, done) => done('ocampo'), flash: true,
    lines: (sa) => [['narr', 'You are Sergeant Booker, twenty years old, and your leg doesn\'t work. The truck won\'t come until morning. It is dark, and it is very loud, and then it is very quiet.'],
      [sa.luis, 'Sarge. Hey, Sarge. You\'re from Port Meridian, right? Me too. Magnolia Terrace. Come on. I\'ve got you.'],
      ['choice', [{ t: 'Tell him to go back, it\'s against orders', set: 'bkBack', reply: [[sa.luis, 'Yeah, I know. My mama would kill me. Arm over my shoulder. On three.']] },
        { t: 'Ask him his name', set: 'bkName', reply: [[sa.luis, 'You won\'t remember it. Morphine. That\'s okay. Arm over my shoulder. On three.']] }], 'He is already lifting you.'],
      ['narr', 'He talks the whole way. About his mother\'s rice. About a girl at the Gavel Grill. About how the river smells in June.'],
      ['narr', 'At the aid station he sets you down, wipes his hands on his pants, and says "See you at home, Sarge." Then he goes back the way he came.'],
      ['narr', 'You will spend fifty-eight years polishing other men\'s names, trying to remember his.']] },
  { id: 'week9', title: 'Week Nine, 2003', who: 'Cadet Dana Castillo', year: 'Academy, 2003', icon: '🎓', open: (S) => (S.story[4] || 0) >= 5,
    lines: (sa) => [['narr', 'You are Dana Castillo, twenty-four, week nine of the academy, and you are about to fail the legal exam. You know it. Everyone knows it.'],
      [sa.vic, 'Dana. Hey. Roommate. I got the answers. The real ones, from the instructor\'s printer. Free. For you.'], [sa.vic, 'Everybody takes something, Dana. This is just paper.'],
      ['choice', [{ t: 'Say no and walk away', set: 'w9No', reply: [[sa.vic, 'Your funeral. Don\'t say I never did anything for you.']] },
        { t: 'Say no and ask him to turn them in', set: 'w9Turn', reply: [[sa.vic, 'Turn them in? Dana. Come on. Who\'s it hurting?'], ['narr', 'You don\'t have an answer that will make him understand. You have an answer that will cost you a friend.']] }], 'He holds out the folded pages.'],
      ['narr', 'You study until three a.m. You pass by four points. On Friday you walk into the training director\'s office and tell him about the printer.'],
      ['narr', 'Vic washes out that afternoon. He doesn\'t say goodbye. Twenty-three years later he will say "Tell Dana I said hello" in a courthouse hallway, and you will finally know what that four-point grade cost.']] }
];

const HEADS = {
  badge214: ['Badge 214 Comes Home', 'A 1998 fire, a pie ticket and a bus driver\'s secret'], room9: ['Room 9 Stays Lit', 'Founders Elementary opens a homework club after a custodian\'s quiet gift'],
  ninety: ['Seventh Defibrillator Installed Downtown', 'Device signed by a dog named Lucky'], sideb: ['Lost 1979 Recording Plays Again', 'Eastside soul song finds the son it was written for'],
  firstboard: ['Chess Club Takes Third at State', 'Treasurer cleared, plays first board'], sender: ['Thirty-Year-Old Letter Delivered', 'Pelican Diner owner reunited with the family that sheltered her'],
  atthree: ['A Dog, a Fence, and Three O\'Clock', 'Late grandfather\'s routine brings a family back together'], siding9: ['Switchman Cleared After 39 Years', 'Stained glass found on a dead siding, never stolen'],
  hives: ['Stolen Hives Returned', 'Teen buyer becomes the sod farm\'s newest beekeeper'], ocampo: ['One More Name for the Memorial', 'Records petition filed for Pvt. Luis Ocampo'],
  addresses: ['Forty Warrants Recalled', 'Box of unfiled address forms found under a desk'], trail5: ['1,140 Missing Files Returned', 'Records contractor owner surrenders on fraud warrant'],
  blossomgate: ['The Gate That Never Locks', 'Old Grove Farm\'s Sunday-night mystery solved'], drowned: ['Cypress Landing Remembered', 'Belongings from the drowned town returned to 22 families'],
  meridianstar: ['The Meridian Star Bell Rings Again', 'Welder\'s apology delivered after forty years'], streetlight: ['Page 213 Restored', 'Notary reclaims his name after a wrongful conviction']
};

export function installLives(H) {
  const S = H.S, esc = H.esc;
  S.lives = S.lives || {}; const done = (id) => { const q = H.sideQ(id); return !!q && H.sideClosed(q); };
  function cast() { return { caller1: H.sayAs('c1', { name: 'Caller, line 1', icon: '🚗', role: 'Bay Street' }), caller2: H.sayAs('c2', { name: 'Caller, line 2', icon: '🏡', role: 'Oak Avenue' }), caller3: H.sayAs('c3', { name: 'Caller, line 3', icon: '👩', role: 'Harbor View' }),
    kid: H.sayAs('walt8', { name: 'Walt, age 8', icon: '🧒', role: '1998' }), friend: H.sayAs('dnf', { name: 'Marco', icon: '🧑', role: 'Danny\'s friend' }), rosa: 'rosa', boy: H.sayAs('rat', { name: 'River Rat', icon: '🧒', role: '1958' }),
    luis: H.sayAs('luis', { name: 'Pvt. Luis Ocampo', icon: '🪖', role: 'Magnolia Terrace' }), vic: H.sayAs('vic03', { name: 'Vic Lassiter, cadet', icon: '🎓', role: 'Week nine, 2003' }) }; }
  function play(id) {
    const L = LIVES.find((x) => x.id === id); if (!L || !L.open(S, done)) return; H.closeModal(); if (L.flash) document.body.classList.add('flashback');
    H.dialogue(L.lines(cast()), () => { document.body.classList.remove('flashback'); const first = !S.lives[id]; S.lives[id] = Date.now(); H.saveS(); if (first) { H.award(80, 'other lives story'); H.stat('lives'); if (LIVES.every((x) => S.lives[x.id])) { H.banner('👣', 'Walked a Mile', 'You\'ve seen the city from every side. Title unlocked.'); S.titles = S.titles || {}; S.titles['Walked a Mile'] = 1; } } },
      { kicker: (L.flash ? 'FLASHBACK · ' : 'OTHER LIVES · ') + L.year.toUpperCase(), noFollow: true, onLeave: () => document.body.classList.remove('flashback') });
  }
  function panel() {
    H.openModal('<div class="sceneHead"><b>OTHER LIVES</b><h2>The job, from the other side</h2><p>Short chapters as someone else: the dispatcher, the nurse, the kid who ran, and the people who remember the city before you. New ones open as you finish stories.</p></div><div class="lvList">' +
      LIVES.map((L) => { const ok = L.open(S, done); return '<button type="button" class="lvRow' + (ok ? '' : ' locked') + (S.lives[L.id] ? ' seen' : '') + '" data-l="' + L.id + '"' + (ok ? '' : ' disabled') + '><i>' + (ok ? L.icon : '🔒') + '</i><div><b>' + esc(ok ? L.title : 'Locked') + '</b><small>' + esc(ok ? L.who + ' · ' + L.year : 'Opens as you finish more of the story') + '</small></div>' + (S.lives[L.id] ? '<em>✓</em>' : '') + '</button>'; }).join('') +
      '</div><div class="qAct"><button type="button" id="mClose">Back</button></div>');
    document.querySelectorAll('.lvRow[data-l]').forEach((b) => b.onclick = () => play(b.dataset.l)); const x = document.getElementById('mClose'); if (x) x.onclick = H.closeModal;
  }
  // ---------------- the Port Meridian Gazette ----------------
  function gazette() {
    const closed = Object.keys(HEADS).filter((id) => { const q = H.sideQ(id); return q && H.sideClosed(q); }), lead = closed.length ? HEADS[closed[closed.length - 1]] : (S.story[4] || 0) >= 5 ? ['Bail Runner Arrested in Courthouse', 'Cadet makes the arrest by the book'] : ['New Cadets Hit the Streets', 'Port Meridian\'s newest class starts patrol'];
    const briefs = closed.slice(-4, -1).reverse().map((id) => HEADS[id]), d = new Date(), w = (S.wxLast || ['Sunny, 88°', 'Afternoon storms, 84°', 'Humid, 91°', 'Clear, 79°'][d.getDate() % 4]);
    const blot = [[S.calls || 0, 'calls for service answered by your unit'], [(S.de || {}).win || 0, 'tense calls talked down'], [Object.keys(S.notes || {}).length, 'notes and plaques read around town'], [Object.keys(S.lives || {}).length, 'stories heard from the other side']].filter((x) => x[0]);
    H.openModal('<div class="gzBox"><div class="gzMast"><small>' + d.toDateString().toUpperCase() + ' · 50¢</small><h1>Port Meridian Gazette</h1><small>' + esc(w) + ' · Serving the city since 1926</small></div>' +
      '<article class="gzLead"><h2>' + esc(lead[0]) + '</h2><p class="gzDek">' + esc(lead[1]) + '</p><p>' + esc((S.cs || 'A cadet') + ' of the Port Meridian Police Academy was on the call. Neighbors described the cadet as "calm," "a good listener," and, in one case, "the one who paid for the hot dog."') + '</p></article>' +
      (briefs.length ? '<div class="gzCols">' + briefs.map((b) => '<article><h3>' + esc(b[0]) + '</h3><p>' + esc(b[1]) + '</p></article>').join('') + '</div>' : '') +
      (blot.length ? '<div class="gzBlot"><b>POLICE BLOTTER</b>' + blot.map((x) => '<span><em>' + x[0] + '</em> ' + esc(x[1]) + '</span>').join('') + '</div>' : '') +
      '</div><div class="qAct"><button type="button" id="mClose">Fold the paper</button></div>');
    const x = document.getElementById('mClose'); if (x) x.onclick = H.closeModal; H.stat('gazette');
  }
  // ---------------- Precinct Night: Friday evenings, everyone on together ----------------
  const precinct = () => { const d = new Date(); return d.getDay() === 5 && d.getHours() >= 19 && d.getHours() < 23; };
  let told = false;
  function tick() {
    if (precinct() && !told) { told = true; H.banner('🏢', 'Precinct Night', 'Fridays 7 to 11 p.m.: calls pay 25% more and every call counts double toward the district goal. Bring your squad.'); }
    if ((H.st('rideTeach') || 0) >= 3) { S.titles = S.titles || {}; if (!S.titles['Field Training Officer']) { S.titles['Field Training Officer'] = 1; H.saveS(); H.banner('🎖️', 'Field Training Officer', 'You\'ve taught three ride-alongs. New cadets see the FTO badge on your name.'); } }
  }
  return { panel, play, gazette, precinct, mult: () => (precinct() ? 1.25 : 1), tick, LIVES };
}
