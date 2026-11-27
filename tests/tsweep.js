// the scene check: closing in on a call, two things to look at turn up around the address; walking up to one asks a
// quick call about it (options alike in length); the right one is remembered in the scene's opening line and scores a
// Scene check row in the debrief
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 3000, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, cfg: { callCine: false, text: 'instant' }, teach: { done: {}, n: 0, last: Date.now() }, stage: { seen: {}, n: 0, last: Date.now() } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.sweep, null, { timeout: 20000 });
  for (let i = 0; i < 20; i++) { if (await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); return pc.free; })) break; await a.waitForTimeout(400); }
  const sp = await a.evaluate(() => { const pc = window.__pc, P = pc.P, t = pc.W.walk.find(([x, y]) => Math.hypot(x - P.x, y - P.y) > 4 && Math.hypot(x - P.x, y - P.y) < 7); const c = { x: t[0] + .5, y: t[1] + .5, accepted: true, title: 'Two-car crash', where: 'Test St', les: 0, t0: 0 }; window.__c = c; pc.sweep.call = c; P.x = c.x - 3; P.y = c.y; pc.sweep.tick(); return c.hs ? c.hs.length : -1; });
  console.log('things to look at', sp); if (sp !== 2) errs.push('expected two things on scene: ' + sp);
  await a.waitForTimeout(400); await a.screenshot({ path: 'tsweep.png' });
  await a.evaluate(() => { const pc = window.__pc, h = window.__c.hs[0]; pc.P.x = h.x; pc.P.y = h.y; pc.P.path = []; pc.sweep.tick(); });
  for (let i = 0; i < 20 && !(await a.evaluate(() => !!document.querySelector('#dlg:not([hidden]) .dlgOpts [data-k]'))); i++) { await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d.hidden) d.click(); }); await a.waitForTimeout(300); }
  if (!(await a.evaluate(() => !!document.querySelector('#dlg:not([hidden]) .dlgOpts [data-k]')))) errs.push('no scene-check choice: ' + (await a.evaluate(() => document.getElementById('dlg').hidden ? 'dialog closed' : document.getElementById('dlg').innerText.slice(0, 120))));
  const opts = await a.evaluate(() => [...document.querySelectorAll('#dlg .dlgOpts [data-k]')].map((x) => x.textContent.replace(/^\d▸/, '').trim())); console.log('options', opts.join(' | '));
  if (opts.length === 2) { const r = opts[0].length / opts[1].length; if (r < .7 || r > 1.43) errs.push('options differ a lot in length'); }
  const ok = await a.evaluate(() => window.__c.hs[0].it.ok); await a.evaluate((ok) => { const bs = [...document.querySelectorAll('#dlg .dlgOpts [data-k]')]; const x = bs.find((y) => y.textContent.indexOf(ok) >= 0) || bs[0]; if (x) x.click(); }, ok);
  for (let i = 0; i < 12 && !(await a.evaluate(() => document.getElementById('dlg').hidden)); i++) { await a.evaluate(() => document.getElementById('dlg').click()); await a.waitForTimeout(300); }
  const st = await a.evaluate(() => { const c = window.__c, pc = window.__pc; const row = pc.sweep.row(c); pc.sweep.call = null; return { good: c.swGood, notes: c.swNotes, row }; });
  console.log(JSON.stringify(st)); if (st.good !== 1 || !st.notes || !st.notes.length) errs.push('the right call was not remembered'); if (!st.row || st.row[1] !== 'Scene check' || st.row[2] !== 5) errs.push('debrief row wrong: ' + JSON.stringify(st.row));
  const none = await a.evaluate(() => { const c = { x: 10, y: 10, accepted: true, title: 'Seat belt talk at drop-off' }; window.__pc.sweep.spawn(c); return c.hs.length; }); if (none) errs.push('a call off the road got a scene check');
  // the debrief shows the loop: what you chose, what the city keeps, how far your career moved
  const lp = await a.evaluate(() => new Promise((ok) => { const pc = window.__pc, c = { open: 'assess', wrap: 'case', where: 'Test St', swNotes: ['marked the skid marks'] }, loop = pc.loopOf(c, 40); pc.POL.debrief({ loop, title: 'Test call', where: 'Test St', right: 2, n: 3, fast: true, resp: 30, wrap: 'case', xp: 40, qs: [] }, () => {}); setTimeout(() => { const el = document.querySelector('.dbfLoop'); ok({ loop, text: el ? el.innerText.replace(/\s+/g, ' ') : '' }); }, 500); }));
  console.log('loop', lp.text.slice(0, 220)); await a.screenshot({ path: 'tsweep_debrief.png' });
  if (!/You chose/i.test(lp.text) || !/took in the scene first/.test(lp.text) || !/remembers/i.test(lp.text) || !/of the way to|Graduate/.test(lp.text)) errs.push('the debrief does not show the loop');
  // the person you helped stays at the address, waves as you pass and thanks you once
  await a.evaluate(() => window.__pc.closeModal());
  const th = await a.evaluate(() => new Promise((ok) => { const pc = window.__pc, P = pc.P, t = pc.W.walk.find(([x, y]) => Math.hypot(x - P.x, y - P.y) > 2 && Math.hypot(x - P.x, y - P.y) < 3.5); pc.thanks.at({ x: t[0] + .5, y: t[1] + .5 }, 'A'); pc.thanks.at({ x: t[0] + .5, y: t[1] + .5 }, 'D'); setTimeout(() => { const L = pc.thanks.list; ok({ n: L.length, said: L[0] && L[0].said, wave: L[0] && L[0].wave }); }, 600); }));
  console.log('thanks', JSON.stringify(th)); await a.screenshot({ path: 'tsweep_thanks.png' }); if (th.n !== 1 || !th.said || !th.wave) errs.push('the person you helped did not wave and thank you (only after a good call): ' + JSON.stringify(th));
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
