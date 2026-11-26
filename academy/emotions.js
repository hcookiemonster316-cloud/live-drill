// The emotion pass (Phase 8, step 7). Every quest is tagged with the feeling it leads with, so the city can pace them:
// a hard case (sad or tense) is followed by a breather, the next case the city points you to leads with a different
// feeling, and the Field Journal shows the tag so you can pick what you're in the mood for. Each district has the full
// range: funny, tense, sad, morally gray, triumphant (and warm).
// Loop: take a case -> choose -> the city remembers how the last one felt -> the next moment is paced against it.
export const EMO_LABEL = { funny: 'Funny', tense: 'Tense', sad: 'Sad', gray: 'Gray area', triumph: 'Triumph', warm: 'Warm' };
export const HEAVY_EMO = { sad: 1, tense: 1 };
export const EMO = {
  // Central
  badge214: 'sad', clock: 'warm', corner: 'funny', deadair: 'tense', f_hollis: 'triumph', fakepage: 'tense', ledger1: 'gray', nightowl: 'sad',
  ninety: 'tense', overdue: 'warm', pigeons: 'funny', room9: 'warm', shoptalk: 'tense', spokes: 'funny', trail2: 'tense', vance1: 'funny', wallet: 'gray',
  // Eastside
  blossomgate: 'gray', bubbles: 'funny', donutstake: 'funny', f_bea: 'sad', firstboard: 'gray', forgery: 'gray', ghostcar: 'funny', gloves: 'tense',
  kickflip: 'triumph', ledger2: 'warm', newmember: 'warm', odell: 'funny', ring: 'funny', ruth: 'warm', sideb: 'warm', sockbandit: 'funny', trail5: 'sad',
  vance2: 'triumph', wallwords: 'tense',
  // Riverside
  adrift: 'tense', atthree: 'sad', biscuit: 'warm', cprclass: 'triumph', drowned: 'sad', f_nash: 'tense', fenceline: 'gray', gameday: 'tense', garden: 'warm',
  gator: 'funny', hardknock: 'sad', ledger3: 'gray', marketday: 'tense', sender: 'sad', signs: 'gray', smoke: 'tense', trail3: 'gray', vance3: 'sad',
  // Industrial Park
  copper: 'gray', crywolf: 'tense', f_lou: 'tense', fizz: 'funny', hives: 'gray', keys: 'funny', ledger4: 'tense', lunch: 'funny', meridianstar: 'triumph',
  nighttrain: 'tense', noseknows: 'tense', retire: 'triumph', seals: 'gray', siding9: 'sad', trail4: 'tense', vance4: 'triumph', whistle: 'funny',
  // Justice Row
  addresses: 'gray', exhibit: 'funny', exhibitb: 'funny', f_greer: 'triumph', juryduty: 'tense', ledger5: 'triumph', lighthouse: 'warm', ocampo: 'sad',
  orderup: 'funny', otherside: 'gray', pike: 'funny', propbag: 'gray', secondchance: 'warm', streetlight: 'gray', trail1: 'tense', transport: 'warm',
  vance5: 'triumph', walkin: 'warm',
  // the main story, one chapter per district
  main0: 'tense', main1: 'tense', main2: 'sad', main3: 'tense', main4: 'triumph'
};
export const emoOf = (q) => EMO[q.id] || (q.steps && q.d != null && !q.id ? EMO['main' + q.d] : null) || null;
// out of what's open, the cases whose feeling differs from the last one you closed (all of them, if none differ)
export function contrast(list, last) { if (!last) return list; const d = list.filter((q) => emoOf(q) !== last); return d.length ? d : list; }
