# Development

Hisaab is plain HTML, CSS and JavaScript modules. There is no framework, no bundler and no runtime dependency, so there is nothing to install before you start.

## Run it

```
python3 -m http.server 8080
```

Open http://localhost:8080. Any static server works. Use `localhost` rather than your LAN address if you want to test the service worker, because browsers only allow service workers on `localhost` and HTTPS.

## Tests and checks

`npm test` runs the first three rows below. CI runs it on every push.

| Command | What it checks |
|---|---|
| `node scripts/test-logic.mjs` | Price timeline, month totals and the text of the bill |
| `node scripts/check-i18n.js` | Every language has the same keys, placeholders and script, and no stray digits |
| `node scripts/check-assets.mjs` | The service worker's file list matches the disk, every file the manifest and `index.html` point at exists, screenshot sizes are right, nothing loads from a third-party host |
| `npm run check-release` | Run before deploying: the domain is set and the link preview image is under WhatsApp's 300 KB limit |

`check-assets` exists because `sw.js` keeps its file list by hand. A file missing from that list works online and breaks the installed app offline, and a typo in it makes the whole install fail.

## Project structure

```
index.html              entry point and meta tags
manifest.webmanifest    PWA manifest: icons, shortcuts, screenshots
sw.js                   service worker and offline cache
_headers                Netlify headers (manifest content type)

css/
  tokens.css            colours, fonts, radius
  fonts.css             @font-face rules (generated, see Fonts)
  base.css              shell layout, tab bar, type scale
  components.css        buttons, inputs, sheets, rolling digits
  home.css  calendar.css  settings.css  guide.css  toast.css
  motion.css            every animation in one file

js/
  main.js               event wiring, tab switching, draw loop
  store.js              localStorage read and write
  logic.js              pricing rules, day info, month summary
  bill.js               builds the bill text (no DOM, so it is tested)
  i18n.js               translation lookup and plurals
  lang/                 en.js, hi.js, as.js
  utils/                date.js, format.js
  ui/                   one file per screen or widget: home, calendar,
                        settings, sheet, guide, select, backup, toast,
                        roll, env, icons, state

icons/                  see Icons
assets/                 see Assets
fonts/                  self-hosted fonts and their licences
scripts/                tests, checks, and the generators for fonts and images
docs/                   this file
```

## Icons

`icons/` holds only what a browser or phone shows as the app's icon.

```
icons/
  icon.svg                  master, also the SVG favicon
  favicon.ico               16, 32 and 48 px in one file
  favicon-16.png  favicon-32.png
  apple-touch-icon.png      iOS home screen, 180x180
  pwa/                      192 and 512 px, maskable 192 and 512, monochrome 512
  shortcuts/                calendar.png, milk-came.png, no-milk.png
  source/figure.svg         the milkman artwork alone, for making new sizes
```

## Assets

`assets/` holds images about the app. All four are generated from the running app, with a fixed date and a sample month (`scripts/lib/demo-app.mjs`), so they can't drift from the UI and the numbers agree with each other. After a design change, rebuild them.

| File | Used by | Rebuild |
|---|---|---|
| `og-image.png` (1200x630) | link previews | `npm run og` |
| `screenshot-mobile.png` (1170x2532) | README, manifest | `npm run screenshots` |
| `screenshot-desktop.png` (1280x800) | README, manifest | `npm run screenshots` |
| `hero.png` (1400x760) | the picture at the top of the README, built from the two screenshots | `npm run screenshots` |

Both scripts need a Chromium: `npm i --no-save playwright-core`, then either `npx playwright-core install chromium` or set `CHROME_PATH` to one you already have. They run offline.

The manifest screenshots give Chrome a richer install dialog. Chrome only shows the screenshots of a form factor if they share one aspect ratio, and `check-assets` enforces that.

### The link preview image

`scripts/og-image.html` is the layout. Platforms crop and shrink previews, so everything important sits inside the central 1080x600 and 60 px away from every edge. The phone may run off the bottom because it is decoration. The file must stay under 300 KB or WhatsApp skips it, and it must be a PNG because WhatsApp and X don't support SVG. The alt text in `index.html` describes the image, so update it if the design changes.

## Fonts

Everything is self-hosted in `fonts/`, with the licences in `fonts/licenses/` (all SIL OFL). `css/fonts.css` and the font files are generated:

```
npm i --no-save @fontsource-variable/fraunces @fontsource-variable/inter \
  @fontsource/hind @fontsource/hind-siliguri \
  @fontsource/tiro-devanagari-hindi @fontsource/tiro-bangla
pip install fonttools brotli
npm run fonts
```

`scripts/build-fonts.py` keeps only what the app uses: Fraunces (weights 400 to 600 plus the optical size and SOFT axes), Inter (400 to 700), and one script per Indic family. The rupee sign sits in the *latin-ext* subset, which is over 100 KB for one glyph, so the script cuts a small currency file instead.

Only the four fonts every screen needs, about 160 KB, are in the service worker's install list. The Hindi and Assamese fonts are about 700 KB, so they download the first time one of those languages is shown and stay cached after that.

## Translations

Strings live in `js/lang/`. `check-i18n` fails if a language is missing a key or has a placeholder the others lack. The Hindi and Assamese text is a first draft that has not been reviewed by a native speaker.

## Releasing

1. Make the change and run `npm test`.
2. Raise `VERSION` in `sw.js` (`hisaab-v1`, then `hisaab-v2`, and so on). Installed apps only update when `sw.js` changes.
3. If the preview image changed, raise the `?v=` on both image URLs in `index.html`. WhatsApp caches previews hard.
4. Run `npm run check-release`.
5. Deploy. The site is served from Netlify at https://tryhisaab.netlify.app, and `_headers` sets the manifest content type.

The service worker keeps its own cache names: `hisaab-v1` for the app files and `hisaab-fonts-v1` for fonts picked up later. `hisaab-v1` in `js/store.js` is something else, the key your users' saved data lives under. Don't rename it.

If the domain ever changes, run `node scripts/set-domain.mjs https://new-domain`. It updates `og:url`, `canonical` and both image URLs in `index.html`.
