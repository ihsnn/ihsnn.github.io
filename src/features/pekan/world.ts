import {
  MAPS,
  NPCS,
  START,
  WARPS,
  type Dir,
  type MapId,
  type NpcDef,
  type WarpDef,
} from '../../content/pekan/island'
import type { InputFrame, PekanSave, PlayerState, WorldState } from './types'

/** Design resolution and the one tile size the whole island uses. */
export const TILE = 16
export const VIEW_W = 320
export const VIEW_H = 240
/** One tile step, in seconds. Feels like a GBC walk, not a skateboard. */
export const STEP_SECONDS = 0.145

const SOLID = new Set(['#', 'H', 'h', 'd', 'f', 'r', 'm', 'o', '~'])

export function tileAt(map: MapId, tx: number, ty: number): string {
  const def = MAPS[map]
  if (tx < 0 || ty < 0 || tx >= def.width || ty >= def.height) return '#'
  return def.rows[ty][tx] ?? '#'
}

export function isSolidTile(map: MapId, tx: number, ty: number): boolean {
  return SOLID.has(tileAt(map, tx, ty))
}

export function npcAt(map: MapId, tx: number, ty: number): NpcDef | null {
  for (const npc of NPCS) {
    if (npc.map === map && npc.x === tx && npc.y === ty) return npc
  }
  return null
}

export function warpAt(map: MapId, tx: number, ty: number): WarpDef | null {
  for (const warp of WARPS) {
    if (warp.map === map && warp.x === tx && warp.y === ty) return warp
  }
  return null
}

const VECTORS: Record<Dir, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
}

export function facingTile(player: PlayerState): { x: number; y: number } {
  const { dx, dy } = VECTORS[player.dir]
  return { x: player.x / TILE + dx, y: player.y / TILE + dy }
}

function makePlayer(tx: number, ty: number, dir: Dir): PlayerState {
  return {
    x: tx * TILE,
    y: ty * TILE,
    dir,
    fromX: tx * TILE,
    fromY: ty * TILE,
    moving: false,
    t: 0,
    frame: 0,
    walkTime: 0,
  }
}

/**
 * Finds a standable tile near the requested one: a save whose coordinates now
 * point at a wall (after a map edit) should still load, on the same screen.
 */
function safeSpawn(
  map: MapId,
  tx: number,
  ty: number,
): { map: MapId; x: number; y: number } {
  const free = (x: number, y: number) =>
    !isSolidTile(map, x, y) && !npcAt(map, x, y)
  if (free(tx, ty)) return { map, x: tx, y: ty }

  for (let radius = 1; radius <= 6; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue
        if (free(tx + dx, ty + dy)) return { map, x: tx + dx, y: ty + dy }
      }
    }
  }

  return { map: START.map, x: START.x, y: START.y }
}

export function createWorld(save: PekanSave): WorldState {
  const spot = safeSpawn(save.map, save.x, save.y)
  const player = makePlayer(spot.x, spot.y, save.dir)
  return {
    map: spot.map,
    player,
    companion: { x: player.x - 12, y: player.y + 2 },
    time: 0,
  }
}

export function teleportWorld(
  world: WorldState,
  map: MapId,
  tx: number,
  ty: number,
  dir: Dir,
): void {
  world.map = map
  world.player = makePlayer(tx, ty, dir)
  world.companion = { x: tx * TILE - 12, y: ty * TILE + 2 }
}

export type WorldEvent =
  | { type: 'talk'; npc: NpcDef }
  | { type: 'warp'; warp: WarpDef }
  | { type: 'step' }
  | { type: 'bump' }

export function playerPixel(player: PlayerState): { x: number; y: number } {
  if (!player.moving) return { x: player.x, y: player.y }
  return {
    x: player.fromX + (player.x - player.fromX) * player.t,
    y: player.fromY + (player.y - player.fromY) * player.t,
  }
}

export function cameraFor(world: WorldState): { x: number; y: number } {
  const def = MAPS[world.map]
  const pixel = playerPixel(world.player)
  const mapW = def.width * TILE
  const mapH = def.height * TILE
  const maxX = Math.max(0, mapW - VIEW_W)
  const maxY = Math.max(0, mapH - VIEW_H)
  const x = mapW <= VIEW_W ? (mapW - VIEW_W) / 2 : pixel.x + TILE / 2 - VIEW_W / 2
  const y = mapH <= VIEW_H ? (mapH - VIEW_H) / 2 : pixel.y + TILE / 2 - VIEW_H / 2
  return {
    x: Math.min(maxX, Math.max(0, x)),
    y: Math.min(maxY, Math.max(0, y)),
  }
}

function tryStep(world: WorldState, dir: Dir): WorldEvent | null {
  const player = world.player
  const { dx, dy } = VECTORS[dir]
  const tx = player.x / TILE + dx
  const ty = player.y / TILE + dy
  player.dir = dir
  if (isSolidTile(world.map, tx, ty) || npcAt(world.map, tx, ty)) {
    return { type: 'bump' }
  }
  player.fromX = player.x
  player.fromY = player.y
  player.x = tx * TILE
  player.y = ty * TILE
  player.moving = true
  player.t = 0
  player.walkTime = 0
  return null
}

function heldDir(input: InputFrame): Dir | null {
  if (input.up) return 'up'
  if (input.down) return 'down'
  if (input.left) return 'left'
  if (input.right) return 'right'
  return null
}

/**
 * Advances the island one frame. Movement is grid-locked with a tween; the
 * companion smooth-follows a point behind the player and is purely cosmetic.
 */
export function updateWorld(
  world: WorldState,
  dt: number,
  input: InputFrame,
): WorldEvent[] {
  const events: WorldEvent[] = []
  world.time += dt
  const player = world.player

  if (player.moving) {
    player.t = Math.min(1, player.t + dt / STEP_SECONDS)
    player.walkTime += dt
    player.frame = Math.floor(player.walkTime * 10) % 2
    if (player.t >= 1) {
      player.moving = false
      player.t = 0
      player.frame = 0
      const warp = warpAt(world.map, player.x / TILE, player.y / TILE)
      if (warp) {
        events.push({ type: 'warp', warp })
      } else {
        events.push({ type: 'step' })
      }
    }
  } else {
    if (input.aPressed) {
      const target = facingTile(player)
      const npc = npcAt(world.map, target.x, target.y)
      if (npc) events.push({ type: 'talk', npc })
    } else {
      const dir = heldDir(input)
      if (dir) {
        const result = tryStep(world, dir)
        if (result) events.push(result)
      }
    }
  }

  // The companion drifts to a spot just behind the player.
  const pixel = playerPixel(player)
  const behind = VECTORS[player.dir]
  const targetX = pixel.x - behind.dx * 12
  const targetY = pixel.y - behind.dy * 12 + 4
  const k = 1 - Math.exp(-7 * dt)
  world.companion.x += (targetX - world.companion.x) * k
  world.companion.y += (targetY - world.companion.y) * k

  return events
}
