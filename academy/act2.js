// Act II and the living city: a five-part citywide arc that crosses every district (The Paper Trail), stories that
// carry one district's people into another, personal stories that open once a regular counts you as a friend,
// note sets that lead to hidden caches, and lasting marks that finished stories leave on the map.
import { TALES } from './tales.js';
import { SAGAS } from './sagas.js';

const LEN = {}; [...TALES, ...SAGAS].forEach((q) => { LEN[q.id] = q.steps.length; });
const done = (id) => (S) => (S.side[id] || 0) >= (LEN[id] || 99);
const friend = (id, n) => (S) => ((S.npc || {})[id] || 0) >= (n || 3);

export const ACT2_CAST = {
  vane: { name: 'Royce Vane', icon: '💼', role: 'Owner, ClearDocket Records' },
  odom: { name: 'Mrs. Odom', icon: '🗃️', role: 'Former county records supervisor' },
  tamsin: { name: 'Tamsin', icon: '🗂️', role: 'Night packer, Gulf Packaging' },
  hobbs2: { name: 'Mr. Hobbs', icon: '🔔', role: 'Sexton, Old Stone Church' },
  shelter: { name: 'Marcus Webb', icon: '🏠', role: 'Eastside shelter volunteer' },
  rook: { name: 'Danny "Rook" Ellis', icon: '♜', role: 'Hollis\'s first student' },
  ump: { name: 'Coach Pruett', icon: '🧢', role: 'Little league coach' },
  diesel: { name: 'Diesel', icon: '🐕', role: 'Lou\'s dog' },
  juror9: { name: 'Mr. Albright', icon: '👓', role: 'Juror nine, 2009' }
};

export const ACT2_ITEMS = {
  invoice: { icon: '🧾', name: 'ClearDocket Invoice', text: 'County invoice, ClearDocket Records LLC: "Re-scan of misplaced files, 1,140 boxes, $412,000."', read: 'Every box on the re-scan list was first "misplaced" while in ClearDocket\'s care. They were paid to lose them and paid again to find them.' },
  timesheet: { icon: '🕐', name: 'Temp Timesheet, "T. Quill"', text: 'Three weeks in April, records room. Signed "T. Quill." No temp agency on file has ever heard of a T. Quill.', read: 'Logged in under the account CLEARDOCKET-SVC. The temp was ClearDocket\'s own.' },
  trucklog: { icon: '🚚', name: 'Loading Dock Log', text: 'Bayfront Tower dock camera notes: ClearDocket box truck, every Thursday, 3:10 a.m., northbound toward the Industrial Park.', read: 'The truck never goes to the county archive. It goes north.' },
  odomledger: { icon: '📒', name: 'Mrs. Odom\'s Ledger', text: 'Seven years of handwritten entries: box number, date picked up by ClearDocket, date reported "misplaced."', read: 'On the last page, 2019: "Reported this to the county. Fired Friday. Keep writing anyway."' },
  indexcards: { icon: '🗂️', name: 'Index Cards, Signed "T."', text: 'A shoebox of hand-written index cards. Every one of the 1,140 boxes, indexed: case, district, what was inside, who it mattered to.', read: 'Card one: "If you found this, I did it right. Please put them back where they belong. — T."' },
  capsule: { icon: '⏳', name: 'Founders\' Time Capsule', text: 'A soldered tin box from 1926. Inside: a school photo, a streetcar token, and a letter "to whoever keeps the peace in 2026."', read: '"Be kinder than we were. We were not always kind." Signed by the first police chief of Port Meridian.' },
  kite: { icon: '🪁', name: 'The Eastside Kite', text: 'A paper-and-bamboo kite, faded orange, folded flat. Thirty kids\' names written along the spine, 1988.', read: 'The last name is "Sami D." Somebody drew a gas pump next to it, years later, in different ink.' },
  ratpin: { icon: '🐀', name: 'River Rat Society Pin', text: 'A tiny brass pin of a rat in a canoe. On the back: "R.R.S. Est. 1961. Never Leave a Paddler."', read: 'The River Rats were kids who paddled the flooded town before the dam closed. Eli was the youngest member. Pearl was the oldest.' },
  hobocard: { icon: '🃏', name: 'Rail Rider\'s Card', text: 'A playing card, the ace of spades, with a chalk sign on the back: a circle with two arrows.', read: '"Safe camp. Kind woman. Ask for Hector." Hector\'s mother fed rail riders from her back porch for thirty years.' },
  wager: { icon: '🪙', name: 'The Lawyer\'s Wager', text: 'A 1964 silver dollar taped to an index card: "Owed to whoever wins the bet. — Pell & Pell."', read: 'The bet: that a jury in this county would one day acquit a man because a cop told the truth against himself. Attorney Pell\'s father lost the bet with himself, happily, in 1994.' }
};

const sh = (a) => a;
export const ACT2 = [
  // ================= Act II: The Paper Trail (one part per district, in order) =================
  { id: 'trail1', d: 4, saga: true, act: 2, title: 'The Paper Trail · I. To Scan', giver: 'ada', req: [4, 1], need: done('addresses'), blurb: 'Ms. Ada at the Records Annex has noticed something about every file that ever went missing in this county.',
    offer: [['ada', 'Cadet. You found forty forms in a box. Do you know what else was in that box\'s company?'], ['ada', 'A 1987 theft report nobody searched. A memorial letter from 1971. Property logs. Every file that has gone "missing" in this county for seven years passed through the same hands.'], ['ada', 'I have been an archivist for thirty-one years. Lost is an accident. This is a pattern. Will you follow it with me?']],
    steps: [
      { at: 'County Records Annex', npc: 'ada', who: 'ada', goal: 'Look at the re-scan invoices with Ms. Ada', give: 'invoice', say: [['ada', 'ClearDocket Records. The county hired them in 2019 to digitize everything. Every misplaced box, they bill to "re-scan" when it turns up.'], ['ada', 'Four hundred and twelve thousand dollars. For finding things they lost.'],
        ['choice', sh([{ t: 'Ask her to pull the county contract and payment records for you', set: 'p1records', reply: [['ada', 'Already pulled. Public records, officer. Nobody ever reads them. That\'s the trick.']] }, { t: 'Ask her who at ClearDocket handles the boxes day to day', set: 'p1who', reply: [['ada', 'A "temp," they said. The one who left the forty forms under a desk. Ask Clerk Fernandez who that temp was.']] }]), 'Ada taps the invoice.']], quiz: { les: 20, n: 1 } },
      { at: 'County Administration', who: 'admin', goal: 'Ask Clerk Fernandez about the April temp', give: 'timesheet', twist: { title: 'There was no temp', text: 'No agency ever sent a "T. Quill." The timesheet was signed into the records system under ClearDocket\'s own service account.' }, say: [['admin', 'The temp? T. Quill. Three weeks in April. Quiet. Fast. Left the day after the box was found... well, before.'], ['admin', 'I tried to call the agency to say thanks for nothing. There is no agency. The timesheet login is CLEARDOCKET-SVC.'], ['admin', 'So the person who left the forms under the desk worked for the people losing the forms. Why would they leave them where we\'d find them?']] }
    ], reward: { rp: 250, loot: 'r' } },
  { id: 'trail2', d: 0, saga: true, act: 2, title: 'The Paper Trail · II. The Tower', giver: 'bo', giverAt: 'Bayfront Tower', req: [0, 1], need: done('trail1'), blurb: 'ClearDocket Records has an office on the 14th floor of the Meridian Office Tower.',
    offer: [['bo', 'Officer! The AED officer! Hey, Ms. Ada from the Annex called the tower asking about a company called ClearDocket. They\'re across the street, fourteenth floor.'], ['bo', 'And their truck uses our loading dock every Thursday. At three in the morning. I always thought that was weird. Now I think it\'s weird out loud.']],
    steps: [
      { at: 'Meridian Office Tower', who: 'vane', goal: 'Talk to ClearDocket\'s owner at the Meridian Office Tower', say: [['vane', 'Royce Vane. Coffee? No? Officer, we scan eleven million pages a year. Some boxes get misfiled. We find them. We bill for the work. That\'s a business.'], ['vane', 'If the county has a problem with our invoices, the county has my lawyer\'s number.'],
        ['choice', sh([{ t: 'Thank him, leave a card, and keep the visit short', set: 'p2polite', reply: [['vane', 'Pleasure. Truly.'], ['narr', 'On your way out, you notice the reception desk calendar: every Thursday circled. "Dock, 3 a.m."']] }, { t: 'Tell him you know the temp was his own employee', set: 'p2push', reply: [['vane', '...I don\'t know what you\'re talking about. We\'re done.'], ['narr', 'He picks up the phone before the door closes. You\'ve told him what you know. That may cost you.']] }]), 'Vane smiles the whole time.']], quiz: { les: 0, n: 1 } },
      { at: 'Bayfront Tower', who: 'bo', goal: 'Check the Thursday dock footage with Bo', give: 'trucklog', say: [['bo', 'Every Thursday. 3:10. Boxes go out, nothing comes back. Truck heads north on the freight road.'], ['bo', 'County archive is south. Whatever they\'re doing with those boxes, they\'re not archiving them.'], ['bo', 'He called the building manager an hour ago asking to have our dock cameras "serviced." I said they\'re working fine. I like this job now.', { if: 'p2push' }]] }
    ], reward: { rp: 250, loot: 'r' } },
  { id: 'trail3', d: 2, saga: true, act: 2, title: 'The Paper Trail · III. Keep Writing', giver: 'toby', req: [2, 1], need: done('trail2'), blurb: 'Toby has been delivering hundreds of letters that all say the same thing: "your records could not be recovered."',
    offer: [['toby', 'You notice things too, so you\'ll get this. For three years I\'ve carried letters from ClearDocket. Hundreds. Same letter. "We regret your records could not be recovered."'], ['toby', 'Birth certificates. Deeds. Court files. And there\'s one lady on my route who opens every one of those letters on her porch and writes something down. Mrs. Odom. Bayou Senior Apartments.']],
    steps: [
      { at: 'Bayou Senior Apartments', who: 'odom', goal: 'Visit Mrs. Odom at Bayou Senior Apartments', give: 'odomledger', twist: { title: 'Fired for writing it down', text: 'Mrs. Odom supervised the county records room until 2019. She reported ClearDocket\'s "misplaced" boxes and was fired the following Friday. She kept writing down every box anyway, for seven years.' }, say: [['odom', 'You\'re here about the boxes. Sit down. I made the tea before you knocked. Toby called ahead.'], ['odom', 'Thirty-four years I ran that records room. Nothing got lost. Then ClearDocket came, and boxes started walking out on Thursdays.'], ['odom', 'I told the county. I was fired that Friday for "insubordination." So I kept a ledger. Every box. Every "misplaced." One thousand one hundred and forty.'],
        ['choice', sh([{ t: 'Ask her permission to make a certified copy for the case', set: 'p3copy', reply: [['odom', 'Copy it. I\'m keeping the original. It\'s the only thing they couldn\'t lose.']] }, { t: 'Ask her why she never went to the newspapers', set: 'p3news', reply: [['odom', 'I did. They said "records lady angry about her job." I needed an officer to read it. You\'re the first who did.']] }]), 'Mrs. Odom pours.']], quiz: { les: 9, n: 1 } },
      { at: 'Willow Street', npc: 'toby', who: 'toby', goal: 'Compare the ledger with Toby\'s route notes', say: [['toby', 'Box 0447: "Lindqvist, R." That\'s Tess\'s dad\'s file! Box 0918: "Ocampo, L." Box 1102: the forty address forms.'], ['toby', 'Every story you\'ve worked in this city, officer. Every one had a piece go missing in the same truck.'], ['toby', 'Wherever that truck goes on Thursdays, that\'s where this city\'s memory is.']] }
    ], reward: { rp: 250, loot: 'r' } },
  { id: 'trail4', d: 3, saga: true, act: 2, title: 'The Paper Trail · IV. Unit 31', giver: 'saito', giverAt: 'Lock-It Storage', req: [3, 1], need: done('trail3'), blurb: 'Sgt. Saito found ClearDocket\'s truck at Lock-It Storage, unit 31.',
    offer: [['saito', 'Saito. Your box truck has been parking at Lock-It Storage every Thursday night for six years. Unit 31, rented to a shell company.'], ['saito', 'Before you get excited: that unit is private property. We do this right or the whole case dies at the door.']],
    steps: [
      { at: 'Lock-It Storage', who: 'saito', goal: 'Get into Unit 31 the right way with Sgt. Saito', give: 'indexcards', twist: { title: 'Someone was putting it back', text: 'Unit 31 holds all 1,140 boxes, intact and never scanned. In the back: a folding chair, a desk lamp, and a shoebox of index cards. Someone has been secretly cataloguing every box, signed only "T."' }, say: [['saito', 'Options, cadet. Tell me how we open this door.'],
        ['choice', sh([{ t: 'Write an affidavit from the ledger and get a search warrant', set: 'p4warrant', trust: 1, reply: [['saito', 'Ledger, invoices, dock logs. Probable cause three times over. On-call judge signed it in twenty minutes. Now we cut.']] }, { t: 'Cut the lock now before they move the boxes', set: 'p4cut', trust: -1, reply: [['saito', 'And hand Vane\'s lawyer the whole case? No. Affidavit. Judge. Then the lock.'], ['narr', 'You write it up. The judge signs. It takes forty minutes. The boxes are still there.']] }]), 'Saito holds the bolt cutters and waits.'],
        ['narr', 'Boxes floor to ceiling. Labels from every district. And at the back, a desk lamp still warm, and a shoebox of index cards in careful handwriting.']], quiz: { les: 17, n: 1 } },
      { at: 'Gulf Packaging', who: 'tamsin', goal: 'Find whoever signs as "T." on the night shift at Gulf Packaging', say: [['narr', 'The manager at Lock-It said only one other person ever came to Unit 31: a young woman on a bike, after midnight. The bike had a Gulf Packaging parking tag.'], ['tamsin', 'You found the cards.'], ['tamsin', 'I\'m Tamsin. I\'m the temp. T. Quill. Quill was my mom\'s name.'], ['tamsin', 'Royce Vane is my father.']] }
    ], reward: { rp: 250, loot: 'r' } },
  { id: 'trail5', d: 1, saga: true, act: 2, title: 'The Paper Trail · V. Where They Belong', giver: 'duarte', giverAt: 'Eastgate Apartments', req: [1, 1], need: done('trail4'), blurb: 'Tamsin Vane wants to talk, but only at home in Eastside, and only to you.',
    offer: [['duarte', 'Duarte. Your witness from Gulf Packaging asked for you by name. She lives at Eastgate Apartments. She sounds scared and sure at the same time.'], ['duarte', 'Bring her in gently. A witness who walks in on her own is worth ten who get dragged.']],
    steps: [
      { at: 'Eastgate Apartments', who: 'tamsin', goal: 'Hear Tamsin out at Eastgate Apartments', twist: { title: 'She left the box on purpose', text: 'Tamsin took the "temp" job at the clerk\'s office for her father, then slid the box of forty forms under a desk where it would be found. She has spent two years indexing Unit 31 so every file could go home.' }, say: [['tamsin', 'He sent me to the clerk\'s office to "lose" the address forms. I put them under the desk instead. Where somebody honest would trip on them. You did.'], ['tamsin', 'Every Thursday I go to Unit 31 after work and write one card per box. Who it belongs to. Why it matters. Eleven hundred and forty cards.'], ['tamsin', 'He\'s my dad. He taught me to ride the bike I use to go there.'],
        ['choice', sh([{ t: 'Explain what testifying involves and let her decide', set: 'p5choice', npc: { mo: 1 }, reply: [['tamsin', '...I already decided two years ago. I just needed somebody to ask instead of tell.']] }, { t: 'Tell her she has to testify or face charges too', set: 'p5threat', trust: -1, reply: [['tamsin', 'I was going to anyway. You didn\'t have to say it like that.']] }]), 'Tamsin holds her bike helmet in her lap.']], quiz: { les: 7, n: 1 } },
      { at: 'Eastside Community Center', who: 'ada', goal: 'Bring everyone to the returning of the files', say: [['narr', 'Six weeks later. The Community Center is full of folding tables and county boxes. Ms. Ada runs it like a field hospital.'], ['narr', 'Tess holds her father\'s file. Booker holds a letter about Luis. Theo reads his own address form out loud and laughs. Mrs. Odom sits at the head table with her ledger, checking every box off in ink.'], ['ada', 'One thousand one hundred and forty. All home.'], ['wells', '(over the radio) Wells. Royce Vane surrendered at his lawyer\'s office this morning on the fraud warrant. Walked in himself. Asked if his daughter was okay.'], ['tamsin', 'Tell him I am.'], ['odom', 'Officer. Seven years I wrote it down so somebody would read it. Thank you for reading.']] }
    ], reward: { rp: 600, loot: 'l', title: 'Keeper of the Record' } },

  // ================= stories that cross districts =================
  { id: 'lighthouse', d: 4, saga: true, title: 'The Lighthouse Window', giver: 'sexton', giverAt: 'Old Stone Church', req: [4, 1], need: done('siding9'), blurb: 'The stained glass from Siding 9 has arrived at Old Stone Church, and the sexton has a request.',
    offer: [['sexton', 'Officer. Forty crates, thirty-nine years late. We\'re installing the lighthouse window Sunday.'], ['sexton', 'The congregation wants the man who found it there. And the woman whose father was blamed for losing it. She works up in the Industrial Park. Would you ask her?']],
    steps: [
      { at: 'Old Stone Church', who: 'sexton', goal: 'See the window go up at Old Stone Church', say: [['narr', 'Morning light through blue and gold glass. A lighthouse, a ship, a sea that looks wet.'], ['narr', 'Tess came down from the yard in her work boots. She stands at the back until the sexton walks her to the front.'], ['sexton', 'The plaque reads: "Delivered 2026. In honor of Robert Lindqvist, who told us where to look."'], ['tess', 'He\'d have hated the fuss. He\'d have come anyway. ...So did I.']] }
    ], reward: { rp: 150, loot: 'u' } },
  { id: 'cprclass', d: 2, saga: true, title: 'Ninety Seconds on the River', giver: 'eli', req: [2, 1], need: done('ninety'), blurb: 'Tasha is coming down from Central to teach CPR at the Riverside canoe dock, and Eli wants an officer there.',
    offer: [['eli', 'A nurse from downtown called. Tasha? She\'s teaching CPR on my dock Saturday. Free. She said, "Bring the cop who found my AED."'], ['eli', 'I pull people out of this river every summer. I\'d like everybody here to know what to do next.']],
    steps: [
      { at: 'Riverside Park', npc: 'eli', who: 'tasha', goal: 'Help with Tasha\'s CPR class at the canoe dock', say: [['tasha', 'Hands in the center of the chest. Push hard, push fast. Don\'t you dare be polite about it.'], ['narr', 'Wes is there too, with Lucky, handing out pads. Twenty Riverside residents kneel on the dock in rows, pushing on dummies to the beat of a song Tasha refuses to name.'], ['tasha', 'Every minute without a shock, ten percent less chance. You remember that number. Somebody on this river will need you to.'], ['eli', 'I\'m putting an AED in the canoe shack. Tasha already picked out where.']], quiz: { les: 9, n: 1 } }
    ], reward: { rp: 150, loot: 'u' } },
  { id: 'newmember', d: 1, saga: true, title: 'A New Member', giver: 'andy', req: [1, 1], need: (S) => done('room9')(S) && done('firstboard')(S), blurb: 'A fifth grader from Central biked across town to join the Eastside chess club.',
    offer: [['andy', 'Officer, a kid rode his bike here from downtown. Eleven years old. Says a custodian taught him chess in Room 9 and told him to find "the Eastside club with the treasurer who doesn\'t quit."'], ['andy', 'Says he knows you. Come say hi?']],
    steps: [
      { at: 'Eastside Community Center', npc: 'andy', who: 'amir', goal: 'Say hi to the new member at the Community Center', say: [['amir', 'Officer! I learned the Italian opening. Mr. Leon plays it every Thursday against some man named Hollis and loses.'], ['narr', 'Keisha sets up a board across from him without a word. Amir loses in nine moves. He grins like he won.'], ['keisha', 'You\'re treasurer-in-training. You count the car wash money. Out loud. Every time.'], ['amir', 'Deal.']] }
    ], reward: { rp: 150, loot: 'u' } },

  // ================= friend stories: open once a regular counts you as a friend =================
  { id: 'f_hollis', d: 0, saga: true, friend: true, title: 'The One Who Beat Me', giver: 'hollis', req: [0, 0], need: friend('hollis'), blurb: 'Hollis wants to find the only student who ever beat him fair.',
    offer: [['hollis', 'Sit. No game today. A favor.'], ['hollis', '1991. A kid named Danny Ellis beat me in eleven moves. Fair. I never saw him again. I want a rematch before my eyes go.']],
    steps: [
      { at: 'Founders Plaza', npc: 'hollis', who: 'hollis', goal: 'Hear Hollis out at Founders Plaza', say: [['hollis', 'Called himself "Rook." Rode Route 9 every day. If anyone remembers him, it\'s the bus driver.']] },
      { at: 'Downtown Transit Center', who: 'walt', goal: 'Ask Walt about a kid called Rook', say: [['walt', 'Rook! Played chess on a magnetic board in the back seat. He drives Route 4 now. Thirty years. We wave every morning.'], ['walt', 'He told me once he beat a champion and got so scared he never went back. Thought he\'d been lucky and didn\'t want to find out.']] },
      { at: 'Founders Plaza', npc: 'hollis', who: 'rook', goal: 'Bring Rook to the plaza for the rematch', say: [['rook', 'Mr. Hollis. I... I was eleven. I thought you let me win.'], ['hollis', 'I never let anybody win, son. Sit. Five minutes. Nobody beats me in five minutes.'], ['narr', 'Rook wins in twelve. Hollis laughs so hard the pigeons leave.'], ['hollis', 'Thirty-five years I told people "some kids beat me, I let them think it\'s luck." It was never luck. Come back Thursday.']] }
    ], reward: { rp: 200, loot: 'r', title: 'Rematch' } },
  { id: 'f_bea', d: 1, saga: true, friend: true, title: 'Day-Old', giver: 'bea', req: [1, 0], need: friend('bea'), blurb: 'The shelter driver who picks up Tía Bea\'s day-old donuts has stopped coming.',
    offer: [['bea', 'Mijo. Three days, no pickup. Marcus from the shelter comes every night at nine for the day-old. Twenty years, never missed. My donuts are going stale and so is my nerve.']],
    steps: [
      { at: 'Eastgate Pines', who: 'shelter', goal: 'Check on Marcus at Eastgate Pines', say: [['narr', 'No answer. Newspapers on the step, three of them. The car is in the drive. You hear something faint inside: a TV, and maybe a voice.'],
        ['choice', sh([{ t: 'Call it in as a welfare check and look for a safe way in', set: 'beaCheck', trust: 1, reply: [['narr', 'The neighbor has a key. Marcus is on the kitchen floor, conscious, dehydrated, one hip badly hurt. He fell Monday. Rescue is there in six minutes.'], ['shelter', 'Tell Bea... tell Bea I\'m sorry about the donuts.']] }, { t: 'Leave a note on the door and come back tomorrow', set: 'beaNote', trust: -1, reply: [['narr', 'You stop halfway down the drive. Three newspapers. A car that hasn\'t moved. You turn around and call it in. He fell Monday. Another day might have been too many.']] }]), 'The TV keeps talking.']], quiz: { les: 4, n: 1 } },
      { at: 'Eastside Community Center', npc: 'bea', who: 'bea', goal: 'Tell Tía Bea at her shop', say: [['bea', 'Monday! On the floor since Monday! And I was angry at him for being late.'], ['bea', 'Okay. I\'m driving the donuts myself until his hip heals. And then I\'m driving them with him. Twenty years and I never once asked if he wanted coffee.']] }
    ], reward: { rp: 200, loot: 'r' } },
  { id: 'f_nash', d: 2, saga: true, friend: true, title: 'Five-Mile Radius', giver: 'nash', req: [2, 0], need: friend('nash'), blurb: 'Nash wants help making sure nobody ignores the stadium\'s lightning horn again.',
    offer: [['nash', 'Last Saturday the lightning horn went off and a little league coach kept his kids on the field. "Two more outs." Strike hit the light tower ten minutes later.'], ['nash', 'Nobody got hurt. This time. I want him to understand. Not get a ticket. Understand.']],
    steps: [
      { at: 'River Stadium', npc: 'nash', who: 'nash', goal: 'See the light tower with Nash', say: [['nash', 'Black scar right there. Took out the scoreboard and two transformers. That\'s what "two more outs" looked like.'], ['nash', 'His name\'s Coach Pruett. He coaches at Riverside School. Good man, terrible weather sense.']] },
      { at: 'Riverside School', who: 'ump', goal: 'Talk to Coach Pruett at Riverside School', say: [['ump', 'Officer. Is this about Saturday? Look, the sky was blue right over the field.'],
        ['choice', sh([{ t: 'Show him the scorch mark photos and the strike time', set: 'nashPhotos', npc: { nash: 1 }, reply: [['ump', '...Ten minutes. My kids were out there ten minutes before. ...I need to sit down.'], ['ump', 'I\'m going to ask Nash to teach the lightning rule at our first practice. Every season. Every kid.']] }, { t: 'Write him a citation for ignoring the stadium horn', set: 'nashCite', reply: [['ump', 'A ticket? For a horn? ...Fine. I\'ll pay it.'], ['narr', 'He pays it. He still thinks the sky was blue. Nash sighs when he hears.']] }]), 'Coach Pruett crosses his arms.']], quiz: { les: 12, n: 1 } }
    ], reward: { rp: 200, loot: 'r' } },
  { id: 'f_lou', d: 3, saga: true, friend: true, title: 'Where\'s Diesel?', giver: 'lou', req: [3, 0], need: friend('lou'), blurb: 'Diesel, Lou\'s dog and best friend, is missing from the truck stop.',
    offer: [['lou', 'Diesel\'s gone. Twelve years he\'s never left the shop. Gate was latched. I\'m... I\'m not okay, officer.']],
    steps: [
      { at: 'Big Rig Truck Stop', npc: 'lou', who: 'lou', goal: 'Search the truck stop with Lou', say: [['lou', 'He\'s deaf in one ear. Old. Scared of thunder. Thunder last night.'],
        ['choice', sh([{ t: 'Search outward in a planned grid from where he was last seen', set: 'louGrid', reply: [['narr', 'Second grid square: paw prints in the mud by the fence, heading toward the lumber yard. One back foot drags. That\'s him.']] }, { t: 'Drive the main roads and call his name', set: 'louDrive', reply: [['narr', 'Nothing on the roads. Back at the truck stop, a slower look: paw prints by the fence heading toward the lumber yard. You almost drove past them.']] }]), 'Lou holds Diesel\'s leash.']], quiz: { les: 18, n: 1 } },
      { at: 'Sawdust Lumber Yard', who: 'diesel', goal: 'Follow the tracks to the Sawdust Lumber Yard', say: [['narr', 'Under the lowest shelf of stacked pine, where it\'s dry and quiet and smells like a workshop: one old dog, shaking.'], ['narr', 'Lou gets down on the sawdust on both knees. Diesel crawls out into his lap like he\'s still a puppy.'], ['lou', 'Smells like my shop in here. He went somewhere that smelled like home. ...I\'m buying a thunder shirt. Don\'t laugh.']] }
    ], reward: { rp: 200, loot: 'r' } },
  { id: 'f_greer', d: 4, saga: true, friend: true, title: 'Every Word', giver: 'greer', req: [4, 0], need: friend('greer'), blurb: 'Mrs. Greer retires in a month. In 28 years she says she got exactly one word wrong.',
    offer: [['greer', 'Twenty-eight years. Every word of every trial. I got one word wrong. Once. 2009.'], ['greer', 'A juror asked for a read-back. I read "did" where the witness said "didn\'t." I caught it the next morning. The verdict was already in. I filed a correction. Nobody ever told me if it mattered.']],
    steps: [
      { at: 'Clerk of Court', who: 'hattie', goal: 'Look up the 2009 correction at the Clerk of Court', say: [['hattie', 'State v. Hale, 2009. Correction filed by the court reporter the next morning. The defense used it on appeal.'], ['hattie', 'The appeal won. New trial. The second jury acquitted in an hour. Juror nine from the first trial wrote the judge a letter. Mr. Albright. He lives at Courtside Lofts.']] },
      { at: 'Courtside Lofts', who: 'juror9', goal: 'Visit Mr. Albright at Courtside Lofts', say: [['juror9', 'I asked for that read-back. I was the holdout. "Did" changed my mind. When I heard about the correction, I wrote the judge to say I was wrong.'], ['juror9', 'A court reporter who corrects herself the next morning, when nobody would ever have known. That\'s the only reason a man got his life back.']] },
      { at: 'Courtside Lofts', npc: 'greer', who: 'greer', goal: 'Tell Mrs. Greer what her correction did', say: [['greer', 'It mattered.'], ['greer', 'Twenty-eight years I\'ve told every officer on the stand: the record is the record. I never once thought my own mistake would be the proof.'], ['greer', 'Put that in my retirement card. "She fixed it." That\'s all.']] }
    ], reward: { rp: 220, loot: 'r', title: 'For the Record' } }
];

export const ACT2_LORE = [
  { id: 'actTrail', when: 'side:trail5', title: 'The Paper Trail', text: 'For seven years ClearDocket Records lost the county\'s files on purpose and billed to find them. One supervisor wrote it all down and was fired for it. One daughter indexed every box at night. 1,140 boxes went home on a single Saturday at the Eastside Community Center.' },
  { id: 'actLight', when: 'side:lighthouse', title: 'The Lighthouse Window', text: 'Old Stone Church\'s lighthouse window arrived thirty-nine years late by rail. The plaque under it honors the switchman who told everyone where to look.' },
  { id: 'actHollis', when: 'side:f_hollis', title: 'Rematch', text: 'Hollis has lost twice in thirty-five years, both times to the same man, who now drives Route 4 and plays on Thursdays.' },
  { id: 'actGreer', when: 'side:f_greer', title: 'She Fixed It', text: 'A court reporter misheard one word in 2009 and corrected it the next morning. That correction won an appeal, and a man his freedom.' }
];

// readable note sets: read every part of a set and the last one tells you where something is hidden
export const NOTE_SETS = [
  { id: 'capsule', d: 0, title: 'The Founders\' Time Capsule', at: 'Founders Park', item: 'capsule', find: 'Under the depot clock, behind a loose brick with a star scratched on it, a soldered tin box from 1926.' },
  { id: 'kite', d: 1, title: 'The Eastside Kite', at: 'Eastside Plaza', item: 'kite', find: 'Behind the plaza\'s old mural, rolled in a cardboard tube: the kite thirty kids flew in 1988, the summer the plaza opened.' },
  { id: 'rats', d: 2, title: 'The River Rat Society', at: 'Riverside Park', item: 'ratpin', find: 'Nailed under the oldest dock board at the canoe launch: a tobacco tin with a brass pin inside.' },
  { id: 'signs', d: 3, title: 'Rail Rider Signs', at: 'North Spur Pines', item: 'hobocard', find: 'In the hollow of the biggest pine, wrapped in oilcloth: a deck of cards with a chalk sign on every one.' },
  { id: 'wager', d: 4, title: 'The Lawyer\'s Wager', at: 'Gavel Green', item: 'wager', find: 'Taped under the oldest bench on the green, in a plastic sleeve: a silver dollar and an index card.' }
];
export const SET_NOTES = [
  { id: 's_cap1', d: 0, set: 'capsule', part: 1, at: 'Palmetto Row', icon: '📜', kind: 'Porch sign', title: 'Founders Day, 1926', text: 'A brass plate by an old porch: "On this porch the Founders Day committee sealed a box for the year 2026." Someone has scratched below it: "They never said where. Grandma said: ask the bus."' },
  { id: 's_cap2', d: 0, set: 'capsule', part: 2, at: 'Downtown Transit Center', icon: '🚏', kind: 'Old route map', title: 'Streetcar Line, 1926', text: 'A framed map of the old streetcar line in the waiting room. One stop is circled in faded ink: "DEPOT. Time keeps it." The rest of the note is under the frame\'s edge.' },
  { id: 's_cap3', d: 0, set: 'capsule', part: 3, at: 'Central Library', icon: '📚', kind: 'Library display', title: 'The Depot Clock', text: 'A display case: "The depot clock was moved to Founders Park in 1999 after the fire. The clockmaker\'s note: \'a star on the third brick from the bottom marks what we keep.\'"' },
  { id: 's_kite1', d: 1, set: 'kite', part: 1, at: 'Eastgate Pines', icon: '🪁', kind: 'Mailbox flyer', title: 'Kite Day, 1988', text: 'An old flyer stapled under a newer one: "KITE DAY! Eastside Plaza grand opening. Bring string. 30 kids, 1 kite, 1 sky." A newer pen: "Where did the kite go?"' },
  { id: 's_kite2', d: 1, set: 'kite', part: 2, at: 'Birch Lane', icon: '✉️', kind: 'Mailbox sticker', title: 'Mr. Lewis\'s Note', text: 'A sticker inside an old mailbox: "Kite came down in my yard, Aug \'88. Gave it back to the plaza manager. He said he\'d keep it safe \'behind the kids.\' — Lewis."' },
  { id: 's_kite3', d: 1, set: 'kite', part: 3, at: 'Eastside Middle School', icon: '🎨', kind: 'Mural plaque', title: 'Behind the Kids', text: 'A plaque by the school mural: "The original Eastside mural, painted in 1988 by the children of the neighborhood, now hangs at Eastside Plaza." Behind the kids.' },
  { id: 's_rat1', d: 2, set: 'rats', part: 1, at: 'Riverwalk', icon: '🐀', kind: 'Carved railing', title: 'R.R.S.', text: 'Carved into the Riverwalk railing, deep and old: "R.R.S. 1961." Next to it, a tiny canoe. Below, in marker: "Who are the River Rats?"' },
  { id: 's_rat2', d: 2, set: 'rats', part: 2, at: 'Heron Point', icon: '🪵', kind: 'Driftwood sign', title: 'Never Leave a Paddler', text: 'A driftwood sign wedged in the rocks: "River Rat Society. Paddled Cypress Landing before the water came. Never leave a paddler." Burned into the back: "Oldest dock, youngest board."' },
  { id: 's_rat3', d: 2, set: 'rats', part: 3, at: 'Cypress Hammock', icon: '🧭', kind: 'Trail marker', title: 'The Oldest Dock', text: 'A trail marker: "The canoe launch at Riverside Park sits on the oldest dock pilings on the river, 1958. The newest board was added in 1961 by children."' },
  { id: 's_sig1', d: 3, set: 'signs', part: 1, at: 'Railside Apartments', icon: '⭕', kind: 'Chalk mark', title: 'A Circle with Two Arrows', text: 'A faded chalk sign on a fence post: a circle with two arrows. Hector\'s neighbor says rail riders used to leave these. "That one means safe camp. It points north."' },
  { id: 's_sig2', d: 3, set: 'signs', part: 2, at: 'Millworker Row', icon: '🔺', kind: 'Chalk mark', title: 'A Triangle with Hands', text: 'A chalk triangle with two little hands, on the back of a mill house. "Kind woman lives here." Hector\'s mother\'s porch. Under it, newer: "Thank you, Mrs. R. — the cards are in the tallest one."' },
  { id: 's_sig3', d: 3, set: 'signs', part: 3, at: 'Sawdust Lumber Yard', icon: '🌲', kind: 'Survey tag', title: 'The Tallest One', text: 'An old survey tag on the lumber yard fence: "Largest longleaf in the county, North Spur Pines, est. 240 years." Someone has drawn a chalk circle with two arrows on the tag.' },
  { id: 's_wag1', d: 4, set: 'wager', part: 1, at: 'Public Defender', icon: '⚖️', kind: 'Framed letter', title: 'A Bet with Myself', text: 'A framed letter in the lobby, 1964: "I bet a silver dollar that one day a jury here will acquit because an officer told the truth against himself. I hope I lose. — A. Pell."' },
  { id: 's_wag2', d: 4, set: 'wager', part: 2, at: 'Courthouse Newsstand', icon: '📰', kind: 'Clipping', title: 'Moreno, 1994', text: 'A yellowed clipping taped to the newsstand: "Officer admits light was out; jury acquits." Sal has written on it: "Old Pell paid up. Said he hid the dollar where lawyers eat lunch."' },
  { id: 's_wag3', d: 4, set: 'wager', part: 3, at: 'Old Stone Church', icon: '🍃', kind: 'Bench plaque', title: 'Where Lawyers Eat Lunch', text: 'A memorial plaque by the church gate: "The old bench on Gavel Green, where the lawyers of Justice Row have eaten lunch since 1952, was donated by this congregation."' }
];

// lasting marks: what a finished story leaves on the street
export const MARKS = [
  { q: 'room9', d: 0, at: 'Founders Elementary', text: 'HOMEWORK CLUB', sub: 'ROOM 9 · OPEN TIL 6', col: '#facc15' },
  { q: 'ninety', d: 0, at: 'Downtown Urgent Care', text: 'PUBLIC AED', sub: 'LOVE, LUCKY', col: '#ef4444' },
  { q: 'badge214', d: 0, at: 'Founders Park', text: 'BADGE 214', sub: 'H. VANCE · 9:14', col: '#cbd5e1' },
  { q: 'sideb', d: 1, at: 'Fuel Depot', text: 'NOW PLAYING', sub: 'SIDE B · 3 A.M.', col: '#a78bfa' },
  { q: 'firstboard', d: 1, at: 'Eastside Community Center', text: 'CHESS CLUB', sub: 'STATE · 3RD PLACE', col: '#38bdf8' },
  { q: 'trail5', d: 1, at: 'Eastside Community Center', text: '1,140 FILES', sub: 'RETURNED HERE', col: '#fde68a' },
  { q: 'sender', d: 2, at: 'Pelican Diner', text: 'NAMED FOR', sub: 'GENE\'S BOAT', col: '#34d399' },
  { q: 'atthree', d: 2, at: 'Little Paddlers Daycare', text: 'GUMBO\'S SPOT', sub: 'EVERY DAY AT 3', col: '#fb923c' },
  { q: 'drowned', d: 2, at: 'Heron Point', text: 'CYPRESS LANDING', sub: '41 FAMILIES', col: '#7dd3fc' },
  { q: 'siding9', d: 3, at: 'Eastline Rail Yard', text: 'SIDING 9', sub: 'R. LINDQVIST', col: '#f59e0b' },
  { q: 'hives', d: 3, at: 'Vacant Lot', text: 'COREY-1', sub: 'HONEY $8', col: '#facc15' },
  { q: 'trail4', d: 3, at: 'Lock-It Storage', text: 'UNIT 31', sub: 'EVIDENCE · SEALED', col: '#94a3b8' },
  { q: 'ocampo', d: 4, at: 'Veterans Memorial Park', text: 'PVT. L. OCAMPO', sub: '1968 · 413', col: '#cbd5e1' },
  { q: 'addresses', d: 4, at: 'Freedom Bail Bonds', text: 'THEO', sub: 'MADE EVERY DATE', col: '#4ade80' },
  { q: 'streetlight', d: 4, at: 'Magnolia Terrace', text: 'LAMP FIXED', sub: 'PAGE 213', col: '#fde68a' }
];

// daily routines for the people in these stories: [morning 6-12, afternoon 12-18, evening 18-24, night 0-6]; null = home
export const ROUTINE4 = {
  leon: ['Harbor View Apartments', 'Founders Plaza', null, null], tasha: ['Bayfront Dog Run', null, null, null], carmen: [null, 'First Light Chapel', null, null],
  hollis: [null, null, 'Founders Park', 'Night Owl Diner'], priya: ['Bayfront Tower', null, 'Founders Plaza', null],
  jamal: ['Sunrise Café', null, null, 'Fuel Depot'], andy: [null, null, 'Eastside Dog Park', null], mo: [null, 'Eastside Plaza', null, null], bea: [null, 'Birch Lane', 'Eastside Community Center', null],
  toby: [null, null, 'Pelican Diner', null], ines: [null, 'Little Paddlers Daycare', null, null], nash: ['Riverwalk', null, null, null],
  tess: [null, 'The Lunch Pail', 'Railside Apartments', null], ivy: [null, null, 'Green Bin Recycling', null], lou: [null, null, null, 'Coastline Freight'], pat: ['Railside Apartments', null, null, null],
  booker: [null, 'Old Stone Church', null, null], greer: [null, null, 'Gavel Green', null], ada: [null, null, 'The Gavel Grill', null]
};
