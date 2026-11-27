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
  function rumble(at, dur) { const a = A(); if (!a) return; const t = a.currentTime + at, n = noise(a, dur + .2), f = a.createBiquadFilter(), g = a.createGain(); f.type = 'lowpass'; f.frequency.setValueAtTime(90, t); f.frequency.linearRampToValueAtTime(220, t + dur); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.22 * V(), t + dur); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .15); n.connect(f).connect(g).connect(out(a)); n.start(t); n.stop(t + dur + .2); }
  function zap(at) { const a = A(); if (!a) return; const t = a.currentTime + at, s = a.createOscillator(), g = a.createGain(); s.type = 'sawtooth'; s.frequency.setValueAtTime(2400, t); s.frequency.exponentialRampToValueAtTime(60, t + .25); env(a, g, t, .08 * V(), .005, .25); s.connect(g).connect(out(a)); s.start(t); s.stop(t + .3); }
  function sweep(at, dur) { const a = A(); if (!a) return; const t = a.currentTime + at, o = out(a); [0, 7].forEach((det) => { const s = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(); s.type = 'sawtooth'; s.frequency.value = 55 * Math.pow(2, det / 12); f.type = 'lowpass'; f.Q.value = 9; f.frequency.setValueAtTime(120, t); f.frequency.exponentialRampToValueAtTime(3200, t + dur); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.06 * V(), t + dur * .8); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .3); s.connect(f).connect(g).connect(o); s.start(t); s.stop(t + dur + .4); }); }
  function ping(at, f) { const a = A(); if (!a) return; const t = a.currentTime + at, s = a.createOscillator(), g = a.createGain(); s.type = 'sine'; s.frequency.value = f || 1320; env(a, g, t, .06 * V(), .004, .5); s.connect(g).connect(out(a)); s.start(t); s.stop(t + .6); }

  // ---------- pictures ----------
  // an opaque canvas (nothing behind it to blend), sized to the screen
  function stage(el) { const cv = document.createElement('canvas'); cv.className = 'spCv'; el.appendChild(cv); const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr); const g = cv.getContext('2d', { alpha: false }); return { cv, g, dpr }; }
  const off = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return [c, c.getContext('2d')]; };
  // one clock for picture and sound: it starts on the first frame actually drawn, and the picture waits out the audio
  // output delay (Bluetooth and phone speakers lag), so the strike you see and the clang you hear land together
  function clock(onStart) { let t0 = 0, lag = 0; return (now) => { if (!t0) { t0 = now; const a = A(); lag = a ? Math.min(.25, (a.outputLatency || 0) + (a.baseLatency || 0)) : 0; onStart(lag); } return Math.max(0, (now - t0) / 1000 - lag); }; }
  // the star mark as one path, so it can be drawn like a line of molten metal
  function starPath(cx, cy, R) { const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? R * .42 : R, a = -Math.PI / 2 + i * Math.PI / 5; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return pts; }
  function partPath(g, pts, u) { // a polyline up to fraction u of its length
    let L = 0; const seg = []; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], d = Math.hypot(q[0] - p[0], q[1] - p[1]); seg.push(d); L += d; }
    let left = L * u; g.moveTo(pts[0][0], pts[0][1]); for (let i = 0; i < pts.length && left > 0; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], k = Math.min(1, left / seg[i]); g.lineTo(p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k); left -= seg[i]; } }
  const SPARKC = ['255,245,220', '255,170,50', '230,70,20'];

  function forge(el, done) {
    const { cv, g, dpr } = stage(el), W = cv.width, H = cv.height, cx = W / 2, cy = H * .42, R = Math.min(W, H) * .11, M = motion();
    // painted before the first frame: the forge glow (a quarter size, it is all soft gradient) and the star's points
    const [glow, gb] = off(W / 4, H / 4); { const gr = gb.createRadialGradient(cx / 4, cy / 4, 0, cx / 4, cy / 4, R * 4.2 / 4); gr.addColorStop(0, 'rgba(255,170,40,.32)'); gr.addColorStop(.45, 'rgba(200,70,10,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); gb.fillStyle = gr; gb.fillRect(0, 0, W / 4, H / 4); }
    const star = starPath(cx, cy, R), sparks = [], embers = [], S0 = 1.1, END = 6.4; let struck = false, last = 0, raf = 0, live = true; // S0: the strike, after a slow build in the dark
    const T = clock((lag) => { rumble(.1 + lag, S0 - .1); clang(S0 + lag); boom(S0 + .01 + lag, 95, 3.2, .55); shimmer(S0 + 1.05 + lag, 3.4); // sound and the CSS parts start with the first frame
      setTimeout(() => { if (!live) return; el.insertAdjacentHTML('beforeend', '<div class="spName forge"><b>' + 'MERIDIAN FORGE'.split('').map((c, i) => '<i style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</i>').join('') + '</b><span>INTERACTIVE</span></div>'); }, (lag + S0 - .55) * 1000);
      if (M) setTimeout(() => { if (live) el.classList.add('spShake'); }, (lag + S0) * 1000 - 550); });
    const loop = (now) => { const tt = T(now), k = last ? Math.min(3, (tt - last) * 60) : 1; last = tt; const t = tt - (S0 - .55); // t: the old timeline, with the strike at .55 // k: frames' worth of motion, so a slow phone moves the sparks just as far
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = '#04060c'; g.fillRect(0, 0, W, H);
      if (!struck && t > .55) { struck = true; for (let i = 0; i < (M ? 140 : 40); i++) { const a = Math.random() * Math.PI * 2, v = (3 + Math.random() * 11) * dpr; sparks.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3 * dpr, l: 1, w: (1 + Math.random() * 1.6) * dpr }); } }
      const FADE = END - .8 - (S0 - .55), heat = t < .55 ? Math.max(0, (tt / S0)) * .22 : Math.min(1, .5 + (t - .55) * .6) * (t > FADE ? Math.max(0, 1 - (t - FADE) * 2) : 1); // the glow builds in the dark before the strike
      if (heat > 0) { g.globalAlpha = heat; g.drawImage(glow, 0, 0, W, H); g.globalAlpha = 1; }
      if (M && t > .55 && t < .75) { g.fillStyle = 'rgba(255,240,210,' + (1 - (t - .55) / .2) * .4 + ')'; g.fillRect(0, 0, W, H); } // the flash of the strike
      g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      // sparks: drawn in twelve batches (three colors as they cool, four brightness steps), not one by one
      if (sparks.length) { const B = Array.from({ length: 12 }, () => []); for (const p of sparks) { if (p.l <= 0) continue; const px = p.x, py = p.y, f = Math.pow(.975, k); p.x += p.vx * k; p.y += p.vy * k; p.vx *= f; p.vy = p.vy * f + .22 * dpr * k; p.l -= .011 * k; if (p.l <= 0) continue; const c = p.l > .7 ? 0 : p.l > .35 ? 1 : 2; B[c * 4 + Math.min(3, Math.floor(p.l * 4))].push(px, py, p.x, p.y); }
        g.lineWidth = 1.8 * dpr; for (let b = 0; b < 12; b++) { const a = B[b]; if (!a.length) continue; g.strokeStyle = 'rgba(' + SPARKC[b >> 2] + ',' + ((b & 3) + .5) / 4 + ')'; g.beginPath(); for (let i = 0; i < a.length; i += 4) { g.moveTo(a[i], a[i + 1]); g.lineTo(a[i + 2], a[i + 3]); } g.stroke(); } }
      if (t > 1.2 && embers.length < 60 && Math.random() < .5 * k) embers.push({ x: cx + (Math.random() - .5) * R * 5, y: H * .9, vy: -(.4 + Math.random()) * dpr, l: 1, s: (1 + Math.random() * 1.5) * dpr, ph: Math.random() * 9 });
      if (embers.length) { const B = [[], [], [], []]; for (const e of embers) { e.y += e.vy * k; e.l -= .004 * k; e.x += Math.sin(t * 2 + e.ph) * .3 * dpr * k; if (e.l > 0) B[Math.min(3, Math.floor(e.l * 4))].push(e); }
        for (let b = 0; b < 4; b++) { if (!B[b].length) continue; g.fillStyle = 'rgba(255,150,40,' + ((b + .5) / 4) * .7 + ')'; g.beginPath(); for (const e of B[b]) { g.moveTo(e.x + e.s, e.y); g.arc(e.x, e.y, e.s, 0, 7); } g.fill(); } }
      // the mark: a ring, then the star, drawn like molten metal and cooling to gold. The glow is a wide soft stroke
      // under the line (the same look as a blur, at a fraction of the cost)
      if (t > .6) { const u1 = Math.min(1, (t - .6) / .9), u2 = Math.min(1, Math.max(0, (t - 1.05) / .9)), cool = Math.min(1, Math.max(0, (t - 1.6) / 1.2));
        g.lineJoin = 'round'; g.beginPath(); g.arc(cx, cy, R * 1.25, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * u1); if (u2 > 0) { g.moveTo(star[0][0], star[0][1]); partPath(g, star, u2); }
        [[16 - cool * 6, .12], [9 - cool * 3, .22]].forEach(([w, a]) => { g.lineWidth = w * dpr; g.strokeStyle = 'rgba(255,170,40,' + a + ')'; g.stroke(); });
        g.lineWidth = 3.2 * dpr; g.strokeStyle = 'rgb(255,' + Math.round(235 - cool * 51) + ',' + Math.round(180 - cool * 180) + ')'; g.stroke(); }
      g.globalCompositeOperation = 'source-over';
      if (tt > END - .55) { g.fillStyle = 'rgba(4,6,12,' + Math.min(1, (tt - (END - .55)) * 2.5) + ')'; g.fillRect(0, 0, W, H); }
      if (tt < END && live) raf = requestAnimationFrame(loop); else finish(); };
    const finish = () => { if (!live) return; live = false; cancelAnimationFrame(raf); done(); };
    raf = requestAnimationFrame(loop); el.classList.add('spForge');
    return () => finish();
  }

  function sentry(el, done) {
    const { cv, g, dpr } = stage(el), W = cv.width, H = cv.height, cx = W / 2, cy = H * .5, M = motion();
    // a wireframe city on an isometric grid: each block knows how far it is from the middle and how tall it gets
    const N = 9, step = Math.min(W, H) * .055, blocks = [], RR = N * step * 1.45;
    for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) { const d = Math.hypot(i, j); if (d > N) continue; const h = (Math.abs(i) + Math.abs(j)) % 3 === 0 && Math.random() < .55 ? (.5 + Math.random() * (1.6 - d / N)) * step * 1.6 : 0; if (h) blocks.push({ i, j, d, h, a: Math.atan2(j + i, (i - j)), pinged: 0 }); }
    const iso = (i, j, z) => [cx + (i - j) * step, cy + (i + j) * step * .5 - (z || 0)];
    // the radar wedge, painted once (a soft fan) and turned each frame
    const [wedge, wb] = off(RR * 2, RR * 2); for (let q = 0; q < 14; q++) { wb.fillStyle = 'rgba(56,189,248,' + .07 * (1 - q / 14) + ')'; wb.beginPath(); wb.moveTo(RR, RR); wb.arc(RR, RR, RR, -q * .05 - .05, -q * .05); wb.closePath(); wb.fill(); }
    let raf = 0, live = true;
    const HIT = 2.7, END = 6; // the name and the bass hit, and the end
    const T = clock((lag) => { zap(.05 + lag); sweep(.3 + lag, HIT - .4); boom(HIT + lag, 70, 2.6, .6); ping(HIT + lag, 880);
      setTimeout(() => { if (live) el.insertAdjacentHTML('beforeend', '<div class="spName eng"><b data-t="SENTRY ENGINE">SENTRY ENGINE</b><span>REAL-TIME CITY SIMULATION</span></div>'); }, (lag + HIT - 2.15) * 1000); });
    const AL = 6; // block brightness in six steps: six strokes a frame instead of one per block
    const loop = (now) => { const t = T(now); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#02060d'; g.fillRect(0, 0, W, H);
      if (t < .35) { const k = t / .35; g.fillStyle = 'rgba(200,235,255,' + (1 - k) * .9 + ')'; g.fillRect(0, cy - 1 * dpr, W, 2 * dpr * (1 + k * 3)); } // the screen powering on
      const grow = Math.max(0, (t - .3) / 1.9) * N * 1.15, beamA = t > 1.6 ? (t - 1.6) * 2.6 : -9, fade = t > END - .5 ? Math.max(0, 1 - (t - (END - .5)) * 2.5) : 1, gold = t > HIT && t < HIT + .4 ? 1 - Math.abs(t - HIT - .2) / .2 : 0;
      g.globalCompositeOperation = 'lighter'; g.lineWidth = 1 * dpr;
      // the ground grid, drawn out from the middle: one path
      g.strokeStyle = 'rgba(56,189,248,' + .22 * fade + ')'; g.beginPath();
      for (let i = -N; i <= N; i++) { const r = Math.min(N, Math.max(0, grow - Math.abs(i))); if (r <= 0) continue; const a = iso(i, -r), b = iso(i, r), c = iso(-r, i), d = iso(r, i); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.moveTo(c[0], c[1]); g.lineTo(d[0], d[1]); }
      g.stroke();
      // the blocks rise when the grid reaches them, and light up when the sweep passes
      const P = Array.from({ length: AL }, () => []), s = step * .38;
      for (const B of blocks) { if (B.d > grow) continue; const up = Math.min(1, (grow - B.d) / 2) * B.h, rel = ((beamA - (B.a + Math.PI)) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2), lit = beamA > 0 && rel < .5 ? 1 - rel / .5 : 0;
        if (lit > .9 && !B.pinged && M) { B.pinged = 1; if (Math.random() < .35) ping(0, 1100 + Math.random() * 600); }
        P[Math.min(AL - 1, Math.floor(lit * AL))].push(B, up); }
      const col = gold ? '245,184,0' : '56,189,248';
      for (let q = 0; q < AL; q++) { const a = P[q]; if (!a.length) continue; g.strokeStyle = 'rgba(' + col + ',' + (.35 + (q + .5) / AL * .65) * fade + ')'; g.beginPath();
        for (let n = 0; n < a.length; n += 2) { const B = a[n], [x0, y0] = iso(B.i, B.j, 0), [x1, y1] = iso(B.i, B.j, a[n + 1]); g.moveTo(x0 - s, y0); g.lineTo(x1 - s, y1); g.moveTo(x0 + s, y0); g.lineTo(x1 + s, y1); g.moveTo(x1 - s, y1); g.lineTo(x1, y1 - s * .5); g.lineTo(x1 + s, y1); g.lineTo(x1, y1 + s * .5); g.closePath(); }
        g.stroke(); }
      // the radar sweep
      if (beamA > 0 && fade > 0) { g.save(); g.globalAlpha = fade; g.translate(cx, cy); g.scale(1, .5); g.rotate(beamA); g.drawImage(wedge, -RR, -RR); g.restore(); }
      g.globalCompositeOperation = 'source-over';
      if (t < END && live) raf = requestAnimationFrame(loop); else finish(); };
    const finish = () => { if (!live) return; live = false; cancelAnimationFrame(raf); done(); };
    raf = requestAnimationFrame(loop); el.classList.add('spEng');
    return () => finish();
  }
  // both cards in order; stop() ends whichever is showing. They start once the audio is actually running (a phone
  // wakes its audio a beat after the tap), so the first sound isn't late
  function play(el, done, skip) { let stop = null, over = false; const end = () => { if (over) return; over = true; done(); };
    const host = () => { el.innerHTML = '<button type="button" class="bootSkip">Skip ›</button>'; el.className = 'fe boot spOn'; el.querySelector('.bootSkip').onclick = (e) => { e.stopPropagation(); over = true; if (stop) stop(); skip(); }; };
    host(); let begun = false; const begin = () => { if (begun || over) return; begun = true; stop = forge(el, () => { if (over) return; host(); stop = sentry(el, end); }); };
    const a = A(); if (a && a.state !== 'running' && a.resume) { try { a.resume().then(begin, begin); } catch (e) { begin(); } setTimeout(begin, 450); } else begin();
    return () => { over = true; if (stop) stop(); }; }
  return { play };
}
