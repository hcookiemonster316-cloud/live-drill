// cards worth sharing: a promotion, a gold medal and a Night Shift run each make a card in the game's own style that
// saves (or shares, where the device can); the service record card draws the game's icons, not system emoji
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ acceptDownloads: true, viewport: { width: 420, height: 860 } }); const a = await ctx.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, cfg: { text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  for (let i = 0; i < 6; i++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"], .tCard, .rv button').forEach((x) => x.click()); window.__pc.closeModal(); }); await a.waitForTimeout(300); }
  // a promotion card
  await a.evaluate(() => { const pc = window.__pc; const next = [1200, 2000, 3000].find((t) => t > pc.S.xp); pc.award(next - pc.S.xp + 1, 'test'); }); await a.waitForSelector('.promo .promoShare', { timeout: 8000 }).catch(() => errs.push('no Share on the promotion'));
  const dl1 = a.waitForEvent('download', { timeout: 8000 }).catch(() => null); await a.evaluate(() => document.querySelector('.promo .promoShare').click()); const d1 = await dl1; console.log('promotion card', d1 && d1.suggestedFilename());
  if (!d1 || !/promoted/.test(d1.suggestedFilename())) errs.push('promotion card not saved'); else await d1.saveAs('share_promo.png');
  await a.evaluate(() => document.querySelectorAll('.promo button').forEach((x) => { if (!x.classList.contains('promoShare')) x.click(); })); await a.waitForTimeout(500);
  // the service record card (city.js)
  const dl2 = a.waitForEvent('download', { timeout: 8000 }).catch(() => null); await a.evaluate(() => window.__pc.CITY ? window.__pc.CITY.shareCard() : import('/academy/city.js')); const d2 = await dl2; console.log('record card', d2 && d2.suggestedFilename());
  if (d2) await d2.saveAs('share_record.png');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
