// more than one way through: every side case offers talk / look / by the book at its last scene and the closing card
// says how it was closed; each district's signature case plays its own route to its own ending
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 640 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], story: { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3 }, shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false, text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(3500);
  await a.evaluate(() => { const G = window.__pc.VAR.GAMES; Object.keys(G).forEach((k) => { G[k] = (done) => setTimeout(() => done(1), 50); }); window.__pc.S.x6 = true; document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); });
  // plays the open dialogue to the end: picks the choice whose text matches `want`, answers questions right; returns what it saw
  const drive = async (want) => { const seen = []; for (let i = 0; i < 120; i++) { await a.waitForTimeout(120);
    const st = await a.evaluate((want) => { document.querySelectorAll('.lorePop button').forEach((x) => { if (/patrol/i.test(x.innerText)) x.click(); }); document.querySelectorAll('.tCard').forEach((x) => x.click()); const pc = window.__pc; if (pc.curCall) pc.dropCall(); const d = document.getElementById('dlg'); if (document.querySelector('.twist')) return 'TWIST:' + document.querySelector('.twist h2').innerText;
      if (d.hidden) { const m = document.getElementById('modal'); if (!m.hidden && !m.querySelector('.chEnd')) { const x = m.querySelector('#mClose,#mDone,.qAct button'); if (x) x.click(); } return 'hidden'; } const qz = d.querySelector('.dlgQuiz') || (d.classList.contains('dlgQuiz') ? d : null), q = window.__curQ, bs = [...d.querySelectorAll('.dlgOpts button:not([disabled])')];
      if (bs.length && d.querySelector('.dlgOpts.q') && q) { const cs = q.multi ? q.c : [q.c]; cs.forEach((k) => { const x = d.querySelector('.dlgOpts.q [data-k="' + k + '"]'); if (x) x.click(); }); const ok = document.getElementById('dlgOk'); if (ok && !ok.disabled) ok.click(); return 'Q'; }
      if (bs.length) { const t = bs.map((x) => x.innerText.replace(/\s+/g, ' ')); let k = want ? t.findIndex((x) => x.toLowerCase().includes(want)) : -1; if (k < 0) k = 0; bs[k].click(); return 'C[' + t.join(' / ').slice(0, 150) + '] -> ' + t[k].slice(0, 40); }
      d.click(); return 'L:' + (d.querySelector('.dlgTxt') || d).innerText.replace(/\s+/g, ' ').slice(0, 70); }, want);
    if (st.startsWith('TWIST')) { seen.push(st); await a.waitForTimeout(1700); await a.evaluate(() => document.querySelector('.twist').click()); await a.waitForTimeout(600); continue; }
    if (st === 'hidden') { if (seen.length) break; continue; } if (st !== seen[seen.length - 1]) seen.push(st); } return seen; };
  const card = () => a.evaluate(() => { const m = document.getElementById('modal'); if (m.hidden || !m.querySelector('.chEnd')) { if (!m.hidden) { const x = m.querySelector('#mClose,#mDone'); if (x) x.click(); } return null; } const w = m.querySelector('.chWay'); const t = (m.querySelector('.chKick') || {}).innerText + ' | ' + (w ? w.innerText.replace(/\s+/g, ' ') : 'NO WAY LINE'); return t; });
  const shut = () => a.evaluate(() => { const x = document.querySelector('#modal:not([hidden]) #mDone'); if (x) x.click(); });
  // 1) a regular side case: the choice comes at the last scene, and the card says how it closed
  for (const [id, want] of [['pigeons', 'talk it through'], ['deadair', 'check the facts']]) {
    await a.evaluate((id) => { const pc = window.__pc, q = pc.SIDE.find((x) => x.id === id); pc.S.side[id] = q.steps.length - 1; pc.S.track = id; pc.playStep(q.steps[q.steps.length - 1]); }, id);
    const seen = await drive(want); await a.waitForTimeout(500); const c = await card(); console.log(id, '->', seen.filter((x) => x.startsWith('C[')).map((x) => x.slice(0, 120)).join(' || ')); console.log('   card:', c);
    if (!c || !/Talked it through|Looked into it/i.test(c)) errs.push(id + ': closing card has no way line'); if (!seen.some((x) => /Talk it through with them/.test(x))) errs.push(id + ': no way choice'); await shut(); await a.waitForTimeout(300); }
  // 2) the signature cases, one route each
  const routes = process.env.ONLY ? { sigCentral: 'watch the zone' } : { sigCentral: 'watch the zone', sigEast: 'neighbors', sigRiver: 'friday', sigInd: 'backup alarm', sigJustice: 'hedge' };
  for (const [id, want] of Object.entries(routes)) {
    const d = await a.evaluate((id) => window.__pc.SIDE.find((x) => x.id === id).d, id);
    if (await a.evaluate(() => window.__pc.W.did) !== d) { await a.evaluate((d) => window.__pc.travel(d), d); await a.waitForFunction((d) => window.__pc.W && window.__pc.W.did === d, d, { timeout: 30000 }); await a.waitForTimeout(3000); await a.evaluate(() => { document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); }); await drive(''); }
    const steps = []; await a.evaluate((id) => { const pc = window.__pc; pc.S.side[id] = 0; pc.S.track = id; }, id);
    for (let n = 0; n < 4; n++) { const go = await a.evaluate((id) => { const pc = window.__pc, A = pc.activeQ(); if (!A || !A.q || A.q.id !== id || !A.step) return null; pc.playStep(A.step); return A.step.at; }, id); if (!go) break;
      const seen = await drive(want); steps.push(go + (seen.find((x) => x.startsWith('TWIST')) ? ' [' + seen.find((x) => x.startsWith('TWIST')) + ']' : '')); await a.waitForTimeout(400); if (await card()) break; }
    if (id === 'sigCentral') await a.evaluate(() => [...document.body.children].forEach((x) => { if (x.id !== 'modal' && x.id !== 'view') x.style.visibility = 'hidden'; })); if (id === 'sigCentral') await a.locator('#modal .chEnd').screenshot({ path: 'tways_card.png' }).catch((e) => console.log('shot', e.message.slice(0, 80)));
    const c = await card(); console.log(id, ':', steps.join(' > ')); console.log('   card:', c, JSON.stringify(await a.evaluate(() => window.__pc.S.wayN))); if (!c || !/Signature case closed/i.test(c) || /NO WAY/.test(c)) errs.push(id + ': no signature closing card'); if (!steps.some((x) => /TWIST/.test(x))) errs.push(id + ': no ending moment'); await shut(); await a.waitForTimeout(300); }
  console.log('tally', JSON.stringify(await a.evaluate(() => window.__pc.S.wayN)));
  console.log(errs.length ? errs.slice(0, 4) : 'no errors'); await b.close(); })();
