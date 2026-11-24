import type { Dir, NpcDef } from '../../../content/pekan/island'
import type { CompanionLook } from '../types'

/**
 * People and the companion, drawn from rectangles at the same 14 × 20 scale as
 * the rest of the shelf. The player wears the team scarf; the companion is the
 * only thing the player gets to design.
 */

const OUTLINE = '#241a14'
const PANTS = '#26303a'
const SHOES = '#141a20'

export interface PersonStyle {
  shirt: string
  skin: string
  hair: string
  hat: 'none' | 'cap' | 'straw'
  scarf?: string
}

export function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  ctx.fillStyle = 'rgba(30, 45, 25, 0.25)'
  ctx.beginPath()
  ctx.ellipse(x + 7, y + 19, 5, 2, 0, 0, Math.PI * 2)
  ctx.fill()
}

/** `x, y` is the sprite's top-left; the feet land 20 px below it. */
export function drawPerson(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: Dir,
  frame: number,
  style: PersonStyle,
): void {
  const rect = (rx: number, ry: number, rw: number, rh: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(Math.round(x + rx), Math.round(y + ry), rw, rh)
  }

  const swing = frame === 1 ? 1 : 0
  rect(4 - swing, 15, 3, 3, PANTS)
  rect(8 + swing, 15, 3, 3, PANTS)
  rect(3 - swing, 18, 4, 2, SHOES)
  rect(8 + swing, 18, 4, 2, SHOES)

  rect(3, 9, 8, 6, style.shirt)
  rect(2, 9, 1, 4, style.shirt)
  rect(11, 9, 1, 4, style.shirt)
  rect(2, 13, 1, 2, style.skin)
  rect(11, 13, 1, 2, style.skin)
  rect(3, 14, 8, 1, 'rgba(0, 0, 0, 0.18)')
  rect(5, 9, 3, 1, 'rgba(255, 255, 255, 0.16)')

  if (style.scarf) {
    rect(3, 9, 8, 2, style.scarf)
    rect(4, 11, 2, 3, style.scarf)
    rect(3, 9, 8, 1, 'rgba(255, 255, 255, 0.25)')
  }

  // Head: stepped rectangles keep it round at this size.
  rect(4, 1, 6, 1, style.skin)
  rect(3, 2, 8, 5, style.skin)
  rect(4, 7, 6, 1, style.skin)
  rect(2, 4, 1, 2, style.skin)
  rect(11, 4, 1, 2, style.skin)
  rect(6, 8, 2, 1, style.skin)

  // Hair.
  rect(3, 0, 8, 2, style.hair)
  rect(3, 2, 1, 3, style.hair)
  rect(10, 2, 1, 2, style.hair)

  if (dir === 'up') {
    rect(4, 1, 6, 5, style.hair)
    rect(3, 2, 1, 3, style.hair)
    rect(10, 2, 1, 3, style.hair)
    rect(4, 6, 6, 1, style.skin)
    if (style.hat === 'cap') {
      rect(3, 0, 8, 2, '#2f4a6b')
      rect(2, 2, 10, 1, '#22374f')
    } else if (style.hat === 'straw') {
      rect(1, 1, 12, 2, '#d9b96a')
      rect(3, -1, 8, 2, '#e8cf8f')
    }
    return
  }

  if (dir === 'left' || dir === 'right') {
    const flip = dir === 'right'
    rect(flip ? 8 : 5, 4, 1, 2, OUTLINE)
    rect(flip ? 5 : 8, 4, 1, 2, OUTLINE)
    rect(flip ? 9 : 4, 5, 1, 1, 'rgba(36, 26, 20, 0.45)')
    rect(flip ? 6 : 5, 6, 2, 1, '#7a3b32')
  } else {
    rect(5, 4, 1, 2, OUTLINE)
    rect(8, 4, 1, 2, OUTLINE)
    rect(6, 6, 2, 1, '#7a3b32')
  }

  if (style.hat === 'cap') {
    rect(3, 0, 8, 2, '#2f4a6b')
    rect(2, 2, dir === 'left' ? 6 : 10, 1, '#22374f')
  } else if (style.hat === 'straw') {
    rect(1, 1, 12, 2, '#d9b96a')
    rect(3, -1, 8, 2, '#e8cf8f')
    rect(2, 2, 10, 1, '#b89a52')
  }
}

export function drawNpc(
  ctx: CanvasRenderingContext2D,
  npc: NpcDef,
  x: number,
  y: number,
  time: number,
): void {
  drawShadow(ctx, x, y)
  const bob = Math.sin(time * 1.8 + npc.x) * 0.4
  drawPerson(ctx, x, y - 4 + bob, npc.dir, 0, {
    shirt: npc.look.shirt,
    skin: npc.look.skin,
    hair: npc.look.hair,
    hat: npc.look.hat,
  })
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: Dir,
  frame: number,
  teamColor: string,
  time = 0,
): void {
  drawShadow(ctx, x, y)
  drawPerson(ctx, x, y - 4, dir, frame, {
    shirt: '#f1e3c3',
    skin: '#d9a066',
    hair: '#211a1a',
    hat: 'none',
    scarf: teamColor,
  })

  // A small marker so the player never gets lost among the villagers.
  const bob = Math.sin(time * 5) * 1.4
  ctx.fillStyle = 'rgba(255, 248, 220, 0.92)'
  ctx.beginPath()
  ctx.moveTo(x + 7, y - 11 + bob)
  ctx.lineTo(x + 4, y - 16 + bob)
  ctx.lineTo(x + 10, y - 16 + bob)
  ctx.closePath()
  ctx.fill()
}

const COMPANION_COLORS = [
  '#f2b8b8',
  '#a8d8c0',
  '#f2d08a',
  '#b9c6f2',
  '#d8b9f2',
  '#f2b98a',
  '#c9c9c9',
  '#7fd1c4',
]

/** A 14 px blob with ears and one accessory. Cosmetic, but it is yours. */
export function drawCompanion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  look: CompanionLook,
  time: number,
): void {
  const color = COMPANION_COLORS[look.color % COMPANION_COLORS.length]
  const bob = Math.sin(time * 4 + x * 0.08) * 1.2
  const cx = x + 7
  const cy = y + 9 + bob

  ctx.fillStyle = 'rgba(30, 45, 25, 0.25)'
  ctx.beginPath()
  ctx.ellipse(cx, y + 15, 6, 2, 0, 0, Math.PI * 2)
  ctx.fill()

  // Ears behind the body.
  if (look.ear === 0) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(cx - 5, cy - 6, 3, 0, Math.PI * 2)
    ctx.arc(cx + 5, cy - 6, 3, 0, Math.PI * 2)
    ctx.fill()
  } else if (look.ear === 1) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(cx - 6, cy - 3)
    ctx.lineTo(cx - 5, cy - 11)
    ctx.lineTo(cx - 1, cy - 4)
    ctx.closePath()
    ctx.moveTo(cx + 6, cy - 3)
    ctx.lineTo(cx + 5, cy - 11)
    ctx.lineTo(cx + 1, cy - 4)
    ctx.closePath()
    ctx.fill()
  } else if (look.ear === 2) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(cx - 7, cy - 1, 3, 5, 0.3, 0, Math.PI * 2)
    ctx.ellipse(cx + 7, cy - 1, 3, 5, -0.3, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = '#e8cf8f'
    ctx.beginPath()
    ctx.moveTo(cx - 2, cy - 4)
    ctx.lineTo(cx, cy - 11)
    ctx.lineTo(cx + 2, cy - 4)
    ctx.closePath()
    ctx.fill()
  }

  // Body.
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
  ctx.beginPath()
  ctx.arc(cx - 2, cy - 2.5, 3, 0, Math.PI * 2)
  ctx.fill()

  // Face.
  ctx.fillStyle = OUTLINE
  ctx.fillRect(cx - 4, cy - 1, 2, 2)
  ctx.fillRect(cx + 2, cy - 1, 2, 2)
  ctx.fillRect(cx - 1, cy + 3, 3, 1)

  if (look.acc === 1) {
    ctx.fillStyle = '#5f9e4a'
    ctx.beginPath()
    ctx.ellipse(cx, cy - 8, 4, 2, -0.4, 0, Math.PI * 2)
    ctx.fill()
  } else if (look.acc === 2) {
    ctx.fillStyle = '#d9534b'
    ctx.fillRect(cx - 7, cy - 5, 14, 3)
    ctx.fillRect(cx + 4, cy - 2, 2, 4)
  } else if (look.acc === 3) {
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx - 3, cy, 3, 0, Math.PI * 2)
    ctx.arc(cx + 3, cy, 3, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillRect(cx - 1, cy - 1, 2, 1)
  }
}
