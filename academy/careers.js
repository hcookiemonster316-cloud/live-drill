// A career path for every unit (Action plan, Step D). Each unit has its own three-rung ladder, counted in calls you
// clear while serving in it, so a K9 career and a Marine career grow differently on the same city:
//   rung 1 (5 calls)   a unit title
//   rung 2 (15 calls)  the unit's signature call starts coming to you (about one call in five)
//   rung 3 (30 calls)  the unit's own piece of gear is issued to you
// It feeds the same systems as everything else: dispatch (signature calls), the locker (gear), the journal and the
// skill tree card. Switching units keeps each ladder where you left it.

export const LADDERS = {
  patrol: { t: ['Patrol Officer', 'Beat Officer', 'Field Training Candidate'], gear: 'hivis', sig: ['Three cars, one lane, and school letting out', 2, 'Pickup traffic has backed up across the intersection and somebody is about to go around the line.'] },
  swat: { t: ['Team Member', 'Entry Team', 'Team Leader'], gear: 'swathelm', sig: ['Driver barricaded in a stolen box truck', 1, 'A box truck reported stolen is stopped across two lanes. The driver locked the doors and won\'t come out.'] },
  k9: { t: ['K9 Handler', 'Senior Handler', 'K9 Trainer'], gear: 'k9cap', sig: ['Driver bailed from a crash and ran', 2, 'Single-car crash, driver ran on foot toward the rail yard. The car is still running.'] },
  neg: { t: ['Negotiator', 'Lead Negotiator', 'Team Coordinator'], gear: 'negvest', sig: ['Driver parked on the bridge, engine running', 1, 'A man has stopped his car at the top of the bridge and is sitting on the rail. He asked for someone to talk to.'] },
  marine: { t: ['Deckhand', 'Boat Operator', 'Vessel Commander'], gear: 'radiokit', sig: ['Boat dragging anchor toward the swim area', 2, 'A boat broke loose in the wind and is drifting toward the roped-off swim area at the marina.'] },
  brt: { t: ['Resource Officer', 'Crisis Partner', 'Program Lead'], gear: 'firstaid', sig: ['Man directing traffic who isn\'t supposed to be', 2, 'A man in a bathrobe is standing in the intersection waving cars through. He seems sure he\'s helping.'] },
  hoi: { t: ['Outreach Officer', 'Outreach Lead', 'Program Coordinator'], gear: 'thermos', sig: ['Family living in a car on the shoulder', 3, 'A car has been parked on the highway shoulder for three days. A family is sleeping in it.'] },
  det: { t: ['Investigator', 'Detective', 'Lead Detective'], gear: 'notebook', sig: ['Same gray sedan at three crash scenes', 2, 'Traffic reports a gray sedan seen leaving three different crashes this week. Somebody just called in a fourth.'] },
  sro: { t: ['School Officer', 'Campus Lead', 'District School Lead'], gear: 'whistle', sig: ['Pickup line backed onto the highway', 2, 'Parent pickup at Founders Elementary is backed up onto the highway exit ramp. Cars are stopping in the travel lane.'] }
};
const RUNGS = [5, 15, 30];

export function installCareers(H) {
  const S = H.S, esc = H.esc;
  const n = (u) => ((S.ucalls || {})[u] || 0);
  const rung = (u) => RUNGS.filter((r) => n(u) >= r).length;
  const title = (u) => { const r = rung(u), L = LADDERS[u]; return r && L ? L.t[r - 1] : null; };
  // after every cleared call: count it for the unit you're in, and hand out what a new rung brings
  function onCall() { const u = S.unit; if (!LADDERS[u]) return; const r0 = rung(u); S.ucalls = S.ucalls || {}; S.ucalls[u] = n(u) + 1; const r1 = rung(u); if (r1 === r0) return; H.saveS();
    const L = LADDERS[u], unit = H.unitName(u);
    if (r1 === 1) H.banner('🎖️', unit + ': ' + L.t[0], 'Your first rung in ' + unit + '. Signature calls open at ' + RUNGS[1] + ' calls.');
    if (r1 === 2) H.banner('📻', unit + ': ' + L.t[1], 'Dispatch starts sending you ' + unit + '\'s own calls: "' + L.sig[0] + '".');
    if (r1 === 3) { H.banner('🎒', unit + ': ' + L.t[2], 'The unit issued you its own gear. Check your locker.'); H.give(L.gear, unit + ' issued you'); }
    H.journal(unit + ': ' + L.t[r1 - 1] + ' after ' + n(u) + ' calls in the unit.'); }
  // dispatch asks: does this one come in as the unit's signature call?
  function sigCall() { const u = S.unit, L = LADDERS[u]; if (!L || rung(u) < 2 || Math.random() > .2) return null; const c = L.sig.slice(0, 2).concat(['any', L.sig[2]]); c.sig = u; return c; }
  function card() { const u = S.unit, L = LADDERS[u]; if (!L) return ''; const r = rung(u), c = n(u), next = RUNGS[r];
    return '<div class="ctCard"><small>' + esc(H.unitName(u).toUpperCase()) + ' CAREER</small>' + L.t.map((t, i) => '<div class="ctRow' + (i < r ? ' on' : '') + '"><span class="ctI">' + ['🎖️', '📻', '🎒'][i] + '</span><span class="ctT"><b>' + esc(t) + '</b><small>' + esc(['A unit title', 'Signature calls: "' + L.sig[0] + '"', 'The unit\'s own gear'][i] + (i >= r ? ' · ' + RUNGS[i] + ' calls' : '')) + '</small></span></div>').join('') + (next ? '<p class="lkSum">' + c + ' of ' + next + ' calls in ' + esc(H.unitName(u)) + ' for the next rung.</p>' : '') + '</div>'; }
  return { onCall, sigCall, card, title, rung, LADDERS };
}
