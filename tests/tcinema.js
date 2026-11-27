// cutscenes (cinema.js, owner's call 2026-11-27): a call opens with an establishing shot (letterbox, the camera glides
// to the address, a location card types out) and closes with a resolution beat (a push in, how it ended as a caption,
// a stamp) before the debrief. Both are skippable, the second time a routine call skips them most of the time, and the
// setting turns them off.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle&cuts');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const clear = async () => { for (let i = 0; i < 8; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|just patrol|got it|close/i.test(x.innerText) && x.offsetParent && !x.closest('#dlg')); if (b) b.click(); document.querySelectorAll('.lorePop [data-a]:not([data-a="read"]), .rv').forEach((x) => x.click()); }); await a.waitForTimeout(250); } };
  await a.waitForTimeout(1500); await clear();
  // a routine scene call, opened fresh
  const title = await a.evaluate(() => { const pc = window.__pc; pc.VAR.sceneMini = () => null; pc.VAR.complication = () => []; pc.COND.tempt = () => []; let c = null; for (let k = 0; k < 40 && !c; k++) { pc.dispatchCall(); const x = pc.curCall; if (x && !x.ops && !x.deesc && !x.pursuit && x.les !== 0 && !pc.INV.fits(x)) c = x; else if (x) pc.dropCall(); } if (!c) return null; pc.dropCall(); c.pre = null; window.__c = c; pc.CIN.callArrive(c, () => pc.openCallScene(c)); /* the way the game opens a call when you arrive */ return c.title; });
  if (!title) { fail.push('no call'); } else {
    await a.waitForSelector('.cn.on', { timeout: 3000 }).catch(() => fail.push('no arrival shot'));
    await a.waitForFunction((t) => { const c = document.querySelector('.cnCard'); return c && c.innerText.indexOf(t) >= 0; }, title.slice(0, 16), { timeout: 15000 }).catch(() => {}); /* the title types out */ const card = await a.evaluate(() => { const c = document.querySelector('.cnCard'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
    await a.screenshot({ path: 'w_cine_arrive.png' }); console.log('arrival card:', card);
    if (card.indexOf(title.slice(0, 16)) < 0) fail.push('the card does not name the call: ' + card);
    await a.waitForFunction(() => !document.querySelector('.cn') && !document.getElementById('dlg').hidden, null, { timeout: 8000 }).catch(() => fail.push('the scene never followed the arrival shot'));
    // play the scene through
    for (let s = 0; s < 120; s++) { const st = await a.evaluate(() => { if (document.querySelector('.cn')) return 'cut'; const d = document.getElementById('dlg'); if (d.hidden) return 'gone'; const ch = d.querySelector('.dlgOpts:not(.q) [data-k]:not([disabled])'); if (ch) { ch.click(); return 'ch'; } const q = d.querySelector('.dlgOpts.q [data-k]:not([disabled])'); if (q) { const Q = window.__curQ; const k = Q ? (Array.isArray(Q.c) ? Q.c[0] : Q.c) : 0; (d.querySelector('.dlgOpts.q [data-k="' + k + '"]') || q).click(); const ok = document.getElementById('dlgOk'); if (ok) { ok.disabled = false; ok.click(); } return 'q'; } d.click(); return 'tap'; }); if (st === 'cut' || st === 'gone') break; await a.waitForTimeout(st === 'q' ? 900 : 200); }
    const res = await a.waitForSelector('.cn .cnCap.on', { timeout: 6000 }).then(() => 1).catch(() => 0);
    if (!res) fail.push('no resolution beat'); else { await a.waitForSelector('.cnStamp.on', { timeout: 8000 }).catch(() => fail.push('no stamp')); await a.waitForTimeout(500); await a.screenshot({ path: 'w_cine_resolve.png' }); console.log('resolution:', await a.evaluate(() => document.querySelector('.cnCap').innerText.slice(0, 80) + ' | ' + (document.querySelector('.cnStamp') || {}).textContent)); }
    await a.waitForFunction(() => !document.querySelector('.cn'), null, { timeout: 9000 }).catch(() => fail.push('the resolution beat never ended'));
  }
  // skip works, and Off turns them off
  await clear(); await a.evaluate(() => { const pc = window.__pc; if (!document.getElementById('modal').hidden) pc.closeModal(); /* the debrief */ pc.CIN.play([{ k: 'title', kicker: 'TEST', title: 'Skip me', d: 9 }], { mood: 'mystery', big: true }, (r) => { window.__played = r; }); });
  await a.waitForSelector('.cn.on'); await a.click('.cnSkip'); await a.waitForFunction(() => window.__played != null, null, { timeout: 3000 }).catch(() => fail.push('skip did not end the scene'));
  const off = await a.evaluate(() => new Promise((ok) => { window.__pc.S.cfg.cutscenes = 'off'; window.__pc.CIN.play([{ k: 'title', title: 'x', d: 1 }], { big: true }, (r) => ok(r)); }));
  if (off !== false) fail.push('Off still played a scene');
  await a.waitForTimeout(800); /* the skipped frame fades out */ if (await a.evaluate(() => !!document.querySelector('.cn'))) fail.push('a frame was left behind');
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
