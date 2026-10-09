export const fmt = n => '₹' + Number((+n).toFixed(2)).toLocaleString('en-IN');
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const num = n => Number((+n).toFixed(2)).toLocaleString('en-IN');
