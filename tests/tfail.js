// failure opens a scene: a missed decision comes back as a partner's offer to cover (and the report that doesn't match),
// a citizen complaint with a second chance at the decision, or a camera review at roll call
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 1500, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, vpart: 'walsh', cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.FAIL, null, { timeout: 20000 });
  const free = async () => { for (let i = 0; i < 40; i++) { if (await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); return pc.free; })) return true; await a.waitForTimeout(400); } errs.push('street never free'); return false; };
  // plays a scene: answers the decision right (the right option's text), then picks the choice containing `pick`
  const play = async (pick, shot) => { let asked = 0; for (let i = 0; i < 70; i++) { await a.waitForTimeout(380); const st = await a.evaluate((pk) => { const d = document.getElementById('dlg'); if (d.hidden) return 'done'; const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { qb.find((x) => +x.dataset.k === window.__curQ.c).click(); return 'q'; } const bs = [...d.querySelectorAll('.dlgOpts:not(.q) [data-k]')]; if (bs.length) { (bs.find((x) => x.textContent.indexOf(pk) >= 0) || bs[0]).click(); return 'c'; } d.click(); return 'n'; }, pick); if (st === 'q') { asked++; if (shot) { await a.screenshot({ path: shot }); shot = null; } } if (st === 'done') return asked; } errs.push('scene never ended'); return asked; };
  const mk = (k) => a.evaluate((k) => { const pc = window.__pc, les = pc.W.D.lessons[0], f = pc.L.factList([les])[0], q = { id: 'Ttest', fid: f.id, kind: 'fact', les, stem: 'The driver keeps reaching under the seat. What do you do?', opts: ['Step back and order his hands on the wheel', 'Lean in to see what he is reaching for', 'Ask him to hand you whatever is down there', 'Keep writing and let him finish looking'], c: 0, fact: f.text, act: 1, good: 'His hands come up to the wheel.', bad: 'He comes up with a phone. This time.' };
    return pc.FAIL.afterCall({ title: 'Car parked on the sidewalk', where: 'Oak Street' }, { qs: [{ ok: false, q }] }, k); }, k);
  const notes = () => a.evaluate(() => (window.__pc.S.olog || []).map((x) => x[2]));
  await free();
  // 1) a complaint: teaser, then Okonkwo, the second chance, an honest statement
  const p1 = await mk('complaint'); if (!p1 || p1.k !== 'complaint') errs.push('no complaint queued');
  const h1 = await a.evaluate(() => window.__pc.HK.pick()); console.log('hook', h1 && h1.t); if (!h1 || h1.k !== 'fail') errs.push('teaser is not the complaint');
  const r0 = await a.evaluate(() => (window.__pc.S.stat || {}).right || 0);
  await a.evaluate(() => window.__pc.FAIL.tick(true)); const n1 = await play('Tell it straight', 'tfail.png');
  const r1 = await a.evaluate(() => (window.__pc.S.stat || {}).right || 0); console.log('complaint asked', n1, 'right', r0, '->', r1);
  if (n1 !== 1) errs.push('complaint should ask exactly one question'); if (!(r1 > r0)) errs.push('second chance did not count');
  if (!(await notes()).some((t) => /Complaint about Car parked/.test(t) && /honest/.test(t))) errs.push('no complaint note');
  // 2) the partner offers to cover; taking it comes due as a report that doesn't match
  await free(); await a.evaluate(() => { window.__pc.S.vpart = 'walsh'; }); const p2 = await mk('cover'); if (!p2) errs.push('no cover queued (partner?)');
  await a.evaluate(() => window.__pc.FAIL.tick(true)); await play('Leave it out');
  const pm = await a.evaluate(() => window.__pc.S.fail.pend && window.__pc.S.fail.pend.k); if (pm !== 'mismatch') errs.push('taking the cover did not come due');
  await free(); await a.evaluate(() => window.__pc.FAIL.tick(true)); await play('Tell her what happened');
  if (!(await notes()).some((t) => /Corrected the Car parked/.test(t))) errs.push('no correction note');
  // 3) the camera review
  await free(); await mk('again'); await a.evaluate(() => window.__pc.FAIL.tick(true)); const n3 = await play('');
  if (n3 !== 1) errs.push('camera review should ask one question'); if (!(await notes()).some((t) => /Reviewed the camera/.test(t))) errs.push('no review note');
  const left = await a.evaluate(() => window.__pc.S.fail.pend); if (left) errs.push('something still pending');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
