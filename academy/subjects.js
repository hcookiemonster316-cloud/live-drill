// Chapter subjects as voices. Each subject of the chapter is a voice in your head, in the style of Disco Elysium's
// skills: it speaks up before a decision (a nudge that never gives the answer away), owns the story beat when a call
// goes wrong (what just happened, and the rule), now and then nods when you get it right, and opens some calls with an
// observation. Voices can be turned off in settings (cfg.voices = false).
const rnd = (a) => a[(Math.random() * a.length) | 0];
export const SUBJECTS = {
  patrol: { name: 'PATROL SENSE', icon: '👣', col: '#f59e0b', les: [0],
    nudge: ["You know this street. What's different about it tonight?", "Patterns. Somebody's watching yours too.", "What would you notice if you'd walked here instead of driven?"],
    wrong: ["You drove right past it. Here's what it was:", "The beat doesn't forgive that. Remember:"], right: ["That's what the beat teaches you.", "Eyes open. Good."],
    open: ["Look at the street before you look at the call.", "Who's out here who shouldn't be? Who's missing who should be?"] },
  safety: { name: 'OFFICER SAFETY', icon: '🛡', col: '#ef4444', les: [1],
    nudge: ["Where are his hands? Where's your cover?", "Nothing is routine. Nothing.", "Slow down. Being right a second late is still late."],
    wrong: ["You got lucky. Lucky isn't a plan. The rule:", "That's how officers get hurt. Remember:"], right: ["Alive and going home. That's the whole job.", "Good. Keep breathing."],
    open: ["Hands, exits, cover. In that order.", "Before you step out, know where you'd go if it goes bad."] },
  comms: { name: 'COMMUNICATIONS', icon: '📻', col: '#3b82f6', les: [2],
    nudge: ["Think before you key up. Who's listening?", "Short and clear, so everyone on the channel can use it."],
    wrong: ["Dead air where the information should have been. The rule:", "Nobody knew where you were. Remember:"], right: ["Clean traffic.", "Dispatch heard every word."],
    open: ["Tell them where you are before you tell them anything else."] },
  records: { name: 'RECORDS', icon: '🗂', col: '#14b8a6', les: [3],
    nudge: ["A query is only as good as what you put in it.", "Is that information yours to use, for this?"],
    wrong: ["The system remembers every keystroke. The rule:", "That record didn't say what you thought it said. Remember:"], right: ["By the book, and logged.", "Confirmed. Now it holds up."],
    open: ["Run it before you trust it."] },
  arrival: { name: 'FIRST ON SCENE', icon: '🚨', col: '#f97316', les: [4],
    nudge: ["How you arrive decides what happens next.", "What can you see before they see you?"],
    wrong: ["You gave yourself away on the way in. Remember:", "The scene changed because of how you arrived. The rule:"], right: ["Quiet and in position. Good.", "That's how you arrive."],
    open: ["Lights off a block out. Count the people. Count the exits."] },
  contact: { name: 'CONTACT AND COVER', icon: '🪪', col: '#a855f7', les: [5, 6],
    nudge: ["One talks, one watches. Who's doing which?", "What's his story, and does it hold together?"],
    wrong: ["That gap is where it goes wrong. The rule:", "You trusted the wrong thing. Remember:"], right: ["That's teamwork.", "His story didn't fool you."],
    open: ["Who's contact, who's cover? Decide now."] },
  threat: { name: 'THREAT ASSESSMENT', icon: '🧭', col: '#eab308', les: [7],
    nudge: ["Behavior, not profiles. What is he actually doing?", "Small signs add up. Who else has seen them?"],
    wrong: ["The signs were there. The rule:", "Somebody should have written that down. Remember:"], right: ["You took it seriously. That matters.", "Now the right people know."],
    open: ["Listen for what people are worried about, not just what they say."] },
  community: { name: 'COMMUNITY', icon: '🤝', col: '#22c55e', les: [8, 9, 10, 11],
    nudge: ["Who is this person, and what do they actually need?", "Kindness is part of the job, not a break from it."],
    wrong: ["Somebody was counting on you there. The rule:", "That's not how you look after people. Remember:"], right: ["That's why people call us.", "Somebody's day just got better."],
    open: ["Somebody here is having the worst day of their year."] },
  fire: { name: 'FIRE AND HAZARDS', icon: '🔥', col: '#f43f5e', les: [12],
    nudge: ["Wind, smoke, fuel. Where are they going?", "What's the danger you can't see yet?"],
    wrong: ["Fire doesn't care what you meant to do. The rule:", "That made it worse. Remember:"], right: ["Clear air, clear exit.", "Safe, and smart."],
    open: ["Check the wind before you check anything else."] },
  law: { name: 'PROPERTY AND THE LAW', icon: '⚖', col: '#94a3b8', les: [13, 14, 15],
    nudge: ["Is this a crime, or a civil matter?", "Whose side are you on? Neither. Keep it that way."],
    wrong: ["That's a call for a judge, not for you. The rule:", "The law says otherwise. Remember:"], right: ["Fair, and within the law.", "Neutral. That's the job here."],
    open: ["Find out who owns what before anyone raises their voice."] },
  crowd: { name: 'CROWD SENSE', icon: '🧠', col: '#ec4899', les: [16],
    nudge: ["Crowds have moods. What's this one's?", "Where's the leader, and where's your way out?"],
    wrong: ["The crowd decided that for you. The rule:", "That's how a crowd turns. Remember:"], right: ["You read the room.", "Calm spreads too."],
    open: ["Find the high ground and the way out."] },
  search: { name: 'SEARCH', icon: '🔦', col: '#06b6d4', les: [17, 18],
    nudge: ["Slow is smooth. What haven't you cleared?", "Where would you hide, if you were him?"],
    wrong: ["He was there the whole time. The rule:", "You left a gap. Remember:"], right: ["Cleared. Nothing behind you.", "Methodical. Good."],
    open: ["Perimeter first. Then patience."] },
  custody: { name: 'CUSTODY', icon: '🔒', col: '#64748b', les: [19, 20],
    nudge: ["Your prisoner, your responsibility. Every minute.", "Who else will handle this person after you?"],
    wrong: ["Custody is a chain, and you broke a link. The rule:", "That's how prisoners get hurt, or get away. Remember:"], right: ["Safe, searched, and documented.", "That's a clean handoff."],
    open: ["Once he's yours, everything that happens to him is on you."] }
};
const BY_LES = {}; Object.keys(SUBJECTS).forEach((k) => SUBJECTS[k].les.forEach((l) => { BY_LES[l] = k; }));

export function installSubjects(H) {
  const on = () => !(H.S.cfg && H.S.cfg.voices === false);
  const key = (les) => BY_LES[Array.isArray(les) ? les[0] : les];
  // the voice speaks as a speaker of its own: 'v_' ids get the inner-voice style in the dialogue box
  const id = (k) => H.sayAs('v_' + k, { name: SUBJECTS[k].name, icon: SUBJECTS[k].icon, role: 'Inner voice · ' + (H.lessonName(SUBJECTS[k].les[0]) || 'Chapter 5') });
  const line = (les, part, extra) => { if (!on()) return null; const k = key(les); if (!k) return null; return [id(k), rnd(SUBJECTS[k][part]) + (extra ? ' ' + extra : ''), { voice: k }]; };
  return {
    on, key,
    nudge: (les) => line(les, 'nudge'),
    wrong: (les, fact) => line(les, 'wrong', fact),
    right: (les) => line(les, 'right'),
    open: (les) => (Math.random() < .4 ? line(les, 'open') : null),
    col: (sp) => { const k = String(sp || '').startsWith('v_') ? String(sp).slice(2) : null; return k && SUBJECTS[k] ? SUBJECTS[k].col : null; }
  };
}
