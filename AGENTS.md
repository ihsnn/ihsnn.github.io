# AGENTS.md

Context for agents working in this repo. Personal playground site — a shelf of small
browser toys, mostly nostalgic hardware rebuilt in React.

Stack: React 18 + TypeScript (strict) + Vite 5, Recoil for state, react-router-dom 6,
Tailwind + hand-written CSS, FontAwesome icons. No test runner.

## Commands

```bash
npm install
npm run dev         # Vite dev server, exposed on the LAN (server.host = true)
npm run build       # tsc -b && vite build  ->  dist/
npm run preview     # serve the built dist/
npm run lint        # eslint (flat config) — currently clean (0 errors, 0 warnings)
npm run deploy      # gh-pages -d dist   <- see Deploy, this is dangerous here
npm run deploy:cf   # build + wrangler versions upload (what the Cloudflare build runs)
npm run pages:deploy  # build + wrangler pages deploy dist (static Pages alternative)
```

## Layout

```
src/main.tsx                 React root; imports Tailwind, then tokens.css, then base.css
src/App.tsx                  providers only: ErrorBoundary > RecoilRoot > BrowserRouter
src/app/routes.ts            ROUTES, GAMEBOY_SCENES/SCENE_PATHS, scene-from-path, legacy redirects
src/app/AppRouter.tsx        route table; lazy-loads the console, PokéScan, arcade + story, 404, ScrollToTop
src/app/AppErrorBoundary.tsx render-crash fallback
src/content/projects.ts      cartridge registry (landing shelf + routes)
src/content/landing.ts       cover copy: headline, CTAs, boot log, field notes, marquee words
src/content/gameboy.ts       all console copy: menu rows, letters, songs, gallery, scene titles
src/content/arcade.ts        arcade copy, controls, scoring rows, stage names + wall patterns
src/content/keluarga.ts      family-story copy, appearance options, room-object lines,
                             three final thoughts
src/content/rakcerita.ts     picture-book copy: shelf chrome, reader buttons, sheets,
                             help rows, song card
src/state/gameboy.ts         Recoil atoms (power, indices, envelope) — user state only
src/lib/assets.ts            media registry + `remote()` seam for future CDN hosting
src/lib/scroll.ts            scroll helpers that take an element (no #scroll lookups)
src/lib/useFitScale.ts       scales the fixed chassis to fit the viewport
src/lib/useTilt.ts           pointer-driven 3D tilt for the shelf cards
src/lib/useMediaQuery.ts     matchMedia hook
src/styles/tokens.css        design tokens + the Pixeboy @font-face
src/styles/base.css          document defaults, scrollbars, focus ring, .sr-only
src/components/shared/       SiteHeader, NotFoundPage, ScrollToTop, shared.css
src/features/landing/        LandingPage, LandingNav, Hero, HeroTerminal, Cartridge,
                             Marquee, landing.css
src/features/gameboy/        GameboyPage, GameboyChassis, GameboyScreen, scenes/,
                             input.ts, useGameboyInput.ts, audio.ts,
                             gameboy.css (chassis), stage.css (page chrome),
                             scenes/scenes.css (what is drawn inside the LCD)
src/features/arcade/         ArcadePage, useArcadeGame.ts, game.ts (engine + canvas
                             renderer), sound.ts (WebAudio synth), arcade.css
src/features/keluarga/       KeluargaPage, RoomView.tsx, game.ts (room engine +
                             renderer), character.ts (layered sprite), save.ts,
                             CharacterPreview.tsx, keluarga.css
src/features/pokescan/       PokeScanPage, components/, services/, pokescan.css
src/features/rakcerita/      RakCeritaPage (shelf + reader), SongSheet.tsx, song.ts
                             (AIUEO audio), runtime.ts (stage ⇄ React bridge), fx.ts
                             (particles), audio.ts + speech.ts, shelf.ts (books),
                             types.ts, art/ (core, scenes, rak, covers, blocks,
                             RakIcons), stories/ (one file per book), rakcerita.css
public/                      static files served as-is (favicon, images)
src/assets/                  images, sounds and fonts imported through src/lib/assets.ts
story/                       story bible, cast/locations, chapter sheet, technical notes
```

There is **no backend**: no `functions/`, no Worker script, no `/api`. Everything ships
as static files.

Routes come from `src/app/routes.ts` only: `/` shelf, `/pokescan`, `/arcade`, `/keluarga`,
`/rakcerita`, `/gameboy` boot,
`/gameboy/{menu,start,message,message-display,music,music-display,gallery}`, `*` → 404.
`/gameboy/Gallery` is redirected in `AppRouter` (`LEGACY_REDIRECTS`). Never write a
route string literal in a component — import it.

## How the pieces fit

**Landing page.** A cover, not a list: oversized headline (`content/landing.ts`), a
decorative boot-terminal panel, then the cartridge shelf and three field notes. The
shelf is data-driven: add one object to `src/content/projects.ts` (`id`, `catalogNo`,
`title`, `tagline`, `route`, `color`, `colorDark`, `labelColor`, `code`, `tags`, `year`)
and it appears — colours and the part number are passed to the card as CSS custom
properties, so the cartridge art needs no changes. Each card is a CSS 3D DMG shell
(extruded back plate, embossed logo plate, grip ribs, recessed sticker); it leans toward
the pointer via `lib/useTilt.ts` (mouse only, disabled for reduced motion) and straightens
on hover/focus. The readable title/description sit in the caption below the sculpture;
copy lives in `src/content/landing.ts` and `content/projects.ts`, never in JSX. The
landing does **not** use `SiteHeader` — that is the compact header for cartridge pages.

**Game Boy.** `GameboyPage` owns state, the fit-to-viewport scale and the input
handling; `GameboyChassis` is the dumb physical artwork (it takes `onControl`);
`GameboyScreen` is the LCD's own router plus the ambient audio effect. Three things to
know before changing scenes:
- Scene ids are declared once (`GAMEBOY_SCENES` + `GAMEBOY_SCENE_PATHS`). Adding a scene
  means: declare it, add a `<Route>` in `GameboyScreen`, add its buttons to
  `buildSceneActions` in `useGameboyInput.ts`.
- Control bindings are a `Record<scene, Partial<Record<action, fn>>>` map. There are no
  `location.pathname === '/gameboy/...'` chains left; don't reintroduce them.
- The chassis is fixed-size artwork (`.gameboy` is 660 × 1080 px, plus 30 px of power
  slider above it). Never scale it with ad-hoc `transform`/`scale` inline styles —
  `useFitScale` + `.gb-console` in `stage.css` do it, and `CHASSIS_WIDTH/HEIGHT` in
  `GameboyPage.tsx` must match the CSS.
- Scene text is sized in `scenes/scenes.css` in real pixels for the 352 × 316 LCD.
  Do not go back to `pt` inline sizes; they overflowed the screen.

Copy (the birthday letter, menu labels, song titles) lives in `src/content/gameboy.ts`,
in Indonesian — keep the tone if you edit it.

**Arcade.** `features/arcade/` is the third cartridge. `game.ts` is a headless,
fixed-step engine (320 × 240 playfield) with its own Canvas 2D renderer; it knows nothing
about React. `useArcadeGame.ts` owns the `requestAnimationFrame` loop, keyboard/pointer
bindings, the high-score key (`ihsnn:arcade:high-score`) and the mute flag.
`ArcadePage.tsx` is the cabinet shell and coin-op overlays; stage names, wall patterns and
all copy live in `content/arcade.ts`. Keep gameplay constants in `game.ts` and render at
320 × 240 — CSS scales the canvas with `image-rendering: pixelated`. The cabinet is
decorative CSS; pointer drag on the screen and the deck's move buttons are the touch
controls. Reduced motion turns off screen shake and thins the particles.

**Keluarga Kecil-Kecilan.** `features/keluarga/` is the GBC-style story cartridge at
`/keluarga`. `KeluargaPage.tsx` owns the title/creator/play state machine, dialogue,
choices and save; `RoomView.tsx` owns the canvas loop and keyboard/pointer movement;
`game.ts` holds the 160 × 144 room engine, 16 px tile grid, collision, camera and
Canvas renderer. `character.ts` draws the layered 14 × 20 sprite used by both the room
and the creator mirror. Copy, appearance options, object lines and the final thoughts
live in `content/keluarga.ts`; changing story text should not touch the engine.
The save key is `ihsnn:keluarga:save` (version 1, one slot, localStorage). There is
sound in neither the code nor the plans for this slice yet — audio is a later polish.
Bab 1 currently has one 14 × 9 room and three inspectable memories; see
`story/02-kerangka-teknis.md` before adding a second chapter.

**Rak Cerita Kaluna.** `features/rakcerita/` is the picture-book cartridge at
`/rakcerita`, ported from a standalone single-file HTML app. It is a shelf of four
tappable books (vaksin, kebun, gigi, rakbuku) plus three "coming soon" placeholders.
Two rules keep it maintainable:
- **React owns the frame, the stage is imperative.** `RakCeritaPage` holds the view,
  the page index, stars and the sheets; each page's artwork is an SVG string built in
  `art/` and injected into `#art`, exactly like the original. Taps are delegated
  (`[data-act]` → `page.acts[name]`). The stories reach React through `runtime.ts`
  (`setHost`, `award`, `pageDone`, `go`, `bubble`, `sfx`, …) — never through imports
  of the component.
- **Stories are data.** `stories/*.ts` export a `Story` of `StoryPage`s: caption,
  `art()` and an `acts` map. Copy and drawing sit in the same file on purpose. Adding a
  book means a new file, a row in `shelf.ts` and a `StoryId`.
Sound is the cartridge's own synth (`audio.ts`, `speech.ts`, `fx.ts`). The AIUEO song in
`song.ts` streams the YouTube copy through a hidden player when the page is served over
http(s); from `file://` YouTube refuses the embed (error 153, no referrer) and the
fallback synth plays instead — the sheet labels whichever source is live. Progress lives
under `ihsnn:rakcerita:progress` and `ihsnn:rakcerita:settings` (localStorage).
`rakcerita.css` is the old page stylesheet scoped to the `.rak-cerita` root: do not add
unscoped selectors there, or the palette and the `border-radius:0` reset leak site-wide.

**Audio.** Each cartridge owns its sound. `features/gameboy/audio.ts` is the console's
only audio owner: one ambient loop at a time (`playAmbient`/`stopAmbient`), UI blips
(`playUiSound`), and a persisted mute flag (`useSoundMuted`, `toggleMuted`).
`features/arcade/sound.ts` is a tiny oscillator synth with no audio files and its own
persisted mute (`ihsnn:arcade:muted`). The story cartridge is currently silent.
`use-sound` is no longer used — leave it installed but don't reach for it.

**PokéScan.** All client-side, no API keys:
`Scanner.tsx` (camera/file input) → `services/ocr.ts` (tesseract.js worker, crops the
name band) → `services/nameMatcher.ts` (clean text, score candidates) →
`services/tcgdex.ts` (`https://api.tcgdex.net/v2/en`, public REST).
A score below `CONFIDENCE_THRESHOLD = 0.55` in `services/recognize.ts` surfaces
`ManualCorrection` instead of a confident card. TCGdex image URLs come back without an
extension — append `/high.webp` via `cardImageUrl()`, don't hand-build those URLs.
The page is a one-column device on phones and a two-column "Pokédex spread" from
1000 px (`.dex-layout`); the right column shows a "no entry yet" panel until a card is
read, so the device never shifts when a result arrives.

**No backend.** Everything is client-side: PokéScan calls TCGdex directly from the
browser, the console is pure CSS/audio. There is no `functions/` directory, no Worker
script and no API route. If a server is ever needed, make it a real Worker with a `main`
entry rather than reintroducing Pages Functions.

## Conventions

- TS is strict with `noUnusedLocals`/`noUnusedParameters`; `allowImportingTsExtensions`
  is on. Imports are relative — there is no `@/` alias (adding one needs `@types/node`
  for `vite.config.ts`, which is not installed).
- `vite.config.ts` intentionally has `base` commented out — deploys are at the domain root.
  Uncomment/change it only for a sub-path deploy.
- Three stylesheets describe the console, on purpose, and none of them should be
  refactored into components: `gameboy.css` (≈165 KB of chassis artwork, edit surgically),
  `stage.css` (page chrome + scaling), `scenes/scenes.css` (LCD typography).
  `pokescan.css`, `landing.css`, `arcade.css`, `keluarga.css` and `rakcerita.css` are
  the other page sheets; shared chrome lives in `components/shared/shared.css`.
  `rakcerita.css` is the exception to "no scoping": it is the old standalone page
  stylesheet, and every rule hangs off `.rak-cerita` on purpose.
- Colours/fonts come from `src/styles/tokens.css`; extend it rather than re-declaring a
  palette per page (that is what the `--case`/`--led` copy in `landing.css` used to be).
- The document is dark (`color-scheme: dark`), so anything drawn on the olive LCD must
  set its own ink colour — see `.gb-screen`.
- Installed but unused: `axios`, `@mui/material`, `@mui/x-data-grid`, `sweetalert2`,
  `@emotion/*`, `use-sound`. Ignore them rather than importing them "for consistency".
- Unused media still in `src/assets/`: `sounds/effect-*.mp3`, `sounds/whoop.wav`,
  `fonts/Early-GameBoy.ttf`. Only files referenced from `src/lib/assets.ts` and
  `src/styles/tokens.css` end up in `dist/`.
- `tsconfig.*.tsbuildinfo` and the root `assets/` + `images/` folders are committed
  build output. They are stale snapshots, not source.

## Deploy (read before running)

`npm run deploy` pushes **only `dist/`** to the `gh-pages` branch — but the source
currently lives on that same branch, so deploying this way overwrites the working
tree on the remote with build output. That is why the root `assets/` and `images/`
folders exist: leftovers from a past deploy.

Preferred path is Cloudflare: `wrangler.toml`, Worker `ihsnn-playground`, Workers static
assets. The GitHub integration runs `npm run build` then `wrangler versions upload`;
`npm run deploy:cf` does the same locally. `npm run pages:deploy` is the static Pages
alternative.

The SPA fallback is **config only** — `[assets] not_found_handling =
"single-page-application"` in `wrangler.toml`. There is deliberately no `_redirects`
file: the hand-written one broke two deploys (Cloudflare rejects a rule wrapped onto a
second line) and was removed together with the backend. GitHub Pages still has no
equivalent fallback.

## Media hosting (not done yet)

Assets are bundled by Vite. `src/lib/assets.ts` is the single seam: it exports
`IMAGES`, `GALLERY_IMAGES`, `SOUNDS`, `SCENE_MUSIC`, `SONGS` plus a `remote(path)` helper
driven by `VITE_ASSET_BASE_URL` (see `.env.example`). To move to Cloudflare R2 later,
upload `src/assets/**` and swap the import block for `remote()` calls — no screen or
feature file should need to change. Keep new media imports inside that file.

## Environment notes (this Windows machine)

- This working copy is owned by a non-elevated user; the sandbox runs commands at Low
  integrity. Files created before 2026-10-21 were left at the default Medium label,
  which made them read-only to commands (`npm run build` failing on
  `tsconfig.*.tsbuildinfo`). They were relabelled on 2026-10-21; if writes fail again,
  check integrity labels before suspecting the code.
- `npm run build` inside the sandboxed shell dies with `spawn EPERM` from esbuild
  (piped child process). Run it with full host access instead of debugging it.
  `npx tsc -b` and `npx eslint .` do work inside the sandbox — use them as the fast gate.
