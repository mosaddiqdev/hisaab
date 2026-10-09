import { ym } from './utils/date.js';

// All data lives on the device. Shape:
// monthPrice: {"2026-10": 20}  days: {"2026-10-05": {price: 60} | {missed: true}}
const KEY = 'hisaab-v1';
const defaults = { monthPrice: {}, days: {}, trackMissed: true, milkman: '', guideSeen: false, weekStart: 0, startMonth: null };
let saved = null;
try { saved = JSON.parse(localStorage.getItem(KEY)); } catch {}
export const state = { ...defaults, ...saved };
// The calendar begins at the month the app was first used. Older data (if any) moves it earlier.
const dataMonths = s => [...Object.keys(s.monthPrice || {}), ...Object.keys(s.days || {}).map(k => k.slice(0, 7))].filter(k => /^\d{4}-\d{2}$/.test(k));
if (!/^\d{4}-\d{2}$/.test(state.startMonth || '')) state.startMonth = [...dataMonths(state), ym(new Date())].sort()[0];
export const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
if (!saved || saved.startMonth !== state.startMonth) save(); // remember the first month of use right away
