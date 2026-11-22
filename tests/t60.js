// walk away from a call and from the staged exam; camera zoom eases
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(2500); for (let i = 0; i < 4; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); }); await a.waitForTimeout(600); }
  // zoom smoothness: sample cam.z while a punch-in and a cinematic happen and DRS resizes
  const zs = await a.evaluate(() => new Promise((ok) => { const pc = window.__pc, out = []; pc.EP.zoomPunch(); dispatchEvent(new Event('resize')); let n = 0; const f = () => { out.push(+pc.cam.z.toFixed(4)); if (++n < 90) requestAnimationFrame(f); else ok(out); }; requestAnimationFrame(f); }));
  let jump = 0; for (let i = 1; i < zs.length; i++) jump = Math.max(jump, Math.abs(zs[i] - zs[i - 1])); console.log('max zoom step per frame', jump.toFixed(4), 'range', Math.min(...zs), Math.max(...zs));
  await a.evaluate(() => window.__pc.dispatchCall && window.__pc.dispatchCall()); await a.waitForTimeout(500);
  const had = await a.evaluate(() => !!window.__pc.call); console.log('call dispatched', had);
  if (had) { await a.evaluate(() => window.__pc.openCall()); await a.waitForTimeout(1500);
    console.log('dialog open', await a.evaluate(() => !document.getElementById('dlg').hidden));
    await a.click('[data-c="leave"]'); await a.waitForTimeout(200); console.log('armed:', await a.evaluate(() => document.querySelector('[data-c="leave"]').innerText));
    await a.evaluate(() => document.querySelector('[data-c="leave"]').click()); await a.waitForTimeout(800);
    console.log('after leave', await a.evaluate(() => JSON.stringify({ dlg: !document.getElementById('dlg').hidden, call: !!window.__pc.call, accepted: window.__pc.call && window.__pc.call.accepted, dbg: window.__pc.dbg(), left: !!window.__pc.LEFT }))); }
  await a.evaluate(() => window.__pc.chapterExam()); await a.waitForTimeout(1200);
  // click through: answer questions or choices until a stage-break choice appears
  for (let s = 0; s < 40; s++) { const st = await a.evaluate(() => { const k = document.querySelector('#dlg .dlgPanel .dlgCtl') ? document.querySelector('#dlg').innerText : ''; const q = document.querySelector('#dlg .dlgOpts.q [data-k]:not([disabled])'); if (q) { q.click(); return 'q'; } const ch = [...document.querySelectorAll('#dlg .dlgOpts [data-k]')]; if (ch.length) { const brk = ch.find((x) => /step away/i.test(x.innerText)); if (brk) { brk.click(); return 'break'; } ch[0].click(); return 'ch'; } const d = document.getElementById('dlg'); if (!d.hidden) d.click(); return d.hidden ? 'closed' : 'line'; }); if (st === 'break') { console.log('stage break reached at step', s); break; } await a.waitForTimeout(350); }
  await a.waitForTimeout(900); console.log('run saved', await a.evaluate(() => JSON.stringify(window.__pc.S.runs)), 'dbg', await a.evaluate(() => JSON.stringify(window.__pc.dbg())));
  await a.evaluate(() => window.__pc.chapterExam()); await a.waitForTimeout(1200); console.log('resume prompt:', await a.evaluate(() => document.getElementById('dlg').innerText.replace(/\n+/g, ' | ').slice(0, 200)));
  await a.screenshot({ path: 'w_resume.png' });
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
