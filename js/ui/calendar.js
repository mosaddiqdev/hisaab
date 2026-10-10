import { state, save } from '../store.js';
import { ui, refresh, openSheet, toast, haptic, HAPTIC, goTab, fadeSwap } from './state.js';
import { dayInfo, monthSummary, monthPrice, hasOwnPrice, bulkSet, setDay, canPrev, canNext } from '../logic.js';
import { ymd, daysInMonth, monthName } from '../utils/date.js';
import { fmt, num } from '../utils/format.js';
import { t, nPlural, arr, lang } from '../i18n.js';
import { digits, animateRoll } from './roll.js';

const KINDS = ['normal', 'missed', 'special'];
const keyOf = (y, m) => `${y}-${String(m + 1).padStart(2, '0')}`;

// Current month: so far. Past month: final. Future month: planned.
function figures(y, m, now) {
  const last = new Date(y, m + 1, 0), cur = y === now.getFullYear() && m === now.getMonth();
  const full = monthSummary(y, m, last), sofar = cur ? monthSummary(y, m, now) : full;
  return { cur, future: !cur && ymd(last) >= ymd(now), full, s: sofar };
}

export function render() {
  const DOW = arr('dowShort');
  const [sy, sm] = state.startMonth.split('-').map(Number);
  if (ui.cursor < new Date(sy, sm - 1, 1)) ui.cursor = new Date(sy, sm - 1, 1);
  const now = new Date(), y = ui.cursor.getFullYear(), m = ui.cursor.getMonth(), key = keyOf(y, m), today = ymd(now);
  const { cur, future, full, s } = figures(y, m, now), sel = ui.select, n = sel ? sel.size : 0;
  const ws = state.weekStart || 0, lead = (new Date(y, m, 1).getDay() - ws + 7) % 7, cells = [];
  // The old circles are still on screen while this runs. A day that changed is drawn as it WAS and flipped to how it IS
  // in enter(), so its colour fades (no jump, no zoom) and a day you hand-picked or un-picked fades too.
  const was = {};
  document.querySelectorAll('.cd[data-day]').forEach(el => { was[el.dataset.day] = { kind: KINDS.find(c => el.classList.contains(c)), sel: el.classList.contains('sel'), mark: el.querySelector('em').textContent }; });
  for (let i = 0; i < lead; i++) cells.push('<span></span>');
  for (let d = 1; d <= daysInMonth(y, m); d++) {
    const dt = new Date(y, m, d), k = ymd(dt), i = dayInfo(dt), on = sel && sel.has(k);
    const mShort = arr('monthsShort')[m];
    const note = i.kind === 'missed' ? `, ${t('noMilk').toLowerCase()}` : i.kind === 'special' ? `, ${t('special').toLowerCase()} ${t('setPrice').toLowerCase()} ${i.amount}` : '';
    const ariaLabel = i.kind === 'missed'
      ? t('ariaDayNoMilk', { day: d, month: mShort })
      : i.kind === 'special'
        ? t('ariaDaySpecial', { day: d, month: mShort, amount: i.amount })
        : t('ariaDayNote', { day: d, month: mShort });
    const mark = i.kind === 'special' ? fmt(i.amount) : i.kind === 'missed' ? '✕' : '', w = was[k];
    const flip = w && (w.kind !== i.kind || w.sel !== !!on || w.mark !== mark), from = flip ? w : { kind: i.kind, sel: !!on, mark };
    cells.push(`<button class="cd ${from.kind} ${k === today ? 'today' : ''} ${k > today ? 'future' : ''} ${from.sel ? 'sel' : ''}" ${flip ? `data-flip="${i.kind}" data-sel="${on ? 1 : 0}" data-mark="${mark}"` : ''}
      data-act="openDay" data-day="${k}" ${sel ? `aria-pressed="${!!on}"` : ''} aria-label="${ariaLabel}">
      <span class="dot">${d}</span><em>${from.mark}</em></button>`);
  }
  const label = future ? t('calLabelPlanned') : cur ? t('calLabelSoFar') : t('calLabelTotal');
  const total = future ? full.total : s.total, str = num(total), prev = ui.calLast && ui.calLast.key === key ? ui.calLast.str : undefined;
  const swap = ui.calDir ? 'swap' : '';
  const price = hasOwnPrice(key)
    ? `<button class="inline" data-act="editPrice" data-key="${key}">${fmt(monthPrice(key))}/day <b>${t('edit')}</b></button>`
    : `<button class="inline warn" data-act="editPrice" data-key="${key}">${t('calSetPriceBtn')}</button>`;
  const specialCount = full.special ? ` · ${full.special}` : '';
  const missedCount = full.missed ? ` · ${full.missed}` : '';
  const orderedDow = [...DOW.slice(ws), ...DOW.slice(0, ws)];
  return `<section class="page cal">
    <div class="cal-top"><h1 class="${swap}">${monthName(m)} ${y}</h1>
      <div class="cal-nav"><button class="icon-btn" data-act="prev" aria-label="${t('ariaPrevMonth')}" ${canPrev(key) ? '' : 'disabled'}>‹</button>
      <button class="icon-btn" data-act="next" aria-label="${t('ariaNextMonth')}" ${canNext(key) ? '' : 'disabled'}>›</button></div></div>
    <div class="cal-sum"><p class="cal-total ${swap}" role="img" aria-label="${t('ariaCalTotal', { amount: fmt(total), label })}"><span class="cur" aria-hidden="true">₹</span><span class="num" aria-hidden="true" data-key="${key}" data-str="${str}">${digits(str, prev)}</span><span class="cal-label">${label}</span></p>
      ${cur ? '' : `<button class="pill" data-act="today">${t('calTodayPill')}</button>`}</div>
    <div class="cal-grid ${ui.calDir ? (ui.calDir > 0 ? 'to-next' : 'to-prev') : ''}">${orderedDow.map(x => `<span class="cal-dow">${x}</span>`).join('')}${cells.join('')}</div>
    <p class="legend"><span class="lg-items"><span><i class="lg special"></i>${t('legendSpecial')}${specialCount}</span>
      ${state.trackMissed ? `<span><i class="lg missed"></i>${t('legendNoMilk')}${missedCount}</span>` : ''}</span>${price}</p>
    ${sel ? `<div class="dock ${ui.dockIn ? 'rise' : ''}"><div class="dock-top"><p><b class="sel-count">${n ? nPlural('calSelectedDays', n) : t('calTapTheDays')}</b></p>
        <button class="link" data-act="cancelSelect">${t('cancel')}</button></div>
      <div class="sheet-alt" style="--n:${state.trackMissed ? 3 : 2}">
        ${state.trackMissed ? `<button class="btn btn-outline" data-act="selMissed" ${n ? '' : 'disabled'}>${t('noMilk')}</button>` : ''}
        <button class="btn" data-act="selPrice" ${n ? '' : 'disabled'}>${t('setPrice')}</button>
        <button class="btn btn-outline" data-act="selNormal" ${n ? '' : 'disabled'}>${t('normal')}</button></div></div>`
    : `<div class="cal-actions"><button class="btn btn-outline" data-act="selectMode">${t('calSelectDays')}</button>
      ${future ? '' : `<button class="btn btn-outline" data-act="share" data-y="${y}" data-m="${m}">${t('calShareBill')}</button>`}</div>`}
  </section>`;
}

export function enter() {
  ui.calDir = 0; ui.dockIn = false;
  document.querySelectorAll('.cd[data-flip]').forEach(el => {
    const kind = el.dataset.flip, mark = el.dataset.mark, em = el.querySelector('em');
    void el.offsetWidth;
    el.classList.remove(...KINDS); el.classList.add(kind); el.classList.toggle('sel', el.dataset.sel === '1');   // colours fade (motion.css)
    if (em.textContent !== mark) fadeSwap(em, () => { em.textContent = mark; });
    ['flip', 'sel', 'mark'].forEach(a => el.removeAttribute('data-' + a));
  });
  const box = document.querySelector('.cal-total .num');
  if (box) { animateRoll(box); ui.calLast = { key: box.dataset.key, str: box.dataset.str }; }
}

function billText(y, m) {
  // Determine the language for the bill
  const billLang = (state.billLang && state.billLang !== 'app') ? state.billLang : lang();
  const bt = (key, vars) => t(key, vars, billLang);
  const ba = key => arr(key, billLang);

  const now = new Date(), { cur, s } = figures(y, m, now), lim = ymd(cur ? now : new Date(y, m + 1, 0));
  const mon = ba('monthsShort')[m];
  const fullMonthName = ba('monthsLong')[m];
  const missed = [], special = [];
  for (let d = 1; d <= daysInMonth(y, m) && ymd(new Date(y, m, d)) <= lim; d++) {
    const i = dayInfo(new Date(y, m, d));
    if (i.kind === 'missed') missed.push(d);
    if (i.kind === 'special') special.push(`${d} ${mon} ${fmt(i.amount)}`);
  }
  const lines = [cur ? bt('billTitleSoFar', { appName: bt('appName'), month: fullMonthName, year: y }) : bt('billTitle', { appName: bt('appName'), month: fullMonthName, year: y })];
  if (state.milkman) lines.push(bt('billMilkman', { name: state.milkman }));
  lines.push(bt('billPrice', { amount: fmt(monthPrice(keyOf(y, m))) }));
  lines.push(bt('billDelivered', { days: s.days - s.missed }));
  if (state.trackMissed && missed.length) {
    const noMilkStr = nPlural('billNoMilk', missed.length, billLang).replace('{dates}', missed.join(', ')).replace('{mon}', mon);
    lines.push(noMilkStr);
  }
  if (special.length) lines.push(bt('billSpecial', { items: special.join(', ') }));
  lines.push(bt('billTotal', { amount: fmt(s.total) }));
  return lines.join('\n');
}

const go = n => {
  const key = keyOf(ui.cursor.getFullYear(), ui.cursor.getMonth());
  if (n < 0 ? !canPrev(key) : !canNext(key)) return;
  haptic(HAPTIC.SELECT);
  ui.cursor = new Date(ui.cursor.getFullYear(), ui.cursor.getMonth() + n, 1); ui.calDir = n; refresh();
};
const apply = (entry, toastKey) => {
  const keys = [...ui.select], before = keys.map(k => [k, state.days[k] ? { ...state.days[k] } : null]);
  bulkSet(keys, entry); save(); haptic(HAPTIC.DOUBLE); ui.select = null; refresh();
  const msg = nPlural(toastKey, keys.length);
  toast.success(msg, {
    action: { label: t('undo'), onClick() { before.forEach(([k, v]) => setDay(k, v)); save(); haptic(HAPTIC.SELECT); refresh(); } }
  });
};
// Selecting updates the circle and the panel in place, so the circle can animate instead of the whole grid redrawing.
function syncDock() {
  const n = ui.select.size, dock = document.querySelector('.dock');
  if (!dock) return;
  dock.querySelector('.sel-count').textContent = n ? nPlural('calSelectedDays', n) : t('calTapTheDays');
  dock.querySelectorAll('.sheet-alt .btn').forEach(b => { b.disabled = !n; });
}

export const actions = {
  prev: () => go(-1), next: () => go(1),
  today() {
    const now = new Date(), d = now.getFullYear() * 12 + now.getMonth() - (ui.cursor.getFullYear() * 12 + ui.cursor.getMonth());
    ui.cursor = new Date(now.getFullYear(), now.getMonth(), 1); ui.calDir = d >= 0 ? 1 : -1; refresh();
  },
  openDay(el) {
    if (!ui.select) return openSheet(el.dataset.day);
    const k = el.dataset.day, on = !ui.select.has(k);
    on ? ui.select.add(k) : ui.select.delete(k);
    el.classList.toggle('sel', on); el.setAttribute('aria-pressed', on); haptic(HAPTIC.SELECT); syncDock();
  },
  selectMode() { ui.select = new Set(); ui.dockIn = true; haptic(HAPTIC.SELECT); refresh(); },
  cancelSelect() { ui.select = null; haptic(HAPTIC.SELECT); refresh(); },
  selMissed: () => apply({ missed: true }, 'toastMarkedNoMilk'),
  selNormal: () => apply(null, 'toastBackToNormal'),
  selPrice() { if (ui.select.size) openSheet([...ui.select].sort()); },
  editPrice(el) { ui.settingsMonth = el.dataset.key; goTab('settings'); },
  async share(el) {
    const text = billText(+el.dataset.y, +el.dataset.m);
    try {
      if (navigator.share) { await navigator.share({ title: t('appName'), text }); haptic(HAPTIC.SELECT); }
      else { await navigator.clipboard.writeText(text); haptic(HAPTIC.SELECT); toast.success(t('calBillCopied')); }
    } catch (e) { if (e.name !== 'AbortError') toast.error(t('calCouldNotShare')); }
  }
};
