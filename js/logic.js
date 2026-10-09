import { state } from './store.js';
import { ym, ymd, daysInMonth } from './utils/date.js';

export const hasOwnPrice = key => state.monthPrice[key] != null;

// A month without its own price inherits the latest earlier month's price.
export function monthPrice(key) {
  if (hasOwnPrice(key)) return state.monthPrice[key];
  const prev = Object.keys(state.monthPrice).filter(k => k < key).sort().pop();
  return prev ? state.monthPrice[prev] : 0;
}

export function dayInfo(date) {
  const e = state.days[ymd(date)] || {};
  if (e.missed) return { amount: 0, kind: 'missed' };
  if (e.price != null) return { amount: e.price, kind: 'special' };
  return { amount: monthPrice(ym(date)), kind: 'normal' };
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
