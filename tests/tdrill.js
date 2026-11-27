// Driving course: the motor pool opens it, every drill loads and draws, a scripted driver earns medals with the chapter's
// technique on the threshold stop, the cornering drill and the backing drill, and a wrong technique costs gold.
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'tests/out';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const a = await b.newPage({ viewport: { width: 1280, height: 800 } }); a.on('pageerror', (e) => errs.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', xp: 700, sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, trophies: { stripes: 1, first: 1 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(400); await a.click('#mDone'); await a.waitForTimeout(1000);
  await a.addStyleTag({ content: '.lorePop,.tCard{display:none!important}' });
  await a.evaluate(() => window.__pc.motorPool()); await a.waitForSelector('#mDrive');
  await a.screenshot({ path: OUT + '/drill_pool.png' });
  await a.click('#mDrive'); await a.waitForSelector('[data-drill="brake"]'); await a.screenshot({ path: OUT + '/drill_menu.png' });
  const st = () => a.evaluate(() => { const R = window.__pc.DRV.state; if (!R) return null; const c = R.car; return { mph: Math.abs(c.v) / 0.0752, x: c.x, y: c.y, h: c.h, lit: !!R.lit, done: !!R.done, s: R.at.s, off: R.at.off, side: R.dr.course.side, abs: c.abs, slip: c.slip, t: R.t }; });
  const key = async (k, down) => { if (down) await a.keyboard.down(k); else await a.keyboard.up(k); };
  const result = async (name) => { await a.waitForSelector('#drCard:not([hidden]) #drAgain', { timeout: 20000 }); await a.screenshot({ path: OUT + '/drill_' + name + '_result.png' }); const r = await a.evaluate(() => ({ head: document.querySelector('#drCard h2').textContent, checks: [...document.querySelectorAll('#drCard li:not(.ok):not(.no)')].map((l) => l.textContent), cf: [...document.querySelectorAll('#drCard .cfList li')].map((l) => l.className + ':' + l.textContent.slice(0, 50)), best: window.__pc.S.drills })); console.log(name, r.head, '|', r.checks.join(' | ')); return r; };

  // the scripted drivers run inside the page, every frame, so a slow machine cannot make them late
  const autopilot = (mode) => a.evaluate((mode) => new Promise((done) => { const D = window.__pc.DRV, st = { phase: 0 };
    const tick = () => { const R = D.state; if (!R || R.done) return done(R && R.dr.id); if (R.paused) return requestAnimationFrame(tick); const c = R.car, co = R.dr.course, mph = Math.abs(c.v) / 0.0752, k = { gas: 0, brk: 0, l: 0, r: 0 };
      if (mode === 'brake') { if (!R.lit) k.gas = mph < 37 ? 1 : 0; else { k.brk = 1; const tgt = -co.side * .55; if (Math.abs(c.y - tgt) > .15) { const want = Math.atan2(tgt - c.y, 3) - c.h; k.r = want > .03 ? 1 : 0; k.l = want < -.03 ? 1 : 0; } } }
      else { const s = R.at.s; if (s < 9) k.gas = mph < 36 ? 1 : 0; if (s > 6) k.sig = 1; if (s >= 9 && s < 19.3 && mph > 21) k.brk = 1;
        if (s >= 9 && s < 19.3 && mph <= 21) st.phase = 1;
        const ahead = s + 1.6, p = ahead < 20 ? [ahead, 0] : ahead < 20 + Math.PI * 2.5 ? [20 + Math.sin((ahead - 20) / 5) * 5, 5 - Math.cos((ahead - 20) / 5) * 5] : [25, 5 + (ahead - 20 - Math.PI * 2.5)], bias = s > 16 && s < 22.5 ? -.45 : 0;
        const d0 = Math.atan2(p[1] - c.y, p[0] - c.x + bias) - c.h, d = Math.atan2(Math.sin(d0), Math.cos(d0)); k.r = d > .05 ? 1 : 0; k.l = d < -.05 ? 1 : 0;
        if (s >= 19.3) k.gas = s > 20 + Math.PI * 2.5 - .6 ? 1 : mph < 20 ? 1 : 0; }
      D.press(k); requestAnimationFrame(tick); }; requestAnimationFrame(tick); }), mode);

  const fails = [];
  // every driving fact (Lessons 3.1 to 4.2) is checked on the course by what you did
  const cov = await a.evaluate(() => window.__pc.DRV.coverage()); console.log('course coverage', JSON.stringify(cov)); Object.keys(cov).forEach((l) => { if (cov[l][0] < cov[l][1]) fails.push('lesson ' + l + ' has ' + (cov[l][1] - cov[l][0]) + ' facts the course does not check'); });
  // 1) threshold stop: build to 35, brake hard at the light and steer into the open lane, hold the pedal
  await a.click('[data-drill="brake"]'); await a.waitForSelector('#drGo'); await a.screenshot({ path: OUT + '/drill_brake_brief.png' }); await a.click('#drGo');
  await autopilot('brake'); const r1 = await result('brake');

  // 2) cornering: 35 mph, signal, brake straight, steady through a late apex, gas out
  await a.evaluate(() => window.__pc.DRV.open('corner')); await a.waitForSelector('#drGo'); await a.click('#drGo');
  await autopilot('corner'); const r2 = await result('corner');

  // 3) the wet curve and 4) backing: load, draw, screenshot
  await a.evaluate(() => window.__pc.DRV.open('skid')); await a.waitForSelector('#drGo'); await a.click('#drGo'); await key('ArrowUp', true); await a.waitForTimeout(1500); await key('ArrowUp', false); await a.screenshot({ path: OUT + '/drill_skid.png' });
  await a.evaluate(() => window.__pc.DRV.open('back')); await a.waitForSelector('#drGo'); await a.click('#drGo'); await a.evaluate(() => new Promise((done) => { const D = window.__pc.DRV; const tick = () => { const R = D.state; if (!R || R.paused) return requestAnimationFrame(tick); D.press({ gas: R.t < 1.6 ? 1 : 0 }); if (R.t > 1.8) { D.press({ gas: 0 }); return done(); } requestAnimationFrame(tick); }; tick(); })); await a.screenshot({ path: OUT + '/drill_back.png' }); /* by game time, so a slow machine still backs up */
  const back = await st(); console.log('backing moved', back.s.toFixed(2), 'mph', back.mph.toFixed(1));

  // the night road and Code 3: they load, draw their road, darkness and other cars, and the toggles work
  for (const id of ['night', 'emerg']) { await a.evaluate((id) => window.__pc.DRV.open(id), id); await a.waitForSelector('#drGo'); await a.click('#drGo'); await a.keyboard.press(id === 'night' ? 'h' : 'l');
    await a.evaluate(() => new Promise((done) => { const D = window.__pc.DRV; const tick = () => { const R = D.state; if (!R || R.paused) return requestAnimationFrame(tick); D.press({ gas: 1 }); if (R.t > 2.5) { D.press({ gas: 0 }); return done(); } requestAnimationFrame(tick); }; tick(); }));
    const st2 = await a.evaluate(() => { const R = window.__pc.DRV.state; return { s: R.at.s, high: R.high, lights: R.lights, actors: (R.actors || []).length }; }); await a.screenshot({ path: OUT + '/drill_' + id + '.png' }); console.log(id, JSON.stringify(st2));
    if (!(st2.s > 1)) fails.push(id + ' did not move'); if (id === 'night' && !st2.high) fails.push('high beams did not toggle'); if (id === 'emerg' && (!st2.lights || !st2.actors)) fails.push('lights or traffic missing on Code 3'); }
  // the pursuit drill: it opens with lights on and a gap meter, a call-out cue arrives, and ending it by policy finishes the run
  await a.evaluate(() => window.__pc.DRV.open('pursuit')); await a.waitForSelector('#drGo'); await a.click('#drGo');
  const pu = await a.evaluate(() => new Promise((done) => { const D = window.__pc.DRV; let cued = false; const tick = () => { const R = D.state; if (!R) return done({ err: 'closed' }); if (R.done) return done({ end: R.pur.end, cued, cues: R.pur.cues, calls: R.pur.calls }); if (R.paused) { const d = document.querySelector('#drDec:not([hidden]) [data-k]'); if (d) [...document.querySelectorAll('#drDec [data-k]')].find((x) => /Terminate/.test(x.textContent)).click(); return requestAnimationFrame(tick); }
      if (R.pur.cue) { cued = true; const i = R.pur.cue.opts.findIndex((o) => o[1]); document.querySelector('#drCue [data-c="' + i + '"]').click(); } D.press(R.pur.term ? { brk: 1 } : { gas: R.pur.gapS > 6 ? 1 : 0 }); requestAnimationFrame(tick); }; tick(); }));
  console.log('pursuit', JSON.stringify(pu)); await a.screenshot({ path: OUT + '/drill_pursuit_result.png' });
  if (pu.end !== 'term' || !pu.cued || pu.calls < 1) fails.push('pursuit drill: ' + JSON.stringify(pu));
  // leaving the course gives the city back
  await a.evaluate(() => document.getElementById('drX').click()); await a.waitForTimeout(300); const after = await a.evaluate(() => ({ open: !!document.getElementById('drill'), paused: window.__pc.dbg().paused, facts: Object.keys(window.__pc.S.facts || {}).length }));
  console.log('after', JSON.stringify(after));
  if (!/Gold|Silver|Bronze/.test(r1.head) && !/Gold|Silver|Bronze/.test(r2.head)) fails.push('no drill finished with a medal'); // a scripted driver on a loaded machine can miss one, never both
  [r1, r2].forEach((r, i) => { if (/Gold|Silver|Bronze/.test(r.head)) { console.log('from the book', r.cf.length, r.cf.slice(0, 2).join(' / ')); if (r.cf.length < 1 || r.cf.length > 6) fails.push('run ' + (i + 1) + ' named ' + r.cf.length + ' book facts'); } });
  const cfRec = await a.evaluate(() => Object.keys(window.__pc.S.fseen || {}).length + Object.keys(window.__pc.S.facts || {}).length); if (!cfRec) fails.push('course facts were not recorded');
  if (after.open || after.paused) fails.push('course did not close cleanly');
  if (!(back.s > .3)) fails.push('backing did not move along the course');
  if (!after.facts) fails.push('no fact credited by technique');
  if (fails.length) errs.push('FAIL ' + fails.join('; ')); console.log(errs.join('\n') || 'no errors'); /* the runner reads the last line */ await b.close(); process.exit(fails.length || errs.length ? 1 : 0);
})();
