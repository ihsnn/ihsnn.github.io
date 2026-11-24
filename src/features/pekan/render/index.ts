import {
  MAPS,
  NPCS,
  TEAM_BY_ID,
  type MapId,
} from '../../../content/pekan/island'
import type { PekanGame } from '../game'
import { TILE, cameraFor, playerPixel, tileAt } from '../world'
import { drawCompanion, drawNpc, drawPlayer } from './actors'
import { drawTile } from './tiles'
import {
  DESIGN_H,
  DESIGN_W,
  drawDebug,
  drawDialogue,
  drawHud,
  drawLocation,
  drawResult,
  drawTitle,
  drawVersus,
} from './ui'

const LOCATION_SECONDS = 2.4

interface Drawable {
  y: number
  draw: () => void
}

const npcsOnMap = (map: MapId) => NPCS.filter((npc) => npc.map === map)

function drawWorld(ctx: CanvasRenderingContext2D, game: PekanGame, time: number): void {
  const world = game.world
  const def = MAPS[world.map]
  const cam = cameraFor(world)

  ctx.save()
  ctx.translate(-Math.round(cam.x), -Math.round(cam.y))

  const x0 = Math.floor(cam.x / TILE)
  const y0 = Math.floor(cam.y / TILE)
  const x1 = Math.ceil((cam.x + DESIGN_W) / TILE)
  const y1 = Math.ceil((cam.y + DESIGN_H) / TILE)

  for (let ty = y0; ty <= y1; ty += 1) {
    for (let tx = x0; tx <= x1; tx += 1) {
      drawTile(
        ctx,
        tileAt(world.map, tx, ty),
        tx * TILE,
        ty * TILE,
        def.region,
        time,
      )
    }
  }

  const team = TEAM_BY_ID.get(game.save.team)
  const pixel = playerPixel(world.player)
  const drawables: Drawable[] = []

  for (const npc of npcsOnMap(world.map)) {
    drawables.push({
      y: npc.y * TILE + 16,
      draw: () => drawNpc(ctx, npc, npc.x * TILE, npc.y * TILE, time),
    })
  }

  drawables.push({
    y: world.companion.y + 12,
    draw: () =>
      drawCompanion(ctx, world.companion.x, world.companion.y, game.save.companion, time),
  })

  drawables.push({
    y: pixel.y + 16,
    draw: () =>
      drawPlayer(
        ctx,
        pixel.x + 1,
        pixel.y,
        world.player.dir,
        world.player.moving ? world.player.frame : 0,
        team?.color ?? '#d9534b',
        time,
      ),
  })

  drawables.sort((a, b) => a.y - b.y)
  for (const drawable of drawables) drawable.draw()

  ctx.restore()

  drawHud(ctx, game.save)

  if (game.locationTimer > 0) {
    drawLocation(ctx, def.name, LOCATION_SECONDS - game.locationTimer)
  }
}

export function renderPekan(
  ctx: CanvasRenderingContext2D,
  game: PekanGame,
  now: number,
  reducedMotion: boolean,
): void {
  const time = now / 1000
  ctx.clearRect(0, 0, DESIGN_W, DESIGN_H)

  if (game.mode === 'title') {
    drawTitle(ctx, game.title, game.save.companion, reducedMotion ? 0 : time)
    return
  }

  if (game.sport && (game.mode === 'sport' || game.mode === 'result')) {
    game.sport.draw(ctx, reducedMotion ? 0 : time)
    if (game.mode === 'result' && game.result) drawResult(ctx, game.result)
    return
  }

  drawWorld(ctx, game, reducedMotion ? 0 : time)

  if (game.mode === 'dialogue' && game.dialogue) drawDialogue(ctx, game.dialogue)
  if (game.mode === 'versus' && game.versus) drawVersus(ctx, game.versus)
  if (game.mode === 'debug' && game.debug) drawDebug(ctx, game.debug)
}
