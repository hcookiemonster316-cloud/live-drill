// Premium layer: haptics, cinematic call openings, "previously on" recap, report writing, shift-long story threads,
// a city that remembers what you did, and comfort options (text size, one-handed layout).
// Everything here is cheap at runtime: DOM only when a moment happens, cached sprites for anything drawn in the world.
export function installPremium(H) {
  const S = H.S, esc = H.esc, rnd = (a) => a[Math.floor(Math.random() * a.length)];
  S.cfg = S.cfg || {}; S.helped = S.helped || {}; S.threads = S.threads || [];

  // ================= haptics =================
  const PAT = { call: 28, p1: [70, 40, 70], gate: 14, ok: 18, bad: [30, 30, 30], backup: [40, 30, 40], tap: 8 };
  function buzz(k) { if (S.cfg.haptics === false || !navigator.vibrate) return; try { navigator.vibrate(PAT[k] || 15); } catch (e) {} }

  // ================= cinematic call opening =================
  // a two-second establishing shot of the address with the dispatch typed across it; tap anywhere to skip
  let intro = null;
  function callIntro(c, done) {
    if (S.cfg.callCine === false || S.cfg.motion === false || H.inside() || H.busy() || intro) { done && done(); return; }
    const el = document.createElement('div'); el.className = 'cIntro p' + c.prio;
    el.innerHTML = '<i class="ciBar t"></i><i class="ciBar b"></i><div class="ciTxt"><small>' + (c.prio === 1 ? 'PRIORITY 1' : c.prio === 2 ? 'PRIORITY 2' : 'ROUTINE') + ' · ' + esc(H.clockStr()) + '</small><b></b><p>' + esc(c.where) + '</p></div>';
    document.body.appendChild(el); H.setPaused(true); H.cineFocus(c.x, c.y, 1.25);
    const b = el.querySelector('b'), text = c.title; let k = 0; const tt = setInterval(() => { b.textContent = text.slice(0, ++k); if (k >= text.length) clearInterval(tt); }, 28);
    requestAnimationFrame(() => el.classList.add('on'));
    const end = () => { if (!intro) return; intro = null; clearInterval(tt); clearTimeout(t); el.classList.remove('on'); el.classList.add('out'); H.cineRelease(); H.setPaused(false); setTimeout(() => el.remove(), 450); done && done(); };
    const t = setTimeout(end, c.prio === 1 ? 2600 : 2100); el.onclick = end; intro = { end };
  }

  // ================= session recap ("previously on Patrol City") =================
  // the last session's highlights are kept small (a few counters and names) and shown once when you come back
  const sess = { calls: 0, best: null, lore: 0, t0: Date.now() };
  if (S.sess && S.sess.calls != null) S.prevSess = S.sess; S.sess = sess;
  const GR = 'DCBAS';
  function onCall(grade) { sess.calls++; if (!sess.best || GR.indexOf(grade) > GR.indexOf(sess.best)) sess.best = grade; H.saveS(); }
  function onLore() { sess.lore++; }
  // extra lines for the existing "previously in Patrol City" card: what you did last session
  function sessLines() { const p = S.prevSess; if (!p) return []; const out = [];
    if (p.calls) out.push('Last shift you cleared ' + p.calls + ' call' + (p.calls > 1 ? 's' : '') + (p.best ? ' (best grade: ' + p.best + ')' : '') + '.');
    if (p.lore) out.push('You found ' + p.lore + ' new page' + (p.lore > 1 ? 's' : '') + ' of city history.');
    if (S.threads && S.threads.length) out.push('An open lead is still in your notes: ' + S.threads[0].item + '.');
    return out; }

  // ================= report writing =================
  // after a priority call (and every third call) you file a short report: three quick picks, all from what happened
  let since = 0;
  function needsReport(c) { since++; if (c.prio === 1 || since >= 3) { since = 0; return true; } return false; }
  function report(c, done) {
    const W = H.W(), others = W.lots.filter((l) => l.name && l.name !== c.where).map((l) => l.name), titles = H.callTitles().filter((t) => t !== c.title);
    const hr = H.hourAt(c.t0 || 0), fmt = (h) => String(Math.floor((h + 24) % 24)).padStart(2, '0') + String(Math.floor(((h % 1) + 1) % 1 * 60 / 15) * 15).padStart(2, '0') + ' hrs';
    const picks = [
      { q: 'Location of the incident', a: c.where, opts: [c.where, rnd(others) || 'Founders Plaza', rnd(others) || 'Harbor Rd'] },
      { q: 'Nature of the call', a: c.title, opts: [c.title, rnd(titles) || 'Suspicious vehicle', rnd(titles) || 'Noise complaint'] },
      c.coop ? { q: 'Cover officer on scene', a: c.coop, opts: [c.coop, rnd(['2-Baker-14', '3-Charlie-7', '1-David-3']), rnd(['4-Edward-9', '2-Frank-11'])] } : { q: 'Time of dispatch', a: fmt(hr), opts: [fmt(hr), fmt(hr + 2), fmt(hr - 3)] }
    ].map((p) => { const u = []; p.opts.forEach((o) => { if (u.indexOf(o) < 0) u.push(o); }); while (u.length < 3) u.push(p.a + ' (unconfirmed)'); return Object.assign(p, { opts: u.sort(() => Math.random() - .5) }); });
    const el = document.createElement('div'); el.className = 'rpt'; let i = 0, right = 0;
    const draw = () => {
      const p = picks[i]; el.innerHTML = '<div class="rpIn"><div class="rpHead"><small>INCIDENT REPORT · ' + (i + 1) + ' OF 3</small><b>' + esc(c.title) + '</b></div><div class="rpForm"><label>' + esc(p.q) + '</label>' + p.opts.map((o, k) => '<button type="button" data-k="' + k + '">' + esc(o) + '</button>').join('') + '</div><p class="rpTip">Write what you saw, not what you assume.</p></div>';
      el.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => { const ok = p.opts[+b.dataset.k] === p.a; if (ok) right++; b.classList.add(ok ? 'ok' : 'no'); if (!ok) el.querySelectorAll('[data-k]').forEach((x) => { if (p.opts[+x.dataset.k] === p.a) x.classList.add('ok'); }); buzz(ok ? 'ok' : 'bad'); H.beep(ok ? 880 : 300, .08, 'triangle', .035);
        el.querySelectorAll('[data-k]').forEach((x) => x.disabled = true); setTimeout(() => { i++; if (i < picks.length) draw(); else { el.classList.remove('on'); setTimeout(() => el.remove(), 350); done(['📝', 'Report', right * 4 - (right === 3 ? 2 : 0), 10, right + ' of 3 details accurate']); } }, ok ? 450 : 1100); });
    };
    document.body.appendChild(el); draw(); requestAnimationFrame(() => el.classList.add('on'));
  }

  // ================= shift-long story threads =================
  // an early call leaves a detail on the record; a later call turns on whether you remember it
  const THREADS = [
    { seed: 'Stolen bicycle', item: () => rnd(['a red bicycle with a wicker basket', 'a blue mountain bike with a cracked seat', 'a green cruiser with a bell']), later: ['Pawn shop reports a suspicious sale', 2, 'pawn', 'Clerk says a man is selling a bike cheap and in a hurry.'], ask: 'Does the bike match the earlier report?' },
    { seed: 'Hit-and-run, minor damage', item: () => rnd(['a white van, partial plate 7K', 'a silver sedan with a broken taillight', 'a black pickup with a ladder rack']), later: ['Suspicious vehicle parked for hours', 3, 'parking', 'Caller says the same vehicle has been parked since morning.'], ask: 'Is this the vehicle from the hit-and-run?' },
    { seed: 'Missing package', item: () => rnd(['a brown box marked FRAGILE', 'a long tube addressed to a dentist', 'a padded envelope with a blue sticker']), later: ['Found property turned in', 3, 'any', 'A resident found something on the sidewalk.'], ask: 'Is this the missing package from earlier?' }
  ];
  function seedThread(c) {
    if (S.threads.length >= 2 || Math.random() > .35) return; const T = rnd(THREADS), item = T.item(), all = [];
    THREADS.forEach((x) => { for (let i = 0; i < 4; i++) { const v = x.item(); if (all.indexOf(v) < 0 && v !== item) all.push(v); } });
    S.threads.push({ k: THREADS.indexOf(T), item, decoys: all.filter((v) => v !== item).sort(() => Math.random() - .5).slice(0, 2), at: H.clock() + 300, from: c.where }); H.saveS();
    H.radio('Dispatch', 'All units, attach to your notes: ' + T.seed.toLowerCase() + ' near ' + c.where + ', ' + item + '. Be on the lookout.');
  }
  function threadCall() { const i = S.threads.findIndex((t) => H.clock() >= t.at); if (i < 0) return null; const t = S.threads[i], T = THREADS[t.k]; return { t, i, c: T.later.slice(0, 4), ask: T.ask }; }
  function threadLines(c, sp) {
    if (!c.thread) return []; const t = c.thread, match = Math.random() < .6, shown = match ? t.item : t.decoys[0];
    return [['narr', 'You notice ' + shown + '.'], ['choice', [
      { t: match ? 'It matches the earlier report from ' + t.from + '. Call it in.' : 'It matches the earlier report from ' + t.from + '. Call it in.', ok: match ? 1 : 0, reply: [[sp, match ? '(over the radio) Good catch. That ties it to the earlier report.' : '(over the radio) Read the notes again: the earlier report said ' + t.item + '.']], fx: () => { c.threadOk = match; } },
      { t: 'It doesn\'t match the earlier report. Note it and move on.', ok: match ? 0 : 1, reply: [[sp, !match ? '(over the radio) Right. Different item. Good eye for detail.' : '(over the radio) It does match: ' + t.item + '. Details matter.']], fx: () => { c.threadOk = !match; } }
    ].sort(() => Math.random() - .5), t.ask || 'Does it match?']];
  }
  function threadDone(c) { if (!c.thread) return null; S.threads = S.threads.filter((x) => x !== c.thread); H.saveS(); return ['🧵', 'Case link', c.threadOk ? 10 : 2, 10, c.threadOk ? 'Remembered the earlier report' : 'Missed the link to the earlier report']; }

  // ================= a city that remembers =================
  // businesses you helped put a thank-you sign in the window for a week; regulars mention it as you walk by
  let helpedV = 0;
  function helped(c) { if (!c.where || /^block |parking lot/.test(c.where)) return; helpedV++; S.helped[H.W().did + ':' + c.where] = Date.now(); const ks = Object.keys(S.helped); if (ks.length > 60) delete S.helped[ks.sort((a, b) => S.helped[a] - S.helped[b])[0]]; H.saveS(); }
  let SIGN = null;
  function signSprite() { if (SIGN) return SIGN; const [c, g] = H.hiCanvas(34, 22, 2); g.fillStyle = '#fef3c7'; g.beginPath(); g.roundRect(2, 2, 30, 17, 3); g.fill(); g.strokeStyle = '#b45309'; g.lineWidth = 1; g.stroke(); g.fillStyle = '#b45309'; g.font = '800 6px Meridian,system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('THANK YOU', 17, 9.5); g.fillText('OFFICERS ♥', 17, 16); SIGN = c; return c; }
  // which lots have a sign is worked out every two seconds (and on a district change), not per lot per frame
  let signLots = [], signT = 0, signW = null, signN = -1;
  function drawSigns(list, vis, ctx) {
    const W = H.W(), wk = 7 * 864e5; if (H.inside()) return;
    const now = performance.now(), nh = helpedV;
    if (now - signT > 2000 || signW !== W || signN !== nh) { signT = now; signW = W; signN = nh; const t = Date.now(); signLots = W.lots.filter((l) => { if (!l.name) return false; const at = S.helped[W.did + ':' + l.name]; return at && t - at <= wk; }); }
    for (const l of signLots) { if (!l._sg) l._sg = H.iso(l.door[0] + .5, l.door[1] + .1); const [sx, sy] = l._sg; if (!vis(sx, sy)) continue;
      list.push({ d: l.door[0] + l.door[1] + .6, f: () => { const s = signSprite(); ctx.drawImage(s, sx - 17, sy - 52, s.lw, s.lh); } }); }
  }
  let mT = 0;
  function memoryBarks(dt) { mT -= dt; if (mT > 0) return; mT = 2; const W = H.W(), P = H.P; if (H.inside() || H.busy()) return;
    for (const l of W.lots) { if (!l.name) continue; const k = W.did + ':' + l.name, at = S.helped[k]; if (!at || Date.now() - at > 7 * 864e5 || (S.thanked || {})[k] === H.shiftKey()) continue;
      if (Math.hypot(l.door[0] - P.x, l.door[1] - P.y) > 3) continue; S.thanked = S.thanked || {}; S.thanked[k] = H.shiftKey(); H.saveS();
      H.toast('💛 ' + rnd(['Hey, it\'s you! Thanks again for the help at ' + l.name + '.', 'The folks at ' + l.name + ' wave as you pass. They remember.', l.name + ' put a thank-you sign in the window for you.'])); buzz('tap'); break; } }

  // ================= comfort: text size, one-handed layout =================
  function applyComfort() { const r = document.documentElement; r.style.setProperty('--uiScale', S.cfg.uiScale || 1); document.body.classList.toggle('uiBig', (S.cfg.uiScale || 1) > 1); document.body.classList.toggle('oneHand', !!S.cfg.oneHand); }
  applyComfort();
  function comfortRows() {
    return '<label>Interface text size<div class="seg">' + [[1, 'Normal'], [1.12, 'Large'], [1.25, 'Largest']].map(([k, t]) => '<button type="button" data-ui="' + k + '" class="' + ((S.cfg.uiScale || 1) === k ? 'on' : '') + '">' + t + '</button>').join('') + '</div></label>' +
      '<label>Controls<div class="seg">' + [[0, 'Standard'], [1, 'One-handed']].map(([k, t]) => '<button type="button" data-oh="' + k + '" class="' + ((S.cfg.oneHand ? 1 : 0) === k ? 'on' : '') + '">' + t + '</button>').join('') + '</div></label>' +
      '<label>Vibration<div class="seg">' + [[1, 'On'], [0, 'Off']].map(([k, t]) => '<button type="button" data-hp="' + k + '" class="' + ((S.cfg.haptics === false ? 0 : 1) === k ? 'on' : '') + '">' + t + '</button>').join('') + '</div></label>' +
      '<label>Call openings<div class="seg">' + [[1, 'Cinematic'], [0, 'Off']].map(([k, t]) => '<button type="button" data-cc="' + k + '" class="' + ((S.cfg.callCine === false ? 0 : 1) === k ? 'on' : '') + '">' + t + '</button>').join('') + '</div></label>' +
      '<label>Subject voices<div class="seg">' + [[1, 'On'], [0, 'Off']].map(([k, t]) => '<button type="button" data-sv="' + k + '" class="' + ((S.cfg.voices === false ? 0 : 1) === k ? 'on' : '') + '">' + t + '</button>').join('') + '</div></label>';
  }
  function bindComfort(root, redraw) {
    root.querySelectorAll('[data-ui]').forEach((b) => b.onclick = () => { S.cfg.uiScale = +b.dataset.ui; applyComfort(); H.saveS(); redraw(); });
    root.querySelectorAll('[data-oh]').forEach((b) => b.onclick = () => { S.cfg.oneHand = b.dataset.oh === '1'; applyComfort(); H.saveS(); redraw(); });
    root.querySelectorAll('[data-hp]').forEach((b) => b.onclick = () => { S.cfg.haptics = b.dataset.hp === '1'; if (S.cfg.haptics) buzz('ok'); H.saveS(); redraw(); });
    root.querySelectorAll('[data-cc]').forEach((b) => b.onclick = () => { S.cfg.callCine = b.dataset.cc === '1'; H.saveS(); redraw(); });
    root.querySelectorAll('[data-sv]').forEach((b) => b.onclick = () => { S.cfg.voices = b.dataset.sv === '1'; H.saveS(); redraw(); });
  }

  return { buzz, callIntro, get introOn() { return !!intro; }, sessLines, onCall, onLore, needsReport, report, seedThread, threadCall, threadLines, threadDone, helped, drawSigns, memoryBarks, comfortRows, bindComfort, applyComfort };
}
