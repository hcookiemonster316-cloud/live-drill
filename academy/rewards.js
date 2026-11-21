// Rewards for everything you do: a Service Record with ten tracks that level up from any activity, a daily variety
// bonus, overlooks that reveal the map around them, rumors that point you at undiscovered history, and a shimmer at
// places with a story you haven't found yet. Cheap per frame: overlook/rumor spots are computed once per district.
const TRACKS = [
  ['calls', '🚓', 'Calls for Service', /call|s-rank|final call|district cleared|stalled|disturbance|report/i],
  ['patrol', '🧭', 'Patrol', /patrol|sharp eyes|shift order|daily challenge|order/i],
  ['pursuit', '🚨', 'Pursuits', /pursuit/i],
  ['arrest', '🔗', 'Arrests & Procedure', /arrest|procedure|warrant|booking|investigation/i],
  ['community', '🤝', 'Community', /de-escalat|citizen|small talk|community|friend|morale|integrity|hometown|thank|beat issue|meeting/i],
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
  S.svc = S.svc || {}; S.overlooks = S.overlooks || {}; S.rumors = S.rumors || {}; S.notes = S.notes || {}; S.caches = S.caches || {};
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
    const list = [[.25, .25], [.75, .25], [.25, .75], [.75, .75]].map(([fx, fy], q) => { const cx = fx * N, cy = fy * N; let best = null, bd = 1e9; named.forEach((l) => { const d = Math.hypot(l.door[0] - cx, l.door[1] - cy); if (d < bd) { bd = d; best = l; } }); if (!best) return null; const x = best.door[0] + .5, y = best.door[1] + 1.6, [sx, sy] = H.iso(x, y); return { id: W.did + ':ov' + q, x, y, sx, sy, name: best.name }; }).filter(Boolean);
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
  function loreSpots() { const W = H.W(); if (!W) return []; return H.LORE.filter((e) => !S.lore[e.id] && /^visit:/.test(e.when || '')).map((e) => { const nm = e.when.slice(6), l = W.lots.find((x) => x.name === nm); if (!l) return null; const dx = l.door[0] + .5, dy = l.door[1] + .5, [sx, sy] = H.iso(dx, dy); return { e, l, dx, dy, sx, sy }; }).filter(Boolean); }
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
    for (const o of overlooks()) { if (S.overlooks[o.id] || Math.abs(o.x - P.x) + Math.abs(o.y - P.y) > 30) continue; const sx = o.sx, sy = o.sy; if (!vis(sx, sy)) continue; list.push({ d: o.x + o.y + .5, f: () => { H.ring(sx, sy, '#38bdf8', now); H.bubble(sx, sy - 34, '🔭', '#7dd3fc', now); } }); }
    for (const o of caches()) { if (Math.abs(o.x - P.x) + Math.abs(o.y - P.y) > 40) continue; const sx = o.sx, sy = o.sy; if (!vis(sx, sy)) continue; list.push({ d: o.x + o.y + .5, f: () => { H.ring(sx, sy, '#fbbf24', now); H.bubble(sx, sy - 40, '✦', '#fbbf24', now); } }); }
    for (const o of marks()) { if (Math.abs(o.x - P.x) + Math.abs(o.y - P.y) > 30) continue; const sx = o.sx, sy = o.sy; if (!vis(sx, sy)) continue; list.push({ d: o.x + o.y + .4, f: () => { const sp = markSprite(o.m); ctx.drawImage(sp, sx - 26, sy - 39, sp.lw, sp.lh); } }); }
    for (const o of notes()) { const d = Math.abs(o.x - P.x) + Math.abs(o.y - P.y); if (d > 26) continue; const sx = o.sx, sy = o.sy; if (!vis(sx, sy)) continue; const read = !!S.notes[o.n.id];
      list.push({ d: o.x + o.y + .4, f: () => { const sp = noteSprite(read); ctx.drawImage(sp, sx - 10, sy - 30, sp.lw, sp.lh); if (!read && d < 9) H.sparkle(sx, sy - 34, now + o.x * 53, '#fef3c7'); } }); }
    const pins = S.rumors[H.W().did] || {}; for (const s of spots()) { const dx = s.dx, dy = s.dy, d = Math.abs(dx - P.x) + Math.abs(dy - P.y), pinned = pins[s.e.id]; if (d > (pinned ? 40 : 9)) continue; const sx = s.sx, sy = s.sy; if (!vis(sx, sy)) continue;
      list.push({ d: dx + dy + .7, f: () => { H.sparkle(sx, sy - 40, now + dx * 97, '#fde68a'); if (pinned) H.bubble(sx, sy - 58, '?', '#fde68a', now); } }); }
  }
  function miniDots(dot) { for (const o of caches()) dot(o.x, o.y, '#fbbf24', 3.2); for (const o of notes()) if (S.notes[o.n.id]) dot(o.x, o.y, '#e7d8b8', 1.8); for (const o of overlooks()) if (!S.overlooks[o.id]) dot(o.x, o.y, '#38bdf8', 2.6); for (const s of rumorPins()) dot(s.l.door[0], s.l.door[1], '#fde68a', 2.8); }
  // ================= notes: letters, plaques and flyers left around the city =================
  // positions are worked out once per district; the sprite is painted once and reused, so the cost is one drawImage per
  // note on screen. Walking up to one opens it; some point you at a story someone in the district is waiting to tell.
  let NT = null;
  function notes() { const W = H.W(); if (!W || H.inside()) return []; if (NT && NT.w === W) return NT.list;
    const list = (H.NOTES || []).filter((n) => n.d === W.did).map((n) => { const l = W.lots.find((x) => x.name && x.door && x.name.indexOf(n.at) >= 0); if (!l) return null; const x = l.door[0] + 1.5, y = l.door[1] + .7, [sx, sy] = H.iso(x, y); return { n, x, y, sx, sy }; }).filter(Boolean);
    NT = { w: W, list }; return list; }
  let NSP = null, NSP2 = null;
  function noteSprite(read) { if (read ? NSP2 : NSP) return read ? NSP2 : NSP; const [c, g] = H.hiCanvas(20, 30, 3);
    g.fillStyle = '#5b4636'; g.fillRect(9, 12, 2.4, 17); // post
    g.save(); g.translate(10, 9); g.rotate(-.08); g.fillStyle = read ? '#d6cfc2' : '#fdf6e3'; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 2; g.fillRect(-7, -7, 14, 12); g.shadowBlur = 0;
    g.fillStyle = read ? '#9ca3af' : '#7c5a3a'; for (let i = 0; i < 4; i++) g.fillRect(-5, -4 + i * 2.6, i === 3 ? 6 : 10, .9); g.fillStyle = '#dc2626'; g.beginPath(); g.arc(0, -6, 1.4, 0, 7); g.fill(); g.restore();
    if (read) NSP2 = c; else NSP = c; return c; }
  let noteOpen = false;
  function noteTick() { if (noteOpen || H.busy() || H.dialogueOpen() || H.P.inCar) return; const P = H.P;
    for (const o of notes()) { if (Math.hypot(o.x - P.x, o.y - P.y) > 1.15) continue; const seen = S.notes[o.n.id]; if (seen && seen.near) continue; if (seen) { seen.near = 1; continue; } readNote(o.n); break; }
    for (const o of notes()) { const s = S.notes[o.n.id]; if (s && s.near && Math.hypot(o.x - P.x, o.y - P.y) > 2.5) s.near = 0; } }
  function readNote(n, again) { noteOpen = true; H.setPaused(true); H.buzz('tap'); H.sting('card'); const first = !S.notes[n.id];
    if (first) { S.notes[n.id] = { t: Date.now(), near: 1 }; H.S.lore[n.id] = 1; H.saveS(); }
    const q = n.lead && H.sideQ(n.lead), lead = q && !H.sideClosed(q) && S.side[q.id] == null ? (H.sideOpen(q) ? H.nm(q.giver) + ' might know more about this. Look for the blue mark.' : 'Someone around here has a story about this. It isn\'t ready to be told yet.') : '';
    const set = n.set && (H.NOTE_SETS || []).find((c) => c.id === n.set), parts = set ? (H.NOTES || []).filter((x) => x.set === set.id) : [], got = parts.filter((x) => S.notes[x.id]).length;
    let setLine = ''; if (set) { if (got === parts.length && !S.caches[set.id]) { S.caches[set.id] = 1; CA = null; H.saveS(); setTimeout(() => H.banner('🗺️', set.title, 'Every piece fits. The spot is marked on your map: ' + set.at + '.'), 900); }
      setLine = '<div class="noteLead">🧩 ' + esc(set.title) + ' · part ' + n.part + ' of ' + parts.length + (S.caches[set.id] ? ' · the spot is marked: ' + esc(set.at) : ' · ' + got + ' found') + '</div>'; }
    const cnt = (H.NOTES || []).filter((x) => x.d === n.d && S.notes[x.id]).length, tot = (H.NOTES || []).filter((x) => x.d === n.d).length;
    H.openModal('<div class="noteCard"><span class="noteKind">' + n.icon + ' ' + esc(n.kind) + ' · ' + esc(n.at) + '</span><h2>' + esc(n.title) + '</h2><p>' + esc(n.text) + '</p>' + setLine + (lead ? '<div class="noteLead">📍 ' + esc(lead) + '</div>' : '') + '<small>' + cnt + ' of ' + tot + ' notes found in ' + esc(H.dname()) + ' · saved to your journal</small></div><div class="qAct"><button type="button" id="mClose">Keep walking</button></div>');
    const x = document.getElementById('mClose'); if (x) x.onclick = () => { H.closeModal(); H.setPaused(false); noteOpen = false; if (first) { H.award(20 + (cnt === tot ? 60 : 0), 'lore note'); if (cnt === tot) H.queueLoot('Every note in ' + H.dname(), 1, 'r'); } };
    if (first) H.stat('notes'); }
  // ================= hidden caches (finish a note set) and lasting marks (finish a story) =================
  let CA = null;
  function caches() { const W = H.W(); if (!W || H.inside()) return []; if (CA && CA.w === W) return CA.list;
    const list = (H.NOTE_SETS || []).filter((c) => c.d === W.did && S.caches[c.id] === 1).map((c) => { const l = W.lots.find((x) => x.name && x.door && x.name.indexOf(c.at) >= 0); if (!l) return null; const x = l.door[0] - .5, y = l.door[1] + 1.4, [sx, sy] = H.iso(x, y); return { c, x, y, sx, sy }; }).filter(Boolean);
    CA = { w: W, list }; return list; }
  function cacheTick() { if (noteOpen || H.busy() || H.dialogueOpen() || H.P.inCar) return; const P = H.P;
    for (const o of caches()) { if (Math.hypot(o.x - P.x, o.y - P.y) > 1.3) continue; S.caches[o.c.id] = 2; CA = null; H.S.lore['c_' + o.c.id] = 1; H.saveS(); H.buzz('ok'); H.sting('card');
      noteOpen = true; H.setPaused(true); H.openModal('<div class="noteCard"><span class="noteKind">🗺️ Hidden cache · ' + esc(o.c.at) + '</span><h2>' + esc(o.c.title) + '</h2><p>' + esc(o.c.find) + '</p><div class="noteLead">You kept it as a quest item. Read it closely in Quest Items.</div><small>Saved to your journal</small></div><div class="qAct"><button type="button" id="mClose">Keep it</button></div>');
      const x = document.getElementById('mClose'); if (x) x.onclick = () => { H.closeModal(); H.setPaused(false); noteOpen = false; H.qGive(o.c.item); H.award(120, 'hidden cache'); H.queueLoot(o.c.title, 1, 'r'); };
      H.stat('caches'); break; } }
  let MK = null, mkT = 0; const MSP = {};
  function marks() { const W = H.W(); if (!W || H.inside()) return []; const now = performance.now(); if (MK && MK.w === W && now - mkT < 3000) return MK.list; mkT = now;
    const list = (H.MARKS || []).filter((m) => m.d === W.did && H.sideClosed(H.sideQ(m.q) || { id: '_', steps: [] })).map((m) => { const l = W.lots.find((x) => x.name && x.door && x.name.indexOf(m.at) >= 0); if (!l) return null; const x = l.door[0] - 1.3, y = l.door[1] + .6, [sx, sy] = H.iso(x, y); return { m, x, y, sx, sy }; }).filter(Boolean);
    MK = { w: W, list }; return list; }
  function markSprite(m) { const k = m.q; if (MSP[k]) return MSP[k]; const [c, g] = H.hiCanvas(52, 40, 3);
    g.fillStyle = '#3f3a33'; g.fillRect(12, 20, 2.4, 19); g.fillRect(38, 20, 2.4, 19);
    g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 3; g.fillStyle = '#1f2937'; g.beginPath(); g.roundRect(2, 2, 48, 21, 3); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = m.col; g.lineWidth = 1.2; g.beginPath(); g.roundRect(3.5, 3.5, 45, 18, 2); g.stroke();
    g.textAlign = 'center'; g.fillStyle = m.col; g.font = '800 6.4px Meridian,system-ui,sans-serif'; g.fillText(m.text, 26, 11.5, 42); g.fillStyle = '#e5e7eb'; g.font = '600 4.6px Meridian,system-ui,sans-serif'; g.fillText(m.sub, 26, 18, 42);
    MSP[k] = c; return c; }
  let t = 0;
  function tick(dt) { t -= dt; if (t > 0) return; t = .25; overlookTick(); noteTick(); cacheTick(); }

  const trackName = (k) => (TRACKS.find((t) => t[0] === k) || [0, 0, k])[2];
  return { onAward, add, panel, rumor, draw, miniDots, tick, readNote, notes, caches, marks, trackOf, trackName, trackIds: () => TRACKS.map((t) => t[0]) };
}
