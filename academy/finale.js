// The exam as a finale: the Chapter 5 Final Exam plays as your last shift. Every stage is a call on that night, the
// shift clock runs from 1900 to 0700, people you helped turn up along the way, and the ending depends on two things:
// what you learned (the exam score, unchanged) and who you helped (who comes to your graduation).
const rnd = (a) => a[(Math.random() * a.length) | 0];

// what comes over the radio for a stage, by the lesson of its first question
const CALLFOR = [
  "Walk the downtown loop. The business owners asked for a visible presence tonight.",
  "Man with a weapon reported behind the liquor store on Fourth. Use caution.",
  "Two channels busy tonight. Keep your radio traffic tight.",
  "A records check on a car at the Bayview Motel comes back with a hit.",
  "Robbery alarm at the pharmacy on Fifth. Units responding.",
  "Man checking car door handles in the parking garage.",
  "1-Charlie-4 is asking for backup at a disturbance on Marsh.",
  "A teacher called in about a student's threatening posts.",
  "Family stranded on the causeway with a flat and two kids.",
  "Neighbors haven't seen the man in 12B in four days.",
  "The medical examiner needs a notification made tonight.",
  "Loose dog cornering kids at the Palm Avenue bus stop.",
  "Smoke showing from a duplex on Willow.",
  "Front desk: a woman with a stolen bike and a found wallet.",
  "Repo truck and an angry owner in a driveway on Cedar.",
  "Custody exchange getting loud at the gas station on Route 9.",
  "Crowd spilling into the street after the concert lets out.",
  "Burglar alarm at the hardware store. Back door.",
  "Suspect fled on foot into the neighborhood behind the school.",
  "Arrest made at the plaza. Prisoner needs a ride.",
  "County jail. Booking is waiting on your paperwork."
];

export function installFinale(H) {
  const S = H.S;
  const clock = (i, n) => { const m = Math.round(19 * 60 + 12 * 60 * i / Math.max(1, n)) % (24 * 60); return String(Math.floor(m / 60)).padStart(2, '0') + String(m % 60).padStart(2, '0'); };
  const kick = (i, n) => 'LAST SHIFT · ' + clock(i, n) + ' HRS · CALL ' + (i + 1) + ' OF ' + n;
  // the people who remember you well: good deeds from memory.js, and regulars who count you as a friend
  function helpers() {
    const out = [], seen = new Set(), add = (name, icon, why) => { if (!name || seen.has(name)) return; seen.add(name); out.push({ name, icon, why }); };
    const deeds = (H.MEM && H.MEM.deeds) || [];
    deeds.slice().reverse().forEach((d) => { if (!d.who) return; if (d.k === 'kept') add(d.who, '🏠', 'you kept your word'); else if (d.k === 'help') add(d.who, '🤝', 'you helped at ' + (d.where || 'her door')); else if (d.k === 'deeswin') add(d.who, '☕', 'you talked someone down'); });
    (H.NPCS || []).filter((n) => (S.npc[n.id] || 0) >= 3).sort((a, b) => (S.npc[b.id] || 0) - (S.npc[a.id] || 0)).forEach((n) => add(n.name, n.icon || '⭐', (S.npc[n.id] >= 6 ? 'a close friend' : 'a friend') + ' from ' + (n.role || 'the beat')));
    return out;
  }
  // a stage's opening: the time, what dispatch sends you to, and now and then someone you helped
  function beat(i, n, qs) {
    const les = qs && qs[0] && qs[0].les != null ? qs[0].les : i % CALLFOR.length, lines = [['narr', clock(i, n) + ' hours. Dispatch: ' + CALLFOR[les % CALLFOR.length]]];
    if (i % 12 === 6) { const h = helpers(); if (h.length) { const p = h[(i / 12 | 0) % h.length];
      lines.push(['narr', rnd([p.name + ' waves from the sidewalk as you roll past. "Good luck tonight, officer!"', p.name + ' left a coffee for you at the front desk. The note says, "For your last night. Thank you."', 'Over the radio, dispatch adds: "' + p.name + ' called just to say good luck. That doesn\'t happen often."', p.name + ' flashes the porch light twice as you drive by. Everybody on the block knows it\'s your last shift.'])]); } }
    return lines;
  }
  const intro = (n, N) => [['narr', '1900 hours. Patrol HQ. Your last shift as a cadet, and the Chapter 5 Final Exam rides along with it.'],
    ['castillo', 'Here\'s how tonight works. Every call is a stage, three questions each. That\'s every fact in the chapter, all ' + N + ', across ' + n + ' calls. You need eighty-five percent to graduate. You can step away between calls whenever you need to. Your spot and your score save.'],
    ['castillo', 'And cadet? The people out there know it\'s your last night. You\'ll see.'],
    ['choice', [{ t: 'Let\'s roll.', reply: [] }, { t: 'Give me a second.', reply: [['castillo', 'Take two. Then we roll.']] }], 'Last shift']];
  // the ending: the score decides whether you graduate, the people you helped decide what that looks like
  function ending(r) {
    const pct = Math.round(r.right / Math.max(1, r.n) * 100), pass = r.right / Math.max(1, r.n) >= .85, h = helpers(), tier = h.length >= 8 ? 'city' : h.length >= 3 ? 'block' : 'quiet';
    S.ending = { pass, tier, pct, helped: h.length, at: Date.now() };
    const T = {
      city: pass ? ['THE CITY SHOWS UP', 'Graduation day, and the bleachers are full.', 'You passed with ' + pct + '%. When they call your name, the people you helped are on their feet. That\'s the part nobody can study for.']
        : ['NOT YET · BUT THEY CAME ANYWAY', pct + '%. Not this time.', 'You need 85%. The people you helped still showed up at HQ to tell you to try again. They know who you are already.'],
      block: pass ? ['GRADUATED', 'Graduation day. A few familiar faces in the crowd.', 'You passed with ' + pct + '%. The people you helped are there, cheering a little too loudly. Keep building that.']
        : ['NOT YET', pct + '%. Not this time.', 'You need 85%. A few people you helped sent messages anyway. Review your weakest facts and come back.'],
      quiet: pass ? ['GRADUATED · BY THE BOOK', 'Graduation day. A quiet ceremony.', 'You passed with ' + pct + '%. You know the chapter. The city doesn\'t know you yet. That part of the job starts on your first real shift.']
        : ['NOT YET', pct + '%. Not this time.', 'You need 85%. Run the fact drills in any district, help the people on your beat, and come back.']
    }[tier];
    const who = h.slice(0, 8).map((p) => '<li class="memRow good"><i>' + p.icon + '</i><span><b>' + H.esc(p.name) + '</b> · ' + H.esc(p.why) + '</span></li>').join('');
    return { pass, pct, tier, html: '<div class="sceneHead ' + (pass ? 'done' : 'p1') + '"><b>' + T[0] + '</b><h2>' + H.esc(T[1]) + '</h2><p>' + H.esc(T[2]) + '</p></div>' +
      '<div class="finRow"><div><b>' + r.right + ' of ' + r.n + '</b><small>What you learned</small></div><div><b>' + h.length + '</b><small>People you helped</small></div></div>' +
      (who ? '<p class="finLbl">' + (pass ? 'Who came to your graduation' : 'Who came by anyway') + '</p><ul class="memList">' + who + '</ul>' : '<p class="finLbl">Nobody you helped on patrol is there yet. Calls, promises and friendships on your beat change that.</p>') };
  }
  return { kick, beat, intro, ending, helpers, clock };
}
