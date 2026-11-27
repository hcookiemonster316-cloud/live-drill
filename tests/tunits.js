// specialty units are earned (units.js): old saves go back to Patrol, the career board shows each unit's bar, a
// lead's quests open once they notice you, the tryout (three questions and one call) accepts you, an exceptional
// record skips the tryout ("you're being moved"), and you can switch freely between earned units.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1280, height: 800 } }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => { localStorage.clear(); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2], shift: 'day', unit: 'swat', xp: 700, calls: 22, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99, 2: 99 }, stat: { helped: 16, shifts: 3 }, trust: { 1: 62 }, ways: { observe: 4 } })); });
  await a.reload(); await a.waitForSelector('#start:not([hidden])');
  const fail = [];
  const startTxt = await a.evaluate(() => document.querySelector('#start').innerText);
  if (/Pick your specialty unit/i.test(startTxt)) fail.push('start screen still offers a unit pick');
  await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const clear = async () => { for (let i = 0; i < 8; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|just patrol|got it|close/i.test(x.innerText) && x.offsetParent && !x.closest('#dlg')); if (b) b.click(); }); await a.waitForTimeout(250); } };
  await a.waitForTimeout(2500); await clear();
  const play = async (pick) => { for (let s = 0; s < 80; s++) { const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; return { tx: (d.querySelector('#dlgP') || {}).innerText || '', ch: [...d.querySelectorAll('.dlgOpts:not(.q) [data-k]:not([disabled])')].map((x) => x.innerText.replace(/\s+/g, ' ')), q: d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])').length }; });
      if (!st) return; if (/Pins it on your sleeve/i.test(st.tx) && !global.__shot) { global.__shot = 1; await a.waitForTimeout(900); await a.screenshot({ path: 'w_units_patch.png' }); }
      if (/Pins it on your sleeve|first one through a door|Thursday, eight|Bosco already/i.test(st.tx)) global.__cer = 1;
      if (st.ch.length) { const i = Math.max(0, st.ch.findIndex((t) => pick.test(t))); await a.evaluate((i) => document.querySelectorAll('#dlg .dlgOpts:not(.q) [data-k]:not([disabled])')[i].click(), i); await a.waitForTimeout(350); continue; }
      if (st.q) { await a.evaluate(() => { const q = window.__curQ; const b = document.querySelector('#dlg .dlgOpts.q [data-k="' + (Array.isArray(q.c) ? q.c[0] : q.c) + '"]'); b.click(); const ok = document.getElementById('dlgOk'); if (ok) { ok.disabled = false; ok.click(); } }); await a.waitForTimeout(1100); continue; }
      await a.evaluate(() => document.getElementById('dlg').click()); await a.waitForTimeout(160); } };
  const s0 = await a.evaluate(() => ({ unit: window.__pc.S.unit, hoi: window.__pc.UNITX.stage('hoi'), swat: window.__pc.UNITX.stage('swat') }));
  console.log('start', JSON.stringify(s0));
  if (s0.unit !== 'patrol') fail.push('old save kept its unit: ' + s0.unit);
  if (s0.hoi !== 'noticed') fail.push('Homeless Initiative should have noticed you: ' + s0.hoi);
  if (s0.swat !== 'locked') fail.push('SWAT should be locked: ' + s0.swat);
  const qOpen = await a.evaluate(() => { const q = window.__pc.SIDE.find((x) => x.id === 'unit_hoi1'); return q && q.need(window.__pc.S); });
  if (!qOpen) fail.push('the lead\'s first quest did not open');
  // the career board
  await a.evaluate(() => window.__pc.careerBoard()); await a.waitForTimeout(600); await a.screenshot({ path: 'w_units_board.png' });
  const cards = await a.evaluate(() => [...document.querySelectorAll('.uCard')].map((x) => x.dataset.u + ':' + x.dataset.st).join(' '));
  console.log('board', cards); if (cards.split(' ').length !== 9) fail.push('board shows ' + cards);
  await a.evaluate(() => document.getElementById('uNo').click()); await a.waitForTimeout(300);
  // both quests done: the tryout, from the board
  await a.evaluate(() => { const pc = window.__pc; pc.S.side.unit_hoi1 = 2; pc.S.side.unit_hoi2 = 2; });
  const st2 = await a.evaluate(() => window.__pc.UNITX.stage('hoi')); if (st2 !== 'tryout') fail.push('after both quests: ' + st2);
  await a.evaluate(() => window.__pc.careerBoard()); await a.waitForTimeout(400);
  await a.evaluate(() => document.querySelector('.uCard[data-u="hoi"]').click()); await a.waitForTimeout(800);
  await play(/shelter safe/i); await a.waitForTimeout(600);
  await a.waitForFunction(() => !!document.getElementById('uNow'), null, { timeout: 8000 }).catch(() => {});
  const acc = await a.evaluate(() => !!document.getElementById('uNow')); if (!acc) fail.push('tryout passed but no acceptance'); if (!global.__cer) fail.push('no patch ceremony at roll call');
  if (acc) { await a.evaluate(() => document.getElementById('uNow').click()); await a.waitForTimeout(2500); }
  const s1 = await a.evaluate(() => ({ unit: window.__pc.S.unit, units: Object.keys(window.__pc.S.units).sort().join() }));
  console.log('after tryout', JSON.stringify(s1)); if (s1.unit !== 'hoi' || s1.units !== 'hoi,patrol') fail.push('after tryout: ' + JSON.stringify(s1));
  // exceptional: you're moved without a tryout
  await clear();
  await a.evaluate(() => { const S = window.__pc.S; S.cond.standing = 95; S.flags = S.flags || {}; S.flags.u_k91 = 1; S.flags.u_k92 = 1; S.ways.observe = 20; S.calls = 40; S.xp = 1300; S.side.unit_k91 = 2; S.side.unit_k92 = 2; window.__pc.UNITX.questDone(window.__pc.SIDE.find((x) => x.id === 'unit_k92')); });
  await a.waitForFunction(() => !document.getElementById('dlg').hidden && /moved|Tryouts are for/.test(document.getElementById('dlg').innerText + (window.__pc.S.units.k9 ? 'moved' : '')), null, { timeout: 12000 }).catch(() => {}); await play(/./);
  await a.waitForFunction(() => /Transfer/i.test((document.querySelector('.chKick') || {}).innerText || ''), null, { timeout: 8000 }).catch(() => {});
  const s2 = await a.evaluate(() => ({ k9: window.__pc.UNITX.has('k9'), modal: (document.querySelector('.chKick') || {}).innerText || '' }));
  console.log('transfer', JSON.stringify(s2)); if (!s2.k9 || !/Transfer/i.test(s2.modal)) fail.push('exceptional transfer: ' + JSON.stringify(s2));
  if (errs.length) fail.push(...errs.slice(0, 4));
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
