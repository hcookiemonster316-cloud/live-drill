// trust you can see (owner's call, 2026-11-27): in a conversation, a regular's trust shows as six pips by their name;
// when it rises the new pip pops and the strip says so; out on the street a heart rises from them instead.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(1500);
  const clear = () => a.evaluate(() => { document.querySelectorAll('.lorePop [data-a]:not([data-a="read"]), .promo button, .rv [data-a="keep"]').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mDone, #mClose'); if (bt) bt.click(); } });
  for (let i = 0; i < 6; i++) { await clear(); await a.waitForTimeout(300); }
  const id = await a.evaluate(() => { const pc = window.__pc, r = pc.regs.find((x) => x.n && !x.n.cat && !/^g:/.test(x.n.id)); const n = r.n; pc.S.npc[n.id] = 2; window.__tid = n.id; pc.dialogue([[n.id, 'Morning, officer. Same as always?'], [n.id, 'You take care out there.']], () => {}); return n.id; });
  await a.waitForSelector('#dlg:not([hidden]) .dlgTrust:not([hidden])', { timeout: 5000 }).catch(() => fail.push('no trust pips by a regular\'s name'));
  const before = await a.evaluate(() => document.querySelectorAll('.dlgTrust i.on').length);
  await a.evaluate((id) => window.__pc.trustSet(id, 3), id); await a.waitForTimeout(250);
  const after = await a.evaluate(() => ({ on: document.querySelectorAll('.dlgTrust i.on').length, gain: !!document.querySelector('.dlgTrust i.gain'), mem: (document.querySelector('.dlgMem:not([hidden])') || {}).textContent || '' }));
  await a.screenshot({ path: 'w_trust_talk.png', clip: { x: 300, y: 430, width: 700, height: 290 } });
  console.log('pips', before, '->', after.on, after.gain ? 'popped' : '', '|', after.mem);
  if (before !== 2 || after.on !== 3 || !after.gain) fail.push('pips did not fill with a pop: ' + before + ' -> ' + JSON.stringify(after));
  if (!/trusts you/i.test(after.mem)) fail.push('no strip saying they trust you more');
  for (let i = 0; i < 20; i++) { const d = await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d.hidden) d.click(); return d.hidden; }); if (d) break; await a.waitForTimeout(250); }
  // on the street: a heart rises from them
  for (let i = 0; i < 8; i++) { await clear(); await a.waitForTimeout(300); }
  const h = await a.evaluate((id) => { const pc = window.__pc; const r = pc.regs && pc.regs.find((x) => x.n.id === id); if (!r) return 'none'; pc.P.x = r.x + 4; pc.P.y = r.y + 3; pc.P.path = []; pc.trustSet(id, 4); return pc.HEARTS.length; }, id);
  console.log('hearts', h); if (h !== 'none' && !(h > 0)) fail.push('no heart on the street');
  if (h !== 'none') { await a.waitForTimeout(350); await a.screenshot({ path: 'w_trust_street.png' }); }
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
