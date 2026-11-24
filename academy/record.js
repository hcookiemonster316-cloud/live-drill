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
      else { put('board', ox + SIDE[1], y, { v: seed % 2 }); put('litter', ox + SIDE[3], y, { v: seed % 3 }); if (v <= -7) putAny('board', [ox + SIDE[2], ox + SIDE[0], ox + 3.5, ox + 8.5, ox + 9.5], y, { v: (seed + 1) % 2 }); } });
    const pt = party(did); if (pt) { const [bx, by] = pt.k.split(',').map(Number), ox = 2 + bx * 11, oy = 2 + by * 11; put('lights', ox + 3.5, oy + 8.5); put('stall', ox + 5.5, oy + 9.5, { color: '#1f7a5a' }); put('lights', ox + 6.5, oy + 8.5); }
  }
  // tiers, so the street only re-dresses when a block crosses one
  const tier = (v) => (v >= 7 ? 2 : v >= 4 ? 1 : v <= -7 ? -2 : v <= -4 ? -1 : 0);
  function moved(did, k, before, after) { note(did, k, after); if (tier(before) !== tier(after)) { dress(H.W(), did); if (tier(after) > tier(before) && after >= 4) H.toast('🌼 People on this block are fixing up their storefronts.'); else if (tier(after) < tier(before) && after <= -4) H.toast('🪵 Plywood is going up on this block. People here don\'t trust you.'); }
    maybeParty(did, k, after); }
  // a block that was trouble (-3 or lower) and now trusts you (8+) throws a party, once
  function maybeParty(did, k, v) { const m = (S.bmin || {})[did] || {}; S.bparty = S.bparty || {}; if (v < 8 || (m[k] == null ? 0 : m[k]) > -3 || S.bparty[did + ':' + k]) return;
    S.bparty[did + ':' + k] = { k, did, sh: H.shift(), seen: 0 }; H.saveS(); dress(H.W(), did); const l = H.W().lots.find((x) => x.bx + ',' + x.by === k);
    H.radio('Dispatch', 'Folks on ' + ((l && l.name) || 'your old trouble block') + ' are throwing a block party. They asked if you\'d stop by.'); }
  function party(did) { const b = S.bparty || {}; for (const id in b) { const p = b[id]; if (p.did === did && H.shift() - p.sh <= 1) return p; } return null; }
  // reactions: someone on a block that trusts you waves; on one that doesn't, they turn away
  let acc = 0;
  function tick(dt) { acc += dt; if (acc < .4) return; acc = 0; if (H.inside() || !H.W()) return; const did = H.W().did, T = BT(did), P = H.P(), now = performance.now();
    H.peds().forEach((p) => { if (p.rx && p.rx.until > now) return; const d = Math.hypot(p.x - P.x, p.y - P.y); if (d > 3.2 || p._rxDone) return; const k = keyAt(p.x, p.y), v = k ? T[k] || 0 : 0;
      if (v >= 4 && Math.random() < .5) { p.rx = { k: 'wave', until: now + 2600 }; p._rxDone = 1; p.face = P.x < p.x ? -1 : 1; }
      else if (v <= -4 && Math.random() < .5) { p.rx = { k: 'away', until: now + 2600 }; p._rxDone = 1; p.face = P.x < p.x ? 1 : -1; } });
    const pt = party(did); if (pt && !pt.seen) { const k = keyAt(P.x, P.y); if (k === pt.k) { pt.seen = 1; H.saveS(); H.award(80, 'stopped by the block party'); H.trust(did, 3); H.toast('🎉 They saved you a plate. A year ago this block wouldn\'t open the door for you.'); if (H.watch) H.watch('Stopped by the block party on a block that used to be trouble.'); } } }
  function draw(now) { if (H.inside()) return; H.peds().forEach((p) => { if (!p.rx || p.rx.until < now) return; const [sx, sy] = H.iso(p.x, p.y); H.bubble(sx, sy - 44, p.rx.k === 'wave' ? '👋' : '😒', p.rx.k === 'wave' ? '#22c55e' : '#6b7280', now); }); }
  return { dress, moved, note, tick, draw, party, tier, _peds: () => H.peds() };
}
