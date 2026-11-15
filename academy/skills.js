// Training skill tree: three branches, four tiers each. A point comes with every promotion and every story chapter.
// Passives add to stats and perks; actives are abilities you trigger in the field, on a cooldown.
export const BRANCHES = [
  { id: 'com', name: 'Community', icon: '🤝', color: '#22c55e', blurb: 'Talk people through it. Trust opens doors.' },
  { id: 'tac', name: 'Tactics', icon: '🛡️', color: '#3b82f6', blurb: 'Plan, position, cover. Calls go smoother.' },
  { id: 'inv', name: 'Investigation', icon: '🔎', color: '#a855f7', blurb: 'Notice everything. Follow it up.' }
];
export const SKILLS = [
  { id: 'com1', b: 'com', tier: 1, name: 'Good Listener', text: '+1 Rapport.', perk: { rap: 1 } },
  { id: 'com2', b: 'com', tier: 2, name: 'Known on the Beat', text: 'Regulars and citizens pay 20% more RP, and community trust grows faster.', perk: { rpCit: 20 }, trustX: 1.5 },
  { id: 'com3', b: 'com', tier: 3, name: 'Community Policing', text: 'ACTIVE: two locals with questions come find you. Twice a shift.', active: { key: 'summon', uses: 2, icon: '🤝' } },
  { id: 'com4', b: 'com', tier: 4, name: 'Pillar of the District', text: '+1 Rapport, +1 Composure. Regulars sometimes radio you tips about hidden finds.', perk: { rap: 1, com: 1 }, tips: true },
  { id: 'tac1', b: 'tac', tier: 1, name: 'Contact and Cover', text: '+1 Tactics.', perk: { tac: 1 } },
  { id: 'tac2', b: 'tac', tier: 2, name: 'Smart Approach', text: 'Good approach choices on calls pay a further 15% RP.', approachX: 1.15 },
  { id: 'tac3', b: 'tac', tier: 3, name: 'Code 3', text: 'ACTIVE: lights and siren for 3 minutes of shift time. Drive 35% faster and calls wait for you. Twice a shift.', active: { key: 'code3', uses: 2, icon: '🚨' } },
  { id: 'tac4', b: 'tac', tier: 4, name: 'Calm Under Pressure', text: '+1 Tactics, +1 Composure. Priority 1 calls pay 25% more.', perk: { tac: 1, com: 1 }, pri1X: 1.25 },
  { id: 'inv1', b: 'inv', tier: 1, name: 'Sharp Eyes', text: '+1 Perception.', perk: { per: 1 } },
  { id: 'inv2', b: 'inv', tier: 2, name: 'Field Notes', text: 'Study points pay 25% more RP and recharge faster. +8% item find.', perk: { rpStudy: 25, loot: 8 } },
  { id: 'inv3', b: 'inv', tier: 3, name: 'Canvass the Area', text: 'ACTIVE: reveal every "something\'s off", lost & found sparkle and secret spot within a wide radius. Twice a shift.', active: { key: 'canvass', uses: 2, icon: '🔦' } },
  { id: 'inv4', b: 'inv', tier: 4, name: 'Follow the Evidence', text: '+1 Perception, +1 Tactics. Secret spots and lost & found items roll one rank higher.', perk: { per: 1, tac: 1 }, lootUp: true }
];
export const skillById = (id) => SKILLS.find((x) => x.id === id);
// points: one per rank above Cadet, one per finished chapter
export function skillPoints(S, rankLvl, chaptersDone) { const spent = Object.keys(S.skills || {}).length; return Math.max(0, (rankLvl - 1) + chaptersDone - spent); }
export function canLearn(S, sk) { if ((S.skills || {})[sk.id]) return false; if (sk.tier === 1) return true; return !!(S.skills || {})[sk.b + (sk.tier - 1)]; }
