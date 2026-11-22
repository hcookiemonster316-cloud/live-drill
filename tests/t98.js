const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { autoQ: false, drs: false }, cal: { day: 3 } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const clear = async () => { for (let k = 0; k < 6; k++) { await a.evaluate(() => { document.querySelectorAll('.tCard,.lorePop').forEach((x) => x.remove()); const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling|save for later|back to work|^close$/i.test(x.innerText.trim()) && x.offsetParent); if (b) b.click(); }); await a.waitForTimeout(250); } };
  await clear();
  const r = await a.evaluate(() => { const pc = window.__pc, G = pc.GRP, P = pc.P; ['purterm', 'quick', 'help', 'deeswin'].forEach((k) => pc.MEM.note(k, { who: 'Ana', where: 'Oak Ave', x: P.x, y: P.y })); return G.of(0).v; });
  console.log('after deeds (shop owners, outreach):', JSON.stringify(r), 'expect [52,57]');
  const r2 = await a.evaluate(() => { const pc = window.__pc; pc.MEM.note('harsh', { who: 'B', where: 'X', x: 1, y: 1 }); return pc.GRP.of(0).v; }); console.log('after harsh:', JSON.stringify(r2), 'expect both down');
  // trust map
  await a.evaluate(() => { const S = window.__pc.GRP.of(0); S.v = [78, 52]; }); await a.keyboard.press('Escape'); await a.waitForTimeout(300);
  await a.waitForFunction(() => [...document.querySelectorAll('.pmT')].some((x) => /Community Trust Map/.test(x.innerText)), null, { timeout: 20000 }); await a.evaluate(() => [...document.querySelectorAll('.pmT')].find((x) => /Community Trust Map/.test(x.innerText)).click()); await a.waitForTimeout(400);
  const t = await a.evaluate(() => document.getElementById('modal').innerText); console.log('map section:', /Who thinks what/.test(t), /Downtown Business Association/.test(t), /Founders Plaza Outreach/.test(t), '| split line:', (t.match(/"[^"]*"/g) || []).join(' / '));
  await a.evaluate(() => document.querySelector('.grpList').scrollIntoView()); await a.screenshot({ path: 't98a.png' }); await clear();
  // the meeting fires by itself once per academy day
  const m = await a.evaluate(() => { const pc = window.__pc; pc.GRP.of(0).met = 0; pc.GRP.tick(200); return { open: !document.getElementById('dlg').hidden, met: pc.GRP.of(0).met }; }); console.log('meeting auto:', JSON.stringify(m));
  for (let k = 0; k < 6; k++) { const ch = await a.evaluate(() => !!document.querySelector('#dlg .dlgOpts button')); if (ch) break; await a.evaluate(() => document.getElementById('dlg').click()); await a.waitForTimeout(350); }
  await a.waitForTimeout(1500); await a.screenshot({ path: 't98b.png' }); console.log('narr still visible:', await a.evaluate(() => [...document.querySelectorAll('#dlg *')].filter((e) => e.offsetParent && /Two people wave/.test(e.textContent) && !e.children.length).map((e) => e.className + ':' + getComputedStyle(e).opacity).join(',')));
  const opts = await a.evaluate(() => [...document.querySelectorAll('#dlg .dlgOpts button')].map((x) => x.innerText.trim()).filter(Boolean)); console.log('choices:', JSON.stringify(opts));
  const before = await a.evaluate(() => window.__pc.GRP.of(0).v.slice());
  await a.evaluate(() => [...document.querySelectorAll('#dlg button')].find((x) => /Both/.test(x.innerText)).click()); await a.waitForTimeout(300);
  for (let k = 0; k < 5; k++) { if (await a.evaluate(() => document.getElementById('dlg').hidden)) break; await a.evaluate(() => document.getElementById('dlg').click()); await a.waitForTimeout(300); }
  const after = await a.evaluate(() => window.__pc.GRP.of(0).v.slice()); console.log('both:', JSON.stringify(before), '->', JSON.stringify(after));
  const again = await a.evaluate(() => { window.__pc.GRP.tick(200); return !document.getElementById('dlg').hidden; }); console.log('second meeting same day:', again);
  const fin = await a.evaluate(() => window.__pc.FIN.helpers().map((h) => h.name)); console.log('finale helpers include group:', fin.includes('Downtown Business Association'));
  console.log(errs.length ? errs : 'no errors'); await b.close(); })();
