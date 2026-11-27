// a career path for every unit: calls cleared in a unit climb its three rungs (a title, the unit's signature call
// from dispatch, the unit's own gear); each unit keeps its own ladder
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'k9', unitsV: 1, units: { patrol: 1, k9: 1 }, xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, ucalls: { k9: 4, patrol: 12 }, cfg: { callCine: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.CAR, null, { timeout: 20000 });
  const r = await a.evaluate(() => { const pc = window.__pc, C = pc.CAR, S = pc.S, out = {};
    out.t0 = C.title('k9'); out.sig0 = [...Array(200)].some(() => !!C.sigCall()); C.onCall(); out.t1 = C.title('k9'); out.rung1 = C.rung('k9');
    for (let i = 0; i < 10; i++) C.onCall(); out.t2 = C.title('k9'); let n = 0, ttl = ''; for (let i = 0; i < 400; i++) { const c = C.sigCall(); if (c) { n++; ttl = c[0]; } } out.sigShare = n / 400; out.sigTitle = ttl;
    const items0 = (S.items || {}).k9cap || 0; for (let i = 0; i < 15; i++) C.onCall(); out.t3 = C.title('k9'); out.gear = ((S.items || {}).k9cap || 0) - items0;
    out.patrol = C.rung('patrol'); out.calls = S.ucalls; return out; });
  console.log(JSON.stringify(r));
  if (r.t0 !== null || r.t1 !== 'K9 Handler' || r.t2 !== 'Senior Handler' || r.t3 !== 'K9 Trainer') errs.push('ladder titles wrong');
  if (r.sig0) errs.push('signature calls before rung 2'); if (!(r.sigShare > .1 && r.sigShare < .32) || !/bailed/.test(r.sigTitle)) errs.push('signature calls not about one in five: ' + r.sigShare);
  if (r.gear !== 1) errs.push('unit gear not issued'); if (r.patrol !== 1) errs.push('another unit\'s ladder changed');
  for (let i = 0; i < 12 && !(await a.evaluate(() => [...document.querySelectorAll('.ctCard small')].some((x) => /CAREER/.test(x.textContent)))); i++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"], .tCard, .promo button, .rv button').forEach((x) => x.click()); const t = document.querySelector('.lkTabs [data-t=skills]'); if (t) t.click(); else { window.__pc.closeModal(); window.__pc.locker('skills'); } }); await a.waitForTimeout(400); }
  const card = await a.evaluate(() => { const c = [...document.querySelectorAll('.ctCard')].find((x) => /CAREER/.test(x.innerText)); return c ? c.innerText.replace(/\s+/g, ' ') : ''; }); console.log('card', card.slice(0, 200));
  if (!/K9 CAREER/.test(card) || !/K9 Trainer/.test(card)) errs.push('no unit career card');
  await a.screenshot({ path: 'tcareer.png' });
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
