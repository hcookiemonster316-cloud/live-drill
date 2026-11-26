// The main story, rebuilt (Phase 8, step 3). The five chapters keep every original step; these scenes play before the
// step named by 'chapter|goal' (game.js stores them as step.pre, and S.storyX counts them, so saves and unlocks keep working).
// Each chapter gains a set piece, a turn, a dilemma with two real goods, a quiet beat after a hard one, and Victor
// Lassiter on screen: a stranger in sunglasses in Central, "Vic" in the Eastside rain, a man watching his sister at the
// marina, a gray sedan outside the substation, and a long walk past Castillo in Justice Row.
// Loop: the city remembers what you chose (flags read later in the same chapter and in the next), and every scene is
// set at a place you already drive to.

export const MAIN_CAST = {
  theresa: { name: 'Theresa Lassiter', icon: '🩺', role: 'Vic\'s sister, night-shift nurse' }
};

export const MAIN_PRE = {
  // ---------- Chapter 1, First Watch (Central) ----------
  '0|Run the partial plate at Records': [
    { at: 'Founders Plaza', who: 'delgado', npc: 'delgado', goal: 'Watch Founders Plaza with Castillo after dark', say: [
      ['narr', 'Ten at night. Castillo parks in the shadow of the bank with the engine off. The plaza is empty except for Delgado, closing up his cart.'],
      ['castillo', 'Every night for a week, a gray sedan has circled this plaza at closing time. Nobody\'s called it in. Delgado mentioned it to me like it was weather.'],
      ['narr', 'Headlights. A gray sedan rolls past at exactly the speed limit, signaling a turn onto an empty street.'],
      ['narr', 'It parks across from the cart. The driver doesn\'t get out. White shirt, dark tie, sunglasses. At night.'],
      ['castillo', 'So. What do we have, and what do we do with it?'],
      ['choice', [
        { t: 'Walk over and ask him if he has a minute', set: 'sedanTalk', reply: [['narr', 'You\'re halfway across the plaza when the sedan pulls out. Not fast. He signals. He even waves.'], ['castillo', 'That was a fair thing to try. He just doesn\'t want to talk. Now he knows we\'re watching, too.']] },
        { t: 'Stay put and write down everything you see', set: 'sedanWatch', reply: [['narr', 'You write. Gray four-door. Rear hubcap missing on the driver\'s side. Plate starts with 7-K. He leaves after eleven minutes, then circles back eleven minutes later.'], ['castillo', 'Eleven minutes, twice. You just found his routine. He doesn\'t know we know.']] }], 'The gray sedan'],
      ['delgado', '(across the plaza) Officers! You want a hot dog? I\'m closing. Last two. On the house. ...I\'m kidding. Two dollars.']] }
  ],
  '0|Report back to Sgt. Castillo at HQ': [
    { at: 'Founders Plaza', who: 'delgado', npc: 'delgado', goal: 'Check on Delgado at Founders Plaza', say: [
      ['delgado', 'That guy in the sunglasses? He bought a hot dog yesterday. Paid with a fifty. Said keep the change.'],
      ['delgado', 'Then he asked what time I close. And which way I walk home. Nobody asks which way I walk home.'],
      ['narr', 'Delgado laughs. His hands keep wiping the same clean spot on the counter.'],
      ['delgado', 'Twenty-two years, I carry the cash home in my jacket. Same street. Marisol says I\'m a creature of habit. I say I\'m a creature of Thursdays.'],
      ['delgado', 'He was watching me count, wasn\'t he. Shopping, you call it. I\'m the store.', { if: 'sedanWatch' }],
      ['delgado', 'And the other night he waved at you. Like you were old friends. I didn\'t like that wave.', { if: 'sedanTalk' }],
      ['choice', [
        { t: 'Help him change his route and start night deposits at the bank', set: 'delgadoRoute', npc: { delgado: 1 }, reply: [['delgado', 'New route. Bank drop. My whole life, the same street. ...Okay. You walk it with me once, so I know it\'s real.'], ['narr', 'You walk the new route with him. He complains about every corner. At the bank he shakes your hand for a long time.']] },
        { t: 'Ask Dispatch to add a closing-time check at his cart', set: 'delgadoWatch', reply: [['velvet', '(over the radio) A closing-time check on the hot dog cart. Sugar, I\'ve been waiting thirty years for somebody to ask me that. Done.'], ['delgado', 'Every night? A police car, for my cart? ...My mother would be so proud. She would also tell everybody.']] }], 'Delgado']] }
  ],

  // ---------- Chapter 2, Where the Car Came From (Eastside) ----------
  "1|Check in with Rosa at Rosa's Bodega": [
    { at: 'Gas & Go', who: 'pike', goal: 'Answer the crash call at the Gas & Go', say: [
      ['narr', 'Rain, the Eastside kind, sideways and warm. A crash at the Gas & Go: a gray sedan slid through the red and clipped a parked minivan. Then it kept going.'],
      ['narr', 'In the minivan, a woman is holding her forehead. In the back, a car seat. The baby is screaming, which is the best sound you\'ll hear all night.'],
      ['pike', 'That\'s HIM. That\'s the sedan. He went east. We can still catch him. Come on.'],
      ['castillo', '(over the radio) Cadet. Your scene, your call. Tell me what you\'re doing.'],
      ['choice', [
        { t: 'Stay with the family and secure the scene', set: 'rainStay', reply: [['narr', 'You set flares, call rescue, and kneel by the open door so she can see a face instead of the rain. Rescue says she\'ll need four stitches. The baby falls asleep in your jacket.'], ['castillo', '(over the radio) Right call. A car is a car. She\'s a person. And the sedan just left paint on a minivan, which is evidence that doesn\'t run.']] },
        { t: 'Send Pike after the car while you stay', set: 'rainSplit', reply: [['narr', 'Pike takes off in the rain. You stay with the family. Four minutes later, the radio.'], ['pike', '(over the radio) Lost him at the overpass. I hydroplaned. I\'m fine. The car\'s fine. Mostly. I\'m so sorry.'], ['castillo', '(over the radio) Nobody chases in this. Not for a fender bender. Pike, come back slow. We talk later.']] }], 'In the rain'],
      ['narr', 'In the gas station camera, through the rain: a white shirt, a dark tie, a face turned toward the minivan for one second. Then the sedan is gone.'],
      ['earl', '(on the radio) That\'s Vic\'s car. I\'d know those tires anywhere. I put them on.']] }
  ],
  '1|Report back to Castillo at the Substation': [
    { at: "Rosa's Bodega", who: 'rosa', npc: 'rosa', goal: 'Rosa needs you back at the bodega', say: [
      ['rosa', 'Mijo. I didn\'t want to say in front of everybody. Danny hasn\'t been home in five days. He\'s nineteen. He\'s a grown man, they keep telling me.'],
      ['rosa', 'If I report him, they look for him, and maybe they find him in that car. If I don\'t, maybe nobody finds him at all.'],
      ['narr', 'Behind the counter, a school photo taped to the register. A boy of twelve with a missing front tooth, holding a trophy taller than he is.'],
      ['choice', [
        { t: 'Take a missing person report now. There\'s no waiting period', set: 'dannyReport', npc: { rosa: 1 }, reply: [['rosa', 'No waiting? On television they always say wait a day.'], ['narr', 'You take the report at her counter: height, the scar on his jaw from the accident, the jacket he was wearing. She signs it with a shaking hand.'], ['rosa', 'Now somebody is looking. That\'s all I wanted. Somebody looking.']] },
        { t: 'Ask around quietly first, the way she asked', set: 'dannyQuiet', reply: [['rosa', 'Quietly. Yes. His friends talk to me. They won\'t talk to a uniform.'], ['narr', 'You leave your card with three of his friends. One of them calls back that night: "He\'s scared. He said a man named Vic owns him now."']] }], 'Rosa'],
      ['rosa', 'The lady from the minivan came in today. Four stitches. She said a cadet held her baby in the rain. I said, I know that one.', { if: 'rainStay' }],
      ['castillo', '(over the radio) Pike\'s car needs a new bumper. Pike needs a talk. Both are scheduled.', { if: 'rainSplit' }],
      ['castillo', '(over the radio) Either way, Danny\'s in this now. Be gentle with her. Be careful with him.']] }
  ],

  // ---------- Chapter 3, Everything Has a Serial Number (Riverside) ----------
  '2|Report back to Castillo': [
    { at: 'Riverside Marina', who: 'theresa', goal: 'Meet the woman at slip nine after dark', say: [
      ['hal', '(on the radio) Somebody\'s on slip nine with a flashlight. Woman. Scrubs. She\'s just sitting in the boat.'],
      ['narr', 'She doesn\'t run. She holds the flashlight in her lap, pointed at the floor, the way you hold a candle at a vigil.'],
      ['theresa', 'Theresa Lassiter. It\'s my name on the slip. You already know that. You want to know if I know what he keeps on here.'],
      ['theresa', 'I don\'t. I pay a bill he gives me cash for. I don\'t ask. I stopped asking when he was twenty-two.'],
      ['theresa', 'He was the best one in that academy. Ask Dana. Then he did one stupid thing, and they sent him home on a Friday with a box.'],
      ['theresa', 'He sat in my kitchen for a month. He kept saying "I would have been good at it." I believed him. I still do. That\'s the worst part.'],
      ['narr', 'Up in the marina lot, a car idles with its lights off. Then the lights come on, and a gray sedan backs out slowly and drives away.'],
      ['theresa', 'That\'s him. He saw me talking to you. ...He\'s my little brother. You understand? Whatever he did.'],
      ['choice', [
        { t: 'Tell her plainly this conversation goes in your report', set: 'theresaHonest', reply: [['theresa', 'Good. Somebody should write something true about him. Write that I came here myself.'], ['narr', 'She hands you the slip contract and a spare key. "Get a warrant," she says. "Don\'t let him say you didn\'t."']] },
        { t: 'Ask if she\'ll give a statement herself, on her own terms', set: 'theresaStatement', reply: [['theresa', 'On my terms. Tomorrow, after my shift, with coffee. I\'ll tell it once and I won\'t cry. I might cry.'], ['castillo', '(over the radio) Let her come in. I\'ll take it myself. I knew her when she was sixteen.']] }], 'Theresa'],
      ['narr', 'She turns off the flashlight. For a while you both just listen to the boats knock against the dock.']] }
  ],

  // ---------- Chapter 4, Clear Every Corner (Industrial Park) ----------
  '3|Report back to Castillo': [
    { at: 'Substation', who: 'danny', goal: 'Bring Danny to the Industrial Park Substation', say: [
      ['narr', 'Danny rides in the back with his knees against the cage, staring at his hands. Halfway to the substation, his phone buzzes in the property bag on the front seat.'],
      ['narr', 'The screen lights up. VIC: where r u. Then a second one. VIC: courthouse tmrw 9. bring the keys.'],
      ['danny', 'My grandma filed a report on me. My face was on a flyer at the laundromat. Vic saw it. That\'s when he started watching me.', { if: 'dannyReport' }],
      ['danny', 'Marco said a cop left a card and said you\'d be fair. That\'s the only reason I stopped running.', { if: 'dannyQuiet' }],
      ['danny', 'If I don\'t answer in like ten minutes, he\'ll know something\'s wrong. He always knows.'],
      ['castillo', '(on the radio) That phone is a box we can\'t open without permission or a warrant. Your call how we open it.'],
      ['choice', [
        { t: 'Ask Danny for written consent, and let him answer the way he always does', set: 'phoneConsent', reply: [['danny', 'You\'re asking me? Okay. Yes. Give me the paper.'], ['narr', 'He signs, then types with his thumbs while you watch: "ok. 9." Vic answers with a thumbs-up. Danny exhales like he\'s been underwater.'], ['danny', 'That\'s the first thing I ever did for him that was for me.']] },
        { t: 'Hold the phone unanswered and get a warrant first', set: 'phoneWarrant', reply: [['narr', 'You seal the phone in a bag and write the time on it. The judge on call signs the warrant at 5:50 a.m.'], ['castillo', '(on the radio) Slower. Cleaner. If he\'s spooked, he\'s spooked. He was always going to be at that window at nine.']] }], 'Danny\'s phone'],
      ['narr', 'In the substation lot, a gray sedan rolls past the gate. It slows. It signals. It doesn\'t stop.'],
      ['danny', '(sliding down in the seat) That\'s him. He drives by places. He likes you to know he can.']] }
  ],
  // ---------- Chapter 5, By the Book (Justice Row) ----------
  '4|Make the arrest at the County Courthouse': [
    { at: 'Justice Plaza', who: 'castillo', goal: 'Wait with Castillo outside the courthouse', say: [
      ['narr', 'Eight fifty-two. The car is parked across from the courthouse steps. Castillo has both hands on the wheel, and the engine is off.'],
      ['castillo', 'He\'s in there. Second floor, the bond window. He likes the window seat. He liked it in the academy, too.'],
      ['castillo', 'I am going to stand behind you. I am not going to say a word. If I talk, it becomes about me and him.'],
      ['castillo', 'It isn\'t. It\'s about a stolen car, a scared kid and a minivan in the rain. That\'s the case.'],
      ['castillo', 'He thinks Danny is bringing him keys at nine. Danny is at his grandmother\'s, eating eggs.', { if: 'phoneConsent' }],
      ['castillo', 'The phone warrant came back. Every message is in the file. Nobody can say we cut a corner.', { if: 'phoneWarrant' }],
      ['beat', { ms: 1400 }],
      ['choice', [
        { t: 'Ask her what she would say to him, if she could', set: 'askWeek9', reply: [['castillo', 'That I was twenty-four and I didn\'t know how to be his friend and do the right thing at the same time.'], ['castillo', 'I know now. You do the right thing, and you stay. I didn\'t stay.']] },
        { t: 'Tell her you\'ve got it, and check your gear', set: 'gotIt', reply: [['narr', 'Cuffs. Radio. Report, folded in your pocket, read twice. Castillo watches you check each one and nods once.'], ['castillo', 'Okay. Let\'s go to work.']] }], 'Eight fifty-two'],
      ['narr', 'You cross the street. The courthouse doors are heavy. Exhibit A watches you from her sunny step, and does not move.']] }
  ],
  '4|Book Lassiter at the County Jail': [
    { at: 'County Courthouse', who: 'lassiter', goal: 'Walk your prisoner out of the courthouse', say: [
      ['narr', 'The long hallway. Lawyers stop talking. A clerk stands up from her desk to see. Lassiter walks the way he drives: steady, polite, exactly the speed limit.'],
      ['lassiter', 'You searched me twice. Upstairs and on the stairs. Dana would like that.'],
      ['narr', 'At the bottom of the steps, Castillo is waiting by the car. She doesn\'t move. Neither does he.'],
      ['lassiter', 'Hello, Dana.'],
      ['beat', { ms: 1600 }],
      ['choice', [
        { t: 'Give them a moment. You stay right beside him', set: 'walkTalk', reply: [['castillo', 'Hello, Vic.'], ['lassiter', 'You still part your hair on the wrong side.'], ['castillo', 'You still talk when you\'re scared.'], ['narr', 'That\'s all. Twenty years, and that\'s all. But something in his shoulders lets go.']] },
        { t: 'Keep him moving. Your prisoner, your rules', set: 'walkOn', reply: [['narr', 'You keep a hand on his arm and walk him past her to the car. He turns his head as he passes. She doesn\'t.'], ['lassiter', 'By the book. Of course. She trained you.']] }], 'The courthouse steps'],
      ['narr', 'In the back seat, he looks out the window at the plaza the whole way. People are waving at someone across the street. Not at him.']] }
  ],
  '4|Meet everyone at Justice Plaza': [
    { at: 'Justice Plaza', who: 'castillo', goal: 'Find Castillo on the courthouse steps', say: [
      ['narr', 'Late afternoon. She\'s sitting on the courthouse steps next to Exhibit A, in uniform, which nobody does. The cat allows it.'],
      ['castillo', 'Thank you for this morning. For the thirty seconds.', { if: 'walkTalk' }],
      ['castillo', 'You kept him moving. You were right to. I\'m not sure I wanted you to be right.', { if: 'walkOn' }],
      ['castillo', 'Theresa called. She wants to visit him. She asked me to drive her. I said yes before I thought about it.', { if: 'theresaStatement' }],
      ['castillo', 'Theresa called. She said you told her the truth to her face. She said nobody in this has done that in twenty years.', { if: 'theresaHonest' }],
      ['castillo', 'Delgado walked his new route home last night. He called me from the bank, just to say he got there.', { if: 'delgadoRoute' }],
      ['castillo', 'Velvet says a car has checked Delgado\'s cart every night this week. She also says she\'s never doing it again. She\'s doing it again.', { if: 'delgadoWatch' }],
      ['castillo', 'What I said in the car this morning, about staying. I meant it about you, too.', { if: 'askWeek9' }],
      ['castillo', 'You checked your gear three times this morning. I counted. I used to do four.', { if: 'gotIt' }],
      ['beat', { ms: 1400 }],
      ['castillo', 'Come on. They\'re all waiting for you over there. Pike brought a banner. It\'s spelled wrong.']] }
  ]
};
