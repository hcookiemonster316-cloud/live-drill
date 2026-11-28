// Every cadet sees a different city (owner's call, replayability). Each new cadet gets one of four city threads: a
// thread is a pattern behind ordinary calls that you only see if you keep showing up. It surfaces in beats as you clear
// calls (dispatch, your work cell, a regular who noticed), each beat goes on the case board, the third beat is the twist
// that connects cases you thought were separate, and the last one is your call to make. The next cadet gets a thread
// they haven't seen. At graduation the epilogue says how it ended and where your friends are now.
// Loop: take a call -> the city remembers (a thread builds out of your calls) -> choose how to handle it -> your career
// grows (RP, district trust, a trophy). Reads calls cleared, flags and arcs; feeds the case board, radio/phone, trust
// and the finale.

const META = 'patrolcity:threads';
export const THREADS = {
  copper: { title: 'The Copper Ring', d: 3, icon: '🔧',
    beats: [
      ['Dispatch', 'Heads up, all units: third report this month of AC units stripped for copper at vacant homes. Nobody hurt. Just a pattern.'],
      ['phone:Lou', 'Hey, it\'s Lou from the truck stop. Guy came through last night with a pickup full of copper line, all cut fresh. Paid cash for diesel. White Ford, ladder rack. Thought you\'d want to know.'],
      ['Dispatch', 'Detective Hale wants a call back. The church on Railside and the clinic on Bell Street both lost their AC copper the same week. Same white Ford, ladder rack, on both cameras. It\'s one crew.'],
    ],
    twist: 'The church, the clinic and the vacant houses were one case all along.',
    end: { who: 'castillo', say: 'The North Spur scrap yard bought every pound. The owner wants his name left out. He says he will make it worth your while. Your call.',
      opts: [
        { t: 'Turn him down, log the offer, and work it with Hale', good: 1, out: 'The yard\'s records tie the crew to eleven thefts. The owner\'s offer goes in the report too. The church gets its AC back before Sunday.' },
        { t: 'Take his tip and keep his name out of the report', good: 0, wrong: 'scrapdeal', out: 'The tip is good, but the deal is in your bodycam audio. Internal Affairs calls it what it is. The case survives. Your file does not look the same.' },
        { t: 'Stake out the scrap yard alone tonight for the truck', good: 0, out: 'The truck never comes. You missed two calls waiting. Hale builds it without you, a week later. Next time, bring it to the team.' }] } },
  roof: { title: 'The Roof Man', d: 1, icon: '🏠',
    beats: [
      ['Dispatch', 'Information only: two Eastside residents reported paying a roofer a deposit after the last storm. He never came back. Civil matter for now.'],
      ['phone:Mr. Lewis', 'It\'s Lewis. Mrs. Gaines\'s daughter says a man in a clean truck is knocking doors on Birch Lane, offering storm roofs for cash up front. He wanted to see her mother\'s checkbook. I don\'t like this one.'],
      ['Dispatch', 'Fraud unit calls back: the Eastside deposits, a Riverside "insurance inspector" and a fake permit at Courtside Lofts are the same man, same phone number. Seniors only. Over forty thousand dollars.'],
    ],
    twist: 'The roof deposits, the fake inspector and the fake permit were one man.',
    end: { who: 'castillo', say: 'Fraud found where he is staying. The victims want to know if they will see their money again. What do you do first?',
      opts: [
        { t: 'Take each statement and receipt for the state attorney', good: 1, out: 'Nine statements, nine receipts. He takes a plea with restitution. Mrs. Gaines\'s daughter gets a check in the mail with a note: "Paid in full."' },
        { t: 'Promise every victim they will get their money back', good: 0, out: 'The money is mostly gone. Your promise isn\'t yours to make, and now three of them won\'t answer when the state attorney calls.' },
        { t: 'Post his photo online to warn the whole neighborhood', good: 0, out: 'He sees it first and leaves the county that night. It takes the fraud unit two months to find him again.' }] } },
  dogs: { title: 'The Missing Dogs', d: 2, icon: '🐕',
    beats: [
      ['Dispatch', 'Riverside units: second dog reported stolen from a fenced yard this week. Both purebred, both young.'],
      ['phone:Dr. Inés', 'It\'s Inés at the clinic. A man brought in a "new puppy" for shots. I scanned the chip out of habit. It\'s registered to a family in Central. He left before I could ask. I have his plate.'],
      ['Dispatch', 'Dr. Inés\'s plate comes back to a rental with online listings in three counties: twenty dogs sold this year. The "lost dog" calls you took in Central and Riverside were the same ring.'],
    ],
    twist: 'Every lost dog call you took was the same ring, selling them three counties away.',
    end: { who: 'castillo', say: 'He listed a new litter for Saturday. The buyers are families, some with kids. How do you want to run it?',
      opts: [
        { t: 'Plan the meet with your sergeant and a chip scanner', good: 1, out: 'Seven dogs scanned, seven owners called. A little girl in Central gets her beagle back and won\'t let go of your leg.' },
        { t: 'Grab the dogs at the meet and find owners later', good: 0, out: 'Two of the dogs have no chips. Nobody knows whose they are now. The seller\'s lawyer is very happy with your report.' },
        { t: 'Pose as a buyer on the phone and handle it alone', good: 0, out: 'He gets spooked by a question you shouldn\'t have asked and cancels. The listing goes up again two weeks later, one county over.' }] } },
  plates: { title: 'Plates That Don\'t Match', d: 0, icon: '🚗',
    beats: [
      ['Dispatch', 'Central units: gas drive-off at the Harbor station. Plate comes back to a minivan. The car was a gray sedan.'],
      ['phone:Mo', 'It\'s Mo, from Sami\'s. A gray sedan pumped and ran last night. Plate says minivan. That\'s the second time. My father would have run after him. I didn\'t.'],
      ['Dispatch', 'Records says the plates on the gas drive-offs, the burglary at the pharmacy and the hit-and-run on Elm were all stolen off cars at the same long-term lot. One car, swapping plates.'],
    ],
    twist: 'The drive-offs, the pharmacy burglary and the hit-and-run were one car with stolen plates.',
    end: { who: 'castillo', say: 'Tag reader hit the gray sedan heading into Central with a new plate. You are closest. Your call.',
      opts: [
        { t: 'Follow back, call it out, and let units set up ahead', good: 1, out: 'He pulls into a lot to swap plates again. Three units are already there. Nobody chases anybody. The hit-and-run victim\'s family gets a phone call.' },
        { t: 'Light him up right away and pursue if he runs', good: 0, out: 'He runs through a school zone. You end the pursuit, which is right, but he\'s gone. The tag reader finds him again three days later.' },
        { t: 'Box him in at the next light with your cruiser', good: 0, out: 'Two cars damaged, one bystander shaken. He\'s in custody, and you\'re writing a use of force report until midnight.' }] } }
};
export const AT = [3, 8, 14, 20]; // calls cleared after the thread starts: beats 1-3, then the end

export function installReplay(H) {
  const S = H.S;
  const meta = () => { try { return JSON.parse(localStorage.getItem(META) || '{}'); } catch (e) { return {}; } };
  // pick a thread this cadet's earlier lives haven't seen; it stays the same for this cadet
  function ensure() {
    if (S.thread && THREADS[S.thread.id]) return S.thread;
    const m = meta(), seen = m.seen || [], keys = Object.keys(THREADS), fresh = keys.filter((k) => seen.indexOf(k) < 0), pool = fresh.length ? fresh : keys;
    const id = pool[(Math.random() * pool.length) | 0]; S.thread = { id, at: S.calls || 0, beat: 0, done: 0 };
    try { m.seen = seen.filter((k) => k !== id).concat(id).slice(-3); localStorage.setItem(META, JSON.stringify(m)); } catch (e) {}
    H.saveS(); return S.thread;
  }
  let busy = false;
  // after every cleared call: is the next beat due?
  function afterCall() {
    const t = ensure(); if (t.done || busy) return; const T = THREADS[t.id], n = (S.calls || 0) - t.at;
    if (t.beat < 3 && n >= AT[t.beat]) { const [who, msg] = T.beats[t.beat], i = t.beat; t.beat++; H.saveS();
      setTimeout(() => { if (who.slice(0, 6) === 'phone:') H.radio('📱 ' + who.slice(6) + ' (work cell)', msg); else H.radio(who, msg); H.caseNote(T.icon + ' ' + T.title + ' · ' + msg);
        if (i === 2) H.banner(T.icon, 'It\'s connected', T.twist); else H.toast(T.icon + ' ' + T.title + ': added to your case board'); }, 2600); return; }
    if (t.beat >= 3 && n >= AT[3]) setTimeout(final, 3200);
  }
  function final() {
    const t = S.thread; if (!t || t.done || busy) return; if (!H.free()) { setTimeout(final, 4000); return; } busy = true; const T = THREADS[t.id], E = T.end;
    H.dialogue([['narr', T.icon + ' ' + T.title + '. Every piece you found is on the board.'], [E.who, E.say], ['choice', E.opts.map((o, i) => ({ o, i })).sort(() => Math.random() - .5).map(({ o, i }) => ({ t: o.t, reply: [['narr', o.out], ['fx', () => settle(i)]] }))]], () => { busy = false; });
  }
  function settle(i) {
    const t = S.thread, T = THREADS[t.id], o = T.end.opts[i]; t.done = Date.now(); t.good = o.good; t.pick = i; if (o.wrong) H.wrong(o.wrong); H.saveS(); H.caseNote(T.icon + ' ' + T.title + ' · closed · ' + o.out);
    if (o.good) { H.award(120, T.title); H.trust(T.d, 6); H.stat('threadGood'); H.sting('done'); H.banner(T.icon, 'Case closed: ' + T.title, 'Built from your calls. The city will remember who connected it.'); }
    else { H.stat('threadRough'); H.sting('fail'); H.toast(T.icon + ' ' + T.title + ' closed, but not the way it should have.'); }
    const m = meta(); m.closed = m.closed || {}; m.closed[t.id] = o.good ? 'good' : 'rough'; try { localStorage.setItem(META, JSON.stringify(m)); } catch (e) {}
  }
  // epilogue for the graduation screen: the thread, then where your friends are now
  function epilogue(lines) {
    const t = S.thread, out = []; if (t && THREADS[t.id]) { const T = THREADS[t.id]; out.push([T.icon, T.title, t.done ? T.end.opts[t.pick].out : 'Still open. ' + (t.beat ? 'You saw ' + t.beat + ' of the pieces.' : 'You never saw the pattern. The next cadet might.')]); }
    (lines || []).forEach((l) => out.push(l)); return out;
  }
  const status = () => { const t = ensure(); return { id: t.id, title: THREADS[t.id].title, beat: t.beat, done: !!t.done, good: t.good, next: t.beat < 4 ? Math.max(0, AT[Math.min(3, t.beat)] - ((S.calls || 0) - t.at)) : 0 }; };
  return { ensure, afterCall, final, settle, epilogue, status, meta };
}
