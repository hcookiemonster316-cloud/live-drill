// the studio and engine cards (splash.js, owner's call 2026-11-27): after the tap to start, Meridian Forge plays on its
// own canvas, then Sentry Engine, then the advisory cards; Skip jumps straight to the advisories; the title reads the
// class (26-10). With sound on, nothing in the synthesized sound design throws.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const fail = [];
  for (const skip of [false, true]) {
    const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); a.on('pageerror', (e) => fail.push(e.message));
    await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock');
    await a.evaluate(() => { sessionStorage.clear(); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], sound: true, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1 })); });
    await a.reload(); await a.waitForSelector('.bgGo', { timeout: 15000 }); await a.click('.bgGo');
    await a.waitForSelector('.spName.forge', { timeout: 3000 }).catch(() => fail.push('no studio card'));
    if (skip) { await a.waitForTimeout(600); await a.click('.bootSkip'); await a.waitForSelector('.advis', { timeout: 3000 }).catch(() => fail.push('skip did not jump to the advisories')); }
    else { await a.waitForSelector('.spName.eng', { timeout: 11000 }).catch(() => fail.push('no engine card')); await a.waitForTimeout(1500); /* the grid builds out over the first second */
      const lit = await a.evaluate(() => { const c = document.querySelector('.spCv'), g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4 * 97) if (d[i + 2] > 60) n++; return n; });
      if (lit < 20) fail.push('the engine card drew nothing: ' + lit);
      await a.waitForSelector('.advis', { timeout: 12000 }).catch(() => fail.push('never reached the advisories')); }
    await a.waitForSelector('#title:not([hidden]) .tiMenu button', { timeout: 15000 }).catch(() => {}); // the advisories advance on their own
    if (!skip) { const sub = await a.evaluate(() => (document.querySelector('#title .tiSub') || {}).innerText || ''); console.log('title:', sub); if (!/26-10/.test(sub)) fail.push('title does not read Class 26-10: ' + sub); }
    await a.context().close();
  }
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
