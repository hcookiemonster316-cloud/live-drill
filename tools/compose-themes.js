// Writes academy/scoreorig.js: an original melody for every composed track (owner's call, 2026-11-27: every song is its
// own, and the Port Meridian motif is snuck in here and there). Run once; the result is fixed data, reviewed and
// rendered like the rest of the score. Usage: node tools/compose-themes.js
//
// How a tune is built, the way a songwriter would: a two-bar motif (a rhythm cell and a contour) suited to the track's
// tempo; the motif answered a step higher; a climb to the high point; a cadence home. Strong beats land on the notes of
// that bar's chord, so the tune sits on the track's own progression. The bridge is new material that ends open, on the
// fifth. The main title keeps the main theme; about a quarter of the tracks quote the hook in the intro, and about one
// in five slips its opening gesture into the bridge. Everything else is new.
const fs = require('fs'), path = require('path');
const HOOK = '4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1'; // the Port Meridian hook's opening gesture (four beats)
const CELLS = {
  calm: [[2, 1, 1], [3, 1], [1.5, .5, 2], [1, 1, 2], [2, 2], [1, 2, 1], [1.5, .5, 1, 1]],
  mid: [[1, 1, 1, 1], [1.5, .5, 1, 1], [.5, .5, 1, 2], [1, .5, .5, 2], [2, 1, 1], [1, 1, 2], [.75, .25, 1, 2]],
  busy: [[.5, .5, .5, .5, 1, 1], [.5, .5, 1, .5, .5, 1], [.75, .25, .5, .5, 2], [1, .5, .5, 1, 1], [.5, 1, .5, 2], [.5, .5, 1, 2]]
};
function rng(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const fmt = (n) => { const r = Math.round(n * 12) / 12; const f = [[1, 1], [.5, '1/2'], [.25, '1/4'], [.75, '3/4'], [1.5, '3/2'], [1 / 3, '1/3'], [2 / 3, '2/3']].find(([v]) => Math.abs(v - r) < 1e-6); return f && typeof f[1] === 'string' ? f[1] : String(+r.toFixed(3)); };
const str = (notes) => notes.map(([d, l]) => (d === 'r' ? 'r' : d) + ':' + fmt(l)).join(' ');
const beats = (notes) => notes.reduce((a, n) => a + n[1], 0);

function compose(id, t) {
  const R = rng(id + '/orig'), pick = (a) => a[Math.floor(R() * a.length)];
  const feel = t.bpm >= 112 ? 'busy' : t.bpm >= 86 ? 'mid' : 'calm', cells = CELLS[feel];
  const prog = (t.prog && t.prog.length ? t.prog : [0, 5, 3, 4, 0, 5, 3, 4]), progB = (t.progB && t.progB.length ? t.progB : prog);
  const tones = (deg) => [0, 2, 4].map((k) => deg + k); // chord tones as scale degrees (any octave)
  const near = (target, set, lo, hi) => { let best = null, bd = 1e9; for (const base of set) for (const o of [-7, 0, 7, 14]) { const v = base + o; if (v < lo || v > hi) continue; const d = Math.abs(v - target); if (d < bd) { bd = d; best = v; } } return best != null ? best : target; };
  // one bar: a rhythm cell, pitched toward a target, chord tones on the strong beats, steps in between
  function bar(cell, chord, from, target, lo, hi) { const out = []; let b = 0, cur = from;
    for (const l of cell) { const strong = Math.abs(b - Math.round(b)) < 1e-6 && Math.round(b) % 2 === 0; let v;
      if (strong) v = near(cur + Math.sign(target - cur) * (1 + Math.floor(R() * 2)), tones(chord), lo, hi);
      else { const step = target === cur ? pick([-1, 1]) : Math.sign(target - cur); v = Math.max(lo, Math.min(hi, cur + step * (R() < .2 ? 2 : 1))); }
      out.push([v, l]); cur = v; b += l; }
    return out; }
  const lo = -2, hi = 9, c1 = pick(cells), c2 = pick(cells), c3 = pick(cells), c4 = pick(cells);
  // the theme: motif, motif a step up, a climb, a cadence home
  const start = pick([0, 2, 4]), lift = pick([1, 2]);
  const m1 = bar(c1, prog[0], start, start + 2, lo, hi), m2 = bar(c2, prog[1], m1[m1.length - 1][0], start - 1, lo, hi);
  const s1 = m1.map(([d, l], i) => [i === 0 ? near(d + lift, tones(prog[2]), lo, hi) : Math.min(hi, d + lift), l]);
  const s2 = bar(c2, prog[3], s1[s1.length - 1][0], 4, lo, hi); s2[s2.length - 1] = [near(4, tones(prog[3]), lo, hi), s2[s2.length - 1][1]]; // a half cadence
  const peak = pick([7, 8, 9]), u1 = bar(c3, prog[4], s2[s2.length - 1][0], peak, lo, hi), u2 = bar(c4, prog[5], u1[u1.length - 1][0], peak, lo, hi);
  const cad1 = bar(pick(cells.filter((c) => c.length <= 4)), prog[6], u2[u2.length - 1][0], 2, lo, hi), cad2 = [[near(1, tones(prog[7]), lo, 4), 1], [near(2, tones(prog[7]), lo, 4) === 2 ? 1 : 2, 1], [0, 2]];
  const theme = [...m1, ...m2, ...s1, ...s2, ...u1, ...u2, ...cad1, ...cad2];
  // the bridge: new cells, rising through the first half, open on the fifth at the end
  const b1 = pick(cells), b2 = pick(cells), b3 = pick(cells), b0 = pick([3, 5]);
  let B = [], cur = b0; [[b1, 0, b0 + 1], [b2, 1, b0 + 3], [b1, 2, b0 + 4], [b3, 3, b0 + 2], [b2, 4, 7], [b3, 5, 6], [b1, 6, 5]].forEach(([c, k, tg]) => { const x = bar(c, progB[k], cur, tg, lo, hi); B.push(...x); cur = x[x.length - 1][0]; });
  const sneakB = R() < .2, sneakIn = R() < .25;
  const Bstr = sneakB ? str(B.slice(0, B.length - 0).filter((_, i, a) => beats(a.slice(0, i + 1)) <= 24)) + ' ' + HOOK + ' 3:1 2:1 4:2' : str([...B, [near(4, tones(progB[7]), lo, hi), 2], [4, 2]]);
  const head = [...m1, ...m2];
  const out = { theme: str(theme), themeB: Bstr, themeA1: str(head) + ' r:8 ' + str([...s1, ...s2]) + ' r:8' };
  out.introTheme = sneakIn ? 'r:16 ' + HOOK + ' r:4 ' + HOOK + ' 1:4' : 'r:16 ' + str(head) + ' ' + str(m1.map(([d, l]) => [d, l])) + ' 0:4';
  out.outroTheme = str(m1.map(([d, l]) => [d, l * 2])) + ' 0:8 r:16';
  for (const k of ['theme', 'themeB', 'themeA1']) { const n = out[k].split(' ').reduce((a, tok) => { const l = tok.split(':')[1], fr = l.split('/'); return a + (fr.length > 1 ? +fr[0] / +fr[1] : +l); }, 0); if (Math.abs(n - 32) > 1e-6) throw new Error(id + '.' + k + ' is ' + n + ' beats'); }
  out._sneak = (sneakIn ? 'intro ' : '') + (sneakB ? 'bridge' : '');
  return out;
}

(async () => {
  const { TRACKS } = await import(path.join(__dirname, '../academy/scoredata.js'));
  const ORIG = {}, notes = [];
  for (const id of Object.keys(TRACKS)) { if (id === 'title_1') continue; // the main title is the main theme
    const o = compose(id, TRACKS[id]); notes.push(id + (o._sneak ? '  (hook: ' + o._sneak.trim() + ')' : '')); delete o._sneak; ORIG[id] = o; }
  const body = '// Original melodies for every composed track but the main title, written by tools/compose-themes.js (owner\'s call,\n// 2026-11-27: every song its own, the Port Meridian motif snuck in here and there). Fixed data: edit by hand or re-run.\nexport const ORIG = ' +
    JSON.stringify(ORIG, null, 0).replace(/\},"/g, '},\n  "').replace(/^\{"/, '{\n  "').replace(/\}\}$/, '}\n}') + ';\n';
  fs.writeFileSync(path.join(__dirname, '../academy/scoreorig.js'), body);
  console.log(Object.keys(ORIG).length + ' tracks'); console.log(notes.filter((n) => /hook/.test(n)).join('\n'));
})();
