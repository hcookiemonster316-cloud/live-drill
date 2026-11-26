// interiors as rich as the streets: every interior has a telling detail by its plant (a line you notice when you walk
// past it, once a visit), light through the doorway with dust in it, and a coffee maker steaming on its first counter
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2], shift: 'day', unit: 'patrol', xp: 3000, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, cfg: { callCine: false, text: 'instant' }, teach: { done: {}, n: 0, last: Date.now() }, stage: { seen: {}, n: 0, last: Date.now() } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.enterBuilding, null, { timeout: 20000 });
  // every plan gets a detail (checked by building each one)
  const all = await a.evaluate(async () => { const m = await import('./interiors.js'), keys = Object.keys(m.DETAILS), pc = window.__pc, out = { n: keys.length, missing: [] }; const kinds = Object.keys(m.ENTER).filter((k, i, arr) => arr.findIndex((x) => m.ENTER[x] === m.ENTER[k]) === i);
    for (const kind of kinds) { const I = m.buildInterior({ kind, name: kind, x: 0, y: 0 }, pc.W, 0); if (!I.details || !I.details.length) out.missing.push(I.key); else if (!I.props.some((p) => p.k === 'beam')) out.missing.push(I.key + ':beam'); } return out; });
  // five variations of every interior: they differ (mirrored, the district's palette, extras), and everything you
  // interact with can still be reached from the door
  const vr = await a.evaluate(async () => { const m = await import('./interiors.js'), pc = window.__pc, N = 145, out = { bad: [], kinds: 0, looks: 0 }; const kinds = Object.keys(m.ENTER).filter((k, i, arr) => arr.findIndex((x) => m.ENTER[x] === m.ENTER[k]) === i);
    for (const kind of kinds) { const seen = new Set(); out.kinds++;
      for (let v = 0; v < 5; v++) { const I = m.buildInterior({ kind, name: kind, x: 0, y: 0, variant: v }, pc.W, 0); seen.add(I.wallCol + I.floor + I.rug + (I.door ? I.door[0] : '') + I.props.length);
        const ok = (x, y) => I.walkable(x, y), start = [Math.floor(I.door[0]), Math.floor(I.door[1]) - 1], reach = new Set([start[1] * N + start[0]]), q = [start];
        while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = ny * N + nx; if (!reach.has(k) && ok(nx, ny)) { reach.add(k); q.push([nx, ny]); } } }
        const near = (x, y) => { x = Math.floor(x); y = Math.floor(y); return reach.has(y * N + x) || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => reach.has((y + dy) * N + x + dx)); };
        const spots = I.staff.map((t) => ['staff', t.x, t.y]).concat(I.citz.map(([x, y]) => ['citizen', x, y]), I.infos.map(([x, y]) => ['info', x, y]), I.caches.map((t) => ['cache', t.x, t.y]), I.secrets.map((t) => ['secret', t.x, t.y]), (I.details || []).map((t) => ['detail', t.x, t.y]));
        spots.forEach(([w, x, y]) => { if (!near(x, y)) out.bad.push(I.key + ' v' + v + ' ' + w); });
        /* no room or corner cut off by furniture: every bit of floor is reachable */ let cut = 0; for (let y = I.oy; y < I.oy + I.h; y++) for (let x = I.ox; x < I.ox + I.w; x++) if (I.walkable(x, y) && !reach.has(y * N + x)) cut++; if (cut) out.bad.push(I.key + ' v' + v + ' ' + cut + ' floor tiles cut off'); }
      out.looks += seen.size; }
    return out; });
  console.log('variations: ' + vr.kinds + ' interiors, ' + vr.looks + ' distinct looks; unreachable:', vr.bad.slice(0, 8).join(', ') || 'none'); if (vr.bad.length) errs.push(vr.bad.length + ' unreachable spots: ' + vr.bad.slice(0, 5).join(', ')); if (vr.looks < vr.kinds * 4) errs.push('variations look too alike: ' + vr.looks);
  console.log('details', all.n, 'missing', all.missing.join(',') || 'none'); if (all.missing.length) errs.push('interiors without a detail or beam: ' + all.missing.join(','));
  for (let i = 0; i < 20; i++) { if (await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); return pc.free; })) break; await a.waitForTimeout(400); }
  // walk into the diner (a counter with coffee) and up to the detail
  const ent = await a.evaluate(() => { const pc = window.__pc, l = pc.W.lots.find((x) => x.door && /diner|cafe|hq/.test(x.kind)) || pc.W.lots.find((x) => x.door); if (!l) return null; pc.enterBuilding(l); return l.kind; });
  await a.waitForFunction(() => window.__pc.inside, null, { timeout: 8000 }).catch(() => errs.push('could not go inside'));
  await a.waitForTimeout(900); const st = await a.evaluate(() => { const W = window.__pc.W; return { key: W.key, coffee: W.props.some((p) => p.life === 'coffee'), det: W.details && W.details[0] }; });
  console.log('inside', ent, st.key, 'coffee', st.coffee); if (!st.det) errs.push('no detail inside ' + st.key);
  await a.screenshot({ path: 'tinterior.png' });
  if (st.det) { await a.evaluate((d) => { const P = window.__pc.P; P.x = d.x + 1.2; P.y = d.y; P.path = []; }, st.det);
    await a.waitForFunction(() => { const c = document.getElementById('sceneCap'); return c && c.classList.contains('on') && c.textContent.length > 20; }, null, { timeout: 6000 }).catch(() => errs.push('the detail was not noticed'));
    const cap = await a.evaluate(() => document.getElementById('sceneCap').textContent); console.log('noticed:', cap.slice(0, 90)); if (cap.indexOf(st.det.text.slice(0, 20)) < 0) errs.push('the caption is not the detail');
    await a.screenshot({ path: 'tinterior_detail.png' }); }
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
