// the story's illustrated scenes (storycine.js): a chapter opens on its district and title, then the place and the
// person and their first line; a later part opens on its place and person; the chapter closes on the faces you met
// and a stamp. Each covers the screen (the city isn't drawn under it), each plays once, and Skip ends it at once.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const fail = []; a.on('pageerror', (e) => fail.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle&cuts');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'night', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, seenBrief: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const shot = async (n, t) => { await a.waitForTimeout(t); await a.screenshot({ path: n }); };
  // the opening of chapter one: district, title, the place, the first line
  const first = await a.evaluate(async () => { const { CHAPTERS } = await import('./story.js'), pc = window.__pc, c = CHAPTERS[0], st = c.steps[0]; window.__r = null; pc.SC.part(c, 0, st, (said) => { window.__r = { said }; }); const l = pc.SC.firstLine(st); return l && l[1]; });
  await a.waitForSelector('.brief.sc', { timeout: 3000 }).catch(() => fail.push('no opening scene'));
  await shot('w_story_sky.png', 2400);
  await a.waitForFunction(() => document.querySelector('.scTitle.in b') && document.querySelector('.scTitle.in b').textContent.length > 0, null, { timeout: 9000 }).catch(() => fail.push('no chapter title'));
  await shot('w_story_title.png', 900);
  const title = await a.evaluate(() => document.querySelector('.scTitle b').textContent); if (title !== 'First Watch') fail.push('title reads ' + title);
  await a.waitForSelector('.scCard.in', { timeout: 16000 }).catch(() => fail.push('no place card')); await shot('w_story_place.png', 1600);
  const covered = await a.evaluate(() => window.__pc.SC.on);
  if (first) { await a.waitForFunction((t) => document.querySelector('.sc .bfCap p') && document.querySelector('.sc .bfCap p').textContent.length > Math.min(30, t.length - 1), first, { timeout: 12000 }).catch(() => fail.push('the first line never types'));
    await shot('w_story_close.png', 1400); }
  await a.waitForFunction(() => window.__r, null, { timeout: 20000 }).catch(() => fail.push('the opening never ended'));
  const r = await a.evaluate(() => window.__r); if (first && !(r && r.said)) fail.push('the first line was not marked as said');
  // once only: the same part again goes straight on
  const again = await a.evaluate(async () => { const { CHAPTERS } = await import('./story.js'); let said = 'none'; window.__pc.SC.part(CHAPTERS[0], 0, CHAPTERS[0].steps[0], (s) => { said = s; }); return [said, !!document.querySelector('.brief.sc')]; });
  if (again[0] !== false || again[1]) fail.push('the opening played twice: ' + again);
  // a later part, skipped part-way: Skip ends it at once and the story goes on
  await a.evaluate(async () => { const { CHAPTERS } = await import('./story.js'); window.__r = null; window.__pc.SC.part(CHAPTERS[1], 2, CHAPTERS[1].steps[2], (s) => { window.__r = { s }; }); });
  await a.waitForSelector('.scCard.in', { timeout: 4000 }).catch(() => fail.push('no part card')); await shot('w_story_part.png', 1500);
  const card = await a.evaluate(() => document.querySelector('.scCard').innerText.replace(/\s+/g, ' ')); if (!/Part Three/i.test(card)) fail.push('part card reads ' + card);
  await a.click('.sc .bfSkip'); await a.waitForFunction(() => window.__r && !document.querySelector('.brief.sc'), null, { timeout: 3000 }).catch(() => fail.push('Skip did not end the part'));
  // the close of a chapter: faces, the stamp
  await a.evaluate(async () => { const { CHAPTERS } = await import('./story.js'); window.__r = null; window.__pc.SC.finale(CHAPTERS[0], () => { window.__r = 1; }); });
  await a.waitForSelector('.brief.sc', { timeout: 3000 }).catch(() => fail.push('no finale'));
  await shot('w_story_faces.png', 10500);
  await a.waitForSelector('.scStamp.in', { timeout: 15000 }).catch(() => fail.push('no stamp at the close')); await shot('w_story_end.png', 600);
  await a.waitForFunction(() => window.__r, null, { timeout: 12000 }).catch(() => fail.push('the finale never ended'));
  if (!covered) fail.push('the scene did not report itself up (the city would be drawn under it)');
  console.log(fail.length ? 'ERRORS ' + fail.join(' | ') : 'no errors'); await b.close(); process.exit(fail.length ? 1 : 0);
})();
