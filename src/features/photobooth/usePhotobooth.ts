import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import {
  CAPTION_MAX_LENGTH,
  cropAspectFor,
  DEFAULT_LAYOUT_ID,
  getStripLayout,
  LEGACY_LAYOUT_IDS,
  PHOTOBOOTH_COPY,
  STRIP_LAYOUTS,
  type ExportBackgroundId,
  type ExportFormatId,
  type StripLayout,
} from '../../content/photobooth'
import { todayISO } from './art'
import { cropToCanvas, DEFAULT_CROP, type CropTransform } from './crop'
import { canRecordVideo, exportImage, exportVideo, STRIP_EXPORT_SCALE } from './export'
import { BoothSound, BOOTH_MUTED_KEY } from './sound'

export type CameraState = 'idle' | 'starting' | 'live' | 'error'
export type CameraError = 'denied' | 'missing' | 'insecure' | 'broken' | null
export type VideoState = 'idle' | 'recording' | 'done' | 'error' | 'unsupported'

export interface Shot {
  id: number
  /** Data URL, safe to draw into an exporting canvas (no taint, no server). */
  url: string
  /** Decoded eagerly so the renderer never waits on an image. */
  image: HTMLImageElement
  /** Pan/zoom chosen in the crop editor; baked before painting. */
  crop: CropTransform
}

const MAX_PHOTO_EDGE = 1600
const COUNTDOWN_STEP_MS = 620
const FLASH_MS = 460

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(BOOTH_MUTED_KEY) === '1'
  } catch {
    return false
  }
}

function writeMuted(muted: boolean) {
  try {
    window.localStorage.setItem(BOOTH_MUTED_KEY, muted ? '1' : '0')
  } catch {
    /* private mode: the booth still works, it just forgets */
  }
}

/** `?strip=gta-v` and `#gta-v` both preselect a layout. */
function readInitialLayoutId(): string {
  try {
    const params = new URLSearchParams(window.location.search)
    const candidate = params.get('strip') ?? window.location.hash.replace(/^#/, '')
    if (!candidate) return DEFAULT_LAYOUT_ID
    if (
      STRIP_LAYOUTS.some((layout) => layout.id === candidate) ||
      candidate in LEGACY_LAYOUT_IDS
    ) {
      return getStripLayout(candidate).id
    }
  } catch {
    /* malformed URL: fall through to the default */
  }
  return DEFAULT_LAYOUT_ID
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image-decode-failed'))
    image.src = src
  })
}

let shotCounter = 0

async function makeShot(src: string): Promise<Shot> {
  const image = await loadImage(src)
  shotCounter += 1
  return { id: shotCounter, url: src, image, crop: { ...DEFAULT_CROP } }
}

/** Reads a local file, downscales it, and keeps everything as a data URL. */
async function shotFromFile(file: File): Promise<Shot> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const source = await loadImage(objectUrl)
    const scale = Math.min(
      1,
      MAX_PHOTO_EDGE / Math.max(source.naturalWidth, source.naturalHeight),
    )
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(source.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(source.naturalHeight * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas-unavailable')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
    const url = canvas.toDataURL('image/jpeg', 0.92)
    return await makeShot(url)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function classifyCameraError(error: unknown): CameraError {
  if (!window.isSecureContext) return 'insecure'
  const name = error instanceof DOMException ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'missing'
  return 'broken'
}

const pad = (value: number) => String(value).padStart(2, '0')

function fileStamp(): string {
  const now = new Date()
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(
    now.getHours(),
  )}${pad(now.getMinutes())}`
}

function downloadName(layout: StripLayout, format: ExportFormatId, extension: string) {
  return `${PHOTOBOOTH_COPY.downloadPrefix}-${layout.id}-${format}-${fileStamp()}.${extension}`
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 5000)
}

/**
 * Owns everything the photobooth page needs: the selected strip, the camera
 * stream, the 3–2–1 capture, local file fallback, sounds, the editable date,
 * the export shape and backdrop, and the PNG / video download.
 * No network calls and no persistence of photos — only the mute flag is saved.
 */
export function usePhotobooth() {
  const [layoutId, setLayoutId] = useState(readInitialLayoutId)
  const [shots, setShots] = useState<Array<Shot | undefined>>([])
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [cameraError, setCameraError] = useState<CameraError>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [readingFile, setReadingFile] = useState(false)
  const [fileError, setFileError] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [downloadError, setDownloadError] = useState(false)
  const [videoState, setVideoState] = useState<VideoState>('idle')
  const [celebrate, setCelebrate] = useState(false)
  const [caption, setCaptionState] = useState('')
  const [date, setDateState] = useState(todayISO)
  const [format, setFormatState] = useState<ExportFormatId>('strip')
  const [background, setBackgroundState] = useState<ExportBackgroundId>('none')
  const [backdrop, setBackdrop] = useState<Shot | null>(null)
  const [backdropError, setBackdropError] = useState(false)
  const [backdropReading, setBackdropReading] = useState(false)
  const [muted, setMuted] = useState(readMuted)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backdropInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const soundRef = useRef<BoothSound | null>(null)
  const mutedRef = useRef(muted)
  const mountedRef = useRef(true)
  const busyRef = useRef(false)
  const fileSlotRef = useRef(0)
  const timersRef = useRef<number[]>([])
  const layoutIdRef = useRef(layoutId)

  const layout = useMemo(() => getStripLayout(layoutId), [layoutId])

  const images = useMemo(
    () =>
      Array.from({ length: layout.slots }, (_, index) => {
        const shot = shots[index]
        if (!shot) return null
        return cropToCanvas(
          shot.image,
          cropAspectFor(layout, index),
          shot.crop,
        )
      }),
    [layout, shots],
  )

  const nextSlot = useMemo(() => {
    for (let index = 0; index < layout.slots; index += 1) {
      if (!shots[index]) return index
    }
    return -1
  }, [layout.slots, shots])

  const isComplete = nextSlot === -1
  const photoCount = shots.filter(Boolean).length
  const canShoot =
    cameraState === 'live' && !capturing && !isComplete && !readingFile
  const canExport = isComplete && !capturing && !readingFile
  const videoSupported = canRecordVideo()

  const later = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      if (mountedRef.current) callback()
    }, delay)
    timersRef.current.push(timer)
    return timer
  }, [])

  useEffect(() => {
    mountedRef.current = true
    soundRef.current = new BoothSound(mutedRef.current)

    return () => {
      mountedRef.current = false
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      soundRef.current?.dispose()
      soundRef.current = null
    }
  }, [])

  useEffect(() => {
    setDownloaded(false)
    setDownloadError(false)
    setVideoState('idle')
  }, [shots, date, format, background, backdrop])

  useEffect(() => {
    setDownloaded(false)
    setVideoState('idle')
  }, [backdrop])

  useEffect(() => {
    setDownloaded(false)
    setCelebrate(false)
    setVideoState('idle')
  }, [layoutId])

  const selectLayout = useCallback(
    (id: string) => {
      if (id === layoutId) return
      const next = getStripLayout(id)
      layoutIdRef.current = next.id
      setLayoutId(next.id)
      setShots((previous) =>
        Array.from({ length: next.slots }, (_, index) => previous[index]),
      )
      setFileError(false)
      soundRef.current?.playLayout(next.sound, 'select')
    },
    [layoutId],
  )

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      setCameraState('live')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(window.isSecureContext ? 'missing' : 'insecure')
      setCameraState('error')
      return
    }

    setCameraError(null)
    setCameraState('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      })
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        video.muted = true
        video.playsInline = true
        await video.play().catch(() => undefined)
      }
      if (mountedRef.current) setCameraState('live')
    } catch (error) {
      if (!mountedRef.current) return
      setCameraError(classifyCameraError(error))
      setCameraState('error')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    const video = videoRef.current
    if (video) video.srcObject = null
    setCameraState('idle')
  }, [])

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current
    if (!video || video.readyState < 2 || !video.videoWidth) return null
    const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    // Mirror to match the selfie preview; the renderer crops it later.
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  const finishStrip = useCallback(
    (nextShots: Array<Shot | undefined>) => {
      const complete = Array.from({ length: layout.slots }).every((_, index) =>
        Boolean(nextShots[index]),
      )
      if (!complete) return
      setCelebrate(true)
      soundRef.current?.playLayout(layout.sound, 'done')
      later(() => setCelebrate(false), 2800)
    },
    [later, layout],
  )

  const shoot = useCallback(
    async (slot?: number) => {
      if (busyRef.current || cameraState !== 'live') return
      const target = slot ?? nextSlot
      if (target < 0 || target >= layout.slots) return

      busyRef.current = true
      setCapturing(true)
      setFileError(false)
      const activeLayoutId = layout.id
      try {
        for (let step = 3; step >= 1; step -= 1) {
          if (!mountedRef.current) return
          setCountdown(step)
          soundRef.current?.playTick(step)
          await new Promise<void>((resolve) => {
            const timer = window.setTimeout(resolve, COUNTDOWN_STEP_MS)
            timersRef.current.push(timer)
          })
        }
        if (!mountedRef.current || layoutIdRef.current !== activeLayoutId) {
          setCountdown(null)
          return
        }

        setCountdown(0)
        const dataUrl = captureFrame()
        soundRef.current?.playShutter()
        setFlash(true)

        if (!dataUrl) {
          setCameraError('broken')
          setCameraState('error')
          setFlash(false)
          setCountdown(null)
          return
        }

        const shot = await makeShot(dataUrl)
        if (!mountedRef.current || layoutIdRef.current !== activeLayoutId) {
          setFlash(false)
          setCountdown(null)
          return
        }
        const nextShots = Array.from(
          { length: layout.slots },
          (_, index) => (index === target ? shot : shots[index]),
        )
        setShots(nextShots)
        soundRef.current?.playFlash()
        finishStrip(nextShots)

        await new Promise<void>((resolve) => {
          const timer = window.setTimeout(resolve, FLASH_MS)
          timersRef.current.push(timer)
        })
        if (!mountedRef.current) return
        setFlash(false)
        setCountdown(null)
      } finally {
        busyRef.current = false
        if (mountedRef.current) setCapturing(false)
      }
    },
    [
      cameraState,
      captureFrame,
      finishStrip,
      layout.id,
      layout.slots,
      nextSlot,
      shots,
    ],
  )

  const retake = useCallback(
    (slot: number) => {
      setShots((previous) => {
        const next = Array.from({ length: layout.slots }, (_, index) => previous[index])
        next[slot] = undefined
        return next
      })
      setCelebrate(false)
      setDownloaded(false)
      soundRef.current?.playUi()
    },
    [layout.slots],
  )

  const clearShots = useCallback(() => {
    setShots([])
    setCelebrate(false)
    setDownloaded(false)
    setFileError(false)
    soundRef.current?.playUi()
  }, [])

  const applyCrop = useCallback((slot: number, crop: CropTransform) => {
    setShots((previous) =>
      previous.map((shot, index) =>
        index === slot && shot ? { ...shot, crop: { ...crop } } : shot,
      ),
    )
    setDownloaded(false)
    setDownloadError(false)
    soundRef.current?.playUi()
  }, [])

  const setCaption = useCallback((value: string) => {
    setCaptionState(value.slice(0, CAPTION_MAX_LENGTH))
    setDownloaded(false)
    setDownloadError(false)
  }, [])

  const setDate = useCallback((value: string) => {
    setDateState(value || todayISO())
    setDownloaded(false)
    setVideoState('idle')
  }, [])

  const setFormat = useCallback((value: ExportFormatId) => {
    setFormatState(value)
    setDownloaded(false)
    setVideoState('idle')
    soundRef.current?.playUi()
  }, [])

  const setBackground = useCallback((value: ExportBackgroundId) => {
    setBackgroundState(value)
    setDownloaded(false)
    setVideoState('idle')
    soundRef.current?.playUi()
  }, [])

  const openFilePicker = useCallback(
    (slot?: number) => {
      const target = slot ?? nextSlot
      if (target < 0) return
      fileSlotRef.current = target
      fileInputRef.current?.click()
    },
    [nextSlot],
  )

  const onFilePicked = useCallback(
    async (
      event: ChangeEvent<HTMLInputElement>,
      onPicked?: (slot: number) => void,
    ) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return
      const target = fileSlotRef.current
      if (target < 0 || target >= layout.slots) return

      setReadingFile(true)
      setFileError(false)
      const activeLayoutId = layout.id
      try {
        const shot = await shotFromFile(file)
        if (!mountedRef.current || layoutIdRef.current !== activeLayoutId) return
        const nextShots = Array.from(
          { length: layout.slots },
          (_, index) => (index === target ? shot : shots[index]),
        )
        setShots(nextShots)
        soundRef.current?.playFlash()
        finishStrip(nextShots)
        // A local pick is a deliberate edit moment: open the crop sheet so
        // "choose photo" is immediately followed by "position it".
        onPicked?.(target)
      } catch {
        if (mountedRef.current) setFileError(true)
      } finally {
        if (mountedRef.current) setReadingFile(false)
      }
    },
    [finishStrip, layout.id, layout.slots, shots],
  )

  const chooseBackdrop = useCallback(() => {
    backdropInputRef.current?.click()
  }, [])

  const onBackdropPicked = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBackdropReading(true)
    setBackdropError(false)
    try {
      const shot = await shotFromFile(file)
      if (!mountedRef.current) return
      setBackdrop(shot)
      setBackgroundState('image')
      soundRef.current?.playFlash()
    } catch {
      if (mountedRef.current) setBackdropError(true)
    } finally {
      if (mountedRef.current) setBackdropReading(false)
    }
  }, [])

  /** Uses the live camera frame as a backdrop — no countdown, no flash. */
  const captureBackdrop = useCallback(() => {
    if (cameraState !== 'live') return
    const dataUrl = captureFrame()
    if (!dataUrl) {
      setBackdropError(true)
      return
    }
    soundRef.current?.playShutter()
    setBackdropError(false)
    void makeShot(dataUrl).then((shot) => {
      if (!mountedRef.current) return
      setBackdrop(shot)
      setBackgroundState('image')
    })
  }, [cameraState, captureFrame])

  const applyBackdropCrop = useCallback((crop: CropTransform) => {
    setBackdrop((previous) =>
      previous ? { ...previous, crop: { ...crop } } : previous,
    )
    soundRef.current?.playUi()
  }, [])

  const removeBackdrop = useCallback(() => {
    setBackdrop(null)
    setBackdropError(false)
    setBackgroundState((previous) => (previous === 'image' ? 'none' : previous))
    soundRef.current?.playUi()
  }, [])

  const download = useCallback(async () => {
    if (!isComplete || downloading) return
    setDownloading(true)
    setDownloadError(false)
    try {
      const blob = await exportImage(layout, images, {
        caption,
        date,
        format,
        background,
        backdrop: backdrop
          ? { image: backdrop.image, crop: backdrop.crop }
          : undefined,
        scale: format === 'strip' ? STRIP_EXPORT_SCALE : 1,
      })
      if (!blob) throw new Error('blob-failed')
      saveBlob(blob, downloadName(layout, format, 'png'))
      setDownloaded(true)
      soundRef.current?.playDownload(layout.sound)
    } catch {
      if (mountedRef.current) setDownloadError(true)
    } finally {
      if (mountedRef.current) setDownloading(false)
    }
  }, [backdrop, background, caption, date, downloading, format, images, isComplete, layout])

  const saveVideo = useCallback(async () => {
    if (!isComplete || videoState === 'recording') return
    if (!layout.motion) {
      setVideoState('idle')
      return
    }
    if (!videoSupported) {
      setVideoState('unsupported')
      return
    }
    setVideoState('recording')
    try {
      const blob = await exportVideo(layout, images, {
        caption,
        date,
        format,
        background,
        backdrop: backdrop
          ? { image: backdrop.image, crop: backdrop.crop }
          : undefined,
      })
      if (!blob) throw new Error('video-failed')
      saveBlob(blob, downloadName(layout, format, blob.type.includes('mp4') ? 'mp4' : 'webm'))
      setVideoState('done')
      soundRef.current?.playDownload(layout.sound)
    } catch {
      if (mountedRef.current) setVideoState('error')
    }
  }, [backdrop, background, caption, date, format, images, isComplete, layout, videoState, videoSupported])

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next
    setMuted(next)
    writeMuted(next)
    soundRef.current?.setMuted(next)
  }, [])

  return {
    layout,
    layoutId,
    selectLayout,
    shots,
    images,
    photoCount,
    nextSlot,
    isComplete,
    canShoot,
    canExport,
    cameraState,
    cameraError,
    countdown,
    flash,
    capturing,
    readingFile,
    fileError,
    downloading,
    downloaded,
    downloadError,
    videoState,
    videoSupported,
    celebrate,
    muted,
    toggleMuted,
    caption,
    setCaption,
    date,
    setDate,
    format,
    setFormat,
    background,
    setBackground,
    backdrop,
    backdropError,
    backdropReading,
    chooseBackdrop,
    onBackdropPicked,
    captureBackdrop,
    applyBackdropCrop,
    removeBackdrop,
    applyCrop,
    videoRef,
    fileInputRef,
    backdropInputRef,
    startCamera,
    stopCamera,
    shoot,
    retake,
    clearShots,
    openFilePicker,
    onFilePicked,
    download,
    saveVideo,
  }
}

export type PhotoboothController = ReturnType<typeof usePhotobooth>
