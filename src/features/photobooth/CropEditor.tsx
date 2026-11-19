import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { PHOTOBOOTH_COPY as COPY } from '../../content/photobooth'
import {
  clampCrop,
  clampCropValue,
  cropBoxSize,
  DEFAULT_CROP,
  drawCrop,
  type CropTransform,
} from './crop'
import type { Shot } from './usePhotobooth'

interface CropEditorProps {
  shot: Shot
  /** Width / height of the active layout's slot. */
  aspect: number
  slot: number
  /** Overrides the "Photo n" kicker, e.g. for the backdrop sheet. */
  kicker?: string
  /** Overrides the explanatory line under the title. */
  lead?: string
  onApply: (crop: CropTransform) => void
  onClose: () => void
}

interface DragState {
  pointerId: number
  startX: number
  startY: number
  crop: CropTransform
  maxX: number
  maxY: number
}

/**
 * A small crop sheet: the visible box has the exact aspect of the active slot,
 * and the drag/zoom controls write the transform used by `cropToCanvas()`.
 */
export default function CropEditor({
  shot,
  aspect,
  slot,
  kicker,
  lead,
  onApply,
  onClose,
}: CropEditorProps) {
  const [draft, setDraft] = useState<CropTransform>(() => ({
    ...shot.crop,
  }))
  const [dragging, setDragging] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const box = useMemo(() => cropBoxSize(aspect, 640), [aspect])

  useEffect(() => {
    setDraft({ ...shot.crop })
  }, [shot.id, shot.crop])

  useEffect(() => {
    closeRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (canvas.width !== box.width) canvas.width = box.width
    if (canvas.height !== box.height) canvas.height = box.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, box.width, box.height)
    drawCrop(ctx, shot.image, 0, 0, box.width, box.height, draft)
  }, [box, draft, shot.image])

  const pointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    const iw = shot.image.naturalWidth || shot.image.width
    const ih = shot.image.naturalHeight || shot.image.height
    const scale = Math.max(rect.width / iw, rect.height / ih) * draft.zoom
    canvas.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      crop: draft,
      maxX: Math.max(1, iw * scale - rect.width),
      maxY: Math.max(1, ih * scale - rect.height),
    }
    setDragging(true)
  }

  const pointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    setDraft({
      ...drag.crop,
      x: clampCropValue(
        drag.crop.x - (event.clientX - drag.startX) / drag.maxX,
      ),
      y: clampCropValue(
        drag.crop.y - (event.clientY - drag.startY) / drag.maxY,
      ),
    })
  }

  const endDrag = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const changeZoom = (value: number) => {
    setDraft((previous) => ({
      ...previous,
      zoom: Math.min(3, Math.max(1, value)),
    }))
  }

  const nudge = (dx: number, dy: number) => {
    setDraft((previous) => ({
      ...previous,
      x: clampCropValue(previous.x + dx),
      y: clampCropValue(previous.y + dy),
    }))
  }

  const wellStyle = { '--crop-aspect': aspect } as CSSProperties

  return (
    <div
      className="booth-crop-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="booth-crop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booth-crop-title"
      >
        <header className="booth-crop__head">
          <div>
            <p className="booth-crop__kicker">
              {kicker ?? `${COPY.slotLabel} ${slot + 1}`} · {COPY.cropFrame}
            </p>
            <h2 className="booth-crop__title" id="booth-crop-title">
              {COPY.cropTitle}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="booth-crop__close"
            onClick={onClose}
            aria-label={COPY.cropClose}
          >
            ✕
          </button>
        </header>

        <p className="booth-crop__lead">{lead ?? COPY.cropLead}</p>

        <div
          className={`booth-crop__well${dragging ? ' is-dragging' : ''}`}
          style={wellStyle}
        >
          <canvas
            ref={canvasRef}
            className="booth-crop__canvas"
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onLostPointerCapture={endDrag}
            aria-label={`${kicker ?? `Photo ${slot + 1}`}. Drag with the pointer to reposition.`}
          />
          <span className="booth-crop__grid" aria-hidden="true" />
          <span className="booth-crop__badge">{COPY.cropFrame}</span>
          <span className="booth-crop__hint">{COPY.cropHint}</span>
        </div>

        <div className="booth-crop__zoom">
          <span className="booth-crop__label">{COPY.cropZoom}</span>
          <button
            type="button"
            className="booth-crop__stepper"
            onClick={() => changeZoom(draft.zoom - 0.15)}
            aria-label="Zoom out"
          >
            −
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={draft.zoom}
            onChange={(event) => changeZoom(Number(event.target.value))}
            aria-label={COPY.cropZoom}
          />
          <button
            type="button"
            className="booth-crop__stepper"
            onClick={() => changeZoom(draft.zoom + 0.15)}
            aria-label="Zoom in"
          >
            +
          </button>
          <b className="booth-crop__value">{Math.round(draft.zoom * 100)}%</b>
        </div>

        <div className="booth-crop__nudge">
          <span className="booth-crop__label">{COPY.cropNudge}</span>
          <button
            type="button"
            className="booth-crop__arrow"
            onClick={() => nudge(-0.08, 0)}
            aria-label="Move photo left"
          >
            ←
          </button>
          <button
            type="button"
            className="booth-crop__arrow"
            onClick={() => nudge(0, -0.08)}
            aria-label="Move photo up"
          >
            ↑
          </button>
          <button
            type="button"
            className="booth-crop__arrow"
            onClick={() => nudge(0, 0.08)}
            aria-label="Move photo down"
          >
            ↓
          </button>
          <button
            type="button"
            className="booth-crop__arrow"
            onClick={() => nudge(0.08, 0)}
            aria-label="Move photo right"
          >
            →
          </button>
          <button
            type="button"
            className="booth-crop__reset"
            onClick={() => setDraft({ ...DEFAULT_CROP })}
          >
            {COPY.cropReset}
          </button>
        </div>

        <div className="booth-crop__actions">
          <button
            type="button"
            className="booth-button booth-button--ghost"
            onClick={onClose}
          >
            {COPY.cropCancel}
          </button>
          <button
            type="button"
            className="booth-button booth-button--primary"
            onClick={() => onApply(clampCrop(draft))}
          >
            {COPY.cropApply}
          </button>
        </div>
      </div>
    </div>
  )
}
