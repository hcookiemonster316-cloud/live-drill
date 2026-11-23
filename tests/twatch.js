// end of watch and partners: the shift log fills from what you did, end of watch reads it back with why it mattered
// and keeps it in the journal (searchable in the case file); a partner remembers a call you worked together, brings it
// up at the start of a later shift, and their trust decides whether they back you on a call
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'tests/out';
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 900, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2, 3, 4], story: { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 }, shift: 'day', unit: 'patrol', vpart: 'walsh', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { pursuits: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W && window.__booted, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  await a.addStyleTag({ content: '.lorePop,.tCard{display:none!important}' });
  // a call worked with Walsh, read right and all correct
  const t1 = await a.evaluate(() => { const pc = window.__pc, t0 = pc.PART.trust('walsh'); const c = { title: 'Fender bender blocking Main', where: 'Main St', prio: 2, way: 'talk', readRight: true, wrap: 'case', rules: { intent: 'nervous' } };
    pc.WL.call(c, { right: 3, n: 3 }); const d = pc.PART.remember(c, { right: 3, n: 3 }); pc.WL.pursuit('term', false, 'Palm Ave'); pc.PART.remember(c, null, { pur: 'term', ordered: false }); pc.WL.court('The case held. Guilty on the fleeing charge. Your report matched the log.');
    return { t0, t1: pc.PART.trust('walsh'), d, log: pc.WL.log.map((x) => x.t + ' ' + x.text) }; });
  console.log('trust', t1.t0, '->', t1.t1); console.log(t1.log.join('\n')); if (!(t1.t1 > t1.t0)) errs.push('trust did not rise');
  // end of watch
  await a.evaluate(() => { const pc = window.__pc; if (pc.curCall) pc.dropCall(); document.querySelectorAll('.lorePop .lpBtns button').forEach((x) => x.click()); pc.setClock(100000); });
  await a.waitForSelector('.ewLog', { timeout: 20000 }).catch(() => errs.push('no end of watch log'));
  await a.waitForTimeout(2500); await a.screenshot({ path: OUT + '/twatch_eow.png' }).catch(() => {});
  const ew = await a.evaluate(() => ({ html: (document.querySelector('.ewLog') || {}).innerText, j: (window.__pc.S.journal || []).length }));
  console.log('log:', JSON.stringify(ew)); if (!/Called off the pursuit/.test(ew.html || '') || !/Testified/.test(ew.html || '')) errs.push('log missing entries');
  if (!/hardest call|case held/i.test(ew.html || '')) errs.push('why line missing'); if (!/Walsh/.test(ew.html || '')) errs.push('partner line missing'); if (ew.j !== 1) errs.push('journal not saved');
  const cf = await a.evaluate(() => window.__pc.CASE.search('Palm').hits.map((e) => e.kind)); console.log('case file', cf); if (cf.indexOf('End of watch log') < 0) errs.push('journal not in the case file');
  // next shift: Walsh brings it up
  await a.evaluate(() => document.getElementById('eNext').click()); await a.waitForTimeout(500);
  const line = await a.evaluate(() => { const pc = window.__pc; pc.PART.onShift('walsh'); return pc.PART.bringUp('walsh'); }); console.log('Walsh:', line); if (!line || !/chase|read that person/.test(line)) errs.push('Walsh did not bring it up');
  const again = await a.evaluate(() => window.__pc.PART.bringUp('walsh')); console.log('next mention:', again);
  // low trust: he goes short
  const st = await a.evaluate(() => { const pc = window.__pc; pc.S.pmem.walsh.t = 30; return pc.PART.stance('walsh'); }); console.log('stance at 30:', st); if (st !== 'short') errs.push('low trust not short');
  console.log(errs.length ? errs.slice(0, 4).join('\n') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
