// partner cases: each partner's three scenes play in order, the turning point is staged with its picture and changes how they talk
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 640 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(4000);
  const close = () => a.evaluate(() => { document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); [...document.querySelectorAll('button')].filter((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent).forEach((x) => x.click()); document.querySelectorAll('.tCard').forEach((x) => x.click()); });
  await close();
  for (const k of ['walsh', 'park', 'castillo']) {
    const pick = k === 'park' ? 1 : 0;
    for (let stage = 0; stage < 3; stage++) {
      await a.evaluate(([k]) => { const pc = window.__pc; pc.S.vpart = k; pc.PART.onShift(k); pc.S.x6 = true; const s = pc.S.pcase[k]; s.rides = 9; if (pc.curCall) pc.dropCall(); pc.PART.afterCall(); }, [k]);
      let saw = [];
      for (let i = 0; i < 160; i++) { await a.waitForTimeout(200); const st = await a.evaluate((pick) => { document.querySelectorAll('.rv [data-a="keep"], .promo button, .tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop button').forEach((x) => { if (/patrol/i.test(x.innerText)) x.click(); }); const pc = window.__pc; if (pc.PART.pending && pc.curCall) pc.dropCall(); const d = document.getElementById('dlg'); const tw = document.querySelector('.twist'); if (tw) return 'twist'; if (d.hidden) { const lp = document.querySelector('.lorePop .ghost, .lorePop button:last-child'); if (lp) lp.click(); const m = document.getElementById('modal'); if (!m.hidden) { const x = m.querySelector('#mClose,#mDone,.qAct button'); if (x) x.click(); } return 'hidden'; } const t = (d.querySelector('.dlgText, p') || d).innerText.replace(/\s+/g, ' ').slice(0, 90); const ch = d.querySelectorAll('.dlgOpts button:not([disabled])'); if (ch.length) { ch[pick].click(); return 'C:' + t; } d.click(); return 'L:' + t; }, pick);
        if (st !== 'hidden' && st !== saw[saw.length - 1]) saw.push(st); if (st === 'twist' && saw.length > 1) break; if (st === 'twist') { saw.pop(); await a.waitForTimeout(3300); await a.evaluate(() => { const t = document.querySelector('.twist'); if (t) t.click(); }); await a.waitForTimeout(700); continue; } /* a staged moment that turned up before the story: let it play, then carry on */ if (st === 'hidden' && saw.length > 1) break; }
      if (saw[saw.length - 1] === 'twist') { await a.waitForTimeout(3300); await a.screenshot({ path: 'tpart_' + k + '.png' }); await a.waitForTimeout(200); await a.evaluate(() => { const t = document.querySelector('.twist'); if (t) t.click(); }); await a.waitForTimeout(700); }
      console.log(k, 'stage', stage, '->', saw.length, 'steps; last:', saw.slice(-2).join(' | ').slice(0, 160));
    }
    console.log(k, 'state', JSON.stringify(await a.evaluate((k) => window.__pc.S.pcase[k], k)), '| opens with:', await a.evaluate((k) => window.__pc.PART.startLine(k), k));
  }
  console.log('benched park:', await a.evaluate(() => window.__pc.PART.benched('park')));
  const fin = await a.evaluate(() => { const c = window.__pc.S.pcase; return ['walsh', 'park', 'castillo'].filter((k) => !c[k] || c[k].stage !== 3 || !c[k].out); }); if (fin.length) errs.push('story did not finish: ' + fin.join(','));
  if (!(await a.evaluate(() => window.__pc.PART.benched('park')))) errs.push('Park not benched after a cover-up');
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close(); })();
