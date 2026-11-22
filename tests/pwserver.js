// one shared Chromium for a whole test run; prints its endpoint and stays up until killed
const pw = require('playwright');
(async () => { const s = await pw.chromium.launchServer(); console.log(s.wsEndpoint()); process.on('SIGTERM', async () => { await s.close(); process.exit(0); }); })();
