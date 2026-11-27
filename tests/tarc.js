// shift arc: calls follow calm -> rise -> peak -> cool, dispatch says when it turns, and the next shift's briefing reads back the last one
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'] }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ ch: 'vo', cs: '1-Alpha-12', home: 0, unlocked: [0, 1, 2, 3, 4], shift: 'day', unit: 'patrol', sound: false, seenIntro: 1, seenCine: 1, tutDone: 1, cfg: { autoQ: false, callCine: false, pursuits: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone').catch(() => {}); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(1500);
  // many shifts' worth of picks: priority mix by phase
  const mix = await a.evaluate(() => { const pc = window.__pc, out = {}; const list = []; for (let i = 0; i < 10; i++) [1, 2, 3].forEach((p) => list.push(['c' + p + '_' + i, p]));
    for (let s = 0; s < 300; s++) { pc.SARC.onShift(); for (let k = 0; k < 6; k++) { const ph = pc.SARC.phase, pick = pc.VAR.pickCall(list); out[ph] = out[ph] || { 1: 0, 2: 0, 3: 0 }; out[ph][pick[1]]++; pc.SARC.onDispatch({ prio: pick[1] }); } }
    return out; });
  console.log('priority mix by phase:', JSON.stringify(mix));
  const ok = mix.calm[3] > mix.calm[1] * 3 && mix.peak[1] > mix.peak[3] * 3 && mix.cool[3] > mix.cool[1] * 3;
  console.log('curve holds:', ok);
  // a real shift: dispatch radio lines as the night turns
  const lines = await a.evaluate(async () => { const pc = window.__pc, seen = []; pc.SARC.onShift(); const radio = document.getElementById('radio');
    for (let k = 0; k < 6; k++) { if (pc.curCall) pc.dropCall(); pc.dispatchCall(); await new Promise((r) => setTimeout(r, 2900)); seen.push(pc.SARC.phase + ' | ' + (radio ? radio.innerText.replace(/\s+/g, ' ').slice(-110) : '')); }
    return seen; });
  lines.forEach((l) => console.log('  ' + l));
  // next shift: the briefing reads last shift back
  await a.evaluate(() => { const pc = window.__pc, S = pc.S; S.calls += 4; S.xp += 120; S.facts = S.facts || {}; ['F1', 'F2', 'F3'].forEach((f) => { S.facts[f] = 1; }); S.trust = S.trust || {}; S.trust[0] = (S.trust[0] || 50) + 4; pc.SARC.onShift(); if (pc.curCall) pc.dropCall(); document.querySelectorAll('#modal:not([hidden]) #mClose,#modal:not([hidden]) #mDone').forEach((x) => x.click()); pc.MEM.briefing(); });
  await a.waitForTimeout(700); await a.screenshot({ path: 'tarc_brief.png' });
  console.log('briefing:', await a.evaluate(() => (document.getElementById('modal').innerText || '').replace(/\s+/g, ' ').slice(0, 300)));
  const again = await a.evaluate(() => { document.querySelector('#modal #mClose') && document.querySelector('#modal #mClose').click(); return window.__pc.MEM.briefing(); });
  console.log('read back only once:', again === false);
  console.log(errs.length ? errs.slice(0, 3) : 'no errors'); await b.close(); })();
