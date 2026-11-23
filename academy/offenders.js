// Repeat offenders who remember you. Each district has two people who keep turning up on calls, shift after shift.
// Their trouble escalates over four meetings, and they remember how you handled them last time: talk with them and
// they come back calmer and readier to listen; come down hard and they come back angry or with a story; watch first
// and they get careful around you. The fourth meeting settles it, and how it ends depends on how you treated them
// across all of it: they turn it around and become someone who waves you down with a tip, they get charged, or they
// pack up and leave the district. Each meeting is a call that teaches a lesson from that district.
// stage: [call title, what dispatch says, lesson, what they say if you talked last time, if you were hard, if you watched]
const P = {
  0: [{ id: 'dale', k: 'annoyed', name: 'Dale Hutchins', icon: '🧔', role: 'Drives a rusted pickup', stages: [
      ['Pickup with bald tires blocking the bank lane', 'Same pickup, third complaint this month. Tires are down to the cords.', 0, null, null, null],
      ['Rusted pickup leaking fluid at Founders Plaza', 'Dale Hutchins again. Fluid all over the lane.', 0, 'You again. I put two new tires on it like you said. The leak\'s new.', 'Oh, great. Officer By-the-Book. You gonna write me up in front of everybody again?', 'You looked at my truck for five minutes last time. I noticed.'],
      ['Pickup weaving near the school zone', 'Hutchins\' pickup, swerving around stopped cars by the school.', 1, 'I swerved for a kid on a bike. I swear. You know I\'m trying.', 'I didn\'t do nothing. You people have it out for me.', 'Before you start, the brakes pull left. I know. I know.'],
      ['Dale Hutchins flagging you down', 'Dale Hutchins is asking for you by name.', 1, null, null, null]] },
    { id: 'tina', k: 'wary', name: 'Tina Marsh', icon: '🛹', role: 'Sixteen, skateboards everywhere', stages: [
      ['Skater hanging onto a moving car', 'A teenager grabbing the bumpers of cars on Main to get pulled along.', 1, null, null, null],
      ['Skater in traffic again on Main', 'Same kid, same trick, rush hour this time.', 1, 'Okay, okay. I know. My mom says hi, by the way.', 'Are you going to call my school again?', 'I saw you watching from the corner last time. Creepy. But fair.'],
      ['Kids skating off the parking garage ramp', 'Tina Marsh and two friends launching off the garage ramp into the street.', 1, 'I brought my friends to show them the right way. Kind of.', 'Whatever. Write it down. Everyone knows you hate us.', 'You\'re gonna stand there and watch again, huh.'],
      ['Tina Marsh at the station front desk', 'Tina Marsh asked the front desk for you.', 0, null, null, null]] }],
  1: [{ id: 'ray', k: 'annoyed', name: 'Ray Polk', icon: '⛽', role: 'Runs the corner gas station', stages: [
      ['Gas station hosing oil onto the road', 'Station attendant washing spilled oil straight into the turn lane.', 2, null, null, null],
      ['Slick turn lane by the gas station again', 'Ray Polk\'s station again. Two cars slid this morning.', 2, 'I bought the absorbent stuff. Ran out. I\'m trying here.', 'Here we go. You going to shut me down this time?', 'You were taking pictures last time. I fixed the drain.'],
      ['Gas station lot full of cars at night', 'Cars racing laps in Polk\'s lot after closing.', 3, 'They\'re not mine, I swear. Help me get them out of here.', 'Not my problem. I lock up at eleven.', 'You\'re gonna sit and watch them, right? Good. Watch.'],
      ['Ray Polk waving you into the station', 'Ray Polk says he has something for you.', 3, null, null, null]] },
    { id: 'brennan', k: 'wary', name: 'Cody Brennan', icon: '🧢', role: 'Nineteen, loud car, louder friends', stages: [
      ['Street racing at the strip mall', 'Two cars racing the length of the strip mall lot.', 3, null, null, null],
      ['Same tuned car racing on wet roads', 'Brennan\'s car again, racing in the rain this time.', 2, 'I slowed down in the rain. Mostly. I listened.', 'You took my keys in front of my girlfriend. Thanks for that.', 'You just watched last time. I figured you were taking notes.'],
      ['Car spun out on Palm Avenue', 'A tuned car spun into a light pole on Palm. Driver is out and walking.', 2, 'I wasn\'t racing. I swear I wasn\'t. The road was just wet.', 'Before you say it: lawyer.', 'You already know what happened, don\'t you.'],
      ['Cody Brennan at the curb, waiting', 'Cody Brennan wants to talk to the officer who keeps showing up.', 3, null, null, null]] }],
  2: [{ id: 'gus', k: 'annoyed', name: 'Gus Ortega', icon: '🚚', role: 'Delivery van driver', stages: [
      ['Overloaded delivery van leaning on the curve', 'A delivery van so overloaded it\'s leaning on the river curve.', 4, null, null, null],
      ['Same van, loose load on the bridge', 'Ortega\'s van again. Boxes falling off on the bridge.', 4, 'I strapped it this time. Most of it. The boss wants twelve stops.', 'You cost me a day\'s pay last time.', 'You looked at the load for a long time. Yeah. I know.'],
      ['Van cutting the river path corner', 'Ortega\'s van cut the corner by the river path and clipped a sign.', 5, 'My boss changed the route. I\'m out of time. Every day.', 'Write it up. I\'m done caring.', 'You saw the tire marks. I know you did.'],
      ['Gus Ortega outside the depot', 'Gus Ortega asked dispatch for you.', 5, null, null, null]] },
    { id: 'lena', k: 'shaken', name: 'Lena Fay', icon: '🚗', role: 'Brand new driver, very nervous', stages: [
      ['New driver frozen in the turn lane', 'A new driver stopped dead in the turn lane, crying.', 5, null, null, null],
      ['New driver overcorrected into the grass', 'Same new driver, overcorrected onto the stadium lawn.', 5, 'Oh thank God, it\'s you. You were nice last time.', 'Please don\'t yell. Please.', 'You watched me park last time. I practiced.'],
      ['New driver stalled at the stadium exit', 'Lena Fay stalled in the stadium exit lane during a game.', 4, 'I did the hand position thing you said. Then everyone honked.', 'I know, I know, I\'m a hazard.', 'Go ahead, tell me what I did. You always see it.'],
      ['Lena Fay at the curb with a big smile', 'Lena Fay is asking for you by name.', 5, null, null, null]] }],
  3: [{ id: 'earl', k: 'annoyed', name: 'Earl Tibbs', icon: '🚛', role: 'Yard truck driver, thirty years', stages: [
      ['Truck backing blind across the road', 'A yard truck backing across the road with no spotter.', 8, null, null, null],
      ['Truck backing out of the yard again', 'Earl Tibbs, backing out blind again.', 8, 'Got a kid to spot for me now. He\'s on break.', 'Thirty years I\'ve backed this truck. Thirty.', 'You stood behind my truck and watched last time. Smart.'],
      ['Trailer clipped a fence post', 'Tibbs\' trailer took out a fence post backing in.', 8, 'Okay. Okay. Maybe I need the camera. I\'ll ask.', 'One fence post. Arrest me.', 'Yeah, I know what you\'re going to say.'],
      ['Earl Tibbs at the yard gate', 'Earl Tibbs asked for you at the yard.', 7, null, null, null]] },
    { id: 'mo', k: 'annoyed', name: 'Mo Danvers', icon: '📦', role: 'Semi driver, always late', stages: [
      ['Semi taking the rail yard corner too fast', 'A semi swung wide on the rail yard corner and dragged a barrier.', 7, null, null, null],
      ['Same semi, same corner, wet road', 'Danvers\' rig again on the rail yard corner, in the rain.', 7, 'I slowed for it. Still swung wide. Long trailer.', 'Every cop in this town wants my license.', 'You were out here watching the corner. I saw you.'],
      ['Semi brakes smoking at the bottom of the hill', 'Danvers\' rig at the bottom of the hill, brakes smoking.', 6, 'I rode the brakes like you told me not to. I know.', 'Brakes are fine. Next question.', 'You can smell it too, huh.'],
      ['Mo Danvers at the truck stop', 'Mo Danvers asked for the officer who keeps pulling him over.', 6, null, null, null]] }],
  4: [{ id: 'kyle', k: 'wary', name: 'Kyle Renner', icon: '🔦', role: 'Drives the county road with no lights', stages: [
      ['Car on the county road with no headlights', 'A car driving the dark stretch past the jail with its lights off.', 9, null, null, null],
      ['No-lights car again past the jail', 'Kyle Renner, lights off on the county road again.', 9, 'Bulb\'s out. I got the part. Haven\'t had time.', 'Lights are fine. You just can\'t see.', 'You followed me a mile before you lit me up last time.'],
      ['Driver won\'t stop for lights and siren', 'Renner\'s car rolled past a deputy\'s lights and kept going, slow.', 10, 'I didn\'t see you. Honest. I would have stopped for you.', 'I don\'t stop for cops. You know that.', 'I knew you were back there. I always know.'],
      ['Kyle Renner at the courthouse steps', 'Kyle Renner is outside the courthouse asking for you.', 11, null, null, null]] },
    { id: 'sheila', k: 'sheepish', name: 'Sheila Voss', icon: '🚙', role: 'Never pulls over for sirens', stages: [
      ['Driver blocking an ambulance on Justice Row', 'An SUV refusing to pull over for an ambulance on Justice Row.', 10, null, null, null],
      ['Same SUV blocking a fire truck', 'Sheila Voss\' SUV, sitting in the lane while a fire truck waits.', 10, 'I panic. I don\'t know which way to go. You told me right. I forgot.', 'They can go around. It\'s a free country.', 'You saw me freeze. I know you did.'],
      ['SUV boxed in a transport van', 'Voss\' SUV stopped dead in front of a jail transport.', 11, 'I pulled right! I did! Then I didn\'t know what to do.', 'I was here first.', 'Go on. You saw the whole thing.'],
      ['Sheila Voss at the jail lobby', 'Sheila Voss asked the jail lobby to call you.', 10, null, null, null]] }]
};
const ENDS = { good: (n) => n + ' turned it around. Next time you\'re in the district, they\'ll wave you down with a tip.', hard: (n) => n + ' was charged. The case is closed and the block remembers how.', away: (n) => n + ' packed up and left the district. Nobody\'s sure if that\'s good.' };

export function installOffenders(H) {
  const S = H.S; S.reps = S.reps || {}; // id -> { st: stage reached, w: [ways used], last: way, right: count, sh: shift seen, done }
  const rec = (id) => (S.reps[id] = S.reps[id] || { st: 0, w: [], last: null, right: 0, sh: -1 });
  // a call from someone who keeps coming back: at most one meeting per person per shift, most often early in a shift
  function call(did, shift) { const list = (P[did] || []).filter((p) => { const r = rec(p.id); return !r.done && r.sh !== shift && r.st < p.stages.length; }); if (!list.length || Math.random() > .22) return null;
    const p = list[(Math.random() * list.length) | 0], r = rec(p.id), st = p.stages[r.st], t = [st[0], r.st === 3 ? 3 : r.st >= 2 ? 2 : 3, 'any', st[1]]; t.les0 = st[2]; t.rep = { id: p.id, did, stage: r.st, k: p.k, name: p.name, icon: p.icon }; /* k: how they talk for the rest of the scene (variety.js caller types) */ return t; }
  const find = (id) => { for (const d in P) { const p = P[d].find((x) => x.id === id); if (p) return p; } return null; };
  // what the person says when you show up, shaped by how you handled them last time; and their mood for the scene
  /* who they are, so the scene's caller is them */
  function who(rep) { const p = find(rep.id); return { name: p.name, icon: p.icon, role: p.role + ' · meeting ' + (rep.stage + 1) + ' of 4' }; }
  function lines(rep, cid) { const p = find(rep.id), r = rec(rep.id), st = p.stages[rep.stage], who = cid, out = [];
    if (rep.stage === 0) out.push(['narr', 'You don\'t know ' + p.name + ' yet. You will.']);
    else if (rep.stage === 3) out.push(['narr', p.name + ' again. Fourth time. This is where it settles.']);
    const said = r.last === 'talk' ? st[3] : r.last === 'enforce' ? st[4] : r.last === 'observe' ? st[5] : null; if (said) out.push([who, said]);
    if (rep.stage === 3) { const tally = { talk: 0, enforce: 0, observe: 0 }; r.w.forEach((w) => { tally[w] = (tally[w] || 0) + 1; }); const sc = tally.talk * 2 + r.right - tally.enforce * 2, end = tally.enforce >= 2 && tally.enforce > tally.talk ? 'hard' : sc >= 3 ? 'good' : 'away'; /* calls with no choice of approach count for neither side */ rep.end = end;
      out.push([who, end === 'good' ? 'I wanted to say it to your face. You kept treating me like a person. So. I fixed it. All of it.' : end === 'hard' ? 'Save it. My lawyer says I shouldn\'t talk to you.' : 'I\'m moving to my sister\'s. Different county. Thought you should know.']); }
    return { lines: out, who, intent: r.last === 'enforce' ? (Math.random() < .5 ? 'angry' : 'lying') : r.last === 'talk' ? 'calm' : r.last === 'observe' ? 'nervous' : null }; }
  // after the call: remember how you handled it, and settle it at the fourth meeting
  function after(c, shift) { const rep = c.rep; if (!rep) return null; const r = rec(rep.id), p = find(rep.id); if (c.way) { r.w.push(c.way); r.last = c.way; } if (c.readRight) r.right++; r.sh = shift; r.st = rep.stage + 1;
    if (rep.stage === 3) { r.done = rep.end || 'away'; H.saveS(); return { text: ENDS[r.done](p.name), end: r.done, name: p.name }; } H.saveS(); return null; }
  function roster(did) { return (P[did] || []).map((p) => ({ name: p.name, role: p.role, met: rec(p.id).st, done: rec(p.id).done })); }
  /* someone you turned around now brings you tips in their district */
  function ally(did) { const g = (P[did] || []).filter((p) => rec(p.id).done === 'good'); return g.length ? g[(Math.random() * g.length) | 0].name : null; }
  /* regulars you've met and not settled yet, for the mystery board */
  function threads() { const out = []; for (const d in P) P[d].forEach((p) => { const r = rec(p.id); if (r.st > 0 && !r.done) out.push({ icon: p.icon, text: p.name + ' · ' + p.role, sub: 'Met ' + r.st + ' of 4 times' + (r.last ? ', last time you ' + (r.last === 'talk' ? 'talked it through' : r.last === 'enforce' ? 'came down hard' : 'watched first') : ''), why: '' }); if (r.done) out.push({ icon: p.icon, text: p.name, sub: r.done === 'good' ? 'Turned it around. Brings you tips.' : r.done === 'hard' ? 'Charged.' : 'Moved out of the district.', closed: 1 }); }); return out; }
  return { threads, call, who, lines, after, roster, ally, P };
}
