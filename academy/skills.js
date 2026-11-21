// Training skill tree: four branches, four tiers each. A point comes with every promotion and every story chapter.
// Every skill changes what you can do (Phase 4, item 11): a new choice, a new tool or a new way the city treats you.
// Tier 1 skills raise a stat that decides how scenes go; actives are abilities you trigger in the field.
export const BRANCHES = [
  { id: 'com', name: 'Community', icon: '🤝', color: '#22c55e', blurb: 'Talk people through it. Trust opens doors.' },
  { id: 'tac', name: 'Tactics', icon: '🛡️', color: '#3b82f6', blurb: 'Plan, position, cover. Calls go smoother.' },
  { id: 'inv', name: 'Investigation', icon: '🔎', color: '#a855f7', blurb: 'Notice everything. Follow it up.' },
  { id: 'pat', name: 'Patrol', icon: '🚓', color: '#f97316', blurb: 'Know the streets. Get there first.' }
];
export const SKILLS = [
  { id: 'com1', b: 'com', tier: 1, name: 'Good Listener', text: '+1 Rapport.', perk: { rap: 1 } },
  { id: 'com2', b: 'com', tier: 2, name: 'Known on the Beat', text: 'Regulars who know you wave you over when you pass and point out something that\'s off nearby. Once each, every shift.' },
  { id: 'com3', b: 'com', tier: 3, name: 'Community Policing', text: 'ACTIVE: two locals with questions come find you. Twice a shift.', active: { key: 'summon', uses: 2, icon: '🤝' } },
  { id: 'com4', b: 'com', tier: 4, name: 'Pillar of the District', text: '+1 Rapport, +1 Composure. Regulars sometimes radio you tips about hidden finds.', perk: { rap: 1, com: 1 }, tips: true },
  { id: 'tac1', b: 'tac', tier: 1, name: 'Contact and Cover', text: '+1 Tactics.', perk: { tac: 1 } },
  { id: 'tac2', b: 'tac', tier: 2, name: 'Smart Approach', text: 'A new choice on the way to calls: stage a block away and wait for a second unit.' },
  { id: 'tac3', b: 'tac', tier: 3, name: 'Code 3', text: 'ACTIVE: lights and siren for 3 minutes of shift time. Drive 35% faster and calls wait for you. Twice a shift.', active: { key: 'code3', uses: 2, icon: '🚨' } },
  { id: 'tac4', b: 'tac', tier: 4, name: 'Calm Under Pressure', text: '+1 Tactics, +1 Composure. Questions on priority 1 calls never run out of time.', perk: { tac: 1, com: 1 } },
  { id: 'inv1', b: 'inv', tier: 1, name: 'Sharp Eyes', text: '+1 Perception.', perk: { per: 1 } },
  { id: 'inv2', b: 'inv', tier: 2, name: 'Field Notes', text: 'Once a shift, check your notebook during a question: two wrong answers get crossed out.' },
  { id: 'inv3', b: 'inv', tier: 3, name: 'Canvass the Area', text: 'ACTIVE: reveal every "something\'s off", lost & found sparkle and secret spot within a wide radius. Twice a shift.', active: { key: 'canvass', uses: 2, icon: '🔦' } },
  { id: 'pat1', b: 'pat', tier: 1, name: 'Know the Streets', text: 'Drive 10% faster.', perk: { drive: 10 } },
  { id: 'pat2', b: 'pat', tier: 2, name: 'Shortcut Sense', text: 'Your route shows on the street as you drive to a call or your next stop.' },
  { id: 'pat3', b: 'pat', tier: 3, name: 'Beat Memory', text: 'In districts that know you (Known or better), you can pass a call to another unit and take the next one. Once a shift.' },
  { id: 'pat4', b: 'pat', tier: 4, name: 'Road Warrior', text: 'Drive another 15% faster, and Code 3 lasts twice as long.', perk: { drive: 15 } },
  { id: 'inv4', b: 'inv', tier: 4, name: 'Follow the Evidence', text: '+1 Perception, +1 Tactics. Secret spots and lost & found items roll one rank higher.', perk: { per: 1, tac: 1 }, lootUp: true }
];
export const skillById = (id) => SKILLS.find((x) => x.id === id);
// points: one per rank above Cadet, one per finished chapter, one per finished friendship story and case file set
export function skillPoints(S, rankLvl, chaptersDone) { const spent = Object.keys(S.skills || {}).length, bonus = Object.keys(S.arcs || {}).filter((k) => S.arcs[k] >= 5).length + Object.keys(S.caseSets || {}).length + (S.graduated ? 1 : 0); return Math.max(0, (rankLvl - 1) + chaptersDone + bonus - spent); }
export function canLearn(S, sk) { if ((S.skills || {})[sk.id]) return false; if (sk.tier === 1) return true; return !!(S.skills || {})[sk.b + (sk.tier - 1)]; }
