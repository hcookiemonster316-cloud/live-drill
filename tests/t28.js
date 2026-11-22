const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const a = await b.newPage({ viewport: { width: 390, height: 844 } }); a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 700, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', story: { 0: 6 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(400); await a.click('#mDone'); await a.waitForTimeout(2500);
  await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"]').forEach((x) => x.click()); const pc = window.__pc, r = pc.regs.find((x) => x.n.id === 'dot'); pc.npcTalk(r); });
  const log = [];
  for (let k = 0; k < 40; k++) {
    await a.waitForTimeout(250);
    const st = await a.evaluate(() => { const d = document.querySelector('#dlg'); if (d.hidden) return null; const t = d.querySelector('.dlgTxt'); return { txt: t ? t.innerText.replace(/\n/g, ' | ') : '', q: !!d.querySelector('.dlgOpts.q [data-k]:not([disabled])'), ch: [...d.querySelectorAll('.dlgOpts:not(.q) [data-k]')].map((x) => x.innerText.replace(/\n/g, ' ')) }; });
    if (!st) break;
    if (st.q) { log.push('Q: ' + st.txt.slice(0, 80)); await a.evaluate(() => { const q = window.__curQ; document.querySelector('#dlg .dlgOpts.q [data-k="' + q.c + '"]').click(); }); await a.waitForTimeout(900); continue; }
    if (st.ch.length) { log.push('CHOICE: ' + st.ch.join(' / ')); const pick = st.ch.findIndex((c) => /help/.test(c)); const k2 = pick >= 0 ? pick : st.ch.length > 2 ? 0 : st.ch.length - 1; await a.evaluate((k2) => document.querySelector('#dlg [data-k="' + k2 + '"]').click(), k2); continue; }
    await a.evaluate(() => { const d = document.querySelector('#dlg'); d.click(); d.click(); }); log.push(st.txt.slice(0, 140)); await a.waitForTimeout(100);
  }
  console.log(log.join('\n')); console.log(errs.join('\n') || 'no errors'); await b.close();
})();
