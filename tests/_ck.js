const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 1100, height: 720 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + (e.stack||'').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 700, sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForTimeout(1500);
  const before = await a.evaluate(() => window.__pc.traffic.length);
  await a.evaluate(() => { window.__pc.load(1); }); await a.waitForTimeout(1500);
  await a.evaluate(() => window.__pc.setClock((16.2 - 6) * 60)); for (let i = 0; i < 6; i++) { await a.waitForTimeout(500); await a.evaluate(() => { document.querySelectorAll('.lorePop .lpBtns button,#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); const d = document.querySelector('#dlg'); if (d && !d.hidden) d.click(); }); }
  const r = await a.evaluate(() => ({ h: window.__pc.hourNow(), traffic: window.__pc.traffic.length, radio: document.getElementById('radio').innerText.slice(-200) }));
  const calls = await a.evaluate(() => { const o = []; for (let i = 0; i < 12; i++) { window.__pc.dropCall(); window.__pc.dispatchCall(); const c = window.__pc.call; if (c) o.push(c.title + ' [' + c.les + ']'); } return o; });
  console.log('central traffic', before, JSON.stringify(r)); console.log(calls.join(' | ')); console.log(errs.join('\n') || 'no errors'); await b.close(); })();
