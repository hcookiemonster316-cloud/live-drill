// Key moments, staged. When the story turns on one of these, the twist card shows a framed illustration and the music
// drops out for a beat before the words come in. Every picture is composed here from flat shapes (a sky, a skyline,
// the ground, then people and things), drawn as SVG: no images, nothing from outside the game.
const SKY = {
  dawn: ['#fde68a', '#f9a8d4', '#a5b4fc'], day: ['#bae6fd', '#e0f2fe', '#f8fafc'], dusk: ['#1e1b4b', '#9d174d', '#fb923c'],
  night: ['#020617', '#0f172a', '#1e293b'], storm: ['#1f2937', '#374151', '#4b5563'], indoor: ['#1c1917', '#292524', '#44403c']
};
const INK = { dawn: '#3b2f4a', day: '#334155', dusk: '#1a1030', night: '#020617', storm: '#111827', indoor: '#0c0a09' };

// one figure, standing or kneeling, as a silhouette with a single rim light; hat: cap (officer) or none
function figure(x, y, s, o) {
  const c = o.ink, h = 58 * s, rim = o.rim || 'rgba(255,255,255,.35)', dir = o.face || 1;
  if (o.kneel) return '<g><ellipse cx="' + x + '" cy="' + y + '" rx="' + 14 * s + '" ry="' + 3 * s + '" fill="rgba(0,0,0,.35)"/>' +
    '<path d="M' + (x - 10 * s) + ' ' + y + ' q' + 2 * s + ' ' + (-14 * s) + ' ' + 10 * s + ' ' + (-16 * s) + ' l' + 2 * s + ' ' + (-18 * s) + ' q' + 4 * s + ' ' + (-6 * s) + ' ' + 9 * s + ' 0 l' + (-1 * s) + ' ' + 20 * s + ' q' + 6 * s + ' ' + 4 * s + ' ' + 6 * s + ' ' + 14 * s + ' z" fill="' + c + '"/>' +
    '<circle cx="' + (x + 5 * s) + '" cy="' + (y - 40 * s) + '" r="' + 6 * s + '" fill="' + c + '"/></g>';
  const w = (o.child ? 7 : 10) * s, hh = o.child ? h * .62 : h, top = y - hh;
  let out = '<ellipse cx="' + x + '" cy="' + y + '" rx="' + 14 * s + '" ry="' + 3 * s + '" fill="rgba(0,0,0,.35)"/>' +
    '<path d="M' + (x - w * .8) + ' ' + y + ' l' + w * .25 + ' ' + (-hh * .45) + ' l' + (-w * .2) + ' ' + (-hh * .33) + ' q' + w * .8 + ' ' + (-hh * .1) + ' ' + w * 1.5 + ' 0 l' + (-w * .2) + ' ' + hh * .33 + ' l' + w * .25 + ' ' + hh * .45 + ' z" fill="' + c + '"/>' +
    '<circle cx="' + x + '" cy="' + (top + 6 * s) + '" r="' + (o.child ? 5 : 6.5) * s + '" fill="' + c + '"/>' +
    '<path d="M' + (x + dir * w * .7) + ' ' + (top + 12 * s) + ' l' + dir * w * .1 + ' ' + hh * .45 + '" stroke="' + rim + '" stroke-width="' + 1.4 * s + '" fill="none"/>';
  if (o.cap) out += '<path d="M' + (x - 7 * s) + ' ' + (top + 2 * s) + ' h' + 14 * s + ' l' + dir * 4 * s + ' ' + 2 * s + ' h' + (-18 * s) + ' z" fill="' + c + '"/>';
  if (o.badge) out += '<circle cx="' + (x - dir * 3 * s) + '" cy="' + (top + 22 * s) + '" r="' + 1.6 * s + '" fill="#facc15"/>';
  return '<g>' + out + '</g>';
}
const lamp = (x, y, on, ink) => '<g><rect x="' + (x - 1.5) + '" y="' + (y - 70) + '" width="3" height="70" fill="' + ink + '"/><path d="M' + (x - 1.5) + ' ' + (y - 70) + ' h12 v3 h-12 z" fill="' + ink + '"/>' +
  (on ? '<path d="M' + (x + 9) + ' ' + (y - 66) + ' L' + (x - 22) + ' ' + y + ' L' + (x + 40) + ' ' + y + ' Z" fill="rgba(254,240,138,.16)"/><circle cx="' + (x + 9) + '" cy="' + (y - 66) + '" r="3" fill="#fef08a"/>' : '<circle cx="' + (x + 9) + '" cy="' + (y - 66) + '" r="2.4" fill="#334155"/>') + '</g>';
const patrolCar = (x, y, lights, ink) => '<g><ellipse cx="' + (x + 40) + '" cy="' + (y + 1) + '" rx="46" ry="4" fill="rgba(0,0,0,.35)"/><path d="M' + x + ' ' + y + ' v-14 q2 -4 10 -5 l12 -12 h34 l14 12 q14 1 14 6 v13 z" fill="' + ink + '"/>' +
  '<path d="M' + (x + 26) + ' ' + (y - 29) + ' h28 l9 10 h-44 z" fill="rgba(148,163,184,.35)"/><rect x="' + (x + 30) + '" y="' + (y - 34) + '" width="20" height="4" rx="1.5" fill="' + (lights ? '#ef4444' : '#334155') + '"/><rect x="' + (x + 40) + '" y="' + (y - 34) + '" width="10" height="4" rx="1.5" fill="' + (lights ? '#3b82f6' : '#334155') + '"/>' +
  (lights ? '<circle cx="' + (x + 35) + '" cy="' + (y - 32) + '" r="22" fill="rgba(239,68,68,.18)"/><circle cx="' + (x + 47) + '" cy="' + (y - 32) + '" r="22" fill="rgba(59,130,246,.18)"/>' : '') +
  '<circle cx="' + (x + 16) + '" cy="' + y + '" r="6" fill="#0b0f19"/><circle cx="' + (x + 66) + '" cy="' + y + '" r="6" fill="#0b0f19"/></g>';
const memorial = (x, y) => '<g><rect x="' + (x - 1.5) + '" y="' + (y - 34) + '" width="3" height="34" fill="#e7e5e4"/><rect x="' + (x - 9) + '" y="' + (y - 26) + '" width="18" height="3" fill="#e7e5e4"/>' +
  [[-12, '#f43f5e'], [-6, '#facc15'], [5, '#f472b6'], [11, '#fb7185'], [0, '#fde047']].map(([d, c]) => '<line x1="' + (x + d) + '" y1="' + y + '" x2="' + (x + d) + '" y2="' + (y - 9) + '" stroke="#15803d" stroke-width="1.2"/><circle cx="' + (x + d) + '" cy="' + (y - 10) + '" r="3" fill="' + c + '"/>').join('') +
  '<rect x="' + (x - 22) + '" y="' + (y - 8) + '" width="4" height="8" fill="#fef3c7"/><ellipse cx="' + (x - 20) + '" cy="' + (y - 10) + '" rx="1.6" ry="2.6" fill="#fbbf24"/></g>';
const columns = (x, y, w, ink) => { let s = '<g><path d="M' + x + ' ' + (y - 70) + ' l' + w / 2 + ' -18 l' + w / 2 + ' 18 z" fill="' + ink + '"/><rect x="' + x + '" y="' + (y - 72) + '" width="' + w + '" height="6" fill="' + ink + '"/>';
  for (let i = 0; i < 6; i++) s += '<rect x="' + (x + 6 + i * (w - 18) / 5) + '" y="' + (y - 66) + '" width="6" height="58" fill="' + ink + '" opacity=".85"/>';
  return s + '<rect x="' + (x - 6) + '" y="' + (y - 8) + '" width="' + (w + 12) + '" height="4" fill="' + ink + '"/><rect x="' + (x - 12) + '" y="' + (y - 4) + '" width="' + (w + 24) + '" height="4" fill="' + ink + '"/></g>'; };
const skyline = (y, ink, seed) => { let s = '', x = 0, r = seed; const R = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; }; while (x < 320) { const w = 18 + R() * 30, h = 30 + R() * 70; s += '<rect x="' + x + '" y="' + (y - h) + '" width="' + w + '" height="' + h + '" fill="' + ink + '" opacity=".55"/>'; if (R() < .6) for (let k = 0; k < 4; k++) s += '<rect x="' + (x + 4 + R() * (w - 8)) + '" y="' + (y - h + 6 + R() * (h - 12)) + '" width="2" height="3" fill="#fde68a" opacity="' + (.3 + R() * .5) + '"/>'; x += w + 2; } return s; };
const treeShape = (x, y, ink, fruit) => '<g><rect x="' + (x - 2) + '" y="' + (y - 26) + '" width="4" height="26" fill="' + ink + '"/><circle cx="' + x + '" cy="' + (y - 34) + '" r="15" fill="' + ink + '"/>' + (fruit ? [[-6, -36], [5, -30], [2, -42], [-9, -28]].map(([dx, dy]) => '<circle cx="' + (x + dx) + '" cy="' + (y + dy) + '" r="1.8" fill="#fb923c"/>').join('') : '') + '</g>';

// pieces a scene can hold: [kind, x, extra]
function piece(p, ink, y0) {
  const [k, x, o] = p; o || 0;
  switch (k) {
    case 'cop': return figure(x, y0, 1, { ink, cap: true, badge: true, face: (o && o.face) || 1, rim: (o && o.rim) || 'rgba(147,197,253,.55)' });
    case 'person': return figure(x, y0, (o && o.s) || 1, { ink, face: (o && o.face) || -1, kneel: o && o.kneel, rim: (o && o.rim) || 'rgba(255,237,213,.45)' });
    case 'child': return figure(x, y0, 1, { ink, child: true, face: (o && o.face) || 1 });
    case 'car': return patrolCar(x, y0, !!(o && o.lights), ink);
    case 'lamp': return lamp(x, y0, !(o && o.off), ink);
    case 'memorial': return memorial(x, y0);
    case 'court': return columns(x, y0 - 20, 120, ink);
    case 'tree': return treeShape(x, y0 - 8, ink, o && o.fruit);
    case 'fence': { let s = ''; for (let i = 0; i < 12; i++) s += '<rect x="' + (x + i * 9) + '" y="' + (y0 - 26) + '" width="2.5" height="26" fill="' + ink + '"/>'; return s + '<rect x="' + x + '" y="' + (y0 - 20) + '" width="108" height="2" fill="' + ink + '"/><rect x="' + x + '" y="' + (y0 - 10) + '" width="108" height="2" fill="' + ink + '"/>'; }
    case 'stones': return [0, 16, 32, 50].map((d) => '<rect x="' + (x + d) + '" y="' + (y0 - 9) + '" width="9" height="9" rx="3" fill="#a8a29e"/>').join('');
    case 'bench': return '<g><rect x="' + x + '" y="' + (y0 - 14) + '" width="40" height="3" fill="' + ink + '"/><rect x="' + (x + 3) + '" y="' + (y0 - 11) + '" width="2" height="11" fill="' + ink + '"/><rect x="' + (x + 35) + '" y="' + (y0 - 11) + '" width="2" height="11" fill="' + ink + '"/></g>';
    case 'dog': return '<g><ellipse cx="' + x + '" cy="' + (y0 - 10) + '" rx="10" ry="5" fill="' + ink + '"/><circle cx="' + (x + 10) + '" cy="' + (y0 - 15) + '" r="4" fill="' + ink + '"/><rect x="' + (x - 7) + '" y="' + (y0 - 8) + '" width="2" height="8" fill="' + ink + '"/><rect x="' + (x + 5) + '" y="' + (y0 - 8) + '" width="2" height="8" fill="' + ink + '"/></g>';
    case 'bus': return '<g><rect x="' + x + '" y="' + (y0 - 40) + '" width="110" height="34" rx="5" fill="' + ink + '"/>' + [0, 1, 2, 3, 4].map((i) => '<rect x="' + (x + 8 + i * 20) + '" y="' + (y0 - 34) + '" width="14" height="11" fill="rgba(254,240,138,.55)"/>').join('') + '<circle cx="' + (x + 22) + '" cy="' + (y0 - 5) + '" r="6" fill="#0b0f19"/><circle cx="' + (x + 90) + '" cy="' + (y0 - 5) + '" r="6" fill="#0b0f19"/></g>';
    case 'badge': return '<g transform="translate(' + x + ' ' + (y0 - 60) + ')"><path d="M0 -30 L9 -22 L22 -24 L20 -10 L28 0 L20 10 L22 24 L9 22 L0 30 L-9 22 L-22 24 L-20 10 L-28 0 L-20 -10 L-22 -24 L-9 -22 Z" fill="#d4a017" stroke="#fde68a" stroke-width="1.5"/><circle r="12" fill="#b8860b"/><text y="5" text-anchor="middle" font-size="12" font-weight="800" fill="#fef3c7" font-family="Meridian, system-ui, sans-serif">214</text><path d="M-26 6 q8 -14 0 -22" stroke="#0b0f19" stroke-width="4" fill="none" opacity=".6"/></g>';
    case 'box': return '<g><rect x="' + x + '" y="' + (y0 - 22) + '" width="34" height="18" rx="2" fill="#7c2d12"/><path d="M' + x + ' ' + (y0 - 22) + ' l6 -14 h22 l6 14 z" fill="#9a3412"/><circle cx="' + (x + 17) + '" cy="' + (y0 - 13) + '" r="3" fill="#fbbf24"/></g>';
    case 'bell': return '<g><path d="M' + (x - 26) + ' ' + y0 + ' q4 -10 8 -36 q18 -20 36 0 q4 26 8 36 z" fill="#a16207"/><rect x="' + (x - 30) + '" y="' + (y0 - 2) + '" width="60" height="4" fill="#78350f"/><path d="M' + (x - 34) + ' ' + (y0 - 46) + ' q34 -16 68 0 v8 q-34 -12 -68 0 z" fill="#d6d3d1" opacity=".55"/></g>';
    case 'photo': return '<g transform="rotate(-4 ' + x + ' ' + (y0 - 50) + ')"><rect x="' + (x - 44) + '" y="' + (y0 - 84) + '" width="88" height="62" fill="#f5f5f4"/><rect x="' + (x - 38) + '" y="' + (y0 - 78) + '" width="76" height="44" fill="#78716c"/>' + [-26, -13, 0, 13, 26].map((d) => '<circle cx="' + (x + d) + '" cy="' + (y0 - 56) + '" r="4" fill="#292524"/><rect x="' + (x + d - 4) + '" y="' + (y0 - 52) + '" width="8" height="14" fill="#292524"/>').join('') + '<text x="' + x + '" y="' + (y0 - 26) + '" text-anchor="middle" font-size="7" fill="#57534e" font-family="Meridian Text, system-ui, sans-serif">CLASS OF 2003</text></g>';
    case 'bed': return '<g><rect x="' + x + '" y="' + (y0 - 24) + '" width="120" height="16" fill="#57534e"/><rect x="' + x + '" y="' + (y0 - 30) + '" width="26" height="8" rx="3" fill="#d6d3d1"/><rect x="' + x + '" y="' + (y0 - 8) + '" width="4" height="8" fill="' + ink + '"/><rect x="' + (x + 116) + '" y="' + (y0 - 8) + '" width="4" height="8" fill="' + ink + '"/><ellipse cx="' + (x + 70) + '" cy="' + (y0 - 2) + '" rx="40" ry="3" fill="rgba(0,0,0,.4)"/><rect x="' + (x + 56) + '" y="' + (y0 - 4) + '" width="16" height="3" rx="1.5" fill="#f8fafc"/></g>';
    case 'railcar': return '<g><rect x="' + x + '" y="' + (y0 - 66) + '" width="140" height="58" fill="' + ink + '"/><rect x="' + (x + 50) + '" y="' + (y0 - 60) + '" width="40" height="52" fill="#1c1917"/>' + ['#ef4444', '#3b82f6', '#facc15', '#22c55e'].map((c, i) => '<path d="M' + (x + 54 + i * 9) + ' ' + (y0 - 56) + ' l' + (-30 + i * 22) + ' 56 h12 l' + (30 - i * 22) + ' -56 z" fill="' + c + '" opacity=".28"/>').join('') + '<circle cx="' + (x + 20) + '" cy="' + (y0 - 4) + '" r="6" fill="#0b0f19"/><circle cx="' + (x + 120) + '" cy="' + (y0 - 4) + '" r="6" fill="#0b0f19"/></g>';
    case 'moon': return '<circle cx="' + x + '" cy="40" r="14" fill="#f8fafc" opacity=".85"/><circle cx="' + (x + 6) + '" cy="36" r="13" fill="' + INK.night + '" opacity=".0"/>';
    case 'rain': { let s = ''; for (let i = 0; i < 70; i++) { const rx = (i * 47) % 320, ry = (i * 89) % 200; s += '<line x1="' + rx + '" y1="' + ry + '" x2="' + (rx - 3) + '" y2="' + (ry + 10) + '" stroke="rgba(203,213,225,.35)" stroke-width="1"/>'; } return s; }
    case 'window': return '<g><rect x="' + x + '" y="' + (y0 - 110) + '" width="90" height="70" fill="#fde68a" opacity=".75"/><rect x="' + (x + 43) + '" y="' + (y0 - 110) + '" width="4" height="70" fill="' + ink + '"/><rect x="' + x + '" y="' + (y0 - 77) + '" width="90" height="4" fill="' + ink + '"/></g>';
    default: return '';
  }
}
function scene(sk, parts, opt) {
  const g = SKY[sk], ink = INK[sk], y0 = 168, seed = (opt && opt.seed) || 7;
  let s = '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + ((opt && opt.label) || 'A moment in the story') + '">' +
    '<defs><linearGradient id="mk' + seed + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + g[0] + '"/><stop offset=".6" stop-color="' + g[1] + '"/><stop offset="1" stop-color="' + g[2] + '"/></linearGradient></defs>' +
    '<rect width="320" height="200" fill="url(#mk' + seed + ')"/>';
  if (!opt || opt.city !== false) s += skyline(y0 - 10, ink, seed);
  s += '<rect y="' + (y0 - 2) + '" width="320" height="40" fill="' + ink + '"/>';
  parts.forEach((p) => { s += piece(p, ink, y0); });
  return s + '<rect width="320" height="200" fill="none" stroke="rgba(0,0,0,.6)" stroke-width="10"/></svg>';
}

// the moments: twist title (or partner case key) -> picture
export const MOMENTS = {
  'The boy from the fire': () => scene('night', [['lamp', 70], ['bus', 150], ['person', 120, { face: 1 }]], { seed: 3, label: 'A bus driver at the end of the line' }),
  'Badge 214 was never lost': () => scene('dawn', [['badge', 160]], { seed: 11, label: 'Badge 214, scorched at one edge' }),
  'There are graves in the grove': () => scene('dusk', [['tree', 40, { fruit: 1 }], ['tree', 270, { fruit: 1 }], ['stones', 120], ['person', 205, { kneel: 1 }]], { city: false, seed: 5, label: 'Unmarked graves in an orange grove' }),
  'P.J. 1941': () => scene('indoor', [['box', 143], ['window', 40]], { city: false, seed: 6, label: 'A music box on a table' }),
  'Five names on the bell': () => scene('indoor', [['bell', 160]], { city: false, seed: 8, label: 'A bell under canvas in a lumber shed' }),
  'The officer admitted it on the stand': () => scene('night', [['lamp', 150, { off: 1 }], ['person', 190, { face: -1 }]], { seed: 9, label: 'A dark street under a dead streetlight' }),
  'She already knew': () => scene('day', [['court', 100], ['person', 130, { face: 1 }], ['person', 158, { face: -1, s: .9 }]], { seed: 12, label: 'A father and daughter on the courthouse steps' }),
  'A name on a bracelet': () => scene('indoor', [['bed', 100], ['window', 210]], { city: false, seed: 13, label: 'A motel room, a bracelet under the bed' }),
  'Castillo knew him': () => scene('indoor', [['photo', 160]], { city: false, seed: 14, label: 'An academy class photo, 2003' }),
  'Last Tuesday, 6:40 a.m.': () => scene('dawn', [['bench', 60], ['person', 160, { face: 1 }], ['dog', 190], ['tree', 280]], { seed: 15, label: 'A woman and her dog at dawn' }),
  'From a respectful distance': () => scene('day', [['fence', 110], ['person', 80, { face: 1 }], ['child', 170], ['child', 196], ['tree', 280]], { seed: 16, label: 'An old man at a schoolyard fence' }),
  'Forty crates of light': () => scene('dusk', [['railcar', 90], ['person', 70, { face: 1 }]], { seed: 17, label: 'Stained glass light from an open boxcar' }),
  // the partners' turning points (partners.js)
  walsh: () => scene('dusk', [['memorial', 150], ['cop', 190, { face: -1 }], ['lamp', 250]], { seed: 21, label: 'Bernie Walsh at the memorial' }),
  park: () => scene('night', [['rain', 0], ['car', 110], ['cop', 80, { face: 1 }], ['lamp', 250]], { seed: 22, label: 'Theo Park beside his patrol car in the rain' }),
  castillo: () => scene('dawn', [['court', 110], ['cop', 150, { face: 1 }], ['person', 205, { face: -1 }]], { seed: 23, label: 'Sgt. Castillo on the courthouse steps' })
};
// an SVG string for a moment, or '' when that turn has no picture
export function momentArt(key) { const f = MOMENTS[key]; return f ? f() : ''; }
