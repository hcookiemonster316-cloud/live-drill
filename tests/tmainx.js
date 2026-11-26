// the rebuilt main story (mainx.js): every added scene hangs on a real chapter step, sits at a real place in that
// chapter's district, has speakers that exist and a choice whose flag a later line reads, and Lassiter is on screen
// (or his gray sedan is) in every chapter. Runs without a browser.
(async () => {
  const B = require('url').pathToFileURL(require('path').resolve(__dirname, '../academy')).href + '/', errs = [];
  const st = await import(B + 'story.js'), mx = await import(B + 'mainx.js'), w = await import(B + 'world.js'), dt = await import(B + 'data.js'), dc = await import(B + 'districts.js'), sg = await import(B + 'sagas.js'), sx = await import(B + 'sidex.js');
  const known = new Set(['narr', 'you', 'beat'].concat(Object.keys(st.CAST), Object.keys(mx.MAIN_CAST), Object.keys(dc.DPEOPLE), Object.keys(sg.SAGA_CAST), Object.keys(sx.EXP_CAST), dt.NPCS.map((n) => n.id)));
  const places = [0, 1, 2, 3, 4].map((d) => new Set(w.buildDistrict(d).lots.map((l) => l.name).filter(Boolean)));
  const sets = new Set(), reads = new Set(), seen = new Set(); let words = 0, scenes = 0;
  const allText = JSON.stringify(st.CHAPTERS) + JSON.stringify(sg.MAIN_ADDS);
  const walk = (L, d) => (L || []).forEach((l) => { if (!Array.isArray(l)) return; if (l[0] === 'choice') return l[1].forEach((o) => { if (o.set) sets.add(o.set); walk(o.reply, d); });
    if (typeof l[1] !== 'string') return; if (!known.has(l[0])) errs.push('unknown speaker ' + l[0]); words += l[1].split(/\s+/).length; if (l[2] && (l[2].if || l[2].unless)) reads.add(l[2].if || l[2].unless);
    if (l[0] === 'lassiter' || /gray sedan|Lassiter|Vic\b/.test(l[1])) seen.add(d); });
  for (const k in mx.MAIN_PRE) { const j = k.indexOf('|'), d = +k.slice(0, j), g = k.slice(j + 1), ch = st.CHAPTERS.find((c) => c.d === d);
    if (!ch || !ch.steps.some((x) => x.goal === g)) { errs.push('no chapter step "' + k + '"'); continue; }
    mx.MAIN_PRE[k].forEach((s) => { scenes++; if (!places[d].has(s.at)) errs.push(k + ': no place "' + s.at + '" in district ' + d); if (s.who && !known.has(s.who)) errs.push(k + ': unknown person ' + s.who);
      if (!s.goal || s.goal.length > 52) errs.push(k + ': goal missing or too long'); walk(s.say, d); }); }
  [...sets].forEach((f) => { if (!reads.has(f) && allText.indexOf(f) < 0) errs.push('choice flag never read later: ' + f); });
  [0, 1, 2, 3, 4].forEach((d) => { if (!seen.has(d)) errs.push('chapter ' + (d + 1) + ': no Lassiter on screen in the new scenes'); });
  console.log(scenes + ' scenes added to the main story; about ' + words + ' words');
  console.log(errs.length ? 'ERRORS ' + errs.slice(0, 12).join(' / ') : 'no errors'); process.exit(errs.length ? 1 : 0);
})();
