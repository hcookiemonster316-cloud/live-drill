// The Patrol City score: the recorded MP3 plays as the game's music. It is one track with a section per mood
// (11 seconds each, in this order), so when the situation changes the music crossfades to that mood's section
// and carries on from there. Until the file has loaded (or if it can't load), the built-in synth score plays instead.
const FILE = 'music/patrol-city-score.mp3';
const ORDER = ['title', 'day', 'night', 'inside', 'story', 'side', 'call', 'urgent', 'scene', 'water'], SEG = 11;
const NAMES = { title: 'Port Meridian', day: 'Day Watch', night: 'Night Watch', inside: 'Indoors', story: 'The Gray Sedan', side: 'Side Case', call: 'En Route', urgent: 'Priority One', scene: 'On Scene', water: 'Marine Patrol' };
const PRIORITY = { call: 1, urgent: 1, scene: 1, story: 1 }; // these cut in right away; calmer moods wait a little so the music doesn't jump around

export function createScore(getCtx, synth) {
  let on = false, cur = null, vol = .7, rainy = false, master = null, lp = null, decks = [], live = -1, ready = false, failed = false, lastJump = 0, pending = null;
  const ctx = () => getCtx();
  function graph() {
    const a = ctx(); if (!a || master) return !!master;
    master = a.createGain(); master.gain.value = vol; lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = rainy ? 5200 : 16000; lp.connect(master); master.connect(a.destination);
    decks = [0, 1].map(() => { const el = new Audio(); el.src = FILE; el.loop = true; el.preload = 'auto'; el.crossOrigin = 'anonymous'; el.setAttribute('playsinline', ''); const g = a.createGain(); g.gain.value = 0; let src = null; try { src = a.createMediaElementSource(el); src.connect(g); } catch (e) {} g.connect(lp); return { el, g, src }; });
    const d0 = decks[0].el, ok = () => { if (ready) return; ready = true; if (on && cur) { synth.stop(); jump(cur, true); } };
    d0.addEventListener('canplaythrough', ok, { once: true }); d0.addEventListener('loadeddata', ok, { once: true });
    d0.addEventListener('error', () => { failed = true; if (on && cur) synth.start(cur); }, { once: true });
    d0.load(); decks[1].el.load(); return true;
  }
  function jump(mood, now) {
    const a = ctx(); if (!a || !ready) return; const k = ORDER.indexOf(mood), at = (k < 0 ? 0 : k) * SEG, t = a.currentTime, nxt = live < 0 ? 0 : 1 - live, D = decks[nxt], O = live < 0 ? null : decks[live];
    try { D.el.currentTime = at; } catch (e) {} const p = D.el.play(); if (p && p.catch) p.catch(() => {});
    D.g.gain.cancelScheduledValues(t); D.g.gain.setValueAtTime(D.g.gain.value, t); D.g.gain.linearRampToValueAtTime(1, t + (now ? .6 : 1.8));
    if (O) { O.g.gain.cancelScheduledValues(t); O.g.gain.setValueAtTime(O.g.gain.value, t); O.g.gain.linearRampToValueAtTime(0, t + 1.8); const old = O.el; setTimeout(() => { if (decks[live] && decks[live].el !== old) old.pause(); }, 2000); }
    live = nxt; lastJump = performance.now();
  }
  const api = {
    get mood() { return cur; }, get title() { return cur ? NAMES[cur] || '' : ''; }, get usingFile() { return ready && !failed; },
    start(mood) {
      const a = ctx(); if (!a) return; if (a.state === 'suspended' && a.resume) { try { const r = a.resume(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
      graph(); if (!on) { on = true; cur = null; }
      if (master) master.gain.setTargetAtTime(vol, a.currentTime, .1);
      if (!ready || failed) { synth.volume(vol / .85); synth.start(mood || 'title'); }
      if (live >= 0 && decks[live].el.paused && ready) { const p = decks[live].el.play(); if (p && p.catch) p.catch(() => {}); }
      api.set(mood || cur || 'title');
    },
    set(mood) {
      if (!on || mood === cur) return; cur = mood;
      if (!ready || failed) { synth.set ? synth.set(mood) : synth.start(mood); return; }
      clearTimeout(pending); const wait = PRIORITY[mood] || live < 0 ? 0 : Math.max(0, 6000 - (performance.now() - lastJump));
      if (!wait) jump(mood); else pending = setTimeout(() => { if (on && cur === mood) jump(mood); }, wait);
    },
    pump() {},
    rain(v) { rainy = !!v; synth.rain(v); if (lp) { const a = ctx(); lp.frequency.setTargetAtTime(rainy ? 5200 : 16000, a.currentTime, .8); } },
    volume(v) { vol = Math.max(0, Math.min(1, v)) * .85 + .0001; synth.volume(v); if (master) { const a = ctx(); master.gain.setTargetAtTime(vol, a.currentTime, .1); } },
    sting(kind) { synth.sting && synth.sting(kind); if (!on || !ready || failed || !master) return; // a short bell figure over the recording
      const a = ctx(), t = a.currentTime + .05, seq = { accept: [67, 71, 74, 79], done: [60, 64, 67, 72], promo: [55, 60, 64, 67, 72], fail: [64, 60] }[kind] || [72];
      seq.forEach((n, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (n + 12 - 69) / 12); g.gain.setValueAtTime(.0001, t + i * .12); g.gain.exponentialRampToValueAtTime(.06, t + i * .12 + .01); g.gain.exponentialRampToValueAtTime(.0001, t + i * .12 + .7); o.connect(g); g.connect(master); o.start(t + i * .12); o.stop(t + i * .12 + .8); });
    },
    stop() { on = false; cur = null; clearTimeout(pending); synth.stop(); const a = ctx(); if (a && master) { decks.forEach((d) => { d.g.gain.cancelScheduledValues(a.currentTime); d.g.gain.setValueAtTime(d.g.gain.value, a.currentTime); d.g.gain.linearRampToValueAtTime(0, a.currentTime + 1.2); }); setTimeout(() => { if (!on) decks.forEach((d) => d.el.pause()); }, 1300); } live = -1; }
  };
  return api;
}
