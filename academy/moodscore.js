// The mood library (owner's call, 2026-11-27): twelve original cues the cutscenes choose from, so the music always fits
// the scene. Each is its own piece, about 24 seconds, and opens on a gesture that lands in the first second (a call
// beat may only last three); a longer scene hears it develop. The Port Meridian motif is snuck into two of them
// (triumph, in the brass; hope, a last echo on the piano). Mixed by the pyramid of sound like all the music (music.js).
// Rendered to music/mood_<name>.mp3 by tools/render-cue.js mood_<name>.
export const MOOD_LEN = 26;
const MOTIF = [[69, 1.5], [74, .5], [72, 1 / 3], [74, 1 / 3], [72, 1 / 3], [69, 1], [67, .75], [69, .25], [64, 1], [62, 2]];

export function moodScore(name) {
  const E = [], n = (k, m, t, d, v, p) => E.push({ k, m, t, d, v, p: p || 0 }), dr = (k, t, v) => E.push({ k, t, v });
  const line = (k, notes, t0, beat, v, oct, p) => { let t = t0; for (const [m, d] of notes) { if (m !== 'r') n(k, m + (oct || 0), t, d * beat * .97, v, p); t += d * beat; } return t; };
  const chord = (k, ms, t, d, v, p) => ms.forEach((m, i) => n(k, m, t, d, v, (p || 0) + (i - (ms.length - 1) / 2) * .16));
  const roll = (k, t0, t1, v0, v1, rate) => { for (let t = t0; t < t1; t += rate) dr(k, t, v0 + (v1 - v0) * (t - t0) / (t1 - t0)); };
  const R = MOOD[name]; if (!R) return E; R({ n, dr, line, chord, roll }); return E;
}

const MOOD = {
  // a semitone that won't settle, a pulse underneath, a high string holding its breath
  tension: ({ n, dr, line, chord, roll }) => { const b = 60 / 84;
    dr('taiko', 0, .8); n('strings', 86, 0, 24, .012); n('drone', 38, 0, 25, .03);
    for (let i = 0; i < 64; i++) { const t = i * b / 2; n('stac', i % 8 === 7 ? 51 : 50, t, b / 2 * .8, .03 + i * .0003, i % 2 ? .2 : -.2); if (i % 4 === 0) dr('taiko', t, .45 + (i / 64) * .35); }
    line('strings', [[69, 3], [70, 1], [69, 4], [72, 3], [70, 1], [69, 4], [74, 2], [72, 2], [70, 2], [69, 2]], 2 * b, b, .03, 0);
    chord('choir', [62, 65, 69], 16 * b, 8 * b, .02); roll('snare', 22 * b, 26 * b, .2, .7, b / 4); n('brass', 38, 26 * b, 4 * b, .05); dr('impact', 26 * b, .7); },
  // piano alone, then strings; a line that keeps reaching and falling short
  heartbreak: ({ n, line, chord }) => { const b = 1;
    n('piano', 47, 0, 4, .05); n('piano', 54, .5, 3.5, .04); line('piano', [[71, 2], [69, 1], [67, 1], [66, 3], [64, 1], [62, 2], [64, 1], [66, 1], [64, 4]], 0, b, .055);
    n('bass', 35, 0, 4, .05); // a low floor under the grief (the pyramid)
    [[43, 50, 55, 59], [40, 47, 52, 55], [38, 45, 50, 54], [42, 49, 54, 57]].forEach((c, i) => { n('piano', c[0], 4 + i * 4, 3.8, .045); n('bass', c[0] - 12, 4 + i * 4, 3.9, .055); chord('strings', c.slice(1).map((m) => m + 12), 4 + i * 4, 3.9, .02); });
    line('strings', [[78, 2], [76, 1], [74, 1], [73, 3], [71, 1], [69, 2], [71, 1], [73, 1], [71, 4]], 8, b, .042, 0); n('choir', 71, 16, 8, .02); n('bell', 83, 20, 4, .012); },
  // a timpani roll into a brass fanfare; the Port Meridian hook comes in the horns at the top
  triumph: ({ n, dr, line, chord, roll }) => { const b = 60 / 100;
    roll('timp', 0, .9, .3, 1, .06); dr('impact', .9, .8); dr('crash', .9, .9);
    [[50, 54, 57, 62], [55, 59, 62, 67], [57, 61, 64, 69], [50, 54, 57, 62]].forEach((c, i) => { const t = .9 + i * 4 * b; chord('brass', c, t, 4 * b * .95, .03); chord('strings', c.map((m) => m + 12), t, 4 * b * .95, .022); n('bass', c[0] - 12, t, 4 * b * .9, .07); dr('timp', t, .9); dr('taiko', t + 2 * b, .6); });
    line('brass', [[62, .5], [66, .5], [69, 1], [74, 2], [73, 1], [71, 1], [69, 2], [66, 1], [69, 1], [74, 4]], .9, b, .05, 0);
    line('brass', MOTIF, .9 + 16 * b, b, .055, 0); line('strings', MOTIF, .9 + 16 * b, b, .04, 12);
    [[50, 54, 57, 62], [46, 50, 53, 58], [48, 52, 55, 60], [50, 54, 57, 62]].forEach((c, i) => { const t = .9 + 16 * b + i * 2 * b; chord('choir', c.map((m) => m + 12), t, i === 3 ? 6 : 2 * b, .028); n('bass', c[0] - 12, t, i === 3 ? 6 : 2 * b, .07); dr('timp', t, .8); });
    dr('crash', .9 + 22 * b, .9); },
  // plucked notes that circle a tritone, a bell, a flute line that asks a question
  mystery: ({ n, dr, line }) => { const b = 60 / 70;
    n('bell', 76, 0, 3, .025); n('drone', 40, 0, 25, .03); n('pad', 64, 0, 25, .012);
    const arp = [52, 55, 59, 58, 52, 55, 61, 58]; for (let i = 0; i < 48; i++) n('stac', arp[i % 8], i * b / 2, b / 2 * .6, .026, ((i % 4) - 1.5) * .25);
    line('flute', [[76, 2], [74, 1], [70, 1], [71, 4], [79, 2], [78, 1], [76, 1], [75, 4]], 4 * b, b, .032, 12);
    n('bell', 82, 12 * b, 4, .016); n('bell', 81, 18 * b, 4, .014); [0, 8, 16].forEach((x) => dr('timp', x * b, .3)); },
  // a braam and a sixteenth-note drive; brass stabs on the off-beats
  danger: ({ n, dr, roll }) => { const b = 60 / 120;
    dr('impact', 0, 1); [36, 43, 48].forEach((m) => n('brass', m, 0, 2.2 * b, .07)); dr('taiko', 0, 1);
    for (let i = 0; i < 160; i++) { const t = 1 + i * b / 4; n('stac', [48, 48, 55, 48, 51, 48, 55, 50][i % 8], t, b / 4 * .8, .03 + (i / 160) * .012, i % 2 ? .2 : -.2); if (i % 4 === 0) { dr('taiko', t, i % 16 === 0 ? .9 : .55); n('bass', 36, t, b * .8, .06); } if (i % 8 === 4) dr('snare', t, .7); if (i % 16 === 6) [60, 63, 67].forEach((m) => n('brass', m, t, b * .45, .035)); }
    roll('snare', 1 + 36 * b, 1 + 40 * b, .3, 1, b / 8); dr('impact', 1 + 40 * b, .9); [36, 43, 48].forEach((m) => n('brass', m, 1 + 40 * b, 3 * b, .07)); },
  // a bassoon-ish bass that tiptoes, pizzicato, a melody that trips over itself
  humor: ({ n, dr, line }) => { const b = 60 / 112;
    const bass = [41, 48, 45, 48, 43, 50, 46, 48]; for (let i = 0; i < 40; i++) { const t = i * b; n('bass', bass[i % 8], t, b * .35, .07); n('stac', bass[i % 8] + 24, t + b / 2, b * .25, .022); if (i % 2) dr('rim', t, .6); if (i % 4 === 2) dr('shaker', t + b / 2, .5); }
    line('flute', [[77, .5], [76, .5], [77, .5], [81, 1.5], ['r', .5], [79, .5], [77, .5], [74, .5], [76, 2], ['r', 1], [72, .5], [74, .5], [76, .5], [77, .5], [79, .5], [81, 1], [84, 1], [81, .5], [77, 2.5]], 4 * b, b, .03, 0);
    line('piano', [[72, .5], [76, .5], [79, 1]], 20 * b, b, .03, 0); n('bell', 89, 22 * b, 1, .02); },
  // a pad opening like a sky getting light, piano arpeggios, a flute over the top
  dawn: ({ n, line, chord }) => { const b = 60 / 72;
    chord('pad', [55, 62, 67, 71], 0, 24, .02); n('bass', 43, 0, 8, .05);
    const arps = [[55, 62, 67, 71, 74, 71, 67, 62], [52, 59, 64, 67, 71, 67, 64, 59], [48, 55, 60, 64, 69, 64, 60, 55], [50, 57, 62, 66, 69, 66, 62, 57]];
    arps.forEach((a, k) => a.forEach((m, i) => n('piano', m, 1 + k * 4 * b + i * b / 2, b * 1.4, .028 + (i === 0 ? .01 : 0))));
    line('flute', [[79, 2], [81, 1], [83, 1], [86, 3], [84, 1], [83, 2], [81, 2], [79, 4]], 4 * b, b, .03, 0);
    chord('strings', [62, 67, 71, 74], 16 * b, 10 * b, .022); n('bass', 43, 16 * b, 10 * b, .05); n('bell', 91, 20 * b, 4, .012); },
  // low strings and a hummed choir after the noise; one distant bell
  aftermath: ({ n, dr, line, chord }) => { const b = 60 / 64;
    n('drone', 38, 0, 25, .034); chord('strings', [50, 53, 57], 0, 8 * b, .024); chord('choir', [62, 65, 69], 2 * b, 10 * b, .022);
    n('bell', 81, 1, 5, .018); dr('timp', 0, .35);
    chord('strings', [46, 50, 53], 8 * b, 8 * b, .024); chord('strings', [43, 48, 52], 16 * b, 8 * b, .024); n('bass', 31, 16 * b, 8 * b, .05);
    line('piano', [[69, 2], ['r', 1], [65, 1], [64, 3], ['r', 1], [62, 4]], 6 * b, b, .04, 0); n('bell', 81, 18 * b, 5, .012); },
  // driving eighths, siren-like strings swapping two notes, kick and snare, brass hits
  pursuit: ({ n, dr }) => { const b = 60 / 132;
    dr('impact', 0, .8); dr('crash', 0, .8);
    for (let i = 0; i < 104; i++) { const t = i * b / 2; n('bass', [45, 45, 57, 45, 43, 43, 55, 43][i % 8], t, b * .4, .07); if (i % 2 === 0) dr('kick', t, i % 8 === 0 ? 1 : .7); if (i % 4 === 2) dr('snare', t, .8); dr('hat', t, .4);
      if (i % 4 === 0) n('strings', i % 8 === 0 ? 81 : 77, t, b * 1.9, .03); if (i % 16 === 7) [57, 60, 64].forEach((m) => n('brass', m, t, b * .45, .04)); }
    dr('crash', 16 * 2 * b, .8); dr('impact', 48 * b, .7); },
  // strings that climb, a piano that answers; the Port Meridian hook as a last echo on the piano
  hope: ({ n, line, chord }) => { const b = 60 / 80;
    [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]].forEach((c, i) => { chord('strings', c, i * 4 * b, 4 * b * .97, .022); n('bass', c[0] - 12, i * 4 * b, 4 * b * .95, .055); });
    line('strings', [[72, 2], [74, 1], [76, 1], [79, 3], [77, 1], [76, 2], [74, 2], [72, 4]], 0, b, .04, 12);
    line('piano', [[64, 1], [67, 1], [72, 2], [71, 1], [69, 1], [67, 2]], 8 * b, b, .035, 0);
    chord('choir', [60, 64, 67, 72], 16 * b, 8 * b, .022); line('piano', MOTIF, 16 * b, b * 1.15, .035, 0); },
  // nothing quite in key: a whole-tone flute, bells far apart, a low drone that won't move
  eerie: ({ n, dr, line }) => { const b = 60 / 50;
    n('drone', 37, 0, 25, .034); n('pad', 61, 0, 25, .01); n('bell', 85, 0, 6, .02); n('bell', 79, 5, 6, .016); n('bell', 88, 11, 6, .014); n('bell', 82, 17, 6, .014);
    line('flute', [[74, 3], [76, 1], [78, 4], [80, 2], [78, 2], [72, 4]], 2 * b, b, .028, 0); dr('timp', 8 * b, .3); dr('timp', 16 * b, .25);
    for (let i = 0; i < 16; i++) n('stac', [49, 55][i % 2], 12 * b + i * b / 2, b * .3, .016); },
  // warm horns and strings that close the book: a full cadence and a held chord
  resolve: ({ n, dr, line, chord }) => { const b = 60 / 90;
    dr('timp', 0, .7); [[46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61], [50, 57, 62, 66]].forEach((c, i) => { const t = i * 4 * b; chord('strings', c, t, 4 * b * .97, .024); chord('brass', c, t, 4 * b * .9, .022); n('bass', c[0] - 12, t, 4 * b * .9, .06); if (i) dr('timp', t, .5); });
    line('brass', [[74, 2], [72, 1], [70, 1], [72, 3], [69, 1], [69, 2], [73, 2], [74, 4]], 0, b, .042, 0);
    chord('choir', [62, 66, 69, 74], 16 * b, 8 * b, .028); chord('strings', [50, 57, 62, 66], 16 * b, 8 * b, .024); n('bass', 38, 16 * b, 8 * b, .06); dr('crash', 16 * b, .6); n('bell', 86, 16 * b + .5, 4, .014); }
};
