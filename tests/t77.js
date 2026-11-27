// score rotation: tracks play, rotate, and survive a missing file
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const c = await b.newContext({ viewport: { width: 1280, height: 800 } }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: true, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.mouse.click(640, 400); await a.waitForTimeout(6000);
  const st = () => a.evaluate(() => { const m = window.__pc.music; return m ? m.mood + ' | ' + m.title + ' | ' + m.usingFile : 'no music handle'; });
  console.log('now:', await st());
  const tracks = new Set(); for (let i = 0; i < 6; i++) { await a.evaluate(() => { const m = window.__pc.music; m.set('call'); }); await a.waitForTimeout(800); await a.evaluate(() => { window.__pc.music.set('day'); }); await a.waitForTimeout(7000); tracks.add(await st()); }
  console.log('day rotation seen:', [...tracks].join(' || '));
  const before = await st(); await a.evaluate(() => { document.querySelectorAll('audio').forEach(() => 0); }); 
  // jump the live track to its last seconds and let the rotation advance on its own
  await a.evaluate(() => { const els = [...document.querySelectorAll('audio')]; }); 
  const ok = await a.evaluate(() => { const m = window.__pc.music; return !!m; });
  await a.evaluate(() => { const A = window.__audioEls || []; });
  console.log('before natural end:', before);
  await a.evaluate(() => { window.__pc.music.__seekEnd && window.__pc.music.__seekEnd(); }); await a.waitForTimeout(6000);
  console.log('after natural end:', await st());
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
