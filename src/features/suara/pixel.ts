import { useEffect, useState } from 'react'

/**
 * "Piksel" mode, derived from the real drawing.
 *
 * The card you see in pixel mode is not a second illustration: the same SVG is
 * rasterised down to a 64 × 64 grid, its colours are cut down to a dozen with a
 * median-cut palette, and the result is upscaled with nearest-neighbour — the
 * way a Game Boy Camera would have seen it. One drawing, two renderings, and
 * the two modes can never drift apart.
 *
 * Results are cached per source so the quiz (four pictures at once) only ever
 * rasterises each drawing once.
 */

const GRID = 64
const PALETTE_SIZE = 12

type Rgb = [number, number, number]

const cache = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`cannot load ${src}`))
    image.src = src
  })
}

function channelRanges(box: Rgb[]): [number, number, number] {
  let rMin = 255
  let rMax = 0
  let gMin = 255
  let gMax = 0
  let bMin = 255
  let bMax = 0
  for (const [r, g, b] of box) {
    if (r < rMin) rMin = r
    if (r > rMax) rMax = r
    if (g < gMin) gMin = g
    if (g > gMax) gMax = g
    if (b < bMin) bMin = b
    if (b > bMax) bMax = b
  }
  return [rMax - rMin, gMax - gMin, bMax - bMin]
}

function average(box: Rgb[]): Rgb {
  let r = 0
  let g = 0
  let b = 0
  for (const pixel of box) {
    r += pixel[0]
    g += pixel[1]
    b += pixel[2]
  }
  const n = Math.max(1, box.length)
  return [r / n, g / n, b / n]
}

/** Plain median cut: split the widest box at its median until we have enough. */
function medianCut(samples: Rgb[], max: number): Rgb[] {
  let boxes: Rgb[][] = [samples]
  while (boxes.length < max) {
    let bestIndex = -1
    let bestChannel = 0
    let bestScore = 0
    boxes.forEach((box, index) => {
      if (box.length < 2) return
      const ranges = channelRanges(box)
      const channel = ranges.indexOf(Math.max(...ranges))
      const score = ranges[channel] * Math.sqrt(box.length)
      if (score > bestScore) {
        bestScore = score
        bestIndex = index
        bestChannel = channel
      }
    })
    if (bestIndex < 0) break
    const box = boxes[bestIndex]
    box.sort((a, b) => a[bestChannel] - b[bestChannel])
    const middle = box.length >> 1
    boxes = [
      ...boxes.slice(0, bestIndex),
      box.slice(0, middle),
      box.slice(middle),
      ...boxes.slice(bestIndex + 1),
    ]
  }
  return boxes.filter((box) => box.length > 0).map(average)
}

function nearest(color: Rgb, palette: Rgb[]): Rgb {
  let best = palette[0]
  let bestDistance = Number.POSITIVE_INFINITY
  for (const entry of palette) {
    const dr = color[0] - entry[0]
    const dg = color[1] - entry[1]
    const db = color[2] - entry[2]
    const distance = dr * dr + dg * dg + db * db
    if (distance < bestDistance) {
      bestDistance = distance
      best = entry
    }
  }
  return best
}

async function rasterise(src: string): Promise<string> {
  const image = await loadImage(src)
  const work = document.createElement('canvas')
  work.width = GRID
  work.height = GRID
  const context = work.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('no 2d context')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, GRID, GRID)

  const source = context.getImageData(0, 0, GRID, GRID)
  const data = source.data
  const samples: Rgb[] = []
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    samples.push([data[i], data[i + 1], data[i + 2]])
  }
  if (samples.length === 0) return src

  const palette = medianCut(samples, PALETTE_SIZE)
  const lookup = new Map<number, Rgb>()
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) {
      data[i + 3] = 0
      continue
    }
    // bucket the colour before searching the palette: 4096 pixels, 12 entries
    const key = ((data[i] >> 2) << 12) | ((data[i + 1] >> 2) << 6) | (data[i + 2] >> 2)
    let mapped = lookup.get(key)
    if (!mapped) {
      mapped = nearest([data[i], data[i + 1], data[i + 2]], palette)
      lookup.set(key, mapped)
    }
    data[i] = mapped[0]
    data[i + 1] = mapped[1]
    data[i + 2] = mapped[2]
    data[i + 3] = 255
  }

  context.putImageData(source, 0, 0)
  return work.toDataURL('image/png')
}

function pixelate(src: string): Promise<string> {
  const cached = cache.get(src)
  if (cached) return Promise.resolve(cached)
  const running = inflight.get(src)
  if (running) return running

  const job = rasterise(src)
    .then((url) => {
      cache.set(src, url)
      inflight.delete(src)
      return url
    })
    .catch(() => {
      inflight.delete(src)
      return src
    })
  inflight.set(src, job)
  return job
}

/**
 * Returns the pixel-uplifted data URL for a drawing, or `null` while the first
 * rasterisation is still running. Falls back to the source if anything fails,
 * so the card is never blank.
 *
 * `enabled` lets a card sit in real mode without paying for the rasterisation;
 * `prefetchPixelArt()` warms the same cache in the background, so the toggle
 * lands on a ready data URL.
 */
export function usePixelArt(src: string, enabled = true): string | null {
  const [url, setUrl] = useState<string | null>(() => cache.get(src) ?? null)

  useEffect(() => {
    if (!enabled) return
    const ready = cache.get(src)
    if (ready) {
      setUrl(ready)
      return
    }
    setUrl(null)
    let alive = true
    void pixelate(src).then((result) => {
      if (alive) setUrl(result)
    })
    return () => {
      alive = false
    }
  }, [src, enabled])

  // Reading the cache during render keeps a toggle to Piksel flash-free once
  // the prefetch has finished; the effect above is the fallback.
  return cache.get(src) ?? url
}

/** The grid size, exported so the stylesheet can match the sprite scale. */
export const PIXEL_GRID = GRID

let queue: string[] = []
let pumping = false

function pump() {
  const next = queue.shift()
  if (!next) {
    pumping = false
    return
  }
  pumping = true
  void pixelate(next).finally(() => {
    window.setTimeout(pump, 30)
  })
}

/**
 * Warms the cache one drawing at a time after the page has settled, so the
 * Piksel toggle is instant and the first paint never competes with twenty
 * rasterisations.
 */
export function prefetchPixelArt(sources: readonly string[]) {
  queue = sources.filter((src) => !cache.has(src) && !inflight.has(src))
  if (!pumping) pump()
}
