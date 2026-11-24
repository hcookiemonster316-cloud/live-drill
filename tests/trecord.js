// a city that shows your record: block trust shows on the street (flowers and a bench where they trust you, plywood
// and litter where they don't), people wave or turn away as you pass, and a block that was trouble and comes around
// throws a block party you can stop by
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 640 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false, text: 'instant', pursuits: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W && window.__booted, null, { timeout: 20000 }); await a.waitForTimeout(1500);
  await a.addStyleTag({ content: '.lorePop,.tCard{display:none!important}' });
  await a.evaluate(() => document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()));
  // 1) pick the block the player stands next to and the one beside it
  const r = await a.evaluate(() => { const pc = window.__pc, W = pc.W, P = pc.P, did = W.did; const lots = W.lots.slice().sort((p, q) => Math.hypot(p.bx * 11 + 7 - P.x, p.by * 11 + 7 - P.y) - Math.hypot(q.bx * 11 + 7 - P.x, q.by * 11 + 7 - P.y));
    const good = lots[0], bad = lots.find((l) => l.bld && (l.bx !== good.bx || l.by !== good.by)) || lots[1]; const kg = good.bx + ',' + good.by, kb = bad.bx + ',' + bad.by;
    pc.S.reps = Object.assign(pc.S.reps || {}, { dale: { st: 4, done: 'good', w: ['talk'], right: 3 } }); /* a regular who turned it around */ pc.S.btrust = pc.S.btrust || {}; pc.S.btrust[did] = { [kb]: 0 }; pc.S.bmin = { [did]: { [kg]: -5 } };
    // move the player onto the good block's sidewalk; trust moves where the player stands
    P.x = good.bx * 11 + 2 + 5; P.y = good.by * 11 + 2 + 9.5;
    const rec = () => W.props.filter((p) => p.rec).map((p) => p.t + '@' + Math.floor((p.x - 2) / 11) + ',' + Math.floor((p.y - 2) / 11));
    pc.S.btrust[did][kg] = 2; pc.blockTrust(3); const at5 = rec(); const toast1 = [...document.querySelectorAll('.toast,#toast')].map((x) => x.innerText).join(' | ');
    pc.blockTrust(3); const at8 = rec(); const party = JSON.stringify(pc.S.bparty || {});
    return { did, kg, kb, at5, at8, party, toast1 }; });
  const wl = await a.evaluate(() => window.__pc.WL.log.map((x) => x.text)); console.log('shift log', JSON.stringify(wl).slice(0, 300)); if (!wl.some((t) => /Storefronts are getting fixed up/.test(t))) errs.push('the shift log missed the block coming around');
  console.log('blocks', r.kg, r.kb); console.log('at +5', r.at5.join(' ')); console.log('at +8', r.at8.join(' ')); console.log('party', r.party);
  if (!r.at5.some((x) => x === 'flowers@' + r.kg)) errs.push('no flowers on a block at +5');
  if (!r.at8.some((x) => x === 'bench@' + r.kg)) errs.push('no bench on a block at +8');
  if (!/"k":"/.test(r.party) || !r.at8.some((x) => x.startsWith('lights@'))) errs.push('no block party after a turnaround');
  // 2) a burned block boards up
  const bad = await a.evaluate((kb) => { const pc = window.__pc, W = pc.W; pc.S.btrust[W.did][kb] = -8; pc.REC.dress(W, W.did); return W.props.filter((p) => p.rec && p.t === 'board' && p.wall).map((p) => 'wall').concat(W.props.filter((p) => p.rec && p.t !== 'flowers' && p.t !== 'bench' && p.t !== 'lights' && p.t !== 'stall').map((p) => p.t + '@' + Math.floor((p.x - 2) / 11) + ',' + Math.floor((p.y - 2) / 11))); }, r.kb);
  console.log('burned block', bad.join(' ')); if (process.env.V) console.log(await a.evaluate((kb) => { const W = window.__pc.W, [bx, by] = kb.split(',').map(Number), ox = 2 + bx * 11, oy = 2 + by * 11; return JSON.stringify(W.props.filter((p) => p.x >= ox && p.x < ox + 11 && p.y >= oy + 7 && p.y < oy + 11).map((p) => [p.t, p.x, p.y, p.rec ? 1 : 0])); }, r.kb)); if (bad.filter((x) => x === 'board@' + r.kb).length < 2 || !bad.includes('litter@' + r.kb)) errs.push('burned block did not board up'); if (!bad.includes('wall')) errs.push('plywood is not on the storefront');
  // 3) the party pays once when you stop by (the player is standing on the block)
  await a.waitForFunction(() => Object.values(window.__pc.S.bparty || {}).some((p) => p.seen), null, { timeout: 8000 }).catch(() => errs.push('stopping by the party did nothing'));
  await a.waitForFunction(() => Object.values(window.__pc.S.bparty || {}).some((p) => p.ally), null, { timeout: 8000 }).catch(() => errs.push('the regular who turned it around was not at the party'));
  const g = await a.evaluate(() => window.__pc.REC._peds().filter((p) => p.party).length); console.log('party guests', g); if (g < 5) errs.push('no crowd at the block party');
  const pm = await a.evaluate(async () => ({ at: window.__pc.REC.atParty, mp3: (await fetch('music/party_1.mp3', { method: 'HEAD' })).ok })); console.log('party music', JSON.stringify(pm)); if (!pm.at || !pm.mp3) errs.push('the block party does not play its song');
  // 4) people wave on the good block
  const waved = await a.evaluate(() => { const pc = window.__pc, P = pc.P, ps = pc.peds || []; return ps.length; });
  const rx = await a.evaluate(async () => { const pc = window.__pc, P = pc.P; const ps = pc.REC._peds(); if (!ps.length) return 'no peds'; const p = ps.find((x) => !x.party); p.x = P.x + 1.5; p.y = P.y; p._rxDone = 0; p.rx = null; const r0 = Math.random; Math.random = () => 0; pc.REC.tick(1); Math.random = r0; return p.rx ? p.rx.k : 'none'; });
  console.log('ped reaction', rx, waved); if (rx !== 'wave') errs.push('ped on a trusting block did not wave: ' + rx);
  // 5) a partner notices a kind moment on the street, three times a shift at most
  const st = await a.evaluate(() => { const pc = window.__pc; pc.S.vpart = 'walsh'; const t0 = pc.PART.trust('walsh'); const lines = [1, 2, 3, 4].map(() => pc.PART.street()); return { t0, t1: pc.PART.trust('walsh'), lines }; });
  console.log('street', JSON.stringify(st)); if (st.t1 - st.t0 !== 3 || !st.lines[0]) errs.push('partner did not notice the street moments right');
  await a.evaluate(() => { const pc = window.__pc, P = pc.P, pt = Object.values(pc.S.bparty)[0], [bx, by] = pt.k.split(',').map(Number); P.x = 2 + bx * 11 + 4; P.y = 2 + by * 11 + 11; });
  // 5b) a call on a block that trusts you: a neighbor saw it all, and the first question is narrowed
  await a.evaluate(() => { const pc = window.__pc; document.querySelectorAll('.lorePop .lpBtns button').forEach((x) => x.click()); if (pc.curCall) pc.dropCall(); const pt = Object.values(pc.S.bparty)[0], [bx, by] = pt.k.split(',').map(Number); const c = { les: 0, title: 'Noise complaint', prio: 3, text: 'Loud music.', x: 2 + bx * 11 + 5, y: 2 + by * 11 + 8.5, where: 'Main St', kind: 'street', t0: 0, accepted: true }; window.__cb = c; pc.openCallScene(c); });
  let nb = ''; for (let i = 0; i < 50 && !nb; i++) { nb = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return ''; const t = d.innerText; if (/neighbor is already outside/.test(t)) return t.replace(/\s+/g, ' ').slice(0, 120); const o = d.querySelector('.dlgOpts button:not([disabled])'); if (o) o.click(); else d.click(); return ''; }); await a.waitForTimeout(120); }
  console.log('trusting block call:', nb, await a.evaluate(() => [window.__cb.rules && window.__cb.rules.block, window.__cb.witness])); if (!nb) errs.push('a call on a trusting block did not feel different');
  await a.evaluate(() => { const pc = window.__pc; if (pc.curCall) pc.dropCall(); const d = document.getElementById('dlg'); for (let i = 0; i < 80 && !d.hidden; i++) { const o = d.querySelector('.dlgOpts button:not([disabled])'); if (o) o.click(); else d.click(); } });
  // 6) the last shift remembers all of it: who turned it around, the block that threw a party, a partner who has your back, the court record
  const fin = await a.evaluate(() => { const pc = window.__pc; pc.S.pmem.walsh.t = 80; pc.S.court = { pend: [], hist: [{ v: 'held', honest: null }, { v: 'plea', honest: true }, { v: 'lost', honest: false }] }; const c0 = pc.FIN.conduct(); return { who: pc.FIN.helpers().map((h) => h.name + ' · ' + h.why), good: c0.good, bad: c0.bad }; });
  console.log('finale', JSON.stringify(fin).slice(0, 500)); if (!fin.who.some((w) => /^Dale Hutchins/.test(w)) || !fin.who.some((w) => /^The neighbors/.test(w)) || !fin.who.some((w) => /^Ofc. Bernie Walsh/.test(w))) errs.push('the last shift does not remember the record');
  if (fin.good < 2 || fin.bad < 1) errs.push('court record not in how you worked');
  // 6b) a block that trusts you calls you by name now and then
  const tipc = await a.evaluate(() => { const pc = window.__pc; for (let i = 0; i < 300; i++) { if (pc.curCall) pc.dropCall(); pc.S.btip = {}; pc.dispatchCall(); const c = pc.curCall; if (c && c.tip) { const r = { where: c.where, text: c.text }; pc.dropCall(); return r; } } return null; });
  console.log('tip call', JSON.stringify(tipc)); if (!tipc || !/asked for you by name/.test(tipc.text)) errs.push('a trusting block never called you by name');
  // 7) the trust map marks what happened where: the party, an arrest that fell apart
  const tm = await a.evaluate((kb) => { const pc = window.__pc, [bx, by] = kb.split(',').map(Number); pc.S.court.hist.push({ v: 'lost', how: 'arrest', x: 2 + bx * 11 + 5, y: 2 + by * 11 + 5, did: pc.W.did, where: 'Oak St' }); pc.trustMap(pc.W.did); const mk = [...document.querySelectorAll('.tmMk')].map((x) => x.textContent); const cell = document.querySelector('.tmCell .tmMk').parentElement; cell.click(); const info = document.getElementById('tmInfo').textContent; return { mk, info }; }, r.kb);
  console.log('trust map', JSON.stringify(tm)); if (tm.mk.length < 2 || !/block party|fell apart/.test(tm.info)) errs.push('the trust map does not show what happened where');
  await a.screenshot({ path: (process.argv[2] || 'tests/out') + '/trecord_map.png' }); await a.evaluate(() => window.__pc.closeModal());
  await a.evaluate(() => [...document.body.children].forEach((x) => { if (!/^(view|vign|hTop|hBot)$/.test(x.id)) x.style.visibility = 'hidden'; }));
  await a.waitForTimeout(500); await a.screenshot({ path: (process.argv[2] || 'tests/out') + '/trecord.png' });
  await a.evaluate((kb) => { const P = window.__pc.P, [bx, by] = kb.split(',').map(Number); P.x = 2 + bx * 11 + 5; P.y = 2 + by * 11 + 11; P.path = []; }, r.kb); await a.waitForTimeout(3000); await a.screenshot({ path: (process.argv[2] || 'tests/out') + '/trecord_bad.png' });
  console.log(errs.length ? errs.slice(0, 4).join('\n') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
