const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { autoQ: false, drs: false }, cal: { day: 7 }, npc: { delgado: 4, pruitt: 1, dot: 7 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const r1 = await a.evaluate(() => { const C = window.__pc.CAL; const radio = document.getElementById('radio').innerText; return { day: C.day(), left: C.left(), cls: [1, 7, 19, 20].map((d) => C.classOf(d).join(',')), radioHasDay: /Academy day 7 of 20/.test(radio) }; });
  console.log(JSON.stringify(r1));
  const all = await a.evaluate(() => { const C = window.__pc.CAL, s = new Set(); for (let d = 1; d < 20; d++) C.classOf(d).forEach((l) => s.add(l)); return s.size; }); console.log('lessons covered', all);
  await a.evaluate(() => { document.querySelectorAll('.tCard,.lorePop').forEach((x) => x.remove()); window.__pc.CAL.panel(); }); await a.waitForTimeout(400); await a.screenshot({ path: 't97a.png' });
  const html = await a.evaluate(() => document.getElementById('modal').innerText); console.log(/Day 7 of 20/.test(html), /Mr. Delgado/.test(html), /Right now/.test(html));
  await a.evaluate(() => { document.getElementById('calClose').click(); const S = window.__pc.S; S.cal.day = 20; S.cleared = [0, 1, 2, 3, 4]; window.__pc.CAL.onShift(); window.__pc.CAL.panel(); }); await a.waitForTimeout(300); await a.screenshot({ path: 't97b.png' });
  const r2 = await a.evaluate(() => ({ exam: !!document.getElementById('calExam'), radio: /Exam day/.test(document.getElementById('radio').innerText) })); console.log(JSON.stringify(r2));
  // pause menu entry
  await a.evaluate(() => document.getElementById('calExam').click()); await a.waitForTimeout(600); const k = await a.evaluate(() => (document.getElementById('dlg').innerText + document.getElementById('modal').innerText).slice(0, 120)); console.log('exam opened:', /LAST SHIFT|Last shift|1900/.test(k));
  console.log(errs.length ? errs : 'no errors'); await b.close(); })();
