// each one a real person: the journal's Cast tab shows what the people at the center want, their flaw, their secret
// and their turning point as you earn them (the rest stays locked), and learning a secret brings a short notice
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 6000, calls: 90, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6, 1: 5, 2: 5, 3: 4, 4: 5 },
    flags: { paidDelgado: 1, lasWant: 1 }, npc: { delgado: 3 }, las: { seen: { coffee: 'lasAsk', photo: 'lasWant' }, letter: 'logged' }, pcase: { walsh: { rides: 6, stage: 3, out: 'talk', last: -1 }, park: { rides: 1, stage: 0, out: null, last: -1 } }, cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.S, null, { timeout: 20000 }); await a.waitForTimeout(1500);
  await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); pc.journalTab('cast'); }); await a.waitForSelector('.cbCard');
  const t = await a.evaluate(() => [...document.querySelectorAll('.cbCard')].map((c) => c.innerText.replace(/\s+/g, ' ')));
  const has = (re, what) => { if (!t.some((x) => re.test(x))) errs.push('missing: ' + what); };
  has(/Bernie Walsh.*2004.*Ibis.*He told your class/, 'Walsh secret and turning point'); has(/Victor Lassiter.*A car, a beat.*County Jail.*logged it/, 'Lassiter want and letter'); has(/Delgado.*framed the receipt/, 'Delgado secret from paying');
  has(/Theo Park.*To make sergeant.*Not yet/, 'Park partly known, rest locked'); has(/Rosa.*Not yet.*moved the camera/, 'Rosa: secret from the case, the rest locked');
  console.log('cards', t.length, '|', (t.find((x) => /Walsh/.test(x)) || '').slice(0, 160));
  await a.evaluate(() => document.querySelector('.cbCard').scrollIntoView()); await a.screenshot({ path: 'tcast.png' });
  // learning Park's secret: a notice (the first check after load only records what was already known)
  await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); pc.S.pcase.park.stage = 2; pc.S.pcase.park.rides = 4; });
  await a.waitForFunction(() => [...document.querySelectorAll('.toast, #toast, .tst')].some((x) => /Theo Park, secret/.test(x.innerText)) || /Theo Park, secret/.test(document.body.innerText), null, { timeout: 9000 }).catch(() => errs.push('no notice for a new secret'));
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
