// Pixel-art signs (art guide: one look). Building signs used to be smooth text from a font, and in the building worker
// that font isn't loaded, so signs painted there fell back to a system font. Now every sign is drawn from this 5x7
// pixel alphabet, made here, onto a small plate with the deep-ink outline every sprite shares: light from the upper
// left (a lighter top row on the plate), a darker edge on the bottom and right, and letters with a one-pixel shadow.
// Each sign is drawn once and kept; the building painter only copies it.

// 5 columns x 7 rows per glyph, '#' = ink
const G = {
  A: '.###.#...##...#######...##...##...#', B: '####.#...##...#####.#...##...#####.', C: '.###.#...##....#....#....#...#.###.', D: '####.#...##...##...##...##...#####.',
  E: '######....#....####.#....#....#####', F: '######....#....####.#....#....#....', G: '.###.#...##....#.####...##...#.####', H: '#...##...##...#######...##...##...#',
  I: '.###...#....#....#....#....#...###.', J: '..###...#....#....#....#.#..#..##..', K: '#...##..#.#.#..##...#.#..#..#.#...#', L: '#....#....#....#....#....#....#####',
  M: '#...###.###.#.##...##...##...##...#', N: '#...###..##.#.##..###...##...##...#', O: '.###.#...##...##...##...##...#.###.', P: '####.#...##...#####.#....#....#....',
  Q: '.###.#...##...##...##.#.##..#..##.#', R: '####.#...##...#####.#.#..#..#.#...#', S: '.#####....#.....###.....#....#####.', T: '#####..#....#....#....#....#....#..',
  U: '#...##...##...##...##...##...#.###.', V: '#...##...##...##...##...#.#.#...#..', W: '#...##...##...##.#.##.#.###.###...#', X: '#...##...#.#.#...#...#.#.#...##...#',
  Y: '#...##...#.#.#...#....#....#....#..', Z: '#####....#...#...#...#...#....#####',
  0: '.###.#...##..###.#.###..##...#.###.', 1: '..#...##....#....#....#....#...###.', 2: '.###.#...#....#...#...#...#...#####', 3: '.###.#...#....#..##.....##...#.###.',
  4: '...#...##..#.#.#..#.#####...#....#.', 5: '######....####.....#....##...#.###.', 6: '..##..#...#....####.#...##...#.###.', 7: '#####....#...#...#...#....#....#...',
  8: '.###.#...##...#.###.#...##...#.###.', 9: '.###.#...##...#.####....#...#..##..', x: '..........#...#.#.#...#...#.#.#...#',
  '&': '.##..#..#.#.#...#...#.#.##..#..##.#', '\'': '..#....#...#.......................', '.': '..............................##...', '-': '...............###.................',
  '!': '..#....#....#....#....#.........#..', '?': '.###.#...#....#...#...#.........#..', '/': '....#...#....#...#....#...#....#...', ' ': '...................................'
};
const W5 = 5, H7 = 7;
const glyph = (ch) => G[ch] || G[String(ch).toUpperCase()] || G['?'];
const CACHE = new Map();
const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
// the plate as a small canvas (1 pixel = 1 sign pixel); kind 'gold' for the police sign
export function pixelSign(text, night, gold) {
  const t = String(text).slice(0, 14), key = t + '|' + (night ? 1 : 0) + (gold ? 'g' : ''); let c = CACHE.get(key); if (c) return c;
  const chars = [...t], gap = 1, pad = 3, tw = chars.length * (W5 + gap) - gap, w = tw + pad * 2 + 2, h = H7 + 4 + 2;
  c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h });
  const g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data, put = (x, y, col) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const k = (y * w + x) * 4; d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = 255; };
  const INK = rgb('#0b0f1c'), PLATE = rgb(night ? '#121a2e' : '#16203a'), HI = rgb(night ? '#1f2a44' : '#2a3758'), LO = rgb('#0e1424'), LET = rgb(gold ? '#f5b800' : night ? '#ffe9a8' : '#f1f5f9'), SH = rgb('#05070d');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1; put(x, y, edge ? INK : y === 1 ? HI : y === h - 2 || x === w - 2 ? LO : PLATE); } // the plate: ink outline, lit top, darker bottom-right
  const ox = 1 + pad, oy = 3; chars.forEach((ch, i) => { const s = glyph(ch); for (let r = 0; r < H7; r++) for (let q = 0; q < W5; q++) if (s[r * W5 + q] === '#') { const x = ox + i * (W5 + gap) + q, y = oy + r - 1; if (s[(r + 1) * W5 + q + 1] !== '#') put(x + 1, y + 1, SH); } });
  chars.forEach((ch, i) => { const s = glyph(ch); for (let r = 0; r < H7; r++) for (let q = 0; q < W5; q++) if (s[r * W5 + q] === '#') put(ox + i * (W5 + gap) + q, oy + r - 1, LET); });
  g.putImageData(im, 0, 0); c.lw = w; c.lh = h; if (CACHE.size > 200) CACHE.clear(); CACHE.set(key, c); return c;
}
export const SIGN_PX = 1.24; // world units per sign pixel: exactly twice the people's pixel (0.62), so signs sit on the same grid
export const GLYPHS = G;
