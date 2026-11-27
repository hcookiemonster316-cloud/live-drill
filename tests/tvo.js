// Vehicle Operations switch: the bank, districts, calls, decisions, subjects and the save carry-over
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  // an old Chapter 5 save: no ch, lessons up to 20, facts F0..F557
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2], cleared: [0, 1], shift: 'day', unit: 'patrol', xp: 4321, calls: 90, sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, log: { 0: [1, 1, 1], 15: [1, 0] }, facts: { F3: 1, F500: 1 }, graduated: 123, cfg: { autoQ: false, drs: false, text: 'instant', callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(1500);
  const mig = await a.evaluate(() => { const S = window.__pc.S; return { ch: S.ch, xp: S.xp, unlocked: S.unlocked, cleared: S.cleared, log: S.log, facts: Object.keys(S.facts || {}), grad: S.graduated, kept: S.ch5 && Object.keys(S.ch5) }; });
  console.log('migration:', JSON.stringify(mig));
  const chk = await a.evaluate(async () => { const pc = window.__pc, L = pc.L, out = {}; const D = await import('./data.js'), V = await import('./vodata.js'), SB = await import('./subjects.js');
    out.lessons = L.lessonCount(); out.facts = L.factCount(); out.first = L.lessonName(0); out.last = L.lessonName(11);
    const kinds = (d) => { const k = new Set(['any']); const add = (l) => { if (typeof l === 'string') k.add(l); else if (Array.isArray(l)) k.add(l[0]); else if (l.strip) l.strip.forEach(add); }; d.lots.forEach(add); return k; };
    out.problems = [];
    D.DISTRICTS.forEach((d) => { const k = kinds(d); d.lessons.forEach((l) => { if (l > 11) out.problems.push('district ' + d.id + ' lesson ' + l); if (!L.factList([l]).length) out.problems.push('no facts ' + l); (D.CALLS[l] || []).forEach((c) => { if (!k.has(c[2])) out.problems.push('place ' + c[2] + ' not in district ' + d.id); }); if (!D.CALLS[l]) out.problems.push('no calls ' + l); if (!SB.SUBJECTS || !Object.values(SB.SUBJECTS).some((s) => s.les.includes(l))) out.problems.push('no voice ' + l); }); });
    Object.keys(D.CALLS).forEach((l) => { if (+l > 11) out.problems.push('call lesson ' + l); });
    for (let l = 0; l < 12; l++) { const q = pc.VAR.decisionQ(l); if (!q) out.problems.push('no decision ' + l); else if (!q.fid) out.problems.push('decision without fact ' + l + ' ' + q.stem); }
    out.fidsMatch = V.ACTS.every((x) => L.factList([x[0]]).some((f) => x[4].test(f.text)));
    const qs = L.pickFacts(pc.S, [0, 1], 6); out.sample = qs.map((q) => q.les + ': ' + q.stem.slice(0, 70)); out.allVO = qs.every((q) => q.les >= 0 && q.les < 12);
    const m = pc.VAR.mixQs(10, L.pickFacts(pc.S, [10], 3)); out.mixed = m.map((q) => (q.act ? 'ACT ' : '') + q.stem.slice(0, 60));
    return out; });
  console.log(JSON.stringify(chk, null, 1));
  // a call in each district: the scene's questions are all from that district's lessons
  for (let d = 0; d < 5; d++) {
    await a.evaluate((d) => { const pc = window.__pc; pc.S.unlocked = [0, 1, 2, 3, 4]; if (pc.curCall) pc.dropCall(); }, d);
    const r = await a.evaluate(async (d) => { const pc = window.__pc; if (pc.travel) { pc.travel(d); } return pc.W.did; }, d);
    await a.waitForTimeout(800);
    const info = await a.evaluate(() => { const pc = window.__pc; pc.dispatchCall(); const c = pc.curCall; return c ? { t: c.title, les: c.les, d: pc.W.did } : null; });
    console.log('district', d, '->', JSON.stringify(info));
  }
  await a.evaluate(() => { const pc = window.__pc; const c = pc.curCall; if (c) pc.openCallScene(c); }); await a.waitForTimeout(700);
  for (let k = 0; k < 12; k++) { const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return 'hidden'; if (d.querySelector('.dlgOpts.q [data-k]')) return 'Q'; const ch = d.querySelector('.dlgOpts button:not([disabled])'); if (ch) { ch.click(); return 'C'; } d.click(); return 'L'; }); if (st === 'Q' || st === 'hidden') break; await a.waitForTimeout(250); }
  await a.waitForTimeout(400); await a.screenshot({ path: 'tvo_q.png' });
  console.log('question on screen:', await a.evaluate(() => (document.getElementById('dlg').innerText || '').replace(/\s+/g, ' ').slice(0, 260)));
  console.log(errs.length ? errs.slice(0, 4) : 'no errors'); await b.close(); })();
