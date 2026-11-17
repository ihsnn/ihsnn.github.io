import { OBJECT_COPY } from '../../content/keluarga'
import { drawCharacter, drawCharacterShadow } from './character'
import type {
  CharacterState,
  Direction,
  FurnitureKind,
  PlayerPosition,
  RoomObject,
} from './types'

export const VIEW_WIDTH = 160
export const VIEW_HEIGHT = 144
export const TILE = 16

const ROOM_ROWS = [
  'WWWWWWWWWWWWWW',
  'W............W',
  'W............W',
  'W............W',
  'W............W',
  'W............W',
  'W............W',
  'W............W',
  'WWWWWWWWWWWWWW',
]

const ROOM_WIDTH = ROOM_ROWS[0].length
const ROOM_HEIGHT = ROOM_ROWS.length
const STEP_DURATION = 0.16
const SPAWN: PlayerPosition = { x: 5, y: 6, dir: 'up' }

interface Layout {
  id: string
  kind: FurnitureKind
  x: number
  y: number
  w: number
  h: number
  solid: boolean
  wall: boolean
}

const LAYOUT: Layout[] = [
  // { id: 'rug', kind: 'rug', x: 5, y: 4, w: 4, h: 2, solid: false, wall: false },
  { id: 'bed', kind: 'bed', x: 1, y: 1, w: 2, h: 3, solid: true, wall: false },
  { id: 'shelf', kind: 'shelf', x: 1, y: 7, w: 1, h: 2, solid: true, wall: false },
  { id: 'desk', kind: 'desk', x: 3, y: 0, w: 3, h: 1, solid: true, wall: false },
  {
    id: 'wardrobe',
    kind: 'wardrobe',
    x: 9,
    y: 0,
    w: 2,
    h: 2,
    solid: true,
    wall: false,
  }, {
    id: 'wardrobe',
    kind: 'wardrobe',
    x: 11,
    y: 0,
    w: 2,
    h: 2,
    solid: true,
    wall: false,
  },
  { id: 'fan', kind: 'fan', x: 1, y: 6, w: 1, h: 1, solid: true, wall: false },
  {
    id: 'windowNorth',
    kind: 'windowNorth',
    x: 6,
    y: 0,
    w: 2,
    h: 1,
    solid: false,
    wall: true,
  },
  {
    id: 'windowEast',
    kind: 'windowEast',
    x: 13,
    y: 3,
    w: 1,
    h: 2,
    solid: false,
    wall: true,
  },
  // { id: 'ac', kind: 'ac', x: 11, y: 0, w: 2, h: 1, solid: false, wall: true },
  { id: 'door', kind: 'door', x: 7, y: 8, w: 2, h: 1, solid: false, wall: true },
]

export const ROOM_OBJECTS: RoomObject[] = LAYOUT.map((layout) => {
  const copy = OBJECT_COPY[layout.id]
  return {
    ...layout,
    label: copy?.label ?? '',
    memory: copy?.memory ?? false,
    lines: copy?.lines ?? [],
  }
})

const wallAt = (x: number, y: number) => {
  if (x < 0 || y < 0 || x >= ROOM_WIDTH || y >= ROOM_HEIGHT) return true
  return ROOM_ROWS[y][x] === 'W'
}

export function isWalkableTile(x: number, y: number): boolean {
  if (wallAt(x, y)) return false
  for (const object of ROOM_OBJECTS) {
    if (!object.solid) continue
    if (
      x >= object.x &&
      x < object.x + object.w &&
      y >= object.y &&
      y < object.y + object.h
    ) {
      return false
    }
  }
  return true
}

const directionVector = (direction: Direction) => {
  switch (direction) {
    case 'up':
      return { dx: 0, dy: -1 }
    case 'down':
      return { dx: 0, dy: 1 }
    case 'left':
      return { dx: -1, dy: 0 }
    case 'right':
      return { dx: 1, dy: 0 }
  }
}

interface Step {
  fromX: number
  fromY: number
  toX: number
  toY: number
  progress: number
}

interface PlayerRender {
  x: number
  y: number
  direction: Direction
  frame: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export class RoomEngine {
  private tileX: number
  private tileY: number
  private facing: Direction
  private step: Step | null = null
  private desired: Direction | null = null
  private walkTime = 0
  private time = 0

  constructor(initial: PlayerPosition | null) {
    const valid = initial && isWalkableTile(initial.x, initial.y)
    this.tileX = valid ? initial.x : SPAWN.x
    this.tileY = valid ? initial.y : SPAWN.y
    this.facing = initial?.dir ?? SPAWN.dir
  }

  setDirection(direction: Direction | null) {
    this.desired = direction
  }

  update(dt: number) {
    this.time += dt

    if (this.step) {
      this.step.progress += dt / STEP_DURATION
      this.walkTime += dt
      if (this.step.progress >= 1) {
        this.tileX = this.step.toX
        this.tileY = this.step.toY
        this.step = null
        this.walkTime = 0
      }
      return
    }

    if (!this.desired) return

    this.facing = this.desired
    const { dx, dy } = directionVector(this.desired)
    const targetX = this.tileX + dx
    const targetY = this.tileY + dy
    if (!isWalkableTile(targetX, targetY)) return

    this.step = {
      fromX: this.tileX,
      fromY: this.tileY,
      toX: targetX,
      toY: targetY,
      progress: 0,
    }
    this.walkTime = 0
  }

  getFacingObject(): RoomObject | null {
    if (this.step) return null
    const { dx, dy } = directionVector(this.facing)
    const targetX = this.tileX + dx
    const targetY = this.tileY + dy
    for (const object of ROOM_OBJECTS) {
      if (object.kind === 'rug') continue
      if (
        targetX >= object.x &&
        targetX < object.x + object.w &&
        targetY >= object.y &&
        targetY < object.y + object.h
      ) {
        return object
      }
    }
    return null
  }

  getPlayer(): PlayerPosition {
    return { x: this.tileX, y: this.tileY, dir: this.facing }
  }

  private renderPlayer(): PlayerRender {
    if (!this.step) {
      return { x: this.tileX, y: this.tileY, direction: this.facing, frame: 0 }
    }
    const progress = clamp(this.step.progress, 0, 1)
    return {
      x: this.step.fromX + (this.step.toX - this.step.fromX) * progress,
      y: this.step.fromY + (this.step.toY - this.step.fromY) * progress,
      direction: this.facing,
      frame: 1 + (Math.floor(this.walkTime / 0.11) % 2),
    }
  }

  draw(ctx: CanvasRenderingContext2D, character: CharacterState) {
    const player = this.renderPlayer()
    drawRoom(ctx, character, player, this.time)
  }
}

// ---------------------------------------------------------------- renderer

const fill = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) => {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

const shadow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) => {
  ctx.fillStyle = 'rgba(36, 26, 20, 0.22)'
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

function drawFloorTile(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const base = (x + y) % 2 === 0 ? '#a9774c' : '#9f6c43'
  fill(ctx, x, y, TILE, TILE, base)
  fill(ctx, x, y + TILE - 1, TILE, 1, 'rgba(58, 34, 18, 0.35)')
  fill(ctx, x, y + 5, TILE, 1, 'rgba(255, 232, 190, 0.06)')
  fill(ctx, x + (y % 2 === 0 ? 4 : 11), y, 1, TILE, 'rgba(58, 34, 18, 0.2)')
}

function drawWallTile(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const atTop = y === 0
  const atBottom = y === ROOM_HEIGHT - 1
  const atSide = x === 0 || x === ROOM_WIDTH - 1

  if (atTop) {
    fill(ctx, x, y, TILE, TILE, '#d9c39a')
    fill(ctx, x, y, 1, TILE, 'rgba(255, 255, 255, 0.16)')
    fill(ctx, x + 4, y, 1, TILE, 'rgba(107, 78, 48, 0.08)')
    fill(ctx, x, y + TILE - 4, TILE, 4, '#a9845b')
    fill(ctx, x, y + TILE - 4, TILE, 1, '#c5a173')
    return
  }

  if (atBottom) {
    fill(ctx, x, y, TILE, TILE, '#c9ad80')
    fill(ctx, x, y, TILE, 3, '#e0c99b')
    fill(ctx, x, y + 8, 1, 8, 'rgba(100, 67, 37, 0.12)')
    return
  }

  if (atSide) {
    fill(ctx, x, y, TILE, TILE, '#cdb58d')
    fill(ctx, x + (x === 0 ? TILE - 3 : 0), y, 3, TILE, '#9f7b50')
    fill(ctx, x + (x === 0 ? TILE - 3 : 0), y, 1, TILE, '#d9c39a')
    return
  }

  drawFloorTile(ctx, x, y)
}

function drawWindowNorth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  // Sill shadow.
  fill(ctx, x - 3, y + 19, 38, 4, 'rgba(36, 26, 20, 0.22)')

  // Frame, slightly proud of the wall.
  fill(ctx, x - 4, y - 1, 40, 24, '#5b3922')
  fill(ctx, x - 2, y + 1, 36, 20, '#8a5a34')

  // Sky.
  const sky = ctx.createLinearGradient(0, y + 3, 0, y + 18)
  sky.addColorStop(0, '#8ec6da')
  sky.addColorStop(0.7, '#cfe2d0')
  sky.addColorStop(1, '#f1d08a')
  ctx.fillStyle = sky
  ctx.fillRect(x + 2, y + 3, 28, 15)
  fill(ctx, x + 5, y + 5, 6, 2, 'rgba(255, 255, 255, 0.7)')
  fill(ctx, x + 19, y + 8, 7, 2, 'rgba(255, 255, 255, 0.5)')
  fill(ctx, x + 2, y + 15, 28, 3, 'rgba(241, 208, 138, 0.55)')

  // Mullions.
  fill(ctx, x + 15, y + 2, 2, 19, '#7b5532')
  fill(ctx, x + 2, y + 9, 28, 1, '#7b5532')

  // Curtains with folds.
  for (const cx of [x + 1, x + 27]) {
    fill(ctx, cx, y + 2, 4, 16, '#3f7f78')
    fill(ctx, cx + 1, y + 2, 1, 16, '#5ba49a')
    fill(ctx, cx + 3, y + 2, 1, 16, '#2f655f')
    fill(ctx, cx, y + 10, 4, 2, '#d8ad66')
  }

  // Sill.
  fill(ctx, x - 5, y + 18, 42, 3, '#c59a64')
  fill(ctx, x - 3, y + 21, 38, 2, '#8b6139')
}

function drawWindowEast(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  const h = 32

  // Sill shadow into the room.
  fill(ctx, x - 10, y + h - 2, 12, 4, 'rgba(36, 26, 20, 0.2)')

  // Frame extends into the room so the side window is readable.
  fill(ctx, x - 8, y - 2, 24, h + 4, '#5b3922')
  fill(ctx, x - 6, y, 20, h, '#8a5a34')

  const sky = ctx.createLinearGradient(x - 4, 0, x + 10, 0)
  sky.addColorStop(0, '#8ec6da')
  sky.addColorStop(0.7, '#cfe2d0')
  sky.addColorStop(1, '#f1d08a')
  ctx.fillStyle = sky
  ctx.fillRect(x - 4, y + 2, 16, 28)
  fill(ctx, x - 2, y + 5, 5, 2, 'rgba(255, 255, 255, 0.65)')
  fill(ctx, x + 3, y + 21, 6, 2, 'rgba(255, 255, 255, 0.45)')

  // Mullions.
  fill(ctx, x + 3, y + 2, 2, 28, '#7b5532')
  fill(ctx, x - 4, y + 15, 16, 1, '#7b5532')

  // Top and bottom curtains.
  for (const cy of [y + 2, y + 26]) {
    fill(ctx, x - 4, cy, 16, 4, '#3f7f78')
    fill(ctx, x - 4, cy + 1, 16, 1, '#5ba49a')
    fill(ctx, x - 4, cy + 3, 16, 1, '#2f655f')
    fill(ctx, x - 4, cy + 1, 16, 1, '#d8ad66')
  }

  // Sill comes into the room.
  fill(ctx, x - 10, y + h - 1, 26, 3, '#c59a64')
  fill(ctx, x - 9, y + h + 2, 24, 2, '#8b6139')
}

function drawAc(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fill(ctx, x + 2, y + 2, 28, 12, '#d9d8cc')
  fill(ctx, x + 2, y + 2, 28, 2, '#f4f2e5')
  fill(ctx, x + 3, y + 5, 26, 1, '#a7a79b')
  fill(ctx, x + 3, y + 8, 26, 1, '#a7a79b')
  fill(ctx, x + 3, y + 11, 26, 1, '#a7a79b')
  fill(ctx, x + 27, y + 4, 2, 2, '#5ee6c8')
}

function drawDoor(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // A mat on the floor makes the bottom wall read as an exit, not a dresser.
  fill(ctx, x + 3, y - 11, 26, 6, 'rgba(36, 26, 20, 0.2)')
  fill(ctx, x + 4, y - 10, 24, 5, '#b85c4a')
  fill(ctx, x + 6, y - 9, 20, 2, '#f0d6a8')
  fill(ctx, x + 4, y - 5, 24, 1, '#8c4437')

  // Frame.
  fill(ctx, x - 2, y - 6, 36, 4, '#4a2d1b')
  fill(ctx, x - 2, y - 3, 4, 17, '#6b4223')
  fill(ctx, x + 30, y - 3, 4, 17, '#6b4223')
  fill(ctx, x - 3, y - 6, 2, 20, '#7a4a2d')
  fill(ctx, x + 33, y - 6, 2, 20, '#7a4a2d')

  // Dark opening with a warm sliver of outside.
  fill(ctx, x + 2, y - 3, 28, 16, '#171410')
  fill(ctx, x + 4, y + 8, 24, 4, '#3b2b1b')
  fill(ctx, x + 7, y + 11, 18, 2, '#f2c14e')
  fill(ctx, x + 9, y + 13, 14, 1, 'rgba(242, 193, 78, 0.35)')

  // Door leaf, swung open into the room.
  fill(ctx, x + 2, y - 3, 6, 15, '#8a5a34')
  fill(ctx, x + 3, y - 2, 1, 13, '#b77a47')
  fill(ctx, x + 7, y - 3, 1, 15, '#5b3922')
  fill(ctx, x + 5, y + 4, 1, 1, '#e7c56d')

  // Threshold.
  fill(ctx, x, y + 13, 32, 2, '#c59a64')
  fill(ctx, x + 2, y + 15, 28, 1, '#6b4223')
}

function drawRug(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fill(ctx, x + 1, y + 2, 62, 28, 'rgba(36, 26, 20, 0.18)')
  fill(ctx, x, y, 64, 30, '#f0d6a8')
  fill(ctx, x + 3, y + 3, 58, 24, '#b85c4a')
  fill(ctx, x + 8, y + 7, 48, 16, '#a34b3c')
  ctx.strokeStyle = 'rgba(240, 214, 168, 0.75)'
  ctx.lineWidth = 1
  ctx.strokeRect(x + 10.5, y + 9.5, 43, 11)
  fill(ctx, x + 30, y + 11, 4, 8, '#f0d6a8')
  fill(ctx, x + 24, y + 14, 16, 2, '#f0d6a8')
  fill(ctx, x - 1, y + 3, 2, 3, '#d8b98c')
  fill(ctx, x + 63, y + 3, 2, 3, '#d8b98c')
}

function drawBed(ctx: CanvasRenderingContext2D, x: number, y: number) {
  shadow(ctx, x + 3, y + 43, 28, 4)
  fill(ctx, x + 2, y + 2, 28, 44, '#5b3922')
  fill(ctx, x + 4, y + 4, 24, 40, '#744a2b')
  fill(ctx, x + 5, y + 6, 22, 36, '#f1e4c9')
  fill(ctx, x + 6, y + 7, 20, 8, '#fff8e6')
  fill(ctx, x + 8, y + 9, 16, 4, '#e6d6b8')
  fill(ctx, x + 5, y + 17, 22, 23, '#3f7f78')
  fill(ctx, x + 5, y + 17, 22, 2, '#5ba49a')
  fill(ctx, x + 8, y + 22, 16, 1, 'rgba(255, 255, 255, 0.13)')
  fill(ctx, x + 5, y + 37, 22, 3, '#2f655f')
  fill(ctx, x + 2, y + 1, 28, 4, '#4a2d1b')
  fill(ctx, x + 4, y + 1, 24, 1, '#8a5a37')
  fill(ctx, x + 2, y + 45, 28, 2, '#4a2d1b')
}

function drawShelf(ctx: CanvasRenderingContext2D, x: number, y: number) {
  shadow(ctx, x + 2, y + 30, 14, 3)
  fill(ctx, x + 1, y + 1, 14, 30, '#5f3c24')
  fill(ctx, x + 3, y + 3, 10, 26, '#3e2617')
  const bookColors = ['#d9a066', '#7a9e7e', '#b85c4a', '#e8d5a8', '#5b7fa6']
  for (const shelfY of [y + 5, y + 14, y + 23]) {
    let bx = x + 4
    for (let i = 0; i < 5; i += 1) {
      const height = 5 - (i % 2)
      fill(ctx, bx, shelfY + (5 - height), 2, height, bookColors[(i + shelfY) % bookColors.length])
      bx += 2
    }
    fill(ctx, x + 3, shelfY + 5, 10, 1, '#7c4f2e')
  }
}

function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number) {
  shadow(ctx, x + 2, y + 24, 44, 4)
  fill(ctx, x + 2, y + 21, 4, 13, '#5b3922')
  fill(ctx, x + 42, y + 21, 4, 13, '#5b3922')
  fill(ctx, x, y + 15, 48, 8, '#8a5a34')
  fill(ctx, x + 1, y + 15, 46, 2, '#b77a47')
  fill(ctx, x + 2, y + 22, 44, 2, '#5b3922')

  // Laptop.
  fill(ctx, x + 29, y + 5, 14, 10, '#2f323b')
  fill(ctx, x + 31, y + 7, 10, 6, '#20312f')
  fill(ctx, x + 32, y + 8, 8, 4, '#79d9c5')
  fill(ctx, x + 33, y + 9, 6, 1, '#b8fff1')
  fill(ctx, x + 28, y + 14, 16, 2, '#474b56')

  // Tinkering tools.
  fill(ctx, x + 5, y + 13, 3, 5, '#d9d8cc')
  fill(ctx, x + 5, y + 13, 1, 5, '#b9b8ad')
  fill(ctx, x + 4, y + 12, 5, 2, '#e76f51')
  fill(ctx, x + 11, y + 14, 6, 4, '#5f6b75')
  fill(ctx, x + 12, y + 15, 4, 2, '#a9e1d5')
  fill(ctx, x + 19, y + 15, 4, 2, '#d9d8cc')
  fill(ctx, x + 20, y + 16, 2, 2, '#474b56')
  fill(ctx, x + 24, y + 16, 3, 1, '#b85c4a')
  fill(ctx, x + 24, y + 18, 4, 1, '#6b4223')
}

function drawWardrobe(ctx: CanvasRenderingContext2D, x: number, y: number) {
  shadow(ctx, x + 2, y + 30, 28, 3)
  fill(ctx, x + 2, y + 1, 28, 31, '#5f3c24')
  fill(ctx, x + 4, y + 3, 24, 27, '#7a4a2d')
  fill(ctx, x + 15, y + 3, 2, 27, '#4a2d1b')
  fill(ctx, x + 6, y + 6, 8, 22, '#6d4026')
  fill(ctx, x + 18, y + 6, 8, 22, '#6d4026')
  fill(ctx, x + 8, y + 14, 2, 3, '#d8ad66')
  fill(ctx, x + 22, y + 14, 2, 3, '#d8ad66')
  fill(ctx, x + 2, y, 28, 3, '#4a2d1b')
  fill(ctx, x + 4, y + 1, 24, 1, '#8a5a37')
}

function drawFan(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
) {
  shadow(ctx, x + 3, y + 14, 10, 2)
  fill(ctx, x + 4, y + 12, 8, 3, '#5f6b75')
  fill(ctx, x + 7, y + 5, 2, 8, '#8a949b')
  fill(ctx, x + 5, y + 3, 6, 2, '#8a949b')
  const cx = x + 8
  const cy = y + 2
  ctx.fillStyle = '#d9d8cc'
  ctx.beginPath()
  ctx.arc(cx, cy, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4d5a60'
  ctx.beginPath()
  ctx.arc(cx, cy, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(time * 1.9)
  ctx.fillStyle = '#2a9d8f'
  for (let i = 0; i < 3; i += 1) {
    ctx.rotate((Math.PI * 2) / 3)
    ctx.fillRect(-1, -5, 2, 5)
  }
  ctx.fillStyle = '#f2c14e'
  ctx.fillRect(-1, -1, 2, 2)
  ctx.restore()
  fill(ctx, x + 7, y + 14, 2, 2, '#3e4a50')
}

function drawStandingObjects(
  ctx: CanvasRenderingContext2D,
  objects: RoomObject[],
  character: CharacterState | null,
  player: PlayerRender | null,
  time: number,
) {
  interface Renderable {
    sortY: number
    draw: () => void
  }

  const renderables: Renderable[] = []

  for (const object of objects) {
    if (object.wall || object.kind === 'rug') continue
    const x = object.x * TILE
    const y = object.y * TILE
    const sortY = (object.y + object.h) * TILE
    switch (object.kind) {
      case 'bed':
        renderables.push({ sortY, draw: () => drawBed(ctx, x, y) })
        break
      case 'shelf':
        renderables.push({ sortY, draw: () => drawShelf(ctx, x, y) })
        break
      case 'desk':
        renderables.push({ sortY, draw: () => drawDesk(ctx, x, y) })
        break
      case 'wardrobe':
        renderables.push({ sortY, draw: () => drawWardrobe(ctx, x, y) })
        break
      case 'fan':
        renderables.push({ sortY, draw: () => drawFan(ctx, x, y, time) })
        break
      default:
        break
    }
  }

  if (player) {
    const px = Math.round(player.x * TILE) + 1
    const py = Math.round(player.y * TILE) - 4
    drawCharacterShadow(ctx, px, py)
    renderables.push({
      sortY: (player.y + 1) * TILE,
      draw: () => {
        if (character) {
          drawCharacter(ctx, px, py, character.appearance, player.direction, player.frame)
        }
      },
    })
  }

  renderables
    .sort((left, right) => left.sortY - right.sortY)
    .forEach((renderable) => renderable.draw())
}

export function drawRoom(
  ctx: CanvasRenderingContext2D,
  character: CharacterState | null,
  player: PlayerRender | null,
  time: number,
  cameraX?: number,
  showRug = true,
) {
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = '#2a1c14'
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)

  const center = player ? (player.x + 0.5) * TILE : (ROOM_WIDTH * TILE) / 2
  const camX =
    cameraX ??
    clamp(
      center - VIEW_WIDTH / 2,
      0,
      Math.max(0, ROOM_WIDTH * TILE - VIEW_WIDTH),
    )

  ctx.save()
  ctx.translate(-Math.round(camX), 0)

  for (let y = 0; y < ROOM_HEIGHT; y += 1) {
    for (let x = 0; x < ROOM_WIDTH; x += 1) {
      drawWallTile(ctx, x * TILE, y * TILE)
    }
  }

  for (const object of ROOM_OBJECTS) {
    if (!object.wall) continue
    const x = object.x * TILE
    const y = object.y * TILE
    if (object.kind === 'windowNorth') drawWindowNorth(ctx, x, y)
    else if (object.kind === 'windowEast') drawWindowEast(ctx, x, y)
    else if (object.kind === 'ac') drawAc(ctx, x, y)
    else if (object.kind === 'door') drawDoor(ctx, x, y)
  }

  if (showRug) {
    const rug = ROOM_OBJECTS.find((object) => object.kind === 'rug')
    if (rug) drawRug(ctx, rug.x * TILE, rug.y * TILE)
  }

  // Warm light spilling from the two windows.
  ctx.save()
  ctx.globalAlpha = 0.07
  ctx.fillStyle = '#ffe3a3'
  ctx.beginPath()
  ctx.moveTo(6 * TILE, 1 * TILE)
  ctx.lineTo(8 * TILE, 1 * TILE)
  ctx.lineTo(10 * TILE, 7 * TILE)
  ctx.lineTo(4 * TILE, 7 * TILE)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(13 * TILE, 3 * TILE)
  ctx.lineTo(13 * TILE, 5 * TILE)
  ctx.lineTo(8 * TILE, 7 * TILE)
  ctx.lineTo(8 * TILE, 4 * TILE)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  drawStandingObjects(ctx, ROOM_OBJECTS, character, player, time)
  ctx.restore()

  // Soft edge vignette to make the little screen feel like glass.
  const vignette = ctx.createRadialGradient(
    VIEW_WIDTH / 2,
    VIEW_HEIGHT / 2,
    50,
    VIEW_WIDTH / 2,
    VIEW_HEIGHT / 2,
    110,
  )
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(20, 12, 8, 0.28)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)

  // A few dust motes in the afternoon light.
  for (let i = 0; i < 9; i += 1) {
    const x = (i * 37 + Math.sin(time * 0.4 + i) * 8) % VIEW_WIDTH
    const y = 30 + ((i * 21 + time * 2) % 80)
    ctx.fillStyle = 'rgba(255, 237, 196, 0.22)'
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
  }
}

export function drawRoomBackdrop(ctx: CanvasRenderingContext2D, time: number) {
  drawRoom(
    ctx,
    null,
    null,
    time,
    (ROOM_WIDTH * TILE - VIEW_WIDTH) / 2,
    false,
  )
}
