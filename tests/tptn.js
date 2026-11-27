// your partner's trust is on the HUD: name, five pips and a word for where you stand; it pulses green or red when a
// call moves it, and the call debrief shows it as a row that informs without counting toward the grade
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 640 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2, 3, 4], story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, pmem: { walsh: { t: 72, log: [] } }, cfg: { autoQ: false, text: 'instant', pursuits: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W && window.__booted, null, { timeout: 20000 }); await a.waitForTimeout(1500);
  await a.addStyleTag({ content: '.lorePop,.tCard{display:none!important}' });
  await a.evaluate(() => document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()));
  const r1 = await a.evaluate(() => { const pc = window.__pc; pc.S.vpart = 'walsh'; pc.ptnHud(); const el = document.getElementById('hPtn'); return { hidden: el.hidden, text: el.innerText.replace(/\s+/g, ' '), cls: el.className, on: el.querySelectorAll('.pip i.on').length }; });
  console.log('hud', JSON.stringify(r1)); if (r1.hidden || !/Walsh/.test(r1.text) || !/has your back/.test(r1.text) || r1.on !== 4) errs.push('partner HUD wrong: ' + JSON.stringify(r1));
  // a call that goes well moves it up and pulses
  const r2 = await a.evaluate(() => { const pc = window.__pc; const d = pc.PART.remember({ title: 'Noise complaint', where: 'Main St', prio: 3 }, { right: 3, n: 3 }); pc.ptnHud(true); return { d, t: pc.PART.trust('walsh'), last: pc.PART.last }; }); r2.cls = await a.waitForFunction(() => /\bup\b/.test(document.getElementById('hPtn').className) && document.getElementById('hPtn').className, null, { timeout: 3000 }).then((h) => h.jsonValue()).catch(() => ''); /* the pulse starts a frame or two later */
  console.log('after', JSON.stringify(r2)); if (r2.d !== 2 || r2.t !== 74 || !/\bup\b/.test(r2.cls)) errs.push('trust did not rise and pulse: ' + JSON.stringify(r2));
  // no partner: hidden
  const r3 = await a.evaluate(() => { const pc = window.__pc; pc.S.vpart = null; pc.ptnHud(); return document.getElementById('hPtn').hidden; }); if (!r3) errs.push('HUD shows a partner when riding alone');
  // the debrief row informs but doesn't count
  const r4 = await a.evaluate(() => new Promise((res) => { const pc = window.__pc; pc.POL.debrief({ title: 'Noise complaint', where: 'Main St', prio: 3, right: 2, n: 2, fast: true, resp: 10, wrap: 'case', calm: true, xp: 10, extra: [['🤝', 'Walsh\'s trust', 20, 100, '-4: you came in hard.', 'info']] }); setTimeout(() => { const m = document.getElementById('modal'); res({ grade: m.querySelector('.dbfGrade b').innerText, score: m.querySelector('.dbfGrade span').innerText, row: /Walsh's trust/.test(m.innerText) }); }, 300); }));
  console.log('debrief', JSON.stringify(r4)); if (!r4.row || !/^100/.test(r4.score)) errs.push('partner row changed the grade or is missing: ' + JSON.stringify(r4));
  await a.evaluate(() => { document.querySelectorAll('#modal #mDone').forEach((x) => x.click()); const pc = window.__pc; pc.S.vpart = 'walsh'; pc.ptnHud(); });
  await a.addStyleTag({ content: '#modal,#radio,#orders,#banner,.banner,.toast{display:none!important}' }); await a.waitForTimeout(300); await a.screenshot({ path: (process.argv[2] || 'tests/out') + '/tptn.png', clip: { x: 0, y: 0, width: 900, height: 120 } });
  // a partner at 85+ shares their read of the person on a call
  await a.evaluate(() => { const pc = window.__pc; pc.S.vpart = 'walsh'; pc.S.pmem.walsh.t = 90; if (pc.curCall) pc.dropCall(); const c = { les: 0, title: 'Noise complaint', prio: 3, text: 'Loud music.', x: pc.P.x, y: pc.P.y, where: 'Main St', kind: 'street', t0: 0, accepted: true }; pc.openCallScene(c); window.__c = c; });
  let heard = ''; for (let i = 0; i < 60 && !heard; i++) { heard = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return ''; const t = d.innerText; if (/just wants it handled|Scared, not dangerous|burn it off|too clean/.test(t)) return t.replace(/\s+/g, ' ').slice(0, 160); const o = d.querySelector('.dlgOpts button:not([disabled])'); if (o) o.click(); else d.click(); return ''; }); await a.waitForTimeout(150); }
  console.log('read', heard, await a.evaluate(() => window.__c.ptRead)); if (!heard) errs.push('a partner at 85 trust did not share their read');
  if (await a.evaluate(() => document.getElementById('hPtn').hidden)) errs.push('HUD stayed hidden when a partner came back');
  console.log(errs.length ? errs.slice(0, 4).join('\n') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
