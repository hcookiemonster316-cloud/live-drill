// The story scenes (owner's call, 2026-11-27): the main story gets illustrated scenes like the opening briefing. Each
// chapter opens on its district at night and its title (about half a minute), each part of a chapter opens on the
// place and the person you came to see (about fifteen seconds), and each chapter closes on the faces you met and how
// they feel about you now. Tiered by weight, played once each, skippable at any moment (Skip, Escape or Enter).
//
// Made from scratch: every place is painted here in code, once, with the art guide's one light (a desk lamp, a neon
// sign, a floodlight) and the people are the game's own sprites. Only the light, the camera and the words move, so a
// frame is one cached picture and a few sprites, and the city behind it is not drawn at all while a scene is up.
//
// Loop: the story (take the case, meet the people, the city remembers). Reads the chapters and the people you met
// (their standing with you is shown at the close); feeds the mood library (music) and the cutscene log, which the
// Field Journal uses to play a scene again.
import { sprite, fromLook } from './pixelfolk.js';

const W = 480, H = 270, NUM = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];
const OPEN_MOOD = ['dawn', 'mystery', 'eerie', 'tension', 'resolve'], PART_MOOD = ['dawn', 'mystery', 'mystery', 'tension', 'resolve'], END_MOOD = ['hope', 'hope', 'aftermath', 'hope', 'triumph'];

export function installStoryCine(X) {
  const S = X.S;
  const C = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
  const seeded = (s) => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 10000) / 10000; };
  const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const glow = (g, x, y, r, col, a) => { const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };

  // ---------- the places: painted once each ----------
  // kind of place from the step's location; every kind has one light (x, y, radius, colour) and two marks on the floor
  const KIND = [[/Dispatch/, 'dispatch'], [/Records|Clerk/, 'records'], [/HQ|Substation/, 'office'], [/Auto|Garage/, 'garage'], [/Motel/, 'motel'], [/Bodega|Pawn|Shop|Jewel/, 'shop'], [/School/, 'school'],
    [/Marina|Dock|River/, 'marina'], [/Storage|Rail|Yard/, 'yard'], [/Courthouse|Court/, 'court'], [/Jail/, 'jail'], [/Plaza|Justice/, 'plaza']];
  const kindOf = (at) => (KIND.find(([re]) => re.test(at || '')) || [0, 'plaza'])[1];
  const SETS = new Map();
  function set(kind, at, tint) {
    const key = kind + '|' + at; if (SETS.has(key)) return SETS.get(key);
    const [c, g] = C(W, H), r = seeded(at), L = { x: 240, y: 60, r: 220, col: '255,226,170', a: .3 }, fl = 214;
    const sky = (top, bot) => { const gr = g.createLinearGradient(0, 0, 0, fl); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, fl); };
    const sign = (txt, x, y, col, sz) => { g.font = '800 ' + (sz || 10) + 'px "Meridian",sans-serif'; g.fillStyle = col; g.fillText(txt, x, y); };
    const wall = (top) => { R(g, top || '#18223a', 0, 0, W, fl); R(g, '#0f1626', 0, fl, W, H - fl); R(g, '#0b111d', 0, fl, W, 2); for (let x = 0; x < W; x += 48) R(g, '#141d30', x, fl + 2, 1, H - fl); };
    if (kind === 'office' || kind === 'records' || kind === 'dispatch') {
      wall(kind === 'dispatch' ? '#0f1626' : '#18223a');
      if (kind === 'office') { // a desk lamp, blinds, the board
        for (let y = 40; y < 118; y += 6) R(g, '#22304d', 330, y, 104, 3); R(g, '#2c3b5c', 326, 36, 112, 4); // blinds
        R(g, '#2a3350', 40, 44, 120, 74); for (let i = 0; i < 9; i++) R(g, ['#e8edf5', '#f5b800', '#c9d3e3', '#93c5fd'][i % 4], 50 + (i % 5) * 21, 52 + Math.floor(i / 5) * 30, 14, 18); // the case board
        R(g, '#3a2a1e', 190, 168, 140, 10); R(g, '#2a1e15', 196, 178, 8, 36); R(g, '#2a1e15', 316, 178, 8, 36); // desk
        R(g, '#1f2937', 214, 150, 30, 18); R(g, '#7dd3fc', 217, 153, 24, 11); // monitor
        R(g, '#facc15', 292, 146, 14, 6); R(g, '#475569', 298, 152, 2, 16); L.x = 299; L.y = 150; L.r = 200; L.col = '255,214,140'; L.a = .42;
        sign('PMPD', 60, 140, '#f5b800', 9);
      }
      if (kind === 'records') { for (let s = 0; s < 3; s++) { R(g, '#2a2f45', 20 + s * 150, 30, 130, 170); for (let y = 40; y < 196; y += 26) { R(g, '#0f1626', 24 + s * 150, y + 20, 122, 4); for (let b = 0; b < 7; b++) R(g, r() < .5 ? '#a8865c' : '#c9a46e', 28 + s * 150 + b * 17, y + 4, 14, 16); } }
        R(g, '#374151', 238, 0, 4, 34); R(g, '#fde68a', 232, 34, 16, 8); L.x = 240; L.y = 40; L.r = 230; L.col = '255,236,180'; L.a = .38; }
      if (kind === 'dispatch') { for (let i = 0; i < 6; i++) { const x = 26 + i * 76; R(g, '#0b1220', x, 52, 64, 40); R(g, i % 2 ? '#065f46' : '#1e3a8a', x + 3, 55, 58, 34); for (let k = 0; k < 4; k++) R(g, i % 2 ? '#34d399' : '#93c5fd', x + 7, 60 + k * 7, 20 + ((i * 7 + k * 13) % 30), 2); }
        R(g, '#1f2937', 0, 150, W, 24); for (let i = 0; i < 4; i++) R(g, '#111827', 40 + i * 110, 120, 70, 30); L.x = 240; L.y = 72; L.r = 260; L.col = '125,211,252'; L.a = .3; sign('DISPATCH', 196, 30, '#93c5fd', 11); }
    } else if (kind === 'garage') { wall('#1c1f26');
      R(g, '#0a0f1a', 30, 40, 200, 150); for (let y = 40; y < 104; y += 8) R(g, '#3f4655', 30, y, 200, 6); // the door, half up, night outside
      R(g, '#4b5563', 280, 60, 6, 154); R(g, '#4b5563', 420, 60, 6, 154); R(g, '#6b7280', 276, 130, 154, 6); // the lift
      R(g, '#7f1d1d', 296, 104, 118, 26); R(g, '#991b1b', 314, 92, 72, 14); R(g, '#111827', 304, 128, 18, 10); R(g, '#111827', 390, 128, 18, 10); // a car up on it
      R(g, '#374151', 249, 0, 2, 30); R(g, '#fef3c7', 240, 30, 20, 6); L.x = 250; L.y = 36; L.r = 230; L.col = '255,240,200'; L.a = .4; sign("EARL'S", 52, 30, '#f59e0b', 12);
    } else if (kind === 'motel') { sky('#070b18', '#121a2e');
      R(g, '#1f2533', 0, 70, W, 144); R(g, '#2a3142', 0, 132, W, 4); for (let i = 0; i < 8; i++) { R(g, '#3b2f2a', 20 + i * 58, 84, 24, 46); R(g, '#3b2f2a', 20 + i * 58, 150, 24, 60); sign(String(101 + i), 24 + i * 58, 146, '#9ca3af', 7); sign(String(201 + i), 24 + i * 58, 80, '#9ca3af', 7); }
      for (let x = 0; x < W; x += 8) R(g, '#4b5563', x, 120, 2, 12); R(g, '#4b5563', 0, 118, W, 2); // the railing
      R(g, '#1f2937', 380, 10, 80, 26); sign('VACANCY', 386, 29, '#f43f5e', 11); L.x = 420; L.y = 24; L.r = 260; L.col = '244,63,94'; L.a = .32; R(g, '#0b0f17', 0, fl, W, H - fl);
    } else if (kind === 'shop') { wall('#1d1a24');
      for (let s = 0; s < 3; s++) { R(g, '#2b2433', 20 + s * 64, 40, 56, 150); for (let y = 50; y < 186; y += 22) { R(g, '#1a1520', 20 + s * 64, y + 16, 56, 3); for (let b = 0; b < 5; b++) R(g, ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#eab308', '#a855f7'][Math.floor(r() * 6)], 24 + s * 64 + b * 10, y + 4, 8, 12); } }
      R(g, '#0a1020', 250, 36, 200, 100); R(g, '#3b2f2a', 236, 150, 230, 64); R(g, '#4a3a32', 232, 146, 238, 6); // window, counter
      sign(/Pawn/.test(at) ? 'PAWN' : 'OPEN', 318, 82, '#22d3ee', 18); L.x = 350; L.y = 76; L.r = 240; L.col = '34,211,238'; L.a = .3;
    } else if (kind === 'school') { wall('#1e2a3a');
      for (let i = 0; i < 14; i++) { R(g, i % 2 ? '#1d4ed8' : '#1e40af', 10 + i * 24, 60, 22, 120); R(g, '#93c5fd', 14 + i * 24, 70, 14, 2); R(g, '#93c5fd', 14 + i * 24, 74, 14, 2); }
      R(g, '#dbeafe', 370, 40, 90, 120); R(g, '#1e2a3a', 413, 40, 4, 120); L.x = 414; L.y = 100; L.r = 300; L.col = '219,234,254'; L.a = .34; sign('GO OWLS', 120, 40, '#facc15', 12);
    } else if (kind === 'marina') { sky('#050a16', '#0c1830');
      R(g, '#061024', 0, 150, W, H - 150); for (let i = 0; i < 40; i++) R(g, 'rgba(147,197,253,.18)', Math.floor(r() * W), 156 + Math.floor(r() * 100), 6 + Math.floor(r() * 18), 1);
      for (let i = 0; i < 3; i++) { const x = 40 + i * 140; g.fillStyle = '#0b1324'; g.beginPath(); g.moveTo(x, 150); g.lineTo(x + 90, 150); g.lineTo(x + 76, 166); g.lineTo(x + 10, 166); g.closePath(); g.fill(); R(g, '#0b1324', x + 40, 70, 3, 80); }
      R(g, '#3a2a1e', 120, 196, 360, 18); for (let x = 120; x < W; x += 14) R(g, '#2a1e15', x, 196, 1, 18); R(g, '#374151', 330, 90, 4, 106); R(g, '#fde68a', 324, 84, 16, 8);
      L.x = 332; L.y = 88; L.r = 220; L.col = '253,230,138'; L.a = .36;
    } else if (kind === 'yard') { sky('#060a14', '#111827');
      if (/Rail/.test(at)) for (let i = 0; i < 4; i++) { R(g, ['#7c2d12', '#1e3a8a', '#365314', '#57534e'][i], 10 + i * 120, 110, 110, 70); R(g, '#0b0f17', 10 + i * 120, 180, 110, 6); }
      else for (let i = 0; i < 6; i++) { R(g, '#374151', 14 + i * 78, 96, 70, 90); for (let y = 100; y < 184; y += 6) R(g, '#4b5563', 18 + i * 78, y, 62, 3); sign(String(10 + i), 40 + i * 78, 94, '#facc15', 8); }
      for (let x = 0; x < W; x += 10) R(g, 'rgba(156,163,175,.35)', x, 150, 1, 64); R(g, 'rgba(156,163,175,.5)', 0, 150, W, 1); // chain link
      R(g, '#374151', 60, 20, 4, 194); R(g, '#f8fafc', 52, 16, 22, 8); L.x = 62; L.y = 22; L.r = 300; L.col = '226,232,240'; L.a = .36; R(g, '#0b0f17', 0, fl, W, H - fl);
    } else if (kind === 'court' || kind === 'plaza') {
      sky(kind === 'court' ? '#1e1b4b' : '#070b18', kind === 'court' ? '#f59e0b' : '#1a2238');
      if (kind === 'court') { R(g, '#2a2f45', 90, 40, 300, 30); g.fillStyle = '#2a2f45'; g.beginPath(); g.moveTo(80, 40); g.lineTo(240, 6); g.lineTo(400, 40); g.closePath(); g.fill(); for (let i = 0; i < 7; i++) R(g, '#3b4260', 104 + i * 42, 70, 16, 110); for (let s = 0; s < 4; s++) R(g, '#2a2f45', 70 - s * 12, 180 + s * 9, 340 + s * 24, 9); L.x = 240; L.y = 200; L.r = 320; L.col = '253,186,116'; L.a = .3; sign('JUSTICE', 202, 60, '#cbd5e1', 11); }
      else { for (let i = 0; i < 16; i++) { const h = 40 + Math.floor(r() * 110), w = 20 + Math.floor(r() * 26), x = i * 32 - 10; R(g, '#0d1426', x, fl - h - 30, w, h + 30); for (let k = 0; k < 10; k++) if (r() < .4) R(g, '#fde68a', x + 3 + Math.floor(r() * (w - 6)), fl - h - 24 + Math.floor(r() * h), 2, 2); }
        R(g, '#1f2937', 200, 168, 80, 16); R(g, '#273449', 216, 150, 48, 18); R(g, '#93c5fd', 236, 130, 8, 20); R(g, '#374151', 120, 80, 4, 134); R(g, '#fde68a', 114, 74, 16, 8); L.x = 122; L.y = 78; L.r = 240; L.col = '253,230,138'; L.a = .38; }
      R(g, '#111827', 0, fl, W, H - fl);
    } else if (kind === 'jail') { wall('#1a1f2b');
      for (let i = 0; i < 3; i++) { R(g, '#0b0f17', 20 + i * 150, 50, 120, 150); for (let x = 24; x < 140; x += 10) R(g, '#6b7280', x + i * 150, 50, 3, 150); R(g, '#6b7280', 20 + i * 150, 50, 120, 4); R(g, '#6b7280', 20 + i * 150, 120, 120, 3); }
      R(g, '#e5e7eb', 200, 8, 80, 6); L.x = 240; L.y = 14; L.r = 300; L.col = '226,252,240'; L.a = .3;
    }
    if (tint) { g.globalCompositeOperation = 'soft-light'; g.fillStyle = tint; g.globalAlpha = .18; g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    // the one light, laid on once; its flicker is a second stamp of the same picture
    const [lc, lg] = C(W, H); glow(lg, L.x, L.y, L.r, L.col, L.a);
    g.fillStyle = 'rgba(2,4,10,.38)'; g.fillRect(0, 0, W, H); g.drawImage(lc, 0, 0); g.drawImage(lc, 0, 0);
    // the close-up background: the same place, pushed in, dimmed and softened
    const [bc, bg] = C(W, H); try { bg.filter = 'blur(3px)'; } catch (e) {} bg.drawImage(c, L.x * .4, L.y * .2, W * .6, H * .6, 0, 0, W, H); bg.filter = 'none'; bg.fillStyle = 'rgba(4,6,12,.55)'; bg.fillRect(0, 0, W, H); glow(bg, L.x > 240 ? W - 40 : 40, 30, 330, L.col, .22);
    const o = { c, bg: bc, light: lc, L, fl }; SETS.set(key, o); if (SETS.size > 24) SETS.delete(SETS.keys().next().value); return o;
  }
  // the district at night for a chapter's opening: a skyline in its colour, lit windows, one searchlight
  const SKY = new Map();
  function skyline(D, day) { const sk = D.id + (day ? 'd' : 'n'); if (SKY.has(sk)) return SKY.get(sk); const [c, g] = C(W + 120, H), r = seeded('sky' + D.id), col = D.color || '#f5b800';
    const gr = g.createLinearGradient(0, 0, 0, H); if (day) { gr.addColorStop(0, '#5b8fd6'); gr.addColorStop(.62, '#a9c6ea'); gr.addColorStop(1, '#e7d7b8'); } else { gr.addColorStop(0, '#03060d'); gr.addColorStop(.62, '#0b1222'); gr.addColorStop(1, '#141c30'); } g.fillStyle = gr; g.fillRect(0, 0, W + 120, H);
    g.globalAlpha = .22; glow(g, (W + 120) / 2, 236, 340, hexRgb(col), 1); g.globalAlpha = 1;
    if (!day) for (let i = 0; i < 60; i++) R(g, 'rgba(255,255,255,' + (.2 + r() * .5) + ')', Math.floor(r() * (W + 120)), Math.floor(r() * 110), 1, 1);
    const wins = []; for (let x = -10; x < W + 120;) { const w = 18 + Math.floor(r() * 34), h = 50 + Math.floor(r() * (D.theme === 'downtown' ? 150 : 90)); R(g, day ? '#3a4a66' : '#070c18', x, 236 - h, w, h + 40); if (r() < .3) R(g, day ? '#3a4a66' : '#070c18', x + w / 2 - 1, 236 - h - 14, 2, 14);
      for (let yy = 236 - h + 6; yy < 230; yy += 7) for (let xx = x + 3; xx < x + w - 4; xx += 6) if (r() < .32) { R(g, day ? (r() < .5 ? '#8fb3e0' : '#2c3a54') : r() < .85 ? '#fcd58a' : hexOf(col), xx, yy, 2, 3); wins.push([xx, yy]); } x += w + 2 + Math.floor(r() * 6); }
    R(g, day ? '#2a3448' : '#05080f', 0, 236, W + 120, 34); const o = { c, wins, day }; SKY.set(sk, o); return o; }
  const hexRgb = (h) => { const n = parseInt(String(h).slice(1), 16); return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); };
  const hexOf = (h) => h;

  // ---------- the people ----------
  const SPR = new Map();
  const body = (id, d) => { const k = id + '|' + d; if (SPR.has(k)) return SPR.get(k); let s = null; try { const lk = X.look(id); if (lk && !lk.cat) s = sprite(lk.folk || fromLook(lk), d, 0, false); } catch (e) {} SPR.set(k, s); if (SPR.size > 80) SPR.delete(SPR.keys().next().value); return s; };
  // a person standing on the set, lit from the set's light, with a contact shadow
  function stand(g, s, x, y, sc, L) { if (!s) return; g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(x, y + 1, 15 * sc / 1.6, 4 * sc / 1.6, 0, 0, 7); g.fill(); g.drawImage(s, x - 24 * sc, y - 61 * sc, 48 * sc, 64 * sc); }
  function closeUp(g, st, s, t, push, side) { g.drawImage(st.bg, 0, 0); if (!s) return; const sc = 6.6 + push * t, x = side < 0 ? 170 : 310; g.drawImage(s, x - 24 * sc, 46 - 9 * sc, 48 * sc, 64 * sc);
    const gr = g.createLinearGradient(0, H - 80, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = gr; g.fillRect(0, H - 80, W, 80); }
  function wide(g, st, t, z0, z1, cast, flick) { const z = z0 + (z1 - z0) * ease(Math.min(1, t)); g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2); g.drawImage(st.c, 0, 0);
    cast.forEach(([s, x, sc]) => stand(g, s, x, st.fl + 20, sc, st.L)); if (flick) { g.globalAlpha = flick; g.drawImage(st.light, 0, 0); g.globalAlpha = 1; } g.restore(); }
  const ease = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  // ---------- the player: the same machinery as the briefing ----------
  let live = null;
  const mode = () => (X.mockOff() ? 'off' : (S.cfg && S.cfg.cutscenes) || 'all');
  const fit = (line) => Math.max(4.6, Math.min(9.5, (line || '').length / 38 + 2.6)); // time to type the line and read it
  function run(key, mood, cut, done) {
    if (live || mode() === 'off') { done && done(false); return; }
    const el = document.createElement('div'); el.className = 'brief sc';
    el.innerHTML = '<div class="bfBars t"></div><canvas class="bfCv" width="' + W + '" height="' + H + '"></canvas><div class="bfBars b"></div><div class="scTitle"><small></small><b></b><span></span></div><div class="scCard"><small></small><b></b><span></span></div><div class="scStamp"></div><div class="bfCap"><b></b><p></p></div><button type="button" class="bfSkip">Skip ›</button>';
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
    const cv = el.querySelector('.bfCv'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    const cap = el.querySelector('.bfCap'), capB = cap.querySelector('b'), capP = cap.querySelector('p'), tl = el.querySelector('.scTitle'), cd = el.querySelector('.scCard'), sp = el.querySelector('.scStamp');
    const stop = X.cue(mood); X.lock(true);
    let i = -1, t0 = 0, raf = 0, typed = 0, line = '';
    const end = (natural) => { if (!live) return; live = null; cancelAnimationFrame(raf); removeEventListener('keydown', key2); try { stop(natural === true); } catch (e) {} S.cutSeen = S.cutSeen || {}; S.cutSeen[key] = 1; X.save(); el.classList.add('out'); X.lock(false); setTimeout(() => { el.remove(); done && done(true); }, 650); };
    const next = () => { i++; if (i >= cut.length) return end(true); const s = cut[i]; t0 = performance.now(); typed = 0; line = s.cap ? s.cap[1] : ''; capB.textContent = s.cap ? s.cap[0] : ''; capP.textContent = ''; cap.classList.toggle('narr', !!s.cap && !s.cap[0]); cap.hidden = !s.cap;
      if (s.title) { tl.querySelector('small').textContent = s.title[0]; tl.querySelector('b').textContent = s.title[1]; tl.querySelector('span').textContent = s.title[2] || ''; tl.classList.remove('in'); void tl.offsetWidth; tl.classList.add('in'); setTimeout(() => live && X.thud('open'), 380); } else if (s.keepTitle !== true) tl.classList.remove('in');
      if (s.card) { cd.querySelector('small').textContent = s.card[0]; cd.querySelector('b').textContent = s.card[1]; cd.querySelector('span').textContent = s.card[2] || ''; cd.classList.add('in'); } else cd.classList.remove('in');
      if (s.stamp) setTimeout(() => { if (!live) return; sp.textContent = s.stamp; sp.classList.add('in'); X.thud('good'); }, (s.stampAt || 1.2) * 1000);
      try { s.go && s.go(); } catch (e) {} };
    const loop = (now) => { if (!live) return; const s = cut[i], t = (now - t0) / 1000; s.draw(g, t);
      const want = Math.min(line.length, Math.floor(Math.max(0, t - (s.capAt || .3)) * 38)); if (want !== typed) { typed = want; capP.textContent = line.slice(0, typed); }
      if (t >= s.d) next(); raf = requestAnimationFrame(loop); };
    const key2 = (e) => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); end(); } };
    el.querySelector('.bfSkip').onclick = (e) => { e.stopPropagation(); end(); }; addEventListener('keydown', key2);
    live = { end }; next(); raf = requestAnimationFrame(loop);
  }
  const ok = (l) => l && typeof l[1] === 'string' && l[0] !== 'choice' && l[0] !== 'q' && l[0] !== 'gate' && !/^\(over the radio\)/.test(l[1]);
  const isPerson = (id) => id && id !== 'narr' && !String(id).startsWith('v_');
  // the first line of a scene, shown in the scene and then left out of the conversation that follows
  const firstLine = (st) => { const l = (st.say || [])[0]; return ok(l) && (l[0] === 'narr' || isPerson(l[0])) ? l : null; };

  // a part of a chapter (about fifteen seconds): the place, the person, their first line
  function part(c, idx, st, done) {
    const key = 'st' + c.d + '_' + idx; if ((S.cutSeen || {})[key]) { done(false); return; }
    const D = X.district(c.d), at = st.at || D.name, sv = set(kindOf(at), at, D.color), l0 = firstLine(st), who = st.who || (l0 && isPerson(l0[0]) ? l0[0] : null), me = body('@you', 1), them = who ? body(who, 7) : null;
    const opening = idx === 0;
    const cut = [];
    if (opening) { const sky = skyline(D, X.day());
      cut.push({ d: 3.4, cap: ['', 'PORT MERIDIAN · ' + D.name.toUpperCase() + ' · ' + X.hour()], draw: (g, t) => { g.fillStyle = '#020409'; g.fillRect(0, 0, W, H); g.globalAlpha = Math.min(1, t / 2.4) * .5; g.drawImage(sky.c, -60, 0); g.globalAlpha = 1; } },
        { d: 6.2, draw: (g, t) => { const k = ease(Math.min(1, t / 6.2)); g.drawImage(sky.c, -120 * k, 0); const r = seeded('tw' + Math.floor(t * 4)); if (!sky.day) for (let n = 0; n < 6; n++) { const w = sky.wins[Math.floor(r() * sky.wins.length)]; if (w) R(g, 'rgba(3,6,13,.9)', w[0] - 120 * k, w[1], 2, 3); }
          { const v = g.createRadialGradient(240, 128, 20, 240, 128, 260); v.addColorStop(0, 'rgba(2,4,10,' + Math.min(.62, t * .3) + ')'); v.addColorStop(1, 'rgba(2,4,10,0)'); g.fillStyle = v; g.fillRect(0, 0, W, H); } // the title gets a pool of shade to sit in
          if (sky.day) return; const a = .25 + .15 * Math.sin(t * .8); g.save(); g.globalAlpha = a; g.translate(380 - 120 * k, 236); g.rotate(-.5 + Math.sin(t * .5) * .35); const gr = g.createLinearGradient(0, 0, 0, -260); gr.addColorStop(0, 'rgba(255,244,214,.6)'); gr.addColorStop(1, 'rgba(255,244,214,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-3, 0); g.lineTo(-40, -260); g.lineTo(40, -260); g.lineTo(3, 0); g.fill(); g.restore(); },
          title: ['Chapter ' + NUM[c.d], c.title, D.name], capAt: 99, cap: null },
        { d: 4.6, keepTitle: true, draw: (g, t) => { g.drawImage(sky.c, -120, 0); g.fillStyle = 'rgba(2,4,9,' + Math.min(.7, t * .4) + ')'; g.fillRect(0, 0, W, H); } });
    }
    cut.push({ d: opening ? 5.6 : 4.8, card: [(opening ? 'Chapter ' + NUM[c.d] : 'Chapter ' + NUM[c.d] + ' · Part ' + NUM[idx]), at, st.goal || ''], draw: (g, t) => wide(g, sv, t / 5, 1, 1.08, [[me, 150, 1.6], [them, 318, 1.6]], .25 + .12 * Math.sin(t * 2.3)) });
    if (l0) { const narr = l0[0] === 'narr', sp = narr ? null : body(l0[0], l0[0] === '@you' ? 1 : 7), wh = narr ? null : l0[0] === '@you' ? { name: S.cs || 'You' } : X.who(l0[0]);
      cut.push({ d: fit(l0[1]), cap: [narr ? '' : (wh && wh.name) || '', l0[1]], draw: narr ? (g, t) => wide(g, sv, 1 + t / 8, 1.08, 1.16, [[me, 150, 1.6], [them, 318, 1.6]], .3) : (g, t) => closeUp(g, sv, sp, t, .05, l0[0] === '@you' ? -1 : 1) }); }
    run(key, opening ? OPEN_MOOD[c.d] || 'dawn' : PART_MOOD[c.d] || 'resolve', cut, (shown) => done(shown && !!l0));
  }
  // the end of a chapter (about twenty-five seconds): the last place at dawn, the faces you met and where you stand
  function finale(c, done) {
    const key = 'ch' + c.d + '_end'; if ((S.cutSeen || {})[key]) { done(false); return; }
    const D = X.district(c.d), last = c.steps[c.steps.length - 1], at = last.at || D.name, sv = set(kindOf(at), at, '#f59e0b');
    const ids = []; c.steps.forEach((s) => { if (s.who && ids.indexOf(s.who) < 0 && s.who !== 'castillo') ids.push(s.who); }); ids.push('castillo');
    const faces = ids.slice(-6).map((id) => ({ id, s: body(id, 0), w: X.who(id) || {}, n: Math.max(0, Math.min(6, (S.npc || {})[id] || 0)) }));
    const cut = [
      { d: 4.4, cap: ['', 'End of watch. ' + D.name + ' goes quiet.'], draw: (g, t) => { wide(g, sv, t / 4.4, 1.12, 1.02, [], .2); g.fillStyle = 'rgba(253,186,116,' + Math.min(.16, t * .05) + ')'; g.fillRect(0, 0, W, H); } },
      { d: 3 + faces.length * 1.3, cap: ['', 'The people you met. They will remember how you handled it.'], capAt: .6, draw: (g, t) => { g.fillStyle = '#05080f'; g.fillRect(0, 0, W, H); g.globalAlpha = .35; g.drawImage(sv.bg, 0, 0); g.globalAlpha = 1;
        const n = faces.length, gap = Math.min(78, 440 / n), x0 = W / 2 - (gap * (n - 1)) / 2;
        faces.forEach((f, k) => { const a = Math.max(0, Math.min(1, (t - .4 - k * 1.1) * 2)); if (!a) return; const x = x0 + k * gap, y = 112 + (1 - ease(a)) * 16; g.globalAlpha = a;
          R(g, '#0c1322', x - 30, y - 62, 60, 76); g.strokeStyle = k === n - 1 ? '#f5b800' : '#334155'; g.lineWidth = 2; g.strokeRect(x - 30, y - 62, 60, 76);
          g.save(); g.beginPath(); g.rect(x - 29, y - 61, 58, 74); g.clip(); if (f.s) g.drawImage(f.s, x - 24 * 2.6, y - 70, 48 * 2.6, 64 * 2.6); g.restore();
          g.font = '700 8px "Meridian Text",monospace'; g.fillStyle = '#e2e8f0'; g.textAlign = 'center'; g.fillText((f.w.name || '').split(' ').slice(-1)[0].slice(0, 12), x, y + 26);
          for (let p = 0; p < 6; p++) R(g, p < f.n ? '#f5b800' : '#1e293b', x - 23 + p * 8, y + 32, 6, 4); g.textAlign = 'left'; g.globalAlpha = 1; }); } },
      { d: 5.4, title: ['End of Chapter ' + NUM[c.d], c.title, ''], stamp: 'CASE NOTES FILED', stampAt: 1.6, draw: (g, t) => { g.fillStyle = '#05080f'; g.fillRect(0, 0, W, H); g.globalAlpha = .5; g.drawImage(sv.bg, 0, 0); g.globalAlpha = 1; } }];
    run(key, END_MOOD[c.d] || 'hope', cut, () => done());
  }
  return { part, finale, firstLine, get on() { return !!live; }, end: () => live && live.end() };
}
