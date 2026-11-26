// Every side case, expanded (Phase 8, step 4; owner's call: keep the originals and grow them). Each entry rebuilds a
// case's steps around its original ones: { o: n } keeps original step n (pre: lines before its own, say: replaces them, add: lines after), and new
// steps add the turn in the middle, a choice whose options lead to different places, and an ending you can see, with
// the person you helped in it. onlyIf/skipIf branch on the choices; lines with { if } play only on that flag.
// Loop: take a call or a case -> choose how to handle it -> the city remembers (EXP_MEMORY lines, said by regulars
// later) -> your career (the case's reward). Applied once at load by game.js.

export const EXP_CAST = {
  abernathy: { name: 'Mr. Abernathy', icon: '🚌', role: 'Rides the 11:40 night bus' },
  rosen: { name: 'Mrs. Rosen', icon: '🐕', role: 'Bayfront Dog Run regular' },
  kiara: { name: 'Kiara', icon: '🚗', role: 'Dez\'s cousin, sixteen' },
  forger: { name: 'Travis', icon: '🩹', role: 'Roofer, hurt in June' },
  albury: { name: 'Mrs. Albury', icon: '🛹', role: 'Eighty-one, next to Eastside Baptist' },
  linh: { name: 'Linh Tran', icon: '📱', role: 'Works the counter at Corner Cell Repair' },
  kidgd: { name: 'Milo', icon: '🎣', role: 'Six, lost at the game' },
  theomom: { name: 'Erin Lacey', icon: '🩺', role: 'Milo\'s mom, a night-shift nurse' },
  teo: { name: 'Teo Alvarez', icon: '🌱', role: 'Mrs. Benoit\'s grandson, Riverside Feed & Seed' },
  andremom: { name: 'Mrs. Toussaint', icon: '🏠', role: 'Andre\'s mother' },
  sleeper: { name: 'Jojo', icon: '🧥', role: 'Sixteen, sleeping under the stairs' },
  coreyb: { name: 'Corey Bell', icon: '🚂', role: 'Railroad safety speaker' },
  benoit: { name: 'Mrs. Benoit', icon: '🌱', role: 'Willow Street, grows the best tomatoes in Riverside' },
  transported: { name: 'Kenny', icon: '⚾', role: 'Nineteen, on the transport run' }
};

export const EXPAND = {
  // ===================== Central District =====================
  wallet: { steps: [{ o: 0 }, { o: 1 }, { o: 2 },
    { at: 'Meridian Office Tower', who: 'kevin', goal: 'Hear Kevin out at Meridian Office Tower', say: [
      ['kevin', 'Can I tell you something weird? I almost didn\'t report the sunglasses guy. I figured nobody would care what the IT guy saw.'],
      ['kevin', 'I could put it online. I\'ve got eleven hundred followers on my scanner page. Somebody out there knows him.'],
      ['choice', [{ t: 'Take his statement now, in his own words', set: 'kevinStatement', npc: { kevin: 1 }, reply: [['narr', 'You write it down the way he says it. Time, lot, the sunglasses, a gray sedan with no hubcaps idling by the cart corral. He reads it back twice and signs it.'], ['kevin', 'That\'s it? It just goes in the file? ...It feels bigger than that.']] },
        { t: 'Let him post it on his scanner page', set: 'kevinPosted', reply: [['narr', 'He types fast. The post goes up with a blurry photo he took through the lot fence. In an hour it has two hundred shares.'], ['kevin', 'Look at that. Everybody\'s looking now.']] }], 'Kevin wants to help'],
      ['navarro', '(over the radio) Navarro. That statement is the first one that puts the gray sedan and the sunglasses in the same place on the same night. That\'s going on the board.', { if: 'kevinStatement' }],
      ['navarro', '(over the radio) Navarro. Somebody\'s post is all over town. The gray sedan was in that lot every night this week. It hasn\'t been back since the post went up.', { if: 'kevinPosted' }]] },
    { at: 'Night Owl Diner', who: 'dot', goal: 'Bring the news back to Dot at the Night Owl', say: [
      ['dot', 'Kevin was in here an hour ago. Paid for his coffee, left a twenty on a three-dollar check. Wrote "for the honest lady" on the napkin.'],
      ['dot', 'Hon, I\'ve found nine wallets in that booth in eleven years. Nobody\'s ever come back to say thank you. I didn\'t know I wanted that.'],
      ['dot', 'You know what I\'m doing with it? Pie fund. Next time somebody in here looks like they\'re having the worst day of their life, the pie\'s on Kevin.'],
      ['narr', 'She pins the napkin to the wall behind the register, next to a 1998 check for three dollars and forty cents.']] }] },

  clock: { steps: [{ o: 0 }, { o: 1 }, { o: 2 },
    { at: 'Central Library', who: 'okafor', goal: 'Read the letter in the clock with Ms. Okafor', say: [
      ['okafor', 'Cadet, wait. When the clockmaker opened the case to wind it, this was folded behind the pendulum.'],
      ['narr', 'It\'s a letter on department paper, the ink gone brown. Dated October 9, 1932. Signed by Officer Walter Pruitt.'],
      ['okafor', '"I set it five minutes slow so I would never forget. The Moreland girl went into the river at 9:14 and I got there at 9:19. Five minutes. Whoever finds this key, the clock is yours to decide. I could never wind it back."'],
      ['okafor', 'Walter Pruitt. That\'s Sgt. Pruitt\'s grandfather. The one who shoveled the stable.'],
      ['choice', [{ t: 'Bring the letter to Pruitt yourself', set: 'clockLetterPruitt', npc: { pruitt: 2 }, reply: [['okafor', 'Yes. He should hear it from a person, not read it in the paper.']] },
        { t: 'Give it to the library\'s archive first', set: 'clockLetterArchive', reply: [['okafor', 'Archived, scanned and safe. I\'ll call him tonight and read it to him over the phone.']] }], 'A letter from 1932']] },
    { at: 'Founders Park', who: 'pruitt', goal: 'Meet Pruitt at Founders Park', onlyIf: 'clockLetterPruitt', say: [
      ['narr', 'Pruitt reads it twice. His hands are steady the first time and not the second.'],
      ['pruitt', 'He never talked about it. Not once. Grandma said he went quiet every October and nobody knew why.'],
      ['pruitt', 'Ninety-four years he carried that. And I carried mine twenty-eight. Pruitts don\'t talk, cadet. That\'s the family business.'],
      ['pruitt', 'Thank you for walking it over. You didn\'t have to do that.']] },
    { at: 'Founders Plaza', who: 'okafor', goal: 'Watch the clock at Founders Plaza', say: [
      ['narr', 'Half of Central shows up at the depot. Delgado brings hot dogs. Somebody brings a lawn chair for Pruitt.'],
      ['okafor', 'On time. 9:14 on the dot. First time since 1932.', { if: 'clockFixed' }],
      ['pruitt', 'Ninety-four years late. That\'s alright. He\'d be glad somebody finally got there on time.', { if: 'clockFixed' }],
      ['okafor', 'Five minutes slow. Still. They\'re putting his letter on a plaque under the face so everybody knows why.', { if: 'clockSlow' }],
      ['pruitt', 'Leave it slow. That\'s his five minutes. Every graduate gets them now. He\'d like that.', { if: 'clockSlow' }],
      ['narr', 'The bells ring. A pigeon lands on Pruitt\'s shoulder and he lets it stay.']] }] },

  pigeons: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Founders Elementary', who: 'kid', goal: 'Ask Mateo why at Founders Elementary', say: [
      ['kid', 'My abuelo had pigeons. Real ones, racing ones. In Cuba and then here, on the roof on Palmetto Row.'],
      ['kid', 'Now he\'s at Bayou Senior Apartments and they don\'t let you keep birds. So I feed them for him and tell him about them on Sundays. He knows all their names. I make them up. He doesn\'t know I make them up.'],
      ['narr', 'He holds up a notebook. Every page has a pigeon drawn in crayon, with a name and a "speed."']] },
    { at: 'Founders Park', who: 'pruitt', goal: 'Bring Mateo\'s notebook to Pruitt', say: [
      ['pruitt', '"Captain Feathers, speed: very fast." "Lola, speed: medium but brave." ...Cadet, this kid is a natural.'],
      ['pruitt', 'Racing pigeons can visit people. Short trips, a carrier and a little paperwork. I\'ve taken birds to the VA every spring for twenty years.'],
      ['choice', [{ t: 'Ask Pruitt to bring a real racer to Mateo\'s abuelo', set: 'pigeonVisit', npc: { pruitt: 1 }, reply: [['pruitt', 'Sunday. Rocket\'s the fastest bird I\'ve got. Let\'s go make an old man\'s week.']] },
        { t: 'Ask Pruitt to teach Mateo at the park instead', set: 'pigeonLessons', reply: [['pruitt', 'Every Sunday at ten. Bring the notebook. We\'ll get him some real speeds.']] }], 'Pruitt has an idea']] },
    { at: 'Grind & Badge Coffee', who: 'barista', goal: 'Close it out with Noor at Grind & Badge', say: [
      ['barista', 'No pigeons in four days! The croissants are safe. I almost miss them. Almost.'],
      ['barista', 'The kid came by with an old man in a wheelchair and a pigeon in a box. The old man cried. Then he ordered a croissant and gave half to the bird. I let it happen.', { if: 'pigeonVisit' }],
      ['barista', 'The kid and the old pigeon guy go by every Sunday with a notebook. They nod at me like colleagues.', { if: 'pigeonLessons' }],
      ['barista', 'Here. Croissant. On the house. You earned a croissant.']] }] },

  deadair: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Founders Plaza', who: 'pike', goal: 'Back up Pike near Founders Plaza', say: [
      ['narr', 'Two days later. Pike is on a noise complaint a block from Bayfront Tower. Velvet calls for his status. Nothing comes back.'],
      ['velvet', '(over the radio) Unit 14, status check. ...Unit 14. ...Pike, honey, talk to me.', { if: 'deadairAvoid' }],
      ['narr', 'You find him in the dead block, waving his radio at the sky. He\'s fine. He was fine the whole time. Velvet didn\'t know that for four minutes.', { if: 'deadairAvoid' }],
      ['pike', 'I could hear her calling me. I could hear her and she couldn\'t hear me. That\'s the worst sound I\'ve ever heard.', { if: 'deadairAvoid' }],
      ['velvet', '(over the radio) Unit 14, status? ...Copy, 14. Thank you, baby. That block\'s been clear since the repeater came back up.', { if: 'deadairReport' }],
      ['pike', 'Right there? That\'s where the dead spot was? I wouldn\'t have even known. Huh. Somebody fixed a problem I never got to have.', { if: 'deadairReport' }]] },
    { at: 'Dispatch Center', who: 'velvet', goal: 'Talk it over with Velvet at Dispatch', say: [
      ['velvet', 'Four minutes, sugar. Thirty-one years in this chair and four minutes of not hearing one of my officers still takes a year off me.', { if: 'deadairAvoid' }],
      ['velvet', 'The repeater\'s fixed now. Your write-up made it to the lieutenant this morning. Next time, it goes in writing the first day.', { if: 'deadairAvoid' }],
      ['velvet', 'You know what nobody ever thanks? A thing that didn\'t happen. So, thank you for the thing that didn\'t happen.', { if: 'deadairReport' }],
      ['velvet', 'And tell that boy with the graph he\'s welcome up here any time. I want to see the graph. Everybody wants to see the graph.'],
      ['kevin', '(over the radio) She wants to see the graph? She actually said that? I\'m framing that.']] }] },

  nightowl: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Downtown Urgent Care', who: 'abernathy', goal: 'Sit with Mr. Abernathy at Urgent Care', say: [
      ['narr', 'Room 6. He\'s smaller than you pictured, in a gown with little blue boats on it, doing a crossword in pen.'],
      ['abernathy', 'You\'re the officer Hank sent? Hank sent the police after me. That man.'],
      ['abernathy', 'My wife, Loretta, worked the night shift at the Night Owl for twenty-six years. I rode the 11:40 out to pick her up every night. She passed in March.'],
      ['abernathy', 'I kept riding it. I know that\'s silly. Dot pours the coffee and doesn\'t ask. Hank saves the seat. It\'s the only part of the day that still has her in it.'],
      ['choice', [{ t: 'Tell him it isn\'t silly at all', set: 'aberHeard', reply: [['abernathy', 'No. I suppose it isn\'t. Loretta would say I\'m being dramatic. Then she\'d get me pie.']] },
        { t: 'Ask about Loretta', set: 'aberRuthie', reply: [['abernathy', 'She could carry six plates on one arm. She called every trucker "sweetheart" and every cop "trouble." You\'d have been trouble.'], ['narr', 'He laughs, and it turns into a cough, and then into something else for a while. You wait.']] }], 'Mr. Abernathy'],
      ['nurse', 'He goes home Thursday. Doctor says no more cherry pie. He says that\'s a death sentence.', { if: 'pieDelivered' }]] },
    { at: 'City Garage', who: 'hank', goal: 'Ride along with Hank at the City Garage', say: [
      ['narr', 'Thursday, 11:40 p.m. The night bus pulls away from Harbor View with one rider in the third row, left side.'],
      ['hank', 'Mr. A! Look who\'s back. Seat\'s been warm all week, I been sitting in it on my breaks.'],
      ['abernathy', 'You put the police on me, Hank.'],
      ['hank', 'I sure did. And I\'d do it again.'],
      ['narr', 'At the Night Owl, Dot has a cup of black coffee and a slice of something that is definitely not cherry pie on the counter before he sits down.'],
      ['dot', 'Doctor said no cherry. Didn\'t say anything about key lime.', { if: 'pieDelivered' }],
      ['dot', 'Sit down, Leonard Abernathy. Loretta\'d kill me if I let you go hungry.']] }] },

  spokes: { offer: [['marcus', 'Also, um, Wren says the kid who keeps riding past her window with a new bike every week is maybe fifteen. Just so you know what you\'re walking into.']],
    steps: [{ o: 0 }, { o: 1 }, { o: 2 },
    { at: 'Palmetto Row', who: 'seller', goal: 'Talk to the kid on Palmetto Row', say: [
      ['narr', 'Up close he\'s younger than the hoodie made him look. Fifteen, maybe. His hands are shaking.'],
      ['seller', 'I didn\'t pick the bikes. A guy picks them. He says which rack, I cut the lock, he gives me forty bucks a bike at the gas station.'],
      ['seller', 'My mom works doubles. The lights got shut off in October. I\'m not saying that makes it okay. I\'m just saying.'],
      ['choice', [{ t: 'Refer him to the juvenile diversion program and log what he told you', set: 'spokesDiversion', reply: [['pike', 'Diversion. He makes it right, he stays out of court, he gets a caseworker. That\'s what it\'s for.'], ['seller', '...Okay. My name\'s Jaylen. Jaylen Price.']] },
        { t: 'Charge him and push for the buyer\'s name', set: 'spokesCharge', reply: [['pike', 'Grand theft, three counts. That\'s on him.'], ['seller', 'You want his name? You\'ll have to find it. I\'m not getting hurt for you.']] }], 'Jaylen'],
      ['narr', 'Before you leave, Jaylen says one more thing, quietly: "He drives a white van. Gator Gas on Palmetto, Thursdays at six."', { if: 'spokesDiversion' }]] },
    { at: 'Spokes & Spares', who: 'wren', goal: 'Return the bikes at Spokes & Spares', say: [
      ['marcus', 'My bike! Somebody put a bell on it. I didn\'t have a bell. ...I\'m keeping the bell.'],
      ['wren', 'The white van guy got picked up at Gator Gas Thursday with eleven bikes in the back. Somebody told somebody something.', { if: 'spokesDiversion' }],
      ['wren', 'Part of diversion is community service. His caseworker asked me if I had something. He\'s fixing flats here Saturdays. He\'s good at it. Don\'t tell him I said that.', { if: 'spokesDiversion' }],
      ['wren', 'Bikes are back. The kid\'s in juvenile court next month. Racks got hit again Tuesday, though. Whoever\'s buying them is still buying.', { if: 'spokesCharge' }],
      ['marcus', 'Thanks, officer. Seriously. That bike is rent.']] }] },

  overdue: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Central Library', who: 'okafor', goal: 'Meet Reverend Whitaker at the Central Library', onlyIf: 'haleReturns', say: [
      ['narr', 'Reverend Whitaker stands at the circulation desk holding the book like it might go off.'],
      ['hale', 'Ms. Okafor. I have a confession. It\'s been thirty-nine years since my last return.'],
      ['okafor', 'Reverend. "Pigeons of the American South." March fourth, 1987. I was a student volunteer here that spring. I stamped this card.'],
      ['hale', 'You... oh, Lord.'],
      ['okafor', 'The late fee would be four thousand, one hundred and eighty-six dollars. I\'m waiving it. On one condition.'],
      ['okafor', 'Our Thursday reading club has nine members and eight of them are retired librarians. We need somebody who\'s afraid of us.'],
      ['hale', 'I\'ll be there Thursday. With pie. Penance pie.']] },
    { at: 'Central Library', who: 'okafor', goal: 'Return the book to the Central Library', skipIf: 'haleReturns', say: [
      ['okafor', 'You brought it? He wouldn\'t let you, would he. Hm. He sent it with you anyway?'],
      ['okafor', 'He\'s going to feel guilty about this for another thirty-nine years, cadet. Some things you have to carry back yourself.'],
      ['narr', 'Two weeks later you hear Reverend Whitaker joined the Thursday reading club anyway. He brings pie. He calls it penance pie.']] },
    { at: 'Dog-Eared Books', who: 'shopowner', goal: 'Tell Mrs. Ellery how it ended', say: [
      ['shopowner', 'A reading club! Of retired librarians! He\'s doomed. I love it.'],
      ['shopowner', 'I put a sign on the donation bin. "No judgment. Also, check the due date." Business has never been better.']] }] },

  corner: { steps: [{ o: 0 },
    { at: 'Founders Plaza', who: 'delgado', goal: 'Check the permits at Founders Plaza', say: [
      ['narr', 'Gio\'s permit is clipped to his board, laminated, current. You ask Delgado for his. He looks at the fountain for a long time.'],
      ['delgado', 'It\'s in the cart. Somewhere. I renew it every year. My Marisol does the forms. She\'s been at clinicals, so this year...'],
      ['narr', 'The permit in the cart\'s drawer expired in August. He holds it like it\'s somebody else\'s.'],
      ['delgado', 'I can\'t read those forms, officer. I can read a menu, I can read a ticket. Those forms, the words swim. Twenty-two years and nobody knew.'],
      ['gio', '...Hey. Hey, Delgado. I didn\'t know that.']] },
    { at: 'Founders Plaza', who: 'delgado', goal: 'Decide on the corner at Founders Plaza', say: [
      ['choice', [{ t: 'Give him until Friday to renew, and walk him to the clerk', set: 'cornerHelp', npc: { delgado: 2 }, reply: [['narr', 'You write a warning, not a citation, with Friday on it. Gio closes his shop for an hour to go with you both. Nobody asks him to.'], ['gio', 'I fill out forms for my uncle every month. I\'m good at forms. Don\'t tell anybody, it\'s bad for my image.']] },
        { t: 'Cite the expired permit and move the cart today', set: 'cornerCite', reply: [['narr', 'You write it. Delgado packs the cart without a word. Gio watches him go.'], ['delgado', 'It\'s alright. Rules are rules. I\'ll be back when I\'m legal.']] }], 'The permit'],
      ['narr', 'Friday, Delgado holds his new permit up for the whole plaza to see. Gio claps. Then, horrified, stops clapping.', { if: 'cornerHelp' }],
      ['narr', 'For four days the corner is empty. People walk past the fountain and look at the spot where the cart used to be. On the fifth day, he\'s back, with a permit, and a line twenty people long.', { if: 'cornerCite' }],
      ['delgado', 'The Founders Special. Hot dog and a slice, six dollars. Gio\'s idea. Don\'t tell him I said it was good.', { if: 'cornerSplit' }],
      ['delgado', 'Three feet. Three very bitter feet. ...He brought me coffee this morning. I don\'t know what to do with that.', { if: 'cornerPermit' }]] }] },

  shoptalk: { steps: [{ o: 0 },
    { at: 'Sharp Edges Barbershop', who: 'barber', goal: 'Take the call at Sharp Edges Barbershop', say: [
      ['narr', 'You\'re mid-sentence with Otis when Mrs. Diaz\'s phone rings in her purse. She looks at it. "Microsoft Support." She looks at you.'],
      ['choice', [{ t: 'Have her put it on speaker while you take notes', set: 'scamListen', reply: [['narr', 'A calm man with a script. "Your computer is sending us errors, ma\'am." Callback number, a company name, a request for remote access, then gift cards. You write it all down. She hangs up when you nod.'], ['diaz', 'He called me "dear" eleven times. I counted. Pepito growled at the phone, I\'m so proud of him.']] },
        { t: 'Tell her to hang up right now', set: 'scamHang', reply: [['diaz', 'Hung up! Ha! ...He\'s calling back. He\'s calling back again. He\'s persistent, I\'ll give him that.'], ['narr', 'You note the number and the time. That\'s something.']] }], 'The phone rings']] },
    { o: 1 },
    { at: 'Sharp Edges Barbershop', who: 'barber', goal: 'Run Saturday\'s class at Sharp Edges', onlyIf: 'scamClass', say: [
      ['narr', 'Saturday. Fourteen people in barber chairs and folding chairs. Kevin\'s slides are on a TV that usually shows baseball.'],
      ['kevin', 'Slide one. If somebody calls you and says they\'re Microsoft, they\'re not Microsoft. That\'s the whole slide. That\'s really the whole talk.'],
      ['diaz', 'And if they want gift cards, it\'s a scam. Nobody honest has ever asked anybody for gift cards. Except my grandson, at Christmas, and he\'s honest.', { if: 'scamListen' }],
      ['barber', 'Mrs. Diaz had one on the phone this week and kept him talking for six minutes while the officer wrote down everything. She\'s famous now.', { if: 'scamListen' }],
      ['narr', 'Afterward, a man in the back who hasn\'t said a word all morning waits until everyone leaves. He bought three hundred dollars in cards last month. He never told his kids. You help him write it up.']] },
    { at: 'First Coast Bank', who: 'teller', goal: 'Report back to Mr. Banks at First Coast Bank', say: [
      ['teller', 'Your notes and three other reports had the same callback number. The bank\'s fraud team traced it to an account they\'ve now frozen. That\'s not nothing.', { if: 'scamListen' }],
      ['teller', 'No calls about gift cards this week from anybody who sat in that barber chair. Not one. Barbershop beats a pamphlet.', { if: 'scamClass' }],
      ['teller', 'Flyers went up. Two people mentioned them at my window, which is two more than usual.', { if: 'scamFlyers' }],
      ['teller', 'Keep sending them my way, officer. I\'d rather turn down a withdrawal than watch someone cry at my window.']] }] },

  fakepage: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Bayfront Dog Run', who: 'rosen', goal: 'Find Mrs. Rosen at the Bayfront Dog Run', say: [
      ['narr', 'Mrs. Rosen sits alone on the far bench with a Yorkie in her lap, pretending not to notice you.'],
      ['rosen', 'Fifty dollars. In gift cards. My grandson graduated from a police academy in Ohio. The page had his class photo on it. That\'s why I believed it.'],
      ['rosen', 'Everybody at the run knows now. I\'ve been coming here nine years and I want to crawl under this bench.'],
      ['choice', [{ t: 'Help her file a report so the card company can trace it', set: 'rosenReport', reply: [['narr', 'Card numbers, the time, screenshots from her phone. It takes twenty minutes. By the end she\'s sitting up straight.'], ['rosen', 'Most of it won\'t come back, I know. But they don\'t get to keep it without a fight.']] },
        { t: 'Tell her it happens to smart people every day', set: 'rosenComfort', reply: [['rosen', 'Smart people. Hm. My husband was a CPA for forty years. He\'d have caught it.'], ['narr', 'She doesn\'t look convinced. But she doesn\'t look away, either.']] }], 'Mrs. Rosen']] },
    { at: 'Bayfront Dog Run', who: 'diaz', goal: 'See it through with Mrs. Diaz', say: [
      ['diaz', 'Edie Rosen! Come over here. Pepito wants to sit with Noodle. Pepito insists.'],
      ['diaz', 'Listen, I almost bought four hundred dollars of gift cards for "Microsoft" last month. The barber saved me. Otis! A barber! We\'re all idiots together.'],
      ['rosen', '...Four hundred?'],
      ['diaz', 'Four hundred. And they called me "dear."'],
      ['narr', 'The two of them stay on that bench until the sun goes down, comparing scam stories like war wounds.'],
      ['pio', '(over the radio) The card company froze the cards. Mrs. Rosen\'s report was the one that matched them. She\'s getting thirty of her fifty back.', { if: 'rosenReport' }]] }] },
  // ===================== Eastside =====================
  ghostcar: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Eastside Community Center', who: 'kiara', goal: 'Meet Kiara at the Eastside Community Center', say: [
      ['kiara', 'Dez told you. Of course he told you. He tells everybody everything.'],
      ['kiara', 'My mom drives for a delivery app. If I don\'t pass Friday, I can\'t drive my little brothers to school, and she can\'t take the morning shifts. That\'s the whole thing. That\'s why I\'m out there at midnight.'],
      ['kiara', 'I hit Earl\'s cone eleven times last night. I counted. Eleven.'],
      ['narr', 'She shows you her hands. There are pen marks on her knuckles: L, R, L, the way she\'s been trying to remember which way to turn the wheel.']] },
    { at: 'Eastside Community Center', who: 'kiara', goal: 'Coach Kiara in the Community Center lot', onlyIf: 'tashaHelp', say: [
      ['narr', 'Saturday, 9 a.m. Earl\'s orange cones. Kiara\'s mom in a lawn chair with a coffee, pretending not to watch. Dez in the back seat with a stopwatch nobody asked for.'],
      ['choice', [{ t: 'Teach her reference points: mirrors, bumpers, the curb', set: 'kiaraRefs', reply: [['narr', 'You show her where the curb disappears under the side mirror. Where the cone lines up with the back window. She stops guessing and starts looking.'], ['kiara', 'Oh. Oh! It\'s not magic. It\'s just looking at the right thing at the right time.']] },
        { t: 'Have her go slower, one inch at a time', set: 'kiaraSlow', reply: [['narr', 'Slower. Then slower than that. Dez falls asleep. On the ninth try she\'s six inches from the curb and straight.'], ['kiara', 'I did it. I did it slow. Does slow count? It counts, right?']] }], 'Saturday practice'],
      ['duarte', '(over the radio) Duarte. I rolled by the lot. That girl just put a sedan between two cones like she was born doing it. Cadet, you teach that?']] },
    { o: 2, add: [['earl', 'She passed Friday. Hit zero cones. Brought me a cake shaped like a cone. It was not a good cake. I ate the whole thing.', { if: 'tashaHelp' }], ['earl', 'Her mom called me, of all people, to say thank you. I told her I just loaned the cones.', { if: 'tashaHelp' }], ['earl', 'She\'s still coming by at night sometimes. But she brings an adult now. That\'s the law, right? See, I listen.', { if: 'tashaWarn' }]] }] },

  ruth: { steps: [{ o: 0 }, { o: 1 }, { o: 2 },
    { at: 'Maple Court', who: 'ruth', goal: 'Go to the first watch meeting at Maple Court', onlyIf: 'ruthWatch', say: [
      ['narr', 'Grandma Ruth\'s living room. Eleven neighbors, two plates of lemon bars, and a whiteboard she borrowed from Sgt. Vargas without asking.'],
      ['ruth', 'Rule one. We write down what we see, not what we think. "Gray car, three a.m., plate starts with 7." Not "a creepy man." We don\'t know he\'s creepy. We know he\'s a gray car.'],
      ['ruth', 'Rule two. We call. We don\'t chase. If anybody here chases anybody, I\'m taking back your lemon bar.'],
      ['narr', 'Mr. Albury from across the street raises his hand. He\'s eighty-four. He wants to know if he can be in charge of the mailman. Ruth says no. Ruth is in charge of the mailman.']] },
    { at: 'Maple Court', who: 'ruth', goal: 'Bring Grandma Ruth the news on Maple Court', say: [
      ['vargas', '(over the radio) Vargas. Tell Mrs. Ruth her plate number got us a partial match on the gray sedan. Partial. That\'s a first down. Put it on my whiteboard.', { if: 'ruthListened' }],
      ['ruth', 'A first down! I don\'t know what that is, but I\'ll take it.', { if: 'ruthListened' }],
      ['ruth', 'You know, my husband was a mail carrier. Thirty-one years. That\'s why I watch the mailman. I like to see somebody doing it right.'],
      ['ruth', 'Come by Thursdays. I\'ll read you entry two hundred. It\'s about a raccoon. It\'s my best work.']] }] },

  gloves: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Eastgate Apartments', who: 'mia', goal: 'Find out what started it at Eastgate Apartments', say: [
      ['mia', 'It wasn\'t really the punch. That boy Darius said something about our dad. Our dad\'s in prison up in Raiford. Tre doesn\'t talk about it, so of course that\'s where people go.'],
      ['mia', 'Tre\'s got a scholarship tryout in Tampa in two weeks. If he catches a battery charge, it\'s gone. Everything Mr. Reyes did for him is gone.'],
      ['choice', [{ t: 'Ask Mia to come to Saturday\'s match', set: 'miaComes', reply: [['mia', 'He\'ll pretend he\'s mad I came. He won\'t be. I\'ll bring a sign. A small sign.']] },
        { t: 'Tell her Tre has to make his own choices now', set: 'miaStays', reply: [['mia', 'I know. I\'ve been telling him that since he was nine. He never listens to me. Maybe he\'ll listen to you.']] }], 'Mia']] },
    { at: 'Eastgate Apartments', who: 'boxer', goal: 'Watch the Saturday match with Tre', onlyIf: 'glovesCalm', say: [
      ['narr', 'Saturday. Coach Reyes\'s gym. Three rounds, headgear, Reyes in a striped shirt that\'s two sizes too small.'],
      ['narr', 'Tre fights clean. Darius fights scared. At the final bell they stand there breathing hard, and then Darius says something too quiet to hear, and Tre nods once.'],
      ['mia', 'TRE! Tre! That\'s my brother!', { if: 'miaComes' }],
      ['boxer', 'Ugh. She brought a sign.', { if: 'miaComes' }],
      ['boxer', 'He said sorry about the dad thing. I said sorry about the after-the-bell thing. That\'s... that\'s it, I guess. That\'s how Coach does it.'],
      ['reyes', 'Two weeks to Tampa. Go home and sleep, both of you.']] },
    { at: 'Eastgate Apartments', who: 'boxer', goal: 'Check in on Tre at Eastgate Apartments', onlyIf: 'glovesOrder', say: [
      ['boxer', 'I didn\'t go after him. I wanted to. I sat on these steps for three hours instead.'],
      ['boxer', 'Coach says I\'m suspended from sparring until Tampa. Fair. I guess.'],
      ['mia', 'He\'ll get there. He\'s just loud on the way.']] }] },

  sockbandit: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Old Grove Farm', who: 'ferretowner', goal: 'Help Gary\'s owner at Old Grove Farm', say: [
      ['ferretowner', 'I should tell you why he ran. My daughter went off to college two weeks ago. Gary slept on her bed every night for five years. He\'s been looking for her.'],
      ['ferretowner', 'He steals socks because they smell like people. The vet said he was making a nest that smelled like home.'],
      ['narr', 'In the barn, under the hay, a hundred and twelve socks in a perfect circle. In the middle, one pink sock with a hole in the toe.'],
      ['ferretowner', 'That one\'s hers. He must have dragged it all the way from the house.']] },
    { at: 'Spin City Laundromat', who: 'kim', goal: 'Bring the socks back to Mr. Kim', say: [
      ['kim', 'A ferret. A heartbroken ferret. In my laundromat. I\'ve been accused of everything for two weeks because of a sad ferret.'],
      ['kim', 'You know what, I\'m putting a box by the door. "Lost socks." People can take what\'s theirs. It\'s a public service.'],
      ['narr', 'By the end of the week the box has a sign in crayon: GARY\'S SOCKS. Somebody has drawn a ferret wearing a sweater.'],
      ['kim', 'I didn\'t draw it. I would never draw that. I drew it.'],
      ['ferretowner', '(over the radio) Gary\'s in the new cage. He has one of my daughter\'s sweatshirts in there. He hasn\'t stolen a sock in a week. He seems... okay.', { if: 'garyHome' }],
      ['ferretowner', '(over the radio) Animal control said he\'s healthy, just lonely. They gave me a list of ferret groups. There\'s a ferret group. Gary has friends now.', { unless: 'garyHome' }]] }] },

  forgery: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Eastside Pharmacy', who: 'pharmacist', goal: 'Make contact outside Eastside Pharmacy', say: [
      ['narr', 'Nine p.m. He comes out with the white bag in his hand. Mid-twenties, a work shirt from a roofing company, and a brace on his right wrist.'],
      ['forger', 'Is this about the scripts? ...Yeah. Yeah, it\'s about the scripts.'],
      ['forger', 'I fell off a roof in June. They gave me pills for two weeks. The doctor won\'t refill them and I can\'t work without them, and I can\'t stop now even if I wanted to, which I don\'t, which is the problem.'],
      ['choice', [{ t: 'Arrest him, and tell him about the jail\'s treatment program', set: 'rxTreatment', reply: [['narr', 'You read him his rights and then, on the drive, you tell him what the county does now: a counselor at booking, a treatment bed if he wants it.'], ['forger', 'If I want it. Nobody\'s asked me what I want in like four months.']] },
        { t: 'Arrest him and focus on where he got the blank forms', set: 'rxSource', reply: [['forger', 'A guy at the flea market sells them. Sundays. Blue tent. That\'s all I know.'], ['narr', 'It\'s a lead. You write it down. He doesn\'t say anything else the whole ride.']] }], 'The man with the bag'],
      ['pharmacist', 'Thank you for doing that outside. I have four regulars who were in the store. Nobody even looked up.', { if: 'rxPlan' }],
      ['pharmacist', 'And no, I\'m not related to Sgt. Whitfield in Riverside. Everybody asks. He\'s a much better fisherman than I am.']] },
    { at: 'Rosa\'s Bodega', who: 'rosa', goal: 'Tell Rosa how it went at the bodega', say: [
      ['rosa', 'Dr. Whitfield called me crying. Happy crying. Nobody got hurt and nobody made a scene. That\'s how it should be.'],
      ['rosa', 'That boy\'s mother buys her milk here. She came in this morning. She said, "At least now somebody knows." ...I gave her the milk. Don\'t tell anybody.', { if: 'rxTreatment' }],
      ['rosa', 'The flea market tent is gone. A whole table of fake forms, gone, because you asked one more question. Bueno.', { if: 'rxSource' }],
      ['rosa', 'Here. Flan. The half I didn\'t eat.']] }] },

  kickflip: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Eastside Baptist Church', who: 'albury', goal: 'Meet Mrs. Albury at Eastside Baptist', say: [
      ['albury', 'You\'re the one who moved the skateboard children? Good. Sit down. I\'ll tell you a secret.'],
      ['albury', 'My Harold built half the ramps in this town in 1977. We had a skate park by the old drive-in, before they paved it. I was the first girl in Port Meridian to land a kickturn. Look at me. I know.'],
      ['albury', 'I don\'t mind the noise. I mind the noise at eleven at night. There\'s a difference. Tell that boy Dez to come see me. I have Harold\'s old trucks in a box.']] },
    { at: 'Eastside Community Center', who: 'dez', goal: 'Bring Dez the box at the Community Center', say: [
      ['narr', 'A shoebox of 1970s skateboard trucks, rusted, with HAROLD ALBURY written on the lid in marker.'],
      ['dez', 'These are, like, vintage-vintage. People pay hundreds for these. She just... gave them to me?'],
      ['choice', [{ t: 'Suggest he skate them at the school lot in Harold\'s name', set: 'dezHarold', npc: { dez: 1 }, reply: [['dez', 'The Harold Albury Memorial Kickflip. Every Saturday. We\'ll invite her. We\'ll get her a lawn chair.']] },
        { t: 'Suggest he sell them for new boards for everybody', set: 'dezSell', reply: [['dez', 'Six new boards for kids who don\'t have one. She\'d like that, right? I\'ll ask her first. I\'m not a monster.']] }], 'Harold\'s trucks']] },
    { at: 'Eastside Middle School', who: 'albury', goal: 'Watch Saturday at Eastside Middle School', onlyIf: 'skateHours', say: [
      ['narr', 'Saturday, 4 p.m. Twelve kids, the school lot, a sign-in sheet that says DEZ IS IN CHARGE (NOT A JOB).'],
      ['narr', 'Mrs. Albury arrives in a lawn chair carried by three eighth graders. She watches Dez try a kickturn on a board with Harold\'s trucks on it.', { if: 'dezHarold' }],
      ['albury', 'Lean back. Lean BACK. ...There. Harold, did you see that?'],
      ['pastorj', 'Quietest Saturday night we\'ve had in a year. I almost miss the clack. Almost.']] }] },

  bubbles: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Bubbles Car Wash', who: 'washkid', goal: 'Talk to the kids at Bubbles Car Wash', say: [
      ['washkid', 'We washed forty-one cars. Forty-one. At ten bucks a car, that\'s four hundred and ten dollars, and he said it was for the league, and we said okay, because, like, who lies about a youth league?'],
      ['washkid', 'Two of us are on the real Eastside rec league. Our uniforms are from 2011. That\'s why we did it.'],
      ['choice', [{ t: 'Ask Sgt. Vargas about the real league', set: 'sudsLeague', reply: [['vargas', '(over the radio) The rec league? I coach the fourteen-and-unders on Tuesdays. Those uniforms are from 2011 because I bought them in 2011. Let me make some calls.']] },
        { t: 'Promise to get their money back if you can', set: 'sudsMoney', reply: [['washkid', 'Can you do that? Like, legally? Okay. Okay, cool. I\'m telling everybody you said that. No pressure.']] }], 'Forty-one cars']] },
    { at: 'Bubbles Car Wash', who: 'washkid', goal: 'Wrap it up at Bubbles Car Wash', say: [
      ['disp_drummond', '(over the radio) Eastside, Drummond. One, the van from Gas & Go was stopped on the highway this morning. Two, the cash box was in the back. Three, it had a label on it: POLICE YOUTH LEAGUE. He labeled it.', { if: 'sudsStatements' }],
      ['vargas', 'A whole car wash of kids, scammed. You know what we do now? We hold a real one. Same lot, Saturday, every dollar to the league, and I stand there in a sponge costume.', { if: 'sudsLeague' }],
      ['washkid', 'He said sponge costume. Did you hear that? He said it on the radio. There\'s no going back.', { if: 'sudsLeague' }],
      ['washkid', 'The court made him pay it back. Four hundred and ten dollars. We\'re buying jerseys. We\'re putting BUBBLES on the back.', { if: 'sudsMoney' }]] }] },

  wallwords: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Corner Cell Repair', who: 'tran', goal: 'Hear Mr. Tran out at Corner Cell Repair', say: [
      ['tran', 'His name is Wade. He worked here for a year. Good with phones. Bad with people. I let him go in May after he screamed at a customer.'],
      ['tran', 'He posts that I stole from him. I didn\'t. He posts pictures of my store at night. Now my daughter, Linh, she won\'t close up alone. She\'s nineteen. She shouldn\'t be scared of her own job.'],
      ['narr', 'Linh is behind the counter, re-reading the same repair ticket. She hasn\'t looked up once.']] },
    { at: 'Corner Cell Repair', who: 'linh', goal: 'Talk to Linh at Corner Cell Repair', say: [
      ['linh', 'My dad thinks I don\'t read the posts. I read all the posts. Wade knows what time I close. He wrote it.'],
      ['choice', [{ t: 'Walk her through what to save and report', set: 'linhSafety', reply: [['narr', 'Screenshots with dates. The posts, the time she closes, the hoodie on the camera. Who to call and what to say. You write the case number on the back of her hand in pen and she laughs for the first time.'], ['linh', 'Okay. It\'s a list. I can do a list.']] },
        { t: 'Ask a unit to be near the shop at closing', set: 'linhUnit', reply: [['duarte', '(over the radio) Duarte. I\'ll be on my bike at the corner at nine every night this week. She won\'t see me. Or she will. Whichever helps.']] }], 'Linh']] },
    { at: 'Corner Cell Repair', who: 'tran', goal: 'Close it out with the Trans at Corner Cell', say: [
      ['vargas', '(over the radio) Vargas. The threat team looked at the whole pattern. They\'re getting a protection order in front of a judge this week, and somebody\'s going to sit down with Wade and his family. That\'s a win. That\'s a quiet win.', { if: 'btamReferral' }],
      ['vargas', '(over the radio) Vargas. Vandalism report\'s filed. The posts kept going, though. I\'m sending it to the threat team anyway. Next time, look at the whole picture.', { if: 'btamVandal' }],
      ['tran', 'She closed alone last night. She called me after. "Dad, I locked up. I\'m fine." Three sentences. Best three sentences of my year.'],
      ['linh', 'I put the case number in my phone. I still have it on my hand, too. I\'m not washing it.']] }] },

  ring: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Sunrise Café', who: 'finder', goal: 'Hear the kid out at the Sunrise Café', say: [
      ['finder', 'My name\'s Omar. I found it right outside the nail place. I looked it up on my phone. It\'s gold. It\'s old. It\'s worth like a month of my mom\'s rent.'],
      ['finder', 'I didn\'t sell it. I went to the jeweler to find out how much I was supposed to feel bad about it. Then I just sat here for an hour.'],
      ['choice', [{ t: 'Have Omar hand it back to the groom himself', set: 'omarReturns', reply: [['finder', 'Me? In person? He\'s going to think I took it. ...Okay. Okay. Yeah. I should.']] },
        { t: 'Take the ring and log it yourself', set: 'omarLogged', reply: [['finder', 'Cool. Okay. Can I go? I\'ve been here so long the waitress started charging me rent.']] }], 'Omar']] },
    { at: 'Glam Nails', who: 'groom', goal: 'Get the ring back to the groom at Glam Nails', say: [
      ['groom', 'Is that it? That\'s it. That\'s Grandma Lucia\'s ring. Oh, I could kiss you. I won\'t. I\'m engaged. Almost engaged.'],
      ['finder', 'I found it. I didn\'t take it. I mean, I had it. But I didn\'t take it.', { if: 'omarReturns' }],
      ['groom', 'You held onto a ring worth that much for an hour and you brought it back? Kid, you have no idea what you just did for my family.', { if: 'omarReturns' }],
      ['narr', 'At 6:58 he leaves for the Sunrise Café, where his girlfriend is waiting by the window, with a ring in his pocket and a fifteen-year-old named Omar trailing three steps behind as a witness.', { if: 'omarReturns' }],
      ['groom', 'She said yes! She said yes! And Omar\'s coming to the wedding. Table three. With his mom.', { if: 'omarReturns' }],
      ['groom', 'She said yes. I almost blew it with a manicure. Thank you, officer. Thank the kid, too. Tell him he did good.', { if: 'omarLogged' }]] }] },

  donutstake: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Tony\'s Pizza', who: 'tony', goal: 'Talk security with Tony at Tony\'s Pizza', say: [
      ['tony', 'Lights, huh? I got one bulb back there. It\'s been out since the Bush administration. The first one.'],
      ['tony', 'You know why he picks my door? My dad put that door in in 1981. It\'s wood. Everybody else on the strip has steel.'],
      ['choice', [{ t: 'Walk the alley with him and point out the weak spots', set: 'tonyWalk', reply: [['narr', 'The wood door. The dumpster you can climb to reach the window. The bulb. You write it up as a list. He reads it like a menu.'], ['tony', 'Steel door, motion light, move the dumpster. Seven hundred bucks. That\'s a lot of pizza. That\'s fewer break-ins than pizza. Okay.']] },
        { t: 'Tell him to call the non-emergency line if it happens again', set: 'tonyCall', reply: [['tony', 'I called the last two times. That\'s how I met Pike. I\'d like to meet fewer people from the police, no offense.']] }], 'Tony\'s back door']] },
    { at: 'The Donut Stop', who: 'pike', goal: 'Debrief with Pike at The Donut Stop', say: [
      ['pike', 'So the guy from room 9 hit eleven businesses on four strips. Eleven. He wrote them all down in a notebook like a to-do list. Tony\'s was crossed out twice.', { if: 'tonyLights' }],
      ['pike', 'We sat on the alley until four. Nothing. He hit a laundromat on the other side of the highway instead. I ate nine donuts. Nine. For nothing.', { if: 'tonySit' }],
      ['pike', 'I\'m starting to think the donuts were not actually a good cover.'],
      ['tony', '(over the radio) Steel door\'s in. Light works. I put a sign on it that says "This door is steel now." Is that too much?', { if: 'tonyWalk' }]] }] },

  odell: { steps: [{ o: 0 }, { o: 1 }, { o: 2 },
    { at: 'Manatee Lumber', who: 'odell', goal: 'Follow up with Frank Odell at Manatee Lumber', onlyIf: 'odellBoth', say: [
      ['narr', 'Three weeks later. You told him you\'d call personally. You stop by instead.'],
      ['odell', 'You came back. ...Huh. You actually came back.'],
      ['odell', 'Sensor\'s fixed. Haven\'t had a false alarm since. Detective called me Tuesday. They found some of my copper at a scrap yard in Industrial Park. Three hundred pounds of it. Some guy\'s going to court.'],
      ['odell', 'My wife says I\'ve complained less this month than in the last ten years. She\'s worried. She thinks I\'m sick.'],
      ['narr', 'He hands you a cedar birdhouse he made. There\'s a little sign on the roof: CALLED ME BACK.']] }] },
  // ===================== Riverside =====================
  gameday: { steps: [{ o: 0, say: [['whitfield', 'Game day. Forty thousand people, one bridge.'], ['whitfield', 'Keep the lanes open. Stay where they can see you.']] },
    { o: 1, say: [['gus', 'This little guy in the Gators jersey says he lost his mom. I\'ve been teaching him to fish so he won\'t cry. He\'s a natural.'], ['kidgd', 'I\'m Milo. I\'m six. I caught a stick.'],
      ['choice', [{ t: 'Radio a description and wait with Gus', set: 'kidRadio', reply: [['disp_coleman', '(over the radio) The mother is at Gate C. She is on her way to the park now. Please tell Mr. Gus she says thank you.']] },
        { t: 'Walk the child back to the stadium info booth', set: 'kidBooth', reply: [['whitfield', '(over the radio) She was walking toward you. You walked away from her. Next time, stay put.']] }]]] },
    { at: 'Riverside Park', who: 'theomom', goal: 'Meet Milo\'s mom at Riverside Park', say: [
      ['narr', 'She comes across the grass at a dead run, still in hospital scrubs, a stadium lanyard swinging around her neck.'],
      ['theomom', 'I worked a night shift and fell asleep in the stands. Asleep! At a football game! I woke up and his seat was empty and I couldn\'t breathe.'],
      ['theomom', 'He was fishing. With a stranger. And you know what, he\'s fine. He\'s more than fine. Look at him.'],
      ['gus', 'He\'s got a good wrist. Don\'t let anybody tell you different, Milo.'],
      ['choice', [{ t: 'Suggest she bring Milo back on Saturday to fish with Gus', set: 'miloFish', npc: { gus: 1 }, reply: [['gus', 'Saturdays at seven. Bring worms. I\'ll bring the patience.']] },
        { t: 'Tell her to get some sleep, and walk them to her car', set: 'miloHome', reply: [['theomom', 'Sleep. What\'s that. ...Thank you. Really. I\'m going to sleep for a day.']] }], 'Milo\'s mom']] },
    { o: 2, add: [['sam', 'Saturday I drove by the park. Old Gus and that kid, two fishing poles, one cooler, zero fish. Happiest people on the river.', { if: 'miloFish' }]] }] },

  garden: { steps: [{ o: 0, say: [['whitfield', 'Small footprints. A watering can. Better tomatoes than mine.']] }, { o: 1 },
    { at: 'Riverside Feed & Seed', who: 'teo', goal: 'Find Teo at Riverside Feed & Seed', say: [
      ['teo', 'She told you I was a stranger in her garden? Great. That\'s great.'],
      ['teo', 'I quit school in October. Her hospital bills. I work here days, so I water her stuff at night, when she\'s asleep, so she won\'t ask why I\'m not in class.'],
      ['teo', 'If she knew I quit for her, she\'d never forgive herself. She\'s been saying "finish school" since I was six.'],
      ['choice', [{ t: 'Tell him about the evening GED classes at the library', set: 'teoGed', reply: [['teo', 'At night? I could do that. I could do that and still water the tomatoes.']] },
        { t: 'Tell him she\'d rather know than wonder', set: 'teoTell', reply: [['teo', 'Yeah. She would. She\'s going to yell at me. Then she\'s going to make me eat.']] }], 'Teo']] },
    { o: 2 },
    { at: 'Willow Street', who: 'benoit', goal: 'Sit with Mrs. Benoit on Willow Street', say: [
      ['benoit', 'Sergeant Whitfield used to come by every year on the anniversary. The flood, you know. He pulled us off this roof in \'04. Me, my husband, Teo\'s mama, and a cat that never forgave him.'],
      ['benoit', 'He brought you? No. You came on your own. Well. Sit down, there\'s tea.'],
      ['benoit', 'My grandson is in night school now. He thinks I don\'t know why he quit. I know why. I raised him. We\'ll fight about it when he graduates.', { if: 'teoGed' }],
      ['benoit', 'He told me. About school, about the bills. I cried, then I hit him with a dish towel, then I enrolled him myself. He starts in January.', { if: 'teoTell' }],
      ['whitfield', '(over the radio) Tell her I\'ll be by.'],
      ['narr', 'The tomatoes are enormous. She sends you home with six.']] }] },

  adrift: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Riverside Marina', who: 'junie', goal: 'Look at the line with Junie at the Marina', say: [
      ['junie', 'Officer, look at the end of the rope. It\'s not frayed. It\'s cut. Clean. Somebody cut it.'],
      ['junie', 'Captain Hal says two other boats came loose this month. Everybody blamed old rope.'],
      ['choice', [{ t: 'Write it up as an attempted theft, with the cut line as evidence', set: 'boatTheft', npc: { hal: 1 }, reply: [['hal', '(over the radio) Cut lines. Three boats. Somebody\'s shopping. Good eyes, both of you.']] },
        { t: 'Tell Mr. Albright to buy better rope and lock up', set: 'boatRope', reply: [['junie', 'Okay. But that rope was cut. I\'m writing it in Captain Hal\'s log anyway.']] }], 'A clean cut']] },
    { at: 'The Rowboat Café', who: 'boatowner', goal: 'Tell Mr. Albright at the Rowboat Café', say: [
      ['boatowner', 'Cut? Someone tried to take her? ...She was my brother\'s. Fergus. He sailed her every Sunday for thirty years. I don\'t even like sailing. I just can\'t sell her.'],
      ['boatowner', 'I lecture people about knots because he lectured me about knots. That\'s all it is.'],
      ['hal', '(over the radio) Two kids from the boat ramp got picked up with a stolen outboard and a pair of bolt cutters. They had a list of boats. His was on it.', { if: 'boatTheft' }],
      ['narr', 'Sunday, you see the blue hull out on the river. Junie is at the tiller. Mr. Albright is sitting up front, lecturing her about knots, smiling the whole time.']] }] },

  fenceline: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Willow Creek Farm', who: 'okoro', goal: 'See the roses at Willow Creek Farm', say: [
      ['okoro', 'These were my mother\'s roses. She planted them the year we got here from Lagos. Forty-one years. He cut them for a fence post.'],
      ['farmer', 'I didn\'t know they were her mother\'s. ...I just thought they were roses.'],
      ['narr', 'Neither of them looks at the other. Both of them look at the stumps.'],
      ['choice', [{ t: 'Tell them about the county\'s free mediation center', set: 'fenceMediate', reply: [['okoro', 'A mediator. Someone who isn\'t a cousin of either of us. ...Fine.'], ['farmer', 'Fine.']] },
        { t: 'Leave the line for a judge and keep the peace until then', set: 'fenceCourt', reply: [['farmer', 'Then we wait. I\'ll keep my side. She keeps hers.']] }], 'The roses']] },
    { at: 'Willow Creek Farm', who: 'gus', goal: 'Hear how it ended at Willow Creek Farm', say: [
      ['gus', 'The mediator split the six inches, three and three. Then Pruett did something nobody saw coming. He went to a nursery in Tampa and found the same roses. Same color.', { if: 'fenceMediate' }],
      ['gus', 'They planted them together. On the line. Right on it. Now neither one can move the fence without killing the roses. Which I think was the point.', { if: 'fenceMediate' }],
      ['gus', 'Court date\'s in March. They don\'t talk. He sent her a card at Christmas. She hasn\'t opened it, but she hasn\'t thrown it out.', { if: 'fenceCourt' }]] }] },

  smoke: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Cypress Lane', who: 'tenant', goal: 'Check back on Mr. Kessler on Cypress Lane', say: [
      ['tenant', 'Officer! You came back. Look. Ten feet. I measured. I used a tape measure and string. My wife says I have a problem.'],
      ['tenant', 'I want to do something for the station. They came out for my brisket. On their day off, practically.'],
      ['choice', [{ t: 'Suggest he cook for the station\'s open house', set: 'briskOpen', reply: [['tenant', 'The open house! Two hundred people! I\'ll need a second smoker. Ten feet from the first one.']] },
        { t: 'Suggest he just drop off a thank-you note', set: 'briskNote', reply: [['tenant', 'A note. Sure. With brisket attached. A note is mostly brisket.']] }], 'Mr. Kessler']] },
    { at: 'Fire Station 3', who: 'bell', goal: 'Stop by Fire Station 3', say: [
      ['bell', 'He set up two smokers at the open house, twenty feet apart, with a fire extinguisher between them like a referee. Fed two hundred people. Kids lined up for the smoke demo.', { if: 'briskOpen' }],
      ['bell', 'He brought a note. And eleven pounds of brisket. The note said "sorry about the railing." The brisket said a lot more.', { if: 'briskNote' }],
      ['bell', 'You want the T-shirt now? Size up. It shrinks.']] }] },

  gator: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Little Paddlers Daycare', who: 'trapper', goal: 'Watch Dale work at Little Paddlers Daycare', say: [
      ['narr', 'Dale arrives in a truck older than the daycare. Twenty-two four-year-olds press their faces to the window.'],
      ['trapper', 'Here\'s what I do. Loop over the snout, tape the jaws, blindfold. A gator in the dark goes calm. Nobody gets hurt. Not me, not him.'],
      ['choice', [{ t: 'Let the kids watch through the window while Dale explains', set: 'gatorWatch', reply: [['narr', 'Dale narrates every step like a nature show. When Mr. Chompers is loaded, twenty-two four-year-olds applaud. Dale bows.']] },
        { t: 'Have the director close the blinds until it\'s over', set: 'gatorBlinds', reply: [['director', 'Blinds closed. They\'re singing a song about Mr. Chompers instead. It has fourteen verses.']] }], 'Mr. Chompers']] },
    { at: 'Little Paddlers Daycare', who: 'director', goal: 'Close it out at Little Paddlers Daycare', say: [
      ['director', 'Dale sent a picture. Mr. Chompers in a big quiet lake out past the preserve. The kids made him a card. It says "Bye Mr. Chompers, don\'t eat anybody."'],
      ['director', 'One of them wants to be a gator trapper now. Her mother is thrilled.', { if: 'gatorWatch' }],
      ['bobby', '(over the radio) Six-footer, relocated, no one bit, card delivered. Best day on the river all month.']] }] },

  hardknock: { steps: [{ o: 0 },
    { at: 'Substation', who: 'whitfield', goal: 'Check in with Sgt. Whitfield after River Bend', say: [
      ['narr', 'Back at the substation, you sit in the car for a while before you go in. Whitfield is at the window. He doesn\'t come out. He waits.'],
      ['whitfield', 'Her boy\'s name was Andre. Nineteen.'],
      ['whitfield', 'My first one was a mother too. 1997. I still know her address.'],
      ['choice', [{ t: 'Ask him how he carries it', set: 'knockAsk', reply: [['whitfield', 'I talk to somebody. Every year. Department pays.'], ['whitfield', 'Took me ten years to start. Don\'t take ten years.']] },
        { t: 'Tell him you\'re fine', set: 'knockFine', reply: [['whitfield', 'Okay.'], ['narr', 'He puts a card on the dash anyway. The department counselor. A phone number, and under it, in his handwriting: "I go Tuesdays."']] }], 'Whitfield']] },
    { at: 'River Bend Apartments', who: 'chaplain', goal: 'Return Andre\'s things at River Bend', say: [
      ['narr', 'A week later. The property from the crash: a phone, a wallet, a graduation tassel from last May, hanging from the mirror.'],
      ['chaplain', 'You don\'t have to come back for this. Most don\'t. You\'re here.'],
      ['narr', 'His mother takes the tassel first. She holds it a long time.'],
      ['andremom', 'You\'re the one who said it. On the porch. You said his name right. Most people get it wrong. They say Andrew.'],
      ['andremom', 'Thank you for saying his name right.'],
      ['chaplain', 'How are you doing, officer? The real answer.'],
      ['narr', 'You tell him the real answer. He listens to all of it.', { if: 'knockAsk' }],
      ['narr', 'You say "fine." He nods like he\'s heard that word a thousand times on this porch. He has.', { if: 'knockFine' }]] }] },

  signs: { steps: [{ o: 0 },
    { at: 'Pelican Diner', who: 'organizer', goal: 'Hear the full story at the Pelican Diner', say: [
      ['organizer', 'You want to know why forty parents are mad about a bus schedule? The new route drops our kids at 6:10. In December that\'s dark. At Ms. Johnson\'s crosswalk, with no light.'],
      ['organizer', 'My son is eleven. He walks that block alone. I\'m not protesting a schedule. I\'m protesting the dark.']] },
    { o: 1 },
    { at: 'Riverside School', who: 'johnson', goal: 'Follow up at the Riverside School crosswalk', say: [
      ['choice', [{ t: 'Write up the unlit crosswalk as a safety hazard for the county', set: 'signsLight', npc: { johnson: 1 }, reply: [['disp_coleman', '(over the radio) Your hazard report was forwarded to county traffic engineering at 2:14 p.m. For the record, I underlined the word "dark."']] },
        { t: 'Tell the parents to keep taking it to the school board', set: 'signsBoard', reply: [['organizer', 'We\'ve been to three board meetings. They have a clock that buzzes when you\'ve talked for two minutes. Two minutes.']] }], 'The dark crosswalk'],
      ['johnson', 'A streetlight. A real one, on a pole, right over my crosswalk. The county put it in Tuesday. Twenty years I\'ve asked for that light.', { if: 'signsLight' }],
      ['organizer', 'We still don\'t love the schedule. But my son walks home under a light now. I can live with that.', { if: 'signsLight' }],
      ['johnson', 'They\'re back with their signs tomorrow. On the sidewalk. Nicely. I\'ll be there in my vest. We\'re all on the same side, honestly.', { if: 'signsBoard' }]] }] },

  biscuit: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Heron Point', who: 'lucia', goal: 'Stay a minute at Heron Point', say: [
      ['lucia', 'He goes to dock three because that\'s where Abuelo\'s boat was. Abuelo took him fishing every morning. Abuelo died in the summer.'],
      ['lucia', 'Mom sold the boat. Biscuit doesn\'t know. He goes and sits there and waits for it.'],
      ['choice', [{ t: 'Ask Junie if Lucia and Biscuit can ride along on a boat sometime', set: 'biscuitBoat', npc: { junie: 1 }, reply: [['junie', '(over the radio) Captain Hal says yes. Saturday mornings. Dog life vest included. We have one. Don\'t ask why.']] },
        { t: 'Tell her Biscuit is waiting because he loved him too', set: 'biscuitLove', reply: [['lucia', 'Yeah. Me too. ...Can I sit on dock three with him sometime? Just to wait with him?']] }], 'Lucia']] },
    { at: 'Riverside Marina', who: 'junie', goal: 'See Biscuit off at the Marina', say: [
      ['narr', 'Saturday, 7 a.m. Biscuit stands in the bow of Captain Hal\'s skiff in a life vest two sizes too big, ears straight back in the wind. Lucia is laughing so hard she can\'t hold the rail.', { if: 'biscuitBoat' }],
      ['narr', 'Saturday, 7 a.m. A little girl and a dog sit at the end of dock three with their feet hanging over the water, waiting for nothing in particular. Junie brings them two hot chocolates and sits down too.', { if: 'biscuitLove' }],
      ['junie', 'He doesn\'t run to the dock anymore. He doesn\'t have to. We bring the dock to him.']] }] },

  marketday: { steps: [{ o: 0, say: [['whitfield', 'Knock. Announce. Listen.'], ['whitfield', 'Reason to think she needs help, we go in.'],
      ['choice', [{ t: 'Get the building manager\'s key and go in together', set: 'linFound', reply: [['narr', 'She\'s on her kitchen floor. She\'s alert, embarrassed and really thirsty. The paramedics take it from there.'], ['lin', 'I said it was nothing. It was something.'], ['whitfield', 'Two more days. Good call.']] },
        { t: 'Leave a card and come back tomorrow', set: 'linLate', reply: [['whitfield', 'Knock again. Louder.'], ['narr', 'A faint voice from inside: "Hello? Hello, I\'m on the floor."']] }]]] },
    { at: 'River Market', who: 'pham', goal: 'Tell Mr. Pham at the River Market', say: [
      ['pham', 'A broken hip. Eighty-four years old and she wanted to sell mangoes with a broken hip.'],
      ['pham', 'Her stall is next to mine for nineteen years. We do not get along. She says my mangoes are sour. They are not sour.'],
      ['choice', [{ t: 'Ask if he could keep her stall open while she heals', set: 'phamStall', npc: { pham: 1 }, reply: [['pham', 'Keep her stall. Sell her mangoes. Next to my mangoes. ...Fine. For six weeks. She will say I did it wrong.']] },
        { t: 'Set up a daily phone check from the building', set: 'linCheck', reply: [['narr', 'The building manager agrees to knock every morning at nine. Mrs. Lin will hate it. Mrs. Lin will get used to it.']] }], 'Mr. Pham']] },
    { at: 'River Market', who: 'lin', goal: 'Visit Mrs. Lin back at the River Market', say: [
      ['narr', 'Six weeks later. Mrs. Lin is back in a folding chair behind her stall, with a cane hooked on the table.'],
      ['lin', 'He kept my stall open. He wrote the prices in the wrong color. He sold more than I do. I will never forgive him.', { if: 'phamStall' }],
      ['pham', 'She has said thank you zero times. Zero. It is the best six weeks of my life.', { if: 'phamStall' }],
      ['lin', 'The building man knocks every morning. Every morning! I am eighty-four, not dead. ...It is nice. Don\'t tell him.', { if: 'linCheck' }],
      ['lin', 'Here. A mango. The sweetest one. Not his. Mine.']] }] },

  // ===================== Industrial Park =====================
  lunch: { steps: [{ o: 0 }, { o: 1 }, { o: 2 },
    { at: 'The Lunch Pail', who: 'gerald', goal: 'Have lunch with Gerald at The Lunch Pail', say: [
      ['narr', 'Noon. Gerald, Trucker Dee and Diesel at a picnic table. Diesel has his own plate. Nobody discussed this.'],
      ['dee', 'You know why he steals sandwiches? I eat in the cab alone, eleven hours a day. He watches me eat every meal. He thinks food is something you take from people you like.'],
      ['gerald', 'That\'s the saddest thing I\'ve ever heard about a dog. Here, buddy. Take my pickle.'],
      ['dee', 'I\'ve been on the road nine years. This is the first lunch I\'ve sat down for with people in maybe two.', { if: 'dieselLatch' }],
      ['gerald', 'Same time tomorrow? Bring the dog. Not my lunch. The dog.']] }] },

  whistle: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Rusty\'s Scrap & Salvage', who: 'carl', goal: 'Bring Carl to Rusty\'s Scrap & Salvage', say: [
      ['carl', 'So it\'s a whistle. A real one. Not a ghost.'],
      ['carl', 'My grandfather was a fireman on the Meridian Line. Not a fire fireman, a train fireman. He shoveled the coal. He said the 1924 whistle could make your teeth hum.'],
      ['rusty', 'Want to pull it? Go ahead. Chain on the left.'],
      ['narr', 'Carl pulls the chain. The sound is enormous and low and old, and every dog in Industrial Park starts howling at once. Carl is crying and laughing at the same time.']] },
    { at: 'Rusty\'s Scrap & Salvage', who: 'rusty', goal: 'Hear what Rusty decided at the salvage yard', say: [
      ['rusty', 'It\'s going to the depot. They\'re mounting it under the old clock. It blows once at every graduation. Starting with your class.', { if: 'whistleMuseum' }],
      ['rusty', 'Day tests only now. Noon. You can set your watch by it. Half the yard does.', { if: 'whistleDay' }],
      ['carl', 'My grandfather would have loved this. Thank you for not telling me it was a ghost.']] }] },

  crywolf: { steps: [{ o: 0, say: [['saito', 'Every alarm is real until it isn\'t. Perimeter. Entry point. Then room by room.'],
      ['choice', [{ t: 'Search systematically, one area at a time', set: 'wolfSearch', reply: [['narr', 'Loading dock: clear. Offices: clear. Back stairwell: the door\'s propped open with a brick, and there\'s a sleeping bag under the stairs.'], ['saito', 'Somebody lives here. Slow now.']] },
        { t: 'Check the door sensor and call it a false alarm', set: 'wolfSkip', reply: [['saito', 'And the stairwell door propped with a brick? Go look. Never assume.'], ['narr', 'Under the stairs, a sleeping bag and a school backpack.']] }]]] },
    { at: 'Palmetto Paper Co.', who: 'sleeper', goal: 'Talk to the kid under the stairs', say: [
      ['sleeper', 'Please don\'t call my stepdad. Please.'],
      ['narr', 'He\'s sixteen. His mom works the overnight shift on the Palmetto Paper floor. He\'s been sleeping under the stairs so he\'s close to her, and so he\'s not at home.'],
      ['sleeper', 'The alarm\'s me. I prop the door so I can get back in after I use the bathroom. I didn\'t know it rang. I\'m sorry. I\'m sorry I made everybody come.'],
      ['choice', [{ t: 'Call the youth crisis line and get his mom off the floor', set: 'wolfShelter', reply: [['saito', 'Good. Crisis counselor\'s on the way. Mom first, then the counselor. No stepdad tonight.']] },
        { t: 'Write a trespass warning and take him home', set: 'wolfHome', reply: [['saito', 'Home is where he\'s scared of. Think about that before you drive him there.'], ['narr', 'You stop. You call his mom instead.']] }], 'The kid under the stairs']] },
    { at: 'Palmetto Paper Co.', who: 'manager', goal: 'Close it out with the manager at Palmetto Paper', say: [
      ['manager', 'His mom is Denise. Twelve years on my floor. I had no idea. None of us did.'],
      ['manager', 'The counselor got them into family housing. Two bedrooms. He\'s back in school. Denise brought in donuts for the whole floor and couldn\'t get through a sentence.', { if: 'wolfShelter' }],
      ['manager', 'We fixed the sensor. The alarm hasn\'t gone off in nine days. I almost miss your officers.'],
      ['saito', '(over the radio) Saito. Day sixty-two. Nobody hurt. Including him.']] }] },

  noseknows: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Big Rig Truck Stop', who: 'hiker', goal: 'Sit with the kid at the Big Rig Truck Stop', say: [
      ['hiker', 'My dad lives in Tallahassee. He said I could come live with him when I turned eighteen. I\'m seventeen and three months. I got tired of waiting.'],
      ['hiker', 'I didn\'t tell my mom. I left my phone so she couldn\'t track it. That was stupid. I know that was stupid.'],
      ['choice', [{ t: 'Let him call his dad from your phone', set: 'hikerDad', reply: [['narr', 'He talks for four minutes. Then he hands you the phone. His dad wants to talk to the officer. "Tell him to go home to his mother," the man says. "Tell him I\'ll come down at Christmas. Tell him I mean it this time."']] },
        { t: 'Wait with him for his mom', set: 'hikerMom', reply: [['narr', 'His mom arrives forty minutes later in a bathrobe and work boots. She doesn\'t yell. She just holds on to him for a long time, standing in the truck stop parking lot.']] }], 'The kid']] },
    { at: 'Big Rig Truck Stop', who: 'dee', goal: 'Thank Trucker Dee at the Big Rig Truck Stop', say: [
      ['dee', 'You know how many kids I\'ve seen walking the highway in nine years? Too many. Most of them I just drove past.'],
      ['dee', 'I\'m glad I picked up the backpack. I almost didn\'t.'],
      ['carrasco', '(over the radio) Carrasco. Pines are a bad place to get lost. You gridded it instead of wandering. Good. I don\'t say good.', { if: 'yardGrid' }],
      ['dee', 'Diesel misses him already. Diesel gets attached.']] }] },

  copper: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Railside Apartments', who: 'copperman', goal: 'Hear the seller out at Railside Apartments', say: [
      ['copperman', 'I was a lineman for the utility for eighteen years. Laid off in August. I know exactly which substations they don\'t check on weekends. I put them up. I know how to take them down.'],
      ['copperman', 'I got two kids and a truck payment. You think I wanted to be this guy?'],
      ['narr', 'Mrs. Kowal is watching from 1D with her notebook open. She writes something down. She underlines it.'],
      ['choice', [{ t: 'Tell him a cooperation statement will matter to the prosecutor', set: 'copperCoop', reply: [['copperman', 'There\'s a guy who buys it from me by the ton. In Tampa. I\'ll tell them everything. I just want to see my kids graduate.']] },
        { t: 'Read him his rights and leave the rest to court', set: 'copperRights', reply: [['copperman', 'Yeah. Okay. I knew this day was coming. I knew it every night.']] }], 'The lineman']] },
    { at: 'Green Bin Recycling', who: 'shonda', goal: 'Close it out with Shonda at Green Bin', say: [
      ['shonda', 'Detective says the Tampa buyer had nine thousand pounds of utility copper in a warehouse. Nine thousand. Our guy was one of eleven.', { if: 'copperCoop' }],
      ['shonda', 'You know the scariest part? A substation with no copper can catch fire. Somebody could have died for a truck payment.'],
      ['railneighbor', '(over the radio) This is Mrs. Kowal. I would like it noted that my notebook was correct. Thank you.']] }] },

  retire: { steps: [{ o: 0 }, { o: 1 },
    { at: 'The Lunch Pail', who: 'packer', goal: 'Stay for Big Mo\'s party at The Lunch Pail', say: [
      ['narr', 'Thirty people in a taco place built for twelve. Somebody made a banner on a pallet: 31 YEARS, 0 ACCIDENTS, 1 UGLY HAT.'],
      ['narr', 'Mo walks in, sees the banner, and stops dead in the doorway. He had no idea. Lupe is crying already.', { if: 'hatParty' }],
      ['narr', 'Mo walks in already knowing. Somebody told him. Lupe\'s fifty texts gave it away. He\'s wearing the hat. He pretends to be surprised, very badly, and everybody lets him.', { unless: 'hatParty' }],
      ['packer', 'I don\'t do speeches. My wife said, "Mo, say something." So I wrote it on my hand.'],
      ['packer', '"I came here at nineteen. I didn\'t know anything. Every one of you taught me something, mostly how not to do it. Thank you. I love you idiots."'],
      ['narr', 'He tries to say more and can\'t. Saito, at the back, out of uniform, raises her coffee.'],
      ['choice', [{ t: 'Tell everybody where the hat was', set: 'moHat', npc: { lupe: 1 }, reply: [['packer', 'Go ahead, laugh. The DOG had it. On the porch. Thirty-one years and the dog\'s the one who takes my lucky hat.'], ['narr', 'The whole room loses it. Lupe has to sit down.']] },
        { t: 'Ask him what the hat means to him', set: 'moStory', reply: [['packer', 'First day, the old foreman handed it to me. Said, "This hat\'s never been hurt. Don\'t ruin its record." I didn\'t.']] }], 'Big Mo'],
      ['saito', 'Thirty-one years and nobody hurt. That\'s the whole job. Congratulations, Mo.']] }] },

  keys: { steps: [{ o: 0 },
    { at: 'Sawdust Lumber Yard', who: 'foreman', goal: 'Bring the keys to the Sawdust Lumber Yard', say: [
      ['foreman', 'Forty trucks. You know what happens if forty trucks miss a delivery? Nine houses don\'t get framed. Nine families wait another month.'],
      ['foreman', 'Ellis and me haven\'t spoken in six years. Over a fence post invoice. Thirty-two dollars. And his mower saved my week.'],
      ['choice', [{ t: 'Suggest he take Ellis a thank-you in person', set: 'keysThanks', reply: [['foreman', 'In person. Six years. Over thirty-two dollars. ...Yeah. Yeah, okay. I\'ll bring the thirty-two dollars.']] },
        { t: 'Suggest he keep a spare key in the office', set: 'keysSpare', reply: [['foreman', 'A spare key. Revolutionary. Twenty-two years running this yard and nobody thought of a spare key.']] }], 'The foreman']] },
    { at: 'Sandhill Sod Farm', who: 'sod', goal: 'Check in with Ellis at Sandhill Sod Farm', say: [
      ['sod', 'He showed up with thirty-two dollars in an envelope. Six years. I told him to keep it and buy me lunch. We had lunch. He still owes me lunch, technically.', { if: 'keysThanks' }],
      ['sod', 'He put a spare key in a coffee can. I know because he told everybody. He\'s very proud of the coffee can.', { if: 'keysSpare' }],
      ['sod', 'Funny what turns up in a bagger.']] }] },

  seals: { steps: [{ o: 0, say: [['saito', 'Chain of custody. Every step, written.'], ['saito', 'One missing signature, a lawyer has a whole afternoon.'],
      ['choice', [{ t: 'Document the gap honestly in a supplemental report', set: 'sealHonest', reply: [['saito', 'Good. The gap is explained, not hidden. That holds.']] },
        { t: 'Ask the tech to just sign it now', set: 'sealFudge', reply: [['saito', 'Backdate a signature? No. Never.'], ['saito', 'Write it exactly the way it happened.']] }]]] },
    { at: 'County Evidence Storage', who: 'evtech', goal: 'Finish the report at County Evidence Storage', say: [
      ['evtech', 'I\'ve worked evidence eleven years. I missed one signature. I was covering two windows and a court runner was yelling at me.'],
      ['evtech', 'Thank you for writing what actually happened. Not what makes me look good. What happened.'],
      ['narr', 'You write it: the time of the viewing, who was present, the seal number before and after, the missing sign-off and why. It takes forty minutes. It\'s the most boring thing you\'ve written all week.']] },
    { at: 'Substation', who: 'saito', goal: 'Hear about the hearing from Sgt. Saito', say: [
      ['saito', 'The hearing was Tuesday. Defense went after the broken seal. The prosecutor handed the judge your supplemental. Judge read it. Motion denied.'],
      ['saito', 'Sgt. Moreau over in Justice Row called me. She asked who wrote it. She wants to meet you.'],
      ['saito', 'You almost asked the tech to sign it after the fact. You didn\'t, because I stopped you. Next time, stop yourself.', { if: 'sealFudge' }],
      ['saito', 'Boring report. Good report. Same thing.']] }] },

  nighttrain: { steps: [{ o: 0 },
    { at: 'Vacant Lot', who: 'railcop', goal: 'Talk with the railroad officer at the Vacant Lot', say: [
      ['railcop', 'Ten years ago, a kid from this same lot. Fourteen. He grabbed a ladder on a car doing twenty. He lived. He lost a leg below the knee.'],
      ['railcop', 'His name is Corey Bell. He runs the railroad safety talks now. He\'s the one who\'d want to meet these three.'],
      ['choice', [{ t: 'Set up a meeting between the teens and Corey', set: 'trainCorey', reply: [['railcop', 'He\'ll come. He always comes. He says he\'s trying to stand in front of every kid that\'s standing where he stood.']] },
        { t: 'Leave it with the warnings and the parents', set: 'trainEnough', reply: [['railcop', 'Maybe it\'s enough. I\'ve thought that before.']] }], 'The railroad officer']] },
    { at: 'Vacant Lot', who: 'teens', goal: 'Be there when Corey meets the teens', onlyIf: 'trainCorey', say: [
      ['narr', 'Corey Bell is thirty-four, tall, easy to laugh. He sits on a cinder block across from the three of them and rolls up his left pant leg without saying a word.'],
      ['coreyb', 'Twenty miles an hour. That\'s all it was. I thought it was slow.'],
      ['coreyb', 'I\'m not here to scare you. Okay, I\'m a little bit here to scare you. Mostly I\'m here because nobody came and sat on a cinder block with me.'],
      ['teens', '...Can we ask questions? Like, any questions?'],
      ['coreyb', 'Any questions. That\'s the deal.']] },
    { at: 'Eastline Rail Yard', who: 'railcop', goal: 'Close it out at the Eastline Rail Yard', say: [
      ['railcop', 'Nobody on the cars since. Two of them signed up to help at Corey\'s safety day in the spring. One said he wants to be a railroad cop. Lord help me.', { if: 'trainCorey' }],
      ['railcop', 'Quiet three nights running. I\'ll take quiet.', { if: 'trainEnough' }],
      ['carrasco', '(over the radio) Carrasco. That train doesn\'t stop for anybody. Glad nobody had to learn that the hard way this month.']] }] },

  fizz: { steps: [{ o: 0, say: [['saito', 'Announce. Search. Cover each other. Slow.'],
      ['choice', [{ t: 'Announce loudly, then search room by room', set: 'fizzAnnounce', reply: [['narr', 'Behind the syrup tanks you find a raccoon, very sticky and very guilty. And a door latch that was never fixed.'], ['saito', 'Raccoon. Logged. Bad latch. Logged.'], ['saito', 'Still the right way to do it.']] },
        { t: 'Go in quietly to catch anyone inside', set: 'fizzQuiet', reply: [['saito', 'Announcing protects you. And anybody inside who belongs there.'], ['narr', 'Something hisses behind the syrup tanks. A raccoon, very sticky and very guilty.']] }]]] },
    { at: 'Sunrise Bottling', who: 'bottler', goal: 'Settle up with the owner at Sunrise Bottling', say: [
      ['bottler', 'A raccoon. In my orange syrup. I\'ve made Sunrise Fizz in this building for twenty-six years and a raccoon has finally tried it.'],
      ['bottler', 'You know, my dad started this place with a used bottling line and a recipe he got from a Cuban grandmother in Ybor. Everybody said soda was dead. Everybody\'s always saying something\'s dead.'],
      ['choice', [{ t: 'Help him list what to fix so it doesn\'t happen again', set: 'fizzFix', reply: [['bottler', 'Latch, vent screen, trash lids. Three things. I can do three things. My dad would\'ve done them in 1981.']] },
        { t: 'Suggest he call animal control for the raccoon', set: 'fizzAC', reply: [['bottler', 'They\'re coming at two. I\'m naming him. Mr. Fizz. Don\'t judge me.']] }], 'The bottler']] },
    { at: 'Substation', who: 'saito', goal: 'Report to Sgt. Saito at the Substation', say: [
      ['saito', 'One raccoon. One latch. Nobody hurt.'],
      ['saito', 'You announced. A person behind those tanks would know who you were. That\'s why.', { if: 'fizzAnnounce' }],
      ['saito', 'You went in quiet. It was a raccoon this time. Next time it\'s a night janitor with headphones and you\'re both scared. Announce.', { if: 'fizzQuiet' }],
      ['saito', 'He sent a case of Sunrise Fizz for the substation. Orange. Bolt knocked one off the counter. Bolt is not allowed in the substation.'],
      ['carrasco', 'Sunrise Fizz was the Heller building\'s vending machine soda in 2009. I drank about a thousand of them on the forklift. ...It\'s good. I said it\'s good.']] }] },
  // ===================== Justice Row =====================
  exhibit: { steps: [{ o: 0 }, { o: 1 }, { o: 2 },
    { at: 'Justice Plaza', who: 'moore', goal: 'Hear the cat\'s story at Justice Plaza', say: [
      ['moore', 'You want to know why the judge won\'t start without her? Sit down. Nineteen years, I\'ve told this twice.'],
      ['moore', 'Judge Thornbury\'s husband died the week of a very ugly trial. She came in anyway. A gray kitten walked in off the steps and sat in front of the jury box like she\'d been summoned.'],
      ['moore', 'The judge laughed. First time all week. She said, "Let the record show the court has a witness." The cat\'s been here ever since. Same step. Same sunny spot.'],
      ['choice', [{ t: 'Ask if the judge knows you found her', set: 'catJudge', reply: [['moore', 'She knows. She asked for your name and wrote it on her blotter. She doesn\'t do that.']] },
        { t: 'Ask what happens when Exhibit A gets old', set: 'catOld', reply: [['moore', 'She\'s already old. Fourteen. We don\'t talk about it in the courthouse. ...I wrote her a poem for that day. It\'s in my desk. Don\'t tell her.']] }], 'Bailiff Moore'],
      ['narr', 'Exhibit A climbs onto the warm step, turns around twice, and goes to sleep facing the door of Courtroom 2A.']] }] },

  pike: { steps: [{ o: 0, pre: [
      ['pike', 'Can I tell you something first? I almost washed out in week six. Report writing. I had to retake the module.'],
      ['pike', 'I talk this much because if I stop talking I start wondering whether I\'m good enough for this. That\'s the secret. That\'s the whole Pike secret.'],
      ['pike', 'And Sgt. Moreau reads every report on Justice Row twice. Twice! I\'m going to be the one who gets a case thrown out. I can feel it.']] },
    { o: 1 }, { o: 2 },
    { at: 'Veterans Memorial Park', who: 'pike', goal: 'Find Pike at Veterans Memorial Park', say: [
      ['pike', 'She sent it back ONCE. One time! Moreau sends the chief\'s reports back twice. I\'m getting it framed.', { if: 'helpedPike' }],
      ['pike', 'I wrote the next one myself. Who, what, when, where, how. It\'s boring. It\'s so boring. It\'s beautiful.', { if: 'helpedPike' }],
      ['pike', 'Moreau called me in. She asked me what "contemporaneous" meant. It was in my report. I didn\'t know. I wanted to sink into the floor.', { if: 'wrotePike' }],
      ['pike', 'I\'m not mad. I just need to learn it myself. Next time, sit with me instead? Even if it takes all night.', { if: 'wrotePike' }],
      ['pike', 'Navarro and I fixed it together. Three hours and two espressos. Moreau said "rough, but true." I\'ll take rough and true.', { if: 'leftPike' }],
      ['narr', 'Pike skips a stone across the fountain. It bounces once and sinks. He looks delighted anyway.']] }] },

  walkin: { steps: [{ o: 0 }, { o: 1 },
    { at: 'County Courthouse', who: 'walkin', goal: 'Sit in on Darnell\'s hearing at the Courthouse', say: [
      ['narr', 'First appearance, 9 a.m. Darnell in a county jumpsuit. In the third row, a girl of about eight in a school uniform holds her grandmother\'s hand and waves at him with two fingers.'],
      ['narr', 'The judge reads the arrest report. When she reaches the line about him calling ahead and turning himself in, she stops and reads it again.', { if: 'walkinNoted' }],
      ['narr', 'The judge reads the report. It\'s short. Failure to appear, taken into custody. She looks at Darnell over her glasses for a long time.', { unless: 'walkinNoted' }],
      ['choice', [{ t: 'Stay until the end', set: 'walkinStay', reply: [['narr', 'Released on his own recognizance, new court date in three weeks. The girl in the third row doesn\'t wait for the bailiff. She runs.']] },
        { t: 'Head back out on patrol', set: 'walkinLeave', reply: [['narr', 'On your way out you hear a new date set. Through the door, a little girl yells "DADDY" in a courtroom, and nobody tells her to be quiet.']] }], 'First appearance']] },
    { at: 'Freedom Bail Bonds', who: 'ray', goal: 'Close it out with Ray at Freedom Bail Bonds', say: [
      ['ray', 'He called me from the courthouse steps. You know what he said first? Not "I\'m out." He said "they were nice to me." Like it surprised him.'],
      ['ray', 'Thirty years doing this. The ones who turn themselves in, nine out of ten, I never see again. That\'s the good kind of never.'],
      ['wells', '(over the radio) Wells. I drove him over this morning. Seat belt, nice and slow. He talked about his kid the whole way. Good one, cadet.']] }] },

  propbag: { steps: [{ o: 0 },
    { at: 'Public Defender', who: 'pd', goal: 'See the defender at the Public Defender', say: [
      ['pd', 'Your count is clean. I watched it twice. Two hundred, counted out loud, in front of him.', { if: 'propVideo' }],
      ['pd', 'I got the video by subpoena. Two hundred, counted out loud. It would\'ve saved us both a week if you\'d just sent it.', { unless: 'propVideo' }],
      ['pd', 'Here\'s my problem. He still swears it was three hundred. He\'s not a liar. He\'d been up for two days. Something happened to that hundred.'],
      ['choice', [{ t: 'Ask Sgt. Ibarra for any other video from that night', set: 'propBoth', reply: [['propoff', '(over the radio) Detectives pulled a gas station camera for something else that night. I\'ll queue it up. Come by.']] },
        { t: 'Tell her the count is the count', set: 'propCount', reply: [['pd', 'It is. I just hoped somebody would care where it went.']] }], 'The missing hundred']] },
    { at: 'County Records Annex', who: 'propoff', goal: 'Watch the pump video with Sgt. Ibarra', onlyIf: 'propBoth', say: [
      ['narr', 'Gas station camera, an hour before the stop. Ibarra slows it down. A man at pump four hands five twenties to a young guy in a hoodie and hugs him.'],
      ['propoff', 'He came in with three hundred. Then he gave a hundred away. People don\'t remember things like that, on the worst day of their year.'],
      ['propoff', 'Twenty-two years in this room. People think property is boxes. It\'s really people\'s worst days, in bags, with tags on them.']] },
    { at: 'County Jail', who: 'pd', goal: 'Meet the defender at the County Jail', say: [
      ['pd', 'I showed him. The young guy is his nephew. He\'d given him rent money and forgot. He put his head in his hands and said, "I told everybody in here the cops robbed me."', { if: 'propBoth' }],
      ['pd', 'How often does an officer hand me the thing that makes the department look right and also makes my client feel less robbed? Almost never. Thank you.', { if: 'propBoth' }],
      ['moreau', '(over the radio) Moreau. Two videos, both shared. That\'s what "complete" looks like. Remember it.', { if: 'propBoth' }],
      ['pd', 'He still tells everyone in here somebody stole his hundred. That\'s how stories about cops get started. Sometimes the whole truth is the kinder one.', { unless: 'propBoth' }]] }] },

  juryduty: { steps: [{ o: 0 }, { o: 1 },
    { at: 'Magnolia Terrace', who: 'juror', goal: 'Check on Mrs. Whitlock at Magnolia Terrace', say: [
      ['juror', 'He called back. Twice. The second time he knew my late husband\'s name. Harold. How does a stranger know Harold?'],
      ['juror', 'I\'m seventy-nine. I have never been scared in my own kitchen. I\'m scared in my own kitchen.'],
      ['choice', [{ t: 'Show her where they found Harold\'s name, and how to block the number', set: 'juryShow', reply: [['narr', 'Harold\'s obituary, two years old, with her address in the guest book. You show her, and you watch the fear turn into something more like anger.'], ['juror', 'They read Harold\'s obituary to rob me. Well. Now I\'m not scared. Now I\'m mad.']] },
        { t: 'Have Dispatch flag her address for a fast callback', set: 'juryFlag', reply: [['disp_benavides', '(on the radio) For the record: Mrs. Whitlock\'s address is flagged. Any call from her goes to the top. Any call about her, too.'], ['juror', 'For the record. I like her. Tell her I said so.']] }], 'Mrs. Whitlock']] },
    { at: 'County Administration', who: 'admin', goal: 'Report back to the jury office', say: [
      ['admin', 'Your warning at the newsstand? Three people called the clerk this week instead of buying gift cards. Three.', { if: 'juryWarn' }],
      ['admin', 'And here\'s a funny one. Mrs. Whitlock\'s name came up in the real jury pool. Next month. Courtroom 2A.'],
      ['narr', 'A month later in 2A, you testify on a traffic case. Juror number four is a small woman in a lavender cardigan who gives you a tiny, very official nod.']] }] },

  otherside: { steps: [{ o: 0 },
    { at: 'Substation', who: 'moreau', goal: 'Prepare with Sgt. Moreau at the Substation', say: [
      ['moreau', 'Tomorrow you\'re on the stand. The defense will ask you the same question four ways. Answer it the same way four times.'],
      ['moreau', 'The prosecutor told me you wanted to keep it "general." On the stand, general is how good cases die. Specific and true. Nothing else.', { if: 'truthVague' }],
      ['moreau', 'If you don\'t remember, you say "I don\'t remember." If you\'re guessing, you say nothing. Read your report tonight. Twice.']] },
    { at: 'County Courthouse', who: 'barnes', goal: 'Take the stand at the County Courthouse', say: [
      ['barnes', 'Officer, did my client make the statement before or after you read him his rights?'],
      ['narr', 'You know he spoke first, in the car, before you could stop him. You don\'t know if it was ten seconds or a minute. The jury is watching you.'],
      ['choice', [{ t: '"Before. I don\'t know exactly how long before."', set: 'standTrue', reply: [['barnes', 'Thank you, officer. No further questions.'], ['narr', 'The judge keeps the car statement out. The case goes on without it. It\'s strong enough anyway.']] },
        { t: '"Right before. A few seconds before."', set: 'standGuess', reply: [['barnes', 'A few seconds. Your report doesn\'t say seconds. Did you time it?'], ['narr', 'You didn\'t. You say so. It takes a long minute in a quiet courtroom, and you feel every second of it.']] }], 'On the stand']] },
    { at: 'Barnes & Ruiz, Attorneys', who: 'barnes', goal: 'Run into Barnes outside Barnes & Ruiz', say: [
      ['barnes', 'My client was convicted. I\'ll appeal, that\'s my job. But I want you to know you did yours.', { if: 'standTrue' }],
      ['barnes', 'You caught yourself. Most people dig in. You didn\'t. That\'s worth more than you think, the next time you\'re up there.', { if: 'standGuess' }],
      ['barnes', 'The system only works if both sides tell the truth. Most days I\'m not sure it works. Today it did.']] }] },

  orderup: { steps: [{ o: 0 },
    { at: 'The Gavel Grill', who: 'cook', goal: 'Get the real story from Cookie', say: [
      ['cook', 'Want to know the funny part? Pell and Vasquez were married. To each other. Divorced eleven years. They\'ve eaten here every Thursday since. Opposite sides of the room.'],
      ['cook', 'Today the window booth was broken. Somebody spilled a milkshake. So it was this booth or nothing.'],
      ['narr', 'Behind you, the two lawyers are splitting fries. One of them laughs at something the other said, then looks furious at herself for laughing.', { if: 'boothShare' }],
      ['narr', 'Out on the sidewalk, the two lawyers are still arguing. It sounds less like a trial and more like a very old habit.', { unless: 'boothShare' }]] },
    { at: 'The Gavel Grill', who: 'lawyerA', goal: 'Come back to The Gavel Grill on Thursday', say: [
      ['narr', 'Next Thursday. The window booth is fixed. Both of them are in the other one anyway, same side, a basket of fries in the middle.', { if: 'boothShare' }],
      ['lawyerA', 'Don\'t read into it. It\'s a strategic alliance. Against the fries.', { if: 'boothShare' }],
      ['narr', 'Next Thursday. Two booths, back to back, both lawyers facing away from each other. Then one of them slides a basket of fries over the top of the seat without turning around.', { unless: 'boothShare' }],
      ['cook', 'Eleven years. And a milkshake did what no judge could. I\'m putting it on the menu. The Mediation Milkshake.']] }] },

  secondchance: { steps: [{ o: 0, pre: [
      ['probationer', 'Eighteen months clean. Eighteen. I had a job at a tire shop. A customer recognized me from the news, and they let me go. Same day.'],
      ['probationer', 'My son is four. He thinks I go to work. I\'ve been sitting on this bench all day so he still thinks I go to work.'],
      ['narr', 'He has a lunch box on his knees. His son decorated it with stickers. One of them is a police car.']] },
    { at: 'The Gavel Grill', who: 'probationer', goal: 'Check on Luis at The Gavel Grill', say: [
      ['probationer', 'Officer! Two weeks on the grill. I told Cookie about my record up front. He said, "Me too, 1994, don\'t make it weird." That was the whole interview.', { if: 'luisWalk' }],
      ['po', '(over the radio) Grant. He reported the next morning, a day late and shaking. I found him the lead at the Grill. He\'s working. Next time, walk him in. It matters.', { unless: 'luisWalk' }],
      ['probationer', 'First paycheck Friday. I brought my son in. He wanted the lawyer booth. He made a motion for more fries. I granted it.'],
      ['probationer', 'Tell your sergeant I\'m still eighteen months. Nineteen in a week.']] }] },

  exhibitb: { steps: [{ o: 0 },
    { at: 'Justice Plaza', who: 'moore', goal: 'Close it out with Bailiff Moore at Justice Plaza', say: [
      ['moore', 'Exhibit B it is. The judge signed an order. On real paper. "In re: the kitten." I\'m having it framed.', { if: 'kittenB' }],
      ['narr', 'On the courthouse steps, Exhibit A is asleep in her sunny spot. Something small and gray is asleep against her side.', { if: 'kittenB' }],
      ['moore', 'Guess who walked into the shelter on his day off and walked out with a gray kitten in a towel. Deputy Wells.', { if: 'kittenShelter' }],
      ['wells', '(over the radio) Her name is Mileage. She rides on the dash of the transport van. Twenty-nine years and nobody\'s been hurt in my van. That includes cats.', { if: 'kittenShelter' }],
      ['moore', 'And Exhibit A still walks to that church every morning and back by nine. Court starts on time. Some things you don\'t touch.']] }] },

  transport: { steps: [{ o: 0 },
    { at: 'County Courthouse', who: 'deputy', goal: 'Ride the transport with Deputy Wells', say: [
      ['deputy', 'Second search turned up a lighter in his sock. Nobody looks in socks twice. You did.', { if: 'transSearch' }],
      ['deputy', 'We searched him again anyway. Lighter in his sock. This morning\'s search missed it. That\'s why.', { unless: 'transSearch' }],
      ['narr', 'The van smells like vinyl and cinnamon gum. Wells tilts the mirror so he can see the back without turning around.'],
      ['deputy', 'Seat belt on? Good. Long ride, short traffic. You need the air up, you tell me. I\'m Wells. You\'re Kenny, it says here. Kenny, what do you like?'],
      ['transported', '...What do I like?'],
      ['deputy', 'Food, music, a team. Something. Twenty minutes to County. Might as well talk about something you like.'],
      ['transported', '...The Marlins. They\'re terrible.'],
      ['deputy', 'They are so terrible. Tell me why you like them anyway.'],
      ['narr', 'For twenty minutes a nineteen-year-old in handcuffs talks about relief pitchers, and Wells argues with every word, and neither of them looks at the jail coming up the road.']] },
    { o: 1, add: [['deputy', 'Christmas cards. Glove box. Go ahead, look.'],
      ['narr', 'Twenty-six of them, rubber-banded, the same handwriting on every envelope. The return address changes over the years. The last nine are from a house in Ocala.'],
      ['deputy', 'Drove him up in \'98. He was a kid, like this one. Treat them like a person on the worst day, and sometimes they remember there\'s another way to be.'],
      ['choice', [{ t: 'Ask Wells what he writes back', set: 'wellsAsk', reply: [['deputy', 'Same thing every year. "Seat belt on. Long ride, short traffic." He knows what it means.']] },
        { t: 'Tell him you\'ll remember the twenty minutes', set: 'wellsKeep', reply: [['deputy', 'Do. Most of this job is twenty minutes nobody sees.']] }], 'Deputy Wells']] }] }
};

// what regulars say once a case is closed: the city remembers
export const EXP_MEMORY = {
  dot: [['side:wallet', 'Kevin\'s pie fund bought three slices this week. One for a nurse coming off a double. She cried into the key lime. That\'s what it\'s for.']],
  pruitt: [['side:clock', 'I go look at that clock every morning now. Five minutes. Funny how long five minutes can be.'], ['side:pigeons', 'That Mateo kid timed a bird with a kitchen timer and a notebook. Faster than me at his age. Don\'t tell him.']],
  delgado: [['side:corner', 'Gio and me, we got a deal now. He does my forms, I don\'t tell people his slices are frozen. They\'re not frozen. I just like to see his face.']],
  okafor: [['side:overdue', 'The Reverend has not missed a Thursday. He has also not finished a single book. We\'re working on it.']],
  ruth: [['side:ruth', 'Entry two hundred and six. The mailman waved at me. First time in nine years. I think he heard about the meeting.']],
  rosa: [['side:forgery', 'That boy\'s mother comes in Tuesdays now. She buys milk and she tells me how many days. Forty-one, last week.']],
  earl: [['side:ghostcar', 'The Kiara kid drives her brothers to school past my shop every morning. Honks twice. I honk back. My nephew thinks I\'m losing it.']],
  dez: [['side:kickflip', 'Mrs. Albury comes every Saturday now. She critiques us. She is so mean. We love her.']],
  gus: [['side:gameday', 'Milo caught his first real fish Saturday. A bluegill the size of a playing card. He wanted to let it go. He named it first. Kevin.']],
  sam: [['side:adrift', 'Junie takes the Albright boat out every Sunday now. Mr. Albright sits up front and criticizes her knots. Best thing on the river.']],
  moore: [['side:exhibit', 'Exhibit A sat in on a murder trial today. Didn\'t move for six hours. Better attention span than the jury.'], ['side:exhibitb', 'Two cats on the steps now. The judge calls it a quorum.']],
  ray: [['side:walkin', 'Darnell came by with his daughter. She drew me a picture. It\'s me, in a yellow jacket, giving a man a key. I don\'t know what the key is. I\'m keeping it.']],
  pike: [['side:pike', 'I read my report out loud to the mirror now. Moreau says that\'s weird. Moreau also says it\'s working.']],
  cook: [['side:orderup', 'Mediation Milkshake outsold the regular shakes two to one this month. Lawyers. They love a symbol.'], ['side:secondchance', 'Luis flips a better burger than me. Don\'t tell him. He\'ll want a raise. He\'s getting a raise.']],
  kim: [['side:sockbandit', 'The sock box has a waiting list now. People bring socks to donate. To the box. Which is for lost socks. I don\'t understand people.']]
};
