/**
 * Crop model shared by the booth UI and the strip renderer.
 *
 * A shot keeps its original decoded photo plus this small transform. The
 * renderer bakes the transform into a canvas with the exact aspect of the
 * active layout slot, so the painters keep drawing plain cover images and the
 * exported PNG cannot disagree with the crop preview.
 */
export interface CropTransform {
  /** 1 = fill the slot; up to 3 = punch in. */
  zoom: number
  /** -0.5 .. 0.5; 0 is centered, ±0.5 pins an edge. */
  x: number
  y: number
}

export const DEFAULT_CROP: CropTransform = { zoom: 1, x: 0, y: 0 }

export const clampCropValue = (value: number) =>
  Math.min(0.5, Math.max(-0.5, value))

export const clampCrop = (crop: CropTransform): CropTransform => ({
  zoom: Math.min(3, Math.max(1, crop.zoom)),
  x: clampCropValue(crop.x),
  y: clampCropValue(crop.y),
})

/** Pixel box for a crop at `maxEdge`, preserving the slot aspect. */
export function cropBoxSize(
  aspect: number,
  maxEdge: number,
): { width: number; height: number } {
  const safe = Number.isFinite(aspect) && aspect > 0 ? aspect : 1
  const width = safe >= 1 ? maxEdge : Math.round(maxEdge * safe)
  const height = safe >= 1 ? Math.round(maxEdge / safe) : maxEdge
  return { width: Math.max(1, width), height: Math.max(1, height) }
}

/**
 * Draws the image cover-cropped into a box with the shot's zoom and offset.
 * This is the same math for the editor preview and the baked slot image.
 */
export function drawCrop(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  crop: CropTransform,
): void {
  const iw = image.naturalWidth || image.width
  const ih = image.naturalHeight || image.height
  if (!iw || !ih) return

  const safe = clampCrop(crop)
  const scale = Math.max(width / iw, height / ih) * safe.zoom
  const drawWidth = iw * scale
  const drawHeight = ih * scale
  const slackX = Math.max(0, drawWidth - width)
  const slackY = Math.max(0, drawHeight - height)

  // Moving the pointer right should move the photo right; increasing the
  // offset pulls the image the other way (it reveals the left side).
  const left = x - slackX * (0.5 + safe.x)
  const top = y - slackY * (0.5 + safe.y)
  ctx.drawImage(image, left, top, drawWidth, drawHeight)
}

/** Bakes the visible crop into an off-DOM canvas for the strip renderer. */
export function cropToCanvas(
  image: HTMLImageElement,
  aspect: number,
  crop: CropTransform,
  maxEdge = 1440,
): HTMLCanvasElement {
  const { width, height } = cropBoxSize(aspect, maxEdge)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  drawCrop(ctx, image, 0, 0, width, height, crop)
  return canvas
}
