// Every driving fact on the course (Action plan, Step F: Learning). Every fact in Lessons 3.1 to 4.2 is something you
// do on the driving course, and it's checked by what you did, not by a question. Each drill records how you actually
// drove (how hard and how smoothly you used the pedals, how far the nose dove and the body rolled, whether the car
// slid or pushed wide, how fast the wheel moved, where you sat in the lane, how slowly you backed, what your lights did)
// and each fact in the drill's lesson is tied to the part of that record that shows it. After a clean run the debrief
// names a few of those facts you just showed (or didn't) and the fact record takes them: shown counts as learned, not
// shown comes back for review. Lesson 3.1's handling facts are spread over the drills where they happen.
// Loop: the course -> what you did -> the readiness meter and review. Reads the drill physics; feeds the fact record.

const DRILL_OF = { 4: ['skid', 'corner', 'brake'], 5: ['corner', 'back'], 6: ['brake'], 7: ['corner'], 8: ['back'], 9: ['night'], 10: ['emerg'] };
// what in the record shows a fact, picked by what the fact is about (first match wins)
const BY = [
  [/revers|backing|back up|backing/i, 'reverse'], [/night|dark|headlight|glare|beam|subdued|peripheral|dusk|dawn/i, 'night'],
  [/emergency|siren|code 3|intersection|dispatch|responding|light bar/i, 'emerg'], [/oversteer|yaw|rear (tires|end)|spin|fishtail/i, 'yaw'],
  [/understeer|front tires|push(es)? wide|plow/i, 'under'], [/roll|lean|lateral|body|stability|center of gravity|tracking width|rollover/i, 'roll'],
  [/pitch|nose|dive|squat|weight transfer|weight shift|accelerat/i, 'pitch'], [/traction|grip|friction|tire|contact|ESC|TCS|electronic stability|skid|hydroplan/i, 'grip'],
  [/ABS|anti-lock|brak|pedal|pressure|stop/i, 'brake'], [/apex|radius|curve|corner|turn/i, 'line'], [/steer|wheel|hand|o.clock|shuffle|push-pull|seat|posture|grip the|mirror/i, 'hands'],
  [/speed|fast|slow/i, 'speed'], [/.*/, 'clean']
];
const SAY = { reverse: 'Backed slowly, small inputs, no cones', night: 'Kept it inside your lights and handled the glare', emerg: 'Equipment on, slowed for every red, kept your gap',
  yaw: 'Kept the rear planted, or caught the slide off the pedals', under: 'Never asked the front tires for more than they had', roll: 'Kept the body roll under the limit through the curve',
  pitch: 'Smooth on the pedals: no hard dive or squat', grip: 'Stayed inside the grip the road had', brake: 'One steady brake application, no stabs, no pumping',
  line: 'Set your speed before the curve and held your line', hands: 'Smooth, steady steering, kept in your lane', speed: 'Speed matched to the road the whole way', clean: 'A clean run: in your lane, no cones' };

export function installCourseFx(H) {
  // the record of how you drove, kept on the run (R.m)
  function rec(R, c, dt, k) { const m = R.m || (R.m = { long: 0, lat: 0, overT: 0, underT: 0, spinT: 0, stabG: 0, stabB: 0, steerMax: 0, laneMax: 0, revMax: 0, lg: 0, lb: 0, ls: 0 });
    const sp = Math.abs(c.v); if (sp < .3) { m.lg = c.gas; m.lb = c.brk; m.ls = c.steer; return; }
    m.long = Math.max(m.long, Math.abs(k.along - (c.v > 0 ? k.brakeA : -k.brakeA)) / (k.A || 1)); m.lat = Math.max(m.lat, k.latDemand / (k.A || 1));
    if (k.latDemand > k.latCap) m.overT += dt; if (R.under) m.underT += dt; if (R.spin) m.spinT += dt;
    if (c.gas - m.lg > 1.5 * dt * 1.6 + .25) m.stabG++; if (c.brk - m.lb > 1.5 * dt * 2.6 + .25) m.stabB++; // a stab: the pedal jumps faster than a squeeze
    m.steerMax = Math.max(m.steerMax, Math.abs(c.steer - m.ls) / dt * (sp > 3 ? 1 : 0)); m.laneMax = Math.max(m.laneMax, Math.abs(R.at ? R.at.d : 0)); if (c.v < 0) m.revMax = Math.max(m.revMax, sp);
    m.lg = c.gas; m.lb = c.brk; m.ls = c.steer; }
  // did the run show it?
  function shown(kind, R) { const m = R.m || {}, hw = (R.dr.course && R.dr.course.hw) || 2, clean = (R.hits || 0) === 0;
    switch (kind) {
      case 'reverse': return (m.revMax || 0) < 6.2 * .447 * 1.6 && clean; // under about 6 mph in reverse
      case 'night': return !!R.stopped || !R.highOnc;
      case 'emerg': return (R.darkT || 0) < 1.2 && (R.minGap || 0) > 2.2;
      case 'yaw': return !R.slides || (R.recovered > 0 && !R.slideBrake);
      case 'under': return (m.underT || 0) < .4;
      case 'roll': return (m.lat || 0) < .97 && (m.overT || 0) < .4;
      case 'pitch': return (m.stabG || 0) + (m.stabB || 0) <= 1 && (m.spinT || 0) < .2;
      case 'grip': return (m.overT || 0) < .5 && !R.slideBrake;
      case 'brake': return (R.pumps || 0) === 0 && (m.stabB || 0) === 0;
      case 'line': return (m.laneMax || 0) < hw && (m.underT || 0) < .4;
      case 'hands': return (m.steerMax || 0) < 9 && (m.laneMax || 0) < hw;
      case 'speed': return (m.overT || 0) < .4 && clean;
      default: return clean && (m.laneMax || 0) < hw + .3;
    } }
  const kindOf = (t) => BY.find(([re]) => re.test(t))[1];
  // the course facts for a drill: its lesson's facts (and handling facts that happen here) no drill check already covers
  function factsFor(dr, covered) { const out = []; Object.keys(DRILL_OF).forEach((les) => { if (DRILL_OF[les].indexOf(dr.id) < 0) return; const L = H.facts([+les]) || [], share = DRILL_OF[les], i = share.indexOf(dr.id);
      L.forEach((f, j) => { if (covered.some((re) => re.test(f.text))) return; if (share.length > 1 && j % share.length !== i) return; out.push(f); }); }); return out; }
  // after a clean run: up to six facts you haven't locked in yet, judged by what you did, named in the debrief
  function judge(R, dr) { const covered = (dr.fx || []).map(([re]) => re), S = H.S, fs = S.facts || {}, all = factsFor(dr, covered);
    const pick = all.filter((f) => !fs[f.id]).concat(all.filter((f) => fs[f.id])).slice(0, 6);
    return pick.map((f) => { const k = kindOf(f.text), ok = shown(k, R); H.record({ id: 'course:' + f.id, fid: f.id, les: f.les }, ok); return { f, k, ok, say: SAY[k] }; }); }
  // for the debrief and the plan's check: how many of a lesson's facts the course can check
  function coverage(drills) { const out = {}; Object.keys(DRILL_OF).forEach((les) => { const L = H.facts([+les]) || []; const cov = new Set(); DRILL_OF[les].forEach((id) => { const dr = drills.find((d) => d.id === id); if (!dr) return; const c = (dr.fx || []).map(([re]) => re); L.forEach((f) => { if (c.some((re) => re.test(f.text))) cov.add(f.id); }); factsFor(dr, c).forEach((f) => { if (f.les === +les) cov.add(f.id); }); }); out[les] = [cov.size, L.length]; }); return out; }
  const short = (t) => { const s = String(t).split(/;|, so | because /)[0]; return s.length > 110 ? s.slice(0, 107) + '...' : s; };
  function html(list, esc) { if (!list || !list.length) return ''; return '<p class="cfHead">What you just did, from the book</p><ul class="cfList">' + list.map((x) => '<li class="' + (x.ok ? 'ok' : 'no') + '"><i>' + (x.ok ? '✅' : '↺') + '</i><span><b>' + esc(short(x.f.text)) + '</b><small>' + esc(x.ok ? x.say : 'Not this run: ' + x.say.charAt(0).toLowerCase() + x.say.slice(1) + '. It comes back for review.') + '</small></span></li>').join('') + '</ul>'; }
  return { rec, judge, html, coverage, kindOf, shown };
}
