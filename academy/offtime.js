// Limited off-duty time (Action plan, Step D). Between shifts you get one evening, and you choose who it goes to:
//   your partner  (a late dinner: their trust in you grows, and they bring it up at the start of the next shift)
//   a regular     (coffee with someone on your beat: the friendship grows, and they call in something they saw)
//   study group   (Navarro and Pike quiz each other on your weakest lesson: two knowledge checks, at most)
//   rest          (you come in fresh: calls wait longer for you all next shift)
// One evening, one choice. What you keep choosing is counted, and the career reads it later (who shows up for you on
// the final shift). Everything here reuses existing systems: partner trust, regulars' friendship, the review queue,
// the radio and the end-of-watch journal.

export function installOffTime(H) {
  const S = H.S, esc = H.esc;
  const N = () => (S.offN = S.offN || { partner: 0, regular: 0, study: 0, rest: 0 });
  // the regular you know best who is still around this district
  function bestRegular() { const ids = Object.keys(S.npc || {}).filter((id) => S.npc[id] > 0).sort((a, b) => S.npc[b] - S.npc[a]); for (const id of ids) { const n = H.npc(id); if (n) return n; } return null; }
  function options() {
    const out = [], pt = H.partner();
    if (pt) out.push({ k: 'partner', icon: '🍽️', t: 'Late dinner with ' + pt.name, sub: 'They\'ll trust you more.', who: pt });
    const r = bestRegular(); if (r) out.push({ k: 'regular', icon: '☕', t: 'Coffee with ' + r.name, sub: 'The friendship grows.', who: r });
    out.push({ k: 'study', icon: '📚', t: 'Study group with Navarro and Pike', sub: 'Two questions on your weakest lesson.' });
    out.push({ k: 'rest', icon: '🛏️', t: 'Go home and sleep', sub: 'Calls wait longer for you next shift.' });
    return out;
  }
  // the evening plays out, then the next shift starts
  function play(o, next) {
    N()[o.k]++; (S.offLog = S.offLog || []).push({ sh: H.shiftNo(), k: o.k, who: o.who ? o.who.name : null }); if (S.offLog.length > 60) S.offLog.shift();
    S.offNext = { k: o.k, who: o.who ? o.who.name : null, id: o.who ? o.who.id : null, pk: o.who ? o.who.k : null }; H.saveS();
    if (o.k === 'partner') { const m = H.pmem(o.who.k); m.t = Math.min(100, m.t + 4); H.dialogue([['narr', 'The diner on Bay Street, the booth by the window. Nobody talks about work for the first ten minutes.'], [o.who.id, o.who.line]], next); return; }
    if (o.k === 'regular') { S.npc[o.who.id] = Math.min(6, (S.npc[o.who.id] || 0) + 1); H.saveS(); H.dialogue([['narr', 'Coffee at the counter. ' + o.who.name + ' does most of the talking.'], [o.who.id, 'You\'re one of the good ones. I\'ll keep an eye out on my end of the block.']], next); return; }
    if (o.k === 'study') { const les = H.weakLesson(), qs = H.facts([les], 2); const L = [['navarro', 'Okay. Flash round. Your worst lesson, because Pike says you\'re dodging it.'], ['pike', 'I said that once.']];
      qs.forEach((q, i) => L.push(['q', q, i ? 'pike' : 'navarro'])); L.push(['navarro', 'Same time next week. Bring snacks this time.']); H.dialogue(L, next); return; }
    H.dialogue([['narr', 'Phone face down. Eight hours. You wake up before the alarm.']], next);
  }
  function choose(next) {
    const ops = options();
    H.openModal('<div class="sceneHead"><b>OFF THE CLOCK</b><h2>One evening before the next shift</h2><p>Who does it go to?</p></div><div class="otList">' + ops.map((o, i) => '<button type="button" class="otPick" data-i="' + i + '"><span class="otIco">' + o.icon + '</span><span class="otT"><b>' + esc(o.t) + '</b><small>' + esc(o.sub) + '</small></span></button>').join('') + '</div>');
    document.querySelectorAll('.otPick').forEach((b) => b.onclick = () => { const o = ops[+b.dataset.i]; H.closeModal(); play(o, next); });
  }
  // the next shift: the evening shows up in the city
  function onShiftStart() { const o = S.offNext; if (!o) return; S.offNext = null; S.rested = o.k === 'rest' ? 1 : 0; H.saveS();
    if (o.k === 'partner' && o.who) H.later(() => H.radio(o.who, 'Thanks for last night. Pie was terrible. Worth it.'), 6000);
    if (o.k === 'regular' && o.who) H.later(() => { H.radio('Dispatch', o.who + ' called the desk for you. Says something on their block looked off. Check the map.'); H.tipNear(); }, 9000);
    if (o.k === 'study') H.later(() => H.toast('📚 Navarro texted: "You got this today."'), 5000);
    if (o.k === 'rest') H.later(() => H.toast('🛏️ Rested: calls wait longer for you this shift.'), 3000); }
  const callWaitBonus = () => (S.rested ? 30 : 0);
  return { choose, onShiftStart, callWaitBonus, counts: () => Object.assign({}, N()), options };
}
