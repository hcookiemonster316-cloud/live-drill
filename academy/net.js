// Live multiplayer for Patrol City: presence per district and shift, quick radio messages and backup requests.
// Everything for one player lives at mmo/{district}/{shift}/p/{uid}, so the rules only let you write your own entry.
import { connect } from '../db.js';
import { SEES } from './data.js';

export async function startNet(onPlayers) {
  const cfg = window.LIVE_CONFIG || {}, mock = /[?&]mock\b/.test(location.search);
  let db = null;
  try { db = await connect(cfg.firebase, mock); } catch (e) { console.warn('offline', e); return null; }
  let base = null, me = {}, lastSent = 0, timer = 0, stops = [];
  const N = {
    uid: db.uid,
    now: () => db.now(),
    async join(did, shift, info) {
      if (base) N.leave();
      base = 'mmo/' + did + '/' + shift + '/p';
      me = Object.assign({ s: shift, u: info.unit || 'swat', n: -1, f: info.flair || null, c: info.cs, x: info.x, y: info.y, v: 0, st: 'patrol', r: info.rank || 'Cadet' }, { t: db.TS });
      await db.set(base + '/' + db.uid, me);
      db.onLeave(base + '/' + db.uid, null);
      // listen to every shift this one can see (midshift sees day and night; they each see midshift)
      // presence arrives player by player (child events) and the game hears about it at most ~6 times a second,
      // however many people are on shift: 60 players moving is a trickle of small updates, not 60 full lists a second
      const got = {}; let pend = 0; N.count = 0;
      const emit = () => { pend = 0; const all = {}; Object.keys(got).forEach((sh) => Object.assign(all, got[sh])); N.count = Object.keys(all).length; onPlayers(all, db.uid); };
      const soon = () => { if (!pend) pend = setTimeout(emit, 160); };
      stops = (SEES[shift] || [shift]).map((sh) => { got[sh] = {}; return db.onKids ? db.onKids('mmo/' + did + '/' + sh + '/p', { put: (k, v) => { got[sh][k] = v; soon(); }, del: (k) => { delete got[sh][k]; soon(); } }) : db.on('mmo/' + did + '/' + sh + '/p', (v) => { got[sh] = v || {}; soon(); }); });
      clearInterval(timer); timer = setInterval(() => N.beat(), 10000);
    },
    move(x, y, v, dir) {
      if (!base) return; const nx = Math.round(x * 10) / 10, ny = Math.round(y * 10) / 10, nv = v ? +v : 0, nd = dir || 0;
      // send only real movement, and send it less often the busier the district is (others smooth between updates)
      const now = Date.now(), gap = N.count > 40 ? 900 : N.count > 15 ? 600 : 350, moved = Math.hypot(nx - (me.sx || 0), ny - (me.sy || 0)) >= .2 || nv !== me.sv || nd !== me.sd;
      me.x = nx; me.y = ny; me.v = nv; me.d = nd;
      if (now - lastSent < gap || (!moved && now - lastSent < 8000)) return; lastSent = now; me.sx = nx; me.sy = ny; me.sv = nv; me.sd = nd;
      db.update(base + '/' + db.uid, { x: nx, y: ny, v: nv, d: nd, t: db.TS });
    },
    beat() { if (base) db.update(base + '/' + db.uid, { t: db.TS }); },
    status(st) { if (base) db.update(base + '/' + db.uid, { st }); },
    quick(k) { if (base) db.update(base + '/' + db.uid, { q: { k, t: db.TS } }); },
    backup(b) { if (base) db.update(base + '/' + db.uid, { b: b ? Object.assign({}, b, { t: db.TS }) : null }); },
    inside(n) { if (base) db.update(base + '/' + db.uid, { n: n == null ? -1 : n }); },
    flair(f) { if (base) db.update(base + '/' + db.uid, { f: f || null }); },
    assist(uid) { if (base) db.update(base + '/' + db.uid, { a: uid || null }); },
    // co-op: who I'm riding with, my ride-along answers, and my latest choice in a shared scene
    ride(uid) { if (base) db.update(base + '/' + db.uid, { ra: uid || null }); },
    rq(ok) { if (base) db.update(base + '/' + db.uid, { rq: { ok: !!ok, t: db.TS } }); },
    cc(x, r) { if (base) db.update(base + '/' + db.uid, { cc: { x, r: r || '', t: db.TS } }); },
    // district chat: one list per district per day, each message written once by its sender
    chatOn(did, cb) { if (N._chatStop) N._chatStop(); const day = new Date().toISOString().slice(0, 10).replace(/-/g, ''); N._chatPath = 'mmo/chat/' + did + '/' + day; const f = db.onLast ? db.onLast(N._chatPath, 60, (v) => cb(v || {})) : db.on(N._chatPath, (v) => cb(v || {})); N._chatStop = typeof f === 'function' ? f : null; },
    chatSend(m, cs, sh) { if (!N._chatPath) return; const k = Date.now().toString(36) + db.uid.slice(0, 6).replace(/[^a-zA-Z0-9]/g, ''); return db.set(N._chatPath + '/' + k, { u: db.uid, c: cs, m: m, s: sh, t: db.TS }); },
    // ---- channels: district (above), city-wide, squad and direct messages ----
    squadTag(g, k) { if (base) db.update(base + '/' + db.uid, { g: g || null, k: k || null }); },
    listen(path, cb, n) { const f = n && db.onLast ? db.onLast(path, n, (v) => cb(v || {})) : db.on(path, (v) => cb(v || {})); return typeof f === 'function' ? f : () => {}; },
    post(path, msg) { const k = Date.now().toString(36) + db.uid.slice(0, 6).replace(/[^a-zA-Z0-9]/g, ''); return db.set(path + '/' + k, Object.assign({ u: db.uid, t: db.TS }, msg)); },
    day: () => new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    cityPath() { return 'mmo/chat/city/' + N.day(); },
    // squads: mmo/sq/{code}/i (name, tag, leader), /m/{uid} (members), /c/{day} (squad chat)
    sqCreate(code, name, tag) { return db.set('mmo/sq/' + code + '/i', { n: name, g: tag, l: db.uid, t: db.TS }); },
    sqLead(code, uid) { return db.update('mmo/sq/' + code + '/i', { l: uid, t: db.TS }); },
    sqGet(code) { return db.get('mmo/sq/' + code); },
    sqJoin(code, me) { return db.set('mmo/sq/' + code + '/m/' + db.uid, Object.assign({ t: db.TS }, me)); },
    sqBeat(code, me) { return db.update('mmo/sq/' + code + '/m/' + db.uid, Object.assign({ t: db.TS }, me)); },
    sqLeave(code, uid) { return db.remove('mmo/sq/' + code + '/m/' + (uid || db.uid)); },
    sqChatPath(code) { return 'mmo/sq/' + code + '/c/' + N.day(); },
    // invites and direct messages
    invite(uid, d) { return db.set('mmo/inv/' + uid + '/' + db.uid, Object.assign({ t: db.TS }, d)); },
    invClear(from) { return db.remove('mmo/inv/' + db.uid + '/' + from); },
    invPath() { return 'mmo/inv/' + db.uid; },
    dmPath(uid) { return 'mmo/dm/' + [db.uid, uid].sort().join('_'); },
    dmSend(uid, m, cs) { N.post(N.dmPath(uid), { c: cs, m }); return db.set('mmo/ib/' + uid + '/' + db.uid, { c: cs, m: m.slice(0, 80), t: db.TS }); },
    inboxPath() { return 'mmo/ib/' + db.uid; },
    // mini games: rooms at mmo/gm/{code} (m = host's meta, p/{uid} = each player's own entry), open lobbies at mmo/gl/{district}
    gset: (p, v) => db.set(p, v), gupd: (p, v) => db.update(p, v), grm: (p) => db.remove(p), gget: (p) => db.get(p),
    gon(p, cb) { const f = db.on(p, (v) => cb(v)); return typeof f === 'function' ? f : () => {}; },
    gbye(p) { try { db.onLeave(p, null); } catch (e) {} },
    TS: db.TS,
    leave() { if (base) { try { db.remove(base + '/' + db.uid); } catch (e) {} } stops.forEach((f) => typeof f === 'function' && f()); stops = []; base = null; clearInterval(timer); }
  };
  addEventListener('pagehide', () => N.leave());
  return N;
}
