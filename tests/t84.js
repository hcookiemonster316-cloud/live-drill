// radio scenes: idle on shift and log what comes over the radio
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 1200, height: 800 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'night', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { callCine: false, autoQ: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.evaluate(() => { window.__rl = []; const r = document.getElementById('radio'); new MutationObserver(() => { const l = r.lastElementChild; if (l) window.__rl.push(l.innerText); }).observe(r, { childList: true }); });
  for (let k = 0; k < 90; k++) { await a.waitForTimeout(1000); await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"], #mClose, #mDone').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (!d.hidden) { const bye = [...d.querySelectorAll('button')].find((x) => /later|Leave|Take care|Back to/i.test(x.innerText)); (bye || d).click(); } }); }
  console.log((await a.evaluate(() => window.__rl)).join('\n'));
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
