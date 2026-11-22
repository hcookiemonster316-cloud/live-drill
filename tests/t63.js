const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  await a.evaluate(() => { window.__rep = null; window.__pc.PREM.report({ title: 'Shoplifter detained', where: 'Founders Plaza', t0: 100, prio: 1, coop: '2-Baker-14' }, (row) => { window.__rep = row; }); });
  await a.waitForTimeout(500); await a.screenshot({ path: 'p_report.png' });
  for (let i = 0; i < 3; i++) { await a.evaluate(() => { const b = document.querySelector('.rpt [data-k]:not([disabled])'); b && b.click(); }); await a.waitForTimeout(1300); }
  console.log('row', await a.evaluate(() => JSON.stringify(window.__rep)));
  await a.evaluate(() => { const S = window.__pc.S; S.cfg.uiScale = 1.25; S.cfg.oneHand = true; window.__pc.PREM.applyComfort(); }); await a.waitForTimeout(400); await a.screenshot({ path: 'p_comfort.png' });
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
