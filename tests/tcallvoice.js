// your voice on a call (callvoice.js): every choice is said out loud by you, the person answers in a way that fits
// their mood, and the call closes on how it ended plus their last word. Plays three calls start to finish and checks
// the transcript: "You" speaks after choices, each call has an ending from its own list, and the address remembers it.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1280, height: 800 } }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const clear = async () => { for (let i = 0; i < 6; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|just patrol|got it|close/i.test(x.innerText) && x.offsetParent && !x.closest('#dlg')); if (b) b.click(); }); await a.waitForTimeout(250); } };
  await a.waitForTimeout(2000); await clear();
  const fail = []; const ends = []; let youLines = 0, shot = false;
  for (let run = 0; run < 3; run++) {
    await a.evaluate(() => { const d = document.getElementById('dlg'); if (d && !d.hidden) { const l = d.querySelector('[data-c="leave"]'); if (l) { l.click(); l.click(); } } });
    await a.waitForTimeout(400);
    // a scene call (pursuits, patrol operations and talk-downs run their own flows)
    // the shift director sometimes holds calls for a moment (a quiet stretch), so keep asking for a few seconds
    let title = null; for (let w = 0; w < 25 && !title; w++) { title = await a.evaluate(() => { const pc = window.__pc; let c = null; for (let k = 0; k < 30 && !c; k++) { pc.dispatchCall(); const x = pc.curCall; if (x && !x.ops && !x.deesc && !x.pursuit && x.les !== 0) c = x; else if (x) pc.dropCall(); } if (!c) return null; pc.dropCall(); c.pre = null; pc.openCallScene(c); return c.title; }); if (!title) await a.waitForTimeout(400); }
    if (!title) { fail.push('no call dispatched'); continue; }
    await a.waitForFunction(() => !document.getElementById('dlg').hidden, null, { timeout: 8000 }).catch(() => {});
    const log = []; let lastSig = '', still = 0;
    for (let s = 0; s < 120; s++) {
      const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d || d.hidden) return { gone: 1 }; const plate = d.querySelector('.dlgPlate b'); const p = d.querySelector('#dlgP'); const ch = d.querySelectorAll('.dlgOpts:not(.q) [data-k]:not([disabled])'), q = d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])');
        return { who: plate ? plate.innerText : '', text: p ? p.innerText : '', ch: ch.length, q: q.length, multi: !!d.querySelector('#dlgOk'), wait: !!d.querySelector('.dlgPanel.dlgChoice') && !ch.length && !q.length }; });
      if (st.gone) break;
      const sig = st.who + '|' + st.text + '|' + st.ch + '|' + st.q; if (sig === lastSig) { if (++still > 25) { fail.push('stuck on ' + sig.slice(0, 80)); break; } } else { still = 0; lastSig = sig; if (st.text) log.push((st.who || 'narr') + ': ' + st.text); if (st.who === 'You') { youLines++; if (!shot) { shot = true; await a.waitForTimeout(900); await a.screenshot({ path: 'w_callvoice_you.png' }); } } }
      if (st.ch) { await a.evaluate(() => { const bs = [...document.querySelectorAll('#dlg .dlgOpts:not(.q) [data-k]:not([disabled])')]; bs[Math.floor(Math.random() * bs.length)].click(); }); await a.waitForTimeout(350); continue; }
      if (st.q) { await a.evaluate(() => { const q = window.__curQ; const k = q ? (Array.isArray(q.c) ? q.c[0] : q.c) : 0; const b = document.querySelector('#dlg .dlgOpts.q [data-k="' + k + '"]') || document.querySelector('#dlg .dlgOpts.q [data-k]:not([disabled])'); b.click(); const ok = document.getElementById('dlgOk'); if (ok) { ok.disabled = false; ok.click(); } }); await a.waitForTimeout(1100); continue; }
      if (st.wait) { await a.evaluate(() => { const b = [...document.querySelectorAll('.hiChk, .hiItem, [data-hi]')].find((x) => x.offsetParent); if (b) b.click(); else { const l = document.querySelector('#dlg [data-c="skip"]'); if (l) l.click(); } }); await a.waitForTimeout(300); continue; }
      await a.evaluate(() => { const d = document.getElementById('dlg'); d.click(); }); await a.waitForTimeout(140);
    }
    const ended = await a.evaluate(() => { const S = window.__pc.S; return Object.values(S.addr || {}).sort((x, y) => y.when - x.when)[0] || null; });
    const endLine = log.find((l) => /^narr: /.test(l) && log.indexOf(l) > log.length - 8);
    ends.push(title + ' -> ' + (endLine || '(no ending seen)') + ' | e=' + (ended && ended.e));
    if (!ended || ended.e == null) fail.push('address did not remember how "' + title + '" ended');
    console.log('--- ' + title + '\n' + log.slice(-14).map((l) => '   ' + l.slice(0, 150)).join('\n'));
    await clear();
  }
  console.log('endings:\n ' + ends.join('\n '));
  if (youLines < 3) fail.push('you spoke only ' + youLines + ' times across three calls');
  const cv = await a.evaluate(async () => { const m = await import('./callvoice.js'); const t = Object.keys(m.ENDS); return { n: t.length, bad: t.filter((k) => m.ENDS[k].length !== 3).length }; });
  if (cv.n < 71 || cv.bad) fail.push('endings: ' + JSON.stringify(cv));
  console.log('you spoke', youLines, 'times; endings for', cv.n, 'calls');
  if (errs.length) fail.push(...errs.slice(0, 4));
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
