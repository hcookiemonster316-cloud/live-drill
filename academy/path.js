// One clear path. Everything you do earns RP through one award() call, but the game showed that progress in five
// places that each looked like the one that matters (Service Record, Academy Season, Class Standing, Trophies,
// Collections). The path puts them in order: learning the chapter is the road, the five districts and the final exam
// are the stops on it, rank is how far you've come, and everything else is listed underneath as what feeds it.
export function installPath(H) {
  const S = H.S;
  const facts = (d) => H.factProgress(H.DISTRICTS[d].lessons);
  // the single most useful next thing to do
  function nextStep() {
    const cl = S.cleared || [], here = H.did();
    for (let d = 0; d < H.DISTRICTS.length; d++) {
      if (cl.includes(d)) continue; const f = facts(d), D = H.DISTRICTS[d];
      if (!S.unlocked.includes(d)) return { icon: '🚓', t: 'Transfer to ' + D.name, s: 'Your next district is open. Head for the district line on your map.' };
      if (f.done < f.total) return { icon: '📚', t: 'Learn ' + (f.total - f.done) + ' more fact' + (f.total - f.done === 1 ? '' : 's') + ' in ' + D.name, s: (d === here ? '' : 'Go back to ' + D.name + '. ') + 'Calls, drills and the people on your beat all teach them.' };
      return { icon: '🏁', t: 'Pass ' + D.name + '\'s Final Call', s: 'Every fact is learned. The Final Call clears the district.' };
    }
    if (!S.graduated) return { icon: '🎓', t: 'Take the Vehicle Operations Final Exam', s: 'Your last shift. 85% to graduate.', exam: true };
    return { icon: '⭐', t: 'You graduated', s: 'New Game+ lets you come back as an FTO and train new cadets.' };
  }
  // exam readiness: facts you know and haven't missed since, against the 85% you need, and what to study next
  function readyHTML() {
    if (!H.readiness) return '';
    const r = H.readiness(), pass = 85, gap = Math.max(0, Math.ceil(r.total * pass / 100) - r.solid);
    const say = r.pct >= pass ? 'You\'re at passing level. Keep it there: missed facts come back over the radio.' : gap + ' more fact' + (gap === 1 ? '' : 's') + ' to reach the 85% you need' + (r.review ? ', and ' + r.review + ' missed fact' + (r.review === 1 ? '' : 's') + ' to fix' : '') + '.';
    const weak = r.weak.map((w) => '<li><b>' + H.esc('Lesson ' + w.name.replace(': ', ' · ')) + '</b><small>' + w.done + ' of ' + w.total + ' facts</small></li>').join('');
    return '<div class="ready"><div class="readyTop"><b>' + r.pct + '%</b><span><small>Exam readiness</small><em>' + H.esc(say) + '</em></span></div>' +
      '<span class="readyBar"><span style="width:' + r.pct + '%"></span><i style="left:' + pass + '%"></i></span>' +
      (weak ? '<p class="finLbl">Work on next</p><ul class="readyWeak">' + weak + '</ul>' : '') + '</div>';
  }
  function panel() {
    const cl = S.cleared || [], all = H.DISTRICTS.map((_, d) => facts(d)), have = all.reduce((a, f) => a + f.done, 0), tot = all.reduce((a, f) => a + f.total, 0);
    const r = H.rankOf(S.xp), nx = r.next, n = nextStep(), day = H.day();
    const stops = H.DISTRICTS.map((D, d) => { const f = all[d], done = cl.includes(d), now = !done && S.unlocked.includes(d) && !H.DISTRICTS.slice(0, d).some((_, k) => !cl.includes(k));
      return '<li class="pathStop ' + (done ? 'done' : now ? 'now' : 'next') + '"><i>' + (done ? '✅' : now ? '📍' : '🔒') + '</i><span><b>' + H.esc(D.name) + '</b><small>' + (done ? 'Cleared' : f.done + ' of ' + f.total + ' facts' + (f.done >= f.total ? ' · Final Call next' : '')) + '</small></span></li>'; }).join('') +
      '<li class="pathStop ' + (S.graduated ? 'done' : cl.length >= 5 ? 'now' : 'next') + '"><i>' + (S.graduated ? '✅' : '🎓') + '</i><span><b>Vehicle Operations Final Exam</b><small>' + (S.graduated ? 'Passed · graduated' : cl.length >= 5 ? 'Open now' : 'Opens when all five districts are cleared · exam day is academy day ' + H.TERM) + '</small></span></li>';
    const side = [
      ['rec', '⭐', 'Service Record', 'Ten tracks that level up from what you do most'],
      ['season', '🏆', 'Academy Season', 'Season tiers: titles, cash and car skins'],
      ['stand', '📊', 'Class Standing', 'Where you rank in your class this week'],
      ['troph', '🏅', 'Trophies', (S.trophies ? Object.keys(S.trophies).length : 0) + ' of ' + H.trophyCount + ' earned'],
      ['coll', '🗂', 'Collections', 'Things you find on patrol'],
      ['cal', '📅', 'Academy Calendar', 'Day ' + Math.min(day, H.TERM) + ' of ' + H.TERM + ' · your regulars\' hours']
    ].map(([k, ic, t, s]) => '<button type="button" class="pathSide" data-ps="' + k + '"><i>' + ic + '</i><span><b>' + t + '</b><small>' + H.esc(s) + '</small></span></button>').join('');
    H.openModal('<div class="sceneHead"><b>YOUR PATH</b><h2>' + H.esc(r.name) + '</h2><p>Learn the chapter, clear the five districts, pass the final exam. Everything else you do earns RP toward your next rank.</p></div>' +
      '<div class="pathNext"><i>' + n.icon + '</i><span><small>Next step</small><b>' + H.esc(n.t) + '</b><em>' + H.esc(n.s) + '</em></span></div>' +
      (H.hint ? '<div class="pathHint"><button type="button" class="ghost" id="pathHint">Stuck on a case? Get a hint</button><p id="pathHintT" hidden></p></div>' : '') +
      '<div class="pathBars"><div><b>' + have + ' / ' + tot + '</b><small>Facts learned</small><span class="grpBar"><span style="width:' + Math.round(100 * have / Math.max(1, tot)) + '%"></span></span></div>' +
      '<div><b>' + (nx ? Math.max(0, nx[0] - S.xp) + ' RP' : 'Top rank') + '</b><small>' + (nx ? 'to ' + H.esc(nx[1]) : 'Graduate rank reached') + '</small><span class="grpBar"><span style="width:' + (nx ? Math.round(100 * Math.min(1, S.xp / nx[0])) : 100) + '%"></span></span></div></div>' +
      readyHTML() +
      '<p class="finLbl">The road</p><ol class="pathStops">' + stops + '</ol>' +
      '<p class="finLbl">What feeds it</p><div class="pathSides">' + side + '</div>' +
      '<div class="qAct">' + (n.exam ? '<button type="button" id="pathExam">Start the final exam</button>' : '') + '<button type="button" class="' + (n.exam ? 'ghost' : '') + '" id="pathClose">Back to patrol</button></div>');
    const hb = document.getElementById('pathHint'); if (hb) hb.onclick = () => { const p = document.getElementById('pathHintT'); p.textContent = H.hint(); p.hidden = false; hb.hidden = true; };
    const c = document.getElementById('pathClose'); if (c) c.onclick = () => H.closeModal();
    const e = document.getElementById('pathExam'); if (e) e.onclick = () => { H.closeModal(); H.exam(); };
    document.querySelectorAll('[data-ps]').forEach((b) => { b.onclick = () => { H.closeModal(); H.open[b.dataset.ps](); }; });
  }
  return { panel, nextStep };
}
