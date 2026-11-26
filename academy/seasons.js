// Seasons with a story (Action plan, Step E). The real calendar brings a new story chapter every six weeks or so, each
// with a seasonal event, its own calls and its own arrangement of the music: fog on the causeway in January, spring
// break, graduation night, the long Fourth, back to school, the storm, and the holiday rush. Each chapter has three
// beats: it arrives on your first shift of the season, turns on a choice you make after a few of its calls, and ends at
// its event, where the city remembers how you handled it. Questions come from the facts the season is about (fog and
// low beams, hydroplaning, backing in a packed lot), never more than two in a beat.
// Loop: drive the city -> the season's calls -> a choice -> the finale remembers it -> a title and a mark in your
// record. Reads the calendar and the fact record; feeds the call dispatcher, the score and your career (award, titles).

// [id, from [month, day], name, icon, event id, music track, a character, facts the season teaches, calls, beats]
export const SEASONS = [
  { id: 'fog', from: [1, 1], name: 'Fog on the Causeway', icon: '🌫', ev: 'fogwatch', who: ['bridge', { name: 'Lou Varga', icon: '🔦', role: 'Causeway bridge tender' }], facts: /\bfog\b|six-second|low beams|visibility/i,
    calls: [['Fog on the causeway: cars stopped in the lane', 2, 'any', 'Bridge tender reports cars stopped mid-span in thick fog.', 2], ['Crash in the fog at the bridge approach', 2, 'any', 'Two-car crash in low visibility, no injuries reported.', 3], ['High beams in the fog on Bay Road', 3, 'any', 'Caller says a driver is lighting up the fog with high beams and nobody can see.', 9]],
    beats: [
      [['narr', 'Six in the morning. The fog came in off the bay overnight and sat down on the causeway like it pays rent.'], ['castillo', 'Fog season. Every January somebody drives the causeway at sixty with the high beams on. Don\'t be somebody.'], 'Q', 'Q', ['castillo', 'Low and slow out there. Go.']],
      [['narr', 'The causeway, mid-span. Brake lights ahead come out of nothing and vanish again.'], ['WHO', 'Officer! Three cars just went by me doing fifty. You can\'t see the far rail from my booth.'], 'Q',
        ['pick', [['flares', 'Set flares at the approach and slow them before the bridge', 'castillo', 'Good. Make them come to you slow.'], ['pace', 'Lead the line across from the front, lights on, at thirty', 'WHO', 'They\'ll follow your lights. Keep it slow.']]]],
      [['narr', 'The worst fog of the year. The county closes the causeway at dawn, and you\'re the last car across before the gates come down.'], ['WHO', { flares: 'Your flares at the approach, every morning this month: no pileup on my bridge. First January in four years.', pace: 'Every morning you led them across at thirty. Nobody hit anybody. I\'ve been counting.' }], 'Q', ['castillo', 'That\'s the job in the fog. Nobody notices the crash that didn\'t happen.']]] },
  { id: 'spring', from: [2, 15], name: 'Spring Break', icon: '🏖', ev: 'springbreak', who: ['lifeguard', { name: 'Dana Ruiz', icon: '🏖', role: 'Beach lifeguard captain' }], facts: /pedestrian|crash types|right-angle|following distance|two-second|four-second/i,
    calls: [['Pedestrians crossing mid-block on Beach Boulevard', 3, 'any', 'Shuttle driver reports crowds stepping out between parked cars.', 1], ['Fender bender at the beach light', 3, 'any', 'Right-angle crash at the light. Both drivers are on vacation.', 3], ['Chain-reaction crash on the causeway', 2, 'any', 'Rear-end crashes in stop-and-go beach traffic.', 3]],
    beats: [
      [['narr', 'The causeway to the beach is bumper to bumper with out-of-state plates. Every car has a towel hanging out a window.'], ['PT', 'Spring break. Six weeks of people who don\'t know the roads, don\'t know the crosswalks, and forget that people live here.'], 'Q', 'Q', ['PT', 'Eyes up. They step out from anywhere.']],
      [['narr', 'Beach Boulevard at sunset. A crowd spills off the sidewalk between two parked cars, right in front of the shuttle.'], ['WHO', 'They cross mid-block all day. Somebody\'s going to get hit by that shuttle, and I\'d rather not pull them out of the road.'], 'Q',
        ['pick', [['cross', 'Ask the city for a temporary crosswalk with a guard', 'WHO', 'I\'ll sign anything you need. Get it painted.'], ['foot', 'Walk the block every night and talk to them', 'PT', 'On foot it is. Bring water.']]]],
      [['narr', 'Last weekend of spring break. The beach lot empties out, one car with a towel in the window at a time.'], ['WHO', { cross: 'That crosswalk you asked for? Nobody hit all spring. The shuttle drivers want to buy you lunch.', foot: 'You walked that block every night. By the end they knew your name. Nobody got hit.' }], 'Q', ['PT', 'That\'s spring break. Every one of them went home.']]] },
  { id: 'grad', from: [4, 16], name: 'Graduation Night', icon: '🎓', ev: 'gradnight', who: ['principal', { name: 'Ana Whitfield', icon: '🏫', role: 'Principal, Port Meridian High' }], facts: /safety belt|night crashes|fatigue|stay alert/i,
    calls: [['Teens riding unbuckled after prom', 3, 'any', 'Caller says a car full of kids just left prom and nobody is buckled.', 3], ['Racing on River Road after dark', 2, 'any', 'Residents report cars racing after a graduation party.', 9], ['Driver asleep at the light on Main', 2, 'any', 'Caller says a driver fell asleep at a red light.', 1]],
    beats: [
      [['narr', 'Prom posters in every window on Main Street.'], ['castillo', 'Prom, then graduation. Every May some family gets a knock on the door at two in the morning. Not this year. Not in my district.'], 'Q', 'Q'],
      [['WHO', 'Officer, the seniors are planning a "last ride" after graduation. Forty cars at midnight down River Road. I can\'t stop them.'], 'Q',
        ['pick', [['escort', 'Offer them an escorted cruise, early, in daylight', 'WHO', 'An escort? They\'ll think that\'s the coolest thing that ever happened. Thank you.'], ['talk', 'Talk to the seniors at the assembly yourself', 'WHO', 'Friday, nine o\'clock, the gym. Don\'t be boring.']]]],
      [['narr', 'Graduation night. The stadium lights go off at eleven, and the parking lot empties.'], ['WHO', { escort: 'They took your escort. Forty cars at eight o\'clock, lights on, horns going. They loved it, and every one of them got home.', talk: 'Half of them quoted you on the way out: "Buckle up and don\'t drive tired." Every one of them got home.' }], 'Q', ['castillo', 'Graduation night, and no calls from River Road. Best number I\'ll see all year.']]] },
  { id: 'fourth', from: [6, 1], name: 'The Long Fourth', icon: '🎆', ev: 'july4', who: ['firelt', { name: 'Marcus Bell', icon: '🚒', role: 'Fire lieutenant, Station 2' }], facts: /catalytic|idling over grass|smaller meals|fatigue|siren/i,
    calls: [['Car idling on dry grass at the park', 3, 'any', 'Parks worker says a car has been idling on the grass for an hour.', 0], ['Heat exhaustion at the bus stop', 2, 'any', 'Older man feeling dizzy in the heat.', 1], ['Crowd blocking the fire lane at the river', 2, 'any', 'The fire department needs the river lane cleared before dark.', 10]],
    beats: [
      [['narr', 'Ninety-four degrees at nine in the morning. The asphalt shimmers.'], ['PT', 'Summer. Double shifts, the Fourth, and every grill in the county going at once. Eat something. Drink water. I mean it.'], 'Q', 'Q'],
      [['narr', 'Riverside Park. A fire engine pulls up beside your idling cruiser.'], ['WHO', 'Officer, you\'ve been idling on that grass all afternoon. Grass this dry, a hot converter is how we get a brush fire.'], 'Q',
        ['pick', [['pave', 'Move to the pavement, and get the squad to park there too', 'WHO', 'Appreciate it. That\'s one less fire this summer.'], ['station', 'Post at the fire station lot for the fireworks', 'WHO', 'Then you\'re our traffic. Keep our lane open and we\'ll be fine.']]]],
      [['narr', 'Fourth of July on the river. The first shell goes up and forty thousand people say "ooh" at once.'], ['WHO', { pave: 'Not one grass fire from a parked car this year. Half your squad parks on the pavement now. You started that.', station: 'You at the station lot cleared our lane both times we rolled. We made the dock fire two minutes faster.' }], 'Q', ['PT', 'That\'s the Fourth. Go home and sleep.']]] },
  { id: 'school', from: [8, 1], name: 'Back to School', icon: '🏫', ev: 'backtoschool', who: ['guard', { name: 'Delphine Okoro', icon: '🦺', role: 'Crossing guard, Riverside Elementary' }], facts: /under 18|child restraint|backing|rear visibility/i,
    calls: [['Speeding in the school zone at dismissal', 2, 'any', 'Crossing guard reports cars flying through the zone.', 3], ['Car passed a stopped school bus', 2, 'any', 'Bus driver reports a car passed with the stop arm out.', 3], ['Near miss behind a backing car in the pickup line', 2, 'any', 'Crossing guard saw a car back toward a child in the school lot.', 8]],
    beats: [
      [['narr', 'First week of school. Yellow buses everywhere, and a crossing guard in a vest older than you.'], ['WHO', 'Fourteen years on this corner. Every first week they speed through my zone. Every single year.'], 'Q', 'Q', ['WHO', 'You stand with me tomorrow. They slow down for the car.']],
      [['WHO', 'The pickup line backs up into the street, and parents back out of that lot without looking. The little ones are the height of a bumper.'], 'Q',
        ['pick', [['line', 'Run the pickup line yourself every afternoon for a week', 'WHO', 'Three o\'clock. Bring a whistle.'], ['thru', 'Work with the school on a pull-through so nobody backs out', 'WHO', 'A pull-through? Nobody ever asked. Let\'s draw it.']]]],
      [['narr', 'The last day of the first month of school. The buses pull out, all of them on time.'], ['WHO', { line: 'You stood in that pickup line every afternoon. Not one bumper in the lot. The kids call you "the car line cop."', thru: 'The pull-through works. Nobody backs out of that lot anymore. Nobody.' }], 'Q', ['castillo', 'Back to school, done right. That\'s the whole year set up.']]] },
  { id: 'storm', from: [9, 16], name: 'The Storm', icon: '🌀', ev: 'hurricane', who: ['emgr', { name: 'Gail Dorsey', icon: '🌀', role: 'County emergency manager' }], facts: /\brain\b|hydroplan|deep water|wind|weather/i,
    calls: [['Car stalled in the flood on River Road', 2, 'any', 'A driver went into the standing water and the engine quit.', 2], ['Signal out at Main and 4th', 2, 'any', 'The storm knocked out the light and drivers are taking turns badly.', 3], ['Tree down across both lanes', 3, 'any', 'The wind brought down a live oak across the road.', 2]],
    beats: [
      [['narr', 'The radio says the storm in the Gulf has a name now. The sky over the bay goes the color of a bruise.'], ['WHO', 'Gail Dorsey, county emergency management. If it turns our way, your district evacuates by zone. I need your roads open and your officers on them.'], 'Q', 'Q', ['castillo', 'You heard her. Wipers, tires, a full tank. Go.']],
      [['narr', 'The first bands of rain. River Road has water across both lanes, and a car is idling at the edge of it.'], ['WHO', '(on the radio) We\'re getting calls from people driving through flooded roads to reach the shelter.'], 'Q',
        ['pick', [['close', 'Close River Road and send them the long way on the high road', 'WHO', 'Closing it. I\'ll get the signs out to you.'], ['stage', 'Stage at the water and turn every car around yourself', 'WHO', 'Then you\'re my barricade. Stay out of that water.']]]],
      [['narr', 'Landfall forty miles south. Port Meridian gets the edge of it: wind, sideways rain, the lights out on half of Main Street.'], ['WHO', { close: 'Closing River Road was the right call. Nobody drove into that water. No water rescues in your district.', stage: 'You turned around sixty-one cars at that water. Sixty-one. I counted from the logs.' }], 'Q', ['castillo', 'Storm\'s past. Now we find out who needs us.']]] },
  { id: 'holiday', from: [12, 1], name: 'Holiday Rush', icon: '🎁', ev: 'toydrive', who: ['mallchief', { name: 'Benny Tran', icon: '🛍', role: 'Harbor Mall security chief' }], facts: /backing|fixed object|crash types/i,
    calls: [['Packages stolen from a porch', 3, 'houses', 'A resident\'s delivery was taken off the porch this afternoon.', 1], ['Lost wallet at the holiday market', 3, 'any', 'A shopper lost a wallet near the market stalls.', 1], ['Car backed into a pole at Harbor Mall', 3, 'any', 'Minor crash in the mall lot. The driver says the pole came out of nowhere.', 8]],
    beats: [
      [['narr', 'The Harbor Mall lot is full by ten in the morning. Every row has a car hunting for a space.'], ['castillo', 'Holiday rush. More crashes in parking lots this month than all year, and half of ours are cruisers backing into poles. Don\'t end up on my desk.'], 'Q', 'Q'],
      [['WHO', 'Officer, the porch thieves hit the subdivision again, and my lot is a demolition derby. I can\'t be in two places.'], 'Q',
        ['pick', [['lot', 'Walk the mall lot during the rush', 'WHO', 'Noon to six is the worst of it. I\'ll have coffee.'], ['watch', 'Start a package watch with the residents', 'WHO', 'I\'ll put up the flyer at the mall too.']]]],
      [['narr', 'Christmas Eve. The toy drive trucks roll out of Justice Plaza, one after another.'], ['WHO', { lot: 'Your foot patrol cut our fender benders in half. My guys want you back next year.', watch: 'The package watch caught two porch thieves, and nobody on Bay Street lost a present.' }], 'Q', ['castillo', 'Holiday rush, survived. Go see your family.']]] }
];
// which chapter the real date is in
export function chapterOn(d) { d = d || new Date(); const md = (d.getMonth() + 1) * 100 + d.getDate(); let c = SEASONS[SEASONS.length - 1]; for (const s of SEASONS) if (md >= s.from[0] * 100 + s.from[1]) c = s; return c; }
const NEED = [0, 4, 8]; // season calls before each beat

export function installSeasons(H) {
  const S = H.S, L = H.L;
  const now = () => chapterOn(H.date ? H.date() : new Date());
  const rec = (c) => { S.sea = S.sea || {}; const k = c.id + (new Date().getFullYear()); return S.sea[k] || (S.sea[k] = { beat: 0, calls: 0, pick: null, last: 0 }); };
  // the season's calls come in among the regular ones (more often before its finale)
  function call() { const c = now(), r = rec(c); if (Math.random() > (r.beat < 3 ? .22 : .12)) return null; const t = c.calls[(Math.random() * c.calls.length) | 0], o = t.slice(0, 4); o.les0 = t[4]; o.season = c.id; return o; }
  function afterCall(cl) { if (!cl || !cl.season) return; const c = now(); if (cl.season !== c.id) return; const r = rec(c); r.calls++; H.saveS(); }
  // a question from what the season is about: one you haven't learned first
  function qFor(c, used) { const fs = S.facts || {}, all = L.allFacts().filter((f) => c.facts.test(f.text) && used.indexOf(f.id) < 0); if (!all.length) return null; all.sort((a, b) => (fs[a.id] ? 1 : 0) - (fs[b.id] ? 1 : 0) || Math.random() - .5); const f = all[0]; used.push(f.id); return L.factQ(f.id); }
  function lines(c, i) { const r = rec(c), who = H.sayAs(c.who[0], c.who[1]), pt = H.partner(), PT = pt ? pt.id : 'castillo', used = [], out = []; let asker = who; // whoever spoke last asks
    for (const b of c.beats[i]) {
      if (b === 'Q') { const q = qFor(c, used); if (q) out.push(['q', q, asker]); continue; }
      if (b[0] === 'pick') { out.push(['choice', b[1].map(([k, t, sp, rep]) => ({ t, reply: [[sp === 'WHO' ? who : sp === 'PT' ? PT : sp, rep]], fx: () => { r.pick = k; H.saveS(); } }))]); continue; }
      const sp = b[0] === 'WHO' ? who : b[0] === 'PT' ? PT : b[0], tx = typeof b[1] === 'object' ? b[1][r.pick] || b[1][Object.keys(b[1])[0]] : b[1]; out.push([sp, tx]); if (sp !== 'narr') asker = sp; }
    return out; }
  // the beats: the first shift of the season (once you've cleared a call), then after its calls; never in the middle of anything
  function tick(force) { const c = now(), r = rec(c); if (r.beat >= 3 || !H.free() || (!force && (H.shiftCalls() < 1 || H.onStreetFor() < 30000 || Date.now() - (r.last || 0) < 4 * 60000 || r.calls < NEED[r.beat]))) return false;
    const i = r.beat, ls = lines(c, i); r.beat++; r.last = Date.now(); H.saveS(); if (H.music && H.music.feature) H.music.feature('story', 'season_' + c.id);
    H.dialogue(ls, () => { H.stat('seasonBeat'); if (i === 2) finale(c, r); }, { kicker: c.icon + ' ' + c.name.toUpperCase() + ' · ' + ['IT BEGINS', 'A CHOICE', 'HOW IT ENDED'][i] }); return c.id + ':' + i; }
  function finale(c, r) { S.titles = S.titles || {}; const t = c.name + ' Veteran'; S.titles[t] = 1; H.stat('seasonCh'); H.award(150, c.name); H.banner(c.icon, c.name + ': chapter closed', 'Title earned: ' + t + '. The city remembers how you handled it.'); H.saveS(); }
  // for the journal: where you are in this season's story
  function status() { const c = now(), r = rec(c); return { id: c.id, name: c.name, icon: c.icon, beat: r.beat, calls: r.calls, next: r.beat < 3 ? NEED[r.beat] : null, pick: r.pick, track: 'season_' + c.id }; }
  const due = () => { const r = rec(now()); return r.beat < 3 && r.calls >= NEED[r.beat]; }; // has the season's next part earned its place?
  return { tick, call, afterCall, status, lines, due, get id() { return now().id; } };
}
