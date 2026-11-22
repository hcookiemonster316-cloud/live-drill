const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, cfg: { callCine: false, text: 'instant', checkEvery: 9999 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(3000);
  await a.evaluate(() => { window.__d = 'x'; window.__pc.VAR.GAMES.perimeter((s) => { window.__d = s; }); }); await a.waitForTimeout(400);
  console.log(await a.evaluate(() => document.querySelectorAll('#vgMini .vgPt').length));
  await a.click('#vgMini .vgPt >> nth=0'); await a.waitForTimeout(100); await a.click('#vgMini .vgPt >> nth=4'); await a.waitForTimeout(100);
  await a.screenshot({ path: 'per1.png' }); await a.click('#vgMini .vgGo'); await a.waitForTimeout(200); await a.screenshot({ path: 'per2.png' });
  await a.click('#vgMini .vgGo'); await a.waitForTimeout(300); console.log('done', await a.evaluate(() => window.__d));
  console.log(errs);
  await b.close();
})();
