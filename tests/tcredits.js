// the credits (creditscore.js, owner's call 2026-11-27): "Last Watch", their own score, loads and plays from the
// first name; the roll lasts as long as the score so the main motif lands with the last names; the game's own music
// stays out of its way; Back fades it and hands the music back.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  let cue = false; a.on('requestfinished', (r) => { if (/credits_cue\.mp3/.test(r.url())) cue = true; });
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock');
  await a.evaluate(() => { sessionStorage.clear(); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], sound: true, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1 })); });
  await a.reload(); await a.waitForSelector('.bgGo', { timeout: 15000 }); await a.click('.bgGo'); await a.waitForSelector('.bootSkip'); await a.click('.bootSkip');
  await a.waitForSelector('#title:not([hidden]) .tiMenu button', { timeout: 20000 });
  await a.evaluate(() => [...document.querySelectorAll('.tiMenu button')].find((x) => /credits/i.test(x.innerText)).click());
  await a.waitForSelector('.crRoll', { timeout: 5000 }).catch(() => fail.push('no credits roll'));
  await a.waitForTimeout(2500);
  const st = await a.evaluate(() => ({ dur: document.querySelector('.crRoll').style.animationDuration, music: window.__pc && window.__pc.musicMood ? window.__pc.musicMood() : null }));
  if (!cue) fail.push('"Last Watch" never loaded');
  if (st.dur !== '68s') fail.push('roll does not last as long as the score: ' + st.dur);
  await a.click('#crBack'); await a.waitForFunction(() => document.getElementById('fe').hidden, null, { timeout: 4000 }).catch(() => fail.push('Back did not close the credits'));
  const dur = await a.evaluate(async () => { const r = await fetch('music/credits_cue.mp3'); const d = await new AudioContext().decodeAudioData(await r.arrayBuffer()); return d.duration; });
  console.log('roll', st.dur, '| score', dur.toFixed(1) + 's'); if (dur < 66) fail.push('score too short for the roll: ' + dur);
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
