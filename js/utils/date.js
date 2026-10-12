import { arr } from '../i18n.js';

const p = n => String(n).padStart(2, '0');
export const ymd = d => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
export const ym = d => ymd(d).slice(0, 7);
export const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
export const monthName = m => arr('monthsLong')[m];
export const dayLabel = d => `${arr('dowLong')[d.getDay()]}, ${d.getDate()} ${arr('monthsShort')[d.getMonth()]}`;
export const dowShort = d => arr('dowShort')[d.getDay()];
// "15 Oct" from "2026-10-15" (in the given language, for the bill) and "15 Oct 2026" from a timestamp.
export const shortDate = (s, code) => { const d = parse(s); return `${d.getDate()} ${arr('monthsShort', code)[d.getMonth()]}`; };
export const fullDate = ts => { const d = new Date(ts); return `${d.getDate()} ${arr('monthsShort')[d.getMonth()]} ${d.getFullYear()}`; };
