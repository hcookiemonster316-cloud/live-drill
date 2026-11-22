// Preloaded into every regression test (node -r ./fast.js). Two speed-ups, no edits to the tests themselves:
// 1. PW_WS set: chromium.launch() connects to one shared, already-running browser instead of starting a new one.
// 2. FAST (default .5): fixed pauses of 800 ms or more are cut to that share (never under 600 ms); short pauses stay.
const pw = require('playwright');
const ws = process.env.PW_WS, k = process.env.FAST ? +process.env.FAST : .5;
let patched = false;
const patchPage = (p) => { if (patched || !p) return p; patched = true; const proto = Object.getPrototypeOf(p), wait = proto.waitForTimeout;
  proto.waitForTimeout = function (ms) { return wait.call(this, ms >= 800 ? Math.max(600, Math.round(ms * k)) : ms); }; return p; };
const wrapBrowser = (b) => {
  const np = b.newPage.bind(b), nc = b.newContext.bind(b);
  b.newPage = async (...a) => patchPage(await np(...a));
  b.newContext = async (...a) => { const c = await nc(...a), cp = c.newPage.bind(c); c.newPage = async (...x) => patchPage(await cp(...x)); return c; };
  return b; };
const launch = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = async (o) => { if (ws) { try { return wrapBrowser(await pw.chromium.connect(ws)); } catch (e) { /* fall back to a private browser */ } } return wrapBrowser(await launch(o)); };
