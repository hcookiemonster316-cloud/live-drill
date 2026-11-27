// side case scenes (cinema.js): meeting the person opens on a scene (the camera finds them, SIDE CASE and the case's
// name, their first line in a close-up) and the offer that follows doesn't repeat that line; closing the case plays
// the payoff (their closing line, SIDE CASE CLOSED, a stamp) before the case card. Both once per case.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle&cuts');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  for (let i = 0; i < 8; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|got it|close/i.test(x.innerText) && x.offsetParent && !x.closest('#dlg')); if (b) b.click(); document.querySelectorAll('.lorePop [data-a]:not([data-a="read"]), .rv').forEach((x) => x.click()); }); await a.waitForTimeout(250); }
  // a case in this district whose giver stands somewhere
  const q = await a.evaluate(() => { const pc = window.__pc, d = pc.W.did; const q = pc.SIDE.find((x) => x.d === d && pc.giverPos(x) && x.offer.some((ln) => ln[0] === x.giver)); if (!q) return null; window.__q = q; pc.offerSide(q); return { id: q.id, title: q.title, first: q.offer.find((ln) => ln[0] === q.giver)[1] }; });
  if (!q) { fail.push('no case with a giver here'); } else {
    await a.waitForSelector('.cn .cnCard.on', { timeout: 4000 }).catch(() => fail.push('no opening scene'));
    await a.waitForFunction((t) => (document.querySelector('.cnCard') || {}).innerText.indexOf(t) >= 0, q.title.slice(0, 14), { timeout: 6000 }).catch(() => fail.push('the card does not name the case'));
    await a.waitForSelector('.cnClose.on', { timeout: 6000 }).catch(() => fail.push('no close-up'));
    await a.waitForTimeout(1500); await a.screenshot({ path: 'w_side_open.png' });
    await a.waitForFunction(() => !document.querySelector('.cn') && !document.getElementById('dlg').hidden, null, { timeout: 12000 }).catch(() => fail.push('the offer never followed the scene'));
    const firstShown = await a.evaluate(() => (document.querySelector('#dlgP') || {}).innerText || '');
    if (firstShown && q.first.slice(0, 30) === firstShown.slice(0, 30)) fail.push('the offer repeated the line from the close-up');
    await a.evaluate(() => { const l = document.querySelector('#dlg [data-c="leave"]'); if (l) { l.click(); l.click(); } }); await a.waitForTimeout(600);
    // the payoff (once the offer has fully closed)
    await a.waitForFunction(() => document.getElementById('dlg').hidden && document.getElementById('modal').hidden && !window.__pc.CIN.on, null, { timeout: 6000 }).catch(() => {});
    await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d.hidden) { const l = d.querySelector('[data-c="leave"]'); if (l) { l.click(); l.click(); } } window.__pc.sideDone(window.__q); });
    for (let k = 0; k < 12 && !(await a.$('.cn')); k++) { await a.evaluate(() => document.querySelectorAll('.lorePop [data-a]:not([data-a="read"]), .rv').forEach((x) => x.click())); await a.waitForTimeout(500); } // a lore card holds the payoff until it's dismissed
    await a.waitForSelector('.cn .cnTitle.on', { timeout: 20000 }).catch(() => fail.push('no payoff scene'));
    await a.waitForSelector('.cnStamp.on', { timeout: 12000 }).catch(() => fail.push('no stamp')); await a.waitForTimeout(400); await a.screenshot({ path: 'w_side_close.png' });
    await a.waitForSelector('.chEnd', { timeout: 12000 }).catch(() => fail.push('the case card never followed'));
    const seen = await a.evaluate((id) => [window.__pc.S.cutSeen['so:' + id], window.__pc.S.cutSeen['sc:' + id]], q.id); if (!seen[0] || !seen[1]) fail.push('not remembered: ' + seen);
  }
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
