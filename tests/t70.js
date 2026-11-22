// city systems: menu tiles, beat pick, investigation flow, partner care, PT meet, incident roles + task, watch meeting, share card
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ ...devices['iPhone 13'], acceptDownloads: true }); const a = await c.newPage(); const errs = []; a.on('pageerror', (e) => errs.push(e.message + ' @' + (e.stack || '').split('\n')[1]));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'k9', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const clear = async () => { for (let i = 0; i < 5; i++) { await a.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /back to patrol|keep patrolling/i.test(x.innerText) && x.offsetParent); if (b) b.click(); document.querySelectorAll('.tCard').forEach((x) => x.click()); document.querySelectorAll('.lorePop').forEach((x) => x.remove()); const m = document.getElementById('modal'); if (!m.hidden) { const bb = [...m.querySelectorAll('button')].pop(); bb && bb.click(); } }); await a.waitForTimeout(350); } };
  const talk = async () => { for (let s = 0; s < 40; s++) { const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return 'done'; const q = d.querySelector('.dlgOpts [data-k]:not([disabled])'); if (q) q.click(); else d.click(); return 'go'; }); if (st === 'done') break; await a.waitForTimeout(300); } };
  await clear();
  await a.evaluate(() => document.getElementById('bPause').click()); await a.waitForTimeout(500); console.log('menu tiles:', await a.evaluate(() => [...document.querySelectorAll('.pmT')].map((x) => x.innerText.trim()).slice(0, 8).join(' / ')));
  await a.evaluate(() => [...document.querySelectorAll('.pmT')].find((x) => /My Beat/.test(x.innerText)).click()); await a.waitForTimeout(400);
  await a.evaluate(() => document.querySelector('[data-q="0"]').click()); await a.waitForTimeout(400); console.log('beat:', await a.evaluate(() => document.getElementById('modal').innerText.replace(/\n+/g, ' | ').slice(0, 220))); await a.screenshot({ path: 'cy_beat.png' });
  await a.evaluate(() => document.getElementById('mClose').click());
  // investigation
  await a.evaluate(() => { const pc = window.__pc; pc.CITY.openCase({ item: 'a red bicycle with a wicker basket', from: 'Founders Park' }, 'Founders Park'); pc.S.calls += 2; }); await a.waitForTimeout(500); await clear();
  await a.evaluate(() => window.__pc.CITY.casesPanel()); await a.waitForTimeout(400); await a.evaluate(() => document.querySelector('[data-c="0"]').click()); await a.waitForTimeout(800); await talk(); await a.waitForTimeout(800);
  console.log('case:', await a.evaluate(() => JSON.stringify(window.__pc.S.cases2)));
  // partner care
  await clear(); await a.evaluate(() => window.__pc.CITY.animalPanel()); await a.waitForTimeout(400); await a.screenshot({ path: 'cy_k9.png' }); await a.evaluate(() => document.getElementById('anFeed').click()); await a.waitForTimeout(400); await a.evaluate(() => document.getElementById('anTrain').click()); await a.waitForTimeout(800); await talk(); await a.waitForTimeout(500);
  console.log('animal:', await a.evaluate(() => JSON.stringify(window.__pc.S.animal)));
  // PT meet panel
  await clear(); await a.evaluate(() => window.__pc.CITY.meetPanel()); await a.waitForTimeout(400); console.log('meet:', await a.evaluate(() => document.getElementById('modal').innerText.replace(/\n+/g, ' | ').slice(0, 160))); await a.evaluate(() => document.getElementById('mClose').click());
  // live incident: force one, pick a role, walk to a task
  await clear(); await a.evaluate(() => { const C = window.__pc.CITY; for (let i = 0; i < 1; i++) C.tick(0); }); await a.evaluate(() => { const pc = window.__pc; pc.CITY.tick(0); });
  await a.evaluate(() => window.__pc.CITY.startLive()); await a.waitForTimeout(600); await a.screenshot({ path: 'cy_inc.png' }); console.log('incident:', await a.evaluate(() => document.getElementById('modal').innerText.replace(/\n+/g, ' | ').slice(0, 200)));
  await a.evaluate(() => document.querySelector('[data-r="0"]').click()); await a.waitForTimeout(500);
  await a.evaluate(() => { const pc = window.__pc, t = pc.CITY.live.tasks[0]; pc.P.x = t.x; pc.P.y = t.y; pc.P.path = []; }); await a.waitForTimeout(1500); await a.screenshot({ path: 'cy_task.png' }); await talk(); await a.waitForTimeout(500);
  console.log('tasks left:', await a.evaluate(() => window.__pc.CITY.live.tasks.length), 'svc:', await a.evaluate(() => Object.keys(window.__pc.S.svc).join(',')));
  await a.evaluate(() => window.__pc.REW.panel()); await a.waitForTimeout(400); const [dl] = await Promise.all([a.waitForEvent('download', { timeout: 8000 }).catch(() => null), a.evaluate(() => document.getElementById('svcShare').click())]); console.log('share card download:', dl ? await dl.suggestedFilename() : 'none'); if (dl) await dl.saveAs('card.png');
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
