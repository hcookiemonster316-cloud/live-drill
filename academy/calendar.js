// The academy calendar: every full shift is one academy day, and the term counts down to exam day. Exam day is a target,
// never a lock: the Chapter 5 Final Exam opens when every district is cleared, early or late. Each day has a class from
// the chapter syllabus, and the calendar shows where the regulars you know are right now, friends first, with what they
// do at this hour (their routines live in polish.js and act2.js).
export const TERM = 20;
const LESSONS = 21;
const TIER = (f) => (f >= 6 ? 'Close friend' : f >= 3 ? 'Friend' : 'Knows your name');

export function installCalendar(H) {
  const S = H.S; S.cal = S.cal || { day: 1 };
  const day = () => S.cal.day || 1, left = () => Math.max(0, TERM - day());
  // the syllabus: days 1 to 19 walk the chapter in order, day 20 is the exam
  const classOf = (d) => { if (d >= TERM) return []; const a = Math.floor((d - 1) * LESSONS / (TERM - 1)), b = Math.floor(d * LESSONS / (TERM - 1)); const out = []; for (let l = a; l < Math.max(a + 1, b); l++) out.push(l); return out; };
  const ready = () => (S.cleared || []).length >= 5;
  function advance() { S.cal.day = day() + 1; H.saveS(); }
  // said over the radio when a shift starts
  function onShift() {
    const d = day(), cls = classOf(d).map((l) => H.lessonName(l)).filter(Boolean);
    if (d < TERM) H.radio('Academy', 'Academy day ' + d + ' of ' + TERM + '. ' + left() + (left() === 1 ? ' day' : ' days') + ' to the final exam.' + (cls.length ? ' Today\'s class: ' + cls.join(' and ') + '.' : ''));
    else if (!S.cal.examDay) { S.cal.examDay = 1; H.saveS(); H.radio('Academy', ready() ? 'Exam day. Your last shift is ready when you are. Open the calendar or your unit card to start it.' : 'Exam day is here. Clear the remaining districts and the exam opens. It waits for you; there\'s no penalty for taking longer.'); }
  }
  // where a regular is right now: their routine at this hour, or their usual spot
  const whereNow = (n) => (H.whereNow && H.whereNow(n)) || H.homeOf(n) || 'around the district';
  function panel() {
    const d = day(), did = H.did(), cl = (S.cleared || []).length;
    const cells = Array.from({ length: TERM }, (_, i) => { const n = i + 1, k = n < d ? 'past' : n === d ? 'now' : 'next'; return '<span class="calD ' + k + (n === TERM ? ' exam' : '') + '"' + (n === d ? ' aria-current="date"' : '') + '>' + (n === TERM ? 'EXAM' : n) + '</span>'; }).join('');
    const cls = classOf(d), today = d >= TERM ? 'Exam day. Every fact in the chapter, 85% to pass.' : cls.map((l) => H.lessonName(l)).filter(Boolean).join(' · ');
    const known = H.NPCS.filter((n) => n.d === did && (S.npc || {})[n.id] > 0).sort((a, b) => (S.npc[b.id] || 0) - (S.npc[a.id] || 0)).slice(0, 8);
    const rows = known.map((n) => '<li class="memRow' + (S.npc[n.id] >= 3 ? ' good' : '') + '"><i>' + n.icon + '</i><span><b>' + H.esc(n.name) + '</b> · ' + TIER(S.npc[n.id]) + '<br><small>Right now: ' + H.esc(whereNow(n)) + '</small></span></li>').join('');
    const status = d >= TERM ? (ready() ? 'The final exam is open.' : 'Exam day is here. Clear ' + (5 - cl) + ' more district' + (5 - cl === 1 ? '' : 's') + ' and the exam opens. No penalty for taking longer.')
      : left() + (left() === 1 ? ' day' : ' days') + ' to the final exam · ' + cl + ' of 5 districts cleared' + (ready() ? ' · the exam is already open.' : '.');
    H.openModal('<div class="sceneHead"><b>ACADEMY CALENDAR</b><h2>Day ' + Math.min(d, TERM) + ' of ' + TERM + '</h2><p>' + H.esc(status) + ' Every full shift is one academy day.</p></div>' +
      '<div class="calStrip" role="list" aria-label="Academy term">' + cells + '</div>' +
      '<p class="finLbl">Today\'s class</p><p class="calClass">' + H.esc(today) + '</p>' +
      '<p class="finLbl">Your regulars this hour</p>' + (rows ? '<ul class="memList">' + rows + '</ul>' : '<p class="calClass">Nobody here knows your name yet. Stop and talk to the people on your beat; they keep their own hours.</p>') +
      '<div class="qAct">' + (ready() ? '<button type="button" id="calExam">' + (S.graduated ? 'Retake the exam' : 'Start the final exam') + '</button>' : '') + '<button type="button" class="' + (ready() ? 'ghost' : '') + '" id="calClose">Back to patrol</button></div>');
    const c = document.getElementById('calClose'); if (c) c.onclick = () => H.closeModal();
    const e = document.getElementById('calExam'); if (e) e.onclick = () => { H.closeModal(); H.exam(); };
  }
  return { day, left, classOf, advance, onShift, panel, TERM };
}
