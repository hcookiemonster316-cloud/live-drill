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
  okonkwo: { name: 'Lt. Femi Okonkwo', role: 'Watch Commander', icon: '🛡️', look: { shirt: '#22355e', pants: '#1b2a4a', hat: 'cap', hatCol: '#16213d', patch: '#f5b800' }, skin: '#5a3620', bio: 'Runs the watch from Patrol HQ. Former Marine, current marathon runner, permanent owner of the best mug in the building. Believes paperwork is just police work that sat down.' },
  velvet: { name: 'Marjorie "Velvet" Hale', role: 'Senior Dispatcher', icon: '🎧', look: { shirt: '#334155', pants: '#1f2937', hat: 'headset', patch: '#9ca3af' }, skin: '#f1c9a5', bio: 'Thirty-one years on the radio. Her voice has talked down storms, standoffs and at least one very angry goose.' },
  pike: { name: 'Cadet Jordan Pike', role: 'Your classmate', icon: '😎', look: { shirt: '#7c8189', pants: '#4b5320', hat: 'cap', hatCol: '#111827', patch: '#f5b800', boots: '#0b0b0b' }, skin: '#e0b48f', bio: 'Top of the class in confidence, middle of the class in everything else. Ran a 5K once and mentions it daily. Will absolutely have your back when it counts.' },
  navarro: { name: 'Cadet Riley Navarro', role: 'Your classmate', icon: '📓', look: { shirt: '#7c8189', pants: '#4b5320', hat: 'cap', hatCol: '#111827', patch: '#f5b800', boots: '#0b0b0b' }, skin: '#c68e63', bio: 'Has highlighted every line of Chapter 5. Twice. Quiet, sharp, and the first person you call when you forget which statute it was.' },
  lassiter: { name: 'Victor Lassiter', role: 'Person of interest', icon: '🕶️', look: { shirt: '#e5e7eb', pants: '#1f2937', tie: '#111827', plain: true, hat: 'none' }, skin: '#f1c9a5', bio: 'Polite, patient and never where the trouble is. Owns a gray sedan he swears he sold last year.' }
};

// the campaign: one chapter per district. Steps send you somewhere (a place name, or a regular's id),
// play a scene there and can ask questions from that district's lessons.
export const CHAPTERS = [
  { d: 0, title: 'First Watch', sub: 'Central District · Unit 1 · Patrol Basics', steps: [
    { at: 'Patrol HQ', inside: true, goal: 'Report to Sgt. Castillo inside Patrol HQ', who: 'castillo', say: [['castillo', 'So you\'re my new cadet. I\'m Sergeant Castillo. I\'ve trained eleven classes, and right now the only thing I know about you is your boots are shined.'], ['castillo', 'That\'s a good start. Out there, people make up their minds about you before you ever say a word. How you stand, where your hands are, whether you look like you know where you\'re going.'], ['castillo', 'Lieutenant Okonkwo runs the watch. Go introduce yourself. And stand up straight, he notices that. So do I.']] },
    { at: 'Patrol HQ', inside: true, goal: 'Check in with Lt. Okonkwo, the watch commander', who: 'okonkwo', say: [['okonkwo', 'Cadet. Have a seat. Actually, no, stand. You\'re going to be standing for thirty years, you might as well get used to it.'], ['okonkwo', 'Before I put you anywhere near the public, I want to know you understand why we patrol in the first place. Not the answer from the brochure. The real one.']], quiz: { les: 0, n: 2 }, after: [['okonkwo', 'Good. Be visible. Get in the way of trouble. And be there when somebody needs a stranger who\'ll actually stop.'], ['okonkwo', 'Go walk downtown and talk to people who don\'t have to talk to you. Head over to Founders Plaza and ask for Delgado. Honestly, he\'ll probably find you first.']] },
    { at: 'Founders Plaza', goal: 'Walk to Founders Plaza and meet the locals', who: 'delgado', npc: 'delgado', say: [['delgado', 'Hey, a new face! You\'re one of Castillo\'s, right? You\'ve got that look, like you\'re memorizing the whole plaza in case there\'s a test.'], ['delgado', 'Since you\'re new, I\'ll give you something for free. Not food, information. There\'s a gray sedan with no hubcaps that\'s been coming around three nights in a row. It circles the plaza after midnight and the driver never gets out.'], ['delgado', 'And he doesn\'t look at the stores. He looks at the people. That\'s what I don\'t like.'], ['castillo', '(over the radio) Good contact, cadet. Now think it through before you go looking for it. If you walked up on that car, what would you be watching for?']], quiz: { les: 1, n: 2 }, after: [['delgado', 'Listen to you! One week and you already sound just like her. Here, have a hot dog. On the house!'],
      ['choice', [
        { t: 'Pay the two dollars anyway', set: 'paidDelgado', trust: 2, npc: { delgado: 1 }, reply: [['delgado', 'Ha! She already got to you. Okay, fine, two dollars. And I\'m telling everybody on this plaza that you\'re honest. Everybody. Even the pigeons.']] },
        { t: 'Take it, he insisted', set: 'freeDog', trust: 0, reply: [['delgado', 'Enjoy! Careful, the mustard\'s a little strong.'], ['castillo', '(over the radio) We\'re going to talk about free food later, cadet. Not right now. Later.']] },
        { t: 'Thank him and say no', set: 'declinedDog', trust: 1, reply: [['delgado', 'No? A cadet turning down a hot dog. I don\'t get it, but I respect it. Come back when you\'re paying.']] }]]] },
    { at: 'Dispatch Center', inside: true, goal: 'Head to the Dispatch Center and meet Velvet', who: 'velvet', say: [['velvet', 'So you\'re the one Dana\'s been bragging about. Don\'t let it go to your head, sugar. She brags about her houseplants too.'], ['velvet', 'I\'ve been sitting in this chair thirty-one years. When you key up on my channel, keep it short, clear and calm, because the next person on the radio might be none of those things.']], quiz: { les: 2, n: 2 }, after: [['velvet', 'You\'ll do fine. Okay, now, about that gray sedan of yours. A guy on the night bus called in a partial plate about an hour ago. Records can run it for you.']] },
    { at: 'Records', inside: true, goal: 'Run the partial plate at Records', who: 'navarro', say: [['navarro', 'Oh! Hi. Castillo sent me to show you the terminal. I, um, might have read the whole manual. Twice. Okay, three times. There are footnotes.'], ['navarro', 'Before we run anything, you should know these databases have rules, and every search you do has your name on it forever. If you misuse it, you lose your access. Or your badge.']], quiz: { les: 3, n: 2 }, after: [['navarro', 'Okay, the partial comes back to a gray sedan that was reported stolen in Eastside two weeks ago.'], ['navarro', 'But the plate that\'s on it now belongs to a totally different car. Somebody swapped them. That takes planning. Joyriders don\'t plan.']] },
    { at: 'Patrol HQ', inside: true, goal: 'Report back to Sgt. Castillo at HQ', who: 'castillo', say: [['castillo', 'A stolen car with a swapped plate, circling the plaza at night, watching people instead of stores. That\'s not a joyride. Somebody\'s shopping.'], ['narr', 'She reads the plate off Navarro\'s printout twice. Then she folds the paper up and puts it in her own pocket instead of the case file.'], ['castillo', 'Good first shift. You talked to people, you listened, and you followed it all the way to a printout. That\'s most of patrol right there.'],
      ['castillo', 'And about the hot dog. Free stuff always comes with strings, even little ones. Somebody always remembers who took what. Just keep that in mind.', { if: 'freeDog' }],
      ['castillo', 'Delgado\'s told the whole plaza you paid for that hot dog. Two dollars. Don\'t laugh. That\'s the cheapest good reputation you\'ll ever buy.', { if: 'paidDelgado' }],
      ['castillo', 'Delgado says you turned down a free hot dog, and he\'s been talking about it for an hour. You confused him. That\'s good.', { if: 'declinedDog' }], ['castillo', 'Learn Central and pass the District Final Call. Then we\'re going to Eastside to find out where that car came from.']], reward: { rp: 150, loot: 'u' } }
  ] },
  { d: 1, title: 'Where the Car Came From', sub: 'Eastside · Unit 2 · Duties on Patrol', steps: [
    { at: 'Substation', inside: true, goal: 'Meet Castillo at the Eastside Substation', who: 'castillo', say: [['castillo', 'Eastside\'s louder than downtown and closer to the highway, and everybody out here knows everybody else\'s car. The sedan was stolen out of the Eastside Plaza lot two weeks ago.'], ['castillo', 'Cadet Pike\'s riding with us today. Try not to let him narrate everything.'], ['pike', 'Did I mention I ran a 5K? Because I did. I ran a 5K.'], ['castillo', 'Twice, Pike. You\'ve mentioned it twice. In the elevator.'],
      ['castillo', 'Kevin\'s wallet puts a man in sunglasses in that same lot the night the car got stolen. Because you turned that wallet in the right way, we\'ve got a witness.', { if: 'walletClue' }]] },
    { at: "Big Earl's Auto", goal: "Ask around at Big Earl's Auto", who: 'earl', npc: 'earl', say: [['earl', 'Gray sedan? Yeah, I put four new tires on one about a month ago. He paid cash. Guy wore sunglasses inside the whole time, which, in my shop, is a choice.'], ['earl', 'Said his name was Vic. Asked me how hard it is to swap license plates. I told him that\'s a felony, and he laughed like I\'d told him a joke.'], ['narr', 'Castillo writes the name down slowly. Her pen stops after the V for a second too long.']], quiz: { les: 5, n: 2 }, after: [['castillo', 'Good questions. Being weird isn\'t a crime. But it\'s a reason to write things down.']] },
    { at: 'Eastgate Motel', goal: 'Respond to the disturbance at the Eastgate Motel', who: 'pike', say: [['pike', 'Somebody\'s yelling in room 12. I\'ll just go knock real quick and...'],
      ['choice', [
        { t: 'Stop Pike and plan the approach', set: 'plannedMotel', reply: [['castillo', 'Good. Pike, you\'re cover. Cadet, you\'re contact. Where are we parking? Where\'s each of us going to stand? Where\'s the back door?']] },
        { t: 'Let Pike take the lead on it', set: 'pikeLed', trust: -1, reply: [['pike', 'Police! Open up! ...Oh no. The back door. Somebody just ran out the back door.'], ['castillo', 'And there he goes, right into a gray sedan. You plan first, every single time. So tell me, how should that have gone?']] }]]], quiz: { les: 4, n: 2 }, after: [['castillo', 'Two young guys arguing about a car one of them "borrowed." There\'s a gray sedan in the lot. One of them says a man named Vic pays good money for cars nobody\'s looking for.', { if: 'plannedMotel' }],
      ['castillo', 'The one who stayed says a guy named Vic pays good money for cars nobody\'s looking for. The one who ran took the car with him.', { if: 'pikeLed' }], ['pike', 'Okay. That was actually pretty cool. I take back half of what I said about planning. Maybe a third.', { if: 'plannedMotel' }], ['pike', 'That one\'s on me. I know it is. I owe you one, and I don\'t forget when I owe somebody.', { if: 'pikeLed' }]] },
    { at: "Rosa's Bodega", goal: "Check in with Rosa at Rosa's Bodega", who: 'rosa', npc: 'rosa', say: [['rosa', 'Mijo! Sit down, sit down. The man with the sunglasses? He buys cigarettes here. Always pays cash, and he always parks around back where my camera can\'t see.'], ['rosa', 'Last week he said something weird to me. "After this week, I won\'t need this neighborhood anymore." He said it like he was taking off a coat.']], quiz: { les: 7, n: 2 }, after: [['castillo', 'Is that a threat, or is he just talking? That\'s your call, cadet. Make it.'],
      ['choice', [
        { t: 'Write it down and report it', set: 'reportedThreat', trust: 1, npc: { rosa: 1 }, reply: [['rosa', 'You\'re writing it down? Good. Forty years on this corner, and nobody ever wrote anything down.']] },
        { t: 'Tell Rosa not to worry about it', set: 'shrugThreat', trust: -2, npc: { rosa: -1 }, reply: [['rosa', '...Okay, mijo. If you say so.'], ['castillo', '(over the radio) Hm. Noted.']] }]]] },
    { at: 'Substation', inside: true, goal: 'Report back to Castillo at the Substation', who: 'castillo', say: [['castillo', 'So we\'ve got a first name, a bunch of stolen cars, and cash for anything nobody\'s looking for. Cars like that either end up in pieces, or they end up carrying something.'], ['pike', 'Sarge, are you okay? You keep saying "Vic" like you\'re trying to remember where you heard it.'], ['castillo', 'Riverside\'s next, Pike. People sell things over there. Let\'s see what\'s for sale.']], reward: { rp: 200, loot: 'u' } }
  ] },
  { d: 2, title: 'Everything Has a Serial Number', sub: 'Riverside · Unit 3 · Non-Criminal Calls', steps: [
    { at: 'Substation', inside: true, goal: 'Meet Castillo at the Riverside Substation', who: 'castillo', say: [['castillo', 'Riverside is all the calls nobody makes movies about. Lockouts, welfare checks, lost dogs, found wallets, a grandma who didn\'t pick up her newspaper.'], ['castillo', 'If you handle those well, then when something big happens here, people will open the door for you. If you handle them badly, they won\'t.']] },
    { at: 'Riverside School', goal: 'Talk to Ms. Johnson, the crossing guard', who: 'johnson', npc: 'johnson', say: [['johnson', 'Officer, Mrs. Benoit on Willow hasn\'t picked up her newspaper in three days. Toby the mail carrier noticed too. That\'s two of us. That\'s not like her at all.']], quiz: { les: 9, n: 2 }, after: [['johnson', 'She slipped in the tub? Since Saturday? Oh, Lord. Is she okay? ...Thank you for knocking twice. Most people knock once and leave.']] },
    { at: 'River Pawn', inside: true, goal: 'Check the pawn records at River Pawn', who: 'navarro', say: [['navarro', 'The pawn log flagged a TV. The serial number matches a burglary report from last month. And look at the seller\'s ID.'], ['navarro', 'V. Lassiter. Victor Lassiter. Vic.'], ['castillo', '...Run it again.'], ['navarro', 'It\'s the same, Sarge. It\'s him. Do you... know him?'], ['castillo', 'Run the next one, Navarro.']], quiz: { les: 13, n: 2 }, after: [['castillo', 'The owner\'s out front. She wants her TV back right now. She has a receipt, and she\'s not wrong. It\'s your call, cadet.'],
      ['choice', [
        { t: 'Photograph it, log it, hold it', set: 'heldEvidence', reply: [['castillo', 'Okay, it\'s photographed and logged, and she\'s leaving with a receipt and a case number. She\'s mad today. She\'ll get it back when it\'s released, and it\'ll still be good evidence.']] },
        { t: 'Hand it back to her right now', set: 'gaveTV', trust: 2, reply: [['castillo', 'She\'s thrilled. But the evidence log is going to be a little thin. Somebody\'s going to notice that someday. Just something to think about.']] }]],
      ['castillo', 'So. Now our sedan has a full name.']] },
    { at: 'Riverside Marina', goal: 'Ask Captain Hal about the river', who: 'hal', npc: 'hal', say: [['hal', 'Lassiter? He keeps a boat in slip nine under his sister\'s name. Hasn\'t taken it out since spring, but he still pays the slip fee. Cash, always early.'], ['hal', 'A guy who pays early for a boat he never takes out isn\'t a sailor. I saw him carry some boxes off it last week into a gray car. He was careful with them, like they were eggs.']], quiz: { les: 11, n: 2 }, after: [['castillo', 'Boxes going from a boat to a car. They\'re sitting somewhere in this city right now.']] },
    { at: 'Substation', inside: true, goal: 'Report back to Castillo', who: 'castillo', say: [['castillo', 'Stolen cars, stolen property, a boat that never leaves the dock, and boxes that need somewhere to go. Where do people in this city keep stuff they don\'t want found?'], ['pike', '...A storage unit?'], ['castillo', 'Industrial Park. Bring your flashlight, Pike. And bring your patience. Mostly the patience.']], reward: { rp: 250, loot: 'r' } }
  ] },
  { d: 3, title: 'Clear Every Corner', sub: 'Industrial Park · Unit 4 · Structure and Area Searches', steps: [
    { at: 'Substation', inside: true, goal: 'Meet Castillo at the Industrial Park Substation', who: 'castillo', say: [['castillo', 'Lock-It Storage. Somebody pried the door on unit 14 last night. The night guard called it in and waited outside instead of trying to be a hero. That\'s smart. Not many people do that.'], ['castillo', 'It\'s a sim round, but we\'re searching it like it\'s real. Slow is smooth, and smooth is fast.'],
      ['castillo', 'And Grandma Ruth\'s notebook says the sedan\'s plate started with a 7. So does the swapped one. Never ignore the people sitting on their porches, cadet.', { if: 'ruthListened' }]] },
    { at: 'Lock-It Storage', inside: true, goal: 'Search Lock-It Storage by the book', who: 'carl', npc: 'carl', say: [['carl', 'Unit 14. Pried at the top corner, like somebody who\'s done it before. I didn\'t go in, and I didn\'t touch the door. I figured that\'s your job, and I like keeping mine.']], quiz: { les: 17, n: 3 }, after: [['navarro', 'TVs, laptops, power tools. Every serial number I check is on a burglary report. Every single one.'], ['navarro', 'The unit\'s rented to a company called "VL Holdings." V. L.']] },
    { at: 'Eastline Rail Yard', goal: 'Set a perimeter at the rail yard', who: 'pike', say: [['pike', 'Somebody just ran out of the storage lot! He\'s going into the rail yard!'], ['castillo', 'We are not chasing him into a maze of boxcars. We contain it. Perimeter first, then we search it together, in order.']], quiz: { les: 18, n: 3 }, after: [['pike', 'I\'ve got the north corner. I owe you one from the motel. He\'s not getting past me.', { if: 'pikeLed' }],
      ['narr', 'Twenty minutes later, behind a boxcar: out of breath, nineteen years old, with a fresh scar along his jaw from a car accident.'], ['castillo', 'That\'s Danny Ortega. Rosa\'s grandson.'],
      ['choice', [
        { t: 'Tell him his grandmother asked you to bring him home', set: 'dannyHome', npc: { rosa: 2 }, reply: [['narr', 'He sits down on the gravel like all the fight just went out of him.'], ['danny', 'She said that? After everything I did? ...Okay. Okay. I\'ll tell you whatever you want to know.']] },
        { t: 'Tell him plainly how much trouble he is in', set: 'dannyHard', reply: [['danny', 'I know how much trouble I\'m in. I\'ve known for a month.'], ['narr', 'He stares at the ground for a long time. Then he starts talking anyway.']] }]],
      ['danny', 'Vic pays me fifty bucks a car to move them. Boxes too. He does paperwork for a bail bonds office, so he\'s at the courthouse every morning for first appearances. Nine o\'clock sharp. Every day.'], ['danny', 'He says cops are easy. He says he almost was one.']] },
    { at: 'Substation', inside: true, goal: 'Report back to Castillo', who: 'castillo', say: [['castillo', 'Stolen property in his company\'s unit, a boat full of stuff, a stolen sedan, and a witness who walked into this scared and is walking out honest. That\'s enough for a warrant.'], ['castillo', 'Tomorrow, nine o\'clock sharp, Justice Row. We know exactly where he\'ll be. We do this right, or we don\'t do it at all.'], ['pike', 'Sarge. That photo. Are you okay being there?'], ['castillo', 'That\'s exactly why I\'m going to be there, Pike.']], reward: { rp: 300, loot: 'r' } }
  ] },
  { d: 4, title: 'By the Book', sub: 'Justice Row · Unit 5 · Arrest Procedures', steps: [
    { at: 'Substation', inside: true, goal: 'Meet Castillo at the Justice Row Substation', who: 'castillo', say: [['castillo', 'The warrant\'s signed. He\'s in the courthouse filing bond paperwork like it\'s any other morning. Calm, polite, and sure he\'s the smartest guy in the building.'], ['castillo', 'You\'re making the arrest, not me. I\'ll be right behind you, and I\'m staying right there. You know how to do this.']] },
    { at: 'Clerk of Court', inside: true, goal: 'Confirm the warrant with Clerk Hattie', who: 'hattie', npc: 'hattie', say: [['hattie', 'Lassiter, Victor A. Active warrant, signed at seven-forty this morning. Date of birth matches. And it\'s spelled right, thank goodness.']], quiz: { les: 19, n: 2 }, after: [['hattie', 'It\'s confirmed. Go on, honey. Do it right. Do it so nobody can ever say you didn\'t.']] },
    { at: 'County Courthouse', inside: true, goal: 'Make the arrest at the County Courthouse', who: 'lassiter', say: [['lassiter', 'Officer. Or, I\'m sorry, cadet? How sweet. Dana sent a cadet. You\'ll find I haven\'t done anything at all.'],
      ['lassiter', 'Oh, you\'re the cadet with the cat. Even the courthouse animals like you. That must be exhausting.', { if: 'catPatient' }],
      ['lassiter', 'I remember you. Delgado\'s free lunch. Everybody in this city takes something, cadet. It\'s just a matter of the price. So what\'s yours?', { if: 'freeDog' }],
      ['lassiter', 'You\'re the one who paid for the two-dollar hot dog. Delgado tells everybody. I guess you think that makes you different.', { if: 'paidDelgado' }],
      ['lassiter', 'I\'m sure we can talk about this like reasonable people, before anybody does something they can\'t take back.', { unless: 'freeDog' }],
      ['choice', [
        { t: '"You\'re under arrest. That\'s the conversation."', set: 'firmArrest', reply: [['castillo', 'Mr. Lassiter, there\'s a warrant out for your arrest. The cadet is going to explain what happens next.']] },
        { t: '"Go ahead. Say what you came to say."', set: 'heardOffer', reply: [['lassiter', 'Here, take my card. There\'s a little something folded up inside. For your trouble, and for keeping this between us.'], ['castillo', 'That\'s a bribe, offered in front of two officers. That\'s a second charge now, Mr. Lassiter. Cadet, write down the time, then explain what happens next.']] }]]], quiz: { les: 19, n: 3 }, after: [['lassiter', '...I want my lawyer.'], ['castillo', 'That\'s your right, and you\'ll get one. Cadet, take him to booking.']] },
    { at: 'County Jail', inside: true, goal: 'Book Lassiter at the County Jail', who: 'ramos', npc: 'ramos', say: [['ramos', 'Search him again before he comes through my door. I don\'t care who searched him upstairs. Property bag sealed, inventoried and signed, paperwork done. Then he\'s mine.']], quiz: { les: 20, n: 3 }, after: [['ramos', 'Clean booking. Not one box out of place. Castillo trained you right.'],
      ['ramos', 'And those pictures and logs from the pawn shop TV? The prosecutor says that\'s what\'s going to make the property charges stick. Somebody did the boring part. Thank you.', { if: 'heldEvidence' }],
      ['ramos', 'The prosecutor says that stolen TV went home before anybody took a picture of it. His lawyer\'s going to love that. It\'s still a strong case. Just a little less strong.', { if: 'gaveTV' }],
      ['ramos', 'And that threat you wrote down at Rosa\'s? It\'s in the file. "After this week, I won\'t need this neighborhood." It shows he was planning to run. Good instinct.', { if: 'reportedThreat' }]] },
    { at: 'Justice Plaza', goal: 'Meet everyone at Justice Plaza', who: 'castillo', say: [['castillo', 'Five districts. You listened to people, you wrote things down, you followed the evidence, and you didn\'t cut a single corner. Not one.'],
      ['castillo', 'I owe you the rest of the story. Week nine of the academy, 2003. Vic got his hands on the exam answers. He offered me a copy for free. I said no, and I reported him. He washed out that Friday.'],
      ['castillo', 'For twenty-three years I\'ve wondered if I could have said something different. Something that might have kept him. Today I watched a cadet turn down a free hot dog, and I finally stopped wondering.', { unless: 'freeDog' }],
      ['castillo', 'For twenty-three years I\'ve wondered if I could have said something different. Something that might have kept him. Today you showed me it\'s not about the right speech. It\'s about habits. So start building yours.', { if: 'freeDog' }],
      ['pike', 'I\'d like it on the record that I helped. And also that I ran a 5K.'], ['navarro', 'I\'m highlighting this moment. In my head. In yellow.'],
      ['delgado', '(over the radio) This is Delgado! I heard it on the scanner. The honest cadet! You still have to pay for your next hot dog. But I\'m going to be very proud while you do it.', { if: 'paidDelgado' }], ['velvet', '(over the radio) All units, be advised, Port Meridian\'s got a new officer in training who did good work today. Velvet clear. ...And Dana? I\'m proud of you too, hon.'], ['castillo', 'Graduation\'s at Founders Park, under the old depot clock. You earned every minute of it, cadet.']], reward: { rp: 500, loot: 'l' } }
  ] }
];

// ---------- side cases ----------
// Each district has its own side cases, offered by a regular once the main story reaches that point.
// They are optional, they can be tracked from the Field Journal, and their choices ripple into the main story.
// req: [district, main-story step reached]. Steps use the same format as the main story.
export const MAIN_TITLE = 'The Gray Sedan';
export const SIDE = [
  { id: 'wallet', d: 0, title: 'Finders, Keepers, Reporters', giver: 'dot', req: [0, 1], blurb: 'Dot found a wallet in booth 4 of the Night Owl Diner.',
    offer: [['dot', 'Hon, you got a minute? Somebody left a wallet in booth four. A thick one. I don\'t want to be the one who gets blamed if it comes up short.']],
    steps: [
      { at: 'Night Owl Diner', npc: 'dot', who: 'dot', goal: 'Look at the wallet with Dot at the Night Owl', say: [['dot', 'Here it is. I haven\'t opened it. I watch the true crime shows, I know how this goes.'],
        ['choice', [
          { t: 'Inventory it with Dot as a witness', set: 'walletWitness', npc: { dot: 1 }, reply: [['dot', 'Forty-two dollars, a library card, an ID and a parking stub. I\'ll sign whatever you need, hon.']] },
          { t: 'Count it yourself, quickly', set: 'walletAlone', trust: -1, reply: [['dot', 'Hon, if I were you, I\'d want a witness. People remember things wrong when there\'s money involved.']] }]]], quiz: { n: 2 } },
      { at: 'Records', inside: true, who: 'navarro', goal: 'Run the owner\'s ID at Records', say: [['navarro', 'The ID comes back to Kevin Park. He works IT at Meridian Office Tower. No warrants, no flags.'], ['navarro', 'Wait, look at the parking stub. Eastside Plaza, dated the night the gray sedan was stolen. Same lot.'], ['navarro', 'I\'m putting a note in the case file. A coincidence is just evidence nobody\'s looked at yet.']], after: [['castillo', '(over the radio) Good catch. Return the wallet, and then let\'s ask Kevin what he saw that night.']], set: 'walletClue' },
      { at: 'Meridian Office Tower', npc: 'kevin', who: 'kevin', goal: 'Return the wallet to Kevin at the office tower', say: [['kevin', 'My wallet! I turned the whole building off and back on looking for it.'],
        ['kevin', 'And everything\'s still in here. Forty-two dollars. And you got a receipt signed by Dot? That\'s the most organized thing that\'s ever happened to me.', { if: 'walletWitness' }],
        ['kevin', 'Huh, I thought there was more cash in here... oh wait, no, that was last week. Sorry. You get a little paranoid.', { if: 'walletAlone' }],
        ['kevin', 'That night at Eastside Plaza? I saw a guy in sunglasses walking around the lot. At night. I remember thinking, who wears sunglasses at night?']] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'clock', d: 0, title: 'Five Minutes Slow', giver: 'okafor', req: [0, 3], blurb: 'Ms. Okafor wants to find the lost winding key of the depot clock.',
    offer: [['okafor', 'Cadet, the depot clock has run five minutes slow since 1932. The original winding key went missing that same year.'], ['okafor', 'I found a note in the archive that says, "The key rests where Judge rested." Judge was the department\'s first horse. Would you help an old librarian with a really old mystery?']],
    steps: [
      { at: 'Founders Park', npc: 'pruitt', who: 'pruitt', goal: 'Ask Sgt. Pruitt (Ret.) where Judge was stabled', say: [['pruitt', 'Judge\'s stable? My grandfather used to shovel it out. It was right where the Transit Center is now. The pigeons still remember. Look at them. They know.'],
        ['choice', [
          { t: 'Ask Pruitt to come along', set: 'pruittAlong', npc: { pruitt: 1 }, reply: [['pruitt', 'Ha! I haven\'t worked a case since 1998. I\'ll bring the pigeons. Well, not all of them.']] },
          { t: 'Thank him and go on your own', reply: [['pruitt', 'Go ahead, then. If you find that key, tell Judge I said hello.']] }]]], quiz: { n: 1 } },
      { at: 'Downtown Transit Center', npc: 'marcus', who: 'marcus', goal: 'Search the old stable site at the Transit Center', say: [['marcus', 'The old horse plaque? Yeah, it\'s behind the bike racks. There\'s a little brass door in it. I never opened it. I figured it was haunted.'], ['pruitt', 'Well, would you look at that. A brass key, green as a pickle.', { if: 'pruittAlong' }],
        ['choice', [
          { t: 'Log it as found property and bring it to the library', set: 'clockLogged', trust: 1, reply: [['castillo', '(over the radio) Even a ninety-year-old key gets documented. Nice work.']] },
          { t: 'Pocket it and hand it over yourself', set: 'clockPocket', reply: [['castillo', '(over the radio) Write it down anyway, cadet. Found property is found property, no matter how old it is.']] }]]] },
      { at: 'Central Library', npc: 'okafor', who: 'okafor', goal: 'Bring the key to Ms. Okafor', say: [['okafor', 'Ninety-four years, and you found it in one afternoon. Okay. Now the hard question.'], ['okafor', 'The city\'s been arguing about this for decades. Do we fix the clock, or leave it five minutes slow?'],
        ['choice', [
          { t: 'Wind it to the right time', set: 'clockFixed', reply: [['okafor', 'On time, then. The whole city\'s going to be early for once.']] },
          { t: 'Leave it five minutes slow', set: 'clockSlow', reply: [['okafor', 'Tradition it is. Five extra minutes for everybody, forever.']] }]]] }
    ], reward: { rp: 140, loot: 'r' } },
  { id: 'ghostcar', d: 1, title: 'Earl\'s Ghost Car', giver: 'earl', req: [1, 2], blurb: 'A car keeps appearing in Big Earl\'s lot at night with the radio on.',
    offer: [['earl', 'Cadet, don\'t laugh at me. Every night a car shows up in my back lot with the radio playing and the engine running, and by morning it\'s gone. My nephew says it\'s a ghost. I say ghosts don\'t buy gas.']],
    steps: [
      { at: "Big Earl's Auto", npc: 'earl', who: 'earl', goal: 'Look over Big Earl\'s back lot', say: [['earl', 'The tire marks go back and forth, back and forth, right between my two cones. It\'s like somebody\'s practicing something.']], quiz: { n: 2 } },
      { at: 'Eastside Community Center', npc: 'dez', who: 'dez', goal: 'Ask Dez what the kids are saying', say: [['dez', 'Okay, okay. It\'s my cousin Kiara. She\'s got her driving test on Friday and she can\'t parallel park. She takes her mom\'s car out at night so nobody sees her mess up.'],
        ['choice', [
          { t: 'Give her a warning and talk to her mom', set: 'tashaWarn', npc: { dez: 1 }, reply: [['dez', 'Her mom\'s going to be mad. But not as mad as if you wrote her up. Thank you.']] },
          { t: 'Cite her for driving without a licensed adult', set: 'tashaCite', npc: { dez: -1 }, reply: [['dez', '...Yeah. Okay. I guess that\'s fair.'], ['castillo', '(over the radio) By the book. Sometimes the book\'s all we\'ve got.']] },
          { t: 'Set up daylight practice at the community center lot', set: 'tashaHelp', trust: 1, npc: { dez: 2 }, reply: [['dez', 'Wait, for real? With an actual adult? And cones? She\'s going to cry. Like, happy crying.']] }]]] },
      { at: "Big Earl's Auto", npc: 'earl', who: 'earl', goal: 'Tell Big Earl what you found', say: [['earl', 'A sixteen-year-old and a parallel parking test. That\'s scarier than any ghost.'],
        ['earl', 'Daylight practice? I\'ll bring my good cones. The orange ones. Those are serious cones.', { if: 'tashaHelp' }],
        ['earl', 'A ticket, huh. Well, she won\'t do it again. I guess that\'s the point.', { if: 'tashaCite' }]] }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'ruth', d: 1, title: 'The Maple Court Notebook', giver: 'ruth', req: [1, 1], blurb: 'Grandma Ruth has been keeping a notebook of everything that happens on Maple Court.',
    offer: [['ruth', 'Young man, I keep a notebook. Everything that happens on Maple Court gets written down. Most of it\'s about the mailman. Would you take a look? Nobody ever looks at it.']],
    steps: [
      { at: 'Maple Court', npc: 'ruth', who: 'ruth', goal: 'Read Grandma Ruth\'s notebook', say: [['ruth', 'Entry one: the mailman whistles. Entry two: the mailman whistles a different song. You see the pattern.'],
        ['choice', [
          { t: 'Go through every entry with her', set: 'ruthListened', npc: { ruth: 1 }, reply: [['ruth', 'Entry fourteen. A gray car idling on Birch Lane at three in the morning, two different nights. The plate starts with a 7. I couldn\'t see the rest without my good glasses.']] },
          { t: 'Skim it and thank her', set: 'ruthSkimmed', reply: [['ruth', 'Oh. Well, thank you, dear. Nobody ever reads past the mailman.']] }]]] },
      { at: 'Birch Lane', who: 'castillo', goal: 'Canvass Birch Lane', say: [['castillo', 'Knock, introduce yourself, and listen more than you talk. Somebody always saw something.'], ['castillo', 'A plate starting with a 7 matches what we have on the sedan. That notebook\'s evidence now.', { if: 'ruthListened' }]], quiz: { n: 2 } },
      { at: 'Maple Court', npc: 'ruth', who: 'ruth', goal: 'Report back to Grandma Ruth', say: [['ruth', 'So I\'m not just a nosy old woman after all? Well, I am. But I\'m a useful one.'],
        ['choice', [
          { t: 'Help her start a real neighborhood watch', set: 'ruthWatch', trust: 2, npc: { ruth: 1 }, reply: [['ruth', 'A real one? With meetings? I\'ll make lemon bars. Nobody skips a meeting when there are lemon bars.']] },
          { t: 'Ask her to call the non-emergency line next time', reply: [['ruth', 'I\'ll put the number on the fridge, dear. Right next to the mailman\'s schedule.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'gameday', d: 2, title: 'Game Day', giver: 'sam', req: [2, 1], blurb: 'The Meridian Gators are playing at River Stadium, and everything is happening at once.',
    offer: [['sam', 'It\'s game day. Forty thousand fans, three parking lots and one bridge. Engine 3\'s on standby. Want to see what game day looks like from our side?']],
    steps: [
      { at: 'River Stadium', who: 'castillo', goal: 'Help with traffic at River Stadium', say: [['castillo', 'Game day means traffic, lost kids, and one guy who thinks the parking rules don\'t apply to him. Stay visible, stay calm, and keep the lanes open.']], quiz: { n: 2 } },
      { at: 'Riverside Park', npc: 'gus', who: 'gus', goal: 'Check on Old Gus at Riverside Park', say: [['gus', 'This little guy in the Gators jersey says he lost his mom. I\'ve been teaching him to fish so he won\'t cry. He\'s a natural.'],
        ['choice', [
          { t: 'Radio a description and wait with Gus', set: 'kidRadio', reply: [['velvet', '(over the radio) Found the mother at Gate C. She\'s on her way to the park now. Tell Gus she says thank you.']] },
          { t: 'Walk the child back to the stadium info booth', set: 'kidBooth', reply: [['castillo', '(over the radio) The booth has the mom. Next time, think about whether she might be walking toward you while you\'re walking away from her.']] }]]] },
      { at: 'River Stadium', npc: 'sam', who: 'sam', goal: 'Wrap up with Firefighter Sam', say: [['sam', 'The kid\'s back with his mom, the lanes are clear, and the Gators lost by a field goal. Perfect game day.'],
        ['sam', 'And the mom got Gus season tickets. He says he\'s never going to use them. He\'s going to use them.', { if: 'kidRadio' }]] }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'garden', d: 2, title: 'Mrs. Benoit\'s Garden', giver: 'miguel', req: [2, 2], blurb: 'Someone has been in Mrs. Benoit\'s garden at night.',
    offer: [['miguel', 'Mrs. Benoit is home and getting better, thanks to you. But she says somebody\'s been in her garden at night. She\'s scared. Would you look into it?']],
    steps: [
      { at: 'Willow Street', who: 'castillo', goal: 'Look over Mrs. Benoit\'s garden on Willow Street', say: [['castillo', 'Small footprints. A watering can that wasn\'t here yesterday. And the tomatoes look better than mine ever have.']], quiz: { n: 2 } },
      { at: 'Riverside Vet Clinic', who: 'navarro', goal: 'Review the trail camera at the Vet Clinic', say: [['navarro', 'The vet let us borrow her trail camera. Night one, a raccoon. Night two, the same raccoon. Night three... a teenager watering the tomatoes. It\'s her grandson.'],
        ['choice', [
          { t: 'Tell Mrs. Benoit who has been helping', set: 'toldAlvarez', reply: [['navarro', 'She\'s going to cry. The good kind, I think.']] },
          { t: 'Let her grandson tell her himself', set: 'keptSecret', reply: [['navarro', 'Give him the chance to do it right. I like that.']] }]]] },
      { at: 'Community Church', npc: 'miguel', who: 'miguel', goal: 'Let Father Miguel know', say: [['miguel', 'Her grandson was afraid she\'d worry if she knew he was out at night, so he ended up making her worry about a stranger instead. Teenagers.'],
        ['miguel', 'He went and told her himself this morning. They sat in the garden together for two hours. Thank you for giving him that.', { if: 'keptSecret' }],
        ['miguel', 'She knows now, and she\'s already got him working on the fence. He seems happy about it. Mostly.', { if: 'toldAlvarez' }]] }
    ], reward: { rp: 140, loot: 'r' } },
  { id: 'lunch', d: 3, title: 'The Case of the Missing Lunch', giver: 'gerald', req: [3, 1], blurb: 'Somebody keeps stealing Gerald\'s lunch from the Coastline Freight break room.',
    offer: [['gerald', 'Cadet, I drive a forklift ten hours a day, and nine of those hours I\'m thinking about my lunch. Three days in a row now, my lunch is gone. I\'m not okay.']],
    steps: [
      { at: 'Coastline Freight', npc: 'gerald', who: 'gerald', goal: 'Search the Coastline Freight break room', say: [['gerald', 'The fridge door was left open. The bag\'s torn, not opened. And there\'s mud on the floor by the loading dock door.']], quiz: { n: 2 } },
      { at: 'The Lunch Pail', npc: 'lupe', who: 'lupe', goal: 'Ask Lupe about the loading dock', say: [['lupe', 'There are muddy paw prints across my patio every morning at eleven. Big ones. That\'s Trucker Dee\'s dog, Diesel. He has great taste in tacos and no shame at all.']] },
      { at: 'Big Rig Truck Stop', npc: 'dee', who: 'dee', goal: 'Talk to Trucker Dee about Diesel', say: [['dee', 'Diesel? He\'s been sneaking out the cab window. He came back with a sandwich yesterday, and I thought, where did you get a sandwich?'],
        ['choice', [
          { t: 'Help Dee rig a better latch and pay Gerald back', set: 'dieselLatch', npc: { dee: 1, gerald: 1 }, reply: [['dee', 'That\'s fair. I\'ll buy the man lunch for a week. Diesel says he\'s sorry. Diesel does not look sorry.']] },
          { t: 'Write Dee a warning about the loose dog', set: 'dieselWarn', reply: [['dee', 'Yeah, okay. Leash law. I hear you.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'whistle', d: 3, title: 'The Midnight Whistle', giver: 'carl', req: [3, 2], blurb: 'A steam whistle has been screaming from North Spur Yard at midnight.',
    offer: [['carl', 'Every night at midnight there\'s a steam whistle out at North Spur Yard. There hasn\'t been a steam train here since 1961. I\'m not saying it\'s haunted. I\'d just really like you to tell me it isn\'t.']],
    steps: [
      { at: 'North Spur Yard', who: 'pike', goal: 'Check North Spur Yard with Pike', say: [['pike', 'Okay, I hear it. I\'ll go in and grab whoever it is.'],
        ['choice', [
          { t: 'Hold a perimeter and wait for the next one', set: 'whistlePlan', reply: [['pike', 'Fine. Waiting. ...There! It\'s coming from over the fence. From the scrapyard.']] },
          { t: 'Let Pike go in and find the source', set: 'whistlePike', trust: -1, reply: [['pike', 'Going in! ...I\'m in a puddle. It\'s a really deep puddle. The whistle\'s coming from the scrapyard, by the way.']] }]]], quiz: { n: 2 } },
      { at: "Rusty's Scrap & Salvage", npc: 'rusty', who: 'rusty', goal: 'Find the whistle at Rusty\'s Scrap & Salvage', say: [['rusty', 'Guilty. It\'s a 1924 steam whistle off the old Meridian Line. Took me two years to restore it. I test it at midnight because that\'s when the compressor\'s free.'],
        ['choice', [
          { t: 'Ask him to test it during the day', set: 'whistleDay', reply: [['rusty', 'During the day, huh? I guess the neighbors deserve some sleep. Fine.']] },
          { t: 'Suggest he lend it to the depot museum', set: 'whistleMuseum', npc: { rusty: 1 }, reply: [['rusty', 'The depot? Where people can actually hear it? ...Graduation\'s under the old depot clock, isn\'t it? Leave that with me.']] }]]] }
    ], reward: { rp: 130, loot: 'r' } },
  { id: 'exhibit', d: 4, title: 'Where Is Exhibit A?', giver: 'moore', req: [4, 1], blurb: 'The courthouse cat is missing on the morning of a big trial.',
    offer: [['moore', 'Cadet, Exhibit A is missing. The judge won\'t start without the cat. I know how that sounds. I\'ve worked here nineteen years. That\'s just how it is.']],
    steps: [
      { at: 'Freedom Bail Bonds', npc: 'ray', who: 'ray', goal: 'Ask Bondsman Ray if he saw the cat', say: [['ray', 'The cat? She took off after a pigeon toward Veterans Memorial Park. I bet you twenty bucks she comes back with it. Not a real bet. I know what you\'re thinking.']], quiz: { n: 2 } },
      { at: 'Veterans Memorial Park', who: 'pike', goal: 'Find Exhibit A at Veterans Memorial Park', say: [['pike', 'Found her! She\'s under the bench. I offered her some of my pumpkin spice protein shake and she looked at me like I was on trial.'],
        ['choice', [
          { t: 'Sit down and let her come to you', set: 'catPatient', npc: { exhibita: 2 }, reply: [['pike', 'Three minutes. She just walked over and sat on your boot. How? How?']] },
          { t: 'Scoop her up before she bolts', set: 'catGrab', reply: [['pike', 'She... did not like that. You just got scratched by the court. Is that contempt? I think that\'s contempt.']] }]]] },
      { at: 'Justice Plaza', who: 'moore', goal: 'Return Exhibit A to her sunny spot at Justice Plaza', say: [['moore', 'She\'s back on her step and the judge is on the bench. Court\'s in session.'], ['moore', 'And now she\'s following you. She\'s never followed anybody. You should feel honored.', { if: 'catPatient' }], ['moore', 'Put some ice on those scratches. And maybe don\'t do that again.', { if: 'catGrab' }]] }
    ], reward: { rp: 120, loot: 'r' } },
  { id: 'pike', d: 4, title: 'Pike\'s Report', giver: 'hattie', req: [4, 2], blurb: 'Cadet Pike\'s arrest report was rejected. Again.',
    offer: [['hattie', 'Your classmate, Cadet Pike, turned in his practice report. In highlighter. Every line\'s highlighted and nothing\'s in order. Would you help him before Sergeant Castillo sees it?']],
    steps: [
      { at: 'Objection! Espresso', who: 'pike', goal: 'Find Pike at Objection! Espresso', say: [['pike', 'I know what happened. I just can\'t make it sound like a report. It keeps sounding like a movie trailer.'],
        ['choice', [
          { t: 'Walk him through it step by step', set: 'helpedPike', reply: [['pike', 'Who, what, when, where, how. In order. Facts, not feelings. Okay. Okay, I can do this.']] },
          { t: 'Write it for him to save time', set: 'wrotePike', reply: [['pike', 'You\'re a lifesaver. Castillo\'s never going to know.']] },
          { t: 'Tell him to work it out himself', set: 'leftPike', reply: [['pike', '...Right. Yeah. Thanks.']] }]]], quiz: { n: 2 } },
      { at: 'Quick Copy & Notary', who: 'navarro', goal: 'Have Navarro check the report', say: [['navarro', 'This is so much better. It\'s in order, it\'s specific, and there aren\'t any opinions in it. I only have four notes. That\'s a compliment.', { if: 'helpedPike' }], ['navarro', 'This doesn\'t sound like Pike at all. It sounds like you. Castillo reads everybody\'s reports, you know.', { if: 'wrotePike' }], ['navarro', 'He did it by himself. It\'s rough, but it\'s his. I\'ll help him clean it up.', { if: 'leftPike' }]], quiz: { n: 1 } },
      { at: 'Clerk of Court', inside: true, who: 'hattie', goal: 'File the report with Clerk Hattie', say: [['hattie', 'Filed and stamped. And it\'s spelled right, thank goodness.'], ['castillo', '(over the radio) Cadet, I read Pike\'s report. It reads exactly like yours. Don\'t do his work for him. That doesn\'t help him out on the street.', { if: 'wrotePike' }], ['castillo', '(over the radio) Pike\'s report is actually good. Somebody taught him something. I wonder who.', { if: 'helpedPike' }]] }
    ], reward: { rp: 140, loot: 'r' } }
];

// side-case choices echo through the main story
(function weave() {
  const at = (d, step) => CHAPTERS[d].steps[step];
  const fin = at(4, CHAPTERS[4].steps.length - 1).say;
  fin.push(
    ['okafor', '(over the radio) The depot clock is on time today for the first time since 1932. Look up when you walk across the stage.', { if: 'clockFixed' }],
    ['okafor', '(over the radio) The depot clock\'s still five minutes slow. Five extra minutes to be proud, just like the tradition says.', { if: 'clockSlow' }],
    ['rusty', '(over the radio) Listen for the whistle, cadets! That\'s the 1924 Meridian Line whistle, all fixed up and playing for your graduation!', { if: 'whistleMuseum' }],
    ['ruth', '(over the radio) This is the Maple Court Neighborhood Watch checking in! Thirty-one members and a tray of lemon bars. Congratulations, dear.', { if: 'ruthWatch' }],
    ['dez', '(over the radio) Yo! Kiara passed her driving test! She parallel parked on the first try. She wanted you to know.', { if: 'tashaHelp' }],
    ['pike', 'Hey. Thanks for not writing it for me. I wrote my own. That\'s going to matter out there.', { if: 'helpedPike' }]);
})();
