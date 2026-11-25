// Regulars who stay fresh (Action plan, Step F). On top of each regular's own lines and their heart lines, small talk
// reacts to what's true right now: the weather, the hour, the call you just came from, a new stripe on your sleeve,
// the kind of officer you've become, the unit you ride with, the season. Each regular remembers what they've already
// said to you: most of these come back only after a week, and the ones about your rank and your style are said once.
// Plain talk, the way people on a block actually talk to the officer they know.

const DAY = 864e5;
export function freshLines(c) {
  const out = [], add = (key, line, once) => out.push({ key, line, once: !!once });
  if (c.storm) add('wx-storm', 'They say it gets worse before midnight. You be careful out there.');
  else if (c.rain) add('wx-rain', 'You\'re soaked. Come stand under here a minute, the street isn\'t going anywhere.');
  if (c.fog) add('wx-fog', 'Can\'t see the end of the block in this. Drive slow, all right?');
  if (c.cold) add('wx-cold', 'Cold one. You want a coffee? I\'m only asking once.');
  if (c.hour < 7) add('t-early', 'You\'re out early. I didn\'t think anybody was up but me.');
  else if (c.hour >= 22 || c.hour < 2) add('t-late', 'You work nights too? Nobody should have to work nights.');
  if (c.lastWhere) add('call-' + c.lastWhere, 'Heard you were over on ' + c.lastWhere + ' earlier. Everything all right over there?');
  if (c.rankLvl > 0) add('rank-' + c.rankLvl, 'Is that a new stripe? Look at you. ' + c.rankName + '.', true);
  if (c.style === 'talker') add('style-talker', 'You actually listen when people talk. You know how rare that is?', true);
  if (c.style === 'observer') add('style-observer', 'You notice everything, don\'t you? I can see you doing it right now.', true);
  if (c.style === 'driver') add('style-driver', 'I see you come around that corner every day. You drive like you mean it, but you stop like you mean it too.', true);
  if (c.style === 'book') add('style-book', 'You\'re always so formal. It\'s fine. It\'s kind of nice, actually.', true);
  if (c.unit === 'k9') add('u-k9', 'Can I pet him? I\'m going to pet him. Is that allowed?');
  if (c.partner) add('p-' + c.partner, 'Who\'s that riding with you, ' + c.partner + '? Tell them they look like they need a coffee.');
  if (c.season === 'holiday') add('s-holiday', 'You working through the holidays? That\'s rough. Bring your partner by, I\'ll have cookies.');
  if (c.season === 'summer') add('s-summer', 'Hot one. You drinking water? You look like you aren\'t drinking water.');
  return out;
}
// the first line this regular hasn't said lately (or ever, for the once-only ones); null if they've said them all
export function pickFresh(S, id, c, now) {
  const said = (S.said = S.said || {})[id] || {}, cands = freshLines(c).filter((x) => !(x.key in said) || (!x.once && now - said[x.key] > 7 * DAY));
  if (!cands.length) return null; const x = cands[0]; S.said[id] = Object.assign(said, { [x.key]: now });
  const ks = Object.keys(S.said[id]); if (ks.length > 40) delete S.said[id][ks[0]]; return x.line;
}
