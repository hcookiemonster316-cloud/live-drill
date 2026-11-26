// More than one way through. Every side case can be closed by talking it through, by looking into it first, or by
// doing it strictly by the book, and the way you pick changes how it ends: who trusts you, what you learn, what's on
// the report. Most cases get that choice at their last scene (the same people, a different ending). Each district
// also has one signature case written three ways from the start, with different people, places and endings per route.
// Every route is lawful and follows policy; the book route is enforcement with cause, never a shortcut.

export const SIG_CAST = {
  sgGuard: { name: 'Mrs. Pruett', icon: '🦺', role: 'Crossing guard, Founders Elementary' },
  sgNurse: { name: 'Renee Odell', icon: '🩺', role: 'Night nurse, Downtown Urgent Care' },
  sgTow: { name: 'Dwayne', icon: '🛻', role: 'Tow driver, Big Earl\'s Auto' },
  sgRoad: { name: 'Ms. Tran', icon: '🦺', role: 'County road department' },
  sgCoach: { name: 'Coach Ruiz', icon: '🏈', role: 'River Stadium' },
  sgJay: { name: 'Jay', icon: '🩹', role: 'Seventeen, arm in a sling' },
  sgYard: { name: 'Lou', icon: '🦺', role: 'Lot attendant, Big Rig Truck Stop' },
  sgDisp: { name: 'Ms. Akers', icon: '📋', role: 'Safety manager, Coastline Freight' },
  sgMedic: { name: 'Paramedic Soto', icon: '🚑', role: 'Medic 4' },
  sgHoa: { name: 'Mr. Lindqvist', icon: '🌳', role: 'Magnolia Terrace residents\' group' }
};

// a route choice: three ways in, each sets a flag the later steps follow
// (a flag set quietly: the "they'll remember that" toast is for choices people notice)
let FLAGS = null;
const way = (f, t) => ({ t, fx: () => { const F = FLAGS && FLAGS(); if (F) F[f] = Date.now(); }, reply: [] });
const ways = (id, talk, look, book, prompt) => ['choice', [way(id + '_talk', talk), way(id + '_look', look), way(id + '_book', book)], prompt];

export const SIGNATURE = [
  // ================= Central District: inspection and observation =================
  { id: 'sigCentral', d: 0, sig: true, ways: false, title: 'The Gray Sedan', giver: 'sgGuard', giverAt: 'Founders Elementary', req: [0, 1],
    blurb: 'A gray sedan keeps rolling through the school zone at Founders Elementary. The crossing guard wants it stopped before a kid gets hurt.',
    offer: [['sgGuard', 'Officer. Every morning, 7:50, a gray sedan comes through my crosswalk like I\'m not there. Today it missed a second grader by about this much.'], ['sgGuard', 'I got part of the plate. Ends in 4K. Dent in the passenger door. Can you do something?']],
    steps: [
      { at: 'Founders Elementary', who: 'sgGuard', goal: 'Talk to Mrs. Pruett at the Founders Elementary crosswalk', quiz: { n: 2 },
        say: [['sgGuard', 'It\'s not a kid driving. It\'s a woman in scrubs. She looks right through me. Doesn\'t brake till she\'s past the line.'],
          ways('sgA', 'Find the driver and talk to her', 'Watch the zone and get the full plate', 'Run a speed detail in the school zone', 'How do you want to handle it?')] },
      // talking it through
      { onlyIf: 'sgA_talk', at: 'Grind & Badge Coffee', who: 'barista', goal: 'Ask Noor at Grind & Badge about the gray sedan',
        say: [['barista', 'Gray sedan, dented door? That\'s Renee. Comes in at 7:30 every morning after a twelve-hour shift at urgent care. Large black coffee. She can barely hold the cup some days.']] },
      { onlyIf: 'sgA_talk', at: 'Downtown Urgent Care', who: 'sgNurse', goal: 'Find Renee at Downtown Urgent Care',
        say: [['sgNurse', 'The crosswalk? Oh no. I don\'t... I honestly don\'t remember driving past the school. I don\'t remember most of the drive.'], ['sgNurse', 'And the brakes have felt soft for a month. I keep meaning to get them looked at.'],
          ['choice', [{ t: 'Tired driving is like driving impaired. Get a ride after nights.', reply: [['sgNurse', 'There\'s a nurse on my shift who lives near me. I\'ll ask her. And I\'ll take the car in Saturday.']] },
            { t: 'Soft brakes on top of no sleep is how people get killed.', reply: [['sgNurse', 'I know. Okay. I\'ll stop being stubborn about it. Saturday, the brakes. And a ride after nights.']] }], 'Renee is waiting.']],
        twist: { title: 'Renee carpools', text: 'A week later the gray sedan is in for new brake pads, and Renee waves at Mrs. Pruett from the passenger seat of a coworker\'s car. Mrs. Pruett waves back.' } },
      // looking into it first
      { onlyIf: 'sgA_look', at: 'Founders Plaza', goal: 'Watch the school zone from Founders Plaza at 7:50',
        say: [['narr', '7:49. A gray sedan, dented passenger door. The brake lights come on late, the nose dips hard and the car still slides past the line. Plate: FLM 34K.'], ['narr', 'That isn\'t a driver ignoring the crossing guard. That\'s a car that can\'t stop in time.']] },
      { onlyIf: 'sgA_look', at: 'Patrol HQ', who: 'castillo', goal: 'Run the plate with Sgt. Castillo at Patrol HQ',
        say: [['castillo', 'FLM 34K comes back to Renee Odell. Night nurse. And there\'s an open brake recall on that model year. Did you see the nose dive?'],
          ['castillo', 'An unsafe vehicle is a reason to stop it. Stop her tomorrow before the school zone, show her what you saw, and get that car off the road until it\'s fixed.']],
        twist: { title: 'The brakes were the problem', text: 'The shop finds the front pads worn to the metal. Renee had no idea. She sends Mrs. Pruett a card with a photo of the old pads: "You were right to call."' } },
      // by the book
      { onlyIf: 'sgA_book', at: 'Founders Elementary', who: 'sgGuard', goal: 'Set up the school-zone detail with Mrs. Pruett',
        say: [['sgGuard', 'You\'ll be right here at 7:50? Good. I\'ll keep the kids back till you\'ve got her.'], ['narr', 'You park where drivers can see a patrol car but have time to slow down. Most of them do.']] },
      { onlyIf: 'sgA_book', at: 'Palmetto Row', goal: 'Stop the gray sedan on Palmetto Row',
        say: [['narr', '7:51. 34 in a 20 school zone, flashing beacons on. You light her up on Palmetto Row and approach from the passenger side.'], ['sgNurse', 'I\'m sorry. I just got off a twelve. I didn\'t even see the lights.'],
          ['narr', 'You write the school-zone citation and tell her, plainly, that her brakes sounded wrong when she stopped.']],
        twist: { title: 'By the book', text: 'The citation stands and the gray sedan slows down in the school zone. Renee pays the fine and gets the brakes done. She doesn\'t say hello at the coffee shop anymore, but the second graders cross on time.' } }
    ], reward: { rp: 220, loot: 'r' } },

  // ================= Eastside: roads, weather and crash avoidance =================
  { id: 'sigEast', d: 1, sig: true, ways: false, title: 'The Wet Curve', giver: 'sgTow', giverAt: 'Big Earl\'s Auto', req: [1, 1],
    blurb: 'Every time it rains, somebody ends up in the ditch at the curve by Gas & Go. The tow driver has pulled out six cars this month.',
    offer: [['sgTow', 'You know the curve past Gas & Go? Six cars this month. Every one of them in the rain. I\'m making good money and I hate it.'], ['sgTow', 'Somebody\'s going to die on that curve. I figured I\'d tell a cop before that happens.']],
    steps: [
      { at: 'Gas & Go', who: 'sgTow', goal: 'Meet Dwayne at Gas & Go and look at the curve', quiz: { n: 2 },
        say: [['sgTow', 'Look at the skid marks. All of them go straight off the outside of the curve. Nobody\'s turning. They\'re sliding.'],
          ways('sgB', 'Get the neighbors and the county together', 'Look into why it\'s only in the rain', 'Work the curve the next time it rains', 'Where do you start?')] },
      { onlyIf: 'sgB_talk', at: 'Eastside Community Center', who: 'sgRoad', goal: 'Bring it to the county at the Eastside Community Center',
        say: [['sgRoad', 'Six crashes in a month at one curve? Nobody sent me that. If the neighbors will come to the meeting Thursday, I can put warning signs and a lower advisory speed on the agenda.']] },
      { onlyIf: 'sgB_talk', at: 'Sunrise Café', who: 'sgTow', goal: 'Find Dwayne at Sunrise Café after the meeting',
        say: [['sgTow', 'Forty people showed up. Forty! Mrs. Gibbs brought photos of her mailbox. Six times, she\'s replaced that mailbox.'], ['sgTow', 'County says "Slippery When Wet" signs and a 25 advisory by next month.']],
        twist: { title: 'The neighbors show up', text: 'Yellow signs go up on both sides of the curve, with a 25 mph advisory. Dwayne\'s rain-day tows drop to one in the next month. He says he\'s never been happier to lose money.' } },
      { onlyIf: 'sgB_look', at: 'Eastside Plaza', goal: 'Walk the curve from Eastside Plaza in the rain',
        say: [['narr', 'Ten minutes into the rain, the low side of the curve is under an inch of standing water. The storm drain at the bottom is packed with leaves and a shopping cart.'], ['narr', 'A car through that water at 40 doesn\'t turn. It hydroplanes.']] },
      { onlyIf: 'sgB_look', at: 'Eastside Community Center', who: 'sgRoad', goal: 'Report the drain to the county at the Eastside Community Center',
        say: [['sgRoad', 'A blocked drain at the low point of a curve. That\'s a hazard, and it\'s ours. I\'ll have a crew out tomorrow and put that drain on the monthly clean-out.']],
        twist: { title: 'The drain was the problem', text: 'A county crew pulls the cart and two bags of leaves out of the storm drain. The next rain runs straight off the curve. No tows. Dwayne buys the crew coffee.' } },
      { onlyIf: 'sgB_book', at: 'Gas & Go', who: 'sgTow', goal: 'Set up at the curve by Gas & Go when it rains',
        say: [['narr', 'Rain. You park well off the road with your lights on, where drivers see you before the curve, and watch the speeds.'], ['sgTow', 'Look at that. Everybody\'s doing 30 with a cop car sitting there.']] },
      { onlyIf: 'sgB_book', at: 'Maple Court', goal: 'Stop the pickup that slid through the curve',
        say: [['narr', 'A pickup takes the curve at 45 in the rain, fishtails and catches it. You stop it on Maple Court.'], ['narr', 'You cite the driver for driving too fast for conditions, and you work the curve every rainy afternoon that week.']],
        twist: { title: 'By the book', text: 'Seven citations in a week, and drivers learn to slow down on the wet curve while you\'re around. The crashes stop while you work it. When you stop, they creep back. The drain at the bottom still floods.' } }
    ], reward: { rp: 220, loot: 'r' } },

  // ================= Riverside: handling and steering =================
  { id: 'sigRiver', d: 2, sig: true, ways: false, title: 'Donuts at the Stadium', giver: 'sgCoach', giverAt: 'River Stadium', req: [2, 1],
    blurb: 'Teenagers are spinning cars on the gravel lot behind River Stadium at night. Last weekend one of them rolled.',
    offer: [['sgCoach', 'Officer, the gravel lot behind my stadium. Kids spinning cars every Friday night. Last week Jay rolled his mom\'s car onto its roof. He walked away with a broken arm. Next one won\'t walk away.']],
    steps: [
      { at: 'River Stadium', who: 'sgCoach', goal: 'Look at the gravel lot with Coach Ruiz at River Stadium', quiz: { n: 2 },
        say: [['sgCoach', 'There. You can see the circles. They pull the parking brake, crank the wheel and spin. On gravel. In the dark.'],
          ways('sgC', 'Talk to Jay, the kid who rolled', 'Find out who\'s organizing it', 'Be on the lot Friday night', 'What do you do?')] },
      { onlyIf: 'sgC_talk', at: 'Riverside Park', who: 'sgJay', goal: 'Find Jay at Riverside Park',
        say: [['sgJay', 'I know. I know. My mom already said everything you\'re going to say.'], ['sgJay', 'I thought I knew how to catch a slide. You turn into it, right? I turned into it. It just kept going and the tires dug in and then I was upside down.'],
          ['choice', [{ t: 'Would you tell the others what that felt like?', reply: [['sgJay', '...Yeah. Maybe. If it stops somebody.']] },
            { t: 'There\'s a skid class at the county range. Want in?', reply: [['sgJay', 'Like, a real one? With a trainer? Okay. If my mom says yes.']] }], 'Jay is picking at his sling.']] },
      { onlyIf: 'sgC_talk', at: 'River Stadium', who: 'sgCoach', goal: 'Bring Jay to Coach Ruiz at River Stadium',
        say: [['sgCoach', 'He talked to the whole team. In the locker room. With the sling on. You could hear a pin drop.']],
        twist: { title: 'Jay talks', text: 'Jay tells the team what the roll felt like, and six of them sign up for the county\'s skid course with him. The circles on the gravel lot fade. Coach Ruiz puts a photo of the class on the stadium board.' } },
      { onlyIf: 'sgC_look', at: 'River Pawn', goal: 'Ask around at River Pawn about cheap cars',
        say: [['narr', 'The clerk at River Pawn shows you the corkboard by the door. "SPIN NIGHT FRI. BRING A BEATER." And a phone number.'], ['narr', 'The number comes back to a twenty-two-year-old who posts the videos online and charges kids ten dollars to drive.']] },
      { onlyIf: 'sgC_look', at: 'Riverside Park', who: 'castillo', goal: 'Bring what you found to Sgt. Castillo',
        say: [['castillo', 'An adult charging minors to drive recklessly on private property, and filming it. That\'s a conversation with the property owner and a report to the state attorney.'], ['castillo', 'Get the stadium to gate the lot, too. Take away the place and the organizer both.']],
        twist: { title: 'The lot gets a gate', text: 'The stadium puts a locked gate on the gravel lot. The organizer takes the videos down after the state attorney\'s office calls him. Friday nights go quiet.' } },
      { onlyIf: 'sgC_book', at: 'River Stadium', who: 'sgCoach', goal: 'Be at the stadium lot Friday night',
        say: [['narr', 'Friday, 11:10 p.m. Three cars, twenty kids watching. A hatchback is mid-spin when your lights hit the lot.'], ['narr', 'You stop the hatchback first, then the others. No chase. Nobody\'s going anywhere fast on wet gravel.']] },
      { onlyIf: 'sgC_book', at: 'Riverside Park', goal: 'Finish the reports at Riverside Park',
        say: [['narr', 'Three reckless driving citations, three calls to parents, and a tow for the car with no insurance.']],
        twist: { title: 'By the book', text: 'The spinning on the stadium lot stops. Two weeks later a deputy finds fresh circles on a dirt road out by Cypress Hammock. Same kids, no lights, a ditch on both sides.' } }
    ], reward: { rp: 220, loot: 'r' } },

  // ================= Industrial Park: braking, cornering and backing =================
  { id: 'sigInd', d: 3, sig: true, ways: false, title: 'Backing Blind', giver: 'sgYard', giverAt: 'Big Rig Truck Stop', req: [3, 1],
    blurb: 'A box truck backed into the fuel island at Big Rig Truck Stop and nearly pinned the lot attendant.',
    offer: [['sgYard', 'Box truck came back at me at a walking pace. No beeping, no spotter, nothing. I jumped onto the island. It took out a pump instead of me.'], ['sgYard', 'Coastline Freight on the side. Third time one of theirs has backed into something here.']],
    steps: [
      { at: 'Big Rig Truck Stop', who: 'sgYard', goal: 'Talk to Lou at the Big Rig Truck Stop fuel island', quiz: { n: 2 },
        say: [['sgYard', 'The driver said he checked his mirrors. Mirrors don\'t show you a guy standing right behind the box.'],
          ways('sgD', 'Talk to the drivers where they eat', 'Find out why there was no backup alarm', 'Check Coastline\'s trucks for violations', 'Where do you go?')] },
      { onlyIf: 'sgD_talk', at: 'The Lunch Pail', goal: 'Talk to the Coastline drivers at The Lunch Pail',
        say: [['narr', 'Four Coastline drivers in a booth. They know about the pump. "Dispatch has us on a clock," one says. "Getting out to look behind the truck costs a minute. A minute\'s a write-up."']] },
      { onlyIf: 'sgD_talk', at: 'Coastline Freight', who: 'sgDisp', goal: 'Bring it to Ms. Akers at Coastline Freight',
        say: [['sgDisp', 'They said that? That they\'re skipping the walk-around because of the clock?'], ['sgDisp', 'Then the clock\'s wrong, not the drivers. Get out and look, every time, and use a spotter when you have one. I\'ll put it in writing today.']],
        twist: { title: 'Get out and look', text: 'Coastline adds two minutes to every delivery window for backing, and puts "GET OUT AND LOOK" on every dash. The drivers start tapping the back of the box before they reverse. Lou gets a new pump and a box of donuts.' } },
      { onlyIf: 'sgD_look', at: 'Coastline Freight', who: 'sgDisp', goal: 'Ask Ms. Akers at Coastline Freight about the truck',
        say: [['sgDisp', 'Truck 12. Let me pull the maintenance log. Huh. Backup alarm reported "too loud" by a neighbor in March. Somebody in the shop pulled the fuse.']] },
      { onlyIf: 'sgD_look', at: 'Sawdust Lumber Yard', goal: 'Check Truck 12 where it\'s making a delivery',
        say: [['narr', 'Truck 12 backs up to the dock at the lumber yard. No alarm. You stop the driver, show him the empty fuse slot, and wait while the shop sends one over.']],
        twist: { title: 'One fuse', text: 'The shop finds the same pulled fuse in two more trucks. All three alarms work by Friday, and Coastline adds them to the daily inspection sheet. Lou hears Truck 12 beeping from across the lot and gives it a thumbs-up.' } },
      { onlyIf: 'sgD_book', at: 'Coastline Freight', goal: 'Inspect Coastline\'s trucks at the yard',
        say: [['narr', 'You walk the yard with the shop foreman and test every truck: lights, mirrors, brakes, backup alarms.'], ['narr', 'Three backup alarms don\'t work. Two trucks have cracked mirrors.']] },
      { onlyIf: 'sgD_book', at: 'Big Rig Truck Stop', who: 'sgYard', goal: 'Tell Lou what you found at the truck stop',
        say: [['sgYard', 'Five trucks? And they\'re parked until they\'re fixed? Good. Good.']],
        twist: { title: 'By the book', text: 'Five Coastline trucks are written up and parked until the repairs pass inspection. The company pays to fix them. Lou never hears from the drivers about it. Nobody says why it was skipped in the first place.' } }
    ], reward: { rp: 220, loot: 'r' } },

  // ================= Justice Row: lights and sirens =================
  { id: 'sigJustice', d: 4, sig: true, ways: false, title: 'The Silent Corner', giver: 'sgMedic', giverAt: 'Justice Plaza', req: [4, 1],
    blurb: 'Medic 4 was nearly broadsided running lights and siren at the corner by Justice Plaza. Twice.',
    offer: [['sgMedic', 'The corner at Justice Plaza and Magnolia. Twice this month, lights and siren, and a car pulled right out in front of us. Both drivers said they never heard a thing.'], ['sgMedic', 'Next time it\'s a T-bone with a patient on board.']],
    steps: [
      { at: 'Justice Plaza', who: 'sgMedic', goal: 'Meet Paramedic Soto at the Justice Plaza corner', quiz: { n: 2 },
        say: [['sgMedic', 'Look at that hedge on the Magnolia side. Eight feet tall, right to the curb. You can\'t see us coming and the buildings eat the siren.'],
          ways('sgE', 'Talk to the residents about the hedge', 'Test the corner with a siren run', 'Watch the corner for drivers who don\'t yield', 'How do you go at it?')] },
      { onlyIf: 'sgE_talk', at: 'Magnolia Terrace', who: 'sgHoa', goal: 'Find Mr. Lindqvist at Magnolia Terrace',
        say: [['sgHoa', 'The hedge is forty years old. People love that hedge.'], ['sgHoa', '...An ambulance? Nearly hit? Twice? I didn\'t know. Let me bring it to the board tonight. Maybe we trim it back from the corner.']] },
      { onlyIf: 'sgE_talk', at: 'Gavel Green', who: 'sgMedic', goal: 'Tell Soto what the residents decided, at Gavel Green',
        say: [['sgMedic', 'They cut it back? Ten feet from the corner? I can see straight down Magnolia now.']],
        twist: { title: 'The hedge comes back', text: 'The residents trim the hedge back ten feet from the corner and plant low flowers in the gap. Medic 4 runs through that corner three times the next week. Every car sees them and pulls right.' } },
      { onlyIf: 'sgE_look', at: 'Courtside Lofts', goal: 'Stand at Courtside Lofts while Medic 4 runs a siren test',
        say: [['narr', 'Medic 4 comes down Justice Plaza with the siren on. Thirty feet from the corner, standing on the Magnolia side, you can barely hear it. The building and the hedge block both sound and sight.'], ['narr', 'A driver here would have no warning until the ambulance is already in the intersection.']] },
      { onlyIf: 'sgE_look', at: 'County Administration', goal: 'Bring the results to County Administration',
        say: [['narr', 'The county traffic engineer looks at your notes and the crash reports. "That corner needs signal preemption. The ambulance turns the light red for cross traffic before it gets there."']],
        twist: { title: 'The light turns for them', text: 'The county puts signal preemption on the Justice Plaza corner. Now when Medic 4 runs code three, the cross street goes red before they get there. Soto sends you a video of it working.' } },
      { onlyIf: 'sgE_book', at: 'Justice Plaza', who: 'sgMedic', goal: 'Watch the corner with Medic 4 on its next runs',
        say: [['narr', 'You sit on the corner for a week of afternoons. When Medic 4 comes through, you watch who yields and who doesn\'t.'], ['narr', 'Two drivers keep going with the siren right behind them. You stop both.']] },
      { onlyIf: 'sgE_book', at: 'Courthouse Newsstand', goal: 'Finish your notes at the Courthouse Newsstand',
        say: [['narr', 'Two citations for failing to yield to an emergency vehicle. Both drivers say they never heard it. Standing on that corner, you believe them.']],
        twist: { title: 'By the book', text: 'The two citations hold up, and the corner gets a little more careful while you\'re there. The hedge is still eight feet tall, and the buildings still swallow the siren.' } }
    ], reward: { rp: 220, loot: 'r' } }
];

// the choice at the last scene of every other side case, and what each way leaves behind
const PROMPT = 'How do you close this one out?';
const GEN = {
  talk: { t: 'Talk it through with them', beat: 'You let them tell it their way first, all of it, before you say anything. Then you explain what you can do, and what happens next.', end: 'Closed by talking it through. People here will remember you listened.', kick: 'Talked it through' },
  look: { t: 'Check the facts before you decide', beat: 'Before you settle it, you check what you can: the call history, the paperwork, and what the neighbors saw.', end: 'Closed after checking the facts. Your notes go in the case file for the next officer.', kick: 'Looked into it' },
  book: { t: 'Handle it strictly by the book', beat: 'You follow procedure to the letter: identify everyone, document everything, and explain each step as you go.', end: 'Closed by the book. The report is clean and complete.', kick: 'By the book' }
};

// the ten cases a new cadet meets first get their own ending for each way, about the same people (Step G):
// a route has to change how it ends, or routes stop mattering
const ENDS = {
  wallet: { talk: 'Kevin buys Dot a slice of pie every Friday now. Neither of them will say who started it.', look: 'A second wallet goes missing at the diner a month later, and the receipt you had Dot sign is the paperwork everybody copies.', book: 'Logged, returned and signed for in ten minutes. Kevin calls it the fastest thing the city has ever done for him.' },
  clock: { talk: 'Ms. Okafor puts it to a vote at the depot. Five minutes slow wins, forty to three, and she lets you wind it on its birthday.', look: 'It ran slow because of a worn gear tooth, not a choice. The clock gets fixed, and a little sign says it used to be five minutes slow.', book: 'It goes to the city as a work order with the key logged as found property. The clock is right by spring, and Ms. Okafor misses it being wrong.' },
  ghostcar: { talk: 'The kid\'s mom comes to the daylight practice too. Big Earl teaches both of them, and the lot stays quiet at night.', look: 'The cone scuffs lead to three more kids practicing after dark. Big Earl turns Saturday mornings into a free parking class.', book: 'Written up as an unlicensed driver on private property, parent called, nobody charged. The ghost car never comes back.' },
  ruth: { talk: 'Grandma Ruth starts a phone tree on Maple Court. Half the block calls her first, and she tells every one of them to call 911.', look: 'Her notebook lines up with two open reports. A detective calls her his best witness, and she saves the voicemail.', book: 'Her notes go into a proper report with dates and plates. Ruth says it\'s the first time anybody typed up her handwriting.' },
  pigeons: { talk: 'The kid keeps the pigeons, and Sgt. Pruitt teaches him to race them the right way. The pastry case is safe.', look: 'The crumbs were coming from the bakery\'s own back door, left propped open. They fix the latch and the raids stop.', book: 'Parents called, the feeding stops, a sign goes up. The pigeons find another bakery, and Pruitt pretends he isn\'t sad about it.' },
  deadair: { talk: 'Velvet tells every new dispatcher about the dead spot and who found it. You end up on a training slide.', look: 'You map the dead spot block by block. The radio shop finds a broken repeater, and the block comes back on the air.', book: 'It goes in as an officer safety report. A repeater is ordered, and until it comes, units on that block check in by phone.' },
  nightowl: { talk: 'You sit with him for twenty minutes. The bus driver comes the next night, and the night after. He\'s back on the route in a week.', look: 'He stopped riding because his stop lost its light. Public works fixes it, and the driver flags you down to say so.', book: 'A welfare check on file and a caseworker assigned. He gets a ride home when they discharge him, and a number to call.' },
  spokes: { talk: 'The guy in the hoodie talks before you ask. He was moving them for his cousin. The bikes go back, and so does the cousin.', look: 'The serial numbers match three reports. Every bike goes home to its owner, and the rack gets a camera.', book: 'Probable cause, the bikes logged as evidence, photos in the report. Pike says it\'s the cleanest arrest he\'s seen.' },
  overdue: { talk: 'The reverend brings the book back himself and stays for coffee with Mrs. Ellery. The library frames his note.', look: 'There was a 1987 bus transfer inside the cover, and the reverend remembers the whole day. Mrs. Ellery writes it up for the newsletter.', book: 'Returned at the front desk, no fine, a receipt for the reverend. He says it\'s the best thirty-nine years of guilt he ever paid off.' },
  corner: { talk: 'They split it: Gio mornings, Mr. Delgado afternoons. By summer they\'re sharing a cooler.', look: 'The permit map shows the corner was never anybody\'s. The city paints two spots, and both men complain about the paint.', book: 'Permits checked, both valid, spots marked by ordinance. Nobody\'s happy, and nobody\'s fighting.' }
};
export const CASE_ENDS = ENDS;
export function installWays(H) {
  const S = H.S; S.ways = S.ways || {}; FLAGS = () => { H.S.flags = H.S.flags || {}; return H.S.flags; };
  // the way a signature case went, from the flag its first scene set
  const sigWay = (q) => { const f = routeFlag(q); return ['talk', 'look', 'book'].find((w) => S.flags[f + '_' + w]); };
  const routeFlag = (q) => ({ sigCentral: 'sgA', sigEast: 'sgB', sigRiver: 'sgC', sigInd: 'sgD', sigJustice: 'sgE' })[q.id];
  // the last scene of a side case: put the choice of way in front of it (once, and never in story arcs or signature cases)
  function seq(c, st, seq0, last, side) {
    if (!side || !last || c.saga || c.ways === false || S.ways[c.id]) return seq0;
    const opt = (k) => ({ t: GEN[k].t, fx: () => { S.ways[c.id] = k; H.saveS(); }, reply: [['narr', GEN[k].beat]] });
    return [['choice', [opt('talk'), opt('look'), opt('book')], PROMPT]].concat(seq0);
  }
  // when a side case closes: the line for the closing card, and what the way changes
  function close(q, rw) {
    const k = q.sig ? sigWay(q) : S.ways[q.id]; if (!k) return { html: '', rp: rw.rp || 100 };
    S.ways[q.id] = k; S.wayN = S.wayN || {}; S.wayN[k] = (S.wayN[k] || 0) + 1;
    let rp = rw.rp || 100;
    if (k === 'talk') { const w = q.steps.slice().reverse().find((x) => x.who && !/castillo|velvet/.test(x.who)); if (w) S.npc[w.who] = Math.min(6, (S.npc[w.who] || 0) + 1); H.trustUp(3); }
    else if (k === 'look') rp = Math.round(rp * 1.2);
    else rp = Math.round(rp * 1.1);
    H.saveS();
    const end = q.sig ? ({ talk: 'You closed it by talking it through.', look: 'You closed it by finding the cause.', book: 'You closed it by the book.' })[k] : (!q.expanded && ENDS[q.id] && ENDS[q.id][k]) || GEN[k].end; /* an expanded case already shows its own ending (sidex.js), so it gets the plain line for the way you closed it */
    return { html: '<p class="chWay"><b>' + H.esc(GEN[k].kick) + '</b> ' + H.esc(end) + '</p>', rp };
  }
  // how you tend to work, for the case journal
  const tally = () => Object.assign({ talk: 0, look: 0, book: 0 }, S.wayN || {});
  return { seq, close, tally, SIGNATURE };
}
