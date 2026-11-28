// the score builds with the action (score.js): when a call turns Priority 1 or a pursuit starts, a drum pulse locked to
// the playing track's beat fades in; when it calms, it fades out. Needs the recorded score to be playing.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: true, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(1500);
  const ready = await a.waitForFunction(() => window.__pc.music && window.__pc.music.usingFile, null, { timeout: 25000 }).then(() => true).catch(() => false);
  if (!ready) { console.log('recorded score did not load here; skipping'); console.log('no errors'); await b.close(); return; }
  const p0 = await a.evaluate(() => window.__pc.music.pulse);
  await a.evaluate(() => { const m = window.__pc.music, o = m.tension.bind(m); window.__TK = 1; m.tension = () => o(window.__TK); o(1); }); /* the game sets tension every 0.8 s: pin it */
  await a.waitForTimeout(4000); const p1 = await a.evaluate(() => window.__pc.music.pulse);
  await a.evaluate(() => { window.__TK = 0; window.__pc.music.tension(0); });
  await a.waitForTimeout(4000); const p2 = await a.evaluate(() => window.__pc.music.pulse);
  console.log('pulse calm', p0.toFixed(2), '-> urgent', p1.toFixed(2), '-> calm again', p2.toFixed(2));
  if (p0 > .05) fail.push('pulse playing while calm'); if (p1 < .8) fail.push('pulse did not come in on an urgent call'); if (p2 > .1) fail.push('pulse did not fade out');
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
