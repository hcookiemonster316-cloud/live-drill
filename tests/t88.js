// learning drives progress: side-case locks, NPC waves, the main-story fact gate, field checks while walking, and the full-chapter exam
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 1200, height: 800 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, cfg: { callCine: false, text: 'instant', } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const info = await a.evaluate(() => { const pc = window.__pc, LF = pc.LF, L = pc.L;
    const sides = pc.SIDE.filter((q) => q.d === 0).map((q) => [q.id, LF.sideNeed(q)]);
    const steps = pc.CHAPTERS[0].steps.map((_, i) => LF.mainNeed(pc.CHAPTERS[0], i));
    // no two-statement question anywhere: sample every fact's question 5 times
    let two = 0; for (let i = 0; i < L.factCount(); i++) for (let k = 0; k < 5; k++) { const q = L.factQ('F' + i); if (/^\s*Statement A/.test(q.stem)) two++; }
    const ord = L.examOrder(); return { total: L.factCount(), uniq: new Set(ord).size, two, sides, steps, lock: LF.nextLock(0) }; });
  console.log(JSON.stringify(info));
  // main gate: at step 1 with no facts the step asks questions instead of advancing
  await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"]').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mClose,#mDone,button'); if (bt) bt.click(); } });
  await a.waitForTimeout(300);
  const g = await a.evaluate(() => { const pc = window.__pc, A = pc.activeQ(); pc.playStep(A.q.steps[A.i]); const d = document.getElementById('dlg'); return { open: !d.hidden, kicker: (d.querySelector('.dlgK,.dlgKick,[class*=kick]') || {}).innerText || d.innerText.slice(0, 120) }; });
  console.log('gate:', JSON.stringify(g));
  for (let k = 0; k < 40; k++) { await a.waitForTimeout(100); const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { const q = window.__curQ; qb.find((x) => +x.dataset.k === q.c).click(); return 1; } d.click(); return 1; }); if (st === null) break; }
  console.log('after gate: facts', await a.evaluate(() => Object.keys(window.__pc.S.facts || {}).length), 'story', await a.evaluate(() => window.__pc.S.story[0]));
  await a.waitForTimeout(4500);
  for (let k = 0; k < 8; k++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"]').forEach((x) => x.click()); document.querySelectorAll('.tCard').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mClose,#mDone,button'); if (bt) bt.click(); } }); await a.waitForTimeout(150); }
  console.log('before walk', JSON.stringify(await a.evaluate(() => window.__pc.dbg())));
  // walking: a field check fires after checkEvery seconds of moving
  let fc = null; for (let k = 0; k < 110 && !fc; k++) { await a.evaluate(() => { const P = window.__pc.P; P.path = [[P.x + 3, P.y], [P.x + 3, P.y + 3], [P.x, P.y + 3], [P.x, P.y], [P.x + 3, P.y], [P.x + 3, P.y + 3], [P.x, P.y + 3], [P.x, P.y]]; }); await a.waitForTimeout(500);
    fc = await a.evaluate(() => { const d = document.getElementById('dlg'); return d.hidden ? null : d.innerText.slice(0, 160); }); if (k % 10 === 0) console.log(k, JSON.stringify(await a.evaluate(() => { const pc = window.__pc; return [(pc.P.path || []).length, !!pc.call, document.getElementById('modal').hidden, pc.dbg && pc.dbg()]; }))); }
  console.log('field check:', JSON.stringify(fc));
  await a.screenshot({ path: 'fc.png' });
  for (let k = 0; k < 40; k++) { await a.waitForTimeout(100); const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { const q = window.__curQ; qb.find((x) => +x.dataset.k === q.c).click(); return 1; } d.click(); return 1; }); if (st === null) break; }
  await a.waitForTimeout(800); await a.screenshot({ path: 'trk.png' });
  console.log('tracker:', await a.evaluate(() => (document.querySelector('.qtFacts') || {}).innerText || 'none'));
  // exam covers every fact
  const ex = await a.evaluate(async () => { const pc = window.__pc; pc.chapterExam(); await new Promise((r) => setTimeout(r, 400)); const run = pc.S.runs.exam; return { order: run.order.length, stages: document.getElementById('dlg').innerText.match(/STAGE \d+ OF \d+/) }; });
  console.log('exam:', JSON.stringify(ex));
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
