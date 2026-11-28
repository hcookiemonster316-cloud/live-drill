// Rare finds (owner's call, 2026-11-27: "rare hidden situations"): moments you only meet if you're in the right place at
// the right hour. A hymn from a dark chapel at three in the morning, an alligator on a crosswalk at dawn, sea turtle
// hatchlings walking toward the streetlights, a forty-year-old cruiser idling in the fog, a dog that won't stop leading
// you somewhere. Each opens on a scene in the live city with its own mood, asks one real decision (the right one is
// policy; the wrong ones are corrected, never rewarded), and goes into the Field Journal. Radio gossip hints at them
// after a few shifts, so they can be found on purpose.
//
// Loop: drive the city (exploring at odd hours pays). Reads the clock, the weather, the place you're near and the real
// date; feeds the Field Journal (a lore entry each), the secret trophies and the Service Record (Exploration).

export const RARE_CAST = {
  rare_organ: { name: 'Mr. Abernathy', role: 'Retired church organist', look: { shirt: '#3f4a5c', pants: '#374151', hair: '#e5e7eb', skin: '#e0ac69' } },
  rare_gator: { name: 'Wanda Pruett', role: 'Neighbor in a bathrobe', look: { shirt: '#f9a8d4', pants: '#94a3b8', hair: '#5a3825', skin: '#c68642' } },
  rare_turtle: { name: 'Dr. Imani Cole', role: 'Sea turtle volunteer', look: { shirt: '#0f766e', pants: '#1f2937', hair: '#1a1a1a', skin: '#8d5524' } },
  rare_ghost: { name: 'Ray Quintero', role: 'Retired sergeant, Badge 77', look: { shirt: '#1e3a5f', pants: '#1f2937', hair: '#d1d5db', skin: '#c68642' } },
  rare_dog: { name: 'Mrs. Holloway', role: 'Neighbor, 84', look: { shirt: '#a78bfa', pants: '#64748b', hair: '#f1f5f9', skin: '#ffdbac' } }
};

// kinds: lot kinds to be near · hours: [from, to) in game hours (may wrap) · need(): extra conditions · mood: the cue
export const RARE = [
  { id: 'organ', icon: '🎵', title: 'The 3 A.M. Hymn', kinds: ['church'], hours: [1, 4.5], mood: 'heartbreak', who: 'rare_organ',
    card: 'A hymn is playing in a chapel that should be dark.', hint: 'Folks by the chapel swear they hear organ music around three in the morning.',
    say: [['narr', 'The side door is propped open with a hymnal. Inside, an old man in pajamas and a church blazer is playing the organ.'], ['rare_organ', 'Oh. Is it Sunday already? I lose track now. I always lose track.']],
    ask: 'He keeps playing, waiting for you to say something.',
    opts: [['Sit with him, ask his name, and call it in for a missing person match', 1, [['narr', 'Dispatch has a Silver Alert from two hours ago: Walter Abernathy, 81, memory loss. His daughter is on her way.'], ['rare_organ', 'Forty years I played here. They let me keep a key. I suppose I shouldn\'t have one anymore.']]],
      ['Tell him the chapel is closed and walk him back out to the front sidewalk', 0, [['narr', 'Outside, he looks up and down the street and has no idea which way is home. You call it in after all; there\'s a Silver Alert out for him.']]],
      ['Step back outside and wait by the door for an ambulance to come check him', 0, [['narr', 'When you come back in, the bench is empty and the side door is swinging. You find him a block away in the rain and call in the Silver Alert match.']]]],
    lore: 'Walter Abernathy played the organ at First Light Chapel for forty years. On bad nights his feet still know the way there. His daughter keeps the key now, and the chapel leaves a light on.' },
  { id: 'gator', icon: '🐊', title: 'Crossing Guard', kinds: ['park', 'woods', 'farm'], hours: [5.5, 9], mood: 'humor', who: 'rare_gator', need: (H) => H.wet(),
    card: 'Something long and prehistoric is sunning itself on the crosswalk.', hint: 'Dispatch says the rain pushes the big ones out of the retention ponds. Watch the crosswalks at dawn.',
    say: [['narr', 'A seven-foot alligator lies across both lanes, mouth open, not moving. Cars are stopping. A neighbor in a bathrobe has a broom.'], ['rare_gator', 'I can shoo him. I\'ve shooed bigger. You just hit him on the nose.']],
    ask: 'She is stepping off the curb with the broom.',
    opts: [['Hold traffic, keep people back, and call the state nuisance gator line', 1, [['narr', 'You park across the lane with your lights on and keep the crowd thirty feet back. A licensed trapper from the state program arrives in twenty minutes.'], ['rare_gator', 'Well. He was very polite about it. More polite than my ex-husband.']]],
      ['Ease the cruiser forward and nudge it off the road with your front bumper', 0, [['narr', 'The alligator spins, snaps at the bumper and lunges at the curb where people are standing. You back off, hold traffic, and call the state\'s nuisance alligator line.']]],
      ['Let the neighbor try her broom while you keep all the traffic stopped', 0, [['narr', 'The alligator hisses and she jumps back into a hedge, unhurt but furious. Keep people back and call the state\'s nuisance alligator line.']]]],
    lore: 'Florida\'s wildlife commission runs a program for nuisance alligators: a licensed trapper comes out, and nobody on the street gets near it. The one on the crosswalk got a name from the neighbors. They call him Broom.' },
  { id: 'turtle', icon: '🐢', title: 'Wrong Way Home', kinds: ['marina', 'bait'], hours: [21, 3], mood: 'hope', who: 'rare_turtle', need: () => { const m = new Date().getMonth() + 1; return m >= 5 && m <= 10; },
    card: 'Tiny shapes are crawling across the lot, away from the water.', hint: 'In nesting season the hatchlings come up near the marina at night. They go where the light is.',
    say: [['narr', 'Dozens of sea turtle hatchlings, each the size of a cookie, are crawling up from the seawall toward the streetlights and the road.'], ['rare_turtle', 'They head for the brightest horizon. Out here that\'s us. Please, don\'t pick them up.']],
    ask: 'A car is pulling into the lot, headlights on.',
    opts: [['Go dark, stop that car, and call the state wildlife hotline', 1, [['narr', 'You go dark, wave the car to a stop and call it in. With the lot dark, the hatchlings turn back toward the moon on the water.'], ['rare_turtle', 'Every one of those that makes it is a small miracle. You just made about forty.']]],
      ['Scoop them into your hat and carry them down to the water', 0, [['narr', 'The volunteer stops you: sea turtles are protected, and handling them without a permit is against the law. You go dark, hold the car and call the hotline.']]],
      ['Shine your flashlight on the water so they follow it back down', 0, [['narr', 'They turn toward the beam and then circle in confusion when it moves. Lights off is what works. You go dark, hold the car and call the hotline.']]]],
    lore: 'Hatchlings find the sea by the brightest horizon. A parking lot full of lights can walk a whole nest the wrong way. On nesting nights now, the marina turns its lot lights off at nine.' },
  { id: 'ghost', icon: '🚓', title: 'Badge 77', kinds: ['garage', 'parking', 'lot', 'records', 'hq', 'substation'], hours: [2, 5.5], mood: 'eerie', who: 'rare_ghost', need: (H) => H.foggy() || Math.random() < .35,
    card: 'An old cruiser idles in the lot with its dome light off.', hint: 'Records says an old Port Meridian cruiser has been seen out before dawn. Nobody can find it in the fleet.',
    say: [['narr', 'A 1979 Port Meridian cruiser, chrome bumpers, the old gold stripe. The engine is running. A gray-haired man sits behind the wheel, looking at the building.'], ['rare_ghost', 'Forty years ago tonight I signed out of this lot for my first shift. Took me nine years to find her and fix her up.']],
    ask: 'He hasn\'t turned to look at you yet.',
    opts: [['Park behind it, call it in, and walk up to talk with the driver', 1, [['narr', 'The plate comes back to Ray Quintero, retired sergeant. He shows you the logbook from his first shift, still in the glovebox.'], ['rare_ghost', 'Here\'s all I learned in thirty years. Be the same officer at four in the morning that you are at noon.']]],
      ['Pull right alongside him and light him up with your spotlight', 0, [['narr', 'He flinches and puts both hands on the wheel. It\'s a retired sergeant, harmless, and you just treated a sad man like a felony stop. Call it in and talk first.']]],
      ['Drive on past, since an idling car at night is not your concern', 0, [['narr', 'You stop at the corner and come back. An occupied car at four in the morning outside a police building is worth a calm conversation. Call it in and talk first.']]]],
    lore: 'Sgt. Ray Quintero, Badge 77, restored his first patrol car by hand. Once a year, on the night of his first shift, he parks it outside the old building until the sun comes up.' },
  { id: 'dog', icon: '🐕', title: 'Lassie Rules', kinds: ['houses', 'apartments'], hours: [7, 19], mood: 'tension', who: 'rare_dog',
    card: 'A wet dog with a trailing leash runs up, barks, and runs off. Then back.', hint: 'Somebody on the radio says there\'s a dog on that street that knows exactly who to bring when something\'s wrong.',
    say: [['narr', 'You follow the dog around the side of a house. An elderly woman is on the ground by the garden hose, one leg bent under her.'], ['rare_dog', 'Oh thank goodness. Biscuit, you good boy. I can\'t get up, officer. My hip.']],
    ask: 'She is reaching up for your hand.',
    opts: [['Keep her still, check on her, and call rescue for a possible hip injury', 1, [['narr', 'You kneel, keep her still and warm, and call for rescue. The medics say a broken hip moved the wrong way could have made things much worse.'], ['rare_dog', 'Biscuit gets a whole hot dog tonight. And you get my peach pie, Sunday.']]],
      ['Take both her hands and help her up onto the garden bench to rest a bit', 0, [['narr', 'She cries out as you start to lift. You stop, set her down gently and call rescue. With a possible hip injury, you keep her still and let the medics move her.']]],
      ['Hand her your phone to call her family while you get back on patrol', 0, [['narr', 'You can\'t leave someone hurt on the ground. You stay, keep her still and call rescue for a possible hip injury.']]]],
    lore: 'Biscuit, a mutt with a chewed leash, ran three blocks to find an officer when Mrs. Holloway fell in her garden. The street gave him a medal made from a jar lid. He wears it to the dog park.' }
];

export function installRareFinds(H) {
  const S = H.S; S.rare = S.rare || {}; S.rareHint = S.rareHint || {};
  const inWin = (h, [a, b]) => (a < b ? h >= a && h < b : h >= a || h < b);
  let T = 3, busy = false, hintT = 40;
  function near(r) { const W = H.W, P = H.P; if (!W || H.inside) return null; let best = null, bd = 7.5;
    for (const l of W.lots) { if (r.kinds.indexOf(l.kind) < 0 || !l.door) continue; const d = Math.hypot(l.door[0] + .5 - P.x, l.door[1] + .5 - P.y); if (d < bd) { bd = d; best = l; } } return best; }
  function tick(dt) {
    if (busy || (H.mockOff && H.mockOff())) return; // tests set them off by hand (test()), so nothing fires on its own mid-test
    hintT -= dt; if (hintT <= 0) { hintT = 240; hint(); }
    T -= dt; if (T > 0) return; T = 2.5;
    if (!H.free() || Date.now() - (S.rareT || 0) < 12 * 60e3) return; // at most one rare moment every twelve minutes
    const h = H.hour();
    for (const r of RARE) { if (S.rare[r.id] || !inWin(h, r.hours) || (r.need && !r.need(H))) continue; const l = near(r); if (!l) continue; if (Math.random() > .35) return; play(r, l); return; }
  }
  // a hint on the radio, once per find, after a few shifts on the job
  function hint() { if ((H.shiftNo() || 0) < 3 || !H.free()) return; const r = RARE.find((x) => !S.rare[x.id] && !S.rareHint[x.id]); if (!r || Math.random() < .5) return; S.rareHint[r.id] = Date.now(); H.save(); H.radio('Dispatch', r.hint); }
  function play(r, l) {
    busy = true; S.rareT = Date.now(); const at = [l.door[0] + .5, l.door[1] + .5];
    const go = () => {
      const opts = r.opts.map(([t, ok, reply]) => ({ t, fx: () => { r._ok = !!ok; }, reply })).sort(() => Math.random() - .5);
      H.dialogue(r.say.concat([['choice', opts, r.ask]]), () => {
        S.rare[r.id] = Date.now(); H.save(); H.stat('rare'); H.award(r._ok ? 150 : 60, 'rare find'); H.sting(r._ok ? 'done' : 'set');
        H.banner(r.icon, 'Rare find: ' + r.title, Object.keys(S.rare).length + ' of ' + RARE.length + ' found · in your Field Journal'); busy = false;
      }, { kicker: 'RARE FIND · ' + r.title.toUpperCase(), focus: at });
    };
    H.cin.play([{ k: 'est', at, from: [-6, 5], z0: .95, z1: 1.5, d: 3.6, card: { top: 'RARE FIND', title: r.title, sub: r.card } }, { k: 'push', at, z0: 1.5, z1: 1.8, d: 2.4 }], { key: 'rare:' + r.id, mood: r.mood, big: true }, go);
  }
  const lore = RARE.map((r) => ({ id: 'rare_' + r.id, when: 'rare:' + r.id, title: r.title, text: r.lore }));
  return { tick, lore, get busy() { return busy; }, found: () => Object.keys(S.rare).length, total: RARE.length, test: (id) => { const r = RARE.find((x) => x.id === id); const l = r && near(r); if (r && l) { S.rareT = 0; play(r, l); return true; } return false; } };
}
