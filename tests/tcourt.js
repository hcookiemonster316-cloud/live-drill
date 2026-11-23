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
  // a clean report: the defense lets it go
  await a.evaluate(() => { const pc = window.__pc; pc.COURT.file({ how: 'air', wrong: 0, filed: true, procOk: 3, where: 'Elm St' }); const p = pc.S.court.pend[pc.S.court.pend.length - 1]; pc.COURT.testify(p); });
  const seen2 = await drive('xx'); if (!seen2.some((x) => /line for line/.test(x))) errs.push('a clean report was still attacked');
  await a.waitForFunction(() => window.__pc.S.court.hist.length === 2, null, { timeout: 30000 }).catch(() => errs.push('second verdict missing'));
  console.log('second', JSON.stringify(await a.evaluate(() => window.__pc.S.court.hist[1])));
  console.log(errs.length ? errs.slice(0, 4).join('\n') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
