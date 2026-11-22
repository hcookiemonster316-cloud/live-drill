// The driving course: short drills you drive yourself, each one a lesson from the chapter played with your hands.
// The car runs on the chapter's own physics: weight pitches forward under braking and rolls to the outside tires in a turn,
// braking while turning eats the grip you need to steer (understeer), hard braking in a slide swings the rear out
// (oversteer), ABS pulses so you can still steer in a hard stop, the wheel straightens itself when you let go going
// forward (caster) but not in reverse, the rear brakes are weaker in reverse, and tall vehicles roll more.
// A drill takes about a minute, retries instantly, and gives bronze, silver or gold; gold needs the chapter's technique,
// not just speed. Doing the technique right counts the fact as learned (the same record a right answer makes), and doing
// it wrong brings that fact back for review. The module loads only when the course opens, so it costs the city nothing.
import { iso, vehicle, drawPropFast } from './world.js';

const G = 1.65;               // one g in tiles per second squared (a tile is about 19.5 feet)
const MPH = 0.0752;           // tiles per second in one mile per hour
const LWB = 0.62;             // wheelbase in tiles
const STEER = 0.52;           // most front-wheel angle, radians
const TALL = { sedan: 1, suv: 1.35, van: 1.5, truck: 1.3, armored: 1.55 };   // how far the body rolls per g
const STABLE = { sedan: 9, suv: .98, van: .9, truck: .95, armored: .88 };   // lateral g at which it starts to tip

// a course: centerline points, half-width, cones along both edges; marks are painted lines
function lane(pts, hw, gap) {
  const P = [], S = [0]; for (let i = 0; i < pts.length; i++) { P.push(pts[i]); if (i) S.push(S[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); }
  const cones = [], len = S[S.length - 1]; for (let s = 0; s <= len + .01; s += gap) { const q = at(P, S, s); cones.push({ x: q.x - q.ny * hw, y: q.y + q.nx * hw }, { x: q.x + q.ny * hw, y: q.y - q.nx * hw }); }
  return { P, S, len, hw, cones };
}
function at(P, S, s) { let i = 1; while (i < S.length - 1 && S[i] < s) i++; const a = P[i - 1], b = P[i], L = S[i] - S[i - 1] || 1, k = Math.max(0, Math.min(1, (s - S[i - 1]) / L)), nx = (b[0] - a[0]) / L, ny = (b[1] - a[1]) / L; return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, nx, ny }; }
function arc(cx, cy, r0, r1, a0, a1, n) { const o = []; for (let i = 0; i <= n; i++) { const k = i / n, a = a0 + (a1 - a0) * k, r = r0 + (r1 - r0) * k; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; }
// where the car is along a course: distance travelled and signed offset from the centerline (right of travel is +)
function locate(c, x, y) { let best = 1e9, bs = 0, off = 0; for (let i = 1; i < c.P.length; i++) { const a = c.P[i - 1], b = c.P[i], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1, k = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)), px = a[0] + dx * k, py = a[1] + dy * k, d = Math.hypot(x - px, y - py); if (d < best) { best = d; bs = c.S[i - 1] + Math.sqrt(L2) * k; const L = Math.sqrt(L2); off = ((x - px) * (-dy / L) + (y - py) * (dx / L)) * -1; } } return { s: bs, off, d: best }; }

// the drills, in chapter order. `fx` are the facts a drill demonstrates (matched by the fact's own words) and the check that proves each
export const DRILLS = [
  { id: 'brake', les: 6, name: 'Threshold Stop', sub: 'Braking Techniques · Lesson 3.3', icon: '🛑',
    brief: 'Get up to 35 mph. At the light, brake hard and keep the pressure on. One lane will be blocked: steer into the open one and stop before the white line. Hard braking lets ABS pulse the brakes so you can still steer.',
    par: [15, 19, 26],
    build() { const c = lane([[0, 0], [36, 0]], 1.0, 1.6); const side = Math.random() < .5 ? -1 : 1; c.wall = []; for (let k = 0; k < 3; k++) c.wall.push({ x: 26.7 + k * .05, y: side * (.12 + k * .32) }); c.cones = c.cones.concat(c.wall.map((w) => ({ x: w.x, y: w.y, wall: 1 }))); c.light = 24; c.stopLine = 31; c.side = side; c.marks = [['line', 24, '#f5b800'], ['line', 31, '#f2f2f2']]; /* the wall sits inside your stopping distance at 35: you have to steer while you brake */ return c; },
    fx: [[/steadily rising pressure to slow or stop/i, 'One steady brake application, no pumping'], [/pulsing the brake on and off very fast, so the driver can still steer/i, 'Steered into the open lane while ABS was working'], [/pulsing brake pedal is normal/i, 'Kept your foot down when the pedal pulsed']] },
  { id: 'corner', les: 7, name: 'Cornering', sub: 'Vehicle Cornering · Lesson 3.4', icon: '↪️',
    brief: 'Hold 35 mph, signal, and finish your braking while you are still going straight. Enter the turn at a steady speed, drive deep before you turn in (a late apex), and start accelerating as you come out.',
    par: [19, 23, 30],
    build() { const c = lane([[0, 0], [20, 0]].concat(arc(20, 5, 5, 5, -Math.PI / 2, 0, 18)).concat([[25, 5.2], [25, 18]]), .8, 1.25); c.turnS = 20; c.turnE = 20 + Math.PI / 2 * 5; c.apex = { x: 20 + Math.cos(-Math.PI / 4) * 5, y: 5 + Math.sin(-Math.PI / 4) * 5 }; c.marks = [['line', 20, 'rgba(245,184,0,.55)']]; return c; },
    fx: [[/Cornering steps 1 to 3/i, 'Reached 35 mph and signaled before the turn'], [/Cornering step 4: brake to a safe speed before the turn/i, 'Finished braking while still straight'], [/Cornering step 7: hold a constant speed/i, 'Held a steady speed into the turn'], [/In late apexing the car reaches the inside edge only after passing the apex/i, 'Late apex: inside edge after the midpoint'], [/Cornering steps 8 to 10/i, 'Accelerated as you left the curve']] },
  { id: 'skid', les: 4, name: 'Wet Curve', sub: 'Handling Characteristics · Lesson 3.1', icon: '💧',
    brief: 'A wet curve that tightens as you go (a decreasing radius). Hold about 25 mph. When the rear slides on the slick patch, do not brake: get off the gas and steer where you want to go.',
    par: [18, 22, 30], wet: true,
    build() { const c = lane([[0, 0], [10, 0]].concat(arc(10, 8, 8, 4.2, -Math.PI / 2, Math.PI * .12, 26)), .85, 1.3); const e = c.P[c.P.length - 1], p = c.P[c.P.length - 2], L = Math.hypot(e[0] - p[0], e[1] - p[1]); const ex = [e[0] + (e[0] - p[0]) / L * 7, e[1] + (e[1] - p[1]) / L * 7]; const d = lane(c.P.concat([ex]), .85, 1.3); d.slick = { s0: 15, s1: 19 }; d.marks = []; return d; },
    fx: [[/decreasing radius turn tightens/i, 'Slowed as the curve tightened'], [/To correct oversteer, take your foot off the accelerator or brake/i, 'Corrected the slide: off the pedals, steered, no brake'], [/Oversteer usually happens at higher speed when the rear tires lose their grip/i, 'Kept the rear planted by not braking in the curve']] },
  { id: 'back', les: 8, name: 'Reverse Serpentine', sub: 'Vehicle Backing · Lesson 3.5', icon: '↩️',
    brief: 'Back through the cones. Keep it slow: in reverse a little steering makes a big change, the rear brakes are weaker, and the wheel will not straighten itself. Small, smooth inputs.',
    par: [34, 40, 55], reverse: true,
    build() { const pts = []; for (let i = 0; i <= 42; i++) { const x = -i * .3; pts.push([x, Math.cos(i * .3 / 3.2 * Math.PI) * 1.05]); } const c = lane(pts, .72, 1.1); c.slalom = []; for (let x = 3.2; x < 12; x += 3.2) c.slalom.push({ x: -x, y: 0 }); c.cones = c.cones.concat(c.slalom); c.marks = []; return c; },
    fx: [[/drive slowly in reverse to make up for more weight transfer/i, 'Stayed under 6 mph the whole way'], [/In reverse, a little steering input makes a big change in direction/i, 'Small steering inputs, no cones'], [/Mirrors are an option when backing, and you should always back slowly/i, 'Backed slowly from start to finish']] }
];

export function installDrills(H) {
  const S = H.S; S.drills = S.drills || {};
  let root = null, cv = null, g = null, raf = 0, D = null, R = null, last = 0, keys = {}, touch = {}, au = null;

  // ---------- the car ----------
  function newCar(dr) { const c = dr.course, p0 = c.P[0], p1 = c.P[1], h = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) + (dr.reverse ? Math.PI : 0);
    return { x: p0[0], y: p0[1], h, va: dr.reverse ? h + Math.PI : h, v: 0, gas: 0, brk: 0, steer: 0, slip: 0, yawKick: 0, pitch: 0, roll: 0, abs: false, spin: false, gear: dr.reverse ? -1 : 1, kind: H.carKind() }; }
  function step(dt) {
    const c = R.car, dr = R.dr, wet = dr.wet || H.wet(), slick = dr.course.slick && R.at.s > dr.course.slick.s0 && R.at.s < dr.course.slick.s1;
    const mu = slick ? .3 : wet ? .62 : 1, A = mu * G;
    // pedals: pressure builds while held (squeeze, not stab), and drops when released
    const wantG = keys.gas || touch.gas ? 1 : 0, wantB = keys.brk || touch.brk ? 1 : 0;
    c.gas = wantG ? Math.min(1, c.gas + dt * 1.6) : Math.max(0, c.gas - dt * 6);
    const was = c.brk; c.brk = wantB ? Math.min(1, c.brk + dt * 2.6) : Math.max(0, c.brk - dt * 8); if (was > .15 && c.brk <= .15 && Math.abs(c.v) > 1) R.pumps++;
    // steering: the wheel turns as fast as hands can shuffle it; let go and the caster effect straightens it, going forward only
    const ws = (keys.r || touch.r ? 1 : 0) - (keys.l || touch.l ? 1 : 0);
    if (ws) c.steer = Math.max(-1, Math.min(1, c.steer + ws * dt * 2.2)); else if (c.v > .3) c.steer -= Math.sign(c.steer) * Math.min(Math.abs(c.steer), dt * 2.6 * Math.min(1, c.v / 1.5));
    // longitudinal: gas pushes, the brake holds, ABS lets you keep steering; tires spin if you stomp from a stop
    const dirv = Math.sign(c.v) || c.gear;
    let along = c.gas * .34 * G * c.gear; R.spin = c.gas > .75 && Math.abs(c.v) < 1.1 && R.gasT < .5; if (R.spin) along *= .35;
    if (c.gear * c.v < -.05) along += c.gear * .5 * G * c.gas; // pushing against a roll the wrong way
    let brakeA = c.brk * G * (c.gear < 0 || c.v < 0 ? .55 : 1);     // the rear brakes take the weight in reverse and they are weaker
    c.abs = c.brk > .82 && Math.abs(c.v) > .6; if (c.abs) brakeA = Math.min(brakeA, .8 * A); // ABS trades a little stopping power for the grip to steer
    const longDemand = Math.abs(along) + brakeA, latCap = Math.sqrt(Math.max(0, A * A - Math.min(A * .97, longDemand) ** 2));
    // turning: the yaw the wheel asks for, limited by what the tires can still hold sideways
    const sens = c.v < 0 ? 1.55 : 1, delta = c.steer * STEER * sens / (1 + Math.abs(c.v) * .12), wantYaw = c.v * Math.tan(delta) / LWB, latDemand = Math.abs(c.v * wantYaw);
    let yaw = wantYaw; R.under = false; R.turnT = latDemand > .5 * A ? (R.turnT || 0) + dt : 0; // oversteer from braking needs a car already loaded in a turn, not a quick swerve
    if (latDemand > latCap && Math.abs(c.v) > .8) { if ((c.brk > .45 && !c.abs && R.turnT > .5) || (slick && c.v > 25 * MPH)) { if (!c.slip) { c.slip = 1; R.slides++; R.slideT = 0; c.yawKick = Math.sign(wantYaw || 1) * (1.1 + c.v * .12); } } else { yaw = Math.sign(wantYaw) * latCap / Math.abs(c.v); R.under = true; } }
    if (slick && c.v > 22 * MPH && !c.slip && Math.abs(c.steer) > .2) { c.slip = 1; R.slides++; R.slideT = 0; c.yawKick = Math.sign(wantYaw || 1) * (1 + c.v * .1); }
    if (c.slip) { if (R.slideT === 0) R.slideH = c.h; R.slideT += dt; yaw += c.yawKick; const fix = c.brk < .1 && c.gas < .15; c.yawKick *= Math.exp(-dt * (fix ? 3.2 : .4)); if (c.brk > .3) { c.yawKick += Math.sign(c.yawKick) * dt * 3; brakeA *= .45; } { let tw = c.h - R.slideH; tw = Math.atan2(Math.sin(tw), Math.cos(tw)); if (Math.abs(tw) > 1.7) R.end = 'spin'; } if (Math.abs(c.v) < .3) { c.slip = 0; c.yawKick = 0; } if (Math.abs(c.yawKick) < .12) { c.slip = 0; R.recovered += R.slideT < 2.5 ? 1 : 0; R.fixedRight = R.fixedRight !== false && R.slideFix / Math.max(R.slideT, .01) > .6; } if (fix) R.slideFix += dt; if (c.brk > .3) R.slideBrake = true; }
    c.h += yaw * dt;
    // the velocity follows the nose as fast as grip allows: low grip means the car keeps going where it was going
    let dva = ((c.h + (c.v < 0 ? Math.PI : 0)) - c.va); dva = Math.atan2(Math.sin(dva), Math.cos(dva)); c.va += dva * Math.min(1, dt * (c.slip ? 2.2 : 9) * mu);
    const vmag = Math.abs(c.v); let nv = c.v + along * dt; if (brakeA > 0) { const d = brakeA * dt; nv = Math.abs(nv) <= d ? 0 : nv - Math.sign(nv) * d; }
    nv -= c.v * dt * (.04 + (R.under ? .5 : 0)); if (Math.abs(nv) < .02 && !c.gas) nv = 0; c.v = nv;
    if (Math.abs(dva) > 2.2 && vmag > 1.5) { R.end = 'spin'; }
    const sp = Math.abs(c.v); c.x += Math.cos(c.va) * sp * dt; c.y += Math.sin(c.va) * sp * dt;
    // weight transfer you can see: the nose dives under braking and squats on the gas, the body rolls to the outside
    const longA = (c.v - (R.pv == null ? c.v : R.pv)) / dt * dirv, dvaT = R.pva == null ? 0 : Math.atan2(Math.sin(c.va - R.pva), Math.cos(c.va - R.pva)), latA = Math.max(-A * 1.08, Math.min(A * 1.08, sp * dvaT / dt)); R.pv = c.v; R.pva = c.va;
    c.pitch += ((-longA / G) - c.pitch) * Math.min(1, dt * 7); c.roll += ((latA / G) * (TALL[c.kind] || 1) - c.roll) * Math.min(1, dt * 6);
    R.maxLat = Math.max(R.maxLat, Math.abs(latA / G)); if (Math.abs(latA / G) > (STABLE[c.kind] || 9)) { R.tip += dt; if (R.tip > .45) R.end = 'roll'; } else R.tip = Math.max(0, R.tip - dt);
    if (c.gas > .05) R.gasT += dt; else R.gasT = 0;
  }
  function obb(c, px, py, pad) { const dx = px - c.x, dy = py - c.y, ch = Math.cos(c.h), sh = Math.sin(c.h), u = dx * ch + dy * sh, w = -dx * sh + dy * ch; return Math.abs(u) < .43 + pad && Math.abs(w) < .21 + pad; }

  // ---------- what the drill watches ----------
  function watch(dt) {
    const c = R.car, dr = R.dr, co = dr.course; R.at = locate(co, c.x, c.y); const mph = Math.abs(c.v) / MPH; R.t += dt;
    co.cones.forEach((k) => { if (!k.hit && obb(c, k.x, k.y, .1)) { k.hit = 1; k.vx = Math.cos(c.va) * Math.abs(c.v) * .8 + (Math.random() - .5); k.vy = Math.sin(c.va) * Math.abs(c.v) * .8 + (Math.random() - .5); R.hits++; sfx('cone'); coach('Cone down. Two seconds added.'); } if (k.hit && k.vx) { k.x += k.vx * dt; k.y += k.vy * dt; k.vx *= .9; k.vy *= .9; if (Math.abs(k.vx) + Math.abs(k.vy) < .02) k.vx = k.vy = 0; } });
    if (R.at.d > co.hw + 2.2) { R.end = 'off'; }
    if (dr.id === 'brake') { if (!R.lit && c.x >= co.light) { R.lit = 1; R.vAtLight = mph; coach(mph < 31 ? 'Under 35 at the light. You need the speed for this one.' : co.side < 0 ? 'Left lane blocked! Brake hard and steer right.' : 'Right lane blocked! Brake hard and steer left.'); sfx('cue'); }
      if (R.lit) { if (c.brk > .05 && R.firstBrake == null) R.firstBrake = R.t; if (c.abs) { R.absT += dt; if (Math.abs(c.steer) > .25) R.absSteer = 1; } }
      if (!R.lit && c.brk > .3) R.early = 1;
      if (R.lit && Math.abs(c.v) < .02 && c.brk > .1) finish(c.x <= co.stopLine + .45 && Math.sign(c.y) === -co.side); else if (c.x > co.stopLine + 2.5) finish(false); }
    else if (dr.id === 'corner') { const s = R.at.s;
      if (s < co.turnS) { R.maxIn = Math.max(R.maxIn, mph); if (c.brk > .05) R.lastBrakeS = s; if (keys.sig || touch.sig) R.sig = 1; R.vEntry = mph; }
      else if (s < co.turnE) { if (c.brk > .05) R.brakeInTurn = 1; R.turnV.push(mph); const d = Math.hypot(c.x - 20, c.y - 5); if (d < R.inside) { R.inside = d; R.apexS = s; } }
      else { if (R.exitV == null) R.exitV = mph; if (c.gas > .2 && s < co.turnE + 3) R.gasOut = 1; }
      if (s >= co.len - .3) finish(true); }
    else if (dr.id === 'skid') { if (R.at.s > 8 && R.at.s < co.slick.s0) R.vIn = Math.max(R.vIn, mph); if (R.at.s > co.slick.s1 + 2 && c.brk > .3) R.slideBrake = true; if (R.at.s >= co.len - .3) finish(true); }
    else if (dr.id === 'back') { R.maxV = Math.max(R.maxV, mph); R.steerWork += Math.abs(c.steer - R.lastSteer); R.bigSteer = Math.max(R.bigSteer || 0, Math.abs(c.steer)); R.lastSteer = c.steer; if (c.v > .1) R.forward = 1; if (R.at.s >= co.len - .3) finish(true); }
    if (R.t > 90) finish(false);
  }

  // ---------- results: medal, time, and the technique checklist (the facts) ----------
  function checks() { const dr = R.dr, co = dr.course, r = [];
    if (dr.id === 'brake') { r.push(R.pumps <= 1 && R.firstBrake != null, R.absT > .25 && R.absSteer && Math.sign(R.car.y) === -co.side, R.absT > .25 && R.pumps === 0); }
    else if (dr.id === 'corner') { const tv = R.turnV, steady = tv.length > 4 && Math.max(...tv) - Math.min(...tv) < 7; r.push(R.maxIn >= 32 && !!R.sig, R.lastBrakeS != null && R.lastBrakeS < co.turnS - .4 && !R.brakeInTurn, steady && !R.brakeInTurn, R.apexS != null && R.apexS > co.turnS + (co.turnE - co.turnS) * .5, !!R.gasOut); }
    else if (dr.id === 'skid') { r.push(R.vIn >= 21 && R.end == null, R.slides > 0 && R.recovered > 0 && !R.slideBrake, !R.slideBrake && R.hits === 0); }
    else if (dr.id === 'back') { r.push(R.maxV < 6.2, R.hits === 0 && R.bigSteer < .8, R.maxV < 6.2 && !R.forward); }
    return r; }
  function finish(ok) { if (R.done) return; R.done = true; const dr = R.dr, t = R.t + R.hits * 2, ck = ok ? checks() : dr.fx.map(() => false), allTech = ck.every(Boolean);
    const medal = !ok ? 0 : allTech && t <= dr.par[0] ? 3 : t <= dr.par[1] && R.hits <= 1 ? 2 : 1;
    // the facts: right technique counts the fact as learned, wrong technique brings it back for review
    if (!ok && R.end === 'spin') { const f = factFor(4, /To correct oversteer, take your foot off/i); if (f) H.record({ id: 'drill:spin', fid: f.id, les: 4 }, false); } // a spin brings the slide fact back for review
    if (ok) dr.fx.forEach(([re], i) => { const f = factFor(dr.les, re); if (f) H.record({ id: 'drill:' + dr.id + ':' + i, fid: f.id, les: dr.les }, !!ck[i]); });
    const best = S.drills[dr.id] || {}, newBest = ok && (best.m == null || medal > best.m || (medal === best.m && t < best.t)); if (newBest) S.drills[dr.id] = { m: medal, t: Math.round(t * 10) / 10 };
    if (ok && medal > (best.m || 0)) { const rp = [0, 15, 30, 60][medal] - [0, 15, 30, 60][best.m || 0]; if (rp > 0) H.award(rp, 'Driving course: ' + dr.name + ' ' + ['', 'bronze', 'silver', 'gold'][medal]); H.stat('drill' + ['', 'B', 'S', 'G'][medal]); }
    H.save(); sfx(medal === 3 ? 'gold' : ok ? 'done' : 'fail'); showResult(ok, medal, t, ck); }
  function factFor(les, re) { return (H.facts([les]) || []).find((f) => re.test(f.text)); }

  // ---------- drawing ----------
  const ink = 'rgba(22,27,46,.9)';
  function draw(now) {
    const w = cv.width, h = cv.height, dpr = cv._dpr, c = R.car, co = R.dr.course, night = false;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#3f5a3a'; g.fillRect(0, 0, w, h);
    const z = Math.min(w, h) / dpr / 330 * dpr, look = Math.max(-1, Math.min(2.5, c.v * .5)), [cx, cy] = iso(c.x + Math.cos(c.va) * look, c.y + Math.sin(c.va) * look);
    g.setTransform(z, 0, 0, z, w / 2 - cx * z, h * .56 - cy * z);
    // the pad: one big slab of asphalt, darker and glossy when wet
    const B = R.bounds, poly = (pts, f) => { g.beginPath(); pts.forEach((p, i) => { const [x, y] = iso(p[0], p[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fillStyle = f; g.fill(); };
    poly([[B[0], B[1]], [B[2], B[1]], [B[2], B[3]], [B[0], B[3]]], R.dr.wet ? '#2c3442' : '#3a3f4a');
    // the lane, painted; the slick patch shines
    g.lineCap = 'round'; g.lineJoin = 'round'; const path = (pts, col, wd, dash) => { g.beginPath(); pts.forEach((p, i) => { const [x, y] = iso(p[0], p[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.strokeStyle = col; g.lineWidth = wd; g.setLineDash(dash || []); g.stroke(); g.setLineDash([]); };
    poly(R.band, R.dr.wet ? '#343d4d' : '#454b57'); path(co.P, 'rgba(242,242,242,.35)', 1.2, [8, 10]);
    if (co.slick) { const a = [], b = []; for (let s = co.slick.s0; s <= co.slick.s1; s += .5) { const q = at(co.P, co.S, s); a.push([q.x - q.ny * co.hw, q.y + q.nx * co.hw]); b.unshift([q.x + q.ny * co.hw, q.y - q.nx * co.hw]); } poly(a.concat(b), 'rgba(140,180,230,' + (.22 + Math.sin(now / 300) * .05) + ')'); }
    co.marks.forEach(([k, s, col]) => { const q = at(co.P, co.S, s); path([[q.x - q.ny * co.hw * 1.6, q.y + q.nx * co.hw * 1.6], [q.x + q.ny * co.hw * 1.6, q.y - q.nx * co.hw * 1.6]], col, 3); });
    { const q = at(co.P, co.S, co.len - .2); for (let i = -3; i <= 3; i++) { const a = [q.x + q.ny * co.hw * i / 3.5, q.y - q.nx * co.hw * i / 3.5]; path([a, [a[0] + q.nx * .3, a[1] + q.ny * .3]], i & 1 ? '#f2f2f2' : '#161b2e', 4); } }
    // tire marks
    g.strokeStyle = 'rgba(14,16,22,.45)'; g.lineWidth = 2; R.marks.forEach((m) => { const [x0, y0] = iso(m[0], m[1]), [x1, y1] = iso(m[2], m[3]); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
    // the light for the threshold stop
    if (co.light) { const [lx, ly] = iso(co.light, -co.hw - 1.2); g.fillStyle = '#161b2e'; g.fillRect(lx - 4, ly - 34, 8, 34); g.fillStyle = R.lit ? '#ef4444' : '#22c55e'; g.beginPath(); g.arc(lx, ly - 30, 4.5, 0, 7); g.fill(); }
    // cones and the car, back to front
    const list = co.cones.map((k) => ({ d: k.x + k.y, f: () => { const [sx, sy] = iso(k.x, k.y); drawPropFast(g, { t: 'cone', x: 0, y: 0 }, sx, sy, now, night); } }));
    list.push({ d: c.x + c.y, f: () => { const [sx, sy] = iso(c.x, c.y), dir = Math.round(c.h / (Math.PI / 2) * 8) / 8; const q = ((dir % 4) + 4) % 4; g.save(); g.translate(sx, sy); const lean = S.cfg.motion === false ? 0 : 1; g.rotate(c.roll * .06 * lean); g.translate(0, c.pitch * 1.6 * lean); g.translate(-sx, -sy); vehicle(g, sx, sy, q === Math.floor(q) ? q + 1e-6 : q, R.spec, now, night, false); g.restore();
      if (c.abs && Math.floor(now / 70) % 2) { g.fillStyle = 'rgba(245,184,0,.9)'; g.font = '700 9px Meridian, sans-serif'; g.textAlign = 'center'; g.fillText('ABS', sx, sy - 30); } } });
    // Sergeant Castillo watches from beside the start, and turns to follow you
    { const p0 = co.P[0], p1 = co.P[1], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1, fx = p0[0] - (p1[1] - p0[1]) / L * (co.hw + 1.3) - (p1[0] - p0[0]) / L * .8, fy = p0[1] + (p1[0] - p0[0]) / L * (co.hw + 1.3) - (p1[1] - p0[1]) / L * .8; list.push({ d: fx + fy, f: () => { const [sx, sy] = iso(fx, fy), [cx2] = iso(c.x, c.y); if (H.figure) H.figure(g, sx, sy, 'castillo', now, cx2 >= sx ? 1 : -1); } }); }
    list.sort((a, b) => a.d - b.d).forEach((o) => o.f());
    g.setTransform(1, 0, 0, 1, 0, 0);
    // rain on the wet drill: streaks in screen space over a cooler light
    if (R.dr.wet) { const W = w / dpr, Hh = h / dpr; g.save(); g.scale(dpr, dpr); g.fillStyle = 'rgba(120,150,200,.08)'; g.fillRect(0, 0, W, Hh); g.strokeStyle = 'rgba(200,220,255,.28)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 90; i++) { const sd = i * 9301 % 233280 / 233280, x = (sd * W * 1.3 + now * .35 * (1 + sd)) % (W + 40) - 20, y = ((i * 49297 % 233280) / 233280 * Hh + now * .9 * (1 + sd * .5)) % (Hh + 30) - 15; g.moveTo(x, y); g.lineTo(x - 4, y + 13); } g.stroke(); g.restore(); }
  }

  // ---------- the loop ----------
  function frame(now) { raf = requestAnimationFrame(frame); if (!R) return; let dt = Math.min(.05, (now - last) / 1000); last = now; if (!R.paused && !R.done) { const n = Math.ceil(dt / (1 / 120)), h = dt / n; for (let i = 0; i < n; i++) { const px = R.car.x, py = R.car.y; step(h); if (R.car.slip || (R.car.abs && Math.random() < .3) || R.spin) { R.marks.push([px, py, R.car.x, R.car.y]); if (R.marks.length > 900) R.marks.shift(); } } watch(dt); if (R.end && !R.done) { coach(R.end === 'spin' ? 'You spun it. Off the pedals and steer where you want to go.' : R.end === 'roll' ? 'Too much speed for a tall vehicle in that turn. It nearly rolled.' : 'Off the course.'); finish(false); } hudUpd(); engine(); } draw(now); }
  function engine() { if (!au) return; const c = R.car, sp = Math.abs(c.v) / MPH; au.o.frequency.value = 38 + sp * 1.6 + c.gas * 30; au.g.gain.value = R.done ? 0 : .018 + c.gas * .02; au.sq.gain.value = R.done ? 0 : (c.slip || R.under ? .05 : R.spin ? .04 : 0); au.ab.gain.value = !R.done && c.abs ? (Math.floor(performance.now() / 55) % 2 ? .05 : 0) : 0; }
  function audioOn() { if (!S.sound || au) return; const a = H.audio(); if (!a) return; try { const o = a.createOscillator(), f = a.createBiquadFilter(), gg = a.createGain(); o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 420; o.connect(f).connect(gg).connect(a.destination); gg.gain.value = 0; o.start();
      const n = a.createBuffer(1, a.sampleRate, a.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = a.createBufferSource(); s.buffer = n; s.loop = true; const bf = a.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 2400; bf.Q.value = 6; const sq = a.createGain(); sq.gain.value = 0; s.connect(bf).connect(sq).connect(a.destination); s.start();
      const ao = a.createOscillator(); ao.type = 'square'; ao.frequency.value = 52; const ab = a.createGain(); ab.gain.value = 0; ao.connect(ab).connect(a.destination); ao.start(); au = { o, g: gg, sq, ab, stop: () => { [o, s, ao].forEach((x) => { try { x.stop(); } catch (e) {} }); } }; } catch (e) { au = null; } }
  function sfx(k) { if (k === 'cone') H.beep(330, .08, 'triangle', .04); else if (k === 'cue') { H.beep(880, .12, 'square', .03); H.beep(660, .16, 'square', .03, .12); } else if (k === 'gold') { [784, 988, 1175, 1568].forEach((f, i) => H.beep(f, .16, 'triangle', .05, i * .09)); } else if (k === 'done') { H.beep(660, .12, 'triangle', .04); H.beep(880, .2, 'triangle', .04, .1); } else H.beep(220, .3, 'sawtooth', .03); }

  // ---------- screen ----------
  const $ = (id) => root.querySelector('#' + id);
  function coach(t) { const el = $('drCoach'); if (!el) return; el.innerHTML = '<b>Sgt. Castillo</b> ' + H.esc(t); el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }
  function hudUpd() { const c = R.car, mph = Math.round(Math.abs(c.v) / MPH); $('drMph').textContent = mph; $('drT').textContent = R.t.toFixed(1) + (R.hits ? ' +' + R.hits * 2 : ''); $('drGas').style.setProperty('--v', c.gas); $('drBrk').style.setProperty('--v', c.brk); $('drWheel').style.transform = 'rotate(' + (c.steer * 220) + 'deg)'; $('drAbs').classList.toggle('on', c.abs); $('drGear').textContent = c.gear < 0 ? 'R' : 'D'; }
  function css() { if (document.getElementById('drillCss')) return; const st = document.createElement('style'); st.id = 'drillCss'; st.textContent = `
#drill{position:fixed;inset:0;z-index:60;background:#161b2e;touch-action:none;user-select:none;-webkit-user-select:none;font-family:'Meridian Text',sans-serif;color:#eef2f7}
#drill canvas{position:absolute;inset:0;width:100%;height:100%}
#drill .drTop{position:absolute;left:12px;right:12px;top:calc(10px + env(safe-area-inset-top));display:flex;gap:8px;align-items:flex-start;justify-content:space-between;pointer-events:none}
#drill .drName{background:rgba(22,27,46,.82);border-radius:12px;padding:8px 12px;max-width:60%}#drill .drName b{display:block;font-family:Meridian,sans-serif;font-size:15px}#drill .drName small{color:var(--g2,#94a3b8);font-size:11px}
#drill .drClock{background:rgba(22,27,46,.82);border-radius:12px;padding:8px 12px;text-align:right;font-variant-numeric:tabular-nums}#drill .drClock b{font-family:Meridian,sans-serif;font-size:20px;display:block}#drill .drClock small{font-size:10px;color:var(--g2,#94a3b8)}
#drill .drQuit{pointer-events:auto;background:rgba(22,27,46,.82);border:0;color:#eef2f7;border-radius:12px;width:40px;height:40px;font-size:18px}
#drill .drDash{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom));display:flex;align-items:flex-end;gap:12px;pointer-events:none}
#drill .drSpd{background:rgba(22,27,46,.86);border-radius:14px;padding:6px 12px;text-align:center;min-width:70px}#drill .drSpd b{font:700 26px Meridian,sans-serif;display:block;font-variant-numeric:tabular-nums}#drill .drSpd small{font-size:10px;color:var(--g2,#94a3b8)}
#drill .drBar{width:12px;height:60px;border-radius:6px;background:rgba(22,27,46,.86);position:relative;overflow:hidden}#drill .drBar::after{content:'';position:absolute;left:0;right:0;bottom:0;height:calc(var(--v,0)*100%);background:var(--c)}
#drill #drWheel{width:46px;height:46px;border-radius:50%;border:5px solid #2a3147;position:relative;background:rgba(22,27,46,.6)}#drill #drWheel::before{content:'';position:absolute;left:50%;top:-5px;width:4px;height:9px;margin-left:-2px;background:#f5b800;border-radius:2px}#drill #drWheel::after{content:'';position:absolute;left:4px;right:4px;top:50%;height:4px;margin-top:-2px;background:#2a3147}
#drill #drAbs{font:700 11px Meridian,sans-serif;color:#5b6479;padding:3px 6px;border:1.5px solid #5b6479;border-radius:6px;align-self:center}#drill #drAbs.on{color:#f5b800;border-color:#f5b800}
#drill .drPads{position:absolute;inset:auto 0 0 0;height:46%;display:flex;justify-content:space-between;align-items:flex-end;padding:0 10px calc(10px + env(safe-area-inset-bottom));pointer-events:none}
#drill .drPads div{display:flex;gap:8px;pointer-events:auto}#drill .drPads button{width:68px;height:68px;border-radius:18px;border:0;background:rgba(238,242,247,.12);color:#eef2f7;font:700 13px Meridian,sans-serif;touch-action:none}#drill .drPads button.on{background:rgba(245,184,0,.35)}
#drill .drPads .brk{height:84px}#drill .drPads .small{width:52px;height:44px;font-size:12px}
#drill .drCoach{position:absolute;left:50%;top:calc(76px + env(safe-area-inset-top));transform:translateX(-50%);max-width:min(520px,90vw);background:rgba(22,27,46,.9);border-left:3px solid #f5b800;padding:8px 12px;border-radius:10px;font-size:14px;opacity:0;transition:opacity .25s;pointer-events:none}#drill .drCoach.on{opacity:1}#drill .drCoach b{display:block;font:700 11px Meridian,sans-serif;color:#f5b800;letter-spacing:.04em}
#drill .drCard{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(22,27,46,.55)}#drill .drCard>div{background:#1e2538;border-radius:18px;padding:18px;max-width:440px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.4)}
#drill .drCard h2{font-family:Meridian,sans-serif;margin:2px 0 6px;font-size:22px}#drill .drCard p{margin:6px 0;color:#cbd5e1;font-size:14px;line-height:1.45}#drill .drCard .tag{font-size:11px;letter-spacing:.08em;color:#f5b800}
#drill .drCard ul{list-style:none;padding:0;margin:10px 0}#drill .drCard li{display:flex;gap:8px;padding:6px 0;border-top:1px solid #2a3147;font-size:13px}#drill .drCard li i{font-style:normal;width:18px;flex:none}
#drill .drCard .acts{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}#drill .drCard .acts button{flex:1;min-width:110px;border:0;border-radius:12px;padding:12px;font:700 14px Meridian,sans-serif;background:#2a3147;color:#eef2f7}#drill .drCard .acts .go{background:#f5b800;color:#161b2e}
#drill .medal{font:700 40px Meridian,sans-serif;text-align:center}#drill .pars{display:flex;gap:6px;font-size:12px;color:#94a3b8;margin-top:4px}#drill .pars span{background:#161b2e;border-radius:8px;padding:4px 8px}
#drill .drKeys{font-size:12px;color:#94a3b8}
@media (hover:hover) and (pointer:fine){#drill .drPads{display:none}}
`; document.head.appendChild(st); }

  function open(id) {
    css(); if (root) close(true); H.pause(true);
    root = document.createElement('div'); root.id = 'drill';
    root.innerHTML = '<canvas></canvas><div class="drTop"><div class="drName"><b id="drN"></b><small id="drSub"></small></div><div class="drClock"><b id="drT">0.0</b><small id="drPar"></small></div><button type="button" class="drQuit" id="drX" aria-label="Leave the course">✕</button></div><div class="drCoach" id="drCoach"></div>' +
      '<div class="drDash"><div class="drBar" id="drGas" style="--c:#22c55e" title="Gas"></div><div class="drSpd"><b id="drMph">0</b><small>mph · <span id="drGear">D</span></small></div><div id="drWheel"></div><span id="drAbs">ABS</span><div class="drBar" id="drBrk" style="--c:#ef4444" title="Brake"></div></div>' +
      '<div class="drPads"><div><button type="button" data-p="l">◀</button><button type="button" data-p="r">▶</button></div><div style="flex-direction:column;align-items:flex-end"><button type="button" class="small" data-p="sig" id="drSig">Signal</button><div style="gap:8px;display:flex"><button type="button" class="brk" data-p="brk">Brake</button><button type="button" class="brk" data-p="gas">Gas</button></div></div></div><div class="drCard" id="drCard" hidden></div>';
    document.body.appendChild(root); cv = root.querySelector('canvas'); g = cv.getContext('2d');
    const fit = () => { const d = Math.min(2, window.devicePixelRatio || 1); cv._dpr = d; cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d); }; fit(); root._fit = fit; addEventListener('resize', fit);
    $('drX').onclick = () => close();
    root.querySelectorAll('[data-p]').forEach((b) => { const k = b.dataset.p, on = (e) => { e.preventDefault(); if (k === 'sig') { touch.sig = !touch.sig; b.classList.toggle('on', touch.sig); return; } touch[k] = 1; b.classList.add('on'); audioOn(); }, off = (e) => { if (k === 'sig') return; e.preventDefault(); touch[k] = 0; b.classList.remove('on'); }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off); });
    addEventListener('keydown', kd, true); addEventListener('keyup', ku, true);
    H.music(true); start(id); last = performance.now(); raf = requestAnimationFrame(frame);
  }
  const KM = { ArrowUp: 'gas', w: 'gas', W: 'gas', ArrowDown: 'brk', s: 'brk', S: 'brk', ' ': 'brk', ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r' };
  function kd(e) { if (!root) return; const k = KM[e.key]; if (k) { keys[k] = 1; e.preventDefault(); e.stopPropagation(); audioOn(); return; } if (e.key === 'q' || e.key === 'e' || e.key === 'Q' || e.key === 'E') { keys.sig = 1; coach('Signal on.'); } else if (e.key === 'r' || e.key === 'R' || (e.key === 'Enter' && R && R.done)) { e.preventDefault(); start(R.dr.id); } else if (e.key === 'Escape') { e.preventDefault(); close(); } e.stopPropagation(); }
  function ku(e) { if (!root) return; const k = KM[e.key]; if (k) { keys[k] = 0; e.preventDefault(); e.stopPropagation(); } }
  function start(id) {
    const dr = DRILLS.find((d) => d.id === id) || DRILLS[0]; dr.course = dr.build(); keys = { gas: 0, brk: 0, l: 0, r: 0 }; touch = {}; root.querySelectorAll('.drPads .on').forEach((b) => b.classList.remove('on'));
    const xs = dr.course.P.map((p) => p[0]), ys = dr.course.P.map((p) => p[1]);
    R = { dr, car: null, t: 0, hits: 0, pumps: 0, slides: 0, recovered: 0, slideT: 0, slideFix: 0, gasT: 0, marks: [], maxLat: 0, tip: 0, absT: 0, maxIn: 0, turnV: [], inside: 99, vIn: 0, maxV: 0, steerWork: 0, lastSteer: 0, at: { s: 0, off: 0, d: 0 }, bounds: [Math.min(...xs) - 5, Math.min(...ys) - 5, Math.max(...xs) + 5, Math.max(...ys) + 5], spec: H.carSpec(), paused: true };
    R.car = newCar(dr); { const co = dr.course, a = [], b = []; for (let s = 0; s <= co.len + .01; s += .35) { const q = at(co.P, co.S, s); a.push([q.x - q.ny * co.hw, q.y + q.nx * co.hw]); b.unshift([q.x + q.ny * co.hw, q.y - q.nx * co.hw]); } R.band = a.concat(b); } $('drN').textContent = dr.name; $('drSub').textContent = dr.sub; $('drSig').style.display = dr.id === 'corner' ? '' : 'none';
    $('drPar').textContent = 'gold ' + dr.par[0] + 's · silver ' + dr.par[1] + 's'; $('drCoach').classList.remove('on');
    const best = S.drills[dr.id]; const card = $('drCard'); card.hidden = false;
    card.innerHTML = '<div><span class="tag">DRIVING COURSE · ' + H.esc(dr.sub.toUpperCase()) + '</span><h2>' + dr.icon + ' ' + H.esc(dr.name) + '</h2><p>' + H.esc(dr.brief) + '</p><div class="pars"><span>🥇 ' + dr.par[0] + 's + technique</span><span>🥈 ' + dr.par[1] + 's</span><span>🥉 finish</span></div>' + (best ? '<p>Your best: ' + ['—', '🥉', '🥈', '🥇'][best.m] + ' ' + best.t + 's</p>' : '') +
      '<p class="drKeys">Keys: ↑ gas · ↓ or Space brake (hold to press harder) · ← → steer' + (dr.id === 'corner' ? ' · E signal' : '') + ' · R retry</p><div class="acts"><button type="button" class="go" id="drGo">Drive</button></div></div>';
    $('drGo').onclick = () => { card.hidden = true; R.paused = false; last = performance.now(); audioOn(); coach(dr.reverse ? 'In reverse. Look back, small inputs, slow.' : dr.id === 'brake' ? 'Get up to 35 before the light.' : dr.id === 'corner' ? 'Build to 35 and hold it.' : 'Hold about 25 into the curve.'); };
  }
  function showResult(ok, medal, t, ck) { const dr = R.dr, card = $('drCard'), i = DRILLS.indexOf(dr), nx = DRILLS[i + 1];
    card.hidden = false; card.innerHTML = '<div><span class="tag">' + H.esc(dr.name.toUpperCase()) + '</span><div class="medal">' + (ok ? ['', '🥉', '🥈', '🥇'][medal] : '↺') + '</div><h2 style="text-align:center">' + (ok ? ['', 'Bronze', 'Silver', 'Gold'][medal] + ' · ' + t.toFixed(1) + 's' : 'Run again') + '</h2>' +
      (ok && medal < 3 && ck.every(Boolean) ? '<p style="text-align:center">Clean technique. Gold is ' + dr.par[0] + 's: same moves, more confidence.</p>' : '') +
      '<ul>' + dr.fx.map(([, label], k) => '<li><i>' + (ck[k] ? '✅' : '◻️') + '</i><span>' + H.esc(label) + '</span></li>').join('') + '</ul>' +
      (ok ? '' : '<p>' + H.esc(R.end === 'spin' ? 'The car swapped ends. In a slide, braking makes it worse: get off both pedals and steer where you want to go.' : R.end === 'roll' ? 'Tall vehicles carry their weight high, so they roll more in a turn. Less speed into the corner.' : dr.id === 'brake' ? (R.vAtLight != null && R.vAtLight < 31 ? 'Reach 35 mph before the light, then brake hard and keep the pressure on.' : 'Brake hard the moment the light turns and keep steering for the open lane.') : 'Stay between the cones and keep it smooth.') + '</p>') +
      '<div class="acts"><button type="button" class="go" id="drAgain">Retry</button>' + (nx && ok ? '<button type="button" id="drNext">Next: ' + H.esc(nx.name) + '</button>' : '') + '<button type="button" id="drMenu">Course</button></div></div>';
    $('drAgain').onclick = () => start(dr.id); if ($('drNext')) $('drNext').onclick = () => start(nx.id); $('drMenu').onclick = () => close(); }
  function close(quiet) { if (!root) return; cancelAnimationFrame(raf); removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); removeEventListener('resize', root._fit); if (au) { au.stop(); au = null; } root.remove(); root = null; R = null; if (!quiet) { H.pause(false); H.music(false); H.onClose && H.onClose(); } }

  // the course list, for the motor pool
  function menuHtml() { const got = DRILLS.map((d) => (S.drills[d.id] || {}).m || 0); return '<div class="drillList">' + DRILLS.map((d, i) => { const b = S.drills[d.id]; return '<button type="button" data-drill="' + d.id + '"><span>' + d.icon + '</span><b>' + H.esc(d.name) + '</b><small>' + H.esc(d.sub) + '</small><em>' + (b ? ['—', '🥉', '🥈', '🥇'][b.m] + ' ' + b.t + 's' : 'Not run yet') + '</em></button>'; }).join('') + '</div><p class="lkSum">' + got.filter((m) => m === 3).length + ' of ' + DRILLS.length + ' gold. Gold takes the chapter\'s technique, not just speed.</p>'; }
  function bindMenu(el) { el.querySelectorAll('[data-drill]').forEach((b) => b.onclick = () => open(b.dataset.drill)); }
  function golds() { return DRILLS.filter((d) => (S.drills[d.id] || {}).m === 3).length; }
  return { open, close, menuHtml, bindMenu, golds, DRILLS, get state() { return R; }, press: (k) => Object.assign(keys, k) }; // press: for the scripted driver in tests
}
