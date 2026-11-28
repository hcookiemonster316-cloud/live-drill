// training and causes (spend.js): a course costs money (more as you rank up) and adds its perk for good; a district
// cause raises that district's community trust and dispatch passes on the thanks; nothing is bought twice or on credit.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, cash: 5000, spendHint: 1, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(1500);
  const clear = () => a.evaluate(() => { document.querySelectorAll('.lorePop [data-a]:not([data-a="read"]), .promo button, .rv [data-a="keep"]').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mDone, #mClose'); if (bt) bt.click(); } });
  for (let i = 0; i < 6; i++) { await clear(); await a.waitForTimeout(300); }
  const r0 = await a.evaluate(() => ({ cash: window.__pc.S.cash, cit: window.__pc.gp('rpCit'), tr: window.__pc.S.trust[0] == null ? 50 : window.__pc.S.trust[0] }));
  await a.evaluate(() => window.__pc.SPEND.panel()); await a.waitForSelector('.spRow button'); await a.screenshot({ path: 'w_spend.png' });
  await a.evaluate(() => document.querySelector('[data-buy="c:cit"]').click()); await a.waitForTimeout(300);
  const r1 = await a.evaluate(() => ({ cash: window.__pc.S.cash, cit: window.__pc.gp('rpCit'), have: !!window.__pc.S.courses.cit, btn: !!document.querySelector('[data-buy="c:cit"]') }));
  console.log('course: cash', r0.cash, '->', r1.cash, '| rpCit', r0.cit, '->', r1.cit);
  if (!(r1.cash < r0.cash) || !(r1.cit >= r0.cit + 10) || !r1.have || r1.btn) fail.push('course: ' + JSON.stringify([r0, r1]));
  await a.evaluate(() => document.querySelector('.lkTabs [data-t="causes"]').click()); await a.waitForSelector('[data-buy="d:courtlights"]'); await a.screenshot({ path: 'w_spend_causes.png' });
  await a.evaluate(() => document.querySelector('[data-buy="d:courtlights"]').click()); await a.waitForTimeout(300);
  const r2 = await a.evaluate(() => ({ cash: window.__pc.S.cash, tr: window.__pc.S.trust[0], have: !!window.__pc.S.causes.courtlights }));
  console.log('cause: trust', r0.tr, '->', r2.tr);
  if (!(r2.cash < r1.cash) || r2.tr !== Math.min(100, r0.tr + 8) || !r2.have) fail.push('cause: ' + JSON.stringify(r2));
  // not on credit
  await a.evaluate(() => { window.__pc.S.cash = 5; window.__pc.SPEND.panel(); }); const dis = await a.evaluate(() => [...document.querySelectorAll('[data-buy]')].every((x) => x.disabled)); if (!dis) fail.push('buy buttons enabled without the cash');
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
