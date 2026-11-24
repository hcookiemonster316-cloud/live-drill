// Partner cases. Each partner who rides with you (Walsh, Park, Sgt. Castillo) has one personal story told in three
// short scenes, one per few shifts together, each after a call clears while they're riding with you. The third scene
// is the turning point: you help them make a choice, the moment is staged (twist card, illustration, a beat of
// silence), and from then on they talk differently at the start of every shift you ride together.
// No fact checks here: these scenes are the breather between calls (one choice per scene, and you can always leave).
export function installPartners(H) {
  const S = H.S; S.pcase = S.pcase || {};
  const st = (k) => (S.pcase[k] = S.pcase[k] || { rides: 0, stage: 0, out: null, last: -1 });
  const set = (k, out) => () => { const s = st(k); s.out = out; if (k === 'park' && out === 'cover') s.bench = 4; H.saveS(); };

  // the scenes: CASES[k][stage](id) -> { lines, twist? }. id is the partner's speaker id for dialogue().
  const CASES = {
    walsh: [
      (w) => ({ lines: [['narr', 'Walsh points at the corner coming up. "Pull over here a minute." There\'s a white cross by the curb, and fresh flowers.'],
        [w, 'Twenty years ago this month.'], [w, 'Don\'t ask yet. Just give me a minute.'], ['narr', 'He sits there with the window down. Then he taps the dash. "Okay. Let\'s go."']] }),
      (w) => ({ lines: [[w, '2004. Kid ran a red light in a stolen Civic. I was right behind him.'], [w, 'Policy said end it when it got dangerous. It got dangerous two blocks before that corner. I didn\'t end it.'],
        ['narr', 'The Civic went through the light at Ibis and hit a minivan. The boy in the back seat was nine.'],
        ['choice', [{ t: 'Ask him why he kept going', reply: [[w, 'Because I wanted to catch him. That\'s the honest answer. Took me ten years to say it out loud.']] },
          { t: 'Tell him it wasn\'t his fault', reply: [[w, 'Don\'t. He was running from my car. You\'ll learn the difference between your fault and your part.']] },
          { t: 'Stay quiet and let him talk', reply: [[w, '...Thanks. Nobody ever lets me just say it.']] }], 'Walsh is waiting to see what you do.']] }),
      (w) => ({ lines: [[w, 'The academy asks me every year to talk to the cadets about pursuits. Every year I say no.'], [w, 'They asked again. What would you do?'],
        ['choice', [{ t: 'Your class needs to hear it from you', reply: [['fx', set('walsh', 'talk')], [w, 'Yeah. Yeah, I figured you\'d say that.']] },
          { t: 'It\'s your story. You don\'t owe it to anyone', reply: [['fx', set('walsh', 'quiet')], [w, 'Maybe. I keep thinking it\'s the only thing I\'ve got that\'s worth teaching.']] }], 'Walsh wants a straight answer.']],
        twist: () => st('walsh').out === 'talk'
          ? { title: 'Walsh says yes', text: 'He calls the academy from the car. "Thursday. Tell them to bring questions. Tell them I\'ll answer all of them."', art: 'walsh' }
          : { title: 'Walsh keeps it', text: 'He nods and starts the car. On the way back he stops at the corner and leaves a coffee by the cross, like he does every year.', art: 'walsh' } })
    ],
    park: [
      (p) => ({ lines: [['narr', 'Park keeps looking back at the rear bumper every time you get in the car.'], [p, 'Did you hear anything earlier? When I backed out at the lot? No? Okay. Good. Nothing.']] }),
      (p) => ({ lines: [['narr', 'On your walk-around you find it: a fresh scrape and a cracked bumper cover, with yellow paint from a post.'],
        [p, 'Okay. That was me. Yesterday. I didn\'t turn around and look. I just used the camera.'], [p, 'Castillo\'s already on me about my reports. If this goes in, I\'m done.'],
        ['choice', [{ t: 'Next time turn around and look out the back', reply: [[p, 'Yeah. I know. I knew it yesterday too.']] },
          { t: 'Back up slow, with small steering moves', reply: [[p, 'Slow. Right. I was in a hurry to go nowhere.']] },
          { t: 'The camera helps, but it isn\'t enough', reply: [[p, 'That\'s what the book says, huh. Turn and look, then check the camera.']] }], 'Park looks like he\'s going to be sick.']] }),
      (p) => ({ lines: [[p, 'So. Do I write it up? A damage report goes straight to Castillo.'],
        ['choice', [{ t: 'Write it up today. You\'ll be okay.', reply: [['fx', set('park', 'report')], [p, 'Okay. Okay. Today. Before I chicken out.']] },
          { t: 'It\'s a small dent. Let it go.', reply: [['fx', set('park', 'cover')], [p, 'Yeah? Okay. Small dent. Nobody\'ll notice.']] }], 'Park is waiting on you.']],
        twist: () => st('park').out === 'report'
          ? { title: 'Park writes it up', text: 'He hands Castillo the damage report at end of shift, hands shaking. She reads it, signs it and says, "Thank you for telling me. Now go back it into a space. Turn around and look."', art: 'park' }
          : { title: 'Fleet finds it', text: 'The shop finds the dent at the next service and pulls the in-car video. Park gets a written reprimand for not reporting it. He doesn\'t ride with you for a while.', art: 'park' } })
    ],
    castillo: [
      (c) => ({ lines: [[c, 'I need Thursday morning off. Court.'], [c, 'Not my case. Well. Kind of mine.'], ['narr', 'She doesn\'t say anything else for a few blocks.']] }),
      (c) => ({ lines: [[c, 'Eleven years ago a wrong-way driver came down the eastbound lanes at two in the morning. My brother Marco was in the left lane.'],
        [c, 'The driver lived. He\'s up for parole. They asked if the family wants to speak.'],
        ['choice', [{ t: 'Ask her what she wants to tell them', reply: [[c, 'I don\'t know. That\'s the problem.']] },
          { t: 'Offer to drive her to the hearing', reply: [[c, '...Yeah. Okay. You drive. Don\'t talk.']] },
          { t: 'Tell her she doesn\'t have to go', reply: [[c, 'I know I don\'t. That\'s why it\'s hard.']] }], 'Castillo is looking out the window.']] }),
      (c) => ({ lines: [['narr', 'Thursday. The courthouse steps, early.'], [c, 'I wrote two letters. One says keep him in. One says I forgive him. I don\'t know which one is true.'],
        ['choice', [{ t: 'Read the true one, even if it\'s both', reply: [['fx', set('castillo', 'both')], [c, 'Both. Okay. Both, then.']] },
          { t: 'Read the one that lets you sleep', reply: [['fx', set('castillo', 'sleep')], [c, 'That one, then. I think I know which.']] }], 'Castillo holds both envelopes.']],
        twist: () => st('castillo').out === 'both'
          ? { title: 'She reads both', text: 'She reads both letters, one after the other. The man at the table cries through the second one. In the car after, she says, "Thanks for driving." Nothing else for an hour.', art: 'castillo' }
          : { title: 'She reads one', text: 'She folds one letter into her pocket and reads the other. Walking out, she drops the folded one in the trash, then goes back and takes it out again.', art: 'castillo' } })
    ]
  };
  // how they open a shift once their story has turned
  const AFTER = {
    walsh: { talk: ['Thursday went okay. One kid asked if I\'d do it different. I said yes. Every time.', 'I told your class to end it when it gets dangerous. Now I have to listen to myself.'],
      quiet: ['Morning. Coffee\'s on me. Don\'t say anything nice about it.', 'Two more years and I\'m out. I\'m trying to make them quiet ones.'] },
    park: { report: ['Hey! I backed into a space today. Turned all the way around. Like a professional.', 'Castillo said I\'m "coming along." I\'m getting that framed.'],
      cover: ['...Morning.', 'Castillo read me the riot act. Thanks for nothing. Kidding. Mostly.'] },
    castillo: { both: ['I slept last night. First time in a while.', 'Seat belts, every time. I mean it more than you know.'],
      sleep: ['Still got that letter in my pocket. Don\'t ask.', 'You did good last week. I don\'t say that much.'] }
  };
  // shifts together needed before each scene
  const NEED = [1, 3, 5];
  let pending = null, shiftNo = 0;
  function onShift(k) { shiftNo++; const pk = S.pcase.park; if (pk && pk.bench > 0) pk.bench--; if (k && CASES[k]) { st(k).rides++; } H.saveS(); }
  // a call cleared with a partner aboard: their next scene, if it's time, plays once the street is free
  function afterCall() {
    const p = H.partner(); if (!p || !CASES[p.k]) return; const s = st(p.k);
    if (s.stage >= 3 || s.rides < NEED[s.stage] || s.last === shiftNo) return;
    pending = { k: p.k, id: p.id, at: performance.now() + 2500 };
  }
  function tick() {
    if (!pending || performance.now() < pending.at || !H.free()) return;
    const { k, id } = pending, s = st(k); pending = null; if (s.stage >= 3) return;
    const sc = CASES[k][s.stage](id); s.last = shiftNo; H.saveS();
    H.dialogue(sc.lines, () => { s.stage++; H.saveS(); if (sc.twist) setTimeout(() => H.twist(sc.twist()), 400); }, { kicker: k === 'castillo' ? 'SGT. CASTILLO' : k === 'walsh' ? 'BERNIE WALSH' : 'THEO PARK' });
  }
  // a shift's opening line for a partner whose story has turned (null: use their usual lines)
  function startLine(k) { const s = S.pcase[k], a = s && s.out && AFTER[k] && AFTER[k][s.out]; return a ? a[(Math.random() * a.length) | 0] : null; }
  // after a cover-up Park sits out the next four shifts
  const benched = (k) => { const s = S.pcase[k]; return !!(s && s.bench > 0); };
  // ---- partners who bring it up ----
  // Each partner remembers the calls you worked together and how you handled them. Their trust in you (0-100) moves
  // with it, and it decides how they act on a call: a partner who trusts you backs your play, one who doesn't goes
  // quiet and second-guesses you. At the start of a later shift they bring up something you did together.
  let last = null; // the most recent change, for the HUD and the debrief
  const PM = (k) => { S.pmem = S.pmem || {}; return (S.pmem[k] = S.pmem[k] || { t: 60, log: [] }); };
  const trust = (k) => (k ? PM(k).t : 60);
  // what happened, and how much it moves their trust
  function remember(c, r, ext) {
    const p = H.partner(); if (!p) return 0; const m = PM(p.k); let d = 0, good = null, what = '';
    if (ext && ext.pur) { if (ext.pur === 'term' && !ext.ordered) { d = 6; good = true; what = 'called off that chase before it went bad'; } else if (ext.pur === 'term' && ext.ordered) { d = -2; good = false; what = 'kept chasing until the sergeant had to call it'; } else if (ext.pur === 'air') { d = 4; good = true; what = 'handed that chase to Air One'; } }
    else if (c && c.title) { const all = r && r.n && r.right === r.n;
      if (c.wrap === 'quick' && c.prio <= 2) { d = -4; good = false; what = 'left that ' + c.title.toLowerCase() + ' before it was done'; }
      else if (c.way === 'enforce' && c.rules && c.rules.intent === 'calm') { d = -4; good = false; what = 'came in hard on a calm person at ' + (c.where || 'that call'); }
      else if (all && c.readRight) { d = 4; good = true; what = 'read that person right at ' + (c.where || 'that call'); }
      else if (all) { d = 2; good = true; what = 'handled that ' + c.title.toLowerCase(); }
      else if (r && r.n && r.right === 0) { d = -2; good = false; what = 'missed everything on that ' + c.title.toLowerCase(); } }
    if (!d) return 0; m.t = Math.max(0, Math.min(100, m.t + d)); last = { k: p.k, d, w: what, t: m.t, at: Date.now() };
    m.log.push({ sh: shiftNo, g: good, w: what, where: c && c.where || '' }); if (m.log.length > 12) m.log.shift(); H.saveS(); return d; }
  const VOICE = {
    walsh: { g: ['Been thinking about when you {w}. That was good police work. I told the guys at the diner.', 'You {w}. Took me ten years to do that right. Keep doing it.'],
      b: ['We should talk about when you {w}. Not now. Later. But we should.', 'You {w}. I\'ve seen where that goes. Don\'t make it a habit.'] },
    park: { g: ['Remember when you {w}? I wrote it down. Like, in the notebook.', 'Okay so when you {w}, that\'s exactly what they teach. You actually do it.'],
      b: ['Can I say something? When you {w}, that kind of scared me.', 'I keep thinking about when you {w}. Was that right? It didn\'t feel right.'] },
    castillo: { g: ['When you {w}. Good work. It\'s in your file.', 'You {w}. That\'s the officer I want out here.'],
      b: ['When you {w}. Not your best. Don\'t do it again.', 'You {w}. I wrote that down too.'] } };
  // a line from an earlier shift together, once each
  function bringUp(k) { const m = S.pmem && S.pmem[k], V = VOICE[k]; if (!m || !V) return null; const e = m.log.slice().reverse().find((x) => x.sh < shiftNo && !x.told); if (!e) return null; e.told = 1; H.saveS();
    const L = e.g ? V.g : V.b; return L[(Math.random() * L.length) | 0].replace('{w}', e.w); }
  // how the partner acts on a call: 'good' backs you, 'short' goes quiet, 'even' in between
  // the small stuff counts too: a partner sees you take a minute with people on the street (up to three times a shift)
  let streetN = 0, streetSh = -1;
  const NOD = { walsh: ['That\'s the part of the job nobody writes down.', 'People remember that stuff. Trust me.'], park: ['Huh. I wouldn\'t have thought to do that.', 'Okay, that was nice. I\'m stealing that.'], castillo: ['Good.', 'That\'s how you buy goodwill you\'ll need later.'] };
  function street() { const p = H.partner(); if (!p) return null; if (streetSh !== shiftNo) { streetSh = shiftNo; streetN = 0; } if (streetN >= 3) return null; streetN++;
    const m = PM(p.k); m.t = Math.min(100, m.t + 1); last = { k: p.k, d: 1, w: 'took a minute with people on the street', t: m.t, at: Date.now() };
    if (streetN === 1) { m.log.push({ sh: shiftNo, g: true, w: 'took the time to talk with people on the street', where: '' }); if (m.log.length > 12) m.log.shift(); } H.saveS();
    const L = NOD[p.k]; return L && streetN <= 2 ? L[(streetN - 1) % L.length] : null; }
  const stance = (k) => { const t = trust(k); return t >= 70 ? 'good' : t < 40 ? 'short' : 'even'; };
  return { remember, street, bringUp, trust, stance, get last() { return last; }, onShift, afterCall, tick, startLine, benched, CASES, get state() { return S.pcase; }, get pending() { return pending; } };
}
