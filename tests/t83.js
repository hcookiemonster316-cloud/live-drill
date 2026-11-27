// regulars open up: each friendship tier unlocks its line once, the best-friend line raises a banner
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const a = await b.newPage({ viewport: { width: 1200, height: 800 } }); const errs = []; a.on('pageerror', (e) => errs.push(e.message));
  await a.goto('http://localhost:8765/academy/?mock&skiptitle');
  await a.evaluate(() => localStorage.setItem('patrolcity:v1', JSON.stringify({ cs: '1-Alpha-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 99 }, cards: { ch0: 1 }, cfg: { callCine: false } })));
  await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W, null, { timeout: 20000 }); await a.waitForTimeout(2500);
  const clear = async () => { for (let k = 0; k < 8; k++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"]').forEach((x) => x.click()); document.querySelectorAll('.tCard').forEach((x) => x.remove()); const m = document.getElementById('modal'); if (m && !m.hidden) { const b = m.querySelector('#mClose,#mDone,button'); if (b) b.click(); } }); await a.waitForTimeout(150); } };
  await clear(); await a.evaluate(() => { window.__bn = []; const b = document.getElementById('banner'); new MutationObserver(() => { if (!b.hidden) window.__bn.push(b.innerText.replace(/\n/g, ' ')); }).observe(b, { attributes: true, childList: true }); });
  const id = process.argv[2] || 'delgado'; const got = [];
  for (const f of [0, 1, 3, 6]) {
    await a.evaluate(([id, f]) => { const pc = window.__pc; pc.S.npc[id] = f; const r = pc.regs.find((x) => x.n.id === id); pc.npcTalk(r); }, [id, f]);
    await a.waitForTimeout(500);
    let said = '', chose = false;
    for (let k = 0; k < 40 && !said; k++) {
      await a.waitForTimeout(200);
      const st = await a.evaluate(() => { const d = document.querySelector('#dlg'); if (d.hidden) return null; return { ch: [...d.querySelectorAll('.dlgOpts:not(.q) [data-k]')].map((x) => x.innerText), txt: d.innerText }; });
      if (!st) break;
      if (st.ch.length && !chose) { const i = st.ch.findIndex((c) => /How.s it going|Crouch down/.test(c)); await a.evaluate((i) => document.querySelector('#dlg [data-k="' + i + '"]').click(), Math.max(0, i)); chose = true; await a.waitForTimeout(1500); said = await a.evaluate(() => document.querySelector('#dlg').innerText); break; }
      await a.evaluate(() => document.querySelector('#dlg').click()); await a.waitForTimeout(80);
    }
    got.push([f, said.replace(/\n/g, ' ').slice(0, 160)]);
    if (f === 6) { await a.waitForTimeout(900); got.push(['banner', await a.evaluate(() => { const b = document.getElementById('banner'); return b && !b.hidden ? b.innerText.replace(/\n/g, ' ') : 'none'; })]); await a.screenshot({ path: 't83.png' }); }
    for (let k = 0; k < 14; k++) { const open = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return false; const bye = [...d.querySelectorAll('button')].find((x) => /Take care|Back away|Continue|▸|Next/.test(x.innerText)); (bye || d).click(); return true; }); if (!open) break; await a.waitForTimeout(250); }
    if (f === 6) { let bn = 'none'; for (let k = 0; k < 60 && bn === "none"; k++) { await a.waitForTimeout(200); bn = await a.evaluate(() => { const b = document.getElementById('banner'); return b && !b.hidden ? b.innerText.replace(/\n/g, ' ') : 'none'; }); } got.push(['banner after', bn]); console.log('busy', await a.evaluate(() => ({ dlg: document.getElementById('dlg').hidden, modal: document.getElementById('modal').hidden, fe: document.getElementById('fe').hidden, pops: document.querySelectorAll('.tCard, .lorePop, .introCine, .gradCred').length, b: document.getElementById('banner').className }))); console.log('confided', await a.evaluate(() => window.__pc.S.stat.confided)); }
    await clear();
  }
  got.forEach((g) => console.log(g[0], '|', g[1]));
  console.log('tr', await a.evaluate(() => document.getElementById('trToast').hidden + ' ' + document.getElementById('trToast').innerText.slice(0,60)));
  console.log('banners seen', JSON.stringify(await a.evaluate(() => [...new Set(window.__bn)])));
  console.log('heart state', JSON.stringify(await a.evaluate((id) => window.__pc.S.heart && window.__pc.S.heart[id], id)));
  console.log(errs.length ? errs : 'no errors'); await b.close();
})();
