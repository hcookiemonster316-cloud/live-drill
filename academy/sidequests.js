// Side cases, part two: eight more per district (ten each with the originals in story.js).
// Every case has its own giver, its own people and its own corners of the map, so following them is a tour of the city.
// giverAt: a one-off character waits at that place with a blue "!" until you take the case.
export const SIDE_CAST = {
  // Central District
  kid: { name: 'Mateo, age 9', icon: '🧒', role: 'Founders Elementary, third grade' },
  barista: { name: 'Noor', icon: '☕', role: 'Grind & Badge Coffee' },
  rtech: { name: 'Ana Ruiz', icon: '📡', role: 'County radio technician' },
  hank: { name: 'Hank', icon: '🚌', role: 'Night bus driver' },
  super: { name: 'Mr. Odum', icon: '🔑', role: 'Super, Harbor View Apartments' },
  nurse: { name: 'Nurse Adaeze', icon: '🩺', role: 'Downtown Urgent Care' },
  wren: { name: 'Wren', icon: '🚲', role: 'Owns Spokes & Spares' },
  pawnclerk: { name: 'Benita', icon: '💍', role: 'Downtown Pawn & Loan' },
  seller: { name: 'Hoodie guy', icon: '🧥', role: 'Selling bikes on Palmetto Row' },
  shopowner: { name: 'Mrs. Ellery', icon: '📚', role: 'Owns Dog-Eared Books' },
  hale: { name: 'Reverend Whitaker', icon: '⛪', role: 'First Light Chapel' },
  gio: { name: 'Gio', icon: '🍕', role: 'Owns Slice of Justice' },
  barber: { name: 'Otis the Barber', icon: '💈', role: 'Sharp Edges Barbershop' },
  teller: { name: 'Mr. Banks', icon: '🏦', role: 'Teller, First Coast Bank' },
  diaz: { name: 'Mrs. Diaz', icon: '🐩', role: 'Walks her poodle at the Dog Run' },
  pio: { name: 'Officer Lane', icon: '📣', role: 'Public information officer' },
  // Eastside
  mia: { name: 'Mia', icon: '🧢', role: 'Tre\'s little sister' },
  boxer: { name: 'Tre', icon: '🥊', role: 'Iron Will regular' },
  walker: { name: 'Gloria', icon: '🦮', role: 'Walks six dogs at once' },
  ferretowner: { name: 'Bev', icon: '🦦', role: 'Old Grove Farm, owner of Gary the ferret' },
  pharmacist: { name: 'Dr. Whitfield', icon: '💊', role: 'Eastside Pharmacy' },
  pastorj: { name: 'Pastor James', icon: '🙏', role: 'Eastside Baptist Church' },
  principal: { name: 'Principal Holloway', icon: '🏫', role: 'Eastside Middle School' },
  washkid: { name: 'Kyle', icon: '🧽', role: 'Car wash fundraiser' },
  clerk: { name: 'Benny', icon: '⛽', role: 'Gas & Go clerk' },
  jules: { name: 'Jules', icon: '✂️', role: 'Barber, Fade Factory' },
  tran: { name: 'Mr. Tran', icon: '📱', role: 'Corner Cell Repair' },
  mallsec: { name: 'Guard Okoye', icon: '🛡️', role: 'Eastside Plaza security' },
  groom: { name: 'Marco', icon: '💍', role: 'Proposing tonight, hopefully' },
  jeweler: { name: 'Mr. Oyelaran', icon: '💎', role: 'Eastside Jewelers' },
  finder: { name: 'Danny, age 15', icon: '🧑', role: 'Found something shiny' },
  tony: { name: 'Tony', icon: '🍕', role: 'Tony\'s Pizza' },
  nightclerk: { name: 'Night clerk', icon: '🛎️', role: 'Eastgate Motel' },
  // Riverside
  jogger: { name: 'Sasha', icon: '🏃', role: 'Runs the Riverwalk every morning' },
  boatowner: { name: 'Mr. Albright', icon: '⛵', role: 'Sailboat owner' },
  farmer: { name: 'Mr. Pruett', icon: '🌾', role: 'Willow Creek Farm' },
  okoro: { name: 'Ms. Okoro', icon: '🏡', role: 'Works at River Pawn, next-door neighbor' },
  bell: { name: 'Engineer Bell', icon: '🚒', role: 'Fire Station 3' },
  tenant: { name: 'Mr. Kessler', icon: '🔥', role: 'Cypress Lane homeowner' },
  director: { name: 'Ms. Patel', icon: '🧸', role: 'Little Paddlers Daycare' },
  trapper: { name: 'Dale', icon: '🐊', role: 'Licensed nuisance alligator trapper' },
  chaplain: { name: 'Chaplain Ortiz', icon: '🕊️', role: 'Police chaplain' },
  organizer: { name: 'Ms. Reyes-Ford', icon: '📣', role: 'Parent organizer' },
  junie: { name: 'Junie', icon: '🧭', role: 'Captain Hal\'s apprentice' },
  feed: { name: 'Mr. Boone', icon: '🌽', role: 'Riverside Feed & Seed' },
  lucia: { name: 'Lucia, age 8', icon: '👧', role: 'Heron Point' },
  pham: { name: 'Mr. Pham', icon: '🥭', role: 'River Market vendor' },
  lin: { name: 'Mrs. Lin', icon: '👵', role: 'Bayou Senior Apartments' },
  // Industrial Park
  manager: { name: 'Night Manager Doyle', icon: '📦', role: 'Palmetto Paper Co.' },
  vacant: { name: 'Mr. Ames', icon: '🧹', role: 'Sleeps rough behind Lock-It Storage' },
  hiker: { name: 'Jonah, age 17', icon: '🎒', role: 'Hitchhiker' },
  railneighbor: { name: 'Mrs. Kowal', icon: '🪟', role: 'Railside Apartments, second floor' },
  copperman: { name: 'Pickup driver', icon: '🛻', role: 'Has a lot of copper wire' },
  packer: { name: 'Big Mo', icon: '🏷️', role: 'Gulf Packaging, 31 years' },
  crew: { name: 'Shift lead Ruby', icon: '🦺', role: 'Gulf Packaging' },
  foreman: { name: 'Foreman Briggs', icon: '🪵', role: 'Sawdust Lumber Yard' },
  sod: { name: 'Farmer Ellis', icon: '🚜', role: 'Sandhill Sod Farm' },
  evtech: { name: 'Evidence Tech Kowalski', icon: '🧾', role: 'County Evidence Storage' },
  railcop: { name: 'Officer Banks', icon: '🚂', role: 'Railroad police' },
  teens: { name: 'Three teenagers', icon: '🛹', role: 'Definitely not hopping trains' },
  bottler: { name: 'Rhonda', icon: '🥤', role: 'Sunrise Bottling' },
  // Justice Row
  walkin: { name: 'Darnell Price', icon: '🧥', role: 'Ready to turn himself in' },
  pd: { name: 'Assistant Public Defender Cho', icon: '📂', role: 'Public Defender' },
  propoff: { name: 'Sgt. Ibarra', icon: '🗃️', role: 'Property records, County Records Annex' },
  juror: { name: 'Mrs. Whitlock', icon: '🧾', role: 'Magnolia Terrace' },
  admin: { name: 'Clerk Fernandez', icon: '🗄️', role: 'Jury office, County Administration' },
  newsie: { name: 'Sal', icon: '📰', role: 'Courthouse Newsstand' },
  asa: { name: 'ASA Morrow', icon: '⚖️', role: 'State Attorney\'s Office' },
  cook: { name: 'Cookie', icon: '🍔', role: 'The Gavel Grill' },
  lawyerA: { name: 'Attorney Pell', icon: '💼', role: 'Pell & Pell' },
  lawyerB: { name: 'Attorney Vasquez', icon: '👜', role: 'Vasquez Law' },
  po: { name: 'Officer Grant', icon: '📋', role: 'Probation & Parole' },
  probationer: { name: 'Luis', icon: '🧢', role: 'On probation, doing his best' },
  sexton: { name: 'Mr. Hobbs', icon: '🔔', role: 'Sexton, Old Stone Church' },
  deputy: { name: 'Deputy Wells', icon: '🚐', role: 'Transport deputy' }
};

export const SIDE2 = [
  // ================= Central District =================
  { id: 'pigeons', d: 0, title: 'The Pigeon Situation', giver: 'pruitt', req: [0, 0], blurb: 'Pigeons are raiding the pastry case at Grind & Badge, and Sgt. Pruitt (Ret.) suspects an inside job.',
    offer: [['pruitt', 'Cadet, the pigeons over at Grind & Badge are organized. Somebody\'s training them. Believe me, I\'d know. I\'ve been training pigeons for forty years.']],
    steps: [
      { at: 'Grind & Badge Coffee', who: 'barista', goal: 'Ask Noor at Grind & Badge about the pastry heists', say: [['barista', 'Every day at three. They swoop down, grab one, and they\'re gone. Only the croissants, too. They\'ve got good taste, I\'ll give them that.'], ['barista', 'It started when the elementary school began letting out early on Wednesdays. There\'s a little kid who sits on our bench with a bag of bread.']], quiz: { les: 0, n: 1 } },
      { at: 'Founders Elementary', who: 'kid', goal: 'Find the kid at Founders Elementary', say: [['kid', 'I\'m not training them! I\'m just... teaching them. That\'s different.'],
        ['choice', [
          { t: 'Ask him to use birdseed in the park', set: 'pigeonSeed', trust: 1, reply: [['kid', 'Birdseed? Is that better for them? Okay. Okay, I\'ll do that.']] },
          { t: 'Tell him the café feeding has to stop', set: 'pigeonStop', reply: [['kid', '...Fine. Sorry, pigeons.']] },
          { t: 'Introduce him to Sgt. Pruitt instead', set: 'pigeonPruitt', npc: { pruitt: 1 }, reply: [['pruitt', '(over the radio) A young pigeon man! Bring him to Founders Park on Sunday. I\'ve got forty years of stuff to teach him.']] }]]] }
    ], reward: { rp: 110, loot: 'u' } },
  { id: 'deadair', d: 0, title: 'Dead Air', giver: 'kevin', req: [0, 1], blurb: 'Kevin from IT found a radio dead spot downtown.',
    offer: [['kevin', 'So, um, your radios. Near Bayfront Tower they just... stop working. I tested it with my scanner. It\'s a hobby. Please don\'t arrest me.'], ['kevin', 'The county radio tech is up at the Radio Tower today. She\'d want to see my graph. Everybody wants to see my graph.']],
    steps: [
      { at: 'Radio Tower', who: 'rtech', goal: 'Show Kevin\'s graph to Ana at the Radio Tower', say: [['rtech', 'Huh. Signal\'s fine, fine, fine, and then there\'s nothing for a whole block. That\'s the downtown repeater. It\'s been acting up since the hurricane.'], ['rtech', 'I can fix it, but the work order has to come from the department. Somebody has to put it in writing.']], quiz: { les: 2, n: 1 } },
      { at: 'Dispatch Center', who: 'velvet', goal: 'Bring it to Velvet at the Dispatch Center', say: [['velvet', 'A dead spot downtown? Officers walk that block every night.'],
        ['choice', [
          { t: 'Write it up as an officer safety hazard through the chain of command', set: 'deadairReport', trust: 1, reply: [['velvet', 'If it\'s an officer safety issue, it goes to the top of the list. I\'ll walk it over to the lieutenant myself.'], ['rtech', '(over the radio) Got the work order. The repeater\'ll be back up tonight.']] },
          { t: 'Just tell units to avoid that block for now', set: 'deadairAvoid', reply: [['velvet', 'That\'s a bandage, not a fix, sugar. I\'m writing it up anyway.']] }]]] }
    ], reward: { rp: 130, loot: 'r' } },
  { id: 'nightowl', d: 0, title: 'The Empty Seat', giver: 'hank', giverAt: 'City Garage', req: [0, 2], blurb: 'The night bus driver is worried about a rider who stopped riding.',
    offer: [['hank', 'Officer, I drive the night bus. Mr. Abernathy rides it every night at 11:40, from Harbor View to the diner and back. Black coffee and cherry pie. It\'s been a week and I haven\'t seen him.'], ['hank', 'He looked gray the last time I saw him. Real gray. Would you check on him?']],
    steps: [
      { at: 'Harbor View Apartments', who: 'super', goal: 'Check on Mr. Abernathy at Harbor View Apartments', say: [['super', 'Abernathy in 4B? Yeah, his mail\'s piling up. But I saw him get in a cab about a week ago holding his chest. He said he was going to urgent care.']], quiz: { les: 9, n: 1 } },
      { at: 'Downtown Urgent Care', who: 'nurse', goal: 'Ask about him at Downtown Urgent Care', say: [['nurse', 'He\'s here. He\'s okay, but we admitted him for observation. He hasn\'t had a single visitor all week. He asked if anybody had noticed he was gone.'],
        ['choice', [
          { t: 'Bring him cherry pie from the Night Owl', set: 'pieDelivered', npc: { dot: 2 }, reply: [['nurse', 'Pie is against about three hospital rules. I\'ll allow it. He\'s going to cry.']] },
          { t: 'Radio Hank that his rider is okay', reply: [['hank', '(over the radio) Oh, thank goodness. I\'ll save his seat. Third row, left side.']] }]]] }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'spokes', d: 0, title: 'Spokes and Suspects', giver: 'marcus', req: [0, 1], blurb: 'Bikes are vanishing from the racks at Bayfront Tower.',
    offer: [['marcus', 'Three bikes got stolen off the Bayfront racks this week. Mine\'s next, I can feel it. That bike is my whole job, officer.'], ['marcus', 'Wren at Spokes & Spares keeps a list of every serial number she\'s ever sold. Start there.']],
    steps: [
      { at: 'Spokes & Spares', who: 'wren', goal: 'Get the serial numbers from Wren at Spokes & Spares', say: [['wren', 'All three of them came from my shop. Here are the serial numbers. And look, one of them\'s already listed online. "Barely used." Yeah, it was barely used. Because it was stolen.']], quiz: { les: 3, n: 1 } },
      { at: 'Downtown Pawn & Loan', who: 'pawnclerk', goal: 'Check Downtown Pawn & Loan', say: [['pawnclerk', 'A kid in a hoodie tried to pawn a bike with one of those serials yesterday. We run every serial number, so I sent him away. He said he lives on Palmetto Row and he\'d just sell it himself.']], quiz: { les: 3, n: 1 } },
      { at: 'Palmetto Row', who: 'pike', goal: 'Meet Pike at Palmetto Row', say: [['pike', 'Hoodie guy, three bikes in the carport, and he looks nervous. Let\'s go grab him.'],
        ['choice', [
          { t: 'Plan it: you make contact, Pike covers', set: 'spokesPlan', reply: [['pike', 'Contact and cover. Fine. ...He\'s handing them over. Says he "found" them. Sure, buddy.'], ['marcus', '(over the radio) You got the bikes back? Oh man. Thank you. Seriously, thank you.']] },
          { t: 'Let Pike move in while he\'s surprised', set: 'spokesRush', trust: -1, reply: [['pike', 'He\'s running! He dropped the bikes! ...I\'m still counting that as a win.']] }]]] }
    ], reward: { rp: 150, loot: 'r' } },
  { id: 'overdue', d: 0, title: 'Overdue Since 1987', giver: 'shopowner', giverAt: 'Dog-Eared Books', req: [0, 3], blurb: 'A library book due in 1987 turned up in a used bookstore\'s donation bin.',
    offer: [['shopowner', 'Officer! Somebody left this in my donation bin. "Pigeons of the American South." It\'s a Central Library copy. It was due back March 4th, 1987.'], ['shopowner', 'And there\'s a church bulletin from First Light Chapel tucked inside the cover. From 1987. I have to know what happened here.']],
    steps: [
      { at: 'First Light Chapel', who: 'hale', goal: 'Ask about the bulletin at First Light Chapel', say: [['hale', 'Oh. Oh my. That\'s my handwriting in the margin.'], ['hale', 'I borrowed it for a sermon about patience. Then I got embarrassed about how late it was. Then it had been ten years. Then thirty-nine. I put it in the bin hoping nobody would notice.'],
        ['choice', [
          { t: 'Suggest he return it to the library himself', set: 'haleReturns', trust: 1, reply: [['hale', 'In person. You\'re right. That\'s exactly what I\'d tell anybody else.']] },
          { t: 'Offer to return it for him', reply: [['hale', 'You\'d do that for me? ...No. No, I should be the one to do it. But thank you.']] }]]], quiz: { les: 13, n: 1 } },
      { at: 'Dog-Eared Books', who: 'shopowner', goal: 'Tell Mrs. Ellery what you found', say: [['shopowner', 'A reverend! I\'m going to be telling this story for years.'], ['okafor', '(over the radio) Thirty-nine years of feeling guilty is punishment enough. No fine. Tell him the reading club meets on Thursdays.', { if: 'haleReturns' }]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'corner', d: 0, title: 'Corner Wars', giver: 'gio', giverAt: 'Slice of Justice', req: [0, 2], blurb: 'Gio and Mr. Delgado are fighting over the same corner.',
    offer: [['gio', 'Officer, I put a sandwich board on the plaza corner, and Delgado says it\'s his corner. Twenty-two years, he says. It\'s a public sidewalk. It\'s for everybody.']],
    steps: [
      { at: 'Founders Plaza', npc: 'delgado', who: 'delgado', goal: 'Mediate at Founders Plaza', say: [['delgado', 'Gio sent you? Of course he did. So who wins?'], ['gio', '(walking up) Yeah, officer. Who wins?'],
        ['choice', [
          { t: 'Split the corner and check both vending permits', set: 'cornerSplit', trust: 1, npc: { delgado: 1 }, reply: [['delgado', 'Half a corner... with a combo deal? Hot dog and a slice?'], ['gio', 'We could call it the Founders Special. ...I hate that I love that.']] },
          { t: 'Enforce the permit map exactly as written', set: 'cornerPermit', reply: [['gio', 'Fine. The board moves three feet. Three very bitter feet.']] }]]], quiz: { les: 8, n: 1 } }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'shoptalk', d: 0, title: 'Shop Talk', giver: 'barber', giverAt: 'Sharp Edges Barbershop', req: [0, 3], blurb: 'A barbershop rumor about a scam targeting seniors.',
    offer: [['barber', 'Three of my older customers got calls about "computer viruses." Tech support, remote access, gift cards. Mrs. Diaz almost bought four hundred dollars\' worth of gift cards.'], ['barber', 'The teller at First Coast Bank stopped one of them. You should talk to him.']],
    steps: [
      { at: 'First Coast Bank', who: 'teller', goal: 'Talk to the teller at First Coast Bank', say: [['teller', 'He was taking out two thousand in cash and kept checking his phone. When I asked about it, he said, "Tech support told me not to tell you." That\'s how you know. Every time.']], quiz: { les: 3, n: 1 } },
      { at: 'Sharp Edges Barbershop', who: 'barber', goal: 'Plan something with Otis at Sharp Edges', say: [['barber', 'So what do we do? They trust me. They don\'t trust flyers.'],
        ['choice', [
          { t: 'Hold a scam talk in the shop Saturday', set: 'scamClass', trust: 2, npc: { kevin: 1 }, reply: [['barber', 'In the shop? With free trims? They\'ll come for the haircut and stay for the talk.'], ['kevin', '(over the radio) I made slides. Forty slides. Okay, ten.']] },
          { t: 'Leave scam flyers on every counter', set: 'scamFlyers', reply: [['barber', 'Flyers are good. People do read them. Sometimes.']] }]]] }
    ], reward: { rp: 130, loot: 'r' } },
  { id: 'fakepage', d: 0, title: 'Not Our Page', giver: 'diaz', giverAt: 'Bayfront Dog Run', req: [0, 4], blurb: 'A fake police page is asking for donations by gift card.',
    offer: [['diaz', 'Officer! My friends keep sharing a "Port Meridian Police Charity" page, and it wants donations in gift cards. It has your badge on it. That\'s not you, is it? Pepito, sit.']],
    steps: [
      { at: 'Patrol HQ', inside: true, who: 'pio', goal: 'Take it to Officer Lane at Patrol HQ', say: [['pio', 'That\'s not ours. Get screenshots, the account name, the payment details and the times, before they delete it.']], quiz: { les: 3, n: 1 } },
      { at: 'Bayfront Dog Run', who: 'diaz', goal: 'Get back to Mrs. Diaz at the Dog Run', say: [['diaz', 'So what do I tell my friends?'],
        ['choice', [
          { t: 'Have the PIO warn people on the real page', set: 'fakeWarned', trust: 2, reply: [['pio', '(over the radio) Posted. It\'s on our real page now with a warning. The fake one should be down by tonight.'], ['diaz', 'I\'m telling everybody. Pepito\'s telling everybody.']] },
          { t: 'Tell her friends to ignore the fake page', reply: [['diaz', 'Ignore it? Mrs. Rosen already sent fifty dollars!']] }]]] }
    ], reward: { rp: 140, loot: 'r' } },

  // ================= Eastside =================
  { id: 'gloves', d: 1, title: 'Gloves Off', giver: 'reyes', req: [1, 0], blurb: 'A sparring grudge at Iron Will could spill out into the street.',
    offer: [['reyes', 'Two of my fighters got into it after sparring. Tre went home mad and said he\'s going to "settle it." I don\'t like that word. His sister Mia lives at Eastgate Apartments.']],
    steps: [
      { at: 'Eastgate Apartments', who: 'mia', goal: 'Talk to Mia at Eastgate Apartments', say: [['mia', 'He went running. When he gets mad, he runs the trails in Eastgate Pines until he\'s too tired to be mad anymore. Please don\'t make it worse.']], quiz: { les: 4, n: 1 } },
      { at: 'Eastgate Pines', who: 'boxer', goal: 'Find Tre on the trail in Eastgate Pines', say: [['boxer', 'He hit me after the bell! Everybody saw it!'],
        ['choice', [
          { t: 'Keep your distance and let him vent', set: 'glovesCalm', trust: 1, npc: { reyes: 1 }, reply: [['boxer', '...Yeah. Okay. I\'m just tired, man. I train every day.'], ['reyes', '(over the radio) Saturday. Three rounds, headgear, I\'ll referee, and they shake hands after. That\'s how we settle things at my gym.']] },
          { t: 'Tell him firmly to calm down now', set: 'glovesOrder', reply: [['boxer', 'Don\'t tell me to calm down! ...Fine. Fine.']] }]]], quiz: { les: 5, n: 1 } }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'sockbandit', d: 1, title: 'The Sock Bandit', giver: 'kim', req: [1, 0], blurb: 'Single socks keep vanishing from the dryers at Spin City.',
    offer: [['kim', 'Officer. Socks. One sock out of every pair, every day. My customers think I\'m the one stealing them. I don\'t want socks. I have enough socks.'], ['kim', 'There are little paw prints behind dryer four. They go toward the dog park.']],
    steps: [
      { at: 'Eastside Dog Park', who: 'walker', goal: 'Ask the dog walker at Eastside Dog Park', say: [['walker', 'A ferret? In a sweater? Yeah, every morning, heading down the east road toward Old Grove Farm with a sock in its mouth. My dogs go crazy.']], quiz: { les: 11, n: 1 } },
      { at: 'Old Grove Farm', who: 'ferretowner', goal: 'Follow the trail to Old Grove Farm', say: [['ferretowner', 'Gary! His name\'s Gary. He\'s been gone two weeks. He... has a nest of socks in the barn? Oh, Gary.'],
        ['choice', [
          { t: 'Return the socks to Mr. Kim and suggest a ferret-proof cage', set: 'garyHome', npc: { kim: 1 }, reply: [['kim', '(over the radio) A hundred and twelve socks. Lost and found. Happy ending.']] },
          { t: 'Call animal control to check on Gary', reply: [['ferretowner', 'I\'ll meet them here. Thank you for finding him.']] }]]] }
    ], reward: { rp: 110, loot: 'u' } },
  { id: 'forgery', d: 1, title: 'Prescription for Trouble', giver: 'rosa', req: [1, 2], blurb: 'Someone is passing forged prescriptions on Eastside.',
    offer: [['rosa', 'Mijo, Dr. Whitfield at the pharmacy is worried. Somebody keeps bringing in fake prescriptions. She asked me to find a police officer I trust.']],
    steps: [
      { at: 'Eastside Pharmacy', who: 'pharmacist', goal: 'Talk to Dr. Whitfield at Eastside Pharmacy', say: [['pharmacist', 'Same doctor\'s name, wrong license number, three times this month. He\'s coming back tonight to pick up.']], quiz: { les: 4, n: 1 } },
      { at: 'Fuel Depot', who: 'castillo', goal: 'Plan it with Sgt. Castillo at the Fuel Depot', say: [['castillo', 'Okay, talk me through it. Pharmacy, staff, customers inside. Who\'s contact, who\'s cover, and where does he go if he runs?'],
        ['choice', [
          { t: 'Contact him outside, after he leaves', set: 'rxPlan', npc: { rosa: 1 }, reply: [['castillo', 'Away from the staff and the customers. Good. That\'s how you do it.'], ['rosa', '(over the radio) Dr. Whitfield says you were so calm. She sent you flan. I ate half. Sorry.']] },
          { t: 'Contact him at the pharmacy counter', set: 'rxCounter', reply: [['castillo', 'Hm. That\'s a lot of people in a small space. Be ready.']] }]]], quiz: { les: 6, n: 1 } }
    ], reward: { rp: 140, loot: 'r' } },
  { id: 'kickflip', d: 1, title: 'Kickflip Court', giver: 'dez', req: [1, 1], blurb: 'The skaters need somewhere to skate that isn\'t under somebody\'s bedroom window.',
    offer: [['dez', 'Officer, the people next to the church want us out of their lot. Where are we supposed to skate? The street? That\'s worse, right?']],
    steps: [
      { at: 'Eastside Baptist Church', who: 'pastorj', goal: 'Hear Pastor James out at Eastside Baptist', say: [['pastorj', 'I like those kids. But it\'s eleven at night, clack, clack, clack, and Mrs. Albury is eighty-one. She needs her sleep.']], quiz: { les: 8, n: 1 } },
      { at: 'Eastside Middle School', who: 'principal', goal: 'Ask about the lot at Eastside Middle School', say: [['principal', 'Our back lot is empty every evening. If the kids follow the rules, I\'d rather have them here than in the street.'],
        ['choice', [
          { t: 'Propose skate hours, 4 to 9 p.m., and a sign-in sheet', set: 'skateHours', trust: 2, npc: { dez: 1 }, reply: [['principal', 'Done. And I\'m making Dez the monitor. Don\'t tell him it\'s a job.'], ['dez', '(over the radio) A whole lot? For real? Thank you!']] },
          { t: 'Tell them to take it to the city council', reply: [['principal', 'The council meets at two in the afternoon. They\'re in school. Think about it.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'bubbles', d: 1, title: 'Suds and Scams', giver: 'washkid', giverAt: 'Bubbles Car Wash', req: [1, 2], blurb: 'Kids at a car wash were told they were raising money for a police league that doesn\'t exist.',
    offer: [['washkid', 'Officer? A guy paid us ten bucks each to wash cars and give him all the money. He said it was for the "Police Youth League." Is that... not a real thing?']],
    steps: [
      { at: 'Gas & Go', who: 'clerk', goal: 'Ask the clerk at Gas & Go about the man', say: [['clerk', 'White van, parks here every morning and buys two energy drinks. He was talking about "his car wash kids." Gross. He had a fresh fade and said Jules does his hair.']], quiz: { les: 5, n: 1 } },
      { at: 'Fade Factory', who: 'jules', goal: 'Ask Jules at Fade Factory', say: [['jules', 'Him? He books his appointments online. I\'ve got his name and number right here. I don\'t like people who use kids.'],
        ['choice', [
          { t: 'Take statements, with the kids\' parents', set: 'sudsStatements', trust: 1, reply: [['castillo', '(over the radio) Statements, a name and a phone number. That\'s a case. Good work.']] },
          { t: 'Shut the car wash fundraiser down', reply: [['castillo', '(over the radio) So the kids go home, and he goes and finds new kids. Think bigger next time.']] }]]] }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'wallwords', d: 1, title: 'Words on the Wall', giver: 'tran', giverAt: 'Corner Cell Repair', req: [1, 3], blurb: 'Threatening graffiti targets a shop owner. Again.',
    offer: [['tran', 'This is the third time. And it\'s not just graffiti, it\'s my name and a threat. An ex-employee keeps posting about me online too. My daughter works the counter. I\'m worried.']],
    steps: [
      { at: 'Eastside Plaza', who: 'mallsec', goal: 'Check the cameras with Guard Okoye at Eastside Plaza', say: [['mallsec', 'Our camera covers the walkway behind his shop. Same hoodie, three nights. And the same guy walks through the plaza every day at noon and just stares at the store.']], quiz: { les: 7, n: 1 } },
      { at: 'Substation', inside: true, who: 'castillo', goal: 'Talk threat assessment with Castillo', say: [['castillo', 'This isn\'t one incident. It\'s a pattern of behavior. That\'s exactly what threat assessment is for.'],
        ['choice', [
          { t: 'Refer the pattern for threat assessment', set: 'btamReferral', trust: 1, reply: [['castillo', 'Right call. The team looks at the whole picture, not just the paint.']] },
          { t: 'Write it up as vandalism, case closed', set: 'btamVandal', reply: [['castillo', 'And the posts? The staring? Just writing a vandalism report misses the point.']] }]]], quiz: { les: 7, n: 1 } }
    ], reward: { rp: 150, loot: 'r' } },
  { id: 'ring', d: 1, title: 'The Ring Thing', giver: 'groom', giverAt: 'Glam Nails', req: [1, 1], blurb: 'An engagement ring went missing on the big day.',
    offer: [['groom', 'Officer, I took my grandmother\'s ring off for a manicure, set it on the tray, stepped outside for some air, and now it\'s gone. I\'m proposing at seven. It\'s four.']],
    steps: [
      { at: 'Eastside Jewelers', who: 'jeweler', goal: 'Check with the jeweler at Eastside Jewelers', say: [['jeweler', 'A teenager came in about an hour ago asking what a ring like that is worth. I didn\'t buy it. He seemed scared, not like a thief. He headed toward the Sunrise Café.']], quiz: { les: 13, n: 1 } },
      { at: 'Sunrise Café', who: 'finder', goal: 'Find the teenager at the Sunrise Café', say: [['finder', 'I found it on the sidewalk! I swear! I didn\'t know whose it was and I panicked.'],
        ['choice', [
          { t: 'Log it as found property and return it', set: 'ringLogged', trust: 1, reply: [['groom', '(over the radio) You found it?! And the kid who found it? He\'s invited to the wedding. I\'m serious.']] },
          { t: 'Warn him about keeping found property', reply: [['finder', 'I was going to turn it in. I just didn\'t know how.']] }]]] }
    ], reward: { rp: 120, loot: 'r' } },
  { id: 'donutstake', d: 1, title: 'The Donut Stop Stakeout', giver: 'tony', giverAt: 'Tony\'s Pizza', req: [1, 3], blurb: 'Someone keeps trying Tony\'s back door at night.',
    offer: [['tony', 'Pry marks on my back door, two nights in a row. Your buddy Pike says he\'s "on it." He\'s been sitting in The Donut Stop for three hours.']],
    steps: [
      { at: 'The Donut Stop', who: 'pike', goal: 'Find Pike at The Donut Stop', say: [['pike', 'Before you say anything, the donuts are my cover. Also they\'re really good. The guy comes around midnight. He walks over from the motel side.']], quiz: { les: 17, n: 1 } },
      { at: 'Eastgate Motel', who: 'nightclerk', goal: 'Ask the night clerk at the Eastgate Motel', say: [['nightclerk', 'Room 9. Pays cash. Carries a pry bar around in his backpack like it\'s a water bottle. He\'s out right now.'],
        ['choice', [
          { t: 'Pass on the description, suggest lights', set: 'tonyLights', trust: 1, reply: [['castillo', '(over the radio) A unit picked him up two blocks over with the pry bar. The tool marks match three other doors. Good work.']] },
          { t: 'Sit on the alley with Pike all night', set: 'tonySit', reply: [['pike', '(over the radio) A real stakeout! I\'ll go get more donuts.']] }]]] }
    ], reward: { rp: 140, loot: 'u' } },

  // ================= Riverside =================
  { id: 'adrift', d: 2, title: 'Adrift', giver: 'hal', req: [2, 0], blurb: 'A sailboat came loose and drifted into the marina.',
    offer: [['hal', 'Somebody\'s sailboat drifted into my slips at dawn. No name on the back. The joggers on the Riverwalk see everything that floats.']],
    steps: [
      { at: 'Riverwalk', who: 'jogger', goal: 'Ask the morning jogger on the Riverwalk', say: [['jogger', 'Blue hull, white sail cover? It was tied up near Heron Point yesterday. The owner eats breakfast at the Rowboat Café every single day. Tall guy. Likes to lecture people about knots.']], quiz: { les: 13, n: 1 } },
      { at: 'The Rowboat Café', who: 'boatowner', goal: 'Find the owner at the Rowboat Café', say: [['boatowner', 'My boat?! My knots are excellent. The rope was old. Blame the rope.'],
        ['choice', [
          { t: 'Document the recovery and get a signature', set: 'boatLogged', reply: [['boatowner', 'Signed. Thank you. I\'m buying new rope today. And maybe a book about knots.']] },
          { t: 'Tell him where the boat is and move on', reply: [['hal', '(over the radio) No paperwork? Your sergeant isn\'t going to like that.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'fenceline', d: 2, title: 'A Fence Too Far', giver: 'gus', req: [2, 0], blurb: 'Two neighbors out past the creek are feuding over a fence line.',
    offer: [['gus', 'My cousin Pruett out at Willow Creek Farm put up a fence, and his neighbor Ms. Okoro says it\'s six inches over the line. They both have surveys. They both have tempers.']],
    steps: [
      { at: 'Willow Creek Farm', who: 'farmer', goal: 'Hear Mr. Pruett\'s side at Willow Creek Farm', say: [['farmer', 'My survey says it\'s my land. I want you to make her move her chicken coop. Today.']], quiz: { les: 14, n: 1 } },
      { at: 'River Pawn', who: 'okoro', goal: 'Hear Ms. Okoro\'s side at River Pawn, where she works', say: [['okoro', 'Well, my survey says it\'s mine. And he cut down my roses.'],
        ['choice', [
          { t: 'Explain it is a civil matter for a court', set: 'fenceCivil', trust: 1, reply: [['okoro', 'So a judge decides, not you. Okay. That\'s fair.'], ['gus', '(over the radio) Pruett says he\'s calling a lawyer. And he says he\'s sorry about the roses.']] },
          { t: 'Tell her the coop has to be moved', set: 'fenceSide', trust: -2, reply: [['okoro', 'You can\'t order me to do that. I\'m filing a complaint.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'smoke', d: 2, title: 'Where There\'s Smoke', giver: 'bell', giverAt: 'Fire Station 3', req: [2, 1], blurb: 'Smoke is pouring off a back deck on Cypress Lane.',
    offer: [['bell', 'Smoke call on Cypress Lane, back deck. Our engine\'s out on another call. Can you get eyes on it while we head over?']],
    steps: [
      { at: 'Cypress Lane', who: 'tenant', goal: 'Check the smoke on Cypress Lane', say: [['tenant', 'It\'s my smoker! I was doing a brisket! It got a little big! The railing caught a little bit!'],
        ['choice', [
          { t: 'Get everyone back and tell the engine exactly what you see', set: 'smokeSize', reply: [['bell', '(over the radio) Copy, small deck fire, contained. We\'ll check it anyway. Good size-up.']] },
          { t: 'Grab the garden hose and try to be a hero', set: 'smokeHero', trust: -1, reply: [['bell', '(over the radio) Don\'t try to be a hero. Let us do our job.']] }]]], quiz: { les: 12, n: 1 } },
      { at: 'Fire Station 3', who: 'bell', goal: 'Debrief with Engineer Bell at Fire Station 3', say: [['bell', 'Smokers need to be ten feet away from anything that can burn. We\'ll leave a flyer. You did fine. You want a station T-shirt? We\'ve got extras.']], quiz: { les: 12, n: 1 } }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'gator', d: 2, title: 'See You Later', giver: 'bobby', req: [2, 1], blurb: 'There\'s an alligator in the daycare\'s retention pond.',
    offer: [['bobby', 'Bad news, there\'s a six-foot gator in the pond behind Little Paddlers. Good news, he\'s a really calm gator. Bad news, he\'s still a gator. Dale the trapper lives out in Cypress Hammock. He doesn\'t have a phone. Of course.']],
    steps: [
      { at: 'Little Paddlers Daycare', who: 'director', goal: 'Check in at Little Paddlers Daycare', say: [['director', 'The kids named him Mr. Chompers. They want to keep him. I do not want to keep him.']], quiz: { les: 11, n: 1 } },
      { at: 'Cypress Hammock', who: 'trapper', goal: 'Find Dale the trapper out in Cypress Hammock', say: [['trapper', 'A six-footer next to a daycare? That\'s a relocation. Don\'t let anybody feed him or poke at him. I\'ll be there in an hour with my truck.'],
        ['choice', [
          { t: 'Radio the daycare: kids inside until Dale arrives', set: 'gatorTrapper', reply: [['director', '(over the radio) Indoor recess. The kids are devastated. They\'re going to miss Mr. Chompers.']] },
          { t: 'Ask if you could just shoo it back to the river', trust: -1, reply: [['trapper', 'With what, a broom? No. Leave it to the people with the license.']] }]]] }
    ], reward: { rp: 130, loot: 'r' } },
  { id: 'hardknock', d: 2, title: 'The Hardest Knock', giver: 'chaplain', giverAt: 'Substation', req: [2, 2], blurb: 'A mother must be told that her son has died.',
    offer: [['chaplain', 'There\'s been a crash on the interstate. A young man from River Bend Apartments. His mother doesn\'t know yet. I\'d like an officer to come with me.'], ['chaplain', 'We do this in person, never over the phone. We confirm it\'s him. We use plain words. And then we stay as long as she needs us.']],
    steps: [
      { at: 'River Bend Apartments', who: 'chaplain', goal: 'Go with Chaplain Ortiz to River Bend Apartments', say: [['narr', 'You knock. She opens the door, sees the two of you standing there, and she already knows.'],
        ['choice', [
          { t: 'Say it plainly and kindly, then stay with her', set: 'notifyKind', trust: 2, reply: [['chaplain', 'You did it the right way. She\'ll remember that somebody was gentle with her on the worst day of her life.']] },
          { t: 'Let the chaplain do the talking', reply: [['chaplain', 'That\'s okay. Next time you\'ll be ready to say it. It matters that it comes from both of us.']] }]], ['chaplain', 'Take care of yourself too, officer. This kind of thing stays with you. Talk to somebody about it. Don\'t carry it by yourself.']], quiz: { les: 10, n: 1 } }
    ], reward: { rp: 150, loot: 'r' } },
  { id: 'signs', d: 2, title: 'Signs of the Times', giver: 'johnson', req: [2, 2], blurb: 'Parents are planning a protest at the Riverside School crosswalk.',
    offer: [['johnson', 'Parents are protesting the new bus schedule tomorrow, right at my crosswalk. The organizer meets with them at the Pelican Diner. They\'re peaceful people. I just need my kids to get across the street.']],
    steps: [
      { at: 'Pelican Diner', who: 'organizer', goal: 'Meet the organizer at the Pelican Diner', say: [['organizer', 'We have a right to be there and to be heard. We\'re not going anywhere.']], quiz: { les: 15, n: 1 } },
      { at: 'Riverside School', npc: 'johnson', who: 'johnson', goal: 'Work it out at the Riverside School crosswalk', say: [['johnson', 'Three minutes until the bell.'], ['organizer', '(walks up with forty parents holding signs) So, officer?'],
        ['choice', [
          { t: 'Help them protest from the sidewalk', set: 'signsMoved', trust: 2, npc: { johnson: 1 }, reply: [['organizer', 'We keep our signs, and the kids cross safely. Deal.']] },
          { t: 'Order the crowd to disperse now', set: 'signsDisperse', trust: -2, reply: [['organizer', 'Disperse? For holding a sign? We\'ll be back tomorrow with twice as many people.']] }]]], quiz: { les: 16, n: 1 } }
    ], reward: { rp: 140, loot: 'u' } },
  { id: 'biscuit', d: 2, title: 'Biscuit', giver: 'junie', giverAt: 'Riverside Marina', req: [2, 3], blurb: 'A lost dog showed up on the marina docks.',
    offer: [['junie', 'This little guy\'s been sitting on dock three all morning. Nice collar, but no tag. I\'m calling him Biscuit until somebody tells me different. Mr. Boone at the Feed & Seed knows every dog in Riverside.']],
    steps: [
      { at: 'Riverside Feed & Seed', who: 'feed', goal: 'Ask Mr. Boone at Riverside Feed & Seed', say: [['feed', 'That\'s Biscuit. No, really, that\'s his name. The Torres family out on Heron Point buys his food here. Their little girl\'s been crying for two days.']], quiz: { les: 11, n: 1 } },
      { at: 'Heron Point', who: 'lucia', goal: 'Bring Biscuit home to Heron Point', say: [['lucia', 'BISCUIT!'],
        ['choice', [
          { t: 'Radio Junie so she can come see the reunion', set: 'biscuitJunie', reply: [['junie', '(over the radio) She hugged him so hard he sneezed? Okay. I\'m not crying.']] },
          { t: 'Hand Biscuit over and get back in service', reply: [['narr', 'Over the top of a very happy dog, Lucia\'s mom mouths "thank you."']] }]]] }
    ], reward: { rp: 110, loot: 'u' } },
  { id: 'marketday', d: 2, title: 'Market Day', giver: 'pham', giverAt: 'River Market', req: [2, 3], blurb: 'Mrs. Lin hasn\'t opened her market stall in three days.',
    offer: [['pham', 'Mrs. Lin sells the best mangoes on the river, and her stall\'s been closed for three days. She lives alone at Bayou Senior Apartments. She mentioned a fall last week. She said it was nothing. She always says it\'s nothing.']],
    steps: [
      { at: 'Bayou Senior Apartments', who: 'castillo', goal: 'Do a well-being check at Bayou Senior Apartments', say: [['castillo', 'Knock, announce yourself, and listen. If nobody answers and we have reason to believe she needs help, we go in.'],
        ['choice', [
          { t: 'Get the building manager\'s key and go in together', set: 'linFound', reply: [['narr', 'She\'s on her kitchen floor. She\'s alert, embarrassed and really thirsty. The paramedics take it from there.'], ['lin', 'I said it was nothing. It was something.'], ['castillo', 'Two more days and this would have ended a lot differently. Good instincts.']] },
          { t: 'Leave a card and come back tomorrow', set: 'linLate', trust: -1, reply: [['castillo', '...Knock again. Louder. Listen. I hear something.']] }]]], quiz: { les: 9, n: 2 } }
    ], reward: { rp: 150, loot: 'r' } },

  // ================= Industrial Park =================
  { id: 'crywolf', d: 3, title: 'Cry Wolf', giver: 'manager', giverAt: 'Palmetto Paper Co.', req: [3, 0], blurb: 'Palmetto Paper\'s alarm goes off every night. Is any of them real?',
    offer: [['manager', 'Our alarm goes off every single night. Your officers are sick of us. It\'s a loose door sensor. Probably. Ninety percent sure. Okay, seventy.']],
    steps: [
      { at: 'Palmetto Paper Co.', who: 'castillo', goal: 'Clear the Palmetto Paper building with Castillo', say: [['castillo', 'We treat every alarm like it\'s real. The night you assume it\'s nothing is the night it isn\'t. Perimeter, entry point, then room by room.'],
        ['choice', [
          { t: 'Search systematically, one area at a time', set: 'wolfSearch', reply: [['narr', 'Loading dock: clear. Offices: clear. Back stairwell: the door\'s propped open with a brick, and there are fresh scuff marks.'], ['castillo', 'Somebody\'s been using that door. Good thing we didn\'t skip it.']] },
          { t: 'Check the door sensor and call it a false alarm', set: 'wolfSkip', trust: -1, reply: [['castillo', 'And what about the stairwell door propped open with a brick? Never assume.']] }]]], quiz: { les: 17, n: 2 } }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'noseknows', d: 3, title: 'Search the Pines', giver: 'dee', req: [3, 1], blurb: 'A teen hitchhiker\'s backpack turned up at the truck stop. Where is he?',
    offer: [['dee', 'I found this backpack by my truck. Phone, wallet, school ID. The kid\'s seventeen. Nobody just leaves their phone. The last trucker who gave him a ride saw him walk off toward the North Spur Pines.']],
    steps: [
      { at: 'Lock-It Storage', who: 'vacant', goal: 'Ask Mr. Ames behind Lock-It Storage', say: [['vacant', 'Skinny kid, no bag, asked me which way the highway was. I told him not to go through the pines. He went through the pines.']], quiz: { les: 18, n: 1 } },
      { at: 'North Spur Pines', who: 'pike', goal: 'Set up the search in the North Spur Pines', say: [['pike', 'That\'s a lot of woods. Where do we even start?'],
        ['choice', [
          { t: 'Set a perimeter, then grid it with units', set: 'yardGrid', reply: [['narr', 'Forty minutes in, a unit finds him asleep under a pine tree. He\'s sunburned and dehydrated, but he\'s okay.'], ['hiker', 'I just... wanted to go see my dad. I got lost.'], ['dee', '(over the radio) His mom\'s on the way. I bought him a burger. Diesel\'s keeping an eye on him.']] },
          { t: 'Split up and cover more ground fast', set: 'yardWander', trust: -1, reply: [['castillo', '(over the radio) Stop. Grid it. If you wander around you\'ll miss half the woods.']] }]]], quiz: { les: 18, n: 1 } }
    ], reward: { rp: 150, loot: 'r' } },
  { id: 'copper', d: 3, title: 'Copper Run', giver: 'shonda', req: [3, 1], blurb: 'Stolen copper wire is showing up at the recycling yards.',
    offer: [['shonda', 'A guy tried to sell me two hundred pounds of brand new copper wire. It still had the utility company tags on it. I require ID and a thumbprint, so I\'ve got his address: Railside Apartments. He says he\'ll be back tomorrow.']],
    steps: [
      { at: 'Railside Apartments', who: 'railneighbor', goal: 'Ask around at Railside Apartments', say: [['railneighbor', 'The man in 1C? His pickup comes back at three in the morning full of wire. Every few nights. I wrote down the dates. I write everything down.']], quiz: { les: 13, n: 1 } },
      { at: 'Green Bin Recycling', npc: 'shonda', who: 'shonda', goal: 'Be at Green Bin Recycling when he comes back', say: [['shonda', 'Here he comes. Same truck.'], ['copperman', 'Two hundred pounds, same as yesterday. Cash.'],
        ['choice', [
          { t: 'Let Shonda hold the load while you identify the seller', set: 'copperHold', npc: { shonda: 1 }, reply: [['shonda', 'Load\'s held. The tags match the substation theft. Your detective is going to love Mrs. Kowal\'s notebook.']] },
          { t: 'Wave him off before it gets messy', trust: -1, reply: [['shonda', '...And there goes two hundred pounds of evidence.']] }]]] }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'retire', d: 3, title: 'Big Mo\'s Last Shift', giver: 'lupe', req: [3, 2], blurb: 'Big Mo is retiring and the crew needs a hand with a surprise.',
    offer: [['lupe', 'Big Mo from Gulf Packaging is retiring Friday after thirty-one years. We\'re throwing him a surprise party here at The Lunch Pail. But he lost his lucky hat, and he says he won\'t leave the plant without it.']],
    steps: [
      { at: 'Gulf Packaging', who: 'crew', goal: 'Search for the hat at Gulf Packaging', say: [['crew', 'His lucky hat? It\'s orange, it\'s ugly, and it\'s sacred. We searched every dock. Nothing. I think he wore it home Tuesday. He lives on Millworker Row.'],
        ['narr', 'You search the break room anyway, one section at a time. Nothing. But there\'s an orange thread caught on the time clock.']], quiz: { les: 18, n: 1 } },
      { at: 'Millworker Row', who: 'packer', goal: 'Visit Big Mo on Millworker Row', say: [['packer', 'My hat? I looked everywhere for it. Even the porch.'], ['narr', 'It\'s on the porch. On the dog. The dog\'s wearing it.'],
        ['choice', [
          { t: 'Get him to The Lunch Pail unawares', set: 'hatParty', npc: { lupe: 1 }, reply: [['packer', 'Lunch? With you? Sure... wait, why\'s my whole crew here? Oh. Oh no. Thirty-one years. Thank you, everybody.']] },
          { t: 'Hand him the hat and wish him well', reply: [['packer', 'My hat! Okay, now I can finally... wait, why\'s Lupe texting me fifty times?']] }]]] }
    ], reward: { rp: 120, loot: 'r' } },
  { id: 'keys', d: 3, title: 'The Gate Keys', giver: 'foreman', giverAt: 'Sawdust Lumber Yard', req: [3, 0], blurb: 'The lumber yard gate keys vanished before a big delivery.',
    offer: [['foreman', 'The gate keys are gone. Forty trucks of lumber are due at noon and the gate\'s locked. The last place I had them was the sod farm, when I dropped off some fence posts.']],
    steps: [
      { at: 'Sandhill Sod Farm', who: 'sod', goal: 'Look for the keys at Sandhill Sod Farm', say: [['sod', 'Keys? Hm. My mower made a funny clanking noise this morning. Let\'s check the bagger.'], ['narr', 'Inside the bagger, wrapped up in grass clippings, there\'s a ring of keys with a tag that says SAWDUST.'],
        ['choice', [
          { t: 'Log them as found property and run them back', set: 'keysLogged', reply: [['foreman', '(over the radio) My keys! Gate\'s open. Forty truck drivers just started honking. I think they\'re cheering.']] },
          { t: 'Ask Ellis to drive them over', reply: [['sod', 'On the tractor? That\'d take an hour. ...Fine, you take them.']] }]]], quiz: { les: 13, n: 1 } }
    ], reward: { rp: 100, loot: 'u' } },
  { id: 'seals', d: 3, title: 'Broken Seal', giver: 'evtech', giverAt: 'County Evidence Storage', req: [3, 3], blurb: 'A broken seal at County Evidence Storage needs explaining.',
    offer: [['evtech', 'One of the evidence bags has a broken seal. The log shows it was opened for a court viewing yesterday, but nobody signed off on resealing it. I need an officer to document this the right way.']],
    steps: [
      { at: 'Substation', inside: true, who: 'castillo', goal: 'Bring it to Castillo at the Substation', say: [['castillo', 'Chain of custody only works if every step is written down. One missing signature is all a lawyer needs to start arguing.'],
        ['choice', [
          { t: 'Document the gap honestly in a supplemental report', set: 'sealHonest', trust: 1, reply: [['castillo', 'That\'s integrity. The gap\'s explained, not hidden. The case will hold up.']] },
          { t: 'Ask the tech to just sign it now', set: 'sealFudge', trust: -2, reply: [['castillo', 'Backdate a signature? No. Never. Write it down exactly the way it happened.']] }]]], quiz: { les: 20, n: 2 } }
    ], reward: { rp: 140, loot: 'r' } },
  { id: 'nighttrain', d: 3, title: 'The Night Train', giver: 'railcop', giverAt: 'Eastline Rail Yard', req: [3, 2], blurb: 'Teenagers have been hopping freight trains at night.',
    offer: [['railcop', 'Railroad police. We\'ve got three kids jumping onto moving freight cars, three nights in a row, on camera. They\'re not criminals yet. They\'re just kids being dumb. They hang out at the Vacant Lot before the 11:15 comes through.']],
    steps: [
      { at: 'Vacant Lot', who: 'teens', goal: 'Find the teens at the Vacant Lot', say: [['teens', 'We weren\'t doing anything! ...Okay, we were doing something.'],
        ['choice', [
          { t: 'Give a safety talk and call their parents', set: 'trainParents', trust: 1, reply: [['teens', 'Our parents? Oh no. Oh no no no. ...Okay. That\'s fair.'], ['railcop', '(over the radio) A hundred tons of train can\'t stop for anybody. Thanks for getting through to them.']] },
          { t: 'Issue each of them a trespass warning', set: 'trainTrespass', reply: [['railcop', '(over the radio) Paperwork\'s done. Next time it\'s an arrest. Hopefully they believe that.']] }]]], quiz: { les: 18, n: 1 } }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'fizz', d: 3, title: 'Sunrise Fizz', giver: 'bottler', giverAt: 'Sunrise Bottling', req: [3, 3], blurb: 'An open door and an alarm at Sunrise Bottling.',
    offer: [['bottler', 'I didn\'t go in. The side door was open when I got here, and the alarm\'s been going off for ten minutes. I called you guys because Lupe says you\'re nice.']],
    steps: [
      { at: 'Sunrise Bottling', inside: true, who: 'castillo', goal: 'Search the bottling plant with Castillo', say: [['castillo', 'Announce yourselves. Search. Cover each other. Go slow.'],
        ['choice', [
          { t: 'Announce loudly, then search room by room', set: 'fizzAnnounce', reply: [['narr', 'Behind the syrup tanks you find a raccoon, very sticky and very guilty. And a door latch that was never fixed.'], ['castillo', 'A raccoon. Logged it. Bad latch, logged it. It was still the right way to do it.']] },
          { t: 'Go in quietly to catch anyone inside', reply: [['castillo', 'Announcing protects you, and it protects anybody inside who\'s supposed to be there. Think about that.']] }]]], quiz: { les: 17, n: 2 } }
    ], reward: { rp: 130, loot: 'u' } },

  // ================= Justice Row =================
  { id: 'walkin', d: 4, title: 'The Walk-In', giver: 'ray', req: [4, 0], blurb: 'A man wants to turn himself in on a missed court date.',
    offer: [['ray', 'Darnell Price called my office. He\'s got a warrant for missing a court date. His car broke down. He\'s scared, and he wants to fix it. He\'s waiting at home at Courtside Lofts. He asked for a nice officer.']],
    steps: [
      { at: 'Courtside Lofts', who: 'walkin', goal: 'Meet Darnell at Courtside Lofts', say: [['walkin', 'I\'ve been scared for a month. I just want to take care of it.'], ['hattie', '(over the radio) Active warrant, failure to appear. And it\'s spelled right, thank goodness.']], quiz: { les: 19, n: 1 } },
      { at: 'Sally Port', npc: 'ramos', who: 'ramos', goal: 'Bring him to Officer Ramos at the Sally Port', say: [['ramos', 'Search, property, paperwork. He\'ll see a judge in the morning.'],
        ['choice', [
          { t: 'Note that he turned himself in', set: 'walkinNoted', trust: 1, reply: [['ramos', 'That\'s going to matter to the judge. Good on you for writing it down.']] },
          { t: 'Keep the report short and factual', reply: [['ramos', 'Fine. But details like that help people. Remember that.']] }]]], quiz: { les: 19, n: 1 } }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'propbag', d: 4, title: 'The Property Bag', giver: 'pd', giverAt: 'Public Defender', req: [4, 1], blurb: 'A defendant says money is missing from his property bag.',
    offer: [['pd', 'My client says he came in with three hundred dollars. The property sheet says two hundred. Somebody\'s wrong, and I\'d like to know who. Sergeant Ibarra keeps the property records at the County Records Annex.']],
    steps: [
      { at: 'County Records Annex', inside: true, who: 'propoff', goal: 'Review the inventory with Sgt. Ibarra', say: [['propoff', 'Two officers counted it in front of him, and the body camera has the count on video. Two hundred, in twenties.'],
        ['choice', [
          { t: 'Pull the video and share it with the defender', set: 'propVideo', trust: 1, reply: [['pd', '(over the radio) Two hundred on video, counted right in front of him. Thank you for being upfront about it.']] },
          { t: 'Tell the defender the sheet is final', reply: [['pd', '(over the radio) That\'s not how this works. I\'ll subpoena the video.']] }]]], quiz: { les: 20, n: 2 } }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'juryduty', d: 4, title: 'Jury Duty', giver: 'juror', giverAt: 'Magnolia Terrace', req: [4, 0], blurb: 'Jurors are getting calls saying they\'ll be arrested unless they pay a fine.',
    offer: [['juror', 'Officer, a man called me saying he was a deputy. He said I missed jury duty and had to pay a fine in gift cards or I\'d be arrested. He knew my name. I almost went to the store.']],
    steps: [
      { at: 'County Administration', who: 'admin', goal: 'Check with the jury office at County Administration', say: [['admin', 'She hasn\'t missed anything. And the court never calls people asking for money, let alone gift cards. That\'s four people this week.']], quiz: { les: 3, n: 1 } },
      { at: 'Courthouse Newsstand', who: 'newsie', goal: 'Spread the word at the Courthouse Newsstand', say: [['newsie', 'Courts don\'t call asking for gift cards. Everybody knows that. Well, everybody should.'],
        ['choice', [
          { t: 'Post a warning at the newsstand and the clerk\'s office', set: 'juryWarn', trust: 2, reply: [['newsie', 'Taped it up right next to the lottery numbers. Best spot in the place.']] },
          { t: 'Just tell Mrs. Whitlock to call the clerk next time', reply: [['juror', '(over the radio) I will. Thank you, dear.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'otherside', d: 4, title: 'The Other Side', giver: 'barnes', req: [4, 2], blurb: 'A defense attorney wants your honest account of an arrest.',
    offer: [['barnes', 'Cadet, I\'m defending a man you helped arrest. I\'m not trying to trick you. Your report says you read him his rights before you questioned him. Was that before or after he volunteered that statement in the car? You can talk to the prosecutor first if you want.']],
    steps: [
      { at: 'State Attorney\'s Office', who: 'asa', goal: 'See the prosecutor at the State Attorney\'s Office', say: [['asa', 'Tell him the truth. Exactly what\'s in your report, and nothing else. That\'s all you have to do here.'],
        ['choice', [
          { t: 'Answer exactly as it happened, all of it', set: 'truthBoth', trust: 2, npc: { barnes: 1 }, reply: [['barnes', '(over the radio) Thank you. That doesn\'t happen as often as it should. It\'s how the system\'s supposed to work.']] },
          { t: 'Keep it general to protect the case', set: 'truthVague', trust: -2, reply: [['asa', 'Being vague hurts us more than the truth ever would. Don\'t ever shade it.']] }]]], quiz: { les: 19, n: 2 } }
    ], reward: { rp: 150, loot: 'r' } },
  { id: 'orderup', d: 4, title: 'Order Up', giver: 'cook', giverAt: 'The Gavel Grill', req: [4, 1], blurb: 'Two lawyers are in a standoff over the last booth at The Gavel Grill.',
    offer: [['cook', 'Two lawyers sat down in the same booth at the same time, and neither one will move. It\'s been twenty minutes. One of them filed a motion. On a napkin.']],
    steps: [
      { at: 'The Gavel Grill', who: 'lawyerA', goal: 'Settle the booth standoff at The Gavel Grill', say: [['lawyerA', 'I\'d like the record to show I was here first.'], ['lawyerB', 'Objection. My sandwich was here first.'],
        ['choice', [
          { t: 'Suggest they share the booth and split a basket of fries', set: 'boothShare', reply: [['lawyerA', '...A joint venture. I can live with that.'], ['lawyerB', 'Fine. Espresso afterward\'s on me.']] },
          { t: 'Cookie decides. It\'s his restaurant.', reply: [['cook', 'Both of you, out. The booth goes to the cadet.']] }]]], quiz: { les: 15, n: 1 } }
    ], reward: { rp: 110, loot: 'u' } },
  { id: 'secondchance', d: 4, title: 'Second Chances', giver: 'po', giverAt: 'Probation & Parole', req: [4, 2], blurb: 'A man on probation missed his check-in.',
    offer: [['po', 'Luis missed his check-in, and that\'s not like him. He\'s been doing everything right. I\'d rather somebody knock on his door than have a warrant go out. He likes to sit on the benches at Gavel Green.']],
    steps: [
      { at: 'Gavel Green', who: 'probationer', goal: 'Find Luis at Gavel Green', say: [['probationer', 'I lost my job Tuesday. I didn\'t want to tell them. I figured they\'d lock me up.'],
        ['choice', [
          { t: 'Walk him to Probation & Parole and help him explain', set: 'luisWalk', trust: 2, reply: [['po', '(over the radio) Thanks for bringing him in. We\'ll reschedule, and I\'ve got a job lead for him.']] },
          { t: 'Tell him to report on his own by tomorrow', reply: [['probationer', '...Okay. Tomorrow. I\'ll go tomorrow.']] }]]], quiz: { les: 9, n: 1 } }
    ], reward: { rp: 140, loot: 'r' } },
  { id: 'exhibitb', d: 4, title: 'Exhibit B', giver: 'exhibita', req: [4, 1], blurb: 'Exhibit A wants you to follow her. She is very insistent.',
    offer: [['exhibita', '(Exhibit A meows at you, walks a few steps toward Old Stone Church, and looks back. Then she does it again.)']],
    steps: [
      { at: 'Old Stone Church', who: 'sexton', goal: 'Follow Exhibit A to Old Stone Church', say: [['sexton', 'Oh, are you here about the kitten? She\'s been under the bell tower stairs for two days. The courthouse cat comes to see her every morning. I think she\'s been bringing her breakfast.'],
        ['choice', [
          { t: 'Take the kitten to the shelter to get checked and adopted', set: 'kittenShelter', reply: [['sexton', 'Shelter first, then a home. Look at that face. Somebody\'s going to adopt her in a day.']] },
          { t: 'Bring her back to Justice Plaza as Exhibit B', set: 'kittenB', reply: [['moore', '(over the radio) Exhibit A just walked in with a kitten following her. I\'m taking that as consent. Exhibit B it is.']] }]]], quiz: { les: 11, n: 1 } }
    ], reward: { rp: 120, loot: 'r' } },
  { id: 'transport', d: 4, title: 'Transport Run', giver: 'deputy', giverAt: 'Substation', req: [4, 3], blurb: 'Ride along on a prisoner transport from the courthouse to the jail.',
    offer: [['deputy', 'I\'ve got a transport from the courthouse to the jail. Want to ride along? You\'ll learn more in ten minutes than you would in ten pages.']],
    steps: [
      { at: 'County Courthouse', inside: true, who: 'deputy', goal: 'Pick up the prisoner at the County Courthouse', say: [['deputy', 'Search the car before and after, every time. And he\'s been calm all day. That doesn\'t mean he\'s going to stay calm.'],
        ['choice', [
          { t: 'Search him again before he gets in the car', set: 'transSearch', reply: [['deputy', 'Good. A search can miss things. A second one only costs us thirty seconds.']] },
          { t: 'Skip it, he was searched this morning', trust: -1, reply: [['deputy', 'This morning isn\'t now. Search him again. Always.']] }]]], quiz: { les: 19, n: 1 } },
      { at: 'County Jail', inside: true, who: 'deputy', goal: 'Hand him over at the County Jail', say: [['deputy', 'Search the back seat. ...See? A pen cap, under the seat. It\'s harmless today. It won\'t always be.']], quiz: { les: 20, n: 1 } }
    ], reward: { rp: 140, loot: 'r' } }
];
export const LORE2 = [
  { id: 'l_transit', title: 'The Depot Clock', when: 'visit:Downtown Transit Center', text: 'In 1951 a city electrician set the depot clock five minutes slow so the last train of the night would never leave without the late shift. The trains are gone. Nobody has ever fixed the clock, and nobody ever will.' },
  { id: 'l_library', title: 'The Reading Room Mural', when: 'visit:Central Library', text: 'The mural over the library reading room shows the 1911 department: one marshal, two deputies and Judge the horse, painted by a local schoolteacher in 1938. The horse is noticeably better drawn than the deputies.' },
  { id: 'l_diner', title: 'Stool Six', when: 'visit:Night Owl Diner', text: 'The Night Owl has never closed, not even during the 2004 hurricane, when Dot kept the coffee going on a camp stove for the night shift. There is a brass plate on the counter that reads "Reserved for whoever needs it."' },
  { id: 'l_radio', title: 'The Old Repeater', when: 'visit:Radio Tower', text: 'The radio tower was built in 1966 and was, for one year, the tallest thing in the county. Pigeons have nested on its third platform for as long as anyone can remember. Sgt. Pruitt claims to know every one of them by name.' },
  { id: 'l_earl', title: 'Car Number 14', when: 'visit:Big Earl\'s Auto', text: 'A rusted 1978 patrol car sits behind Big Earl\'s shop. Earl\'s father kept it running for nine years past retirement. Earl says it is not for sale and not for parts. It is for remembering.' },
  { id: 'l_gym', title: 'Iron Will', when: 'visit:Iron Will Boxing Gym', text: 'Coach Reyes opened the gym in a closed laundromat in 1998 with two heavy bags and a hand-painted sign. The rule on the wall: "Gloves on in here. Hands open out there."' },
  { id: 'l_motel', title: 'The Eastgate Sign', when: 'visit:Eastgate Motel', text: 'The motel\'s neon sign has had a dark "G" since 1989, so for most of the city\'s life it has read "EAST ATE MOTEL." The owner says fixing it would confuse the regulars.' },
  { id: 'l_stadium', title: 'The Gators\' Long Season', when: 'visit:River Stadium', text: 'The Meridian Gators have played at River Stadium since 1952. They won the regional title once, in 1977, on a muddy field goal that bounced off both posts. The ball is in a glass case in the lobby.' },
  { id: 'l_marina', title: 'Hal\'s Logbook', when: 'visit:Riverside Marina', text: 'Captain Hal has written the river\'s height in the same logbook every morning since 1983. During the 2004 flood, the county emergency office borrowed it to plan the evacuation. He got it back with a thank-you note he keeps taped inside the cover.' },
  { id: 'l_church', title: 'The Open Door', when: 'visit:Community Church', text: 'The church on the river has left its side door unlocked every night for a hundred years, on the idea that anyone who needs a quiet place should have one. Father Miguel keeps a coffee pot and a phone charger by the door.' },
  { id: 'l_railyard', title: 'The Last Orange Train', when: 'visit:Eastline Rail Yard', text: 'The final orange shipment left Eastline in 1974, the year the highway opened. Old railroad men say that on humid nights the yard still smells faintly of citrus. Railroad police officers will tell you that is the sugar plant.' },
  { id: 'l_scrap', title: 'Rusty\'s Rules', when: 'visit:Rusty\'s Scrap & Salvage', text: 'Rusty\'s yard has bought scrap with ID and a written record since 1991, long before the law required it. "If it\'s yours, I\'ll buy it," Rusty says. "If it\'s not, I\'ll call somebody."' },
  { id: 'l_truckstop', title: 'The Big Rig Board', when: 'visit:Big Rig Truck Stop', text: 'Next to the coffee machine at the truck stop hangs a cork board of missing-person flyers. Truckers check it every time they come through. Seven people on that board have been found because someone recognized a face at a fuel pump.' },
  { id: 'l_courthouse', title: 'The 1932 Courthouse', when: 'visit:County Courthouse', text: 'The courthouse was built during the Depression by local workers paid in cash and oranges. The scales of justice over the door are slightly uneven. The architect insisted it was deliberate: justice, he said, is always a little bit of work.' },
  { id: 'l_jail', title: 'Booking Desk Number Two', when: 'visit:County Jail', text: 'The old booking desk, carved oak from 1932, now sits in the jail\'s lobby. Officers sign a ledger there on their first day. Officer Ramos signed it in 2001 and has not missed a shift since, which he says is not a brag but a warning.' },
  { id: 'l_memorial', title: 'The Memorial Wall', when: 'visit:Veterans Memorial Park', text: 'Beside the veterans\' memorial is a smaller wall with the names of Port Meridian officers who died in the line of duty. Every graduating class leaves a single flower there. Sgt. Castillo always arrives first.' },
  { id: 'l_pigeons', title: 'The Sunday Pigeon Club', when: 'side:pigeons', text: 'Sgt. Pruitt\'s Sunday Pigeon Club meets at Founders Park at eight sharp. Its membership is one retired sergeant, one nine-year-old and, according to the club charter, "all pigeons of good character."' },
  { id: 'l_book', title: 'Pigeons of the American South', when: 'side:overdue', text: 'The library\'s copy now has a note inside the cover, in Reverend Whitaker\'s hand: "Returned 39 years late by a man who preached about patience and practiced it far too long. Be like him, but faster."' },
  { id: 'l_gary', title: 'Gary the Ferret', when: 'side:sockbandit', text: 'Spin City Laundromat now keeps a jar of single socks by the register labeled "Gary\'s Collection, Returned." Gary has visited twice since, supervised, in a tiny harness.' },
  { id: 'l_chompers', title: 'Mr. Chompers', when: 'side:gator', text: 'Florida\'s nuisance alligator program relocates gators that wander too close to people. Mr. Chompers was moved to a quiet stretch of the river. The children of Little Paddlers still send him drawings, which Bait Shop Bobby promises to deliver.' },
  { id: 'l_hat', title: 'The Orange Hat', when: 'side:retire', text: 'Big Mo\'s lucky hat now hangs above the time clock at Gulf Packaging. New hires are told to tap it on their first day. No one remembers deciding this. Everyone does it.' },
  { id: 'l_exhibitb', title: 'Exhibit B', when: 'side:exhibitb', text: 'Justice Row has two cats now, or it has one cat and a kitten that lives at the shelter and visits. Either way, the courthouse bulletin board lists them both under "Staff."' },
  { id: 'l_otherside', title: 'Both Sides of the Table', when: 'side:otherside', text: 'Attorney Barnes keeps a framed quote on his wall from the first judge he ever argued before: "An honest witness is the best friend the truth ever had, whichever side calls them."' },
  { id: 'l_secondchance', title: 'The Job Board at Probation', when: 'side:secondchance', text: 'Officer Grant keeps a board of local employers willing to hire people on probation. Big Earl\'s Auto, The Lunch Pail and Rusty\'s yard have all been on it for years.' },
  { id: 'l_deadair', title: 'Kevin\'s Graph', when: 'side:deadair', text: 'The repeater technicians framed Kevin\'s forty-page signal graph and hung it in their shop. Kevin has been told about this and is, by his own account, "fine about it, totally fine."' },
  { id: 'l_nightowl', title: 'Cherry Pie', when: 'side:nightowl', text: 'Mr. Abernathy is back on the 11:40 bus, third row, left side, and back on stool six at the Night Owl. He still says the pie is too sweet. He still orders a second slice. Dot has started writing "too sweet" on his receipt.' },
  { id: 'l_kickflip', title: 'Skate Hours', when: 'side:kickflip', text: 'A hand-painted sign on the back fence of Eastside Middle School now reads "SKATE 4 TO 9. SIGN IN WITH DEZ." Under it, in smaller letters: "Lemon bars Tuesdays, courtesy of the Baptist ladies."' },
  { id: 'l_biscuit', title: 'Biscuit', when: 'side:biscuit', text: 'Biscuit now rides along on the marina boat with Junie every Saturday, in a tiny life jacket. Captain Hal pretends to disapprove. Captain Hal bought the life jacket.' },
  { id: 'l_train', title: 'The North Spur', when: 'side:nighttrain', text: 'Freight cars can weigh more than a hundred tons and cannot stop quickly. Railroad police across the country run safety talks for teenagers every year, because the stories always start the same way: "We just thought it would be fun."' }
];

// People who disagree for good reasons (Action plan, Step F): a man who complains about the police to anyone who'll
// listen, and turns out to be right about half of it
SIDE_CAST.odell = { name: 'Frank Odell', icon: '🪵', role: 'Owns Manatee Lumber' };
SIDE2.push({ id: 'odell', d: 1, title: 'The Man Who Complains', giver: 'odell', req: [1, 1], blurb: 'Frank Odell at Manatee Lumber says the police never come. He says it to everyone.',
  offer: [['odell', 'Oh, now one of you stops. Two break-ins this year, two reports, and nobody ever called me back. You want to hear it, or you want to get back to your coffee?']],
  steps: [
    { at: 'Manatee Lumber', npc: 'odell', who: 'odell', goal: 'Hear Frank Odell out at Manatee Lumber', say: [
      ['odell', 'March, they cut the fence and took the copper. July, they took the tools off two trucks. Both times an officer wrote it down and handed me a card with a number on it.'],
      ['odell', 'And my alarm? I call, and it\'s forty minutes before anybody shows. Forty. I could build you a shed in forty minutes.'],
      ['choice', [{ t: 'Take notes and ask for both case numbers', set: 'odellHeard', npc: { odell: 1 }, reply: [['odell', '...Huh. Nobody\'s asked for the numbers before. Here. Both of them, on the back of the same card.']] },
        { t: 'Tell him patrol is stretched thin this year', reply: [['odell', 'That\'s what the last one said. Thin. I\'m the one getting robbed, and somehow I\'m the one getting lectured.']] },
        { t: 'Suggest he file a written complaint about it', reply: [['odell', 'I filed one. You\'re looking at the guy who filed one. Here, take the case numbers anyway. Somebody should.']] }]]], quiz: { n: 1 } },
    { at: 'Substation', inside: true, who: 'castillo', goal: 'Look up his reports at the Eastside Substation', say: [
      ['castillo', 'Pull them up. ...He\'s right. Both burglaries closed out with no follow-up contact. Nobody ever called him back.'],
      ['castillo', 'The alarm is less simple. His system threw six false alarms last spring, a bad door sensor. After that, his alarms go out at a lower priority.'],
      ['castillo', 'So he\'s right about one thing, and wrong about why the other one happens. That\'s most complaints, cadet. Listen for the part that\'s true.']],
      after: [['castillo', '(over the radio) Tell him both. The part where we dropped it, and the part that\'s on his sensor.']], set: 'odellChecked' },
    { at: 'Manatee Lumber', npc: 'odell', who: 'odell', goal: 'Bring Frank Odell what you found', say: [
      ['odell', 'Well? Go ahead. Tell me I\'m imagining it.'],
      ['choice', [{ t: 'Tell him he was right, and about the sensor', set: 'odellBoth', npc: { odell: 2 }, trust: 1, reply: [['odell', '...Nobody followed up. I knew it. And the sensor? Six times? I thought those were raccoons.'], ['odell', 'Fine. I\'ll get the sensor fixed. And you call me when there\'s news on the cases. You, personally.'], ['narr', 'He writes your name on the card, under the case numbers, and underlines it twice.']] },
        { t: 'Tell him only that the reports were dropped', set: 'odellHalf', npc: { odell: 1 }, reply: [['odell', 'I knew it. I knew it! Wait till the paper hears about this.'], ['narr', 'Two weeks later his alarm goes off at 3 a.m. for the seventh time. It\'s the sensor again.']] },
        { t: 'Tell him only about the false alarms', set: 'odellSensor', reply: [['odell', 'So it\'s my fault. Of course it is. And the two break-ins nobody called me back about?'], ['narr', 'He doesn\'t wait for an answer.']] }]]] }] });
