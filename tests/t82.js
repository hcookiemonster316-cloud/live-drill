const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 41, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false }, side: { badge214: 99, drowned: 99, room9: 99, sideb: 99 }, de: { n: 3, win: 2 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  for (let k = 0; k < 15; k++) { await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d.hidden) { const o = d.querySelector('.dlgOpts [data-k]'); if (o) o.click(); else d.click(); } document.querySelectorAll('.tCard').forEach((x) => x.click()); const b = [...document.querySelectorAll('button')].find((x) => /back to patrol/i.test(x.innerText) && x.offsetParent); if (b) b.click(); }); await a.waitForTimeout(250); }
  await a.evaluate(() => window.__pc.LV.panel()); await a.waitForTimeout(400); await a.screenshot({ path: 'lv_panel.png' });
  await a.evaluate(() => window.__pc.LV.play('landing')); await a.waitForTimeout(900); await a.screenshot({ path: 'lv_flash.png' });
  for (let k = 0; k < 30 && await a.evaluate(() => !document.getElementById('dlg').hidden); k++) { await a.evaluate(() => { const d = document.getElementById('dlg'), o = d.querySelector('.dlgOpts [data-k]'); if (o) o.click(); else d.click(); }); await a.waitForTimeout(260); }
  console.log('lives seen', await a.evaluate(() => JSON.stringify(window.__pc.S.lives)), 'flash class', await a.evaluate(() => document.body.classList.contains('flashback')));
  await a.waitForTimeout(600); await a.evaluate(() => { const b = document.getElementById('mClose'); if (b) b.click(); });
  await a.evaluate(() => window.__pc.LV.gazette()); await a.waitForTimeout(500); await a.screenshot({ path: 'gz.png' });
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
