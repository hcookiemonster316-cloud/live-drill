// regulars who stay fresh: small talk that reacts to now (weather, hour, last call, rank, style, unit, season), with
// each regular remembering what they said: a week before a line comes back, and rank and style lines only once
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  const r = await a.evaluate(async () => { const { pickFresh } = await import('/academy/fresh.js'); const S = {}, day = 864e5, t0 = 1e12, c = { rain: true, hour: 12, rankLvl: 3, rankName: 'Squad Leader 3', style: 'talker', unit: 'patrol' };
    const seq = []; for (let i = 0; i < 4; i++) seq.push(pickFresh(S, 'delgado', c, t0 + i * 1000)); const other = pickFresh(S, 'pruitt', c, t0);
    const week = pickFresh(S, 'delgado', c, t0 + 8 * day), later = []; for (let i = 0; i < 4; i++) later.push(pickFresh(S, 'delgado', c, t0 + 9 * day + i));
    return { seq, other, week, later }; });
  console.log(JSON.stringify(r, null, 1).slice(0, 900));
  if (!/soaked/.test(r.seq[0])) errs.push('weather line not first'); if (new Set(r.seq.filter(Boolean)).size !== r.seq.filter(Boolean).length) errs.push('a regular repeated a line the same day');
  if (r.seq[3] !== null) errs.push('lines should run out until next week'); if (!/soaked/.test(r.other || '')) errs.push('another regular should have their own memory');
  if (!/soaked/.test(r.week || '')) errs.push('the weather line did not come back after a week'); if ([r.week].concat(r.later).some((x) => /new stripe|actually listen/.test(x || ''))) errs.push('a once-only line came back');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
