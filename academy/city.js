// City life systems: live district incidents with roles, your own beat, a shareable service card, partner-animal
// care, detective follow-ups on case threads, weekend PT meets, neighborhood watch meetings and seasonal changes.
// Costs almost nothing per frame: markers are a short list, and everything else runs on a one-second tick.
export function installCity(H) {
  const S = H.S, esc = H.esc, rnd = (a) => a[Math.floor(Math.random() * a.length)], today = () => new Date().toDateString();
  S.beat = S.beat || null; S.cases2 = S.cases2 || []; S.animal = S.animal || { bond: 20 }; S.watchMet = S.watchMet || {};

  // ================= 1. live district incidents with roles =================
  const INCIDENTS = [
    { id: 'outage', icon: '⚡', name: 'Power outage', text: 'A transformer blew. Signals are dark across the district.', roles: [
      ['traffic', '🚦', 'Traffic control', 'Direct traffic at dark intersections', [['Hand signals: stop one direction fully before waving the other', 1], ['Wave everyone through at once to clear it fast', 0], ['Stand in the middle without a vest at night', 0]]],
      ['welfare', '🏠', 'Welfare checks', 'Check on residents who rely on power for medical equipment', [['Knock, identify yourself, ask about oxygen and medications', 1], ['Leave a note and move on', 0], ['Tell them to call 911 if it gets bad', 0]]],
      ['patrol', '🔦', 'Business patrol', 'Check dark storefronts and keep a visible presence', [['Walk the storefronts, check doors, note anything forced', 1], ['Park and wait for alarms to go off', 0], ['Skip it, the alarms are down anyway', 0]]]] },
    { id: 'festival', icon: '🎉', name: 'Street festival', text: 'The district\'s street festival is packed.', roles: [
      ['crowd', '👥', 'Crowd watch', 'Keep the crowd moving safely near the stage', [['Spot a crush forming and open a second exit path', 1], ['Push through the crowd to the front', 0], ['Wait for someone to complain', 0]]],
      ['lost', '🧒', 'Lost and found', 'Reunite lost kids and lost wallets', [['Stay with the child at the meeting point and announce a description', 1], ['Walk the child around looking for parents', 0], ['Hand the child to a vendor', 0]]],
      ['traffic', '🚦', 'Road closures', 'Keep the barricades and detours working', [['Redirect drivers calmly to the posted detour', 1], ['Move a barricade for one driver in a hurry', 0], ['Leave the post to watch the parade', 0]]]] },
    { id: 'storm', icon: '🌀', name: 'Storm cleanup', text: 'Last night\'s storm left trees down and streets flooded.', roles: [
      ['hazard', '🌳', 'Road hazards', 'Mark and block downed trees and lines', [['Set cones well back and report lines to the power company', 1], ['Drag the branch aside yourself', 0], ['Drive around it and keep going', 0]]],
      ['flood', '🌊', 'Flooded streets', 'Keep drivers out of standing water', [['Block the street and turn drivers around', 1], ['Let trucks through, they sit higher', 0], ['Wade in to check how deep it is', 0]]],
      ['welfare', '🏠', 'Welfare checks', 'Check on elderly residents on the list', [['Knock, check supplies, power and medications, then log it', 1], ['Call them from the car', 0], ['Skip anyone who doesn\'t answer', 0]]]] }
  ];
  let live = null, liveT = 240, liveSum = 0, liveStop = null;
  function liveTick(dt) {
    const W = H.W(); if (!W || H.inside()) return;
    if (live && (live.w !== W || Date.now() > live.until)) { if (live.w === W) H.banner(live.ev.icon, live.ev.name + ': operations ended', 'You helped with ' + live.done + ' task' + (live.done === 1 ? '' : 's') + '. Thanks for staying on it.'); live = null; if (liveStop) liveStop(); liveStop = null; }
    if (!live && (liveT -= dt) <= 0) { liveT = 600 + Math.random() * 600; startLive(); }
  }
  function startLive() {
    const W = H.W(), ev = rnd(INCIDENTS), key = H.weekKey() + ':live:' + ev.id; live = { ev, w: W, role: null, tasks: [], done: 0, until: Date.now() + 6 * 60e3, key };
    const n = H.net(); if (n) { if (liveStop) liveStop(); liveStop = n.gon('mmo/ev/' + H.weekKey() + '/live' + ev.id + W.did, (v) => { liveSum = Object.values(v || {}).reduce((a, b) => a + (+b || 0), 0); }); }
    H.radio('Dispatch', 'All units in ' + W.D.name + ': ' + ev.text + ' Pick up an assignment.'); H.buzz('p1');
    pickRole();
  }
  function pickRole() {
    if (!live) return; const ev = live.ev;
    H.openModal('<div class="sceneHead"><b>' + ev.icon + ' DISTRICT INCIDENT · ' + esc(H.W().D.name.toUpperCase()) + '</b><h2>' + esc(ev.name) + '</h2><p>' + esc(ev.text) + ' Everyone on shift works it together for the next few minutes. Pick a role.</p></div><div class="sdCalls">' +
      ev.roles.map((r, k) => '<button type="button" data-r="' + k + '"><b>' + r[1] + ' ' + esc(r[2]) + '</b><small style="display:block;color:#94a3b8">' + esc(r[3]) + '</small></button>').join('') + '</div><div class="qAct"><button type="button" class="ghost" id="mClose">Not now</button></div>');
    document.querySelectorAll('[data-r]').forEach((b) => b.onclick = () => { H.closeModal(); setRole(ev.roles[+b.dataset.r]); }); const x = document.getElementById('mClose'); if (x) x.onclick = H.closeModal;
  }
  function setRole(r) { const W = H.W(), P = H.P, near = W.walk.filter((t) => Math.hypot(t[0] - P.x, t[1] - P.y) < 22 && Math.hypot(t[0] - P.x, t[1] - P.y) > 4); live.role = r; live.tasks = [0, 1, 2].map(() => { const t = rnd(near.length ? near : W.walk); return { x: t[0] + .5, y: t[1] + .5 }; }); H.toast(r[1] + ' ' + r[2] + ': three tasks marked near you.'); }
  function taskRun(t) {
    const r = live.role, id = H.sayAs('inc', { name: live.ev.name + ' · ' + r[2], icon: r[1], role: H.W().D.name });
    H.dialogue([['narr', r[3] + '.'], ['choice', r[4].map((o) => ({ t: o[0], ok: o[1], reply: [['narr', o[1] ? 'Exactly how it should go.' : 'That creates a new problem. Think safety first.']] })).sort(() => Math.random() - .5), 'What do you do?']], (res) => {
      live.tasks = live.tasks.filter((x) => x !== t); live.done++; const ok = res.choices[0] && res.choices[0].ok; H.award(ok ? 45 : 15, 'district incident'); H.stat('incTasks');
      const n = H.net(); S.incMine = S.incMine || {}; S.incMine[live.key] = (S.incMine[live.key] || 0) + 1; if (n) { try { n.gset('mmo/ev/' + H.weekKey() + '/live' + live.ev.id + H.W().did + '/' + n.uid, Math.min(1000, S.incMine[live.key])); } catch (e) {} }
      if (!live.tasks.length) { H.banner(live.ev.icon, live.ev.name + ': role complete', (liveSum || live.done) + ' tasks done district-wide so far.'); H.queueLoot(live.ev.name, 1, 'u'); }
    }, { focus: [t.x, t.y], kicker: 'DISTRICT INCIDENT · ' + live.ev.name.toUpperCase() });
  }

  // ================= 2. your own beat =================
  const ISSUES = [['presence', '🚓', 'Visible patrol', 'Spend time on your beat', 90], ['talk', '🤝', 'Get to know people', 'Talk to regulars on your beat', 3], ['calls', '📻', 'Answer calls here', 'Clear calls on your beat', 2], ['explore', '🧭', 'Know every corner', 'Find an overlook or new place on your beat', 1]];
  const quad = (x, y) => (x < H.N / 2 ? 0 : 1) + (y < H.N / 2 ? 0 : 2), QN = ['Northwest', 'Northeast', 'Southwest', 'Southeast'];
  function beatWeek() { const b = S.beat; if (!b || b.week === H.weekKey()) return; b.week = H.weekKey(); b.issues = ISSUES.slice().sort(() => Math.random() - .5).slice(0, 2).map((i) => ({ k: i[0], p: 0 })); H.saveS(); }
  function onBeat() { const b = S.beat, W = H.W(); return !!(b && W && b.did === W.did && !H.inside() && quad(H.P.x, H.P.y) === b.q); }
  function beatAdd(k, n) { const b = S.beat; if (!b || !onBeat()) return; beatWeek(); const is = b.issues.find((i) => i.k === k); if (!is) return; const I = ISSUES.find((x) => x[0] === k), was = is.p; is.p = Math.min(I[4], is.p + n);
    if (was < I[4] && is.p >= I[4]) { b.trust = Math.min(100, (b.trust || 50) + 10); H.banner('🏘️', 'Your beat: ' + I[2] + ' done', 'Beat trust ' + b.trust + '/100. Calls on your beat pay more as trust grows.'); H.award(60, 'beat issue'); H.stat('beatIssue'); } H.saveS(); }
  function beatPanel() {
    const W = H.W(), b = S.beat; beatWeek();
    const body = b ? '<p class="lkSum">Your beat: <b>' + QN[b.q] + ' ' + esc(H.dname(b.did)) + '</b> · trust ' + (b.trust || 50) + '/100 · calls here pay +' + beatBonusPct() + '% RP</p><div class="svcList">' + (b.issues || []).map((is) => { const I = ISSUES.find((x) => x[0] === is.k); return '<div class="svcRow"><i>' + I[1] + '</i><div><b>' + I[2] + '</b><small>' + I[3] + ' · ' + Math.floor(is.p) + '/' + I[4] + '</small><span><em style="width:' + Math.round(is.p / I[4] * 100) + '%"></em></span></div></div>'; }).join('') + '</div>' : '<p class="lkSum">Pick a home beat: a quarter of a district that becomes yours. Its problems change every week based on what you do there.</p>';
    H.openModal('<div class="sceneHead"><b>MY BEAT</b><h2>' + (b ? QN[b.q] + ' ' + esc(H.dname(b.did)) : 'Choose your beat') + '</h2></div>' + body + '<div class="sdCalls">' + QN.map((n, q) => '<button type="button" data-q="' + q + '"' + (b && b.did === W.did && b.q === q ? ' class="on"' : '') + '><b>' + n + ' ' + esc(W.D.name) + '</b></button>').join('') + '</div><div class="qAct"><button type="button" id="mClose">Back</button></div>');
    document.querySelectorAll('[data-q]').forEach((x) => x.onclick = () => { S.beat = { did: W.did, q: +x.dataset.q, trust: 50, week: null }; beatWeek(); H.toast('🏘️ ' + QN[+x.dataset.q] + ' ' + W.D.name + ' is your beat now.'); beatPanel(); });
    const c = document.getElementById('mClose'); if (c) c.onclick = H.closeModal;
  }
  const beatBonusPct = () => (S.beat ? Math.round(((S.beat.trust || 50) - 30) / 4) : 0);
  const beatMult = (c) => (S.beat && S.beat.did === H.W().did && c && quad(c.x, c.y) === S.beat.q ? 1 + beatBonusPct() / 100 : 1);

  // ================= 3. shareable service card =================
  async function shareCard() {
    try { await Promise.all([document.fonts.load("800 40px 'Meridian'"), document.fonts.load("600 40px Meridian Text"), document.fonts.load("700 40px Meridian Text")]); } catch (e) {}
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 1350); gr.addColorStop(0, '#13244a'); gr.addColorStop(1, '#060b18'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1350);
    g.strokeStyle = '#f5b800'; g.lineWidth = 6; g.strokeRect(36, 36, 1008, 1278); g.fillStyle = '#f5b800'; g.font = "800 40px 'Meridian', sans-serif"; g.fillText('PATROL CITY · SERVICE RECORD', 80, 120);
    g.fillStyle = '#fff'; g.font = "800 110px 'Meridian', sans-serif"; g.fillText(S.cs, 80, 250); g.fillStyle = '#94a3b8'; g.font = "600 38px Meridian Text, sans-serif"; g.fillText(H.rankName() + ' · ' + (S.calls || 0) + ' calls cleared', 80, 310);
    const tr = H.trackIds().map((k) => [k, (S.svc || {})[k] || { l: 1 }]).sort((a, b) => b[1].l - a[1].l); let y = 400; g.font = "700 34px Meridian Text, sans-serif";
    tr.forEach(([k, r]) => { g.fillStyle = '#e8eef8'; g.fillText(H.trackName(k), 80, y); g.fillStyle = '#f5b800'; g.textAlign = 'right'; g.fillText('Level ' + r.l, 1000, y); g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(80, y + 14, 920, 8); g.fillStyle = '#f5b800'; g.fillRect(80, y + 14, Math.min(920, r.l / 20 * 920), 8); y += 68; });
    y += 10;
    const cm = Object.values(S.comms2 || {}).reduce((a, b) => a + b, 0); g.fillStyle = '#cbd5e1'; g.font = "600 40px Meridian Text, sans-serif";
    g.fillText('🎖️ ' + cm + ' commendations' + (S.partner && S.partner.rank ? '  ·  🤝 ' + S.partner.rank : ''), 80, y + 30); g.fillText('🗺️ ' + Object.keys(S.lore || {}).length + ' pages of city history', 80, y + 100);
    g.fillStyle = '#64748b'; g.font = "600 30px Meridian Text, sans-serif"; g.fillText('Sim training · FBRTP Vehicle Operations', 80, 1270);
    c.toBlob(async (blob) => { const file = new File([blob], 'patrol-city-record.png', { type: 'image/png' });
      try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'My Patrol City service record' }); H.stat('shared'); return; } } catch (e) {}
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'patrol-city-record.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); H.toast('🖼️ Saved your service record card.'); H.stat('shared'); }, 'image/png');
  }

  // ================= 4. partner animal care (K9 or mounted unit) =================
  const hasAnimal = () => S.unit === 'k9' || H.ride() === 'horse';
  function animalPanel() {
    if (!hasAnimal()) { H.toast('Partner care is for K9 handlers and the mounted unit.'); return; } const k9 = S.unit === 'k9', A = S.animal, name = k9 ? 'Rex' : 'Judge II', fed = A.fed === today(), trained = A.trained === today();
    H.openModal('<div class="sceneHead"><b>' + (k9 ? '🐕 K9 PARTNER' : '🐎 MOUNTED PARTNER') + '</b><h2>' + name + '</h2><p>Bond ' + Math.round(A.bond) + '/100. A strong bond ' + (k9 ? 'widens how far ' + name + ' alerts on things' : 'makes ' + name + ' faster and steadier') + '.</p></div><div class="svcList"><div class="svcRow"><i>💞</i><div><b>Bond</b><small>' + (A.bond >= 80 ? 'Inseparable' : A.bond >= 50 ? 'Trusting' : 'Getting to know you') + '</small><span><em style="width:' + Math.round(A.bond) + '%"></em></span></div></div></div>' +
      '<div class="qAct"><button type="button" id="anFeed"' + (fed ? ' disabled' : '') + '>' + (fed ? 'Fed today ✓' : 'Feed and water') + '</button><button type="button" id="anTrain"' + (trained ? ' disabled' : '') + '>' + (trained ? 'Trained today ✓' : 'Training session') + '</button><button type="button" class="ghost" id="mClose">Back</button></div>');
    const f = document.getElementById('anFeed'); if (f) f.onclick = () => { A.fed = today(); A.bond = Math.min(100, A.bond + 5); H.saveS(); H.award(10, 'partner care'); H.stat('animalCare'); animalPanel(); };
    const t = document.getElementById('anTrain'); if (t) t.onclick = () => { H.closeModal(); train(k9, name); };
    const c = document.getElementById('mClose'); if (c) c.onclick = H.closeModal;
  }
  function train(k9, name) {
    const id = H.sayAs('trainer', { name: k9 ? 'K9 Trainer Ruiz' : 'Mounted Sgt. Boone', icon: k9 ? '🐕' : '🐎', role: 'Unit trainer' }), sh = (a) => a.sort(() => Math.random() - .5), ok = (r) => r.ok;
    const steps = k9 ? [[sh([{ t: 'Reward right at the moment of the correct behavior', ok: 1 }, { t: 'Reward a few minutes later, after the session', ok: 0 }, { t: 'Skip rewards so the dog works harder', ok: 0 }]), 'Reward timing'], [sh([{ t: 'Calm, consistent command words every time', ok: 1 }, { t: 'Different words so the dog stays sharp', ok: 0 }, { t: 'Louder commands when the dog hesitates', ok: 0 }]), 'Commands'], [sh([{ t: 'Short sessions that end on a success', ok: 1 }, { t: 'One long session until the dog is tired', ok: 0 }, { t: 'End right after a mistake so it remembers', ok: 0 }]), 'Session length']]
      : [[sh([{ t: 'Approach from the side where he can see you', ok: 1 }, { t: 'Walk up directly behind him', ok: 0 }, { t: 'Run up so he gets used to it', ok: 0 }]), 'Approach'], [sh([{ t: 'Desensitize slowly: flags, crowds, then traffic', ok: 1 }, { t: 'Take him straight into the parade', ok: 0 }, { t: 'Avoid noise so he never sees it', ok: 0 }]), 'Crowd training'], [sh([{ t: 'Cool down, check hooves and water after work', ok: 1 }, { t: 'Put him straight back in the stall', ok: 0 }, { t: 'Check hooves once a month', ok: 0 }]), 'After the shift']];
    H.dialogue([[id, 'Let\'s work with ' + name + '. Three things.']].concat(steps.map(([o, q]) => ['choice', o.map((x) => Object.assign(x, { reply: [[id, x.ok ? 'Good. That\'s how it sticks.' : 'No. Watch the animal, not the clock.']] })), q])), (res) => { const n = res.choices.filter(ok).length; S.animal.trained = today(); S.animal.bond = Math.min(100, S.animal.bond + 4 + n * 4); H.saveS(); H.award(15 + n * 10, 'partner care'); H.stat('animalTrain'); }, { kicker: 'PARTNER TRAINING' });
  }
  const animalMult = () => 1 + Math.max(0, (S.animal.bond || 0) - 20) / 160; // up to +50% K9 alert radius or horse speed

  // ================= 5. detective follow-ups =================
  function openCase(thread, where) {
    if (S.cases2.some((c) => c.item === thread.item)) return; S.cases2.push({ id: Date.now().toString(36), item: thread.item, from: thread.from || where, step: 0, wait: (S.calls || 0) + 1 }); H.saveS();
    H.banner('🕵️', 'Investigation opened', 'Detectives want your help following up on ' + thread.item + '. Menu → Investigations.');
  }
  const CASE_STEPS = ['Interview', 'Warrant affidavit', 'Court day'];
  function casesPanel() {
    const list = S.cases2.filter((c) => c.step < 3);
    H.openModal('<div class="sceneHead"><b>INVESTIGATIONS</b><h2>Follow-up cases</h2><p>Each case moves forward one step after your next call. Interview, affidavit, then court.</p></div><div class="sdCalls">' + (list.length ? list.map((c, k) => '<button type="button" data-c="' + k + '"' + ((S.calls || 0) < c.wait ? ' disabled' : '') + '><b>🕵️ ' + esc(c.item) + '</b><small style="display:block;color:#94a3b8">Step ' + (c.step + 1) + ' of 3: ' + CASE_STEPS[c.step] + ((S.calls || 0) < c.wait ? ' · ready after your next call' : ' · ready now') + '</small></button>').join('') : '<p class="lkSum">No open cases. Remember details from earlier calls: when a later call ties back to one, detectives open a case.</p>') + '</div><div class="qAct"><button type="button" id="mClose">Back</button></div>');
    document.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => { H.closeModal(); caseStep(list[+b.dataset.c]); }); const c = document.getElementById('mClose'); if (c) c.onclick = H.closeModal;
  }
  function caseStep(c) {
    const id = H.sayAs('det', { name: 'Det. Navarro', icon: '🕵️', role: 'Investigations' }), sh = (a) => a.sort(() => Math.random() - .5), mark = (o) => Object.assign(o, { reply: [[id, o.ok ? 'That\'s the one.' : 'Careful. That won\'t hold up.']] });
    const steps = [
      [[id, 'The owner of ' + c.item + ' is here. Your interview.'], ['choice', sh([{ t: 'Open-ended questions first, then specifics', ok: 1 }, { t: 'Tell them what you think happened and ask them to confirm', ok: 0 }, { t: 'Only ask yes-or-no questions to save time', ok: 0 }]).map(mark), 'Interview approach']],
      [[id, 'Affidavit time. Which facts belong in it?'], ['choice', sh([{ t: 'What you saw and were told, with who said it and when', ok: 1 }, { t: 'Your hunch about who did it', ok: 0 }, { t: 'What other officers probably saw', ok: 0 }]).map(mark), 'Probable cause'], ['choice', sh([{ t: 'Write it in plain language, first person, in order', ok: 1 }, { t: 'Use as much legal jargon as possible', ok: 0 }, { t: 'Leave out anything that weakens the case', ok: 0 }]).map(mark), 'Writing it']],
      [[id, 'Court day. You\'re on the stand.'], ['choice', sh([{ t: 'Answer only what is asked, from your report and memory', ok: 1 }, { t: 'Add details you\'ve thought of since', ok: 0 }, { t: 'Guess when you don\'t remember', ok: 0 }]).map(mark), 'Testimony'], ['choice', sh([{ t: 'Say "I don\'t recall" when you don\'t', ok: 1 }, { t: 'Look at the defendant and argue', ok: 0 }, { t: 'Check your phone while waiting', ok: 0 }]).map(mark), 'On the stand']]];
    H.dialogue(steps[c.step], (res) => { const n = res.choices.filter((x) => x.ok).length, tot = res.choices.length; c.step++; c.wait = (S.calls || 0) + 1; H.saveS(); H.award(30 + n * 25, 'investigation'); H.stat('caseStep');
      if (c.step >= 3) { H.banner('⚖️', 'Case closed', 'Your follow-up on ' + c.item + ' held up in court.'); H.queueLoot('Case closed', 1, 'r'); H.stat('caseClosed'); } else H.toast('🕵️ ' + CASE_STEPS[c.step] + ' unlocks after your next call.'); }, { kicker: 'INVESTIGATION · ' + CASE_STEPS[c.step].toUpperCase() });
  }

  // ================= 6. weekend PT meets (shift vs shift) =================
  const isWeekend = () => { const d = new Date().getDay(); return d === 0 || d === 6; };
  let meet = {}, meetStop = null;
  function meetWatch() { const n = H.net(); if (!n || meetStop) return; meetStop = []; ['day', 'mid', 'night'].forEach((sh) => meetStop.push(n.gon('mmo/ev/' + H.weekKey() + '/pt_' + sh, (v) => { meet[sh] = Object.values(v || {}).reduce((a, b) => a + (+b || 0), 0); }))); }
  function onPT(xp) { if (!isWeekend()) return; const n = H.net(), k = H.weekKey() + ':pt'; S.ptMeet = S.ptMeet || {}; S.ptMeet[k] = Math.min(1000, (S.ptMeet[k] || 0) + Math.max(1, Math.round(xp / 10))); H.saveS(); if (n) { try { n.gset('mmo/ev/' + H.weekKey() + '/pt_' + S.shift + '/' + n.uid, S.ptMeet[k]); } catch (e) {} } else meet[S.shift] = S.ptMeet[k]; H.toast('🏃 Weekend PT meet: points for ' + S.shift + ' shift.'); }
  function meetPanel() { meetWatch(); const rows = ['day', 'mid', 'night'].map((s) => [s, meet[s] || 0]).sort((a, b) => b[1] - a[1]);
    H.openModal('<div class="sceneHead"><b>WEEKEND PT MEET</b><h2>' + (isWeekend() ? 'Live now' : 'Saturday and Sunday') + '</h2><p>Every PT workout and test you do on the weekend scores for your shift. Day vs Midshift vs Night.</p></div><div class="svcList">' + rows.map(([s, v], i) => '<div class="svcRow' + (s === S.shift ? ' today' : '') + '"><i>' + ['🥇', '🥈', '🥉'][i] + '</i><div><b>' + ({ day: 'Day shift', mid: 'Midshift', night: 'Night shift' })[s] + '</b><small>' + v + ' points</small><span><em style="width:' + Math.round(v / Math.max(1, rows[0][1]) * 100) + '%"></em></span></div></div>').join('') + '</div><div class="qAct"><button type="button" id="mPT">Go to PT</button><button type="button" class="ghost" id="mClose">Back</button></div>');
    const p = document.getElementById('mPT'); if (p) p.onclick = () => { H.closeModal(); H.ptMenu(); }; const c = document.getElementById('mClose'); if (c) c.onclick = H.closeModal; }

  // ================= 7. neighborhood watch meetings =================
  let watchSpot = null;
  function watchTick() {
    const W = H.W(), h = H.hour(); if (!W || H.inside()) { watchSpot = null; return; } const key = today() + ':' + W.did;
    if (h < 17.5 || h > 21.5 || S.watchMet[key]) { watchSpot = null; return; }
    if (!watchSpot || watchSpot.w !== W) { const l = W.lots.find((x) => /church|library|school|community|park/.test(x.kind) && x.name); watchSpot = l ? { w: W, x: l.door[0] + .5, y: l.door[1] + 1.2, name: l.name, key } : null; if (watchSpot) H.radio('Dispatch', 'Neighborhood watch meeting tonight at ' + l.name + '. Officers welcome.'); }
    if (watchSpot && !H.busy() && Math.hypot(watchSpot.x - H.P.x, watchSpot.y - H.P.y) < 1.6) watchMeeting();
  }
  function watchMeeting() {
    const s = watchSpot, W = H.W(); S.watchMet[s.key] = 1; H.saveS(); const helped = Object.keys(S.helped || {}).filter((k) => k.indexOf(W.did + ':') === 0).length, trust = (S.trust || {})[W.did] || 50, id = H.sayAs('watch', { name: 'Watch captain Rosa', icon: '🏘️', role: s.name }), sh = (a) => a.sort(() => Math.random() - .5);
    const lines = [['narr', 'Folding chairs, a coffee urn, twenty neighbors. The watch captain waves you to the front.'], [id, helped ? 'This is the cadet who helped at ' + Object.keys(S.helped).find((k) => k.indexOf(W.did + ':') === 0).split(':')[1] + '. Thank you.' : 'Thanks for coming. People have questions.'],
      ['choice', sh([{ t: 'Explain how to report suspicious activity: what, where, when, descriptions', ok: 1 }, { t: 'Tell them to confront suspicious people themselves', ok: 0 }, { t: 'Say there\'s nothing to worry about', ok: 0 }]), 'A resident asks what to do if they see something'],
      ['choice', sh([{ t: 'Listen, take notes, and promise a specific follow-up', ok: 1 }, { t: 'Explain why that complaint isn\'t police business', ok: 0 }, { t: 'Change the subject to crime statistics', ok: 0 }]), 'Someone is upset about speeding on their street'],
      ['choice', sh([{ t: 'Watch members observe and report; they never patrol armed or detain anyone', ok: 1 }, { t: 'Members can hold someone until police arrive', ok: 0 }, { t: 'Members should follow suspects to get a plate', ok: 0 }]), 'What does the watch do, and not do?']];
    H.dialogue(lines.map((l) => (l[0] === 'choice' ? ['choice', l[1].map((o) => Object.assign(o, { trust: o.ok ? 1 : 0, reply: [[id, o.ok ? 'That\'s helpful, thank you.' : 'Hm. That\'s not what we hoped to hear.']] })), l[2]] : l)), (res) => {
      const n = res.choices.filter((x) => x.ok).length; S.trust = S.trust || {}; S.trust[W.did] = Math.min(100, trust + n * 3 + Math.min(6, helped)); H.saveS(); H.award(30 + n * 20 + helped * 5, 'community meeting'); H.stat('watchMeet'); beatAdd('talk', 2);
      H.banner('🏘️', 'Neighborhood watch', 'Community trust in ' + W.D.name + ' is ' + S.trust[W.did] + '/100.'); }, { focus: [s.x, s.y], kicker: 'NEIGHBORHOOD WATCH · ' + s.name.toUpperCase() });
  }

  // ================= 8. seasons =================
  const month = new Date().getMonth(), season = month === 11 || month === 0 ? 'holiday' : month >= 5 && month <= 7 ? 'summer' : 'school';
  const SEASON_CALLS = { holiday: [['Packages stolen from a porch', 3, 'houses', 'Resident\'s delivery was taken off the porch this afternoon.'], ['Holiday market: lost wallet', 3, 'any', 'A shopper lost a wallet near the market stalls.']],
    summer: [['Lost tourist at the waterfront', 3, 'any', 'Visitors can\'t find their hotel and their phone is dead.'], ['Heat exhaustion at the bus stop', 2, 'any', 'Older man feeling dizzy in the heat.']],
    school: [['Speeding in the school zone at dismissal', 2, 'any', 'Crossing guard reports cars flying through the zone.'], ['School bus stop: car passing a stopped bus', 2, 'any', 'Bus driver reports a car passed with the stop arm out.']] };
  const seasonCall = () => (Math.random() < .14 ? rnd(SEASON_CALLS[season]) : null);
  const seasonLook = (p) => { if (season === 'summer' && p.ph % 4 === 0) p.acc = 'sunhat'; if (season === 'holiday' && p.ph % 5 === 0) p.acc = 'beanie'; return p; };
  function drawSeason(ctx, sx, sy, p, now) { if (season !== 'holiday' || p.t !== 'lamp') return; const k = Math.floor(now / 500); ['#ef4444', '#22c55e', '#f5b800', '#3b82f6'].forEach((c, i) => { ctx.fillStyle = (i + k) % 2 ? c : 'rgba(255,255,255,.25)'; ctx.fillRect(sx - 4 + i * 3, sy - 34 + (i % 2), 2, 2); }); }

  // ================= markers, hooks, per tick =================
  function draw(list, vis, ctx, now) {
    if (H.inside()) return;
    if (live && live.role && live.w === H.W()) live.tasks.forEach((t) => { const [sx, sy] = H.iso(t.x, t.y); if (vis(sx, sy)) list.push({ d: t.x + t.y + .5, f: () => { H.ring(sx, sy, '#f97316', now); H.bubble(sx, sy - 34, live.role[1], '#fdba74', now); } }); });
    if (watchSpot) { const [sx, sy] = H.iso(watchSpot.x, watchSpot.y); if (vis(sx, sy)) list.push({ d: watchSpot.x + watchSpot.y + .5, f: () => { H.ring(sx, sy, '#a78bfa', now); H.bubble(sx, sy - 34, '🏘️', '#c4b5fd', now); } }); }
  }
  let t = 0, presT = 0;
  function tick(dt) {
    if (live && live.role && !H.busy()) for (const k of live.tasks) if (Math.hypot(k.x - H.P.x, k.y - H.P.y) < 1.3) { taskRun(k); break; }
    t -= dt; if (t > 0) return; t = 1; liveTick(1); watchTick(); if (onBeat()) beatAdd('presence', 1); if (isWeekend()) meetWatch();
  }
  return { startLive, tick, draw, beatPanel, beatAdd, beatMult, onBeat, shareCard, animalPanel, animalMult, hasAnimal, openCase, casesPanel, meetPanel, onPT, seasonCall, seasonLook, drawSeason, season, pickRole: () => (live ? pickRole() : H.toast('No district incident right now. Dispatch will call one out.')), get live() { return live; } };
}
