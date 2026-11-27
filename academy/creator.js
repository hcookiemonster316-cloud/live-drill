// The cadet creator (owner's call, 2026-11-27): who you are on the street. Male or female, skin tone, a hairstyle a
// training academy would pass at inspection (no loose hair past the collar: buns, a French twist, braids pinned up,
// a short bob; high-and-tight, crew cut, side part, flat top, shaved), hair color, a trimmed mustache or none, and
// what you wear off duty. Two live previews show you in uniform and in your own clothes. It opens for a new career
// (and once for a save that predates it), and any time from the Field Journal.
// Loop: your career is yours -> you see yourself in every scene, portrait and ride -> off duty looks like you off
// duty. Reads and writes S.me and S.skin; the people renderer (pixelfolk.js) draws the result.

export const HAIR_M = [['buzz', 'High and tight'], ['short', 'Crew cut'], ['side', 'Side part'], ['flattop', 'Flat top'], ['shaved', 'Shaved'], ['bald', 'Bald']];
export const HAIR_F = [['bun', 'Low bun'], ['updo', 'French twist'], ['braids', 'Braids, pinned up'], ['bob', 'Short bob'], ['short', 'Pixie cut']];
export const SKINS = ['#f3d4b5', '#e8b98f', '#c68e63', '#a86b45', '#7d4a2b', '#5a3320'];
export const HAIRC = [['#1a1a1a', 'Black'], ['#3b2416', 'Dark brown'], ['#6b4226', 'Brown'], ['#8a3b1e', 'Auburn'], ['#c9a35a', 'Blonde'], ['#9ca3af', 'Gray']];
export const OFF = [['tee', 'T-shirt and jeans', '#334155'], ['hoodie', 'Hoodie', '#3f3f46'], ['button', 'Button-down', '#6b5a48'], ['jacket', 'Jacket', '#1f2937'], ['tank', 'Gym clothes', '#1f2937', true], ['dress', 'Sundress', '#334155', false, 'f']];
export const OFFC = ['#2563eb', '#b91c1c', '#15803d', '#f5f5f5', '#111827', '#7c3aed', '#d97706', '#0e7490'];

export function installCreator(H) {
  const S = H.S, esc = H.esc;
  function open(done, first) {
    const d = JSON.parse(JSON.stringify(Object.assign({ sex: 'm', hst: 'short', hair: '#1a1a1a', beard: null, off: { top: 'tee', shirt: S.civShirt || '#2563eb', pants: '#334155' } }, S.me || {}))); let skin = S.skin || '#c68e63';
    const opt = (k, v, label, on, extra) => '<button type="button" class="ccOpt' + (on ? ' on' : '') + '" data-k="' + k + '" data-v="' + esc(String(v)) + '"' + (extra || '') + '>' + label + '</button>';
    const sw = (k, v, on, title) => '<button type="button" class="ccSw' + (on ? ' on' : '') + '" data-k="' + k + '" data-v="' + v + '" title="' + esc(title || '') + '" aria-label="' + esc(title || v) + '" style="--c:' + v + '"></button>';
    const draw = () => {
      const hairs = d.sex === 'f' ? HAIR_F : HAIR_M; if (!hairs.some((h) => h[0] === d.hst)) d.hst = hairs[0][0]; if (d.sex === 'f') d.beard = null;
      if (d.sex === 'm' && d.off.top === 'dress') d.off.top = 'tee';
      H.openModal('<div class="sceneHead"><b>' + (first ? 'NEW CADET' : 'YOUR CADET') + '</b><h2>Who walks into roll call?</h2><p>Academy grooming standards apply: hair stays off the collar, and facial hair is a trimmed mustache or nothing.</p></div>' +
        '<div class="cc"><div class="ccPrev"><figure><canvas id="ccOn" width="150" height="150"></canvas><figcaption>On duty</figcaption></figure><figure><canvas id="ccOff" width="150" height="150"></canvas><figcaption>Off duty</figcaption></figure></div><div class="ccRows">' +
        '<div class="ccRow"><b>You are</b><div>' + opt('sex', 'm', 'Male', d.sex === 'm') + opt('sex', 'f', 'Female', d.sex === 'f') + '</div></div>' +
        '<div class="ccRow"><b>Skin tone</b><div>' + SKINS.map((c, i) => sw('skin', c, c === skin, 'Tone ' + (i + 1))).join('') + '</div></div>' +
        '<div class="ccRow"><b>Hair</b><div>' + hairs.map(([v, n]) => opt('hst', v, n, d.hst === v)).join('') + '</div></div>' +
        '<div class="ccRow"><b>Hair color</b><div>' + HAIRC.map(([c, n]) => sw('hair', c, c === d.hair, n)).join('') + '</div></div>' +
        (d.sex === 'm' ? '<div class="ccRow"><b>Mustache</b><div>' + opt('beard', '', 'None', !d.beard) + opt('beard', 'mustache', 'Trimmed mustache', !!d.beard) + '</div></div>' : '') +
        '<div class="ccRow"><b>Off duty</b><div>' + OFF.filter((o) => !o[4] || o[4] === d.sex).map(([v, n]) => opt('off', v, n, d.off.top === v)).join('') + '</div></div>' +
        '<div class="ccRow"><b>Off-duty color</b><div>' + OFFC.map((c) => sw('offc', c, c === d.off.shirt)).join('') + '</div></div>' +
        '</div></div><div class="qAct"><button type="button" id="ccDone">' + (first ? 'Report for roll call' : 'Done') + '</button></div>');
      document.querySelectorAll('.cc [data-k]').forEach((b) => b.onclick = () => { const k = b.dataset.k, v = b.dataset.v;
        if (k === 'sex') d.sex = v; else if (k === 'skin') skin = v; else if (k === 'hst') d.hst = v; else if (k === 'hair') d.hair = v; else if (k === 'beard') d.beard = v || null;
        else if (k === 'off') { const o = OFF.find((x) => x[0] === v); d.off.top = v; d.off.pants = o[2]; d.off.shorts = !!o[3]; } else if (k === 'offc') d.off.shirt = v; draw(); });
      document.getElementById('ccDone').onclick = () => { S.me = d; S.skin = skin; S.civShirt = d.off.shirt; H.saveS(); H.changed(); H.closeModal(); if (done) done(); };
      preview(document.getElementById('ccOn'), H.lookFor(d, skin, false)); preview(document.getElementById('ccOff'), H.lookFor(d, skin, true));
    };
    draw();
  }
  // a full-length preview, redrawn until the sprite is ready
  function preview(cv, look) { let n = 0; const go = () => { if (!cv.isConnected) return; const ok = H.drawFull(cv, look); if (!ok && ++n < 15) setTimeout(go, 120); }; go(); }
  return { open };
}
