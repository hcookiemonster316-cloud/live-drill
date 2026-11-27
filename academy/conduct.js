// Conduct: the choice to do the wrong thing is real, and so is what happens after.
// Now and then a call puts a temptation in front of you: a driver's folded bill, cash nobody counted, a report that
// would be easier with one line left out, a suspect who mouthed off and is in handcuffs now, a plate you want to run
// for yourself. You can take it. Nothing stops you, and the lure is real (time saved, a problem gone). But somebody
// usually knows: your partner, the body camera, the property audit, the person you took it from. It reaches Internal
// Affairs, and at roll call you answer for it. You can own it or deny it, and the outcome follows the policy ladder:
// a reprimand and a few shifts on notice, gear taken back, a rank lost, a suspension, termination, or arrest.
// Fired or arrested, the screen says so, tells you why and how the rest of that life went, and lets you reload the
// start of the shift or start over as a new cadet. A new cadet keeps everything they've learned: this is a learning
// game, and the facts are yours.
// Loop: take a call -> choose (the honest way or the other way) -> the city remembers (IA, your standing, your file)
// -> your career grows or shrinks (standing gates the specialty units in units.js; discipline takes rank and gear).
// Reads and writes: the call scene (game.js openCallScene), roll call, the shift report, gear (S.gear), rank (S.xp),
// and stat modifiers (refreshGear adds the debuffs).

// each temptation: the call it fits (re), what kind of wrong it is, how serious (1 minor .. 4 criminal), the moment,
// the honest ways through, the wrong way and its lure, how likely someone saw (seen) or finds out later (later),
// what goes in your file, and how a career that ends over it is summed up.
export const TEMPT = [
  { id: 'bribe', re: /speed|reckless|red light|wrong-way|school zone|school bus|racing|traffic|fails to stop/i, kind: 'corruption', sev: 4,
    set: [['narr', 'The driver hands over the license with a folded hundred-dollar bill tucked behind it.'], ['$caller', 'Look, I really can\'t afford a ticket. Maybe we just forget this happened?']],
    q: 'There\'s money folded behind the license.',
    right: [{ t: 'Hand the bill back and write the citation', say: 'Put that away. I\'m going to pretend I didn\'t see it, once. Here\'s your citation.', reply: 'Okay. Okay. Sorry. That was stupid.' },
      { t: 'Tell them that\'s a bribe, and call your sergeant', say: 'That\'s an offer of a bribe, and it\'s a crime. I\'m calling my sergeant.', reply: 'Wait, no, I didn\'t mean it like that.' }],
    wrong: { t: 'Pocket the bill and let them go', say: 'Drive safe.', reply: 'Thank you, officer. Really.', lure: 'A hundred dollars, and the call clears ten minutes early.', clock: 10 },
    seen: .45, later: .3, what: 'Accepted a bribe on a traffic stop. The driver\'s dashcam recorded it.', epi: 'bribery' },
  { id: 'cash', re: /wallet|stolen|pawn|burglary|theft|package|property/i, kind: 'corruption', sev: 3,
    set: [['narr', 'You\'re logging the property. There\'s more cash than the owner listed, and nobody has counted it yet.']],
    q: 'Nobody has counted the cash yet.',
    right: [{ t: 'Count it in front of a witness and log every dollar', say: 'Before this goes in the bag, let\'s count it together. I want a witness on this.', reply: 'Three hundred and forty. Wow. Okay, it\'s all there.' },
      { t: 'Seal it as found and note the amount is uncounted', say: 'I\'m sealing it as found. Property can count it on camera.', reply: 'Okay. Thank you for being careful with it.' }],
    wrong: { t: 'Slip two twenties into your pocket', say: 'Okay. It\'s logged.', reply: 'Thank you so much. I thought it was gone forever.', lure: 'Forty dollars nobody will miss. Probably.', clock: 0 },
    seen: .2, later: .5, what: 'Took cash from found property. The owner\'s bank record and the property log didn\'t match.', epi: 'theft' },
  { id: 'gift', re: /business|proactive|neighborhood watch|coffee|market|pawn|bonds/i, kind: 'corruption', sev: 2,
    set: [['$caller', 'Hey, you guys are always looking out for us. Take this. A gift card, two hundred. Don\'t say no.']],
    q: 'They want you to take a gift card.',
    right: [{ t: 'Thank them, and turn it down', say: 'That\'s kind of you. I can\'t take it, but I appreciate it.', reply: 'Rules, huh? Okay. Coffee\'s still free whenever.' },
      { t: 'Suggest they donate it to the food pantry instead', say: 'I can\'t take it. Father Miguel\'s pantry could use it, though.', reply: 'Huh. Yeah. I\'ll drop it off there tomorrow.' }],
    wrong: { t: 'Take the gift card', say: 'Well. Thanks. That\'s generous.', reply: 'Anytime. And if you\'re ever in the neighborhood and we need you fast...', lure: 'Two hundred dollars, and a business that expects something now.', clock: 0 },
    seen: .3, later: .3, what: 'Accepted a gift from a business owner on your beat.', epi: 'gift' },
  { id: 'friend', re: /arrest|warrant|suspicious|disturbance|dispute/i, kind: 'corruption', sev: 3,
    set: [['narr', 'You know the person you\'re here for. You went to high school together.'], ['$caller', 'Come on. It\'s me. You can say you didn\'t find me. Nobody has to know.']],
    q: 'You know the person you\'re here for.',
    right: [{ t: 'Handle it by the book, and tell your sergeant you know them', say: 'I can\'t do that. And I\'m telling my sergeant I know you, so this is fair to both of us.', reply: 'Yeah. Okay. I figured.' },
      { t: 'Ask another unit to take it because of the conflict', say: '(over the radio) Dispatch, I know the subject personally. Can another unit take this?', reply: 'Thanks for not making it weird.' }],
    wrong: { t: 'Let them walk and clear it as gone on arrival', say: 'I never saw you. Go.', reply: 'You\'re a real one. I owe you.', lure: 'An old friend owes you, and it\'s a quick clear.', clock: 12 },
    seen: .25, later: .45, what: 'Let a person go and cleared the call as gone on arrival. The caller saw you talking to them.', epi: 'friend' },
  { id: 'report', re: /report|inspect|tire|transport|booking|backed into|records|crash/i, kind: 'dishonesty', sev: 2,
    set: [['narr', 'The report has a box for something you didn\'t actually do. Checking it would save you twenty minutes.']],
    q: 'The report has a box you can\'t honestly check.',
    right: [{ t: 'Leave it unchecked and go back and do it', say: 'Hang on. I didn\'t check that. Let me go do it now.', reply: 'Twenty minutes well spent.' },
      { t: 'Write exactly what you did and didn\'t do', say: 'I\'ll write it the way it went. Including what I missed.', reply: 'That\'s the report that holds up.' }],
    wrong: { t: 'Check the box anyway', say: 'Done. All boxes checked.', reply: 'Great. That\'s fast.', lure: 'Twenty minutes back in your shift.', clock: 20 },
    seen: .15, later: .45, what: 'Signed a report saying you completed a check you didn\'t do.', epi: 'report' },
  { id: 'cover', re: /crash|backed into|patrol car|post|pursuit/i, kind: 'dishonesty', sev: 3,
    set: [['narr', 'The damage is from your own mistake. The other driver didn\'t see it happen, and your partner is looking the other way.']],
    q: 'Nobody saw your mistake.',
    right: [{ t: 'Put your own mistake in the report', say: 'Before you write anything, that dent is mine. Put that in.', reply: 'Honest. That\'s rarer than you\'d think.' },
      { t: 'Call your sergeant out to the scene', say: '(over the radio) Sergeant, I need you out here. I was involved.', reply: 'Copy. On my way. Good call.' }],
    wrong: { t: 'Write it up as the other driver\'s fault', say: 'Looks like the other driver backed into it.', reply: 'Hey, I didn\'t touch your car.', lure: 'No crash on your record. Somebody else gets it instead.', clock: 0 },
    seen: .3, later: .5, what: 'Falsified a crash report to blame a civilian for damage you caused. A business camera showed what happened.', epi: 'falsify' },
  { id: 'testimony', re: /\bcourt\b|courtroom|testif|records request|pursuit report/i, kind: 'dishonesty', sev: 4,
    set: [['narr', 'Before you clear, a defense attorney calls about an old case: did you see the defendant drop the bag? You didn\'t. Your partner did.']],
    q: 'You didn\'t see it. Your partner did.',
    right: [{ t: 'Say you didn\'t see it yourself', say: 'I didn\'t see it myself. My partner did, and it\'s in their report.', reply: 'The attorney thanks you and hangs up. Your partner\'s report carries it.', who: 'narr' },
      { t: 'Say exactly what you saw and when', say: 'I saw the bag on the ground. I didn\'t see who dropped it.', reply: 'The attorney writes it down. It\'s the truth, and it holds.', who: 'narr' }],
    wrong: { t: 'Say you saw it', say: 'Yes. I saw him drop it.', reply: 'A pause on the line. "Interesting. Your report doesn\'t say that."', who: 'narr', lure: 'The case looks stronger, for now.', clock: 0 },
    seen: .6, later: .3, what: 'Testified under oath to something you did not see.', epi: 'perjury' },
  { id: 'shove', re: /disturbance|dispute|shouting|yelling|crowd|suspicious|fled|arrest|warrant|noise|landlord/i, kind: 'force', sev: 3,
    set: [['$caller', 'You\'re a joke. All of you. Go ahead, do something.'], ['narr', 'They step close and keep talking. They\'re loud, but they haven\'t touched you.']],
    q: 'They\'re loud, in your face, and they haven\'t touched you.',
    right: [{ t: 'Step back, make space, and keep talking', say: 'I\'m going to step back. You step back too. Then we talk.', reply: '...Fine. Whatever.' },
      { t: 'Give a clear warning, and call for another unit', say: 'Back up. That\'s your warning. (over the radio) Can I get another unit?', reply: 'Okay, okay. I\'m backing up.' }],
    wrong: { t: 'Shove them into the wall to shut them up', say: 'I said shut up.', reply: 'Ow. You all saw that. You saw that.', lure: 'They stop talking. Everyone is filming.', clock: 5 },
    seen: .7, later: .3, what: 'Used force on a person who was verbally abusive but not a threat. Three phones and your body camera recorded it.', epi: 'force' },
  { id: 'cuffed', re: /fled|foot|area search|building search|burglary|arrest|warrant/i, kind: 'force', sev: 4,
    set: [['narr', 'He ran, you caught him, and he\'s handcuffed on the ground now. Your knee hurts, and he\'s laughing at you.']],
    q: 'He\'s handcuffed and laughing at you.',
    right: [{ t: 'Sit him up, check him for injuries, and call it in', say: 'Sit up. Are you hurt anywhere? (over the radio) One in custody.', reply: 'Whatever. I\'m fine.' },
      { t: 'Step away and let your cover officer take him', say: 'Take him, please. I need a minute.', reply: 'Got him. Go breathe.' }],
    wrong: { t: 'Get a couple of hits in while nobody\'s watching', say: 'Laugh now.', reply: 'Hey! He\'s handcuffed! What are you doing?', lure: 'For about three seconds, it feels like justice.', clock: 0 },
    seen: .55, later: .45, what: 'Struck a handcuffed, restrained person. Your cover officer reported it.', epi: 'battery' },
  { id: 'chase', re: /fails to stop|pursuit|racing|wrong-way/i, kind: 'force', sev: 2,
    set: [['$disp', '(over the radio) Supervisor says terminate. Terminate the pursuit.'], ['narr', 'You can still see his taillights. Two more blocks and you\'d have him.']],
    q: 'You were told to terminate.',
    right: [{ t: 'Turn off the lights and siren and acknowledge', say: '(over the radio) Copy, terminating. Last seen northbound on Bay.', reply: '(over the radio) Copy. Good termination.' },
      { t: 'Terminate and give the plate and direction', say: '(over the radio) Terminating. Tag and direction to follow.', reply: '(over the radio) Copy. We\'ll get him later.' }],
    wrong: { t: 'Keep chasing and turn your radio down', say: 'Two more blocks.', reply: '(over the radio) Unit, acknowledge. I said terminate.', lure: 'You might catch him. You might not.', clock: 0 },
    seen: .85, later: .1, what: 'Continued a pursuit after a supervisor ordered it terminated.', epi: 'pursuit' },
  { id: 'plate', re: /tag|records|terminal|run a/i, kind: 'misuse', sev: 2,
    set: [['narr', 'You\'re at the terminal anyway. You could run your ex\'s new boyfriend\'s plate. Just to see.']],
    q: 'You could run a plate for yourself.',
    right: [{ t: 'Run only what the case needs and log off', say: 'Case number in, query out, logged off.', reply: 'Clean audit. Records loves you.' },
      { t: 'Close the terminal and walk away', say: 'Nope. Not mine to look at.', reply: 'Good. Every query gets audited.' }],
    wrong: { t: 'Run the plate', say: 'Just a quick look.', reply: 'Query logged. Reason field: blank.', lure: 'Now you know where he lives. You wish you didn\'t.', clock: 0 },
    seen: .1, later: .7, what: 'Ran a criminal justice database query for personal reasons. Every query is audited.', epi: 'query' },
  { id: 'errand', re: /./, kind: 'misuse', sev: 1, any: true,
    set: [['narr', 'Your dry cleaning is ready, and the shop is two blocks from here. The patrol car is right there.']],
    q: 'Your dry cleaning is two blocks away.',
    right: [{ t: 'Clear the call and pick it up after shift', say: 'After shift. Not in a marked car.', reply: '' },
      { t: 'Ask your sergeant if you can take your meal break there', say: '(over the radio) Sarge, requesting meal break at the plaza.', reply: '(over the radio) Approved. Thirty minutes.' }],
    wrong: { t: 'Swing by in the patrol car and leave it in the fire lane', say: 'Five minutes. Nobody will notice.', reply: '', lure: 'Clean shirts. A neighbor takes a photo of the car in the fire lane.', clock: -6 },
    seen: .4, later: .3, what: 'Used a marked patrol car for a personal errand and parked it in a fire lane.', epi: 'errand' },
  { id: 'sleep', re: /./, kind: 'misuse', sev: 1, any: true, night: true,
    set: [['narr', 'It\'s been a long night. There\'s a dark spot behind the warehouse where nobody would see the car.']],
    q: 'There\'s a dark spot nobody would see.',
    right: [{ t: 'Get coffee and stay on the street', say: 'Coffee. Then back out there.', reply: '' },
      { t: 'Tell your sergeant you\'re running on empty', say: '(over the radio) Sarge, I\'m fading. Can I take my break now?', reply: '(over the radio) Take it. Thanks for saying so.' }],
    wrong: { t: 'Park behind the warehouse and sleep an hour', say: 'Just an hour.', reply: '', lure: 'An hour of sleep. Dispatch called you twice.', clock: -60 },
    seen: .35, later: .4, what: 'Slept on duty and missed two radio calls.', epi: 'sleep' }
];

// what discipline looks like, step by step. Owning it honestly takes one step off; denying it when there's proof adds
// one (lying to Internal Affairs is its own offense).
export const LADDER = [
  null,
  { name: 'Written reprimand', standing: -6, debuff: { k: 'com', n: -1, shifts: 2, why: 'On notice' } },
  { name: 'Formal discipline', standing: -12, confiscate: true, debuff: { k: 'rap', n: -1, shifts: 3, why: 'Under review' } },
  { name: 'Demotion and suspension', standing: -22, demote: true, debuff: { k: 'rpCall', n: -50, shifts: 1, why: 'Suspended without pay', also: { rpCit: -50 } } },
  { name: 'Termination', fired: true },
  { name: 'Arrest', arrested: true }
];

// how a career that ended is summed up: why, then the rest of that life
export const EPILOGUE = {
  bribery: { why: 'You took a hundred dollars to let a driver go. The driver\'s dashcam had it all.', life: ['Convicted of bribery and official misconduct. Two years in state prison.', 'Your law enforcement certification is revoked for life. You drive a forklift on the night shift in Ocala, and you don\'t talk about the academy.'] },
  theft: { why: 'You took cash from property you were trusted to log.', life: ['Charged with grand theft and official misconduct. You plead to a lesser charge and serve eleven months.', 'You never wear a badge again. Years later, you still count your change twice.'] },
  gift: { why: 'You kept taking gifts from businesses on your beat, and they kept expecting things in return.', life: ['Terminated for repeated violations of the gratuity policy.', 'You sell insurance in Jacksonville now. You\'re good at it. People trust you, at first.'] },
  friend: { why: 'You let someone go because you knew them, and you cleared the call as if you never found them.', life: ['Terminated for neglect of duty and falsifying a call disposition.', 'Your old friend doesn\'t call anymore. Neither does anyone from your academy class.'] },
  report: { why: 'Your reports said you did things you hadn\'t done. Once a report is false, every report you wrote is in question.', life: ['Terminated. The State Attorney\'s office adds your name to its list of officers whose testimony needs to be disclosed.', 'You work security at a mall in Gainesville. Nobody asks you to write anything down.'] },
  falsify: { why: 'You blamed a civilian for damage you caused and put it in an official report.', life: ['Charged with falsifying an official record. You take a plea, and the conviction ends any chance of carrying a badge.', 'You drive for a delivery company. You check your mirrors every time.'] },
  perjury: { why: 'You testified under oath to something you never saw.', life: ['Convicted of perjury. Three cases you worked on are thrown out, and two guilty people walk free because of you.', 'You do eighteen months. You spend the rest of your life explaining the gap in your resume.'] },
  force: { why: 'You put your hands on someone who was only yelling. It was on three phones and your body camera.', life: ['Terminated for excessive force. The video gets four million views.', 'You move to another state and work construction. Some days, someone recognizes you.'] },
  battery: { why: 'You hit a man who was handcuffed on the ground. Your cover officer did the right thing and reported it.', life: ['Arrested and charged with battery under color of law. You serve thirty months.', 'You were a cadet for less than a year. You spend the rest of your life being the reason someone else\'s case was lost.'] },
  pursuit: { why: 'You kept chasing after you were ordered to stop, again.', life: ['Terminated for repeatedly disobeying a direct order during a pursuit.', 'You teach driving at a private school for a while. You tell every class to listen to the radio.'] },
  query: { why: 'You used the state\'s criminal justice database to look up someone for personal reasons. Every query is audited.', life: ['Terminated, and your database access is revoked for life. Misusing it is a crime in Florida.', 'You work in a warehouse office. You never look anyone up again.'] },
  errand: { why: 'You kept treating the patrol car and the shift like they were yours.', life: ['Terminated after repeated misuse of a department vehicle and neglect of duty.', 'You manage a car wash in Lakeland. You park in the fire lane there too, until the owner tells you to stop.'] },
  sleep: { why: 'You were asleep in the car while calls went unanswered, again.', life: ['Terminated for neglect of duty.', 'You find work on a day shift somewhere. You sleep fine now. Mostly.'] },
  standing: { why: 'Your file had too many entries. Each one was small, but together they said you couldn\'t be trusted with the job.', life: ['Terminated. Your certification is under review by the state commission.', 'You land somewhere else eventually. You think about the academy more than you\'d like to.'] }
};

const KEEP = ['log', 'seen', 'miss', 'facts', 'fmiss', 'fseen', 'fdue', 'frev', 'rvfix', 'answered', 'right', 'ch', 'ch5', 'cfg', 'sound', 'zoom', 'seenIntro', 'seenCine', 'tutDone', 'past']; // what a new cadet keeps: the learning
export const LEARNING = KEEP;
const CKPT = 'patrolcity:ckpt';

export function installConduct(H) {
  const S = H.S, esc = H.esc;
  const C = () => { const c = S.cond = S.cond || {}; if (c.standing == null) c.standing = 70; c.file = c.file || []; c.debuffs = c.debuffs || []; c.pending = c.pending || []; return c; };
  const shiftNo = () => H.shiftNo() || 0;
  const pick = (k, a) => H.pick(k, a);
  // the debuffs in effect, as stat changes the gear system adds in (refreshGear)
  function mods() { const out = {}; C().debuffs.forEach((d) => { out[d.k] = (out[d.k] || 0) + d.n; if (d.also) Object.keys(d.also).forEach((k) => { out[k] = (out[k] || 0) + d.also[k]; }); }); return out; }
  const standing = () => C().standing;
  function bump(n) { const c = C(); c.standing = Math.max(0, Math.min(100, c.standing + n)); }

  // one temptation at most per shift, on about one call in four, and never the same one twice in a row
  function tempt(c, cid, night, force) {
    const k = C(); if (!force && (k.tShift === shiftNo() || Math.random() > .28 || H.tutorial())) return [];
    const txt = (c.title || '') + ' ' + (c.text || ''); let pool = TEMPT.filter((t) => !t.any && t.re.test(txt)); if (!pool.length || Math.random() < .2) pool = pool.concat(TEMPT.filter((t) => t.any && (!t.night || night)));
    pool = pool.filter((t) => t.id !== k.lastT); if (force) pool = TEMPT.filter((t) => t.id === force); if (!pool.length) return [];
    const T = pool[Math.floor(Math.random() * pool.length)]; k.tShift = shiftNo(); k.lastT = T.id; c.tempt = T.id;
    const sub = (l) => [l[0] === '$caller' ? cid : l[0] === '$disp' ? H.dispId() : l[0], l[1]];
    const you = (t) => (t ? [['@you', t]] : []), back = (t, who) => (t ? [[who || cid, t]] : []);
    const right = T.right.map((o) => ({ t: o.t, honest: 1, say: you(o.say), reply: back(o.reply, o.who || (/^\(over the radio\)/.test(o.reply) ? H.dispId() : null)), fx: () => { bump(T.sev >= 3 ? 3 : 1); c.honest = 1; H.stat('honest'); } }));
    const wrong = { t: T.wrong.t, bad: 1, say: you(T.wrong.say), reply: back(T.wrong.reply, T.wrong.who || (/^\(over the radio\)/.test(T.wrong.reply) ? H.dispId() : null)).concat([['narr', T.wrong.lure]]), fx: () => commit(T, c) };
    const opts = right.concat([wrong]).sort(() => Math.random() - .5);
    return T.set.map(sub).concat([['choice', opts, T.q]]);
  }
  // you did it: the lure lands now, the rest comes later
  function commit(T, c) {
    const k = C(); H.clockAdd(-(T.wrong.clock || 0)); H.stat('wrongs');
    const pt = H.partner(); const seen = Math.random() < T.seen + (pt ? .15 : 0);
    k.pending.push({ id: T.id, sh: shiftNo(), seen, at: c.where || '', title: c.title || '' });
    if (pt) H.partnerTrust(-12); // your partner saw it, whether or not they say anything yet
    H.saveS();
  }
  // roll call: what Internal Affairs found since your last shift, and the debuffs that wore off
  function rollCall(done) {
    const k = C(); C().debuffs = k.debuffs.filter((d) => d.left > 0);
    const due = []; k.pending = k.pending.filter((p) => { const T = TEMPT.find((t) => t.id === p.id); if (!T) return false; const age = shiftNo() - p.sh; if (age < 1) return true;
      if (p.seen || Math.random() < T.later) { due.push(p); return false; } return age < 4; }); // an offense nobody caught in three shifts stays buried (your file doesn't know; you do)
    H.saveS(); if (!due.length) { done && done(); return; }
    hearing(due[0], () => { k.pending = k.pending.concat(due.slice(1).map((p) => Object.assign(p, { seen: true }))); H.saveS(); done && done(); });
  }
  // the hearing: what they have, your answer, the outcome
  function hearing(p, done) {
    const T = TEMPT.find((t) => t.id === p.id), k = C();
    const prior = k.file.filter((f) => f.sev >= 2).length, lines = [
      ['narr', 'Before roll call, Castillo stops you at the door. Someone from Internal Affairs is waiting in the sergeant\'s office.'],
      ['iacroft', 'Sit down, cadet. I\'m Lt. Croft. I\'ll keep this short.'],
      ['iacroft', 'On your ' + (p.title ? p.title.toLowerCase() + ' call' : 'last shift') + (p.at ? ' at ' + p.at : '') + ': ' + T.what],
      ['iacroft', prior ? 'This isn\'t the first entry in your file. You know that.' : 'Tell me what happened.']];
    let owned = null;
    lines.push(['choice', [
      { t: 'Tell the truth, all of it', say: [['@you', pick('ownIt', ['I did it. I knew it was wrong when I did it.', 'That\'s what happened. I don\'t have an excuse.', 'Yes. It was me. I\'m not going to lie to you about it.'])]], reply: [['iacroft', 'Thank you for not wasting my time. That counts for something.']], fx: () => { owned = true; } },
      { t: 'Deny it', say: [['@you', pick('denyIt', ['That\'s not what happened.', 'I don\'t know what you\'re talking about.', 'Whoever said that is lying.'])]], reply: [['iacroft', 'We have the record, cadet. Now we also have you lying to me about it.']], fx: () => { owned = false; } }
    ], 'Lt. Croft is waiting.']);
    lines.push(['fx', () => { const out = decide(T, owned, prior); return out.lines; }]);
    H.dialogue(lines, () => { const r = LAST; LAST = null; if (r && (r.fired || r.arrested)) end(r.arrested ? 'arrested' : 'fired', r.epi, done); else done && done(); }, { noLeave: true });
  }
  let LAST = null;
  // the outcome on the ladder, applied
  function decide(T, owned, prior) {
    const k = C(); let step = T.sev + (owned === false ? 1 : 0) - (owned && T.sev <= 3 ? 1 : 0) + (prior >= 2 && T.sev >= 2 ? 1 : 0); step = Math.max(1, Math.min(5, step));
    if (step === 5 && T.sev < 4) step = 4; // only a crime gets you arrested
    const R = LADDER[step], out = { lines: [], epi: T.epi };
    k.file.push({ id: T.id, kind: T.kind, sev: T.sev, what: T.what, owned: owned !== false, out: R.name, sh: shiftNo(), when: Date.now() });
    if (R.arrested) { out.arrested = true; out.lines.push(['iacroft', 'Stand up and turn around, please. You have the right to remain silent.']); }
    else if (R.fired) { out.fired = true; out.lines.push(['iacroft', 'Your employment is terminated, effective now. Leave your badge and your ID on the desk.']); }
    else {
      bump(R.standing || 0); const bits = [R.name + '.'];
      if (R.confiscate) { const slot = ['carry', 'belt', 'boots', 'cover', 'uniform'].find((s) => (S.gear || {})[s]); if (slot) { const id = S.gear[slot]; delete S.gear[slot]; if (S.items) delete S.items[id]; bits.push('Your ' + H.itemName(id) + ' is taken back.'); } }
      if (R.demote) { const dropped = H.demote(); if (dropped) bits.push('You\'re demoted to ' + dropped + '.'); }
      if (R.debuff) { const d = Object.assign({}, R.debuff, { left: R.debuff.shifts }); k.debuffs.push(d); bits.push(d.why + ' for ' + d.shifts + ' shift' + (d.shifts > 1 ? 's' : '') + '.'); }
      out.lines.push(['iacroft', bits.join(' ')]);
      if (k.standing <= 15) { out.fired = true; out.epi = 'standing'; out.lines.push(['iacroft', 'And with your file as it is now, the chief has decided. Your employment is terminated.']); }
      else out.lines.push(['castillo', owned ? 'You told the truth in there. Keep doing that, and this can be the worst day of your career instead of the last one.' : 'You lied to IA. That\'s the part people won\'t forget.']);
      H.refresh();
    }
    LAST = out; H.saveS(); return out;
  }
  // the end of a career: the stamp, why, the rest of that life, and what you do now
  function end(kind, epi, done) {
    const E = EPILOGUE[epi] || EPILOGUE.standing, rk = H.rankName(), cs = S.cs;
    S.past = (S.past || []).concat([{ cs, rank: rk, kind, why: E.why, at: Date.now() }]).slice(-12); H.saveS();
    H.closeAll(); document.body.classList.add('wasted', 'cine'); // everything else on screen steps aside
    const el = document.createElement('div'); el.className = 'endCareer ' + kind; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', kind === 'arrested' ? 'Arrested' : 'Fired');
    el.innerHTML = '<div class="ecStamp">' + (kind === 'arrested' ? 'ARRESTED' : 'FIRED') + '</div><div class="ecBody"><p class="ecWhy">' + esc(E.why) + '</p>' + E.life.map((l) => '<p>' + esc(l) + '</p>').join('') +
      '<p class="ecCs">' + esc(cs) + ' · ' + esc(rk) + ' · ' + H.shiftsServed() + ' shifts served</p><p class="ecKeep">Everything you learned stays with you. Every fact you\'ve mastered carries over.</p>' +
      '<div class="ecBtns"><button type="button" data-e="reload">Reload the start of that shift</button><button type="button" data-e="new">Start over as a new cadet</button></div></div>';
    document.body.appendChild(el); H.pause(true); setTimeout(() => el.classList.add('on'), 40); setTimeout(() => el.classList.add('body'), 1700);
    el.querySelector('[data-e="reload"]').onclick = () => reload();
    el.querySelector('[data-e="new"]').onclick = () => newCadet();
    void done;
  }
  // the start of every shift is a save you can go back to (learning made since then is kept)
  function checkpoint() { try { localStorage.setItem(CKPT, JSON.stringify(S)); } catch (e) {} }
  function hasCheckpoint() { try { return !!localStorage.getItem(CKPT); } catch (e) { return false; } }
  function keepLearning(into) { KEEP.forEach((k) => { if (S[k] != null) into[k] = S[k]; }); return into; }
  function reload() { let ck = null; try { ck = JSON.parse(localStorage.getItem(CKPT) || 'null'); } catch (e) {} if (!ck) return newCadet(); H.writeSave(keepLearning(ck)); location.reload(); }
  function newCadet() { const fresh = keepLearning({}); fresh.past = S.past || []; try { localStorage.removeItem(CKPT); } catch (e) {} H.writeSave(fresh); location.reload(); }
  // end of a shift: debuffs count down, and a clean shift with no new wrongs earns standing back slowly
  function endWatch() { const k = C(); k.debuffs.forEach((d) => { d.left = (d.left || 1) - 1; }); const wrong = k.pending.some((p) => p.sh === shiftNo()); if (!wrong) bump(2); H.saveS(); return wrong; }
  // the file, as the journal shows it
  function fileHtml() {
    const k = C(), d = k.debuffs.filter((x) => x.left > 0);
    return '<div class="cdFile"><div class="cdTop"><b>Standing</b><i class="rchBar"><i style="width:' + k.standing + '%"></i></i><span>' + k.standing + ' / 100</span></div>' +
      (d.length ? '<p class="cdDeb">' + d.map((x) => esc(x.why) + ' (' + x.left + ' shift' + (x.left > 1 ? 's' : '') + ' left)').join(' · ') + '</p>' : '') +
      (k.file.length ? '<ul>' + k.file.slice(-6).reverse().map((f) => '<li><b>' + esc(f.out) + '</b> ' + esc(f.what) + (f.owned ? ' You owned it.' : ' You denied it.') + '</li>').join('') + '</ul>' : '<p>Your file is clean.</p>') +
      ((S.past || []).length ? '<p class="cdPast">Careers before this one: ' + S.past.map((x) => esc(x.cs) + ' (' + (x.kind === 'arrested' ? 'arrested' : 'fired') + ')').join(', ') + '</p>' : '') + '</div>';
  }
  return { tempt, rollCall, endWatch, checkpoint, hasCheckpoint, mods, standing, bump, fileHtml, end, decide, hearing, keepLearning, get state() { return C(); } };
}
