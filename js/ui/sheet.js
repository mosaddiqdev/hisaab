import { state, save } from '../store.js';
import { ui, refresh, toast, reduced, haptic, HAPTIC, invalid } from './state.js';
import { monthPrice, bulkSet, setDay } from '../logic.js';
import { parse, ym, dayLabel, ymd } from '../utils/date.js';
import { fmt, esc } from '../utils/format.js';

const keys = () => (Array.isArray(ui.sheet) ? ui.sheet : [ui.sheet]);

function confirmHtml() {
  const c = ui.confirm;
  return `<div class="overlay" data-act="closeSheet"></div>
    <div class="sheet" role="alertdialog" aria-modal="true" aria-label="${esc(c.title)}">
      <div class="sheet-drag"><div class="grab"></div><div class="sheet-head"><h2>${esc(c.title)}</h2><p class="muted">${esc(c.body)}</p></div></div>
      <div class="sheet-alt" style="--n:2;margin-top:18px"><button class="btn btn-outline" data-act="dismiss">Cancel</button>
        <button class="btn ${c.danger ? 'danger' : ''}" data-act="confirmYes">${esc(c.ok)}</button></div></div>`;
}

export function render() {
  if (ui.confirm) return confirmHtml();
  if (!ui.sheet) return '';
  const ks = keys(), multi = ks.length > 1, dt = parse(ks[0]), e = multi ? {} : state.days[ks[0]] || {}, base = monthPrice(ym(dt));
  const fut = !multi && ks[0] > ymd(new Date());
  const now = multi ? 'One price for all of them'
    : fut ? (e.missed ? 'Planned · milk won’t come' : e.price != null ? `Planned · special price ${fmt(e.price)}` : `Upcoming · normal price ${fmt(base)}`)
    : e.missed ? 'No milk' : e.price != null ? `Special price · ${fmt(e.price)}` : `Normal price · ${fmt(base)}`;
  const alt = [state.trackMissed && !e.missed && `<button class="btn btn-outline" data-act="markMissed">${fut ? 'Milk won’t come' : 'No milk'}</button>`,
    (multi || e.price != null || e.missed) && '<button class="btn btn-outline" data-act="resetDay">Back to normal</button>'].filter(Boolean);
  return `<div class="overlay" data-act="closeSheet"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${multi ? `Edit ${ks.length} days` : `Edit ${dayLabel(dt)}`}">
      <div class="sheet-drag"><div class="grab"></div>
        <div class="sheet-head"><h2>${multi ? `${ks.length} days selected` : dayLabel(dt)}</h2><p class="muted">${now}</p></div></div>
      <label class="field">Price ${multi ? 'for each day' : 'for this day only'}<div class="money"><span>₹</span>
        <input id="day-in" class="input big" inputmode="decimal" enterkeyhint="done" placeholder="${base}" data-enter="saveDay" value="${e.price ?? ''}"></div></label>
      <button class="btn" data-act="saveDay">Save price</button>
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
    toast.success(`${ks.length} days ${entry?.missed ? 'marked no milk' : entry ? `set to ${fmt(entry.price)}` : 'back to normal'}`, {
      action: { label: 'Undo', onClick() { before.forEach(([k, v]) => setDay(k, v)); save(); refresh(); } }
    });
  }
  close();
};
export const actions = {
  closeSheet() { if (Date.now() - ui.openedAt < 500) return; close(); },
  saveDay() {
    const el = document.getElementById('day-in'), v = parseFloat(el.value);
    if (v >= 0) return done({ price: v });
    invalid(el);
  },
  dismiss: () => close(),
  confirmYes() { haptic(HAPTIC.DOUBLE); ui.confirm.run(); close(); },
  markMissed: () => done({ missed: true }),
  resetDay: () => done(null)
};
