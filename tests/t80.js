// traffic keeps right: sample every moving car and check its lane against its heading
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1280, height: 800 } }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  const d = +(process.argv[2] || 0);
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate((d) => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: d, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false } })), d);
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  let ok = 0, bad = 0, stuck = 0; const ex = [];
  for (let i = 0; i < 40; i++) {
    await a.waitForTimeout(500);
    const r = await a.evaluate(() => { const T = window.__pc.traffic; let o = 0, b = 0, s = 0; const e = []; T.forEach((c) => { if (!c.moving) { s++; return; } const x = Math.floor(c.x), y = Math.floor(c.y), hr = y % 11 <= 1 && x % 11 > 1, vr = x % 11 <= 1 && y % 11 > 1; let good = true;
      if (hr && (c.dir === 0 || c.dir === 2)) good = c.dir === 0 ? y % 11 === 1 : y % 11 === 0; else if (vr && (c.dir === 1 || c.dir === 3)) good = c.dir === 1 ? x % 11 === 0 : x % 11 === 1; else return; if (good) o++; else { b++; e.push(x + ',' + y + ' d' + c.dir); } }); return [o, b, s, e]; });
    ok += r[0]; bad += r[1]; stuck += r[2]; ex.push(...r[3]);
  }
  await a.screenshot({ path: 'traffic' + d + '.png' });
  console.log('district', d, 'in correct lane', ok, 'wrong lane', bad, 'stopped samples', stuck, ex.slice(0, 6).join(' '));
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
