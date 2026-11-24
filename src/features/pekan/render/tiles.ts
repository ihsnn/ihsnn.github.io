import type { RegionId } from '../../../content/pekan/island'

/**
 * Tile art, drawn from rectangles and circles — no sprite sheet.
 *
 * Every region is a palette swap plus a couple of flourishes, so adding the
 * beach or the mountain later is one palette entry, not a new tileset.
 */

interface Palette {
  grass: string
  grassDark: string
  grassLight: string
  path: string
  pathDark: string
  water: string
  waterLight: string
  sand: string
  sandDark: string
  wall: string
  wallLine: string
  roof: string
  roofLight: string
  wood: string
  woodDark: string
  paddy: string
  paddyStalk: string
  rock: string
  rockDark: string
  leaf: string
  leafDark: string
  leafLight: string
  trunk: string
}

const KAMPUNG: Palette = {
  grass: '#7fa551',
  grassDark: '#6a8f42',
  grassLight: '#96b969',
  path: '#c8a878',
  pathDark: '#a98a5c',
  water: '#4f97b8',
  waterLight: '#7bc0d6',
  sand: '#e0c48f',
  sandDark: '#c6a671',
  wall: '#f1e3c3',
  wallLine: '#c9b48c',
  roof: '#b35a3f',
  roofLight: '#d07a55',
  wood: '#8a5a33',
  woodDark: '#5f3c20',
  paddy: '#6f9c4f',
  paddyStalk: '#a8c86a',
  rock: '#8d8d86',
  rockDark: '#6b6b64',
  leaf: '#4f7a3a',
  leafDark: '#3a5c2a',
  leafLight: '#6d9a4b',
  trunk: '#6b4a2f',
}

const SAWAH: Palette = {
  ...KAMPUNG,
  grass: '#8bab52',
  grassDark: '#749244',
  grassLight: '#a5c46b',
  path: '#cdb07c',
  water: '#5a9fb0',
  waterLight: '#86c8cf',
  paddy: '#86a83f',
  paddyStalk: '#c3d46a',
  leaf: '#5b8340',
  leafLight: '#7ba052',
}

const PALETTES: Record<RegionId, Palette> = {
  kampung: KAMPUNG,
  sawah: SAWAH,
  pantai: { ...KAMPUNG, grass: '#d9c58f', grassDark: '#c2ac76', grassLight: '#e8d9ad' },
  hutan: { ...KAMPUNG, grass: '#5e8a45', grassDark: '#4a7136', grassLight: '#769f58' },
  gunung: { ...KAMPUNG, grass: '#8a9a72', grassDark: '#73825d', grassLight: '#a3b189' },
  puncak: { ...KAMPUNG, grass: '#9aa8a0', grassDark: '#808e86', grassLight: '#b3c0b7' },
}

export function paletteFor(region: RegionId): Palette {
  return PALETTES[region] ?? KAMPUNG
}

function hash(x: number, y: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return (h ^ (h >>> 16)) >>> 0
}

function fill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function grassBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  p: Palette,
  seed: number,
): void {
  fill(ctx, x, y, 16, 16, p.grass)
  const a = seed % 5
  const b = (seed >>> 3) % 5
  fill(ctx, x + 2 + a, y + 3 + b, 1, 3, p.grassDark)
  fill(ctx, x + 3 + a, y + 4 + b, 1, 2, p.grassDark)
  fill(ctx, x + 10 + b, y + 9 + a, 1, 3, p.grassDark)
  fill(ctx, x + 12 + a, y + 12, 2, 1, p.grassLight)
}

/** Draws one tile with its top-left at (x, y). Coordinates are design pixels. */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  region: RegionId,
  time: number,
): void {
  const p = paletteFor(region)
  const seed = hash(x >> 4, y >> 4)

  switch (ch) {
    case ',':
      grassBase(ctx, x, y, p, seed)
      fill(ctx, x + 4, y + 5, 2, 2, '#f4ead2')
      fill(ctx, x + 10, y + 9, 2, 2, '#e8b44c')
      fill(ctx, x + 7, y + 12, 2, 2, '#e88a9a')
      break

    case '=':
      fill(ctx, x, y, 16, 16, p.path)
      fill(ctx, x, y, 16, 1, p.pathDark)
      fill(ctx, x + (seed % 7), y + 4 + (seed % 5), 2, 1, p.pathDark)
      fill(ctx, x + 9 + (seed % 4), y + 11, 1, 1, p.pathDark)
      break

    case '~': {
      fill(ctx, x, y, 16, 16, p.water)
      const drift = Math.sin(time * 1.4 + (x + y) * 0.12) * 2
      fill(ctx, x + 2 + drift, y + 5, 6, 1, p.waterLight)
      fill(ctx, x + 8 - drift, y + 11, 5, 1, p.waterLight)
      break
    }

    case 's':
      fill(ctx, x, y, 16, 16, p.sand)
      fill(ctx, x + 3 + (seed % 6), y + 4, 1, 1, p.sandDark)
      fill(ctx, x + 10, y + 10 + (seed % 4), 1, 1, p.sandDark)
      break

    case 'H':
      fill(ctx, x, y, 16, 16, p.roof)
      for (let row = 0; row < 3; row += 1) {
        fill(ctx, x, y + 4 + row * 4, 16, 1, '#8f402c')
        fill(ctx, x + ((row + seed) % 2) * 7, y + 1 + row * 4, 7, 2, p.roofLight)
      }
      fill(ctx, x, y, 16, 1, '#7a3524')
      break

    case 'h':
      fill(ctx, x, y, 16, 16, p.wall)
      fill(ctx, x, y + 14, 16, 2, p.wallLine)
      fill(ctx, x, y, 16, 1, p.wallLine)
      fill(ctx, x + 1, y + 1, 1, 13, 'rgba(150, 125, 90, 0.4)')
      if (seed % 3 === 0) {
        fill(ctx, x + 4, y + 4, 7, 6, '#7fa3b8')
        fill(ctx, x + 4, y + 4, 7, 1, p.wood)
        fill(ctx, x + 4, y + 9, 7, 1, p.wood)
        fill(ctx, x + 7, y + 4, 1, 6, p.wood)
        fill(ctx, x + 4, y + 7, 7, 1, p.wood)
      }
      break

    case 'd':
      fill(ctx, x, y, 16, 16, p.wall)
      fill(ctx, x + 2, y + 2, 12, 14, p.woodDark)
      fill(ctx, x + 3, y + 3, 10, 13, p.wood)
      fill(ctx, x + 3, y + 7, 10, 1, p.woodDark)
      fill(ctx, x + 3, y + 11, 10, 1, p.woodDark)
      fill(ctx, x + 11, y + 9, 2, 2, '#e0a13c')
      fill(ctx, x, y + 14, 16, 2, p.wallLine)
      break

    case 'f':
      grassBase(ctx, x, y, p, seed)
      fill(ctx, x + 1, y + 7, 14, 2, p.wood)
      fill(ctx, x + 3, y + 4, 2, 9, p.woodDark)
      fill(ctx, x + 11, y + 4, 2, 9, p.woodDark)
      break

    case 'r': {
      fill(ctx, x, y, 16, 16, p.paddy)
      fill(ctx, x, y + 3, 16, 1, '#5d8340')
      fill(ctx, x, y + 10, 16, 1, '#5d8340')
      for (let i = 0; i < 4; i += 1) {
        fill(ctx, x + 1 + i * 4, y + 4, 1, 6, p.paddyStalk)
        fill(ctx, x + 2 + i * 4, y + 11, 1, 5, p.paddyStalk)
      }
      break
    }

    case 'm':
      grassBase(ctx, x, y, p, seed)
      fill(ctx, x + 1, y + 6, 14, 10, p.rockDark)
      fill(ctx, x + 2, y + 4, 12, 10, p.rock)
      fill(ctx, x + 4, y + 6, 4, 3, '#a8a8a0')
      fill(ctx, x + 9, y + 9, 3, 2, p.rockDark)
      break

    case 'o':
      grassBase(ctx, x, y, p, seed)
      fill(ctx, x + 3, y + 5, 10, 8, p.rockDark)
      fill(ctx, x + 4, y + 2, 8, 10, p.rock)
      fill(ctx, x + 6, y + 4, 3, 2, '#b0b0a8')
      break

    case '#': {
      grassBase(ctx, x, y, p, seed)
      fill(ctx, x + 6, y + 9, 4, 7, p.trunk)
      ctx.fillStyle = 'rgba(30, 50, 25, 0.22)'
      ctx.beginPath()
      ctx.ellipse(x + 8, y + 15, 7, 2, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = p.leafDark
      ctx.beginPath()
      ctx.arc(x + 8, y + 4, 9, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = p.leaf
      ctx.beginPath()
      ctx.arc(x + 6, y + 2, 7, 0, Math.PI * 2)
      ctx.arc(x + 12, y + 5, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = p.leafLight
      ctx.beginPath()
      ctx.arc(x + 5, y, 3.5, 0, Math.PI * 2)
      ctx.fill()
      break
    }

    case 'b':
      fill(ctx, x, y, 16, 16, p.water)
      fill(ctx, x, y + 2, 16, 12, p.wood)
      for (let i = 0; i < 4; i += 1) fill(ctx, x, y + 2 + i * 3, 16, 1, p.woodDark)
      break

    default:
      grassBase(ctx, x, y, p, seed)
  }
}
