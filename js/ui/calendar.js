import { state, save } from '../store.js';
import { ui, refresh, openSheet, toast, haptic, HAPTIC, goTab } from './state.js';
import { dayInfo, monthSummary, monthPrice, hasOwnPrice, bulkSet, setDay, canPrev, canNext } from '../logic.js';
import { ymd, daysInMonth, monthName } from '../utils/date.js';
import { fmt, num } from '../utils/format.js';
import { digits, animateRoll } from './roll.js';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const keyOf = (y, m) => `${y}-${String(m + 1).padStart(2, '0')}`;

// Current month: so far. Past month: final. Future month: planned.
function figures(y, m, now) {
  const last = new Date(y, m + 1, 0), cur = y === now.getFullYear() && m === now.getMonth();
  const full = monthSummary(y, m, last), sofar = cur ? monthSummary(y, m, now) : full;
  return { cur, future: !cur && ymd(last) >= ymd(now), full, s: sofar };
}

export function render() {
  const [sy, sm] = state.startMonth.split('-').map(Number);
  if (ui.cursor < new Date(sy, sm - 1, 1)) ui.cursor = new Date(sy, sm - 1, 1);
  const now = new Date(), y = ui.cursor.getFullYear(), m = ui.cursor.getMonth(), key = keyOf(y, m), today = ymd(now);
  const { cur, future, full, s } = figures(y, m, now), sel = ui.select, n = sel ? sel.size : 0;
  const ws = state.weekStart || 0, lead = (new Date(y, m, 1).getDay() - ws + 7) % 7, cells = [];
  for (let i = 0; i < lead; i++) cells.push('<span></span>');
  for (let d = 1; d <= daysInMonth(y, m); d++) {
    const dt = new Date(y, m, d), k = ymd(dt), i = dayInfo(dt), on = sel && sel.has(k);
    const note = i.kind === 'missed' ? ', no milk' : i.kind === 'special' ? `, special price ${i.amount} rupees` : '';
    cells.push(`<button class="cd ${i.kind} ${k === today ? 'today' : ''} ${k > today ? 'future' : ''} ${on ? 'sel' : ''} ${k === ui.changed ? 'pop' : ''}"
      data-act="openDay" data-day="${k}" ${sel ? `aria-pressed="${!!on}"` : ''} aria-label="${d} ${monthName(m)}${note}">
      <span class="dot">${d}</span><em>${i.kind === 'special' ? fmt(i.amount) : i.kind === 'missed' ? '✕' : ''}</em></button>`);
  }
  const label = future ? 'planned' : cur ? 'so far' : 'total';
  const total = future ? full.total : s.total, str = num(total), prev = ui.calLast && ui.calLast.key === key ? ui.calLast.str : undefined;
  const swap = ui.calDir ? 'swap' : '';
  const price = hasOwnPrice(key)
    ? `<button class="inline" data-act="editPrice" data-key="${key}">${fmt(monthPrice(key))}/day <b>Edit</b></button>`
    : `<button class="inline warn" data-act="editPrice" data-key="${key}">Set price ›</button>`;
  const count = k => (k ? ` · ${k}` : '');
  return `<section class="page cal">
    <div class="cal-top"><h1 class="${swap}">${monthName(m)} ${y}</h1>
      <div class="cal-nav"><button class="icon-btn" data-act="prev" aria-label="Previous month" ${canPrev(key) ? '' : 'disabled'}>‹</button>
      <button class="icon-btn" data-act="next" aria-label="Next month" ${canNext(key) ? '' : 'disabled'}>›</button></div></div>
    <div class="cal-sum"><p class="cal-total ${swap}" role="img" aria-label="${fmt(total)} ${label}"><span class="cur" aria-hidden="true">₹</span><span class="num" aria-hidden="true" data-key="${key}" data-str="${str}">${digits(str, prev)}</span><span class="cal-label">${label}</span></p>
      ${cur ? '' : '<button class="pill" data-act="today">Today</button>'}</div>
    <div class="cal-grid ${ui.calDir ? (ui.calDir > 0 ? 'to-next' : 'to-prev') : ''}">${[...DOW.slice(ws), ...DOW.slice(0, ws)].map(x => `<span class="cal-dow">${x}</span>`).join('')}${cells.join('')}</div>
    <p class="legend"><span class="lg-items"><span><i class="lg special"></i>Special${count(full.special)}</span>
      ${state.trackMissed ? `<span><i class="lg missed"></i>No milk${count(full.missed)}</span>` : ''}</span>${price}</p>
    ${sel ? `<div class="dock ${ui.dockIn ? 'rise' : ''}"><div class="dock-top"><p><b class="sel-count">${n ? `${n} ${n === 1 ? 'day' : 'days'} selected` : 'Tap the days you want'}</b></p>
        <button class="link" data-act="cancelSelect">Cancel</button></div>
      <div class="sheet-alt" style="--n:${state.trackMissed ? 3 : 2}">
        ${state.trackMissed ? `<button class="btn btn-outline" data-act="selMissed" ${n ? '' : 'disabled'}>No milk</button>` : ''}
        <button class="btn" data-act="selPrice" ${n ? '' : 'disabled'}>Set price</button>
        <button class="btn btn-outline" data-act="selNormal" ${n ? '' : 'disabled'}>Normal</button></div></div>`
    : `<div class="cal-actions"><button class="btn btn-outline" data-act="selectMode">Select days</button>
      ${future ? '' : `<button class="btn btn-outline" data-act="share" data-y="${y}" data-m="${m}">Share bill</button>`}</div>`}
  </section>`;
}

export function enter() {
  ui.calDir = 0; ui.dockIn = false;
  const box = document.querySelector('.cal-total .num');
  if (box) { animateRoll(box); ui.calLast = { key: box.dataset.key, str: box.dataset.str }; }
}

function billText(y, m) {
  const now = new Date(), { cur, s } = figures(y, m, now), lim = ymd(cur ? now : new Date(y, m + 1, 0)), mon = monthName(m).slice(0, 3);
  const missed = [], special = [];
  for (let d = 1; d <= daysInMonth(y, m) && ymd(new Date(y, m, d)) <= lim; d++) {
    const i = dayInfo(new Date(y, m, d));
    if (i.kind === 'missed') missed.push(d);
    if (i.kind === 'special') special.push(`${d} ${mon} ${fmt(i.amount)}`);
  }
  const lines = [`Hisaab · ${monthName(m)} ${y}${cur ? ' (so far)' : ''}`];
  if (state.milkman) lines.push(`Milkman: ${state.milkman}`);
  lines.push(`Price: ${fmt(monthPrice(keyOf(y, m)))} per day`, `Delivered: ${s.days - s.missed} days`);
  if (state.trackMissed && missed.length) lines.push(`No milk: ${missed.length} ${missed.length > 1 ? 'days' : 'day'} (${missed.join(', ')} ${mon})`);
  if (special.length) lines.push(`Special price: ${special.join(', ')}`);
  lines.push(`Total: ${fmt(s.total)}`);
  return lines.join('\n');
}

const go = n => {
  const key = keyOf(ui.cursor.getFullYear(), ui.cursor.getMonth());
  if (n < 0 ? !canPrev(key) : !canNext(key)) return;
  haptic(HAPTIC.SELECT);
  ui.cursor = new Date(ui.cursor.getFullYear(), ui.cursor.getMonth() + n, 1); ui.calDir = n; refresh();
};
const apply = (entry, what) => {
  const keys = [...ui.select], before = keys.map(k => [k, state.days[k] ? { ...state.days[k] } : null]);
  bulkSet(keys, entry); save(); haptic(HAPTIC.DOUBLE); ui.select = null; refresh();
  toast.success(`${keys.length} ${keys.length === 1 ? 'day' : 'days'} ${what}`, {
    action: { label: 'Undo', onClick() { before.forEach(([k, v]) => setDay(k, v)); save(); haptic(HAPTIC.SELECT); refresh(); } }
  });
};
// Selecting updates the circle and the panel in place, so the circle can animate instead of the whole grid redrawing.
function syncDock() {
  const n = ui.select.size, dock = document.querySelector('.dock');
  if (!dock) return;
  dock.querySelector('.sel-count').textContent = n ? `${n} ${n === 1 ? 'day' : 'days'} selected` : 'Tap the days you want';
  dock.querySelectorAll('.sheet-alt .btn').forEach(b => { b.disabled = !n; });
}

export const actions = {
  prev: () => go(-1), next: () => go(1),
  today() {
    const now = new Date(), d = now.getFullYear() * 12 + now.getMonth() - (ui.cursor.getFullYear() * 12 + ui.cursor.getMonth());
    ui.cursor = new Date(now.getFullYear(), now.getMonth(), 1); ui.calDir = d >= 0 ? 1 : -1; refresh();
  },
  openDay(el) {
    if (!ui.select) return openSheet(el.dataset.day);
    const k = el.dataset.day, on = !ui.select.has(k);
    on ? ui.select.add(k) : ui.select.delete(k);
    el.classList.toggle('sel', on); el.setAttribute('aria-pressed', on); haptic(HAPTIC.SELECT); syncDock();
  },
  selectMode() { ui.select = new Set(); ui.dockIn = true; haptic(HAPTIC.SELECT); refresh(); },
  cancelSelect() { ui.select = null; haptic(HAPTIC.SELECT); refresh(); },
  selMissed: () => apply({ missed: true }, 'marked no milk'),
  selNormal: () => apply(null, 'back to normal'),
  selPrice() { if (ui.select.size) openSheet([...ui.select].sort()); },
  editPrice(el) { ui.settingsMonth = el.dataset.key; goTab('settings'); },
  async share(el) {
    const text = billText(+el.dataset.y, +el.dataset.m);
    try {
      if (navigator.share) { await navigator.share({ title: 'Hisaab', text }); haptic(HAPTIC.SELECT); }
      else { await navigator.clipboard.writeText(text); haptic(HAPTIC.SELECT); toast.success('Bill copied'); }
    } catch (e) { if (e.name !== 'AbortError') toast.error('Could not share the bill'); }
  }
};
