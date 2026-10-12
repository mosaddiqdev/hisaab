// Bump VERSION whenever any file changes so installed apps get the update.
const VERSION = 'hisaab-v1';
const FONTS = 'hisaab-fonts-v1'; // fonts picked up while using the app; kept across app updates
// Only the fonts every screen needs are precached (below). Hindi and Assamese fonts are about 700 KB, so they are
// saved the first time they are used instead of making every English user download them at install.
const ASSETS = ['./','index.html','manifest.webmanifest','css/fonts.css','css/tokens.css','css/base.css','css/components.css','css/home.css','css/calendar.css','css/settings.css','css/guide.css','css/toast.css','css/motion.css','css/i18n.css',
'js/main.js','js/store.js','js/logic.js','js/bill.js','js/i18n.js','js/lang/en.js','js/lang/hi.js','js/lang/as.js','js/utils/date.js','js/utils/format.js',
'js/ui/state.js','js/ui/env.js','js/ui/toast.js','js/ui/roll.js','js/ui/icons.js','js/ui/home.js','js/ui/calendar.js','js/ui/settings.js','js/ui/sheet.js','js/ui/guide.js','js/ui/select.js','js/ui/backup.js',
'fonts/inter-latin.woff2','fonts/inter-currency.woff2','fonts/fraunces-latin.woff2','fonts/fraunces-currency.woff2',
'icons/icon.svg','icons/pwa/icon-192.png','icons/pwa/icon-512.png','icons/pwa/icon-maskable-192.png','icons/pwa/icon-maskable-512.png','icons/pwa/icon-monochrome-512.png','icons/apple-touch-icon.png','icons/favicon.ico','icons/favicon-16.png','icons/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok && url.pathname.includes('/fonts/')) caches.open(FONTS).then(c => c.put(e.request, r.clone()));
    return r;
  }).catch(() => e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())));
});
