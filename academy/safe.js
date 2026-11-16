// Reliability: rolling save backups with restore, a cloud save you can carry to another device with a recovery code,
// graceful offline play, and an in-game problem report.
const KEY = 'patrolcity:v1', BAK = 'patrolcity:bak:';
export function backups() { const out = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(BAK) === 0) out.push(k); } } catch (e) {} return out.sort().reverse(); }
// called by the loader when the main save is missing or damaged
export function newestBackup() { for (const k of backups()) { try { const s = JSON.parse(localStorage.getItem(k)); if (s && s.cs) return s; } catch (e) {} } return null; }

export function installSafe(H) {
  const S = H.S, esc = H.esc;
  // ================= 12. rolling backups =================
  function snapshot(force) {
    try { const raw = localStorage.getItem(KEY); if (!raw || raw.length < 50) return; const d = new Date(), stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + String(d.getHours()).padStart(2, '0');
      const k = BAK + stamp; if (!force && localStorage.getItem(k)) return; localStorage.setItem(k, raw);
      // keep the 8 newest hourly copies, but always keep at least one copy from each of the last 3 days
      const all = backups(), keepDays = new Set(); all.forEach((x, i) => { const day = x.slice(BAK.length, BAK.length + 8); if (i < 8) return; if (!keepDays.has(day) && keepDays.size < 3) { keepDays.add(day); return; } localStorage.removeItem(x); });
    } catch (e) { /* storage full: drop the oldest backup and carry on */ const all = backups(); if (all.length > 2) try { localStorage.removeItem(all[all.length - 1]); } catch (er) {} }
  }
  setInterval(() => snapshot(false), 10 * 60000); setTimeout(() => snapshot(false), 15000);
  const label = (k) => { const s = k.slice(BAK.length), d = new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(9, 11)), days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 864e5); return (days === 0 ? 'Today' : days === 1 ? 'Yesterday' : d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })) + ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric' }); };
  const summary = (s) => { try { return (s.cs || '?') + ' · ' + (s.xp || 0) + ' RP · ' + (s.calls || 0) + ' calls · ' + Object.keys(s.lore || {}).length + ' lore'; } catch (e) { return ''; } };
  function savesPanel(back) {
    const el = H.fe(); el.hidden = false; el.className = 'fe menuBg'; const list = backups();
    const draw = () => {
      el.innerHTML = '<div class="feCard"><div class="feHead"><span>Options</span><h2>Saves &amp; backups</h2></div><p class="lkSum">Your game saves automatically. A backup copy is kept every hour for the last few days, right here on this device.</p>' +
        '<div class="svList">' + (list.length ? list.map((k) => { let s = null; try { s = JSON.parse(localStorage.getItem(k)); } catch (e) {} return '<div class="svRow"><div><b>' + esc(label(k)) + '</b><small>' + esc(summary(s || {})) + '</small></div><button type="button" class="feBtn ghost" data-rs="' + esc(k) + '">Restore</button></div>'; }).join('') : '<p class="lkSum">No backups yet. The first one is made a few seconds after you start playing.</p>') + '</div>' +
        '<div class="jSec"><b>☁️ Cloud save</b></div><p class="lkSum">Play on another device: save to the cloud, then enter your recovery code there.' + (S.cloudCode ? '<br>Your recovery code: <b class="svCode">' + esc(S.cloudCode) + '</b>' + (S.cloudT ? ' · last saved ' + new Date(S.cloudT).toLocaleString() : '') : '') + '</p>' +
        '<div class="feBtns"><button type="button" class="feBtn" id="svCloud">' + (S.cloudCode ? 'Save to cloud now' : 'Turn on cloud save') + '</button></div><div class="svLoad"><input id="svCode" maxlength="8" autocomplete="off" spellcheck="false" placeholder="Recovery code"><button type="button" class="feBtn ghost" id="svLoad">Load</button></div>' +
        '<div class="feBtns"><button type="button" class="feBtn ghost" id="svBack">Back</button></div></div>';
      el.querySelectorAll('[data-rs]').forEach((b) => b.onclick = () => { if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'Tap again to restore'; return; } try { snapshot(true); localStorage.setItem(KEY, localStorage.getItem(b.dataset.rs)); location.reload(); } catch (e) { H.toast('Could not restore that backup.'); } });
      H.$('svCloud').onclick = async () => { const ok = await cloudSave(true); H.toast(ok ? '☁️ Saved to the cloud. Code: ' + S.cloudCode : 'Cloud save is offline right now. Your device save is safe.'); draw(); };
      H.$('svLoad').onclick = () => { const b = H.$('svLoad'), code = (H.$('svCode').value || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (code.length !== 8) { H.toast('Recovery codes are 8 characters.'); return; } cloudLoad(code, b); };
      H.$('svBack').onclick = () => { back ? back() : (el.hidden = true); };
    };
    draw();
  }
  // ================= 12b. cloud save with a recovery code =================
  const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const newCode = () => { let c = ''; const a = new Uint32Array(8); crypto.getRandomValues(a); a.forEach((v) => { c += ALPH[v % ALPH.length]; }); return c; };
  async function cloudSave(force) {
    const net = H.net(); if (!net || !navigator.onLine) return false; if (!S.cloudCode) { if (!force) return false; S.cloudCode = newCode(); }
    try { const raw = localStorage.getItem(KEY) || JSON.stringify(S); if (raw.length > 590000) return false; await net.gset('mmo/save/' + S.cloudCode, { v: raw, c: (S.cs || 'cadet').slice(0, 20).padEnd(3, '-'), t: Date.now() }); S.cloudT = Date.now(); H.saveS(); return true; } catch (e) { return false; }
  }
  async function cloudLoad(code, btn) {
    const net = H.net(); if (!net) { H.toast('You need to be online to load a cloud save.'); return; }
    try { const v = await net.gget('mmo/save/' + code); if (!v || !v.v) { H.toast('No cloud save found for ' + code + '.'); return; } const s = JSON.parse(v.v);
      if (btn && btn.dataset.sure !== code) { btn.dataset.sure = code; btn.textContent = 'Load ' + (s.cs || 'save') + ' · ' + (s.xp || 0) + ' RP?'; H.toast('Tap again to load it. Your current game is backed up first.'); return; }
      snapshot(true); s.cloudCode = code; localStorage.setItem(KEY, JSON.stringify(s)); location.reload(); } catch (e) { H.toast('Could not load that cloud save.'); }
  }
  setInterval(() => { if (S.cloudCode) cloudSave(false); }, 5 * 60000);

  // ================= 13. offline =================
  const chip = document.createElement('div'); chip.className = 'offChip'; chip.hidden = true; chip.innerHTML = '<i></i><span>Offline · your progress is saving on this device. Multiplayer will reconnect on its own.</span>'; document.body.appendChild(chip);
  let wasOff = false;
  function onlineCheck() { const off = !navigator.onLine; chip.hidden = !off; if (off && !wasOff) { wasOff = true; H.saveS(); } else if (!off && wasOff) { wasOff = false; H.toast('📶 Back online. Multiplayer reconnected.'); if (S.cloudCode) cloudSave(false); H.reconnect(); } }
  addEventListener('online', onlineCheck); addEventListener('offline', onlineCheck); setTimeout(onlineCheck, 2000);

  // ================= 14. problem reports =================
  const ERRS = []; addEventListener('error', (e) => { ERRS.push((e.message || '') + ' @ ' + (e.filename || '').split('/').pop() + ':' + e.lineno); if (ERRS.length > 20) ERRS.shift(); });
  addEventListener('unhandledrejection', (e) => { ERRS.push('promise: ' + String(e.reason && e.reason.message || e.reason).slice(0, 160)); if (ERRS.length > 20) ERRS.shift(); });
  function reportPanel(back) {
    let shot = ''; try { const cv = H.$('view'), t = document.createElement('canvas'), k = 480 / Math.max(cv.width, cv.height); t.width = Math.round(cv.width * k); t.height = Math.round(cv.height * k); t.getContext('2d').drawImage(cv, 0, 0, t.width, t.height); shot = t.toDataURL('image/jpeg', .6); } catch (e) {}
    const el = H.fe(); el.hidden = false; el.className = 'fe menuBg';
    el.innerHTML = '<div class="feCard"><div class="feHead"><span>Help</span><h2>Report a problem</h2></div><p class="lkSum">Tell us what happened. A screenshot and some game details are attached automatically.</p>' +
      '<div class="seg" id="rpKind">' + [['bug', 'Something broke'], ['stuck', 'I\'m stuck'], ['fact', 'A fact looks wrong'], ['idea', 'Idea']].map(([k, t], i) => '<button type="button" data-k="' + k + '" class="' + (i ? '' : 'on') + '">' + t + '</button>').join('') + '</div>' +
      '<textarea id="rpTxt" maxlength="1500" placeholder="What were you doing, and what went wrong?"></textarea>' + (shot ? '<img class="rpShot" src="' + shot + '" alt="Screenshot of the game">' : '') +
      '<div class="feBtns"><button type="button" class="feBtn ghost" id="rpBack">Cancel</button><button type="button" class="feBtn" id="rpSend">Send report</button></div></div>';
    let kind = 'bug'; el.querySelectorAll('#rpKind button').forEach((b) => b.onclick = () => { kind = b.dataset.k; el.querySelectorAll('#rpKind button').forEach((x) => x.classList.toggle('on', x === b)); });
    H.$('rpBack').onclick = () => { back ? back() : (el.hidden = true); };
    H.$('rpSend').onclick = async () => {
      const m = H.$('rpTxt').value.trim(); if (!m) { H.toast('Add a sentence about what happened first.'); return; }
      const st = JSON.stringify({ v: H.version, d: H.W ? H.W.did : null, pos: H.P ? [Math.round(H.P.x), Math.round(H.P.y)] : null, inside: H.inside ? H.W.key : null, q: H.activeTitle(), story: S.story, xp: S.xp, ua: navigator.userAgent.slice(0, 120), scr: innerWidth + 'x' + innerHeight, q2: S.cfg && S.cfg.quality, errs: ERRS.slice(-10) }).slice(0, 11900);
      const net = H.net(), rep = { m, k: kind, c: (S.cs || 'cadet').slice(0, 20), t: Date.now(), s: st, i: shot.length < 159000 ? shot : '', u: net ? String(net.uid).slice(0, 128) : '' };
      let ok = false; if (net && navigator.onLine) { try { await net.gset('mmo/bugs/' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), rep); ok = true; } catch (e) {} }
      if (!ok) { try { const q = JSON.parse(localStorage.getItem('patrolcity:bugq') || '[]'); q.push(rep); localStorage.setItem('patrolcity:bugq', JSON.stringify(q.slice(-3))); } catch (e) {} }
      H.toast(ok ? '✅ Report sent. Thank you!' : '📮 Saved. It will send next time you\'re online.'); H.stat('bugReport'); back ? back() : (el.hidden = true);
    };
  }
  // send any reports that were saved while offline
  setTimeout(async () => { const net = H.net(); if (!net || !navigator.onLine) return; let q = []; try { q = JSON.parse(localStorage.getItem('patrolcity:bugq') || '[]'); } catch (e) {} if (!q.length) return; for (const r of q) { try { await net.gset('mmo/bugs/' + r.t.toString(36) + Math.random().toString(36).slice(2, 7), r); } catch (e) { return; } } localStorage.removeItem('patrolcity:bugq'); }, 20000);
  return { savesPanel, reportPanel, cloudSave, snapshot };
}
