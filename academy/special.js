// Special shifts. Every so often a shift is a night that changes the rules: a hurricane, a street festival, a
// citywide blackout, or the graduation parade for the class ahead of yours. Dispatch holds the usual calls, the city
// behaves differently (storm weather and slow driving, a crowd you can only creep through, streetlights and signals
// dead, escort pace), and your shift orders become three authored stops. Each stop is one decision; the right one
// is the one policy and the chapter back. The night ends with a staged debrief.
const SPECIAL = {
  hurricane: {
    name: 'Hurricane Iris', icon: '🌀', kick: 'HURRICANE IRIS', speed: .78,
    brief: [['castillo', 'Iris came ashore south of us at four. Sixty-mile-an-hour gusts, water over the low roads, power going in and out.'], ['castillo', 'Dispatch is holding everything that isn\'t storm related. You\'ve got three stops. Slow down, leave room, and do not drive into water you can\'t see the bottom of.']],
    radio: 'All units, Hurricane Iris conditions. Holding routine calls. Storm calls only until further notice.',
    stops: [
      { title: 'Water over the road', icon: '🌊', at: 'the low road by', scene: [['narr', 'Brown water across both lanes, a stalled hatchback in the middle of it. A pickup behind it is inching forward.'], ['narr', 'The pickup driver rolls his window down. "I\'ve got a lift kit. I can go around her, right?"']],
        ask: 'The pickup driver is waiting on you.', opts: [
          ['Turn him around and block the road with your car', 1, [['narr', 'He grumbles and backs out. You park across the lane with your lights on and radio the stalled car\'s location for the fire department\'s water rescue.']]],
          ['Lead him around her slowly down the crown of the road', 0, [['castillo', 'You can\'t see the road under that water. It could be washed out. Turn him around and block it.']]],
          ['Let him go around her, since his truck sits higher', 0, [['castillo', 'A lifted truck floats the same as anything else in moving water. Turn him around and block it.']]]] },
      { title: 'Line down on a car', icon: '⚡', at: 'the street outside', scene: [['narr', 'A power line is draped across the hood of a sedan. A woman is in the driver\'s seat, reaching for the door handle.']],
        ask: 'She\'s about to open the door.', opts: [
          ['Tell her to stay put inside the car until the utility arrives', 1, [['narr', 'You keep well back and talk her through it. The utility truck cuts power twenty minutes later and she steps out shaking but fine.']]],
          ['Tell her to open the door and jump clear with both feet', 0, [['castillo', 'Only if the car is on fire. Otherwise she stays inside until the line is dead. The car is the safest place she has.']]],
          ['Move the line off the hood with a dry branch from the yard', 0, [['castillo', 'Never touch a downed line with anything. Keep back, keep her inside, and wait for the utility.']]]] },
      { title: 'Oxygen and no power', icon: '👵', at: 'a house near', scene: [['narr', 'A neighbor flagged you down. Mr. Hale, eighty-one, lives alone and uses home oxygen. His power has been out for three hours.'], ['narr', 'His backup tank gauge is near the red.']],
        ask: 'Mr. Hale is watching you.', opts: [
          ['Get him to the shelter with his tank, meds and charger', 1, [['narr', 'You call it in, help him pack his medications and a bag, and take him to the special-needs shelter at the high school. They have power and oxygen.']]],
          ['Leave him your cell number and check back after the storm', 0, [['castillo', 'His tank won\'t last until after the storm. Get him to the special-needs shelter now.']]],
          ['Tell the neighbor to look in on him every couple of hours', 0, [['castillo', 'The neighbor can\'t refill his oxygen. Get him to the special-needs shelter now.']]]] }
    ],
    end: (r) => ({ title: 'Iris moves north', text: r === 3 ? 'By morning the wind has dropped. Nobody drowned in your district, the woman in the sedan sends a thank-you to the station, and Mr. Hale is eating cereal at the shelter.' : 'By morning the wind has dropped. You made it through the night. Castillo goes over the stops with you before you go home.' })
  },
  festival: {
    name: 'Street Festival', icon: '🎉', kick: 'STREET FESTIVAL', crowd: 24, crawl: .38,
    brief: [['castillo', 'Festival day. Twenty thousand people, food trucks, a stage, and every street around the plaza closed to traffic.'], ['castillo', 'Near the crowd you drive at walking pace, if you drive at all. Dispatch is routing routine calls to the next sector. Three things need you.']],
    radio: 'All units, festival detail. Streets around the event are closed. Routine calls go to the adjacent sector.',
    stops: [
      { title: 'Lost child', icon: '🧒', at: 'the crowd at', scene: [['narr', 'A girl, maybe five, in a yellow festival shirt, crying by a lemonade stand. She says her name is Maya and her dad has a red hat.']],
        ask: 'Maya is holding your sleeve.', opts: [
          ['Stay with her and radio out her and her dad\'s description', 1, [['narr', 'You keep her at the stand where her dad last saw her and put it out on the radio. A man in a red hat comes running four minutes later.']]],
          ['Walk her through the crowd so she can look for him', 0, [['castillo', 'Moving her makes it harder for him to find her. Stay where she was lost and put it out on the radio.']]],
          ['Hand her to a vendor and go look for the man in red', 0, [['castillo', 'You don\'t hand a lost child to a stranger. Stay with her and put it out on the radio.']]]] },
      { title: 'Car in the fire lane', icon: '🚒', at: 'the fire lane beside', scene: [['narr', 'A sedan is parked across the marked fire lane, the only way an ambulance can get to the stage. No driver in sight.']],
        ask: 'The fire lane is blocked.', opts: [
          ['Call for a tow and keep the lane open until it\'s gone', 1, [['narr', 'The tow truck creeps in behind you with its lights on. Ten minutes later the lane is clear. The owner can find his car at the impound lot.']]],
          ['Leave a warning on the windshield and keep walking', 0, [['castillo', 'A warning doesn\'t move the car. That lane has to be open now. Get it towed.']]],
          ['Wait by the car until the driver comes back for it', 0, [['castillo', 'He could be gone for hours. That lane has to be open now. Get it towed.']]]] },
      { title: 'Ambulance in the crowd', icon: '🚑', at: 'the street by', scene: [['narr', 'A man collapsed near the stage. The ambulance is stuck at the barricade and the crowd doesn\'t hear the siren over the music.'], ['narr', 'Medic 4 asks you to lead them in.']],
        ask: 'Medic 4 is waiting.', opts: [
          ['Lead them in slowly, lights on, clearing people with the PA', 1, [['narr', 'You go in ahead at a walking pace, lights on, talking on the PA. The crowd parts. Medic 4 reaches him in two minutes.']]],
          ['Lead them in quickly, with your siren on the whole way', 0, [['castillo', 'Lights and siren don\'t move a crowd that can\'t hear you, and speed in a crowd gets someone hurt. Walking pace, lights, the PA.']]],
          ['Go around the long way, so the crowd isn\'t disturbed', 0, [['castillo', 'The long way costs him minutes he doesn\'t have. Go in slowly with lights on and use the PA.']]]] }
    ],
    end: (r) => ({ title: 'The last song', text: r === 3 ? 'The stage goes dark at eleven. Maya fell asleep on her dad\'s shoulder, the fire lane stayed open all night, and the man by the stage is stable at the hospital.' : 'The stage goes dark at eleven and the crowd drifts home. Castillo goes over the stops with you before you go.' })
  },
  blackout: {
    name: 'Citywide blackout', icon: '🔦', kick: 'BLACKOUT', night: true, dark: true, speed: .85,
    brief: [['castillo', 'A substation fire took the whole grid down at nine. No streetlights, no signals, no alarms that aren\'t on batteries.'], ['castillo', 'Every dark signal is a four-way stop, and half the drivers out there forgot that. Use your headlights, go slow at every intersection. Three stops.']],
    radio: 'All units, citywide power failure. Signals are dark. Treat every signal as a four-way stop. Holding routine calls.',
    stops: [
      { title: 'Dark intersection', icon: '🚦', at: 'the intersection by', scene: [['narr', 'The signal is dead. Two near-misses while you watch. A driver going straight just blew through like he had a green.']],
        ask: 'Cars are backing up on all four sides.', opts: [
          ['Park safely, light it up, and direct traffic by hand', 1, [['narr', 'You park out of the lanes with your lights on, put on your vest and take the intersection. Everyone gets their turn, one direction at a time.']]],
          ['Sit in the middle of it with lights and siren running', 0, [['castillo', 'A car parked in the intersection is one more thing to hit. Park out of the lanes and direct traffic by hand.']]],
          ['Chase and stop the driver who ran through it', 0, [['castillo', 'While you chase one driver, the next four crash. Park out of the lanes and direct traffic by hand.']]]] },
      { title: 'Alarm on battery', icon: '🔔', at: 'the storefront at', scene: [['narr', 'A store alarm is screaming on its backup battery. The front door is closed. You can\'t see inside without power.']],
        ask: 'The alarm keeps going.', opts: [
          ['Wait for backup, then check every door with your light', 1, [['narr', 'Your backup pulls up in two minutes. You walk the outside together with flashlights. The back door is locked. A power surge tripped it.']]],
          ['Go straight in alone with your light, before anyone leaves', 0, [['castillo', 'Alone, in the dark, into a building you can\'t see? Wait for backup and check the outside first.']]],
          ['Clear it from the car over the radio as a power surge', 0, [['castillo', 'It probably is a surge. You still check it. Wait for backup and walk the outside with your light.']]]] },
      { title: 'Headlights out', icon: '🔦', at: 'the road past', scene: [['narr', 'A car comes toward you on the unlit road with no headlights on. The driver is looking for street numbers in the dark.']],
        ask: 'The car is coming closer.', opts: [
          ['Stop her and have her turn her headlights on', 1, [['narr', 'You stop her and point at her dash. "Oh my God. I thought the streetlights were enough. There aren\'t any." She turns them on and thanks you twice.']]],
          ['Flash your high beams at her and keep on driving', 0, [['castillo', 'She might not know what that means. Stop her and get her headlights on before she hits someone.']]],
          ['Follow her until she finds the house she wants', 0, [['castillo', 'Following her in the dark doesn\'t light her up. Stop her and get her headlights on.']]]] }
    ],
    end: (r) => ({ title: 'The lights come back', text: r === 3 ? 'At 3:40 a.m. the grid hums back on, block by block. The signals blink red, then go to green. Not one crash at your intersection all night.' : 'At 3:40 a.m. the grid hums back on, block by block. Castillo goes over the stops with you before the shift ends.' })
  },
  parade: {
    name: 'Graduation parade', icon: '🎓', kick: 'GRADUATION PARADE', day: true, speed: .5,
    brief: [['castillo', 'Class 26-03 graduates today. The ones a few months ahead of you. Tradition says they march from the academy to the courthouse steps, and patrol leads them.'], ['castillo', 'Escort pace all shift. Lights on, no siren, keep your spacing. Three stops along the route.']],
    radio: 'All units, graduation escort in progress. Routine calls are holding until the class reaches the courthouse.',
    stops: [
      { title: 'Line up the escort', icon: '🎺', at: 'the start at', scene: [['narr', 'Three patrol cars, a band and forty recruits in dress uniform. Castillo points at the lead spot.'], ['castillo', 'You\'re in front. How do you run it?']],
        ask: 'Castillo is waiting.', opts: [
          ['Lights on, no siren, slow and steady with a gap to the band', 1, [['castillo', 'That\'s it. They walk, we roll. Steady. Never so close that they have to stop short.']]],
          ['Lights and siren on, so everyone knows a parade is coming', 0, [['castillo', 'A siren tells drivers to pull over for an emergency. This isn\'t one. Lights only, slow and steady.']]],
          ['No lights at all, so it feels like an ordinary parade', 0, [['castillo', 'Lights let drivers see the escort from a block away. Lights on, no siren, slow and steady.']]]] },
      { title: 'Hold the intersection', icon: '🚧', at: 'the intersection by', scene: [['narr', 'The route crosses a busy street. A delivery van rolls up to the edge and starts to nose between the band and the recruits.']],
        ask: 'The van is creeping forward.', opts: [
          ['Pull your car across his lane and wave him to a full stop', 1, [['narr', 'He stops. You hold the lane until the last recruit has crossed, then wave him through with a nod. He nods back.']]],
          ['Hit the siren and the air horn so he backs up right away', 0, [['castillo', 'Blasting him with a siren next to a marching band panics everyone. Block his lane and wave him to a stop.']]],
          ['Let him through quickly so traffic keeps moving behind him', 0, [['castillo', 'Never let a vehicle split a procession. Block his lane and wave him to a stop.']]]] },
      { title: 'The courthouse steps', icon: '🎓', at: 'the steps near', scene: [['narr', 'The class halts at the steps. The band stops. The chief reads forty names, and forty new officers say "Here."'], ['castillo', 'That\'s you in a few months. Look at their faces. Remember what it took to get here.'],
        ['narr', 'One of the graduates, Officer Diaz, comes over and shakes your hand. "You led us in. Thanks. You\'re next."']],
        ask: 'Diaz is still shaking your hand.', opts: [
          ['"Congratulations. Stay safe out there."', 1, [['narr', 'She grins. "That\'s the whole job, isn\'t it?"']]],
          ['"Save me a spot on day shift."', 1, [['narr', 'She laughs. "Nobody gets day shift. See you on midnights."']]]] }
    ],
    end: (r) => ({ title: 'Class 26-03', text: 'Forty new officers throw their caps on the courthouse steps. Castillo doesn\'t say anything for a while. Then: "Your turn\'s coming. Drive like it."' + (r < 3 ? ' On the way back she goes over the escort with you.' : '') })
  }
};
const ORDER = ['hurricane', 'festival', 'blackout', 'parade'];

export function installSpecial(H) {
  const st = () => (H.S.spec = H.S.spec || { seen: {}, done: {}, cur: null });
  let cur = null, lastStop = 0;
  // which shift (if any) is special: the fourth shift and every fifth after it, each special once before any repeats
  function pick(shiftNo, night) {
    const s = st(), ok = (k) => !(SPECIAL[k].night && !night) && !(SPECIAL[k].day && night);
    if (H.force) { const f = H.force(); if (f && SPECIAL[f]) return f; }
    if (shiftNo < 4 || shiftNo % 5 !== 4) return null;
    const fresh = ORDER.filter((k) => !s.seen[k] && ok(k)); if (fresh.length) return fresh[0];
    const any = ORDER.filter(ok); return Math.random() < .4 && any.length ? any[(Math.random() * any.length) | 0] : null;
  }
  function onShift() {
    const s = st(), no = H.shiftNo(), night = H.night();
    if (s.cur && s.cur.no === no && s.cur.did === H.did() && SPECIAL[s.cur.id]) cur = s.cur; // a reload mid-shift picks up where it was
    else { cur = null; s.cur = null; const k = H.tutorial() ? null : pick(no, night); if (k) start(k, no); }
    apply(); H.saveS();
  }
  function start(k, no) {
    const s = st(), sp = SPECIAL[k], spots = H.places(3, sp.crowd ? 'hub' : 'spread');
    if (spots.length < 3) return;
    cur = s.cur = { id: k, no, did: H.did(), stops: spots.map((p, i) => ({ i, name: p.name, x: p.x, y: p.y, done: false })), right: 0, hub: spots.hub || null };
    setTimeout(() => { if (!cur) return; H.radio('Dispatch', sp.radio); H.banner(sp.icon, sp.name, 'A special shift. Routine calls are on hold.'); setTimeout(() => H.whenFree(() => { const talk = (said) => { const b = said ? sp.brief.slice(1) : sp.brief; if (b.length) H.dialogue(b, null, { kicker: 'SPECIAL SHIFT · ' + sp.kick }); }; if (H.scene) H.scene(k, sp, talk); else talk(false); }), 2600); /* the night opens on a scene (storycine.js), then the brief */ }, 3200);
  }
  // the rules for the night
  function apply() {
    const sp = active() && SPECIAL[cur.id]; H.lamps(!!(sp && sp.dark)); H.setOrders(cur ? cur.stops.map((o) => ({ id: 'sp' + o.i, text: SPECIAL[cur.id].stops[o.i].title + ' · ' + o.name, need: 1, have: o.done ? 1 : 0, done: o.done })) : null);
    if (!sp) return;
    if (cur.id === 'hurricane') H.storm();
    if (sp.crowd && cur.hub) H.crowd(cur.hub.x, cur.hub.y, sp.crowd);
  }
  const active = () => !!(cur && cur.stops.some((o) => !o.done));
  // routine calls wait while there are stops left
  const holdCalls = () => active();
  // speed: storm and blackout slow you a little everywhere, the parade holds escort pace, the festival crowd is a crawl
  function speedMul(x, y, inCar) {
    if (!active() || !inCar) return 1; const sp = SPECIAL[cur.id]; let m = sp.speed || 1;
    if (sp.crawl && cur.hub && Math.hypot(cur.hub.x - x, cur.hub.y - y) < 8) m = Math.min(m, sp.crawl);
    return m;
  }
  const dark = () => !!(active() && SPECIAL[cur.id].dark);
  // a stop plays when you reach it and the street is free
  function tick(dt, x, y) {
    if (!active() || !H.free()) return; const now = performance.now(); if (now - lastStop < 1500) return;
    const o = cur.stops.find((q) => !q.done && Math.hypot(q.x - x, q.y - y) < 1.6); if (!o) return;
    lastStop = now + 1e9; play(o);
  }
  function play(o) {
    const sp = SPECIAL[cur.id], S0 = sp.stops[o.i]; let right = 0;
    const opts = S0.opts.map(([t, ok, reply]) => ({ t, fx: () => { right = ok; }, reply })).sort(() => Math.random() - .5); // the right call isn't always first
    const lines = S0.scene.concat([['choice', opts, S0.ask]]);
    H.dialogue(lines, (r) => {
      lastStop = performance.now();
      o.done = true; cur.right += right ? 1 : 0; H.ord('sp' + o.i); H.award(right ? 60 : 20, sp.name.toLowerCase());
      H.saveS(); if (!active()) { H.lamps(false); setTimeout(finish, 900); }
    }, { kicker: 'SPECIAL SHIFT · ' + S0.title.toUpperCase(), onLeave: () => { lastStop = performance.now() + 8000; H.leave(); } }); // walking away leaves the stop open
  }
  function finish() {
    const s = st(), sp = SPECIAL[cur.id], r = cur.right, e = sp.end(r); s.done[cur.id] = Math.max(s.done[cur.id] || 0, r); s.seen[cur.id] = (s.seen[cur.id] || 0) + 1;
    H.award(120 + r * 30, 'special shift'); H.radio('Dispatch', 'All units, resuming normal dispatch.'); H.saveS();
    H.twist({ title: e.title, text: e.text + ' (' + r + ' of 3 stops handled right.)' });
    s.cur = cur; // kept so a reload this shift doesn't start it again
  }
  // the stop markers
  function draw(now) {
    if (!active()) return;
    for (const o of cur.stops) { if (o.done) continue; const [sx, sy] = H.iso(o.x, o.y); H.ring(sx, sy, '#38bdf8', now); H.bubble(sx, sy - 40, SPECIAL[cur.id].stops[o.i].icon, '#38bdf8', now);
      if (Math.hypot(o.x - H.px(), o.y - H.py()) < 9) H.label(sx, sy - 66, SPECIAL[cur.id].stops[o.i].title, '#ffffff'); }
  }
  // the next stop, for the minimap and the guide arrow
  const next = (x, y) => active() ? cur.stops.filter((o) => !o.done).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0] : null;
  return { onShift, holdCalls, speedMul, dark, tick, draw, next, active, SPECIAL, get cur() { return cur; }, start: (k) => { start(k, H.shiftNo()); apply(); H.saveS(); } };
}
