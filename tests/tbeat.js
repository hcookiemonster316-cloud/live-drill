// the biggest story beats, staged: a ['beat'] line is a silence (the box dims, the music drops to a hush, a tap can't
// skip it), then the scene goes on; gestures come from a line's tag or its stage direction. The ten biggest moments
// (five chapter endings, the pin, Lassiter's letter and Castillo reading it, Walsh's pension, Park's apron) each have one.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => { const errs = [];
  // the ten moments carry a silence
  const src = (f) => fs.readFileSync(path.join(__dirname, '..', 'academy', f), 'utf8'); const near = (f, text) => { const s = src(f), i = s.indexOf(text); return i > 0 && s.slice(Math.max(0, i - 40), i).indexOf('\'beat\'') >= 0; };
  [['story.js', '\'Good first shift.'], ['story.js', '\'Riverside\\\'s next, Pike.'], ['story.js', '\'...A storage unit?\''], ['story.js', '\'That\\\'s exactly why I\\\'m going to be there'], ['story.js', '\'I owe you the rest of the story.'], ['story.js', '\'I\\\'d like it on the record'],
    ['game.js', '\'Earned it. Back on the street tomorrow.\''], ['lassiter.js', '\'Your report was clean. I read it four times.'], ['lassiter.js', '\'(reading it) ...Week nine.'], ['lifeday.js', '\'You know what I\\\'m going to miss?'], ['lifeday.js', '\'This. I want this.']].forEach(([f, t]) => { if (!near(f, t)) errs.push('no silence before ' + t + ' in ' + f); });
  const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 3000, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, cfg: { callCine: false, text: 'instant' }, teach: { done: {}, n: 0, last: Date.now() }, stage: { seen: {}, n: 0, last: Date.now() } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.dialogue, null, { timeout: 20000 });
  for (let i = 0; i < 20; i++) { if (await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); return pc.free; })) break; await a.waitForTimeout(400); }
  await a.evaluate(() => window.__pc.dialogue([['castillo', 'There\'s something I never told you.'], ['beat', { ms: 1800 }], ['castillo', '(shakes her head) Not today.'], ['castillo', 'Go home.']], () => { window.__bd = 1; }));
  for (let i = 0; i < 8; i++) { await a.waitForTimeout(300); if (await a.evaluate(() => document.getElementById('dlg').classList.contains('dlgHush'))) break; await a.evaluate(() => document.getElementById('dlg').click()); } // tap on to the silence
  const h0 = await a.evaluate(() => ({ hush: document.getElementById('dlg').classList.contains('dlgHush'), body: document.body.classList.contains('hushOn'), text: document.querySelector('#dlg .dlgBody').innerText.slice(0, 40) }));
  await a.evaluate(() => document.getElementById('dlg').click()); await a.waitForTimeout(500); // a tap in the silence does nothing
  const h1 = await a.evaluate(() => ({ hush: document.getElementById('dlg').classList.contains('dlgHush'), text: document.querySelector('#dlg .dlgBody').innerText.slice(0, 40) }));
  await a.screenshot({ path: 'tbeat.png' }); await a.waitForTimeout(1500);
  const h2 = await a.evaluate(() => ({ hush: document.getElementById('dlg').classList.contains('dlgHush'), body: document.body.classList.contains('hushOn'), text: document.querySelector('#dlg .dlgBody').innerText.slice(0, 40) }));
  console.log('in the silence', JSON.stringify(h0), '| tapped', JSON.stringify(h1), '| after', JSON.stringify(h2));
  if (!h0.hush || !h0.body) errs.push('the silence did not hush the scene'); if (!h1.hush || h1.text !== h0.text) errs.push('a tap skipped the silence'); if (h2.hush || h2.body || !/Not today/.test(h2.text)) errs.push('the scene did not go on after the silence');
  for (let i = 0; i < 10 && !(await a.evaluate(() => !!window.__bd)); i++) { await a.evaluate(() => document.getElementById('dlg').click()); await a.waitForTimeout(400); } if (!(await a.evaluate(() => !!window.__bd))) errs.push('the scene never finished');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
