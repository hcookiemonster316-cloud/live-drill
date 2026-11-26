// The story so far: a short film of a quest up to where you are. Each step you've played becomes a shot: the camera
// flies to the place it happened, the person who was there appears, and the moment that mattered plays as a caption,
// including the choice you made and what it led to. Open it from the Field Journal on any quest you've started, or
// from the "Previously on..." chip that appears at roll call when you come back to a case you left a while ago.
// Loop: the city remembers (it reads your choices back to you) -> you take the case up again knowing where it stands.
// It reads the Field Journal's quest list and the flags your choices set, and drives the cinematic camera.

const WORDS = 34; // a caption is one breath: long lines are cut at a sentence, never mid-thought

// the lines a step actually played for you: conditions checked against your flags, choices resolved to the one you made
export function playedLines(say, flags) {
  const out = []; let chose = null;
  const ok = (l) => !l[2] || ((!l[2].if || flags[l[2].if]) && (!l[2].unless || !flags[l[2].unless]));
  (say || []).forEach((l) => {
    if (!Array.isArray(l)) return;
    if (l[0] === 'choice') { const o = (l[1] || []).find((x) => x.set && flags[x.set]); if (o) { chose = o.t; out.push(['@you', o.t, 'choice']); (o.reply || []).forEach((r) => { if (typeof r[1] === 'string' && ok(r)) out.push([r[0], r[1]]); }); } return; }
    if (typeof l[1] !== 'string' || l[0] === 'beat' || l[0] === 'q' || l[0] === 'gate' || !ok(l)) return;
    out.push([l[0], l[1]]);
  });
  return { lines: out, chose };
}
// one sentence-bounded caption of at most WORDS words
export function clip(text) {
  const t = String(text).replace(/^\((over|on) the radio\)\s*/, ''); const w = t.split(/\s+/); if (w.length <= WORDS) return t;
  const parts = t.match(/[^.!?]+[.!?]+["')]*\s*/g) || [t]; let s = '';
  for (const p of parts) { if ((s + p).split(/\s+/).length > WORDS && s) break; s += p; }
  return s.trim() || w.slice(0, WORDS).join(' ') + '...';
}
// the shots for one quest: every step played so far, each with its place, its person and up to two lines that carry it
export function recapBeats(q, prog, flags, side) {
  const beats = [], steps = [];
  if (side) q.steps.slice(0, prog.i).forEach((s) => steps.push(s));
  else q.steps.forEach((s, k) => { const pre = (s.pre || []).filter((p) => !(p.onlyIf && !flags[p.onlyIf]) && !(p.skipIf && flags[p.skipIf])); if (k < prog.i) { pre.forEach((p) => steps.push(p)); steps.push(s); } else if (k === prog.i) pre.slice(0, prog.x || 0).forEach((p) => steps.push(p)); });
  steps.forEach((s) => {
    const { lines, chose } = playedLines((s.say || []).concat(s.after || []), flags); if (!lines.length) return;
    const pickL = []; const narr = lines.find((l) => l[0] === 'narr'), main = lines.find((l) => l[0] === s.who) || lines.find((l) => l[0] !== 'narr' && l[0] !== '@you');
    const ci = lines.findIndex((l) => l[2] === 'choice');
    if (ci >= 0) { pickL.push(lines[ci]); const r = lines[ci + 1]; if (r && r[2] !== 'choice') pickL.push(r); }
    else { if (narr) pickL.push(narr); if (main && main !== narr) pickL.push(main); }
    beats.push({ at: s.at, who: s.who || (main && main[0]), twist: s.twist ? s.twist.title : null, chose, lines: pickL.slice(0, 2).map((l) => [l[0], clip(l[1]), l[2] || ''])});
  });
  return beats;
}

export function installRecap(H) {
  const S = H.S; let el = null, idx = 0, beats = [], timer = 0, quest = null, wasPaused = false, wasCine = false;
  const esc = H.esc;
  // the journal asks this for every case on its list, so it answers from progress alone instead of building the film
  function canPlay(q, side) { if (side) return (S.side[q.id] || 0) > 0 || !!H.sideClosed(q); return (S.story[q.d] || 0) > 0 || ((S.storyX || {})[q.d] || 0) > 0; }
  function beats0(q, side) { const prog = side ? { i: S.side[q.id] || 0 } : { i: S.story[q.d] || 0, x: (S.storyX || {})[q.d] || 0 }; if (side && H.sideClosed(q)) prog.i = q.steps.length; return recapBeats(q, prog, S.flags || {}, side); }
  function close() { if (!el) return; clearTimeout(timer); el.classList.remove('on'); const e = el; setTimeout(() => e.remove(), 500); el = null; H.cineRelease(); H.pause(wasPaused); if (H.music) H.music(false); if (!wasCine) document.body.classList.remove('cine'); }
  function show(k) {
    if (!el) return; idx = Math.max(0, Math.min(beats.length - 1, k)); const b = beats[idx]; clearTimeout(timer);
    const spot = b.at ? H.placeOf(b.at, quest.d) : null; if (spot) H.cineFocus(spot[0], spot[1], innerWidth < 600 ? 1.5 : 1.85);
    const who = b.who && b.who !== 'narr' ? H.who(b.who) : null;
    const place = (b.at || '') + (quest.d != null ? ' · ' + H.districtName(quest.d) : '');
    const lineHtml = b.lines.map(([sp, t, kind]) => kind === 'choice' ? '<p class="rcChose"><small>You chose</small>' + esc(t) + '</p>' : sp === 'narr' ? '<p class="rcNarr">' + esc(t) + '</p>' : '<p class="rcLine"><b>' + esc(H.who(sp).name || '') + '</b>' + esc(t) + '</p>').join('');
    const stage = el.querySelector('.rcStage');
    stage.classList.remove('in'); void stage.offsetWidth; // the shot cuts: out, then in
    stage.innerHTML = '<div class="rcPlace">📍 ' + esc(place) + '</div>' + (b.twist ? '<div class="rcTwist">The story turned: ' + esc(b.twist) + '</div>' : '') +
      '<div class="rcShot">' + (who ? '<canvas class="rcPort" width="96" height="96"></canvas>' : '') + '<div class="rcText">' + lineHtml + '</div></div>';
    if (who) { const cv = stage.querySelector('.rcPort'); let n = 0; const draw = () => { if (!cv.isConnected) return; let r; try { r = H.drawPortrait(cv, b.who); } catch (e) { r = false; } if (r === false) cv.remove(); else if (r === null && ++n < 12) setTimeout(draw, 150); }; draw(); } // a face the portrait worker hasn't painted yet arrives a moment later
    stage.classList.add('in');
    el.querySelector('.rcDots').innerHTML = beats.map((_, i) => '<i class="' + (i < idx ? 'done' : i === idx ? 'on' : '') + '"></i>').join('');
    el.querySelector('[data-r="prev"]').disabled = idx === 0;
    el.querySelector('[data-r="next"]').textContent = idx === beats.length - 1 ? 'Back to patrol' : 'Next ▸';
    const words = b.lines.reduce((n, l) => n + l[1].split(/\s+/).length, 0);
    timer = setTimeout(() => (idx < beats.length - 1 ? show(idx + 1) : null), Math.max(4200, words * 330));
  }
  function play(q, side) {
    if (el) close(); quest = q; beats = beats0(q, side); if (!beats.length) return false;
    wasPaused = H.paused(); H.pause(true); if (H.music) H.music(true); wasCine = document.body.classList.contains('cine'); document.body.classList.add('cine'); // the HUD steps back for the film
    el = document.createElement('div'); el.className = 'recap'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'The story so far: ' + q.title);
    el.innerHTML = '<i class="rcBar t"></i><i class="rcBar b"></i><div class="rcHead"><small>THE STORY SO FAR</small><h2>' + esc(q.title) + '</h2></div><div class="rcStage"></div>' +
      '<div class="rcFoot"><div class="rcDots"></div><div class="rcBtns"><button type="button" data-r="prev">◂</button><button type="button" data-r="next">Next ▸</button><button type="button" data-r="skip" class="rcSkip">Skip</button></div></div>';
    document.body.appendChild(el); requestAnimationFrame(() => el && el.classList.add('on'));
    el.querySelector('[data-r="prev"]').onclick = (e) => { e.stopPropagation(); show(idx - 1); };
    el.querySelector('[data-r="next"]').onclick = (e) => { e.stopPropagation(); if (idx >= beats.length - 1) close(); else show(idx + 1); };
    el.querySelector('[data-r="skip"]').onclick = (e) => { e.stopPropagation(); close(); };
    el.onclick = () => { if (idx >= beats.length - 1) close(); else show(idx + 1); };
    S.recaps = (S.recaps || 0) + 1; H.saveS(); show(0); return true;
  }
  // "Previously on...": coming back to a case you left more than half a day ago, a chip offers the recap (never forced)
  function offerAtRollCall() {
    const id = S.track; if (!id) return; const side = id !== 'main', q = side ? H.sideQ(id) : H.chap(); if (!q) return;
    const key = side ? id : 'main' + q.d, at = (S.qAt || {})[key]; if (!at || Date.now() - at < 12 * 3600e3) return;
    if (beats0(q, side).length < 2) return;
    const chip = document.createElement('button'); chip.type = 'button'; chip.className = 'rcChip'; chip.innerHTML = '<small>Previously on</small><b>' + esc(q.title) + '</b><span>▶ Watch the story so far</span>';
    chip.onclick = () => { chip.remove(); play(q, side); }; document.body.appendChild(chip); requestAnimationFrame(() => chip.classList.add('on'));
    setTimeout(() => { chip.classList.remove('on'); setTimeout(() => chip.remove(), 500); }, 14000);
  }
  // the time each case last moved, so the chip knows what "a while ago" is
  function stepped(q, side) { S.qAt = S.qAt || {}; S.qAt[side ? q.id : 'main' + q.d] = Date.now(); }
  return { play, close, canPlay, offerAtRollCall, stepped, get open() { return !!el; }, get beats() { return beats; } };
}
