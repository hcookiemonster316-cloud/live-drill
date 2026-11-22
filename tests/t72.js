const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message)); await a.goto('http://localhost:8765/academy/?mock&skiptitle'); await a.waitForFunction(() => window.__pc && window.__pc.CHAPTERS, null, { timeout: 20000 });
  console.log(await a.evaluate(() => window.__pc.CHAPTERS.map((c) => c.steps.filter((s) => s.give || s.twist || s.take).map((s) => c.d + ':' + s.goal.slice(0, 30) + ' give=' + (s.give || '') + ' take=' + (s.take || '') + ' twist=' + (s.twist ? s.twist.title : ''))).flat().join('\n')));
  console.log(errs.length ? errs : 'no errors'); await b.close(); })();
