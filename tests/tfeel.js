// rewards that travel (feel.js, owner's call 2026-11-27: gameplay is extremely satisfying): earned RP bursts into gold
// motes that fly into the RP counter; the counter waits for the first one to land, then counts up; the rank bar under
// it fills toward the next rank; the district mastery ring animates. A right answer stamps a check and rings; a wrong
// one shakes. Reduced motion skips all of it and the numbers still update.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle&cuts');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  await a.waitForTimeout(1500);
  const before = await a.evaluate(() => ({ t: document.getElementById('hRank').textContent, bar: document.getElementById('hRkBar') && document.getElementById('hRkBar').firstChild.style.transform }));
  if (!before.bar) fail.push('no rank bar under the rank');
  await a.evaluate(() => window.__pc.award(150, 'call cleared'));
  await a.waitForTimeout(150);
  const mid = await a.evaluate(() => ({ motes: document.querySelectorAll('.mote').length, t: document.getElementById('hRank').textContent }));
  if (mid.motes < 3) fail.push('no motes in flight: ' + mid.motes);
  if (mid.t !== before.t) fail.push('the counter moved before the RP landed');
  await a.waitForFunction(() => !document.querySelector('.mote'), null, { timeout: 4000 }).catch(() => fail.push('motes never landed'));
  await a.waitForTimeout(1300);
  const after = await a.evaluate(() => ({ t: document.getElementById('hRank').textContent, bar: document.getElementById('hRkBar').firstChild.style.transform, land: document.getElementById('hRank').classList.contains('land') }));
  const n = (t) => +((t.match(/([0-9]+) RP/) || [0, 0])[1]); if (!(n(after.t) > n(before.t))) fail.push('the counter did not count up: ' + before.t + ' -> ' + after.t);
  const k = (x) => +((x || '').match(/[0-9.]+/) || [0])[0]; if (!(k(after.bar) > k(before.bar) || k(after.bar) < .05)) fail.push('the rank bar did not fill: ' + before.bar + ' -> ' + after.bar);
  if (!after.land) fail.push('no landing pulse on the counter');
  // the answer feedback
  const fx = await a.evaluate(() => { const box = document.createElement('div'); box.className = 'dlgOpts q'; box.innerHTML = '<button class="ok">Right</button><button class="no">Wrong</button>'; document.body.appendChild(box); const [ok, no] = box.children; const r = { bg: getComputedStyle(ok).backgroundColor, nbg: getComputedStyle(no).backgroundColor, ok: getComputedStyle(ok).animationName, chk: getComputedStyle(ok, '::after').content, no: getComputedStyle(no).animationName }; box.remove(); return r; });
  if (!/34, 197, 94/.test(fx.bg) || !/239, 68, 68/.test(fx.nbg)) fail.push('a quiz answer does not turn green or red: ' + fx.bg + ' / ' + fx.nbg);
  if (!/optOk/.test(fx.ok) || !/✓/.test(fx.chk) || !/optNo/.test(fx.no)) fail.push('answer feedback missing: ' + JSON.stringify(fx));
  // reduced motion: nothing flies, the number still updates at once
  await a.emulateMedia({ reducedMotion: 'reduce' }); await a.reload(); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(1500);
  const t0 = await a.evaluate(() => document.getElementById('hRank').textContent); await a.evaluate(() => window.__pc.award(90, 'call cleared')); await a.waitForTimeout(120);
  const rm = await a.evaluate(() => ({ motes: document.querySelectorAll('.mote').length, t: document.getElementById('hRank').textContent }));
  if (rm.motes) fail.push('motes flew with reduced motion on'); if (rm.t === t0) fail.push('reduced motion: the counter did not update');
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
