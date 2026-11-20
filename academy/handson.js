// Procedures you do with your hands: the walk-around inspection, the radio call that starts a pursuit, and the
// pursuit report the sergeant checks. The walk-around: the patrol car from above, and you tap where you look (tires,
// under the hood, under the car, lights, the cabin, the back seat, the trunk). Three things are wrong with it, each one a
// fact from Lesson 1.1. When you find one you decide what to do about it, and that decision is the fact check: never more
// than three per walk-around, and you can stop and finish later at any point.
const rnd = (a) => a[(Math.random() * a.length) | 0];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

// where you can look: [key, label, what a clean check says]
const ZONES = {
  tireFL: ['Front left tire', 'Tread is deep and even. Pressure matches the doorjamb.'],
  tireFR: ['Front right tire', 'No cuts, no bulges. Rim looks straight.'],
  tireRL: ['Rear left tire', 'Even wear. Nothing in the tread.'],
  tireRR: ['Rear right tire', 'Good tread, no damage to the rim.'],
  hood: ['Under the hood', 'Fluids at the marks. Hoses, wires and belts look good.'],
  under: ['Under the car', 'Dry pavement, nothing hanging down, no debris caught.'],
  lights: ['Lights and light bar', 'Covers intact. Light bar and signals work.'],
  cabin: ['Driver\'s seat and gauges', 'Gauges move, radio checks out, nothing loose.'],
  back: ['Back seat', 'Seats intact, belts latch, nothing under the seat.'],
  trunk: ['Trunk', 'Spare, jack and tire tool are there. Gear is strapped down.']
};
const TIRES = ['tireFL', 'tireFR', 'tireRL', 'tireRR'];
// what can be wrong: [zones it can show up in, what you see, right call, [wrong calls], fact pattern in Lesson 1.1]
const PROBLEMS = [
  [TIRES, 'A screw is stuck deep in the tread.', 'Leave it in and have maintenance pull it', ['Pull it out now and listen for a hiss', 'Pull it out and top the tire off to PSI'], /Do not pull out an object stuck in a tire/i],
  [TIRES, 'The tread is worn down flush with the wear bars.', 'Have it replaced before the car goes out', ['Air it up past the doorjamb PSI and go', 'Rotate it to the rear and keep driving it'], /wear bars sit flush/i],
  [TIRES, 'There\'s a deep cut in the sidewall.', 'Report it now; a cut can lead to a blowout', ['Drive it gently and report it at end of shift', 'Air it up a few PSI and keep driving it'], /Cuts in a tire can lead to a blowout/i],
  [['under'], 'A wrapped package is taped up under the frame.', 'Back away and call the people policy names', ['Pull it loose carefully and look inside it', 'Photograph it, then drive it to the shop'], /possible explosive/i],
  [['under'], 'A dark puddle is spreading under the engine.', 'Report the leak before the car goes out', ['Top off the oil and drive the shift as usual', 'Move the car over so the puddle stops growing'], /Look for fluid leaks/i],
  [['under'], 'A tree limb is caught up against the axle.', 'Get it out before it hits a moving part', ['Leave it; it\'ll fall off once you get moving', 'Drive slowly so the limb works itself loose'], /Tree limbs and road debris caught under/i],
  [['hood'], 'The serpentine belt is frayed along one edge.', 'Report it before the car is driven today', ['Drive it today and report it at end of shift', 'Trim off the frayed edge and drive the shift'], /belts for fraying/i],
  [['hood'], 'A hose has a soft bulge and a damp spot.', 'Report it; bulges and leaks mean it can fail', ['Wrap it in tape and keep it on the road', 'Drive it today and report it at end of shift'], /hoses for dry rot/i],
  [['lights'], 'A rear light cover is cracked and missing a piece.', 'Report it; it\'s a hazard and a violation', ['Tape it up and run the shift as normal', 'Ignore it; the bulb behind it still works'], /missing or broken light cover/i],
  [['lights'], 'The light bar won\'t come on when you test it.', 'Report it; the car can\'t run emergency mode', ['Run calls anyway; the siren still works', 'Wait and test it again at end of shift'], /siren, light bar or other emergency light/i],
  [['cabin'], 'A coffee cup and a flashlight are loose on the dash.', 'Stow and secure them before you drive', ['Leave them; they hardly weigh anything', 'Move them to the passenger seat, loose'], /Loose items such as briefcases/i],
  [['cabin'], 'The windshield is cracked right in your line of sight.', 'Report it; cracked glass blocks your view', ['Drive it today and report it at end of shift', 'Turn the defroster on and drive the shift'], /Broken or cracked glass/i],
  [['back'], 'Something is pushed down under the back seat.', 'Recover it and report it before you drive', ['Leave it for the next shift to deal with', 'Push it farther under so nobody grabs it'], /search under the back seat/i],
  [['back'], 'A rear seat belt won\'t latch when you test it.', 'Report it; every buckle has to latch', ['Tuck it behind the seat so nobody uses it', 'Drive it today and report it at end of shift'], /seat belts and confirm that each buckle latches/i],
  [['trunk'], 'The long gun is lying front to back in the trunk.', 'Turn it side to side across the cargo area', ['Leave it front to back so it slides in easy', 'Stand it upright against the back seat'], /side to side across the cargo area/i],
  [['trunk'], 'There\'s no jack or tire tool in the trunk.', 'Report it; the trunk should carry both', ['Skip it; dispatch can send a tow truck', 'Borrow a jack from your own car later'], /spare, a jack, a tire tool/i]
];

// the car from above, drawn here: body, windows, light bar, tires, and one hit area per place you can look
function carSVG() {
  const lbl = (x, y, s) => '<text class="woLbl" x="' + x + '" y="' + y + '" text-anchor="middle">' + s + '</text>';
  const t = (k, x, y) => '<rect class="woZone woTire" data-z="' + k + '" x="' + x + '" y="' + y + '" width="22" height="46" rx="7"/>';
  return '<svg class="woCar" viewBox="0 0 220 360" role="img" aria-label="Your patrol car from above">' +
    '<defs><linearGradient id="woBody" x1="0" x2="1"><stop offset="0" stop-color="#0f172a"/><stop offset=".5" stop-color="#1e293b"/><stop offset="1" stop-color="#0f172a"/></linearGradient></defs>' +
    '<rect class="woZone woGround" data-z="under" x="4" y="4" width="212" height="352" rx="34"/>' +
    t('tireFL', 30, 62) + t('tireFR', 168, 62) + t('tireRL', 30, 252) + t('tireRR', 168, 252) +
    '<rect x="48" y="24" width="124" height="312" rx="40" fill="url(#woBody)" stroke="#94a3b8" stroke-width="2"/>' +
    '<rect x="56" y="30" width="108" height="20" rx="8" fill="#f8fafc" opacity=".9"/>' + // white front bumper band
    '<rect class="woZone" data-z="hood" x="58" y="52" width="104" height="66" rx="14"/>' + lbl(110, 90, 'HOOD') +
    '<path d="M64 124 Q110 108 156 124 L150 150 Q110 140 70 150 Z" fill="#7dd3fc" opacity=".55"/>' +
    '<rect class="woZone" data-z="lights" x="70" y="160" width="80" height="16" rx="6"/>' +
    '<rect x="74" y="163" width="36" height="10" rx="4" fill="#ef4444"/><rect x="110" y="163" width="36" height="10" rx="4" fill="#3b82f6"/>' +
    '<rect class="woZone" data-z="cabin" x="62" y="182" width="96" height="44" rx="10"/>' + lbl(110, 208, 'DRIVER') +
    '<rect class="woZone" data-z="back" x="62" y="230" width="96" height="40" rx="10"/>' + lbl(110, 254, 'BACK SEAT') +
    '<path d="M70 276 Q110 286 150 276 L154 292 Q110 300 66 292 Z" fill="#7dd3fc" opacity=".45"/>' +
    '<rect class="woZone" data-z="trunk" x="58" y="296" width="104" height="34" rx="12"/>' + lbl(110, 317, 'TRUNK') +
    '<rect x="60" y="326" width="16" height="6" rx="2" fill="#f87171"/><rect x="144" y="326" width="16" height="6" rx="2" fill="#f87171"/>' +
    '<rect x="60" y="28" width="16" height="6" rx="2" fill="#fde68a"/><rect x="144" y="28" width="16" height="6" rx="2" fill="#fde68a"/>' +
    lbl(110, 350, 'UNDER THE CAR') + lbl(110, 156, 'LIGHTS') + '</svg>';
}

export function installHandsOn(H) {
  const S = H.S;
  // calls that are a walk-around: inspecting a car back from the shop, a unit with a tire problem, the car after a transport
  const fits = (c) => c && c.les === 0 && /inspect|low tire|transport just ended|back from the shop/i.test(c.title || '');
  function factFor(re) { const f = H.factList([0]).find((x) => re.test(x.text)); return f ? f.id : null; }

  // the walk-around itself; res is the scene's tally, done() hands the scene back
  function inspect(c, res, done) {
    // three problems in three different places; after a transport one of them is always under the back seat
    const pool = shuffle(PROBLEMS), used = {}, picks = [];
    if (c && /transport/i.test(c.title)) { const p = PROBLEMS.find((x) => /under the back seat/.test(x[1])); picks.push([p, 'back']); used.back = 1; }
    for (const p of pool) { if (picks.length >= 3) break; if (picks.some((x) => x[0] === p)) continue; const z = shuffle(p[0]).find((k) => !used[k]); if (!z) continue; used[z] = 1; picks.push([p, z]); }
    const at = {}; picks.forEach(([p, z]) => { at[z] = p; });
    let found = 0, looked = {}, open = null, closed = false;
    const total = picks.length;
    H.openModal('<div class="sceneHead"><b>WALK-AROUND</b><h2>Inspect your car</h2><p>Tap where you look. Something\'s off in ' + total + ' places. Find each one and decide what to do.</p></div>' +
      '<div class="woWrap">' + carSVG() + '<div class="woSide"><p class="woCount" id="woCount"></p><ul class="woLog" id="woLog"></ul><div id="woAsk"></div></div></div>' +
      '<div class="qAct"><button type="button" class="ghost" id="woLater">Finish later</button></div>');
    const $ = (id) => document.getElementById(id), log = $('woLog'), ask = $('woAsk'); document.body.classList.add('woOn'); // the scene's dialogue box steps aside
    const count = () => { $('woCount').textContent = found + ' of ' + total + ' found'; };
    const line = (cls, txt) => { const li = document.createElement('li'); li.className = cls; li.textContent = txt; log.prepend(li); };
    const finish = (early) => { if (closed) return; closed = true; document.body.classList.remove('woOn'); H.closeModal(); if (!early) H.toast('🔧 Walk-around done: ' + res.right + ' of ' + total + ' handled by the book'); done(); };
    count();
    $('woLater').onclick = () => finish(true);
    document.querySelectorAll('.woCar .woZone').forEach((el) => {
      el.addEventListener('click', () => {
        if (open || closed) return; const z = el.dataset.z, p = at[z]; if (looked[z]) return; looked[z] = 1; el.classList.add('seen'); H.beep && H.beep(z);
        if (!p) { line('woOk', ZONES[z][0] + ': ' + ZONES[z][1]); return; }
        el.classList.add('bad'); open = z; found++; count();
        const fid = factFor(p[4]), opts = shuffle([p[2]].concat(p[3]));
        ask.innerHTML = '<div class="woFind"><b>' + H.esc(ZONES[z][0]) + '</b><p>' + H.esc(p[1]) + '</p><small>What do you do?</small>' +
          opts.map((o, k) => '<button type="button" class="woOpt" data-k="' + k + '">' + H.esc(o) + '</button>').join('') + '</div>';
        ask.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        ask.querySelectorAll('.woOpt').forEach((b) => { b.onclick = () => {
          const pick = opts[+b.dataset.k], ok = pick === p[2], q = { id: 'wo:' + PROBLEMS.indexOf(p), les: 0, fid, stem: p[1] + ' What do you do?' };
          H.record(q, ok); res.n++; if (ok) res.right++; res.qs = res.qs || []; res.qs.push({ stem: q.stem, ok, fact: H.factText(fid) });
          ask.querySelectorAll('.woOpt').forEach((x) => { x.disabled = true; if (opts[+x.dataset.k] === p[2]) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
          const why = H.factText(fid); ask.insertAdjacentHTML('beforeend', '<p class="woWhy ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✅ ' : '📋 ') + H.esc(ok ? 'By the book.' : 'Not quite.') + (why ? ' ' + H.esc(why) : '') + '</p><button type="button" id="woNext">' + (found >= total ? 'Finish the walk-around' : 'Keep looking') + '</button>');
          line(ok ? 'woFix' : 'woMiss', ZONES[z][0] + ': ' + (ok ? 'handled' : 'needs another look'));
          $('woNext').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          $('woNext').onclick = () => { ask.innerHTML = ''; open = null; if (found >= total) finish(false); };
        }; });
      });
    });
  }
  // ---------- the radio call you build from parts: starting a pursuit ----------
  // tiles you can key into the mic. Good ones say what dispatch needs; the bad ones are tactics the chapter rules out.
  // ctx: { cs, where, dir, car, why }; done(sent) gets the tiles you sent (or null if you skipped it)
  function radioBuild(ctx, done) {
    const tiles = shuffle([
      { t: ctx.cs, k: 'unit' }, { t: 'in pursuit', k: 'start', fact: /tell dispatch when you start or stop it/i }, { t: ctx.where, k: 'where' }, { t: ctx.dir + 'bound', k: 'dir' },
      { t: ctx.car, k: 'car' }, { t: 'for ' + ctx.why, k: 'why' },
      { t: 'setting up a block just past the curve', k: 'bad', fact: /bad site sits over a hilltop or in, on or near a curve/i, fix: 'A roadblock just past a curve gives him no time to stop. A good site can be seen from both directions.' },
      { t: 'going quiet until he stops', k: 'bad', fact: /tell dispatch when you start or stop it/i, fix: 'Stay in contact with dispatch and the other units the whole time.' },
      { t: 'moving up to ram him off the road', k: 'bad', fact: /used on purpose as a weapon is a deadly weapon/i, fix: 'A patrol car used to ram is a deadly weapon, under use of force policy.' }]);
    const msg = [], closed = { v: false };
    H.openModal('<div class="sceneHead"><b>KEY THE MIC</b><h2>Tell dispatch</h2><p>He\'s not stopping. Build what you say, in order, then key the mic. Tap a part again to take it back out.</p></div>' +
      '<div class="rbLine" id="rbLine"><span class="rbHint">Your transmission…</span></div><div class="rbTiles" id="rbTiles">' +
      tiles.map((x, i) => '<button type="button" class="rbTile" data-i="' + i + '">' + H.esc(x.t) + '</button>').join('') + '</div>' +
      '<div class="qAct"><button type="button" id="rbSend" disabled>Key the mic</button><button type="button" class="ghost" id="rbSkip">Skip it</button></div>');
    const line = document.getElementById('rbLine'), send = document.getElementById('rbSend'); document.body.classList.add('woOn');
    const draw = () => { line.innerHTML = msg.length ? msg.map((i) => '<span class="rbPart">' + H.esc(tiles[i].t) + '</span>').join(' ') : '<span class="rbHint">Your transmission…</span>'; send.disabled = !msg.length;
      document.querySelectorAll('.rbTile').forEach((b) => b.classList.toggle('on', msg.includes(+b.dataset.i))); };
    document.querySelectorAll('.rbTile').forEach((b) => { b.onclick = () => { const i = +b.dataset.i, at = msg.indexOf(i); if (at >= 0) msg.splice(at, 1); else if (msg.length < 7) msg.push(i); H.beep && H.beep(); draw(); }; });
    const finish = (sent) => { if (closed.v) return; closed.v = true; document.body.classList.remove('woOn'); H.closeModal(); done(sent); };
    document.getElementById('rbSkip').onclick = () => finish(null);
    send.onclick = () => {
      const sent = msg.map((i) => tiles[i]), said = sent.map((x) => x.t).join(', ');
      const told = sent.some((x) => x.k === 'start'), bad = sent.filter((x) => x.k === 'bad'), has = (k) => sent.some((x) => x.k === k);
      // the fact checks: telling dispatch you've started (always), and any bad tactic you keyed in
      H.record({ id: 'rb:start', les: 11, fid: factFor11(/tell dispatch when you start or stop it/i), stem: 'Starting a pursuit: what do you tell dispatch?' }, told && !bad.some((x) => /quiet/.test(x.t)));
      bad.slice(0, 2).forEach((x) => H.record({ id: 'rb:' + x.t.slice(0, 12), les: 11, fid: factFor11(x.fact), stem: 'Pursuit radio: ' + x.t }, false));
      const notes = [];
      if (!told) notes.push('You never said you\'re in pursuit. Tell dispatch when you start it and when you stop it.');
      bad.forEach((x) => notes.push(x.fix));
      if (told && !bad.length && !(has('where') && has('car'))) notes.push('Say where you are and what he\'s driving, so units can help.');
      finish({ said, told, bad: bad.length, notes, full: told && !bad.length && has('where') && has('car') && has('dir') });
    };
  }
  // ---------- the pursuit report: the sergeant checks it against what happened ----------
  // info: { how: 'term'|'air'|'lost'|'stopped', ordered, told, why, picks: ['term'|'go'|'air'|'bad'...] }
  function pursuitReport(info, res, done) {
    const HOW = { term: 'I ended it when the risk got too high', air: 'I backed off and Air One tracked it', lost: 'I lost sight of the vehicle', stopped: 'The vehicle stopped' };
    const truthHow = info.ordered ? 'term' : info.how;
    const fields = [
      ['start', 'Why the pursuit started', shuffle([info.why, 'Reckless driving complaint', 'Stolen vehicle hit on the plate', 'Suspect from a robbery call']), info.why],
      ['end', 'How it ended', shuffle(Object.values(HOW)), HOW[truthHow]],
      ['told', 'You told dispatch when it started', ['Yes', 'No'], info.told ? 'Yes' : 'No'],
      ['when', 'When you file this report', shuffle(['Now, before the end of my shift', 'At the end of the week with my others', 'Only if a complaint comes in']), 'Now, before the end of my shift']
    ];
    const pickOf = {}, closed = { v: false };
    H.openModal('<div class="sceneHead"><b>PURSUIT REPORT</b><h2>Write it up</h2><p>Sgt. Castillo will read this against the radio log and the in-car video. Fill in each line.</p></div>' +
      '<div class="prForm">' + fields.map(([k, label, opts]) => '<label class="prRow"><span>' + H.esc(label) + '</span><select data-f="' + k + '"><option value="">Choose…</option>' + opts.map((o) => '<option>' + H.esc(o) + '</option>').join('') + '</select></label>').join('') + '</div>' +
      '<div id="prOut"></div><div class="qAct"><button type="button" id="prSend" disabled>Hand it to the sergeant</button><button type="button" class="ghost" id="prLater">Finish it later</button></div>');
    const send = document.getElementById('prSend'); document.body.classList.add('woOn');
    document.querySelectorAll('.prForm select').forEach((sel) => { sel.onchange = () => { pickOf[sel.dataset.f] = sel.value; send.disabled = fields.some(([k]) => !pickOf[k]); }; });
    const finish = () => { if (closed.v) return; closed.v = true; document.body.classList.remove('woOn'); H.closeModal(); done(); };
    document.getElementById('prLater').onclick = finish;
    send.onclick = () => {
      const wrong = fields.filter(([k, , , truth]) => pickOf[k] !== truth), prompt = pickOf.when === fields[3][3];
      H.record({ id: 'pr:when', les: 11, fid: factFor11(/Report pursuit details to your agency promptly/i), stem: 'When do you file a pursuit report?' }, prompt);
      res.n++; if (prompt) res.right++; res.qs = res.qs || []; res.qs.push({ stem: 'When do you file a pursuit report?', ok: prompt, fact: H.factText(factFor11(/Report pursuit details to your agency promptly/i)) });
      res.report = { wrong: wrong.length };
      const say = { start: 'The radio log has why it started. Your report has to match it.', end: 'The video shows how it ended. Write what happened, not what you wish happened.', told: 'The radio log shows what you said when it started.', when: 'Report a pursuit promptly. Every agency requires it.' };
      document.getElementById('prOut').innerHTML = '<div class="prCheck ' + (wrong.length ? 'no' : 'ok') + '"><b>' + (wrong.length ? 'Sgt. Castillo: Fix this before it goes up the chain.' : 'Sgt. Castillo: Clean. It matches the log and the video.') + '</b>' +
        (wrong.length ? '<ul>' + wrong.map(([k, label, , truth]) => '<li><b>' + H.esc(label) + ':</b> ' + H.esc(truth) + '. ' + H.esc(say[k]) + '</li>').join('') + '</ul>' : '') + '</div>';
      document.querySelectorAll('.prForm select').forEach((x) => { x.disabled = true; });
      send.textContent = 'Done'; send.onclick = finish; document.getElementById('prLater').hidden = true;
    };
  }
  function factFor11(re) { const f = H.factList([11]).find((x) => re.test(x.text)); return f ? f.id : null; }
  return { fits, inspect, radioBuild, pursuitReport, PROBLEMS, ZONES };
}
