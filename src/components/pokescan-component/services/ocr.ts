import { createWorker, type Worker } from 'tesseract.js'

// Standard Pokémon TCG card is a 2.5:3.5 portrait rectangle. The species
// name sits in a consistent band near the top-left, to the left of the HP
// number — true across nearly every era of card printed. Cropping to just
// that band (instead of OCR-ing the whole card) cuts out attack text, rules
// text, and set symbols that would otherwise confuse the matcher.
const NAME_BAND = { xStart: 0.05, xEnd: 0.72, yStart: 0.035, yEnd: 0.13 }

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

  const SCALE = 4
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
 * Reads the card's name band and returns the raw OCR text.
 * Falls back to OCR-ing the full image if the cropped band comes back empty
 * (covers non-standard layouts, oversized promo cards, oddly-cropped photos).
 */
export async function readCardName(imageFile: File): Promise<string> {
  const worker = await getWorker()

  const croppedDataUrl = await cropNameBand(imageFile)
  const { data } = await worker.recognize(croppedDataUrl)
  let text = data.text.trim()

  if (!text) {
    const { data: fullData } = await worker.recognize(imageFile)
    text = fullData.text.trim()
  }

  return text
}
