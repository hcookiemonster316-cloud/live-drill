// scene decisions: each ties to a real fact in its lesson, options are balanced, and a pick plays out in the scene
const { chromium, devices } = require('playwright');
(async () => {
  const { ACTS } = await import(require('url').pathToFileURL(require('path').resolve(__dirname, '../academy/decide.js')).href);
  const F = require(require('path').resolve(__dirname, '../academy/facts.json')).f; const bad = [];
  ACTS.forEach((a) => { const [les, stem, right, wr, re, g, b] = a; const hit = F.filter((f) => f[0] === les && re.test(f[1]));
    if (!hit.length) bad.push('no fact: ' + stem); if (wr.length !== 3) bad.push('wrongs: ' + stem); if (!g || !b) bad.push('outcomes: ' + stem);
    const lens = wr.map((w) => w.length), mx = Math.max(...lens), mn = Math.min(...lens);
    if (right.length > mx + 14) bad.push('right too long (' + right.length + ' vs ' + mx + '): ' + right); if (right.length < mn - 14) bad.push('right too short: ' + right);
    if (new Set([right].concat(wr)).size !== 4) bad.push('duplicate option: ' + stem); });
  const per = {}; ACTS.forEach((a) => per[a[0]] = (per[a[0]] || 0) + 1);
  console.log('acts', ACTS.length, 'lessons covered', Object.keys(per).length, 'lint', bad.length ? bad : 'ok');
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { autoQ: false, drs: false, text: 'instant', callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  for (let k = 0; k < 8; k++) { await a.evaluate(() => { document.querySelectorAll('.tCard,.lorePop').forEach((x) => { const bb = [...x.querySelectorAll('button')].pop(); if (bb) bb.click(); }); }); await a.waitForTimeout(250); }
  // how often call-scene sets become decisions
  const mix = await a.evaluate(() => { const V = window.__pc.VAR, L = window.__pc.L, S = window.__pc.S; let n = 0, act = 0, fidOk = 0; for (let i = 0; i < 60; i++) { const qs = V.mixQs(1, L.pickFacts(S, [1], 3)); qs.forEach((q) => { n++; if (q.act) { act++; if (q.fid) fidOk++; } }); } return { n, act, fidOk }; });
  console.log('no fid:', JSON.stringify(await a.evaluate(() => { const V = window.__pc.VAR, out = new Set(); for (let l = 0; l < 21; l++) for (let i = 0; i < 40; i++) { const q = V.decisionQ(l); if (q && !q.fid) out.add(l + ': ' + q.stem); } return [...out]; })));
  console.log('call-scene questions', JSON.stringify(mix), 'share', (mix.act / mix.n).toFixed(2));
  // play one decision wrong and one right inside a dialogue and read what follows
  const run = async (wrong) => {
    await a.evaluate((wrong) => { const pc = window.__pc, V = pc.VAR; const q = V.decisionQ(4); window.__dq = q; pc.dialogue([['castillo', 'Okay, here we go.'], ['q', q, 'castillo'], ['castillo', 'Let\'s keep moving.']], () => { window.__done = 1; }); }, wrong);
    const seen = []; let retry = false;
    for (let k = 0; k < 60; k++) { await a.waitForTimeout(120); const st = await a.evaluate((wrong) => { const d = document.getElementById('dlg'); if (d.hidden) return null; if (d.querySelector('.dlgRetry')) return 'RETRY'; const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { const q = window.__dq; (qb.find((x) => wrong ? +x.dataset.k !== q.c : +x.dataset.k === q.c)).click(); return 'pick:' + (document.querySelector('.dlgPlate small, #dlg small') || {}).textContent; } const t = (d.querySelector('.dlgTxt p, .dlgTxt') || {}).innerText || ''; d.click(); return 'line:' + t.slice(0, 90); }, wrong); if (st === null) break; if (st === 'RETRY') retry = true; if (seen[seen.length - 1] !== st) seen.push(st); }
    return { retry, seen: seen.slice(0, 7) };
  };
  console.log('WRONG', JSON.stringify(await run(true), null, 0));
  await a.waitForTimeout(500);
  console.log('RIGHT', JSON.stringify(await run(false), null, 0));
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close();
})();
