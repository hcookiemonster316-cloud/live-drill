// Items: found on the street, inside buildings and earned on calls.
// Ranks (rarity) from most common to rarest. Gear goes in a limited set of equipment slots and carries perks.
export const RARITY = {
  c: { name: 'Standard Issue', short: 'I', color: '#9ca3af', glow: '156,163,175', w: 55, notes: [523, 659] },
  u: { name: 'Squared Away', short: 'II', color: '#22c55e', glow: '34,197,94', w: 26, notes: [523, 659, 784] },
  r: { name: 'Inspection Ready', short: 'III', color: '#3b82f6', glow: '59,130,246', w: 12, notes: [523, 659, 784, 1047] },
  e: { name: 'Honor Guard', short: 'IV', color: '#a855f7', glow: '168,85,247', w: 5, notes: [440, 554, 659, 880, 1109] },
  l: { name: 'Academy Legend', short: 'V', color: '#f5b800', glow: '245,184,0', w: 2, notes: [392, 523, 659, 784, 1047, 1319] }
};
export const ORDER = ['c', 'u', 'r', 'e', 'l'];
// the cadet outfit: everybody has these; pick one in the locker or at roll call
export const OUTFITS = {
  std: { name: 'Academy Standard', icon: '👔', kit: { shirt: '#1f2f50', pants: '#111827', hat: 'cap', hatCol: '#111827', patch: '#f5b800', boots: '#0b0b0b' }, perk: { rap: 1 }, text: 'Ironed academy polo, ironed BDU pants, shined boots, belt, name tag and the baseball cap.' },
  pt: { name: 'Academy PT', icon: '🏃', kit: { shirt: '#9ca3af', pants: '#111827', shorts: true, socks: '#111', hat: 'none', boots: '#e5e7eb', camelbak: true }, perk: { speed: 10 }, text: 'PT shirt (tucked), PT shorts, PT shoes, all-black ankle socks and a full CamelBak with your agency ID inside.' },
  grey: { name: 'Grey Polo (Car Kit)', icon: '🚗', kit: { shirt: '#6b7280', pants: '#111827', hat: 'none', patch: '#f5b800', boots: '#0b0b0b' }, perk: { com: 1 }, text: 'The backup grey polo from your car. For the day the coffee wins.' },
  unit: { name: 'Specialty Unit Kit', icon: '⭐', kit: null, perk: {}, text: 'Your specialty unit\'s training uniform.' }
};
// equipment slots: limited, and two of them open up as you rank up (RP needed)
export const SLOTS = [
  { id: 'cover', name: 'Cover', icon: '🧢', need: 0, hint: 'Headwear' },
  { id: 'uniform', name: 'Uniform', icon: '👔', need: 0, hint: 'Shirt, vest, brass' },
  { id: 'boots', name: 'Boots', icon: '🥾', need: 0, hint: 'Footwear' },
  { id: 'belt', name: 'Duty Belt', icon: '🔦', need: 600, hint: 'Opens at Squad Leader 3' },
  { id: 'carry', name: 'Pocket & Carry', icon: '🎒', need: 3000, hint: 'Opens at Guide' }
];
// perk keys: stat bonuses (res per rap com tac), speed/drive/light (%), spot/secret/explore (tiles),
// loot (% item chance), wait (game minutes a call waits), rpCall/rpCit/rpStudy (% more RP)
export const PERK_TEXT = {
  res: (v) => (v > 0 ? '+' : '') + v + ' Response', per: (v) => (v > 0 ? '+' : '') + v + ' Perception', rap: (v) => (v > 0 ? '+' : '') + v + ' Rapport', com: (v) => (v > 0 ? '+' : '') + v + ' Composure', tac: (v) => (v > 0 ? '+' : '') + v + ' Tactics',
  speed: (v) => '+' + v + '% walking speed', drive: (v) => '+' + v + '% driving speed', light: (v) => '+' + v + '% flashlight reach',
  spot: (v) => 'Spot trouble ' + v + ' tile' + (v === 1 ? '' : 's') + ' farther', secret: (v) => 'Sense secret spots ' + v + ' tiles farther', explore: (v) => 'Map ' + v + ' more tile' + (v === 1 ? '' : 's') + ' around you',
  loot: (v) => '+' + v + '% chance to find items', wait: (v) => 'Calls wait ' + v + ' more minutes', rpCall: (v) => '+' + v + '% RP from calls', rpCit: (v) => '+' + v + '% RP from citizens', rpStudy: (v) => '+' + v + '% RP from study points'
};
export const ITEMS = [
  // ---- cover ----
  { id: 'cap', r: 'c', icon: '🧢', name: 'Academy Baseball Cap', slot: 'cover', look: { hat: 'cap', hatCol: '#111827' }, perk: { com: 1 }, text: 'Issued. Slightly crushed from riding in the duty bag. Still regulation.' },
  { id: 'sweatband', r: 'c', icon: '🎽', name: 'Sweatband of Determination', slot: 'cover', look: { hat: 'sweatband', hatCol: '#d22d3d' }, perk: { speed: 5 }, text: 'Worn during every PT run. Has absorbed things no one should talk about.' },
  { id: 'reflectcap', r: 'u', icon: '🧢', name: 'Reflective Night Cap', slot: 'cover', look: { hat: 'cap', hatCol: '#d4ff3a' }, perk: { light: 15, per: 1 }, text: 'Bright enough that moths file complaints.' },
  { id: 'boonie2', r: 'r', icon: '👒', name: 'Boonie Hat of the Bayou', slot: 'cover', look: { hat: 'boonie', hatCol: '#556b2f' }, perk: { spot: 1, per: 1, explore: 1 }, text: 'Smells like swamp and adventure. Mostly swamp.' },
  { id: 'campaign', r: 'e', icon: '🤠', name: 'Campaign Hat, Perfectly Blocked', slot: 'cover', look: { hat: 'campaign', hatCol: '#7a5a3a' }, perk: { com: 1, tac: 1, wait: 15 }, text: 'Four perfect dents. Brim level with the horizon. Cadets straighten up when they see it.' },
  { id: 'drillhat', r: 'l', icon: '🎩', name: "The Instructor's Campaign Hat", slot: 'cover', look: { hat: 'campaign', hatCol: '#3d2a14', glow: true }, perk: { com: 2, tac: 1, rpCall: 15 }, text: 'Somehow it is louder than the instructor. It does not need to say anything. You already did push-ups.' },
  // ---- uniform ----
  { id: 'vest', r: 'c', icon: '🦺', name: 'Reflective Vest, Size XXXL', slot: 'uniform', look: { vest: 'xxxl' }, perk: { light: 10, spot: 1 }, text: 'The only size left in the supply closet. You are now visible from space.' },
  { id: 'nametag', r: 'c', icon: '🏷️', name: 'Name Tag, Perfectly Centered', slot: 'uniform', perk: { rap: 1 }, text: 'Measured with a ruler. Twice. The instructor checked it with a ruler. Three times.' },
  { id: 'poncho', r: 'c', icon: '🌧️', name: 'Issued Poncho', slot: 'uniform', look: { poncho: true }, perk: { explore: 1, com: 1 }, text: 'Keeps you dry. Makes you look like a very sad green tent.' },
  { id: 'stays', r: 'u', icon: '📎', name: 'Four Shirt Stays', slot: 'uniform', perk: { com: 1, rpCall: 5 }, text: 'They pinch. They pull. Your shirt has never been this tucked in its life.' },
  { id: 'creases', r: 'u', icon: '👔', name: 'Razor-Sharp Creases', slot: 'uniform', perk: { rap: 1, rpCit: 10 }, text: 'Starched so hard the shirt can stand at attention without you.' },
  { id: 'gig', r: 'u', icon: '📏', name: 'A Perfect Gig Line', slot: 'uniform', perk: { com: 1, rpCall: 5 }, text: 'Shirt seam, belt buckle and zipper in one flawless line. Geometry teachers weep.' },
  { id: 'brass', r: 'r', icon: '✨', name: 'Mirror-Finish Brass', slot: 'uniform', look: { brass: true }, perk: { rap: 1, tac: 1 }, text: 'Polished until it reflects your entire life story. Mostly the part where you were polishing brass.' },
  { id: 'classa', r: 'e', icon: '🎖️', name: 'Class A Uniform, Freshly Pressed', slot: 'uniform', look: { brass: true, cord: '#c0c0c0' }, perk: { rap: 1, com: 1, rpCall: 10, rpCit: 10 }, text: 'For graduations, funerals and the one day the chief walks through. Lint fears it.' },
  { id: 'cord', r: 'l', icon: '🏅', name: 'The Honor Graduate Cord', slot: 'uniform', look: { cord: '#f5b800', brass: true }, perk: { res: 1, per: 1, rap: 1, com: 1, tac: 1, loot: 10 }, text: 'Gold, braided and earned. Every instructor nods at you now. Several of them mean it.' },
  // ---- boots ----
  { id: 'brokenin', r: 'c', icon: '👞', name: 'Finally Broken-In Boots', slot: 'boots', perk: { speed: 5 }, text: 'Six weeks of blisters. Worth it. Do not ask about week three.' },
  { id: 'bootbands', r: 'c', icon: '🔗', name: 'Boot Bands (Pair)', slot: 'boots', perk: { com: 1, speed: 3 }, text: 'Your BDU pants are now bloused to perfection. Mostly. One leg is winning.' },
  { id: 'runners', r: 'u', icon: '👟', name: 'Running Shoes (Not Regulation)', slot: 'boots', look: { boots: '#e5e7eb' }, perk: { speed: 14, com: -1 }, text: 'Very fast. Very comfortable. Very much noticed by the instructor.' },
  { id: 'wetboots', r: 'u', icon: '🥾', name: 'Actually Waterproof Boots', slot: 'boots', perk: { speed: 6, explore: 1 }, text: 'The label said waterproof. For once, the label was right.' },
  { id: 'spitshine', r: 'r', icon: '🥾', name: 'Spit-Shined Boots', slot: 'boots', look: { shine: 1 }, perk: { speed: 8, rap: 1 }, text: 'Two hours, one cotton ball, a lighter and a lot of patience.' },
  { id: 'boots', r: 'l', icon: '🥾', name: 'Unnaturally Shiny Boots', slot: 'boots', look: { shine: 3 }, perk: { speed: 12, rap: 2, light: 15 }, text: 'Shined past the point of physics. Birds land on them thinking they are lakes. They light up dark alleys.' },
  // ---- duty belt ----
  { id: 'flashlight', r: 'c', icon: '🔦', name: 'Spare Flashlight', slot: 'belt', perk: { light: 20 }, text: 'The batteries are from the junk drawer. It flickers with personality.' },
  { id: 'keepers', r: 'u', icon: '🪢', name: 'Utility Belt, Inner Belt and Four Straps', slot: 'belt', perk: { tac: 1, rpCall: 5 }, text: 'Inner belt on, utility belt over it, all four belt straps snapped. Nothing jingles. Nothing.' },
  { id: 'earpiece', r: 'u', icon: '🎧', name: 'Radio Ear Piece', slot: 'belt', perk: { per: 1, wait: 10 }, text: 'Dispatch, now directly inside your skull. Very calming. Mostly.' },
  { id: 'firstaid', r: 'u', icon: '🩹', name: 'First Aid Bag', slot: 'belt', perk: { rap: 1, wait: 15 }, text: 'Gauze, gloves, bandages and a tiny pair of scissors that cannot cut anything.' },
  { id: 'radiokit', r: 'r', icon: '📡', name: 'Radio, Two Batteries and the Antenna', slot: 'belt', perk: { com: 1, tac: 1, wait: 20 }, text: 'The complete set. Nobody in your class has had all three at the same time. Until today.' },
  { id: 'radio', r: 'u', icon: '📻', name: 'Radio with a Fresh Battery', slot: 'belt', perk: { com: 1, wait: 10 }, text: 'Fully charged at the start of shift. A rare and beautiful thing.' },
  { id: 'tacflash', r: 'r', icon: '🔦', name: 'Tactical Flashlight', slot: 'belt', perk: { light: 40, per: 1 }, text: 'Bright enough to find car keys on the moon.' },
  { id: 'goldkeeper', r: 'e', icon: '🔗', name: 'The Golden Keeper', slot: 'belt', perk: { tac: 2, rpCall: 15 }, text: 'Legend says it has never come unsnapped. Not once. Not even during PT.' },
  // ---- pocket & carry ----
  { id: 'pen', r: 'c', icon: '🖊️', name: 'The Issued Pen', slot: 'carry', perk: { rpStudy: 10 }, text: 'The one pen you are allowed to use. Lose it and you get to explain why, in writing, with a different pen.' },
  { id: 'pocket', r: 'c', icon: '👖', name: 'A Dropped Pocket', slot: 'carry', perk: { loot: 3 }, text: 'One pocket flap, unbuttoned. Your instructor spotted it from across the parking lot. Your instructor spots everything.' },
  { id: 'notebook', r: 'c', icon: '📓', name: 'Two Notepads (Legal Pad and Notebook)', slot: 'carry', perk: { rpStudy: 5, explore: 1 }, text: 'One for notes. One for notes about the notes. Half of it is doodles of the instructor.' },
  { id: 'camelbak', r: 'u', icon: '🎒', name: 'Full CamelBak (Agency ID Inside)', slot: 'carry', look: { camelbak: true }, perk: { speed: 6, com: 1 }, text: 'Hydrated and identified. Lose it and you lose your ID. Do not lose it.' },
  { id: 'rsa', r: 'u', icon: '🔢', name: 'The RSA Token', slot: 'carry', perk: { rpStudy: 15 }, text: 'Six numbers that change every sixty seconds. You will type it wrong twice. Everyone does.' },
  { id: 'laptop', r: 'r', icon: '💻', name: 'Laptop, Charger AND Mouse', slot: 'carry', perk: { rpStudy: 20, per: 1 }, text: 'All three. Same bag. Same day. The instructors are speechless.' },
  { id: 'textbooks', r: 'e', icon: '📚', name: 'Both Textbooks', slot: 'carry', perk: { rpStudy: 30, rpCall: 10, speed: -5 }, text: 'Heavy enough to count as PT. Smart enough to count as studying.' },
  { id: 'carkit', r: 'r', icon: '🚗', name: 'The Backup Kit in Your Car', slot: 'carry', perk: { com: 2 }, text: 'Grey polo, two PT shirts, BDU pants, PT shorts, both kinds of black socks. Spill whatever you want.' },
  { id: 'phonetic', r: 'u', icon: '🪪', name: 'Laminated Phonetic Card', slot: 'carry', perk: { com: 1, wait: 10 }, text: 'Adam, Boy, Charles, David... You will recite these in your sleep. Your family has noticed.' },
  { id: 'clipboard', r: 'u', icon: '📋', name: 'Clipboard of Authority', slot: 'carry', look: { clipboard: true }, perk: { rap: 1, secret: 1 }, text: 'Carry it, walk with purpose and nobody will ever ask what you are doing here.' },
  { id: 'coin', r: 'r', icon: '🪙', name: 'Lucky Challenge Coin', slot: 'carry', perk: { loot: 8, rap: 1 }, text: 'Slap it on the table and somebody owes you a coffee. Those are the rules.' },
  { id: 'nod', r: 'e', icon: '🫡', name: "The Instructor's Approving Nod", slot: 'carry', perk: { com: 2, rpCall: 10 }, text: 'Witnessed exactly once. Might have been a sneeze. You carry it with you anyway.' },
  { id: 'dingle', r: 'l', icon: '🔔', name: 'A Dingle Dingle', slot: 'carry', perk: { loot: 15, secret: 2, rpCall: 5, rpCit: 5, rpStudy: 5 }, text: 'Nobody can explain exactly what it is. Everybody knows exactly when it happens.' },
  // ---- use (one shot) ----
  { id: 'granola', r: 'c', icon: '🍫', name: 'Mystery Granola Bar', kind: 'use', effect: 'morale', text: 'Found at the bottom of your duty bag. Expiration date: yes.', useText: 'Tastes like cardboard and determination. Morale +1. Everything else +0.' },
  { id: 'lunchbox', r: 'c', icon: '🍱', name: 'Dark Lunchbox', kind: 'use', effect: 'morale', text: 'As required: dark. Contents: whatever you packed at 0430 with your eyes closed.', useText: 'A cold sandwich and two granola bars. Morale +2. Composure restored.' },
  { id: 'pizza', r: 'c', icon: '🍕', name: 'Cold Pizza Slice', kind: 'use', effect: 'morale', text: 'From the break room. Pepperoni. Origin: unknown. Age: a mystery.', useText: 'Still good. Somehow. Morale +2.' },
  { id: 'coffee', r: 'c', icon: '☕', name: 'Gas Station Coffee', kind: 'use', effect: 'coffee', text: 'Brewed at some point this week. Tastes like burnt hope. Works anyway.', useText: 'Caffeinated: your next calls wait an extra hour for you.' },
  { id: 'shake', r: 'u', icon: '🥤', name: 'Pumpkin Spice Protein Shake', kind: 'use', effect: 'shake', text: 'Forty-two grams of protein, one autumn candle of flavor and a single tiny regret.', useText: 'Pumpkin rush: you move 25% faster for the next three hours of your shift.' },
  { id: 'batteries', r: 'u', icon: '🔋', name: 'Fresh Flashlight Batteries', kind: 'use', effect: 'light', text: 'Not the ones from the junk drawer. Real ones. Still in the package.', useText: 'Bright idea: your light reaches 50% farther for the rest of this shift.' },
  { id: 'energy', r: 'r', icon: '⚡', name: 'Suspicious Energy Drink', kind: 'use', effect: 'energy', text: 'The can just says "ENERGY" in a font that is yelling at you.', useText: 'Your heart is now a drum solo. 40% faster for the next two hours.' },
  { id: 'pot', r: 'l', icon: '🫖', name: 'The Coffee Pot That Never Empties', kind: 'use', effect: 'pot', reuse: true, text: 'Passed down from class to class. Nobody has ever seen it get refilled. Nobody asks.', useText: 'Bottomless: your next calls wait an extra hour, again, forever.' },
  // ---- keepsakes ----
  { id: 'highlighter', r: 'c', icon: '🖍️', name: 'Half-Dead Highlighter', kind: 'keep', text: 'Every line of Chapter 5 is now yellow. Every. Single. Line. Highlighting has lost all meaning.' },
  { id: 'lint', r: 'c', icon: '🧻', name: 'Emergency Lint Roller', kind: 'keep', text: 'For the 0559 realization that your uniform is 40% dog hair.' },
  { id: 'seeds', r: 'c', icon: '🌻', name: 'Sunflower Seeds', kind: 'keep', text: 'Official fuel of long patrols. The shells in the cupholder are now evidence.' },
  { id: 'socks', r: 'c', icon: '🧦', name: 'All-Black Crew Socks', kind: 'keep', text: 'Not navy. Not charcoal. Black. The instructor carries a flashlight for this exact reason.' },
  { id: 'shower', r: 'u', icon: '🧴', name: 'Shower Kit (Shower Shoes Included)', kind: 'keep', text: 'Soap, deodorant, cologne, a towel and shower shoes. Never, ever forget the shower shoes.' },
  { id: 'garment', r: 'e', icon: '🧳', name: 'The Garment Bag', kind: 'keep', text: 'Ironed polo, ironed BDUs, two shined boots, two boot bands, four shirt stays, a belt, black crew socks, a vest and a radio ear piece. It weighs as much as you do.' },
  { id: 'report', r: 'r', icon: '📝', name: 'The Report With No Typos', kind: 'keep', text: 'Spellcheck had nothing to say. Your sergeant had nothing to say. A historic day.' },
  { id: 'pushup', r: 'e', icon: '💪', name: 'The Golden Push-Up', kind: 'keep', text: 'Chest to the deck, full lockout, zero sag. Nobody was watching. Of course nobody was watching.' },
  { id: 'cert', r: 'l', icon: '🎓', name: 'Laminated Certificate (Practice Copy)', kind: 'keep', text: 'Not the real one. The real one comes after State. This one is for believing in yourself.' }
];
ITEMS.forEach((x) => { if (x.slot) x.kind = 'gear'; });
export const itemById = (id) => ITEMS.find((x) => x.id === id);
export const slotOf = (id) => SLOTS.find((s) => s.id === id);
export const perkLines = (p) => Object.keys(p || {}).map((k) => (PERK_TEXT[k] ? PERK_TEXT[k](p[k]) : k));

// everything your equipped gear adds up to
export function gearTotals(S) {
  const t = {}; const o = OUTFITS[S.outfit || 'std']; if (o) Object.keys(o.perk).forEach((k) => { t[k] = (t[k] || 0) + o.perk[k]; }); Object.values(S.gear || {}).forEach((id) => { const it = itemById(id); if (it && it.perk) Object.keys(it.perk).forEach((k) => { t[k] = (t[k] || 0) + it.perk[k]; }); });
  return t;
}
export function looks(ids) { const L = {}; (ids || []).forEach((id) => { const it = itemById(id); if (it && it.look) Object.assign(L, it.look); }); return L; }

// pick a rank, then an item; min raises the floor. Nine pulls without Inspection Ready or better guarantees one.
export function roll(S, min) {
  const floor = ORDER.indexOf(min || 'c'), dry = (S.dry || 0) >= 9 ? 2 : 0, from = Math.max(floor, dry);
  const pool = ORDER.slice(from); let t = Math.random() * pool.reduce((a, k) => a + RARITY[k].w, 0), r = pool[0];
  for (const k of pool) { t -= RARITY[k].w; if (t <= 0) { r = k; break; } }
  S.dry = ORDER.indexOf(r) >= 2 ? 0 : (S.dry || 0) + 1;
  const list = ITEMS.filter((x) => x.r === r), owned = list.filter((x) => !(S.items || {})[x.id]);
  const from2 = owned.length && Math.random() < .7 ? owned : list;
  return from2[Math.floor(Math.random() * from2.length)];
}

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const perkHTML = (it) => it.perk ? '<ul class="pkList">' + perkLines(it.perk).map((l) => '<li class="' + (/^-|^\+?-/.test(l) ? 'neg' : '') + '">' + esc(l) + '</li>').join('') + '</ul>' : '';
const slotTag = (it) => it.slot ? '<span class="slTag">' + slotOf(it.slot).icon + ' ' + slotOf(it.slot).name + '</span>' : it.kind === 'use' ? '<span class="slTag">Use once</span>' : '<span class="slTag">Keepsake</span>';

// ---------- the grand reveal ----------
export function reveal(item, where, opts) {
  opts = opts || {};
  return new Promise((done) => {
    const R = RARITY[item.r], isNew = !!opts.isNew, el = document.createElement('div');
    el.className = 'rv rv-' + item.r; el.style.setProperty('--rc', R.color); el.style.setProperty('--rg', R.glow);
    const act = item.kind === 'use' ? '<button type="button" data-a="use">Use it now</button>' : item.kind === 'gear' ? (opts.canEquip ? '<button type="button" data-a="equip">Equip now</button>' : '') : '';
    el.innerHTML = '<canvas class="rvFx"></canvas><div class="rvRays"></div><div class="rvStage">' +
      '<div class="rvFrom">' + esc(where) + '</div>' +
      '<div class="rvBag"><span>' + (ORDER.indexOf(item.r) >= 3 ? '🎁' : '🛍️') + '</span><i>EVIDENCE</i></div>' +
      '<div class="rvItem"><div class="rvIcon">' + item.icon + '<b class="rvShine"></b></div>' +
      '<div class="rvTier">' + (isNew ? '<em>NEW</em>' : '') + 'Rank ' + R.short + ' · ' + esc(R.name) + '</div><h2>' + esc(item.name) + '</h2>' + slotTag(item) + '<p>' + esc(item.text) + '</p>' + perkHTML(item) +
      (item.kind === 'gear' && !opts.canEquip && opts.lockHint ? '<p class="rvLock">' + esc(opts.lockHint) + '</p>' : '') +
      '<div class="rvBtns">' + act + '<button type="button" data-a="keep" class="' + (act ? 'ghost' : '') + '">' + (act ? 'Save for later' : 'Into the locker') + '</button></div></div>' +
      '<div class="rvSkip">Tap to open</div></div>';
    document.body.appendChild(el);
    const fx = el.querySelector('.rvFx'), g = fx.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
    fx.width = innerWidth * dpr; fx.height = innerHeight * dpr;
    let parts = [], raf = 0, stage = 0; const big = ORDER.indexOf(item.r) >= 3;
    const burst = () => {
      const n = { c: 60, u: 90, r: 140, e: 190, l: 240 }[item.r], cols = item.r === 'l' ? ['#f5b800', '#fff3b0', '#ffffff', '#ff9f1a'] : item.r === 'e' ? ['#a855f7', '#e9d5ff', '#ffffff', '#f5b800'] : [R.color, '#ffffff', '#f5b800'];
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = (4 + Math.random() * 10) * dpr; parts.push({ x: fx.width / 2, y: fx.height * .4, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4 * dpr, s: (3 + Math.random() * 5) * dpr, c: cols[i % cols.length], r: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 1 }); }
    };
    const loop = () => {
      g.clearRect(0, 0, fx.width, fx.height);
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += .25 * dpr; p.vx *= .985; p.r += p.vr; p.life -= .008; g.save(); g.globalAlpha = Math.max(0, p.life); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); });
      parts = parts.filter((p) => p.life > 0 && p.y < fx.height + 40);
      if (big && stage === 2 && Math.random() < .3) parts.push({ x: Math.random() * fx.width, y: -10, vx: 0, vy: 2 * dpr, s: 4 * dpr, c: R.color, r: 0, vr: .1, life: 1.4 });
      raf = requestAnimationFrame(loop);
    };
    loop();
    const open = () => { if (stage) return; stage = 1; el.classList.add('open'); burst(); if (opts.sound) opts.sound(R.notes); setTimeout(() => { stage = 2; el.classList.add('shown'); if (big) burst(); }, 450); };
    setTimeout(() => el.classList.add('in'), 20);
    const auto = setTimeout(open, { c: 1100, u: 1400, r: 1800, e: 2200, l: 2600 }[item.r]);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) { clearTimeout(auto); open(); return; }
      if (stage < 2) return;
      cancelAnimationFrame(raf); el.classList.add('out'); setTimeout(() => el.remove(), 250); done(b.dataset.a);
    });
  });
}

// ---------- locker ----------
export function collectionHTML(S) {
  const have = S.items || {}, got = ITEMS.filter((x) => have[x.id]).length;
  return '<p class="lkSum">' + got + ' of ' + ITEMS.length + ' found. Look for sparkles on the street and inside buildings.</p>' +
    ORDER.slice().reverse().map((r) => '<div class="lkTier" style="--rc:' + RARITY[r].color + '">Rank ' + RARITY[r].short + ' · ' + RARITY[r].name + '</div><div class="lkGrid">' + ITEMS.filter((x) => x.r === r).map((x) => {
      const n = have[x.id] || 0, worn = Object.values(S.gear || {}).includes(x.id);
      return '<button type="button" class="lkItem' + (n ? '' : ' none') + (worn ? ' worn' : '') + '" data-i="' + x.id + '" style="--rc:' + RARITY[r].color + '"' + (n ? '' : ' disabled') + '><span>' + (n ? x.icon : '❔') + '</span><b>' + (n ? esc(x.name) : '???') + '</b>' + (n > 1 && x.kind !== 'gear' ? '<i>×' + n + '</i>' : '') + (worn ? '<i class="w">ON</i>' : '') + (n && x.slot ? '<em>' + slotOf(x.slot).icon + '</em>' : '') + '</button>';
    }).join('') + '</div>').join('');
}
export function equipHTML(S, xp, stats, base) {
  const t = gearTotals(S), cur = S.outfit || 'std';
  return '<div class="ofRow"><b>Outfit</b><div class="ofSeg">' + Object.keys(OUTFITS).map((k) => '<button type="button" data-of="' + k + '" class="' + (k === cur ? 'on' : '') + '">' + OUTFITS[k].icon + ' ' + OUTFITS[k].name + '</button>').join('') + '</div><p>' + esc(OUTFITS[cur].text) + (Object.keys(OUTFITS[cur].perk).length ? ' <em>' + perkLines(OUTFITS[cur].perk).join(', ') + '</em>' : '') + '</p></div>' +
    '<div class="eqGrid">' + SLOTS.map((s) => {
    const open = xp >= s.need, id = (S.gear || {})[s.id], it = id && itemById(id);
    return '<button type="button" class="eqSlot' + (open ? '' : ' locked') + (it ? ' full' : '') + '" data-slot="' + s.id + '" style="--rc:' + (it ? RARITY[it.r].color : '#4b5563') + '"' + (open ? '' : ' disabled') + '>' +
      '<span class="eqIco">' + (it ? it.icon : open ? s.icon : '🔒') + '</span><b>' + s.name + '</b><small>' + (it ? esc(it.name) : open ? 'Empty · tap to equip' : esc(s.hint)) + '</small></button>';
  }).join('') + '</div>' +
    '<div class="eqStats"><b>Your stats</b>' + Object.keys(base).map((k) => '<div class="eqStat"><span>' + ({ res: 'Response', per: 'Perception', rap: 'Rapport', com: 'Composure', tac: 'Tactics' })[k] + '</span><i>' + Array.from({ length: 7 }, (_, n) => '<b class="' + (n < Math.min(base[k], stats[k]) ? 'f' : n < stats[k] ? 'g' : '') + '"></b>').join('') + '</i><em>' + stats[k] + (stats[k] !== base[k] ? ' <small>(' + (stats[k] > base[k] ? '+' : '') + (stats[k] - base[k]) + ')</small>' : '') + '</em></div>').join('') + '</div>' +
    (Object.keys(t).filter((k) => !base.hasOwnProperty(k)).length ? '<div class="eqPerks"><b>Gear perks</b><ul class="pkList">' + perkLines(Object.fromEntries(Object.entries(t).filter(([k]) => !base.hasOwnProperty(k)))).map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul></div>' : '<p class="lkSum">Equip gear to stack perks. Each slot holds one item.</p>');
}
export function itemCardHTML(it, S) {
  const R0 = RARITY[it.r];
  return '<div class="lkOne" style="--rc:' + R0.color + '"><div class="lkBig">' + it.icon + '</div><div class="lkR">Rank ' + R0.short + ' · ' + R0.name + '</div><h2>' + esc(it.name) + '</h2>' + slotTag(it) + '<p>' + esc(it.text) + '</p>' + perkHTML(it) + (it.kind !== 'gear' ? '<small>You have ' + ((S.items || {})[it.id] || 0) + '</small>' : '') + '</div>';
}
