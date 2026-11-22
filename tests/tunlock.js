// the game opens for everyone: no ?mock, no pass code, fresh browser
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?skiptitle'); await a.waitForTimeout(6000);
  const st = await a.evaluate(() => ({ lock: !!document.querySelector('.lockBox, #lock:not([hidden])') && /study hub once/i.test(document.body.innerText), start: !!document.querySelector('#start:not([hidden])') || !!document.querySelector('#fe:not([hidden])') }));
  console.log('locked:', st.lock, '| game front end showing:', st.start);
  await a.screenshot({ path: 'tunlock.png' }); console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close(); })();
