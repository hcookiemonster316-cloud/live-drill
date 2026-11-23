// Renders the composed soundtrack (academy/scoredata.js) offline with the game's own synth engine and encodes MP3s with ffmpeg.
// Needs the local server on :8765. Usage: node tools/render-score.js [trackId ...]
// render composed tracks offline to WAV, then mp3 via ffmpeg. usage: node render.js [id ...]
const { chromium } = require('playwright'); const fs = require('fs'); const { execFileSync } = require('child_process');
const OUT = require('os').tmpdir() + '/', DEST = require('path').join(__dirname, '../academy/music/');
(async () => {
  const b = await chromium.launch(); const a = await b.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message)); a.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await a.goto('http://localhost:8765/academy/index.html?norun'); await a.setContent('<html><body>render</body></html>');
  await a.addScriptTag({ type: 'module', content: "import { createMusic, MOODS } from 'http://localhost:8765/academy/music.js'; import { TRACKS, META, trackLen } from 'http://localhost:8765/academy/scoredata.js'; window.R = { createMusic, MOODS, TRACKS, META, trackLen };" });
  await a.waitForFunction(() => window.R);
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : await a.evaluate(() => Object.keys(window.R.TRACKS));
  for (const id of ids) {
    const t0 = Date.now();
    const b64 = await a.evaluate(async (id) => {
      const { createMusic, META, trackLen } = window.R, m = META[id], sr = 32000, dur = trackLen(m) + 3.2, oc = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
      const mu = createMusic(() => oc); mu.start(m.base || id); mu.pump(trackLen(m) + .08); const buf = await oc.startRendering(); mu.stop && 0;
      const L = buf.getChannelData(0), Rr = buf.getChannelData(1), n = L.length, out = new Int16Array(n * 2);
      for (let i = 0; i < n; i++) { out[i * 2] = Math.max(-1, Math.min(1, L[i])) * 32767; out[i * 2 + 1] = Math.max(-1, Math.min(1, Rr[i])) * 32767; }
      const u8 = new Uint8Array(out.buffer); let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s);
    }, id);
    const raw = OUT + id + '.raw'; fs.writeFileSync(raw, Buffer.from(b64, 'base64'));
    // the main titles keep their full dynamics (a quiet opening that grows to a big finish): one fixed gain to the target
    // loudness instead of loudnorm's moving gain, which would flatten the arc; everything else is leveled as before
    let af = 'loudnorm=I=-25:TP=-1.5:LRA=11,afade=t=in:d=0.4';
    if (true) { /* every track keeps its dynamics now (owner's call): one fixed gain per track to the same loudness */ const meas = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-f', 's16le', '-ar', '32000', '-ac', '2', '-i', raw, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr; const I = +((meas.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop() || 'I: -24 LUFS').match(/-?[\d.]+/)[0]; af = 'volume=' + ((/^title_/.test(id) ? -23 : -24) - I).toFixed(2) + 'dB,alimiter=limit=0.84,afade=t=in:d=0.2'; }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', '32000', '-ac', '2', '-i', raw, '-af', af, '-ar', '32000', '-c:a', 'libmp3lame', '-b:a', '80k', DEST + id + '.mp3']);
    fs.unlinkSync(raw); console.log(id, ((Date.now() - t0) / 1000).toFixed(1) + 's', (fs.statSync(DEST + id + '.mp3').size / 1024).toFixed(0) + 'KB');
  }
  console.log(errs.length ? errs.slice(0, 5) : 'no errors'); await b.close();
})();
