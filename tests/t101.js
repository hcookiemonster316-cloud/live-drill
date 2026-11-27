const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 2 }, cards: { ch0: 1 }, cfg: { autoQ: false, drs: false }, npc: { delgado: 5 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const clear = async () => { for (let k = 0; k < 10; k++) { const busy = await a.evaluate(() => { document.querySelectorAll('.tCard,.lorePop').forEach((x) => x.remove()); const d = document.getElementById('dlg'); if (!d.hidden) { const o = d.querySelector('.dlgOpts button'); if (o) o.click(); else d.click(); return 1; } const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|save for later|back to work|^close$/i.test(x.innerText.trim()) && x.offsetParent); if (b) { b.click(); return 1; } return 0; }); if (!busy) break; await a.waitForTimeout(250); } };
  await clear();
  // breathers: heavy call -> light scene once free; each scene plays through without errors
  const seen = [];
  for (const k of ['coffee', 'dog', 'kid', 'talk', 'friend']) { await a.evaluate((k) => { const S = window.__pc.S; S.pace.seen = {}; Object.keys(window.__pc.PACE.SCENES).forEach((x) => { if (x !== k) S.pace.seen[x] = Date.now(); }); }, k);
    await a.evaluate(() => { const P = window.__pc.PACE; P.tick(999); P.afterCall({ les: 10, prio: 2 }); P.tick(10); }); const early = await a.evaluate(() => !document.getElementById('dlg').hidden);
    await a.evaluate(() => window.__pc.PACE.tick(20)); await a.waitForTimeout(400); const txt = await a.evaluate(() => document.getElementById('dlg').innerText.replace(/\s+/g, ' ').slice(0, 90));
    if (k === 'friend') await a.screenshot({ path: 't101a.png' }); seen.push(k + (early ? ' EARLY' : '') + ': ' + txt + (txt ? '' : ' ' + JSON.stringify(await a.evaluate(() => window.__pc.PACE.dbg)))); await clear(); }
  console.log(seen.join('\n'));
  // hints
  const h = await a.evaluate(() => { const pc = window.__pc, P = pc.PACE, S = pc.S, out = {}; out.now = P.hint(); const sv = S.track; S.side = S.side || {}; const q = (pc.SIDE || []).find((x) => x.d === 1); out.tracked = q ? (S.track = q.id, S.side[q.id] = 0, P.hint()) : 'no side quest list'; S.track = sv; if (q) delete S.side[q.id]; return out; });
  console.log('hint now:', h.now); console.log('hint other district:', h.tracked);
  const auto = await a.evaluate(() => { const P = window.__pc.PACE; P.tick(.25); P.tick(.25); for (let i = 0; i < 13; i++) P.tick(25); return P.lastHint + ' | ' + JSON.stringify(P.dbg); }); console.log('auto hint:', auto);
  await a.evaluate(() => window.__pc.PATH.panel()); await a.waitForTimeout(300); await a.click('#pathHint'); await a.waitForTimeout(200); console.log('path hint:', await a.evaluate(() => document.getElementById('pathHintT').innerText)); await a.screenshot({ path: 't101b.png' });
  console.log(errs.length ? errs : 'no errors'); await b.close(); })();
