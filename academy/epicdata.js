// Content for the epic layer: chapter endings, the Ledger mystery, the rival cadet, crime-scene investigations,
// report writing, background radio traffic, weather calls and loading-screen tips.
import { SIDE2, SIDE_CAST } from './sidequests.js';

// ---------- 6. chapter endings: earlier choices plus district trust plus one last reflection pick the ending ----------
export const ENDING_FLAGS = [
  { good: ['paidDelgado', 'declinedDog'], bad: ['freeDog'] },
  { good: ['plannedMotel', 'reportedThreat'], bad: ['pikeLed', 'shrugThreat'] },
  { good: ['heldEvidence', 'walletWitness', 'clockLogged'], bad: ['gaveTV', 'walletAlone', 'clockPocket'] },
  { good: ['dieselLatch', 'ruthListened', 'ruthWatch'], bad: ['ruthSkimmed'] },
  { good: ['firmArrest'], bad: ['heardOffer'] }
];
export const ENDINGS = [
  { q: 'Castillo leans on the HQ counter. "First watch, done. How do you want to remember it?"', A: ['The Cadet Who Paid', [['castillo', 'Delgado told the whole plaza you paid for that hot dog. Two dollars. You know what that got you? Every vendor on Founders Plaza knows your name now.'], ['narr', 'Castillo opens up a beat-up notebook and writes your call sign on a page that doesn\'t have many names on it.'], ['castillo', 'Don\'t let it go to your head. Go home and get some sleep.']]],
    B: ['Learning the Beat', [['castillo', 'Not bad. Not great. You talked to people, which is more than most rookies do.'], ['castillo', 'Tomorrow, think about how it looks before you do it. Every time. People are watching even when you don\'t think anybody is.']]],
    C: ['Free Lunch', [['castillo', 'That hot dog, cadet. It wasn\'t a crime. But nothing in this job is free. Somebody always remembers who took what.'], ['narr', 'Delgado waves as you leave. It\'s a smaller wave than this morning.'], ['castillo', 'You\'ll earn it back. Start tomorrow.']]] },
  { q: 'Outside the substation, the Eastside is quiet for once. Castillo hands you a coffee.', A: ['Contact and Cover', [['castillo', 'You stopped Pike, you made a plan, and you wrote down a threat nobody else would have. Most officers get all three of those wrong their first year.'], ['rosa', '(over the radio) Tell the new one thank you. Tell them they\'re welcome at the bodega anytime.'], ['narr', 'From across the parking lot, Pike gives you a reluctant thumbs up.']]],
    B: ['Back Door Lessons', [['castillo', 'Somebody went out the back door today. That happens. What matters is that you understand why.'], ['castillo', 'Next time, the plan comes first. Cover, contact, exits. Say it back to me.']]],
    C: ['Rosa Stops Calling', [['castillo', 'Rosa called the substation an hour ago. Not 911, the front desk. She asked if she could talk to a different officer next time.'], ['narr', 'That stings. It\'s supposed to.'], ['castillo', 'Go see her tomorrow. Listen this time. Trust comes back the same way it leaves, one conversation at a time.']]] },
  { q: 'The Riverside evidence room smells like old paper. Castillo signs the last property sheet and slides it to you.', A: ['Chain of Custody', [['castillo', 'Every item logged, every handoff signed, a witness every time. A defense attorney\'s going to read this file and find nothing to pick at.'], ['narr', 'She pins your property sheet up on the training board as an example. Your name\'s on it.']]],
    B: ['Paper Trail', [['castillo', 'Most of it\'s clean. Some of it I had to fix. In court, "most of it" is how cases get thrown out.'], ['castillo', 'Log it, have it witnessed, give a receipt. Every single time, even when it feels silly.']]],
    C: ['Thin Evidence Log', [['castillo', 'Mrs. Alvarez got her TV back fast, and she\'s happy. The evidence log isn\'t. If this goes to trial, there\'s a hole right where the proof should be.'], ['castillo', 'Being kind and being careful aren\'t opposites, cadet. Do both.']]] },
  { q: 'Dawn over the Industrial Park. The rail yard is still. Castillo kills the engine and lets the quiet sit.', A: ['Every Corner Cleared', [['castillo', 'You searched like somebody was going to grade it, and you listened to people like they mattered. They did. Both of them did.'], ['narr', 'Somewhere out in the yard, a forklift beeps "Hello, Gerald." Castillo almost laughs.']]],
    B: ['Second Sweep', [['castillo', 'You cleared it. Slower than you should have, and faster than you will next time.'], ['castillo', 'Slow is smooth, and smooth is fast. Write it on your hand if you have to.']]],
    C: ['Missed Room', [['castillo', 'There was a room you didn\'t check. Today it was empty. Someday it won\'t be.'], ['castillo', 'Every corner, every time. That\'s not a slogan. That\'s how everybody gets to go home.']]] },
  { q: 'Justice Plaza at dusk. The statue of Justice watches without a blindfold. Castillo stands next to you for a long moment.', A: ['By the Book', [['castillo', 'Lassiter tried to put something in your hand, and you didn\'t even let him finish his sentence. The arrest was clean, and the report was even cleaner.'], ['okonkwo', 'I read it twice. I don\'t read anything twice.'], ['narr', 'Exhibit A sits down on your boot, which, according to Moore, is the highest honor the courthouse has to give.']]],
    B: ['Close Enough', [['castillo', 'The arrest stands. But I had to take my red pen to the report in two places.'], ['castillo', '"Close enough" gets people hurt and gets cases thrown out. You know better now.']]],
    C: ['The Folded Card', [['castillo', 'You listened to Lassiter\'s offer. You didn\'t take it. But you listened, and he watched you listen.'], ['castillo', 'I reported it, because I have to. You\'re cleared. But you\'re also on notice. A bribe doesn\'t start with money. It starts with somebody deciding you\'re the kind of person who\'ll hear them out.'], ['narr', 'It\'s the quietest walk back to the car you\'ve ever had.']]] }
];
export const REFLECT = [
  { t: 'Credit the people who helped today', v: 1, reply: 'That\'s the right answer, and it isn\'t a trick question.' },
  { t: 'Own the things you\'d do differently', v: 'own', reply: 'Saying it out loud is how it sticks. Good.' },
  { t: 'Say you handled it all yourself', v: -1, reply: 'Nobody in this job does anything by themselves, cadet. Nobody.' }
];

// ---------- 7. the Ledger: a mystery that runs through every district ----------
// three torn ledger pages hidden in each district; find a district's three to open its chapter of the mystery
export const CLUES = [
  ['c01', 0, 'Bayfront Dog Run', 'A torn page wedged under the old oak where Ranger is buried. A column of figures: "Relief Fund, Sept. 1987."', 'Where a good dog rests under an old oak.'],
  ['c02', 0, 'Dog-Eared Books', 'A page used as a bookmark in a 1987 phone book on the free bench. Initials in the margin: "W.M."', 'A bench that is never empty.'],
  ['c03', 0, 'Harbor View Apartments', 'A page taped behind a mailbox in the lobby. A bank stamp: "First Meridian Savings, Account 4417."', 'A building that lost its view.'],
  ['c04', 1, 'Eastgate Pines', 'A page in a coffee can nailed high on a turpentine-scarred pine. "Lumber, 40 homes, paid in full."', 'Old trees with old scars.'],
  ['c05', 1, 'Gas & Go', 'A page pinned behind the sign missing its second G. "Roofing, Birch Lane, 12 homes."', 'A sign missing a letter.'],
  ['c06', 1, 'Eastside Jewelers', 'A page folded inside a 1987 watch box. A receipt: a gold pin engraved "W.M., for keeping the books honest."', 'Where badge numbers get engraved.'],
  ['c07', 2, 'Cypress Hammock', 'A page in a jar wedged between cypress knees. "Flood repairs, Cypress Lane. Stilts for 9 houses."', 'Knees that stick up out of the water.'],
  ['c08', 2, 'River Pawn', 'A page inside a pawned 1980s calculator. Someone wrote: "Mayor wants the fund. Moved it. Tell no one."', 'A wall of unclaimed fishing rods.'],
  ['c09', 2, 'Heron Point', 'A page under a heron nesting box. A list of 61 family names, each with a house number.', 'Where the lights stay low in March.'],
  ['c10', 3, 'North Spur Pines', 'A page in a rusted lunchbox buried near the woodpecker colony. "Delivered by rail. No invoices. W.M. signs."', 'Woodpeckers next to a rail yard.'],
  ['c11', 3, 'Lock-It Storage', 'A page slipped under the door of Unit 1, the one nobody has seen opened. "Unit 1 rent paid until 2030. For the books."', 'A unit rented since 1988 by someone nobody has seen.'],
  ['c12', 3, 'Millworker Row', 'A page in the porch rafters of the last mill house. "Every dollar went to a roof. Every roof has a family under it."', 'Where the noon whistle still blows.'],
  ['c13', 4, 'Old Stone Church', 'A page tucked behind a ballast stone in the back wall. "If they say I stole it, the proof is in the Annex. Box: Parking 1972."', 'Walls built from ships\' ballast.'],
  ['c14', 4, 'County Records Annex', 'Box "Parking 1972." Inside: 61 deeds, every one paid by the Founders Relief Fund in 1988.', 'Where the charter was found in the wrong box.'],
  ['c15', 4, 'Courtside Lofts', 'A page inside an old cell door, now a closet. Signed: "Walter Marsh, City Accountant. I kept the books honest."', 'Where cell doors became closet doors.']
];
SIDE_CAST.marsh = { name: 'Lena Marsh', icon: '📰', role: 'Reporter, the Port Meridian Ledger' };
SIDE_CAST.vance = { name: 'Cadet Devin Vance', icon: '🎖️', role: 'Your classmate (and rival)' };
const clueNeed = (d) => (S) => [0, 1, 2].every((k) => (S.clues || {})['c' + String(d * 3 + k + 1).padStart(2, '0')]);
const allClues = (S) => CLUES.every((c) => (S.clues || {})[c[0]]);
export const MYSTERY = [
  { id: 'ledger1', d: 0, title: 'The Ledger, Part 1: Torn Pages', giver: 'marsh', giverAt: 'Central Library', req: [0, 1], need: clueNeed(0), mystery: 1,
    blurb: 'A reporter thinks the torn pages you\'ve been finding come from a ledger that vanished in 1987, along with two million dollars.',
    offer: [['marsh', 'You\'ve been finding pages. Don\'t look so surprised, everybody at the library talks. I\'m Lena Marsh, from the Ledger. The newspaper.'], ['marsh', 'In 1987, two million dollars in hurricane relief money disappeared. The city blamed the accountant, Walter Marsh. My father.']],
    steps: [{ at: 'Bayfront Tower', who: 'marsh', goal: 'Meet Lena Marsh in the Bayfront Tower lobby', say: [['marsh', 'Dad\'s initials are on your pages. W.M. And Account 4417 at First Meridian Savings. That bank used to be in this building.'], ['marsh', 'He died before anybody would listen. I just want the truth, whatever it turns out to be. Will you help me go through these the right way?']], quiz: { les: 1, n: 1 } }],
    reward: { rp: 150, loot: 'r' } },
  { id: 'ledger2', d: 1, title: 'The Ledger, Part 2: Paid in Full', giver: 'marsh', giverAt: 'Spin City Laundromat', req: [1, 1], need: (S) => clueNeed(1)(S) && (S.side || {}).ledger1 >= 1, mystery: 1,
    blurb: 'The Eastside pages talk about lumber and roofs. Lena wants to know who was paid, and for what.',
    offer: [['marsh', 'Mr. Kim says I can use his folding table as an office. Look at this: "Lumber, 40 homes, paid in full." "Roofing, Birch Lane." That\'s not stealing. That\'s building.']],
    steps: [{ at: 'Maple Court', who: 'ruth', goal: 'Ask Grandma Ruth what she remembers about 1987', say: [['ruth', 'The hurricane took half the roofs on the Eastside, dear. Then all of a sudden the trucks came. Lumber, shingles, men with hammers. Nobody ever sent a bill.'], ['ruth', 'I was working the sheriff\'s switchboard back then. A man named Walter called every night to ask which streets were still open. Polite voice. Always said thank you.']], quiz: { les: 5, n: 1 } }],
    reward: { rp: 160, loot: 'r' } },
  { id: 'ledger3', d: 2, title: 'The Ledger, Part 3: Tell No One', giver: 'marsh', giverAt: 'Hook, Line & Sinker', req: [2, 1], need: (S) => clueNeed(2)(S) && (S.side || {}).ledger2 >= 1, mystery: 1,
    blurb: '"Mayor wants the fund. Moved it. Tell no one." Lena\'s hands shake when she reads it.',
    offer: [['marsh', 'Dad didn\'t steal the money. He hid it from the mayor. And then he never told anybody. Not even us.'], ['marsh', 'Sixty-one families on that list. If they got houses, somebody still remembers.']],
    steps: [{ at: 'Willow Street', who: 'toby', goal: 'Ask Toby, the Willow Street mail carrier, about the families on the list', say: [['toby', 'Half these names are still on my route. Mrs. Benoit. The Hendersons. Old Mr. Pruett on the corner.'], ['toby', 'Mrs. Benoit told me once that a stranger paid to put her house up on stilts after the flood. She kept a picture of his car. Want me to ask her about it?'], ['narr', 'An hour later, Toby radios back. The photo shows a city car, and the man leaning on it is holding a ledger.']], quiz: { les: 10, n: 1 } }],
    reward: { rp: 170, loot: 'r' } },
  { id: 'ledger4', d: 3, title: 'The Ledger, Part 4: Unit 1', giver: 'marsh', giverAt: 'Coastline Freight', req: [3, 1], need: (S) => clueNeed(3)(S) && (S.side || {}).ledger3 >= 1, mystery: 1,
    blurb: 'Lock-It Storage Unit 1 has been paid by money order since 1988. Nobody has ever seen who rents it.',
    offer: [['marsh', 'Rent on Unit 1 is paid through 2030, "for the books." Dad died in 1996. So who\'s been paying it?'], ['marsh', 'Gerald says Coastline shipped lumber by rail in \'87 with no invoices. Every crate was signed "W.M."']],
    steps: [{ at: 'The Lunch Pail', who: 'lupe', goal: 'Ask Lupe at The Lunch Pail who pays for Unit 1', say: [['lupe', 'The money orders? My mother bought them every month from 1988 until she passed. Now I do.'], ['lupe', 'Walter Marsh ate lunch here every day for ten years. Before he died, he asked Mama to keep paying for that unit and never to open it unless somebody came around asking the right questions.'], ['lupe', 'You\'re asking the right questions, mija. The key\'s in the register. It\'s been there for thirty years.']], quiz: { les: 17, n: 1 } }],
    reward: { rp: 180, loot: 'e' } },
  { id: 'ledger5', d: 4, title: 'The Ledger, Part 5: Keeping the Books Honest', giver: 'marsh', giverAt: 'Objection! Espresso', req: [4, 1], need: (S) => allClues(S) && (S.side || {}).ledger4 >= 1, mystery: 1,
    blurb: 'Unit 1 held the original ledger. Box "Parking 1972" holds the deeds. All that\'s left is to say it out loud.',
    offer: [['marsh', 'Every dollar, every house, every signature. Sixty-one deeds paid for by the Relief Fund. Dad kept that money out of the mayor\'s hands and built homes with it instead.'], ['marsh', 'He took the blame so nobody would go looking. Well, I want to go looking now. Out loud. Will you stand next to me?']],
    steps: [{ at: 'Barnes & Ruiz', who: 'barnes', goal: 'Have Barnes & Ruiz review the evidence', say: [['barnes', 'Deeds, the ledger, bank records, and sworn statements from Ruth, Lupe and Mrs. Benoit. I\'ve tried a hundred cases with less than this.'], ['barnes', 'This isn\'t a crime anymore. It\'s a correction. The county can fix the record.']], quiz: { les: 19, n: 1 } },
      { at: 'Justice Plaza', who: 'marsh', goal: 'Stand with Lena at Justice Plaza', say: [['narr', 'Sixty-one families stand on Justice Plaza. They\'re the children and grandchildren of the people whose roofs Walter Marsh paid for.'], ['marsh', 'My father wasn\'t a thief. He kept the books honest. Thank you for proving it.'], ['narr', 'A new plaque goes up next to the statue of Justice: "Walter Marsh, City Accountant. He kept the books honest." And under it, smaller: "Found by a cadet who kept looking."']], quiz: { les: 20, n: 1 } }],
    reward: { rp: 400, loot: 'l' } }
];

// ---------- 8. the rival: Cadet Devin Vance ----------
export const RIVAL = [
  { id: 'vance1', d: 0, title: 'Rival: Top of the Class', giver: 'vance', giverAt: 'Downtown Transit Center', req: [0, 2], rival: 1,
    blurb: 'Cadet Devin Vance is first in the class standings and wants you to know it.',
    offer: [['vance', 'So you\'re the one Castillo keeps talking about. I\'m Vance. First in the class. Every week.'], ['vance', 'Race you. First one to answer the transit center\'s lost property call wins. Loser buys coffee.']],
    steps: [{ at: 'Meridian Office Tower', who: 'vance', goal: 'Beat Vance to the lost-property call at Meridian Tower', say: [['vance', 'Ha, a tie. Fine.'], ['vance', 'You talked to the guard for ten minutes. Why? We had the bag in two.'], ['choice', [{ t: 'Because he\'ll call us next time something\'s wrong', set: 'vanceTalk', reply: [['vance', '...Huh. I never really thought about next time.']] }, { t: 'Because I was winning on points', reply: [['vance', 'Points. Ha. Okay, I kind of like you.']] }]]], quiz: { les: 2, n: 1 } }],
    reward: { rp: 120, loot: 'u' } },
  { id: 'vance2', d: 1, title: 'Rival: The Gym', giver: 'vance', giverAt: 'Iron Will Boxing Gym', req: [1, 2], rival: 1,
    blurb: 'Vance is at Iron Will at five in the morning, and he is not doing well.',
    offer: [['vance', 'The PT test is Friday and my run time is terrible. Don\'t tell anybody. Seriously.'], ['vance', 'Coach Reyes says I\'m "running angry." What does that even mean?']],
    steps: [{ at: 'Birch Lane', who: 'vance', goal: 'Run the Birch Lane loop with Vance', say: [['narr', 'You run the loop together. Mr. Lewis waves from his porch. A dog on Birch Lane chases you both for half a block.'], ['vance', 'You run like nobody\'s chasing you. I run like the whole class is.'], ['choice', [{ t: 'Tell him he doesn\'t have to win every week', set: 'vanceEase', reply: [['vance', 'Easy for you to say. My dad was a captain. I\'m supposed to be first.']] }, { t: 'Pace him the rest of the way', reply: [['vance', '...Okay. That was better. Don\'t get used to it.']] }]]], quiz: { les: 6, n: 1 } }],
    reward: { rp: 130, loot: 'u' } },
  { id: 'vance3', d: 2, title: 'Rival: Captain Vance', giver: 'vance', giverAt: 'River Stadium', req: [2, 2], rival: 1,
    blurb: 'Vance\'s father worked River Stadium detail for twenty years. Vance has never been inside.',
    offer: [['vance', 'My dad worked every home game here. Captain Vance. Everybody knew him.'], ['vance', 'He died my first year in the academy. I\'ve been trying to be first ever since, like that would somehow bring him back.']],
    steps: [{ at: 'Riverside Vet Clinic', who: 'ines', goal: 'Visit Dr. Inés with Vance', say: [['ines', 'Devin Vance. You look just like him. Your father brought me every stray he ever found. Forty-one dogs.'], ['ines', 'He wasn\'t first at anything, you know. He just showed up. Every time.'], ['narr', 'Vance doesn\'t say anything for a long time.']], quiz: { les: 12, n: 1 } }],
    reward: { rp: 140, loot: 'r' } },
  { id: 'vance4', d: 3, title: 'Rival: Cover Me', giver: 'vance', giverAt: 'North Spur Yard', req: [3, 1], rival: 1,
    blurb: 'Training call at the rail yard. Vance asks you, not anyone else, to be his cover.',
    offer: [['vance', 'Castillo said I could pick my cover for the yard drill. I picked you. Don\'t make it weird.']],
    steps: [{ at: 'Big Rig Truck Stop', who: 'vance', goal: 'Run the yard drill with Vance and debrief at the truck stop', say: [['vance', 'You called out that blind corner before I even saw it. Okay. You\'re good.'], ['vance', 'I\'ve been treating everybody like competition. Turns out this job\'s a team sport.'], ['choice', [{ t: 'Tell him he\'s a good partner too', set: 'vanceFriend', reply: [['vance', 'Don\'t. I\'ll get all emotional at a truck stop. Diesel\'s watching.']] }, { t: 'Say you\'re still beating him this week', reply: [['vance', 'In your dreams, cadet.']] }]]], quiz: { les: 18, n: 1 } }],
    reward: { rp: 150, loot: 'r' } },
  { id: 'vance5', d: 4, title: 'Rival: The Wall', giver: 'vance', giverAt: 'Veterans Memorial Park', req: [4, 1], rival: 1,
    blurb: 'Vance asks you to come with him to the memorial. He doesn\'t say why.',
    offer: [['vance', 'Sergeant Booker said there\'s a new name going up on the wall. Not a soldier. A police captain. He asked me to be there.']],
    steps: [{ at: 'Clerk of Court', who: 'hattie', goal: 'Pick up the dedication papers at the Clerk of Court', say: [['hattie', 'Captain Robert Vance. The county approved it last month. Twenty years of service. Here, honey. Sign as family.'], ['narr', 'Vance signs it. His hand\'s steady.'], ['vance', 'Graduation\'s coming up. I want you standing next to me. Not behind me, not in front of me. Next to me.']], quiz: { les: 20, n: 1 } }],
    reward: { rp: 200, loot: 'e' } }
];
[...MYSTERY, ...RIVAL].forEach((q) => { if (!SIDE2.some((o) => o.id === q.id)) SIDE2.push(q); });

// ---------- 11. crime-scene investigations ----------
// tap the real clues (some things are just clutter), then put the timeline in order
export const SCENES = [
  { id: 'burg', kind: /houses|apartments/, title: 'Residential burglary', bg: ['#3b2f2a', '#1f1814'], items: [['🪟', 'Pried window latch', 1, 18, 22], ['👣', 'Muddy shoe print on the sill', 1, 30, 48], ['📺', 'TV still on the wall', 0, 62, 20], ['🧤', 'Glove dropped by the back gate', 1, 78, 70], ['🐈', 'The family cat', 0, 46, 76], ['💍', 'Empty jewelry box', 1, 58, 52], ['🪴', 'A houseplant', 0, 12, 74]],
    order: ['Window latch pried', 'Suspect steps in through the window', 'Jewelry box emptied', 'Suspect leaves by the back gate, drops a glove'] },
  { id: 'hitrun', kind: /street|parking|lot/, title: 'Hit and run', bg: ['#2a2f3a', '#12151c'], items: [['🔴', 'Red paint transfer on the bumper', 1, 22, 40], ['💡', 'Broken headlight glass', 1, 46, 58], ['🛞', 'Skid marks heading north', 1, 72, 30], ['🥤', 'A soda cup in the gutter', 0, 14, 76], ['🐦', 'A pigeon', 0, 82, 72], ['📹', 'Gas station camera facing the street', 1, 60, 16]],
    order: ['Red car runs the light', 'Car clips the parked sedan', 'Headlight breaks on impact', 'Car speeds north, camera catches the plate'] },
  { id: 'shop', kind: /shop|gas|pharmacy|mall|pawn|books|nails|barber/, title: 'Shoplifting', bg: ['#2f2a3a', '#16121c'], items: [['🏷️', 'Torn security tag in the aisle', 1, 30, 30], ['🧾', 'Receipt for one item, bag held three', 1, 58, 46], ['📹', 'Camera above the register', 1, 78, 16], ['🧃', 'A juice box display', 0, 14, 60], ['🛒', 'An abandoned cart', 0, 70, 72], ['🧥', 'A coat left on a rack with tags inside', 1, 42, 70]],
    order: ['Customer enters wearing a coat', 'Security tags torn off in aisle 4', 'Pays for one item at the register', 'Leaves; camera has a clear view of the face'] },
  { id: 'vandal', kind: /school|park|center|church|plaza/, title: 'Vandalism', bg: ['#2a3a2f', '#121c16'], items: [['🎨', 'Spray paint cans in the bushes', 1, 20, 66], ['🖐️', 'Paint-covered handprint on the fence', 1, 48, 36], ['🚲', 'Bike tire tracks through wet grass', 1, 74, 58], ['🌳', 'An oak tree', 0, 84, 22], ['🏀', 'A basketball', 0, 34, 80], ['📱', 'Neighbor\'s doorbell camera', 1, 12, 20]],
    order: ['Bike rides in across the wet grass', 'Tag sprayed on the wall', 'Hand braced on the fence, leaves a print', 'Cans tossed in the bushes; doorbell camera records the exit'] },
  { id: 'yard', kind: /warehouse|storage|railyard|lumber|scrapyard|truckstop/, title: 'Copper theft', bg: ['#3a332a', '#1c1812'], items: [['✂️', 'Fresh bolt-cutter marks on the fence', 1, 20, 30], ['🧵', 'Stripped wire insulation on the ground', 1, 46, 60], ['🛻', 'Pickup tire tracks in the gravel', 1, 72, 40], ['🦝', 'A raccoon', 0, 84, 76], ['📦', 'Stacked pallets', 0, 30, 78], ['🧾', 'Scrap yard receipt with no ID listed', 1, 60, 18]],
    order: ['Pickup backs up to the fence', 'Fence cut with bolt cutters', 'Copper stripped on site', 'Copper sold at a yard that skipped the ID check'] }
];

// ---------- 12. report writing: the clearest sentence wins ----------
export const REPORT = [
  ['Opening', ['On {date} at approximately {time}, I responded to {where} regarding a {title}.', 'I got sent to some place for a thing that was going on.', 'Responded to {where} because it seemed like trouble, as usual for that area.']],
  ['Who you spoke with', ['I spoke with the {caller}, who stated they had called for assistance.', 'The {caller} was obviously upset and kind of dramatic.', 'Talked to a person there.']],
  ['What you saw', ['I observed no injuries and no immediate threat at the scene.', 'Everything looked fine, I guess, nothing crazy.', 'It was a typical scene for that kind of neighborhood.']],
  ['What you did', ['I provided a case number and explained the next steps to the {caller}.', 'Handled it.', 'I told them what to do and left because I had other calls.']]
];

// ---------- 5. other units on the radio ----------
export const CHATTER = [
  ['2-Baker-14', 'Heading to {place}, I\'m about two minutes out.'], ['2-Baker-14', 'Show me on scene at {place}.'], ['Dispatch', '1-Charlie-7, go see the manager at {place} about a parking complaint.'],
  ['1-Charlie-7', 'Copy. I\'ll be back in service after this.'], ['3-David-2', 'Traffic stop on {street}, gray sedan, one person in the car.'], ['3-David-2', 'All clear on the traffic stop. Just a warning.'],
  ['Dispatch', 'Any unit near {place}, caller says there\'s a loose dog. It\'s not acting aggressive.'], ['4-Edward-9', 'I\'ll take the loose dog. He\'s friendly. He\'s actually already in my back seat.'],
  ['Dispatch', 'Heads up, all units, there\'s road work on {street} until three.'], ['K9-3', 'K9-3\'s back in service if anybody needs a track.'],
  ['2-Baker-14', 'Dispatch, can you run a partial Florida plate for me?'], ['Dispatch', 'Copy, stand by.'], ['Dispatch', 'Comes back clear. No wants, no warrants.'],
  ['Sgt. Okonkwo', 'All units, briefing at shift change. Coffee\'s on me. Don\'t get used to it.'], ['Dispatch', 'Fire\'s responding to an alarm at {place}. Probably just burnt toast.'],
  ['Engine 3', 'Dispatch, it was burnt toast.'], ['5-Frank-1', 'Welfare check on {street} is done. She\'s fine, she was out in the garden and didn\'t hear the phone.'],
  ['Dispatch', 'Lost kid at {place} is back with his family. Thank you, everybody.'], ['Marine 1', 'Marine 1\'s back at the dock. River\'s calm.'], ['3-David-2', 'Taking my lunch at {place}.'],
  ['Dispatch', 'Any unit, there\'s a lady asking how to get to the courthouse. She says thank you in advance.'], ['1-Charlie-7', 'I\'ll swing by and point her in the right direction.']
];
export const WX_CALLS = {
  heat: [['Heat exhaustion welfare check', 2, 'houses', 'Neighbor says an elderly man hasn\'t opened his door all day and his AC is broken.'], ['Child left in a hot car', 1, 'parking', 'Caller sees a small child alone in a car in a parking lot. Windows up.'], ['Overheated hiker', 2, 'park', 'A jogger collapsed in the heat and is dizzy and confused.']],
  storm: [['Downed power line', 1, 'any', 'A power line is down across the road and sparking. Keep people back.'], ['Tree on a car', 2, 'houses', 'A tree came down on a parked car. The owner is shaken but okay.'], ['Flooded underpass', 2, 'any', 'A car stalled in standing water. The driver is still inside.']],
  fog: [['Minor crash in fog', 2, 'any', 'Two cars bumped at low speed in heavy fog. No injuries reported.'], ['Disabled vehicle', 3, 'any', 'A car is stopped in the lane with no hazard lights on. Visibility is poor.']],
  rain: [['Stalled car in the rain', 3, 'any', 'Car won\'t start at a busy corner. Driver needs help pushing it clear.'], ['Slip and fall', 3, 'shop', 'A customer slipped on a wet entryway and wants to report it.']],
  cold: [['Cold-night welfare check', 2, 'park', 'A man is sleeping outside and the temperature is dropping fast.'], ['Space heater smoke', 2, 'apartments', 'A tenant smells smoke from a neighbor\'s space heater.']]
};
export const TIPS2 = ['Call debriefs grade you on more than answers: response, approach and community count too.', 'Torn ledger pages are hidden around the city. The Mystery Board has riddles.', 'Regulars keep schedules. Some are only around after dark.', 'Raise a district\'s trust and locals start radioing you tips.', 'Hometown Hero status unlocks a celebration, a title and a car skin.', 'Contact and cover: one talks, one watches. Every time.', 'Write every report like a judge will read it. One will.', 'Lamps come on block by block at dusk. So do the people.', 'Weather changes the calls. Heat means welfare checks; storms mean downed lines.', 'Your rival, Cadet Vance, is waiting at the transit center once Chapter 1 gets going.'];
