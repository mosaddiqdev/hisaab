// Latin digits are used in every language (en-IN grouping style always).
// Passing 'hi' or 'as' to toLocaleString would produce Devanagari/Assamese digits,
// which violates the spec requirement for Latin digits everywhere.
export const fmt = n => '₹' + Number((+n).toFixed(2)).toLocaleString('en-IN');
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const num = n => Number((+n).toFixed(2)).toLocaleString('en-IN');

/**
 * Convert Devanagari (U+0966–U+096F) and Bengali/Assamese (U+09E6–U+09EF)
 * digits to ASCII 0–9 so parseFloat works on any input.
 * @param {string} s
 * @returns {string}
 */
export function normalizeDigits(s) {
  if (!s) return s;
  return String(s)
    .replace(/[\u0966-\u096F]/g, c => c.charCodeAt(0) - 0x0966)   // Devanagari
    .replace(/[\u09E6-\u09EF]/g, c => c.charCodeAt(0) - 0x09E6);  // Bengali/Assamese
}
