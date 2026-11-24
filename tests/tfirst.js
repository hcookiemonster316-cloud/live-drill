// a brand-new cadet's first minute: the start button works without typing, roll call is the sergeant talking (no rulebook),
// and nothing piles on the guided shift (no random call before its own call step, no lore card over the coach)
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', home: 0, unlocked: [0], sound: false, seenIntro: 1, seenCine: 1 })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])');
  const form = await a.evaluate(() => { const g = document.getElementById('stGo'); return { disabled: g.disabled, label: g.textContent, cs: document.getElementById('stCsNow').textContent }; });
  console.log('form', JSON.stringify(form)); if (form.disabled || !/^\d-[A-Za-z]+-\d{1,3}$/.test(form.cs)) errs.push('a new cadet cannot start without typing: ' + JSON.stringify(form));
  await a.locator('#stGo').scrollIntoViewIfNeeded(); await a.click('#stGo');
  await a.waitForFunction(() => document.getElementById('mDone') && document.getElementById('mDone').offsetParent, null, { timeout: 20000 });
  const roll = await a.evaluate(() => document.getElementById('modal').innerText.replace(/\s+/g, ' '));
  console.log('roll call', roll.slice(0, 160)); if (/Focus this shift|District Final Call/.test(roll) || !/Castillo/.test(roll)) errs.push('first roll call is still the rulebook: ' + roll.slice(0, 120));
  await a.click('#mDone');
  await a.waitForFunction(() => document.querySelector('.coach'), null, { timeout: 30000 }).catch(() => errs.push('the guided shift never started'));
  let calls = 0, lore = 0; for (let i = 0; i < 40; i++) { await a.waitForTimeout(500); const s = await a.evaluate(() => { const cc = document.getElementById('callCard'); return { call: !!(cc && !cc.hidden && cc.offsetParent), lore: !!(document.querySelector('.lorePop') && document.querySelector('.coach')) }; }); calls += s.call; lore += s.lore; }
  console.log('during the first steps: call shown', calls, 'lore over coach', lore); if (calls) errs.push('a random call landed in the first tutorial steps'); if (lore) errs.push('a lore card sat on the guided shift');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
