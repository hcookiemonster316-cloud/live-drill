// your call sign and name (start screen): the whole unit number is yours (first number, a letter in the military
// alphabet, a unit number), an older call sign moves to the military alphabet (Adam becomes Alpha), you can be called
// "Cadet" or "Cadet <your last name>" (and people use it), you start in the district you were in last, and rank on
// the uniform and car is off until you turn it on in Settings.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  const url = 'http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle';
  await a.goto(url);
  await a.evaluate(() => { localStorage.clear(); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1], lastD: 1, shift: 'day', unit: 'patrol', unitsV: 1, units: { patrol: 1 }, xp: 2400, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99, 1: 99 } })); });
  await a.reload(); await a.waitForSelector('#start:not([hidden])');
  const shown = await a.evaluate(() => ({ cs: document.getElementById('stCsNow').textContent, opts: [...document.querySelectorAll('#stPhon option')].slice(0, 4).map((o) => o.textContent).join(',') }));
  console.log('start screen', JSON.stringify(shown));
  if (shown.cs !== '1-Alpha-12') fail.push('old call sign not moved to the military alphabet: ' + shown.cs);
  if (shown.opts !== 'Alpha,Bravo,Charlie,Delta') fail.push('letters: ' + shown.opts);
  // your own whole number, a letter, and your last name
  await a.fill('#stPre', '3'); await a.selectOption('#stPhon', 'Delta'); await a.fill('#stNum', '17');
  await a.click('[data-nm="1"]'); await a.waitForSelector('#stLname');
  const blocked = await a.evaluate(() => document.getElementById('stGo').disabled); if (!blocked) fail.push('start allowed with no last name typed');
  await a.fill('#stLname', 'rivera'); await a.waitForTimeout(200);
  await a.screenshot({ path: 'w_callsign.png' });
  await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const st = await a.evaluate(() => ({ cs: window.__pc.S.cs, ln: window.__pc.S.lname, did: window.__pc.W.did, rank: window.__pc.S.cfg.rankShow }));
  console.log('after start', JSON.stringify(st));
  if (st.cs !== '3-Delta-17') fail.push('call sign: ' + st.cs); if (st.ln !== 'Rivera') fail.push('last name: ' + st.ln);
  if (st.did !== 1) fail.push('did not start in the last district (Eastside): ' + st.did); if (st.rank !== false) fail.push('rank shows by default');
  // people use your name
  await a.waitForTimeout(1500); for (let i = 0; i < 6; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|just patrol|got it|close/i.test(x.innerText) && x.offsetParent && !x.closest('#dlg')); if (b) b.click(); }); await a.waitForTimeout(200); }
  await a.evaluate(() => window.__pc.dlg([['castillo', 'Eyes up, cadet. We roll in five.']]));
  await a.waitForFunction(() => /Cadet Rivera/.test((document.querySelector('#dlgP') || {}).innerText || ''), null, { timeout: 6000 }).catch(() => fail.push('Castillo did not use your name'));
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
