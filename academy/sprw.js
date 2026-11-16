// Building sprites are painted here, off the main thread, so new streets and time-of-day relights never stall a frame.
import { drawBuilding, setRes } from './world.js';
onmessage = (e) => {
  const { id, b, lit, sun, res } = e.data;
  try { setRes(res); const r = drawBuilding(b, lit, sun), bmp = r.canvas.transferToImageBitmap(); postMessage({ id, bmp, x: r.x, y: r.y, lw: r.canvas.lw, lh: r.canvas.lh, lights: r.lights, res }, [bmp]); }
  catch (err) { postMessage({ id, fail: String(err && err.message || err) }); }
};
