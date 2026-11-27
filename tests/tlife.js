// lives outside the job: a partner's day changes the shift (roll call, a line on a call, one scene, how overtime lands
// in the report), and a regular's day is told once with one small thing you can do about it
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 1500, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.LD, null, { timeout: 20000 });
  const free = async () => { for (let i = 0; i < 40; i++) { if (await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); return pc.free; })) return true; await a.waitForTimeout(400); } errs.push('street never free'); return false; };
  const play = async (pick) => { for (let i = 0; i < 60; i++) { await a.waitForTimeout(380); const st = await a.evaluate((pk) => { const d = document.getElementById('dlg'); if (d.hidden) return 'done'; const bs = [...d.querySelectorAll('.dlgOpts [data-k]')]; if (bs.length) { (bs.find((x) => x.textContent.indexOf(pk) >= 0) || bs[0]).click(); return 'c'; } d.click(); return 'n'; }, pick); if (st === 'done') return; } errs.push('scene never ended'); };
  await free();
  // the partner's day: Walsh's granddaughter pitches tonight
  const st = await a.evaluate(() => { const pc = window.__pc; pc.S.vpart = 'walsh'; pc.S.ld = { seen: {} }; const r0 = Math.random; Math.random = () => 0; const s = pc.LD.start('walsh'); Math.random = r0; return s; });
  console.log('roll call:', st); if (!/granddaughter/.test(st || '')) errs.push('no partner day at roll call');
  const t0 = await a.evaluate(() => window.__pc.S.pmem && window.__pc.S.pmem.walsh ? window.__pc.S.pmem.walsh.t : 60);
  await a.evaluate(() => window.__pc.LD.afterCall()); await a.waitForFunction(() => (window.__pc.S.rlog || []).some((r) => /checking his watch/.test(r[3])), null, { timeout: 8000 }).catch(() => errs.push('the day never slipped out on a call'));
  await a.evaluate(() => window.__pc.LD.afterCall()); await free(); await a.evaluate(() => window.__pc.LD.tick()); await a.waitForSelector('#dlg:not([hidden])', { timeout: 5000 }).catch(() => errs.push('no partner scene'));
  await a.waitForTimeout(500); await a.screenshot({ path: 'tlife.png' }); await play('Watch the whole video');
  const t1 = await a.evaluate(() => window.__pc.S.pmem.walsh.t); console.log('walsh trust', t0, '->', t1); if (!(t1 > t0)) errs.push('scene choice did not move trust');
  // end of watch without overtime: he made the first pitch
  await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); pc.endOfWatch(); }); await a.waitForSelector('#eNext');
  const card = await a.evaluate(() => (document.querySelector('.lfCard') || {}).innerText || ''); console.log('report:', card.replace(/\s+/g, ' '));
  if (!/first pitch/.test(card)) errs.push('report has no partner-day card'); const t2 = await a.evaluate(() => window.__pc.S.pmem.walsh.t); if (!(t2 > t1)) errs.push('going home on time did not count');
  await a.evaluate(() => window.__pc.closeModal());
  // a regular's day: Delgado's recital, told once, with something you can do
  await free(); const f0 = await a.evaluate(() => { const pc = window.__pc; pc.S.ld.forceReg = { delgado: 0 }; pc.S.ld.told = {}; const r = pc.regs.find((x) => x.n.id === 'delgado'); if (!r) return -1; pc.P.x = r.x; pc.P.y = r.y + 1.2; pc.npcTalk(r); return pc.S.npc.delgado || 0; });
  if (f0 < 0) errs.push('Delgado not on the street'); else { await play('film it'); const f1 = await a.evaluate(() => window.__pc.S.npc.delgado || 0); console.log('delgado', f0, '->', f1); if (!(f1 > f0)) errs.push('kindness did not count');
    const again = await a.evaluate(() => { const pc = window.__pc, r = pc.regs.find((x) => x.n.id === 'delgado'); pc.npcTalk(r); return document.querySelector('#dlg .dlgTxt') ? document.querySelector('#dlg').innerText : ''; }); if (/recital/.test(again)) errs.push('the regular repeated the day'); }
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
