// questions tied to the call (learn.js pickFacts near): given the call's own words, the facts that share them come first,
// and without them the pick is unchanged. Checked on every lesson in the district with a word taken from one of its facts.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, cash: 5000, spendHint: 1, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(1500);
  const r = await a.evaluate(() => { const pc = window.__pc, L = pc.L, out = [];
    for (const les of pc.W.D.lessons) { const fs = L.factList([les]).filter((f) => !(pc.S.facts || {})[f.id]); let hit = 0, n = 0;
      for (let k = 0; k < fs.length && n < 4; k += Math.max(1, Math.floor(fs.length / 4))) { const f = fs[k], w = (f.text.toLowerCase().match(/[a-z]{8,}/g) || [])[0]; if (!w) continue; n++;
        const q = L.pickFacts(pc.S, [les], 1, { near: 'Caller reports ' + w + ' near the corner' })[0], fx = q && L.factList([les]).find((x) => x.id === q.fid); if (fx && fx.text.toLowerCase().indexOf(w.slice(0, 6)) >= 0) hit++; }
      out.push([les, n, hit]); } return out; });
  console.log(JSON.stringify(r));
  if (!r.length) fail.push('no lessons to check'); r.forEach(([les, n, hit]) => { if (n && hit < n - 1) fail.push('lesson ' + les + ': only ' + hit + '/' + n + ' picks matched the call'); });
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
