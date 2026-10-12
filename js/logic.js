import { state } from './store.js';
import { ym, ymd, daysInMonth } from './utils/date.js';

export const hasOwnPrice = key => state.monthPrice[key] != null;

// Prices form a timeline: every price is "from this date on" until a later one replaces it.
// A month's own price starts on its 1st; a price change starts on the day it was set. On the same date a change wins.
export function priceOn(dateStr) {
  let best = null; // [date, price, isChange]
  const take = (d, v, change) => { if (d <= dateStr && (!best || d > best[0] || (d === best[0] && change))) best = [d, v, change]; };
  for (const [k, v] of Object.entries(state.monthPrice)) take(k + '-01', v, false);
  for (const [d, v] of Object.entries(state.priceChanges || {})) take(d, v, true);
  return best ? best[1] : 0;
}
// The price a month starts with: its own, or what carries over from earlier months (including earlier mid-month changes).
export const monthPrice = key => priceOn(key + '-01');
// Price changes that start during a month, in date order: [['2026-10-15', 25], ...]
export const monthChanges = key => Object.entries(state.priceChanges || {}).filter(([d]) => d.startsWith(key + '-')).sort(([a], [b]) => a < b ? -1 : 1);

export function dayInfo(date) {
  const k = ymd(date), e = state.days[k] || {};
  if (e.missed) return { amount: 0, kind: 'missed' };
  if (e.price != null) return { amount: e.price, kind: 'special' };
  return { amount: priceOn(k), kind: 'normal' };
}

// Counts every day up to and including `today`; future days add nothing.
export function monthSummary(y, m, today = new Date()) {
  const limit = ymd(today);
  let total = 0, missed = 0, special = 0, days = 0;
  for (let d = 1; d <= daysInMonth(y, m); d++) {
    const dt = new Date(y, m, d);
    if (ymd(dt) > limit) break;
    const i = dayInfo(dt);
    days++;
    total += i.amount;
    if (i.kind === 'missed') missed++;
    if (i.kind === 'special') special++;
  }
  return { total, missed, special, days };
}

export function setDay(key, entry) {
  if (entry) state.days[key] = entry; else delete state.days[key];
}

export const bulkSet = (keys, entry) => keys.forEach(k => setDay(k, entry));

// Calendar and price pages run from the first month of use to one year ahead.
export const maxMonth = () => { const n = new Date(); return ym(new Date(n.getFullYear(), n.getMonth() + 12, 1)); };
export const canPrev = key => key > state.startMonth;
export const canNext = key => key < maxMonth();
