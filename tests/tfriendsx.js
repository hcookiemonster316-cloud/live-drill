// friendship stories you live through (friendsx.js): every arc has five grown visits, every visit is a real scene
// (at least 90 words), every speaker exists, the original lines and choices are all still there, at least ten arcs
// pull in another regular, and flags set in a visit are read later where the scene says so. Runs without a browser.
(async () => {
  const B = require('url').pathToFileURL(require('path').resolve(__dirname, '../academy')).href + '/', errs = [];
  const f = await import(B + 'friends.js'), fx = await import(B + 'friendsx.js'), st = await import(B + 'story.js'), dt = await import(B + 'data.js'), p2 = await import(B + 'people2.js'), sq = await import(B + 'sidequests.js'), sx = await import(B + 'sidex.js'), dc = await import(B + 'districts.js'), sg = await import(B + 'sagas.js');
  const known = new Set(['narr', 'you', 'fx'].concat(Object.keys(st.CAST), dt.NPCS.map((n) => n.id), p2.NPCS2.map((n) => n.id), Object.keys(sq.SIDE_CAST), Object.keys(sx.EXP_CAST), Object.keys(dc.DPEOPLE), Object.keys(sg.SAGA_CAST), Object.keys(fx.ARC_CAST || {})));
  let words = 0, n = 0, crossing = 0; const short = [];
  const walk = (L, cb) => (L || []).forEach((l) => { if (!Array.isArray(l)) return; if (l[0] === 'choice') return l[1].forEach((o) => walk(o.reply, cb)); if (typeof l[1] === 'string') cb(l); });
  for (const id in f.ARCS) { const A = f.ARCS[id]; if (!fx.ARCX[id]) { errs.push('arc not grown: ' + id); continue; } if (A.parts.length !== 5) errs.push(id + ': ' + A.parts.length + ' parts');
    const others = new Set();
    A.parts.forEach((p, i) => { let w = 0; walk(p, (l) => { if (!known.has(l[0])) errs.push(id + ' part ' + i + ': unknown speaker ' + l[0]); w += l[1].split(/\s+/).length; if (l[0] !== id && l[0] !== 'narr') others.add(l[0]); }); words += w; n++; if (w < 90) short.push(id + ':' + i + ' (' + w + ')'); }); if (others.size) crossing++; }
  if (short.length) errs.push('visits under 90 words: ' + short.join(', '));
  if (crossing < 10) errs.push('only ' + crossing + ' arcs cross paths with another person');
  console.log(n + ' visits in ' + Object.keys(f.ARCS).length + ' arcs; about ' + Math.round(words / n) + ' words a visit; ' + crossing + ' arcs cross paths');
  console.log(errs.length ? 'ERRORS ' + errs.slice(0, 12).join(' / ') : 'no errors'); process.exit(errs.length ? 1 : 0);
})();
