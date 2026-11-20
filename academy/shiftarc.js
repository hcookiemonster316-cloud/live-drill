// A shift with a shape. The pacing director in variety.js keeps the next call from piling on; this plans the whole shift:
// a calm start, a rising middle, one peak, then a breather, and around again for the back half. Dispatch says out loud
// when the night turns. Each shift also keeps a short record (calls, facts, trust, RP) that the next shift's briefing
// reads back to you, with one thing to work on.
const rnd = (a) => a[(Math.random() * a.length) | 0];
// one shift's curve, slot by slot (a slot is one dispatched call)
const ARC = ['calm', 'calm', 'rise', 'rise', 'peak', 'cool'];
// how strongly each phase leans toward each priority (1 = emergency, 3 = routine)
const LEAN = { calm: { 1: .25, 2: .9, 3: 2.2 }, rise: { 1: .6, 2: 2, 3: 1 }, peak: { 1: 3.5, 2: 1.4, 3: .4 }, cool: { 1: .2, 2: .8, 3: 2.5 } };
const PURSUIT = { calm: .3, rise: 1, peak: 2, cool: .2 };
// what dispatch says when the night changes
const TURN = {
  calm: ['Quiet start tonight. Take your time and learn your beat.', 'Slow so far. Good night to check your car and your streets.'],
  rise: ['It\'s starting to pick up. Calls are holding.', 'Busier now. Keep your eyes up.'],
  peak: ['All units, it\'s getting busy. Stay sharp and drive safe.', 'Every unit\'s tied up. Next one could be a big one.'],
  cool: ['Things are settling down. Take a breath when you can.', 'Board\'s clearing. Good work out there.']
};

export function installShiftArc(H) {
  const S = H.S; S.arc = S.arc || { slot: 0, snap: null, last: null };
  const A = S.arc;
  const phase = () => ARC[A.slot % ARC.length];
  const snapNow = () => ({ calls: S.calls || 0, xp: S.xp || 0, facts: H.factsDone(), trust: Object.assign({}, S.trust || {}), at: Date.now() });

  // a new shift: what the last one added up to, then a fresh curve
  function onShift() {
    if (A.snap) {
      const n = snapNow(), tr = Object.keys(n.trust).map((k) => [+k, (n.trust[k] || 50) - (A.snap.trust[k] != null ? A.snap.trust[k] : 50)]).filter((x) => Math.abs(x[1]) >= 1);
      A.last = { calls: n.calls - A.snap.calls, xp: n.xp - A.snap.xp, facts: n.facts - A.snap.facts, trust: tr, peaks: A.peaks || 0 };
      if (!A.last.calls && !A.last.facts) A.last = null; // nothing happened; don't brief an empty shift
    }
    A.snap = snapNow(); A.slot = 0; A.peaks = 0; A.said = ''; H.saveS();
  }
  // weight for a candidate call in the director's pick
  const bias = (c) => (LEAN[phase()] || {})[c[1]] || 1;
  const pursuitMult = () => PURSUIT[phase()] || 1;
  // a call went out: move along the curve, and say so when the night turns
  function onDispatch(c) {
    const ph = phase(); if (ph === 'peak' && c && c.prio === 1) A.peaks = (A.peaks || 0) + 1;
    if (A.said !== ph) { A.said = ph; if (A.slot > 0) setTimeout(() => H.radio('Dispatch', rnd(TURN[ph])), 2600); }
    A.slot++; H.saveS();
  }
  // the top of the briefing: last shift in numbers, and one thing to work on
  function summaryHTML() {
    const l = A.last; if (!l) return '';
    const bits = [];
    bits.push('<li class="memRow good"><i>📻</i><span>' + l.calls + ' call' + (l.calls === 1 ? '' : 's') + ' cleared' + (l.peaks ? ', including ' + (l.peaks === 1 ? 'the big one' : l.peaks + ' big ones') : '') + '.</span></li>');
    if (l.facts > 0) bits.push('<li class="memRow good"><i>🧠</i><span>' + l.facts + ' ' + (l.facts === 1 ? 'fact' : 'facts') + ' from the chapter nailed down.</span></li>');
    l.trust.slice(0, 2).forEach(([d, v]) => bits.push('<li class="memRow ' + (v > 0 ? 'good' : 'bad') + '"><i>' + (v > 0 ? '🤝' : '📋') + '</i><span>' + H.esc(H.districtName(d)) + (v > 0 ? ' trusts you a little more (+' : ' trusts you a little less (') + Math.round(v) + ').</span></li>'));
    const w = H.focus();
    return '<ul class="memList arcList">' + bits.join('') + '</ul>' + (w ? '<p class="fact arcFocus">🎯 <b>Work on tonight:</b> ' + H.esc(w) + '</p>' : '');
  }
  // last shift is read back once; after that the briefing is only what people remember
  const takeSummary = () => { const h = summaryHTML(); if (h) { A.last = null; H.saveS(); } return h; };
  return { onShift, bias, pursuitMult, onDispatch, takeSummary, get phase() { return phase(); }, get dbg() { return { slot: A.slot, phase: phase(), last: A.last, snap: A.snap }; } };
}
