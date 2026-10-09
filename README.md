# Hisaab

A PWA for tracking your daily milk bill. One price per month, tap a day when something is different, share the total with your milkman at the end of the month.

No account. No server. Everything lives on the phone.

---

## What it does

- Sets a price per day for the month — inherited automatically if you don't change it
- Tap any day to mark it as missed or give it a one-off price
- Rolling monthly total on the home screen, always up to date
- Share the bill as plain text (or copy it if the device doesn't support sharing)
- Backup and restore as a JSON file

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
- Replace `YOUR-DOMAIN` in `index.html` with your real domain for the og:image URL

---

## i18n

Run `node scripts/check-i18n.js` to validate translations. Hindi and Assamese strings are DRAFTS — see `.agents/tasks/i18n/glossary.md` for reviewer notes.

---

## TODO

- [ ] Add real `screenshots` to the manifest — need one `form_factor: "narrow"` phone screenshot and one `"wide"` desktop screenshot. This unlocks the richer install dialog on Android/Chrome.
