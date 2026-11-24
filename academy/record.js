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
  // dress the district's blocks for how they feel about you; called when a district loads and when a block's trust moves a tier
  function dress(W, did) {
    if (!W || !W.props) return; W.props = W.props.filter((p) => !p.rec); const T = BT(did), taken = new Set(W.props.map((p) => Math.floor(p.x) + ',' + Math.floor(p.y)));
    const put = (t, x, y, o) => { const k = Math.floor(x) + ',' + Math.floor(y); if (taken.has(k)) return false; taken.add(k); W.props.push(Object.assign({ t, x, y, rec: 1 }, o)); return true; };
    const putAny = (t, xs, y, o) => xs.some((x) => put(t, x, y, o)); // first free sidewalk spot
    Object.keys(T).forEach((k) => { const v = T[k]; if (Math.abs(v) < 4) return; const [bx, by] = k.split(',').map(Number), ox = 2 + bx * 11, oy = 2 + by * 11, y = oy + 8.5, seed = bx * 7 + by * 13;
      if (!W.lots.some((l) => l.bx === bx && l.by === by)) return;
      if (v >= 4) { put('flowers', ox + SIDE[0], y, { c: FLOWER[seed % 4] }); put('flowers', ox + SIDE[3], y, { c: FLOWER[(seed + 1) % 4] }); if (v >= 7) put('bench', ox + SIDE[1], y); }
      else { const lot = W.lots.find((l) => l.bx === bx && l.by === by), b = lot && lot.bld, dx = lot && lot.door ? lot.door[0] + .5 : -9; // plywood goes over the windows, against the storefront
        const wall = b ? [b.x + .7, b.x + b.w - .7, b.x + b.w * .3].filter((x) => Math.abs(x - dx) > .9).map((x) => [x, b.y + b.d + .12]) : [];
        const board = (o) => { for (const w of wall) { const k = Math.floor(w[0] * 2) + '|' + Math.floor(w[1]); if (taken.has(k)) continue; taken.add(k); W.props.push(Object.assign({ t: 'board', x: w[0], y: w[1], rec: 1, wall: 1, front: 1, dz: b.x + b.w + b.y + b.d - 1.05 - w[0] - w[1] }, o)); return true; } return false; };
        if (!board({ v: seed % 2 })) put('board', ox + SIDE[1], y, { v: seed % 2 }); put('litter', ox + SIDE[3], y, { v: seed % 3 }); if (v <= -7 && !board({ v: (seed + 1) % 2 })) putAny('board', [ox + SIDE[2], ox + SIDE[0], ox + 3.5, ox + 8.5, ox + 9.5], y, { v: (seed + 1) % 2 }); } });
    const pt = party(did); if (pt) { const [bx, by] = pt.k.split(',').map(Number), ox = 2 + bx * 11, oy = 2 + by * 11; put('lights', ox + 3.5, oy + 8.5); put('stall', ox + 5.5, oy + 9.5, { color: '#1f7a5a' }); put('lights', ox + 6.5, oy + 8.5); }
  }
  // tiers, so the street only re-dresses when a block crosses one
  const tier = (v) => (v >= 7 ? 2 : v >= 4 ? 1 : v <= -7 ? -2 : v <= -4 ? -1 : 0);
  function moved(did, k, before, after) { note(did, k, after); if (tier(before) !== tier(after)) { dress(H.W(), did); if (tier(after) > tier(before) && after >= 4) H.toast('🌼 People on this block are fixing up their storefronts.'); else if (tier(after) < tier(before) && after <= -4) H.toast('🪵 Plywood is going up on this block. People here don\'t trust you.'); }
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
    partyTick(.4, P); const pt = party(did); if (pt && !pt.seen) { const k = keyAt(P.x, P.y); if (k === pt.k) { pt.seen = 1; H.saveS(); H.award(80, 'stopped by the block party'); H.trust(did, 3); H.toast('🎉 They saved you a plate. A year ago this block wouldn\'t open the door for you.'); if (H.watch) H.watch('Stopped by the block party on a block that used to be trouble.'); } } }
  // the party itself: a few neighbors out on the sidewalk by the stall, swaying, and a little music when you walk up
  let guests = [], guestW = null;
  function crowd(pt) { const W = H.W(); if (!pt || !H.newPed) { if (guests.length) { const set = new Set(guests); const ps = H.peds(); for (let i = ps.length - 1; i >= 0; i--) if (set.has(ps[i])) ps.splice(i, 1); guests = []; } return; }
    if (guestW === W && guests.length && H.peds().indexOf(guests[0]) >= 0) return; guestW = W; const [bx, by] = pt.k.split(',').map(Number), ox = 2 + bx * 11, oy = 2 + by * 11;
    guests = [[2.6, 8.6], [3.6, 8.25], [4.8, 8.9], [6.3, 8.3], [7.2, 8.85], [8.2, 8.4]].map(([x, y], i) => { const p = H.newPed(); Object.assign(p, { x: ox + x, y: oy + y, path: [], wait: 1e9, jog: false, dog: null, bike: false, party: 1, face: i % 2 ? -1 : 1, ph: i * 1.3 }); return p; });
    const ps = H.peds(); guests.forEach((g) => ps.unshift(g)); }
  let sway = 0, heard = false;
  function partyTick(dt, P) { const pt = party(H.W().did); crowd(pt); if (!pt) return; sway += dt; if (sway > 1.1) { sway = 0; guests.forEach((g, i) => { if (Math.random() < .5) g.face = -g.face; if (Math.random() < .35) g.rx = { k: i % 3 ? 'note' : 'party', until: performance.now() + 1400 }; }); }
    const [bx, by] = pt.k.split(',').map(Number), near = Math.hypot(P.x - (2 + bx * 11 + 5), P.y - (2 + by * 11 + 9)) < 6; if (near && !heard) { heard = true; /* the Block Party track comes in (moodNow reads atParty) */ const al = H.ally ? H.ally(H.W().did) : null; if (al && !pt.ally) { pt.ally = al; H.saveS(); setTimeout(() => H.toast('🍽️ ' + al + ' is here. Holding two plates, and one of them is for you.'), 1600); if (H.watch) H.watch(al + ' was at the block party. A year ago you were taking reports on him.'); } } /* a regular who turned it around shows up */ else if (!near) heard = false; }
  const RX = { wave: ['👋', '#22c55e'], away: ['😒', '#6b7280'], note: ['🎵', '#f5b800'], party: ['🎉', '#f472b6'] };
  function draw(now) { if (H.inside()) return; H.peds().forEach((p) => { if (!p.rx || p.rx.until < now) return; const [sx, sy] = H.iso(p.x, p.y); const r = RX[p.rx.k] || RX.wave; H.bubble(sx, sy - 44, r[0], r[1], now); }); }
  return { dress, moved, note, tick, draw, party, tier, get atParty() { return heard && !!party(H.W().did); }, _peds: () => H.peds() };
}
