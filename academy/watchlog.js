// End of watch tells the story. Through the shift, the things that happened are logged with the time, in plain cop
// talk: the calls you cleared and how, the pursuit you ended or didn't, court, regulars, calls that came back, scenes
// you pieced together. At end of watch the log is read back with one line on why the shift mattered, and it goes
// into your career journal, which is also searchable in the case file.
const HHMM = (h) => { const m = Math.round((h % 1) * 60), hh = Math.floor(h) % 24; return String(hh).padStart(2, '0') + String(m === 60 ? 59 : m).padStart(2, '0'); };
// how much each kind of entry matters when picking the line that sums up the shift
const WEIGHT = { court: 9, regular: 8, back: 7, pursuit: 6, scene: 5, partner: 4, call: 1 };
const WAYS = { talk: 'talked it through', observe: 'watched first', enforce: 'went by the book on enforcement' };

export function installWatch(H) {
  const S = H.S;
  let log = [];
  const J = () => (S.journal = S.journal || []);
  function start() { log = []; }
  function add(kind, text, why) { log.push({ t: HHMM(H.hour()), k: kind, text, why: why || '' }); if (log.length > 40) log.shift(); }
  // a cleared call, from the call and its grade
  function call(c, r) { if (!c || !c.title) return; const all = r && r.n && r.right === r.n, way = WAYS[c.way] || '';
    add('call', c.title.replace(/\.$/, '') + (c.where ? ' on ' + c.where : '') + '. ' + (way ? way.charAt(0).toUpperCase() + way.slice(1) + '. ' : '') + (r && r.n ? (all ? 'Got every question right.' : 'Got ' + r.right + ' of ' + r.n + ' right.') : 'Cleared.'),
      all && c.readRight ? 'You read the person right and did it by the book.' : ''); }
  function pursuit(how, ordered, where) { const t = { term: 'Called off the pursuit' + (ordered ? ' when the sergeant ordered it' : ' myself when it got too dangerous'), air: 'Handed the pursuit to Air One and backed off', lost: 'Lost the vehicle and put out the description' }[how] || 'Pursuit ended on stop sticks';
    add('pursuit', t + (where ? ' near ' + where : '') + '.', how === 'term' && !ordered ? 'You ended a chase before anyone got hurt. That\'s the hardest call there is.' : ''); }
  function regular(text) { add('regular', text, text); }
  function back(where, fixed) { add('back', 'Went back to ' + where + ' for what got missed last time. ' + (fixed ? 'Fixed it.' : 'Still not all the way fixed.'), fixed ? 'You went back and finished something from an earlier shift.' : ''); }
  function court(words) { add('court', 'Testified in court. ' + words, words); }
  function scene(title, where) { add('scene', 'Pieced together the ' + title.toLowerCase() + (where ? ' on ' + where : '') + '.', 'You figured out what happened from what you saw.'); }
  function partner(name, text) { add('partner', name + ' ' + text); }
  // read it back at end of watch and keep it
  function close(o) {
    const top = log.slice().sort((a, b) => (WEIGHT[b.k] || 0) - (WEIGHT[a.k] || 0)).find((x) => x.why);
    const why = top ? top.why : log.length ? 'A quiet shift. Quiet shifts are how the city stays that way.' : 'Nothing logged. Some shifts are just driving.';
    const e = { sh: o.sh, at: Date.now(), shift: o.shift, district: o.district, grade: o.grade, lines: log.map((x) => x.t + ' · ' + x.text), why };
    J().push(e); if (J().length > 60) J().splice(0, J().length - 60); H.saveS(); log = []; return e; }
  const html = (e, esc) => '<div class="ewLog"><b>END OF WATCH</b>' + (e.lines.length ? '<ol>' + e.lines.slice(-8).map((l) => '<li>' + esc(l) + '</li>').join('') + '</ol>' : '<p>No calls logged.</p>') + '<p class="ewWhy">' + esc(e.why) + '</p></div>';
  return { start, add, call, pursuit, regular, back, court, scene, partner, close, html, get log() { return log; } };
}
