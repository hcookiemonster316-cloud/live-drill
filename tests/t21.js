const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const errs = [];
  const a = await b.newPage({ viewport: { width: 1280, height: 800 } }); a.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 700, sound: false, seenIntro: 1, trophies: { stripes: 1, first: 1 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(400); await a.click('#mDone'); await a.waitForTimeout(1200);
  let shots = 0;
  const drive = async (name) => { const seen = { choice: 0, q: 0, line: 0 }; for (let k = 0; k < 80; k++) { await a.waitForTimeout(160);
      const st = await a.evaluate(() => { const d = document.querySelector('#dlg'), m = document.querySelector('#modal'); return { dlg: !d.hidden && d.classList.contains('on'), choice: !!d.querySelector('.dlgOpts:not(.q) [data-k]:not([disabled])'), q: !!d.querySelector('.dlgOpts.q [data-k]:not([disabled])'), modal: !m.hidden, done: !m.hidden && !!m.querySelector('#mDone'), rv: !!document.querySelector('[data-a="keep"]') && document.querySelector('[data-a="keep"]').getBoundingClientRect().width > 0 }; });
      if (st.rv) { await a.evaluate(() => document.querySelector('[data-a="keep"]').click()); continue; }
      if (st.choice) { seen.choice++; if (shots < 3 && seen.choice === 1) { await a.screenshot({ path: OUT + '/S_' + name + '_choice.png' }); shots++; } await a.evaluate(() => { const o = document.querySelector('#dlg .dlgOpts:not(.q) [data-k="0"]'); if (o) o.click(); }); continue; } /* the line may have moved on before the click */
      if (st.q) { seen.q++; if (seen.q === 1 && name === 'call') await a.screenshot({ path: OUT + '/S_call_q.png' }); await a.evaluate(() => document.querySelector('#dlg .dlgOpts.q [data-k]').click()); await a.waitForTimeout(100); await a.evaluate(() => { const ok = document.querySelector('#dlgOk'); if (ok && !ok.disabled) ok.click(); }); continue; }
      if (st.dlg) { seen.line++; await a.evaluate(() => document.querySelector('#dlg').click()); continue; }
      if (st.done) { await a.evaluate(() => document.querySelector('#modal #mDone').click()); continue; }
      if (!st.modal) break; }
    console.log(name, JSON.stringify(seen)); };
  // call
  for (let k = 0; k < 10; k++) { await a.evaluate(() => { const pc = window.__pc; if (!pc.call) pc.dispatchCall(); const o = document.querySelector('#dlg .dlgOpts [data-k="0"]'); if (!pc.call && o) o.click(); }); await a.waitForTimeout(300); if (await a.evaluate(() => !!window.__pc.call)) break; } // two calls holding: take the first
  await a.evaluate(() => { const c = window.__pc.call; window.__pc.P.x = c.x; window.__pc.P.y = c.y + .3; }); await a.waitForTimeout(1500); await a.screenshot({ path: OUT + '/S_call_open.png' }); await drive('call');
  console.log('calls', await a.evaluate(() => window.__pc.S.calls));
  // citizen, observe, info
  await a.evaluate(() => window.__pc.citizenTalk(window.__pc.citizens[0])); await drive('citizen');
  await a.evaluate(() => { const o = window.__pc.observes[0]; if (o) window.__pc.observeScene(o); }); await drive('observe');
  await a.evaluate(() => window.__pc.infoPoint(window.__pc.infos[0])); await drive('info');
  await a.evaluate(() => window.__pc.npcTalk(window.__pc.regs[0])); await drive('npc');
  await a.evaluate(() => window.__pc.streetLife({ k: 'truck', x: window.__pc.P.x, y: window.__pc.P.y, name: 'Taco Truck' })); await drive('truck');
  console.log('paused', await a.evaluate(() => window.__pc.dbg().paused), 'cine', await a.evaluate(() => document.body.className));
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
