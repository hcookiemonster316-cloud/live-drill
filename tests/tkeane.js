// people who disagree for good reasons: after court day the defense attorney meets you on the steps with her reason,
// and when your report had a hole she was right; the cast journal records it
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 1500, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.COURT, null, { timeout: 20000 });
  // an arrest with a missed step comes due: you deny it on the stand, so the report has a hole
  await a.evaluate(() => { const S = window.__pc.S; S.court = { pend: [{ how: 'arrest', title: 'Shoplifting', where: 'Oak Street', sh: 0, due: 0, miss: ['cover'], proc: 2 }], hist: [] }; window.__pc.closeModal(); window.__pc.COURT.testify(S.court.pend[0]); });
  const seen = []; let keane = false;
  for (let i = 0; i < 160 && !keane; i++) { await a.waitForTimeout(380); const st = await a.evaluate(() => { const pc = window.__pc; document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); const d = document.getElementById('dlg');
      if (d.hidden) { const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mClose,#mDone,.qAct button'); if (bt) bt.click(); } if (pc.curCall) pc.dropCall(); return null; }
      const txt = d.innerText; const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { qb.find((x) => +x.dataset.k === window.__curQ.c).click(); return 'q'; }
      const bs = [...d.querySelectorAll('.dlgOpts:not(.q) [data-k]')]; if (bs.length) { (bs.find((x) => /didn.t do anything wrong|followed|by the book|Everybody|don.t recall|she was right/i.test(x.textContent)) || bs[bs.length - 1]).click(); return 'c:' + txt.slice(0, 60); } d.click(); return 'n:' + txt.slice(0, 80); });
    if (st) seen.push(st); keane = await a.evaluate(() => !!(window.__pc.S.flags || {}).keaneRight); }
  const K = await a.evaluate(() => window.__pc.S.keane); console.log('keane', JSON.stringify(K), 'right:', keane);
  if (!K || !K.n) errs.push('Keane never met you on the steps'); if (!keane) errs.push('could not tell her she was right');
  if (!seen.some((x) => /nineteen|follows him/.test(x))) errs.push('her reason was never given');
  await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); pc.journalTab('cast'); }); await a.waitForSelector('.cbCard');
  const card = await a.evaluate(() => ([...document.querySelectorAll('.cbCard')].find((c) => /Marisol Keane/.test(c.innerText)) || {}).innerText || ''); console.log('journal:', card.replace(/\s+/g, ' ').slice(0, 200));
  if (!/Every report read out loud/.test(card) || !/She was right about your report/.test(card)) errs.push('journal missing Keane');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
