// new-cadet sprout over other players' names, backup card tag, and the mentor bonus on a backup scene
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 2500, calls: 40, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { autoQ: false, drs: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  for (let k = 0; k < 8; k++) { await a.evaluate(() => { document.querySelectorAll('.tCard,.lorePop').forEach((x) => { const bb = [...x.querySelectorAll('button')].pop(); if (bb) bb.click(); }); }); await a.waitForTimeout(250); }
  await a.evaluate(() => { const pc = window.__pc, P = pc.P, now = Date.now(); window.__f = { n1: { x: P.x + 1.5, y: P.y + .5, v: 0, d: 0, t: now, c: '1-Baker-3', u: 'patrol', s: 'day', st: 'patrol', n: -1, r: 'Cadet' }, v1: { x: P.x - 1.5, y: P.y + .5, v: 0, d: 0, t: now, c: '1-Ocean-9', u: 'k9', s: 'day', st: 'patrol', n: -1, r: 'Guide' } };
    setInterval(() => { Object.values(window.__f).forEach((p) => p.t = Date.now()); pc.onPlayers(JSON.parse(JSON.stringify(window.__f)), 'me'); }, 300); });
  await a.waitForTimeout(1500);
  await a.evaluate(() => { window.__pc.FX.rain = false; window.__pc.cam.zUser = 1.6; window.__pc.cam.z = 1.6; }); await a.waitForTimeout(600); await a.screenshot({ path: 'sprout.png', clip: { x: 20, y: 250, width: 350, height: 230 } });
  // backup request from the new cadet
  await a.evaluate(() => { const P = window.__pc.P; window.__f.n1.b = { x: P.x + 3, y: P.y + 2, l: 'Suspicious person at the bus stop', p: 2, t: Date.now() }; });
  await a.waitForTimeout(1800);
  console.log('bk card:', await a.evaluate(() => { const e = document.getElementById('bkCard'); return e && !e.hidden ? e.innerText.replace(/\s+/g, ' ') : 'hidden'; }));
  const xp0 = await a.evaluate(() => window.__pc.S.xp);
  await a.evaluate(() => { const pc = window.__pc; pc.backupScene('n1', pc.others.n1); });
  for (let k = 0; k < 120; k++) { await a.waitForTimeout(120); const st = await a.evaluate(() => { const m = document.getElementById('modal'); if (!m.hidden && /Mentoring|Cover officer|Backup/.test(m.innerText)) return 'modal'; const d = document.getElementById('dlg'); if (d.hidden) return null; const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { const q = window.__curQ; (qb.find((x) => q && +x.dataset.k === q.c) || qb[0]).click(); return 'q'; } const ch = d.querySelector('.dlgOpts:not(.q) button:not([disabled])'); if (ch) { ch.click(); return 'c'; } d.click(); return 'n'; }); if (st === 'modal') break; }
  await a.waitForTimeout(500);
  console.log('debrief:', await a.evaluate(() => (document.getElementById('modal').innerText || '').replace(/\s+/g, ' ').match(/Mentoring[^|]{0,90}/) || 'no mentoring row'));
  await a.evaluate(() => { const b = document.getElementById('mDone'); if (b) b.click(); }); await a.waitForTimeout(600);
  console.log('mentor count', await a.evaluate(() => window.__pc.S.mentor), 'xp gained', await a.evaluate((x) => window.__pc.S.xp - x, xp0));
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close(); })();
