// The Patrol City score: every track was composed for this game and rendered from its own synth engine (music.js)
// to small MP3s. Each mood rotates through its tracks with crossfades. Until the first file has loaded (or if files
// can't load), the same synth plays the score live instead.
import { META, ROTATION, POOLS, CONTEXT, TRACKS, trackLen, CHAR_MOTIFS } from './scoredata.js';
import { parseTheme } from './music.js';
const SCL = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10], dor: [0, 2, 3, 5, 7, 9, 10], mix: [0, 2, 4, 5, 7, 9, 10] };
const MV = '?v=10'; // bump when the soundtrack is re-rendered, so returning players hear the new files right away
const FILE = 'music/title_1.mp3' + MV; // loaded first; once it can play, the file score takes over from the live synth
const NAMES = {}; for (const k in META) if (META[k].base) NAMES[META[k].base] = META[k].name;
const PRIORITY = { call: 1, urgent: 1, scene: 1, story: 1 }; // these cut in right away; calmer moods wait a little so the music doesn't jump around

export function createScore(getCtx, synth) {
  let inten = 1; function tone() { if (!lp) return; const a = ctx(), f = Math.min(rainy ? 5200 : 16000, 2400 * Math.pow(16000 / 2400, inten)); lp.frequency.setTargetAtTime(f, a.currentTime, .8); }
  let tens = 0, stem = null; let on = false, cur = null, vol = .7, rainy = false, master = null, lp = null, decks = [], live = -1, ready = false, failed = false, lastJump = 0, pending = null, playing = null, watch = 0;
  const ctx = () => getCtx(), idx = {}, bad = {};
  // the rotation: each mood draws from a shuffled bag of its own tracks plus related ones (POOLS), so every track plays
  // before any repeats, never the same one twice in a row, and nothing heard in the last few tracks comes straight back.
  // The mood's own main arrangement opens the bag the first time, so each situation still announces itself.
  // Leave a mood and come back within three minutes, and its track picks up where it left off instead of starting over.
  const bags = {}, opened = {}, plan = {}, hist = [], resume = {}, lastOf = {};
  // where you are, your unit and your shift add their own arrangements: the district's and the shift's on patrol, the unit's
  // on patrol, calls and side cases; each is in the bag twice, and arriving somewhere new plays its theme next
  let here = { d: null, u: null, s: null, n: null };
  const extra = (mood) => { const o = [], add = (id) => { if (id && TRACKS[id]) o.push(id, id); };
    if (mood === 'day' || mood === 'night') { add(CONTEXT.district(here.d)); add(CONTEXT.shift(here.s)); add(CONTEXT.unit(here.u)); add(CONTEXT.season(here.n)); } // the season's arrangement too
    else if (mood === 'call' || mood === 'side') add(CONTEXT.unit(here.u)); else if (mood === 'water' && here.u === 'marine') add(CONTEXT.unit('marine')); return o; };
  const pool = (mood) => (POOLS[mood] || POOLS.day).concat(extra(mood)).filter((id) => !bad[id]);
  function draw(mood) { const P = pool(mood); if (!P.length) return null; let b = bags[mood];
    if (!b || !b.length) { b = P.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } if (!opened[mood]) { opened[mood] = 1; const own = (ROTATION[mood] || [])[0]; if (own && b.indexOf(own) > 0) { b.splice(b.indexOf(own), 1); b.unshift(own); } } bags[mood] = b; }
    const recent = hist.slice(-Math.min(3, P.length - 1)); let k = b.findIndex((id) => recent.indexOf(id) < 0); if (k < 0) k = 0; return b.splice(k, 1)[0]; }
  function entry(mood) { if (!pool(mood).length) { failed = true; if (on && cur) synth.start(cur); return null; }
    const lid = lastOf[mood], r = lid && resume[lid]; if (r && performance.now() - r.at < 180000 && !bad[lid] && !(playing && playing.id === lid)) { delete resume[lid]; return { id: lid, src: 'music/' + lid + '.mp3' + MV, start: 0, seek: r.pos, len: trackLen(META[lid]) + 1.2, mood, name: META[lid].name, resumed: true }; }
    const id = plan[mood] && !bad[plan[mood]] && plan[mood] !== (playing && playing.id) ? plan[mood] : draw(mood); plan[mood] = null; if (!id) return null;
    hist.push(id); if (hist.length > 8) hist.shift(); lastOf[mood] = id; idx[mood] = (idx[mood] || 0) + 1;
    return { id, src: 'music/' + id + '.mp3' + MV, start: 0, len: trackLen(META[id]) + 1.2, mood, name: META[id].name }; }
  function graph() {
    const a = ctx(); if (!a || master) return !!master;
    master = a.createGain(); master.gain.value = vol; lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = rainy ? 5200 : 16000; lp.connect(master); master.connect(a.destination);
    decks = [0, 1].map((i) => { const el = new Audio(); el.preload = i ? 'none' : 'auto'; el.crossOrigin = 'anonymous'; el.setAttribute('playsinline', ''); if (!i) el.src = FILE; const g = a.createGain(); g.gain.value = 0; let src = null; try { src = a.createMediaElementSource(el); src.connect(g); } catch (e) {} g.connect(lp); return { el, g, src }; });
    const d0 = decks[0].el, ok = () => { if (ready) return; ready = true; if (on && cur) { synth.stop(); jump(cur, true); } };
    d0.addEventListener('canplaythrough', ok, { once: true }); d0.addEventListener('loadeddata', ok, { once: true });
    d0.addEventListener('error', () => { failed = true; if (on && cur) synth.start(cur); }, { once: true });
    d0.load(); watch = setInterval(tick, 400); return true;
  }
  // warm the cache with the next track of this mood so the change is instant
  const warmed = {}; function warm(mood) { if (!plan[mood]) plan[mood] = draw(mood); const id = plan[mood]; if (!id || warmed[id]) return; warmed[id] = 1; const c = navigator.connection; if (c && c.saveData) return; try { fetch('music/' + id + '.mp3' + MV).catch(() => {}); } catch (e) {} }
  function jump(mood, now, e) {
    const a = ctx(); if (!a || !ready) return; e = e || entry(mood); if (!e) return; const t = a.currentTime, nxt = live < 0 ? 0 : 1 - live, D = decks[nxt], O = live < 0 ? null : decks[live];
    const src = new URL(e.src, location.href).href, go = () => { try { D.el.currentTime = e.start + (e.seek || 0); } catch (x) {} const p = D.el.play(); if (p && p.catch) p.catch(() => {}); };
    if (D.el.src !== src) { D.el.src = src; D.el.preload = 'auto'; D.el.addEventListener('error', () => { bad[e.id] = 1; if (on && cur === mood) jump(mood, true); }, { once: true }); D.el.addEventListener('loadedmetadata', go, { once: true }); D.el.load(); } else go();
    D.g.gain.cancelScheduledValues(t); D.g.gain.setValueAtTime(D.g.gain.value, t); D.g.gain.linearRampToValueAtTime(1, t + (now ? .6 : 2.2));
    if (O && playing && !O.el.ended) { const pos = O.el.currentTime - playing.start; if (pos > 8 && pos < playing.len - 25) resume[playing.id] = { pos, at: performance.now() }; } // remember where we left off
    if (O) { O.g.gain.cancelScheduledValues(t); O.g.gain.setValueAtTime(O.g.gain.value, t); O.g.gain.linearRampToValueAtTime(0, t + 2.2); const old = O.el; setTimeout(() => { if (decks[live] && decks[live].el !== old) old.pause(); }, 2600); }
    live = nxt; lastJump = performance.now(); playing = e; warm(mood);
    if (e.name && api.onTrack) try { api.onTrack(e.name, e.id); } catch (x) {}
  }
  // keep the rotation moving: when a track (or three rounds of a recorded section) is nearly over, cross-fade to the next
  function tick() { if (!on || !ready || failed || live < 0 || !playing) return; const el = decks[live].el; if (el.paused || el.readyState < 2) return; const pos = el.currentTime - playing.start;
    if (pos >= playing.len - 2.3 || el.ended) jump(cur || playing.mood); }
  const api = {
    get mood() { return cur; }, get title() { return playing && playing.name ? playing.name : cur ? NAMES[cur] || '' : ''; }, get usingFile() { return ready && !failed; },
    start(mood) {
      const a = ctx(); if (!a) return; if (a.state === 'suspended' && a.resume) { try { const r = a.resume(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
      graph(); if (!on) { on = true; cur = null; }
      if (master) master.gain.setTargetAtTime(vol, a.currentTime, .1);
      if (!ready || failed) { synth.volume(vol / .85); synth.start(mood || 'title'); }
      if (live >= 0 && decks[live].el.paused && ready) { const p = decks[live].el.play(); if (p && p.catch) p.catch(() => {}); }
      api.set(mood || cur || 'title');
    },
    context(c) { const nd = c.d != null && c.d !== here.d, nu = c.u !== here.u, ns = c.s !== here.s, nn = c.n !== here.n; if (!nd && !nu && !ns && !nn) return; here = { d: c.d, u: c.u, s: c.s, n: c.n };
      for (const k in bags) delete bags[k]; // rebuild the bags with the new arrangements in them
      const lead = nd ? CONTEXT.district(c.d) : nu ? CONTEXT.unit(c.u) : CONTEXT.shift(c.s); if (lead && TRACKS[lead]) { plan.day = plan.night = lead; } if (nd && on && ready && !failed && (cur === 'day' || cur === 'night') && performance.now() - lastJump > 15000) jump(cur); }, // a new district's theme fades in on arrival
    // a story moment asks for one arrangement next (a season's beat plays the season's own)
    feature(mood, id) { if (!TRACKS[id] || bad[id]) return; plan[mood] = id; if (on && ready && !failed && cur === mood) jump(mood); },
    set(mood) {
      if (!on || mood === cur) return; cur = mood;
      if (!ready || failed) { synth.set ? synth.set(mood) : synth.start(mood); return; }
      clearTimeout(pending); const wait = PRIORITY[mood] || live < 0 ? 0 : Math.max(0, 6000 - (performance.now() - lastJump));
      if (!wait) jump(mood); else pending = setTimeout(() => { if (on && cur === mood) jump(mood); }, wait);
    },
    pump() {},
    __pick(mood) { const e = entry(mood); if (e) playing = e; return e && e.id; }, // test hook: the next pick without playing it
    get __rot() { return { plan: Object.assign({}, plan), hist: hist.slice(), here, bags: JSON.parse(JSON.stringify(bags)), playing: playing && playing.id }; }, // test hook
    __seekEnd() { if (live < 0 || !playing) return; try { decks[live].el.currentTime = playing.start + playing.len - 3; } catch (e) {} }, // test hook
    rain(v) { rainy = !!v; synth.rain(v); tone(); },
    // how present the score is: on foot it plays softer and duller, as if from a distance; in the car and on a call it
    // opens up to full brightness. The same recording, altered live by what you're doing.
    intensity(k) { if (Math.abs(k - inten) < .01) return; inten = k; tone(); if (master) { const a = ctx(); master.gain.setTargetAtTime(vol * (.72 + .28 * inten), a.currentTime, .6); } },
    volume(v) { vol = Math.max(0, Math.min(1, v)) * .85 + .0001; synth.volume(v); if (stem) api.tension(tens); if (master) { const a = ctx(); master.gain.setTargetAtTime(vol * (.72 + .28 * inten), a.currentTime, .1); } },
    // the tension layer: a low string pedal on the playing track's key that fades in as a call gets serious (a little on
    // an accepted call, more on scene, all of it in a priority call or a pursuit); it follows the key when the track changes
    tension(k) { tens = k; const a = ctx(); if (!a) return; const id = playing && playing.id, tr = id && TRACKS[id], want = on && vol > 0 ? Math.max(0, (k - .7) / .3) : 0;
      if (!stem) { if (!want) return; const g = a.createGain(), lp2 = a.createBiquadFilter(); g.gain.value = 0; lp2.type = 'lowpass'; lp2.Q.value = .7; lp2.connect(g); g.connect(a.destination);
        const o = [-6, 6, 0].map((det, i) => { const x = a.createOscillator(); x.type = i < 2 ? 'sawtooth' : 'triangle'; x.detune.value = det; x.connect(lp2); x.start(); return x; }); stem = { g, lp: lp2, o }; }
      const f = 440 * Math.pow(2, ((tr ? tr.root : 62) - 24 - 69) / 12), t = a.currentTime; stem.o[0].frequency.setTargetAtTime(f, t, .4); stem.o[1].frequency.setTargetAtTime(f * 1.5, t, .4); stem.o[2].frequency.setTargetAtTime(f * 2, t, .4);
      stem.lp.frequency.setTargetAtTime(240 + 1000 * want, t, 1.5); stem.g.gain.setTargetAtTime(.03 * want * vol, t, want ? 1.4 : .8); },
    get layer() { return stem ? stem.g.gain.value : 0; },
    // a character's phrase over the score: built here from oscillators, each character with its own instrument
    motif(key) { const m = CHAR_MOTIFS[key]; if (!on || !m) return false; const a = ctx(); if (!a || a.state !== 'running') return false; const beat = 60 / m.bpm, t0 = a.currentTime + .08, out = a.createGain(); out.gain.value = .9 * vol; out.connect(a.destination);
      parseTheme(m.theme).forEach((n) => { const st = SCL[m.scale], d = n.d, midi = m.root + Math.floor(d / 7) * 12 + st[((d % 7) + 7) % 7] + n.acc, f = 440 * Math.pow(2, (midi - 69) / 12), t = t0 + n.b * beat, len = Math.max(.12, n.l * beat);
        const g = a.createGain(), lp = a.createBiquadFilter(); lp.type = 'lowpass'; g.connect(out); lp.connect(g); const osc = (type, hz, det) => { const o = a.createOscillator(); o.type = type; o.frequency.value = hz; if (det) o.detune.value = det; o.connect(lp); o.start(t); o.stop(t + len + .6); return o; };
        if (m.voice === 'mute') { lp.frequency.value = 1500; lp.Q.value = 3; osc('square', f); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + len * .9 + .05); }
        else if (m.voice === 'sax') { lp.frequency.value = 1700; const o = osc('sawtooth', f), v = a.createOscillator(), vg = a.createGain(); v.frequency.value = 5.2; vg.gain.value = 6; v.connect(vg); vg.connect(o.detune); v.start(t); v.stop(t + len + .6); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.032, t + .06); g.gain.setValueAtTime(.032, t + len * .8); g.gain.exponentialRampToValueAtTime(.0001, t + len + .3); }
        else if (m.voice === 'vibes') { lp.frequency.value = 6000; osc('sine', f); osc('sine', f * 4, 3); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.06, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + Math.max(.5, len) + .5); }
        else { lp.frequency.value = 1100; osc('sawtooth', f, -7); osc('sawtooth', f, 7); osc('sine', f / 2); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.028, t + .18); g.gain.setValueAtTime(.028, t + len * .85); g.gain.exponentialRampToValueAtTime(.0001, t + len + .5); } });
      setTimeout(() => { try { out.disconnect(); } catch (e) {} }, 8000); return true; },
    sting(kind) { synth.sting && synth.sting(kind); if (!on || !ready || failed || !master) return; // a short bell figure over the recording
      const a = ctx(), t = a.currentTime + .05, seq = { accept: [69, 74, 72], done: [69, 74, 72, 69, 64, 65, 62], promo: [69, 74, 72, 69, 76, 74, 77], fail: [64, 62], grade: [69, 74, 72, 69, 76] }[kind] || [69]; // the Port Meridian hook
      seq.forEach((n, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (n + 12 - 69) / 12); g.gain.setValueAtTime(.0001, t + i * .12); g.gain.exponentialRampToValueAtTime(.06, t + i * .12 + .01); g.gain.exponentialRampToValueAtTime(.0001, t + i * .12 + .7); o.connect(g); g.connect(master); o.start(t + i * .12); o.stop(t + i * .12 + .8); });
    },
    stop() { on = false; cur = null; clearTimeout(pending); synth.stop(); if (stem) { const a0 = ctx(); stem.g.gain.setTargetAtTime(0, a0.currentTime, .4); } const a = ctx(); if (a && master) { decks.forEach((d) => { d.g.gain.cancelScheduledValues(a.currentTime); d.g.gain.setValueAtTime(d.g.gain.value, a.currentTime); d.g.gain.linearRampToValueAtTime(0, a.currentTime + 1.2); }); setTimeout(() => { if (!on) decks.forEach((d) => d.el.pause()); }, 1300); } live = -1; }
  };
  return api;
}
