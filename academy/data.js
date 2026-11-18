// Patrol City content: districts (one per Chapter 5 unit), landmarks, dispatch calls and "something's off" moments.
// Lesson numbers are positions in ch5.json's lessons list (0 = Lesson 1.1 ... 20 = Lesson 5.2).
// Each lot is a kind, or [kind, name, sign], or { strip: [...] } for a block of four storefronts.
export const DISTRICTS = [
  { id: 0, name: 'Central District', unit: 'Unit 1 · Patrol Basics', lessons: [0, 1, 2, 3], color: '#f5b800', theme: 'downtown',
    blurb: 'Downtown. Headquarters, roll call, the dispatch center and the radio tower.',
    lots: ['hq', ['houses', 'Palmetto Row'], ['apartments', 'Harbor View Apartments'], ['church', 'First Light Chapel'], ['park', 'Bayfront Dog Run'], ['school', 'Founders Elementary'], ['shop', 'Spokes & Spares'], ['pawn', 'Downtown Pawn & Loan'], 'dispatch', 'radio', 'bank', 'records', ['tower', 'Bayfront Tower', ''], ['diner', 'Night Owl Diner', 'DINER'], 'parking',
      { strip: [['cafe', 'Grind & Badge Coffee', 'COFFEE'], ['barber', 'Sharp Edges Barbershop', 'BARBER'], ['books', 'Dog-Eared Books', 'BOOKS'], ['pizza', 'Slice of Justice', 'PIZZA']] },
      ['plaza', 'Founders Plaza'], ['tower', 'Meridian Office Tower', ''], ['library', 'Central Library', 'LIBRARY'], 'garage', ['transit', 'Downtown Transit Center', 'TRANSIT'], ['clinic', 'Downtown Urgent Care', 'URGENT CARE'], ['park', 'Founders Park']] },
  { id: 1, name: 'Eastside', unit: 'Unit 2 · Duties on Patrol', lessons: [4, 5, 6, 7], color: '#3b82f6', theme: 'commercial',
    blurb: 'Gas stations, a strip mall and busy corners. Contacts, backup and threat assessment.',
    lots: ['substation', ['farm', 'Old Grove Farm'], ['woods', 'Eastgate Pines'], ['church', 'Eastside Baptist Church'], ['school', 'Eastside Middle School'], ['shop', 'Eastside Jewelers'], ['diner', 'Sunrise Café'], ['gas', 'Gas & Go', 'GAS'], ['mall', 'Eastside Plaza', 'PLAZA'], ['motel', 'Eastgate Motel', 'MOTEL'], ['autoshop', "Big Earl's Auto", 'AUTO'], ['carwash', 'Bubbles Car Wash', 'WASH'],
      { strip: [['laundromat', 'Spin City Laundromat', 'LAUNDRY'], ['shop', "Rosa's Bodega", 'BODEGA'], ['pharmacy', 'Eastside Pharmacy', 'Rx'], ['nails', 'Glam Nails', 'NAILS']] },
      ['houses', 'Maple Court'], ['gym', 'Iron Will Boxing Gym', 'BOXING'], ['apartments', 'Eastgate Apartments', ''],
      { strip: [['pizza', "Tony's Pizza", 'PIZZA'], ['cafe', 'The Donut Stop', 'DONUTS'], ['shop', 'Corner Cell Repair', 'PHONES'], ['barber', 'Fade Factory', 'BARBER']] },
      'parking', ['gas', 'Fuel Depot', 'FUEL'], ['houses', 'Birch Lane'], ['center', 'Eastside Community Center', 'COMMUNITY'], ['park', 'Eastside Dog Park']] },
  { id: 2, name: 'Riverside', unit: 'Unit 3 · Non-Criminal Calls', lessons: [8, 9, 10, 11, 12, 13, 14, 15, 16], color: '#16a34a', theme: 'residential',
    blurb: 'Homes, apartments, the park, a pawn shop and the stadium on the river.', river: true,
    lots: ['substation', ['farm', 'Willow Creek Farm'], ['woods', 'Cypress Hammock'], ['houses', 'Heron Point'], ['park', 'Riverwalk'], ['shop', 'Riverside Feed & Seed'], ['houses', 'Cypress Lane'], ['diner', 'Pelican Diner'], ['apartments', 'Bayou Senior Apartments'], ['houses', 'Willow Street'], ['apartments', 'River Bend Apartments', ''], ['pawn', 'River Pawn', 'PAWN'], ['park', 'Riverside Park'], 'firestation', ['stadium', 'River Stadium'], ['church', 'Community Church'],
      ['school', 'Riverside School', 'SCHOOL'], ['school', 'Little Paddlers Daycare', 'DAYCARE'], ['marina', 'Riverside Marina', 'MARINA'],
      { strip: [['bait', 'Hook, Line & Sinker', 'BAIT'], ['cafe', 'The Rowboat Café', 'CAFE'], ['clinic', 'Riverside Vet Clinic', 'VET'], ['shop', 'River Market', 'MARKET']] }] },
  { id: 3, name: 'Industrial Park', unit: 'Unit 4 · Structure and Area Searches', lessons: [17, 18], color: '#f97316', theme: 'industrial',
    blurb: 'Warehouses, fenced lots, a rail yard and alarms that go off after dark.',
    lots: ['substation', ['woods', 'North Spur Pines'], ['farm', 'Sandhill Sod Farm'], ['apartments', 'Railside Apartments'], ['houses', 'Millworker Row'], ['warehouse', 'Coastline Freight', 'FREIGHT'], ['warehouse', 'Palmetto Paper Co.', 'PAPER'], ['storage', 'Lock-It Storage', 'STORAGE'], ['railyard', 'Eastline Rail Yard'], ['warehouse', 'Gulf Packaging', 'GULF'], ['lumber', 'Sawdust Lumber Yard', 'LUMBER'], 'parking',
      ['scrapyard', "Rusty's Scrap & Salvage", 'SCRAP'], ['truckstop', 'Big Rig Truck Stop', 'TRUCK STOP'], ['warehouse', 'Sunrise Bottling', 'BOTTLING'], ['lot', 'Vacant Lot'], ['warehouse', 'County Evidence Storage', 'EVIDENCE'], ['railyard', 'North Spur Yard'], ['scrapyard', 'Green Bin Recycling', 'RECYCLE'], ['diner', 'The Lunch Pail', 'LUNCH']] },
  { id: 4, name: 'Justice Row', unit: 'Unit 5 · Arrest Procedures', lessons: [19, 20], color: '#a855f7', theme: 'civic',
    blurb: 'The county courthouse, the jail and its sally port, bail bonds and the public defender.',
    lots: ['substation', ['houses', 'Magnolia Terrace'], ['apartments', 'Courtside Lofts'], ['church', 'Old Stone Church'], ['park', 'Gavel Green'], ['records', 'County Records Annex'], 'courthouse', 'jail', 'sallyport', ['bonds', 'Freedom Bail Bonds', 'BONDS'], ['plaza', 'Justice Plaza'], ['tower', 'County Administration', ''], 'parking',
      ['defender', 'Public Defender', 'LAW'], { strip: [['office', 'Barnes & Ruiz, Attorneys', 'LAW'], ['cafe', 'Objection! Espresso', 'ESPRESSO'], ['shop', 'Quick Copy & Notary', 'COPY'], ['office', 'Probation & Parole', 'PROBATION']] },
      ['tower', 'Clerk of Court', ''], 'parking', ['diner', 'The Gavel Grill', 'GRILL'], ['tower', "State Attorney's Office", ''], ['shop', 'Courthouse Newsstand', 'NEWS'], ['park', 'Veterans Memorial Park']] }
];

// The regulars: named people who live and work in each district. Talk to them, help them out and they
// remember you. home is the lot kind they hang around (or 'park', 'plaza'); help is the lesson their favors teach.
export const NPCS = [
  // Central
  { id: 'delgado', d: 0, name: 'Mr. Delgado', role: 'Hot dog vendor', home: 'plaza', icon: '🌭', look: { shirt: '#f2f2f2', pants: '#2c3e50', hair: '#9a9a9a', skin: '#c68e63', apron: '#d22d3d' }, help: 0,
    lines: ["\"Officer! You look hungry. You guys always look hungry.\"", "\"Twenty-two years on this corner. I've seen six police chiefs come and go, and one really confused alligator.\"", "\"Hot dog? Come on, it's lunchtime somewhere.\""] },
  { id: 'pruitt', d: 0, name: 'Sgt. Pruitt (Ret.)', role: 'Retired sergeant, pigeon enthusiast', home: 'park', icon: '🐦', look: { shirt: '#4b5563', pants: '#374151', hair: '#d1d5db', skin: '#e0b48f' }, help: 1,
    lines: ["\"Thirty years on patrol, and now I feed pigeons. They listen better than my old squad did.\"", "\"Watch their hands, cadet. Hands are what hurt you. Faces just yell.\"", "\"When I started, we had one radio for six cars. And we didn't complain.\""] },
  { id: 'dot', d: 0, name: 'Dot', role: 'Waitress at the Night Owl', home: 'diner', icon: '☕', look: { shirt: '#f9a8d4', pants: '#1f2937', hair: '#d8b46a', skin: '#f1c9a5', apron: '#fff' }, help: 0,
    lines: ["\"Working nights? Sit down, hon. Coffee's on me. Pie, you're paying for.\"", "\"I know every cop in this city by their coffee order. I bet you're a cream and two sugars.\"", "\"Somebody left a radio in booth four last week. Was that you? That was you, wasn't it.\""] },
  { id: 'marcus', d: 0, name: 'Marcus', role: 'Bike messenger', home: 'tower', icon: '🚲', look: { shirt: '#22c55e', pants: '#111827', hair: '#1a1a1a', skin: '#7a4b2a', cap: '#f97316' }, help: 3,
    lines: ["\"I deliver to every building downtown, so I know which elevators to stay out of.\"", "\"That gray sedan in the garage? I've seen that same plate on three different cars this month. Just saying.\"", "\"If you need to get to the courthouse fast, don't go the way your GPS tells you.\""] },
  { id: 'okafor', d: 0, name: 'Ms. Okafor', role: 'Head librarian', home: 'library', icon: '📚', look: { shirt: '#7c3aed', pants: '#374151', hair: '#1a1a1a', skin: '#5a3620', glasses: true }, help: 2,
    lines: ["\"We have three copies of Chapter 5, and every one of them is highlighted from front to back.\"", "\"Inside voices, please. And yes, that means your radio too.\"", "\"By the way, you still have two books out. They were due Tuesday.\""] },
  { id: 'kevin', d: 0, name: 'Kevin from IT', role: 'Tower tech support', home: 'tower', icon: '💻', look: { shirt: '#93c5fd', pants: '#475569', hair: '#8a5a2b', skin: '#f1c9a5', glasses: true }, help: 3,
    lines: ["\"Did you try turning it off and back on? That works on radios too, I promise.\"", "\"The records terminal's slow because nobody ever restarts it. Ever.\"", "\"I'm not supposed to say what's in the server room. It's mostly snacks.\""] },
  // Eastside
  { id: 'rosa', d: 1, name: 'Rosa', role: "Owns Rosa's Bodega", home: 'shop', icon: '🛒', look: { shirt: '#f97316', pants: '#1f2937', hair: '#2b1d14', skin: '#c68e63', apron: '#16a34a' }, help: 5,
    lines: ["\"Did you eat today, mijo? Here, take a pastelito. No, take two.\"", "\"That man is back by the pumps, asking everybody for money. Keep an eye on his hands, okay?\"", "\"My cat really runs this store. I just work the register.\""] },
  { id: 'earl', d: 1, name: 'Big Earl', role: 'Mechanic', home: 'autoshop', icon: '🔧', look: { shirt: '#3b5b7a', pants: '#2a3a4a', hair: '#1a1a1a', skin: '#a26a42', cap: '#d22d3d' }, help: 6,
    lines: ["\"Your car's making a noise? They all make noises. Most of them are fine.\"", "\"I had to let a guy go last month. Honestly, some of what he's been posting online has me a little worried.\"", "\"Check your tire pressure. I'm not going to tell you again. Okay, I probably will.\""] },
  { id: 'reyes', d: 1, name: 'Coach Reyes', role: 'Boxing coach', home: 'gym', icon: '🥊', look: { shirt: '#111827', pants: '#d22d3d', hair: '#1a1a1a', skin: '#a26a42' }, help: 6,
    lines: ["\"Feet shoulder width, hands up! Oh, you're not here to train? Keep your hands up anyway.\"", "\"The best fights are the ones where you never have to throw a punch.\"", "\"Bring your class by on Saturday. I'll make your PT test feel easy.\""] },
  { id: 'kim', d: 1, name: 'Mr. Kim', role: 'Laundromat owner', home: 'laundromat', icon: '🧺', look: { shirt: '#e5e7eb', pants: '#374151', hair: '#1a1a1a', skin: '#e0b48f', glasses: true }, help: 4,
    lines: ["\"Machine seven eats quarters. It always has. I hate that machine.\"", "\"Somebody left a whole uniform in dryer three. About your size. Hmm.\"", "\"Separate your whites and your darks. Same as keeping your gig line straight.\""] },
  { id: 'ruth', d: 1, name: 'Grandma Ruth', role: 'Porch-sitter, Maple Court', home: 'houses', icon: '🧶', look: { shirt: '#c4b5fd', pants: '#6b7280', hair: '#f3f4f6', skin: '#f1c9a5' }, help: 5,
    lines: ["\"I see everything from this porch, sweetie. Everything.\"", "\"That gray car with no hubcaps has gone around the block four times. I wrote down the tag for you.\"", "\"You need a sweater. I know it's seventy-eight degrees. You need a sweater.\""] },
  { id: 'dez', d: 1, name: 'Dez', role: 'Skateboarder', home: 'center', icon: '🛹', look: { shirt: '#facc15', pants: '#1e3a8a', hair: '#2b1d14', skin: '#7a4b2a', cap: '#111827' }, help: 4,
    lines: ["\"Hey, officer, are we allowed to skate the plaza? Asking for a friend. The friend is me.\"", "\"I landed a kickflip yesterday and nobody saw it. Does it still count?\"", "\"The community center does free pizza on Thursdays. You should come. Bring the dog.\""] },
  // Riverside
  { id: 'hal', d: 2, name: 'Captain Hal', role: 'Marina harbor master', home: 'marina', icon: '⚓', look: { shirt: '#f2f2f2', pants: '#1f2f50', hair: '#d1d5db', skin: '#e0b48f', cap: '#1f2f50' }, help: 11,
    lines: ["\"Fifty years on this river. Me and the gators have an understanding.\"", "\"No wake zone means no wake. Can you tell the jet ski kids that? Please?\"", "\"Weather turns fast out here. You have to respect the water.\""] },
  { id: 'bobby', d: 2, name: 'Bait Shop Bobby', role: 'Owns Hook, Line & Sinker', home: 'bait', icon: '🎣', look: { shirt: '#556b2f', pants: '#5d4037', hair: '#8a5a2b', skin: '#f1c9a5', cap: '#556b2f' }, help: 13,
    lines: ["\"Live shrimp, cold drinks, and all the fishing gossip on the river.\"", "\"Some guy tried to sell me a fishing rod still in the store packaging. I sent him over to the pawn shop. Then I felt kind of bad about it.\"", "\"The biggest fish I ever caught? I let him go. He earned it.\""] },
  { id: 'johnson', d: 2, name: 'Ms. Johnson', role: 'School crossing guard', home: 'school', icon: '🛑', look: { shirt: '#d4ff3a', pants: '#1f2937', hair: '#1a1a1a', skin: '#5a3620' }, help: 9,
    lines: ["\"Slow down by my school, officer. Yes, you too.\"", "\"Twenty years on this corner and not one kid's gotten hurt. Not one.\"", "\"Mrs. Benoit on Willow hasn't picked up her newspaper in three days. Could you check on her for me?\""] },
  { id: 'miguel', d: 2, name: 'Father Miguel', role: 'Pastor, Community Church', home: 'church', icon: '⛪', look: { shirt: '#111827', pants: '#111827', hair: '#9a9a9a', skin: '#c68e63', collar: true }, help: 10,
    lines: ["\"Bad news is a little easier to hear when it comes with some kindness. Remember that.\"", "\"Our food pantry's open on Tuesdays. Send anybody who needs it.\"", "\"You look tired, my friend. There are cookies in the back.\""] },
  { id: 'sam', d: 2, name: 'Firefighter Sam', role: 'Station 3 engineer', home: 'firestation', icon: '🚒', look: { shirt: '#1f2937', pants: '#1f2937', hair: '#d8b46a', skin: '#f1c9a5' }, help: 12,
    lines: ["\"You stay staged until we tell you it's safe. Then you can have the scene back.\"", "\"We made chili. We always make chili. Come get some.\"", "\"Car fires get bad fast. Stay upwind and stay back.\""] },
  { id: 'gus', d: 2, name: 'Old Gus', role: 'Fishes off the pier every day', home: 'park', icon: '🐟', look: { shirt: '#93c5fd', pants: '#6b7280', hair: '#e5e7eb', skin: '#e0b48f', cap: '#f5f5f5' }, help: 11,
    lines: ["\"Caught a catfish yesterday this big. You don't believe me. Nobody ever does.\"", "\"I saw a dog by the road earlier with no collar, limping. Somebody ought to help it.\"", "\"The crowd gets rowdy after the team loses. Bottles start flying around nine.\""] },
  // Industrial
  { id: 'gerald', d: 3, name: 'Gerald', role: 'Forklift operator', home: 'warehouse', icon: '🏗️', look: { shirt: '#f97316', pants: '#1f2937', hair: '#2b1d14', skin: '#a26a42', hard: true, vest: true }, help: 17,
    lines: ["\"Yes, the forklift's named Gerald too. We're a team.\"", "\"The back door at Gulf Packaging never latches right. The alarm company gets called out about twice a week.\"", "\"Clear every corner, and then clear it again. That's what the cops always say when they come through here.\""] },
  { id: 'rusty', d: 3, name: 'Rusty', role: "Owns Rusty's Scrap & Salvage", home: 'scrapyard', icon: '🔩', look: { shirt: '#7f1d1d', pants: '#3f3a32', hair: '#9a3412', skin: '#f1c9a5', cap: '#111827' }, help: 18,
    lines: ["\"People try to sell me copper wire at two in the morning. I ask for ID, and they leave.\"", "\"There are hundreds of places to hide in a scrapyard. Bring the dog.\"", "\"One man's trash is pretty much my whole business.\""] },
  { id: 'dee', d: 3, name: 'Trucker Dee', role: 'Long-haul driver', home: 'truckstop', icon: '🚚', look: { shirt: '#2563eb', pants: '#1f2937', hair: '#2b1d14', skin: '#c68e63', cap: '#f5b800' }, help: 18,
    lines: ["\"Eleven states this week, and this truck stop still has the best coffee. Don't tell the others.\"", "\"I saw a guy jump the fence over by the lumber yard. He didn't look like he worked there.\"", "\"I talk to my truck. It doesn't talk back. Usually.\""] },
  { id: 'carl', d: 3, name: 'Night Guard Carl', role: 'Security guard', home: 'storage', icon: '🔦', look: { shirt: '#111827', pants: '#111827', hair: '#9a9a9a', skin: '#e0b48f', cap: '#111827' }, help: 17,
    lines: ["\"Twelve years of night shifts. I've met every raccoon in this district. We know each other.\"", "\"The door on unit 14 was pried open. I didn't go in, I waited for you guys. That's the right thing, right?\"", "\"There's an echo behind Warehouse C. Go back there and say something. It says it right back.\""] },
  { id: 'shonda', d: 3, name: 'Shonda', role: 'Runs Green Bin Recycling', home: 'scrapyard', icon: '♻️', look: { shirt: '#16a34a', pants: '#1f2937', hair: '#1a1a1a', skin: '#7a4a2a', cap: '#16a34a' }, help: 18,
    lines: ["\"ID and a thumbprint for every sale. People complain. The ones who complain usually have a reason to.\"", "\"I can tell what a pipe's worth just by the sound it makes when you drop it.\"", "\"My daughter says I talk to the crusher. I do. It listens better than most people.\""] },
  { id: 'lupe', d: 3, name: 'Lupe', role: 'Runs The Lunch Pail', home: 'diner', icon: '🌮', look: { shirt: '#fbbf24', pants: '#1f2937', hair: '#1a1a1a', skin: '#a26a42', apron: '#fff' }, help: 17,
    lines: ["\"Today's special is the breakfast burrito. It's the special every day.\"", "\"Every warehouse guy in this park eats here, so I hear all the gossip.\"", "\"You need more protein, cadet. Here, take this.\""] },
  // Justice Row
  { id: 'moore', d: 4, name: 'Bailiff Moore', role: 'Courtroom bailiff', home: 'courthouse', icon: '⚖️', look: { shirt: '#111827', pants: '#111827', hair: '#1a1a1a', skin: '#5a3620', badge: true }, help: 19,
    lines: ["\"All rise. I'm kidding, sit down. Court's on break.\"", "\"Write every report like a defense attorney's going to read it. Because one will.\"", "\"The judge's candy jar only has peppermints. Don't ask, it's tradition.\""] },
  { id: 'barnes', d: 4, name: 'Attorney Barnes', role: 'Defense attorney', home: 'office', icon: '💼', look: { shirt: '#e5e7eb', pants: '#1f2937', hair: '#2b1d14', skin: '#c68e63', tie: '#1e3a8a' }, help: 19,
    lines: ["\"I'm really looking forward to reading your report, officer. Every single word.\"", "\"Probable cause isn't a feeling. Write down what you actually saw.\"", "\"Nothing personal. My job is to find the hole in your case. Your job is not to leave one.\""] },
  { id: 'ray', d: 4, name: 'Bondsman Ray', role: 'Freedom Bail Bonds', home: 'bonds', icon: '📄', look: { shirt: '#fbbf24', pants: '#374151', hair: '#111827', skin: '#e0b48f', glasses: true }, help: 19,
    lines: ["\"Need a bond? No? Here, take a card anyway.\"", "\"That guy with the warrant? He lives two blocks from here. He's really bad at hiding.\"", "\"We're open twenty-four seven. Kind of like you, but our chairs are nicer.\""] },
  { id: 'hattie', d: 4, name: 'Clerk Hattie', role: 'Clerk of Court', home: 'tower', icon: '🗂️', look: { shirt: '#be185d', pants: '#374151', hair: '#e5e7eb', skin: '#7a4b2a', glasses: true }, help: 20,
    lines: ["\"Forty years filing paperwork. I could find your warrant with my eyes closed.\"", "\"Please spell the name right on the booking sheet. Please. I'm begging you.\"", "\"I've outlasted nine judges and two computer systems.\""] },
  { id: 'ramos', d: 4, name: 'Officer Ramos', role: 'Transport officer, sally port', home: 'sallyport', icon: '🚔', look: { shirt: '#22355e', pants: '#1b2a4a', hair: '#1a1a1a', skin: '#c68e63', cap: '#16213d', badge: true }, help: 20,
    lines: ["\"Search them before they go in the car, and search them again before they come out.\"", "\"Seal and log the property bag, or booking's going to send you back. Every time.\"", "\"Twelve years of transports. That back seat has heard every excuse there is.\""] },
  { id: 'exhibita', d: 4, name: 'Exhibit A', role: 'The courthouse cat', home: 'plaza', icon: '🐈', cat: true, help: 19,
    lines: ["The cat stares at you. You feel like you're being cross-examined.", "Exhibit A yawns. Apparently you're dismissed.", "The cat sits down on your notebook and won't move."] }
];


// Landmark lots: name on the sign, info-point lesson, and the lesson a fact card teaches there.
export const LANDMARKS = {
  cafe: { name: 'Café', sign: 'CAFE', info: null }, barber: { name: 'Barbershop', sign: 'BARBER', info: null }, books: { name: 'Bookstore', sign: 'BOOKS', info: null },
  pizza: { name: 'Pizzeria', sign: 'PIZZA', info: null }, library: { name: 'Library', sign: 'LIBRARY', info: 2 }, transit: { name: 'Transit Center', sign: 'TRANSIT', info: 1 },
  clinic: { name: 'Clinic', sign: 'CLINIC', info: null }, carwash: { name: 'Car Wash', sign: 'WASH', info: 5 }, laundromat: { name: 'Laundromat', sign: 'LAUNDRY', info: null },
  nails: { name: 'Nail Salon', sign: 'NAILS', info: null }, gym: { name: 'Boxing Gym', sign: 'GYM', info: 6 }, center: { name: 'Community Center', sign: 'COMMUNITY', info: 4 },
  marina: { name: 'Marina', sign: 'MARINA', info: 11 }, bait: { name: 'Bait Shop', sign: 'BAIT', info: 13 }, scrapyard: { name: 'Scrapyard', sign: 'SCRAP', info: 18 },
  truckstop: { name: 'Truck Stop', sign: 'TRUCKS', info: 18 }, office: { name: 'Office', sign: 'OFFICE', info: 19 },
  plaza: { name: 'Plaza', sign: '', info: null }, park: { name: 'Park', sign: '', info: null }, tower: { name: 'Office Tower', sign: '', info: null }, apartments: { name: 'Apartments', sign: '', info: 9 }, houses: { name: 'Homes', sign: '', info: 9 },
  lot: { name: 'Vacant Lot', sign: '', info: 18 }, parking: { name: 'Parking Lot', sign: '', info: null },
  hq: { name: 'Patrol HQ', sign: 'POLICE', info: 0, note: 'Roll call starts every shift here.' },
  substation: { name: 'Substation', sign: 'POLICE', info: null, note: 'Your district station and patrol car.' },
  dispatch: { name: 'Dispatch Center', sign: 'DISPATCH', info: 2 },
  radio: { name: 'Radio Tower', sign: '', info: 2 },
  records: { name: 'Records · FCIC Terminal', sign: 'RECORDS', info: 3 },
  bank: { name: 'First Coast Bank', sign: 'BANK', info: 0 },
  diner: { name: 'Night Owl Diner', sign: 'DINER', info: null },
  garage: { name: 'City Garage', sign: 'PARK', info: 1 },
  gas: { name: 'Gas & Go', sign: 'GAS', info: 5 },
  mall: { name: 'Eastside Plaza', sign: 'PLAZA', info: 4 },
  motel: { name: 'Eastgate Motel', sign: 'MOTEL', info: 7 },
  autoshop: { name: 'Auto Shop', sign: 'AUTO', info: 6 },
  pharmacy: { name: 'Pharmacy', sign: 'Rx', info: null },
  pawn: { name: 'River Pawn', sign: 'PAWN', info: 13 },
  firestation: { name: 'Fire Station 3', sign: 'FIRE', info: 12 },
  stadium: { name: 'River Stadium', sign: '', info: 16 },
  church: { name: 'Community Church', sign: '', info: 8 },
  school: { name: 'Riverside School', sign: 'SCHOOL', info: 9 },
  warehouse: { name: 'Warehouse', sign: '', info: 17 },
  storage: { name: 'Storage Units', sign: 'STORAGE', info: 17 },
  railyard: { name: 'Rail Yard', sign: '', info: 18 },
  lumber: { name: 'Lumber Yard', sign: 'LUMBER', info: 18 },
  courthouse: { name: 'County Courthouse', sign: 'COURT', info: 19 },
  jail: { name: 'County Jail', sign: 'JAIL', info: 20 },
  sallyport: { name: 'Sally Port', sign: 'SALLY PORT', info: 20 },
  bonds: { name: 'Bail Bonds', sign: 'BONDS', info: 19 },
  defender: { name: 'Public Defender', sign: 'LAW', info: 19 }
};

// Dispatch calls per lesson: [title, priority, where (landmark kind or 'any'), radio line].
export const CALLS = {
  0: [['Proactive patrol: business district', 3, 'bank', 'Make a visible pass through the business district and check on business owners.'],
      ['Car with its dome light on in a closed lot', 2, 'parking', 'Caller reports a car parked in a closed lot with its dome light on.'],
      ['Neighborhood watch meeting', 3, 'any', 'Watch captain asks for an officer to stop by and talk about recent thefts.']],
  1: [['Suspicious person, hands in waistband', 2, 'any', 'Caller reports a man pacing and reaching into his waistband.'],
      ['Shots-fired report', 1, 'garage', 'Several calls about possible gunshots near the garage. Use cover on approach.']],
  2: [['Radio check: dead spot', 3, 'radio', 'Units report a dead spot near the tower. Check your radio and report back.'],
      ['Channel congestion on a priority call', 2, 'dispatch', 'A priority call is tying up the channel. Report to dispatch.']],
  3: [['Run a tag: possible stolen', 2, 'parking', 'A parked car may match a stolen-vehicle report. Run the tag and confirm any hit.'],
      ['Records request at the terminal', 3, 'records', 'Records needs you to verify a query you ran this morning.']],
  4: [['Burglary just occurred', 1, 'mall', 'Store owner says someone just ran from a smashed back door.'],
      ['Disturbance in progress', 2, 'motel', 'Loud argument in a motel room. Plan your approach and parking.']],
  5: [['Suspicious person at the pumps', 2, 'gas', 'Clerk reports a man asking customers for money and refusing to leave.']],
  6: [['Officer requests backup: traffic stop', 1, 'any', 'Unit on a stop with three occupants requests backup.']],
  7: [['Concerning statements by a former employee', 2, 'autoshop', 'Owner says a fired worker posted about "making them pay."']],
  8: [['Citizen needs assistance', 3, 'any', 'Lost visitor and a stalled car blocking a lane.'], ['Lockout call', 3, 'houses', 'Resident locked out with a child inside the car.']],
  9: [['Well-being check', 2, 'apartments', 'Daughter has not heard from her elderly mother in four days.'], ['Vacation security check', 3, 'houses', 'Homeowner away for a week asked for checks of the house.']],
  10: [['Death notification', 2, 'houses', 'Another agency asks you to notify the next of kin of a traffic death.']],
  11: [['Aggressive dog loose', 2, 'park', 'Large dog charging joggers in the park.'], ['Alligator in a pool', 2, 'houses', 'Homeowner reports an alligator in the backyard pool.']],
  12: [['Vehicle fire', 1, 'any', 'Car smoking heavily at the curb, driver out.'], ['Fire alarm activation', 2, 'school', 'Alarm sounding at the school after hours.']],
  13: [['Stolen TV at the pawn shop', 3, 'pawn', 'Pawn record matches a TV reported stolen last week.'], ['Wallet turned in', 3, 'church', 'Someone turned in a wallet found in the parking lot.']],
  14: [['Landlord-tenant lockout', 2, 'apartments', 'Tenant says the landlord changed the locks.'], ['Repossession dispute', 2, 'houses', 'Owner and recovery agent arguing over a car on the hook.']],
  15: [['Civil standby', 3, 'houses', 'A resident wants an officer present while she collects her belongings.']],
  16: [['Large crowd after the game', 2, 'stadium', 'Crowd growing in the stadium lot after a loss; some bottles thrown.']],
  17: [['Burglary alarm at a warehouse', 2, 'warehouse', 'Audible alarm, rear door. Alarm company has no key holder yet.'], ['Building search', 1, 'storage', 'Door pried open at the storage office. Suspect may still be inside.']],
  18: [['Suspect fled on foot', 1, 'railyard', 'Burglary suspect ran into the rail yard. Set a perimeter.'], ['Area search at the lumber yard', 2, 'lumber', 'Caller saw someone climb the fence into the lumber yard.']],
  19: [['Arrest on a warrant', 2, 'bonds', 'Confirmed warrant for a man outside the bail bonds office.'], ['Transport an arrestee', 2, 'courthouse', 'Courthouse deputies need an arrestee transported to the jail.']],
  20: [['Booking at the county jail', 2, 'jail', 'Bring your arrestee through the sally port for booking.']]
};

// "Something's off": spotted only when you walk or drive close. Each points at a lesson in the district.
export const OBSERVE = {
  0: [['A car idles in a closed lot at night', 'car'], ['A business door stands open after closing', 'door']],
  1: [['Someone keeps reaching toward his waistband', 'person'], ['A man watches you from a parked car', 'car']],
  2: [['Your radio is silent; no traffic at all', 'radio']],
  3: [['A tag looks swapped from another car', 'car']],
  4: [['Fresh pry marks on a back door', 'door']],
  5: [['A man stares at the pumps and paces', 'person']],
  6: [['A patrol car sits on a stop with lights on', 'car']],
  7: [['A note taped to a door reads "You will regret this"', 'door']],
  8: [['A senior seems lost at the bus stop', 'person']], 9: [['Mail piled up at a front door', 'door']],
  11: [['A dog with no collar limps near the road', 'person']], 12: [['Smoke from under a parked car\'s hood', 'car']],
  13: [['A bike leans unlocked for days', 'door']], 16: [['A crowd gathers and grows louder', 'person']],
  17: [['A warehouse side door is ajar', 'door']], 18: [['Footprints lead toward the fence', 'door']],
  19: [['A man walks away fast when he sees you', 'person']], 20: [['An arrestee\'s property bag is unsealed', 'door']]
};

export const SHIFTS = [
  { id: 'day', name: 'Day shift', hours: '0600–1800', start: 6, note: 'Daylight patrol' },
  { id: 'mid', name: 'Midshift', hours: '1300–0100', start: 13, note: 'Overlaps day and night shift' },
  { id: 'night', name: 'Night shift', hours: '1800–0600', start: 18, note: 'After dark' }
];
// who you can see on the street: midshift overlaps both other shifts
export const SEES = { day: ['day', 'mid'], mid: ['day', 'mid', 'night'], night: ['night', 'mid'] };
export const SHIFT_MIN = 720; // every shift is 12 hours

export const PHONETIC = ['Adam', 'Boy', 'Charles', 'David', 'Edward', 'Frank', 'George', 'Henry', 'Ida', 'John', 'King', 'Lincoln', 'Mary', 'Nora', 'Ocean', 'Paul', 'Queen', 'Robert', 'Sam', 'Tom', 'Union', 'Victor', 'William', 'Young', 'Zebra'];
export const QUICK = ['10-4', 'En route', 'On scene', 'Need backup', 'Code 4, all clear', 'Clear, back in service', 'Good job', 'Thanks for the assist', '👋'];
// same ranks and point steps as the study hub (called RP, Reputation Points, in the game): RP to reach rank L is 100 x L x (L - 1)
export const RANKS = ['Cadet', 'Squad Leader 4', 'Squad Leader 3', 'Squad Leader 2', 'Squad Leader 1', 'Guide', 'Vice President', 'President', 'State Certified', 'Graduate'].map((n, i) => [100 * (i + 1) * i, n]);

// Specialty units. Every cadet trains with one; it is shown as "(In Training)" everywhere.
// Stats are 1-5 and each unit's add up to 15. What they do in the game:
//   Response: walking and driving speed       Perception: how far away you spot "something's off"
//   Rapport: RP from citizens and study points  Composure: how long a call waits for you
//   Tactics: RP from priority 1 and 2 calls
export const STATS = [
  ['res', 'Response', 'Walk and drive faster'],
  ['per', 'Perception', 'Spot trouble from farther away'],
  ['rap', 'Rapport', 'More RP from citizens and study points'],
  ['com', 'Composure', 'Calls wait longer for you'],
  ['tac', 'Tactics', 'More RP from priority calls']
];
// kit: uniform look. ride: vehicle look and handling. fav: lessons whose calls pay the unit's bonus.
export const UNITS = [
  { id: 'patrol', name: 'Patrol', icon: '🚓', color: '#1d4ed8', st: { res: 3, per: 3, rap: 3, com: 3, tac: 3 },
    perk: 'Backbone of the department', perkText: 'Dispatch keeps you busy: calls come in 25% sooner and every call pays 10% more RP. Balanced at everything.', fav: [0, 1, 4, 6],
    kit: { shirt: '#22355e', pants: '#1b2a4a', hat: 'cap', hatCol: '#16213d', patch: '#f5b800' },
    ride: { kind: 'sedan', label: 'Marked patrol car', body: '#14171c', side: '#f2f2f2', stripe: null, bar: 'full', speed: 1.05, scale: 1.05, text: 'POLICE' } },
  { id: 'swat', name: 'SWAT', icon: '🛡️', color: '#4b5320', st: { res: 2, per: 3, rap: 1, com: 4, tac: 5 },
    perk: 'Entry team', perkText: 'Priority 1 calls pay 50% more RP. Building and area search calls come up more often.', fav: [17, 18, 1],
    kit: { shirt: '#3d4532', pants: '#2f3527', hat: 'helmet', hatCol: '#2b3022', vest: '#8a7a55', vestText: 'POLICE', patch: '#d8c99a' },
    ride: { kind: 'armored', label: 'Armored rescue vehicle', body: '#2f3527', side: '#3d4532', stripe: null, bar: 'grille', speed: .85, scale: 1.3 } },
  { id: 'k9', name: 'K9', icon: '🐕', color: '#b45309', st: { res: 4, per: 5, rap: 2, com: 2, tac: 2 },
    perk: 'Partner', perkText: 'Your dog walks with you and alerts on anything off from twice as far. Area search calls pay double.', fav: [18, 17, 5],
    kit: { shirt: '#1f2f50', pants: '#1f2f50', hat: 'cap', hatCol: '#1a2440', vest: null, patch: '#d4a017', badgeText: 'K-9' },
    ride: { kind: 'suv', label: 'K-9 SUV', body: '#f2f2f2', side: '#f2f2f2', stripe: '#b45309', bar: 'full', speed: 1.05, scale: 1.12, text: 'K-9' } },
  { id: 'neg', name: 'Crisis Negotiator', icon: '📞', color: '#0e7490', st: { res: 2, per: 2, rap: 5, com: 5, tac: 1 },
    perk: 'Talk it down', perkText: 'Disturbance, threat and dispute calls pay double RP. Calls wait the longest for you.', fav: [4, 7, 14, 15],
    kit: { shirt: '#1e3a5f', pants: '#5b5246', hat: 'headset', hatCol: '#111', vest: '#0e7490', vestText: 'NEGOTIATOR', patch: '#e0f2fe' },
    ride: { kind: 'suv', label: 'Unmarked SUV', body: '#1b1f27', side: '#262b35', stripe: null, bar: 'hidden', speed: 1, scale: 1.12 } },
  { id: 'marine', name: 'Marine Unit', icon: '⚓', color: '#0369a1', st: { res: 3, per: 4, rap: 2, com: 3, tac: 3 },
    perk: 'On the water', perkText: 'In Riverside you launch a patrol boat on the river. Animal and crowd calls pay double RP.', fav: [11, 16, 12],
    kit: { shirt: '#7aa7d6', pants: '#1f2f50', hat: 'boonie', hatCol: '#1f2f50', vest: '#f97316', vestText: '', patch: '#fff' },
    ride: { kind: 'truck', label: 'Marine unit truck', body: '#f2f2f2', side: '#f2f2f2', stripe: '#0369a1', bar: 'full', speed: 1, scale: 1.15, text: 'MARINE' } },
  { id: 'brt', name: 'Behavioral Resource', icon: '🤝', color: '#0d9488', st: { res: 2, per: 3, rap: 4, com: 5, tac: 1 },
    perk: 'Steady presence', perkText: 'Well-being checks and death notifications pay double RP and build twice the community trust.', fav: [9, 10, 8],
    kit: { shirt: '#14b8a6', pants: '#a8977a', hat: 'none', vest: null, patch: '#fff', lanyard: '#0d9488' },
    ride: { kind: 'sedan', label: 'Unmarked compact', body: '#e8e8e8', side: '#d4d4d4', stripe: '#0d9488', bar: 'hidden', speed: 1, scale: .95 } },
  { id: 'hoi', name: 'Homeless Initiative', icon: '🏠', color: '#65a30d', st: { res: 3, per: 3, rap: 5, com: 3, tac: 1 },
    perk: 'Outreach', perkText: 'Two extra citizens need you on every shift, and citizen contacts pay 50% more RP.', fav: [8, 13, 14],
    kit: { shirt: '#4d7c0f', pants: '#3f3a32', hat: 'cap', hatCol: '#365314', vest: null, patch: '#fef9c3' },
    ride: { kind: 'van', label: 'Outreach van', body: '#f8fafc', side: '#e2e8f0', stripe: '#65a30d', bar: 'full', speed: .95, scale: 1.22, text: 'OUTREACH' } },
  { id: 'det', name: 'Detective', icon: '🔎', color: '#6b7280', st: { res: 3, per: 5, rap: 3, com: 3, tac: 1 },
    perk: 'Investigator', perkText: 'One more "something\'s off" in every district, study points recharge twice as fast, and records and property calls pay double.', fav: [3, 13, 19],
    kit: { shirt: '#e5e7eb', pants: '#374151', hat: 'none', vest: null, tie: '#7f1d1d', plain: true, patch: '#f5b800' },
    ride: { kind: 'sedan', label: 'Unmarked sedan', body: '#5b616b', side: '#4b5058', stripe: null, bar: 'hidden', speed: 1.05, scale: 1 } },
  { id: 'sro', name: 'School Resource', icon: '🎓', color: '#7c3aed', st: { res: 2, per: 3, rap: 5, com: 3, tac: 2 },
    perk: 'Teach back', perkText: 'Study points pay double RP. School and well-being calls pay double.', fav: [9, 12, 8],
    kit: { shirt: '#22355e', pants: '#1b2a4a', hat: 'cap', hatCol: '#3b2a6b', vest: null, patch: '#c4b5fd' },
    ride: { kind: 'suv', label: 'School resource SUV', body: '#f2f2f2', side: '#f2f2f2', stripe: '#7c3aed', bar: 'full', speed: 1, scale: 1.12, text: 'SRO' } }
];
export const unitName = (u) => (u ? u.name : 'Patrol') + ' (In Training)';

import { NPCS2 } from './people2.js';
NPCS2.forEach((n) => { if (!NPCS.some((o) => o.id === n.id)) { const { v, ...rest } = n; NPCS.push(rest); } });
