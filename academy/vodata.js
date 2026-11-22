import { MORE } from './voacts.js'; // more scene decisions, so most of the chapter can be met as a decision
// Vehicle Operations (FBRTP High Liability, Chapter 1): the chapter Patrol City teaches now.
// Lesson numbers are positions in vo.json's lessons list:
// 0 = 1.1 Vehicle Inspection · 1 = 2.1 Hazard Detection · 2 = 2.2 Road and Weather · 3 = 2.3 Proactive Measures
// 4 = 3.1 Handling · 5 = 3.2 Steering · 6 = 3.3 Braking · 7 = 3.4 Cornering · 8 = 3.5 Backing
// 9 = 4.1 Night Driving · 10 = 4.2 Emergency Mode · 11 = 4.3 Pursuits
// The Chapter 5 content these replace is kept in ch5data.js, decide.js and the Chapter 5 bank (ch5.json, facts.json).
export const CHAPTER = {
  id: 'vo', name: 'Vehicle Operations', exam: 'Vehicle Operations Final Exam',
  bank: '../vo.json', facts: 'facts_vo.json', hub: 'https://claude.ai/artifact/QLBEHsVdKGoq3YkSSxsU21',
  open: true // open to every cadet (no 100-question test needed); set false to bring the hub test back as the key
};

// each district's lessons and the name it goes by on the map
export const DISTRICT_LESSONS = [
  ['Unit 1–2 · Inspection and Observation', [0, 1]],
  ['Unit 2 · Roads, Weather and Crash Avoidance', [2, 3]],
  ['Unit 3 · Handling and Steering', [4, 5]],
  ['Unit 3 · Braking, Cornering and Backing', [6, 7, 8]],
  ['Unit 4 · Lights and Sirens', [9, 10, 11]]
];

// dispatch calls by lesson: [title, priority, place kind, what dispatch says]
export const CALLS = {
  0: [['Inspect a car back from the shop', 3, 'garage', 'Fleet says your assigned car just came back from maintenance. Look it over before it goes out.'],
      ['Unit reports a low tire', 3, 'parking', 'A unit in the lot says a tire looks low and something is stuck in the tread.'],
      ['Prisoner transport just ended', 3, 'hq', 'You just dropped off a prisoner at the front desk. Check the car before your next call.']],
  1: [['Strange smell on patrol', 2, 'any', 'A sharp smell is coming through your open window. Find out where it is coming from.'],
      ['Car idling on dry grass', 2, 'park', 'Caller says a car has been parked and running on the grass by the park for an hour.'],
      ['Wheel shaking at speed', 3, 'any', 'Your steering wheel started shaking on the boulevard. Find a safe place and check it out.']],
  2: [['Fuel spill across the lanes', 2, 'gas', 'A delivery truck leaked fuel at the pumps and it is running into the road.'],
      ['Flooded street by the car wash', 2, 'carwash', 'Heavy rain. Callers say the street by the car wash is under water and a car stalled.'],
      ['Pothole bending rims', 3, 'autoshop', 'The auto shop says three cars came in today with bent rims from the same pothole.']],
  3: [['Wrong-way driver reported', 1, 'any', 'Callers report a car coming head-on at traffic in the eastbound lanes.'],
      ['Crash at the mall entrance', 2, 'mall', 'Right-angle crash at the mall entrance light. Respond and work the intersection.'],
      ['Seat belt talk at drop-off', 3, 'school', 'The school asked for an officer at morning drop-off to talk about seat belts.']],
  4: [['Load the van for the game', 3, 'stadium', 'You are taking the department van to the stadium with tonight\'s gear. Load it and go.'],
      ['SUV rolled on the river curve', 2, 'any', 'An SUV rolled over on the curve by the river. The driver is out and walking.'],
      ['Car spun out by the marina', 2, 'marina', 'A driver lost the back end on the curve and ended up in the grass by the marina.']],
  5: [['Steering drills at the fire station', 3, 'firestation', 'Fire rescue is letting your squad use their back lot for steering drills.'],
      ['Ladder lying in the lane', 2, 'any', 'Caller says a ladder fell off a truck and is lying in the lane near the park.'],
      ['Ride-along asks about your grip', 3, 'park', 'Your ride-along wants to know why you hold the wheel the way you do.']],
  6: [['Braking drill at the truck stop', 3, 'truckstop', 'Your sergeant set up a hard-stop drill in the back of the truck stop lot.'],
      ['Child ran into the road', 2, 'apartments', 'A child chased a ball into the road by the apartments. Check on him and the driver.'],
      ['Wheels spinning at the light', 3, 'lot', 'Your rear tires spun when you pulled away on the wet lot. Shake it off and drive.']],
  7: [['Truck cut the corner at the gate', 2, 'warehouse', 'A box truck cut the corner at the warehouse gate and took out the fence post.'],
      ['Turn drills at the rail yard', 3, 'railyard', 'The rail yard road has a quiet 90-degree corner. Run your cornering drill.']],
  8: [['Patrol car backed into a post', 2, 'parking', 'A unit backed into a light post in the lot. Your sergeant wants it written up.'],
      ['Dead end behind the lumber yard', 3, 'lumber', 'You followed a lead into the dead-end lane behind the lumber yard. Time to back out.'],
      ['Tight turnaround at the scrapyard', 3, 'scrapyard', 'The scrapyard lane is too narrow to turn around in. Back out to the road.']],
  9: [['Dark road patrol', 3, 'any', 'Streetlights are out on the back road behind the courthouse. Patrol it tonight.'],
      ['Fog on the courthouse road', 2, 'courthouse', 'Thick fog rolled in. Callers report a car stalled on the courthouse road.'],
      ['Pedestrian in dark clothes', 2, 'park', 'Drivers say someone in dark clothes keeps crossing the road by the park.']],
  10: [['Officer needs help', 1, 'any', 'A unit reports a fight and asks for help. Respond in emergency mode.'],
       ['Crash with injuries', 1, 'parking', 'Two-car crash in the lot with people hurt. Fire rescue is on the way.'],
       ['Burglar alarm, likely false', 3, 'office', 'Alarm company says it is the third false alarm this week. Decide how you respond.']],
  11: [['Vehicle fails to stop', 1, 'any', 'A car you tried to stop for running a red light sped off. Your call how this goes.'],
       ['Pursuit heading for the courthouse', 1, 'courthouse', 'A pursuit from the next district is headed your way. Units are asking for help.'],
       ['Pursuit report due', 3, 'records', 'Your sergeant needs your report on last night\'s pursuit before end of shift.']]
};

// "Something's off": spotted only when you walk or drive close. [what you see, marker kind, road hazard it is (echoes.js)]
export const OBSERVE = {
  0: [['A patrol car\'s light cover is cracked', 'car'], ['A wet patch spreads under a parked cruiser', 'car']],
  1: [['A car idles on dry grass, smoke rising', 'car'], ['A man waves from the curb as you roll past', 'person']],
  2: [['Fluid shines across the lane in a rainbow', 'door'], ['A tree limb hangs low over the road', 'door'], ['A pothole has opened up in the right lane', 'door', 'pothole']],
  3: [['A car sits stopped with its nose in the lane', 'car'], ['A stop sign is knocked flat at the corner', 'door', 'sign']],
  4: [['A van leans hard on the corner, gear piled high', 'car']],
  5: [['Debris lies in the lane ahead', 'door']],
  6: [['Brake skid marks run toward a crosswalk', 'door']],
  7: [['Tire marks swing wide out of a corner', 'door']],
  8: [['A fresh dent on a post behind a parking space', 'door']],
  9: [['A dark figure stands near the edge of the road', 'person'], ['A streetlight is out over the crosswalk', 'door', 'light']],
  10: [['A patrol car blocks a lane with only its flashers on', 'car']],
  11: [['A car with a cracked windshield idles with no plate', 'car']]
};

// Scene decisions: chapter facts asked as what you do in the moment.
// [lesson, situation, right action, [three wrong actions], fact pattern, what happens if right, what happens if wrong]
export const ACTS = [
  // 1.1 Inspection
  [0, 'Something is wedged in your front tire tread.', 'Leave it in and have maintenance pull it', ['Pull it out now and check for a hiss', 'Drive on it and pull it at end of shift', 'Pull it out and top off the tire pressure'], /Do not pull out an object stuck in a tire/i,
    'The shop pulls a long screw and patches the tire. It holds all week.', 'You pull out a long screw. The tire goes flat in the lot and the car is out of service for the shift.'],
  [0, 'You find a wrapped package taped under the car.', 'Back away and call the people policy names', ['Pull it off carefully and look inside', 'Photograph it, then drive to the station', 'Kick it loose and toss it in the trunk'], /possible explosive/i,
    'The bomb squad clears it from a distance. Everyone goes home.', 'You reach for it before anyone has looked at it. The sergeant pulls you back and closes the lot.'],
  [0, 'Engine running. Where do you stand to look for leaks?', 'At the side of the car, never in front of it', ['In front of the car, where you can see best', 'Behind the car, by the exhaust pipe', 'Inside the car, looking at the gauges'], /side of the vehicle, never in front/i,
    'You spot a small drip from the side and report it.', 'You crouch in front of a running car. The sergeant calls you out of there in front of the whole lot.'],
  [0, 'You just finished a prisoner transport.', 'Search under the back seat for anything left', ['Wipe down the seat and head to the next call', 'Check the seat belts and lock the doors', 'Search the trunk for the prisoner\'s things'], /search under the back seat/i,
    'Under the seat: a small baggie he pushed down there. You log it.', 'The next officer to use the car finds a razor blade under the seat.'],
  [0, 'You are loading a long gun and a pry bar in the trunk.', 'Lay them side to side across the cargo area', ['Lay them front to back so they slide in', 'Stand them upright against the back seat', 'Leave them loose so you can grab them fast'], /side to side across the cargo area/i,
    'Rear-ended at a light, nothing comes through the seat.', 'Rear-ended at a light, the pry bar slides forward into the back seat.'],
  // 2.1 Hazard detection
  [1, 'An odd smell comes in, and it is not smoke, gas or propane.', 'Get out of the car and call more resources', ['Roll the windows up and keep on patrolling', 'Turn on the AC to clear it out of the car', 'Drive faster to get out of the area first'], /not as easy to identify as smoke/i,
    'Fire rescue finds a leaking pool chemical tank. Nobody gets sick.', 'You drive on. Ten minutes later your eyes are burning and you have to stop anyway.'],
  [1, 'A raccoon darts across the road ahead at dusk.', 'Brake steady and stay in your lane', ['Swerve hard into the next lane around it', 'Slam the brakes and stop dead in the lane', 'Jerk the wheel toward the shoulder fast'], /small animal can cause worse damage/i,
    'The raccoon makes it. So do the cars behind you.', 'You swerve hard. The car behind you has to dive onto the shoulder.'],
  [1, 'Before changing lanes on the boulevard.', 'Scan beside and behind you, then move over', ['Signal and move, since they will see you', 'Check the mirror ahead of you, then move', 'Speed up first so nobody can pass you'], /before you change speed or direction/i,
    'A motorcycle was in your blind spot. You wait for it.', 'A motorcycle was in your blind spot. Its horn tells you just in time.'],
  [1, 'Your steering wheel starts to shake at speed.', 'Pull off somewhere safe and tell dispatch', ['Keep driving and mention it at end of shift', 'Speed up to see if the shaking smooths out', 'Turn on the lights and drive to the shop'], /pull off the road to a safe place and notify dispatch/i,
    'A front tire is coming apart. You caught it before it failed.', 'The front tire fails on the bridge and pulls you toward the rail.'],
  // 2.2 Road and weather
  [2, 'Two tires drop off the pavement onto the grass.', 'Ease off the speed and hold it straight', ['Jerk the wheel to get back on right away', 'Brake hard and turn back onto the road', 'Speed up and steer back up onto the road'], /do not jerk the wheel/i,
    'You slow down, then ease back on. The car never wobbles.', 'You jerk the wheel. The car shoots across the lane toward oncoming traffic.'],
  [2, 'A sheen of fluid spreads across your lane.', 'Slow down and steer around it, not through it', ['Hold your speed and drive straight across it', 'Brake hard while you are in the middle of it', 'Speed up so you spend less time on top of it'], /reduce speed and steer around it/i,
    'You slip past it and call it in for public works.', 'Your rear tires slide on the patch and you fight the car back into the lane.'],
  [2, 'A deep puddle covers the street ahead.', 'Stay out of it and find another way', ['Drive through it slowly to get across', 'Drive through it fast so you don\'t stall', 'Follow the car ahead, since it made it'], /Stay out of water whenever you can/i,
    'The water is a foot deeper than it looked. Your car stays dry.', 'The water is deeper than it looked. The engine sputters and your brakes are soaked.'],
  [2, 'There is no way around the debris in the lane.', 'Hit it at a slight angle, tires rolling', ['Hit it straight on with the brakes locked', 'Swerve hard at the last second to miss it', 'Brake hard so you hit it nearly stopped'], /slight angle with the tires rolling freely/i,
    'A thump, and the car keeps tracking straight.', 'You lock the brakes. The car slides into it and bends a rim.'],
  // 2.3 Proactive measures
  [3, 'A car is coming at you in your lane.', 'Slow down and move to the right', ['Move to the left to go around it', 'Flash your lights and hold your lane', 'Speed up to get past it faster'], /Moving right gives the oncoming car more room/i,
    'You slow and move right. The other car corrects and slides past.', 'You move left. The other driver corrects to the right at the same moment.'],
  [3, 'Forced off the road, you have to hit something.', 'The hedge and the small trees', ['The parked delivery truck', 'The concrete utility pole', 'The brick mailbox column'], /least to most dangerous: soft objects/i,
    'Branches scrape the doors. You drive away.', 'The car stops dead against something that does not give.'],
  [3, 'Heavy rain and fog on the boulevard. How far back?', 'Six seconds behind the car ahead', ['Three seconds behind the car ahead', 'Two seconds behind the car ahead', 'One car length for every ten mph'], /six-second rule; you count the same way/i,
    'The car ahead brakes hard. You have room to stop.', 'The car ahead brakes hard and you slide closer than you ever want to again.'],
  [3, 'You can\'t avoid hitting the parked car.', 'Hit it with your side and glance off', ['Hit it head on with your brakes locked', 'Hit it with your rear end by spinning', 'Steer straight into it at an angle'], /glance off rather than hitting it head on/i,
    'You glance off the side and roll to a stop. Dented, not hurt.', 'You hit it nose first. The airbag goes off and the car is done.'],
  // 3.1 Handling
  [4, 'The van rolls more than you expect on a corner.', 'Spread the gear so the weight is even', ['Stack the heavy gear high on one side', 'Pile it all against the back doors', 'Take the corners faster to stay steady'], /weight is spread evenly/i,
    'The van feels planted the rest of the way.', 'On the next curve the load shifts and the van leans toward the ditch.'],
  [4, 'Coming up on a corner a bit too fast.', 'Brake before the turn, then steer in', ['Brake hard while you steer into it', 'Steer in first, then brake through it', 'Speed up through it, then brake after'], /brake before the turn, then steer into it/i,
    'You set your speed early and the car takes the corner calmly.', 'You brake mid-turn. The front tires push wide and you run onto the curb.'],
  [4, 'Your car turns less than you are steering for.', 'Ease off the gas and keep the steering in', ['Brake hard and steer harder into it', 'Let go of the wheel and brake hard', 'Speed up so the tires can bite again'], /To correct understeer/i,
    'The front tires grip again and the car comes around.', 'You brake hard. The front tires slide on toward the curb.'],
  [4, 'Turning tight around a fire hydrant at the corner.', 'Swing the front wide so the rear clears', ['Hug the hydrant with the front bumper', 'Cut the corner early to save time', 'Keep the front close and back up after'], /steer the front of the vehicle wide/i,
    'The rear wheels roll by the hydrant with room to spare.', 'The front clears it, but the rear wheel climbs the curb and clips the hydrant.'],
  // 3.2 Steering
  [5, 'You are taking the wheel for the shift.', 'Hands at 4 and 8 o\'clock, firm grip', ['Hands at 10 and 2 o\'clock, tight grip', 'Hands at 12 o\'clock, one-hand grip', 'Hands at 9 and 3 o\'clock, light grip'], /right hand at 4 o'clock and the left hand at 8/i,
    'Your hands are relaxed and ready all night.', 'You grip it hard up high all night and your shoulders ache by midnight.'],
  [5, 'Making a right turn with shuffle steering.', 'Right hand up to 12 and pull down smoothly', ['Cross your left hand over the top of the wheel', 'Let the wheel spin through your loose fingers', 'Left hand up to 12 and push it to the right'], /move the right hand up to 12 o'clock/i,
    'Smooth turn, both hands on the wheel the whole way.', 'Your hands tangle at the top of the wheel and the turn goes wide.'],
  [5, 'A ladder lies in the lane ahead.', 'Look at the open space you want to go to', ['Keep your eyes on the ladder until you pass', 'Look at the mirror to see who is behind you', 'Look down at the wheel as you steer away'], /eye-targeting/i,
    'You look at the gap and the car follows your eyes around it.', 'You stare at the ladder and steer right at it.'],
  // 3.3 Braking
  [6, 'You have to stop fast and the pedal starts pulsing.', 'Keep steady hard pressure on the pedal', ['Pump the brake pedal on and off yourself', 'Lift off the brake until it stops pulsing', 'Shift into neutral and pull the parking brake'], /pulsing brake pedal is normal/i,
    'The ABS does its work and you stop short of the child.', 'You let up when the pedal shudders. The car rolls on farther than it should.'],
  [6, 'Moving your foot to the brake.', 'Pivot on your heel onto the brake', ['Lift your whole leg over to the brake', 'Use your left foot to save time', 'Slide your toes across from the gas'], /pivot your right foot from the gas pedal to the brake/i,
    'Your foot lands square on the pedal every time.', 'Your foot catches the edge of the pedal and slips off.'],
  [6, 'Your rear tires start to spin as you pull away.', 'Let off the gas at once, then ease back on', ['Press harder so the tires dig through it', 'Hold the gas steady until it grips again', 'Brake hard and then floor it once more'], /if the tires start to spin, release the accelerator/i,
    'The tires grab and the car rolls away smoothly.', 'The tires keep spinning and the back end slides toward the curb.'],
  // 3.4 Cornering
  [7, 'Approaching a 90-degree right turn.', 'Finish braking while still going straight', ['Keep braking through the turn as you steer', 'Start braking once you begin steering in', 'Coast in, then brake hard at the apex'], /finish braking while still driving straight/i,
    'Weight settled, the car rolls through the turn steady.', 'You brake mid-turn and the car pushes wide toward the far curb.'],
  [7, 'Rolling into the turn itself.', 'Hold a constant speed through it', ['Speed up hard as you enter it', 'Brake harder as you enter it', 'Coast with no gas as you enter'], /hold a constant speed as you enter/i,
    'The weight shifts steadily and the car stays in your lane.', 'The weight lurches and the car wobbles toward the next lane.'],
  [4, 'Choosing your line through the curve.', 'Late apex: drive deep, then turn', ['Early apex: turn in at the start', 'Center apex: turn in right away', 'No apex: stay in the middle'], /in most cases it is the best cornering method/i,
    'You come out of the curve with room to spare.', 'You turn in early and the car drifts toward the outside edge.'],
  // 3.5 Backing
  [8, 'Backing out of the dead end.', 'Turn your body and look out the back', ['Use only the backup camera screen', 'Look forward and steer by feel', 'Back up fast to get it done quick'], /look through the rear window and scan/i,
    'You see the forklift behind you and wait.', 'You back by the screen alone and tap the forklift you never saw.'],
  [8, 'How fast do you back out?', 'Slowly, with small steering moves', ['Quickly, with big steering moves', 'Quickly, with small steering moves', 'Slowly, with big steering moves'], /Big or quick steering movements in reverse/i,
    'Small, slow moves. The car goes right where you want.', 'A big quick turn of the wheel swings the back end into the fence.'],
  [8, 'Shifting into reverse.', 'Right foot on the brake as you shift', ['Right foot on the gas as you shift', 'Shift first, then find the brake', 'Left foot on the brake as you shift'], /keep your right foot on the brake as you shift into reverse/i,
    'The car stays put until you are ready.', 'The car lurches back before you have looked.'],
  // 4.1 Night driving
  [9, 'Dark road, no streetlights. How fast?', 'Slow enough to stop where your lights reach', ['The posted limit, same as in daylight', 'A little over, since the road is empty', 'Fast on high beams, slow on low beams'], /overdriving the headlights/i,
    'A deer steps out at the edge of your lights. You stop in time.', 'A deer steps out at the edge of your lights. You can\'t stop in time.'],
  [9, 'Oncoming headlights are blinding you.', 'Look toward the white edge line', ['Look right into the lights to judge them', 'Flash your high beams back at them', 'Close one eye until they go past'], /white edge line/i,
    'Your eyes stay ready for the dark once they pass.', 'You stare into the lights. For a few seconds after, you can\'t see the road.'],
  [9, 'Thick fog on the courthouse road.', 'Use low beams to cut the glare', ['Use high beams to see farther', 'Turn your headlights off', 'Use only your emergency lights'], /low beams in fog or smoke/i,
    'The fog stays dim and you can see the road edge.', 'Your high beams bounce off the fog and you see nothing but white.'],
  // 4.2 Emergency mode
  [10, 'Running code to a call. Red light ahead.', 'Slow, and stop if needed, until it is clear', ['Go through at speed with lights and siren', 'Hold your speed, since your siren is on', 'Speed up to clear the intersection faster'], /yielding or stopping when needed/i,
    'A car that never heard your siren rolls through. You were stopped.', 'A car that never heard your siren pulls into the intersection in front of you.'],
  [10, 'It is 3 a.m. on a priority call. Lights?', 'Use them, based on what the call needs', ['Leave them off so you don\'t wake people', 'Use them only on the main roads', 'Leave them off to avoid upsetting drivers'], /not on outside concerns/i,
    'Drivers see you coming and pull over.', 'A driver on the side street never sees you coming.'],
  [10, 'Following another unit to the same call.', 'Leave a proper gap so drivers see you too', ['Stay right on his bumper to clear traffic', 'Pass him so you get there before he does', 'Turn off your siren so his is clear'], /proper gap behind both civilian cars and other emergency vehicles/i,
    'Drivers pull over for the first car and wait for you.', 'A driver pulls out right after the first car and right in front of you.'],
  [10, 'Your heart is pounding and all you can hear is the radio.', 'Notice it and slow yourself down', ['Ignore it, since it keeps you sharp', 'Speed up to get it over with faster', 'Turn the radio off to focus better'], /keep them in check/i,
    'You breathe, ease off and see the car pulling out ahead.', 'Tunnel vision. You never see the car pulling out ahead.'],
  // 4.3 Pursuits
  [11, 'The car you tried to stop for a red light speeds off.', 'Weigh the risks under policy before you go', ['Chase it, since he is the one at fault', 'Chase it until he gives up and stops', 'Let him go and never put out a lookout'], /weigh the risks/i,
    'You call it out and let the plate do the work. He is picked up at home that night.', 'You chase him through a school zone. The sergeant calls it off on the radio.'],
  [11, 'Pursuit starting. First thing on the radio?', 'Tell dispatch you are in pursuit', ['Ask dispatch for a second unit first', 'Stay off the air until he stops', 'Ask for permission to keep going'], /tell dispatch when you start or stop it/i,
    'Dispatch clears the channel and units set up ahead.', 'Nobody knows where you are until the crash.'],
  [11, 'The pursuit heads into heavy traffic near a school.', 'End the pursuit now and give out the plate', ['Close the gap so it ends sooner and safer', 'Keep going but turn your siren off now', 'Hand it to the next unit and follow him'], /danger to the public, to you or to fellow officers is greater/i,
    'You end it and give the plate. He is found the next day.', 'A family car pulls out in front of the violator and gets hit.'],
  [11, 'Setting up a roadblock for the pursuit.', 'Where both directions can see it clearly', ['Just over the hill so he can\'t turn off', 'Right around the curve to surprise him', 'Inside the intersection to stop all cars'], /good roadblock site can be seen clearly from both directions/i,
    'He sees it from far off and stops.', 'He crests the hill with no time to stop.']
];
ACTS.push(...MORE);

// what dispatch sends you to on the last shift (the final exam), by the lesson of each stage's first question
export const CALLFOR = [
  'Your car just came back from the shop. Inspect it before you roll.',
  'Report of a burning smell along the boulevard. Check it out.',
  'Rain coming down hard. Flooding reported near the car wash.',
  'Wrong-way driver reported on the eastbound lanes.',
  'Department van needs to get the gear to the stadium tonight.',
  'Ladder lying in the lane on the river road.',
  'Child ran into the road by the apartments. Driver stopped.',
  'Box truck took out a fence post at the warehouse gate.',
  'You followed a lead into the dead end behind the lumber yard.',
  'Streetlights out on the back road behind the courthouse.',
  'Officer needs help. Respond in emergency mode.',
  'Vehicle failed to stop. Your call how this goes. Policy first.'
];

// the chapter's subjects as inner voices (subjects.js)
export const SUBJECTS = {
  inspect: { name: 'PRE-TRIP', icon: '🔧', col: '#f59e0b', les: [0],
    nudge: ['What did you check before you got in?', 'Tires, fluids, lights. Which one did you skip?', 'The car is part of your gear. Is it ready?'],
    wrong: ['You found it the hard way. Here is the rule:', 'That should have shown up before you rolled. Remember:'], right: ['Ready before it rolls.', 'Checked, and logged.'],
    open: ['Walk around it before you drive it.', 'Under it, inside it, behind it. Then drive.'] },
  eyes: { name: 'OBSERVATION', icon: '👀', col: '#3b82f6', les: [1],
    nudge: ['What are your eyes, ears and nose telling you?', 'Scan far, then near, then behind.', 'What is the other driver about to do?'],
    wrong: ['It was there to see. The rule:', 'You missed the warning. Remember:'], right: ['Seen early, handled easy.', 'Good eyes.'],
    open: ['Window down. Listen to the street.', 'Look farther ahead than feels natural.'] },
  road: { name: 'ROAD SENSE', icon: '🛣', col: '#16a34a', les: [2],
    nudge: ['How much grip does that pavement give you?', 'What is the weather doing to the road?'],
    wrong: ['The road decided that for you. The rule:', 'Water and pavement don\'t care about your call. Remember:'], right: ['You read the road.', 'Smooth, in conditions like these.'],
    open: ['Watch the surface. It changes before you do.'] },
  space: { name: 'SPACE CUSHION', icon: '🛡', col: '#14b8a6', les: [3],
    nudge: ['How much room do you have if he stops right now?', 'Where is your way out?'],
    wrong: ['You ran out of room. The rule:', 'No space, no time. Remember:'], right: ['Room to spare.', 'Belted, spaced, ready.'],
    open: ['Count the seconds to the car ahead.', 'Intersections are where it happens. Look both ways twice.'] },
  physics: { name: 'VEHICLE DYNAMICS', icon: '⚙', col: '#a855f7', les: [4],
    nudge: ['Where is the weight going right now?', 'Pitch, roll or yaw. Which one are you about to feel?'],
    wrong: ['Physics doesn\'t negotiate. The rule:', 'The weight went where you sent it. Remember:'], right: ['Weight under control.', 'The car did exactly what you asked.'],
    open: ['Four small patches of rubber. Everything goes through them.'] },
  hands: { name: 'HANDS AND FEET', icon: '🦶', col: '#ef4444', les: [5, 6],
    nudge: ['Where are your hands? Where is your heel?', 'Smooth in, smooth out.'],
    wrong: ['Your hands and feet got ahead of you. The rule:', 'Rough input, rough result. Remember:'], right: ['Smooth hands, smooth feet.', 'That\'s control.'],
    open: ['Four and eight. Heel on the floor.'] },
  line: { name: 'THE LINE', icon: '🧭', col: '#f97316', les: [7, 8],
    nudge: ['Where do you want the car to be when this is over?', 'Slow is smooth. Smooth is fast.'],
    wrong: ['The car went where you were looking. The rule:', 'Too fast, too soon. Remember:'], right: ['Right on the line.', 'Clean. Nothing touched.'],
    open: ['Set your speed before the turn, not in it.', 'Look back before you roll back.'] },
  night: { name: 'NIGHT EYES', icon: '🌙', col: '#64748b', les: [9],
    nudge: ['Can you stop inside what your lights show you?', 'Where are your eyes when the headlights come?'],
    wrong: ['The dark hid it until it was too late. The rule:', 'Night changes everything but your reaction time. Remember:'], right: ['Seen in time.', 'Night vision intact.'],
    open: ['More crashes after dark. Drive like it.'] },
  code3: { name: 'DUE REGARD', icon: '🚨', col: '#f43f5e', les: [10],
    nudge: ['Your siren is not a shield. Who can\'t hear it?', 'Getting there matters. Getting there safe matters more.'],
    wrong: ['Lights and siren didn\'t stop that. The rule:', 'The call can\'t be helped by a crash. Remember:'], right: ['Fast, and in control.', 'You arrived. That\'s the whole point.'],
    open: ['Breathe. Heart rate up, speed down.'] },
  pursuit: { name: 'PURSUIT JUDGMENT', icon: '⚖', col: '#94a3b8', les: [11],
    nudge: ['Is catching him worth the risk to everyone else?', 'What does policy say, right now, at this speed?'],
    wrong: ['That\'s how pursuits end in court. The rule:', 'It\'s not now or never. Remember:'], right: ['Policy first. Everyone home.', 'Good call, and a defensible one.'],
    open: ['You can\'t control how he drives. Only how you do.'] }
};
