// conduct (conduct.js): the wrong choice is offered and works, Internal Affairs finds it at roll call, owning it or
// denying it changes the outcome on the ladder (a reprimand with a debuff for a small thing; termination for force
// you then lied about), the FIRED screen explains why, and starting over as a new cadet keeps every fact learned.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1280, height: 800 } }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  const url = 'http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle';
  await a.goto(url);
  await a.evaluate(() => { localStorage.clear(); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'k9', xp: 1300, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, facts: { f1: 1, f2: 1, f3: 1 }, stat: { shifts: 4 }, gear: { boots: 'boots1' }, items: { boots1: 1 } })); });
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const fail = [];
  const mig = await a.evaluate(() => ({ unit: window.__pc.S.unit, units: window.__pc.S.units }));
  if (mig.unit !== 'patrol' || Object.keys(mig.units).join() !== 'patrol') fail.push('old save not moved back to Patrol: ' + JSON.stringify(mig));
  const clear = async () => { for (let i = 0; i < 8; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|just patrol|got it|close|later/i.test(x.innerText) && x.offsetParent && !x.closest('#dlg') && !x.closest('.endCareer')); if (b) b.click(); }); await a.waitForTimeout(250); } };
  await a.waitForTimeout(2500); await clear();
  // play a dialogue to the end, choosing options whose text matches pick (or the first)
  const SEEN = [];
  const play = async (pick, shot) => { let shotDone = false;
    for (let s = 0; s < 80; s++) { const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; return { ch: [...d.querySelectorAll('.dlgOpts:not(.q) [data-k]:not([disabled])')].map((x) => x.innerText.replace(/\s+/g, ' ')), q: d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])').length, who: (d.querySelector('.dlgPlate b') || {}).innerText || '', text: (d.querySelector('#dlgP') || {}).innerText || '' }; });
      if (!st) return true; if (st.text && SEEN[SEEN.length - 1] !== st.text) SEEN.push(st.text); if (shot && !shotDone && /Croft/.test(st.who)) { shotDone = true; await a.waitForTimeout(700); await a.screenshot({ path: shot }); }
      if (st.ch.length) { const i = Math.max(0, st.ch.findIndex((t) => pick.test(t))); await a.evaluate((i) => document.querySelectorAll('#dlg .dlgOpts:not(.q) [data-k]:not([disabled])')[i].click(), i); await a.waitForTimeout(350); continue; }
      if (st.q) { await a.evaluate(() => { const q = window.__curQ; const b = document.querySelector('#dlg .dlgOpts.q [data-k="' + (Array.isArray(q.c) ? q.c[0] : q.c) + '"]'); b.click(); const ok = document.getElementById('dlgOk'); if (ok) { ok.disabled = false; ok.click(); } }); await a.waitForTimeout(1100); continue; }
      await a.evaluate(() => document.getElementById('dlg').click()); await a.waitForTimeout(160); }
    return false; };
  // 1) a small wrong (an errand in the patrol car), owned at the hearing: a reprimand and a debuff
  const com0 = await a.evaluate(() => window.__pc.stats().com);
  await a.evaluate(() => { const pc = window.__pc; const l = pc.COND.tempt({ title: 'Lockout call', text: '', where: 'Palmetto Row' }, 'castillo', false, 'errand'); pc.dlg(l); });
  await play(/fire lane/i);
  let st = await a.evaluate(() => window.__pc.COND.state.pending.map((p) => p.id));
  if (st.indexOf('errand') < 0) fail.push('the wrong choice left nothing for IA to find: ' + JSON.stringify(st));
  await a.evaluate(() => { const S = window.__pc.S; S.stat.shifts++; S.cond.pending.forEach((p) => { p.seen = true; }); window.__pc.COND.rollCall(() => { window.__rc = 1; }); });
  await play(/truth/i, 'w_conduct_ia.png');
  const after1 = await a.evaluate(() => ({ rc: window.__rc, file: window.__pc.S.cond.file.map((f) => f.out), com: window.__pc.stats().com, st: window.__pc.S.cond.standing }));
  // the hearing follows the officers' bill of rights: told who complained, shown the evidence, a representative, the law named
  const heard = SEEN.join(' | '); ['complaint comes from', 'recorded', 'fire lane', 'Lacombe', '112.532'].forEach((w) => { if (heard.indexOf(w) < 0) fail.push('hearing never said: ' + w); });
  if (!after1.rc || after1.file[0] !== 'Written reprimand' || !(after1.com < com0)) fail.push('owned minor offense: ' + JSON.stringify(after1) + ' com before ' + com0);
  // 2) force on someone who was only yelling, then denied: termination and the FIRED screen
  await a.evaluate(() => { const pc = window.__pc; const l = pc.COND.tempt({ title: 'Disturbance in progress', text: '', where: 'Eastgate Motel' }, 'castillo', false, 'shove'); pc.dlg(l); });
  await play(/shove/i);
  await a.evaluate(() => { const S = window.__pc.S; S.stat.shifts++; S.cond.pending.forEach((p) => { p.seen = true; }); window.__pc.COND.rollCall(() => {}); });
  await play(/deny/i);
  await a.waitForSelector('.endCareer.body', { timeout: 8000 }).catch(() => fail.push('no end-of-career screen'));
  const ec = await a.evaluate(() => { const e = document.querySelector('.endCareer'); return e ? { stamp: e.querySelector('.ecStamp').innerText, why: e.querySelector('.ecWhy').innerText } : null; });
  console.log('end screen', JSON.stringify(ec));
  if (!ec || ec.stamp !== 'FIRED') fail.push('expected FIRED, got ' + JSON.stringify(ec));
  await a.waitForTimeout(400); await a.screenshot({ path: 'w_conduct_fired.png' });
  // 3) start over: the facts stay, the career doesn't
  const factsBefore = await a.evaluate(() => { const S = window.__pc.S; S.facts = S.facts || {}; ['vo-a', 'vo-b', 'vo-c'].forEach((k) => { S.facts[k] = 1; }); return Object.keys(S.facts).length; });
  await a.evaluate(() => document.querySelector('.endCareer [data-e="new"]').click());
  await a.waitForTimeout(2500);
  const fresh = await a.evaluate(() => { const s = JSON.parse(localStorage.getItem('patrolcity:v1')); return { cs: s.cs, xp: s.xp, facts: Object.keys(s.facts || {}).length, past: (s.past || []).length, gear: s.gear }; });
  console.log('new cadet save', JSON.stringify(fresh));
  if (fresh.cs || fresh.xp || fresh.facts !== factsBefore || fresh.past !== 1 || (fresh.gear && Object.keys(fresh.gear).length)) fail.push('new cadet: ' + JSON.stringify(fresh));
  if (errs.length) fail.push(...errs.slice(0, 4));
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
