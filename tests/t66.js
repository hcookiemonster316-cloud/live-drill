const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '2-Bravo-14', home: 0, unlocked: [0, 1], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { autoQ: false, callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  for (let i = 0; i < 5; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); const m = document.getElementById('modal'); if (!m.hidden) { const bb = [...m.querySelectorAll('button')].pop(); bb && bb.click(); } }); await a.waitForTimeout(500); }
  await a.evaluate(() => { const t = JSON.parse(localStorage.getItem('liveMockDB')); t.mmo.aid = { 0: { uFAKE: { x: 40, y: 40, c: '3-Charlie-7', f: 1, l: 'Disturbance at the marina', s: 'day', t: Date.now() } } }; localStorage.setItem('liveMockDB', JSON.stringify(t)); new BroadcastChannel('liveMock').postMessage(1); });
  await a.waitForTimeout(3000); console.log('aid card:', await a.evaluate(() => { const e = document.getElementById('aidCard'); return e ? (e.hidden ? 'hidden' : e.innerText.replace(/\n+/g, ' | ')) : 'missing'; }), await a.evaluate(() => JSON.stringify(window.__pc.dbg())));
  await a.screenshot({ path: 'co_aid.png' });
  if (await a.evaluate(() => !!document.getElementById('aidYes') && !document.getElementById('aidCard').hidden)) { await a.evaluate(() => document.getElementById('aidYes').click()); await a.waitForTimeout(4000); console.log('after accept district', await a.evaluate(() => window.__pc.W.did), JSON.stringify(await a.evaluate(() => window.__pc.S.aid))); }
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
