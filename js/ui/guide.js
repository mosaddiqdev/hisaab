import { state, save } from '../store.js';
import { ui, refresh, reduced, haptic, HAPTIC, invalid, flash } from './state.js';
import { hasOwnPrice, monthPrice } from '../logic.js';
import { ym } from '../utils/date.js';
import { normalizeDigits } from '../utils/format.js';
import { t, arr, lang, setLang, fontReady } from '../i18n.js';

let root = null, list = [], at = 0;

// A tiny non-interactive example week. marks: { dayIndex: { kind: 'miss' | 'spec', label, at } }
const week = (marks = {}) => {
  const days = arr('dowShort');
  return `<div class="g-week" aria-hidden="true">${days.map((d, i) => {
    const m = marks[i], k = m ? m.kind : '';
    return `<div class="g-day ${k}" style="--k:${i}"><small>${d}</small><span class="g-dot ${k}" ${m ? `style="--at:${m.at}"` : ''}>${i + 1}</span><em>${m ? m.label : ''}</em></div>`;
  }).join('')}</div>`;
};

// Language picker: three radio cards, each language named in its own script.
// The badge glyph is the first letter of that script, so the cards read without needing any shared language.
const LANGS = [['en', 'English', 'A'], ['hi', 'हिंदी', 'अ'], ['as', 'অসমীয়া', 'অ']];
const langPickerArt = () => `<div class="g-langs" role="radiogroup" aria-label="Language / भाषा / ভাষা">${LANGS.map(([code, name, glyph], i) => {
  const on = lang() === code;
  return `<button class="g-opt${on ? ' on' : ''}" style="--k:${i}" role="radio" aria-checked="${on}" data-act="guideLang" data-v="${code}">
    <span class="g-glyph" lang="${code}" aria-hidden="true">${glyph}</span>
    <span class="g-opt-name" lang="${code}">${name}</span>
    <span class="g-radio" aria-hidden="true"><svg class="tick" viewBox="0 0 20 20"><path d="M5 10.5l3.5 3.5L15 7"/></svg></span>
  </button>`;
}).join('')}</div>`;

// The language step is decided once, when the guide opens, and never removed while it is open.
// (Before, picking a language rebuilt the list without it, so Back had nowhere to go.)
let withLang = false;

function steps() {
  const price = monthPrice(ym(new Date())), has = hasOwnPrice(ym(new Date()));
  const base = [
    { art: `${week()}<p class="g-total">₹280</p><p class="g-cap">${t('guideExampleCaption')}</p>`,
      title: t('guideTitle1'), body: t('guideBody1'), btn: t('next') },
    { art: `${week({ 2: { kind: 'miss', label: '✕', at: '.7s' }, 4: { kind: 'spec', label: '₹60', at: '1.3s' } })}<p class="g-cap">${t('guideTapCaption')}</p>`,
      title: t('guideTitle2'), body: t('guideBody2'), btn: t('next') },
    has ? { art: '', title: t('guideTitle3set'), body: t('guideBody3set'), btn: t('gotIt') }
        : { art: '', ask: price, title: t('guideTitle3ask'), body: t('guideBody3ask'), btn: t('start') }
  ];
  // Language picker step is prepended for new users only
  if (withLang) {
    return [
      { art: langPickerArt(), title: t('guideLangPickerTitle'), body: t('guideLangPickerBody'), btn: t('next'), isLangStep: true },
      ...base
    ];
  }
  return base;
}

const panel = (s, i) => `<section class="g-step${i ? '' : ' active'}" ${i ? 'inert' : ''} aria-label="${t('guideStep', { n: i + 1, total: list.length })}">
  <div class="g-art ${s.art ? '' : 'none'}">${s.art}</div>
  <div class="g-copy"><h1>${s.title}</h1><p class="body">${s.body}</p>
    ${s.ask !== undefined ? `<div class="money g-money"><span>₹</span><input id="g-price" class="input big" inputmode="decimal" enterkeyhint="done" data-enter="guideNext" aria-label="${t('milkPricePerDay')}" value="${s.ask || ''}"></div>` : ''}</div></section>`;

// The guide lives in its own layer, built once: steps slide along the x-axis and everything else updates in place,
// so nothing is rebuilt (and nothing typed is lost) when the app behind it redraws.
export function mount() {
  if (root) return;
  withLang = !state.langPicked;
  list = steps(); at = 0; ui.guideStep = 0;
  root = document.createElement('div');
  root.className = 'guide'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', t('guideAriaLabel'));
  root.innerHTML = `<div class="g-top"><button class="g-back off" data-act="guideBack" aria-label="${t('ariaBack')}" tabindex="-1">‹</button><button class="link" data-act="guideSkip">${t('skip')}</button></div>
    <div class="g-pager"><div class="g-track" style="--i:0">${list.map(panel).join('')}</div></div>
    <div class="dots" aria-hidden="true">${list.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
    <div class="g-foot"><button class="btn" data-act="guideNext">${list[0].btn}</button></div>`;
  document.getElementById('guide-root').append(root);
  document.body.classList.add('guide-open');
  bindSwipe();
}

function sync() {
  const last = at === list.length - 1;
  root.querySelector('.g-track').style.setProperty('--i', at);
  root.querySelectorAll('.g-step').forEach((el, i) => { el.classList.toggle('active', i === at); el.toggleAttribute('inert', i !== at); });
  root.querySelectorAll('.dots i').forEach((d, i) => d.classList.toggle('on', i === at));
  const back = root.querySelector('.g-back'), skip = root.querySelector('[data-act=guideSkip]'), btn = root.querySelector('[data-act=guideNext]');
  back.classList.toggle('off', at === 0); back.tabIndex = at === 0 ? -1 : 0;
  skip.classList.toggle('off', last); skip.tabIndex = last ? -1 : 0;
  if (btn.textContent !== list[at].btn) { btn.textContent = list[at].btn; btn.classList.remove('swap'); void btn.offsetWidth; btn.classList.add('swap'); }
  ui.guideStep = at;
}

function go(n) {
  at = Math.max(0, Math.min(list.length - 1, n)); sync();
  if (list[at].ask !== undefined) setTimeout(() => root?.querySelector('#g-price')?.focus(), 380); // after the slide settles
}

// A language was tapped: switch the app language and update the guide in place.
// The step list and the current position stay as they are, so Back and the dots keep working.
function pickLang(code) {
  if (code === lang()) return;
  setLang(code);
  state.lang = code; state.langPicked = true; save();
  list = steps();
  const panels = root.querySelectorAll('.g-step');
  // Language step: only the words and the selected card change, so the cards do not replay their entrance.
  root.querySelectorAll('.g-opt').forEach(o => { const on = o.dataset.v === code; o.classList.toggle('on', on); o.setAttribute('aria-checked', on); });
  panels[0].querySelector('h1').textContent = list[0].title;
  panels[0].querySelector('.body').textContent = list[0].body;
  // Every other step is rebuilt in the new language.
  list.slice(1).forEach((s, i) => { panels[i + 1].outerHTML = panel(s, i + 1); });
  root.querySelectorAll('.g-step').forEach((el, i) => { el.classList.toggle('active', i === at); el.toggleAttribute('inert', i !== at); });
  root.querySelectorAll('.g-step').forEach((el, i) => el.setAttribute('aria-label', t('guideStep', { n: i + 1, total: list.length })));
  root.setAttribute('aria-label', t('guideAriaLabel'));
  root.querySelector('[data-act=guideBack]').setAttribute('aria-label', t('ariaBack'));
  root.querySelector('[data-act=guideSkip]').textContent = t('skip');
  const btn = root.querySelector('[data-act=guideNext]'); btn.textContent = list[at].btn;
  fontReady(code);
}

// Drag the pager with a finger: it follows, then snaps to the next or previous step.
function bindSwipe() {
  const pager = root.querySelector('.g-pager'), track = root.querySelector('.g-track');
  let drag = null;
  pager.addEventListener('pointerdown', e => { if (!e.target.closest('input,button')) drag = { x: e.clientX, y: e.clientY, dx: 0, on: false }; });
  pager.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.on) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      if (Math.abs(dx) > 8) { drag.on = true; pager.setPointerCapture?.(e.pointerId); track.style.transition = 'none'; }
    }
    if (drag?.on) {
      drag.dx = dx;
      const edge = (at === 0 && dx > 0) || (at === list.length - 1 && dx < 0); // resist at the ends
      track.style.transform = `translateX(calc(${-at * 100}% + ${dx * (edge ? .25 : 1)}px))`;
    }
  });
  const end = () => {
    if (!drag) return;
    const d = drag; drag = null;
    track.style.transition = ''; track.style.transform = '';
    if (d.on && d.dx < -60 && at < list.length - 1) { haptic(HAPTIC.SELECT); go(at + 1); }
    else if (d.on && d.dx > 60 && at > 0) { haptic(HAPTIC.SELECT); go(at - 1); }
  };
  pager.addEventListener('pointerup', end); pager.addEventListener('pointercancel', end);
}

// Leave: draw Home underneath while the guide still covers it, then fade and zoom the guide away
// so Home is revealed already finished (no flash of the price question).
function leave(reveal) {
  if (!root || root.classList.contains('out')) return;
  state.guideSeen = true;
  if (withLang) { state.lang = lang(); state.langPicked = true; }
  save();
  if (reveal) { ui.enter = true; ui.rollFromZero = true; }
  refresh();
  const node = root, done = () => { node.remove(); if (root === node) root = null; document.body.classList.remove('guide-open'); };
  if (reduced()) return done();
  node.classList.add('out'); setTimeout(done, 320);
}

export const actions = {
  guideNext() {
    const s = list[at];
    if (at < list.length - 1) { haptic(HAPTIC.SELECT); return go(at + 1); }
    if (s.ask === undefined) return leave(false);
    const input = document.getElementById('g-price'), v = parseFloat(normalizeDigits(input.value));
    if (!(v >= 0)) return invalid(input);
    state.monthPrice[ym(new Date())] = v; save(); haptic(HAPTIC.CONFIRM);
    flash(root.querySelector('[data-act=guideNext]'), t('flashSaved'), 450).then(() => leave(true));
  },
  guideBack() { if (at > 0) { haptic(HAPTIC.SELECT); go(at - 1); } },
  guideSkip: () => { haptic(HAPTIC.SELECT); leave(false); },
  guideLang(el) { haptic(HAPTIC.SELECT); pickLang(el.dataset.v); }
};
