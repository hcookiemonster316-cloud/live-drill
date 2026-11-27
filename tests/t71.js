// story arcs: play Badge 214 start to finish (first choice each time), check items, twists, branch, completion
const { chromium, devices } = require('playwright');
(async () => {
  const id = process.argv[2] || 'badge214', home = +(process.argv[3] || 0);
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' @' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate((h) => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: h, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false } })), home);
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const clear = async () => { for (let i = 0; i < 4; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); const m = document.getElementById('modal'); if (!m.hidden && !/STORY ARC|Story arc/.test(m.innerText)) { const bb = [...m.querySelectorAll('button')].pop(); bb && bb.click(); } }); await a.waitForTimeout(300); } };
  await clear();
  await a.evaluate((id) => { const S = window.__pc.S; S.side[id] = 0; S.track = id; }, id);
  const twists = []; let steps = 0;
  for (let k = 0; k < 14; k++) {
    const info = await a.evaluate((id) => { const pc = window.__pc, A = pc.activeQ(); if (!A || !A.side || A.q.id !== id || !A.step) return null; return { i: A.i, goal: A.step.goal }; }, id); if (!info) break;
    await a.evaluate(() => { const pc = window.__pc; pc.playStep(pc.activeQ().step); }); steps++;
    for (let s = 0; s < 80; s++) { const st = await a.evaluate(() => { const tw = document.querySelector('.twist'); if (tw) { const t = tw.querySelector('h2').innerText; tw.click(); return 'twist:' + t; } const d = document.getElementById('dlg'); if (!d.hidden) { const q = d.querySelector('.dlgOpts [data-k]:not([disabled])'); if (q) q.click(); else d.click(); return 'go'; } return window.__pc.storyBusy ? 'busy' : 'done'; }); if (st.startsWith('twist:')) twists.push(st.slice(6)); if (st === 'done') break; await a.waitForTimeout(150); }
    await a.waitForTimeout(1500); const tw = await a.evaluate(() => { const t = document.querySelector('.twist'); if (!t) return null; const x = t.querySelector('h2').innerText; t.click(); return x; }); if (tw) twists.push(tw);
    await a.waitForTimeout(700);
  }
  await a.waitForTimeout(800); const end = await a.evaluate(() => document.getElementById('modal').innerText.replace(/\n+/g, ' | ').slice(0, 160)); await a.screenshot({ path: 'sg_' + id + '.png' });
  console.log(id, 'steps played', steps, '| twists:', twists.join(' / '));
  console.log('items:', await a.evaluate(() => JSON.stringify([Object.keys(window.__pc.S.qitems), Object.keys(window.__pc.S.qkept)])), '| end:', end);
  await a.evaluate(() => { const m = document.getElementById('modal'); const bb = m && [...m.querySelectorAll('button')].pop(); bb && bb.click(); }); await a.waitForTimeout(600);
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
