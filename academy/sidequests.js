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
  juror: { name: 'Mrs. Whitfield', icon: '🧾', role: 'Magnolia Terrace' },
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
    offer: [['pruitt', 'Cadet. The pigeons at Grind & Badge are organized. Somebody is training them. I would know. I have been training pigeons for forty years.']],
    steps: [
      { at: 'Grind & Badge Coffee', who: 'barista', goal: 'Ask Noor at Grind & Badge about the pastry heists', say: [['barista', 'Every day at three. Swoop, grab, gone. Only the croissants. They have taste, I\'ll give them that.'], ['barista', 'It started when the elementary school let out early on Wednesdays. A little kid sits on our bench with a bag of bread.']], quiz: { les: 0, n: 1 } },
      { at: 'Founders Elementary', who: 'kid', goal: 'Find the kid at Founders Elementary', say: [['kid', 'I\'m not training them! I\'m just… teaching them. Teaching is different.'],
        ['choice', [
          { t: 'Ask him to use birdseed in the park', set: 'pigeonSeed', trust: 1, reply: [['kid', 'Birdseed? Is that better for them? Okay. Okay, I\'ll do that.']] },
          { t: 'Tell him the café feeding has to stop', set: 'pigeonStop', reply: [['kid', '…Fine. Sorry, pigeons.']] },
          { t: 'Introduce him to Sgt. Pruitt instead', set: 'pigeonPruitt', npc: { pruitt: 1 }, reply: [['pruitt', '(over the radio) A young pigeon man! Bring him to Founders Park on Sunday. I have forty years of things to tell him.']] }]]] }
    ], reward: { rp: 110, loot: 'u' } },
  { id: 'deadair', d: 0, title: 'Dead Air', giver: 'kevin', req: [0, 1], blurb: 'Kevin from IT found a radio dead spot downtown.',
    offer: [['kevin', 'So, uh, your radios. Near Bayfront Tower they just… stop. I tested with my scanner. It\'s a hobby. Please don\'t arrest me.'], ['kevin', 'The county radio tech is up at the Radio Tower today. She\'d want to see my graph. Everybody wants to see my graph.']],
    steps: [
      { at: 'Radio Tower', who: 'rtech', goal: 'Show Kevin\'s graph to the radio tech at the Radio Tower', say: [['rtech', 'Huh. Signal\'s fine, fine, fine, then nothing for a whole block. That\'s the downtown repeater. It\'s been cranky since the hurricane.'], ['rtech', 'I can fix it, but the work order has to come from the department. Somebody has to call it what it is.']], quiz: { les: 2, n: 1 } },
      { at: 'Dispatch Center', who: 'velvet', goal: 'Bring it to Velvet at the Dispatch Center', say: [['velvet', 'A dead spot downtown? Officers walk that block every night.'],
        ['choice', [
          { t: 'Write it up as an officer safety hazard through the chain of command', set: 'deadairReport', trust: 1, reply: [['velvet', 'Officer safety moves it to the top of the list. I\'ll walk it to the lieutenant myself.'], ['rtech', '(over the radio) Got the work order. Repeater\'s back up by tonight.']] },
          { t: 'Just tell units to avoid that block for now', set: 'deadairAvoid', reply: [['velvet', 'That\'s a bandage, not a fix. I\'ll write it up anyway, sugar.']] }]]] }
    ], reward: { rp: 130, loot: 'r' } },
  { id: 'nightowl', d: 0, title: 'The Empty Seat', giver: 'hank', giverAt: 'City Garage', req: [0, 2], blurb: 'The night bus driver is worried about a rider who stopped riding.',
    offer: [['hank', 'Officer. I drive the night bus. Mr. Abernathy rides it every night at 11:40, Harbor View to the diner and back. Black coffee, cherry pie. A week now, no Abernathy.'], ['hank', 'He looked gray the last time. Real gray. Would you check on him?']],
    steps: [
      { at: 'Harbor View Apartments', who: 'super', goal: 'Check on Mr. Abernathy at Harbor View Apartments', say: [['super', 'Abernathy, 4B? His mail\'s piling up. But I saw him get in a cab a week ago, holding his chest. Said he was going to urgent care.']], quiz: { les: 9, n: 1 } },
      { at: 'Downtown Urgent Care', who: 'nurse', goal: 'Ask about him at Downtown Urgent Care', say: [['nurse', 'He\'s here. He\'s okay, but he\'s been admitted for observation. No visitors in a week. He asked if anyone had noticed.'],
        ['choice', [
          { t: 'Bring him cherry pie from the Night Owl', set: 'pieDelivered', npc: { dot: 2 }, reply: [['nurse', 'Pie is against three hospital policies. I\'ll allow it. He\'s going to cry.']] },
          { t: 'Radio Hank that his rider is okay', reply: [['hank', '(over the radio) Oh, thank goodness. I\'ll save his seat. Third row, left side.']] }]]] }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'spokes', d: 0, title: 'Spokes and Suspects', giver: 'marcus', req: [0, 1], blurb: 'Bikes are vanishing from the racks at Bayfront Tower.',
    offer: [['marcus', 'Three bikes this week from the Bayfront racks. Mine\'s next, I can feel it. My bike is my whole job, officer.'], ['marcus', 'Wren at Spokes & Spares keeps a list of every serial number she\'s ever sold. Start there.']],
    steps: [
      { at: 'Spokes & Spares', who: 'wren', goal: 'Get the serial numbers from Wren at Spokes & Spares', say: [['wren', 'All three are mine. Here are the serials. And look: one of them is listed online already. "Barely used." It was barely used. Because it was STOLEN.']], quiz: { les: 3, n: 1 } },
      { at: 'Downtown Pawn & Loan', who: 'pawnclerk', goal: 'Check Downtown Pawn & Loan', say: [['pawnclerk', 'A kid in a hoodie tried to pawn a bike with one of those serials yesterday. We run every serial, so I sent him away. He said he lives on Palmetto Row and he\'d "sell it himself."']], quiz: { les: 3, n: 1 } },
      { at: 'Palmetto Row', who: 'pike', goal: 'Meet Pike at Palmetto Row', say: [['pike', 'Hoodie guy, three bikes in the carport, looks nervous. Let\'s grab him.'],
        ['choice', [
          { t: 'Plan it: you make contact, Pike covers', set: 'spokesPlan', reply: [['pike', 'Contact and cover. Fine. …He\'s handing them over. Says he "found them." Sure, buddy.'], ['marcus', '(over the radio) MY BIKE\'S FRIENDS ARE SAFE.']] },
          { t: 'Let Pike move in while he\'s surprised', set: 'spokesRush', trust: -1, reply: [['pike', 'He\'s running! He dropped the bikes! …I still count that as a win.']] }]]] }
    ], reward: { rp: 150, loot: 'r' } },
  { id: 'overdue', d: 0, title: 'Overdue Since 1987', giver: 'shopowner', giverAt: 'Dog-Eared Books', req: [0, 3], blurb: 'A library book due in 1987 turned up in a used bookstore\'s donation bin.',
    offer: [['shopowner', 'Officer! Someone left this in my donation bin. "Pigeons of the American South." Central Library copy. Due back March 4th, 1987.'], ['shopowner', 'Inside the cover, a church bulletin from First Light Chapel. From 1987. I have to know.']],
    steps: [
      { at: 'First Light Chapel', who: 'hale', goal: 'Ask about the bulletin at First Light Chapel', say: [['hale', 'Oh. Oh my. That\'s my handwriting in the margin.'], ['hale', 'I borrowed it for a sermon about patience. Then I was embarrassed. Then it had been ten years. Then thirty-nine. I put it in the bin hoping nobody would notice.'],
        ['choice', [
          { t: 'Suggest he return it to the library himself', set: 'haleReturns', trust: 1, reply: [['hale', 'In person. You\'re right. That\'s what I would tell anyone else.']] },
          { t: 'Offer to return it for him', reply: [['hale', 'You\'d do that? …No. No, I should do it. But thank you.']] }]]], quiz: { les: 13, n: 1 } },
      { at: 'Dog-Eared Books', who: 'shopowner', goal: 'Tell Mrs. Ellery what you found', say: [['shopowner', 'A reverend! I\'ll be telling this story for years.'], ['okafor', '(over the radio) Thirty-nine years of guilt is punishment enough. No fine. Tell him the reading club meets Thursdays.', { if: 'haleReturns' }]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'corner', d: 0, title: 'Corner Wars', giver: 'gio', giverAt: 'Slice of Justice', req: [0, 2], blurb: 'Gio and Mr. Delgado are fighting over the same corner.',
    offer: [['gio', 'Officer. I put a sandwich board on the plaza corner. Delgado says it\'s HIS corner. Twenty-two years, he says. It\'s a public sidewalk. It\'s for everyone.']],
    steps: [
      { at: 'Founders Plaza', npc: 'delgado', who: 'delgado', goal: 'Mediate at Founders Plaza', say: [['delgado', 'Gio sent you? Of course he did. So? Who wins?'], ['gio', '(walking up) Yeah, officer. Who wins?'],
        ['choice', [
          { t: 'Split the corner and check both vending permits', set: 'cornerSplit', trust: 1, npc: { delgado: 1 }, reply: [['delgado', 'Half a corner… with a combo deal? Hot dog and a slice?'], ['gio', 'The Founders Special. …I hate that I love it.']] },
          { t: 'Enforce the permit map exactly as written', set: 'cornerPermit', reply: [['gio', 'Fine. The board moves three feet. Three very bitter feet.']] }]]], quiz: { les: 8, n: 1 } }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'shoptalk', d: 0, title: 'Shop Talk', giver: 'barber', giverAt: 'Sharp Edges Barbershop', req: [0, 3], blurb: 'A barbershop rumor about a scam targeting seniors.',
    offer: [['barber', 'Three of my older customers got calls about "computer viruses." Tech support, remote access, gift cards. Mrs. Diaz almost bought four hundred dollars of gift cards.'], ['barber', 'The teller at First Coast Bank stopped one of them. Talk to him.']],
    steps: [
      { at: 'First Coast Bank', who: 'teller', goal: 'Talk to the teller at First Coast Bank', say: [['teller', 'He was withdrawing two thousand in cash and kept checking his phone. When I asked, he said "tech support told me not to tell you." That\'s the tell, every time.']], quiz: { les: 3, n: 1 } },
      { at: 'Sharp Edges Barbershop', who: 'barber', goal: 'Plan something with Otis at Sharp Edges', say: [['barber', 'So what do we do? They trust me. They don\'t trust flyers.'],
        ['choice', [
          { t: 'Hold a scam talk in the shop Saturday', set: 'scamClass', trust: 2, npc: { kevin: 1 }, reply: [['barber', 'In the shop? With free trims? They\'ll come for the trims and stay for the talk.'], ['kevin', '(over the radio) I made slides. Forty slides. Okay, ten.']] },
          { t: 'Leave scam flyers on every counter', set: 'scamFlyers', reply: [['barber', 'Flyers are good. People do read them. Sometimes.']] }]]] }
    ], reward: { rp: 130, loot: 'r' } },
  { id: 'fakepage', d: 0, title: 'Not Our Page', giver: 'diaz', giverAt: 'Bayfront Dog Run', req: [0, 4], blurb: 'A fake police page is asking for donations by gift card.',
    offer: [['diaz', 'Officer! My friends keep sharing a "Port Meridian Police Charity" page. It wants donations in gift cards. It has your badge on it. It\'s not you, is it? Pepito, sit.']],
    steps: [
      { at: 'Patrol HQ', inside: true, who: 'pio', goal: 'Take it to the public information officer at Patrol HQ', say: [['pio', 'Not ours. Screenshots, account name, payment details, timestamps. Before it gets deleted.']], quiz: { les: 3, n: 1 } },
      { at: 'Bayfront Dog Run', who: 'diaz', goal: 'Get back to Mrs. Diaz at the Dog Run', say: [['diaz', 'So what do I tell my friends?'],
        ['choice', [
          { t: 'Have the PIO warn people on the real page', set: 'fakeWarned', trust: 2, reply: [['pio', '(over the radio) Posted. Real page, real warning. The fake one\'s down by tonight.'], ['diaz', 'I\'m telling everyone. Pepito is telling everyone.']] },
          { t: 'Tell her friends to ignore the fake page', reply: [['diaz', 'Ignore it? Mrs. Rosen already sent fifty dollars!']] }]]] }
    ], reward: { rp: 140, loot: 'r' } },

  // ================= Eastside =================
  { id: 'gloves', d: 1, title: 'Gloves Off', giver: 'reyes', req: [1, 0], blurb: 'A sparring grudge at Iron Will could spill out into the street.',
    offer: [['reyes', 'Two of my fighters got into it after sparring. Tre went home mad and said he\'s "settling it." I don\'t like that word. His sister Mia lives at Eastgate Apartments.']],
    steps: [
      { at: 'Eastgate Apartments', who: 'mia', goal: 'Talk to Mia at Eastgate Apartments', say: [['mia', 'He went running. When he\'s mad he runs the trails in Eastgate Pines until he\'s too tired to be mad. Please don\'t make it worse.']], quiz: { les: 4, n: 1 } },
      { at: 'Eastgate Pines', who: 'boxer', goal: 'Find Tre on the trail in Eastgate Pines', say: [['boxer', 'He hit me after the bell! Everybody saw it!'],
        ['choice', [
          { t: 'Keep your distance and let him vent', set: 'glovesCalm', trust: 1, npc: { reyes: 1 }, reply: [['boxer', '…Yeah. Okay. I\'m just tired, man. I train every day.'], ['reyes', '(over the radio) Saturday. Three rounds, headgear, me as referee, handshake after. That\'s how my gym settles things.']] },
          { t: 'Tell him firmly to calm down now', set: 'glovesOrder', reply: [['boxer', 'Don\'t tell me to calm down! …Fine. Fine.']] }]]], quiz: { les: 5, n: 1 } }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'sockbandit', d: 1, title: 'The Sock Bandit', giver: 'kim', req: [1, 0], blurb: 'Single socks keep vanishing from the dryers at Spin City.',
    offer: [['kim', 'Officer. Socks. One sock from every pair. Every day. My customers think I am the thief. I do not want socks. I have enough socks.'], ['kim', 'Small paw prints behind dryer four. They go toward the dog park.']],
    steps: [
      { at: 'Eastside Dog Park', who: 'walker', goal: 'Ask the dog walker at Eastside Dog Park', say: [['walker', 'A ferret? In a sweater? Every morning, heading out the east road toward Old Grove Farm with a sock in its mouth. My dogs lose their minds.']], quiz: { les: 11, n: 1 } },
      { at: 'Old Grove Farm', who: 'ferretowner', goal: 'Follow the trail to Old Grove Farm', say: [['ferretowner', 'Gary! His name is Gary. He\'s been gone two weeks. He… has a nest of socks in the barn? Oh, Gary.'],
        ['choice', [
          { t: 'Return the socks to Mr. Kim and suggest a ferret-proof cage', set: 'garyHome', npc: { kim: 1 }, reply: [['kim', '(over the radio) One hundred and twelve socks. Lost and found. A happy ending.']] },
          { t: 'Call animal control to check on Gary', reply: [['ferretowner', 'I\'ll meet them here. Thank you for finding him.']] }]]] }
    ], reward: { rp: 110, loot: 'u' } },
  { id: 'forgery', d: 1, title: 'Prescription for Trouble', giver: 'rosa', req: [1, 2], blurb: 'Someone is passing forged prescriptions on Eastside.',
    offer: [['rosa', 'Mijo, Dr. Whitfield at the pharmacy is worried. Somebody keeps bringing in fake prescriptions. She asked me to find a police officer I trust.']],
    steps: [
      { at: 'Eastside Pharmacy', who: 'pharmacist', goal: 'Talk to Dr. Whitfield at Eastside Pharmacy', say: [['pharmacist', 'Same doctor\'s name, wrong license number, three times this month. He comes back tonight to pick up.']], quiz: { les: 4, n: 1 } },
      { at: 'Fuel Depot', who: 'castillo', goal: 'Plan it with Sgt. Castillo at the Fuel Depot', say: [['castillo', 'Filling up. Talk to me. Pharmacy, staff, customers inside. Who\'s contact, who\'s cover, where does he go if he runs?'],
        ['choice', [
          { t: 'Contact him outside, after he leaves', set: 'rxPlan', npc: { rosa: 1 }, reply: [['castillo', 'Away from the staff and the public. Good. That\'s how it\'s done.'], ['rosa', '(over the radio) Dr. Whitfield says you were so calm. She sent flan. I ate half. Sorry.']] },
          { t: 'Contact him at the pharmacy counter', set: 'rxCounter', reply: [['castillo', 'Hm. Lot of people in a small space. Be ready.']] }]]], quiz: { les: 6, n: 1 } }
    ], reward: { rp: 140, loot: 'r' } },
  { id: 'kickflip', d: 1, title: 'Kickflip Court', giver: 'dez', req: [1, 1], blurb: 'The skaters need somewhere to skate that isn\'t under somebody\'s bedroom window.',
    offer: [['dez', 'Officer. The church neighbors want us gone from their lot. Where are we supposed to skate? The street? That\'s worse, right?']],
    steps: [
      { at: 'Eastside Baptist Church', who: 'pastorj', goal: 'Hear Pastor James out at Eastside Baptist', say: [['pastorj', 'I like those kids. But it\'s eleven at night, clack, clack, clack, and Mrs. Albury is eighty-one. She needs her sleep.']], quiz: { les: 8, n: 1 } },
      { at: 'Eastside Middle School', who: 'principal', goal: 'Ask about the lot at Eastside Middle School', say: [['principal', 'Our back lot is empty every evening. If the kids follow the rules, I\'d rather have them here than in the street.'],
        ['choice', [
          { t: 'Propose skate hours, 4 to 9 p.m., and a sign-in sheet', set: 'skateHours', trust: 2, npc: { dez: 1 }, reply: [['principal', 'Done. And I\'m making Dez the monitor. Don\'t tell him it\'s a job.'], ['dez', '(over the radio) A WHOLE LOT? Bro.']] },
          { t: 'Tell them to take it to the city council', reply: [['principal', 'Council meets at two in the afternoon. They\'re in school. Think about it.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'bubbles', d: 1, title: 'Suds and Scams', giver: 'washkid', giverAt: 'Bubbles Car Wash', req: [1, 2], blurb: 'Kids at a car wash were told they were raising money for a police league that doesn\'t exist.',
    offer: [['washkid', 'Officer? A guy paid us ten bucks each to wash cars and give him the money. He said it was for the "Police Youth League." Is that… not a real thing?']],
    steps: [
      { at: 'Gas & Go', who: 'clerk', goal: 'Ask the clerk at Gas & Go about the man', say: [['clerk', 'White van, parks here every morning, buys two energy drinks. Talked about "his car wash kids." Gross. He had a fresh fade, said Jules does it.']], quiz: { les: 5, n: 1 } },
      { at: 'Fade Factory', who: 'jules', goal: 'Ask Jules at Fade Factory', say: [['jules', 'Him? He books online. I\'ve got his name and number right here. I don\'t like people who use kids.'],
        ['choice', [
          { t: 'Take statements, with the kids\' parents', set: 'sudsStatements', trust: 1, reply: [['castillo', '(over the radio) Statements, a name and a number. That\'s a case. Good work.']] },
          { t: 'Shut the car wash fundraiser down', reply: [['castillo', '(over the radio) The kids go home. He finds new kids. Think bigger next time.']] }]]] }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'wallwords', d: 1, title: 'Words on the Wall', giver: 'tran', giverAt: 'Corner Cell Repair', req: [1, 3], blurb: 'Threatening graffiti targets a shop owner. Again.',
    offer: [['tran', 'Third time. Not just graffiti. My name, and a threat. An ex-employee keeps posting about me online too. My daughter works the counter. I\'m worried.']],
    steps: [
      { at: 'Eastside Plaza', who: 'mallsec', goal: 'Check the cameras with plaza security', say: [['mallsec', 'Our camera covers the walkway behind his shop. Same hoodie, three nights. And the same guy walks through the plaza every day at noon, staring at the store.']], quiz: { les: 7, n: 1 } },
      { at: 'Substation', inside: true, who: 'castillo', goal: 'Talk threat assessment with Castillo at the Substation', say: [['castillo', 'This isn\'t one incident. It\'s a pattern of behavior. That\'s exactly what threat assessment is for.'],
        ['choice', [
          { t: 'Refer the pattern for threat assessment', set: 'btamReferral', trust: 1, reply: [['castillo', 'Right call. The team looks at the whole picture, not just the paint.']] },
          { t: 'Write it up as vandalism, case closed', set: 'btamVandal', reply: [['castillo', 'And the posts? The staring? A report alone misses the point.']] }]]], quiz: { les: 7, n: 1 } }
    ], reward: { rp: 150, loot: 'r' } },
  { id: 'ring', d: 1, title: 'The Ring Thing', giver: 'groom', giverAt: 'Glam Nails', req: [1, 1], blurb: 'An engagement ring went missing on the big day.',
    offer: [['groom', 'Officer. I took my grandmother\'s ring off for a manicure, set it on the tray, stepped out for air, and it\'s gone. I propose at seven. It\'s four.']],
    steps: [
      { at: 'Eastside Jewelers', who: 'jeweler', goal: 'Check with the jeweler at Eastside Jewelers', say: [['jeweler', 'A teenager came in an hour ago asking what a ring like that is worth. I didn\'t buy it. He seemed scared, not crooked. He went toward the Sunrise Café.']], quiz: { les: 13, n: 1 } },
      { at: 'Sunrise Café', who: 'finder', goal: 'Find the teenager at the Sunrise Café', say: [['finder', 'I found it on the sidewalk! I swear! I didn\'t know whose it was and I panicked.'],
        ['choice', [
          { t: 'Log it as found property and return it', set: 'ringLogged', trust: 1, reply: [['groom', '(over the radio) You found it?! And the kid who found it? He\'s invited to the wedding. That\'s not a joke.']] },
          { t: 'Warn him about keeping found property', reply: [['finder', 'I was going to. I just… didn\'t know how.']] }]]] }
    ], reward: { rp: 120, loot: 'r' } },
  { id: 'donutstake', d: 1, title: 'The Donut Stop Stakeout', giver: 'tony', giverAt: 'Tony\'s Pizza', req: [1, 3], blurb: 'Someone keeps trying Tony\'s back door at night.',
    offer: [['tony', 'Pry marks on my back door, two nights running. Your buddy Pike says he\'s "on it." He\'s been at The Donut Stop for three hours.']],
    steps: [
      { at: 'The Donut Stop', who: 'pike', goal: 'Find Pike at The Donut Stop', say: [['pike', 'Before you say anything: the donuts are cover. Also they are very good. The guy comes around midnight. He walks in from the motel side.']], quiz: { les: 17, n: 1 } },
      { at: 'Eastgate Motel', who: 'nightclerk', goal: 'Ask the night clerk at the Eastgate Motel', say: [['nightclerk', 'Room 9. Pays cash. Carries a pry bar in his backpack like it\'s a water bottle. He\'s out right now.'],
        ['choice', [
          { t: 'Pass on the description, suggest lights', set: 'tonyLights', trust: 1, reply: [['castillo', '(over the radio) A unit picked him up two blocks over with the pry bar. Same tool marks as three other doors. Good work.']] },
          { t: 'Sit on the alley with Pike all night', set: 'tonySit', reply: [['pike', '(over the radio) A real stakeout! I\'ll get more donuts.']] }]]] }
    ], reward: { rp: 140, loot: 'u' } },

  // ================= Riverside =================
  { id: 'adrift', d: 2, title: 'Adrift', giver: 'hal', req: [2, 0], blurb: 'A sailboat came loose and drifted into the marina.',
    offer: [['hal', 'Somebody\'s sailboat drifted into my slips at dawn. No name on the stern. The joggers on the Riverwalk see everything that floats.']],
    steps: [
      { at: 'Riverwalk', who: 'jogger', goal: 'Ask the morning jogger on the Riverwalk', say: [['jogger', 'Blue hull, white sail cover? It was tied up near Heron Point yesterday. The owner eats breakfast at the Rowboat Café every single day. Tall guy. Lectures people about knots.']], quiz: { les: 13, n: 1 } },
      { at: 'The Rowboat Café', who: 'boatowner', goal: 'Find the owner at the Rowboat Café', say: [['boatowner', 'My boat?! My knots are excellent. The rope was old. The rope is to blame.'],
        ['choice', [
          { t: 'Document the recovery and get a signature', set: 'boatLogged', reply: [['boatowner', 'Signed. Thank you. I\'m buying new rope today. And maybe a book about knots.']] },
          { t: 'Tell him where the boat is and move on', reply: [['hal', '(over the radio) No paperwork? Your sergeant won\'t love that.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'fenceline', d: 2, title: 'A Fence Too Far', giver: 'gus', req: [2, 0], blurb: 'Two neighbors out past the creek are feuding over a fence line.',
    offer: [['gus', 'My cousin Pruett out at Willow Creek Farm put up a fence. His neighbor Ms. Okoro says it\'s six inches over the line. They both have surveys. They both have tempers.']],
    steps: [
      { at: 'Willow Creek Farm', who: 'farmer', goal: 'Hear Mr. Pruett\'s side at Willow Creek Farm', say: [['farmer', 'My survey says it\'s my land. I want you to make her move her chicken coop. Today.']], quiz: { les: 14, n: 1 } },
      { at: 'River Pawn', who: 'okoro', goal: 'Hear Ms. Okoro\'s side at River Pawn, where she works', say: [['okoro', 'My survey says it\'s mine. And he cut my roses.'],
        ['choice', [
          { t: 'Explain it is a civil matter for a court', set: 'fenceCivil', trust: 1, reply: [['okoro', 'So a judge decides, not you. Okay. That\'s fair.'], ['gus', '(over the radio) Pruett says he\'ll call a lawyer. And he\'s sorry about the roses.']] },
          { t: 'Tell her the coop has to be moved', set: 'fenceSide', trust: -2, reply: [['okoro', 'You can\'t order me to do that. I\'m filing a complaint.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'smoke', d: 2, title: 'Where There\'s Smoke', giver: 'bell', giverAt: 'Fire Station 3', req: [2, 1], blurb: 'Smoke is pouring off a back deck on Cypress Lane.',
    offer: [['bell', 'Smoke call on Cypress Lane, back deck. Our engine\'s on another run. Can you put eyes on it while we roll?']],
    steps: [
      { at: 'Cypress Lane', who: 'tenant', goal: 'Check the smoke on Cypress Lane', say: [['tenant', 'It\'s my smoker! Brisket! It got a little big! The deck railing caught a little!'],
        ['choice', [
          { t: 'Get everyone back and tell the engine exactly what you see', set: 'smokeSize', reply: [['bell', '(over the radio) Copy, small deck fire, contained. We\'ll check it anyway. Good size-up.']] },
          { t: 'Grab the garden hose and try to be a hero', set: 'smokeHero', trust: -1, reply: [['bell', '(over the radio) Don\'t be a hero. Let us do our job.']] }]]], quiz: { les: 12, n: 1 } },
      { at: 'Fire Station 3', who: 'bell', goal: 'Debrief with Engineer Bell at Fire Station 3', say: [['bell', 'Smokers belong ten feet from anything that burns. We\'ll leave a flyer. You did fine. Station T-shirt? We have extras.']], quiz: { les: 12, n: 1 } }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'gator', d: 2, title: 'See You Later', giver: 'bobby', req: [2, 1], blurb: 'There\'s an alligator in the daycare\'s retention pond.',
    offer: [['bobby', 'Bad news: a six-foot gator in the pond behind Little Paddlers. Good news: very calm gator. Bad news: still a gator. Dale the trapper lives out in Cypress Hammock. No phone. Of course.']],
    steps: [
      { at: 'Little Paddlers Daycare', who: 'director', goal: 'Check in at Little Paddlers Daycare', say: [['director', 'The children named him Mr. Chompers. They want to keep him. I do not want to keep him.']], quiz: { les: 11, n: 1 } },
      { at: 'Cypress Hammock', who: 'trapper', goal: 'Find Dale the trapper out in Cypress Hammock', say: [['trapper', 'Six-footer by a daycare? That\'s a relocation. Don\'t let anybody feed him or poke him. I\'ll be there in an hour with my truck.'],
        ['choice', [
          { t: 'Radio the daycare: kids inside until Dale arrives', set: 'gatorTrapper', reply: [['director', '(over the radio) Indoor recess. The children are devastated. Mr. Chompers will be missed.']] },
          { t: 'Ask if you could just shoo it back to the river', trust: -1, reply: [['trapper', 'With what, a broom? No. Leave it to the folks with the license.']] }]]] }
    ], reward: { rp: 130, loot: 'r' } },
  { id: 'hardknock', d: 2, title: 'The Hardest Knock', giver: 'chaplain', giverAt: 'Substation', req: [2, 2], blurb: 'A mother must be told that her son has died.',
    offer: [['chaplain', 'There\'s been a crash on the interstate. A young man from River Bend Apartments. His mother doesn\'t know yet. I\'d like an officer to come with me.'], ['chaplain', 'In person, never by phone. Confirm who he is. Plain words. Then stay as long as she needs.']],
    steps: [
      { at: 'River Bend Apartments', who: 'chaplain', goal: 'Go with Chaplain Ortiz to River Bend Apartments', say: [['narr', 'You knock. She opens the door and sees the two of you, and she already knows.'],
        ['choice', [
          { t: 'Say it plainly and kindly, then stay with her', set: 'notifyKind', trust: 2, reply: [['chaplain', 'You did it the right way. She\'ll remember that someone was gentle with her on the worst day.']] },
          { t: 'Let the chaplain do the talking', reply: [['chaplain', 'It\'s alright. Next time, you\'ll be ready to speak. It matters that it comes from us both.']] }]], ['chaplain', 'Take care of yourself too, officer. This stays with you. Talk about it. Don\'t carry it alone.']], quiz: { les: 10, n: 1 } }
    ], reward: { rp: 150, loot: 'r' } },
  { id: 'signs', d: 2, title: 'Signs of the Times', giver: 'johnson', req: [2, 2], blurb: 'Parents are planning a protest at the Riverside School crosswalk.',
    offer: [['johnson', 'Parents are protesting the new bus schedule tomorrow, right at my crosswalk. The organizer meets with parents at the Pelican Diner. Peaceful folks. I just need the kids to get across.']],
    steps: [
      { at: 'Pelican Diner', who: 'organizer', goal: 'Meet the organizer at the Pelican Diner', say: [['organizer', 'We have a right to be there and to be heard. We\'re not going anywhere.']], quiz: { les: 15, n: 1 } },
      { at: 'Riverside School', npc: 'johnson', who: 'johnson', goal: 'Work it out at the Riverside School crosswalk', say: [['johnson', 'Three minutes until the bell.'], ['organizer', '(arriving with forty parents and their signs) So, officer?'],
        ['choice', [
          { t: 'Help them protest from the sidewalk', set: 'signsMoved', trust: 2, npc: { johnson: 1 }, reply: [['organizer', 'We keep our signs, the kids cross safely. Deal.']] },
          { t: 'Order the crowd to disperse now', set: 'signsDisperse', trust: -2, reply: [['organizer', 'Disperse? For holding a sign? We\'ll be back tomorrow with twice as many.']] }]]], quiz: { les: 16, n: 1 } }
    ], reward: { rp: 140, loot: 'u' } },
  { id: 'biscuit', d: 2, title: 'Biscuit', giver: 'junie', giverAt: 'Riverside Marina', req: [2, 3], blurb: 'A lost dog showed up on the marina docks.',
    offer: [['junie', 'This little guy\'s been sitting on dock three all morning. Nice collar, no tag. I\'m calling him Biscuit until somebody says different. Mr. Boone at the Feed & Seed knows every dog in Riverside.']],
    steps: [
      { at: 'Riverside Feed & Seed', who: 'feed', goal: 'Ask Mr. Boone at Riverside Feed & Seed', say: [['feed', 'That\'s Biscuit. Really, that\'s his name. The Torres family out on Heron Point buys his food here. Their little girl has been crying for two days.']], quiz: { les: 11, n: 1 } },
      { at: 'Heron Point', who: 'lucia', goal: 'Bring Biscuit home to Heron Point', say: [['lucia', 'BISCUIT!'],
        ['choice', [
          { t: 'Radio Junie so she can come see the reunion', set: 'biscuitJunie', reply: [['junie', '(over the radio) She hugged him so hard he sneezed? Okay. I\'m not crying.']] },
          { t: 'Hand Biscuit over and get back in service', reply: [['narr', 'Lucia\'s mom mouths "thank you" over the top of a very happy dog.']] }]]] }
    ], reward: { rp: 110, loot: 'u' } },
  { id: 'marketday', d: 2, title: 'Market Day', giver: 'pham', giverAt: 'River Market', req: [2, 3], blurb: 'Mrs. Lin hasn\'t opened her market stall in three days.',
    offer: [['pham', 'Mrs. Lin sells the best mangoes on the river. Her stall\'s been shut three days. She lives alone at Bayou Senior Apartments. She mentioned a fall last week. She said it was nothing. She always says it\'s nothing.']],
    steps: [
      { at: 'Bayou Senior Apartments', who: 'castillo', goal: 'Do a well-being check at Bayou Senior Apartments', say: [['castillo', 'Knock, announce, listen. If there\'s no answer and we have reason to believe she needs help, we get in.'],
        ['choice', [
          { t: 'Get the building manager\'s key and go in together', set: 'linFound', reply: [['narr', 'She\'s on her kitchen floor, alert, embarrassed and very thirsty. Paramedics take it from there.'], ['lin', 'I said it was nothing. It was something.'], ['castillo', 'Two more days and this ends differently. Good instincts.']] },
          { t: 'Leave a card and come back tomorrow', set: 'linLate', trust: -1, reply: [['castillo', '…Knock again. Louder. Listen. I hear something.']] }]]], quiz: { les: 9, n: 2 } }
    ], reward: { rp: 150, loot: 'r' } },

  // ================= Industrial Park =================
  { id: 'crywolf', d: 3, title: 'Cry Wolf', giver: 'manager', giverAt: 'Palmetto Paper Co.', req: [3, 0], blurb: 'Palmetto Paper\'s alarm goes off every night. Is any of them real?',
    offer: [['manager', 'Our alarm goes off every night. Your units are sick of us. It\'s a loose door sensor. Probably. Ninety percent. Okay, seventy.']],
    steps: [
      { at: 'Palmetto Paper Co.', who: 'castillo', goal: 'Clear the Palmetto Paper building with Castillo', say: [['castillo', 'We treat every alarm like it\'s real. That\'s exactly when somebody gets lazy. Perimeter, entry point, then room by room.'],
        ['choice', [
          { t: 'Search systematically, one area at a time', set: 'wolfSearch', reply: [['narr', 'Loading dock: clear. Offices: clear. Back stairwell: a door propped open with a brick. Fresh scuff marks.'], ['castillo', 'Someone\'s been using that door. Glad we didn\'t skip it.']] },
          { t: 'Check the door sensor and call it a false alarm', set: 'wolfSkip', trust: -1, reply: [['castillo', 'And the propped stairwell door? Never assume.']] }]]], quiz: { les: 17, n: 2 } }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'noseknows', d: 3, title: 'Search the Pines', giver: 'dee', req: [3, 1], blurb: 'A teen hitchhiker\'s backpack turned up at the truck stop. Where is he?',
    offer: [['dee', 'Found this backpack by my rig. Phone, wallet, school ID. Kid\'s seventeen. Nobody leaves their phone. The last trucker who gave him a ride saw him walk toward the North Spur Pines.']],
    steps: [
      { at: 'Lock-It Storage', who: 'vacant', goal: 'Ask Mr. Ames behind Lock-It Storage', say: [['vacant', 'Skinny kid, no bag, asked me which way to the highway. I told him not through the pines. He went through the pines.']], quiz: { les: 18, n: 1 } },
      { at: 'North Spur Pines', who: 'pike', goal: 'Set up the search in the North Spur Pines', say: [['pike', 'Big woods. Where do we start?'],
        ['choice', [
          { t: 'Set a perimeter, then grid it with units', set: 'yardGrid', reply: [['narr', 'Forty minutes in, a unit finds him asleep under a pine, sunburned and dehydrated, but okay.'], ['hiker', 'I just… wanted to go see my dad. I got lost.'], ['dee', '(over the radio) His mom\'s on the way. I bought him a burger. Diesel is guarding him.']] },
          { t: 'Split up and cover more ground fast', set: 'yardWander', trust: -1, reply: [['castillo', '(over the radio) Stop. Grid it. You\'ll miss half the woods wandering.']] }]]], quiz: { les: 18, n: 1 } }
    ], reward: { rp: 150, loot: 'r' } },
  { id: 'copper', d: 3, title: 'Copper Run', giver: 'shonda', req: [3, 1], blurb: 'Stolen copper wire is showing up at the recycling yards.',
    offer: [['shonda', 'A guy tried to sell me two hundred pounds of brand-new copper wire. Still had the utility tags. I buy with ID and a thumbprint, so I have his address: Railside Apartments. He says he\'ll be back tomorrow.']],
    steps: [
      { at: 'Railside Apartments', who: 'railneighbor', goal: 'Ask around at Railside Apartments', say: [['railneighbor', 'The man in 1C? His pickup comes back at three in the morning full of wire. Every few nights. I wrote down the dates. I write everything down.']], quiz: { les: 13, n: 1 } },
      { at: 'Green Bin Recycling', npc: 'shonda', who: 'shonda', goal: 'Be at Green Bin Recycling when he comes back', say: [['shonda', 'Here he comes. Same truck.'], ['copperman', 'Two hundred pounds, same as yesterday. Cash.'],
        ['choice', [
          { t: 'Let Shonda hold the load while you identify the seller', set: 'copperHold', npc: { shonda: 1 }, reply: [['shonda', 'Load\'s held. Tags match the substation theft. Your detective is going to love Mrs. Kowal\'s notebook.']] },
          { t: 'Wave him off before it gets messy', trust: -1, reply: [['shonda', '…And there goes two hundred pounds of evidence.']] }]]] }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'retire', d: 3, title: 'Big Mo\'s Last Shift', giver: 'lupe', req: [3, 2], blurb: 'Big Mo is retiring and the crew needs a hand with a surprise.',
    offer: [['lupe', 'Big Mo from Gulf Packaging retires Friday. Thirty-one years. We\'re throwing a surprise party here at The Lunch Pail. But he lost his lucky hat and says he won\'t leave the plant without it.']],
    steps: [
      { at: 'Gulf Packaging', who: 'crew', goal: 'Search for the hat at Gulf Packaging', say: [['crew', 'Lucky hat? Orange, ugly, sacred. We searched dock by dock. Nothing. He wore it home Tuesday, I think. He lives on Millworker Row.'],
        ['narr', 'You search the break room anyway, section by section. Nothing. But there\'s an orange thread on the time clock.']], quiz: { les: 18, n: 1 } },
      { at: 'Millworker Row', who: 'packer', goal: 'Visit Big Mo on Millworker Row', say: [['packer', 'My hat? I looked everywhere. Even the porch.'], ['narr', 'It\'s on the porch. On the dog. The dog is wearing it.'],
        ['choice', [
          { t: 'Get him to The Lunch Pail unawares', set: 'hatParty', npc: { lupe: 1 }, reply: [['packer', 'Lunch? With you? Sure… wait, why is my whole crew here? Oh. Oh no. Thirty-one years. Thank you.']] },
          { t: 'Hand him the hat and wish him well', reply: [['packer', 'My hat! Okay, now I can… wait, why is Lupe texting me fifty times?']] }]]] }
    ], reward: { rp: 120, loot: 'r' } },
  { id: 'keys', d: 3, title: 'The Gate Keys', giver: 'foreman', giverAt: 'Sawdust Lumber Yard', req: [3, 0], blurb: 'The lumber yard gate keys vanished before a big delivery.',
    offer: [['foreman', 'Gate keys. Gone. Forty trucks of lumber due at noon and the gate is locked. Last place I had them was the sod farm, dropping off fence posts.']],
    steps: [
      { at: 'Sandhill Sod Farm', who: 'sod', goal: 'Look for the keys at Sandhill Sod Farm', say: [['sod', 'Keys? Hm. My mower made a funny clank this morning. Let\'s check the bagger.'], ['narr', 'In the bagger, wrapped in grass clippings: a ring of keys with a tag that says SAWDUST.'],
        ['choice', [
          { t: 'Log them as found property and run them back', set: 'keysLogged', reply: [['foreman', '(over the radio) MY KEYS. Gate\'s open. Forty trucks just applauded. Trucks can\'t applaud. They did.']] },
          { t: 'Ask Ellis to drive them over', reply: [['sod', 'On the tractor? Takes an hour. …Fine, take them yourself.']] }]]], quiz: { les: 13, n: 1 } }
    ], reward: { rp: 100, loot: 'u' } },
  { id: 'seals', d: 3, title: 'Broken Seal', giver: 'evtech', giverAt: 'County Evidence Storage', req: [3, 3], blurb: 'A broken seal at County Evidence Storage needs explaining.',
    offer: [['evtech', 'One of the evidence bags has a broken seal. The log shows it was opened for a court viewing yesterday, but the resealing step never got signed. I need an officer to document this the right way.']],
    steps: [
      { at: 'Substation', inside: true, who: 'castillo', goal: 'Bring it to Castillo at the Substation', say: [['castillo', 'The chain of custody only works if every step is written down. One missing signature is enough for a lawyer to argue.'],
        ['choice', [
          { t: 'Document the gap honestly in a supplemental report', set: 'sealHonest', trust: 1, reply: [['castillo', 'That\'s integrity. The gap is explained, not hidden. The case survives.']] },
          { t: 'Ask the tech to just sign it now', set: 'sealFudge', trust: -2, reply: [['castillo', 'Backdating a signature? No. Never. Write it the way it happened.']] }]]], quiz: { les: 20, n: 2 } }
    ], reward: { rp: 140, loot: 'r' } },
  { id: 'nighttrain', d: 3, title: 'The Night Train', giver: 'railcop', giverAt: 'Eastline Rail Yard', req: [3, 2], blurb: 'Teenagers have been hopping freight trains at night.',
    offer: [['railcop', 'Railroad police. Three kids jumping moving freight cars, three nights running, on camera. Not criminals yet. Just kids being dumb. They hang out at the Vacant Lot before the 11:15 comes through.']],
    steps: [
      { at: 'Vacant Lot', who: 'teens', goal: 'Find the teens at the Vacant Lot', say: [['teens', 'We weren\'t doing anything! …We were doing something.'],
        ['choice', [
          { t: 'Give a safety talk and call their parents', set: 'trainParents', trust: 1, reply: [['teens', 'Our parents? Oh no. Oh no no no. …Okay. Fair.'], ['railcop', '(over the radio) A hundred tons can\'t stop for anybody. Thanks for getting through to them.']] },
          { t: 'Issue each of them a trespass warning', set: 'trainTrespass', reply: [['railcop', '(over the radio) Paper\'s done. Next time it\'s an arrest. Hopefully they believe it.']] }]]], quiz: { les: 18, n: 1 } }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'fizz', d: 3, title: 'Sunrise Fizz', giver: 'bottler', giverAt: 'Sunrise Bottling', req: [3, 3], blurb: 'An open door and an alarm at Sunrise Bottling.',
    offer: [['bottler', 'I didn\'t go in. The side door was open when I got here and the alarm\'s been screaming for ten minutes. I called you instead of 911 because Lupe says you\'re nicer.']],
    steps: [
      { at: 'Sunrise Bottling', inside: true, who: 'castillo', goal: 'Search the bottling plant with Castillo', say: [['castillo', 'Announce. Search. Cover each other. Slow.'],
        ['choice', [
          { t: 'Announce loudly, then search room by room', set: 'fizzAnnounce', reply: [['narr', 'Behind the syrup tanks: a raccoon, very sticky, very guilty. And a door latch that was never fixed.'], ['castillo', 'Raccoon. Logged. Latch, logged. Still the right way to do it.']] },
          { t: 'Go in quietly to catch anyone inside', reply: [['castillo', 'Announcing protects you and anyone inside who belongs there. Think about it.']] }]]], quiz: { les: 17, n: 2 } }
    ], reward: { rp: 130, loot: 'u' } },

  // ================= Justice Row =================
  { id: 'walkin', d: 4, title: 'The Walk-In', giver: 'ray', req: [4, 0], blurb: 'A man wants to turn himself in on a missed court date.',
    offer: [['ray', 'Darnell Price called my office. Warrant for a missed court date. Car broke down. He\'s scared and he wants to fix it. He\'s waiting at home, Courtside Lofts. He asked for a nice officer.']],
    steps: [
      { at: 'Courtside Lofts', who: 'walkin', goal: 'Meet Darnell at Courtside Lofts', say: [['walkin', 'I\'ve been scared for a month. I just want to fix it.'], ['hattie', '(over the radio) Active warrant, failure to appear. Spelled correctly, thank goodness.']], quiz: { les: 19, n: 1 } },
      { at: 'Sally Port', npc: 'ramos', who: 'ramos', goal: 'Bring him to Officer Ramos at the Sally Port', say: [['ramos', 'Search, property, paperwork. He\'ll see a judge in the morning.'],
        ['choice', [
          { t: 'Note that he turned himself in', set: 'walkinNoted', trust: 1, reply: [['ramos', 'That\'ll matter to the judge. Good on you for writing it.']] },
          { t: 'Keep the report short and factual', reply: [['ramos', 'Fine. But details like that help people. Remember it.']] }]]], quiz: { les: 19, n: 1 } }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'propbag', d: 4, title: 'The Property Bag', giver: 'pd', giverAt: 'Public Defender', req: [4, 1], blurb: 'A defendant says money is missing from his property bag.',
    offer: [['pd', 'My client says he came in with three hundred dollars. The property sheet says two hundred. Somebody\'s wrong, and I\'d like to know who. Sgt. Ibarra keeps the property records at the County Records Annex.']],
    steps: [
      { at: 'County Records Annex', inside: true, who: 'propoff', goal: 'Review the inventory with Sgt. Ibarra at the County Records Annex', say: [['propoff', 'Two officers counted it in front of him. Body camera has the count on video: two hundred, in twenties.'],
        ['choice', [
          { t: 'Pull the video and share it with the defender', set: 'propVideo', trust: 1, reply: [['pd', '(over the radio) Two hundred on video, counted in front of him. Thank you for being open with it.']] },
          { t: 'Tell the defender the sheet is final', reply: [['pd', '(over the radio) That\'s not how this works. I\'ll subpoena the video.']] }]]], quiz: { les: 20, n: 2 } }
    ], reward: { rp: 130, loot: 'u' } },
  { id: 'juryduty', d: 4, title: 'Jury Duty', giver: 'juror', giverAt: 'Magnolia Terrace', req: [4, 0], blurb: 'Jurors are getting calls saying they\'ll be arrested unless they pay a fine.',
    offer: [['juror', 'Officer, a man called me. Said he was a deputy. Said I missed jury duty and must pay a fine in gift cards or be arrested. He knew my name. I almost went to the store.']],
    steps: [
      { at: 'County Administration', who: 'admin', goal: 'Check with the jury office at County Administration', say: [['admin', 'She hasn\'t missed anything. And the court never calls asking for money, ever, let alone gift cards. Four people this week.']], quiz: { les: 3, n: 1 } },
      { at: 'Courthouse Newsstand', who: 'newsie', goal: 'Spread the word at the Courthouse Newsstand', say: [['newsie', 'Courts don\'t call for gift cards. Everybody knows that. Well, everybody should.'],
        ['choice', [
          { t: 'Post a warning at the newsstand and the clerk\'s office', set: 'juryWarn', trust: 2, reply: [['newsie', 'Taped it right next to the lottery numbers. Prime real estate.']] },
          { t: 'Just tell Mrs. Whitfield to call the clerk next time', reply: [['juror', '(over the radio) I will. Thank you, dear.']] }]]] }
    ], reward: { rp: 120, loot: 'u' } },
  { id: 'otherside', d: 4, title: 'The Other Side', giver: 'barnes', req: [4, 2], blurb: 'A defense attorney wants your honest account of an arrest.',
    offer: [['barnes', 'Cadet. I\'m defending a man you helped arrest. I\'m not here to trick you. Your report says you read him his rights before questioning. Was that before or after he volunteered the statement in the car? Talk to the prosecutor first, if you like.']],
    steps: [
      { at: 'State Attorney\'s Office', who: 'asa', goal: 'Check in with the prosecutor at the State Attorney\'s Office', say: [['asa', 'Tell him the truth. Exactly what\'s in your report and nothing else. That\'s your whole job here.'],
        ['choice', [
          { t: 'Answer exactly as it happened, all of it', set: 'truthBoth', trust: 2, npc: { barnes: 1 }, reply: [['barnes', '(over the radio) Thank you. That\'s rare, and it\'s how the system is supposed to work.']] },
          { t: 'Keep it general to protect the case', set: 'truthVague', trust: -2, reply: [['asa', 'Vague hurts us more than the truth does. Never shade it.']] }]]], quiz: { les: 19, n: 2 } }
    ], reward: { rp: 150, loot: 'r' } },
  { id: 'orderup', d: 4, title: 'Order Up', giver: 'cook', giverAt: 'The Gavel Grill', req: [4, 1], blurb: 'Two lawyers are in a standoff over the last booth at The Gavel Grill.',
    offer: [['cook', 'Two attorneys sat in the same booth at the same time. Neither will move. Twenty minutes. One of them filed a motion. On a napkin.']],
    steps: [
      { at: 'The Gavel Grill', who: 'lawyerA', goal: 'Settle the booth standoff at The Gavel Grill', say: [['lawyerA', 'I\'d like the record to show I was here first.'], ['lawyerB', 'Objection. Hearsay. My sandwich was here first.'],
        ['choice', [
          { t: 'Suggest they share the booth and split a basket of fries', set: 'boothShare', reply: [['lawyerA', '…A joint venture. Acceptable.'], ['lawyerB', 'Objection! Espresso afterward is on me.']] },
          { t: 'Cookie decides. It\'s his restaurant.', reply: [['cook', 'Both of you, out. The booth goes to the cadet.']] }]]], quiz: { les: 15, n: 1 } }
    ], reward: { rp: 110, loot: 'u' } },
  { id: 'secondchance', d: 4, title: 'Second Chances', giver: 'po', giverAt: 'Probation & Parole', req: [4, 2], blurb: 'A man on probation missed his check-in.',
    offer: [['po', 'Luis missed his check-in. That\'s not like him. He\'s been doing everything right. I\'d rather it be a knock than a warrant. He likes to sit on the benches at Gavel Green.']],
    steps: [
      { at: 'Gavel Green', who: 'probationer', goal: 'Find Luis at Gavel Green', say: [['probationer', 'I lost my job Tuesday. I didn\'t want to tell them. I figured they\'d lock me up.'],
        ['choice', [
          { t: 'Walk him to Probation & Parole and help him explain', set: 'luisWalk', trust: 2, reply: [['po', '(over the radio) Thanks for bringing him in. We\'ll reschedule, and I\'ve got a job lead for him.']] },
          { t: 'Tell him to report on his own by tomorrow', reply: [['probationer', '…Okay. Tomorrow. I\'ll go tomorrow.']] }]]], quiz: { les: 9, n: 1 } }
    ], reward: { rp: 140, loot: 'r' } },
  { id: 'exhibitb', d: 4, title: 'Exhibit B', giver: 'exhibita', req: [4, 1], blurb: 'Exhibit A wants you to follow her. She is very insistent.',
    offer: [['exhibita', '(Exhibit A meows at you, walks three steps toward Old Stone Church, and looks back. Then she does it again.)']],
    steps: [
      { at: 'Old Stone Church', who: 'sexton', goal: 'Follow Exhibit A to Old Stone Church', say: [['sexton', 'Oh, you\'re here about the kitten? She\'s been under the bell tower stairs for two days. The courthouse cat visits her every morning. I think she\'s been bringing her breakfast.'],
        ['choice', [
          { t: 'Take the kitten to the shelter to get checked and adopted', set: 'kittenShelter', reply: [['sexton', 'Shelter first, then a home. Look at that face. Somebody will adopt her in a day.']] },
          { t: 'Bring her back to Justice Plaza as Exhibit B', set: 'kittenB', reply: [['moore', '(over the radio) Exhibit A just walked in with a kitten behind her. I believe that is consent. Exhibit B it is.']] }]]], quiz: { les: 11, n: 1 } }
    ], reward: { rp: 120, loot: 'r' } },
  { id: 'transport', d: 4, title: 'Transport Run', giver: 'deputy', giverAt: 'Substation', req: [4, 3], blurb: 'Ride along on a prisoner transport from the courthouse to the jail.',
    offer: [['deputy', 'I\'ve got a transport from the courthouse to the jail. Want to ride along? You\'ll learn more in ten minutes than in ten pages.']],
    steps: [
      { at: 'County Courthouse', inside: true, who: 'deputy', goal: 'Pick up the prisoner at the County Courthouse', say: [['deputy', 'Search the vehicle before and after. Every time. And he\'s been calm all day. Doesn\'t mean he\'ll stay calm.'],
        ['choice', [
          { t: 'Search him again before he gets in the car', set: 'transSearch', reply: [['deputy', 'Good. A search can miss things. A second one costs us thirty seconds.']] },
          { t: 'Skip it, he was searched this morning', trust: -1, reply: [['deputy', 'This morning isn\'t now. Search again. Always.']] }]]], quiz: { les: 19, n: 1 } },
      { at: 'County Jail', inside: true, who: 'deputy', goal: 'Hand him over at the County Jail', say: [['deputy', 'Search the back seat. …See? A pen cap. Under the seat. Harmless today. Not every day.']], quiz: { les: 20, n: 1 } }
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
