// limited off-duty time: end of watch offers one evening (partner, a regular, study group, rest); each choice plays a
// short scene, starts the next shift and shows up in it (trust, friendship, two review questions, calls that wait longer)
const { chromium } = require('playwright');
const base = { cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, npc: {}, cfg: { callCine: false, text: 'instant', checkEvery: 9999 } };
(async () => { const b = await chromium.launch(); const errs = []; const out = {};
  for (const k of ['partner', 'regular', 'study', 'rest']) {
    const a = await b.newPage({ viewport: { width: 420, height: 860 } }); a.on('pageerror', (e) => errs.push(k + ': ' + e.message));
    await a.goto('http://localhost:8765/academy/?mock&skiptitle');
    const npcId = await a.evaluate(async () => { const m = await import('/academy/data.js'); return m.NPCS[0].id; });
    await a.evaluate((s) => localStorage.setItem('patrolcity:v1', JSON.stringify(s)), { ...base, npc: { [npcId]: 2 } });
    await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.OT, null, { timeout: 20000 });
    const clear = async () => { for (let i = 0; i < 5; i++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"]').forEach((x) => x.click()); document.querySelectorAll('.tCard, .promo button, .rv button').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden && !m.querySelector('.otList, #eNext')) { const bt = m.querySelector('#mClose,#mDone'); if (bt) bt.click(); } }); await a.waitForTimeout(150); } };
    await a.waitForTimeout(1200); await clear();
    const before = await a.evaluate(() => { const pc = window.__pc, S = pc.S; return { shift: S.shift, wait: pc.callWait(), pt: S.pmem ? JSON.stringify(S.pmem) : '' }; });
    await a.evaluate((k) => { if (k === 'partner') window.__pc.S.vpart = 'castillo'; window.__pc.closeModal(); window.__pc.endOfWatch(); }, k); await a.waitForSelector('#eNext'); await a.click('#eNext');
    await a.waitForSelector('.otList'); const opts = await a.evaluate(() => [...document.querySelectorAll('.otPick b')].map((x) => x.textContent));
    if (k === 'partner') await a.screenshot({ path: 'tofftime.png' });
    const pick = { partner: /dinner/i, regular: /Coffee/, study: /Study group/, rest: /sleep/ }[k];
    const ok = await a.evaluate((src) => { const re = new RegExp(src); const bt = [...document.querySelectorAll('.otPick')].find((x) => re.test(x.innerText)); if (!bt) return false; bt.click(); return true; }, pick.source);
    let qs = 0; if (ok) for (let i = 0, idle = 0; i < 60 && idle < 6; i++) { await a.waitForTimeout(380); const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { const q = window.__curQ; (qb.find((x) => +x.dataset.k === q.c) || qb[0]).click(); return 'q'; } d.click(); return 'n'; }); if (st == null) idle++; else { idle = 0; if (st === 'q') qs++; } }
    await a.waitForTimeout(800);
    const after = await a.evaluate(() => { const pc = window.__pc, S = pc.S; return { shift: S.shift, n: S.offN, rested: S.rested, wait: pc.callWait(), pmem: S.pmem ? JSON.stringify(S.pmem) : '', npc: S.npc, log: (S.offLog || []).length }; });
    out[k] = { opts, ok, qs, before, after }; console.log(k, JSON.stringify({ opts, ok, qs, shift: [before.shift, after.shift], n: after.n, rested: after.rested, wait: [before.wait, after.wait], npc: after.npc[npcId] }));
    if (!ok) errs.push(k + ': option missing ' + JSON.stringify(opts));
    if (after.shift === before.shift) errs.push(k + ': the next shift did not start');
    if (!after.n || after.n[k] !== 1) errs.push(k + ': not counted');
    if (k === 'partner' && !/"castillo":\{"t":64/.test(after.pmem)) errs.push('partner: trust did not grow ' + after.pmem.slice(0, 80));
    if (k === 'regular' && after.npc[npcId] !== 3) errs.push('regular: friendship did not grow');
    if (k === 'study' && (qs < 1 || qs > 2)) errs.push('study: expected one or two questions, saw ' + qs);
    if (k === 'rest' && !(after.rested === 1 && after.wait >= before.wait + 30)) errs.push('rest: calls do not wait longer');
    if (k !== 'rest' && after.rested) errs.push(k + ': rested without resting');
    await a.close();
  }
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
