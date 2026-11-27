// Patrol activities: the everyday work of the job, played step by step. Traffic stops, welfare checks, warrant arrests,
// jail transport and booking, and night business checks. Each one has a few different ways it can go (a clean stop or a
// suspended license, a person who's fine or one who isn't), every step is a judgment call with fair options, and your
// sergeant grades the whole thing at the end. Sim rounds only; everything follows policy.

// a step: [label, [[option text, points 0..2, reply lines], ...]]. 2 = by the book, 1 = workable, 0 = a mistake.
const C = 'castillo';
const S2 = (t, r) => [t, 2, r], S1 = (t, r) => [t, 1, r], S0 = (t, r) => [t, 0, r];

export const OPS = {
  traffic: {
    title: 'Traffic stop', icon: '🚗', prio: 3, les: [1, 3, 10], kicker: 'TRAFFIC STOP',
    variants: {
      clean: { what: 'A gray sedan doing 52 in a 35, school zone just ended.', why: 'going 52 in a 35', who: 'Teresa Baptiste', tag: 'Florida tag GKL-4471' },
      suspended: { what: 'A white pickup with a taillight out.', why: 'a taillight that\'s out', who: 'Marcus Dell', tag: 'Florida tag 7HW-220' },
      dui: { what: 'A blue hatchback drifting over the center line twice.', why: 'drifting over the center line', who: 'Kyle Ames', tag: 'Florida tag PRT-918' },
      nervous: { what: 'A minivan rolling through a stop sign.', why: 'rolling through that stop sign', who: 'Ana Ruiz', tag: 'Florida tag MVN-332' }
    },
    steps: (v) => [
      ['narr', v.what + ' You hit the lights.'],
      ['Where do you light them up?', [
        S2('Wait for a wide shoulder with good lighting', [[C, '(over the radio) Good. Room to work, and drivers can see you.']]),
        S1('Light them up right away, wherever they are', [[C, '(over the radio) It worked out. But you stopped them on a curve. Pick your spot next time.']]),
        S0('Pull up alongside and wave them over', [[C, '(over the radio) Never pull up next to a car you\'re stopping. Stay behind them.']])]],
      ['Before you get out of the car?', [
        S2('Call in your location and the tag first', [['velvet', '(over the radio) Copy. ' + v.tag + ', I show you out at your location.']]),
        S1('Get out, then call it in from the window', [[C, '(over the radio) Call it in before you get out. If something goes wrong, we need to know where you are.']]),
        S0('Skip the radio, it\'s just a simple stop', [[C, '(over the radio) There\'s no such thing as a simple stop. Call it in, every time.']])]],
      ['How do you walk up?', [
        S2('Stay behind the door post, watch the hands', [['narr', 'You stop just behind the driver\'s door post. You can see both hands on the wheel.']]),
        S1('Walk up on the passenger side instead', [['narr', 'Passenger side approach. It\'s safer from traffic. You knock on the window and they roll it down, surprised.']]),
        S0('Walk right up and lean in the window', [[C, '(over the radio) Don\'t put your head in a car. You can\'t see what\'s by their feet.']])]],
      ['What do you say first?', [
        S2('"Evening. I stopped you for ' + (v.why || 'a traffic violation') + '."', [[v.who, 'Oh. Okay. Sorry, officer. Here\'s my license.']]),
        S1('"Do you know why I pulled you over tonight?"', [[v.who, '...I don\'t know. Was I speeding? Is that it?'], [C, '(over the radio) That question makes people guess and get defensive. Just tell them.']]),
        S0('"License, registration and insurance. Now."', [[v.who, 'For what? What did I do?'], [C, '(over the radio) People calm down when they know why they\'re stopped. Tell them.']])]]
    ],
    // what the records check turns up, and the decision that follows
    result: (v, id) => id === 'clean' ? [
      ['velvet', '(over the radio) Comes back clear. Valid license, no warrants.'],
      [v.who, 'I\'m sorry. I\'m late picking up my son from practice. I wasn\'t paying attention.'],
      ['How do you end it?', [
        S2('Write a warning and explain the school zone', [[v.who, 'Thank you. I\'ll slow down. I really will.']]),
        S2('Write the ticket and explain how to handle it', [[v.who, 'Okay. That\'s fair, I was going too fast. Thanks for explaining it.']]),
        S0('Lecture her for a while, then let her go', [[C, '(over the radio) Warning or ticket, either one\'s fine. A lecture with no paperwork isn\'t either one.']])]]] :
      id === 'suspended' ? [
      ['velvet', '(over the radio) Be advised, his license is suspended. Unpaid fines. No warrants.'],
      [v.who, 'Suspended? For the fines? Man, I\'m paying those. I\'m on a payment plan. I need this truck for work.'],
      ['What do you do?', [
        S2('Cite him, have a licensed driver take the truck', [[v.who, 'My brother can come get it. ...Okay. Thanks for not towing it.']]),
        S1('Cite him and have the truck towed', [[v.who, 'Towed? That\'s two hundred bucks I don\'t have.'], [C, '(over the radio) Legal. But a licensed driver could have taken it. Think about what it costs people.']]),
        S0('Let him drive off with a warning', [[C, '(over the radio) If he hits somebody on the way home, that\'s on you. He can\'t drive.']])]]] :
      id === 'nervous' ? [
      ['narr', 'Her hands are shaking. Two little kids in the back seat are staring at you.'],
      ['velvet', '(over the radio) Clear. Valid license, no warrants.'],
      [v.who, 'I\'m sorry, I\'m sorry. I\'ve never been pulled over before. Am I going to jail?'],
      ['What do you tell her?', [
        S2('"It\'s okay, ma\'am. This is just a warning."', [[v.who, 'Oh, thank God. Okay. Okay. I\'ll stop all the way. Kids, say thank you to the officer.']]),
        S1('"Calm down, ma\'am. Here\'s your ticket."', [[v.who, '(crying) Okay. Okay.'], [C, '(over the radio) A ticket\'s fine. "Calm down" never works. Tell her what\'s happening instead.']]),
        S0('"Ma\'am, step out. I\'m searching the van."', [[C, '(over the radio) Nervous isn\'t probable cause. Most people are nervous with a cop at their window.']])]]] : [
      ['narr', 'His eyes are glassy, and you can smell alcohol from the car. There\'s an open can in the cup holder.'],
      [v.who, 'I had like two beers. Two. I\'m fine, I swear. I live right down the road.'],
      ['What\'s your next step?', [
        S2('Have him step out and do field sobriety tests', [['narr', 'He sways on the walk-and-turn and can\'t finish the one-leg stand. He fails every clue.']]),
        S1('Arrest him on the spot for DUI', [[C, '(over the radio) You probably have it. But the field tests are what prove it in court. Do them first.']]),
        S0('Have him park it and walk home this time', [[C, '(over the radio) And if he walks back to the car in an hour? Impaired drivers kill people. This is an arrest.']])]],
      ['narr', 'You place him under arrest for DUI. His car gets towed. He\'s quiet now.'],
      [v.who, 'My wife is going to kill me.']],
    arrest: (id) => id === 'dui'
  },

  welfare: {
    title: 'Welfare check', icon: '🏠', prio: 2, les: [1, 9], kicker: 'WELFARE CHECK',
    variants: {
      fine: { who: 'Mr. Harold Pike', caller: 'His niece in Ohio' },
      fallen: { who: 'Mrs. Edna Shaw', caller: 'Her neighbor across the hall' },
      gone: { who: 'Mr. Walter Grimes', caller: 'His mail carrier' }
    },
    steps: (v) => [
      ['narr', v.caller + ' called. Nobody\'s heard from ' + v.who + ' in three days. Car\'s in the driveway, newspapers on the step.'],
      ['When you get to the door?', [
        S2('Knock hard, announce yourself, and listen', [['narr', 'You knock and call out, "Police department, welfare check!" Then you wait and listen. Nothing.']]),
        S1('Knock once and wait a minute', [['narr', 'You knock and wait. Nothing. Maybe he didn\'t hear it.']]),
        S0('Try the knob and walk right in', [[C, '(over the radio) Not yet. You haven\'t got a reason to go in yet. Knock, announce, look around first.']])]],
      ['No answer. What next?', [
        S2('Check the windows and talk to the neighbors', [['narr', 'Through the back window you can see the TV on. A neighbor says she hasn\'t seen the lights change in two days.']]),
        S1('Call the caller back for more information', [['narr', 'You call the caller back on your work cell. She tells you he takes heart medication and always answers by the second ring.']]),
        S0('Leave a card on the door and clear the call', [[C, '(over the radio) Three days, car in the driveway, no answer? You don\'t leave. Keep working it.']])]],
      ['You have reason to think he needs help. How do you get in?', [
        S2('Get a key from the landlord or a family member', [['narr', 'The landlord lives two doors down. He jogs over with a key ring.']]),
        S2('Have fire force the door if no key is coming', [['narr', 'Engine 3 pops the door in about a minute with almost no damage.']]),
        S0('Kick the door yourself right now', [[C, '(over the radio) If there\'s no emergency you can see, slow down. A key\'s two minutes away. Kicking it hurt your knee and his door.']])]]
    ],
    result: (v, id) => id === 'fine' ? [
      ['narr', 'He\'s in the back bedroom with big headphones on, asleep in his recliner. He jumps about a foot when you tap his shoulder.'],
      [v.who, 'What in the world? Is something wrong? ...My niece called you? Oh, for heaven\'s sake. My phone died Sunday.'],
      ['Before you leave?', [
        S2('Help him charge his phone and call her back', [[v.who, 'There, she\'s crying. She\'s fine. I\'m fine. Thank you, officer. Sorry for the trouble.']]),
        S1('Tell him to call his niece and clear the call', [[v.who, 'I will. Soon as this thing charges.']]),
        S0('Tell him he wasted police time', [[C, '(over the radio) He didn\'t call us. Somebody who loves him did. This is a good outcome.']])]]] :
      id === 'fallen' ? [
      ['narr', 'She\'s on the kitchen floor. She\'s awake, but she\'s cold and her voice is weak. She\'s been there since Tuesday.'],
      [v.who, 'I knew somebody would come. I just knew it. I couldn\'t reach the phone.'],
      ['What do you do first?', [
        S2('Call for rescue, keep her warm, don\'t move her', [['narr', 'You get a blanket from the couch and keep talking to her until the paramedics come. You hold her hand. She doesn\'t let go.']]),
        S1('Help her up into a chair while you wait', [[C, '(over the radio) She might have a broken hip. Don\'t move a fall victim. Let the medics do it.']]),
        S0('Start writing your report while you wait', [[C, '(over the radio) The report can wait. She can\'t. Stay with her.']])]],
      [v.who, '(on the stretcher) You\'ll lock up for me? And feed Biscuit? He\'s under the bed.']] : [
      ['narr', 'He\'s in his chair by the window. The TV\'s still on. He\'s been gone for a couple of days. It looks peaceful.'],
      ['What do you do now?', [
        S2('Step back out, secure the scene, call it in', [['velvet', '(over the radio) Copy. Medical examiner and a supervisor are on the way. You okay out there?']]),
        S1('Check the house for medications and notes first', [[C, '(over the radio) Don\'t go through things. It\'s a scene until the medical examiner says it isn\'t. Step back out.']]),
        S0('Cover him and call his family yourself', [[C, '(over the radio) Don\'t disturb anything, and the notification gets done in person, the right way. Not by phone from his kitchen.']])]],
      ['narr', 'While you wait, you notice a framed photo on the table. A young man in a Navy uniform, and a woman laughing. On the back it says "Walt and June, 1961."'],
      [C, '(over the radio) Take a minute if you need it. These stay with you. That\'s normal.']],
    arrest: () => false
  },

  warrant: {
    title: 'Serve an arrest warrant', icon: '📄', prio: 2, les: [10, 11, 8], kicker: 'WARRANT',
    variants: {
      calm: { who: 'Derek Fenn', charge: 'failure to appear on a theft charge' },
      family: { who: 'Luis Ortega', charge: 'violation of probation' },
      runner: { who: 'Tyler Boone', charge: 'burglary of a vehicle' }
    },
    steps: (v) => [
      ['narr', 'Records has an active warrant for ' + v.who + ', ' + v.charge + '. He\'s at his mother\'s place.'],
      ['Before you go to the door?', [
        S2('Confirm the warrant is still active, check his ID info', [['velvet', '(over the radio) Warrant\'s confirmed active as of ten minutes ago. Date of birth and photo on file.']]),
        S1('Go now, you saw it on the list this morning', [[C, '(over the radio) Warrants get recalled all the time. Confirm it before you put cuffs on anybody.']]),
        S0('Skip it, the paperwork always catches up', [[C, '(over the radio) Arresting somebody on a recalled warrant is a false arrest. Confirm it. Every time.']])]],
      ['How do you set up?', [
        S2('Wait for a cover unit and cover the back', [['narr', '2-Baker-14 takes the back corner of the house. You take the front door.']]),
        S1('Go to the door alone, it\'s a minor charge', [[C, '(over the radio) Minor charges still get people hurt. Get a cover unit.']]),
        S0('Both of you go to the front door together', [[C, '(over the radio) And if he goes out the back? One front, one covering the back.']])]]
    ],
    result: (v, id) => id === 'calm' ? [
      ['narr', 'He answers the door himself. He sees the uniform and his shoulders drop.'],
      [v.who, 'Yeah. I know. I missed court. I\'ve been meaning to turn myself in. I just kept putting it off.']] :
      id === 'family' ? [
      ['narr', 'His mother answers. Behind her, a little girl in pajamas is holding onto his leg.'],
      ['How do you handle it?', [
        S2('"Luis, can you step outside with me a minute?"', [[v.who, '...Okay. Mija, go sit with Abuela. I\'ll be right back.'], ['narr', 'He walks out on his own. You do the rest out of her sight.']]),
        S1('"Folks, I have a warrant for Luis\'s arrest."', [['narr', 'The little girl starts crying. His mother yells. It takes a while, but he goes peacefully.']]),
        S0('"Hands behind your back, Luis. Right now."', [[C, '(over the radio) Legal, but that little girl just watched her dad get cuffed. If you can, do it out of the kids\' sight.']])]]] : [
      ['narr', 'The back door bangs open. ' + v.who + ' goes over the fence and runs straight into 2-Baker-14, who was right where you put him.'],
      ['2-Baker-14', '(over the radio) Got him. He\'s on the ground, not fighting. Come on back.']],
    arrest: () => true
  },

  transport: {
    title: 'Jail transport and booking', icon: '🚓', prio: 3, les: [0, 6, 10], kicker: 'TRANSPORT',
    variants: { std: {} },
    steps: () => [
      ['Before he gets in your car?', [
        S2('Search the back seat, then search him again', [['narr', 'Under the seat you find a pen cap and a gum wrapper. Somebody missed them. You didn\'t.']]),
        S1('Search him again, the car was checked this morning', [[C, '(over the radio) This morning isn\'t now. Search the car before and after every transport.']]),
        S0('Put him in, the arresting search was enough', [[C, '(over the radio) Search the car and search him again. That\'s how a cuff key or a razor blade gets missed.']])]],
      ['In the car?', [
        S2('Seat belt him in, call out your start mileage', [['velvet', '(over the radio) Copy, transporting one, starting mileage logged at 14:22.']]),
        S1('Seat belt him in and just drive', [[C, '(over the radio) Call out your mileage and time. It protects you if he says something happened on the ride.']]),
        S0('Skip the belt, he\'s cuffed and it\'s short', [[C, '(over the radio) A cuffed person can\'t brace for a crash. Belt them in every single time.']])]],
      ['He says he\'s feeling sick on the way.', [
        S2('Ask what\'s wrong and radio it in', [['velvet', '(over the radio) Copy. Jail medical will see him at intake.'], ['narr', 'He says he hasn\'t eaten all day. It\'s probably nothing. Now it\'s on the record either way.']]),
        S1('Tell him the jail nurse will check him', [['narr', 'He nods. You keep an eye on him in the mirror the rest of the way.']]),
        S0('Ignore it, people say that to get out of jail', [[C, '(over the radio) Sometimes it\'s real. If he\'s sick and you ignored it, that\'s on you. Ask and log it.']])]],
      ['At the sally port?', [
        S2('Lock your gun in the box before you go in', [['narr', 'Gun in the lockbox, key in your pocket. The inner door buzzes open.']]),
        S0('Keep your gun on, you\'re only dropping him off', [['narr', 'The deputy stops you at the door and points at the lockbox. You go back and lock it up.']]),
        S1('Ask the deputy what their policy is', [['ramos', 'Gun in the box. Every time. Now you know.']])]],
      ['At booking?', [
        S2('Hand over the paperwork and his sealed property bag', [['ramos', 'Paperwork\'s complete, bag\'s sealed and signed. Clean handoff. Thank you.']]),
        S1('Hand him over and bring the paperwork later', [['ramos', 'I can\'t book him without the paperwork. Have a seat and finish it.']]),
        S0('Leave his property in your trunk for now', [['ramos', 'His property goes with him. Every item, sealed and signed. Go get it.']])]],
      ['narr', 'You search the back seat one more time after he\'s out. It\'s clean. You call in your ending mileage.']
    ],
    result: () => [], arrest: () => false
  },

  business: {
    title: 'Night business check', icon: '🔦', prio: 3, les: [1, 9], kicker: 'BUSINESS CHECK',
    variants: { quiet: {}, door: {}, worker: {} },
    steps: () => [
      ['narr', 'Two in the morning. You park behind the strip mall to walk it with your flashlight and shake the door handles.'],
      ['Before you get out of the car?', [
        S2('Tell dispatch you\'re out on foot and where', [['velvet', '(over the radio) Copy, you\'re out on foot behind the Eastside strip. Holler if you need anything.']]),
        S1('Just get out, you\'ll only be a few minutes', [[C, '(over the radio) A few minutes is plenty of time for something to go wrong. Tell dispatch where you are.']]),
        S0('Leave the car running with the door open', [[C, '(over the radio) Lock your car. An empty running patrol car is a gift to somebody.']])]],
      ['How do you walk it?', [
        S2('Go slow, light on the doors, stay off the walls', [['narr', 'You keep your light low and check each door and window as you go.']]),
        S1('Drive past slowly and shine the spotlight', [['narr', 'It covers a lot of ground. You\'d miss a door that\'s just barely open, though.']]),
        S0('Walk it fast with your light off', [[C, '(over the radio) A dark alley at two in the morning is no place to rush. Take your time and use your light.']])]]
    ],
    result: (v, id) => id === 'quiet' ? [
      ['narr', 'Every door\'s locked. But there\'s a car parked behind the laundromat with the engine running and the windows fogged up.'],
      ['How do you check the car?', [
        S2('Call out the tag, then knock and talk', [['narr', 'It\'s a delivery driver asleep between runs with the heat on. He apologizes about six times and heads home.']]),
        S1('Shine your light in and wait for movement', [['narr', 'Eventually he sits up and squints at you. It\'s a delivery driver who fell asleep between runs.']]),
        S0('Open the door to see who\'s inside', [[C, '(over the radio) Knock and talk. Yanking a door open on a sleeping person is how people get hurt, both ways.']])]],
      ['velvet', '(over the radio) Copy, all secure. Thanks for walking it.']] :
      id === 'door' ? [
      ['narr', 'The back door of the pharmacy is open about an inch. There\'s fresh damage on the frame.'],
      ['What do you do?', [
        S2('Back off, call it in, wait for a cover unit and K9', [['velvet', '(over the radio) Copy, possible burglary in progress. K9-3 and 2-Baker-14 are en route. Hold the perimeter.']]),
        S1('Call it in, then hold the door until they arrive', [[C, '(over the radio) Calling it in was right. Standing right in front of the door isn\'t. Take a position with cover.']]),
        S0('Go in alone and clear it yourself', [[C, '(over the radio) Never search a building alone. You don\'t know how many are inside.']])]],
      ['narr', 'K9-3 announces at the door. Nobody answers. The dog clears the building and finds nobody, but the narcotics cabinet\'s been pried. You hold the scene for detectives.']] : [
      ['narr', 'Light\'s on in the back of the bakery. You can see somebody moving around inside.'],
      ['What do you do?', [
        S2('Knock, announce yourself, and ask who\'s inside', [['narr', 'A woman in an apron opens the door with flour on her face. "I\'m the baker! We start at two. Want a donut?"']]),
        S1('Call it in and wait outside to see who comes out', [['narr', 'Twenty minutes later the baker comes out with the trash and nearly drops it when she sees you.']]),
        S0('Draw down on the door and order them out', [[C, '(over the radio) You had a lit room and somebody working. Talk first. It was the baker.']])]]],
    arrest: () => false
  }
};

export function installOps(H) {
  const rnd = (a) => a[Math.floor(Math.random() * a.length)], sh = (a) => a.slice().sort(() => Math.random() - .5);
  // turn a step list into dialogue lines, tracking points for the debrief
  function build(op, v, sc) {
    return (arr) => arr.map((s) => {
      if (typeof s[1] === 'string' || !Array.isArray(s[1])) return s; // a spoken or narrated line
      const [label, opts] = s; sc.max += 2;
      return ['choice', sh(opts).map(([t, pts, reply]) => ({ t, fx: () => { sc.pts += pts; sc.log.push([label, pts]); }, reply })), label];
    });
  }
  // arrest steps, reused for every arrest an activity ends in
  const arrestSteps = (who) => [
    ['How do you take him into custody?', [
      S2('"You\'re under arrest. Turn around for me, please."', [['narr', 'He turns around and puts his hands behind his back.']]),
      S1('(Grab his arm) "Hands behind your back!"', [[C, '(over the radio) Tell him what\'s happening first. Surprised people pull away.']]),
      S0('"Okay. So... whenever you\'re ready."', [[C, '(over the radio) He doesn\'t know what you want. Give him one clear instruction at a time.']])]],
    ['Handcuffs?', [
      S2('Check the fit, then double-lock both cuffs', [['narr', 'Snug, not tight. Double-locked.']]),
      S1('Cuff him in front since he\'s cooperating', [[C, '(over the radio) Behind the back unless there\'s a medical reason. Cooperative people still change their minds.']]),
      S0('Cuff as tight as they go so he can\'t slip', [[C, '(over the radio) Too tight means an injury and a complaint. Check the fit and double-lock them.']])]],
    ['Search?', [
      S2('Ask about sharp items, then search him fully', [['narr', who + ' says there\'s a lighter in his pocket. That\'s all you find.']]),
      S1('Pat down just the outside of his pockets', [[C, '(over the radio) A search incident to arrest is a full search. Pockets, waistband, shoes.']]),
      S0('Skip it, the jail will search him anyway', [[C, '(over the radio) You search at the time of arrest. That\'s for your safety and his.']])]],
    ['He wants to tell you his side.', [
      S2('Read him his rights before any questions', [[who, 'Yeah, I understand. ...I don\'t want to talk without a lawyer.'], ['narr', 'You stop asking questions. You write down that he asked for a lawyer.']]),
      S1('Let him talk, but don\'t ask him anything', [[C, '(over the radio) If he volunteers it, that\'s fine. The second you ask a question, read him his rights first.']]),
      S0('Ask him what happened while you drive', [[C, '(over the radio) He\'s in custody. Questioning without Miranda gets the whole statement thrown out.']])]]
  ];
  let busy = false;
  function start(c, done) {
    const op = OPS[c.ops]; if (!op || busy) return done && done('skip'); busy = true;
    const vid = c.opsV || rnd(Object.keys(op.variants)), v = op.variants[vid], sc = { pts: 0, max: 0, log: [] }, B = build(op, v, sc);
    const who = v.who || 'the suspect';
    // the fact check happens inside the scene, in the moment there's a natural wait, and the scene picks back up after it
    const q = H.pickFact(op.les), lead = { traffic: 'While Velvet runs the tag, quick question for you.', welfare: 'While we wait on a way in, think about this one.', warrant: 'While Baker gets in position, answer me this.', transport: 'Long red light. While we sit here, tell me this.', business: 'While you walk it, something to chew on.' }[c.ops];
    const qBeat = q ? [[C, '(over the radio) ' + lead], ['q', q, C]] : [];
    const st = B(op.steps(v)), at = Math.min(st.length, { welfare: 3, transport: 2 }[c.ops] || st.length);
    let lines = st.slice(0, at).concat(qBeat, st.slice(at), B(op.result(v, vid) || []));
    const arrest = op.arrest(vid);
    if (arrest) lines = lines.concat(B(arrestSteps(who)));
    // one-off speakers (the driver, the suspect, the cover unit) get registered with the dialogue engine
    const spk = { [who]: H.sayAs('op_' + c.ops + '_' + vid, { name: who, icon: op.icon, role: op.title }), '2-Baker-14': H.sayAs('unitb14', { name: '2-Baker-14', icon: '🚓', role: 'Cover unit' }) };
    const fix = (ls) => ls.forEach((l) => { if (!Array.isArray(l)) return; if (l[0] === 'choice') l[1].forEach((o) => fix(o.reply || [])); else if (spk[l[0]]) l[0] = spk[l[0]]; });
    fix(lines);
    H.dialogue(lines, (res) => {
      const proc = sc.max ? Math.round(sc.pts / sc.max * 20) : 10, safety = sc.log.filter((l) => l[1] === 0).length, rows = [
        ['🛡️', 'Safety', Math.max(0, 10 - safety * 4), 10, safety ? safety + ' unsafe choice' + (safety > 1 ? 's' : '') : 'No unsafe choices'],
        ['📋', 'Procedure', proc, 20, sc.pts + ' of ' + sc.max + ' points by the book']];
      const xp = 40 + rows.reduce((a, r) => a + r[2], 0) * 2 + (res.right || 0) * 20;
      H.stat('ops'); H.stat('ops_' + c.ops); if (arrest) H.stat('opsArrest'); if (!safety) H.stat('opsClean');
      H.debrief({ extra: rows, title: op.title, where: c.where, prio: op.prio, right: res.right || 0, n: res.n || 0, fast: true, resp: 0, wrap: 'case', calm: safety === 0, qs: res.qs || [], xp, role: 'Primary unit' }, () => {
        H.closeModal(); H.award(xp, op.title.toLowerCase()); busy = false;
        // every arrest ends with a ride to the jail
        if (arrest && c.ops !== 'transport') { H.radio(H.cs(), 'One in custody. Transporting to county.'); setTimeout(() => start(Object.assign({}, c, { ops: 'transport', opsV: 'std', title: 'Transport ' + who }), done), 600); return; }
        if (done) done('ok');
      });
    }, { focus: [c.x, c.y], kicker: op.kicker, onLeave: () => { busy = false; H.leave(); if (done) done('walk'); } });
  }
  return { start, OPS, get busy() { return busy; } };
}
