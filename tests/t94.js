// memory echoes, tested directly: keep a promise by walking back, next-shift briefing, a street remark, caller remembers
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { autoQ: false, drs: false, text: 'instant', callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const clean = async () => { for (let k = 0; k < 10; k++) { await a.evaluate(() => { const pc = window.__pc; if (pc.curCall) pc.dropCall(); document.querySelectorAll('.tCard,.lorePop').forEach((x) => { const bb = [...x.querySelectorAll('button')].pop(); if (bb) bb.click(); else x.click(); }); const m = document.getElementById('modal'); if (!m.hidden && !/SINCE YOUR LAST SHIFT/.test(m.innerText)) { const bb = m.querySelector('#mClose,#mDone'); if (bb) bb.click(); } const dl = document.getElementById('dlg'); if (!dl.hidden) { const ob = dl.querySelector('.dlgOpts button:not([disabled])'); if (ob) ob.click(); else dl.click(); } }); await a.waitForTimeout(200); } };
  await clean();
  // a promise at a spot a few tiles away, then walk there
  await a.evaluate(() => { const pc = window.__pc, w = pc.W.walk, P = pc.P, t = w.find((q) => Math.hypot(q[0] - P.x, q[1] - P.y) > 6 && Math.hypot(q[0] - P.x, q[1] - P.y) < 10) || w[0]; window.__spot = t; pc.MEM.afterCall({ wrap: 'promise', x: t[0] + .5, y: t[1] + .5, where: '212 Elm St', vcn: 'Maria Lopez' }); });
  console.log('open promises', await a.evaluate(() => window.__pc.MEM.open.length), 'deeds', JSON.stringify(await a.evaluate(() => window.__pc.MEM.deeds.map((d) => d.k))));
  await clean(); await a.screenshot({ path: 'mem_mark.png' });
  await a.evaluate(() => { const pc = window.__pc, t = window.__spot; pc.P.x = t[0] + 1.3; pc.P.y = t[1] + 1; pc.P.path = []; });
  let keepTxt = 'none'; for (let k = 0; k < 20; k++) { await a.waitForTimeout(300); keepTxt = await a.evaluate(() => { const d = document.getElementById('dlg'); return d.hidden ? 'none' : (d.innerText || '').replace(/\s+/g, ' ').slice(0, 110); }); if (keepTxt !== 'none') break; }
  console.log('keep scene:', keepTxt); await a.screenshot({ path: 'mem_keep.png' });
  for (let k = 0; k < 30; k++) { await a.waitForTimeout(150); const done = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return true; const ch = d.querySelector('.dlgOpts button'); if (ch) ch.click(); else d.click(); return false; }); if (done) break; }
  await a.waitForTimeout(400);
  console.log('after keep: open', await a.evaluate(() => window.__pc.MEM.open.length), 'deeds', JSON.stringify(await a.evaluate(() => window.__pc.MEM.deeds.map((d) => d.k))));
  // a promise that won't be kept, a harsh call and a talk-down, then a new shift
  await a.evaluate(() => { const pc = window.__pc, P = pc.P; pc.MEM.afterCall({ wrap: 'promise', x: P.x + 25, y: P.y + 25, where: '414 Palm Ave', vcn: 'Ana Ruiz' }); pc.MEM.afterCall({ eff: 'front', x: P.x + 2, y: P.y, where: '9 Bay St', vcn: 'Tom Hale' }); pc.MEM.deesc({ where: 'Founders Plaza', x: P.x - 2, y: P.y }, 'win'); pc.MEM.onShift(); });
  let brief = 'none'; for (let k = 0; k < 30; k++) { await clean(); brief = await a.evaluate(() => { const m = document.getElementById('modal'); return !m.hidden && /SINCE YOUR LAST SHIFT/.test(m.innerText) ? m.innerText.replace(/\s+/g, ' ') : 'none'; }); if (brief !== 'none') break; await a.waitForTimeout(400); }
  console.log('mem dbg', JSON.stringify(await a.evaluate(() => window.__pc.MEM.dbg)), JSON.stringify(await a.evaluate(() => { const pc = window.__pc; return { dbg: pc.dbg(), call: !!pc.curCall }; })));
  console.log('briefing:', brief.slice(0, 500)); await a.screenshot({ path: 'mem_brief.png' });
  await a.evaluate(() => { const bb = document.getElementById('mClose'); if (bb) bb.click(); }); await a.waitForTimeout(400);
  // stand near a remembered place: someone brings it up
  const bark = await a.evaluate(async () => { const pc = window.__pc, d = pc.MEM.deeds.find((x) => x.told && x.x != null && x.did === pc.W.did && x.k !== 'broke'); if (!d) return 'no told deed'; pc.P.x = d.x + .8; pc.P.y = d.y + .6; pc.P.path = []; for (let i = 0; i < 12; i++) { await new Promise((r) => setTimeout(r, 300)); const b = pc.POLB().map((x) => x.text).join(' | '); if (b) return d.k + ': ' + b; } return 'no bark for ' + d.k; });
  console.log('bark:', bark); await a.screenshot({ path: 'mem_bark.png' });
  await a.evaluate(() => window.__pc.MEM.deeds.forEach((d) => { d.at -= 120000; }));
  console.log('caller at 414 Palm Ave:', JSON.stringify(await a.evaluate(() => window.__pc.MEM.callerLine({ where: '414 Palm Ave' }, 'x'))));
  console.log('caller at 9 Bay St:', JSON.stringify(await a.evaluate(() => window.__pc.MEM.callerLine({ where: '9 Bay St' }, 'x'))));
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close(); })();
