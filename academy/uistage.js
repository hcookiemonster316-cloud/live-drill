// Never "what do I do now?" (Phase 4, item 10).
// 1) A new career starts with a quiet screen: the street, your ID card, the objective bar, Car and Menu. Everything
//    else appears the first time it's needed, with one line saying what it's for. Careers started before this
//    existed keep the full screen.
// 2) Every card and panel ends with one line saying what's next.
export function installUiStage(H) {
  const S = H.S;
  // each piece of the screen, when it shows up, and the one line that introduces it
  const STAGES = [
    { k: 'map', sel: ['.mini', '#hExp', '#bMap', '#bMe'], when: () => !!S.tutDone, say: 'Your map is on. The gold arrow and the map always point to your next stop.' },
    { k: 'radio', sel: ['#bRadio', '#radio'], when: () => !!S.tutDone || (S.calls || 0) >= 1 || !!(H.call() && H.call().accepted), say: 'Radio is on. Everything dispatch says ends up in the log.' },
    { k: 'status', sel: ['#bX', '#offHud'], when: () => (S.calls || 0) >= 1, say: 'Your status button is on. Show yourself available to get the next call.' },
    { k: 'orders', sel: ['#orders'], when: () => (S.calls || 0) >= 1, say: 'Shift orders are on. Finish them before the shift ends for a bonus.' },
    { k: 'cases', sel: ['#qTrack'], when: () => (S.calls || 0) >= 2 || Object.keys(S.side || {}).length > 0, say: 'Cases are on. People around the city have work for you. Look for the blue !.' },
    { k: 'quick', sel: ['#quick', '#sqChip'], when: () => (S.calls || 0) >= 2, say: '' },
    { k: 'locker', sel: ['#bLock'], when: () => (S.calls || 0) >= 3 || (S.xp || 0) >= 300, say: 'Your locker is open. Gear and looks you earn go there.' },
    { k: 'mastery', sel: ['#hMast'], when: () => (S.calls || 0) >= 1, say: '' }
  ];
  const css = document.createElement('style');
  css.textContent = STAGES.map((s) => 'body.uiStaged:not(.ui-' + s.k + ') :is(' + s.sel.join(',') + '){display:none!important}').join('') +
    '.uiNew{animation:uiNew 1.2s ease-out 3}@keyframes uiNew{0%{box-shadow:0 0 0 0 rgba(245,184,0,.8)}100%{box-shadow:0 0 0 14px rgba(245,184,0,0)}}' +
    '.whatNext{margin:12px 0 0;padding:8px 10px;border-radius:10px;background:rgba(245,184,0,.1);border:1px solid rgba(245,184,0,.28);font-size:.86em;line-height:1.35;color:#fde68a}.whatNext b{color:#f5b800;margin-right:4px}';
  document.head.appendChild(css);
  function apply(announce) {
    const staged = !!S.uiStage; document.body.classList.toggle('uiStaged', staged); if (!staged) return;
    S.uiSeen = S.uiSeen || {};
    let grew = false;
    for (const s of STAGES) { if (!s.when()) continue; if (!document.body.classList.contains('ui-' + s.k)) { document.body.classList.add('ui-' + s.k); grew = true; } if (S.uiSeen[s.k]) continue; S.uiSeen[s.k] = 1; H.saveS();
      if (announce && s.say) { H.toast(s.say); for (const q of s.sel) { const e = document.querySelector(q); if (e) { e.classList.remove('uiNew'); void e.offsetWidth; e.classList.add('uiNew'); setTimeout(() => e.classList.remove('uiNew'), 4000); } } } }
    if (grew && H.relayout) H.relayout(); // panels that stack under the radio log find their place again
    if (STAGES.every((s) => S.uiSeen[s.k])) { S.uiStage = 0; H.saveS(); document.body.classList.remove('uiStaged'); } // everything is out: back to the normal screen
  }
  let t = 0;
  function tick(dt) { t += dt; if (t < .8) return; t = 0; apply(true); }
  // one line, what to do next, for the bottom of any card
  function nextLine() {
    const ob = document.getElementById('objBar'); if (ob && !ob.hidden && ob.dataset.t) return ob.dataset.t;
    const c = H.call(); if (c && c.accepted) return 'Get to the call. Follow the marker on your map.';
    if (c && !c.accepted) return 'A call is waiting. Tap Respond to take it.';
    const n = H.nextStep && H.nextStep(); return n ? n.t + '.' : '';
  }
  function footer(html) { if (/class="whatNext"|data-nonext/.test(html)) return html; const n = nextLine(); return n ? html + '<p class="whatNext"><b>Next</b>' + H.esc(n) + '</p>' : html; }
  apply(false);
  return { apply, tick, nextLine, footer, start: () => { S.uiStage = 1; S.uiSeen = {}; H.saveS(); apply(false); } };
}
