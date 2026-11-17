// De-escalation: tense calls play out as a live conversation instead of a quiz. The person has a tension level that
// moves with every choice you make: where you stand, how you speak, whether you listen, and how long you take. Each
// person needs something different (to be heard, respected, in control, safe, or given time) and has one thing that
// sets them off. Win by bringing them down far enough that everyone goes home. Everything is recorded on your body
// camera, and afterwards you can review the footage with your sergeant's notes on every decision.
const ACT = {
  space: 'Step back and give them some room', approach: 'Move in closer so you can talk quietly', calm: 'Slow down and lower your voice', firm: 'Set one clear, calm boundary',
  name: 'Introduce yourself and ask their name', open: 'Ask what happened, in their own words', reflect: 'Name the feeling you are hearing', options: 'Offer two choices they can live with',
  explain: 'Explain exactly what happens next', silence: 'Say nothing for a moment and just listen', calmdown: 'Tell them they need to calm down', command: 'Order them to lower their voice now', joke: 'Try a little humor to ease things up'
};
const RISKY = ['calmdown', 'command', 'joke', 'approach'];
// what your sergeant says on the body cam review
const NOTE = {
  space: ['Distance buys time. Time is your friend.', 'You gave ground when you didn\'t need to. Fine, but don\'t drift out of earshot.'],
  approach: ['Closing in worked because they were already settling.', 'You stepped into their space while they were hot. Watch their shoulders go up right there.'],
  calm: ['Your voice set the volume for the whole scene.', 'Calm is good. Calm on its own can sound like you\'re not listening.'],
  firm: ['A boundary, said calmly, gives people something solid to hold.', 'Too early for a boundary. They needed to be heard first.'],
  name: ['Names make it two people talking, not a cop and a problem.', 'You already did introductions. Repeating it read as a stall.'],
  open: ['Open question, then you shut up. That\'s the whole trick.', 'Good question, wrong moment. They were too loud to answer it.'],
  reflect: ['"You sound scared." Four words, and the temperature dropped.', 'Naming feelings at the boiling point can sound like a script. Bring it down first.'],
  options: ['Two real choices gave them back a little control. Watch them take it.', 'Choices at that heat felt like a trap. Lower it first, then offer.'],
  explain: ['No surprises. People calm down when they can see what\'s coming.', 'The explanation was fine. It just wasn\'t what they needed.'],
  silence: ['You let the quiet do the work. Most people can\'t. You did.', 'Silence while they were that hot read like you weren\'t listening.'],
  calmdown: ['', 'Nobody in history has calmed down because they were told to. Look at the meter.'],
  command: ['', 'An order with no reason behind it. That was a spike, and you caused it.'],
  joke: ['Humor once the heat was gone. Nicely read.', 'A joke while they were furious. You saw the result.'],
  key: ['That\'s the one. You found what this was really about.', ''], wait: ['', 'You froze. Hesitation reads as not caring, or not knowing. Pick something.']
};
export const ENCOUNTERS = [
  { id: 'lockout', title: 'Man yelling at a landlord', where: 'apartments', who: 'Ray Kessler', icon: '🧔', need: 'heard', trigger: 'calmdown', t0: 78,
    setup: 'A man is pounding on the leasing office glass. The manager is behind the locked door with a phone to her ear. A few neighbors have their doors cracked open.',
    open: 'Finally! Somebody! She changed my locks. Today. With my whole life in there.',
    key: ['Ask what he needs from inside right now', 'My daughter\'s insulin. It\'s in the fridge. She\'s at school and she needs it by three. That\'s all I want. I don\'t even care about the rest today.'],
    better: ['...Yeah. Okay. Yeah. Sorry. I\'ve been out here forty minutes.', 'Nobody\'s asked me anything. They just tell me things.', 'You\'re actually listening. Okay.'],
    same: ['I already told you. I already told her.', 'Uh huh.'], worse: ['Don\'t tell me to calm down! Would YOU be calm?', 'Here we go. You\'re on her side.', 'Back up, man. Seriously. Back up.'],
    win: 'The manager agrees to let him in with you standing by, for the insulin and his work clothes. The lockout goes to the civil court where it belongs. He shakes your hand on the way in.', lose: 'He walks off down the street, still shouting. Nobody is hurt, but nothing is solved, and his daughter still needs that insulin.' },
  { id: 'fender', title: 'Fender bender turning into a shouting match', where: 'street', who: 'Monique Hale', icon: '👩', need: 'control', trigger: 'command', t0: 72,
    setup: 'Two cars nosed together at an intersection. One driver is gone; her passenger stayed. The other driver is standing in the lane, holding up traffic, phone camera on you.',
    open: 'He hit ME and his friend took off. And now I\'m the one standing here getting looked at like I did something.',
    key: ['Offer to take her statement while she sits in her car', 'In my car? With the AC? ...Yeah. Okay. I can do that. You\'ll write down that he left? Every word?'],
    better: ['Okay. That\'s fair. That\'s actually fair.', 'Thank you for not talking to me like I\'m stupid.', 'Fine. Fine. I\'ll move it.'],
    same: ['Whatever. Just do your job.', 'I\'m still recording, by the way.'], worse: ['Don\'t order me around. I\'m the victim here!', 'You\'re not even listening.', 'Are you serious right now?'],
    win: 'She moves her car to the shoulder herself, gives a full statement, and sends you her video of the other car leaving. Hit-and-run report filed, plate and all.', lose: 'She drives away before you finish. You have half a report and an angry video online with your face in it.' },
  { id: 'teen', title: 'Store security holding a teenager', where: 'store', who: 'Jordan, 15', icon: '🧒', need: 'respect', trigger: 'joke', t0: 70,
    setup: 'A boy in a school hoodie sits on a stack of boxes in the stockroom, arms crossed, jaw tight. The store security guard says he took a phone charger.',
    open: 'I paid for it. I PAID for it. But I guess I look like I didn\'t, right?',
    key: ['Ask security to check the register receipts', 'Register two. 3:12. Cash. ...Told you. Told everybody.'],
    better: ['...Okay. You\'re the first person who asked me anything.', 'I\'m not trying to be rude. I\'m just tired of this.', 'Fine. Yeah. My mom\'s number is in my phone.'],
    same: ['Whatever.', 'Can I go now?'], worse: ['That\'s funny to you? This is funny?', 'Here we go.', 'I want my mom. I\'m not saying anything else.'],
    win: 'The receipt matches. The guard apologizes, stiffly. Jordan\'s mom arrives and you tell her, in front of him, that he handled himself better than most adults would have.', lose: 'Jordan stops talking entirely. His mother arrives angry, the receipt turns up an hour later, and nobody leaves feeling okay.' },
  { id: 'smoke', title: 'Resident won\'t leave a smoky building', where: 'apartments', who: 'Mrs. Odessa Grant', icon: '👵', need: 'safety', trigger: 'approach', t0: 74,
    setup: 'A kitchen fire two floors up. The building is being cleared and fire crews are on the way. An older woman in a robe stands in the stairwell door and refuses to go any farther.',
    open: 'I am not leaving without Pickles. I don\'t care what you say. She\'s all I\'ve got.',
    key: ['Promise to tell fire crews exactly where Pickles hides', 'Under the radiator in the bedroom. She always goes there when the alarm goes. Tell them to bring a towel, she bites when she\'s scared. ...You\'ll really tell them?'],
    better: ['...You\'ll ask them? You promise?', 'Okay. Okay, I hear you.', 'She\'s gray. Little white sock on one foot.'],
    same: ['I\'m staying right here.', 'You don\'t understand.'], worse: ['Don\'t you grab me! Don\'t you dare!', 'You\'re not listening to me!', 'Then I\'ll go back up myself.'],
    win: 'She walks down the stairs with you. Ten minutes later a firefighter comes out with a gray cat in a towel and one bitten thumb. Mrs. Grant cries and so does the firefighter, a little.', lose: 'She retreats back up the stairs. The fire crew has to bring her out themselves, and she will not look at a uniform for a long time.' },
  { id: 'followed', title: 'Man shouting at cars, says he\'s being followed', where: 'street', who: 'Elijah', icon: '🧑', need: 'time', trigger: 'approach', t0: 80,
    setup: 'A man in his thirties is standing on a bus bench, shouting at passing cars. He keeps checking over his shoulder. A store owner called it in. He is not threatening anyone; he is frightened.',
    open: 'They\'re in the white cars. Every white car. You see it, right? Tell me you see it.',
    key: ['Ask if there\'s someone he trusts you could call', 'My sister. Naomi. She knows. She always knows what to do. Her number\'s... it\'s on the card in my wallet. You\'d call her? Not a hospital?'],
    better: ['...You\'re not with them. Okay.', 'It\'s been three days. I haven\'t slept.', 'Can you... can you just stand there a minute?'],
    same: ['There\'s another one.', 'I can\'t stop watching.'], worse: ['Get back! Get BACK!', 'That\'s what they\'d say.', 'You\'re one of them, aren\'t you.'],
    win: 'He climbs down. His sister Naomi arrives twenty minutes later with the crisis counselor you requested, and he goes with them on his own, calmly, to get help.', lose: 'He runs across the lot. Nobody is hurt. The crisis team keeps looking for him, and you replay every word on the drive back.' },
  { id: 'noise', title: 'Noise complaint about to boil over', where: 'apartments', who: 'Mr. Feld', icon: '🧑', need: 'heard', trigger: 'calmdown', t0: 66,
    setup: 'A man in hospital scrubs is standing in a hallway banging on a neighbor\'s door. Bass is thumping inside. It is two in the afternoon.',
    open: 'I work nights. ICU. I\'ve slept four hours in three days. This is the fifth time this week.',
    key: ['Offer to knock with him and talk to the neighbor together', 'You\'d do that? With me there? ...I just want them to know someone lives here. That\'s all. I\'m not trying to start a war.'],
    better: ['Yeah. Okay. That\'s exactly it.', 'Sorry. I\'m not usually like this.', 'I just want to sleep.'],
    same: ['They never answer.', 'Every. Single. Day.'], worse: ['Calm down? I keep people alive at night! Don\'t tell me to calm down!', 'So I\'m the problem now.', 'Forget it. Forget it.'],
    win: 'The neighbor turns out to be a college kid with no idea anyone sleeps days. They swap numbers. The bass goes off. Mr. Feld says it\'s the first time he\'s smiled this week.', lose: 'He slams his own door. The music keeps going. You\'ll be back here, and next time it will be worse.' }
];

export function installDeesc(H) {
  const S = H.S, esc = H.esc;
  let E = null, timer = 0, tick = 0;
  function eff(a, st) {
    const T = st.T, p = st.p, used = st.used[a] || 0, dim = a === 'key' ? 1 : used ? .4 : 1; let d = 0;
    if (a === 'space') d = T > 60 ? -10 : -4; else if (a === 'approach') d = T > 55 ? 10 : -3; else if (a === 'calm') d = -6; else if (a === 'firm') d = T > 75 ? 5 : p.need === 'control' ? 3 : -7;
    else if (a === 'name') d = used ? 1 : -8; else if (a === 'open') d = T > 88 ? -4 : p.need === 'heard' ? -13 : -8; else if (a === 'reflect') d = T > 90 ? -3 : p.need === 'heard' || p.need === 'respect' ? -14 : -9;
    else if (a === 'options') d = p.need === 'control' ? -14 : T > 80 ? 3 : -6; else if (a === 'explain') d = p.need === 'safety' ? -12 : -5; else if (a === 'silence') d = p.need === 'time' ? -10 : T > 70 ? 4 : -4;
    else if (a === 'calmdown') d = 12; else if (a === 'command') d = T > 60 ? 10 : 4; else if (a === 'joke') d = T < 35 ? -8 : 10; else if (a === 'key') d = -22;
    if (a === p.trigger) d += 8; if (d < 0) d *= dim; return Math.round(d);
  }
  function offer(st) {
    const all = Object.keys(ACT), good = all.filter((a) => !RISKY.includes(a)).sort((a, b) => eff(a, st) - eff(b, st)), risky = RISKY.filter((a) => a !== st.last);
    const pick = [good[Math.floor(Math.random() * 2)], good[2 + Math.floor(Math.random() * 4)], risky[Math.floor(Math.random() * risky.length)]];
    if (st.keyOpen && !st.used.key) pick[1] = 'key';
    return [...new Set(pick)].sort(() => Math.random() - .5);
  }
  const posture = (T) => T > 85 ? 'Shouting, pacing, fists clenched' : T > 65 ? 'Loud, arms crossed, won\'t sit' : T > 45 ? 'Talking fast, watching you closely' : T > 25 ? 'Shoulders down, listening' : 'Calm, nodding along';
  const col = (T) => T > 75 ? '#ef4444' : T > 50 ? '#f59e0b' : T > 25 ? '#facc15' : '#22c55e';
  function start(c, done) {
    const p = ENCOUNTERS.find((x) => x.id === c.deesc) || ENCOUNTERS[0];
    E = { p, c, done, T: p.t0, used: {}, turn: 0, log: [{ t: 0, a: null, T: p.t0, line: p.open }], keyOpen: false, last: null, t0: performance.now() };
    H.setPaused(true); H.buzz && H.buzz('ok'); render(p.open, null);
  }
  function render(line, delta) {
    const st = E, p = st.p; if (!st) return; clearInterval(timer);
    if (st.T <= 18) return end('win'); if (st.T >= 100) return end('lose'); if (st.turn >= 9) return end(st.T <= 40 ? 'win' : 'partial');
    const opts = offer(st); st.opts = opts; const secs = 14; let left = secs;
    H.openModal('<div class="deBox"><div class="deHead"><span class="deRec">● REC</span><b>' + esc(p.title) + '</b><small>' + esc(st.c.where || '') + '</small></div>' +
      (st.turn === 0 ? '<p class="deSet">' + esc(p.setup) + '</p>' : '') +
      '<div class="deWho"><i class="deIco">' + p.icon + '</i><div><b>' + esc(p.who) + '</b><small>' + posture(st.T) + '</small></div></div>' +
      '<div class="deMeter"><span>Tension</span><em><u style="width:' + st.T + '%;background:' + col(st.T) + '"></u></em><strong style="color:' + col(st.T) + '">' + (delta == null ? '' : delta > 0 ? '▲' : delta < 0 ? '▼' : '·') + '</strong></div>' +
      '<blockquote class="deLine">' + esc(line) + '</blockquote><div class="deTimer"><u id="deT"></u></div>' +
      '<div class="dlgOpts deOpts">' + opts.map((a, k) => '<button type="button" data-k="' + k + '"><span class="kk">' + (k + 1) + '</span><span class="ot">' + esc(a === 'key' ? p.key[0] : ACT[a]) + '</span></button>').join('') + '</div>' +
      '<div class="qAct deAlt"><button type="button" class="ghost" id="deBack">Call for a cover unit</button><button type="button" class="ghost" id="deLeave">Give it time and step away</button></div></div>');
    document.querySelectorAll('.deOpts [data-k]').forEach((b) => b.onclick = () => choose(opts[+b.dataset.k]));
    const bb = document.getElementById('deBack'); if (bb) bb.onclick = () => { st.backup = 1; bb.disabled = true; bb.textContent = 'Cover unit on the way'; H.toast('Cover unit en route. Keep talking.'); };
    const lv = document.getElementById('deLeave'); if (lv) lv.onclick = () => end('walk');
    const bar = document.getElementById('deT'); if (S.cfg && S.cfg.timers === 'off') { if (bar) bar.parentNode.style.visibility = 'hidden'; } else timer = setInterval(() => { left -= .25; if (bar) bar.style.width = Math.max(0, left / secs * 100) + '%'; if (left <= 0) { clearInterval(timer); choose('wait'); } }, 250);
    tick = (e) => { if (/^[1-4]$/.test(e.key) && opts[+e.key - 1]) choose(opts[+e.key - 1]); }; window.onkeydown = tick;
  }
  function choose(a) {
    const st = E; if (!st) return; clearInterval(timer); window.onkeydown = null;
    const before = st.T, d = a === 'wait' ? 5 : eff(a, st); st.T = Math.max(0, Math.min(100, st.T + d)); st.used[a] = (st.used[a] || 0) + 1; st.turn++; st.last = a;
    if (a === 'open' || a === 'reflect' || a === 'silence') st.keyOpen = st.T < 75;
    const p = st.p, line = a === 'key' ? p.key[1] : a === 'wait' ? '...Hello? Are you going to say something?' : d <= -6 ? pick(p.better) : d >= 4 ? (a === p.trigger ? p.worse[0] : pick(p.worse.slice(1))) : pick(p.same);
    st.log.push({ t: (performance.now() - st.t0) / 1000, a, T: st.T, before, d, line });
    if (d >= 8 && H.buzz) H.buzz('bad'); render(line, d);
  }
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  function end(how) {
    const st = E; if (!st) return; clearInterval(timer); window.onkeydown = null; E = null; const p = st.p;
    const text = how === 'win' ? p.win : how === 'lose' ? p.lose + ' Your cover unit arrives and Sgt. Castillo takes over the conversation. Sim round over; nobody was hurt.' : how === 'walk' ? 'You step back and give it space. Sometimes time is the tool. ' + (st.T < 60 ? 'They watch you go, quieter than when you arrived. You\'ll check back in an hour.' : 'It isn\'t solved, but it didn\'t get worse.') : 'Not solved, not worse. You leave a card and a plan to follow up.';
    const xp = how === 'win' ? 110 + Math.max(0, 9 - st.turn) * 8 : how === 'walk' ? 35 : how === 'partial' ? 45 : 15, best = st.log.filter((l) => l.d <= -10).length;
    S.de = S.de || { n: 0, win: 0 }; S.de.n++; if (how === 'win') S.de.win++; H.saveS();
    H.openModal('<div class="deBox"><div class="deHead"><span class="deRec">■ STOP</span><b>' + (how === 'win' ? 'Everyone went home' : how === 'lose' ? 'It got away from you' : 'Left for another day') + '</b><small>' + esc(p.title) + '</small></div><p class="deSet">' + esc(text) + '</p>' +
      '<div class="deSum"><span>Turns <b>' + st.turn + '</b></span><span>Final tension <b>' + st.T + '</b></span><span>Strong moves <b>' + best + '</b></span><span>+' + xp + ' RP</span></div>' +
      '<div class="qAct"><button type="button" id="deCam">▶ Review body cam</button><button type="button" class="ghost" id="mClose">Back in service</button></div></div>');
    const fin = () => { H.closeModal(); H.setPaused(false); H.award(xp, 'de-escalation ' + how); if (st.done) st.done(how, st); };
    document.getElementById('mClose').onclick = fin; document.getElementById('deCam').onclick = () => bodycam(st, fin);
  }
  // ---------------- body cam replay ----------------
  function bodycam(st, fin) {
    const W = 520, Hh = 110, n = st.log.length, x = (i) => 20 + i * (W - 40) / Math.max(1, n - 1), y = (T) => 10 + (100 - T) / 100 * (Hh - 20);
    const path = st.log.map((l, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(l.T).toFixed(1)).join(' ');
    const ts = (s) => '00:' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    const stamp = new Date(); const head = 'BODY CAM · ' + esc(S.cs || 'UNIT') + ' · ' + stamp.toLocaleDateString() + ' · ' + stamp.toTimeString().slice(0, 5);
    H.openModal('<div class="bcBox"><div class="bcHead"><span class="deRec">● ' + head + '</span></div>' +
      '<svg class="bcGraph" viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="none"><rect x="0" y="0" width="' + W + '" height="' + Hh + '" fill="#0b1220"/><line x1="0" x2="' + W + '" y1="' + y(18) + '" y2="' + y(18) + '" stroke="#22c55e" stroke-dasharray="4 4" stroke-width="1"/><path d="' + path + '" fill="none" stroke="#f5b800" stroke-width="2.5"/>' +
      st.log.map((l, i) => '<circle cx="' + x(i) + '" cy="' + y(l.T) + '" r="4" fill="' + (l.d == null ? '#94a3b8' : l.d <= -6 ? '#22c55e' : l.d >= 4 ? '#ef4444' : '#facc15') + '"/>').join('') + '</svg>' +
      '<ol class="bcList">' + st.log.map((l, i) => { if (!l.a) return '<li><time>' + ts(0) + '</time><div><b>Arrival</b><q>' + esc(l.line) + '</q></div></li>';
        const good = l.d <= -6, bad = l.d >= 4, note = l.a === 'key' ? NOTE.key[0] : (NOTE[l.a] || ['', ''])[good ? 0 : bad ? 1 : 0] || (bad ? 'That one cost you.' : 'Neutral. It didn\'t hurt, it didn\'t help much.');
        return '<li class="' + (good ? 'g' : bad ? 'b' : '') + '"><time>' + ts(l.t) + '</time><div><b>' + esc(l.a === 'wait' ? '(You hesitated)' : l.a === 'key' ? st.p.key[0] : ACT[l.a]) + ' <em>' + (l.d > 0 ? '+' : '') + l.d + '</em></b><q>' + esc(l.line) + '</q><p class="bcNote"><i>Sgt. Castillo:</i> ' + esc(note) + '</p></div></li>'; }).join('') + '</ol>' +
      '<div class="qAct"><button type="button" id="mClose">Close the footage</button></div></div>');
    document.getElementById('mClose').onclick = fin;
  }
  const isOpen = () => !!E;
  return { start, isOpen, ENCOUNTERS };
}
