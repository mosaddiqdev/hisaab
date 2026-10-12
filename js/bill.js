import { state } from './store.js';
import { dayInfo, monthSummary } from './logic.js';
import { ymd, daysInMonth, shortDate } from './utils/date.js';
import { fmt } from './utils/format.js';
import { t, nPlural, arr, lang } from './i18n.js';

// The bill is a statement the milkman can check against his own notebook, so every line adds up to the total:
//
//   *Milk bill*
//   Ramesh · October 2026 (1–12 Oct)
//   ──────────
//   12 days × ₹20 = ₹240
//   16 days × ₹25 = ₹400 (from 15 Oct)
//   Special price: 20 Oct ₹60
//   No milk: 2 days (3, 7 Oct)
//   ──────────
//   *Total: ₹700*
//
// { bold } wraps the title and total in *asterisks* for WhatsApp; other apps would show the asterisks.
// { link } is the app address ('' to leave it out). { now } exists so tests can pin the date.
export function billText(y, m, { bold = false, link = '', now = new Date() } = {}) {
  const billLang = (state.billLang && state.billLang !== 'app') ? state.billLang : lang();
  const bt = (key, vars) => t(key, vars, billLang);
  const strong = s => (bold ? `*${s}*` : s);

  const cur = y === now.getFullYear() && m === now.getMonth();
  const end = cur ? now : new Date(y, m + 1, 0);
  const s = monthSummary(y, m, end), lim = ymd(end);
  const mon = arr('monthsShort', billLang)[m], fullMonthName = arr('monthsLong', billLang)[m];

  // Walk the days once. Normal days become runs of the same price (a price change starts a new run);
  // special-price days and missed days are listed on their own so the lines still add up to the total.
  const runs = [], missed = [], special = [];
  for (let d = 1; d <= daysInMonth(y, m); d++) {
    const date = new Date(y, m, d);
    if (ymd(date) > lim) break;
    const i = dayInfo(date);
    if (i.kind === 'missed') missed.push(d);
    else if (i.kind === 'special') special.push(`${d} ${mon} ${fmt(i.amount)}`);
    else {
      const last = runs[runs.length - 1];
      if (last && last.price === i.amount) last.n++;
      else runs.push({ price: i.amount, n: 1, from: ymd(date) });
    }
  }

  const rule = '──────────';
  const name = (state.milkman || '').trim();
  const period = bt('billPeriod', { month: fullMonthName, year: y, range: `1–${cur ? now.getDate() : daysInMonth(y, m)} ${mon}` });
  const lines = [strong(bt('billTitle')), name ? `${name} · ${period}` : period, rule];

  runs.forEach((r, idx) => {
    let line = nPlural('billDays', r.n, billLang).replace('{price}', fmt(r.price)).replace('{amount}', fmt(r.price * r.n));
    if (idx > 0) line += ` (${bt('billFrom', { date: shortDate(r.from, billLang) })})`; // only mid-month price changes need a date
    lines.push(line);
  });
  if (special.length) lines.push(bt('billSpecial', { items: special.join(', ') }));
  if (state.trackMissed && missed.length) lines.push(nPlural('billNoMilk', missed.length, billLang).replace('{dates}', missed.join(', ')).replace('{mon}', mon));
  lines.push(rule, strong(bt('billTotal', { amount: fmt(s.total) })));

  // Invite line + bare link on its own line, so WhatsApp turns it into a preview card.
  if (link) lines.push('', bt('billShare'), link);
  return lines.join('\n');
}
