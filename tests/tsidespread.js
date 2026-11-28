// side cases are spread out (owner's call, 2026-11-27): with many cases open in a district, at most two are posted at a
// time, their people at least 16 tiles apart; taking one gives a breather before the next is posted; driving past a
// giver doesn't pop an offer.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(1500);
  const ok = await a.evaluate(() => { const pc = window.__pc; if (!pc.L || !pc.L.factList) return false; pc.S.facts = pc.S.facts || {}; pc.L.factList(pc.W.D.lessons).forEach((f) => { pc.S.facts[f.id] = 1; }); pc.S.xp = Math.max(pc.S.xp, 6000); Object.keys(pc.S.story).forEach((k) => { pc.S.story[k] = 99; }); return true; }); /* every district fact learned: every case it holds is open */
  if (!ok) { console.log('no fact hook; skipping'); await b.close(); return; }
  await a.waitForTimeout(3500);
  const r = await a.evaluate(() => { const pc = window.__pc, raw = pc.SIDE.filter(pc.sideAvailRaw), on = pc.SIDE.filter(pc.sideAvail), pos = on.map((q) => pc.giverPos(q)).filter(Boolean); let md = 1e9; for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) md = Math.min(md, Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y)); return { raw: raw.length, on: on.length, md }; });
  console.log('open', r.raw, 'posted', r.on, 'closest', r.md === 1e9 ? '-' : r.md.toFixed(1));
  if (r.raw < 3) fail.push('setup: only ' + r.raw + ' cases open');
  if (r.on > 2) fail.push(r.on + ' cases posted at once');
  if (r.on === 2 && r.md < 16) fail.push('posted cases only ' + r.md.toFixed(1) + ' tiles apart');
  if (r.on < 1) fail.push('nothing posted');
  // take one: the next one waits for a breather
  const n2 = await a.evaluate(() => { const pc = window.__pc, q = pc.SIDE.find(pc.sideAvail); pc.S.side[q.id] = 0; pc.S.sideRest = Date.now(); return q.id; });
  await a.waitForTimeout(800); const after = await a.evaluate(() => window.__pc.SIDE.filter(window.__pc.sideAvail).length); console.log('after taking one:', after);
  if (after > r.on - 1) fail.push('a new case was posted right away: ' + after);
  await a.evaluate(() => { window.__pc.S.sideRest = Date.now() - 200e3; }); await a.waitForTimeout(800);
  const later = await a.evaluate(() => window.__pc.SIDE.filter(window.__pc.sideAvail).length); console.log('after the breather:', later);
  if (r.raw > 2 && later < Math.min(2, r.raw - 1)) fail.push('no new case after the breather');
  // driving past a posted giver: no offer
  const drove = await a.evaluate(() => { const pc = window.__pc, q = pc.SIDE.find(pc.sideAvail), g = q && pc.giverPos(q); if (!g) return null; pc.P.inCar = true; pc.P.x = g.x + .4; pc.P.y = g.y; pc.P.path = []; return q.id; });
  if (drove) { await a.waitForTimeout(1500); const dlg = await a.evaluate(() => !document.getElementById('dlg').hidden || !!document.querySelector('.cn')); if (dlg) fail.push('an offer popped while driving past'); await a.evaluate(() => { window.__pc.P.inCar = false; }); }
  void n2;
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
