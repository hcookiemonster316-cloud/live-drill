// One more shift (Phase 7). The pull to come back should be honest: things you can actually finish next time, shown
// plainly, and a choice of what to go after.
//  - Within reach: the shift report ends with the three goals closest to done across the game (a case near its
//    ending, a friend's next chapter that's ready, the district Final Call, your next rank), each with a bar.
//  - Your call: after roll call you pick one of them as your focus for the shift. It becomes one of your shift orders,
//    the map marks it, and finishing it pays like any order.
//  - A good place to stop: after three shifts in one sitting, the report says so plainly. Everything is saved, and
//    the "within reach" list is waiting. Compelling, never compulsive.
// Loop: career grows -> the report shows what's nearly done -> you choose your next shift's focus -> drive, take the
// call, finish it. Reads the cases, friendship stories, facts and rank; writes into the shift orders.

export function installReach(H) {
  const S = H.S, esc = H.esc;
  let session = 0; // shifts finished since the page opened

  // every goal that's partly done, with how close it is (0..1) and a test that says when it's done
  function candidates() {
    const out = [], did = H.did(), dn = H.districtName(did);
    // side cases in progress: the fewer steps left, the closer
    H.SIDE.forEach((q) => { const i = S.side[q.id]; if (i == null || i <= 0 || H.sideClosed(q) || !q.steps) return; const n = q.steps.length, left = n - i;
      if (left > 3) return; out.push({ k: 'case:' + q.id, icon: '📁', title: q.title, sub: left === 1 ? 'One step from closing' : left + ' steps from closing', pct: i / n, here: q.d === did, test: () => H.sideClosed(q) }); });
    // the main story chapter in this district
    const c = H.chap(); if (c) { const i = S.story[c.d] || 0, n = c.steps.length; if (i > 0 && i < n) out.push({ k: 'main:' + c.d, icon: '⭐', title: c.title, sub: (n - i) + ' chapter step' + (n - i > 1 ? 's' : '') + ' to go', pct: i / n, here: true, test: () => (S.story[c.d] || 0) > i }); }
    // a friend whose next part is ready: one visit does it
    (H.regs() || []).forEach((r) => { const id = r.n.id; if (!H.arcReady(id)) return; const done = (S.arcs || {})[id] || 0, A = H.arc(id); if (!A) return;
      out.push({ k: 'arc:' + id, icon: '💛', title: A.title, sub: 'Part ' + (done + 1) + ' is ready. ' + r.n.name + ' is on your beat', pct: done / 5 + .1, here: true, test: () => ((S.arcs || {})[id] || 0) > done }); });
    // the district Final Call
    const m = H.mastery(did); if (m && m.facts && m.facts.total) { const left = m.facts.total - m.facts.done; if (left > 0 && left <= 12) out.push({ k: 'final:' + did, icon: '🎓', title: dn + ' Final Call', sub: left + ' fact' + (left > 1 ? 's' : '') + ' to go', pct: m.facts.done / m.facts.total, here: true, test: () => { const x = H.mastery(did); return x.facts.done >= x.facts.total; } }); }
    // the next rank
    const rk = H.rank(); if (rk.next) { const lo = rk.lo, hi = rk.next[0], left = hi - S.xp; if (left > 0 && left <= Math.max(150, (hi - lo) * .35)) out.push({ k: 'rank', icon: '🎖', title: rk.next[1], sub: left + ' RP to your next rank', pct: (S.xp - lo) / Math.max(1, hi - lo), here: true, test: () => S.xp >= hi }); }
    return out;
  }
  // the three closest, things in this district first when it's a tie
  function top(n) { return candidates().sort((a, b) => (b.pct + (b.here ? .05 : 0)) - (a.pct + (a.here ? .05 : 0))).slice(0, n || 3); }

  function bar(g) { const p = Math.max(4, Math.min(100, Math.round(g.pct * 100))); return '<div class="rchRow"><span class="rchI">' + g.icon + '</span><div><b>' + esc(g.title) + '</b><small>' + esc(g.sub) + '</small><i class="rchBar"><i style="width:' + p + '%"></i></i></div></div>'; }
  // the end of the shift report
  function reportHtml() {
    session++; const t = top(3);
    const stop = session >= 3 ? '<p class="rchStop">That\'s ' + session + ' shifts tonight. This is a good place to stop: everything is saved, and all of this will be right here.</p>' : '';
    if (!t.length) return stop;
    return '<div class="rch"><h4>Within reach</h4>' + t.map(bar).join('') + '</div>' + stop;
  }

  // your call: after roll call, pick what this shift is for
  function offer(done) {
    const t = top(3).filter((g) => g.here); if (!t.length || S.tutDone == null) { if (done) done(); return; }
    H.openModal('<div class="sceneHead"><b>YOUR CALL</b><h2>What\'s this shift for?</h2><p>Pick one to go after. It becomes one of your shift orders. You can always do something else.</p></div>' +
      '<div class="rchPick">' + t.map((g, i) => '<button type="button" data-rf="' + i + '">' + bar(g) + '</button>').join('') + '</div><div class="qAct"><button type="button" class="ghost" id="rchSkip">Just patrol</button></div>');
    const pick = (g) => { H.closeModal(); if (g) setFocus(g); if (done) done(); };
    document.querySelectorAll('[data-rf]').forEach((b) => b.onclick = () => pick(t[+b.dataset.rf]));
    const sk = document.getElementById('rchSkip'); if (sk) sk.onclick = () => pick(null);
  }
  let focus = null;
  function setFocus(g) { focus = g; S.focusK = g.k; if (g.k.slice(0, 5) === 'case:') S.track = g.k.slice(5); else if (g.k.slice(0, 5) === 'main:') S.track = 'main'; /* the gold arrow points at it */ H.focusOrder('Your call: ' + g.title); H.saveS(); }
  // checked every couple of seconds while you play: finishing your focus completes its order
  let acc = 0;
  function tick(dt) { if (!focus) return; acc += dt; if (acc < 2) return; acc = 0; let ok = false; try { ok = focus.test(); } catch (e) {} if (ok) { focus = null; S.focusK = null; H.ord('focus'); H.saveS(); } }
  return { top, reportHtml, offer, tick, candidates, get focus() { return focus; }, get session() { return session; } };
}
