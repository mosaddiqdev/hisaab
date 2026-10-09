const p = n => String(n).padStart(2, '0');
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const ymd = d => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
export const ym = d => ymd(d).slice(0, 7);
export const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
export const monthName = m => MONTHS[m];
export const dayLabel = d => d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
