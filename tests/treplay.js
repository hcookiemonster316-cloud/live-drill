// every cadet sees a different city (replay.js): a thread is picked that this browser's earlier cadets haven't seen, its
// beats arrive as calls are cleared (radio or work cell, plus the case board), the third is the twist, the end is a
// choice that pays off only the right way, the wrong one reaches Internal Affairs, and graduation tells you how it ended.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => { localStorage.setItem('patrolcity:threads', JSON.stringify({ seen: ['roof', 'dogs', 'plates'] })); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2, 3], shift: 'day', unit: 'patrol', xp: 900, cash: 50, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, arcs: { walt: 5 } })); });
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W && window.__pc.RPL, null, { timeout: 20000 });
  const clear = async () => a.evaluate(() => { document.querySelectorAll('.lorePop [data-a]:not([data-a="read"]), .promo button, .rv [data-a="keep"]').forEach((x) => x.click()); const d = document.getElementById('mDone') || document.getElementById('mClose'); if (d && !document.getElementById('modal').hidden) d.click(); });
  const t0 = await a.evaluate(() => window.__pc.RPL.status()); if (t0.id !== 'copper') fail.push('picked a seen thread: ' + t0.id);
  // clear calls one by one and watch the beats land
  for (let i = 0; i < 20; i++) { await a.evaluate(() => { const pc = window.__pc; pc.S.calls = (pc.S.calls || 0) + 1; pc.RPL.afterCall(); }); }
  await a.waitForTimeout(3500); await clear();
  const mid = await a.evaluate(() => ({ st: window.__pc.RPL.status(), notes: (window.__pc.S.olog || []).filter((r) => /Copper Ring/.test(r[2])).length, radio: document.getElementById('radio').textContent }));
  if (mid.st.beat < 3) fail.push('only ' + mid.st.beat + ' beats arrived'); if (mid.notes < 3) fail.push('case board has ' + mid.notes + ' thread notes');
  // the end: a dialogue with three choices; take the right one
  await a.evaluate(() => { const pc = window.__pc; pc.S.calls++; pc.RPL.afterCall(); });
  await a.waitForFunction(() => !document.getElementById('dlg').hidden, null, { timeout: 15000 }).catch(() => fail.push('no ending scene'));
  for (let i = 0; i < 8; i++) { if (await a.evaluate(() => document.querySelectorAll('#dlg .dlgOpts button').length >= 3)) break; await a.evaluate(() => document.getElementById('dlg').click()); await a.waitForTimeout(500); }
  if (!(await a.evaluate(() => document.querySelectorAll('#dlg .dlgOpts button').length >= 3))) fail.push('no ending choice');
  await a.screenshot({ path: (process.env.SHOTS || require('os').tmpdir()) + '/replay-end.png' });
  const xp0 = await a.evaluate(() => window.__pc.S.xp);
  await a.evaluate(() => { const o = [...document.querySelectorAll('#dlg .dlgOpts button')].find((x) => /work it with Hale/.test(x.textContent)); if (o) o.click(); });
  for (let i = 0; i < 12; i++) { await a.waitForTimeout(400); await a.evaluate(() => { const d = document.getElementById('dlg'); if (!d.hidden) d.click(); }); }
  const end = await a.evaluate(() => ({ t: window.__pc.S.thread, xp: window.__pc.S.xp, meta: JSON.parse(localStorage.getItem('patrolcity:threads')), epi: window.__pc.RPL.epilogue([]) }));
  if (!end.t.done || !end.t.good) fail.push('thread not closed well: ' + JSON.stringify(end.t)); if (!(end.xp > xp0)) fail.push('no RP for closing it');
  if (!end.meta.closed || end.meta.closed.copper !== 'good') fail.push('outcome not remembered for the next cadet');
  if (!end.epi.length || !/church/.test(end.epi[0][2])) fail.push('epilogue missing the thread');
  // the wrong way reaches Internal Affairs
  const ia = await a.evaluate(() => { const pc = window.__pc; pc.S.thread.done = 0; const n0 = (pc.COND.state.pending || []).length; pc.RPL.settle(1); return { n: (pc.COND.state.pending || []).length - n0, good: pc.S.thread.good }; });
  if (ia.n !== 1 || ia.good) fail.push('wrong choice did not reach IA: ' + JSON.stringify(ia));
  // graduation: the epilogue shows the thread and finished friendship stories
  const fin = await a.evaluate(() => { const pc = window.__pc, h = pc.FIN.ending({ right: 9, n: 10 }).html; document.getElementById('modal').hidden = false; pc.openModal(h); return h; });
  if (!/Where they are now/.test(fin) || !/Copper Ring/.test(fin) || !/Abernathy/.test(fin)) fail.push('graduation epilogue incomplete');
  await a.waitForTimeout(400); await a.screenshot({ path: (process.env.SHOTS || require('os').tmpdir()) + '/replay-fin.png' });
  // a regular remembers their finished story
  const mem = await a.evaluate(() => { const pc = window.__pc; return pc.S.arcs.walt; }); if (mem !== 5) fail.push('arc save lost');
  console.log(JSON.stringify({ thread: t0.id, beats: mid.st.beat, notes: mid.notes }));
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
