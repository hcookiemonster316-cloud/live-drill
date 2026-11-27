// the ground buffer: a resolution step (dynamic resolution) never repaints the whole ground, and the ground stays
// lined up with the buildings when scaled (screenshot); the buffer wraps around, so walking never copies it
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['Pixel 7'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle&probe'); await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 3000, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, cfg: { callCine: false, text: 'instant', drs: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.drsSet, null, { timeout: 60000 });
  await a.waitForTimeout(5000); await a.evaluate(() => { window.__pc.probe().length = 0; });
  for (const k of [.9, .8, .7, .8, 1]) { await a.evaluate((k) => window.__pc.drsSet(k), k); await a.waitForTimeout(500); }
  const pr = await a.evaluate(() => window.__pc.probe().map((x) => x.fresh)); const full = pr.filter((x) => /\|full\|/.test(x)).length;
  console.log('frames', pr.length, 'full ground repaints across 5 resolution steps:', full); if (full > 0) errs.push(full + ' full ground repaints on resolution steps');
  // walking: the buffer slides by painting strips, never a full repaint
  await a.evaluate(() => { window.__pc.probe().length = 0; const P = window.__pc.P; P.x += 9; }); await a.waitForTimeout(1500);
  const pr2 = await a.evaluate(() => window.__pc.probe().map((x) => x.fresh)); const full2 = pr2.filter((x) => /\|full\|/.test(x)).length; console.log('full repaints while moving:', full2); if (full2 > 0) errs.push('the ground repainted in full while moving');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
