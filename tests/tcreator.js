// the cadet creator (creator.js): a new career opens it before roll call; you choose male or female, skin, an
// academy-standard hairstyle, hair color, a mustache (men only) and an off-duty outfit; the previews and the cadet on
// the map follow; and everything you equip shows on you (a belt flashlight changes your sprite).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 860 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle&creator');
  await a.evaluate(() => { localStorage.clear(); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', unitsV: 1, units: { patrol: 1 }, xp: 900, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })); });
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo');
  await a.waitForSelector('.cc', { timeout: 8000 }).catch(() => fail.push('no creator for a save without a cadet look'));
  const male = await a.evaluate(() => [...document.querySelectorAll('.cc [data-k="hst"]')].map((x) => x.textContent).join(','));
  await a.click('.cc [data-k="sex"][data-v="f"]'); await a.waitForTimeout(150);
  const fem = await a.evaluate(() => ({ hair: [...document.querySelectorAll('.cc [data-k="hst"]')].map((x) => x.textContent).join(','), stache: !!document.querySelector('.cc [data-k="beard"]'), dress: !!document.querySelector('.cc [data-k="off"][data-v="dress"]') }));
  console.log('men', male, '| women', JSON.stringify(fem));
  if (!/High and tight/.test(male) || /bun/i.test(male)) fail.push('men\'s hairstyles: ' + male); if (!/Low bun/.test(fem.hair) || fem.stache) fail.push('women\'s options: ' + JSON.stringify(fem));
  await a.click('.cc [data-k="hst"][data-v="braids"]'); await a.click('.cc [data-k="off"][data-v="hoodie"]'); await a.click('.cc [data-k="offc"][data-v="#15803d"]'); await a.waitForTimeout(900);
  await a.screenshot({ path: 'w_creator.png' });
  await a.click('#ccDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const me = await a.evaluate(() => window.__pc.S.me); console.log('saved', JSON.stringify(me));
  if (!me || me.sex !== 'f' || me.hst !== 'braids' || me.off.top !== 'hoodie' || me.off.shirt !== '#15803d') fail.push('choices not saved: ' + JSON.stringify(me));
  // equipped gear shows: a flashlight on the belt changes how you're drawn
  const d = await a.evaluate(() => { const pc = window.__pc, before = JSON.stringify(pc.castLook ? pc.meLookFor() : null); pc.S.gear = Object.assign({}, pc.S.gear, { belt: 'tacflash' }); pc.S.items = Object.assign({}, pc.S.items, { tacflash: 1 }); const after = pc.meLookFor(); return { marks: (after.kit && after.kit.marks) || [], changed: before !== JSON.stringify(after) }; });
  console.log('gear', JSON.stringify(d)); if (d.marks.indexOf('flash') < 0) fail.push('belt flashlight not on the cadet');
  console.log(fail.length ? 'ERRORS ' + fail.join(' / ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
