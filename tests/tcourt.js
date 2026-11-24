// reports go to court: a pursuit arrest files a case, two shifts later you're called to testify on your own; the defense
// reads your report against the radio log, owning a mistake beats defending it, the prosecutor needs the chapter's case
// law, and the verdict lands in your case file and on the mystery board
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 640 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false, text: 'instant', pursuits: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W && window.__booted, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  await a.addStyleTag({ content: '.lorePop,.tCard{display:none!important}' });
  await a.evaluate(() => { const G = window.__pc.VAR.GAMES; Object.keys(G).forEach((k) => { G[k] = (done) => setTimeout(() => done(1), 50); }); document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); });
  // plays the open dialogue to the end, picking the choice that matches `want`, answering questions right
  let shot = 0; const drive = async (want) => { const seen = []; let hid = 0; for (let i = 0; i < 400; i++) { await a.waitForTimeout(100);
    if (!shot && await a.evaluate(() => /two new tires/.test(document.getElementById('dlg').innerText))) { await a.waitForTimeout(700); await a.evaluate(() => [...document.body.children].forEach((x) => { if (!/^(view|dlg|vign|hTop|hBot)$/.test(x.id)) x.dataset.v = x.style.visibility, x.style.visibility = 'hidden'; })); await a.screenshot({ path: (process.argv[2] || 'tests/out') + '/treps_meet2.png' }); await a.evaluate(() => [...document.body.children].forEach((x) => { if (x.dataset.v != null) { x.style.visibility = x.dataset.v; delete x.dataset.v; } })); }
    const st = await a.evaluate((want) => { const d = document.getElementById('dlg'); if (d.hidden) { [...document.querySelectorAll('button')].filter((x) => x.offsetParent && /^(Carry on|Got it|Continue|Nice|Claim later)$/i.test(x.innerText.trim())).forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const x = m.querySelector('#mClose,#mDone,.qAct button'); if (x) x.click(); } return 'hidden'; } const q = window.__curQ, bs = [...d.querySelectorAll('.dlgOpts button:not([disabled])')].filter((x) => x.offsetParent && !x.__t);
      if (bs.length && d.querySelector('.dlgOpts.q') && q) { (q.multi ? q.c : [q.c]).forEach((k) => { const x = d.querySelector('.dlgOpts.q [data-k="' + k + '"]'); if (x) x.click(); }); const ok = document.getElementById('dlgOk'); if (ok && !ok.disabled) ok.click(); return 'Q'; }
      if (bs.length) { const t = bs.map((x) => x.innerText.replace(/\s+/g, ' ')); let k = t.findIndex((x) => x.toLowerCase().includes(want)); if (k < 0) k = 0; bs.forEach((x) => { x.__t = 1; }); bs[k].click(); return 'C:' + t[k].slice(0, 40); }
      const who = (d.querySelector('.dlgName') || {}).innerText || ''; const txt = 'L:' + who.replace(/\s+/g, ' ') + ': ' + (d.querySelector('.dlgTxt') || d).innerText.replace(/\s+/g, ' ').slice(0, 300); d.click(); return txt; }, want);
    if (st === 'hidden') { hid++; if (seen.length && hid > 25 && !(await a.evaluate(() => window.__pc.dbg().paused))) break; continue; } hid = 0; if (st !== seen[seen.length - 1]) seen.push(st); if (/two new tires/.test(st) && !shot) { shot = 1; } else if (shot === 1) { shot = 2; } } return seen; };
  await a.evaluate(() => { window.__pc.S.cfg.noAmbient = true; }); /* no street moments in the middle of testimony */
  // wait until nothing is open, closing any debrief that lands late (it can open a beat after the dialogue ends)
  const idle = async () => { for (let i = 0; i < 60; i++) { const busy = await a.evaluate(() => { const m = document.getElementById('modal'); if (!m.hidden) { const x = m.querySelector('#mDone,#mClose'); if (x) x.click(); } return !document.getElementById('dlg').hidden || !m.hidden; }); if (!busy) { await a.waitForTimeout(400); if (await a.evaluate(() => document.getElementById('dlg').hidden && document.getElementById('modal').hidden)) return; } await a.waitForTimeout(250); } };
  // if a verdict didn't land (another dialogue can cut in), say what was on screen and run the testimony once more
  const ensure = async (n, want) => { for (let k = 0; k < 2; k++) { if (await a.waitForFunction((n) => window.__pc.S.court.hist.length >= n, n, { timeout: 15000 }).then(() => true).catch(() => false)) return true;
    console.log('retrying testimony', JSON.stringify(await a.evaluate(() => ({ dlg: document.getElementById('dlg').hidden, dt: document.getElementById('dlg').innerText.slice(0, 120), modal: document.getElementById('modal').hidden, mt: document.getElementById('modal').innerText.slice(0, 80), pend: window.__pc.S.court.pend.length, hist: window.__pc.S.court.hist.length }))));
    await idle(); await a.evaluate(() => { const pc = window.__pc, P = pc.S.court.pend; if (P.length) pc.COURT.testify(P[P.length - 1]); }); await drive(want); } return false; };
  // a pursuit arrest whose report missed once
  await a.evaluate(() => { const pc = window.__pc; pc.COURT.file({ how: 'term', wrong: 1, filed: true, procOk: 3, where: 'Palm Ave' }); });
  const th = await a.evaluate(() => { window.__pc.EP.board(); const t = [...document.querySelectorAll('.mbThread')].map((x) => x.innerText.replace(/\s+/g, ' ')); window.__pc.closeModal(); return t; });
  console.log('board', JSON.stringify(th)); if (!th.some((t) => /Court date.*Palm Ave.*doesn't match the radio log/.test(t))) errs.push('court date missing from the board');
  // two shifts later it starts on its own
  await a.evaluate(() => { const pc = window.__pc; pc.S.mem.shift += 2; pc.COURT.onShift(); });
  const w = await a.evaluate(() => window.__pc.COURT.waiting); console.log('called in', w, 's'); if (!(w > 0)) errs.push('a due case did not schedule court');
  await a.evaluate(() => { const pc = window.__pc; if (pc.curCall) pc.dropCall(); document.querySelectorAll('.lorePop .lpBtns button').forEach((x) => x.click()); pc.COURT.testify(pc.S.court.pend[0]); });
  await a.waitForSelector('#dlg:not([hidden])', { timeout: 15000 }).catch(() => errs.push('court did not open'));
  await a.waitForTimeout(600); await a.screenshot({ path: (process.argv[2] || 'tests/out') + '/tcourt_open.png' });
  const seen = await drive('own it'); console.log(seen.filter((x) => /^C:|Keane|Fenwick|report/.test(x)).join('\n').slice(0, 900));
  await a.waitForFunction(() => (window.__pc.S.court.hist || []).length, null, { timeout: 30000 }).catch(() => errs.push('no verdict'));
  const h = await a.evaluate(() => window.__pc.S.court); console.log('court', JSON.stringify(h));
  const last = h.hist[h.hist.length - 1] || {}; if (last.honest !== true || last.paper !== 1) errs.push('owning the mistake was not credited'); if (h.pend.length) errs.push('case still pending');
  if (!seen.some((x) => /^C:.*The radio log\. My report/.test(x))) errs.push('the defense did not raise the report');
  const cf = await a.evaluate(() => window.__pc.CASE.search('courthouse Palm').hits.map((e) => e.kind + ': ' + e.text)); console.log('case file', JSON.stringify(cf)); if (!cf.some((t) => /^Court transcript/.test(t))) errs.push('verdict not in the case file');
  await idle();
  // a clean report: the defense lets it go
  await a.evaluate(() => { const pc = window.__pc; if (pc.curCall) pc.dropCall(); pc.COURT.file({ how: 'air', wrong: 0, filed: true, procOk: 3, where: 'Elm St' }); const p = pc.S.court.pend[pc.S.court.pend.length - 1]; pc.COURT.testify(p); });
  const seen2 = await drive('xx'); if (!seen2.some((x) => /line for line/.test(x))) errs.push('a clean report was still attacked');
  if (!(await ensure(2, 'xx'))) errs.push('second verdict missing');
  console.log('second', JSON.stringify(await a.evaluate(() => window.__pc.S.court.hist[1])));
  await idle(); if (process.env.V) { console.log('state', JSON.stringify(await a.evaluate(() => ({ dlg: document.getElementById('dlg').hidden, modal: document.getElementById('modal').hidden, mt: document.getElementById('modal').innerText.slice(0, 200), paused: window.__pc.dbg().paused, pend: window.__pc.S.court.pend.length, hist: window.__pc.S.court.hist.length })))); await a.screenshot({ path: 'tests/out/tcourt_dbg.png' }); }
  // an ordinary arrest: the defense goes after the step you skipped, owning it is credited
  await a.evaluate(() => { const pc = window.__pc; if (pc.curCall) pc.dropCall(); pc.COURT.file({ how: 'arrest', les: 0, miss: ['cuffs'], wrong: 0, filed: true, procOk: 2, where: 'Oak St', title: 'Warrant service' }); pc.COURT.testify(pc.S.court.pend[pc.S.court.pend.length - 1]); });
  const seen3 = await drive('should have'); 
  if (!(await ensure(3, 'should have'))) errs.push('arrest verdict missing');
  const h3 = await a.evaluate(() => window.__pc.S.court.hist[2]); console.log('arrest', JSON.stringify(h3)); if (!h3 || h3.honest !== true || h3.how !== 'arrest' || !/owned it/.test(h3.words)) errs.push('arrest testimony not credited'); if (!h3 || !/double-lock/.test(h3.words)) errs.push('the defense did not raise the skipped step');
  await idle();
  // a clean arrest that holds: the block where it happened hears about it
  const k0 = await a.evaluate(() => { const pc = window.__pc, P = pc.P, k = Math.floor((P.x - 2) / 11) + ',' + Math.floor((P.y - 2) / 11); pc.S.btrust = pc.S.btrust || {}; pc.S.btrust[pc.W.did] = pc.S.btrust[pc.W.did] || {}; pc.S.btrust[pc.W.did][k] = 1;
    pc.COURT.file({ how: 'arrest', les: 0, miss: [], wrong: 0, filed: true, procOk: 3, where: 'Main St', x: P.x, y: P.y, did: pc.W.did, title: 'Arrest warrant' }); pc.COURT.testify(pc.S.court.pend[pc.S.court.pend.length - 1]); return k; });
  await drive('xx'); if (!(await ensure(4, 'xx'))) errs.push('clean arrest verdict missing');
  const h4 = await a.evaluate((k) => ({ v: (window.__pc.S.court.hist[3] || {}).v, t: window.__pc.S.btrust[window.__pc.W.did][k] }), k0); console.log('clean arrest', JSON.stringify(h4)); if (h4.v === 'held' && h4.t !== 3) errs.push('the block did not hear the case held');
  if (h4.v !== 'held') errs.push('a clean arrest with right answers did not hold: ' + h4.v);
  // the real thing: an arrest call ends and files its own case, with the steps you skipped
  await a.evaluate(() => { const pc = window.__pc; pc.S.court.pend = []; window.__ac0 = pc.EP.afterCall; pc.EP.afterCall = (c, done) => done([]); /* no scene or report game in between: this checks the filing */ const c = { les: 0, title: 'Arrest warrant at the motel', prio: 2, text: 'Serve the warrant.', x: pc.P.x, y: pc.P.y, where: 'Main St', kind: 'street', t0: 0, accepted: true }; pc.openCallScene(c); });
  const s5 = await drive('from cover'); if (process.env.V) console.log(s5.join('\n')); let pf = null; for (let i = 0; i < 60 && !(pf = await a.evaluate(() => JSON.parse(JSON.stringify(window.__pc.S.court.pend.find((x) => x.how === 'arrest') || null)))); i++) { await a.evaluate(() => { const r = document.querySelector('.rpt [data-k]:not([disabled])'); if (r) r.click(); }); await a.waitForTimeout(500); } /* fill in the incident report if one is asked for */
  if (!pf) errs.push('an arrest call did not file a case');
  console.log('filed', JSON.stringify(pf)); if (!pf || pf.how !== 'arrest' || pf.miss.length !== 3 - pf.proc) errs.push('arrest case filed wrong: ' + JSON.stringify(pf));
  // a case that falls apart sends the call back to the street it started on
  const back = await a.evaluate(() => { const pc = window.__pc; pc.MEM.walked({ where: 'Oak St', x: pc.P.x, y: pc.P.y, did: pc.W.did, les: 0, title: 'Warrant service' }); pc.S.mem.shift += 1; const r0 = Math.random; Math.random = () => 0; const t = pc.MEM.dueCall(pc.W.did); Math.random = r0; return t ? { title: t[0], line: pc.MEM.consLine(t.cons) } : null; });
  console.log('back', JSON.stringify(back)); if (!back || !/back on Oak St/.test(back.title) || !/fell apart in court/.test(back.line)) errs.push('a lost case did not come back to the street');
  console.log(errs.length ? errs.slice(0, 4).join('\n') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
