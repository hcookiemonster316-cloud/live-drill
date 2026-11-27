// the conversation card on a phone (owner's screenshot, 2026-11-27): a long lesson title under the speaker's name used to
// widen the card past the screen and cut off the question and answers. Opens a citizen's question at phone width, at
// normal and extra-large text, and checks nothing in the card reaches past the screen edge.
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const fail = [];
  for (const ts of ['m', 'xl']) {
    const c = await b.newContext({ ...devices['Galaxy S9+'] }); const a = await c.newPage(); a.on('pageerror', (e) => fail.push(e.message));
    await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
    await a.evaluate((ts) => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, ts })), ts);
    await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W && window.__pc.citizens.length, null, { timeout: 20000 });
    await a.evaluate(() => { const pc = window.__pc; pc.citizenTalk(pc.citizens[0]); });
    for (let s = 0; s < 40; s++) { if (await a.evaluate(() => document.querySelectorAll('#dlg .dlgOpts.q [data-k]').length)) break; await a.evaluate(() => { const d = document.getElementById('dlg'); const ch = d.querySelector('.dlgOpts:not(.q) [data-k]:not([disabled])'); if (ch) ch.click(); else d.click(); }); await a.waitForTimeout(250); }
    await a.evaluate(() => { const s = document.querySelector('#dlg .dlgPlate small'); if (s) s.textContent = '1.1: Exterior, Under the Hood, and Interior Vehicle Inspection Checklist'; }); // the longest lesson title
    await a.waitForTimeout(700);
    const m = await a.evaluate(() => { const p = document.querySelector('#dlg .dlgPanel'); if (!p) return null; return { q: document.querySelectorAll('#dlg .dlgOpts.q [data-k]').length, sw: p.scrollWidth, cw: p.clientWidth, past: [...p.querySelectorAll('*')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1).map((e) => e.className || e.tagName).slice(0, 5) }; });
    console.log(ts, JSON.stringify(m));
    if (!m || !m.q) fail.push(ts + ': no question opened'); else if (m.sw > m.cw + 1 || m.past.length) fail.push(ts + ': card wider than the screen ' + JSON.stringify(m));
    if (ts === 'm') await a.screenshot({ path: 'w_mobdlg.png' });
    await c.close();
  }
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
