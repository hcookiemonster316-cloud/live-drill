const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2000);
  for (const id of ['lockout', 'followed']) {
    let done = null; await a.evaluate((id) => { window.__deDone = null; window.__pc.DE.start({ deesc: id, where: 'Harbor View Apartments' }, (how) => { window.__deDone = how; }); }, id);
    await a.waitForTimeout(500); if (id === 'lockout') await a.screenshot({ path: 'de_1.png' });
    // play sensibly: prefer listening moves, avoid the risky ones
    for (let i = 0; i < 12; i++) {
      const more = await a.evaluate(() => { const bs = [...document.querySelectorAll('.deOpts [data-k]')]; if (!bs.length) return false; const bad = /calm down|Order them|humor|Move in closer/; const good = bs.find((b) => !bad.test(b.innerText)) || bs[0]; good.click(); return true; });
      if (!more) break; await a.waitForTimeout(350);
    }
    if (id === 'lockout') await a.screenshot({ path: 'de_2.png' });
    console.log(id, 'end:', await a.evaluate(() => document.querySelector('.deBox .deHead b').innerText + ' | ' + document.querySelector('.deSum').innerText.replace(/\n/g, ' ')));
    if (!(await a.$('#deCam'))) console.log('MODAL:', await a.evaluate(() => (document.getElementById('modal')||document.body).innerText.slice(0,300)));
    console.log('AT:', await a.evaluate(() => { const b = document.getElementById('deCam'); const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return (e && (e.id || e.className)) + ' | ' + (e && e.closest('[id]') && e.closest('[id]').id) + ' | ' + Math.round(r.y) + ' ' + innerHeight; }));
    await a.click('#deCam'); await a.waitForTimeout(400); if (id === 'lockout') await a.screenshot({ path: 'de_cam.png' });
    await a.click('#mClose'); await a.waitForTimeout(400); console.log('callback', await a.evaluate(() => window.__deDone));
  }
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
