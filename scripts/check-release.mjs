// Run before deploying: node scripts/check-release.mjs   (npm run check-release)
// Catches the mistakes that only show up after launch, when links are already shared and WhatsApp has cached them.
import { readFileSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const root = join(fileURLToPath(import.meta.url), '../..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const errors = [];
if (html.includes('YOUR-DOMAIN')) errors.push('index.html still contains YOUR-DOMAIN. Run: node scripts/set-domain.mjs https://your-real-domain');
const img = join(root, 'assets/og-image.png');
if (!existsSync(img)) errors.push('assets/og-image.png is missing');
else if (statSync(img).size > 300 * 1024) errors.push(`assets/og-image.png is ${Math.round(statSync(img).size / 1024)} KB; WhatsApp skips previews over 300 KB`);
for (const tag of ['og:image', 'twitter:image']) {
  const m = html.match(new RegExp(`(?:property|name)="${tag}" content="([^"]+)"`));
  if (!m) errors.push(`${tag} tag is missing`);
  else if (!m[1].startsWith('https://')) errors.push(`${tag} must be an absolute https URL`);
}
if (errors.length) { console.error('check-release FAILED:\n  ' + errors.join('\n  ')); process.exit(1); }
console.log('check-release: ok');
