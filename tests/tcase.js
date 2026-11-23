// the case file: everything seen on duty is searchable; only the first five hits show; pinning the entry that proves an
// answer closes that question, a wrong entry does not, questions past your story stay locked, two stay open on purpose,
// and your radio log and call reports land in the file as you play
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'tests/out';
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 900 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], story: { 0: 99, 1: 99, 2: 99, 3: 0, 4: 0 }, flags: { heldEvidence: 1, reportedThreat: 1 }, qitems: { evtag: 1 }, shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { pursuits: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W && window.__booted, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  await a.addStyleTag({ content: '.lorePop,.tCard{display:none!important}' });
  // the radio log fills as you play
  const rl = await a.evaluate(() => (window.__pc.S.rlog || []).length); console.log('radio lines logged', rl); if (!rl) errs.push('radio log is empty');
  // opens from the mystery board
  await a.evaluate(() => window.__pc.EP.board()); await a.click('#mbCase'); await a.waitForSelector('#cfIn');
  const search = async (q) => { await a.fill('#cfIn', q); await a.click('.cfSearch button'); await a.waitForTimeout(150); return a.evaluate(() => ({ count: (document.querySelector('.cfCount') || {}).innerText, hits: [...document.querySelectorAll('.cfHit p')].map((p) => p.innerText) })); };
  let r = await search('castillo'); console.log('castillo:', r.count, r.hits.length); if (r.hits.length !== 5 || !/showing the first five/.test(r.count)) errs.push('a wide search should show only five');
  r = await search('pawn log'); console.log('pawn log:', r.count, JSON.stringify(r.hits).slice(0, 200));
  r = await search('V. Lassiter'); console.log('V. Lassiter:', r.count); const idx = r.hits.findIndex((h) => /V\. Lassiter/.test(h)); if (idx < 0) errs.push('cannot find the pawn entry');
  // a wrong entry does not prove it
  const before = await a.evaluate(() => window.__pc.S.cfile ? window.__pc.S.cfile.q.length : 0);
  r = await search('boat'); const wrongI = r.hits.findIndex((h) => !/V\. Lassiter/.test(h)); await a.locator('[data-pin]').nth(wrongI).click(); await a.click('[data-pq="pawn"]'); await a.waitForTimeout(150);
  let after = await a.evaluate(() => window.__pc.S.cfile.q.length); if (after !== before) errs.push('a wrong entry closed the question');
  // the right entry does
  r = await search('V. Lassiter'); await a.locator('[data-pin]').nth(r.hits.findIndex((h) => /V\. Lassiter/.test(h))).click(); await a.screenshot({ path: OUT + '/tcase_pick.png' }); await a.click('[data-pq="pawn"]'); await a.waitForTimeout(200);
  after = await a.evaluate(() => window.__pc.S.cfile.q); console.log('answered', JSON.stringify(after)); if (after.indexOf('pawn') < 0) errs.push('the right entry did not close the question');
  // evidence and other answers reachable from what this save has seen
  for (const [q, word, re] of [['tags', '88-1142', /88-1142/], ['plan', 'after this week', /after this week/i], ['hide', 'slip nine', /slip nine/i]]) { r = await search(word); const i = r.hits.findIndex((h) => re.test(h)); if (i < 0) { errs.push('no hit for ' + word); continue; } await a.locator('[data-pin]').nth(i).click(); await a.click('[data-pq="' + q + '"]'); await a.waitForTimeout(150); }
  const st = await a.evaluate(() => ({ q: window.__pc.S.cfile.q, lock: [...document.querySelectorAll('.cfQ.lock')].length, open: [...document.querySelectorAll('.cfQ.open')].length }));
  console.log('state', JSON.stringify(st)); if (st.q.length !== 4) errs.push('expected four answered: ' + st.q); if (st.open !== 2) errs.push('two questions should stay open'); if (!st.lock) errs.push('questions past the story should be locked');
  await a.fill('#cfIn', ''); await a.evaluate(() => document.querySelector('.modal, #modal').scrollTo && document.querySelector('#modal').scrollTo(0, 0)); await a.screenshot({ path: OUT + '/tcase.png' });
  console.log(errs.length ? errs.slice(0, 4).join('\n') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
