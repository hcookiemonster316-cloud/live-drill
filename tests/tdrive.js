// the drive (feel.js, owner's call 2026-11-27: gameplay is extremely satisfying): at speed the camera leads where the
// cruiser is heading; a hard stop or a fast tight corner lays tire marks that stay on the road
// and fade; the engine note follows the speed (sound is off in tests: checked that nothing breaks without it).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(1500);
  const clear = () => a.evaluate(() => { document.querySelectorAll('.lorePop [data-a]:not([data-a="read"])').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mDone, #mClose'); if (bt) bt.click(); } });
  for (let i = 0; i < 6; i++) { await clear(); await a.waitForTimeout(300); }
  for (let i = 0; i < 12 && !(await a.evaluate(() => window.__pc.P.inCar)); i++) { await clear(); await a.evaluate(() => { const P = window.__pc.P; if (!P.path || !P.path.length) document.getElementById('bCar').click(); }); await a.waitForTimeout(1200); } /* you walk to the cruiser first */
  if (!(await a.evaluate(() => window.__pc.P.inCar))) fail.push('could not get in the car');
  // a long straight drive
  const go = await a.evaluate(() => { const pc = window.__pc, P = pc.P, W = pc.W; let best = null, bd = 0; for (const t of W.road || W.walk) { const d = Math.hypot(t[0] - P.x, t[1] - P.y); if (d > bd && d < 26 && (t[0] === Math.floor(P.x) || t[1] === Math.floor(P.y))) { bd = d; best = t; } } if (!best) return null; pc.goTo(best[0] + .5, best[1] + .5); return [best, bd]; });
  if (!go) fail.push('no road to drive');
  let lead = 0; for (let i = 0; i < 14; i++) { await a.waitForTimeout(250); const r = await a.evaluate(() => Math.hypot(window.__pc.LEAD.x, window.__pc.LEAD.y)); lead = Math.max(lead, r); }
  await a.screenshot({ path: 'w_drive.png' });
  console.log('lead', lead.toFixed(1));
  if (lead < 15) fail.push('the camera did not lead at speed: ' + lead.toFixed(1));
  // a hard stop from speed lays marks
  await a.evaluate(() => { const P = window.__pc.P; P.path = []; });
  await a.waitForTimeout(600); const m = await a.evaluate(() => window.__pc.FEEL.marks); console.log('marks', m);
  if (m < 1) fail.push('a hard stop left no tire marks');
  await a.screenshot({ path: 'w_marks.png' });
  // stopped: the lead settles back
  for (let i = 0; i < 6; i++) { await clear(); await a.waitForTimeout(420); } const l2 = await a.evaluate(() => Math.hypot(window.__pc.LEAD.x, window.__pc.LEAD.y)); if (l2 > 8) fail.push('the lead did not settle when stopped: ' + l2.toFixed(1));
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
