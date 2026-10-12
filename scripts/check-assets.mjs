// Fails when the service worker's precache list drifts from the files on disk.
// Why: sw.js is a hand-kept list. A file missing from it works online but breaks the installed app offline,
// and a typo in it makes the whole install fail (cache.addAll is all-or-nothing).
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const root = join(fileURLToPath(import.meta.url), '../..');
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const listed = new Set([...sw.slice(sw.indexOf('const ASSETS'), sw.indexOf(']', sw.indexOf('const ASSETS'))).matchAll(/'([^']+)'/g)].map(m => m[1]));
const walk = d => readdirSync(d).flatMap(n => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const rel = f => relative(root, f).split('\\').join('/');
const errors = [];

for (const dir of ['js', 'css']) for (const f of walk(join(root, dir))) if (!listed.has(rel(f))) errors.push(`${rel(f)} is not in sw.js ASSETS (the installed app would break offline)`);
for (const f of listed) if (f !== './' && !existsSync(join(root, f))) errors.push(`sw.js ASSETS lists ${f}, which does not exist (install would fail)`);

// Fonts: every file css/fonts.css points at must exist; the always-needed core must be precached.
const fontsCss = readFileSync(join(root, 'css/fonts.css'), 'utf8');
for (const m of fontsCss.matchAll(/url\(\.\.\/(fonts\/[^)]+)\)/g)) if (!existsSync(join(root, m[1]))) errors.push(`css/fonts.css points at missing ${m[1]}`);
for (const core of ['inter-latin', 'inter-currency', 'fraunces-latin', 'fraunces-currency']) if (!listed.has(`fonts/${core}.woff2`)) errors.push(`core font fonts/${core}.woff2 must be precached`);

// Nothing may load from a third-party host: the app promises no tracking and works offline.
for (const f of ['index.html', 'css', 'js']) for (const file of (f.includes('.') ? [join(root, f)] : walk(join(root, f)))) {
  const hit = readFileSync(file, 'utf8').match(/https?:\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.[^\s"')]+)/);
  if (hit) errors.push(`${rel(file)} loads from a third-party host: ${hit[0]}`);
}


// Every file the manifest and index.html point at must exist (moving or renaming a file is when this breaks silently).
const png = f => { const b = readFileSync(f); return b.readUInt32BE(16) + 'x' + b.readUInt32BE(20); };
const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
const mSrcs = [...manifest.icons, ...(manifest.shortcuts || []).flatMap(s => s.icons || []), ...(manifest.screenshots || [])];
for (const i of mSrcs) {
  const f = join(root, i.src);
  if (!existsSync(f)) { errors.push(`manifest.webmanifest points at missing ${i.src}`); continue; }
  if (i.sizes && /^\d+x\d+$/.test(i.sizes) && i.type === 'image/png' && png(f) !== i.sizes) errors.push(`${i.src} is ${png(f)} but the manifest says ${i.sizes}`);
}
const ratio = {}; // Chrome only shows screenshots of one form factor if they share an aspect ratio
for (const s of manifest.screenshots || []) { const [w, h] = s.sizes.split('x').map(Number); (ratio[s.form_factor] ||= new Set()).add((w / h).toFixed(2)); }
for (const [ff, set] of Object.entries(ratio)) if (set.size > 1) errors.push(`${ff} screenshots have different aspect ratios (${[...set].join(', ')}); Chrome would hide them`);
const index = readFileSync(join(root, 'index.html'), 'utf8');
const refs = [...index.matchAll(/(?:href|src)="([^"#?]+)/g)].map(m => m[1]).filter(r => !/^(https?:|data:|mailto:)/.test(r));
refs.push(...[...index.matchAll(/content="https:\/\/[^/"]+(\/[^"?]+\.(?:png|jpg|svg))/g)].map(m => m[1].slice(1))); // og:image / twitter:image path on the site
for (const r of new Set(refs)) if (!existsSync(join(root, r))) errors.push(`index.html points at missing ${r}`);

if (errors.length) { console.error('check-assets FAILED:\n  ' + errors.join('\n  ')); process.exit(1); }
console.log(`check-assets: ok (${listed.size} precached files match the disk)`);
