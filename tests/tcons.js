// delayed consequences: a call where something got missed plants a later call at the same address; the next shift's
// briefing says it's waiting, dispatch sends it back to the same place, and getting it right closes it
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 640 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2, 3, 4], story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false, text: 'instant', pursuits: false } })));
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
  // 1) a call that missed something plants a consequence for a later shift
  const k = await a.evaluate(() => { const pc = window.__pc, r0 = Math.random; Math.random = () => 0; const k = pc.MEM.plant({ title: 'Car with bald tires', les: 0, where: 'Oak Ave', x: pc.P.x + 2, y: pc.P.y, wrap: 'case' }, { right: 1, n: 3 }); Math.random = r0; return k; });
  console.log('planted', k); if (k !== 'missed') errs.push('nothing planted for a missed call: ' + k);
  // 2) next shift: the briefing says what is waiting
  const br = await a.evaluate(() => { const pc = window.__pc; pc.S.mem.shift++; pc.MEM.briefing(); const w = document.querySelector('#modal .memRow.wait'); return w ? w.innerText : null; });
  await a.waitForTimeout(500); await a.locator('#modal').screenshot({ path: (process.argv[2] || 'tests/out') + '/tcons_brief.png' }).catch(() => {});
  console.log('briefing', br); if (!br || !/Oak Ave/.test(br)) errs.push('briefing did not mention the open consequence');
  await a.evaluate(() => { const x = document.querySelector('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone'); if (x) x.click(); });
  // the mystery board lists it as an open thread, with what led to it
  const th = await a.evaluate(() => { window.__pc.EP.board(); const t = document.querySelector('.mbThread'); const out = t ? t.innerText : null; window.__pc.closeModal(); return out; });
  console.log('board thread', JSON.stringify(th)); if (!th || !/Oak Ave/.test(th) || !/got 1 of 3 right/.test(th)) errs.push('board does not show the open thread');
  // 3) dispatch sends it, at the same address
  const dc = await a.evaluate(() => { const pc = window.__pc; for (let i = 0; i < 400; i++) { pc.dispatchCall(); const c = pc.curCall; if (c && c.cons) { const o = { title: c.title, where: c.where, les: c.les }; return o; } pc.dropCall(); } return null; });
  console.log('dispatch', JSON.stringify(dc)); if (!dc || dc.where !== 'Oak Ave' || !/Breakdown/.test(dc.title)) errs.push('dispatch did not send the consequence call');
  // 4) going back and getting it right closes it
  await a.evaluate(() => { const pc = window.__pc, c = pc.curCall; c.accepted = true; pc.openCallScene(c); });
  const seen = await drive('talk it through'); console.log(seen.filter((x) => /got missed|turned into/.test(x)).join(' || '));
  if (!seen.some((x) => /you took "Car with bald tires" here and got 1 of 3 right/.test(x))) errs.push('the call did not say what led to it'); if (!seen.some((x) => /This is what it turned into/.test(x))) errs.push('scene did not say what came back');
  await a.waitForFunction(() => !window.__pc.MEM.seeds.length, null, { timeout: 30000 }).catch(() => errs.push('consequence still open after the call'));
  const left = await a.evaluate(() => ({ seeds: window.__pc.MEM.seeds.length, deeds: window.__pc.MEM.deeds.filter((d) => d.where === 'Oak Ave').map((d) => d.k) }));
  console.log('after', JSON.stringify(left));
  console.log(errs.length ? errs.slice(0, 4).join('\n') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
