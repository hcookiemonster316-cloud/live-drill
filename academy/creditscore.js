// "Last Watch": the credits (owner's call, 2026-11-27: its own score, somber enough to make people cry, mostly original,
// ending on the main motif). 60 bpm, D minor, bare. Rendered once to music/credits_cue.mp3 by tools/render-cue.js.
//
//   0-16 s    solo piano: a sighing line that keeps falling back, over open fifths in the left hand
//   16-32 s   the strings slip in underneath; a cello answers each phrase; the line climbs, then sinks again
//   32-48 s   the peak, still quiet: strings take the melody over a choir, the piano breaks the chords beneath
//   48-52 s   it falls away to the piano alone, and a beat of silence
//   52-70 s   the Port Meridian motif, alone on the piano, slowing; on its last note the strings come in on a D major
//             chord (the only major chord in the piece) and it rings out
export const CREDIT_LEN = 72;
const BEAT = 1;
const CH = { Dm: [50, 57, 62, 65], Bb: [46, 53, 58, 62], Gm: [43, 50, 55, 58], A: [45, 52, 57, 61], Asus: [45, 52, 57, 62], F: [41, 53, 57, 60], C: [48, 55, 60, 64], D: [50, 57, 62, 66] };
// the melody: falling sighs (A-G-F, F-E-D), each phrase reaching a little higher before it gives way
const LINE1 = [[69, 2], [67, 1], [65, 1], [65, 2], [64, 1], [62, 1], [62, 1.5], [64, .5], [65, 1], [67, 1], [64, 3], ['r', 1]];
const LINE2 = [[74, 2], [72, 1], [69, 1], [72, 2], [70, 1], [69, 1], [67, 1.5], [69, .5], [70, 1], [67, 1], [69, 4]];
const LINE3 = [[77, 2], [76, 1], [74, 1], [72, 2], [69, 2], [70, 1.5], [69, .5], [67, 1], [65, 1], [64, 2], [69, 1], [73, 1]];
const MOTIF = [[69, 1.5], [74, .5], [72, 1 / 3], [74, 1 / 3], [72, 1 / 3], [69, 1], [67, .75], [69, .25], [64, 1], [62, 2]];

export function creditScore() {
  const E = [], n = (k, m, t, d, v, p) => E.push({ k, m, t, d, v, p: p || 0 }), dr = (k, t, v) => E.push({ k, t, v });
  const line = (k, notes, t0, v, oct, stretch) => { let t = t0; for (const [m, d] of notes) { const len = d * BEAT * (stretch ? stretch(t - t0) : 1); if (m !== 'r') n(k, m + (oct || 0), t, len * .98, v); t += len; } return t; };
  const lh = (t, c, v) => { const [a, b] = CH[c]; n('piano', a - 12, t, 3.6, v); n('piano', b - 12, t + .5, 3.1, v * .8); }; // open fifths, low
  const arp = (t, c, v) => { CH[c].forEach((m, i) => n('piano', m, t + i * .5, 1.8, v * (i ? .75 : 1))); CH[c].slice(1).reverse().forEach((m, i) => n('piano', m + 12, t + 2 + i * .5, 1.6, v * .6)); };
  // 0-16: solo piano
  ['Dm', 'Bb', 'Gm', 'Asus'].forEach((c, i) => lh(i * 4, c, .05)); line('piano', LINE1, 0, .055);
  // 16-32: strings underneath, the cello answers
  ['Dm', 'F', 'Bb', 'C'].forEach((c, i) => { const t = 16 + i * 4; lh(t, c, .046); CH[c].forEach((m) => n('strings', m, t, 3.9, .018)); n('strings', CH[c][0] - 12, t + 2, 2.2, .03); });
  line('piano', LINE2, 16, .056);
  // 32-48: the peak, still quiet; the strings take the melody over the choir
  ['Bb', 'F', 'Gm', 'A'].forEach((c, i) => { const t = 32 + i * 4; arp(t, c, .03); CH[c].forEach((m) => { n('strings', m, t, 3.95, .022); n('choir', m + 12, t, 3.95, .016); }); n('bass', CH[c][0] - 12, t, 3.8, .04); });
  line('strings', LINE3, 32, .05); line('piano', LINE3, 32, .022, 12);
  dr('timp', 32, .35); dr('timp', 44, .3);
  // 48-52: the piano alone, then a beat of silence
  lh(48, 'Dm', .042); line('piano', [[69, 1], [67, 1], [65, 1]], 48, .046);
  // 52-70: the motif, alone, slowing (each beat a little longer than the last); the strings arrive on D major
  const slow = (dt) => 1 + dt * .045; const end = line('piano', MOTIF, 52, .06, 0, slow); line('piano', MOTIF.map(([m, d]) => [m - 12, d]), 52, .026, 0, slow);
  n('piano', 38, 52, 4, .045); n('piano', 45, 56, 4, .04);
  const T = end - 2.6; // the motif's last note
  CH.D.forEach((m, i) => { n('strings', m, T, 70 - T, .03, (i - 1.5) * .2); n('choir', m + 12, T + .6, 69 - T, .014); }); n('bass', 38, T, 70 - T, .035); n('piano', 74, T, 6, .03); n('bell', 86, T + 1, 5, .012);
  return E;
}
