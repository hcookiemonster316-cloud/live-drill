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
      ['delgado', 'Dot called me. She read me your notes. Word for word. "Does the hot dog man still walk home past the bank." I had to sit down.', { if: 'dotNotes' }],
      ['delgado', 'Velvet called every car in Central about my cart. Every car. A cruiser drove by four times last night. My neighbors think I\'m in witness protection.', { if: 'dotCall' }],
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
      ['narr', 'Under the one broken light in the marina lot, exactly where Bramlett said, a car idles with its lights off.', { if: 'bramSedan' }],
      ['narr', 'Up in the marina lot, a car idles with its lights off.', { unless: 'bramSedan' }],
      ['narr', 'Then the lights come on, and a gray sedan backs out slowly and drives away.'],
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
      ['castillo', 'Earl\'s warranty card is in evidence with his receipt stapled to it. Sevens crossed, like the academy taught us. Vic still writes like a cadet.', { if: 'earlCard' }],
      ['castillo', 'We never got Earl\'s warranty card back. His shop flooded in that rain. We have a photo. A photo is not the card.', { if: 'earlPhoto' }],
      ['castillo', 'Faircloth at River Pawn sent a letter to the prosecutor. He wants to testify. He said a cadet told him his logs mattered.', { if: 'pawnThanks' }],
      ['castillo', 'Faircloth at River Pawn won\'t testify unless he\'s subpoenaed. He said a cadet blamed him. We\'ll subpoena him. It\'ll cost us a week.', { if: 'pawnBlame' }],
      ['castillo', 'Danny\'s lawyer says he\'ll testify. He said a cadet told him no promises, and that\'s why he believes us.', { if: 'dannyHonest' }],
      ['castillo', 'Danny\'s lawyer asked whether anyone promised him no charges. Saito\'s report covers it. Lesson learned, and it\'s on paper.', { if: 'dannyPromise' }],
      ['castillo', 'You asked what I\'d want them to say. "She was fair, and she stayed." Today\'s the "fair" part.', { if: 'castilloSay' }],
      ['castillo', 'Twice as careful, Gwen would say. I\'ve read that warrant four times this morning.', { if: 'castilloInes' }],
      ['castillo', 'Thank you for the other night. In the lot. You didn\'t have to sit there.', { if: 'photoStay' }],
      ['castillo', 'You said you would have done the same. I thought about that all night. I hope it\'s true, and I hope you never find out.', { if: 'photoSame' }],
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
      ['lassiter', 'Old Pruitt walked me to my car in 2003. Same pace you\'re walking now. Did he teach you that, too?', { if: 'pruittVic' }],
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
      ['castillo', 'Rosa saw Danny for one minute before his statement. She told me it was the minute that kept her standing.', { if: 'rosaSee' }],
      ['castillo', 'Rosa sat on that lobby bench until two with a tray of pastelitos. She brought them to roll call this morning. Nobody had the heart to say they were cold.', { if: 'rosaWait' }],
      ['castillo', 'Pruitt finally told me what Vic said on his way out in 2003. "Tell her I don\'t blame her." Twenty-three years. He said you asked.', { if: 'pruittWhy' }],
      ['castillo', 'Pike came to my office after the motel. We wrote it up together. Three hours. It was a good three hours.', { if: 'pikeTalk' }],
      ['castillo', 'Pike has a sticky note on his dashboard: "Scared afterward = careful next time." He says it\'s yours.', { if: 'pikeCareful' }],
      ['castillo', 'And Pike told me you said you were glad he came back. He told everyone. He told the vending machine.', { if: 'pikeBack' }],
      ['castillo', 'Pike says you asked why I flunked him. Now you know why I make you call in your location. Every time.', { if: 'pikeFlunk' }],
      ['castillo', 'Delgado walked his new route home last night. He called me from the bank, just to say he got there.', { if: 'delgadoRoute' }],
      ['castillo', 'Velvet says a car has checked Delgado\'s cart every night this week. She also says she\'s never doing it again. She\'s doing it again.', { if: 'delgadoWatch' }],
      ['castillo', 'What I said in the car this morning, about staying. I meant it about you, too.', { if: 'askWeek9' }],
      ['castillo', 'You checked your gear three times this morning. I counted. I used to do four.', { if: 'gotIt' }],
      ['beat', { ms: 1400 }],
      ['castillo', 'Come on. They\'re all waiting for you over there. Pike brought a banner. It\'s spelled wrong.']] }
  ]
};

// more scenes per chapter (Phase 8, step 3, second pass): merged into MAIN_PRE below, before or after a step's own scenes
export const MAIN_MORE = {
  '1|Respond to the disturbance at the Eastgate Motel': { pos: 'start', scenes: [
    { at: "Big Earl's Auto", who: 'earl', goal: 'Go back to Big Earl\'s Auto after closing', say: [
      ['narr', 'Big Earl\'s Auto, after closing. The bay door is half down. Earl is sitting on an overturned tire with a flashlight, going through a shoebox of receipts.'],
      ['earl', 'Couldn\'t sleep. Kept thinking about that guy. "How hard is it to swap a plate." Nobody asks that unless they already know the answer.'],
      ['earl', 'Found it. Four tires, cash, the fourteenth of last month. He wrote a phone number on the warranty card. Who writes a real number on a warranty card?'],
      ['narr', 'The number is written in neat, careful block capitals. Every seven crossed. The way they teach you at the academy so nobody misreads a report.'],
      ['choice', [{ t: 'Ask Earl for the original card, and write him a receipt for it', set: 'earlCard', reply: [['earl', 'A receipt for my receipt. Pop would\'ve loved you.'], ['narr', 'You bag the card, write the time and Earl\'s name on it, and give him a copy. Earl tapes his copy to the wall above the register like a diploma.']] },
        { t: 'Photograph it and leave the card with Earl', set: 'earlPhoto', reply: [['earl', 'Keep it here? Sure. It\'s safe. I\'ve got a dog. Well, I\'ve got a dog\'s bowl. The dog\'s been gone a while.'], ['castillo', '(on the radio) A photo of a card is a picture of evidence. The card is the evidence. Go back tomorrow and get it.']] }], 'Earl'],
      ['earl', 'Sevens with a line through them. My dad did that. He learned it in the Army. Where\'d a car thief learn it?']] } ] },
  '2|Ask Captain Hal about the river#2': { pos: 'end', scenes: [
    { at: 'River Pawn', who: 'navarro', goal: 'Take the pawnbroker\'s statement at River Pawn', say: [
      ['narr', 'River Pawn after hours. The owner, Leonard Faircloth, sixty, cardigan, reading glasses on a chain, has been crying, or is about to.'],
      ['narr', 'He keeps straightening a row of pawned fishing rods that don\'t need straightening.'],
      ['navarro', 'Mr. Faircloth bought eleven items from V. Lassiter over two years. Every one logged with an ID, the way the law says. He did everything right on paper.'],
      ['narr', 'Faircloth says Lassiter was polite, paid attention to the paperwork, and once corrected a typo in Faircloth\'s own log. "He said, \'If it\'s worth writing down, it\'s worth writing down right.\'"'],
      ['choice', [{ t: 'Take a full statement and tell him his clean logs made the case', set: 'pawnThanks', reply: [['narr', 'He signs it. His hand shakes. "Thirty years of logging every serial number," he says. "First time it mattered."']] },
        { t: 'Tell him he should have spotted it sooner', set: 'pawnBlame', reply: [['narr', 'He takes his glasses off and looks at you for a long time. "So should a lot of people," he says. He signs the statement anyway. He doesn\'t look at you again.']] }], 'Mr. Faircloth'],
      ['navarro', 'Every log was perfect. That\'s why we caught him. Somebody doing the boring part right, for thirty years.']] } ] },
  '0|Head to the Dispatch Center and meet Velvet': { pos: 'start', scenes: [
    { at: 'Founders Park', who: 'pruitt', goal: 'Meet Sgt. Pruitt (Ret.) at the depot clock', say: [
      ['narr', 'Founders Park. An old man on the bench under the depot clock, feeding pigeons from a paper bag and checking his watch against the clock every few minutes. It\'s five minutes slow. It has always been five minutes slow.'],
      ['pruitt', 'Castillo\'s cadet. I can tell by the boots. She makes them shine them twice. I taught her that. Somebody taught me.'],
      ['pruitt', 'I ran the academy\'s field week in 2003. Her class. You know what I remember? Two cadets who sat together at every lunch. Thick as thieves. Then one Friday, one of them was carrying a box to his car.'],
      ['pruitt', 'I walked him out. Victor. He didn\'t cry. He said, "Tell her I don\'t blame her." I never told her. I should have. It\'s been twenty-three years.'],
      ['choice', [{ t: 'Ask him what Victor was like back then', set: 'pruittVic', reply: [['pruitt', 'The best driver in the class. Funny. Generous. He bought everybody\'s coffee on Mondays. Then he cheated on one exam, and everything good about him went into the box with his books.']] },
        { t: 'Ask why he never told Castillo', set: 'pruittWhy', reply: [['pruitt', 'Because she was doing so well without hearing it. And because I was a coward about it. Retired men get to say that out loud. Working men don\'t.']] }], 'Sgt. Pruitt (Ret.)'],
      ['narr', 'The clock above you clunks forward a minute, five minutes behind the rest of the world.']] } ] },
  '1|Check in with Rosa at Rosa\'s Bodega': { pos: 'end', scenes: [
    { at: 'Sunrise Café', who: 'pike', goal: 'Get Pike a coffee at the Sunrise Café', say: [
      ['narr', 'The Sunrise Café, after the rain. Pike is in a booth with his hands wrapped around a coffee he hasn\'t touched. His uniform is still damp at the shoulders.'],
      ['pike', 'At the motel. Room twelve. I was going to knock and go in. Just like that. If you hadn\'t stopped me.', { if: 'plannedMotel' }],
      ['pike', 'At the motel. I knocked and went in. And he ran out the back, right into that car. That\'s on me. That whole sedan is on me.', { if: 'pikeLed' }],
      ['pike', 'I keep thinking about who could\'ve been behind that door. A kid. A guy with a gun. A guy with a gun and a kid.'],
      ['choice', [{ t: 'Tell him being scared afterward is how you get careful', set: 'pikeCareful', reply: [['pike', 'Scared afterward. Careful next time. Okay. I can do afterward. I\'m great at afterward.']] },
        { t: 'Tell him to talk to Castillo about it', set: 'pikeTalk', reply: [['pike', 'Castillo? She\'ll make me write it up. ...She\'ll make me write it up, and then she\'ll sit with me while I do it. Yeah. Okay.']] }], 'Pike'],
      ['narr', 'He finally drinks the coffee. It\'s cold. He drinks all of it anyway.']] } ] },
  '2|Meet Castillo at the Riverside Substation': { pos: 'start', scenes: [
    { at: 'Riverside Park', who: 'bramlett', goal: 'Meet Ofc. Bramlett at Riverside Park', say: [
      ['narr', 'Riverside Park at seven a.m. A heron on the dock, a jogger with a stroller, and Ofc. Pete Bramlett waving both arms at you from the bridge like you\'re a plane he\'s landing.'],
      ['bramlett', 'YOU\'RE the cadet! Bramlett! Pete! Born on this river, raised on this river, will probably be buried in this river. Welcome to Riverside! Nothing happens here! Until it does!'],
      ['bramlett', 'Okay, real stuff. Whitfield wants you to know three things. One, the river\'s up. Two, Mrs. Benoit on Willow didn\'t wave at the crossing guard this morning. Three, there\'s a gray sedan at the marina at night. That last one\'s from me. He doesn\'t know I noticed.'],
      ['choice', [{ t: 'Ask him what he noticed about the sedan', set: 'bramSedan', reply: [['bramlett', 'Parks under the one broken light. Every time. Lights off, engine on. A guy who knows exactly where the camera doesn\'t reach. That\'s not a tourist.']] },
        { t: 'Ask why nothing happens until it does', set: 'bramRiver', reply: [['bramlett', 'The river. It\'s calm for eleven months. Then one night it comes up nine feet and you learn who your neighbors are. Same with people.']] }], 'Ofc. Bramlett'],
      ['whitfield', '(on the radio) Bramlett. Inside voice.']] } ] },
  '2|Ask Captain Hal about the river': { pos: 'start', scenes: [
    { at: 'Riverside School', who: 'johnson', goal: 'Stop by Ms. Johnson\'s crossing at Riverside School', say: [
      ['narr', 'Riverside School, 7:45. Ms. Johnson in her orange vest, stop sign up, a river of kids flowing across in front of her.'],
      ['johnson', 'Mrs. Benoit called me from the hospital. On the hospital phone. She wanted me to know she\'s going to be "back on her porch by Thanksgiving, waving like a fool."'],
      ['johnson', 'You know how many people walk past a house with three newspapers on the porch? I\'ve thought about that all week. You don\'t walk past. Neither does Toby. That\'s the whole city, right there.'],
      ['narr', 'A boy runs up and hugs her around the vest without stopping. She doesn\'t miss a car.'],
      ['johnson', 'You go find who\'s selling stolen TVs. I\'ll be right here, watching the cars. Somebody has to watch the cars.'],
      ['johnson', 'She asked about you. The officer who went in. She said, "Tell him the bathroom door\'s still broken and I don\'t care."', { if: 'benoitForce' }],
      ['johnson', 'She asked about you. She said the four minutes felt like an hour, but she knows you were scared too.', { if: 'benoitWait' }]] } ] },
  '3|Meet Castillo at the Industrial Park Substation': { pos: 'start', scenes: [
    { at: 'The Lunch Pail', who: 'castillo', goal: 'Breakfast with Castillo at The Lunch Pail', say: [
      ['narr', 'Five a.m., Industrial Park. The Lunch Pail truck is the only light on the block. Castillo orders two breakfast tacos without asking what you want. She\'s right about what you want.'],
      ['castillo', 'My training officer was a woman named Gwen Pardo. Twenty-six years on. She never raised her voice. She used to say, "The job is mostly listening, and the rest is paperwork."'],
      ['castillo', 'She died the year I made sergeant. At her funeral, a man stood up and said she arrested him in 1989 and it was the best thing that ever happened to him.'],
      ['castillo', 'I think about that every time I write a report. Somebody might stand up at my funeral. I want them to have something true to say.'],
      ['choice', [{ t: 'Ask what she\'d want them to say', set: 'castilloSay', reply: [['castillo', '"She was fair, and she stayed." That\'s it. Five words. I\'m working on the "stayed."']] },
        { t: 'Ask what Gwen would think of this case', set: 'castilloInes', reply: [['castillo', 'She\'d say, "Dana, it\'s personal, so be twice as careful." So that\'s what I\'m doing. Twice as careful. Even if it\'s slower.']] }], 'Castillo'],
      ['narr', 'Lupe slides two coffees out the window. "On the house," she says. Castillo puts two dollars in the tip jar anyway. She always does.']] } ] },
  '3|Search Lock-It Storage by the book#2': { pos: 'end', scenes: [
    { at: 'Eastline Rail Yard', who: 'carrasco', goal: 'Walk the rail yard with Ofc. Carrasco', say: [
      ['narr', 'Dusk at Eastline Rail Yard. Rows of boxcars, long shadows, the smell of creosote. Ofc. Luz Carrasco walks it like a living room she grew up in.'],
      ['carrasco', 'I worked this yard eight years. Switch operator. Before the badge.'],
      ['carrasco', 'Every row looks the same at night. That\'s the trap. People run in here and get lost.'],
      ['carrasco', 'Officers too. Don\'t chase in here. Ever. Hold the edges. Let the yard keep him.'],
      ['choice', [{ t: 'Ask her to show you the ways out', set: 'carrascoExits', reply: [['carrasco', 'Three. North gate, the spur, the drainage culvert. Nobody remembers the culvert.'], ['narr', 'You write all three down. She watches you write. She nods once.']] },
        { t: 'Ask why she left the railroad', set: 'carrascoWhy', reply: [['carrasco', 'A kid grabbed a ladder on the spur. Fourteen. Nate Bell. Lost his leg. I saw it.'], ['carrasco', 'I wanted to be the one who keeps kids off the spur.'], ['carrasco', 'That\'s the job. Keeping people off the spur.']] }], 'Ofc. Carrasco'],
      ['carrasco', 'Okay, cadet. Maybe you\'re one of the ones who listens. We\'ll see.']] } ] },
  // ---------- Chapter 1, First Watch: two more scenes (Pike in the locker room; Dot at the Night Owl) ----------
  '0|Walk to Founders Plaza and meet the locals': { pos: 'end', scenes: [
    { at: 'Patrol HQ', who: 'pike', inside: true, goal: 'Gear up with Cadet Pike in the HQ locker room', say: [
      ['narr', 'The HQ locker room smells like gun oil and burnt coffee. Cadet Pike is standing on a bench, trying to read the duty roster taped above the lockers.'],
      ['pike', 'You\'re with Castillo? On day one? I got Records. I got a chair. A chair, and a man named Gary who eats tuna at his desk.'],
      ['pike', 'Okay, real talk. Castillo flunked three cadets last year. Three. One of them cried in the parking lot. It was me. I\'m the one who cried. I came back.'],
      ['narr', 'He hops down and straightens the name plate on your locker, which was already straight.'],
      ['choice', [{ t: 'Ask him what she flunked him for', set: 'pikeFlunk', reply: [['pike', 'I ran a plate before I told dispatch where I was. She said, "If something happens to you, nobody knows where to start looking." I think about that every day.']] },
        { t: 'Tell him you\'re glad he came back', set: 'pikeBack', reply: [['pike', '...Yeah? Okay. Okay, cool. Don\'t tell anybody I got emotional in the locker room. Again.']] }], 'Cadet Pike'],
      ['pike', 'Hey. Cover me out there? Not like, with a gun. Just, like, in life.']] } ] },
  '0|Run the partial plate at Records': { pos: 'end', scenes: [
    { at: 'Night Owl Diner', who: 'dot', goal: 'Stop at the Night Owl Diner on your way back', say: [
      ['narr', 'One a.m. The Night Owl. Mr. Abernathy on stool six with his crossword, a cook singing along to the radio, and Dot refilling a coffee nobody asked for.'],
      ['dot', 'Hon, you look like Castillo had you out on the plaza. She brings all her cadets here after. She says it\'s for the coffee. It\'s for me.'],
      ['dot', 'Funny you\'d come tonight. A man was in here an hour ago. White shirt, dark tie, sunglasses. At midnight. Ordered black coffee and left a fifty.'],
      ['dot', 'He asked me what time the last bus leaves Founders Plaza. Then he asked if Mr. Delgado still walks home the same way. Why would a stranger know Mr. Delgado walks home?'],
      ['choice', [{ t: 'Write down everything she remembers, word for word', set: 'dotNotes', reply: [['dot', 'Word for word? Nobody ever wants it word for word. Okay. "Does the hot dog man still walk home past the bank." That\'s exactly how he said it.'], ['narr', 'You write it down. Your hand is steadier than you feel.']] },
        { t: 'Ask her to call you if he comes back', set: 'dotCall', reply: [['dot', 'Call you? Hon, I\'ll call Velvet and Velvet will call everybody. That\'s how the night shift works.'], ['velvet', '(on the radio) Already noted, sugar. Night Owl, gray sedan, sunglasses. Every car in Central will know by two.']] }], 'Dot'],
      ['narr', 'Mr. Abernathy looks up from his crossword. "Fourteen down," he says to nobody. "Eight letters. Watching." He writes it in pen.']] } ] },

  // ---------- Chapter 2, Where the Car Came From: Vargas's roll call; a canvass with Duarte ----------
  '1|Ask around at Big Earl\'s Auto': { pos: 'start', scenes: [
    { at: 'Substation', who: 'vargas', inside: true, goal: 'Meet Sgt. Vargas at the Eastside Substation', say: [
      ['narr', 'The Eastside substation is louder than HQ. A radio plays salsa in the break room. On the wall behind the sergeant\'s desk, a whiteboard says WINS in red, with forty-one tally marks under it.'],
      ['vargas', 'You\'re Castillo\'s! Welcome to Eastside, where we don\'t have time for drama because we have too much drama. I\'m Vargas. Teddy if you bring donuts.'],
      ['vargas', 'That board? Every time somebody on this shift does something good that nobody saw, it goes up there. Somebody changed a tire for a grandma in the rain. A WIN. Somebody talked a kid off a roof. A WIN.'],
      ['vargas', 'Castillo tells me you\'re hunting a gray sedan. Eastside knows cars. Earl knows them better. Go see Earl. Bring him a coffee or he\'ll talk for an hour. He\'ll talk for an hour anyway.'],
      ['choice', [{ t: 'Ask him what the forty-first win was', set: 'vargasWin', reply: [['vargas', 'Duarte. Last week. Old man lost his wife\'s ashes on the bus. She rode the route twice and found them under a seat. He hugged her for a full minute. A WIN.']] },
        { t: 'Ask what it takes to get a mark on the board', set: 'vargasBoard', reply: [['vargas', 'Easy. Do the job right when nobody\'s grading you. That\'s the whole trick. Most people only do it right when somebody\'s grading.']] }], 'Sgt. Vargas'],
      ['duarte', '(on the radio) Duarte. If he\'s telling the ashes story again, tell him it was a cookie tin. The ashes were in a cookie tin.']] } ] },
  '1|Report back to Castillo at the Substation': { pos: 'start', scenes: [
    { at: 'Birch Lane', who: 'duarte', goal: 'Canvass Birch Lane with Cpl. Duarte', say: [
      ['narr', 'Dusk on Birch Lane. Porch lights coming on one by one. Cpl. Ana Duarte walks the street the way some people read: slowly, every line.'],
      ['duarte', 'Knock, step back, hands where they can see them. Say your name first. Then say why you\'re there. People open up to a name.'],
      ['narr', 'Third house. An old man in a cardigan, Mr. Lewis, holding a dish towel. He saw the gray sedan twice last week. Both times it stopped in front of the Ortega house on Maple. Rosa\'s house.'],
      ['duarte', 'Rosa\'s grandson. The bracelet. The car out front. You see the shape of it?'],
      ['choice', [{ t: 'Say what the facts show, and nothing more', set: 'duarteFacts', reply: [['duarte', 'Good. The car stopped at his grandma\'s house. That\'s a fact. Why it stopped is a question. Keep them in separate boxes.']] },
        { t: 'Say it looks like Danny is working for Vic', set: 'duarteGuess', reply: [['duarte', 'Maybe. Or Vic is watching the family because Danny ran from him. Same facts. Two stories. Write the facts, carry the questions.']] }], 'Cpl. Duarte'],
      ['duarte', 'Mr. Lewis gave you a full description and his porch light stays on tonight. That goes on Vargas\'s board.'],
      ['vargas', '(on the radio) Vargas. Forty-two. That one\'s yours. Don\'t let it go to your head. Let it go to your heart.', { if: 'vargasWin' }],
      ['vargas', '(on the radio) Vargas. Nobody was grading you on Birch Lane, and you did it right. Forty-two. That\'s how you get on the board.', { if: 'vargasBoard' }],
      ['narr', 'Half a block down, a gray sedan turns the corner slowly, signals, and is gone before either of you can read the plate.']] } ] },

  // ---------- Chapter 3, Everything Has a Serial Number: the welfare check; the river with Whitfield ----------
  '2|Check the pawn records at River Pawn': { pos: 'start', scenes: [
    { at: 'Willow Street', who: 'toby', goal: 'Do the welfare check on Mrs. Benoit on Willow Street', say: [
      ['narr', 'Willow Street, mid-morning. Three newspapers on the porch, still in their sleeves. The mailbox is full. Toby the mail carrier is waiting on the sidewalk with his bag clutched to his chest.'],
      ['toby', 'I knocked. Nothing. She always waves from the window at 10:40. Always. Ten years.'],
      ['narr', 'You knock, announce yourself, and wait. Then you hear it: from somewhere inside, very faint, a voice. "...Hello? ...Help."'],
      ['castillo', '(on the radio) What do you have, cadet? Tell me what you know and what you\'re going to do.'],
      ['choice', [{ t: 'Force entry now. Someone inside is calling for help', set: 'benoitForce', reply: [['narr', 'You radio it in, put your shoulder into the back door, and it gives on the second try. Mrs. Benoit is on the bathroom floor where she slipped getting out of the tub on Saturday, dry-lipped and furious about it.'], ['castillo', '(on the radio) Someone calling for help is all the reason you need. Rescue is two minutes out. Stay with her.']] },
        { t: 'Wait for Toby to find the neighbor with a key', set: 'benoitWait', reply: [['narr', 'Toby runs. Four minutes. The neighbor has a key. Mrs. Benoit is on the bathroom floor where she slipped getting out of the tub on Saturday. Four minutes is a long time on a bathroom floor.'], ['castillo', '(on the radio) A voice calling for help inside is an emergency. You don\'t need a key for that. Next time, you go in.']] }], 'Willow Street'],
      ['benoit', 'Two days. I counted the ceiling tiles. Forty-one. Somebody painted one of them blue in 1974. That was my husband. He thought it was funny.'],
      ['benoit', 'Young man with the mail. You came back. You knocked. That\'s why I\'m alive. Write that down somewhere.'],
      ['johnson', '(on the radio) She slipped in the tub? Since Saturday? Oh, Lord. ...Thank you for going in. Most people knock once and leave.']] } ] },
  '2|Report back to Castillo': { pos: 'start', scenes: [
    { at: 'Riverside Marina', who: 'whitfield', goal: 'Take the river boat out with Sgt. Whitfield', say: [
      ['narr', 'Sgt. Ray Whitfield runs the Riverside boat like it\'s part of his body. He doesn\'t talk much. He points.'],
      ['whitfield', 'Benoit door. You went in. Right call.', { if: 'benoitForce' }],
      ['whitfield', 'Benoit. Four minutes. Don\'t wait next time.', { if: 'benoitWait' }],
      ['whitfield', 'Slip nine. Lassiter\'s boat.'],
      ['narr', 'From the water you can see what you couldn\'t from the dock: the boat sits too low. Weight in the hull. A lot of it. And a fresh scrape along the stern where something heavy was dragged aboard.'],
      ['whitfield', 'Boat that never leaves. Sitting heavy. Means storage.'],
      ['choice', [{ t: 'Photograph it from the water and note the time', set: 'riverPhoto', reply: [['whitfield', 'Good. Public water. Plain view. Use it.']] },
        { t: 'Ask if you can climb aboard and look', set: 'riverBoard', reply: [['whitfield', 'No. No warrant. Private boat.'], ['whitfield', 'Look from here. Write what you see.']] }], 'Sgt. Whitfield'],
      ['whitfield', 'Pulled three families off roofs in \'04. From this boat.'],
      ['whitfield', 'Bramlett told you nothing happens till it does. He\'s right. Once.', { if: 'bramRiver' }],
      ['whitfield', 'River gives back everything. Takes its time.'],
      ['narr', 'That\'s the most he says all day. On the way in, he lets you take the wheel for the last hundred yards and doesn\'t comment on your docking, which you will later learn is the highest compliment he gives.']] } ] },

  // ---------- Chapter 4, Clear Every Corner: Saito's plan; Rosa at the substation; Castillo and the photo ----------
  '3|Search Lock-It Storage by the book': { pos: 'start', scenes: [
    { at: 'Substation', who: 'saito', inside: true, goal: 'Brief with Sgt. Saito at the Substation', say: [
      ['narr', 'Sgt. June Saito has drawn Lock-It Storage on a whiteboard from memory: every row, every gate, the fence line, the rail yard behind it.'],
      ['saito', 'Pried unit. Suspect may be close. Rail yard behind. Bad combination.'],
      ['saito', 'Two ways in. One way out, unless you count the fence. Somebody always counts the fence.'],
      ['saito', 'Whitfield sent your photos of slip nine. Plain view, timed. Clean.', { if: 'riverPhoto' }],
      ['saito', 'Whitfield says you wanted to board a boat without a warrant. Don\'t.', { if: 'riverBoard' }],
      ['saito', 'Where do you want me?'],
      ['choice', [{ t: 'On the fence line facing the rail yard', set: 'saitoFence', reply: [['saito', 'Good. That\'s where I\'d run. I\'ll be there.']] },
        { t: 'At the front gate with Carl', set: 'saitoGate', reply: [['saito', 'Fine. Then nobody covers the fence. Remember you chose that.']] }], 'Sgt. Saito'],
      ['carrasco', '(on the radio) Carrasco. I\'m on the rail side either way. I\'ve chased people through that yard. The yard always wins.']] } ] },
  '3|Report back to Castillo': { pos: 'end', scenes: [
    { at: 'Substation', who: 'rosa', goal: 'Rosa is waiting at the Industrial Park Substation', say: [
      ['narr', 'Rosa is in the lobby of the substation in her bodega apron, holding a foil tray of pastelitos with both hands like a shield. She drove across the city at midnight.'],
      ['rosa', 'Where is he? Is he hurt? Mijo, tell me he isn\'t hurt.'],
      ['narr', 'Danny is in the interview room, with the door open. He hears her voice and stands up so fast the chair falls over.'],
      ['choice', [{ t: 'Let her see him for a minute before the interview', set: 'rosaSee', reply: [['narr', 'She doesn\'t say anything. She holds his face in both hands, the way you hold something you thought was broken.'], ['danny', 'I\'m sorry, Abuela. I\'m so sorry.'], ['rosa', 'You\'re here. Sorry is for later. Eat a pastelito.']] },
        { t: 'Tell her she can see him after his statement', set: 'rosaWait', reply: [['rosa', 'After. Okay. Okay. I\'ve waited a month. I can wait an hour.'], ['narr', 'She sits on the lobby bench with the tray on her knees. She doesn\'t eat. When the interview ends at two, she\'s still holding it.']] }], 'Rosa'],
      ['saito', 'He came over the fence exactly where I stood. Good call.', { if: 'saitoFence' }],
      ['saito', 'He went over the fence. Nobody there. Pike caught him. Luck, not plan.', { if: 'saitoGate' }],
      ['saito', 'Duarte called. Says you keep facts and questions apart. Keep doing it.', { if: 'duarteFacts' }],
      ['carrasco', '(on the radio) He tried the culvert. You wrote it down. He came out right into Pike.', { if: 'carrascoExits' }],
      ['carrasco', '(on the radio) Nobody got hurt on the spur tonight. That\'s the job. Okay, cadet. You listen.', { if: 'carrascoWhy' }],
      ['saito', 'Duarte called. Says you guessed Danny worked for Vic. He did. He also ran from him. Both true.', { if: 'duarteGuess' }],
      ['saito', 'Family in the lobby. Kid in the room. Do it gently. Do it right.']] },
    { at: 'Substation', who: 'danny', inside: true, goal: 'Sit in on Danny\'s statement at the Substation', say: [
      ['narr', 'The interview room. A table, three chairs, a box of tissues nobody touches. Danny with his hands flat on the table to keep them still.'],
      ['danny', 'The car accident. March. I wasn\'t drinking. Somebody ran a light. I was in the hospital nine days. No insurance. Forty-one thousand dollars.'],
      ['danny', 'Vic paid it. All of it. He came to my room with flowers. He said, "You can pay me back by driving." I thought he meant like a job.'],
      ['danny', 'He knew exactly what it cost and exactly who couldn\'t pay it. That\'s how he does it. He finds the bill first.'],
      ['choice', [{ t: 'Tell him honestly that telling the truth may help, but you can\'t promise anything', set: 'dannyHonest', reply: [['danny', 'No promises. Okay. That\'s the first thing anybody\'s said to me in a month that I believe.']] },
        { t: 'Promise him he won\'t be charged if he talks', set: 'dannyPromise', reply: [['saito', '(at the door) Cadet. Hallway. Now.'], ['saito', 'You can\'t promise that. Only the prosecutor can. Don\'t ever promise what isn\'t yours to give.'], ['narr', 'You go back in and tell Danny the truth: you can\'t promise. He looks at you like the floor moved. Then he keeps talking anyway.']] }], 'Danny'],
      ['danny', 'Tell my grandma I\'m sorry. Tell her I\'m going to say it myself, too. I just need you to say it first, so it\'s already out there.']] },
    { at: 'Lock-It Storage', who: 'castillo', goal: 'Find Castillo in the car outside Lock-It Storage', say: [
      ['narr', 'Three a.m. The Lock-It lot is empty except for the patrol car. The dome light is on. Castillo is in the driver\'s seat with the academy photo in her lap, in its evidence sleeve.'],
      ['castillo', 'Sit down. I\'m not going to talk about it. I just don\'t want to sit here alone.'],
      ['beat', { ms: 1600 }],
      ['castillo', 'We used to split a pizza every Friday. Pepperoni on his half. He picked the mushrooms off mine because he thought I didn\'t like them. I liked them.'],
      ['castillo', 'Week nine he slid the answers under my door. I could have thrown them away and said nothing. I reported him. Both things were true. I was his friend, and I reported him.'],
      ['choice', [{ t: 'Say nothing, and stay', set: 'photoStay', reply: [['narr', 'You sit. The dome light hums. After a while she turns it off, and you both watch the rail yard lights blink in the dark.']] },
        { t: 'Tell her you would have done the same', set: 'photoSame', reply: [['castillo', 'I hope you never have to find out. Most people don\'t. You might.'], ['castillo', 'If you do, do it the same way. Then go sit in a car with somebody.']] }], 'Castillo'],
      ['castillo', 'Okay. Tomorrow we go to Justice Row. Go home. Sleep. That\'s an order, and it\'s the nicest one I\'ll give you.']] } ] },

  // ---------- Chapter 5, By the Book: first appearance ----------
  '4|Meet everyone at Justice Plaza': { pos: 'start', scenes: [
    { at: 'County Courthouse', who: 'moreau', goal: 'Sit in on Lassiter\'s first appearance', say: [
      ['narr', 'Courtroom 2A, two p.m. Sgt. Celeste Moreau sits beside you in the gallery with her hands folded and her reading glasses on, as if she is about to grade the room.'],
      ['narr', 'Lassiter comes in through the side door in a county jumpsuit. He looks smaller in it. He finds the gallery with his eyes, then finds Theresa in the second row, and stops.'],
      ['moreau', 'Watch his lawyer. She will read your arrest report out loud and look for a word she can pull on. Every word you wrote is about to be weighed.'],
      ['narr', 'The defense reads it line by line. The coffee. The courthouse. The search, twice. The card he offered, and what was folded inside it. She reaches the last line and puts it down without a word.'],
      ['moreau', 'She found nothing to pull on. That is the best review you will ever get, and nobody will say it out loud.'],
      ['narr', 'Bond is set high. As the deputy leads him out, Lassiter passes the rail and says, very quietly, to his sister: "Tell Dana it was a good report." Theresa nods. She doesn\'t cry until the door closes.'],
      ['theresa', '(in the hallway, to you) He meant it. He never says that about anything.', { if: 'theresaHonest' }],
      ['theresa', '(in the hallway, to you) I gave my statement. He knows. He looked at me like he was proud of me. I don\'t know what to do with that.', { if: 'theresaStatement' }]] } ] }
};
for (const key in MAIN_MORE) { const m = MAIN_MORE[key], k = key.split('#')[0], cur = MAIN_PRE[k] || []; MAIN_PRE[k] = m.pos === 'start' ? m.scenes.concat(cur) : cur.concat(m.scenes); } // 'key#2' adds a second batch to the same step
