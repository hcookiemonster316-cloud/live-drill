// portrait matches the NPC in the street: talk to a regular and a citizen, screenshot both
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  for (let i = 0; i < 5; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); const m = document.getElementById('modal'); if (!m.hidden) { const bb = [...m.querySelectorAll('button')].pop(); bb && bb.click(); } }); await a.waitForTimeout(400); }
  const who = await a.evaluate(() => { const pc = window.__pc, r = pc.regs.find((x) => !x.n.cat) ; if (!r) return null; pc.P.x = r.x + .9; pc.P.y = r.y + .6; pc.P.path = []; pc.cam.z = 2; pc.S.zoom = 2; return r.n.name; }); await a.waitForTimeout(1500);
  await a.evaluate(() => { const pc = window.__pc, r = pc.regs.find((x) => !x.n.cat); pc.npcTalk(r); }); await a.waitForTimeout(1800); await a.screenshot({ path: 'pt_reg.png' }); console.log('talked to', who);
  await a.evaluate(() => { for (let i = 0; i < 30; i++) { const d = document.getElementById('dlg'); if (d.hidden) break; const q = d.querySelector('.dlgOpts [data-k]'); if (q) q.click(); else d.click(); } }); await a.waitForTimeout(1500);
  await a.evaluate(() => { const pc = window.__pc, c = pc.citizens[0]; if (!c) return; pc.P.x = c.x + .9; pc.P.y = c.y + .6; pc.P.path = []; }); await a.waitForTimeout(1500);
  await a.evaluate(() => { const pc = window.__pc; pc.citizenTalk(pc.citizens[0]); }); await a.waitForTimeout(1800); await a.screenshot({ path: 'pt_cit.png' });
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
