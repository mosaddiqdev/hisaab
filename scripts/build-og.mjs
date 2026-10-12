// Builds assets/og-image.png (1200x630) from scripts/og-image.html.
//   npm i --no-save playwright-core && npx playwright-core install chromium     (or: npm i --no-save playwright)
//   node scripts/build-og.mjs [output.png]          Set CHROME_PATH to use a Chromium you already have.
// The phone in the image is a live screenshot of the real app (served locally, clock and data fixed), so the image
// cannot drift from the UI: after a design change, run this again. No internet is needed; fonts are in /fonts.
import { statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { root, launch, serve, openDemoApp } from './lib/demo-app.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(process.argv[2] || join(root, 'assets/og-image.png'));
const { port, close } = serve();
const browser = await launch();

// 1. Screenshot the real app (a phone with a share sheet, so it shows the share icon).
const app = await openDemoApp(browser, port, { width: 390, height: 740, scale: 2, tab: 'calendar', share: true });
const shot = (await app.screenshot()).toString('base64');

// 2. Compose the card.
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto('file://' + resolve(here, 'og-image.html'));
await page.evaluate(src => { document.getElementById('shot').src = src; }, 'data:image/png;base64,' + shot);
await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map(i => i.decode())]));
await page.waitForTimeout(300);
const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '')));
for (const need of ['Fraunces', 'Inter', 'Hind', 'Hind Siliguri']) if (!fonts.includes(need)) throw new Error(`Font did not load: ${need} (got ${fonts.join(', ')})`);
await page.screenshot({ path: out });
await browser.close(); close();
const kb = Math.round(statSync(out).size / 1024);
console.log(`${out}  ${kb} KB`);
if (kb > 300) console.warn('Over 300 KB: WhatsApp may skip the image. Simplify the background or quantize the PNG.');
