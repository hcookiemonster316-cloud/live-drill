// color script: calm, the peak of a priority call with lights on, and the gold of a case closed well
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 600 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false, callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(4000);
  const close = () => a.evaluate(() => { document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); [...document.querySelectorAll('button')].filter((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent).forEach((x) => x.click()); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.body.classList.add('shotMode'); });
  await a.mouse.click(450, 300); await a.waitForTimeout(600); await close();
  await a.evaluate(() => { window.__pc.S.arc.slot = 0; }); await a.waitForTimeout(1500); await close();
  console.log('calm T', await a.evaluate(() => window.__pc.MOOD.T.toFixed(2))); await a.screenshot({ path: 'tmood_calm.png' });
  await a.evaluate(() => { const pc = window.__pc; pc.S.arc.slot = 4; if (pc.curCall) pc.dropCall(); for (let i = 0; i < 40 && !(pc.curCall && pc.curCall.prio === 1); i++) { if (pc.curCall) pc.dropCall(); document.querySelectorAll('.pairOpt,[data-pair]').forEach(() => {}); pc.dispatchCall(); const po = document.querySelector('#modal:not([hidden]) button[data-i="0"], #modal:not([hidden]) .poRow button'); if (po) po.click(); } if (pc.curCall) { pc.curCall.accepted = true; pc.P.inCar = true; } document.querySelectorAll('#modal').forEach((m) => { m.hidden = true; }); });
  await a.waitForTimeout(2500); await close();
  console.log('peak T', await a.evaluate(() => window.__pc.MOOD.T.toFixed(2)), await a.evaluate(() => window.__pc.curCall && window.__pc.curCall.prio));
  await a.screenshot({ path: 'tmood_peak.png' }); await a.waitForTimeout(260); await a.screenshot({ path: 'tmood_peak2.png' });
  await a.evaluate(() => { const pc = window.__pc; if (pc.curCall) pc.dropCall(); pc.P.inCar = false; pc.S.arc.slot = 0; pc.MOOD.resolve(1); }); await a.waitForTimeout(500);
  await a.screenshot({ path: 'tmood_gold.png' });
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close(); })();
