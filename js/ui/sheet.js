import { state, save } from '../store.js';
import { ui, refresh, toast, reduced, haptic, HAPTIC, invalid, flash } from './state.js';
import { priceOn, bulkSet, setDay } from '../logic.js';
import { parse, ym, dayLabel, ymd, shortDate } from '../utils/date.js';
import { fmt, esc, normalizeDigits } from '../utils/format.js';
import { t, nPlural } from '../i18n.js';

const keys = () => (Array.isArray(ui.sheet) ? ui.sheet : [ui.sheet]);

function confirmHtml() {
  const c = ui.confirm;
  return `<div class="overlay" data-act="closeSheet"></div>
    <div class="sheet" role="alertdialog" aria-modal="true" aria-label="${esc(c.title)}">
      <div class="sheet-drag"><div class="grab"></div><div class="sheet-head"><h2>${esc(c.title)}</h2><p class="muted">${esc(c.body)}</p></div></div>
      ${c.extra ? `<button class="btn btn-outline" data-act="confirmExtra" style="margin-top:18px">${esc(c.extra.label)}</button>` : ''}
      <div class="sheet-alt" style="--n:2;margin-top:${c.extra ? 8 : 18}px"><button class="btn btn-outline" data-act="dismiss">${t('cancel')}</button>
        <button class="btn ${c.danger ? 'danger' : ''}" data-act="confirmYes">${esc(c.ok)}</button></div></div>`;
}

export function render() {
  if (ui.confirm) return confirmHtml();
  if (!ui.sheet) return '';
  const ks = keys(), multi = ks.length > 1, dt = parse(ks[0]), e = multi ? {} : state.days[ks[0]] || {}, base = priceOn(ks[0]);
  const fut = !multi && ks[0] > ymd(new Date());
  const now = multi ? t('sheetOnePriceForAll')
    : fut ? (e.missed ? t('sheetPlannedNoMilk') : e.price != null ? t('sheetPlannedSpecial', { amount: fmt(e.price) }) : t('sheetUpcomingNormal', { amount: fmt(base) }))
    : e.missed ? t('sheetNoMilk') : e.price != null ? t('sheetSpecialPrice', { amount: fmt(e.price) }) : t('sheetNormalPrice', { amount: fmt(base) });
  const ariaLabel = multi ? nPlural('ariaEditDays', ks.length) : t('ariaEditDay', { day: dayLabel(dt) });
  const alt = [state.trackMissed && !e.missed && `<button class="btn btn-outline" data-act="markMissed">${fut ? t('sheetMilkWontCome') : t('noMilk')}</button>`,
    (multi || e.price != null || e.missed) && `<button class="btn btn-outline" data-act="resetDay">${t('backToNormal')}</button>`].filter(Boolean);
  return `<div class="overlay" data-act="closeSheet"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${ariaLabel}">
      <div class="sheet-drag"><div class="grab"></div>
        <div class="sheet-head"><h2>${multi ? nPlural('sheetDaysSelected', ks.length) : dayLabel(dt)}</h2><p class="muted">${now}</p></div></div>
      <label class="field">${multi ? t('sheetPriceForEachDay') : t('sheetPriceForThisDay')}<div class="money"><span>₹</span>
        <input id="day-in" class="input big" inputmode="decimal" enterkeyhint="done" placeholder="${base}" data-enter="saveDay" value="${e.price ?? ''}"></div></label>
      <button class="btn" data-act="saveDay">${t('savePrice')}</button>
      ${multi ? '' : `<button class="btn btn-ghost" data-act="priceFromHere">${t('sheetPriceFromHere')}</button>`}
      ${alt.length ? `<div class="sheet-alt" style="--n:${alt.length}">${alt.join('')}</div>` : ''}</div>`;
}

// Slide the sheet away first, then update the screen behind it.
function close() {
  if (ui.closing) return;
  ui.closing = true;
  haptic(HAPTIC.SELECT);
  const end = () => { ui.closing = false; ui.sheet = null; ui.confirm = null; refresh(); };
  if (reduced() || !document.querySelector('.sheet')) return end();
  document.querySelectorAll('.sheet,.overlay').forEach(e => e.classList.add('out'));
  setTimeout(end, 200);
}
const done = entry => {
  const ks = keys(), before = ks.map(k => [k, state.days[k] ? { ...state.days[k] } : null]);
  bulkSet(ks, entry); save();
  ui.changed = ks.length === 1 ? ks[0] : null; ui.select = null;
  haptic(HAPTIC.CONFIRM);
  if (ks.length > 1) {
    const msg = entry?.missed
      ? nPlural('toastMarkedNoMilk', ks.length)
      : entry
        ? nPlural('toastSetToPrice', ks.length).replace('{amount}', fmt(entry.price))
        : nPlural('toastBackToNormal', ks.length);
    toast.success(msg, {
      action: { label: t('undo'), onClick() { before.forEach(([k, v]) => setDay(k, v)); save(); refresh(); } }
    });
  }
  close();
};
export const actions = {
  closeSheet() { if (Date.now() - ui.openedAt < 500) return; close(); },
  saveDay() {
    const el = document.getElementById('day-in'), v = parseFloat(normalizeDigits(el.value));
    if (v >= 0) return done({ price: v });
    invalid(el);
  },
  dismiss: () => close(),
  confirmYes() { haptic(HAPTIC.DOUBLE); ui.confirm.run(); close(); },
  // "From this day on": the typed price becomes the daily price from this date, until the next change.
  // (On the 1st of a month that is simply the month's price.)
  priceFromHere() {
    const el = document.getElementById('day-in'), v = parseFloat(normalizeDigits(el.value));
    if (!(v >= 0)) return invalid(el);
    const k = keys()[0], mk = k.slice(0, 7), first = k.endsWith('-01');
    const was = { change: state.priceChanges[k], month: state.monthPrice[mk], day: state.days[k] ? { ...state.days[k] } : null };
    if (first) { state.monthPrice[mk] = v; delete state.priceChanges[k]; } else state.priceChanges[k] = v;
    if (state.days[k]?.price != null) delete state.days[k]; // that day now simply follows the new price
    save(); ui.changed = k; ui.select = null; haptic(HAPTIC.CONFIRM);
    toast.success(t('toastPriceFrom', { amount: fmt(v), date: shortDate(k) }), {
      action: { label: t('undo'), onClick() {
        if (was.change == null) delete state.priceChanges[k]; else state.priceChanges[k] = was.change;
        if (first) { if (was.month == null) delete state.monthPrice[mk]; else state.monthPrice[mk] = was.month; }
        if (was.day) state.days[k] = was.day;
        save(); refresh();
      } }
    });
    close();
  },
  confirmExtra(el) { ui.confirm.extra.run(); flash(el, t('flashSaved')); },
  markMissed: () => done({ missed: true }),
  resetDay: () => done(null)
};
