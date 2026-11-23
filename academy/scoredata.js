// The Patrol City soundtrack, volume three: a cop-show jazz-funk band (Rhodes, clavinet, wah guitar, finger bass,
// horns, tenor sax, muted trumpet, vibes, a breakbeat kit) playing one theme, "Port Meridian". Every situation has two
// arrangements; there are three themes: "Port Meridian" (the main theme), "End of Watch" (the heart) and "All Units"
// (the action riff), each simple enough to hum. Arrangements of these themes (day patrol, night, indoors, story, side cases, en route, priority one, on scene,
// debrief, neighbors, marine), and every signal in the game (call accepted, case closed, promotion) is a piece of its
// hook, so players learn one tune and hear it everywhere. Each track has a form (intro, A, B, A again with a
// countermelody, outro) and is rendered ahead of time to a small MP3 (music/<id>.mp3) by tools/render-score.js.

// Catchy without wearing out: on the calm tracks the first A section only hints at the hook (its opening phrase with
// room around it, themeA1) and the full tune arrives in the second A, so the hook lands as a payoff, not a loop.
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
// themes born from the hook (each opens with the hook's leap and turn, or the heart theme), for the districts, units and shifts
const SUB = {
  square: '4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 5:1 4:1 2:1 4:1 6:3/2 9:1/2 8:1/3 9:1/3 8:1/3 6:1 7:2 9:1 7:1 8:1 7:1 6:1 4:1 5:1/2 4:1/2 2:1 4:2 4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 1:1 2:1 0:2',
  corner: 'r:1/2 4:1 7:1/2 6:1/2 4:1/2 3:1 2:1/2 0:1 r:1/2 2:1/2 3:1/2 4:1 r:1/2 4:1 7:1/2 6:1/2 4:1/2 3:1 7:1/2 9:1 7:1/2 6:1/2 4:1/2 6:1 4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 3:1/2 2:1/2 0:1 2:1/2 3:1/2 4:1 -1:1/2 0:1/2 2:1/2 4:1/2 3:1 2:1/2 1:1/2 0:4',
  rail: '4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 3:1 2:1 0:2 3:3/2 6:1/2 5:1/3 6:1/3 5:1/3 3:1 2:1 0:1 -1:2 4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 6:1 4:1 3:2 2:1 3:1 2:1 0:1 0:4',
  longroad: '4:3 7:1 6:2/3 7:2/3 6:2/3 4:2 3:3 2:1 0:4 r:2 4:1 7:1 6:2 4:2 3:1 2:1 1:1 -1:1 0:4',
  bounce: '4:1/2 4:1/2 7:1/2 6:1/2 4:1 2:1 3:1/2 4:1/2 1:1 0:2 4:1/2 4:1/2 7:1/2 6:1/2 4:1 5:1 6:1/2 7:1/2 9:1 7:2 9:1/2 9:1/2 8:1/2 7:1/2 6:1 4:1 5:1/2 6:1/2 4:1 3#:1/2 4:3/2 2:1/2 3:1/2 4:1/2 2:1/2 1:1 2:1 0:4',
  tideline: '4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 4:1 5:1 7:2 2:3/2 5:1/2 4:1/3 5:1/3 4:1/3 2:1 2:1 3:1 4:2 7:2 6:1 5:1 4:2 2:1 1:1 0:1 2:1 4:1 2:1 0:4',
  inM: 'r:16 4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 r:4 4:3/2 7:1/2 6:1/3 7:1/3 6:1/3 4:1 1:4',
  outM: '4:3 7:1 6:2/3 7:2/3 6:2/3 4:2 0:8 r:16',
  inH: 'r:16 7:3/2 6:1/2 4:2 r:4 7:3/2 6:1/2 4:1 6:1 7:4',
  outH: '7:3 6:1 4:4 3:4 0:4 r:16'
};
// more melodies: every district, unit and shift, and the second arrangement of several situations, has a tune of its own.
// The hook still opens or closes most of them (intros, outros, B sections), so the score stays one family.
const MEL = {
  founders: '0:1 4:1 7:3/2 6:1/2 5:1 4:1 2:2 3:1 5:1 8:3/2 7:1/2 6:3 r:1 7:1/2 8:1/2 9:1 7:1 5:1 6:1/2 7:1/2 8:1 6:1 4:1 5:1 3:1 4:1/2 2:1/2 1:1 0:3 r:1',
  cornerstore: 'r:1/2 2:1/2 3:1/2 4:1 2:1/2 0:1 2:1/2 3:1/2 2:1/2 0:1/2 -1:1 0:1 r:1/2 2:1/2 3:1/2 4:1 6:1/2 7:1 6:1/2 4:1/2 3:1 4:2 7:1 6:1/2 4:1/2 6:1 4:1 3:1/2 4:1/2 3:1/2 2:1/2 0:2 2:1 3:1 4:1/2 6:1/2 4:1 2:1/2 0:1/2 0:3',
  riverpark: '2:1 4:1 9:2 8:1 7:1 4:2 5:1 6:1 7:3/2 4:1/2 5:4 2:1 4:1 9:3/2 11:1/2 10:1 9:1 7:2 8:1/2 7:1/2 6:1 5:1 3:1 4:4',
  railyard: '0:3/4 0:1/4 3:1 2:1/2 0:1/2 -1:1 0:3/4 0:1/4 3:1 5:1 4:1 0:3/4 0:1/4 3:1 2:1/2 0:1/2 -2:1 -1:2 r:2 7:1 6:1 5:1/2 4:1/2 3:1 4:1 2:1 3:2 5:1/2 4:1/2 3:1/2 2:1/2 1:1 2:1 0:4',
  darkroad: '4:2 3:1 2:1 1:3 r:1 4:3/2 5:1/2 6:1 4:1 7:4 6:1 5#:1 6:2 4:2 2:2 3:1 2:1/2 1:1/2 -1:2 0:4',
  stackup: '0:1/2 0:1/2 0:1/2 3:1/2 4:2 3:1/2 3:1/2 3:1/2 2:1/2 0:2 0:1/2 0:1/2 0:1/2 3:1/2 4:1 6:1 7:3 r:1 7:1/2 6:1/2 4:1 6:1/2 4:1/2 3:1 4:1/2 3:1/2 2:1 3:2 2:1/2 3:1/2 4:1/2 6:1/2 7:1 6:1 7:4',
  gooddog: '4:1/2 6:1/2 7:1/2 6:1/2 4:1 2:1 3:1/2 4:1/2 2:1/2 1:1/2 0:2 4:1/2 6:1/2 7:1/2 9:1/2 8:1 7:1 6:2 r:2 7:1/2 7:1/2 6:1/2 4:1/2 6:1/2 6:1/2 4:1/2 2:1/2 3:1/2 3:1/2 2:1/2 0:1/2 2:2 4:1/2 2:1/2 4:1/2 6:1/2 7:1 9:1 7:4',
  talkdown: '7:3 6:1 4:2 5:2 6:3 4:1 2:4 3:2 4:1 5:1 6:2 7:2 5:3/2 4:1/2 3:1 1:1 0:4',
  channel: '0:3/2 2:1/2 4:1 7:1 6:3/2 4:1/2 5:2 4:3/2 2:1/2 0:1 2:1 1:3 r:1 0:3/2 2:1/2 4:1 7:1 9:3/2 8:1/2 7:2 6:1 4:1 5:1 1:1 0:4',
  checkin: '2:1 3:1 4:2 4:1 5:1 4:2 7:1 6:1 5:1 4:1 3:3 r:1 2:1 3:1 4:3/2 2:1/2 1:1 2:1 0:2 4:1 5:1 6:1 5:1 4:4',
  overpass: '4:1 4:1/2 5:1/2 7:1 4:1 6:1 5:1 4:2 2:1 2:1/2 3:1/2 4:1 2:1 1:2 0:2 7:1 7:1/2 8:1/2 9:1 7:1 6:1 5:1 4:2 5:1/2 4:1/2 2:1 3:1 1:1 0:4',
  coldcase: 'r:1 0:1/2 2:1/2 3:2 r:1 2:1/2 3:1/2 5:2 4:1 3:1 2:1 1:1 2:3 r:1 7:3/2 6:1/2 5:1 4:1 3:3/2 2:1/2 1:2 0:1 1:1 2:1 -1:1 0:4',
  hallpass: '0:1/2 2:1/2 4:1/2 2:1/2 4:1 7:1 5:1/2 4:1/2 2:1 0:2 1:1/2 3:1/2 5:1/2 3:1/2 5:1 8:1 7:2 r:2 7:1/2 5:1/2 7:1/2 9:1/2 8:1 7:1 5:1/2 4:1/2 2:1/2 4:1/2 5:2 4:1/2 2:1/2 1:1/2 2:1/2 4:1 1:1 0:4',
  firstlight: '0:2 4:2 7:3 6:1 5:1 4:1 3:1 4:1 2:4 0:1 2:1 4:1 7:1 9:2 8:1 7:1 5:1 6:1 4:1 2:1 0:4',
  swingshift: '4:1/2 3:1/2 2:1/2 0:1/2 2:1 4:1 6:3/2 4:1/2 3:2 2:1/2 3:1/2 4:1/2 6:1/2 7:1 6:1 4:3 r:1 7:1/2 6:1/2 4:1/2 3:1/2 4:1 6:1 7:3/2 9:1/2 7:2 6:1/2 4:1/2 3:1/2 2:1/2 1:1 2:1 0:4',
  graveyard: '4:3 2:1 3:2 1:2 0:3/2 1:1/2 2:1 4:1 3:4 6:3 5:1 4:2 2:2 3:1 2:1 1:1 -1:1 0:4',
  coffee: '7:1/2 6:1/2 4:1 2:1/2 4:1/2 6:1 7:1 9:1 7:2 6:1/2 4:1/2 2:1 1:1/2 2:1/2 4:1 2:2 r:2 0:1/2 2:1/2 4:1/2 6:1/2 7:1 6:1 4:1/2 6:1/2 4:1/2 2:1/2 4:2 6:1/2 7:1/2 6:1/2 4:1/2 2:1 1:1 0:4',
  streetlamps: '2:3/2 4:1/2 5:2 4:1 2:1 0:2 2:3/2 4:1/2 7:2 6:3 r:1 5:1 6:1 7:1 9:1 8:2 7:2 6:1 5:1 4:1 2:1 0:4',
  records: 'r:2 4:1 3:1 2:2 r:2 r:2 5:1 4:1 3:2 r:2 2:1 3:1 4:1 6:1 5:3 r:1 4:1 3:1 2:1 1:1 0:4',
  legwork: '0:1/2 r:1/2 2:1/2 r:1/2 3:1/2 4:3/2 3:1/2 2:1/2 0:1 -1:2 0:1/2 r:1/2 2:1/2 r:1/2 3:1/2 6:3/2 4:3 r:1 7:1/2 6:1/2 4:1/2 3:1/2 4:1/2 6:1/2 7:1 6:2 4:2 3:1/2 2:1/2 0:1/2 2:1/2 3:1 1:1 0:4',
  porch: '4:1 5:1 7:3/2 5:1/2 4:1 2:1 4:2 5:1 7:1 9:3/2 7:1/2 7:4 9:1 8:1 7:1 5:1 6:1 5:1 4:2 2:1 4:1 5:1 1:1 0:4',
  harbor: '0:1 4:1 2:1/2 4:1/2 7:1 6:2 4:2 5:1 7:1 4:1/2 2:1/2 4:1 3:4 4:1 7:1 9:1/2 7:1/2 11:1 9:2 7:2 8:1 7:1 6:1 4:1 7:4'
};
const JF = { vamp: [0, 3, 0, 3, 0, 3, 6, 4], bridge: [2, 3, 6, 0, 2, 3, 4, 4], lift: [3, 4, 2, 5, 3, 4, 6, 4], night: [0, 3, 1, 4, 0, 3, 6, 4], dark: [0, 5, 3, 4, 0, 5, 6, 4], porch: [0, 3, 6, 3, 0, 3, 4, 4], chase: [0, 0, 5, 6, 0, 0, 3, 4], chaseB: [5, 6, 0, 0, 5, 6, 4, 4] };
const P = { // a few chord progressions, as scale degrees, one per bar
  pop: [0, 4, 5, 3, 0, 4, 3, 4], lift: [3, 4, 0, 5, 3, 4, 1, 4], doo: [0, 5, 3, 4, 0, 5, 3, 4], minor: [0, 5, 2, 6, 0, 5, 3, 4], mdrive: [0, 6, 5, 6, 0, 6, 3, 4],
  blues: [0, 0, 3, 0, 4, 3, 0, 4], dorian: [0, 3, 0, 3, 6, 3, 0, 4], soul: [1, 4, 0, 5, 1, 4, 0, 0], tense: [0, 0, 5, 5, 6, 6, 4, 4], walk: [0, 1, 2, 3, 4, 3, 1, 4], hold: [0, 3, 0, 4, 5, 3, 1, 4]
};

export const TRACKS = {
  // ---- title ----
  // the first thing a player hears: a film-style main title. A low drone, strings and a choir rise over a growing
  // timpani roll while low horns state the hook; then the hook on horns over a full string section and big drums,
  // a choir-and-strings bridge, the hook again on bright brass with the choir at full voice, and one last chord.
  title_1: { name: 'Port Meridian (Main Title)', bpm: 74, root: 62, scale: 'min', form: true, swing: 0, intro: 'swell', outro: 'final', prog: [0, 5, 2, 6, 0, 5, 3, 4], progB: [5, 6, 0, 4, 5, 6, 3, 4], theme: JT.main, themeB: JT.bridge,
    strings: { v: .03 }, strings2: { v: .056 }, choir: { v: .016 }, drone: { v: .016 }, bass: { pat: 'whole', v: .08 }, drums: { pat: 'epic', v: .6 }, drumsA2: { pat: 'epic', v: 1.15 }, lead: { voice: 'horns', v: .034, oct: 0 }, leadB: { voice: 'strings', v: .04, oct: 12 }, leadA2: { voice: 'brass', v: .048, oct: 12 }, choir2: { v: .04 }, counter: { voice: 'strings', v: .022, oct: 0 } },
  // the menu: the same story told quieter, piano and strings, then the choir and brass carry it home
  title_2: { name: 'Port Meridian (Overture)', bpm: 68, root: 62, scale: 'min', form: true, swing: 0, intro: 'motif', introTheme: SUB.inM, outro: 'final', prog: [0, 5, 2, 6, 0, 5, 3, 4], progB: [5, 6, 0, 4, 5, 6, 3, 4], theme: JT.calm, themeB: JT.heart,
    keys: { voice: 'piano', pat: 'arp8', v: .034 }, strings: { v: .03 }, strings2: { v: .04 }, choir: { v: .016 }, bass: { pat: 'whole', v: .07 }, drumsB: { pat: 'epic', v: .55 }, lead: { voice: 'piano', v: .05, oct: 12 }, leadB: { voice: 'brass', v: .034, oct: 0 }, leadA2: { voice: 'horns', v: .036, oct: 0 }, choir2: { v: .026 }, drumsA2: { pat: 'epic', v: .75 }, counter: { voice: 'strings', v: .02, oct: 0 } },
  // ---- day patrol ----
  day_1: { name: 'Day Watch', bpm: 96, root: 62, scale: 'dor', form: true, themeA1: JT.frag, intro: 'hits', outro: 'motif', outroTheme: SUB.outM, swing: .14, prog: JF.vamp, progB: JF.bridge, theme: JT.main, themeB: JT.bridge,
    band: { rhodes: { pat: 'funk', v: .032 }, wah: { v: .02, busy: true }, clav: { v: .016 }, bass: { pat: 'funk', v: .1 } }, drums: { pat: 'funk', v: .85 }, lead: { voice: 'mute', v: .036, oct: 12 }, leadB: { voice: 'sax', v: .04, oct: 0 }, counter: { voice: 'vibes', v: .02, oct: 12 } },
  day_2: { name: 'Coffee and a Cruiser', bpm: 104, root: 64, scale: 'dor', form: true, intro: 'bass', outro: 'drums', swing: .1, prog: JF.vamp, progB: JF.lift, theme: MEL.coffee, themeB: JT.main,
    band: { clav: { v: .02 }, rhodes: { pat: 'push', v: .026 }, bass: { pat: 'funk', v: .095 } }, drums: { pat: 'lowride', v: .8 }, lead: { voice: 'flute', v: .04, oct: 12 }, leadB: { voice: 'mute', v: .034, oct: 12 }, counter: { voice: 'sax', v: .022, oct: 0 } },
  // ---- night patrol ----
  night_1: { name: 'Night Shift', bpm: 74, root: 62, scale: 'dor', form: true, intro: 'motif', introTheme: SUB.inH, outro: 'band', swing: .2, prog: JF.night, progB: JF.bridge, theme: JT.heart, themeB: JT.calm,
    band: { rhodes: { pat: 'ballad', v: .034 }, vamp: { v: .012 }, bass: { pat: 'walk', v: .095 } }, drums: { pat: 'jazz', v: .75 }, drumsB: { pat: 'lowride', v: .6 }, lead: { voice: 'sax', v: .042, oct: 0 }, leadB: { voice: 'vibes', v: .03, oct: 12 }, counter: { voice: 'mute', v: .018, oct: 12 } },
  night_2: { name: 'Streetlamps', bpm: 82, root: 60, scale: 'dor', form: true, intro: 'drums', outro: 'motif', outroTheme: SUB.outM, swing: .16, prog: JF.night, progB: JF.lift, theme: MEL.streetlamps, themeB: JT.heart,
    band: { rhodes: { pat: 'push', v: .028 }, wah: { v: .014 }, bass: { pat: 'funk', v: .085 } }, drums: { pat: 'lowride', v: .7 }, lead: { voice: 'mute', v: .034, oct: 12 }, leadB: { voice: 'sax', v: .04, oct: 0 } },
  // ---- indoors ----
  inside_1: { name: 'Front Desk', bpm: 80, root: 65, scale: 'dor', form: true, themeA1: JT.frag, intro: 'band', outro: 'motif', outroTheme: SUB.outM, swing: .14, prog: JF.night, progB: JF.lift, theme: JT.main, themeB: JT.calm,
    band: { rhodes: { pat: 'push', v: .026 }, bass: { pat: 'walk', v: .075 } }, drums: { pat: 'brush', v: .45 }, lead: { voice: 'vibes', v: .028, oct: 12, sparse: true }, leadB: { voice: 'vibes', v: .028, oct: 12 } },
  inside_2: { name: 'Records Room', bpm: 70, root: 62, scale: 'dor', form: true, intro: 'motif', introTheme: SUB.inM, outro: 'band', swing: .2, prog: JF.night, progB: JF.bridge, theme: MEL.records, themeB: JT.frag,
    band: { rhodes: { pat: 'ballad', v: .03 }, bass: { pat: 'walk', v: .07 } }, drums: { pat: 'jazz', v: .4 }, lead: { voice: 'mute', v: .026, oct: 12, sparse: true } },
  // ---- story ----
  story_1: { name: 'The Gray Sedan', bpm: 66, root: 62, scale: 'min', form: true, intro: 'motif', introTheme: SUB.inH, outro: 'band', swing: .18, prog: JF.dark, progB: JF.chaseB, theme: JT.heart, themeB: JT.calm,
    band: { rhodes: { pat: 'ballad', v: .032 }, vamp: { v: .016 }, bass: { pat: 'walk', v: .08 } }, drums: { pat: 'jazz', v: .45 }, drone: { v: .02 }, lead: { voice: 'sax', v: .04, oct: 0 }, leadB: { voice: 'mute', v: .03, oct: 12 } },
  story_2: { name: 'The Ledger', bpm: 60, root: 57, scale: 'min', form: true, intro: 'band', outro: 'motif', outroTheme: SUB.outH, swing: .2, prog: JF.dark, progB: JF.dark, theme: JT.heart, themeB: JT.frag,
    band: { rhodes: { pat: 'ballad', v: .03 }, vamp: { v: .02 } }, drone: { v: .025 }, lead: { voice: 'vibes', v: .03, oct: 12, sparse: true }, leadB: { voice: 'sax', v: .036, oct: 0 } },
  // ---- side cases ----
  side_1: { name: 'Legwork', bpm: 100, root: 62, scale: 'dor', form: true, themeA1: JT.frag, intro: 'bass', outro: 'hits', swing: .12, prog: JF.vamp, progB: JF.lift, theme: JT.main, themeB: JT.bridge,
    band: { clav: { v: .018 }, wah: { v: .016 }, bass: { pat: 'funk', v: .095 } }, drums: { pat: 'breaks', v: .75 }, lead: { voice: 'mute', v: .032, oct: 12 }, leadB: { voice: 'flute', v: .036, oct: 12 } },
  side_2: { name: 'Asking Around', bpm: 108, root: 67, scale: 'dor', form: true, intro: 'drums', outro: 'motif', outroTheme: SUB.outM, swing: .1, prog: JF.vamp, progB: JF.bridge, theme: MEL.legwork, themeB: JT.main,
    band: { rhodes: { pat: 'funk', v: .028 }, clav: { v: .014 }, bass: { pat: 'funk', v: .09 } }, drums: { pat: 'funk', v: .7 }, lead: { voice: 'sax', v: .038, oct: -12 }, leadB: { voice: 'vibes', v: .028, oct: 12 } },
  // ---- en route ----
  call_1: { name: 'Code 2', bpm: 116, root: 62, scale: 'min', form: true, intro: 'drums', outro: 'hits', swing: .06, prog: JF.chase, progB: JF.chaseB, theme: JT.units, themeB: JT.chaseB,
    band: { rhodes: { pat: 'push', v: .022 }, wah: { v: .022, busy: true }, bass: { pat: 'octaves', v: .095 } }, drums: { pat: 'funk', v: .85 }, lead: { voice: 'mute', v: .034, oct: 12 }, leadB: { voice: 'horns', v: .026, oct: 12 } },
  call_2: { name: 'Crosstown', bpm: 120, root: 64, scale: 'min', form: true, intro: 'bass', outro: 'drums', swing: .06, prog: JF.chase, progB: JF.chaseB, theme: JT.main, themeB: JT.chaseB,
    band: { clav: { v: .018 }, wah: { v: .018, busy: true }, bass: { pat: 'funk', v: .095 } }, drums: { pat: 'breaks', v: .85 }, lead: { voice: 'sax', v: .04, oct: 0 }, leadB: { voice: 'sax', v: .04, oct: 0 } },
  // ---- priority one ----
  urgent_1: { name: 'All Units', bpm: 128, root: 62, scale: 'min', form: true, intro: 'hits', outro: 'drums', swing: .06, prog: JF.chase, progB: JF.chaseB, theme: JT.units, themeB: JT.chaseB,
    band: { rhodes: { pat: 'push', v: .024 }, wah: { v: .024, busy: true }, horns: { v: .026 }, bass: { pat: 'octaves', v: .1 } }, drums: { pat: 'pursuit', v: .95 }, lead: { voice: 'horns', v: .03, oct: 12 }, leadB: { voice: 'horns', v: .03, oct: 12 } },
  urgent_2: { name: 'Lights and Sirens', bpm: 136, root: 65, scale: 'min', form: true, intro: 'drums', outro: 'hits', swing: .04, prog: JF.chase, progB: JF.chaseB, theme: JT.chaseB, themeB: JT.units,
    band: { wah: { v: .024, busy: true }, horns: { v: .028 }, clav: { v: .016 }, bass: { pat: 'octaves', v: .1 } }, drums: { pat: 'pursuit', v: 1 }, lead: { voice: 'horns', v: .03, oct: 12 }, leadB: { voice: 'sax', v: .042, oct: 0 } },
  // ---- on scene ----
  scene_1: { name: 'Contact', bpm: 84, root: 62, scale: 'min', form: true, intro: 'band', outro: 'band', swing: .1, prog: JF.dark, progB: JF.dark, theme: JT.heartFrag, themeB: JT.heart,
    band: { rhodes: { pat: 'ballad', v: .026 }, bass: { pat: 'walk', v: .07 } }, drone: { v: .025 }, lead: { voice: 'mute', v: .026, oct: 12, sparse: true } },
  scene_2: { name: 'Hands Where I Can See Them', bpm: 90, root: 60, scale: 'min', form: true, intro: 'bass', outro: 'band', swing: .1, prog: JF.dark, progB: JF.chaseB, theme: JT.unitsHalf, themeB: JT.frag,
    band: { wah: { v: .012 }, bass: { pat: 'funk', v: .08 } }, drums: { pat: 'lowride', v: .5 }, drone: { v: .02 }, lead: { voice: 'vibes', v: .026, oct: 12, sparse: true }, leadB: { voice: 'sax', v: .034, oct: 0 } },
  // ---- debrief ----
  debrief_1: { name: 'End of Watch', bpm: 72, root: 62, scale: 'dor', form: true, intro: 'motif', introTheme: SUB.inH, outro: 'motif', outroTheme: SUB.outH, swing: .2, prog: JF.night, progB: JF.lift, theme: JT.heart, themeB: JT.calm,
    band: { rhodes: { pat: 'ballad', v: .032 }, vamp: { v: .012 }, bass: { pat: 'walk', v: .08 } }, drums: { pat: 'jazz', v: .5 }, lead: { voice: 'sax', v: .04, oct: 0 }, leadB: { voice: 'vibes', v: .028, oct: 12 } },
  debrief_2: { name: 'Report Written', bpm: 86, root: 65, scale: 'maj', form: true, themeA1: JT.frag, intro: 'hits', outro: 'motif', outroTheme: SUB.outM, swing: .14, prog: JF.vamp, progB: JF.lift, theme: JT.main, themeB: JT.bridge,
    band: { rhodes: { pat: 'funk', v: .026 }, bass: { pat: 'funk', v: .085 } }, drums: { pat: 'lowride', v: .6 }, lead: { voice: 'vibes', v: .03, oct: 12 }, leadB: { voice: 'mute', v: .03, oct: 12 } },
  // ---- neighbors and friends ----
  friend_1: { name: 'Porch Light', bpm: 84, root: 65, scale: 'mix', form: true, intro: 'motif', introTheme: SUB.inM, outro: 'band', swing: .16, prog: JF.porch, progB: JF.lift, theme: MEL.porch, themeB: JT.heart,
    band: { rhodes: { pat: 'push', v: .028 }, bass: { pat: 'walk', v: .08 } }, drums: { pat: 'brush', v: .5 }, lead: { voice: 'flute', v: .038, oct: 12 }, leadB: { voice: 'vibes', v: .028, oct: 12 } },
  friend_2: { name: 'Saturday at the Plaza', bpm: 102, root: 67, scale: 'mix', form: true, themeA1: JT.frag, intro: 'bass', outro: 'motif', outroTheme: SUB.outM, swing: .12, prog: JF.porch, progB: JF.lift, theme: JT.main, themeB: JT.bridge,
    band: { clav: { v: .016 }, rhodes: { pat: 'funk', v: .024 }, horns: { v: .016 }, bass: { pat: 'funk', v: .09 } }, drums: { pat: 'lowride', v: .75 }, lead: { voice: 'mute', v: .034, oct: 12 }, leadB: { voice: 'flute', v: .036, oct: 12 } },
  // ---- marine patrol ----
  water_1: { name: 'Marine Patrol', bpm: 86, root: 62, scale: 'mix', form: true, intro: 'drums', outro: 'motif', outroTheme: SUB.outM, swing: .14, prog: JF.porch, progB: JF.lift, theme: MEL.harbor, themeB: JT.main,
    band: { rhodes: { pat: 'push', v: .024 }, bass: { pat: 'funk', v: .08 } }, drums: { pat: 'lowride', v: .6 }, lead: { voice: 'vibes', v: .032, oct: 12 }, leadB: { voice: 'flute', v: .036, oct: 12 } },
  water_2: { name: 'Slow Wake', bpm: 74, root: 60, scale: 'dor', form: true, intro: 'band', outro: 'motif', outroTheme: SUB.outH, swing: .2, prog: JF.night, progB: JF.porch, theme: JT.heart, themeB: JT.main,
    band: { rhodes: { pat: 'ballad', v: .028 }, vamp: { v: .012 }, bass: { pat: 'walk', v: .07 } }, drums: { pat: 'jazz', v: .45 }, lead: { voice: 'flute', v: .036, oct: 12 }, leadB: { voice: 'sax', v: .034, oct: 0 } },
  // ---- districts: each place has its own arrangement of the hook (heard first when you arrive) ----
  dist_0: { name: 'Founders Square (Central)', bpm: 104, root: 65, scale: 'mix', form: true, swing: .1, prog: JF.vamp, progB: JF.lift, theme: MEL.founders, themeB: JT.main, intro: 'hits', outro: 'motif',
    band: { rhodes: { pat: 'funk', v: .026 }, horns: { v: .02 }, clav: { v: .014 }, bass: { pat: 'funk', v: .095 } }, drums: { pat: 'funk', v: .8 }, lead: { voice: 'horns', v: .03, oct: 12 }, leadB: { voice: 'sax', v: .04, oct: 0 }, counter: { voice: 'vibes', v: .018, oct: 12 } },
  dist_1: { name: 'Corner Store Shuffle (Eastside)', bpm: 96, root: 62, scale: 'dor', form: true, swing: .22, prog: JF.night, progB: JF.vamp, theme: MEL.cornerstore, themeB: JT.main, intro: 'bass', outro: 'drums',
    band: { clav: { v: .02 }, wah: { v: .018, busy: true }, bass: { pat: 'funk', v: .1 } }, drums: { pat: 'shuffle', v: .8 }, lead: { voice: 'sax', v: .042, oct: 0 }, leadB: { voice: 'mute', v: .034, oct: 12 } },
  dist_2: { name: 'River Park (Riverside)', bpm: 84, root: 67, scale: 'mix', form: true, swing: .16, prog: JF.porch, progB: JF.lift, theme: MEL.riverpark, themeB: JT.heart, intro: 'motif', introTheme: SUB.inM, outro: 'motif', outroTheme: SUB.outH,
    band: { rhodes: { pat: 'push', v: .026 }, bass: { pat: 'walk', v: .075 } }, drums: { pat: 'brush', v: .5 }, lead: { voice: 'flute', v: .04, oct: 12 }, leadB: { voice: 'vibes', v: .03, oct: 12 } },
  dist_3: { name: 'Rail Yard (Industrial Park)', bpm: 92, root: 62, scale: 'min', form: true, swing: .06, prog: JF.chase, progB: JF.dark, theme: MEL.railyard, themeB: JT.units, intro: 'drums', outro: 'bass',
    band: { wah: { v: .016 }, horns: { v: .016 }, bass: { pat: 'octaves', v: .1 } }, drums: { pat: 'half', v: .85 }, drone: { v: .016 }, lead: { voice: 'horns', v: .03, oct: 12 }, leadB: { voice: 'sax', v: .04, oct: 0 } },
  dist_4: { name: 'Long Dark Road (Justice Row)', bpm: 68, root: 60, scale: 'min', form: true, swing: .2, prog: JF.dark, progB: JF.night, theme: MEL.darkroad, themeB: JT.heartFrag, intro: 'motif', introTheme: SUB.inM, outro: 'band',
    band: { rhodes: { pat: 'ballad', v: .03 }, vamp: { v: .014 }, bass: { pat: 'walk', v: .075 } }, drums: { pat: 'jazz', v: .5 }, drone: { v: .018 }, lead: { voice: 'mute', v: .034, oct: 12 }, leadB: { voice: 'sax', v: .038, oct: 0 } },
  // ---- units: your unit's arrangement joins the patrol, call and side-case rotation ----
  unit_swat: { name: 'Stack Up (SWAT)', bpm: 124, root: 62, scale: 'min', form: true, swing: .04, prog: JF.chase, progB: JF.chaseB, theme: MEL.stackup, themeB: JT.units, intro: 'drums', outro: 'hits',
    band: { horns: { v: .024 }, wah: { v: .016 }, bass: { pat: 'octaves', v: .1 } }, drums: { pat: 'march', v: .9 }, lead: { voice: 'horns', v: .03, oct: 12 }, leadB: { voice: 'horns', v: .03, oct: 12 } },
  unit_k9: { name: 'Good Dog (K9)', bpm: 112, root: 64, scale: 'dor', form: true, swing: .12, prog: JF.vamp, progB: JF.lift, theme: MEL.gooddog, themeB: JT.main, intro: 'bass', outro: 'motif',
    band: { clav: { v: .018 }, rhodes: { pat: 'push', v: .022 }, bass: { pat: 'funk', v: .095 } }, drums: { pat: 'breaks', v: .8 }, lead: { voice: 'flute', v: .04, oct: 12 }, leadB: { voice: 'mute', v: .032, oct: 12 } },
  unit_neg: { name: 'Talk Me Through It (Negotiator)', bpm: 64, root: 62, scale: 'dor', form: true, swing: .2, prog: JF.night, progB: JF.porch, theme: MEL.talkdown, themeB: JT.heart, intro: 'motif', introTheme: SUB.inH, outro: 'motif', outroTheme: SUB.outM,
    band: { rhodes: { pat: 'ballad', v: .03 }, bass: { pat: 'walk', v: .065 } }, drums: { pat: 'brush', v: .35 }, lead: { voice: 'vibes', v: .032, oct: 12 }, leadB: { voice: 'sax', v: .034, oct: 0 } },
  unit_marine: { name: 'Channel Markers (Marine)', bpm: 88, root: 62, scale: 'mix', form: true, swing: .24, prog: JF.porch, progB: JF.lift, theme: MEL.channel, themeB: JT.main, intro: 'bass', outro: 'motif',
    band: { rhodes: { pat: 'push', v: .024 }, bass: { pat: 'funk', v: .085 } }, drums: { pat: 'bossa', v: .6 }, lead: { voice: 'flute', v: .038, oct: 12 }, leadB: { voice: 'vibes', v: .03, oct: 12 } },
  unit_brt: { name: 'Check-In (Behavioral Resource)', bpm: 76, root: 65, scale: 'maj', form: true, swing: .16, prog: JF.porch, progB: JF.lift, theme: MEL.checkin, themeB: JT.heart, intro: 'band', outro: 'motif',
    band: { rhodes: { pat: 'push', v: .028 }, bass: { pat: 'walk', v: .075 } }, drums: { pat: 'brush', v: .45 }, lead: { voice: 'vibes', v: .032, oct: 12 }, leadB: { voice: 'flute', v: .036, oct: 12 } },
  unit_hoi: { name: 'Under the Overpass (Homeless Initiative)', bpm: 80, root: 67, scale: 'mix', form: true, swing: .18, prog: JF.porch, progB: JF.night, theme: MEL.overpass, themeB: JT.calm, intro: 'motif', introTheme: SUB.inH, outro: 'band',
    band: { rhodes: { pat: 'ballad', v: .028 }, bass: { pat: 'walk', v: .07 } }, drums: { pat: 'brush', v: .4 }, lead: { voice: 'flute', v: .038, oct: 12 }, leadB: { voice: 'sax', v: .034, oct: 0 } },
  unit_det: { name: 'Cold Case (Detective)', bpm: 66, root: 57, scale: 'min', form: true, swing: .2, prog: JF.dark, progB: JF.dark, theme: MEL.coldcase, themeB: JT.frag, intro: 'bass', outro: 'motif', outroTheme: SUB.outM,
    band: { rhodes: { pat: 'ballad', v: .028 }, vamp: { v: .016 }, bass: { pat: 'walk', v: .075 } }, drums: { pat: 'jazz', v: .45 }, drone: { v: .02 }, lead: { voice: 'mute', v: .034, oct: 12 }, leadB: { voice: 'sax', v: .036, oct: 0 } },
  unit_sro: { name: 'Hall Pass (School Resource)', bpm: 108, root: 67, scale: 'maj', form: true, swing: .1, prog: JF.vamp, progB: JF.lift, theme: MEL.hallpass, themeB: JT.main, intro: 'hits', outro: 'motif',
    band: { clav: { v: .016 }, rhodes: { pat: 'funk', v: .024 }, horns: { v: .014 }, bass: { pat: 'funk', v: .09 } }, drums: { pat: 'lowride', v: .75 }, lead: { voice: 'vibes', v: .034, oct: 12 }, leadB: { voice: 'flute', v: .036, oct: 12 } },
  // ---- shifts: the time you work has its own color ----
  shift_day: { name: 'First Light (Day Shift)', bpm: 98, root: 62, scale: 'maj', form: true, swing: .1, prog: JF.vamp, progB: JF.lift, theme: MEL.firstlight, themeB: JT.main, intro: 'motif', introTheme: SUB.inM, outro: 'hits',
    band: { rhodes: { pat: 'push', v: .026 }, horns: { v: .014 }, bass: { pat: 'funk', v: .09 } }, drums: { pat: 'lowride', v: .75 }, lead: { voice: 'flute', v: .04, oct: 12 }, leadB: { voice: 'horns', v: .028, oct: 12 } },
  shift_mid: { name: 'Swing Shift (Midshift)', bpm: 90, root: 64, scale: 'dor', form: true, swing: .24, prog: JF.night, progB: JF.vamp, theme: MEL.swingshift, themeB: JT.main, intro: 'drums', outro: 'band',
    band: { rhodes: { pat: 'push', v: .026 }, wah: { v: .014 }, bass: { pat: 'walk', v: .085 } }, drums: { pat: 'shuffle', v: .7 }, lead: { voice: 'sax', v: .04, oct: 0 }, leadB: { voice: 'vibes', v: .03, oct: 12 } },
  shift_night: { name: 'Graveyard (Night Shift)', bpm: 70, root: 62, scale: 'min', form: true, swing: .2, prog: JF.dark, progB: JF.night, theme: MEL.graveyard, themeB: JT.heart, intro: 'bass', outro: 'motif', outroTheme: SUB.outH,
    band: { rhodes: { pat: 'ballad', v: .03 }, vamp: { v: .014 }, bass: { pat: 'walk', v: .08 } }, drums: { pat: 'jazz', v: .5 }, drone: { v: .016 }, lead: { voice: 'sax', v: .04, oct: 0 }, leadB: { voice: 'mute', v: .03, oct: 12 } }
};

// the original Patrol City themes (the live synth score), rendered to files as the first track of each mood
const BASE = { title: ['Port Meridian', 72], day: ['Day Watch', 100], night: ['Night Watch', 78], inside: ['Indoors', 70], story: ['The Gray Sedan', 64], side: ['Side Case', 104],
  call: ['En Route', 112], urgent: ['Priority One', 136], scene: ['On Scene', 84], debrief: ['Debrief', 76], friend: ['Neighbors', 80], water: ['Marine Patrol', 84] };
// which arrangements belong to a place, a unit and a shift (the score player adds them to the rotation)
export const CONTEXT = { district: (d) => 'dist_' + d, unit: (u) => (u && u !== 'patrol' ? 'unit_' + u : null), shift: (s) => 'shift_' + (s || 'day') };
export const META = {}; for (const k in TRACKS) META[k] = { name: TRACKS[k].name, bpm: TRACKS[k].bpm };
// which tracks play for each situation, in rotation
export const ROTATION = {};
for (const k in BASE) ROTATION[k] = Object.keys(TRACKS).filter((t) => t.indexOf(k + '_') === 0);
// what each situation can play: its own arrangements first, plus related ones that fit the same feeling, so a long patrol
// hears a wide rotation instead of two tracks back and forth (each kept to its mood: no pursuit music on a quiet street)
const KIN = { title: [], day: ['side_1', 'friend_2', 'debrief_2', 'title_1'], night: ['water_2', 'title_2', 'story_1'], inside: ['friend_1', 'debrief_1'],
  story: ['night_1', 'inside_2'], side: ['day_2', 'friend_2', 'day_1'], call: ['urgent_1'], urgent: ['call_1'], scene: ['inside_2'], debrief: ['title_2', 'friend_1'],
  friend: ['day_2', 'water_1', 'debrief_2'], water: ['friend_1', 'night_2', 'day_2'] };
export const POOLS = {}; for (const k in ROTATION) POOLS[k] = ROTATION[k].concat((KIN[k] || []).filter((id) => TRACKS[id] && ROTATION[k].indexOf(id) < 0));
// how long each composed track runs before the next one: 32 bars, plus a short reverb tail
export const trackLen = (m) => 32 * 4 * 60 / m.bpm;
