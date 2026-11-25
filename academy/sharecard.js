// Cards worth sharing (Action plan, Step E). A gold medal, a rank-up or a Night Shift run makes a clean card in the
// game's own style (Meridian type, the game's own icons, the department gold on navy) that you can save or send.
// One painter for every card, so they look like a set.
import { paint, iconFor } from './icons.js';

export async function shareCard(o, H) {
  try { await Promise.all([document.fonts.load("800 40px 'Meridian'"), document.fonts.load("600 40px Meridian Text"), document.fonts.load("700 40px Meridian Text")]); } catch (e) {}
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 1350);
  gr.addColorStop(0, '#13244a'); gr.addColorStop(1, '#060b18'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1350);
  g.strokeStyle = '#f5b800'; g.lineWidth = 6; g.strokeRect(36, 36, 1008, 1278);
  g.fillStyle = '#f5b800'; g.font = "800 40px 'Meridian', sans-serif"; g.fillText('PATROL CITY · ' + o.kick, 80, 120);
  const big = iconFor(o.icon); if (big) paint(g, big, 80, 170, 150);
  g.fillStyle = '#fff'; g.font = "800 92px 'Meridian', sans-serif"; wrap(g, o.title, 80, 420, 920, 100); // one or two lines, ending at the same baseline
  g.fillStyle = '#94a3b8'; g.font = "600 38px Meridian Text, sans-serif"; g.fillText(o.sub || '', 80, 500);
  let y = 640; (o.rows || []).filter((r) => r && !/^0 /.test(r[1])).forEach(([ic, t]) => { const n = iconFor(ic); if (n) paint(g, n, 80, y - 40, 48); g.fillStyle = '#e8eef8'; g.font = "700 40px Meridian Text, sans-serif"; g.fillText(t, 150, y); y += 80; });
  g.fillStyle = '#64748b'; g.font = "600 30px Meridian Text, sans-serif"; g.fillText('Sim training · FBRTP Vehicle Operations', 80, 1270);
  return new Promise((done) => c.toBlob(async (blob) => { const name = 'patrol-city-' + (o.file || 'card') + '.png', file = new File([blob], name, { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: o.title }); H.stat('shared'); return done('shared'); } } catch (e) {}
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); H.toast('🖼️ Saved the card.'); H.stat('shared'); done('saved'); }, 'image/png'));
}
function wrap(g, t, x, y, w, lh) { const words = String(t).split(' '); let line = '', yy = y - lh; const lines = []; words.forEach((wd) => { const tr = line ? line + ' ' + wd : wd; if (g.measureText(tr).width > w && line) { lines.push(line); line = wd; } else line = tr; }); if (line) lines.push(line); lines.slice(0, 2).forEach((l, i) => g.fillText(l, x, y - (lines.length > 1 ? lh : 0) + i * lh)); }
