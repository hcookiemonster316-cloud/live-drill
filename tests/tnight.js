// Night Shift mode: a run starts right away (no roll call) at night, in an opened district, in rough weather, with
// calls coming faster; end of watch shows the Night Shift score and keeps your best
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, nightRun: 1, cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo');
  await a.waitForFunction(() => window.__pc && window.__pc.NR && window.__pc.NR.active(), null, { timeout: 20000 }).catch(() => errs.push('the run never started'));
  await a.waitForTimeout(3500);
  const r = await a.evaluate(() => { const pc = window.__pc, S = pc.S; return { roll: !!document.getElementById('mDone') && /ROLL CALL/.test(document.getElementById('modal').innerText), shift: S.shift, did: pc.W.did, wx: !!(pc.dbg && 1), pace: pc.NR.pace() }; });
  console.log(JSON.stringify(r)); if (r.roll) errs.push('roll call shown on a Night Shift run'); if (r.shift !== 'night') errs.push('not a night shift'); if (![0, 1].includes(r.did)) errs.push('district not one you opened'); if (r.pace <= 1) errs.push('calls do not come faster');
  await a.evaluate(() => { const pc = window.__pc; pc.S.calls += 4; pc.closeModal(); pc.endOfWatch(); }); await a.waitForSelector('#eNext');
  const card = await a.evaluate(() => (document.querySelector('.nrCard') || {}).innerText || ''); console.log('card', card.replace(/\s+/g, ' ')); await a.screenshot({ path: 'tnight.png' });
  const st = await a.evaluate(() => ({ best: window.__pc.S.nightBest, run: window.__pc.S.nightRun, act: window.__pc.NR.active(), pace: window.__pc.NR.pace() }));
  if (!/NIGHT SHIFT/.test(card) || !/4 calls/.test(card) || !/New best/.test(card)) errs.push('score card wrong'); if (!(st.best > 0) || st.run || st.act || st.pace !== 1) errs.push('run did not close: ' + JSON.stringify(st));
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
