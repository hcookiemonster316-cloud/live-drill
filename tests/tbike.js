// cyclists drawn from the cached bike sprite and cached rider: close-up of one
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 600 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(4000);
  const close = () => a.evaluate(() => { document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); [...document.querySelectorAll('button')].filter((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent).forEach((x) => x.click()); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.body.classList.add('shotMode'); });
  await a.mouse.click(450, 300); await a.waitForTimeout(600); await close();
  const n = await a.evaluate(() => { const pc = window.__pc, ps = pc.peds || []; let bk = ps.find((p) => p.bike); if (!bk) { bk = ps[0]; bk.bike = true; bk.dir = 0; } pc.P.x = bk.x - .5; pc.P.y = bk.y + .8; pc.P.path = []; if (pc.cam) pc.cam.z = 3.4; return 'bike at ' + bk.x.toFixed(1) + ',' + bk.y.toFixed(1); });
  console.log(n); await a.waitForTimeout(1500); await close(); await a.evaluate(() => { if (window.__pc.cam) window.__pc.cam.z = 3.4; }); await a.waitForTimeout(300);
  await a.screenshot({ path: 'tbike.png', clip: { x: 300, y: 180, width: 300, height: 240 } });
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close(); })();
