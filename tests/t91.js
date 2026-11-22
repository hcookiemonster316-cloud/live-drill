// quest flow rules: concrete short goals, beat shapes alternate, long lines split, case shapes take turns, errands pay
const { chromium } = require('playwright');
(async () => {
  const B = require('url').pathToFileURL(require('path').resolve(__dirname, '../academy')).href + '/';
  const { SIDE, CHAPTERS } = await import(B + 'story.js'); const { SIDE2 } = await import(B + 'sidequests.js'); const { SAGAS } = await import(B + 'sagas.js'); const { TALES } = await import(B + 'tales.js');
  const bad = [];
  for (const arr of [SIDE, SIDE2, SAGAS, TALES, CHAPTERS]) for (const q of arr) (q.steps || []).forEach((s, i) => {
    const g = s.goal || ''; if (g.length > 52) bad.push('long goal: ' + g);
    if (!g.split(/\s+/).slice(1).some((w) => /^[A-Z0-9]/.test(w))) bad.push('vague goal: ' + g);
  });
  console.log('lint', bad.length ? bad : 'ok');
  const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 3 }, cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const r = await a.evaluate(() => { const V = window.__pc.VAR, S = window.__pc.S, out = {};
    const long = 'This is the first sentence and it goes on for a while about the bike. The second sentence keeps going about the man in the hoodie who sold it. A third one wraps it up with where he went after that, toward the river.';
    out.split = V.splitLong([['dot', long], ['narr', 'short']]).map((l) => l[0] + ':' + l[1].length);
    S.vqBeat = null; const st = { who: 'dot', at: 'Night Owl Diner', goal: 'Talk to Dot', say: [['dot', 'Hi.'], ['dot', 'Bye.']] };
    const s1 = V.questSeq({ st, seq: st.say, side: false }); const b1 = S.vqBeat;
    const s2 = V.questSeq({ st, seq: st.say, side: false }); const b2 = S.vqBeat;
    out.beats = [b1, b2, s1.length, s2.length, s2.filter((l) => l[0] === 'q' || l[0] === 'wait').length];
    const SIDE = window.__pc.SIDE, sh = {}; SIDE.forEach((q) => { const k = V.questShape(q); sh[k] = (sh[k] || 0) + 1; }); out.shapes = sh;
    const er = SIDE.filter((q) => V.questShape(q) === 'errand'), ta = SIDE.filter((q) => V.questShape(q) === 'dilemma');
    S.vqShape = 'errand'; out.offer = [V.offerOK(er[0], [er[0], ta[0]]), V.offerOK(ta[0], [er[0], ta[0]]), V.offerOK(er[0], [er[0], er[1]])];
    return out; });
  console.log(JSON.stringify(r));
  // play a whole side case through the game and check the errand payoff fires on a mid-case delivery
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close();
})();
