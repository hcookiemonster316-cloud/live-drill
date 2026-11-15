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
      const got = {}; const emit = () => { const all = {}; Object.keys(got).forEach((sh) => Object.assign(all, got[sh])); onPlayers(all, db.uid); };
      stops = (SEES[shift] || [shift]).map((sh) => db.on('mmo/' + did + '/' + sh + '/p', (v) => { got[sh] = v || {}; emit(); }));
      clearInterval(timer); timer = setInterval(() => N.beat(), 10000);
    },
    move(x, y, v, dir) {
      if (!base) return; me.x = Math.round(x * 10) / 10; me.y = Math.round(y * 10) / 10; me.v = v ? +v : 0; me.d = dir;
      const now = Date.now(); if (now - lastSent < 350) return; lastSent = now;
      db.update(base + '/' + db.uid, { x: me.x, y: me.y, v: me.v, d: me.d || 0, t: db.TS });
    },
    beat() { if (base) db.update(base + '/' + db.uid, { t: db.TS }); },
    status(st) { if (base) db.update(base + '/' + db.uid, { st }); },
    quick(k) { if (base) db.update(base + '/' + db.uid, { q: { k, t: db.TS } }); },
    backup(b) { if (base) db.update(base + '/' + db.uid, { b: b ? Object.assign({}, b, { t: db.TS }) : null }); },
    inside(n) { if (base) db.update(base + '/' + db.uid, { n: n == null ? -1 : n }); },
    flair(f) { if (base) db.update(base + '/' + db.uid, { f: f || null }); },
    assist(uid) { if (base) db.update(base + '/' + db.uid, { a: uid || null }); },
    // district chat: one list per district per day, each message written once by its sender
    chatOn(did, cb) { if (N._chatStop) N._chatStop(); const day = new Date().toISOString().slice(0, 10).replace(/-/g, ''); N._chatPath = 'mmo/chat/' + did + '/' + day; const f = db.on(N._chatPath, (v) => cb(v || {})); N._chatStop = typeof f === 'function' ? f : null; },
    chatSend(m, cs, sh) { if (!N._chatPath) return; const k = Date.now().toString(36) + db.uid.slice(0, 6).replace(/[^a-zA-Z0-9]/g, ''); return db.set(N._chatPath + '/' + k, { u: db.uid, c: cs, m: m, s: sh, t: db.TS }); },
    leave() { if (base) { try { db.remove(base + '/' + db.uid); } catch (e) {} } stops.forEach((f) => typeof f === 'function' && f()); stops = []; base = null; clearInterval(timer); }
  };
  addEventListener('pagehide', () => N.leave());
  return N;
}
