// Rewards for everything you do: a Service Record with ten tracks that level up from any activity, a daily variety
// bonus, overlooks that reveal the map around them, rumors that point you at undiscovered history, and a shimmer at
// places with a story you haven't found yet. Cheap per frame: overlook/rumor spots are computed once per district.
const TRACKS = [
  ['calls', '🚓', 'Calls for Service', /call|s-rank|final call|district cleared|stalled|disturbance|report/i],
  ['patrol', '🧭', 'Patrol', /patrol|sharp eyes|shift order|daily challenge|order/i],
  ['pursuit', '🚨', 'Pursuits', /pursuit/i],
  ['arrest', '🔗', 'Arrests & Procedure', /arrest|procedure|warrant|booking|investigation/i],
  ['community', '🤝', 'Community', /citizen|small talk|community|friend|morale|integrity|hometown|thank|beat issue|meeting/i],
  ['fitness', '💪', 'Fitness', /\bpt\b|workout|run|inspection|cadence|fitness|gym/i],
  ['team', '🛡️', 'Teamwork', /co-op|squad|ride-along|mutual aid|arena|backup|bowl|relay|bolo|gauntlet|spot the change|dispatch desk|commend|district incident/i],
  ['explore', '🗺️', 'Exploration', /explor|new place|patch|lore|overlook|rumor|photo|pigeon|cache|ledger|secret|landmark|census/i],
  ['study', '📘', 'Study', /fact|study|story|chapter|exam|side case|notes|case file|tutorial/i],
  ['life', '☕', 'Off-Duty Life', /off.duty|life|hobby|fish|cook|coffee|lunch|garden|game night|volunteer|pet|partner care/i]
];
const TIERS = [[5, 'Seasoned'], [10, 'Veteran'], [20, 'Legend of']];
const need = (l) => 60 * l + 20 * l * l; // RP needed to go from level l to l+1
export function installRewards(H) {
  const S = H.S, esc = H.esc;
  S.svc = S.svc || {}; S.overlooks = S.overlooks || {}; S.rumors = S.rumors || {};
  const today = () => new Date().toDateString();

  // ================= service record =================
  function trackOf(why) { why = String(why || ''); if (/service record|variety/i.test(why)) return null; for (const t of TRACKS) if (t[3].test(why)) return t[0]; return 'patrol'; }
  function add(kind, xp) {
    if (!kind || !(xp > 0)) return; const r = S.svc[kind] || (S.svc[kind] = { l: 1, x: 0 }); r.x += xp; let up = 0;
    while (r.l < 30 && r.x >= need(r.l)) { r.x -= need(r.l); r.l++; up = r.l; }
    variety(kind);
    if (up) { const t = TRACKS.find((x) => x[0] === kind), tier = TIERS.filter(([n]) => up === n).map(([, w]) => w)[0];
      H.banner(t[1], t[2] + ' · level ' + up, tier ? 'Title unlocked: ' + tier + ' ' + t[2] : 'Bonus: ' + (15 + up * 5) + ' RP' + (up % 3 === 0 ? ' and a supply drop' : ''));
      if (tier) { S.titles = S.titles || {}; S.titles[tier + ' ' + t[2]] = 1; }
      if (up === 10) { S.carSkins = S.carSkins || {}; S.carSkins['svc_' + kind] = { stripe: ['#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b'][TRACKS.indexOf(t) % 5], text: t[2].split(' ')[0].toUpperCase() }; }
      setTimeout(() => { H.award(15 + up * 5, 'service record'); if (up % 3 === 0) H.queueLoot(t[2] + ' level ' + up, 1, up >= 9 ? 'r' : 'u'); }, 600); H.stat('svcUp'); }
    H.saveS();
  }
  function onAward(xp, why) { add(trackOf(why), xp); }
  // doing different kinds of things in one day pays: three kinds, five kinds, eight kinds
  function variety(kind) {
    const v = S.vary && S.vary.d === today() ? S.vary : (S.vary = { d: today(), k: {}, paid: 0 }); if (v.k[kind]) return; v.k[kind] = 1; const n = Object.keys(v.k).length;
    const step = [[3, 50, 'u', 'Well-rounded shift'], [5, 120, 'r', 'Jack of all trades'], [8, 300, 'e', 'The whole job']].find(([m]) => m === n && v.paid < m);
    if (step) { v.paid = n; setTimeout(() => { H.banner('🌈', step[3], n + ' different kinds of work today. +' + step[1] + ' RP and a supply drop.'); H.award(step[1], 'variety bonus'); H.queueLoot(step[3], 1, step[2]); }, 1200); }
  }
  function panel() {
    const v = S.vary && S.vary.d === today() ? Object.keys(S.vary.k) : [];
    H.openModal('<div class="sceneHead"><b>SERVICE RECORD</b><h2>Everything counts</h2><p>Every kind of work levels up its own track. Titles at levels 5, 10 and 20; a car skin at 10. Do three different kinds of work in a day for a variety bonus.</p></div><div class="svcList">' +
      TRACKS.map(([k, ic, name]) => { const r = S.svc[k] || { l: 1, x: 0 }, pct = Math.round(r.x / need(r.l) * 100), nx = TIERS.find(([n]) => n > r.l); return '<div class="svcRow' + (v.indexOf(k) >= 0 ? ' today' : '') + '"><i>' + ic + '</i><div><b>' + name + '</b><small>Level ' + r.l + (nx ? ' · ' + nx[1] + ' title at ' + nx[0] : ' · max title') + '</small><span><em style="width:' + pct + '%"></em></span></div></div>'; }).join('') +
      '</div><div class="qAct" style="margin-top:0"><button type="button" class="ghost" id="svcShare">🖼️ Share my record card</button></div><p class="lkSum">Today: ' + (v.length ? v.length + ' kind' + (v.length > 1 ? 's' : '') + ' of work (' + v.map((k) => TRACKS.find((t) => t[0] === k)[1]).join(' ') + ')' : 'nothing yet') + '</p><div class="qAct"><button type="button" id="mClose">Back</button></div>');
    const x = document.getElementById('mClose'); if (x) x.onclick = H.closeModal; const sh = document.getElementById('svcShare'); if (sh) sh.onclick = () => H.share();
  }

  // ================= overlooks =================
  // four per district, spread across its quadrants; reaching one pans the camera out and maps the area around it
  let OV = null;
  function overlooks() {
    const W = H.W(); if (!W || H.inside()) return []; if (OV && OV.w === W) return OV.list; const N = H.N, named = W.lots.filter((l) => l.name && l.door);
    const list = [[.25, .25], [.75, .25], [.25, .75], [.75, .75]].map(([fx, fy], q) => { const cx = fx * N, cy = fy * N; let best = null, bd = 1e9; named.forEach((l) => { const d = Math.hypot(l.door[0] - cx, l.door[1] - cy); if (d < bd) { bd = d; best = l; } }); return best ? { id: W.did + ':ov' + q, x: best.door[0] + .5, y: best.door[1] + 1.6, name: best.name } : null; }).filter(Boolean);
    OV = { w: W, list }; return list;
  }
  let busyOv = false;
  function overlookTick() {
    if (busyOv || H.busy()) return; const P = H.P;
    for (const o of overlooks()) { if (S.overlooks[o.id] || Math.hypot(o.x - P.x, o.y - P.y) > 1.6) continue;
      S.overlooks[o.id] = Date.now(); H.saveS(); busyOv = true; H.setPaused(true); H.cineFocus(o.x, o.y, .55); H.buzz('ok'); H.sting('card');
      const n = Object.keys(S.overlooks).filter((k) => k.indexOf(H.W().did + ':') === 0).length;
      setTimeout(() => { H.reveal(o.x, o.y, 20); H.banner('🔭', 'Overlook: ' + o.name, 'The streets around you are on your map now. ' + n + ' of 4 overlooks in ' + H.dname() + '.'); }, 700);
      setTimeout(() => { H.cineRelease(); H.setPaused(false); busyOv = false; H.award(30 + (n === 4 ? 70 : 0), 'overlook'); if (n === 4) H.queueLoot('Every overlook in ' + H.dname(), 1, 'r'); }, 2800);
      break; }
  }

  // ================= rumors and the shimmer of undiscovered history =================
  function loreSpots() { const W = H.W(); if (!W) return []; return H.LORE.filter((e) => !S.lore[e.id] && /^visit:/.test(e.when || '')).map((e) => { const nm = e.when.slice(6), l = W.lots.find((x) => x.name === nm); return l ? { e, l } : null; }).filter(Boolean); }
  let LS = null, lsT = 0;
  function spots() { const now = performance.now(); if (!LS || now - lsT > 4000 || LS.w !== H.W()) { LS = { w: H.W(), list: loreSpots() }; lsT = now; } return LS.list; }
  function rumor() {
    const W = H.W(); if (!W || Math.random() > .35) return; const mine = S.rumors[W.did] || (S.rumors[W.did] = {}), cand = spots().filter((s) => !mine[s.e.id]); if (!cand.length) return;
    const s = cand[Math.floor(Math.random() * cand.length)]; mine[s.e.id] = s.l.name; H.saveS();
    setTimeout(() => H.toast('📍 Rumor: ' + ['old-timers say', 'a regular mentioned', 'dispatch heard', 'a shop owner swears'][Math.floor(Math.random() * 4)] + ' there\'s a story at ' + s.l.name + '. Marked on your map.'), 2500);
  }
  function rumorPins() { const W = H.W(); if (!W) return []; const mine = S.rumors[W.did] || {}; return spots().filter((s) => mine[s.e.id]); }
  function draw(list, vis, ctx, now) {
    if (H.inside()) return; const P = H.P;
    for (const o of overlooks()) { if (S.overlooks[o.id] || Math.hypot(o.x - P.x, o.y - P.y) > 24) continue; const [sx, sy] = H.iso(o.x, o.y); if (!vis(sx, sy)) continue; list.push({ d: o.x + o.y + .5, f: () => { H.ring(sx, sy, '#38bdf8', now); H.bubble(sx, sy - 34, '🔭', '#7dd3fc', now); } }); }
    for (const s of spots()) { const dx = s.l.door[0] + .5, dy = s.l.door[1] + .5, d = Math.hypot(dx - P.x, dy - P.y), pinned = (S.rumors[H.W().did] || {})[s.e.id]; if (d > (pinned ? 30 : 7)) continue; const [sx, sy] = H.iso(dx, dy); if (!vis(sx, sy)) continue;
      list.push({ d: dx + dy + .7, f: () => { H.sparkle(sx, sy - 40, now + dx * 97, '#fde68a'); if (pinned) H.bubble(sx, sy - 58, '?', '#fde68a', now); } }); }
  }
  function miniDots(dot) { for (const o of overlooks()) if (!S.overlooks[o.id]) dot(o.x, o.y, '#38bdf8', 2.6); for (const s of rumorPins()) dot(s.l.door[0], s.l.door[1], '#fde68a', 2.8); }
  let t = 0;
  function tick(dt) { t -= dt; if (t > 0) return; t = .25; overlookTick(); }

  const trackName = (k) => (TRACKS.find((t) => t[0] === k) || [0, 0, k])[2];
  return { onAward, add, panel, rumor, draw, miniDots, tick, trackOf, trackName, trackIds: () => TRACKS.map((t) => t[0]) };
}
