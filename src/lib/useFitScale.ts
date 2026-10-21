import { useLayoutEffect, useRef, useState } from 'react'

interface FitScaleOptions {
  /** Never scale past the design size (keeps the pixel art crisp). */
  max?: number
  /** Floor, so the console stays recognisable on tiny viewports. */
  min?: number
  /** Breathing room, in CSS pixels, kept around the scaled box. */
  padding?: number
}

/**
 * Fits a fixed-size design (the console chassis) into whatever space its
 * container has, preserving the artwork 1:1 — the chassis keeps its real
 * 660 × 1110 pixel geometry, it is only visually scaled.
 *
 * Returns a ref for the container to measure plus the current scale. `scale`
 * is 0 until the first measurement, which lets the caller hide the frame for
 * one frame instead of flashing it at the wrong size.
 */
export function useFitScale(
  designWidth: number,
  designHeight: number,
  { max = 1, min = 0.2, padding = 8 }: FitScaleOptions = {},
) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = (width: number, height: number) => {
      if (!width || !height) return
      const next = Math.min(
        (width - padding * 2) / designWidth,
        (height - padding * 2) / designHeight,
      )
      setScale(Math.min(max, Math.max(min, Math.round(next * 1000) / 1000)))
    }

    const rect = el.getBoundingClientRect()
    measure(rect.width, rect.height)

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      measure(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [designWidth, designHeight, max, min, padding])

  return { ref, scale }
}
