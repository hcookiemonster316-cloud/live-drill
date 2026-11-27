// review through the radio and the exam-readiness meter
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  const facts = {}; for (let i = 0; i < 120; i++) facts['F' + i] = 1;
  await a.evaluate((facts) => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, facts, fmiss: { F5: Date.now() - 6 * 60000, F60: Date.now() - 60000 }, cfg: { autoQ: false, callCine: false } })), facts);
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(1500);
  const r = await a.evaluate(() => { const pc = window.__pc, L = pc.L, S = pc.S; const f5 = L.factById('F5'), f60 = L.factById('F60');
    const due = L.dueReviews(S, [f5.les, f60.les]).map((f) => f.id); const ws = []; for (let i = 0; i < 20; i++) ws.push(L.weakest(S, 0));
    const first = L.pickFacts(S, [f5.les], 1)[0]; const rd = L.readiness(S);
    return { f5les: f5.les, due, weakestAlways: ws.every((w) => w === f5.les), firstFact: first && first.fid, ready: { pct: rd.pct, solid: rd.solid, total: rd.total, review: rd.review, weak: rd.weak.map((w) => w.name + ' ' + w.done + '/' + w.total) } }; });
  console.log(JSON.stringify(r, null, 1));
  console.log('review due only after 4 minutes:', JSON.stringify(r.due) === '["F5"]', '| dispatch leans to it:', r.weakestAlways, '| asked first:', r.firstFact === 'F5');
  await a.waitForTimeout(4000); await a.mouse.click(200, 400); await a.waitForTimeout(1500); await a.evaluate(() => { document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); window.__pc.PATH.panel(); });
  await a.waitForTimeout(800); await a.evaluate(() => { const r = document.querySelector('.ready'); if (r) r.scrollIntoView({ block: 'center' }); }); await a.waitForTimeout(300); await a.screenshot({ path: 'tready_path.png' });
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close(); })();
