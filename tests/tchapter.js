// the rebuilt main story: play one chapter start to finish (first choice each time), added scenes included, and check
// that every scene ran, the chapter completed, and S.story / S.storyX ended where they should. node tests/tchapter.js <d>
const { chromium, devices } = require('playwright');
(async () => {
  const d = +(process.argv[2] || 0), home = d;
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' @' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate((h) => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: h, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: [0, 1, 2, 3, 4].reduce((o, k) => (o[k] = k < h ? 99 : 0, o), {}), cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false } })), home);
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const clear = async () => { for (let i = 0; i < 4; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); const m = document.getElementById('modal'); if (!m.hidden && !/STORY ARC|Story arc/.test(m.innerText)) { const bb = [...m.querySelectorAll('button')].pop(); bb && bb.click(); } }); await a.waitForTimeout(300); } };
  await clear(); await a.evaluate(() => { const pc = window.__pc; pc.S.track = 'main'; const lf = typeof pc.LF === 'function' ? pc.LF() : pc.LF; lf.gateStep = () => false; pc.CHAPTERS.forEach((ch) => ch.steps.forEach((s) => { delete s.quiz; })); /* the fact gate and the quizzes are tested elsewhere */ });
  const goals = []; let pre = 0;
  for (let k = 0; k < 24; k++) {
    const info = await a.evaluate((d) => { const A = window.__pc.activeQ(); if (!A || A.side || A.q.d !== d || !A.step) return null; return { i: A.i, pre: !!A.pre, goal: A.step.goal }; }, d); if (!info) break;
    goals.push((info.pre ? '+ ' : '') + info.goal); if (info.pre) pre++;
    await a.evaluate(() => { const pc = window.__pc; pc.playStep(pc.activeQ().step); });
    for (let s = 0; s < 120; s++) { const st = await a.evaluate(() => { const tw = document.querySelector('.twist'); if (tw) { tw.click(); return 'go'; } const dl = document.getElementById('dlg'); if (!dl.hidden) { const q = [...dl.querySelectorAll('.dlgOpts [data-k]:not([disabled])')].find((b) => !/^\s*Leave/.test(b.innerText)); /* never walk away */ if (q) q.click(); else dl.click(); return 'go'; } return window.__pc.storyBusy ? 'busy' : 'done'; }); if (st === "done") break; await a.waitForTimeout(450); }
    await a.waitForTimeout(1500); await a.evaluate(() => { const t = document.querySelector('.twist'); if (t) t.click(); }); await a.waitForTimeout(700); await clear();
  }
  const S = await a.evaluate((d) => { const pc = window.__pc; return { story: pc.S.story[d], len: pc.CHAPTERS[d].steps.length, x: (pc.S.storyX || {})[d] || 0 }; }, d);
  await a.screenshot({ path: 'ch_' + d + '.png' });
  console.log(goals.join('\n'));
  console.log('chapter', d + 1, 'scenes played', goals.length, '(' + pre + ' new) | story', S.story + '/' + S.len, '| storyX', S.x);
  if (S.story < S.len) errs.push('chapter did not finish');
  console.log(errs.length ? errs : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
