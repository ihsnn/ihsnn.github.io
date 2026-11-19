import type { StripLayout } from '../../content/photobooth'

/**
 * Canvas primitives for the photobooth strips.
 *
 * Everything is written in design-space units; the renderer applies one
 * transform so the same painter draws a 300 px thumbnail and a 1800 px export.
 * There are no external images or fonts here, only canvas paths and text, so
 * the exported PNG is self-contained.
 */

/** Photos arrive either decoded from a camera/file or pre-cropped canvas. */
export type PhotoBitmap = HTMLImageElement | HTMLCanvasElement

export interface Scene {
  ctx: CanvasRenderingContext2D
  w: number
  h: number
  photos: readonly (PhotoBitmap | null)[]
  layout: StripLayout
  /** User-written strip text. Empty string means "use the layout default". */
  caption: string
  /** Date chosen in the booth as `yyyy-mm-dd`; painters format it themselves. */
  date: string
  /** Seconds into the loop. Always 0 for a still PNG, so painters must look
   *  right at t=0 and only add motion on top of that. */
  time: number
}

export type Painter = (scene: Scene) => void

export const FONT = {
  display:
    'Impact, Haettenschweiler, "Arial Narrow Bold", "Arial Black", sans-serif',
  sans: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", Times, serif',
  mono: '"JetBrains Mono", "Courier New", ui-monospace, monospace',
  script: '"Segoe Script", "Bradley Hand", "Comic Sans MS", cursive',
  pixel: '"Press Start 2P", "Courier New", monospace',
  pixelSoft: '"Pixelify Sans", "Press Start 2P", "Courier New", monospace',
} as const

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

export type DateStyle =
  | 'long'
  | 'compact'
  | 'dotted'
  | 'slash'
  | 'numeric'
  | 'iso'

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const

export interface DateParts {
  day: string
  month: string
  /** One-letter month index, handy for numeric layouts. */
  monthNumber: string
  year: string
  short: string
}

/** Today in the device's own time zone, as `yyyy-mm-dd`. */
export function todayISO(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Parses the booth's date without letting a bad value throw in a painter. */
export function dateParts(iso: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return dateParts(todayISO())
  const [, year, month, day] = match
  const index = clamp(Number(month) - 1, 0, 11)
  return {
    day,
    month: MONTHS[index],
    monthNumber: month,
    year,
    short: year.slice(2),
  }
}

/** The date in the handful of styles the strips print. */
export function formatDate(iso: string, style: DateStyle = 'long'): string {
  const { day, month, monthNumber, year, short } = dateParts(iso)
  switch (style) {
    case 'compact':
      return `${month} ${day} '${short}`
    case 'dotted':
      return `${day} · ${monthNumber} · ${year}`
    case 'slash':
      return `${day}/${monthNumber}/${short}`
    case 'numeric':
      return `${monthNumber}.${day}.${year}`
    case 'iso':
      return `${year}-${monthNumber}-${day}`
    default:
      return `${day} ${month} ${year}`
  }
}

/** `#rrggbb` (or `#rgb`) to `rgba()`; other strings pass through untouched. */
export function alpha(color: string, amount: number): string {
  if (!color.startsWith('#')) return color
  const hex = color.slice(1)
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex
  if (full.length !== 6) return color
  const r = Number.parseInt(full.slice(0, 2), 16)
  const g = Number.parseInt(full.slice(2, 4), 16)
  const b = Number.parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${clamp(amount, 0, 1)})`
}

export function mix(a: string, b: string, t: number): string {
  const pa = parseHex(a)
  const pb = parseHex(b)
  if (!pa || !pb) return a
  const step = (x: number, y: number) => Math.round(x + (y - x) * clamp(t, 0, 1))
  return `rgb(${step(pa[0], pb[0])}, ${step(pa[1], pb[1])}, ${step(pa[2], pb[2])})`
}

function parseHex(color: string): [number, number, number] | null {
  if (!color.startsWith('#')) return null
  const hex = color.slice(1)
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex
  if (full.length !== 6) return null
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ]
}

/** Deterministic pseudo-random generator, so grain and sparkles are stable. */
export function seeded(seed: number): () => number {
  let state = (seed * 9301 + 49297) % 233280
  return () => {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

export interface Radius {
  tl: number
  tr: number
  br: number
  bl: number
}

const radiusOf = (value: number | Radius): Radius =>
  typeof value === 'number'
    ? { tl: value, tr: value, br: value, bl: value }
    : value

export function roundPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number | Radius = 0,
) {
  const r = radiusOf(radius)
  const max = Math.min(w, h) / 2
  const tl = clamp(r.tl, 0, max)
  const tr = clamp(r.tr, 0, max)
  const br = clamp(r.br, 0, max)
  const bl = clamp(r.bl, 0, max)
  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y)
  ctx.arcTo(x + w, y, x + w, y + tr, tr)
  ctx.lineTo(x + w, y + h - br)
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br)
  ctx.lineTo(x + bl, y + h)
  ctx.arcTo(x, y + h, x, y + h - bl, bl)
  ctx.lineTo(x, y + tl)
  ctx.arcTo(x, y, x + tl, y, tl)
  ctx.closePath()
}

export function fillRound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number | Radius,
  fill: string | CanvasGradient | CanvasPattern,
) {
  ctx.save()
  ctx.fillStyle = fill
  roundPath(ctx, x, y, w, h, radius)
  ctx.fill()
  ctx.restore()
}

export function strokeRound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number | Radius,
  stroke: string,
  lineWidth = 1,
) {
  ctx.save()
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  roundPath(ctx, x, y, w, h, radius)
  ctx.stroke()
  ctx.restore()
}

export function circlePath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(0.1, r), 0, Math.PI * 2)
}

/** Arch frame: a rectangle with a semicircular top. */
export function archPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const r = w / 2
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.arc(x + r, y + r, r, Math.PI, 0)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
}

/** Smooth random blob used by the sticker sheet. */
export function blobPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  seed: number,
  wobble = 0.12,
) {
  const random = seeded(seed)
  const points = 10
  const coords: Array<[number, number]> = []
  for (let i = 0; i < points; i += 1) {
    const angle = (i / points) * Math.PI * 2
    const local = radius * (1 - wobble / 2 + random() * wobble)
    coords.push([cx + Math.cos(angle) * local, cy + Math.sin(angle) * local])
  }
  ctx.beginPath()
  const start = coords[points - 1]
  const first = coords[0]
  ctx.moveTo((start[0] + first[0]) / 2, (start[1] + first[1]) / 2)
  for (let i = 0; i < points; i += 1) {
    const current = coords[i]
    const next = coords[(i + 1) % points]
    ctx.quadraticCurveTo(
      current[0],
      current[1],
      (current[0] + next[0]) / 2,
      (current[1] + next[1]) / 2,
    )
  }
  ctx.closePath()
}

export function linear(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: Array<[number, string]>,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
  for (const [offset, color] of stops) gradient.addColorStop(offset, color)
  return gradient
}

export function radial(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number,
  stops: Array<[number, string]>,
): CanvasGradient {
  const gradient = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1)
  for (const [offset, color] of stops) gradient.addColorStop(offset, color)
  return gradient
}

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

export interface TextOptions {
  size?: number
  weight?: number | string
  family?: string
  color?: string
  align?: 'left' | 'center' | 'right'
  baseline?: CanvasTextBaseline
  style?: 'normal' | 'italic'
  tracking?: number
  alpha?: number
  shadow?: { color: string; blur: number; x?: number; y?: number }
  maxWidth?: number
  lineWidth?: number
  stroke?: string
}

function fontString(options: TextOptions): string {
  const {
    size = 20,
    weight = 400,
    family = FONT.sans,
    style = 'normal',
  } = options
  return `${style} ${weight} ${size}px ${family}`
}

function measureTracked(
  ctx: CanvasRenderingContext2D,
  value: string,
  tracking: number,
): number {
  const chars = [...value]
  if (chars.length === 0) return 0
  const widths = chars.reduce(
    (sum, char) => sum + ctx.measureText(char).width,
    0,
  )
  return widths + tracking * (chars.length - 1)
}

function paintTracked(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  tracking: number,
  align: 'left' | 'center' | 'right',
  paint: (text: string, at: number) => void,
) {
  const chars = [...value]
  const total = measureTracked(ctx, value, tracking)
  const start =
    align === 'center' ? x - total / 2 : align === 'right' ? x - total : x
  let cursor = start
  for (const char of chars) {
    paint(char, cursor)
    cursor += ctx.measureText(char).width + tracking
  }
}

/**
 * Draws one line and returns its width. `maxWidth` shrinks the font (never
 * stretches it) so headlines fit inside narrow strips.
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  options: TextOptions = {},
): number {
  const { align = 'left', tracking = 0, alpha: opacity = 1 } = options
  const { size: startSize = 20, ...rest } = options
  let size = startSize

  ctx.save()
  ctx.globalAlpha = opacity
  ctx.font = fontString({ ...rest, size })
  if (options.maxWidth) {
    const natural = tracking
      ? measureTracked(ctx, value, tracking)
      : ctx.measureText(value).width
    if (natural > options.maxWidth && natural > 0) {
      size = Math.max(6, (startSize * options.maxWidth) / natural)
      ctx.font = fontString({ ...rest, size })
    }
  }

  ctx.fillStyle = options.color ?? '#ffffff'
  ctx.textBaseline = options.baseline ?? 'alphabetic'
  if (options.shadow) {
    ctx.shadowColor = options.shadow.color
    ctx.shadowBlur = options.shadow.blur
    ctx.shadowOffsetX = options.shadow.x ?? 0
    ctx.shadowOffsetY = options.shadow.y ?? 0
  }

  const paint = (text: string, at: number) => {
    if (options.stroke) {
      ctx.lineWidth = options.lineWidth ?? 2
      ctx.strokeStyle = options.stroke
      ctx.strokeText(text, at, y)
    }
    ctx.fillText(text, at, y)
  }

  let width = 0
  if (tracking) {
    ctx.textAlign = 'left'
    paintTracked(ctx, value, x, tracking, align, paint)
    width = measureTracked(ctx, value, tracking)
  } else {
    ctx.textAlign = align === 'right' ? 'right' : align === 'center' ? 'center' : 'left'
    if (options.stroke) {
      ctx.lineWidth = options.lineWidth ?? 2
      ctx.strokeStyle = options.stroke
      ctx.strokeText(value, x, y)
    }
    ctx.fillText(value, x, y)
    width = ctx.measureText(value).width
  }

  ctx.restore()
  return width
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
  options: TextOptions = {},
): string[] {
  const { size = 16, ...rest } = options
  ctx.save()
  ctx.font = fontString({ ...rest, size })
  const words = value.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  ctx.restore()
  return lines
}

export function drawParagraph(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  options: TextOptions = {},
  lineHeight?: number,
): number {
  const size = options.size ?? 16
  const lines = wrapText(ctx, value, maxWidth, options)
  const leading = lineHeight ?? size * 1.35
  lines.forEach((line, index) => {
    drawText(ctx, line, x, y + index * leading, options)
  })
  return lines.length * leading
}

/** Fake newsprint copy: thin rules with believable ragged right edges. */
export function textLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  rows: number,
  gap: number,
  color: string,
  seed: number,
  thickness = 2,
) {
  const random = seeded(seed)
  ctx.save()
  ctx.fillStyle = color
  for (let row = 0; row < rows; row += 1) {
    const tail = row === rows - 1 ? 0.4 + random() * 0.4 : 0.72 + random() * 0.28
    ctx.fillRect(x, y + row * gap, width * tail, thickness)
  }
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

export type PhotoTone = 'none' | 'bw' | 'sepia' | 'cool' | 'warm' | 'fade'

export interface PhotoOptions {
  radius?: number | Radius
  label?: string
  tone?: PhotoTone
  zoom?: number
  placeholderBg?: string
  placeholderInk?: string
  grain?: boolean
  seed?: number
}

const TONE_OVERLAYS: Record<
  Exclude<PhotoTone, 'none'>,
  Array<{ mode: GlobalCompositeOperation; color: string; alpha: number }>
> = {
  bw: [{ mode: 'saturation', color: '#808080', alpha: 1 }],
  sepia: [
    { mode: 'color', color: '#9a6b3f', alpha: 0.55 },
    { mode: 'multiply', color: '#f0d2a4', alpha: 0.12 },
  ],
  cool: [{ mode: 'color', color: '#4f7fbf', alpha: 0.28 }],
  warm: [{ mode: 'color', color: '#df8a4a', alpha: 0.24 }],
  fade: [
    { mode: 'screen', color: '#fff1d6', alpha: 0.18 },
    { mode: 'saturation', color: '#808080', alpha: 0.25 },
  ],
}

/**
 * Draws a photo (or a designed placeholder) into a rect, cover-cropped, with
 * an optional rounded clip. Painters own the frame, border and shadow.
 */
export function photo(
  ctx: CanvasRenderingContext2D,
  image: PhotoBitmap | null | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  options: PhotoOptions = {},
) {
  const {
    radius = 0,
    label = 'PHOTO',
    tone = 'none',
    zoom = 1,
    placeholderBg = '#1b1b23',
    placeholderInk = '#e8e2d4',
    grain = false,
    seed = 7,
  } = options

  ctx.save()
  roundPath(ctx, x, y, w, h, radius)
  ctx.clip()

  const sourceWidth = image
    ? image instanceof HTMLImageElement
      ? image.naturalWidth
      : image.width
    : 0
  if (image && sourceWidth > 0) {
    cover(ctx, image, x, y, w, h, zoom)
    if (tone !== 'none') {
      for (const overlay of TONE_OVERLAYS[tone]) {
        ctx.save()
        ctx.globalCompositeOperation = overlay.mode
        ctx.globalAlpha = overlay.alpha
        ctx.fillStyle = overlay.color
        ctx.fillRect(x, y, w, h)
        ctx.restore()
      }
    }
  } else {
    paintPlaceholder(ctx, x, y, w, h, label, placeholderBg, placeholderInk)
  }

  if (grain) {
    grainDots(ctx, x, y, w, h, seed, 'rgba(255, 255, 255, 0.08)', 0.5)
  }

  ctx.restore()
}

function cover(
  ctx: CanvasRenderingContext2D,
  image: PhotoBitmap,
  x: number,
  y: number,
  w: number,
  h: number,
  zoom: number,
) {
  const iw = image instanceof HTMLImageElement ? image.naturalWidth : image.width
  const ih = image instanceof HTMLImageElement ? image.naturalHeight : image.height
  if (!iw || !ih) return
  const scale = Math.max(w / iw, h / ih) * Math.max(1, zoom)
  const dw = iw * scale
  const dh = ih * scale
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

function paintPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  bg: string,
  ink: string,
) {
  const base = Math.min(w, h)
  ctx.fillStyle = linear(ctx, x, y, x + w, y + h, [
    [0, bg],
    [1, mix(bg, '#ffffff', 0.08)],
  ])
  ctx.fillRect(x, y, w, h)

  ctx.save()
  ctx.globalAlpha = 0.12
  ctx.strokeStyle = ink
  ctx.lineWidth = Math.max(1, base * 0.004)
  for (let i = -h; i < w; i += base * 0.12) {
    ctx.beginPath()
    ctx.moveTo(x + i, y + h)
    ctx.lineTo(x + i + h, y)
    ctx.stroke()
  }
  ctx.restore()

  const iconW = base * 0.26
  const iconH = iconW * 0.72
  const cx = x + w / 2
  const cy = y + h / 2 - base * 0.03
  ctx.save()
  ctx.strokeStyle = alpha(ink, 0.72)
  ctx.fillStyle = alpha(ink, 0.06)
  ctx.lineWidth = Math.max(1.5, base * 0.012)
  roundPath(ctx, cx - iconW / 2, cy - iconH / 2, iconW, iconH, iconW * 0.14)
  ctx.fill()
  ctx.stroke()
  circlePath(ctx, cx, cy, iconH * 0.24)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx - iconW * 0.34, cy - iconH * 0.32)
  ctx.lineTo(cx - iconW * 0.1, cy - iconH * 0.32)
  ctx.lineTo(cx - iconW * 0.02, cy - iconH * 0.44)
  ctx.lineTo(cx + iconW * 0.2, cy - iconH * 0.44)
  ctx.lineTo(cx + iconW * 0.26, cy - iconH * 0.32)
  ctx.stroke()
  ctx.restore()

  drawText(ctx, label.toUpperCase(), cx, cy + iconH * 0.82, {
    size: clamp(base * 0.052, 9, 30),
    family: FONT.mono,
    weight: 700,
    color: alpha(ink, 0.82),
    align: 'center',
    tracking: clamp(base * 0.006, 1, 6),
  })
}

/* ------------------------------------------------------------------ */
/* Patterns and finishing                                              */
/* ------------------------------------------------------------------ */

export function grainDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  color: string,
  density = 0.6,
) {
  const random = seeded(seed)
  const count = Math.round((w * h * density) / 900)
  ctx.save()
  ctx.fillStyle = color
  for (let i = 0; i < count; i += 1) {
    const size = 0.6 + random() * 1.6
    ctx.globalAlpha = 0.25 + random() * 0.55
    ctx.fillRect(x + random() * w, y + random() * h, size, size)
  }
  ctx.restore()
}

export function scanlines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  gap: number,
  color: string,
  thickness = 1,
) {
  ctx.save()
  ctx.fillStyle = color
  for (let line = y; line < y + h; line += gap) {
    ctx.fillRect(x, line, w, thickness)
  }
  ctx.restore()
}

export function halftone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  spacing: number,
  color: string,
  radiusRatio = 0.32,
) {
  ctx.save()
  ctx.fillStyle = color
  let row = 0
  for (let py = y; py < y + h; py += spacing) {
    const offset = row % 2 === 0 ? 0 : spacing / 2
    for (let px = x + offset; px < x + w; px += spacing) {
      circlePath(ctx, px, py, spacing * radiusRatio)
      ctx.fill()
    }
    row += 1
  }
  ctx.restore()
}

export function vignette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color = '#000000',
  strength = 0.65,
) {
  ctx.save()
  ctx.fillStyle = radial(
    ctx,
    x + w / 2,
    y + h / 2,
    Math.min(w, h) * 0.18,
    x + w / 2,
    y + h / 2,
    Math.max(w, h) * 0.74,
    [
      [0, alpha(color, 0)],
      [0.62, alpha(color, strength * 0.25)],
      [1, alpha(color, strength)],
    ],
  )
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

export function barcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  color: string,
  background?: string,
) {
  const random = seeded(seed)
  if (background) {
    ctx.save()
    ctx.fillStyle = background
    ctx.fillRect(x, y, w, h)
    ctx.restore()
  }
  ctx.save()
  ctx.fillStyle = color
  let cursor = x
  while (cursor < x + w) {
    const bar = Math.max(1, random() * w * 0.035)
    const gap = Math.max(1, random() * w * 0.03)
    ctx.fillRect(cursor, y, bar, h)
    cursor += bar + gap
  }
  ctx.restore()
}

export function sparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  opacity = 1,
) {
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y - size)
  ctx.quadraticCurveTo(x + size * 0.16, y - size * 0.16, x + size, y)
  ctx.quadraticCurveTo(x + size * 0.16, y + size * 0.16, x, y + size)
  ctx.quadraticCurveTo(x - size * 0.16, y + size * 0.16, x - size, y)
  ctx.quadraticCurveTo(x - size * 0.16, y - size * 0.16, x, y - size)
  ctx.fill()
  ctx.restore()
}

export function star(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outer: number,
  inner: number,
  points: number,
  color: string,
) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    const px = x + Math.cos(angle) * radius
    const py = y + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function sprocketHoles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  holeW: number,
  holeH: number,
  gap: number,
  color: string,
) {
  ctx.save()
  ctx.fillStyle = color
  for (let cursor = y; cursor < y + height; cursor += holeH + gap) {
    roundPath(ctx, x, cursor, holeW, holeH, holeW * 0.24)
    ctx.fill()
  }
  ctx.restore()
}

/** A translucent foil pass: rainbow bands, a white specular streak, sparkles. */
export function holo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    opacity?: number
    radius?: number | Radius
    seed?: number
    sparkles?: number
    angle?: 'diagonal' | 'vertical'
  } = {},
) {
  const {
    opacity = 0.5,
    radius = 0,
    seed = 11,
    sparkles = 10,
    angle = 'diagonal',
  } = options
  ctx.save()
  roundPath(ctx, x, y, w, h, radius)
  ctx.clip()

  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = opacity
  const gx = angle === 'vertical' ? x : x + w
  const gy = y + h
  const rainbow = ctx.createLinearGradient(x, y, gx, gy)
  const bands = [
    [0, 'rgba(255, 92, 184, 0.42)'],
    [0.16, 'rgba(255, 255, 255, 0.18)'],
    [0.28, 'rgba(103, 232, 249, 0.4)'],
    [0.42, 'rgba(255, 236, 145, 0.32)'],
    [0.55, 'rgba(167, 139, 250, 0.44)'],
    [0.7, 'rgba(255, 255, 255, 0.16)'],
    [0.84, 'rgba(94, 230, 200, 0.36)'],
    [1, 'rgba(255, 120, 200, 0.3)'],
  ] as const
  for (const [offset, color] of bands) rainbow.addColorStop(offset, color)
  ctx.fillStyle = rainbow
  ctx.fillRect(x, y, w, h)

  const streak = ctx.createLinearGradient(x, y + h, x + w, y)
  streak.addColorStop(0, 'rgba(255, 255, 255, 0)')
  streak.addColorStop(0.42, 'rgba(255, 255, 255, 0)')
  streak.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)')
  streak.addColorStop(0.58, 'rgba(255, 255, 255, 0)')
  streak.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = streak
  ctx.fillRect(x, y, w, h)

  const random = seeded(seed)
  for (let i = 0; i < sparkles; i += 1) {
    const sx = x + random() * w
    const sy = y + random() * h
    sparkle(
      ctx,
      sx,
      sy,
      (0.006 + random() * 0.012) * Math.min(w, h),
      random() > 0.4 ? '#ffffff' : '#ffe9a8',
      0.35 + random() * 0.45,
    )
  }
  ctx.restore()
}

/** Broad diagonal paper/plastic gloss. */
export function gloss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  options: { opacity?: number; radius?: number | Radius; angle?: number } = {},
) {
  const { opacity = 0.24, radius = 0, angle = -0.55 } = options
  ctx.save()
  roundPath(ctx, x, y, w, h, radius)
  ctx.clip()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = opacity
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(angle)
  const span = Math.hypot(w, h)
  const gradient = ctx.createLinearGradient(-span / 2, 0, span / 2, 0)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
  gradient.addColorStop(0.36, 'rgba(255, 255, 255, 0)')
  gradient.addColorStop(0.47, 'rgba(255, 255, 255, 0.75)')
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)')
  gradient.addColorStop(0.56, 'rgba(255, 255, 255, 0)')
  gradient.addColorStop(0.78, 'rgba(255, 255, 255, 0)')
  gradient.addColorStop(0.86, 'rgba(255, 255, 255, 0.45)')
  gradient.addColorStop(0.92, 'rgba(255, 255, 255, 0)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(-span / 2, -span / 2, span, span)
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/* Drawing motifs                                                      */
/* ------------------------------------------------------------------ */

export function arcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  options: TextOptions & { spread?: number } = {},
) {
  const chars = [...text]
  const spread = options.spread ?? 1
  const angleStep =
    (options.size ?? 16) / radius
  const total = angleStep * chars.length * spread
  let angle = startAngle - total / 2 + (angleStep * spread) / 2
  for (const char of chars) {
    ctx.save()
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
    ctx.rotate(angle + Math.PI / 2)
    drawText(ctx, char, 0, 0, { ...options, align: 'center', tracking: 0 })
    ctx.restore()
    angle += angleStep * spread
  }
}

export function rubberStamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  top: string,
  bottom: string,
  color: string,
  rotation = -0.12,
) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  ctx.globalAlpha = 0.82
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = Math.max(2, radius * 0.035)
  circlePath(ctx, 0, 0, radius)
  ctx.stroke()
  ctx.lineWidth = Math.max(1, radius * 0.014)
  circlePath(ctx, 0, 0, radius * 0.82)
  ctx.stroke()

  arcText(ctx, top, 0, 0, radius * 0.7, -Math.PI / 2, {
    size: radius * 0.15,
    weight: 700,
    family: FONT.mono,
    color,
    tracking: 0,
  })
  drawText(ctx, bottom, 0, radius * 0.46, {
    size: radius * 0.14,
    weight: 700,
    family: FONT.mono,
    color,
    align: 'center',
    tracking: radius * 0.012,
  })
  ctx.restore()
}

export function perforation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  gap: number,
  radius: number,
  color: string,
  vertical = true,
) {
  ctx.save()
  ctx.fillStyle = color
  if (vertical) {
    for (let cursor = y; cursor < y + length; cursor += gap) {
      circlePath(ctx, x, cursor, radius)
      ctx.fill()
    }
  } else {
    for (let cursor = x; cursor < x + length; cursor += gap) {
      circlePath(ctx, cursor, y, radius)
      ctx.fill()
    }
  }
  ctx.restore()
}

/** Pseudo palm silhouette for the GTA VI skyline. */
export function palm(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  height: number,
  flip: number,
  color: string,
) {
  ctx.save()
  ctx.translate(x, baseY)
  ctx.scale(flip, 1)
  ctx.fillStyle = color

  ctx.beginPath()
  ctx.moveTo(-height * 0.03, 0)
  ctx.bezierCurveTo(
    -height * 0.02,
    -height * 0.35,
    height * 0.04,
    -height * 0.7,
    height * 0.1,
    -height,
  )
  ctx.lineTo(height * 0.12, -height)
  ctx.bezierCurveTo(
    height * 0.08,
    -height * 0.66,
    height * 0.03,
    -height * 0.32,
    height * 0.04,
    0,
  )
  ctx.closePath()
  ctx.fill()

  const crownX = height * 0.11
  const crownY = -height
  const random = seeded(Math.round(height + flip * 13))
  for (let i = 0; i < 7; i += 1) {
    const angle = -Math.PI + (i / 6) * Math.PI
    const length = height * (0.3 + random() * 0.14)
    const tipX = crownX + Math.cos(angle) * length
    const tipY = crownY + Math.sin(angle) * length * 0.52 + length * 0.26
    const bendX = crownX + Math.cos(angle) * length * 0.55
    const bendY = crownY + Math.sin(angle) * length * 0.3 - length * 0.08
    ctx.beginPath()
    ctx.moveTo(crownX, crownY)
    ctx.quadraticCurveTo(bendX, bendY - length * 0.08, tipX, tipY)
    ctx.quadraticCurveTo(
      bendX,
      bendY + length * 0.14,
      crownX + Math.cos(angle) * length * 0.2,
      crownY + Math.sin(angle) * length * 0.14,
    )
    ctx.closePath()
    ctx.fill()
  }
  circlePath(ctx, crownX, crownY + height * 0.035, height * 0.022)
  ctx.fill()
  ctx.restore()
}
