// Learning drives everything. You move forward in this game by learning the chapter, fact by fact:
// - side cases open one at a time as you master more of the district's facts (the first is always open)
// - the main story asks for a growing share of the district's facts; reach a step early and the person there quizzes you on the spot
// - the second wave of regulars shows up as you learn (anyone a story needs is always there)
// - you can't walk forever without a fact check: the training coordinator radios in, or someone on the street stops you
export function installLearnFlow(H) {
  const { S, L } = H, rnd = (a) => a[Math.floor(Math.random() * a.length)];
  // fact counts per district, cached: recounted when you answer something (and every few seconds, in case a save loads)
  let FC = {}, fcT = 0; const dFacts = (d) => { const now = performance.now(); if (now - fcT > 3000) { FC = {}; fcT = now; } return FC[d] || (FC[d] = L.factProgress(S, H.DISTRICTS[d].lessons)); };
  const fresh = () => { FC = {}; fcT = performance.now(); };
  // side cases: the k-th case in a district needs k/n of 90% of that district's facts
  let order = null;
  const sideOrder = () => { if (order) return order; order = {}; const by = {}; H.SIDE.forEach((q, i) => (by[q.d] = by[q.d] || []).push([q, i]));
    Object.values(by).forEach((list) => { list.sort((a, b) => (a[0].req ? a[0].req[1] : 0) - (b[0].req ? b[0].req[1] : 0) || a[1] - b[1]); list.forEach(([q], k) => { order[q.id] = [k, list.length]; }); }); return order; };
  const sideNeed = (q) => { const o = sideOrder()[q.id]; if (!o || !o[0]) return 0; return Math.round(dFacts(q.d).total * .9 * o[0] / o[1]); };
  const sideFactsOK = (q) => dFacts(q.d).done >= sideNeed(q);
  // the main story: step i of a chapter needs i/n of 45% of the district's facts
  const mainNeed = (c, i) => (c.side || !c.steps) ? 0 : Math.round(dFacts(c.d).total * .45 * i / c.steps.length);
  // regulars: the second wave arrives at 10%, 20% ... 60% of the district's facts; anyone a story needs is always there
  const NEW = new Set(H.NPCS2.map((n) => n.id));
  const npcNeed = (n) => { if (!NEW.has(n.id)) return 0; const peers = H.NPCS2.filter((x) => x.d === n.d), r = peers.findIndex((x) => x.id === n.id); return Math.round(dFacts(n.d).total * .1 * (r + 1)); };
  const storyNeeds = (id) => H.CHAPTERS.concat(H.SIDE).some((q) => q.steps && q.steps.some((st) => st.who === id || st.npc === id) && !(q.side ? H.sideClosed(q) : (S.story[q.d] || 0) >= q.steps.length));
  const npcVisible = (n) => storyNeeds(n.id) || dFacts(n.d).done >= npcNeed(n);
  // what's locked next, for the case tracker
  function nextLock(d) {
    const have = dFacts(d).done, locked = H.SIDE.filter((q) => q.d === d && S.side[q.id] == null && !sideFactsOK(q) && H.sideOpenNoFacts(q)).map(sideNeed).sort((a, b) => a - b)[0];
    const npc = H.NPCS2.filter((n) => n.d === d && !npcVisible(n)).map(npcNeed).sort((a, b) => a - b)[0];
    return { have, total: dFacts(d).total, nextCase: locked, nextNpc: npc };
  }
  // when a fact count crosses a threshold, say what just opened up
  let lastDone = -1;
  function checkUnlocks() {
    fresh();
    const d = H.W().did, have = dFacts(d).done; if (lastDone < 0) { lastDone = have; return; } if (have === lastDone) return;
    const was = lastDone; lastDone = have;
    const cases = H.SIDE.filter((q) => q.d === d && S.side[q.id] == null && H.sideOpenNoFacts(q)).filter((q) => { const n = sideNeed(q); return n > was && n <= have; });
    const ppl = H.NPCS2.filter((n) => n.d === d).filter((n) => { const k = npcNeed(n); return k > was && k <= have && !storyNeeds(n.id); });
    if (cases.length) H.banner('📁', 'New case unlocked', cases.map((q) => q.title).join(', '));
    if (ppl.length) { H.banner('👋', 'Someone new in ' + H.DISTRICTS[d].name, ppl.map((n) => n.name).join(', ') + ' is around now. Go say hi.'); H.placeRegulars(); }
  }
  // the story waits for you to learn: whoever's at the step quizzes you instead
  function gateStep(c, i, who, done) {
    const need = mainNeed(c, i), have = dFacts(c.d).done; if (have >= need) return false;
    const short = need - have, sp = who || 'castillo', here = !!who;
    const qs = L.pickFacts(S, H.DISTRICTS[c.d].lessons, 3, { wide: false });
    H.dialogue([[sp, (here ? '' : '(over the radio) ') + rnd(['Before we go any further, I need you sharper on this district. You\'re ' + short + ' fact' + (short > 1 ? 's' : '') + ' short. Let\'s work on it right now.', 'Not yet. You need ' + short + ' more fact' + (short > 1 ? 's' : '') + ' down before I can trust you with the next part. Answer these for me.'])]].concat(qs.map((q) => ['q', q, sp]), [['fx', () => {}], [sp, (here ? '' : '(over the radio) ') + 'Keep going like that. Field checks, calls and talking to people all count. Come back when you\'re ready.']]),
      () => { checkUnlocks(); if (done) done(); }, { kicker: 'FACT CHECK · ' + short + ' TO GO', focus: [H.P().x, H.P().y] });
    return true;
  }
  // you can't wander forever without a fact check
  let idle = 0; const COORD = H.sayAs('coord', { name: 'Ofc. Dana Reid', icon: '📋', role: 'Training coordinator' });
  const contacts = [['Mrs. Tran', '👵', 'Excuse me, officer? Sorry. My grandson\'s in the academy and he asked me this, and I didn\'t know.'], ['Devon', '🙋', 'Hey, officer! Settle a bet for me and my friend real quick.'], ['Mr. Haskell', '🧔', 'Officer, I read something in the paper this morning and I want to make sure I understood it right.'], ['Kayla', '🧑‍🎓', 'Hi! I\'m doing a criminal justice class at the college. Can I ask you something?'], ['Ms. Patel', '💁', 'Officer, quick question, if you\'ve got a second. My son wants to be a cop.'], ['Luis', '🧑', 'Hey, you\'re a cop, right? I always wondered about this.']];
  function fieldCheck() {
    const d = H.W().did, coord = Math.random() < .5, qs = L.pickFacts(S, H.DISTRICTS[d].lessons, coord ? 2 : 1, { wide: true }); if (!qs.length) return;
    let sp, open;
    if (coord) { sp = COORD; open = [[sp, rnd(['Cadet, it\'s Reid from training. Got a minute? Two quick ones for you.', 'Hey, it\'s Reid. Your exam\'s coming, so let\'s keep you sharp. Ready?', 'Reid here. I\'m checking in on everybody in your class. Two questions, then I\'ll let you go.'])]]; }
    else { const c = rnd(contacts); sp = H.sayAs('fc_' + c[0].replace(/\W/g, ''), { name: c[0], icon: c[1], role: 'Field contact' }); open = [[sp, c[2]]]; H.stat('fieldContacts'); }
    H.stat('fieldChecks');
    H.dialogue(open.concat(qs.map((q) => ['q', q, sp]), [[sp, coord ? rnd(['That\'s all I needed. Stay safe out there.', 'Good. I\'ll check back with you later.']) : rnd(['Thanks, officer. That really helps.', 'Huh. I didn\'t know that. Thank you!', 'Okay! I\'m telling my friend he owes me five bucks.'])]]),
      (r) => { if (r && r.right) H.award(r.right * 15, coord ? 'training check' : 'field contact'); checkUnlocks(); }, { kicker: coord ? 'TRAINING COORDINATOR' : 'FIELD CONTACT', focus: [H.P().x, H.P().y] });
  }
  function tick(dt) {
    if (!H.free()) return; if (H.moving()) idle += dt; // counts only time spent moving around freely
    if (idle >= (S.cfg && S.cfg.checkEvery || 70)) { idle = 0; fieldCheck(); }
  }
  const answered = () => { idle = Math.max(0, idle - 45); fresh(); };
  return { sideFactsOK, sideNeed, mainNeed, npcVisible, npcNeed, nextLock, gateStep, checkUnlocks, tick, answered, fieldCheck };
}
