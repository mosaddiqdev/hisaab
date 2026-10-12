// Renders scripts/og-image.html to icons/og-image.png (1200x630).
//   npm i -D playwright && npx playwright install chromium
//   node scripts/build-og.mjs [output.png]
// The page loads its fonts from Google Fonts, so run this with internet access.
import { chromium } from 'playwright';
import { statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(process.argv[2] || resolve(here, '../icons/og-image.png'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto('file://' + resolve(here, 'og-image.html'));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.screenshot({ path: out });
await browser.close();
const kb = Math.round(statSync(out).size / 1024);
console.log(`${out}  ${kb} KB`);
if (kb > 300) console.warn('Over 300 KB: WhatsApp may skip the image. Simplify the background or quantize the PNG.');
