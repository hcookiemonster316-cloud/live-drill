// investigation (investigate.js, owner's call 2026-11-27): a burglary call is worked, not just answered. Separate the
// witnesses and ask open questions, knock on doors (four of six), scrub the camera to the time window and clip the
// suspect, then send a BOLO. A BOLO built from the clip finds them; the address remembers it; the debrief scores it.
// A second run sends a thin BOLO: the case goes cold, and someone you left a card with calls your work cell later.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => { localStorage.clear(); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', unitsV: 1, units: { patrol: 1 }, xp: 900, sound: false, seenIntro: 1, seenCine: 1, ch: 'ch5', tutDone: 1, story: { 0: 99 } })); });
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const clear = async () => { for (let i = 0; i < 6; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|just patrol|got it|close/i.test(x.innerText) && x.offsetParent && !x.closest('#dlg') && !x.closest('#modal .ivBody')); if (b) b.click(); document.querySelectorAll('.rv').forEach((x) => { x.click(); const k = x.querySelector('[data-a="keep"]'); if (k) k.click(); }); document.querySelectorAll('.lorePop [data-a]:not([data-a="read"])').forEach((x) => x.click()); }); await a.waitForTimeout(200); } };
  await a.waitForTimeout(1500); await clear();
  const open = async (title) => { await a.evaluate((title) => { const pc = window.__pc; /* the call's other random extras (complications, mini-games, temptations, cameos) have their own tests */ pc.VAR.sceneMini = () => null; pc.VAR.complication = () => []; pc.COND.tempt = () => []; pc.EP.rivalCameo = () => null; const c = { title, les: 4, prio: 2, where: 'Bayfront Mall', text: 'Store owner says someone just ran from a smashed back door.', x: pc.P.x + 2, y: pc.P.y, t0: pc.clock, accepted: true }; pc.openCallScene(c); window.__ic = c; }, title); };
  // walk the dialogue until the investigation opens (or the scene ends)
  const toInv = async () => { for (let s = 0; s < 60; s++) { if (await a.$('#ivTabs')) return true; const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return 'gone'; const ch = d.querySelector('.dlgOpts:not(.q) [data-k]:not([disabled])'); if (ch) { ch.click(); return 'ch'; } d.click(); return 'tap'; }); if (st === 'gone') { console.log('GONE at', await a.evaluate(() => JSON.stringify({ modal: !document.getElementById('modal').hidden && document.getElementById('modal').innerText.slice(0, 160), dbg: window.__pc.dbg() }))); return false; } await a.waitForTimeout(250); } console.log('TIMEOUT', await a.evaluate(() => JSON.stringify({ body: document.body.className, panel: (document.querySelector('#dlg .dlgPanel') || {}).className, html: document.getElementById('dlg').innerHTML.replace(/<svg[^]*?<\/svg>/g, '').slice(0, 900), modal: !document.getElementById('modal').hidden }))); return false; };
  const finishScene = async () => { for (let s = 0; s < 80; s++) { const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return 'gone'; const ch = d.querySelector('.dlgOpts:not(.q) [data-k]:not([disabled])'); if (ch) { ch.click(); return 'ch'; } d.click(); return 'tap'; }); if (st === 'gone') break; await a.waitForTimeout(220); } };
  // 1) by the book: separate, open questions, canvass until the camera, clip inside the window, BOLO from the clip
  await open('Burglary just occurred');
  if (!(await toInv())) fail.push('the burglary call never opened an investigation');
  else {
    await a.evaluate(() => [...document.querySelectorAll('#ivBody .woOpt')].find((b) => /Separate them/.test(b.innerText)).click()); await a.waitForTimeout(200);
    for (let w = 0; w < 2; w++) { await a.evaluate(() => [...document.querySelectorAll('#ivBody .woOpt')].find((b) => /start to finish/.test(b.innerText)).click()); await a.waitForTimeout(200); if (w === 0) await a.evaluate(() => document.getElementById('ivCard').click()); await a.evaluate(() => document.getElementById('woNext').click()); await a.waitForTimeout(200); }
    await a.evaluate(() => document.querySelector('#ivTabs [data-t="door"]').click());
    // knock on the camera door (a test peeks at which one it is; a player has to guess)
    const ci = await a.evaluate(() => window.__ic.inv.doors.findIndex((d) => d.r === 'cam')); await a.evaluate((ci) => document.querySelector('.ivDoor[data-i="' + ci + '"]').click(), ci); await a.waitForTimeout(250);
    await a.evaluate(() => document.querySelector('#ivTabs [data-t="cam"]').click()); await a.waitForTimeout(200);
    const m = await a.evaluate(() => { const pc = window.__pc, sp = window.__ic.inv; for (let m = sp.win[0]; m <= sp.win[1] + 8; m++) if (pc.INV.inFrame(sp, m).some((x) => x[0] === sp.cul)) return m; return -1; });
    if (m < 0) fail.push('the suspect never crosses the camera');
    await a.evaluate((m) => { const s = document.getElementById('ivScrub'); s.value = m; s.dispatchEvent(new Event('input')); }, m); await a.waitForTimeout(300);
    await a.screenshot({ path: 'w_invest_cam.png' });
    await a.evaluate(() => document.getElementById('ivClip').click()); await a.waitForTimeout(200);
    await a.evaluate(() => document.getElementById('ivBolo').click()); await a.waitForTimeout(200);
    await a.evaluate(() => document.querySelectorAll('#ivBody select').forEach((s) => { const o = [...s.options].find((x) => /camera/.test(x.textContent)); if (o) { s.value = o.value; s.dispatchEvent(new Event('change')); } }));
    await a.screenshot({ path: 'w_invest_bolo.png' });
    await a.evaluate(() => document.getElementById('ivSend').click()); await a.waitForTimeout(300);
    const r1 = await a.evaluate(() => ({ out: window.__ic.inv.out, ended: window.__ic.ended && window.__ic.ended.line, row: window.__ic.invRow }));
    console.log('by the book:', JSON.stringify(r1));
    if (r1.out !== 'solved') fail.push('a BOLO from the clip did not solve it: ' + JSON.stringify(r1));
    await finishScene(); await clear();
    const ended = await a.evaluate(() => /BOLO/.test((window.__ic.ended || {}).line || ''));
    if (!ended) fail.push('the call did not end the investigation way');
  }
  // 2) a thin BOLO: wrap up early with a card left at a dark house; the case goes cold and a call comes later
  await a.waitForTimeout(500); await clear();
  await open('Shed broken into overnight');
  if (!(await toInv())) fail.push('the shed call never opened an investigation');
  else {
    await a.evaluate(() => document.querySelector('#ivTabs [data-t="door"]').click());
    const ni = await a.evaluate(() => window.__ic.inv.doors.findIndex((d) => d.r === 'none')); await a.evaluate((ni) => document.querySelector('.ivDoor[data-i="' + ni + '"]').click(), ni); await a.waitForTimeout(200);
    await a.evaluate(() => document.getElementById('ivLeave').click());
    await a.evaluate(() => document.getElementById('ivLater').click()); await a.waitForTimeout(300);
    await finishScene(); await clear();
    const cold = await a.evaluate(() => (window.__pc.S.cold || []).map((x) => ({ t: x.t, cards: x.cards.length, myst: !!x.myst })));
    console.log('cold cases', JSON.stringify(cold));
    if (!cold.some((x) => /Shed/.test(x.t) && x.cards)) fail.push('the open case did not go cold with your card: ' + JSON.stringify(cold));
    // the call back: make it due now
    await a.evaluate(() => { const S = window.__pc.S; S.cold.forEach((x) => { x.at = 0; x.myst = null; }); });
    await a.waitForFunction(() => { const pc = window.__pc; if (!document.getElementById('modal').hidden && !document.getElementById('ivTabs')) pc.closeModal(); /* a report or another scene in the way */ pc.COLD.tick(9999); return !document.getElementById('dlg').hidden && /work cell/i.test(document.getElementById('dlg').innerText); }, null, { timeout: 15000, polling: 500 }).catch(() => fail.push('no call back from the card you left'));
  }
  const cf = await a.evaluate(() => (window.__pc.S.olog || []).map((x) => x[2]).filter((t) => /BOLO|Open case/.test(t)).length);
  if (cf < 2) fail.push('the case file did not keep the investigations: ' + cf);
  if (fail.length < 1) console.log('case file entries', cf);
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
