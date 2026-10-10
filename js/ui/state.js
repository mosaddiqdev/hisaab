import { reduced, haptic, HAPTIC } from './env.js';

// Shared UI state and small feedback helpers.
export const ui = {
  tab: 'home', cursor: new Date(), settingsMonth: null, guideStep: 0,
  sheet: null, confirm: null, select: null, openedAt: 0, closing: false,
  calDir: 0, setDir: 0, dockIn: false, enter: false, rollFromZero: false, switching: false,   // one-shot animation hints, cleared after each draw
  changed: null, lastSeg: undefined, lastNum: undefined, calLast: undefined
};
export const refresh = () => document.dispatchEvent(new Event('refresh'));
export const openSheet = day => { ui.sheet = day; ui.openedAt = Date.now(); refresh(); };

// Switch tabs with the "fade through" pattern: the old page fades out first (90ms), then the new one fades in (see draw in main.js).
export async function goTab(tab) {
  if (tab === ui.tab) return;
  haptic(HAPTIC.SELECT);
  ui.tab = tab;
  document.dispatchEvent(new Event('navchange')); // the tab bar pill starts sliding right away
  if (ui.switching) return;                         // quick taps: the latest tab wins
  ui.switching = true;
  const page = document.querySelector('#view > .page');
  if (page && !reduced()) await page.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 70, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
  ui.switching = false;
  refresh();
}
export { reduced, haptic, HAPTIC };
export { toast } from './toast.js';

// Ask before doing something that can't be undone: { title, body, ok, danger, run }
export const askConfirm = c => { ui.confirm = c; ui.openedAt = Date.now(); refresh(); };

// A wrong value: shake, red border, short double buzz.
export function invalid(el) {
  el.classList.remove('invalid'); void el.offsetWidth; el.classList.add('invalid');
  el.setAttribute('aria-invalid', 'true'); el.focus(); haptic(HAPTIC.ERROR);
}

// Turn a button into a drawn checkmark for a moment, then restore it.
export function flash(btn, label = 'Saved', ms = 900) {
  if (!btn) return Promise.resolve();
  const html = btn.innerHTML;
  btn.classList.add('ok'); btn.disabled = true;
  btn.innerHTML = `<svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>${label}`;
  return new Promise(done => setTimeout(() => { btn.classList.remove('ok'); btn.disabled = false; btn.innerHTML = html; done(); }, ms));
}

// Fade a piece of text out, swap it, fade it back in. A change reads as one calm moment instead of a flash.
export function fadeSwap(el, apply) {
  if (reduced()) return apply();
  const out = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, easing: 'ease-in', fill: 'forwards' });
  out.finished.then(() => { apply(); el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 170, easing: 'ease-out' }); out.cancel(); }).catch(() => {});
}
