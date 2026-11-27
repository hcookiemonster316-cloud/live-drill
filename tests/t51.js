const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const a = await b.newPage({ viewport: { width: 390, height: 844 } }); a.on('pageerror', (e) => errs.push(e.message));
  const shot = (n) => a.screenshot({ path: n + '.png' });
  const clearDlg = async (pref) => { for (let k = 0; k < 90; k++) { await a.waitForTimeout(220); const st = await a.evaluate(() => { const d = document.querySelector('#dlg'); if (d.hidden) return null; return { q: !!d.querySelector('.dlgOpts.q [data-k]:not([disabled])'), n: d.querySelectorAll('.dlgOpts:not(.q) [data-k]').length }; }); if (!st) return; if (st.q) { await a.evaluate(() => { const q = window.__curQ; document.querySelector('#dlg .dlgOpts.q [data-k="' + q.c + '"]').click(); }); await a.waitForTimeout(900); continue; } if (st.n) { await a.evaluate((p) => { const bs = [...document.querySelectorAll('#dlg .dlgOpts:not(.q) [data-k]')]; (bs.find((b) => p && new RegExp(p).test(b.innerText)) || bs[0]).click(); }, pref || ''); continue; } await a.evaluate(() => { const d = document.querySelector('#dlg'); d.click(); d.click(); }); } };
  const back = async () => { for (let k = 0; k < 3; k++) { await a.evaluate(() => { document.querySelectorAll('.tCard').forEach((x) => x.click()); const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|save for later/i.test(x.innerText) && x.offsetParent); if (b) b.click(); }); await a.waitForTimeout(500); } };
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 3000, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', story: { 0: 6, 1: 6, 2: 6, 3: 6, 4: 5 }, flags: { paidDelgado: 1, firmArrest: 1 }, trust: { 0: 70, 4: 70 }, cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, side: { vance1: 1, vance2: 1 }, npc: { delgado: 4, castillo: 3, rosa: 3, dot: 3 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(400); await a.click('#mDone'); await a.waitForTimeout(2500); await back(); await clearDlg();
  // chapter 5 ending + graduation + credits
  await a.evaluate(() => window.__pc.chapterDone(4)); await a.waitForTimeout(800);
  for (let k = 0; k < 30; k++) { const n = await a.evaluate(() => document.querySelectorAll('#dlg .dlgOpts [data-k]').length); if (n) break; await a.evaluate(() => { const d = document.querySelector('#dlg'); d.click(); d.click(); }); await a.waitForTimeout(250); }
  await shot('g_reflect'); await clearDlg('Credit');
  await a.waitForTimeout(800); console.log('endings:', await a.evaluate(() => JSON.stringify(window.__pc.S.endings)));
  await a.evaluate(() => document.querySelector('#mDone') && document.querySelector('#mDone').click()); await a.waitForTimeout(2500);
  console.log('grad dialog:', await a.evaluate(() => !document.querySelector('#dlg').hidden));
  await clearDlg(); await a.waitForTimeout(1500); await shot('g_credits'); await a.waitForTimeout(9000); await shot('g_credits2');
  console.log('credits:', await a.evaluate(() => document.querySelector('.gradCred') && document.querySelector('.gradCred').innerText.replace(/\n+/g, ' | ').slice(0, 300)));
  await a.evaluate(() => document.querySelector('.gradCred .icSkip') && document.querySelector('.gradCred .icSkip').click()); await a.waitForTimeout(1200); await back();
  // panels
  await a.evaluate(() => window.__pc.EP.rivalPanel()); await a.waitForTimeout(400); await shot('g_rival'); await a.evaluate(() => document.querySelector('#mClose').click());
  await a.evaluate(() => window.__pc.EP.boards('lore')); await a.waitForTimeout(800); await shot('g_lb'); await a.evaluate(() => document.querySelector('#mClose').click());
  await a.evaluate(() => window.__pc.EP.calibrate()); await a.waitForTimeout(400); await shot('g_disp'); await a.evaluate(() => document.querySelector('#dpBack').click());
  // travel loading
  await a.evaluate(() => { window.__pc.S.lore.v_willow = 1; window.__pc.travel(2); }); await a.waitForTimeout(900); await shot('g_load');
  await a.waitForTimeout(4000);
  // trophies screen secret entries
  const tr = await a.evaluate(() => window.__pc.EP.SECRETS.length); console.log('secrets', tr);
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
