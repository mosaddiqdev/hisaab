// @ts-check
// check-i18n.js — i18n validation script for Hisaab
// Run from project root: node scripts/check-i18n.js
// Exits 1 if any errors found, 0 if only warnings.

import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

let errors = 0;
let warnings = 0;

function err(msg) {
  console.error(`  ERROR: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  WARN:  ${msg}`);
  warnings++;
}

// ── 1. Load lang files ────────────────────────────────────────────────────────
const { en } = await import('../js/lang/en.js');
const { hi } = await import('../js/lang/hi.js');
// FEAT-001 finding: as.js exports 'assamese' (not 'as' — reserved word)
const { assamese: as_ } = await import('../js/lang/as.js');

const LANGS = { en, hi, as: as_ };
const LANG_NAMES = { en: 'en.js', hi: 'hi.js', as: 'as.js' };

// ── 2. Key parity ─────────────────────────────────────────────────────────────
console.log('\n[1] Key parity');

const enKeys = new Set(Object.keys(en));
const hiKeys = new Set(Object.keys(hi));
const asKeys = new Set(Object.keys(as_));

// keys in en but missing in hi
for (const k of enKeys) {
  if (!hiKeys.has(k)) err(`hi.js missing key: '${k}'`);
}
// keys in hi but not in en
for (const k of hiKeys) {
  if (!enKeys.has(k)) err(`hi.js has extra key not in en.js: '${k}'`);
}
// keys in en but missing in as
for (const k of enKeys) {
  if (!asKeys.has(k)) err(`as.js missing key: '${k}'`);
}
// keys in as but not in en
for (const k of asKeys) {
  if (!enKeys.has(k)) err(`as.js has extra key not in en.js: '${k}'`);
}

const prevErrors = errors;
if (errors === prevErrors) console.log('  OK');

// ── 3. Placeholder parity ─────────────────────────────────────────────────────
console.log('\n[2] Placeholder parity');

/** Extract {placeholder} names from a string */
function extractPlaceholders(str) {
  if (typeof str !== 'string') return new Set();
  const matches = str.matchAll(/\{(\w+)\}/g);
  return new Set([...matches].map(m => m[1]));
}

let phErrors = 0;
for (const key of enKeys) {
  const enVal = en[key];
  if (typeof enVal !== 'string') continue; // skip arrays

  const enPh = extractPlaceholders(enVal);
  if (enPh.size === 0) continue; // no placeholders, nothing to check

  for (const [code, obj] of Object.entries(LANGS)) {
    if (code === 'en') continue;
    const val = obj[key];
    if (typeof val !== 'string') continue;
    const ph = extractPlaceholders(val);
    for (const name of enPh) {
      if (!ph.has(name)) {
        err(`${LANG_NAMES[code]} key '${key}': missing placeholder {${name}} (en: "${enVal}")`);
        phErrors++;
      }
    }
    // extra placeholders in translation that aren't in en
    for (const name of ph) {
      if (!enPh.has(name)) {
        err(`${LANG_NAMES[code]} key '${key}': extra placeholder {${name}} not in en.js`);
        phErrors++;
      }
    }
  }
}
if (phErrors === 0) console.log('  OK');

// ── 4. Plural key pairing ─────────────────────────────────────────────────────
console.log('\n[3] Plural key pairing (_one/_other)');

let pluralErrors = 0;
for (const [code, obj] of Object.entries(LANGS)) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (key.endsWith('_one')) {
      const other = key.replace(/_one$/, '_other');
      if (!keys.includes(other)) {
        err(`${LANG_NAMES[code]} key '${key}' has no matching '${other}'`);
        pluralErrors++;
      }
    }
    if (key.endsWith('_other')) {
      const one = key.replace(/_other$/, '_one');
      if (!keys.includes(one)) {
        err(`${LANG_NAMES[code]} key '${key}' has no matching '${one}'`);
        pluralErrors++;
      }
    }
  }
}
if (pluralErrors === 0) console.log('  OK');

// ── 5. Array lengths ──────────────────────────────────────────────────────────
console.log('\n[4] Array lengths');

const ARRAY_LENGTHS = {
  monthsLong: 12,
  monthsShort: 12,
  dowLong: 7,
  dowShort: 7,
};

let arrayErrors = 0;
for (const [code, obj] of Object.entries(LANGS)) {
  for (const [arrayKey, expected] of Object.entries(ARRAY_LENGTHS)) {
    const val = obj[arrayKey];
    if (!Array.isArray(val)) {
      err(`${LANG_NAMES[code]} '${arrayKey}' is not an array`);
      arrayErrors++;
    } else if (val.length !== expected) {
      err(`${LANG_NAMES[code]} '${arrayKey}' has ${val.length} items, expected ${expected}`);
      arrayErrors++;
    }
  }
}
if (arrayErrors === 0) console.log('  OK');

// ── 6. Assamese U+09F0 / U+09F1 check ────────────────────────────────────────
console.log('\n[5] Assamese ৰ (U+09F0) / ৱ (U+09F1) presence');

function allStringValues(obj) {
  const results = [];
  for (const val of Object.values(obj)) {
    if (typeof val === 'string') results.push(val);
    else if (Array.isArray(val)) val.forEach(v => typeof v === 'string' && results.push(v));
  }
  return results;
}

const asStrings = allStringValues(as_);
const hasU09F0 = asStrings.some(s => s.includes('\u09F0'));
const hasU09F1 = asStrings.some(s => s.includes('\u09F1'));

if (!hasU09F0 && !hasU09F1) {
  warn('as.js: neither ৰ (U+09F0) nor ৱ (U+09F1) found in any value — Assamese-specific chars should be present');
} else {
  console.log(`  OK (ৰ U+09F0: ${hasU09F0}, ৱ U+09F1: ${hasU09F1})`);
}

// ── 7. Script cross-contamination ─────────────────────────────────────────────
console.log('\n[6] Script cross-contamination');

// Bengali block: U+0980–U+09FF
const BENGALI_RE = /[\u0980-\u09FF]/;
// Devanagari block: U+0900–U+097F, excluding shared punctuation:
//   U+0964 (Devanagari Danda ।) and U+0965 (Devanagari Double Danda ॥)
//   These are used as sentence-end punctuation in both Devanagari and Bengali/Assamese.
const DEVANAGARI_STRICT_RE = /[\u0900-\u0963\u0966-\u097F]/;

let contamErrors = 0;

// hi.js must not contain Bengali script chars
const hiStrings = allStringValues(hi);
for (const s of hiStrings) {
  if (BENGALI_RE.test(s)) {
    err(`hi.js: Bengali script characters found in value: "${s.substring(0, 60)}"`);
    contamErrors++;
    break; // report once per language
  }
}

// as.js must not contain Devanagari chars (excluding shared dandas U+0964/U+0965)
for (const s of asStrings) {
  if (DEVANAGARI_STRICT_RE.test(s)) {
    err(`as.js: Devanagari characters found in value: "${s.substring(0, 60)}"`);
    contamErrors++;
    break;
  }
}

if (contamErrors === 0) console.log('  OK');

// ── 8. Indic digit check ──────────────────────────────────────────────────────
console.log('\n[7] Indic digits (must be absent)');

// Devanagari digits: U+0966–U+096F  ०-९
const DEVA_DIGITS_RE = /[\u0966-\u096F]/;
// Bengali/Assamese digits: U+09E6–U+09EF  ০-৯
const BENG_DIGITS_RE = /[\u09E6-\u09EF]/;

let digitErrors = 0;
for (const [code, obj] of Object.entries(LANGS)) {
  const strings = allStringValues(obj);
  for (const s of strings) {
    if (DEVA_DIGITS_RE.test(s)) {
      err(`${LANG_NAMES[code]}: Devanagari digit found: "${s.substring(0, 60)}"`);
      digitErrors++;
    }
    if (BENG_DIGITS_RE.test(s)) {
      err(`${LANG_NAMES[code]}: Bengali/Assamese digit found: "${s.substring(0, 60)}"`);
      digitErrors++;
    }
  }
}
if (digitErrors === 0) console.log('  OK');

// ── 9. Unused key detection (best-effort, warnings only) ──────────────────────
console.log('\n[8] Unused key detection (best-effort)');

const UI_FILES = [
  join(ROOT, 'js', 'main.js'),
  join(ROOT, 'js', 'ui', 'home.js'),
  join(ROOT, 'js', 'ui', 'calendar.js'),
  join(ROOT, 'js', 'ui', 'settings.js'),
  join(ROOT, 'js', 'ui', 'sheet.js'),
  join(ROOT, 'js', 'ui', 'guide.js'),
  join(ROOT, 'js', 'ui', 'toast.js'),
  join(ROOT, 'js', 'ui', 'state.js'),
  join(ROOT, 'js', 'ui', 'env.js'),
];

// Collect all referenced keys from t('key') and arr('key') patterns
const referencedKeys = new Set();
// Also match nPlural('key', ...) pattern
const T_PATTERN = /\bt\s*\(\s*['"](\w+)['"]/g;
const ARR_PATTERN = /\barr\s*\(\s*['"](\w+)['"]/g;
const NPLURAL_PATTERN = /\bnPlural\s*\(\s*['"](\w+)['"]/g;

for (const filePath of UI_FILES) {
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    warn(`Could not read file for unused-key check: ${filePath}`);
    continue;
  }

  for (const m of content.matchAll(T_PATTERN)) referencedKeys.add(m[1]);
  for (const m of content.matchAll(ARR_PATTERN)) referencedKeys.add(m[1]);
  for (const m of content.matchAll(NPLURAL_PATTERN)) referencedKeys.add(m[1]);
}

// nPlural references key stems without _one/_other suffix — add those implicitly
const stemKeys = new Set();
for (const k of referencedKeys) {
  // If a stem is referenced, consider both _one and _other covered
  stemKeys.add(k + '_one');
  stemKeys.add(k + '_other');
}
for (const k of stemKeys) referencedKeys.add(k);

// Keys that are structural / meta — never directly called via t()
const KNOWN_IMPLICIT = new Set([
  'appName',          // substituted as {appName} inside strings
  'monthsLong', 'monthsShort', 'dowLong', 'dowShort', // used via arr()
]);

let unusedCount = 0;
for (const key of enKeys) {
  if (KNOWN_IMPLICIT.has(key)) continue;
  if (!referencedKeys.has(key)) {
    warn(`en.js key '${key}' not found in any t()/arr()/nPlural() call (may be dynamic)`);
    unusedCount++;
  }
}
if (unusedCount === 0) console.log('  OK (all keys referenced)');

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\ncheck-i18n: ${errors} errors, ${warnings} warnings`);

if (errors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
