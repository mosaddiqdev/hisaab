import { state, save } from '../store.js';
import { ui, refresh, toast, askConfirm, haptic, HAPTIC, invalid, flash } from './state.js';
import { monthPrice, hasOwnPrice, canPrev, canNext } from '../logic.js';
import { ym, monthName } from '../utils/date.js';
import { fmt, esc, normalizeDigits } from '../utils/format.js';
import { t, nPlural, lang, setLang as i18nSetLang, arr } from '../i18n.js';
import { mount as openGuide } from './guide.js';

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
  const currentLang = lang();
  const billLangVal = state.billLang || 'app';

  // App language: same sliding control as "week starts on"; each name is set in its own script
  const langOpts = opts('setLang', [['en', '<span lang="en">English</span>'], ['hi', '<span lang="hi">हिंदी</span>'], ['as', '<span lang="as">অসমীয়া</span>']], currentLang);

  const billLangOptions = [
    `<option value="app" ${billLangVal === 'app' ? 'selected' : ''}>${t('settingsBillLangApp')}</option>`,
    `<option value="en" ${billLangVal === 'en' ? 'selected' : ''}>English</option>`,
    `<option value="hi" ${billLangVal === 'hi' ? 'selected' : ''}>हिंदी</option>`,
    `<option value="as" ${billLangVal === 'as' ? 'selected' : ''}>অসমীয়া</option>`
  ].join('');

  return `<section class="page set"><h1>${t('settingsTitle')}</h1>

    <h2 class="sec">${t('settingsPrice')}</h2>
    <div class="stepper"><button class="icon-btn" data-act="setPrev" aria-label="${t('ariaPrevMonth')}" ${canPrev(key) ? '' : 'disabled'}>‹</button><b class="${slide}">${mn} ${y}</b>
      <button class="icon-btn" data-act="setNext" aria-label="${t('ariaNextMonth')}" ${canNext(key) ? '' : 'disabled'}>›</button></div>
    <div class="money ${slide}"><span>₹</span><input id="set-price" class="input big" inputmode="decimal" enterkeyhint="done" data-enter="saveMonthPrice"
      aria-label="${t('settingsPriceAriaLabel', { month: mn })}" value="${own ? state.monthPrice[key] : ''}" placeholder="${eff || ''}"></div>
    <button class="btn" data-act="saveMonthPrice">${t('savePrice')}</button>
    <p class="hint">${own ? t('settingsPriceUsedFor', { month: mn }) : eff > 0 ? t('settingsPriceNotSet', { month: mn, amount: fmt(eff) }) : t('settingsPriceNone')}</p>

    <h2 class="sec">${t('settingsMilkman')}</h2>
    <label class="field" style="margin-top:0">${t('settingsNameLabel')}<input id="set-name" class="input" value="${esc(state.milkman)}" placeholder="${t('settingsNamePlaceholder')}" data-change="saveName"></label>
    <p class="hint">${t('settingsNameHint')}</p>
    <label class="field">${t('settingsBillLanguage')}
      <select class="input" data-change="setBillLang">${billLangOptions}</select></label>

    <h2 class="sec">${t('settingsPreferences')}</h2>
    <div class="group">
      <div class="row"><div><b>${t('settingsTrackMissedLabel')}</b><p class="hint">${t('settingsTrackMissedHint')}</p></div>
        <button class="switch" role="switch" aria-checked="${state.trackMissed}" aria-label="${t('settingsTrackMissedLabel')}" data-act="toggleMissed"></button></div>
      <div class="row stack"><b>${t('settingsWeekStartLabel')}</b>${opts('setWeek', [[0, t('settingsWeekSunday')], [1, t('settingsWeekMonday')]], state.weekStart || 0)}</div>
      <div class="row stack"><b>${t('settingsAppLanguage')}</b>${langOpts}</div>
    </div>

    <h2 class="sec">${t('settingsYourData')}</h2>
    <div class="group">
      <button class="rowbtn" data-act="backup"><span>${t('settingsBackupDownload')}</span><i>›</i></button>
      <button class="rowbtn" data-act="pickFile"><span>${t('settingsBackupRestore')}</span><i>›</i></button>
    </div>
    <input id="restore-file" type="file" accept=".json,application/json" hidden data-change="restoreFile">
    <p class="hint">${t('settingsBackupHint')}</p>

    <h2 class="sec">${t('settingsHelp')}</h2>
    <div class="group"><button class="rowbtn" data-act="replayGuide"><span>${t('settingsShowGuide')}</span><i>›</i></button></div>

    <div class="group danger-zone"><button class="rowbtn danger" data-act="askErase"><span>${t('settingsEraseData')}</span></button></div>
    <p class="foot">${t('settingsFooter')}</p></section>`;
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
  setLang(el) {
    const code = el.dataset.v;
    if (code === lang()) return;
    haptic(HAPTIC.SELECT);
    i18nSetLang(code);
    state.lang = code; state.langPicked = true; save();
  },
  setPrev() { if (canPrev(monthKey())) { haptic(HAPTIC.SELECT); ui.settingsMonth = shift(monthKey(), -1); ui.setDir = -1; refresh(); } },
  setNext() { if (canNext(monthKey())) { haptic(HAPTIC.SELECT); ui.settingsMonth = shift(monthKey(), 1); ui.setDir = 1; refresh(); } },
  saveMonthPrice() {
    const input = document.getElementById('set-price'), v = parseFloat(normalizeDigits(input.value));
    if (!(v >= 0)) return invalid(input);
    state.monthPrice[monthKey()] = v; save(); haptic(HAPTIC.CONFIRM);
    flash(document.querySelector('[data-act=saveMonthPrice]'), t('flashSaved')).then(refresh); // the drawn checkmark is the confirmation
  },
  toggleMissed(el) { state.trackMissed = !state.trackMissed; save(); el.setAttribute('aria-checked', state.trackMissed); haptic(HAPTIC.SELECT); },
  setWeek(el) { state.weekStart = +el.dataset.v; save(); pick(el); },
  replayGuide() { ui.tab = 'home'; refresh(); openGuide(); },
  pickFile() { document.getElementById('restore-file').click(); },
  backup() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'hisaab', ...state }, null, 2)], { type: 'application/json' }));
    a.download = `hisaab-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
    haptic(HAPTIC.CONFIRM); toast.success(t('toastBackupDownloaded'));
  },
  askErase() {
    askConfirm({ title: t('confirmEraseTitle'), body: t('confirmEraseBody'),
      ok: t('confirmEraseOk'), danger: true, run() {
        // CRITICAL: lang/langPicked/billLang are intentionally NOT in this Object.assign — they survive erase.
        Object.assign(state, { monthPrice: {}, days: {}, trackMissed: true, milkman: '', guideSeen: false, weekStart: 0, startMonth: ym(new Date()) });
        save(); ui.tab = 'home'; ui.settingsMonth = null; ui.lastNum = ui.lastSeg = ui.calLast = undefined; toast.success(t('toastAllDataErased')); setTimeout(openGuide, 260);
      } });
  }
};

export const changes = {
  saveName(el) { state.milkman = el.value.trim(); save(); },
  setBillLang(el) { state.billLang = el.value; save(); },
  async restoreFile(el) {
    const file = el.files[0]; el.value = '';
    if (!file) return;
    const data = parseBackup(await file.text());
    if (!data) return toast.error(t('toastNotABackup'));
    const pricesStr = nPlural('confirmRestorePrices', Object.keys(data.monthPrice).length);
    const daysStr = nPlural('confirmRestoreDays', Object.keys(data.days).length);
    askConfirm({ title: t('confirmRestoreTitle'), ok: t('confirmRestoreOk'),
      body: t('confirmRestoreBody', { prices: pricesStr, days: daysStr }),
      // CRITICAL: lang/langPicked/billLang are intentionally NOT passed in data — they survive restore.
      run() { haptic(HAPTIC.DOUBLE); Object.assign(state, data, { guideSeen: true }); save(); ui.lastNum = ui.lastSeg = ui.calLast = undefined; toast.success(t('toastBackupRestored')); } });
  }
};
