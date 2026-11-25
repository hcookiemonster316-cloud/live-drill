// officer builds: skills + gear + the way you handle calls add up to a style, and the style changes how calls play
// talker: a read of what the person needs before the ways choice; observer: a case-file note per call; driver: longer
// first-on-scene window; by the book: no arguments. Plus the style card on the skill tree and the banner when it lands.
const { chromium } = require('playwright');
const base = { cs: '1-Adam-12', home: 0, unlocked: [0], shift: 'day', unit: 'patrol', xp: 900, calls: 9, sound: false, seenIntro: 1, seenCine: 1, ch: 'vo', tutDone: 1, story: { 0: 1 }, cfg: { callCine: false, text: 'instant', checkEvery: 9999 } };
const SAVES = {
  talker: { skills: { com1: 1, com2: 1 }, ways: { talk: 9 } },
  observer: { skills: { inv1: 1, inv2: 1 }, ways: { observe: 9 } },
  driver: { skills: { pat1: 1, pat2: 1 }, drills: { a: { m: 3, t: 20 }, b: { m: 3, t: 20 } } },
  book: { skills: { tac1: 1, tac2: 1 }, ways: { enforce: 9 } },
  none: { skills: { com1: 1, inv1: 1 } }
};
(async () => { const b = await chromium.launch(); const errs = []; const out = {};
  for (const k of Object.keys(SAVES)) {
    const a = await b.newPage({ viewport: { width: 420, height: 860 } }); a.on('pageerror', (e) => errs.push(k + ': ' + e.message));
    await a.goto('http://localhost:8765/academy/?mock&skiptitle');
    await a.evaluate((s) => localStorage.setItem('patrolcity:v1', JSON.stringify(s)), { ...base, ...SAVES[k] });
    await a.reload(); await a.waitForSelector('#start:not([hidden])'); await a.click('#stGo'); await a.waitForTimeout(300); await a.click('#mDone'); await a.waitForFunction(() => window.__pc && window.__pc.W && window.__pc.BLD, null, { timeout: 20000 });
    const clear = async () => { for (let i = 0; i < 6; i++) { await a.evaluate(() => { document.querySelectorAll('.lorePop [data-a="ok"]').forEach((x) => x.click()); document.querySelectorAll('.tCard').forEach((x) => x.click()); const m = document.getElementById('modal'); if (!m.hidden) { const bt = m.querySelector('#mClose,#mDone,button'); if (bt) bt.click(); } }); await a.waitForTimeout(120); } };
    await clear();
    const r = await a.evaluate(() => { const B = window.__pc.BLD; return { style: B.style(), fast: B.fastWin(), argue: B.argue(.3) }; });
    // the banner arrives from the periodic check
    r.banner = await a.waitForFunction(() => window.__pc.S.build !== undefined && (window.__pc.S.build || null) === window.__pc.BLD.style(), null, { timeout: 9000 }).then(() => a.evaluate(() => window.__pc.S.build || null)).catch(() => 'never');
    // play a few calls and keep every line the scene shows
    const said = new Set(); const olog0 = await a.evaluate(() => (window.__pc.S.olog || []).length);
    for (let n = 0; n < 4; n++) {
      await a.evaluate(() => { const pc = window.__pc; let c = pc.curCall; if (!c) { pc.dispatchCall(); c = pc.curCall; } if (!c) return; pc.dropCall(); delete c.ops; delete c.deesc; c.pre = null; window.__cc = c; pc.openCallScene(c); });
      for (let i = 0, idle = 0; i < 160 && idle < 30; i++) { await a.waitForTimeout(80);
        const st = await a.evaluate(() => { const d = document.getElementById('dlg'); if (d.hidden) return null; const t = d.innerText.replace(/\s+/g, ' '); const qb = [...d.querySelectorAll('.dlgOpts.q [data-k]:not([disabled])')]; if (qb.length) { const q = window.__curQ; (qb.find((x) => +x.dataset.k === q.c) || qb[0]).click(); return t; } const ch = [...d.querySelectorAll('.dlgOpts:not(.q) button:not([disabled])')].filter((x) => !/^\s*Leave\s*$/.test(x.innerText)); const w = ch.find((x) => /Talk it through|Look it over|by the book/.test(x.innerText)); if (w || ch[0]) { (w || ch[0]).click(); return t; } d.click(); return t; });
        if (st == null) idle++; else { idle = 0; said.add(st.slice(0, 200)); } }
      await clear();
    }
    r.lines = said.size; r.ways = [...said].some((x) => /Talk it through|Look it over/.test(x)); 
    r.read = [...said].some((t) => /You can read it:/.test(t));
    r.notes = (await a.evaluate(() => (window.__pc.S.olog || []).length)) - olog0;
    // open the skill tree; anything still queued (a report, a promotion) gets closed first
    for (let i = 0; i < 12 && !(await a.evaluate(() => !!document.querySelector('.bdCard'))); i++) { await clear(); await a.evaluate(() => { const t = document.querySelector('.lkTabs [data-t=skills]'); if (t) t.click(); else { window.__pc.closeModal(); window.__pc.locker('skills'); } }); await a.waitForTimeout(400); }
    await a.waitForSelector('.bdCard', { timeout: 5000 }); r.card = await a.evaluate(() => document.querySelector('.bdCard h4').textContent);
    if (k === 'talker') await a.screenshot({ path: 'tbuilds_card.png' });
    out[k] = r; console.log(k, JSON.stringify(r)); await a.close();
  }
  const want = { talker: (r) => r.style === 'talker' && r.read && r.notes === 0 && /Talker/.test(r.card), observer: (r) => r.style === 'observer' && !r.read && r.notes > 0 && /Observer/.test(r.card),
    driver: (r) => r.style === 'driver' && r.fast === 75 && !r.read, book: (r) => r.style === 'book' && r.argue === 0, none: (r) => r.style === null && r.fast === 40 && r.argue === .3 && !r.read && r.notes === 0 && /Still finding/.test(r.card) };
  Object.keys(want).forEach((k) => { if (!want[k](out[k])) errs.push(k + ' style did not play as designed: ' + JSON.stringify(out[k])); if ((out[k].banner === 'never' ? null : out[k].banner) !== out[k].style) errs.push(k + ' banner/state ' + out[k].banner); });
  console.log(errs.length ? 'ERRORS ' + errs.join(' / ') : 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0); })();
