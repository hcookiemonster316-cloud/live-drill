// Endings that pull you forward (Action plan, Step E). Every shift report ends on what's waiting next time, picked from
// things that will really happen: a court date that comes due, an officer who wants a word about the board, someone
// new on your beat who has been asking about you, or the next step of your case. The person who's been asking really
// is there next shift, marked on the map, and dispatch says so.

export function installHooks(H) {
  const S = H.S, esc = H.esc;
  function pick() {
    const next = H.shiftNo() + 1, out = [];
    const ct = ((S.court && S.court.pend) || []).find((p) => p.due <= next); if (ct) out.push({ k: 'court', w: 9, icon: '⚖️', t: 'Court. You testify on ' + (ct.title || 'your arrest') + ' at ' + ct.where + ', and the defense has read your report.' });
    const nf = H.newFace(); if (nf && Math.random() < .6) out.push({ k: 'face', w: 7, icon: '👋', t: nf.name + ' has been asking about you at ' + nf.where + '. Nobody will say why.', id: nf.id });
    const ow = S.sgt && S.sgt.owed && S.sgt.owed[0]; if (ow) out.push({ k: 'owed', w: 5, icon: '📋', t: ow + ' wants a word about the board last night.' });
    const lh = H.las && H.las(); if (lh) out.push(lh); // Lassiter will find you
    const q = H.activeQ(); if (q && q.step && q.step.goal) out.push({ k: 'case', w: 3, icon: '🗂️', t: (q.side ? q.title + ': ' : 'Your case: ') + q.step.goal + '.' });
    out.sort((a, b) => b.w - a.w); return out[0] || null;
  }
  const html = (h) => (h ? '<div class="nxCard"><small>NEXT SHIFT</small><p><span class="nxI">' + h.icon + '</span>' + esc(h.t) + '</p></div>' : '');
  function close(h) { S.hook = h && h.k === 'face' ? { k: 'face', id: h.id } : null; H.saveS(); }
  function onShiftStart() { const h = S.hook; if (!h) return; S.hook = null; H.saveS(); if (h.k === 'face') H.later(() => H.faceCalls(h.id), 5000); }
  return { pick, html, close, onShiftStart };
}
