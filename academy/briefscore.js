// "Hold the Line": the briefing's own cue (owner's call, 2026-11-27: its own theme, far more epic, and the Port
// Meridian motif played big at the title reveal). Scored to picture at 72 bpm, two bars per shot, so every cut lands
// on a downbeat (brief.js uses the same clock). Rendered once to music/brief_cue.mp3 by tools/render-cue.js.
//
//   bar 0       lights stutter on         sub drone, a string swell, one timpani hit when the lights catch
//   bars 1-2    "Eyes up. Phones down."   a staccato string ostinato starts over the drone; taiko on the one
//   bars 3-4    the city does the teaching low brass states the theme; the ostinato follows the chords
//   bars 5-6    the district map          sixteenths; strings take the theme, choir and brass chords enter
//   bars 7-8    the dispatch montage      everything drives: the answer phrase on full brass, taiko and toms, crash
//   bars 9-10   "Own it. Learn it."       still climbing: horns on the theme over the choir, taiko pulse, a heartbeat
//   bars 11-12  "On your feet."           a snare roll and a rising choir on the dominant, then half a beat of silence
//   bars 13-14  the title                 the biggest braam and impact, then the Port Meridian motif, broad
//   all along   heavy low end: a sub under the harmony, braams (low brass and an impact) on each section's downbeat
export const BPM = 72, BEAT = 60 / BPM, BAR = 4 * BEAT, CUTS = [0, 1, 3, 5, 7, 9, 11, 13, 15].map((b) => b * BAR);

const CH = { Dm: [50, 53, 57, 62], Bb: [46, 50, 53, 58], C: [48, 52, 55, 60], F: [53, 57, 60, 65], Gm: [43, 50, 55, 58], A: [45, 52, 57, 61], D: [50, 54, 57, 62] };
const ROOT = { Dm: 38, Bb: 34, C: 36, F: 41, Gm: 43, A: 45, D: 38 };
// the theme: a rising call (A up to D, held) and a falling answer that comes home to D
const CALL = [[69, 1.5], [74, .5], [74, 1], [72, 1], [69, 2], [65, 1], [67, 1]];
const ANSWER = [[69, 1.5], [70, .5], [69, 1], [67, 1], [65, 1], [64, 1], [62, 2]];
// the Port Meridian hook, the one quote of the main theme in the cue
const MOTIF = [[69, 1.5], [74, .5], [72, 1 / 3], [74, 1 / 3], [72, 1 / 3], [69, 1], [67, .75], [69, .25], [64, 1], [62, 2]];

export function briefScore() {
  const E = [], at = (bar, beat) => (bar * 4 + (beat || 0)) * BEAT;
  const n = (k, m, t, d, v, p) => E.push({ k, m, t, d, v, p: p || 0 }), dr = (k, t, v) => E.push({ k, t, v });
  const line = (k, notes, bar, oct, v, p) => { let b = 0; for (const [m, d] of notes) { n(k, m + (oct || 0), at(bar, b), d * BEAT * .98, v, p); b += d; } };
  const chord = (k, name, t, d, v, oct, p) => CH[name].forEach((m, i) => n(k, m + (oct || 0), t, d, v, (p || 0) + (i - 1.5) * .18));
  const osti = (bar, name, sub, v0, v1, oct) => { const r = CH[name][0], pat = [0, 0, 7, 0, 12, 0, 7, 0], steps = sub * 4; for (let i = 0; i < steps; i++) { const v = v0 + (v1 - v0) * i / steps; n('stac', r + pat[i % 8] + (oct || 0), at(bar, i / sub), BEAT / sub * .8, v, i % 2 ? .25 : -.25); } };
  const bass = (bar, name, beats, v) => n('bass', ROOT[name], at(bar), beats * BEAT * .95, v);
  const roll = (t0, t1, k, v0, v1, rate) => { for (let t = t0; t < t1; t += rate) dr(k, t, v0 + (v1 - v0) * (t - t0) / (t1 - t0)); };
  const BREATH = at(13) - BEAT * .5; // everything stops half a beat before the title, so the hit lands in silence

  // bar 0: the lights
  n('drone', 26, 0, BREATH - .2, .034); n('drone', 38, .3, BREATH - .5, .022);
  n('strings', 50, .4, 2.6, .016, -.3); n('strings', 57, .6, 2.4, .014, .3);
  dr('timp', 2.2, .9); dr('taiko', 2.2, .55); n('bell', 86, 2.2, 2, .016);
  // bars 1-2: Castillo; the ostinato
  for (const b of [1, 2]) { osti(b, 'Dm', 2, b === 1 ? .022 : .03, b === 1 ? .03 : .036, 0); bass(b, 'Dm', 4, .065); dr('taiko', at(b), .55); if (b === 2) dr('taiko', at(b, 2), .38); }
  chord('strings', 'Dm', at(1), 2 * BAR, .014); n('pad', 62, at(1), 2 * BAR, .012); n('pad', 69, at(1), 2 * BAR, .01);
  // bars 3-4: the theme in low brass
  [['Bb', 3], ['C', 4]].forEach(([c, b]) => { osti(b, c, 2, .034, .038, 0); bass(b, c, 4, .075); chord('strings', c, at(b), BAR, .02); dr('taiko', at(b), .62); dr('taiko', at(b, 2), .48); dr('tom', at(b, 3.5), .5); });
  line('brass', CALL, 3, -12, .04, -.1); roll(at(4, 3), at(5), 'timp', .3, .9, BEAT / 8);
  // bars 5-6: the map; sixteenths, strings carry the theme
  [['Dm', 5], ['Bb', 6]].forEach(([c, b]) => { osti(b, c, 4, .028, .034, 0); osti(b, c, 4, .014, .018, 12); bass(b, c, 4, .075); chord('choir', c, at(b), BAR, .026, 12); n('brass', CH[c][0], at(b), BEAT, .036); n('brass', CH[c][1], at(b), BEAT, .03);
    [0, 1.5, 2, 3].forEach((x) => dr('taiko', at(b, x), x === 0 ? .78 : .55)); for (let i = 0; i < 16; i++) dr('ghost', at(b, i / 4), .9); });
  dr('crash', at(5), .8); line('strings', CALL, 5, 0, .044, .15); line('brass', CALL, 5, -12, .028, -.15);
  // bars 7-8: the montage; everything drives
  [['F', 7], ['C', 8]].forEach(([c, b]) => { osti(b, c, 4, .034, .04, 0); osti(b, c, 4, .02, .024, 12); for (let i = 0; i < 8; i++) n('bass', ROOT[c], at(b, i / 2), BEAT * .4, .07); chord('choir', c, at(b), BAR, .032, 12); chord('strings', c, at(b), BAR, .02);
    for (let i = 0; i < 8; i++) dr('taiko', at(b, i / 2), i % 2 ? .45 : .82); [1, 3].forEach((x) => dr('snare', at(b, x), .75)); [0, 2].forEach((x) => dr('kick', at(b, x), .85)); });
  dr('crash', at(7), 1); line('brass', ANSWER, 7, 0, .055, 0); line('strings', ANSWER, 7, 12, .04, .2);
  roll(at(8, 3), at(9) - .05, 'tom', .4, .9, BEAT / 4);
  // bars 9-10: own it; no letting up. The horns take the theme over the choir, the taiko keeps the pulse, a heartbeat on the timpani
  [['Bb', 9], ['Gm', 10]].forEach(([c, b]) => { osti(b, c, 4, .03, .036, 0); chord('strings', c, at(b), BAR, .03); chord('choir', c, at(b), BAR, .04, 12); n('bass', ROOT[c], at(b), BAR * .95, .07); n('bell', CH[c][3] + 24, at(b), 2, .014);
    for (let i = 0; i < 4; i++) dr('taiko', at(b, i), i % 2 ? .6 : .85); [0, 2].forEach((x) => { dr('timp', at(b, x), .8); dr('timp', at(b, x) + .3, .45); dr('kick', at(b, x), .8); }); });
  line('brass', CALL, 9, 0, .05, -.05); line('strings', CALL, 9, 12, .036, .2); dr('crash', at(9), .9);
  // bars 11-12: on your feet; the build on the dominant
  [['Bb', 11], ['A', 12]].forEach(([c, b]) => { const last = b === 12; for (let i = 0; i < 16; i++) { const t = at(b, i / 4); if (t >= BREATH) break; n('stac', CH[c][0] + [0, 7, 12, 7][i % 4], t, BEAT / 4 * .8, (last ? .036 : .026) + i * .0012, i % 2 ? .25 : -.25); n('stac', CH[c][0] + 12 + [0, 7, 12, 7][i % 4], t, BEAT / 4 * .8, (last ? .022 : .014) + i * .0008, i % 2 ? -.2 : .2); }
    chord('strings', c, at(b), (last ? BREATH - at(b) : BAR) - .05, last ? .03 : .024); chord('brass', c, at(b), (last ? BREATH - at(b) : BAR) - .05, last ? .036 : .028, -12); n('bass', ROOT[c], at(b), (last ? BREATH - at(b) : BAR) - .05, .07); });
  [74, 76, 77, 79, 81, 82, 84, 85].forEach((m, i) => { const t = at(11, i); if (t < BREATH - .1) n('choir', m - 12, t, Math.min(BEAT * 1.1, BREATH - t - .05), .03 + i * .004); });
  roll(at(11), at(12), 'snare', .15, .5, BEAT / 4); roll(at(12), BREATH - .02, 'snare', .5, 1, BEAT / 8); roll(at(12, 2), BREATH - .02, 'timp', .4, 1, BEAT / 8);
  // the low end: a sub an octave under the harmony from bar 3, and a braam (low brass blast and an impact) on every section's downbeat
  const PROG = { 3: 'Bb', 4: 'C', 5: 'Dm', 6: 'Bb', 7: 'F', 8: 'C', 9: 'Bb', 10: 'Gm', 11: 'Bb', 12: 'A' };
  for (let b = 3; b <= 12; b++) { const c = PROG[b], len = (b === 12 ? BREATH - at(b) : BAR) - .05; n('bass', ROOT[c] - 12, at(b), len, .05 + (b - 3) * .004); if (b >= 7) for (let i = 0; i < 8; i++) if (at(b, i / 2) < BREATH - .1) n('bass', ROOT[c] - 12, at(b, i / 2), BEAT * .42, .035 + (b - 7) * .004); }
  const braam = (t, c, v) => { [-12, -5, 0].forEach((o) => n('brass', ROOT[c] + o, t, BEAT * 2.2, v, 0)); dr('impact', t, .55 + v * 4); };
  [[5, 'Dm', .04], [7, 'F', .045], [9, 'Bb', .05], [11, 'Bb', .055], [12, 'A', .06]].forEach(([b, c, v]) => braam(at(b), c, v));
  // bars 13-14: the title; the Port Meridian motif, broad
  const T = at(13); braam(T, 'D', .075); n('bass', 26, T, 6 * BEAT, .09); n('bass', 26, T + 6 * BEAT, 6 * BEAT, .09); dr('impact', T, 1); dr('taiko', T, 1); dr('timp', T, 1); dr('crash', T, 1.2); dr('kick', T, 1);
  n('drone', 26, T, 9, .03); n('drone', 38, T, 9, .02);
  line('brass', MOTIF, 13, 0, .06, 0); line('brass', MOTIF, 13, -12, .045, -.1); line('strings', MOTIF, 13, 12, .045, .15); line('choir', MOTIF, 13, 0, .03, 0);
  [['D', 0, 2], ['Bb', 2, 2], ['C', 4, 2], ['D', 6, 6]].forEach(([c, b0, d]) => { const t = T + b0 * BEAT, len = d * BEAT * .97;
    chord('strings', c, t, len, .03); chord('choir', c, t, len, .036, 12); chord('brass', c, t, len, .032, -12); n('bass', ROOT[c], t, len, .08); n('bass', ROOT[c] - 12, t, len, .05);
    dr('timp', t, 1); dr('taiko', t, .9); });
  roll(T + 5 * BEAT, T + 6 * BEAT - .03, 'timp', .4, 1, BEAT / 8); dr('crash', T + 6 * BEAT, 1); dr('impact', T + 6 * BEAT, .75);
  n('bell', 86, T + 6 * BEAT, 4, .018); n('bell', 93, T + 6.5 * BEAT, 4, .012);
  for (const e of E) if (e.d) e.v *= 1.6; // the orchestra sits up with the drums, not under them
  // one long build: everything grows from the first light to the title, and the title is the biggest moment of all
  for (const e of E) e.v *= e.t >= T - .01 ? 1.15 : .55 + .45 * Math.pow(e.t / T, 1.15);
  return E;
}
export const CUE_LEN = 15 * BAR + 4; // the last chord rings past the title
