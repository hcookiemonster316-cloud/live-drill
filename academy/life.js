// Life in Port Meridian: everything a cadet can choose to do besides answering dispatch.
// Batch A: self-initiated activity (plate runs, streetlights, vacation house checks, lost kids), traffic stops,
// and taking care of your own patrol car (fuel, washes, tune-ups, decals). Uses the game's own systems through H.
export function installLife(H) {
  const S = H.S; S.car = Object.assign({ fuel: 1, dirt: 0, wear: 0, decal: null, decals: [] }, S.car || {}); if (S.cash == null) S.cash = 150;
  const rnd = (a) => a[Math.floor(Math.random() * a.length)], dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  let acts = [], stopT = 25, viol = null, warned = {};
  const money = (n) => '$' + Math.round(n);
  function pay(n, what) { if (S.cash < n) { H.toast('Not enough cash for ' + what + ' (' + money(n) + '). You earn pay with every RP.'); H.bad(); return false; } S.cash -= n; H.saveS(); H.hud(); H.beep(1175, .08, 'triangle', .04); return true; }

  // ---------- self-initiated activity: set up when a district loads ----------
  function setup() {
    acts = []; viol = null; stopT = 20 + Math.random() * 20; const W = H.W; if (!W || H.inside) return;
    // plates: parked cars you can run
    const cars = W.props.filter((p) => p.t === 'car' && p.parked && !p.police); for (let i = 0; i < 8 && cars.length; i++) { const c = cars.splice(Math.floor(Math.random() * cars.length), 1)[0], r = Math.random();
      acts.push({ kind: 'plate', x: c.x, y: c.y, icon: '🔍', col: '#64748b', label: 'Run this plate', st: r < .62 ? 'clear' : r < .84 ? 'expired' : r < .93 ? 'stolen' : 'abandoned', car: c, r: 7 }); }
    // houses on vacation watch
    W.lots.filter((l) => l.kind === 'houses').sort(() => Math.random() - .5).slice(0, 3).forEach((l) => { const [dx, dy] = H.doorSpot(l); acts.push({ kind: 'house', x: dx, y: dy + .6, icon: '🏠', col: '#16a34a', label: 'Vacation house check: ' + (l.name || 'a home'), lot: l, open: Math.random() < .35, r: 9 }); });
    // a lost child near a busy spot, sometimes
    const busy = W.lots.filter((l) => /park|plaza|stadium|mall|transit|marina/.test(l.kind)); if (busy.length && Math.random() < .6) { const l = rnd(busy), [dx, dy] = H.doorSpot(l); acts.push({ kind: 'kid', x: dx + .6, y: dy + 1, icon: '🧒', col: '#f59e0b', label: 'A child looks lost', where: l.name || 'the park', r: 10, person: true }); }
    // car services by business
    W.lots.forEach((l) => { const svc = { gas: ['fuel', '⛽'], carwash: ['wash', '🧽'], autoshop: ['tune', '🔧'] }[l.kind]; if (!svc) return; const [dx, dy] = H.doorSpot(l); acts.push({ kind: svc[0], x: dx, y: dy + 1.2, icon: svc[1], col: '#0ea5e9', label: l.name || svc[0], lot: l, r: 6, carOnly: true, keep: true }); });
    W.lots.filter((l) => l.kind === 'hq' || l.kind === 'substation').forEach((l) => { const [dx, dy] = H.doorSpot(l); acts.push({ kind: 'pool', x: dx + 3.2, y: dy + 1.4, icon: '🚔', col: '#1e40af', label: 'Motor pool: choose your ride', r: 8 }); });
    nightLamps();
  }
  function nightLamps() { // at night a few streetlights are out: report them
    acts = acts.filter((a) => a.kind !== 'lamp'); const W = H.W; if (!W || !H.NIGHT()) return;
    const lamps = W.props.filter((p) => p.t === 'lamp' && p.on); for (let i = 0; i < 4 && lamps.length; i++) { const p = lamps.splice(Math.floor(Math.random() * lamps.length), 1)[0]; p.on = false; p.broken = true; acts.push({ kind: 'lamp', x: p.x, y: p.y + .4, icon: '💡', col: '#eab308', label: 'Streetlight out', lamp: p, r: 8 }); }
  }
  const showable = (a) => { const P = H.P; if (H.inside) return false; if (a.carOnly) { const c = P.inCar ? P : H.pcar; return !!c && Math.hypot(c.x - a.x, c.y - a.y) < 7; } return Math.hypot(P.x - a.x, P.y - a.y) < a.r; };
  const fact = (les) => H.L.pickFacts(S, les, 1)[0];
  const done = (a, rp, why) => { acts = acts.filter((x) => x !== a); H.award(rp, why); H.stat('self'); H.stat('self_' + a.kind); H.ord && H.ord('self'); };
  function run(a) {
    const id = (k, o) => H.sayAs(k, o), V = H.dialogue, focus = { focus: [a.x, a.y], kicker: 'SELF-INITIATED · ' + a.label.toUpperCase() };
    if (a.kind === 'plate') {
      const plate = a.plate || (a.plate = 'ABCDEFGHJKLMNPRSTUVWXYZ'[Math.floor(Math.random() * 23)] + 'ABCDEFGHJKLMNPRSTUVWXYZ'[Math.floor(Math.random() * 23)] + 'X ' + Math.floor(1000 + Math.random() * 9000));
      const res = { clear: 'Comes back clear. Valid registration, no wants.', expired: 'Registration expired four months ago.', stolen: 'Hold on. That tag comes back reported stolen out of the county yesterday.', abandoned: 'Registered owner reported it broken down three weeks ago. It\'s been sitting.' }[a.st];
      const after = { clear: [['narr', 'Nothing to it. Good habit, though: plates tell stories.']],
        expired: [['choice', [{ t: 'Leave a courtesy notice on the windshield', set: 'courtesy', reply: [['narr', 'You tuck a notice under the wiper. Most people fix it within the week.']] }, { t: 'Note it and move on', reply: [['narr', 'Logged. Not every finding needs a confrontation.']] }]]],
        stolen: [['choice', [{ t: 'Don\'t touch it. Hold the scene and request a tow and a detective', set: 'stolenHold', trust: 1, reply: [['velvet', '(over the radio) Copy. Tow\'s en route. The owner is going to be very happy.']] }, { t: 'Look inside for clues', trust: -1, reply: [['velvet', '(over the radio) Careful, cadet. Fingerprints are evidence. Let the detectives work it.']] }]]],
        abandoned: [['choice', [{ t: 'Tag it for the abandoned vehicle process', reply: [['narr', 'You put an orange tag on it. The city will notify the owner.']] }, { t: 'Find the owner and offer a hand', trust: 1, reply: [['narr', 'The owner lives two blocks over. She cries a little. Big Earl tows it for free.']] }]]] }[a.st];
      V([['narr', 'You read the plate over the radio: ' + plate + '.'], ['velvet', '(over the radio) Running it… ' + res]].concat(after).concat([['velvet', '(over the radio) Quick check while I have you:'], ['q', fact([3, 2]), 'velvet']]), () => done(a, a.st === 'stolen' ? 80 : 30, 'ran a plate'), focus);
    } else if (a.kind === 'lamp') {
      V([['narr', 'The streetlight is dark. The whole corner is in shadow.'], ['choice', [{ t: 'Report it to public works through dispatch', reply: [['velvet', '(over the radio) Logged with public works. Dark corners invite trouble. Nice catch.']], fx: () => { a.lamp.broken = false; a.lamp.on = true; } }, { t: 'Note it and patrol that corner more often tonight', reply: [['narr', 'You make a mental note. You\'ll swing by again.']] }]], ['castillo', '(over the radio) While you\'re thinking about it:'], ['q', fact([0, 1]), 'castillo']], () => done(a, 25, 'streetlight report'), focus);
    } else if (a.kind === 'house') {
      const nb = id('neighbor', { name: 'Next-door neighbor', icon: '🏡', role: a.lot.name || 'Vacation watch' });
      V([['narr', 'Vacation watch. The owners are away for two weeks.'], ['choice', [{ t: 'Walk the perimeter: doors, windows, the back gate', reply: a.open ? [['narr', 'The side gate is open and swinging. No sign of entry anywhere else.'], ['choice', [{ t: 'Secure the gate and leave a note for the owners', set: 'gateSecured', reply: [[nb, 'Oh, the wind does that. Thank you for checking, officer.']] }, { t: 'Clear the backyard carefully before securing it', set: 'gateCleared', reply: [['narr', 'You clear the yard slowly. Nothing. You latch the gate.'], [nb, 'Thank you for being careful. They\'ll be glad you came by.']] }]]] : [['narr', 'Everything\'s locked. Mail is piling up a little.'], [nb, 'I\'ll grab their mail. Thanks for keeping an eye out.']] }, { t: 'Drive past slowly and keep going', reply: [['narr', 'A drive-by is better than nothing. A walk-around would have been better.']] }]], [nb, 'Can I ask you something, officer?'], ['q', fact([9, 0]), nb]], () => done(a, a.open ? 50 : 35, 'house check'), focus);
    } else if (a.kind === 'kid') {
      const kid = id('lostkid', { name: 'Lost child', icon: '🧒', role: a.where }), mom = id('lostmom', { name: 'Worried parent', icon: '🙋', role: a.where });
      V([['narr', 'A little boy is standing alone, trying very hard not to cry.'], ['choice', [{ t: 'Kneel down to his level and say hello', trust: 1, reply: [[kid, 'I can\'t find my mom. She has a red shirt. And a stroller.']] }, { t: 'Ask him for his name and address', reply: [[kid, '…Leo. I don\'t know my address.']] }]], ['choice', [{ t: 'Radio a description and stay right here with him', set: 'kidStay', reply: [['velvet', '(over the radio) Broadcasting it now. Stay put, that\'s the right call.']] }, { t: 'Walk him around looking for her', reply: [['castillo', '(over the radio) She\'s probably looking for him too. Better to stay put and let her find you.']] }]], ['narr', 'A minute later a woman in a red shirt comes running.'], [mom, 'LEO! Oh, thank you. Thank you so much.'], [mom, 'Can I ask you something while I catch my breath?'], ['q', fact([8, 4]), mom]], () => done(a, 60, 'reunited a family'), focus);
    } else if (a.kind === 'fuel') {
      const need = Math.ceil((1 - S.car.fuel) * 45); if (need < 2) { H.toast('Tank is already full.'); return; }
      if (pay(need, 'a fill-up')) { S.car.fuel = 1; H.toast('⛽ Filled up for ' + money(need) + '. Full tank.'); H.stat('fuel'); }
    } else if (a.kind === 'wash') { if (S.car.dirt < .08) { H.toast('Your car is already spotless.'); return; } if (pay(12, 'a car wash')) { S.car.dirt = 0; H.toast('🧽 Spotless. A clean cruiser earns a little more respect (+5% RP).'); H.stat('wash'); } }
    else if (a.kind === 'tune') shop(a);
    else if (a.kind === 'pool') H.motorPool();
  }
  // Big Earl's (or any auto shop): tune-up and decals
  const DECALS = [['gold', '#f5b800', 'Academy Gold'], ['blue', '#2563eb', 'Thin Blue'], ['red', '#dc2626', 'Fire Red'], ['green', '#16a34a', 'Gator Green'], ['silver', '#cbd5e1', 'Chrome'], ['purple', '#9333ea', 'Justice Purple'], ['orange', '#f97316', 'Industrial Orange']];
  function shop(a) {
    const draw = () => H.openModal('<div class="sceneHead"><b>' + H.esc(a.label.toUpperCase()) + '</b><h2>Patrol car service</h2><p>Cash: ' + money(S.cash) + '</p></div>' +
      '<div class="carStats">' + bar('⛽ Fuel', S.car.fuel) + bar('🧽 Clean', 1 - S.car.dirt) + bar('🔧 Condition', 1 - S.car.wear) + '</div>' +
      '<div class="qAct"><button type="button" id="cTune"' + (S.car.wear < .05 ? ' disabled' : '') + '>Tune-up · ' + money(30) + '</button></div>' +
      '<div class="jSec"><b>Decals (cosmetic)</b></div><div class="decals">' + DECALS.map(([id, c, n]) => { const own = S.car.decals.indexOf(id) >= 0, on = S.car.decal === id; return '<button type="button" data-dc="' + id + '" class="' + (on ? 'on' : '') + '"><i style="background:' + c + '"></i>' + n + '<small>' + (on ? 'On your car' : own ? 'Owned · apply' : money(50)) + '</small></button>'; }).join('') + '<button type="button" data-dc="none" class="' + (!S.car.decal ? 'on' : '') + '"><i></i>No stripe<small>Factory</small></button></div>' +
      '<div class="qAct"><button type="button" class="ghost" id="mClose">Done</button></div>');
    const bar = (n, v) => '<div class="cStat"><span>' + n + '</span><div><i style="width:' + Math.round(Math.max(0, Math.min(1, v)) * 100) + '%;background:' + (v < .25 ? '#ef4444' : v < .5 ? '#f59e0b' : '#22c55e') + '"></i></div><b>' + Math.round(v * 100) + '%</b></div>';
    draw(); const wire = () => { H.$('mClose').onclick = H.closeModal; const t = H.$('cTune'); if (t) t.onclick = () => { if (pay(30, 'a tune-up')) { S.car.wear = 0; H.stat('tune'); H.toast('🔧 Tuned up. She runs like new.'); draw(); wire(); } };
      document.querySelectorAll('[data-dc]').forEach((b) => b.onclick = () => { const id = b.dataset.dc; if (id === 'none') S.car.decal = null; else if (S.car.decals.indexOf(id) >= 0) S.car.decal = id; else if (pay(50, 'a decal')) { S.car.decals.push(id); S.car.decal = id; H.stat('decal'); } H.saveS(); draw(); wire(); }); };
    wire();
  }

  // ---------- traffic stops ----------
  const VIOL = [['Rolled through a stop sign', 'stop sign'], ['Speeding: 47 in a 30', 'speed'], ['Expired tag', 'tag'], ['Tail light out', 'light'], ['Weaving between lanes', 'weave'], ['No headlights after dark', 'dark']];
  function trafficTick(dt) {
    if (viol && (!H.traffic().includes(viol.c) || (!viol.c.stopped && H.clock() - viol.t0 > 28))) { if (viol.c) viol.c.viol = null; viol = null; }
    if (viol || H.inside || H.S.x6 || S.offDuty || H.call()) return; stopT -= dt; if (stopT > 0) return; stopT = 35 + Math.random() * 40;
    const P = H.P, near = H.traffic().filter((c) => !c.stopped && Math.hypot(c.x - P.x, c.y - P.y) < 15 && Math.hypot(c.x - P.x, c.y - P.y) > 3); if (!near.length) return;
    const c = rnd(near), v = rnd(VIOL.filter((x) => x[1] !== 'dark' || H.NIGHT())); c.viol = v; viol = { c, v, t0: H.clock() };
    H.radio('You', 'Observed: ' + v[0].toLowerCase() + '.'); if (!warned.stop) { warned.stop = 1; H.toast('🚨 A car just committed a violation. Get in your patrol car and tap it to make a traffic stop.'); }
  }
  function tryStop(c) {
    const P = H.P; if (!P.inCar) { H.toast('Get in your patrol car (or on your motorcycle, bike or horse) to make a traffic stop.'); return true; }
    c.stopped = true; c.path = []; H.radio(H.S.cs, 'Traffic stop, ' + c.viol[0].toLowerCase() + '. ' + H.whereAt(c.x, c.y) + '.'); H.chirp();
    const d = [[1, 0], [0, 1], [-1, 0], [0, -1]][c.dir & 3], bx = c.x - d[0] * 1.6, by = c.y - d[1] * 1.6; H.lights(true);
    H.goTo(bx, by, () => stopScene(c)); return true;
  }
  function stopScene(c) {
    const v = c.viol, drv = H.sayAs('driver', { name: rnd(['Driver, Mr. Hale', 'Driver, Ms. Ortiz', 'Driver, Mr. Banks', 'Driver, Ms. Lee', 'Driver, Mr. Novak']), icon: '🚗', role: v[0] });
    const mood = rnd(['calm', 'calm', 'nervous', 'annoyed']), lic = Math.random() < .12 ? 'suspended' : 'valid'; let pts = 0;
    const g = (n) => () => { pts += n; };
    const lines = [
      ['narr', 'Lights on. The ' + rnd(['silver sedan', 'blue pickup', 'white SUV', 'red hatchback', 'black coupe']) + ' pulls to the curb.'],
      ['choice', [{ t: 'Give dispatch the plate and location before you get out', fx: g(3), reply: [['velvet', '(over the radio) Copy your stop. Plate is clear, no wants.']] }, { t: 'Get out right away and walk up', fx: g(0), reply: [['castillo', '(over the radio) Dispatch needs to know where you are before you ever leave the car.']] }, { t: 'Shine the spotlight and wait a minute', fx: g(1), reply: [['narr', 'You watch the car settle. Then you still have to tell dispatch where you are.']] }], 'Before you get out'],
      ['choice', [{ t: 'Approach the driver\'s side, checking the trunk, back seat and hands', fx: g(3), reply: [['narr', 'Trunk latched. Back seat empty. Both hands on the wheel.']] }, { t: 'Approach on the passenger side, away from traffic', fx: g(3), reply: [['narr', 'Safer from passing cars. You can see the driver\'s hands clearly.']] }, { t: 'Walk straight up and stand in front of the window', fx: g(0), reply: [['castillo', '(over the radio) Standing square in the window puts you right in the line of danger. Stay behind the door post.']] }], 'Your approach'],
      ['choice', [{ t: 'Greet them, give your name and agency, and the reason for the stop', fx: g(3), reply: [[drv, mood === 'annoyed' ? 'A stop sign? Really? Fine. Here.' : mood === 'nervous' ? 'Oh. Okay. Sorry, I\'m just nervous. Here\'s my license.' : 'Oh, I didn\'t realize. Sorry about that, officer.']] }, { t: 'Ask "Do you know why I stopped you?"', fx: g(1), reply: [[drv, 'No idea. You tell me.']] }, { t: 'Hold out your hand for the license without a word', fx: g(0), reply: [[drv, '…Hello to you too.']] }], 'Making contact'],
      ['narr', 'You run the license from your car. ' + (lic === 'valid' ? 'Valid. No wants.' : 'It comes back suspended.')],
      ['choice', lic === 'valid' ? [{ t: 'A written warning and a quick word about why it matters', fx: g(3), trust: 1, reply: [[drv, 'Thanks. I\'ll be more careful.']] }, { t: 'Write the citation', fx: g(2), reply: [[drv, mood === 'annoyed' ? 'Great. Perfect. Thanks.' : 'I understand. Thank you, officer.']] }, { t: 'Lecture them for five minutes, then let them go', fx: g(0), trust: -1, reply: [[drv, '…Can I go now?']] }]
        : [{ t: 'Explain they can\'t drive on a suspended license, cite it and help arrange a ride', fx: g(3), trust: 1, reply: [[drv, 'I didn\'t know it was suspended. I\'ll call my sister.']] }, { t: 'Let them drive off with a warning', fx: g(0), trust: -1, reply: [['castillo', '(over the radio) A suspended driver can\'t drive away. That\'s not discretion, that\'s the law.']] }], 'Your decision'],
      ['castillo', '(over the radio) One for the debrief:'], ['q', fact([5, 1, 4]), 'castillo']];
    H.dialogue(lines, (r) => { const gr = pts >= 12 ? 'A' : pts >= 9 ? 'B' : pts >= 6 ? 'C' : 'D'; c.stopped = false; c.viol = null; viol = null; H.lights(false);
      H.award({ A: 90, B: 65, C: 40, D: 20 }[gr], 'traffic stop · grade ' + gr); H.stat('stops'); if (gr === 'A') H.stat('stopA'); H.radio(H.S.cs, 'Clear of the stop.'); H.banner('🚓', 'Traffic stop · grade ' + gr, gr === 'A' ? 'Textbook. Safe, polite and by the book.' : gr === 'D' ? 'Talk it through with Castillo. Safety first, every time.' : 'Solid. A couple of things to tighten up.'); },
    { focus: [c.x, c.y], kicker: 'TRAFFIC STOP · ' + v[0].toUpperCase() });
  }

  // ---------- the car itself ----------
  let lowWarn = 0;
  function carTick(dt) {
    const P = H.P, c = S.car, k = H.rideKind(); if (!P.inCar || !P.path || !P.path.length || k === 'bike' || k === 'horse') return;
    c.fuel = Math.max(0, c.fuel - dt * (k === 'moto' ? .0014 : .0028)); c.dirt = Math.min(1, c.dirt + dt * (H.rain() ? .004 : .0011)); c.wear = Math.min(1, c.wear + dt * .0005);
    if (c.fuel < .15 && lowWarn !== 1) { lowWarn = 1; H.toast('⛽ Low fuel. Gas stations have a ⛽ marker when you drive up.'); } if (c.fuel <= 0 && lowWarn !== 2) { lowWarn = 2; H.toast('⛽ Running on fumes. The car is crawling until you refuel.'); } if (c.fuel > .2) lowWarn = 0;
  }
  const carMult = () => (H.rideKind() === 'bike' || H.rideKind() === 'horse' ? 1 : (S.car.fuel <= 0 ? .35 : 1) * (S.car.wear > .8 ? .85 : 1));
  const rpMult = () => (S.car.dirt < .15 ? 1.05 : 1);
  const ride = (base) => { if (S.car.skinSpec) return Object.assign({}, base, { stripe: S.car.skinSpec.stripe, text: S.car.skinSpec.text }); const d = DECALS.find((x) => x[0] === S.car.decal); return d ? Object.assign({}, base, { stripe: d[1] }) : base; };
  function carHud() {
    const el = H.$('carHud'); if (!el) return; const P = H.P; if (!P.inCar || H.inside || H.rideKind() === 'bike' || H.rideKind() === 'horse') { el.hidden = true; return; } el.hidden = false; const c = S.car;
    el.innerHTML = '<span title="Fuel">⛽<i style="--v:' + c.fuel + '"></i></span><span title="Clean">🧽<i style="--v:' + (1 - c.dirt) + '"></i></span><span title="Condition">🔧<i style="--v:' + (1 - c.wear) + '"></i></span>';
  }
  let hudT = 0;
  return {
    setup, nightLamps, run, tryStop, carMult, rpMult, ride,
    get acts() { return acts.filter(showable); }, get all() { return acts; },
    update(dt) { trafficTick(dt); carTick(dt); hudT -= dt; if (hudT <= 0) { hudT = .5; carHud(); } },
    draw(now) { // icons over things you can do, and the violator
      const ctx = H.ctx, iso = H.iso;
      acts.forEach((a) => { if (!showable(a)) return; const [sx, sy] = iso(a.x, a.y); H.bubble(sx, sy - (a.person ? 58 : 34), a.icon, a.col, now); if (Math.hypot(H.P.x - a.x, H.P.y - a.y) < 4) H.label(sx, sy - (a.person ? 82 : 58), a.label, '#e2e8f0'); });
      if (a0()) { const c = viol.c, [sx, sy] = iso(c.x, c.y); H.bubble(sx, sy - 40, '!', Math.floor(now / 300) % 2 ? '#ef4444' : '#2563eb', now); H.label(sx, sy - 64, viol.v[0], '#fecaca'); }
    },
    tapViolator(near) { if (!viol || viol.c.stopped) return false; const c = viol.c; if (!near(c.x, c.y, 36)) return false; return tryStop(c); },
    drawKid(list, vis, now) { acts.forEach((a) => { if (a.kind !== 'kid') return; const [sx, sy] = H.iso(a.x, a.y); if (vis(sx, sy)) list.push({ d: a.x + a.y, f: () => H.person(H.ctx, sx, sy, { ph: 7, shirt: '#f59e0b', s: .78, face: -1 }, now) }); }); }
  };
  function a0() { return viol && viol.c && !viol.c.stopped; }
}
