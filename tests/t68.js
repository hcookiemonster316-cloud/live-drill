// pursuit: forced pursuit call, in car, follow, decisions, arrest steps, debrief rows; service record panel; overlook
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' @' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  for (let i = 0; i < 5; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); const m = document.getElementById('modal'); if (!m.hidden) { const bb = [...m.querySelectorAll('button')].pop(); bb && bb.click(); } }); await a.waitForTimeout(400); }
  // get in the car and force a pursuit call
  await a.evaluate(() => document.getElementById('bCar').click()); await a.waitForTimeout(1500); await a.evaluate(() => document.getElementById('bCar').click()); await a.waitForTimeout(800);
  console.log('in car', await a.evaluate(() => window.__pc.P.inCar));
  let got = false; for (let i = 0; i < 60 && !got; i++) { got = await a.evaluate(() => { const pc = window.__pc; if (pc.call && !pc.call.pursuit) return false; pc.S.arc.slot = 4; pc.dispatchCall(); return !!(pc.call && pc.call.pursuit); }); if (!got) await a.evaluate(() => { window.__pc.call && (window.__pc.call.t0 = -1e9); }); await a.waitForTimeout(80); }
  console.log('pursuit call', got);
  if (got) {
    await a.evaluate(() => { const pc = window.__pc; pc.call.accepted = true; pc.P.x = pc.call.x + 1; pc.P.y = pc.call.y; pc.P.path = []; }); await a.waitForTimeout(1200);
    console.log('PUR started', await a.evaluate(() => !!window.__pc.PUR), await a.evaluate(() => (document.getElementById('purHud') || {}).innerText.replace(/\n+/g, ' | ')));
    // key the mic: unit, in pursuit, where, direction, car
    await a.screenshot({ path: 'pu_radio.png' });
    console.log('radio builder:', await a.evaluate(() => { const ts = [...document.querySelectorAll('.rbTile')]; if (!ts.length) return 'none'; const want = [/Adam/, /^in pursuit$/, /^Main and/, /bound$/, /occupant/]; want.forEach((re) => { const t = ts.find((x) => re.test(x.innerText)); if (t) t.click(); }); const line = document.getElementById('rbLine').innerText; document.getElementById('rbSend').click(); return line; }));
    await a.waitForTimeout(2500); console.log('radio after:', await a.evaluate(() => (document.getElementById('radio') || {}).innerText.replace(/\s+/g, ' ').slice(-160)));
    await a.waitForTimeout(1000); await a.screenshot({ path: 'pu_chase.png' });
    for (let i = 0; i < 40; i++) { const st = await a.evaluate(() => { const d = document.getElementById('purDec'); if (!d.hidden) { const bs = [...d.querySelectorAll('button')]; const good = bs.find((x) => /Terminate the pursuit|Back off and let/.test(x.innerText)); (good || bs[0]).click(); return 'dec'; } const c = document.getElementById('puCall'); if (c && c.classList.contains('cue')) { c.click(); return 'call'; } return window.__pc.PUR ? 'chase' : 'done'; }); if (st === 'done') break; await a.waitForTimeout(500); }
    await a.waitForTimeout(2000);
    for (let s = 0; s < 40; s++) { const st = await a.evaluate(() => { if (document.querySelector('#modal:not([hidden]) .prForm')) { const send = document.getElementById('prSend'); if (send.textContent === 'Done') { window.__prOut = document.getElementById('prOut').innerText; send.click(); return 'report'; } document.querySelectorAll('.prForm select').forEach((x, i) => { x.selectedIndex = 1; x.dispatchEvent(new Event('change')); }); send.click(); return 'report'; } if (!document.getElementById('modal').hidden) return 'modal'; const q = document.querySelector('#dlg .dlgOpts [data-k]:not([disabled])'); if (q) { const bs = [...document.querySelectorAll('#dlg .dlgOpts [data-k]:not([disabled])')]; const g = bs.find((x) => /cover, one at a time|double-lock both|sharp items, then/.test(x.innerText)); (g || q).click(); return 'pick'; } const d = document.getElementById('dlg'); if (!d.hidden) { d.click(); return 'line'; } return 'idle'; }); if (st === 'modal') break; await a.waitForTimeout(350); }
    console.log('report check:', await a.evaluate(() => (window.__prOut || 'none').replace(/\s+/g, ' ').slice(0, 300)));
    await a.waitForTimeout(800); console.log('debrief:', await a.evaluate(() => document.getElementById('modal').innerText.replace(/\n+/g, ' | ').slice(0, 520))); await a.screenshot({ path: 'pu_debrief.png' });
    await a.evaluate(() => { const b = [...document.querySelectorAll('#modal button')].pop(); b && b.click(); }); await a.waitForTimeout(1500);
  }
  await a.evaluate(() => window.__pc.REW.panel()); await a.waitForTimeout(500); await a.screenshot({ path: 'svc.png' }); console.log('svc:', await a.evaluate(() => JSON.stringify(window.__pc.S.svc)));
  await a.evaluate(() => document.getElementById('mClose') && document.getElementById('mClose').click());
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
