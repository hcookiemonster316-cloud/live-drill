const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false }, side: { badge214: 9 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  for (let k = 0; k < 15; k++) { await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d.hidden) { const o = d.querySelector('.dlgOpts [data-k]'); if (o) o.click(); else d.click(); } document.querySelectorAll('.tCard').forEach((x) => x.click()); }); await a.waitForTimeout(250); }
  for (let k = 0; k < 4; k++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol/i.test(x.innerText) && x.offsetParent); if (b) b.click(); }); await a.waitForTimeout(400); }
  const g = []; for (let i = 0; i < 8; i++) g.push(await a.evaluate(() => window.__pc.gossip()));
  console.log('gossip samples:', [...new Set(g)].join(' || '));
  await a.evaluate((t) => { const pc = window.__pc; pc.POL.barks.push({ e: { x: pc.P.x + 1, y: pc.P.y }, text: t, t: 30, t0: 30 }); }, g[0] || 'Light\'s on at the school at two a.m. again. Mr. Leon\'s worried sick.');
  await a.waitForTimeout(700); await a.screenshot({ path: 'gossip.png' });
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
