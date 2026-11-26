import { dcast } from './districts.js';
import { ACTS } from './vodata.js'; // the chapter's scene decisions (Chapter 5's are kept in decide.js)
// Variety: keeps patrol from feeling the same twice.
// - a pacing director: quiet after something intense, something spicy after a slow stretch, no repeats too soon
// - calls built from parts: who's calling, what complicates it, what dispatch updates on the way, and what it turns out to be
// - three dispatchers with their own voices, two calls holding at once, addresses that remember you
// - shift conditions, ride-along partners, small unscripted street moments
// - chapter mini-games (observe, BOLO, clear a room, set a perimeter) and fact checks in new shapes (the decision is the question,
//   radio decodes, what's missing, put in order, timed questions)
// - the same treatment for quests: moments, partners, mini-games, new question shapes, and people from closed cases coming back
export function installVariety(H) {
  const S = H.S, L = H.L, rnd = (a) => a[Math.floor(Math.random() * a.length)], shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clock = () => H.clock();

  // ---------- line memory: nothing repeats until the rest of its group has been used ----------
  S.vm = S.vm || {};
  function pick(key, arr) {
    if (!arr || !arr.length) return null; if (arr.length === 1) return arr[0];
    const used = S.vm[key] || [], free = arr.map((_, i) => i).filter((i) => used.indexOf(i) < 0), i = free.length ? rnd(free) : rnd(arr.map((_, k) => k));
    used.push(i); while (used.length > Math.min(arr.length - 1, 12)) used.shift(); S.vm[key] = used; return arr[i];
  }

  // ---------- the director ----------
  const LOG = []; let recentT = [];
  const heat = () => { const t = clock(); return LOG.reduce((a, e) => a + e.w * Math.exp(-(t - e.t) / 150), 0); };
  function logEvent(w) { LOG.push({ t: clock(), w }); while (LOG.length > 20) LOG.shift(); }
  // after a run of intense calls the radio goes quiet for a bit; ambient moments fill the gap
  function hold() { const h = heat(); if (h > 5 && Math.random() < .6) return 18 + Math.random() * 14; if (h > 3.2 && Math.random() < .35) return 10 + Math.random() * 10; return 0; }
  // pick a call: no repeat of the last few, intensity follows the director, and tonight's conditions lean the mix
  function pickCall(list) {
    const h = heat(), cond = COND[S.vcond || 'normal'], fresh = list.filter((c) => recentT.indexOf(c[0]) < 0), pool = fresh.length ? fresh : list;
    const w = pool.map((c) => { let x = H.arcBias ? H.arcBias(c) : 1; if (h > 3.5 && c[1] === 1) x *= .3; if (h < 1 && c[1] <= 2) x *= 1.8; if (cond && cond.bias && cond.bias.test(c[0])) x *= 2.6; return x; });
    let r = Math.random() * w.reduce((a, b) => a + b, 0), out = pool[0]; for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) { out = pool[i]; break; } }
    recentT.push(out[0]); while (recentT.length > 5) recentT.shift(); return out;
  }

  // ---------- more calls per lesson ----------
  const EXTRA = {
    0: [["Kids cutting through the closed construction site", 3, 'any', "Foreman says kids keep climbing the fence after hours. He's worried somebody's going to get hurt."], ["Shop owner wants to talk about loitering", 3, 'any', "Owner says the same group hangs out in front of her store every afternoon. She wants advice, not arrests."]],
    1: [["Man standing in the road yelling at cars", 2, 'any', "Caller says a man is standing in the travel lane shouting at drivers. Traffic is swerving around him."], ["Smell of gas near the strip mall", 2, 'mall', "Employees smell gas behind the stores. Fire's been notified. Check it out and keep people back."]],
    2: [["Detail on talk around", 3, 'any', "Two units are working a detail on talk around. Switch over and check in with them."], ["Stuck microphone on the main channel", 3, 'any', "Somebody's mic is stuck open and tying up the channel. Find the unit and help them out."]],
    3: [["Driver can't produce a license at a crash", 2, 'any', "Minor crash, no injuries. One driver says he left his license at home."], ["Clerk thinks a customer is using someone else's ID", 2, 'bank', "Bank teller says the photo on the ID doesn't look like the person at the counter."]],
    4: [["Child called 911 and hung up", 2, 'houses', "Open line, a child's voice, then it disconnected. Callback goes to voicemail."], ["Shoplifter detained by store security", 2, 'mall', "Loss prevention has a woman in the back office. They want her trespassed and charged."]],
    5: [["Person asleep in a running car", 2, 'parking', "Caller says a man has been slumped over the wheel for an hour with the engine running."], ["Man refusing to leave a bus shelter", 3, 'any', "Driver says a man has been in the shelter all day and won't let anyone sit down."]],
    6: [["Second unit needed at a crash", 2, 'any', "Officer on scene of a crash asks for a second unit for traffic."], ["Cover requested: man with a bat", 1, 'any', "Officer reports a man holding a bat and yelling at a neighbor. Officer is requesting cover. Step it up."]],
    7: [["Teacher worried about a student's posts", 2, 'school', "Assistant principal wants to show you a student's posts. Nothing direct, but staff are worried."], ["Customer keeps threatening an employee", 2, 'mall', "Manager says a former customer keeps coming back and telling a cashier she'll 'regret it.'"]],
    8: [["Elderly man lost, can't remember his address", 2, 'any', "Caller found an older man sitting on her steps. He seems confused and can't say where he lives."], ["Stranded driver with a flat tire", 3, 'any', "Woman with two kids in the car has a flat on the shoulder. No spare."]],
    9: [["Newspapers piling up at a neighbor's door", 2, 'houses', "Caller hasn't seen her neighbor in four days. Papers are piling up on the porch."], ["Owner out of town wants a check on his shop", 3, 'bank', "Owner is out of state and his alarm company says the back door sensor went offline."]],
    10: [["Hospital needs help reaching next of kin", 2, 'houses', "Hospital chaplain asks for an officer to help reach a family at this address."]],
    11: [["Snake in a garage", 3, 'houses', "Homeowner says there's a snake behind the water heater and she's standing on the car."], ["Dog left in a hot car", 2, 'parking', "Shopper says a dog has been in a closed car for twenty minutes and it's panting hard."]],
    12: [["Smoke coming from a dumpster", 2, 'any', "Caller sees smoke coming out of the dumpster behind the shops. Fire rescue is en route."], ["Fireworks in the parking lot", 3, 'parking', "Teenagers setting off fireworks between parked cars. Caller says one went under a truck."]],
    13: [["Bike found in a front yard", 3, 'houses', "Resident says a nice bike was dumped in her yard overnight. She wants it gone."], ["Phone stolen at the bus stop", 3, 'any', "Victim says someone grabbed her phone and ran. She's tracking it on her laptop."]],
    14: [["Tenant says the landlord changed the locks", 2, 'apartments', "Tenant is outside with her kids. She says the landlord changed the locks while she was at work."], ["Tow truck driver and owner arguing", 2, 'parking', "Owner caught the tow driver hooking up his car. They're yelling at each other."]],
    15: [["Custody exchange getting heated", 2, 'any', "Exchange at the gas station. Caller says the parents are yelling and the kid is crying in the car."], ["Ex wants to pick up her belongings", 3, 'houses', "Caller wants an officer to stand by while she gets her things from her ex's house."]],
    16: [["Crowd outside a club at closing", 2, 'any', "Big crowd in the street at closing time. Bouncer says a couple of guys are squaring up."], ["Protest planned at the courthouse", 3, 'courthouse', "Organizers expect about two hundred people. Supervisor wants a visible presence, nothing more."]],
    17: [["Back door open at a closed business", 2, 'warehouse', "Patrol noticed the back door of a closed business standing open. No alarm."], ["Panic alarm at the pharmacy", 1, 'mall', "Silent panic alarm at the pharmacy counter. No answer on the callback."]],
    18: [["Car burglar ran into the woods", 2, 'any', "Witness saw a man break a car window and run into the tree line. Gray hoodie, backpack."], ["Child missing at the park", 1, 'park', "Mom lost sight of her six-year-old at the playground fifteen minutes ago. Red shirt, light-up shoes."]],
    19: [["Pick up a prisoner at the hospital", 2, 'any', "Arrestee was cleared by the ER. Transport him to the county jail."], ["Family showed up during an arrest", 2, 'houses', "Arrest in progress. The arrestee's mother and brother just pulled up and they're upset."]],
    20: [["Arrestee might be a juvenile", 2, 'jail', "Booking says the man you brought in might be seventeen. Confirm his age before they process him."], ["Arrestee says he's sick at booking", 2, 'jail', "Your arrestee is telling booking he needs his heart medicine."]]
  };
  // EXTRA above holds Chapter 5 calls, kept for reference; the Vehicle Operations calls are all in vodata.js
  if (false) Object.keys(EXTRA).forEach((k) => { if (H.CALLS[k]) EXTRA[k].forEach((c) => { if (!H.CALLS[k].some((x) => x[0] === c[0])) H.CALLS[k].push(c); }); });

  // ---------- dispatchers ----------
  // (the three citywide dispatchers by time of day are now each a district's own voice, in districts.js)
  // each district has its own dispatcher (districts.js): the voice on the radio tells you where you are
  function dispatcher() { const d = dcast(H.did()).disp, k = d.id; const id = d.id === 'velvet' ? 'velvet' : H.sayAs(d.id, { name: d.name, icon: d.icon, role: d.role, look: d.look }); return { k, id, d, label: 'Dispatch (' + d.short + ')' }; }
  const fill = (t, o) => t.replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : ''));
  const ord = (n) => n === 2 ? 'second' : n === 3 ? 'third' : n === 4 ? 'fourth' : n + 'th';
  const UNITS = () => (H.did() + 1) + '-' + rnd(['Adam', 'Baker', 'Charlie', 'David', 'Edward']) + '-' + (10 + Math.floor(Math.random() * 80));

  // ---------- addresses remember you ----------
  S.addr = S.addr || {};
  const aKey = (c) => H.did() + '|' + c.where;
  function dispatchText(c) {
    const D = dispatcher(), a = S.addr[aKey(c)], o = { cs: S.cs, t: c.title.toLowerCase(), t2: c.title.toLowerCase(), w: c.where, x: c.text, n: a ? ord(a.n + 1) : '' };
    let msg = (c.prio === 1 ? 'Priority one. ' : '') + fill(pick('give_' + D.k, D.d.give), o);
    if (a && a.n >= 1 && Math.random() < .8) msg = fill(pick('again_' + D.k, D.d.again), o) + ' ' + c.title + '. ' + c.text;
    return { who: D.label, msg };
  }

  // ---------- callers ----------
  const CALLERS = [
    { k: 'shaken', names: [['Denise Harmon', '💁'], ['Luis Ortiz', '🧑'], ['Kim Nguyen', '💁'], ['Tyrell Banks', '🧔']], open: ["Oh, thank God. Sorry. I'm shaking. Okay. So I was just—", "You came. Okay. I'm fine, I'm fine. I just need a second.", "I didn't know who else to call. Sorry, I keep... okay. Here's what happened."], calm: ["Okay. Okay, that helps. Thank you for telling me what happens next.", "Sorry. I'm usually not like this. Thank you for being patient."], brief: ["Right. Sorry. Okay. Short version.", "Okay. Yeah. Just the facts. I can do that."], bye: ["Thank you. Really. I'm going to go sit down for like an hour.", "I feel a lot better than when you got here."] },
    { k: 'chatty', names: [['Mrs. Albright', '👵'], ['Mr. Delacroix', '🧔'], ['Gloria Fenn', '👵'], ['Walt Kowalski Jr.', '🧔']], open: ["Officer! I'm the one who called. Thirty-one years on this street and I've never seen anything like it.", "Well, you're younger than I expected. Come here, come here. I saw the whole thing from my kitchen window.", "I made coffee. I figured you'd want coffee. Now let me tell you about this."], calm: ["See, that's how it should be done. My late husband would've liked you.", "Well, aren't you polite. Most people just rush me."], brief: ["Oh. All business. Okay, okay. The short version. Which is still kind of long.", "Fine, fine. I'll skip the part about my sister."], bye: ["You come back anytime. I mean it. The coffee's always on.", "I'm going to tell everybody at church how nice you were."] },
    { k: 'annoyed', names: [['Rick Dawson', '🧔'], ['Pam Whitlock', '💁'], ['Gary Fisk', '🧑'], ['Monica Reyes', '💁']], open: ["Took you long enough. I called forty minutes ago.", "Look, I don't usually call you guys. But this is the third time this week.", "Finally. I've been standing out here like an idiot."], calm: ["...Okay. Fine. That's actually helpful. Thanks.", "Alright. I'm not mad at you. I'm just tired of this."], brief: ["Good. I don't need a speech. I need it handled.", "Yeah, let's just get it done."], bye: ["Alright. Thanks. I mean that.", "Okay. If it happens again I'm calling you specifically."] },
    { k: 'sheepish', names: [['Jordan Pike', '🧑'], ['Ellen Marsh', '💁'], ['Dev Kapoor', '🧑'], ['Sarah Lund', '💁']], open: ["Hi. Sorry. This is probably nothing and I feel dumb for calling.", "I almost hung up. My wife said call, so... I called.", "Hey. So, I might be overreacting. Just tell me if I'm overreacting."], calm: ["Okay. Good. I really didn't want to waste your time.", "That makes me feel a lot less stupid, honestly."], brief: ["Yep. Yes. Sorry. Okay.", "Right, you're busy. Got it."], bye: ["Thanks. Sorry again. But thanks.", "Okay. Next time I won't feel bad about calling."] },
    { k: 'kid', names: [['Maya (14)', '👧'], ['Jaden (15)', '🧒'], ['Sofia (13)', '👧']], open: ["Are you the police? My mom's at work. I'm the one who called.", "Hi. I'm fourteen. Is that okay? That I called?", "My dad told me if something happens, call you guys first and then him. So I did."], calm: ["Okay. Can I text my mom that you're here?", "Okay. That's... yeah. Okay."], brief: ["Okay. I'll tell you everything. I wrote some of it down.", "Yes sir. I mean, yes ma'am. Sorry. Yes officer."], bye: ["Thank you. I'm gonna call my mom now.", "That was kind of scary but you were really nice."] },
    { k: 'language', names: [['Mr. Tran', '🧔'], ['Mrs. Castillo-Ruiz', '👵'], ['Mr. Haddad', '🧔']], open: ["Sorry. My English... not so good. Please, slow.", "Officer, yes, yes. I call. Sorry, my English is little."], pre: ["You open the language line on your phone and put the interpreter on speaker."], calm: ["(through the interpreter) Thank you for being patient with me.", "(through the interpreter) Thank you. Nobody ever explains anything to me."], brief: ["(through the interpreter) Yes. I understand. Go ahead.", "(through the interpreter) Okay. Ask me."], bye: ["Thank you. Thank you very much.", "(through the interpreter) Thank you. God bless you."] },
    { k: 'regular', names: [['Ernie Bascombe', '🧔'], ['Dolores Weck', '👵']], open: ["It's me again. I know, I know. But this time it's real.", "Before you say anything, yes, I'm the raccoon guy. This isn't a raccoon.", "You're new. Okay. I call a lot. But I'm usually right. Mostly."], calm: ["See? Somebody who listens. Write that down somewhere.", "Finally, a professional."], brief: ["Fine. Short version. But it's real this time.", "Okay, okay. Here's the facts."], bye: ["Same time next week? I'm kidding. Mostly.", "Thanks. You're my favorite one now."] },
    { k: 'pro', names: [['Angela Brooks, manager', '🧑‍💼'], ['Marcus Hill, supervisor', '🧑‍💼'], ['Priya Shah, owner', '🧑‍💼']], open: ["Thanks for coming. I wrote down everything with times so I don't forget anything.", "I've got the camera footage pulled up already if you need it.", "Appreciate you. Here's what I know, start to finish."], calm: ["Good. My staff will feel better hearing it from you.", "That's helpful. I'll pass it on to my people."], brief: ["Perfect. I like efficient.", "Works for me. Go ahead."], bye: ["Thanks. I'll send the footage to the email on your card.", "Appreciate it. Stop by anytime, coffee's on us."] },
    { k: 'wary', names: [['Andre Coleman', '🧔'], ['Tasha Price', '💁'], ['Rudy Vega', '🧑']], open: ["I called, but I'm not trying to get anybody in trouble. Okay? I just want it to stop.", "You're not gonna make this a whole thing, right?", "I don't really trust cops. No offense. But I didn't know what else to do."], calm: ["...Okay. That's fair. I didn't expect you to explain all that.", "Alright. You're alright."], brief: ["Good. Let's get it over with.", "Fine. Ask what you need to ask."], bye: ["Thanks for not making it worse. For real.", "Okay. Maybe I'll call next time instead of handling it myself."] }
  ];
  const DEF_CALLER = { calm: ["Okay. Okay, thank you for telling me what's happening."], brief: ["Sure. Right. Whatever you need."], canvass: ["The lady in the blue house was outside. She might know more.", "There's a camera on the corner store. And the guy who walks his dog every night, he sees everything.", "My neighbor was out there too. Want me to get her?"], bye: ["Thank you, officer."] };
  function caller(c) {
    if (c.rep) { c.vc = CALLERS.find((x) => x.k === c.rep.k) || CALLERS[2]; c.vcn = c.rep.name; c.vci = c.rep.icon; c.vret = false; return [c.rep.name, c.rep.icon]; } /* a regular talks in their own voice (offenders.js) */
    const a = S.addr[aKey(c)];
    if (a && a.cal && a.cn && Math.random() < .75) { const C = CALLERS.find((x) => x.k === a.cal) || rnd(CALLERS); c.vc = C; c.vcn = a.cn; c.vci = a.ci; c.vret = true; return [a.cn, a.ci]; }
    let C = pick('callerType', CALLERS); if (C.k === 'kid' && !/houses|apartments/.test(c.kind)) C = CALLERS[0];
    if (C.k === 'pro' && /houses|apartments/.test(c.kind)) C = CALLERS[1];
    c.vc = C; const nm = pick('cname_' + C.k, C.names); c.vcn = nm[0]; c.vci = nm[1]; c.vret = false; return [nm[0], nm[1]];
  }

  // ---------- complications ----------
  const COMP = [
    { when: () => true, narr: "A few neighbors drift over to watch. One of them is filming on his phone.", q: "People are gathering.", o: [["Ask them to give you room, and keep scanning", 1, "They step back a few feet. You can see everybody's hands now."], ["Tell the guy filming to put his phone away", 0, "He keeps filming. Recording you in public is legal, and now he's got a clip of you arguing with him."], ["Turn your back to them and focus on the caller", 0, "Somebody walks right up behind you before you notice. Keep scanning."]] },
    { when: (c) => /houses|apartments|any/.test(c.kind), narr: "A big dog is barking behind a low gate, and the latch isn't closed.", q: "The gate isn't latched.", o: [["Ask the owner to put the dog inside first", 1, "The owner drags him in by the collar. \"He's a baby, I swear.\" The baby weighs a hundred pounds."], ["Walk past it quickly, it's probably friendly", 0, "It is not friendly. You make it back to the sidewalk with your pant leg intact. Barely."], ["Climb over the side fence to avoid it", 0, "Now you're in a stranger's side yard, off balance, with no idea what's back here."]] },
    { when: () => true, narr: "A little boy in pajamas is standing in the doorway, listening to everything.", q: "There's a kid listening.", o: [["Ask another adult to take him in another room", 1, "His aunt scoops him up. \"Come on, bud, let's find your tablet.\""], ["Keep going, kids hear worse on TV", 0, "He hears every word. He'll remember tonight longer than anyone."], ["Ask him what he saw before anyone else talks", 0, "He freezes and looks at his mom. Interviewing a child is its own skill, and this isn't the moment."]] },
    { when: (c) => c.kind === 'street' || c.kind === 'parking', narr: "You're standing half in the road, and cars are passing a little too close.", q: "Traffic is close.", o: [["Move everyone up onto the sidewalk", 1, "Everybody shuffles up the curb. A truck rolls by right where you were standing."], ["Wave the cars around and keep talking", 0, "A mirror misses your elbow by a few inches. Move the conversation, not the traffic."], ["Turn on your lights and stand in the lane", 0, "Now you're the obstacle. Get out of the road."]] },
    { when: () => true, narr: "The caller keeps answering texts while you talk.", q: "They're glued to their phone.", o: [["Ask them to put the phone down for a few minutes", 1, "\"Sorry. Sorry. My sister keeps asking if I'm okay.\" The phone goes in a pocket."], ["Take the phone out of their hand", 0, "\"Hey! You can't just take my phone!\" And now they're upset with you instead of the situation."], ["Wait quietly until they finish texting", 0, "You wait. And wait. Your call is now ten minutes longer."]] },
    { when: () => true, narr: "Someone else comes out of the house and starts arguing with the caller.", q: "Two people, both yelling.", o: [["Separate them and talk to each one alone", 1, "You put one by the car and one on the porch. It gets quieter fast."], ["Let them argue so you hear both sides", 0, "You hear both sides at full volume, and it gets louder."], ["Tell them both someone's going to jail", 0, "Now they're both mad at you, and neither one is talking."]] },
    { when: () => H.night(), narr: "You're standing right under a streetlight. Anyone watching from the dark can see you clearly.", q: "You're lit up.", o: [["Step out of the light so you aren't silhouetted", 1, "You shift into the shadow by the hedge. Now you see them better than they see you."], ["Stay in the light so people can see you're police", 0, "Everyone can see you. Including anyone you can't see."], ["Turn your flashlight on the caller's face", 0, "They squint and turn away. You've lost their trust and your night vision."]] },
    { when: () => (S.vcond === 'heat'), narr: "It's brutally hot. The caller's face is flushed and they're swaying a little.", q: "The caller doesn't look good.", o: [["Get them into the shade with some water", 1, "Five minutes in the shade and they're making sense again."], ["Keep it short so you can both get inside", 0, "They sit down hard on the curb mid-sentence. Heat comes first."], ["Ask them to wait in your patrol car", 0, "Your car's been sitting in the sun. It's hotter in there."]] }
  ];
  function complication(c, cid) {
    if (Math.random() > .4) return []; const ok = COMP.filter((x) => x.when(c)); const X = pick('comp', ok); if (!X) return [];
    return [['narr', X.narr], ['choice', shuf(X.o).map((o) => ({ t: o[0], ok: o[1], trust: o[1] ? 1 : 0, reply: [['narr', o[2]]] })), X.q]];
  }

  // ---------- updates on the way, and what it turns out to be ----------
  const UPD = [
    { k: 'hungup', msg: "Update: caller hung up. Callback goes straight to voicemail.", on: [['narr', "Nobody answers the first knock. Then the door opens a few inches, and stays that way."]] },
    { k: 'left', msg: "Update: caller says the person just left on foot, heading toward {st}.", on: [['narr', "The caller is pointing down the block before you're out of the car."]] },
    { k: 'worse', msg: "Update: caller now says they're yelling and something just broke. Step it up.", prio: true, on: [['narr', "You can hear it from the street."]] },
    { k: 'calm', msg: "Update: caller says it's calmed down, but they still want somebody to come by.", on: [['narr', "It's quiet when you pull up. Quiet doesn't mean over."]] },
    { k: 'second', msg: "Update: second caller across the street reporting the same thing.", on: [['narr', "Two people wave you down at once, from opposite sides of the street."]] }
  ];
  const REVEAL = [
    { re: /suspicious|prowler/i, l: [['narr', "The \"suspicious person\" is a man in his eighties trying his key in the wrong door."], ['narr', "He lived in this house until 1990. He's been walking around the neighborhood for an hour, looking for home."]] },
    { re: /noise|disturbance|yelling/i, l: [['narr', "The screaming turns out to be a couple watching a horror movie with the windows open."], ['narr', "They are completely mortified. The wife hides behind the couch."]] },
    { re: /alarm/i, l: [['narr', "Something moves inside. It's a cat, sitting on the motion sensor, staring at you like you're the intruder."]] },
    { re: /fight|squaring/i, l: [['narr', "It's two brothers wrestling in the yard. Their mom comes out yelling at both of them before you can say a word."]] },
    { re: /burglary|break/i, l: [['narr', "The \"burglar\" is the homeowner's son. He forgot his key and went through the bathroom window."]] },
    { re: /./, l: [['narr', "It's not quite what dispatch said. The caller saw part of it and filled in the rest. Everyone's a little embarrassed."]] }
  ];
  const STREETS = ['Main', 'Bay', 'Oak', 'Pine', 'Harbor', 'Fifth', 'Water'];
  function enRoute(c) {
    if (c.vupd || c.ops || c.deesc || c.pursuit || c.thread || Math.random() > .35) return; c.vupd = 1;
    setTimeout(() => { if (H.call() !== c || !c.accepted || Math.hypot(c.x - H.P.x, c.y - H.P.y) < 3) return; const U = pick('upd', UPD); c.vtw = U; if (U.prio && c.prio > 1) { c.prio--; H.callCard(); }
      const D = dispatcher(); H.radio(D.label, S.cs + ', ' + fill(U.msg, { st: rnd(STREETS) })); H.chirp(); }, 5000 + Math.random() * 7000);
    if (Math.random() < .14) c.vrev = 1;
  }

  // ---------- partners ----------
  const PARTNERS = {
    walsh: { name: 'Ofc. Bernie Walsh', icon: '👮', role: 'Your partner · 24 years on', look: { shirt: '#1e3a8a', pants: '#1f2937', hat: 'cap', hair: '#9ca3af', skin: '#e0b48f', age: 'senior', build: 'heavy', beard: 'mustache' },
      start: ["Morning. I've got coffee and low expectations. Let's go.", "You're driving. I've been driving since before you were born.", "Rule one: don't touch my radio presets."], accept: ["I've been to that address before. Watch the side yard.", "I'll run the plate, you drive.", "Light it up if you want. I won't judge."], arrive: ["Your scene. I've got cover.", "I'll stand over here and look mean.", "You talk. I'll watch hands."], coach: ["Hey. That one you missed back there? {f} Write that one down.", "Little thing. {f} Took me years to stop forgetting it."], good: ["Not bad. You talked less than most rookies.", "Clean. I'd ride with you again.", "That's how you do it. Don't let it go to your head."], idle: ["You know what this job is? It's ninety percent driving and ten percent remembering why.", "My first sergeant used to say the radio is the only thing in the car that never lies.", "Twenty-four years. Know what I miss? Nothing. I'm kidding. Kind of."] },
    park: { name: 'Ofc. Theo Park', icon: '👮', role: 'Your partner · 6 months on', look: { shirt: '#1e3a8a', pants: '#1f2937', hat: 'cap', hair: '#1a1a1a', skin: '#e0b48f', age: 'adult', build: 'slim' },
      start: ["Hey! Okay. Big day. I brought snacks. And a notebook. Two notebooks.", "I've been studying all week. Ask me anything. Actually, don't.", "My FTO said ride with you and learn something. No pressure."], accept: ["Lights? Can we do lights? Okay, no lights. Sure.", "I'll take notes the whole time. Detailed notes.", "I'll check the map. Actually, you know the way. Cool."], arrive: ["Want me to take notes? I'll take notes.", "I've got cover. I think. Yes. I've got cover.", "I'll stay back and watch the street."], coach: ["Wait, I think it's actually... {f} Right? I studied that one last week.", "Oh! I know this one. {f} I made a flashcard."], good: ["That was so smooth. Can I copy how you did that?", "Writing that down. All of it.", "Okay, you're good at this. That's annoying."], idle: ["Do you ever think about how many people we talk to in one shift? Like, a lot.", "My mom asks if I've caught any bad guys yet. I tell her I helped a lady find her car.", "I keep a list of every street name I learn. I'm at forty-one."] },
    castillo: { id: 'castillo', start: ["I'm riding with you today. Pretend I'm not here. You won't be able to, but try."], accept: ["Talk me through what you're thinking on the way.", "Your call. I'm just watching."], arrive: ["I'm just observing. Do it like I'm not here."], coach: ["We'll talk about that one. {f} Learn it, live it.", "Remember this: {f}"], good: ["That's what I want to see. Keep doing that.", "Good. I'll put that in your evaluation."], idle: ["You want to know what makes a good cop? Remembering the boring stuff when it counts.", "I rode with a sergeant like me once. I hated it. Then I got better."] }
  };
  function partner() { const k = S.vpart; if (!k || !PARTNERS[k]) return null; const p = PARTNERS[k]; const id = p.id || H.sayAs('partner', { name: p.name, icon: p.icon, role: p.role, look: p.look }); return { k, id, p }; }
  const pLine = (part, key) => { const v = pick('p_' + part.k + '_' + key, part.p[key]); return v; };

  // ---------- shift conditions ----------
  const COND = {
    normal: { name: '' },
    moon: { name: 'Full moon', night: true, radio: "Heads up, all units. Full moon tonight. You know what that means.", bias: /disturb|suspicious|noise|fight|crowd|yelling/i, remark: ["Is it a full moon or something? Everybody's acting crazy tonight.", "My grandmother always said nothing good happens on a full moon."], gap: .85 },
    game: { name: 'Game night', radio: "Big game at the stadium tonight. Expect traffic, and crowds after it lets out.", bias: /crowd|fight|noise|disturb|traffic|club/i, remark: ["Did you see the score? My whole street's been yelling since the fourth quarter.", "I'm missing the game for this. Not your fault. Just saying."] },
    payday: { name: 'Payday Friday', radio: "It's payday Friday. Stores are busy and the bars are full.", bias: /theft|shoplift|robbery|wallet|stolen|pawn|ID|phone/i, remark: ["Payday. Everybody's out spending money they don't have.", "Friday, right? Everybody's wound up."] },
    heat: { name: 'Heat advisory', day: true, radio: "Heat advisory all shift. Check on the older folks, and drink some water yourselves.", bias: /well-being|welfare|hot car|lost|elderly|newspapers/i, remark: ["It's too hot for this. I've been sweating since six in the morning.", "My AC died yesterday. Of course it did."] },
    outage: { name: 'Power outage', radio: "Power's out on part of the east side. A few traffic lights are dark. Treat them as four-way stops.", bias: /alarm|suspicious|traffic|well-being|door/i, remark: ["Power's been out for two hours. My freezer's going to be a disaster.", "Can't even charge my phone. This is how the world ends."] },
    holiday: { name: 'Holiday weekend', radio: "Holiday weekend. Lots of cookouts, lots of family, lots of fireworks.", bias: /fireworks|noise|fire|crowd|disturb|custody|smoke/i, remark: ["We've got the whole family over for the holiday. All of them.", "Holidays, right? Love my family. Love them more when they leave."] },
    school: { name: 'Last day of school', day: true, radio: "Last day of school. Kids everywhere this afternoon. Watch the crosswalks.", bias: /kid|child|student|school|missing|construction/i, remark: ["School's out. My grandkids are already bored and it's been four hours.", "Summer. God help us all."] }
  };
  function onShift() {
    const h = H.hourNow(), night = H.night();
    const opts = Object.keys(COND).filter((k) => k !== 'normal' && !(COND[k].night && !night) && !(COND[k].day && night) && !(k === 'heat' && H.cold()));
    S.vcond = Math.random() < .55 && opts.length ? pick('cond', opts) : 'normal';
    const r = Math.random(); S.vpart = r < .35 ? null : r < .62 ? 'walsh' : r < .9 ? 'park' : 'castillo';
    if (S.vpart && H.partnerBenched && H.partnerBenched(S.vpart)) S.vpart = H.partnerBenched('walsh') || S.vpart === 'walsh' ? null : 'walsh'; // Park sits out a few shifts after a cover-up (partners.js)
    LOG.length = 0; recentT = []; ambT = 50 + Math.random() * 30; void h;
    setTimeout(() => {
      const C = COND[S.vcond]; if (C && C.radio) { const D = dispatcher(); H.radio(D.label, C.radio); H.toast('Tonight: ' + C.name + '.'); }
      const p = partner(); if (p) setTimeout(() => { H.toast((p.p.name || 'Sgt. Castillo') + ' is riding with you this shift.'); H.radio(p.p.name ? p.p.name.replace(/^Ofc\. /, '') : 'Castillo', (H.partnerStart && H.partnerStart(p.k)) || pLine(p, 'start')); }, 2500);
    }, 2500);
  }

  // ---------- the call scene ----------
  function callerLines(c, cid) {
    const C = c.vc || {}, a = S.addr[aKey(c)], out = [], p = partner(), cond = COND[S.vcond || 'normal'];
    if (p && Math.random() < .7) out.push([p.id, pLine(p, 'arrive')]);
    if (c.vtw) out.push(...c.vtw.on);
    if (C.pre) out.push(['narr', rnd(C.pre)]);
    if (a && c.vret) out.push([cid, pick('ret', ["Oh, it's you again. You were here for the " + a.t.toLowerCase() + ".", "Hey! You're the one who came last time. Okay, good. That makes this easier.", "Back again. I'm starting to feel bad about how often I call."])]);
    else if (!c.rep) out.push([cid, pick('open_' + (C.k || 'x'), C.open || ["Officer! Over here. Thank goodness.", "You got here fast. Okay, here's what happened."])]);
    if (cond && cond.remark && Math.random() < .45) out.push([cid, pick('rem_' + S.vcond, cond.remark)]);
    if (c.vrev) { const R = REVEAL.find((x) => x.re.test(c.title)); out.push(...R.l); }
    return out;
  }
  const MIDS = [
    ["Everyone is watching how you handle this.", "Keep the scene calm and explain each step", "Stay focused and keep it brief", "Ask if anyone else saw what happened"],
    ["How do you run the conversation?", "Slow it down and tell them what happens next", "Get the facts first and save the small talk", "Check whether any neighbors saw it too"],
    ["The caller is waiting on you.", "Let them finish, then walk them through it", "Keep your questions short and direct", "Look around for cameras and other witnesses"],
    ["What's your approach?", "Find them a place to sit and explain the process", "Stick to who, what, where and when", "Ask who else was around when it happened"]
  ];
  function midChoice(c, cid, onCanvass) {
    const M = pick('mid', MIDS), C = c.vc || DEF_CALLER;
    return ['choice', [
      { t: M[1], eff2: 'calm', trust: 1, reply: [[cid, rnd(C.calm || DEF_CALLER.calm)]] },
      { t: M[2], eff2: 'brief', reply: [[cid, rnd(C.brief || DEF_CALLER.brief)]] },
      { t: M[3], eff2: 'canvass', reply: [[cid, pick('canv', DEF_CALLER.canvass)]], fx: onCanvass }], M[0]];
  }
  const WRAPS = [
    ["How do you wrap it up?", "Give them a case number and your contact info", "Point them to resources that can help next time", "Clear the scene and get back in service"],
    ["Time to wrap up.", "Write down the case number for them", "Tell them who else can help with this", "Thank them and clear the call"],
    ["Before you go.", "Explain what happens with the report next", "Give them the number for victim services", "Let them know you're clearing and leave"],
    ["Last thing.", "Leave a card with your name and the case number", "Connect them with family or a neighbor for tonight", "Tell them to call back if it starts again"]
  ];
  function wrapChoice(c, cid, onQuick) {
    const W0 = pick('wrap', WRAPS), C = c.vc || DEF_CALLER;
    return ['choice', [
      { t: W0[1], trust: 1, reply: [[cid, rnd(["A case number. Okay. I feel better knowing someone wrote it down.", "Okay. So if anything else happens, I call and give them this number?"])]], fx: () => { c.wrap = 'case'; } },
      { t: W0[2], reply: [[cid, rnd(["I didn't know half of that existed. Thank you.", "Okay. I'm putting that number in my phone right now."])]], fx: () => { c.wrap = 'resources'; } },
      { t: W0[3], reply: [[cid, rnd(C.bye || DEF_CALLER.bye)]], fx: () => { c.wrap = 'quick'; if (onQuick) onQuick(); } }], W0[0]];
  }
  function afterLines(c, res) {
    const p = partner(); if (!p) return [];
    const miss = (res.qs || []).find((q) => !q.ok);
    if (miss && miss.fact && Math.random() < .8) return [[p.id, fill(pLine(p, 'coach'), { f: miss.fact })]];
    if (Math.random() < .5) return [[p.id, pLine(p, 'good')]]; return [];
  }
  // a call wrapped up: remember the address and how it went, and tell the director how intense it was
  function afterScene(c, res) {
    const k = aKey(c), a = S.addr[k] || { n: 0 }; a.n++; a.t = c.title; a.w = c.wrap; a.when = Date.now();
    if (c.vc && c.vcn) { a.cal = c.vc.k; a.cn = c.vcn; a.ci = c.vci; }
    S.addr[k] = a; const keys = Object.keys(S.addr); if (keys.length > 40) keys.sort((x, y) => S.addr[x].when - S.addr[y].when).slice(0, keys.length - 40).forEach((x) => delete S.addr[x]);
    logEvent(c.prio === 1 ? 3 : c.prio === 2 ? 2 : 1); void res;
  }

  // ---------- two calls at once ----------
  const OUTCOME = ["cleared it. Report taken, nobody hurt.", "cleared it. Turned out to be nothing.", "cleared it. One in custody.", "cleared it. Gone on arrival.", "cleared it. Handled with a warning.", "cleared it. Parties separated for the night."];
  function wantPair() { return heat() < 2.5 && Math.random() < .22; }
  function offerPair(a, b, choose) {
    const D = dispatcher(), other = UNITS();
    H.dialogue([[D.id, '(over the radio) ' + fill(pick('pair_' + D.k, D.d.pair), { cs: S.cs, other })], ['choice', [
      { t: PL(a) + a.title + ' at ' + a.where, fx: () => { choose(a, b); } }, { t: PL(b) + b.title + ' at ' + b.where, fx: () => { choose(b, a); } }], 'Two calls holding']],
    null, { kicker: 'TWO CALLS HOLDING', noLeave: true });
    return other;
  }
  const PL = (c) => (c.prio === 1 ? 'Priority 1 · ' : c.prio === 2 ? 'Priority 2 · ' : 'Routine · ');
  // the call you didn't take still happens: if you took the routine one while a priority call waited, the other unit
  // got there late and you hear about it (and the block remembers); if you took the urgent one, it worked out
  const LATE = ["got there late. The victim had already left in a friend's car, no statement.", "got there late. The suspect was gone and the caller is upset nobody came sooner.", "got there late. The man needed an ambulance by then. He's at County, stable."];
  function otherOutcome(c, unit, mine) { const late = mine && c.prio < mine.prio; setTimeout(() => { H.radio(dispatcher().label, unit + ' ' + (late ? rnd(LATE).replace(/^got there late/, 'got to the ' + c.title.toLowerCase() + ' late') : rnd(OUTCOME).replace(/^cleared it/, 'cleared the ' + c.title.toLowerCase())));
      if (late) { if (H.trustAt) H.trustAt(c.x, c.y, -2); setTimeout(() => H.radio('Sgt. Castillo', "(over the radio) The higher priority goes first. Every time. We'll talk about it at end of watch."), 4000); }
      else if (mine && mine.prio < c.prio) setTimeout(() => H.radio('Sgt. Castillo', '(over the radio) Right call taking the priority one.'), 3500); }, 35000 + Math.random() * 25000); }

  // ---------- facts behind the new shapes ----------
  const fidFor = (re, les) => { const list = L.factList(les != null ? [les] : L.allLessons()); const f = list.find((x) => re.test(x.text)); return f ? f.id : null; };
  const factText = (fid) => { const f = fid && L.factById(fid); return f ? f.text : ''; };
  function mkQ(les, stem, right, wrongs, re, kind, act) {
    const fid = fidFor(re, les), opts = shuf([right].concat(wrongs)), q = { id: 'V' + kind + ':' + stem.length + ':' + right.length, fid, kind: 'fact', les, stem, opts, c: opts.indexOf(right), multi: false, ex: factText(fid), fact: factText(fid) };
    // a scene decision plays out: no second try, and what happens next depends on the call you made
    if (act) Object.assign(q, { act: true, good: act[0], bad: act[1] }); return q;
  }
  // the decision in the moment is the question
  const DECIDE = [
    [4, "You're two blocks out on a fight call. Where do you park?", "Up the street, where you can see it and get out", ["Right out front so they know you're here", "Around the corner where they can't see you", "In the driveway so you're close to the door"], /where to park/i],
    [4, "You're about to get out of the car.", "Silence your phone and scan for threats first", ["Grab your notebook and walk straight to the door", "Wait in the car until the caller comes out", "Leave the door open in case you need it fast"], /silent|secure pocket/i],
    [5, "Your backup just pulled up. Who does the talking?", "You do, and your backup watches hands and exits", ["Both of you, so he can't play you off each other", "Your backup, since they're the more senior officer", "Whoever he seems to like better after a minute"], /contact officer is usually/i],
    [5, "He says he doesn't have any ID on him.", "Ask for his name, date of birth and address", ["Arrest him for not carrying identification", "Let him go since he's been cooperative", "Have him call someone to bring his wallet"], /name, date of birth|false identity|DAVID/i],
    [2, "The main channel is jammed and you need the unit next to you.", "Switch to talk around and reach them directly", ["Wait until the main channel clears up", "Call them on your cell phone instead", "Key up anyway and talk over the traffic"], /talk around/i],
    [1, "Someone across the lot pulls a gun. What do you get behind?", "The engine block of your patrol car", ["The open driver's door of your car", "The hedge along the front of the building", "The wooden fence around the dumpster"], /bullet-resistant|engine block/i],
    [4, "You're talking to the caller right under a streetlight.", "Step out of the light so you aren't backlit", ["Stay in the light so everyone can see you", "Turn your flashlight on to see better", "Move closer to the caller under the light"], /backlight|silhouett/i],
    [17, "You're at the doorway of a dark storeroom.", "Stand to one side and scan in before entering", ["Step into the doorway and look around", "Rush in fast so nobody has time to react", "Call out and wait in the doorway for an answer"], /cutting the pie/i],
    [18, "He's running from you down an alley. What do you radio?", "Your location, his direction and his description", ["Just \"foot pursuit\" so you save your breath", "Nothing until you've caught up to him", "Only that you need backup right away"], /foot pursuit, radio/i],
    [19, "Before you put him in the back seat.", "Check the back seat for anything left there", ["Turn up the AC so he stays calm", "Let him pick which side to sit on", "Take off the cuffs so he's comfortable"], /rear compartment|clear the rear/i],
    [20, "At booking, what do you make sure to tell them?", "His injuries and that you used pepper spray", ["Your opinion of his attitude tonight", "Nothing, the paperwork covers it all", "Where he went to high school"], /booking officer|pepper spray|contaminat/i],
    [12, "A car is on fire. Where do you park?", "Upwind, well back from the burning car", ["Downwind so the smoke blows away from you", "Right next to it to block traffic", "Behind it so you can see the plate"], /wind direction|upwind/i],
    [16, "Where do you watch a big crowd from?", "Somewhere above it, like a rooftop", ["Right in the middle so you hear everything", "From inside your car with the windows up", "At the back where nobody can see you"], /vantage|rooftop/i],
    [9, "Security check on a closed store at night. First thing?", "Park away from it and watch the building", ["Pull right up to the front doors", "Walk straight to the back door", "Turn your spotlight on the front windows"], /park at a distance|notify dispatch on arrival/i],
    [15, "Things are getting heated at a civil standby.", "Separate them and suggest one of them leave", ["Pick a side so it ends faster", "Leave and let them work it out", "Tell them both they're going to jail"], /separate the parties|tension/i],
    [11, "A loose dog is growling at you from a yard.", "Keep your distance and get animal control", ["Walk up slowly and let it sniff you", "Throw something to scare it off", "Climb the fence to get away from it"], /animal control/i]
  ];
  // the hand-written decisions above plus the full set in decide.js (each with what happens if you get it right or wrong)
  // DECIDE and OUT are Chapter 5 decisions, kept for reference; the game uses the chapter's decisions in vodata.js
  const DALL = () => ACTS;
  // what happens after each of the original decisions above, right call first
  const OUT = {
    "You're two blocks out on a fight call. Where do you park?": ["From up the street you see a third man waiting by the corner with a pipe.", "You pull up out front, right between the two groups, and both turn toward your car."],
    "You're about to get out of the car.": ["Your scan catches a man watching you from the porch with his hand behind his back.", "Your phone buzzes loudly just as you creep up the driveway, and the dog inside starts barking."],
    "Your backup just pulled up. Who does the talking?": ["He has only one voice to answer to, and your backup spots the knife clip in his pocket.", "Two officers talking at once, and he starts playing you against each other."],
    "He says he doesn't have any ID on him.": ["His name and birthday come back with a match and a photo. It's him.", "With nothing to run, you can't tell if he gave you his real name."],
    "The main channel is jammed and you need the unit next to you.": ["Talk around gets you straight through to the unit next door.", "By the time the main channel clears, the moment has passed."],
    "Someone across the lot pulls a gun. What do you get behind?": ["Two rounds hit the car. The engine block stops both.", "A round goes straight through the car door."],
    "You're talking to the caller right under a streetlight.": ["Out of the light, you can see the street, and nobody out there can pick you out.", "Lit up under the streetlight, you're the easiest thing on the block to see."],
    "You're at the doorway of a dark storeroom.": ["Slicing the doorway, you see his shoes behind the shelving before he sees you.", "You step into the doorway, and he's right there behind the shelves."],
    "He's running from you down an alley. What do you radio?": ["A unit cuts him off two streets over.", "Backup is coming, but nobody knows where to."],
    "Before you put him in the back seat.": ["You find a razor blade tucked into the seat crease from the last prisoner.", "At the jail, a razor blade turns up in the seat he was sitting on."],
    "At booking, what do you make sure to tell them?": ["The nurse flushes his eyes and logs his injuries before anyone touches him.", "A jail deputy gets pepper spray all over her hands, and nobody told her why."],
    "A car is on fire. Where do you park?": ["The smoke blows the other way, and you have clean air to work in.", "The smoke rolls straight over your car and into your lungs."],
    "Where do you watch a big crowd from?": ["From up high you see the fight start at the back before anyone on the ground does.", "Down in the crowd you can't see past the people right in front of you."],
    "Security check on a closed store at night. First thing?": ["Watching from across the lot, you see a flashlight moving inside.", "Your headlights sweep the front windows, and the flashlight inside goes dark."],
    "Things are getting heated at a civil standby.": ["Apart, they both calm down, and the exchange finishes without a scene.", "It turns into a shoving match while you're standing right there."],
    "A loose dog is growling at you from a yard.": ["Animal control has it on a catchpole in fifteen minutes.", "It lunges as you step toward the gate."]
  };
  // a decision for this lesson; given a fact's text, one that tests that very fact when there is one (so dispatch's
  // aim at your weakest facts survives the swap from quiz to decision)
  const DEC_BY = new Map();
  // matching every decision against a fact's text costs a few ms the first time; a district's facts are matched in idle
  // time after it loads, so the first call scene doesn't pay for it
  function warmDecisions(lessons) { const ids = L.factList(lessons).map((f) => f.text); let i = 0; const step = (dl) => { while (i < ids.length && (!dl || dl.timeRemaining() > 2)) decisionsFor(ids[i++]); if (i < ids.length) idle(step); }; idle(step); }
  const idle = (f) => (typeof requestIdleCallback === 'function' ? requestIdleCallback(f, { timeout: 4000 }) : setTimeout(() => f(null), 200));
  function decisionsFor(txt) { if (!txt) return []; let l = DEC_BY.get(txt); if (!l) { l = DALL().filter((x) => x[4].test(txt)); DEC_BY.set(txt, l); } return l; }
  function decisionQ(les, avoid, txt) { const own = decisionsFor(txt).filter((x) => !(avoid && avoid.has(x[1]))); const d = own.length ? own : DALL().filter((x) => x[0] === les && !(avoid && avoid.has(x[1]))); if (!d.length) return null; const X = own.length ? own[Math.random() * own.length | 0] : pick('dec_' + les, d);
    const o = OUT[X[1]] || []; return mkQ(les, X[1], X[2], X[3], X[4], 'dec', [X[5] || o[0] || null, X[6] || o[1] || null]); }
  // most fact checks become decisions in the moment: each question in a set is swapped, about two times in three, for a
  // decision from the same lesson (never the same decision or the same fact twice in one set). Exams stay straight tests.
  function actify(qs, share) {
    if (!qs || !qs.length) return qs; const seen = new Set(), fids = new Set(qs.map((q) => q && q.fid)), sh = share == null ? .67 : share;
    return qs.map((q) => { if (!q || q.act) return q; const own = decisionsFor(factText(q.fid)).length > 0; if (Math.random() > (own ? Math.max(sh, .85) : sh)) return q; const d = decisionQ(q.les, seen, factText(q.fid)); if (!d || (d.fid && fids.has(d.fid) && d.fid !== q.fid)) return q; seen.add(d.stem); fids.add(d.fid); return d; });
  }
  const PHON = { A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliet', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu' };
  const NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  function decodeQ() {
    const AB = 'ABCDEFGHJKLMNPRSTVWXY', l = [0, 1, 2].map(() => AB[Math.random() * AB.length | 0]), d = [0, 1, 2].map(() => Math.random() * 10 | 0);
    const said = l.map((x) => PHON[x]).join(', ') + ', ' + d.map((x) => NUMW[x]).join(', '), right = l.join('') + ' ' + d.join('');
    const near = { M: 'N', N: 'M', B: 'D', D: 'B', C: 'G', G: 'C', P: 'B', T: 'D', F: 'S', S: 'F', V: 'B', K: 'C', L: 'R', R: 'L', W: 'V', X: 'K', Y: 'V', A: 'E', E: 'A', H: 'A', J: 'G' };
    const sw = (s, i) => s.slice(0, i) + (near[s[i]] || 'K') + s.slice(i + 1), wr = new Set([sw(l.join(''), 0) + ' ' + d.join(''), sw(l.join(''), 2) + ' ' + d.join(''), sw(l.join(''), 1) + ' ' + d.join(''), l.join('') + ' ' + d[0] + d[2] + d[1], l.join('') + ' ' + d[0] + d[1] + ((d[2] + 3) % 10)]); wr.delete(right);
    return mkQ(2, 'Dispatch reads a tag back to you: "' + said + '." What do you write down?', right, [...wr].slice(0, 3), /phonetic-alphabet system uses words/i, 'dec2');
  }
  function missingQ() {
    const parts = [['Officer identification', '"' + (S.cs || '1-Adam-12') + '"'], ['Current location', '"at Bay and Fifth"'], ['Reason for the call', '"on a suspicious vehicle"'], ['Situation details', '"one occupant, engine running"']];
    const m = Math.random() * 4 | 0, msg = parts.filter((_, i) => i !== m).map((p) => p[1].replace(/"/g, '')).join(', ');
    return mkQ(2, 'You key up: "' + msg + '." Dispatch asks you to repeat. What did you leave out?', parts[m][0], parts.filter((_, i) => i !== m).map((p) => p[0]), /brief and accurate with officer identification/i, 'miss');
  }
  // procedures the chapter gives in order
  const ORDERS = [
    [5, 'A right turn with shuffle steering', ['Right hand up to 12 o\'clock, pull down', 'Left hand slides down to 6 o\'clock', 'Hands meet at 6, left hand grips', 'Right hand slides back up to 12'], /move the right hand up to 12 o'clock/i],
    [6, 'Braking to a stop', ['Pivot your right foot onto the brake', 'Set the ball of your foot mid-pedal', 'Apply pressure, then keep increasing it'], /Braking step 1/i],
    [7, 'Cornering', ['Signal before the turn', 'Brake to a safe speed, still straight', 'Line up on the outside of the turn', 'Hold a constant speed into the turn'], /Cornering steps 1 to 3/i],
    [8, 'Backing up', ['Foot on the brake, shift into reverse', 'Turn your upper body to the right', 'Look out the rear window and scan', 'Release the brake and back up slowly'], /Backing steps 1 and 2/i]
  ];
  function orderQ(les) {
    const O = ORDERS.filter((x) => x[0] === les); if (!O.length) return null; const X = pick('ord_' + les, O), right = X[2], wr = new Set();
    for (let t = 0; t < 40 && wr.size < 3; t++) { const p = shuf(right); if (p.join() !== right.join()) wr.add(p.join(' → ')); }
    return mkQ(les, X[1] + ': which order is right?', right.join(' → '), [...wr], X[3], 'ord');
  }
  // one question in a scene may come in a different shape
  function formatQ(les) {
    const f = [];
    if (DALL().some((x) => x[0] === les)) f.push(() => decisionQ(les));
    // decodeQ and missingQ are Chapter 5 radio drills, not used for Vehicle Operations
    if (ORDERS.some((x) => x[0] === les)) f.push(() => orderQ(les));
    if (!f.length) return null; const q = rnd(f)(); return q && q.opts.length >= 3 ? q : null;
  }
  function mixQs(les, qs) { qs = actify(qs); if (!qs.length || qs.some((q) => q.act) || Math.random() > .45) return qs; const q = formatQ(les); if (!q) return qs; const out = qs.slice(); out[Math.random() * out.length | 0] = q; return out; }

  // ---------- mini-games ----------
  let ov = null;
  function overlay(html, cls) {
    if (!ov) { ov = document.createElement('div'); ov.id = 'vgMini'; document.body.appendChild(ov); }
    ov.className = 'vgMini ' + (cls || ''); ov.innerHTML = '<div class="vgCard">' + html + '</div>'; ov.hidden = false; requestAnimationFrame(() => ov.classList.add('on')); return ov.querySelector('.vgCard');
  }
  function closeOv() { if (!ov) return; ov.classList.remove('on'); setTimeout(() => { if (ov && !ov.classList.contains('on')) ov.hidden = true; }, 220); }
  const recordFact = (les, re, ok) => { const fid = fidFor(re, les); if (!fid) return; try { L.record(S, { id: 'MG:' + (fid || les), fid, les }, ok); } catch (e) {} H.saveS(); };
  const head = (k, t, sub) => '<div class="vgHead"><span>' + k + '</span><b>' + t + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div>';
  // Observe: a five-second look at someone, then describe them
  const COLORS = [['red', '#c0392b'], ['blue', '#2563eb'], ['green', '#16a34a'], ['yellow', '#eab308'], ['purple', '#7e22ce'], ['white', '#f1f5f9'], ['gray', '#6b7280'], ['orange', '#ea580c'], ['black', '#1f2937']];
  const CARRY = ['a backpack', 'a duffel bag', 'a plastic shopping bag', 'nothing in their hands'], HATS = ['a ball cap', 'a beanie', 'no hat', 'a hood up'];
  function figure(o) {
    const sk = o.skin, top = o.top[1], bot = o.bot[1];
    return '<svg viewBox="0 0 120 200" class="vgFig" aria-hidden="true"><ellipse cx="60" cy="194" rx="34" ry="5" fill="rgba(0,0,0,.25)"/>' +
      '<rect x="42" y="118" width="15" height="70" rx="6" fill="' + bot + '"/><rect x="63" y="118" width="15" height="70" rx="6" fill="' + bot + '"/>' +
      '<rect x="38" y="182" width="20" height="9" rx="4" fill="#111"/><rect x="62" y="182" width="20" height="9" rx="4" fill="#111"/>' +
      (o.carry === 'a backpack' ? '<rect x="28" y="62" width="18" height="40" rx="6" fill="#374151"/>' : '') +
      '<path d="M36 62 Q60 50 84 62 L86 124 L34 124 Z" fill="' + top + '"/>' + (o.hat === 'a hood up' ? '<path d="M36 64 Q60 40 84 64 Q84 30 60 22 Q36 30 36 64 Z" fill="' + top + '"/>' : '') +
      '<rect x="24" y="64" width="13" height="50" rx="6" fill="' + top + '"/><rect x="83" y="64" width="13" height="50" rx="6" fill="' + top + '"/>' +
      '<circle cx="30" cy="118" r="6" fill="' + sk + '"/><circle cx="90" cy="118" r="6" fill="' + sk + '"/>' +
      (o.carry === 'a duffel bag' ? '<rect x="80" y="116" width="34" height="18" rx="8" fill="#1f2937"/><path d="M90 116 Q97 106 104 116" stroke="#1f2937" stroke-width="3" fill="none"/>' : '') +
      (o.carry === 'a plastic shopping bag' ? '<path d="M84 120 L100 120 L104 146 L80 146 Z" fill="#e5e7eb" stroke="#9ca3af"/>' : '') +
      '<circle cx="60" cy="40" r="17" fill="' + sk + '"/>' + (o.hat === 'a ball cap' ? '<path d="M43 36 Q60 18 77 36 Z" fill="' + o.capC + '"/><rect x="58" y="33" width="26" height="5" rx="2" fill="' + o.capC + '"/>' : o.hat === 'a beanie' ? '<path d="M42 38 Q60 12 78 38 Z" fill="' + o.capC + '"/><rect x="42" y="34" width="36" height="6" rx="3" fill="' + o.capC + '"/>' : o.hat === 'no hat' ? '<path d="M43 36 Q60 20 77 36 Q72 26 60 25 Q48 26 43 36Z" fill="' + o.hair + '"/>' : '') +
      (o.glasses ? '<rect x="49" y="38" width="9" height="6" rx="2" fill="none" stroke="#111" stroke-width="2"/><rect x="62" y="38" width="9" height="6" rx="2" fill="none" stroke="#111" stroke-width="2"/>' : '') + '</svg>';
  }
  function gameObserve(done) {
    const o = { top: rnd(COLORS), bot: rnd(COLORS.filter((c) => ['blue', 'black', 'gray', 'green'].indexOf(c[0]) >= 0)), carry: rnd(CARRY), hat: rnd(HATS), capC: rnd(['#111827', '#b91c1c', '#1d4ed8']), skin: rnd(['#f1c9a5', '#c68e63', '#7a4b2a', '#a26a42']), hair: rnd(['#2b1d14', '#1a1a1a', '#8a5a2b']), glasses: Math.random() < .35 };
    if (o.bot[0] === o.top[0]) o.bot = COLORS[1];
    let left = 5; const card = overlay(head('OBSERVATION', 'Somebody just walked out the side door', 'You get one good look. Notice everything.') + '<div class="vgStage">' + figure(o) + '</div><div class="vgBar"><i></i></div><p class="vgCount">5</p>', 'obs');
    const tm = setInterval(() => { left--; const c = card.querySelector('.vgCount'); if (c) c.textContent = left; if (left <= 0) { clearInterval(tm); ask(); } }, 1000);
    const Qs = shuf([
      ['What color was their shirt?', o.top[0], shuf(COLORS.map((c) => c[0]).filter((x) => x !== o.top[0])).slice(0, 3)],
      ['What were they carrying?', o.carry, CARRY.filter((x) => x !== o.carry)],
      ['What was on their head?', o.hat, HATS.filter((x) => x !== o.hat)],
      ['Were they wearing glasses?', o.glasses ? 'Yes, glasses' : 'No glasses', [o.glasses ? 'No glasses' : 'Yes, glasses', 'Sunglasses', "You couldn't tell"]]
    ]).slice(0, 2);
    let qi = 0, right = 0;
    function ask() {
      if (qi >= Qs.length) return finish(); const Q = Qs[qi], opts = shuf([Q[1]].concat(Q[2]));
      card.innerHTML = head('OBSERVATION', Q[0], 'Question ' + (qi + 1) + ' of ' + Qs.length) + '<div class="vgOpts">' + opts.map((x, k) => '<button type="button" data-k="' + k + '">' + x.charAt(0).toUpperCase() + x.slice(1) + '</button>').join('') + '</div>';
      card.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => { const ok = opts[+b.dataset.k] === Q[1]; if (ok) right++; card.querySelectorAll('[data-k]').forEach((x) => { x.disabled = true; if (opts[+x.dataset.k] === Q[1]) x.classList.add('ok'); else if (x === b) x.classList.add('no'); }); setTimeout(() => { qi++; ask(); }, 800); });
    }
    function finish() {
      recordFact(1, /When observing people, note appearance/i, right === Qs.length);
      card.innerHTML = head('OBSERVATION', right === Qs.length ? 'Good eye.' : right ? 'Half of it.' : 'It went by fast.', right + ' of ' + Qs.length + ' details right') + '<div class="vgStage">' + figure(o) + '</div><p class="vgNote">When you observe people, note appearance, height, weight, hair, clothing, approximate age and other details. Those are what end up in the BOLO.</p><div class="vgActs"><button type="button" class="vgGo">Keep going</button></div>';
      card.querySelector('.vgGo').onclick = () => { closeOv(); done(right / Qs.length); };
    }
  }
  // BOLO: choose what goes out over the air
  function gameBolo(done) {
    const good = ['Name and identifiers, if known', 'Where it happened', 'Why you are looking for them', 'The alleged violation', 'Last known location and direction', 'A description of the person and vehicle'];
    const bad = ["The caller's opinion of them", 'Your guess about their motive', 'What the neighbors think happened', "How long you've been on shift"];
    const all = shuf(good.concat(shuf(bad).slice(0, 3))), sel = new Set();
    const card = overlay(head('BOLO', 'Put out the lookout', 'Pick everything that belongs in the broadcast.') + '<div class="vgPick">' + all.map((x, k) => '<button type="button" data-k="' + k + '">' + x + '</button>').join('') + '</div><div class="vgActs"><button type="button" class="vgGo">Send it</button></div>');
    card.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => { const k = +b.dataset.k; if (sel.has(k)) sel.delete(k); else sel.add(k); b.classList.toggle('on'); });
    card.querySelector('.vgGo').onclick = () => {
      let hit = 0, wrong = 0; all.forEach((x, k) => { const g = good.indexOf(x) >= 0; if (g && sel.has(k)) hit++; if (!g && sel.has(k)) wrong++; });
      const ok = hit === good.length && !wrong; recordFact(4, /A BOLO should include/i, ok);
      card.querySelectorAll('[data-k]').forEach((b) => { const g = good.indexOf(all[+b.dataset.k]) >= 0, s = sel.has(+b.dataset.k); b.disabled = true; b.classList.add(g ? (s ? 'ok' : 'miss') : s ? 'no' : 'dim'); });
      card.querySelector('.vgActs').innerHTML = '<p class="vgNote">' + (ok ? 'Clean broadcast. Every unit knows exactly who to look for.' : 'A BOLO includes the name and identifiers, where it happened, why, the alleged violation, last known location and direction, and a description. Opinions and guesses stay off the air.') + '</p><button type="button" class="vgGo">Keep going</button>';
      card.querySelector('.vgGo').onclick = () => { closeOv(); done(ok ? 1 : hit / good.length * .6); };
    };
  }
  // Clear a room: three decisions with a floor plan
  function gameClear(done) {
    const steps = [
      ['You reach the doorway of a dark back room.', [['Stand to one side and cut the pie', 1], ['Step into the doorway and look in', 0], ['Rush in fast before anyone reacts', 0]], 'Cutting the pie means scanning as much of the room as you can from the side of the door before you go in. The doorway itself is a fatal funnel.', /Cutting the pie/i, 0],
      ['You step inside. Where do you look first?', [['The deep corners you could not see', 1], ['The middle of the room in front of you', 0], ['The closet on the far wall', 0]], 'Deep corners cannot be seen from the doorway, so you clear them first on entry.', /Deep corners cannot be seen/i, 1],
      ["There's another door at the back. Your partner is with you.", [['Stay together and search each room fully', 1], ['Split up so you clear rooms faster', 0], ['Move on once the room looks empty', 0]], 'Stay together, search each room completely before moving on, and say out loud which area each of you has.', /Clear rooms of immediate threats/i, 2]
    ];
    let si = 0, right = 0;
    const plan = (k) => '<svg viewBox="0 0 220 120" class="vgPlan" aria-hidden="true"><rect x="10" y="10" width="200" height="100" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><line x1="110" y1="10" x2="110" y2="110" stroke="currentColor" stroke-width="3"/><rect x="104" y="48" width="12" height="24" fill="var(--vgBg)"/><rect x="4" y="48" width="12" height="24" fill="var(--vgBg)"/>' +
      '<path d="M20 18 L50 18 L20 48Z" fill="rgba(239,68,68,.3)"/><path d="M20 102 L50 102 L20 72Z" fill="rgba(239,68,68,.3)"/><path d="M120 18 L150 18 L120 48Z" fill="rgba(239,68,68,.3)"/><path d="M120 102 L150 102 L120 72Z" fill="rgba(239,68,68,.3)"/>' +
      '<circle cx="' + [2, 30, 92][k] + '" cy="' + [40, 60, 60][k] + '" r="7" fill="#f5b800"/>' + (k === 2 ? '<circle cx="80" cy="72" r="7" fill="#60a5fa"/>' : '') + '<text x="60" y="66" font-size="10" text-anchor="middle" fill="currentColor" opacity=".6">ROOM 1</text><text x="160" y="66" font-size="10" text-anchor="middle" fill="currentColor" opacity=".6">ROOM 2</text></svg>';
    const card = overlay('', 'clear');
    function show() {
      const X = steps[si], opts = shuf(X[1]);
      card.innerHTML = head('BUILDING SEARCH', X[0], 'Decision ' + (si + 1) + ' of 3') + plan(X[4]) + '<div class="vgOpts">' + opts.map((o, k) => '<button type="button" data-k="' + k + '">' + o[0] + '</button>').join('') + '</div>';
      card.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => {
        const o = opts[+b.dataset.k], ok = !!o[1]; if (ok) right++; recordFact(17, X[3], ok);
        card.querySelectorAll('[data-k]').forEach((x) => { x.disabled = true; if (opts[+x.dataset.k][1]) x.classList.add('ok'); else if (x === b) x.classList.add('no'); });
        const n = document.createElement('p'); n.className = 'vgNote'; n.textContent = (ok ? 'Right. ' : '') + X[2]; card.appendChild(n);
        const a = document.createElement('div'); a.className = 'vgActs'; a.innerHTML = '<button type="button" class="vgGo">' + (si < 2 ? 'Next' : 'Finish') + '</button>'; card.appendChild(a);
        a.querySelector('.vgGo').onclick = () => { si++; if (si < steps.length) show(); else { closeOv(); done(right / 3); } };
      });
    }
    show();
  }
  // Perimeter: two officers, one building; put them where they can see the most
  function gamePerimeter(done) {
    const P8 = [[30, 20], [110, 20], [190, 20], [190, 80], [190, 140], [110, 140], [30, 140], [30, 80]], corner = [0, 2, 4, 6], sel = [];
    const draw = (show) => '<svg viewBox="0 0 220 160" class="vgPlan per" aria-hidden="true"><rect x="60" y="45" width="100" height="70" rx="3" fill="rgba(148,163,184,.25)" stroke="currentColor" stroke-width="2"/><text x="110" y="84" text-anchor="middle" font-size="10" fill="currentColor" opacity=".7">SUSPECT INSIDE</text>' +
      (show ? sel.map((k) => { const [x, y] = P8[k]; return corner.indexOf(k) >= 0 ? '<path d="M' + x + ' ' + y + ' L' + (x < 110 ? 60 : 160) + ' ' + (y < 80 ? 45 : 115) + ' L' + (x < 110 ? 160 : 60) + ' ' + (y < 80 ? 45 : 115) + 'Z M' + x + ' ' + y + ' L' + (x < 110 ? 60 : 160) + ' ' + (y < 80 ? 115 : 45) + '" fill="rgba(245,184,0,.18)" stroke="#f5b800" stroke-dasharray="3 3"/>' : '<path d="M' + x + ' ' + y + ' L' + (y === 80 ? (x < 110 ? '60 45 L60 115' : '160 45 L160 115') : (y < 80 ? '60 45 L160 45' : '60 115 L160 115')) + 'Z" fill="rgba(245,184,0,.18)" stroke="#f5b800" stroke-dasharray="3 3"/>'; }).join('') : '') +
      P8.map((p, k) => '<g data-k="' + k + '" class="vgPt' + (sel.indexOf(k) >= 0 ? ' on' : '') + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="11"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="4"/></g>').join('') + '</svg>';
    const card = overlay('', 'per');
    function render(fin) {
      card.innerHTML = head('PERIMETER', 'Two officers, one building', fin ? '' : 'Tap two spots. You want eyes on all four sides.') + draw(fin) + (fin ? '' : '<div class="vgActs"><button type="button" class="vgGo"' + (sel.length < 2 ? ' disabled' : '') + '>Set the perimeter</button></div>');
      if (fin) return; card.querySelectorAll('[data-k]').forEach((g) => g.onclick = () => { const k = +g.dataset.k, i = sel.indexOf(k); if (i >= 0) sel.splice(i, 1); else { if (sel.length >= 2) sel.shift(); sel.push(k); } render(); });
      card.querySelector('.vgGo').onclick = () => {
        const ok = sel.length === 2 && sel.every((k) => corner.indexOf(k) >= 0) && Math.abs(sel[0] - sel[1]) === 4; recordFact(18, /basic perimeter can be set with minimal resources/i, ok);
        render(true); const n = document.createElement('div'); n.innerHTML = '<p class="vgNote">' + (ok ? 'Opposite corners. Each of you can see two full sides, so nobody leaves without being seen.' : 'From opposite corners, two officers can see all four sides. A basic perimeter usually takes just two officers.') + '</p><div class="vgActs"><button type="button" class="vgGo">Keep going</button></div>';
        card.appendChild(n); n.querySelector('.vgGo').onclick = () => { closeOv(); done(ok ? 1 : 0); };
      };
    }
    render();
  }
  const GAMES = { observe: gameObserve, bolo: gameBolo, clear: gameClear, perimeter: gamePerimeter };
  function miniFor(text) {
    if (/alarm|building search|back door|storeroom|storage|open at a closed/i.test(text)) return 'clear';
    if (/fled|ran into|area search|search for|woods|missing at the park|railyard|lumber/i.test(text)) return 'perimeter';
    if (/suspicious|robbery|burglary just|shoplift|stolen|grabbed|theft|BOLO|lookout/i.test(text)) return Math.random() < .5 ? 'observe' : 'bolo';
    return null;
  }
  const miniLine = (k, after) => ['wait', (res, resume) => { GAMES[k]((score) => { res.mg = (res.mg || 0) + score; H.award(Math.round(10 + score * 20), 'field skill'); H.stat('minigames'); if (after) after(score); resume(); }); }];
  function sceneMini(c) { if (c.ops || c.deesc) return null; const k = miniFor(c.title + ' ' + c.text); if (!k || Math.random() > .55) return null; return miniLine(k); }

  // ---------- small unscripted moments ----------
  let ambT = 60;
  const MOMENTS = [
    () => { H.toast('A kid in a car seat waves at you. You wave back. He loses his mind.'); },
    () => { H.toast('The ice cream truck plays the same eight notes for the fourth time. You will hear them in your sleep.'); },
    () => { const id = H.sayAs('amb', { name: 'Mrs. Ocampo', icon: '👵', role: 'On her porch' }); H.dialogue([[id, "Officer! You look like you're melting. I made lemonade. It's not poisoned. I promise."], ['choice', [
      { t: 'Take a cup and thank her', trust: 1, reply: [[id, "Good. Now you have to come back and tell me if it's better than my sister's."]], fx: () => H.award(5, 'community') },
      { t: 'Thank her, but you have to keep moving', reply: [[id, "Go, go. I'll save you some."]] },
      { t: 'Ask how the neighborhood has been lately', trust: 1, reply: [[id, "Quiet, mostly. Somebody keeps stealing the Hendersons' newspaper. I have theories."]] }], 'Mrs. Ocampo is holding out a cup.']], null, { kicker: 'STREET LIFE' }); },
    () => { const id = H.sayAs('amb', { name: 'Tourist', icon: '🧑', role: 'Lost' }); const lm = H.landmark(); H.dialogue([[id, "Sorry, officer. Quick question. Which way is " + lm + "? My phone says I'm standing on it."], ['choice', [
      { t: 'Walk them to the corner and point', trust: 1, reply: [[id, "Oh! It's right there. Wow. Okay. Thank you. I've been walking in circles for twenty minutes."]], fx: () => H.award(4, 'community') },
      { t: 'Give them directions from here', reply: [[id, "Left, then right, then... okay. I'll figure it out. Thanks!"]] }], 'They look hopeful.']], null, { kicker: 'STREET LIFE' }); },
    () => { const id = H.sayAs('amb', { name: 'Ray Mendez', icon: '🧔', role: 'Found something' }); H.dialogue([[id, "Officer, I found this wallet on the bench. There's like eighty bucks in it. I don't want it to look like I took anything."], ['choice', [
      { t: 'Take it and log it as found property', ok: 1, trust: 1, reply: [[id, "Good. I'd want somebody to do that for me."], ['narr', "You'll check it for an owner and log it. Lost property has rules for a reason."]], fx: () => { H.award(8, 'found property'); recordFact(13, /found property|lost property/i, true); } },
      { t: 'Tell him to drop it in a mailbox', reply: [[id, "A mailbox? Is that a thing? That feels like a thing that's not a thing."]] },
      { t: 'Tell him to hang on to it in case they come back', reply: [[id, "Uh, no. I'm not holding a stranger's eighty bucks. That's how people get accused of stuff."]] }], 'He holds out the wallet.']], null, { kicker: 'STREET LIFE' }); },
    () => { const id = H.sayAs('amb', { name: 'Kids at the court', icon: '🧒', role: 'Pickup game' }); H.dialogue([[id, "Yo, officer! One shot. If you make it, we'll stop calling you 5-0. If you miss, we're calling you 5-0."], ['choice', [
      { t: 'Take the shot', trust: 1, reply: [['narr', Math.random() < .45 ? "Swish. The court goes absolutely silent, then loses it." : "It hits the rim, the backboard, the rim again, and falls out. The court loses it anyway."], [id, "Okay okay, respect. Come back Saturday."]], fx: () => { H.award(6, 'community'); H.stat('hoops'); } },
      { t: 'Wave and keep walking', reply: [[id, "Scared! Ha. Next time, officer."]] }], 'The ball is already in your hands.']], null, { kicker: 'STREET LIFE' }); },
    () => { const id = H.sayAs('amb', { name: 'Gene', icon: '🧔', role: 'Chasing a beagle' }); H.dialogue([['narr', "A beagle tears past you dragging a leash. A man in socks is chasing it, losing badly."], ['choice', [
      { t: 'Step on the leash as it goes by', trust: 1, reply: [['narr', "The beagle stops so hard it does a little flip. It is completely fine and very proud of itself."], [id, "Oh my God. Thank you. He's done this four times this week. FOUR."]], fx: () => H.award(5, 'community') },
      { t: 'Call out to the dog by whistling', reply: [['narr', "The beagle looks back at you, considers it, and keeps going."], [id, "He doesn't listen to anybody! Thanks for trying!"]] }], 'The beagle is closing fast.']], null, { kicker: 'STREET LIFE' }); },
    () => { H.toast('An older man on a porch gives you a slow salute. You return it. He nods like you passed something.'); }
  ];
  function ambient() {
    // people from closed cases come back first
    if (epiDue()) return epilogue();
    const p = partner(); if (p && Math.random() < .25) { H.radio(p.p.name ? p.p.name.replace(/^Ofc\. /, '') : 'Castillo', pLine(p, 'idle')); return; }
    const m = pick('moment', MOMENTS.map((_, i) => i)); MOMENTS[m](); logEvent(.3);
  }
  function tick(dt) {
    // never right on the heels of something else: wait at least 12 seconds of free time after anything ends
    if (!H.free() || H.call() || (S.cfg && S.cfg.noAmbient)) { ambT = Math.max(ambT, 12); return; } ambT -= dt;
    if (ambT <= 0) { ambT = 55 + Math.random() * 50; if (heat() < 4) ambient(); }
  }

  // ---------- quests ----------
  S.epi = S.epi || [];
  function questDone(q, who) { S.vqShape = questShape(q); if (!who) return; S.epi.push({ q: q.title, who, at: clock() + 240 + Math.random() * 300, d: H.did() }); while (S.epi.length > 6) S.epi.shift(); H.saveS(); }
  const epiDue = () => S.epi.some((e) => e.d === H.did() && clock() >= e.at);
  function epilogue() {
    const i = S.epi.findIndex((e) => e.d === H.did() && clock() >= e.at); if (i < 0) return; const e = S.epi.splice(i, 1)[0]; H.saveS();
    const q = L.pickFacts(S, H.lessons(), 1)[0], lines = [['narr', pick('epiN', ["Someone calls your name from across the street.", "You hear somebody jogging up behind you.", "A familiar face flags you down."])],
      [e.who, pick('epi1', ["Hey! I was hoping I'd run into you. About " + e.q.toLowerCase() + ". Things are better. I wanted you to hear it from me.", "I never really thanked you. For " + e.q.toLowerCase() + ", I mean. So. Thank you.", "Remember me? " + e.q + ". I think about how that went more than you'd guess."])],
      [e.who, pick('epi2', ["Okay, now I'm going to quiz you, because my nephew's in the academy and he says you all forget everything.", "Let me ask you something. I've been reading up on what you do.", "Can I ask you something I've been wondering about?"])]];
    if (q) lines.push(['q', q, e.who]);
    lines.push([e.who, pick('epi3', ["Anyway. You're good at this. Don't let anybody tell you different.", "Alright, I'll let you go. Stay safe out there.", "Okay. That's all. Go do your thing."])]);
    H.dialogue(lines, (r) => { H.award(15 + (r && r.right ? 15 : 0), 'they came back'); H.stat('epilogues'); }, { kicker: 'SOMEONE FROM AN OLD CASE' });
  }
  const PAUSE = ["Hold on, let me finish this text. Sorry. Okay. I'm here.", "Sorry, I was on the phone with my sister. She talks a lot. Okay.", "Give me one second. Okay. Hi. Sorry."];
  // ---------- quest flow rules ----------
  // A beat's shape: delivering something, searching a place, making a decision, or a conversation. Two steps in a row
  // never play as the same shape: a repeat gets a different beat (a field mini-game or a decision question) worked in.
  const stepShape = (st) => (st.take || st.need ? 'deliver' : st.inside ? 'search' : (st.say || []).some((l) => l[0] === 'choice') ? 'decide' : 'talk');
  // a quest's shape, for offering cases: errands, mysteries, people stories and plain talks take turns
  const QSH = {};
  function questShape(q) { if (QSH[q.id]) return QSH[q.id]; const s = q.steps || [];
    return (QSH[q.id] = s.some((x) => x.take || x.need) ? 'errand' : s.some((x) => x.twist) ? 'mystery' : s.some((x) => x.inside) ? 'search' : s.some((x) => (x.say || []).some((l) => l[0] === 'choice')) ? 'dilemma' : 'talk'); }
  // the case just closed sets the kind the street gossip steers you away from next (nothing is hidden; it only points elsewhere)
  function offerOK(q, avail) { const last = S.vqShape; if (!last || questShape(q) !== last) return true; return !avail.some((o) => o !== q && questShape(o) !== last); }
  // a line longer than a phone screen comfortably holds is split at a sentence break, same speaker
  const SPLIT = 170, NOSPLIT = { q: 1, fx: 1, gate: 1, wait: 1, choice: 1 };
  function splitLong(lines) {
    const out = [];
    lines.forEach((l) => {
      if (Array.isArray(l) && l.length === 2 && typeof l[0] === 'string' && !NOSPLIT[l[0]] && typeof l[1] === 'string' && l[1].length > SPLIT) {
        const parts = l[1].match(/[^.!?]+[.!?]+["'”’)]*\s*|[^.!?]+$/g);
        if (parts && parts.length > 1 && parts.join('') === l[1]) { let a = '', i = 0; const half = l[1].length / 2;
          while (i < parts.length - 1 && (a.length + parts[i].length <= half + 30 || !a)) a += parts[i++];
          const b = parts.slice(i).join(''); if (a.trim() && b.trim()) { out.push([l[0], a.trim()], [l[0], b.trim()]); return; } }
      }
      out.push(l);
    });
    return out;
  }
  function questSeq(o) {
    const { st, seq, side } = o; let out = splitLong(seq); const who = st.who, p = partner(), cond = COND[S.vcond || 'normal'];
    const pre = [];
    // a sad or tense scene (or one that turns) opens on its own first line: no small talk, no partner quip before it
    if (!o.quiet) {
      if (who && Math.random() < .12) pre.push([who, pick('qpause', PAUSE)]);
      if (who && cond && cond.remark && Math.random() < .25) pre.push([who, pick('qrem_' + S.vcond, cond.remark)]);
      if (p && Math.random() < .2) pre.push([p.id, pLine(p, 'arrive')]);
    }
    // a question in a different shape now and then
    out = out.map((l) => (l[0] === 'q' && Math.random() < .3 ? (() => { const f = formatQ(l[1].les); return f ? ['q', f, l[2]] : l; })() : l));
    // a mini-game when the scene is about searching, observing or a lookout
    const text = [st.goal || ''].concat((st.say || []).map((l) => (typeof l[1] === 'string' ? l[1] : ''))).join(' ');
    const k = side && !o.quiet && Math.random() < .35 ? miniFor(text) : null, at = out.findIndex((l) => l[0] === 'q');
    if (k) out.splice(at >= 0 ? at : Math.min(2, out.length), 0, ['narr', pick('mgLead', ["Before anything else, there's something you need to handle.", "First things first.", "This part's on you."])], miniLine(k));
    // same shape as the step before: work in a different beat so the case does not settle into a loop
    let shape = k ? 'mini' : stepShape(st);
    if (!k && !o.quiet && shape === S.vqBeat) { // (a heavy scene is never broken up by an extra beat)
      const k2 = shape !== 'search' ? miniFor(text) : null;
      if (k2) { out.splice(at >= 0 ? at : Math.min(2, out.length), 0, ['narr', pick('mgLead2', ["Something needs doing first.", "Hold on. This comes first.", "Before the talking, there's work."])], miniLine(k2)); shape = 'mini'; }
      else { const les = (st.quiz && st.quiz.les) != null ? [st.quiz.les] : H.lessons(), dq = (() => { for (const x of les) { const q = decisionQ(x); if (q) return q; } return null; })();
        if (dq) { const ch = out.findIndex((l) => l[0] === 'choice'), sp = st.who || 'castillo'; out.splice(ch >= 0 ? ch : Math.max(1, Math.ceil(out.length / 2)), 0, [sp, pick('decLead', ["Let me ask you something. What would you do here?", "Your call on this one. What do you do?", "Real quick, how would you handle this?"])], ['q', dq, sp]); shape = 'decide-q'; } }
    }
    S.vqBeat = shape;
    return pre.concat(out);
  }

  return {
    pick, hold, pickCall, logEvent, heat, dispatcher, dispatchText, caller, callerLines, complication, midChoice, wrapChoice, afterLines, afterScene, enRoute,
    wantPair, offerPair, otherOutcome, mixQs, formatQ, actify, decisionQ, decisionsFor, ACTS, sceneMini, miniLine, GAMES, tick, onShift, partner, questSeq, questDone, questShape, stepShape, offerOK, splitLong,
    cond: () => COND[S.vcond || 'normal'], aKey, warmDecisions
  };
}
