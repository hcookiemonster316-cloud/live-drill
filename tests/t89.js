// variety: calls built from parts, pair offers, mini-games, ambient moments, epilogues, quest seq
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3], shift: 'night', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, cfg: { callCine: false, text: 'instant', checkEvery: 9999 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(6000);
  const clear = async () => { for (let k = 0; k < 6; k++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"]').forEach((x) => x.click()); document.querySelectorAll('.tCard').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mClose,#mDone,button'); if (bt) bt.click(); } }); await a.waitForTimeout(120); } };
  await clear();
  console.log('shift', await a.evaluate(() => JSON.stringify({ cond: window.__pc.S.vcond, part: window.__pc.S.vpart })));
  // play through dialogue: answer right, pick first choice, finish mini-games correctly-ish
  const play = async (tag, shots) => { let mg = 0, idle = 0;
    for (let k = 0; k < 160; k++) {
      await a.waitForTimeout(90);
      const st = await a.evaluate(() => { const ov = document.getElementById('vgMini'); if (ov && !ov.hidden && ov.classList.contains('on')) { const go = ov.querySelector('.vgGo:not([disabled])'); const opt = ov.querySelector('.vgOpts button:not([disabled]), .vgPick button:not([disabled])'); const pt = ov.querySelector('.vgPt'); if (ov.querySelector('.vgCount')) return 'mg-wait'; if (opt && !go) { opt.click(); return 'mg-opt'; } if (pt && go && go.disabled) { const sel = ov.querySelectorAll('.vgPt.on').length; const ps = ov.querySelectorAll('.vgPt'); (sel ? ps[4] : ps[0]).dispatchEvent(new MouseEvent('click', { bubbles: true })); return 'mg-pt'; } if (go) { go.click(); return 'mg-go'; } return 'mg-?'; }
        const d = document.getElementById('dlg'); if (d.hidden) return null; const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { const q = window.__curQ; (qb.find((x) => +x.dataset.k === q.c) || qb[0]).click(); return 'q'; } const ch = d.querySelector('.dlgOpts:not(.q) button:not([disabled])'); if (ch) { ch.click(); return 'c'; } d.click(); return 'n'; });
      if (st && st.startsWith('mg')) { mg++; if (mg === 1 && shots) await a.screenshot({ path: tag + '_mg.png' }); }
      if (st === 'q' && shots && k < 30) await a.screenshot({ path: tag + '_q.png' });
      if (st === null) { idle = (idle || 0) + 1; if (idle > 40) break; } else idle = 0;
    } return mg; };
  // run several calls straight into scenes and log the caller lines
  for (let r = 0; r < 6; r++) {
    const info = await a.evaluate(() => { const pc = window.__pc; let c = pc.curCall; if (!c) { pc.dispatchCall(); c = pc.curCall; } if (!c) return 'no call (held or pair)'; const t = c.title; pc.dropCall(); pc.openCallScene(c); return t; });
    await a.waitForTimeout(300); if (r === 0) await a.screenshot({ path: 'v_scene.png' });
    const txt = await a.evaluate(() => document.getElementById('dlg').innerText.slice(0, 120).replace(/\n/g, ' | '));
    console.log('call', r, info, '::', txt);
    const mg = await play('v' + r, r < 2); await clear(); await a.waitForTimeout(300); await clear();
    console.log('  minigame steps', mg);
    await a.evaluate(() => { document.querySelectorAll('#modal button').forEach((x) => { if (/back|done|continue|close/i.test(x.innerText)) x.click(); }); });
  }
  // every mini-game directly
  for (const g of ['observe', 'bolo', 'clear', 'perimeter']) { await a.evaluate((g) => { window.__mgDone = null; window.__pc.VAR.GAMES[g]((s) => { window.__mgDone = s; }); }, g); await a.waitForTimeout(400); await a.screenshot({ path: 'mg_' + g + '.png' }); await play('mg' + g, false); console.log('mini', g, await a.evaluate(() => window.__mgDone)); }
  // pair offer
  await a.evaluate(() => { const pc = window.__pc; const A = { title: 'Noise complaint', where: 'the Night Owl', les: 0 }, B = { title: 'Lockout call', where: 'block 230 Oak Ave', les: 8 }; pc.VAR.offerPair(A, B, (x) => { window.__picked = x.title; }); });
  await a.waitForTimeout(400); await a.screenshot({ path: 'v_pair.png' }); await play('pair', false); console.log('pair picked', await a.evaluate(() => window.__picked));
  // formats
  console.log('formats', JSON.stringify(await a.evaluate(() => { const V = window.__pc.VAR; return [2, 5, 17, 19, 4, 7].map((l) => { const q = V.formatQ(l); return q ? [l, q.stem.slice(0, 70), q.opts, q.fid] : [l, null]; }); })));
  // quest seq
  console.log('questSeq', await a.evaluate(() => { const V = window.__pc.VAR; let n = 0; for (let i = 0; i < 30; i++) n += V.questSeq({ st: { who: 'delgado', goal: 'Search the lot for the man who ran', say: [['delgado', 'He ran into the woods']] }, seq: [['delgado', 'hi'], ['q', window.__pc.L.pickFacts(window.__pc.S, [18], 1)[0], 'delgado']], side: true }).length; return n; }));
  // epilogue + ambient
  await a.evaluate(() => { const S = window.__pc.S; S.epi = [{ q: 'The Missing Wallet', who: 'delgado', at: 0, d: window.__pc.W.did }]; });
  await a.evaluate(() => window.__pc.VAR.tick(200)); await a.waitForTimeout(400); await a.screenshot({ path: 'v_epi.png' });
  console.log('epilogue open', await a.evaluate(() => document.getElementById('dlg').innerText.slice(0, 140).replace(/\n/g, ' | ')));
  await play('epi', false);
  console.log(errs.length ? errs.slice(0, 6) : 'no errors'); await b.close();
})();
