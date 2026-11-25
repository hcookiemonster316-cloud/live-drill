// promotions you can watch: a rank-up is pinned at the start of the next shift with your people there (a partner who
// trusts you, regulars who count you as a friend, the classmates), then dispatch says it on the air
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  const npc = await a.evaluate(async () => (await import('/academy/data.js')).NPCS[0]);
  await a.evaluate((id) => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 590, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, npc: { [id]: 4 }, pmem: { walsh: { t: 80, log: [] } }, cfg: { callCine: false, text: 'instant' } })), npc.id);
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.OT, null, { timeout: 20000 }); await a.waitForTimeout(1500);
  // anything the boot itself awarded is settled first, then exactly enough RP for the next rank
  for (let i = 0; i < 6; i++) { await a.evaluate(() => { document.querySelectorAll('.promo button, .rv button, .tCard').forEach((x) => x.click()); window.__pc.closeModal(); }); await a.waitForTimeout(500); }
  await a.evaluate(() => { const pc = window.__pc; pc.S.promoted = null; const next = [200, 600, 1200, 2000, 3000, 4200, 5600, 7200, 9000].find((t) => t > pc.S.xp); pc.award(next - pc.S.xp + 1, 'test'); });
  await a.waitForSelector('.promo button', { timeout: 8000 }).catch(() => errs.push('no promotion')); for (let i = 0; i < 6 && await a.evaluate(() => !!document.querySelector('.promo')); i++) { await a.waitForTimeout(500); await a.evaluate(() => document.querySelectorAll('.promo button').forEach((x) => x.click())); } await a.waitForTimeout(700);
  const mid = await a.evaluate(() => ({ pend: window.__pc.S.promoted, dlg: !document.getElementById('dlg').hidden })); console.log('after promotion', JSON.stringify(mid));
  if (!mid.pend || mid.dlg) errs.push('the pinning should wait for the next shift, not interrupt this one');
  await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); pc.endOfWatch(); }); await a.waitForSelector('#eNext'); await a.evaluate(() => document.getElementById('eNext').click()); await a.waitForSelector('.otPick'); await a.evaluate(() => { const ps = document.querySelectorAll('.otPick'); ps[ps.length - 1].click(); });
  const said = []; for (let i = 0, idle = 0; i < 60 && idle < 8; i++) { await a.waitForTimeout(380); const t = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; const s = d.innerText.replace(/\s+/g, ' '); d.click(); return s; }); if (t == null) idle++; else { idle = 0; if (!said.includes(t)) said.push(t); } }
  const all = said.join(' || '); console.log(said.slice(0, 14).map((x) => x.slice(0, 110)).join('\n'));
  if (!/pins it to your collar/.test(all)) errs.push('no pinning'); if (!/Walsh/.test(all)) errs.push('the partner who trusts you did not come'); if (all.indexOf(npc.name) < 0) errs.push('the regular who counts you a friend did not come'); if (!/Pike owes me/.test(all)) errs.push('classmates missing');
  await a.waitForTimeout(3200); const rad = await a.evaluate(() => (window.__pc.S.rlog || []).map((r) => r[3]).join(' | ')); if (!/help me congratulate/.test(rad)) errs.push('dispatch did not say it on the air');
  if (await a.evaluate(() => !!window.__pc.S.promoted)) errs.push('pinning played but stayed pending');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
