// endings for the most-played cases: the first ten cases a cadet meets each end differently by the way you closed
// them (talk it through, look into it, by the book), about the same people; other cases keep the shared endings
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const a = await b.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  const r = await a.evaluate(async () => { const { installWays, CASE_ENDS } = await import('/academy/ways.js'); const out = {};
    for (const id of Object.keys(CASE_ENDS)) { out[id] = ['talk', 'look', 'book'].map((k) => { const S = { flags: {}, npc: {}, ways: { [id]: k } }, W = installWays({ S, saveS() {}, trustUp() {}, esc: (s) => s }); return W.close({ id, steps: [] }, { rp: 100 }).html.replace(/<[^>]+>/g, ' ').trim(); }); }
    const S = { flags: {}, npc: {}, ways: { other: 'talk' } }, W = installWays({ S, saveS() {}, trustUp() {}, esc: (s) => s }); out._generic = W.close({ id: 'other', steps: [] }, { rp: 100 }).html.replace(/<[^>]+>/g, ' ').trim(); return out; });
  Object.keys(r).forEach((k) => console.log(k, '|', (Array.isArray(r[k]) ? r[k].map((x) => x.slice(0, 50)).join(' || ') : r[k].slice(0, 80))));
  Object.keys(r).filter((k) => k[0] !== '_').forEach((k) => { if (new Set(r[k]).size !== 3) errs.push(k + ': routes end the same'); if (r[k].some((x) => x === r._generic)) errs.push(k + ': fell back to the shared ending'); });
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
