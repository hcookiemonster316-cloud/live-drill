// The world of Patrol City: Port Meridian, its history, the story cast and the campaign.
// Every chapter walks one district and its Chapter 5 unit; dialogue frames the questions so they feel like the job.

export const WORLD = {
  city: 'Port Meridian',
  tagline: 'Field Immersion Program · Class 26-04',
  intro: [
    'Port Meridian, Florida. A river town that grew into a county seat: citrus, then rail, then everything else.',
    'The Port Meridian Police Department built Patrol City to train its cadets: a full-scale replica of the real streets, every call based on something that really happened.',
    'Every scenario is a sim round. Nobody gets hurt here. Everything you learn here goes out the door with you.',
    'Your class is the first to train in all five districts. Your Field Training Officer is waiting at Patrol HQ.'
  ]
};

// lore entries unlock as you play (discover places, finish chapters, find secrets)
export const LORE = [
  { id: 'founding', title: 'The Founding of Port Meridian', when: 'start', text: 'Founded in 1887 at the bend of the Meridian River, the town shipped oranges by riverboat until the railroad arrived in 1902. The old train depot still stands; it is the Downtown Transit Center now, and the clock over the door has been five minutes slow since 1951.' },
  { id: 'pmpd', title: 'The Port Meridian Police Department', when: 'start', text: 'The department began in 1911 with one marshal, two deputies and a horse named Judge. Today it runs five districts out of Patrol HQ and four substations. Judge still appears on the department patch, if you look closely.' },
  { id: 'patrolcity', title: 'Why Patrol City Exists', when: 'start', text: 'After a hurricane closed the old academy in 2019, the training staff built Patrol City as a replica of the real streets. Every scenario is a sim round, written from real calls. The rule on the wall at HQ: "Train like it matters. Because it will."' },
  { id: 'central', title: 'Central District', when: 'd0', text: 'Downtown grew around the old depot and Founders Plaza. Mr. Delgado has run the hot dog cart by the fountain for twenty-two years; officers joke that he has worked more downtown shifts than anyone on the force.' },
  { id: 'eastside', title: 'Eastside', when: 'd1', text: 'Eastside was orange groves until the highway came through in 1974. Now it is gas stations, strip malls and Big Earl\'s Auto, where every patrol car in the county has been fixed at least once.' },
  { id: 'riverside', title: 'Riverside', when: 'd2', text: 'The oldest neighborhoods sit along the river: porches, oak trees and the stadium where the Meridian Gators lose with great dignity. Captain Hal has watched the river from the marina since before the bridge was built.' },
  { id: 'industrial', title: 'Industrial Park', when: 'd3', text: 'The rail yards and warehouses that built the city. Many buildings date to the 1920s and have more blind corners than walls. Every cadet learns to search here, slowly and by the book.' },
  { id: 'justice', title: 'Justice Row', when: 'd4', text: 'The 1932 courthouse, the county jail and the offices that orbit them. The courthouse cat, Exhibit A, has attended more trials than most attorneys and has never once been held in contempt.' },
  { id: 'judge', title: 'Judge the Horse', when: 'ch0', text: 'The department\'s first patrol horse served from 1911 to 1934 and once, according to legend, stopped a runaway wagon on Main Street by simply standing in front of it. Sgt. Castillo says that is the whole job, really: stand where it counts.' },
  { id: 'velvet', title: 'The Voice of Dispatch', when: 'ch0', text: 'Marjorie "Velvet" Hale has worked dispatch for thirty-one years. During the 2004 hurricane she kept the channel calm for nineteen hours straight. Officers still say "Velvet\'s on" the way other people say "it\'s going to be okay."' },
  { id: 'graysedan', title: 'The Gray Sedan', when: 'ch1', text: 'A gray sedan with no hubcaps and swapped plates has been seen in every district. Each report alone is nothing. Together they make a pattern, and patterns are what good patrol officers notice.' },
  { id: 'lassiter', title: 'Victor Lassiter', when: 'ch3', text: 'A man with a clean record and a lot of friends who do not. He owns nothing in his own name. Everything he moves goes through someone else\'s hands, someone else\'s car, someone else\'s storage unit.' },
  { id: 'graduation', title: 'Graduation Day', when: 'ch4', text: 'Every class ends at Founders Plaza, under the old depot clock. Five minutes slow. Sgt. Castillo says that is so every graduate gets five extra minutes to be proud.' }
];

// the story cast (the regulars from data.js also appear)
export const CAST = {
  castillo: { name: 'Sgt. Dana Castillo', role: 'Your Field Training Officer', icon: '🎖️', look: { shirt: '#22355e', pants: '#1b2a4a', hat: 'campaign', hatCol: '#5b3a1e', patch: '#f5b800' }, skin: '#a26a42', bio: 'Twenty-two years on patrol, eleven as a training officer. Dry, patient, impossible to impress and secretly proud of every cadet she has ever trained. Taught half the department to drive in reverse. Keeps a list of every cadet who called her "ma\'am" twice in one sentence.' },
  okonkwo: { name: 'Lt. Ray Okonkwo', role: 'Watch Commander', icon: '🛡️', look: { shirt: '#22355e', pants: '#1b2a4a', hat: 'cap', hatCol: '#16213d', patch: '#f5b800' }, skin: '#5a3620', bio: 'Runs the watch from Patrol HQ. Former Marine, current marathon runner, permanent owner of the best mug in the building. Believes paperwork is just police work that sat down.' },
  velvet: { name: 'Marjorie "Velvet" Hale', role: 'Senior Dispatcher', icon: '🎧', look: { shirt: '#334155', pants: '#1f2937', hat: 'headset', patch: '#9ca3af' }, skin: '#f1c9a5', bio: 'Thirty-one years on the radio. Her voice has talked down storms, standoffs and at least one very angry goose.' },
  pike: { name: 'Cadet Jordan Pike', role: 'Your classmate', icon: '😎', look: { shirt: '#7c8189', pants: '#4b5320', hat: 'cap', hatCol: '#111827', patch: '#f5b800', boots: '#0b0b0b' }, skin: '#e0b48f', bio: 'Top of the class in confidence, middle of the class in everything else. Ran a 5K once and mentions it daily. Will absolutely have your back when it counts.' },
  navarro: { name: 'Cadet Riley Navarro', role: 'Your classmate', icon: '📓', look: { shirt: '#7c8189', pants: '#4b5320', hat: 'cap', hatCol: '#111827', patch: '#f5b800', boots: '#0b0b0b' }, skin: '#c68e63', bio: 'Has highlighted every line of Chapter 5. Twice. Quiet, sharp, and the first person you call when you forget which statute it was.' },
  lassiter: { name: 'Victor Lassiter', role: 'Person of interest', icon: '🕶️', look: { shirt: '#e5e7eb', pants: '#1f2937', tie: '#111827', plain: true, hat: 'none' }, skin: '#f1c9a5', bio: 'Polite, patient and never where the trouble is. Owns a gray sedan he swears he sold last year.' }
};

// the campaign: one chapter per district. Steps send you somewhere (a place name, or a regular's id),
// play a scene there and can ask questions from that district's lessons.
export const CHAPTERS = [
  { d: 0, title: 'First Watch', sub: 'Central District · Unit 1 · Patrol Basics', steps: [
    { at: 'Patrol HQ', inside: true, goal: 'Report to Sgt. Castillo inside Patrol HQ', who: 'castillo', say: [['castillo', 'So you\'re my new cadet. I\'m Sergeant Castillo. I\'ve trained eleven classes, and I can tell you exactly one thing about you so far: your boots are shined.'], ['castillo', 'That\'s a start. Out there, people watch everything you do. The way you stand, the way you talk, whether you look like you know where you\'re going.'], ['castillo', 'Lieutenant Okonkwo runs the watch. Go introduce yourself. Stand up straight. He notices.']] },
    { at: 'Patrol HQ', inside: true, goal: 'Check in with Lt. Okonkwo, the watch commander', who: 'okonkwo', say: [['okonkwo', 'Cadet. Welcome to the watch. Before I put you anywhere near the public, I want to know you understand why we patrol at all.']], quiz: { les: 0, n: 2 }, after: [['okonkwo', 'Good. Visibility, deterrence, being there when someone needs you. Go walk downtown. Talk to people. Founders Plaza is a good place to start.']] },
    { at: 'Founders Plaza', goal: 'Walk to Founders Plaza and meet the locals', who: 'delgado', npc: 'delgado', say: [['delgado', 'A new face! Castillo\'s cadet, right? She sent me four cadets last year. Three of them still come back for hot dogs.'], ['delgado', 'Something for you, since you\'re new: a gray sedan, no hubcaps, has been circling the plaza after midnight. Three nights now. Driver never gets out. Just watches.'], ['castillo', '(over the radio) Good contact, cadet. Now think it through. What would you look for if you walked up on that car?']], quiz: { les: 1, n: 2 }, after: [['delgado', 'You sound like her already. Here, a hot dog for the new cadet. On the house!'],
      ['choice', [
        { t: 'Pay for it anyway', set: 'paidDelgado', trust: 2, npc: { delgado: 1 }, reply: [['delgado', 'Ha! Castillo taught you that already? Fine, fine. Two dollars. And I\'m telling everybody you\'re honest.']] },
        { t: 'Take it, it\'s free', set: 'freeDog', trust: 0, reply: [['delgado', 'Enjoy! The mustard is aggressive.'], ['castillo', '(over the radio) We\'ll talk about free food later, cadet. Not now. Later.']] },
        { t: 'Thank him and politely decline', set: 'declinedDog', trust: 1, reply: [['delgado', 'Your loss, cadet. But I respect it. Come back on your own dime sometime.']] }]]] },
    { at: 'Dispatch Center', inside: true, goal: 'Head to the Dispatch Center and meet Velvet', who: 'velvet', say: [['velvet', 'So you\'re the one Dana\'s been bragging about. Don\'t let it go to your head. She brags about her houseplants too.'], ['velvet', 'When you key up on my channel, I need short, clear and calm. Let\'s see if you know how the radio is supposed to work.']], quiz: { les: 2, n: 2 }, after: [['velvet', 'You\'ll do. Now, about that gray sedan: someone called in a partial plate. Records can run it for you.']] },
    { at: 'Records', inside: true, goal: 'Run the partial plate at Records', who: 'navarro', say: [['navarro', 'Oh, hey! Castillo sent me to show you the terminal. I may have read the whole manual. Twice. Okay, three times.'], ['navarro', 'Before we run anything, you have to know the rules for these databases. Get this wrong and you can lose your access. Or your job.']], quiz: { les: 3, n: 2 }, after: [['navarro', 'Partial plate comes back to a gray sedan. Reported stolen... in Eastside. Two weeks ago.'], ['navarro', 'And the plate on it now belongs to a totally different car. Somebody swapped it.']] },
    { at: 'Patrol HQ', inside: true, goal: 'Report back to Sgt. Castillo at HQ', who: 'castillo', say: [['castillo', 'A stolen car with a swapped plate, circling downtown at night, watching. That\'s not a joyride. That\'s somebody casing.'], ['castillo', 'Good first watch, cadet. You talked to people, you listened, and you followed it up. That\'s patrol.'],
      ['castillo', 'And about the hot dog. Free things have strings, even small ones. Somebody remembers who took what. Just know that.', { if: 'freeDog' }],
      ['castillo', 'Delgado says you paid for your hot dog. Word gets around. That kind of thing is worth more than you think.', { if: 'paidDelgado' }], ['castillo', 'Master Central and pass the District Final Call. Then we go to Eastside and find out where that car came from.']], reward: { rp: 150, loot: 'u' } }
  ] },
  { d: 1, title: 'Where the Car Came From', sub: 'Eastside · Unit 2 · Duties on Patrol', steps: [
    { at: 'Substation', inside: true, goal: 'Meet Castillo at the Eastside Substation', who: 'castillo', say: [['castillo', 'Eastside. Busier, louder and closer to the highway. The stolen sedan was taken from a parking lot here two weeks ago.'], ['castillo', 'Pike is riding with us today. Try not to let him narrate.'], ['pike', 'Did I mention I ran a 5K? Because I ran a 5K.']] },
    { at: "Big Earl's Auto", goal: "Ask around at Big Earl's Auto", who: 'earl', npc: 'earl', say: [['earl', 'Gray sedan? I put new tires on one about a month ago. Paid cash. Guy wore sunglasses indoors. Said his name was "Vic."'], ['earl', 'Funny thing, he asked how easy it is to swap plates. I told him that\'s a crime. He laughed like I made a joke.']], quiz: { les: 5, n: 2 }, after: [['castillo', 'Good questions. Suspicious isn\'t a crime, but it is a reason to pay attention.']] },
    { at: 'Eastgate Motel', goal: 'Respond to the disturbance at the Eastgate Motel', who: 'pike', say: [['pike', 'Loud argument in room 12. I\'ll just go knock real quick and...'],
      ['choice', [
        { t: 'Stop Pike and make a plan first', set: 'plannedMotel', reply: [['castillo', 'Good. Pike, you\'re cover. Cadet, you\'re contact. Where do we park, where do we stand?']] },
        { t: 'Let Pike take the lead', set: 'pikeLed', trust: -1, reply: [['pike', 'Police! Open up! ...Oh no. Back door. Somebody just went out the back.'], ['castillo', 'And there goes one of them, into a gray sedan. Plan first, every time. Now, how should this have gone?']] }]]], quiz: { les: 4, n: 2 }, after: [['castillo', 'Two people arguing over a car one of them "borrowed." A gray sedan. They say a man named Vic pays good money for cars nobody\'s looking for.', { if: 'plannedMotel' }],
      ['castillo', 'The one who stayed says a man named Vic pays good money for cars nobody\'s looking for. The one who ran took the car with him.', { if: 'pikeLed' }], ['pike', 'Okay, that was actually cool. I take back half of what I said about planning.', { if: 'plannedMotel' }], ['pike', 'That one\'s on me. I owe you. I won\'t forget it.', { if: 'pikeLed' }]] },
    { at: "Rosa's Bodega", goal: "Check in with Rosa at Rosa's Bodega", who: 'rosa', npc: 'rosa', say: [['rosa', 'Mijo, you\'re back! That man with the sunglasses comes in for cigarettes. Always pays cash. Always parks around the back.'], ['rosa', 'Last time he said something strange. "After this week, I won\'t need this neighborhood anymore." I didn\'t like how he said it.']], quiz: { les: 7, n: 2 }, after: [['castillo', 'Threat or just talk? You decide what we do with it.'],
      ['choice', [
        { t: 'Write it up and report it', set: 'reportedThreat', trust: 1, npc: { rosa: 1 }, reply: [['rosa', 'You\'re writing it down? Good. Nobody ever writes anything down.']] },
        { t: 'Tell Rosa not to worry about it', set: 'shrugThreat', trust: -2, npc: { rosa: -1 }, reply: [['rosa', '...Okay, mijo. If you say so.'], ['castillo', '(over the radio) Hm. Noted.']] }]]] },
    { at: 'Substation', inside: true, goal: 'Report back to Castillo at the Substation', who: 'castillo', say: [['castillo', 'A name, "Vic." A pattern of stolen cars. And somebody paying cash for them. Cars like that end up in pieces, or end up moving something.'], ['castillo', 'Riverside is next. People sell things there. Let\'s see what\'s for sale.']], reward: { rp: 200, loot: 'u' } }
  ] },
  { d: 2, title: 'Everything Has a Serial Number', sub: 'Riverside · Unit 3 · Non-Criminal Calls', steps: [
    { at: 'Substation', inside: true, goal: 'Meet Castillo at the Riverside Substation', who: 'castillo', say: [['castillo', 'Riverside is mostly calls nobody writes movies about: lockouts, well-being checks, lost dogs, found wallets. It\'s the heart of the job.'], ['castillo', 'Do these well, and people will trust you when it really matters.']] },
    { at: 'Riverside School', goal: 'Talk to Ms. Johnson, the crossing guard', who: 'johnson', npc: 'johnson', say: [['johnson', 'Officer. Mrs. Alvarez on Willow hasn\'t picked up her paper in three days. That\'s not like her.']], quiz: { les: 9, n: 2 }, after: [['johnson', 'She\'s fine? She fell asleep watching her shows for... three days? Lord. Thank you for checking.']] },
    { at: 'River Pawn', inside: true, goal: 'Check the pawn records at River Pawn', who: 'navarro', say: [['navarro', 'The pawn log flagged a TV with a serial number from a burglary report. And look at the seller\'s ID.'], ['navarro', 'V. Lassiter. Victor Lassiter. Vic.']], quiz: { les: 13, n: 2 }, after: [['castillo', 'The owner is here and wants her TV back right now. Your call, cadet.'],
      ['choice', [
        { t: 'Document it and hold it as evidence', set: 'heldEvidence', reply: [['castillo', 'By the book: photographed, logged, and she gets a receipt and a case number. She\'ll get it back when it\'s released.']] },
        { t: 'Hand it back to her right now', set: 'gaveTV', trust: 2, reply: [['castillo', 'She\'s thrilled. The evidence log is going to be a little thinner, though. Something to think about.']] }]],
      ['castillo', 'And now our sedan has a full name.']] },
    { at: 'Riverside Marina', goal: 'Ask Captain Hal about the river', who: 'hal', npc: 'hal', say: [['hal', 'Lassiter? Keeps a boat here under somebody else\'s name. Hasn\'t taken it out in months. Pays for the slip, though. Cash.'], ['hal', 'Saw him carrying boxes from the boat to a gray car last week. Real careful with them.']], quiz: { les: 11, n: 2 }, after: [['castillo', 'Boxes from a boat to a car. Somewhere those boxes are being stored.']] },
    { at: 'Substation', inside: true, goal: 'Report back to Castillo', who: 'castillo', say: [['castillo', 'Stolen cars, stolen property, a boat, and boxes that need storing. You know where people store things in this city?'], ['pike', '...A storage unit?'], ['castillo', 'Industrial Park. Bring your flashlight. Bring your patience.']], reward: { rp: 250, loot: 'r' } }
  ] },
  { d: 3, title: 'Clear Every Corner', sub: 'Industrial Park · Unit 4 · Structure and Area Searches', steps: [
    { at: 'Substation', inside: true, goal: 'Meet Castillo at the Industrial Park Substation', who: 'castillo', say: [['castillo', 'Lock-It Storage reported a pried door on unit 14 last night. The guard waited for us instead of going in. Smart man.'], ['castillo', 'This is a sim round, but we search it like it\'s real. Slow is smooth. Smooth is fast.']] },
    { at: 'Lock-It Storage', inside: true, goal: 'Search Lock-It Storage by the book', who: 'carl', npc: 'carl', say: [['carl', 'Unit 14. Door\'s been pried. I didn\'t go in. Didn\'t touch anything. Figured that\'s your job.']], quiz: { les: 17, n: 3 }, after: [['navarro', 'Boxes. Televisions, laptops, tools. Every serial number I check is on a burglary report.'], ['navarro', 'And the unit\'s rented under a company name. "VL Holdings."']] },
    { at: 'Eastline Rail Yard', goal: 'Set a perimeter at the rail yard', who: 'pike', say: [['pike', 'Somebody ran from the storage lot when we pulled up! Into the rail yard!'], ['castillo', 'We don\'t chase into a maze. We contain it. Perimeter first, then we search.']], quiz: { les: 18, n: 3 }, after: [['pike', 'I\'ve got the north corner. I owed you one from the motel. He\'s not getting past me.', { if: 'pikeLed' }],
      ['castillo', 'Found him behind a boxcar, out of breath. It\'s one of the men from the motel. He\'s talking.'],
      ['castillo', 'It\'s the one who ran out the back of the motel. Pike recognized him. Good thing someone did.', { if: 'pikeLed' }], ['castillo', 'Says Lassiter pays him to move cars and boxes, and that Lassiter is going to be at the courthouse tomorrow for a bail hearing on an old case. Bold.']] },
    { at: 'Substation', inside: true, goal: 'Report back to Castillo', who: 'castillo', say: [['castillo', 'Stolen cars, stolen goods, a storage unit in his company\'s name and a witness. That\'s enough for a warrant.'], ['castillo', 'Tomorrow, Justice Row. We do this exactly right, or we don\'t do it at all.']], reward: { rp: 300, loot: 'r' } }
  ] },
  { d: 4, title: 'By the Book', sub: 'Justice Row · Unit 5 · Arrest Procedures', steps: [
    { at: 'Substation', inside: true, goal: 'Meet Castillo at the Justice Row Substation', who: 'castillo', say: [['castillo', 'The warrant\'s signed. Lassiter is in the courthouse for his hearing. Calm, polite and certain he\'s smarter than us.'], ['castillo', 'Today you make the arrest. I\'m right behind you. You know this.']] },
    { at: 'Clerk of Court', inside: true, goal: 'Confirm the warrant with Clerk Hattie', who: 'hattie', npc: 'hattie', say: [['hattie', 'Lassiter, Victor. Active warrant, signed this morning. Spelled correctly, thank goodness.']], quiz: { les: 19, n: 2 }, after: [['hattie', 'Confirmed. Go on, cadet. Do it right.']] },
    { at: 'County Courthouse', inside: true, goal: 'Make the arrest at the County Courthouse', who: 'lassiter', say: [['lassiter', 'Officer. Or... cadet? How charming. I think you\'ll find I\'ve done nothing at all.'],
      ['lassiter', 'I remember you. The one Delgado gave a free lunch to. Everyone in this city takes something, cadet. What would it take for you?', { if: 'freeDog' }],
      ['lassiter', 'Surely we can talk about this like reasonable people. Before anyone does anything hasty.', { unless: 'freeDog' }],
      ['choice', [
        { t: '"You\'re under arrest. We\'re not talking about anything else."', set: 'firmArrest', reply: [['castillo', 'Mr. Lassiter, we have a warrant for your arrest. The cadet will explain your situation.']] },
        { t: '"Go ahead. I\'m listening."', set: 'heardOffer', reply: [['lassiter', 'A business card, with something folded inside. For your trouble.'], ['castillo', 'That\'s an offered bribe, in front of two witnesses. That\'s now a second charge, Mr. Lassiter. Cadet: note it, then explain his situation.']] }]]], quiz: { les: 19, n: 3 }, after: [['lassiter', '...I want my lawyer.'], ['castillo', 'That\'s your right, and you\'ll have one. Cadet, take him to booking.']] },
    { at: 'County Jail', inside: true, goal: 'Book Lassiter at the County Jail', who: 'ramos', npc: 'ramos', say: [['ramos', 'Search him again before he comes through my door. Property bag sealed and inventoried. Paperwork complete. Then he\'s mine.']], quiz: { les: 20, n: 3 }, after: [['ramos', 'Clean booking. Not a box out of place. Castillo trained you right.'],
      ['ramos', 'And the photos and logs from that pawn shop TV? The prosecutor says that\'s what nails the property charges.', { if: 'heldEvidence' }],
      ['ramos', 'Prosecutor says the stolen TV went back before it was photographed. Lassiter\'s lawyer is going to love that. Still a strong case. Just a bit less.', { if: 'gaveTV' }],
      ['ramos', 'And that threat report you wrote up at Rosa\'s? It\'s in the file. Shows a pattern. Good instinct.', { if: 'reportedThreat' }]] },
    { at: 'Justice Plaza', goal: 'Meet everyone at Justice Plaza', who: 'castillo', say: [['castillo', 'Five districts. You listened to people, you followed the evidence and you did every step by the book.'], ['pike', 'I would like it on the record that I helped. Also that I ran a 5K.'], ['navarro', 'I highlighted this moment. Mentally.'],
      ['delgado', '(over the radio) Delgado here! I heard the news on the scanner. The honest cadet! Next hot dog... you still have to pay. But I\'ll be proud while you do it.', { if: 'paidDelgado' }], ['velvet', '(over the radio) All units, be advised: Port Meridian has a new officer in training who did good work today. Velvet clear.'], ['castillo', 'Graduation\'s at Founders Plaza, under the old clock. Five minutes slow. You earned every one of them, cadet.']], reward: { rp: 500, loot: 'l' } }
  ] }
];

// ---------- side cases ----------
// Each district has its own side cases, offered by a regular once the main story reaches that point.
// They are optional, they can be tracked from the Field Journal, and their choices ripple into the main story.
// req: [district, main-story step reached]. Steps use the same format as the main story.
export const MAIN_TITLE = 'The Gray Sedan';
export const SIDE = [
  { id: 'wallet', d: 0, title: 'Finders, Keepers, Reporters', giver: 'dot', req: [0, 1], blurb: 'Dot found a wallet in booth 4 of the Night Owl Diner.',
    offer: [['dot', 'Officer, hon, you got a minute? Somebody left a wallet in booth 4. Fat one. I don\'t want to be the one who gets blamed when it comes up light.']],
    steps: [
      { at: 'Night Owl Diner', npc: 'dot', who: 'dot', goal: 'Look at the wallet with Dot at the Night Owl', say: [['dot', 'Here it is. I haven\'t opened it. I watch the true crime shows, I know how this goes.'],
        ['choice', [
          { t: 'Inventory it with Dot as a witness', set: 'walletWitness', npc: { dot: 1 }, reply: [['dot', 'Forty-two dollars, a library card, an ID and a parking stub. I\'ll sign whatever you need, hon.']] },
          { t: 'Count it yourself, quickly', set: 'walletAlone', trust: -1, reply: [['dot', 'Hon. If I were you, I\'d want a witness. People remember things wrong when money is involved.']] }]]], quiz: { n: 2 } },
      { at: 'Records', inside: true, who: 'navarro', goal: 'Run the owner\'s ID at Records', say: [['navarro', 'ID comes back to Kevin Park. Works IT at Meridian Office Tower. No warrants, no flags.'], ['navarro', 'Wait. Look at the parking stub. Eastside Plaza, dated the night the gray sedan was stolen. Same lot.'], ['navarro', 'I\'m putting a note in the case file. Coincidences are just evidence that hasn\'t been introduced yet.']], after: [['castillo', '(over the radio) Good catch. Return the wallet, then we\'ll talk to Kevin about what he saw that night.']], set: 'walletClue' },
      { at: 'Meridian Office Tower', npc: 'kevin', who: 'kevin', goal: 'Return the wallet to Kevin at the office tower', say: [['kevin', 'My wallet! I\'ve turned the whole building off and on again looking for it.'],
        ['kevin', 'And it\'s all here. Forty-two dollars. You even have a receipt signed by Dot? That is the most organized thing that has ever happened to me.', { if: 'walletWitness' }],
        ['kevin', 'Huh. I thought there was more cash... no wait, that was last week. Sorry. You get a little paranoid.', { if: 'walletAlone' }],
        ['kevin', 'That night at Eastside Plaza? I saw a guy in sunglasses walking around the lot. At night. I remember thinking, nobody needs sunglasses at night.']] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'clock', d: 0, title: 'Five Minutes Slow', giver: 'okafor', req: [0, 3], blurb: 'Ms. Okafor wants to find the lost winding key of the depot clock.',
    offer: [['okafor', 'Cadet. The depot clock has run five minutes slow since 1932. The original winding key went missing that same year.'], ['okafor', 'I found a note in the archive: "The key rests where Judge rested." Judge was the department\'s first horse. Would you help an old librarian with a very old mystery?']],
    steps: [
      { at: 'Founders Park', npc: 'pruitt', who: 'pruitt', goal: 'Ask Sgt. Pruitt (Ret.) where Judge was stabled', say: [['pruitt', 'Judge\'s stable? My grandfather shoveled it. It stood right where the Transit Center is now. The pigeons still remember. Look at them. They know.'],
        ['choice', [
          { t: 'Ask Pruitt to come along', set: 'pruittAlong', npc: { pruitt: 1 }, reply: [['pruitt', 'Ha! I haven\'t been on a case since 1998. I\'ll bring the pigeons. Not all of them.']] },
          { t: 'Thank him and go on your own', reply: [['pruitt', 'Go on, then. If you find the key, tell Judge I said hello.']] }]]], quiz: { n: 1 } },
      { at: 'Downtown Transit Center', npc: 'marcus', who: 'marcus', goal: 'Search the old stable site at the Transit Center', say: [['marcus', 'Old horse plaque? Yeah, behind the bike racks. There\'s a little brass door in it. Never opened it. Figured it was haunted.'], ['pruitt', 'Would you look at that. A brass key, green as a pickle.', { if: 'pruittAlong' }],
        ['choice', [
          { t: 'Log it as found property and bring it to the library', set: 'clockLogged', trust: 1, reply: [['castillo', '(over the radio) Even a ninety-year-old key gets documented. Nice work.']] },
          { t: 'Pocket it and hand it over yourself', set: 'clockPocket', reply: [['castillo', '(over the radio) Write it down anyway, cadet. Found is found, no matter how old.']] }]]] },
      { at: 'Central Library', npc: 'okafor', who: 'okafor', goal: 'Bring the key to Ms. Okafor', say: [['okafor', 'Ninety-four years. You found it in an afternoon. Now, the hard question.'], ['okafor', 'The city has argued about this for decades. Do we fix the clock, or leave it five minutes slow?'],
        ['choice', [
          { t: 'Wind it to the right time', set: 'clockFixed', reply: [['okafor', 'On time, then. The whole city will be early for once.']] },
          { t: 'Leave it five minutes slow', set: 'clockSlow', reply: [['okafor', 'Tradition it is. Five extra minutes for everyone, forever.']] }]]] }
    ], reward: { rp: 140, loot: 'r' } },
  { id: 'ghostcar', d: 1, title: 'Earl\'s Ghost Car', giver: 'earl', req: [1, 2], blurb: 'A car keeps appearing in Big Earl\'s lot at night with the radio on.',
    offer: [['earl', 'Cadet. Don\'t laugh. Every night a car shows up in my back lot, radio playing, engine running. By morning it\'s gone. My nephew says it\'s a ghost. I say ghosts don\'t buy gas.']],
    steps: [
      { at: "Big Earl's Auto", npc: 'earl', who: 'earl', goal: 'Look over Big Earl\'s back lot', say: [['earl', 'Tire marks go back and forth, back and forth, right between my two cones. Like somebody\'s practicing something.']], quiz: { n: 2 } },
      { at: 'Eastside Community Center', npc: 'dez', who: 'dez', goal: 'Ask Dez what the kids are saying', say: [['dez', 'Okay, okay. It\'s my cousin Tasha. She\'s got her driving test Friday and she can\'t parallel park. She takes her mom\'s car at night so nobody sees her mess up.'],
        ['choice', [
          { t: 'Give her a warning and talk to her mom', set: 'tashaWarn', npc: { dez: 1 }, reply: [['dez', 'Her mom\'s gonna be mad. But less mad than if you wrote her up. Thanks.']] },
          { t: 'Cite her for driving without a licensed adult', set: 'tashaCite', npc: { dez: -1 }, reply: [['dez', '...Yeah. Okay. That\'s fair, I guess.'], ['castillo', '(over the radio) By the book. Sometimes the book is all we have.']] },
          { t: 'Set up daylight practice at the community center lot', set: 'tashaHelp', trust: 1, npc: { dez: 2 }, reply: [['dez', 'Wait, for real? With an actual adult? And cones? She\'s going to cry. Happy cry.']] }]]] },
      { at: "Big Earl's Auto", npc: 'earl', who: 'earl', goal: 'Tell Big Earl what you found', say: [['earl', 'A sixteen-year-old and a parallel parking test. That\'s scarier than a ghost.'],
        ['earl', 'Daylight practice? I\'ll bring my good cones. The orange ones. Those are serious cones.', { if: 'tashaHelp' }],
        ['earl', 'A citation, huh. Well. She won\'t do it again. That\'s the point, I guess.', { if: 'tashaCite' }]] }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'ruth', d: 1, title: 'The Maple Court Notebook', giver: 'ruth', req: [1, 1], blurb: 'Grandma Ruth has been keeping a notebook of everything that happens on Maple Court.',
    offer: [['ruth', 'Young officer. I keep a notebook. Everything that happens on Maple Court, written down. Most of it is the mailman. Would you look at it? Nobody ever looks at it.']],
    steps: [
      { at: 'Maple Court', npc: 'ruth', who: 'ruth', goal: 'Read Grandma Ruth\'s notebook', say: [['ruth', 'Entry one. The mailman whistles. Entry two. The mailman whistles a different song. You see the pattern.'],
        ['choice', [
          { t: 'Go through every entry with her', set: 'ruthListened', npc: { ruth: 1 }, reply: [['ruth', 'Entry fourteen. Gray car, idling on Birch Lane, three in the morning, twice. Plate starts with a 7. I couldn\'t see the rest without my good glasses.']] },
          { t: 'Skim it and thank her', set: 'ruthSkimmed', reply: [['ruth', 'Oh. Well. Thank you, dear. Nobody reads past the mailman.']] }]]] },
      { at: 'Birch Lane', who: 'castillo', goal: 'Canvass Birch Lane', say: [['castillo', 'Knock, introduce yourself, listen more than you talk. Somebody always saw something.'], ['castillo', 'Ruth\'s plate starting with a 7 lines up with what we have on the sedan. That notebook is evidence now.', { if: 'ruthListened' }]], quiz: { n: 2 } },
      { at: 'Maple Court', npc: 'ruth', who: 'ruth', goal: 'Report back to Grandma Ruth', say: [['ruth', 'So I wasn\'t just a nosy old woman? Well. I was. But a useful one.'],
        ['choice', [
          { t: 'Help her start a real neighborhood watch', set: 'ruthWatch', trust: 2, npc: { ruth: 1 }, reply: [['ruth', 'A real one? With meetings? I\'ll make lemon bars. Nobody skips a meeting with lemon bars.']] },
          { t: 'Ask her to call the non-emergency line next time', reply: [['ruth', 'I\'ll put it on the fridge, dear. Next to the mailman\'s schedule.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'gameday', d: 2, title: 'Game Day', giver: 'sam', req: [2, 1], blurb: 'The Meridian Gators are playing at River Stadium, and everything is happening at once.',
    offer: [['sam', 'Gators game today. Forty thousand fans, three parking lots and one bridge. Engine 3 is on standby. Want to see what game day looks like from our side?']],
    steps: [
      { at: 'River Stadium', who: 'castillo', goal: 'Help with traffic at River Stadium', say: [['castillo', 'Game day is traffic, lost kids and one guy who thinks the parking rules don\'t apply to him. Stay visible, stay calm, keep the lanes open.']], quiz: { n: 2 } },
      { at: 'Riverside Park', npc: 'gus', who: 'gus', goal: 'Check on Old Gus at Riverside Park', say: [['gus', 'This little one in the Gators jersey says he lost his mom. I\'ve been teaching him to fish so he doesn\'t cry. He\'s a natural.'],
        ['choice', [
          { t: 'Radio a description and wait with Gus', set: 'kidRadio', reply: [['velvet', '(over the radio) Mother located at Gate C. She\'s on her way to the park. Tell Gus she says thank you.']] },
          { t: 'Walk the child back to the stadium info booth', set: 'kidBooth', reply: [['castillo', '(over the radio) Booth has the mom. Next time, think about whether she might be walking toward you while you walk away.']] }]]] },
      { at: 'River Stadium', npc: 'sam', who: 'sam', goal: 'Wrap up with Firefighter Sam', say: [['sam', 'Kid\'s home, lanes are clear and the Gators lost by a field goal. A perfect game day.'],
        ['sam', 'And the mom got Gus season tickets. He says he\'s never going to use them. He\'s going to use them.', { if: 'kidRadio' }]] }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'garden', d: 2, title: 'Mrs. Alvarez\'s Garden', giver: 'miguel', req: [2, 2], blurb: 'Someone has been in Mrs. Alvarez\'s garden at night.',
    offer: [['miguel', 'Mrs. Alvarez is home and recovering, thanks to you. But she says someone is in her garden at night. She is frightened. Would you look into it?']],
    steps: [
      { at: 'Willow Street', who: 'castillo', goal: 'Look over Mrs. Alvarez\'s garden on Willow Street', say: [['castillo', 'Footprints, small ones. A watering can that wasn\'t here yesterday. And the tomatoes look better than mine ever have.']], quiz: { n: 2 } },
      { at: 'Riverside Vet Clinic', who: 'navarro', goal: 'Review the trail camera at the Vet Clinic', say: [['navarro', 'The vet lent us her trail camera. Night one: a raccoon. Night two: the same raccoon. Night three... a teenager, watering the tomatoes. It\'s her grandson.'],
        ['choice', [
          { t: 'Tell Mrs. Alvarez who has been helping', set: 'toldAlvarez', reply: [['navarro', 'She\'ll cry. Good crying, I think.']] },
          { t: 'Let her grandson tell her himself', set: 'keptSecret', reply: [['navarro', 'Give him the chance to do it right. I like that.']] }]]] },
      { at: 'Community Church', npc: 'miguel', who: 'miguel', goal: 'Let Father Miguel know', say: [['miguel', 'Her grandson was afraid she would worry if she knew he was out at night. So he made her worry about a stranger instead. Teenagers.'],
        ['miguel', 'He came to her himself this morning. They sat in the garden for two hours. Thank you for giving him that.', { if: 'keptSecret' }],
        ['miguel', 'She knows, and she has already put him to work on the fence. He seems happy about it. Mostly.', { if: 'toldAlvarez' }]] }
    ], reward: { rp: 140, loot: 'r' } },
  { id: 'lunch', d: 3, title: 'The Case of the Missing Lunch', giver: 'gerald', req: [3, 1], blurb: 'Somebody keeps stealing Gerald\'s lunch from the Coastline Freight break room.',
    offer: [['gerald', 'Cadet. A man works a forklift ten hours. He thinks about his lunch for nine of them. Three days running, my lunch is gone. I am not okay.']],
    steps: [
      { at: 'Coastline Freight', npc: 'gerald', who: 'gerald', goal: 'Search the Coastline Freight break room', say: [['gerald', 'The fridge door was open. The bag is torn, not opened. And there\'s mud on the floor by the loading dock door.']], quiz: { n: 2 } },
      { at: 'The Lunch Pail', npc: 'lupe', who: 'lupe', goal: 'Ask Lupe about the loading dock', say: [['lupe', 'Muddy paw prints across my patio every morning at eleven. Big ones. Trucker Dee\'s dog, Diesel. He has excellent taste in tacos and no shame.']] },
      { at: 'Big Rig Truck Stop', npc: 'dee', who: 'dee', goal: 'Talk to Trucker Dee about Diesel', say: [['dee', 'Diesel? He\'s been sneaking out the cab window. He came back with a sandwich yesterday and I thought, where\'d you get a sandwich?'],
        ['choice', [
          { t: 'Help Dee rig a better latch and pay Gerald back', set: 'dieselLatch', npc: { dee: 1, gerald: 1 }, reply: [['dee', 'Fair. I\'ll buy the man lunch for a week. Diesel says sorry. Diesel does not look sorry.']] },
          { t: 'Write Dee a warning about the loose dog', set: 'dieselWarn', reply: [['dee', 'Yeah, all right. Leash law. I hear you.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'whistle', d: 3, title: 'The Midnight Whistle', giver: 'carl', req: [3, 2], blurb: 'A steam whistle has been screaming from North Spur Yard at midnight.',
    offer: [['carl', 'Every night at midnight. A steam whistle out at North Spur Yard. There hasn\'t been a steam train here since 1961. I\'m not saying it\'s haunted. I\'m saying I\'d like you to say it isn\'t.']],
    steps: [
      { at: 'North Spur Yard', who: 'pike', goal: 'Check North Spur Yard with Pike', say: [['pike', 'Okay, I hear it. I\'ll go in and grab whoever it is.'],
        ['choice', [
          { t: 'Hold a perimeter and wait for it to happen again', set: 'whistlePlan', reply: [['pike', 'Fine. Waiting. ...There! The sound is coming from over the fence. From the scrapyard.']] },
          { t: 'Let Pike go in', set: 'whistlePike', trust: -1, reply: [['pike', 'Going in! ...I\'m in a puddle. It\'s a deep puddle. The whistle is coming from the scrapyard, by the way.']] }]]], quiz: { n: 2 } },
      { at: "Rusty's Scrap & Salvage", npc: 'rusty', who: 'rusty', goal: 'Find the whistle at Rusty\'s Scrap & Salvage', say: [['rusty', 'Guilty. It\'s a 1924 steam whistle off the old Meridian Line. Took me two years to restore. I test it at midnight because that\'s when the compressor\'s free.'],
        ['choice', [
          { t: 'Ask him to test it during the day', set: 'whistleDay', reply: [['rusty', 'Daytime, huh. I suppose the neighbors deserve to sleep. Fine.']] },
          { t: 'Suggest he lend it to the depot museum', set: 'whistleMuseum', npc: { rusty: 1 }, reply: [['rusty', 'The depot? Where people can hear it? ...Graduation is at the depot, right? Leave that with me.']] }]]] }
    ], reward: { rp: 130, loot: 'r' } },
  { id: 'exhibit', d: 4, title: 'Where Is Exhibit A?', giver: 'moore', req: [4, 1], blurb: 'The courthouse cat is missing on the morning of a big trial.',
    offer: [['moore', 'Cadet. Exhibit A is missing. The judge will not start without the cat. I know how that sounds. I have worked here nineteen years. It is how it is.']],
    steps: [
      { at: 'Freedom Bail Bonds', npc: 'ray', who: 'ray', goal: 'Ask Bondsman Ray if he saw the cat', say: [['ray', 'The cat? Took off after a pigeon toward Veterans Memorial Park. Bet you twenty bucks she comes back with it. Not a real bet. I know what you\'re thinking.']], quiz: { n: 2 } },
      { at: 'Veterans Memorial Park', who: 'pike', goal: 'Find Exhibit A at Veterans Memorial Park', say: [['pike', 'Found her! She\'s under the bench. I offered her my Pumpkin Spice Protein Shake and she looked at me like I was a defendant.'],
        ['choice', [
          { t: 'Sit down quietly and let her come to you', set: 'catPatient', npc: { exhibita: 2 }, reply: [['pike', 'Three minutes. She just walked over and sat on your boot. How. HOW.']] },
          { t: 'Scoop her up quickly', set: 'catGrab', reply: [['pike', 'She... did not like that. You have been scratched by the court. Is that contempt? I think that\'s contempt.']] }]]] },
      { at: 'County Courthouse', inside: true, who: 'moore', goal: 'Return Exhibit A to the courthouse', say: [['moore', 'She\'s back. The judge has taken the bench. Court is in session.'], ['moore', 'And she\'s following you. She has never followed anyone. Be honored.', { if: 'catPatient' }], ['moore', 'Ice on those scratches. And maybe don\'t do that again.', { if: 'catGrab' }]] }
    ], reward: { rp: 120, loot: 'r' } },
  { id: 'pike', d: 4, title: 'Pike\'s Report', giver: 'hattie', req: [4, 2], blurb: 'Cadet Pike\'s arrest report was rejected. Again.',
    offer: [['hattie', 'Your classmate Cadet Pike filed his practice report. In highlighter. Every line is highlighted. Nothing is in order. Would you help him before Sgt. Castillo sees it?']],
    steps: [
      { at: 'Objection! Espresso', who: 'pike', goal: 'Find Pike at Objection! Espresso', say: [['pike', 'I know what happened. I just can\'t make it sound like a report. It sounds like a movie trailer.'],
        ['choice', [
          { t: 'Walk him through it, one step at a time', set: 'helpedPike', reply: [['pike', 'Who, what, when, where, how. In order. Facts, not feelings. Okay. Okay, I can do this.']] },
          { t: 'Write it for him', set: 'wrotePike', reply: [['pike', 'You\'re a lifesaver. Castillo will never know.']] },
          { t: 'Tell him to figure it out himself', set: 'leftPike', reply: [['pike', '...Right. Yeah. Thanks.']] }]]], quiz: { n: 2 } },
      { at: 'Quick Copy & Notary', who: 'navarro', goal: 'Have Navarro check the report', say: [['navarro', 'This is so much better. Chronological, specific, no opinions. I only have four notes. That\'s a compliment.', { if: 'helpedPike' }], ['navarro', 'This doesn\'t sound like Pike at all. It sounds like you. Castillo reads everyone\'s reports, you know.', { if: 'wrotePike' }], ['navarro', 'He did it alone. It\'s rough, but it\'s his. I\'ll help him clean it up.', { if: 'leftPike' }]], quiz: { n: 1 } },
      { at: 'Clerk of Court', inside: true, who: 'hattie', goal: 'File the report with Clerk Hattie', say: [['hattie', 'Filed. Stamped. Spelled correctly, thank goodness.'], ['castillo', '(over the radio) Cadet. I read Pike\'s report. It reads exactly like yours. Don\'t do his work for him. It doesn\'t help him on the street.', { if: 'wrotePike' }], ['castillo', '(over the radio) Pike\'s report is actually good. Somebody taught him something. I wonder who.', { if: 'helpedPike' }]] }
    ], reward: { rp: 140, loot: 'r' } }
];

// side-case choices echo through the main story
(function weave() {
  const at = (d, step) => CHAPTERS[d].steps[step];
  at(1, 0).say.push(['castillo', 'And Kevin\'s wallet stub put the sedan at Eastside Plaza the night it was stolen. Good work turning in found property the right way.', { if: 'walletClue' }]);
  at(3, 0).say.push(['castillo', 'Grandma Ruth\'s notebook says the sedan\'s plate started with a 7. So does the swapped plate. Never ignore the porch-sitters.', { if: 'ruthListened' }]);
  at(4, 2).say.splice(1, 0, ['lassiter', 'Ah, the cadet with the cat. Even the courthouse animals like you. How tiresome.', { if: 'catPatient' }]);
  const fin = at(4, CHAPTERS[4].steps.length - 1).say;
  fin.push(
    ['okafor', '(over the radio) The depot clock is on time today, for the first time since 1932. Look up when you cross the stage.', { if: 'clockFixed' }],
    ['okafor', '(over the radio) The depot clock is still five minutes slow. Five extra minutes to be proud, just like the tradition says.', { if: 'clockSlow' }],
    ['rusty', '(over the radio) Listen for the whistle, cadets! 1924 Meridian Line, restored, playing for your graduation!', { if: 'whistleMuseum' }],
    ['ruth', '(over the radio) Maple Court Neighborhood Watch, checking in! Thirty-one members and a tray of lemon bars. Congratulations, dear.', { if: 'ruthWatch' }],
    ['dez', '(over the radio) Yo! Tasha passed her driving test! Parallel parked on the first try. She wants you to know.', { if: 'tashaHelp' }],
    ['pike', 'Hey. Thanks for not writing it for me. I wrote my own. That\'s going to matter out there.', { if: 'helpedPike' }]);
})();
