// A city you can hear (Action plan, Step F: music and sound). Under the music, the city has its own sound, all of it
// synthesized here from noise and oscillators (no recordings): a traffic hum that follows how many cars are around you,
// rain and wind from the weather, the murmur of a crowd when people gather, water lapping by the harbor, birds at dawn,
// crickets after dark,
// a car swishing past, a horn somewhere downtown, and radio static when dispatch talks. It has its own volume, and
// turning the music off still leaves a living city.
// Loop: drive the city -> what you hear tells you where you are (busy, quiet, wet, by the water). It reads the weather,
// traffic, crowds and the clock; it plays under the score and with the radio.

export function installCitySound(H) {
  const S = H.S; let a = null, bus = null, L = null, birdT = 0, hornT = 0, crackT = 0, passT = 0, crickT = 0;
  // looping noise, made once: white (rain), pink (wind, crowd) and brown (traffic, water)
  function noise(kind, sec) { const n = Math.floor(a.sampleRate * sec), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; if (kind === 'white') d[i] = w * .5; else if (kind === 'pink') { b0 = .99765 * b0 + w * .099046; b1 = .963 * b1 + w * .2965164; b2 = .57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * .1848) * .11; } else { last = (last + .02 * w) / 1.02; d[i] = last * 3.2; } }
    const f = Math.min(2000, n >> 2); for (let i = 0; i < f; i++) { const k = i / f; d[i] = d[i] * k + d[n - f + i] * (1 - k); } return b; } // the end fades into the start, so the loop has no click
  function loop(buf, filt, freq, q) { const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; s.loop = true; s.loopStart = Math.random() * .5; f.type = filt; f.frequency.value = freq; if (q) f.Q.value = q; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(bus); s.start(); return { s, f, g }; }
  function build() { a = H.audio(); if (!a) return false; bus = a.createGain(); bus.gain.value = 0; bus.connect(a.destination);
    const W = noise('white', 2.5), P = noise('pink', 3.1), B = noise('brown', 3.7);
    L = { traffic: loop(B, 'lowpass', 420), rain: loop(W, 'bandpass', 3800, .45), wind: loop(P, 'bandpass', 520, 1.4), crowd: loop(P, 'bandpass', 760, 1.6), water: loop(B, 'bandpass', 340, .9) };
    // the crowd murmurs (its level wavers at the pace of speech) and the wind gusts (its pitch drifts)
    const mod = (target, hz, depth) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = hz; g.gain.value = depth; o.connect(g); g.connect(target); o.start(); };
    mod(L.crowd.f.frequency, 3.7, 160); mod(L.wind.f.frequency, .11, 260); mod(L.water.f.frequency, .23, 90);
    return true; }
  const set = (p, v) => p.setTargetAtTime(v, a.currentTime, .9);
  // one-shots: a short life of their own, then gone
  function chirp(t0) { const n = 3 + ((Math.random() * 4) | 0), base = 2600 + Math.random() * 1800; for (let i = 0; i < n; i++) { const t = t0 + i * (.09 + Math.random() * .05), o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(base * (1 + Math.random() * .15), t); o.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * .3), t + .06); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.035, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .07); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .08); } }
  function cricket(t0) { const hz = 4300 + Math.random() * 600; for (let k = 0; k < 2 + ((Math.random() * 3) | 0); k++) for (let i = 0; i < 3; i++) { const t = t0 + k * .32 + i * .045, o = a.createOscillator(), g = a.createGain(); o.frequency.value = hz; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.012, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + .03); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .035); } }
  function swish(t, loud) { const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = L.traffic.s.buffer; f.type = 'bandpass'; f.Q.value = 1.1; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(260, t + 1.3); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12 * loud, t + .5); g.gain.exponentialRampToValueAtTime(.0001, t + 1.4); s.connect(f); f.connect(g); g.connect(bus); s.start(t, Math.random()); s.stop(t + 1.5); }
  function horn(t) { const f = a.createBiquadFilter(), g = a.createGain(); f.type = 'lowpass'; f.frequency.value = 900; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.018, t + .03); g.gain.setValueAtTime(.018, t + .28); g.gain.exponentialRampToValueAtTime(.0001, t + .36); [349, 440].forEach((hz) => { const o = a.createOscillator(); o.type = 'square'; o.frequency.value = hz; o.connect(f); o.start(t); o.stop(t + .4); }); f.connect(g); g.connect(bus); }
  function staticBurst(t, len, v) { const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = L.rain.s.buffer; f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = .8; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0001, v), t + .008); g.gain.setValueAtTime(v, t + len); g.gain.exponentialRampToValueAtTime(.0001, t + len + .04); s.connect(f); f.connect(g); g.connect(bus); s.start(t, Math.random() * 2); s.stop(t + len + .06);
    const o = a.createOscillator(), og = a.createGain(); o.type = 'square'; o.frequency.value = 1250; og.gain.setValueAtTime(.0001, t + len); og.gain.exponentialRampToValueAtTime(Math.max(.0001, v * .25), t + len + .005); og.gain.exponentialRampToValueAtTime(.0001, t + len + .05); o.connect(og); og.connect(bus); o.start(t + len); o.stop(t + len + .06); } // the squelch tail
  let lv = {};
  // about once a second: where you are decides what you hear
  function update(dt) { const vol = S.sound ? (S.cfg.amb != null ? S.cfg.amb : .7) : 0; if (!L) { if (!vol || !build()) return; } if (a.state !== 'running') return;
    const st = H.state(), t = a.currentTime, day = st.hour >= 6.5 && st.hour < 19.5, dawn = st.hour >= 5.3 && st.hour < 8.6, inn = st.inside;
    set(bus.gain, vol);
    lv = { traffic: inn ? .02 : (.035 + .11 * Math.min(1, st.cars / 7)) * (day ? 1 : .55), rain: st.rain ? (st.storm ? .2 : .1) * (inn ? .25 : 1) : 0, wind: inn ? 0 : st.storm ? .12 : .018 * (day ? 1 : .7),
      crowd: inn ? Math.min(.05, .012 * st.peds) : .085 * Math.min(1, st.peds / 9), water: inn ? 0 : st.water ? .07 : 0 };
    for (const k in L) set(L[k].g.gain, lv[k]); set(L.traffic.f.frequency, inn ? 220 : 420);
    if (inn) return; birdT -= dt; crickT -= dt; hornT -= dt; crackT -= dt; passT -= dt;
    if (birdT <= 0 && !st.rain && (dawn || day && Math.random() < .3)) { birdT = (dawn ? 2.5 : 9) + Math.random() * (dawn ? 4 : 14); if (st.cars < 6) chirp(t + Math.random() * .5); }
    if (crickT <= 0 && !st.rain && (st.hour >= 20.5 || st.hour < 5) && st.cars < 4) { crickT = .6 + Math.random() * 2.2; cricket(t + Math.random() * .5); } // crickets after dark, when it's quiet
    if (passT <= 0 && st.near > 0) { passT = 1.2 + Math.random() * 2; swish(t + Math.random() * .4, Math.min(1, .45 + st.near * .2) * (st.rain ? 1.3 : 1)); }
    if (hornT <= 0 && day && st.cars >= 5) { hornT = 25 + Math.random() * 50; if (Math.random() < .6) horn(t + Math.random()); }
    if (crackT <= 0 && st.inCar) { crackT = 20 + Math.random() * 25; staticBurst(t + Math.random(), .05 + Math.random() * .08, .012); } }
  // the radio keys up: a burst of static before dispatch talks and the squelch after
  function radio() { if (!L || !S.sound || a.state !== 'running') return; const t = a.currentTime; staticBurst(t, .14, .03); }
  return { update, radio, get levels() { return lv; } };
}
