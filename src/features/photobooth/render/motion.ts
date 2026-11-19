import type { MotionKind, StripLayout } from '../../../content/photobooth'
import { alpha, clamp, seeded, type Scene } from '../art'

/**
 * Light that moves over a finished strip.
 *
 * Painters draw the design exactly as it appears on paper; motion is a second
 * pass so a still PNG and a video frame share every pixel underneath. Each
 * effect is written to look complete at t = 0 (the still) and to loop cleanly,
 * because the recorder simply paints frames until it has four seconds.
 */
export function paintMotion({ ctx, w, h, layout, time }: Scene): void {
  const kind = layout.motion
  if (!kind) return
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  ctx.clip()
  switch (kind) {
    case 'foil':
      foilSweep(ctx, w, h, time, layout)
      break
    case 'scan':
      scanRoll(ctx, w, h, time, layout)
      break
    case 'tape':
      tapeTracking(ctx, w, h, time)
      break
    case 'feed':
      paperFeed(ctx, w, h, time)
      break
    case 'pulse':
      neonPulse(ctx, w, h, time, layout)
      break
    case 'drift':
      lightDrift(ctx, w, h, time)
      break
  }
  ctx.restore()
}

const TAU = Math.PI * 2

/** Rainbow band travelling across the foil. */
function foilSweep(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  layout: StripLayout,
) {
  const travel = (time * 0.16) % 1
  const cx = -0.4 * w + travel * 1.8 * w
  const span = Math.max(w, h) * 0.55
  const gradient = ctx.createLinearGradient(cx - span / 2, 0, cx + span / 2, h)
  gradient.addColorStop(0, 'rgba(255, 92, 184, 0)')
  gradient.addColorStop(0.32, alpha(layout.theme.glow, 0.16))
  gradient.addColorStop(0.46, 'rgba(255, 255, 255, 0.24)')
  gradient.addColorStop(0.56, 'rgba(103, 232, 249, 0.2)')
  gradient.addColorStop(0.72, alpha(layout.theme.accent, 0.14))
  gradient.addColorStop(1, 'rgba(167, 139, 250, 0)')
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  // A few sparkles that breathe in place.
  const random = seeded(layout.width + 11)
  for (let index = 0; index < 14; index += 1) {
    const x = random() * w
    const y = random() * h
    const phase = (time * 0.7 + random()) % 1
    const size = (0.004 + random() * 0.006) * Math.min(w, h)
    ctx.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(phase * TAU))
    ctx.fillStyle = index % 3 === 0 ? '#ffffff' : '#ffe9a8'
    ctx.beginPath()
    ctx.moveTo(x, y - size)
    ctx.lineTo(x + size * 0.22, y)
    ctx.lineTo(x, y + size)
    ctx.lineTo(x - size * 0.22, y)
    ctx.closePath()
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/** CRT roll: a bright band, a slow flicker and a hint of scanline moiré. */
function scanRoll(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  layout: StripLayout,
) {
  const y = ((time * 0.28) % 1) * (h + h * 0.4) - h * 0.2
  const band = ctx.createLinearGradient(0, y, 0, y + h * 0.16)
  band.addColorStop(0, 'rgba(255, 255, 255, 0)')
  band.addColorStop(0.5, alpha(layout.theme.glow, 0.16))
  band.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = band
  ctx.fillRect(0, y, w, h * 0.16)

  const flicker = 0.02 + 0.02 * Math.sin(time * 11.3)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = `rgba(0, 0, 0, ${clamp(flicker, 0, 0.05)})`
  ctx.fillRect(0, 0, w, h)

  ctx.globalAlpha = 0.06
  ctx.fillStyle = '#ffffff'
  const gap = Math.max(4, Math.round(h / 220))
  const offset = (time * 22) % gap
  for (let line = -gap; line < h; line += gap) {
    ctx.fillRect(0, line + offset, w, 1)
  }
  ctx.globalAlpha = 1
}

/** VHS tracking: one unstable band dragging across the picture. */
function tapeTracking(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
) {
  const y = (0.12 + ((time * 0.09) % 1) * 0.72) * h
  const height = h * 0.05
  ctx.globalCompositeOperation = 'screen'
  const band = ctx.createLinearGradient(0, y - height, 0, y + height)
  band.addColorStop(0, 'rgba(255, 255, 255, 0)')
  band.addColorStop(0.45, 'rgba(255, 255, 255, 0.14)')
  band.addColorStop(0.55, 'rgba(255, 140, 190, 0.1)')
  band.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = band
  ctx.fillRect(0, y - height, w, height * 2)

  ctx.globalAlpha = 0.18
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  for (let index = 0; index < 3; index += 1) {
    const lineY = y - height + ((time * 37 + index * 4) % (height * 2))
    ctx.fillRect(0, lineY, w, 1.5)
  }
  ctx.globalAlpha = 1
}

/** Paper creeping out of the printer slot. */
function paperFeed(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
) {
  const y = h - ((time * 0.12) % 1) * h
  const glow = ctx.createLinearGradient(0, y - h * 0.22, 0, y)
  glow.addColorStop(0, 'rgba(255, 255, 255, 0)')
  glow.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)')
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = glow
  ctx.fillRect(0, y - h * 0.22, w, h * 0.22)

  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, y - 2, w, 2)
  ctx.globalAlpha = 1
}

/** Neon sign breathing. */
function neonPulse(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  layout: StripLayout,
) {
  const breathe = 0.5 + 0.5 * Math.sin(time * 1.4)
  const radius = Math.max(w, h) * 0.85
  const glow = ctx.createRadialGradient(
    w * 0.5,
    h * 0.42,
    0,
    w * 0.5,
    h * 0.42,
    radius,
  )
  glow.addColorStop(0, alpha(layout.theme.glow, 0.18 + breathe * 0.16))
  glow.addColorStop(0.45, alpha(layout.theme.accent, 0.06))
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
}

/** Gallery light drifting across the frame. */
function lightDrift(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
) {
  const x = w * (0.5 + 0.12 * Math.sin(time * 0.45))
  const y = h * (0.3 + 0.05 * Math.cos(time * 0.37))
  const radius = Math.max(w, h) * 0.75
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius)
  glow.addColorStop(0, 'rgba(255, 244, 220, 0.2)')
  glow.addColorStop(0.5, 'rgba(255, 240, 210, 0.06)')
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
}

export const MOTION_LABELS: Record<MotionKind, string> = {
  foil: 'Foil sweep',
  scan: 'Scan roll',
  tape: 'Tape tracking',
  feed: 'Paper feed',
  pulse: 'Neon pulse',
  drift: 'Light drift',
}
