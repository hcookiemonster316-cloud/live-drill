// the voice guide (STYLE.md), checked: every line the four main characters speak, across the game's source, keeps
// their voice. No exclamation marks or shouted capitals for Castillo, Walsh, Park or Lassiter; each has a longest
// sentence; Castillo uses no slang or pet names; Lassiter never curses or threatens out loud. Runs without a browser.
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'academy'), errs = [];
const MAX = { castillo: 28, lassiter: 24, walsh: 22, park: 18, whitfield: 12, duarte: 15, saito: 16, carrasco: 16, wells: 18, moreau: 24, vargas: 30, bramlett: 30 };
const LOUD = new Set(['vargas', 'bramlett']); // the district casts who may raise their voice
const ACR = new Set(['BOLO', 'DUI', 'ABS', 'ESC', 'TCS', 'FDLE', 'EMS', 'CPR', 'SWAT', 'HOI', 'BRT', 'SRO', 'GPS', 'ATM', 'VIN', 'CAD', 'SUV', 'DMV', 'EVOC', 'FTO', 'NCIC', 'FCIC', 'CCTV', 'DNA', 'EMT', 'ICU', 'MPH', 'SOCE', 'FHP', 'AED', 'ATF', 'FBI', 'DOA', 'III']);
const RX = /\[\s*'(castillo|walsh|park|lassiter|whitfield|duarte|saito|carrasco|wells|moreau|vargas|bramlett)'\s*,\s*'((?:[^'\\]|\\.)*)'\s*[\],]/g;
let n = 0; const per = {};
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8'); let m;
  while ((m = RX.exec(src))) { const who = m[1], t = m[2].replace(/\\'/g, '\''); if (!/\s/.test(t)) continue; n++; per[who] = (per[who] || 0) + 1; // a single word is a place or a key, not a line
    const where = f + ': ' + who + ': "' + t.slice(0, 70) + (t.length > 70 ? '...' : '') + '"';
    if (t.indexOf('!') >= 0 && !LOUD.has(who)) errs.push('exclamation mark: ' + where);
    const caps = (t.replace(/\b[A-Z]{2,4}[- ]?\d[0-9A-Z]*\b/g, '').match(/\b[A-Z]{3,}\b/g) || []) /* a plate (FLM 34K) isn't shouting */.filter((w) => !ACR.has(w)); if (caps.length && !LOUD.has(who)) errs.push('shouted capitals (' + caps.join(',') + '): ' + where);
    for (const s of t.replace(/^\([^)]*\)\s*/, '').split(/(?<=[.?])\s+/)) { const w = s.split(/\s+/).filter(Boolean).length; if (w > MAX[who]) errs.push('sentence of ' + w + ' words (max ' + MAX[who] + '): ' + where); }
    if (who === 'castillo' && /\b(gonna|wanna|gotta|dude|buddy|kiddo|sweetie|honey)\b/i.test(t)) errs.push('slang or a pet name: ' + where);
    if (who === 'lassiter' && /\b(damn|hell|shut up|kill you|you'?ll regret|or else)\b/i.test(t)) errs.push('Lassiter curses or threatens: ' + where);
  }
}
console.log('checked', n, 'lines', JSON.stringify(per)); if (n < 200) errs.push('found only ' + n + ' lines; the pattern may have broken');
console.log(errs.length ? 'ERRORS ' + errs.slice(0, 12).join(' / ') + (errs.length > 12 ? ' / and ' + (errs.length - 12) + ' more' : '') : 'no errors'); process.exit(errs.length ? 1 : 0);
