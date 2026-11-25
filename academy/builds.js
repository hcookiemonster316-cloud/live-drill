// Officer builds (Action plan, Step D). Nobody picks a class. The skills you learn, the gear you wear and the way you
// keep handling calls add up, and once one side clearly leads you become that kind of officer, and calls play
// differently for you:
//   The Talker    (Community skills, rapport and composure gear, "Talk it through"): you read people. Before you pick
//                 how to handle a call, you're told what this person actually needs.
//   The Observer  (Investigation skills, perception gear, "Look it over first"): you notice things. Every call leaves
//                 a note in your case file, so the Lassiter search and the case board fill up from your own eyes.
//   The Driver    (Patrol skills, speed gear, driving-course golds): you get there. You count as first on scene for
//                 much longer, and getting there first pays more.
//   By the Book   (Tactics skills, tactics gear, "Handle it by the book"): you're clear and steady. Going straight to it
//                 never turns into an argument, and it takes less time.
// A build is never locked: change your gear or how you work and a different style can take over. Each signature is
// lawful and follows policy; none of them answers a knowledge check for you.

export const STYLES = {
  talker: { name: 'The Talker', icon: '💬', b: 'com', way: 'talk', gear: ['rap', 'com'], sig: 'Before you choose how to handle a call, you can tell what the person needs.' },
  observer: { name: 'The Observer', icon: '👀', b: 'inv', way: 'observe', gear: ['per', 'spot'], sig: 'Every call leaves something you noticed in your case file.' },
  driver: { name: 'The Driver', icon: '🚓', b: 'pat', way: null, gear: ['drive', 'speed'], sig: 'You count as first on scene for much longer, and it pays more.' },
  book: { name: 'By the Book', icon: '📋', b: 'tac', way: 'enforce', gear: ['tac'], sig: 'Going straight to it never turns into an argument, and it\'s quicker.' }
};
export const NEED = { calm: 'they just want it handled, quick and clear. Go by the book.', nervous: 'they\'re scared, not hostile. Slow down and talk them through it.', angry: 'they need to be heard before anything else. Let them talk.', lying: 'the story won\'t hold up. Watch before you say much.' };
const NEED_AT = 6; // points a style needs before it counts as yours
// what an observer writes down: plain, specific, and searchable later
const NOTES = [
  (w) => 'At ' + w + ', a dark sedan parked across the street pulled out as soon as I got out of the car.',
  (w) => 'At ' + w + ', the caller kept looking at the side door the whole time we talked.',
  (w) => 'At ' + w + ', fresh scuffs on the door frame, like something heavy was carried out.',
  (w) => 'At ' + w + ', a neighbor watched from the upstairs window and closed the blind when I looked up.',
  (w) => 'At ' + w + ', the story changed once: first it was ten minutes ago, then it was an hour.',
  (w) => 'At ' + w + ', a delivery van with no company name was double-parked and gone when I came back out.',
  (w) => 'At ' + w + ', two different people used the same nickname for the guy who left: "Shorty".',
  (w) => 'At ' + w + ', receipts on the counter from a pawn shop on the other side of town.'
];

export function installBuilds(H) {
  const S = H.S;
  const branchSkills = (b) => Object.keys(S.skills || {}).filter((id) => id.slice(0, 3) === b).length;
  const golds = () => Object.values(S.drills || {}).filter((d) => d && d.m === 3).length;
  function score(k) { const st = STYLES[k]; let s = 2 * branchSkills(st.b) + st.gear.reduce((a, g) => a + (k === 'driver' ? Math.floor(H.gp(g) / 10) : H.gp(g)), 0);
    s += st.way ? H.wayLvl(st.way) - 1 : Math.min(4, golds()); return s; }
  // one style at a time: the top score, if it clears the bar and leads the next by at least one point
  let memo = null, memoKey = '';
  function style() { const key = JSON.stringify(S.skills || {}) + '|' + JSON.stringify(S.ways || {}) + '|' + JSON.stringify(S.gear || {}) + '|' + golds();
    if (key === memoKey) return memo; memoKey = key; const sc = Object.keys(STYLES).map((k) => [k, score(k)]).sort((a, b) => b[1] - a[1]);
    memo = sc[0][1] >= NEED_AT && sc[0][1] > sc[1][1] ? sc[0][0] : null; return memo; }
  const is = (k) => style() === k;
  // tell the player the moment they become (or stop being) a kind of officer
  function check() { const s = style(); if (s === (S.build || null)) return; const was = S.build; S.build = s; H.saveS();
    if (s) H.banner(STYLES[s].icon, 'You\'re ' + STYLES[s].name, STYLES[s].sig); else if (was) H.toast('Your style is shifting. No one way leads right now.'); }
  // hooks the call scene uses
  const readLine = (intent) => (is('talker') && intent && NEED[intent] ? ['narr', 'You can read it: ' + NEED[intent]] : null);
  const fastWin = () => (is('driver') ? 75 : 40);
  const fastPay = () => (is('driver') ? 25 : 15);
  const argue = (p) => (is('book') ? 0 : p);
  const bookTime = () => (is('book') ? -1 : 0);
  function afterWay(c) { if (!is('observer') || !c || !c.where) return; const t = NOTES[Math.floor(Math.random() * NOTES.length)](c.where); H.note(t); setTimeout(() => H.toast('👀 Noted for the case file'), 700); }
  // the card at the top of the skill tree: where each style stands and what yours does
  function card() { const s = style(); const rows = Object.keys(STYLES).map((k) => { const st = STYLES[k], v = Math.min(NEED_AT, score(k));
      return '<div class="bdRow' + (s === k ? ' on' : '') + '"><span>' + st.icon + ' ' + st.name + '</span><i><b style="width:' + Math.round(100 * v / NEED_AT) + '%"></b></i></div>'; }).join('');
    return '<div class="bdCard"><small>YOUR STYLE</small><h4>' + (s ? STYLES[s].icon + ' ' + STYLES[s].name : 'Still finding it') + '</h4><p>' + (s ? STYLES[s].sig : 'Skills, gear and the way you handle calls add up. When one side clearly leads, it becomes your style and changes how calls play.') + '</p>' + rows + '</div>'; }
  return { style, score, check, readLine, fastWin, fastPay, argue, bookTime, afterWay, card, STYLES };
}
