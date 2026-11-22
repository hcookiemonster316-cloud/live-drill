// patrol activities: play every activity/variant to the end (random choices), check debriefs and the transport chain
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 1200, height: 800 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message)); a.on('console', (m) => m.text().startsWith('{') && console.log('PAGE', m.text()));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2000);
  const settle = async () => { for (let k = 0; k < 10; k++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"]').forEach((x) => x.click()); document.querySelectorAll('.tCard').forEach((x) => x.remove()); }); await a.waitForTimeout(120); } };
  await settle();
  const list = process.argv[2] ? [process.argv[2].split(':')] : [['traffic', 'clean'], ['traffic', 'suspended'], ['traffic', 'dui'], ['traffic', 'nervous'], ['welfare', 'fine'], ['welfare', 'fallen'], ['welfare', 'gone'], ['warrant', 'calm'], ['warrant', 'family'], ['warrant', 'runner'], ['business', 'quiet'], ['business', 'door'], ['business', 'worker']];
  for (const [op, v] of list) {
    await a.evaluate(([op, v]) => { window.__opsLog = []; const P = window.__pc.P; window.__pc.OPSM.start({ ops: op, opsV: v, title: op, x: P.x, y: P.y, where: 'test street' }, (how) => window.__opsLog.push('done:' + how)); }, [op, v]);
    let seen = { choices: 0, debriefs: 0, kickers: new Set() };
    for (let k = 0; k < 160; k++) {
      await a.waitForTimeout(110);
      const st = await a.evaluate(() => { const d = document.querySelector('#dlg'), m = document.getElementById('modal');
        if (!m.hidden) { const t = m.innerText.slice(0, 40); const bt = m.querySelector('#mClose,#mDone,button'); if (bt) bt.click(); return { m: t }; }
        if (d.hidden) return null; const kick = (d.querySelector('.dlgKick') || {}).innerText;
        if (d.querySelector('.dlgOpts.q [data-k]:not([disabled])')) { const q = window.__curQ; if (Array.isArray(q.c)) { q.c.forEach((i) => document.querySelector('#dlg .dlgOpts.q [data-k="' + i + '"]').click()); document.querySelector('#dlgOk').click(); } else document.querySelector('#dlg .dlgOpts.q [data-k="' + q.c + '"]').click(); return { q: 1, kick }; }
        const ch = [...d.querySelectorAll('.dlgOpts:not(.q) [data-k]')]; if (ch.length) { ch[Math.floor(Math.random() * ch.length)].click(); return { ch: ch.length, kick }; }
        d.click(); return { adv: 1, kick }; });
      if (st && st.ch) seen.choices++; if (st && st.m) seen.debriefs++; if (st && st.kick) seen.kickers.add(st.kick);
      const done = await a.evaluate(() => window.__opsLog.length && !window.__pc.OPSM.busy && document.getElementById('dlg').hidden && document.getElementById('modal').hidden);
      if (done) break;
    }
    if (!(await a.evaluate(() => window.__opsLog.length))) console.log('STUCK', JSON.stringify(await a.evaluate(() => ({ dlg: document.getElementById('dlg').hidden, txt: document.getElementById('dlg').innerText.slice(0, 200), modal: document.getElementById('modal').hidden, busy: window.__pc.OPSM.busy }))));
    console.log(op + ':' + v, '| choices', seen.choices, '| modals', seen.debriefs, '|', [...seen.kickers].join(','), '|', await a.evaluate(() => window.__opsLog.join(',')));
    await settle();
  }
  // self-initiated stop: put a violator next to the player in the car and see the button
  const btn = await a.evaluate(async () => { const pc = window.__pc, P = pc.P; P.inCar = true; const c = pc.traffic.find((x) => !x.v && !x.bus); c.x = P.x + 1.5; c.y = P.y; c.viol = 'Taillight out'; await new Promise((r) => setTimeout(r, 900)); const b = document.getElementById('stopBtn'); console.log(JSON.stringify({call: !!pc.call, inside: pc.inside, dlg: document.getElementById('dlg').hidden, modal: document.getElementById('modal').hidden, busy: pc.OPSM.busy, viol: c.viol, d: Math.hypot(c.x-P.x,c.y-P.y)})); return b && !b.hidden ? b.innerText.replace(/\n/g, ' ') : 'hidden'; });
  console.log('stop button:', btn); await a.screenshot({ path: 't85_btn.png' });
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
