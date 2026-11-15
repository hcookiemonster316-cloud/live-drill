// Academy life: PT days (daily workout and a weekly PT test), inspection day (prep your uniform, then stand inspection),
// and class standing (a weekly leaderboard with awards, shared between everyone playing).
const dayKey = () => new Date().toISOString().slice(0, 10);
const weekKey = () => { const d = new Date(), j = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), w = Math.ceil(((d - j) / 864e5 + j.getUTCDay() + 1) / 7); return d.getUTCFullYear() + 'w' + String(w).padStart(2, '0'); };

export function installAcademy(H) {
  const S = H.S; S.pt = S.pt || { push: 0, sit: 0, run: 0, tests: {} }; S.insp = S.insp || {}; S.prep = S.prep || {};
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  let acts = [];
  // weekly counters for class standing
  function week() { const k = weekKey(); if (!S.week || S.week.k !== k) S.week = { k, rp: 0, f: 0, w: 0 }; return S.week; }
  function weekAdd(f, n) { week()[f] += n; dirty = true; }
  let dirty = true, pushT = 5;

  function setup() {
    acts = []; const W = H.W; if (!W || H.inside) return;
    W.lots.forEach((l) => { const [dx, dy] = H.doorSpot(l), x = dx, y = dy + .9;
      if (l.kind === 'hq' || l.kind === 'substation') { acts.push({ kind: 'pt', x: x - 1.6, y, icon: '🏋️', col: '#22c55e', label: 'PT' }); acts.push({ kind: 'insp', x: x + 1.6, y, icon: '🎖️', col: '#f5b800', label: 'Inspection' }); }
      if (l.kind === 'barber') acts.push({ kind: 'cut', x, y, icon: '💈', col: '#ef4444', label: 'Academy haircut · $10 (' + (l.name || 'barber') + ')' });
      if (l.kind === 'laundromat') acts.push({ kind: 'press', x, y, icon: '👔', col: '#38bdf8', label: 'Wash and press your uniform · $6' });
    });
  }
  const showable = (a) => { const P = H.P; return !H.inside && !P.inCar && !P.boat && !S.offDuty && Math.hypot(P.x - a.x, P.y - a.y) < 8; };
  function run(a) {
    if (a.kind === 'pt') ptMenu(); else if (a.kind === 'insp') inspMenu();
    else if (a.kind === 'cut') { if (S.prep.cut === dayKey()) { H.toast('💈 Already fresh today.'); return; } if (!H.pay(10, 'a haircut')) return; S.prep.cut = dayKey(); H.saveS(); H.dialogue([[H.sayAs('barber2', { name: 'Barber', icon: '💈', role: 'Academy cut' }), rnd(['High and tight? I could do it with my eyes closed. I won\'t, though.', 'Inspection tomorrow? Say no more.', 'Third cadet today. You all sit so straight. It\'s adorable.'])], ['narr', 'Ten minutes later you look like a recruiting poster.']], () => H.stat('cuts')); }
    else if (a.kind === 'press') { if (S.prep.press === dayKey()) { H.toast('👔 Uniform is already pressed.'); return; } if (!H.pay(6, 'laundry')) return; S.prep.press = dayKey(); H.saveS(); H.toast('👔 Washed, starched and pressed. Creases you could cut paper with.'); H.stat('press'); }
  }

  // ---------- PT ----------
  const STD = { push: [20, 35, 50], sit: [25, 45, 60], run: [16 * 60, 13.5 * 60, 12 * 60] }; // rough academy-style tiers for the game: pass, good, excellent
  function ptMenu() {
    const today = S.pt.day === dayKey(), wk = week().k, tested = !!S.pt.tests[wk];
    H.openModal('<div class="sceneHead"><b>ACADEMY PT</b><h2>Physical training</h2><p>Daily workout once a day. The PT test is once a week. Records are yours to beat.</p></div>' +
      '<div class="ptRec"><div><small>Push-ups</small><b>' + S.pt.push + '</b></div><div><small>Sit-ups</small><b>' + S.pt.sit + '</b></div><div><small>1.5-mile run</small><b>' + (S.pt.run ? fmt(S.pt.run) : '—') + '</b></div></div>' +
      '<div class="qAct"><button type="button" id="ptDay"' + (today ? ' disabled' : '') + '>' + (today ? 'Workout done today ✓' : 'Daily workout') + '</button><button type="button" id="ptTest"' + (tested ? ' disabled' : '') + '>' + (tested ? 'PT test done this week: ' + S.pt.tests[wk] : 'Weekly PT test') + '</button><button type="button" class="ghost" id="mClose">Back</button></div>');
    H.$('mClose').onclick = H.closeModal; const d = H.$('ptDay'); if (d && !today) d.onclick = () => events(false); const t = H.$('ptTest'); if (t && !tested) t.onclick = () => events(true);
  }
  const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');
  // one rep engine for all three events: a marker swings; tap in the green for a rep with good form
  function rep(title, sub, secs, speed, zone, done) {
    let reps = 0, miss = 0, t0 = performance.now(), raf = 0, ph = 0, lastT = t0, armed = true;
    H.openModal('<div class="sceneHead"><b>' + title.toUpperCase() + '</b><h2>' + title + '</h2><p>' + sub + '</p></div><div class="skGame"><div class="ptBig"><b id="ptN">0</b><small id="ptS">' + secs + 's</small></div><div class="skBar"><i id="skZ" style="left:' + (50 - zone * 50) + '%;width:' + (zone * 100) + '%"></i><b id="skM"></b></div><button type="button" id="skGo">TAP</button><p id="skMsg">&nbsp;</p></div>');
    const pos = () => (Math.sin(ph) + 1) / 2;
    const loop = (t) => { const m = H.$('skM'); if (!m) return; ph += (t - lastT) / 1000 * speed; lastT = t; m.style.left = (pos() * 100) + '%'; if (Math.abs(pos() - .5) > zone / 2) armed = true; const left = secs - (t - t0) / 1000; H.$('ptS').textContent = Math.max(0, Math.ceil(left)) + 's'; if (left <= 0) { cancelAnimationFrame(raf); setTimeout(() => done(reps, miss), 300); return; } raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    H.$('skGo').onclick = () => { const ok = armed && Math.abs(pos() - .5) <= zone / 2; if (ok) { armed = false; reps++; H.$('ptN').textContent = reps; } else miss++; H.beep(ok ? 740 : 180, .06, ok ? 'triangle' : 'sawtooth', .04); H.$('skMsg').textContent = ok ? rnd(['Good rep.', 'Clean.', 'That counts.', 'Keep going.']) : rnd(['No rep. All the way down.', 'Form!', 'That one doesn\'t count.']); };
  }
  function events(test) {
    const res = {};
    rep('Push-ups', 'Tap when the marker crosses the green: full range of motion, every rep.', 30, 6.5, .2, (p) => { res.push = p;
      rep('Sit-ups', 'Same rhythm, a little faster. Keep breathing.', 30, 8, .2, (s) => { res.sit = s;
        rep('1.5-mile run', 'Cadence run: tap on the beat to hold your pace.', 30, 7, .24, (r, m) => { res.run = Math.max(8 * 60, Math.round(17 * 60 - r * 7 + m * 3));
          finish(test, res); }); }); });
  }
  function finish(test, r) {
    const tier = (k, v) => k === 'run' ? (v <= STD.run[2] ? 3 : v <= STD.run[1] ? 2 : v <= STD.run[0] ? 1 : 0) : (v >= STD[k][2] ? 3 : v >= STD[k][1] ? 2 : v >= STD[k][0] ? 1 : 0);
    const pts = tier('push', r.push) + tier('sit', r.sit) + tier('run', r.run), grade = pts >= 8 ? 'Excellent' : pts >= 5 ? 'Good' : pts >= 3 ? 'Pass' : 'Not yet';
    const prs = []; if (r.push > S.pt.push) { S.pt.push = r.push; prs.push('push-ups'); } if (r.sit > S.pt.sit) { S.pt.sit = r.sit; prs.push('sit-ups'); } if (!S.pt.run || r.run < S.pt.run) { S.pt.run = r.run; prs.push('run'); }
    if (test) S.pt.tests[week().k] = grade; else S.pt.day = dayKey(); H.saveS();
    H.openModal('<div class="sceneHead"><b>' + (test ? 'WEEKLY PT TEST' : 'DAILY WORKOUT') + '</b><h2>' + (test ? grade : 'Workout complete') + '</h2><p>' + (prs.length ? 'New personal record: ' + prs.join(', ') + '!' : 'No new records today. Consistency beats intensity.') + '</p></div>' +
      '<div class="ptRec"><div><small>Push-ups</small><b>' + r.push + '</b></div><div><small>Sit-ups</small><b>' + r.sit + '</b></div><div><small>1.5-mile run</small><b>' + fmt(r.run) + '</b></div></div><div class="qAct"><button type="button" id="mClose">Hit the showers</button></div>');
    H.$('mClose').onclick = () => { H.closeModal(); H.award(test ? { Excellent: 220, Good: 150, Pass: 90, 'Not yet': 40 }[grade] : 60, test ? 'PT test · ' + grade : 'PT'); H.stat('pt'); if (test) { H.stat('pttest'); if (grade === 'Excellent') H.stat('ptex'); } if (prs.length) H.stat('ptpr'); H.mood(15); };
  }

  // ---------- inspection ----------
  function checks() {
    const g = S.gear || {}, own = (id) => (S.items || {})[id], boots = g.boots && /boots|spitshine|bootcandle|paradeboots|cloudboots/.test(g.boots), bands = own('bootbands') || S.prep.bands === dayKey();
    return [
      ['Haircut', S.prep.cut === dayKey(), 'Get an academy cut at a barbershop today (💈).'],
      ['Uniform pressed', S.prep.press === dayKey(), 'Wash and press it at a laundromat today (👔).'],
      ['Boots shined', boots || S.prep.shine === dayKey(), 'Wear shined boots, or shine yours below.'],
      ['Pants bloused', bands, 'Own boot bands, or blouse them below.'],
      ['Name tag aligned', S.prep.tag === dayKey(), 'Line it up below.'],
      ['Wearing the class uniform', !S.offDuty && (S.outfit || 'std') === 'std', 'Switch to the Academy Standard uniform in your Locker.']
    ];
  }
  function inspMenu() {
    const today = S.insp.day === dayKey(), list = checks();
    H.openModal('<div class="sceneHead"><b>INSPECTION</b><h2>Uniform inspection</h2><p>Once a day. Get every item ready, then stand inspection with Sgt. Castillo.</p></div>' +
      '<div class="inList">' + list.map((c) => '<div class="' + (c[1] ? 'ok' : '') + '"><i>' + (c[1] ? '✓' : '○') + '</i><b>' + c[0] + '</b><small>' + (c[1] ? 'Ready' : c[2]) + '</small></div>').join('') + '</div>' +
      '<div class="qAct"><button type="button" id="inShine"' + (S.prep.shine === dayKey() ? ' disabled' : '') + '>Shine boots</button><button type="button" id="inBand"' + (S.prep.bands === dayKey() ? ' disabled' : '') + '>Blouse pants</button><button type="button" id="inTag"' + (S.prep.tag === dayKey() ? ' disabled' : '') + '>Align name tag</button></div>' +
      '<div class="qAct"><button type="button" id="inGo"' + (today ? ' disabled' : '') + '>' + (today ? 'Inspected today: ' + S.insp.last : 'Stand inspection') + '</button><button type="button" class="ghost" id="mClose">Back</button></div>');
    H.$('mClose').onclick = H.closeModal;
    const sh = H.$('inShine'); if (sh) sh.onclick = () => rep('Shine boots', 'Small circles. Tap in the green to build up the shine.', 15, 7, .22, (n) => { if (n >= 8) { S.prep.shine = dayKey(); H.saveS(); H.toast('🥾 Mirror shine.'); } else H.toast('Not quite a mirror yet. Try again.'); inspMenu(); });
    const bd = H.$('inBand'); if (bd) bd.onclick = () => { S.prep.bands = dayKey(); H.saveS(); H.toast('Rubber bands, tucked and bloused. Boot bands would be faster.'); inspMenu(); };
    const tg = H.$('inTag'); if (tg) tg.onclick = () => rep('Align name tag', 'Tap when it lines up dead center. Three good taps.', 8, 3.5, .1, (n) => { if (n >= 3) { S.prep.tag = dayKey(); H.saveS(); H.toast('Name tag: perfectly level.'); } else H.toast('Crooked. Castillo will notice.'); inspMenu(); });
    const go = H.$('inGo'); if (go && !today) go.onclick = () => { H.closeModal(); stand(); };
  }
  function stand() {
    const list = checks(), ok = list.filter((c) => c[1]).length, perfect = ok === list.length;
    const notes = list.map((c) => ['castillo', c[1] ? rnd({ Haircut: ['Haircut: squared away.'], 'Uniform pressed': ['Creases: sharp.'], 'Boots shined': ['Boots: I can see my reflection. Good.'], 'Pants bloused': ['Bloused. Even.'], 'Name tag aligned': ['Name tag: level.'], 'Wearing the class uniform': ['Uniform: correct.'] }[c[0]]) : { Haircut: 'Haircut: that is not regulation, cadet.', 'Uniform pressed': 'Did you sleep in this shirt?', 'Boots shined': 'Boots: dull. Fix it.', 'Pants bloused': 'Pants: not bloused. Two gigs.', 'Name tag aligned': 'Name tag is crooked.', 'Wearing the class uniform': 'Wrong uniform for inspection, cadet.' }[c[0]]]);
    const grade = perfect ? 'Outstanding' : ok >= 5 ? 'Satisfactory' : ok >= 3 ? 'Needs work' : 'Unsatisfactory';
    H.dialogue([['narr', 'Attention! Sgt. Castillo walks the line slowly. She stops in front of you.']].concat(notes).concat([['castillo', perfect ? 'Outstanding, cadet. This is what the public deserves to see. Carry on.' : 'Fix what I told you. I\'ll be back tomorrow.']]), () => {
      S.insp.day = dayKey(); S.insp.last = grade; H.saveS(); H.stat('insp'); if (perfect) { H.stat('inspPerfect'); H.queueLoot('Perfect inspection', 1, 'r'); }
      H.award({ Outstanding: 120, Satisfactory: 70, 'Needs work': 30, Unsatisfactory: 10 }[grade], 'inspection · ' + grade); H.banner('🎖️', 'Inspection: ' + grade, ok + ' of ' + list.length + ' items squared away.'); }, { kicker: 'ROLL CALL · UNIFORM INSPECTION' });
  }

  // ---------- class standing ----------
  async function pushWeek() { if (!H.net() || !dirty) return; dirty = false; const w = week(); try { await H.net().gset('mmo/lb/' + w.k + '/' + H.net().uid, { c: S.cs, rp: Math.round(w.rp), f: w.f, w: w.w, g: (S.squad && S.squad.tag) || '', t: H.net().TS }); } catch (e) {} }
  async function standing() {
    await pushWeek(); const w = week(), net = H.net(); let rows = [];
    if (net) { try { const v = await net.gget('mmo/lb/' + w.k); rows = Object.keys(v || {}).map((k) => Object.assign({ id: k }, v[k])); } catch (e) {} }
    if (!rows.some((r) => net && r.id === net.uid)) rows.push({ id: net ? net.uid : 'me', c: S.cs, rp: Math.round(w.rp), f: w.f, w: w.w, g: (S.squad && S.squad.tag) || '' });
    const me = net ? net.uid : 'me', by = (k) => rows.slice().sort((a, b) => (b[k] || 0) - (a[k] || 0)), top = (k) => by(k)[0] || {};
    const sq = {}; rows.forEach((r) => { if (r.g) sq[r.g] = (sq[r.g] || 0) + (r.rp || 0); }); const bestSq = Object.keys(sq).sort((a, b) => sq[b] - sq[a])[0];
    const award = (icon, name, who, val) => '<div class="lbAward"><span>' + icon + '</span><div><small>' + name + '</small><b>' + H.esc(who || '—') + '</b><em>' + val + '</em></div></div>';
    const list = by('rp').slice(0, 30);
    H.openModal('<div class="sceneHead"><b>CLASS STANDING · WEEK ' + w.k.split('w')[1] + '</b><h2>This week\'s class</h2><p>Resets every Monday. Your RP, facts and Rec Room wins this week.</p></div>' +
      '<div class="lbAwards">' + award('🎯', 'Top Gun Academic', top('f').c, (top('f').f || 0) + ' facts') + award('⭐', 'Top Performer', top('rp').c, (top('rp').rp || 0) + ' RP') + award('🎮', 'Rec Room Champion', top('w').c, (top('w').w || 0) + ' wins') + award('🛡️', 'Squad of the Week', bestSq ? '[' + bestSq + ']' : 'No squads yet', bestSq ? sq[bestSq] + ' RP' : '') + '</div>' +
      '<div class="mgList">' + list.map((r, i) => '<div class="mgRow' + (r.id === me ? ' me' : '') + '"><i>' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</i><b>' + (r.g ? '[' + H.esc(r.g) + '] ' : '') + H.esc(r.c) + '</b><small>' + (r.f || 0) + ' facts · ' + (r.w || 0) + ' wins</small><strong>' + (r.rp || 0) + '</strong></div>').join('') + '</div>' +
      '<div class="qAct"><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal; H.stat('standing');
  }

  return {
    setup, run, standing, weekAdd, week, ptMenu, inspMenu,
    get acts() { return acts.filter(showable); }, get all() { return acts; },
    tick(dt) { pushT -= dt; if (pushT <= 0) { pushT = 60; pushWeek(); } },
    draw(now) { acts.forEach((a) => { if (!showable(a)) return; const [sx, sy] = H.iso(a.x, a.y); H.bubble(sx, sy - 36, a.icon, a.col, now); if (Math.hypot(H.P.x - a.x, H.P.y - a.y) < 4) H.label(sx, sy - 60, a.label, '#e2e8f0'); }); }
  };
}
