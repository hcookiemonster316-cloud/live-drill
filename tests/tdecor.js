// echoes, part two: a business that stops calling, the roadside memorial and the community board
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 700 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0, 1], shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(5000); await a.mouse.click(450, 350); await a.waitForTimeout(1200);
  const close = () => a.evaluate(() => { document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); [...document.querySelectorAll('button')].filter((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent).forEach((x) => x.click()); document.querySelectorAll('.tCard').forEach((x) => x.click()); });
  await close();
  // three good calls at the same named business
  const r = await a.evaluate(() => { const pc = window.__pc, lot = pc.W.lots.find((l) => l.name && l.door && /^(shop|cafe|diner|pawn|bank|barber|books|pizza)$/.test(l.kind)); for (let i = 0; i < 3; i++) pc.ECHO.afterCall({ where: lot.name, title: 'Shoplifter at ' + lot.name }, { n: 3, right: 3 }); pc.ECHO.afterCall({ where: 'Lincoln Elementary', title: 'Seat belt talk at drop-off' }, { n: 3, right: 2 });
    return { lot: lot.name, kind: lot.kind, settled: pc.ECHO.settled(lot.name), door: lot.door, decor: pc.ECHO.decor(), flyers: pc.ECHO.flyers() }; });
  console.log(JSON.stringify(r));
  await a.waitForTimeout(3800); console.log('radio:', await a.evaluate(() => (document.getElementById('radio') || {}).innerText.replace(/\s+/g, ' ').slice(-170)));
  const shoot = async (x, y, name) => { await a.evaluate(([x, y]) => { const pc = window.__pc; pc.P.x = x; pc.P.y = y + 1; pc.P.path = []; }, [x, y]); await a.waitForTimeout(2200); await close(); await a.evaluate(() => { const pc = window.__pc; if (pc.cam) pc.cam.z = 3.2; }); await a.waitForTimeout(500); await a.screenshot({ path: name, clip: { x: 250, y: 180, width: 400, height: 320 } }); };
  await shoot(r.decor.mem[0], r.decor.mem[1], 'tdecor_mem.png');
  console.log('toast at memorial:', await a.evaluate(() => [...document.querySelectorAll('.toast,#toast')].map((x) => x.innerText).join(' | ').slice(0, 200)));
  await shoot(r.decor.board[0], r.decor.board[1], 'tdecor_board.png');
  console.log('toast at board:', await a.evaluate(() => [...document.querySelectorAll('.toast,#toast')].map((x) => x.innerText).join(' | ').slice(0, 200)));
  await shoot(r.door[0] + .9, r.door[1] + .3, 'tdecor_open.png');
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close(); })();
