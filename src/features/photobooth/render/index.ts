import type { StripLayout } from '../../../content/photobooth'
import { todayISO, type Painter, type PhotoBitmap } from '../art'
import { ANALOG_PAINTERS } from './analog'
import { HOLO_PAINTERS } from './holo'
import { paintMotion } from './motion'
import { PRINT_PAINTERS } from './print'

/**
 * Canvas renderer for every photo strip.
 *
 * The painters are pure drawing functions in design-space units; this module
 * owns the canvas sizing and the single scale transform. `Record<LayoutStyle, …>`
 * makes the compiler complain if a new catalogue style has no painter.
 */
const PAINTERS: Record<StripLayout['style'], Painter> = {
  ...HOLO_PAINTERS,
  ...ANALOG_PAINTERS,
  ...PRINT_PAINTERS,
}

/** Download resolution: a 900 px-wide design exports at 1800 px. */
export const STRIP_EXPORT_SCALE = 2

/** Thumbnail canvases stay small; the picker renders every layout at once. */
export const STRIP_THUMB_SCALE = 0.34

/**
 * Draws one strip. `time` is seconds into the motion loop and is always 0 for
 * a still export; the motion pass runs after the painter so both versions
 * share the same artwork.
 */
export function renderStrip(
  canvas: HTMLCanvasElement,
  layout: StripLayout,
  photos: readonly (PhotoBitmap | null)[],
  scale = 1,
  caption = '',
  date = todayISO(),
  time = 0,
): void {
  const width = Math.max(1, Math.round(layout.width * scale))
  const height = Math.max(1, Math.round(layout.height * scale))

  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, width, height)
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.save()
  const scene = {
    ctx,
    w: layout.width,
    h: layout.height,
    photos,
    layout,
    caption: caption.trim(),
    date,
    time,
  }
  PAINTERS[layout.style](scene)
  ctx.restore()

  if (layout.motion) {
    ctx.save()
    paintMotion(scene)
    ctx.restore()
  }
}
