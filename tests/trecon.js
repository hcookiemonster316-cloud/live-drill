// scenes you piece together: find the evidence, fill in the sheet, answers lock in three at a time without saying which
// one is wrong, a scene can be left open on the mystery board and finished later, and finishing it is remembered
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'tests/out';
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 760 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { pursuits: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W && window.__booted, null, { timeout: 20000 }); await a.waitForTimeout(2000);
  await a.addStyleTag({ content: '.lorePop,.tCard{display:none!important}' });
  const open = (id) => a.evaluate((id) => { window.__rows = null; const pc = window.__pc; pc.EP.sceneTest(id, { where: 'Main St', vcn: 'Ms. Ruiz', x: pc.P.x, y: pc.P.y }, (rows) => { window.__rows = rows; pc.closeModal(); }); }, id);
  const findAll = () => a.evaluate(() => { const real = [...document.querySelectorAll('[data-iv]')]; real.forEach((b) => { if (!/no|ok/.test(b.className)) b.click(); }); });
  const findReal = async () => { for (let i = 0; i < 10; i++) { const n = await a.evaluate(() => { const b = [...document.querySelectorAll('[data-iv]')].find((x) => !x.classList.contains('ok') && !x.classList.contains('no')); if (!b) return 0; b.click(); return 1; }); if (!n) break; await a.waitForTimeout(80); } };
  const set = (vals) => a.evaluate((vals) => { vals.forEach((v, k) => { const el = document.querySelector('[data-rc="' + k + '"]'); if (!el || v == null) return; el.value = String(v); el.dispatchEvent(new Event('change')); }); }, vals);
  const locked = () => a.evaluate(() => document.querySelectorAll('.rcSheet li.ok').length);
  // 1) the crash scene: evidence, then the sheet
  await open('rearend'); await a.waitForSelector('[data-iv]'); await findReal(); await a.screenshot({ path: OUT + '/trecon_find.png' });
  await a.click('#ivNext'); await a.waitForSelector('.rcSheet');
  // two right and four wrong: nothing locks, nothing says which is right
  await set([0, 0, 1, 1, 1, 1]); let n = await locked(); console.log('2 right ->', n); if (n) errs.push('locked with only two right');
  // four right: all four lock at once
  await set([null, null, 0, 0, 1, 1]); n = await locked(); console.log('4 right ->', n); if (n !== 3) errs.push('the third right answer should lock three, got ' + n); /* the fourth waits for two more */
  await a.waitForTimeout(300); await a.screenshot({ path: OUT + '/trecon_sheet.png' });
  // the last two, both right, close it
  await a.evaluate(() => { document.querySelectorAll('[data-rc]').forEach((el) => { el.value = '0'; el.dispatchEvent(new Event('change')); }); }); n = await locked(); console.log('6 right ->', n); if (n !== 6) errs.push('last two did not lock');
  await a.click('#rcFile'); await a.waitForFunction(() => window.__rows); const r1 = await a.evaluate(() => window.__rows[0]); console.log('row', JSON.stringify(r1)); if (!r1 || r1[0] !== '🔎' || r1[2] < 6) errs.push('scene row missing or low: ' + JSON.stringify(r1));
  const mem = await a.evaluate(() => window.__pc.MEM.deeds.filter((d) => d.k === 'solved').length); if (!mem) errs.push('solving was not remembered');
  // 2) leave one open, find it on the board, finish it later
  await open('burg'); await a.waitForSelector('[data-iv]'); await findReal(); await a.click('#ivNext'); await a.waitForSelector('.rcSheet');
  await set([0, 0, 0, 1, null, null]); await a.click('#rcLeave'); await a.waitForFunction(() => window.__rows);
  const r2 = await a.evaluate(() => window.__rows[0][4]); console.log('left open:', r2); if (!/left open/.test(r2)) errs.push('leave-open row wrong');
  await a.evaluate(() => { const pc = window.__pc; pc.S.reps.dale = { st: 2, w: ['talk', 'talk'], last: 'talk', right: 1, sh: -1 }; pc.S.reps.lena = { st: 4, w: ['talk'], last: 'talk', right: 2, sh: -1, done: 'good' }; });
  await a.evaluate(() => window.__pc.EP.board()); await a.waitForSelector('[data-ro]'); await a.screenshot({ path: OUT + '/trecon_board.png' });
  await a.evaluate(() => window.__pc.closeModal());
  const thr = await a.evaluate(() => { window.__pc.EP.board(); const t = [...document.querySelectorAll('.mbThread')].map((x) => x.innerText.replace(/\s+/g, ' ')); window.__pc.closeModal(); return t; }); console.log('threads', JSON.stringify(thr)); if (!thr.some((t) => /Dale Hutchins.*2 of 4/.test(t))) errs.push('regular missing from the board');
  await a.evaluate(() => window.__pc.EP.board()); await a.waitForSelector('[data-ro]');
  await a.click('[data-ro="0"]'); await a.waitForSelector('.rcSheet'); n = await locked(); console.log('reopened with', n, 'locked'); if (n !== 3) errs.push('reopened scene lost its progress');
  const xp0 = await a.evaluate(() => window.__pc.S.xp || 0);
  await a.evaluate(() => { document.querySelectorAll('[data-rc]').forEach((el) => { el.value = '0'; el.dispatchEvent(new Event('change')); }); }); await a.click('#rcFile'); await a.waitForTimeout(500);
  const end = await a.evaluate(() => ({ open: window.__pc.S.recon.open.length, solved: window.__pc.S.recon.solved, xp: window.__pc.S.xp || 0 })); console.log('end', JSON.stringify(end), 'xp before', xp0);
  if (end.open !== 0 || end.solved !== 2) errs.push('board did not close the scene: ' + JSON.stringify(end));
  console.log(errs.length ? errs.slice(0, 4).join('\n') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
