// the pursuit report form: filled in wrong on purpose, then the sergeant's check
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(5000); await a.mouse.click(200, 400); await a.waitForTimeout(1000);
  await a.evaluate(() => { document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); window.__res = { n: 0, right: 0 }; window.__pc.HANDS.pursuitReport({ how: 'air', ordered: false, told: true, why: 'Ran a red light and wouldn\'t stop' }, window.__res, () => { window.__done = 1; }); });
  await a.waitForTimeout(400);
  await a.evaluate(() => { const want = { start: /red light/, end: /ended it when/, told: /^Yes/, when: /end of the week/ }; document.querySelectorAll('.prForm select').forEach((x) => { const o = [...x.options].findIndex((op) => want[x.dataset.f].test(op.text)); x.selectedIndex = o; x.dispatchEvent(new Event('change')); }); document.getElementById('prSend').click(); });
  await a.waitForTimeout(400); await a.screenshot({ path: 'treport.png' });
  console.log(await a.evaluate(() => document.getElementById('prOut').innerText.replace(/\s+/g, ' ')), JSON.stringify(await a.evaluate(() => window.__res)));
  console.log(errs.length ? errs : 'no errors'); await b.close(); })();
