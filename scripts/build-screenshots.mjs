// Builds the two showcase screenshots used by README.md and the manifest (richer install dialog):
//   assets/screenshot-mobile.png   1170x2532  (390x844 phone at 3x)   Home tab
//   assets/screenshot-desktop.png  1280x800                           Calendar tab
//   npm i --no-save playwright-core && npx playwright-core install chromium     node scripts/build-screenshots.mjs
//   assets/hero.png                1400x760   both of the above in a browser and phone frame (top of README.md)
// Chrome needs every screenshot of one form factor to share an aspect ratio, so keep one per form factor, or keep sizes equal.
import { statSync, readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { root, launch, serve, openDemoApp } from './lib/demo-app.mjs';

const { port, close } = serve();
const browser = await launch();
const jobs = [
  { file: 'screenshot-mobile.png', width: 390, height: 844, scale: 3, tab: '', share: true },
  { file: 'screenshot-desktop.png', width: 1280, height: 800, scale: 1, tab: 'calendar', share: false },
];
for (const j of jobs) {
  const page = await openDemoApp(browser, port, j);
  const path = join(root, 'assets', j.file);
  await page.screenshot({ path });
  await page.close();
  console.log(`${j.file}  ${j.width * j.scale}x${j.height * j.scale}  ${Math.round(statSync(path).size / 1024)} KB`);
}

// The hero: the two screenshots just written, composed on the brand background. Transparent corners suit light and dark themes.
const data = f => 'data:image/png;base64,' + readFileSync(join(root, 'assets', f)).toString('base64');
const hero = await browser.newPage({ viewport: { width: 1400, height: 760 }, deviceScaleFactor: 1 });
await hero.goto('file://' + resolve(dirname(fileURLToPath(import.meta.url)), 'hero.html'));
await hero.evaluate(([d, m]) => { document.getElementById('desktop').src = d; document.getElementById('mobile').src = m; }, [data('screenshot-desktop.png'), data('screenshot-mobile.png')]);
await hero.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map(i => i.decode())]));
const heroPath = join(root, 'assets', 'hero.png');
await hero.screenshot({ path: heroPath, omitBackground: true });
console.log(`hero.png  1400x760  ${Math.round(statSync(heroPath).size / 1024)} KB`);
await browser.close(); close();
