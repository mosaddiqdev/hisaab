// Toast: a short message that confirms what just happened.
//   toast('Backup downloaded')                       neutral message
//   toast.success('Saved')  toast.error('Could not share')
//   toast.success('3 days marked no milk', { action: { label: 'Undo', onClick: () => ... } })
//   toast.dismiss()
// One toast at a time (a new one replaces the old). It sits just above the tab bar, pauses while pressed,
// and goes away by timeout, tap, swipe, Escape, or its close button.
import { reduced } from './env.js';
import { icons } from './icons.js';
import { t } from '../i18n.js';

const ICON = { success: icons.check, error: icons.alert, info: icons.info };
let current = null;

// Plain messages: about 4s (longer text gets longer). Errors: at least 6s. With an action: 10s, so people can reach it.
const timeFor = (msg, type, action) => action ? 10000 : Math.min(Math.max(type === 'error' ? 6000 : 4000, 2200 + msg.length * 50), 8000);

function announce(message, type, action) {
  const live = document.getElementById(type === 'error' ? 'toast-assertive' : 'toast-polite');
  if (!live) return;
  live.textContent = '';
  setTimeout(() => { live.textContent = action ? `${message}. ${action.label} is available.` : message; }, 50);
}

export function toast(message, { type = 'info', action = null, duration } = {}) {
  const region = document.getElementById('toast-region');
  if (!region) return null;
  if (current && current.message === message && current.type === type && !action) { current.restart(); return current; }
  current?.close(true);

  const ms = duration ?? timeFor(message, type, action);
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.style.setProperty('--dur', `${ms}ms`);
  el.innerHTML = `<span class="t-icon">${ICON[type] || ICON.info}</span><span class="t-msg"></span>`
    + (action ? '<button class="t-act" type="button"></button>' : '')
    + (action || type === 'error' ? `<button class="t-x" type="button" aria-label="${t('dismiss')}">${icons.close}</button>` : '')
    + (action ? '<i class="t-bar" aria-hidden="true"></i>' : '');
  el.querySelector('.t-msg').textContent = message;
  if (action) el.querySelector('.t-act').textContent = action.label;
  region.append(el);
  announce(message, type, action);

  let remaining = ms, startedAt = 0, timer = 0, closed = false, drag = null;
  const run = () => { startedAt = performance.now(); clearTimeout(timer); timer = setTimeout(() => close(), remaining); el.classList.remove('paused'); };
  const pause = () => { if (closed) return; clearTimeout(timer); remaining -= performance.now() - startedAt; el.classList.add('paused'); };
  function close(instant = false) {
    if (closed) return;
    closed = true; clearTimeout(timer);
    if (current === api) current = null;
    if (instant || reduced()) return el.remove();
    el.classList.add('out'); setTimeout(() => el.remove(), 220);
  }
  const api = {
    message, type, close,
    restart() { // same message again: keep it on screen a little longer instead of stacking
      remaining = ms; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      const bar = el.querySelector('.t-bar'); if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      run();
    }
  };
  current = api;

  el.querySelector('.t-act')?.addEventListener('click', () => { action.onClick?.(); close(); });
  el.querySelector('.t-x')?.addEventListener('click', () => close());

  // Press and hold pauses the timer. A tap dismisses. A drag sideways or down dismisses.
  el.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    drag = { x: e.clientX, y: e.clientY, dx: 0, dy: 0, t: performance.now() };
    el.setPointerCapture?.(e.pointerId); el.style.transition = 'none'; pause();
  });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    drag.dx = e.clientX - drag.x; drag.dy = Math.max(0, e.clientY - drag.y);
    el.style.transform = `translate(${drag.dx}px, ${drag.dy}px)`;
    el.style.opacity = String(Math.max(.3, 1 - Math.hypot(drag.dx, drag.dy) / 240));
  });
  const release = () => {
    if (!drag) return;
    const d = drag; drag = null;
    const quickTap = Math.hypot(d.dx, d.dy) < 6 && performance.now() - d.t < 350; // a long press is for reading, not dismissing
    if (quickTap || Math.abs(d.dx) > 70 || d.dy > 50) return close();
    el.style.transition = 'transform .25s cubic-bezier(.16,1,.3,1),opacity .2s'; el.style.transform = ''; el.style.opacity = ''; run();
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pause(); });
  el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !drag && !closed) run(); });

  run();
  return api;
}
toast.success = (m, o) => toast(m, { ...o, type: 'success' });
toast.error = (m, o) => toast(m, { ...o, type: 'error' });
toast.info = (m, o) => toast(m, { ...o, type: 'info' });
toast.dismiss = () => current?.close();

document.addEventListener('keydown', e => { if (e.key === 'Escape') current?.close(); });
