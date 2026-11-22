// Districts that run like clockwork: every district keeps its own daily rhythm (the morning rush downtown, school
// buses on Palm Avenue, game night at the stadium, shift change in the warehouse yards, court mornings on Justice Row,
// bar closing at 2 a.m.). A rhythm changes how many cars and people are out, it shows up on the radio when it starts,
// and it brings its own calls, each one teaching a lesson that belongs to that district. Learn a district's clock and
// you know what the next hour will ask of you.
// [from hour, to hour (may wrap past midnight), id, what dispatch says when it starts, traffic x, people x, calls]
// a call: [title, priority, place kind, what dispatch says, lesson]
const R = {
  0: [[6, 9, 'rush', 'Morning rush is building downtown. Main Street is bumper to bumper.', 1.6, 1.2, [['Fender bender blocking Main at rush hour', 2, 'any', 'Two cars touched bumpers in the right lane and neither driver will move.', 1]]],
    [6, 7, 'motor', 'Day shift is rolling out of the motor pool.', 1, 1, [['Cruiser flagged before roll-out', 3, 'any', 'Motor pool says a patrol car has a slow leak and a cracked mirror. Check it before it goes out.', 0]]],
    [11.5, 13.5, 'lunch', 'Lunch crowd at Founders Plaza. Food trucks are out.', 1.1, 1.7, [['Food truck line spilling into the street', 3, 'any', 'The lunch line at Founders Plaza is standing in the travel lane.', 1]]],
    [22, 2.5, 'close', 'Bars downtown are getting toward last call.', .8, 1.4, [['Bar closing, crowd walking between cars', 2, 'any', 'Last call let out and people are crossing mid-block between moving cars.', 1]]]],
  1: [[7, 8.5, 'school', 'School buses are running on Palm Avenue. Watch for kids.', 1.3, 1.3, [['Drivers passing stopped school buses', 3, 'any', 'Caller says cars keep passing the bus while the stop arm is out. Kids crossing.', 3]]],
    [14.5, 15.5, 'school', 'School is letting out on the east side.', 1.3, 1.5, [['Kids crossing at a busy corner', 3, 'any', 'Crossing guard called in sick. The corner by the strip mall is a mess.', 3]]],
    [16, 18.5, 'rush', 'Afternoon rush on the east side. Intersections are full.', 1.6, 1.1, [['Slick intersection, cars sliding', 2, 'any', 'The turn lanes at the gas station corner are slick. Two minor crashes so far.', 2]]],
    [23, 3, 'late', 'Late shift on the east side. The gas stations are the only lights on.', .6, .6, [['Clerk asks for a patrol check', 3, 'any', 'Night clerk says the same car has circled the pumps four times.', 3]]]],
  2: [[8, 11, 'river', 'Morning on the river path. Runners and dog walkers are out.', .9, 1.5, [['Runners in the road by the river', 3, 'any', 'The river path is closed for repairs and runners are using the street.', 5]]],
    [18, 22.5, 'stadium', 'Game night at the stadium. Expect heavy traffic on Riverside.', 1.8, 1.6, [['Stadium letting out, traffic jammed', 2, 'any', 'The game just ended. Cars and people are crossing everywhere at once.', 4]]]],
  3: [[5, 8, 'shift', 'Shift change at the warehouses. Trucks are backing across the lanes.', 1.4, 1.2, [['Truck backing across the road', 3, 'any', 'A warehouse yard is backing trailers across the road at shift change.', 8]]],
    [13, 15, 'deliver', 'Delivery hour in the industrial park. Tight corners, big trucks.', 1.3, .8, [['Semi stuck on a tight corner', 3, 'any', 'A delivery truck is jammed trying to make the turn by the rail yard.', 7]]],
    [22, 5, 'quiet', 'Industrial park is shut for the night. Fences and dark lots.', .4, .3, [['Alarm at a fenced lot', 2, 'any', 'Motion alarm at a storage yard. The gate looks closed from the road.', 6]]]],
  4: [[8, 9.5, 'court', 'Court morning on Justice Row. Jurors are hunting for parking.', 1.4, 1.4, [['Double-parking at the courthouse', 3, 'any', 'Cars are double-parked the length of the courthouse block.', 10]]],
    [17, 18, 'transport', 'Jail transport runs are going out.', 1, 1, [['Transport van wants an escort', 2, 'any', 'A transport van is running to County and wants a marked unit behind it.', 11]]],
    [20, 5, 'dark', 'Long dark roads past the jail tonight. No streetlights out there.', .6, .4, [['Deer on the dark stretch past the jail', 3, 'any', 'Driver reports deer on the road and no streetlights past the jail.', 9]]]]
};
const inSpan = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);

export function installClock(H) {
  let lastKey = null;
  // the rhythms running in this district at this hour (more than one can overlap)
  function now(did, h) { return (R[did] || []).filter((r) => inSpan(h, r[0], r[1])); }
  function traffic(did, h) { return now(did, h).reduce((m, r) => m * r[4], 1); }
  function people(did, h) { return now(did, h).reduce((m, r) => m * r[5], 1); }
  // a call that fits this hour, now and then (the regular calls still come)
  function call(did, h) { const on = now(did, h); if (!on.length || Math.random() > .4) return null; const r = on[(Math.random() * on.length) | 0], c = r[6][(Math.random() * r[6].length) | 0], t = c.slice(0, 4); t.les0 = c[4]; t.rhythm = r[2]; return t; }
  // the radio says so when a rhythm starts; once per rhythm per day
  function tick(did, h) { const on = now(did, h); const k = did + ':' + on.map((r) => r[2]).join(','); if (k === lastKey) return null; const was = lastKey; lastKey = k; if (was == null || was.split(':')[0] !== String(did)) { if (on.length && H.radio) setTimeout(() => H.radio('Dispatch', on[0][3]), 5000); return on[0] || null; } // arriving mid-rhythm: say what the district is doing const fresh = on.find((r) => !was.split(':')[1] || was.split(':')[1].split(',').indexOf(r[2]) < 0); if (fresh && H.radio) H.radio('Dispatch', fresh[3]); return fresh || null; }
  function label(did, h) { const on = now(did, h); return on.length ? on[0][3].split('.')[0] : ''; }
  return { now, traffic, people, call, tick, label, R };
}
