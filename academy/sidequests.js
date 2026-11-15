// More side cases: eight more per district (ten each with the originals in story.js).
// Same format as SIDE in story.js. cast: one-off characters who speak in these cases.
export const SIDE_CAST = {
  kid: { name: "Mateo, age 9", icon: "🧒", role: "Pigeon enthusiast" },
  hank: { name: "Hank", icon: "🚌", role: "Night bus driver" },
  nurse: { name: "Nurse Adaeze", icon: "🩺", role: "Downtown Urgent Care" },
  shopowner: { name: "Mrs. Ellery", icon: "📚", role: "Owns Dog-Eared Books" },
  gio: { name: "Gio", icon: "🍕", role: "Owns Slice of Justice" },
  barber: { name: "Lou the Barber", icon: "💈", role: "Sharp Edges Barbershop" },
  barista: { name: "Priya", icon: "☕", role: "Grind & Badge Coffee" },
  boxer: { name: "Tre", icon: "🥊", role: "Iron Will regular" },
  ferretowner: { name: "Bea", icon: "🦦", role: "Owner of Gary the ferret" },
  pharmacist: { name: "Dr. Vance", icon: "💊", role: "Eastside Pharmacy" },
  washkid: { name: "Kyle", icon: "🧽", role: "Car wash fundraiser" },
  tran: { name: "Mr. Tran", icon: "📱", role: "Corner Cell Repair" },
  nailtech: { name: "Jasmine", icon: "💅", role: "Glam Nails" },
  clerk: { name: "Benny", icon: "⛽", role: "Gas & Go clerk" },
  tony: { name: "Tony", icon: "🍕", role: "Tony's Pizza" },
  boatowner: { name: "Mr. Albright", icon: "⛵", role: "Sailboat owner" },
  neighborA: { name: "Mr. Pruett", icon: "🏠", role: "Willow Street resident" },
  neighborB: { name: "Ms. Okoro", icon: "🏡", role: "Willow Street resident" },
  tenant: { name: "Tenant, Apt 2C", icon: "🔥", role: "River Bend Apartments" },
  director: { name: "Ms. Patel", icon: "🧸", role: "Little Paddlers Daycare" },
  organizer: { name: "Ms. Reyes-Ford", icon: "📣", role: "Parent organizer" },
  vet: { name: "Dr. Sun", icon: "🐾", role: "Riverside Vet Clinic" },
  vendor: { name: "Mrs. Lin", icon: "🥬", role: "River Market vendor" },
  manager: { name: "Night Manager Doyle", icon: "📦", role: "Palmetto Paper Co." },
  recycler: { name: "Shonda", icon: "♻️", role: "Green Bin Recycling" },
  packer: { name: "Mo", icon: "🏷️", role: "Gulf Packaging" },
  foreman: { name: "Foreman Briggs", icon: "🪵", role: "Sawdust Lumber Yard" },
  evtech: { name: "Evidence Tech Kowalski", icon: "🧾", role: "County Evidence Storage" },
  railcop: { name: "Officer Diaz", icon: "🚂", role: "Railroad police" },
  teens: { name: "Three teenagers", icon: "🛹", role: "Definitely not hopping trains" },
  bottler: { name: "Rhonda", icon: "🥤", role: "Sunrise Bottling" },
  walkin: { name: "Darnell Price", icon: "🧥", role: "Turning himself in" },
  pd: { name: "Assistant Public Defender Cho", icon: "📂", role: "Public Defender" },
  newsie: { name: "Sal", icon: "📰", role: "Courthouse Newsstand" },
  juror: { name: "Mrs. Whitfield", icon: "🧾", role: "Summoned for jury duty" },
  asa: { name: "ASA Morrow", icon: "⚖️", role: "State Attorney's Office" },
  cook: { name: "Cookie", icon: "🍔", role: "The Gavel Grill" },
  po: { name: "Officer Grant", icon: "📋", role: "Probation & Parole" },
  probationer: { name: "Luis", icon: "🧢", role: "On probation, doing his best" },
  admin: { name: "Clerk Fernandez", icon: "🗄️", role: "County Administration" }
};

export const SIDE2 = [
  // ---------------- Central District ----------------
  { id: "pigeons", d: 0, title: "The Pigeon Situation", giver: "pruitt", req: [0, 0], blurb: "Pigeons are raiding Mr. Delgado's buns, and Sgt. Pruitt (Ret.) suspects an inside job.",
    offer: [["pruitt", "Cadet. The pigeons are organized. Somebody is training them. I would know. I have been training pigeons for forty years."]],
    steps: [
      { at: "Founders Plaza", npc: "delgado", who: "delgado", goal: "Ask Mr. Delgado about the bun heists", say: [["delgado", "Every day at noon. Swoop, grab, gone. They only take the buns. They have taste, I'll give them that."], ["delgado", "There's a little kid who sits by the fountain with a bag of bread. Maybe ask him."]], quiz: { les: 0, n: 1 } },
      { at: "Founders Park", who: "kid", goal: "Talk to the kid feeding the pigeons", say: [["kid", "I'm not training them! I'm just... teaching them. Teaching them is different."],
        ["choice", [
          { t: "Ask him to feed them birdseed away from the food cart", set: "pigeonSeed", trust: 1, reply: [["kid", "Birdseed? Is that better for them? Okay. Okay, I'll do that."]] },
          { t: "Tell him feeding pigeons in the plaza has to stop", set: "pigeonStop", reply: [["kid", "...Fine. Sorry, pigeons."]] },
          { t: "Introduce him to Sgt. Pruitt", set: "pigeonPruitt", npc: { pruitt: 1 }, reply: [["pruitt", "A young pigeon man! Son, sit down. I have forty years of things to tell you."]] }]]] },
      { at: "Founders Plaza", npc: "delgado", who: "delgado", goal: "Report back to Mr. Delgado", say: [["delgado", "No pigeons today. A miracle. You want a bun? You earned a bun. You still have to pay for the bun."], ["pruitt", "(over the radio) The boy has potential. He's coming to Sunday pigeon club.", { if: "pigeonPruitt" }]] }
    ], reward: { rp: 110, loot: "u" } },
  { id: "deadair", d: 0, title: "Dead Air", giver: "kevin", req: [0, 1], blurb: "Kevin from IT found a radio dead spot near Bayfront Tower.",
    offer: [["kevin", "So, uh, your radios. Near Bayfront Tower they just... stop. I tested with my scanner. I have a scanner. It's a hobby. Please don't arrest me."]],
    steps: [
      { at: "Meridian Office Tower", npc: "kevin", who: "kevin", goal: "Check Kevin's scanner readings", say: [["kevin", "See this graph? Signal's fine, fine, fine, then nothing for a whole block. Officers walking that block can't call for help."]], quiz: { les: 2, n: 1 } },
      { at: "Radio Tower", who: "velvet", goal: "Ask Velvet about the repeater at the Radio Tower", say: [["velvet", "That repeater's been cranky since the hurricane. Officially, it's on the repair list. Unofficially, the repair list is long."],
        ["choice", [
          { t: "Write it up as an officer safety hazard through the chain of command", set: "deadairReport", trust: 1, reply: [["velvet", "Officer safety moves it to the top of the list. Smart. I'll make sure the lieutenant sees it."]] },
          { t: "Tell units to avoid that block for now", set: "deadairAvoid", reply: [["velvet", "That's a bandage, not a fix. But it'll do for tonight."]] }]]] },
      { at: "Bayfront Tower", who: "kevin", goal: "Meet Kevin at Bayfront Tower for a retest", say: [["kevin", "Signal's back! Technicians came this morning. I may have also emailed them a very long graph."], ["okonkwo", "(over the radio) Nice catch, cadet. A dead spot is how people get hurt.", { if: "deadairReport" }]] }
    ], reward: { rp: 130, loot: "r" } },
  { id: "nightowl", d: 0, title: "The Empty Stool", giver: "dot", req: [0, 2], blurb: "A Night Owl regular hasn't been in for a week.",
    offer: [["dot", "Mr. Abernathy sits on stool six every night at eleven. Black coffee, cherry pie. It's been a week. That man has never missed a week."]],
    steps: [
      { at: "Night Owl Diner", npc: "dot", who: "dot", goal: "Ask Dot about Mr. Abernathy", say: [["dot", "He rides the night bus home. Always tips in quarters. Always says the pie's too sweet and then orders another one."]], quiz: { les: 9, n: 1 } },
      { at: "Downtown Transit Center", who: "hank", goal: "Ask the night bus driver", say: [["hank", "Abernathy? Last time I saw him he looked gray. Like, real gray. Said he was going to get checked out at urgent care."]] },
      { at: "Downtown Urgent Care", who: "nurse", goal: "Check on him at Downtown Urgent Care", say: [["nurse", "He's here. He's okay, but he's been admitted for observation. No visitors in a week. He asked if anyone had noticed."],
        ["choice", [
          { t: "Bring him a slice of Dot's cherry pie", set: "pieDelivered", npc: { dot: 2 }, reply: [["nurse", "Pie is against three hospital policies. I'll allow it. He's going to cry."]] },
          { t: "Let Dot know he's okay", npc: { dot: 1 }, reply: [["dot", "(over the radio) Oh thank goodness. I'm saving stool six for him."]] }]]] }
    ], reward: { rp: 130, loot: "u" } },
  { id: "spokes", d: 0, title: "Spokes and Suspects", giver: "marcus", req: [0, 1], blurb: "Bikes are vanishing from the office tower racks.",
    offer: [["marcus", "Three bikes this week. Mine was next, I can feel it. My bike is my whole job, officer."]],
    steps: [
      { at: "Meridian Office Tower", npc: "marcus", who: "marcus", goal: "Get the serial numbers from Marcus", say: [["marcus", "I wrote down everybody's serial number. On a napkin. It's a good napkin."]], quiz: { les: 3, n: 1 } },
      { at: "Records", inside: true, who: "navarro", goal: "Run the serials at Records", say: [["navarro", "Two of these serials show up on an online resale listing. Same seller, same pickup spot: the Transit Center, Friday at six."]], quiz: { les: 3, n: 1 } },
      { at: "Downtown Transit Center", who: "pike", goal: "Meet Pike at the Transit Center", say: [["pike", "Seller's here. Hoodie, three bikes, looks nervous. Let's grab him."],
        ["choice", [
          { t: "Plan it: you make contact, Pike covers", set: "spokesPlan", reply: [["pike", "Contact and cover. Fine. ...He's handing over the bikes. Says he 'found them.' Sure, buddy."]] },
          { t: "Let Pike rush in", set: "spokesRush", trust: -1, reply: [["pike", "He's running! He dropped the bikes! ...I still count that as a win."]] }]]] }
    ], reward: { rp: 140, loot: "r" } },
  { id: "overdue", d: 0, title: "Overdue Since 1987", giver: "okafor", req: [0, 3], blurb: "A library book due in 1987 was just returned. Anonymously.",
    offer: [["okafor", "Officer. A copy of 'Pigeons of the American South' was slipped into the return slot last night. It was due in 1987. I need closure."]],
    steps: [
      { at: "Central Library", npc: "okafor", who: "okafor", goal: "Examine the returned book with Ms. Okafor", say: [["okafor", "Inside the cover: a ticket stub from Dog-Eared Books and a feather. A pigeon feather."]], quiz: { les: 13, n: 1 } },
      { at: "Dog-Eared Books", who: "shopowner", goal: "Ask Mrs. Ellery at Dog-Eared Books", say: [["shopowner", "That stub? We gave those out at our pigeon book signing. Only one customer came. A retired sergeant. Very proud mustache."]] },
      { at: "Founders Park", npc: "pruitt", who: "pruitt", goal: "Have a word with Sgt. Pruitt (Ret.)", say: [["pruitt", "...I panicked in 1987. Then I was embarrassed. Then it had been ten years. Then it had been thirty."],
        ["choice", [
          { t: "Tell Ms. Okafor and suggest she waive the fine", set: "finesWaived", npc: { pruitt: 1 }, reply: [["okafor", "(over the radio) Thirty-nine years of guilt is punishment enough. Fine waived. Tell him to come to the reading club."]] },
          { t: "He pays the fine: one quarter", set: "quarterPaid", reply: [["pruitt", "A quarter. I've had this quarter ready since 1987."]] }]]] }
    ], reward: { rp: 120, loot: "u" } },
  { id: "corner", d: 0, title: "Corner Wars", giver: "delgado", req: [0, 2], blurb: "Delgado and the pizza shop are fighting over the same corner.",
    offer: [["delgado", "Gio from Slice of Justice put a sandwich board on MY corner. Twenty-two years, my corner. This is a war, officer. A polite war."]],
    steps: [
      { at: "Slice of Justice", who: "gio", goal: "Hear Gio's side at Slice of Justice", say: [["gio", "The board is on the public sidewalk. Delgado's cart is ALSO on the public sidewalk. It's a sidewalk. It's for everyone."]], quiz: { les: 8, n: 1 } },
      { at: "Founders Plaza", npc: "delgado", who: "delgado", goal: "Mediate at Founders Plaza", say: [["delgado", "So? Who wins?"], ["gio", "Yeah, officer. Who wins?"],
        ["choice", [
          { t: "Split the corner and check the vending permits", set: "cornerSplit", trust: 1, npc: { delgado: 1 }, reply: [["delgado", "Half a corner... with a combo deal? Hot dog and a slice?"], ["gio", "The Founders Special. ...I hate that I love it."]] },
          { t: "Enforce the permit map exactly as written", set: "cornerPermit", reply: [["gio", "Fine. The board moves three feet. Three very bitter feet."]] }]]] }
    ], reward: { rp: 120, loot: "u" } },
  { id: "shoptalk", d: 0, title: "Shop Talk", giver: "kevin", req: [0, 3], blurb: "A barbershop rumor about a scam targeting seniors.",
    offer: [["kevin", "I was getting a haircut and Lou the barber said three of his older customers got scam calls about their 'computer viruses.' That's MY job. That's offensive."]],
    steps: [
      { at: "Sharp Edges Barbershop", who: "barber", goal: "Talk to Lou at Sharp Edges Barbershop", say: [["barber", "Caller says he's tech support, needs remote access and a gift card. Mrs. Diaz almost bought four hundred dollars of gift cards."]], quiz: { les: 3, n: 1 } },
      { at: "Central Library", npc: "okafor", who: "okafor", goal: "Plan a scam-awareness class with Ms. Okafor", say: [["okafor", "We can host a class Thursday. Seniors trust the library. And cookies. They trust cookies."],
        ["choice", [
          { t: "Teach the class with Kevin", set: "scamClass", trust: 2, npc: { kevin: 1 }, reply: [["kevin", "I made slides. Forty slides. Okay, I'll cut it to ten."]] },
          { t: "Print flyers and leave them at the barbershop", set: "scamFlyers", reply: [["okafor", "Flyers are good. People do read them. Sometimes."]] }]]] },
      { at: "Meridian Office Tower", npc: "kevin", who: "kevin", goal: "Follow up with Kevin", say: [["kevin", "Mrs. Diaz hung up on a scammer yesterday and told him to have a nice day. She said 'tech support never asks for gift cards.' That was slide four!", { if: "scamClass" }], ["kevin", "A few people grabbed the flyers. Progress!", { if: "scamFlyers" }]] }
    ], reward: { rp: 130, loot: "r" } },
  { id: "fakepage", d: 0, title: "Not Our Page", giver: "dot", req: [0, 4], blurb: "A fake police social media page is asking for donations.",
    offer: [["dot", "Somebody shared a 'Port Meridian Police Charity' page with me. It wants donations by gift card. That's not you, is it?"]],
    steps: [
      { at: "Grind & Badge Coffee", who: "barista", goal: "Ask the barista who else saw the page", say: [["barista", "Half our regulars shared it. It's got the department's logo and everything. Looks real."]], quiz: { les: 2, n: 1 } },
      { at: "Records", inside: true, who: "navarro", goal: "Document the page at Records", say: [["navarro", "Screenshots, account name, the payment details, timestamps. Before it gets deleted."]], quiz: { les: 3, n: 1 } },
      { at: "Patrol HQ", inside: true, who: "okonkwo", goal: "Brief Lt. Okonkwo", say: [["okonkwo", "Good documentation. We'll report it and post a warning on our real page."],
        ["choice", [
          { t: "Ask Velvet to warn the public on the official channels", set: "fakeWarned", trust: 2, reply: [["velvet", "(over the radio) Posted. Real page, real warning. The fake one's down by tonight."]] },
          { t: "Leave it to the detectives", reply: [["okonkwo", "Fine. But next time, think about the people still sending money."]] }]]] }
    ], reward: { rp: 140, loot: "r" } },
  // ---------------- Eastside ----------------
  { id: "gloves", d: 1, title: "Gloves Off", giver: "reyes", req: [1, 0], blurb: "A sparring grudge at Iron Will is about to spill into the parking lot.",
    offer: [["reyes", "Two of my fighters got into it after sparring. One of them went home mad. The other one's waiting in the parking lot. I don't like it."]],
    steps: [
      { at: "Iron Will Boxing Gym", npc: "reyes", who: "reyes", goal: "Get the story from Coach Reyes", say: [["reyes", "Tre thinks Marcus hit him after the bell. Maybe he did. Either way, I want it settled in the ring with gloves, not out there."]], quiz: { les: 4, n: 1 } },
      { at: "Eastgate Apartments", who: "boxer", goal: "Talk to Tre outside Eastgate Apartments", say: [["boxer", "He hit me after the bell! Everybody saw it!"],
        ["choice", [
          { t: "Keep your distance, keep your voice low, let him vent", set: "glovesCalm", trust: 1, reply: [["boxer", "...Yeah. Okay. I'm just tired, man. I train every day."]] },
          { t: "Tell him to calm down right now", set: "glovesOrder", reply: [["boxer", "Don't tell me to calm down! ...Fine. Fine."]] }]]], quiz: { les: 5, n: 1 } },
      { at: "Iron Will Boxing Gym", npc: "reyes", who: "reyes", goal: "Report back to Coach Reyes", say: [["reyes", "Saturday. Three rounds, headgear, me as referee, handshake after. That's how this gym settles things."], ["reyes", "He said you talked to him like a person. That matters.", { if: "glovesCalm" }]] }
    ], reward: { rp: 120, loot: "u" } },
  { id: "sockbandit", d: 1, title: "The Sock Bandit", giver: "kim", req: [1, 0], blurb: "Single socks keep vanishing from the dryers at Spin City.",
    offer: [["kim", "Officer. Socks. One sock from every pair. Every day. My customers think I am the thief. I do not want socks. I have enough socks."]],
    steps: [
      { at: "Spin City Laundromat", npc: "kim", who: "kim", goal: "Inspect the dryers with Mr. Kim", say: [["kim", "There is a small hole behind dryer four. Small paw prints. Very small. Very guilty."]], quiz: { les: 11, n: 1 } },
      { at: "Eastside Dog Park", who: "dez", goal: "Ask Dez if he's seen anything", say: [["dez", "Bro. There's a ferret in a sweater that hangs out behind the laundromat. I thought it was a really long cat."]] },
      { at: "Spin City Laundromat", who: "ferretowner", goal: "Meet the ferret's owner", say: [["ferretowner", "Gary! His name is Gary. He's been missing for two weeks. He... has a nest of socks? Oh, Gary."],
        ["choice", [
          { t: "Return Gary and the socks, and suggest a ferret-proof cage", set: "garyHome", npc: { kim: 1 }, reply: [["kim", "A happy ending. I will put the socks in the lost and found. One hundred and twelve socks."]] },
          { t: "Call animal control to handle it", reply: [["ferretowner", "I'll meet them there. Thank you for finding him."]] }]]] }
    ], reward: { rp: 110, loot: "u" } },
  { id: "forgery", d: 1, title: "Prescription for Trouble", giver: "rosa", req: [1, 2], blurb: "Someone is passing forged prescriptions on Eastside.",
    offer: [["rosa", "Mijo, the pharmacist next door, Dr. Vance, she's worried. She thinks someone is bringing in fake prescriptions. She asked me to find a police officer I trust."]],
    steps: [
      { at: "Eastside Pharmacy", who: "pharmacist", goal: "Talk to Dr. Vance at the pharmacy", say: [["pharmacist", "Same doctor's name, wrong license number, three times this month. He comes back tonight to pick up."]], quiz: { les: 4, n: 1 } },
      { at: "Substation", inside: true, who: "castillo", goal: "Plan it with Castillo at the Substation", say: [["castillo", "Pharmacy, staff, customers inside. Plan it: who's contact, who's cover, where does he go if he runs."],
        ["choice", [
          { t: "Wait outside and contact him after he leaves the counter", set: "rxPlan", reply: [["castillo", "Away from the staff and the public. Good. That's how it's done."]] },
          { t: "Contact him at the counter", set: "rxCounter", reply: [["castillo", "Hm. Lot of people in a small space. Be ready."]] }]]], quiz: { les: 6, n: 1 } },
      { at: "Rosa's Bodega", npc: "rosa", who: "rosa", goal: "Let Rosa know it's handled", say: [["rosa", "Dr. Vance said you were so calm about it. She brought me flan to give you. I already ate half. Sorry."]] }
    ], reward: { rp: 140, loot: "r" } },
  { id: "kickflip", d: 1, title: "Kickflip Court", giver: "dez", req: [1, 1], blurb: "Skaters and neighbors are fighting over the community center lot.",
    offer: [["dez", "Officer. The neighbors want us gone from the community center lot. Where are we supposed to skate? The street? That's worse, right?"]],
    steps: [
      { at: "Maple Court", npc: "ruth", who: "ruth", goal: "Hear Grandma Ruth's side", say: [["ruth", "It's the noise at eleven at night, dear. The clack-clack-clack. I'm eighty-one. I need my sleep."]], quiz: { les: 8, n: 1 } },
      { at: "Eastside Community Center", npc: "dez", who: "dez", goal: "Broker a deal at the community center", say: [["dez", "So what's the deal? We get kicked out?"],
        ["choice", [
          { t: "Propose skate hours: 0800 to 2100, with the center's okay", set: "skateHours", trust: 2, npc: { dez: 1, ruth: 1 }, reply: [["dez", "Nine p.m.? That's... fair, actually. Ruth, we cool?"], ["ruth", "(from her porch) We're cool, dear! Bring me a lemon bar Tuesday!"]] },
          { t: "Tell them to take it to the city council", reply: [["dez", "Council meetings are at two in the afternoon. We're in school. Whatever."]] }]]] }
    ], reward: { rp: 120, loot: "u" } },
  { id: "bubbles", d: 1, title: "Suds and Scams", giver: "earl", req: [1, 2], blurb: "A car wash fundraiser claims to raise money for a police league that doesn't exist.",
    offer: [["earl", "Kids washing cars for the 'Port Meridian Police Youth League.' I gave twenty bucks. Then I thought, I've never heard of that league."]],
    steps: [
      { at: "Bubbles Car Wash", who: "washkid", goal: "Talk to the kids at Bubbles Car Wash", say: [["washkid", "A guy paid us ten bucks each to wash cars and give him the money. He said it was for the police. Is that... not true?"]], quiz: { les: 5, n: 1 } },
      { at: "Eastside Plaza", who: "castillo", goal: "Catch up with Castillo at Eastside Plaza", say: [["castillo", "There's no such league. The kids are victims here too. The man who hired them is the one we want."],
        ["choice", [
          { t: "Get the kids' statements and their parents involved", set: "sudsStatements", trust: 1, reply: [["castillo", "Good. Statements, a description, and a phone number. That's a case."]] },
          { t: "Shut down the car wash", reply: [["castillo", "The kids go home. The guy just finds new kids. Think bigger next time."]] }]]] },
      { at: "Big Earl's Auto", npc: "earl", who: "earl", goal: "Tell Earl what happened", say: [["earl", "So the kids get to keep washing cars for a real cause? I'll donate my twenty again. To a real thing this time."]] }
    ], reward: { rp: 130, loot: "u" } },
  { id: "wallwords", d: 1, title: "Words on the Wall", giver: "ruth", req: [1, 3], blurb: "Threatening graffiti targets a local shop owner.",
    offer: [["ruth", "Somebody spray-painted something nasty on Mr. Tran's shop. Not just graffiti. A threat. With his name in it."]],
    steps: [
      { at: "Corner Cell Repair", who: "tran", goal: "Talk to Mr. Tran at Corner Cell Repair", say: [["tran", "Third time. And an ex-employee keeps posting about me online. Angry posts. I'm worried about my daughter. She works the counter."]], quiz: { les: 7, n: 1 } },
      { at: "Substation", inside: true, who: "castillo", goal: "Talk threat assessment with Castillo", say: [["castillo", "This isn't one incident. It's a pattern of behavior. That's exactly what threat assessment is for."],
        ["choice", [
          { t: "Document everything and refer it for a threat assessment", set: "btamReferral", trust: 1, reply: [["castillo", "Right call. The team looks at the whole picture, not just the paint."]] },
          { t: "Just write a vandalism report", set: "btamVandal", reply: [["castillo", "And the online posts? The pattern? A report alone misses the point."]] }]]], quiz: { les: 7, n: 1 } },
      { at: "Maple Court", npc: "ruth", who: "ruth", goal: "Update Grandma Ruth", say: [["ruth", "The watch is keeping an eye on his shop at night. Thirty-one sets of eyes, dear.", { if: "ruthWatch" }], ["ruth", "Thank you for taking it seriously. Not everyone does."]] }
    ], reward: { rp: 150, loot: "r" } },
  { id: "ring", d: 1, title: "The Ring Thing", giver: "kim", req: [1, 1], blurb: "An engagement ring went missing at Glam Nails on the big day.",
    offer: [["kim", "Jasmine from Glam Nails is crying. She lost an engagement ring. Not hers, a customer's. Tonight is the proposal."]],
    steps: [
      { at: "Glam Nails", who: "nailtech", goal: "Talk to Jasmine at Glam Nails", say: [["nailtech", "He took it off for his manicure, set it on the tray, went to the Gas & Go for a soda, and when he came back it was gone."]], quiz: { les: 13, n: 1 } },
      { at: "Gas & Go", who: "clerk", goal: "Ask the clerk at Gas & Go", say: [["clerk", "A guy bought a soda and paid with a twenty and... oh. Oh no. There's a ring in the tip jar. He must have had it in his hand."],
        ["choice", [
          { t: "Log it as found property and return it with a receipt", set: "ringLogged", reply: [["clerk", "A receipt for a tip jar ring. My manager is going to frame this."]] },
          { t: "Run it straight back to Glam Nails", reply: [["clerk", "Go, go, go! Romance waits for no one!"]] }]]] },
      { at: "Glam Nails", who: "nailtech", goal: "Return the ring to Glam Nails", say: [["nailtech", "He's proposing at seven! You saved a proposal! You're invited to the wedding. That's not a joke."]] }
    ], reward: { rp: 120, loot: "r" } },
  { id: "donutstake", d: 1, title: "The Donut Stop Stakeout", giver: "earl", req: [1, 3], blurb: "Pike wants a stakeout. At a donut shop. Something real is going on next door.",
    offer: [["earl", "Your buddy Pike's been at The Donut Stop for three hours 'on a stakeout.' He's on donut four. But Tony says somebody's been jiggling his back door at night."]],
    steps: [
      { at: "The Donut Stop", who: "pike", goal: "Find Pike at The Donut Stop", say: [["pike", "Before you say anything: the donuts are cover. Also they are very good. Tony's back door, two nights in a row, around midnight."]], quiz: { les: 17, n: 1 } },
      { at: "Tony's Pizza", who: "tony", goal: "Walk the back lot with Tony", say: [["tony", "Pry marks on the door. They didn't get in. Yet."],
        ["choice", [
          { t: "Check the area methodically and recommend lighting", set: "tonyLights", trust: 1, reply: [["tony", "Motion lights. Okay. Cheaper than a new door."]] },
          { t: "Sit on the alley all night with Pike", set: "tonySit", reply: [["pike", "A real stakeout! I'll get more donuts."]] }]]] },
      { at: "Fuel Depot", who: "castillo", goal: "Meet Castillo at the Fuel Depot", say: [["castillo", "A unit picked up a guy with a pry bar two blocks over. Same tool marks as three other doors. Good work. Tell Pike to stop eating."]] }
    ], reward: { rp: 140, loot: "u" } },
  // ---------------- Riverside ----------------
  { id: "adrift", d: 2, title: "Adrift", giver: "hal", req: [2, 0], blurb: "A sailboat came loose and drifted into the marina.",
    offer: [["hal", "Somebody's sailboat came loose up the river and drifted into my slips. No name on the stern. Just a hull number."]],
    steps: [
      { at: "Riverside Marina", npc: "hal", who: "hal", goal: "Look at the loose boat with Captain Hal", say: [["hal", "Line's frayed, not cut. Looks like an accident. But it's somebody's whole boat."]], quiz: { les: 13, n: 1 } },
      { at: "Hook, Line & Sinker", npc: "bobby", who: "bobby", goal: "Ask Bait Shop Bobby about the hull number", say: [["bobby", "That's Albright's boat. He keeps it upriver. He's going to be so embarrassed. He lectures everybody about knots."]] },
      { at: "Riverside Marina", who: "boatowner", goal: "Hand the boat back to Mr. Albright", say: [["boatowner", "My boat! I... my knots are excellent. The rope was old. The rope is to blame."],
        ["choice", [
          { t: "Document the recovery and get his signature", set: "boatLogged", reply: [["boatowner", "Signed. Thank you. I'm buying new rope today."]] },
          { t: "Just hand it over", reply: [["hal", "No paperwork? Your sergeant won't love that."]] }]]] }
    ], reward: { rp: 120, loot: "u" } },
  { id: "fenceline", d: 2, title: "A Fence Too Far", giver: "gus", req: [2, 0], blurb: "Two Willow Street neighbors are feuding over a fence line.",
    offer: [["gus", "My neighbors on Willow are shouting about a fence again. Somebody put it up six inches over the line. Or didn't. They both have surveys."]],
    steps: [
      { at: "Willow Street", who: "neighborA", goal: "Hear Mr. Pruett's side on Willow Street", say: [["neighborA", "My survey says the fence is on my land. I want you to make her move it. Today."]], quiz: { les: 14, n: 1 } },
      { at: "Willow Street", who: "neighborB", goal: "Hear Ms. Okoro's side", say: [["neighborB", "My survey says it's on mine. And he cut my roses."],
        ["choice", [
          { t: "Explain it's a civil matter and point them to the right resources", set: "fenceCivil", trust: 1, reply: [["neighborB", "So a judge decides, not you. Okay. That's fair."], ["neighborA", "...Fine. I'll call a lawyer. And I'm sorry about the roses."]] },
          { t: "Tell her to move the fence", set: "fenceSide", trust: -2, reply: [["neighborB", "You can't order me to do that. I'm filing a complaint."]] }]]] }
    ], reward: { rp: 120, loot: "u" } },
  { id: "smoke", d: 2, title: "Where There's Smoke", giver: "sam", req: [2, 1], blurb: "Smoke is pouring from a balcony at River Bend Apartments.",
    offer: [["sam", "Got a call about smoke on a balcony at River Bend. Engine's on another call. Can you check it while we roll?"]],
    steps: [
      { at: "River Bend Apartments", who: "tenant", goal: "Check the smoke at River Bend Apartments", say: [["tenant", "It's my grill! On the balcony! I didn't know it wasn't allowed! It got a little big!"],
        ["choice", [
          { t: "Get everyone back and tell Engine 3 what you see", set: "smokeSize", reply: [["sam", "(over the radio) Copy. Small grill fire, contained. We'll check it anyway. Good size-up."]] },
          { t: "Try to put it out yourself", set: "smokeHero", trust: -1, reply: [["sam", "(over the radio) Don't be a hero. Let us do our job."]] }]]], quiz: { les: 12, n: 1 } },
      { at: "Fire Station 3", npc: "sam", who: "sam", goal: "Debrief at Fire Station 3", say: [["sam", "Grills on balconies are against the lease and the fire code. We'll leave a flyer. You did fine. Want a station T-shirt? We have extras."]], quiz: { les: 12, n: 1 } }
    ], reward: { rp: 130, loot: "u" } },
  { id: "gator", d: 2, title: "See You Later", giver: "bobby", req: [2, 1], blurb: "There's an alligator in the daycare's retention pond.",
    offer: [["bobby", "Bad news. There's a six-foot gator in the pond behind Little Paddlers. Good news: it's a very calm gator. Bad news: it's still a gator."]],
    steps: [
      { at: "Little Paddlers Daycare", who: "director", goal: "Check in with Ms. Patel at the daycare", say: [["director", "The children named it Mr. Chompers. They want to keep it. I do not want to keep it."]], quiz: { les: 11, n: 1 } },
      { at: "Riverside Park", npc: "gus", who: "gus", goal: "Ask Old Gus how to handle it", say: [["gus", "Don't go near it, don't feed it, call the state's nuisance alligator folks. They know what they're doing. I've seen them work. Very calm people."],
        ["choice", [
          { t: "Call the wildlife trappers and keep the kids inside", set: "gatorTrapper", reply: [["director", "Indoor recess. The children are devastated. Mr. Chompers will be missed."]] },
          { t: "Try to shoo it back into the river", trust: -1, reply: [["gus", "With what, a broom? Son, no."]] }]]] }
    ], reward: { rp: 130, loot: "r" } },
  { id: "hardknock", d: 2, title: "The Hardest Knock", giver: "miguel", req: [2, 2], blurb: "A family must be told that someone they love has died.",
    offer: [["miguel", "There's been a crash on the interstate. A young man from River Bend. His mother doesn't know yet. I'd like an officer to come with me."]],
    steps: [
      { at: "Substation", inside: true, who: "castillo", goal: "Prepare with Sgt. Castillo", say: [["castillo", "This is the hardest thing we do. In person, never by phone. Confirm the identity. Plain words. Then stay as long as she needs."]], quiz: { les: 10, n: 1 } },
      { at: "River Bend Apartments", who: "miguel", goal: "Go with Father Miguel to River Bend", say: [["narr", "You knock. She opens the door and sees the two of you, and she already knows."],
        ["choice", [
          { t: "Say it plainly and kindly, then stay with her", set: "notifyKind", trust: 2, reply: [["miguel", "You did it the right way. She'll remember that someone was gentle with her on the worst day."]] },
          { t: "Let Father Miguel do the talking", reply: [["miguel", "It's alright. Next time, you'll be ready to speak. It matters that it comes from us both."]] }]]] },
      { at: "Community Church", npc: "miguel", who: "miguel", goal: "Sit with Father Miguel afterward", say: [["miguel", "Take care of yourself too, officer. This stays with you. Talk about it. Don't carry it alone."]] }
    ], reward: { rp: 150, loot: "r" } },
  { id: "signs", d: 2, title: "Signs of the Times", giver: "johnson", req: [2, 2], blurb: "A school board protest is growing outside Riverside School.",
    offer: [["johnson", "Parents are protesting the new bus schedule. Peaceful so far. But they're blocking my crosswalk, and the kids get out at three."]],
    steps: [
      { at: "Riverside Park", who: "organizer", goal: "Find the organizer at Riverside Park", say: [["organizer", "We have a right to be here and to be heard. We're not going anywhere."]], quiz: { les: 15, n: 1 } },
      { at: "Riverside School", npc: "johnson", who: "johnson", goal: "Work it out by the crosswalk", say: [["johnson", "Three minutes until the bell."],
        ["choice", [
          { t: "Help them move to the sidewalk so the crosswalk stays clear", set: "signsMoved", trust: 2, reply: [["organizer", "We keep our signs, the kids cross safely. Deal."]] },
          { t: "Order them to disperse", set: "signsDisperse", trust: -2, reply: [["organizer", "Disperse? For holding a sign? We'll be back tomorrow with twice as many."]] }]]], quiz: { les: 16, n: 1 } }
    ], reward: { rp: 140, loot: "u" } },
  { id: "biscuit", d: 2, title: "Biscuit", giver: "gus", req: [2, 3], blurb: "A lost dog showed up at Old Gus's fishing spot.",
    offer: [["gus", "This little fella's been sitting with me all morning. Nice collar, no tag. I'm calling him Biscuit until somebody tells me different."]],
    steps: [
      { at: "Riverside Vet Clinic", who: "vet", goal: "Scan for a microchip at the vet clinic", say: [["vet", "Chipped! His name is actually Biscuit. Gus has good instincts. The owner lives near the River Market."]], quiz: { les: 11, n: 1 } },
      { at: "River Market", who: "vendor", goal: "Find Biscuit's owner at the River Market", say: [["vendor", "Biscuit! That's my granddaughter's dog. She's been crying for two days. Oh, bless you."],
        ["choice", [
          { t: "Bring Gus along so he can see the reunion", set: "biscuitGus", npc: { gus: 2 }, reply: [["gus", "Aw. Look at that. Alright, I'm not crying, you're crying."]] },
          { t: "Hand Biscuit over and get back in service", reply: [["vendor", "Thank you, officer. Thank you."]] }]]] }
    ], reward: { rp: 110, loot: "u" } },
  { id: "marketday", d: 2, title: "Market Day", giver: "hal", req: [2, 3], blurb: "Mrs. Lin hasn't opened her River Market stall in three days.",
    offer: [["hal", "Mrs. Lin sells the best mangoes on the river. Her stall's been shut three days. She lives alone at River Bend. Would you look in?"]],
    steps: [
      { at: "River Market", who: "vendor", goal: "Ask around at the River Market", say: [["vendor", "Mrs. Lin? She mentioned a fall last week. Said it was nothing. She always says it's nothing."]], quiz: { les: 9, n: 1 } },
      { at: "River Bend Apartments", who: "castillo", goal: "Do a well-being check at River Bend", say: [["castillo", "Knock, announce, listen. If there's no answer and we have reason to believe she needs help, we get in."],
        ["choice", [
          { t: "Get the building manager's key and go in together", set: "linFound", reply: [["narr", "She's on the floor of her kitchen, alert, embarrassed and very thirsty. Paramedics take it from there."], ["castillo", "Two more days and this ends differently. Good instincts."]] },
          { t: "Leave a card and come back tomorrow", set: "linLate", trust: -1, reply: [["castillo", "...Knock again. Louder. Listen. I hear something."]] }]]], quiz: { les: 9, n: 1 } }
    ], reward: { rp: 150, loot: "r" } },
  // ---------------- Industrial Park ----------------
  { id: "crywolf", d: 3, title: "Cry Wolf", giver: "carl", req: [3, 0], blurb: "Palmetto Paper's alarm goes off every night. Is any of them real?",
    offer: [["carl", "Palmetto Paper's alarm goes off every single night. Every unit's tired of it. That's exactly when somebody gets lazy and misses the real one."]],
    steps: [
      { at: "Palmetto Paper Co.", who: "manager", goal: "Meet the night manager at Palmetto Paper", say: [["manager", "It's a loose door sensor. Probably. Ninety percent sure. Okay, seventy."]], quiz: { les: 17, n: 1 } },
      { at: "Palmetto Paper Co.", who: "castillo", goal: "Clear the building with Castillo", say: [["castillo", "We treat every alarm like it's real. Perimeter, entry point, then room by room."],
        ["choice", [
          { t: "Search systematically, one area at a time", set: "wolfSearch", reply: [["narr", "Loading dock: clear. Offices: clear. Back stairwell: a door propped open with a brick. Fresh scuff marks."], ["castillo", "Someone's been using that door. Glad we didn't skip it."]] },
          { t: "Check the door sensor and call it a false alarm", set: "wolfSkip", trust: -1, reply: [["castillo", "And the propped stairwell door? Never assume."]] }]]], quiz: { les: 17, n: 1 } }
    ], reward: { rp: 130, loot: "u" } },
  { id: "noseknows", d: 3, title: "Search the Yard", giver: "dee", req: [3, 1], blurb: "A teen hitchhiker's backpack turned up at the truck stop. Where is he?",
    offer: [["dee", "Found this backpack by my rig. Phone, wallet, school ID. Kid's seventeen. Nobody leaves their phone. That scares me."]],
    steps: [
      { at: "Big Rig Truck Stop", npc: "dee", who: "dee", goal: "Look at the backpack with Trucker Dee", say: [["dee", "Last trucker who gave him a ride dropped him here around noon. He was headed toward the rail yards."]], quiz: { les: 18, n: 1 } },
      { at: "North Spur Yard", who: "pike", goal: "Set up the search at North Spur Yard", say: [["pike", "Big area. Lots of boxcars. Where do we start?"],
        ["choice", [
          { t: "Perimeter first, then search in a grid with more units", set: "yardGrid", reply: [["narr", "Forty minutes in, a unit finds him asleep in an empty boxcar, sunburned and dehydrated, but okay."]] },
          { t: "Split up and wander", set: "yardWander", trust: -1, reply: [["castillo", "(over the radio) Stop. Grid it. You'll miss half the yard wandering."]] }]]], quiz: { les: 18, n: 1 } },
      { at: "Big Rig Truck Stop", npc: "dee", who: "dee", goal: "Return the backpack", say: [["dee", "His mom's on the way. I bought him a burger. Diesel is guarding him."]] }
    ], reward: { rp: 150, loot: "r" } },
  { id: "copper", d: 3, title: "Copper Run", giver: "rusty", req: [3, 1], blurb: "Stolen copper wire is showing up at the scrapyards.",
    offer: [["rusty", "Some guy tried to sell me two hundred pounds of brand new copper wire. Still had the utility company tags. I said come back tomorrow. He's coming back tomorrow."]],
    steps: [
      { at: "Green Bin Recycling", who: "recycler", goal: "Ask Shonda at Green Bin Recycling", say: [["recycler", "Same guy came here last week. We buy with ID and a thumbprint. I've got his ID on file."]], quiz: { les: 13, n: 1 } },
      { at: "Rusty's Scrap & Salvage", npc: "rusty", who: "rusty", goal: "Be at Rusty's when he comes back", say: [["rusty", "Here he comes. Same truck."],
        ["choice", [
          { t: "Let Rusty hold the load while you identify the seller", set: "copperHold", npc: { rusty: 1 }, reply: [["rusty", "Load's held. Tags match the utility substation theft. Your detective will love this."]] },
          { t: "Wave him off before it gets messy", trust: -1, reply: [["rusty", "...And there goes two hundred pounds of evidence."]] }]]] }
    ], reward: { rp: 130, loot: "u" } },
  { id: "retire", d: 3, title: "Gerald's Last Shift", giver: "lupe", req: [3, 2], blurb: "Gerald is retiring and the crew needs a hand with a surprise.",
    offer: [["lupe", "Gerald's retiring Friday. Thirty years on the forklift. We're throwing a surprise party at The Lunch Pail. But he lost his lucky hat and won't leave the warehouse without it."]],
    steps: [
      { at: "Gulf Packaging", who: "packer", goal: "Ask the crew at Gulf Packaging", say: [["packer", "Lucky hat? Orange, ugly, sacred. He last had it on dock three. Or two. Big dock."]], quiz: { les: 18, n: 1 } },
      { at: "Coastline Freight", npc: "gerald", who: "gerald", goal: "Search the docks at Coastline Freight", say: [["narr", "You search the docks section by section. In the rafters above dock two: an orange hat, very ugly, very sacred."],
        ["choice", [
          { t: "Give it to him at the party", set: "hatParty", npc: { gerald: 2, lupe: 1 }, reply: [["gerald", "My hat! At my party! Who told everyone about the party? ...Thank you. Thirty years. Thank you."]] },
          { t: "Give it to him right now", reply: [["gerald", "My hat! Okay, now I can go home and... wait, why is everyone at The Lunch Pail?"]] }]]] }
    ], reward: { rp: 120, loot: "r" } },
  { id: "keys", d: 3, title: "Lupe's Lost Keys", giver: "lupe", req: [3, 0], blurb: "Lupe's food truck keys vanished before the lunch rush.",
    offer: [["lupe", "Keys. My truck keys. Gone. Lunch rush is in an hour. Forty truckers will riot. Polite riot, but still."]],
    steps: [
      { at: "Sawdust Lumber Yard", who: "foreman", goal: "Check Sawdust Lumber Yard, her last stop", say: [["foreman", "She was here at seven for coffee. We've got a lost and found box. It's mostly gloves. Let's look."]], quiz: { les: 13, n: 1 } },
      { at: "Big Rig Truck Stop", npc: "dee", who: "dee", goal: "Ask Trucker Dee", say: [["dee", "Diesel brought me a set of keys this morning. I thought they were mine. They are not mine."],
        ["choice", [
          { t: "Return them to Lupe and log it", reply: [["lupe", "(over the radio) MY KEYS! Free tacos for you and the dog. The dog first."]] },
          { t: "Return them and talk to Dee about Diesel again", npc: { dee: 1 }, reply: [["dee", "I know, I know. Latch on the window. Ordered it."]] }]]] }
    ], reward: { rp: 100, loot: "u" } },
  { id: "seals", d: 3, title: "Broken Seal", giver: "carl", req: [3, 3], blurb: "A broken seal at County Evidence Storage needs explaining.",
    offer: [["carl", "I do nights at the evidence warehouse sometimes. One of the bags had a broken seal this morning. I didn't touch it. Figured that's important."]],
    steps: [
      { at: "County Evidence Storage", inside: true, who: "evtech", goal: "Meet the evidence tech", say: [["evtech", "Seal's broken, but the log shows it was opened for a court viewing yesterday. The resealing step just never got signed."]], quiz: { les: 20, n: 1 } },
      { at: "Substation", inside: true, who: "castillo", goal: "Tell Castillo what you found", say: [["castillo", "The chain of custody only works if every step is written down. One missing signature is enough for a lawyer to argue."],
        ["choice", [
          { t: "Document the gap honestly in a supplemental report", set: "sealHonest", trust: 1, reply: [["castillo", "That's integrity. The gap is explained, not hidden. The case survives."]] },
          { t: "Ask the tech to just sign it now", set: "sealFudge", trust: -2, reply: [["castillo", "Backdating a signature? No. Never. Write it the way it happened."]] }]]] }
    ], reward: { rp: 140, loot: "r" } },
  { id: "nighttrain", d: 3, title: "The Night Train", giver: "dee", req: [3, 2], blurb: "Teenagers have been hopping freight trains at night.",
    offer: [["dee", "I saw three kids jump onto a moving freight car last night. They think it's fun. That's how kids lose legs."]],
    steps: [
      { at: "Eastline Rail Yard", who: "railcop", goal: "Meet the railroad police at Eastline", say: [["railcop", "We've got them on camera three nights running. Same spot, same time. They're not criminals yet. Just kids being dumb."]], quiz: { les: 18, n: 1 } },
      { at: "North Spur Yard", who: "teens", goal: "Find the teens at North Spur Yard", say: [["teens", "We weren't doing anything! ...We were doing something."],
        ["choice", [
          { t: "Give them a safety talk and call their parents", set: "trainParents", trust: 1, reply: [["teens", "Our parents? Oh no. Oh no no no. ...Okay. Fair."]] },
          { t: "Issue a trespass warning", set: "trainTrespass", reply: [["railcop", "Paper's done. Next time it's an arrest. Hopefully they believe it."]] }]]] }
    ], reward: { rp: 130, loot: "u" } },
  { id: "fizz", d: 3, title: "Sunrise Fizz", giver: "lupe", req: [3, 3], blurb: "An open door and an alarm at Sunrise Bottling.",
    offer: [["lupe", "Rhonda from Sunrise Bottling called me, not 911, because she says you're nicer. Their alarm is going and the side door's wide open."]],
    steps: [
      { at: "Sunrise Bottling", who: "bottler", goal: "Meet Rhonda outside Sunrise Bottling", say: [["bottler", "I didn't go in. The door was open when I got here. The alarm's been screaming for ten minutes."]], quiz: { les: 17, n: 1 } },
      { at: "Sunrise Bottling", inside: true, who: "castillo", goal: "Search the plant with Castillo", say: [["castillo", "Announce. Search. Cover each other. Slow."],
        ["choice", [
          { t: "Announce loudly and search room by room", set: "fizzAnnounce", reply: [["narr", "Behind the syrup tanks: a raccoon, very sticky, very guilty. And a door latch that was never fixed."], ["castillo", "Raccoon. Logged. Latch, logged. Still the right way to do it."]] },
          { t: "Go in quiet and fast", reply: [["castillo", "Quiet works sometimes. Announcing protects you and anyone inside who belongs there. Think about it."]] }]]] }
    ], reward: { rp: 130, loot: "u" } },
  // ---------------- Justice Row ----------------
  { id: "walkin", d: 4, title: "The Walk-In", giver: "ray", req: [4, 0], blurb: "A man walked into the bail bonds office to turn himself in.",
    offer: [["ray", "Guy walks into my office and says he wants to turn himself in. Warrant for a missed court date. He's nervous. I told him to wait for a nice officer."]],
    steps: [
      { at: "Freedom Bail Bonds", who: "walkin", goal: "Meet Darnell at Freedom Bail Bonds", say: [["walkin", "I missed court because my car broke down. I've been scared for a month. I just want to fix it."]], quiz: { les: 19, n: 1 } },
      { at: "Clerk of Court", inside: true, npc: "hattie", who: "hattie", goal: "Confirm the warrant with Clerk Hattie", say: [["hattie", "Active warrant, failure to appear. Spelled correctly, thank goodness."]], quiz: { les: 19, n: 1 } },
      { at: "County Jail", inside: true, npc: "ramos", who: "ramos", goal: "Process him at the County Jail", say: [["ramos", "Search, property, paperwork. He'll see a judge in the morning."],
        ["choice", [
          { t: "Note in your report that he came in voluntarily", set: "walkinNoted", trust: 1, reply: [["ramos", "That'll matter to the judge. Good on you for writing it."]] },
          { t: "Keep the report bare-bones", reply: [["ramos", "Fine. But details like that help people. Remember it."]] }]]] }
    ], reward: { rp: 130, loot: "u" } },
  { id: "propbag", d: 4, title: "The Property Bag", giver: "ramos", req: [4, 1], blurb: "An arrestee says money is missing from his property bag.",
    offer: [["ramos", "Arrestee says he came in with three hundred dollars and his property sheet says two hundred. Now his lawyer's asking. I want this airtight."]],
    steps: [
      { at: "Public Defender", who: "pd", goal: "Talk to the public defender", say: [["pd", "My client says three hundred. Your sheet says two hundred. Somebody's wrong, and I'd like to know who."]], quiz: { les: 20, n: 1 } },
      { at: "County Jail", inside: true, npc: "ramos", who: "ramos", goal: "Review the inventory with Officer Ramos", say: [["ramos", "Two officers counted it in front of him. Body cam's got the count on video: two hundred, in twenties."],
        ["choice", [
          { t: "Pull the video and share it with the defender", set: "propVideo", trust: 1, reply: [["pd", "Two hundred on video, counted in front of him. Thank you for being open with it."]] },
          { t: "Tell the defender the sheet is final", reply: [["pd", "That's not how this works. I'll subpoena the video."]] }]]] }
    ], reward: { rp: 130, loot: "u" } },
  { id: "juryduty", d: 4, title: "Jury Duty", giver: "moore", req: [4, 0], blurb: "Jurors are getting calls saying they'll be arrested unless they pay a fine.",
    offer: [["moore", "Mrs. Whitfield came in crying. Someone called her claiming to be from the court, saying she missed jury duty and must pay a fine by gift card or be arrested."]],
    steps: [
      { at: "County Courthouse", inside: true, npc: "moore", who: "juror", goal: "Talk to Mrs. Whitfield at the courthouse", say: [["juror", "He knew my name. He said he was a deputy. I almost bought the gift cards."]], quiz: { les: 3, n: 1 } },
      { at: "Courthouse Newsstand", who: "newsie", goal: "Spread the word at the newsstand", say: [["newsie", "Courts don't call for gift cards. Everybody knows that. Well, everybody should."],
        ["choice", [
          { t: "Post a warning at the newsstand and the clerk's office", set: "juryWarn", trust: 2, reply: [["newsie", "Taped it right next to the lottery numbers. Prime real estate."]] },
          { t: "Tell Mrs. Whitfield to call the clerk directly next time", reply: [["juror", "I will. Thank you, dear."]] }]]] }
    ], reward: { rp: 120, loot: "u" } },
  { id: "otherside", d: 4, title: "The Other Side", giver: "barnes", req: [4, 2], blurb: "A defense attorney wants your honest account of an arrest.",
    offer: [["barnes", "Cadet. I'm defending a man you helped arrest. I'm not here to trick you. I want to know what actually happened. The truth helps everyone."]],
    steps: [
      { at: "Barnes & Ruiz, Attorneys", npc: "barnes", who: "barnes", goal: "Meet Attorney Barnes at his office", say: [["barnes", "Your report says you read him his rights before questioning. Was that before or after he volunteered the statement in the car?"]], quiz: { les: 19, n: 1 } },
      { at: "State Attorney's Office", who: "asa", goal: "Check in with the prosecutor", say: [["asa", "Tell him the truth. Exactly what's in your report and nothing else. That's your whole job here."],
        ["choice", [
          { t: "Answer exactly as it happened, even the parts that help him", set: "truthBoth", trust: 2, npc: { barnes: 1 }, reply: [["barnes", "Thank you. That's rare, and it's how the system is supposed to work."]] },
          { t: "Keep it vague to protect the case", set: "truthVague", trust: -2, reply: [["asa", "Vague hurts us more than the truth does. Never shade it."]] }]]] }
    ], reward: { rp: 150, loot: "r" } },
  { id: "orderup", d: 4, title: "Order Up", giver: "hattie", req: [4, 1], blurb: "Two lawyers are in a standoff over the last booth at The Gavel Grill.",
    offer: [["hattie", "Two attorneys are refusing to leave the same booth at The Gavel Grill. They've been objecting at each other for twenty minutes. Cookie wants them out."]],
    steps: [
      { at: "The Gavel Grill", who: "cook", goal: "Get the facts from Cookie at The Gavel Grill", say: [["cook", "They both sat down at the same time. Neither will move. One of them filed a motion. On a napkin."]], quiz: { les: 15, n: 1 } },
      { at: "The Gavel Grill", who: "barnes", goal: "Settle it", say: [["barnes", "I'd like the record to show I was here first."],
        ["choice", [
          { t: "Suggest they share the booth and split a basket of fries", set: "boothShare", reply: [["barnes", "...A joint venture. Acceptable. Objection! Espresso afterward is on me."]] },
          { t: "Cookie decides. It's his restaurant.", reply: [["cook", "Both of you, out. Booth goes to the cadet."]] }]]] }
    ], reward: { rp: 110, loot: "u" } },
  { id: "secondchance", d: 4, title: "Second Chances", giver: "ray", req: [4, 2], blurb: "A man on probation missed his check-in and nobody can find him.",
    offer: [["ray", "Luis missed his probation check-in. That's not like him. He's been doing everything right. I bonded him out myself, I know the guy."]],
    steps: [
      { at: "Probation & Parole", who: "po", goal: "Talk to Officer Grant at Probation & Parole", say: [["po", "One missed check-in isn't the end of the world. But I need to see him, and I'd rather it be a knock than a warrant."]], quiz: { les: 9, n: 1 } },
      { at: "Veterans Memorial Park", who: "probationer", goal: "Find Luis at Veterans Memorial Park", say: [["probationer", "I lost my job Tuesday. I didn't want to tell them. I figured they'd lock me up."],
        ["choice", [
          { t: "Walk him to Probation & Parole and help him explain", set: "luisWalk", trust: 2, reply: [["po", "(over the radio) Thanks for bringing him in. We'll reschedule, and I've got a job lead for him."]] },
          { t: "Tell him to report on his own by tomorrow", reply: [["probationer", "...Okay. Tomorrow. I'll go tomorrow."]] }]]] }
    ], reward: { rp: 140, loot: "r" } },
  { id: "exhibitb", d: 4, title: "Exhibit B", giver: "moore", req: [4, 1], blurb: "A second cat has appeared at the courthouse. Exhibit A is not pleased.",
    offer: [["moore", "There's a new cat. Kitten, really. Exhibit A has been staring at it for two hours. Nobody has ever seen her stare that long. It's unsettling."]],
    steps: [
      { at: "Justice Plaza", npc: "exhibita", who: "exhibita", goal: "Observe Exhibit A at Justice Plaza", say: [["exhibita", "(Exhibit A stares at the kitten. The kitten stares back. Neither blinks.)"]], quiz: { les: 11, n: 1 } },
      { at: "County Administration", who: "admin", goal: "Check County Administration about the kitten", say: [["admin", "Nobody's reported a lost kitten. The shelter can take it. Or... the courthouse could have two cats."],
        ["choice", [
          { t: "Take it to the shelter to get checked and adopted", set: "kittenShelter", reply: [["admin", "Shelter it is. Somebody will adopt it in a day. Look at that face."]] },
          { t: "Propose it becomes Exhibit B", set: "kittenB", reply: [["moore", "Exhibit A just walked over and sat next to it. I believe that is consent. Exhibit B it is."]] }]]] }
    ], reward: { rp: 120, loot: "r" } },
  { id: "transport", d: 4, title: "Transport Run", giver: "ramos", req: [4, 3], blurb: "Ride along on a prisoner transport from the courthouse to the jail.",
    offer: [["ramos", "I've got a transport from the courthouse to the jail. Want to ride along? You'll learn more in ten minutes than in ten pages."]],
    steps: [
      { at: "Sally Port", npc: "ramos", who: "ramos", goal: "Meet Officer Ramos at the sally port", say: [["ramos", "Search the vehicle before and after. Every time. You'd be amazed what ends up under a seat."]], quiz: { les: 19, n: 1 } },
      { at: "County Courthouse", inside: true, who: "moore", goal: "Pick up the prisoner at the courthouse", say: [["moore", "He's been calm all day. Doesn't mean he'll stay calm."],
        ["choice", [
          { t: "Search him again before he gets in the car", set: "transSearch", reply: [["ramos", "Good. A search can miss things. A second one costs us thirty seconds."]] },
          { t: "Skip it, he was searched this morning", trust: -1, reply: [["ramos", "This morning isn't now. Search again. Always."]] }]]], quiz: { les: 20, n: 1 } },
      { at: "County Jail", inside: true, npc: "ramos", who: "ramos", goal: "Hand him over at the County Jail", say: [["ramos", "Search the back seat. ...See? A pen cap. Under the seat. Harmless today. Not every day."]] }
    ], reward: { rp: 140, loot: "r" } }
];

// Lore found in the world. when: 'visit:<place>' (walk up to it) or 'side:<case id>' (close that case).
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
  { id: 'l_book', title: 'Pigeons of the American South', when: 'side:overdue', text: 'The library\'s copy of the book now has a handwritten note inside the cover: "Returned 39 years late by a man who never stopped feeling bad about it. Be like him, but faster."' },
  { id: 'l_gary', title: 'Gary the Ferret', when: 'side:sockbandit', text: 'Spin City Laundromat now keeps a jar of single socks by the register labeled "Gary\'s Collection, Returned." Gary has visited twice since, supervised, in a tiny harness.' },
  { id: 'l_chompers', title: 'Mr. Chompers', when: 'side:gator', text: 'Florida\'s nuisance alligator program relocates gators that wander too close to people. Mr. Chompers was moved to a quiet stretch of the river. The children of Little Paddlers still send him drawings, which Bait Shop Bobby promises to deliver.' },
  { id: 'l_hat', title: 'The Orange Hat', when: 'side:retire', text: 'Gerald\'s lucky hat now hangs above the time clock at Coastline Freight. New hires are told to tap it on their first day. No one remembers deciding this. Everyone does it.' },
  { id: 'l_exhibitb', title: 'Exhibit B', when: 'side:exhibitb', text: 'Justice Row has two cats now, or it has one cat and a kitten that lives at the shelter and visits. Either way, the courthouse bulletin board lists them both under "Staff."' },
  { id: 'l_otherside', title: 'Both Sides of the Table', when: 'side:otherside', text: 'Attorney Barnes keeps a framed quote on his wall from the first judge he ever argued before: "An honest witness is the best friend the truth ever had, whichever side calls them."' },
  { id: 'l_secondchance', title: 'The Job Board at Probation', when: 'side:secondchance', text: 'Officer Grant keeps a board of local employers willing to hire people on probation. Big Earl\'s Auto, The Lunch Pail and Rusty\'s yard have all been on it for years.' },
  { id: 'l_deadair', title: 'Kevin\'s Graph', when: 'side:deadair', text: 'The repeater technicians framed Kevin\'s forty-page signal graph and hung it in their shop. Kevin has been told about this and is, by his own account, "fine about it, totally fine."' },
  { id: 'l_nightowl', title: 'Cherry Pie', when: 'side:nightowl', text: 'Mr. Abernathy is back on stool six. He still says the pie is too sweet. He still orders a second slice. Dot has started writing "too sweet" on his receipt.' },
  { id: 'l_kickflip', title: 'Skate Hours', when: 'side:kickflip', text: 'A small hand-painted sign on the community center fence now reads "SKATE 8 AM to 9 PM. Lemon bars Tuesdays." Nobody is quite sure who added the second line.' },
  { id: 'l_biscuit', title: 'Biscuit', when: 'side:biscuit', text: 'Biscuit now visits Old Gus at his fishing spot every Saturday with his owner. Gus claims he does not have a favorite dog. Gus brings dog treats every Saturday.' },
  { id: 'l_train', title: 'The North Spur', when: 'side:nighttrain', text: 'Freight cars can weigh more than a hundred tons and cannot stop quickly. Railroad police across the country run safety talks for teenagers every year, because the stories always start the same way: "We just thought it would be fun."' }
];
