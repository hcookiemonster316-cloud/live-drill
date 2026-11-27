const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const a = await b.newPage({ viewport: { width: 390, height: 844 } }); a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 9000, calls: 40, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, graduated: Date.now(), cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, titles: { 'Honor Cadet': 1 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(400); await a.click('#mDone'); await a.waitForTimeout(3000);
  for (let k = 0; k < 14; k++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a]:not([data-a="read"])').forEach((x) => x.click()); /* a well-traveled save queues several lore cards */ const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|save for later/i.test(x.innerText) && x.offsetParent); if (b) b.click(); }); await a.waitForTimeout(500); }
  await a.waitForTimeout(4000);
  await a.evaluate(() => document.querySelector('#bPause').click()); await a.waitForTimeout(500);
  console.log('has NG item:', await a.evaluate(() => [...document.querySelectorAll('.pmBox [data-i]')].some((x) => /new game\+/i.test(x.innerText))));
  await a.evaluate(() => [...document.querySelectorAll('.pmBox [data-i]')].find((x) => /new game\+/i.test(x.innerText)).click()); await a.waitForTimeout(500);
  await a.screenshot({ path: 'ng1.png' });
  await a.evaluate(() => document.querySelector('#ngGo').click()); await a.waitForTimeout(200); await a.evaluate(() => document.querySelector('#ngGo').click());
  await a.waitForTimeout(3000);
  await a.waitForSelector('#start:not([hidden])', { timeout: 15000 }).catch(() => {}); if (await a.$('#stGo')) { await a.click('#stGo').catch(() => {}); await a.waitForTimeout(400); await a.click('#mDone').catch(() => {}); }
  await a.waitForTimeout(3000);
  console.log('after:', await a.evaluate(() => JSON.stringify({ fto: window.__pc.S.fto, ng: window.__pc.S.ng, story: window.__pc.S.story, titles: Object.keys(window.__pc.S.titles || {}), hcs: document.querySelector('#hCs').innerText, bak: Object.keys(localStorage).filter((k) => k.indexOf('patrolcity:bak:') === 0).length })));
  // a call: trainee cameo + harder questions
  for (let k = 0; k < 5; k++) { await a.evaluate(() => { document.querySelectorAll('.tCard').forEach((x) => x.click()); const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|save for later/i.test(x.innerText) && x.offsetParent); if (b) b.click(); }); await a.waitForTimeout(500); }
  for (let k = 0; k < 40; k++) { const open = await a.evaluate(() => !document.querySelector('#dlg').hidden); if (!open) break; await a.evaluate(() => { const d = document.querySelector('#dlg'); const o = d.querySelector('.dlgOpts [data-k]'); if (o && !d.querySelector('.dlgOpts.q')) { o.click(); return; } if (d.querySelector('.dlgOpts.q')) { document.querySelector('#dlg .dlgOpts.q [data-k="' + (Array.isArray(window.__curQ.c) ? window.__curQ.c[0] : window.__curQ.c) + '"]').click(); const ok = document.querySelector('#dlgOk'); if (ok) ok.click(); return; } d.click(); }); await a.waitForTimeout(300); }
  const seen = []; let multi = 0;
  for (let n = 0; n < 3; n++) {
    await a.evaluate(() => { const pc = window.__pc; Math.random = (() => { let s = 7; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })(); pc.dispatchCall(); pc.openCall(); });
    for (let k = 0; k < 60; k++) { await a.waitForTimeout(200); const st = await a.evaluate(() => { const d = document.querySelector('#dlg'); if (d.hidden) return null; return { q: !!d.querySelector('.dlgOpts.q [data-k]:not([disabled])'), n: d.querySelectorAll('.dlgOpts:not(.q) [data-k]').length, who: (d.querySelector('.dlgPlate b') || {}).innerText, multi: !!d.querySelector('#dlgOk') }; }); if (!st) break; if (st.who) seen.push(st.who);
      if (st.q) { if (st.multi) multi++; await a.evaluate(() => { const q = window.__curQ; if (Array.isArray(q.c)) { q.c.forEach((i) => (document.querySelector('#dlg .dlgOpts.q [data-k="' + i + '"]') || { click() {} }).click()); (document.querySelector('#dlgOk') || { click() {} }).click(); } else (document.querySelector('#dlg .dlgOpts.q [data-k="' + q.c + '"]') || { click() {} }).click(); }); await a.waitForTimeout(900); continue; }
      if (st.n) { await a.evaluate(() => { const x = document.querySelector('#dlg .dlgOpts:not(.q) [data-k="0"]'); if (x) x.click(); }); continue; } await a.evaluate(() => { const d = document.querySelector('#dlg'); d.click(); d.click(); }); }
    for (let k = 0; k < 14; k++) { await a.evaluate(() => { const e = document.querySelector('[data-iv]:not(.ok):not(.no)') || document.querySelector('#ivNext:not([disabled])') || document.querySelector('[data-tl]') || (() => { const s = [...document.querySelectorAll('[data-rc]')]; if (!s.length) return null; s.forEach((el) => { el.value = '0'; el.dispatchEvent(new Event('change')); }); return document.querySelector('#rcFile:not([disabled])'); })() || document.querySelector('#rcFile:not([disabled])') || document.querySelector('[data-rp]') || document.querySelector('#mDone'); if (e) e.click(); const b = [...document.querySelectorAll('button')].find((x) => /save for later/i.test(x.innerText) && x.offsetParent); if (b) b.click(); }); await a.waitForTimeout(300); }
  }
  console.log('speakers:', [...new Set(seen)].join(', '), '| multi-select questions:', multi, '| ftoCalls', await a.evaluate(() => window.__pc.S.ftoCalls));
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
