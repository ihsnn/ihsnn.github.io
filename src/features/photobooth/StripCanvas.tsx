import { useEffect, useRef } from 'react'
import type { StripLayout } from '../../content/photobooth'
import { todayISO, type PhotoBitmap } from './art'
import { renderStrip } from './render'
import { useFontsReady } from './useFontsReady'

interface StripCanvasProps {
  layout: StripLayout
  photos: readonly (PhotoBitmap | null)[]
  /** Design-space multiplier: 0.34 for picker cards, 1.5 for the preview. */
  scale?: number
  className?: string
  /** User-written text rendered inside the strip. */
  caption?: string
  /** Printed date, `yyyy-mm-dd`. */
  date?: string
  /** Screen-reader description; canvases have no accessible content of their own. */
  label: string
}

/**
 * One canvas that always renders the real strip design. Thumbnails and the
 * download preview therefore cannot drift apart: there is only one painter.
 */
export default function StripCanvas({
  layout,
  photos,
  scale = 1,
  className,
  caption = '',
  date = todayISO(),
  label,
}: StripCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fontsReady = useFontsReady()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    renderStrip(canvas, layout, photos, scale, caption, date)
  }, [caption, date, fontsReady, layout, photos, scale])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={label}
    />
  )
}
