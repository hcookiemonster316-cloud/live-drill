// The briefing (owner's call, 2026-11-27): a cinematic before the start screen. Briefing Room B, 0547 hours. The
// lights stutter on, Sgt. Castillo takes the lectern under the projector, and the class gets the last talk it hears as
// a classroom: the city, the calls, what it costs to get it wrong and why doing it right is the only way. It is
// meant to be intense and motivational, and it ends on the title.
//
// Made from scratch like everything else: the room, the class and Castillo are drawn with the game's own sprites, the
// one light in the room is the projector (the art guide's "one light, one line"), the score is "The Briefing"
// (scoredata.js) and every other sound is synthesized here. Plays once per new cadet; replay it from the main menu.
// Loop: the academy is the frame. Reads the cadet (name, call sign) and the city (districts); feeds the start screen.
import { sprite, fromLook } from './pixelfolk.js';

const W = 480, H = 270, NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
export function installBriefing(X) {
  const S = X.S, esc = X.esc;
  // ---------- sound: hum, flicker, heartbeat, riser, impact ----------
  const A = () => (S.sound ? X.audio() : null), vol = () => (S.cfg && S.cfg.sfx != null ? S.cfg.sfx : .8);
  function noise(a, dur) { const b = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = a.createBufferSource(); s.buffer = b; return s; }
  function flick(at) { const a = A(); if (!a) return; const t = a.currentTime + (at || 0), s = noise(a, .05), f = a.createBiquadFilter(), g = a.createGain(); f.type = 'highpass'; f.frequency.value = 2400; g.gain.setValueAtTime(.12 * vol(), t); g.gain.exponentialRampToValueAtTime(.0001, t + .05); s.connect(f).connect(g).connect(a.destination); s.start(t); }
  let humN = null;
  function hum(on) { const a = A(); if (!a) return; if (on && !humN) { const o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(); o.type = 'sawtooth'; o.frequency.value = 60; f.type = 'lowpass'; f.frequency.value = 240; g.gain.value = .0001; g.gain.exponentialRampToValueAtTime(.018 * vol(), a.currentTime + .6); o.connect(f).connect(g).connect(a.destination); o.start(); humN = { o, g }; }
    if (!on && humN) { const n = humN; humN = null; n.g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + .5); n.o.stop(a.currentTime + .6); } }
  function beat(at) { const a = A(); if (!a) return; [0, .22].forEach((d, k) => { const t = a.currentTime + (at || 0) + d, o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(k ? 52 : 64, t); o.frequency.exponentialRampToValueAtTime(34, t + .16); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime((k ? .22 : .34) * vol(), t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + .28); o.connect(g).connect(a.destination); o.start(t); o.stop(t + .3); }); }
  function riser(dur) { const a = A(); if (!a) return; const t = a.currentTime, s = noise(a, dur), f = a.createBiquadFilter(), g = a.createGain(); f.type = 'bandpass'; f.Q.value = 6; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(5200, t + dur); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16 * vol(), t + dur * .95); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .05); s.connect(f).connect(g).connect(a.destination); s.start(t); }
  function key(at) { const a = A(); if (!a) return; const t = a.currentTime + (at || 0), o = a.createOscillator(), g = a.createGain(); o.type = 'square'; o.frequency.value = 1900 + Math.random() * 500; g.gain.setValueAtTime(.012 * vol(), t); g.gain.exponentialRampToValueAtTime(.0001, t + .02); o.connect(g).connect(a.destination); o.start(t); o.stop(t + .03); }

  // ---------- pictures: drawn once per shot, then only the light moves ----------
  const C = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
  const SP = new Map();
  const spr = (look, d, k) => { const key = k + d; let s = SP.get(key); if (!s) { s = sprite(fromLook(look), d, 0, false); SP.set(key, s); } return s; };
  const cadetLook = (i) => ({ officer: true, ph: 11 + i * 7, sex: i % 3 === 1 ? 'f' : 'm' });
  let ROOM = null;
  function room() { if (ROOM) return ROOM; const [c, g] = C(W, H);
    g.fillStyle = '#121a2b'; g.fillRect(0, 0, W, H); g.fillStyle = '#18223a'; g.fillRect(0, 0, W, 150); // back wall
    g.fillStyle = '#0e1524'; g.fillRect(0, 150, W, H - 150); // floor
    g.fillStyle = '#1f2a44'; for (let x = 0; x < W; x += 60) g.fillRect(x, 150, 1, H - 150);
    g.fillStyle = '#e8edf5'; g.fillRect(150, 22, 180, 100); g.fillStyle = '#c9d3e3'; g.fillRect(150, 118, 180, 4); // projector screen
    g.fillStyle = '#2a3350'; g.fillRect(48, 30, 70, 46); g.fillStyle = '#f5b800'; g.font = '700 9px "Meridian Text",monospace'; g.fillText('BRIEFING', 56, 46); g.fillText('ROOM B', 60, 58); g.fillStyle = '#9aa5bd'; g.fillText('PMPD', 70, 70);
    g.fillStyle = '#3a2a1e'; g.fillRect(360, 104, 42, 50); g.fillStyle = '#4a3626'; g.fillRect(356, 100, 50, 8); // lectern
    // the class, from behind: three rows
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const s = spr(cadetLook(r * 9 + i), 4, 'c' + (r * 9 + i)), sc = .62 + r * .16, x = 24 + i * 52 + (r % 2) * 22 - r * 10, y = 196 + r * 30; g.drawImage(s, x - 24 * sc, y - 61 * sc, 48 * sc, 64 * sc); }
    ROOM = c; return c; }
  function screenArt(g, kind, t, D) { // what the projector shows: drawn into the screen rectangle
    g.save(); g.beginPath(); g.rect(150, 22, 180, 100); g.clip();
    if (kind === 'badge') { g.fillStyle = '#0b1630'; g.fillRect(150, 22, 180, 100); g.fillStyle = '#f5b800'; g.beginPath(); g.moveTo(240, 34); g.lineTo(266, 44); g.lineTo(266, 70); g.quadraticCurveTo(264, 96, 240, 110); g.quadraticCurveTo(216, 96, 214, 70); g.lineTo(214, 44); g.closePath(); g.fill(); g.fillStyle = '#0b1630'; g.font = '800 11px "Meridian",sans-serif'; g.fillText('PMPD', 225, 78); }
    if (kind === 'map') { g.fillStyle = '#0b1630'; g.fillRect(150, 22, 180, 100); const n = D.length; D.forEach((d, i) => { const on = t > .5 + i * .55, x = 160 + (i % 4) * 42, y = 32 + Math.floor(i / 4) * 44; g.fillStyle = on ? d.color : '#1e2a44'; g.globalAlpha = on ? 1 : .6; g.fillRect(x, y, 36, 36); g.globalAlpha = 1; if (on) { g.fillStyle = '#0b1630'; g.font = '700 6px "Meridian Text",monospace'; g.fillText(d.name.split(' ')[0].toUpperCase().slice(0, 10), x + 2, y + 33); } }); }
    g.restore(); }
  // the one light: the projector beam from behind the class, onto the screen
  function beam(g, k) { const gr = g.createLinearGradient(240, H, 240, 22); gr.addColorStop(0, 'rgba(255,244,214,0)'); gr.addColorStop(1, 'rgba(255,244,214,' + (.16 * k) + ')'); g.fillStyle = gr; g.beginPath(); g.moveTo(232, H); g.lineTo(150, 22); g.lineTo(330, 22); g.lineTo(248, H); g.closePath(); g.fill(); }
  function shade(g, k) { if (k < 1) { g.fillStyle = 'rgba(2,4,10,' + (1 - k) + ')'; g.fillRect(0, 0, W, H); } }
  // Castillo up close: her sprite, large, cropped to the shoulders, lit from the screen
  function close(g, t, push) { const lk = X.castLook('castillo') || { officer: true, sex: 'f' }, s = spr(lk, 0, 'cas0'), sc = 7 + push * t; g.fillStyle = '#0c1220'; g.fillRect(0, 0, W, H); const gr = g.createRadialGradient(150, 40, 10, 150, 40, 360); gr.addColorStop(0, 'rgba(255,244,214,.18)'); gr.addColorStop(1, 'rgba(255,244,214,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.drawImage(s, 268 - 24 * sc, 40 - 9 * sc, 48 * sc, 64 * sc); } // the head sits below the top of the frame
  function cad(g, t, lines) { g.fillStyle = '#020806'; g.fillRect(0, 0, W, H); g.font = '700 13px "Meridian Text",monospace'; let y = 56; const shown = Math.floor(t * 46);
    let left = shown; lines.forEach((l) => { const n = Math.max(0, Math.min(l.length, left)); left -= l.length + 4; g.fillStyle = /^P1/.test(l) ? '#ff6b6b' : '#7cf0a4'; g.fillText(l.slice(0, n), 26, y); y += 26; });
    const w = Math.sin(t * 9) > 0; g.fillStyle = w ? 'rgba(220,38,38,.22)' : 'rgba(37,99,235,.22)'; g.fillRect(0, 0, W, H); // the light bar's wash
    g.fillStyle = 'rgba(255,255,255,.04)'; for (let yy = 0; yy < H; yy += 3) g.fillRect(0, yy, W, 1); }

  // ---------- the cut: [seconds, picture, words, sound] ----------
  function shots(D) {
    const nm = X.addressed ? X.addressed() : 'Cadet', cs = S.cs || null;
    return [
      { d: 4.2, cap: ['', 'PORT MERIDIAN POLICE ACADEMY · BRIEFING ROOM B · 0547 HOURS'], go: () => { [0, .35, .5, 1.4, 1.55, 2.2].forEach((x) => flick(x)); setTimeout(() => hum(true), 2200); },
        draw: (g, t) => { g.drawImage(room(), 0, 0); screenArt(g, 'badge', t); const on = t > 2.2 ? 1 : [0, .35, .5, 1.4, 1.55].some((x) => t > x && t < x + .08) ? .6 : 0; shade(g, on * .55); if (t > 2.2) beam(g, Math.min(1, (t - 2.2) * 2)); } },
      { d: 6.5, cap: ['Sgt. Castillo', 'Eyes up. Phones down. This is the last briefing you get as a classroom.'], go: () => X.music('brief'),
        draw: (g, t) => { const z = 1 + t * .012; g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2); g.drawImage(room(), 0, 0); screenArt(g, 'badge', t); shade(g, .55); beam(g, 1); const lk = X.castLook('castillo') || { officer: true, sex: 'f' }, s = spr(lk, 0, 'cas0'); g.drawImage(s, 381 - 24 * 1.25, 152 - 61 * 1.25, 60, 80); g.restore(); } },
      { d: 6.5, cap: ['Sgt. Castillo', 'Tomorrow the city does the teaching. It does not grade on a curve, and it does not forget.'], go: () => beat(.2),
        draw: (g, t) => close(g, t, .08) },
      { d: 7.5, cap: ['Sgt. Castillo', NUM[D.length] + ' districts. Every call you take, every door you knock on, every promise you make, the city remembers.'], go: () => [0, 1, 2, 3].forEach((k) => beat(.6 + k * 1.6)),
        draw: (g, t) => { const z = 1.12 + t * .025; g.save(); g.translate(240, 72); g.scale(z, z); g.translate(-240, -72); g.drawImage(room(), 0, 0); screenArt(g, 'map', t, D); shade(g, .62); beam(g, 1); g.restore(); } },
      { d: 6, cap: ['Dispatch', 'All units, stand by.'], go: () => { for (let k = 0; k < 40; k++) key(k * .11); X.chirp(); [0, 1, 2, 3, 4].forEach((k) => beat(k * .9)); },
        draw: (g, t) => cad(g, t, ['P1  BURGLARY JUST OCCURRED  BAYFRONT MALL', 'P2  WELL-BEING CHECK  RIVERSIDE APTS', 'P1  VEHICLE FAILS TO STOP  HARBOR BLVD', 'P2  CHILD RAN INTO THE ROAD  EASTGATE', 'P3  CITIZEN NEEDS ASSISTANCE  CENTRAL']) },
      { d: 7.5, cap: ['Sgt. Castillo', 'Some calls you will get wrong. Own it. Learn it. Do it right the next time.'], go: () => beat(.1),
        draw: (g, t) => close(g, t, .16) },
      { d: 6.5, cap: ['Sgt. Castillo', 'Doing it right is not the slow way. It is the only way. On your feet.'], go: () => { riser(6.2); },
        draw: (g, t) => { g.drawImage(room(), 0, 0); screenArt(g, 'badge', t); shade(g, .5 - Math.min(.3, t * .05)); beam(g, 1 + t * .1); const lk = X.castLook('castillo') || { officer: true, sex: 'f' }, s = spr(lk, 0, 'cas0'); g.drawImage(s, 381 - 30, 152 - 76, 60, 80); if (t > 4.6) { g.fillStyle = 'rgba(255,255,255,' + Math.min(.9, (t - 4.6) * .6) + ')'; g.fillRect(0, 0, W, H); } } },
      { d: 5.5, cap: ['', (cs ? nm + ', ' + cs + '. ' : nm + '. ') + 'Port Meridian is waiting.'], title: true, go: () => X.boom(),
        draw: (g, t) => { g.fillStyle = '#05080f'; g.fillRect(0, 0, W, H); const k = Math.min(1, t * 3); g.globalAlpha = k; const gr = g.createRadialGradient(240, 120, 4, 240, 120, 260); gr.addColorStop(0, 'rgba(245,184,0,.22)'); gr.addColorStop(1, 'rgba(245,184,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.globalAlpha = 1; } }];
  }
  // ---------- the player ----------
  let live = null;
  function play(done) {
    if (live) return; const D = X.districts(), cut = shots(D), el = document.createElement('div'); el.className = 'brief';
    el.innerHTML = '<div class="bfBars t"></div><canvas class="bfCv" width="' + W + '" height="' + H + '"></canvas><div class="bfBars b"></div><div class="bfTitle" hidden><h1><span>PATROL</span><span>CITY</span></h1><p>Learn it on the street.</p></div><div class="bfCap"><b></b><p></p></div><button type="button" class="bfSkip">Skip ›</button>';
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    const cv = el.querySelector('.bfCv'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    const capB = el.querySelector('.bfCap b'), capP = el.querySelector('.bfCap p');
    let i = -1, t0 = 0, raf = 0, typed = 0;
    const end = () => { if (!live) return; live = null; cancelAnimationFrame(raf); hum(false); S.seenBrief = 1; X.save(); el.classList.add('out'); setTimeout(() => { el.remove(); done && done(); }, 700); };
    const next = () => { i++; if (i >= cut.length) return end(); const s = cut[i]; t0 = performance.now(); typed = 0; capB.textContent = s.cap[0]; capP.textContent = ''; el.querySelector('.bfCap').classList.toggle('narr', !s.cap[0]); el.querySelector('.bfTitle').hidden = !s.title; if (s.title) el.querySelector('.bfTitle').classList.add('in'); try { s.go && s.go(); } catch (e) {} };
    const loop = (now) => { if (!live) return; const s = cut[i], t = (now - t0) / 1000; s.draw(g, t);
      const want = Math.min(s.cap[1].length, Math.floor(t * 38)); if (want !== typed) { typed = want; capP.textContent = s.cap[1].slice(0, typed); }
      if (t >= s.d) next(); raf = requestAnimationFrame(loop); };
    el.querySelector('.bfSkip').onclick = (e) => { e.stopPropagation(); end(); };
    addEventListener('keydown', function k(e) { if (!live) { removeEventListener('keydown', k); return; } if (e.key === 'Escape') end(); });
    live = { end }; next(); raf = requestAnimationFrame(loop);
  }
  return { play, get on() { return !!live; }, end: () => live && live.end() };
}
