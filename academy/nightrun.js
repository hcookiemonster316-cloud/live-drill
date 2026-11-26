// Shift Rotation (Action plan, Step E; renamed from Night Shift so it can't be mistaken for the night shift you pick).
// Unlocked by graduating: one short, hard, scored shift. Each run rotates to the next shift (day, mid, night), in a
// random district you've opened, in rough weather (rain, fog or a storm), with calls coming faster. It plays as a
// normal shift (everything counts for the career; your own shift is put back after), and at end of watch you get a
// Shift Rotation score and your best. Started from the title menu, which explains it before you start.

export function installNightRun(H) {
  const S = H.S, esc = H.esc;
  const WX = [['rain', 'Rain all shift. Grip is down and stops are longer.'], ['fog', 'Fog off the river. Low beams and short sight lines.'], ['storm', 'A summer storm. Lightning, flooding, everything slower.']];
  const ROT = [['day', 'Day shift'], ['mid', 'Midshift'], ['night', 'Night shift']]; // the rotation, one step per run
  let run = null;
  const active = () => !!run;
  function begin() { // called once the shift has loaded
    if (S.nightRun !== 1) return false; const ds = (S.unlocked || [0]).slice(), did = ds[(Math.random() * ds.length) | 0], wx = WX[(Math.random() * WX.length) | 0];
    const sh = ROT[(S.nightRuns || 0) % ROT.length];
    run = { did, wx: wx[0], calls0: S.calls || 0, t0: Date.now(), shift: sh[0], prev: S.shift }; S.nightRun = run; S.shift = sh[0]; H.saveS();
    const go = () => { H.weather(wx[0]); H.setClock(0); H.banner('🔄', 'Shift Rotation · ' + sh[1], H.dname(did) + '. ' + wx[1] + ' Calls come fast this shift.'); };
    if (H.did() !== did) H.travel(did, go); else go(); return true; }
  // calls come about 60% faster on a rotation run
  const pace = () => (run ? 1.6 : 1);
  function score(r) { return Math.round(r.calls * 120 + r.acc * 600 + ({ S: 400, A: 250, B: 120, C: 40, D: 0 })[r.grade]); }
  // end of watch: the score card for the report, then the run is over
  function finish(grade, acc) { if (!run) return ''; const calls = (S.calls || 0) - run.calls0, sc = score({ calls, acc, grade }), best = S.nightBest || 0, nb = sc > best; if (nb) S.nightBest = sc; S.nightRuns = (S.nightRuns || 0) + 1;
    const shName = (ROT.find((x) => x[0] === run.shift) || ROT[2])[1]; if (run.prev) S.shift = run.prev; /* your own shift back */ run = null; S.nightRun = null; H.saveS(); setTimeout(() => { const b = document.querySelector('.nrShare'); if (b) b.onclick = () => H.share({ kick: 'SHIFT ROTATION · ' + shName.toUpperCase(), icon: '🔄', title: sc + ' points', sub: S.cs + ' · ' + (nb ? 'a new best' : 'best ' + best), rows: [['🚓', calls + ' calls cleared'], ['✅', Math.round(acc * 100) + '% answered right'], ['⭐', 'Grade ' + grade]], file: 'shift-rotation' }); }, 50);
    return '<div class="nxCard nrCard"><small>SHIFT ROTATION · ' + esc(shName.toUpperCase()) + '</small><p><span class="nxI">🔄</span><b>' + sc + '</b>&nbsp;points · ' + calls + ' calls · ' + Math.round(acc * 100) + '% right · grade ' + grade + '</p><p>' + (nb ? 'New best.' : 'Best: ' + best + '.') + ' Next rotation: ' + ROT[(S.nightRuns || 0) % ROT.length][1].toLowerCase() + ', from the title screen.</p><button type="button" class="ghost nrShare">Share this run</button></div>'; }
  function resume() { if (S.nightRun && S.nightRun.did != null && !run) run = S.nightRun; } // a reload mid-run keeps the run
  return { begin, pace, finish, active, resume, score };
}
