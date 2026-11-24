// repeat offenders: dispatch sends a regular now and then; the person remembers how you handled them last time (their
// line and mood change), each meeting advances them, and the fourth meeting settles it by how you treated them: talk it
// through every time and they turn it around, become an ally and bring you the trust tip call
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
  // 2) four meetings with Dale, talking it through every time
  const log = [];
  for (let m = 0; m < 4; m++) {
    for (let i = 0; i < 60; i++) { const open = await a.evaluate(() => { const m = document.getElementById('modal'); if (m.hidden) return false; const bs = [...m.querySelectorAll('button')].filter((x) => x.offsetParent && !x.disabled); const r = bs.find((x) => /^On \d/.test(x.innerText)) || bs.find((x) => /Done|Close|File|Carry|Continue|Submit/i.test(x.innerText)) || bs[bs.length - 1]; if (r) r.click(); return true; }); if (!open) break; await a.waitForTimeout(250); } /* file the last call's report first */
    const ok = await a.evaluate(() => { const pc = window.__pc; pc.S.mem.shift++; const r0 = Math.random; Math.random = () => 0; const t = pc.REPS.call(0, pc.MEM.shiftNo); Math.random = r0; if (!t || t.rep.id !== 'dale') return null;
      const c = { les: t.les0, title: t[0], prio: t[1], text: t[3], x: pc.P.x, y: pc.P.y, where: 'Main St', kind: 'street', t0: 0, accepted: true, rep: t.rep }; pc.openCallScene(c); return t[0]; });
    if (!ok) { errs.push('meeting ' + (m + 1) + ': no call for Dale'); break; }
    if (m === 1) { await a.waitForSelector('#dlg:not([hidden])'); await a.waitForTimeout(200); }
    const seen = await drive('talk it through'); const said = seen.filter((x) => /Dale|two new tires|treating me like a person|Fourth time/.test(x));
    const r = await a.evaluate(() => JSON.stringify(window.__pc.S.reps.dale)); log.push(ok + ' -> ' + r); console.log('meeting', m + 1, ok, '|', said.join(' || ').slice(0, 400)); if (process.env.V) console.log(seen.join('\n')); console.log('   state', r);
    if (m === 1 && !said.some((x) => /two new tires/.test(x))) errs.push('meeting 2: Dale did not remember being talked to');
    if (m === 3 && !said.some((x) => /treating me like a person/.test(x))) errs.push('meeting 4: no good ending line');
    let fin = await a.waitForFunction((m) => (window.__pc.S.reps.dale || {}).st > m, m, { timeout: 20000 }).then(() => true).catch(() => false);
    if (!fin) { /* something cut in (a lore pop, a reward card): clear it and run the meeting again once */ console.log('retrying meeting', m + 1, JSON.stringify(await a.evaluate(() => ({ dlg: document.getElementById('dlg').hidden, modal: document.getElementById('modal').hidden, mt: document.getElementById('modal').innerText.slice(0, 80), lore: document.querySelectorAll('.lorePop').length, paused: window.__pc.dbg().paused }))));
      await a.evaluate(() => { document.querySelectorAll('.lorePop .lpBtns button').forEach((x) => x.click()); const md = document.getElementById('modal'); if (!md.hidden) { const x = md.querySelector('#mDone,#mClose,.qAct button'); if (x) x.click(); } const pc = window.__pc; if (pc.curCall) pc.dropCall(); });
      await a.evaluate(() => { const pc = window.__pc, r0 = Math.random; Math.random = () => 0; const t = pc.REPS.call(0, pc.MEM.shiftNo); Math.random = r0; if (t && t.rep.id === 'dale') pc.openCallScene({ les: t.les0, title: t[0], prio: t[1], text: t[3], x: pc.P.x, y: pc.P.y, where: 'Main St', kind: 'street', t0: 0, accepted: true, rep: t.rep }); });
      await drive('talk it through'); fin = await a.waitForFunction((m) => (window.__pc.S.reps.dale || {}).st > m, m, { timeout: 20000 }).then(() => true).catch(() => false); }
    if (!fin) errs.push('meeting ' + (m + 1) + ' did not finish'); await a.waitForTimeout(400); }
  const end = await a.evaluate(() => ({ done: (window.__pc.S.reps.dale || {}).done, ally: window.__pc.REPS.ally(0), toast: [...document.querySelectorAll('.toast,#toast')].map((x) => x.innerText).join(' | ') }));
  console.log('end', JSON.stringify(end)); if (end.done !== 'good' || end.ally !== 'Dale Hutchins') errs.push('Dale did not turn it around: ' + JSON.stringify(end) + ' ' + JSON.stringify(await a.evaluate(() => window.__pc.S.reps.dale)));
  // 3) someone handled hard comes back angry or with a story
  const hard = await a.evaluate(() => { const pc = window.__pc; pc.S.reps.tina = { st: 1, w: ['enforce'], last: 'enforce', right: 0, sh: -5 }; const L = pc.REPS.lines({ id: 'tina', did: 0, stage: 1 }); return { intent: L.intent, said: L.lines.map((x) => x[1]).join(' ') }; });
  console.log('hard', JSON.stringify(hard)); if (!/angry|lying/.test(hard.intent) || !/call my school/.test(hard.said)) errs.push('enforced regular did not come back sore');
  // 4) dispatch picks a regular on its own now and then
  const n = await a.evaluate(() => { const pc = window.__pc; let hits = 0; for (let i = 0; i < 300 && !hits; i++) { pc.dispatchCall(); const c = pc.curCall; if (c && c.rep) hits++; pc.dropCall(); } return hits; });
  console.log('dispatch offered a regular:', n); if (!n) errs.push('dispatch never offered a repeat offender');
  console.log(errs.length ? errs.slice(0, 4).join('\n') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
