// Echoes you can see in the city. Some "something's off" moments are road hazards from Lesson 2.2: a pothole in the
// lane, a streetlight out over a crosswalk, a stop sign knocked flat. They're drawn in the world where they are. When you
// check one out and report it, a cone goes up; a few minutes later public works fixes it, dispatch tells you, and the
// fix stays there (a fresh asphalt patch, a light that works, a new sign) for a week so you can drive past what you did.
// Also here: a business that stops calling once you've handled it well, a roadside memorial, and a community board.
const REPAIR = 5 * 60; // seconds of play from your report to the fix
const KEEP = 7 * 864e5; // how long a fix stays marked in the world
const WHAT = { pothole: 'pothole', light: 'streetlight', sign: 'stop sign' };

export function installEchoes(H) {
  const S = H.S; S.fixes = S.fixes || [];
  // ---------- sprites, each drawn once ----------
  const SPR = {};
  function sprite(k) {
    if (SPR[k]) return SPR[k];
    const big = k === 'lightOff' || k === 'lightOn' || k === 'signDown' || k === 'signUp', [c, g] = H.hiCanvas(big ? 30 : 34, big ? 58 : 20, 2);
    if (k === 'pothole') { g.fillStyle = 'rgba(15,15,18,.85)'; g.beginPath(); g.ellipse(17, 10, 13, 6, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(80,80,90,.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(4, 10); g.lineTo(1, 8); g.moveTo(30, 11); g.lineTo(33, 13); g.moveTo(17, 4); g.lineTo(18, 1); g.stroke(); g.fillStyle = 'rgba(56,189,248,.35)'; g.beginPath(); g.ellipse(19, 11, 6, 2.4, 0, 0, 7); g.fill(); }
    if (k === 'patch') { g.fillStyle = '#26262b'; g.beginPath(); g.roundRect(3, 3, 28, 14, 5); g.fill(); g.strokeStyle = 'rgba(148,163,184,.55)'; g.lineWidth = 1; g.setLineDash([3, 2]); g.stroke(); g.setLineDash([]); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(8, 7, 14, 2); }
    if (k === 'cone') { g.fillStyle = '#f97316'; g.beginPath(); g.moveTo(17, 1); g.lineTo(23, 17); g.lineTo(11, 17); g.closePath(); g.fill(); g.fillStyle = '#f8fafc'; g.fillRect(13.5, 9, 7, 2.4); g.fillStyle = '#9a3412'; g.fillRect(9, 17, 16, 2.5); }
    if (k === 'lightOff' || k === 'lightOn') { g.fillStyle = '#475569'; g.fillRect(14, 10, 2.4, 46); g.fillRect(14, 8, 10, 2.4); g.fillStyle = k === 'lightOn' ? '#fef3c7' : '#1f2937'; g.beginPath(); g.ellipse(23, 11, 4, 2.4, 0, 0, 7); g.fill(); if (k === 'lightOff') { g.strokeStyle = '#64748b'; g.lineWidth = .8; g.beginPath(); g.moveTo(21, 10); g.lineTo(25, 12.5); g.stroke(); } }
    if (k === 'signDown' || k === 'signUp') { const up = k === 'signUp'; g.save(); if (!up) { g.translate(15, 56); g.rotate(-1.1); g.translate(-15, -56); } g.fillStyle = '#94a3b8'; g.fillRect(14, 20, 2.2, 36); g.fillStyle = '#dc2626'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; g.lineTo(15 + Math.cos(a) * 9, 13 + Math.sin(a) * 9); } g.closePath(); g.fill(); g.strokeStyle = '#f8fafc'; g.lineWidth = 1; g.stroke(); g.fillStyle = '#f8fafc'; g.font = '800 4.6px Meridian,system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('STOP', 15, 14.6); g.restore(); }
    SPR[k] = c; return c;
  }
  const here = (f) => f.did === H.did() && !H.inside();
  // ---------- reporting ----------
  // an observe that was a hazard: the scene is done, so put a cone up and start the clock
  function report(o) {
    if (!o || !o.fix) return; S.fixes.push({ k: o.fix, x: o.x, y: o.y, did: H.did(), at: Date.now(), t: 0, done: 0, where: H.nearName(o.x, o.y) });
    while (S.fixes.length > 24) S.fixes.shift(); H.saveS();
    setTimeout(() => H.radio('Dispatch', 'Copy, ' + S.cs + '. Public works has the ' + WHAT[o.fix] + ' near ' + H.nearName(o.x, o.y) + '. Thanks for calling it in.'), 1800);
  }
  // ---------- time passing: fixes happen ----------
  let tT = 0;
  function tick(dt) {
    tT -= dt; if (tT > 0) return; tT = 1; const now = Date.now(); let dirty = false;
    for (const f of S.fixes) {
      if (!f.done) { f.t += 1; if (f.t >= REPAIR) { f.done = now; dirty = true; H.radio('Public Works', 'Crew\'s done with the ' + WHAT[f.k] + ' near ' + f.where + '. That one came in from ' + S.cs + '.'); if (here(f)) H.toast('🛠 The ' + WHAT[f.k] + ' you reported near ' + f.where + ' is fixed.'); } }
    }
    const keep = S.fixes.filter((f) => !f.done || now - f.done < KEEP); if (keep.length !== S.fixes.length) { S.fixes = keep; dirty = true; }
    if (dirty) H.saveS();
  }
  // a new shift: anything still waiting got done overnight
  function onShift() { const now = Date.now(); S.fixes.forEach((f) => { if (!f.done) f.done = now; }); H.saveS(); }
  // ---------- drawing: unfixed hazards still out there, cones on reported ones, and the fixes you caused ----------
  function draw(list, vis, ctx, observes) {
    if (H.inside()) return;
    const put = (x, y, k, dz, ox, oy) => { const [sx, sy] = H.iso(x, y); if (!vis(sx, sy)) return; list.push({ d: x + y + dz, f: () => { const s = sprite(k); ctx.drawImage(s, sx - s.lw / 2 + (ox || 0), sy - s.lh + (oy || 0), s.lw, s.lh); } }); };
    const art = (k, x, y, state) => { // state: 'bad' | 'coned' | 'fixed'
      if (k === 'pothole') { if (state === 'fixed') put(x, y, 'patch', -.9, 0, 10); else { put(x, y, 'pothole', -.9, 0, 10); if (state === 'coned') put(x + .35, y - .2, 'cone', 0); } }
      if (k === 'light') { put(x, y, state === 'fixed' ? 'lightOn' : 'lightOff', 0, 0, 2); if (state === 'coned') put(x + .5, y + .2, 'cone', .1); }
      if (k === 'sign') { put(x, y, state === 'fixed' ? 'signUp' : 'signDown', 0, 0, 2); if (state === 'coned') put(x + .5, y + .2, 'cone', .1); }
    };
    for (const o of observes) if (o.fix) art(o.fix, o.x, o.y, 'bad');
    for (const f of S.fixes) if (f.did === H.did()) art(f.k, f.x, f.y, f.done ? 'fixed' : 'coned');
  }
  // ---------- the caller who stops calling ----------
  // a business that keeps calling about the same trouble: handle it well three times and it settles down. Dispatch
  // stops sending calls there, says so, and an OPEN sign goes up out front.
  S.callers = S.callers || {};
  const ck = (where) => H.did() + ':' + where;
  const HOMEY = /^(houses|apartments|hq|park|school|church|courthouse|jail|sallyport|records|substation|firestation|farm|woods|garage|plaza|transit|library|clinic|hospital|tower)$/;
  const business = (where) => { const l = H.W().lots.find((x) => x.name === where); return !!(l && !HOMEY.test(l.kind || '')); };
  function afterCall(c, res) {
    if (!c || !c.where || /^block |parking lot|^Main and/.test(c.where) || c.pursuit) return;
    if (/seat belt/i.test(c.title || '')) { S.beltTalk = S.beltTalk || {}; S.beltTalk[H.did()] = Date.now(); H.saveS(); }
    if (!business(c.where)) return;
    const k = ck(c.where), r = S.callers[k] = S.callers[k] || { n: 0, good: 0, settled: 0 }; if (r.settled) return;
    r.n++; if (res && res.n && res.right * 2 >= res.n) r.good++;
    if (r.good >= 3) { r.settled = Date.now(); setTimeout(() => H.radio('Dispatch', 'Funny thing, ' + S.cs + '. ' + c.where + ' used to call us every week. Nothing since you started handling it. Whatever you said, it worked.'), 3500); }
    else if (r.n === 2) setTimeout(() => H.radio('Dispatch', 'That\'s the second call from ' + c.where + '. They\'re going to be regulars.'), 3000);
    H.saveS();
  }
  const settled = (where) => { const r = S.callers[ck(where)]; return !!(r && r.settled); };

  // ---------- a roadside memorial, and a community board whose flyers change ----------
  // each district has one memorial at a corner (a driver lost there years ago; fresh flowers every week), and one board
  // by the busiest lot. Both read back what you've done: a note from the family once you've given the seat belt talk,
  // flyers about the hazards you got fixed and the places that stopped calling.
  const DECOR = new Map();
  function decorFor(W) {
    let d = DECOR.get(W); if (d) return d; d = { mem: null, board: null };
    const T = H.T, N = H.N, cx = N / 2, cy = N / 2; let best = null, bd = 1e9;
    for (const t of W.walk) { const [x, y] = t; let roads = 0; if (W.at(x + 1, y) === T.ROAD) roads++; if (W.at(x - 1, y) === T.ROAD) roads++; if (W.at(x, y + 1) === T.ROAD) roads++; if (W.at(x, y - 1) === T.ROAD) roads++;
      if (roads < 2) continue; const dd = Math.hypot(x - cx * .8, y - cy * 1.1); if (dd < bd) { bd = dd; best = [x + .5, y + .5]; } }
    d.mem = best;
    const lot = W.lots.filter((l) => l.name && l.door).sort((a, b) => Math.hypot(a.door[0] - cx, a.door[1] - cy) - Math.hypot(b.door[0] - cx, b.door[1] - cy))[0];
    if (lot) d.board = [lot.door[0] + 1.6, lot.door[1] + .4, lot.name];
    DECOR.set(W, d); return d;
  }
  const NAMES = ['Daniel Ruiz', 'Marcy Coleman', 'Tre Washington', 'Ana Beltran', 'Kevin Pham'];
  function flyers() {
    const out = [], wk = Math.floor(Date.now() / (7 * 864e5)), did = H.did();
    S.fixes.filter((f) => f.did === did && f.done).slice(-2).forEach((f) => out.push('The ' + WHAT[f.k] + ' near ' + f.where + ' is fixed. Thank you to whoever called it in!'));
    Object.keys(S.callers).filter((k) => k.startsWith(did + ':') && S.callers[k].settled).slice(-1).forEach((k) => out.push(k.split(':').slice(1).join(':') + ': things are quiet again. Thank you, officers. Come on in!'));
    if ((S.beltTalk || {})[did]) out.push('Buckle Up Week: thank you to the officer who came to morning drop-off.');
    const SEASON = ['Lost cat: gray, answers to Biscuit. Reward.', 'Free car seat checks Saturday at the fire station.', 'Night walk: the streetlights committee meets Tuesday.', 'Yard sale this weekend. Everything must go.', 'Slow down: kids at play.'];
    out.push(SEASON[wk % SEASON.length]);
    return out;
  }
  function sprite2(k) {
    if (SPR[k]) return SPR[k];
    let c, g;
    if (k === 'memorial' || k === 'memorialNote') { [c, g] = H.hiCanvas(30, 30, 2); g.fillStyle = '#e7e5e4'; g.fillRect(14, 4, 2.4, 22); g.fillRect(9, 9, 12, 2.4); // a white cross
      [[7, 24, '#f43f5e'], [11, 26, '#facc15'], [19, 26, '#f472b6'], [23, 24, '#fb7185'], [15, 27, '#fde047']].forEach(([x, y, col]) => { g.fillStyle = '#15803d'; g.fillRect(x - .4, y - 5, .8, 5); g.fillStyle = col; g.beginPath(); g.arc(x, y - 5, 2, 0, 7); g.fill(); });
      g.fillStyle = '#fef3c7'; g.fillRect(4, 22, 3, 5); g.fillStyle = '#fbbf24'; g.beginPath(); g.ellipse(5.5, 21.3, .9, 1.4, 0, 0, 7); g.fill(); // a candle
      if (k === 'memorialNote') { g.fillStyle = '#f8fafc'; g.save(); g.translate(21, 14); g.rotate(.15); g.fillRect(-4, -3, 8, 6); g.fillStyle = '#2563eb'; g.fillRect(-3, -1.6, 6, .7); g.fillRect(-3, .2, 4.4, .7); g.restore(); } }
    if (k === 'board') { [c, g] = H.hiCanvas(30, 34, 2); g.fillStyle = '#78350f'; g.fillRect(6, 14, 2, 20); g.fillRect(22, 14, 2, 20); g.fillStyle = '#a16207'; g.fillRect(3, 2, 24, 16); g.fillStyle = '#d6b37a'; g.fillRect(4.5, 3.5, 21, 13);
      [[6, 5, '#fef9c3', 0.1], [13, 4.5, '#bfdbfe', -0.08], [19, 6, '#fecaca', .12], [8, 11, '#bbf7d0', -.1], [16, 11, '#f8fafc', .06]].forEach(([x, y, col, r]) => { g.save(); g.translate(x + 2.5, y + 2.5); g.rotate(r); g.fillStyle = col; g.fillRect(-2.6, -2.6, 5.2, 5.2); g.fillStyle = '#ef4444'; g.beginPath(); g.arc(0, -2.1, .55, 0, 7); g.fill(); g.restore(); }); }
    if (k === 'open') { [c, g] = H.hiCanvas(16, 22, 2); g.fillStyle = '#1f2937'; g.beginPath(); g.moveTo(2, 21); g.lineTo(5, 2); g.lineTo(11, 2); g.lineTo(14, 21); g.closePath(); g.fill(); g.fillStyle = '#4ade80'; g.font = '800 3.6px Meridian,system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('OPEN', 8, 8); g.fillStyle = '#f8fafc'; g.font = '600 2.4px Meridian,system-ui,sans-serif'; g.fillText('come on in', 8, 12); g.fillText('officers', 8, 15); }
    SPR[k] = c; return c;
  }
  function drawDecor(list, vis, ctx) {
    if (H.inside()) return; const W = H.W(), d = decorFor(W), did = H.did();
    const put = (x, y, k, dz) => { const [sx, sy] = H.iso(x, y); if (!vis(sx, sy)) return; list.push({ d: x + y + (dz || 0), f: () => { const s = sprite2(k); ctx.drawImage(s, sx - s.lw / 2, sy - s.lh + 2, s.lw, s.lh); } }); };
    if (d.mem) put(d.mem[0], d.mem[1], (S.beltTalk || {})[did] ? 'memorialNote' : 'memorial');
    if (d.board) put(d.board[0], d.board[1], 'board');
    for (const l of W.lots) { if (!l.name || !settled(l.name) || !l.door) continue; put(l.door[0] + .9, l.door[1] + .3, 'open', .4); }
  }
  // walking past: the memorial and the board speak once a shift each
  let wT = 0;
  function walkBy(dt, P) {
    wT -= dt; if (wT > 0 || H.inside()) return; wT = 1.5; const W = H.W(), d = decorFor(W), did = H.did(), sh = H.shiftKey(); S.seenDecor = S.seenDecor || {};
    if (d.mem && Math.hypot(d.mem[0] - P.x, d.mem[1] - P.y) < 2.6 && S.seenDecor['m' + did] !== sh) { S.seenDecor['m' + did] = sh; H.saveS();
      const who = NAMES[did % NAMES.length], belt = (S.beltTalk || {})[did];
      H.toast(belt ? '🕯 Fresh flowers for ' + who + ', and a new note tucked in them: "Thank you for teaching the kids to buckle up."' : '🕯 A memorial for ' + who + ', killed in a crash at this corner. Somebody brings fresh flowers every week.'); }
    if (d.board && Math.hypot(d.board[0] - P.x, d.board[1] - P.y) < 2.4 && S.seenDecor['b' + did] !== sh) { S.seenDecor['b' + did] = sh; H.saveS(); const f = flyers(); H.toast('📌 Community board: ' + f[0]); }
  }
  return { decor: () => decorFor(H.W()), report, tick, onShift, draw: (list, vis, ctx, observes) => { draw(list, vis, ctx, observes); drawDecor(list, vis, ctx); }, afterCall, settled, walkBy, flyers, get fixes() { return S.fixes; }, get callers() { return S.callers; } };
}
