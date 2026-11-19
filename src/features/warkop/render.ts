import { MENU_ITEMS } from '../../content/warkop'
import { DAY_MS } from './engine'
import type { CustomerView, FloatFx, ItemId, WarkopView } from './types'

/**
 * The 320 × 240 warkop seen from behind the counter.
 *
 * Everything is rectangles: the wall, the shelves, the clock, four regulars and
 * their order tickets. The register shell, the menu keys and the receipt are
 * DOM; this file only knows the screen. CSS scales it with `image-rendering:
 * pixelated`.
 */

export const PLAYFIELD_WIDTH = 320
export const PLAYFIELD_HEIGHT = 240

const COUNTER_Y = 170
const PIXEL_FONT = '"Press Start 2P", monospace'
const ITEM_NAMES = new Map(MENU_ITEMS.map((item) => [item.id, item.name]))

const WALL_TOP = '#f7e6c7'
const WALL_BOTTOM = '#e7c99c'
const TRIM = '#c98f5b'
const WOOD_TOP = '#b98250'
const WOOD_FRONT = '#8a5733'
const WOOD_DARK = '#6f4227'
const WOOD_LINE = 'rgba(70, 40, 20, 0.22)'
const CREAM = '#fff7e6'
const CARD_INK = '#3a2415'
const BORDER = '#6b4a2f'

const SHIRTS = ['#d95a4e', '#2a9d8f', '#e0a13c', '#5a6fd0', '#b06ab3', '#7a9e4a']
const SHIRTS_DARK = ['#a83c32', '#1d7569', '#a9761c', '#3d4f9c', '#844b87', '#5a7a34']
const SKINS = ['#f2c9a0', '#d9a066', '#b97a4a', '#7a4a2b']
const HAIRS = ['#211a1a', '#4a2c1d', '#7a4a2a', '#6b6b6b']
const HIJABS = ['#b06ab3', '#2a9d8f', '#d95a4e', '#5a6fd0']
const CAPS = ['#2a9d8f', '#d95a4e', '#5a6fd0']

function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

function card(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  radius = 2,
) {
  ctx.fillStyle = color
  for (let row = 0; row < h; row += 1) {
    const inset =
      row < radius
        ? radius - row
        : row >= h - radius
          ? row - (h - radius - 1)
          : 0
    ctx.fillRect(x + inset, y + row, w - inset * 2, 1)
  }
}

function pixelCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
) {
  ctx.fillStyle = color
  for (let offset = -radius; offset <= radius; offset += 1) {
    const span = Math.floor(Math.sqrt(radius * radius - offset * offset))
    ctx.fillRect(cx - span, cy + offset, span * 2 + 1, 1)
  }
}

function timeLabel(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1_000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function renderWarkop(
  ctx: CanvasRenderingContext2D,
  view: WarkopView,
  time: number,
  reducedMotion: boolean,
) {
  // The backing store is sized to the display's pixel density; every drawing
  // helper still speaks in the 320 × 240 design grid.
  const scaleX = ctx.canvas.width / PLAYFIELD_WIDTH
  const scaleY = ctx.canvas.height / PLAYFIELD_HEIGHT
  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0)
  ctx.clearRect(0, 0, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  drawWall(ctx, view, time, reducedMotion)
  drawCounter(ctx)
  drawTray(ctx, view)

  for (const customer of view.customers) {
    drawCustomer(ctx, customer, time, reducedMotion)
  }
  for (const customer of view.customers) {
    if (customer.state === 'waiting' || customer.state === 'walking') {
      drawBubble(ctx, customer, time, reducedMotion)
    }
  }

  drawEffects(ctx, view.effects)
}

function drawWall(
  ctx: CanvasRenderingContext2D,
  view: WarkopView,
  time: number,
  reducedMotion: boolean,
) {
  const wall = ctx.createLinearGradient(0, 0, 0, COUNTER_Y)
  wall.addColorStop(0, WALL_TOP)
  wall.addColorStop(1, WALL_BOTTOM)
  ctx.fillStyle = wall
  ctx.fillRect(0, 0, PLAYFIELD_WIDTH, COUNTER_Y)

  for (let x = 0; x < PLAYFIELD_WIDTH; x += 16) {
    rect(ctx, x, 0, 1, 146, 'rgba(170, 120, 70, 0.055)')
  }

  drawLamp(ctx)
  drawShelf(ctx)
  drawClock(ctx, view.remainingMs, time, reducedMotion)
  drawTimer(ctx, view.remainingMs)

  rect(ctx, 0, 146, PLAYFIELD_WIDTH, COUNTER_Y - 146, TRIM)
  rect(ctx, 0, 146, PLAYFIELD_WIDTH, 1, 'rgba(90, 50, 20, 0.3)')
  for (let x = 0; x < PLAYFIELD_WIDTH; x += 24) {
    rect(ctx, x, 147, 1, COUNTER_Y - 147, 'rgba(90, 50, 20, 0.16)')
  }
}

function drawLamp(ctx: CanvasRenderingContext2D) {
  const glow = ctx.createRadialGradient(210, 22, 2, 210, 22, 40)
  glow.addColorStop(0, 'rgba(255, 205, 120, 0.15)')
  glow.addColorStop(1, 'rgba(255, 205, 120, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(170, 0, 90, 80)

  rect(ctx, 210, 0, 1, 10, WOOD_DARK)
  rect(ctx, 199, 10, 22, 4, '#c94f45')
  rect(ctx, 202, 14, 16, 3, '#e0a13c')
  rect(ctx, 208, 17, 4, 3, '#ffe9a8')
}

function drawShelf(ctx: CanvasRenderingContext2D) {
  const x = 10
  const width = 66
  rect(ctx, x, 18, width, 3, '#8a5a3b')
  rect(ctx, x, 42, width, 3, '#8a5a3b')
  rect(ctx, x + 2, 21, 2, 7, WOOD_DARK)
  rect(ctx, x + width - 4, 21, 2, 7, WOOD_DARK)

  const jars = ['#e0a13c', '#d95a4e', '#7a9e4a', '#b06ab3']
  jars.forEach((color, index) => {
    const jarX = 14 + index * 14
    rect(ctx, jarX, 8, 8, 10, color)
    rect(ctx, jarX, 6, 8, 2, WOOD_DARK)
    rect(ctx, jarX + 1, 9, 2, 7, 'rgba(255, 255, 255, 0.22)')
  })

  const lower = ['#e7c07a', '#c95a3f', '#9cc47a']
  lower.forEach((color, index) => {
    const jarX = 20 + index * 14
    rect(ctx, jarX, 33, 8, 9, color)
    rect(ctx, jarX, 31, 8, 2, WOOD_DARK)
    rect(ctx, jarX + 1, 34, 2, 6, 'rgba(255, 255, 255, 0.22)')
  })
}

function drawClock(
  ctx: CanvasRenderingContext2D,
  remainingMs: number,
  time: number,
  reducedMotion: boolean,
) {
  const cx = 160
  const cy = 26
  const ratio = Math.max(0, Math.min(1, remainingMs / DAY_MS))

  ctx.strokeStyle = 'rgba(90, 50, 20, 0.16)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, 18, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = '#e0a13c'
  ctx.beginPath()
  ctx.arc(cx, cy, 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio)
  ctx.stroke()
  ctx.lineWidth = 1

  pixelCircle(ctx, cx, cy, 15, WOOD_DARK)
  pixelCircle(ctx, cx, cy, 13, CREAM)

  for (let tick = 0; tick < 4; tick += 1) {
    const angle = (tick * Math.PI) / 2 - Math.PI / 2
    rect(
      ctx,
      cx + Math.cos(angle) * 10 - 0.5,
      cy + Math.sin(angle) * 10 - 0.5,
      1,
      1,
      'rgba(58, 36, 21, 0.4)',
    )
  }

  const progress = 1 - ratio
  const minuteAngle = -Math.PI / 2 + progress * Math.PI * 2
  const hourAngle = -Math.PI / 2 + progress * (Math.PI * 2) / 12 + Math.PI / 2
  const wobble = reducedMotion ? 0 : Math.sin(time / 900) * 0.01

  ctx.strokeStyle = CARD_INK
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + Math.cos(hourAngle + wobble) * 6, cy + Math.sin(hourAngle + wobble) * 6)
  ctx.stroke()

  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + Math.cos(minuteAngle) * 9, cy + Math.sin(minuteAngle) * 9)
  ctx.stroke()
  pixelCircle(ctx, cx, cy, 1, CARD_INK)
}

function drawTimer(ctx: CanvasRenderingContext2D, remainingMs: number) {
  card(ctx, 236, 8, 76, 15, 'rgba(255, 247, 230, 0.86)', 2)
  ctx.font = `7px ${PIXEL_FONT}`
  ctx.textAlign = 'center'
  ctx.fillStyle = CARD_INK
  ctx.fillText(`SISA ${timeLabel(remainingMs)}`, 274, 19)
  ctx.textAlign = 'left'
}

function drawCounter(ctx: CanvasRenderingContext2D) {
  rect(ctx, 0, COUNTER_Y, PLAYFIELD_WIDTH, 20, WOOD_TOP)
  rect(ctx, 0, COUNTER_Y, PLAYFIELD_WIDTH, 1, '#d8a36b')
  rect(ctx, 0, COUNTER_Y + 20, PLAYFIELD_WIDTH, 2, WOOD_DARK)
  rect(ctx, 0, COUNTER_Y + 22, PLAYFIELD_WIDTH, 48, WOOD_FRONT)

  for (let x = 10; x < PLAYFIELD_WIDTH; x += 28) {
    rect(ctx, x, COUNTER_Y + 24, 1, 46, WOOD_LINE)
  }
  rect(ctx, 0, PLAYFIELD_HEIGHT - 3, PLAYFIELD_WIDTH, 3, 'rgba(40, 22, 12, 0.45)')
}

function drawTray(ctx: CanvasRenderingContext2D, view: WarkopView) {
  card(ctx, 98, 172, 124, 16, WOOD_DARK, 2)
  MENU_ITEMS.forEach((item, index) => {
    const slotX = 101 + index * 24
    rect(ctx, slotX, 174, 22, 12, 'rgba(30, 16, 8, 0.35)')
    const count = view.inventory[item.id]
    ctx.save()
    ctx.globalAlpha = count > 0 ? 1 : 0.22
    drawItemIcon(ctx, item.id, slotX + 4, 174)
    ctx.restore()

    if (count > 1) {
      ctx.fillStyle = CARD_INK
      ctx.beginPath()
      ctx.arc(slotX + 17, 181, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = CREAM
      ctx.font = `6px ${PIXEL_FONT}`
      ctx.textAlign = 'center'
      ctx.fillText(String(count), slotX + 17, 183)
      ctx.textAlign = 'left'
    }
  })
  drawCounterProps(ctx)
}

function drawCounterProps(ctx: CanvasRenderingContext2D) {
  // Kettle on the left end of the counter.
  rect(ctx, 8, 158, 18, 12, '#c3ccd1')
  rect(ctx, 10, 154, 14, 4, '#d3dbe0')
  rect(ctx, 24, 157, 4, 3, '#8a949a')
  rect(ctx, 12, 149, 2, 5, '#8a949a')

  // Rice cooker on the right.
  rect(ctx, 296, 156, 18, 14, '#e7e0d2')
  rect(ctx, 298, 152, 14, 4, '#d3c9b6')
  rect(ctx, 303, 154, 4, 2, '#c95a3f')
}

function drawCustomer(
  ctx: CanvasRenderingContext2D,
  customer: CustomerView,
  time: number,
  reducedMotion: boolean,
) {
  const x = Math.round(customer.x)
  const bob =
    reducedMotion || customer.state === 'leaving'
      ? 0
      : Math.round(Math.sin(time / 520 + customer.id * 1.3))
  const variant = customer.variant
  const skin = SKINS[variant % SKINS.length]
  const shirt = SHIRTS[variant % SHIRTS.length]
  const shirtDark = SHIRTS_DARK[variant % SHIRTS_DARK.length]
  const hair = HAIRS[(variant + 1) % HAIRS.length]
  const style = variant % 4

  rect(ctx, x - 14, 134 + bob, 3, 18, shirtDark)
  rect(ctx, x + 11, 134 + bob, 3, 18, shirtDark)

  card(ctx, x - 11, 130 + bob, 22, 40, shirt, 3)
  rect(ctx, x - 4, 130 + bob, 8, 2, 'rgba(255, 255, 255, 0.24)')
  rect(ctx, x - 14, 152 + bob, 3, 4, skin)
  rect(ctx, x + 11, 152 + bob, 3, 4, skin)
  rect(ctx, x - 2, 124 + bob, 4, 6, skin)

  rect(ctx, x - 8, 112 + bob, 16, 14, skin)
  rect(ctx, x - 7, 111 + bob, 14, 1, skin)
  rect(ctx, x - 9, 117 + bob, 1, 3, skin)
  rect(ctx, x + 8, 117 + bob, 1, 3, skin)

  if (style === 0) {
    rect(ctx, x - 8, 110 + bob, 16, 4, hair)
    rect(ctx, x - 9, 113 + bob, 2, 5, hair)
    rect(ctx, x + 7, 113 + bob, 2, 5, hair)
  } else if (style === 1) {
    const cap = CAPS[variant % CAPS.length]
    rect(ctx, x - 9, 108 + bob, 18, 5, cap)
    rect(ctx, x - 10, 113 + bob, 20, 2, cap)
    rect(ctx, x - 9, 109 + bob, 5, 1, 'rgba(255, 255, 255, 0.25)')
  } else if (style === 2) {
    rect(ctx, x - 8, 110 + bob, 16, 4, hair)
    rect(ctx, x - 9, 113 + bob, 2, 5, hair)
    rect(ctx, x + 7, 113 + bob, 2, 5, hair)
    pixelCircle(ctx, x, 106 + bob, 4, hair)
  } else {
    const hijab = HIJABS[variant % HIJABS.length]
    rect(ctx, x - 9, 108 + bob, 18, 6, hijab)
    rect(ctx, x - 10, 113 + bob, 3, 11, hijab)
    rect(ctx, x + 7, 113 + bob, 3, 11, hijab)
    rect(ctx, x - 9, 123 + bob, 3, 3, hijab)
    rect(ctx, x + 6, 123 + bob, 3, 3, hijab)
    rect(ctx, x - 8, 109 + bob, 4, 1, 'rgba(255, 255, 255, 0.25)')
  }

  drawFace(ctx, x, 112 + bob, customer, time, reducedMotion)

  if (customer.state === 'happy') {
    drawHeart(ctx, x - 4, 98, time)
  } else if (customer.angry) {
    drawStorm(ctx, x - 6, 100)
  }
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  customer: CustomerView,
  time: number,
  reducedMotion: boolean,
) {
  const blink =
    !reducedMotion && customer.state === 'waiting'
      ? (time + customer.id * 640) % 4_200 > 4_080
      : false
  const happy = customer.state === 'happy'
  const angry = customer.angry
  const worried = customer.patience < 0.32

  if (happy) {
    rect(ctx, x - 5, headY + 6, 3, 1, CARD_INK)
    rect(ctx, x + 3, headY + 6, 3, 1, CARD_INK)
    rect(ctx, x - 2, headY + 9, 4, 1, CARD_INK)
    return
  }

  if (angry) {
    rect(ctx, x - 6, headY + 4, 3, 1, CARD_INK)
    rect(ctx, x + 3, headY + 4, 3, 1, CARD_INK)
    rect(ctx, x - 5, headY + 6, 2, 2, CARD_INK)
    rect(ctx, x + 3, headY + 6, 2, 2, CARD_INK)
    rect(ctx, x - 2, headY + 10, 4, 1, CARD_INK)
    return
  }

  if (blink) {
    rect(ctx, x - 5, headY + 7, 2, 1, CARD_INK)
    rect(ctx, x + 3, headY + 7, 2, 1, CARD_INK)
  } else {
    rect(ctx, x - 5, headY + 6, 2, 2, CARD_INK)
    rect(ctx, x + 3, headY + 6, 2, 2, CARD_INK)
  }

  if (worried) {
    rect(ctx, x - 6, headY + 4, 3, 1, CARD_INK)
    rect(ctx, x + 3, headY + 4, 3, 1, CARD_INK)
    rect(ctx, x - 1, headY + 10, 2, 2, CARD_INK)
    rect(ctx, x + 7, headY + 5, 1, 2, '#7fc4e8')
  } else {
    rect(ctx, x - 1, headY + 10, 3, 1, CARD_INK)
  }
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
) {
  const bob = Math.round(Math.sin(time / 260) * 1)
  ctx.fillStyle = '#f0607e'
  ctx.fillRect(x + 1, y + 2 + bob, 2, 1)
  ctx.fillRect(x + 5, y + 2 + bob, 2, 1)
  ctx.fillRect(x, y + 3 + bob, 8, 2)
  ctx.fillRect(x + 1, y + 5 + bob, 6, 1)
  ctx.fillRect(x + 2, y + 6 + bob, 4, 1)
  ctx.fillRect(x + 3, y + 7 + bob, 2, 1)
}

function drawStorm(ctx: CanvasRenderingContext2D, x: number, y: number) {
  rect(ctx, x, y + 2, 12, 4, 'rgba(90, 80, 70, 0.75)')
  rect(ctx, x + 2, y, 6, 2, 'rgba(90, 80, 70, 0.75)')
  rect(ctx, x + 4, y + 6, 2, 3, '#5a6fd0')
  rect(ctx, x + 3, y + 8, 2, 1, '#5a6fd0')
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  customer: CustomerView,
  time: number,
  reducedMotion: boolean,
) {
  const order = customer.order
  const width = 72
  const rowHeight = 13
  const height = 15 + order.length * rowHeight
  const low = customer.patience < 0.25
  const shake =
    low && !reducedMotion ? Math.round(Math.sin(time / 70) * 1) : 0
  const rawX = Math.round(customer.x - width / 2 + shake)
  const x = Math.max(4, Math.min(PLAYFIELD_WIDTH - width - 4, rawX))
  const y = 104 - height
  const border = low ? '#d94b4b' : BORDER

  card(ctx, x + 1, y + 2, width, height, 'rgba(90, 60, 30, 0.16)')
  card(ctx, x, y, width, height, CREAM, 3)

  rect(ctx, x, y, width, 1, border)
  rect(ctx, x, y + height - 1, width, 1, border)
  rect(ctx, x, y, 1, height, border)
  rect(ctx, x + width - 1, y, 1, height, border)

  const tailX = Math.round(
    Math.max(x + 8, Math.min(x + width - 8, customer.x + shake)),
  )
  rect(ctx, tailX - 2, y + height, 4, 1, border)
  rect(ctx, tailX - 3, y + height + 1, 6, 1, border)
  rect(ctx, tailX - 2, y + height, 2, 1, CREAM)
  rect(ctx, tailX - 1, y + height + 1, 2, 1, CREAM)

  ctx.font = `8px ${PIXEL_FONT}`
  ctx.textAlign = 'left'
  order.forEach((id, index) => {
    const rowY = y + 4 + index * rowHeight
    drawItemIcon(ctx, id, x + 4, rowY)
    ctx.fillStyle = CARD_INK
    ctx.fillText(ITEM_NAMES.get(id) ?? '', x + 19, rowY + 10)
  })

  const barWidth = width - 10
  rect(ctx, x + 5, y + height - 6, barWidth, 3, 'rgba(58, 36, 21, 0.16)')
  const filled = Math.round(barWidth * customer.patience)
  const barColor =
    customer.patience > 0.5
      ? '#5aa85a'
      : customer.patience > 0.25
        ? '#e0a13c'
        : '#d94b4b'
  if (filled > 0) rect(ctx, x + 5, y + height - 6, filled, 3, barColor)
}

function drawEffects(ctx: CanvasRenderingContext2D, effects: readonly FloatFx[]) {
  for (const effect of effects) {
    const progress = Math.min(1, effect.age / 1_100)
    const y = effect.y - progress * 14
    const alpha = 1 - progress

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = `7px ${PIXEL_FONT}`
    ctx.textAlign = 'center'

    const textWidth = ctx.measureText(effect.text).width
    const pillWidth = Math.ceil(textWidth) + 8
    card(
      ctx,
      effect.x - pillWidth / 2,
      y - 8,
      pillWidth,
      11,
      'rgba(255, 247, 230, 0.92)',
      2,
    )
    ctx.fillStyle = effect.kind === 'serve' ? '#a9601c' : '#b5322b'
    ctx.fillText(effect.text, effect.x, y)
    ctx.restore()
  }
  ctx.textAlign = 'left'
}

export function drawItemIcon(
  ctx: CanvasRenderingContext2D,
  item: ItemId,
  x: number,
  y: number,
  scale = 1,
) {
  const r = (rx: number, ry: number, rw: number, rh: number, color: string) =>
    rect(ctx, x + rx * scale, y + ry * scale, rw * scale, rh * scale, color)

  if (item === 'kopi') {
    r(2, 9, 9, 1, '#c9b089')
    r(3, 3, 6, 6, '#fff3df')
    r(3, 5, 6, 3, '#6b3f26')
    r(9, 4, 2, 3, '#fff3df')
    r(4, 0, 1, 2, 'rgba(255, 255, 255, 0.72)')
    r(6, 1, 1, 1, 'rgba(255, 255, 255, 0.72)')
    return
  }

  if (item === 'teh') {
    r(3, 2, 6, 8, '#e7f6f8')
    r(3, 5, 6, 5, '#d98a2b')
    r(3, 2, 6, 1, '#ffffff')
    r(8, 0, 1, 3, '#c9a227')
    r(7, 0, 3, 2, '#fffdf2')
    return
  }

  if (item === 'mie') {
    r(6, 0, 1, 4, '#8a5a3b')
    r(8, 0, 1, 3, '#8a5a3b')
    r(1, 6, 10, 1, '#e05a5a')
    r(2, 7, 8, 4, '#f2e3c0')
    r(2, 4, 8, 2, '#f0c15a')
    r(3, 3, 6, 1, '#f0c15a')
    r(4, 4, 2, 2, '#fff6e0')
    r(5, 5, 1, 1, '#f0a03c')
    return
  }

  if (item === 'nasi') {
    r(1, 9, 10, 1, 'rgba(58, 36, 21, 0.18)')
    r(1, 7, 10, 2, '#dfe6ea')
    r(2, 7, 8, 1, '#b9c7cf')
    r(3, 4, 6, 3, '#fffdf5')
    r(3, 3, 6, 1, '#fffdf5')
    r(2, 6, 8, 1, '#e6dcc2')
    r(8, 7, 2, 1, '#5a8a3c')
    r(2, 7, 2, 1, '#c94f45')
    return
  }

  r(1, 8, 10, 2, '#e0b874')
  r(1, 8, 10, 1, '#c99b4a')
  r(2, 4, 3, 3, '#8a5a1c')
  r(2, 4, 2, 2, '#e0b04a')
  r(6, 3, 4, 4, '#8a5a1c')
  r(6, 3, 3, 3, '#d9a53c')
  r(8, 6, 3, 2, '#8a5a1c')
  r(8, 6, 2, 1, '#eac05a')
}
