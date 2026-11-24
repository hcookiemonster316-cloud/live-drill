// Building sprites are painted here, off the main thread, so new streets and time-of-day relights never stall a frame.
import { drawBuilding, setRes, buildDistrict } from './world.js';
onmessage = (e) => {
  if (e.data.tmap != null) { const did = e.data.tmap; /* the trust map's block list for a district you're not in: building the whole district takes 10-30 ms, so it happens here */
    try { const Wd = buildDistrict(did); postMessage({ tmap: did, lots: Wd.lots.map((l) => ({ bx: Math.floor((l.ox - 2) / 11), by: Math.floor((l.oy - 2) / 11), name: l.name, zone: l.zone, gen: l.gen })) }); } catch (err) { postMessage({ tmap: did, fail: String(err && err.message || err) }); } return; }
  const { id, b, lit, sun, res } = e.data;
  try { setRes(res); const r = drawBuilding(b, lit, sun), bmp = r.canvas.transferToImageBitmap(); postMessage({ id, bmp, x: r.x, y: r.y, lw: r.canvas.lw, lh: r.canvas.lh, lights: r.lights, res }, [bmp]); }
  catch (err) { postMessage({ id, fail: String(err && err.message || err) }); }
};
