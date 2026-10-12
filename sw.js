// Bump VERSION whenever any file changes so installed apps get the update.
const VERSION = 'hisaab-v20';
const FONTS = 'hisaab-fonts-v1'; // kept across app updates
// DEFERRED: Self-hosted woff2 files for Hind (hi) and Hind Siliguri (as) are not yet included.
// Currently fonts are loaded from Google Fonts CDN and cached at runtime in the FONTS cache below.
// On first load in a blocked/offline network the Indic fonts will fall back to system Bengali/Devanagari.
// To fully self-host: download the woff2 subsets, place in /fonts/, add paths to ASSETS, and replace
// the CDN <link> in index.html with @font-face declarations using unicode-range for script isolation.
const ASSETS = ['./','index.html','manifest.webmanifest','css/tokens.css','css/base.css','css/components.css','css/home.css','css/calendar.css','css/settings.css','css/guide.css','css/toast.css','css/motion.css','css/i18n.css',
'js/main.js','js/store.js','js/logic.js','js/i18n.js','js/lang/en.js','js/lang/hi.js','js/lang/as.js','js/utils/date.js','js/utils/format.js',
'js/ui/state.js','js/ui/env.js','js/ui/toast.js','js/ui/roll.js','js/ui/icons.js','js/ui/home.js','js/ui/calendar.js','js/ui/settings.js','js/ui/sheet.js','js/ui/guide.js','js/ui/select.js','js/ui/backup.js',
'icons/icon.svg','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-192.png','icons/icon-maskable-512.png','icons/icon-monochrome-512.png','icons/apple-touch-icon.png','icons/favicon.ico','icons/favicon-16.png','icons/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const host = new URL(e.request.url).hostname;
  if (host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }))));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).catch(() => caches.match('index.html'))));
});
