// Choices that come back. What you did on a call is remembered by the person and the place it happened to, then told
// back to you where you can see it: a "since your last shift" briefing, people on the street bringing it up as you walk
// past, a caller at the same address remembering last time, and promises to check back that are kept or broken.
const rnd = (a) => a[(Math.random() * a.length) | 0];
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => (o[k] != null && o[k] !== '' ? o[k] : k === 'who' ? 'the caller' : 'that address'));

// what each kind of deed sounds like when it comes back: in the briefing, from a passer-by, and from the same caller
const ECHO = {
  help: { icon: '🤝', good: 1,
    brief: ["{who} on {where} called the front desk to say thank you.", "{who} on {where} told her neighbors the officer actually listened.", "{who} from {where} used the number you gave her. Things are better there."],
    bark: ["You're the one who helped {who}. She's told everybody.", "Heard what you did for {who} over on {where}. Thank you.", "{who} says you're one of the good ones."],
    back: ["Oh, it's you again. Good. You were good to me last time.", "I asked for you, you know. You listened last time."] },
  quick: { icon: '💬', good: 0,
    brief: ["{who} on {where} called back with questions you didn't stay to answer.", "{who} on {where} told dispatch she felt rushed last time."],
    bark: ["That officer was in and out of {where} in two minutes.", "{who} said you didn't even sit down."],
    back: ["Last time you were out the door in two minutes. Can you stay a bit this time?", "I still had questions after last time. Nobody answered them."] },
  harsh: { icon: '📋', good: 0,
    brief: ["A neighbor on {where} complained about how hard you came in. It's in your file.", "People on {where} are still talking about how loud that call was."],
    bark: ["That's the one who came in loud on {where}.", "My kids were scared half to death when you came in like that."],
    back: ["Please don't come in like last time. The whole street was staring.", "Last time you scared the kids. Can we keep it calm today?"] },
  deeswin: { icon: '☕', good: 1,
    brief: ["The man you talked down on {where} came by the station with coffee for the night shift.", "Somebody filmed you talking that man down on {where}. The comments are kind."],
    bark: ["Heard you talked that guy down without laying a hand on him.", "My cousin saw you on {where}. Said you were cool as anything."],
    back: ["You're the one who talked my brother down. I won't forget that."] },
  deeslose: { icon: '📰', good: 0,
    brief: ["People on {where} are still talking about how fast that call went bad.", "Sgt. Castillo wants to walk through the call on {where} with you."],
    bark: ["Wasn't that a mess on {where} the other day?", "That call on {where} went sideways fast."],
    back: ["Let's not have a repeat of last time, okay?"] },
  purterm: { icon: '⭐', good: 1,
    brief: ["Sgt. Castillo noted that you ended the pursuit on {where} when it got too risky. Nobody got hurt.", "The car you let go on {where} was found parked the next morning. Nobody got hurt."],
    bark: ["You're the one who backed off that chase near the school. Smart.", "Glad you didn't chase that guy through here. My kids walk this way."],
    back: [] },
  purbad: { icon: '📋', good: 0,
    brief: ["The pursuit on {where} is under review. Sgt. Castillo wants to talk about it.", "A driver on {where} says your pursuit nearly hit her car. She filed a complaint."],
    bark: ["You almost hit my car chasing that guy.", "That chase came way too close to the bus stop."],
    back: [] },
  solved: { icon: '🔎', good: 1,
    brief: ["The detectives made the case on {where} from the scene you pieced together.", "{who} on {where} heard the case got made. Word is the patrol officer figured it out."],
    bark: ["You're the one who figured out what happened on {where}.", "Heard you read that scene on {where} like a book."],
    back: ["You figured out what happened last time. I told everybody."] },
  kept: { icon: '🏠', good: 1,
    brief: ["{who} told the whole block you came back like you said you would.", "{who} on {where} wrote a letter to the chief about you checking back on her."],
    bark: ["You came back to check on {who}. People noticed.", "{who} says you kept your word. That's rare."],
    back: ["You came back last time when you said you would. I trust you."] },
  broke: { icon: '🏠', good: 0,
    brief: ["{who} on {where} waited for you to come back. You never did.", "{who} told her neighbors you said you'd come back, and didn't."],
    bark: ["{who} said you'd come back. She waited.", "Aren't you the one who was going to check on {who}?"],
    back: ["You said you'd come back last time. You didn't.", "I waited for you last time. Are you going to stay this time?"] }
};
// delayed consequences: a call that didn't fully land plants a later one at the same address. What you missed comes
// back as the thing it turned into, a rushed visit gets a call back, a heavy-handed one a complaint. Going back and
// getting it right closes it. [title, what dispatch says], per lesson for what got missed
const CONS = {
  0: ['Breakdown on {where}', 'The car from your last call on {where} broke down in traffic. Whatever got skipped on the walk-around gave out.'],
  1: ['Near miss on {where}', 'Somebody almost got hit on {where}, right where you were last time. People there are asking what was missed.'],
  2: ['Slide-off on {where}', 'A car slid off the road on {where}. Same stretch you handled before, same conditions.'],
  3: ['Fender bender on {where}', 'Two cars touched on {where}, the spot from your last call. The setup there never got fixed.'],
  4: ['Load spilled on {where}', 'A load came off a vehicle on {where}. Same driver, same habit as last time.'],
  5: ['Car in the ditch on {where}', 'A driver overcorrected into the ditch on {where}. You talked to them there before.'],
  6: ['Rear-end on {where}', 'Rear-end crash on {where}. The braking problem from your last call there came back.'],
  7: ['Wide turn crash on {where}', 'A vehicle swung wide on the corner at {where} and hit a parked car. You were here before.'],
  8: ['Backing crash on {where}', 'Something got backed into on {where}. Same yard, same habit as last time.'],
  9: ['Dark road crash on {where}', 'A crash on the dark stretch at {where}. The thing you were sent about last time is still out there.'],
  10: ['Blocked emergency lane on {where}', 'An ambulance got held up on {where} again. People remember you were here last time.'],
  11: ['Transport trouble on {where}', 'A transport ran into trouble on {where}. It\'s the same setup you saw last time.']
};
const SEED = { missed: { prio: 2, line: 'Last time you were here, something got missed. This is what it turned into.', brief: 'Still open on {where}: what got missed last time is going to come back.' },
  callback: { prio: 3, line: '{who} called back. Last time you were in and out before they finished.', title: 'Call back to {where}', text: '{who} on {where} is calling again. They say nobody answered their questions last time.', brief: '{who} on {where} has questions you didn\'t stay for. Expect a call back.', intent: 'nervous' },
  walked: { prio: 2, line: 'He\'s back on the same block, and the people who called it in last time are scared.', title: 'He\'s back on {where}', text: 'The man from the arrest on {where} is back. The case got dismissed, and the neighbors want to know what happens now.', brief: 'The case from {where} fell apart in court. He\'s back out there, and that block will call again.', intent: 'angry' },
  complaint: { prio: 3, line: 'The neighbors remember how hard you came in last time.', title: 'Neighbor complaint on {where}', text: 'A neighbor on {where} wants to talk to the officer who came in so hard last time.', brief: 'Somebody on {where} is still upset about how hard you came in. It will come up again.', intent: 'angry' } };
const HARSH = { front: 1, loud: 1 }, GENTLE = { quiet: 1, smart: 1, neighbors: 1, observe: 1 };

export function installMemory(H) {
  const S = H.S; S.mem = S.mem || { d: [], shift: 0, pr: [] };
  const M = S.mem; M.d = M.d || []; M.pr = M.pr || []; M.seed = M.seed || [];
  const did = () => H.did();
  function note(k, o) {
    if (!ECHO[k] || !o) return null;
    const d = { k, who: o.who || '', where: o.where || '', x: o.x, y: o.y, did: o.did != null ? o.did : did(), sh: M.shift, at: Date.now(), told: 0, said: 0 };
    M.d.push(d); while (M.d.length > 40) M.d.shift(); if (H.onNote) H.onNote(d); H.saveS(); return d;
  }
  const who = (c) => c.vcn || '';
  // a call scene wrapped: how you came in and how you left are what the person remembers
  function afterCall(c) {
    if (!c || c.ops || c.deesc) return;
    const o = { who: who(c), where: c.where, x: c.x, y: c.y };
    if (HARSH[c.eff]) note('harsh', o);
    else if (c.wrap === 'quick') note('quick', o);
    else if (c.wrap !== 'promise' && (c.wrap === 'case' || c.wrap === 'resources' || GENTLE[c.eff])) note('help', o); // a promise is judged by whether you keep it
    if (c.wrap === 'promise' && c.x != null) { M.pr.push({ who: o.who, where: c.where, x: c.x, y: c.y, did: did(), sh: M.shift }); while (M.pr.length > 4) M.pr.shift(); H.saveS(); H.toast('🏠 You told ' + (o.who || 'the caller') + ' you\'d check back this shift. The house is marked on your map.'); }
  }
  const deesc = (c, how) => note(how === 'win' ? 'deeswin' : how === 'lose' ? 'deeslose' : null, { who: who(c), where: c.where, x: c.x, y: c.y });
  const pursuit = (c, how, ordered) => note(how === 'term' && !ordered ? 'purterm' : how === 'crash' || ordered ? 'purbad' : null, { who: '', where: c && c.where, x: c && c.x, y: c && c.y });
  // the wrap-up choice that makes a promise
  const promiseOption = (c, cid) => ({ t: "I'll swing back by before my shift ends to check on you.", trust: 1, reply: [[cid, rnd(["You'd do that? Okay. I'll be here.", "I'll believe it when I see it. But okay. Thank you.", "That would mean a lot, honestly."])]], fx: () => { c.wrap = 'promise'; } });
  // the person at the same address remembers how the last visit went
  function callerLine(c, cid) {
    const d = M.d.slice().reverse().find((x) => x.did === did() && x.where === c.where && ECHO[x.k].back.length && x.sh < M.shift + 1 && Date.now() - x.at > 60000);
    return d ? [[cid, rnd(ECHO[d.k].back)]] : [];
  }
  // shift start: promises not kept are broken, and what came of last shift's choices is waiting for you
  let briefDue = 0;
  function onShift() {
    M.pr.filter((p) => p.sh < M.shift + 1).forEach((p) => note('broke', { who: p.who, where: p.where, x: p.x, y: p.y, did: p.did }));
    M.pr = []; M.shift++; M.seed = M.seed.filter((x) => x.due >= M.shift - 2); H.saveS(); briefDue = 6; /* left alone three shifts, it fades */
  }
  function briefing() {
    const due = M.d.filter((d) => !d.told && d.sh < M.shift), top = H.arcSummary ? H.arcSummary() : '', wait = M.seed.filter((x) => x.due <= M.shift && !x.told).slice(-2); if (!due.length && !top && !wait.length) return false; wait.forEach((x) => { x.told = 1; });
    // the newest few, with at least one good one up front if there is one
    // the newest two good things and the newest thing that didn't go well, so it's never all praise or all complaints
    const good = due.filter((d) => ECHO[d.k].good), bad = due.filter((d) => !ECHO[d.k].good), pick = good.slice(-2).concat(bad.slice(-1));
    due.slice().reverse().forEach((d) => { if (pick.length < 3 && pick.indexOf(d) < 0) pick.push(d); }); due.forEach((d) => { d.told = 1; }); H.saveS();
    const rows = wait.map((x) => '<li class="memRow wait"><i>⏳</i><span>' + H.esc(fill(SEED[x.k].brief || SEED.missed.brief, { who: x.who || 'The caller', where: x.where })) + '</span></li>').join('') + pick.map((d) => '<li class="memRow ' + (ECHO[d.k].good ? 'good' : 'bad') + '"><i>' + ECHO[d.k].icon + '</i><span>' + H.esc(fill(rnd(ECHO[d.k].brief), d)) + '</span></li>').join('');
    H.openModal('<div class="sceneHead"><b>SINCE YOUR LAST SHIFT</b><h2>' + (rows ? 'What people remember' : 'Roll call briefing') + '</h2><p>' + (rows ? 'How you handled your calls doesn\'t stay on the call. It follows you around the city.' : 'Here\'s how your last shift added up.') + '</p></div>' + top + (rows ? '<ul class="memList">' + rows + '</ul>' : '') + '<div class="qAct"><button type="button" id="mClose">Back to work</button></div>');
    const b = document.getElementById('mClose'); if (b) b.onclick = () => H.closeModal();
    return true;
  }
  // walking around: an open promise you can keep, and people near places you made a mark bringing it up
  let t = 0;
  function tick(dt) {
    if (briefDue > 0) { briefDue -= dt; if (briefDue <= 0) { if (H.free()) briefing(); else briefDue = 3; } }
    t -= dt; if (t > 0) return; t = .5; const P = H.P, here = did();
    if (H.freeKeep ? H.freeKeep() : H.free()) { const pi = M.pr.findIndex((p) => p.did === here && Math.hypot(p.x - P.x, p.y - P.y) < 2.6);
      if (pi >= 0) { const p = M.pr.splice(pi, 1)[0]; keep(p); return; } }
    if (!H.free()) return;
    const barks = H.barks(); if (!barks || barks.length >= 2) return;
    const now = performance.now();
    const d = M.d.find((x) => x.told && x.did === here && x.x != null && x.said < 2 && (x.cool || 0) < now && Math.hypot(x.x - P.x, x.y - P.y) < 3.4);
    if (d) { d.said++; d.cool = now + 180000; const ped = (H.peds() || []).find((p) => Math.hypot(p.x - P.x, p.y - P.y) < 3) || { x: d.x, y: d.y }; barks.push({ e: ped, text: fill(rnd(ECHO[d.k].bark), d), t: 4.2, t0: 4.2 }); H.saveS(); }
  }
  function keep(p) {
    const id = H.sayAs('mem_' + (p.who || 'caller'), { name: p.who || 'The caller', icon: '🏠', role: p.where });
    H.dialogue([[id, rnd(["You came back. I honestly didn't think you would.", "Officer! You actually came back.", "Oh. You meant it. Come in for a second."])],
      ['choice', [{ t: 'Just checking that everything\'s still okay.', reply: [[id, rnd(["It is. Quieter than it's been in weeks. Thank you.", "Better. Knowing somebody would come by helped."])]] },
        { t: 'Anything else happen since I left?', reply: [[id, rnd(["Nothing. And honestly, that's thanks to you.", "No. He hasn't been back. I think he saw your car."])]] }], 'What do you say?']],
      () => { note('kept', p); H.award(60, 'kept your word'); if (H.trustUp) H.trustUp(2); });
  }
  // marks on the map for promises still open in this district
  function draw(now) {
    M.pr.forEach((p) => { if (p.did !== did()) return; const [sx, sy] = H.iso(p.x, p.y); H.bubble(sx, sy - 70, '🏠', '#38bdf8', now); });
  }
  // plant: after a call is graded, one thing from it may come back a shift or two later
  function plant(c, r) {
    if (!c || c.ops || c.deesc || c.x == null || !c.where) return null;
    if (c.cons) { const k = M.seed.indexOf(c.cons); if (k >= 0) M.seed.splice(k, 1); const ok = r.right === r.n; const last = M.d[M.d.length - 1]; if (ok && !(last && last.where === c.where && last.sh === M.shift && ECHO[last.k].good)) note('help', { who: who(c), where: c.where, x: c.x, y: c.y }); H.saveS(); return ok ? 'fixed' : 'still'; }
    if (M.seed.some((x) => x.where === c.where && x.did === did())) return null;
    const k = r.n && r.right < r.n && c.les != null && CONS[c.les] && Math.random() < .6 ? 'missed' : c.wrap === 'quick' ? 'callback' : HARSH[c.eff] || (c.way === 'enforce' && c.rules && c.rules.intent && !c.readRight && c.rules.intent !== 'calm') ? 'complaint' : null;
    if (!k) return null; M.seed.push({ k, les: c.les, who: who(c), where: c.where, x: c.x, y: c.y, did: did(), due: M.shift + (k === 'complaint' ? 2 : 1), t: c.title, sh: M.shift, right: r.right, n: r.n }); /* what led to it, for the card */ while (M.seed.length > 6) M.seed.shift(); H.saveS(); return k;
  }
  // a case that fell apart in court comes back to the street it started on
  function walked(o) { if (!o || o.x == null) return; M.seed.push({ k: 'walked', les: o.les, who: 'The neighbors', where: o.where, x: o.x, y: o.y, did: o.did == null ? did() : o.did, due: M.shift + 1, t: o.title || 'The arrest', sh: o.sh == null ? M.shift : o.sh }); while (M.seed.length > 6) M.seed.shift(); H.saveS(); }
  // dispatch asks: is something from an earlier shift due in this district? (now and then, never all at once)
  function dueCall(here) {
    const s = M.seed.find((x) => x.did === here && x.due <= M.shift); if (!s || Math.random() > .35) return null; const T = SEED[s.k], o = { who: s.who || 'The caller', where: s.where };
    const t = s.k === 'missed' ? [fill(CONS[s.les][0], o), T.prio, 'any', fill(CONS[s.les][1], o)] : [fill(T.title, o), T.prio, 'any', fill(T.text, o)]; t.les0 = s.les; t.cons = s; return t;
  }
  // the card that opens a call that came back: when you were here, what you did, what it turned into
  const AGO = ['Earlier this shift', 'Last shift', 'Two shifts ago', 'Three shifts ago'];
  const ledTo = (s) => s.t == null ? '' : (AGO[Math.min(3, M.shift - s.sh)] || 'A while back') + ' you took "' + s.t + '" here' + (s.k === 'missed' ? ' and got ' + s.right + ' of ' + s.n + ' right.' : s.k === 'walked' ? ', made the arrest, and the case fell apart in court.' : s.k === 'callback' ? ' and wrapped it up before they were done.' : ' and came in hard.');
  const consLine = (s) => { const why = ledTo(s); return (why ? why + ' ' : '') + fill(SEED[s.k].line, { who: s.who || 'The caller', where: s.where }); };
  // open threads for the mystery board
  const threads = () => M.seed.map((s) => ({ icon: '⏳', text: (s.t || 'A call') + ' · ' + s.where, sub: s.due <= M.shift ? 'Could come back any time now' : 'Coming back on a later shift', why: ledTo(s) }));
  const consIntent = (s) => SEED[s.k].intent || null;
  return { plant, walked, dueCall, consLine, threads, consIntent, get seeds() { return M.seed; }, note, afterCall, deesc, pursuit, promiseOption, callerLine, onShift, briefing, tick, draw, ECHO, get open() { return M.pr; }, get shiftNo() { return M.shift; }, get dbg() { return { briefDue, free: H.free() }; }, get deeds() { return M.d; } };
}
