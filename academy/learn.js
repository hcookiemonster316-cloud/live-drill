// Learning engine: question pools by lesson, picking (missed and unseen first), mastery and district unlocks.
import { DISTRICTS, RANKS } from './data.js';
const KEY = 'patrolcity:v1', CHAPTER_ID = 'vo';

export function loadState() {
  let s = null; try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
  // a damaged or missing save falls back to the newest hourly backup
  if (!s || typeof s !== 'object') { try { const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('patrolcity:bak:') === 0) ks.push(k); } ks.sort().reverse(); for (const k of ks) { const b = JSON.parse(localStorage.getItem(k)); if (b && b.cs) { s = b; break; } } } catch (e) {} }
  s = s || {};
  // the game switched chapters (Chapter 5 to Vehicle Operations): progress tied to the old chapter's lessons and facts is
  // set aside in ch5 (not deleted), and the new chapter starts fresh. Rank, RP, gear, people and places all carry over.
  if (s.ch !== CHAPTER_ID) {
    if (s.log || s.facts || (s.cleared && s.cleared.length) || s.graduated) {
      const keep = {}; ['log', 'seen', 'miss', 'facts', 'fmiss', 'fseen', 'cleared', 'graduated', 'runs', 'newFact'].forEach((k) => { if (s[k] != null) keep[k] = s[k]; });
      s.ch5 = s.ch5 || keep; s.log = {}; s.seen = {}; s.miss = {}; s.facts = {}; s.fmiss = {}; s.fseen = {}; s.cleared = []; s.runs = {}; delete s.graduated; delete s.newFact;
    }
    s.ch = CHAPTER_ID;
  }
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
// facts: the facts of the study hub's Full Chapter Exam (facts_vo.json for Vehicle Operations). Each fact has the questions that test it.
// A fact is complete once you answer one of its questions correctly.
// FACT_BY_ID and FACT_LISTS are built once at load, so lookups by id or lesson don't scan every fact each time
let FACTS = [], POOL = [], FACT_BY_ID = new Map(), FACT_LISTS = new Map();
export async function loadFacts(url) {
  const d = await early(url) || await (await fetch(url, { cache: 'no-cache' })).json(); POOL = d.q;
  // two-statement questions ("Statement A: ... Statement B: ...") are left out everywhere; every fact has other questions
  const two = (k) => POOL[k] && /^\s*Statement A\b/i.test(POOL[k][0]);
  IDF = null; FACTS = d.f.map((f, i) => ({ id: 'F' + i, les: f[0], text: f[1], pg: f[2], qs: f[3].filter((k) => !two(k)).length ? f[3].filter((k) => !two(k)) : f[3] }));
  FACT_BY_ID = new Map(FACTS.map((f) => [f.id, f])); FACT_LISTS = new Map();
  return FACTS.length;
}
export const factCount = () => FACTS.length;
export const lessonCount = () => (BANK ? BANK.lessons.length : 0);
export const allLessons = () => Array.from({ length: lessonCount() }, (_, i) => i);
// the list for a set of lessons is cached (callers only read it; anything that reorders copies it first)
export function factList(lessons) { const k = lessons.join(','); let l = FACT_LISTS.get(k); if (!l) { const set = new Set(lessons); l = FACTS.filter((f) => set.has(f.les)); FACT_LISTS.set(k, l); } return l; }
export const factById = (id) => FACT_BY_ID.get(id) || null;
export function factProgress(S, lessons) { const all = factList(lessons), f = S.facts || {}; return { done: all.filter((x) => f[x.id]).length, total: all.length }; }
// FTO mode (New Game+): select-all-that-apply questions come up whenever a fact has one
let HARD = false; export function setHard(v) { HARD = !!v; }
function factQuestion(f) {
  const simple = f.qs.filter((k) => POOL[k] && !Array.isArray(POOL[k][2])), multiQs = f.qs.filter((k) => POOL[k] && Array.isArray(POOL[k][2])), from = HARD && multiQs.length && Math.random() < .6 ? multiQs : HARD ? f.qs : simple.length ? simple : f.qs;
  const qi = from[Math.floor(Math.random() * from.length)], r = POOL[qi], multi = Array.isArray(r[2]), order = shuffle(r[1].map((_, i) => i));
  return { id: 'P' + qi, fid: f.id, kind: 'fact', les: f.les, stem: r[0], opts: order.map((i) => r[1][i]), c: multi ? r[2].map((k) => order.indexOf(k)) : order.indexOf(r[2]), multi, ex: r[4] || f.text, pg: r[5] || f.pg, fact: f.text };
}
export function fact(S, lesson) { const p = factList([lesson]); if (!p.length) return null; const open = p.filter((f) => !(S.facts || {})[f.id]), from = open.length ? open : p, f = from[Math.floor(Math.random() * from.length)]; return { id: f.id, text: f.text, pg: f.pg, les: lesson, done: !!(S.facts || {})[f.id] }; }
// the same question on every player's screen: a fixed fact and pool question, options shuffled by a shared random source
export function factQFixed(fid, qi, r) {
  const f = FACT_BY_ID.get(fid); if (!f) return null; const q = POOL[qi] || POOL[f.qs[0]], n = q[1].length, order = q[1].map((_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return { id: 'P' + qi, fid: f.id, kind: 'fact', les: f.les, stem: q[0], opts: order.map((i) => q[1][i]), c: order.indexOf(q[2]), multi: false, ex: q[4] || f.text, pg: q[5] || f.pg, fact: f.text };
}
// for a host picking a round: facts (open ones first) with a single-answer question each, as [fid, poolIndex]
export function pickFactIds(S, lessons, n) { const done = S.facts || {}, all = shuffle(factList(lessons)); all.sort((a, b) => (done[a.id] ? 1 : 0) - (done[b.id] ? 1 : 0)); return all.slice(0, n).map((f) => { const ok = f.qs.filter((k) => POOL[k] && !Array.isArray(POOL[k][2])); const from = ok.length ? ok : f.qs; return [f.id, from[Math.floor(Math.random() * from.length)]]; }); }
// a study group's sim exam: the same n facts and questions for every member, picked from a shared seed (squad code + week)
export function seedRand(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } let s = h >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
export function groupExamIds(seed, n) { const r = seedRand(seed), all = FACTS.filter((f) => f.qs.some((k) => POOL[k] && !Array.isArray(POOL[k][2]))); for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return all.slice(0, n).map((f) => { const ok = f.qs.filter((k) => POOL[k] && !Array.isArray(POOL[k][2])); return [f.id, ok[Math.floor(r() * ok.length)]]; }); }
// the full chapter test: every fact, each once, in a shuffled order kept with the saved run
export const examOrder = () => shuffle(FACTS.map((f) => f.id));
export function examQs(ids) { return ids.map((id) => FACT_BY_ID.get(id)).filter(Boolean).map(factQuestion); }
// the practice exam: every fact's id, and n facts drawn at random from the whole chapter (single-answer questions only)
export const allFactIds = () => FACTS.map((f) => f.id);
export const allFacts = () => FACTS;
// facts taught in staged scenes (stage.js): kept out of the plain quiz until you've met them in their scene
let STAGED = null; export function setStaged(s) { STAGED = s; }
export function examQsSingle(ids) { return ids.map((id) => { const f = FACT_BY_ID.get(id); if (!f) return null; const ok = f.qs.filter((k) => POOL[k] && !Array.isArray(POOL[k][2])); return ok.length ? factQFixed(id, ok[Math.floor(Math.random() * ok.length)], Math.random) : null; }).filter(Boolean); }
export function drawIds(n) { return shuffle(FACTS.filter((f) => f.qs.some((k) => POOL[k] && !Array.isArray(POOL[k][2])))).slice(0, n).map((f) => f.id); }
export function factQ(id) { const f = FACT_BY_ID.get(id); return f ? factQuestion(f) : null; }
// questions for n facts, open facts first (then ones missed recently)
// every question is a fact: facts you haven't learned come first and a learned fact never comes back while any are left.
// opts.wide (default true): if these lessons are all learned, draw unlearned facts from the rest of the chapter instead of repeating.
// opts.exam: an exam may re-test learned facts in these lessons (oldest first).
const STOPW = new Set('a an and are as at be by for from has have in is it of on or that the their they this to was were will with you your not but can when what which who than then there these those its into about after before over under while been being also only more most some such very'.split(' '));
// the content words of a text, lowercased and roughly stemmed (crashes, crashed -> crash)
const words = (t) => (String(t || '').toLowerCase().match(/[a-z]{4,}/g) || []).filter((w) => !STOPW.has(w)).map((w) => w.replace(/(ing|ed|es|s)$/, ''));
// how telling each word is across the whole chapter (log of facts / facts using it), worked out once and kept
let IDF = null;
function wordIdf() { if (IDF) return IDF; const df = new Map(); for (const f of FACTS) for (const w of new Set(words(f.text))) df.set(w, (df.get(w) || 0) + 1);
  IDF = new Map(); const N = FACTS.length || 1; df.forEach((d, w) => IDF.set(w, Math.log(1 + N / d))); return IDF; }
export function pickFacts(S, lessons, n, opts) {
  opts = opts || {}; const done = S.facts || {}, seen = S.fseen || {}, out = [], used = new Set(OUT_NOW);
  const take = (list) => { for (const f of list) { if (out.length >= n) return; if (used.has(f.id)) continue; used.add(f.id); out.push(f); } };
  // facts you haven't mastered yet, the ones you've seen least recently first (never-seen first): you work through all of them,
  // and a missed fact comes back after the others instead of right away
  // opts.near: words from the call being worked; facts that share its words come first (a crash call asks about crashes),
  // keeping the usual order among them
  // shared words count by how rare they are in the chapter (a call's "caller" and "report" match half the book; its
  // "hydroplaning" matches one fact), so the call's telling word decides
  const nearW = opts.near ? new Set(words(opts.near)) : null, rel = (f) => { if (!nearW) return 0; const W = wordIdf(); let k = 0; for (const w of new Set(words(f.text))) if (nearW.has(w)) k += W.get(w) || 0; return k; };
  const byRel = (list) => (nearW ? list.map((f, i) => [f, rel(f), i]).sort((x, y) => (y[1] > 0) - (x[1] > 0) || y[1] - x[1] || x[2] - y[2]).map((x) => x[0]) : list);
  const fresh = (list) => byRel(shuffle(list.filter((f) => !done[f.id] && !(STAGED && !opts.exam && STAGED.has(f.id) && !seen[f.id]))).sort((a, b) => (seen[a.id] || 0) - (seen[b.id] || 0)));
  take(dueReviews(S, lessons)); // a fact you missed comes back a few minutes later, ahead of new ones
  take(fresh(factList(lessons)));
  if (out.length < n && !opts.exam && opts.wide !== false) take(fresh(FACTS));
  if (out.length < n) take(shuffle(factList(lessons)).sort((a, b) => (seen[a.id] || 0) - (seen[b.id] || 0)));
  out.forEach((f) => { OUT_NOW.push(f.id); if (OUT_NOW.length > 12) OUT_NOW.shift(); });
  return out.map(factQuestion);
}
// spaced review: a missed fact is due again REVIEW_MS after the miss (soon enough to fix it, late enough not to parrot it)
export const REVIEW_MS = 4 * 60 * 1000;
// after a missed fact is fixed it comes back three more times, further apart each time, before it counts as locked in
export const SPACING = [20 * 60 * 1000, 24 * 3600 * 1000, 4 * 24 * 3600 * 1000];
export function dueReviews(S, lessons) { const fm = S.fmiss || {}, fd = S.fdue || {}, now = Date.now(); const at = (f) => (fm[f.id] ? fm[f.id] + REVIEW_MS : fd[f.id] || Infinity);
  return factList(lessons).filter((f) => (fm[f.id] && now - fm[f.id] >= REVIEW_MS) || (fd[f.id] && now >= fd[f.id])).sort((a, b) => at(a) - at(b)); }
// how ready you are for the final exam: facts you've gotten right and haven't missed since, out of the whole chapter,
// plus the lessons with the most left to learn
export function readiness(S) {
  const f = S.facts || {}, fm = S.fmiss || {}, solid = FACTS.filter((x) => f[x.id] && !fm[x.id]).length, total = FACTS.length;
  const les = Array.from({ length: lessonCount() }, (_, i) => { const p = factProgress(S, [i]); return { les: i, name: lessonName(i), done: p.done, total: p.total, left: p.total - p.done }; });
  const weak = les.filter((x) => x.left > 0).sort((a, b) => (b.left / b.total) - (a.left / a.total) || b.left - a.left).slice(0, 3);
  const fd = S.fdue || {}, now = Date.now();
  return { pct: total ? Math.round(100 * solid / total) : 0, solid, total, review: Object.keys(fm).length, spaced: Object.keys(fd).length, dueNow: Object.keys(fd).filter((k) => now >= fd[k]).length, fixed: S.rvfix || 0, weak };
}
const OUT_NOW = []; // facts handed out recently, so two scenes in a row don't ask the same one
export function record(S, q, ok) {
  S.seen[q.id] = Date.now(); if (ok) delete S.miss[q.id]; else S.miss[q.id] = 1;
  let review = false;
  if (q.fid) { S.fseen = S.fseen || {}; S.fseen[q.fid] = Date.now(); S.fmiss = S.fmiss || {}; S.fdue = S.fdue || {}; S.frev = S.frev || {}; const id = q.fid, now = Date.now();
    if (!ok) { S.fmiss[id] = now; delete S.fdue[id]; S.frev[id] = 0; }
    else if (S.fmiss[id] || (S.fdue[id] && now >= S.fdue[id])) { // a review that came back right: the next one waits longer
      review = true; delete S.fmiss[id]; const n = (S.frev[id] || 0) + 1; S.frev[id] = n; if (n <= SPACING.length) S.fdue[id] = now + SPACING[n - 1]; else delete S.fdue[id]; S.rvfix = (S.rvfix || 0) + 1; }
    else delete S.fmiss[id]; }
  if (ok && q.fid) { S.facts = S.facts || {}; if (!S.facts[q.fid]) { S.facts[q.fid] = 1; S.newFact = (S.newFact || 0) + 1; } }
  const L = (S.log[q.les] = S.log[q.les] || []); L.push(ok ? 1 : 0); while (L.length > 10) L.shift();
  S.answered++; if (ok) S.right++;
  return review;
}
// a lesson is mastered at 80% or better over its last ten answers, with at least eight answered
export function mastery(S, les) { const L = S.log[les] || []; const pct = L.length ? L.reduce((a, b) => a + b, 0) / L.length : 0; return { n: L.length, pct, done: L.length >= 8 && pct >= .8 }; }
export function districtMastery(S, did) { const ls = DISTRICTS[did].lessons, m = ls.map((l) => Object.assign(mastery(S, l), { facts: factProgress(S, [l]) })), fp = factProgress(S, ls); return { lessons: m, done: m.filter((x) => x.done).length, total: ls.length, facts: fp, ready: fp.total > 0 && fp.done >= fp.total, pct: fp.total ? fp.done / fp.total : 0 }; }
// lesson the next call should teach: the weakest one in the district
// a lesson with a missed fact due for review comes first, so review arrives as the next call over the radio
export function weakest(S, did) { const ls = DISTRICTS[did].lessons.slice(), due = (l) => (dueReviews(S, [l]).length ? 0 : 1); return shuffle(ls).sort((a, b) => { const A = mastery(S, a), B = mastery(S, b); return (due(a) - due(b)) || (A.done - B.done) || (A.n - B.n) || (A.pct - B.pct); })[0]; }
export function isRight(q, ans) { return q.multi ? (Array.isArray(ans) && ans.length === q.c.length && ans.every((k) => q.c.indexOf(k) >= 0)) : ans === q.c; }
