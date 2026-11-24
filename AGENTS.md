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
npm run deploy:cf   # build + wrangler deploy (what the Cloudflare build runs)
npm run pages:deploy  # build + wrangler pages deploy dist (static Pages alternative)
```

## Layout

```
src/main.tsx                 React root; imports Tailwind, then tokens.css, then base.css
src/App.tsx                  providers only: ErrorBoundary > RecoilRoot > BrowserRouter
src/app/routes.ts            ROUTES, GAMEBOY_SCENES/SCENE_PATHS, scene-from-path, legacy redirects
src/app/AppRouter.tsx        route table; lazy-loads every cartridge, 404, ScrollToTop
src/app/AppErrorBoundary.tsx render-crash fallback
src/content/projects.ts      cartridge registry (landing shelf + routes)
src/content/landing.ts       cover copy: headline, shelf actions, boot log, field notes,
                             marquee words
src/content/gameboy.ts       all console copy: menu rows, letters, songs, gallery, scene titles
src/content/arcade.ts        arcade copy, controls, scoring rows, stage names + wall patterns
src/content/keluarga.ts      family-story copy, appearance options, room-object lines,
                             three final thoughts
src/content/rakcerita.ts     picture-book copy: shelf chrome, reader buttons, sheets,
                             help rows, song card
src/content/photobooth.ts    strip catalogue + booth copy + per-layout sound recipes
src/content/piara.ts         pocket-pet copy: actions, moods, stages, naming sheet
src/content/warkop.ts        warkop menu catalogue + page copy + rupiah helpers
src/content/todo.ts          to-do copy, priorities, level titles, seed tasks, formatters
src/content/angkut.ts        hill-climb levels (terrain, cargo, palette), garage, copy
src/content/suara.ts         sound catalogue (40 sounds, categories), quiz constants, copy
src/content/pekan/           island data (maps, NPCs, warps, the seven branches, teams)
                             plus every page string — `island.ts`, `copy.ts`
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
                             CartridgeArt, Marquee, landing.css
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
src/features/photobooth/     PhotoboothPage, ExportCanvas.tsx, CropEditor.tsx,
                             LayoutCard.tsx, StripCanvas.tsx, usePhotobooth.ts
                             (camera + shots + exports), export.ts (ratios,
                             backdrops, PNG + WebM), crop.ts (pan/zoom math),
                             sound.ts (WebAudio signatures), art.ts (canvas
                             primitives), render/ (index + motion + holo/analog/
                             print painters), useFontsReady.ts, photobooth.css
src/features/piara/          PiaraPage, ActionIcon.tsx, usePiara.ts (clock + save +
                             rAF loop), sim.ts (needs, sleep, evolution), sprite.ts
                             (160 × 120 renderer), save.ts, audio.ts, types.ts, piara.css
src/features/warkop/         WarkopPage, useWarkop.ts (loop + save), engine.ts
                             (customers, burners, scoring), render.ts (320 × 240 scene),
                             audio.ts, types.ts, warkop.css
src/features/todo/           TodoPage, useTodo.ts (list + selection + undo + autosave),
                             quest.ts (XP, levels, streaks, ordering), save.ts, audio.ts,
                             types.ts, todo.css
src/features/angkut/         AngkutPage, useAngkut.ts (loop + pedals + save), engine.ts
                             (rigid-body truck, 180 Hz, runs and pickups), terrain.ts
                             (seeded road + kicker ramps), render.ts (480 × 270 world),
                             audio.ts, save.ts, types.ts, angkut.css
src/features/suara/          SuaraPage, SoundCard, SoundArt, SoundButton,
                             FullscreenViewer, QuizPanel, useQuiz.ts (rounds),
                             useSuara.ts (speaker + mute + art + best), audio.ts
                             (20 recordings + synth fallback + blips), pixel.ts
                             (SVG → 64 × 64 median-cut raster), storage.ts, suara.css
src/features/pekan/          PekanPage, usePekan.ts (loop + input + autosave), game.ts
                             (mode machine), world.ts (tiles, camera, warps, companion),
                             save.ts, input.ts, sports/ (types, registry, archery),
                             render/ (tiles, actors, ui, index), pekan.css, README.md
public/                      static files served as-is (favicon, images)
src/assets/                  images, sounds and fonts imported through src/lib/assets.ts
story/                       story bible, cast/locations, chapter sheet, technical notes
```

There is **no backend**: no `functions/`, no Worker script, no `/api`. Everything ships
as static files.

Routes come from `src/app/routes.ts` only: `/` shelf, `/pokescan`, `/arcade`, `/keluarga`,
`/rakcerita`, `/photobooth`, `/piara`, `/warkop`, `/todo`, `/angkut`, `/suara`, `/pekan`,
`/gameboy`
boot, `/gameboy/{menu,start,message,message-display,music,music-display,gallery}`, `*` → 404.
`/gameboy/Gallery` is redirected in `AppRouter` (`LEGACY_REDIRECTS`). Never write a
route string literal in a component — import it.

## How the pieces fit

**Landing page.** A cover, not a list: oversized headline (`content/landing.ts`), a
decorative boot-terminal panel, then the cartridge shelf and three field notes. The
shelf is data-driven: add one object to `src/content/projects.ts` (`id`, `catalogNo`,
`title`, `tagline`, `route`, `color`, `colorDark`, `labelColor`, `code`, `tags`, `year`)
and it appears — colours and the part number are passed to the card as CSS custom
properties. The label illustration is a per-id SVG in `CartridgeArt.tsx`; a cartridge
without a case there falls back to `GenericPackArt`, so draw one when the label matters.
Each card is a CSS 3D DMG shell
(extruded back plate, embossed logo plate, grip ribs, recessed sticker); it leans toward
the pointer via `lib/useTilt.ts` (mouse only, disabled for reduced motion) and straightens
on hover/focus. The readable title/description sit in the caption below the sculpture;
copy lives in `src/content/landing.ts` and `content/projects.ts`, never in JSX. The
landing does **not** use `SiteHeader` — that is the compact header for cartridge pages.
The cover never points at two hand-picked cartridges: `HERO.actions` drives a "browse the
shelf" action that scrolls to `SHELF_ID` (keep that id on the shelf section) and a
"surprise me" action that links to a cartridge picked per visit, and `HERO.quickLabel`
captions a numbered shortcut for every entry in `CARTRIDGES` — both grow with the
registry.

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

**Photo Booth.** `features/photobooth/` is the 41-layout photo-strip cartridge at
`/photobooth`. The split is strict:
- `content/photobooth.ts` is the whole catalogue (`STRIP_LAYOUTS`: copy, 1-or-2 slot
  count, design size, style id, shine, `date`, optional `motion`, picker theme,
  per-layout sound recipe) plus every page string, the export shapes and the backdrop
  list. `LEGACY_LAYOUT_IDS` keeps old `?strip=` ids working.
- `render/` is the only code that draws. `art.ts` holds shared primitives (rounded clips,
  cover-cropped photos with designed placeholders, grain, halftone, barcode, holo,
  gloss, `formatDate`); `holo.ts`, `analog.ts` and `print.ts` each export a `Painter` map
  and `render/index.ts` merges them into `Record<StripLayout['style'], Painter>` so a new
  catalogue style is compiler-checked. `renderStrip()` owns canvas sizing and the single
  scale transform; painters stay in design-space units and receive `date` plus `time`
  (0 for a still). `render/motion.ts` paints the looping shine/scan/tape pass after the
  painter, so a video frame shares every pixel with the PNG.
- `export.ts` wraps the strip: `planFrame()` decides the final canvas (native strip,
  1:1, 4:5 or 9:16), `composeStrip()` paints the backdrop plus the strip, `exportImage()`
  returns the PNG and `exportVideo()` records a four-second WebM loop with
  `MediaRecorder`. Backdrops are painted presets (`EXPORT_BACKGROUNDS`) plus `image`:
  a user photo supplied as `{ image, crop }` and drawn by `drawCrop()`.
- `PhotoboothPage.tsx` is the view, `usePhotobooth.ts` owns the camera stream, the 3-2-1
  capture, the local-file fallback, one or two shots, the editable date, the export shape
  and backdrop (including grabbing a frame as the backdrop), sounds and the downloads.
  Photos never leave the browser and are not persisted; the only localStorage key is
  `ihsnn:photobooth:muted`.
- Picker thumbnails use `StripCanvas.tsx` (the painter at thumb scale) and the preview
  uses `ExportCanvas.tsx` (the composed export, animated when the layout has motion).
  Never build a second CSS mock of a strip: a thumbnail would then promise a design the
  export does not deliver. `useFontsReady.ts` repaints once the Google fonts arrive.
- Exports bake foil, gloss, grain, the backdrop and the strip shadow into the canvas; the
  preview adds a CSS sheen on top. Keep both: the downloaded file must still look shiny
  outside the site. Large exports run at `STRIP_EXPORT_SCALE = 2` (design px × 2); the
  ratio formats are 1080 px wide and the video scales the strip to ~1080 px on its long
  edge.
- Shots keep the original decoded image plus a `CropTransform` (`crop.ts`).
  `usePhotobooth` bakes it into a canvas with the slot aspect from
  `STRIP_CROP_ASPECTS`; painters only ever receive cover-ready images, and both the slot
  sheet and the backdrop sheet use the same `drawCrop()` math. Never crop only in CSS or
  only at export time.
- The custom line travels as `Scene.caption` through `renderStrip()` / `composeStrip()`.
  Each painter draws it at a designed text spot with a `maxWidth` and its own fallback
  copy. Do not replace this with a generic overlay bar — it would cover the footers and
  break the individual layouts.
- Passports are drawn as an open book spread: identity page (photo, fields, MRZ) facing
  a visa page of stamps. `passportId` is deliberately a souvenir: fictional issuer, a red
  "SOUVENIR · NOT A TRAVEL DOCUMENT" band and no real state emblem, Indonesian passport
  wording or captured identity data.
- Camera access needs a user gesture. `getUserMedia` failures are classified as denied /
  missing / insecure / broken and the gallery fallback is always offered. File picks are
  downscaled to `MAX_PHOTO_EDGE = 1600` and converted to a data URL before use, which
  keeps the export canvas untainted and the workflow serverless.
- `sound.ts` synthesises the shutter, countdown and each catalogue `LayoutSound`
  selection/finish phrase. No audio files.

**PIARA.** `features/piara/` is the pocket-pet cartridge at `/piara`: a translucent
keychain with a 160 × 120 LCD. `sim.ts` is the whole rulebook — needs decay in real time,
sleep restores energy, droppings accumulate, and the creature evolves through
`telur → bayi → anak → remaja → dewasa` once it is old enough *and* its average need is
above 45. Time is real rather than simulated by a loop: `advance(pet, now)` catches up
however long the tab was closed (capped at 36 h), which is why a closed tab still costs
food and why the cartridge needs no server.
- `sprite.ts` draws the room, the egg and the layered creature from rectangles; there are
  no sprite sheets and no audio files. The palette follows the device clock — blue day,
  peach dawn, violet dusk, indigo night — and the need gauges sit on a translucent card
  so they stay readable at every hour. Keep the canvas at 160 × 120 and let CSS scale it
  (`image-rendering: pixelated`).
- `usePiara.ts` owns the 1 s tick, the rAF loop, the naming sheet, the save and the
  speaker. Save key `ihsnn:piara:save` (version 1, one slot); mute key
  `ihsnn:piara:muted`.
- The egg is a five-tap hatch followed by a naming dialog. While `name` is empty,
  `advance()` deliberately does not age the pet — do not remove that guard.
- Copy (bubbles, refusals, stage notes, the naming sheet) lives in `content/piara.ts`;
  tuning (decay per hour, growth thresholds, the evolution gate) lives in `sim.ts`.

**WARKOP.** `features/warkop/` is the 90-second counter cartridge at `/warkop`: a beige
cash register with a striped awning, a 320 × 240 colour screen and five moulded menu keys.
- `engine.ts` is headless and holds all tuning: four fixed seats, customers arriving on a
  curve that tightens towards closing, orders of one to three dishes, patience that turns
  into tips, and a hard **two-burner** limit (`MAX_BURNERS`) — that limit is the game's
  only real decision. A completed order is handed over automatically; there is no serve
  click. Day length, spawn curve, patience and the tip formula live here.
- `render.ts` draws the room, shelves, clock, four regulars and their order tickets at
  320 × 240. A ticket is a vertical receipt: a 12 px food icon plus the 8 px dish name per
  row, so it maps one-to-one to the five register keys. `drawItemIcon` is shared with the
  counter tray. Keep coordinates in the 320 × 240 design grid: `useWarkop` sizes the
  backing store to CSS size × DPR and `renderWarkop` applies the scale, so text is crisp
  instead of an upscaled 320 px bitmap.
- `useWarkop.ts` owns the rAF loop, a 10 Hz snapshot for the register keys, the `1`–`5`
  and `Enter` shortcuts, the speaker and the best day (`ihsnn:warkop:best`). Mute is
  `ihsnn:warkop:muted`.
- The menu catalogue, prices, prep times and every string live in `content/warkop.ts`;
  changing a dish should not touch the engine. Serve → happy → leave is the only customer
  animation path; do not add a manual serve click without revisiting the burner balance.

**TO-DO LIST.** `features/todo/` is the pocket-organizer cartridge at `/todo`: a graphite
TASK-9 with an amber LCD, a D-pad, A/B keys and four flat command keys. The split:
- `quest.ts` is the rulebook and has no React: text hygiene (trim, collapse, cap at 90),
  the sixty-task limit, priority XP, the level curve (`100 + (level - 1) * 60`), combo
  windows, local-day streaks, display ordering (open in insertion order, done oldest
  first) and the four seed tasks. `liveStreak()` is what the UI shows: a stored streak
  whose last completion is older than yesterday reads as zero until the next tick.
- `useTodo.ts` owns the list, selection, the ten-entry session undo stack, the clock, the
  autosave and the speaker. Actions read `stateRef` rather than the render's state, so two
  rapid key presses cannot overwrite each other — keep that pattern when adding an action.
  Add, tick, priority, delete, undo (`Ctrl+Z`), clear-done, clear-all and reset all live
  here; the page only binds keys and buttons to them.
- `save.ts` is `ihsnn:todo:save` (version 1, one slot) plus `ihsnn:todo:muted`. It
  validates every task and falls back per field, so a partial save still loads. Emptying
  the list keeps XP/level/streak on purpose; `resetAll()` clears the key and reseeds the
  four examples.
- `TodoPage.tsx` renders the device as DOM, not canvas, because the list must stay
  writable, focusable and selectable. The LCD is a real form (`>` + input + TAMBAH), each
  row is a checkbox button plus select/priority/delete buttons, and the D-pad/A/B keys
  call the same controller actions. The window-level keyboard listener ignores typing and
  native button activation; removing those guards makes Space/Enter fire twice.
- `todo.css` is the case, amber LCD and keycaps, scoped to `.todo-page`. The checkbox is a
  26 × 26 hit area around a 17 px box — keep the visual box smaller than the target.

**ANGKUT.** `features/angkut/` is the hill-climb hauler at `/angkut`: a big dump truck,
two pedals, six routes and six loads. The whole point is that the load is a gameplay
stat, not a skin:
- `engine.ts` is headless and owns every rule. A fixed 180 Hz loop integrates one rigid
  body; each wheel is a raycast suspension along the chassis's own down axis (rest +
  travel, force capped by `MAX_SUPPORT`), and the drive force is clamped by the friction
  cone under that wheel. That is why a heavy load is slow (force / mass), a tall load
  tips (`comLocal()` lifts the centre of gravity), and a slippery level spins the tyres.
  Do not "simplify" the suspension back to a rigid wheel: it launched the truck off ramps
  and made landings unrecoverable. A pitch assist only runs while a wheel is on the road,
  and is what stops bumps under the front wheel from becoming backflips.
- `terrain.ts` bakes the seeded hills into a slope-limited table (so no route can contain
  a wall the heaviest truck cannot climb) and then adds the kicker ramps on top — the
  only place the road is allowed to be sharp. `render.ts` and the wheels sample that same
  `heightAt()`; never draw a road from a second function.
- `render.ts` draws the 480 × 270 world from primitives (no sprites): sky, parallax
  ridges, the road, coins, cans, depot flag, truck and the six cargo painters. The truck's
  geometry is `TRUCK` in `engine.ts`, so painting and collision share one set of numbers.
  `useAngkut` sizes the backing store to CSS × DPR and the renderer applies one scale —
  keep design-space coordinates, and keep the canvas at 16 / 9.
- `useAngkut.ts` owns the rAF loop, the pedals (pointer capture on a hold, keyboard
  `→/D` gas, `←/A` brake, `Enter`, `R`, `M`), the 10 Hz snapshot, the garage purchase and
  the save. `save.ts` is `ihsnn:angkut:progress` (version 1: coins, `{engine, tires,
  tank}` 0–3, one record per route) plus `ihsnn:angkut:muted`; every field is validated,
  and a route opens only once the one before it is cleared.
- Adding a route is one object in `content/angkut.ts` (`terrain`, `cargo`, `palette`,
  `grip`, `targetM`, copy) — the engine, the renderer, the picker and the garage all grow
  from `LEVELS` and `GARAGE`. Cargo `mass`/`height`/`slide` are the level's difficulty
  dial; `shape` picks the painter.

**TELINGA EMAS.** `features/suara/` is the listening game at `/suara`: forty sounds in
four categories, two picture modes (8-bit drawing or real photograph), a quiz and a
full-screen viewer.
- `content/suara.ts` owns the catalogue (`SOUND_ITEMS`, category counts, `QUIZ_LENGTH`,
  every string, the result bands); `lib/assets.ts` owns all three media sets — `SUARA_ART`
  (one 240 × 240 SVG per sound), `SUARA_PHOTOS` (one 720 × 720 JPEG per sound) and
  `SUARA_SOUNDS` (one trimmed MP3 per sound). Each photo and each recording carries its
  CC attribution. The synth keys its fallback recipes on the same ids, so adding a sound
  is: draw it, pick and credit a photo, pick and credit a recording, register all three,
  add one catalogue entry, write one recipe.
- `audio.ts` plays the recordings: fetch once, `decodeAudioData` once, one sound at a
  time through the shared master bus and limiter, with a short fade in/out. The WebAudio
  recipes stay as the fallback when a file is missing, still downloading, or undecodable —
  and as the UI blips. A deliberate press unmutes; the quiz's auto-play passes
  `force = false` so it stays quiet when muted. `playSound` is async and resolves with the
  clip length (0 if a newer press won); `useSuara.play` guards late resolves with a token.
- `pixel.ts` derives the Piksel view from the **drawing**: draw to 64 × 64, cut the
  colours to twelve with a median-cut palette, upscale with nearest-neighbour. Never ship
  a second raster for that mode. `prefetchPixelArt()` warms the cache after paint; the
  hook itself only works in pixel mode. Real mode never goes through it — it shows
  `item.photo.src` and falls back to the drawing if the file cannot load.
- The photo set is CC BY / CC BY-SA / Public Domain Mark from Flickr; the sound set is
  CC BY / CC BY-SA / CC0 / public domain from Wikimedia Commons, trimmed to their clearest
  few seconds (the trim script lived in a throwaway `_art` folder, not in the repo).
  Attribution is not optional: `photo.credit` and `sound.credit` are printed as links
  under the caption in `FullscreenViewer` (sound always, photo in Real mode). Keep the
  links, and update the credit when a photo or a recording is swapped.
- `useQuiz.ts` is the rulebook (answers capped at the category size, same-category
  distractors first, one pick per round, a `results` array for the dots). `QuizPanel` owns
  a run, `useSuara.ts` owns mute, art mode and the best run. Keys: `ihsnn:suara:muted`,
  `ihsnn:suara:art`, `ihsnn:suara:best`.
- The full-screen view is a dialog that covers the viewport (`FullscreenViewer`) because
  iOS Safari refuses element fullscreen; the Fullscreen API is an extra button when the
  browser has it. Esc closes, arrows step, Tab stays trapped, body scroll locks.
- `suara.css` is the cream listening station. Keep the coral speaker button physically
  large (it is the cartridge's only control) and keep `image-rendering: pixelated` on
  `.suara-art.is-pixel`; the full-screen figure is sized by `width: min(100%, 64vh, 600px)`
  with `aspect-ratio: 1` so a 240 px drawing never renders at 240 px.

**PEKAN RAYA.** `features/pekan/` is the folk-sports island at `/pekan`: a 320 × 240
top-down village and rice fields, seven branch champions, seven scrolls and a torch at
the summit. It is the largest cartridge; the shipped slice has the whole frame and one
playable branch (PANAHAN).
- `game.ts` is the mode machine (`title → world → dialogue | versus | sport | result`,
  plus `debug`). It owns the versus card, the result card, the scroll award and the
  save. Sports never touch React.
- A branch is one module behind `SportRun`: `step(dt, input)`, `draw(ctx, time)`, a
  `status`, two scores and an optional `sound()`. `sports/registry.ts` is the only map
  from `SportId` to code — a branch catalogued in `content/pekan/island.ts` but absent
  from the registry is not playable, and `startSport` refuses it.
- `content/pekan/island.ts` builds maps with `grid`/`fill`/`put` instead of hand-typed
  rows (a ragged row is the classic tilemap bug). Adding a screen is one `buildX()`,
  one `MAPS` entry and a `WarpDef` on each side; NPCs, warps and teams are data there.
- Movement is grid-locked with a 145 ms tween; `world.ts` holds collision, the camera
  clamp and the cosmetic companion. Menus use the `upPressed`/`downPressed` edges in
  `InputFrame`, never held directions — held keys used to cycle the title menu at sixty
  steps a second.
- `usePekan.ts` owns the rAF loop, the DPR canvas fit, the keyboard, the touch D-pad and
  the pointer aim (drag, lift to shoot). A lifted pointer is cleared after the release
  frame so it cannot keep overriding the keyboard on later shots.
- `save.ts` is `ihsnn:pekan:save` (version 1: team, companion look, scrolls, coins, map,
  position, flags), validated field by field. Nothing is written until the player starts
  (`started` guard), so merely opening the page does not create a save.
- `` ` `` opens the debug launcher. Add a target there whenever a branch or a screen is
  added, or every test starts with a walk across the island.

**Audio.** Each cartridge owns its sound. `features/gameboy/audio.ts` is the console's
only audio owner: one ambient loop at a time (`playAmbient`/`stopAmbient`), UI blips
(`playUiSound`), and a persisted mute flag (`useSoundMuted`, `toggleMuted`).
`features/arcade/sound.ts` is a tiny oscillator synth with no audio files and its own
persisted mute (`ihsnn:arcade:muted`). The photobooth's `sound.ts` is a WebAudio synth
driven by each layout's note recipe with its own persisted mute
(`ihsnn:photobooth:muted`). PIARA's `audio.ts` is a triangle-wave toy speaker (chirps
rather than the arcade's square stabs), muted under `ihsnn:piara:muted`. WARKOP's
`audio.ts` synthesises the shop bell, a filtered-noise sizzle, the cash cha-ching and the
closing gong, muted under `ihsnn:warkop:muted`. TASK-9's `audio.ts` is a square/triangle
organizer speaker (completion blips climb with the combo), muted under
`ihsnn:todo:muted`. ANGKUT's `audio.ts` is a diesel two-oscillator engine behind a
low-pass (pitch follows speed and throttle) plus thumps and a coin blip, muted under
`ihsnn:angkut:muted`. TELINGA EMAS's `audio.ts` plays forty CC-licensed recordings
(fetched and decoded once, with a synth recipe per id as the fallback), muted under
`ihsnn:suara:muted`. PEKAN RAYA's `audio.ts` is a short cue synth (UI blips, bow, hit,
win/lose, the scroll chime), muted under `ihsnn:pekan:muted`; its soundtrack is a later
milestone. The story cartridge is currently silent.
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
browser, the photobooth processes camera frames and files on-device and downloads a
local PNG, and the console is pure CSS/audio. There is no `functions/` directory, no
Worker script and no API route. If a server is ever needed, make it a real Worker with a
`main` entry rather than reintroducing Pages Functions.

## Conventions

- TS is strict with `noUnusedLocals`/`noUnusedParameters`; `allowImportingTsExtensions`
  is on. Imports are relative — there is no `@/` alias (adding one needs `@types/node`
  for `vite.config.ts`, which is not installed).
- `vite.config.ts` intentionally has `base` commented out — deploys are at the domain root.
  Uncomment/change it only for a sub-path deploy.
- Three stylesheets describe the console, on purpose, and none of them should be
  refactored into components: `gameboy.css` (≈165 KB of chassis artwork, edit surgically),
  `stage.css` (page chrome + scaling), `scenes/scenes.css` (LCD typography).
  `pokescan.css`, `landing.css`, `arcade.css`, `keluarga.css`, `rakcerita.css`,
  `photobooth.css`, `piara.css`, `warkop.css`, `todo.css`, `angkut.css`, `suara.css` and
  `pekan.css` are the other page sheets; shared chrome lives in `components/shared/shared.css`.
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
assets. The GitHub integration runs `npm run build` then `wrangler deploy`;
`npm run deploy:cf` does the same locally. `npm run pages:deploy` is the static Pages
alternative.

The deploy command must be `wrangler deploy`, not `wrangler versions upload`: the latter
only uploads a version, and production keeps serving the previous deployment until
someone promotes it. That is the "build green, site unchanged" failure mode.

Cache and security headers live in `public/_headers` (Vite copies it to `dist/_headers`
and Workers reads it there): hashed `/assets/*` is cached for a year, `/images/*` for a
day, HTML always revalidates. Keep each rule on a single line — this is the same class of
mistake as the wrapped `_redirects` rule that broke two deploys.

The SPA fallback is **config only** — `[assets] not_found_handling =
"single-page-application"` in `wrangler.toml`. There is deliberately no `_redirects`
file: the hand-written one broke two deploys (Cloudflare rejects a rule wrapped onto a
second line) and was removed together with the backend. GitHub Pages still has no
equivalent fallback.

## Media hosting (not done yet)

Assets are bundled by Vite. `src/lib/assets.ts` is the single seam: it exports
`IMAGES`, `GALLERY_IMAGES`, `SUARA_ART`, `SUARA_PHOTOS`, `SUARA_SOUNDS`, `SOUNDS`,
`SCENE_MUSIC`, `SONGS` plus a `remote(path)` helper driven by `VITE_ASSET_BASE_URL`
(see `.env.example`). To move to Cloudflare R2 later, upload `src/assets/**` and swap the
import block for `remote()` calls — no screen or feature file should need to change. Keep
new media imports inside that file.

## Environment notes (this Windows machine)

- This working copy is owned by a non-elevated user; the sandbox runs commands at Low
  integrity. Files created before 2026-10-21 were left at the default Medium label,
  which made them read-only to commands (`npm run build` failing on
  `tsconfig.*.tsbuildinfo`). They were relabelled on 2026-10-21; if writes fail again,
  check integrity labels before suspecting the code.
- `npm run build` inside the sandboxed shell dies with `spawn EPERM` from esbuild
  (piped child process). Run it with full host access instead of debugging it.
  `npx tsc -b` and `npx eslint .` do work inside the sandbox — use them as the fast gate.
