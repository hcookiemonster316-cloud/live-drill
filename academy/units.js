// Specialty units are earned, the way you join a guild. Every cadet starts in Patrol. Each unit has a lead who
// notices you once you meet their bar: a rank, a clean enough file (your standing, from conduct.js), and something
// the unit cares about that only the street can show (priority calls for SWAT, the talk-it-through way for the
// negotiators, facts learned for the detectives). Then the lead's two quests, which play out in their district, and a
// tryout: three questions from the unit's subjects and one call to make. Pass and you're in. Do exceptionally well
// (spotless standing, the best call on both quests, far past the bar) and the lead skips the tryout: you're being
// moved. Once accepted, you can switch freely between the units you've earned, from the career board.
// Loop: drive the city and take calls (the bar fills) -> the lead's quests (choose how to handle them) -> the tryout
// -> the city remembers (the unit is yours) -> your career grows. Reads standing (conduct.js), rank, stats and facts;
// writes into the side-case engine (the quests are side cases) and the unit picker.

// the leads: one per unit, each waiting in their own district
export const UNIT_CAST = {
  swatkeel: { name: 'Lt. Rhonda Keel', icon: '🛡️', role: 'SWAT team leader' },
  k9font: { name: 'Sgt. Abel Fontaine', icon: '🐕', role: 'K9 unit supervisor' },
  negvale: { name: 'Lt. Simone Vale', icon: '📞', role: 'Crisis negotiation team' },
  marmercer: { name: 'Sgt. Dale Ashby', icon: '⚓', role: 'Marine unit' },
  brtdrake: { name: 'Tamsin Drake', icon: '🤝', role: 'Behavioral resource coordinator' },
  hoimoss: { name: 'Ofc. Calvin Reddick', icon: '🏠', role: 'Homeless outreach' },
  detrourke: { name: 'Det. Sgt. Ivy Rourke', icon: '🔎', role: 'Detective bureau' },
  sropak: { name: 'Ofc. Lorraine Pak', icon: '🎓', role: 'School resource officers' },
  iacroft: { name: 'Lt. Adele Croft', icon: '🗂️', role: 'Internal Affairs' },
  unionrep: { name: 'Sgt. Ruth Ann Lacombe', icon: '🤝', role: 'Union representative' }
};

// what each unit asks for. need: [label, value(H), target]. rank is an index into RANKS.
export const UNIT_REQ = {
  swat: { lead: 'swatkeel', d: 3, rank: 3, standing: 70, need: [['Priority 1 calls cleared', (H) => H.stat('p1'), 6], ['Calls cleared', (H) => H.S.calls || 0, 30]] },
  k9: { lead: 'k9font', d: 2, rank: 2, standing: 65, need: [['Times you looked it over first', (H) => H.way('observe'), 10], ['Calls cleared', (H) => H.S.calls || 0, 20]] },
  neg: { lead: 'negvale', d: 4, rank: 3, standing: 75, need: [['Times you talked it through', (H) => H.way('talk'), 15], ['Highest district trust', (H) => H.bestTrust(), 70]] },
  marine: { lead: 'marmercer', d: 2, rank: 2, standing: 60, need: [['Riverside trust', (H) => H.trust(2), 60], ['Calls cleared', (H) => H.S.calls || 0, 15]] },
  brt: { lead: 'brtdrake', d: 0, rank: 2, standing: 75, need: [['Times you talked it through', (H) => H.way('talk'), 12], ['People helped', (H) => H.stat('helped'), 10]] },
  hoi: { lead: 'hoimoss', d: 1, rank: 1, standing: 65, need: [['People helped', (H) => H.stat('helped'), 15], ['Eastside trust', (H) => H.trust(1), 55]] },
  det: { lead: 'detrourke', d: 4, rank: 3, standing: 75, need: [['Facts learned', (H) => H.facts(), 60], ['Times you looked it over first', (H) => H.way('observe'), 10]] },
  sro: { lead: 'sropak', d: 1, rank: 2, standing: 70, need: [['Facts learned', (H) => H.facts(), 40], ['Lessons mastered', (H) => H.mastered(), 2]] }
};

// two quests per unit. They're side cases (the same engine, journal and markers), opened by the unit's bar.
const Q = (unit, n, d, title, at, blurb, offer, steps) => ({ id: 'unit_' + unit + n, unit, un: n, d, title, giver: UNIT_REQ[unit].lead, giverAt: at, req: [d, 0], blurb, offer, steps, reward: { rp: 150, loot: n === 2 ? 'r' : 'u' } });
const best = (t, unit, n, reply) => ({ t, set: 'u_' + unit + n, trust: 1, reply });
export const UNIT_QUESTS = [
  Q('swat', 1, 3, 'Slow Is Smooth', 'Coastline Freight', 'Lt. Keel wants to see how you move before she wastes a tryout on you.',
    [['swatkeel', 'You\'re the cadet who keeps clearing priority calls without getting anybody hurt. I\'ve been reading your reports.'], ['swatkeel', 'SWAT isn\'t about kicking doors. It\'s about patience. Come walk the warehouse with me.']],
    [{ at: 'Coastline Freight', who: 'swatkeel', goal: 'Walk the training warehouse with Lt. Keel', say: [['swatkeel', 'Four of us are stacked at this door. Someone inside may be armed. How do we go in?'],
      ['choice', [best('Wait for the whole stack, and go in on the count', 'swat', 1, [['swatkeel', 'Right. Together, on the count. Nobody\'s a hero alone in a doorway.']]),
        { t: 'Go in first and fast, before they\'re ready', reply: [['swatkeel', 'Fast and alone is how people end up in reports I have to read at funerals.']] },
        { t: 'Throw the door open and wait for them to come out', reply: [['swatkeel', 'Now they know exactly where we are, and we don\'t know where they are.']] }], 'The stack is waiting on you.']], quiz: { les: 10, n: 1 } },
     { at: 'storage', who: 'carl', goal: 'Help Night Guard Carl with a pried door at the storage units', say: [['carl', 'Unit 22. Pried open, light on inside. I didn\'t go in. I waited, like I always do.'],
      ['choice', [best('Set a perimeter and wait for a second unit', 'swat', 1, [['swatkeel', '(over the radio) Perimeter first. Keel would\'ve done the same. I am Keel.']]),
        { t: 'Go in alone while it\'s quiet', reply: [['carl', 'Kid. Come on. Wait for your people.']] }], 'The door is open a few inches.']], quiz: { les: 11, n: 1 } }]),
  Q('swat', 2, 3, 'The Long Wait', 'Coastline Freight', 'A man has locked himself in a truck cab at the truck stop. Keel wants you on the perimeter.',
    [['swatkeel', 'Barricaded subject at the truck stop. Not armed that we know of. You\'re with me. You do nothing fast.']],
    [{ at: 'Big Rig Truck Stop', who: 'dee', goal: 'Talk to Trucker Dee at the truck stop', say: [['dee', 'He\'s my co-driver. He got bad news on the phone and locked himself in. He\'s not dangerous. He\'s scared.'],
      ['choice', [best('Hold the perimeter and let the negotiator talk', 'swat', 2, [['swatkeel', 'Good. Time is on our side. It almost always is.']]),
        { t: 'Break the window and pull him out', reply: [['swatkeel', 'And if he panics and hurts himself, that\'s on us. We wait.']] }], 'He\'s been in there an hour.']], quiz: { les: 10, n: 1 } },
     { at: 'Coastline Freight', who: 'swatkeel', goal: 'Debrief with Lt. Keel at Coastline Freight', say: [['swatkeel', 'Four hours. He came out on his own and asked for coffee. Nobody touched a weapon.'], ['swatkeel', 'That\'s a good day in this unit. If that sounds boring to you, this isn\'t your team.']], quiz: { les: 4, n: 1 } }]),

  Q('k9', 1, 2, 'Nose First', 'Riverwalk', 'Sgt. Fontaine wants to see how you treat a dog before you ever handle one.',
    [['k9font', 'You notice things. Ten times now you looked before you talked. My dog does that too.'], ['k9font', 'Before I let you near a partner with four legs, I want to see how you take care of one.']],
    [{ at: 'Riverwalk', who: 'k9font', goal: 'Walk the Riverwalk with Sgt. Fontaine and Bosco', say: [['k9font', 'It\'s ninety-four degrees. Bosco\'s been working an hour. You\'re his handler. What now?'],
      ['choice', [best('Shade, water, and a break before anything else', 'k9', 1, [['k9font', 'Right. A dog won\'t tell you he\'s overheating until it\'s an emergency.']]),
        { t: 'Keep working, he looks fine', reply: [['k9font', 'He always looks fine. That\'s the problem.']] },
        { t: 'Leave him in the car with the engine running', reply: [['k9font', 'And if the engine dies? Never trust a car with a dog\'s life.']] }], 'Bosco is panting hard.']], quiz: { les: 9, n: 1 } },
     { at: 'Riverside Feed & Seed', who: 'k9font', goal: 'Pick up Bosco\'s food at the Feed & Seed', say: [['k9font', 'Same food, same time, same bowl. A working dog does better when the rest of his life is boring.'], ['k9font', 'Most handlers spend more on the dog than they do on themselves. Including me. Especially me.']], quiz: { les: 1, n: 1 } }]),
  Q('k9', 2, 2, 'The Track', 'Riverwalk', 'A child wandered off near Cypress Hammock. Bosco has the scent.',
    [['k9font', 'Seven-year-old, last seen at Heron Point an hour ago. Bosco has his shirt. You run the scene behind us.']],
    [{ at: 'Heron Point', who: 'k9font', goal: 'Keep the family back while Bosco takes the scent at Heron Point', say: [['k9font', 'Everybody wants to help. Every person who walks the yard leaves a scent Bosco has to sort through.'],
      ['choice', [best('Keep everyone back and get the boy\'s last path from the parents', 'k9', 2, [['k9font', 'That\'s it. A clean start is half the track.']]),
        { t: 'Let the neighbors spread out and search too', reply: [['k9font', 'Now there are forty trails. Bosco has to find the one that matters.']] }], 'Neighbors are already heading into the trees.']], quiz: { les: 8, n: 1 } },
     { at: 'Cypress Hammock', who: 'k9font', goal: 'Follow the track into Cypress Hammock', say: [['narr', 'Twenty minutes in, Bosco sits down hard next to a fallen cypress. The boy is curled up behind it, asleep, with mud on his sneakers.'], ['k9font', 'Good boy. Good boy. Cadet, call it in. And then go tell his mother. She should hear it from a person.']], quiz: { les: 9, n: 1 } }]),

  Q('neg', 1, 4, 'Listen Longer', 'Courtside Lofts', 'Lt. Vale says most cadets talk too much. She wants to know if you do.',
    [['negvale', 'Fifteen times you chose to slow down and talk. I noticed. Most cadets can\'t stand silence.'], ['negvale', 'Come with me. There\'s a man on the church steps who hasn\'t moved since noon.']],
    [{ at: 'Old Stone Church', who: 'negvale', goal: 'Sit with the man on the steps of the Old Stone Church', say: [['narr', 'He\'s in his fifties, holding a folded eviction notice. He doesn\'t look up.'], ['negvale', '(quietly) Your turn. One sentence. Make it count.'],
      ['choice', [best('"Sounds like today took something from you."', 'neg', 1, [['narr', 'He looks up for the first time. "Thirty years in that apartment." He starts talking.'], ['negvale', 'You named the feeling. Now he knows you heard him.']]),
        { t: '"Everything\'s going to be fine, sir."', reply: [['narr', 'He laughs, without anything funny in it, and looks back down.'], ['negvale', 'You don\'t know that. And he knows you don\'t.']] },
        { t: '"Sir, you need to move off the steps."', reply: [['narr', 'He stands, folds the notice smaller, and walks away without a word.'], ['negvale', 'He moved. We lost him anyway.']] }], 'He hasn\'t said a word.']], quiz: { les: 3, n: 1 } },
     { at: 'Courtside Lofts', who: 'negvale', goal: 'Talk it over with Lt. Vale', say: [['negvale', 'Nobody remembers what a negotiator says. They remember whether they felt heard.'], ['negvale', 'I\'ve talked people off bridges by asking about their dog. The dog is never the point.']], quiz: { les: 2, n: 1 } }]),
  Q('neg', 2, 4, 'The Phone', 'Courtside Lofts', 'A man has locked himself in the records office and will only talk on the phone.',
    [['negvale', 'Locked in the records office with a lighter and a box of his own court files. He won\'t open the door. He\'ll talk on the phone.']],
    [{ at: 'County Records Annex', who: 'negvale', goal: 'Take the phone at the County Records Annex', say: [['narr', 'The line clicks. "I\'m burning it. All of it. Twenty years of paper that says who I am."'],
      ['choice', [best('Ask him what the papers would say if they were fair', 'neg', 2, [['narr', 'A long pause. "That I did my time. That I\'m done." He keeps talking. The lighter goes back in his pocket.']]),
        { t: 'Tell him burning records is a felony', reply: [['narr', '"Then I\'ll be a felon twice." The line goes dead for a terrible minute before he calls back.']] }], 'He\'s holding the lighter.']], quiz: { les: 11, n: 1 } },
     { at: 'Clerk of Court', who: 'hattie', goal: 'Find out from Clerk Hattie what he was looking for', say: [['hattie', 'He wanted his record sealed. He qualified two years ago. Nobody told him. I can file it today.'], ['negvale', '(over the radio) He\'s coming out. Hattie, thank you. Cadet, that\'s the job. Find out what they actually need.']], quiz: { les: 3, n: 1 } }]),

  Q('marine', 1, 2, 'No Wake', 'Riverside Marina', 'Sgt. Ashby wants to know if you can read water the way you read a street.',
    [['marmercer', 'Riverside likes you. That matters on the water. Out there, people have to trust the boat with the lights.'], ['marmercer', 'Captain Hal says you know a no-wake zone when you see one. Let\'s find out.']],
    [{ at: 'Riverside Marina', who: 'hal', goal: 'Ride along with Captain Hal at the marina', say: [['hal', 'Jet ski kids again, full throttle past the docks. There\'s a family in a canoe right there.'],
      ['choice', [best('Come off plane, signal them over, and talk at idle', 'marine', 1, [['hal', 'Fifty years and I\'ve never seen a ticket teach as much as a calm talk at idle.']]),
        { t: 'Chase them down at full speed', reply: [['hal', 'Now there are two wakes heading for that canoe. Ours is bigger.']] }], 'The canoe is rocking.']], quiz: { les: 4, n: 1 } },
     { at: 'Hook, Line & Sinker', who: 'bobby', goal: 'Check the life jacket loaner station at the bait shop', say: [['bobby', 'Kids take the loaners and bring them back. Mostly. Somebody\'s been taking the small ones.'], ['marmercer', '(over the radio) Then we restock the small ones. A kid without a jacket is a body recovery waiting to happen.']], quiz: { les: 2, n: 1 } }]),
  Q('marine', 2, 2, 'Night Water', 'Riverside Marina', 'A jon boat flipped near the Riverwalk after dark.',
    [['marmercer', 'Jon boat flipped near the Riverwalk. Two fishermen, one in the water. You\'re on the boat with me.']],
    [{ at: 'Riverwalk', who: 'marmercer', goal: 'Reach the capsized boat off the Riverwalk', say: [['narr', 'One man clings to the hull. The other is swimming toward shore, slowing down.'],
      ['choice', [best('Throw the ring to the swimmer, keep the boat clear of the hull', 'marine', 2, [['marmercer', 'Reach, throw, row, go. You threw. That\'s exactly right.']]),
        { t: 'Jump in after the swimmer', reply: [['marmercer', 'Now I\'ve got three people in the water. Never go in first.']] }], 'The swimmer is slowing down.']], quiz: { les: 9, n: 1 } },
     { at: 'Riverside Marina', who: 'marmercer', goal: 'Bring them in to the marina', say: [['narr', 'Both men sit wrapped in blankets on the dock, shaking and alive.'], ['marmercer', 'Neither one wore a jacket. Both of them will for the rest of their lives.']], quiz: { les: 4, n: 1 } }]),

  Q('brt', 1, 0, 'Same Bench', 'Downtown Transit Center', 'Tamsin Drake wants to see what you do when nobody\'s committed a crime.',
    [['brtdrake', 'Half our calls aren\'t crimes. They\'re people having the worst day of their life in public.'], ['brtdrake', 'There\'s a woman on bench four who\'s been talking to someone who isn\'t there. Come with me.']],
    [{ at: 'Downtown Transit Center', who: 'brtdrake', goal: 'Sit with the woman on bench four', say: [['narr', 'She\'s calm, mostly, and keeps glancing at the empty seat beside her.'],
      ['choice', [best('Sit down, introduce yourself, and ask how she\'s doing', 'brt', 1, [['narr', 'She tells you her name is Joanne, and that she missed her bus to the clinic.'], ['brtdrake', 'And now we know what she needs. A ride to the clinic.']]),
        { t: 'Tell her she can\'t stay on the bench', reply: [['brtdrake', 'She can, actually. And now she won\'t talk to us.']] }], 'She hasn\'t noticed you yet.']], quiz: { les: 1, n: 1 } },
     { at: 'Central Library', who: 'okafor', goal: 'Ask Ms. Okafor about the library\'s resource desk', say: [['okafor', 'Every Tuesday a counselor sits at our back table. People come to us before they go anywhere else.'], ['brtdrake', '(over the radio) Write that down. Libraries are the best resource map in any city.']], quiz: { les: 0, n: 1 } }]),
  Q('brt', 2, 0, 'Follow-Up', 'Downtown Transit Center', 'Joanne missed her appointment again. Drake wants a follow-up visit.',
    [['brtdrake', 'The best BRT work happens on the second visit. Joanne\'s at Harbor View. Let\'s go see her.']],
    [{ at: 'Harbor View Apartments', who: 'brtdrake', goal: 'Visit Joanne at Harbor View Apartments', say: [['narr', 'Joanne opens the door a few inches. She remembers you.'],
      ['choice', [best('Ask what got in the way of the appointment', 'brt', 2, [['narr', '"The bus. The bus scares me. Too many people." Drake writes down the clinic\'s van service.']]),
        { t: 'Remind her the appointments are important', reply: [['narr', '"I know." The door closes a little more.']] }], 'She\'s holding the door half open.']], quiz: { les: 3, n: 1 } },
     { at: 'First Light Chapel', who: 'brtdrake', goal: 'Set up a ride with the chapel\'s volunteer drivers', say: [['brtdrake', 'Reverend Whitaker\'s volunteers drive people to appointments. One phone call and Joanne\'s covered for a month.'], ['brtdrake', 'No arrest. No report anyone will read. That\'s a perfect call in this unit.']], quiz: { les: 1, n: 1 } }]),

  Q('hoi', 1, 1, 'Names, Not Numbers', 'Eastside Community Center', 'Ofc. Reddick knows every person sleeping outside in Eastside by name. He wants you to start.',
    [['hoimoss', 'You\'ve helped fifteen people on this side of town. I asked around. Half of them remembered your name.'], ['hoimoss', 'This unit runs on that. The man by the pumps at the Fuel Depot. Learn his name.']],
    [{ at: 'Fuel Depot', who: 'hoimoss', goal: 'Meet the man by the pumps at the Fuel Depot', say: [['narr', 'He\'s asking customers for change. The clerk is watching you, waiting for you to move him along.'],
      ['choice', [best('Introduce yourself and ask what he needs today', 'hoi', 1, [['narr', 'His name is Lonnie. He needs a phone charger and a bus pass to the VA. Neither one is a crime.']]),
        { t: 'Tell him to move along before the clerk calls again', reply: [['hoimoss', 'He\'ll be at the next station in an hour. We just moved the problem.']] }], 'The clerk is watching.']], quiz: { les: 5, n: 1 } },
     { at: 'Rosa\'s Bodega', who: 'rosa', goal: 'Ask Rosa if Lonnie can charge his phone at the bodega', say: [['rosa', 'Lonnie? He\'s the one who carries my boxes when my back is bad. Of course he can charge his phone.'], ['hoimoss', '(over the radio) See? The neighborhood already knew him. We just hadn\'t asked.']], quiz: { les: 2, n: 1 } }]),
  Q('hoi', 2, 1, 'One Bed', 'Eastside Community Center', 'One shelter bed opened up tonight. There are three people who need it.',
    [['hoimoss', 'One bed at the church tonight. Three people need it. That\'s the job some nights.']],
    [{ at: 'Eastside Baptist Church', who: 'pastorj', goal: 'Talk to Pastor James about the open bed', say: [['pastorj', 'One bed. A veteran with a bad leg, a young woman with a baby, and Lonnie.'],
      ['choice', [best('Give the bed to the mother and child, and find the others a motel voucher', 'hoi', 2, [['pastorj', 'I have two vouchers in the drawer for nights like this. I was waiting for someone to ask.']]),
        { t: 'Give it to whoever asked first', reply: [['pastorj', 'Fair, maybe. But that baby is sleeping outside tonight.']] }], 'Three people, one bed.']], quiz: { les: 5, n: 1 } },
     { at: 'Eastgate Pines', who: 'hoimoss', goal: 'Check the camp at Eastgate Pines with Ofc. Reddick', say: [['hoimoss', 'Nobody here is in trouble. We\'re here to say we\'ll be back on Thursday with water and socks.'], ['hoimoss', 'Keep that promise every time and they\'ll call you before things go wrong, not after.']], quiz: { les: 1, n: 1 } }]),

  Q('det', 1, 4, 'Paper Trail', 'County Records Annex', 'Det. Sgt. Rourke has a fraud case with a paper problem. She wants fresh eyes.',
    [['detrourke', 'Sixty facts in your head and you look before you leap. That\'s most of what detectives do.'], ['detrourke', 'Somebody\'s been filing liens on houses they don\'t own. Come read paper with me.']],
    [{ at: 'County Records Annex', who: 'detrourke', goal: 'Read the lien filings with Det. Sgt. Rourke', say: [['detrourke', 'Eleven filings. Different names, different houses. What do they have in common?'],
      ['choice', [best('Compare the notary stamps and the filing times', 'det', 1, [['detrourke', 'Same notary, same Tuesday mornings. Now we have a person.']]),
        { t: 'Call every homeowner and ask who they suspect', reply: [['detrourke', 'And now the filer hears we\'re looking, from eleven different directions.']] }], 'The filings are spread across the table.']], quiz: { les: 0, n: 1 } },
     { at: 'Courthouse Newsstand', who: 'detrourke', goal: 'Watch the notary\'s booth from the newsstand', say: [['narr', 'At 9:10, a man in a gray suit walks up to the notary with a folder. He\'s on camera, and he\'s on Rourke\'s list.'], ['detrourke', 'We don\'t grab him. We write down what we saw, the time, the folder. The arrest can wait for the warrant.']], quiz: { les: 11, n: 1 } }]),
  Q('det', 2, 4, 'The Timeline', 'County Records Annex', 'The fraud case goes to the State Attorney. Your timeline has to hold.',
    [['detrourke', 'The State Attorney wants our timeline tomorrow. Every minute in it has to be something we can prove.']],
    [{ at: 'State Attorney\'s Office', who: 'detrourke', goal: 'Build the timeline at the State Attorney\'s Office', say: [['detrourke', 'There\'s a gap. Forty minutes we can\'t account for. The defense will drive a truck through it.'],
      ['choice', [best('Leave the gap in and say what you don\'t know', 'det', 2, [['detrourke', 'Good. A timeline with an honest gap holds. A timeline with a guess in it falls apart on the stand.']]),
        { t: 'Fill it in with what probably happened', reply: [['detrourke', 'Probably isn\'t evidence. Take it out.']] }], 'Forty minutes are missing.']], quiz: { les: 3, n: 1 } },
     { at: 'The Gavel Grill', who: 'detrourke', goal: 'Close it out over coffee at The Gavel Grill', say: [['detrourke', 'He took a plea this afternoon. Eleven families get their deeds back.'], ['detrourke', 'Nobody will ever know your name on this case. That\'s the job. If that bothers you, stay in patrol.']], quiz: { les: 0, n: 1 } }]),

  Q('sro', 1, 1, 'Hallway', 'Eastside Middle School', 'Ofc. Pak wants to see if kids talk to you.',
    [['sropak', 'You know the material. Forty facts, two lessons mastered. Now, can you explain any of it to a twelve-year-old?'], ['sropak', 'Lunch period. Walk the hallway with me. Don\'t lecture anybody.']],
    [{ at: 'Eastside Middle School', who: 'principal', goal: 'Walk the lunch hallway with Principal Holloway', say: [['principal', 'Two boys were about to fight by the lockers yesterday. Same two today. Everybody\'s watching to see what you do.'],
      ['choice', [best('Ask them about the game last night, and walk with them to lunch', 'sro', 1, [['narr', 'They argue about the game instead. By the cafeteria, they\'re arguing together.'], ['sropak', 'You gave them a way out that didn\'t cost them anything in front of their friends.']]),
        { t: 'Warn them both that fighting gets them arrested', reply: [['sropak', 'Now it\'s about not backing down in front of the cop. Great.']] }], 'Thirty kids are watching.']], quiz: { les: 6, n: 1 } },
     { at: 'Iron Will Boxing Gym', who: 'reyes', goal: 'Ask Coach Reyes about an after-school spot for the two boys', say: [['reyes', 'Send them both. Gloves on, they\'ll find out they like each other. Happens every time.'], ['sropak', '(over the radio) That\'s the whole job. Find the kids a better place to be at three o\'clock.']], quiz: { les: 5, n: 1 } }]),
  Q('sro', 2, 1, 'The Rumor', 'Eastside Middle School', 'A rumor is spreading that someone is bringing something dangerous to school.',
    [['sropak', 'A rumor about a threat. Probably nothing. We treat it like it\'s something until we know it\'s not.']],
    [{ at: 'Eastside Community Center', who: 'dez', goal: 'Ask Dez what the kids are saying at the community center', say: [['dez', 'Everybody\'s saying it\'s a kid named Wesley. But Wesley\'s like, the nicest kid. He just got bullied really bad last week.'],
      ['choice', [best('Ask Pak to have the threat team talk to Wesley and his family, quietly', 'sro', 2, [['sropak', 'Right. Not a takedown in front of the whole school. A conversation, with his parents, with help.']]),
        { t: 'Pull Wesley out of class in handcuffs to be safe', reply: [['sropak', 'And every kid who ever thought about telling us something just learned not to.']] }], 'The rumor has a name now.']], quiz: { les: 7, n: 1 } },
     { at: 'Eastside Middle School', who: 'sropak', goal: 'Meet Ofc. Pak after the threat team\'s visit', say: [['sropak', 'No weapon. Something to report, though: the bullying. That\'s being handled now too.'], ['sropak', 'Wesley said you were the first adult who asked him what was going on instead of what he did.']], quiz: { les: 6, n: 1 } }])
];

export function installUnits(H) {
  const S = H.S, esc = H.esc, UNITS = H.UNITS;
  const own = () => { S.units = S.units || { patrol: 1 }; S.units.patrol = 1; return S.units; };
  const trk = () => (S.utrack = S.utrack || {});
  const has = (u) => !!own()[u];
  // the bar for one unit: each line with where you stand
  function bar(u) {
    const R = UNIT_REQ[u]; if (!R) return null; const rows = [];
    const ri = H.rankIdx(); rows.push({ label: 'Rank: ' + H.rankName(R.rank) + ' or higher', v: ri, t: R.rank, ok: ri >= R.rank });
    const st = H.standing(); rows.push({ label: 'Standing', v: st, t: R.standing, ok: st >= R.standing });
    R.need.forEach(([label, f, t]) => { const v = f(H) || 0; rows.push({ label, v, t, ok: v >= t }); });
    rows.push({ label: 'District open: ' + H.districtName(R.d), v: H.unlocked(R.d) ? 1 : 0, t: 1, ok: H.unlocked(R.d) });
    return rows;
  }
  const barOk = (u) => { const b = bar(u); return !!b && b.every((r) => r.ok); };
  // the lead starts paying attention once your rank and standing are there; the rest is earned before the tryout
  // checked by the side-case list twice a second, so it reads three numbers instead of building the whole bar
  const noticed = (u) => { const R = UNIT_REQ[u]; return !!R && H.unlocked(R.d) && H.rankIdx() >= R.rank && H.standing() >= R.standing; };
  const qOf = (u, n) => UNIT_QUESTS.find((q) => q.unit === u && q.un === n);
  // where a unit stands for you: accepted, ready for tryout, on the quests, noticed, or not yet
  function stage(u) {
    if (has(u)) return 'in'; if (!UNIT_REQ[u]) return 'none';
    const q1 = qOf(u, 1), q2 = qOf(u, 2), d1 = H.sideClosed(q1), d2 = H.sideClosed(q2);
    if (d2) return barOk(u) ? 'tryout' : 'bar'; if (d1 || H.sideLive(q1) || H.sideLive(q2)) return 'quests'; return noticed(u) ? 'noticed' : 'locked';
  }
  // the quests open only when the lead has noticed you (side-case need)
  UNIT_QUESTS.forEach((q) => { q.need = () => !has(q.unit) && noticed(q.unit) && (q.un === 1 || H.sideClosed(qOf(q.unit, 1))); });

  // when a unit's second quest closes: an exceptional record means you're simply moved; otherwise the tryout is next
  function questDone(q) {
    if (!q || !q.unit || q.un !== 2) return; const u = q.unit, R = UNIT_REQ[u], fl = S.flags || {};
    const exceptional = H.standing() >= 88 && fl['u_' + u + '1'] && fl['u_' + u + '2'] && R.need.every(([, f, t]) => (f(H) || 0) >= t * 1.5) && H.rankIdx() >= R.rank;
    setTimeout(() => (exceptional ? transfer(u) : H.toast(UNITS.find((x) => x.id === u).icon + ' ' + H.who(R.lead).name + ' wants you for a tryout' + (barOk(u) ? '. Find them in ' + H.districtName(R.d) + ', or start it from your career board.' : ' once you meet the rest of the bar. Check your career board.'))), 2600);
  }
  // "you're being moved": no tryout
  function transfer(u) {
    const U = UNITS.find((x) => x.id === u), R = UNIT_REQ[u];
    H.dialogue([['narr', 'Castillo hands you a sealed envelope at roll call. Inside is a transfer order with your name on it.'], [R.lead, H.pick('xfer_' + u, ['I watched your file for a month. I don\'t need a tryout to know. You\'re being moved to ' + U.name + '.', 'Tryouts are for people I\'m not sure about. I\'m sure about you. Welcome to ' + U.name + '.'])], ['castillo', 'That doesn\'t happen often. Don\'t make her regret it.']],
      () => accept(u, true), { noLeave: true });
  }
  // the tryout: three questions from the unit's subjects, then one call. Two right and the right call passes.
  function tryout(u) {
    const U = UNITS.find((x) => x.id === u), R = UNIT_REQ[u], T = trk()[u] = trk()[u] || {};
    if (T.failSh != null && T.failSh === H.shiftNo()) { H.toast(H.who(R.lead).name + ': Not today. Come back next shift.'); return; }
    const qs = H.pickQs(U.fav, 3), call = TRYCALL[u];
    const lines = [['narr', U.icon + ' ' + U.name + ' tryout. ' + call.set], [R.lead, call.open]];
    qs.forEach((q) => lines.push(['q', q, R.lead]));
    let good = false; lines.push(['choice', call.opts.map((o, i) => ({ t: o[0], say: [['@you', o[1]]], reply: [[R.lead, o[2]]], fx: () => { good = i === 0; } })).sort(() => Math.random() - .5), call.q]);
    H.dialogue(lines, (res) => { const pass = res.right >= 2 && good; if (res.halted) return;
      if (pass) { H.dialogue([[R.lead, call.pass]], () => accept(u, false), { noLeave: true }); }
      else { T.failSh = H.shiftNo(); T.fails = (T.fails || 0) + 1; H.saveS(); H.dialogue([[R.lead, (good ? 'Good instincts. ' : 'That last call is the one that matters most in my unit. ') + (res.right < 2 ? 'And you need the fundamentals cold. ' : '') + 'Try again next shift.']], null, { noLeave: true }); } }, { kicker: 'TRYOUT · ' + U.name.toUpperCase() });
  }
  // the patch: in front of the squad at roll call, from the lead, with a word from your partner and from Castillo
  function accept(u, moved) {
    own()[u] = 1; trk()[u] = Object.assign(trk()[u] || {}, { at: Date.now(), moved: !!moved }); H.saveS(); H.stat('unitsEarned');
    const U = UNITS.find((x) => x.id === u), R = UNIT_REQ[u], lead = H.who(R.lead).name, pt = H.partner();
    const lines = [['narr', (moved ? 'After the envelope, ' : 'At the next roll call, ') + 'Castillo calls your name and the room goes quiet. ' + lead + ' walks up with a ' + U.name + ' patch in hand and pins it on your sleeve.'],
      [R.lead, FIRSTDAY[u]]];
    if (pt) lines.push([pt.id, H.pick('patchPt_' + pt.k, PARTNER_PATCH[pt.k] || PARTNER_PATCH.walsh)]);
    lines.push(['castillo', H.pick('patchC', ['Patrol taught you to see the street. Don\'t stop seeing it now.', 'You earned that the slow way. That\'s the only way that lasts.', 'Every unit in this building still answers the radio. Remember that.'])]);
    H.dialogue(lines, () => card(U, moved), { noLeave: true, kicker: 'ROLL CALL · ' + U.name.toUpperCase() });
  }
  function card(U, moved) {
    const u = U.id;
    H.openModal('<div class="chEnd side"><span class="chKick">' + (moved ? 'Transfer order' : 'Tryout passed') + '</span><h2>' + U.icon + ' ' + esc(U.name) + '</h2><p>' + esc(U.perkText) + '</p><div class="chStamp">ACCEPTED</div><p class="chNext">Switch to it now, or any time from your career board. Patrol is always yours too.</p></div><div class="qAct"><button type="button" id="uNow">Switch to ' + esc(U.name) + '</button><button type="button" class="ghost" id="uLater">Later</button></div>');
    H.good(); document.getElementById('uNow').onclick = () => { H.closeModal(); H.switchTo(u); }; document.getElementById('uLater').onclick = H.closeModal;
  }
  // the career board: the units you have, and the road to each one you don't
  function boardHtml(sel) {
    return '<div class="uList">' + UNITS.map((U) => { const st = stage(U.id), b = bar(U.id), R = UNIT_REQ[U.id];
      const status = st === 'in' ? (S.unit === U.id ? 'Your unit now' : 'Earned · tap to switch') : st === 'tryout' ? 'Ready for tryout' : st === 'bar' ? 'Quests done · meet the bar for the tryout' : st === 'quests' ? 'On ' + esc(H.who(R.lead).name) + '\'s quests' : st === 'noticed' ? esc(H.who(R.lead).name) + ' noticed you · find them in ' + esc(H.districtName(R.d)) : 'Not yet';
      const rows = st === 'in' || !b ? '' : '<div class="uReq">' + b.map((r) => '<div class="' + (r.ok ? 'ok' : '') + '"><span>' + esc(r.label) + '</span><b>' + (r.label.indexOf('District open') === 0 ? (r.ok ? 'Yes' : 'No') : r.label.indexOf('Rank') === 0 ? (r.ok ? 'Yes' : 'Now ' + H.rankName(r.v)) : Math.min(r.v, 9999) + ' / ' + r.t) + '</b><i class="rchBar"><i style="width:' + Math.max(4, Math.min(100, Math.round(r.v / Math.max(1, r.t) * 100))) + '%"></i></i></div>').join('') + '</div>';
      return '<button type="button" class="uCard' + (st === 'in' ? ' have' : ' lock') + (U.id === sel ? ' on' : '') + '" data-u="' + U.id + '" data-st="' + st + '" style="--uc:' + U.color + '"><div class="uTop"><span class="uIco">' + U.icon + '</span><div><b>' + esc(U.name) + '</b><em>' + status + '</em></div></div>' +
        '<p class="uPerk"><b>' + esc(U.perk) + ':</b> ' + esc(U.perkText) + '</p>' + rows + (st === 'tryout' ? '<span class="uTry">Start the tryout ▸</span>' : '') + '</button>'; }).join('') + '</div>';
  }
  return { bar, stage, has, own, tryout, transfer, accept, questDone, boardHtml, noticed, barOk };
}

// what the lead says as the patch goes on: your first day in the unit
const FIRSTDAY = {
  swat: 'Welcome to the team. First rule: you\'re never the first one through a door alone. Second rule: you bring coffee on Mondays.',
  k9: 'Bosco already decided he likes you. Tomorrow you start learning how to read him. It takes years. Start now.',
  neg: 'You listen like it matters. In this unit, it\'s the only tool we carry. Your first callout, you sit next to me and say nothing.',
  marine: 'You\'re crew now. Life jacket on every time you step on the boat, even if it\'s ninety-eight degrees. Especially then.',
  brt: 'No arrest, no report anyone reads, and somebody sleeps safe tonight. That\'s a good shift here. Welcome.',
  hoi: 'Thursday, eight in the morning. Socks, water, and names. You\'ll learn every one of them.',
  det: 'Desk by the window is yours. Nothing goes in a report that you can\'t prove. Nothing.',
  sro: 'Five hundred kids, and every one of them is watching how you treat the one who\'s in trouble. Welcome to Eastside Middle.'
};
const PARTNER_PATCH = {
  walsh: ['Look at you. I remember when you couldn\'t parallel park.', 'Don\'t forget who taught you to back into a parking spot.', 'Good. Somebody from this car should make it out of patrol.'],
  park: ['That is so cool. Can I take a picture? For my notes.', 'Okay, I\'m writing down that I knew you before the patch.', 'You\'re going to be great at it. I mean that.']
};

// each unit's tryout call: the situation, the lead's line, and three ways to handle it (first is the one they want)
const TRYCALL = {
  swat: { set: 'A training house, two rooms, a dummy "suspect" behind one door.', open: 'Fundamentals first. Then I\'ll show you a door.', q: 'Your team is stacked and the door is closed.', opts: [['Hold, communicate, and go on the count', 'Holding. On your count.', 'That\'s my team.'], ['Go first, fast', 'I\'ll take it.', 'Alone, in a doorway. No.'], ['Call out and wait for the suspect to open it', 'Police, open the door.', 'You gave away the stack.']], pass: 'Report to Coastline Freight on your next shift. Bring your own coffee, ours is terrible.' },
  k9: { set: 'Bosco alerts at a car in the Riverwalk lot.', open: 'Questions first. Then Bosco tells us something, and you tell me what you do with it.', q: 'Bosco is sitting by the trunk.', opts: [['Reward Bosco, hold the scene, and call it in', 'Good boy. Holding the scene.', 'Dog first, scene second, ego never.'], ['Open the trunk yourself right away', 'Let\'s see what\'s in here.', 'You don\'t have the authority yet. Bosco doesn\'t either.'], ['Ignore it, he\'s probably wrong', 'He\'s just excited.', 'He\'s never just excited.']], pass: 'Bosco likes you. That\'s half the tryout. You passed the other half.' },
  neg: { set: 'A role-play: Lt. Vale plays a man on a ledge.', open: 'I\'ll ask you three things. Then I\'m going to be someone having the worst night of his life.', q: '"Don\'t come any closer. I mean it."', opts: [['Stop, say your name, and ask his', 'Okay. I\'m staying right here. I\'m ' + 'the officer from Patrol. What\'s your name?', 'Good. You gave me control of the distance. That\'s everything.'], ['Promise him everything will be okay', 'It\'s all going to be okay.', 'You don\'t know that. Neither does he.'], ['Keep walking slowly toward him', 'I\'m just coming to talk.', 'He told you to stop. You didn\'t listen.']], pass: 'You listen like it matters. It does. Welcome to the team.' },
  marine: { set: 'Night drill on the river: a dummy in the water, current running.', open: 'Three questions on the dock. Then the boat.', q: 'The "victim" is drifting fast.', opts: [['Approach from downstream, throw the ring, don\'t jump in', 'Ring\'s out. Pull steady.', 'Reach, throw, row, go. In that order.'], ['Jump in after him', 'I\'m going in.', 'Now I\'m rescuing two of you.'], ['Approach from upstream at speed', 'Coming in fast.', 'You just put a hull in the water on top of him.']], pass: 'Welcome aboard. Literally.' },
  brt: { set: 'A role-play at the Transit Center: Drake plays a man who\'s convinced someone\'s following him.', open: 'Some basics first. Then I\'m going to be scared, and you\'re going to help me.', q: '"They\'re watching me. You can\'t see them, but they are."', opts: [['Acknowledge how scary that must be, and ask what would help', 'That sounds frightening. What would help right now?', 'You didn\'t argue with his reality. You met him in it.'], ['Tell him nobody is following him', 'Nobody\'s following you, sir.', 'True, maybe. Useless, definitely.'], ['Tell him he needs to calm down', 'Sir, I need you to calm down.', 'Nobody in history has calmed down because they were told to.']], pass: 'You\'re a natural. Don\'t let anyone tell you this isn\'t police work.' },
  hoi: { set: 'A role-play at the Community Center: Reddick plays a man refusing a shelter bed.', open: 'A few questions. Then I\'m going to say no to everything, and you\'re going to keep trying.', q: '"I don\'t want a shelter. They steal your stuff."', opts: [['Ask what would make a shelter safe for him', 'What would make it feel safe?', 'Now he\'s telling you what he needs. That\'s a plan.'], ['Tell him he can\'t sleep outside tonight', 'You can\'t stay out here.', 'He can, and he will. Now he won\'t talk to you either.'], ['Give up and leave', 'Okay. Your call.', 'He\'ll be here tomorrow. Will you?']], pass: 'Thursday, eight a.m. We start with socks and coffee.' },
  det: { set: 'A tabletop case: a burglary, three witness statements that don\'t agree.', open: 'Questions first. Then I\'ll give you three statements that don\'t line up.', q: 'Two witnesses disagree about the car\'s color.', opts: [['Note both, check the cameras, and don\'t pick a side yet', 'Both go in the notes. Cameras next.', 'Evidence decides. Not your gut.'], ['Go with the witness who seemed more sure', 'The second one sounded certain.', 'Certainty isn\'t accuracy.'], ['Leave the color out to keep it simple', 'Color\'s not important.', 'Then the defense will make it important.']], pass: 'You don\'t guess. Good. Desk by the window is yours.' },
  sro: { set: 'A role-play at the school: Pak plays an eighth-grader who got caught vaping.', open: 'Some fundamentals. Then I\'m thirteen and in trouble.', q: '"It\'s not even mine. Everybody does it."', opts: [['Ask what\'s been going on, and bring in the counselor', 'Okay. What\'s been going on lately?', 'You asked about her, not the vape. That\'s the job.'], ['Write a citation to make an example of her', 'This gets written up.', 'She\'ll remember the citation. Not the lesson.'], ['Let it go, it\'s not a big deal', 'Forget it this time.', 'And the next time she needs an adult, she\'ll remember you didn\'t care.']], pass: 'The kids are going to like you. More importantly, they\'re going to trust you.' }
};
