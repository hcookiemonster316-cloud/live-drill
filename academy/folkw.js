// People sprites are rasterized here, off the main thread: a new walk frame or direction never stalls a frame.
import { rgba, SW, SH } from './pixelfolk.js';
onmessage = (e) => { const { id, D, d, ph, mv, ss } = e.data; try { const a = rgba(D, d, ph, mv, ss); postMessage({ id, a, w: SW, h: SH }, [a.buffer]); } catch (err) { postMessage({ id, fail: String(err && err.message || err) }); } };
