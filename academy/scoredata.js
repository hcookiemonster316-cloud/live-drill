// The Patrol City soundtrack, volume three: a cop-show jazz-funk band (Rhodes, clavinet, wah guitar, finger bass,
// horns, tenor sax, muted trumpet, vibes, a breakbeat kit) playing one theme, "Port Meridian". Every situation has two
// arrangements; there are three themes: "Port Meridian" (the main theme), "End of Watch" (the heart) and "All Units"
// (the action riff), each simple enough to hum. Arrangements of these themes (day patrol, night, indoors, story, side cases, en route, priority one, on scene,
// debrief, neighbors, marine), and every signal in the game (call accepted, case closed, promotion) is a piece of its
// hook, so players learn one tune and hear it everywhere. Each track has a form (intro, A, B, A again with a
// countermelody, outro) and is rendered ahead of time to a small MP3 (music/<id>.mp3) by tools/render-score.js.

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

// the main theme, "Port Meridian": a hook that climbs the minor pentatonic and falls back, then a bridge that reaches up
const JT = {
  // the hook, "Port Meridian": a long A that leaps up to D and spins a quick C-D-C triplet turn, then a dotted G-A that
  // drops to E and settles on D. The call comes back and climbs (C-D, F, E-D) to the peak, a held high A that tumbles
  // down; a B-C lean, a chromatic G# that pulls into A; a low run up from C with a triplet fall (G-F-E), and home through
  // a low B to D. Dotted rhythms, triplets, long holds and quick pickups across an octave and a half: still hummable in
  // two-bar breaths, but nothing else in the game sounds like it.
  main: '4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 3:3/4 4:1/4 1:1 0:2 4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1/2 5:1/2 6:3/4 7:1/4 9:3/2 8:1/2 7:1 11:3/2 10:1/2 9:1/2 8:1/2 7:1 5:3/4 6:1/4 4:1 3#:1/2 4:3/2 -1:1/2 0:1/2 2:1/2 4:1/2 3:1/3 2:1/3 1:1/3 2:1 1:3/2 -2:1/2 0:2',
  // the bridge reaches up in long notes, then falls back to the hook's last note
  bridge: '7:3 6:1 4:4 3:3 4:1 6:4 7:3 9:1 7:2 6:2 4:4 r:4',
  // the hook at half speed, for quiet scenes
  calm: '4:3 7:1 6:2/3 7:2/3 6:2/3 4:2 3:3/2 4:1/2 1:2 0:4 4:3 7:1 6:2/3 7:2/3 6:2/3 4:1 5:1 6:3/2 7:1/2 9:3 8:1 7:2',
  // theme two, "End of Watch": the heart. It starts high and sighs down, then reaches back up (night, story, debrief)
  heart: '7:1.5 6:.5 4:2 2:2 3:2 7:1.5 6:.5 4:2 6:1 7:1 9:2 9:1.5 7:.5 6:2 4:2 3:2 2:1 3:1 4:2 0:4',
  // theme three, "All Units": the action riff, low and punchy, that kicks up at the end (calls and pursuits)
  units: '0:.5 0:.5 3:.5 0:.5 4:1 r:.5 3:.5 6:.5 4:.5 3:.5 0:.5 r:2 0:.5 0:.5 3:.5 0:.5 4:1 r:.5 6:.5 7:1 6:.5 4:.5 r:2 7:.5 7:.5 6:.5 4:.5 6:1 r:.5 4:.5 3:.5 2:.5 3:.5 4:.5 r:2 0:.5 0:.5 3:.5 0:.5 4:1 r:.5 3:.5 0:2 r:2',
  // altered versions for what's happening: just the opening idea with space around it (tension, waiting), the heart
  // theme broken off the same way, and the action riff slowed to half speed (a standoff)
  frag: '4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 3:3/4 4:1/4 1:1 0:2 r:8 4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1/2 5:1/2 6:3/4 7:1/4 9:3/2 8:1/2 7:1 r:8',
  heartFrag: '7:1.5 6:.5 4:2 2:2 3:2 r:8 7:1.5 6:.5 4:2 6:1 7:1 9:2 r:8',
  unitsHalf: '0:1 0:1 3:1 0:1 4:2 r:1 3:1 6:1 4:1 3:1 0:1 r:4 0:1 0:1 3:1 0:1 4:2 r:1 3:1 0:4 r:4',
  // the hook in a hurry, for pursuits. At speed the ornaments would smear, so this is the tune's skeleton: the same
  // shape and the same peak without the triplet turns and dotted pickups (the main version carries those at walking
  // tempo, and the half-speed version lets them breathe), so the melody sounds right fast, slow and in between
  chaseB: '4:3/4 7:1/4 6:1/2 4:1/2 3:1/2 1:1/2 0:1 4:3/4 7:1/4 6:1/2 5:1/2 6:1/2 9:3/4 8:1/4 7:1/2 11:1 9:1/2 7:1/2 5:1/2 4:1/2 3#:1/2 4:1/2 -1:1/2 2:1/2 4:1/2 2:1/2 1:1 0:1 4:3/4 7:1/4 6:1/2 4:1/2 3:1/2 1:1/2 0:1 4:3/4 7:1/4 6:1/2 5:1/2 6:1/2 9:3/4 8:1/4 7:1/2 r:8'
};
const JF = { vamp: [0, 3, 0, 3, 0, 3, 6, 4], bridge: [2, 3, 6, 0, 2, 3, 4, 4], lift: [3, 4, 2, 5, 3, 4, 6, 4], night: [0, 3, 1, 4, 0, 3, 6, 4], dark: [0, 5, 3, 4, 0, 5, 6, 4], porch: [0, 3, 6, 3, 0, 3, 4, 4], chase: [0, 0, 5, 6, 0, 0, 3, 4], chaseB: [5, 6, 0, 0, 5, 6, 4, 4] };
const P = { // a few chord progressions, as scale degrees, one per bar
  pop: [0, 4, 5, 3, 0, 4, 3, 4], lift: [3, 4, 0, 5, 3, 4, 1, 4], doo: [0, 5, 3, 4, 0, 5, 3, 4], minor: [0, 5, 2, 6, 0, 5, 3, 4], mdrive: [0, 6, 5, 6, 0, 6, 3, 4],
  blues: [0, 0, 3, 0, 4, 3, 0, 4], dorian: [0, 3, 0, 3, 6, 3, 0, 4], soul: [1, 4, 0, 5, 1, 4, 0, 0], tense: [0, 0, 5, 5, 6, 6, 4, 4], walk: [0, 1, 2, 3, 4, 3, 1, 4], hold: [0, 3, 0, 4, 5, 3, 1, 4]
};

export const TRACKS = {
  // ---- title ----
  title_1: { name: 'Port Meridian (Main Title)', bpm: 84, root: 62, scale: 'dor', form: true, swing: .12, prog: JF.vamp, progB: JF.bridge, theme: JT.main, themeB: JT.bridge,
    band: { rhodes: { pat: 'funk', v: .03 }, wah: { v: .016 }, horns: { v: .018 }, bass: { pat: 'funk', v: .095 } }, drums: { pat: 'funk', v: .75 }, lead: { voice: 'horns', v: .03, oct: 12 }, leadB: { voice: 'sax', v: .042, oct: 0 }, counter: { voice: 'vibes', v: .02, oct: 12 } },
  title_2: { name: 'Port Meridian (Locker Room)', bpm: 70, root: 62, scale: 'dor', form: true, swing: .2, prog: JF.night, progB: JF.bridge, theme: JT.heart, themeB: JT.calm,
    band: { rhodes: { pat: 'ballad', v: .036 }, bass: { pat: 'walk', v: .085 } }, drums: { pat: 'jazz', v: .55 }, lead: { voice: 'vibes', v: .034, oct: 12 }, leadB: { voice: 'mute', v: .03, oct: 12 } },
  // ---- day patrol ----
  day_1: { name: 'Day Watch', bpm: 96, root: 62, scale: 'dor', form: true, swing: .14, prog: JF.vamp, progB: JF.bridge, theme: JT.main, themeB: JT.bridge,
    band: { rhodes: { pat: 'funk', v: .032 }, wah: { v: .02, busy: true }, clav: { v: .016 }, bass: { pat: 'funk', v: .1 } }, drums: { pat: 'funk', v: .85 }, lead: { voice: 'mute', v: .036, oct: 12 }, leadB: { voice: 'sax', v: .04, oct: 0 }, counter: { voice: 'vibes', v: .02, oct: 12 } },
  day_2: { name: 'Coffee and a Cruiser', bpm: 104, root: 64, scale: 'dor', form: true, swing: .1, prog: JF.vamp, progB: JF.lift, theme: JT.main, themeB: JT.bridge,
    band: { clav: { v: .02 }, rhodes: { pat: 'push', v: .026 }, bass: { pat: 'funk', v: .095 } }, drums: { pat: 'lowride', v: .8 }, lead: { voice: 'flute', v: .04, oct: 12 }, leadB: { voice: 'mute', v: .034, oct: 12 }, counter: { voice: 'sax', v: .022, oct: 0 } },
  // ---- night patrol ----
  night_1: { name: 'Night Shift', bpm: 74, root: 62, scale: 'dor', form: true, swing: .2, prog: JF.night, progB: JF.bridge, theme: JT.heart, themeB: JT.calm,
    band: { rhodes: { pat: 'ballad', v: .034 }, vamp: { v: .012 }, bass: { pat: 'walk', v: .095 } }, drums: { pat: 'jazz', v: .75 }, drumsB: { pat: 'lowride', v: .6 }, lead: { voice: 'sax', v: .042, oct: 0 }, leadB: { voice: 'vibes', v: .03, oct: 12 }, counter: { voice: 'mute', v: .018, oct: 12 } },
  night_2: { name: 'Streetlamps', bpm: 82, root: 60, scale: 'dor', form: true, swing: .16, prog: JF.night, progB: JF.lift, theme: JT.main, themeB: JT.heart,
    band: { rhodes: { pat: 'push', v: .028 }, wah: { v: .014 }, bass: { pat: 'funk', v: .085 } }, drums: { pat: 'lowride', v: .7 }, lead: { voice: 'mute', v: .034, oct: 12 }, leadB: { voice: 'sax', v: .04, oct: 0 } },
  // ---- indoors ----
  inside_1: { name: 'Front Desk', bpm: 80, root: 65, scale: 'dor', form: true, swing: .14, prog: JF.night, progB: JF.lift, theme: JT.main, themeB: JT.calm,
    band: { rhodes: { pat: 'push', v: .026 }, bass: { pat: 'walk', v: .075 } }, drums: { pat: 'brush', v: .45 }, lead: { voice: 'vibes', v: .028, oct: 12, sparse: true }, leadB: { voice: 'vibes', v: .028, oct: 12 } },
  inside_2: { name: 'Records Room', bpm: 70, root: 62, scale: 'dor', form: true, swing: .2, prog: JF.night, progB: JF.bridge, theme: JT.frag, themeB: JT.main,
    band: { rhodes: { pat: 'ballad', v: .03 }, bass: { pat: 'walk', v: .07 } }, drums: { pat: 'jazz', v: .4 }, lead: { voice: 'mute', v: .026, oct: 12, sparse: true } },
  // ---- story ----
  story_1: { name: 'The Gray Sedan', bpm: 66, root: 62, scale: 'min', form: true, swing: .18, prog: JF.dark, progB: JF.chaseB, theme: JT.heart, themeB: JT.calm,
    band: { rhodes: { pat: 'ballad', v: .032 }, vamp: { v: .016 }, bass: { pat: 'walk', v: .08 } }, drums: { pat: 'jazz', v: .45 }, drone: { v: .02 }, lead: { voice: 'sax', v: .04, oct: 0 }, leadB: { voice: 'mute', v: .03, oct: 12 } },
  story_2: { name: 'The Ledger', bpm: 60, root: 57, scale: 'min', form: true, swing: .2, prog: JF.dark, progB: JF.dark, theme: JT.heart, themeB: JT.frag,
    band: { rhodes: { pat: 'ballad', v: .03 }, vamp: { v: .02 } }, drone: { v: .025 }, lead: { voice: 'vibes', v: .03, oct: 12, sparse: true }, leadB: { voice: 'sax', v: .036, oct: 0 } },
  // ---- side cases ----
  side_1: { name: 'Legwork', bpm: 100, root: 62, scale: 'dor', form: true, swing: .12, prog: JF.vamp, progB: JF.lift, theme: JT.main, themeB: JT.bridge,
    band: { clav: { v: .018 }, wah: { v: .016 }, bass: { pat: 'funk', v: .095 } }, drums: { pat: 'breaks', v: .75 }, lead: { voice: 'mute', v: .032, oct: 12 }, leadB: { voice: 'flute', v: .036, oct: 12 } },
  side_2: { name: 'Asking Around', bpm: 108, root: 67, scale: 'dor', form: true, swing: .1, prog: JF.vamp, progB: JF.bridge, theme: JT.main, themeB: JT.calm,
    band: { rhodes: { pat: 'funk', v: .028 }, clav: { v: .014 }, bass: { pat: 'funk', v: .09 } }, drums: { pat: 'funk', v: .7 }, lead: { voice: 'sax', v: .038, oct: -12 }, leadB: { voice: 'vibes', v: .028, oct: 12 } },
  // ---- en route ----
  call_1: { name: 'Code 2', bpm: 116, root: 62, scale: 'min', form: true, swing: .06, prog: JF.chase, progB: JF.chaseB, theme: JT.units, themeB: JT.chaseB,
    band: { rhodes: { pat: 'push', v: .022 }, wah: { v: .022, busy: true }, bass: { pat: 'octaves', v: .095 } }, drums: { pat: 'funk', v: .85 }, lead: { voice: 'mute', v: .034, oct: 12 }, leadB: { voice: 'horns', v: .026, oct: 12 } },
  call_2: { name: 'Crosstown', bpm: 120, root: 64, scale: 'min', form: true, swing: .06, prog: JF.chase, progB: JF.chaseB, theme: JT.main, themeB: JT.chaseB,
    band: { clav: { v: .018 }, wah: { v: .018, busy: true }, bass: { pat: 'funk', v: .095 } }, drums: { pat: 'breaks', v: .85 }, lead: { voice: 'sax', v: .04, oct: 0 }, leadB: { voice: 'sax', v: .04, oct: 0 } },
  // ---- priority one ----
  urgent_1: { name: 'All Units', bpm: 128, root: 62, scale: 'min', form: true, swing: .06, prog: JF.chase, progB: JF.chaseB, theme: JT.units, themeB: JT.chaseB,
    band: { rhodes: { pat: 'push', v: .024 }, wah: { v: .024, busy: true }, horns: { v: .026 }, bass: { pat: 'octaves', v: .1 } }, drums: { pat: 'pursuit', v: .95 }, lead: { voice: 'horns', v: .03, oct: 12 }, leadB: { voice: 'horns', v: .03, oct: 12 } },
  urgent_2: { name: 'Lights and Sirens', bpm: 136, root: 65, scale: 'min', form: true, swing: .04, prog: JF.chase, progB: JF.chaseB, theme: JT.chaseB, themeB: JT.units,
    band: { wah: { v: .024, busy: true }, horns: { v: .028 }, clav: { v: .016 }, bass: { pat: 'octaves', v: .1 } }, drums: { pat: 'pursuit', v: 1 }, lead: { voice: 'horns', v: .03, oct: 12 }, leadB: { voice: 'sax', v: .042, oct: 0 } },
  // ---- on scene ----
  scene_1: { name: 'Contact', bpm: 84, root: 62, scale: 'min', form: true, swing: .1, prog: JF.dark, progB: JF.dark, theme: JT.heartFrag, themeB: JT.heart,
    band: { rhodes: { pat: 'ballad', v: .026 }, bass: { pat: 'walk', v: .07 } }, drone: { v: .025 }, lead: { voice: 'mute', v: .026, oct: 12, sparse: true } },
  scene_2: { name: 'Hands Where I Can See Them', bpm: 90, root: 60, scale: 'min', form: true, swing: .1, prog: JF.dark, progB: JF.chaseB, theme: JT.unitsHalf, themeB: JT.frag,
    band: { wah: { v: .012 }, bass: { pat: 'funk', v: .08 } }, drums: { pat: 'lowride', v: .5 }, drone: { v: .02 }, lead: { voice: 'vibes', v: .026, oct: 12, sparse: true }, leadB: { voice: 'sax', v: .034, oct: 0 } },
  // ---- debrief ----
  debrief_1: { name: 'End of Watch', bpm: 72, root: 62, scale: 'dor', form: true, swing: .2, prog: JF.night, progB: JF.lift, theme: JT.heart, themeB: JT.calm,
    band: { rhodes: { pat: 'ballad', v: .032 }, vamp: { v: .012 }, bass: { pat: 'walk', v: .08 } }, drums: { pat: 'jazz', v: .5 }, lead: { voice: 'sax', v: .04, oct: 0 }, leadB: { voice: 'vibes', v: .028, oct: 12 } },
  debrief_2: { name: 'Report Written', bpm: 86, root: 65, scale: 'maj', form: true, swing: .14, prog: JF.vamp, progB: JF.lift, theme: JT.main, themeB: JT.bridge,
    band: { rhodes: { pat: 'funk', v: .026 }, bass: { pat: 'funk', v: .085 } }, drums: { pat: 'lowride', v: .6 }, lead: { voice: 'vibes', v: .03, oct: 12 }, leadB: { voice: 'mute', v: .03, oct: 12 } },
  // ---- neighbors and friends ----
  friend_1: { name: 'Porch Light', bpm: 84, root: 65, scale: 'mix', form: true, swing: .16, prog: JF.porch, progB: JF.lift, theme: JT.heart, themeB: JT.main,
    band: { rhodes: { pat: 'push', v: .028 }, bass: { pat: 'walk', v: .08 } }, drums: { pat: 'brush', v: .5 }, lead: { voice: 'flute', v: .038, oct: 12 }, leadB: { voice: 'vibes', v: .028, oct: 12 } },
  friend_2: { name: 'Saturday at the Plaza', bpm: 102, root: 67, scale: 'mix', form: true, swing: .12, prog: JF.porch, progB: JF.lift, theme: JT.main, themeB: JT.bridge,
    band: { clav: { v: .016 }, rhodes: { pat: 'funk', v: .024 }, horns: { v: .016 }, bass: { pat: 'funk', v: .09 } }, drums: { pat: 'lowride', v: .75 }, lead: { voice: 'mute', v: .034, oct: 12 }, leadB: { voice: 'flute', v: .036, oct: 12 } },
  // ---- marine patrol ----
  water_1: { name: 'Marine Patrol', bpm: 86, root: 62, scale: 'mix', form: true, swing: .14, prog: JF.porch, progB: JF.lift, theme: JT.main, themeB: JT.calm,
    band: { rhodes: { pat: 'push', v: .024 }, bass: { pat: 'funk', v: .08 } }, drums: { pat: 'lowride', v: .6 }, lead: { voice: 'vibes', v: .032, oct: 12 }, leadB: { voice: 'flute', v: .036, oct: 12 } },
  water_2: { name: 'Slow Wake', bpm: 74, root: 60, scale: 'dor', form: true, swing: .2, prog: JF.night, progB: JF.porch, theme: JT.heart, themeB: JT.main,
    band: { rhodes: { pat: 'ballad', v: .028 }, vamp: { v: .012 }, bass: { pat: 'walk', v: .07 } }, drums: { pat: 'jazz', v: .45 }, lead: { voice: 'flute', v: .036, oct: 12 }, leadB: { voice: 'sax', v: .034, oct: 0 } }
};

// the original Patrol City themes (the live synth score), rendered to files as the first track of each mood
const BASE = { title: ['Port Meridian', 72], day: ['Day Watch', 100], night: ['Night Watch', 78], inside: ['Indoors', 70], story: ['The Gray Sedan', 64], side: ['Side Case', 104],
  call: ['En Route', 112], urgent: ['Priority One', 136], scene: ['On Scene', 84], debrief: ['Debrief', 76], friend: ['Neighbors', 80], water: ['Marine Patrol', 84] };
export const META = {}; for (const k in TRACKS) META[k] = { name: TRACKS[k].name, bpm: TRACKS[k].bpm };
// which tracks play for each situation, in rotation
export const ROTATION = {};
for (const k in BASE) ROTATION[k] = Object.keys(TRACKS).filter((t) => t.indexOf(k + '_') === 0);
// how long each composed track runs before the next one: 32 bars, plus a short reverb tail
export const trackLen = (m) => 32 * 4 * 60 / m.bpm;
