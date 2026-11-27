// backup request: A asks, B gets a card, accepts, gets routed, arrives and plays cover; A sees en route
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const errs = [];
  const boot = async (cs) => { const a = await c.newPage(); a.on('pageerror', (e) => errs.push(cs + ': ' + e.message)); await a.goto('http://localhost:8765/academy/?mock&skiptitle');
    await a.evaluate((cs) => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs, home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { autoQ: false } })), cs);
    await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
    for (let i = 0; i < 5; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); }); await a.waitForTimeout(500); }
    return a; };
  const A = await boot('1-Alpha-12'); const B = await boot('2-Bravo-14');
  await A.bringToFront(); await A.evaluate(() => window.__pc.dispatchCall()); await A.waitForTimeout(400);
  await A.evaluate(() => document.getElementById('ccBk').click()); await A.waitForTimeout(2500);
  await B.bringToFront(); await B.waitForTimeout(1500);
  const card = await B.evaluate(() => { const e = document.getElementById('bkCard'); return e.hidden ? 'hidden' : e.innerText.replace(/\n+/g, ' | '); }); console.log('B card:', card);
  await B.screenshot({ path: 'bk_card.png' });
  if (card !== 'hidden') { await B.evaluate(() => document.getElementById('bkYes').click()); console.log('tree a:', await B.evaluate(() => { const t = JSON.parse(localStorage.getItem('liveMockDB')); const p = t.mmo[0].day.p; return JSON.stringify(Object.fromEntries(Object.entries(p).map(([k, v]) => [k, [v.c, v.a, !!v.b]]))) + ' me=' + sessionStorage.getItem('liveMockUid'); })); for (let i = 0; i < 1; i++) { await B.waitForTimeout(500); console.log('B t', i, await B.evaluate(() => JSON.stringify({ dlg: !document.getElementById('dlg').hidden, P: [window.__pc.P.x.toFixed(1), window.__pc.P.y.toFixed(1)], path: window.__pc.P.path.length }))); }
    await A.bringToFront(); await A.waitForTimeout(1500); console.log('A status:', await A.evaluate(() => (document.querySelector('.ccBkS') || {}).innerText || '(none)'), await A.evaluate(() => JSON.stringify(Object.entries(window.__pc.others).map(([k, o]) => [k.slice(0, 6), o.c, o.a, !!o.b]))), await A.evaluate(() => !!window.__pc.call));
    await B.bringToFront(); await B.evaluate(() => { const pc = window.__pc, c = pc.others; const k = Object.keys(c).find((k) => c[k].b); if (k) { pc.P.x = c[k].b.x + .5; pc.P.y = c[k].b.y + .5; pc.P.path = []; } }); await B.waitForTimeout(2000);
    console.log('B in cover scene:', await B.evaluate(() => document.getElementById('dlg').innerText.slice(0, 160).replace(/\n+/g, ' | ')));
    await A.bringToFront(); await A.waitForTimeout(1500); console.log('A status 2:', await A.evaluate(() => (document.querySelector('.ccBkS') || {}).innerText || '(none)'));
    await A.evaluate(() => document.getElementById('ccBk').click()); await A.waitForTimeout(2000); await B.bringToFront(); await B.waitForTimeout(1000); }
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
