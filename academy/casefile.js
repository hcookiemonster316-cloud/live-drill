// The case file: everything you have seen and heard on duty, searchable. Field notes from the story, your radio log,
// your call reports, the ledger pages you found and the quest items you carry all go into one archive. You work the
// Lassiter file by searching it the way a detective searches old reports: type a word, read the first five hits,
// notice a new word, search that. Pin the entry that proves an answer. Some questions stay open on purpose.
import { CHAPTERS } from './story.js';
import { CLUES } from './epicdata.js';

// [id, question, what proves it, the chapter that must be reached first, what the answer sounds like once pinned]
const QS = [
  ['pawn', 'Whose name was on the ID that pawned the stolen TV?', /V\. Lassiter/, 2, 'Victor Lassiter. The pawn log put his real name on a stolen TV.'],
  ['hide', 'Where did he keep the things he didn\'t want found?', /slip nine|unit 14/i, 2, 'A boat that never leaves the dock, and a storage unit under his company\'s name.'],
  ['runner', 'Who moved the cars for him, and what did he pay?', /fifty bucks a car/i, 3, 'Danny Ortega, fifty dollars a car. Boxes too.'],
  ['morning', 'Where could you find him every morning?', /first appearances|nine o'clock sharp/i, 3, 'The courthouse, nine sharp, filing bond paperwork.'],
  ['plan', 'What did he say that showed he was planning to run?', /after this week/i, 1, 'He told Rosa he wouldn\'t need the neighborhood after this week.'],
  ['tags', 'What fell out of the boxes on his boat?', /88-1142/, 2, 'Old evidence tags from the city\'s own property room.'],
  ['photo', 'Who did he go through the academy with?', /Dana Castillo and Victor Lassiter/, 3, 'Class 03-2. Front row, arm in arm with your training officer.'],
  // open on purpose: the archive never proves these. They carry the story past this chapter.
  ['wm', 'Who wrote "W.M." in the margin of the 1987 ledger?', null, 0, ''],
  ['money', 'Where did the 1987 relief money go?', null, 0, '']
];

export function installCasefile(H) {
  const S = H.S, esc = H.esc;
  const F = () => (S.cfile = S.cfile || { pin: {}, q: [], done: 0 });
  // logs written as you play
  const log = (k, row) => { const L = (S[k] = S[k] || []); L.push(row); if (L.length > 200) L.splice(0, L.length - 200); };
  function radio(who, msg) { if (!who || !msg || /^(You|Training|Tip|Academy)$/.test(who)) return; log('rlog', [Date.now(), S.mem ? S.mem.shift : 0, String(who), String(msg).slice(0, 240)]); }
  function call(c, r, grade) { if (!c || !c.title) return; log('clog', [Date.now(), S.mem ? S.mem.shift : 0, c.title, c.where || '', r ? r.right + ' of ' + r.n : '', c.way || '', grade == null ? '' : grade]); }
  const ok = (w) => !w || (w.if ? !!S.flags[w.if] : true) && (w.unless ? !S.flags[w.unless] : true);
  // the archive, built from what this player has actually seen; rebuilt only when it might have changed
  let memo = null, memoKey = '';
  function entries() {
    const key = JSON.stringify(S.story) + '|' + Object.keys(S.flags || {}).length + '|' + Object.keys(S.clues || {}).length + '|' + Object.keys(S.qitems || {}).length + '|' + (S.rlog || []).length + '|' + (S.clog || []).length + '|' + ((S.court && S.court.hist) || []).length + '|' + (S.journal || []).length;
    if (memo && key === memoKey) return memo; memoKey = key; const out = [];
    CHAPTERS.forEach((ch, ci) => { const upto = Math.min(S.story[ch.d] || 0, ch.steps.length); for (let i = 0; i < upto; i++) { const st = ch.steps[i], lines = [];
      const add = (L) => (L || []).forEach((x) => { if (!Array.isArray(x)) return; if (x[0] === 'choice') { (x[1] || []).forEach((o) => { if (o.set && S.flags[o.set]) add(o.reply); }); return; } if (typeof x[1] === 'string' && ok(x[2])) lines.push(x); });
      add(st.say); add(st.after);
      lines.forEach((x, j) => out.push({ id: 'st' + ch.d + '.' + i + '.' + j, ord: ci * 1e4 + i * 100 + j, kind: 'Field notes', when: ch.title, src: x[0] === 'narr' ? 'Your notes' : H.nameOf(x[0]), at: st.at, text: x[1] })); } });
    CLUES.forEach((c, i) => { if (S.clues && S.clues[c[0]]) out.push({ id: 'cl' + c[0], ord: 6e4 + i, kind: 'Ledger page', when: 'Found', src: c[2], at: c[2], text: c[3] }); });
    Object.keys(H.QITEMS).forEach((k, i) => { const it = H.QITEMS[k]; if ((S.qitems && S.qitems[k]) || (S.qkept && S.qkept[k])) out.push({ id: 'qi' + k, ord: 7e4 + i, kind: 'Evidence', when: 'Logged', src: it.name, at: '', text: it.text + (it.read ? ' ' + it.read : '') }); });
    (S.rlog || []).forEach((r, i) => out.push({ id: 'rl' + r[0] + '.' + i, ord: 1e5 + i, kind: 'Radio log', when: 'Shift ' + (r[1] + 1), src: r[2], at: '', text: r[3] }));
    (S.clog || []).forEach((r, i) => out.push({ id: 'cr' + r[0] + '.' + i, ord: 2e5 + i, kind: 'Call report', when: 'Shift ' + (r[1] + 1), src: 'Your report', at: r[3], text: r[2] + (r[3] ? ' at ' + r[3] : '') + '.' + (r[4] ? ' Knowledge checks: ' + r[4] + '.' : '') + (r[5] ? ' Handled by ' + (r[5] === 'talk' ? 'talking it through' : r[5] === 'enforce' ? 'enforcement' : 'watching first') + '.' : '') }));
    ((S.court && S.court.hist) || []).forEach((h, i) => out.push({ id: 'ct' + (h.t || i), ord: 3e5 + i, kind: 'Court transcript', when: 'Shift ' + (h.sh + 1), src: 'County Courthouse', at: 'Courtroom 3B', text: (h.how === 'arrest' ? 'The arrest at ' : 'The pursuit arrest near ') + h.where + '. ' + (h.words || '') }));
    (S.journal || []).forEach((j, i) => out.push({ id: 'ew' + j.at, ord: 4e5 + i, kind: 'End of watch log', when: 'Shift ' + (j.sh + 1), src: j.shift + ' · ' + j.district + ' · grade ' + j.grade, at: j.district, text: j.lines.join(' ') + ' ' + j.why }));
    return (memo = out);
  }
  // search: every word must appear; earliest first, like flipping through a file drawer; only five shown
  function search(q) { const words = String(q || '').toLowerCase().split(/[^a-z0-9.'-]+/).filter((w) => w.length >= 2); if (!words.length) return { n: 0, hits: [] };
    const hits = entries().filter((e) => { const t = (e.text + ' ' + e.src + ' ' + e.at).toLowerCase(); return words.every((w) => t.indexOf(w) >= 0); }).sort((a, b) => a.ord - b.ord); return { n: hits.length, hits: hits.slice(0, 5), words }; }
  const reached = (d) => (S.story[d] || 0) > 0 || d === 0;
  function pin(qid, eid) { const q = QS.find((x) => x[0] === qid), e = entries().find((x) => x.id === eid), f = F(); if (!q || !e || f.q.indexOf(qid) >= 0) return false;
    if (!q[2] || !q[2].test(e.text)) { H.beep(220, .12, 'sawtooth', .03); return false; }
    f.q.push(qid); f.pin[qid] = eid; const all = QS.filter((x) => x[2]).every((x) => f.q.indexOf(x[0]) >= 0); H.award(40, 'Case file: ' + q[4].split('.')[0]); H.stat('casePin');
    if (all && !f.done) { f.done = Date.now(); H.toast('🗂️ Every question you can answer is answered. Two stay open. Some threads go further than one case.'); }
    H.saveS(); H.beep(660, .1, 'triangle', .05); setTimeout(() => H.beep(990, .14, 'triangle', .05), 110); return true; }
  const mark = (t, words) => { let s = esc(t); (words || []).forEach((w) => { if (w.length < 2) return; s = s.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); }); return s; };
  let lastQ = '', picking = null;
  function open(q0) {
    if (q0 != null) lastQ = q0; const f = F(), res = search(lastQ), all = entries().length;
    const qcard = (q) => { const done = f.q.indexOf(q[0]) >= 0, locked = q[2] && !reached(q[3]), openP = !q[2];
      return '<li class="cfQ' + (done ? ' ok' : '') + (locked ? ' lock' : '') + (openP ? ' open' : '') + '"><b>' + esc(q[1]) + '</b>' + (done ? '<span>' + esc(q[4]) + '</span>' : locked ? '<span>Not yet. Keep working the story.</span>' : openP ? '<span>Still open.</span>' : '<span>Search for it, then pin the entry that proves it.</span>') + '</li>'; };
    H.openModal('<div class="sceneHead"><b>THE CASE FILE · VICTOR LASSITER</b><h2>' + f.q.length + ' of ' + QS.filter((x) => x[2]).length + ' answered</h2><p>Everything you\'ve seen and heard on duty is in here: ' + all + ' entries. Type a word. Only the first five hits show, earliest first, so narrow it down.</p></div>' +
      '<ol class="cfQs">' + QS.map(qcard).join('') + '</ol>' +
      '<form class="cfSearch" id="cfForm"><input id="cfIn" type="search" autocomplete="off" placeholder="Search your notes, radio log and reports" value="' + esc(lastQ) + '"><button type="submit">Search</button></form>' +
      (lastQ ? '<p class="cfCount">' + res.n + ' ' + (res.n === 1 ? 'entry' : 'entries') + (res.n > 5 ? ', showing the first five' : '') + '</p>' : '') +
      '<div class="cfHits">' + res.hits.map((e) => '<div class="cfHit"><small>' + esc(e.kind) + ' · ' + esc(e.when) + (e.at ? ' · ' + esc(e.at) : '') + '</small><b>' + esc(e.src) + '</b><p>' + mark(e.text, res.words) + '</p>' +
        (picking === e.id ? '<div class="cfPick">' + QS.filter((q) => q[2] && reached(q[3]) && f.q.indexOf(q[0]) < 0).map((q) => '<button type="button" data-pq="' + q[0] + '">' + esc(q[1]) + '</button>').join('') + '</div>' : '<button type="button" class="ghost" data-pin="' + e.id + '">Pin to a question</button>') + '</div>').join('') + '</div>' +
      '<div class="qAct"><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal; H.$('cfForm').onsubmit = (ev) => { ev.preventDefault(); picking = null; open(H.$('cfIn').value.trim()); H.stat('caseSearch'); };
    document.querySelectorAll('[data-pin]').forEach((b) => b.onclick = () => { picking = b.dataset.pin; open(); });
    document.querySelectorAll('[data-pq]').forEach((b) => b.onclick = () => { const okP = pin(b.dataset.pq, picking); if (!okP) H.toast('That entry doesn\'t prove it. Look for the one that says it plainly.'); picking = null; open(); });
  }
  return { radio, call, entries, search, pin, open, QS };
}
