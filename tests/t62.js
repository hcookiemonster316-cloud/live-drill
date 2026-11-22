// arrival ring -> call scene -> report -> debrief rows; call intro; walking off folds the ring
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(2500); for (let i = 0; i < 5; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); }); await a.waitForTimeout(500); }
  for (let k = 0; k < 2; k++) {
    await a.evaluate(() => { const m = document.getElementById('modal'); if (!m.hidden) { const b = document.getElementById('mDone') || [...m.querySelectorAll('button')].pop(); b && b.click(); } }); await a.waitForTimeout(600);
    await a.evaluate(() => window.__pc.dispatchCall()); await a.waitForTimeout(900); console.log('intro shown:', await a.evaluate(() => !!document.querySelector('.cIntro'))); if (k === 0) await a.screenshot({ path: 'p_intro.png' });
    await a.waitForTimeout(2600); console.log('intro gone:', await a.evaluate(() => !document.querySelector('.cIntro')));
    await a.waitForFunction(() => !!window.__pc.call, null, { timeout: 20000 }).catch(() => {}); if (!(await a.evaluate(() => !!window.__pc.call))) { await a.evaluate(() => window.__pc.dispatchCall()); await a.waitForFunction(() => !!window.__pc.call, null, { timeout: 20000 }); }
    await a.evaluate(() => { const pc = window.__pc; pc.call.accepted = true; pc.P.x = pc.call.x + 1.1; pc.P.y = pc.call.y + .4; pc.P.path = []; }); await a.waitForTimeout(900);
    console.log('ring:', await a.evaluate(() => { const r = document.getElementById('ring'); return r.hidden ? 'hidden' : r.innerText.replace(/\n+/g, ' | '); })); if (k === 0) await a.screenshot({ path: 'p_ring.png' });
    if (k === 0) { await a.evaluate(() => { const pc = window.__pc; pc.P.x += 3; }); await a.waitForTimeout(700); console.log('walked off, ring hidden:', await a.evaluate(() => document.getElementById('ring').hidden || !document.getElementById('ring').classList.contains('on'))); await a.evaluate(() => { const pc = window.__pc; pc.P.x -= 3; }); await a.waitForTimeout(700); }
    await a.evaluate(() => { const b = document.querySelector('#ring [data-r="assess"]'); b && b.click(); }); await a.waitForTimeout(800);
    let rep = false; for (let s = 0; s < 60; s++) { const st = await a.evaluate(() => { if (document.querySelector('.rpt')) return 'report'; if (!document.getElementById('modal').hidden) { if (/ROLL CALL/.test(document.getElementById('modal').innerText)) { const b = [...document.querySelectorAll('#modal button')].pop(); b && b.click(); return 'roll'; } return 'modal'; } const q = document.querySelector('#dlg .dlgOpts [data-k]:not([disabled])'); if (q) { q.click(); return 'pick'; } const d = document.getElementById('dlg'); if (!d.hidden) { d.click(); return 'line'; } return 'idle'; }); if (st === 'report') { rep = true; await a.screenshot({ path: 'p_report.png' }); for (let i = 0; i < 3; i++) { await a.evaluate(() => { const b = document.querySelector('.rpt [data-k]:not([disabled])'); b && b.click(); }); await a.waitForTimeout(1300); } } if (st === 'modal') break; await a.waitForTimeout(300); }
    await a.waitForTimeout(800); console.log('report shown:', rep); console.log('debrief:', await a.evaluate(() => document.getElementById('modal').innerText.replace(/\n+/g, ' | ').slice(0, 420)));
    if (k === 0) await a.screenshot({ path: 'p_debrief.png' });
    await a.evaluate(() => { const b = [...document.querySelectorAll('#modal button')].pop(); b && b.click(); }); await a.waitForTimeout(1500);
    for (let i = 0; i < 4; i++) { await a.evaluate(() => { document.querySelectorAll('.tCard,.lootPop').forEach((x) => x.click()); const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|continue|nice/i.test(x.innerText) && x.offsetParent); if (b) b.click(); }); await a.waitForTimeout(400); }
  }
  console.log('threads:', await a.evaluate(() => JSON.stringify(window.__pc.S.threads)), 'helped:', await a.evaluate(() => Object.keys(window.__pc.S.helped).length));
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
