const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { autoQ: false, drs: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2000);
  const r = await a.evaluate(() => { const pc = window.__pc, W = pc.W; let bad = 0, n = 0; const props = W.props; for (let t = 0; t < 400; t++) { const x0 = (Math.random() - .5) * 6000, y0 = Math.random() * 4000 - 500, x1 = x0 + 200 + Math.random() * 1500, y1 = y0 + 200 + Math.random() * 2500;
      const vis = (p) => { const q = p._iso || (p._iso = [(p.x - p.y) * 32, (p.x + p.y) * 16]); return q[0] > x0 && q[0] < x1 && q[1] > y0 && q[1] < y1; };
      const want = new Set(props.filter(vis)), got = new Set(); pc.eachVisProp(x0, y0, x1, y1, (p) => { if (vis(p)) got.add(p); }); n += want.size; if (want.size !== got.size || [...want].some((p) => !got.has(p))) bad++; } return { props: props.length, checked: n, mismatches: bad }; });
  console.log(JSON.stringify(r)); console.log(errs.length ? errs : 'no errors'); await b.close(); })();
