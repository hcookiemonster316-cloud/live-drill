// notes, recast, npc memory
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' @' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false }, side: { room9: 5 }, flags: { r9mom: 1 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  for (let i = 0; i < 4; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); }); await a.waitForTimeout(300); }
  console.log('keys', await a.evaluate(() => Object.keys(window.__pc).join(' ')));
  const n = await a.evaluate(() => { const pc = window.__pc, L = pc.REW.notes(); return L.map((o) => o.n.id + '@' + o.x.toFixed(1) + ',' + o.y.toFixed(1)); });
  console.log('notes here', n.join(' '));
  // walk to the first note: teleport next to it
  await a.evaluate(() => { const pc = window.__pc, o = pc.REW.notes()[0]; pc.P.x = o.x + 2.5; pc.P.y = o.y + 1.5; pc.P.path = []; });
  await a.waitForTimeout(1500); await a.screenshot({ path: 'nt_world.png' });
  await a.evaluate(() => { const pc = window.__pc, o = pc.REW.notes()[0]; pc.P.x = o.x + .3; pc.P.y = o.y + .2; pc.P.path = []; });
  for (let i = 0, t0 = Date.now(); Date.now() - t0 < 40000 && !(await a.evaluate(() => !!document.querySelector('#modal:not([hidden]) .noteCard'))); i++) { await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d.hidden) { const o = d.querySelector('.dlgOpts [data-k]'); if (o) o.click(); else d.click(); } }); await a.waitForTimeout(300); } await a.waitForTimeout(500); await a.screenshot({ path: 'nt_card.png' });
  console.log('card:', await a.evaluate(() => document.querySelector('.noteCard').innerText.replace(/\n+/g, ' | ')));
  await a.click('#mClose'); await a.waitForTimeout(500);
  console.log('saved', await a.evaluate(() => JSON.stringify(window.__pc.S.notes)), 'lore', await a.evaluate(() => !!window.__pc.S.lore[window.__pc.REW.notes()[0].n.id]));
  // recast check
  console.log('recast fizz:', await a.evaluate(() => window.__pc.SIDE.find((q) => q.id === 'fizz').steps.map((s) => s.who + ':' + s.goal).join(' / ')));
  console.log('recast ruth:', await a.evaluate(() => JSON.stringify(window.__pc.SIDE.find((q) => q.id === 'ruth').steps.map((s) => (s.say || []).map((l) => l[0]))).slice(0, 300)));
  // npc memory: talk to leon
  await a.waitForTimeout(300);
  const ok = await a.evaluate(() => { const pc = window.__pc; if (!pc.npcTalk || !pc.regs) return 'no hook'; const r = pc.regs.find((x) => x.n.id === 'leon'); if (!r) return 'no leon'; pc.npcTalk(r); return 'ok'; });
  console.log('talk', ok); await a.waitForTimeout(600);
  if (ok === 'ok') { for (let i = 0; i < 6; i++) { const done = await a.evaluate(() => { const o = [...document.querySelectorAll('#dlg .dlgOpts [data-k]')].find((x) => /going today/i.test(x.innerText)); if (o) { o.click(); return 1; } document.getElementById('dlg').click(); return 0; }); await a.waitForTimeout(700); if (done) break; } console.log('leon says:', await a.evaluate(() => document.getElementById('dlg').innerText.replace(/\n+/g, ' | ').slice(0, 300))); await a.screenshot({ path: 'nt_mem.png' }); }
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
