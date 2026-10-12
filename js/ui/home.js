import { state, save } from '../store.js';
import { ui, refresh, openSheet, haptic, HAPTIC, invalid, flash, fadeSwap } from './state.js';
import { monthPrice, hasOwnPrice, dayInfo, monthSummary, setDay } from '../logic.js';
import { ymd, ym, monthName, dayLabel, daysInMonth, dowShort } from '../utils/date.js';
import { fmt, num, normalizeDigits } from '../utils/format.js';
import { t, nPlural, arr } from '../i18n.js';
import { digits, animateRoll } from './roll.js';
import { backupDue, snoozeBackup, daysSince, downloadBackup } from './backup.js';

const KINDS = ['normal', 'missed', 'special'];

function weekStrip(today) {
  let out = '';
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i), k = ymd(dt), info = dayInfo(dt);
    if (ym(dt) < state.startMonth) { // before the first month of use: shown faded, not tappable
      out += `<span class="wd off" aria-hidden="true"><small>${dowShort(dt)}</small><span class="dot">${dt.getDate()}</span><em></em></span>`;
      continue;
    }
    const mark = info.kind === 'special' ? fmt(info.amount) : info.kind === 'missed' ? '✕' : '';
    // The day that just changed is drawn as it WAS, then enter() flips it to how it IS, so the circle's colour fades
    // instead of jumping. (This runs before the old screen is replaced, so the old circle can still be read.)
    const old = k === ui.changed ? document.querySelector(`.wd[data-day="${k}"]`) : null;
    const oldKind = old && KINDS.find(c => old.classList.contains(c)), oldMark = old ? old.querySelector('em').textContent : mark;
    const flip = old && (oldKind !== info.kind || oldMark !== mark);
    out += `<button class="wd ${flip ? oldKind : info.kind} ${i === 0 ? 'today' : ''}" ${flip ? `data-flip="${info.kind}" data-mark="${mark}"` : ''} data-act="openDay" data-day="${k}" aria-label="${dayLabel(dt)}">
      <small>${dowShort(dt)}</small><span class="dot">${dt.getDate()}</span><em>${flip ? oldMark : mark}</em></button>`;
  }
  return `<div class="week">${out}</div>`;
}

export function render() {
  const now = new Date(), key = ym(now), y = now.getFullYear(), m = now.getMonth();
  const n = daysInMonth(y, m), d = now.getDate(), price = monthPrice(key);
  const sum = monthSummary(y, m), info = dayInfo(now);
  const cur = info.kind === 'normal' ? 0 : info.kind === 'missed' ? 1 : -1, shown = ui.lastSeg ?? cur;
  const startPos = shown >= 0 ? shown : Math.max(cur, 0), at = i => (i === 1 ? 'calc(100% + 4px)' : '0');
  const amtText = info.kind === 'missed' ? t('noMilk') : fmt(info.amount);
  const oldAmt = document.querySelector('.today-amt');
  const amtFlip = oldAmt && ui.changed === ymd(now) && oldAmt.textContent !== amtText;
  const oldAmtKind = amtFlip ? KINDS.find(c => oldAmt.classList.contains(c)) || '' : '';
  const estimate = monthSummary(y, m, new Date(y, m + 1, 0)).total; // the whole month: later days at their own price, planned specials and no-milk days included
  const specialBit = sum.special ? nPlural('specialDays', sum.special) : '';
  const missedBit = state.trackMissed && sum.missed ? nPlural('missedDays', sum.missed) : '';
  const bits = [specialBit, missedBit].filter(Boolean);
  const header = `<header class="top"><div><p class="eyebrow">${arr('dowLong')[now.getDay()]}</p>
      <p class="title">${now.getDate()} ${monthName(m)}</p></div></header>`;

  if (!hasOwnPrice(key)) { // first run, or a new month without a price yet
    return `<section class="page home">${header}
      <div class="setup"><p class="title">${price > 0 ? t('setupKeepPrice', { amount: fmt(price), month: monthName(m) }) : t('setupWhatDoYouPay')}</p>
        <p class="sub">${price > 0 ? t('setupSameAsLast') : t('setupSetDifferent')}</p>
        <div class="money"><span>₹</span><input id="price-in" class="input" inputmode="decimal" aria-label="${t('milkPricePerDay')}" data-enter="savePrice" value="${price || ''}"></div>
        <button class="btn" data-act="savePrice">${price > 0 ? t('save') : t('savePrice')}</button></div></section>`;
  }
  const total = num(sum.total);
  const nudge = backupDue() ? `<div class="nudge" role="note"><div><b>${t('backupNudgeTitle')}</b>
      <p class="hint">${state.lastBackup ? t('backupNudgeOld', { days: daysSince(state.lastBackup) }) : t('backupNudgeNever')}</p></div>
      <div class="nudge-act"><button class="btn" data-act="backupNow">${t('backupNow')}</button><button class="link" data-act="backupLater">${t('later')}</button></div></div>` : '';
  return `<section class="page home">${header}${nudge}
    <div class="hero"><p class="eyebrow">${t('spentInMonth', { month: monthName(m) })}</p>
      <p class="amount ${String(Math.round(sum.total)).length > 4 ? 'sm' : ''}" role="img" aria-label="${fmt(sum.total)}"><span class="cur" aria-hidden="true">₹</span><span class="num" aria-hidden="true" data-str="${total}">${digits(total, ui.rollFromZero ? total.replace(/\d/g, '0') : ui.lastNum)}</span></p>
      <p class="sub">${t('estimatedByMonthEnd', { amount: fmt(estimate) })}</p>
      <p class="sub">${bits.length ? bits.join(' · ') : '&nbsp;'}</p></div>
    <div class="sec-head"><h2>${t('thisWeek')}</h2><button class="link" data-act="tab" data-tab="calendar">${t('monthLink')}</button></div>
    ${weekStrip(now)}
    <div class="dock">
      <div class="dock-top"><p><span class="eyebrow">${t('todayLabel')}</span><b class="today-amt ${amtFlip ? oldAmtKind : info.kind}" ${amtFlip ? `data-flip="${info.kind}" data-text="${amtText}"` : ''}>${amtFlip ? oldAmt.textContent : amtText}</b></p>
        ${state.trackMissed ? `<button class="link" data-act="other">${t('changePrice')}</button>` : ''}</div>
      ${state.trackMissed ? `<div class="seg" role="group" aria-label="${t('todaysMilk')}">
        <i class="thumb" data-cur="${cur}" data-pos="${cur >= 0 ? cur : startPos}" data-op="${cur >= 0 ? 1 : 0}" style="transform:translateX(${at(startPos)});opacity:${shown >= 0 ? 1 : 0}"></i>
        <button data-act="came" aria-pressed="${shown === 0}">${t('milkCame')}</button>
        <button data-act="missed" aria-pressed="${shown === 1}">${t('didNotCome')}</button></div>`
        : `<button class="btn" data-act="other">${t('differentPriceToday')}</button>`}</div>
  </section>`;
}

export const actions = {
  savePrice() {
    const input = document.getElementById('price-in'), v = parseFloat(normalizeDigits(input.value));
    if (!(v >= 0)) return invalid(input);
    state.monthPrice[ym(new Date())] = v; save(); haptic(HAPTIC.CONFIRM);
    flash(document.querySelector('[data-act=savePrice]'), t('flashSaved'), 450).then(() => { ui.enter = true; refresh(); });
  },
  // The pill slides, the amount fades in, the total rolls and the day circle pops: that is the confirmation, so no toast.
  came() { ui.changed = ymd(new Date()); setDay(ymd(new Date()), null); save(); haptic(HAPTIC.SELECT); refresh(); },
  missed() { ui.changed = ymd(new Date()); setDay(ymd(new Date()), { missed: true }); save(); haptic(HAPTIC.SELECT); refresh(); },
  other() { openSheet(ymd(new Date())); },
  backupNow() { downloadBackup(); refresh(); },
  backupLater() { snoozeBackup(); haptic(HAPTIC.SELECT); refresh(); }
};

// Runs after the home view is drawn: slides the pill and rolls the changed digits.
export function enter() {
  const th = document.querySelector('.seg .thumb');
  if (th) {
    const cur = +th.dataset.cur, b = document.querySelectorAll('.seg button');
    void th.offsetWidth;
    th.style.transform = `translateX(${th.dataset.pos === '1' ? 'calc(100% + 4px)' : '0'})`;
    th.style.opacity = th.dataset.op;
    b[0].setAttribute('aria-pressed', cur === 0); b[1].setAttribute('aria-pressed', cur === 1);
    ui.lastSeg = cur;
  }
  // Everything that changed moves at the same moment as the pill: circle colour, the mark under it, and the amount text.
  document.querySelectorAll('.wd[data-flip]').forEach(el => {
    const kind = el.dataset.flip, mark = el.dataset.mark, em = el.querySelector('em');
    void el.offsetWidth;
    el.classList.remove(...KINDS); el.classList.add(kind);   // the circle's colours transition (see motion.css)
    if (em.textContent !== mark) fadeSwap(em, () => { em.textContent = mark; });
    el.removeAttribute('data-flip');
  });
  const amt = document.querySelector('.today-amt[data-flip]');
  if (amt) {
    const kind = amt.dataset.flip, text = amt.dataset.text;
    fadeSwap(amt, () => { amt.classList.remove(...KINDS); amt.classList.add(kind); amt.textContent = text; });
    amt.removeAttribute('data-flip');
  }
  const box = document.querySelector('.amount .num');
  if (box) { animateRoll(box, ui.rollFromZero ? 250 : 0); ui.rollFromZero = false; ui.lastNum = box.dataset.str; }
}
