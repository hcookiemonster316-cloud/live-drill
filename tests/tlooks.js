// people look like who they are (persona.js, pixelfolk.js): a woman reads as a woman and a man as a man, officers wear
// the uniform with their rank, managers dress for work, kids are kids, and the face in the dialogue is the same person
// as the one standing on the map. Node checks on the classifier, then the game: every cast member without a hand-made
// design gets a look, the portrait and the map use the same one, and women's designs carry the same face cues.
const { chromium } = require('playwright');
(async () => {
  const errs = []; const P = await import('../academy/persona.js'); const PF = await import('../academy/pixelfolk.js');
  const want = [['Mrs. Diaz', 'Walks her poodle at the Dog Run', 'f', 'casual'], ['Mr. Banks', 'Teller, First Coast Bank', 'm', 'suit'], ['Sgt. June Saito', 'Industrial Park sergeant', 'f', 'officer'],
    ['Nurse Adaeze', 'Downtown Urgent Care', 'f', 'medic'], ['Reverend Whitaker', 'First Light Chapel', 'm', 'clergy'], ['Mateo, age 9', 'Founders Elementary, third grade', 'm', 'casual', 'kid'],
    ['Principal Holloway', 'Eastside Middle School', 'm', 'suit', 'adult'], ['Winnie Drummond', 'Eastside dispatch', 'f', 'dispatch'], ['Det. Sgt. Ivy Rourke', 'Detective bureau', 'f', 'plain'],
    ['Benny', 'Gas & Go clerk', 'm', 'casual'], ['Cadet Riley Navarro', 'Your classmate', 'f', 'officer'], ['Lt. Femi Okonkwo', 'Watch Commander', 'm', 'officer'], ['Grandma Ruth', 'Porch-sitter, Maple Court', 'f', 'casual', 'elder']];
  for (const [n, r, sx, job, age] of want) { const p = P.persona(n, r, n); if (p.sex !== sx || p.job !== job || (age && p.age !== age)) errs.push(n + ': ' + JSON.stringify(p)); }
  if (!P.persona('Diesel', 'Trucker Dee\'s dog').animal) errs.push('a dog is drawn as a person');
  // a man never gets a dress or a woman a beard, over many generated passers-by
  for (let ph = 0; ph < 400; ph++) { const sx = PF.sexOfLook({ ph }), D = PF.fromLook({ ph, shirt: '#c0392b' }); if (sx === 'm' && D.top && D.top.kind === 'dress') errs.push('man in a dress, ph ' + ph); if (sx === 'f' && D.beard) errs.push('woman with a beard, ph ' + ph); if (errs.length > 6) break; }
  const b = await chromium.launch(); const a = await b.newPage(); a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:' + (process.env.PORT || 8765) + '/' + (process.env.ROOT_PATH || '') + 'academy/?mock&skiptitle');
  await a.evaluate(() => { localStorage.clear(); localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', unitsV: 1, units: { patrol: 1 }, xp: 900, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 } })); });
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 });
  const r = await a.evaluate(() => { const pc = window.__pc, out = { n: 0, none: [], officerNoKit: [] };
    for (const id of Object.keys(pc.TEMP)) { const t = pc.TEMP[id]; if (!t.name || /^(caller|cit|reg_)/.test(id)) continue; const lk = pc.castLook(id); out.n++; if (!lk) { if (!/dog|cat/i.test(t.role || '')) out.none.push(id); continue; } if (lk.job === 'officer' && !lk.kit && !lk.folk) out.officerNoKit.push(id); }
    return out; });
  console.log('cast looks', JSON.stringify({ n: r.n, none: r.none.slice(0, 6), officerNoKit: r.officerNoKit.slice(0, 6) }));
  if (r.n < 150) errs.push('only ' + r.n + ' cast members checked'); if (r.none.length) errs.push('no look for ' + r.none.slice(0, 6).join(',')); if (r.officerNoKit.length) errs.push('officers out of uniform: ' + r.officerNoKit.slice(0, 6).join(','));
  // another player sees the cadet you made: your look travels as one token and comes back the same
  const tok = await a.evaluate(() => { const pc = window.__pc; pc.S.me = { sex: 'f', hst: 'braids', hair: '#8a3b1e', beard: null, off: { top: 'tee', shirt: '#2563eb', pants: '#334155' } }; pc.S.skin = '#7d4a2b'; return pc.lookTok(); });
  console.log('look token', JSON.stringify(tok)); if (!tok.back || tok.back.sex !== 'f' || tok.back.hst !== 'braids' || tok.back.hair !== '#8a3b1e' || tok.back.skin !== '#7d4a2b') errs.push('look token: ' + JSON.stringify(tok));
  console.log(errs.length ? 'ERRORS ' + errs.slice(0, 8).join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0);
})();
