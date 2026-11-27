// Investigation (owner's call, 2026-11-27): on a theft or burglary call the suspect is already gone, so you work it.
// Interview the witnesses (separately, with open questions, or their stories blur together), knock on doors before
// the trail goes cold, scrub camera footage against the time window dispatch gave you, then send a BOLO built from
// what you actually found. A good BOLO gets someone stopped two blocks away; a careless one gets the wrong person
// stopped; a thin one leaves the case open. Open cases go cold, and the people you left a card with can call your
// work cell months later with the lead you were missing. A few never close. That is on purpose.
//
// Loop: choose how to handle it -> the city remembers. Feeds the case file (every lead is searchable), your contacts
// (witnesses and the doors you left a card at) and the district's trust; reads the call, the chapter's facts and
// the dispatch time window. At most three fact checks per investigation (CLAUDE.md).
import { sprite, fromLook } from './pixelfolk.js';

const COLS = { red: '#b91c1c', orange: '#ea580c', yellow: '#ca8a04', green: '#15803d', blue: '#1d4ed8', gray: '#6b7280', white: '#e5e7eb', black: '#1f2937' };
// colors that honestly get mixed up: a sodium streetlight turns red orange, a shadow turns navy black
const MIX = { red: 'orange', orange: 'red', blue: 'black', black: 'blue', gray: 'white', white: 'gray', green: 'black', yellow: 'orange' };
const TOP = { hoodie: 'Hoodie', jacket: 'Jacket', tee: 'T-shirt' }, HAT = { none: 'No hat', cap: 'Ball cap', beanie: 'Beanie' }, BAG = { none: 'No bag', pack: 'Backpack', bag: 'Shoulder bag' }, DIR = { east: 'Heading east', west: 'Heading west' };
const ROWS = [['top', 'Top', TOP], ['col', 'Color', Object.fromEntries(Object.keys(COLS).map((k) => [k, k[0].toUpperCase() + k.slice(1)]))], ['hat', 'Hat', HAT], ['bag', 'Carrying', BAG], ['dir', 'Went', DIR]];
const NAMES = ['Mrs. Abernathy', 'Luis', 'Dana Whitcomb', 'Mr. Oyelaran', 'Priya', 'Coach Reddick', 'Ms. Tran', 'Earl', 'Shonda', 'Mr. Feld', 'Kiki', 'Nadine'];
const SPOTS = [['Corner Market', 'biz'], ['Suds Laundromat', 'biz'], ['Hair by Jolene', 'biz'], ['Pho 88', 'biz'], ['Auto Glass', 'biz']];
// what an unsolved case can leave behind; a detail that shows up twice is worth noticing (it stays a mystery)
const ODD = ['a paper crane folded from a receipt, left on the counter', 'a chalk circle drawn on the sidewalk outside the door', 'every lock pried, but the cash drawer left full', 'a single white glove on the fence'];
// calls that are worked, not just answered; what was taken and who saw it
const KINDS = [
  { re: /burglary just occurred|smashed back door/i, took: 'the register drawer and two laptops', serial: true, vic: 'Store owner', wit: 'Stock clerk', where: 'the back door' },
  { re: /burglary alarm at a warehouse/i, took: 'a pallet jack and three boxes of power tools', serial: true, vic: 'Warehouse manager', wit: 'Night forklift driver', where: 'the rear dock' },
  { re: /purse snatched/i, took: 'a purse with her phone and ID', serial: false, vic: 'Victim', wit: 'Bus rider', where: 'the bus stop' },
  { re: /bike stolen/i, took: 'a blue commuter bike, lock cut', serial: true, vic: 'Bike owner', wit: 'Barista on break', where: 'the rack' },
  { re: /shed broken into/i, took: 'a mower and a toolbox', serial: true, vic: 'Homeowner', wit: 'Neighbor', where: 'the backyard shed' },
  { re: /packages missing/i, took: 'three packages off the porch', serial: false, vic: 'Resident', wit: 'Mail carrier', where: 'the porch' },
  { re: /tools stolen from a work truck/i, took: 'a saw, a drill and a nail gun', serial: true, vic: 'Contractor', wit: 'Crossing guard', where: 'the truck bed' }];

const R = (a) => a[Math.floor(Math.random() * a.length)], shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const hm = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

export function installInvestigate(H) {
  const S = H.S, esc = H.esc; let CUR = null; const hmc = (m) => hm((CUR ? CUR.base || 0 : 0) + m);
  const kindOf = (c) => c && KINDS.find((k) => k.re.test(c.title || ''));
  const fits = (c) => !!kindOf(c) && !c.ops && !c.deesc && !c.pursuit;
  const factFor = (les, re) => { const f = (H.factList([les]) || []).find((x) => re.test(x.text)); return f ? f.id : null; };

  // a person, drawn from what they wore; the footage and the BOLO read from the same record
  const person = (o) => ({ top: o.top || R(Object.keys(TOP)), col: o.col || R(Object.keys(COLS)), hat: o.hat || R(Object.keys(HAT)), bag: o.bag || R(Object.keys(BAG)), dir: o.dir || R(Object.keys(DIR)), sex: o.sex || R(['m', 'f']), ph: o.ph != null ? o.ph : Math.floor(Math.random() * 999) });
  // the look-alike: same top and color (that is what everyone remembers), different in the details
  const lookalike = (p) => { const q = person({ top: p.top, col: p.col, sex: p.sex }); q.hat = R(Object.keys(HAT).filter((k) => k !== p.hat)); q.bag = R(Object.keys(BAG).filter((k) => k !== p.bag)); q.dir = p.dir === 'east' ? 'west' : 'east'; return q; };
  function spec(c) {
    const K = kindOf(c), cul = person({}), t0 = 10 + Math.floor(Math.random() * 6) * 2;
    const doors = shuffle(['cam', 'saw', 'nosy', 'none', 'nothing', 'none']).map((r, i) => ({ r, name: i % 2 ? R(SPOTS)[0] : (100 + i * 2 + Math.floor(Math.random() * 3) * 20) + ' ' + R(['Palm', 'Ibis', 'Cedar', 'Harbor']) + ' Ave' }));
    const w = shuffle(NAMES); const used = {}; doors.forEach((d) => { while (used[d.name]) d.name += ' B'; used[d.name] = 1; });
    return { base: (H.nowMin ? H.nowMin() : 840) - 50, k: KINDS.indexOf(K), cul, dec: lookalike(cul), win: [t0, t0 + 10], doors, w1: w[0], w2: w[1], lit: Math.random() < .5, seed: Math.random() };
  }

  // ---------- the footage: one frame per minute, 13:58 to 14:37 ----------
  const SPR = new Map(); // sprite per person, direction and step: drawn once, reused every frame you scrub
  function sprOf(p, d, ph) { const k = p.ph + p.col + p.top + p.hat + p.bag + d + ph; let s = SPR.get(k); if (s) return s;
    const D = fromLook({ sex: p.sex, top: p.top === 'tee' ? 'tee' : p.top, shirt: COLS[p.col], acc: 'none', ph: p.ph, pants: '#2f3a4a' });
    if (p.top === 'jacket') D.cols.top = COLS[p.col]; if (p.top === 'hoodie') D.hood = 1;
    delete D.hat; if (p.hat === 'cap') D.hat = { kind: 'cap' }; if (p.hat === 'beanie') D.hat = { kind: 'beanie' }; if (D.hat) { D.cols.hat = '#111827'; delete D.fem; }
    delete D.pack; delete D.bag; if (D.prop === 'bag') delete D.prop; if (p.bag === 'pack') { D.pack = 1; D.cols.pack = '#374151'; } if (p.bag === 'bag') { D.bag = 1; D.cols.strap = '#3b2a1c'; }
    s = sprite(D, d, ph, true); if (SPR.size > 80) SPR.clear(); SPR.set(k, s); return s; }
  let BACK = null; // the street behind the camera: painted once
  function backdrop(w, h) { if (BACK && BACK.width === w) return BACK; const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    g.fillStyle = '#3b4252'; g.fillRect(0, 0, w, h); g.fillStyle = '#4b5563'; for (let x = 0; x < w; x += 46) g.fillRect(x + 4, 8, 38, h * .5); // storefronts
    g.fillStyle = '#1f2937'; for (let x = 0; x < w; x += 46) g.fillRect(x + 14, h * .3, 16, h * .28); // doors
    g.fillStyle = '#9ca3af'; g.fillRect(0, h * .58, w, h * .18); g.fillStyle = '#6b7280'; for (let x = 0; x < w; x += 18) g.fillRect(x, h * .58, 1, h * .18); // sidewalk
    g.fillStyle = '#27272a'; g.fillRect(0, h * .76, w, h * .24); g.fillStyle = '#eab308'; for (let x = 0; x < w; x += 30) g.fillRect(x, h * .87, 14, 2);
    BACK = c; return c; }
  // who is in frame at minute m: [person, x 0..1]
  function inFrame(sp, m) { const out = [], walk = (p, at) => { const k = m - at; if (k < 0 || k > 3) return; const f = (k + .5) / 4; out.push([p, p.dir === 'east' ? f : 1 - f, k]); };
    walk(sp.cul, sp.win[0] + 3 + Math.floor(sp.seed * 4)); walk(sp.dec, sp.win[1] + 6 + Math.floor(sp.seed * 5)); walk(sp.extra || (sp.extra = person({ top: 'tee', bag: 'none', hat: 'none' })), 3 + Math.floor(sp.seed * 5)); return out; }
  function drawFrame(cv, sp, m) { CUR = sp; const g = cv.getContext('2d'), w = cv.width, h = cv.height; g.imageSmoothingEnabled = false; g.drawImage(backdrop(w, h), 0, 0);
    inFrame(sp, m).forEach(([p, x, k]) => { const s = sprOf(p, p.dir === 'east' ? 2 : 6, k % 4); const sc = h / 110; g.drawImage(s, x * w - 24 * sc, h * .78 - 61 * sc, 48 * sc, 64 * sc); });
    g.fillStyle = 'rgba(255,255,255,.06)'; for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1); // scan lines
    g.fillStyle = '#000a'; g.fillRect(4, 4, 92, 16); g.fillStyle = '#f8fafc'; g.font = '700 11px "Meridian Text",monospace'; g.fillText('CAM 2  ' + hmc(m) + ':' + String((m * 17) % 60).padStart(2, '0'), 8, 16);
    g.fillStyle = '#000a'; g.fillRect(w - 64, 4, 60, 16); g.fillStyle = '#f8fafc'; g.fillText('W', w - 58, 16); g.fillRect(w - 46, 11, 24, 1); g.fillText('E', w - 16, 16); }

  // ---------- the investigation itself ----------
  function run(c, cid, res, done, opt) {
    opt = opt || {}; const sp = c.inv = c.inv || spec(c); CUR = sp; const K = KINDS[sp.k] || KINDS[0], notes = [], cards = [], budget = { rec: opt.phone ? 1 : 3 };
    let knocks = 4, sep = null, asked = {}, camOpen = !!opt.phone, closed = false, tab = opt.phone ? 'cam' : 'wit', clip = null, chose = {};
    const rec = (les, re, stem, ok) => { if (budget.rec <= 0) return; const fid = factFor(les, re); if (!fid) return; budget.rec--; H.record({ id: 'inv:' + stem.slice(0, 18), les, fid, stem }, ok); res.n++; if (ok) res.right++; (res.qs = res.qs || []).push({ stem, ok, fact: H.factText(fid) }); };
    const note = (row, val, src, bad) => { if (!notes.some((n) => n.row === row && n.val === val && n.src === src)) notes.push({ row, val, src, bad: !!bad }); };
    H.openModal('<div class="sceneHead p2"><b>INVESTIGATION · ' + esc(c.where.toUpperCase()) + '</b><h2>' + esc(opt.phone ? 'A new lead' : 'Work the scene') + '</h2><p>' + esc(opt.phone ? opt.phone : 'Taken: ' + K.took + '. Dispatch puts it between ' + hmc(sp.win[0]) + ' and ' + hmc(sp.win[1]) + '. The suspect is gone. Find out who, and which way.') + '</p></div>' +
      '<div class="ivTabs" id="ivTabs"></div><div class="ivBody" id="ivBody"></div><div class="ivNotes" id="ivNotes"></div>' +
      '<div class="qAct"><button type="button" id="ivBolo">Write the BOLO</button><button type="button" class="ghost" id="ivLater">Wrap up for now</button></div>');
    document.body.classList.add('woOn'); const $ = (id) => document.getElementById(id), body = $('ivBody');
    const tabs = () => { $('ivTabs').innerHTML = (opt.phone ? [['cam', '📹 Their footage']] : [['wit', '🗣️ Witnesses'], ['door', '🚪 Canvass · ' + knocks + ' knocks left'], ['cam', camOpen ? '📹 Camera' : '🔒 No camera yet']]).map(([k, t]) => '<button type="button" data-t="' + k + '" class="' + (tab === k ? 'on' : '') + '"' + (k === 'cam' && !camOpen ? ' disabled' : '') + '>' + esc(t) + '</button>').join('');
      $('ivTabs').querySelectorAll('button').forEach((b) => { b.onclick = () => { tab = b.dataset.t; H.beep(); draw(); }; }); };
    const drawNotes = () => { $('ivNotes').innerHTML = notes.length ? '<small>What you have</small>' + notes.map((n) => '<span class="ivChip">' + esc(ROWS.find((r) => r[0] === n.row)[2][n.val]) + ' <em>' + esc(n.src) + '</em></span>').join('') : '<small>Nothing written down yet.</small>'; };
    const draw = () => { tabs(); drawNotes(); ({ wit, door, cam, bolo })[tab](); };
    // witnesses: separate them or not, then how you ask
    function wit() {
      if (sep === null) { body.innerHTML = '<p class="ivSay">' + esc(sp.w1) + ' (' + esc(K.wit.toLowerCase()) + ') and ' + esc(sp.w2) + ' (a passer-by) both saw someone near ' + esc(K.where) + '. They are already comparing notes.</p>' +
        ['Separate them and talk to each one alone', 'Talk to both together so it goes faster', 'Have them write it down together first'].map((t, i) => '<button type="button" class="woOpt" data-k="' + i + '">' + esc(t) + '</button>').join('');
        body.querySelectorAll('.woOpt').forEach((b) => { b.onclick = () => { sep = b.dataset.k === '0'; rec(4, /Separate everyone/i, 'Two witnesses saw the suspect. How do you take their statements?', sep); draw(); }; }); return; }
      const who = [[sp.w1, 'w1'], [sp.w2, 'w2']].filter((x) => !asked[x[1]]);
      if (!who.length) { body.innerHTML = '<p class="ivSay">' + (sep ? 'Two separate statements. Where they disagree, something else will have to settle it.' : 'Their stories match now. That is not the same as being right.') + '</p>'; return; }
      const [nm, k] = who[0], cp = sp.cul, he = cp.sex === 'f' ? 'she' : 'he', him = cp.sex === 'f' ? 'her' : 'him', color = k === 'w1' && sp.lit ? MIX[cp.col] : cp.col, wrong = R(Object.keys(COLS).filter((x) => x !== cp.col && x !== color));
      const opts = shuffle([['open', 'Tell me what you saw, start to finish'], ['lead', 'Was ' + he + ' wearing a ' + wrong + ' ' + TOP[cp.top].toLowerCase() + '?'], ['fast', 'Just give me the basics, I am short on time']]);
      body.innerHTML = '<p class="ivSay"><b>' + esc(nm) + '</b> ' + (k === 'w1' ? 'is still shaking.' : 'checks the time and waits.') + ' How do you ask?</p>' + opts.map(([o, t]) => '<button type="button" class="woOpt" data-o="' + o + '">' + esc(t) + '</button>').join('');
      body.querySelectorAll('.woOpt').forEach((b) => { b.onclick = () => { const o = b.dataset.o; asked[k] = o; if (k === 'w1') rec(4, /have each describe what happened, ask follow-up/i, 'A witness is ready to talk. How do you ask what they saw?', o === 'open');
        const tag = nm.split(' ').pop(); let say;
        if (o === 'lead') { say = 'A ' + wrong + ' one? ...Yeah. Yeah, I think so.'; note('col', wrong, tag, true); note('top', cp.top, tag); }
        else if (o === 'fast') { say = k === 'w1' ? 'A ' + TOP[cp.top].toLowerCase() + '. That is all I really saw.' : 'Went ' + cp.dir + '. Fast.'; if (k === 'w1') note('top', cp.top, tag); else note('dir', cp.dir, tag); }
        else if (k === 'w1') { say = (sep ? '' : 'Like ' + sp.w2 + ' said, ') + 'a ' + color + ' ' + TOP[cp.top].toLowerCase() + (cp.hat !== 'none' ? ', and a ' + HAT[cp.hat].toLowerCase() : '') + '. ' + (sp.lit ? 'It was under that orange streetlight, though.' : 'I got a good look.'); note('top', cp.top, tag); note('col', color, tag, color !== cp.col); if (cp.hat !== 'none') note('hat', cp.hat, tag); }
        else { const c2 = sep ? cp.col : color; say = 'I passed ' + him + ' on the sidewalk. ' + c2[0].toUpperCase() + c2.slice(1) + ', ' + (cp.bag === 'none' ? 'nothing in his hands' : 'a ' + BAG[cp.bag].toLowerCase()) + '. ' + he[0].toUpperCase() + he.slice(1) + ' went ' + cp.dir + ', toward the bus depot.'; note('col', c2, tag, c2 !== cp.col); note('bag', cp.bag, tag); note('dir', cp.dir, tag); }
        body.innerHTML = '<p class="ivSay"><b>' + esc(nm) + ':</b> “' + esc(say) + '”</p><button type="button" class="woOpt" id="ivCard">Give ' + esc(nm) + ' your card</button><button type="button" id="woNext">Next</button>';
        $('ivCard').onclick = () => { H.addContact('inv:' + nm, { name: nm, role: 'Witness, ' + c.where }); cards.push(nm); $('ivCard').disabled = true; }; $('woNext').onclick = draw; }; }); }
    // the canvass: six doors, four knocks before the trail goes cold
    function door() {
      body.innerHTML = '<p class="ivSay">The block around ' + esc(c.where) + '. You have time for ' + knocks + ' more ' + (knocks === 1 ? 'door' : 'doors') + '.</p><div class="ivDoors">' + sp.doors.map((d, i) => '<button type="button" class="ivDoor' + (d.k ? ' seen' : '') + '" data-i="' + i + '"' + (d.k || !knocks ? ' disabled' : '') + '><b>' + esc(d.name) + '</b><small>' + esc(d.k || (knocks ? 'Knock' : 'Out of time')) + '</small></button>').join('') + '</div><div id="ivDoorSay"></div>';
      body.querySelectorAll('.ivDoor').forEach((b) => { b.onclick = () => { const d = sp.doors[+b.dataset.i]; knocks--; H.beep(); const cp = sp.cul; let say, extra = '';
        if (d.r === 'cam') { say = 'My camera points at the street. Take a look, it keeps a week.'; d.k = 'Camera'; camOpen = true; }
        else if (d.r === 'saw') { say = 'Somebody cut through my yard around then. ' + (cp.bag === 'none' ? 'Empty-handed' : BAG[cp.bag]) + ', going ' + cp.dir + '.'; d.k = 'Saw something'; note('bag', cp.bag, d.name); note('dir', cp.dir, d.name); }
        else if (d.r === 'nosy') { const rc = R(['black', 'gray']); say = 'Everybody knows it is that kid from the end of the block. Always in a ' + rc + ' hoodie.'; d.k = 'A rumor'; note('top', 'hoodie', 'rumor', cp.top !== 'hoodie'); note('col', rc, 'rumor', rc !== cp.col); }
        else if (d.r === 'none') { say = 'Nobody answers. A newspaper sits on the mat.'; d.k = 'Nobody home'; extra = '<button type="button" class="woOpt" id="ivLeave">Leave your card in the door</button>'; }
        else { say = R(['Sorry, I was at work all day.', 'Didn\'t see a thing. My dog might have.', 'I had headphones in. Sorry, officer.']); d.k = 'Saw nothing'; }
        draw(); $('ivDoorSay').innerHTML = '<p class="ivSay"><b>' + esc(d.name) + ':</b> “' + esc(say) + '”</p>' + extra;
        if (extra) $('ivLeave').onclick = () => { cards.push(d.name); $('ivLeave').disabled = true; $('ivLeave').textContent = 'Card left'; }; }; }); }
    // the footage: scrub to the minute, clip who you think it is
    function cam() {
      body.innerHTML = '<p class="ivSay">' + (opt.phone ? 'They send you the clip.' : 'The camera covers the sidewalk.') + ' Dispatch said ' + hmc(sp.win[0]) + ' to ' + hmc(sp.win[1]) + '.</p><canvas class="ivCam" id="ivCam" width="320" height="150"></canvas><input type="range" class="ivScrub" id="ivScrub" min="0" max="39" value="' + (clip != null ? clip : 0) + '"><div class="ivCamRow"><span id="ivTime"></span><button type="button" id="ivClip">Clip this frame</button></div><div id="ivClipSay"></div>';
      const cv = $('ivCam'), sc = $('ivScrub'), show = () => { const m = +sc.value; drawFrame(cv, sp, m); $('ivTime').textContent = hmc(m); $('ivClip').disabled = !inFrame(sp, m).length; };
      sc.oninput = show; show();
      $('ivClip').onclick = () => { const m = +sc.value, f = inFrame(sp, m); if (!f.length) return; const p = (f.find((x) => x[0] === sp.cul) || f.find((x) => x[0] === sp.dec) || f[0])[0]; clip = m; const tag = 'camera ' + hmc(m);
        ['top', 'col', 'hat', 'bag', 'dir'].forEach((r) => note(r, p[r], tag, p[r] !== sp.cul[r])); sp.clipped = p === sp.cul ? 'cul' : p === sp.dec ? 'dec' : 'x';
        $('ivClipSay').innerHTML = '<p class="ivSay">Clipped at ' + hmc(m) + '. ' + (m < sp.win[0] || m > sp.win[1] ? 'That is outside the window dispatch gave you.' : 'That is inside the window.') + '</p>'; drawNotes(); }; }
    // the BOLO: one answer per line, from what you have (or unknown)
    function bolo() {
      body.innerHTML = '<p class="ivSay">What goes out to every unit. Only send what you can stand behind.</p>' + ROWS.map(([r, lab, V]) => { const seen = [...new Set(notes.filter((n) => n.row === r).map((n) => n.val))];
        return '<label class="ivRow"><span>' + lab + '</span><select data-r="' + r + '"><option value="">Unknown</option>' + seen.map((v) => '<option value="' + v + '"' + (chose[r] === v ? ' selected' : '') + '>' + esc(V[v]) + ' (' + esc(notes.filter((n) => n.row === r && n.val === v).map((n) => n.src).join(', ')) + ')</option>').join('') + '</select></label>'; }).join('') + '<button type="button" id="ivSend">Send the BOLO to dispatch</button>';
      body.querySelectorAll('select').forEach((s) => { s.onchange = () => { chose[s.dataset.r] = s.value; }; });
      $('ivSend').onclick = () => finish(true); }
    function finish(sent) { if (closed) return; closed = true; document.body.classList.remove('woOn'); H.closeModal();
      const picks = sent ? Object.entries(chose).filter(([, v]) => v) : [], right = picks.filter(([r, v]) => sp.cul[r] === v).length, wrong = picks.length - right;
      if (sent) rec(4, /A BOLO should include as much as possible/i, 'You are sending a BOLO. What goes in it?', picks.length >= 3 && !wrong);
      const out = wrong ? 'wrong' : right >= 4 || (right >= 3 && sp.clipped === 'cul') ? 'solved' : 'open';
      sp.out = out; sp.right = right; sp.wrong = wrong; sp.cards = cards; c.invRow = ['🔎', 'Investigation', out === 'solved' ? 10 : out === 'open' ? Math.min(6, 2 + right) : 2, 10, out === 'solved' ? 'Your BOLO found them' : out === 'wrong' ? 'Your BOLO stopped the wrong person' : right ? 'Not enough to find them yet' : 'The trail went cold'];
      H.caseNote(c.title + ' at ' + c.where + ': ' + (notes.length ? notes.map((n) => n.src + ' said ' + ROWS.find((r) => r[0] === n.row)[2][n.val].toLowerCase()).join('; ') : 'no leads') + '. BOLO: ' + (picks.length ? picks.map(([r, v]) => ROWS.find((x) => x[0] === r)[2][v].toLowerCase()).join(', ') : 'none sent') + '.');
      if (out === 'open' && !opt.phone) H.coldAdd(c, sp); done(out); }
    $('ivBolo').onclick = () => { tab = 'bolo'; draw(); }; $('ivLater').onclick = () => finish(false);
    draw();
  }
  // how it ended, in place of the call's usual ending (callvoice.js)
  function ending(c, cid) { const sp = c.inv || {}; CUR = sp; const o = sp.out || 'open', K = KINDS[sp.k] || KINDS[0], u = R(['2-Bravo-7', '1-Charlie-3', '3-Delta-9']);
    const line = o === 'solved' ? u + ' stops someone matching your BOLO two blocks ' + sp.cul.dir + '. ' + (sp.cul.sex === 'f' ? 'She' : 'He') + ' still has ' + K.took + (sp.cul.bag !== 'none' ? ', in the ' + BAG[sp.cul.bag].toLowerCase() + '.' : '.')
      : o === 'wrong' ? u + ' stops someone who matches your BOLO. They were at work all afternoon, and their manager says so. They are not happy, and they are right.'
      : 'You file the report. Without more to go on, the case stays open.' + (sp.cards && sp.cards.length ? ' Your card is with ' + sp.cards.length + (sp.cards.length > 1 ? ' people.' : ' person.') : '');
    c.ended = { good: o === 'solved', line, read: o !== 'wrong' }; return [['narr', line]]; }
  return { fits, run, ending, KINDS, spec, inFrame };
}

// cold cases: open investigations wait for a call back from someone you left a card with
export function installColdCases(H, INV) {
  const S = H.S; let t = 240 + Math.random() * 200;
  const list = () => (S.cold = S.cold || []);
  function add(c, sp) { const L = list(), myst = Math.random() < .3 ? ODD[Math.floor(Math.random() * ODD.length)] : null;
    L.push({ t: c.title, w: c.where, d: H.did(), at: Date.now(), sp: { base: sp.base, k: sp.k, cul: sp.cul, dec: sp.dec, win: sp.win, seed: sp.seed, doors: [], w1: sp.w1, w2: sp.w2 }, cards: (sp.cards || []).slice(0, 4), myst, done: 0 }); if (L.length > 12) L.shift();
    H.caseNote('Open case: ' + c.title + ' at ' + c.where + '.' + (myst ? ' Left behind: ' + myst + '.' : '')); H.stat('invOpen'); }
  // every few minutes on duty, someone who has your card may call with the piece you were missing
  function tick(dt) { if (!H.ready()) return; t -= dt; if (t > 0) return; t = 300 + Math.random() * 240;
    const C = list().filter((x) => !x.done && !x.myst && x.cards.length && Date.now() - x.at > 60000); if (!C.length) return; const k = C[Math.floor(Math.random() * C.length)], who = k.cards[Math.floor(Math.random() * k.cards.length)];
    const id = H.sayAs('coldcall', { name: who, icon: '📱', role: 'Calling your work cell' });
    H.dialogue([['narr', 'Your work cell buzzes. A number you do not know.'], [id, 'Officer? You left your card. It is about ' + k.t.toLowerCase() + ', back at ' + k.w + '. My camera caught something. Want to see it?'],
      ['choice', [{ t: 'Ask them to send you the clip', reply: [['wait', (res, resume) => { const c = { title: k.t, where: k.w, inv: Object.assign({}, k.sp, { doors: [] }) };
        INV.run(c, id, res, (out) => { k.done = out === 'solved' ? 1 : 0; if (k.done) { H.award(60, 'Cold case closed'); H.stat('invCold'); H.caseNote('Closed: ' + k.t + ' at ' + k.w + ', from a clip a resident sent.'); H.toast('🗂️ Cold case closed: ' + k.t + '.'); } resume(); }, { phone: who + ' sends you the clip from that afternoon. Same time window as before.' }); }]] },
        { t: 'Thank them, and say you will pass it to detectives', reply: [['narr', 'You forward it with a note. Someone else will close it, maybe.']], fx: () => { k.done = 2; } }]]], null, { kicker: 'WORK CELL' }); }
  return { add, tick, list, why: () => H.ready() };
}
