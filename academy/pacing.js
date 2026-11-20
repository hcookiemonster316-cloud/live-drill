// Pacing for tone, not only intensity. After a heavy call (a death notification, a weapon call, a pursuit or a talk-down
// that went wrong) the next moment on the street is a light one: a short breather with your partner or someone on your
// beat. And hints, so no case is ever lost: when the case you're on hasn't moved for a while, your partner says over the
// radio exactly what's holding it up (another district, not enough facts yet, or where that person is right now).
const rnd = (a) => a[(Math.random() * a.length) | 0];
// lessons whose calls weigh on you: emergency runs (crashes with injuries, officer needs help) and pursuits
const HEAVY_LES = { 10: 1, 11: 1 };
const HEAVY_DEED = { deeslose: 1, purbad: 1, harsh: 1 };
const STALL = 300; // seconds of free patrol on the same step before a hint

export function installPacing(H) {
  const S = H.S; S.pace = S.pace || { seen: {} };
  // ---------- breathers ----------
  let due = 0, cool = 0, why = '';
  function heavy(reason) { if (cool > 0) return; due = 25; why = reason || ''; }
  const afterCall = (c) => { if (c && (c.prio === 1 || HEAVY_LES[c.les])) heavy('call'); };
  const onNote = (d) => { if (HEAVY_DEED[d.k]) heavy(d.k); };
  const SCENES = {
    coffee: (p, sp) => [['narr', p + ' pulls into the lot of an all-night diner without asking.'], [sp, 'Ten minutes. Coffee. That last one was a lot, and the radio knows where to find us.'],
      ['choice', [{ t: 'Black, no sugar.', reply: [[sp, 'Of course you are. Cop coffee it is.']] }, { t: 'Whatever\'s sweetest on the menu.', reply: [[sp, 'Now you\'re talking. Two of whatever has whipped cream.']] }], 'Coffee order'],
      ['narr', 'For ten minutes, nobody needs anything from you. The waitress refills your cup without asking.']],
    dog: (p, sp) => [['narr', 'A golden retriever trots out of an open gate, a tennis ball in its mouth, and drops it at your feet.'], [sp, 'Well. You\'ve been chosen. You can\'t say no to that face.'],
      ['choice', [{ t: 'Throw the ball. Once. Okay, three times.', reply: [['narr', 'The dog brings it back every time, proud as anything. Its owner jogs up, laughing and apologizing.']] }, { t: 'Walk him back to his yard.', reply: [['narr', 'He leans on your leg the whole way. The owner hands you a dog treat "for next time."']] }], 'The dog waits'],
      [sp, 'Best call of the night, and it wasn\'t even a call.']],
    kid: (p, sp) => [['narr', 'A kid on the sidewalk is holding a toy police car and staring at yours.'], [sp, 'You\'ve got a fan. Go on.'],
      ['choice', [{ t: 'Show her the lights for a second.', reply: [['narr', 'You flip the light bar on and off. She shrieks with joy. Her dad mouths "thank you."']] }, { t: 'Give her a junior officer sticker.', reply: [['narr', 'She sticks it to her forehead and salutes. You salute back.']] }], 'Your fan'],
      [sp, 'Remember that one. On the hard nights, remember that one.']],
    talk: (p, sp) => [['narr', 'Your partner parks facing the water and turns the engine off.'], [sp, 'You okay? Calls like that stay with you. It\'s normal, and it\'s okay to say so.'],
      ['choice', [{ t: 'Honestly? It got to me a little.', reply: [[sp, 'Good. It should. The ones it doesn\'t get to worry me. Peer support is down the hall from roll call, any time. I\'ve used it.']] }, { t: 'I\'m fine. Can we just sit a minute?', reply: [[sp, 'We can sit as long as the radio lets us.'], ['narr', 'The water is quiet. Neither of you says anything for a while, and that\'s fine.']] }], 'Your partner waits'],
      [sp, 'Okay. Whenever you\'re ready, we\'ll get back to it.']],
    friend: (p, sp, f) => [['narr', f.name + ' spots your car and waves you over, already holding something wrapped in foil.'], [f.id, 'You look like you had a rough one. Here. On the house. Don\'t argue.'],
      ['choice', [{ t: 'Thank you. Really.', reply: [[f.id, 'Go on, eat. The city can wait five minutes.']] }, { t: 'You didn\'t have to do that.', reply: [[f.id, 'I know. That\'s what makes it nice.']] }], f.name],
      ['narr', 'It\'s still warm. For a minute, the night feels smaller.']]
  };
  function friendHere() { const did = H.did(); const f = (H.NPCS || []).filter((n) => n.d === did && (S.npc || {})[n.id] >= 3).sort((a, b) => S.npc[b.id] - S.npc[a.id])[0]; return f ? { id: H.sayAs('pace_' + f.id, { name: f.name, icon: f.icon, role: f.role, look: f.look }), name: f.name } : null; }
  function breather() {
    const pt = H.partner(), sp = pt ? pt.id : 'castillo', pn = pt ? (pt.p.name || 'Your partner') : 'Sgt. Castillo', f = friendHere();
    const keys = Object.keys(SCENES).filter((k) => (k !== 'friend' || f) && (k !== 'talk' || why === 'notify' || why === 'deeslose' || Math.random() < .5));
    const k = keys.slice().sort((a, b) => (S.pace.seen[a] || 0) - (S.pace.seen[b] || 0))[0] || 'coffee'; // the one you've seen least
    S.pace.seen[k] = Date.now(); H.saveS(); cool = 480;
    H.dialogue(SCENES[k](pn, sp, f), () => { if (H.mood) H.mood(4); H.saveS(); }, { kicker: 'BREATHER' });
  }
  // ---------- hints ----------
  let stallT = 0, stallK = '', hinted = 0;
  function hint() {
    const did = H.did(), tq = S.track && S.track !== 'main' ? H.sideQ(S.track) : null;
    if (tq && tq.d !== did && !H.sideClosed(tq)) return 'Your tracked case, ' + tq.title + ', is in ' + H.districtName(tq.d) + '. Head for the district line when you\'re ready.';
    const a = H.activeQ(); if (!a) return 'No open case in ' + H.districtName(did) + ' right now. Your Path in the menu shows the next step.';
    if (!a.side && H.LF && H.LF.mainNeed) { const need = H.LF.mainNeed(a.q, a.i), have = H.factsHere(); if (have < need) return 'The next part of ' + a.title + ' opens at ' + need + ' facts in ' + H.districtName(did) + '. You have ' + have + '. Calls, drills and the people on your beat all count.'; }
    const st = a.step || {}, t = H.stepTarget(), place = t && t.lot ? (t.lot.name || t.lot.kind) : st.at;
    if (st.npc) { const r = H.regs().find((x) => x.n.id === st.npc), n = (H.NPCS || []).find((x) => x.id === st.npc); const nm = n ? n.name : 'The person you need';
      if (!r) return nm + ' isn\'t out on the street yet. Learn a few more facts in ' + H.districtName(did) + ' and they\'ll turn up.';
      return nm + ' is at ' + (r.lot && r.lot.name ? r.lot.name : place) + ' right now. Follow the marker on your map.'; }
    return (st.goal ? st.goal.replace(/\.$/, '') + '. ' : '') + (place ? 'It\'s at ' + place + '. Follow the marker on your map.' : 'Follow the marker on your map.');
  }
  let last = '';
  function say(text) { last = text; const pt = H.partner(), who = pt ? (pt.p.name || 'Partner').replace(/^Ofc\. /, '') : 'Castillo'; H.radio(who, text); if (H.objectiveFlash) H.objectiveFlash(); }
  function tick(dt) {
    if (due > 0) { due -= dt; if (due <= 0) { if (H.free()) breather(); else due = 4; } }
    if (cool > 0) cool -= dt;
    if (!H.free()) return; const a = H.activeQ(), k = (a ? a.title + '#' + a.i : 'none') + '|' + H.did() + '|' + (S.track || '');
    if (k !== stallK) { stallK = k; stallT = 0; hinted = 0; return; }
    stallT += dt; if (stallT >= STALL * (hinted + 1) && hinted < 2) { hinted++; say(hint()); }
  }
  return { afterCall, onNote, heavy, breather, hint, say, tick, SCENES, get lastHint() { return last; }, get dbg() { return { due, cool, stallT, hinted, free: H.free() }; } };
}
