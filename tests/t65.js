// co-op: unit-specific backup, partner request, ride-along, commendation, mutual aid card, PTT, spectate
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const errs = [];
  const boot = async (cs, unit) => { const a = await c.newPage(); a.on('pageerror', (e) => errs.push(cs + ': ' + e.message)); await a.goto('http://localhost:8765/academy/?mock&skiptitle');
    await a.evaluate(([cs, unit]) => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs, home: 0, unlocked: [0, 1], shift: 'day', unit, xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { autoQ: false, callCine: false } })), [cs, unit]);
    await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
    for (let i = 0; i < 5; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); const m = document.getElementById('modal'); if (!m.hidden) { const bb = [...m.querySelectorAll('button')].pop(); bb && bb.click(); } }); await a.waitForTimeout(500); }
    return a; };
  const A = await boot('1-Adam-12', 'patrol'); const B = await boot('2-Baker-14', 'patrol');
  const uidOf = (p) => p.evaluate(() => window.__pc.myUid);
  const ua = await uidOf(A), ub = await uidOf(B); console.log('uids', !!ua, !!ub, ua !== ub);
  // 1. unit-specific: A asks for a K9; B (patrol) should NOT get a card
  await A.bringToFront(); await A.evaluate(() => window.__pc.dispatchCall()); await A.waitForTimeout(400);
  await A.evaluate(() => document.getElementById('ccBk').click()); await A.waitForTimeout(300); console.log('picker:', await A.evaluate(() => (document.getElementById('wantCard') || {}).innerText.replace(/\n+/g, ' | ')));
  await A.evaluate(() => document.querySelector('#wantCard [data-w="k9"]').click()); await A.waitForTimeout(2500);
  await B.bringToFront(); await B.waitForTimeout(1500); console.log('B card for K9 request (should be hidden):', await B.evaluate(() => document.getElementById('bkCard').hidden));
  await A.bringToFront(); await A.evaluate(() => document.getElementById('ccBk').click()); await A.waitForTimeout(800);
  // 2. partner request B -> A
  await B.bringToFront(); await B.evaluate((u) => window.__pc.COOP.partnerAsk(u, '1-Adam-12', false), ua); await B.waitForTimeout(1200);
  await A.bringToFront(); await A.waitForTimeout(1800); console.log('A partner card:', await A.evaluate(() => { const e = document.getElementById('ptCard'); return e && !e.hidden ? e.innerText.replace(/\n+/g, ' | ') : 'none'; }));
  await A.screenshot({ path: 'co_pt.png' });
  await A.evaluate(() => { const y = document.getElementById('ptYes'); y && y.click(); }); await A.waitForTimeout(1500);
  await B.bringToFront(); await B.waitForTimeout(1800);
  console.log('partners:', await A.evaluate(() => JSON.stringify(window.__pc.S.partner && window.__pc.S.partner.c)), await B.evaluate(() => JSON.stringify(window.__pc.S.partner && window.__pc.S.partner.c)));
  // 3. commendation A -> B
  await A.bringToFront(); await A.evaluate((u) => { window.__pc.COOP.commendPrompt(u, '2-Baker-14', 'test'); }, ub); await A.waitForTimeout(400); await A.evaluate(() => document.querySelector('#cmCard [data-k="1"]').click()); await A.waitForTimeout(1500);
  await B.bringToFront(); await B.waitForTimeout(2000); console.log('B commends:', await B.evaluate(() => JSON.stringify(window.__pc.S.comms2)));
  // 4. ride-along: A invites B
  await A.bringToFront(); await A.evaluate((u) => window.__pc.COOP.partnerAsk(u, '2-Baker-14', true), ub); await A.waitForTimeout(1200);
  await B.bringToFront(); await B.waitForTimeout(2000); console.log('B ride card:', await B.evaluate(() => { const e = document.getElementById('ptCard'); return e && !e.hidden ? e.innerText.slice(0, 60).replace(/\n+/g, ' | ') : 'none'; }));
  await B.evaluate(() => { const y = document.getElementById('ptYes'); y && y.click(); }); await B.waitForTimeout(2500);
  console.log('B riding:', await B.evaluate(() => window.__pc.RIDING), 'chip:', await B.evaluate(() => { const e = document.getElementById('rideChip'); return e && !e.hidden ? e.innerText : 'none'; }));
  // host goes on a call -> rider gets a question
  await A.bringToFront(); await A.evaluate(() => { const pc = window.__pc; pc.dispatchCall(); document.getElementById('ccGo').click(); }); await A.waitForTimeout(2500);
  await B.bringToFront(); await B.waitForTimeout(2500); console.log('B ride question:', await B.evaluate(() => document.getElementById('dlg').hidden ? 'none' : document.getElementById('dlg').innerText.slice(0, 120).replace(/\n+/g, ' | ')));
  for (let i = 0; i < 12; i++) { await B.evaluate(() => { const q = document.querySelector('#dlg .dlgOpts [data-k]:not([disabled])'); if (q) q.click(); else { const d = document.getElementById('dlg'); if (!d.hidden) d.click(); } }); await B.waitForTimeout(400); }
  await A.bringToFront(); await A.waitForTimeout(2500); console.log('A trainer pts:', await A.evaluate(() => window.__pc.S.ftoPts || 0));
  await B.bringToFront(); await B.evaluate(() => document.getElementById('rideChip').click()); await B.waitForTimeout(500); console.log('B riding after end:', await B.evaluate(() => window.__pc.RIDING));
  // 5. mutual aid card in B (simulate a request from district 1)
  await B.evaluate(() => { const t = JSON.parse(localStorage.getItem('liveMockDB')); t.mmo.aid = { 0: { uFAKE: { x: 40, y: 40, c: '3-Charlie-7', f: 1, l: 'Disturbance at the marina', s: 'day', t: Date.now() } } }; localStorage.setItem('liveMockDB', JSON.stringify(t)); new BroadcastChannel('liveMock').postMessage(1); });
  await B.waitForTimeout(2500); console.log('B aid card:', await B.evaluate(() => { const e = document.getElementById('aidCard'); return e && !e.hidden ? e.innerText.replace(/\n+/g, ' | ').slice(0, 160) : 'none'; }));
  await B.screenshot({ path: 'co_aid.png' });
  // 6. PTT
  await B.evaluate(() => { document.getElementById('aidNo') && document.getElementById('aidNo').click(); document.getElementById('ptt').click(); }); await B.waitForTimeout(400); await B.screenshot({ path: 'co_ptt.png' });
  await B.evaluate(() => document.querySelector('#pttW [data-q="9"]').click()); await B.waitForTimeout(400); console.log('radio:', await B.evaluate(() => document.getElementById('radio').innerText.slice(-80)));
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
