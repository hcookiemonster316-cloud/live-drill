// PMPD Connect (owner's call, 2026-11-27): the menus look like a police department's intranet. One shell for every
// menu page: a top bar with the department seal, the page you are on as a breadcrumb, who is signed in and the shift
// clock, and the footer every agency system has ("authorized use only"). Desktop gets a portal with side navigation;
// a phone gets the same pages stacked, with the navigation as a list. Drawn from scratch: the seal is the game's own
// badge, the type is Meridian.
// Loop: the academy is the frame. Reads the cadet (name, call sign, rank) and the clock; every menu page uses it.
const SEAL = '<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M32 3l25 9v19c0 18-11 31-25 38C18 62 7 49 7 31V12z" fill="#f5b800" stroke="#5c3d00" stroke-width="1.6"/><path d="M32 10l19 7v14c0 14-8 24-19 30-11-6-19-16-19-30V17z" fill="#0b1630" stroke="#ffe27a" stroke-width="1.2"/><path d="M32 17l3 6.2 6.8 1-4.9 4.8 1.2 6.8-6.1-3.2-6.1 3.2 1.2-6.8-4.9-4.8 6.8-1z" fill="#ffe27a"/></svg>';

export function installIntranet(X) {
  const esc = X.esc, S = X.S;
  const who = () => S.cs ? (S.lname ? 'Cadet ' + S.lname : 'Cadet') : 'Guest';
  const sub = () => S.cs ? S.cs + ' · ' + X.rank() : 'Not signed in';
  const clock = () => { const h = X.hour(); return String(Math.floor(h)).padStart(2, '0') + String(Math.floor((h % 1) * 60)).padStart(2, '0') + ' hrs'; };
  // the top bar: seal, system name, where you are, who you are
  const top = (crumb) => '<header class="ixTop"><span class="ixSeal">' + SEAL + '</span><div class="ixBrand"><b>PMPD CONNECT</b><small>Port Meridian Police Department · Employee Intranet</small></div>' +
    '<nav class="ixCrumb" aria-label="You are here"><span>Home</span>' + (crumb || []).map((c) => '<i>›</i><span>' + esc(c) + '</span>').join('') + '</nav>' +
    '<div class="ixUser"><span class="ixDot"></span><div><b>' + esc(who()) + '</b><small>' + esc(sub()) + ' · <em class="ixClock">' + clock() + '</em></small></div></div></header>';
  const foot = () => '<footer class="ixFoot"><span>AUTHORIZED USE ONLY · ACTIVITY ON THIS SYSTEM IS LOGGED</span><span>' + esc(X.ver()) + ' · Training simulation, sim rounds only</span></footer>';
  // a whole page: the shell around what a menu already draws
  const page = (crumb, inner, cls) => '<div class="ix' + (cls ? ' ' + cls : '') + '">' + top(crumb) + '<div class="ixBody">' + inner + '</div>' + foot() + '</div>';
  // the clock in the corner keeps time while a page is open (one timer, only while something shows it)
  let tick = 0; function startClock() { clearInterval(tick); tick = setInterval(() => { const els = document.querySelectorAll('.ixClock'); if (!els.length) { clearInterval(tick); tick = 0; return; } const t = clock(); els.forEach((e) => { if (e.textContent !== t) e.textContent = t; }); }, 5000); }
  // the portal home (the title screen): navigation on the left, the day's page on the right
  function home(o) { startClock();
    const bulletins = [['ROLL CALL', 'Day shift musters at 0600. Read your BOLOs before you roll.'], ['TRAINING', 'Every scenario in the Field Immersion Program uses simulation rounds.'], ['RECORDS', 'Reports are read by sergeants, prosecutors and judges. Write them that way.']];
    return page(null, '<aside class="ixNav"><small>Navigation</small><div class="tiMenu"></div></aside>' +
      '<main class="ixMain"><section class="ixHero">' + o.badge + '<div><h1 class="tiLogo"><span>PATROL</span><span>CITY</span><i class="tiShine"></i></h1><p class="tiSub">' + esc(o.sub) + '</p></div></section>' +
      '<p class="ixPitch">' + esc(o.pitch) + '</p><div class="ixAssign"></div>' +
      '<section class="ixBull"><small>Department bulletins</small>' + bulletins.map(([k, t]) => '<div><b>' + k + '</b><span>' + esc(t) + '</span></div>').join('') + '</section>' +
      '<div class="ixTools">' + o.tools + '</div></main>', 'ixHome'); }
  return { page, home, top, foot, startClock };
}
