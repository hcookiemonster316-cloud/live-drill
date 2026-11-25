// a final shift you earned: every finished arc brings someone (partner stories, sagas, friendship stories, the study
// group) and each person turns up once, in order, through the last night
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, cfg: { text: 'instant' } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.FIN, null, { timeout: 20000 });
  const before = await a.evaluate(() => window.__pc.FIN.helpers().length);
  const r = await a.evaluate(async () => { const pc = window.__pc, S = pc.S, sg = (await import('/academy/sagas.js')).SAGAS[0], fr = Object.keys((await import('/academy/friends.js')).ARCS)[0];
    S.pcase = { walsh: { out: 'talk' }, park: { out: 'cover' }, castillo: { out: 'sleep' } }; S.side = S.side || {}; S.side[sg.id] = sg.steps.length; S.arcs = { [fr]: 5 }; S.offN = { partner: 0, regular: 0, study: 3, rest: 0 };
    const h = pc.FIN.helpers(), names = h.map((x) => x.name + ' · ' + x.why), beats = [2, 6, 10, 14].map((i) => pc.FIN.beat(i, 186, [{ les: 4 }]).map((l) => l[1]).join(' | '));
    return { names, beats, n: h.length, saga: sg.title, fr }; });
  console.log('before', before, 'after', r.n); r.names.forEach((x) => console.log('  ' + x)); r.beats.forEach((x) => console.log('beat', x.slice(0, 160)));
  const has = (re) => r.names.some((x) => re.test(x));
  if (!has(/Walsh · told the class/)) errs.push('Walsh\'s story did not bring him'); if (has(/Park/)) errs.push('Park came after a cover-up');
  if (!has(/Castillo · finally slept/)) errs.push('Castillo\'s story did not bring her'); if (!has(new RegExp(r.saga.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))) errs.push('the finished saga brought nobody');
  if (!has(/whole story/)) errs.push('the finished friendship story brought nobody'); if (!has(/study group/)) errs.push('the study group did not come');
  const who = r.beats.map((x) => (r.names.map((n) => n.split(' · ')[0]).find((n) => x.indexOf(n) >= 0)) || null);
  if (who.slice(0, Math.min(4, r.n)).some((x) => !x) || new Set(who.filter(Boolean)).size !== who.filter(Boolean).length) errs.push('people did not each turn up once: ' + JSON.stringify(who));
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
