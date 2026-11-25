// Sergeant mode (Action plan, Step D). Late in a career (Vice President rank and up) roll call offers the board: once a
// shift you run three holding calls as the sergeant. You assign your officers, each to the call that fits them, then
// read what came back. One report always lands on your desk to sign, and signing it is a knowledge check from that
// call's lesson: catch the mistake and it goes back for a rewrite; miss it and the report goes through as written.
// Assignments have consequences you live with: an officer you set up to fail trusts you less and says so, a bad fit
// on a people call costs the block's trust, and the night goes in your journal.

const SQUAD = [
  { k: 'walsh', key: 'steady: roads, people · slow', name: 'Walsh', icon: '👮', good: ['road', 'people'], weak: ['speed'], ok: 'Took his time, did it right.', bad: { speed: 'Got there late. The scene had moved on without him.', any: 'Did it right, but slow. Dispatch asked twice where he was.' } },
  { k: 'park', key: 'fast · loses people', name: 'Park', icon: '👮', good: ['speed'], weak: ['people'], ok: 'First car there, and he kept his head.', bad: { people: 'Came in hot and talked over everybody. It got louder before it got quiet.', any: 'Rushed it. He missed something he\'ll hear about.' } },
  { k: 'pike', key: 'fast: roads · sloppy reports', name: 'Pike', icon: '🕶️', good: ['speed', 'road'], weak: ['paper'], ok: 'Fast and sharp. Even the report was on time.', bad: { paper: 'Handled the scene fine. The report reads like he wrote it in the car with one hand.', any: 'Showed off a little. The caller wasn\'t impressed.' } },
  { k: 'navarro', key: 'reports, people · slow', name: 'Navarro', icon: '📚', good: ['paper', 'people'], weak: ['speed'], ok: 'By the book, every line of it.', bad: { speed: 'Everything right, two minutes too slow. The caller noticed.', any: 'Stiff with the caller. Right on paper, cold in person.' } }
];
const TAG = (t, prio) => { const out = []; if (/noise|dispute|welfare|complain|shout|angry|neighbor|crowd|kid|lost|drunk|argu/i.test(t)) out.push('people'); if (/crash|fender|traffic|car\b|vehicle|road|tire|driv|lane|speed|signal|pursuit|tow/i.test(t)) out.push('road');
  if (/warrant|theft|report|stolen|burglar|fraud|transport|inspect|book/i.test(t)) out.push('paper'); if (prio <= 1) out.push('speed'); if (!out.length) out.push('road'); return out; };

export function installSergeant(H) {
  const S = H.S, esc = H.esc;
  const st = () => (S.sgt = S.sgt || { runs: 0, good: 0, bad: 0, caught: 0, last: -1 });
  const can = () => H.rankLvl() >= 6 && st().last !== H.shiftNo();
  // three different calls from this district's lessons, spread across lessons when there are enough of them
  function board() { const all = []; H.lessons().forEach((les) => (H.calls(les) || []).forEach((c) => all.push({ les, title: c[0], prio: c[1], tags: TAG(c[0], c[1]) })));
    all.sort(() => Math.random() - .5); const out = [], usedL = new Set(); for (const pass of [0, 1]) for (const c of all) { if (out.length === 3) break; if (out.includes(c) || (pass === 0 && usedL.has(c.les))) continue; out.push(c); usedL.add(c.les); }
    return out; }
  function fit(o, c) { let f = 0; c.tags.forEach((t) => { if (o.good.includes(t)) f++; if (o.weak.includes(t)) f -= 2; }); return f; }
  function open() {
    const calls = board(); if (!calls.length) return H.toast('Nothing holding right now.'); const asg = {}; st().last = H.shiftNo(); H.saveS();
    const draw = () => { const used = new Set(Object.values(asg));
      H.openModal('<div class="sceneHead"><b>SERGEANT · THE BOARD</b><h2>Three calls holding</h2><p>Put the right officer on each one.</p></div><div class="sgKey">' + SQUAD.map((o) => '<span><b>' + esc(o.name) + '</b> ' + esc(o.key) + '</span>').join('') + '</div><div class="sgList">' + calls.map((c, i) => '<div class="sgCall"><div class="sgT"><b>' + (c.prio <= 1 ? 'Priority 1 · ' : c.prio === 2 ? 'Priority 2 · ' : '') + esc(c.title) + '</b><small>' + c.tags.map((t) => ({ people: 'people', road: 'road', paper: 'paperwork', speed: 'needs speed' })[t]).join(' · ') + '</small></div><div class="sgOff">' +
        SQUAD.map((o) => '<button type="button" class="sgPick' + (asg[i] === o.k ? ' on' : '') + '" data-i="' + i + '" data-k="' + o.k + '"' + (used.has(o.k) && asg[i] !== o.k ? ' disabled' : '') + '>' + o.icon + ' ' + esc(o.name) + '</button>').join('') + '</div></div>').join('') + '</div><div class="qAct"><button type="button" id="sgGo"' + (Object.keys(asg).length < calls.length ? ' disabled' : '') + '>Send them</button><button type="button" class="ghost" id="sgLater">Not tonight</button></div>');
      document.querySelectorAll('.sgPick').forEach((b) => b.onclick = () => { const i = +b.dataset.i; asg[i] = asg[i] === b.dataset.k ? undefined : b.dataset.k; if (!asg[i]) delete asg[i]; draw(); });
      document.getElementById('sgGo').onclick = () => results(calls, asg); document.getElementById('sgLater').onclick = () => { st().last = -1; H.saveS(); H.closeModal(); }; };
    draw();
  }
  function results(calls, asg) {
    const rows = calls.map((c, i) => { const o = SQUAD.find((x) => x.k === asg[i]), f = fit(o, c), good = f > 0 || (f === 0 && Math.random() < .6); return { c, o, good }; });
    const s = st(); s.runs++; rows.forEach((r) => { if (r.good) s.good++; else s.bad++; const m = H.pmem(r.o.k); if (m) m.t = Math.max(0, Math.min(100, m.t + (r.good ? 2 : -3))); if (!r.good && r.c.tags.includes('people')) H.blockTrust(-1); });
    (s.owed = s.owed || []).push(...rows.filter((r) => !r.good).map((r) => r.o.name)); H.saveS();
    const desk = rows.slice().sort((a, b) => (a.good ? 1 : 0) - (b.good ? 1 : 0))[0]; // the shakiest report lands on your desk
    H.openModal('<div class="sceneHead"><b>SERGEANT · END OF THE BOARD</b><h2>How it went</h2></div><ul class="memList">' + rows.map((r) => '<li class="memRow ' + (r.good ? 'good' : 'bad') + '"><i>' + r.o.icon + '</i><span><b>' + esc(r.o.name) + '</b> · ' + esc(r.c.title) + '<br>' + esc(r.good ? r.o.ok : r.o.bad[r.c.tags.find((t) => r.o.bad[t])] || r.o.bad.any) + '</span></li>').join('') + '</ul><div class="qAct"><button type="button" id="sgSign">Read ' + esc(desk.o.name) + '\'s report</button></div>');
    document.getElementById('sgSign').onclick = () => { H.closeModal(); sign(desk, rows); };
  }
  function sign(desk, rows) { const q = H.facts([desk.c.les], 1)[0];
    const L = [['castillo', desk.o.name + '\'s report on "' + desk.c.title + '". Before you sign it, check the part that matters.']];
    if (q) L.push(['q', q, 'castillo']); L.push(['fx', (res) => { const s = st(); const caught = q ? !!res.right : true; if (caught) s.caught++; H.saveS();
      const n = rows.filter((r) => r.good).length; H.award(20 + n * 15 + (caught ? 20 : 0), 'Ran the board as sergeant');
      H.journal(n + ' of 3 calls went well with your assignments' + (caught ? ', and you caught the problem in ' + desk.o.name + '\'s report.' : '. ' + desk.o.name + '\'s report went through with a mistake in it.'));
      H.toast(caught ? '📋 Sent it back for a rewrite. ' + desk.o.name + ' fixed it.' : '📋 Signed as written. It will come up again.'); }]);
    H.dialogue(L, () => {}); }
  // next shift: the officers you set up to fail let you know
  function onShiftStart() { const s = S.sgt; if (!s || !s.owed || !s.owed.length) return; const who = s.owed.shift(); H.saveS(); setTimeout(() => H.radio(who, 'Sarge, about last night. That one wasn\'t for me, and you knew it.'), 7000); }
  return { can, open, onShiftStart, SQUAD, board, fit, get state() { return st(); } };
}
