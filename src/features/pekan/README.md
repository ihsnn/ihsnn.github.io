# PEKAN RAYA — cartridge 12

A top-down folk-sports island. Walk the village and the rice fields, talk to the
villagers, challenge a champion, and win their scroll. Seven branches are planned;
**this slice (M0–M2) ships one of them, Panahan (archery), plus the whole frame**:
title, overworld, dialogue, versus card, result card, scrolls and the save.

```bash
npm install
npm run dev      # then open http://localhost:5173/pekan
npm run build    # tsc -b && vite build
```

## Controls

| Key | Action |
| --- | --- |
| Arrows / WASD | walk, aim |
| Z / Enter / Space | A — talk, advance, confirm, shoot |
| X / Esc | B — cancel, close |
| M | mute |
| `` ` `` | debug launcher (jump to a screen or a branch) |

Touch: the D-pad and A/B buttons under the screen; on the canvas, drag to aim and
lift to shoot.

## Where things live

```
src/content/pekan/island.ts   map builder, NPCs, warps, the 7 branch catalogue, teams
src/content/pekan/copy.ts     every page and screen string
src/features/pekan/
  game.ts                     the mode machine: title → world → dialog/versus/sport/result
  world.ts                    tile collision, grid movement, camera, warps, companion
  save.ts                     ihsnn:pekan:save (v1) with per-field validation
  input.ts                    key mapping + the shared held-key tracker
  sports/
    types.ts                  the SportRun contract
    registry.ts               SportId → factory (the only place a branch becomes playable)
    archery.ts                PANAHAN
  render/
    tiles.ts                  tile art + per-region palettes
    actors.ts                 player, NPCs, the companion
    ui.ts                     HUD, dialogue, title, versus, result, debug
    index.ts                  camera + draw order
  usePekan.ts                 rAF loop, canvas DPR fit, keyboard, touch, autosave
  PekanPage.tsx, pekan.css    the page around the screen
```

The design canvas is **320 × 240**. Nothing draws in screen pixels: the hook sizes
the backing store to CSS × DPR and the renderer applies one `setTransform`. Keep
design-space coordinates or text will blur.

## Adding a branch

A branch is a pure-ish module behind one interface:

```ts
export interface SportRun {
  status: 'playing' | 'won' | 'lost'
  playerScore: number
  rivalScore: number
  step(dt: number, input: SportInput): void
  draw(ctx: CanvasRenderingContext2D, time: number): void
  sound?: () => SoundName | null
}
```

1. Add a `SportMeta` row to `SPORTS` in `content/pekan/island.ts` (it is already
   there for all seven; fill in the copy).
2. Write `sports/<id>.ts` exporting `create<Name>(seed: number): SportRun`. Take a
   seed and use `mulberry32` for every random draw, so a run can be replayed.
3. Register it in `sports/registry.ts`. That is the only switch that makes a
   branch playable — a catalogued but unimplemented branch is simply rejected.
4. Put an NPC with `sport: '<id>'` next to its field in `content/pekan/island.ts`.
5. Add it to the debug launcher (`DEBUG_TARGETS` in `game.ts` + `DEBUG.rows` in
   `content/pekan/copy.ts`) so it can be tested without walking there.

Keep the versus card, the scroll award and the result screen out of the branch:
`game.ts` owns those. A branch only reports a score and a status.

## Adding a screen

`content/pekan/island.ts` builds maps with `grid()` / `fill()` / `put()` instead of
hand-typed rows, so a row can never be ragged. Add a `buildX()` function, an entry
in `MAPS`, a `WarpDef` in both directions, and the NPCs that live there. The camera
clamps itself; screens may be larger or smaller than the view.

## Save

`ihsnn:pekan:save`, version 1, one slot:

```ts
{ version: 1, team, companion: { color, ear, acc, name }, scrolls, coins,
  map, x, y, dir, flags, updatedAt }
```

`readSave()` validates every field and falls back on its own, so a partial or
older save still loads. Autosave happens after a branch, after a map change and
when the tab is hidden; a run is never saved mid-branch. Nothing is written until
the player actually starts, so opening the page does not create a save.

Mute lives under `ihsnn:pekan:muted`.

## Testing without a browser

`game.ts`, `world.ts`, `save.ts` and `sports/` avoid the DOM, so the runtime can be
compiled to CommonJS and driven from Node:

```bash
npx tsc src/features/pekan/game.ts --outDir .tmp/soak/out --module commonjs \
  --target es2020 --moduleResolution node --lib es2020,dom --strict --skipLibCheck
```

A throwaway runner (not committed, the way the sound trims were done) then asserts:
every map is rectangular, every NPC and warp stands on a walkable tile, a new game
enters the world, the gate warps to the sawah, Si Elang's dialogue opens the versus
card, the branch terminates under random input, a wind-compensated aim wins, and a win
writes exactly one scroll. Re-run it after touching the map builder or a branch.

`npx tsc -b` and `npx eslint .` are the normal gate; `npm run build` needs full host
access on this machine (esbuild cannot spawn inside the sandbox).

## Known scope

- Six branches are catalogued and shown as "SEGERA" on the page, but only
  Panahan has code. Do not add a scroll slot that cannot be won.
- The team picker, scoreboard, companion creator and the finale are M3–M5 work;
  the save already carries their fields so those milestones do not break saves.
- The soundtrack is deliberately absent; the sequencer is a later milestone.
