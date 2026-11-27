// a daily drill: the course menu leads with today's drill and its twist (the same for everyone today); running it
// applies the twist, and a normal run of the same drill doesn't
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 640 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, cfg: { text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const td = await a.evaluate(async () => { const D = await window.__pc.drillsLoad(); window.__D = D; const t = D.today(); const host = document.createElement('div'); host.id = 'ddHost'; host.innerHTML = D.menuHtml(); document.body.appendChild(host); D.bindMenu(host); return { t, card: host.querySelector('.ddCard').innerText.replace(/\s+/g, ' '), again: JSON.stringify(D.today()) === JSON.stringify(t) }; });
  console.log(JSON.stringify(td)); if (!/TODAY'S DRILL/.test(td.card) || td.card.indexOf(td.t.name) < 0) errs.push('no daily card'); if (!td.again) errs.push('today\'s drill is not stable');
  await a.evaluate(() => document.getElementById('ddGo').click()); await a.waitForSelector('#drill #drGo');
  const r1 = await a.evaluate(() => { const R = window.__D.state; return { id: R.dr.id, daily: !!R.daily, twist: R.daily && R.daily.twist, kind: R.car.kind, spec: R.spec && R.spec.kind }; });
  await a.evaluate(() => { window.__D.close(true); document.getElementById('ddHost').remove(); }); await a.waitForTimeout(300);
  await a.evaluate((id) => window.__D.open(id), r1.id); await a.waitForSelector('#drill #drGo'); const r2 = await a.evaluate(() => { const R = window.__D.state; return { daily: !!R.daily, kind: R.car.kind }; });
  console.log('daily run', JSON.stringify(r1), 'normal run', JSON.stringify(r2));
  if (r1.id !== td.t.id || !r1.daily) errs.push('the daily run is not today\'s drill'); if (r1.twist === 'van' && (r1.kind !== 'van' || r1.spec !== 'van')) errs.push('van twist not applied');
  if (r2.daily || (r1.twist === 'van' && r2.kind === 'van')) errs.push('the twist leaked into a normal run');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
