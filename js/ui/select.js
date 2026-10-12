// Select: a dropdown list that matches the app (the native <select> does not).
// Markup comes from select(); behaviour is one set of delegated actions, so it survives screens being redrawn.
// Picking a value fires a 'selectchange' event on document: { id, value }.
// Keyboard: Enter / Space / ArrowDown open it, arrows move, Enter picks, Escape closes. Screen readers get a listbox.
import { esc } from '../utils/format.js';
import { haptic, HAPTIC } from './env.js';

const CHEVRON = '<svg class="sel-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const TICK = '<svg class="sel-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// items: [value, label, lang?]. Give a lang for labels written in their own script, so they use the right font.
export function select({ id, label, value, items }) {
  const cur = items.find(([v]) => String(v) === String(value)) || items[0], dom = `sel-${id}`;
  const lang = l => (l ? ` lang="${l}"` : '');
  return `<div class="field select-field"><span id="${dom}-label">${label}</span>
    <div class="select" data-select="${id}">
      <button type="button" class="select-btn" id="${dom}" data-act="selectToggle" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${dom}-label ${dom}">
        <span class="sel-val"${lang(cur[2])}>${cur[1]}</span>${CHEVRON}</button>
      <ul class="select-pop" role="listbox" tabindex="-1" aria-labelledby="${dom}-label">${items.map(([v, l, lg], i) =>
        `<li role="option" id="${dom}-o${i}" data-act="selectPick" data-v="${esc(v)}" aria-selected="${String(v) === String(cur[0])}"${lang(lg)}><span>${l}</span>${TICK}</li>`).join('')}</ul>
    </div></div>`;
}

const popOf = root => root.querySelector('.select-pop');
const opts = root => [...root.querySelectorAll('[role=option]')];

function close(root, refocus) {
  if (!root.classList.contains('open')) return;
  root.classList.remove('open');
  const btn = root.querySelector('.select-btn'); btn.setAttribute('aria-expanded', 'false');
  popOf(root).removeAttribute('aria-activedescendant');
  if (refocus) btn.focus();
}
const closeAll = except => document.querySelectorAll('.select.open').forEach(r => { if (r !== except) close(r); });

function setActive(root, i) {
  const list = opts(root); if (!list.length) return;
  i = (i + list.length) % list.length;
  list.forEach((o, n) => o.classList.toggle('active', n === i));
  popOf(root).setAttribute('aria-activedescendant', list[i].id);
  list[i].scrollIntoView({ block: 'nearest' });
}

function open(root) {
  closeAll(root);
  root.classList.add('open');
  const btn = root.querySelector('.select-btn'), pop = popOf(root);
  btn.setAttribute('aria-expanded', 'true');
  // Open upwards when there is no room below (leave space for the tab bar).
  const r = btn.getBoundingClientRect(), need = pop.offsetHeight + 8;
  root.classList.toggle('up', innerHeight - r.bottom - 96 < need && r.top > need);
  const sel = opts(root).findIndex(o => o.getAttribute('aria-selected') === 'true');
  setActive(root, Math.max(0, sel));
  pop.focus({ preventScroll: true });
  haptic(HAPTIC.TAP);
}

function pick(root, li) {
  const value = li.dataset.v;
  opts(root).forEach(o => o.setAttribute('aria-selected', o === li));
  const val = root.querySelector('.sel-val');
  val.innerHTML = li.querySelector('span').innerHTML;
  li.lang ? val.setAttribute('lang', li.lang) : val.removeAttribute('lang');
  close(root, true);
  haptic(HAPTIC.SELECT);
  document.dispatchEvent(new CustomEvent('selectchange', { detail: { id: root.dataset.select, value } }));
}

export const actions = {
  selectToggle(el) { const root = el.closest('.select'); root.classList.contains('open') ? close(root) : open(root); },
  selectPick(el) { pick(el.closest('.select'), el); }
};

// Outside tap and keyboard handling, registered once.
export function initSelect() {
  document.addEventListener('click', e => { if (!e.target.closest('.select')) closeAll(); });
  document.addEventListener('keydown', e => {
    const root = e.target.closest?.('.select'); if (!root) return;
    const isOpen = root.classList.contains('open'), list = opts(root);
    const cur = Math.max(0, list.findIndex(o => o.id === popOf(root).getAttribute('aria-activedescendant')));
    if (!isOpen) {
      if (e.target.closest('.select-btn') && ['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); open(root); }
      return; // Enter and Space already click the button
    }
    if (e.key === 'Escape') { e.preventDefault(); close(root, true); }
    else if (e.key === 'Tab') close(root);
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(root, cur + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(root, cur - 1); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(root, 0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(root, list.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(root, list[cur]); }
  });
}
