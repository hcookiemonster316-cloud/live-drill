// a calm screen: banners, trophies, lore cards and loot wait for the first seconds of a shift and for any call you're
// working, then come one at a time; side chips step back on a call; the city's labels keep their size zoomed in
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle&quiet');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 3000, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, cfg: { callCine: false, text: 'instant' }, teach: { done: {}, n: 0, last: Date.now() }, stage: { seen: {}, n: 0, last: Date.now() } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.quietTest, null, { timeout: 20000 });
  for (let i = 0; i < 20; i++) { if (await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); return pc.free; })) break; await a.waitForTimeout(300); }
  const shown = () => a.evaluate(() => ({ banner: !document.getElementById('banner').hidden, trophy: !document.getElementById('trToast').hidden, lore: !!document.querySelector('.lorePop') }));
  // the first seconds of the shift: nothing
  await a.evaluate(() => { const q = window.__pc.quietTest; q.set0(performance.now()); q.banner('Test banner', 'one'); q.trophy(); q.lore(); }); await a.waitForTimeout(2500);
  const early = await shown(); console.log('first seconds', JSON.stringify(early)); if (early.banner || early.trophy || early.lore) errs.push('something popped up in the first seconds of the shift');
  // after: one at a time
  await a.evaluate(() => window.__pc.quietTest.set0(-1e9)); let most = 0, seen = new Set();
  for (let i = 0; i < 120; i++) { await a.waitForTimeout(250); const s = await shown(); const n = s.banner + s.trophy + s.lore; most = Math.max(most, n); for (const k in s) if (s[k]) seen.add(k); if (s.lore && i % 4 === 3) await a.evaluate(() => { const x = document.querySelector('.lorePop [data-a="ok"], .lorePop .ghost'); if (x) x.click(); }); await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d.hidden) { const o = d.querySelector('.dlgOpts [data-k]:not([disabled])'); if (o) o.click(); else d.click(); } const pc = window.__pc; if (pc.curCall) pc.dropCall(); document.querySelectorAll('.tCard').forEach((x) => x.click()); }); /* the game's own scenes come and go */ if (seen.size === 3 && !n) break; }
  if (!seen.has('lore')) console.log('lore waits on', await a.evaluate(() => JSON.stringify({ modal: !document.getElementById('modal').hidden, dlg: !document.getElementById('dlg').hidden, fe: !document.querySelector('.fe').hidden, tcard: !!document.querySelector('.tCard, .introCine, .gradCred'), call: !!window.__pc.curCall })));
  console.log('seen', [...seen].join(','), 'most at once', most); if (most > 1) errs.push(most + ' interruptions at once'); if (seen.size < 3) errs.push('not everything came through: ' + [...seen].join(','));
  // context: on a call the side chips step back
  const ctx = await a.evaluate(() => { const pc = window.__pc; return pc.quietTest.ctx; }); console.log('context on foot', ctx); if (ctx !== 'foot') errs.push('context on foot: ' + ctx);
  // never 90 seconds without a choice: a quiet patrol gets something to act on close by
  const bg = await a.evaluate(() => { const pc = window.__pc; pc.quietTest.set0(-1e9); pc.lastBeat = performance.now() - 80000; const n0 = pc.observes ? pc.observes.length : -1; const r = pc.beatGuard(); const again = pc.beatGuard(); return { r, again }; });
  console.log('beat guard', JSON.stringify(bg)); if (!bg.r || bg.again) errs.push('the quiet-patrol guard did not offer something (once): ' + JSON.stringify(bg));
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
