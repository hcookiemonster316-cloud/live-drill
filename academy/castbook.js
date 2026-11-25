// Each one a real person (Action plan, Step F). The people at the center of the story each have a want, a flaw, a
// secret and an arc with a turning point, written down here and shown in the journal's Cast tab as you earn them:
// the want once you know them, the flaw once you've spent real time with them, the secret on the story beat that
// reveals it, and where their arc stands now, which depends on what you did at their turning point.
// It reads the systems that already hold these people (partner cases and trust, the main case, the regulars'
// friendship, Lassiter's meetings) and feeds the journal and a short notice when something new is learned.
// Each line: [text, earned(S)] or a function of S for lines that depend on what you chose.
const pc = (S, k) => (S.pcase && S.pcase[k]) || {};
const fr = (S, id) => (S.npc && S.npc[id]) || 0;
const ch = (S, d, n) => ((S.story && S.story[d]) || 0) >= n;
const fl = (S, f) => !!(S.flags && S.flags[f]);

export const SHEETS = [
  { id: 'castillo', name: 'Sgt. Dana Castillo', icon: '🎖️', how: 'ride with her and work the main case',
    want: ['A department where doing it right is the normal thing, not the brave thing.', (S) => ch(S, 0, 1)],
    flaw: ['Holds every line, including the ones that hurt her. Asks for help last, if she asks at all.', (S) => (pc(S, 'castillo').rides || 0) >= 2 || ch(S, 2, 1)],
    secret: [(S) => (pc(S, 'castillo').stage || 0) >= 2 ? 'Victor Lassiter was her academy roommate; she reported him in week nine. And eleven years ago a wrong-way driver killed her brother Marco. His parole hearing is coming.' : 'Victor Lassiter was her academy roommate. She reported him for the stolen exam answers in week nine, 2003, and he washed out that Friday.', (S) => ch(S, 3, 2) || (pc(S, 'castillo').stage || 0) >= 2],
    arc: ['The parole hearing: two letters, one to keep the driver in, one to forgive him.', (S) => !!pc(S, 'castillo').out, (S) => pc(S, 'castillo').out === 'both' ? 'She read both letters. She\'s sleeping again.' : 'She still carries the letter she didn\'t read.'] },
  { id: 'walsh', name: 'Ofc. Bernie Walsh', icon: '👮', how: 'ride with him',
    want: ['Two quiet years and then home on time, every night. And for one cadet to hear what he never said out loud.', (S) => (pc(S, 'walsh').rides || 0) >= 1],
    flaw: ['Jokes his way past anything that matters, and carries the worst day of his career alone.', (S) => (pc(S, 'walsh').rides || 0) >= 3 || (pc(S, 'walsh').stage || 0) >= 1],
    secret: ['2004. A kid in a stolen Civic ran the light at Ibis and hit a minivan; the boy in the back seat was nine. Walsh kept chasing two blocks past the point policy said to stop.', (S) => (pc(S, 'walsh').stage || 0) >= 2],
    arc: ['The academy asks him, again, to talk to cadets about pursuits.', (S) => !!pc(S, 'walsh').out, (S) => pc(S, 'walsh').out === 'talk' ? 'He told your class to end it when it gets dangerous. Now he has to listen to himself.' : 'He said no again. He\'s making his last two years quiet ones.'] },
  { id: 'park', name: 'Ofc. Theo Park', icon: '👮', how: 'ride with him',
    want: ['To make sergeant and show his parents the job isn\'t temporary. His mother keeps a white apron on his hook.', (S) => (pc(S, 'park').rides || 0) >= 1],
    flaw: ['Hides small mistakes and hopes they stay small.', (S) => (pc(S, 'park').rides || 0) >= 3 || (pc(S, 'park').stage || 0) >= 1],
    secret: ['He backed the car into a post at the lot and didn\'t report the scrape.', (S) => (pc(S, 'park').stage || 0) >= 2],
    arc: ['Report the scrape, or cover for him.', (S) => !!pc(S, 'park').out, (S) => pc(S, 'park').out === 'report' ? 'He backs into spaces like a professional now. Castillo says he\'s "coming along."' : 'Castillo found out. He sat out four shifts, and he\'s quieter with you.'] },
  { id: 'lassiter', name: 'Victor Lassiter', icon: '🕶️', how: 'follow the gray sedan',
    want: ['A car, a beat, people who wave. All he ever wanted was to be a cop.', (S) => fl(S, 'lasWant') || !!(S.las && S.las.letter) || ch(S, 4, 5)],
    flaw: ['Believes everybody takes something. He only has to find the price.', (S) => !!(S.las && S.las.seen && S.las.seen.coffee) || ch(S, 4, 3)],
    secret: ['He kept the academy class photo in a storage unit. On the back: "Roomies. Week 1. We\'re going to change this city."', (S) => ch(S, 3, 2)],
    arc: ['Arrested at the County Courthouse by a cadet.', (S) => ch(S, 4, 3), (S) => { const l = S.las && S.las.letter; return l === 'logged' ? 'He wrote you from the County Jail. You logged it, and Castillo read it. He still writes his V the same way.' : l === 'kept' || l === 'wrote' ? 'He wrote you from the County Jail, and the letter became part of the case.' : 'Waiting for trial. He asked who booked him. "Of course," he said.'; }] },
  { id: 'delgado', name: 'Mr. Delgado', icon: '🌭', how: 'stop at his cart in Founders Plaza',
    want: ['For his daughter to play piano somewhere better than a plaza with a hot dog cart in it.', (S) => fr(S, 'delgado') >= 1],
    flaw: ['Gives food away to anyone with a sad story, and talks the whole time he does it.', (S) => fr(S, 'delgado') >= 3],
    secret: [(S) => fl(S, 'paidDelgado') ? 'He framed the receipt for the two dollars you paid him. It hangs by the mustard.' : 'He told Castillo about the free lunch. He charges you now, "for your own good."', (S) => fl(S, 'paidDelgado') || fl(S, 'freeDog')],
    arc: ['A man in sunglasses circled his plaza three nights in a row.', (S) => ch(S, 4, 5), () => 'Lassiter is in custody. Delgado is finally sleeping.'] },
  { id: 'rosa', name: 'Rosa', icon: '🛒', how: 'stop in at Rosa\'s Bodega',
    want: ['For Danny to have a life that doesn\'t run through the register.', (S) => fr(S, 'rosa') >= 1],
    flaw: ['Forty years of handling everything herself. She doesn\'t call when she should.', (S) => fr(S, 'rosa') >= 3 || fl(S, 'reportedThreat')],
    secret: ['Lassiter used to park behind her store, where her camera couldn\'t see him. She moved the camera too late.', (S) => ch(S, 4, 5)],
    arc: ['Danny, and whether anyone was watching out for him.', (S) => fl(S, 'dannyHome'), () => 'Danny works the register after his classes now. He counts the change twice.'] },
  { id: 'hal', name: 'Captain Hal', icon: '⚓', how: 'stop at the marina',
    want: ['Every line doubled and every boat accounted for.', (S) => fr(S, 'hal') >= 1],
    flaw: ['Trusts knots more than people.', (S) => fr(S, 'hal') >= 3 || fl(S, 'boatLogged')],
    secret: ['Slip nine was Lassiter\'s. The boat never left the dock, not once.', (S) => ch(S, 2, 5)],
    arc: ['The man who couldn\'t tie his boat off in the storm.', (S) => fl(S, 'boatLogged'), () => 'The knot guy brought him a book about knots, signed "To Hal, who saw me at my worst."'] },
  { id: 'johnson', name: 'Ms. Johnson', icon: '🛑', how: 'stop at the school crossing',
    want: ['Every kid across, every morning, and home in one piece.', (S) => fr(S, 'johnson') >= 1],
    flaw: ['Won\'t admit she\'s tired, even now that she stocks shelves overnight.', (S) => fr(S, 'johnson') >= 3],
    secret: ['Mrs. Benoit says Johnson saved her life. Johnson says it was Toby and the cadet. Now Mrs. Benoit brings three thermoses.', (S) => ch(S, 2, 5)],
    arc: ['The parents with signs at the crossing on Tuesdays.', (S) => fl(S, 'signsMoved'), () => 'They stay on the sidewalk now. They wave at each other.'] },
  { id: 'keane', name: 'Marisol Keane', icon: '⚖️', how: 'testify in court',
    want: ['Every report read out loud before it can follow someone for the rest of their life.', (S) => (S.keane && S.keane.n) >= 1],
    flaw: ['Assumes every report is wrong until it proves otherwise. Usually that\'s her job. Sometimes it isn\'t fair.', (S) => (S.keane && S.keane.n) >= 2],
    secret: ['Her cousin did eight months on a report nobody checked. One wrong line.', (S) => fl(S, 'keaneWhy')],
    arc: ['Your report against her reading of it.', (S) => fl(S, 'keaneRight') || fl(S, 'keaneHeld'), (S) => fl(S, 'keaneRight') ? 'She was right about your report once, and you told her so. She still nods at you on the steps.' : 'Your paper held against her. She says she\'d rather lose to that.'] },
  { id: 'odell', name: 'Frank Odell', icon: '🪵', how: 'stop at Manatee Lumber in Eastside',
    want: ['For somebody to call him back. Just once.', (S) => fr(S, 'odell') >= 1 || fl(S, 'odellHeard')],
    flaw: ['Complains to everyone, so nobody listens to the part that\'s true.', (S) => fl(S, 'odellChecked')],
    secret: ['His slow alarm responses trace back to his own bad door sensor: six false alarms last spring.', (S) => fl(S, 'odellChecked')],
    arc: ['Right about the dropped follow-up, wrong about the alarm.', (S) => fl(S, 'odellBoth') || fl(S, 'odellHalf') || fl(S, 'odellSensor'), (S) => fl(S, 'odellBoth') ? 'You told him both halves. He fixed the sensor and wrote your name under the case numbers.' : fl(S, 'odellHalf') ? 'You told him only the half he wanted. His alarm went off for the seventh time.' : 'You told him only the half that was his fault. He stopped talking to you.'] }
];
const PARTS = [['want', 'Wants'], ['flaw', 'Flaw'], ['secret', 'Secret'], ['arc', 'Turning point']];
const txt = (t, S) => (typeof t === 'function' ? t(S) : t);

export function installCastbook(H) {
  const S = H.S;
  const known = (s) => PARTS.filter(([k]) => s[k][1](S)).length;
  const total = () => SHEETS.reduce((n, s) => n + known(s), 0);
  // the journal: one card per person, earned parts written out, the rest still to learn
  function html(esc) {
    return '<div class="jSec"><b>Who they are · ' + total() + '/' + SHEETS.length * 4 + '</b></div>' + SHEETS.map((s) => { const n = known(s); if (!n) return '<div class="jP unk cbCard"><span>❔</span><div><b>Someone you haven\'t gotten to know</b><small>' + esc(s.how.charAt(0).toUpperCase() + s.how.slice(1)) + '.</small></div></div>';
      return '<div class="jP cbCard"><span>' + s.icon + '</span><div><b>' + esc(s.name) + '</b>' + PARTS.map(([k, lab]) => { const p = s[k], on = p[1](S); return '<p class="cbRow' + (on ? '' : ' lk') + '"><i>' + lab + '</i>' + (on ? esc(txt(p[0], S)) + (k === 'arc' && p[2] ? ' <em>' + esc(p[2](S)) + '</em>' : '') : 'Not yet. ' + esc(s.how.charAt(0).toUpperCase() + s.how.slice(1)) + '.') + '</p>'; }).join('') + '</div></div>'; }).join('');
  }
  // every few seconds: a notice when you've just learned something about someone (a secret or a turning point)
  function check() { const seen = (S.cbk = S.cbk || {}); let news = null;
    SHEETS.forEach((s) => PARTS.forEach(([k, lab]) => { const key = s.id + ':' + k; if (seen[key] || !s[k][1](S)) return; seen[key] = 1; if (k === 'secret' || k === 'arc') news = news || [s, lab]; }));
    if (news) { H.saveS(); if (S.cbInit) H.toast(news[0].icon + ' Your journal: ' + news[0].name + ', ' + news[1].toLowerCase() + '.'); } if (!S.cbInit) { S.cbInit = 1; H.saveS(); } }
  return { html, check, total, SHEETS };
}
