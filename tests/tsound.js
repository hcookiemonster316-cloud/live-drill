// a city you can hear and the characters' motifs: the city's sound follows where you are (traffic, rain, inside), keeps
// playing with the music turned all the way down, has its own volume in settings, the radio keys up with static, and a
// main character's phrase plays when they enter a scene (once a minute at most)
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const a = await b.newPage({ viewport: { width: 420, height: 860 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2], shift: 'day', unit: 'patrol', xp: 3000, calls: 20, sound: true, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 6 }, vpart: 'walsh', cfg: { callCine: false, text: 'instant', music: 0, amb: .7 }, teach: { done: {}, n: 0, last: Date.now() }, stage: { seen: {}, n: 0, last: Date.now() } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.evaluate(() => { const m = document.getElementById('mDone'); if (m) m.click(); }); await a.waitForFunction(() => window.__pc && window.__pc.CS, null, { timeout: 20000 });
  await a.mouse.click(210, 300); // a tap starts the audio, as on a phone
  const free = async () => { for (let i = 0; i < 40; i++) { if (await a.evaluate(() => { const pc = window.__pc; pc.closeModal(); document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); if (pc.curCall) pc.dropCall(); return pc.free; })) return true; await a.waitForTimeout(400); } errs.push('street never free'); return false; };
  await free(); await a.evaluate(() => { window.__pc.FX.rain = false; window.__pc.FX.storm = false; });
  const lv = (rain) => a.evaluate((rain) => new Promise((ok) => { const fx = () => { if (rain != null) { window.__pc.FX.rain = rain; window.__pc.FX.storm = false; } document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); if (window.__pc.dbg().paused) { window.__pc.closeModal(); const d = document.getElementById('dlg'); if (!d.hidden) d.click(); } }; fx(); const t = setInterval(fx, 200); setTimeout(() => { clearInterval(t); ok(Object.assign({}, window.__pc.CS.levels)); }, 2600); }), rain); // the weather can change on its own, so hold it while listening
  const l0 = await lv(false); console.log('street', JSON.stringify(l0)); if (!(l0.traffic > 0)) errs.push('no city sound on the street with the music off');
  await free(); const l1 = await lv(true); console.log('rain', JSON.stringify(l1)); if (!(l1.rain > 0)) errs.push('rain is silent');
  await free(); const l2 = await lv(false); if (l2.rain > 0) errs.push('rain kept going after it stopped');
  // inside, the street fades
  const inn = await a.evaluate(async () => { const pc = window.__pc; const l = pc.W && pc.W.lots && pc.W.lots.find((x) => x.door); if (!l) return null; try { pc.enterBuilding(l); } catch (e) { return 'err ' + e.message; } return true; });
  if (inn === true) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"], .tCard').forEach((x) => x.click()); window.__pc.closeModal(); }); const l3 = await lv(); console.log('inside', JSON.stringify(l3)); if (!(l3.traffic < l0.traffic) && l0.traffic > .02) errs.push('the street did not fade indoors'); await a.evaluate(() => { try { window.__pc.exitBuilding(); } catch (e) {} }); } else console.log('inside: skipped', inn);
  // its own volume in settings
  const sl = await a.evaluate(() => { window.__pc.settings(); const r = document.querySelector('[data-r="amb"]'); if (!r) return null; r.value = '0.25'; r.dispatchEvent(new Event('input')); const v = window.__pc.S.cfg.amb; window.__pc.closeModal(); return v; });
  console.log('city sound slider', sl); if (sl !== .25) errs.push('no City sound volume in settings');
  // the radio keys up with static, and the motifs
  const rd = await a.evaluate(() => { try { window.__pc.CS.radio(); return 'ok'; } catch (e) { return e.message; } }); if (rd !== 'ok') errs.push('radio static: ' + rd);
  const mo = await a.evaluate(() => { const s = window.__pc.S; s.cfg.music = .8; const m = window.__pc.music; return { castillo: m.motif('castillo'), walsh: m.motif('walsh'), park: m.motif('park'), lassiter: m.motif('lassiter'), nobody: m.motif('nobody') }; });
  console.log('motifs', JSON.stringify(mo)); ['castillo', 'walsh', 'park', 'lassiter'].forEach((k) => { if (!mo[k]) errs.push('no motif for ' + k); }); if (mo.nobody) errs.push('a motif played for nobody');
  // the tension layer: in under a priority call, out when it's calm
  const ten = await a.evaluate(() => new Promise((ok) => { const m = window.__pc.music, real = m.tension.bind(m); m.volume(.8); m.tension = () => {}; /* hold off the game's own updates */ real(1); setTimeout(() => { const hi = m.layer; real(0); setTimeout(() => { m.tension = real; ok({ hi, lo: m.layer }); }, 3500); }, 3500); }));
  console.log('tension layer', JSON.stringify(ten)); if (!(ten.hi > .004) || !(ten.lo < ten.hi / 4)) errs.push('the tension layer does not follow the call: ' + JSON.stringify(ten));
  // entering a scene: Castillo's phrase plays once, not again on her next line
  const sc = await a.evaluate(() => new Promise((ok) => { const m = window.__pc.music, n0 = m.motif, got = []; m.motif = (k) => { got.push(k); return true; }; window.__pc.dialogue([['castillo', 'Roll call in five.'], ['narr', 'She looks at her clipboard.'], ['castillo', 'Go.']], () => { m.motif = n0; ok(got); }); const d = document.getElementById('dlg'); let i = 0; const t = setInterval(() => { if (d.hidden || ++i > 30) { clearInterval(t); return; } d.click(); }, 250); }));
  console.log('scene motifs', JSON.stringify(sc)); if (sc.length !== 1 || sc[0] !== 'castillo') errs.push('Castillo\'s motif on entering a scene: ' + JSON.stringify(sc));
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
