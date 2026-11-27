// item 12: squad weekly goals, the study group's sim exam, and co-op jobs
const { chromium } = require('playwright');
const PORT = process.env.PORT || 8765;
(async () => {
  const b = await chromium.launch(); const errs = []; const c = await b.newContext({ viewport: { width: 1100, height: 750 } });
  const mk = async (cs) => { const a = await c.newPage(); a.on('pageerror', (e) => errs.push(cs + ' ' + e.message)); await a.goto('http://localhost:' + PORT + '/academy/?mock&skiptitle'); await a.evaluate((cs) => { sessionStorage.setItem('liveMockUid', 'u' + cs.replace(/\W/g, '').toLowerCase()); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs, home: 0, unlocked: [0], shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, calls: 5, cfg: { autoQ: false } })); }, cs);
    await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
    for (let k = 0; k < 14; k++) { await a.evaluate(() => { document.querySelectorAll('.tCard').forEach((x) => { const bb = [...x.querySelectorAll('button')].pop(); if (bb) bb.click(); }); document.querySelectorAll('.lorePop button').forEach((x) => { if (/patrol/i.test(x.innerText)) x.click(); }); document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); }); await a.waitForTimeout(200); }
    return a; };
  const A = await mk('1-Alpha-12'), B = await mk('1-Bravo-7');
  for (const p of [A, B]) await p.addStyleTag({ content: '.lorePop,.tCard{display:none!important}' });
  await A.click('#bRadio'); await A.click('.chTabs [data-t="s"]'); await A.fill('#sqName', 'Night Owls'); await A.click('#sqMake button'); await A.waitForTimeout(1500);
  const code = await A.evaluate(() => window.__pc.S.squad && window.__pc.S.squad.code); console.log('squad', code);
  await B.click('#bRadio'); await B.click('.chTabs [data-t="s"]'); await B.fill('#sqCodeIn', code); await B.click('#sqJoinF button'); await B.waitForTimeout(1500);
  console.log('B squad', await B.evaluate(() => (window.__pc.S.squad || {}).code));
  await A.click('.chTabs [data-t="p"]'); await A.click('.chTabs [data-t="s"]'); await A.waitForTimeout(500);
  console.log('A week:', await A.evaluate(() => (document.querySelector('.sqWeek') || {}).innerText.replace(/\n/g, ' | ')));
  await A.screenshot({ path: 'sq_week.png' });
  // A takes the sim exam, answering the first option each time
  await A.click('#sqExam'); let qn = 0;
  for (let k = 0; k < 400; k++) { await A.waitForTimeout(90); const st = await A.evaluate(() => { const d = document.getElementById('dlg'); if (document.getElementById('sxDone')) return 'DONE'; if (!document.getElementById('modal').hidden) { const m = document.getElementById('modal'); const bt = m.querySelector('#mDone,#mClose,button'); const t = m.innerText.slice(0, 60); if (bt) bt.click(); return 'modal:' + t; } if (d.hidden) return 'idle';
      const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { qb[0].click(); return 'q'; }
      const ch = [...d.querySelectorAll('.dlgOpts:not(.q) button:not([disabled])')]; if (ch.length) { ch[0].click(); return 'ch'; } d.click(); return 'line'; });
    if (st === 'q') qn++; if (st === 'DONE') break; if (/^modal|idle/.test(st) && k % 20 === 0) console.log(k, st.replace(/\n/g, ' ')); }
  console.log('answered', qn, 'result:', await A.evaluate(() => (document.querySelector('#modal .sceneHead h2') || {}).textContent));
  await A.screenshot({ path: 'sq_exam.png' });
  await A.evaluate(() => document.getElementById('sxDone').click());
  console.log('A sqw', await A.evaluate(() => JSON.stringify(window.__pc.S.sqw)));
  await A.evaluate(() => window.__pc.TG && window.__pc.TG.flush()); await A.waitForTimeout(1200);
  // B sees A's score
  await B.click('.chTabs [data-t="p"]'); await B.click('.chTabs [data-t="s"]'); await B.waitForTimeout(800);
  console.log('B board:', await B.evaluate(() => { const d = document.querySelector('.sxWrap'); if (d) d.open = true; return (document.querySelector('.sqWeek') || {}).innerText.replace(/\n/g, ' | '); }));
  await B.screenshot({ path: 'sq_board.png' });
  // co-op jobs: B backs up A
  await B.click('#chX').catch(() => {}); await B.waitForTimeout(300);
  await B.evaluate(() => window.__pc.backupScene('ualpha12', { c: '1-Alpha-12', u: 'patrol', b: { l: 'Pursuit northbound on Harbor', x: 10, y: 10, t: Date.now() } }));
  const lines = [];
  for (let k = 0; k < 120; k++) { await B.waitForTimeout(90); const st = await B.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; const t = (d.querySelector('.dlgTxt') || {}).innerText || '';
      const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { qb[0].click(); return 'Q'; }
      const ch = [...d.querySelectorAll('.dlgOpts:not(.q) button:not([disabled])')]; if (ch.length) { const s = ch.map((x) => x.innerText).join(' / '); ch[0].click(); return 'CHOICE: ' + s; } d.click(); return 'LINE: ' + t.slice(0, 100); });
    if (st === null) break; if (lines[lines.length - 1] !== st) lines.push(st); }
  console.log(lines.filter((l) => /job|CHOICE/i.test(l)).join('\n'));
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close();
})();
