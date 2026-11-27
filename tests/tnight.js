// Shift Rotation (was Night Shift): only on the title menu after graduating, explained before it starts; a run starts
// right away (no roll call) on the next shift in the rotation, in an opened district, with calls coming faster; end of
// watch shows the score, keeps your best and gives you your own shift back
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0, 1], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, nightRun: 1, nightRuns: 1, cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo');
  await a.waitForFunction(() => window.__pc && window.__pc.NR && window.__pc.NR.active(), null, { timeout: 20000 }).catch(() => errs.push('the run never started'));
  await a.waitForTimeout(3500);
  const r = await a.evaluate(() => { const pc = window.__pc, S = pc.S; return { roll: !!document.getElementById('mDone') && /ROLL CALL/.test(document.getElementById('modal').innerText), shift: S.shift, did: pc.W.did, wx: !!(pc.dbg && 1), pace: pc.NR.pace() }; });
  console.log(JSON.stringify(r)); if (r.roll) errs.push('roll call shown on a Night Shift run'); if (r.shift !== 'mid') errs.push('not the next shift in the rotation (mid after one run): ' + r.shift); if (![0, 1].includes(r.did)) errs.push('district not one you opened'); if (r.pace <= 1) errs.push('calls do not come faster');
  await a.evaluate(() => { const pc = window.__pc; pc.S.calls += 4; pc.closeModal(); pc.endOfWatch(); }); await a.waitForSelector('#eNext');
  const card = await a.evaluate(() => (document.querySelector('.nrCard') || {}).innerText || ''); console.log('card', card.replace(/\s+/g, ' ')); await a.screenshot({ path: 'tnight.png' });
  const st = await a.evaluate(() => ({ shift: window.__pc.S.shift, best: window.__pc.S.nightBest, run: window.__pc.S.nightRun, act: window.__pc.NR.active(), pace: window.__pc.NR.pace() }));
  if (!/SHIFT ROTATION/.test(card) || !/MIDSHIFT/.test(card) || !/4 calls/.test(card) || !/New best/.test(card)) errs.push('score card wrong'); if (st.shift !== 'day') errs.push('your own shift was not put back: ' + st.shift); if (!(st.best > 0) || st.run || st.act || st.pace !== 1) errs.push('run did not close: ' + JSON.stringify(st));

  // the title menu: hidden before graduating; after, a Shift Rotation entry that explains itself before starting
  const menu = async (grad) => { const p = await b.newPage({ viewport: { width: 420, height: 860 } }); p.on('pageerror', (e) => errs.push(e.message)); await p.goto('http://localhost:8765/academy/?mock');
    await p.evaluate((g) => localStorage.setItem('patrolcity:v1', JSON.stringify(Object.assign({ cs: '1-Alpha-12', home: 0, unlocked: [0, 1], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, nightBest: 812 }, g ? { graduated: Date.now() } : {}))), grad);
    await p.reload(); for (let i = 0; i < 80 && !(await p.evaluate(() => document.querySelectorAll('#title .tiMenu button').length > 2)); i++) { await p.evaluate(() => document.querySelectorAll('.bgGo, .bootSkip, .fe.boot').forEach((x) => x.click())); await p.waitForTimeout(500); } /* through the press-to-start gate and the logos */ await p.waitForFunction(() => !document.querySelector('.fe.boot'), null, { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(1200);
    const labels = await p.evaluate(() => [...document.querySelectorAll('#title .tiMenu button b')].map((x) => x.textContent)); let info = '';
    if (grad) { await p.evaluate(() => [...document.querySelectorAll('#title .tiMenu button')].find((x) => /Shift Rotation/.test(x.textContent)).click()); await p.waitForSelector('#rotGo'); info = await p.evaluate(() => { const r = document.querySelector('.rotInfo'); return r ? r.innerText : 'NO PANEL: ' + document.getElementById('rotGo').closest('div').parentElement.className; }); await p.screenshot({ path: 'tnight_info.png' }); }
    await p.close(); return { labels, info }; };
  const m0 = await menu(false), m1 = await menu(true); console.log('menu before', m0.labels.join(','), '| after', m1.labels.join(','), '| info', m1.info.replace(/\s+/g, ' ').slice(0, 120));
  if (m0.labels.some((x) => /Rotation|Night/.test(x))) errs.push('the mode shows before graduating'); if (!m1.labels.includes('Shift Rotation') || m1.labels.some((x) => /Night/.test(x))) errs.push('no Shift Rotation after graduating');
  if (!/rotates/.test(m1.info) || !/Next up:/.test(m1.info)) errs.push('the description is missing');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
