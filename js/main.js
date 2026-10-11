import { state, save } from './store.js';
import { ui, refresh, openSheet, haptic, HAPTIC, goTab, reduced } from './ui/state.js';
import { icons } from './ui/icons.js';
import { lang, setLang, detectLang, fontReady, t } from './i18n.js';
import * as home from './ui/home.js';
import * as calendar from './ui/calendar.js';
import * as settings from './ui/settings.js';
import * as sheet from './ui/sheet.js';
import * as guide from './ui/guide.js';

const TABS = [['home', home], ['calendar', calendar], ['settings', settings]];
const view = document.getElementById('view'), tabs = document.getElementById('tabs'), overlay = document.getElementById('overlay-root');

// One name, one handler: a duplicate would silently replace another screen's action.
const actions = {};
for (const group of [home.actions, calendar.actions, settings.actions, sheet.actions, guide.actions, { tab: el => goTab(el.dataset.tab) }]) {
  for (const name of Object.keys(group)) {
    if (actions[name]) throw new Error(`Duplicate action name: ${name}`);
    actions[name] = group[name];
  }
}

// The tab bar is built once and never replaced, so its slide can run to the end.
// (Rebuilding it on every draw cut the animation off halfway.) Only the labels are updated, for language changes.
const tabKeyMap = { home: 'tabHome', calendar: 'tabCalendar', settings: 'tabSettings' };
tabs.innerHTML = `<i class="tab-ind" aria-hidden="true"></i>` + TABS.map(([id]) =>
  `<button class="tab" data-act="tab" data-tab="${id}">${icons[id]}<span class="lbl"></span></button>`).join('');
function setNav() {
  tabs.dataset.i = TABS.findIndex(([id]) => id === ui.tab);
  tabs.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-current', b.dataset.tab === ui.tab ? 'page' : 'false'));
}
function setTabLabels() {
  tabs.querySelectorAll('.tab').forEach(b => {
    const label = t(tabKeyMap[b.dataset.tab]);
    b.setAttribute('aria-label', label);
    const lbl = b.querySelector('.lbl'); if (lbl.textContent !== label) lbl.textContent = label;
  });
}

document.addEventListener('navchange', setNav);
let lastTab = ui.tab;
function draw() {
  setTabLabels();

  const current = TABS.find(t => t[0] === ui.tab)[1];
  view.innerHTML = current.render();
  const switched = ui.tab !== lastTab;
  if (switched) { lastTab = ui.tab; view.scrollTop = 0; }
  if (switched || ui.enter) view.firstElementChild?.classList.add('enter'); // new tab or a big content change: fade the page in
  ui.enter = false;
  setNav();
  overlay.innerHTML = sheet.render();
  current.enter?.();
  ui.changed = null;
}
document.addEventListener('refresh', draw);

// Listen for language changes: re-render the current screen with new language
document.addEventListener('langchange', e => {
  state.lang = e.detail.lang; save(); draw();
});

// ---- Taps
let longPressed = false, moved = false;
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  if (el.dataset.act === 'openDay' && (longPressed || moved)) { longPressed = moved = false; return; } // the hold already opened the sheet, or the finger dragged
  actions[el.dataset.act]?.(el);
});
document.addEventListener('change', e => { const el = e.target.closest('[data-change]'); if (el) settings.changes[el.dataset.change]?.(el); });

// ---- Press and hold a day: the circle shrinks slowly while holding, then the sheet opens.
// A little finger wobble is fine; moving more than 10px cancels (that is a scroll or swipe).
let timer, hold = null, down = null;
const cancelHold = () => { clearTimeout(timer); hold?.el.classList.remove('arming'); hold = null; };
document.addEventListener('pointerdown', e => {
  longPressed = moved = false; down = { x: e.clientX, y: e.clientY };
  const el = e.target.closest('[data-day]');
  if (!el || ui.select) return;
  hold = { el, x: e.clientX, y: e.clientY };
  el.classList.add('arming');
  haptic(HAPTIC.TAP);
  timer = setTimeout(() => { longPressed = true; const day = el.dataset.day; cancelHold(); haptic(HAPTIC.CONFIRM); openSheet(day); }, 450);
});
document.addEventListener('pointermove', e => {
  if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) moved = true;
  if (hold && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 10) cancelHold();
});
['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, cancelHold));
document.addEventListener('contextmenu', e => { if (e.target.closest('[data-day]')) e.preventDefault(); });

// ---- Swipe the calendar grid sideways to change month
let swipe = null;
document.addEventListener('pointerdown', e => { if (e.target.closest('.cal-grid')) swipe = { x: e.clientX, y: e.clientY }; });
document.addEventListener('pointerup', e => {
  if (!swipe) return;
  const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y; swipe = null;
  if (Math.abs(dx) > 60 && Math.abs(dy) < 45) actions[dx < 0 ? 'next' : 'prev']();
});
document.addEventListener('pointercancel', () => { swipe = null; });

// ---- Drag the top of a sheet down to dismiss it
let drag = null;
document.addEventListener('pointerdown', e => {
  const h = e.target.closest('.sheet-drag');
  if (!h || e.target.closest('button')) return;
  drag = { y: e.clientY, dy: 0, el: h.closest('.sheet') };
  drag.el.style.transition = 'none';
});
document.addEventListener('pointermove', e => {
  if (!drag) return;
  drag.dy = Math.max(0, e.clientY - drag.y);
  drag.el.style.transform = `translateY(${drag.dy}px)`;
});
const endDrag = () => {
  if (!drag) return;
  const { el, dy } = drag; drag = null;
  if (dy > 90) return sheet.actions.dismiss();
  el.style.transition = 'transform .25s cubic-bezier(.16,1,.3,1)'; el.style.transform = '';
};
['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, endDrag));

// ---- Keyboard: Enter runs the action named in data-enter; a bad value clears its red state when edited
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset?.enter) actions[e.target.dataset.enter](); });
document.addEventListener('input', e => { if (e.target.classList?.contains('invalid')) { e.target.classList.remove('invalid'); e.target.removeAttribute('aria-invalid'); } });
// The sheet lifts above the on-screen keyboard
if (window.visualViewport) {
  const vv = visualViewport, fit = () => document.documentElement.style.setProperty('--kb', Math.max(0, innerHeight - vv.height - vv.offsetTop) + 'px');
  vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit);
}

// Boot: set language before first draw
if (state.langPicked) {
  setLang(state.lang || 'en');
} else {
  setLang(detectLang());
}

draw();
// Launch: stay hidden for a moment (at most ~0.5s) so the fonts are in place and nothing jumps, then settle in with a gentle stagger.
const html = document.documentElement;
const fonts = document.fonts
  ? Promise.race([
      Promise.all([
        document.fonts.load('500 24px Fraunces'),
        document.fonts.load('400 16px Inter'),
        fontReady(lang())
      ]),
      new Promise(r => setTimeout(r, 450))
    ])
  : Promise.resolve();
fonts.catch(() => {}).then(() => {
  html.classList.remove('booting');
  if (!reduced()) { html.classList.add('boot'); setTimeout(() => html.classList.remove('boot'), 1100); }
  if (!state.guideSeen) guide.mount();
});
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
