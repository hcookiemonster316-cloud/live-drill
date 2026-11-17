// Patrol City polish layer: call debriefs, daily routines, street greetings, voiced scenes, chapter title cards and
// recaps, accessibility and controls (text size, colour modes, readable font, key remapping, gamepad), collectible
// case files and the Academy Season track. Everything here is cosmetic or presentational; no live fire anywhere.
import { ROUTINE4 } from './act2.js';
const slotOf = (h) => h < 6 ? 3 : h < 12 ? 0 : h < 18 ? 1 : 2;
export function installPolish(H) {
  const S = H.S, esc = H.esc;
  S.cfg = S.cfg || {}; if (S.cfg.voice == null) S.cfg.voice = 'story'; if (!S.cfg.tsize) S.cfg.tsize = 'normal'; if (!S.cfg.cmode) S.cfg.cmode = 'none'; if (!S.cfg.font) S.cfg.font = 'default';
  S.cards = S.cards || {}; S.caseSets = S.caseSets || {}; S.grades = S.grades || {}; S.titles = S.titles || {};
  const hash = (s) => [...String(s)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];

  // ================= 1. CALL DEBRIEF =================
  function grade(score) { return score >= 92 ? 'S' : score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 45 ? 'C' : 'D'; }
  const GCOL = { S: '#f5b800', A: '#22c55e', B: '#38bdf8', C: '#a78bfa', D: '#94a3b8' };
  function debrief(d, onDone) {
    const acc = d.n ? d.right / d.n : 1, rows = [
      ['🧠', 'By the book', Math.round(acc * 55), 55, d.right + ' of ' + d.n + ' right'],
      ['⏱️', 'Response', d.fast ? 15 : d.resp < 90 ? 8 : 3, 15, d.fast ? 'Fast response' : 'Arrived in ' + Math.max(1, Math.round(d.resp / 60 * 45 / 60)) + ' min (game time)'],
      d.approach === undefined ? null : ['🎯', 'Approach', d.approach === 'good' ? 10 : d.approach === 'ok' ? 5 : 0, 10, d.approach === 'good' ? 'Right approach for this call' : d.approach === 'ok' ? 'Workable approach' : 'Rethink your approach'],
      ['🤝', 'Community', (d.wrap === 'case' || d.wrap === 'resources' ? 10 : 3) + (d.calm ? 5 : 0), 15, d.wrap === 'case' ? 'Left a case number' : d.wrap === 'resources' ? 'Connected them with resources' : 'Cleared quickly' + (d.calm ? ' · kept it calm' : '')]
    ].filter(Boolean);
    (d.extra || []).forEach((r) => rows.push(r));
    if (d.coop) rows.push(['🛡️', 'Teamwork', 5, 5, 'Contact and cover with ' + d.coop]);
    const base = rows.filter((r) => r[1] !== 'Teamwork'), score = Math.min(100, Math.round(base.reduce((a, r) => a + r[2], 0) / base.reduce((a, r) => a + r[3], 0) * 100) + (d.coop ? 5 : 0)), g = grade(score), key = d.title, best = S.grades[key];
    const better = !best || 'DCBAS'.indexOf(g) > 'DCBAS'.indexOf(best); if (better) S.grades[key] = g; H.stat('callGrade' + g); if (g === 'S') H.stat('callS'); H.saveS();
    H.setMood('debrief'); H.sting(g === 'S' || g === 'A' ? 'gradeS' : 'grade');
    H.openModal('<div class="dbf"><div class="dbfHead"><small>' + esc(d.prio === 1 ? 'PRIORITY 1' : d.prio === 2 ? 'PRIORITY 2' : 'ROUTINE') + ' · CALL CLEARED</small><h2>' + esc(d.title) + '</h2><p>' + esc(d.where) + (d.role ? ' · ' + esc(d.role) : '') + '</p></div>' +
      '<div class="dbfGrade" style="--g:' + GCOL[g] + '"><b>' + g + '</b><span>' + score + '<i>/100</i></span>' + (better && best ? '<em>New best (was ' + best + ')</em>' : best && !better ? '<em>Best: ' + best + '</em>' : '<em>First time on this call</em>') + '</div>' +
      '<div class="dbfRows">' + rows.map((r, k) => '<div class="dbfRow" style="--d:' + (k * 120 + 300) + 'ms"><i>' + r[0] + '</i><div><b>' + r[1] + '<span>' + r[2] + '/' + r[3] + '</span></b><u><s style="--w:' + Math.round(r[2] / r[3] * 100) + '%"></s></u><small>' + esc(r[4]) + '</small></div></div>').join('') + '</div>' +
      ((d.qs || []).length ? '<div class="dbfQs"><b>What came up</b>' + d.qs.map((q) => '<div class="' + (q.ok ? 'ok' : 'no') + '"><i>' + (q.ok ? '✓' : '✗') + '</i><p>' + esc(q.stem) + (!q.ok && q.fact ? '<small>' + esc(q.fact) + '</small>' : '') + '</p></div>').join('') + '</div>' : '') +
      '<div class="dbfXp">+' + d.xp + ' RP' + (g === 'S' ? ' <b>+25 S-rank bonus</b>' : '') + '</div><div class="qAct"><button type="button" id="mDone">Back in service</button></div></div>');
    H.$('mDone').onclick = () => { H.setMood(null); if (g === 'S') H.award(25, 'S-rank call'); onDone && onDone(g); };
  }

  // ================= 2. DAILY ROUTINES =================
  // [day spot, evening spot]; null means their usual place. Day is 06:00 to 18:00.
  const ROUTINE = {
    dot: ['Palmetto Row', null], delgado: [null, 'Night Owl Diner'], pruitt: [null, 'Palmetto Row'], marcus: [null, 'Spokes & Spares'], okafor: [null, 'Harbor View Apartments'], kevin: [null, 'Slice of Justice'], walt: [null, 'Night Owl Diner'], hollis: [null, 'Founders Park'], priya: [null, 'Founders Plaza'],
    rosa: [null, 'Maple Court'], reyes: [null, "Tony's Pizza"], dez: ['Eastside Middle School', null], jamal: ['Fade Factory', null], bea: [null, 'Birch Lane'], andy: [null, 'Eastside Dog Park'], mo: [null, null],
    johnson: [null, 'Willow Street'], hal: [null, 'Pelican Diner'], cora: [null, 'The Rowboat Café'], eli: [null, 'Riverwalk'], toby: [null, 'River Market'], gus: [null, 'Riverwalk'],
    lupe: [null, 'Railside Apartments'], carl: ['Millworker Row', null], pat: ['Railside Apartments', null], hector: [null, 'The Lunch Pail'], gerald: [null, 'The Lunch Pail'],
    moore: [null, 'The Gavel Grill'], hattie: [null, 'Magnolia Terrace'], nico: [null, 'Gavel Green'], barnes: [null, 'Objection! Espresso'], greer: [null, 'Gavel Green']
  };
  let rT = 1;
  function routines(dt) {
    rT -= dt; if (rT > 0 || H.inside || H.cine()) return; rT = 2.5; const W = H.W, P = H.P; if (!W || !W.lots) return; const day = H.hour() >= 6 && H.hour() < 18, slot = slotOf(H.hour());
    H.regs.slice().forEach((r) => {
      const R4 = ROUTINE4[r.n.id], R = ROUTINE[r.n.id]; if ((!R && !R4) || (H.storyNpc && H.storyNpc() === r.n.id)) return; const want = (R4 ? R4[slot] : (day ? R[0] : R[1])) || H.homeOf(r.n); if (!want) return;
      const lot = W.lots.find((l) => (l.name || '').indexOf(want) >= 0) || W.lots.find((l) => l.kind === want); if (!lot || lot === r.lot) return;
      if (Math.hypot(r.x - P.x, r.y - P.y) < 16) return; const [dx, dy] = lot.door; if (Math.hypot(dx - P.x, dy - P.y) < 12) return; // never pop in or out in front of you
      H.moveReg(r, lot);
    });
  }
  const whereNow = (n) => { const R4 = ROUTINE4[n.id]; if (R4) return R4[slotOf(H.hour())] || null; const R = ROUTINE[n.id]; if (!R) return null; const day = H.hour() >= 6 && H.hour() < 18; return (day ? R[0] : R[1]) || null; };

  // ================= 3. STREET GREETINGS =================
  const BARKS = []; let bT = 3; const barkCool = new Map();
  function barkLine(n) {
    const f = (S.npc || {})[n.id] || 0, tr = (S.trust || {})[H.W.did] == null ? 50 : S.trust[H.W.did], h = H.hour(), first = (n.name || '').replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Sgt\.|Judge|Father|Coach|Captain|Tía|Doña|Miss)\s+/, '').split(' ')[0];
    if (n.cat) return rnd(['Mrrp.', '(slow blink)', '(tail flick)']);
    if (f < 5 && Math.random() < .3 && H.wxBark) { const w = H.wxBark(); if (w) return w; }
    const tod = h < 11 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
    if (f >= 3 && S.title && Math.random() < .25) return rnd([tod + ', ' + S.title + '!', 'Well, if it isn\'t ' + S.title + '.', S.title + '! Heard about that.']);
    if (f >= 5) return rnd(['There\'s my favorite cadet!', 'Hey you! Come say hi!', tod + ', partner!', 'Don\'t be a stranger now!', 'You\'re a sight for sore eyes.']);
    if (f >= 3) return rnd([tod + ', cadet!', 'Hey! How\'s the watch?', 'Stay safe out there!', 'Good to see you around.', 'Cadet! Got a minute later?']);
    if (f >= 1) return rnd([tod + ', officer.', 'Oh, hey. Hi.', 'Back on patrol?', 'Hi there.']);
    if (tr < 35) return rnd(['…', 'Didn\'t call you.', 'Hmph.', '(looks away)']);
    if (tr > 70) return rnd(['Thanks for looking out for us.', tod + ', officer!', 'Glad you\'re around.', 'Appreciate you.']);
    return rnd([tod + '.', 'Officer.', 'Hey.', '(nods)']);
  }
  const PED = { lo: ['…', '(crosses the street)', 'Not today, man.', '(avoids eye contact)', 'Didn\'t do anything.', '(phone suddenly very interesting)'], mid: ['(nods)', 'Hey.', 'Officer.', 'Busy day?', 'Hot one, huh?', 'Morning. Or whatever it is.', '(half a wave)'], hi: ['Thanks for being out here!', 'Hey! Stay safe, okay?', '(waves big)', 'My kid wants to be a cop. Say hi!', 'You all doing okay? Need water?', 'Saw you last week. You were nice to my mom.'] };
  function barks(dt) {
    for (let i = BARKS.length - 1; i >= 0; i--) { BARKS[i].t -= dt; if (BARKS[i].t <= 0) BARKS.splice(i, 1); }
    bT -= dt; if (bT > 0 || H.cine() || H.paused()) return; bT = .5; const P = H.P, now = performance.now(); if (P.inCar && P.moving) return;
    if (BARKS.length >= 2) return;
    for (const r of H.regs) { const d = Math.hypot(r.x - P.x, r.y - P.y); if (d > 3.2 || d < .6) continue; const id = r.n.id; if ((barkCool.get(id) || 0) > now) continue; barkCool.set(id, now + 90000); BARKS.push({ e: r, text: barkLine(r.n), t: 3.4, t0: 3.4 }); H.faceTo(r); if (((S.npc || {})[id] || 0) >= 1 || Math.random() < .3) r.waveT = now + 1600; return; }
    if (Math.random() < .25) { const tr = (S.trust || {})[H.W.did] == null ? 50 : S.trust[H.W.did]; for (const p of H.peds) { const d = Math.hypot(p.x - P.x, p.y - P.y); if (d > 2.4) continue; if ((p.barkT || 0) > now) continue; p.barkT = now + 120000; const gs = tr >= 35 && Math.random() < .45 && H.gossip ? H.gossip() : null; BARKS.push({ e: p, text: gs || rnd(tr < 35 ? PED.lo : tr > 70 ? PED.hi : PED.mid), t: gs ? 4.6 : 2.8, t0: gs ? 4.6 : 2.8 }); return; } }
  }
  function drawBarks(g) {
    BARKS.forEach((b) => {
      const [sx, sy] = H.iso(b.e.x, b.e.y), a = Math.min(1, b.t / .3, (b.t0 - b.t) / .2 + .2), y = sy - 62 - Math.min(1, (b.t0 - b.t) * 4) * 4;
      g.save(); g.globalAlpha = Math.max(0, a); g.font = '600 10px Meridian Text, system-ui, sans-serif';
      if (!b.lines) { const words = b.text.split(' '), out = []; let cur = ''; for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (g.measureText(t).width > 168 && cur) { out.push(cur); cur = wd; } else cur = t; } out.push(cur); b.lines = out; b.w = Math.min(182, Math.max(...out.map((l) => g.measureText(l).width))) + 14; } // wrapped once per bark
      const w = b.w, hh = 6 + b.lines.length * 12;
      g.fillStyle = 'rgba(255,255,255,.95)'; g.strokeStyle = 'rgba(15,23,42,.35)'; g.lineWidth = 1; g.beginPath(); g.roundRect(sx - w / 2, y - hh, w, hh, 9); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(sx - 4, y); g.lineTo(sx, y + 5); g.lineTo(sx + 4, y); g.closePath(); g.fill();
      g.fillStyle = '#0f172a'; g.textAlign = 'center'; g.textBaseline = 'middle'; b.lines.forEach((l, i) => g.fillText(l, sx, y - hh + 9 + i * 12, 172)); g.restore();
    });
  }

  // ================= 4. VOICED SCENES =================
  const FEM = /castillo|velvet|dot|okafor|rosa|ruth|johnson|lupe|dee|shonda|hattie|tasha|carmen|priya|bea|sunny|ines|pearl|cora|tess|ivy|wanda|greer|ada|navarro/;
  const MALE = /okonkwo|pike|lassiter|delgado|pruitt|marcus|kevin|earl|reyes|kim|dez|hal|bobby|miguel|sam|gus|gerald|rusty|carl|moore|barnes|ray|ramos|walt|leon|hollis|mo$|lewis|andy|jamal|nash|eli|toby|hector|pat|lou|alvarez|nico|felix|booker/;
  let voices = [], speaking = false;
  const loadVoices = () => { try { voices = (speechSynthesis.getVoices() || []).filter((v) => /^en/i.test(v.lang)); } catch (e) { voices = []; } };
  try { if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; } } catch (e) {}
  function voiceFor(id, name) {
    const h = hash(id), g = FEM.test(id) || /^(Ms|Mrs|Miss|Doña|Tía|Grandma|Aunt|Sister)\b/.test(name || '') ? 'f' : MALE.test(id) || /^(Mr|Father|Uncle|Brother|Big)\b/.test(name || '') ? 'm' : h % 2 ? 'f' : 'm';
    const fem = voices.filter((v) => /female|samantha|victoria|karen|moira|tessa|fiona|zira|aria|jenny|susan|allison|ava|serena|kate|libby|sonia|natasha|hazel/i.test(v.name));
    const mal = voices.filter((v) => /male|daniel|alex|fred|david|mark|guy|ryan|tom|aaron|arthur|oliver|george|james|thomas|christopher|eric/i.test(v.name) && !/female/i.test(v.name));
    const pool = (g === 'f' ? fem : mal).length ? (g === 'f' ? fem : mal) : voices;
    return { v: pool.length ? pool[h % pool.length] : null, pitch: (g === 'f' ? 1.08 : .9) + ((h >> 3) % 7 - 3) * .03, rate: .98 + ((h >> 6) % 5 - 2) * .03 };
  }
  function speak(id, name, text, radio) {
    hush(); if (!window.speechSynthesis || !S.sound || id === 'exhibita') return false;
    const clean = String(text).replace(/\([^)]*\)/g, ' ').replace(/[*~]/g, '').replace(/\s+/g, ' ').trim(); if (!clean) return false;
    try { const u = new SpeechSynthesisUtterance(clean), vf = voiceFor(id, name); if (vf.v) u.voice = vf.v; u.pitch = vf.pitch; u.rate = vf.rate * (radio ? 1.06 : 1); u.volume = S.cfg.vVoice == null ? 1 : S.cfg.vVoice;
      u.onend = u.onerror = () => { speaking = false; H.duck(false); }; speaking = true; H.duck(true); speechSynthesis.speak(u); return true; } catch (e) { speaking = false; return false; }
  }
  function hush() { if (speaking || (window.speechSynthesis && speechSynthesis.speaking)) { try { speechSynthesis.cancel(); } catch (e) {} } speaking = false; H.duck(false); }
  const voiceOn = (opts) => S.cfg.voice === 'all' || (S.cfg.voice === 'story' && opts && opts.voiced);

  // ================= 7. CHAPTER TITLE CARDS AND RECAP =================
  let cardBusy = false, recapDone = false, seenT = 0;
  function titleCard(kick, title, sub, done) {
    cardBusy = true; H.pause(true); H.sting('card');
    const el = document.createElement('div'); el.className = 'tCard'; el.innerHTML = '<div class="tcBar t"></div><div class="tcBar b"></div><div class="tcIn"><small>' + esc(kick) + '</small><h1>' + esc(title) + '</h1><i></i><p>' + esc(sub || '') + '</p><em>Tap to continue</em></div>';
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    let gone = false; const close = () => { if (gone) return; gone = true; el.classList.add('out'); setTimeout(() => { el.remove(); cardBusy = false; H.pause(false); done && done(); }, 600); };
    setTimeout(() => { el.onclick = close; addEventListener('keydown', function k() { removeEventListener('keydown', k); close(); }, { once: true }); }, 900); setTimeout(close, 6500);
  }
  function chapterCards() {
    if (cardBusy || !H.ready() || H.cine() || H.paused() || H.inside) return; const W = H.W; if (!W) return;
    const d = W.did, ch = H.CHAPTERS.find((c) => c.d === d); if (!ch || !S.unlocked || S.unlocked.indexOf(d) < 0) return;
    const at = (S.story || {})[d] || 0; if (at >= ch.steps.length) return; const key = 'ch' + d; if (S.cards[key]) return;
    S.cards[key] = Date.now(); H.saveS(); titleCard('CHAPTER ' + (d + 1) + ' · ' + H.dname(d).toUpperCase(), ch.title, ch.sub || '');
  }
  function recap() {
    recapDone = true; const last = S.lastSeen || 0; if (!last || Date.now() - last < 30 * 60000) return; const A = H.activeQ(), lines = [];
    const W = H.W, d = W ? W.did : 0, ch = H.CHAPTERS.find((c) => c.d === d), at = (S.story || {})[d] || 0;
    if (ch && at > 0) lines.push('In ' + H.dname(d) + ', you ' + ch.steps[at - 1].goal.charAt(0).toLowerCase() + ch.steps[at - 1].goal.slice(1) + '.');
    if (A) lines.push('Next: ' + A.step.goal + (A.side ? ' (side case: ' + A.title + ')' : '') + '.');
    const fr = Object.keys(S.npc || {}).filter((k) => S.npc[k] >= 3).length; if (fr) lines.push('You have ' + fr + ' friend' + (fr > 1 ? 's' : '') + ' in the city' + (fr > 3 ? '. People are starting to know your name.' : '.'));
    const lo = Object.keys(S.lore || {}).length; lines.push(lo + ' pages in your field journal.');
    if (H.sessLines) H.sessLines().forEach((l) => lines.push(l));
    const el = document.createElement('div'); el.className = 'tCard recap'; el.innerHTML = '<div class="tcBar t"></div><div class="tcBar b"></div><div class="tcIn"><small>PREVIOUSLY IN PATROL CITY</small><h1>Last time…</h1><i></i>' + lines.map((l, k) => '<p style="--d:' + (k * 350 + 500) + 'ms">' + esc(l) + '</p>').join('') + '<em>Tap to continue</em></div>';
    cardBusy = true; H.pause(true); document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on')); H.sting('card');
    const close = () => { el.classList.add('out'); setTimeout(() => { el.remove(); cardBusy = false; H.pause(false); }, 600); }; setTimeout(() => { el.onclick = close; }, 800);
  }

  // ================= 8. ACCESSIBILITY AND CONTROLS =================
  const ACTIONS = [['up', 'Move up', 'w'], ['down', 'Move down', 's'], ['left', 'Move left', 'a'], ['right', 'Move right', 'd'], ['use', 'Talk / interact', 'e'], ['journal', 'Field journal', 'j'], ['photo', 'Photo mode', 'p'], ['log', 'Conversation log', 'l']];
  const keyOf = (a) => ((S.cfg.keys || {})[a] || (ACTIONS.find((x) => x[0] === a) || [])[2] || '').toLowerCase();
  function applyA11y() {
    const b = document.body; b.classList.remove('ts-l', 'ts-xl', 'cm-deut', 'cm-prot', 'cm-trit', 'cm-hc', 'fontA');
    if (S.cfg.tsize === 'large') b.classList.add('ts-l'); if (S.cfg.tsize === 'xl') b.classList.add('ts-xl');
    if (S.cfg.cmode && S.cfg.cmode !== 'none') b.classList.add('cm-' + S.cfg.cmode);
    if (S.cfg.font === 'readable') { b.classList.add('fontA');  }
    if (!document.getElementById('cbSvg')) { const d = document.createElement('div'); d.id = 'cbSvg'; d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'; d.innerHTML = '<svg><filter id="cb-deut"><feColorMatrix type="matrix" values="1 0 0 0 0  -0.438 1.438 0 0 0  0.262 -0.562 1.3 0 0  0 0 0 1 0"/></filter><filter id="cb-prot"><feColorMatrix type="matrix" values="1 0 0 0 0  -0.255 1.255 0 0 0  0.303 -0.545 1.242 0 0  0 0 0 1 0"/></filter><filter id="cb-trit"><feColorMatrix type="matrix" values="1.05 -0.382 0.332 0 0  0 1.234 -0.234 0 0  0 0 1 0 0  0 0 0 1 0"/></filter></svg>'; document.body.appendChild(d); }
  }
  // the colour modes daltonize the world view: colours a player can't tell apart are shifted into ones they can
  function controlsPanel(back) {
    const el = H.fe(); el.hidden = false; el.className = 'fe menuBg'; let listen = null;
    const draw = () => {
      el.innerHTML = '<div class="feCard"><div class="feHead"><span>Options</span><h2>Controls</h2></div><div class="kbList">' + ACTIONS.map(([a, t]) => '<button type="button" data-a="' + a + '" class="' + (listen === a ? 'on' : '') + '"><span>' + t + '</span><kbd>' + (listen === a ? 'Press a key…' : esc(keyOf(a).toUpperCase() || '—')) + '</kbd></button>').join('') +
        '</div><p class="lkSum">Arrow keys always move. Esc pauses. In conversations: Space or Enter continues, 1 to 6 picks a choice, arrows move between choices.<br>🎮 Gamepad: left stick or d-pad to move, A to talk or continue, B to back out, X for the journal, Y for photo mode, Start to pause.</p>' +
        '<div class="feBtns"><button type="button" class="feBtn ghost" id="kbReset">Reset to default</button><button type="button" class="feBtn" id="kbBack">Back</button></div></div>';
      el.querySelectorAll('[data-a]').forEach((b) => b.onclick = () => { listen = b.dataset.a; draw(); });
      H.$('kbReset').onclick = () => { S.cfg.keys = {}; H.saveS(); draw(); }; H.$('kbBack').onclick = () => { removeEventListener('keydown', grab, true); back ? back() : (el.hidden = true); };
    };
    const grab = (e) => { if (!listen) return; e.preventDefault(); e.stopPropagation(); const k = e.key.length === 1 ? e.key.toLowerCase() : null; if (k && k !== ' ') { S.cfg.keys = S.cfg.keys || {}; Object.keys(S.cfg.keys).forEach((a) => { if (S.cfg.keys[a] === k) delete S.cfg.keys[a]; }); S.cfg.keys[listen] = k; H.saveS(); } listen = null; draw(); };
    addEventListener('keydown', grab, true); draw();
  }
  function onKey(e) {
    if (e.target.closest && e.target.closest('input,textarea')) return false; const k = (e.key || '').toLowerCase();
    if (!H.$('dlg').hidden || !H.$('modal').hidden || !H.fe().hidden || cardBusy) return false;
    const mv = { [keyOf('up')]: [-1, -1], [keyOf('down')]: [1, 1], [keyOf('left')]: [-1, 1], [keyOf('right')]: [1, -1], arrowup: [-1, -1], arrowdown: [1, 1], arrowleft: [-1, 1], arrowright: [1, -1] }[k];
    if (mv) { e.preventDefault(); H.move(mv[0], mv[1]); return true; }
    if (k === keyOf('use')) { H.use(); return true; } if (k === keyOf('journal')) { H.journal(); return true; }
    return false;
  }
  // gamepad: polled each frame
  const padPrev = {}; let padMove = 0;
  function pad(dt) {
    let gp = null; try { gp = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find((g) => g && g.connected); } catch (e) {} if (!gp) return;
    if (!S.padHello) { S.padHello = 1; H.toast('🎮 Gamepad connected. Start pauses, A talks, B backs out.'); }
    const btn = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed), edge = (i) => { const p = btn(i), was = padPrev[i]; padPrev[i] = p; return p && !was; };
    const key = (k) => { const t = document.activeElement && document.activeElement !== document.documentElement ? document.activeElement : document.body; t.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); };
    const dlg = !H.$('dlg').hidden, menu = !H.$('modal').hidden || !H.fe().hidden;
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, up = btn(12) || ay < -.5, dn = btn(13) || ay > .5, lf = btn(14) || ax < -.5, rt = btn(15) || ax > .5;
    if (dlg || menu) { if (edge(12) || (ay < -.5 && !padPrev.ay)) key('ArrowUp'); if (edge(13) || (ay > .5 && !padPrev.ay)) key('ArrowDown'); padPrev.ay = Math.abs(ay) > .5;
      if (edge(0)) { const f = document.activeElement; if (f && f.tagName === 'BUTTON' && (dlg ? f.closest('#dlg') : true)) f.click(); else if (dlg) H.$('dlg').click(); else { const b = (H.$('modal').hidden ? H.fe() : H.$('modal')).querySelector('button'); if (b) b.focus(); } }
      if (edge(1)) { const c = document.querySelector('#modal:not([hidden]) #mClose, #modal:not([hidden]) #mDone'); if (c) c.click(); else key('Escape'); }
      if (cardBusy && edge(0)) { const c = document.querySelector('.tCard'); if (c) c.click(); }
      return; }
    edge(12); edge(13);
    if (cardBusy) { if (edge(0)) { const c = document.querySelector('.tCard'); if (c) c.click(); } return; }
    padMove -= dt; if ((up || dn || lf || rt) && padMove <= 0) { padMove = .16; let x = 0, y = 0; if (up) { x -= 1; y -= 1; } if (dn) { x += 1; y += 1; } if (lf) { x -= 1; y += 1; } if (rt) { x += 1; y -= 1; } const m = Math.hypot(x, y) || 1; H.move(x / m * 1.4, y / m * 1.4); }
    if (edge(0)) H.use(); if (edge(2)) H.journal(); if (edge(3)) key('p'); if (edge(9)) key('Escape'); edge(1);
  }

  // ================= 9. CASE FILES =================
  const RAR = { place: ['Common', '#94a3b8'], person: ['Rare', '#38bdf8'], side: ['Epic', '#a78bfa'], story: ['Legendary', '#f5b800'] };
  function cardsFor(d) {
    const dn = H.dname(d); return H.LORE.filter((e) => { const w = e.when; if (w.slice(0, 6) === 'visit:') return H.loreDist(w.slice(6)) === dn; if (w.slice(0, 7) === 'friend:') { const n = H.NPCS.find((x) => x.id === w.slice(7)); return n && n.d === d; } if (w.slice(0, 5) === 'side:') { const q = H.sideQ(w.slice(5)); return q && q.d === d; } return w === 'd' + d; })
      .map((e) => { const w = e.when, kind = w.slice(0, 6) === 'visit:' ? 'place' : w.slice(0, 7) === 'friend:' ? 'person' : w.slice(0, 5) === 'side:' ? 'side' : 'story', n = kind === 'person' ? H.NPCS.find((x) => x.id === w.slice(7)) : null;
        const icon = n ? n.icon : kind === 'place' ? H.placeIcon(w.slice(6)) : kind === 'side' ? '📁' : '🏛️'; return { e, kind, icon }; });
  }
  const SETS = [['Historian of the Central District', { stripe: '#f5b800', text: 'CENTRAL FILES' }], ['Keeper of the Eastside', { stripe: '#ef4444', text: 'EASTSIDE FILES' }], ['Riverside Archivist', { stripe: '#14b8a6', text: 'RIVER FILES' }], ['Industrial Park Chronicler', { stripe: '#f97316', text: 'IRON FILES' }], ['Clerk of Justice Row', { stripe: '#8b5cf6', text: 'JUSTICE FILES' }]];
  let csT = 4;
  function caseSetCheck(dt) {
    csT -= dt; if (csT > 0) return; csT = 5;
    for (let d = 0; d < 5; d++) { if (S.caseSets[d]) continue; const cs = cardsFor(d); if (!cs.length || !cs.every((c) => S.lore[c.e.id])) continue;
      S.caseSets[d] = Date.now(); S.titles[SETS[d][0]] = 1; S.carSkins = S.carSkins || {}; S.carSkins['set' + d] = SETS[d][1]; H.saveS(); H.sting('set'); H.award(500, 'case file set');
      H.banner('🗂️', 'Case file set complete: ' + H.dname(d), 'Title unlocked: ' + SETS[d][0] + '. Car skin: ' + SETS[d][1].text + '.'); H.stat('caseSet'); }
  }
  function caseFiles(d) {
    d = d == null ? (H.W ? H.W.did : 0) : d; const cs = cardsFor(d), have = cs.filter((c) => S.lore[c.e.id]).length;
    H.openModal('<div class="sceneHead"><b>CASE FILES</b><h2>' + esc(H.dname(d)) + '</h2><p>Every page of lore is a card. Find them by exploring places, befriending people and closing cases. Complete a district for a title and a car skin.</p></div>' +
      '<div class="lkTabs">' + [0, 1, 2, 3, 4].map((k) => { const c2 = cardsFor(k), h2 = c2.filter((c) => S.lore[c.e.id]).length; return '<button type="button" data-cd="' + k + '" class="' + (k === d ? 'on' : '') + '">' + (S.caseSets[k] ? '★ ' : '') + esc(H.dname(k).replace(' District', '')) + ' <small>' + h2 + '/' + c2.length + '</small></button>'; }).join('') + '</div>' +
      '<div class="cfBar"><i style="width:' + Math.round(have / Math.max(1, cs.length) * 100) + '%"></i><span>' + have + ' / ' + cs.length + ' cards' + (S.caseSets[d] ? ' · SET COMPLETE' : ' · reward: ' + esc(SETS[d][0])) + '</span></div>' +
      '<div class="cfGrid">' + cs.map((c, k) => { const own = S.lore[c.e.id], r = RAR[c.kind]; return '<button type="button" class="cfCard ' + c.kind + (own ? '' : ' lock') + '" data-cf="' + k + '" style="--r:' + r[1] + ';--h:' + (hash(c.e.id) % 360) + 'deg"><span class="cfArt">' + (own ? c.icon : '?') + '</span><b>' + (own ? esc(c.e.title) : '???') + '</b><small>' + r[0] + '</small></button>'; }).join('') + '</div>' +
      '<div class="qAct"><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal; document.querySelectorAll('[data-cd]').forEach((b) => b.onclick = () => caseFiles(+b.dataset.cd));
    document.querySelectorAll('[data-cf]').forEach((b) => b.onclick = () => { const c = cs[+b.dataset.cf]; if (!S.lore[c.e.id]) { H.toast('🔒 ' + H.loreHint(c.e.when)); return; } const r = RAR[c.kind];
      H.openModal('<div class="cfBig ' + c.kind + '" style="--r:' + r[1] + ';--h:' + (hash(c.e.id) % 360) + 'deg"><span class="cfArt">' + c.icon + '</span><small>' + r[0] + ' · ' + esc(H.dname(d)) + '</small><h2>' + esc(c.e.title) + '</h2><p>' + esc(c.e.text) + '</p></div><div class="qAct"><button type="button" id="mClose">Back</button></div>'); H.$('mClose').onclick = () => caseFiles(d); });
  }

  // ================= 10. ACADEMY SEASON =================
  const now0 = new Date(), Q = Math.floor(now0.getMonth() / 3), SEASON_ID = now0.getFullYear() + 'Q' + (Q + 1);
  const SEASON_NAME = ['Season of the Badge', 'Spring Shift', 'Summer Watch', 'Storms & Lights'][Q], SEASON_ICON = ['🛡️', '🌼', '☀️', '🌀'][Q];
  const PER = 400, TIERS = [
    ['title', 'Season Rookie'], ['cash', 150], ['skin', { stripe: '#38bdf8', text: 'S' + (Q + 1) + ' ROOKIE' }], ['look', { cord: '#38bdf8' }, 'Sky-blue shoulder cord'], ['cash', 200],
    ['title', 'Steady Hands'], ['look', { hat: 'boonie', hatCol: '#334155' }, 'Slate boonie hat'], ['cash', 250], ['skin', { stripe: '#22c55e', text: 'COMMUNITY FIRST' }], ['title', 'Neighborhood Favorite'],
    ['look', { cord: '#f5b800', brass: true }, 'Gold cord and brass'], ['cash', 300], ['skin', { stripe: '#a78bfa', text: SEASON_NAME.toUpperCase().slice(0, 16) }], ['title', 'Field Training Standout'], ['look', { glow: true }, 'Lantern glow'],
    ['cash', 400], ['skin', { stripe: '#f43f5e', text: 'TOP OF THE CLASS' }], ['title', 'Honor Cadet'], ['look', { cord: '#f5b800', brass: true, shine: 1, hat: 'campaign', hatCol: '#1e3a8a' }, 'Honor guard dress'], ['title', SEASON_NAME + ' Legend']
  ];
  if (!S.season || S.season.id !== SEASON_ID) S.season = { id: SEASON_ID, xp: 0, got: {} };
  const tierNow = () => Math.min(TIERS.length, Math.floor(S.season.xp / PER));
  function seasonXP(n) { if (!(n > 0)) return; const before = tierNow(); S.season.xp += n; const after = tierNow(); if (after > before) { H.sting('set'); H.toast(SEASON_ICON + ' Academy Season tier ' + after + ' reached. Claim it from the pause menu.'); } }
  function rewardText(t) { return t[0] === 'title' ? 'Title: ' + t[1] : t[0] === 'cash' ? '$' + t[1] : t[0] === 'skin' ? 'Car skin: ' + t[1].text : t[2]; }
  const rewardIcon = (t) => ({ title: '🏷️', cash: '💵', skin: '🚓', look: '👕' })[t[0]];
  function claim(i) { const t = TIERS[i]; if (S.season.got[i] || i >= tierNow()) return; S.season.got[i] = 1;
    if (t[0] === 'title') S.titles[t[1]] = 1; else if (t[0] === 'cash') S.cash = (S.cash || 0) + t[1]; else if (t[0] === 'skin') { S.carSkins = S.carSkins || {}; S.carSkins['s' + SEASON_ID + i] = t[1]; } else if (t[0] === 'look') { S.seasonLooks = S.seasonLooks || {}; S.seasonLooks['s' + SEASON_ID + i] = { look: t[1], name: t[2] }; }
    H.saveS(); H.stat('seasonClaim'); H.beep(990, .1, 'triangle', .04); }
  function seasonPanel() {
    const tn = tierNow(), into = S.season.xp % PER, end = new Date(now0.getFullYear(), Q * 3 + 3, 1), days = Math.max(0, Math.ceil((end - new Date()) / 864e5));
    H.openModal('<div class="sceneHead"><b>ACADEMY SEASON · ' + days + ' DAYS LEFT</b><h2>' + SEASON_ICON + ' ' + esc(SEASON_NAME) + '</h2><p>Every RP you earn fills the track. All rewards are free cosmetics, earned only by playing.</p></div>' +
      '<div class="cfBar"><i style="width:' + (tn >= TIERS.length ? 100 : Math.round(into / PER * 100)) + '%"></i><span>Tier ' + tn + ' / ' + TIERS.length + (tn < TIERS.length ? ' · ' + into + ' / ' + PER + ' RP to next' : ' · track complete') + '</span></div>' +
      '<div class="seTrack">' + TIERS.map((t, i) => { const open = i < tn, got = S.season.got[i]; return '<div class="seTier' + (open ? ' open' : '') + (got ? ' got' : '') + '"><em>' + (i + 1) + '</em><span>' + rewardIcon(t) + '</span><p>' + esc(rewardText(t)) + '</p>' + (open && !got ? '<button type="button" data-cl="' + i + '">Claim</button>' : got ? '<i>✓</i>' : '<i>🔒</i>') + '</div>'; }).join('') + '</div>' +
      '<div class="qAct"><button type="button" class="ghost" id="seWear">Wardrobe & titles</button><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal; H.$('seWear').onclick = wardrobe; document.querySelectorAll('[data-cl]').forEach((b) => b.onclick = () => { claim(+b.dataset.cl); seasonPanel(); });
    const first = document.querySelector('.seTier.open:not(.got)') || document.querySelectorAll('.seTier')[Math.max(0, tn - 1)]; if (first) first.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function wardrobe() {
    const ts = Object.keys(S.titles), sk = Object.entries(S.carSkins || {}), lk = Object.entries(S.seasonLooks || {});
    H.openModal('<div class="sceneHead"><b>WARDROBE</b><h2>Titles, skins and looks</h2><p>Your title shows under your call sign. Car skins and looks are cosmetic.</p></div>' +
      '<div class="jSec"><b>Title</b></div><div class="wrList">' + (ts.length ? ts.map((t) => '<button type="button" data-ti="' + esc(t) + '" class="' + (S.title === t ? 'on' : '') + '">🏷️ ' + esc(t) + '</button>').join('') : '<p class="lkSum">Earn titles from the Academy Season and complete case file sets.</p>') + '</div>' +
      '<div class="jSec"><b>Car skins</b></div><div class="wrList">' + (sk.length ? sk.map(([k, s]) => '<button type="button" data-sk="' + esc(k) + '" class="' + (S.car && S.car.skinId === k ? 'on' : '') + '"><i style="background:' + s.stripe + '"></i>' + esc(s.text) + '</button>').join('') : '<p class="lkSum">None yet.</p>') + '</div>' +
      '<div class="jSec"><b>Looks</b></div><div class="wrList">' + (lk.length ? lk.map(([k, s]) => '<button type="button" data-lk="' + esc(k) + '" class="' + (S.seasonWear === k ? 'on' : '') + '">👕 ' + esc(s.name) + '</button>').join('') : '<p class="lkSum">None yet.</p>') + '</div>' +
      '<div class="qAct"><button type="button" class="ghost" id="wrBack">Season track</button><button type="button" id="mClose">Close</button></div>');
    H.$('mClose').onclick = H.closeModal; H.$('wrBack').onclick = seasonPanel;
    document.querySelectorAll('[data-ti]').forEach((b) => b.onclick = () => { S.title = S.title === b.dataset.ti ? null : b.dataset.ti; H.saveS(); H.hud(); wardrobe(); });
    document.querySelectorAll('[data-sk]').forEach((b) => b.onclick = () => { const k = b.dataset.sk; S.car = S.car || {}; if (S.car.skinId === k) { S.car.skinId = null; S.car.skinSpec = null; } else { S.car.skinId = k; S.car.skinSpec = S.carSkins[k]; } H.saveS(); wardrobe(); });
    document.querySelectorAll('[data-lk]').forEach((b) => b.onclick = () => { S.seasonWear = S.seasonWear === b.dataset.lk ? null : b.dataset.lk; H.saveS(); H.refreshLook(); wardrobe(); });
  }
  const seasonLook = () => (S.seasonWear && S.seasonLooks && S.seasonLooks[S.seasonWear] ? S.seasonLooks[S.seasonWear].look : null);

  // ================= per-frame =================
  function tick(dt) {
    routines(dt); barks(dt); caseSetCheck(dt); pad(dt);
    seenT -= dt; if (seenT <= 0) { seenT = 20; if (recapDone) { S.lastSeen = Date.now(); } }
    if (!recapDone && H.ready() && !H.paused() && !H.cine() && H.W) { recap(); if (!cardBusy) S.lastSeen = Date.now(); }
    else if (recapDone) chapterCards();
  }
  applyA11y();
  return { get barks() { return BARKS; }, debrief, tick, drawBarks, speak, hush, voiceOn, get speaking() { return speaking; }, onKey, controlsPanel, applyA11y, caseFiles, seasonPanel, wardrobe, seasonXP, seasonLook, whereNow, titleCard, get cardBusy() { return cardBusy; } };
}
