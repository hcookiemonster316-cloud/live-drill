// Money that matters (owner's call, 2026-11-27: "thousands of dollars and not enough things to spend it on"). Two big
// sinks, both tied to the loop:
//   Training courses: outside training you pay for and sit through off duty. Each one is a permanent perk the game
//   already reads (citizen contacts, calls, study, driving, spotting), and each is real training Florida officers take.
//   District causes: put money into something on your beat. The district's community trust rises, dispatch passes on
//   the thank-you, and the people there remember it.
// Prices rise with rank, so money stays worth earning. Loop: your career grows and the city remembers. Reads cash and
// rank; feeds the perks (refreshGear), district trust (the trust map, tips from allies) and the radio.

export const COURSES = [
  { id: 'cit', name: 'Crisis Intervention Team (CIT)', hrs: '40 hours', base: 450, perk: { rpCit: 10 }, does: '+10% RP from citizen contacts', blurb: 'Talking someone through a mental health crisis. You learn to hear what they are actually telling you.' },
  { id: 'spanish', name: 'Spanish for Law Enforcement', hrs: '24 hours', base: 300, perk: { rpCit: 6 }, does: '+6% RP from citizen contacts', blurb: 'Commands, rights and small talk in Spanish. Half your beat stops repeating itself for you.' },
  { id: 'evoc', name: 'Advanced Driver Training', hrs: '16 hours', base: 400, perk: { drive: 6 }, does: 'The cruiser gets around 6% quicker', blurb: 'Skid pad, braking and backing at speed, on a closed course, with an instructor in the right seat.' },
  { id: 'interview', name: 'Interview and Interrogation', hrs: '24 hours', base: 500, perk: { rpCall: 8 }, does: '+8% RP from calls', blurb: 'Building rapport, reading a statement, and asking the question that opens the case.' },
  { id: 'tecc', name: 'Tactical Emergency Casualty Care', hrs: '16 hours', base: 450, perk: { rpCall: 5 }, does: '+5% RP from calls', blurb: 'Tourniquets, wound packing and moving the hurt, under pressure, before rescue gets there.' },
  { id: 'reports', name: 'Report Writing Workshop', hrs: '8 hours', base: 220, perk: { rpStudy: 10 }, does: '+10% RP from study', blurb: 'Who, what, when, where, why and how, in plain words a prosecutor can use.' }
];
export const CAUSES = [
  { id: 'courtlights', d: 0, name: 'Court lights for Founders Park', base: 700, trust: 8, thanks: 'Message from the Founders Park league: the court lights are on tonight. They asked us to say thank you.' },
  { id: 'youthroom', d: 0, name: 'Books for the Central Library youth room', base: 450, trust: 5, thanks: 'The Central Library says the youth room shelves are full. The kids made you a card. It is at the front desk.' },
  { id: 'flags', d: 1, name: 'Crossing flags for Eastside Middle', base: 300, trust: 5, thanks: 'Eastside Middle says the crossing guards have their new flags. Morning traffic is slowing down for them.' },
  { id: 'buspass', d: 1, name: 'Bus passes for the late shift at Sunrise Café', base: 550, trust: 7, thanks: 'The Sunrise Café crew says thank you for the bus passes. Nobody has to walk home at two in the morning now.' },
  { id: 'lifejackets', d: 2, name: 'Loaner life jackets at the marina', base: 600, trust: 7, thanks: 'The marina hung the new loaner life jackets by the ramp. Kids fishing off the wall are wearing them.' },
  { id: 'snacks', d: 2, name: 'After-school snacks at Riverside School', base: 400, trust: 5, thanks: 'Riverside School says the after-school program has snacks through the end of the year. Attendance is up.' },
  { id: 'meals', d: 3, name: 'Hot meals at the rail yard shelter', base: 650, trust: 7, thanks: 'The rail yard shelter served hot meals all week. The staff asked us to pass on their thanks.' },
  { id: 'vests', d: 3, name: 'Reflective vests for night-shift walkers', base: 350, trust: 5, thanks: 'Night-shift workers in the yards are walking home in the new reflective vests. Drivers can see them now.' },
  { id: 'closet', d: 4, name: 'Court clothes closet for first hearings', base: 500, trust: 6, thanks: 'The clerk says the court clothes closet is open. Nobody has to face a judge in a work uniform this week.' },
  { id: 'rides', d: 4, name: 'Rides to court for crime victims', base: 750, trust: 8, thanks: 'Victim services says the court rides started Monday. Two families made their hearings who could not before.' }
];

export function installSpend(H) {
  const S = H.S, esc = H.esc; S.courses = S.courses || {}; S.causes = S.causes || {};
  const price = (base) => Math.round(base * (1 + .3 * Math.max(0, H.rankLvl())) / 10) * 10; // rises with rank
  const money = (n) => '$' + n.toLocaleString('en-US');
  let tab = 'courses';
  function panel() {
    const cash = S.cash || 0, rows = tab === 'courses'
      ? COURSES.map((c) => { const p = price(c.base), have = !!S.courses[c.id]; return '<div class="spRow' + (have ? ' done' : '') + '"><div><b>' + esc(c.name) + '</b><small>' + esc(c.hrs) + ' · ' + esc(c.does) + '</small><p>' + esc(c.blurb) + '</p></div>' +
          (have ? '<em>Certified</em>' : '<button type="button" data-buy="c:' + c.id + '"' + (cash < p ? ' disabled' : '') + '>' + money(p) + '</button>') + '</div>'; }).join('')
      : H.districts().map((D) => { const list = CAUSES.filter((c) => c.d === D.id); if (!list.length) return ''; const open = S.unlocked.indexOf(D.id) >= 0;
        return '<h4>' + esc(D.name) + ' · trust ' + (S.trust[D.id] == null ? 50 : S.trust[D.id]) + '</h4>' + list.map((c) => { const p = price(c.base), have = !!S.causes[c.id];
          return '<div class="spRow' + (have ? ' done' : '') + '"><div><b>' + esc(c.name) + '</b><small>+' + c.trust + ' community trust in ' + esc(D.name) + '</small></div>' + (have ? '<em>Funded</em>' : !open ? '<em>Opens with ' + esc(D.name) + '</em>' : '<button type="button" data-buy="d:' + c.id + '"' + (cash < p ? ' disabled' : '') + '>' + money(p) + '</button>') + '</div>'; }).join(''); }).join('');
    H.openModal('<div class="sceneHead"><b>OFF DUTY · ' + money(cash) + '</b><h2>Training and causes</h2><p>Your pay, put to work. Courses make you better at the job for good. Causes put something back into a district, and the people there remember it.</p></div>' +
      '<div class="lkTabs"><button type="button" data-t="courses" class="' + (tab === 'courses' ? 'on' : '') + '">Training courses</button><button type="button" data-t="causes" class="' + (tab === 'causes' ? 'on' : '') + '">District causes</button></div><div class="spList">' + rows + '</div><div class="qAct"><button type="button" class="ghost" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal;
    document.querySelectorAll('.lkTabs [data-t]').forEach((b) => b.onclick = () => { tab = b.dataset.t; panel(); });
    document.querySelectorAll('[data-buy]').forEach((b) => b.onclick = () => buy(b.dataset.buy));
  }
  function buy(key) {
    const [k, id] = key.split(':');
    if (k === 'c') { const c = COURSES.find((x) => x.id === id); if (!c || S.courses[id] || !H.pay(price(c.base), c.name)) return; S.courses[id] = Date.now(); H.saveS(); H.perks(); H.stat('course'); H.sting('done');
      H.banner('🎓', 'Certified: ' + c.name, c.does + ', for good.'); }
    else { const c = CAUSES.find((x) => x.id === id); if (!c || S.causes[id] || !H.pay(price(c.base), c.name)) return; S.causes[id] = Date.now(); S.trust[c.d] = Math.min(100, (S.trust[c.d] == null ? 50 : S.trust[c.d]) + c.trust); H.saveS(); H.stat('cause'); H.sting('done');
      H.banner('🤝', 'Funded: ' + c.name, '+' + c.trust + ' community trust in ' + H.districts()[c.d].name); setTimeout(() => H.radio('Dispatch', c.thanks), 4000); }
    panel();
  }
  // the perks every course adds, for the game's perk totals
  function perks() { const out = {}; Object.keys(S.courses || {}).forEach((id) => { const c = COURSES.find((x) => x.id === id); if (c) Object.keys(c.perk).forEach((k) => { out[k] = (out[k] || 0) + c.perk[k]; }); }); return out; }
  return { panel, perks, price, buy };
}
