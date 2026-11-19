import { useEffect, useState } from 'react'

/**
 * Canvas text is rasterised at draw time, so the strips have to be repainted
 * once the display fonts arrive. Loaded once per page and shared by every
 * thumbnail and the preview.
 */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fonts = document.fonts
    if (!fonts) {
      setReady(true)
      return
    }
    let alive = true
    void fonts.ready
      .then(() => {
        if (alive) setReady(true)
      })
      .catch(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [])

  return ready
}
