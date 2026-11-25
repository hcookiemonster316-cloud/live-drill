// endings that pull you forward: the shift report ends on a real next-shift teaser (court due, someone asking for you,
// an officer who wants a word, the next step of your case), and the person asking really calls in next shift
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.HK, null, { timeout: 20000 }); await a.waitForTimeout(1500);
  // 1) a court date due next shift wins
  const court = await a.evaluate(() => { const pc = window.__pc, S = pc.S; S.court = S.court || { pend: [], hist: [] }; S.court.pend.push({ how: 'arrest', title: 'the Oak St arrest', where: 'Oak St', sh: 0, due: 0, miss: [] }); const h = pc.HK.pick(); S.court.pend = []; return h; });
  console.log('court', JSON.stringify(court)); if (!court || court.k !== 'court') errs.push('court teaser not chosen');
  // 2) someone new asking for you: shown on the report, and they call in next shift
  await a.evaluate(() => { Math.random0 = Math.random; Math.random = () => 0.1; const pc = window.__pc; pc.closeModal(); pc.endOfWatch(); Math.random = Math.random0; });
  await a.waitForSelector('#eNext'); const card = await a.evaluate(() => (document.querySelector('.nxCard') || {}).innerText || ''); console.log('card', card.replace(/\s+/g, ' '));
  await a.screenshot({ path: 'thooks.png' });
  if (!/NEXT SHIFT/.test(card) || !/asking about you/.test(card)) errs.push('report has no "someone asking" teaser');
  const name = card.replace(/\s+/g, ' ').replace(/^NEXT SHIFT\s*\S*\s*/, '').split(' has been')[0].trim();
  await a.evaluate(() => document.getElementById('eNext').click()); await a.waitForSelector('.otPick'); await a.evaluate(() => { const ps = document.querySelectorAll('.otPick'); ps[ps.length - 1].click(); });
  for (let i = 0; i < 20 && await a.evaluate(() => !document.getElementById('dlg').hidden); i++) { await a.evaluate(() => document.getElementById('dlg').click()); await a.waitForTimeout(400); }
  await a.waitForFunction((n) => (window.__pc.S.rlog || []).some((r) => r[3].indexOf(n) >= 0 && /asking for you/.test(r[3])), name, { timeout: 12000 }).catch(() => errs.push('"' + name + '" never called in'));
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
