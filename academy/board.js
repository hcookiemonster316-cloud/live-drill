// Decisions beyond the menu (Action plan, Step A). A decision on a call is made in the scene, not from a list: the
// choices sit on the thing you'd actually use. Behind the wheel that's the brake, the gas, the wheel, the horn, the
// light and siren switches, the radio handset, the mirror, the road ahead or the clipboard; walking around the car it's
// the tires, the lights, the glass, the engine bay, what's underneath and the inspection form. Each action carries the
// control's icon and its number, and the same number sits on that control in the drawing: tap the control or the action.
// Drawn from scratch as inline SVG in the game's colors (deep-ink outlines, no third-party art).
// Feeds the same decision system as before (same facts, same scoring, same right and wrong outcomes); reads the lesson
// to pick the scene.

const RULES = [ // first match wins: [control, pattern]
  ['wait', /^(ignore|skip|leave (it|them)|do nothing|say nothing|wait)\b/i],
  ['self', /\beat|drink|coffee|meal|nap|sleep|rest\b|water|energy|snack|squint/i],
  ['door', /approach|walk up|step out|get out|on foot|stay in the car/i],
  ['horn', /\bhonk|\bhorn\b/i],
  ['radio', /radio|dispatch|\bcall (it |in|for|out)|advise|request (a |backup|another)|ask for (backup|help|a unit)|\bair it\b/i],
  ['lights', /siren|light bar|lights? and siren|emergency (mode|lights)|code 3|high beam|low beam|headlight|blue lights|flash(er|ers)/i],
  ['form', /\bform\b|write it|in writing|the report|report it|comments|\bnote (the|it)|document|log it/i],
  ['mirror', /mirror|blind spot|behind you|over your shoulder|rear view/i],
  ['brake', /\bbrake|\bstop\b|stop (short|at|before|and)|slow(ly)? down|\bslow\b|ease off|lift off|pump/i],
  ['wheel', /grip|steer|swerve|\bturn (the|into|toward|away|left|right|hard|in)|change lanes|lane change|merge|\bcut (in|across|over)|pull (over|off|onto|right|left|in)|counter/i],
  ['shift', /revers|back (up|out|in|into|it)|\bgear\b|\bpark (it|the car|on|in|and)|put it in/i],
  ['gas', /keep (on )?driving|drive on|speed|accelerat|\bgas\b|faster|floor it|pass (the|him|her|on)|keep up|catch up|drive (at|faster|the limit)/i],
  ['eyes', /follow the car|look|watch|scan|check|glance|eyes|keep (your )?distance|follow(ing)? (at|distance|gap)|seconds? (gap|behind)/i],
  ['wait', /wait|let (him|her|them|it)|stay put|hold (your|back|position)|do nothing|nothing|ignore|skip|leave it|say nothing|until/i],
  ['hands', /tape|wrap|spray|squeeze|fix it|tighten|clean|pull it (free|out)/i]
];
const WALK = [
  ['wait', /^(ignore|skip|leave (it|them)|do nothing|say nothing|wait|mention)\b/i],
  ['tires', /tire|tread|psi|pressure|rim|wheel|sidewall|lug/i],
  ['lights', /light|bulb|lamp|siren|lens|reflector/i],
  ['glass', /windshield|mirror|wiper|glass|window/i],
  ['engine', /hood|oil|fluid|leak|coolant|battery|engine|belt|hose|dipstick/i],
  ['under', /under|branch|debris|puddle|drip|beneath/i],
  ['radio', /radio/i],
  ['form', /\bform\b|report|comments|write|note|document|maintenance|shop|supervisor|sergeant/i],
  ['seat', /seat|belt|cage|trunk|equipment|first aid|kit|inside|interior|dash|gauge|fuel/i],
  ['drive', /drive|road|take it|go out|get on|move the car/i],
  ['hands', /tape|wrap|spray|squeeze|buff|fix it|tighten|knock|rotate|top (it )?off|add air|let (a little )?air|pull it|clean/i],
  ['look', /inspect|walk (the|around)|check|look|find out|see if|doorjamb|sticker/i],
  ['wait', /ignore|leave (it|them)|skip|say nothing|nothing|wait|let it|until|mention|ask (the|a|him|her)/i]
];
const ICON = { horn: '📯', radio: '📻', lights: '🚨', form: '📋', mirror: '🪞', brake: '🛑', wheel: '🛞', shift: '🚗', gas: '🦶', eyes: '👀', wait: '✋', tires: '🛞', glass: '🪞', engine: '🔧', under: '🔦', seat: '💡', drive: '🚓', hands: '🔧', look: '👀', self: '☕', door: '🚶' };
// where each control sits in the drawing (percent of the board)
const AT = { cockpit: { eyes: [50, 30], mirror: [50, 8], wheel: [21, 60], horn: [30, 74], brake: [12, 92], gas: [21, 92], lights: [50, 66], radio: [68, 74], shift: [57, 90], form: [85, 84], wait: [41, 56], hands: [76, 58], self: [62, 56], door: [5, 60] },
  walk: { tires: [33, 22], lights: [50, 47], glass: [50, 28], engine: [50, 10], under: [50, 92], form: [87, 52], seat: [50, 64], drive: [14, 36], hands: [62, 14], look: [68, 40], wait: [14, 74], radio: [14, 52] } };

const INK = '#0c1428';
const ART = {
  cockpit: '<rect width="400" height="150" fill="#101b34"/>' +
    // the road through the windshield
    '<path d="M70 4h260l38 78H32z" fill="#3b4a6b" stroke="' + INK + '" stroke-width="3"/><path d="M70 4h260l14 30H56z" fill="#6f8fbf"/>' +
    '<path d="M200 34L196 82h8z" fill="#f5d36a"/><path d="M150 34L104 82h10l42-48zM250 34l46 48h-10l-42-48z" fill="#e8edf6" opacity=".8"/><rect x="186" y="40" width="28" height="16" rx="4" fill="#9a3b3b" stroke="' + INK + '" stroke-width="2"/>' +
    // mirror, dash, wheel, pedals, console, radio, shifter, clipboard
    '<rect x="170" y="2" width="60" height="14" rx="5" fill="#2a3550" stroke="' + INK + '" stroke-width="2.5"/>' +
    '<path d="M0 80h400v70H0z" fill="#1b2540"/><path d="M0 80h400v10H0z" fill="#26324f"/>' +
    '<circle cx="120" cy="112" r="32" fill="none" stroke="' + INK + '" stroke-width="9"/><circle cx="120" cy="112" r="32" fill="none" stroke="#3a4766" stroke-width="5"/><circle cx="120" cy="112" r="10" fill="#3a4766" stroke="' + INK + '" stroke-width="2.5"/><path d="M110 112H90M130 112h20M120 122v18" stroke="#3a4766" stroke-width="5"/>' +
    '<rect x="36" y="130" width="22" height="14" rx="3" fill="#4a5677" stroke="' + INK + '" stroke-width="2"/><rect x="76" y="128" width="10" height="18" rx="3" fill="#4a5677" stroke="' + INK + '" stroke-width="2"/>' +
    '<rect x="178" y="92" width="44" height="14" rx="4" fill="#2a3550" stroke="' + INK + '" stroke-width="2"/><circle cx="190" cy="99" r="4" fill="#ef4444"/><circle cx="210" cy="99" r="4" fill="#3b82f6"/>' +
    '<rect x="258" y="100" width="30" height="24" rx="6" fill="#2a3550" stroke="' + INK + '" stroke-width="2.5"/><rect x="264" y="106" width="18" height="6" rx="2" fill="#7dd3fc" opacity=".7"/><path d="M286 104c12-6 14 10 4 14" fill="none" stroke="' + INK + '" stroke-width="3"/>' +
    '<rect x="223" y="126" width="10" height="22" rx="4" fill="#3a4766" stroke="' + INK + '" stroke-width="2"/><circle cx="228" cy="124" r="7" fill="#4a5677" stroke="' + INK + '" stroke-width="2"/>' +
    '<rect x="320" y="110" width="44" height="36" rx="4" fill="#c8a46a" stroke="' + INK + '" stroke-width="2.5"/><rect x="326" y="118" width="32" height="24" fill="#eef2fa"/><path d="M330 124h24M330 130h20M330 136h22" stroke="#94a3b8" stroke-width="2"/><rect x="334" y="106" width="16" height="7" rx="2" fill="#64748b" stroke="' + INK + '" stroke-width="1.5"/>',
  walk: '<rect width="400" height="150" fill="#2c3a52"/><path d="M0 128h400" stroke="#f5d36a" stroke-width="3" stroke-dasharray="14 10" opacity=".6"/>' +
    '<ellipse cx="200" cy="142" rx="70" ry="7" fill="#0b1222" opacity=".55"/>' +
    // a cruiser seen from above, nose at the top
    '<rect x="150" y="6" width="100" height="128" rx="26" fill="#eef2fa" stroke="' + INK + '" stroke-width="3.5"/><rect x="158" y="14" width="84" height="26" rx="10" fill="#1f2a44"/>' +
    '<path d="M162 36h76l-6 14h-64z" fill="#7dd3fc" stroke="' + INK + '" stroke-width="2.5"/><rect x="164" y="62" width="72" height="10" rx="3" fill="' + INK + '"/><rect x="168" y="64" width="30" height="6" rx="2" fill="#ef4444"/><rect x="202" y="64" width="30" height="6" rx="2" fill="#3b82f6"/>' +
    '<rect x="166" y="78" width="68" height="30" rx="6" fill="#1f2a44"/><path d="M164 112h72l-4 12h-64z" fill="#7dd3fc" opacity=".8" stroke="' + INK + '" stroke-width="2"/>' +
    '<rect x="138" y="22" width="14" height="26" rx="5" fill="#111827" stroke="' + INK + '" stroke-width="2"/><rect x="248" y="22" width="14" height="26" rx="5" fill="#111827" stroke="' + INK + '" stroke-width="2"/><rect x="138" y="96" width="14" height="26" rx="5" fill="#111827" stroke="' + INK + '" stroke-width="2"/><rect x="248" y="96" width="14" height="26" rx="5" fill="#111827" stroke="' + INK + '" stroke-width="2"/>' +
    '<circle cx="160" cy="10" r="4" fill="#fde68a"/><circle cx="240" cy="10" r="4" fill="#fde68a"/>' +
    '<rect x="322" y="50" width="52" height="64" rx="4" fill="#c8a46a" stroke="' + INK + '" stroke-width="2.5"/><rect x="328" y="60" width="40" height="48" fill="#eef2fa"/><path d="M333 68h30M333 76h24M333 84h28M333 92h20" stroke="#94a3b8" stroke-width="2"/>' +
    '<path d="M40 70l18-14 18 14v26H40z" fill="#3a4766" stroke="' + INK + '" stroke-width="2.5"/><path d="M50 96V80h16v16" fill="#1f2a44"/>'
};

// the control a choice uses, or null
export function controlOf(text, layout) { const R = layout === 'walk' ? WALK : RULES; for (const [k, re] of R) if (re.test(text)) return k; return null; }
// the scene that fits more of the choices: the walk-around for the car itself, the driver's seat for driving
export function layoutFor(q) { const n = (lay) => q.opts.filter((o) => controlOf(o, lay)).length, w = n('walk'), c = n('cockpit'); return w > c || (w === c && q.les === 0) ? 'walk' : 'cockpit'; }
// a scene board for a decision, or null when its choices don't map onto the scene (then it stays a plain list)
export function boardOf(q) {
  if (!q || !q.act || q.multi || !q.opts || q.opts.length < 2) return null;
  const lay = layoutFor(q), raw = q.opts.map((o) => controlOf(o, lay)); if (raw.filter((k) => !k).length >= 2 || new Set(raw).size === 1) return null; // recall, not an action: stays a list
  const ks = raw.map((k) => k || (lay === 'walk' ? 'look' : 'eyes'));
  const used = {}; const pins = ks.map((k, i) => { const n = (used[k] = (used[k] || 0) + 1) - 1, at = AT[lay][k] || [50, 50]; return { k, x: Math.max(6, Math.min(94, at[0] + (n % 2 ? 1 : -1) * Math.ceil(n / 2) * 7)), y: Math.max(8, Math.min(92, at[1] - (n ? 6 : 0))) }; });
  return { lay, ks, pins };
}
export function boardHTML(q, esc) {
  const b = boardOf(q); if (!b) return null;
  return { scene: '<div class="dlgBoard" data-lay="' + b.lay + '"><svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + ART[b.lay] + '</svg>' +
      b.pins.map((p, i) => '<button type="button" class="bdPin" data-pk="' + i + '" style="left:' + p.x + '%;top:' + p.y + '%" aria-label="' + esc(q.opts[i]) + '">' + (i + 1) + '</button>').join('') + '</div>',
    opt: (o, k) => '<span class="kk">' + (k + 1) + '</span><span class="ot">' + ICON[b.ks[k]] + ' ' + esc(o) + '</span>' };
}
