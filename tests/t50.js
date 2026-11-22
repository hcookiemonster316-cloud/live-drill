const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const a = await b.newPage({ viewport: { width: 390, height: 844 } }); a.on('pageerror', (e) => errs.push(e.message));
  const shot = (n) => a.screenshot({ path: n + '.png' });
  const clearDlg = async (pref) => { for (let k = 0; k < 90; k++) { await a.waitForTimeout(220); const st = await a.evaluate(() => { const d = document.querySelector('#dlg'); if (d.hidden) return null; return { q: !!d.querySelector('.dlgOpts.q [data-k]:not([disabled])'), n: d.querySelectorAll('.dlgOpts:not(.q) [data-k]').length }; }); if (!st) return; if (st.q) { await a.evaluate(() => { const q = window.__curQ; document.querySelector('#dlg .dlgOpts.q [data-k="' + q.c + '"]').click(); }); await a.waitForTimeout(900); continue; } if (st.n) { await a.evaluate((p) => { const bs = [...document.querySelectorAll('#dlg .dlgOpts:not(.q) [data-k]')]; (bs.find((b) => p && new RegExp(p).test(b.innerText)) || bs[0]).click(); }, pref || ''); continue; } await a.evaluate(() => { const d = document.querySelector('#dlg'); d.click(); d.click(); }); } };
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'night', unit: 'patrol', xp: 3000, sound: false, seenIntro: 1, story: { 0: 6, 1: 6, 2: 6, 3: 6, 4: 4 }, flags: { paidDelgado: 1 }, trust: { 0: 82 }, cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(400); await a.click('#mDone'); await a.waitForTimeout(2500);
  console.log('intro on:', await a.evaluate(() => !!document.querySelector('.introCine'))); await a.waitForTimeout(9000); await shot('e_intro1');
  await a.waitForTimeout(13000); await shot('e_intro2'); await a.waitForTimeout(4000);
  console.log('intro done:', await a.evaluate(() => window.__pc.S.seenCine));
  for (let k = 0; k < 3; k++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); }); await a.waitForTimeout(900); }
  await clearDlg();
  // a clue
  await a.evaluate(() => { const pc = window.__pc, l = pc.W.lots.find((x) => /Dog-Eared/.test(x.name || '')); pc.P.x = l.door[0]; pc.P.y = l.door[1]; pc.P.path = []; });
  await a.waitForTimeout(2500); console.log('clue:', await a.evaluate(() => document.querySelector('.clueCard') && document.querySelector('.clueCard').innerText.replace(/\n+/g, ' | ').slice(0, 160)));
  await shot('e_clue'); await a.evaluate(() => document.querySelector('#clBoard') && document.querySelector('#clBoard').click()); await a.waitForTimeout(500); await shot('e_board');
  await a.evaluate(() => document.querySelector('#mClose').click()); await a.waitForTimeout(400);
  // a call with investigation or report forced
  await a.evaluate(() => { Math.random = ((r) => () => 0.1)(Math.random); });
  for (let k = 0; k < 3; k++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText)); if (b) b.click(); }); await a.waitForTimeout(500); }
  await a.evaluate(() => { const pc = window.__pc; pc.dispatchCall(); pc.call.prio = 2; pc.call.kind = 'houses'; pc.openCall(); });
  await clearDlg('Keep the scene|case number');
  await a.waitForTimeout(800); console.log('after call modal:', await a.evaluate(() => document.querySelector('#modal').innerText.replace(/\n+/g, ' | ').slice(0, 160)));
  await shot('e_inv');
  for (let k = 0; k < 10; k++) { const did = await a.evaluate(() => { const real = [...document.querySelectorAll('[data-iv]')].find((b) => !b.classList.contains('ok') && !b.classList.contains('no')); if (real) { real.click(); return 'iv'; } const nx = document.querySelector('#ivNext'); if (nx && !nx.disabled) { nx.click(); return 'next'; } return null; }); if (!did || did === 'next') break; await a.waitForTimeout(150); }
  await a.waitForTimeout(300); await shot('e_tl');
  for (let k = 0; k < 6; k++) { const ok = await a.evaluate(() => { const b = document.querySelector('[data-tl]'); if (b) { b.click(); return 1; } const r = document.querySelector('[data-rp]'); if (r) { r.click(); return 2; } return 0; }); if (!ok) break; await a.waitForTimeout(250); }
  await a.waitForTimeout(1200); console.log('debrief:', await a.evaluate(() => document.querySelector('.dbf') && document.querySelector('.dbf').innerText.replace(/\n+/g, ' | ').slice(0, 520)));
  await shot('e_debrief');
  await a.evaluate(() => { Math.random = window.__rnd0 || Math.random; document.querySelector('#mDone') && document.querySelector('#mDone').click(); }); await a.waitForTimeout(1500);
  for (let k = 0; k < 4; k++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /save for later/i.test(x.innerText)); if (b) b.click(); }); await a.waitForTimeout(600); }
  await a.screenshot({ path: 'e_after.png' });
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
