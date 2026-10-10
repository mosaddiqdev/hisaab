// Flat ripple, the app's one press effect (it replaces the old shrink-on-press).
// A small dot appears under the finger, spreads to the farthest corner, HOLDS while pressed, then fades on release.
// Clipped to the host's shape, no shadow. Skipped when the person asked for reduced motion.
import { reduced } from './env.js';

const OPACITY = { accent: .16, light: .22 };

// Start a ripple inside `host` at (x, y), measured from the host's top-left. Returns release().
// tone: 'accent' for light surfaces, 'light' for dark or filled ones. held: false = spread and fade by itself.
export function ripple(host, x, y, { held = false, tone = 'accent' } = {}) {
  if (reduced()) return () => {};
  const w = host.clientWidth, h = host.clientHeight, size = 2 * Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) || 1; // reaches the farthest corner
  const op = OPACITY[tone], dot = document.createElement('i');
  dot.className = `ripple ${tone}`;
  dot.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px;opacity:0`;
  host.append(dot);
  const grow = dot.animate([{ transform: `scale(${Math.min(1, 18 / size)})`, opacity: 0 }, { opacity: op, offset: .2 }, { transform: 'scale(1)', opacity: op }],
    { duration: 320, easing: 'cubic-bezier(.2,0,0,1)', fill: 'forwards' });
  let released = false;
  const release = () => {
    if (released) return; released = true;
    grow.finished.then(() => dot.animate([{ opacity: op }, { opacity: 0 }], { duration: 180, easing: 'ease-out', fill: 'forwards' }).finished)
      .catch(() => {}).then(() => dot.remove());
  };
  if (!held) release(); else setTimeout(release, 2500); // never leave one behind
  return release;
}

// What gets a ripple. Day circles ripple inside their 40px circle, not the whole cell.
const HOSTS = '.btn:not(:disabled), .rowbtn, .pill, .icon-btn:not(:disabled), .seg button, .opts button, .link, .inline, .g-opt, .wd:not(.off) .dot, .cd .dot';
const dark = el => el.matches('.btn:not(.btn-outline):not(.btn-ghost), .opts button[aria-pressed=true], .seg button[aria-pressed=true]');

// One listener for the whole app: screens are redrawn with innerHTML, so per-element listeners would be lost.
export function initRipples() {
  document.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    let host = e.target.closest?.(HOSTS);
    if (!host) { const cell = e.target.closest?.('.wd:not(.off), .cd'); host = cell?.querySelector('.dot'); } // pressed beside the circle, inside the cell
    if (!host) return;
    const r = host.getBoundingClientRect();
    const release = ripple(host, Math.max(0, Math.min(r.width, e.clientX - r.left)), Math.max(0, Math.min(r.height, e.clientY - r.top)), { held: true, tone: dark(host) ? 'light' : 'accent' });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => host.addEventListener(n, release, { once: true }));
  });
}
