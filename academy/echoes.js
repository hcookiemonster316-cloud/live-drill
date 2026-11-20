// Echoes you can see in the city. Some "something's off" moments are road hazards from Lesson 2.2: a pothole in the
// lane, a streetlight out over a crosswalk, a stop sign knocked flat. They're drawn in the world where they are. When you
// check one out and report it, a cone goes up; a few minutes later public works fixes it, dispatch tells you, and the
// fix stays there (a fresh asphalt patch, a light that works, a new sign) for a week so you can drive past what you did.
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
    if (k === 'signDown' || k === 'signUp') { const up = k === 'signUp'; g.save(); if (!up) { g.translate(15, 56); g.rotate(-1.1); g.translate(-15, -56); } g.fillStyle = '#94a3b8'; g.fillRect(14, 20, 2.2, 36); g.fillStyle = '#dc2626'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; g.lineTo(15 + Math.cos(a) * 9, 13 + Math.sin(a) * 9); } g.closePath(); g.fill(); g.strokeStyle = '#f8fafc'; g.lineWidth = 1; g.stroke(); g.fillStyle = '#f8fafc'; g.font = '800 4.6px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('STOP', 15, 14.6); g.restore(); }
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
  return { report, tick, onShift, draw, get fixes() { return S.fixes; } };
}
