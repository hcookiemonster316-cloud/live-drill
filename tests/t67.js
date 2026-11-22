const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const errs = [];
  const boot = async (cs) => { const a = await c.newPage(); a.on('pageerror', (e) => errs.push(cs + ': ' + e.message)); await a.goto('http://localhost:8765/academy/?mock&skiptitle');
    await a.evaluate((cs) => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs, home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { callCine: false } })), cs);
    await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2000); return a; };
  const A = await boot('1-Adam-12'), B = await boot('2-Baker-14');
  await A.bringToFront(); await A.evaluate(() => window.__pc.MG.open()); await A.waitForTimeout(500); await A.evaluate(() => document.querySelector('[data-host="arena"]').click()); await A.waitForTimeout(1500);
  const code = await A.evaluate(() => { const m = document.querySelector('.mgCard').innerText.match(/\b[A-Z0-9]{5}\b/g); return m ? m.find((x) => /\d/.test(x)) || m[0] : null; }); console.log('code', code);
  await A.evaluate(() => document.getElementById('mgStart').click()); await A.waitForTimeout(2500);
  await B.bringToFront(); await B.evaluate(() => window.__pc.MG.open()); await B.waitForTimeout(1200);
  console.log('B hub rooms:', await B.evaluate(() => [...document.querySelectorAll('.mgRoom')].map((x) => x.innerText.replace(/\n+/g, ' ')).join(' / ')));
  await B.evaluate(() => { const w = document.querySelector('[data-watch]'); w && w.click(); }); await B.waitForTimeout(3000);
  console.log('B watching:', await B.evaluate(() => (document.querySelector('.mgCard') || {}).innerText.replace(/\n+/g, ' | ').slice(0, 200)));
  await B.evaluate(() => { const o = document.querySelector('.mgOpts [data-o]'); o && o.click(); }); await B.waitForTimeout(500);
  console.log('B wrote no answer:', await B.evaluate(() => { const t = JSON.parse(localStorage.getItem('liveMockDB')); const gm = t.mmo.gm || {}; return Object.values(gm).map((r) => Object.keys(r.p || {}).length).join(','); }));
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
