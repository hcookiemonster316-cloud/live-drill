// animation with weight (design doc, presentation 10/10): people push off, settle and turn; every car dips when it
// brakes and squats when it pulls away; cards leave instead of vanishing and their buttons cascade in; arriving on
// scene and a by-the-book arrest get a short beat. All of it stops with "Reduced motion".
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 3000, calls: 20, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, cfg: { callCine: false, text: 'instant' }, teach: { done: {}, n: 0, last: Date.now() }, stage: { seen: {}, n: 0, last: Date.now() } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.beat, null, { timeout: 20000 });
  // people
  const ppl = await a.evaluate(async () => { const w = await import('./world.js'), e = {}, o = { moving: false, face: 1 }; w.setMotion(true); w.weightOf(e, o, 0);
    o.moving = true; const push = w.weightOf(e, o, 1000), push2 = w.weightOf(e, o, 1300);
    o.moving = false; const settle = w.weightOf(e, o, 2000 + 0), mid = w.weightOf(e, o, 2120), done = w.weightOf(e, o, 2600);
    o.face = -1; w.weightOf(e, o, 3000); const turn = w.weightOf(e, o, 3000 + 55); w.setMotion(false); o.moving = true; const off = w.weightOf(e, o, 4000); w.setMotion(true);
    return { push, push2, mid, done, turn, off }; });
  console.log('people', JSON.stringify(ppl));
  if (!ppl.push || !(ppl.push.dx > .5) || !(ppl.push.sy > 1)) errs.push('no push-off'); if (ppl.push2) errs.push('push-off lingers');
  if (!ppl.mid || !(ppl.mid.dy > .8) || !(ppl.mid.sy < .97)) errs.push('no settle'); if (ppl.done) errs.push('settle lingers'); if (!ppl.turn || !(ppl.turn.sx < .8)) errs.push('no turn'); if (ppl.off) errs.push('weight with reduced motion');
  // cars
  const car = await a.evaluate(() => { const pc = window.__pc, c = { moving: true, dir: 0 }; pc.carWeight(c, 0); c.moving = false; const brake = pc.carWeight(c, 100 + 60), later = pc.carWeight(c, 100 + 1200); c.moving = true; const go = pc.carWeight(c, 2000 + 30); return { brake, later, go }; });
  console.log('cars', JSON.stringify(car)); if (!(car.brake > .3)) errs.push('no brake dive'); if (car.later) errs.push('the dive never settles'); if (!(car.go < -.2)) errs.push('no pull-away squat');
  for (let i = 0; i < 20; i++) { if (await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); return pc.free; })) break; await a.waitForTimeout(400); }
  // cards
  const card = await a.evaluate(() => new Promise((ok) => { const pc = window.__pc; pc.openModal('<div class="sceneHead"><h2>Test</h2></div><div class="qAct"><button type="button">One</button><button type="button">Two</button></div>');
    setTimeout(() => { const d2 = getComputedStyle(document.querySelector('#modal .qAct>:nth-child(2)')).animationDelay; pc.closeModal(); const g1 = document.querySelectorAll('.mGhost').length; setTimeout(() => ok({ d2, g1, g2: document.querySelectorAll('.mGhost').length }), 400); }, 400); }));
  console.log('cards', JSON.stringify(card)); if (card.d2 !== '0.04s') errs.push('buttons do not cascade'); if (card.g1 !== 1 || card.g2 !== 0) errs.push('the card does not leave cleanly');
  // beats
  await a.evaluate(() => window.__pc.beat('cuffs')); await a.waitForTimeout(250); await a.screenshot({ path: 'tanim_beat.png' });
  const bt = await a.evaluate(() => { const e = document.getElementById('beatFx'); return e && e.classList.contains('on') && e.dataset.k === 'cuffs' && /BY THE BOOK/.test(e.textContent); });
  if (!bt) errs.push('no arrest beat');
  await a.evaluate(() => { window.__pc.S.cfg.motion = false; document.getElementById('beatFx').classList.remove('on'); window.__pc.beat('arrive'); window.__pc.openModal('<div class="qAct"><button>x</button></div>'); window.__pc.closeModal(); }); await a.waitForTimeout(150);
  const calm = await a.evaluate(() => ({ beat: document.getElementById('beatFx').classList.contains('on'), ghost: document.querySelectorAll('.mGhost').length })); console.log('reduced', JSON.stringify(calm)); if (calm.beat || calm.ghost) errs.push('motion with Reduced motion on');
  // your officer acts out a by-the-book arrest step; people on the sidewalk turn to watch a siren go by
  const act = await a.evaluate(() => { const pc = window.__pc, L = pc.arrestLines({}), cover = L[0][1].find((o) => o.fx); cover.fx(); return pc.ACTP.g; }); console.log('arrest pose', act); if (act !== 'up') errs.push('the officer does not act out the step: ' + act);
  const sir = await a.evaluate(() => { const pc = window.__pc, P = pc.P, p = pc.peds[0]; if (!p) return 'no walkers'; const tile = pc.W.walk.find(([x, y]) => Math.abs(x - P.x) + Math.abs(y - P.y) < 5); if (!tile) return 'no sidewalk'; p.x = tile[0] + .5; p.y = tile[1] + .5; p._lk = 0; const n = pc.sirenLook(true); return { n, wait: p.wait > 1, again: pc.sirenLook(true) }; });
  console.log('siren', JSON.stringify(sir)); if (!sir.n || !sir.wait || sir.again) errs.push('walkers do not stop for a siren (once): ' + JSON.stringify(sir));
  // full-screen panels rise in
  const fe = await a.evaluate(() => new Promise((ok) => { window.__pc.S.cfg.motion = true; document.body.classList.remove('calm'); window.__pc.settings(); setTimeout(() => { const el = document.querySelector('.fe.menuBg:not([hidden])') || document.querySelector('.fe:not([hidden])'); ok(el ? getComputedStyle(el.firstElementChild).animationName + '|' + el.className : 'none'); }, 60); }));
  console.log('panel', fe); if (!/feIn/.test(fe)) errs.push('panels do not animate in: ' + fe);
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
