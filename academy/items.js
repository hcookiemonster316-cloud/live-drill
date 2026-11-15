// Items: found on the street or earned on calls. Mostly for laughs; a few do something small.
// kind: 'keep' (collectible), 'use' (consumable with a short effect) or 'wear' (flair other cadets can see).
export const RARITY = {
  c: { name: 'Standard Issue', color: '#9ca3af', glow: '156,163,175', w: 60, notes: [523, 659] },
  u: { name: 'Squared Away', color: '#22c55e', glow: '34,197,94', w: 27, notes: [523, 659, 784] },
  r: { name: 'Inspection Ready', color: '#3b82f6', glow: '59,130,246', w: 10, notes: [523, 659, 784, 1047] },
  l: { name: 'Academy Legend', color: '#f5b800', glow: '245,184,0', w: 3, notes: [392, 523, 659, 784, 1047, 1319] }
};
export const ITEMS = [
  // Standard Issue
  { id: 'pocket', r: 'c', icon: '👖', name: 'A Dropped Pocket', kind: 'keep', text: 'One pocket flap, unbuttoned. Your instructor spotted it from across the parking lot. Your instructor spots everything.' },
  { id: 'highlighter', r: 'c', icon: '🖍️', name: 'Half-Dead Highlighter', kind: 'keep', text: 'Every line of Chapter 5 is now yellow. Every. Single. Line. Highlighting has lost all meaning.' },
  { id: 'lint', r: 'c', icon: '🧻', name: 'Emergency Lint Roller', kind: 'keep', text: 'For the 0559 realization that your uniform is 40% dog hair.' },
  { id: 'granola', r: 'c', icon: '🍫', name: 'Mystery Granola Bar', kind: 'use', effect: 'morale', text: 'Found at the bottom of your duty bag. Expiration date: yes.', useText: 'Tastes like cardboard and determination. Morale +1. Everything else +0.' },
  { id: 'seeds', r: 'c', icon: '🌻', name: 'Sunflower Seeds', kind: 'keep', text: 'Official fuel of long patrols. The shells in the cupholder are now evidence.' },
  { id: 'coffee', r: 'c', icon: '☕', name: 'Gas Station Coffee', kind: 'use', effect: 'coffee', text: 'Brewed at some point this week. Tastes like burnt hope. Works anyway.', useText: 'Caffeinated: your next call waits an extra hour for you.' },
  { id: 'vest', r: 'c', icon: '🦺', name: 'Reflective Vest, Size XXXL', kind: 'wear', text: 'The only size left in the supply closet. You are now visible from space.' },
  { id: 'pen', r: 'c', icon: '🖊️', name: 'Pen That Actually Works', kind: 'keep', text: 'In a world of dead pens, one writes on the first try. Guard it with your life. Someone will ask to borrow it.' },
  // Squared Away
  { id: 'shake', r: 'u', icon: '🥤', name: 'Pumpkin Spice Protein Shake', kind: 'use', effect: 'shake', text: 'Forty-two grams of protein, one autumn candle of flavor and a single tiny regret.', useText: 'Pumpkin rush: you move 25% faster for the next three hours of your shift.' },
  { id: 'gig', r: 'u', icon: '📏', name: 'A Perfect Gig Line', kind: 'keep', text: 'Shirt seam, belt buckle and zipper in one flawless line. Geometry teachers weep.' },
  { id: 'phonetic', r: 'u', icon: '🪪', name: 'Laminated Phonetic Card', kind: 'keep', text: 'Adam, Boy, Charles, David... You will recite these in your sleep. Your family has noticed.' },
  { id: 'batteries', r: 'u', icon: '🔋', name: 'Fresh Flashlight Batteries', kind: 'use', effect: 'light', text: 'Not the ones from the junk drawer. Real ones. Still in the package.', useText: 'Bright idea: your light reaches 50% farther for the rest of this shift.' },
  { id: 'clipboard', r: 'u', icon: '📋', name: 'Clipboard of Authority', kind: 'wear', text: 'Carry it, walk with purpose and nobody will ever ask what you are doing here.' },
  { id: 'creases', r: 'u', icon: '👔', name: 'Razor-Sharp Creases', kind: 'keep', text: 'Starched so hard the shirt can stand at attention without you.' },
  // Inspection Ready
  { id: 'brass', r: 'r', icon: '✨', name: 'Mirror-Finish Brass', kind: 'wear', text: 'Polished until it reflects your entire life story. Mostly the part where you were polishing brass.' },
  { id: 'nod', r: 'r', icon: '🫡', name: "The Instructor's Approving Nod", kind: 'keep', text: 'Witnessed exactly once. Never confirmed. Might have been a sneeze. You are keeping it anyway.' },
  { id: 'pushup', r: 'r', icon: '💪', name: 'The Golden Push-Up', kind: 'keep', text: 'Chest to the deck, full lockout, zero sag. Nobody was watching. Of course nobody was watching.' },
  { id: 'report', r: 'r', icon: '📝', name: 'The Report With No Typos', kind: 'keep', text: 'Spellcheck had nothing to say. Your sergeant had nothing to say. A historic day.' },
  // Academy Legend
  { id: 'boots', r: 'l', icon: '🥾', name: 'Unnaturally Shiny Boots', kind: 'wear', text: 'Shined past the point of physics. Birds land on them thinking they are lakes. Every cadet nearby can see them sparkle.' },
  { id: 'dingle', r: 'l', icon: '🔔', name: 'A Dingle Dingle', kind: 'keep', text: 'Nobody can explain exactly what it is. Everybody knows exactly when it happens.' },
  { id: 'pot', r: 'l', icon: '🫖', name: 'The Coffee Pot That Never Empties', kind: 'use', effect: 'pot', reuse: true, text: 'Passed down from class to class. Nobody has ever seen it get refilled. Nobody asks.', useText: 'Bottomless: your next call waits an extra hour, again, forever.' },
  { id: 'cert', r: 'l', icon: '🎓', name: 'Laminated Certificate (Practice Copy)', kind: 'keep', text: 'Not the real one. The real one comes after State. This one is for believing in yourself.' }
];
export const itemById = (id) => ITEMS.find((x) => x.id === id);

// pick a rarity; min raises the floor ('r' means rare or better), and a dry streak of 9 guarantees rare or better
export function roll(S, min) {
  const order = ['c', 'u', 'r', 'l'], floor = order.indexOf(min || 'c'), dry = (S.dry || 0) >= 9 ? 2 : 0, from = Math.max(floor, dry);
  const pool = order.slice(from); let t = Math.random() * pool.reduce((a, k) => a + RARITY[k].w, 0), r = pool[0];
  for (const k of pool) { t -= RARITY[k].w; if (t <= 0) { r = k; break; } }
  S.dry = order.indexOf(r) >= 2 ? 0 : (S.dry || 0) + 1;
  const list = ITEMS.filter((x) => x.r === r), owned = list.filter((x) => !(S.items || {})[x.id]);
  const pickFrom = owned.length && Math.random() < .7 ? owned : list; // new things first, mostly
  return pickFrom[Math.floor(Math.random() * pickFrom.length)];
}

// ---------- the grand reveal ----------
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function reveal(item, where, opts) {
  opts = opts || {};
  return new Promise((done) => {
    const R = RARITY[item.r], isNew = !!opts.isNew, el = document.createElement('div');
    el.className = 'rv rv-' + item.r; el.style.setProperty('--rc', R.color); el.style.setProperty('--rg', R.glow);
    el.innerHTML = '<canvas class="rvFx"></canvas><div class="rvRays"></div><div class="rvStage">' +
      '<div class="rvFrom">' + esc(where) + '</div>' +
      '<div class="rvBag"><span>' + (item.r === 'l' ? '🎁' : '🛍️') + '</span><i>EVIDENCE</i></div>' +
      '<div class="rvItem"><div class="rvIcon">' + item.icon + '<b class="rvShine"></b></div>' +
      '<div class="rvTier">' + (isNew ? '<em>NEW</em>' : '') + esc(R.name) + '</div><h2>' + esc(item.name) + '</h2><p>' + esc(item.text) + '</p>' +
      '<div class="rvBtns">' + (item.kind === 'use' ? '<button type="button" data-a="use">Use it now</button>' : item.kind === 'wear' ? '<button type="button" data-a="wear">Wear it</button>' : '') + '<button type="button" data-a="keep" class="' + (item.kind === 'keep' ? '' : 'ghost') + '">' + (item.kind === 'keep' ? 'Into the locker' : 'Save for later') + '</button></div></div>' +
      '<div class="rvSkip">Tap to open</div></div>';
    document.body.appendChild(el);
    const fx = el.querySelector('.rvFx'), g = fx.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => { fx.width = innerWidth * dpr; fx.height = innerHeight * dpr; }; size();
    let parts = [], raf = 0, stage = 0, t0 = performance.now();
    const burst = () => {
      const n = { c: 60, u: 90, r: 140, l: 240 }[item.r], cols = item.r === 'l' ? ['#f5b800', '#fff3b0', '#ffffff', '#ff9f1a'] : [R.color, '#ffffff', '#f5b800'];
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = (4 + Math.random() * 10) * dpr; parts.push({ x: fx.width / 2, y: fx.height * .42, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4 * dpr, s: (3 + Math.random() * 5) * dpr, c: cols[i % cols.length], r: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 1 }); }
    };
    const loop = () => {
      g.clearRect(0, 0, fx.width, fx.height);
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += .25 * dpr; p.vx *= .985; p.r += p.vr; p.life -= .008; g.save(); g.globalAlpha = Math.max(0, p.life); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); });
      parts = parts.filter((p) => p.life > 0 && p.y < fx.height + 40);
      if (item.r === 'l' && stage === 2 && Math.random() < .3) parts.push({ x: Math.random() * fx.width, y: -10, vx: 0, vy: 2 * dpr, s: 4 * dpr, c: '#f5b800', r: 0, vr: .1, life: 1.4 });
      raf = requestAnimationFrame(loop);
    };
    loop();
    const open = () => {
      if (stage) return; stage = 1; el.classList.add('open'); burst(); if (opts.sound) opts.sound(R.notes);
      setTimeout(() => { stage = 2; el.classList.add('shown'); if (item.r === 'l') burst(); }, 450);
    };
    // the bag shakes and glows, then bursts open on its own or on a tap
    setTimeout(() => el.classList.add('in'), 20);
    const auto = setTimeout(open, { c: 1100, u: 1400, r: 1800, l: 2600 }[item.r]);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) { clearTimeout(auto); open(); return; }
      if (stage < 2) return;
      cancelAnimationFrame(raf); el.classList.add('out'); setTimeout(() => el.remove(), 250); done(b.dataset.a);
    });
  });
}

// ---------- the locker ----------
export function lockerHTML(S) {
  const have = S.items || {}, total = ITEMS.length, got = ITEMS.filter((x) => have[x.id]).length;
  return '<div class="sceneHead"><b>YOUR LOCKER</b><h2>' + got + ' of ' + total + ' found</h2><p>Earn items on calls, from citizens and from anything that looks off. Some are hidden around each district: look for the sparkle.</p></div>' +
    ['l', 'r', 'u', 'c'].map((r) => '<div class="lkTier" style="--rc:' + RARITY[r].color + '">' + RARITY[r].name + '</div><div class="lkGrid">' + ITEMS.filter((x) => x.r === r).map((x) => {
      const n = have[x.id] || 0; return '<button type="button" class="lkItem' + (n ? '' : ' none') + (S.flair === x.id ? ' worn' : '') + '" data-i="' + x.id + '" style="--rc:' + RARITY[r].color + '"' + (n ? '' : ' disabled') + '><span>' + (n ? x.icon : '❔') + '</span><b>' + (n ? esc(x.name) : '???') + '</b>' + (n > 1 ? '<i>×' + n + '</i>' : '') + (S.flair === x.id ? '<i class="w">WORN</i>' : '') + '</button>';
    }).join('') + '</div>').join('');
}
