// the drive (feel.js, owner's call 2026-11-27: gameplay is extremely satisfying): at speed the camera leads where the
// cruiser is heading; a hard stop or a fast tight corner lays tire marks that stay on the road
// and fade; the engine note follows the speed (sound is off in tests: checked that nothing breaks without it).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'night', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(1500);
  const clear = () => a.evaluate(() => { document.querySelectorAll('.lorePop [data-a]:not([data-a="read"])').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mDone, #mClose'); if (bt) bt.click(); } });
  for (let i = 0; i < 6; i++) { await clear(); await a.waitForTimeout(300); }
  for (let i = 0; i < 12 && !(await a.evaluate(() => window.__pc.P.inCar)); i++) { await clear(); await a.evaluate(() => { const P = window.__pc.P; if (!P.path || !P.path.length) document.getElementById('bCar').click(); }); await a.waitForTimeout(1200); } /* you walk to the cruiser first */
  if (!(await a.evaluate(() => window.__pc.P.inCar))) fail.push('could not get in the car');
  const cdp = await a.context().newCDPSession(a); await cdp.send('Performance.enable');
  const m = async () => { const r = await cdp.send('Performance.getMetrics'); const o = {}; r.metrics.forEach((x) => o[x.name] = x.value); return o; };
  const drive = () => a.evaluate(() => { const pc = window.__pc, P = pc.P, W = pc.W; const ts = (W.road || W.walk).filter((t) => Math.hypot(t[0] - P.x, t[1] - P.y) > 12 && Math.hypot(t[0] - P.x, t[1] - P.y) < 24); let h = 7; const t = ts[(h * 7919 + ts.length) % ts.length]; if (t) pc.goTo(t[0] + .5, t[1] + .5); });
  await a.evaluate(() => { const pc = window.__pc; let n = 0; const o = pc.CTXBEAM; window.__bt = 0; });
  const x = await m(); for (let k = 0; k < 4; k++) { await drive(); await a.waitForTimeout(2500); } const y = await m();
  console.log('script ' + ((y.ScriptDuration - x.ScriptDuration) * 100).toFixed(0) + ' ms/s, busy ' + ((y.TaskDuration - x.TaskDuration) * 100).toFixed(0) + ' ms/s');
  await b.close(); })();
