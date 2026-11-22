// journal notes tab + a tale giver on desktop
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 1, unlocked: [0, 1, 2, 3, 4], shift: 'night', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false }, notes: { n_gym: { t: 1 }, n_chapel: { t: 1 } }, lore: { n_gym: 1, n_chapel: 1 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  for (let i = 0; i < 4; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); }); await a.waitForTimeout(300); }
  // stand near the gym note at night
  await a.evaluate(() => { const pc = window.__pc, o = pc.REW.notes().find((x) => x.n.id === 'n_carwash') || pc.REW.notes()[0]; pc.P.x = o.x + 2; pc.P.y = o.y + 2; });
  await a.waitForTimeout(1500); await a.screenshot({ path: 'nt_desk_night.png' });
  await a.evaluate(() => window.__pc.journal && window.__pc.journal()); await a.waitForTimeout(500);
  await a.evaluate(() => { const b = document.querySelector('[data-j="lore"]'); b && b.click(); }); await a.waitForTimeout(500);
  await a.evaluate(() => { const s = [...document.querySelectorAll('.jSec')].find((x) => /Notes/.test(x.innerText)); s && s.scrollIntoView(); }); await a.waitForTimeout(300);
  await a.screenshot({ path: 'nt_journal.png' });
  console.log(await a.evaluate(() => [...document.querySelectorAll('.jSec')].map((x) => x.innerText).join(' | ')));
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
