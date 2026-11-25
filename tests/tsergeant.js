// sergeant mode: late in a career roll call offers the board; you assign three calls, read what came back, and sign
// one report (a knowledge check); fits and misfits change trust, and the board is once a shift
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 5000, calls: 60, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, cfg: { callCine: false, text: 'instant', checkEvery: 9999 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForSelector('#mSgt', { timeout: 15000 }).catch(() => errs.push('no board at roll call for a Vice President'));
  await a.screenshot({ path: 'tsergeant_roll.png' });
  await a.click('#mSgt'); await a.waitForSelector('.sgCall');
  const n = await a.evaluate(() => document.querySelectorAll('.sgCall').length); if (n !== 3) errs.push('board shows ' + n + ' calls');
  const goOff0 = await a.evaluate(() => document.getElementById('sgGo').disabled);
  for (let i = 0; i < n; i++) { await a.evaluate((i) => { const b = [...document.querySelectorAll('.sgPick[data-i="' + i + '"]:not([disabled])')][0]; b.click(); }, i); await a.waitForTimeout(100); }
  const dup = await a.evaluate(() => { const on = [...document.querySelectorAll('.sgPick.on')].map((x) => x.dataset.k); return on.length !== new Set(on).size; }); if (dup) errs.push('one officer took two calls');
  await a.screenshot({ path: 'tsergeant_board.png' });
  const goOff1 = await a.evaluate(() => document.getElementById('sgGo').disabled); if (!goOff0 || goOff1) errs.push('Send them should wait until every call has an officer');
  const t0 = await a.evaluate(() => JSON.stringify(window.__pc.S.pmem || {}));
  await a.click('#sgGo'); await a.waitForSelector('#sgSign'); const res = await a.evaluate(() => [...document.querySelectorAll('.memRow')].map((x) => x.className.split(' ').pop() + ': ' + x.innerText.replace(/\s+/g, ' ').slice(0, 90)));
  res.forEach((x) => console.log(' ', x)); await a.click('#sgSign');
  let qs = 0; for (let i = 0, idle = 0; i < 30 && idle < 5; i++) { await a.waitForTimeout(380); const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { const q = window.__curQ; (qb.find((x) => +x.dataset.k === q.c) || qb[0]).click(); return 'q'; } d.click(); return 'n'; }); if (st == null) idle++; else { idle = 0; if (st === 'q') qs++; } }
  const s = await a.evaluate(() => ({ sgt: window.__pc.S.sgt, can: window.__pc.SGT.can(), pmem: JSON.stringify(window.__pc.S.pmem || {}) }));
  console.log('questions', qs, 'state', JSON.stringify(s.sgt), 'again this shift', s.can);
  if (qs !== 1) errs.push('signing should be exactly one knowledge check, saw ' + qs); if (!s.sgt || s.sgt.runs !== 1 || s.sgt.caught !== 1) errs.push('the board run was not recorded');
  if (s.can) errs.push('the board can be run twice in one shift'); if (s.pmem === t0) errs.push('assignments changed nobody\'s trust');
  // the fit rule: the right officer on a call beats the wrong one
  const f = await a.evaluate(() => { const G = window.__pc.SGT, Q = G.SQUAD, c = { tags: ['people'] }; return { navarro: G.fit(Q.find((o) => o.k === 'navarro'), c), park: G.fit(Q.find((o) => o.k === 'park'), c) }; });
  if (!(f.navarro > f.park)) errs.push('fit rule is backwards ' + JSON.stringify(f));
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
