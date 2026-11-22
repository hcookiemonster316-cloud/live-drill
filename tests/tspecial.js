// special shifts: each of the four plays its briefing, holds routine calls, sets its rules, turns the shift orders
// into three stops that play when you reach them, and ends with a debrief moment
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = []; const only = process.env.ONLY;
  for (const k of only ? [only] : ['hurricane', 'festival', 'blackout', 'parade']) {
    const a = await b.newPage({ viewport: { width: 900, height: 640 } }); a.on('pageerror', (e) => errs.push(k + ': ' + e.message + ' ' + (e.stack || '').split('\n')[1]));
    await a.goto('http://localhost:8765/academy/?mock&skiptitle&special=' + k);
    await a.evaluate((night) => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0], shift: night ? 'night' : 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false, text: 'instant' } })), k === 'blackout');
    await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
    const drive = async () => { const seen = []; for (let i = 0; i < 90; i++) { await a.waitForTimeout(150);
      const st = await a.evaluate(() => { document.querySelectorAll('.lorePop button').forEach((x) => { if (/patrol/i.test(x.innerText)) x.click(); }); document.querySelectorAll('.tCard, .rv [data-a="keep"], .promo button').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const x = m.querySelector('#mClose,#mDone'); if (x) x.click(); }
        if (document.querySelector('.twist')) return 'TWIST:' + document.querySelector('.twist h2').innerText; const d = document.getElementById('dlg'); if (d.hidden) return 'hidden';
        const bs = [...d.querySelectorAll('.dlgOpts button:not([disabled])')]; if (bs.length) { const t = bs.map((x) => x.innerText.replace(/\s+/g, ' ')); bs[0].click(); return 'C:' + (d.querySelector('.dlgKick, .kicker') || { innerText: '' }).innerText + ' [' + t.map((x) => x.length).join('/') + '] ' + t[0].slice(0, 50); }
        d.click(); return 'L'; });
      if (st.startsWith('TWIST')) { seen.push(st); await a.waitForTimeout(1700); await a.evaluate(() => document.querySelector('.twist').click()); await a.waitForTimeout(500); continue; }
      if (st === 'hidden') { if (seen.length > 1) break; continue; } if (st !== seen[seen.length - 1]) seen.push(st); } return seen; };
    await a.waitForTimeout(6500); const brief = await drive();
    const info = await a.evaluate(() => { const pc = window.__pc, c = pc.SPEC.cur; return { cur: c && c.id, stops: c && c.stops.map((o) => o.name), orders: document.getElementById('orders').innerText.replace(/\s+/g, ' ').slice(0, 160), hold: pc.SPEC.holdCalls(), sp: pc.SPEC.speedMul(pc.P.x, pc.P.y, true), lampsOn: pc.W.props.filter((p) => p.t === 'lamp' && p.on).length, peds: pc.peds.length, storm: !!(pc.FX && pc.FX.storm) }; });
    console.log(k, JSON.stringify(info)); console.log('   brief:', brief.length, 'lines');
    if (info.cur !== k || !info.stops || info.stops.length !== 3) { errs.push(k + ': special did not start'); await a.close(); continue; }
    if (!info.hold) errs.push(k + ': calls not held');
    await a.evaluate(() => { const pc = window.__pc, o = pc.SPEC.cur.stops[0]; pc.P.x = o.x + .6; pc.P.y = o.y; pc.P.path = []; });
    await a.waitForTimeout(1200); await a.screenshot({ path: 'tspecial_' + k + '.png' });
    for (let i = 0; i < 3; i++) { await a.evaluate((i) => { const pc = window.__pc, o = pc.SPEC.cur.stops[i]; pc.P.x = o.x + .5; pc.P.y = o.y; pc.P.path = []; if (pc.curCall) pc.dropCall(); }, i); await a.waitForTimeout(2600);
      const dbg = await a.evaluate((i) => { const pc = window.__pc, o = pc.SPEC.cur.stops[i]; return { free: pc.free, paused: pc.paused, d: Math.hypot(o.x - pc.P.x, o.y - pc.P.y).toFixed(2), done: o.done, modal: !document.getElementById('modal').hidden, dlg: !document.getElementById('dlg').hidden, inside: !!pc.inside, vis: [...document.querySelectorAll('body > *')].filter((x) => !x.hidden && getComputedStyle(x).display !== 'none' && getComputedStyle(x).position === 'fixed').map((x) => (x.id || x.className).slice(0, 14)).join(',') }; }, i); const seen = await drive(); console.log('   stop', i, JSON.stringify(dbg), seen.filter((x) => x.startsWith('C') || x.startsWith('TWIST')).join(' | ').slice(0, 260)); }
    const fin = await a.evaluate(() => { const pc = window.__pc; return { done: pc.SPEC.cur.stops.every((o) => o.done), hold: pc.SPEC.holdCalls(), right: pc.SPEC.cur.right, lampsOn: pc.W.props.filter((p) => p.t === 'lamp' && p.on).length }; });
    console.log('   end', JSON.stringify(fin)); if (!fin.done || fin.hold) errs.push(k + ': stops not all done');
    await a.close(); }
  console.log(errs.length ? errs.slice(0, 4) : 'no errors'); await b.close(); })();
