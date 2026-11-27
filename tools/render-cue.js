// Renders a timed cue (academy/briefscore.js) offline with the game's own instruments (music.js) and encodes an MP3
// with ffmpeg, at one fixed gain to a cinematic loudness (the cue keeps its whole dynamic arc).
// Needs the local server on :8765. Usage: node tools/render-cue.js
const { chromium } = require('playwright'); const fs = require('fs'); const { execFileSync, spawnSync } = require('child_process');
const OUT = require('os').tmpdir() + '/brief_cue.raw', DEST = require('path').join(__dirname, '../academy/music/brief_cue.mp3');
(async () => {
  const b = await chromium.launch(); const a = await b.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/index.html?norun'); await a.setContent('<html><body>render</body></html>');
  await a.addScriptTag({ type: 'module', content: "import { createMusic } from 'http://localhost:8765/academy/music.js'; import { briefScore, CUE_LEN } from 'http://localhost:8765/academy/briefscore.js'; window.R = { createMusic, briefScore, CUE_LEN };" });
  await a.waitForFunction(() => window.R);
  const b64 = await a.evaluate(async () => { const { createMusic, briefScore, CUE_LEN } = window.R, sr = 32000, oc = new OfflineAudioContext(2, Math.ceil(sr * CUE_LEN), sr);
    const mu = createMusic(() => oc); mu.cue(briefScore(), .02); const buf = await oc.startRendering();
    const L = buf.getChannelData(0), Rr = buf.getChannelData(1), n = L.length, out = new Int16Array(n * 2);
    for (let i = 0; i < n; i++) { out[i * 2] = Math.max(-1, Math.min(1, L[i])) * 32767; out[i * 2 + 1] = Math.max(-1, Math.min(1, Rr[i])) * 32767; }
    const u8 = new Uint8Array(out.buffer); let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); });
  fs.writeFileSync(OUT, Buffer.from(b64, 'base64'));
  const meas = spawnSync('ffmpeg', ['-hide_banner', '-f', 's16le', '-ar', '32000', '-ac', '2', '-i', OUT, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const I = +((meas.match(/I:\s+(-?[\d.]+) LUFS\s*\n\s*Threshold/g) || []).pop() || '').replace(/[^-\d.]/g, '').slice(0, 6) || -30, TARGET = -17, gain = Math.min(14, TARGET - I);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', '32000', '-ac', '2', '-i', OUT, '-af', 'volume=' + gain.toFixed(2) + 'dB,alimiter=limit=0.95,afade=t=out:st=' + (55 - 2.5) + ':d=2.5', '-ar', '32000', '-c:a', 'libmp3lame', '-b:a', '112k', DEST]);
  fs.unlinkSync(OUT); console.log('brief_cue', 'measured ' + I + ' LUFS, gain ' + gain.toFixed(1) + ' dB', (fs.statSync(DEST).size / 1024).toFixed(0) + 'KB');
  console.log(errs.length ? errs.slice(0, 5) : 'no errors'); await b.close();
})();
