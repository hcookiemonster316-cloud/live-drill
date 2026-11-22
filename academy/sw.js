// Patrol City service worker: the game opens fast on repeat visits and keeps working on a weak signal.
// Code and pages: network first (so an update is never missed), the cached copy if the network is slow or gone.
// Study data and music: the cached copy right away, refreshed in the background for next time.
const CACHE = 'pc-v2'; // bumped: clears any mixed old copies
const BIG = /\.(json|mp3|woff2?|png|jpg|webp)(\?|$)/;
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k); await self.clients.claim(); })()));
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || r.headers.has('range')) return; // audio range requests go straight to the network
  if (u.origin !== location.origin) return; // never Firebase or other live data
  if (u.pathname.endsWith('/sw.js')) return;
  e.respondWith(BIG.test(u.pathname) || /fonts\./.test(u.hostname) ? stale(r) : fresh(r));
});
async function put(r, res) { if (res && (res.ok || res.type === 'opaque')) { const c = await caches.open(CACHE); await c.put(r, res.clone()); } return res; }
async function stale(r) {
  const hit = await caches.match(r, { ignoreSearch: true }), net = fetch(r).then((res) => put(r, res)).catch(() => null);
  return hit || (await net) || Response.error();
}
// code: always the network's copy when the network answers at all (never an old file mixed with new ones, which breaks
// the game's imports); the saved copy only when there is no connection. Pages may fall back after a few seconds.
async function fresh(r) {
  const code = /\.(js|css)(\?|$)/.test(new URL(r.url).pathname), net = fetch(r, { cache: 'no-cache' }).then((res) => put(r, res));
  if (code) { try { const res = await net; if (res && res.ok) return res; } catch (e) {} const hit = await caches.match(r, { ignoreSearch: true }); return hit || Response.error(); }
  const slow = new Promise((ok) => setTimeout(ok, 3500, null));
  try { const res = await Promise.race([net, slow]); if (res) return res; } catch (e) {}
  const hit = await caches.match(r, { ignoreSearch: true }); if (hit) return hit;
  return net.catch(() => Response.error());
}
