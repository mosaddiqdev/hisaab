// i18n engine — no dependencies on other app modules.
// Supports English (en), Hindi (hi), and Assamese (as).
// NOTE: 'as' is a JS reserved word; the Assamese module exports 'assamese'.

import { en } from './lang/en.js';
import { hi } from './lang/hi.js';
import { assamese } from './lang/as.js';

/** @type {{ en: object, hi: object, as: object }} */
const LANGS = { en, hi, as: assamese };
const CODES = ['en', 'hi', 'as'];

let _currentLang = 'en';

// ── Core lookup ───────────────────────────────────────────────────────────────

/**
 * Look up a translation key.
 * @param {string} key
 * @param {Record<string, string|number>} [vars={}]  Placeholder values: { month: 'January' }
 * @param {string} [code]  Override current language.
 * @returns {string}
 */
export function t(key, vars = {}, code) {
  const dict = LANGS[code ?? _currentLang] ?? LANGS.en;
  let str = dict[key] ?? LANGS.en[key] ?? key;

  // Replace {app} with the app name in the active/requested language
  if (str.includes('{app}') || str.includes('{appName}')) {
    const name = (LANGS[code ?? _currentLang] ?? LANGS.en).appName ?? 'Hisaab';
    str = str.replace(/\{app\}/g, name).replace(/\{appName\}/g, name);
  }

  // Replace remaining {placeholder} tokens
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return str;
}

/**
 * Look up an array-valued key (month names, day names, etc.).
 * @param {string} key
 * @param {string} [code]
 * @returns {string[]}
 */
export function arr(key, code) {
  const dict = LANGS[code ?? _currentLang] ?? LANGS.en;
  return dict[key] ?? LANGS.en[key] ?? [];
}

// ── Plural helper ─────────────────────────────────────────────────────────────

/**
 * Select the right plural variant and interpolate {n}.
 * Uses _one / _other suffix keys (Intl.PluralRules categories).
 * @param {string} key  Base key without suffix, e.g. 'missedDays'
 * @param {number} n
 * @param {string} [code]
 * @returns {string}
 */
export function nPlural(key, n, code) {
  const lang = code ?? _currentLang;
  const category = new Intl.PluralRules(lang).select(n);
  const fullKey = `${key}_${category}`;
  // Fall back to _other if the category key doesn't exist
  const dict = LANGS[lang] ?? LANGS.en;
  const str = dict[fullKey] ?? dict[`${key}_other`] ?? LANGS.en[fullKey] ?? LANGS.en[`${key}_other`] ?? key;
  return str.replace(/\{n\}/g, String(n));
}

// ── Language management ───────────────────────────────────────────────────────

/** Return the currently active language code. */
export function lang() {
  return _currentLang;
}

/**
 * Switch the active language. Updates <html lang>, dispatches 'langchange'.
 * Silently ignores unknown codes.
 * @param {string} code  'en' | 'hi' | 'as'
 */
export function setLang(code) {
  if (!CODES.includes(code)) return;
  _currentLang = code;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = code;
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: code } }));
  }
}

/**
 * Detect the best language from navigator.languages.
 * Checks for 'as', 'hi', then 'en' prefix matches (in that preference order).
 * Falls back to 'en' if nothing matches.
 * @returns {'en'|'hi'|'as'}
 */
export function detectLang() {
  if (typeof navigator === 'undefined') return 'en';
  const preferred = navigator.languages ?? (navigator.language ? [navigator.language] : []);
  for (const locale of preferred) {
    const lower = locale.toLowerCase();
    if (lower === 'as' || lower.startsWith('as-')) return 'as';
    if (lower === 'hi' || lower.startsWith('hi-')) return 'hi';
    if (lower === 'en' || lower.startsWith('en-')) return 'en';
  }
  return 'en';
}

/**
 * Return a Promise that resolves when the required font is ready.
 * For 'hi'  : waits for Hind (Devanagari).
 * For 'as'  : waits for Hind Siliguri (Bengali/Assamese script).
 * For 'en'  : resolves immediately.
 * @param {string} [code]  Defaults to current language.
 * @returns {Promise<void>}
 */
export function fontReady(code) {
  const c = code ?? _currentLang;
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  if (c === 'hi') return document.fonts.load('400 16px Hind').then(() => {});
  if (c === 'as') return document.fonts.load('400 16px Hind Siliguri').then(() => {});
  return Promise.resolve();
}
