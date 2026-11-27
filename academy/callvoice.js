// Your voice on a call. Playtesting said calls felt the same every time: the same choices, the same replies, and you
// never saw how it ended. This module is three fixes that work together:
//  - You speak. Every choice on a call becomes a line your character actually says to the person in front of you,
//    picked from several phrasings, so "Talk" sounds different to a frightened caller than to a furious one.
//  - The scene answers back. What the person says, and what happens, depends on their mood (the city rules' read:
//    calm, nervous, angry or lying) and on whether the way you chose fit them. Same choice, different person,
//    different result.
//  - You see how it ended. Every call closes on what happened after the questions: one of two good endings or a
//    rough one, written for that call, then the person's last word, which depends on how you read them.
// Loop: take a call -> choose how to handle it -> the person reacts to you -> the ending is remembered (the address
// keeps how it ended, so the next visit there opens on it). Reads the city rules (cityRules intent and readRight),
// the caller cast (variety.js), the dialogue engine (@you lines) and the address memory (S.addr).
// Lines never repeat back to back: every pool goes through variety.js's pick(), which remembers what you heard.

// what you say for each way through a call, by the person's mood. {n} is the name you'd use for them.
export const YOU_WAY = {
  talk: {
    calm: ["Thanks for waiting, {n}. Walk me through it from the start. Take your time.", "{n}, I'm here as long as this takes. Tell me what happened, in your own words.", "Okay. Let's slow it down. Start wherever it makes sense to you."],
    nervous: ["Hey. You're okay. I'm going to stand right here. What's your name?", "{n}, take a breath with me. Nothing's going to happen fast. Just tell me what you saw.", "You did the right thing calling. Let's sit down a second, and you tell me in your own words."],
    angry: ["I hear you. You've been waiting, and that's on us. Tell me what's going on.", "{n}, I'm not going anywhere. I want to get this right, so help me understand it.", "Okay. You're upset, and you've got a reason. Start from the top. I'm listening."],
    lying: ["Let's start over, {n}. Slowly this time. Where were you when it started?", "Tell me the whole thing again, from the beginning. I want to make sure I've got it.", "Help me understand the timeline. What time did you first notice something?"],
    none: ["Let's talk this one through before we touch anything.", "Tell me what you're seeing. I'll tell you what I'm seeing.", "Slow is smooth. Walk me through it."]
  },
  observe: {
    calm: ["Give me one second, {n}. I just want to take a look around first.", "Hang on. Before we start, let me see the whole scene.", "Bear with me a moment. I like to look before I ask."],
    nervous: ["Stay right there for me. I'm going to take a quick look around.", "One second. Let me see what we've got here first.", "Okay. Just give me a minute to look things over."],
    angry: ["Give me a minute. I need to see this for myself.", "Hold on. Let me look at it before we talk.", "One second, {n}. I'm looking."],
    lying: ["Stay with me a second, {n}. I'm just going to look around.", "Hang on. Let me take this in before you tell me anything else.", "One moment. I want to see it before I hear it."],
    none: ["Hold on. Let me just look at it for a second.", "Nobody touch anything yet. Eyes first.", "Let me see the whole thing before we start."]
  },
  enforce: {
    calm: ["{n}, here's what's going to happen. I'll take your statement, check the scene, and we'll get you on your way.", "Okay. I need your name, what you saw, and then I'll handle the rest.", "Let's get this done for you. Name and date of birth first, then the short version."],
    nervous: ["I need you to stand right there and answer a few questions. Name first.", "{n}, I'm going to need ID and a statement. Let's do it now.", "Here's how this works. I ask, you answer, and we get through it. Name?"],
    angry: ["{n}, I need you to lower your voice and answer my questions.", "Stop. Here's what happens now. I ask the questions, then I decide what's next.", "Hey. I need quiet so I can hear you. Name first."],
    lying: ["ID, please. Then tell me what happened, short version.", "{n}, I'm going to need identification and a straight answer.", "Name, date of birth, and what you saw. In that order."],
    none: ["Checklist. Top to bottom, every item.", "By the book. Start at the front and work around.", "Let's run it exactly the way we were taught."]
  }
};

// what happens next: [what you see, what they say], by way and mood. Some fit them and some don't, on purpose.
export const WAY_REPLY = {
  talk: {
    calm: [["They tell it start to finish, with times. It's a clean story.", "That's everything. Thanks for not rushing me."], ["It takes a while. They're thorough, and they appreciate that you are too.", "Sorry, that was long. I wanted you to have all of it."], ["They talk, you listen. Halfway through they glance at their watch, but they finish.", "Okay. That's what happened. I appreciate you hearing all of it."]],
    nervous: [["Their shoulders drop. Their hands finally stop moving.", "Okay. Okay. Thank you. I can do this."], ["They sit on the curb. After a minute the words start coming in order.", "I'm sorry. I'm usually not like this. Here's what happened."], ["They take the breath with you, then a second one on their own.", "Sorry. Okay. I'm okay now. Ask me anything."]],
    angry: [["The volume comes down a notch, then another.", "...Fine. Thank you. Nobody's actually listened to me about this yet."], ["They're still mad, but now they're mad at the problem instead of you.", "Alright. I'm not yelling at you. I'm just done with this."], ["They stop mid-sentence, look at you, and start over at a normal volume.", "Okay. Here's the whole thing. Calmly."]],
    lying: [["The story gets longer as they talk. A detail from the start doesn't match the end.", "That's what happened. I mean, roughly. It was a lot."], ["They're friendly and quick with every answer. A little too quick.", "Like I said. Exactly like I said."], ["You listen. They fill every silence, and the times keep shifting.", "Ten minutes ago. Maybe twenty. Does it matter?"]]
  },
  observe: {
    calm: [["They wait, a little puzzled, while you look. Nothing seems out of place.", "Take your time. I'm not going anywhere."], ["You look the whole scene over. It matches what dispatch said.", "Everything's how I found it. I didn't touch anything."]],
    nervous: [["The quiet makes them more anxious. They start pacing.", "Why aren't you saying anything? Is it bad? Is something wrong?"], ["You look around. They watch you look, and their hands start going again.", "Sorry, should I be doing something? I don't know what to do."]],
    angry: [["Standing there silent reads as ignoring them. They get louder.", "Are you even listening? Hello? I'm talking to you."], ["They follow you around while you look, talking the whole time.", "You see? You see what I've been dealing with?"]],
    lying: [["You take your time. Their story doesn't fit what you're looking at, and you can see where it breaks.", "Why are you looking over there? There's nothing over there."], ["Hands, exits, the car, the ground. The one detail that doesn't fit jumps out at you.", "What? Why are you looking at me like that?"], ["You say nothing and look around. They start correcting their own story before you ask.", "Okay, so, actually, I might've had the time wrong before."]]
  },
  enforce: {
    calm: [["They hand you their ID before you finish asking. It's done in minutes.", "Perfect. That's all I wanted. Thank you."], ["Name, statement, done. They look relieved it was this easy.", "Great. I didn't want to make a whole thing of it either."]],
    nervous: [["They shut down. One-word answers, eyes on the ground.", "Yes. No. I don't know. Sorry."], ["They answer, but their voice gets smaller with every question.", "Am I in trouble? I'm the one who called."]],
    angry: [["They square up and dig in. Every answer is an argument now.", "Oh, so now I'm the problem? Unbelievable."], ["They comply, barely, through their teeth.", "Fine. Here. Happy?"]],
    lying: [["They hand you ID and stick to their story. You've got nothing to check it against yet.", "Like I told you. That's all there is."], ["Short questions get short, smooth answers. Too smooth.", "Yep. That's right. Anything else?"]]
  }
};

// the action each way names on the button, so the same three ways read like this call's choices
export const WAY_ACT = {
  talk: ["Let them tell it from the beginning", "Get on their level and ask their name", "Ask what happened, then just listen", "Slow it down and let them talk", "Find somewhere to sit and hear them out"],
  observe: ["Hang back and take in the whole scene", "Watch hands, exits and the ground first", "Say nothing for a minute and look", "Look before you ask anything", "Walk the edge of the scene first"],
  enforce: ["Get ID and a statement, short and direct", "State why you're here and what happens next", "Take charge: name, statement, done", "Run it by the book from the first word", "Ask the questions, set the pace"]
};

// when going straight to it turns into an argument
export const YOU_ARGUE = {
  calm: ["Okay. Let me back up. I'm here because you called, and I want to help.", "You're right, I came in hot. Here's why I'm here.", "Fair. Let me start over. Here's what I'm trying to do."],
  loud: ["I said: step back and answer my questions.", "I'm not going to say it again. Step back.", "This isn't a debate. Step back, now."]
};

// partway through: how you run the conversation
export const YOU_MID = {
  calm: ["Here's what happens next, {n}. I'll write it up, and you'll get a case number. No surprises.", "I'm going to explain every step before I do it, okay?", "You're doing great. Two more questions and then I'll tell you how this goes."],
  brief: ["Who, what, where, when. Let's start with when.", "Short version, {n}. I'll ask, you answer.", "Just the facts for now. We can talk after."],
  canvass: ["Did anybody else see this? Neighbors, people walking by?", "Is there a camera on any of these houses? A doorbell?", "Who else was around? I'd like to talk to them too."]
};
// more of what they say back, so the same caller type doesn't repeat itself across a shift
export const MID_REPLY = {
  calm: ["That helps. Knowing what comes next helps.", "Okay. Thank you for explaining it. Nobody ever does.", "Alright. I can breathe now."],
  brief: ["Around nine. Maybe a little after.", "Got it. Ask away.", "Sure. Go."],
  canvass: ["The guy across the street has one of those doorbell cameras. He'll want to help.", "There was a woman walking a dog. She lives on the corner, I think.", "The store on the end has cameras. They point right at the lot."]
};

// wrapping up
export const YOU_WRAP = {
  case: ["Here's your case number, {n}. If anything else happens, call and give them this.", "I'm writing the case number on my card. Keep it somewhere you'll find it.", "This number is your report. Anybody follows up, they'll use it."],
  resources: ["There's help for this beyond me. Here's a number that can do more than I can.", "I'm writing down a number for you. They can do more than I can.", "I want to connect you with someone who handles this every day. Here."],
  quick: ["You're all set, {n}. Call us if it starts again.", "That's it for now. Take care of yourself.", "Okay. I'm clearing. Call if you need us."]
};
export const WRAP_REPLY = {
  case: ["A case number. Okay. That makes it feel real.", "I'm putting it in my phone right now.", "Okay. So if anything else happens, I call and give them this?", "Thank you. I feel better knowing it's written down."],
  resources: ["I didn't know half of that existed.", "Okay. I'll call them tomorrow. Today, actually.", "Thank you for not just leaving."]
};

// when backup is behind you: what you put on the radio
export const YOU_COVER = {
  ok: ["(over the radio) Show both units on scene. We'll split it up.", "(over the radio) Two units on scene. I'll take the caller.", "(over the radio) Both of us on scene, dispatch. I'll update."],
  skip: ["We're good. They can see us.", "No need to tie up the channel.", "We'll tell them when we clear."],
  wave: ["(over the radio) I'm good here. Go take the holding call.", "(over the radio) Clear to go, I've got this one.", "(over the radio) You can take the next one. I'm fine."]
};

// the last word: what they say as you leave, by mood and whether you read them right
export const LAST_WORD = {
  calm: { good: ["Quick and painless. That's all I wanted. Thank you.", "Honestly, that was easier than calling the cable company.", "You made that simple. I'll tell my neighbors."], rough: ["Thanks. Took a while, but thanks.", "Okay. I figured it'd be faster, but okay.", "Alright. I guess that's done."] },
  nervous: { good: ["Thank you for slowing down for me. Really.", "I feel like I can actually sleep tonight.", "I was so scared when I called. I'm not now."], rough: ["Okay. Sorry I was such a mess.", "Thanks. I'm still kind of shaking, but thanks.", "I'll be okay. I think."] },
  angry: { good: ["Alright. You're alright. Thank you for listening.", "I came out here ready to fight somebody. Thanks for not making it you.", "Okay. That's the first time anyone's taken this seriously."], rough: ["Whatever. Just make sure it doesn't happen again.", "Yeah. Thanks for nothing. No, sorry. Thanks.", "We'll see if anything changes."] },
  lying: { good: ["...Okay. Fine. That's not exactly how it went. You know that.", "You're not going to let that go, are you.", "Fine. You got me. It was my fault."], rough: ["See? Told you. Nothing to it.", "So we're done? Great. Have a good one.", "Like I said, officer."] },
  none: { good: ["Clean. Like it should be.", "That's how it's done."], rough: ["Close enough. Next time, tighter.", "We'll talk about that one later."] }
};

// how each call ended: two good endings and one rough one. The rough one is never a disaster; it's what a sloppy
// version of the job looks like a few minutes later.
export const ENDS = {
  'Inspect a car back from the shop': ["You find a loose lug nut the shop missed. Two turns of the wrench, and the car goes out right.", "Everything checks out, and you sign the sheet with the mileage. Fleet gets the car back on the street.", "You sign off fast. Two hours later, a light on the dash comes on that a walk-around would've caught."],
  'Unit reports a low tire': ["It's a screw in the tread. The car goes to the shop instead of a high-speed call.", "You gauge all four tires cold and log it. The other unit swaps cars before roll call.", "The tire gets aired up and goes back out. It's flat again by midnight."],
  'Prisoner transport just ended': ["Under the back seat you find a razor blade tucked in the seam. It's logged and photographed, and the report says who rode last.", "The back seat is clean, and you write down that you searched it. If anything turns up later, the log protects you.", "You skip the back seat. The next shift finds a baggie under it, and nobody can say whose it is."],
  'Strange smell on patrol': ["It's coolant from a cracked hose on your own car. You pull over before the engine cooks.", "You trace it to a leaking drum behind a shop. Fire takes it from there.", "You roll the window up and keep going. The temp gauge is in the red ten minutes later."],
  'Car idling on dry grass': ["The driver was asleep. You wake him, get the car onto pavement, and the grass under the exhaust is already smoking.", "You get the car shut off and moved before the hot exhaust lights the grass.", "By the time you get him moving, there's a scorched patch the size of a door."],
  'Wheel shaking at speed': ["A wheel weight came off. The shop balances it, and the car's back by lunch.", "You find a chunk of tread separating. That tire was a mile from coming apart.", "You drive it to the shop at speed. The shaking gets worse, and you finish the trip at twenty miles an hour."],
  'Fuel spill across the lanes': ["You close the lanes, keep cars and cigarettes away, and fire lays absorbent. Nobody slides.", "The spill gets boomed off before it reaches the drain. The station manager thanks you twice.", "Traffic keeps moving through it. A motorcycle goes down at the edge of the spill. He's bruised but okay."],
  'Flooded street by the car wash': ["You get the stalled driver out and turn traffic around before anyone else tries it.", "You put up barricades and post at the high end. Three cars turn around instead of drowning.", "A pickup tries to push through behind you and stalls too. Now there are two."],
  'Pothole bending rims': ["You mark it, report it to public works, and it's patched by morning.", "You put a cone over it and call it in. The auto shop stops getting bent rims.", "You note it and move on. Two more cars come in with bent rims before anyone patches it."],
  'Wrong-way driver reported': ["You get ahead of it with lights on the right shoulder. The driver stops, confused and very sorry. Nobody's hurt.", "Units close the on-ramp, and the car pulls over on its own. It's an elderly driver who got turned around at the exit.", "You chase from behind with the siren going. The driver panics and nearly clips a minivan before stopping."],
  'Crash at the mall entrance': ["You work the intersection. Traffic flows, the tow comes, and both drivers exchange info without a shouting match.", "Cars get moved out of the lane, the light gets manual control, and the report has everything it needs.", "You leave the cars where they are. A second fender-bender happens behind the first."],
  'Seat belt talk at drop-off': ["One kid buckles up in front of you and makes his dad do it too.", "The principal asks you to come back next month. Three parents ask for car seat checks.", "The talk runs long. Half the kids are late for class, and nobody remembers what you said."],
  'Load the van for the game': ["Heavy cases low and forward, everything strapped. The van drives like it's empty.", "You load it balanced and check the tie-downs. The gear shows up exactly where it should.", "The heavy stuff went in high. Every turn on the way there, something slides."],
  'SUV rolled on the river curve': ["You get the driver sitting down. Fire finds a head injury he didn't feel. He rides to the hospital.", "Scene protected, driver checked, road coned. The wrecker has it on its wheels in an hour.", "You let the driver keep walking around. He collapses twenty minutes later. Fire takes him, but it was close."],
  'Car spun out by the marina': ["The driver's shaken but fine. You walk her through steering into a skid for next time.", "Nobody's hurt. The car gets pulled out of the grass, and the wet curve gets a warning sign request.", "You clear it fast and don't mention the tires. They're bald, and she'll spin again."],
  'Steering drills at the fire station': ["Hand-over-hand finally clicks. You run the course clean twice.", "Your best lap of the day. The fire crew claps from the bay door.", "You shuffle-steer through it and clip two cones. The crew claps anyway, sarcastically."],
  'Ladder lying in the lane': ["You get it off the road with traffic stopped behind your car. Nobody swerves.", "Lights on, lane blocked, ladder gone. The truck driver comes back for it, red-faced.", "You leave it while you find the truck. A car hits it and sends it bouncing into the next lane."],
  'Ride-along asks about your grip': ["You explain nine and three, and why. She's taking notes by the end.", "She asks five follow-up questions. You know all five answers.", "You fumble the answer. She looks it up on her phone and corrects you, kindly."],
  'Braking drill at the truck stop': ["Straight and stopped short of the cone. Your sergeant nods once.", "You squeeze, don't stab. The car stops straight every run.", "You lock it up, and the car slides past the cone. Run it again."],
  'Child ran into the road': ["The boy's fine, and the driver's shaking. You sit with both of them until his mom gets there.", "Nobody's hurt. You get the driver's info and walk the boy home with his ball.", "You take the driver's statement and leave. The boy's mother calls later, angry that no one checked on him."],
  'Wheels spinning at the light': ["You ease off and feather it. The car grips and goes.", "Light on the pedal, and the tires bite. Smooth.", "You stomp it again. The back end steps out before it grips."],
  'Truck cut the corner at the gate': ["The driver admits it. You get the company info, and the warehouse has a claim number by noon.", "The fence post is down, but nobody's hurt. The report shows exactly where the truck tracked.", "You write it up from memory. The insurance adjuster calls twice with questions you can't answer."],
  'Turn drills at the rail yard': ["Slow in, fast out. You nail the apex three times running.", "Late apex, smooth exit. You feel the car settle.", "You come in hot and run wide onto the gravel."],
  'Patrol car backed into a post': ["The report is honest and complete. Your sergeant signs it without a single question.", "Photos, diagram, statement. It's filed before end of shift.", "The report leaves out that nobody was spotting. Your sergeant sends it back."],
  'Dead end behind the lumber yard': ["Turned in the seat, looking out the back, slow. You're out without a scratch.", "You back out at a walking pace with your partner spotting. Clean.", "You back out on the mirrors and kiss a pallet stack. Paperwork."],
  'Tight turnaround at the scrapyard': ["You back it the whole way at a crawl. Rusty gives you a thumbs-up from the crane.", "You use your spotter and make it out with an inch to spare on both sides.", "You try a three-point turn that becomes a nine-point turn and a scraped door."],
  'Dark road patrol': ["Low beams for oncoming cars, high beams when it's clear. You spot a deer in time.", "You drive it at a speed you can stop in. Nothing jumps out, but you'd have been ready.", "You overdrive your headlights. A tire in the road appears too late to miss."],
  'Fog on the courthouse road': ["Low beams, slow, flares behind the stalled car. The tow gets there without anyone rear-ending it.", "You get the stalled driver off the road and wait with her. Nobody else drives into it.", "You stop with your high beams on and blind yourself in the fog. A car swerves at the last second."],
  'Pedestrian in dark clothes': ["You talk to him and get him a reflective vest from the trunk. He takes it.", "He's walking home from a night shift. You show him the lit crossing a block down.", "You tell him to be careful and leave. Drivers call again an hour later."],
  'Officer needs help': ["You get there fast but in one piece, slowing at every intersection. The fight's over when you walk in.", "Lights, siren, and a clear head. You arrive, and you're useful.", "You blow through a red light. A car you didn't see brakes hard. You get there, shaken."],
  'Crash with injuries': ["You protect the scene, check the injured, and point fire rescue right where they're needed.", "You keep traffic away and keep the worst-hurt driver still and talking until rescue arrives.", "You move one of the drivers before rescue gets there. It turns out his neck was hurt."],
  'Burglar alarm, likely false': ["You check every door anyway. One is unlocked, and a key holder comes to lock up.", "It is a false alarm. A balloon is drifting past the motion sensor. You check the whole building before saying so.", "You roll by without stopping. The next morning the office finds a pried window."],
  'Vehicle fails to stop': ["You let it go and put the tag out. An hour later he's picked up at his house without a chase.", "You terminate, call it in, and dispatch has the plate. Nobody gets hurt tonight.", "You chase for six blocks before your sergeant calls it off. He gets away anyway."],
  'Pursuit heading for the courthouse': ["You set up away from the path and keep the intersection clear. The pursuit ends at a spike strip, and nobody's hurt.", "You hold traffic at the courthouse light. The pursuit goes through with nobody in its way.", "You join as a third car behind the pursuit. Your sergeant pulls you off it, loudly."],
  'Pursuit report due': ["The report is clear and complete, start to finish. It goes up the chain without a single question.", "Every decision is in the report with the reason behind it. Your sergeant signs it.", "The report is missing the termination time. It comes back to you with a red circle."],
  'Proactive patrol: business district': ["Three owners know your name now. One tells you about a car that keeps circling.", "You walk the strip. The coffee shop owner gives you a tip and a free coffee you pay for anyway.", "You drive past without stopping. Nobody knows you were there."],
  'Car with its dome light on in a closed lot': ["It's a man sleeping off a double shift. You make sure he's okay to drive before he leaves.", "The car's empty, the door is unlocked, and there's a purse on the seat. You find the owner.", "You walk up without lighting it up first. You startle the man inside and he startles you."],
  'Neighborhood watch meeting': ["Thirty people show up. You leave with three tips and a plate of cookies.", "You explain what to call in and what to leave alone. The captain asks you back.", "You lecture for forty minutes. The questions you didn't leave time for go to the sergeant instead."],
  'Suspicious person, hands in waistband': ["It's a man holding up pants with a broken belt. You keep your distance until you know that.", "From cover you see the hand come out with a phone. He's waiting for a ride.", "You walk right up to him. It's nothing, but you didn't know that."],
  'Shots-fired report': ["From cover, you find shell casings and a witness. No one's hurt. Detectives take it from there.", "It was fireworks, but you approached like it wasn't. That's the right way to find out.", "You drive right into the garage. It was fireworks, and you got lucky."],
  'Radio check: dead spot': ["You map the dead spot block by block. The tower crew fixes it the next day.", "You report exactly where it drops. Dispatch warns every unit before they go there.", "You say it's fine and leave. A unit can't raise anyone from that block that night."],
  'Channel congestion on a priority call': ["You switch to the tactical channel and stay off the main. The priority call gets the air it needs.", "You hold your traffic until the priority clears. Dispatch thanks you on the air.", "You key up in the middle of it. Dispatch tells you to stand by, not politely."],
  'Run a tag: possible stolen': ["You confirm the hit with records before acting. It's stolen, and the owner gets her car back.", "The hit confirms. You wait for backup, and the driver is in custody without a struggle.", "You act on the hit before confirming. It was cleared last week, and you just detained the owner."],
  'Records request at the terminal': ["Your query reason is logged correctly. Records closes the audit.", "You show the case number for every query. Clean audit.", "One query has no reason attached. You spend twenty minutes explaining it."],
  'Burglary just occurred': ["You hold the scene, and the owner's camera shows the suspect's face. Detectives have a name by dinner.", "You get the direction he ran from three witnesses. A unit picks him up two blocks away.", "You walk through the shop before it's photographed. The footprints are yours now."],
  'Disturbance in progress': ["You park two doors down and listen first. You walk in knowing who's where, and it ends with both of them apart and calm.", "You separate them and talk to each one alone. Nobody leaves in handcuffs, and nobody leaves hurt.", "You pull up right in front of the window. They see you coming, and the room goes very quiet in the wrong way."],
  'Suspicious person at the pumps': ["You talk to him. He's hungry and stuck. The outreach van has a bed for him tonight.", "He leaves when you ask. You give him the outreach number, and he keeps it.", "You run him off. He's back at the other station in an hour."],
  'Officer requests backup: traffic stop': ["You take the passenger side and watch hands. The stop ends with a ticket and no surprises.", "Two of you on scene, one on the driver, one on the car. It goes smoothly.", "You park in the wrong spot and light up the other officer from behind. Nobody can see anything."],
  'Concerning statements by a former employee': ["You document the posts and talk to him. He takes them down, and the threat unit has the file.", "You get the owner a plan and the threat unit a report. Nothing happens, and that's the point.", "You tell the owner it's probably just talk. You don't write it down."],
  'Citizen needs assistance': ["You get the stalled car pushed clear and point the visitor to his hotel. Two problems, one stop.", "Lane cleared, visitor sorted, tow called. He shakes your hand twice.", "You help the visitor but leave the stalled car where it is. Traffic backs up for a mile."],
  'Lockout call': ["You get the child out in minutes. She's hot but fine, and mom can't stop hugging her.", "You break the window farthest from the child. She's out, and she's okay.", "You wait for a locksmith. It takes twenty minutes in the heat. The child is okay, but it was too long."],
  'Well-being check': ["She'd fallen and couldn't reach her phone. Rescue takes her, and her daughter makes it to the hospital before her.", "She's fine. She lost her phone charger. You call her daughter from your own phone.", "No one answers, so you leave. Her daughter calls back the next day, and you have to go back."],
  'Vacation security check': ["All doors locked, one window found open. You close it and note it for the homeowner.", "You check every side. A neighbor says a van was by yesterday, and you note the tag.", "You drive past without getting out. The back door had been pried."],
  'Death notification': ["You tell them in person, in plain words, and you stay until their sister arrives.", "You say it simply and don't rush them. Father Miguel comes when they ask for him.", "You say too much, too fast, in the doorway. They'll remember the doorway."],
  'Aggressive dog loose': ["Animal control catches him with a leash and a sandwich. Nobody's bitten.", "You keep joggers back and give the dog space until animal control gets there.", "You chase the dog. It runs straight through a family picnic."],
  'Alligator in a pool': ["You keep everyone inside and wait for the trapper. The gator goes back to the lake.", "The trapper gets it in ten minutes. The homeowner gets a story for life.", "You try to scare it out with a pool skimmer. It does not leave. The trapper is not impressed."],
  'Vehicle fire': ["You stay upwind and push everyone back a hundred feet. The tire blows, and nobody's near it.", "You keep traffic away and let fire take it. Nobody breathes the smoke.", "You try the extinguisher from too close. Your eyebrows survive. Barely."],
  'Fire alarm activation': ["It's a burnt bag of popcorn in the custodian's office. You wait for fire anyway.", "You stage out front and let fire clear it. A pipe burst in the boiler room, and they'd have been the ones to find it.", "You go in to look before fire arrives. It's smoke from a real electrical fire."],
  'Stolen TV at the pawn shop': ["The serial number matches. The TV is evidence, and the seller's ID is on the pawn slip.", "The match confirms. The owner gets her TV back, and detectives get a seller's name.", "You take the TV without the pawn slip. The seller's info is lost in the shuffle."],
  'Wallet turned in': ["You log it, count it with a witness, and the owner gets it back with every dollar.", "It goes into property with a receipt. The owner calls the next day, amazed.", "You count it alone. When the owner says twenty dollars is missing, you can't prove it isn't."],
  'Landlord-tenant lockout': ["You explain that a lockout needs a court order. The landlord opens the door.", "The tenant gets back in, and the landlord gets the number for the clerk of court.", "You leave it as a civil matter. The tenant sleeps in his car tonight."],
  'Repossession dispute': ["You keep the peace and don't take sides. The car leaves, and so does everybody's temper.", "You stand between them and let the paperwork talk. It's over in fifteen minutes.", "You help the agent hook the car. That's not your job, and the owner files a complaint."],
  'Civil standby': ["She gets her things, and nobody says a word they'll regret. You watch the clock and keep it short.", "Fifteen minutes, three boxes, no argument. You walk her to her car.", "You let it drag for an hour. It turns into an argument about the couch."],
  'Large crowd after the game': ["You hold a line with the other units and give people a way out. The lot empties without a fight.", "Slow, visible, and calm. The bottles stop, and the crowd goes home.", "You wade in alone. The crowd closes behind you until backup gets there."],
  'Burglary alarm at a warehouse': ["You set up on two corners and wait for the dog. The building's empty, and the door gets secured.", "Perimeter first. You find fresh pry marks and a footprint in the mud.", "You go in alone before backup arrives. It's empty, this time."],
  'Building search': ["You clear it room by room with a partner. The suspect is in the attic, and he comes down when told.", "Slow and methodical. You find him behind the boxes, and he gives up.", "You rush it. He slips out a back door you didn't cover."],
  'Suspect fled on foot': ["The perimeter holds. The dog finds him under a boxcar twenty minutes later.", "You lock down the exits and wait. He walks out right into a unit.", "You chase him into the yard alone. He loses you between the cars."],
  'Area search at the lumber yard': ["You grid it with the dog team. He's behind the kiln, and nobody gets hurt.", "Slow and methodical. You find him in a stack of pallets.", "You search it alone and fast. He's gone over the back fence by the time backup arrives."],
  'Arrest on a warrant': ["You confirm the warrant, take him without a fight, and search him before he goes in the car.", "Confirmed, cuffed, searched, and in the car. He thanks you for not making a scene.", "You don't confirm first. It's the right man, but it could easily have been the wrong one."],
  'Transport an arrestee': ["Searched, belted, and watched. The ride is boring, which is the goal.", "You search him twice and check the seat. You make it to the jail with no surprises.", "You don't check the seat first. Something's back there when you get to the jail, and now nobody knows whose it is."],
  'Booking at the county jail': ["Gun locked up, property bagged and sealed, paperwork complete. Booking takes him without a single question.", "Every box filled, every item logged. Ramos actually says \"nice\" out loud.", "The property bag isn't sealed. Booking sends you back to the car twice."]
};
// calls not in the list above (seasonal calls, regulars, tips, pursuits, story calls) end by what kind of call they
// are: [test, two good endings, one rough one]. The first test that matches the title and radio text wins.
export const ENDS_KIND = [
  [/fails to stop|pursuit|racing|won't pull over/i, ["You let it go and broadcast the tag. He's picked up at home an hour later, and nobody got hurt getting him.", "You call it off and give dispatch the plate and direction. The car turns up parked two miles away, engine still warm."], "You stay on him longer than you should. He gets away anyway, and a driver at Main and Bay nearly didn't."],
  [/crash|fender|rolled|spun|backed into|collision|near miss|pole/i, ["Lanes cleared, drivers checked, information traded. The wrecker is gone in under an hour.", "Nobody's badly hurt. You protect the scene, and the report shows exactly what happened."], "You leave the cars in the lane too long. A second car taps the back of the line."],
  [/stall|flood|fog|tree down|signal out|ladder|spill|pothole|high beams|debris/i, ["You get the hazard marked and traffic routed around it before anyone else gets caught.", "Lights on, lane protected, public works on the way. Nobody else drives into it."], "You handle it, but slowly. Two more cars get caught before the road is clear."],
  [/speed|school bus|school zone|unbuckled|asleep|wrong-way|reckless|skater|hanging onto|pickup line/i, ["The driver gets the message and a citation. Nobody gets hurt today.", "You make the stop safely and explain why it matters. He actually listens."], "You make the stop, but you rush it. The driver leaves angry, and nothing changes."],
  [/alarm|building|warehouse|burglar|storage|break-in|pried/i, ["Perimeter first, then a slow, careful search. The building's secured, and the owner has a report.", "You wait for cover and clear it right. Nobody's inside, and now you know it."], "You go in before your cover gets there. It's empty, this time."],
  [/stolen|theft|package|wallet|shoplift|pawn|porch/i, ["Serial numbers, photos and a receipt. The owner gets their property back.", "You log every item with a witness. The report has a name in it by the end of the day."], "Something doesn't get logged. When the owner asks, you can't say where it went."],
  [/dispute|yelling|shouting|argument|disturbance|noise|landlord|repossess|lockout|security holding/i, ["You separate them and let each one talk. It ends without anyone in handcuffs.", "Everyone gets heard, nobody gets hurt, and both sides leave with a plan."], "It ends, but loudly. The neighbors watched the whole thing."],
  [/suspicious|prowler|loiter|hands in|panhandl|trespass|following|followed/i, ["You keep your distance until you know what you're looking at. It turns out to be a person who needed help, not handcuffs.", "From cover, you sort out what's real. Nobody gets hurt, and the caller's question gets answered."], "You walk right up before you know what you're dealing with. It was nothing, but you didn't know that."],
  [/welfare|well-being|heat|elderly|lost|missing|assist|smoky|won't leave/i, ["You stay until they're safe and someone is with them.", "You get them the help they needed, and you're there when it arrives."], "You leave before you're sure. Someone has to come back later."],
  [/dog|alligator|gator|raccoon|snake|animal|deer/i, ["Everyone stays back, animal control does its job, and nobody gets bitten.", "You keep people clear and the animal calm until the trapper gets there."], "You try to handle the animal yourself. It goes about as well as you'd expect."],
  [/fire|smoke|smoking/i, ["You stay upwind, push everyone back, and let fire do its job.", "Traffic held, people clear, rescue waved straight in. Nobody breathes the smoke."], "You get too close before fire arrives. Your eyes water for an hour."],
  [/crowd|party|game|parade|festival|market/i, ["You stay visible and calm, and you give people a way out. The crowd thins on its own.", "A few words, a lot of patience. Everyone goes home."], "You push into the middle of it. It takes three units to get you back out."],
  [/tip|flags you down|meeting|talk|neighbor/i, ["You listen to all of it. Two of the details turn out to matter later.", "You write it down, thank them, and mean it. They'll call you again."], "You half-listen. Later you realize what they were trying to tell you."],
  [/warrant|arrest|transport|booking|custody/i, ["Confirmed, cuffed, searched and belted. It goes by the book, and nobody gets hurt.", "He goes quietly. You search him again before he gets out at the jail."], "You skip a step on the search. It comes back to you before end of shift."],
  [/slip|fall|injur|medical|hurt/i, ["You keep them still and comfortable until rescue arrives, and the report has every detail.", "Rescue takes it from there. You make sure someone has their keys and their phone."], "You get them help, but the report is thin. The insurance company calls you twice."],
  [/drill|inspect|report|tire|records|radio|check|terminal/i, ["Done right and written down. Nobody will have to ask about it later.", "Clean, careful and complete. Your sergeant signs off without a question."], "Done fast instead of done right. It comes back to you before end of shift."]
];
// anything else: endings by how it went
export const ENDS_ANY = [["It's handled. Everyone leaves calmer than when you got there.", "You get what you came for, and the report writes itself.", "It ends quietly. That's the best kind."], ["It's handled, mostly. The rest goes in the report.", "It's done, but you know you could've run it tighter."]];


// how the person you came for reacts when you get something right in front of them, by who they are (variety.js
// caller types). p: you got it right, r: right on the second try, a: when the question was the last thing said.
export const CALLER_REACT = {
  shaken: { p: ["Okay. Okay, that makes sense. I can breathe.", "You sound like you've done this a hundred times. That helps.", "Okay. I believe you. I'm still shaking, but I believe you.", "Thank you. I didn't know any of that."], r: ["Okay. I think I follow now.", "Sorry, my head's everywhere. Okay. Got it."], a: ["What happens to me now? Sorry. I just need to know.", "Can I sit down? I think I need to sit down."] },
  chatty: { p: ["Well, isn't that something. My husband always said the same thing.", "I'm going to tell the whole street you said that.", "See, that's what I told my neighbor. She didn't listen either.", "Well. You learn something every day, don't you."], r: ["Oh, now I see what you mean.", "Ah. That's different. That's very different."], a: ["Now, do you want some coffee before you go? It's still hot.", "You'll come back and tell me how it turns out, won't you?"] },
  annoyed: { p: ["...Fine. That actually makes sense.", "Huh. Okay. That's the first useful thing anyone's told me.", "Alright. I'll give you that one.", "Okay. That's fair."], r: ["Yeah, okay. I see it now.", "Fine. You're right. Moving on."], a: ["So is anything actually going to happen this time?", "Just tell me this is the last time I have to call."] },
  sheepish: { p: ["Oh. Okay. So I wasn't overreacting.", "That makes me feel a lot less dumb, honestly.", "Okay. Good. I really didn't want to waste your time.", "Oh. Huh. I wouldn't have known that."], r: ["Oh. Right. Sorry. Got it.", "Okay. Yeah. That makes sense now."], a: ["Sorry again for calling. But I'm glad I did.", "Should I have called sooner? Next time I'll call sooner."] },
  kid: { p: ["Whoa. Okay. That's actually really cool.", "Can I tell my mom you said that?", "Okay. I'm writing that down. I mean it.", "Huh. They don't teach us that at school."], r: ["Oh. Okay. Yeah, I get it now.", "Wait, okay. That makes more sense."], a: ["Am I in trouble for calling? I'm not, right?", "Can I text my mom now? She's going to freak out."] },
  language: { p: ["(through the interpreter) Thank you. Now I understand.", "(through the interpreter) Good. Nobody explained this to me before.", "Yes, yes. I understand. Thank you.", "(through the interpreter) That is clear. Thank you for slowing down."], r: ["(through the interpreter) Ah. Yes. Now I see.", "Okay. Okay. Yes."], a: ["(through the interpreter) What do I do now?", "(through the interpreter) Thank you for being patient with me."] },
  regular: { p: ["See? I told them. Somebody who knows what they're doing.", "Write that down somewhere. I'm going to quote you.", "Finally. A professional.", "That's what I've been saying for years."], r: ["Okay, okay. Fair point.", "Huh. Alright. I'll allow it."], a: ["Same time next week? I'm kidding. Mostly.", "You'll put in the report that I was right, yes?"] },
  pro: { p: ["Good. That's exactly what I'll tell my staff.", "Clear and simple. I appreciate that.", "That helps. I'll put it in our procedures.", "Perfect. That answers what I was going to ask."], r: ["Understood. Thanks for clarifying.", "Got it. That's clearer."], a: ["Is there anything you need from us for the report?", "I'll have the footage on a drive for you by tonight."] },
  wary: { p: ["...Okay. That's fair. I didn't expect you to explain it.", "Alright. You're alright.", "Huh. Okay. That's not what I thought you'd say.", "Fine. That makes sense."], r: ["Okay. Yeah. I see it.", "Alright. Got it."], a: ["We done here? No offense. I just want this over with.", "So nobody's getting in trouble, right?"] }
};
// your partner's reactions when a question was theirs to ask (Walsh and Park had none and borrowed a caller's lines)
export const PARTNER_REACT = {
  walsh: { p: ["Yep. That's the one.", "Took me five years to learn that. You did it in five seconds.", "Good. Don't tell anybody I said so.", "That's right. The old guys would be proud. Some of them."], r: ["There it is. Second time's still a time.", "Okay. You got there."], a: ["Alright. Let's get back to it.", "Write it down later. Eyes up now.", "Good. Coffee after this one. You're buying."] },
  park: { p: ["Yes. That's it. That's literally in my notes.", "Okay, that was good. I'm writing down that you said that.", "Right. Right. That's the one.", "Nice. I had the same answer. Mostly."], r: ["There you go. I almost said the first one too.", "Okay, yeah. Second try counts."], a: ["Okay. Next thing. What's the next thing?", "Good. I'm making a note. Two notes."] }
};
const ENDS_KEYS = Object.keys(ENDS);
export function installCallVoice(H) {
  const pick = (k, a) => H.pick(k, a);
  // the name you'd use: Mrs. Albright stays Mrs. Albright, Rick Dawson is Rick, "Angela Brooks, manager" is Angela
  const callName = (c) => { const raw = String((c && c.vcn) || '').replace(/\s*\(.*\)\s*/g, '').replace(/,.*$/, '').trim(); if (!raw) return 'sir'; return /^(Mr|Mrs|Ms|Dr|Miss)\.?\s/.test(raw) ? raw : raw.split(/\s+/)[0]; };
  const fill = (t, c) => String(t).replace(/\{n\}/g, callName(c));
  const intentOf = (c) => (c && c.rules && c.rules.intent) || 'none';
  // a line you say, picked without repeating the last few
  const POOLS = { mid: YOU_MID, wrap: YOU_WRAP, argue: YOU_ARGUE, cover: YOU_COVER };
  function say(name, key, c) { const a = (POOLS[name] || {})[key]; if (!a || !a.length) return null; return ['@you', fill(pick('you_' + name + key, a), c)]; }
  // the way you chose, said out loud, and what it got you with this person
  function way(k, c, cid, dflt) {
    const m = intentOf(c), mine = YOU_WAY[k][m] || YOU_WAY[k].none, out = [['@you', fill(pick('yw_' + k + m, mine), c)]];
    const R = (WAY_REPLY[k] || {})[m]; if (R) { const r = pick('wr_' + k + m, R); out.push(['narr', r[0]], [cid, r[1]]); } else if (dflt) out.push(...dflt);
    return out;
  }
  // the mid-call and wrap-up choices: you say it your way, and they answer from a bigger pool than their type alone
  function dressMid(ch, c, cid) { ch[1].forEach((o) => { const k = o.eff2; if (!YOU_MID[k]) return; o.say = [say('mid', k, c)]; const own = ((c.vc || {})[k] || []).concat(MID_REPLY[k]); o.reply = [[cid, pick('mr_' + k + ((c.vc || {}).k || ''), own)]]; }); return ch; }
  const CRIME = /theft|stolen|burglar|break|assault|fight|dispute|disturbance|shout|yell|threat|death|notification|lockout|repossess|warrant|shots|alarm|package|wallet|pawn/i;
  const RES_T = ["Tell them who else can help with this", "Point them to someone who handles this every day", "Give them a number for help after tonight"];
  function dressWrap(ch, c, cid) { const o1 = ch[1][1]; if (o1 && /victim services/i.test(o1.t) && !CRIME.test(c.title + ' ' + (c.text || ''))) o1.t = pick('rest', RES_T); ['case', 'resources', 'quick'].forEach((k, i) => { const o = ch[1][i]; if (!o) return; o.say = [say('wrap', k, c)]; o.reply = WRAP_REPLY[k] ? [[cid, pick('wrr_' + k, WRAP_REPLY[k])]] : []; /* a quick goodbye: their last word is the reply */ }); return ch; }
  // the button for a way: its name and level, then what it means on this call
  const wayAct = (k) => pick('wa_' + k, WAY_ACT[k]);
  // how the call ended, then the last word from the person you came for
  function ending(c, cid, res) {
    const n = res.n || 0, ratio = n ? res.right / n : 1, good = ratio >= .6 && c.readRight !== false || ratio === 1;
    const E = ENDS[c.title] || ENDS[ENDS_KEYS.find((k) => String(c.title).indexOf(k) === 0)]; let line; // a seasonal "Car idling on dry grass at the park" ends like the everyday one
    const K = E ? null : ENDS_KIND.find((x) => x[0].test(c.title + ' ' + (c.text || '')));
    if (E) line = good ? pick('end_' + c.title, E.slice(0, 2)) : E[2]; else if (K) line = good ? pick('endk_' + ENDS_KIND.indexOf(K), K[1]) : K[2]; else line = good ? pick('endg', ENDS_ANY[0]) : pick('endr', ENDS_ANY[1]);
    const read = c.readRight == null ? good : c.readRight && good;
    c.ended = { good, line, read }; // the address remembers how it ended (variety.js afterScene)
    return [['narr', line]];
  }
  // after you wrap up: their last word, which depends on whether you read them right
  function lastWord(c, cid) {
    const e = c.ended; if (!e) return []; const m = intentOf(c), lw = LAST_WORD[m] || LAST_WORD.none, who = m === 'none' ? (H.partnerId() || 'castillo') : cid;
    return who ? [[who, pick('lw_' + m + (e.read ? 'g' : 'r'), e.read ? lw.good : lw.rough)]] : [];
  }
  // the quiz reaction for the person you came for: their own voice, never the same line twice in a row
  function partnerVoice(k) { const R = PARTNER_REACT[k]; if (!R) return null; return { p: [pick('ptp_' + k, R.p)], r: [pick('ptr_' + k, R.r)], a: [pick('pta_' + k, R.a)] }; }
  function voice(c) { const k = c && c.vc && c.vc.k, R = CALLER_REACT[k]; if (!R) return null; return { p: [pick('crp_' + k, R.p)], r: [pick('crr_' + k, R.r)], a: [pick('cra_' + k, R.a)] }; }
  return { voice, partnerVoice, say, way, wayAct, ending, lastWord, dressMid, dressWrap, callName, fill, intentOf };
}
