# IHSNN — playground

A shelf of small browser toys, mostly nostalgic hardware rebuilt in React.
Eight cartridges are plugged in today:

| Cartridge | Route | What it is |
| --- | --- | --- |
| **GAME BOY** | `/gameboy` | A hand-built replica console. Works with mouse, touch and keyboard. |
| **POKÉSCAN** | `/pokescan` | Point a camera (or upload a photo) at a Pokémon TCG card and get its card data back. OCR runs on-device. |
| **NEON BREAKER** | `/arcade` | An upright neon arcade cabinet with a six-stage brick-buster, chiptune SFX and a persisted high score. |
| **KELUARGA KECIL-KECILAN** | `/keluarga` | A GBC-style family story. Chapter 1, “Tentang Aku,” is a playable room with character creation, keepsakes and autosave. |
| **RAK CERITA KALUNA** | `/rakcerita` | Four tappable picture books with narration, songs and a shelf that never stays tidy. |
| **PHOTOBOOTH** | `/photobooth` | Twenty-five photo-strip layouts drawn on canvas. Shoot or pick one or two photos, crop/reposition them, add a line of text, hear each template’s sound, and download the PNG — all on-device. |
| **PIARA** | `/piara` | A pocket creature on a translucent keychain. Hatch and name it, then keep three needs up while real time passes; it grows through four stages and keeps one save slot in `localStorage`. |
| **WARKOP** | `/warkop` | A beige cash register with four seats: cook five dishes on two burners, read the queue, and keep the tips coming for ninety seconds. |

React 18 · TypeScript (strict) · Vite 5 · Recoil · React Router 6 · Tailwind + hand-written CSS.

## Getting started

```bash
npm install
npm run dev        # dev server, exposed on the LAN
npm run build      # tsc -b && vite build  ->  dist/
npm run preview    # serve the built dist/
npm run lint       # eslint (flat config)
```

## Routes

Every URL is declared once in [`src/app/routes.ts`](src/app/routes.ts):

```
/                     the cartridge shelf
/pokescan             PokéScan
/arcade               Neon Breaker cabinet
/keluarga             Keluarga Kecil-Kecilan, Bab 1
/rakcerita            Rak Cerita Kaluna
/photobooth           Photo Booth (25 strips)
/piara                PIARA, the pocket creature
/warkop               WARKOP, the ninety-second counter
/gameboy              console boot screen
/gameboy/menu         console menu
/gameboy/start        intro scene
/gameboy/message      message picker
/gameboy/message-display   the letter
/gameboy/music        track picker
/gameboy/music-display
/gameboy/gallery      photo strip
*                     "no cartridge in this slot" (404)
```

`/gameboy/Gallery` (the old capitalised URL) redirects to `/gameboy/gallery`.

## Project layout

```
src/
  app/            composition root: AppRouter (lazy routes), route table, error boundary
  components/
    shared/       SiteHeader, NotFoundPage, ScrollToTop + their stylesheet
  content/        all copy + data: cartridges, menu rows, letters, songs, scene titles
  features/
    landing/      cartridge shelf
    gameboy/      chassis, LCD router, scenes, input map, audio, styles
    arcade/       Neon Breaker game engine, canvas renderer, cabinet UI, chiptune audio
    keluarga/     family-story room engine, character sprites, GBC-style UI, save
    pokescan/     scanner UI, OCR services, TCGdex client
    rakcerita/    picture-book shelf, stage runtime, SVG art, stories, synth audio
    photobooth/   strip catalogue, canvas painters, camera/photo hook, booth UI
    piara/        real-time pet simulation, 160×120 canvas renderer, keychain shell, save
    warkop/       counter simulation engine, 320×240 canvas renderer, register UI, save
  lib/            assets registry, scroll helpers, fit-to-viewport hook
  state/          Recoil atoms (user state only)
  styles/         design tokens + base layer
  assets/         images, sounds, fonts (imported through src/lib/assets.ts)
public/           static files served as-is (favicon, images)
story/            story bible, cast/locations, chapter sheet, technical notes
```

There is no backend — no `functions/`, no Worker script, no `/api`. Everything ships as
static files; PokéScan queries TCGdex directly from the browser, the photobooth keeps
every camera frame and file on-device, and the story cartridge keeps its character and
chapter progress in `localStorage`.

The story bible, cast sheet and chapter worksheets live in [`story/`](story/README.md).

## Adding things

- **A new cartridge** — add one object to [`src/content/projects.ts`](src/content/projects.ts)
  (`catalogNo`, `title`, `tagline`, `route`, colours, `code`, `tags`, `year`). The shelf
  renders it as a 3D shell and the label art derives from the colours and part number;
  nothing else needs touching.
- **A new console scene** — add the id to `GAMEBOY_SCENES` and the path to
  `GAMEBOY_SCENE_PATHS` in [`src/app/routes.ts`](src/app/routes.ts), add a
  `<Route>` in [`src/features/gameboy/GameboyScreen.tsx`](src/features/gameboy/GameboyScreen.tsx),
  and bind its buttons in `buildSceneActions` in
  [`src/features/gameboy/useGameboyInput.ts`](src/features/gameboy/useGameboyInput.ts).
- **Copy / text** — everything the console shows lives in
  [`src/content/gameboy.ts`](src/content/gameboy.ts) (Indonesian, matching tone).
- **Media** — import through [`src/lib/assets.ts`](src/lib/assets.ts) only.
- **Story content** — copy, object lines, stage choices and appearance options live in
  [`src/content/keluarga.ts`](src/content/keluarga.ts). The engine is one room right now;
  see [`story/02-kerangka-teknis.md`](story/02-kerangka-teknis.md) before adding Chapter 2.

## Controls

**Game Boy**

| Action | Keyboard |
| --- | --- |
| D-pad | `W` `A` `S` `D` or arrow keys |
| B / A | `J` / `K` (or `Z` / `X`) |
| Start / Select | `M` / `N` (or `Enter` / `Shift`) |
| Power | `P`, or the slider on top of the chassis |

**Neon Breaker**

| Action | Keyboard |
| --- | --- |
| Move | `←` `→` / `A` `D`, or drag on the screen |
| Launch / start | `Space` or `Enter` |
| Pause | `P` / `Esc` |
| Mute | `M` |

**Keluarga Kecil-Kecilan**

| Action | Keyboard |
| --- | --- |
| Move | Arrow keys / `W` `A` `S` `D`, or the on-screen D-pad |
| Inspect / advance / choose | `Space` or `Enter`, or the on-screen `A` button |
| Pause / menu | `Esc`, or the console’s MENU button |

**Photo Booth**

| Action | Keyboard / pointer |
| --- | --- |
| Pick a strip | Click/tap a layout card; deep link with `?strip=<id>` or `#<id>` |
| Start camera | The “Nyalakan kamera” button (permission prompt) |
| Shoot | The shutter button — a 3–2–1 countdown runs first |
| Local photo | “Pilih dari galeri” or the per-slot “Pilih” action |
| Reposition / crop | “Atur” on a filled slot; drag, zoom, nudge, then “Terapkan” |
| Custom text | The “Tulisan strip” field in Step 03; up to 40 characters |
| Mute | The speaker button; the flag persists in `ihsnn:photobooth:muted` |
| Download | “Unduh PNG” once every slot is filled |

**PIARA**

| Action | Keyboard / pointer |
| --- | --- |
| Hatch | Tap the egg five times |
| Name | The sheet that appears after hatching |
| Feed / play / sleep / clean | The four case buttons, or `F` / `P` / `S` / `C` |
| Wake | Press `BANGUN` (the sleep button) |
| Mute | The speaker button on the case; the flag persists in `ihsnn:piara:muted` |

**WARKOP**

| Action | Keyboard / pointer |
| --- | --- |
| Open the shop | The “BUKA WARKOP” button, or `Enter` |
| Cook a dish | The five register keys, or `1`–`5` |
| Close a day early | The red `TUTUP` button on the machine |
| Mute | The speaker button on the machine; the flag persists in `ihsnn:warkop:muted` |
| Best day | Saved automatically under `ihsnn:warkop:best` |

## Building for the web

The app uses real URLs (BrowserRouter), so the host must fall back to
`index.html` for unknown paths:

- **Cloudflare** — `npm run deploy:cf`, or the Git integration (build `npm run build`,
  deploy `wrangler deploy`). Deep links work through
  `not_found_handling = "single-page-application"` in [`wrangler.toml`](wrangler.toml);
  there is no `_redirects` file to keep in sync. Cache and security headers come from
  [`public/_headers`](public/_headers). `npm run pages:deploy` is the static Pages
  alternative.
- **GitHub Pages** — `npm run deploy` pushes only `dist/`, and there is no
  SPA fallback there. The `gh-pages` branch must not be the branch holding the
  source; prefer Cloudflare.

## Media hosting (future)

Assets are bundled by Vite today. [`src/lib/assets.ts`](src/lib/assets.ts) is
the only module that knows where bytes come from, and it ships a `remote()`
helper plus `VITE_ASSET_BASE_URL` (see `.env.example`) so the files can move to
Cloudflare R2 / a CDN later without touching any screen.
