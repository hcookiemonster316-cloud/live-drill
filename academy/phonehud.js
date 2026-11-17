// Phone HUD: on a portrait phone the HUD gets out of the way of the city.
// - one slim status strip on top; the radio is a one-line ticker that fades out after a few seconds (tap it for the full log)
// - shift orders, cases and the combo sit together in one row of chips instead of three floating cards
// - everything you press lives at the bottom, in thumb reach; Locker and Sound move into the Menu, pinch replaces the zoom buttons
// - tap the clock for Clean view: only the city, the objective and the action bar
export function installPhoneHud(H) {
  const $ = (id) => document.getElementById(id), body = document.body;
  const mq = matchMedia('(max-width:620px) and (orientation:portrait)');
  let wrap = null;
  const apply = () => {
    const on = mq.matches; body.classList.toggle('phHud', on);
    if (on) {
      if (!wrap) { wrap = document.createElement('div'); wrap.id = 'hChips'; wrap.className = 'hChips'; body.appendChild(wrap); }
      ['orders', 'qTrack', 'hCombo'].forEach((id) => { const e = $(id); if (e && e.parentNode !== wrap) { e.style.top = ''; wrap.appendChild(e); } });
    } else if (wrap) [...wrap.children].forEach((e) => body.insertBefore(e, wrap));
    try { body.classList.toggle('phClean', on && localStorage.getItem('patrolcity:clean') === '1'); } catch (e) {}
  };
  mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply); apply();

  // the radio ticker: show the newest line, then fade so the street shows through
  const r = $('radio'); let t = 0;
  if (r) {
    new MutationObserver(() => { r.classList.add('fresh'); clearTimeout(t); t = setTimeout(() => r.classList.remove('fresh'), 7000); }).observe(r, { childList: true });
    r.addEventListener('click', () => { if (body.classList.contains('phHud')) { const b = $('bRadio'); if (b) b.click(); } });
  }
  // Clean view
  const sh = document.querySelector('.hShift');
  if (sh) sh.addEventListener('click', () => {
    if (!body.classList.contains('phHud')) return; const on = !body.classList.contains('phClean'); body.classList.toggle('phClean', on);
    try { localStorage.setItem('patrolcity:clean', on ? '1' : ''); } catch (e) {}
    if (H.toast) H.toast(on ? 'Clean view. Tap the clock to bring the HUD back.' : 'Full HUD');
  });
  return { on: () => body.classList.contains('phHud') };
}
