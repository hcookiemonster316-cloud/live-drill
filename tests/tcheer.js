// the block notices (game.js cheerAt): after an A or S on a call, people nearby stop, turn and wave, and one says
// something; a C or below draws nothing; it wears off after a few seconds.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, cash: 5000, spendHint: 1, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(1500);
  const clear = () => a.evaluate(() => { document.querySelectorAll('.lorePop [data-a]:not([data-a="read"]), .promo button, .rv [data-a="keep"]').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mDone, #mClose'); if (bt) bt.click(); } });
  for (let i = 0; i < 6; i++) { await clear(); await a.waitForTimeout(300); }
  const n0 = await a.evaluate(() => { const pc = window.__pc, p = pc.peds && pc.peds.filter((x) => !x.bike && !x.dog)[0]; if (!p) return -1; pc.P.x = p.x + 2; pc.P.y = p.y + 1; pc.P.path = []; pc.cheerAt({ x: p.x, y: p.y }, 'C'); return pc.CHEER.length; });
  if (n0 !== 0) fail.push('a C grade drew a crowd: ' + n0);
  await a.waitForTimeout(700);
  const n1 = await a.evaluate(() => { const pc = window.__pc; pc.cheerAt({ x: pc.P.x, y: pc.P.y }, 'S'); return pc.CHEER.length; });
  await a.waitForTimeout(1300); const w = await a.evaluate(() => window.__pc.CHEER.filter((c) => c.p.wave && !c.p.moving).length);
  await clear(); await a.waitForTimeout(250); await a.screenshot({ path: 'w_cheer.png' }); console.log('cheering', n1, 'waving', w);
  if (n1 < 1) fail.push('nobody noticed an S'); if (w < n1) fail.push('not everyone stopped to wave');
  for (let i = 0; i < 20; i++) { await clear(); await a.waitForTimeout(450); } const n2 = await a.evaluate(() => window.__pc.CHEER.length); if (n2) fail.push('the crowd never went back to their day');
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
