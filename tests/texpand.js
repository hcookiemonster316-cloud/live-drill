// every side case, expanded (sidex.js): the originals are all still there, each expanded case is longer, every step is
// at a real place in its district, every speaker exists, and every case has a choice that changes what happens later
// (a flag it sets is read by a later line or step). Runs without a browser.
(async () => {
  const B = require('url').pathToFileURL(require('path').resolve(__dirname, '../academy')).href + '/', errs = [];
  const st = await import(B + 'story.js'), sq = await import(B + 'sidequests.js'), sx = await import(B + 'sidex.js'), w = await import(B + 'world.js'), dt = await import(B + 'data.js'), p2 = await import(B + 'people2.js'), dc = await import(B + 'districts.js'), sg = await import(B + 'sagas.js'), tl = await import(B + 'tales.js'), a2 = await import(B + 'act2.js');
  const known = new Set(['narr', 'you'].concat(Object.keys(st.CAST), Object.keys(sq.SIDE_CAST), Object.keys(sx.EXP_CAST), Object.keys(dc.DPEOPLE), Object.keys(sg.SAGA_CAST), Object.keys(tl.TALE_CAST), Object.keys(a2.ACT2_CAST), dt.NPCS.map((n) => n.id), p2.NPCS2.map((n) => n.id)));
  const places = [0, 1, 2, 3, 4].map((d) => new Set(w.buildDistrict(d).lots.map((l) => l.name).filter(Boolean)));
  const all = st.SIDE.concat(sq.SIDE2); let n = 0, steps0 = 0, steps1 = 0, words = 0;
  for (const id in sx.EXPAND) { const q = all.find((x) => x.id === id); if (!q) { errs.push('expanded case not found: ' + id); continue; } n++; const e = sx.EXPAND[id];
    const used = e.steps.filter((s) => s.o != null).map((s) => s.o); q.steps.forEach((_, i) => { if (used.indexOf(i) < 0) errs.push(id + ': original step ' + i + ' dropped'); });
    if (e.steps.length <= q.steps.length) errs.push(id + ': not longer than the original'); steps0 += q.steps.length; steps1 += e.steps.length;
    const sets = new Set(), reads = new Set(), lines = [];
    const walk = (L) => (L || []).forEach((l) => { if (!Array.isArray(l)) return; if (l[0] === 'choice') return l[1].forEach((o) => { if (o.set) sets.add(o.set); walk(o.reply); }); if (typeof l[1] === 'string') { lines.push(l); if (l[2] && l[2].if) reads.add(l[2].if); if (l[2] && l[2].unless) reads.add(l[2].unless); } });
    walk(q.offer); walk(e.offer); q.steps.forEach((s) => { walk(s.say); walk(s.after); });
    e.steps.forEach((s) => { if (s.o != null) { walk(s.add); return; } walk(s.say); walk(s.after); if (s.onlyIf) reads.add(s.onlyIf); if (s.skipIf) reads.add(s.skipIf);
      if (!places[q.d].has(s.at)) errs.push(id + ': no place called "' + s.at + '" in district ' + q.d); if (s.who && !known.has(s.who)) errs.push(id + ': unknown person at a step: ' + s.who); });
    e.steps.forEach((s) => (s.add || []).forEach((l) => { if (l[2] && l[2].if) reads.add(l[2].if); }));
    lines.forEach((l) => { if (!known.has(l[0])) errs.push(id + ': unknown speaker ' + l[0]); words += l[1].split(/\s+/).length; });
    if (![...sets].some((f) => reads.has(f))) errs.push(id + ': no choice changes anything later'); }
  console.log(n + ' cases expanded; steps ' + steps0 + ' -> ' + steps1 + '; about ' + words + ' words in them now');
  console.log(errs.length ? 'ERRORS ' + errs.slice(0, 12).join(' / ') : 'no errors'); process.exit(errs.length ? 1 : 0);
})();
