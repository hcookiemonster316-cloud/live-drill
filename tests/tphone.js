// your work cell (owner's calls, 2026-11-27): swap numbers with anyone in a conversation; a case step with your
// sergeant (or anyone whose number you have) can be a phone call from where you stand; and the pointer to the next
// step is a hint with a reason, not an order, and never over the radio.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => { localStorage.clear(); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '3-Alpha-12', home: 2, unlocked: [2], lastD: 2, shift: 'day', unit: 'patrol', unitsV: 1, units: { patrol: 1 }, xp: 900, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 2: 99 }, side: { smoke: 0 }, track: 'smoke', me: { sex: 'm' } })); });
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W && window.__pc.W.did === 2, null, { timeout: 20000 });
  await a.waitForTimeout(1500); for (let i = 0; i < 6; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|just patrol|got it|close/i.test(x.innerText) && x.offsetParent && !x.closest('#dlg')); if (b) b.click(); }); await a.waitForTimeout(200); }
  // play the first step (the homeowner): swap numbers with him, and read the pointer
  await a.evaluate(() => { const pc = window.__pc, A = pc.activeQ(); pc.playStep(A.step); });
  const said = []; let swapped = false;
  for (let s = 0; s < 90; s++) { const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; const cb = d.querySelector('[data-c="card"]'); return { who: (d.querySelector('.dlgPlate b') || {}).innerText || '', t: (d.querySelector('#dlgP') || {}).innerText || '', card: !!(cb && !cb.hidden), ch: d.querySelectorAll('.dlgOpts [data-k]:not([disabled])').length }; });
    if (!st) break; if (st.t && said[said.length - 1] !== st.who + ': ' + st.t) said.push(st.who + ': ' + st.t);
    if (st.card && !swapped && /Kessler/.test(st.who)) { swapped = true; await a.evaluate(() => document.querySelector('#dlg [data-c="card"]').click()); }
    if (st.ch) { await a.evaluate(() => { const q = window.__curQ; const qb = q && document.querySelector('#dlg .dlgOpts.q [data-k="' + (Array.isArray(q.c) ? q.c[0] : q.c) + '"]'); (qb || document.querySelector('#dlg .dlgOpts [data-k]:not([disabled])')).click(); const ok = document.getElementById('dlgOk'); if (ok) { ok.disabled = false; ok.click(); } }); await a.waitForTimeout(900); continue; }
    await a.evaluate(() => document.getElementById('dlg').click()); await a.waitForTimeout(170); }
  const contacts = await a.evaluate(() => Object.values(window.__pc.S.contacts || {}).map((c) => c.name));
  const pointer = said.filter((l) => /Bell/.test(l)).pop() || '';
  console.log('contacts', JSON.stringify(contacts), '| pointer:', pointer);
  if (!contacts.some((n) => /Kessler/.test(n))) fail.push('could not swap numbers with Mr. Kessler');
  if (!pointer) fail.push('no hint toward Engineer Bell'); else { if (/over the radio/i.test(pointer)) fail.push('the hint came over the radio'); if (/^[^:]*: (Okay\. Next|Next stop|Good\. Now we|Alright\. From here)/.test(pointer)) fail.push('still an order, not a hint: ' + pointer); }
  // a step with Castillo can be a call from wherever you are
  const call = await a.evaluate(() => { const pc = window.__pc; pc.S.contacts = Object.assign({}, pc.S.contacts); const A = pc.activeQ(); return { who: A && A.step && A.step.who, btn: !!document.getElementById('objCall') }; });
  console.log('next step', JSON.stringify(call));
  // with Bell's number, the debrief can be a call: the button shows on the objective bar, and the scene opens on the phone
  await a.evaluate(() => { const pc = window.__pc; pc.S.contacts = Object.assign({}, pc.S.contacts, { bell: { name: 'Engineer Bell' } }); });
  // a loot reveal or a lore card from the first step waits for a tap and pauses the clock (and the objective bar) until it gets one
  for (let i = 0; i < 20 && !(await a.$('#objCall')); i++) { await a.evaluate(() => { document.querySelectorAll('.rv').forEach((x) => { x.click(); const k = x.querySelector('[data-a="keep"]'); if (k) k.click(); }); document.querySelectorAll('.lorePop [data-a]:not([data-a="read"])').forEach((x) => x.click()); }); await a.waitForTimeout(400); }
  await a.waitForSelector('#objCall', { timeout: 6000 }).catch(() => fail.push('no call button for a step with someone in your contacts'));
  if (await a.$('#objCall')) { await a.screenshot({ path: 'w_phone.png' }); await a.evaluate(() => document.getElementById('objCall').click());
    await a.waitForFunction(() => /work cell|call Engineer Bell/i.test((document.querySelector('.sceneCap, #dlgP') || {}).innerText || '') || /call Engineer Bell|work cell/i.test(document.body.innerText), null, { timeout: 6000 }).catch(() => fail.push('the step did not open as a phone call')); }
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
