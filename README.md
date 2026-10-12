# Hisaab

A PWA for tracking your daily milk bill. One price per month, tap a day when something is different, share the total with your milkman at the end of the month.

No account. No server. Everything lives on the phone.

---

## What it does

- Sets a price per day for the month — inherited automatically if you don't change it
- **New price from a date**: milk price hikes rarely start on the 1st. Tap a day, enter the price, choose "Use this price from this day on". Later months carry it forward; the bill lists the change
- Tap any day to mark it as missed or give it a one-off price
- Rolling monthly total on the home screen, always up to date
- Share the bill as plain text, or **send it on WhatsApp** straight to the milkman's number (set it in Settings)
- Bill language can differ from the app language (custom dropdown, keyboard accessible)
- Backup and restore as a JSON file, with a reminder on Home when it has been a while, and a "download a backup first" option before erasing
- Home-screen shortcuts (long-press the installed app icon): **No milk today**, **Milk came today**, **Open calendar**
- Saves are never silent: if the phone's storage is full or blocked you get a warning. The app asks the browser to keep its storage, redraws after midnight, and offers a reload when a new version is ready

---

## Run it locally

```
python3 -m http.server 8080
```

Open `http://localhost:8080`. That's it — no build step, no bundler.

---

## Install on a phone

Host over HTTPS (Netlify, Vercel, GitHub Pages all work), open it in the browser, tap **Add to Home Screen**.

> After editing any file, bump `VERSION` in `sw.js` — installed apps won't update otherwise.

---

## File map

```
index.html              entry point, meta tags, font links
manifest.webmanifest    PWA manifest
sw.js                   service worker, offline cache

css/
  tokens.css            design tokens: colours, fonts, radius
  base.css              shell layout, tab bar, type scale
  components.css        buttons, inputs, switch, sheets, rolling digits
  home.css              home screen
  calendar.css          calendar grid
  settings.css          settings screen
  guide.css             first-run guide
  toast.css             toast notifications
  motion.css            every animation in one place

js/
  main.js               event wiring, tab switching, draw loop
  store.js              localStorage read/write
  logic.js              pricing rules, day info, month summary

js/ui/
  home.js               home screen render + actions
  calendar.js           calendar render + actions + bill sharing
  settings.js           settings render + actions
  sheet.js              day editor bottom sheet
  guide.js              first-run onboarding flow
  state.js              shared UI state, tab navigation
  toast.js              toast queue
  env.js                reduced motion, haptic feedback
  roll.js               rolling digit animation
  icons.js              inline SVG icons
  select.js             custom dropdown (used for bill language)
  backup.js             download a backup, and when to remind about it

js/utils/
  date.js               date helpers
  format.js             number formatting
```

---

## Icons

`icons/` has the full set:

| File | Purpose |
|---|---|
| `icon.svg` | Master source + favicon |
| `icon-192.png`, `icon-512.png` | Standard PWA icons |
| `icon-maskable-192.png`, `icon-maskable-512.png` | Android adaptive icons (safe-zone padded) |
| `icon-monochrome-512.png` | Themed/monochrome icons |
| `apple-touch-icon.png` | iOS home screen (180×180) |
| `favicon.ico`, `favicon-16.png`, `favicon-32.png` | Browser tab favicons |
| `og-image.png` | Link preview image (1200×630) |

---

## Hosting checklist

- Serve over HTTPS
- Serve `manifest.webmanifest` as `application/manifest+json`
- Keep `sw.js` at the site root so its scope covers the whole app
- Replace `YOUR-DOMAIN` in `index.html` with your real domain (two places: `og:image` and `twitter:image`). The image URL must be absolute, https and must not redirect

---

## Checks

```
node scripts/check-i18n.js      translations: key parity, placeholders, scripts, digits
node scripts/test-logic.mjs     price timeline and month totals
```

## Link preview image

`scripts/og-image.html` is the source of `icons/og-image.png` (1200×630, under 300 KB). Rebuild with `node scripts/build-og.mjs` (needs `npm i -D playwright`). Rules it follows: everything important sits in the centre 630×630 because platforms centre-crop (X shows 2:1, WhatsApp may use a square thumbnail); PNG, since WhatsApp and X don't support SVG. After changing the image, bump `?v=` on the two image URLs in `index.html`, because WhatsApp caches previews hard.

## i18n

Run `node scripts/check-i18n.js` to validate translations. Hindi and Assamese strings are DRAFTS — see `.agents/tasks/i18n/glossary.md` for reviewer notes.

---

## TODO

- [ ] Add real `screenshots` to the manifest — need one `form_factor: "narrow"` phone screenshot and one `"wide"` desktop screenshot. This unlocks the richer install dialog on Android/Chrome.
