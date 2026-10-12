import { ym } from './utils/date.js';

// All data lives on the device. Shape:
// monthPrice: {"2026-10": 20}  days: {"2026-10-05": {price: 60} | {missed: true}}
// priceChanges: {"2026-10-15": 25}  a new daily price from that date on (milk price hikes rarely start on the 1st)
const KEY = 'hisaab-v1';
const defaults = { monthPrice: {}, days: {}, trackMissed: true, milkman: '', guideSeen: false, weekStart: 0, startMonth: null, lang: 'en', langPicked: false, billLang: 'app',
  priceChanges: {}, milkmanPhone: '', billLink: true, lastBackup: null, backupSnooze: null, installedAt: null };
let saved = null;
try { saved = JSON.parse(localStorage.getItem(KEY)); } catch {}
export const state = { ...defaults, ...saved };
// The calendar begins at the month the app was first used. Older data (if any) moves it earlier.
const dataMonths = s => [...Object.keys(s.monthPrice || {}), ...Object.keys(s.days || {}).map(k => k.slice(0, 7)), ...Object.keys(s.priceChanges || {}).map(k => k.slice(0, 7))].filter(k => /^\d{4}-\d{2}$/.test(k));
if (!/^\d{4}-\d{2}$/.test(state.startMonth || '')) state.startMonth = [...dataMonths(state), ym(new Date())].sort()[0];
if (!state.installedAt) state.installedAt = Date.now(); // used to decide when to remind about a first backup
// The UI sets onSaveError so a failed save (storage full or blocked) is never silent.
export const hooks = { onSaveError: null };
export const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { hooks.onSaveError?.(e); return false; } };
if (!saved || saved.startMonth !== state.startMonth || !saved.installedAt) save(); // remember the first month of use right away
