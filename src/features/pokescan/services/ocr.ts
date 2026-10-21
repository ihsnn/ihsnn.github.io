import { createWorker, type Worker } from 'tesseract.js'

// Standard Pokémon TCG card is a 2.5:3.5 portrait rectangle. The species
// name sits in a consistent band near the top-left, to the left of the HP
// number — true across nearly every era of card printed. Cropping to just
// that band (instead of OCR-ing the whole card) cuts out attack text, rules
// text, and set symbols that would otherwise confuse the matcher.
const NAME_BAND = { xStart: 0.024, xEnd: 0.695, yStart: 0.024, yEnd: 0.094 }

export interface OcrResult {
  text: string
  /** Data URL of exactly what was fed to Tesseract — useful for debugging misreads. */
  debugImage: string
}

let workerPromise: Promise<Worker> | null = null
function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker('eng')
  }
  return workerPromise
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image.'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Crops the image to the card's name band and upscales it — Tesseract reads
 * large, high-contrast text far more reliably than small source text.
 */
async function cropNameBand(imageFile: File): Promise<string> {
  const img = await loadImage(imageFile)
  const { xStart, xEnd, yStart, yEnd } = NAME_BAND

  const sx = img.width * xStart
  const sy = img.height * yStart
  const sw = img.width * (xEnd - xStart)
  const sh = img.height * (yEnd - yStart)

  const SCALE = 20
  const canvas = document.createElement('canvas')
  canvas.width = sw * SCALE
  canvas.height = sh * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context.')

  // Grayscale + contrast boost — Tesseract does better on clean B/W text
  // than on the card's full-color art and gradient name plate.
  ctx.filter = 'grayscale(1) contrast(1.6) brightness(1.05)'
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/png')
}

/**
 * Reads the card's name band and returns the raw OCR text, plus the exact
 * cropped/processed image that was handed to Tesseract (so callers can show
 * it for debugging — e.g. to check the crop coordinates or contrast filter
 * are actually landing on the name, not the artwork).
 *
 * Falls back to OCR-ing the full image if the cropped band comes back empty
 * (covers non-standard layouts, oversized promo cards, oddly-cropped photos).
 * In that fallback case, debugImage still shows the (empty-reading) crop,
 * since that's what's most useful for figuring out why it failed.
 */
export async function readCardName(imageFile: File): Promise<OcrResult> {
  const worker = await getWorker()

  const croppedDataUrl = await cropNameBand(imageFile)
  const { data } = await worker.recognize(croppedDataUrl)
  console.log(data)
  let text = data.text.trim()

  if (!text) {
    const { data: fullData } = await worker.recognize(imageFile)
    text = fullData.text.trim()
  }

  return { text, debugImage: croppedDataUrl }
}