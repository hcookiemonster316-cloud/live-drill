// The epic layer: studio splash, opening cinematic, sky and weather extras, camera polish, background radio traffic,
// chapter endings, the Ledger mystery board, the rival, graduation and credits, district reputation, crime-scene
// investigations, report writing, secret trophies, squad nights, category leaderboards, loading art, display options.
import { ENDING_FLAGS, ENDINGS, REFLECT, CLUES, SCENES, REPORT, CHATTER, WX_CALLS, TIPS2 } from './epicdata.js';

export function installEpic(H) {
  const S = H.S, esc = H.esc, rnd = (a) => a[Math.floor(Math.random() * a.length)];
  S.clues = S.clues || {}; S.endings = S.endings || {}; S.repSeen = S.repSeen || {};
  let busy = false;

  // ================= 19. studio splash =================
  function splash(done) {
    let skip = false; try { if (sessionStorage.getItem('pcSplash')) skip = true; sessionStorage.setItem('pcSplash', '1'); } catch (e) {}
    if (skip || /[?&](mock|nosplash)\b/.test(location.search)) { done && done(); return; }
    const el = document.createElement('div'); el.className = 'splash';
    el.innerHTML = '<div class="spA"><svg viewBox="0 0 120 120" class="spBadge"><defs><linearGradient id="spg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#c98a00"/></linearGradient></defs><path d="M60 6 L104 22 L100 66 C96 90 80 106 60 114 C40 106 24 90 20 66 L16 22 Z" fill="none" stroke="url(#spg)" stroke-width="4"/><path d="M60 30 l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="url(#spg)"/></svg><h1>PORT MERIDIAN</h1><h2>STUDIOS</h2></div>' +
      '<div class="spB"><small>MADE FOR</small><h3>FBRTP Cadets</h3><p>Every fact in this city comes from the Florida Basic Recruit Training Program. Learn it on the street.</p></div>';
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    if (H.S.sound) setTimeout(() => H.sting('card'), 300);
    let t1 = setTimeout(() => el.classList.add('two'), 2600), t2 = setTimeout(close, 5200), gone = false;
    function close() { if (gone) return; gone = true; clearTimeout(t1); clearTimeout(t2); el.classList.add('out'); setTimeout(() => { el.remove(); done && done(); }, 600); }
    el.onclick = close;
  }

  // ================= 1. opening cinematic =================
  let cine = null;
  function intro() {
    const W = H.W; if (!W || W.did !== 0) { S.seenCine = 1; return; }
    const names = ['Bayfront Tower', 'Night Owl Diner', 'Founders Park', 'Central Library'], pts = names.map((n) => W.lots.find((l) => (l.name || '').indexOf(n) >= 0)).filter(Boolean).map((l) => H.iso(l.door[0], l.door[1]));
    const P = H.P, pz = H.iso(P.x, P.y); pts.push(pz); if (pts.length < 3) { S.seenCine = 1; return; }
    busy = true; H.pause(true); const cam = H.cam, z0 = cam.z; cam.free = true;
    const el = document.createElement('div'); el.className = 'introCine'; el.innerHTML = '<div class="tcBar t"></div><div class="tcBar b"></div><div class="icRadio"></div><div class="icTitle"><small>PORT MERIDIAN, FLORIDA · 0600 HOURS</small><h1>PATROL CITY</h1><p>Every call is a lesson.</p></div><button type="button" class="icSkip">Skip ▸</button>';
    document.body.appendChild(el); document.body.classList.add('introOn'); requestAnimationFrame(() => el.classList.add('on'));
    const radio = el.querySelector('.icRadio'), lines = [['Dispatch', 'Good morning, Port Meridian. All units, day shift is on the air.'], ['2-Baker-14', 'Baker-14, ten-eight. Coffee in hand.'], ['Dispatch', 'Copy. Be advised, we have a new cadet on the street today.'], ['Sgt. Castillo', 'That one\'s mine. Go easy on them, Velvet.'], ['Dispatch', 'I always do, Sergeant. Welcome to Port Meridian, cadet.']];
    lines.forEach((l, k) => setTimeout(() => { if (!cine) return; radio.innerHTML = '<div><b>' + esc(l[0]) + ':</b> ' + esc(l[1]) + '</div>'; radio.classList.remove('in'); void radio.offsetWidth; radio.classList.add('in'); H.chirp(); }, 1600 + k * 4200));
    cine = { t: 0, dur: 24, pts, z0, el }; H.setMood('title');
    const end = () => { if (!cine) return; const c = cine; cine = null; S.seenCine = 1; H.saveS(); c.el.classList.add('out'); cam.free = false; H.setMood(null); setTimeout(() => { c.el.remove(); document.body.classList.remove('introOn'); busy = false; H.pause(false); }, 700); };
    el.querySelector('.icSkip').onclick = (e) => { e.stopPropagation(); end(); }; cine.end = end;
  }
  function cineTick(dt) {
    if (!cine) return; cine.t += dt; const c = cine, u = Math.min(1, c.t / c.dur), seg = u * (c.pts.length - 1), i = Math.min(c.pts.length - 2, Math.floor(seg)), f = seg - i, e = f * f * (3 - 2 * f);
    const a = c.pts[i], b = c.pts[i + 1]; H.cam.x = a[0] + (b[0] - a[0]) * e; H.cam.y = a[1] - 30 + (b[1] - a[1]) * e; H.cam.z = c.z0 * (u < .85 ? .62 + u * .2 : .79 + (u - .85) / .15 * (1 - .79));
    if (u > .82 && !c.title) { c.title = 1; c.el.classList.add('title'); H.sting('card'); } if (u >= 1 && !c.done) { c.done = 1; setTimeout(() => c.end && c.end(), 2200); }
  }

  // ================= 3. sky: moon, stars; 2. weather: heat haze and wind debris =================
  const moonPhase = () => { const syn = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14) / 864e5; return (((Date.now() / 864e5 - ref) % syn) + syn) % syn / syn; };
  const fullMoon = () => { const p = moonPhase(); return p > .46 && p < .54; };
  const debris = [];
  function skyDraw(ctx, cv, now) {
    if (H.inside || H.S.cfg.quality === 'low') return; const h = H.hour(), night = h >= 19.5 || h < 5.5, dpr = cv.width / cv.clientWidth || 1;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (night && !H.wx().rain && !H.wx().fog) {
      const a = Math.min(1, h >= 19.5 ? (h - 19.5) / 1.5 : (5.5 - h) / 1.5), W = cv.width;
      for (let i = 0; i < 26; i++) { const x = ((i * 9301 + 49297) % 233280) / 233280 * W, y = ((i * 4021 + 977) % 1000) / 1000 * cv.height * .16 + 6 * dpr, tw = .4 + .6 * Math.abs(Math.sin(now / 900 + i)); ctx.fillStyle = 'rgba(255,255,240,' + (a * tw * .55) + ')'; ctx.fillRect(x, y, 1.4 * dpr, 1.4 * dpr); }
      const mx = W - 64 * dpr, my = 92 * dpr, r = 15 * dpr, ph = moonPhase();
      const g = ctx.createRadialGradient(mx, my, r * .6, mx, my, r * 4.5); g.addColorStop(0, 'rgba(230,236,255,' + (.22 * a) + ')'); g.addColorStop(1, 'rgba(230,236,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, r * 4.5, 0, 7); ctx.fill();
      ctx.globalAlpha = a; ctx.fillStyle = '#eef1f8'; ctx.beginPath(); ctx.arc(mx, my, r, 0, 7); ctx.fill();
      // the shadow side: a disc offset by the phase gives the crescent or gibbous shape
      const k = Math.cos(ph * 2 * Math.PI); ctx.fillStyle = 'rgba(12,18,34,.92)'; ctx.beginPath(); if (ph < .5) { ctx.arc(mx, my, r, Math.PI / 2, -Math.PI / 2, false); ctx.ellipse(mx, my, Math.abs(k) * r, r, 0, -Math.PI / 2, Math.PI / 2, k < 0); } else { ctx.arc(mx, my, r, -Math.PI / 2, Math.PI / 2, false); ctx.ellipse(mx, my, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k < 0); } ctx.fill();
      ctx.fillStyle = 'rgba(180,186,200,.35)'; [[-.3, -.2, .22], [.25, .15, .16], [-.05, .4, .12]].forEach(([u, v, s]) => { ctx.beginPath(); ctx.arc(mx + u * r, my + v * r, s * r, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
    }
    const wx = H.wx(), hot = /Hot/.test(wx.label || '') && h >= 11 && h < 17 && !wx.rain;
    if (hot && H.S.cfg.motion !== false) { const W = cv.width, Hh = cv.height; ctx.fillStyle = 'rgba(255,190,110,.06)'; ctx.fillRect(0, 0, W, Hh); ctx.strokeStyle = 'rgba(255,235,200,.07)'; ctx.lineWidth = 2 * dpr; for (let i = 0; i < 9; i++) { const y = Hh * (.25 + i * .08) + Math.sin(now / 700 + i) * 6 * dpr; ctx.beginPath(); for (let x = 0; x <= W; x += 24 * dpr) ctx.lineTo(x, y + Math.sin(x / (40 * dpr) + now / 260 + i) * 3 * dpr); ctx.stroke(); } }
    if ((wx.storm || wx.wind > .5) && H.S.cfg.motion !== false) {
      if (debris.length < (wx.storm ? 26 : 12) && Math.random() < .5) debris.push({ x: -.05, y: Math.random(), vx: .18 + Math.random() * .25, vy: (Math.random() - .5) * .06, r: Math.random() * 6, s: Math.random() < .7 ? 'leaf' : 'paper', c: rnd(['#7c9a3a', '#a16207', '#4d7c0f', '#d6d3d1']) });
      debris.forEach((d) => { d.x += d.vx / 60; d.y += d.vy / 60 + Math.sin(now / 300 + d.r) * .0008; d.r += .15; const x = d.x * cv.width, y = d.y * cv.height; ctx.save(); ctx.translate(x, y); ctx.rotate(d.r); ctx.fillStyle = d.c; if (d.s === 'leaf') { ctx.beginPath(); ctx.ellipse(0, 0, 4 * dpr, 2 * dpr, 0, 0, 7); ctx.fill(); } else ctx.fillRect(-3 * dpr, -4 * dpr, 6 * dpr, 8 * dpr); ctx.restore(); });
      for (let i = debris.length - 1; i >= 0; i--) if (debris[i].x > 1.05) debris.splice(i, 1);
    } else debris.length = 0;
    ctx.restore();
  }
  function wxCall() { const wx = H.wx(), h = H.hour(); if (Math.random() > .3) return null; const k = wx.storm ? 'storm' : wx.fog ? 'fog' : wx.rain ? 'rain' : wx.cold ? 'cold' : /Hot/.test(wx.label || '') && h >= 10 && h < 18 ? 'heat' : null; return k ? rnd(WX_CALLS[k]) : null; }
  function wxBark() { const wx = H.wx(), h = H.hour(); if (wx.storm) return rnd(['Stay dry, officer!', 'Hold onto your hat!', 'You\'re out in this?']); if (wx.rain) return rnd(['Some weather, huh?', 'Stay dry out there.']); if (wx.cold) return rnd(['Brr. Stay warm, officer.', 'Cold one today.']); if (/Hot/.test(wx.label || '') && h >= 11 && h < 17) return rnd(['Hot one! Drink some water.', 'It\'s an oven out here.', 'Stay cool, officer.']); if (wx.fog) return rnd(['Can\'t see a thing in this fog.', 'Careful driving in this.']); return null; }

  // ================= 4. camera polish =================
  let idle = 0, slow = 0, punch = 0, flash = 0;
  function camTick(dt) {
    if (punch > 0) { punch -= dt; const k = Math.max(0, punch / .9); H.cam.zMul = 1 + .08 * Math.sin(k * Math.PI); if (punch <= 0) H.cam.zMul = 1; }
    if (cine || H.cam.free || H.inside) { idle = 0; return; } const P = H.P; if (P.path && P.path.length) { idle = 0; return; } idle += dt;
    if (idle > 4 && H.S.cfg.motion !== false) { const t = performance.now() / 1000; H.cam.x += Math.sin(t * .35) * .06; H.cam.y += Math.cos(t * .27) * .04; }
  }
  const timeScale = () => (slow > 0 ? .35 : 1);
  function slowMo(sec) { if (H.S.cfg.motion === false) return; slow = sec; flash = 1; }
  function zoomPunch() { if (H.S.cfg.motion === false || punch > 0) return; punch = .9; }
  function fxDraw(ctx, cv) { if (slow > 0) { slow -= 1 / 60; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createRadialGradient(cv.width / 2, cv.height / 2, cv.height * .3, cv.width / 2, cv.height / 2, cv.height * .8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,20,40,.35)'); ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height); ctx.restore(); }
    if (flash > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(255,240,200,' + flash * .22 + ')'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.restore(); flash -= .05; } }

  // ================= 5. background radio traffic =================
  let chatT = 30, chatQ = [];
  function chatter(dt) {
    if (H.cine() || H.S.offDuty || !H.W) return; chatT -= dt; if (chatT > 0) return; chatT = 45 + Math.random() * 60;
    if (!chatQ.length) { const k = Math.floor(Math.random() * CHATTER.length); chatQ = [CHATTER[k]]; if (CHATTER[k + 1] && /^(Copy|Code 4|I\'ll|Engine 3|Return)/.test(CHATTER[k + 1][1]) || (CHATTER[k + 1] && CHATTER[k + 1][0] === 'Engine 3')) chatQ.push(CHATTER[k + 1]); }
    const [who, msg] = chatQ.shift(), lots = H.W.lots.filter((l) => l.name), place = lots.length ? rnd(lots).name : 'Main St', street = rnd(['Main St', 'Bay St', 'Oak Ave', 'Pine St', 'Harbor Rd']);
    H.radio(who + (H.inside ? ' (muffled)' : ''), msg.replace('{place}', place).replace('{street}', street)); if (H.S.sound && (H.S.cfg.vRadio == null || H.S.cfg.vRadio > 0)) H.chirp(who); if (chatQ.length) chatT = 4 + Math.random() * 3;
  }

  // ================= 6. chapter endings =================
  function ending(c, done) {
    const d = c.d, F = ENDING_FLAGS[d], fl = H.S.flags || {}, good = F.good.filter((f) => fl[f]).length, bad = F.bad.filter((f) => fl[f]).length, tr = (H.S.trust || {})[d] == null ? 50 : H.S.trust[d], E = ENDINGS[d];
    const pick = { k: 'B' }, kOf = (r) => { const v = r.v === 'own' ? (bad ? 1 : 0) : r.v, sc = good - bad + v + (tr >= 60 ? 1 : tr < 35 ? -1 : 0); return sc >= 2 ? 'A' : sc >= 0 ? 'B' : 'C'; };
    const opts = REFLECT.map((r) => { const k = kOf(r), [name, lines] = E[k]; return { t: r.t, fx: () => { pick.k = k; }, reply: [['castillo', r.reply], ['narr', '— ' + name + ' —']].concat(lines) }; });
    const narr = E.q.split('"')[0].trim(), quote = (E.q.match(/"([^"]+)"/) || [0, 'So. How did today go, cadet?'])[1];
    H.dialogue((narr ? [['narr', narr]] : []).concat([['castillo', quote], ['choice', opts, 'One last thought before the chapter closes.']]), () => {
      const [name] = E[pick.k]; S.endings[d] = S.endings[d] || {}; S.endings[d][pick.k] = 1; H.saveS(); H.stat('ending'); if (pick.k === 'A') H.stat('endingA');
      H.banner('🎬', 'Ending: ' + name, 'Chapter ' + (d + 1) + ' · ' + Object.keys(S.endings[d]).length + ' of 3 endings seen'); done && done();
    }, { kicker: 'CHAPTER ' + (d + 1) + ' · EPILOGUE', voiced: true, noSkip: false });
  }

  // ================= 7. the Ledger: clues and the mystery board =================
  let clT = 2;
  function clueTick(dt) {
    clT -= dt; if (clT > 0 || H.inside || !H.W || busy || !H.ready()) return; clT = 1; const P = H.P, d = H.W.did;
    CLUES.forEach(([id, cd, place, text]) => { if (cd !== d || S.clues[id]) return; const l = H.W.lots.find((x) => (x.name || '').indexOf(place) >= 0); if (!l) return; if (Math.hypot(l.door[0] - P.x, l.door[1] - P.y) > 3) return;
      S.clues[id] = Date.now(); H.saveS(); H.stat('clue'); H.sting('set'); const n = CLUES.filter((c) => c[1] === d && S.clues[c[0]]).length;
      H.openModal('<div class="clueCard"><span>📜</span><small>THE LEDGER · CLUE ' + Object.keys(S.clues).length + ' OF ' + CLUES.length + '</small><h2>A torn ledger page</h2><p>' + esc(text) + '</p><em>' + (n >= 3 ? 'That\'s all three pages in ' + esc(H.dname(d)) + '. Someone at the Central Library has been asking about these.' : n + ' of 3 pages found in ' + esc(H.dname(d)) + '.') + '</em></div><div class="qAct"><button type="button" class="ghost" id="clBoard">Mystery board</button><button type="button" id="mClose">Keep patrolling</button></div>');
      H.$('mClose').onclick = H.closeModal; H.$('clBoard').onclick = board; });
  }
  function clueDraw(now) { if (H.inside || !H.W) return; const d = H.W.did, P = H.P;
    CLUES.forEach(([id, cd, place]) => { if (cd !== d || S.clues[id]) return; const l = H.W.lots.find((x) => (x.name || '').indexOf(place) >= 0); if (!l || Math.hypot(l.door[0] - P.x, l.door[1] - P.y) > 9) return; const [sx, sy] = H.iso(l.door[0], l.door[1]); H.sparkle(sx, sy - 14, now, '#fde68a'); }); }
  function board() {
    const got = Object.keys(S.clues).length;
    H.openModal('<div class="sceneHead"><b>THE LEDGER · MYSTERY BOARD</b><h2>' + got + ' of ' + CLUES.length + ' pages found</h2><p>In 1987, two million dollars in hurricane relief money vanished. Torn pages from the city\'s ledger are hidden around Port Meridian. Read the riddles, go exploring, and look for a glint near a door.</p></div>' +
      '<div class="mbGrid">' + [0, 1, 2, 3, 4].map((d) => '<div class="mbCol"><b>' + esc(H.dname(d)) + '</b>' + CLUES.filter((c) => c[1] === d).map((c) => S.clues[c[0]] ? '<div class="mbPin got"><i>📜</i><p>' + esc(c[3]) + '</p><small>' + esc(c[2]) + '</small></div>' : '<div class="mbPin"><i>❔</i><p>“' + esc(c[4]) + '”</p></div>').join('') + '</div>').join('') + '</div>' +
      '<div class="qAct"><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal; H.stat('board');
  }

  // ================= 8. the rival =================
  const rivalRP = () => { const w = H.week(), day = Math.floor(Date.now() / 864e5), k = .82 + ((day * 9301 + 49297) % 233280) / 233280 * .36; return Math.round(Math.max(120, w.rp * k + 40 * (new Date().getDay() || 7))); };
  function rivalPanel() {
    const w = H.week(), me = Math.round(w.rp), him = rivalRP(), parts = ['vance1', 'vance2', 'vance3', 'vance4', 'vance5'].filter((id) => (H.S.side || {})[id] != null && H.S.side[id] >= 1).length, ahead = me >= him;
    H.openModal('<div class="sceneHead"><b>RIVAL</b><h2>🎖️ Cadet Devin Vance</h2><p>First in the class most weeks. Competitive, proud, and carrying more than he lets on. ' + (parts >= 4 ? 'These days he\'s your partner more than your rival.' : 'Beat him this week and see what he says.') + '</p></div>' +
      '<div class="rvVs"><div class="' + (ahead ? 'win' : '') + '"><small>You</small><b>' + me + '</b><i>RP this week</i></div><span>VS</span><div class="' + (ahead ? '' : 'win') + '"><small>Vance</small><b>' + him + '</b><i>RP this week</i></div></div>' +
      '<p class="lkSum" style="text-align:center">' + (ahead ? 'You\'re ahead this week. Vance has noticed.' : 'Vance is ahead by ' + (him - me) + ' RP. Close a few calls.') + '</p><div class="cfBar"><i style="width:' + parts * 20 + '%"></i><span>Rival story · ' + parts + ' of 5</span></div>' +
      '<div class="qAct"><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal;
  }
  function rivalCameo() { if (Math.random() > .15 || !(H.S.side || {}).vance1) return null; return ['vance', rnd(['(over the radio) Vance here. I was two blocks away. You got here first. Don\'t let it go to your head.', '(over the radio) Vance, rolling by. Need cover? No? Fine. Show-off.', '(over the radio) That\'s another one for you. I\'m keeping count, you know.'])]; }

  // ================= 9. graduation and credits =================
  function graduation() {
    S.graduated = S.graduated || Date.now(); H.saveS(); H.stat('graduated');
    const friends = H.NPCS.filter((n) => (H.S.npc || {})[n.id] >= 3).slice(0, 6).map((n) => n.name), vance = ((H.S.side || {}).vance5 || 0) >= 1;
    H.setMood('debrief');
    H.dialogue([['narr', 'Graduation day. Justice Plaza is full of folding chairs, families, and one very interested cat.'], ['okonkwo', 'Cadets. Today you stop being cadets. Port Meridian trusted you with its streets for a whole academy. Now it trusts you with them for real.']]
      .concat(vance ? [['vance', 'Next to me. Not behind me, not in front. Like I said.']] : [])
      .concat(friends.length ? [['narr', 'In the crowd: ' + friends.join(', ') + '. Somebody is holding a sign with your call sign on it.']] : [])
      .concat([['castillo', 'Twenty-two years, and I keep a list of every cadet who called me "ma\'am" on day one. You\'re on it. You\'re also on the other list. The short one.'], ['narr', 'Sgt. Castillo pins the badge on your chest. Her hands are steady. Her voice, for once, is not.'], ['castillo', 'Officer ' + H.S.cs + '. Go keep them safe.']]), () => credits(), { kicker: 'GRADUATION · FLORIDA BASIC RECRUIT TRAINING', voiced: true });
  }
  function credits() {
    H.setMood('title'); const st = H.S.stats || {}, cast = ['Sgt. Dana Castillo', 'Lt. Okonkwo', 'Velvet (Dispatch)', 'Officer Pike', 'Det. Navarro', 'Lena Marsh', 'Cadet Devin Vance'];
    const nums = [['Calls cleared', H.S.calls || st.calls || 0], ['S-rank calls', st.callS || 0], ['Friends made', Object.keys(H.S.npc || {}).filter((k) => H.S.npc[k] >= 3).length], ['Field journal pages', Object.keys(H.S.lore || {}).length], ['Ledger pages', Object.keys(S.clues).length + ' / ' + CLUES.length], ['Endings seen', Object.values(S.endings).reduce((a, e) => a + Object.keys(e).length, 0) + ' / 15']];
    const el = document.createElement('div'); el.className = 'gradCred';
    el.innerHTML = '<div class="gcRoll"><h1>PATROL CITY</h1><p class="gcSub">' + esc(H.studio || 'Meridian Forge') + '</p><h3>Your watch</h3>' + nums.map((n) => '<div class="gcRow"><span>' + esc(n[0]) + '</span><b>' + esc(String(n[1])) + '</b></div>').join('') +
      '<h3>Starring</h3><p class="gcBig">' + esc(H.S.cs) + '</p><h3>With</h3>' + cast.map((c) => '<p>' + esc(c) + '</p>').join('') + '<h3>And the people of Port Meridian</h3><p class="gcSmall">' + H.NPCS.map((n) => esc(n.name)).join(' · ') + '</p>' +
      '<h3>Made for</h3><p>Florida Basic Recruit Training Program cadets</p><h3>Special thanks</h3><p>Exhibit A, for her patience</p><p class="gcEnd">Thank you for keeping Port Meridian safe.</p></div><button type="button" class="icSkip">Close ▸</button>';
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on')); H.pause(true); busy = true;
    const close = () => { el.classList.add('out'); setTimeout(() => { el.remove(); H.pause(false); busy = false; H.setMood(null); H.banner('🎓', 'Graduated', 'Officer ' + H.S.cs + '. Port Meridian is yours to keep patrolling.'); }, 700); };
    el.querySelector('.icSkip').onclick = close; setTimeout(close, 52000);
  }

  // ================= 10. district reputation =================
  const RANKS = [[0, 'Stranger', '#94a3b8'], [20, 'Familiar', '#38bdf8'], [40, 'Known', '#22c55e'], [60, 'Trusted', '#f5b800'], [80, 'Hometown Hero', '#f43f5e']];
  const repOf = (d) => { const t = (H.S.trust || {})[d] == null ? 50 : H.S.trust[d]; let r = RANKS[0]; RANKS.forEach((x) => { if (t >= x[0]) r = x; }); return { t, name: r[1], col: r[2], idx: RANKS.indexOf(r) }; };
  let repT = 3, tipT = 90;
  function repTick(dt) {
    repT -= dt; if (repT > 0 || !H.W || busy) return; repT = 3; const d = H.W.did, r = repOf(d), prev = S.repSeen[d] == null ? r.idx : S.repSeen[d];
    if (r.idx > prev && !H.cine()) { S.repSeen[d] = r.idx; H.saveS(); H.sting('set'); H.banner('🏙️', H.dname(d) + ': ' + r.name, ['', '', 'Locals will radio you tips about hidden places.', 'Calls here pay 10% more RP.', 'Hometown Hero! The district is throwing you a celebration.'][r.idx]); if (r.idx === 4) setTimeout(() => hero(d), 4000); }
    else if (S.repSeen[d] == null) { S.repSeen[d] = r.idx; H.saveS(); }
    if (r.idx >= 2) { tipT -= 3; if (tipT <= 0 && !H.cine() && !H.inside && H.ready()) { tipT = 150 + Math.random() * 120; tip(d); } }
  }
  function tip(d) {
    const W = H.W, P = H.P, unseen = W.lots.filter((l) => l.name && !H.S.lore['v_' + l.name.replace(/\W+/g, '').toLowerCase()] && H.loreAt(l.name) && !H.S.lore[H.loreAt(l.name)]), clue = CLUES.find((c) => c[1] === d && !S.clues[c[0]]);
    const friend = H.NPCS.filter((n) => n.d === d && (H.S.npc || {})[n.id] >= 2); const who = friend.length ? rnd(friend).name : 'A local';
    if (clue && Math.random() < .5) H.radio(who, 'Hey, officer. Somebody found an old piece of paper near ' + clue[2] + '. Thought you\'d want to know.');
    else if (unseen.length) { const l = unseen.sort((a, b) => Math.hypot(a.door[0] - P.x, a.door[1] - P.y) - Math.hypot(b.door[0] - P.x, b.door[1] - P.y))[0]; H.radio(who, 'You ever been to ' + l.name + '? There\'s a story there. Ask around.'); }
  }
  function hero(d) {
    const T = ['Hometown Hero: Central', 'Hometown Hero: Eastside', 'Hometown Hero: Riverside', 'Hometown Hero: Industrial Park', 'Hometown Hero: Justice Row'][d], SK = { stripe: ['#f5b800', '#ef4444', '#14b8a6', '#f97316', '#8b5cf6'][d], text: 'HOMETOWN HERO' };
    const friends = H.NPCS.filter((n) => n.d === d && (H.S.npc || {})[n.id] >= 1).slice(0, 4);
    H.dialogue([['narr', 'Someone has hung a banner across the street. It has your call sign on it. It is spelled correctly, mostly.']].concat(friends.map((n) => [n.id, rnd(['You did this. You came back every day.', 'The whole block chipped in for the banner. I bought the tape.', 'We feel safe here again. That\'s you.', 'Don\'t you dare get transferred.'])])).concat([['castillo', '(over the radio) A whole district, cadet. Most officers never get one. Enjoy it. Then get back to work.']]), () => {
      H.S.titles = H.S.titles || {}; H.S.titles[T] = 1; H.S.carSkins = H.S.carSkins || {}; H.S.carSkins['hero' + d] = SK; H.saveS(); H.stat('hero'); H.award(300, 'Hometown Hero'); H.banner('🏆', T, 'Title and HOMETOWN HERO car skin unlocked.'); }, { kicker: 'HOMETOWN HERO · ' + H.dname(d).toUpperCase(), voiced: true });
  }
  const callMult = () => (H.W && repOf(H.W.did).idx >= 3 ? 1.1 : 1);

  // ================= 11 + 12. after a call: investigate the scene or write the report =================
  function afterCall(c, done) {
    const sc = SCENES.find((s) => s.kind.test(c.kind || 'street'));
    if (c.prio <= 2 && sc && Math.random() < .35) return investigate(sc, c, done);
    if (Math.random() < .3) return report(c, done);
    done([]);
  }
  function investigate(sc, c, done) {
    let found = 0, wrong = 0; const real = sc.items.filter((x) => x[2]).length, hl = H.hasSkill('inv1');
    const draw = () => H.openModal('<div class="sceneHead"><b>PROCESS THE SCENE · ' + esc(sc.title.toUpperCase()) + '</b><h2>Find the evidence</h2><p>Tap what matters. Not everything at a scene is evidence. ' + found + ' of ' + real + ' found.</p></div>' +
      '<div class="invScene" style="--a:' + sc.bg[0] + ';--b:' + sc.bg[1] + '">' + sc.items.map((it, k) => '<button type="button" data-iv="' + k + '" class="' + (it.done ? (it[2] ? 'ok' : 'no') : '') + (hl && it[2] && !it.done ? ' hint' : '') + '" style="left:' + it[3] + '%;top:' + it[4] + '%"><span>' + it[0] + '</span>' + (it.done ? '<small>' + esc(it[1]) + '</small>' : '') + '</button>').join('') + '</div>' +
      '<div class="qAct"><button type="button" id="ivNext"' + (found < real ? ' disabled' : '') + '>Build the timeline</button></div>');
    sc.items.forEach((it) => { it.done = false; });
    const bind = () => { draw(); document.querySelectorAll('[data-iv]').forEach((b) => b.onclick = () => { const it = sc.items[+b.dataset.iv]; if (it.done) return; it.done = true; if (it[2]) { found++; H.beep(880, .08, 'triangle', .04); } else { wrong++; H.beep(220, .12, 'sawtooth', .03); } bind(); }); H.$('ivNext').onclick = () => timeline(); };
    const timeline = () => {
      const pool = sc.order.map((t, i) => ({ t, i })).sort(() => Math.random() - .5), picked = [];
      const tdraw = () => { H.openModal('<div class="sceneHead"><b>EVIDENCE BOARD</b><h2>What happened, in order?</h2><p>Tap the events from first to last.</p></div><div class="tlPicked">' + picked.map((p, k) => '<div><i>' + (k + 1) + '</i>' + esc(p.t) + '</div>').join('') + '</div><div class="tlPool">' + pool.filter((p) => picked.indexOf(p) < 0).map((p) => '<button type="button" data-tl="' + p.i + '">' + esc(p.t) + '</button>').join('') + '</div>' + (picked.length ? '<div class="qAct"><button type="button" class="ghost" id="tlUndo">Undo</button></div>' : ''));
        document.querySelectorAll('[data-tl]').forEach((b) => b.onclick = () => { picked.push(pool.find((p) => p.i === +b.dataset.tl)); if (picked.length === pool.length) finish(); else tdraw(); }); const u = H.$('tlUndo'); if (u) u.onclick = () => { picked.pop(); tdraw(); }; };
      const finish = () => { const right = picked.filter((p, k) => p.i === k).length, score = Math.max(0, Math.round(((found - wrong * .5) / real) * 6 + right / sc.order.length * 4)); H.stat('investigate'); if (right === sc.order.length && !wrong) H.stat('invPerfect');
        done([['🔎', 'Investigation', Math.min(10, score), 10, found + ' of ' + real + ' clues' + (wrong ? ', ' + wrong + ' red herring' + (wrong > 1 ? 's' : '') : '') + ' · timeline ' + right + '/' + sc.order.length]]); };
      tdraw();
    };
    bind();
  }
  function report(c, done) {
    const now = new Date(), fill = (s) => s.replace('{date}', now.toLocaleDateString()).replace('{time}', String(H.hour() | 0).padStart(2, '0') + String(Math.floor((H.hour() % 1) * 60)).padStart(2, '0') + ' hours').replace('{where}', c.where).replace('{title}', c.title.toLowerCase()).replace(/\{caller\}/g, 'caller');
    let k = 0, right = 0; const rounds = REPORT.map(([lbl, opts]) => ({ lbl, opts: opts.map((o, i) => ({ t: fill(o), ok: i === 0 })).sort(() => Math.random() - .5) })), lines = [];
    const draw = () => { const r = rounds[k];
      H.openModal('<div class="sceneHead"><b>INCIDENT REPORT · ' + esc(c.title.toUpperCase()) + '</b><h2>' + esc(r.lbl) + '</h2><p>Pick the clearest, most factual sentence. A sergeant, a prosecutor and a judge may all read this.</p></div>' +
        '<div class="rpPaper">' + lines.map((l) => '<p class="' + (l.ok ? '' : 'bad') + '">' + esc(l.t) + '</p>').join('') + '<p class="cur">▍</p></div><div class="dlgOpts rpOpts">' + r.opts.map((o, i) => '<button type="button" data-rp="' + i + '"><span class="ot">' + esc(o.t) + '</span></button>').join('') + '</div>');
      document.querySelectorAll('[data-rp]').forEach((b) => b.onclick = () => { const o = r.opts[+b.dataset.rp]; lines.push(o); if (o.ok) { right++; H.beep(880, .08, 'triangle', .04); } else { H.beep(220, .12, 'sawtooth', .03); H.toast('✏️ Sergeant\'s note: stick to facts. No opinions, no vague words.'); } k++; if (k < rounds.length) draw(); else { H.stat('report'); if (right === rounds.length) H.stat('reportPerfect'); done([['📝', 'Report', Math.round(right / rounds.length * 10), 10, right + ' of ' + rounds.length + ' sentences by the book']]); } }); };
    draw();
  }

  // ================= 14. secret trophies =================
  const DINERS = ['v_grind', 'v_sunrise', 'v_pelican', 'v_rowboat', 'v_lunchpail', 'v_gavelgrill', 'v_objection', 'v_donut'];
  const SECRETS = [
    ['sNight', 'Night Owl', 'Patrol between 2 and 4 in the morning, real time.', 's', () => H.st('lateNight') >= 1],
    ['sEveryone', 'Everybody\'s Cadet', 'Meet every regular in Port Meridian.', 'g', () => H.NPCS.every((n) => (H.S.npc || {})[n.id] >= 1)],
    ['sDiner', 'Diner Crawl', 'Discover every diner and café in the city.', 's', () => DINERS.every((k) => H.S.lore[k])],
    ['sCat', 'The Cat Has Chosen', 'Become Exhibit A\'s best friend.', 'g', () => ((H.S.npc || {}).exhibita || 0) >= 6],
    ['sStorm', 'Rain or Shine', 'Clear a call during a tropical storm.', 's', () => H.st('stormCall') >= 1],
    ['sMoon', 'Full Moon Patrol', 'Be on patrol at night under a full moon.', 's', () => H.st('fullMoon') >= 1],
    ['sHotDog', 'Two Dollars Well Spent', 'Pay Delgado for the hot dog.', 'b', () => !!(H.S.flags || {}).paidDelgado],
    ['sLedger', 'Kept the Books Honest', 'Solve the Ledger mystery.', 'p', () => ((H.S.side || {}).ledger5 || 0) >= 2],
    ['sEndings', 'Every Path', 'See all three endings of a chapter.', 'g', () => Object.values(S.endings).some((e) => Object.keys(e).length >= 3)],
    ['sGrad', 'Officer', 'Graduate from the academy.', 'p', () => !!S.graduated]
  ].map((t) => t.concat(['secret']));
  let secT = 10;
  function secretTick(dt) { secT -= dt; if (secT > 0) return; secT = 20; const h = new Date().getHours(); if (h >= 2 && h < 4) H.statOnce('lateNight'); if (fullMoon() && (H.hour() >= 20 || H.hour() < 5) && !H.inside) H.statOnce('fullMoon'); }

  // ================= 15. squad nights =================
  const SQ_GOAL = 40, sqKey = () => { const d = new Date(); return 'sqn' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
  const isSquadNight = () => { const d = new Date(), h = d.getHours(); return (d.getDay() === 4 || d.getDay() === 6) && h >= 19 && h < 22; };
  let sqSum = 0, sqStop = null, sqOn = false;
  function squadTick() {
    const on = isSquadNight(), net = H.net(); if (on && !sqOn && net) { sqOn = true; try { sqStop = net.gon('mmo/ev/' + H.weekKey() + '/' + sqKey(), (v) => { sqSum = Object.values(v || {}).reduce((a, b) => a + (+b || 0), 0); if (sqSum >= SQ_GOAL && !S['sqDone' + sqKey()]) { S['sqDone' + sqKey()] = 1; H.saveS(); H.award(250, 'Squad Night goal'); H.stat('squadNight'); H.banner('🌙', 'Squad Night complete!', 'Every cadet on shift tonight cleared ' + SQ_GOAL + ' calls together.'); } }); } catch (e) {} H.banner('🌙', 'Squad Night is live', 'Everyone on shift, one goal: ' + SQ_GOAL + ' calls cleared together before 10 p.m.'); }
    if (!on && sqOn) { sqOn = false; if (sqStop) try { sqStop(); } catch (e) {} }
  }
  function squadCall() { if (!sqOn) return; const net = H.net(), k = 'sqMine' + sqKey(); S[k] = (S[k] || 0) + 1; H.saveS(); if (net) try { net.gset('mmo/ev/' + H.weekKey() + '/' + sqKey() + '/' + net.uid, Math.min(1000, S[k])); } catch (e) {} }
  const squadHud = () => (sqOn ? '🌙 Squad Night ' + Math.min(sqSum, SQ_GOAL) + '/' + SQ_GOAL : '');

  // ================= 16. category leaderboards =================
  const CATS = [['s', '⭐', 'S-rank calls', () => H.st('callS')], ['lore', '📖', 'Lore found', () => Object.keys(H.S.lore || {}).length], ['fr', '💛', 'Friends', () => Object.keys(H.S.npc || {}).filter((k) => H.S.npc[k] >= 3).length], ['clue', '📜', 'Ledger pages', () => Object.keys(S.clues).length], ['inv', '🔎', 'Scenes processed', () => H.st('investigate')]];
  let lbT = 30;
  function lbPush(dt) { lbT -= dt; if (lbT > 0) return; lbT = 120; const net = H.net(); if (!net) return; const wk = H.weekKey(); CATS.forEach(([k, , , f]) => { try { net.gset('mmo/ev/' + wk + '/lb_' + k + '/' + net.uid, Math.min(1000, f() || 0)); } catch (e) {} }); }
  async function boards(cat) {
    cat = cat || 's'; const net = H.net(), wk = H.weekKey(), C = CATS.find((c) => c[0] === cat); let rows = [], names = {};
    if (net) { try { lbT = 0; lbPush(0); const v = await net.gget('mmo/ev/' + wk + '/lb_' + cat), lb = await net.gget('mmo/lb/' + wk); names = Object.fromEntries(Object.entries(lb || {}).map(([k, x]) => [k, x.c])); rows = Object.entries(v || {}).map(([k, n]) => ({ id: k, c: names[k] || (k === net.uid ? H.S.cs : 'Cadet'), n: +n || 0 })); } catch (e) {} }
    const me = net ? net.uid : 'me'; if (!rows.some((r) => r.id === me)) rows.push({ id: me, c: H.S.cs, n: C[3]() || 0 }); rows.sort((a, b) => b.n - a.n); const top = rows.slice(0, 3);
    H.openModal('<div class="sceneHead"><b>LEADERBOARDS · THIS WEEK</b><h2>' + C[1] + ' ' + esc(C[2]) + '</h2><p>Resets every Monday.</p></div><div class="lkTabs">' + CATS.map((c) => '<button type="button" data-lc="' + c[0] + '" class="' + (c[0] === cat ? 'on' : '') + '">' + c[1] + ' ' + esc(c[2]) + '</button>').join('') + '</div>' +
      '<div class="podium">' + [1, 0, 2].map((i) => top[i] ? '<div class="pd p' + (i + 1) + (top[i].id === me ? ' me' : '') + '"><b>' + esc(top[i].c) + '</b><i>' + top[i].n + '</i><span>' + (i + 1) + '</span></div>' : '<div class="pd p' + (i + 1) + ' empty"><span>' + (i + 1) + '</span></div>').join('') + '</div>' +
      '<div class="mgList">' + rows.slice(0, 25).map((r, i) => '<div class="mgRow' + (r.id === me ? ' me' : '') + '"><i>' + (i + 1) + '</i><b>' + esc(r.c) + '</b><small></small><strong>' + r.n + '</strong></div>').join('') + '</div><div class="qAct"><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal; document.querySelectorAll('[data-lc]').forEach((b) => b.onclick = () => boards(b.dataset.lc));
  }

  // ================= 18. loading art =================
  const SKY = [['#f59e0b', '#1e3a8a', ['🏢', '🏛️', '🏬', '🗼', '🏢']], ['#ef4444', '#1f2937', ['🏠', '⛪', '🏪', '🥊', '🏠']], ['#14b8a6', '#0c4a6e', ['🌳', '🏟️', '🛶', '🏡', '🌿']], ['#f97316', '#292524', ['🏭', '🚂', '📦', '🏗️', '🚛']], ['#8b5cf6', '#1e1b4b', ['🏛️', '⚖️', '🗄️', '⛪', '🏢']]];
  function loadArt(d) { const [a, b, ic] = SKY[d]; return '<div class="ldSky" style="--a:' + a + ';--b:' + b + '"><div class="ldSun"></div><div class="ldLine">' + ic.map((x, k) => '<span style="--k:' + k + '">' + x + '</span>').join('') + '</div></div>'; }
  function loadLore(d) { const got = H.LORE.filter((e) => H.S.lore[e.id] && (e.when === 'd' + d || (e.when.slice(0, 6) === 'visit:' && H.loreDist(e.when.slice(6)) === H.dname(d)))); return got.length ? rnd(got) : null; }

  // ================= 20. display and audio options =================
  function applyDisplay() {
    const c = H.S.cfg, root = document.documentElement; root.style.setProperty('--safe-x', (c.safe || 0) + 'px'); root.style.setProperty('--subBg', c.subBg == null ? .97 : c.subBg);
    document.body.classList.toggle('subAlpha', c.subBg != null && c.subBg < .95); document.body.classList.toggle('sub-l', c.subSize === 'large'); document.body.classList.toggle('sub-xl', c.subSize === 'xl');
    const v = H.$('view'); if (v) { const cm = { deut: 'url(#cb-deut)', prot: 'url(#cb-prot)', trit: 'url(#cb-trit)', hc: 'contrast(1.25) saturate(1.2)' }[c.cmode] || ''; const br = c.bright && c.bright !== 1 ? 'brightness(' + c.bright + ')' : ''; v.style.filter = [cm, br].filter(Boolean).join(' '); }
  }
  function calibrate(back) {
    const el = H.fe(); el.hidden = false; el.className = 'fe menuBg'; const c = H.S.cfg; c.bright = c.bright || 1;
    const draw = () => { el.innerHTML = '<div class="feCard"><div class="feHead"><span>Options</span><h2>Display</h2></div><div class="calib"><div class="cbBox"><i style="background:#0b0b0b"></i><i style="background:#151515"></i><i style="background:#202020"></i></div><p>Adjust brightness until the middle square is barely visible and the left one is not.</p></div>' +
      '<div class="setGrid"><label>Brightness<input type="range" min=".7" max="1.4" step=".02" value="' + c.bright + '" data-x="bright"></label><label>Subtitle background<input type="range" min=".4" max="1" step=".05" value="' + (c.subBg == null ? .97 : c.subBg) + '" data-x="subBg"></label>' +
      '<label>Subtitle size<div class="seg">' + [['normal', 'Normal'], ['large', 'Large'], ['xl', 'Extra large']].map(([k, t]) => '<button type="button" data-ss="' + k + '" class="' + ((c.subSize || 'normal') === k ? 'on' : '') + '">' + t + '</button>').join('') + '</div></label>' +
      '<label>Voice volume<input type="range" min="0" max="1" step=".05" value="' + (c.vVoice == null ? 1 : c.vVoice) + '" data-x="vVoice"></label><label>Radio volume<input type="range" min="0" max="1" step=".05" value="' + (c.vRadio == null ? 1 : c.vRadio) + '" data-x="vRadio"></label>' +
      '<label>Screen edge padding (TVs and notched phones)<input type="range" min="0" max="48" step="2" value="' + (c.safe || 0) + '" data-x="safe"></label>' + (H.comfort ? H.comfort().comfortRows() : '') + '</div><div class="feBtns"><button type="button" class="feBtn ghost" id="dpReset">Reset</button><button type="button" class="feBtn" id="dpBack">Back</button></div></div>';
      el.querySelectorAll('[data-x]').forEach((r) => r.oninput = () => { c[r.dataset.x] = +r.value; applyDisplay(); H.saveS(); });
      el.querySelectorAll('[data-ss]').forEach((b) => b.onclick = () => { c.subSize = b.dataset.ss; applyDisplay(); H.saveS(); draw(); });
      if (H.comfort) H.comfort().bindComfort(el, draw);
      H.$('dpReset').onclick = () => { c.bright = 1; c.subBg = .97; c.subSize = 'normal'; c.vVoice = 1; c.vRadio = 1; c.safe = 0; applyDisplay(); H.saveS(); draw(); };
      H.$('dpBack').onclick = () => { back ? back() : (el.hidden = true); }; };
    draw();
  }

  // ================= per frame =================
  function tick(dt) { cineTick(dt); camTick(dt); chatter(dt); clueTick(dt); repTick(dt); secretTick(dt); lbPush(dt); }
  let sqT = 0;
  setInterval(() => { try { squadTick(); } catch (e) {} }, 30000); setTimeout(() => { try { squadTick(); } catch (e) {} }, 8000);
  applyDisplay();
  return { splash, intro, get busy() { return busy || !!cine; }, tick, skyDraw, fxDraw, clueDraw, wxCall, wxBark, timeScale, slowMo, zoomPunch, ending, board, rivalPanel, rivalCameo, graduation, credits, repOf, callMult, afterCall, SECRETS, boards, squadCall, squadHud, loadArt, loadLore, TIPS2, applyDisplay, calibrate, fullMoon, RANKS };
}
