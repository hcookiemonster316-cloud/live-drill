// The studio and engine cards (owner's call, 2026-11-27): cinematic, epic, with their own sound design.
// Meridian Forge: a hammer strike in the dark throws sparks, the star mark is drawn in molten gold and the name is
// lit by a passing sweep while embers rise. Sentry Engine: a screen powers on, a wireframe city builds out from the
// middle, a radar sweep pings each block as it passes, and the name glitches in on a bass hit.
// Everything is drawn and synthesized here, from scratch. Reduced motion keeps the cards and drops the flash and shake.
// Loop: the academy is the frame. Reads the sound and motion settings; hands off to the advisory cards and the title.
export function installSplash(X) {
  const S = X.S, motion = () => !(S.cfg && S.cfg.motion === false);
  // ---------- sound ----------
  const A = () => (S.sound ? X.audio() : null), V = () => (S.cfg && S.cfg.sfx != null ? S.cfg.sfx : .8);
  const out = (a) => { const c = a.createDynamicsCompressor(); c.threshold.value = -14; c.ratio.value = 4; c.connect(a.destination); return c; };
  function noise(a, dur) { const b = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = a.createBufferSource(); s.buffer = b; return s; }
  function env(a, g, t, peak, att, dec) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + att); g.gain.exponentialRampToValueAtTime(.0001, t + att + dec); }
  // a hammer on an anvil: inharmonic ringing partials over a short burst of grit
  function clang(at) { const a = A(); if (!a) return; const t = a.currentTime + at, o = out(a), base = 523;
    [[1, .36, 2.4], [2.76, .2, 1.6], [5.4, .12, 1.1], [8.93, .07, .7], [13.3, .04, .4]].forEach(([m, v, d]) => { const s = a.createOscillator(), g = a.createGain(); s.type = 'sine'; s.frequency.value = base * m; env(a, g, t, v * V(), .002, d); s.connect(g).connect(o); s.start(t); s.stop(t + d + .1); });
    const n = noise(a, .2), f = a.createBiquadFilter(), g = a.createGain(); f.type = 'highpass'; f.frequency.value = 3000; env(a, g, t, .32 * V(), .001, .12); n.connect(f).connect(g).connect(o); n.start(t); }
  function boom(at, f0, dur, v) { const a = A(); if (!a) return; const t = a.currentTime + at, s = a.createOscillator(), g = a.createGain(); s.type = 'sine'; s.frequency.setValueAtTime(f0 || 90, t); s.frequency.exponentialRampToValueAtTime(28, t + (dur || 2)); env(a, g, t, (v || .55) * V(), .03, dur || 2); s.connect(g).connect(out(a)); s.start(t); s.stop(t + (dur || 2) + .2); }
  function shimmer(at, dur) { const a = A(); if (!a) return; const t = a.currentTime + at, o = out(a); [1568, 2093, 2637, 3136].forEach((f, k) => { const s = a.createOscillator(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain(); s.type = 'sine'; s.frequency.value = f; lfo.frequency.value = 5 + k * 1.3; lg.gain.value = 6; lfo.connect(lg).connect(s.frequency); env(a, g, t + k * .08, .028 * V(), .4, dur); s.connect(g).connect(o); s.start(t); lfo.start(t); s.stop(t + dur + .6); lfo.stop(t + dur + .6); }); }
  function zap(at) { const a = A(); if (!a) return; const t = a.currentTime + at, s = a.createOscillator(), g = a.createGain(); s.type = 'sawtooth'; s.frequency.setValueAtTime(2400, t); s.frequency.exponentialRampToValueAtTime(60, t + .25); env(a, g, t, .08 * V(), .005, .25); s.connect(g).connect(out(a)); s.start(t); s.stop(t + .3); }
  function sweep(at, dur) { const a = A(); if (!a) return; const t = a.currentTime + at, o = out(a); [0, 7].forEach((det) => { const s = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(); s.type = 'sawtooth'; s.frequency.value = 55 * Math.pow(2, det / 12); f.type = 'lowpass'; f.Q.value = 9; f.frequency.setValueAtTime(120, t); f.frequency.exponentialRampToValueAtTime(3200, t + dur); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.06 * V(), t + dur * .8); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .3); s.connect(f).connect(g).connect(o); s.start(t); s.stop(t + dur + .4); }); }
  function ping(at, f) { const a = A(); if (!a) return; const t = a.currentTime + at, s = a.createOscillator(), g = a.createGain(); s.type = 'sine'; s.frequency.value = f || 1320; env(a, g, t, .06 * V(), .004, .5); s.connect(g).connect(out(a)); s.start(t); s.stop(t + .6); }

  // ---------- pictures ----------
  function stage(el) { const cv = document.createElement('canvas'); cv.className = 'spCv'; el.appendChild(cv); const dpr = Math.min(2, devicePixelRatio || 1);
    const fit = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }; fit(); const g = cv.getContext('2d'); return { cv, g, dpr, fit }; }
  // the star mark as one path, so it can be drawn like a line of molten metal
  function starPath(g, cx, cy, R) { const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? R * .42 : R, a = -Math.PI / 2 + i * Math.PI / 5; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return pts; }
  function drawPart(g, pts, u) { // a polyline drawn up to fraction u of its length
    let L = 0; const seg = []; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], d = Math.hypot(q[0] - p[0], q[1] - p[1]); seg.push(d); L += d; }
    let left = L * u; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 0; i < pts.length && left > 0; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], k = Math.min(1, left / seg[i]); g.lineTo(p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k); left -= seg[i]; } g.stroke(); }

  function forge(el, done) {
    const { cv, g, dpr } = stage(el), W = cv.width, H = cv.height, cx = W / 2, cy = H * .42, R = Math.min(W, H) * .11, M = motion();
    el.insertAdjacentHTML('beforeend', '<div class="spName forge"><b>' + 'MERIDIAN FORGE'.split('').map((c, i) => '<i style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</i>').join('') + '</b><span>INTERACTIVE</span></div>');
    const sparks = [], embers = []; let struck = false, glow = null;
    clang(.55); boom(.56, 95, 2.4, .5); shimmer(1.6, 2.2);
    const t0 = performance.now(); let raf = 0;
    const loop = (now) => { const t = (now - t0) / 1000; g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#04060c'; g.fillRect(0, 0, W, H);
      if (!struck && t > .55) { struck = true; for (let i = 0; i < (M ? 140 : 40); i++) { const a = Math.random() * Math.PI * 2, v = (3 + Math.random() * 11) * dpr; sparks.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3 * dpr, l: 1, w: (1 + Math.random() * 1.6) * dpr }); } }
      // the forge glow, rising after the strike
      const heat = t < .55 ? t / .55 * .15 : Math.min(1, .5 + (t - .55) * .6) * (t > 3.6 ? Math.max(0, 1 - (t - 3.6) * 2) : 1);
      if (!glow) { const c = document.createElement('canvas'); c.width = W; c.height = H; const b = c.getContext('2d'), gr = b.createRadialGradient(cx, cy, 0, cx, cy, R * 4.2); gr.addColorStop(0, 'rgba(255,170,40,.32)'); gr.addColorStop(.45, 'rgba(200,70,10,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); b.fillStyle = gr; b.fillRect(0, 0, W, H); glow = c; } // painted once, stamped at this frame's heat
      if (heat > 0) { g.globalAlpha = heat; g.drawImage(glow, 0, 0); g.globalAlpha = 1; }
      if (M && t > .55 && t < .75) { g.fillStyle = 'rgba(255,240,210,' + (1 - (t - .55) / .2) * .4 + ')'; g.fillRect(0, 0, W, H); } // the flash of the strike
      // sparks: fast, falling, cooling from white to red
      g.globalCompositeOperation = 'lighter';
      for (const p of sparks) { if (p.l <= 0) continue; const px = p.x, py = p.y; p.x += p.vx; p.y += p.vy; p.vx *= .975; p.vy = p.vy * .975 + .22 * dpr; p.l -= .011;
        g.strokeStyle = p.l > .7 ? 'rgba(255,245,220,' + p.l + ')' : p.l > .35 ? 'rgba(255,170,50,' + p.l + ')' : 'rgba(230,70,20,' + p.l + ')'; g.lineWidth = p.w; g.beginPath(); g.moveTo(px, py); g.lineTo(p.x, p.y); g.stroke(); }
      if (t > 1.2 && embers.length < 60 && Math.random() < .5) embers.push({ x: cx + (Math.random() - .5) * R * 5, y: H * .9, vy: -(.4 + Math.random()) * dpr, l: 1, s: (1 + Math.random() * 1.5) * dpr, ph: Math.random() * 9 });
      for (const e of embers) { e.y += e.vy; e.l -= .004; e.x += Math.sin(t * 2 + e.ph) * .3 * dpr; g.fillStyle = 'rgba(255,150,40,' + Math.max(0, e.l) * .7 + ')'; g.beginPath(); g.arc(e.x, e.y, e.s, 0, 7); g.fill(); }
      // the mark: a ring, then the star, drawn like molten metal and cooling to gold
      if (t > .6) { const u1 = Math.min(1, (t - .6) / .9), u2 = Math.min(1, Math.max(0, (t - 1.05) / .9)), cool = Math.min(1, Math.max(0, (t - 1.6) / 1.2));
        g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = 'rgba(255,170,40,.9)'; g.shadowBlur = (24 - cool * 12) * dpr; g.lineWidth = 3.2 * dpr;
        g.strokeStyle = 'rgb(255,' + Math.round(235 - cool * 51) + ',' + Math.round(180 - cool * 180) + ')';
        g.beginPath(); g.arc(cx, cy, R * 1.25, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * u1); g.stroke();
        if (u2 > 0) drawPart(g, starPath(g, cx, cy, R), u2); g.shadowBlur = 0; }
      g.globalCompositeOperation = 'source-over';
      if (t > 3.75) { g.fillStyle = 'rgba(4,6,12,' + Math.min(1, (t - 3.75) * 2.5) + ')'; g.fillRect(0, 0, W, H); }
      if (t < 4.2 && live) raf = requestAnimationFrame(loop); else finish(); };
    let live = true; const finish = () => { if (!live) return; live = false; cancelAnimationFrame(raf); done(); };
    raf = requestAnimationFrame(loop); el.classList.add('spForge'); if (M) el.classList.add('spShake');
    return () => finish();
  }

  function sentry(el, done) {
    const { cv, g, dpr } = stage(el), W = cv.width, H = cv.height, cx = W / 2, cy = H * .5, M = motion();
    el.insertAdjacentHTML('beforeend', '<div class="spName eng"><b data-t="SENTRY ENGINE">SENTRY ENGINE</b><span>REAL-TIME CITY SIMULATION</span></div>');
    // a wireframe city on an isometric grid: each block knows how far it is from the middle and how tall it gets
    const N = 9, step = Math.min(W, H) * .055, blocks = [];
    for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) { const d = Math.hypot(i, j); if (d > N) continue; const h = (Math.abs(i) + Math.abs(j)) % 3 === 0 && Math.random() < .55 ? (.5 + Math.random() * (1.6 - d / N)) * step * 1.6 : 0; blocks.push({ i, j, d, h, a: Math.atan2(j + i, (i - j)), pinged: 0 }); }
    const iso = (i, j, z) => [cx + (i - j) * step, cy + (i + j) * step * .5 - (z || 0)];
    zap(.05); sweep(.3, 1.8); boom(2.2, 70, 2, .6); ping(2.2, 880);
    const t0 = performance.now(); let raf = 0, lastA = 0;
    const loop = (now) => { const t = (now - t0) / 1000; g.fillStyle = '#02060d'; g.fillRect(0, 0, W, H);
      if (t < .35) { const k = t / .35; g.fillStyle = 'rgba(200,235,255,' + (1 - k) * .9 + ')'; g.fillRect(0, cy - 1 * dpr, W, 2 * dpr * (1 + k * 3)); } // the screen powering on
      const grow = Math.max(0, (t - .3) / 1.4) * N * 1.15, beamA = t > 1.4 ? (t - 1.4) * 3.2 : -9, fade = t > 3.6 ? Math.max(0, 1 - (t - 3.6) * 2.5) : 1, gold = t > 2.2 && t < 2.6 ? 1 - Math.abs(t - 2.4) / .2 : 0;
      g.globalCompositeOperation = 'lighter'; g.lineWidth = 1 * dpr;
      // the ground grid, drawn out from the middle
      for (let i = -N; i <= N; i++) { const r = Math.min(N, Math.max(0, grow - Math.abs(i))); if (r <= 0) continue; const a = iso(i, -r), b = iso(i, r); g.strokeStyle = 'rgba(56,189,248,' + .22 * fade + ')'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); const c = iso(-r, i), d = iso(r, i); g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.stroke(); }
      // the blocks rise when the grid reaches them, and light up when the sweep passes
      for (const B of blocks) { if (!B.h || B.d > grow) continue; const up = Math.min(1, (grow - B.d) / 2) * B.h, rel = ((beamA - (B.a + Math.PI)) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2), lit = beamA > 0 && rel < .5 ? 1 - rel / .5 : 0;
        if (lit > .9 && !B.pinged && M) { B.pinged = 1; if (Math.random() < .35) ping(0, 1100 + Math.random() * 600); }
        const c = gold ? '245,184,0' : '56,189,248', al = (.35 + lit * .65) * fade, s = step * .38, [x0, y0] = iso(B.i, B.j, 0), [x1, y1] = iso(B.i, B.j, up);
        g.strokeStyle = 'rgba(' + c + ',' + al + ')'; g.beginPath(); g.moveTo(x0 - s, y0); g.lineTo(x1 - s, y1); g.moveTo(x0 + s, y0); g.lineTo(x1 + s, y1); g.moveTo(x1 - s, y1); g.lineTo(x1, y1 - s * .5); g.lineTo(x1 + s, y1); g.lineTo(x1, y1 + s * .5); g.closePath(); g.stroke(); }
      // the radar sweep: a soft wedge turning around the middle
      if (beamA > 0 && fade > 0) { g.save(); g.translate(cx, cy); g.scale(1, .5); const R = N * step * 1.45; for (let k = 0; k < 14; k++) { const a0 = beamA - k * .05; g.fillStyle = 'rgba(56,189,248,' + (.07 * (1 - k / 14)) * fade + ')'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, a0 - .05, a0); g.closePath(); g.fill(); } g.restore(); }
      g.globalCompositeOperation = 'source-over';
      if (t < 4.1 && live) raf = requestAnimationFrame(loop); else finish(); };
    let live = true; const finish = () => { if (!live) return; live = false; cancelAnimationFrame(raf); done(); };
    raf = requestAnimationFrame(loop); el.classList.add('spEng');
    return () => finish();
  }
  // both cards in order; stop() ends whichever is showing
  function play(el, done, skip) { let stop = null, over = false; const end = () => { if (over) return; over = true; done(); };
    const host = () => { el.innerHTML = '<button type="button" class="bootSkip">Skip ›</button>'; el.className = 'fe boot spOn'; el.querySelector('.bootSkip').onclick = (e) => { e.stopPropagation(); over = true; if (stop) stop(); skip(); }; };
    host(); stop = forge(el, () => { if (over) return; host(); stop = sentry(el, end); });
    return () => { over = true; if (stop) stop(); }; }
  return { play };
}
