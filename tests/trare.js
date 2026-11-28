// rare finds (rarefinds.js): near the right place at the right hour, a rare moment opens on a scene (RARE FIND, its
// title), asks one decision, records the find, unlocks its Field Journal entry and counts toward the secret trophies.
// Here each one in the current district is set off by hand (no waiting for 3 a.m.) and answered.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle&cuts');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(1500);
  const clear = () => a.evaluate(() => { document.querySelectorAll('.lorePop [data-a]:not([data-a="read"]), .promo button').forEach((x) => x.click()); document.querySelectorAll('.rv [data-a="keep"]').forEach((x) => x.click()); [...document.querySelectorAll('button')].filter((x) => /save for later/i.test(x.innerText) && x.offsetParent).forEach((x) => x.click()); /* promotion and gear cards pause the game until they're dismissed */ const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mDone, #mClose'); if (bt) bt.click(); } });
  for (let i = 0; i < 6; i++) { await clear(); await a.waitForTimeout(300); }
  const ids = await a.evaluate(() => { const pc = window.__pc; return pc.W.lots.map((l) => l.kind); });
  const RARE = await a.evaluate(async () => (await import('./rarefinds.js')).RARE.map((r) => ({ id: r.id, kinds: r.kinds, right: r.opts.find((o) => o[1])[0] })));
  let played = 0;
  for (const r of RARE) {
    const lot = await a.evaluate((kinds) => { const pc = window.__pc, l = pc.W.lots.find((x) => kinds.indexOf(x.kind) >= 0 && x.door); if (!l) return null; pc.P.x = l.door[0] + .5; pc.P.y = l.door[1] + 1.5; pc.P.path = []; return l.kind; }, r.kinds);
    if (!lot) { console.log(r.id, 'no', r.kinds.join('/'), 'here'); continue; }
    await a.waitForTimeout(600); for (let i = 0; i < 4; i++) { await clear(); await a.waitForTimeout(200); }
    const ok = await a.evaluate((id) => window.__pc.RF.test(id), r.id); if (!ok) { fail.push(r.id + ': did not start near a ' + lot); continue; }
    if (r.id === 'organ') { for (let i = 0; i < 40 && !(await a.$('.cn .cnCard.on')); i++) { await a.evaluate(() => document.querySelectorAll('.lorePop [data-a]:not([data-a="read"])').forEach((x) => x.click())); await a.waitForTimeout(300); } /* a lore card holds the scene until it's dismissed */ if (!(await a.$('.cn .cnCard.on'))) fail.push('organ: no RARE FIND scene'); await a.waitForTimeout(1600); await a.screenshot({ path: 'w_rare_scene.png' }); const card = await a.evaluate(() => (document.querySelector('.cnCard') || {}).innerText || ''); if (!/RARE FIND/i.test(card)) fail.push('scene card reads ' + card); }
    // through the conversation to the choice, then the right call
    let chose = false; for (let i = 0; i < 60 && !chose; i++) { await a.waitForTimeout(250); chose = await a.evaluate((right) => { document.querySelectorAll('.lorePop [data-a]:not([data-a="read"])').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (d.hidden) return false; const bs = [...d.querySelectorAll('.dlgOpts button:not([disabled])')]; const b = bs.find((x) => x.innerText.indexOf(right.slice(0, 30)) >= 0); if (b) { b.click(); return true; } d.click(); return false; }, r.right); }
    if (!chose) { fail.push(r.id + ': never reached the decision'); continue; }
    if (r.id === 'organ') { await a.waitForTimeout(500); await a.screenshot({ path: 'w_rare_talk.png' }); }
    for (let i = 0; i < 100; i++) { await a.waitForTimeout(250); const done = await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d.hidden) d.click(); return d.hidden; }); if (done) break; }
    for (let i = 0; i < 60 && !(await a.evaluate((id) => !!window.__pc.S.lore['rare_' + id], r.id)); i++) { await clear(); await a.waitForTimeout(300); } /* the journal entry lands on the next lore check */
    const st = await a.evaluate((id) => ({ rare: !!(window.__pc.S.rare || {})[id], lore: !!window.__pc.S.lore['rare_' + id], busy: window.__pc.RF.busy }), r.id);
    if (!st.rare) fail.push(r.id + ': not recorded'); if (!st.lore) fail.push(r.id + ': no journal entry'); if (st.busy) fail.push(r.id + ': stayed busy');
    played++; console.log(r.id, 'near', lot, JSON.stringify(st));
  }
  if (played < 2) fail.push('only ' + played + ' finds could be tried here');
  const s = await a.evaluate(() => ({ n: window.__pc.RF.found(), rec: (window.__pc.S.stats || {}).rare })); console.log('found', JSON.stringify(s));
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
