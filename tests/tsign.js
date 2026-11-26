// pixel-art signs (one look): every building sign in the game is drawn from the game's own 5x7 letters on a plate with
// the deep-ink outline, the same on the main thread and in the building worker (no font needed)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => { const errs = [], dir = path.join(__dirname, '..', 'academy');
  const texts = new Set(); for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) { const s = fs.readFileSync(path.join(dir, f), 'utf8'); for (const m of s.matchAll(/sign: '([^']+)'/g)) if (m[1] !== 'stop sign') texts.add(m[1]); }
  const b = await chromium.launch(); const a = await b.newPage(); a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/index.html?norun'); await a.setContent('<p>x</p>');
  const r = await a.evaluate(async (texts) => { const m = await import('http://localhost:8765/academy/pixelsign.js'), out = { missing: [], plates: 0 };
    for (const t of texts) { for (const ch of t) if (!m.GLYPHS[ch] && !m.GLYPHS[ch.toUpperCase()]) out.missing.push(t + ':' + ch);
      const c = m.pixelSign(t, false, t === 'POLICE'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, ink = (x, y) => { const k = (y * c.width + x) * 4; return d[k] < 20 && d[k + 1] < 24 && d[k + 2] < 40 && d[k + 3] === 255; };
      if (ink(0, 0) && ink(c.width - 1, c.height - 1) && ink(Math.floor(c.width / 2), 0)) out.plates++; }
    // and in a worker, where the old font-drawn signs fell back to a system font
    const wk = await new Promise((ok) => { const src = 'import { pixelSign } from "http://localhost:8765/academy/pixelsign.js"; const c = pixelSign("POLICE", false, true); postMessage(c.width + "x" + c.height);'; const w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })), { type: 'module' }); w.onmessage = (e) => ok(e.data); w.onerror = (e) => ok('error ' + e.message); setTimeout(() => ok('timeout'), 5000); });
    out.worker = wk; return out; }, [...texts]);
  console.log('signs', texts.size, 'outlined plates', r.plates, 'worker', r.worker, 'missing', r.missing.join(',') || 'none');
  if (r.missing.length) errs.push('letters without a glyph: ' + r.missing.join(',')); if (r.plates !== texts.size) errs.push('some plates lack the ink outline'); if (!/^\d+x13$/.test(r.worker)) errs.push('worker sign: ' + r.worker);
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
