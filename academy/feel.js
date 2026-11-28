// Feel: interface sounds, footsteps that change with the ground, people who look at you and wave,
// a cruiser that leans into turns and throws its lights across wet roads, and numbers that count up.
import { RANKS } from './data.js';
// where you stand between this rank and the next, 0 to 1
const rankProg = (xp) => { let lo = 0, hi = null; for (const [t] of RANKS) { if (xp >= t) lo = t; else { hi = t; break; } } return hi == null ? 1 : (xp - lo) / (hi - lo); };
const RM = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const rankNext = (xp) => RANKS.find(([t]) => t > xp) || null;
export function installFeel(H) {
  const S = H.S;
  // ---------- sound ----------
  let noise = null;
  function noiseBuf(a) { if (noise) return noise; const n = a.createBuffer(1, a.sampleRate * .25, a.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2); return (noise = n); }
  function thud(freq, q, vol, dur) { if (!S.sound) return; const a = H.audio(); if (!a) return; const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noiseBuf(a); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; const v = vol * (S.cfg.sfx == null ? .8 : S.cfg.sfx), t = a.currentTime; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); s.connect(f); f.connect(g); g.connect(a.destination); s.start(t); s.stop(t + dur + .02); }
  const UI = {
    open: () => { thud(2600, .8, .05, .12); H.beep(740, .05, 'sine', .015, .02); },           // a page turning
    close: () => { thud(1800, .9, .035, .09); },
    tab: () => { H.beep(1180, .03, 'triangle', .02); thud(3200, 2, .02, .04); },
    coin: () => { H.beep(1568, .07, 'square', .012); H.beep(2093, .12, 'square', .01, .06); },
    tick: () => H.beep(1400 + Math.random() * 200, .02, 'triangle', .008)
  };
  // tabs anywhere in the interface get a soft click
  document.addEventListener('click', (e) => { const t = e.target.closest && e.target.closest('[data-j], [data-cd], [data-lc], .lkTabs button, .seg button'); if (t) UI.tab(); }, true);
  // footsteps
  let stepT = 0, lastFace = 0;
  const SURF = { 1: [900, 1.2, .05, .07], 2: [1300, 1.4, .045, .06], 3: [480, .8, .05, .09], 4: [1500, 1.6, .045, .06], 5: [950, 1.2, .05, .07], 9: [2400, .7, .05, .11], 10: [2800, .6, .06, .1], 11: [1100, 1, .05, .08] };
  function steps(dt) {
    const P = H.P; if (!P || !P.moving || P.inCar || H.paused() || H.cine()) { stepT = 0; return; } stepT -= dt; if (stepT > 0) return; stepT = .31;
    if (H.inside) { thud(700, 1.4, .05, .06); return; } const t = H.W && H.W.at ? H.W.at(Math.floor(P.x), Math.floor(P.y)) : 2, s = SURF[t] || SURF[2]; thud(s[0] * (.94 + Math.random() * .12), s[1], s[2] * (H.wet() ? 1.25 : 1), s[3]);
    if (H.wet() && Math.random() < .5) thud(3600, 3, .02, .05);
  }
  // ---------- people react to you ----------
  let fT = 0;
  function faces(dt) { fT -= dt; if (fT > 0) return; fT = .25; const P = H.P; for (const r of H.regs) { const d = Math.hypot(r.x - P.x, r.y - P.y); if (d < 3.4 && !r.moving) r.face = P.x < r.x ? -1 : 1; } }
  // ---------- the cruiser: lean into turns, lights on wet roads ----------
  let roll = 0, lastDir = null;
  function rollIn(g, sx, sy) { const P = H.P; if (lastDir != null && P.dir !== lastDir && P.moving) roll = (((P.dir - lastDir + 6) % 4) - 2 > 0 ? 1 : -1) * .055 * Math.min(1.5, .5 + (P.vel || 3) / 5) * (H.tall ? H.tall() : 1); /* the body rolls more the faster you turn, and more in a tall vehicle */ lastDir = P.dir; roll *= .9; if (Math.abs(roll) < .002 || S.cfg.motion === false) return false; g.save(); g.translate(sx, sy); g.rotate(roll); g.translate(-sx, -sy); return true; }
  function wetLights(g, sx, sy, now) {
    if (!H.wet() || !H.lightsOn()) return; const ph = Math.floor(now / 160) % 2, a = .35;
    g.save(); g.globalCompositeOperation = 'lighter';
    [[-1, '255,40,60'], [1, '40,110,255']].forEach(([side, c], k) => { const on = (k === ph); const gr = g.createRadialGradient(sx + side * 10, sy + 8, 0, sx + side * 10, sy + 8, 34); gr.addColorStop(0, 'rgba(' + c + ',' + (on ? a : a * .25) + ')'); gr.addColorStop(1, 'rgba(' + c + ',0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(sx + side * 10, sy + 10, 34, 12, 0, 0, 7); g.fill(); });
    g.restore();
  }
  // the rank bar under your rank: how close the next promotion is, filled as the RP lands
  let bar = null;
  function barOf() { if (bar && bar.isConnected) return bar; const el = H.$('hRank'); if (!el) return null; bar = document.createElement('i'); bar.id = 'hRkBar'; bar.innerHTML = '<b></b>'; el.after(bar); return bar; }
  function barSet(xp) { const b = barOf(); if (!b) return; const k = Math.max(0, Math.min(1, rankProg(xp))); b.firstChild.style.transform = 'scaleX(' + k.toFixed(3) + ')'; b.classList.toggle('near', k >= .85 && k < 1);
    const nx = rankNext(xp); if (b._nx !== (nx && nx[0])) { b._nx = nx && nx[0]; b.title = nx ? (nx[0] - xp) + ' RP to ' + nx[1] : 'Top rank'; } }
  // ---------- rewards that travel: RP bursts from where you earned it and flies into the counter ----------
  let holdTo = 0, flyN = 0;
  function fly(xp, x, y) {
    const el = H.$('hRank'); if (!el || S.cfg.motion === false || RM.matches || !el.offsetParent || document.hidden || flyN > 40) return;
    const r = el.getBoundingClientRect(), tx = r.left + Math.min(r.width * .55, 120), ty = r.top + r.height / 2, n = Math.max(3, Math.min(12, Math.round(Math.sqrt(xp) / 1.4)));
    x = Math.max(20, Math.min(innerWidth - 20, x)); y = Math.max(60, Math.min(innerHeight - 60, y));
    const now = performance.now(); let first = 1e9;
    for (let k = 0; k < n; k++) { const m = document.createElement('i'); m.className = 'mote'; document.body.appendChild(m); flyN++;
      const ang = -Math.PI / 2 + (k / (n - 1 || 1) - .5) * 2.6 + (Math.random() - .5) * .4, rad = 26 + Math.random() * 26, bx = x + Math.cos(ang) * rad, by = y + Math.sin(ang) * rad, delay = 40 + k * 38, dur = 560 + Math.random() * 140;
      first = Math.min(first, delay + dur);
      const an = m.animate([{ transform: 'translate(' + x + 'px,' + y + 'px) scale(.3)', opacity: 0 }, { transform: 'translate(' + bx + 'px,' + by + 'px) scale(1.15)', opacity: 1, offset: .22, easing: 'cubic-bezier(.55,0,.8,.2)' }, { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(.55)', opacity: .95 }],
        { duration: dur, delay, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'backwards' });
      an.onfinish = () => { m.remove(); flyN--; H.beep(1250 + k * 85, .03, 'triangle', .011); if (k === n - 1) { el.classList.remove('land'); requestAnimationFrame(() => el.classList.add('land')); if (H.buzz) H.buzz('tap'); } }; }
    holdTo = now + first; // the counter waits for the first mote to land
  }
  // ---------- numbers that count up ----------
  const disp = { xp: null, cash: null, t: 0 }; let raf = 0, holdT = 0;
  function rankLine(prefix, rankName, xp, cash) {
    const el = H.$('hRank'); if (!el) return; if (disp.xp == null) { disp.xp = xp; disp.cash = cash; barSet(xp); }
    const wait = holdTo - performance.now(); clearTimeout(holdT); if (wait > 16 && (xp > disp.xp || cash > disp.cash)) { holdT = setTimeout(() => rankLine(prefix, rankName, xp, cash), wait); return; }
    const fromX = disp.xp, fromC = disp.cash, up = xp > fromX || cash > fromC, t0 = performance.now(), dur = Math.min(900, 300 + Math.abs(xp - fromX) * 4), txt = (a, c) => prefix + rankName + ' · ' + a + ' RP · $' + c;
    if (up) { /* the pulse restarts next frame: no forced layout right after a debrief is built */ el.classList.remove('pulse'); cancelAnimationFrame(el._pr); el._pr = requestAnimationFrame(() => el.classList.add('pulse')); if (cash > fromC) UI.coin(); }
    cancelAnimationFrame(raf); let ticks = 0;
    const step = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); disp.xp = Math.round(fromX + (xp - fromX) * e); disp.cash = Math.round(fromC + (cash - fromC) * e); const t = txt(disp.xp, disp.cash); if (el._t !== t) { el._t = t; el.textContent = t; } barSet(disp.xp); if (up && ++ticks % 4 === 0 && k < 1) UI.tick(); if (k < 1) raf = requestAnimationFrame(step); };
    if (!up || S.cfg.motion === false) { disp.xp = xp; disp.cash = cash; const t = txt(xp, cash); if (el._t !== t) { el._t = t; el.textContent = t; } barSet(xp); } else raf = requestAnimationFrame(step);
  }
  // ---------- the drive: an engine note that follows the speed, tire marks on hard braking and fast corners ----------
  // marks are kept in world tiles and stroked in one path per run, two lines (the rear wheels) a little apart; they fade
  // over half a minute (longer and fainter on wet roads, where a skid runs further)
  const MARKS = []; let run = null, lastH = null, lastX = 0, lastY = 0, eng = null;
  function engine(v, on) { const a = S.sound ? H.audio() : null; if (!a) return;
    if (!eng) { if (!on) return; const o1 = a.createOscillator(), o2 = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(); o1.type = 'sawtooth'; o2.type = 'square'; o2.detune.value = 9; f.type = 'lowpass'; f.frequency.value = 260; f.Q.value = 2; g.gain.value = 0;
      o1.connect(f); o2.connect(f); f.connect(g).connect(a.destination); o1.start(); o2.start(); eng = { o1, o2, f, g }; }
    const t = a.currentTime, vol = (S.cfg.sfx != null ? S.cfg.sfx : .8), k = Math.min(1, v / 7), key = (on ? 1 : 0) + Math.round(k * 40) / 100; if (eng.key === key) return; eng.key = key; /* the audio engine is told only when the speed has changed */
    eng.o1.frequency.setTargetAtTime(34 + k * 52, t, .25); eng.o2.frequency.setTargetAtTime(17 + k * 26, t, .25); eng.f.frequency.setTargetAtTime(180 + k * 520, t, .3);
    eng.g.gain.setTargetAtTime(on ? (.008 + k * .016) * vol : 0, t, on ? .3 : .12); }
  function drive(dt, P, wet, quiet) {
    const car = P.inCar && !P.boat, v = car ? (P.vel || 0) : 0; engine(v, car && !quiet);
    if (!car || dt <= 0) { run = null; lastH = null; return; }
    const dx = P.x - lastX, dy = P.y - lastY, d = Math.hypot(dx, dy); lastX = P.x; lastY = P.y; if (d < .0005 || d > 1) { run = null; return; }
    const h = Math.atan2(dy, dx), turn = lastH == null ? 0 : Math.abs(Math.atan2(Math.sin(h - lastH), Math.cos(h - lastH))) / dt; lastH = h;
    const hard = v > 2.6 && ((P.pitch || 0) > .32 || (turn > 2.4 && v > 3.4));
    if (hard) { const now = performance.now(); if (!run) { run = { pts: [], t: now, wet: !!wet, did: H.W && H.W.did }; MARKS.push(run); if (MARKS.length > 40) MARKS.shift(); if (S.sound) thud(wet ? 2400 : 900, .7, wet ? .03 : .045, .25); }
      const L = run.pts[run.pts.length - 1]; if (!L || Math.hypot(L[0] - P.x, L[1] - P.y) > .12) { run.pts.push([P.x, P.y, -Math.sin(h), Math.cos(h)]); run.t = now; } if (run.pts.length > 60) run = null; }
    else run = null; }
  function marksDraw(g, iso, now) { if (!MARKS.length) return; g.save(); g.lineCap = 'round'; g.lineWidth = 2.8;
    for (let m = MARKS.length - 1; m >= 0; m--) { const r = MARKS[m], age = (now - r.t) / 1000, life = r.wet ? 45 : 30; if (age > life) { MARKS.splice(m, 1); continue; } if (r.pts.length < 2 || H.inside || !H.W || r.did !== H.W.did) continue; /* marks stay in their own district */
      const fade = Math.min(1, (1 - age / life) * 1.6); g.strokeStyle = r.wet ? 'rgba(2,3,5,' + (.62 * fade).toFixed(3) + ')' : 'rgba(0,0,0,' + (.88 * fade).toFixed(3) + ')'; /* holds dark most of its life, then fades */ g.beginPath();
      for (const side of [-.16, .16]) r.pts.forEach(([x, y, px, py], i) => { const [sx, sy] = iso(x + px * side, y + py * side); if (i) g.lineTo(sx, sy); else g.moveTo(sx, sy); }); g.stroke(); }
    g.restore(); }
  function tick(dt) { steps(dt); faces(dt); }
  return { UI, tick, rollIn, wetLights, rankLine, fly, drive, marksDraw, get marks() { return MARKS.length; } };
}
