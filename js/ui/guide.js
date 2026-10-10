import { state, save } from '../store.js';
import { ui, refresh, reduced, haptic, HAPTIC, invalid, flash } from './state.js';
import { hasOwnPrice, monthPrice } from '../logic.js';
import { ym } from '../utils/date.js';
import { normalizeDigits } from '../utils/format.js';
import { t, arr, lang, setLang } from '../i18n.js';

let root = null, list = [], at = 0;

// A tiny non-interactive example week. marks: { dayIndex: { kind: 'miss' | 'spec', label, at } }
const week = (marks = {}) => {
  const days = arr('dowShort');
  return `<div class="g-week" aria-hidden="true">${days.map((d, i) => {
    const m = marks[i], k = m ? m.kind : '';
    return `<div class="g-day ${k}" style="--k:${i}"><small>${d}</small><span class="g-dot ${k}" ${m ? `style="--at:${m.at}"` : ''}>${i + 1}</span><em>${m ? m.label : ''}</em></div>`;
  }).join('')}</div>`;
};

// Language picker art — three large buttons, each language named in its own script
const langPickerArt = () => `<div class="g-lang-pick" aria-hidden="true">
  <button class="btn ${lang() === 'en' ? '' : 'btn-outline'}" data-act="guideLangEn">English</button>
  <button class="btn ${lang() === 'hi' ? '' : 'btn-outline'}" data-act="guideLangHi">हिंदी</button>
  <button class="btn ${lang() === 'as' ? '' : 'btn-outline'}" data-act="guideLangAs">অসমীয়া</button>
</div>`;

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
  if (!state.langPicked) {
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

// After language is picked from guide: rebuild list with the new language's strings and re-render
function pickLang(code) {
  setLang(code);
  state.lang = code; state.langPicked = true; save();
  // Rebuild the guide content with the chosen language's strings
  list = steps(); // state.langPicked is now true, so lang step is gone
  // Re-render everything in the guide
  const track = root.querySelector('.g-track'), dots = root.querySelector('.dots'), foot = root.querySelector('.g-foot');
  track.innerHTML = list.map(panel).join('');
  dots.innerHTML = list.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('');
  foot.querySelector('[data-act=guideNext]').textContent = list[0].btn;
  root.setAttribute('aria-label', t('guideAriaLabel'));
  at = 0; sync();
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
  state.guideSeen = true; save();
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
  guideLangEn() { pickLang('en'); },
  guideLangHi() { pickLang('hi'); },
  guideLangAs() { pickLang('as'); }
};
