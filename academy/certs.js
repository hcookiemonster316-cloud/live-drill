// Certifications you earn on the course (Action plan, Step D). Gold medals on the driving course add up to
// real-sounding certifications, and each one changes what you can do on the street, so the drills feed the career:
//   Vehicle Operations            golds on Threshold Stop, Cornering, Wet Curve and Reverse Serpentine: the cruiser is
//                                 10% quicker getting around the city
//   Emergency Vehicle Operations  gold on Code 3: one Code 3 run every shift, even without the Code 3 skill
//   Night Operations              gold on Night Road: calls on a night shift pay 15% more
//   Pursuit Driving               gold on the pursuit drill: Air One gets overhead sooner in your street pursuits,
//                                 so the clean way out (back off and let the air unit track it) comes earlier
// A certification is never taken away. They show on the skill tree with what each one needs.

export const CERTS = [
  { id: 'vo', name: 'Vehicle Operations', icon: '🚓', need: ['brake', 'corner', 'skid', 'back'], what: 'The cruiser is 10% quicker around the city.' },
  { id: 'evo', name: 'Emergency Vehicle Operations', icon: '🚨', need: ['emerg'], what: 'One Code 3 run every shift, even without the skill.' },
  { id: 'night', name: 'Night Operations', icon: '🌙', need: ['night'], what: 'Calls on a night shift pay 15% more.' },
  { id: 'pursuit', name: 'Pursuit Driving', icon: '🏁', need: ['pursuit'], what: 'Air One gets overhead sooner in your pursuits.' }
];

export function installCerts(H) {
  const S = H.S, esc = H.esc;
  const gold = (d) => !!(S.drills && S.drills[d] && S.drills[d].m === 3);
  const has = (id) => !!(S.certs && S.certs[id]);
  // earned the moment the last gold lands; the drills screen saves medals, and the game checks every few seconds
  function check() { S.certs = S.certs || {}; let got = null;
    CERTS.forEach((c) => { if (!S.certs[c.id] && c.need.every(gold)) { S.certs[c.id] = Date.now(); got = c; H.journal('Certified: ' + c.name + '.'); } });
    if (got) { H.saveS(); H.refresh(); H.banner(got.icon, 'Certified: ' + got.name, got.what); } return got; }
  // the drill names (drills.js loads only when you open the course, so they're kept here too)
  const names = { brake: 'Threshold Stop', corner: 'Cornering', skid: 'Wet Curve', back: 'Reverse Serpentine', night: 'Night Road', emerg: 'Code 3', pursuit: 'Pursuit' };
  function card() {
    return '<div class="ctCard"><small>CERTIFICATIONS</small>' + CERTS.map((c) => { const done = has(c.id), n = c.need.filter(gold).length;
      return '<div class="ctRow' + (done ? ' on' : '') + '"><span class="ctI">' + c.icon + '</span><span class="ctT"><b>' + esc(c.name) + '</b><small>' + esc(done ? c.what : 'Gold on ' + c.need.map((d) => names[d] || d).join(', ') + (c.need.length > 1 ? ' (' + n + ' of ' + c.need.length + ')' : '')) + '</small></span></div>'; }).join('') + '</div>'; }
  return { has, check, card, CERTS };
}
