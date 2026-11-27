const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const a = await b.newPage({ viewport: { width: 390, height: 844 } }); a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Alpha-12', home: 0, unlocked: [0,1,2,3,4], shift: 'day', unit: 'patrol', xp: 9000, sound: false, seenIntro: 1, story: { 0: 6, 1: 6, 2: 6, 3: 6, 4: 6 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(400); await a.click('#mDone'); await a.waitForTimeout(2500);
  const SQ = await a.evaluate(async () => (await import('./sidequests.js')).SIDE2.map((q) => ({ id: q.id, d: q.d, giver: q.giver, giverAt: q.giverAt, at: q.steps.map((s) => s.at) })));
  for (let d = 0; d < 5; d++) {
    await a.evaluate((d) => window.__pc.load(d), d); await a.waitForTimeout(1500);
    const r = await a.evaluate((qs) => { const pc = window.__pc, out = []; qs.forEach((q) => { const g = pc.giverPos(q); if (!g) out.push(q.id + ': no giver (' + (q.giverAt || q.giver) + ')'); q.at.forEach((n) => { if (!pc.W.lots.some((l) => (l.name || '').indexOf(n) >= 0) && !pc.W.landmarks?.some?.((l) => l.name === n)) out.push(q.id + ': missing place ' + n); }); }); return out; }, SQ.filter((q) => q.d === d));
    console.log('district', d, r.length ? r.join('; ') : 'all givers + places found');
  }
  // play a full new friendship story
  for (const [d, id] of [[0, 'pruitt'], [4, 'exhibita'], [3, 'shonda']]) {
    await a.evaluate((d) => window.__pc.load(d), d); await a.waitForTimeout(1500);
    for (let part = 0; part < 5; part++) {
      await a.evaluate((id) => { const pc = window.__pc; pc.S.npc[id] = 9; pc.S.arcs = pc.S.arcs || {}; const r = pc.regs.find((x) => x.n.id === id); pc.npcTalk(r); }, id);
      let picked = false;
      for (let k = 0; k < 40; k++) {
        await a.waitForTimeout(200);
        const st = await a.evaluate(() => { const d = document.querySelector('#dlg'); if (d.hidden) return null; return { q: !!d.querySelector('.dlgOpts.q [data-k]:not([disabled])'), ch: [...d.querySelectorAll('.dlgOpts:not(.q) [data-k]')].map((x) => x.innerText) }; });
        if (!st) break;
        if (st.q) { await a.evaluate(() => { const q = window.__curQ; (document.querySelector('#dlg .dlgOpts.q [data-k="' + (q && q.c) + '"]') || document.querySelector('#dlg .dlgOpts.q [data-k]')).click(); }); await a.waitForTimeout(900); continue; }
        if (st.ch.length) { let i = picked ? st.ch.length - 1 : st.ch.findIndex((c) => c.includes('💛')); if (i < 0) i = 0; if (!picked && st.ch[i].includes('💛')) picked = true; else if (picked) i = 0; await a.evaluate((i) => document.querySelector('#dlg [data-k="' + i + '"]').click(), i); if (picked && !st.ch.some((c) => c.includes('💛'))) { } continue; }
        await a.evaluate(() => { const d = document.querySelector('#dlg'); d.click(); d.click(); }); await a.waitForTimeout(80);
      }
      await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"], #mClose, #mDone').forEach((x) => x.click()); });
      await a.waitForTimeout(300);
    }
    console.log(id, 'arc parts done:', await a.evaluate((id) => window.__pc.S.arcs[id], id));
  }
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
