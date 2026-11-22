// Builds tests/map.json: for each game module, the regression tests that exercise it.
// A test exercises a module when it reaches that module's object through window.__pc (pc.TG, __pc.FIN, ...), imports
// or names the module's file, or is listed for it in EXTRA below. `tests/run.sh changed` uses the map to pick tests.
// Run it again after adding a test: node tests/mkmap.js
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), A = path.join(ROOT, 'academy');
const game = fs.readFileSync(path.join(A, 'game.js'), 'utf8');
// install function -> file, from game.js's imports
const fnFile = {}; for (const m of game.matchAll(/import\s*\{([^}]*)\}\s*from\s*'\.\/([^']+)'/g)) m[1].split(',').map((s) => s.trim().split(/\s+as\s+/).pop()).forEach((n) => { if (n) fnFile[n] = m[2]; });
// host object name -> file (const TG = installTogether(...))
const objFile = {}; for (const m of game.matchAll(/\b([A-Z][A-Za-z0-9_]*)\s*=\s*(install[A-Za-z0-9]+)\(/g)) if (fnFile[m[2]]) objFile[m[1]] = fnFile[m[2]];
// a few things a test reaches without a host object, or by what it does
const EXTRA = {
  't91': ['decide.js', 'vodata.js'], 't93': ['decide.js', 'ch5data.js'], 'tvo': ['vodata.js', 'learn.js'], 'tsq': ['together.js', 'learn.js'],
  'tpart': ['partners.js', 'variety.js'], 'tmood': ['mood.js', 'music.js', 'score.js'], 'tdecor': ['rewards.js', 'interiors.js'], 'tbike': ['world.js'],
  'thands': ['handson.js'], 'treport': ['handson.js', 'polish.js'], 'techo': ['echoes.js'], 'tways': ['ways.js', 'sidequests.js'], 'tspecial': ['special.js'],
  'tarc': ['shiftarc.js'], 'tready': ['path.js', 'learn.js'], 'tunlock': ['vodata.js', 'learn.js']
};
const files = fs.readdirSync(__dirname).filter((f) => /^t[0-9a-z]+\.js$/.test(f) && f !== 'mkmap.js');
const map = {};
for (const f of files) {
  const t = f.replace(/\.js$/, ''), src = fs.readFileSync(path.join(__dirname, f), 'utf8'), hit = new Set(EXTRA[t] || []);
  for (const m of src.matchAll(/\.([A-Z][A-Za-z0-9_]*)\b/g)) if (objFile[m[1]]) hit.add(objFile[m[1]]);
  for (const m of src.matchAll(/academy\/([a-z0-9]+\.js)(?![a-z])/g)) hit.add(m[1]);
  for (const h of hit) (map[h] = map[h] || []).push(t);
}
for (const k of Object.keys(map)) map[k].sort();
const out = { note: 'Built by tests/mkmap.js. Module -> regression tests that exercise it. Core files (see run.sh) always add the quick set.', map: Object.fromEntries(Object.keys(map).sort().map((k) => [k, map[k]])) };
fs.writeFileSync(path.join(__dirname, 'map.json'), JSON.stringify(out, null, 1) + '\n');
console.log(Object.keys(map).length + ' modules mapped from ' + files.length + ' tests');
