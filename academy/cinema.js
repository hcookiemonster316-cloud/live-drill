// The director (owner's call, 2026-11-27): cutscenes for calls, side cases, the story, city events and rare finds,
// cinematic like the opening briefing, with music that fits the moment. This module plays a shot list in the live
// city: letterbox bars come in, the camera glides and pushes through the real streets (the cars and people keep
// moving), close-ups bring up the person's portrait and their line, title cards and stamps land, slow motion holds a
// beat, and the whole frame takes a color grade for the mood while a cue from the mood library plays over it.
// Tap, Skip or Escape ends it at once. How often scenes play is set in Settings (all / big moments / off), and calls
// only get a beat the first time, on Priority 1, or now and then, so the loop never drags.
//
// Loop: every part of it (take a call, handle it, the city remembers, the career grows). Reads the camera, the
// portraits and the clock; feeds the music (the mood library ducks the score) and the case file.
//
// shots: { k: 'est', at:[x,y], from:[dx,dy], z0, z1, d, card:{top,title,sub} }   an establishing glide
//        { k: 'push', at:[x,y], z0, z1, d }                                      a slow push in
//        { k: 'close', id, at:[x,y], line, d }                                   a close-up with the person's line
//        { k: 'title', kicker, title, sub, d }                                   a title card over the held frame
//        { k: 'caption', text, d } · { k: 'stamp', text, tone, d } · { k: 'slow', d }
export const MOODS = ['tension', 'heartbreak', 'triumph', 'mystery', 'danger', 'humor', 'dawn', 'aftermath', 'pursuit', 'hope', 'eerie', 'resolve'];

export function installCinema(H) {
  const S = H.S, esc = H.esc;
  S.cfg = S.cfg || {}; S.cutSeen = S.cutSeen || {};
  const mode = () => (H.mockOff() ? 'off' : S.cfg.cutscenes || 'all');
  let live = null;
  const wait = (s, tok) => new Promise((ok) => { const id = setTimeout(ok, s * 1000); tok.waits.push(() => { clearTimeout(id); ok(); }); });
  // the frame: bars, the grade, the card, the caption, the close-up panel
  function frame(mood) { const el = document.createElement('div'); el.className = 'cn g-' + (mood || 'resolve');
    el.innerHTML = '<i class="cnBar t"></i><i class="cnBar b"></i><i class="cnGrade"></i><i class="cnVig"></i><div class="cnCard"></div><div class="cnTitle"></div><div class="cnClose"><canvas width="96" height="96"></canvas><div><b></b><small></small><p></p></div></div><div class="cnCap"></div><div class="cnStamp"></div><button type="button" class="cnSkip">Skip ›</button>';
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on')); return el; }
  const type = (el, text, tok, cps) => { el.textContent = ''; let k = 0; const id = setInterval(() => { el.textContent = text.slice(0, ++k); if (k >= text.length) clearInterval(id); }, 1000 / (cps || 40)); tok.waits.push(() => { clearInterval(id); el.textContent = text; }); };
  async function shot(s, el, tok) {
    const M = S.cfg.motion !== false;
    if (s.k === 'est') { const [x, y] = s.at, [dx, dy] = s.from || [-4, 3]; H.cam(x + dx, y + dy, s.z0 || 1.05, 0, true); await wait(.05, tok); H.cam(x, y, s.z1 || 1.55, M ? .5 : 9);
      if (s.card) { const c = el.querySelector('.cnCard'); c.innerHTML = '<small>' + esc(s.card.top || '') + '</small><b></b><span>' + esc(s.card.sub || '') + '</span>'; c.classList.add('on'); type(c.querySelector('b'), s.card.title || '', tok, 34); } }
    if (s.k === 'push') { const [x, y] = s.at; H.cam(x, y, s.z0 || 1.5, 0, !M); await wait(.05, tok); H.cam(x, y, s.z1 || 1.85, M ? .45 : 9); }
    if (s.k === 'close') { if (s.at) H.cam(s.at[0], s.at[1], s.z || 1.95, M ? .7 : 9); const c = el.querySelector('.cnClose'), who = H.who(s.id) || {};
      const cv = c.querySelector('canvas'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 96, 96); try { const p = H.portrait(s.id); if (p) g.drawImage(p, 0, 0, 96, 96); } catch (e) {}
      c.querySelector('b').textContent = who.name || ''; c.querySelector('small').textContent = who.role || ''; c.classList.add('on'); type(c.querySelector('p'), s.line || '', tok, 36); }
    if (s.k === 'title') { const t = el.querySelector('.cnTitle'); t.innerHTML = '<small>' + esc(s.kicker || '') + '</small><b>' + esc(s.title || '') + '</b>' + (s.sub ? '<span>' + esc(s.sub) + '</span>' : ''); t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); }
    if (s.k === 'caption') { const c = el.querySelector('.cnCap'); c.classList.add('on'); type(c, s.text || '', tok, 38); }
    if (s.k === 'stamp') { const c = el.querySelector('.cnStamp'); c.className = 'cnStamp ' + (s.tone || 'good'); c.textContent = s.text || ''; void c.offsetWidth; c.classList.add('on'); H.thud(s.tone); }
    if (s.k === 'slow' && M) H.slow(s.d || .8);
    await wait(s.d || 2, tok);
    if (s.k === 'close') el.querySelector('.cnClose').classList.remove('on');
    if (s.k === 'title' && !s.keep) el.querySelector('.cnTitle').classList.remove('on');
  }
  // play a scene: resolves when it ends (or is skipped). opts: { mood, music: false, key, big }
  function play(shots, opts, done) {
    opts = opts || {};
    if (live || mode() === 'off' || (mode() === 'big' && !opts.big) || !H.ready()) { done && done(false); return; }
    const tok = { waits: [], dead: false }, el = frame(opts.mood), stopMusic = opts.music === false ? () => {} : H.cue(opts.mood || 'resolve');
    H.lock(true); live = { tok };
    const end = () => { if (tok.dead) return; tok.dead = true; tok.waits.forEach((f) => f()); live = null; stopMusic(); H.lock(false); H.release(); el.classList.remove('on'); el.classList.add('out'); setTimeout(() => el.remove(), 500); if (opts.key) { S.cutSeen[opts.key] = (S.cutSeen[opts.key] || 0) + 1; H.save(); } done && done(true); };
    el.querySelector('.cnSkip').onclick = (e) => { e.stopPropagation(); end(); }; el.onclick = end;
    const esc0 = (e) => { if (e.key === 'Escape' && !tok.dead) { removeEventListener('keydown', esc0); end(); } }; addEventListener('keydown', esc0);
    (async () => { for (const s of shots) { if (tok.dead) return; await shot(s, el, tok); } end(); })();
  }

  // ---------------- service calls: an arrival shot and a resolution beat ----------------
  const hhmm = () => { const h = H.hour(); return String(Math.floor(h)).padStart(2, '0') + String(Math.floor((h % 1) * 60)).padStart(2, '0') + ' HRS'; };
  const callMood = (c) => (c.pursuit ? 'pursuit' : c.prio === 1 ? 'danger' : H.investigates(c) ? 'mystery' : c.prio === 2 ? 'tension' : H.hour() < 9 ? 'dawn' : 'hope');
  // first time for this kind of call, every Priority 1, otherwise about one in three
  const callWorth = (c, phase) => { const k = phase + ':' + c.title; if (!S.cutSeen[k]) return true; if (c.prio === 1) return true; return mode() === 'all' && Math.random() < .33; };
  function callArrive(c, go) {
    if (!callWorth(c, 'arr')) { go(); return; }
    const P = H.me(), from = P ? [P.x - c.x, P.y - c.y] : [-4, 3], len = Math.hypot(from[0], from[1]) || 1, f = Math.min(1, 7 / len);
    const shots = [{ k: 'est', at: [c.x, c.y], from: [from[0] * f, from[1] * f], z0: 1.1, z1: 1.6, d: c.prio === 1 ? 2.6 : 3.2, card: { top: (c.prio === 1 ? 'PRIORITY 1' : c.prio === 2 ? 'PRIORITY 2' : 'ROUTINE') + ' · ' + hhmm(), title: c.title, sub: c.where } }];
    if (c.prio === 1) shots.push({ k: 'slow', d: .9 });
    play(shots, { mood: callMood(c), key: 'arr:' + c.title, big: c.prio === 1 || !S.cutSeen['arr:' + c.title] }, () => go());
  }
  function callResolve(c, go) {
    const e = c.ended; if (!e || !e.line || !callWorth(c, 'res')) { go(); return; }
    const inv = c.inv && c.inv.out, good = e.good, mood = inv === 'wrong' ? 'heartbreak' : good ? (c.prio === 1 ? 'triumph' : 'resolve') : e.read === false ? 'heartbreak' : 'aftermath';
    const stamp = inv === 'open' ? ['CASE OPEN', 'open'] : inv === 'wrong' ? ['WRONG PERSON', 'bad'] : good ? ['CLEARED', 'good'] : ['ON RECORD', 'rough'];
    play([{ k: 'push', at: [c.x, c.y], z0: 1.6, z1: 1.95, d: .1 }, { k: 'caption', text: e.line, d: Math.min(5.5, 1.6 + e.line.length / 38) }, { k: 'stamp', text: stamp[0], tone: stamp[1], d: 1.3 }],
      { mood, key: 'res:' + c.title, big: c.prio === 1 || !S.cutSeen['res:' + c.title] }, () => go());
  }
  return { play, callArrive, callResolve, get on() { return !!live; }, end: () => live && live.tok && live.tok.waits.forEach((f) => f()) };
}
