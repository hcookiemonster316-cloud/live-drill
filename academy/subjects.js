// Chapter subjects as voices. Each subject of the chapter is a voice in your head, in the style of Disco Elysium's
// skills: it speaks up before a decision (a nudge that never gives the answer away), owns the story beat when a call
// goes wrong (what just happened, and the rule), now and then nods when you get it right, and opens some calls with an
// observation. Voices can be turned off in settings (cfg.voices = false).
const rnd = (a) => a[(Math.random() * a.length) | 0];
// the subjects themselves are the chapter's (vodata.js); Chapter 5's are kept in ch5data.js
import { SUBJECTS } from './vodata.js';
export { SUBJECTS };
const BY_LES = {}; Object.keys(SUBJECTS).forEach((k) => SUBJECTS[k].les.forEach((l) => { BY_LES[l] = k; }));

export function installSubjects(H) {
  const on = () => !(H.S.cfg && H.S.cfg.voices === false);
  const key = (les) => BY_LES[Array.isArray(les) ? les[0] : les];
  // the voice speaks as a speaker of its own: 'v_' ids get the inner-voice style in the dialogue box
  const id = (k) => H.sayAs('v_' + k, { name: SUBJECTS[k].name, icon: SUBJECTS[k].icon, role: 'Inner voice · ' + (H.lessonName(SUBJECTS[k].les[0]) || 'Vehicle Operations') });
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
