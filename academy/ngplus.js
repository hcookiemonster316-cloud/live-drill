// New Game+: after graduating, replay as a Field Training Officer with a trainee riding along.
// Harder questions (select-all-that-apply, no second tries), remixed calls, more pay, and an FTO title track.
import { SIDE_CAST } from './sidequests.js';
SIDE_CAST.trainee = { name: 'Probationary Officer Tran', icon: '🔰', role: 'Your trainee' };
const TRAINEE = [
  '(over the radio) Tran here. Why did you park there instead of right in front? …Oh. So you can see the whole scene. Got it.',
  '(over the radio) Tran, writing this down. You let them talk first. That calmed everything down.',
  '(over the radio) Can I take the next one? I\'ll do it exactly how you did. Maybe slower.',
  '(over the radio) My FTO at the academy said never stand in a doorway. You never stand in a doorway. I see it now.',
  '(over the radio) Tran. Quick question for later: how do you remember all the radio codes? Asking for me.',
  '(over the radio) That was textbook. I\'m telling Castillo you said I helped. I didn\'t. I\'m telling her anyway.'
];
const TRACK = [[10, 'Field Training Officer', { stripe: '#14b8a6', text: 'FTO' }], [30, 'Senior FTO', null], [60, 'Master FTO', { stripe: '#f5b800', text: 'MASTER FTO' }]];
export function installNGPlus(H) {
  const S = H.S, esc = H.esc;
  const on = () => !!S.fto;
  function panel(back) {
    const el = H.fe(); el.hidden = false; el.className = 'fe menuBg'; let sure = false;
    const draw = () => {
      el.innerHTML = '<div class="feCard"><div class="feHead"><span>New Game+</span><h2>Field Training Officer</h2></div>' +
        '<p class="lkSum">You graduated. Now you train the next one. Start the story again as an FTO with Probationary Officer Tran riding along.</p>' +
        '<div class="ngList"><div>🧠 <b>Harder questions.</b> Select-all-that-apply, and no second tries.</div><div>📻 <b>Remixed calls.</b> More priority ones, and your trainee is watching everything you do.</div><div>💵 <b>25% more RP</b> on every call.</div><div>🏷️ <b>FTO title track:</b> Field Training Officer, Senior FTO, Master FTO, plus two car skins.</div><div>🎒 <b>You keep</b> your gear, cosmetics, titles, trophies, friends and field journal. The story chapters, side cases and the Ledger start fresh.</div></div>' +
        (S.ng ? '<p class="lkSum">You have started New Game+ ' + S.ng + ' time' + (S.ng > 1 ? 's' : '') + '.</p>' : '') +
        '<div class="feBtns"><button type="button" class="feBtn ghost" id="ngBack">Not yet</button><button type="button" class="feBtn" id="ngGo">' + (sure ? 'Tap again to begin' : 'Begin as an FTO') + '</button></div><p class="lkSum">Your current save is backed up first. You can restore it from Saves &amp; Backups.</p></div>';
      H.$('ngBack').onclick = () => { back ? back() : (el.hidden = true); };
      H.$('ngGo').onclick = () => { if (!sure) { sure = true; draw(); return; } begin(); };
    };
    draw();
  }
  function begin() {
    H.snapshot(); const keep = { cs: S.cs };
    S.ng = (S.ng || 0) + 1; S.fto = true; S.ftoCalls = 0; S.story = {}; S.side = {}; S.flags = {}; S.clues = {}; S.cards = {}; S.track = 'main'; S.endingNow = {}; S.graduatedOnce = S.graduated || S.graduatedOnce; S.graduated = null; S.cs = keep.cs;
    H.saveS(); H.reload();
  }
  function cameo() { if (!on() || Math.random() > .45) return null; return ['trainee', TRAINEE[Math.floor(Math.random() * TRAINEE.length)]]; }
  function callCleared() {
    if (!on()) return; S.ftoCalls = (S.ftoCalls || 0) + 1;
    TRACK.forEach(([n, title, skin]) => { if (S.ftoCalls === n) { S.titles = S.titles || {}; S.titles[title] = 1; if (skin) { S.carSkins = S.carSkins || {}; S.carSkins['fto' + n] = skin; } H.banner('🎖️', title, 'FTO title unlocked' + (skin ? ' · car skin: ' + skin.text : '') + '.'); H.stat('fto' + n); } });
    H.saveS();
  }
  function remix(c) { if (!on()) return c; const out = c.slice(); if (out[1] === 2 && Math.random() < .3) out[1] = 1; return out; }
  return { on, panel, cameo, callCleared, remix, mult: () => (on() ? 1.25 : 1), TRACK };
}
