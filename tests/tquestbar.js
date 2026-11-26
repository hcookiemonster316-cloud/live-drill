// the quest bar (Phase 8, step 9): every quest, as the game plays it (sidex.js overlays applied the same way game.js
// applies them), has at least 3 steps, a choice whose flag is read later (so the options lead to different results),
// an ending you see (the last step has someone other than dispatch or your sergeant speaking in person), and an
// emotion tag. Prints the ones below the bar. Runs without a browser.
(async () => {
  const B = require('url').pathToFileURL(require('path').resolve(__dirname, '../academy')).href + '/', errs = [];
  const st = await import(B + 'story.js'), sq = await import(B + 'sidequests.js'), ep = await import(B + 'epicdata.js'), a2 = await import(B + 'act2.js'), sg = await import(B + 'sagas.js'), tl = await import(B + 'tales.js'), sx = await import(B + 'sidex.js'), em = await import(B + 'emotions.js'), dc = await import(B + 'districts.js');
  const all = [], seen = new Set(); st.SIDE.concat(sq.SIDE2, a2.ACT2, sg.SAGAS || [], tl.TALES || []).forEach((q) => { if (!seen.has(q.id)) { seen.add(q.id); all.push(q); } });
  const radioOnly = new Set(['castillo', 'velvet', 'narr', 'you']); Object.keys(dc.DPEOPLE).forEach((k) => { if (/^disp_/.test(k)) radioOnly.add(k); });
  const steps = (q) => { const e = sx.EXPAND[q.id]; if (!e) return q.steps; return e.steps.map((s) => { if (s.o == null) return s; const b = q.steps[s.o]; if (!b) return null; const { o, pre, add, ...rest } = s; return Object.assign({}, b, rest, { say: (pre || []).concat(rest.say || b.say || [], add || []) }); }).filter(Boolean); };
  // a flag also counts when something elsewhere in the game reads it (a later case, the main story, a memory line)
  const fs = require('fs'), path = require('path'), dir = path.join(__dirname, '..', 'academy'), src = fs.readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  const readElsewhere = (f) => new RegExp("(if|unless|onlyIf|skipIf)\\s*:\\s*'" + f + "'|flags\\." + f + "\\b|flags\\[\\s*'" + f + "'|fl\\(S,\\s*'" + f + "'").test(src);
  const below = { steps: [], choice: [], ending: [], emotion: [] };
  for (const q of all) { const S = steps(q), sets = new Set(), reads = new Set();
    const walk = (L) => (L || []).forEach((l) => { if (!Array.isArray(l)) return; if (l[0] === 'choice') return l[1].forEach((o) => { if (o.set) sets.add(o.set); walk(o.reply); }); if (l[2] && (l[2].if || l[2].unless)) reads.add(l[2].if || l[2].unless); });
    walk(q.offer); S.forEach((s) => { walk(s.say); walk(s.after); if (s.onlyIf) reads.add(s.onlyIf); if (s.skipIf) reads.add(s.skipIf); });
    if (S.length < 3) below.steps.push(q.id + '(' + S.length + ')');
    if (![...sets].some((f) => reads.has(f) || readElsewhere(f))) below.choice.push(q.id);
    const end = S[S.length - 1] || {}, inPerson = (end.say || []).concat(end.after || []).some((l) => Array.isArray(l) && typeof l[1] === 'string' && (l[0] === end.who || !radioOnly.has(l[0])) && !/^\((over|on) the radio\)/.test(l[1]));
    if (!inPerson) below.ending.push(q.id);
    if (!em.EMO[q.id]) below.emotion.push(q.id); }
  const n = all.length, ok = all.filter((q) => !Object.values(below).some((l) => l.some((x) => x === q.id || x.startsWith(q.id + '(')))).length;
  console.log(ok + ' of ' + n + ' quests meet the bar');
  Object.keys(below).forEach((k) => console.log('  below on ' + k + ' (' + below[k].length + '): ' + below[k].join(', ')));
  if (ok < n) errs.push((n - ok) + ' quests below the bar');
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); process.exit(errs.length ? 1 : 0);
})();
