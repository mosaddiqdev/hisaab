// Small browser helpers shared by the UI modules.
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// A light tap on the phone (where supported). Skipped when the person asked for reduced motion.
export const haptic = (pattern = 10) => { try { if (!reduced()) navigator.vibrate?.(pattern); } catch {} };

// Semantic haptic intensity constants — use these instead of magic numbers.
export const HAPTIC = {
  TAP:     4,          // barely-there: press-start, low-stakes hint
  SELECT:  8,          // light tick: toggle, nav step, selection
  CONFIRM: 12,         // solid click: save committed
  DOUBLE:  [10, 50, 18], // double-pulse: bulk action, consequential commit
  ERROR:   [20, 40, 20]  // double-buzz: invalid input
};
