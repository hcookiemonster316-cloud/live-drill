// seasons with a story: the calendar picks the chapter (fog in January ... the storm in the fall, the holiday rush in
// December), its calls come in tagged with the season and a lesson, its three beats play in order (a start, a choice,
// an ending that remembers the choice) with one to three questions each, the finale gives a title, the season's
// seasonal event comes up on the calendar, and the season's own arrangement is in the score and on disk
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0, 1, 2], shift: 'day', unit: 'patrol', xp: 3000, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, vpart: 'walsh', cfg: { callCine: false, text: 'instant' }, teach: { done: {}, n: 0, last: Date.now() }, stage: { seen: {}, n: 0, last: Date.now() } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.SEA, null, { timeout: 20000 });
  // the calendar
  const cal = await a.evaluate(async () => { const m = await import('./seasons.js'), e = await import('./events.js'), on = (y, mo, d) => m.chapterOn(new Date(y, mo - 1, d)).id, ev = (y, mo, d) => e.eventOfWeek(new Date(y, mo - 1, d)).id;
    return { jan: on(2027, 1, 20), mar: on(2027, 3, 10), may: on(2027, 5, 20), jul: on(2027, 7, 4), aug: on(2027, 8, 20), oct: on(2026, 10, 3), dec: on(2026, 12, 18), evMar: ev(2027, 3, 10), evAug: ev(2027, 8, 12), evJan: ev(2027, 1, 20), evMay: ev(2027, 5, 25), n: m.SEASONS.length }; });
  console.log('calendar', JSON.stringify(cal));
  const want = { jan: 'fog', mar: 'spring', may: 'grad', jul: 'fourth', aug: 'school', oct: 'storm', dec: 'holiday', evMar: 'springbreak', evAug: 'backtoschool', evJan: 'fogwatch', evMay: 'gradnight' };
  for (const k in want) if (cal[k] !== want[k]) errs.push('calendar ' + k + ': ' + cal[k] + ', expected ' + want[k]);
  // every chapter's arrangement is in the score and on disk
  const mus = await a.evaluate(async () => { const d = await import('./scoredata.js'), m = await import('./seasons.js'), out = []; for (const s of m.SEASONS) { const id = 'season_' + s.id, r = await fetch('music/' + id + '.mp3', { method: 'HEAD' }); out.push(id + ':' + (d.TRACKS[id] ? 'score' : 'NO SCORE') + ':' + r.status); } return out; });
  console.log('music', mus.join(' ')); mus.forEach((x) => { if (!/score:200$/.test(x)) errs.push('season music missing: ' + x); });
  // the season's calls
  const calls = await a.evaluate(() => { const o = []; for (let i = 0; i < 300; i++) { const c = window.__pc.SEA.call(); if (c) o.push(c); } return { n: o.length, tagged: o.filter((c) => c.season === window.__pc.SEA.id && c.les0 != null && c[0]).length, titles: [...new Set(o.map((c) => c[0]))] }; });
  console.log('season calls', calls.n, 'of 300;', calls.titles.join(' / ')); if (calls.n < 30 || calls.n > 110 || calls.tagged !== calls.n) errs.push('season calls look wrong: ' + JSON.stringify(calls));
  const free = async () => { for (let i = 0; i < 40; i++) { if (await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); return pc.free; })) return true; await a.waitForTimeout(400); } errs.push('street never free'); return false; };
  const play = async (pick, shot) => { let q = 0, txt = '', kick = ''; for (let i = 0; i < 80; i++) { await a.waitForTimeout(350); if (shot && await a.evaluate(() => !!document.querySelector('#dlg:not([hidden]) .dlgOpts:not(.q) [data-k]'))) { await a.screenshot({ path: shot }); shot = null; } const st = await a.evaluate((pk) => { const d = document.getElementById('dlg'); if (d.hidden) return 'done'; const t = d.innerText; const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { qb.find((x) => +x.dataset.k === window.__curQ.c).click(); return 'q|' + t.slice(0, 160); } const bs = [...d.querySelectorAll('.dlgOpts:not(.q) [data-k]')]; if (bs.length) { (bs.find((x) => x.textContent.indexOf(pk) >= 0) || bs[0]).click(); return 'c|' + bs.map((x) => x.textContent).join(' ~ '); } d.click(); return 'n|' + t.slice(0, 260); }, pick || ''); if (st === 'done') break; if (st.startsWith('q')) q++; txt += ' ' + st; if (!kick) kick = await a.evaluate(() => (document.querySelector('#dlg .dlgKick, #dlg [class*=kick]') || {}).textContent || ''); } return { q, txt, kick }; };
  const id = await a.evaluate(() => window.__pc.SEA.id); const rec = () => a.evaluate((id) => { const S = window.__pc.S; return S.sea[id + new Date().getFullYear()]; }, id);
  // the first beat waits for a call this shift; forced here
  await free(); const k0 = await a.evaluate(() => window.__pc.SEA.tick()); if (k0) errs.push('a beat played before any call this shift');
  const t0 = await a.evaluate(() => window.__pc.SEA.tick(true)); console.log('beat', t0); if (!t0 || !/:0$/.test(t0)) errs.push('the first beat did not play');
  await a.waitForTimeout(500); await a.screenshot({ path: 'tseason.png' }); const r0 = await play(); console.log('beat 0 questions', r0.q, '|', r0.txt.slice(0, 160)); if (r0.q < 1 || r0.q > 3) errs.push('beat 0 asked ' + r0.q);
  // the second waits for four of the season's calls; then a choice
  await free(); if (await a.evaluate(() => window.__pc.SEA.due())) errs.push('the second part is due before any of its calls');
  await a.evaluate(() => { for (let i = 0; i < 4; i++) window.__pc.SEA.afterCall({ season: window.__pc.SEA.id }); });
  if (!(await a.evaluate(() => window.__pc.SEA.due()))) errs.push('the second part is not due after four calls'); await free(); const t1 = await a.evaluate(() => window.__pc.SEA.tick(true)); console.log('beat', t1); const r1 = await play('Close', 'tseason_choice.png');
  const opts = (r1.txt.match(/c\|[^|]*/) || [''])[0]; console.log('choice', opts.slice(0, 200)); if (!/~/.test(opts)) errs.push('beat 1 had no choice');
  const pk = (await rec()).pick; console.log('picked', pk); if (!pk) errs.push('the choice was not remembered'); if (r1.q < 1 || r1.q > 3) errs.push('beat 1 asked ' + r1.q);
  // the ending remembers it
  await a.evaluate(() => { for (let i = 0; i < 4; i++) window.__pc.SEA.afterCall({ season: window.__pc.SEA.id }); }); await free();
  const t2 = await a.evaluate(() => window.__pc.SEA.tick(true)); console.log('beat', t2); const r2 = await play();
  const ends = await a.evaluate(async (id) => { const m = await import('./seasons.js'), c = m.SEASONS.find((s) => s.id === id); return c.beats[2].map((x) => Array.isArray(x) && typeof x[1] === 'object' ? x[1] : null).filter(Boolean)[0]; }, id);
  const said = ends && ends[pk]; if (!said || r2.txt.indexOf(said.slice(0, 40)) < 0) errs.push('the ending did not remember the choice');
  const fin = await a.evaluate((id) => { const S = window.__pc.S; return { titles: Object.keys(S.titles || {}).filter((t) => /Veteran/.test(t)), beat: S.sea[id + new Date().getFullYear()].beat }; }, id);
  console.log('finale', JSON.stringify(fin)); if (!fin.titles.length || fin.beat !== 3) errs.push('the finale did not close the chapter');
  await free(); if (await a.evaluate(() => window.__pc.SEA.tick(true))) errs.push('a fourth beat played');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
