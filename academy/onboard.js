// First ten minutes: a guided first shift with a pointing hand, menu features that unlock as you reach them,
// and a Continue card on the title screen that shows where you left off.
export function installOnboard(H) {
  const S = H.S, esc = H.esc;
  S.menuSeen = S.menuSeen || {}; S.menuOpen = S.menuOpen || {};
  // players who were already playing before the tutorial existed skip it
  if (S.tutDone == null && ((S.calls || 0) > 0 || (S.xp || 0) > 150 || Object.keys(S.story || {}).some((k) => S.story[k] > 1))) S.tutDone = 1;

  // ================= 5. guided first shift =================
  const STEPS = [
    { id: 'move', text: 'Tap the street to walk there. On a keyboard, use WASD or the arrow keys.', target: () => ({ world: [H.P.x + 2.5, H.P.y + 1] }), done: (st) => Math.hypot(H.P.x - st.x0, H.P.y - st.y0) > 3 },
    { id: 'goal', text: 'Your current objective is in the bar at the bottom. Follow the gold arrow to get there, then talk to whoever is waiting.', target: () => ({ el: '#objBar' }), done: (st) => H.storyBusy() || H.dlgOpen() || (S.story[H.W.did] || 0) > st.story0 },
    { id: 'car', text: 'Tap 🚓 Car to get in. Driving is faster, and you can park anywhere.', target: () => ({ el: '#bCar' }), done: () => H.P.inCar },
    { id: 'call', text: 'A call is coming in. Tap Respond, then drive to the marker.', target: () => (H.call() && !H.call().accepted ? { el: '#ccGo' } : null), enter: () => H.forceCall(), done: () => H.call() && H.call().accepted },
    { id: 'radio', text: '📻 Radio is your dispatch log. Everything said on the air ends up here.', target: () => ({ el: '#bRadio' }), click: '#bRadio' },
    { id: 'menu', text: '☰ Menu holds your field journal, case files, settings and more. New things appear there as you earn them.', target: () => ({ el: '#bPause' }), click: '#bPause' }
  ];
  let tut = null, coach = null, hand = null, clicked = {};
  function startTut() {
    if (S.tutDone || tut) return; tut = { i: -1 }; coach = document.createElement('div'); coach.className = 'coach'; hand = document.createElement('div'); hand.className = 'tHand'; hand.innerHTML = '<span>👆</span>';
    document.body.appendChild(coach); document.body.appendChild(hand); next();
    document.addEventListener('click', (e) => { const s = STEPS[tut && tut.i]; if (s && s.click && e.target.closest && e.target.closest(s.click)) clicked[s.id] = 1; }, true);
  }
  function next() {
    tut.i++; if (tut.i >= STEPS.length) return finish(); const s = STEPS[tut.i]; tut.x0 = H.P.x; tut.y0 = H.P.y; tut.story0 = S.story[H.W.did] || 0; tut.entered = false;
    coach.innerHTML = '<div class="coIn"><small>FIRST SHIFT · ' + (tut.i + 1) + ' OF ' + STEPS.length + '</small><p>' + esc(s.text) + '</p><button type="button" class="coSkip">Skip tutorial</button></div>';
    coach.classList.remove('pop'); void coach.offsetWidth; coach.classList.add('pop'); coach.querySelector('.coSkip').onclick = (e) => { e.stopPropagation(); finish(true); };
  }
  function finish(skipped) { S.tutDone = 1; H.saveS(); if (coach) coach.remove(); if (hand) hand.remove(); coach = hand = null; tut = null; if (!skipped) { H.banner('🎓', 'First shift basics: done', 'Castillo has the rest. Keep following the gold arrow.'); H.award(25, 'tutorial'); } }
  function tutTick() {
    if (!tut) { if (!S.tutDone && H.ready() && H.W) startTut(); return; }
    const s = STEPS[tut.i], quiet = H.ready() || (s.id === 'goal' && (H.storyBusy() || H.dlgOpen()));
    coach.classList.toggle('hide', !quiet); hand.classList.toggle('hide', !quiet);
    if (!quiet) return;
    if (!tut.entered && s.enter) { tut.entered = true; s.enter(); }
    const ok = s.click ? clicked[s.id] : s.done(tut); if (ok) { H.beep(880, .08, 'triangle', .04); H.beep(1320, .12, 'triangle', .03, .08); return next(); }
    const t = s.target(); let x = null, y = null;
    if (t && t.el) { const e = document.querySelector(t.el); if (e && e.offsetParent) { const r = e.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; } }
    else if (t && t.world) { const p = H.toScreen(t.world[0], t.world[1]); x = p[0]; y = p[1]; }
    if (x == null) hand.classList.add('hide'); else { hand.style.left = x + 'px'; hand.style.top = y + 'px'; hand.classList.toggle('up', y > innerHeight * .6); }
  }

  // ================= 6. features that unlock as you reach them =================
  const GATES = {
    'Academy Season': [() => (S.calls || 0) >= 1, '🌀', 'Every RP you earn now fills a season track of free cosmetic rewards.'],
    'Case Files': [() => Object.keys(S.lore || {}).length >= 5, '🗂️', 'Your lore pages are collectible cards now. Finish a district for a title.'],
    'Mystery Board': [() => Object.keys(S.clues || {}).length >= 1 || (S.story || {})[0] >= 6, '📜', 'Torn ledger pages are hidden around the city. The board has riddles.'],
    'Rival: Cadet Vance': [() => ((S.story || {})[0] || 0) >= 2, '🎖️', 'Cadet Devin Vance is first in the class. He wants a word.'],
    'Leaderboards': [() => (S.calls || 0) >= 5, '🏅', 'Weekly boards for S-ranks, lore, friends and more.'],
    'Rec Room · Mini Games': [() => (S.calls || 0) >= 2 || (S.xp || 0) >= 200, '🎮', 'Play mini games with other cadets between calls.'],
    'Class Standing': [() => (S.calls || 0) >= 1, '📊', 'See how you rank against your class this week.'],
    'New Game+ · FTO': [() => !!S.graduated, '🎖️', 'Train the next cadet: replay the story as a Field Training Officer.']
  };
  function gateMenu(items) {
    for (let i = items.length - 1; i >= 0; i--) { const lbl = items[i][0], g = GATES[lbl]; if (!g) continue; if (!g[0]()) { items.splice(i, 1); continue; }
      if (!S.menuOpen[lbl]) { const fn = items[i][1]; items[i] = [lbl + ' <i class="newTag">NEW</i>', () => { S.menuOpen[lbl] = 1; H.saveS(); fn(); }]; } }
    return items;
  }
  const UNDER_PATH = { 'Service Record': 1, 'Academy Season': 1, 'Class Standing': 1, Trophies: 1, Collections: 1 }; // these open from Your Path now
  let gT = 3;
  function gateTick(dt) { gT -= dt; if (gT > 0) return; gT = 3; for (const [lbl, g] of Object.entries(GATES)) { if (S.menuSeen[lbl] || !g[0]()) continue; S.menuSeen[lbl] = Date.now(); H.saveS(); H.banner(g[1], (UNDER_PATH[lbl] ? 'New in Your Path: ' : 'New in the menu: ') + lbl.replace(' · Mini Games', ''), g[2]); } }

  // ================= 7. Continue card on the title screen =================
  function continueCard() {
    if (!S.cs) return ''; const d = S.home || 0, ch = H.CHAPTERS.find((c) => c.d === d), at = (S.story || {})[d] || 0, goal = ch && at < ch.steps.length ? ch.steps[at].goal : 'Free patrol';
    const ago = S.lastSeen ? Math.round((Date.now() - S.lastSeen) / 60000) : null, when = ago == null ? '' : ago < 2 ? 'just now' : ago < 60 ? ago + ' min ago' : ago < 1440 ? Math.round(ago / 60) + ' hr ago' : Math.round(ago / 1440) + ' days ago';
    return '<div class="tiCont"><small>CONTINUE' + (S.fto ? ' · NEW GAME+ ' + (S.ng || 1) + ' · FTO' : '') + (when ? ' · LAST PLAYED ' + esc(when.toUpperCase()) : '') + '</small><b>' + esc(H.dname(d)) + (ch ? ' · Chapter ' + (d + 1) + ': ' + esc(ch.title) : '') + '</b><p>➤ ' + esc(goal) + '</p></div>';
  }
  return { tick: (dt) => { tutTick(); gateTick(dt); }, gateMenu, continueCard, get active() { return !!tut; }, /* true until the guided shift reaches its own call: random calls wait so the first minutes teach one thing at a time */ get holdCalls() { return !S.tutDone && (!tut || tut.i < 0 || STEPS[tut.i].id !== 'call' && STEPS.findIndex((x) => x.id === 'call') > tut.i); }, finish };
}
