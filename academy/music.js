// Adaptive score for Patrol City. Everything is synthesized in the browser (no audio files).
// Each mood is a small arrangement; the game picks a mood from what is happening and the score crossfades.
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// patterns are 16 steps per bar. bass: 0 rest, 1 root, 5 fifth, 8 octave. drums: 1 hit.
export const MOODS = {
  title: { name: 'Port Meridian', bpm: 84, prog: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], pad: 'sawtooth', padV: .02, cut: 900,
    bass: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], arp: [0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0], arpV: .03, hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0] },
  day: { name: 'Day Watch', bpm: 98, prog: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], pad: 'triangle', padV: .022, cut: 1800,
    bass: [1, 0, 0, 1, 0, 0, 5, 0, 1, 0, 0, 1, 0, 0, 8, 0], arp: [0, 0, 2, 0, 1, 0, 2, 0, 0, 0, 2, 0, 1, 2, 0, 0], arpV: .026, arpType: 'square', arpCut: 2600,
    hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1], kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0], snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], snV: .03,
    lead: { notes: [72, 74, 76, 79, 81], every: 8, p: .4, v: .022 } },
  night: { name: 'Night Watch', bpm: 74, prog: [[57, 60, 64, 67], [53, 57, 60, 64], [50, 53, 57, 60], [52, 56, 59, 62]], pad: 'sawtooth', padV: .016, cut: 650,
    bass: [1, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0], hat: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0], hatV: .016, kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], kickV: .5,
    lead: { notes: [69, 72, 74, 76, 79, 81], every: 4, p: .28, v: .03, type: 'sine', dur: 3 } },
  inside: { name: 'Indoors', bpm: 70, prog: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], pad: 'sine', padV: .02, cut: 1400,
    keys: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], bass: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], lead: { notes: [76, 79, 81, 84], every: 8, p: .25, v: .018, type: 'sine', dur: 2 } },
  story: { name: 'The Gray Sedan', bpm: 64, prog: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]], pad: 'sawtooth', padV: .018, cut: 1100,
    bass: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], arp: [0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0], arpV: .02, arpType: 'sine', arpCut: 3000 },
  side: { name: 'Side Case', bpm: 92, prog: [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]], pad: 'triangle', padV: .02, cut: 1500,
    bass: [1, 0, 1, 0, 0, 0, 5, 0, 1, 0, 0, 0, 5, 0, 8, 0], arp: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1], arpV: .016, arpType: 'triangle', arpCut: 2400,
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], hatV: .012, kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], kickV: .45 },
  call: { name: 'En Route', bpm: 112, prog: [[50, 53, 57], [50, 53, 57], [46, 50, 53], [48, 52, 55]], pad: 'sawtooth', padV: .016, cut: 900,
    bass: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 5, 0], arp: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1], arpV: .016, arpType: 'sawtooth', arpCut: 1800,
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1], hatV: .016, kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], kickV: .55 },
  urgent: { name: 'Priority One', bpm: 136, prog: [[52, 55, 59], [48, 52, 55], [50, 54, 57], [47, 51, 54]], pad: 'sawtooth', padV: .018, cut: 1300,
    bass: [1, 1, 8, 1, 1, 1, 8, 1, 1, 1, 8, 1, 1, 5, 8, 5], arp: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 1], arpV: .016, arpType: 'square', arpCut: 2200,
    hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], hatV: .012, kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0], kickV: .6, snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1], snV: .04 },
  scene: { name: 'On Scene', bpm: 90, prog: [[50, 53, 57], [52, 55, 59], [48, 52, 55], [50, 53, 57]], pad: 'sine', padV: .022, cut: 800,
    bass: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], hat: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], hatV: .01 },
  water: { name: 'Marine Patrol', bpm: 80, prog: [[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]], pad: 'triangle', padV: .02, cut: 1300,
    bass: [1, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 1, 0, 0, 0], arp: [0, 0, 1, 0, 2, 0, 0, 0, 1, 0, 2, 0, 0, 0, 1, 0], arpV: .02, arpType: 'sine', arpCut: 3000,
    lead: { notes: [74, 76, 79, 83], every: 8, p: .3, v: .02, type: 'sine', dur: 2.5 } }
};

export function createMusic(getCtx) {
  let on = false, vol = .85, master = null, timer = 0, cur = null, rain = false, noise = null;
  function ctx() { return getCtx(); }
  function noiseBuf(a) { if (noise) return noise; const b = a.createBuffer(1, a.sampleRate * .5, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (noise = b); }
  function tone(bus, f, t, d, type, v, cut, att) {
    const a = ctx(), o = a.createOscillator(), g = a.createGain(), fl = a.createBiquadFilter();
    o.type = type; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = (cut || 2400) * (rain ? .7 : 1);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + (att != null ? att : Math.min(.6, d * .3))); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(fl); fl.connect(g); g.connect(bus); o.start(t); o.stop(t + d + .05);
  }
  function hit(bus, t, kind, v) {
    const a = ctx();
    if (kind === 'kick') { const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .14); g.gain.setValueAtTime(v * .35, t); g.gain.exponentialRampToValueAtTime(.0001, t + .28); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .3); return; }
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); src.buffer = noiseBuf(a);
    if (kind === 'hat') { f.type = 'highpass'; f.frequency.value = 7200; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05); }
    else { f.type = 'bandpass'; f.frequency.value = 1800; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .16); }
    src.connect(f); f.connect(g); g.connect(bus); src.start(t); src.stop(t + .2);
  }
  // one playing layer per mood; switching starts a new layer and fades the old one out
  function layer(id) {
    const a = ctx(), m = MOODS[id], bus = a.createGain(); bus.gain.setValueAtTime(0, a.currentTime); bus.gain.linearRampToValueAtTime(1, a.currentTime + 2.2); bus.connect(master);
    return { id, m, bus, step: 0, nextT: a.currentTime + .08, alive: true };
  }
  function play(L) {
    const a = ctx(), m = L.m, spb = 60 / m.bpm / 4;
    while (L.nextT < a.currentTime + .35) {
      const t = L.nextT, bar = Math.floor(L.step / 16) % m.prog.length, ch = m.prog[bar], s = L.step % 16;
      if (s === 0) { ch.forEach((n) => { tone(L.bus, hz(n), t, spb * 16, m.pad, m.padV, m.cut); tone(L.bus, hz(n) * 1.005, t, spb * 16, m.pad, m.padV * .7, m.cut); }); }
      if (m.bass && m.bass[s]) { const b = m.bass[s], n = ch[0] - 24 + (b === 5 ? 7 : b === 8 ? 12 : 0); tone(L.bus, hz(n), t, spb * (m.bpm > 120 ? 1.2 : 3), 'sine', .1, 400, .01); tone(L.bus, hz(n), t, spb * 1.5, 'triangle', .03, 700, .01); }
      if (m.arp && m.arp[s] != null && (m.arp[s] || s % 2 === 0)) { const n = ch[m.arp[s] % ch.length] + 12; tone(L.bus, hz(n), t, spb * 1.7, m.arpType || 'triangle', m.arpV || .02, m.arpCut || 3200, .005); }
      if (m.keys && m.keys[s]) ch.forEach((n, k) => tone(L.bus, hz(n + 12), t + k * .012, spb * 7, 'triangle', .016, 2200, .01));
      if (m.lead && s % m.lead.every === 0 && Math.random() < m.lead.p) { const n = m.lead.notes[Math.floor(Math.random() * m.lead.notes.length)]; tone(L.bus, hz(n), t, spb * 4 * (m.lead.dur || 1), m.lead.type || 'triangle', m.lead.v, 3600, .01); }
      if (m.hat && m.hat[s]) hit(L.bus, t + (s % 2 ? spb * .08 : 0), 'hat', m.hatV || .02);
      if (m.kick && m.kick[s]) hit(L.bus, t, 'kick', m.kickV || .6);
      if (m.snare && m.snare[s]) hit(L.bus, t, 'snare', m.snV || .035);
      L.nextT += spb; L.step++;
    }
  }
  let layers = [];
  function tick() { if (!on) return; layers.forEach(play); }
  const api = {
    get mood() { return cur; },
    get title() { return cur && MOODS[cur] ? MOODS[cur].name : ''; },
    start(mood) {
      const a = ctx(); if (!a) return; if (a.state === 'suspended') a.resume();
      if (!on) { on = true; master = a.createGain(); master.gain.value = vol; master.connect(a.destination); timer = setInterval(tick, 90); layers = []; cur = null; }
      api.set(mood || cur || 'title');
    },
    set(mood) {
      if (!on || mood === cur || !MOODS[mood]) return; cur = mood; const a = ctx();
      layers.forEach((L) => { if (!L.alive) return; L.alive = false; try { L.bus.gain.cancelScheduledValues(a.currentTime); L.bus.gain.setValueAtTime(L.bus.gain.value, a.currentTime); L.bus.gain.linearRampToValueAtTime(0, a.currentTime + 2); } catch (e) {} const b = L.bus; setTimeout(() => { layers = layers.filter((x) => x !== L); try { b.disconnect(); } catch (e) {} }, 2300); });
      layers.push(layer(mood));
    },
    rain(v) { rain = !!v; },
    volume(v) { vol = Math.max(0, Math.min(1, v)) * .85 + .0001; if (on && master) { const a = ctx(); master.gain.setTargetAtTime(vol, a.currentTime, .1); } },
    // short fanfares over the score
    sting(kind) {
      if (!on) return; const a = ctx(), t = a.currentTime + .05, bus = master;
      const seq = { accept: [[67, 0], [71, .12], [74, .24], [79, .36]], done: [[60, 0], [64, .14], [67, .28], [72, .42], [76, .42], [79, .42]], promo: [[55, 0], [60, .2], [64, .4], [67, .6], [72, .9], [76, .9], [79, .9]], fail: [[64, 0], [60, .2]] }[kind] || [];
      seq.forEach(([n, d]) => { tone(bus, hz(n), t + d, kind === 'promo' ? 1.6 : 1, 'triangle', .05, 3600, .01); tone(bus, hz(n) * 2, t + d, .5, 'sine', .015, 4000, .01); });
    },
    stop() { if (!on) return; on = false; const a = ctx(), g0 = master; try { g0.gain.cancelScheduledValues(a.currentTime); g0.gain.setValueAtTime(g0.gain.value, a.currentTime); g0.gain.linearRampToValueAtTime(0, a.currentTime + 1.2); } catch (e) {} setTimeout(() => { clearInterval(timer); try { g0.disconnect(); } catch (e) {} }, 1300); layers = []; cur = null; }
  };
  return api;
}
