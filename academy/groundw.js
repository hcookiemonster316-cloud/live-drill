// Ground chunks are painted here, off the main thread (Phase 4, item 15). The district layout is deterministic, so the
// worker builds its own copy once per district and paints any chunk the game asks for (streets, markings, lawns,
// manhole covers), then hands back a finished bitmap. On a phone a chunk is tens of milliseconds of drawing, and none
// of it lands inside a frame any more.
import { buildDistrict, drawGround, recycleGround, setGroundRes, iso, hiCanvas, N, CH, T } from './world.js';
const WS = new Map();
let MAN = null;
const manhole = () => { const [c, g] = hiCanvas(20, 11, 3); g.fillStyle = '#2b3038'; g.beginPath(); g.ellipse(10, 5.5, 9, 4.5, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#4a515c'; g.lineWidth = 1; g.stroke(); return c; };
onmessage = (e) => {
  const { id, did, cx, cy, gres } = e.data;
  try {
    setGroundRes(gres); let W = WS.get(did); if (!W) { if (WS.size > 2) WS.delete(WS.keys().next().value); W = buildDistrict(did); WS.set(did, W); }
    const c = drawGround(W, cx, cy), cvs = c.canvas, k = cvs.width / cvs.lw, g = cvs.getContext('2d');
    // manhole covers, exactly as the main thread paints them (game.js groundChunk)
    const x0 = Math.max(1, cx * CH - 2), x1 = Math.min(N - 2, (cx + 1) * CH + 2), y0 = Math.max(1, cy * CH - 2), y1 = Math.min(N - 2, (cy + 1) * CH + 2); let on = false;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (x % 11 !== 1 || y % 11 !== 6 || W.at(x, y) !== T.ROAD) continue;
      const [sx, sy] = iso(x + .5, y + .5), lx = sx + c.ox - 10, ly = sy + c.oy - 5.5; if (lx > cvs.lw || ly > cvs.lh || lx + 20 < 0 || ly + 11 < 0) continue;
      if (!on) { g.save(); g.setTransform(k, 0, 0, k, 0, 0); on = true; } g.drawImage(MAN || (MAN = manhole()), lx, ly, 20, 11); }
    if (on) g.restore();
    const bmp = cvs.transferToImageBitmap(); recycleGround(c);
    postMessage({ id, did, cx, cy, gres, bmp, ox: c.ox, oy: c.oy, lw: cvs.lw, lh: cvs.lh }, [bmp]);
  } catch (err) { postMessage({ id, did, cx, cy, gres, fail: String(err && err.message || err) }); }
};
