// walk-around inspection: a lesson-0 call opens the car, three problems, decisions recorded as chapter facts
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false, callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(5000); await a.mouse.click(200, 400); await a.waitForTimeout(1200);
  await a.evaluate(() => { document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); const pc = window.__pc; if (pc.curCall) pc.dropCall();
    const c = { les: 0, title: 'Prisoner transport just ended', prio: 3, text: 'You just dropped off a prisoner.', where: 'Patrol HQ', x: pc.P.x, y: pc.P.y, t0: 0, accepted: true, kind: 'street' }; pc.openCallScene(c); });
  let woOpen = false;
  for (let k = 0; k < 40 && !woOpen; k++) { await a.waitForTimeout(250); woOpen = await a.evaluate(() => { if (document.querySelector('.woCar')) return true; const d = document.getElementById('dlg'); if (!d.hidden) { const ch = d.querySelector('.dlgOpts button:not([disabled])'); if (ch) ch.click(); else d.click(); } return false; }); }
  console.log('walk-around opened:', woOpen); console.log('top el:', await a.evaluate(() => { const e = [...document.querySelectorAll('body *')].filter((n) => n.children.length === 0 && /Walk around it like/.test(n.textContent)).pop(); const p = []; let x = e; while (x && p.length < 6) { p.push(x.tagName + '#' + x.id + '.' + x.className); x = x.parentElement; } return p.join(' < ') + ' | woOn=' + document.body.classList.contains('woOn'); }));
  await a.waitForTimeout(400); await a.screenshot({ path: 'thands_0.png' });
  const zones = await a.evaluate(() => [...document.querySelectorAll('.woCar .woZone')].map((z) => z.dataset.z));
  let shot = false;
  for (const z of zones) {
    const st = await a.evaluate((z) => { const el = document.querySelector('.woCar .woZone[data-z="' + z + '"]'); if (!el) return 'gone'; el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return document.querySelector('.woFind') ? 'find' : 'ok'; }, z);
    if (st === 'find') { if (!shot) { await a.waitForTimeout(200); await a.screenshot({ path: 'thands_1.png' }); shot = true; }
      await a.evaluate(() => { const o = document.querySelectorAll('.woOpt'); o[0].click(); }); await a.waitForTimeout(150);
      const why = await a.evaluate(() => (document.querySelector('.woWhy') || {}).innerText || ''); console.log('  ' + z + ':', why.slice(0, 110));
      await a.evaluate(() => document.getElementById('woNext').click()); await a.waitForTimeout(150); }
    if (await a.evaluate(() => document.getElementById('modal').hidden)) break;
  }
  await a.waitForTimeout(600);
  const after = await a.evaluate(() => ({ closed: document.getElementById('modal').hidden && !document.body.classList.contains('woOn'), seen: Object.keys(window.__pc.S.seen || {}).filter((k) => /^wo:/.test(k)), fseen: Object.keys(window.__pc.S.fseen || {}).length, backSeat: Object.keys(window.__pc.S.seen || {}).includes('wo:12') }));
  console.log('after:', JSON.stringify(after));
  for (let k = 0; k < 30; k++) { await a.waitForTimeout(250); const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return 'hidden'; const ch = d.querySelector('.dlgOpts button:not([disabled])'); if (ch) ch.click(); else d.click(); return 'L'; }); if (st === 'hidden') break; }
  await a.waitForTimeout(800); await a.screenshot({ path: 'thands_2.png' });
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close(); })();
