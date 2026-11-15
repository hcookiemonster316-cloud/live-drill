// Life off the clock: off-duty mode, food, ball games, skating, fishing (pier, marina wall and from the boat),
// ride-alongs, a place of your own, morale, and the regulars' friendship stories.
import { ARCS } from './friends.js';

const FISH = {
  pier: [['Bluegill', 'c', .3, .9], ['Mullet', 'c', .8, 2.5], ['Largemouth bass', 'u', 1.5, 6], ['Channel catfish', 'u', 2, 9], ['Snook', 'r', 4, 15]],
  wall: [['Bluegill', 'c', .3, .9], ['Sheepshead', 'u', 1.5, 5], ['Redfish', 'r', 4, 14], ['Largemouth bass', 'u', 1.5, 6], ['Tarpon', 'l', 30, 90]],
  boat: [['Spotted seatrout', 'c', 1, 4], ['Redfish', 'u', 4, 14], ['Snook', 'u', 4, 15], ['Tarpon', 'r', 30, 90], ['Old Mossback (bass)', 'l', 12, 14]]
};
const RW = { c: 60, u: 28, r: 10, l: 2 };
const HOMES = [{ id: 'apt', name: 'River Bend Apartments, Unit 2C', d: 2, at: 'River Bend Apartments', cost: 250, slots: 4, look: 'A studio with a window unit and a view of the parking lot. It\'s yours.' },
  { id: 'bung', name: 'Willow Street bungalow', d: 2, at: 'Willow Street', cost: 1200, slots: 8, look: 'Two bedrooms, a porch swing and an oak that drops acorns on the roof all night.' },
  { id: 'house', name: 'Maple Court house', d: 1, at: 'Maple Court', cost: 2500, slots: 12, look: 'A real house on Grandma Ruth\'s street. Lemon bars arrive unannounced.' }];
const FOOD = { diner: ['Patty melt and fries', 'Cherry pie and coffee', 'Breakfast for dinner'], cafe: ['Café con leche and a pastry', 'Iced coffee', 'A muffin the size of your head'], pizza: ['Two slices and a soda', 'The Founders Special', 'Garlic knots'] };

export function installOffDuty(H) {
  const S = H.S; if (S.morale == null) S.morale = 70; S.fish = S.fish || {}; S.homes = S.homes || []; S.wall = S.wall || {}; S.arcs = S.arcs || {};
  const rnd = (a) => a[Math.floor(Math.random() * a.length)], money = (n) => '$' + Math.round(n);
  let acts = [], rideDone = {}, mT = 0, lowSaid = false;
  const pay = (n, what) => { if ((S.cash || 0) < n) { H.toast('Not enough cash for ' + what + ' (' + money(n) + ').'); H.bad(); return false; } S.cash -= n; H.saveS(); H.hud(); return true; };
  const mood = (n) => { S.morale = Math.max(0, Math.min(100, S.morale + n)); H.saveS(); if (n > 0) H.toast('😊 Morale ' + (n > 0 ? '+' : '') + n + ' (' + Math.round(S.morale) + ')'); };

  function setup() {
    acts = []; rideDone = {}; const W = H.W; if (!W || H.inside) return;
    const door = (l) => { const [dx, dy] = H.doorSpot(l); return [dx, dy + .9]; };
    W.lots.forEach((l) => {
      const [x, y] = door(l);
      if (FOOD[l.kind]) acts.push({ kind: 'eat', x, y, icon: '🍽️', col: '#f97316', label: 'Grab a bite at ' + (l.name || 'the ' + l.kind), lot: l, off: true });
      if (l.kind === 'stadium') acts.push({ kind: 'game', x, y, icon: '🏟️', col: '#16a34a', label: 'Catch a Gators game', off: true });
      if (l.kind === 'center') acts.push({ kind: 'skate', x, y, icon: '🛹', col: '#a855f7', label: 'Skate with Dez', off: true });
      if (l.kind === 'marina') { acts.push({ kind: 'fish', spot: 'wall', x: x + 1.2, y, icon: '🎣', col: '#0ea5e9', label: 'Fish off the marina wall', off: true }); if (/Riverside Marina/.test(l.name || '')) acts.push({ kind: 'ride', who: 'hal', x: x - 1, y, icon: '⛵', col: '#0369a1', label: 'Ride along with Captain Hal', on: true }); }
      if (l.kind === 'firestation' && /Fire Station 3/.test(l.name || '')) acts.push({ kind: 'ride', who: 'sam', x, y, icon: '🚒', col: '#b91c1c', label: 'Ride along with Engine 3', on: true });
      if (l.kind === 'autoshop' && /Earl/.test(l.name || '')) acts.push({ kind: 'ride', who: 'earl', x: x + 1, y, icon: '🛻', col: '#64748b', label: 'Ride along on Big Earl\'s tow truck', on: true });
      HOMES.forEach((h) => { if (h.d === W.did && (l.name || '').indexOf(h.at) >= 0) acts.push({ kind: S.homes.includes(h.id) ? 'home' : 'buy', home: h, x: x - 1.2, y, icon: S.homes.includes(h.id) ? '🏠' : '🏷️', col: '#eab308', label: S.homes.includes(h.id) ? 'Home: ' + h.name : (h.id === 'apt' ? 'For rent: ' : 'For sale: ') + h.name + ' · ' + money(h.cost) }); });
    });
    if (W.pier) acts.push({ kind: 'fish', spot: 'pier', x: W.pier.x + 5, y: W.pier.y + .5, icon: '🎣', col: '#0ea5e9', label: 'Fish off the pier', off: true });
    if (W.river) for (let i = 0; i < 4; i++) { const y = 15 + i * 32 + Math.floor(Math.random() * 10), x = 2 + 12 * 11 + 3 + Math.floor(Math.random() * 6); acts.push({ kind: 'fish', spot: 'boat', x: x + .5, y: y + .5, icon: '🐟', col: '#0284c7', label: 'Fishing spot', boat: true }); }
  }
  const showable = (a) => { const P = H.P; if (H.inside) return false; if (a.boat) return P.boat && Math.hypot(P.x - a.x, P.y - a.y) < 8; if (P.boat || P.inCar) return false; if (a.off && !S.offDuty) return false; if (a.on && S.offDuty) return false; if (a.kind === 'ride' && rideDone[a.who]) return false; return Math.hypot(P.x - a.x, P.y - a.y) < 8; };

  // ---------- off duty ----------
  function toggle() {
    if (H.call() && H.call().accepted) { H.toast('Finish your call before you go off duty.'); return; }
    S.offDuty = !S.offDuty; H.saveS(); H.refreshLook();
    if (S.offDuty) { H.radio(H.S.cs, 'Going off duty.'); H.banner('🧢', 'Off duty', 'No calls. Eat, fish, catch a game, see your friends. Morale goes up.'); H.clearCall(); }
    else { H.radio(H.S.cs, 'Back in service.'); H.banner('🚓', 'Back on duty', 'Dispatch knows you\'re available.'); }
    hud();
  }
  function hud() { const el = H.$('offHud'); if (!el) return; const car = H.P.inCar && !H.inside; el.style.bottom = 'calc(' + (car ? 236 : 150) + 'px + var(--safe-b))'; el.hidden = H.inside && !S.offDuty;
    el.innerHTML = (S.offDuty ? '<b>🧢 Off duty</b>' : '') + '<span title="Morale">' + (S.morale >= 70 ? '😄' : S.morale >= 40 ? '🙂' : '😮‍💨') + ' Morale ' + Math.round(S.morale) + '</span>'; el.classList.toggle('low', S.morale < 30); }
  function tick(dt) {
    if (!S.offDuty && !H.paused()) S.morale = Math.max(0, S.morale - dt / 90);
    if (S.morale < 30 && !lowSaid) { lowSaid = true; H.toast('😮‍💨 Morale is low. Take a break: go off duty (Menu) and eat, fish or see a game.'); } if (S.morale > 45) lowSaid = false;
    mT -= dt; if (mT <= 0) { mT = 1; hud(); }
  }
  const rpMult = () => (S.morale >= 70 ? 1.05 : S.morale < 30 ? .95 : 1);

  // ---------- activities ----------
  function run(a) {
    const V = H.dialogue, focus = { focus: [a.x, a.y], kicker: a.label.toUpperCase() };
    if (a.kind === 'eat') { const k = a.lot.kind, staff = H.sayAs('server', { name: k === 'diner' ? 'Server' : k === 'pizza' ? 'Counter' : 'Barista', icon: k === 'pizza' ? '🍕' : k === 'diner' ? '🍳' : '☕', role: a.lot.name || '' });
      V([[staff, rnd(['What can I get you, off duty?', 'Long shift? Sit anywhere.', 'Out of uniform! Look at you, a regular person.'])], ['choice', FOOD[k].map((f, i) => ({ t: f + ' · ' + money(6 + i * 3), price: 6 + i * 3, food: f })).concat([{ t: 'Just looking, thanks', none: true }])]], (r) => { const c = r.choices[0]; if (!c || c.none) return; if (pay(c.price, c.food)) { mood(12 + c.price); H.stat('meals'); } }, focus); }
    else if (a.kind === 'game') ballgame(a);
    else if (a.kind === 'skate') skate();
    else if (a.kind === 'fish') fish(a.spot);
    else if (a.kind === 'ride') ride(a);
    else if (a.kind === 'buy') buy(a.home);
    else if (a.kind === 'home') home(a.home);
  }
  function ballgame(a) {
    if (!pay(15, 'a ticket')) return; const fan = H.sayAs('fan', { name: 'Superfan in a gator hat', icon: '🐊', role: 'River Stadium' }), win = Math.random() < .4;
    H.dialogue([['narr', 'Section 104. The Meridian Gators versus the Bay County Pelicans. The smell of popcorn and sunscreen.'], [fan, 'First game? You picked a great one. We\'re only down by two touchdowns!'],
      ['choice', [{ t: 'Start the wave', reply: [['narr', 'It goes around the stadium twice. Somebody\'s grandma gets it going a third time.']] }, { t: 'Buy a round of boiled peanuts for the row', reply: [[fan, 'You\'re a hero. A peanut hero.']] }, { t: 'Yell advice at the coach', reply: [['narr', 'The coach does not take your advice. Fourth and long. Punt.']] }]],
      ['narr', 'Fourth quarter. Gators down by four. Ten seconds left. The ball goes up…'], ['narr', win ? 'Caught in the end zone. River Stadium loses its mind. Your ears will ring until Tuesday.' : 'Batted down. The Gators lose with great dignity, as is tradition.'], [fan, win ? 'WE WON! I\'ve been coming for thirty years and that\'s our fourth win!' : 'Next week. Next week for sure.']], () => { mood(win ? 30 : 20); H.stat('games'); if (win) H.stat('gatorwin'); }, { focus: [a.x, a.y], kicker: 'RIVER STADIUM · GAME DAY' });
  }
  // a little rhythm game: tap when the marker is in the green
  function skate() {
    const tricks = ['Ollie', 'Kickflip', 'Manual', 'Shove-it', 'Boardslide']; let k = 0, hits = 0, t0 = performance.now(), raf = 0, zone = .2;
    H.openModal('<div class="sceneHead"><b>EASTSIDE COMMUNITY CENTER</b><h2>Skate with Dez</h2><p>Tap when the marker is in the green to land each trick.</p></div><div class="skGame"><div class="skTrick" id="skT">Ollie</div><div class="skBar"><i id="skZ"></i><b id="skM"></b></div><button type="button" id="skGo">LAND IT</button><p id="skMsg">&nbsp;</p></div>');
    const place = () => { zone = .14 - k * .015; const z = H.$('skZ'), c = .25 + Math.random() * .5; z.style.left = ((c - zone / 2) * 100) + '%'; z.style.width = (zone * 100) + '%'; z.dataset.c = c; H.$('skT').textContent = tricks[k]; t0 = performance.now(); };
    const pos = () => { const t = (performance.now() - t0) / (900 - k * 90); return Math.abs(((t % 2) + 2) % 2 - 1); };
    const loop = () => { const m = H.$('skM'); if (!m) return; m.style.left = (pos() * 100) + '%'; raf = requestAnimationFrame(loop); };
    place(); loop();
    H.$('skGo').onclick = () => { const c = +H.$('skZ').dataset.c, ok = Math.abs(pos() - c) <= zone / 2; if (ok) hits++; H.beep(ok ? 880 : 200, .1, ok ? 'triangle' : 'sawtooth', .05); H.$('skMsg').textContent = ok ? rnd(['Clean!', 'Dez: "Yooo!"', 'Stuck it!']) : rnd(['Bailed.', 'Dez: "Almost!"', 'Board went one way, you went the other.']); k++;
      if (k >= tricks.length) { cancelAnimationFrame(raf); setTimeout(() => { H.closeModal(); H.dialogue([['dez', hits >= 4 ? 'Bro. BRO. Officer Kickflip is real.' : hits >= 2 ? 'Not bad for a cop. Come back Tuesday.' : 'You fell a lot. Respect for getting back up.']], () => { mood(10 + hits * 4); H.stat('skate'); if (hits === 5) H.stat('skate5'); }); }, 600); } else place(); };
  }
  // fishing: cast, wait for the bite, set the hook, then keep the line tight without snapping it
  function fish(spot) {
    const pool = FISH[spot] || FISH.pier, roll = () => { const w = pool.map((f) => RW[f[1]]), t = w.reduce((a, b) => a + b, 0); let r = Math.random() * t; for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; } return pool[0]; };
    let st = 'idle', fishOn = null, biteAt = 0, raf = 0, dist = 100, ten = 0, holding = false, last = 0;
    H.openModal('<div class="sceneHead"><b>' + ({ pier: 'THE FISHING PIER', wall: 'MARINA WALL', boat: 'ON THE RIVER' })[spot] + '</b><h2>Fishing</h2><p>Cast, wait for the bite, tap to set the hook, then hold to reel. Let go if the line gets too tight.</p></div>' +
      '<div class="fsGame"><div class="fsWater" id="fsW"><i id="fsB">🎣</i></div><div class="fsBars"><span>Line</span><div><i id="fsD"></i></div><span>Tension</span><div class="t"><i id="fsT"></i></div></div><button type="button" id="fsGo">Cast</button><p id="fsMsg">&nbsp;</p></div><div class="qAct"><button type="button" class="ghost" id="fsX">Done fishing</button></div>');
    const msg = (t) => { const e = H.$('fsMsg'); if (e) e.textContent = t; }, go = H.$('fsGo'), bob = H.$('fsB');
    const end = () => { cancelAnimationFrame(raf); st = 'idle'; go.textContent = 'Cast again'; bob.className = ''; };
    const loop = (t) => { raf = requestAnimationFrame(loop); const dt = Math.min(.05, (t - (last || t)) / 1000); last = t; if (!H.$('fsGo')) { cancelAnimationFrame(raf); return; }
      if (st === 'wait' && performance.now() > biteAt) { st = 'bite'; bob.className = 'bite'; msg('BITE! Tap now!'); H.beep(990, .1, 'square', .05); biteAt = performance.now() + 1100; go.textContent = 'Set the hook!'; }
      else if (st === 'bite' && performance.now() > biteAt) { msg('It spit the hook. Too slow.'); end(); }
      else if (st === 'reel') { const pow = { c: 18, u: 26, r: 34, l: 44 }[fishOn[1]], surge = Math.sin(t / 340) > .7 ? pow * 1.8 : pow; ten += (holding ? 55 + surge : -70) * dt; ten = Math.max(0, ten); if (holding) dist -= (22 - pow * .25) * dt; else dist = Math.min(100, dist + pow * .12 * dt);
        H.$('fsD').style.width = dist + '%'; H.$('fsT').style.width = Math.min(100, ten) + '%'; H.$('fsT').style.background = ten > 80 ? '#ef4444' : ten > 55 ? '#f59e0b' : '#22c55e';
        if (ten >= 100) { msg('SNAP. The line broke. Something big is still out there.'); H.bad(); end(); } else if (dist <= 0) { const lb = Math.round((fishOn[2] + Math.random() * (fishOn[3] - fishOn[2])) * 10) / 10, f = S.fish[fishOn[0]] = S.fish[fishOn[0]] || { n: 0, best: 0 }; f.n++; const pb = lb > f.best; f.best = Math.max(f.best, lb); H.saveS(); H.stat('fish'); if (fishOn[1] === 'l') H.stat('fishLegend');
          msg('Caught! ' + fishOn[0] + ', ' + lb + ' lb' + (pb ? ' · personal best!' : '') + (fishOn[1] === 'l' ? ' · LEGENDARY' : '')); H.good(); mood(fishOn[1] === 'l' ? 25 : 6); H.award(fishOn[1] === 'l' ? 120 : fishOn[1] === 'r' ? 40 : 10, 'caught a ' + fishOn[0].toLowerCase()); end(); } } };
    raf = requestAnimationFrame(loop);
    go.onclick = () => { if (st === 'idle') { st = 'wait'; fishOn = roll(); biteAt = performance.now() + 1800 + Math.random() * 5000; bob.className = 'cast'; msg('Waiting…'); go.textContent = 'Waiting…'; dist = 100; ten = 0; H.$('fsD').style.width = '100%'; H.$('fsT').style.width = '0%'; }
      else if (st === 'bite') { st = 'reel'; bob.className = 'reel'; msg('Fish on! Hold the button to reel. Let go when the line goes red.'); go.textContent = 'HOLD TO REEL'; } else if (st === 'wait') { msg('Patience…'); } };
    const hold = (v) => (e) => { if (st !== 'reel') return; e.preventDefault(); holding = v; }; go.addEventListener('pointerdown', hold(true)); ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => go.addEventListener(ev, hold(false)));
    H.$('fsX').onclick = () => { cancelAnimationFrame(raf); H.closeModal(); };
  }
  // ride-alongs: see the city from another agency's seat
  function ride(a) {
    rideDone[a.who] = 1; const L = H.L, q = (les) => ['q', L.pickFacts(S, les, 1)[0], a.who];
    const scenes = {
      sam: [['sam', 'Climb in the back. Headset on. You talk, you talk through that.'], ['narr', 'Engine 3 rolls out, siren wailing. A kitchen fire, already out when you arrive, but the smoke is thick.'], ['choice', [{ t: 'Help keep the neighbors back from the house', trust: 1, reply: [['sam', 'Good. Perimeter is half the job.']] }, { t: 'Ask what they\'re checking for inside', reply: [['sam', 'Fire in the walls. It hides. We check with a thermal camera before we call it out.']] }]], q([12, 9]), ['sam', 'You did good. Fire and police, same team on a scene. Come back for chili Thursday.']],
      hal: [['hal', 'Life jacket. Yes, you. Yes, it\'s regulation.'], ['narr', 'The marina boat heads upriver. Herons lift off the banks. Hal points out the channel markers like old friends.'], ['choice', [{ t: 'Ask about the boater you just passed without a light', reply: [['hal', 'Good eye. We\'ll give him a friendly talk. Night boating without lights is how people get hurt.']] }, { t: 'Ask about the river at flood stage', reply: [['hal', 'In 2004 the water came up to the bait shop sign. You can still see the line.']] }]], q([13, 8, 11]), ['hal', 'River teaches patience. So does police work. Same lesson, different water.']],
      earl: [['earl', 'Hop in. We\'ve got a breakdown on the highway shoulder. Hazards on, cones out, then we hook up.'], ['narr', 'Traffic roars past at sixty. Earl works fast and never once turns his back to it.'], ['choice', [{ t: 'Set out flares and cones behind the truck', trust: 1, reply: [['earl', 'There you go. Far enough back that people have time to see them.']] }, { t: 'Talk with the stranded driver', reply: [['earl', 'Good. They\'re scared. A calm voice is worth more than a tow.']] }]], q([4, 1]), ['earl', 'Every patrol car in this county\'s been on my hook. Now you know what it looks like from my side.']]
    };
    H.dialogue(scenes[a.who] || [], () => { H.award(90, 'ride-along'); H.stat('rides'); H.stat('ride_' + a.who); mood(8); }, { focus: [a.x, a.y], kicker: 'RIDE-ALONG · ' + a.label.toUpperCase() });
  }
  // homes
  function buy(h) {
    H.openModal('<div class="sceneHead"><b>' + (h.id === 'apt' ? 'FOR RENT' : 'FOR SALE') + '</b><h2>' + H.esc(h.name) + '</h2><p>' + H.esc(h.look) + '</p></div><div class="homeBuy"><b>' + money(h.cost) + '</b><span>' + h.slots + ' display spots for your trophies and finds. Rest here to restore morale.</span><small>Your cash: ' + money(S.cash || 0) + '</small></div><div class="qAct"><button type="button" id="hbGo">' + (h.id === 'apt' ? 'Sign the lease' : 'Buy it') + '</button><button type="button" class="ghost" id="mClose">Not now</button></div>');
    H.$('mClose').onclick = H.closeModal; H.$('hbGo').onclick = () => { if (!pay(h.cost, h.name)) return; S.homes.push(h.id); S.home = h.id; H.saveS(); H.closeModal(); H.stat('homes'); H.banner('🏠', 'Home sweet home', h.name + ' is yours. Look for the 🏠 by the door.'); H.good(); setup(); };
  }
  function home(h) {
    const ITEMS = H.items(), owned = ITEMS.filter((i) => (S.items || {})[i.id]), wall = S.wall[h.id] = S.wall[h.id] || [], tro = H.trophies();
    const draw = () => {
      H.openModal('<div class="sceneHead"><b>HOME</b><h2>' + H.esc(h.name) + '</h2><p>' + H.esc(h.look) + '</p></div>' +
        '<div class="homeRoom ' + h.id + '"><div class="hrShelf"><small>Trophy shelf · ' + tro.n + ' earned</small><div>' + (tro.list.slice(-8).map((t) => '<span title="' + H.esc(t) + '">🏆</span>').join('') || '<em>Empty for now</em>') + '</div></div>' +
        '<div class="hrWall">' + Array.from({ length: h.slots }, (_, i) => { const it = ITEMS.find((x) => x.id === wall[i]); return '<button type="button" data-sl="' + i + '" class="' + (it ? 'has' : '') + '" title="' + (it ? H.esc(it.name) : 'Empty spot') + '">' + (it ? it.icon : '＋') + '</button>'; }).join('') + '</div>' +
        '<div class="hrStats"><span>Morale ' + Math.round(S.morale) + '</span><span>Fish caught ' + Object.values(S.fish).reduce((a, f) => a + f.n, 0) + '</span><span>Cash ' + money(S.cash || 0) + '</span></div></div>' +
        '<div class="qAct"><button type="button" id="hRest">Rest up</button><button type="button" class="ghost" id="hLog">Fishing log</button><button type="button" class="ghost" id="mClose">Leave</button></div>');
      H.$('mClose').onclick = H.closeModal; H.$('hRest').onclick = () => { S.morale = 100; H.saveS(); H.toast('😄 Rested. Morale 100.'); H.stat('rest'); draw(); };
      H.$('hLog').onclick = () => { const rows = Object.keys(S.fish).map((k) => '<div class="mgRow"><span>🐟</span><b>' + H.esc(k) + '</b><strong>' + S.fish[k].n + ' · best ' + S.fish[k].best + ' lb</strong></div>').join('') || '<p class="lkSum">Nothing yet. Try the pier, the marina wall, or a 🐟 spot from the boat.</p>'; H.openModal('<div class="sceneHead"><b>FISHING LOG</b><h2>Your catches</h2></div><div class="mgList">' + rows + '</div><div class="qAct"><button type="button" id="mClose">Back</button></div>'); H.$('mClose').onclick = draw; };
      document.querySelectorAll('[data-sl]').forEach((b) => b.onclick = () => { const i = +b.dataset.sl; H.openModal('<div class="sceneHead"><b>DISPLAY SPOT</b><h2>Hang something up</h2></div><div class="hrPick">' + (owned.length ? owned.map((it) => '<button type="button" data-it="' + it.id + '"><span>' + it.icon + '</span>' + H.esc(it.name) + '</button>').join('') : '<p class="lkSum">Find items on patrol to display them here.</p>') + '<button type="button" data-it="">Leave it empty</button></div><div class="qAct"><button type="button" class="ghost" id="mClose">Back</button></div>'); H.$('mClose').onclick = draw; document.querySelectorAll('[data-it]').forEach((x) => x.onclick = () => { wall[i] = x.dataset.it || null; H.saveS(); H.stat('decor'); draw(); }); });
    }; draw();
  }

  // ---------- friendship stories ----------
  function arcOption(n) {
    const A = ARCS[n.id]; if (!A) return null; const done = S.arcs[n.id] || 0; if (done >= 5) return null; const f = S.npc[n.id] || 0; if (f < done + 1) return null;
    return { t: '💛 ' + A.title + (done ? ' (part ' + (done + 1) + ')' : ''), reply: A.parts[done].concat([['fx', () => { S.arcs[n.id] = done + 1; H.saveS(); H.stat('arcParts'); if (done + 1 >= 5) { H.stat('arcs'); H.award(200, A.title + ' complete'); H.queueLoot('From ' + n.name, 1, 'e'); H.banner('💛', A.title, 'Story complete. ' + n.name + ' won\'t forget it.'); } else H.award(40, A.title); }]]) };
  }
  const arcReady = (id) => { const A = ARCS[id]; if (!A) return false; const done = S.arcs[id] || 0; return done < 5 && (S.npc[id] || 0) >= done + 1; };

  return {
    setup, toggle, tick, rpMult, run, arcOption, arcReady, hud,
    get acts() { return acts.filter(showable); }, get all() { return acts; },
    draw(now) { acts.forEach((a) => { if (!showable(a)) return; const [sx, sy] = H.iso(a.x, a.y); H.bubble(sx, sy - 36, a.icon, a.col, now); if (Math.hypot(H.P.x - a.x, H.P.y - a.y) < 4) H.label(sx, sy - 60, a.label, '#e2e8f0'); }); }
  };
}
