// fact checks inside story scenes: a miss halts the scene at the question (step not advanced); a pass plays the payoff
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 1200, height: 800 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, facts: Object.fromEntries(Array.from({ length: 189 }, (_, i) => ['F' + i, 1])), cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const play = async (wrong) => {
    for (let k = 0; k < 8; k++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"]').forEach((x) => x.click()); document.querySelectorAll('.tCard').forEach((x) => x.remove()); const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mClose,#mDone,button'); if (bt) bt.click(); } }); await a.waitForTimeout(150); }
    await a.evaluate(() => { const pc = window.__pc, A = pc.activeQ(); pc.playStep(A.q.steps[A.i]); });
    const said = [];
    for (let k = 0; k < 120; k++) {
      await a.waitForTimeout(120);
      const st = await a.evaluate((wrong) => { const d = document.getElementById('dlg'); if (d.hidden) return null;
        const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { const q = window.__curQ; const pick = wrong ? qb.find((x) => +x.dataset.k !== q.c) : qb.find((x) => +x.dataset.k === q.c); pick.click(); return 'q'; }
        const ch = d.querySelector('.dlgOpts:not(.q) [data-k="0"]'); if (ch) { ch.click(); return 'ch'; }
        const t = (d.querySelector('#dlgP') || {}).innerText || ''; d.click(); return 'L:' + t.slice(0, 70); }, wrong);
      if (st === null) break; if (st && st.startsWith('L:') && said[said.length - 1] !== st) said.push(st);
    }
    return { step: await a.evaluate(() => window.__pc.S.story[0]), last: said.slice(-2) };
  };
  console.log('miss:', JSON.stringify(await play(true)));
  await a.waitForTimeout(4500);
  console.log('pass:', JSON.stringify(await play(false)));
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
