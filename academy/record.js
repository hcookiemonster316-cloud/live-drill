// A city that shows your record. Each block's trust in you (-10..10, built call by call) now shows on the street:
// blocks that trust you put out flowers and benches, blocks you've burned board up windows and stop picking up the
// trash; people on a block that trusts you wave when you go by, and on one that doesn't they turn away. A block that
// used to be trouble and now trusts you throws a block party and asks you to stop by.
const SIDE = [1.5, 2.5, 6.5, 7.5]; // front sidewalk spots on a block, clear of the door (x+4) and the info point (x+6)
const FLOWER = ['#e84a5f', '#f5b800', '#c084fc', '#fb923c'];

export function installRecord(H) {
  const S = H.S;
  const BT = (did) => ((S.btrust || {})[did] || {});
  const keyAt = (x, y) => { const bx = Math.floor((x - 2) / 11), by = Math.floor((y - 2) / 11); return bx < 0 || by < 0 || bx > 12 || by > 12 ? null : bx + ',' + by; };
  // remember the lowest a block has been, so a turnaround can be noticed
  function note(did, k, v) { S.bmin = S.bmin || {}; const m = (S.bmin[did] = S.bmin[did] || {}); if (m[k] == null || v < m[k]) m[k] = v; }
  // the window spots on a block's street-facing storefronts, where plywood goes up
  function fronts(W, bx, by) { const fr = W.lots.filter((l) => l.bx === bx && l.by === by && l.bld); if (!fr.length) return []; const fy = Math.max(...fr.map((l) => l.bld.y + l.bld.d)), wall = [];
    fr.filter((l) => l.bld.y + l.bld.d === fy).forEach((l) => { const b = l.bld, dx = l.door ? l.door[0] + .5 : -9; (b.w < 4 ? [b.x + .45, b.x + b.w - .45] : [b.x + .7, b.x + b.w - .7, b.x + b.w * .3]).filter((x) => Math.abs(x - dx) > .9) /* a narrow storefront has room either side of its door */.forEach((x) => wall.push([x, b.y + b.d + .12, b])); }); return wall; }
  // dress the district's blocks for how they feel about you; called when a district loads and when a block's trust moves a tier
  function dress(W, did) {
    if (!W || !W.props) return; W.props = W.props.filter((p) => !p.rec); W._lights = null; /* the party's string lights join the night lighting */ const T = BT(did);
    if (!W._recBase || W._recBase.n !== W.props.length) W._recBase = { n: W.props.length, s: new Set(W.props.map((p) => Math.floor(p.x) + ',' + Math.floor(p.y))) }; /* the district's own props only change when it's rebuilt: remember where they stand */ const base = W._recBase.s, taken = { s: new Set(), has: (k) => base.has(k) || taken.s.has(k), add: (k) => taken.s.add(k) }; /* no copy of the base set */
    const put = (t, x, y, o) => { const k = Math.floor(x) + ',' + Math.floor(y); if (taken.has(k)) return false; taken.add(k); W.props.push(Object.assign({ t, x, y, rec: 1 }, o)); return true; };
    const putAny = (t, xs, y, o) => xs.some((x) => put(t, x, y, o)); // first free sidewalk spot
    Object.keys(T).forEach((k) => { const v = T[k]; if (Math.abs(v) < 4) return; const [bx, by] = k.split(',').map(Number), ox = 2 + bx * 11, oy = 2 + by * 11, y = oy + 8.5, seed = bx * 7 + by * 13;
      if (!W.lots.some((l) => l.bx === bx && l.by === by)) return;
      if (v >= 4) { put('flowers', ox + SIDE[0], y, { c: FLOWER[seed % 4] }); put('flowers', ox + SIDE[3], y, { c: FLOWER[(seed + 1) % 4] }); if (v >= 7) { put('bench', ox + SIDE[1], y); putAny('chalk', [ox + 4.5, ox + 3.5, ox + 8.5], y + .3, { v: seed % 5 }); } }
      else { const wall = fronts(W, bx, by); // plywood goes over the windows of the storefronts facing the street
        const board = (o) => { for (const w of wall) { const k = Math.floor(w[0] * 2) + '|' + Math.floor(w[1]); if (taken.has(k)) continue; taken.add(k); W.props.push(Object.assign({ t: 'board', x: w[0], y: w[1], rec: 1, wall: 1, front: 1, dz: w[2].x + w[2].w + w[2].y + w[2].d - 1.05 - w[0] - w[1] }, o)); return true; } return false; };
        if (!board({ v: seed % 2 })) put('bin', ox + SIDE[1], y, { tip: 1 }); /* no storefront to board up: the can's been knocked over and left */ put('litter', ox + SIDE[3], y, { v: seed % 3 }); if (v <= -7) { const tg = wall.find((w) => !taken.has(Math.floor(w[0] * 2) + '|' + Math.floor(w[1]))); if (tg) { taken.add(Math.floor(tg[0] * 2) + '|' + Math.floor(tg[1])); W.props.push({ t: 'tag', x: tg[0], y: tg[1], rec: 1, wall: 1, front: 1, v: seed % 3, dz: tg[2].x + tg[2].w + tg[2].y + tg[2].d - 1.05 - tg[0] - tg[1] }); } }
        if (v <= -7 && !board({ v: (seed + 1) % 2 })) putAny('litter', [ox + SIDE[2], ox + SIDE[0], ox + 3.5, ox + 8.5], y, { v: (seed + 1) % 3 }); } });
    Object.keys(S.bdown || {}).forEach((id) => { const [d2, k] = id.split(':'); const o = S.bdown[id]; if (+d2 !== did || !o || H.shift() !== o.sh || tier(T[k] || 0) < o.t) return; /* gone again if they board back up */ const [bx, by] = k.split(',').map(Number), ox = 2 + bx * 11, oy = 2 + by * 11; const w0 = fronts(W, bx, by)[0], nx = w0 ? [w0[0], w0[0] + 1, w0[0] - 1] : []; putAny('board', [...nx, ox + 9.3, ox + .9, ox + 5.2], oy + 9.3, { down: 1 }); }); /* stacked at the curb right below the storefront it came off */
    const pt = party(did); if (pt) { const [bx, by] = pt.k.split(',').map(Number), ox = 2 + bx * 11, oy = 2 + by * 11; put('lights', ox + 3.5, oy + 8.5); put('stall', ox + 5.5, oy + 9.5, { color: '#1f7a5a' }); put('lights', ox + 6.5, oy + 8.5); }
  }
  const blockName = (did, k) => { const W = H.W(); if (!W || W.did !== did) return ''; const l = W.lots.find((x) => x.bx + ',' + x.by === k && x.name); return l ? l.name : ''; };
  // tiers, so the street only re-dresses when a block crosses one
  const tier = (v) => (v >= 7 ? 2 : v >= 4 ? 1 : v <= -7 ? -2 : v <= -4 ? -1 : 0);
  function moved(did, k, before, after) { note(did, k, after); if (tier(before) !== tier(after)) { if (tier(after) > tier(before) && before <= -4) { S.bdown = S.bdown || {}; S.bdown[did + ':' + k] = { sh: H.shift(), t: tier(after) }; } if (!unboard(did, k)) dress(H.W(), did); /* one re-dress, with the stacked plywood already in it; in view, a neighbor takes it down first */ const nm = blockName(did, k); if (tier(after) > tier(before) && after >= 4) { H.toast('🌼 People on this block are fixing up their storefronts.'); if (H.log) H.log(tier(after) === 2 ? 'Somebody put a bench out' + (nm ? ' on ' + nm + '\'s block' : '') + '. People sit out there now when you drive by.' : 'Storefronts are getting fixed up' + (nm ? ' on ' + nm + '\'s block' : '') + '. They trust you there now.'); } else if (tier(after) > tier(before) && before <= -4) { /* climbing out: the plywood comes down and sits stacked at the curb for the rest of the shift */ H.saveS(); H.toast(after > -4 ? '🪵 Somebody is pulling the plywood off the windows. This block is giving you another look.' : '🪵 One board came down on this block. It\'s a start.'); if (H.log) H.log((after > -4 ? 'The plywood came down' : 'A board came down') + (nm ? ' on ' + nm + '\'s block' : '') + '. They\'re giving you another look.'); if (H.watch && after > -4) H.watch('Watched the plywood come down on a block that had boarded up against you.'); if (after > -4) { S.bturn = S.bturn || {}; if (!S.bturn[did + ':' + k]) { S.bturn[did + ':' + k] = H.shift() + 1; H.saveS(); H.award(40, 'Community trust: the plywood came down'); } } /* once per block, ever: no farming it by sliding back and forth */ if (H.ptnSay && after > -4) H.ptnSay({ walsh: 'Plywood\'s coming down. Took them long enough. Took us long enough.', park: 'They\'re taking the boards off! Because of us? Okay, I\'m counting that.', castillo: 'That\'s what it looks like when a block decides to try again. Don\'t make them regret it.' }); }
      else if (tier(after) < tier(before) && after <= -4) { H.toast('🪵 Plywood is going up on this block. People here don\'t trust you.'); if (H.log) H.log('Plywood went up' + (nm ? ' on ' + nm + '\'s block' : '') + '. People there stopped trusting you.'); } }
    maybeParty(did, k, after); }
  // a block that was trouble (-3 or lower) and now trusts you (8+) throws a party, once
  function maybeParty(did, k, v) { const m = (S.bmin || {})[did] || {}; S.bparty = S.bparty || {}; if (v < 8 || (m[k] == null ? 0 : m[k]) > -3 || S.bparty[did + ':' + k]) return;
    const l = H.W().lots.find((x) => x.bx + ',' + x.by === k); S.bparty[did + ':' + k] = { k, did, sh: H.shift(), seen: 0, name: (l && l.name) || '' }; H.saveS(); dress(H.W(), did);
    H.radio('Dispatch', 'Folks on ' + ((l && l.name) || 'your old trouble block') + ' are throwing a block party. They asked if you\'d stop by.'); }
  function party(did) { const b = S.bparty || {}; for (const id in b) { const p = b[id]; if (p.did === did && H.shift() - p.sh <= 1) return p; } return null; }
  // reactions: someone on a block that trusts you waves; on one that doesn't, they turn away
  let acc = 0;
  function tick(dt) { acc += dt; if (acc < .4) return; acc = 0; if (H.inside() || !H.W()) return; const did = H.W().did, T = BT(did), P = H.P(), now = performance.now();
    H.peds().forEach((p) => { if (p.party || p.rx && p.rx.until > now) return; const d = Math.hypot(p.x - P.x, p.y - P.y); if (d > 3.2 || p._rxDone) return; const k = keyAt(p.x, p.y), v = k ? T[k] || 0 : 0;
      if (v >= 4 && Math.random() < .5) { p.rx = { k: 'wave', until: now + 2600 }; p._rxDone = 1; p.face = P.x < p.x ? -1 : 1; }
      else if (v <= -4 && Math.random() < .5) { p.rx = { k: 'away', until: now + 2600 }; p._rxDone = 1; p.face = P.x < p.x ? 1 : -1; } });
    partyTick(.4, P); const pt = party(did); if (pt && !pt.seen) { const k = keyAt(P.x, P.y); if (k === pt.k) { pt.seen = 1; H.saveS(); H.award(80, 'stopped by the block party'); H.trust(did, 3); H.toast('🎉 They saved you a plate. A year ago this block wouldn\'t open the door for you.'); if (H.watch) H.watch('Stopped by the block party on a block that used to be trouble.'); if (H.withPartner) H.withPartner(); } } }
  // the party itself: a few neighbors out on the sidewalk by the stall, swaying, and a little music when you walk up
  let guests = [], guestW = null;
  function crowd(pt) { const W = H.W(); if (!pt || !H.newPed) { if (guests.length) { const set = new Set(guests); const ps = H.peds(); for (let i = ps.length - 1; i >= 0; i--) if (set.has(ps[i])) ps.splice(i, 1); guests = []; } return; }
    if (guestW === W && guests.length && H.peds().indexOf(guests[0]) >= 0) return; guestW = W; const [bx, by] = pt.k.split(',').map(Number), ox = 2 + bx * 11, oy = 2 + by * 11;
    guests = [[2.6, 8.6], [3.6, 8.25], [4.8, 8.9], [6.3, 8.3], [7.2, 8.85], [8.2, 8.4]].map(([x, y], i) => { const p = H.newPed(); Object.assign(p, { x: ox + x, y: oy + y, path: [], wait: 1e9, jog: false, dog: null, bike: false, party: 1, face: i % 2 ? -1 : 1, ph: i * 1.3 }); return p; });
    const ps = H.peds(); guests.forEach((g) => ps.unshift(g)); }
  let sway = 0, heard = false;
  function partyTick(dt, P) { const pt = party(H.W().did); crowd(pt); if (!pt) return; sway += dt; if (sway > 1.1) { sway = 0; guests.forEach((g, i) => { if (Math.random() < .5) g.face = -g.face; if (Math.random() < .35) g.rx = { k: i % 3 ? 'note' : 'party', until: performance.now() + 1400 }; }); }
    const [bx, by] = pt.k.split(',').map(Number), near = Math.hypot(P.x - (2 + bx * 11 + 5), P.y - (2 + by * 11 + 9)) < 6; if (near && !heard) { heard = true; /* the Block Party track comes in (moodNow reads atParty) */ const al = H.ally ? H.ally(H.W().did) : null; if (al && !pt.ally) { pt.ally = al; H.saveS(); setTimeout(() => H.toast('🍽️ ' + al + ' is here. Holding two plates, and one of them is for you.'), 1600); if (H.watch) H.watch(al + ' was at the block party. A year ago you were taking reports on him.'); } } /* a regular who turned it around shows up */ else if (!near) heard = false; }
  // in view, the plywood doesn't just vanish: a neighbor comes out with a hammer, pries the sheets off, and carries them
  // to the curb; out of view, it's simply down when you get there
  let crew = null;
  function unboard(did, k) { const W = H.W(), P = H.P(); if (!H.newPed || !W || W.did !== did || crew) return false; const [bx, by] = k.split(',').map(Number), ox = 2 + bx * 11, oy = 2 + by * 11;
    const bs = W.props.filter((p) => p.rec && p.wall && p.t === 'board' && p.x >= ox && p.x < ox + 11 && p.y >= oy && p.y < oy + 11); if (!bs.some((b) => Math.hypot(b.x - P.x, b.y - P.y) <= 10)) return false; /* close enough to see it */
    const w = H.newPed(), b0 = bs.reduce((a, b) => Math.hypot(b.x - P.x, b.y - P.y) < Math.hypot(a.x - P.x, a.y - P.y) ? b : a); /* the window nearest you, so you see it */ Object.assign(w, { x: b0.x, y: b0.y + .45, path: [], wait: 1e9, jog: false, dog: null, bike: false, party: 1, face: 1, sp: 1.5, rx: { k: 'pry', until: 1e15 } }); H.peds().unshift(w); crew = w;
    /* a little play in game time: pry, carry it down to the curb at a walk, set it down and wave. Paused time (a promotion, a menu) doesn't count */
    let ph = 'pry', left = 2600, last = performance.now(), st = null; const bye = () => { const ps = H.peds(), i = ps.indexOf(w); if (i >= 0) ps.splice(i, 1); if (st) st.hide = 0; crew = null; };
    const step = () => { const n = performance.now(), dt = H.paused && H.paused() ? 0 : n - last; last = n; left -= dt; if (H.W() !== W) return bye();
      if (ph === 'pry' && left <= 0) { dress(W, did); st = W.props.find((p) => p.rec && p.down && p.x >= ox && p.x < ox + 11 && p.y >= oy && p.y < oy + 11); if (!st) return bye();
        st.hide = Infinity; /* the stack only shows once it's set down */ w.wait = 0; const end = [st.x - .5, st.y - .2], way = H.route && H.route(w.x, w.y, end[0], end[1]); /* round the fences and the house, the way a person would */ w.path = way && way.length < 30 ? [...way.slice(0, -1), end] : [end]; w.rx = { k: 'carry', until: 1e15 }; ph = 'walk'; left = 14000; }
      else if (ph === 'walk' && (!w.path.length || left <= 0)) { w.path = []; w.wait = 1e9; w.x = st.x - .5; w.y = st.y - .2; st.hide = 0; const P2 = H.P(); w.face = (P2.x - w.x) - (P2.y - w.y) > 0 ? 1 : -1; w.back = false; w.moving = false; w.rx = Math.hypot(P2.x - w.x, P2.y - w.y) < 12 ? { k: 'wave', until: 1e15 } : null; ph = 'wave'; left = 1600; }
      else if (ph === 'wave' && left <= 0) return bye();
      setTimeout(step, 80); };
    setTimeout(step, 80);
    return true; }
  const RX = { pry: ['🔨', '#b8935f'], carry: ['🪵', '#b8935f'], wave: ['👋', '#22c55e'], away: ['😒', '#6b7280'], note: ['🎵', '#f5b800'], party: ['🎉', '#f472b6'] };
  function draw(now) { if (H.inside()) return; H.peds().forEach((p) => { if (!p.rx || p.rx.until < now) return; const [sx, sy] = H.iso(p.x, p.y); const r = RX[p.rx.k] || RX.wave; H.bubble(sx, sy - 44, r[0], r[1], now); }); }
  // a block that trusts you calls you by name: once a shift, now and then, the next call comes from a neighbor there
  function tip(did, sh, force) { S.btip = S.btip || {}; if (S.btip[did] === sh || (!force && Math.random() > .3)) return null; const W = H.W(), T = BT(did);
    const good = W.lots.filter((l) => l.name && l.door && (T[l.bx + ',' + l.by] || 0) >= 7); if (!good.length) return null; const l = good[(Math.random() * good.length) | 0]; S.btip[did] = sh; H.saveS();
    return { x: l.door[0] + .5, y: l.door[1] + .5, where: l.name, kind: l.kind }; }
  return { dress, moved, note, tick, draw, party, tier, tip, get atParty() { return heard && !!party(H.W().did); }, get crew() { return crew; }, _peds: () => H.peds() };
}
