// "where to go next" comes from someone who'd know: after a civilian's scene (Mr. Kessler, a homeowner), the pointer to
// the fire station debrief comes from your partner or Castillo on the radio, never from the homeowner himself.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => { localStorage.clear(); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '3-Alpha-12', home: 2, unlocked: [2], lastD: 2, shift: 'day', unit: 'patrol', unitsV: 1, units: { patrol: 1 }, xp: 900, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 2: 99 }, side: { smoke: 0 }, track: 'smoke' })); });
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W && window.__pc.W.did === 2, null, { timeout: 20000 });
  await a.waitForTimeout(1500); for (let i = 0; i < 6; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|just patrol|got it|close/i.test(x.innerText) && x.offsetParent && !x.closest('#dlg')); if (b) b.click(); }); await a.waitForTimeout(200); }
  const q = await a.evaluate(() => { const pc = window.__pc, A = pc.activeQ(); if (!A || !A.step) return null; pc.playStep(A.step); return A.step.who + ' @ ' + A.step.at; });
  console.log('step', q); if (!q) fail.push('the smoke case step did not start');
  const said = []; for (let s = 0; s < 90; s++) { const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; return { who: (d.querySelector('.dlgPlate b') || {}).innerText || '', t: (d.querySelector('#dlgP') || {}).innerText || '', ch: d.querySelectorAll('.dlgOpts [data-k]:not([disabled])').length }; });
    if (!st) break; if (st.t && said[said.length - 1] !== st.who + ': ' + st.t) said.push(st.who + ': ' + st.t);
    if (st.ch) { await a.evaluate(() => { const q = window.__curQ; const qb = q && document.querySelector('#dlg .dlgOpts.q [data-k="' + (Array.isArray(q.c) ? q.c[0] : q.c) + '"]'); (qb || document.querySelector('#dlg .dlgOpts [data-k]:not([disabled])')).click(); const ok = document.getElementById('dlgOk'); if (ok) { ok.disabled = false; ok.click(); } }); await a.waitForTimeout(900); continue; }
    await a.evaluate(() => document.getElementById('dlg').click()); await a.waitForTimeout(170); }
  const pointer = said.filter((l) => /Fire Station 3/.test(l)).pop() || '';
  console.log('pointer line:', pointer);
  if (!pointer) fail.push('no line pointed to the next step'); else if (/Kessler/.test(pointer.split(':')[0])) fail.push('the homeowner gave the next step: ' + pointer);
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
