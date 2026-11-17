// The Patrol City soundtrack, volume two: thirty-one composed tracks, two or three per situation, each with its own
// melody, key, tempo and band. Every track has a form (intro, A, B, A again with a countermelody, outro), and the
// game rotates through a mood's tracks so a long shift doesn't loop the same eleven seconds. The tracks are rendered
// ahead of time to small MP3s (music/<id>.mp3), so the game plays files instead of synthesizing live.

// melodies: "scale degree:beats", r = rest. Eight bars (32 beats) each.
const T = {
  hope: '0:1 2:1 4:2 5:1 4:1 2:2 1:1 2:1 4:4 r:2 4:1 5:1 7:2 6:1 5:1 4:2 2:1 4:1 5:4 4:2',
  sigh: '4:2 3:1 2:1 1:2 2:2 4:3 r:1 2:2 1:1 0:1 -1:2 0:2 1:2 2:1 4:1 2:4 r:4',
  strut: '0:.5 2:.5 4:.5 5:.5 4:1 2:1 r:1 0:.5 2:.5 4:1 5:1 7:2 6:.5 5:.5 4:1 2:1 r:1 4:.5 5:.5 7:1 9:1 7:2 5:1 4:1 2:2 0:4 r:5',
  march: '0:1.5 0:.5 4:2 4:1.5 5:.5 4:2 2:1.5 4:.5 7:3 r:1 7:1.5 6:.5 5:2 4:1.5 2:.5 4:2 5:1 4:1 2:1 1:1 0:4 r:2',
  cradle: '4:3 2:1 4:2 7:2 6:3 5:1 4:4 2:3 1:1 2:2 4:2 1:6 r:2',
  moon: '7:2 r:1 6:1 4:3 r:1 2:2 4:2 5:4 4:2 r:2 7:2 9:1 7:1 6:2 4:2 2:4',
  alarm: '0:.5 0:.5 3:.5 0:.5 4:.5 0:.5 3:.5 2:.5 0:.5 0:.5 3:.5 0:.5 5:1 4:1 0:.5 0:.5 3:.5 0:.5 4:.5 0:.5 3:.5 2:.5 7:2 6:1 5:1 4:2 3:1 2:1 4:4 5:2 4:2 3:1 2:1 0:2',
  answer: '2:1 2:1 4:2 r:4 4:1 4:1 5:2 r:4 7:1 6:1 5:1 4:1 2:2 4:2 5:2 4:1 2:1 1:4',
  soul: '4:1 5:1 7:1.5 5:.5 4:1 2:1 4:2 r:1 2:1 4:1 5:1.5 4:.5 2:1 0:1 2:3 r:1 4:1 7:1 9:2 7:1 5:1 4:2 2:1 4:1 0:3',
  shanty: '0:1 4:1 4:1 4:2 2:1 4:1 5:1 7:3 r:1 7:1 5:1 4:1 2:2 0:1 1:1 2:3 r:1 0:1 4:1 4:1 4:2 7:1 6:1 5:1 4:1',
  creep: '0:2 -1:1 0:1 2:2 1:2 0:2 -2:2 -1:4 4:2 3:1 4:1 5:2 4:2 3:2 2:2 1:4',
  skip: '4:.5 4:.5 5:.5 4:.5 2:1 0:1 2:.5 2:.5 4:.5 2:.5 1:2 r:1 1:.5 2:.5 4:1 5:1 7:1 5:1 4:2 2:1 4:1 5:.5 4:.5 2:.5 1:.5 0:3 r:1 4:.5 5:.5 7:1 5:1 4:1 2:1 0:3',
  porch: '2:2 4:1 2:1 0:2 r:2 2:1 4:1 5:2 4:4 5:2 7:1 5:1 4:2 2:2 4:1 2:1 1:2 0:4',
  tide: '0:3 4:1 7:4 6:2 4:2 5:4 4:3 2:1 4:4 0:2 1:2 2:4'
};

const P = { // a few chord progressions, as scale degrees, one per bar
  pop: [0, 4, 5, 3, 0, 4, 3, 4], lift: [3, 4, 0, 5, 3, 4, 1, 4], doo: [0, 5, 3, 4, 0, 5, 3, 4], minor: [0, 5, 2, 6, 0, 5, 3, 4], mdrive: [0, 6, 5, 6, 0, 6, 3, 4],
  blues: [0, 0, 3, 0, 4, 3, 0, 4], dorian: [0, 3, 0, 3, 6, 3, 0, 4], soul: [1, 4, 0, 5, 1, 4, 0, 0], tense: [0, 0, 5, 5, 6, 6, 4, 4], walk: [0, 1, 2, 3, 4, 3, 1, 4], hold: [0, 3, 0, 4, 5, 3, 1, 4]
};

export const TRACKS = {
  // ---- title / menus ----
  title_b: { name: 'Harbor Lights', bpm: 70, root: 55, scale: 'maj', form: true, prog: P.lift, progB: P.minor, theme: T.tide, themeB: T.cradle,
    pad: { v: .045 }, strings: { v: .03 }, keys: { voice: 'piano', pat: 'alberti', v: .04 }, bass: { pat: 'whole', v: .08 }, lead: { voice: 'strings', v: .045, oct: 12 }, counter: { voice: 'flute', v: .022, oct: 12 } },
  title_c: { name: 'Oath', bpm: 66, root: 58, scale: 'maj', form: true, prog: P.hold, progB: P.lift, theme: T.march, themeB: T.hope,
    pad: { v: .04 }, strings: { v: .035 }, keys: { voice: 'piano', pat: 'arp8', v: .035 }, bass: { pat: 'half', v: .08 }, drums: { pat: 'march', v: .45 }, lead: { voice: 'brass', v: .035, oct: 0 }, counter: { voice: 'strings', v: .025, oct: 12 } },
  // ---- day patrol ----
  day_b: { name: 'Sunrise on Route 9', bpm: 96, root: 62, scale: 'maj', form: true, prog: P.pop, progB: P.lift, theme: T.strut, themeB: T.answer,
    pad: { v: .02 }, keys: { voice: 'nylon', pat: 'strum', v: .04 }, keys2: { voice: 'epiano', pat: 'offbeat', v: .026 }, bass: { pat: 'bounce', v: .085 }, drums: { pat: 'pop', v: .75 }, lead: { voice: 'flute', v: .04, oct: 12 }, counter: { voice: 'marimba', v: .025, oct: 12 } },
  day_c: { name: 'Corner Store', bpm: 108, root: 65, scale: 'mix', form: true, prog: P.blues, progB: P.walk, theme: T.skip, themeB: T.soul,
    keys: { voice: 'organ', pat: 'offbeat', v: .03 }, keys2: { voice: 'pluck', pat: 'arp8', v: .022 }, bass: { pat: 'walk', v: .085 }, drums: { pat: 'shuffle', v: .7 }, lead: { voice: 'lead', v: .03, oct: 12 }, counter: { voice: 'brass', v: .02, oct: 0 } },
  day_d: { name: 'Bicycle Bell', bpm: 112, root: 67, scale: 'maj', form: true, prog: P.doo, progB: P.pop, theme: T.hope, themeB: T.skip,
    pad: { v: .02 }, keys: { voice: 'marimba', pat: 'arp16', v: .035 }, keys2: { voice: 'vibes', pat: 'pulse8', v: .015 }, bass: { pat: 'root5', v: .08 }, drums: { pat: 'soft', v: .65 }, lead: { voice: 'bell', v: .03, oct: 12 }, counter: { voice: 'flute', v: .02, oct: 0 } },
  // ---- night patrol ----
  night_b: { name: 'Streetlamp Blues', bpm: 72, root: 60, scale: 'dor', form: true, prog: P.dorian, progB: P.blues, theme: T.moon, themeB: T.soul,
    pad: { v: .025 }, keys: { voice: 'epiano', pat: 'comp', v: .045, sev: true }, bass: { pat: 'walk', v: .08 }, drums: { pat: 'brush', v: .55 }, lead: { voice: 'vibes', v: .035, oct: 12 }, counter: { voice: 'organ', v: .015, oct: 0 } },
  night_c: { name: 'Graveyard Shift', bpm: 82, root: 57, scale: 'min', form: true, prog: P.minor, progB: P.dorian, theme: T.sigh, themeB: T.moon,
    pad: { v: .035 }, keys: { voice: 'pluck', pat: 'arp8', v: .03 }, bass: { pat: 'syncop', v: .085 }, drums: { pat: 'half', v: .6 }, lead: { voice: 'lead', v: .026, oct: 12, sparse: true }, counter: { voice: 'bell', v: .018, oct: 12 } },
  night_d: { name: '3 A.M. Diner', bpm: 68, root: 63, scale: 'mix', form: true, prog: P.soul, progB: P.hold, theme: T.porch, themeB: T.sigh,
    keys: { voice: 'epiano', pat: 'comp', v: .05, sev: true }, strings: { v: .015 }, bass: { pat: 'half', v: .075 }, drums: { pat: 'brush', v: .4 }, lead: { voice: 'flute', v: .035, oct: 12 } },
  // ---- indoors ----
  inside_b: { name: 'Waiting Room', bpm: 76, root: 64, scale: 'maj', form: true, prog: P.soul, progB: P.lift, theme: T.cradle, themeB: T.porch,
    keys: { voice: 'vibes', pat: 'comp', v: .04, sev: true }, bass: { pat: 'half', v: .07 }, drums: { pat: 'bossa', v: .35 }, lead: { voice: 'nylon', v: .04, oct: 12 } },
  inside_c: { name: 'Fluorescent', bpm: 88, root: 62, scale: 'maj', form: true, prog: P.walk, progB: P.doo, theme: T.answer, themeB: T.hope,
    keys: { voice: 'epiano', pat: 'pulse8', v: .025 }, keys2: { voice: 'marimba', pat: 'arp8', v: .02 }, bass: { pat: 'root5', v: .07 }, lead: { voice: 'bell', v: .025, oct: 12, sparse: true } },
  inside_d: { name: 'Front Desk', bpm: 94, root: 60, scale: 'mix', form: true, prog: P.blues, progB: P.soul, theme: T.soul, themeB: T.strut,
    keys: { voice: 'organ', pat: 'comp', v: .03 }, bass: { pat: 'walk', v: .075 }, drums: { pat: 'shuffle', v: .45 }, lead: { voice: 'epiano', v: .04, oct: 12 } },
  // ---- main story ----
  story_b: { name: 'The Ledger', bpm: 62, root: 56, scale: 'min', form: true, prog: P.tense, progB: P.minor, theme: T.creep, themeB: T.sigh,
    pad: { v: .04 }, strings: { v: .035 }, keys: { voice: 'piano', pat: 'sparse', v: .04 }, bass: { pat: 'whole', v: .08 }, drone: { v: .025 }, lead: { voice: 'piano', v: .05, oct: 12 }, counter: { voice: 'strings', v: .02, oct: 0 } },
  story_c: { name: 'Port Meridian Nocturne', bpm: 66, root: 59, scale: 'min', form: true, prog: P.minor, progB: P.hold, theme: T.sigh, themeB: T.tide,
    pad: { v: .035 }, strings: { v: .03 }, keys: { voice: 'piano', pat: 'alberti', v: .035 }, bass: { pat: 'half', v: .075 }, lead: { voice: 'strings', v: .045, oct: 12 }, counter: { voice: 'flute', v: .02, oct: 12 } },
  // ---- side cases ----
  side_b: { name: 'Legwork', bpm: 100, root: 62, scale: 'dor', form: true, prog: P.dorian, progB: P.walk, theme: T.strut, themeB: T.answer,
    keys: { voice: 'pluck', pat: 'arp16', v: .03 }, keys2: { voice: 'epiano', pat: 'offbeat', v: .022 }, bass: { pat: 'syncop', v: .085 }, drums: { pat: 'pop', v: .6 }, lead: { voice: 'vibes', v: .035, oct: 12 } },
  side_c: { name: 'A Name on a Bracelet', bpm: 86, root: 57, scale: 'min', form: true, prog: P.minor, progB: P.lift, theme: T.creep, themeB: T.hope,
    pad: { v: .03 }, keys: { voice: 'nylon', pat: 'arp8', v: .04 }, bass: { pat: 'half', v: .08 }, drums: { pat: 'half', v: .5 }, lead: { voice: 'flute', v: .035, oct: 12 }, counter: { voice: 'strings', v: .02, oct: 0 } },
  side_d: { name: 'Asking Around', bpm: 110, root: 67, scale: 'mix', form: true, prog: P.blues, progB: P.pop, theme: T.skip, themeB: T.strut,
    keys: { voice: 'marimba', pat: 'arp16', v: .035 }, keys2: { voice: 'organ', pat: 'offbeat', v: .02 }, bass: { pat: 'bounce', v: .085 }, drums: { pat: 'shuffle', v: .6 }, lead: { voice: 'lead', v: .026, oct: 12, sparse: true } },
  // ---- en route ----
  call_b: { name: 'Code 2', bpm: 116, root: 60, scale: 'min', form: true, prog: P.mdrive, progB: P.tense, theme: T.alarm, themeB: T.creep,
    pad: { v: .025 }, keys: { voice: 'stac', pat: 'arp16', v: .026 }, bass: { pat: 'eighths', v: .085 }, drums: { pat: 'pulse', v: .7 }, lead: { voice: 'brass', v: .025, oct: 0, sparse: true } },
  call_c: { name: 'Crosstown', bpm: 120, root: 64, scale: 'dor', form: true, prog: P.dorian, progB: P.mdrive, theme: T.strut, themeB: T.alarm,
    keys: { voice: 'pluck', pat: 'arp16', v: .03 }, strings: { v: .02 }, bass: { pat: 'drive', v: .08 }, drums: { pat: 'train', v: .7 }, lead: { voice: 'lead', v: .025, oct: 12, sparse: true } },
  call_d: { name: 'Green Lights', bpm: 112, root: 62, scale: 'min', form: true, prog: P.minor, progB: P.dorian, theme: T.answer, themeB: T.alarm,
    pad: { v: .03 }, keys: { voice: 'stac', pat: 'pulse8', v: .022 }, keys2: { voice: 'bell', pat: 'arp8', v: .014 }, bass: { pat: 'eighths', v: .085 }, drums: { pat: 'drive', v: .6 } },
  // ---- priority one ----
  urgent_b: { name: 'All Units', bpm: 140, root: 62, scale: 'min', form: true, prog: P.mdrive, progB: P.tense, theme: T.alarm, themeB: T.march,
    pad: { v: .025 }, keys: { voice: 'stac', pat: 'arp16', v: .03 }, keys2: { voice: 'brass', pat: 'stab', v: .032 }, bass: { pat: 'drive', v: .085 }, drums: { pat: 'drive', v: .8 }, lead: { voice: 'brass', v: .032, oct: 12 } },
  urgent_c: { name: 'Lights and Sirens', bpm: 132, root: 65, scale: 'min', form: true, prog: P.tense, progB: P.minor, theme: T.creep, themeB: T.alarm,
    strings: { v: .03 }, keys: { voice: 'stac', pat: 'pulse8', v: .028 }, bass: { pat: 'eighths', v: .085 }, drums: { pat: 'march', v: .75 }, lead: { voice: 'strings', v: .04, oct: 12 }, counter: { voice: 'brass', v: .02, oct: 0 } },
  // ---- on scene ----
  scene_b: { name: 'Contact', bpm: 80, root: 57, scale: 'min', form: true, prog: P.tense, progB: P.minor, theme: T.creep, themeB: T.sigh,
    pad: { v: .04 }, keys: { voice: 'piano', pat: 'sparse', v: .035 }, bass: { pat: 'whole', v: .07 }, drone: { v: .03 }, lead: { voice: 'vibes', v: .025, oct: 12, sparse: true } },
  scene_c: { name: 'Hands Where I Can See Them', bpm: 90, root: 60, scale: 'min', form: true, prog: P.mdrive, progB: P.tense, theme: T.sigh, themeB: T.creep,
    pad: { v: .03 }, strings: { v: .025 }, keys: { voice: 'pluck', pat: 'arp8', v: .025 }, bass: { pat: 'syncop', v: .075 }, drums: { pat: 'half', v: .45 } },
  // ---- debrief ----
  debrief_b: { name: 'End of Watch', bpm: 72, root: 62, scale: 'maj', form: true, prog: P.hold, progB: P.lift, theme: T.porch, themeB: T.hope,
    pad: { v: .035 }, strings: { v: .03 }, keys: { voice: 'piano', pat: 'arp8', v: .04 }, bass: { pat: 'half', v: .07 }, lead: { voice: 'flute', v: .035, oct: 12 }, counter: { voice: 'strings', v: .02, oct: 0 } },
  debrief_c: { name: 'Report Written', bpm: 84, root: 65, scale: 'maj', form: true, prog: P.pop, progB: P.soul, theme: T.answer, themeB: T.cradle,
    keys: { voice: 'epiano', pat: 'comp', v: .045 }, bass: { pat: 'root5', v: .07 }, drums: { pat: 'brush', v: .4 }, lead: { voice: 'vibes', v: .035, oct: 12 } },
  // ---- neighbors, friends and the off-duty life ----
  friend_b: { name: 'Porch Light', bpm: 84, root: 62, scale: 'maj', form: true, prog: P.doo, progB: P.soul, theme: T.porch, themeB: T.soul,
    keys: { voice: 'nylon', pat: 'strum', v: .04 }, bass: { pat: 'bounce', v: .07 }, drums: { pat: 'bossa', v: .4 }, lead: { voice: 'flute', v: .035, oct: 12 }, counter: { voice: 'vibes', v: .02, oct: 0 } },
  friend_c: { name: 'Saturday at the Plaza', bpm: 104, root: 64, scale: 'mix', form: true, prog: P.blues, progB: P.doo, theme: T.soul, themeB: T.skip,
    keys: { voice: 'organ', pat: 'offbeat', v: .03 }, keys2: { voice: 'epiano', pat: 'comp', v: .025 }, bass: { pat: 'walk', v: .085 }, drums: { pat: 'shuffle', v: .65 }, lead: { voice: 'brass', v: .028, oct: 12 }, counter: { voice: 'organ', v: .015, oct: 0 } },
  friend_d: { name: 'Key Lime Pie', bpm: 92, root: 67, scale: 'maj', form: true, prog: P.pop, progB: P.walk, theme: T.skip, themeB: T.porch,
    pad: { v: .02 }, keys: { voice: 'piano', pat: 'alberti', v: .035 }, bass: { pat: 'root5', v: .07 }, drums: { pat: 'soft', v: .5 }, lead: { voice: 'bell', v: .03, oct: 12 } },
  // ---- on the water ----
  water_b: { name: 'Shanty for the River', bpm: 96, root: 62, scale: 'dor', form: true, prog: P.dorian, progB: P.pop, theme: T.shanty, themeB: T.tide,
    keys: { voice: 'nylon', pat: 'strum', v: .04 }, keys2: { voice: 'organ', pat: 'offbeat', v: .016 }, bass: { pat: 'march', v: .08 }, drums: { pat: 'train', v: .5 }, lead: { voice: 'flute', v: .04, oct: 12 }, counter: { voice: 'strings', v: .02, oct: 0 } },
  water_c: { name: 'Cypress Landing', bpm: 70, root: 57, scale: 'min', form: true, prog: P.minor, progB: P.hold, theme: T.tide, themeB: T.moon,
    pad: { v: .04 }, keys: { voice: 'vibes', pat: 'arp8', v: .03 }, bass: { pat: 'whole', v: .07 }, lead: { voice: 'strings', v: .04, oct: 12 }, counter: { voice: 'flute', v: .018, oct: 12 } },
  water_d: { name: 'Slow Wake', bpm: 80, root: 65, scale: 'maj', form: true, prog: P.lift, progB: P.doo, theme: T.cradle, themeB: T.shanty,
    pad: { v: .03 }, keys: { voice: 'marimba', pat: 'arp8', v: .035 }, bass: { pat: 'half', v: .07 }, drums: { pat: 'soft', v: .4 }, lead: { voice: 'nylon', v: .04, oct: 12 } }
};

// which tracks play for each situation, in rotation. 'orig' is the section of the first recorded score.
export const ROTATION = {
  title: ['orig', 'title_b', 'title_c'], day: ['orig', 'day_b', 'day_c', 'day_d'], night: ['orig', 'night_b', 'night_c', 'night_d'], inside: ['orig', 'inside_b', 'inside_c', 'inside_d'],
  story: ['orig', 'story_b', 'story_c'], side: ['orig', 'side_b', 'side_c', 'side_d'], call: ['orig', 'call_b', 'call_c', 'call_d'], urgent: ['orig', 'urgent_b', 'urgent_c'],
  scene: ['orig', 'scene_b', 'scene_c'], debrief: ['debrief_b', 'debrief_c'], friend: ['friend_b', 'friend_c', 'friend_d'], water: ['orig', 'water_b', 'water_c', 'water_d']
};
// how long each composed track runs before the next one: 32 bars, plus a short reverb tail
export const trackLen = (m) => 32 * 4 * 60 / m.bpm;
