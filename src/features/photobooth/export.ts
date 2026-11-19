import {
  EXPORT_FORMATS,
  type ExportBackgroundId,
  type ExportFormatId,
  type StripLayout,
} from '../../content/photobooth'
import {
  drawText,
  FONT,
  grainDots,
  linear,
  radial,
  seeded,
  todayISO,
  type PhotoBitmap,
} from './art'
import { drawCrop, type CropTransform } from './crop'
import { renderStrip, STRIP_EXPORT_SCALE } from './render'

export { STRIP_EXPORT_SCALE }

/**
 * Everything about leaving the booth: the shape of the file, the backdrop
 * painted behind the strip, the composed PNG and the looping video.
 *
 * `renderStrip` still draws the strip itself; this module only decides how big
 * the final canvas is and what sits around it. Preview and download both call
 * `composeStrip`, so the frame you see is the frame you get.
 */

export interface ExportOptions {
  caption?: string
  date?: string
  format?: ExportFormatId
  background?: ExportBackgroundId
  /** User image for the `image` backdrop. */
  backdrop?: { image: HTMLImageElement; crop: CropTransform }
  /** Canvas pixels per design pixel for the strip itself. */
  scale?: number
  /** Seconds into the motion loop (0 for a still). */
  time?: number
}

export interface FramePlan {
  width: number
  height: number
  /** Top-left corner of the strip inside the composed frame. */
  x: number
  y: number
  stripWidth: number
  stripHeight: number
  margin: number
}

const even = (value: number) => Math.max(2, Math.round(value / 2) * 2)

function formatSize(format: ExportFormatId): { width: number; height: number } | null {
  const entry = EXPORT_FORMATS.find((item) => item.id === format)
  if (!entry || entry.width === null || entry.height === null) return null
  return { width: entry.width, height: entry.height }
}

/**
 * Where the strip sits on the final canvas. With the `strip` format and no
 * backdrop the answer is "everywhere" — that keeps the old exact-size export
 * for anyone who just wants the design.
 */
export function planFrame(
  layout: StripLayout,
  format: ExportFormatId = 'strip',
  background: ExportBackgroundId = 'none',
  scale = 1,
): FramePlan {
  const baseWidth = Math.max(1, layout.width * scale)
  const baseHeight = Math.max(1, layout.height * scale)

  if (format === 'strip') {
    if (background === 'none') {
      const width = even(baseWidth)
      const height = even(baseHeight)
      return {
        width,
        height,
        x: (width - width) / 2,
        y: 0,
        stripWidth: width,
        stripHeight: height,
        margin: 0,
      }
    }
    const margin = Math.max(24, Math.round(Math.min(baseWidth, baseHeight) * 0.07))
    const width = even(baseWidth + margin * 2)
    const height = even(baseHeight + margin * 2)
    return {
      width,
      height,
      x: (width - baseWidth) / 2,
      y: (height - baseHeight) / 2,
      stripWidth: baseWidth,
      stripHeight: baseHeight,
      margin,
    }
  }

  const size = formatSize(format) ?? { width: 1080, height: 1080 }
  const width = even(size.width * scale)
  const height = even(size.height * scale)
  const margin = Math.max(20, Math.round(Math.min(width, height) * 0.065))
  const fit = Math.min(
    (width - margin * 2) / layout.width,
    (height - margin * 2) / layout.height,
  )
  const stripWidth = layout.width * fit
  const stripHeight = layout.height * fit
  return {
    width,
    height,
    x: (width - stripWidth) / 2,
    y: (height - stripHeight) / 2,
    stripWidth,
    stripHeight,
    margin,
  }
}

/* ------------------------------------------------------------------ */
/* Backdrops                                                           */
/* ------------------------------------------------------------------ */

type BackgroundPainter = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => void

const paintStudio: BackgroundPainter = (ctx, w, h) => {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [
    [0, '#f8efdd'],
    [0.55, '#e7d3b4'],
    [1, '#b99a76'],
  ])
  ctx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = radial(ctx, w * 0.5, h * 0.16, 0, w * 0.5, h * 0.3, Math.max(w, h) * 0.7, [
    [0, 'rgba(255, 250, 235, 0.55)'],
    [1, 'rgba(255, 250, 235, 0)'],
  ])
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
  grainDots(ctx, 0, 0, w, h, 11, 'rgba(90, 70, 45, 0.12)', 0.5)
}

const paintPaper: BackgroundPainter = (ctx, w, h) => {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#faf5e9'],
    [0.5, '#f1e9d8'],
    [1, '#e2d6bf'],
  ])
  ctx.fillRect(0, 0, w, h)
  const random = seeded(23)
  ctx.strokeStyle = 'rgba(120, 100, 70, 0.07)'
  ctx.lineWidth = 1
  for (let index = 0; index < 42; index += 1) {
    const x = random() * w
    const y = random() * h
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 30 + random() * 80, y + (random() - 0.5) * 6)
    ctx.stroke()
  }
  grainDots(ctx, 0, 0, w, h, 29, 'rgba(90, 72, 42, 0.14)', 0.7)
}

const paintInk: BackgroundPainter = (ctx, w, h) => {
  ctx.fillStyle = radial(ctx, w * 0.5, h * 0.28, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.8, [
    [0, '#333b4d'],
    [0.55, '#151a24'],
    [1, '#080a0e'],
  ])
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 17, 'rgba(255, 255, 255, 0.1)', 0.45)
}

const paintSunset: BackgroundPainter = (ctx, w, h) => {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [
    [0, '#ffc07a'],
    [0.42, '#ff7a9c'],
    [0.78, '#9b5bd0'],
    [1, '#3c2a72'],
  ])
  ctx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = radial(ctx, w * 0.5, h * 0.22, 0, w * 0.5, h * 0.22, Math.min(w, h) * 0.36, [
    [0, 'rgba(255, 236, 190, 0.7)'],
    [1, 'rgba(255, 236, 190, 0)'],
  ])
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
  grainDots(ctx, 0, 0, w, h, 7, 'rgba(60, 20, 60, 0.16)', 0.4)
}

const paintMint: BackgroundPainter = (ctx, w, h) => {
  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, '#e6f7ed'],
    [0.6, '#c3e9d6'],
    [1, '#93cdb8'],
  ])
  ctx.fillRect(0, 0, w, h)
  const random = seeded(41)
  ctx.fillStyle = 'rgba(40, 110, 88, 0.12)'
  for (let index = 0; index < 60; index += 1) {
    const radius = 1 + random() * 3
    ctx.beginPath()
    ctx.arc(random() * w, random() * h, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

const paintGrid: BackgroundPainter = (ctx, w, h) => {
  ctx.fillStyle = '#f8fbff'
  ctx.fillRect(0, 0, w, h)
  const step = Math.max(18, Math.round(Math.min(w, h) / 44))
  ctx.strokeStyle = 'rgba(96, 142, 196, 0.28)'
  ctx.lineWidth = 1
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath()
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, h)
    ctx.stroke()
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(w, y + 0.5)
    ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(190, 80, 80, 0.45)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(w * 0.12, 0)
  ctx.lineTo(w * 0.12, h)
  ctx.stroke()
}

const paintConfetti: BackgroundPainter = (ctx, w, h) => {
  ctx.fillStyle = linear(ctx, 0, 0, 0, h, [
    [0, '#fdf6ec'],
    [1, '#f6ead6'],
  ])
  ctx.fillRect(0, 0, w, h)
  const random = seeded(59)
  const palette = ['#ff8fc7', '#67e8f9', '#ffd166', '#a78bfa', '#7ad151', '#ff7a5c']
  for (let index = 0; index < 54; index += 1) {
    const x = random() * w
    const y = random() * h
    const width = 6 + random() * 14
    const height = 3 + random() * 6
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(random() * Math.PI)
    ctx.globalAlpha = 0.55 + random() * 0.4
    ctx.fillStyle = palette[index % palette.length]
    ctx.fillRect(-width / 2, -height / 2, width, height)
    ctx.restore()
  }
}

const paintNoir: BackgroundPainter = (ctx, w, h) => {
  ctx.fillStyle = radial(ctx, w * 0.5, h * 0.36, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.78, [
    [0, '#4a4a4a'],
    [0.45, '#1d1d1d'],
    [1, '#040404'],
  ])
  ctx.fillRect(0, 0, w, h)
  grainDots(ctx, 0, 0, w, h, 31, 'rgba(255, 255, 255, 0.09)', 0.55)
}

const BACKGROUND_PAINTERS: Record<ExportBackgroundId, BackgroundPainter> = {
  none: () => undefined,
  studio: paintStudio,
  paper: paintPaper,
  ink: paintInk,
  sunset: paintSunset,
  mint: paintMint,
  grid: paintGrid,
  confetti: paintConfetti,
  noir: paintNoir,
  // The user image is painted by `paintFrame`; studio is the fallback when
  // "Your photo" is chosen before a picture exists.
  image: paintStudio,
}

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */

/** Paints the backdrop plus the strip into an already-sized canvas. */
function paintFrame(
  canvas: HTMLCanvasElement,
  layout: StripLayout,
  photos: readonly (PhotoBitmap | null)[],
  options: ExportOptions,
  plan: FramePlan,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, plan.width, plan.height)

  const background = options.background ?? 'none'
  if (background === 'image') {
    if (options.backdrop) {
      drawCrop(
        ctx,
        options.backdrop.image,
        0,
        0,
        plan.width,
        plan.height,
        options.backdrop.crop,
      )
      // Barely-there scrim: a busy photo should not swallow the strip.
      ctx.fillStyle = 'rgba(8, 6, 12, 0.16)'
      ctx.fillRect(0, 0, plan.width, plan.height)
    } else {
      paintStudio(ctx, plan.width, plan.height)
    }
  } else if (background !== 'none') {
    BACKGROUND_PAINTERS[background](ctx, plan.width, plan.height)
  }

  const strip = document.createElement('canvas')
  renderStrip(
    strip,
    layout,
    photos,
    plan.stripWidth / layout.width,
    options.caption ?? '',
    options.date ?? todayISO(),
    options.time ?? 0,
  )

  if (background !== 'none') {
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = Math.max(12, plan.margin * 0.75)
    ctx.shadowOffsetY = Math.max(6, plan.margin * 0.3)
    ctx.drawImage(strip, plan.x, plan.y, plan.stripWidth, plan.stripHeight)
    ctx.restore()
  } else {
    ctx.drawImage(strip, plan.x, plan.y, plan.stripWidth, plan.stripHeight)
  }

  if (plan.margin > 0 && background !== 'none') {
    drawText(ctx, 'PHOTO BOOTH · 06', plan.width / 2, plan.height - plan.margin * 0.34, {
      size: Math.max(9, Math.round(plan.margin * 0.22)),
      family: FONT.mono,
      color: 'rgba(255, 255, 255, 0.4)',
      align: 'center',
      tracking: Math.max(1, plan.margin * 0.02),
      shadow: { color: 'rgba(0, 0, 0, 0.35)', blur: 6 },
    })
  }
}

/**
 * Draws the final composition and returns its plan. The canvas is resized to
 * the plan, so callers can hand in any canvas element.
 */
export function composeStrip(
  canvas: HTMLCanvasElement,
  layout: StripLayout,
  photos: readonly (PhotoBitmap | null)[],
  options: ExportOptions = {},
): FramePlan {
  const format = options.format ?? 'strip'
  const background = options.background ?? 'none'
  const isNative = format === 'strip'
  const scale = options.scale ?? (isNative ? 1 : 1)
  const plan = planFrame(layout, format, background, scale)

  if (canvas.width !== plan.width) canvas.width = plan.width
  if (canvas.height !== plan.height) canvas.height = plan.height
  paintFrame(canvas, layout, photos, { ...options, format, background }, plan)
  return plan
}

/** PNG download at print resolution (2× the design). */
export function exportImage(
  layout: StripLayout,
  photos: readonly (PhotoBitmap | null)[],
  options: ExportOptions = {},
): Promise<Blob | null> {
  const format = options.format ?? 'strip'
  const scale = options.scale ?? (format === 'strip' ? STRIP_EXPORT_SCALE : 1)
  const canvas = document.createElement('canvas')
  composeStrip(canvas, layout, photos, { ...options, format, scale })
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

/* ------------------------------------------------------------------ */
/* Video                                                               */
/* ------------------------------------------------------------------ */

const VIDEO_MIME_CANDIDATES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4',
] as const

export const EXPORT_VIDEO_MS = 4200
const VIDEO_FPS = 30

function pickVideoMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  for (const mime of VIDEO_MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime
  }
  return null
}

export function canRecordVideo(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    'captureStream' in HTMLCanvasElement.prototype &&
    pickVideoMime() !== null
  )
}

/**
 * Records one loop of the composed frame. A transparent backdrop cannot be
 * encoded, so the video falls back to the paper backdrop instead of black.
 */
export async function exportVideo(
  layout: StripLayout,
  photos: readonly (PhotoBitmap | null)[],
  options: ExportOptions = {},
): Promise<Blob | null> {
  const mime = pickVideoMime()
  if (!mime || !canRecordVideo()) return null

  const format = options.format ?? 'strip'
  const background =
    options.background && options.background !== 'none' ? options.background : 'paper'
  const scale =
    format === 'strip'
      ? Math.min(2, 1080 / Math.max(layout.width, layout.height))
      : 1

  const canvas = document.createElement('canvas')
  const plan = composeStrip(canvas, layout, photos, {
    ...options,
    format,
    background,
    scale,
    time: 0,
  })
  if (!plan.width || !plan.height) return null

  const stream = canvas.captureStream(VIDEO_FPS)
  const recorder = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: 6_000_000,
  })
  const chunks: Blob[] = []

  const finished = new Promise<Blob | null>((resolve) => {
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop())
      resolve(chunks.length ? new Blob(chunks, { type: mime }) : null)
    }
    recorder.onerror = () => resolve(null)
  })

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) chunks.push(event.data)
  }

  const started = performance.now()
  const tick = () => {
    const elapsed = performance.now() - started
    if (elapsed >= EXPORT_VIDEO_MS) {
      if (recorder.state !== 'inactive') recorder.stop()
      return
    }
    composeStrip(canvas, layout, photos, {
      ...options,
      format,
      background,
      scale,
      time: elapsed / 1000,
    })
    // Prefer the display's own cadence; the recorder samples the canvas.
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(tick)
    } else {
      setTimeout(tick, 1000 / VIDEO_FPS)
    }
  }

  recorder.start(250)
  tick()
  return finished
}
