// How each regular looks, from their age and story. age: teen | adult | middle | senior (60s-70s) | elder (80+, stoops, cane)
// build: slim | heavy. hs (hair style): 0 short, 1 thinning, 2 swept, 3 bun, 4 long, 5 curls, 6 bob, 7 bald on top, 8 big natural.
// beard: full | mustache | goatee | stubble. Hair colors given here override the old defaults so gray reads as gray.
const G1 = '#9ca3af', G2 = '#c4c9d1', W = '#eef0f3', SALT = '#6b7280';
export const APPEAR = {
  delgado: { age: 'middle', build: 'heavy', hs: 0, hair: SALT, beard: 'mustache' },        // 22 years on the corner, daughters through med school
  pruitt: { age: 'senior', build: 'slim', hs: 7, hair: W, beard: 'mustache' },             // 71, retired sergeant, still walks the beat
  dot: { age: 'senior', hs: 6, hair: '#d8b46a' },                                           // decades at the Night Owl, keeps her hair blonde
  marcus: { age: 'adult', build: 'slim', hs: 2 },                                           // eleven years a courier
  okafor: { age: 'middle', hs: 5, glasses: true },                                          // head librarian
  kevin: { age: 'adult', build: 'heavy', hs: 2, glasses: true, beard: 'stubble' },          // IT, lives in the basement
  rosa: { age: 'senior', build: 'heavy', hs: 6, hair: '#4b4b4b' },                          // forty years at the bodega, a grown grandson
  earl: { age: 'middle', build: 'heavy', hs: 0, beard: 'full' },                            // runs his father's garage
  reyes: { age: 'middle', hs: 0, beard: 'goatee' },                                         // 51, former boxer, still in shape
  kim: { age: 'senior', build: 'slim', hs: 1, hair: G1, glasses: true },                    // widower, retiring next year
  ruth: { age: 'elder', build: 'slim', hs: 5, hair: W, glasses: true },                     // 81, porch sitter, switchboard 1962-1990
  dez: { age: 'teen', build: 'slim', hs: 2 },                                               // 17, skateboarder
  hal: { age: 'senior', hs: 1, hair: W, beard: 'full' },                                    // forty years of charters
  bobby: { age: 'senior', build: 'heavy', hs: 7, hair: G1, beard: 'mustache' },             // bait shop since 1999, widower
  johnson: { age: 'middle', hs: 6, hair: '#3a2a20' },                                       // crossing guard, son is 34
  miguel: { age: 'middle', hs: 1, hair: SALT },                                             // former public defender, now a priest
  sam: { age: 'adult', hs: 0, beard: 'mustache' },                                          // firefighter
  gus: { age: 'elder', build: 'slim', hs: 7, hair: W, cane: false },                        // fifty years on the same bend of the river; heart's tired
  gerald: { age: 'middle', build: 'heavy', hs: 7, hair: '#4b3a2a', beard: 'mustache' },     // forklift since 2005
  rusty: { age: 'senior', build: 'heavy', hs: 1, hair: G1, beard: 'full' },                 // scrap yard owner, bought stolen tools in 1994
  dee: { age: 'middle', hs: 4, hair: '#8a6a4a' },                                           // 22 years long-haul
  carl: { age: 'middle', build: 'heavy', hs: 7, hair: SALT, beard: 'mustache' },            // 57, night guard
  shonda: { age: 'middle', hs: 8 },                                                         // took over her mother's business
  lupe: { age: 'middle', build: 'heavy', hs: 3 },                                           // third generation at the Lunch Pail
  moore: { age: 'middle', build: 'heavy', hs: 7, hair: '#1a1a1a', beard: 'goatee' },        // nineteen years a bailiff
  barnes: { age: 'middle', hs: 0, hair: SALT, glasses: true },                              // defense attorney
  ray: { age: 'middle', hs: 0, beard: 'mustache' },                                         // bail bondsman since 1998
  hattie: { age: 'senior', hs: 5, hair: G2, glasses: true },                                // forty years at the clerk's desk
  ramos: { age: 'middle', hs: 0, hair: SALT, beard: 'mustache' },                           // twenty-five years on transport
  walt: { age: 'adult', hs: 0 },                                                            // 36: he was the 8-year-old in the 1998 fire
  tasha: { age: 'middle', hs: 8, hair: '#4b4b4b' },                                         // 57, retired ER nurse
  leon: { age: 'middle', hs: 0, beard: 'mustache' },                                        // nineteen years a custodian
  carmen: { age: 'senior', build: 'heavy', hs: 5, hair: G2 },                               // grandmother of Harbor View
  priya: { age: 'adult', hs: 4 },                                                           // former engineer, food truck
  hollis: { age: 'middle', build: 'slim', hs: 7, hair: SALT, beard: 'full', beardCol: G1 }, // around fifty, nine years inside, twenty out
  mo: { age: 'middle', hs: 0, beard: 'mustache' },                                          // 46, gas station owner
  bea: { age: 'middle', build: 'heavy', hs: 6 },                                            // twenty years of 4 a.m. donuts
  lewis: { age: 'senior', hs: 1, hair: G2 },                                                // retired mail carrier, 33 years on foot
  andy: { age: 'adult', hs: 0, beard: 'stubble' },                                          // Army veteran, Afghanistan
  sunny: { age: 'middle', hs: 4, hair: '#7a5a3a' },                                         // third-generation farmer, tired
  jamal: { age: 'adult', hs: 2, beard: 'goatee' },                                          // DJ, around thirty
  ines: { age: 'middle', hs: 6, glasses: true },                                            // vet since before 2010
  pearl: { age: 'elder', build: 'slim', hs: 5, hair: W, glasses: true },                    // 91
  nash: { age: 'middle', hs: 0, beard: 'stubble' },                                         // former minor-league catcher
  cora: { age: 'senior', build: 'heavy', hs: 6, hair: G2 },                                 // 61, lost at the fair in 1971
  eli: { age: 'adult', hs: 2, beard: 'stubble' },                                           // twenty years renting canoes
  toby: { age: 'adult', build: 'slim', hs: 0 },                                             // young mail carrier
  tess: { age: 'middle', hs: 3, hair: '#5b4636' },                                          // third-generation railroad
  hector: { age: 'senior', build: 'slim', hs: 7, hair: G1, beard: 'mustache' },             // forty years welding, hands shake now
  ivy: { age: 'middle', hs: 4, hair: '#8a7a6a' },                                           // beekeeper, grown son
  wanda: { age: 'middle', hs: 6, hair: SALT, glasses: true },                               // 58, birdwatcher
  pat: { age: 'middle', hs: 5, hair: SALT },                                                // night freight dispatch since the 80s
  lou: { age: 'adult', build: 'heavy', hs: 0, beard: 'full' },                              // diesel mechanic
  alvarez: { age: 'senior', hs: 6, hair: G2, glasses: true },                               // retired judge, 32 years on the bench
  nico: { age: 'adult', hs: 4 },                                                            // law student, barista
  greer: { age: 'middle', hs: 6, glasses: true },                                           // court reporter, 28 years
  felix: { age: 'middle', hs: 1, hair: SALT, glasses: true, beard: 'mustache' },            // Frank Moreno, wrongfully convicted in 1994
  ada: { age: 'senior', hs: 5, hair: G2, glasses: true },                                   // archivist since 1987
  booker: { age: 'elder', hs: 7, hair: W, beard: 'mustache' }                               // 78, Vietnam veteran, keeps the memorial
};
// the look options the renderer understands, picked out of an appearance entry
export const appearOpts = (id) => { const a = APPEAR[id]; if (!a) return {}; const o = { age: a.age, build: a.build, hs: a.hs, beard: a.beard, beardCol: a.beardCol, glasses: a.glasses, cane: a.cane }; if (a.hair) o.hair = a.hair; return o; };
