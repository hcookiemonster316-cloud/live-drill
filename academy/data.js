// Patrol City content: districts (one per Chapter 5 unit), landmarks, dispatch calls and "something's off" moments.
// Lesson numbers are positions in ch5.json's lessons list (0 = Lesson 1.1 ... 20 = Lesson 5.2).
export const DISTRICTS = [
  { id: 0, name: 'Central District', unit: 'Unit 1 · Patrol Basics', lessons: [0, 1, 2, 3], color: '#f5b800', theme: 'downtown',
    blurb: 'Downtown. Headquarters, roll call, the dispatch center and the radio tower.',
    lots: ['hq', 'dispatch', 'radio', 'bank', 'records', 'tower', 'diner', 'parking', 'tower', 'shop', 'plaza', 'tower', 'garage', 'shop', 'tower', 'park'] },
  { id: 1, name: 'Eastside', unit: 'Unit 2 · Duties on Patrol', lessons: [4, 5, 6, 7], color: '#3b82f6', theme: 'commercial',
    blurb: 'Gas stations, a strip mall and busy corners. Contacts, backup and threat assessment.',
    lots: ['substation', 'gas', 'mall', 'motel', 'autoshop', 'gas', 'shop', 'parking', 'houses', 'pharmacy', 'shop', 'apartments', 'houses', 'parking', 'shop', 'park'] },
  { id: 2, name: 'Riverside', unit: 'Unit 3 · Non-Criminal Calls', lessons: [8, 9, 10, 11, 12, 13, 14, 15, 16], color: '#16a34a', theme: 'residential',
    blurb: 'Homes, apartments, the park, a pawn shop and the stadium on the river.',
    lots: ['substation', 'houses', 'apartments', 'pawn', 'park', 'firestation', 'houses', 'stadium', 'houses', 'apartments', 'church', 'houses', 'school', 'houses', 'shop', 'houses'], river: true },
  { id: 3, name: 'Industrial Park', unit: 'Unit 4 · Structure and Area Searches', lessons: [17, 18], color: '#f97316', theme: 'industrial',
    blurb: 'Warehouses, fenced lots, a rail yard and alarms that go off after dark.',
    lots: ['substation', 'warehouse', 'warehouse', 'storage', 'railyard', 'warehouse', 'lumber', 'parking', 'warehouse', 'storage', 'warehouse', 'lot', 'warehouse', 'railyard', 'lot', 'warehouse'] },
  { id: 4, name: 'Justice Row', unit: 'Unit 5 · Arrest Procedures', lessons: [19, 20], color: '#a855f7', theme: 'civic',
    blurb: 'The county courthouse, the jail and its sally port, bail bonds and the public defender.',
    lots: ['substation', 'courthouse', 'jail', 'sallyport', 'bonds', 'plaza', 'tower', 'parking', 'defender', 'shop', 'tower', 'parking', 'diner', 'tower', 'shop', 'park'] }
];

// Landmark lots: name on the sign, info-point lesson, and the lesson a fact card teaches there.
export const LANDMARKS = {
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
export const QUICK = ['10-4', 'En route', 'On scene', 'Need backup', 'Code 4, all clear', 'Clear, back in service', 'Good job', 'Thanks for the assist'];
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
