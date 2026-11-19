import { useEffect, useRef } from 'react'
import type {
  ExportBackgroundId,
  ExportFormatId,
  StripLayout,
} from '../../content/photobooth'
import type { PhotoBitmap } from './art'
import type { CropTransform } from './crop'
import { composeStrip } from './export'
import { useFontsReady } from './useFontsReady'

interface ExportCanvasProps {
  layout: StripLayout
  photos: readonly (PhotoBitmap | null)[]
  caption: string
  date: string
  format: ExportFormatId
  background: ExportBackgroundId
  /** Image for the custom backdrop; ignored by the painted options. */
  backdrop?: { image: HTMLImageElement; crop: CropTransform } | null
  /** Design multiplier; the ratio formats are 1080 px wide, so previews shrink. */
  scale?: number
  /** Repaint the strip at 30 fps while it is on screen. */
  animate?: boolean
  className?: string
  label: string
}

const PREVIEW_STRIP_SCALE = 1.25
const PREVIEW_FRAME_SCALE = 0.52
const PREVIEW_FPS = 24

/**
 * The whole export frame — backdrop, margin and strip — drawn by the same
 * function that builds the PNG and records the video. Nothing is mocked in
 * CSS, so the preview cannot promise a file the exporter will not deliver.
 */
export default function ExportCanvas({
  layout,
  photos,
  caption,
  date,
  format,
  background,
  backdrop,
  scale,
  animate = false,
  className,
  label,
}: ExportCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fontsReady = useFontsReady()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const paint = (time: number) => {
      composeStrip(canvas, layout, photos, {
        caption,
        date,
        format,
        background,
        backdrop: backdrop ?? undefined,
        scale: scale ?? (format === 'strip' ? PREVIEW_STRIP_SCALE : PREVIEW_FRAME_SCALE),
        time,
      })
    }

    paint(0)

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!animate || !layout.motion || reduceMotion) return undefined

    let frame = 0
    let last = 0
    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop)
      if (now - last < 1000 / PREVIEW_FPS) return
      last = now
      paint(now / 1000)
    }
    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [animate, backdrop, background, caption, date, fontsReady, format, layout, photos, scale])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={label}
    />
  )
}
