// Lassiter in person: once his name is in the pawn file he turns up on your beat, talks to you directly, and how you
// handle him goes into the case file, Castillo's trust, the next-shift teaser and (after the arrest) his letter
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 2, unlocked: [0, 1, 2], shift: 'day', unit: 'patrol', xp: 2500, calls: 30, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6, 1: 5, 2: 3 }, cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.LAS, null, { timeout: 20000 });
  const free = async () => { for (let i = 0; i < 40; i++) { if (await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); return pc.free; })) return true; await a.waitForTimeout(400); } return false; };
  const play = async (pick) => { for (let i = 0; i < 60; i++) { await a.waitForTimeout(380); const st = await a.evaluate((pk) => { const d = document.getElementById('dlg'); if (d.hidden) return 'done'; const bs = [...d.querySelectorAll('.dlgOpts [data-k]')]; if (bs.length) { (bs.find((x) => x.textContent.indexOf(pk) >= 0) || bs[0]).click(); return 'c'; } d.click(); return 'n'; }, pick); if (st === 'done') return; } errs.push('scene never ended'); };
  if (!await free()) errs.push('street never free');
  const t0 = await a.evaluate(() => performance.now()); await a.evaluate(() => window.__pc.LAS.tick(true)); const tk = await a.evaluate((t) => performance.now() - t, t0);
  const r = await a.evaluate(() => { const r = window.__pc.regs.find((x) => x.n.las); return r ? { las: r.n.las, x: r.x, y: r.y } : null; }); console.log('placed', JSON.stringify(r), 'tick ' + tk.toFixed(1) + ' ms');
  if (!r || r.las !== 'coffee') errs.push('Lassiter not placed for the coffee meeting');
  const rl = await a.evaluate(() => (window.__pc.S.rlog || []).map((x) => x[3]).filter((t) => /gray sedan/i.test(t)).length); if (!rl) errs.push('no dispatch heads-up');
  const hk = await a.evaluate(() => window.__pc.HK.pick()); console.log('hook', hk && hk.t); if (!hk || hk.k !== 'las') errs.push('next-shift teaser is not about Lassiter');
  const t1 = await a.evaluate(() => window.__pc.S.pmem && window.__pc.S.pmem.castillo ? window.__pc.S.pmem.castillo.t : 60);
  await a.evaluate(() => { const pc = window.__pc, r = pc.regs.find((x) => x.n.las); pc.P.x = r.x; pc.P.y = r.y + 1.2; pc.npcTalk(r); });
  await a.waitForTimeout(800); await a.screenshot({ path: 'tlassiter.png' });
  await play('Ask if he has a minute');
  const after = await a.evaluate(() => { const pc = window.__pc, S = pc.S; return { seen: S.las && S.las.seen.coffee, flag: !!S.flags.lasAsk, t: S.pmem.castillo.t, still: pc.regs.some((x) => x.n.las), note: (S.olog || []).map((x) => x[2]).filter((t) => /Lassiter/.test(t)).length, hits: pc.CASE.search('gray sedan').n }; });
  console.log('after', JSON.stringify(after), 'castillo', t1, '->', after.t);
  if (after.seen !== 'lasAsk' || !after.flag) errs.push('choice not remembered'); if (after.still) errs.push('he never left'); if (!after.note || !after.hits) errs.push('no case-file note'); if (!(after.t > t1)) errs.push('Castillo trust did not rise');
  // the courthouse remembers the curb
  const ch = await a.evaluate(() => JSON.stringify(window.__pc.CHAPTERS[4].steps[2].say).indexOf('lasAsk') >= 0); if (!ch) errs.push('courthouse has no callback');
  // after the arrest: the letter, logged
  await a.evaluate(() => { const pc = window.__pc, S = pc.S; S.story[3] = pc.CHAPTERS[3].steps.length; S.story[4] = pc.CHAPTERS[4].steps.length; });
  await free(); await a.evaluate(() => window.__pc.LAS.tick(true)); await a.waitForSelector('#dlg:not([hidden])', { timeout: 5000 }).catch(() => errs.push('no letter scene'));
  await play('Log the letter'); await a.waitForTimeout(800); await play('');
  const lt = await a.evaluate(() => window.__pc.S.las.letter); console.log('letter', lt); if (lt !== 'logged') errs.push('letter not logged');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
