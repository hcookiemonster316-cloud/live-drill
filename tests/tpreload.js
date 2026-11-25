// every module the game imports at startup has a modulepreload link in index.html, so a phone fetches them all in
// one round trip instead of discovering them a level at a time (a missing one costs a full extra round trip)
const fs = require('fs'), path = require('path'); const root = path.join(__dirname, '..', 'academy') + '/';
const seen = new Set(), q = ['game.js']; while (q.length) { const f = q.shift(); if (seen.has(f)) continue; seen.add(f); const src = fs.readFileSync(path.join(root, f), 'utf8'); for (const m of src.matchAll(/^\s*import\s[^'"]*['"](\.\.?\/[^'"]+)['"]/gm)) q.push(path.posix.normalize(path.posix.join(path.posix.dirname(f), m[1]))); }
const pre = new Set([...fs.readFileSync(root + 'index.html', 'utf8').matchAll(/rel="modulepreload" href="([^"]+)"/g)].map((m) => m[1]));
const miss = [...seen].filter((f) => !pre.has(f)), extra = [...pre].filter((f) => !seen.has(f));
console.log(seen.size + ' modules, ' + pre.size + ' preloads'); if (miss.length) console.log('ERRORS missing preload: ' + miss.join(' ')); if (extra.length) console.log('ERRORS preloaded but never imported: ' + extra.join(' '));
if (!miss.length && !extra.length) console.log('no errors'); process.exit(miss.length || extra.length ? 1 : 0);
