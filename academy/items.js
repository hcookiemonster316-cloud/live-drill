// Items: found on the street, inside buildings and earned on calls.
// Ranks (rarity) from most common to rarest. Gear goes in a limited set of equipment slots and carries perks.
export const RARITY = {
  c: { name: 'Standard Issue', short: 'I', color: '#9ca3af', glow: '156,163,175', w: 55, notes: [523, 659] },
  u: { name: 'Squared Away', short: 'II', color: '#22c55e', glow: '34,197,94', w: 26, notes: [523, 659, 784] },
  r: { name: 'Inspection Ready', short: 'III', color: '#3b82f6', glow: '59,130,246', w: 12, notes: [523, 659, 784, 1047] },
  e: { name: 'Honor Guard', short: 'IV', color: '#a855f7', glow: '168,85,247', w: 5, notes: [440, 554, 659, 880, 1109] },
  l: { name: 'Academy Legend', short: 'V', color: '#f5b800', glow: '245,184,0', w: 2, notes: [392, 523, 659, 784, 1047, 1319] }
};
export const ORDER = ['c', 'u', 'r', 'e', 'l'];
// the cadet outfit: everybody has these; pick one in the locker or at roll call
export const OUTFITS = {
  std: { name: 'Academy Standard', icon: '👔', kit: { shirt: '#7c8189', pants: '#4b5320', hat: 'cap', hatCol: '#111827', patch: '#f5b800', boots: '#0b0b0b' }, look: { twinkle: true }, perk: { rap: 1 }, text: 'Ironed medium grey academy polo, ironed OD green BDU pants, black boots shined until they twinkle, belt, name tag and the baseball cap.' },
  pt: { name: 'Academy PT', icon: '🏃', kit: { shirt: '#c9cdd2', pants: '#111827', shorts: true, socks: '#111', hat: 'none', boots: '#111111', camelbak: true }, perk: { speed: 10 }, text: 'Light gray PT shirt (tucked), PT shorts, PT shoes, all-black ankle socks and a full CamelBak with your agency ID inside.' },
  unit: { name: 'Specialty Unit Kit', icon: '⭐', kit: null, perk: {}, text: 'Your specialty unit\'s training uniform.' }
};
// equipment slots: limited, and two of them open up as you rank up (RP needed)
export const SLOTS = [
  { id: 'cover', name: 'Cover', icon: '🧢', need: 0, hint: 'Headwear' },
  { id: 'uniform', name: 'Uniform', icon: '👔', need: 0, hint: 'Shirt, vest, brass' },
  { id: 'boots', name: 'Boots', icon: '🥾', need: 0, hint: 'Footwear' },
  { id: 'belt', name: 'Duty Belt', icon: '🔦', need: 600, hint: 'Opens at Squad Leader 3' },
  { id: 'carry', name: 'Pocket & Carry', icon: '🎒', need: 3000, hint: 'Opens at Guide' }
];
// perk keys: stat bonuses (res per rap com tac), speed/drive/light (%), spot/secret/explore (tiles),
// loot (% item chance), wait (game minutes a call waits), rpCall/rpCit/rpStudy (% more RP)
export const PERK_TEXT = {
  res: (v) => (v > 0 ? '+' : '') + v + ' Response', per: (v) => (v > 0 ? '+' : '') + v + ' Perception', rap: (v) => (v > 0 ? '+' : '') + v + ' Rapport', com: (v) => (v > 0 ? '+' : '') + v + ' Composure', tac: (v) => (v > 0 ? '+' : '') + v + ' Tactics',
  speed: (v) => (v > 0 ? '+' : '') + v + '% walking speed', drive: (v) => (v > 0 ? '+' : '') + v + '% driving speed', light: (v) => '+' + v + '% flashlight reach',
  spot: (v) => 'Spot trouble ' + v + ' tile' + (v === 1 ? '' : 's') + ' farther', secret: (v) => 'Sense secret spots ' + v + ' tiles farther', explore: (v) => 'Map ' + v + ' more tile' + (v === 1 ? '' : 's') + ' around you',
  loot: (v) => '+' + v + '% chance to find items', wait: (v) => (v > 0 ? 'Calls wait ' + v + ' more minutes' : 'Calls wait ' + -v + ' fewer minutes'), rpCall: (v) => '+' + v + '% RP from calls', rpCit: (v) => '+' + v + '% RP from citizens', rpStudy: (v) => '+' + v + '% RP from study points', rpSquad: (v) => '+' + v + '% squad RP bonus'
};
export const ITEMS = [
  // ---- cover ----
  { id: 'cap', r: 'c', icon: '🧢', name: 'Academy Baseball Cap', slot: 'cover', look: { hat: 'cap', hatCol: '#111827' }, perk: { com: 1 }, text: 'Issued. Slightly crushed from riding in the duty bag. Still regulation.' },
  { id: 'sweatband', r: 'c', icon: '🎽', name: 'Sweatband of Determination', slot: 'cover', look: { hat: 'sweatband', hatCol: '#d22d3d' }, perk: { speed: 5 }, text: 'Worn during every PT run. Has absorbed things no one should talk about.' },
  { id: 'reflectcap', r: 'u', icon: '🧢', name: 'Reflective Night Cap', slot: 'cover', look: { hat: 'cap', hatCol: '#d4ff3a' }, perk: { light: 15, per: 1 }, text: 'Bright enough that moths file complaints.' },
  { id: 'boonie2', r: 'r', icon: '👒', name: 'Boonie Hat of the Bayou', slot: 'cover', look: { hat: 'boonie', hatCol: '#556b2f' }, perk: { spot: 1, per: 1, explore: 1 }, text: 'Smells like swamp and adventure. Mostly swamp.' },
  { id: 'campaign', r: 'e', icon: '🤠', name: 'Campaign Hat, Perfectly Blocked', slot: 'cover', look: { hat: 'campaign', hatCol: '#7a5a3a' }, perk: { com: 1, tac: 1, wait: 15 }, text: 'Four perfect dents. Brim level with the horizon. Cadets straighten up when they see it.' },
  { id: 'drillhat', r: 'l', icon: '🎩', name: "The Instructor's Campaign Hat", slot: 'cover', look: { hat: 'campaign', hatCol: '#3d2a14', glow: true }, perk: { com: 2, tac: 1, rpCall: 15 }, text: 'Somehow it is louder than the instructor. It does not need to say anything. You already did push-ups.' },
  // ---- uniform ----
  { id: 'vest', r: 'c', icon: '🦺', name: 'Reflective Vest, Size XXXL', slot: 'uniform', look: { vest: 'xxxl' }, perk: { light: 10, spot: 1 }, text: 'The only size left in the supply closet. You are now visible from space.' },
  { id: 'nametag', r: 'c', icon: '🏷️', name: 'Name Tag, Perfectly Centered', slot: 'uniform', perk: { rap: 1 }, text: 'Measured with a ruler. Twice. The instructor checked it with a ruler. Three times.' },
  { id: 'poncho', r: 'c', icon: '🌧️', name: 'Issued Poncho', slot: 'uniform', look: { poncho: true }, perk: { explore: 1, com: 1 }, text: 'Keeps you dry. Makes you look like a very sad green tent.' },
  { id: 'stays', r: 'u', icon: '📎', name: 'Four Shirt Stays', slot: 'uniform', perk: { com: 1, rpCall: 5 }, text: 'They pinch. They pull. Your shirt has never been this tucked in its life.' },
  { id: 'creases', r: 'u', icon: '👔', name: 'Razor-Sharp Creases', slot: 'uniform', perk: { rap: 1, rpCit: 10 }, text: 'Starched so hard the shirt can stand at attention without you.' },
  { id: 'gig', r: 'u', icon: '📏', name: 'A Perfect Gig Line', slot: 'uniform', perk: { com: 1, rpCall: 5 }, text: 'Shirt seam, belt buckle and zipper in one flawless line. Geometry teachers weep.' },
  { id: 'brass', r: 'r', icon: '✨', name: 'Mirror-Finish Brass', slot: 'uniform', look: { brass: true }, perk: { rap: 1, tac: 1 }, text: 'Polished until it reflects your entire life story. Mostly the part where you were polishing brass.' },
  { id: 'classa', r: 'e', icon: '🎖️', name: 'Class A Uniform, Freshly Pressed', slot: 'uniform', look: { brass: true, cord: '#c0c0c0' }, perk: { rap: 1, com: 1, rpCall: 10, rpCit: 10 }, text: 'For graduations, funerals and the one day the chief walks through. Lint fears it.' },
  { id: 'cord', r: 'l', icon: '🏅', name: 'The Honor Graduate Cord', slot: 'uniform', look: { cord: '#f5b800', brass: true }, perk: { res: 1, per: 1, rap: 1, com: 1, tac: 1, loot: 10 }, text: 'Gold, braided and earned. Every instructor nods at you now. Several of them mean it.' },
  // ---- boots ----
  { id: 'brokenin', r: 'c', icon: '👞', name: 'Finally Broken-In Boots', slot: 'boots', perk: { speed: 5 }, text: 'Six weeks of blisters. Worth it. Do not ask about week three.' },
  { id: 'bootbands', r: 'c', icon: '🔗', name: 'Boot Bands (Pair)', slot: 'boots', perk: { com: 1, speed: 3 }, text: 'Your BDU pants are now bloused to perfection. Mostly. One leg is winning.' },
  { id: 'runners', r: 'u', icon: '👟', name: 'Running Shoes (Not Regulation)', slot: 'boots', look: { boots: '#e5e7eb' }, perk: { speed: 14, com: -1 }, text: 'Very fast. Very comfortable. Very much noticed by the instructor.' },
  { id: 'wetboots', r: 'u', icon: '🥾', name: 'Actually Waterproof Boots', slot: 'boots', perk: { speed: 6, explore: 1 }, text: 'The label said waterproof. For once, the label was right.' },
  { id: 'spitshine', r: 'r', icon: '🥾', name: 'Spit-Shined Boots', slot: 'boots', look: { shine: 1 }, perk: { speed: 8, rap: 1 }, text: 'Two hours, one cotton ball, a lighter and a lot of patience.' },
  { id: 'boots', r: 'l', icon: '🥾', name: 'Unnaturally Shiny Boots', slot: 'boots', look: { shine: 3 }, perk: { speed: 12, rap: 2, light: 15 }, text: 'Shined past the point of physics. Birds land on them thinking they are lakes. They light up dark alleys.' },
  // ---- duty belt ----
  { id: 'flashlight', r: 'c', icon: '🔦', name: 'Spare Flashlight', slot: 'belt', perk: { light: 20 }, text: 'The batteries are from the junk drawer. It flickers with personality.' },
  { id: 'keepers', r: 'u', icon: '🪢', name: 'Utility Belt, Inner Belt and Four Straps', slot: 'belt', perk: { tac: 1, rpCall: 5 }, text: 'Inner belt on, utility belt over it, all four belt straps snapped. Nothing jingles. Nothing.' },
  { id: 'earpiece', r: 'u', icon: '🎧', name: 'Radio Ear Piece', slot: 'belt', perk: { per: 1, wait: 10 }, text: 'Dispatch, now directly inside your skull. Very calming. Mostly.' },
  { id: 'firstaid', r: 'u', icon: '🩹', name: 'First Aid Bag', slot: 'belt', perk: { rap: 1, wait: 15 }, text: 'Gauze, gloves, bandages and a tiny pair of scissors that cannot cut anything.' },
  { id: 'radiokit', r: 'r', icon: '📡', name: 'Radio, Two Batteries and the Antenna', slot: 'belt', perk: { com: 1, tac: 1, wait: 20 }, text: 'The complete set. Nobody in your class has had all three at the same time. Until today.' },
  { id: 'radio', r: 'u', icon: '📻', name: 'Radio with a Fresh Battery', slot: 'belt', perk: { com: 1, wait: 10 }, text: 'Fully charged at the start of shift. A rare and beautiful thing.' },
  { id: 'tacflash', r: 'r', icon: '🔦', name: 'Tactical Flashlight', slot: 'belt', perk: { light: 40, per: 1 }, text: 'Bright enough to find car keys on the moon.' },
  { id: 'goldkeeper', r: 'e', icon: '🔗', name: 'The Golden Keeper', slot: 'belt', perk: { tac: 2, rpCall: 15 }, text: 'Legend says it has never come unsnapped. Not once. Not even during PT.' },
  // ---- pocket & carry ----
  { id: 'pen', r: 'c', icon: '🖊️', name: 'The Issued Pen', slot: 'carry', perk: { rpStudy: 10 }, text: 'The one pen you are allowed to use. Lose it and you get to explain why, in writing, with a different pen.' },
  { id: 'pocket', r: 'c', icon: '👖', name: 'A Dropped Pocket', slot: 'carry', perk: { loot: 3 }, text: 'One pocket flap, unbuttoned. Your instructor spotted it from across the parking lot. Your instructor spots everything.' },
  { id: 'notebook', r: 'c', icon: '📓', name: 'Two Notepads (Legal Pad and Notebook)', slot: 'carry', perk: { rpStudy: 5, explore: 1 }, text: 'One for notes. One for notes about the notes. Half of it is doodles of the instructor.' },
  { id: 'camelbak', r: 'u', icon: '🎒', name: 'Full CamelBak (Agency ID Inside)', slot: 'carry', look: { camelbak: true }, perk: { speed: 6, com: 1 }, text: 'Hydrated and identified. Lose it and you lose your ID. Do not lose it.' },
  { id: 'rsa', r: 'u', icon: '🔢', name: 'The RSA Token', slot: 'carry', perk: { rpStudy: 15 }, text: 'Six numbers that change every sixty seconds. You will type it wrong twice. Everyone does.' },
  { id: 'laptop', r: 'r', icon: '💻', name: 'Laptop, Charger AND Mouse', slot: 'carry', perk: { rpStudy: 20, per: 1 }, text: 'All three. Same bag. Same day. The instructors are speechless.' },
  { id: 'textbooks', r: 'e', icon: '📚', name: 'Both Textbooks', slot: 'carry', perk: { rpStudy: 30, rpCall: 10, speed: -5 }, text: 'Heavy enough to count as PT. Smart enough to count as studying.' },
  { id: 'carkit', r: 'r', icon: '🚗', name: 'The Backup Kit in Your Car', slot: 'carry', perk: { com: 2 }, text: 'Grey polo, two PT shirts, BDU pants, PT shorts, both kinds of black socks. Spill whatever you want.' },
  { id: 'phonetic', r: 'u', icon: '🪪', name: 'Laminated Phonetic Card', slot: 'carry', perk: { com: 1, wait: 10 }, text: 'Alpha, Bravo, Charlie, Delta... You will recite these in your sleep. Your family has noticed.' },
  { id: 'clipboard', r: 'u', icon: '📋', name: 'Clipboard of Authority', slot: 'carry', look: { clipboard: true }, perk: { rap: 1, secret: 1 }, text: 'Carry it, walk with purpose and nobody will ever ask what you are doing here.' },
  { id: 'coin', r: 'r', icon: '🪙', name: 'Lucky Challenge Coin', slot: 'carry', perk: { loot: 8, rap: 1 }, text: 'Slap it on the table and somebody owes you a coffee. Those are the rules.' },
  { id: 'nod', r: 'e', icon: '🫡', name: "The Instructor's Approving Nod", slot: 'carry', perk: { com: 2, rpCall: 10 }, text: 'Witnessed exactly once. Might have been a sneeze. You carry it with you anyway.' },
  { id: 'dingle', r: 'l', icon: '🔔', name: 'A Dingle Dingle', slot: 'carry', perk: { loot: 15, secret: 2, rpCall: 5, rpCit: 5, rpStudy: 5 }, text: 'Nobody can explain exactly what it is. Everybody knows exactly when it happens.' },
  // ---- use (one shot) ----
  { id: 'granola', r: 'c', icon: '🍫', name: 'Mystery Granola Bar', kind: 'use', effect: 'morale', text: 'Found at the bottom of your duty bag. Expiration date: yes.', useText: 'Tastes like cardboard and determination. Morale +1. Everything else +0.' },
  { id: 'lunchbox', r: 'c', icon: '🍱', name: 'Dark Lunchbox', kind: 'use', effect: 'morale', text: 'As required: dark. Contents: whatever you packed at 0430 with your eyes closed.', useText: 'A cold sandwich and two granola bars. Morale +2. Composure restored.' },
  { id: 'pizza', r: 'c', icon: '🍕', name: 'Cold Pizza Slice', kind: 'use', effect: 'morale', text: 'From the break room. Pepperoni. Origin: unknown. Age: a mystery.', useText: 'Still good. Somehow. Morale +2.' },
  { id: 'coffee', r: 'c', icon: '☕', name: 'Gas Station Coffee', kind: 'use', effect: 'coffee', text: 'Brewed at some point this week. Tastes like burnt hope. Works anyway.', useText: 'Caffeinated: your next calls wait an extra hour for you.' },
  { id: 'shake', r: 'u', icon: '🥤', name: 'Pumpkin Spice Protein Shake', kind: 'use', effect: 'shake', text: 'Forty-two grams of protein, one autumn candle of flavor and a single tiny regret.', useText: 'Pumpkin rush: you move 25% faster for the next three hours of your shift.' },
  { id: 'batteries', r: 'u', icon: '🔋', name: 'Fresh Flashlight Batteries', kind: 'use', effect: 'light', text: 'Not the ones from the junk drawer. Real ones. Still in the package.', useText: 'Bright idea: your light reaches 50% farther for the rest of this shift.' },
  { id: 'energy', r: 'r', icon: '⚡', name: 'Suspicious Energy Drink', kind: 'use', effect: 'energy', text: 'The can just says "ENERGY" in a font that is yelling at you.', useText: 'Your heart is now a drum solo. 40% faster for the next two hours.' },
  { id: 'pot', r: 'l', icon: '🫖', name: 'The Coffee Pot That Never Empties', kind: 'use', effect: 'pot', reuse: true, text: 'Passed down from class to class. Nobody has ever seen it get refilled. Nobody asks.', useText: 'Bottomless: your next calls wait an extra hour, again, forever.' },
  // ---- keepsakes ----
  { id: 'highlighter', r: 'c', icon: '🖍️', name: 'Half-Dead Highlighter', kind: 'keep', text: 'Every line of the Vehicle Operations chapter is now yellow. Every. Single. Line. Highlighting has lost all meaning.' },
  { id: 'lint', r: 'c', icon: '🧻', name: 'Emergency Lint Roller', kind: 'keep', text: 'For the 0559 realization that your uniform is 40% dog hair.' },
  { id: 'seeds', r: 'c', icon: '🌻', name: 'Sunflower Seeds', kind: 'keep', text: 'Official fuel of long patrols. The shells in the cupholder are now evidence.' },
  { id: 'socks', r: 'c', icon: '🧦', name: 'All-Black Crew Socks', kind: 'keep', text: 'Not navy. Not charcoal. Black. The instructor carries a flashlight for this exact reason.' },
  { id: 'shower', r: 'u', icon: '🧴', name: 'Shower Kit (Shower Shoes Included)', kind: 'keep', text: 'Soap, deodorant, cologne, a towel and shower shoes. Never, ever forget the shower shoes.' },
  { id: 'garment', r: 'e', icon: '🧳', name: 'The Garment Bag', kind: 'keep', text: 'Ironed polo, ironed BDUs, two shined boots, two boot bands, four shirt stays, a belt, black crew socks, a vest and a radio ear piece. It weighs as much as you do.' },
  { id: 'report', r: 'r', icon: '📝', name: 'The Report With No Typos', kind: 'keep', text: 'Spellcheck had nothing to say. Your sergeant had nothing to say. A historic day.' },
  { id: 'pushup', r: 'e', icon: '💪', name: 'The Golden Push-Up', kind: 'keep', text: 'Chest to the deck, full lockout, zero sag. Nobody was watching. Of course nobody was watching.' },
  { id: 'cert', r: 'l', icon: '🎓', name: 'Laminated Certificate (Practice Copy)', kind: 'keep', text: 'Not the real one. The real one comes after State. This one is for believing in yourself.' }
];
ITEMS.forEach((x) => { if (x.slot) x.kind = 'gear'; });

// ---------- expansion: more gear, snacks and keepsakes ----------
ITEMS.push(
  // cover
  { id: 'helmetpt', r: 'c', icon: '⛑️', name: 'Bike Helmet, Slightly Dented', slot: 'cover', look: { hat: 'helmet', hatCol: '#e5e7eb' }, perk: { com: 1, explore: 1 }, text: 'Bike patrol orientation. The dent is from the bike rack, not a crash. Mostly.' },
  { id: 'beanie', r: 'c', icon: '🧶', name: 'Regulation Black Beanie', slot: 'cover', look: { hat: 'cap', hatCol: '#0b0b0b' }, perk: { com: 1 }, text: 'Approved for temperatures below 60 degrees, which in Florida happens twice a year.' },
  { id: 'sunvisor', r: 'c', icon: '🧢', name: 'Range Day Visor', slot: 'cover', look: { hat: 'sweatband', hatCol: '#f5b800' }, perk: { per: 1 }, text: 'Shades your eyes and absolutely nothing else. Your scalp has been sunburned in a perfect stripe.' },
  { id: 'headsetpro', r: 'u', icon: '🎧', name: 'Noise-Canceling Dispatch Headset', slot: 'cover', look: { hat: 'headset' }, perk: { com: 1, wait: 10 }, text: 'Borrowed from Velvet. She will know if it comes back with a scratch. She will know.' },
  { id: 'capgold', r: 'u', icon: '🧢', name: 'Cap with Gold Piping', slot: 'cover', look: { hat: 'cap', hatCol: '#1e3a8a' }, perk: { rap: 1, rpCit: 5 }, text: 'A tiny gold line. Somehow everyone stands up straighter around it.' },
  { id: 'rainhat', r: 'u', icon: '🌧️', name: 'Rain Cover for the Campaign Hat', slot: 'cover', look: { hat: 'campaign', hatCol: '#6b7280' }, perk: { explore: 2, com: 1 }, text: 'A plastic shower cap for a very important hat. Nobody laughs. Not out loud.' },
  { id: 'marinecap', r: 'r', icon: '⚓', name: 'Harbor Patrol Cap', slot: 'cover', look: { hat: 'cap', hatCol: '#0e7490' }, perk: { drive: 10, per: 1, explore: 1 }, text: 'Salt-stained, sun-faded and smells faintly of Captain Hal\'s coffee.' },
  { id: 'swathelm', r: 'r', icon: '🪖', name: 'Training Helmet, Marked "SIM"', slot: 'cover', look: { hat: 'helmet', hatCol: '#1f2937' }, perk: { tac: 1, com: 1, wait: 10 }, text: 'Stenciled SIM in big letters so nobody forgets: every round in here is a training round.' },
  { id: 'k9cap', r: 'r', icon: '🐕', name: 'K9 Handler Cap (Fur Included)', slot: 'cover', look: { hat: 'cap', hatCol: '#78350f' }, perk: { spot: 2, per: 1 }, text: 'Comes pre-coated in dog hair. The lint roller has given up.' },
  { id: 'castillohat', r: 'e', icon: '🤠', name: "Sgt. Castillo's Spare Campaign Hat", slot: 'cover', look: { hat: 'campaign', hatCol: '#5b3a1e' }, perk: { com: 2, rpCall: 10, wait: 10 }, text: 'She says it is a loan. She says it every time she sees you. She sees you a lot.' },
  { id: 'halo', r: 'l', icon: '😇', name: 'The Halo of Perfect Attendance', slot: 'cover', look: { hat: 'cap', hatCol: '#fff3b0', glow: true }, perk: { rap: 2, com: 1, rpCit: 15, rpStudy: 10 }, text: 'Zero tardies. Zero absences. Zero excuses. It hums faintly at 0559.' },
  // uniform
  { id: 'polo2', r: 'c', icon: '👕', name: 'Backup Grey Polo (Car Copy)', slot: 'uniform', perk: { com: 1 }, text: 'Lives in your trunk for emergencies. The emergency was coffee. It is always coffee.' },
  { id: 'ptshirt2', r: 'c', icon: '👕', name: 'Second PT Shirt, Tucked', slot: 'uniform', perk: { speed: 4 }, text: 'Tucked so firmly it is now load-bearing.' },
  { id: 'raincoat', r: 'c', icon: '🧥', name: 'Rain Jacket That Is Mostly Zipper', slot: 'uniform', look: { poncho: true }, perk: { explore: 1, light: 5 }, text: 'Forty percent jacket, sixty percent zipper. Loud enough to announce your arrival.' },
  { id: 'lanyard', r: 'u', icon: '🪪', name: 'Academy ID on a Breakaway Lanyard', slot: 'uniform', perk: { rap: 1, secret: 1 }, text: 'Breakaway, because safety. It breaks away every time you lean over. Every. Time.' },
  { id: 'hivis', r: 'u', icon: '🦺', name: 'Traffic Vest That Actually Fits', slot: 'uniform', look: { vest: true }, perk: { light: 15, spot: 1, drive: 5 }, text: 'Not XXXL. A true miracle of supply.' },
  { id: 'pressed', r: 'u', icon: '🧺', name: 'Polo Pressed by Mr. Kim', slot: 'uniform', perk: { rap: 1, rpCit: 8 }, text: 'Spin City Laundromat\'s finest. He refused payment. He accepted a thank-you note.' },
  { id: 'patchset', r: 'r', icon: '🎽', name: 'Every Specialty Unit Patch', slot: 'uniform', perk: { per: 1, tac: 1, rpCall: 8 }, text: 'SWAT, K9, Marine, Negotiator and the rest, sewn on in a careful row. Someone used a ruler.' },
  { id: 'medals', r: 'r', icon: '🎖️', name: 'Practice Ribbon Rack', slot: 'uniform', look: { brass: true }, perk: { rap: 1, com: 1, rpCit: 5 }, text: 'Ribbons for perfect attendance, perfect inspection and perfect parallel parking.' },
  { id: 'negvest', r: 'e', icon: '🗣️', name: 'Crisis Negotiator Training Vest', slot: 'uniform', look: { vest: true }, perk: { rap: 2, com: 2, wait: 20 }, text: 'Pocket for a notepad, pocket for a phone, pocket for patience. The patience pocket is the biggest.' },
  { id: 'dress', r: 'l', icon: '🎗️', name: 'Graduation Dress Blues (Pressed Tonight)', slot: 'uniform', look: { brass: true, cord: '#f5b800', glow: true }, perk: { rap: 2, com: 2, tac: 1, rpCall: 15, rpCit: 15 }, text: 'Hanging in plastic, guarded like evidence. You are not allowed to sit down in them.' },
  // boots
  { id: 'jungle', r: 'c', icon: '🥾', name: 'Jungle Boots (Previously Loved)', slot: 'boots', perk: { speed: 4, explore: 1 }, text: 'Drainage holes. Canvas sides. A name written inside that is not yours.' },
  { id: 'insoles', r: 'c', icon: '🦶', name: 'Gel Insoles', slot: 'boots', perk: { speed: 6, com: -1 }, text: 'Your feet feel like clouds. Your boots squeak like a duck.' },
  { id: 'showershoes', r: 'u', icon: '🩴', name: 'Shower Shoes (Never Forget)', slot: 'boots', look: { boots: '#1f2937' }, perk: { secret: 1, speed: 2 }, text: 'Required equipment. Wearing them on patrol is not recommended. You are doing it anyway.' },
  { id: 'trailrunners', r: 'u', icon: '👟', name: 'PT Shoes, Broken In', slot: 'boots', look: { boots: '#111111' }, perk: { speed: 10 }, text: 'Fourteen miles of track this month. They know the way around the oval on their own.' },
  { id: 'bootcandle', r: 'r', icon: '🕯️', name: 'Boots Shined by Candlelight', slot: 'boots', look: { shine: 2 }, perk: { speed: 8, rap: 1, light: 8 }, text: 'Midnight, one candle, one tin of polish, zero regrets.' },
  { id: 'paradeboots', r: 'e', icon: '🥾', name: 'Parade Boots (Do Not Walk In)', slot: 'boots', look: { shine: 3 }, perk: { rap: 2, rpCit: 10, speed: -4 }, text: 'Too shiny to scuff. Too stiff to bend. Perfect for standing completely still and looking amazing.' },
  { id: 'cloudboots', r: 'l', icon: '☁️', name: 'Boots That Never Get Blisters', slot: 'boots', look: { shine: 2, glow: true }, perk: { speed: 16, res: 1, com: 1 }, text: 'Scientists cannot explain them. Podiatrists want to study them. You just want to keep them.' },
  // duty belt
  { id: 'cuffkey', r: 'c', icon: '🗝️', name: 'Spare Training Cuff Key', slot: 'belt', perk: { tac: 1 }, text: 'Tiny, silver and always in the last pocket you check.' },
  { id: 'glovepouch', r: 'c', icon: '🧤', name: 'Glove Pouch (Six Pairs)', slot: 'belt', perk: { com: 1, rpCall: 3 }, text: 'You will need a seventh pair. You always need a seventh pair.' },
  { id: 'whistle', r: 'c', icon: '📯', name: 'Traffic Whistle', slot: 'belt', perk: { drive: 5, spot: 1 }, text: 'One blast: stop. Two blasts: go. Three blasts: you dropped it again.' },
  { id: 'tourniquet', r: 'u', icon: '🩹', name: 'Training Tourniquet', slot: 'belt', perk: { com: 1, wait: 12 }, text: 'Practiced one-handed, left-handed and blindfolded. Your instructor is still not satisfied.' },
  { id: 'trainingtaser', r: 'u', icon: '🟨', name: 'Bright Yellow Training Shell', slot: 'belt', perk: { tac: 1, com: 1 }, text: 'Bright yellow so everyone knows it is a training tool. It does nothing. That is the point.' },
  { id: 'baton', r: 'u', icon: '🏑', name: 'Foam Training Baton', slot: 'belt', perk: { tac: 1, res: 1 }, text: 'Used for practicing stances. Mostly used for dramatic pointing.' },
  { id: 'simholster', r: 'r', icon: '🔷', name: 'Blue Simulation Trainer', slot: 'belt', perk: { tac: 2, rpCall: 5 }, text: 'Solid blue, solid plastic, and it says SIM on both sides. The only kind of tool allowed in Patrol City.' },
  { id: 'multitool', r: 'r', icon: '🛠️', name: 'Multitool With 27 Functions', slot: 'belt', perk: { secret: 2, loot: 5 }, text: 'Twenty-six of them are tiny screwdrivers. The twenty-seventh is a tiny saw nobody can unfold.' },
  { id: 'radioclip', r: 'r', icon: '📡', name: 'Shoulder Mic That Never Falls Off', slot: 'belt', perk: { com: 1, wait: 25 }, text: 'The clip is held on by sheer stubbornness and one zip tie.' },
  { id: 'velvetmic', r: 'e', icon: '🎙️', name: "Velvet's Lucky Radio Mic", slot: 'belt', perk: { com: 2, wait: 30, rpCall: 8 }, text: 'Thirty-one years of calm. Somehow it lowers your heart rate when you key up.' },
  { id: 'beltgold', r: 'l', icon: '🥇', name: 'The Belt That Passed Inspection', slot: 'belt', look: { brass: true, glow: true }, perk: { tac: 2, com: 2, rpCall: 15, wait: 20 }, text: 'Every keeper snapped, every pouch aligned, nothing jingles. Instructors still talk about it.' },
  // pocket & carry
  { id: 'chapstick', r: 'c', icon: '💄', name: 'Emergency Lip Balm', slot: 'carry', perk: { rap: 1 }, text: 'Florida sun versus your lips. The lips were losing.' },
  { id: 'sharpie', r: 'c', icon: '🖊️', name: 'Permanent Marker (Not the Pen)', slot: 'carry', perk: { rpStudy: 5, secret: 1 }, text: 'Not allowed for notes. Allowed for labeling everything you own so it comes back.' },
  { id: 'snackbag', r: 'c', icon: '🥜', name: 'Bag of Trail Mix (Raisins Removed)', slot: 'carry', perk: { speed: 3, com: 1 }, text: 'Someone picked out every raisin. You suspect Pike.' },
  { id: 'citationbook', r: 'u', icon: '📒', name: 'Practice Citation Book', slot: 'carry', perk: { rpCall: 6, per: 1 }, text: 'Filled with practice tickets written to fictional people named Mr. Example.' },
  { id: 'mapbook', r: 'u', icon: '🗺️', name: 'Port Meridian Street Atlas (2009)', slot: 'carry', perk: { explore: 2, drive: 5 }, text: 'Out of date, dog-eared and somehow more reliable than your phone.' },
  { id: 'umbrella', r: 'u', icon: '☂️', name: 'Compact Umbrella', slot: 'carry', perk: { com: 1, explore: 1 }, text: 'Technically not uniform. Technically keeps your uniform dry. The technicalities are being debated.' },
  { id: 'flashcards', r: 'u', icon: '🗂️', name: 'Vehicle Ops Flashcards (Rubber-Banded)', slot: 'carry', perk: { rpStudy: 18 }, text: 'Five hundred cards. One rubber band. One day it will snap, and it will be glorious.' },
  { id: 'squadpatch', r: 'r', icon: '🛡️', name: 'Squad Morale Patch', slot: 'carry', perk: { rpSquad: 15, rap: 1 }, text: 'Your squad voted on the design. It took three hours. It is a raccoon holding a flashlight.' },
  { id: 'bodycamtrainer', r: 'r', icon: '📹', name: 'Training Body Cam (Lens Cap Off)', slot: 'carry', perk: { per: 1, rpCall: 8, rpCit: 5 }, text: 'Every scenario recorded for review. Your instructor has a highlight reel. You are in it.' },
  { id: 'thermos', r: 'r', icon: '🧉', name: 'Night Shift Thermos', slot: 'carry', perk: { wait: 20, light: 10 }, text: 'Keeps coffee hot for nine hours. Keeps hands warm for one.' },
  { id: 'gusreel', r: 'e', icon: '🎣', name: "Old Gus's Lucky Fishing Lure", slot: 'carry', perk: { loot: 12, secret: 2, per: 1 }, text: 'Gus swears it caught a forty-pound redfish in 1987. The redfish has not been reached for comment.' },
  { id: 'squadflag', r: 'e', icon: '🚩', name: 'Pocket Squad Guidon', slot: 'carry', perk: { rpSquad: 25, com: 1, rap: 1 }, text: 'A tiny flag on a tiny pole. Your squad follows it everywhere, including into the wrong building once.' },
  { id: 'binder', r: 'l', icon: '📘', name: 'The Binder (Color-Coded, Tabbed, Laminated)', slot: 'carry', perk: { rpStudy: 35, rpCall: 10, per: 1, com: 1 }, text: 'Navarro\'s magnum opus. She let you borrow it. Do not spill on it. Do not breathe on it.' },
  // use
  { id: 'hotdog', r: 'c', icon: '🌭', name: "Delgado's Hot Dog (Paid For)", kind: 'use', effect: 'morale', text: 'Two dollars, aggressive mustard, zero strings attached.', useText: 'Delicious and ethical. Morale +2.' },
  { id: 'donut', r: 'c', icon: '🍩', name: 'A Single Donut, Bravely Ignored', kind: 'use', effect: 'morale', text: 'From The Donut Stop. You know the jokes. You are eating it anyway.', useText: 'Sprinkles. Morale +2. The jokes are louder now.' },
  { id: 'water', r: 'c', icon: '💧', name: 'Ice-Cold Water Bottle', kind: 'use', effect: 'shake', text: 'Hydration is a uniform item. Your instructor said so. Loudly.', useText: 'Refreshed: you move 25% faster for a while.' },
  { id: 'taco', r: 'c', icon: '🌮', name: "Lupe's Lunch Pail Taco", kind: 'use', effect: 'morale', text: 'Diesel the dog wanted this taco. Diesel cannot have this taco.', useText: 'Perfect. Morale +3. Somewhere, a dog is sad.' },
  { id: 'gum', r: 'c', icon: '🍬', name: 'Spearmint Gum (Not in Formation)', kind: 'use', effect: 'coffee', text: 'Chewing in formation is a push-up offense. Chewing on patrol keeps you sharp.', useText: 'Minty focus: your calls wait a little longer for you.' },
  { id: 'electrolyte', r: 'u', icon: '🧃', name: 'Electrolyte Drink, Blue Flavor', kind: 'use', effect: 'energy', text: 'The flavor is not a fruit. The flavor is the color blue.', useText: 'Electrified: 40% faster for the next two hours.' },
  { id: 'flashpack', r: 'u', icon: '🔋', name: 'Rechargeable Battery Pack', kind: 'use', effect: 'light', text: 'Fully charged. You checked twice. You will check again.', useText: 'Your light reaches 50% farther for the rest of the shift.' },
  { id: 'espresso', r: 'u', icon: '☕', name: 'Objection! Espresso Double Shot', kind: 'use', effect: 'coffee', text: 'Brewed by people who drink coffee during closing arguments.', useText: 'Sustained: your calls wait an extra hour for you.' },
  { id: 'lemonbar', r: 'r', icon: '🍋', name: "Grandma Ruth's Lemon Bar", kind: 'use', effect: 'energy', text: 'From the neighborhood watch meeting. Nobody skips a meeting with lemon bars.', useText: 'Powdered sugar power: 40% faster for two hours.' },
  { id: 'cafecubano', r: 'r', icon: '🫖', name: 'Cafecito From Rosa', kind: 'use', effect: 'coffee', text: 'Tiny cup. Enormous power. Rosa insists you sit down to drink it.', useText: 'Your calls wait an extra hour, and you feel very cared for.' },
  { id: 'msmeal', r: 'e', icon: '🥫', name: 'Field Ration With the Good Dessert', kind: 'use', effect: 'energy', text: 'The one with the chocolate pudding. People trade entire shifts for this.', useText: 'Unstoppable: 40% faster for the next two hours.' },
  // keepsakes
  { id: 'rubberband', r: 'c', icon: '➰', name: 'The Rubber Band From Your Flashcards', kind: 'keep', text: 'It finally snapped. Five hundred flashcards everywhere. It was glorious.' },
  { id: 'receipt', r: 'c', icon: '🧾', name: 'A Receipt for a $2 Hot Dog', kind: 'keep', text: 'Proof of honesty. Laminated. Framed in your heart.' },
  { id: 'feather', r: 'c', icon: '🪶', name: "Pigeon Feather From Sgt. Pruitt's Flock", kind: 'keep', text: 'Gifted with great ceremony. Pruitt named the pigeon. The pigeon is named Judge.' },
  { id: 'cone', r: 'c', icon: '🔺', name: "One of Earl's Serious Cones", kind: 'keep', text: 'The orange ones. Earl wants it back. Earl says that about all of them.' },
  { id: 'scantron', r: 'c', icon: '📄', name: 'A Perfect Practice Scantron', kind: 'keep', text: 'Every bubble filled completely, darkly and inside the line. Number two pencil, as instructed.' },
  { id: 'pushupcount', r: 'u', icon: '🔢', name: 'A Clicker Counter Stuck at 1,000', kind: 'keep', text: 'Push-ups this month. Your arms have filed a grievance.' },
  { id: 'catphoto', r: 'u', icon: '🐈', name: 'Signed Photo of Exhibit A', kind: 'keep', text: 'Signed with a paw print. Notarized by Quick Copy & Notary. Do not ask how.' },
  { id: 'ticketstub', r: 'u', icon: '🎟️', name: 'Gators Game Ticket Stub', kind: 'keep', text: 'They lost by a field goal. A perfect game day.' },
  { id: 'brasskey', r: 'r', icon: '🗝️', name: 'Replica Depot Clock Key', kind: 'keep', text: 'A copy of the 1932 key, made by Ms. Okafor for the cadet who found the real one.' },
  { id: 'whistle1924', r: 'r', icon: '🚂', name: 'Recording of the 1924 Whistle', kind: 'keep', text: 'Rusty made you a copy. Do not play it at midnight.' },
  { id: 'squadphoto', r: 'r', icon: '📸', name: 'Squad Photo, Everyone Blinking', kind: 'keep', text: 'Twelve tries. Twelve photos. Someone blinked in every single one.' },
  { id: 'sedanplate', r: 'e', icon: '🚘', name: 'The Swapped Plate (Evidence Replica)', kind: 'keep', text: 'A replica of the plate from the gray sedan case. The real one is in County Evidence Storage, tagged and logged.' },
  { id: 'judgeshoe', r: 'e', icon: '🐴', name: "Judge the Horse's Horseshoe", kind: 'keep', text: 'From 1911. It has been lucky for over a century. Pruitt cried a little.' },
  { id: 'firstreport', r: 'e', icon: '📜', name: 'Your First Report, Framed', kind: 'keep', text: 'Chronological. Specific. No opinions. Sgt. Castillo put a single checkmark on it. That is her highest honor.' },
  { id: 'badgeshadow', r: 'l', icon: '🛡️', name: 'A Badge-Shaped Shadow on the Wall', kind: 'keep', text: 'Not a badge yet. Just the shape of where one will go. Graduation is coming.' },
  { id: 'starlog', r: 'l', icon: '⭐', name: 'The Logbook of Every Class', kind: 'keep', text: 'Every class that trained in Patrol City signed it. There is a blank line with your name penciled in.' }
);
// gear with trade-offs (Step D): every piece that helps also costs something you can feel, so a loadout is a choice.
// One rule per kind of gear, applied to every item: heavy protective gear slows your walk, anything that makes you
// faster makes you rush, a friendly look softens your command presence, extra RP means taking on more, and gear for
// noticing things keeps your eyes off the person in front of you. The cost is folded into the perks, so totals,
// stats and the locker all show it.
const COST = [
  [(p) => (p.tac || 0) + (p.res || 0) > 0, (p) => ({ speed: -5 * ((p.tac || 0) + (p.res || 0)) }), 'Heavier: you walk slower.'],
  [(p) => (p.speed || 0) + (p.drive || 0) > 0, () => ({ com: -1 }), 'You rush: Composure drops.'],
  [(p) => (p.rap || 0) >= 2, () => ({ tac: -1 }), 'A friendly look: less command presence.'],
  [(p) => (p.rpCall || 0) + (p.rpCit || 0) + (p.rpStudy || 0) + (p.rpSquad || 0) > 0, () => ({ wait: -10 }), 'You take on more: calls wait less for you.'],
  [(p) => (p.per || 0) + (p.spot || 0) + (p.light || 0) + (p.secret || 0) + (p.explore || 0) + (p.loot || 0) > 0, () => ({ rap: -1 }), 'Eyes everywhere but on the person in front of you.'],
  [(p) => (p.com || 0) + (p.rap || 0) > 0, () => ({ drive: -5 }), 'Calm and careful: you drive a little slower.']
];
ITEMS.forEach((it) => { const p = it.perk; if (!p || Object.values(p).some((v) => v < 0)) return; const r = COST.find((c) => c[0](p)); if (!r) return; const c = r[1](p);
  Object.keys(c).forEach((k) => { p[k] = (p[k] || 0) + c[k]; if (!p[k]) delete p[k]; }); it.cost = r[2]; });
ITEMS.forEach((x) => { if (x.slot) x.kind = 'gear'; });
export const itemById = (id) => ITEMS.find((x) => x.id === id);
export const slotOf = (id) => SLOTS.find((s) => s.id === id);
export const perkLines = (p) => Object.keys(p || {}).map((k) => (PERK_TEXT[k] ? PERK_TEXT[k](p[k]) : k));

// everything your equipped gear adds up to
export function gearTotals(S) {
  const t = {}; const o = OUTFITS[S.outfit || 'std']; if (o) Object.keys(o.perk).forEach((k) => { t[k] = (t[k] || 0) + o.perk[k]; }); Object.values(S.gear || {}).forEach((id) => { const it = itemById(id); if (it && it.perk) Object.keys(it.perk).forEach((k) => { t[k] = (t[k] || 0) + it.perk[k]; }); });
  return t;
}
export function looks(ids) { const L = {}; (ids || []).forEach((id) => { const it = itemById(id); if (it && it.look) Object.assign(L, it.look); }); return L; }

// pick a rank, then an item; min raises the floor. Nine pulls without Inspection Ready or better guarantees one.
export function roll(S, min) {
  const floor = ORDER.indexOf(min || 'c'), dry = (S.dry || 0) >= 9 ? 2 : 0, from = Math.max(floor, dry);
  const pool = ORDER.slice(from); let t = Math.random() * pool.reduce((a, k) => a + RARITY[k].w, 0), r = pool[0];
  for (const k of pool) { t -= RARITY[k].w; if (t <= 0) { r = k; break; } }
  S.dry = ORDER.indexOf(r) >= 2 ? 0 : (S.dry || 0) + 1;
  const list = ITEMS.filter((x) => x.r === r), owned = list.filter((x) => !(S.items || {})[x.id]);
  const from2 = owned.length && Math.random() < .7 ? owned : list;
  return from2[Math.floor(Math.random() * from2.length)];
}

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const perkHTML = (it) => it.perk ? '<ul class="pkList">' + perkLines(it.perk).map((l) => '<li class="' + (/^-|^\+?-|fewer/.test(l) ? 'neg' : '') + '">' + esc(l) + '</li>').join('') + (it.cost ? '<li class="neg why">' + esc(it.cost) + '</li>' : '') + '</ul>' : '';
const slotTag = (it) => it.slot ? '<span class="slTag">' + slotOf(it.slot).icon + ' ' + slotOf(it.slot).name + '</span>' : it.kind === 'use' ? '<span class="slTag">Use once</span>' : '<span class="slTag">Keepsake</span>';

// ---------- the grand reveal ----------
let HOLD = null, HELD = 0;
/* the game can ask reveals to wait (a moment on screen the player shouldn't miss); a reveal waits at most 30 s */
export const holdReveals = (f) => { HOLD = f; };
export function reveal(item, where, opts) {
  if (HOLD && HOLD() && HELD < 75) { HELD++; return new Promise((r) => setTimeout(() => r(reveal(item, where, opts)), 400)); }
  HELD = 0; return reveal0(item, where, opts);
}
function reveal0(item, where, opts) {
  opts = opts || {};
  return new Promise((done) => {
    const R = RARITY[item.r], isNew = !!opts.isNew, el = document.createElement('div');
    el.className = 'rv rv-' + item.r; el.style.setProperty('--rc', R.color); el.style.setProperty('--rg', R.glow);
    const act = item.kind === 'use' ? '<button type="button" data-a="use">Use it now</button>' : item.kind === 'gear' ? (opts.canEquip ? '<button type="button" data-a="equip">Equip now</button>' : '') : '';
    el.innerHTML = '<canvas class="rvFx"></canvas><div class="rvRays"></div><div class="rvStage">' +
      '<div class="rvFrom">' + esc(where) + '</div>' +
      '<div class="rvBag"><span>' + (ORDER.indexOf(item.r) >= 3 ? '🎁' : '🛍️') + '</span><i>EVIDENCE</i></div>' +
      '<div class="rvItem"><div class="rvIcon">' + item.icon + '<b class="rvShine"></b></div>' +
      '<div class="rvTier">' + (isNew ? '<em>NEW</em>' : '') + 'Rank ' + R.short + ' · ' + esc(R.name) + '</div><h2>' + esc(item.name) + '</h2>' + slotTag(item) + '<p>' + esc(item.text) + '</p>' + perkHTML(item) +
      (item.kind === 'gear' && !opts.canEquip && opts.lockHint ? '<p class="rvLock">' + esc(opts.lockHint) + '</p>' : '') +
      '<div class="rvBtns">' + act + '<button type="button" data-a="keep" class="' + (act ? 'ghost' : '') + '">' + (act ? 'Save for later' : 'Into the locker') + '</button></div></div>' +
      '<div class="rvSkip">Tap to open</div></div>';
    document.body.appendChild(el);
    const fx = el.querySelector('.rvFx'), g = fx.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
    fx.width = innerWidth * dpr; fx.height = innerHeight * dpr;
    let parts = [], raf = 0, stage = 0; const big = ORDER.indexOf(item.r) >= 3;
    const burst = () => {
      const n = { c: 60, u: 90, r: 140, e: 190, l: 240 }[item.r], cols = item.r === 'l' ? ['#f5b800', '#fff3b0', '#ffffff', '#ff9f1a'] : item.r === 'e' ? ['#a855f7', '#e9d5ff', '#ffffff', '#f5b800'] : [R.color, '#ffffff', '#f5b800'];
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = (4 + Math.random() * 10) * dpr; parts.push({ x: fx.width / 2, y: fx.height * .4, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4 * dpr, s: (3 + Math.random() * 5) * dpr, c: cols[i % cols.length], r: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 1 }); }
    };
    const loop = () => {
      g.clearRect(0, 0, fx.width, fx.height);
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += .25 * dpr; p.vx *= .985; p.r += p.vr; p.life -= .008; g.save(); g.globalAlpha = Math.max(0, p.life); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); });
      parts = parts.filter((p) => p.life > 0 && p.y < fx.height + 40);
      if (big && stage === 2 && Math.random() < .3) parts.push({ x: Math.random() * fx.width, y: -10, vx: 0, vy: 2 * dpr, s: 4 * dpr, c: R.color, r: 0, vr: .1, life: 1.4 });
      raf = requestAnimationFrame(loop);
    };
    loop();
    const open = () => { if (stage) return; stage = 1; el.classList.add('open'); burst(); if (opts.sound) opts.sound(R.notes); setTimeout(() => { stage = 2; el.classList.add('shown'); if (big) burst(); }, 450); };
    setTimeout(() => el.classList.add('in'), 20);
    const auto = setTimeout(open, { c: 1100, u: 1400, r: 1800, e: 2200, l: 2600 }[item.r]);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) { clearTimeout(auto); open(); return; }
      if (stage < 2) return;
      cancelAnimationFrame(raf); el.classList.add('out'); setTimeout(() => el.remove(), 250); done(b.dataset.a);
    });
  });
}

// ---------- locker ----------
export function collectionHTML(S) {
  const have = S.items || {}, got = ITEMS.filter((x) => have[x.id]).length;
  return '<p class="lkSum">' + got + ' of ' + ITEMS.length + ' found. Look for sparkles on the street and inside buildings.</p>' +
    ORDER.slice().reverse().map((r) => '<div class="lkTier" style="--rc:' + RARITY[r].color + '">Rank ' + RARITY[r].short + ' · ' + RARITY[r].name + '</div><div class="lkGrid">' + ITEMS.filter((x) => x.r === r).map((x) => {
      const n = have[x.id] || 0, worn = Object.values(S.gear || {}).includes(x.id);
      return '<button type="button" class="lkItem' + (n ? '' : ' none') + (worn ? ' worn' : '') + '" data-i="' + x.id + '" style="--rc:' + RARITY[r].color + '"' + (n ? '' : ' disabled') + '><span>' + (n ? x.icon : '❔') + '</span><b>' + (n ? esc(x.name) : '???') + '</b>' + (n > 1 && x.kind !== 'gear' ? '<i>×' + n + '</i>' : '') + (worn ? '<i class="w">ON</i>' : '') + (n && x.slot ? '<em>' + slotOf(x.slot).icon + '</em>' : '') + '</button>';
    }).join('') + '</div>').join('');
}
export function equipHTML(S, xp, stats, base) {
  const t = gearTotals(S), cur = S.outfit || 'std';
  return '<div class="ofRow"><b>Outfit</b><div class="ofSeg">' + Object.keys(OUTFITS).map((k) => '<button type="button" data-of="' + k + '" class="' + (k === cur ? 'on' : '') + '">' + OUTFITS[k].icon + ' ' + OUTFITS[k].name + '</button>').join('') + '</div><p>' + esc(OUTFITS[cur].text) + (Object.keys(OUTFITS[cur].perk).length ? ' <em>' + perkLines(OUTFITS[cur].perk).join(', ') + '</em>' : '') + '</p></div>' +
    '<div class="eqGrid">' + SLOTS.map((s) => {
    const open = xp >= s.need, id = (S.gear || {})[s.id], it = id && itemById(id);
    return '<button type="button" class="eqSlot' + (open ? '' : ' locked') + (it ? ' full' : '') + '" data-slot="' + s.id + '" style="--rc:' + (it ? RARITY[it.r].color : '#4b5563') + '"' + (open ? '' : ' disabled') + '>' +
      '<span class="eqIco">' + (it ? it.icon : open ? s.icon : '🔒') + '</span><b>' + s.name + '</b><small>' + (it ? esc(it.name) : open ? 'Empty · tap to equip' : esc(s.hint)) + '</small></button>';
  }).join('') + '</div>' +
    '<div class="eqStats"><b>Your stats</b>' + Object.keys(base).map((k) => '<div class="eqStat"><span>' + ({ res: 'Response', per: 'Perception', rap: 'Rapport', com: 'Composure', tac: 'Tactics' })[k] + '</span><i>' + Array.from({ length: 7 }, (_, n) => '<b class="' + (n < Math.min(base[k], stats[k]) ? 'f' : n < stats[k] ? 'g' : '') + '"></b>').join('') + '</i><em>' + stats[k] + (stats[k] !== base[k] ? ' <small>(' + (stats[k] > base[k] ? '+' : '') + (stats[k] - base[k]) + ')</small>' : '') + '</em></div>').join('') + '</div>' +
    (Object.keys(t).filter((k) => !base.hasOwnProperty(k)).length ? '<div class="eqPerks"><b>Gear perks</b><ul class="pkList">' + perkLines(Object.fromEntries(Object.entries(t).filter(([k]) => !base.hasOwnProperty(k)))).map((l) => '<li class="' + (/^-|fewer/.test(l) ? 'neg' : '') + '">' + esc(l) + '</li>').join('') + '</ul></div>' : '<p class="lkSum">Equip gear to stack perks. Each slot holds one item.</p>');
}
export function itemCardHTML(it, S) {
  const R0 = RARITY[it.r];
  return '<div class="lkOne" style="--rc:' + R0.color + '"><div class="lkBig">' + it.icon + '</div><div class="lkR">Rank ' + R0.short + ' · ' + R0.name + '</div><h2>' + esc(it.name) + '</h2>' + slotTag(it) + '<p>' + esc(it.text) + '</p>' + perkHTML(it) + (it.kind !== 'gear' ? '<small>You have ' + ((S.items || {})[it.id] || 0) + '</small>' : '') + '</div>';
}
