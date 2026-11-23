// Patrol City original score. Everything is synthesized live in the browser (no audio files).
// One recurring theme, "Port Meridian", is arranged ten ways (title, day, night, indoors, story, side case,
// en route, priority one, on scene, marine). The game picks a mood from what is happening and the score
// moves to it on the next bar line. Instruments: pads, string section, piano, electric piano, plucks,
// marimba, bells, brass, lead and bass, with a soft drum kit, stereo placement, reverb and delay.

import { TRACKS } from './scoredata.js';
// the hook's opening motif, for intros (heard in the intro's last two bars) and outros (slowed, then it rings out)
const MOTIF_IN = 'r:16 4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 r:4 4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 1:4', MOTIF_OUT = '4:3 7:1 6:2/3 7:2/3 6:2/3 4:2 0:8 r:16';
const LEADX = 1.7, BANDX = .82, DUCK = .72; // melody up, band down a touch, and the band ducks under each melody note
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const SCALES = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], mix: [0, 2, 4, 5, 7, 9, 10] };
// the theme: scale degree and length in beats ('r' is a rest). Two four-bar phrases.
const THEME = [[2, 1], [4, 1], [5, 2], [4, 1], [2, 1], [1, 2], [0, 1], [1, 1], [2, 2], ['r', 4],
  [2, 1], [4, 1], [7, 2], [6, 1], [5, 1], [4, 2], [5, 1], [4, 1], [2, 2], [1, 2], [0, 2]];
const THEME_EV = (() => { let b = 0; return THEME.map(([d, l]) => { const e = { b, d, l }; b += l; return e; }).filter((e) => e.d !== 'r'); })();

// themes written as "degree:beats" pairs ('r' rests), eight bars long; parsed once
// a note is degree:length; lengths can be fractions (1/3 for triplets), and a degree can carry # or b (a chromatic step)
export function parseTheme(str) { let b = 0; const out = []; str.trim().split(/\s+/).forEach((tok) => { const [d, l] = tok.split(':'), fr = l.split('/'), len = fr.length > 1 ? +fr[0] / +fr[1] : +l, acc = /#$/.test(d) ? 1 : /b$/.test(d) ? -1 : 0; if (d !== 'r' && b < 32 - 1e-6) out.push({ b, d: parseInt(d, 10), acc, l: Math.min(len, 32 - b) }); b += len; }); return out; }
// a composed track runs intro (4 bars) · A (8) · B (8) · A again, fuller (8) · outro (4) = 32 bars, then the next track plays
function sectionOf(bar) { const k = bar % 32; return k < 4 ? 'intro' : k < 12 ? 'A' : k < 20 ? 'B' : k < 28 ? 'A2' : 'outro'; }
const VIEW = new WeakMap();
function sectionView(m, sec) { let c = VIEW.get(m); if (!c) { c = {}; VIEW.set(m, c); } if (c[sec]) return c[sec];
  const v = Object.assign({}, m); v.ev = m._evA || (m._evA = parseTheme(m.theme)); v.counter = null;
  if (sec === 'intro' || sec === 'outro') { v.drums = null; v.lead = null; v.keys2 = null; v.bass = m.bass && { pat: 'whole', v: m.bass.v * .8 };
    // intros and outros come in kinds, so tracks don't all start and end alike: the band alone ('band'), a drum break
    // ('drums'), the bass line with a light kit ('bass'), horn hits over the groove ('hits'), or the hook's motif played
    // alone over soft keys ('motif'; the intro states it in its last two bars, the outro lets it ring out slowly)
    const ty = (sec === 'intro' ? m.intro : m.outro) || 'band', B = m.band || {}, bb = B.bass;
    if (ty === 'drums') { v.band = bb ? { bass: { pat: 'whole', v: bb.v * .7 } } : null; v.keys = null; v.pad = null; v.strings = null; v.drone = null; v.drums = m.drums || { pat: 'funk', v: .7 }; }
    else if (ty === 'bass') { v.band = bb ? { bass: bb } : null; v.keys = null; v.pad = null; v.strings = null; v.drums = m.drums ? { pat: m.drums.pat === 'brush' || m.drums.pat === 'jazz' ? m.drums.pat : 'soft', v: m.drums.v * .45 } : null; }
    else if (ty === 'hits') { v.band = { horns: B.horns || { v: .02 }, bass: bb ? { pat: 'whole', v: bb.v } : undefined }; v.drums = m.drums ? { pat: m.drums.pat, v: m.drums.v * .6 } : null; }
    else if (ty === 'swell') { v.band = null; v.keys = null; v.drums = { pat: 'roll', v: .55 }; v.swell = true; v.strings = m.strings || { v: .03 }; v.choir = m.choir; v.drone = m.drone || { v: .02 }; v.lead = Object.assign({}, m.lead || { voice: 'brass', v: .03, oct: 0 }, { sparse: false }); v.ev = m._evIn || (m._evIn = parseTheme(m.introTheme || MOTIF_IN)); } // a film opening: low drone, strings and a choir rising over a timpani roll that grows, and the hook's motif on low brass
    else if (ty === 'final') { v.band = null; v.keys = null; v.drums = { pat: 'final', v: (m.drums || {}).v || 1 }; v.strings = m.strings2 || m.strings; v.choir = m.choir; v.lead = null; v.bass = m.bass && { pat: 'whole', v: m.bass.v }; } // one last big chord and a long ring
    else if (ty === 'motif') { v.band = { rhodes: { pat: 'ballad', v: ((B.rhodes || {}).v || .026) * .9 }, vamp: B.vamp }; v.drums = null; v.lead = Object.assign({}, m.lead || { voice: 'vibes', v: .03, oct: 12 }, { sparse: false }); const key = sec === 'intro' ? '_evIn' : '_evOut'; v.ev = m[key] || (m[key] = parseTheme(sec === 'intro' ? m.introTheme || MOTIF_IN : m.outroTheme || MOTIF_OUT)); } }
  if (sec === 'B') { v.prog = m.progB || m.prog; v.ev = m.themeB ? (m._evB || (m._evB = parseTheme(m.themeB))) : v.ev; if (m.leadB) v.lead = m.leadB; if (m.drumsB !== undefined) v.drums = m.drumsB; if (m.keysB) v.keys = m.keysB; }
  if (sec === 'A' && m.themeA1) v.ev = m._evA1 || (m._evA1 = parseTheme(m.themeA1)); // a hint of the hook first; the full tune comes back in A2
  if (sec === 'A2') { v.counter = m.counter || null; if (m.strings2) v.strings = m.strings2; if (m.leadA2) v.lead = m.leadA2; if (m.choir2) v.choir = m.choir2; if (m.drumsA2) v.drums = m.drumsA2; } // the last time through can be the biggest
  return (c[sec] = v); }

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

Object.assign(MOODS, TRACKS);
// the live synth (used until the first file loads) plays each situation's first composed arrangement
for (const k of Object.keys(MOODS)) if (TRACKS[k + '_1']) MOODS[k] = TRACKS[k + '_1'];
export function createMusic(getCtx) {
  let on = false, vol = .85, master = null, out = null, wet = null, dly = null, timer = 0, cur = null, rain = false, noise = null, lowpass = null;
  const ctx = () => getCtx();
  function noiseBuf(a) { if (noise) return noise; const b = a.createBuffer(1, a.sampleRate, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (noise = b); }
  function buildBus(a) {
    master = a.createGain(); master.gain.value = vol;
    lowpass = a.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = 9000;
    const cmp = a.createDynamicsCompressor(); cmp.threshold.value = -20; cmp.knee.value = 12; cmp.ratio.value = 2.5; cmp.attack.value = .02; cmp.release.value = .35;
    // a warm master: a little body around 200 Hz and a softer top above 6 kHz, so long sessions stay easy on the ear
    const warm = a.createBiquadFilter(), soft = a.createBiquadFilter(); warm.type = 'lowshelf'; warm.frequency.value = 200; warm.gain.value = 1.5; soft.type = 'highshelf'; soft.frequency.value = 6000; soft.gain.value = -3;
    master.connect(lowpass); lowpass.connect(warm); warm.connect(soft); soft.connect(cmp); cmp.connect(a.destination);
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
    v *= L.gainK || 1; // a swelling intro scales every voice
    const a = ctx(), f = hz(m), g = a.createGain(), p = a.createStereoPanner ? a.createStereoPanner() : null; let endT = t + dur;
    const dest = (L.route === 'lead' && L.leadBus) || (L.route === 'band' && L.bandBus) || L.bus; // the melody gets its own lane in the mix
    if (p) { p.pan.value = pan || 0; g.connect(p); p.connect(dest); } else g.connect(dest);
    const send = (amt, toDelay) => { const s = a.createGain(); s.gain.value = amt; g.connect(s); s.connect(toDelay ? dly : wet); };
    const env = (att, peak, rel, sus) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + att); if (sus != null) { g.gain.setTargetAtTime(peak * sus, t + att, rel * .4); g.gain.setTargetAtTime(.0001, t + dur, rel / 3); endT = t + dur + rel * 1.5; } else { g.gain.exponentialRampToValueAtTime(.0001, t + att + rel); endT = t + att + rel + .05; } };
    const osc = (type, freq, det) => { const o = a.createOscillator(); o.type = type; o.frequency.value = freq; if (det) o.detune.value = det; return o; };
    const lp = (fr, q) => { const b = a.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = fr * (rain ? .75 : 1); b.Q.value = q || .7; b.connect(g); return b; };
    let oscs = [];
    if (kind === 'pad') { const b = lp(1200); [-9, 9, 0].forEach((d, i) => { const o = osc(i === 2 ? 'triangle' : 'sawtooth', f, d); o.connect(b); oscs.push(o); }); const lfo = osc('sine', .18), lg = a.createGain(); lg.gain.value = 380; lfo.connect(lg); lg.connect(b.frequency); oscs.push(lfo); env(.9, v, 1.4, .85); send(.6); }
    else if (kind === 'choir') { // a choir singing "ah": detuned voices through the two vowel formants, slow to bloom, a slow vibrato
      const f1 = a.createBiquadFilter(), f2 = a.createBiquadFilter(), mix = a.createGain(); f1.type = 'bandpass'; f1.frequency.value = 760; f1.Q.value = 5; f2.type = 'bandpass'; f2.frequency.value = 1180; f2.Q.value = 6; mix.gain.value = 2.2; f1.connect(mix); f2.connect(mix); mix.connect(lp(3200));
      const vib = osc('sine', 4.6), vg = a.createGain(); vg.gain.value = 6; vib.connect(vg); [-11, 0, 11].forEach((d) => { const o = osc('sawtooth', f, d); vg.connect(o.detune); o.connect(f1); o.connect(f2); oscs.push(o); }); oscs.push(vib); env(.9, v, 1.6, .85); send(.7); }
    else if (kind === 'strings' || kind === 'stac') { const b = lp(kind === 'stac' ? 2600 : 2200); const vib = osc('sine', 5.2), vg = a.createGain(); vg.gain.value = kind === 'stac' ? 0 : 5; vib.connect(vg); [-7, 0, 7].forEach((d) => { const o = osc('sawtooth', f, d); vg.connect(o.detune); o.connect(b); oscs.push(o); }); oscs.push(vib); if (kind === 'stac') env(.012, v, .16); else env(.28, v, .9, .8); send(.5); }
    else if (kind === 'piano') { const b = lp(3200); const o1 = osc('triangle', f), o2 = osc('sine', f * 2), g2 = a.createGain(); g2.gain.value = .35; o1.connect(b); o2.connect(g2); g2.connect(b); oscs = [o1, o2]; b.frequency.setValueAtTime(4200, t); b.frequency.exponentialRampToValueAtTime(900, t + 1.2); env(.006, v, Math.min(2.4, dur + 1.2)); send(.45); }
    else if (kind === 'epiano' || kind === 'bell') { const ratio = kind === 'bell' ? 3.5 : 1, mod = osc('sine', f * ratio), mg = a.createGain(), car = osc('sine', f); mg.gain.setValueAtTime(f * (kind === 'bell' ? 2.2 : 1.6), t); mg.gain.exponentialRampToValueAtTime(f * .08, t + (kind === 'bell' ? 1.4 : .6)); mod.connect(mg); mg.connect(car.frequency); car.connect(g); oscs = [mod, car]; env(.006, v, kind === 'bell' ? 2.2 : Math.min(1.8, dur + .7)); send(kind === 'bell' ? .55 : .35); if (kind === 'bell') send(.6, true); }
    else if (kind === 'pluck') { const b = lp(3000, 2); b.frequency.setValueAtTime(3600, t); b.frequency.exponentialRampToValueAtTime(420, t + .32); const o = osc('sawtooth', f), o2 = osc('square', f * .5, 4), g2 = a.createGain(); g2.gain.value = .3; o.connect(b); o2.connect(g2); g2.connect(b); oscs = [o, o2]; env(.004, v, .45); send(.3); send(.25, true); }
    else if (kind === 'marimba') { const o = osc('sine', f), o2 = osc('sine', f * 4), g2 = a.createGain(); g2.gain.setValueAtTime(.4, t); g2.gain.exponentialRampToValueAtTime(.001, t + .12); o.connect(g); o2.connect(g2); g2.connect(g); oscs = [o, o2]; env(.004, v, .55); send(.35); }
    else if (kind === 'brass') { const b = lp(800, 1.2); b.frequency.setValueAtTime(500, t); b.frequency.linearRampToValueAtTime(2400, t + .12); b.frequency.setTargetAtTime(1300, t + .14, .2); [-6, 6].forEach((d) => { const o = osc('sawtooth', f, d); o.connect(b); oscs.push(o); }); env(.05, v, .35, .7); send(.4); }
    else if (kind === 'lead') { const b = lp(2400); const o = osc('square', f), vib = osc('sine', 5.5), vg = a.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(9, t + .4); vib.connect(vg); vg.connect(o.detune); o.connect(b); oscs = [o, vib]; env(.02, v, .5, .75); send(.35); send(.45, true); }
    else if (kind === 'bass') { const b = lp(520, 1.1); b.frequency.setValueAtTime(900, t); b.frequency.exponentialRampToValueAtTime(380, t + .25); const o = osc('sine', f), o2 = osc('sawtooth', f), g2 = a.createGain(); g2.gain.value = .35; o.connect(b); o2.connect(g2); g2.connect(b); oscs = [o, o2]; env(.012, v, .25, .7); }
    else if (kind === 'flute') { const b = lp(3000); const o = osc('sine', f), o2 = osc('triangle', f * 2), g2 = a.createGain(); g2.gain.value = .12; const vib = osc('sine', 4.8), vg = a.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(7, t + .35); vib.connect(vg); vg.connect(o.detune); o.connect(b); o2.connect(g2); g2.connect(b); oscs = [o, o2, vib]; env(.06, v, .35, .85); send(.4); send(.3, true); }
    else if (kind === 'organ') { const b = lp(3800); [[1, .55], [2, .3], [3, .14], [4, .1]].forEach(([h, gv]) => { const o = osc('sine', f * h), og = a.createGain(); og.gain.value = gv; o.connect(og); og.connect(b); oscs.push(o); }); const trem = osc('sine', 6.2), tg = a.createGain(); tg.gain.value = v * .18; trem.connect(tg); tg.connect(g.gain); oscs.push(trem); env(.02, v, .12, .95); send(.3); }
    else if (kind === 'vibes') { const o = osc('sine', f), o2 = osc('sine', f * 4.01), g2 = a.createGain(); g2.gain.setValueAtTime(.25, t); g2.gain.exponentialRampToValueAtTime(.001, t + .2); o.connect(g); o2.connect(g2); g2.connect(g); const trem = osc('sine', 5), tg = a.createGain(); tg.gain.value = v * .3; trem.connect(tg); tg.connect(g.gain); oscs = [o, o2, trem]; env(.004, v, 1.6); send(.45); send(.25, true); }
    else if (kind === 'nylon') { const b = lp(2600, 1.4); b.frequency.setValueAtTime(3400, t); b.frequency.exponentialRampToValueAtTime(700, t + .5); const o = osc('triangle', f), o2 = osc('sawtooth', f, 3), g2 = a.createGain(); g2.gain.value = .18; o.connect(b); o2.connect(g2); g2.connect(b); oscs = [o, o2]; env(.003, v, .9); send(.3); }
    else if (kind === 'drone') { const b = lp(500); [0, 7].forEach((d) => { const o = osc('sawtooth', f, d); o.connect(b); oscs.push(o); }); env(1.5, v, 2, .9); send(.7); }
    // ---- the cop-show band (jazz-funk): Rhodes, clavinet, wah guitar, finger bass, horn section, tenor sax, muted trumpet ----
    else if (kind === 'rhodes') { // FM tine: a bark on the attack that mellows, a little tine ping, and a slow tremolo
      const car = osc('sine', f), mod = osc('sine', f), mg = a.createGain(), ping = osc('sine', f * 14), pg = a.createGain(), tr = a.createGain(), lfo = osc('sine', 4.6), lg = a.createGain();
      mg.gain.setValueAtTime(f * 2.6 * Math.min(1, v * 14), t); mg.gain.exponentialRampToValueAtTime(f * .12, t + .9); mod.connect(mg); mg.connect(car.frequency);
      pg.gain.setValueAtTime(f * .9, t); pg.gain.exponentialRampToValueAtTime(.01, t + .05); ping.connect(pg); pg.connect(car.frequency);
      tr.gain.value = .82; lg.gain.value = .18; lfo.connect(lg); lg.connect(tr.gain); car.connect(tr); tr.connect(lp(4200)); oscs = [car, mod, ping, lfo]; env(.004, v, .6, .45); send(.22); }
    else if (kind === 'clav') { const b = lp(3800, 2.2); b.frequency.setValueAtTime(5200, t); b.frequency.exponentialRampToValueAtTime(900, t + .18); const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 260; hp.connect(b);
      const o = osc('square', f), o2 = osc('sawtooth', f * 2, 6), g2 = a.createGain(); g2.gain.value = .3; o.connect(hp); o2.connect(g2); g2.connect(hp); oscs = [o, o2]; env(.002, v, Math.min(.22, dur + .05)); send(.12); }
    else if (kind === 'wah') { // guitar through a wah pedal: the filter sweeps open and closed on every note
      const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 5.5; bp.frequency.setValueAtTime(420, t); bp.frequency.exponentialRampToValueAtTime(2300, t + Math.min(.09, dur * .5)); bp.frequency.exponentialRampToValueAtTime(650, t + Math.max(.12, dur)); bp.connect(lp(5000));
      const o = osc('sawtooth', f), o2 = osc('sawtooth', f * 1.003); o.connect(bp); o2.connect(bp); oscs = [o, o2]; env(.002, v, Math.min(.3, dur + .04)); send(.15); }
    else if (kind === 'fbass') { const b = lp(700, 1.6); b.frequency.setValueAtTime(dur < .2 ? 1800 : 1200, t); b.frequency.exponentialRampToValueAtTime(320, t + .2); const o = osc('sine', f), o2 = osc('sawtooth', f), g2 = a.createGain(); g2.gain.value = .45; o.connect(b); o2.connect(g2); g2.connect(b); oscs = [o, o2]; env(.004, v, .14, .6); }
    else if (kind === 'horns') { // trumpet, tenor and trombone in unison and octave: a bright attack that settles, with a short fall-off
      const b = lp(900, 1.4); b.frequency.setValueAtTime(700, t); b.frequency.linearRampToValueAtTime(2700, t + .035); b.frequency.setTargetAtTime(1400, t + .05, .16);
      [[1, -8], [1, 8], [.5, 0]].forEach(([k, d]) => { const o = osc('sawtooth', f * k, d); if (dur < .3) o.frequency.setTargetAtTime(f * k * .94, t + dur * .9, .05); o.connect(b); oscs.push(o); }); env(.018, v, .18, .75); send(.3); }
    else if (kind === 'sax') { const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1150; bp.Q.value = 1.1; bp.connect(lp(2500));
      const o = osc('sawtooth', f), vib = osc('sine', 5.3), vg = a.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(14, t + .35); vib.connect(vg); vg.connect(o.detune); o.connect(bp);
      const br = a.createBufferSource(), bf = a.createBiquadFilter(), bg = a.createGain(); br.buffer = noiseBuf(a); bf.type = 'bandpass'; bf.frequency.value = f * 3; bf.Q.value = 2; bg.gain.value = .07; br.connect(bf); bf.connect(bg); bg.connect(bp); oscs = [o, vib, br]; env(.04, v, .25, .8); send(.32); send(.25, true); }
    else if (kind === 'mute') { // trumpet with a harmon mute: cool and close, rounded off so it never buzzes in the ear
      const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 1.6; bp.connect(lp(3000)); const o = osc('triangle', f), o2 = osc('sawtooth', f, 4), vib = osc('sine', 5.6), vg = a.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(10, t + .3); vib.connect(vg); vg.connect(o.detune); o.connect(bp); o2.connect(bp); oscs = [o, o2, vib]; env(.025, v, .2, .78); send(.35); send(.3, true); }
    oscs.forEach((o) => { o.start(t); o.stop(endT + .1); });
    return { g, end: endT };
  }
  function drum(L, kind, t, v) {
    const a = ctx(), g = a.createGain(), p = a.createStereoPanner ? a.createStereoPanner() : null;
    if (kind === 'ghost') return drum(L, 'snare', t, v * .22);
    if (kind === 'conga') { if (p) { p.pan.value = -.35; g.connect(p); p.connect(L.bus); } else g.connect(L.bus); const o = a.createOscillator(); o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(175, t + .1); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09 * v, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + .22); o.connect(g); o.start(t); o.stop(t + .25); return; }
    if (p) { p.pan.value = kind === 'hat' || kind === 'shaker' ? .25 : kind === 'tom' ? -.2 : 0; g.connect(p); p.connect(L.bus); } else g.connect(L.bus);
    if (kind === 'timp') { const o = a.createOscillator(), o2 = a.createOscillator(), g2 = a.createGain(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.setValueAtTime(82, t); o.frequency.exponentialRampToValueAtTime(70, t + .5); o2.frequency.setValueAtTime(164, t); o2.frequency.exponentialRampToValueAtTime(140, t + .3); g2.gain.value = .35; o2.connect(g2); g2.connect(g); o.connect(g);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16 * v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + 1.4); o.start(t); o2.start(t); o.stop(t + 1.5); o2.stop(t + 1.5); const s2 = a.createGain(); s2.gain.value = .35; g.connect(s2); s2.connect(wet); return; }
    if (kind === 'kick' || kind === 'tom') { const o = a.createOscillator(); o.frequency.setValueAtTime(kind === 'kick' ? 95 : 170, t); o.frequency.exponentialRampToValueAtTime(kind === 'kick' ? 44 : 95, t + .18); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v * (kind === 'kick' ? .3 : .16), t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + .36); o.connect(g); o.start(t); o.stop(t + .4); return; }
    const src = a.createBufferSource(), f = a.createBiquadFilter(); src.buffer = noiseBuf(a); src.connect(f); f.connect(g);
    const peak = { snare: .09, brush: .045, hat: .021, open: .017, shaker: .016, rim: .04, ride: .016, clap: .06 }[kind] * v /* cymbals kept gentle: the top end should never tire the ear */, att = { snare: .006, brush: .02, hat: .003, open: .004, shaker: .012, rim: .002, ride: .002, clap: .004 }[kind], rel = { snare: .17, brush: .22, hat: .045, open: .22, shaker: .07, rim: .03, ride: .55, clap: .12 }[kind];
    f.type = kind === 'hat' || kind === 'open' || kind === 'ride' ? 'highpass' : 'bandpass'; f.frequency.value = { snare: 1900, brush: 2600, hat: 8200, open: 7600, shaker: 6200, rim: 2400, ride: 5200, clap: 1300 }[kind]; f.Q.value = kind === 'rim' ? 6 : .8;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t + att); g.gain.exponentialRampToValueAtTime(.0001, t + att + rel);
    src.start(t, Math.random() * .5); src.stop(t + att + rel + .05);
    if (kind === 'snare') { const o = a.createOscillator(), og = a.createGain(); o.type = 'triangle'; o.frequency.value = 190; og.gain.setValueAtTime(.0001, t); og.gain.exponentialRampToValueAtTime(.04 * v, t + .004); og.gain.exponentialRampToValueAtTime(.0001, t + .09); o.connect(og); og.connect(g); o.start(t); o.stop(t + .1); }
  }
  const DRUMS = { // 16 steps: k kick, s snare, b brush, h hat, o open hat, x shaker, r rim, t tom
    soft: ['k', 'x', '', 'x', '', 'x', '', 'x', 'k', 'x', '', 'x', '', 'x', 'r', 'x'],
    epic: ['kT', '', '', '', 'o', '', '', '', 'kT', '', 'T', '', 'so', '', 'T', 'T'],
    roll: ['T', '', 'T', '', 'T', '', 'T', '', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'],
    final: ['kTo', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    pop: ['k', 'h', '', 'h', 's', 'h', '', 'h', '', 'h', 'k', 'h', 's', 'h', '', 'o'],
    brush: ['k', '', 'h', '', 'b', '', 'h', 'h', '', 'k', 'h', '', 'b', '', 'h', ''],
    pulse: ['k', 'h', 'h', 'h', 'k', 'h', 'h', 'h', 'k', 'h', 'h', 'h', 'k', 'h', 'r', 'h'],
    drive: ['k', 'h', 'h', 'h', 's', 'h', 'h', 'k', 'k', 'h', 'h', 'h', 's', 'h', 'h', 'h'],
    half: ['k', '', 'h', '', '', '', 'h', '', 's', '', 'h', '', '', 'k', 'h', ''],
    shuffle: ['k', '', '', 'h', 's', '', '', 'h', 'k', '', 'k', 'h', 's', '', '', 'h'],
    bossa: ['k', 'x', 'r', 'x', 'k', 'x', 'r', 'k', 'k', 'r', 'x', 'k', 'r', 'x', 'k', 'x'],
    march: ['k', '', 's', 's', 'k', '', 's', '', 'k', '', 's', 's', 'k', 's', 's', 's'],
    train: ['k', 'x', 'x', 'x', 'b', 'x', 'x', 'x', 'k', 'x', 'x', 'x', 'b', 'x', 'x', 'r'],
    // the cop-show kit (several hits on one step are written together; g ghost snare, d ride, c conga, p clap)
    funk: ['kh', 'h', 'gh', 'h', 'sh', 'h', 'gh', 'kh', 'h', 'kh', 'gh', 'h', 'sh', 'h', 'gh', 'o'],
    breaks: ['kh', 'h', 'h', 'kh', 'sh', 'h', 'gh', 'h', 'gh', 'kh', 'kh', 'h', 'sh', 'h', 'gh', 'h'],
    jazz: ['dk', '', '', '', 'dh', '', '', 'd', 'd', '', '', '', 'dh', '', 'g', 'd'],
    lowride: ['kh', '', 'h', 'g', 'h', '', 'hc', '', 'sh', '', 'h', 'g', 'kh', 'c', 'h', 'g'],
    pursuit: ['kh', 'h', 'h', 'h', 'sh', 'h', 'gh', 'kh', 'kh', 'h', 'h', 'kh', 'sh', 'h', 'h', 'o']
  };
  // ---- the sequencer ----
  function chordOf(m, deg, sev) { const sc = SCALES[m.scale], n = (d) => m.root + sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7); const c = [n(deg), n(deg + 2), n(deg + 4)]; if (sev) c.push(n(deg + 6)); if (sev === 9) c.push(n(deg + 8)); return c; }
  // a rootless jazz voicing (3rd, 7th, 9th, 5th) for Rhodes and horns: the bass plays the root
  const jazzV = (m, deg) => { const c = chordOf(m, deg, 9); return [c[1], c[3], c[4], c[2] + 12]; };
  const noteOf = (m, d, oct) => { const sc = SCALES[m.scale]; return m.root + (oct || 0) + sc[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7); };
  function playStep(L, t, spb) {
    const m0 = L.m, bar = Math.floor(L.step / 16), s = L.step % 16, beat = s / 4, sec = m0.form ? sectionOf(bar) : 'A';
    L.gainK = m0.form && m0.intro === 'swell' && sectionOf(bar) === 'intro' ? .25 + .75 * Math.pow(((bar % 32) * 16 + s + 1) / 64, 1.6) : 1; // the opening grows from almost nothing
    const tStraight = t; if (m0.swing && s % 2) t += m0.swing * spb; // the band swings its sixteenths; the melody keeps its own written rhythm
    const m = m0.form ? sectionView(m0, sec) : m0, rb = m0.form ? (bar - (sec === 'B' ? 12 : sec === 'A2' ? 20 : 4) + 64) : bar;
    const deg = m.prog[rb % m.prog.length], ch = chordOf(m, deg, m.keys && m.keys.sev);
    L.route = 'band';
    // pad and strings: held chords
    if (s === 0 && m.pad) ch.slice(0, 3).forEach((n, i) => voice(L, 'pad', n, t, spb * 16, m.pad.v, i === 0 ? -.4 : i === 1 ? .4 : 0));
    if (s === 0 && m.choir) ch.slice(0, 3).forEach((n, i) => voice(L, 'choir', n + 12, t + i * .03, spb * 16, m.choir.v * (i === 2 ? .8 : 1), i === 0 ? -.3 : i === 1 ? .3 : 0));
    if (s === 0 && m.strings) { voice(L, 'strings', ch[2] + 12, t, spb * 16, m.strings.v, .3); voice(L, 'strings', ch[0], t, spb * 16, m.strings.v * .8, -.3); }
    if (s === 0 && m.drone && bar % 2 === 0) voice(L, 'drone', m.root - 24, t, spb * 32, m.drone.v, 0);
    L.route = null;
    // bass lines
    if (m.bass) { const r = ch[0] - 24, b = m.bass, P = { whole: { 0: 0 }, half: { 0: 0, 8: 7 }, walk: { 0: 0, 4: 7, 8: 12, 12: 10 }, syncop: { 0: 0, 6: 0, 10: 7, 14: 12 }, eighths: { 0: 0, 2: 0, 4: 0, 6: 0, 8: 0, 10: 0, 12: 7, 14: 0 }, bounce: { 0: 0, 3: 0, 8: 7, 11: 7 }, march: { 0: 0, 4: 7, 8: 0, 12: 7 }, root5: { 0: 0, 6: 7, 8: 12, 14: 7 }, drive: { 0: 0, 1: 0, 2: 12, 3: 0, 4: 0, 5: 0, 6: 12, 7: 0, 8: 0, 9: 0, 10: 12, 11: 0, 12: 7, 13: 7, 14: 12, 15: 7 } }[b.pat] || {}; if (P[s] != null) { const len = b.pat === 'whole' ? 15 : b.pat === 'half' ? 7 : b.pat === 'drive' ? .9 : b.pat === 'eighths' ? 1.6 : 3; voice(L, 'bass', r + P[s], t, spb * len, b.v, 0); } }
    L.route = 'band';
    // keys parts
    [m.keys, m.keys2].forEach((k, ki) => { if (!k) return; const pan = ki ? .35 : -.25, v = k.v;
      if (k.pat === 'arp8' && s % 2 === 0) { const seq = [0, 1, 2, 3, 2, 1, 2, 1], n = ch[seq[(s / 2) % 8] % ch.length] + (seq[(s / 2) % 8] === 3 ? 12 : 0) + 12; voice(L, k.voice, n, t, spb * 2.5, v, pan); }
      if (k.pat === 'arp16') { const seq = [0, 1, 2, 1], n = ch[seq[s % 4]] + 12 + (s >= 8 ? 12 : 0) * (k.voice === 'marimba' ? 0 : 1); voice(L, k.voice, n, t, spb * 1.1, v * (s % 4 === 0 ? 1.15 : .8), pan); }
      if (k.pat === 'offbeat' && (s === 2 || s === 6 || s === 10 || s === 14)) ch.forEach((n, i) => voice(L, k.voice, n + 12, t + i * .008, spb * 1.4, v * .7, pan));
      if (k.pat === 'comp' && (s === 0 || s === 6 || s === 12)) ch.forEach((n, i) => voice(L, k.voice, n + 12, t + i * .012, spb * (s === 6 ? 3 : 5), v * (s === 0 ? 1 : .75), pan));
      if (k.pat === 'stab' && (s === 0 || s === 3 || s === 6 || (s === 10 && bar % 2))) ch.forEach((n) => voice(L, k.voice, n + 12, t, spb * 1.2, v, pan));
      if (k.pat === 'pulse8' && s % 2 === 0) ch.forEach((n, i) => voice(L, k.voice, n + 12, t + i * .006, spb * 1.5, v * (s % 8 === 0 ? 1 : .7), pan));
      if (k.pat === 'alberti' && s % 2 === 0) { const seq = [0, 2, 1, 2], n = ch[seq[(s / 2) % 4]] + 12; voice(L, k.voice, n, t, spb * 2.2, v * (s % 8 === 0 ? 1.1 : .85), pan); }
      if (k.pat === 'strum' && (s === 0 || s === 6 || s === 8 || s === 14)) ch.concat([ch[0] + 12]).forEach((n, i) => voice(L, k.voice, n + 12, t + i * .022, spb * 3, v * (s === 0 ? 1 : .7), pan));
      if (k.pat === 'sparse' && (s === 0 || (s === 8 && bar % 2))) ch.forEach((n, i) => voice(L, k.voice, n + 12, t + i * .02, spb * 8, v, pan));
    });
    // the band: Rhodes comping, wah guitar, clavinet riff and horn hits, all on rootless jazz voicings
    if (m.band) { const B = m.band, J = jazzV(m, deg), nx = m.prog[(rb + 1) % m.prog.length];
      if (B.rhodes) { const R = B.rhodes, hits = { funk: { 0: 3, 3: 1, 6: 1.5, 10: 2, 12: 1 }, ballad: { 0: 7, 10: 5 }, push: { 0: 1.5, 3: 1, 7: 2, 10: 1, 14: 1.5 } }[R.pat || 'funk'], d = hits[s]; if (d) J.forEach((n, i) => voice(L, 'rhodes', n, t + i * .009, spb * d, R.v * (s === 0 ? 1 : .8), -.3)); }
      if (B.wah) { const W = B.wah, acc = s % 4 === 2; if (acc || (W.busy && s % 2 === 0)) J.slice(0, 2).forEach((n, i) => voice(L, 'wah', n + 12, t + i * .004, acc ? spb * .9 : spb * .35, W.v * (acc ? 1 : .55), .35)); else if (W.busy) voice(L, 'wah', J[0] + 12, t, spb * .2, W.v * .3, .35); }
      if (B.clav && [0, 3, 4, 7, 10, 12, 14].includes(s)) { const riff = { 0: 0, 3: 2, 4: 1, 7: 3, 10: 0, 12: 2, 14: 3 }[s]; voice(L, 'clav', J[riff] + (s >= 10 ? 12 : 0), t, spb * .8, B.clav.v, .2); }
      if (B.horns) { const H = B.horns, on = bar % 2 ? [10, 11] : [0, 6]; if (on.includes(s)) J.slice(0, 3).forEach((n) => voice(L, 'horns', n + 12, t, spb * (s === 10 ? .6 : 1.4), H.v, 0)); }
      if (B.vamp && s === 0) J.forEach((n, i) => voice(L, 'pad', n, t, spb * 16, B.vamp.v, i % 2 ? .3 : -.3));
      L.route = null; // the bass stays out of the ducked lane, it is the floor
      // finger bass: a funk line with octave pops, or a walking jazz line that leads into the next chord
      if (B.bass) { const r = chordOf(m, deg)[0] - 24, bv = B.bass.v;
        if (B.bass.pat === 'funk') { const P = { 0: [0, 1.6], 3: [12, .4], 6: [0, .8], 7: [10, .5], 10: [0, .6], 11: [12, .4], 14: [7, .8] }[s]; if (P) voice(L, 'fbass', r + P[0], t, spb * P[1], bv * (s === 0 ? 1.1 : .85), 0); }
        else if (B.bass.pat === 'walk' && s % 4 === 0) { const c = chordOf(m, deg, true), nr = chordOf(m, nx)[0] - 24, q = s / 4, n = q === 0 ? r : q === 1 ? c[1] - 24 : q === 2 ? c[2] - 24 : nr + ((rb * 5) % 2 ? 1 : -1); voice(L, 'fbass', n, t, spb * 3.6, bv, 0); }
        else if (B.bass.pat === 'octaves' && s % 2 === 0) voice(L, 'fbass', r + (s % 4 ? 12 : 0), t, spb * .9, bv * (s % 4 ? .7 : 1), 0); } }
    L.route = null;
    // the theme, on the lead instrument
    if (m.lead && (m0.form || (bar % 16) >= m.lead.from)) { const b8 = (rb % 8) * 4 + beat, ev = m.ev || THEME_EV; ev.forEach((e) => { if (e.b >= b8 - 1e-4 && e.b < b8 + .25 - 1e-4 && (!m.lead.sparse || e.l >= 2 || ((bar * 7 + Math.round(e.b * 12) * 13) % 3) > 0)) { const nx = ev[ev.indexOf(e) + 1], room = nx && nx.b > e.b ? nx.b - e.b : e.l, nd = spb * 4 * Math.min(e.l, room) * (e.l < .5 ? .88 : .94), tn = tStraight + (e.b - b8) * 4 * spb; /* the melody is one voice: it plays straight (triplets and dotted notes as written, not swung), each note ends before the next one starts */
          if (L.lastLead && L.lastLead.end > tn) { try { const lg = L.lastLead.g.gain; lg.cancelScheduledValues(tn); lg.setTargetAtTime(.0001, tn - .004, .012); } catch (er) {} } /* cut the last note's tail as the next one speaks, so nothing smears */
          L.route = 'lead'; L.lastLead = voice(L, m.lead.voice, noteOf(m, e.d, m.lead.oct) + (e.acc || 0), tn, nd, m.lead.v, .05); L.route = 'band'; if (m.counter) { const ln = noteOf(m, e.d, m.counter.oct || 0) + (e.acc || 0); let best = -1; for (const c0 of ch) for (let o = -24; o <= 12; o += 12) { const c1 = c0 + o; if (c1 <= ln - 3 && c1 > best) best = c1; } if (best < 0) best = ln - 4; voice(L, m.counter.voice, best, tn, nd, m.counter.v * .85, -.3); } /* the harmony line always lands on a chord tone */ L.route = null; if (L.bandBus) { const gb = L.bandBus.gain; gb.setTargetAtTime(BANDX * DUCK, tn, .025); gb.setTargetAtTime(BANDX, tn + Math.max(.08, nd * .85), .18); } } }); }
    // drums, with a fill on the last bar of every eight
    if (m.drums) { const pat = DRUMS[m.drums.pat], hit = m.drums.pat === 'final' && bar % 32 !== 28 ? '' : pat[s], dv = m.drums.v * (m.swell ? (bar % 32 + 1) / 4 : 1), swing = (m.drums.pat === 'brush' || m.drums.pat === 'shuffle') && s % 2 ? spb * .28 : 0;
      if (bar % 8 === 7 && s >= 12 && (m.drums.pat === 'drive' || m.drums.pat === 'pop' || m.drums.pat === 'pulse' || m.drums.pat === 'march' || m.drums.pat === 'half')) drum(L, s % 2 ? 'snare' : 'tom', t, dv * .8);
      else if (hit) for (const ch1 of hit) drum(L, { k: 'kick', s: 'snare', b: 'brush', h: 'hat', o: 'open', x: 'shaker', r: 'rim', g: 'ghost', d: 'ride', c: 'conga', p: 'clap', T: 'timp' }[ch1], t + swing, dv * (s % 4 === 0 ? 1 : .8) * (ch1 === 'h' && s % 2 ? .7 : 1)); }
  }
  function layer(id, at) {
    const a = ctx(), m = MOODS[id], bus = a.createGain(), start = at || a.currentTime + .08; bus.gain.setValueAtTime(0, a.currentTime); bus.gain.setValueAtTime(0, start); bus.gain.linearRampToValueAtTime(1, start + 1.6); bus.connect(master);
    // the mix: the melody sits on top. Its lane gets a little presence around 3 kHz; the band's lane is carved out of that
    // same range and dips under each melody note (a gentle duck), so the tune always reads over Rhodes, wah and horns
    const lead = a.createGain(), pres = a.createBiquadFilter(), band = a.createGain(), carve = a.createBiquadFilter();
    pres.type = 'peaking'; pres.frequency.value = 2800; pres.Q.value = .8; pres.gain.value = 3.5; lead.gain.value = LEADX; lead.connect(pres); pres.connect(bus);
    carve.type = 'peaking'; carve.frequency.value = 2400; carve.Q.value = .9; carve.gain.value = -4; band.gain.value = BANDX; band.connect(carve); carve.connect(bus);
    return { id, m, bus, leadBus: lead, bandBus: band, step: 0, nextT: start, alive: true };
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
      // every signal is a piece of the Port Meridian hook (A, up to D, the C-D-C turn, A, then G-A E D), so players learn one tune and hear it everywhere
      const seq = { accept: [[69, 0], [74, .12], [72, .2]], done: [[69, 0], [74, .12], [72, .2], [69, .3], [64, .46], [65, .6], [62, .7], [74, .7]], promo: [[69, 0], [74, .16], [72, .26], [69, .38], [76, .56], [74, .7], [62, .9], [69, .9], [77, .9]], fail: [[64, 0], [62, .26]], p1: [[74, 0], [74, .1], [72, .2], [74, .3], [69, .48]], grade: [[69, 0], [74, .1], [72, .18], [69, .26], [76, .4]], gradeS: [[69, 0], [72, .1], [69, .2], [74, .32], [78, .46], [81, .46]], card: [[50, 0], [57, 0], [62, .3], [69, .3], [72, .6], [76, .6]], set: [[69, 0], [72, .08], [74, .16], [81, .26]] }[kind] || [];
      seq.forEach(([n, d]) => { voice(L, kind === 'fail' ? 'mute' : 'horns', n, t + d, kind === 'promo' ? 1.4 : .7, .04, 0); voice(L, 'rhodes', n, t + d, .9, .03, 0); });
    },
    stop() { if (!on) return; on = false; const a = ctx(), g0 = master; try { g0.gain.cancelScheduledValues(a.currentTime); g0.gain.setValueAtTime(g0.gain.value, a.currentTime); g0.gain.linearRampToValueAtTime(0, a.currentTime + 1.2); } catch (e) {} setTimeout(() => { clearInterval(timer); try { g0.disconnect(); } catch (e) {} }, 1300); layers = []; cur = null; }
  };
  return api;
}
