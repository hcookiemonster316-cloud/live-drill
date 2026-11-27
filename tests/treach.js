// one more shift (reach.js): the closest goals are found across cases, friends, facts and rank; your call becomes a
// shift order that completes when the goal does; the shift report shows "Within reach" and, after three shifts in one
// sitting, says it's a good place to stop. node tests/treach.js
const { chromium, devices } = require('playwright');
(async () => {
  const home = 1;
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' @' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate((h) => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: h, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: [0, 1, 2, 3, 4].reduce((o, k) => (o[k] = k < h ? 99 : 0, o), {}), cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false } })), home);
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const clear = async () => { for (let i = 0; i < 4; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.rv').forEach((x) => { x.click(); const k = x.querySelector('[data-a="keep"]'); if (k) k.click(); }); /* a loot reveal waits for a tap, and pauses the clock until it gets one */ document.querySelectorAll('.lorePop').forEach((x) => x.remove()); const m = document.getElementById('modal'); if (!m.hidden && !/STORY ARC|Story arc/.test(m.innerText)) { const bb = [...m.querySelectorAll('button')].pop(); bb && bb.click(); } }); await a.waitForTimeout(300); } };
  await clear();
  const t = await a.evaluate(() => { const pc = window.__pc, S = pc.S, q = pc.SIDE.find((x) => x.id === 'sockbandit'); S.side.sockbandit = q.steps.length - 1; return pc.reach.top(3).map((g) => g.k + ' ' + Math.round(g.pct * 100) + '%'); });
  console.log('within reach', JSON.stringify(t)); if (!t.some((k) => k.startsWith('case:sockbandit'))) errs.push('a case one step from closing is not within reach');
  await a.evaluate(() => { const pc = window.__pc; pc.closeModal && pc.closeModal(); pc.reach.offer(() => { window.__offered = 1; }); }); await a.waitForTimeout(600);
  const picked = await a.evaluate(() => { const b = [...document.querySelectorAll('[data-rf]')].find((x) => /Sock Bandit/.test(x.innerText)); if (!b) return false; b.click(); return true; });
  if (!picked) errs.push('Your call did not offer the case');
  const ord = await a.evaluate(() => { const o = window.__pc.S.orders; return o ? o.list.map((x) => x.id + (x.done ? '+' : '')).join(',') : ''; });
  console.log('orders', ord); if (!/focus/.test(ord)) errs.push('your call did not become a shift order');
  if ((await a.evaluate(() => window.__pc.S.track)) !== 'sockbandit') errs.push('your call did not set the gold arrow to the case');
  await a.evaluate(() => { const pc = window.__pc, q = pc.SIDE.find((x) => x.id === 'sockbandit'); pc.S.side.sockbandit = q.steps.length; });
  let done = false; for (let k = 0; k < 30 && !done; k++) { await a.waitForTimeout(500); await clear(); done = await a.evaluate(() => window.__pc.S.orders.list.some((x) => x.id === 'focus' && x.done)); } // the check runs on the game clock, which waits while a card is up if (!done) errs.push('finishing the case did not complete your call');
  const rep = await a.evaluate(() => { const pc = window.__pc, q2 = pc.SIDE.find((x) => x.id === 'ghostcar'); pc.S.side.ghostcar = q2.steps.length - 2; const r = pc.reach; return [r.reportHtml(), r.reportHtml(), r.reportHtml()]; });
  if (!/Within reach/.test(rep[0])) errs.push('no Within reach in the shift report'); if (/good place to stop/.test(rep[1])) errs.push('stop line too early'); if (!/good place to stop/.test(rep[2])) errs.push('no stop line after three shifts');
  const pb = await a.evaluate(() => { const r = window.__pc.reach; window.__pc.S.pb = {}; const first = r.records({ calls: 4, right: 9, answered: 10 }, 5); const second = r.records({ calls: 6, right: 8, answered: 10 }, 3); return [first, second]; });
  if (pb[0]) errs.push('a first shift should only set the baseline'); if (!/6 calls cleared in one shift \(best was 4\)/.test(pb[1]) || /right in a row|accuracy/.test(pb[1])) errs.push('personal bests wrong: ' + pb[1].replace(/<[^>]+>/g, ' '));
  // the clock runs twice as fast on a short shift (measured against a full one, each the best of three, since a card can pause it)
  const rate = async (len) => { let best = 0; for (let k = 0; k < 3; k++) { await clear(); best = Math.max(best, await a.evaluate(async (len) => { const pc = window.__pc; pc.closeModal(); pc.S.cfg.shiftLen = len; const c0 = pc.clock; await new Promise((r) => setTimeout(r, 1200)); return pc.clock - c0; }, len)); } return best; };
  const full = await rate('full'), short = await rate('short'); await a.evaluate(() => { window.__pc.S.cfg.shiftLen = 'full'; });
  console.log('clock in 1.2 s: full', full.toFixed(2), 'short', short.toFixed(2)); if (!(short > full * 1.6)) errs.push('a short shift does not run its clock twice as fast');
  await a.evaluate((h) => { const pc = window.__pc; pc.openModal('<div class="rpt">' + h + '</div>'); }, rep[2]); await a.waitForTimeout(400); await a.screenshot({ path: 'reach.png' });
  console.log(errs.length ? errs : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
