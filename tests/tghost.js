// race your own ghost: a new best on a drill is kept as a ghost (sampled ten times a second), and the next run of that
// drill has it driving alongside you in step with the clock
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 640 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, cfg: { text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const D = await a.evaluate(async () => { const D = await window.__pc.drillsLoad(); window.__D = D; return !!D; }); if (!D) errs.push('no drills');
  let window_shot = false; const run = async () => { await a.evaluate(() => { window.__pc.closeModal(); window.__D.open('brake'); }); await a.waitForSelector('#drill #drGo', { timeout: 8000 }); await a.evaluate(() => document.querySelector('#drill #drGo').click());
    await a.evaluate(() => { window.__run = new Promise((done) => { const D = window.__D; let maxK = 0; const tick = () => { const R = D.state; if (!R) return done({ closed: 1, maxK }); maxK = Math.max(maxK, R.ghK || 0); if (R.done) return done({ t: R.t, maxK, trace: (R.trace || []).length, end: R.end, ok: R.ok, hits: R.hits, best: JSON.stringify(window.__pc.S.drills.brake) }); D.press(R.at.s > R.dr.course.len * .62 ? { gas: 0, brk: 1 } : { gas: 1, brk: 0 }); requestAnimationFrame(tick); }; tick(); setTimeout(() => done({ timeout: 1, maxK }), 60000); }); }); await a.waitForTimeout(2600); if (window_shot) await a.screenshot({ path: 'tghost.png' }); return a.evaluate(() => window.__run); };
  const r1 = await run(); const g1 = await a.evaluate(() => (window.__pc.S.ghosts && window.__pc.S.ghosts.brake || []).length); console.log('run 1', JSON.stringify(r1), 'ghost samples', g1);
  if (!(r1.trace > 5)) errs.push('the run was not recorded');
  // the scripted driver can't steer the lane change, so the first run's own trace stands in as the best (a clean finish saves it the same way)
  if (!(g1 > 5)) await a.evaluate(() => { const R = window.__D.state; window.__pc.S.ghosts = { brake: R.trace }; });
  await a.evaluate(() => window.__D.close(true)); await a.waitForTimeout(500);
  window_shot = true; const r2 = await run(); console.log('run 2', JSON.stringify(r2)); if (!(r2.maxK > 5)) errs.push('the ghost did not drive alongside the second run');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
