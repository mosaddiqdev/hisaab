// node scripts/set-domain.mjs https://your-domain.com
// Points every absolute URL in index.html (og:url, og:image, twitter:image, canonical) at the given domain.
// Works for the first setup (placeholder) and for a later move. These URLs must be absolute, so they cannot be relative.
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const arg = (process.argv[2] || '').trim().replace(/\/+$/, '');
let host;
try { const u = new URL(arg); if (u.protocol !== 'https:' || (u.pathname !== '/' && u.pathname !== '')) throw 0; host = u.host; }
catch { console.error('Usage: node scripts/set-domain.mjs https://your-domain.com   (https only, no path)'); process.exit(1); }

const file = join(fileURLToPath(import.meta.url), '../../index.html');
const html = readFileSync(file, 'utf8');
const tag = /(<meta (?:property|name)="(?:og:url|og:image|twitter:image)" content="|<link rel="canonical" href=")https:\/\/[^\/"]+/g;
const found = [...html.matchAll(tag)].length;
if (!found) { console.error('No og:url, og:image, twitter:image or canonical tag found in index.html.'); process.exit(1); }
writeFileSync(file, html.replace(tag, `$1https://${host}`));
console.log(`Pointed ${found} tags at ${host}. Raise the sw.js VERSION, deploy, then check the link preview (docs/development.md, Releasing).`);
