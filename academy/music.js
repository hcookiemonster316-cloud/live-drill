// Patrol City original score. Everything is synthesized live in the browser (no audio files).
// One recurring theme, "Port Meridian", is arranged ten ways (title, day, night, indoors, story, side case,
// en route, priority one, on scene, marine). The game picks a mood from what is happening and the score
// moves to it on the next bar line. Instruments: pads, string section, piano, electric piano, plucks,
// marimba, bells, brass, lead and bass, with a soft drum kit, stereo placement, reverb and delay.

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const SCALES = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], mix: [0, 2, 4, 5, 7, 9, 10] };
// the theme: scale degree and length in beats ('r' is a rest). Two four-bar phrases.
const THEME = [[2, 1], [4, 1], [5, 2], [4, 1], [2, 1], [1, 2], [0, 1], [1, 1], [2, 2], ['r', 4],
  [2, 1], [4, 1], [7, 2], [6, 1], [5, 1], [4, 2], [5, 1], [4, 1], [2, 2], [1, 2], [0, 2]];
const THEME_EV = (() => { let b = 0; return THEME.map(([d, l]) => { const e = { b, d, l }; b += l; return e; }).filter((e) => e.d !== 'r'); })();

// moods. prog: chord roots as scale degrees, one per bar. parts: which instruments play and how.
export const MOODS = {
  title: { name: 'Port Meridian', bpm: 72, root: 57, scale: 'min', prog: [0, 5, 2, 6, 0, 5, 3, 4],
    pad: { v: .05 }, strings: { v: .032 }, keys: { voice: 'piano', pat: 'arp8', v: .045 }, bass: { pat: 'whole', v: .09 }, lead: { voice: 'strings', v: .045, oct: 12, from: 0 } },
  day: { name: 'Day Watch', bpm: 100, root: 60, scale: 'maj', prog: [0, 5, 3, 4, 0, 5, 1, 4],
    pad: { v: .025 }, keys: { voice: 'pluck', pat: 'arp8', v: .04 }, keys2: { voice: 'epiano', pat: 'offbeat', v: .03 }, bass: { pat: 'walk', v: .085 }, drums: { pat: 'pop', v: .8 }, lead: { voice: 'lead', v: .032, oct: 12, from: 8 } },
  night: { name: 'Night Watch', bpm: 78, root: 62, scale: 'dor', prog: [0, 3, 0, 3, 5, 4, 0, 4],
    pad: { v: .03 }, keys: { voice: 'epiano', pat: 'comp', v: .045, sev: true }, bass: { pat: 'syncop', v: .085 }, drums: { pat: 'brush', v: .6 }, lead: { voice: 'bell', v: .03, oct: 12, from: 8, sparse: true } },
  inside: { name: 'Indoors', bpm: 70, root: 65, scale: 'maj', prog: [1, 4, 0, 3, 1, 4, 0, 0],
    keys: { voice: 'epiano', pat: 'comp', v: .05, sev: true }, strings: { v: .018 }, bass: { pat: 'half', v: .075 }, lead: { voice: 'bell', v: .022, oct: 12, from: 0, sparse: true } },
  story: { name: 'The Gray Sedan', bpm: 64, root: 57, scale: 'min', prog: [0, 5, 2, 6, 3, 0, 4, 4],
    pad: { v: .035 }, strings: { v: .035 }, keys: { voice: 'piano', pat: 'arp8', v: .04 }, bass: { pat: 'whole', v: .08 }, lead: { voice: 'piano', v: .05, oct: 12, from: 0 } },
  side: { name: 'Side Case', bpm: 104, root: 67, scale: 'mix', prog: [0, 6, 3, 0, 0, 6, 4, 4],
    keys: { voice: 'marimba', pat: 'arp16', v: .04 }, keys2: { voice: 'pluck', pat: 'offbeat', v: .025 }, bass: { pat: 'syncop', v: .085 }, drums: { pat: 'soft', v: .6 }, lead: { voice: 'lead', v: .028, oct: 12, from: 8, sparse: true } },
  call: { name: 'En Route', bpm: 112, root: 62, scale: 'min', prog: [0, 0, 5, 6, 0, 0, 3, 4],
    pad: { v: .03 }, strings: { v: .02 }, keys: { voice: 'stac', pat: 'arp16', v: .028 }, bass: { pat: 'eighths', v: .085 }, drums: { pat: 'pulse', v: .7 } },
  urgent: { name: 'Priority One', bpm: 136, root: 64, scale: 'min', prog: [0, 5, 6, 4, 0, 5, 3, 4],
    pad: { v: .025 }, keys: { voice: 'stac', pat: 'arp16', v: .03 }, keys2: { voice: 'brass', pat: 'stab', v: .035 }, bass: { pat: 'drive', v: .085 }, drums: { pat: 'drive', v: .8 }, lead: { voice: 'brass', v: .035, oct: 12, from: 8 } },
  scene: { name: 'On Scene', bpm: 84, root: 62, scale: 'min', prog: [0, 0, 5, 5, 3, 3, 4, 4],
    pad: { v: .04 }, strings: { v: .022 }, keys: { voice: 'piano', pat: 'sparse', v: .035 }, bass: { pat: 'whole', v: .07 }, drone: { v: .03 } },
  debrief: { name: 'Debrief', bpm: 76, root: 60, scale: 'maj', prog: [0, 4, 5, 3, 0, 4, 3, 4],
    pad: { v: .035 }, strings: { v: .028 }, keys: { voice: 'piano', pat: 'arp8', v: .04 }, bass: { pat: 'half', v: .07 }, drums: { pat: 'brush', v: .4 }, lead: { voice: 'bell', v: .025, oct: 12, from: 4 } },
  friend: { name: 'Neighbors', bpm: 80, root: 65, scale: 'maj', prog: [0, 5, 3, 4, 0, 5, 1, 4],
    pad: { v: .03 }, strings: { v: .03 }, keys: { voice: 'epiano', pat: 'comp', v: .045 }, bass: { pat: 'whole', v: .065 }, drums: { pat: 'brush', v: .35 }, lead: { voice: 'bell', v: .03, oct: 12, from: 2 } },
  water: { name: 'Marine Patrol', bpm: 84, root: 55, scale: 'maj', prog: [0, 3, 5, 4, 0, 3, 1, 4],
    pad: { v: .03 }, keys: { voice: 'marimba', pat: 'arp8', v: .04 }, bass: { pat: 'half', v: .075 }, drums: { pat: 'soft', v: .45 }, lead: { voice: 'bell', v: .03, oct: 12, from: 0 } }
};

export function createMusic(getCtx) {
  let on = false, vol = .85, master = null, out = null, wet = null, dly = null, timer = 0, cur = null, rain = false, noise = null, lowpass = null;
  const ctx = () => getCtx();
  function noiseBuf(a) { if (noise) return noise; const b = a.createBuffer(1, a.sampleRate, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (noise = b); }
  function buildBus(a) {
    master = a.createGain(); master.gain.value = vol;
    lowpass = a.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = 9000;
    const cmp = a.createDynamicsCompressor(); cmp.threshold.value = -18; cmp.ratio.value = 3.5; cmp.attack.value = .012; cmp.release.value = .3;
    master.connect(lowpass); lowpass.connect(cmp); cmp.connect(a.destination);
    // reverb: a generated stereo hall tail
    const len = a.sampleRate * 2.6, ir = a.createBuffer(2, len, a.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const conv = a.createConvolver(); conv.buffer = ir; wet = a.createGain(); wet.gain.value = .32; wet.connect(conv); conv.connect(master);
    // a soft dotted-eighth delay for leads and bells
    const d = a.createDelay(1.5), fb = a.createGain(), dl = a.createBiquadFilter(); d.delayTime.value = .36; fb.gain.value = .32; dl.type = 'lowpass'; dl.frequency.value = 2600;
    dly = a.createGain(); dly.gain.value = .22; dly.connect(d); d.connect(dl); dl.connect(fb); fb.connect(d); dl.connect(master);
  }
  // ---- instruments: each call schedules one note ----
  function voice(L, kind, m, t, dur, v, pan) {
    const a = ctx(), f = hz(m), g = a.createGain(), p = a.createStereoPanner ? a.createStereoPanner() : null; let endT = t + dur;
    if (p) { p.pan.value = pan || 0; g.connect(p); p.connect(L.bus); } else g.connect(L.bus);
    const send = (amt, toDelay) => { const s = a.createGain(); s.gain.value = amt; g.connect(s); s.connect(toDelay ? dly : wet); };
    const env = (att, peak, rel, sus) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + att); if (sus != null) { g.gain.setTargetAtTime(peak * sus, t + att, rel * .4); g.gain.setTargetAtTime(.0001, t + dur, rel / 3); endT = t + dur + rel * 1.5; } else { g.gain.exponentialRampToValueAtTime(.0001, t + att + rel); endT = t + att + rel + .05; } };
    const osc = (type, freq, det) => { const o = a.createOscillator(); o.type = type; o.frequency.value = freq; if (det) o.detune.value = det; return o; };
    const lp = (fr, q) => { const b = a.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = fr * (rain ? .75 : 1); b.Q.value = q || .7; b.connect(g); return b; };
    let oscs = [];
    if (kind === 'pad') { const b = lp(1200); [-9, 9, 0].forEach((d, i) => { const o = osc(i === 2 ? 'triangle' : 'sawtooth', f, d); o.connect(b); oscs.push(o); }); const lfo = osc('sine', .18), lg = a.createGain(); lg.gain.value = 380; lfo.connect(lg); lg.connect(b.frequency); oscs.push(lfo); env(.9, v, 1.4, .85); send(.6); }
    else if (kind === 'strings' || kind === 'stac') { const b = lp(kind === 'stac' ? 2600 : 2200); const vib = osc('sine', 5.2), vg = a.createGain(); vg.gain.value = kind === 'stac' ? 0 : 5; vib.connect(vg); [-7, 0, 7].forEach((d) => { const o = osc('sawtooth', f, d); vg.connect(o.detune); o.connect(b); oscs.push(o); }); oscs.push(vib); if (kind === 'stac') env(.012, v, .16); else env(.28, v, .9, .8); send(.5); }
    else if (kind === 'piano') { const b = lp(3200); const o1 = osc('triangle', f), o2 = osc('sine', f * 2), g2 = a.createGain(); g2.gain.value = .35; o1.connect(b); o2.connect(g2); g2.connect(b); oscs = [o1, o2]; b.frequency.setValueAtTime(4200, t); b.frequency.exponentialRampToValueAtTime(900, t + 1.2); env(.006, v, Math.min(2.4, dur + 1.2)); send(.45); }
    else if (kind === 'epiano' || kind === 'bell') { const ratio = kind === 'bell' ? 3.5 : 1, mod = osc('sine', f * ratio), mg = a.createGain(), car = osc('sine', f); mg.gain.setValueAtTime(f * (kind === 'bell' ? 2.2 : 1.6), t); mg.gain.exponentialRampToValueAtTime(f * .08, t + (kind === 'bell' ? 1.4 : .6)); mod.connect(mg); mg.connect(car.frequency); car.connect(g); oscs = [mod, car]; env(.006, v, kind === 'bell' ? 2.2 : Math.min(1.8, dur + .7)); send(kind === 'bell' ? .55 : .35); if (kind === 'bell') send(.6, true); }
    else if (kind === 'pluck') { const b = lp(3000, 2); b.frequency.setValueAtTime(3600, t); b.frequency.exponentialRampToValueAtTime(420, t + .32); const o = osc('sawtooth', f), o2 = osc('square', f * .5, 4), g2 = a.createGain(); g2.gain.value = .3; o.connect(b); o2.connect(g2); g2.connect(b); oscs = [o, o2]; env(.004, v, .45); send(.3); send(.25, true); }
    else if (kind === 'marimba') { const o = osc('sine', f), o2 = osc('sine', f * 4), g2 = a.createGain(); g2.gain.setValueAtTime(.4, t); g2.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(g); o2.connect(g2); g2.connect(g); oscs = [o, o2]; env(.004, v, .55); send(.35); }
    else if (kind === 'brass') { const b = lp(800, 1.2); b.frequency.setValueAtTime(500, t); b.frequency.linearRampToValueAtTime(2400, t + .12); b.frequency.setTargetAtTime(1300, t + .14, .2); [-6, 6].forEach((d) => { const o = osc('sawtooth', f, d); o.connect(b); oscs.push(o); }); env(.05, v, .35, .7); send(.4); }
    else if (kind === 'lead') { const b = lp(2400); const o = osc('square', f), vib = osc('sine', 5.5), vg = a.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(9, t + .4); vib.connect(vg); vg.connect(o.detune); o.connect(b); oscs = [o, vib]; env(.02, v, .5, .75); send(.35); send(.45, true); }
    else if (kind === 'bass') { const b = lp(520, 1.1); b.frequency.setValueAtTime(900, t); b.frequency.exponentialRampToValueAtTime(380, t + .25); const o = osc('sine', f), o2 = osc('sawtooth', f), g2 = a.createGain(); g2.gain.value = .35; o.connect(b); o2.connect(g2); g2.connect(b); oscs = [o, o2]; env(.012, v, .25, .7); }
    else if (kind === 'drone') { const b = lp(500); [0, 7].forEach((d) => { const o = osc('sawtooth', f, d); o.connect(b); oscs.push(o); }); env(1.5, v, 2, .9); send(.7); }
    oscs.forEach((o) => { o.start(t); o.stop(endT + .1); });
  }
  function drum(L, kind, t, v) {
    const a = ctx(), g = a.createGain(), p = a.createStereoPanner ? a.createStereoPanner() : null;
    if (p) { p.pan.value = kind === 'hat' || kind === 'shaker' ? .25 : kind === 'tom' ? -.2 : 0; g.connect(p); p.connect(L.bus); } else g.connect(L.bus);
    if (kind === 'kick' || kind === 'tom') { const o = a.createOscillator(); o.frequency.setValueAtTime(kind === 'kick' ? 95 : 170, t); o.frequency.exponentialRampToValueAtTime(kind === 'kick' ? 44 : 95, t + .18); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v * (kind === 'kick' ? .3 : .16), t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + .36); o.connect(g); o.start(t); o.stop(t + .4); return; }
    const src = a.createBufferSource(), f = a.createBiquadFilter(); src.buffer = noiseBuf(a); src.connect(f); f.connect(g);
    const peak = { snare: .09, brush: .045, hat: .03, open: .025, shaker: .022, rim: .05 }[kind] * v, att = { snare: .006, brush: .02, hat: .003, open: .004, shaker: .012, rim: .002 }[kind], rel = { snare: .17, brush: .22, hat: .045, open: .22, shaker: .07, rim: .03 }[kind];
    f.type = kind === 'hat' || kind === 'open' ? 'highpass' : 'bandpass'; f.frequency.value = { snare: 1900, brush: 2600, hat: 8200, open: 7600, shaker: 6200, rim: 2400 }[kind]; f.Q.value = kind === 'rim' ? 6 : .8;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t + att); g.gain.exponentialRampToValueAtTime(.0001, t + att + rel);
    src.start(t, Math.random() * .5); src.stop(t + att + rel + .05);
    if (kind === 'snare') { const o = a.createOscillator(), og = a.createGain(); o.type = 'triangle'; o.frequency.value = 190; og.gain.setValueAtTime(.0001, t); og.gain.exponentialRampToValueAtTime(.04 * v, t + .004); og.gain.exponentialRampToValueAtTime(.0001, t + .09); o.connect(og); og.connect(g); o.start(t); o.stop(t + .1); }
  }
  const DRUMS = { // 16 steps: k kick, s snare, b brush, h hat, o open hat, x shaker, r rim, t tom
    soft: ['k', 'x', '', 'x', '', 'x', '', 'x', 'k', 'x', '', 'x', '', 'x', 'r', 'x'],
    pop: ['k', 'h', '', 'h', 's', 'h', '', 'h', '', 'h', 'k', 'h', 's', 'h', '', 'o'],
    brush: ['k', '', 'h', '', 'b', '', 'h', 'h', '', 'k', 'h', '', 'b', '', 'h', ''],
    pulse: ['k', 'h', 'h', 'h', 'k', 'h', 'h', 'h', 'k', 'h', 'h', 'h', 'k', 'h', 'r', 'h'],
    drive: ['k', 'h', 'h', 'h', 's', 'h', 'h', 'k', 'k', 'h', 'h', 'h', 's', 'h', 'h', 'h']
  };
  // ---- the sequencer ----
  function chordOf(m, deg, sev) { const sc = SCALES[m.scale], n = (d) => m.root + sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7); const c = [n(deg), n(deg + 2), n(deg + 4)]; if (sev) c.push(n(deg + 6)); return c; }
  const noteOf = (m, d, oct) => { const sc = SCALES[m.scale]; return m.root + (oct || 0) + sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7); };
  function playStep(L, t, spb) {
    const m = L.m, bar = Math.floor(L.step / 16), s = L.step % 16, deg = m.prog[bar % m.prog.length], ch = chordOf(m, deg, m.keys && m.keys.sev), beat = s / 4;
    // pad and strings: held chords
    if (s === 0 && m.pad) ch.slice(0, 3).forEach((n, i) => voice(L, 'pad', n, t, spb * 16, m.pad.v, i === 0 ? -.4 : i === 1 ? .4 : 0));
    if (s === 0 && m.strings) { voice(L, 'strings', ch[2] + 12, t, spb * 16, m.strings.v, .3); voice(L, 'strings', ch[0], t, spb * 16, m.strings.v * .8, -.3); }
    if (s === 0 && m.drone && bar % 2 === 0) voice(L, 'drone', m.root - 24, t, spb * 32, m.drone.v, 0);
    // bass lines
    if (m.bass) { const r = ch[0] - 24, b = m.bass, P = { whole: { 0: 0 }, half: { 0: 0, 8: 7 }, walk: { 0: 0, 4: 7, 8: 12, 12: 10 }, syncop: { 0: 0, 6: 0, 10: 7, 14: 12 }, eighths: { 0: 0, 2: 0, 4: 0, 6: 0, 8: 0, 10: 0, 12: 7, 14: 0 }, drive: { 0: 0, 1: 0, 2: 12, 3: 0, 4: 0, 5: 0, 6: 12, 7: 0, 8: 0, 9: 0, 10: 12, 11: 0, 12: 7, 13: 7, 14: 12, 15: 7 } }[b.pat] || {}; if (P[s] != null) { const len = b.pat === 'whole' ? 15 : b.pat === 'half' ? 7 : b.pat === 'drive' ? .9 : b.pat === 'eighths' ? 1.6 : 3; voice(L, 'bass', r + P[s], t, spb * len, b.v, 0); } }
    // keys parts
    [m.keys, m.keys2].forEach((k, ki) => { if (!k) return; const pan = ki ? .35 : -.25, v = k.v;
      if (k.pat === 'arp8' && s % 2 === 0) { const seq = [0, 1, 2, 3, 2, 1, 2, 1], n = ch[seq[(s / 2) % 8] % ch.length] + (seq[(s / 2) % 8] === 3 ? 12 : 0) + 12; voice(L, k.voice, n, t, spb * 2.5, v, pan); }
      if (k.pat === 'arp16') { const seq = [0, 1, 2, 1], n = ch[seq[s % 4]] + 12 + (s >= 8 ? 12 : 0) * (k.voice === 'marimba' ? 0 : 1); voice(L, k.voice, n, t, spb * 1.1, v * (s % 4 === 0 ? 1.15 : .8), pan); }
      if (k.pat === 'offbeat' && (s === 2 || s === 6 || s === 10 || s === 14)) ch.forEach((n, i) => voice(L, k.voice, n + 12, t + i * .008, spb * 1.4, v * .7, pan));
      if (k.pat === 'comp' && (s === 0 || s === 6 || s === 12)) ch.forEach((n, i) => voice(L, k.voice, n + 12, t + i * .012, spb * (s === 6 ? 3 : 5), v * (s === 0 ? 1 : .75), pan));
      if (k.pat === 'stab' && (s === 0 || s === 3 || s === 6 || (s === 10 && bar % 2))) ch.forEach((n) => voice(L, k.voice, n + 12, t, spb * 1.2, v, pan));
      if (k.pat === 'sparse' && (s === 0 || (s === 8 && bar % 2))) ch.forEach((n, i) => voice(L, k.voice, n + 12, t + i * .02, spb * 8, v, pan));
    });
    // the theme, on the lead instrument
    if (m.lead && (bar % 16) >= m.lead.from) { const b8 = (bar % 8) * 4 + beat; THEME_EV.forEach((e) => { if (Math.abs(e.b - b8) < .01 && (!m.lead.sparse || e.l >= 2 || Math.random() < .5)) voice(L, m.lead.voice, noteOf(m, e.d, m.lead.oct), t, spb * 4 * e.l * .95, m.lead.v, .1); }); }
    // drums, with a fill on the last bar of every eight
    if (m.drums) { const pat = DRUMS[m.drums.pat], hit = pat[s], dv = m.drums.v, swing = m.drums.pat === 'brush' && s % 2 ? spb * .28 : 0;
      if (bar % 8 === 7 && s >= 12 && (m.drums.pat === 'drive' || m.drums.pat === 'pop' || m.drums.pat === 'pulse')) drum(L, s % 2 ? 'snare' : 'tom', t, dv * .8);
      else if (hit) drum(L, { k: 'kick', s: 'snare', b: 'brush', h: 'hat', o: 'open', x: 'shaker', r: 'rim' }[hit], t + swing, dv * (s % 4 === 0 ? 1 : .8)); }
  }
  function layer(id, at) {
    const a = ctx(), m = MOODS[id], bus = a.createGain(), start = at || a.currentTime + .08; bus.gain.setValueAtTime(0, a.currentTime); bus.gain.setValueAtTime(0, start); bus.gain.linearRampToValueAtTime(1, start + 1.6); bus.connect(master);
    return { id, m, bus, step: 0, nextT: start, alive: true };
  }
  function play(L, horizon) { const a = ctx(), spb = 60 / L.m.bpm / 4, until = horizon != null ? horizon : a.currentTime + .3; while (L.nextT < until) { if (L.alive || L.nextT < L.dieAt) playStep(L, L.nextT, spb); L.nextT += spb; L.step++; } }
  let layers = [];
  function tick() { if (!on) return; layers.forEach(play); }
  const api = {
    get mood() { return cur; },
    get title() { return cur && MOODS[cur] ? MOODS[cur].name : ''; },
    start(mood) {
      const a = ctx(); if (!a) return; if (a.state === 'suspended' && a.resume) { try { const r = a.resume(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
      if (!on) { on = true; buildBus(a); timer = setInterval(tick, 80); layers = []; cur = null; }
      api.set(mood || cur || 'title');
    },
    set(mood) {
      if (!on || mood === cur || !MOODS[mood]) return; cur = mood; const a = ctx();
      // change on the next bar line of the music that is playing, so the switch lands in time
      const live = layers.find((L) => L.alive); let at = a.currentTime + .08;
      if (live) { const spb = 60 / live.m.bpm / 4, toBar = (16 - (live.step % 16)) % 16; at = live.nextT + toBar * spb; if (at - a.currentTime > 2.5) at = a.currentTime + .1; }
      layers.forEach((L) => { if (!L.alive) return; L.alive = false; L.dieAt = at + 2; try { L.bus.gain.cancelScheduledValues(a.currentTime); L.bus.gain.setValueAtTime(L.bus.gain.value, a.currentTime); L.bus.gain.setValueAtTime(L.bus.gain.value, at); L.bus.gain.linearRampToValueAtTime(0, at + 2); } catch (e) {} const b = L.bus; setTimeout(() => { layers = layers.filter((x) => x !== L); try { b.disconnect(); } catch (e) {} }, (at - a.currentTime + 4.5) * 1000); });
      layers.push(layer(mood, at));
    },
    // render ahead (used for offline previews)
    pump(until) { layers.forEach((L) => play(L, until)); },
    rain(v) { rain = !!v; if (lowpass) { const a = ctx(); lowpass.frequency.setTargetAtTime(rain ? 5200 : 9000, a.currentTime, .8); } },
    volume(v) { vol = Math.max(0, Math.min(1, v)) * .85 + .0001; if (on && master) { const a = ctx(); master.gain.setTargetAtTime(vol, a.currentTime, .1); } },
    // short fanfares over the score, voiced on brass and bells
    sting(kind) {
      if (!on) return; const a = ctx(), t = a.currentTime + .05, L = { bus: master };
      const seq = { accept: [[67, 0], [71, .12], [74, .24], [79, .36]], done: [[60, 0], [64, .14], [67, .28], [72, .42], [76, .42], [79, .42]], promo: [[55, 0], [60, .2], [64, .4], [67, .6], [72, .9], [76, .9], [79, .9]], fail: [[64, 0], [60, .2]], p1: [[76, 0], [75, .1], [76, .2], [75, .3], [69, .45]], grade: [[60, 0], [64, .12], [67, .24], [72, .4]], gradeS: [[60, 0], [64, .1], [67, .2], [72, .3], [76, .45], [79, .45], [84, .45]], card: [[48, 0], [55, 0], [60, .3], [64, .3], [67, .6], [72, .6]], set: [[72, 0], [76, .08], [79, .16], [84, .26]] }[kind] || [];
      seq.forEach(([n, d]) => { voice(L, 'brass', n, t + d, kind === 'promo' ? 1.4 : .8, .045, 0); voice(L, 'bell', n + 12, t + d, .6, .02, 0); });
    },
    stop() { if (!on) return; on = false; const a = ctx(), g0 = master; try { g0.gain.cancelScheduledValues(a.currentTime); g0.gain.setValueAtTime(g0.gain.value, a.currentTime); g0.gain.linearRampToValueAtTime(0, a.currentTime + 1.2); } catch (e) {} setTimeout(() => { clearInterval(timer); try { g0.disconnect(); } catch (e) {} }, 1300); layers = []; cur = null; }
  };
  return api;
}
