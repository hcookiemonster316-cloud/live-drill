// Districts whose people disagree. Every district has two community groups with real, reasonable concerns that pull
// against each other (speed and visibility against time and care, mostly). They hear about the same calls and judge
// them differently, so a district's opinion of you is never one number. Good policy never costs you overall: ending a
// risky pursuit or talking someone down always wins more than it loses; hard or careless work loses with everyone.
// Once per academy day both groups' representatives catch you together and you choose whose concern comes first.
export const GROUPS = [
  [{ name: 'Downtown Business Association', short: 'the shop owners', rep: 'Linda Park', icon: '🏪', wants: 'visible patrols and fast answers to shoplifting and disorder' },
   { name: 'Founders Plaza Outreach', short: 'the outreach workers', rep: 'Marcus Webb', icon: '🧺', wants: 'patience with people on the street, and connecting them to help instead of moving them along' }],
  [{ name: 'Maple Court Tenants', short: 'the tenants', rep: 'Gloria Reyes', icon: '🏘', wants: 'calm calls, respect at the door, and officers who follow through' },
   { name: 'Eastside Parents\' Group', short: 'the parents', rep: 'Dana Whitfield', icon: '🚸', wants: 'traffic safety by the school and officers seen at drop-off and pickup' }],
  [{ name: 'Riverwalk Merchants', short: 'the merchants', rep: 'Tom Alvarez', icon: '🛍', wants: 'quick handling so the tourists keep coming' },
   { name: 'River Market Old-Timers', short: 'the old-timers', rep: 'Mae Collins', icon: '🎣', wants: 'officers who stop, listen and learn people\'s names' }],
  [{ name: 'Business Park Owners', short: 'the owners', rep: 'Richard Hale', icon: '🏢', wants: 'fast alarm response and less theft from the yards' },
   { name: 'Millworkers Union Hall', short: 'the union hall', rep: 'Sal Romano', icon: '🔧', wants: 'fair treatment for workers in plant disputes, not taking the company\'s side' }],
  [{ name: 'Courthouse Bar', short: 'the lawyers', rep: 'Attorney Joan Liu', icon: '⚖', wants: 'by-the-book stops, clean records and everyone\'s rights respected' },
   { name: 'Magnolia Terrace Residents', short: 'the residents', rep: 'Mr. Otis Grant', icon: '🏡', wants: 'help that comes quickly and kindly, without all the paperwork talk' }]
];
// how each group weighs a deed from memory.js: [first group, second group]. In every district the first group leans
// toward speed and visibility, the second toward time and care.
const WEIGH = { help: [1, 3], quick: [1, -2], harsh: [-1, -3], deeswin: [1, 3], deeslose: [-2, -1], purterm: [-1, 3], purbad: [-1, -3], kept: [0, 3], broke: [-1, -3] };
// what someone in each group says about you: by how they see you, and how the other group sees you
const SAY = {
  hi: ["{me} are behind you. Tell your sergeant.", "Ask anyone with {me}. You're one of the good ones."],
  mid: ["{me} are still making up their minds about you.", "Some days {me} like what they see. Some days not."],
  lo: ["{me} have a list of complaints about you. It's getting longer.", "Ask {me} about you. Actually, don't."],
  split: ["{them} love you. We'd like to see you stay a little longer.", "Funny. {them} think you're great. We're not there yet.", "{them} keep telling us how good you are. We want to see it for ourselves."]
};
const rnd = (a) => a[(Math.random() * a.length) | 0];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

export function installGroups(H) {
  const S = H.S; S.grp = S.grp || {};
  const of = (did) => (S.grp[did] = S.grp[did] || { v: [50, 50], met: 0, last: [0, 0] });
  const clamp = (v) => Math.max(0, Math.min(100, v));
  // a deed is remembered: both groups in that district hear about it and weigh it their own way
  function onNote(d) { const w = WEIGH[d.k]; if (!w || d.did == null || !GROUPS[d.did]) return; const g = of(d.did); g.v = g.v.map((v, i) => clamp(v + w[i])); g.last = w.slice(); }
  const tierOf = (v) => (v >= 65 ? 'hi' : v <= 35 ? 'lo' : 'mid');
  function lineFor(did, i) {
    const g = of(did), me = GROUPS[did][i].short, them = GROUPS[did][1 - i].short, v = g.v[i], o = g.v[1 - i];
    const pool = o - v >= 15 ? SAY.split : SAY[tierOf(v)];
    return cap(rnd(pool).replace(/\{me\}/g, me).replace(/\{them\}/g, cap(them)));
  }
  // the "who thinks what" section on the Community Trust map
  function section(did) {
    if (!GROUPS[did]) return ''; const g = of(did);
    return '<p class="finLbl">Who thinks what</p><ul class="memList grpList">' + GROUPS[did].map((G, i) => '<li class="memRow ' + (g.v[i] >= 65 ? 'good' : g.v[i] <= 35 ? 'bad' : '') + '"><i>' + G.icon + '</i><span><b>' + H.esc(G.name) + '</b> · ' + Math.round(g.v[i]) + '/100<span class="grpBar"><span style="width:' + Math.round(g.v[i]) + '%"></span></span><small>Wants ' + H.esc(G.wants) + '.</small><small class="grpSay">"' + H.esc(lineFor(did, i)) + '"</small></span></li>').join('') + '</ul>' +
      '<p class="calClass">They hear about the same calls and judge them differently. Ending a risky pursuit, talking someone down and keeping your word always win more than they lose.</p>';
  }
  // the meeting: both representatives catch you on the street, once per academy day, and you choose whose concern goes first
  let mT = 150;
  function tick(dt) {
    const did = H.did(); if (!GROUPS[did]) return; const g = of(did), day = H.day();
    if (g.met >= day) return; mT -= dt; if (mT > 0) return; mT = 20; if (!H.free()) return;
    mT = 150; g.met = day; meeting(did);
  }
  function meeting(did) {
    const [A, B] = GROUPS[did], g = of(did), a = H.sayAs('grp' + did + 'a', { name: A.rep, icon: A.icon, role: A.name }), b = H.sayAs('grp' + did + 'b', { name: B.rep, icon: B.icon, role: B.name });
    const move = (da, db) => () => { g.v = [clamp(g.v[0] + da), clamp(g.v[1] + db)]; H.saveS(); };
    H.dialogue([['narr', 'Two people wave you down at the same time. They clearly know each other, and clearly don\'t agree.'],
      [a, 'Officer, a minute? The ' + A.name + ' wants ' + A.wants + '. That\'s what keeps this district running.'],
      [b, 'With respect, ' + A.rep.replace(/^(Attorney|Mr\.|Mrs\.|Ms\.|Dr\.)\s+/, '').split(' ')[0] + ', that\'s not the whole district. The ' + B.name + ' wants ' + B.wants + '.'],
      [a, 'We both want it safe. We just don\'t agree on what that looks like.'],
      ['choice', [
        { t: 'I hear the ' + A.name + '. That comes first this week.', reply: [[a, 'Thank you. We\'ll notice.'], [b, 'Of course you do.']], fx: move(4, -2) },
        { t: 'The ' + B.name + ' has a point. I\'ll start there.', reply: [[b, 'Thank you. That means something here.'], [a, 'We\'ll see how that goes.']], fx: move(-2, 4) },
        { t: 'Both. Let\'s meet at the station and work out a plan together.', reply: [[a, 'Fine. Together.'], [b, 'Together. I can live with that.']], fx: move(1, 1) },
        { t: 'Not now, I\'m sorry. Catch me another day.', reply: [[a, 'Another day, then.']], fx: () => { g.met = 0; mT = 600; H.saveS(); } }
      ], 'Whose concern comes first?']], () => { H.saveS(); });
  }
  // groups who think highly of you come to your graduation (finale.js)
  function backers() { const out = []; GROUPS.forEach((gs, did) => { const g = S.grp[did]; if (!g) return; gs.forEach((G, i) => { if (g.v[i] >= 70) out.push({ name: G.name, icon: G.icon, why: 'they trust you in ' + H.districtName(did) }); }); }); return out; }
  return { onNote, section, tick, meeting, backers, lineFor, of, GROUPS };
}
