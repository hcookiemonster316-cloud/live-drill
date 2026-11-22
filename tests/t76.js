// note set -> cache, lasting marks, 4-slot routines
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' @' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false }, side: { room9: 5, ninety: 5, badge214: 9 }, notes: { s_cap1: { t: 1 }, s_cap2: { t: 1 } } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const clear = async () => { for (let i = 0; i < 4; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); }); for (let k = 0; k < 12 && await a.evaluate(() => !document.getElementById('dlg').hidden); k++) { await a.evaluate(() => { const d = document.getElementById('dlg'), o = d.querySelector('.dlgOpts [data-k]'); if (o) o.click(); else d.click(); }); await a.waitForTimeout(250); } await a.waitForTimeout(300); } };
  await clear();
  const waitCard = async () => { for (let i = 0, t0 = Date.now(); Date.now() - t0 < 40000; i++) { if (await a.evaluate(() => !!document.querySelector('#modal:not([hidden]) .noteCard'))) return true; await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d.hidden) { const o = d.querySelector('.dlgOpts [data-k]'); if (o) o.click(); else d.click(); } }); await a.waitForTimeout(300); } return false; };
  console.log('marks here:', await a.evaluate(() => window.__pc.REW.marks().map((o) => o.m.text).join(', ')));
  // read the third capsule note
  await a.evaluate(() => { const pc = window.__pc, o = pc.REW.notes().find((x) => x.n.id === 's_cap3'); pc.P.x = o.x + .3; pc.P.y = o.y + .2; pc.P.path = []; });
  console.log('got card', await waitCard()); await a.screenshot({ path: 'ns_card.png' });
  console.log('card:', await a.evaluate(() => (document.querySelector('.noteCard') || document.getElementById('modal')).innerText.replace(/\n+/g, ' | ')));
  await a.click('#mClose'); await a.waitForTimeout(1500); await clear();
  console.log('caches:', await a.evaluate(() => JSON.stringify(window.__pc.S.caches)), await a.evaluate(() => window.__pc.REW.caches().length));
  // look at a mark
  await a.evaluate(() => { const pc = window.__pc, o = pc.REW.marks()[0]; pc.P.x = o.x + 2; pc.P.y = o.y + 1.5; pc.P.path = []; });
  await a.waitForTimeout(1200); await a.screenshot({ path: 'ns_mark.png' });
  // go to cache
  await a.evaluate(() => { const pc = window.__pc, o = pc.REW.caches()[0]; pc.P.x = o.x + .2; pc.P.y = o.y + .2; pc.P.path = []; });
  console.log('got cache', await waitCard());
  console.log('cache card:', await a.evaluate(() => document.querySelector('.noteCard').innerText.replace(/\n+/g, ' | ').slice(0, 200)));
  await a.click('#mClose'); await a.waitForTimeout(1200);
  console.log('item:', await a.evaluate(() => !!window.__pc.S.qitems.capsule), 'caches', await a.evaluate(() => JSON.stringify(window.__pc.S.caches)));
  // routines: night -> leon/hollis move
  const before = await a.evaluate(() => window.__pc.regs.filter((r) => ['hollis', 'tasha', 'leon'].includes(r.n.id)).map((r) => r.n.id + ':' + r.lot.name).join(' '));
  await a.evaluate(() => { const pc = window.__pc; pc.setClock(840); pc.P.x = 5; pc.P.y = 5; }); await a.waitForTimeout(4000);
  const after = await a.evaluate(() => window.__pc.regs.filter((r) => ['hollis', 'tasha', 'leon'].includes(r.n.id)).map((r) => r.n.id + ':' + r.lot.name).join(' '));
  console.log('routine', before, '=>', after);
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
