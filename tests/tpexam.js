// a practice exam that feels like the real one: 50 four-option questions at the state exam's pace, no feedback until
// it's handed in, saved stages you can step away from, a results screen with every miss, and the readiness meter's
// prediction for those questions checked against the score. Plus review in the flow: a fixed miss comes back spaced.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 1500, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.PEX && window.__pc.L, null, { timeout: 20000 });
  // the cadet knows 60% of the chapter
  const known = await a.evaluate(() => { const pc = window.__pc, ids = pc.L.allFactIds(); pc.S.facts = {}; ids.forEach((id, i) => { if (i % 5 < 3) pc.S.facts[id] = 1; }); return Object.keys(pc.S.facts).length + ' of ' + ids.length; }); console.log('known', known);
  for (let i = 0; i < 20 && !(await a.evaluate(() => window.__pc.free)); i++) { await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); }); await a.waitForTimeout(400); }
  await a.evaluate(() => { window.__pc.closeModal(); window.__pc.PATH.panel(); }); await a.waitForSelector('#pathPx');
  const card = await a.evaluate(() => document.querySelector('.pxCard').innerText); console.log('card:', card.replace(/\s+/g, ' ')); if (!/predicted on a practice exam/.test(card)) errs.push('no prediction on the meter');
  await a.screenshot({ path: 'tpexam_card.png' }); await a.click('#pathPx');
  let asked = 0, revealed = 0, retry = 0, stages = 0, steppedAway = false;
  for (let i = 0; i < 700; i++) { await a.waitForTimeout(260);
    const st = await a.evaluate(() => { const d = document.getElementById('dlg'), m = document.getElementById('modal'); if (!m.hidden && /PRACTICE EXAM · RESULTS/.test(m.innerText)) return 'results'; if (d.hidden) return 'idle';
      if (/One more try/.test(d.innerText)) return 'retry'; if (d.querySelector('.dlgOpts.q .ok, .dlgOpts.q .no')) return 'reveal';
      const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { const q = window.__curQ, k = window.__pc.S.facts[q.fid] ? q.c : (Math.random() * 4) | 0; qb.find((x) => +x.dataset.k === k).click(); return 'q'; }
      const bs = [...d.querySelectorAll('.dlgOpts:not(.q) [data-k]')]; if (bs.length) return 'choice:' + bs.map((x) => x.textContent).join('|'); d.click(); return 'n'; });
    if (st === 'results') break; if (st === 'q') asked++; if (st === 'reveal') revealed++; if (st === 'retry') retry++;
    if (st.startsWith('choice:')) { stages++; // step away once, mid-exam, and come back through Your Path
      if (stages === 4 && !steppedAway) { steppedAway = true; await a.evaluate(() => [...document.querySelectorAll('#dlg .dlgOpts [data-k]')].find((x) => /Step away/.test(x.textContent)).click()); await a.waitForTimeout(600); await a.evaluate(() => { window.__pc.closeModal(); window.__pc.PATH.panel(); }); await a.waitForSelector('#pathPx'); await a.click('#pathPx'); }
      else { const ok = await a.evaluate(() => { const b = [...document.querySelectorAll('#dlg .dlgOpts [data-k]')].find((x) => /Keep going/.test(x.textContent)); if (b) { b.click(); return true; } return false; }); if (!ok) { console.log('other choice:', st.slice(0, 160)); await a.evaluate(() => document.querySelector('#dlg .dlgOpts [data-k]').click()); } } }
    if (st === 'idle' && asked >= 50) break; }
  const res = await a.evaluate(() => document.getElementById('modal').innerText.replace(/\s+/g, ' ')); console.log('pxlog', JSON.stringify(await a.evaluate(() => window.__pxlog))); console.log('asked', asked, 'revealed', revealed, 'retry', retry, 'stages', stages); console.log(res.slice(0, 330));
  await a.screenshot({ path: 'tpexam.png' });
  if (asked !== 50) errs.push('asked ' + asked + ' questions, not 50'); if (revealed) errs.push('answers were revealed during the exam'); if (retry) errs.push('a second try was offered during the exam');
  const h = await a.evaluate(() => (window.__pc.S.pex || {}).hist || []); if (!h.length) errs.push('no result saved'); else { const x = h[h.length - 1]; console.log('predicted', x.pred, 'got', x.got); if (Math.abs(x.pred - x.got) > 8) errs.push('prediction off by ' + Math.abs(x.pred - x.got)); }
  if (!/Predicted \d+ for these questions; you got \d+/.test(res)) errs.push('results do not compare with the prediction');
  if (!/of 45:00/.test(res)) errs.push('no time readout');
  // review in the flow: a missed fact, fixed, comes back on a spaced schedule and the meter moves
  await a.evaluate(() => window.__pc.closeModal());
  const rv = await a.evaluate(() => { const pc = window.__pc, S = pc.S, id = pc.L.allFactIds().find((x) => !S.facts[x]); S.fmiss = { [id]: Date.now() - 5 * 60000 }; const q = pc.L.examQsSingle([id])[0]; pc.scoreAnswer(q, q.c, false); return { due: S.fdue && S.fdue[id], rev: S.frev && S.frev[id], gap: S.fdue && Math.round((S.fdue[id] - Date.now()) / 60000) }; });
  console.log('review', JSON.stringify(rv)); if (!(rv.rev === 1 && rv.gap >= 19 && rv.gap <= 20)) errs.push('a fixed miss was not scheduled to come back in 20 minutes');
  await a.waitForFunction(() => /Review: that one.s fixed\. Readiness \d+% → \d+%/.test(document.body.innerText), null, { timeout: 6000 }).catch(() => errs.push('no review toast with the meter'));
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
