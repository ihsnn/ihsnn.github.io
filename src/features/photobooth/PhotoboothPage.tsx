import { useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../../components/shared/SiteHeader'
import {
  CAPTION_MAX_LENGTH,
  cropAspectFor,
  EXPORT_BACKGROUNDS,
  EXPORT_FORMATS,
  PHOTOBOOTH_COPY as COPY,
  STRIP_FILTERS,
  STRIP_LAYOUTS,
  type StripFilterId,
} from '../../content/photobooth'
import CropEditor from './CropEditor'
import ExportCanvas from './ExportCanvas'
import LayoutCard from './LayoutCard'
import { planFrame } from './export'
import { usePhotobooth } from './usePhotobooth'
import './photobooth.css'

const FILTER_COUNTS: Record<StripFilterId, number> = {
  all: STRIP_LAYOUTS.length,
  one: STRIP_LAYOUTS.filter((layout) => layout.slots === 1).length,
  two: STRIP_LAYOUTS.filter((layout) => layout.slots === 2).length,
  motion: STRIP_LAYOUTS.filter((layout) => Boolean(layout.motion)).length,
}

const CAMERA_MESSAGES = {
  denied: COPY.cameraDenied,
  missing: COPY.cameraMissing,
  insecure: COPY.cameraInsecure,
  broken: COPY.cameraBroken,
} as const

export default function PhotoboothPage() {
  const booth = usePhotobooth()
  const {
    layout,
    selectLayout,
    shots,
    images,
    photoCount,
    isComplete,
    canShoot,
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
    videoRef,
    fileInputRef,
    startCamera,
    stopCamera,
    shoot,
    retake,
    clearShots,
    openFilePicker,
    onFilePicked,
    download,
    saveVideo,
    nextSlot,
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
    backdropInputRef,
    applyCrop,
  } = booth
  const [filter, setFilter] = useState<StripFilterId>('all')
  const [cropSlot, setCropSlot] = useState<number | null>(null)
  const [backdropEditing, setBackdropEditing] = useState(false)
  const cropShot = cropSlot === null ? undefined : shots[cropSlot]
  const firstFilledSlot = shots.findIndex(Boolean)
  const backdropAspect = useMemo(() => {
    const plan = planFrame(layout, format, 'image', 1)
    return plan.width / plan.height
  }, [format, layout])

  const visibleLayouts = useMemo(() => {
    if (filter === 'all') return STRIP_LAYOUTS
    if (filter === 'motion') return STRIP_LAYOUTS.filter((item) => item.motion)
    return STRIP_LAYOUTS.filter((item) =>
      filter === 'one' ? item.slots === 1 : item.slots === 2,
    )
  }, [filter])

  const cameraMessage = cameraError
    ? CAMERA_MESSAGES[cameraError]
    : COPY.cameraOffText
  const previewHint = isComplete
    ? COPY.previewReady
    : photoCount === 0
      ? COPY.previewEmpty
      : COPY.previewEmptyOne
  const animated = Boolean(layout.motion)
  const transparentFrame = format !== 'strip' && background === 'none'

  const announcement = fileError
    ? COPY.fileFailed
    : downloadError
      ? COPY.downloadFailed
      : countdown !== null
        ? countdown > 0
          ? `${COPY.countdownReady} ${countdown}`
          : COPY.capture
        : videoState === 'done'
          ? COPY.videoDone
          : videoState === 'error'
            ? COPY.videoFailed
            : celebrate
              ? `${COPY.completeBadge}. ${COPY.previewReady}`
              : downloaded
                ? COPY.downloaded
                : previewHint

  const scrollTo = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  const scrollToPicker = () => scrollTo('booth-picker')
  const scrollToMachine = () => scrollTo('booth-machine')

  const flashStyle = { '--flash-color': layout.theme.glow } as CSSProperties

  return (
    <div className="booth-page">
      <div className="booth-aurora" aria-hidden="true" />
      <div className="booth-grid" aria-hidden="true" />

      <div className="app-shell booth-shell">
        <SiteHeader
          eyebrow={COPY.eyebrow}
          title={
            <>
              {COPY.titleTop} <em>{COPY.titleBottom}</em>
            </>
          }
          backTo={COPY.backToShelf}
          led="yellow"
          size="md"
        />

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>

        <section className="booth-hero" aria-labelledby="booth-hero-title">
          <div className="booth-hero__copy">
            <p className="booth-hero__kicker">
              <span aria-hidden="true">✦</span> {COPY.heroKicker}
            </p>
            <h2 className="booth-hero__title" id="booth-hero-title">
              <span>{COPY.heroLineOne}</span>
              <span>{COPY.heroLineTwo}</span>
              <span className="is-accent">{COPY.heroLineThree}</span>
            </h2>
            <p className="booth-hero__blurb">{COPY.heroBlurb}</p>
          </div>

          <dl className="booth-badges">
            {COPY.badges.map((badge) => (
              <div className="booth-badge" key={badge.label}>
                <dt>{badge.label}</dt>
                <dd>{badge.value}</dd>
              </div>
            ))}
          </dl>

          <p className="booth-hero__privacy">
            <span aria-hidden="true">▣</span> {COPY.privacyNote}
          </p>
        </section>

        <section
          className="booth-picker"
          id="booth-picker"
          aria-labelledby="booth-picker-title"
        >
          <header className="booth-head">
            <p className="booth-head__index">STEP {COPY.pickerIndex}</p>
            <h2 className="booth-head__title" id="booth-picker-title">
              {COPY.pickerTitle}
            </h2>
            <p className="booth-head__lead">{COPY.pickerLead}</p>
          </header>

          <div className="booth-picker__toolbar">
            <div
              className="booth-filters"
              role="group"
              aria-label={COPY.pickerFilterLabel}
            >
              {STRIP_FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`booth-filter${filter === item.id ? ' is-active' : ''}`}
                  onClick={() => setFilter(item.id)}
                  aria-pressed={filter === item.id}
                >
                  {item.label}
                  <span className="booth-filter__count">
                    {FILTER_COUNTS[item.id]}
                  </span>
                </button>
              ))}
            </div>
            <div className="booth-picker__aside">
              <p className="booth-picker__count">
                <b>{visibleLayouts.length}</b> / {STRIP_LAYOUTS.length}{' '}
                {COPY.pickerCount}
              </p>
              <button
                type="button"
                className="booth-jump"
                onClick={scrollToMachine}
              >
                {COPY.jumpToCamera} <span aria-hidden="true">↓</span>
              </button>
            </div>
          </div>

          <div className="booth-picker__grid">
            {visibleLayouts.map((item) => (
              <LayoutCard
                key={item.id}
                layout={item}
                selected={item.id === layout.id}
                onSelect={selectLayout}
              />
            ))}
          </div>

          <p className="booth-picker__note">
            <span aria-hidden="true">✧</span> {COPY.pickerNote}
          </p>
        </section>

        <section
          className="booth-machine"
          id="booth-machine"
          aria-labelledby="booth-shoot-title"
        >
          <div className="booth-camera">
            <header className="booth-head booth-head--compact">
              <p className="booth-head__index">STEP {COPY.cameraIndex}</p>
              <h2 className="booth-head__title" id="booth-shoot-title">
                {COPY.cameraTitle}
              </h2>
              <p className="booth-head__lead">{COPY.cameraLead}</p>
            </header>

            <div className="booth-viewport">
              <div className="booth-viewport__masthead" aria-hidden="true">
                <span>BOOTH 06</span>
                <span>SELFIE STUDIO</span>
                <span>150 × 100</span>
              </div>

              <div className="booth-screen">
                <video
                  ref={videoRef}
                  className={`booth-video${cameraState === 'live' ? ' is-live' : ''}`}
                  playsInline
                  muted
                  aria-hidden="true"
                />

                <span className="booth-corner booth-corner--tl" aria-hidden="true" />
                <span className="booth-corner booth-corner--tr" aria-hidden="true" />
                <span className="booth-corner booth-corner--bl" aria-hidden="true" />
                <span className="booth-corner booth-corner--br" aria-hidden="true" />

                {cameraState === 'live' && (
                  <>
                    <span className="booth-rec is-live" aria-hidden="true">
                      <i />
                      {COPY.cameraLive}
                    </span>
                    <span className="booth-shot-counter" aria-hidden="true">
                      SLOT {nextSlot >= 0 ? nextSlot + 1 : layout.slots} /{' '}
                      {layout.slots}
                    </span>
                  </>
                )}

                {cameraState !== 'live' && (
                  <div className="booth-camera-off">
                    <span className="booth-camera-off__lens" aria-hidden="true">
                      ◉
                    </span>
                    <p className="booth-camera-off__title">
                      {cameraState === 'starting'
                        ? COPY.cameraStarting
                        : cameraState === 'error'
                          ? COPY.cameraErrorTitle
                          : COPY.cameraOffTitle}
                    </p>
                    <p className="booth-camera-off__text">
                      {cameraState === 'starting'
                        ? COPY.cameraOffText
                        : cameraState === 'error'
                          ? cameraMessage
                          : COPY.cameraOffText}
                    </p>
                    <div className="booth-camera-off__actions">
                      <button
                        type="button"
                        className="booth-button booth-button--primary"
                        onClick={() => void startCamera()}
                        disabled={cameraState === 'starting'}
                      >
                        {cameraState === 'error'
                          ? COPY.cameraRetry
                          : COPY.cameraStart}
                      </button>
                      <button
                        type="button"
                        className="booth-button"
                        onClick={() => openFilePicker()}
                        disabled={isComplete || readingFile || capturing}
                      >
                        {COPY.gallery}
                      </button>
                    </div>
                    <p className="booth-camera-off__note">{COPY.galleryHint}</p>
                  </div>
                )}

                {cameraState === 'live' && (
                  <p className="booth-camera-hint">{COPY.cameraHint}</p>
                )}

                {countdown !== null && (
                  <div
                    className={`booth-countdown${countdown === 0 ? ' is-shoot' : ''}`}
                    aria-hidden="true"
                  >
                    <span>{countdown > 0 ? countdown : COPY.capture}</span>
                  </div>
                )}

                <span
                  className={`booth-flash${flash ? ' is-on' : ''}`}
                  style={flashStyle}
                  aria-hidden="true"
                />
              </div>

              <div className="booth-viewport__foot" aria-hidden="true">
                <span>FLASH · AUTO</span>
                <span>LENS · FRONT</span>
                <span>OUT · PNG / WEBM</span>
              </div>
            </div>

            <div className="booth-controls">
              <button
                type="button"
                className="booth-shutter"
                onClick={() => void shoot()}
                disabled={!canShoot}
                aria-label={
                  isComplete
                    ? COPY.captureFull
                    : capturing
                      ? COPY.capturing
                      : COPY.capture
                }
              >
                <span className="booth-shutter__ring" aria-hidden="true">
                  <span />
                </span>
                <span className="booth-shutter__label">
                  {capturing
                    ? COPY.capturing
                    : isComplete
                      ? COPY.captureFull
                      : photoCount === 0
                        ? COPY.capture
                        : COPY.captureNext}
                </span>
              </button>

              <div className="booth-controls__side">
                {cameraState === 'live' ? (
                  <button
                    type="button"
                    className="booth-button booth-button--small"
                    onClick={stopCamera}
                    disabled={capturing}
                  >
                    {COPY.cameraStop}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="booth-button booth-button--small"
                    onClick={() => void startCamera()}
                    disabled={cameraState === 'starting'}
                  >
                    {cameraState === 'error' ? COPY.cameraRetry : COPY.cameraStart}
                  </button>
                )}
                <button
                  type="button"
                  className="booth-button booth-button--small"
                  onClick={() => openFilePicker()}
                  disabled={isComplete || readingFile || capturing}
                >
                  {readingFile ? COPY.capturing : COPY.gallery}
                </button>
                {firstFilledSlot >= 0 && (
                  <button
                    type="button"
                    className="booth-button booth-button--small booth-adjust"
                    onClick={() => setCropSlot(firstFilledSlot)}
                    disabled={capturing || readingFile}
                  >
                    <span aria-hidden="true">⛶</span> {COPY.adjustPhoto}
                  </button>
                )}
                <button
                  type="button"
                  className={`booth-button booth-button--small booth-sound${muted ? ' is-muted' : ''}`}
                  onClick={toggleMuted}
                  aria-pressed={muted}
                  title={muted ? COPY.soundOff : COPY.soundOn}
                >
                  <span aria-hidden="true">{muted ? '✕' : '♪'}</span>
                  <span className="sr-only">
                    {muted ? COPY.soundOff : COPY.soundOn}
                  </span>
                </button>
              </div>
            </div>

            <div className="booth-slots">
              <div className="booth-slots__head">
                <span>{COPY.slotsTitle}</span>
                <span>
                  {photoCount} / {layout.slots}
                </span>
              </div>
              <div className="booth-slots__row">
                {Array.from({ length: layout.slots }, (_, index) => {
                  const shot = shots[index]
                  return (
                    <div
                      className={`booth-slot${shot ? ' is-filled' : ''}`}
                      key={index}
                    >
                      <span className="booth-slot__label">
                        {COPY.slotLabel} {index + 1}
                      </span>
                      {shot ? (
                        <button
                          type="button"
                          className="booth-slot__frame booth-slot__frame--button"
                          onClick={() => {
                            setBackdropEditing(false)
                            setCropSlot(index)
                          }}
                          disabled={capturing || readingFile}
                          aria-label={`${COPY.slotAdjust} ${COPY.slotLabel} ${index + 1}`}
                        >
                          <img src={shot.url} alt="" />
                          <span className="booth-slot__crop-tag" aria-hidden="true">
                            <span>⛶</span> {COPY.slotAdjust}
                          </span>
                        </button>
                      ) : (
                        <span className="booth-slot__frame">
                          <span
                            className={`booth-slot__empty${
                              nextSlot === index ? ' is-next' : ''
                            }`}
                          >
                            {nextSlot === index
                              ? COPY.slotNext
                              : COPY.slotEmpty}
                          </span>
                        </span>
                      )}
                      {shot ? (
                        <span className="booth-slot__actions">
                          <button
                            type="button"
                            className="booth-slot__action"
                            onClick={() => retake(index)}
                            disabled={capturing || readingFile}
                          >
                            {COPY.retake}
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="booth-slot__action"
                          onClick={() => openFilePicker(index)}
                          disabled={readingFile || capturing}
                        >
                          {COPY.slotChoose}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="booth-slots__hint">{COPY.slotHint}</p>
            </div>

            {fileError && (
              <p className="booth-error" role="alert">
                {COPY.fileFailed}
              </p>
            )}
          </div>

          <aside className="booth-result" aria-labelledby="booth-result-title">
            <header className="booth-head booth-head--compact">
              <p className="booth-head__index">STEP {COPY.previewIndex}</p>
              <h2 className="booth-head__title" id="booth-result-title">
                {COPY.previewTitle}
              </h2>
              <p className="booth-head__lead">{COPY.previewLead}</p>
            </header>

            <div className="booth-caption">
              <label className="booth-caption__label" htmlFor="booth-caption-input">
                <span aria-hidden="true">✎</span> {COPY.captionTitle}{' '}
                <em>{COPY.captionOptional}</em>
              </label>
              <div className="booth-caption__field">
                <input
                  id="booth-caption-input"
                  type="text"
                  value={caption}
                  maxLength={CAPTION_MAX_LENGTH}
                  placeholder={COPY.captionPlaceholder}
                  onChange={(event) => setCaption(event.target.value)}
                />
                {caption && (
                  <button
                    type="button"
                    className="booth-caption__clear"
                    onClick={() => setCaption('')}
                    aria-label={COPY.captionClear}
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="booth-caption__meta">
                <b>
                  {caption.length}/{CAPTION_MAX_LENGTH}
                </b>{' '}
                {COPY.captionHint}
              </p>
            </div>

            <div className="booth-export">
              <div className="booth-export__group booth-export__group--date">
                <label className="booth-export__label" htmlFor="booth-date-input">
                  {COPY.dateTitle}
                </label>
                <input
                  id="booth-date-input"
                  className="booth-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  disabled={!layout.date}
                />
                <p className="booth-export__hint">
                  {layout.date ? COPY.dateHint : COPY.dateUnused}
                </p>
              </div>

              <div className="booth-export__group">
                <span className="booth-export__label">{COPY.formatTitle}</span>
                <div
                  className="booth-chips"
                  role="group"
                  aria-label={COPY.formatTitle}
                >
                  {EXPORT_FORMATS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`booth-chip${format === item.id ? ' is-active' : ''}`}
                      onClick={() => setFormat(item.id)}
                      aria-pressed={format === item.id}
                    >
                      {item.label}
                      <small>{item.hint}</small>
                    </button>
                  ))}
                </div>
                <p className="booth-export__hint">{COPY.formatHint}</p>
              </div>

              <div className="booth-export__group">
                <span className="booth-export__label">
                  {COPY.backgroundTitle}
                </span>
                <div
                  className="booth-swatches"
                  role="group"
                  aria-label={COPY.backgroundTitle}
                >
                  {EXPORT_BACKGROUNDS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`booth-swatch${background === item.id ? ' is-active' : ''}`}
                      style={{ '--swatch': item.swatch } as CSSProperties}
                      onClick={() => {
                        if (item.id === 'image' && !backdrop) {
                          chooseBackdrop()
                          return
                        }
                        setBackground(item.id)
                      }}
                      aria-pressed={background === item.id}
                      title={item.label}
                    >
                      <span aria-hidden="true" />
                      <em>{item.label}</em>
                    </button>
                  ))}
                </div>
                <p className="booth-export__hint">{COPY.backgroundHint}</p>
              </div>

              <div className="booth-export__group">
                <span className="booth-export__label">{COPY.backdropTitle}</span>
                {backdrop ? (
                  <div className="booth-backdrop">
                    <span className="booth-backdrop__thumb">
                      <img src={backdrop.url} alt="" />
                    </span>
                    <span className="booth-backdrop__actions">
                      <button
                        type="button"
                        className="booth-button booth-button--small"
                        onClick={() => {
                          setCropSlot(null)
                          setBackdropEditing(true)
                        }}
                      >
                        {COPY.backdropAdjust}
                      </button>
                      <button
                        type="button"
                        className="booth-button booth-button--small"
                        onClick={removeBackdrop}
                      >
                        {COPY.backdropRemove}
                      </button>
                    </span>
                  </div>
                ) : (
                  <div className="booth-backdrop__actions">
                    <button
                      type="button"
                      className="booth-button booth-button--small"
                      onClick={chooseBackdrop}
                      disabled={backdropReading}
                    >
                      {backdropReading ? COPY.capturing : COPY.backdropChoose}
                    </button>
                    <button
                      type="button"
                      className="booth-button booth-button--small"
                      onClick={captureBackdrop}
                      disabled={cameraState !== 'live' || capturing}
                      title={
                        cameraState !== 'live' ? COPY.backdropCameraOff : undefined
                      }
                    >
                      {COPY.backdropCapture}
                    </button>
                  </div>
                )}
                <p className="booth-export__hint">
                  {backdrop ? COPY.backdropHint : COPY.backdropLead}
                </p>
                {backdropError && (
                  <p className="booth-error" role="alert">
                    {COPY.backdropFailed}
                  </p>
                )}
              </div>
            </div>

            <div className="booth-preview">
              <div
                className={`booth-preview__frame${transparentFrame ? ' is-checker' : ''}`}
                data-shine={layout.shine}
              >
                <ExportCanvas
                  layout={layout}
                  photos={images}
                  caption={caption}
                  date={date}
                  format={format}
                  background={background}
                  backdrop={
                    backdrop
                      ? { image: backdrop.image, crop: backdrop.crop }
                      : undefined
                  }
                  animate
                  className="booth-preview__canvas"
                  label={`${COPY.previewTitle}: ${layout.name}, ${photoCount} of ${layout.slots} photos`}
                />
                <span className="booth-preview__shine" aria-hidden="true" />
              </div>
            </div>

            <div className="booth-preview__info">
              <div>
                <p className="booth-preview__name">{layout.name}</p>
                <p className="booth-preview__meta">
                  {layout.category} · {layout.slots}{' '}
                  {layout.slots === 1 ? 'photo' : 'photos'} · {layout.width} ×{' '}
                  {layout.height}
                  {animated ? ' · animated' : ''}
                </p>
              </div>
              <span
                className={`booth-preview__slots${isComplete ? ' is-done' : ''}${
                  celebrate ? ' is-celebrating' : ''
                }`}
              >
                {isComplete
                  ? `${COPY.completeBadge} · ${photoCount}/${layout.slots}`
                  : `${photoCount}/${layout.slots}`}
              </span>
            </div>

            <p className="booth-preview__hint">{previewHint}</p>

            <div className="booth-save">
              <button
                type="button"
                className="booth-download"
                onClick={() => void download()}
                disabled={
                  !isComplete || downloading || capturing || readingFile
                }
              >
                <span aria-hidden="true">{downloading ? '◌' : '↓'}</span>
                {downloading
                  ? COPY.downloading
                  : downloaded
                    ? COPY.downloaded
                    : COPY.download}
              </button>
              <button
                type="button"
                className="booth-download booth-download--video"
                onClick={() => void saveVideo()}
                disabled={
                  !isComplete ||
                  videoState === 'recording' ||
                  !animated ||
                  !videoSupported
                }
              >
                <span aria-hidden="true">
                  {videoState === 'recording' ? '◌' : '▶'}
                </span>
                {videoState === 'recording'
                  ? COPY.videoRecording
                  : videoState === 'done'
                    ? COPY.videoDone
                    : COPY.video}
              </button>
            </div>
            <p className="booth-download__hint">
              {animated ? COPY.videoHint : COPY.videoStill}
            </p>
            {animated && !videoSupported && (
              <p className="booth-error" role="status">
                {COPY.videoUnsupported}
              </p>
            )}
            {videoState === 'error' && (
              <p className="booth-error" role="alert">
                {COPY.videoFailed}
              </p>
            )}

            <div className="booth-preview__actions">
              <button
                type="button"
                className="booth-button booth-button--ghost"
                onClick={clearShots}
                disabled={photoCount === 0 || capturing || readingFile}
              >
                {COPY.retakeAll}
              </button>
              <button
                type="button"
                className="booth-button booth-button--ghost"
                onClick={scrollToPicker}
              >
                {COPY.changeLayout}
              </button>
            </div>

            {downloadError && (
              <p className="booth-error" role="alert">
                {COPY.downloadFailed}
              </p>
            )}
          </aside>
        </section>

        <section className="booth-notes" aria-labelledby="booth-how-title">
          <header className="booth-head booth-head--compact">
            <p className="booth-head__index">MANUAL</p>
            <h2 className="booth-head__title" id="booth-how-title">
              {COPY.notesTitle}
            </h2>
          </header>
          <ul className="booth-notes__list">
            {COPY.notes.map((note) => (
              <li key={note}>
                <span aria-hidden="true">↳</span>
                {note}
              </li>
            ))}
          </ul>
          <p className="booth-notes__privacy">
            <span aria-hidden="true">▣</span> {COPY.privacyNote}
          </p>
        </section>

        <footer className="booth-footer">
          <p>{COPY.footer}</p>
          <p>{COPY.sourceNote}</p>
          <Link to={COPY.backToShelf}>{COPY.footerShelf}</Link>
        </footer>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="booth-file-input"
        onChange={(event) =>
          void onFilePicked(event, (slot) => {
            setBackdropEditing(false)
            setCropSlot(slot)
          })
        }
        tabIndex={-1}
        aria-hidden="true"
      />

      <input
        ref={backdropInputRef}
        type="file"
        accept="image/*"
        className="booth-file-input"
        onChange={(event) => void onBackdropPicked(event)}
        tabIndex={-1}
        aria-hidden="true"
      />

      {cropSlot !== null && cropShot ? (
        <CropEditor
          key={`${cropSlot}-${cropShot.id}`}
          shot={cropShot}
          aspect={cropAspectFor(layout, cropSlot)}
          slot={cropSlot}
          onApply={(crop) => {
            applyCrop(cropSlot, crop)
            setCropSlot(null)
          }}
          onClose={() => setCropSlot(null)}
        />
      ) : null}

      {backdropEditing && backdrop ? (
        <CropEditor
          key={`backdrop-${backdrop.id}`}
          shot={backdrop}
          aspect={backdropAspect}
          slot={0}
          kicker={COPY.backdropCrop}
          lead={COPY.backdropCropLead}
          onApply={(crop) => {
            applyBackdropCrop(crop)
            setBackdropEditing(false)
          }}
          onClose={() => setBackdropEditing(false)}
        />
      ) : null}
    </div>
  )
}
