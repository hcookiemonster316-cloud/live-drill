// chapter subjects as voices: nudge before a decision, the story beat on a wrong call, opening observations
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { autoQ: false, drs: false, text: 'instant', callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  for (let k = 0; k < 8; k++) { await a.evaluate(() => { const pc = window.__pc; if (pc.curCall) pc.dropCall(); document.querySelectorAll('.tCard,.lorePop').forEach((x) => { const bb = [...x.querySelectorAll('button')].pop(); if (bb) bb.click(); else x.click(); }); const m = document.getElementById('modal'); if (!m.hidden) { const bb = m.querySelector('#mClose,#mDone'); if (bb) bb.click(); } const dl = document.getElementById('dlg'); if (!dl.hidden) { const ob = dl.querySelector('.dlgOpts button'); if (ob) ob.click(); else dl.click(); } }); await a.waitForTimeout(200); }
  await a.evaluate(() => { const pc = window.__pc, V = pc.VAR; const qs = [V.decisionQ(1), V.decisionQ(2), V.decisionQ(7), V.decisionQ(9)]; window.__qs = qs; pc.dialogue([['castillo', 'Alright, here we go.']].concat(qs.map((q) => ['q', q, 'castillo'])).concat([['castillo', 'That\'s the shift.']]), () => { window.__done = 1; }); });
  const seen = []; let shot = 0;
  for (let k = 0; k < 120; k++) { await a.waitForTimeout(130);
    const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; const plate = (d.querySelector('.dlgPlate b') || {}).innerText || '', voice = d.querySelector('.dlgPanel.dlgVoice, .dlgVoice') ? 'VOICE ' : '';
      const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { const q = window.__curQ; (qb.find((x) => +x.dataset.k !== q.c) || qb[0]).click(); return 'PICK(wrong) ' + plate; }
      const t = (d.querySelector('.dlgTxt') || {}).innerText || ''; return voice + plate + ': ' + t.slice(0, 110); });
    if (st === null) break; if (seen[seen.length - 1] !== st) { seen.push(st); if (/^VOICE/.test(st) && shot < 2) { await a.waitForTimeout(1500); await a.screenshot({ path: 'voice_' + (shot++) + '.png' }); } }
    await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d.hidden && !d.querySelector('.dlgOpts.q [data-k]:not([disabled])')) d.click(); }); }
  console.log(seen.join('\n'));
  console.log('opening observations:', JSON.stringify(await a.evaluate(() => { const out = new Set(); for (let i = 0; i < 40; i++) { const l = window.__pc.SUBJ ? window.__pc.SUBJ.open(4) : null; if (l) out.add(l[1]); } return [...out]; })));
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close(); })();
