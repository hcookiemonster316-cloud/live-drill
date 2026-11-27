// Sim Arena practice vs bots: teams, roles, replay on reveal, team result
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2000);
  await a.evaluate(() => window.__pc.MG.open()); await a.waitForTimeout(600);
  await a.evaluate(() => { const b = document.querySelector('[data-solo="arena"]'); b && b.click(); }); await a.waitForTimeout(800);
  await a.evaluate(() => { const s = document.getElementById('mgStart'); s && s.click(); }); 
  let shot = 0; for (let i = 0; i < 160; i++) { await a.waitForTimeout(500); const st = await a.evaluate(() => { const b = document.querySelector('.mgOpts [data-o]:not([disabled])'); if (b) { b.click(); return 'pick'; } if (document.querySelector('.arReplay')) return 'replay'; if (document.querySelector('#mgAgain, #mgHub')) return 'done'; return 'wait'; }); if (st === 'replay' && !shot) { shot = 1; await a.waitForTimeout(1600); await a.screenshot({ path: 'ar_replay.png' }); } if (st === 'done') break; }
  console.log('final:', await a.evaluate(() => (document.querySelector('.mgCard') || {}).innerText.replace(/\n+/g, ' | ').slice(0, 300)));
  await a.screenshot({ path: 'ar_final.png' });
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
