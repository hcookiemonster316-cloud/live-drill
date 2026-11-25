// certifications from driving-course golds: earned when the last gold lands, and each changes play (quicker cruiser,
// a certified Code 3, night calls pay more, Air One sooner in pursuits); silver earns nothing
const { chromium } = require('playwright');
const base = { cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'night', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, cfg: { callCine: false, text: 'instant' } };
const G = (m) => ({ m, t: 20 });
(async () => { const b = await chromium.launch(); const errs = []; const out = {};
  for (const [k, drills] of [['gold', { brake: G(3), corner: G(3), skid: G(3), back: G(3), emerg: G(3), night: G(3), pursuit: G(3) }], ['silver', { brake: G(2), corner: G(3), skid: G(3), back: G(3), emerg: G(2), night: G(2), pursuit: G(2) }]]) {
    const a = await b.newPage({ viewport: { width: 420, height: 860 } }); a.on('pageerror', (e) => errs.push(k + ': ' + e.message));
    await a.goto('http://localhost:8765/academy/?mock&skiptitle'); await a.evaluate((s) => localStorage.setItem('patrolcity:v1', JSON.stringify(s)), { ...base, drills });
    await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.CERT, null, { timeout: 20000 });
    if (k === 'gold') await a.waitForFunction(() => Object.keys(window.__pc.S.certs || {}).length === 4, null, { timeout: 9000 }).catch(() => {}); else await a.waitForTimeout(5000);
    const r = await a.evaluate(() => { const pc = window.__pc; return { certs: Object.keys(pc.S.certs || {}).sort().join(','), drive: pc.gp('drive'), code3: !!pc.abil().code3, mult: +pc.callMult({ prio: 3, les: 99 }).toFixed(3), air: (pc.purDec().find((d) => /Air One is overhead/.test(d.text)) || {}).at }; });
    for (let i = 0; i < 12 && !(await a.evaluate(() => !!document.querySelector('.ctCard'))); i++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"], .tCard, .promo button, .rv button').forEach((x) => x.click()); const t = document.querySelector('.lkTabs [data-t=skills]'); if (t) t.click(); else { window.__pc.closeModal(); window.__pc.locker('skills'); } }); await a.waitForTimeout(400); }
    if (!(await a.evaluate(() => !!document.querySelector('.ctCard')))) errs.push(k + ': no certifications card');
    r.card = await a.evaluate(() => [...document.querySelectorAll('.ctRow')].map((x) => (x.classList.contains('on') ? '+' : '-') + x.innerText.replace(/\s+/g, ' ').slice(0, 140)));
    if (k === 'silver') await a.screenshot({ path: 'tcerts_card.png' });
    out[k] = r; console.log(k, JSON.stringify(r)); await a.close();
  }
  const g = out.gold, s = out.silver;
  if (g.certs !== 'evo,night,pursuit,vo') errs.push('golds did not certify: ' + g.certs); if (s.certs !== '') errs.push('silver certified: ' + s.certs);
  if (!(g.drive === s.drive + 10)) errs.push('Vehicle Operations did not make the cruiser quicker'); if (!g.code3 || s.code3) errs.push('certified Code 3 wrong');
  if (!(g.mult > s.mult * 1.1)) errs.push('night calls do not pay more'); if (!(g.air < s.air)) errs.push('Air One is not sooner');
  if (!g.card.every((x) => x[0] === '+') || !s.card.every((x) => x[0] === '-') || !/1 of 4|3 of 4/.test(s.card.join(' '))) errs.push('card wrong ' + JSON.stringify(s.card));
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
