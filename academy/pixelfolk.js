// Pixel people, drawn from flat 2D shapes in 8 directions.
// Five drawings per pose (front, front three-quarter, side, back three-quarter, back); the three left-facing directions
// mirror the drawing but keep the light on the upper left. Parts are flat shapes (ovals, tapered limbs, trapezoids) with
// cel bands toward and away from the light; parts cast small shadows on what sits under them; everything snaps to
// hand-style ramps (hue-shifted, 8 steps) with a selective outline; eyes, mouths and brows are placed pixel by pixel.
// A design (see folkcast.js) picks a build, hair, hat, face, outfit and prop. Named characters each get a signature
// silhouette element nobody else has.
export let SS = 4; export const SW = 48, SH = 64, OX = 24, OY = 61; export function setSS(k) { SS = k; }
const hx = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; };
const toHsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h, s, l]; };
const fromHsl = ([h, s, l]) => { h = ((h % 1) + 1) % 1; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l)); const f = (n) => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); }; return [f(0), f(8), f(4)]; };
const toward = (h, t, a) => { let d = t - h; if (d > .5) d -= 1; if (d < -.5) d += 1; return h + Math.sign(d) * Math.min(Math.abs(d), a); };
const RAMPS = new Map(), INK = [22, 27, 46]; // #161b2e
// a material's ramp: [outline, 8 steps from deep shadow to highlight]. Shadows shift hue (cool for cloth, purple-warm
// for skin, wood and hair), lights lean yellow and lose saturation, the middle keeps the most saturation.
export function ramp(hex) { if (RAMPS.has(hex)) return RAMPS.get(hex); const [h, s, l] = toHsl(hx(hex)), warm = s > .15 && (h < .14 || h > .93), lift = Math.min(1, .45 + l);
  const at = (f) => { if (f < .45) { const u = (.45 - f) / .45; return fromHsl([warm ? toward(h, .955, .045 * u) : toward(h, .68, .065 * u), warm ? s * (1 - .2 * u) : Math.min(1, s * (1 + .12 * u) + .05 * u), l * (1 - .55 * Math.pow(u, .9))]); }
    const u = (f - .45) / .55; return fromHsl([toward(h, .13, .045 * u), s * (1 - .42 * u), l + (1 - l) * .62 * Math.pow(u, 1.15) * lift]); };
  // the outline: a deep blue-black ink (never true black), tinted a little by the material it wraps
  const md = fromHsl([warm ? toward(h, .95, .05) : toward(h, .68, .07), Math.min(.6, s * .85 + .16), Math.max(.055, l * .26)]), r = [mix(INK, md, .22)]; for (let i = 0; i < 8; i++) r.push(at(i / 7)); r.lit = (t) => mix(INK, r[Math.max(1, Math.min(4, t - 2))], .5); RAMPS.set(hex, r); return r; }
const mix = (a, b, k) => [Math.round(a[0] + (b[0] - a[0]) * k), Math.round(a[1] + (b[1] - a[1]) * k), Math.round(a[2] + (b[2] - a[2]) * k)];
const band = (dot, gloss) => dot > .62 && gloss ? .9 : dot > .22 ? .68 : dot < -.72 ? .14 : dot < -.3 ? .27 : .47;
const ANG = [0, Math.PI / 4, Math.PI / 2, Math.PI * 3 / 4, Math.PI];
const DEF = { chev: '#e3b341', eye: '#2a1b1d', mouth: '#9a4f48', belt: '#1c1d22', buckle: '#c9b46a', badge: '#f2c94c', patch: '#f5b800', strip: '#e8edf2', metal: '#9aa3ad', dark: '#1b1d24', white: '#f1eee6', wood: '#8a5a2e', paper: '#f4efe2', red: '#c0392b', glass: '#2a3440', lens: '#a8c4d6' };

// ---------- one pose from one angle, as a list of flat shapes ----------
const HELD = new Set(['coffee', 'pot', 'clipboard', 'books', 'laptop', 'tongs', 'ladle', 'spatula', 'medbag', 'football', 'binoculars', 'box', 'donuts', 'icecream', 'chess', 'gavel', 'mic', 'plant', 'phone', 'folder', 'tablet', 'basket', 'flashlight', 'gloves', 'wrench']);
const RAISED = new Set(['stop', 'flag']);
function figure(D, v, mir, ph, mv) {
  const S = [], C = D.cols, LX = mir ? .6 : -.6, LY = -.8, A = ANG[v], ca = Math.cos(A), sa = Math.sin(A);
  const front = v <= 2, back = v >= 3, side = v === 2, tq = v === 1 || v === 3;
  const place = (lx, lz) => ({ x: lx * ca + lz * sa, d: -lx * sa + lz * ca });
  const B = D.build || 'avg', bw = { heavy: 1.22, stocky: 1.14, slim: .86, avg: 1, broad: 1.12 }[B] || 1, legL = { stocky: .86, heavy: .94, slim: 1.04, tall: 1.06 }[B] || 1;
  const elder = D.age === 'elder', kid = D.age === 'teen';
  let layer = 0; const put = (g, test, bb, mat, tone) => S.push({ g, test, bb, mat, tone, layer: layer++ });
  const ell = (g, cx, cy, rx, ry, mat, op = {}) => put(g, (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 && (!op.clip || op.clip(x, y)), [cx - rx, cy - ry, cx + rx, cy + ry], mat,
    (x, y) => op.f != null ? op.f : band(((x - cx) / rx) * LX * (op.flatX ? .5 : 1) + ((y - cy) / ry) * LY * (op.flatY ? .45 : 1), op.gloss) + (op.dim || 0));
  const limb = (g, x0, y0, x1, y1, r0, r1, mat, op = {}) => { const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1, len = Math.sqrt(L2), px = -dy / len, py = dx / len;
    put(g, (x, y) => { const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / L2)), r = r0 + (r1 - r0) * t; return (x - x0 - dx * t) ** 2 + (y - y0 - dy * t) ** 2 <= r * r; },
      [Math.min(x0, x1) - Math.max(r0, r1), Math.min(y0, y1) - Math.max(r0, r1), Math.max(x0, x1) + Math.max(r0, r1), Math.max(y0, y1) + Math.max(r0, r1)], mat,
      (x, y) => { if (op.f != null) return op.f; const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / L2)), r = r0 + (r1 - r0) * t, w = ((x - x0) * px + (y - y0) * py) / r; return band(w * (px * LX + py * LY) * 1.15, op.gloss) + (op.dim || 0); }); };
  const trap = (g, cx, y0, y1, w0, w1, mat, op = {}) => { const hw = (y) => w0 + (w1 - w0) * Math.max(0, Math.min(1, (y - y0) / (y1 - y0))), cr = op.cr != null ? op.cr : 2.2;
    put(g, (x, y) => { if (y < y0 || y > y1) return false; const h = hw(y), yy = y - y0; if (yy < cr) { const ex = Math.abs(x - cx) - (h - cr); if (ex > 0 && ex * ex + (cr - yy) ** 2 > cr * cr) return false; } return Math.abs(x - cx) <= h && (!op.clip || op.clip(x, y)); },
      [cx - Math.max(w0, w1), y0, cx + Math.max(w0, w1), y1], mat, (x, y) => op.f != null ? op.f : band(((x - cx) / hw(y)) * LX * 1.1 + ((y - (y0 + y1) / 2) / ((y1 - y0) / 2)) * LY * .35, false) + (op.dim || 0)); };
  const rect = (g, x0, y0, x1, y1, mat, op = {}) => put(g, (x, y) => x >= Math.min(x0, x1) && x <= Math.max(x0, x1) && y >= y0 && y <= y1, [Math.min(x0, x1), y0, Math.max(x0, x1), y1], mat, () => op.f != null ? op.f : .47);
  const sw = mv ? Math.sin(ph) : 0;
  if (D.prop && !D.pose && HELD.has(D.prop)) D = Object.assign({}, D, { pose: 'hold' });
  if (D.prop && !D.pose && RAISED.has(D.prop)) D = Object.assign({}, D, { pose: 'raise' });
  // ---- legs ----
  const legs = [], hipY = -16.4 * legL - (B === 'tall' ? 1 : 0), TH = 7.4 * legL, SHN = 7.2 * legL;
  for (const [g, lx, s] of [['legL', 2.4 * bw, sw], ['legR', -2.4 * bw, -sw]]) {
    let a = s * .46 * (D.stride || 1), kb = mv ? Math.max(0, -s) * .95 + .1 : (D.knees || 0);
    if (D.sit) { a = 1.35; kb = 1.35; } // seated (bikes, horses): thigh forward, shin straight down
    const kz = Math.sin(a) * TH, ky = hipY + Math.cos(a) * TH, a2 = a - kb, fz = kz + Math.sin(a2) * SHN; let fy = ky + Math.cos(a2) * SHN;
    const h = place(lx, 0), k = place(lx, kz), f = place(lx, fz);
    legs.push({ g, hx: h.x, hy: hipY, kx: k.x, ky, fx: f.x, fy, d: h.d + (fz) * ca * .01, fwd: place(0, 1).x }); }
  const ground = Math.max(...legs.map((l) => l.fy + 1.5)), dy = -ground; legs.forEach((l) => { l.hy += dy; l.ky += dy; l.fy += dy; });
  const lean = elder ? 1.6 : 0, Y = (y) => y + dy;
  const LXo = (y) => place(0, lean * Math.max(0, (-y - 20) / 20)).x; // elders lean forward toward the top
  const drawLeg = (l, far) => { const dim = far ? -.12 : 0, skirt = D.top && (D.top.kind === 'dress' || D.top.kind === 'robe');
    const pm = D.shorts ? (x, y) => y - dy > hipY + 5.2 ? 'skin' : 'pants' : skirt ? 'skin' : 'pants';
    limb(l.g, l.hx, l.hy, l.kx, l.ky, 2.7 * bw, 2.25, pm, { dim }); limb(l.g, l.kx, l.ky, l.fx, l.fy, 2.25, 1.8, D.shorts || skirt ? 'skin' : 'pants', { dim });
    if (D.boots) limb(l.g, l.kx + (l.fx - l.kx) * .55, l.ky + (l.fy - l.ky) * .55, l.fx, l.fy, 2.1, 2, 'shoe', { dim });
    const fl = 2.1 + Math.abs(sa) * .8; ell(l.g, l.fx + place(0, 1.3).x, l.fy + .2, fl, 1.45, 'shoe', { dim, flatY: true }); };
  // ---- torso geometry ----
  const tw0 = 6 * bw, tz = 4.5 * bw, W = Math.sqrt(ca * ca + (tz / tw0) ** 2 * sa * sa), sh = tw0 * W, waist = (B === 'heavy' ? 5.8 : 4.6) * bw * Math.sqrt(ca * ca + (B === 'heavy' ? 1 : .9) * sa * sa);
  const topY = Y(-31.4 - (B === 'tall' ? 1 : 0)), botY = Y(-19.4 - (B === 'tall' ? 1 : 0)), tx = place(0, B === 'heavy' ? 1 : .3).x;
  // ---- arms ----
  const armY = topY + 1.9, UP = 6.4 * (B === 'tall' ? 1.05 : 1), FO = 5.8 * (B === 'tall' ? 1.05 : 1);
  const armInfo = (lx, s, pose) => { let th = s * .45, bend = .2 + Math.max(0, s) * .5, out = 0;
    if (pose === 'up') { // a wave: the arm goes out and up to the side, the hand swings between two frames
      const sg = Math.sign(lx), P0 = place(lx, 0), P1 = place(lx + sg * 5.4, 2), P2 = place(lx + sg * (D.wavePh ? 10.6 : 7.6), 3);
      return { sx: P0.x, sy: armY, ex: P1.x, ey: armY - .6, wx: P2.x, wy: armY - 7.2, d: P0.d, hd: P2.d + 2, fa: Math.PI, fwd: place(0, 1).x }; }
    if (pose === 'hold') { th = .25; bend = 1.45; } else if (pose === 'up') { th = 2.6; bend = D.wavePh ? .75 : -.25; } else if (pose === 'carry') { th = .05; bend = .25; out = .6; } else if (pose === 'hip') { th = -.1; bend = 1.4; out = 2.6; } else if (pose === 'sling') { th = .1; bend = 1.6; } else if (pose === 'raise') { th = .9; bend = .9; out = 1.2; } else if (pose === 'cross') { th = .35; bend = 1.7; out = -2; }
    const sh3 = [lx, 0], el3 = [lx + Math.sign(lx) * (.5 + out * .5), Math.sin(th) * UP], wr3 = [lx + Math.sign(lx) * (.8 + out) * (pose === 'cross' ? -1 : 1) + (pose === 'cross' ? -Math.sign(lx) * 4 : 0), el3[1] + Math.sin(th + bend) * FO];
    const P0 = place(...sh3), P1 = place(...el3), P2 = place(...wr3);
    return { sx: P0.x, sy: armY, ex: P1.x, ey: armY + Math.cos(th) * UP, wx: P2.x, wy: armY + Math.cos(th) * UP + Math.cos(th + bend) * FO, d: P0.d, hd: P2.d, fa: th + bend, fwd: place(0, 1).x }; };
  const arms = [['armL', sh + .2, -sw, D.poseL], ['armR', -(sh + .2), sw, D.pose]].map(([g, lx, s, pose]) => Object.assign({ g, pose }, armInfo(lx / W * (tq || side ? 1 : 1) * (side ? 1 : 1), s, pose)));
  // in side and three-quarter views the shoulders sit inside the body outline
  arms.forEach((a) => { if (side || tq) { const P0 = place(Math.sign(a.sx || 1) * 0, 0); } });
  const drawArm = (a, far) => { const dim = far ? -.14 : 0, sl = D.top && D.top.kind === 'tank' ? 0 : D.top && D.top.sleeve != null ? D.top.sleeve : 1, topM = D.top && D.top.kind === 'vest' ? 'skin' : 'top';
    const upM = (x, y) => (y - a.sy) / UP <= sl * 1.15 ? topM : 'skin';
    limb(a.g, a.sx, a.sy, a.ex, a.ey, 2.3 * bw, 1.95, sl >= 1 ? topM : upM, { dim }); limb(a.g, a.ex, a.ey, a.wx, a.wy, 1.9, 1.55, sl >= 1 ? topM : 'skin', { dim });
    // rank chevrons on the sleeve, one to three gold bars just under the shoulder
    if (D.chev && sl >= 1) { const dx = a.ex - a.sx, dy = a.ey - a.sy, AL = Math.hypot(dx, dy) || 1, ux = dx / AL, uy = dy / AL, R = 2.5 * bw;
      for (let i = 0; i < D.chev; i++) { const u0 = 1.2 + i * 1.9, u1 = u0 + 1.05; put(a.g, (x, y) => { const u = (x - a.sx) * ux + (y - a.sy) * uy, w = (x - a.sx) * -uy + (y - a.sy) * ux; return u >= u0 && u <= u1 && Math.abs(w) <= R; }, [a.sx - AL - R, a.sy - AL - R, a.sx + AL + R, a.sy + AL + R], 'chev', () => .5 + dim); } }
    if (D.top && D.top.cuff && sl >= 1) limb(a.g, a.ex + (a.wx - a.ex) * .78, a.ey + (a.wy - a.ey) * .78, a.wx, a.wy, 1.7, 1.6, 'top2', { dim });
    const hxp = a.wx + Math.sin(a.fa) * 1.1 * a.fwd * .8, hyp = a.wy + Math.abs(Math.cos(a.fa)) * 1.1;
    if (a.pose === 'sling') { limb(a.g, a.sx * .4, a.sy - 1, a.wx + 1, a.wy + .6, .7, .7, 'sling', { f: .5 }); limb(a.g, a.ex, a.ey + .6, a.wx, a.wy + .8, 2.1, 2.1, 'sling'); }
    ell(a.g, hxp, hyp + .5, 1.6, 1.75, D.gloves && a.g === 'armR' ? 'glove' : 'skin', { dim }); a.hx = hxp; a.hy = hyp + .5; };
  // ---- head geometry ----
  const HCX = place(0, .5 + lean).x + LXo(-38) * 0, HCY = Y(-38.6 - (B === 'tall' ? 1 : 0) + (elder ? .8 : 0)), HRX = 7 * Math.sqrt(ca * ca + .89 * sa * sa) * (D.headW || 1), HRY = 7.4 * (D.headH || 1);
  const H = { x: HCX, y: HCY, rx: HRX, ry: HRY };
  // ---- accessories decide which side of the body they sit on ----
  const behind = [], over = [], onHead = [], behindHead = [];
  const acc = (list, fn) => list.push(fn);
  // hair that hangs behind the body (long hair, braids, ponytail) or a big afro
  const hs = D.hair || 'short';
  if (hs === 'long' || hs === 'waves') { if (v === 0) { acc(behind, () => { limb('hairB', HCX - 5.4, HCY + 1.4, HCX - 5.8, HCY + 10.6, 3, 2.4, 'hair'); limb('hairB', HCX + 5.4, HCY + 1.4, HCX + 5.8, HCY + 10.6, 3, 2.4, 'hair'); }); }
    else if (!back) acc(behind, () => { const bx = HCX + place(0, -3.6).x; limb('hairB', bx, HCY + 1.4, bx + place(0, -.6).x, HCY + 11, 4.4, 3.4, 'hair'); }); }
  if (hs === 'ponytail' && v !== 4) acc(behindHead, () => { const p = place(0, -6.8); if (v === 0) return; limb('hairB', HCX + p.x, HCY - 2.4, HCX + p.x + place(0, -1.4).x, HCY + 7.2, 2.2, 1.4, 'hair', { gloss: true }); });
  if (hs === 'braids' && front) acc(behind, () => { for (const lx of [-5.6, 5.6]) { const p = place(lx, -1); if (p.d < -3) continue; limb('hairB', HCX + p.x, HCY + 1, HCX + p.x, HCY + 12, 1.6, 1.3, 'hair'); } });
  if ((hs === 'afro' || hs === 'puff') && front) acc(behindHead, () => ell('hairB', HCX + place(0, -1.6).x, HCY - 1.8 - (hs === 'puff' ? 1 : 0), hs === 'puff' ? 8.6 : 9.6, hs === 'puff' ? 8 : 8.8, 'hair', { gloss: true }));
  if (hs === 'locs' && front) acc(behind, () => { for (const lx of [-5.8, -3.4, 3.4, 5.8]) { const p = place(lx, -2); if (p.d < -4) continue; limb('hairB', HCX + p.x, HCY - 1, HCX + p.x * 1.05, HCY + 9.6, 1.5, 1.2, 'hair'); } });
  // ---- paint order ----
  const legsSorted = legs.slice().sort((a, b) => a.d - b.d), farLeg = legsSorted[0], nearLeg = legsSorted[1];
  const armsSorted = arms.slice().sort((a, b) => a.d - b.d), farArm = armsSorted[0], nearArm = armsSorted[1];
  const twoSided = v === 0 || v === 4;
  behind.forEach((f) => f());
  if (back) behindHead.length = behindHead.length; // drawn later for back views
  if (front) behindHead.forEach((f) => f());
  // things on the back seen from the front (backpack, quiver of a fishing rod, cape)
  propsBehind();
  drawLeg(farLeg, !twoSided);
  if (!twoSided) drawArm(farArm, true);
  // hips, skirts, robes
  const k = D.top ? D.top.kind : 'shirt';
  if (k === 'dress') trap('hips', tx, Y(-20.6), Y(-9.4 - (D.top.mini ? -2 : 0)), waist, (7 + (D.top.flare || 0)) * bw * W + (side ? 1.4 : 0), 'top', { cr: 0 });
  else if (k === 'robe' || k === 'labcoat' || k === 'coat') trap('hips', tx, Y(-20.6), Y(k === 'robe' ? -3 : -10.6), waist + .2, (6.2 + (k === 'robe' ? 1.4 : 0)) * bw * W + (side ? 1 : 0), k === 'labcoat' ? 'coat' : 'top', { cr: 0, clip: k === 'robe' ? null : (x, y) => !(front && !side && Math.abs(x - tx - place(0, 1).x * 0) < .6) });
  else trap('hips', tx, Y(-20.4), Y(-15 + (B === 'heavy' ? 1 : 0)), waist + .3, waist + .5, 'pants', { cr: 0 });
  drawLeg(nearLeg, false);
  if (k === 'robe') trap('hips', tx, Y(-20.6), Y(-3), waist + .2, 7.6 * bw * W + (side ? 1 : 0), 'top', { cr: 0 });
  // body
  const bodyMat = (x, y) => { const yy = y - dy, cx = tx + place(0, 3).x * .55, fz = front && !side;
    if (D.apron && yy > -27.5 && front) { const ax = Math.abs(x - tx - place(0, 2).x * .4); if (ax < waist + .2 - (side ? 2 : 0)) return yy > -21 || ax < 3.2 ? 'apron' : bodyMat2(x, y, yy, cx, fz); }
    if (D.overalls && front && yy > -27 && Math.abs(x - cx) < 3.4) return 'pants';
    return bodyMat2(x, y, yy, cx, fz); };
  const bodyMat2 = (x, y, yy, cx, fz) => {
    if (!D.noBelt && k !== 'dress' && k !== 'robe' && k !== 'coat' && k !== 'labcoat' && yy > -20.9 && yy < -19.5) return fz && Math.abs(x - cx) < .8 ? 'buckle' : 'belt';
    if (D.vest && yy < -21.2 && yy > -30.6) { if (Math.abs(yy + 23.6) < .55 || (fz && Math.abs(Math.abs(x - cx) - 2.6) < .5 && yy < -24)) return 'strip'; if (!(fz && Math.abs(x - cx) < .7)) return 'vest'; }
    if (fz) {
      if (D.tie && Math.abs(x - cx) < .75 + Math.max(0, yy + 24) * .2 && yy > -30.2 && yy < -22) return 'tie';
      if ((k === 'jacket' || k === 'coat' || k === 'labcoat' || k === 'cardigan' || k === 'blazer') && Math.abs(x - cx) < (k === 'cardigan' ? 1.4 : 2) - Math.max(0, yy + 23) * .25 && yy > -30.6) return 'top2';
      if (D.collar && Math.abs(x - cx) < .8 && yy > -31 && yy < -29.6) return 'white';
      if (D.badge && Math.abs(x - (cx + (mir ? 1 : 1) * 2.9 * bw * W)) < 1 && Math.abs(yy + 27) < 1.1) return 'badge';
      if (D.pin && Math.abs(Math.abs(x - cx) - 2.4) < .65 && yy < -28.2 && yy > -29.6) return 'chev';
      if (D.nameplate && Math.abs(x - (cx - 2.9 * bw * W)) < 1.3 && Math.abs(yy + 27.2) < .45) return 'badge';
      if (D.stripe && Math.abs(yy + 25.5) < 1) return 'top2';
      if (D.logo && Math.abs(x - cx) < 1.6 && Math.abs(yy + 26) < 1.4) return 'logo';
      if ((k === 'uniform' || D.placket) && Math.abs(x - cx) < .3 && yy > -30) return 'top2'; }
    if (k === 'uniform' && D.patch && !fz && Math.abs(yy + 28) < 1.2) return 'top';
    return yy > -30.4 && D.hood && back ? 'top' : 'top'; };
  if (twoSided) arms.forEach((a) => drawArm(a, false));
  trap('torso', tx, topY, botY, sh + (B === 'heavy' ? .4 : 0), waist + (side ? .3 : 0), bodyMat);
  if (B === 'heavy' && !back) ell('torso', tx + place(0, 2).x, Y(-22.6), waist + .8, 3.6, bodyMat);
  if (k === 'dress') trap('torso', tx, Y(-21), Y(-18.6), waist, waist + .4, 'top', { cr: 0 });
  if (D.hood && back) ell('torso', tx, topY + .8, 5.4 * W, 2.8, 'top', { dim: -.06 });
  if (D.hood && !back) acc(over, () => { const p = place(0, -3.4); if (v === 0) return; ell('torso', tx + p.x, topY + .6, 3.2, 2.6, 'top', { dim: -.1 }); });
  if (D.scarf) { trap('torso', tx, topY - .6, topY + 2, sh * .62, sh * .66, 'scarf', { cr: 1.2 }); if (front) limb('torso', tx + place(-2, 3).x, topY + 1.2, tx + place(-2.4, 3.2).x, topY + 7.4, 1.1, 1, 'scarf'); }
  if (D.lanyard && front) { limb('torso', tx + place(-2.6, 3).x, topY + .4, tx + place(0, 4).x, topY + 6.6, .45, .45, 'lanyard'); limb('torso', tx + place(2.6, 3).x, topY + .4, tx + place(0, 4).x, topY + 6.6, .45, .45, 'lanyard'); rect('torso', tx + place(0, 4).x - 1.1, topY + 6.4, tx + place(0, 4).x + 1.1, topY + 9.2, 'white'); }
  if (D.suspenders && front && !side) for (const lx of [-2.6, 2.6]) { const p = place(lx, 3.6); if (p.d > 0) limb('torso', tx + p.x, topY + .2, tx + p.x * .9, botY - .6, .55, .55, 'top2', { f: .3 }); }
  if (D.bag) { const p = place(6.2 * bw, 1); acc(p.d >= 0 ? over : behind, () => {}); limb('torso', tx + place(-4.6 * bw, 3).x, topY + .6, tx + place(4.6 * bw, 3).x, botY - 1, .55, .55, 'strap', { f: .3 }); }
  if (D.holster && v !== 4) { const p = place(-5.6 * bw, .8); ell(p.d >= -1 ? 'torso' : 'hips', tx + p.x, botY + 1, 1.3, 2.6, 'dark', { f: .3 }); }
  if (D.radio && front) { const p = place(4 * bw, 3.8); if (p.d > 0) rect('torso', tx + p.x - .7, topY + 2.6, tx + p.x + .7, topY + 5.4, 'dark'); }
  propsBody();
  if (!twoSided) { drawArm(nearArm, false); }
  propsHand();
  over.forEach((f) => f());
  // neck and head
  trap('neck', HCX * .5 + tx * .5, HCY + 5.6, topY + 1.6, 1.8, 2, 'skin', { dim: -.2, cr: 0 });
  if (D.collar || D.turtle) trap('neck', HCX * .5 + tx * .5, topY - .6, topY + 1.4, D.turtle ? 2.4 : 2.3, 2.6, D.turtle ? 'top' : 'top', { cr: .6 });
  for (const lx of [-6.9, 6.9]) { const p = place(lx * (D.headW || 1), -.3); if (p.d > -2) ell('head', HCX + p.x, HCY + .6, 1.1, 1.7, 'skin', { dim: p.d < 2 ? -.06 : 0 }); }
  ell('head', HCX, HCY, HRX, HRY, 'skin');
  if (side || tq) { const j = place(0, 4.2); if (j.d > 0) ell('head', HCX + j.x * .85, HCY + 4.8, 2.3, 1.5, 'skin'); }
  if (side) ell('head', HCX + place(0, 6.6).x, HCY + 1.6, 1.1 * (D.nose || 1), 1.3, 'skin');
  // facial hair
  if (D.beard && !back) { const bc = D.beard;
    if (bc === 'full' || bc === 'long') put('hair', (x, y) => ((x - HCX - place(0, 1.2).x * .6) / (HRX * .94)) ** 2 + ((y - HCY - 2.6) / (bc === 'long' ? 6.4 : 5)) ** 2 <= 1 && y > HCY + 1.6 - Math.abs(x - HCX) * .1 && (!side || x > HCX - 2), [HCX - 8, HCY, HCX + 8, HCY + 9], 'beard', (x, y) => band(((x - HCX) / HRX) * LX + ((y - HCY - 3) / 5) * LY, false));
    if (bc === 'goatee') ell('hair', HCX + place(0, 6).x * .8, HCY + 5.6, 1.6, 1.9, 'beard');
    if (bc === 'stache' || bc === 'full' || bc === 'goatee' || bc === 'walrus') { const m = place(0, 6.4); ell('hair', HCX + m.x * .8, HCY + 3.4, bc === 'walrus' ? 3.2 * Math.max(.5, ca) + 1 : 2.4 * Math.max(.45, ca) + .6, bc === 'walrus' ? 1.3 : .9, 'beard'); } }
  // ---- hair ----
  const E = (x, y, g = .7) => ((x - HCX) / (HRX + g)) ** 2 + ((y - HCY + .6) / (HRY + g + .1)) ** 2 <= 1;
  const backEdge = [null, -3.2, -.6, 2.8, null][v];
  const scalp = (x, y, low, sideLow) => { const rx = x - HCX, ry = y - HCY; if (v === 4) return ry < 5.2 - (sideLow || 0); const fr = ry < -3 - (low || 0) + Math.abs(rx) * .16 * (front ? 1 : 0);
    if (v === 0) return fr || (Math.abs(rx) > 5.7 && ry < 1.6 - (sideLow || 0)); return fr || (rx < backEdge && ry < (v === 3 ? 5.2 : 4.2) - (sideLow || 0)) || (v === 3 && ry < -1); };
  const hairShape = (low, op = {}) => put('hair', (x, y) => E(x, y, op.g) && scalp(x, y, low, op.sideLow) && (!op.clip || op.clip(x, y)), [HCX - HRX - 2, HCY - HRY - 2, HCX + HRX + 2, HCY + HRY + 1], 'hair', (x, y) => band(((x - HCX) / HRX) * LX + ((y - HCY + 2) / HRY) * LY, true));
  const hat = D.hat ? D.hat.kind : null, hatLow = hat && !['headset', 'headphones', 'bandana', 'visor', 'welder', 'veil', 'band', 'pigeon', 'goggles'].includes(hat);
  if (!['hardhat', 'helmetF', 'bike', 'pith', 'chef', 'beanie', 'headwrap', 'veil', 'campaign'].includes(hat) || !back || true) {
    if (hs === 'bald') { if (!hat) hairShape(-99, { clip: (x, y) => y > HCY - 2.6 && (v === 4 || (x - HCX) < backEdge || Math.abs(x - HCX) > 5.4) }); }
    else if (hs === 'shaved') {}
    else if (['short', 'messy', 'buzz', 'bun', 'afro', 'puff', 'side', 'spiky', 'flattop', 'curly', 'ponytail', 'braids', 'mohawk', 'locs', 'perm', 'beehive', 'swoop', 'pigtails', 'updo'].includes(hs)) hairShape(hs === 'buzz' ? -.8 : hs === 'side' || hs === 'swoop' ? .4 : 0, { g: hs === 'buzz' ? .3 : hs === 'perm' || hs === 'curly' ? 1.2 : .7, sideLow: hs === 'mohawk' ? 4 : 0, clip: hs === 'mohawk' ? (x, y) => Math.abs(x - HCX - place(0, 0).x) < (v === 0 || v === 4 ? 2.2 : 9) || y > HCY - 2 : null });
    if (hs === 'long' || hs === 'bob' || hs === 'waves') { hairShape(.8); if (back) put('hair', (x, y) => Math.abs(x - HCX) < 7.4 - Math.max(0, y - HCY - 4) * .2 && y > HCY && y < HCY + (hs === 'bob' ? 5.6 : 11), [HCX - 8, HCY, HCX + 8, HCY + 12], 'hair', (x) => band(((x - HCX) / 7) * LX, true)); if (v === 0 && hs === 'bob') { limb('hair', HCX - 6, HCY - 2, HCX - 6.2, HCY + 4.4, 1.8, 1.6, 'hair'); limb('hair', HCX + 6, HCY - 2, HCX + 6.2, HCY + 4.4, 1.8, 1.6, 'hair'); } }
    if (!hatLow) {
      if (hs === 'messy' || hs === 'spiky') for (const [ax, az, ay, r] of [[-4.4, 0, -5.8, 2], [-1.6, 1, -7.4, 2.2], [1.6, 1, -7.6, 2.1], [4.4, 0, -6, 1.9], [0, -3, -7, 2]]) { const p = place(ax, az); ell('hair', HCX + p.x, HCY + ay - (hs === 'spiky' ? 1.2 : 0), r * (hs === 'spiky' ? .8 : 1), r * (hs === 'spiky' ? 1.3 : .85), 'hair', { gloss: true }); }
      if (hs === 'bun' || hs === 'updo') ell('hair', HCX + place(0, -3.4).x, HCY - 7.6 + (back ? 1 : 0) - (hs === 'updo' ? 1.2 : 0), hs === 'updo' ? 3.4 : 2.8, hs === 'updo' ? 3 : 2.5, 'hair', { gloss: true });
      if (hs === 'beehive') ell('hair', HCX + place(0, -1).x, HCY - 7.4, 5.8 * Math.max(.75, Math.abs(ca)) + 1, 5.6, 'hair', { gloss: true });
      if (hs === 'flattop') trap('hair', HCX + place(0, -.6).x, HCY - 12.4, HCY - 4, HRX - .4, HRX + .2, 'hair', { cr: .6 });
      if (hs === 'mohawk') { const p = place(0, -1); limb('hair', HCX + place(0, 4).x, HCY - 7.2, HCX + place(0, -5).x, HCY - 6.6, 2.2, 2.2, 'hair', { gloss: true }); }
      if (hs === 'pigtails') for (const lx of [-6.6, 6.6]) { const p = place(lx, -1.6); if (p.d > -4) ell('hair', HCX + p.x * 1.15, HCY - 2.6, 2.4, 2.8, 'hair', { gloss: true }); }
      if (hs === 'swoop') { const p = place(-2, 4); ell('hair', HCX + p.x, HCY - 5.8, 4.4, 2.4, 'hair', { gloss: true }); }
      if (hs === 'perm' || hs === 'curly') for (let i = 0; i < 7; i++) { const an = Math.PI * (1.05 + i * .15), p = place(Math.cos(an) * 7.4, Math.sin(an) * -2), y = HCY - 1 + Math.sin(an) * 7.2; if (p.d < -3 && front) continue; ell('hair', HCX + p.x * .95, y, 1.9, 1.9, 'hair', { gloss: true }); }
    }
    if ((hs === 'afro' || hs === 'puff') && back) ell('hair', HCX, HCY - 1.8, hs === 'puff' ? 8.6 : 9.6, hs === 'puff' ? 8 : 8.8, 'hair', { gloss: true });
    if ((hs === 'afro' || hs === 'puff') && front && !hatLow) put('hair', (x, y) => ((x - HCX) / 8.8) ** 2 + ((y - HCY + 2) / 8.2) ** 2 <= 1 && y < HCY - 3.4 + Math.abs(x - HCX) * .2 && (side ? x < HCX + 5 : true), [HCX - 9, HCY - 11, HCX + 9, HCY], 'hair', (x, y) => band(((x - HCX) / 8.6) * LX + ((y - HCY + 2) / 8) * LY, true));
    if (hs === 'ponytail' && v === 4) limb('hair', HCX, HCY - 2.4, HCX, HCY + 7.2, 2.2, 1.4, 'hair', { gloss: true });
    if (hs === 'braids' && back) for (const lx of [-3.4, 3.4]) limb('hair', HCX + lx, HCY + 2, HCX + lx, HCY + 12, 1.6, 1.3, 'hair');
    if (hs === 'locs' && back) for (const lx of [-5.6, -2, 2, 5.6]) limb('hair', HCX + lx, HCY, HCX + lx * 1.05, HCY + 9.6, 1.5, 1.2, 'hair');
  }
  if (back) behindHead.forEach((f) => f());
  // ---- hats ----
  if (hat) hats(hat);
  if (D.earmuffs) for (const lx of [-7.6, 7.6]) { const p = place(lx, 0); if (p.d > -3) ell('hat', HCX + p.x * .95, HCY + .2, 1.9, 2.4, 'dark', { gloss: true }); }
  onHead.forEach((f) => f());
  if (D.pigeon) { const s2 = place(-7.6 * bw, .4); if (s2.d > -3 || v === 4) { ell('prop', tx + s2.x, topY - .6, 2.1, 1.7, 'pigeon', { gloss: true }); ell('prop', tx + s2.x + place(0, 1.6).x * .9 + (v === 0 || v === 4 ? -.6 : 0), topY - 2.6, 1.3, 1.3, 'pigeon', { gloss: true }); } }
  // ---- face, pixel by pixel ----
  const face = [];
  if (front && !D.noFace) { const ey = Math.round(OY + HCY - .2 + (D.eyeY || 0)), eyes = [-2.9, 2.9].map((lx) => place(lx, 6.3)).filter((p) => p.d > .8).map((p) => HCX + p.x * .86);
    const eyeH = D.eyes === 'closed' || D.eyes === 'squint' ? 1 : 2;
    eyes.forEach((x) => { const px = Math.round(OX + x); if (D.glasses === 'shades') { face.push([px - 1, ey, 'shade'], [px, ey, 'shade'], [px - 1, ey + 1, 'shade'], [px, ey + 1, 'shade']); return; } face.push([px, ey + (eyeH === 1 ? 1 : 0), 'eye']); if (eyeH === 2) face.push([px, ey + 1, 'eye']); if (D.brow) face.push([px, ey - 2, 'brow'], [px + (x > HCX ? 1 : -1), ey - 2 + (D.brow === 'stern' ? 1 : 0), 'brow']); if (D.lashes) face.push([px + (x > HCX ? 1 : -1), ey, 'eye']); });
    if (D.glasses && D.glasses !== 'shades') eyes.forEach((x) => { const px = Math.round(OX + x); for (const [a, b] of [[-1, -1], [0, -1], [1, -1], [x > HCX ? 2 : -2, 0]]) face.push([px + a, ey + b, 'frame']); face.push([px + (x > HCX ? -1 : 1), ey, 'lensF']); });
    if (D.glasses === 'shades' && eyes.length === 2) { const a = Math.round(OX + Math.min(...eyes)), b = Math.round(OX + Math.max(...eyes)); for (let x = a + 1; x < b - 1; x++) face.push([x, ey, 'shade']); }
    const m = place(0, 6.6); if (!D.beard || D.beard === 'goatee') { const mx = Math.round(OX + HCX + m.x * .82), my = Math.round(OY + HCY + 4.3); face.push([mx, my, 'mouth']); if (v === 0) face.push([mx - 1, my, 'mouth']); if (D.smile && v === 0) face.push([mx - 2, my - 1, 'mouth'], [mx + 1, my - 1, 'mouth']); }
    if (D.cheeks && v === 0) for (const x of eyes) face.push([Math.round(OX + x + (x > HCX ? 1 : -1)), ey + 3, 'cheek']);
    if (D.lines && eyes.length) face.push([Math.round(OX + eyes[eyes.length - 1] + 1), ey + 2, 'line']); }
  return { S, face };

  // ---------- hats ----------
  function hats(kind) { const hc = 'hat', h2 = 'hat2';
    const brimFwd = (len, w, yOff, mat = h2) => { const c = place(0, 5 + len * .4); if (c.d < 0 && back && v === 4) return; ell('hat', HCX + c.x * .9, HCY - 3 + (yOff || 0), Math.max(1.6, w * Math.abs(ca) + len * .5 * Math.abs(sa)), 1.4 - Math.abs(sa) * .3, mat, { flatY: true, clip: side ? (x) => x > HCX + 2.5 : null }); };
    const dome = (rx, ry, cut, mat = hc) => ell('hat', HCX, HCY - 3.2, rx, ry, mat, { clip: (x, y) => y < HCY - cut, gloss: true });
    if (kind === 'cap' || kind === 'capB') { const fwd = kind === 'cap'; const bd = place(0, fwd ? 7 : -7).d;
      if (bd < 0) brimFwdDir(fwd); dome(HRX + .5, 5.8, 2.8); rect('hat', HCX - HRX - .2, HCY - 3.9, HCX + HRX + .2, HCY - 2.9, 'hat2', { f: .3 }); if (bd >= 0) brimFwdDir(fwd);
      if (D.hat.badge && place(0, 6).d > 1) ell('hat', HCX + place(0, 6).x * .7, HCY - 6, 1.1, 1.1, 'badge', { f: .6 }); if (D.hat.button) ell('hat', HCX, HCY - 9, .9, .7, h2, { f: .5 }); }
    function brimFwdDir(fwd) { const z = fwd ? 1 : -1, c = place(0, z * 5.2), wid = 7 * Math.abs(ca) + 4.4 * Math.abs(sa); ell('hat', HCX + c.x * 1.05, HCY - 3.2 - (Math.abs(sa) > .9 ? .3 : 0), wid * (Math.abs(sa) > .9 ? 1 : .95), Math.abs(sa) > .9 ? 1.1 : 1.7 - Math.abs(sa) * .3, 'hat2', { flatY: true, clip: side ? (x) => (x - HCX) * c.x > 6 : null }); }
    if (kind === 'campaign') { ell('hat', HCX, HCY - 3.4, 10.6 * Math.max(.8, Math.abs(ca)) + 1.2 * Math.abs(sa), 1.8 - Math.abs(sa) * .5, hc, { flatY: true }); trap('hat', HCX, HCY - 11.6, HCY - 3.6, 3.6, 5.4, hc, { cr: 1.4 }); rect('hat', HCX - 5.3, HCY - 5, HCX + 5.3, HCY - 3.8, 'hat2', { f: .25 }); if (v === 0 || v === 4) { put('hat', (x, y) => Math.abs(x - HCX) < .5 && y < HCY - 9 && y > HCY - 11.8, [HCX - 1, HCY - 12, HCX + 1, HCY - 9], hc, () => .2); } }
    if (kind === 'captain' || kind === 'peaked') { if (place(0, 6).d >= 0 || v === 4) {} trap('hat', HCX, HCY - 9.4, HCY - 3, HRX + 1.8, HRX + .2, kind === 'captain' ? 'white' : hc, { cr: 1 }); rect('hat', HCX - HRX - .2, HCY - 4.6, HCX + HRX + .2, HCY - 3, h2, { f: .3 }); if (place(0, 6).d > 0) brimFwd(3, 5.6, -.4, 'dark'); if (place(0, 6).d > 1) ell('hat', HCX + place(0, 6).x * .8, HCY - 6.6, 1.3, 1, 'badge', { f: .6 }); }
    if (kind === 'beanie') { dome(HRX + .7, 7.2, 2); rect('hat', HCX - HRX - .7, HCY - 4.2, HCX + HRX + .7, HCY - 2, h2, { f: .45 }); if (D.hat.pom) ell('hat', HCX + place(0, -1).x, HCY - 10.6, 2, 1.9, h2, { gloss: true }); }
    if (kind === 'bucket') { trap('hat', HCX, HCY - 3.6, HCY - 1, HRX + 1.4, HRX + 3.6, h2, { cr: 0 }); dome(HRX + .9, 7.4, 3.2); }
    if (kind === 'straw') { ell('hat', HCX, HCY - 3.2, 11.4 * Math.max(.85, Math.abs(ca)) + .8, 2 - Math.abs(sa) * .5, hc, { flatY: true }); ell('hat', HCX, HCY - 5.4, HRX - .2, 5.4, hc, { clip: (x, y) => y < HCY - 3.4, gloss: true }); rect('hat', HCX - HRX + .4, HCY - 5.2, HCX + HRX - .4, HCY - 4, h2, { f: .4 }); }
    if (kind === 'hardhat') { dome(HRX + 1.3, 6.8, 1.8); ell('hat', HCX + place(0, 1.2).x, HCY - 1.9, HRX + 2.2, 1.4, hc, { flatY: true, dim: -.08 }); if (!side) put('hat', (x, y) => Math.abs(x - HCX - (tq ? 1.4 * (v === 1 ? 1 : -1) : 0)) < .7 && y < HCY - 2.4 && ((x - HCX) / (HRX + 1.3)) ** 2 + ((y - HCY + 2.4) / 6.8) ** 2 <= 1, [HCX - 2, HCY - 10, HCX + 2, HCY], h2, () => .62); }
    if (kind === 'helmetF') { // firefighter: tall dome, long back brim, a front shield
      const bb = place(0, -6); ell('hat', HCX + bb.x * .9, HCY - 1.8, 6.4 * Math.abs(ca) + 6 * Math.abs(sa) + .6, 1.5, hc, { flatY: true, dim: -.1 }); dome(HRX + 1.2, 8, 1.8); if (place(0, 7).d > 1) trap('hat', HCX + place(0, 7).x * .78, HCY - 9.6, HCY - 4.2, 1.6, 2.2, h2, { cr: .6 }); }
    if (kind === 'bike') { const p = place(0, -1.5); ell('hat', HCX + p.x * .5, HCY - 4.6, HRX + 1.2 + Math.abs(sa) * 1.6, 5.2, hc, { clip: (x, y) => y < HCY - 2.6, gloss: true }); for (let i = -1; i <= 1; i++) rect('hat', HCX + i * 2.4 - .4, HCY - 9, HCX + i * 2.4 + .4, HCY - 5.6, 'dark', { f: .3 }); if (side) ell('hat', HCX - 6.2, HCY - 4.6, 2.8, 1.6, hc, { dim: -.06 }); }
    if (kind === 'pith') { ell('hat', HCX, HCY - 3, 9.2 * Math.max(.85, Math.abs(ca)) + .6, 1.8, hc, { flatY: true }); dome(HRX + .4, 8.4, 3.2); rect('hat', HCX - HRX, HCY - 5, HCX + HRX, HCY - 3.6, h2, { f: .4 }); }
    if (kind === 'chef' || kind === 'paper') { if (kind === 'chef') { rect('hat', HCX - HRX + .6, HCY - 6.2, HCX + HRX - .6, HCY - 3.4, 'white', { f: .5 }); ell('hat', HCX, HCY - 10, HRX + .6, 4.6, 'white', { gloss: true }); }
      else trap('hat', HCX, HCY - 8.4, HCY - 3.6, (HRX - 1) * Math.max(.4, Math.abs(ca)) + .8, HRX + .2, 'white', { cr: .8 }); }
    if (kind === 'headwrap') { dome(HRX + 1.2, 8.6, 1.4); ell('hat', HCX + place(0, 2).x * .6, HCY - 10.2, 4.6, 3.2, hc, { gloss: true }); rect('hat', HCX - HRX - 1, HCY - 3.2, HCX + HRX + 1, HCY - 1.8, h2, { f: .4 }); }
    if (kind === 'visor') { rect('hat', HCX - HRX - .2, HCY - 4.6, HCX + HRX + .2, HCY - 3.2, hc, { f: .5 }); if (place(0, 6).d > -1) brimFwdDir(true); }
    if (kind === 'beret') ell('hat', HCX + place(-1.6, -1).x, HCY - 5.4, HRX + 1.4, 3.6, hc, { gloss: true, flatY: true });
    if (kind === 'bandana') { dome(HRX + .5, 6.6, 2.2); const k2 = place(0, -6.8); if (k2.d < 2 && v !== 0) { ell('hat', HCX + k2.x, HCY - 1.6, 1.6, 1.4, hc); limb('hat', HCX + k2.x, HCY - 1, HCX + k2.x * 1.12, HCY + 2.6, .9, .6, hc); } }
    if (kind === 'headset' || kind === 'headphones') { const ear = [-7.4, 7.4].map((lx) => place(lx, 0)); put('hat', (x, y) => { const r = Math.hypot((x - HCX) / (HRX + 1.3), (y - HCY + .6) / (HRY + 1.6)); return r > .87 && r < 1.02 && y < HCY - 1; }, [HCX - 10, HCY - 10, HCX + 10, HCY], 'dark', () => .4);
      ear.forEach((p) => { if (p.d > -3) ell('hat', HCX + p.x * .95, HCY + .4, kind === 'headphones' ? 2.1 : 1.6, 2.4, kind === 'headphones' ? hc : 'dark', { gloss: true }); });
      if (kind === 'headset') { const p = ear.find((q) => q.d > -3 && q.x <= 0) || ear[0], m = place(0, 6); if (p.d > -3 && v !== 4) limb('hat', HCX + p.x * .95, HCY + 1.8, HCX + m.x * .75, HCY + 4.4, .45, .45, 'dark', { f: .3 }); } }
    if (kind === 'welder') { const p = place(0, 3); ell('hat', HCX + p.x * .5, HCY - 7.4, HRX - .2, 3.2, 'dark', { gloss: true }); if (place(0, 5).d > 0) rect('hat', HCX + p.x * .6 - 1.6, HCY - 8.2, HCX + p.x * .6 + 1.6, HCY - 6.8, 'lens', { f: .6 }); rect('hat', HCX - HRX, HCY - 5, HCX + HRX, HCY - 4, 'dark', { f: .35 }); }
    if (kind === 'veil') { // beekeeper: brimmed hat, the mesh veil hangs at the sides and gathers at the collar (the face shows through)
      dome(HRX + .2, 6.6, 4.8, 'white'); const mesh = (x, y) => ((Math.floor(x) + Math.floor(y)) % 2 ? .4 : .55);
      for (const sd of [-1, 1]) put('hat', (x, y) => { const dx = (x - HCX) * sd; return dx > HRX - 1.6 && dx < HRX + 2.2 - (y - HCY) * .08 && y > HCY - 4.4 && y < HCY + 8.2; }, [HCX - 10, HCY - 4.4, HCX + 10, HCY + 8.2], 'mesh', mesh);
      if (back) put('hat', (x, y) => Math.abs(x - HCX) < HRX + 2 && y > HCY - 4.4 && y < HCY + 8.2, [HCX - 10, HCY - 4.4, HCX + 10, HCY + 8.2], 'mesh', mesh);
      trap('hat', HCX, HCY + 6.4, HCY + 8.6, HRX + 1.4, HRX + 2.2, 'mesh', { cr: 0, f: .45 }); ell('hat', HCX, HCY - 4.8, 12 * Math.max(.8, Math.abs(ca)) + .6, 1.7, 'hat', { flatY: true }); }
    if (kind === 'pigeon') { const p = place(-7.4, 0); acc(onHead, () => {}); }
    if (kind === 'goggles') { rect('hat', HCX - HRX - .3, HCY - 4.4, HCX + HRX + .3, HCY - 3.4, 'dark', { f: .3 }); const p = place(0, 6.2); if (p.d > 0) for (const lx of [-2.4, 2.4]) { const q = place(lx, 6.2); ell('hat', HCX + q.x * .9, HCY - 4.8, 1.5, 1.2, 'lens', { gloss: true }); } }
    if (kind === 'tiara' || kind === 'band') rect('hat', HCX - HRX + .4, HCY - 6.4, HCX + HRX - .4, HCY - 5.4, hc, { f: .6 });
  }
  // ---------- props ----------
  function propsBehind() { const p = D.prop;
    if (D.pack) { const b = place(0, -5.4); if (b.d < 0 || v === 4) {} if (b.d < 0) ell('pack', tx + b.x * .9, Y(-25), 4.2 * Math.max(.5, Math.abs(ca)) + .8, 5.4, 'pack'); }
    if (D.cape) { const b = place(0, -4.6); if (b.d < 0) trap('pack', tx + b.x * .8, topY, Y(-12), sh, sh + 2.4, 'cape', { cr: 1 }); }
  }
  function propsBody() {
    if (D.pack) { const b = place(0, -5.4); if (b.d >= 0) ell('pack', tx + b.x * .9, Y(-25), 4.4 * W, 5.4, 'pack'); else if (v !== 2) for (const lx of [-3, 3]) { const q = place(lx, 3); if (q.d > 0) limb('torso', tx + q.x, topY + .4, tx + q.x * .95, Y(-22.6), .6, .6, 'pack', { f: .3 }); } }
    if (D.cape && back) trap('pack', tx, topY, Y(-12), sh, sh + 2.4, 'cape', { cr: 1 });
    if (D.mailbag) { const p = place(5.4 * bw, .6), sideOK = p.d > -3; limb('torso', tx + place(-4.6, 3).x, topY + .4, tx + place(4.6, 3).x, botY - 1.4, .6, .6, 'strap', { f: .3 }); if (sideOK) trap('prop', tx + p.x, botY - 3.4, botY + 2.6, 2.6, 2.8, 'bag', { cr: .8 }); }
  }
  function propsHand() { const p = D.prop, a = arms.find((q) => q.g === 'armR'); if (!p || a.hx == null) return; const f = place(0, 1).x, hx0 = a.hx, hy0 = a.hy, vis = a.hd > -2 || twoSided;
    const out = Math.sign(hx0 - tx) || (f >= 0 ? -1 : 1), G = Y(-.4);
    // long things planted by the side or held up: they change the outline from every angle
    if (p === 'rod') { limb('prop', hx0, hy0 + 2.4, hx0 + out * 7 + f * 3, Y(-60), .6, .4, 'wood', { f: .45 }); limb('prop', hx0 + out * 7 + f * 3, Y(-60), hx0 + out * 8.4 + f * 3, Y(-46), .2, .2, 'line', { f: .8 }); ell('prop', hx0 + out * .3, hy0 + 1.6, 1, 1, 'metal', { f: .5 }); return; }
    if (p === 'oar') { const x = hx0 + out * 1.6; limb('prop', x, G, x, Y(-49), .6, .6, 'wood', { f: .5 }); ell('prop', x, Y(-50), 1.9, 4.6, 'prop2', { flatY: true }); return; }
    if (p === 'broom' || p === 'rake' || p === 'mop') { const bx = hx0 + out * 3.4; limb('prop', hx0 - out * .8, hy0 - 9, bx, G - 2, .5, .5, 'wood', { f: .45 }); if (p === 'broom') trap('prop', bx, G - 4.6, G, 1.4, 3, 'straw', { cr: .2 }); if (p === 'mop') ell('prop', bx, G - 1.4, 3.2, 1.6, 'white'); if (p === 'rake') { rect('prop', bx - 3, G - 2.6, bx + 3, G - 1.8, 'metal', { f: .4 }); for (let i = -3; i <= 3; i += 1.5) rect('prop', bx + i - .2, G - 1.8, bx + i + .2, G - .4, 'metal', { f: .4 }); } return; }
    if (p === 'cane') { limb('prop', hx0 + out * .6, hy0 - .4, hx0 + out * 1.2, G, .55, .55, 'wood', { f: .45 }); limb('prop', hx0 - out * .4, hy0 - .8, hx0 + out * .8, hy0 - .8, .55, .55, 'wood', { f: .45 }); return; }
    if (p === 'stop') { limb('prop', hx0, hy0 + 1.6, hx0, hy0 - 9, .45, .45, 'metal', { f: .5 }); ell('prop', hx0, hy0 - 12, 3.4, 3.4, 'red', { f: .5 }); rect('prop', hx0 - 2.2, hy0 - 12.4, hx0 + 2.2, hy0 - 11.6, 'white', { f: .8 }); return; }
    if (p === 'flag') { limb('prop', hx0, hy0 + 1.6, hx0, hy0 - 10, .4, .4, 'wood', { f: .45 }); rect('prop', hx0, hy0 - 10, hx0 + out * 5, hy0 - 6.4, 'flagc', { f: .6 }); return; }
    if (p === 'skate') { limb('prop', hx0 + out * 1.4, hy0 - 6, hx0 + out * 1.4, hy0 + 5, 1.3, 1.3, 'deck', { f: .5 }); ell('prop', hx0 + out * 1.4, hy0 - 4.6, .8, .8, 'dark'); ell('prop', hx0 + out * 1.4, hy0 + 3.6, .8, .8, 'dark'); return; }
    if (p === 'lantern') { limb('prop', hx0, hy0, hx0, hy0 + 2.2, .3, .3, 'dark', { f: .3 }); trap('prop', hx0, hy0 + 2.2, hy0 + 6, 1.4, 1.6, 'lamp', { cr: .5, f: .8 }); return; }
    if (p === 'bucket') { trap('prop', hx0, hy0 + 1, hy0 + 5.2, 2.6, 2.1, 'metal', { cr: .4 }); return; }
    if (p === 'bag') { trap('prop', hx0, hy0 + .6, hy0 + 5, 2.6, 3, 'bag', { cr: .8 }); return; }
    if (p === 'leash') { limb('prop', hx0, hy0 + .6, hx0 + out * 6, G - 1, .3, .3, 'red', { f: .5 }); return; }
    if (!vis) return;
    // held things sit at the hand, pushed a little outward so they read beside the body
    const hx1 = hx0 + (twoSided ? out * 1.4 : f * .6);
    const P = (dx, dy) => [hx1 + dx, hy0 + dy];
    if (p === 'coffee') { ell('prop', hx1 + f * .4, hy0 - 1.6, 1.35, 2, (x, y) => y < hy0 - 3 ? 'lid' : 'cup', { flatY: true }); }
    if (p === 'pot') { ell('prop', hx1 + f * 1.2, hy0 + 1.6, 2.2, 2.4, 'glassPot', { gloss: true }); rect('prop', hx1 + f * 1.2 - 1.4, hy0 - 1.2, hx1 + f * 1.2 + 1.4, hy0 - .2, 'dark'); }
    if (p === 'clipboard') { rect('prop', hx1 - 1.8 + f * 1.2, hy0 - 5.2, hx1 + 1.8 + f * 1.2, hy0 - .2, 'wood', { f: .5 }); rect('prop', hx1 - 1.3 + f * 1.2, hy0 - 4.6, hx1 + 1.3 + f * 1.2, hy0 - .8, 'paper', { f: .7 }); }
    if (p === 'wrench') limb('prop', hx1, hy0, hx1 + f * 1.6, hy0 + 5.6, .6, .6, 'metal', { f: .6 });
    if (p === 'gloves') { ell('prop', hx1, hy0 + .4, 2.3, 2.4, 'glove', { gloss: true }); }
    if (p === 'basket') { trap('prop', hx1 + f * 1.4, hy0 - 2.6, hy0 + 2, 4.6, 4, 'basket', { cr: .5 }); ell('prop', hx1 + f * 1.4, hy0 - 3.2, 3.4, 1.4, 'white', { gloss: true }); }
    if (p === 'books') { rect('prop', hx1 - 2.4 + f, hy0 - 3.8, hx1 + 2.4 + f, hy0 - 2.4, 'red', { f: .5 }); rect('prop', hx1 - 2 + f, hy0 - 2.4, hx1 + 2 + f, hy0 - 1, 'book2', { f: .5 }); rect('prop', hx1 - 2.2 + f, hy0 - 1, hx1 + 2.2 + f, hy0 + .4, 'book3', { f: .5 }); }
    if (p === 'laptop') { rect('prop', hx1 - 2.8 + f, hy0 - 2.4, hx1 + 2.8 + f, hy0 - .6, 'metal', { f: .55 }); }
    if (p === 'tongs' || p === 'ladle' || p === 'spatula') { limb('prop', hx1, hy0, hx1 + f * 2.4, hy0 - 4.8, .45, .45, 'metal', { f: .6 }); if (p === 'ladle') ell('prop', hx1 + f * 2.8, hy0 - 5.6, 1.4, 1.1, 'metal', { gloss: true }); if (p === 'spatula') rect('prop', hx1 + f * 2.4 - 1, hy0 - 7, hx1 + f * 2.4 + 1, hy0 - 4.8, 'metal', { f: .6 }); }
    if (p === 'flashlight') { limb('prop', hx1, hy0 + .4, hx1 + f * 3.4, hy0 + 1.2, .8, 1, 'dark', { f: .35 }); ell('prop', hx1 + f * 3.8, hy0 + 1.2, .8, .9, 'lens', { f: .9 }); }
    if (p === 'medbag') { trap('prop', hx1, hy0 + 1, hy0 + 5, 3.2, 3.4, 'bag', { cr: .8 }); rect('prop', hx1 - .4, hy0 + 1.8, hx1 + .4, hy0 + 4.2, 'white', { f: .8 }); rect('prop', hx1 - 1.2, hy0 + 2.6, hx1 + 1.2, hy0 + 3.4, 'white', { f: .8 }); }
    if (p === 'football') ell('prop', hx1 + f * 1, hy0 - .6, 2.2, 1.4, 'leather', { gloss: true });
    if (p === 'whistle') {}
    if (p === 'binoculars') { rect('prop', hx1 - 1.6, hy0 - 2.6, hx1 + 1.6, hy0 - .2, 'dark', { f: .4 }); }
    if (p === 'box') { rect('prop', hx1 - 3.2 + f * 1.4, hy0 - 4.4, hx1 + 3.2 + f * 1.4, hy0 + .6, 'card', { f: .5 }); rect('prop', hx1 - 3.2 + f * 1.4, hy0 - 4.4, hx1 + 3.2 + f * 1.4, hy0 - 3.6, 'card', { f: .7 }); }
    if (p === 'donuts') { rect('prop', hx1 - 3 + f * 1.4, hy0 - 3.2, hx1 + 3 + f * 1.4, hy0 + .4, 'pinkbox', { f: .55 }); }
    if (p === 'icecream') { limb('prop', hx1, hy0 - .4, hx1 + f * .2, hy0 - 3.6, .4, 1.2, 'cone', { f: .55 }); ell('prop', hx1 + f * .2, hy0 - 4.6, 1.6, 1.4, 'scoop', { gloss: true }); }
    if (p === 'chess') { rect('prop', hx1 - 2.6 + f, hy0 - 2.4, hx1 + 2.6 + f, hy0 + .4, 'wood', { f: .55 }); }
    if (p === 'bin') { trap('prop', hx1 + f * 2, hy0 - 3, hy0 + 3, 3.4, 3, 'bin', { cr: .6 }); }
    if (p === 'gavel') { limb('prop', hx1, hy0, hx1 + f * 1.6, hy0 - 3.6, .4, .4, 'wood', { f: .4 }); limb('prop', hx1 + f * 1.6 - 1.4, hy0 - 3.8, hx1 + f * 1.6 + 1.4, hy0 - 3.8, .9, .9, 'wood', { f: .5 }); }
    if (p === 'mic') { limb('prop', hx1, hy0, hx1 + f * .4, hy0 - 2.6, .4, .5, 'dark', { f: .4 }); ell('prop', hx1 + f * .4, hy0 - 3.2, .9, .9, 'metal', { gloss: true }); }
    if (p === 'plant') { trap('prop', hx1 + f, hy0 - 1, hy0 + 2.6, 1.8, 1.4, 'pot', { cr: .3 }); ell('prop', hx1 + f, hy0 - 2.6, 2.6, 2.2, 'leaf', { gloss: true }); }
    if (p === 'phone') rect('prop', hx1 - .7, hy0 - 2.6, hx1 + .7, hy0 - .2, 'dark', { f: .35 });
    if (p === 'folder') rect('prop', hx1 - 2.2 + f, hy0 - 3.4, hx1 + 2.2 + f, hy0 + .2, 'manila', { f: .55 });
    if (p === 'tablet') rect('prop', hx1 - 2 + f, hy0 - 3.2, hx1 + 2 + f, hy0 + .2, 'dark', { f: .4 });
  }
}

// ---------- rasterize and paint ----------
function render(D, v, mir, ph, mv) {
  const { S, face } = figure(D, v, mir, ph, mv), px = new Array(SW * SH).fill(null), sc = D.scale || 1;
  // only the figure's own box is sampled, and each row/pixel only tests the shapes whose box reaches it
  let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; for (const q of S) { const b = q.bb; if (b[0] < bx0) bx0 = b[0]; if (b[1] < by0) by0 = b[1]; if (b[2] > bx1) bx1 = b[2]; if (b[3] > by1) by1 = b[3]; }
  const toPx = (u) => u * sc, ySt = Math.max(0, Math.floor(toPx(by0) + OY) - 1), yEn = Math.min(SH - 1, Math.ceil(toPx(by1) + OY) + 1);
  const xa = mir ? -bx1 : bx0, xb = mir ? -bx0 : bx1, xSt = Math.max(0, Math.floor(toPx(xa) + OX) - 1), xEn = Math.min(SW - 1, Math.ceil(toPx(xb) + OX) + 1);
  const NS = SS * SS, CAND = new Int16Array(S.length), cnt = new Int32Array(S.length), sxs = new Float32Array(S.length), sys = new Float32Array(S.length), mats = new Array(S.length), seen = [];
  for (let y = ySt; y <= yEn; y++) { const yA = ((y - OY) / sc), yB = ((y + 1 - OY) / sc), row = []; for (let n = S.length - 1; n >= 0; n--) { const b = S[n].bb; if (b[3] >= yA && b[1] <= yB) row.push(n); }
    if (!row.length) continue;
    for (let x = xSt; x <= xEn; x++) { let xA = ((x - OX) / sc), xB = ((x + 1 - OX) / sc); if (mir) { const t2 = -xA; xA = -xB; xB = t2; }
      let nc = 0; for (const n of row) { const b = S[n].bb; if (b[2] >= xA && b[0] <= xB) CAND[nc++] = n; } if (!nc) continue;
      let cov = 0; seen.length = 0; const extra = [];
      for (let j = 0; j < SS; j++) { const Yy = ((y * SS + j + .5) / SS - OY) / sc; for (let i = 0; i < SS; i++) { let X = ((x * SS + i + .5) / SS - OX) / sc; if (mir) X = -X;
        for (let ci = 0; ci < nc; ci++) { const n = CAND[ci], q = S[n], b = q.bb; if (X < b[0] || X > b[2] || Yy < b[1] || Yy > b[3] || !q.test(X, Yy)) continue; cov++;
          if (typeof q.mat === 'function') { const m = q.mat(X, Yy); const key = n + '|' + m; let e = extra.find((z) => z.key === key); if (!e) extra.push(e = { key, n, m, c: 0, sx: 0, sy: 0 }); e.c++; e.sx += X; e.sy += Yy; }
          else { if (!cnt[n]) seen.push(n); cnt[n]++; sxs[n] += X; sys[n] += Yy; } break; } } }
      const ents = extra; for (const n of seen) { ents.push({ n, m: S[n].mat, c: cnt[n], sx: sxs[n], sy: sys[n] }); cnt[n] = 0; sxs[n] = 0; sys[n] = 0; }
      if (cov < NS * .45) continue;
      // the commonest shape wins; small accents (badges, patches, props) win with less coverage
      let win = null, wn = -1; for (const e of ents) { const q = S[e.n], small = /badge|patch|buckle|lens|strip|logo|top2|lanyard|strap|red|white|chev/.test(e.m) || q.g === 'prop'; const sc2 = small && e.c >= NS * .3 ? 1e3 + e.c + (q.g === 'prop' ? 50 : 0) : e.c; if (sc2 > wn) { wn = sc2; win = e; } }
      const q = S[win.n]; px[y * SW + x] = { g: q.g, m: win.m, f: q.tone(win.sx / win.c, win.sy / win.c), d: q.layer }; } }
  const at = (x, y) => x < 0 || y < 0 || x >= SW || y >= SH ? null : px[y * SW + x];
  const CAST = { hair: ['head'], hat: ['head', 'hair'], head: ['neck', 'torso'], neck: ['torso'], torso: ['hips'], armR: ['torso', 'hips'], armL: ['torso', 'hips'], hips: ['legL', 'legR'] };
  px.forEach((c, k) => { if (!c) return; const x = k % SW, y = (k / SW) | 0;
    for (const [ax, ay] of [[0, -1], [mir ? 1 : -1, -1], [0, -2]]) { const q = at(x + ax, y + ay); if (q && CAST[q.g] && CAST[q.g].includes(c.g)) { c.f = Math.min(c.f, .22); break; } } });
  face.forEach(([x, y, m]) => { const fx = mir ? SW - 1 - x : x, c = at(fx, y); if (c || m === 'frame') px[y * SW + fx] = { g: 'face', m, f: .3, d: 999, under: c && c.m }; });
  return px;
}
const NBX = [-1, 1, 0, 0], NBY = [0, 0, -1, 1], SKIPCUT = new Set(['head', 'hair', 'hat', 'neck', 'hairB']);
function paint(px, cols) {
  const C = Object.assign({}, DEF, cols), out = new Array(SW * SH).fill(null), at = (x, y) => x < 0 || y < 0 || x >= SW || y >= SH ? null : px[y * SW + x];
  const tone = new Int8Array(SW * SH); for (let k = 0; k < px.length; k++) { const c = px[k]; if (c) tone[k] = Math.max(1, Math.min(8, 1 + Math.round(c.f * 7))); }
  // tidy: a lone tone inside its material takes its neighbours' tone (no stray specks)
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const k = y * SW + x, c = px[k]; if (!c || c.g === 'face') continue; let n = 0, t0 = -1, same = true;
    for (let i = 0; i < 4; i++) { const q = at(x + NBX[i], y + NBY[i]); if (!q || q.m !== c.m) continue; const tq = tone[(y + NBY[i]) * SW + x + NBX[i]]; if (t0 < 0) t0 = tq; else if (tq !== t0) same = false; n++; }
    if (n >= 3 && same && t0 !== tone[k]) tone[k] = t0; }
  const RC = new Map(), col = (m) => C[m] || (m === 'top2' ? C.top2 || C.top : m === 'hat2' ? C.hat2 || C.hat : m === 'beard' ? C.beard || C.hair : m === 'glove' ? C.glove || '#b23a2a' : m === 'coat' ? C.coat || '#f4f6f8' : '#ff00ff');
  const rampOf = (m) => { let r = RC.get(m); if (!r) RC.set(m, r = ramp(col(m))); return r; };
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const k = y * SW + x, c = px[k]; if (!c) continue;
    if (c.g === 'face') { out[k] = c.m === 'eye' ? ramp(C.eye)[2] : c.m === 'brow' ? ramp(C.brow || C.beard || C.hair)[2] : c.m === 'shade' ? ramp('#14161c')[3] : c.m === 'frame' ? ramp(C.frame || '#22252c')[3] : c.m === 'cheek' ? ramp(C.skin)[5].map((v, i) => Math.round(v * .7 + [235, 120, 110][i] * .3)) : c.m === 'line' ? ramp(C.skin)[3] : c.m === 'lensF' ? ramp(C.skin)[6] : ramp(C.skin)[2]; continue; }
    const R = rampOf(c.m); let t = tone[k];
    // a line where a part overlaps another part (arms over the body, legs over each other, held things)
    if (!SKIPCUT.has(c.g)) for (let i = 0; i < 4; i++) { const q = at(x + NBX[i], y + NBY[i]); if (!q || q.g === c.g || q.g === 'face' || q.d <= c.d) continue; const qa = q.g.charCodeAt(0) === 97 && q.g.startsWith('arm'), ca2 = c.g.charCodeAt(0) === 97 && c.g.startsWith('arm'); if (qa !== ca2 || (c.g.startsWith('leg') && q.g.startsWith('leg')) || q.g === 'prop') { t = Math.max(1, t - 2); break; } }
    let cl = R[t]; const eL = !at(x - 1, y), eR = !at(x + 1, y), eU = !at(x, y - 1), eD = !at(x, y + 1);
    if (eR || eD) cl = R[0]; else if (eL || eU) cl = R.lit(t);
    out[k] = cl; }
  return out;
}
// directions: 0 front, 1 front-right, 2 right, 3 back-right, 4 back, then the mirrored left ones
export const DIRS = [['Front', 0, false], ['Front-right', 1, false], ['Right', 2, false], ['Back-right', 3, false], ['Back', 4, false], ['Back-left', 3, true], ['Left', 2, true], ['Front-left', 1, true]];
export function pixels(D, d, ph, mv) { const [, v, mir] = DIRS[d]; return paint(render(D, v, mir, ph || 0, !!mv), D.cols); }
export function mask(D, d) { const [, v, mir] = DIRS[d]; return render(D, v, mir, 0, false).map((c) => c ? 1 : 0); }
export function sprite(D, d, ph, mv) { const out = pixels(D, d, ph, mv), c = document.createElement('canvas'); c.width = SW; c.height = SH; const g = c.getContext('2d'), id = g.createImageData(SW, SH); out.forEach((col, k) => { if (col) id.data.set([col[0], col[1], col[2], 255], k * 4); }); g.putImageData(id, 0, 0); return c; }

// ---------- the game's look options (world.js person()) to a design ----------
// Same random picks as the detailed drawing (seeded by o.ph), so every citizen keeps their outfit.
const JACK = ['#2f3b4c', '#5a3e2b', '#3b5249', '#7a2e2e', '#1f2937', '#4b4f8a', '#6b5b3e'];
const HS = ['short', 'buzz', 'swoop', 'bun', 'long', 'curly', 'bob', 'bald', 'afro'];
export function fromLook(o) {
  const ph = o.ph || 0, rr = (k) => { const v = Math.sin((ph + 1.37) * (12.9898 + k * 7.233)) * 43758.5453; return v - Math.floor(v); };
  const K = o.kit || (o.officer ? { shirt: '#22355e', pants: '#1b2a4a', hat: 'cap', hatCol: '#16213d', patch: '#f5b800' } : null), civ = !K;
  const AG = o.age, elder = AG === 'elder', senior = AG === 'senior' || elder;
  const top = civ ? (o.top || ['tee', 'tee', 'jacket', 'hoodie', 'dress', 'tank', 'button', 'tee'][Math.floor(rr(2) * 8)]) : 'uniform';
  const acc = civ ? (o.acc || ['none', 'none', 'backpack', 'bag', 'phone', 'coffee', 'shopping', 'shades', 'none'][Math.floor(rr(3) * 9)]) : 'none';
  const pants = K ? K.pants : o.pants || '#3b4a5c', shirt = K ? K.shirt : o.shirt || '#c0392b', skin = o.skin || '#e0b48f';
  const old = civ && !o.kid && (o.old != null ? o.old : rr(13) < .13);
  const hair = senior && !o.hair ? (elder ? '#eef0f3' : '#c4c9d1') : old ? ['#d1d5db', '#e5e7eb', '#9ca3af'][Math.floor(rr(14) * 3)] : o.hair || '#2b1d14', jacket = JACK[Math.floor(rr(4) * JACK.length)];
  const hs = o.hs != null ? o.hs : Math.floor(rr(5) * 9);
  const shoe = K ? (K.boots || '#111216') : o.shoes || ['#16181d', '#eeeeee', '#5d4037', '#16181d', '#b91c1c'][Math.floor(rr(6) * 5)];
  const bare = (K && K.shorts) || (civ && top !== 'dress' && rr(7) < .12);
  const bwv = o.build === 'heavy' ? 1.16 : o.build === 'slim' ? .9 : civ ? .92 + rr(1) * .22 : 1;
  const D = { hair: HS[hs % 9], age: elder ? 'elder' : senior ? 'senior' : o.kid ? 'teen' : null, build: bwv > 1.08 ? 'heavy' : bwv < .95 ? 'slim' : 'avg', cols: { skin, hair, pants, shoe, top: shirt } };
  if (o.kid && !o.s) D.scale = .78; else if (AG === 'teen') D.scale = .94; // o.s (overall size) is applied when the sprite is drawn, not here
  if (o.glasses) D.glasses = 'square';
  if (o.beard) D.beard = { full: 'full', mustache: 'stache', goatee: 'goatee' }[o.beard], D.cols.beard = o.beardCol || (senior && !o.hair ? '#e5e7eb' : hair);
  if (bare) D.shorts = 1;
  if (K) { D.top = { kind: 'uniform', cuff: 0 }; D.cols.top2 = shadeHex(shirt, .78);
    const cop = !!(K.patch && !K.plain && !K.shorts && !K.apron); if (cop) { D.badge = 1; D.holster = 1; D.radio = 1; } if (K.patch === '#ffffff') { D.collar = 1; D.top.kind = 'shirt'; }
    if (K.vest) { D.vest = 1; D.cols.vest = K.vest === true || K.vest === 'xxxl' ? '#d4ff3a' : K.vest; } if (K.apron) { D.apron = 1; D.cols.apron = K.apron; } if (K.tie) { D.tie = 1; D.cols.tie = K.tie; D.top.kind = 'shirt'; } if (K.lanyard) { D.lanyard = 1; D.cols.lanyard = K.lanyard; }
    if (K.boots) D.boots = 1; if (K.camelbak) { D.pack = 1; D.cols.pack = '#1f2937'; }
    const hk = K.hat; if (hk && hk !== 'none') { const m = { cap: 'cap', campaign: 'campaign', helmet: 'hardhat', headset: 'headset', boonie: 'bucket', sweatband: 'band' }[hk] || 'cap'; D.hat = { kind: m, badge: hk === 'cap' && cop }; D.cols.hat = K.hatCol || (hk === 'helmet' ? '#f5d000' : hk === 'campaign' ? '#6b4a2a' : '#1b2746'); D.cols.hat2 = shadeHex(D.cols.hat, .7); } }
  else { const tk = { tee: { kind: 'tee', sleeve: .42 }, dress: { kind: 'dress', sleeve: .42 }, tank: { kind: 'tank' }, jacket: { kind: 'jacket' }, hoodie: { kind: 'hoodie' }, button: { kind: 'shirt' } }[top];
    D.top = tk; if (top === 'jacket') { D.cols.top = jacket; D.cols.top2 = shirt; } if (top === 'hoodie') { D.cols.top = shadeHex(shirt, .85); if (rr(11) < .4) D.hood = 1; } if (top === 'button') D.placket = 1, D.cols.top2 = shadeHex(shirt, .8);
    if (acc === 'backpack') { D.pack = 1; D.cols.pack = shadeHex(jacket, 1.25); } if (acc === 'bag') { D.bag = 1; D.cols.strap = '#3b2a1c'; } if (acc === 'phone') D.prop = 'phone'; if (acc === 'coffee') D.prop = 'coffee'; if (acc === 'shades') D.glasses = 'shades';
    if (acc === 'shopping') { D.prop = 'bag'; D.cols.bag = ['#f5f5f5', '#c0392b', '#2980b9', '#f5b800'][Math.floor(rr(8) * 4)]; }
    const hat = rr(9) < .14 ? 'cap' : rr(9) < .2 ? 'beanie' : rr(9) < .25 ? 'straw' : null; if (hat) { D.hat = { kind: hat }; D.cols.hat = ['#1f2937', '#b91c1c', '#1d4ed8', '#f5f5f5', '#166534'][Math.floor(rr(10) * 5)]; if (hat === 'straw') D.cols.hat = ['#f5e6c8', '#e9d5a1', '#fde68a', '#f5f5f5'][Math.floor(rr(15) * 4)]; D.cols.hat2 = shadeHex(D.cols.hat, .72); }
    if (elder && o.cane !== false) D.prop = D.prop || 'cane'; }
  if (o.wave) D.pose = 'up'; if (o.sit) D.sit = 1;
  // rank you can see: chevrons (ranks 1, 3, 5), a collar pin (6) and a gold cap band (8)
  if (o.rank) { D.chev = o.rank >= 5 ? 3 : o.rank >= 3 ? 2 : 1; if (o.rank >= 6) D.pin = 1; if (o.rank >= 8 && D.hat) { D.cols = D.cols || {}; D.cols.hat2 = '#b8892a'; } }
  return D;
}
function shadeHex(h, k) { const [r, g, b] = hx(h); const f = (v) => Math.max(0, Math.min(255, Math.round(k > 1 ? v + (255 - v) * (k - 1) : v * k))); return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join(''); }
// RGBA pixels for one pose, for an ImageData (also used by the worker)
export function rgba(D, d, ph, mv, ss) { const k0 = SS; if (ss) SS = ss; let out; try { out = pixels(D, d, ph, mv); } finally { SS = k0; } const a = new Uint8ClampedArray(SW * SH * 4); out.forEach((c, k) => { if (c) { a[k * 4] = c[0]; a[k * 4 + 1] = c[1]; a[k * 4 + 2] = c[2]; a[k * 4 + 3] = 255; } }); return a; }

// ---------- pixelize: turn a smooth drawing (vehicles, props) into pixel art that matches the people ----------
// src: RGBA of the drawing at k times the target size. Each target pixel takes the commonest color of its block
// (crisp edges, no blur) if at least half the block is covered; colors are grouped into a few materials, every pixel
// snaps to its material's hue-shifted ramp, lone pixels are tidied, and the outline is darker on the bottom and right.
export function pixelize(src, w, h, k, K = 12) {
  const W2 = w * k, cols = new Array(w * h).fill(null), KS = new Int32Array(k * k), KN = new Int32Array(k * k), KR = new Float32Array(k * k * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let nk = 0, cov = 0;
    for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) { const p = ((y * k + j) * W2 + x * k + i) * 4; if (src[p + 3] < 110) continue; cov++; const key = (src[p] >> 3) << 10 | (src[p + 1] >> 3) << 5 | (src[p + 2] >> 3); let e = 0; while (e < nk && KS[e] !== key) e++; if (e === nk) { KS[e] = key; KN[e] = 0; KR[e * 3] = KR[e * 3 + 1] = KR[e * 3 + 2] = 0; nk++; } KN[e]++; KR[e * 3] += src[p]; KR[e * 3 + 1] += src[p + 1]; KR[e * 3 + 2] += src[p + 2]; }
    if (cov < k * k * .5) continue; let be = 0; for (let e = 1; e < nk; e++) if (KN[e] > KN[be]) be = e; const n = KN[be]; cols[y * w + x] = [KR[be * 3] / n, KR[be * 3 + 1] / n, KR[be * 3 + 2] / n]; }
  const pts = []; cols.forEach((c, i) => { if (c) pts.push(i); }); if (!pts.length) return { cols, out: cols };
  const L = (c) => .299 * c[0] + .587 * c[1] + .114 * c[2], d2 = (a, b) => 2 * (a[0] - b[0]) ** 2 + 4 * (a[1] - b[1]) ** 2 + 3 * (a[2] - b[2]) ** 2;
  // work on the distinct colors (a few dozen), weighted by how many pixels use them
  const UM = new Map(), U = [], uOf = new Int16Array(w * h).fill(-1);
  for (const p of pts) { const c = cols[p], key = (c[0] >> 2) << 12 | (c[1] >> 2) << 6 | (c[2] >> 2); let u = UM.get(key); if (u == null) { u = U.length; UM.set(key, u); U.push({ c, n: 0 }); } U[u].n++; uOf[p] = u; }
  // seeds: spread across brightness, then the most distinct leftover colors (light bars, tail lights, stripes keep their own material)
  const KK = Math.min(K, U.length), byL = U.slice().sort((a, b) => L(a.c) - L(b.c)); let cen = []; const nL = Math.ceil(KK * .6); for (let i = 0; i < nL; i++) cen.push(byL[Math.floor((i + .5) / nL * byL.length)].c.slice());
  while (cen.length < KK) { let bu = null, bd = -1; for (const u of U) { let m = 1e12; for (const c of cen) { const d = d2(u.c, c); if (d < m) m = d; } if (m > bd) { bd = m; bu = u; } } if (bd < 2500) break; cen.push(bu.c.slice()); }
  const ul = new Int16Array(U.length);
  for (let it = 0; it < 8; it++) { const acc = cen.map(() => [0, 0, 0, 0]); let moved = false; U.forEach((u, ui) => { let bi = 0, bd = 1e12; for (let i = 0; i < cen.length; i++) { const d = d2(u.c, cen[i]); if (d < bd) { bd = d; bi = i; } } if (ul[ui] !== bi) moved = true; ul[ui] = bi; const a = acc[bi]; a[0] += u.c[0] * u.n; a[1] += u.c[1] * u.n; a[2] += u.c[2] * u.n; a[3] += u.n; }); acc.forEach((a, i) => { if (a[3]) cen[i] = [a[0] / a[3], a[1] / a[3], a[2] / a[3]]; }); if (!moved && it) break; }
  // each color snaps to the nearest step of its own material's ramp
  const hexOf = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const R = cen.map((c) => ramp(hexOf(c))), ut = new Int8Array(U.length);
  U.forEach((u, ui) => { const r = R[ul[ui]]; let bi = 1, bd = 1e12; for (let i = 1; i < 9; i++) { const d = d2(u.c, r[i]); if (d < bd) { bd = d; bi = i; } } ut[ui] = bi; });
  const lab = new Int16Array(w * h).fill(-1), tone = new Int8Array(w * h); for (const p of pts) { lab[p] = ul[uOf[p]]; tone[p] = ut[uOf[p]]; }
  const at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && lab[y * w + x] >= 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const p = y * w + x; if (lab[p] < 0) continue; const l0 = lab[p - 1], t0 = tone[p - 1]; if (l0 < 0 || lab[p + 1] !== l0 || lab[p - w] !== l0 || lab[p + w] !== l0 || tone[p + 1] !== t0 || tone[p - w] !== t0 || tone[p + w] !== t0) continue; if (lab[p] !== l0 || tone[p] !== t0) { lab[p] = l0; tone[p] = t0; } }
  const out = new Array(w * h).fill(null);
  for (const p of pts) { const x = p % w, y = (p / w) | 0, r = R[lab[p]]; let c = r[tone[p]];
    if (!at(x + 1, y) || !at(x, y + 1)) c = r[0]; else if (!at(x - 1, y) || !at(x, y - 1)) c = r.lit(tone[p] + 1);
    out[p] = c; }
  return { out };
}
