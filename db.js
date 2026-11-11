// Small database layer: Firebase (anonymous sign-in + Realtime Database), or an in-browser mock for testing (?mock=1).
// Every caller uses: init, get, set, update, remove, on, TS (server timestamp marker), now().
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

export async function connect(cfg, useMock) {
  return useMock ? mock() : firebase(cfg);
}

async function firebase(cfg) {
  const [{ initializeApp }, A, D] = await Promise.all([
    import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-database.js')
  ]);
  const app = initializeApp(cfg);
  const auth = A.getAuth(app);
  const db = D.getDatabase(app);
  const user = await new Promise((res, rej) => {
    const stop = A.onAuthStateChanged(auth, (u) => { if (u) { stop(); res(u); } });
    A.signInAnonymously(auth).catch(rej);
  });
  let offset = 0;
  D.onValue(D.ref(db, '.info/serverTimeOffset'), (s) => { offset = s.val() || 0; });
  return {
    uid: user.uid,
    TS: D.serverTimestamp(),
    now: () => Date.now() + offset,
    get: async (p) => (await D.get(D.ref(db, p))).val(),
    set: (p, v) => D.set(D.ref(db, p), v),
    update: (p, v) => D.update(D.ref(db, p), v),
    remove: (p) => D.remove(D.ref(db, p)),
    on: (p, cb) => D.onValue(D.ref(db, p), (s) => cb(s.val()), (e) => console.warn('listen failed', p, e && e.message)),
    onLeave: (p, v) => D.onDisconnect(D.ref(db, p)).set(v),
    last: async (p, n) => { const out = []; (await D.get(D.query(D.ref(db, p), D.orderByKey(), D.limitToLast(n)))).forEach((c) => { out.push(Object.assign({ k: c.key }, c.val())); }); return out.reverse(); },
    top: async (p, n, low) => {
      const q = D.query(D.ref(db, p), D.orderByChild('s'), low ? D.limitToFirst(n) : D.limitToLast(n));
      const out = []; (await D.get(q)).forEach((c) => { out.push(Object.assign({ k: c.key }, c.val())); });
      return low ? out : out.reverse();
    }
  };
}

// The mock keeps one tree in localStorage and tells other tabs of the same browser about changes.
function mock() {
  const KEY = 'liveMockDB';
  const ch = new BroadcastChannel('liveMock');
  let uid = sessionStorage.getItem('liveMockUid');
  if (!uid) { uid = 'u' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('liveMockUid', uid); }
  const TS = { '.sv': 'timestamp' };
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const parts = (p) => p.split('/').filter(Boolean);
  const at = (tree, p) => parts(p).reduce((n, k) => (n == null ? null : n[k] == null ? null : n[k]), tree);
  const fill = (v) => (Array.isArray(v) ? v.map(fill) : v && typeof v === 'object' ? (v['.sv'] ? Date.now() : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)]))) : v);
  const put = (tree, p, v) => {
    const ks = parts(p); let n = tree;
    for (let i = 0; i < ks.length - 1; i++) { if (n[ks[i]] == null || typeof n[ks[i]] !== 'object') n[ks[i]] = {}; n = n[ks[i]]; }
    if (v == null) delete n[ks[ks.length - 1]]; else n[ks[ks.length - 1]] = fill(v);
  };
  const subs = new Set();
  const fire = () => { const t = read(); subs.forEach((s) => { const v = at(t, s.p), j = JSON.stringify(v); if (j !== s.last) { s.last = j; s.cb(v == null ? null : JSON.parse(j)); } }); };
  const write = (fn) => { const t = read(); fn(t); localStorage.setItem(KEY, JSON.stringify(t)); ch.postMessage(1); setTimeout(fire, 0); return Promise.resolve(); };
  ch.onmessage = () => setTimeout(fire, 30);
  return {
    uid, TS, now: () => Date.now(),
    get: async (p) => at(read(), p),
    set: (p, v) => write((t) => put(t, p, v)),
    update: (p, v) => write((t) => Object.entries(v).forEach(([k, x]) => put(t, p + '/' + k, x))),
    remove: (p) => write((t) => put(t, p, null)),
    on: (p, cb) => { const s = { p, cb, last: undefined }; subs.add(s); setTimeout(fire, 0); return () => subs.delete(s); },
    onLeave: () => {},
    last: async (p, n) => { const v = at(read(), p) || {}; return Object.keys(v).sort().slice(-n).reverse().map((k) => Object.assign({ k }, v[k])); },
    top: async (p, n, low) => { const v = at(read(), p) || {}; return Object.entries(v).map(([k, x]) => Object.assign({ k }, x)).sort((a, b) => (low ? a.s - b.s : b.s - a.s)).slice(0, n); }
  };
}
