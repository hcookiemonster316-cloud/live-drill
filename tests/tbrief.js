// the briefing (brief.js + briefscore.js, owner's calls 2026-11-27): its own score, "Hold the Line", loads and starts on
// the first frame; the shots follow the score's bars (two per shot at 72 bpm); Skip fades it out and hands back; the
// whole thing plays with sound on without an error. The cue file itself must exist and run about 55 seconds.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  let cue = false; a.on('requestfinished', (r) => { if (/brief_cue\.mp3/.test(r.url())) cue = true; });
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', lname: 'Rivera', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, sound: true, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.evaluate(() => { window.__t0 = performance.now(); window.__pc.BRIEF.play(() => { window.__done = (performance.now() - window.__t0) / 1000; }); });
  await a.waitForSelector('.brief .bfCv', { timeout: 6000 }).catch(() => fail.push('the briefing never opened'));
  await a.waitForFunction(() => /Castillo/.test((document.querySelector('.bfCap b') || {}).textContent || ''), null, { timeout: 12000 }).catch(() => {}); // the second shot: one bar of lights (3.33 s) after the score has loaded
  const st = await a.evaluate(() => ({ who: (document.querySelector('.bfCap b') || {}).textContent, said: (document.querySelector('.bfCap p') || {}).textContent }));
  if (st.who !== 'Sgt. Castillo') fail.push('second shot is not Castillo: ' + JSON.stringify(st));
  if (!cue) fail.push('the score was never loaded');
  await a.click('.bfSkip'); await a.waitForFunction(() => window.__done != null, null, { timeout: 4000 }).catch(() => fail.push('skip did not hand back'));
  const left = await a.evaluate(() => !!document.querySelector('.brief')); await a.waitForTimeout(900); if (await a.evaluate(() => !!document.querySelector('.brief'))) fail.push('the briefing stayed on screen after skip');
  const seen = await a.evaluate(() => window.__pc.S.seenBrief); if (!seen) fail.push('seenBrief not set');
  const dur = await a.evaluate(async () => { const r = await fetch('music/brief_cue.mp3'); const buf = await r.arrayBuffer(); const ac = new AudioContext(); const d = await ac.decodeAudioData(buf); return d.duration; });
  console.log('cue length', dur.toFixed(1) + 's', '| second shot:', st.said.slice(0, 40));
  if (dur < 50 || dur > 60) fail.push('cue length ' + dur);
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
