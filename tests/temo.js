// the emotion pass (emotions.js): every quest is tagged with the feeling it leads with, every district has the full
// range (funny, tense, sad, gray, triumph), no district is more than 40% one feeling, and contrast() steers away from
// the feeling of the last case closed. Runs without a browser.
(async () => {
  const B = require('url').pathToFileURL(require('path').resolve(__dirname, '../academy')).href + '/', errs = [];
  const st = await import(B + 'story.js'), sq = await import(B + 'sidequests.js'), ep = await import(B + 'epicdata.js'), a2 = await import(B + 'act2.js'), sg = await import(B + 'sagas.js'), tl = await import(B + 'tales.js'), em = await import(B + 'emotions.js');
  const all = [], seen = new Set(); st.SIDE.concat(sq.SIDE2, a2.ACT2, sg.SAGAS || [], tl.TALES || []).forEach((q) => { if (!seen.has(q.id)) { seen.add(q.id); all.push(q); } });
  const by = [0, 1, 2, 3, 4].map(() => ({}));
  all.forEach((q) => { const e = em.EMO[q.id]; if (!e) return errs.push('untagged: ' + q.id); if (!em.EMO_LABEL[e]) errs.push(q.id + ': unknown feeling ' + e); by[q.d][e] = (by[q.d][e] || 0) + 1; });
  Object.keys(em.EMO).forEach((k) => { if (!seen.has(k) && !/^main\d$/.test(k)) errs.push('tag for a quest that does not exist: ' + k); });
  by.forEach((m, d) => { ['funny', 'tense', 'sad', 'gray', 'triumph'].forEach((e) => { if (!m[e]) errs.push('district ' + d + ' has nothing ' + e); });
    const n = Object.values(m).reduce((a, b) => a + b, 0); Object.keys(m).forEach((e) => { if (m[e] / n > .4) errs.push('district ' + d + ' is ' + Math.round(m[e] / n * 100) + '% ' + e); }); });
  const sad = all.filter((q) => em.EMO[q.id] === 'sad'), c = em.contrast(all.filter((q) => q.d === 2), 'sad'); if (c.some((q) => em.EMO[q.id] === 'sad')) errs.push('contrast kept a sad case after a sad one');
  console.log(all.length + ' quests tagged; per district:', JSON.stringify(by));
  console.log(errs.length ? 'ERRORS ' + errs.slice(0, 12).join(' / ') : 'no errors'); process.exit(errs.length ? 1 : 0);
})();
