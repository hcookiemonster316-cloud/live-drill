// Lives outside the job (Action plan, Step F). Some shifts, the partner riding with you has something going on that
// isn't the job, and it changes the shift: you hear it at roll call, it slips out once on a call, it comes to a head
// in one short scene, and the end-of-watch report says how it went. The regulars have days like that too: something
// in their life they tell you about, and one small thing you can do about it.
// Loop: drive the city -> a person, not a quest giver -> your choice -> they remember. It feeds partner trust, the
// regulars' friendship, the end-of-watch report and the overtime choice (one more call costs Walsh the first inning).
const rnd = (a) => a[(Math.random() * a.length) | 0];

// each partner day: the roll-call line, the line that slips out on a call, one short scene with a choice, and how
// overtime lands that night (null: it doesn't matter tonight)
export const PDAYS = {
  walsh: [
    { id: 'softball', start: 'My granddaughter pitches at seven. First game she\'s ever started. So no heroics after six, partner.', slip: '(checking his watch) Sorry. Go ahead. I\'m listening. I\'m mostly listening.',
      scene: [['walsh', 'Want to see her windup? My son sent a video. She does this thing with her glove. Look. Look at that.'],
        ['choice', [{ t: 'Watch the whole video with him', pt: 2, reply: [['walsh', 'Right? Right? Twenty-four years on and that\'s the best thing I\'ve seen in this car.']] }, { t: 'Tell him he\'ll make the game', pt: 1, reply: [['walsh', 'From your mouth. Dispatch has other ideas most nights.']] }, { t: 'Ask him to put the phone away', pt: -1, reply: [['walsh', '...Yeah. Fair. You\'re driving, I\'m watching. Got it.']] }]]],
      ot: [[-3, 'Walsh missed the first inning. She struck out the side, his son says. In the first inning.'], [2, 'Walsh made it for the first pitch. She hit the batter. He says they don\'t talk about it.']] },
    { id: 'knee', start: 'Knee\'s talking this morning. Rain coming. If there\'s a foot chase today, you\'re the foot chase.', slip: '(easing out of the car) You take the stairs. I\'ll take the witness at the bottom of them.',
      scene: [['narr', 'Walsh rubs his knee at a red light when he thinks you aren\'t looking.'], ['walsh', 'Twenty-four years of getting out of a car fast. The knee kept score.'],
        ['choice', [{ t: 'Offer to take the next door knock', pt: 2, reply: [['walsh', 'I\'ll let you. Don\'t tell anybody I let you.']] }, { t: 'Ask what he does for it', pt: 1, reply: [['walsh', 'Ice, complaining, and a doctor who says "at your age" a lot.']] }, { t: 'Say nothing and keep driving', reply: [['narr', 'He turns the radio up a notch. Neither of you mentions it.']] }]]], ot: null },
    { id: 'pension', start: 'Pension office called. Fourteen months. Not that I\'m counting. I\'m counting.', slip: 'Fourteen months from now somebody else gets this call. Hope they\'re as good as you. Don\'t let it go to your head.',
      scene: [['beat', { ms: 1200 }], ['walsh', 'You know what I\'m going to miss? Not this. Okay, this. The 3 a.m. diner. The people who wave.'],
        ['choice', [{ t: 'Ask what he\'ll do with his mornings', pt: 2, reply: [['walsh', 'Fish badly. Coach badly. Sleep past five, which I\'ve never done in my life.']] }, { t: 'Tell him he can\'t leave yet', pt: 1, reply: [['walsh', 'I\'ll leave you my radio presets. That\'s the whole inheritance.']] }, { t: 'Ask who\'ll take his beat after him', pt: 0, reply: [['walsh', 'Somebody who listens, I hope. Somebody like you, maybe.']] }]]], ot: null }],
  park: [
    { id: 'restaurant', start: 'I closed at my parents\' restaurant till two. If I yawn, it\'s not you, it\'s dumplings.', slip: '(yawning) Sorry. Sorry! I\'m awake. I\'m very awake. What did the caller say?',
      scene: [['park', 'My mom thinks this job is temporary. She keeps a white apron on my hook just in case.'],
        ['choice', [{ t: 'Ask him which one he wants', pt: 2, reply: [['beat', { ms: 1400 }], ['park', 'This. I want this. I just haven\'t figured out how to tell her yet.']] }, { t: 'Tell him to sleep at lunch, you\'ll wake him', pt: 2, reply: [['park', 'Twenty minutes. Set a timer. Set two timers.']] }, { t: 'Tell him to pick one before he burns out', pt: -1, reply: [['park', '...Yeah. I know. Everybody says that like it\'s easy.']] }]]],
      ot: [[-1, 'Park stayed for the extra call and fell asleep in the locker room in his uniform. His mother called twice.'], [1, 'Park got home before his mother woke up. She\'s still saving the apron.']] },
    { id: 'exam', start: 'Sergeant\'s exam is in three weeks. I\'m going to quiz you all shift. Is that weird? That\'s weird.', slip: 'Okay, quick, before we get there: what\'s the first thing you check on arrival? Don\'t answer, I\'ll get nervous.',
      scene: [['park', 'Can I tell you something? I failed it once already. Nobody knows that. Well. You do now.'],
        ['choice', [{ t: 'Offer to quiz him on the next quiet stretch', pt: 2, reply: [['park', 'Yes. Please. And don\'t go easy. Castillo never goes easy.']] }, { t: 'Tell him nobody will hear it from you', pt: 2, reply: [['park', 'Thanks. It\'s stupid how much that helps.']] }, { t: 'Tell him most people fail it once', pt: 1, reply: [['park', 'Is that true? Don\'t answer that either.']] }]]], ot: null }],
  castillo: [
    { id: 'father', start: '(her phone buzzes; she reads it and turns it face down) My father\'s at St. Brigid\'s. Hospice. If I step away today, that\'s why.', slip: '(her phone buzzes again on the dash; she lets it ring out) Keep going. I\'m here.',
      scene: [['narr', 'Her phone lights up with the hospice\'s number. She looks at it for a long second.'], ['castillo', 'I should take this.'],
        ['choice', [{ t: 'Tell her to take it. You\'ve got the next one.', pt: 3, set: 'castFather', reply: [['narr', 'She steps out of the car. You take the next call on your own. When she gets back, she says only one thing.'], ['castillo', 'Thank you. I won\'t forget it.']] }, { t: 'Ask if she wants to talk about him', pt: 2, reply: [['castillo', 'He taught me to drive in a cruiser he wasn\'t supposed to have. Another time. Thank you for asking.']] }, { t: 'Point out there\'s a call holding', pt: -2, reply: [['castillo', '(the phone goes dark) Right. Work. Let\'s go.']] }]]], ot: [[-2, 'Castillo stayed late because you did. She drove to St. Brigid\'s afterward. Visiting hours were over.'], [2, 'Castillo made it to St. Brigid\'s before visiting hours ended. She didn\'t say anything about it. She didn\'t have to.']] }]
};
// the regulars: a day in their life they tell you about, and one small thing you can do
export const RDAYS = {
  delgado: [['recital', 'My daughter\'s piano recital is tonight and I\'m wearing my good shirt under the apron. Don\'t tell her I cried at the rehearsal.', 'Tell him to film it for her', 'He shows you the good shirt. It has a mustard stain already.'],
    ['wheel', 'Cart wheel cracked on the curb this morning. Twenty years, first time. I\'m holding it up with a brick and a prayer.', 'Help him wedge the wheel straight', 'Between the two of you, the cart rolls again. Crooked, but it rolls.']],
  rosa: [['nephew', 'My nephew graduates today, first in the family. I\'m closing at four and I don\'t care who needs milk.', 'Ask her to tell him congratulations', 'She makes you promise to come by for cake. There is always cake.'],
    ['inventory', 'Inventory day. Every can, every candy bar. If you see me counting out loud, keep walking.', 'Hold the door while she brings boxes in', 'She loses count twice and blames you both times, smiling.']],
  johnson: [['nights', 'I stock shelves overnight at the grocery now. Crossing guard by day, cereal by night. I\'m fine. I\'m very fine.', 'Ask how she\'s holding up, really', '"Ask me in June," she says, and laughs, and means it.'],
    ['grandson', 'My grandson asked if I\'m a police officer because I have a sign. I told him yes. Don\'t correct me.', 'Tell her the sign counts', 'She stands up a little straighter. The sign does count.']],
  hal: [['storm', 'Small-craft advisory tonight. I\'ve doubled every line on this dock and I\'ll double them again.', 'Help him check the lines on slip four', 'He re-ties your knot without a word, then nods. That\'s high praise from Hal.']],
  earl: [['back', 'Back went out lifting a transmission. Doctor says rest. Doctor\'s never met a transmission.', 'Tell him to rest anyway', 'He says he will. He won\'t. But he sits down while he says it.']],
  hattie: [['jury', 'I got a jury summons. Me. I\'m the clerk. They spelled my name wrong on it. Twice.', 'Ask if she\'ll correct the summons', 'She already has. In red. With a note.']]
};

export function installLifeday(H) {
  const S = H.S, D = () => (S.ld = S.ld || { seen: {} });
  // the partner's day: rolled once a shift at roll call, about one shift in three, cycling through their days
  function start(k) {
    const d = D(), sh = H.shiftNo(); if (d.sh === sh) return d.k === k && d.day ? day().start : null;
    d.sh = sh; d.k = k; d.day = null; d.slip = 0; d.scene = 0; d.ot0 = H.overtime(); const L = PDAYS[k];
    if (L && Math.random() < .38) { const seen = d.seen[k] || [], left = L.filter((x) => seen.indexOf(x.id) < 0), pick = rnd(left.length ? left : L); d.day = pick.id; d.seen[k] = (left.length ? seen : []).concat([pick.id]); }
    H.saveS(); return d.day ? day().start : null;
  }
  const day = () => { const d = D(); return d.day && PDAYS[d.k] ? PDAYS[d.k].find((x) => x.id === d.day) : null; };
  const active = (k) => { const d = D(), x = day(); return x && d.sh === H.shiftNo() && d.k === k ? x : null; };
  // after a call: the first time, it slips out over the radio; the second, the scene plays once the street is free
  function afterCall() { const pt = H.partner(); const x = pt && active(pt.k); if (!x) return; const d = D();
    if (!d.slip) { d.slip = 1; H.saveS(); H.later(() => H.radio(H.ptName(pt), x.slip), 2500); return; } if (!d.scene) { d.scene = 1; d.want = 1; H.saveS(); } }
  function tick() { const d = D(), pt = H.partner(), x = pt && active(pt.k); if (!x || !d.want || !H.free()) return; d.want = 0; H.saveS();
    const lines = x.scene.map((l) => (l[0] === 'choice' ? ['choice', l[1].map((o) => Object.assign({}, o, { fx: () => { const m = H.pmem(pt.k); m.t = Math.max(0, Math.min(100, m.t + (o.pt || 0))); H.saveS(); } }))] : l[0] === pt.k ? [pt.id, l[1]] : l));
    H.dialogue(lines, () => H.stat('lifeScene'), { kicker: H.ptName(pt).toUpperCase() }); }
  // end of watch: how the night landed, a line for the report (and trust) when overtime mattered tonight
  function endWatch() { const d = D(), x = day(); if (!x || d.sh !== H.shiftNo() || !x.ot || d.otDone === d.sh) return ''; d.otDone = d.sh;
    const stayed = H.overtime() > (d.ot0 || 0), [dt, txt] = x.ot[stayed ? 0 : 1], m = H.pmem(d.k); m.t = Math.max(0, Math.min(100, m.t + dt)); H.saveS();
    return '<div class="nxCard lfCard"><small>AFTER THE SHIFT</small><p><span class="nxI">' + (stayed ? '🕰️' : '🏠') + '</span>' + H.esc(txt) + '</p></div>'; }
  // the regulars: about one in four has something going on today (the same all day), told once
  const today = () => new Date().toISOString().slice(0, 10);
  function regDay(id) { const L = RDAYS[id]; if (!L) return null; const fz = D().forceReg; if (fz && fz[id] != null) return L[fz[id]]; /* tests pick the day */ let h = 7; const s = today() + id; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; if (h % 4) return null; return L[(h >> 3) % L.length]; }
  function regTalk(id, sayId, name) { const x = regDay(id), d = D(), key = today() + ':' + id; if (!x || (d.told || {})[key]) return null;
    d.told = Object.assign({}, Object.keys(d.told || {}).filter((k) => k.slice(0, 10) === today()).reduce((o, k) => ((o[k] = 1), o), {}), { [key]: 1 }); H.saveS();
    return [[sayId, x[1]], ['choice', [{ t: x[2], npc: { [id]: 1 }, reply: [['narr', x[3]]], fx: () => H.award(10, name + ' remembers that') }, { t: 'Wish them luck with it', reply: [[sayId, rnd(['Thanks, officer.', 'I\'ll need it.', 'Appreciate you.'])]] }]]]; }
  return { start, afterCall, tick, endWatch, regDay, regTalk, active, PDAYS, RDAYS };
}
