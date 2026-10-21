import { faCamera, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'

interface ScannerProps {
  onImageSelected: (file: File) => void
  scanning: boolean
  previewUrl: string | null
  statusText: string
}

export default function Scanner({ onImageSelected, scanning, previewUrl, statusText }: ScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [dragActive, setDragActive] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  // Always release the camera when the component unmounts or the live
  // view is closed — otherwise the browser keeps showing the "camera in
  // use" indicator after the user is done.
  useEffect(() => {
    return () => stopCamera()
  }, [])

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraActive(false)
  }

  // Device labels (and often the full device list) are only populated by
  // the browser once camera permission has been granted at least once —
  // so this is called after a stream has already started successfully.
  async function loadCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      setCameras(devices.filter((d) => d.kind === 'videoinput'))
    } catch (err) {
      console.error('Could not list cameras', err)
    }
  }

  async function startCamera(deviceId?: string) {
    setCameraError(null)

    // Check this first: on mobile browsers especially, an insecure context
    // (plain http://, not localhost) makes `navigator.mediaDevices` undefined
    // entirely — so checking mediaDevices first would misreport this as
    // "not supported" when the real issue is just needing HTTPS.
    if (!window.isSecureContext) {
      setCameraError('Camera access needs HTTPS (or localhost). Use Upload instead, or serve this app over https.')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported in this browser. Use Upload instead.')
      return
    }

    // If a specific camera was picked, request exactly that device. Otherwise
    // (first launch) just ask for a rear-facing camera and let the OS decide
    // — usually the main wide lens — which the picker can then override.
    const primaryConstraints: MediaStreamConstraints = {
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 960 } }
        : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false,
    }

    let stream: MediaStream | null = null
    let lastError: unknown = null

    try {
      stream = await navigator.mediaDevices.getUserMedia(primaryConstraints)
    } catch (err) {
      lastError = err
      // Some devices/browsers reject the specific constraint combo
      // (OverconstrainedError) even though a camera is available — fall
      // back to a bare request before giving up.
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      } catch (fallbackErr) {
        lastError = fallbackErr
      }
    }

    if (!stream) {
      console.error(lastError)
      const err = lastError instanceof DOMException ? lastError : null
      const name = err?.name ?? ''

      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Allow camera access in your browser settings, then try again.')
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Use Upload instead.')
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setCameraError('The camera is already in use by another app or tab. Close it and try again.')
      } else if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
        setCameraError('That camera is not available. Try picking a different one, or use Upload.')
      } else if (name === 'SecurityError') {
        setCameraError('Camera access is blocked by this page/browser\'s security settings. Use Upload instead.')
      } else {
        const detail = err ? `${err.name}${err.message ? `: ${err.message}` : ''}` : String(lastError)
        setCameraError(`Could not start the camera (${detail}). Use Upload instead.`)
      }
      return
    }

    streamRef.current = stream
    setCameraActive(true)
    requestAnimationFrame(() => {
      if (videoRef.current) videoRef.current.srcObject = stream
    })

    // Track which physical device actually ended up streaming (so the
    // dropdown reflects reality even on the very first, unconstrained launch),
    // then populate the full camera list now that permission is granted.
    const actualDeviceId = stream.getVideoTracks()[0]?.getSettings().deviceId
    if (actualDeviceId) setSelectedDeviceId(actualDeviceId)
    loadCameras()
  }

  async function handleSelectCamera(deviceId: string) {
    setSelectedDeviceId(deviceId)
    stopCamera()
    await startCamera(deviceId)
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `card-scan-${Date.now()}.jpg`, { type: 'image/jpeg' })
        stopCamera()
        onImageSelected(file)
      },
      'image/jpeg',
      0.92
    )
  }

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelected(file)
    }
  }

  const showingLiveCamera = cameraActive && !previewUrl

  return (
    <>
      <div
        className="dex-screen-frame"
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          stopCamera()
          handleFiles(e.dataTransfer.files)
        }}
      >
        <div className="dex-screen" style={dragActive ? { outline: '2px dashed #74d48b' } : undefined}>
          {showingLiveCamera ? (
            <video ref={videoRef} className="dex-screen__preview" autoPlay playsInline muted />
          ) : previewUrl ? (
            <img className="dex-screen__preview" src={previewUrl} alt="Scan target" />
          ) : (
            <div className="dex-screen__placeholder">
              <div className="card-guide">
                <span className="card-guide__name-band" />
              </div>
              <span>ALIGN CARD — name visible at top</span>
            </div>
          )}

          {(showingLiveCamera || previewUrl) && <div className="name-band-overlay" aria-hidden="true" />}

          {scanning && (
            <div className="scan-sweep">
              <div className="scan-sweep__bar" />
            </div>
          )}

          {(scanning || statusText) && (
            <div className="dex-screen__status">
              <span>{statusText || 'ANALYZING...'}</span>
              <span>{scanning ? '●REC' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {cameraError && <div className="dex-error">⚠ {cameraError}</div>}

      {showingLiveCamera && cameras.length > 1 && (
        <select
          className="camera-select"
          value={selectedDeviceId ?? ''}
          onChange={(e) => handleSelectCamera(e.target.value)}
        >
          {cameras.map((camera, i) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `Camera ${i + 1}`}
            </option>
          ))}
        </select>
      )}

      {showingLiveCamera ? (
        <div className="dex-controls">
          <button type="button" className="dex-btn dex-btn--ghost" onClick={stopCamera}>
            <FontAwesomeIcon icon={faTimes}/> Cancel
          </button>
          <button type="button" className="dex-btn dex-btn--primary" onClick={capturePhoto}>
            <FontAwesomeIcon icon={faCamera}/> Capture
          </button>
        </div>
      ) : (
        <div className="dex-controls">
          <button
            type="button"
            className="dex-btn dex-btn--ghost"
            disabled={scanning}
            onClick={() => startCamera(selectedDeviceId ?? undefined)}
          >
            Camera
          </button>
          <button
            type="button"
            className="dex-btn dex-btn--ghost"
            disabled={scanning}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        className="hidden-input"
        type="file"
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </>
  )
}