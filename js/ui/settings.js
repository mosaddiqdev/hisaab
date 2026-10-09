import { state, save } from '../store.js';
import { ui, refresh, toast, askConfirm, haptic, HAPTIC, invalid, flash } from './state.js';
import { monthPrice, hasOwnPrice, canPrev, canNext } from '../logic.js';
import { ym, monthName } from '../utils/date.js';
import { fmt, esc } from '../utils/format.js';
import { mount as openGuide } from './guide.js';

const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const monthKey = () => (ui.settingsMonth && ui.settingsMonth >= state.startMonth ? ui.settingsMonth : ym(new Date()));
const shift = (key, n) => { const [y, m] = key.split('-').map(Number); return ym(new Date(y, m - 1 + n, 1)); };

// 2-3 choices with a sliding thumb: [value, label] pairs.
const opts = (act, items, cur) => {
  const i = Math.max(0, items.findIndex(([v]) => String(v) === String(cur)));
  return `<div class="opts" role="group" style="--n:${items.length};--i:${i}"><i class="thumb"></i>${items.map(([v, label]) =>
    `<button data-act="${act}" data-v="${v}" aria-pressed="${String(cur) === String(v)}">${label}</button>`).join('')}</div>`;
};
// Move the thumb and the pressed state without redrawing, so the slide can animate.
function pick(el) {
  const group = el.closest('.opts'), buttons = [...group.querySelectorAll('button')];
  group.style.setProperty('--i', buttons.indexOf(el));
  buttons.forEach(b => b.setAttribute('aria-pressed', b === el));
  haptic(HAPTIC.SELECT);
}

export function render() {
  const key = monthKey(), [y, mo] = key.split('-').map(Number), own = hasOwnPrice(key), eff = monthPrice(key), mn = monthName(mo - 1);
  const slide = ui.setDir ? (ui.setDir > 0 ? 'slide-next' : 'slide-prev') : '';
  return `<section class="page set"><h1>Settings</h1>

    <h2 class="sec">Milkman</h2>
    <label class="field" style="margin-top:0">Name<input id="set-name" class="input" value="${esc(state.milkman)}" placeholder="Optional" data-change="saveName"></label>
    <p class="hint">Used in the bill you share.</p>

    <h2 class="sec">Price per day</h2>
    <div class="stepper"><button class="icon-btn" data-act="setPrev" aria-label="Previous month" ${canPrev(key) ? '' : 'disabled'}>‹</button><b class="${slide}">${mn} ${y}</b>
      <button class="icon-btn" data-act="setNext" aria-label="Next month" ${canNext(key) ? '' : 'disabled'}>›</button></div>
    <div class="money ${slide}"><span>₹</span><input id="set-price" class="input big" inputmode="decimal" enterkeyhint="done" data-enter="saveMonthPrice"
      aria-label="Price per day for ${mn}" value="${own ? state.monthPrice[key] : ''}" placeholder="${eff || ''}"></div>
    <button class="btn" data-act="saveMonthPrice">Save price</button>
    <p class="hint">${own ? `Used for every day of ${mn}.` : eff > 0 ? `Not set for ${mn}, so it uses ${fmt(eff)} from an earlier month.` : 'Not set yet.'}</p>

    <h2 class="sec">Tracking</h2>
    <div class="group">
      <div class="row"><div><b>Track days milk did not come</b><p class="hint">Adds a "did not come" option</p></div>
        <button class="switch" role="switch" aria-checked="${state.trackMissed}" aria-label="Track days milk did not come" data-act="toggleMissed"></button></div>
      <div class="row stack"><b>Calendar week starts on</b>${opts('setWeek', [[0, 'Sunday'], [1, 'Monday']], state.weekStart || 0)}</div>
    </div>

    <h2 class="sec">Your data</h2>
    <div class="group">
      <button class="rowbtn" data-act="backup"><span>Download a backup</span><i>›</i></button>
      <button class="rowbtn" data-act="pickFile"><span>Restore from a backup</span><i>›</i></button>
    </div>
    <input id="restore-file" type="file" accept=".json,application/json" hidden data-change="restoreFile">
    <p class="hint">Everything is saved only on this phone. Download a backup now and then.</p>

    <h2 class="sec">Help</h2>
    <div class="group"><button class="rowbtn" data-act="replayGuide"><span>Show the guide again</span><i>›</i></button></div>

    <div class="group danger-zone"><button class="rowbtn danger" data-act="askErase"><span>Erase all data</span></button></div>
    <p class="foot">Hisaab · works offline</p></section>`;
}

export function enter() { ui.setDir = 0; }

function parseBackup(text) {
  let o; try { o = JSON.parse(text); } catch { return null; }
  if (!o || typeof o !== 'object' || !o.monthPrice || typeof o.monthPrice !== 'object' || !o.days || typeof o.days !== 'object') return null;
  const monthPrice = {}, days = {};
  for (const [k, v] of Object.entries(o.monthPrice)) if (/^\d{4}-\d{2}$/.test(k) && v != null && Number.isFinite(+v) && +v >= 0) monthPrice[k] = +v;
  for (const [k, v] of Object.entries(o.days)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v) continue;
    if (v.missed === true) days[k] = { missed: true };
    else if (v.price != null && Number.isFinite(+v.price) && +v.price >= 0) days[k] = { price: +v.price };
  }
  let startMonth = /^\d{4}-\d{2}$/.test(o.startMonth) ? o.startMonth : ym(new Date());
  const earliest = [...Object.keys(monthPrice), ...Object.keys(days).map(k => k.slice(0, 7))].sort()[0];
  if (earliest && earliest < startMonth) startMonth = earliest;
  return { monthPrice, days, trackMissed: o.trackMissed !== false, milkman: typeof o.milkman === 'string' ? o.milkman.slice(0, 60) : '',
    weekStart: o.weekStart === 1 ? 1 : 0, startMonth };
}

export const actions = {
  setPrev() { if (canPrev(monthKey())) { haptic(HAPTIC.SELECT); ui.settingsMonth = shift(monthKey(), -1); ui.setDir = -1; refresh(); } },
  setNext() { if (canNext(monthKey())) { haptic(HAPTIC.SELECT); ui.settingsMonth = shift(monthKey(), 1); ui.setDir = 1; refresh(); } },
  saveMonthPrice() {
    const input = document.getElementById('set-price'), v = parseFloat(input.value);
    if (!(v >= 0)) return invalid(input);
    state.monthPrice[monthKey()] = v; save(); haptic(HAPTIC.CONFIRM);
    flash(document.querySelector('[data-act=saveMonthPrice]'), 'Saved').then(refresh); // the drawn checkmark is the confirmation
  },
  toggleMissed(el) { state.trackMissed = !state.trackMissed; save(); el.setAttribute('aria-checked', state.trackMissed); haptic(HAPTIC.SELECT); },
  setWeek(el) { state.weekStart = +el.dataset.v; save(); pick(el); },
  replayGuide() { ui.tab = 'home'; refresh(); openGuide(); },
  pickFile() { document.getElementById('restore-file').click(); },
  backup() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'hisaab', ...state }, null, 2)], { type: 'application/json' }));
    a.download = `hisaab-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
    haptic(HAPTIC.CONFIRM); toast.success('Backup downloaded');
  },
  askErase() {
    askConfirm({ title: 'Erase all data?', body: 'This deletes every price and every day you edited from this phone. It cannot be undone, so download a backup first if you are not sure.',
      ok: 'Erase everything', danger: true, run() {
        Object.assign(state, { monthPrice: {}, days: {}, trackMissed: true, milkman: '', guideSeen: false, weekStart: 0, startMonth: ym(new Date()) });
        save(); ui.tab = 'home'; ui.settingsMonth = null; ui.lastNum = ui.lastSeg = ui.calLast = undefined; toast.success('All data erased'); setTimeout(openGuide, 260);
      } });
  }
};

export const changes = {
  saveName(el) { state.milkman = el.value.trim(); save(); },
  async restoreFile(el) {
    const file = el.files[0]; el.value = '';
    if (!file) return;
    const data = parseBackup(await file.text());
    if (!data) return toast.error('That is not a Hisaab backup');
    askConfirm({ title: 'Restore this backup?', ok: 'Restore',
      body: `It has ${plural(Object.keys(data.monthPrice).length, 'monthly price')} and ${plural(Object.keys(data.days).length, 'edited day')}. This replaces what is on this phone now.`,
      run() { haptic(HAPTIC.DOUBLE); Object.assign(state, data, { guideSeen: true }); save(); ui.lastNum = ui.lastSeg = ui.calLast = undefined; toast.success('Backup restored'); } });
  }
};
