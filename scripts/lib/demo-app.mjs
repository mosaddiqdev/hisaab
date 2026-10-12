// Shared by build-og.mjs and build-screenshots.mjs: serve the app locally and open it with a fixed clock and sample data,
// so every image of the UI is reproducible and shows the same believable month (26 Oct 2026, price 20, 3 missed days, 2 specials).
import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { resolve, dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

export async function launch() {
  const { chromium } = await import('playwright').catch(() => import('playwright-core'));
  return chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--allow-file-access-from-files'] });
}

export function serve() {
  const server = createServer(async (req, res) => {
    try { const f = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html')); await stat(f);
      res.setHeader('Content-Type', MIME[extname(f)] || 'application/octet-stream'); res.end(await readFile(f)); }
    catch { res.statusCode = 404; res.end(); }
  }).listen(0);
  return { port: server.address().port, close: () => server.close() };
}

// share: true pretends to be a phone with a share sheet (the app then shows the share icon instead of the desktop "copy" icon).
export async function openDemoApp(browser, port, { width, height, scale = 1, tab = '', share = false }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.addInitScript(({ share }) => {
    if (share) Object.defineProperty(navigator, 'share', { value: () => {}, configurable: true });
    const NOW = new Date(2026, 9, 26, 10).getTime(), D = Date;
    window.Date = class extends D { constructor(...a) { a.length ? super(...a) : super(NOW); } static now() { return NOW; } };
    localStorage.setItem('hisaab-v1', JSON.stringify({ monthPrice: { '2026-10': 20 }, priceChanges: {}, startMonth: '2026-10', guideSeen: true, lang: 'en', langPicked: true,
      days: { '2026-10-03': { missed: true }, '2026-10-07': { missed: true }, '2026-10-14': { missed: true }, '2026-10-09': { price: 60 }, '2026-10-18': { price: 30 } } }));
  }, { share });
  await page.goto(`http://localhost:${port}/${tab ? '?tab=' + tab : ''}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500); // let the number roll-up animation finish
  return page;
}
