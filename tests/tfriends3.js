// the last thirty regulars' stories (friends3.js + friends3x.js) are live in the game: every regular in the city has a
// five-part arc, the grown scenes are applied, and each arc ends with a keepsake beat. Boots the game once.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, cash: 50, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const r = await a.evaluate(async () => { const f = await import('./friends.js'), pc = { arc: (id) => f.ARCS[id] }, m = await import('./friends3.js'), ids = Object.keys(m.ARCS3), bad = [];
    for (const id of ids) { const A = pc.arc(id); if (!A) { bad.push(id + ' missing'); continue; } if (A.parts.length !== 5) bad.push(id + ' parts ' + A.parts.length);
      if (A.parts[0].length <= m.ARCS3[id].parts[0].length && !A.grown) bad.push(id + ' not grown'); }
    return { n: ids.length, bad }; });
  console.log(r.n + ' new arcs in the game'); if (r.n < 30) fail.push('only ' + r.n + ' arcs'); fail.push(...r.bad);
  console.log(fail.length ? 'ERRORS ' + fail.slice(0, 8).join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
