// Learning engine: question pools by lesson, picking (missed and unseen first), mastery and district unlocks.
import { DISTRICTS, RANKS } from './data.js';
const KEY = 'patrolcity:v1';

export function loadState() {
  let s = null; try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
  s = s || {};
  return Object.assign({ cs: '', home: null, unlocked: [], cleared: [], shift: 'day', xp: 0, log: {}, seen: {}, miss: {}, calls: 0, answered: 0, right: 0, sound: true, trust: {}, zoom: 0, shiftStats: null }, s);
}
export function saveState(S) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
export function rankOf(xp) { let r = RANKS[0][1], next = null; for (let i = 0; i < RANKS.length; i++) { if (xp >= RANKS[i][0]) { r = RANKS[i][1]; next = RANKS[i + 1] || null; } } return { name: r, next }; }

let BANK = null;
export async function loadBank(url) {
  const d = await (await fetch(url, { cache: 'no-cache' })).json();
  const by = { q: {}, jq: {}, tq: {} };
  d.q.forEach((r, i) => { (by.q[r[3]] = by.q[r[3]] || []).push({ id: 'q' + i, kind: 'q', stem: r[0], opts: r[1], c: r[2], les: r[3], ex: r[4], pg: r[5] }); });
  (d.jq || []).forEach((r, i) => { (by.jq[r[3]] = by.jq[r[3]] || []).push({ id: 'j' + i, kind: 'jq', stem: r[0].replace(/\bTHIS\b/g, '______'), opts: r[1], c: r[2], les: r[3], ex: r[4], pg: r[5] }); });
  (d.tq || []).forEach((r, i) => { (by.tq[r[2]] = by.tq[r[2]] || []).push({ id: 't' + i, kind: 'tq', truth: r[0], lies: r[1], les: r[2], ex: r[3], pg: r[4] }); });
  BANK = { lessons: d.lessons, by };
  return BANK;
}
export const lessonName = (i) => (BANK ? BANK.lessons[i] : 'Lesson ' + i).replace(/^Lesson /, '');

const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// pick n questions of a kind from the given lessons: missed ones first, then never-seen, then oldest-seen
export function pick(S, lessons, kind, n) {
  const pool = [];
  lessons.forEach((l) => (BANK.by[kind][l] || []).forEach((q) => pool.push(q)));
  if (!pool.length && kind !== 'q') return pick(S, lessons, 'q', n);
  const score = (q) => (S.miss[q.id] ? 0 : S.seen[q.id] ? 2 + (S.seen[q.id] / 1e13) : 1) + Math.random() * .5;
  return shuffle(pool).sort((a, b) => score(a) - score(b)).slice(0, n).map(prepare);
}
// shuffle options so the right answer moves; true/false facts become a True or False question
function prepare(q) {
  if (q.kind === 'tq') {
    const lie = Math.random() < .5 && q.lies.length ? q.lies[Math.floor(Math.random() * q.lies.length)] : null;
    return { id: q.id, kind: 'tf', les: q.les, stem: lie || q.truth, opts: ['True', 'False'], c: lie ? 1 : 0, ex: q.ex, pg: q.pg, fact: q.truth };
  }
  const order = shuffle(q.opts.map((_, i) => i)), multi = Array.isArray(q.c);
  return { id: q.id, kind: q.kind, les: q.les, stem: q.stem, opts: order.map((i) => q.opts[i]), c: multi ? q.c.map((k) => order.indexOf(k)) : order.indexOf(q.c), multi, ex: q.ex, pg: q.pg };
}
export function fact(S, lesson) { const p = (BANK.by.tq[lesson] || []); if (!p.length) return null; const q = p[Math.floor(Math.random() * p.length)]; return { text: q.truth, pg: q.pg, les: lesson }; }

export function record(S, q, ok) {
  S.seen[q.id] = Date.now(); if (ok) delete S.miss[q.id]; else S.miss[q.id] = 1;
  const L = (S.log[q.les] = S.log[q.les] || []); L.push(ok ? 1 : 0); while (L.length > 10) L.shift();
  S.answered++; if (ok) S.right++;
}
// a lesson is mastered at 80% or better over its last ten answers, with at least eight answered
export function mastery(S, les) { const L = S.log[les] || []; const pct = L.length ? L.reduce((a, b) => a + b, 0) / L.length : 0; return { n: L.length, pct, done: L.length >= 8 && pct >= .8 }; }
export function districtMastery(S, did) { const ls = DISTRICTS[did].lessons, m = ls.map((l) => mastery(S, l)); return { lessons: m, done: m.filter((x) => x.done).length, total: ls.length, ready: m.every((x) => x.done), pct: m.reduce((a, x) => a + Math.min(1, x.n / 8) * x.pct, 0) / ls.length }; }
// lesson the next call should teach: the weakest one in the district
export function weakest(S, did) { const ls = DISTRICTS[did].lessons.slice(); return shuffle(ls).sort((a, b) => { const A = mastery(S, a), B = mastery(S, b); return (A.done - B.done) || (A.n - B.n) || (A.pct - B.pct); })[0]; }
export function isRight(q, ans) { return q.multi ? (Array.isArray(ans) && ans.length === q.c.length && ans.every((k) => q.c.indexOf(k) >= 0)) : ans === q.c; }
