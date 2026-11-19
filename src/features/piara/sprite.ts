import type { FxKind, MoodId, PetState, StageId } from './types'

/**
 * The 160 × 120 colour LCD inside PIARA.
 *
 * Everything is drawn from rectangles and 1 px strokes — there are no sprites
 * and no images. The creature is assembled per stage from a unit grid, which is
 * why it can grow (and blink, and sulk) without an atlas. The palette follows
 * the device clock: blue days, peach dawns, violet dusks and an indigo night
 * with a yellow moon. CSS scales the canvas up with `image-rendering: pixelated`.
 */

export const LCD_WIDTH = 160
export const LCD_HEIGHT = 120

/** How long each one-shot animation runs; the hook clears `fx` by this age. */
export const FX_MS: Record<FxKind, number> = {
  tap: 420,
  hatch: 1_300,
  feed: 1_500,
  play: 1_600,
  sleep: 900,
  wake: 900,
  clean: 1_400,
  evolve: 2_000,
}

export interface LcdView {
  pet: PetState
  mood: MoodId
  fx: { kind: FxKind; age: number } | null
  /** Milliseconds since the cartridge mounted; drives idle animation. */
  time: number
  reducedMotion: boolean
}

const FLOOR = 96
const CENTER = 80

const INK = '#24323d'

const HEART = ['01010', '11111', '11111', '01110', '00100']
const FORK = ['10101', '10101', '11111', '00100', '00100']
const MOON = ['01110', '11000', '10000', '11000', '01110']
const Z = ['111', '001', '010', '100', '111']
const SPARKLE = ['00100', '00100', '11111', '00100', '00100']

const FOOD_COLOR = '#e8923a'
const JOY_COLOR = '#f0607e'
const REST_COLOR = '#5a6fd0'

type Phase = 'night' | 'dawn' | 'day' | 'dusk'

interface Palette {
  skyTop: string
  skyBottom: string
  sun: string
  sunCore: string
  cloud: string
  cloudShade: string
  grass: string
  grassDark: string
  soil: string
  star: string
}

const PALETTES: Record<Phase, Palette> = {
  day: {
    skyTop: '#79c8ea',
    skyBottom: '#dff4d8',
    sun: '#ffcf4d',
    sunCore: '#fff1a8',
    cloud: '#ffffff',
    cloudShade: '#cfe8f5',
    grass: '#7cc47c',
    grassDark: '#4f9a5f',
    soil: '#c99b62',
    star: '#fff3b0',
  },
  dawn: {
    skyTop: '#ffb59f',
    skyBottom: '#ffe8c7',
    sun: '#ff9a5c',
    sunCore: '#ffd9a5',
    cloud: '#fff2e8',
    cloudShade: '#ffd0bd',
    grass: '#82c47a',
    grassDark: '#55995d',
    soil: '#c99b62',
    star: '#fff3b0',
  },
  dusk: {
    skyTop: '#a98bd8',
    skyBottom: '#ffc79f',
    sun: '#ff8a5c',
    sunCore: '#ffd0a0',
    cloud: '#ffe0d2',
    cloudShade: '#e8a4b8',
    grass: '#6aa86e',
    grassDark: '#427c50',
    soil: '#a97b55',
    star: '#fff3b0',
  },
  night: {
    skyTop: '#28315e',
    skyBottom: '#4f639a',
    sun: '#ffe9a8',
    sunCore: '#fff6d0',
    cloud: '#7d8dbd',
    cloudShade: '#5a6b9e',
    grass: '#3a6b52',
    grassDark: '#274c3c',
    soil: '#5a4432',
    star: '#fff3b0',
  },
}

const STAR_SPOTS: ReadonlyArray<[number, number]> = [
  [18, 16],
  [42, 9],
  [66, 20],
  [104, 8],
  [136, 15],
  [96, 27],
  [148, 30],
]

type BodyStage = Exclude<StageId, 'telur'>

const UNIT: Record<BodyStage, number> = {
  bayi: 3,
  anak: 3,
  remaja: 3,
  dewasa: 4,
}

const SHAPE: Record<BodyStage, { w: number; h: number }> = {
  bayi: { w: 7, h: 5 },
  anak: { w: 8, h: 6 },
  remaja: { w: 10, h: 8 },
  dewasa: { w: 9, h: 8 },
}

/**
 * Each stage shifts hue as well as size: lime baby, leaf-green child, teal
 * teen, deep-teal adult with a golden tuft. Growth is visible at a glance.
 */
const BODY_COLOR: Record<
  BodyStage,
  { main: string; light: string; dark: string }
> = {
  bayi: { main: '#a9dc74', light: '#e2f6b2', dark: '#5d8a3a' },
  anak: { main: '#86cf6d', light: '#d5f2ad', dark: '#4c7d38' },
  remaja: { main: '#5fc59b', light: '#c7f0d9', dark: '#2f7a5d' },
  dewasa: { main: '#45aa92', light: '#b5e8d6', dark: '#226a58' },
}

const CHEEK = '#ff8fa3'
const TUFT = '#ffd166'

const EGG_HALVES = [4, 6, 8, 9, 10, 11, 11, 11, 10, 9, 8, 7, 5]

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

function drawMatrix(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rows: readonly string[],
  color: string,
  scale = 1,
) {
  ctx.fillStyle = color
  rows.forEach((row, rowIndex) => {
    for (let column = 0; column < row.length; column += 1) {
      if (row[column] !== '1') continue
      ctx.fillRect(
        Math.round(x + column * scale),
        Math.round(y + rowIndex * scale),
        scale,
        scale,
      )
    }
  })
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
    ctx.fillRect(
      Math.round(cx - span),
      Math.round(cy + offset),
      span * 2 + 1,
      1,
    )
  }
}

/** A soft rounded card, used behind the need gauges so they read at night. */
function panel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color
  for (let row = 0; row < h; row += 1) {
    const inset =
      row < 2 ? 2 - row : row > h - 3 ? row - (h - 3) : 0
    ctx.fillRect(x + inset, y + row, w - inset * 2, 1)
  }
}

function phaseOf(hour: number): Phase {
  if (hour < 5) return 'night'
  if (hour < 7) return 'dawn'
  if (hour < 17) return 'day'
  if (hour < 19) return 'dusk'
  return 'night'
}

export function renderLcd(ctx: CanvasRenderingContext2D, view: LcdView) {
  ctx.imageSmoothingEnabled = false
  ctx.lineWidth = 1

  const phase: Phase = view.pet.asleep
    ? 'night'
    : phaseOf(new Date().getHours())
  const palette = PALETTES[phase]

  drawSky(ctx, phase, palette, view)
  drawGround(ctx, palette)
  drawFlowers(ctx, palette)
  drawProps(ctx)
  drawMess(ctx, view.pet.mess)

  if (view.pet.stage === 'telur') {
    drawEgg(ctx, view)
  } else {
    drawPet(ctx, view)
  }

  drawFx(ctx, view)
  drawGauges(
    ctx,
    view.pet,
    phase === 'night'
      ? 'rgba(240, 247, 255, 0.3)'
      : 'rgba(250, 253, 255, 0.45)',
  )
}

function drawSky(
  ctx: CanvasRenderingContext2D,
  phase: Phase,
  palette: Palette,
  view: LcdView,
) {
  const sky = ctx.createLinearGradient(0, 0, 0, FLOOR)
  sky.addColorStop(0, palette.skyTop)
  sky.addColorStop(0.72, palette.skyBottom)
  sky.addColorStop(1, palette.skyBottom)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, LCD_WIDTH, FLOOR)

  if (phase === 'night') {
    drawMoon(ctx)
    drawStars(ctx, palette, view)
  } else {
    drawSun(ctx, phase, palette)
  }
  drawClouds(ctx, palette, view)
}

function drawSun(
  ctx: CanvasRenderingContext2D,
  phase: Phase,
  palette: Palette,
) {
  const low = phase === 'dawn' || phase === 'dusk'
  const cx = low ? 130 : 126
  const cy = low ? 46 : 26

  ctx.save()
  ctx.globalAlpha = 0.22
  pixelCircle(ctx, cx, cy, 12, palette.sun)
  ctx.restore()

  pixelCircle(ctx, cx, cy, 9, palette.sun)
  pixelCircle(ctx, cx, cy, 6, palette.sunCore)

  ctx.save()
  ctx.globalAlpha = 0.55
  ctx.strokeStyle = palette.sun
  for (let ray = 0; ray < 4; ray += 1) {
    const angle = (ray * Math.PI) / 2
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * 12, cy + Math.sin(angle) * 12)
    ctx.lineTo(cx + Math.cos(angle) * 15, cy + Math.sin(angle) * 15)
    ctx.stroke()
  }
  ctx.restore()
}

function drawMoon(ctx: CanvasRenderingContext2D) {
  ctx.save()
  ctx.globalAlpha = 0.18
  pixelCircle(ctx, 126, 26, 16, '#ffe9a8')
  ctx.restore()

  pixelCircle(ctx, 126, 26, 9, '#ffe9a8')
  pixelCircle(ctx, 126, 26, 8, '#fff6d0')
  rect(ctx, 123, 23, 2, 2, '#e8d08a')
  rect(ctx, 128, 28, 2, 1, '#e8d08a')
  rect(ctx, 127, 21, 1, 1, '#e8d08a')
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  view: LcdView,
) {
  const twinkle = view.reducedMotion ? 0 : view.time / 900
  STAR_SPOTS.forEach(([x, y], index) => {
    const alpha = 0.45 + Math.abs(Math.sin(twinkle + index * 1.7)) * 0.5
    ctx.save()
    ctx.globalAlpha = alpha
    drawMatrix(ctx, x, y, ['010', '111', '010'], palette.star)
    ctx.restore()
  })
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  palette: Palette,
) {
  rect(ctx, x, y, 16, 4, palette.cloud)
  rect(ctx, x + 3, y - 2, 9, 2, palette.cloud)
  rect(ctx, x + 6, y - 4, 5, 2, palette.cloud)
  rect(ctx, x + 1, y + 4, 14, 1, palette.cloudShade)
}

function drawClouds(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  view: LcdView,
) {
  const time = view.reducedMotion ? 0 : view.time
  const first = ((time / 90) % 210) - 30
  const second = ((time / 140 + 130) % 230) - 40
  ctx.save()
  ctx.globalAlpha = 0.92
  drawCloud(ctx, first, 34, palette)
  drawCloud(ctx, second, 52, palette)
  ctx.restore()
}

function drawGround(ctx: CanvasRenderingContext2D, palette: Palette) {
  rect(ctx, 0, FLOOR, LCD_WIDTH, 10, palette.grass)
  rect(ctx, 0, FLOOR, LCD_WIDTH, 1, palette.grassDark)
  rect(ctx, 0, FLOOR + 10, LCD_WIDTH, LCD_HEIGHT - FLOOR - 10, palette.soil)

  for (let x = 6; x < LCD_WIDTH; x += 13) {
    rect(ctx, x, FLOOR + 14 + ((x * 3) % 4), 2, 1, 'rgba(255, 255, 255, 0.14)')
  }
  for (let x = 3; x < LCD_WIDTH; x += 9) {
    const height = 1 + ((x * 5) % 3)
    rect(ctx, x, FLOOR - height, 1, height, palette.grassDark)
  }
}

function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  stem: string,
  petal: string,
  center: string,
) {
  rect(ctx, x, FLOOR - 4, 1, 4, stem)
  rect(ctx, x - 1, FLOOR - 5, 1, 1, petal)
  rect(ctx, x + 1, FLOOR - 5, 1, 1, petal)
  rect(ctx, x, FLOOR - 6, 1, 1, petal)
  rect(ctx, x, FLOOR - 5, 1, 1, center)
}

function drawFlowers(ctx: CanvasRenderingContext2D, palette: Palette) {
  drawFlower(ctx, 34, palette.grassDark, '#ffffff', '#ffd166')
  drawFlower(ctx, 132, palette.grassDark, '#ff8fa3', '#ffd166')
}

function drawProps(ctx: CanvasRenderingContext2D) {
  // Terracotta pot with a flowering sprout.
  const potX = 14
  rect(ctx, potX - 1, FLOOR - 7, 10, 2, '#c97b52')
  rect(ctx, potX, FLOOR - 5, 8, 5, '#b56a45')
  rect(ctx, potX + 1, FLOOR - 5, 6, 1, 'rgba(255, 255, 255, 0.18)')
  rect(ctx, potX + 4, FLOOR - 13, 1, 6, '#4f9a5f')
  rect(ctx, potX + 2, FLOOR - 12, 2, 1, '#7cc47c')
  rect(ctx, potX + 5, FLOOR - 14, 2, 1, '#7cc47c')
  rect(ctx, potX + 4, FLOOR - 16, 1, 1, '#ff8fa3')
  rect(ctx, potX + 3, FLOOR - 15, 1, 1, '#ff8fa3')
  rect(ctx, potX + 5, FLOOR - 15, 1, 1, '#ff8fa3')
  rect(ctx, potX + 4, FLOOR - 15, 1, 1, '#ffd166')

  // Toadstool on the right.
  const mushroomX = 146
  rect(ctx, mushroomX + 2, FLOOR - 4, 3, 4, '#ffe9c9')
  rect(ctx, mushroomX, FLOOR - 7, 7, 3, '#e05a5a')
  rect(ctx, mushroomX + 1, FLOOR - 8, 5, 1, '#e05a5a')
  rect(ctx, mushroomX + 1, FLOOR - 7, 1, 1, '#fff8e6')
  rect(ctx, mushroomX + 4, FLOOR - 8, 1, 1, '#fff8e6')
  rect(ctx, mushroomX + 5, FLOOR - 6, 1, 1, '#fff8e6')
}

function drawMess(ctx: CanvasRenderingContext2D, mess: number) {
  for (let index = 0; index < mess; index += 1) {
    const x = 104 + index * 12
    rect(ctx, x, FLOOR - 2, 6, 2, '#7a5230')
    rect(ctx, x + 1, FLOOR - 4, 4, 2, '#7a5230')
    rect(ctx, x + 2, FLOOR - 5, 1, 1, '#5d3d24')
  }
}

function drawGauge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  icon: readonly string[],
  value: number,
  color: string,
) {
  drawMatrix(ctx, x, y, icon, color, 2)
  for (let segment = 0; segment < 5; segment += 1) {
    const filled = value > segment * 20
    rect(
      ctx,
      x + 13 + segment * 5,
      y + 3,
      4,
      4,
      filled ? color : 'rgba(36, 50, 61, 0.14)',
    )
  }
}

function drawGauges(
  ctx: CanvasRenderingContext2D,
  pet: PetState,
  panelColor: string,
) {
  panel(ctx, 5, 5, 45, 62, panelColor)
  drawGauge(ctx, 8, 8, FORK, pet.food, FOOD_COLOR)
  drawGauge(ctx, 8, 31, HEART, pet.joy, JOY_COLOR)
  drawGauge(ctx, 8, 54, MOON, pet.rest, REST_COLOR)
}

function drawPet(ctx: CanvasRenderingContext2D, view: LcdView) {
  const { pet, fx, time, reducedMotion } = view
  const stage = pet.stage
  if (stage === 'telur') return

  const unit = UNIT[stage]
  const shape = SHAPE[stage]
  const colours = BODY_COLOR[stage]
  const width = shape.w * unit
  const height = shape.h * unit
  const sleeping = pet.asleep

  const playAge = fx?.kind === 'play' ? fx.age : null
  const hop =
    playAge !== null && !reducedMotion
      ? Math.abs(Math.sin(playAge / 100)) *
        Math.max(0, 1 - playAge / 1_400) *
        10
      : 0
  const bob =
    reducedMotion || sleeping ? 0 : Math.round(Math.sin(time / 560))
  const chew =
    fx?.kind === 'feed' && Math.floor(fx.age / 110) % 2 === 0 ? -1 : 0

  const x = Math.round(CENTER - width / 2)
  const y = Math.round(FLOOR - 2 - height + (sleeping ? 2 : 0) + bob - hop + chew)

  rect(ctx, CENTER - width * 0.65, FLOOR + 1, width * 1.3, 2, 'rgba(24, 52, 36, 0.22)')
  rect(ctx, CENTER - width * 0.3, FLOOR + 3, width * 0.6, 1, 'rgba(24, 52, 36, 0.16)')

  if (stage === 'remaja' || stage === 'dewasa') {
    rect(ctx, x + width - unit, y + height * 0.52, unit * 1.8, unit * 0.7, colours.dark)
    rect(ctx, x + width + unit * 0.5, y + height * 0.34, unit * 0.8, unit * 1.8, colours.main)
  }

  if (stage !== 'bayi') {
    const ear = (left: number) => {
      rect(ctx, left, y - unit * 0.6, unit * 2, unit * 0.8, colours.main)
      rect(ctx, left + unit * 0.3, y - unit * 1.2, unit * 1.4, unit * 0.8, colours.main)
      rect(ctx, left + unit * 0.6, y - unit * 1.8, unit * 0.8, unit * 0.8, colours.main)
      rect(ctx, left + unit * 0.7, y - unit * 0.5, unit * 0.6, unit * 0.7, colours.light)
    }
    ear(x + unit * 0.6)
    ear(x + width - unit * 2.6)
  }

  if (stage === 'dewasa') {
    const hairX = x + width / 2
    rect(ctx, hairX - unit * 0.9, y - unit * 1.2, unit * 0.5, unit * 1.2, TUFT)
    rect(ctx, hairX - unit * 0.2, y - unit * 1.9, unit * 0.5, unit * 1.9, TUFT)
    rect(ctx, hairX + unit * 0.5, y - unit * 1.3, unit * 0.5, unit * 1.3, TUFT)
  }

  const topInset = shape.w >= 8 ? 2 : 1
  for (let row = 0; row < shape.h; row += 1) {
    const inset =
      row === 0 || row === shape.h - 1
        ? topInset
        : row === 1 || row === shape.h - 2
          ? 1
          : 0
    const rowWidth = shape.w - inset * 2
    if (rowWidth <= 0) continue
    rect(ctx, x + inset * unit, y + row * unit, rowWidth * unit, unit, colours.main)
  }
  for (let row = 2; row < shape.h - 2; row += 1) {
    rect(
      ctx,
      x + 2 * unit,
      y + row * unit,
      (shape.w - 4) * unit,
      unit,
      colours.light,
    )
  }

  rect(ctx, x + unit * 0.8, y + height, unit * 2, 2, colours.dark)
  rect(ctx, x + width - unit * 2.8, y + height, unit * 2, 2, colours.dark)

  const mouthY = y + height * 0.68
  drawFace(ctx, view, {
    x,
    y,
    width,
    height,
    unit,
    mouthY,
  })
  drawSleepMarks(ctx, view, x, y, width)
}

interface FaceBox {
  x: number
  y: number
  width: number
  height: number
  unit: number
  mouthY: number
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  view: LcdView,
  box: FaceBox,
) {
  const { pet, mood, fx, time, reducedMotion } = view
  const { x, y, width, height, unit, mouthY } = box
  const sleeping = pet.asleep
  const eyeWidth = Math.max(3, unit * 1.5)
  const eyeHeight = Math.min(unit * 1.7, height * 0.25)
  const eyeY = y + height * 0.3
  const leftEye = x + width * 0.22
  const rightEye = x + width * 0.78 - eyeWidth
  const blink = !sleeping && !reducedMotion && time % 5_000 > 4_840

  if (sleeping || blink) {
    rect(ctx, leftEye, eyeY + eyeHeight * 0.5, eyeWidth * 1.2, 1, INK)
    rect(ctx, rightEye, eyeY + eyeHeight * 0.5, eyeWidth * 1.2, 1, INK)
  } else {
    const tall = mood === 'lesu' ? eyeHeight * 0.65 : eyeHeight
    rect(ctx, leftEye, eyeY, eyeWidth, tall, INK)
    rect(ctx, rightEye, eyeY, eyeWidth, tall, INK)
    rect(ctx, leftEye + eyeWidth * 0.2, eyeY + eyeHeight * 0.1, eyeWidth * 0.35, eyeHeight * 0.25, '#ffffff')
    rect(ctx, rightEye + eyeWidth * 0.2, eyeY + eyeHeight * 0.1, eyeWidth * 0.35, eyeHeight * 0.25, '#ffffff')
  }

  const mouthX = x + width / 2

  if (sleeping) {
    rect(ctx, mouthX - unit * 0.4, mouthY, unit * 0.8, 1, INK)
  } else if (fx?.kind === 'feed') {
    const open = Math.floor(fx.age / 110) % 2 === 0
    rect(ctx, mouthX - unit * 0.9, mouthY - unit * 0.2, unit * 1.8, open ? unit * 1.2 : unit * 0.5, INK)
    if (open) {
      rect(ctx, mouthX - unit * 0.45, mouthY + unit * 0.5, unit * 0.9, unit * 0.4, '#ff8a8a')
    }
  } else if (mood === 'lapar') {
    rect(ctx, mouthX - unit * 0.6, mouthY - unit * 0.3, unit * 1.2, unit * 1.3, INK)
  } else if (mood === 'sedih' || mood === 'lesu') {
    rect(ctx, mouthX - unit, mouthY + unit * 0.4, unit * 0.6, unit * 0.4, INK)
    rect(ctx, mouthX - unit * 0.3, mouthY, unit * 0.6, unit * 0.4, INK)
    rect(ctx, mouthX + unit * 0.4, mouthY + unit * 0.4, unit * 0.6, unit * 0.4, INK)
  } else if (mood === 'senang') {
    rect(ctx, mouthX - unit * 0.9, mouthY - unit * 0.1, unit * 1.8, unit * 0.8, INK)
    rect(ctx, mouthX - unit * 0.5, mouthY + unit * 0.7, unit, unit * 0.4, INK)
  } else {
    rect(ctx, mouthX - unit * 0.6, mouthY, unit * 1.2, Math.max(1, unit * 0.4), INK)
  }

  ctx.save()
  ctx.globalAlpha = mood === 'senang' ? 0.8 : 0.55
  const cheekY = eyeY + eyeHeight * 0.85
  rect(ctx, x + width * 0.06, cheekY, unit * 1.1, unit * 0.5, CHEEK)
  rect(
    ctx,
    x + width * 0.94 - unit * 1.1,
    cheekY,
    unit * 1.1,
    unit * 0.5,
    CHEEK,
  )
  ctx.restore()
}

function drawSleepMarks(
  ctx: CanvasRenderingContext2D,
  view: LcdView,
  x: number,
  y: number,
  width: number,
) {
  if (!view.pet.asleep) return
  for (let index = 0; index < 3; index += 1) {
    const drift = view.reducedMotion
      ? 0
      : Math.sin(view.time / 800 + index * 1.2) * 2
    drawMatrix(
      ctx,
      x + width + 3 + index * 8,
      y - 6 - index * 10 + drift,
      Z,
      '#ffe9a8',
      2,
    )
  }
}

function drawEgg(ctx: CanvasRenderingContext2D, view: LcdView) {
  const { pet, fx, time, reducedMotion } = view
  const tapAge = fx?.kind === 'tap' ? fx.age / FX_MS.tap : 0
  const wobble = reducedMotion
    ? 0
    : Math.sin(time / 240) * 0.02 + tapAge * 0.1
  const cx = CENTER
  const base = FLOOR

  rect(ctx, cx - 13, base + 1, 26, 2, 'rgba(24, 52, 36, 0.2)')

  ctx.save()
  ctx.translate(cx, base)
  ctx.rotate(wobble)
  ctx.translate(-cx, -base)

  const top = base - 7 - EGG_HALVES.length * 3
  EGG_HALVES.forEach((half, index) => {
    const rowY = top + index * 3
    rect(ctx, cx - half - 1, rowY, half * 2 + 2, 3, 'rgba(138, 100, 64, 0.85)')
    rect(
      ctx,
      cx - half,
      rowY,
      half * 2,
      3,
      index > EGG_HALVES.length - 4 ? '#ffe9c4' : '#fff8e6',
    )
  })

  rect(ctx, cx - 5, top + 6, 3, 2, '#ffffff')
  rect(ctx, cx - 4, top + 8, 2, 4, '#ffffff')
  rect(ctx, cx + 2, top + 13, 1, 1, '#ffb3c1')
  rect(ctx, cx - 1, top + 20, 1, 1, '#a9d8f5')
  rect(ctx, cx + 4, top + 25, 1, 1, '#ffd166')

  const stage = Math.min(pet.taps, 4)
  if (stage > 0) {
    const points: Array<[number, number]> = [
      [0, -38],
      [3, -33],
      [-2, -28],
      [4, -22],
      [-1, -17],
      [2, -11],
      [0, -6],
    ]
    const count = Math.min(points.length, 2 + stage)
    ctx.strokeStyle = '#8a6440'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx + points[0][0], base + points[0][1])
    for (let index = 1; index < count; index += 1) {
      ctx.lineTo(cx + points[index][0], base + points[index][1])
    }
    ctx.stroke()
  }

  if (pet.taps >= 4) {
    ctx.beginPath()
    ctx.moveTo(cx - 7, base - 20)
    ctx.lineTo(cx - 4, base - 14)
    ctx.lineTo(cx - 6, base - 9)
    ctx.stroke()
  }

  ctx.restore()

  if (pet.taps >= 2) {
    const glow = 0.35 + Math.abs(Math.sin(time / 520)) * 0.5
    ctx.save()
    ctx.globalAlpha = glow
    drawMatrix(ctx, cx - 22, base - 38, SPARKLE, '#ffd166')
    drawMatrix(ctx, cx + 16, base - 24, SPARKLE, '#ffd166')
    ctx.restore()
  }
}

function drawFx(ctx: CanvasRenderingContext2D, view: LcdView) {
  const fx = view.fx
  if (!fx || view.reducedMotion) return

  const progress = Math.min(1, fx.age / FX_MS[fx.kind])

  if (fx.kind === 'play') {
    ctx.save()
    ctx.globalAlpha = 0.65 * (1 - progress)
    for (let index = 0; index < 4; index += 1) {
      const spread = (index - 1.5) * 10
      const heartX = CENTER + spread + Math.sin(progress * 5 + index) * 3
      const heartY = FLOOR - 38 - progress * 26 - index * 2
      drawMatrix(ctx, heartX, heartY, HEART, '#ff6b8a', 2)
    }
    ctx.restore()
    return
  }

  if (fx.kind === 'feed') {
    ctx.save()
    ctx.globalAlpha = 0.85 * (1 - progress * 0.4)
    for (let index = 0; index < 5; index += 1) {
      const crumbX = CENTER + (index - 2) * 5
      const crumbY = FLOOR - 44 + progress * 24 + (index % 2) * 3
      rect(ctx, crumbX, crumbY, 1, 1, FOOD_COLOR)
    }
    const bowlX = CENTER - 27
    rect(ctx, bowlX, FLOOR - 6, 10, 3, '#c97b52')
    rect(ctx, bowlX + 1, FLOOR - 3, 8, 1, '#a9603d')
    rect(ctx, bowlX + 2, FLOOR - 5, 2, 1, '#ffd166')
    rect(ctx, bowlX + 5, FLOOR - 5, 2, 1, '#ffd166')
    ctx.restore()
    return
  }

  if (fx.kind === 'clean') {
    const spots: ReadonlyArray<[number, number]> = [
      [30, 44],
      [50, 28],
      [70, 62],
      [100, 30],
      [124, 46],
      [136, 66],
    ]
    ctx.save()
    ctx.globalAlpha = 0.75 * (1 - progress)
    spots.forEach(([spotX, spotY], index) => {
      drawMatrix(
        ctx,
        spotX + Math.sin(progress * 6 + index) * 2,
        spotY - progress * 16,
        SPARKLE,
        index % 2 === 0 ? '#ffd166' : '#7fe0e0',
        2,
      )
    })
    ctx.restore()
    return
  }

  if (fx.kind === 'hatch') {
    const cx = CENTER
    const cy = FLOOR - 18
    ctx.save()
    ctx.globalAlpha = 0.6 * (1 - progress)
    ctx.strokeStyle = '#ffd166'
    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * Math.PI * 2
      const inner = 12 + progress * 20
      const outer = inner + 7
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
      ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer)
      ctx.stroke()
    }
    ctx.restore()
    rect(ctx, cx - 32 - progress * 12, FLOOR - 7 + progress * 5, 4, 3, '#ffe9c4')
    rect(ctx, cx + 24 + progress * 14, FLOOR - 9 + progress * 6, 5, 3, '#ffe9c4')
    return
  }

  if (fx.kind === 'evolve') {
    rect(ctx, 0, 0, LCD_WIDTH, LCD_HEIGHT, `rgba(255, 255, 255, ${0.55 * (1 - progress)})`)
    const ringColors = ['#ff6b8a', '#ffd166', '#7fe0c4', '#8fc4ff']
    for (let ring = 0; ring < 2; ring += 1) {
      ctx.save()
      ctx.globalAlpha = 0.55 * (1 - progress)
      ctx.strokeStyle = ringColors[ring]
      ctx.beginPath()
      ctx.arc(CENTER, FLOOR - 24, 10 + progress * 40 + ring * 8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
    ctx.save()
    ctx.globalAlpha = 0.75 * (1 - progress)
    for (let index = 0; index < 5; index += 1) {
      const angle = (index / 5) * Math.PI * 2 + progress
      const radius = 26 + progress * 18
      drawMatrix(
        ctx,
        CENTER + Math.cos(angle) * radius - 2,
        FLOOR - 24 + Math.sin(angle) * radius - 2,
        SPARKLE,
        ringColors[index % ringColors.length],
      )
    }
    ctx.restore()
  }
}
