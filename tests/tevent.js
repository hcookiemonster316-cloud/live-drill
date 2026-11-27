// special shift scenes (storycine.js): a special shift opens on the city under its conditions (storm, the grid going
// dark, festival lights, parade confetti), the shift's name, and Castillo's first line; the brief that follows starts
// at her second line. Once per kind; Skip ends it.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const fail = [];
  for (const k of ['hurricane', 'blackout', 'festival', 'parade']) {
    const a = await b.newPage({ viewport: { width: 1280, height: 720 } }); a.on('pageerror', (e) => fail.push(k + ': ' + e.message));
    await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle&cuts&special=' + k);
    await a.evaluate((night) => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Alpha-12', home: 0, unlocked: [0], shift: night ? 'night' : 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false, text: 'instant' } })), k === 'blackout');
    await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
    for (let i = 0; i < 30 && !(await a.$('.brief.sc')); i++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a]:not([data-a="read"])').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mDone, #mClose'); if (bt) bt.click(); } }); await a.waitForTimeout(500); }
    if (!(await a.$('.brief.sc'))) { fail.push(k + ': no scene'); await a.close(); continue; }
    await a.waitForTimeout(2600); await a.screenshot({ path: 'w_event_' + k + '.png' });
    await a.waitForFunction(() => document.querySelector('.scTitle.in b') && document.querySelector('.scTitle.in b').textContent, null, { timeout: 8000 }).catch(() => fail.push(k + ': no title'));
    const title = await a.evaluate(() => document.querySelector('.scTitle b').textContent); console.log(k, 'title:', title);
    await a.waitForSelector('.sc .bfCap:not([hidden]) b:not(:empty)', { timeout: 9000 }).catch(() => {});
    await a.waitForFunction(() => /Castillo/i.test((document.querySelector('.sc .bfCap b') || {}).textContent || ''), null, { timeout: 9000 }).catch(() => fail.push(k + ': no close-up line'));
    const said = await a.evaluate(() => document.querySelector('.sc .bfCap p').textContent);
    await a.click('.sc .bfSkip'); await a.waitForFunction(() => !document.querySelector('.brief.sc') && !document.getElementById('dlg').hidden, null, { timeout: 8000 }).catch(() => fail.push(k + ': no brief after the scene'));
    await a.waitForTimeout(900); const first = await a.evaluate(() => document.getElementById('dlg').innerText.replace(/\s+/g, ' '));
    if (said && first.indexOf(said.slice(0, 30)) >= 0) fail.push(k + ': the brief repeats the line said in the scene');
    if (!/SPECIAL SHIFT/i.test(first)) fail.push(k + ': brief not shown: ' + first.slice(0, 80));
    await a.close();
  }
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
