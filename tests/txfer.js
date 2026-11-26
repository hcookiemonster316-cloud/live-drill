// transfer orders: passing a district's Final Call earns a transfer and you choose which district it opens (any you
// haven't opened), from the City map or a district line; the path says to choose
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], cleared: [0], xferOpen: 1, shift: 'day', unit: 'patrol', xp: 3000, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, cfg: { callCine: false, text: 'instant' }, teach: { done: {}, n: 0, last: Date.now() }, stage: { seen: {}, n: 0, last: Date.now() } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.districtBoard && window.__pc.W, null, { timeout: 20000 });
  for (let i = 0; i < 20; i++) { if (await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); return pc.free; })) break; await a.waitForTimeout(400); }
  const step = await a.evaluate(() => window.__pc.PATH.nextStep().t); console.log('path:', step); if (!/Choose your next district/.test(step)) errs.push('the path does not say to choose: ' + step);
  await a.evaluate(() => window.__pc.districtBoard()); await a.waitForSelector('[data-xf]');
  const opts = await a.evaluate(() => [...document.querySelectorAll('[data-xf]')].map((x) => +x.dataset.xf)); console.log('can transfer to', opts.join(','));
  if (opts.join(',') !== '1,2,3,4') errs.push('every unopened district should be offered: ' + opts.join(','));
  await a.screenshot({ path: 'txfer.png' });
  await a.evaluate(() => document.querySelector('[data-xf="3"]').click());
  await a.waitForFunction(() => window.__pc.W.did === 3, null, { timeout: 20000 }).catch(() => errs.push('did not travel to the chosen district'));
  const st = await a.evaluate(() => { const S = window.__pc.S; return { un: S.unlocked.slice().sort().join(','), x: S.xferOpen, home: S.home }; }); console.log(JSON.stringify(st));
  if (st.un !== '0,3' || st.x !== 0 || st.home !== 3) errs.push('transfer state wrong: ' + JSON.stringify(st));
  // no orders left: the map offers no transfer
  await a.evaluate(() => { window.__pc.closeModal(); window.__pc.districtBoard(); }); await a.waitForTimeout(300);
  if (await a.evaluate(() => document.querySelectorAll('[data-xf]').length)) errs.push('transfer offered without orders');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
