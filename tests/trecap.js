// the story so far (recap.js): a case you've played opens as a short film from the Field Journal. Every step you
// played is a shot (place, person, the moment, the choice you made), it can be stepped and skipped, and a case you
// left a while ago offers "Previously on" at roll call. node tests/trecap.js
const { chromium, devices } = require('playwright');
(async () => {
  const home = 1;
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' @' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate((h) => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: h, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: [0, 1, 2, 3, 4].reduce((o, k) => (o[k] = k < h ? 99 : 0, o), {}), cards: { ch0: 1, ch1: 1, ch2: 1, ch3: 1, ch4: 1 }, cfg: { callCine: false } })), home);
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const clear = async () => { for (let i = 0; i < 4; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); const m = document.getElementById('modal'); if (!m.hidden && !/STORY ARC|Story arc/.test(m.innerText)) { const bb = [...m.querySelectorAll('button')].pop(); bb && bb.click(); } }); await a.waitForTimeout(300); } };
  await clear();
  // a case half played, with a choice made
  await a.evaluate(() => { const pc = window.__pc, S = pc.S; const q = pc.SIDE.find((x) => x.id === 'sockbandit'); S.side.sockbandit = Math.min(3, q.steps.length - 1); const sets = []; q.steps.slice(0, 3).forEach((s) => (s.say || []).forEach((l) => { if (l[0] === 'choice' && l[1][0].set) sets.push(l[1][0].set); })); sets.forEach((f) => { S.flags[f] = Date.now(); }); });
  await a.evaluate(() => { const pc = window.__pc; pc.journalTab('story'); }); await a.waitForTimeout(700);
  const btn = await a.evaluate(() => { const b = document.querySelector('[data-rc="sockbandit"]'); if (!b) return false; b.click(); return true; });
  if (!btn) errs.push('no Story so far button for a case in progress');
  await a.waitForTimeout(1500);
  const r = await a.evaluate(() => { const el = document.querySelector('.recap'); if (!el) return null; return { n: el.querySelectorAll('.rcDots i').length, place: (el.querySelector('.rcPlace') || {}).innerText, text: (el.querySelector('.rcText') || {}).innerText, port: !!el.querySelector('.rcPort'), paused: window.__pc.paused }; });
  if (!r) errs.push('the recap did not open'); else { console.log('recap', JSON.stringify(r).slice(0, 300)); if (r.n < 2) errs.push('fewer than 2 shots'); if (!r.text) errs.push('a shot with no words'); }
  await a.screenshot({ path: 'recap.png' });
  for (let k = 0; k < 6; k++) { await a.evaluate(() => { const b = document.querySelector('.recap [data-r="next"]'); if (b) b.click(); }); await a.waitForTimeout(500); }
  const chose = await a.evaluate(() => !!window.__rcChose);
  const gone = await a.evaluate(() => !document.querySelector('.recap'));
  await a.waitForTimeout(700);
  if (!(await a.evaluate(() => !document.querySelector('.recap')))) errs.push('the recap did not close at the end');
  // a whole chapter: its added scenes are shots too, and your choices come back (the hot dog)
  const ch = await a.evaluate(() => { const pc = window.__pc; pc.S.flags.paidDelgado = Date.now(); pc.recap.play(pc.CHAPTERS[0], false); const el = document.querySelector('.recap'); const n = el ? el.querySelectorAll('.rcDots i').length : 0; const all = pc.recap.beats.map((b) => b.lines.map((l) => l[1]).join(' ')).join(' | '); pc.recap.close(); return { n, chose: /two dollars/i.test(all) }; });
  console.log('chapter 1 recap', JSON.stringify(ch)); if (ch.n < 6) errs.push('chapter recap has only ' + ch.n + ' shots'); if (!ch.chose) errs.push('the chapter recap did not bring back the hot dog choice');
  await a.waitForTimeout(700);
  // "Previously on": the tracked case last moved two days ago
  await a.evaluate(() => { const S = window.__pc.S; S.track = 'sockbandit'; S.qAt = { sockbandit: Date.now() - 2 * 86400e3 }; window.__pc.rcOffer(); });
  await a.waitForTimeout(800);
  if (!(await a.evaluate(() => !!document.querySelector('.rcChip')))) errs.push('no Previously on chip for a case left two days ago');
  console.log(errs.length ? errs : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
