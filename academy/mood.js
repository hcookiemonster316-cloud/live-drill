// Contrast and a color script. The city is painted a little muted (see game.js: the mute pass before lights and siren
// washes), so light bars, flares and lit windows pop. On top of the time-of-day grade, the shift's tension sets the
// mood: a pale, calm start; the edges closing in as things get busy; red and blue at the peak of a priority call or a
// pursuit; and a gold wash for a moment when you close a case well. Every layer here is painted once per screen size
// and stamped with an alpha, so the whole pass is at most four drawImage calls a frame.
export function installMood(H) {
  let T = 0, goldAt = -1e9, goldK = 0;
  // tension right now, 0..1
  function target() {
    if (H.inside()) return 0;
    if (H.pursuit()) return 1;
    const ph = H.phase(), base = ph === 'peak' ? .55 : ph === 'rise' ? .3 : ph === 'cool' ? .08 : 0;
    return Math.max(base, H.urgent() ? .7 : 0);
  }
  // a case closed: how well it went (0..1) sets how bright the gold is
  function resolve(score) { if (score >= .6) { goldAt = performance.now(); goldK = Math.min(1, score); } }
  const vignette = (key, W, Hh, inner, col) => H.layer(key + W + 'x' + Hh, W, Hh, (g) => {
    const r = Math.hypot(W, Hh) / 2, gr = g.createRadialGradient(W / 2, Hh / 2, r * inner, W / 2, Hh / 2, r); gr.addColorStop(0, col.replace('A', '0')); gr.addColorStop(1, col.replace('A', '1')); g.fillStyle = gr; g.fillRect(0, 0, W, Hh); });
  const edge = (key, W, Hh, left, col) => H.layer(key + W + 'x' + Hh, W, Hh, (g) => {
    const gr = g.createLinearGradient(left ? 0 : W, 0, left ? W * .45 : W * .55, 0); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, Hh); });
  // drawn in screen space right after the time-of-day grade
  let last = 0;
  function draw(ctx, W, Hh, now) {
    const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now;
    T += (target() - T) * Math.min(1, dt * 1.6); // eases in and out over about a second
    const day = H.day();
    if (T < .04 && H.phase() === 'calm' && day && !H.inside()) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(225,236,255,.035)'; ctx.fillRect(0, 0, W, Hh); ctx.globalCompositeOperation = 'source-over'; }
    if (T > .04) { ctx.globalAlpha = Math.min(.5, T * .42); ctx.drawImage(vignette('mv', W, Hh, .45, 'rgba(4,7,18,A)'), 0, 0, W, Hh); ctx.globalAlpha = 1; }
    if (T > .5) { // red and blue at the edges, swapping like a light bar
      const a = Math.min(.5, (T - .45) * .9), ph = Math.floor(now / 260) % 2; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
      ctx.drawImage(edge(ph ? 'mr' : 'mb', W, Hh, true, ph ? 'rgba(255,40,50,.55)' : 'rgba(40,90,255,.55)'), 0, 0, W, Hh);
      ctx.drawImage(edge(ph ? 'mb2' : 'mr2', W, Hh, false, ph ? 'rgba(40,90,255,.55)' : 'rgba(255,40,50,.55)'), 0, 0, W, Hh);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    const gt = (now - goldAt) / 2600; if (gt >= 0 && gt < 1) { ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = (1 - gt) * (gt < .15 ? gt / .15 : 1) * .4 * goldK;
      ctx.drawImage(vignette('mg', W, Hh, 0, 'rgba(255,196,80,A)'), 0, 0, W, Hh); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  }
  return { draw, resolve, get T() { return T; } };
}
