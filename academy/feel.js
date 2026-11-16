// Feel: interface sounds, footsteps that change with the ground, people who look at you and wave,
// a cruiser that leans into turns and throws its lights across wet roads, and numbers that count up.
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
  function rollIn(g, sx, sy) { const P = H.P; if (lastDir != null && P.dir !== lastDir && P.moving) roll = (((P.dir - lastDir + 6) % 4) - 2 > 0 ? 1 : -1) * .07; lastDir = P.dir; roll *= .9; if (Math.abs(roll) < .002 || S.cfg.motion === false) return false; g.save(); g.translate(sx, sy); g.rotate(roll); g.translate(-sx, -sy); return true; }
  function wetLights(g, sx, sy, now) {
    if (!H.wet() || !H.lightsOn()) return; const ph = Math.floor(now / 160) % 2, a = .35;
    g.save(); g.globalCompositeOperation = 'lighter';
    [[-1, '255,40,60'], [1, '40,110,255']].forEach(([side, c], k) => { const on = (k === ph); const gr = g.createRadialGradient(sx + side * 10, sy + 8, 0, sx + side * 10, sy + 8, 34); gr.addColorStop(0, 'rgba(' + c + ',' + (on ? a : a * .25) + ')'); gr.addColorStop(1, 'rgba(' + c + ',0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(sx + side * 10, sy + 10, 34, 12, 0, 0, 7); g.fill(); });
    g.restore();
  }
  // ---------- numbers that count up ----------
  const disp = { xp: null, cash: null, t: 0 }; let raf = 0;
  function rankLine(prefix, rankName, xp, cash) {
    const el = H.$('hRank'); if (!el) return; if (disp.xp == null) { disp.xp = xp; disp.cash = cash; }
    const fromX = disp.xp, fromC = disp.cash, up = xp > fromX || cash > fromC, t0 = performance.now(), dur = Math.min(900, 300 + Math.abs(xp - fromX) * 4);
    if (up) { el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); if (cash > fromC) UI.coin(); }
    cancelAnimationFrame(raf); let ticks = 0;
    const step = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); disp.xp = Math.round(fromX + (xp - fromX) * e); disp.cash = Math.round(fromC + (cash - fromC) * e); el.textContent = prefix + rankName + ' · ' + disp.xp + ' RP · $' + disp.cash; if (up && ++ticks % 4 === 0 && k < 1) UI.tick(); if (k < 1) raf = requestAnimationFrame(step); };
    if (!up || S.cfg.motion === false) { disp.xp = xp; disp.cash = cash; el.textContent = prefix + rankName + ' · ' + xp + ' RP · $' + cash; } else raf = requestAnimationFrame(step);
  }
  function tick(dt) { steps(dt); faces(dt); }
  return { UI, tick, rollIn, wetLights, rankLine };
}
