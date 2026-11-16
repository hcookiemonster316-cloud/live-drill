// Learning engine: question pools by lesson, picking (missed and unseen first), mastery and district unlocks.
import { DISTRICTS, RANKS } from './data.js';
const KEY = 'patrolcity:v1';

export function loadState() {
  let s = null; try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
  // a damaged or missing save falls back to the newest hourly backup
  if (!s || typeof s !== 'object') { try { const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('patrolcity:bak:') === 0) ks.push(k); } ks.sort().reverse(); for (const k of ks) { const b = JSON.parse(localStorage.getItem(k)); if (b && b.cs) { s = b; break; } } } catch (e) {} }
  s = s || {};
  return Object.assign({ cs: '', home: null, unlocked: [], cleared: [], shift: 'day', xp: 0, log: {}, seen: {}, miss: {}, calls: 0, answered: 0, right: 0, sound: true, trust: {}, zoom: 0, shiftStats: null, unit: '' }, s);
}
export function saveState(S) { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
export function rankOf(xp) { let r = RANKS[0][1], next = null; for (let i = 0; i < RANKS.length; i++) { if (xp >= RANKS[i][0]) { r = RANKS[i][1]; next = RANKS[i + 1] || null; } } return { name: r, next }; }

let BANK = null;
// the page starts these downloads before the game code has even loaded (see index.html)
async function early(url) { const p = window.__pre && window.__pre[url]; if (!p) return null; window.__pre[url] = null; return p; }
export async function loadBank(url) {
  const d = await early(url) || await (await fetch(url, { cache: 'no-cache' })).json();
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
// facts: the 558 facts of the study hub's Full Chapter Exam (facts.json). Each fact has the questions that test it.
// A fact is complete once you answer one of its questions correctly.
let FACTS = [], POOL = [];
export async function loadFacts(url) {
  const d = await early(url) || await (await fetch(url, { cache: 'no-cache' })).json(); POOL = d.q;
  FACTS = d.f.map((f, i) => ({ id: 'F' + i, les: f[0], text: f[1], pg: f[2], qs: f[3] }));
  return FACTS.length;
}
export const factCount = () => FACTS.length;
export function factList(lessons) { const set = new Set(lessons); return FACTS.filter((f) => set.has(f.les)); }
export function factProgress(S, lessons) { const all = factList(lessons), f = S.facts || {}; return { done: all.filter((x) => f[x.id]).length, total: all.length }; }
// FTO mode (New Game+): select-all-that-apply questions come up whenever a fact has one
let HARD = false; export function setHard(v) { HARD = !!v; }
function factQuestion(f) {
  const simple = f.qs.filter((k) => POOL[k] && !Array.isArray(POOL[k][2])), multiQs = f.qs.filter((k) => POOL[k] && Array.isArray(POOL[k][2])), from = HARD && multiQs.length && Math.random() < .6 ? multiQs : HARD ? f.qs : simple.length ? simple : f.qs;
  const qi = from[Math.floor(Math.random() * from.length)], r = POOL[qi], multi = Array.isArray(r[2]), order = shuffle(r[1].map((_, i) => i));
  return { id: 'P' + qi, fid: f.id, kind: 'fact', les: f.les, stem: r[0], opts: order.map((i) => r[1][i]), c: multi ? r[2].map((k) => order.indexOf(k)) : order.indexOf(r[2]), multi, ex: r[4] || f.text, pg: r[5] || f.pg, fact: f.text };
}
export function fact(S, lesson) { const p = FACTS.filter((f) => f.les === lesson); if (!p.length) return null; const open = p.filter((f) => !(S.facts || {})[f.id]), from = open.length ? open : p, f = from[Math.floor(Math.random() * from.length)]; return { id: f.id, text: f.text, pg: f.pg, les: lesson, done: !!(S.facts || {})[f.id] }; }
// the same question on every player's screen: a fixed fact and pool question, options shuffled by a shared random source
export function factQFixed(fid, qi, r) {
  const f = FACTS.find((x) => x.id === fid); if (!f) return null; const q = POOL[qi] || POOL[f.qs[0]], n = q[1].length, order = q[1].map((_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return { id: 'P' + qi, fid: f.id, kind: 'fact', les: f.les, stem: q[0], opts: order.map((i) => q[1][i]), c: order.indexOf(q[2]), multi: false, ex: q[4] || f.text, pg: q[5] || f.pg, fact: f.text };
}
// for a host picking a round: facts (open ones first) with a single-answer question each, as [fid, poolIndex]
export function pickFactIds(S, lessons, n) { const done = S.facts || {}, all = shuffle(factList(lessons)); all.sort((a, b) => (done[a.id] ? 1 : 0) - (done[b.id] ? 1 : 0)); return all.slice(0, n).map((f) => { const ok = f.qs.filter((k) => POOL[k] && !Array.isArray(POOL[k][2])); const from = ok.length ? ok : f.qs; return [f.id, from[Math.floor(Math.random() * from.length)]]; }); }
export function factQ(id) { const f = FACTS.find((x) => x.id === id); return f ? factQuestion(f) : null; }
// questions for n facts, open facts first (then ones missed recently)
// every question is a fact: facts you haven't learned come first and a learned fact never comes back while any are left.
// opts.wide (default true): if these lessons are all learned, draw unlearned facts from the rest of the chapter instead of repeating.
// opts.exam: an exam may re-test learned facts in these lessons (oldest first).
export function pickFacts(S, lessons, n, opts) {
  opts = opts || {}; const done = S.facts || {}, seen = S.fseen || {}, out = [], used = new Set(OUT_NOW);
  const take = (list) => { for (const f of list) { if (out.length >= n) return; if (used.has(f.id)) continue; used.add(f.id); out.push(f); } };
  take(shuffle(factList(lessons).filter((f) => !done[f.id])));
  if (out.length < n && !opts.exam && opts.wide !== false) take(shuffle(FACTS.filter((f) => !done[f.id])));
  if (out.length < n) take(shuffle(factList(lessons)).sort((a, b) => (seen[a.id] || 0) - (seen[b.id] || 0)));
  out.forEach((f) => { OUT_NOW.push(f.id); if (OUT_NOW.length > 12) OUT_NOW.shift(); });
  return out.map(factQuestion);
}
const OUT_NOW = []; // facts handed out recently, so two scenes in a row don't ask the same one
export function record(S, q, ok) {
  S.seen[q.id] = Date.now(); if (ok) delete S.miss[q.id]; else S.miss[q.id] = 1;
  if (q.fid) { S.fseen = S.fseen || {}; S.fseen[q.fid] = Date.now(); }
  if (ok && q.fid) { S.facts = S.facts || {}; if (!S.facts[q.fid]) { S.facts[q.fid] = 1; S.newFact = (S.newFact || 0) + 1; } }
  const L = (S.log[q.les] = S.log[q.les] || []); L.push(ok ? 1 : 0); while (L.length > 10) L.shift();
  S.answered++; if (ok) S.right++;
}
// a lesson is mastered at 80% or better over its last ten answers, with at least eight answered
export function mastery(S, les) { const L = S.log[les] || []; const pct = L.length ? L.reduce((a, b) => a + b, 0) / L.length : 0; return { n: L.length, pct, done: L.length >= 8 && pct >= .8 }; }
export function districtMastery(S, did) { const ls = DISTRICTS[did].lessons, m = ls.map((l) => Object.assign(mastery(S, l), { facts: factProgress(S, [l]) })), fp = factProgress(S, ls); return { lessons: m, done: m.filter((x) => x.done).length, total: ls.length, facts: fp, ready: fp.total > 0 && fp.done >= fp.total, pct: fp.total ? fp.done / fp.total : 0 }; }
// lesson the next call should teach: the weakest one in the district
export function weakest(S, did) { const ls = DISTRICTS[did].lessons.slice(); return shuffle(ls).sort((a, b) => { const A = mastery(S, a), B = mastery(S, b); return (A.done - B.done) || (A.n - B.n) || (A.pct - B.pct); })[0]; }
export function isRight(q, ans) { return q.multi ? (Array.isArray(ans) && ans.length === q.c.length && ans.every((k) => q.c.indexOf(k) >= 0)) : ans === q.c; }
