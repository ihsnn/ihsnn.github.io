import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../app/routes'
import {
  BADGES,
  CAST_KEYS,
  CAST_SHEET_KEYS,
  GAME,
  HELP_NOTE,
  HELP_ROWS,
  READER_COPY,
  SHEET_COPY,
  SHELF_COPY,
} from '../../content/rakcerita'
import { avatar, CAST } from './art'
import RakIcons from './art/RakIcons'
import { attachFx, clearFx, resizeFx } from './fx'
import { initSpeech, stopSpeech } from './speech'
import { BOOKS, STORIES, storyById } from './shelf'
import SongSheet from './SongSheet'
import { resetFlags, setHost, sfx, speak, type RakHost } from './runtime'
import type { RakProgress, Story, StoryId } from './types'
import './rakcerita.css'

const PROGRESS_KEY = 'ihsnn:rakcerita:progress'
const SETTINGS_KEY = 'ihsnn:rakcerita:settings'

interface Settings {
  sound: boolean
  auto: boolean
}

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const writeJSON = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode: progress just will not stick */
  }
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const ico = (name: string) => (
  <svg>
    <use href={`#i-${name}`} />
  </svg>
)

/** Case/accent-insensitive search, so "kebun" finds "Kebun Nenda". */
const norm = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')

export default function RakCeritaPage() {
  const [progress, setProgress] = useState<RakProgress>(() =>
    readJSON<RakProgress>(PROGRESS_KEY, { stars: 0, seen: {}, done: {} }),
  )
  const [settings, setSettings] = useState<Settings>(() =>
    readJSON<Settings>(SETTINGS_KEY, { sound: true, auto: false }),
  )

  const [storyId, setStoryId] = useState<StoryId | null>(null)
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [sheet, setSheet] = useState<null | 'menu' | 'help' | 'cast' | 'stars'>(null)
  const [castFocus, setCastFocus] = useState<string | null>(null)
  const [songOpen, setSongOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [talking, setTalking] = useState(false)
  const [pageDone, setPageDone] = useState(false)
  const [captionOverride, setCaptionOverride] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [tall, setTall] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const stageWrapRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const bubblesRef = useRef<HTMLDivElement>(null)
  const hotLayerRef = useRef<HTMLDivElement>(null)
  const fxRef = useRef<HTMLCanvasElement>(null)
  const toastTimer = useRef(0)

  const story = storyById(storyId)
  const current = story?.pages[page] ?? null
  const reading = Boolean(story)

  /* ---------- persistence ---------- */
  useEffect(() => writeJSON(PROGRESS_KEY, progress), [progress])
  useEffect(() => writeJSON(SETTINGS_KEY, settings), [settings])

  /* ---------- shared state for the imperative stage ---------- */
  const latest = useRef({ sound: settings.sound, page, stars: progress.stars })
  latest.current = { sound: settings.sound, page, stars: progress.stars }

  const toast = useCallback((message: string) => {
    setToastMessage(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMessage(''), 2600)
  }, [])

  const addStars = useCallback((n: number) => {
    setProgress((prev) => ({ ...prev, stars: prev.stars + n }))
  }, [])

  const markPageDone = useCallback(() => setPageDone(true), [])

  const go = useCallback((index: number) => {
    setPage((prev) => (index === prev ? prev : index))
  }, [])

  useEffect(() => {
    const host: RakHost = {
      stage: stageRef.current,
      bubbles: bubblesRef.current,
      hotLayer: hotLayerRef.current,
      isSoundOn: () => latest.current.sound,
      addStars,
      markPageDone,
      go,
      pageIndex: () => latest.current.page,
      setTalking,
      setCaption: (text: string) => setCaptionOverride(text),
      openSong: () => setSongOpen(true),
      toast,
    }
    setHost(host)
    return () => setHost(null)
  }, [addStars, go, markPageDone, toast])

  /* ---------- canvas + speech plumbing ---------- */
  useEffect(() => {
    attachFx(fxRef.current)
    const onResize = () => resizeFx()
    window.addEventListener('resize', onResize)
    const disposeSpeech = initSpeech()
    return () => {
      window.removeEventListener('resize', onResize)
      disposeSpeech()
      clearFx()
      attachFx(null)
      stopSpeech()
    }
  }, [])

  /* ---------- fit the 960 × 540 stage ---------- */
  const layout = useCallback(() => {
    const wrap = stageWrapRef.current
    if (!wrap) return
    const isTall = window.innerWidth / window.innerHeight < 1.02
    setTall(isTall)
    const rect = wrap.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const raw = isTall ? rect.width / 960 : Math.min((rect.width - 4) / 960, (rect.height - 4) / 540)
    setScale(clamp(raw, 0.2, 2))
  }, [])

  useEffect(() => {
    if (!reading) return
    const raf = requestAnimationFrame(layout)
    window.addEventListener('resize', layout)
    window.addEventListener('orientationchange', layout)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', layout)
      window.removeEventListener('orientationchange', layout)
    }
  }, [reading, layout, page, captionOverride])

  /* ---------- render the page artwork ---------- */
  useEffect(() => {
    if (!current || !artRef.current) return
    resetFlags()
    setCaptionOverride(null)
    setPageDone(false)
    if (bubblesRef.current) bubblesRef.current.innerHTML = ''
    if (hotLayerRef.current) hotLayerRef.current.innerHTML = ''
    artRef.current.innerHTML = current.art().replace(/@@\/?OV@@/g, '')
    artRef.current.classList.remove('page-in')
    void artRef.current.offsetWidth
    artRef.current.classList.add('page-in')
    current.setup?.()
    requestAnimationFrame(layout)
  }, [current, layout])

  /* ---------- seen pages ---------- */
  useEffect(() => {
    if (!story) return
    setProgress((prev) => {
      const seen = prev.seen[story.id] ?? []
      if (seen.includes(page)) return prev
      return { ...prev, seen: { ...prev.seen, [story.id]: [...seen, page] } }
    })
  }, [story, page])

  /* ---------- auto narration ---------- */
  useEffect(() => {
    if (!current || !settings.auto || !settings.sound) return
    const timer = window.setTimeout(() => speak(current.n), 260)
    return () => window.clearTimeout(timer)
  }, [current, settings.auto, settings.sound])

  /* ---------- reading a story ---------- */
  const openStory = useCallback(
    (id: string) => {
      const next = storyById(id)
      if (!next) {
        sfx('wrong')
        toast(READER_COPY.comingSoon)
        return
      }
      sfx('open')
      clearFx()
      stopSpeech()
      setStoryId(next.id)
      setPage(0)
      setSheet(null)
      setSongOpen(false)
    },
    [toast],
  )

  const toShelf = useCallback(() => {
    setStoryId(null)
    setPage(0)
    setSheet(null)
    setSongOpen(false)
    stopSpeech()
    clearFx()
  }, [])

  const turn = useCallback(
    (delta: number) => {
      if (!story) return
      const next = page + delta
      if (next < 0 || next >= story.pages.length) return
      sfx('page')
      setPage(next)
    },
    [page, story],
  )

  /* ---------- keyboard ---------- */
  useEffect(() => {
    if (!story) return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (songOpen || sheet) {
        if (event.key === 'Escape') {
          setSongOpen(false)
          setSheet(null)
        }
        return
      }
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        turn(1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        turn(-1)
      }
      if (event.key === 'Escape') toShelf()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [story, songOpen, sheet, turn, toShelf])

  /* ---------- swipe ---------- */
  const touch = useRef({ x: 0, y: 0, moved: false })
  const onTouchStart = (event: React.TouchEvent) => {
    const t = event.touches[0]
    touch.current = { x: t.clientX, y: t.clientY, moved: false }
  }
  const onTouchMove = () => {
    touch.current.moved = true
  }
  const onTouchEnd = (event: React.TouchEvent) => {
    if (!touch.current.moved) return
    const target = event.target as HTMLElement
    if (target.closest('button')) return
    const dx = event.changedTouches[0].clientX - touch.current.x
    const dy = event.changedTouches[0].clientY - touch.current.y
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) turn(dx < 0 ? 1 : -1)
  }

  /* ---------- tapping props ---------- */
  const onStageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('[data-act]')
    if (!el || !current) return
    event.stopPropagation()
    const act = el.dataset.act
    if (!act) return
    current.acts[act]?.(el)
  }

  /* ---------- toggles ---------- */
  const toggleSound = () => {
    setSettings((prev) => {
      const next = { ...prev, sound: !prev.sound }
      if (!next.sound) stopSpeech()
      return next
    })
    sfx('click')
  }
  const toggleAuto = () => {
    setSettings((prev) => {
      if (prev.auto) stopSpeech()
      return { ...prev, auto: !prev.auto }
    })
  }
  const toggleFullscreen = () => {
    try {
      if (document.fullscreenElement) void document.exitFullscreen()
      else void document.documentElement.requestFullscreen?.()
    } catch {
      /* fullscreen is a nicety, not a requirement */
    }
  }

  /* ---------- shelf filtering ---------- */
  const filtered = useMemo(() => {
    const q = norm(query)
    if (!q) return BOOKS
    return BOOKS.filter((book) => norm(`${book.title} ${book.keywords} ${book.meta}`).includes(q))
  }, [query])

  const narration = captionOverride ?? current?.n ?? ''
  const readyNext = Boolean(story) && pageDone

  return (
    <div
      className={`rak-cerita${tall ? ' is-tall' : ''}${talking ? ' talking' : ''}${
        sheet || songOpen ? ' sheet-open' : ''
      }`}
    >
      <RakIcons />
      <div id="app">
        {/* ================= SHELF ================= */}
        <section className="view" id="shelfView" aria-label="Rak cerita" hidden={reading}>
          <div className="shelf-wrap">
            <header className="shelf-head">
              <div className="brand">
                <span className="brand-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" style={{ color: '#E76489' }}>
                    <use href="#i-bookopen" />
                  </svg>
                </span>
                <div className="brand-txt">
                  <h1>
                    {SHELF_COPY.brandTitle} <em>{SHELF_COPY.brandAccent}</em>
                  </h1>
                  <p>{SHELF_COPY.brandSub}</p>
                </div>
              </div>
              <div className="head-tools">
                <Link className="icon-btn" to={ROUTES.home} aria-label="Kembali ke rak utama">
                  <svg>
                    <use href="#i-home" />
                  </svg>
                </Link>
                <button
                  className="icon-btn"
                  type="button"
                  aria-label={SHELF_COPY.helpLabel}
                  onClick={() => {
                    sfx('click')
                    setSheet('help')
                  }}
                >
                  <svg>
                    <use href="#i-help" />
                  </svg>
                </button>
              </div>
            </header>

            <div className="search-row">
              <label className="search" id="searchWrap">
                <svg aria-hidden="true">
                  <use href="#i-search" />
                </svg>
                <input
                  type="text"
                  inputMode="search"
                  autoComplete="off"
                  placeholder={SHELF_COPY.searchPlaceholder}
                  aria-label={SHELF_COPY.searchPlaceholder}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query && (
                  <button
                    className="clear"
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => setQuery('')}
                  >
                    ×
                  </button>
                )}
              </label>
              <div className="search-hint">
                {filtered.length === BOOKS.length
                  ? `${BOOKS.length} cerita`
                  : `${filtered.length} dari ${BOOKS.length} cerita`}
              </div>
            </div>

            <section className="shelf-section" aria-labelledby="rak-shelf-title">
              <div className="sec-head">
                <h2 id="rak-shelf-title">{SHELF_COPY.sectionTitle}</h2>
                <span className="line" />
                <span className="pill">{BOOKS.length} buku</span>
              </div>

              <div className="books">
                {filtered.map((book) => (
                  <button
                    key={book.id}
                    className={`book${book.ready ? '' : ' soon'}`}
                    type="button"
                    aria-label={book.title}
                    onClick={() => openStory(book.id)}
                  >
                    <span className="cover">
                      <span
                        className="cover-art"
                        dangerouslySetInnerHTML={{ __html: book.cover() }}
                      />
                      <span className="spine" />
                      <span className="gloss" />
                      {book.ready ? (
                        book.isNew ? (
                          <span className="badge new">Baru</span>
                        ) : null
                      ) : (
                        <span className="badge">Segera</span>
                      )}
                      <span className="ctitle">
                        {book.title}
                        <span className="cmeta">{book.meta}</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="empty">
                  <b>{SHELF_COPY.emptyTitle}</b>
                  <p>{SHELF_COPY.emptyText}</p>
                  <div className="chips">
                    {SHELF_COPY.emptyChips.map((chip) => (
                      <button key={chip} className="chip" type="button" onClick={() => setQuery(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="cast-sec" aria-labelledby="rak-cast-title">
              <div className="sec-head">
                <h2 id="rak-cast-title">{SHELF_COPY.castTitle}</h2>
                <span className="line" />
              </div>
              <div className="cast-row">
                {CAST_KEYS.map((key) => (
                  <button
                    key={key}
                    className="cast-card"
                    type="button"
                    onClick={() => {
                      sfx('click')
                      setCastFocus(key)
                      setSheet('cast')
                    }}
                  >
                    <span className="cast-ava">
                      <span dangerouslySetInnerHTML={{ __html: avatar(key, 76) }} />
                    </span>
                    <b>{CAST[key].name}</b>
                    <span>{CAST[key].role}</span>
                  </button>
                ))}
              </div>
            </section>

            <footer className="shelf-foot">
              {SHELF_COPY.footer}
              <br />
              {SHELF_COPY.footerNote}
            </footer>
          </div>
        </section>

        {/* ================= READER ================= */}
        <section className="view" id="readerView" aria-label="Halaman cerita" hidden={!reading}>
          <header className="reader-top">
            <button className="icon-btn backbtn" type="button" onClick={toShelf} aria-label={READER_COPY.backLabel}>
              <svg>
                <use href="#i-book" />
              </svg>
              <span className="btxt">{READER_COPY.backLabel}</span>
            </button>
            <div className="rtitle">
              <b>{story?.short ?? story?.title ?? ''}</b>
              <small>
                Halaman {page + 1} dari {story?.pages.length ?? 0}
              </small>
            </div>
            <button
              className="star-pill"
              type="button"
              aria-label={READER_COPY.starsLabel}
              onClick={() => {
                sfx('click')
                setSheet('stars')
              }}
            >
              <svg>
                <use href="#i-star" />
              </svg>
              <b>{progress.stars}</b>
            </button>
            <button
              className="icon-btn"
              type="button"
              aria-label={READER_COPY.readLabel}
              onClick={() => {
                sfx('click')
                if (current) speak(current.n)
              }}
            >
              <svg>
                <use href="#i-mic" />
              </svg>
            </button>
            <button
              className="icon-btn"
              type="button"
              aria-label={READER_COPY.menuLabel}
              onClick={() => {
                sfx('click')
                setSheet('menu')
              }}
            >
              <svg>
                <use href="#i-list" />
              </svg>
            </button>
          </header>

          <div
            id="stageWrap"
            ref={stageWrapRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              id="stage"
              ref={stageRef}
              style={{ transform: `translate(-50%,-50%) scale(${scale})` }}
              onClick={onStageClick}
            >
              <div className="art" id="art" ref={artRef} />
              <div className="hot-layer" id="hotLayer" ref={hotLayerRef} />
              <div className="bubbles" id="bubbles" ref={bubblesRef} />
              <div className="pbadge" id="pbadge">
                <b>{page + 1}</b>
                <span>{current?.t ?? ''}</span>
              </div>
              {current?.band !== false && (
                <div className="cap-band" id="capBand">
                  <span className="cnum">
                    Halaman {page + 1} · {current?.t}
                  </span>
                  <div className="ctext">{narration}</div>
                </div>
              )}
            </div>
          </div>

          <div className="cap-out" id="capOut">
            <div className="co-card">
              <div className="co-top">
                <span className="co-num">
                  Halaman {page + 1} · {current?.t}
                </span>
                <button
                  className="co-read"
                  type="button"
                  onClick={() => {
                    sfx('click')
                    if (current) speak(current.n)
                  }}
                >
                  {ico('mic')}
                  {READER_COPY.readOut}
                </button>
              </div>
              <p className="co-text">{narration}</p>
              {current?.hint && (
                <p className="co-hint">
                  {ico('sparkle')}
                  {current.hint}
                </p>
              )}
              {page === 0 && (
                <button
                  className="co-cta"
                  type="button"
                  onClick={() => {
                    sfx('open')
                    setPage(1)
                  }}
                >
                  {ico('play')} {READER_COPY.startOut}
                </button>
              )}
              <span className="co-wnum" aria-hidden="true">
                {page + 1}
              </span>
            </div>
          </div>

          {current?.lastPage && (
            <div className="end-actions">
              <button
                className="ea pink"
                type="button"
                onClick={() => {
                  sfx('open')
                  setPage(0)
                }}
              >
                {ico('replay')}
                {READER_COPY.repeat}
              </button>
              <button
                className="ea"
                type="button"
                onClick={() => {
                  const next = STORIES.find((s) => s.id !== story?.id)
                  if (next) openStory(next.id)
                  else toast('Cerita baru segera hadir!')
                }}
              >
                {ico('bookopen')}
                {READER_COPY.otherStory}
              </button>
              <button className="ea" type="button" onClick={toShelf}>
                {ico('home')}
                {READER_COPY.shelf}
              </button>
            </div>
          )}

          <div className="controls">
            <button
              className="nav"
              type="button"
              aria-label="Halaman sebelumnya"
              disabled={page === 0}
              onClick={() => turn(-1)}
            >
              {ico('left')}
            </button>
            <div className="mid">
              <div className="plabel">
                <b>{current?.t ?? 'Sampul'}</b>
                <span>
                  {page + 1} / {story?.pages.length ?? 0}
                </span>
              </div>
              <div className="pbar">
                <i style={{ width: `${((page + 1) / (story?.pages.length ?? 1)) * 100}%` }} />
              </div>
            </div>
            <button
              className={`nav next${readyNext ? ' ready' : ''}`}
              type="button"
              aria-label="Halaman berikutnya"
              disabled={!story || page === story.pages.length - 1}
              onClick={() => turn(1)}
            >
              {ico('right')}
            </button>
          </div>
        </section>
      </div>

      {sheet && (
        <div
          className="sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rak-sheet-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSheet(null)
          }}
        >
          <div className="sheet-card">
            <div className="sheet-head">
              <h3 id="rak-sheet-title">
                {sheet === 'menu' ? SHEET_COPY.pages : null}
                {sheet === 'help' ? SHEET_COPY.help : null}
                {sheet === 'cast' ? SHEET_COPY.cast : null}
                {sheet === 'stars' ? SHEET_COPY.stars : null}
              </h3>
              <button
                className="sheet-close"
                type="button"
                aria-label="Tutup"
                onClick={() => {
                  sfx('click')
                  setSheet(null)
                }}
              >
                {ico('close')}
              </button>
            </div>
            <div className="sheet-body">
              {sheet === 'menu' && story && (
                <PageSheet
                  story={story}
                  page={page}
                  seen={progress.seen[story.id] ?? []}
                  onJump={(index) => {
                    setSheet(null)
                    setPage(index)
                  }}
                  sound={settings.sound}
                  auto={settings.auto}
                  onSound={toggleSound}
                  onAuto={toggleAuto}
                  onFull={toggleFullscreen}
                  onHelp={() => setSheet('help')}
                  onShelf={() => {
                    setSheet(null)
                    toShelf()
                  }}
                  onRepeat={() => {
                    setSheet(null)
                    setPage(0)
                  }}
                />
              )}
              {sheet === 'help' && (
                <>
                  {HELP_ROWS.map((row) => (
                    <div className="help-row" key={row.title}>
                      <span className="ico">{ico(row.icon)}</span>
                      <div>
                        <b>{row.title}</b>
                        <p>{row.text}</p>
                      </div>
                    </div>
                  ))}
                  <p className="help-note">{HELP_NOTE}</p>
                </>
              )}
              {sheet === 'cast' && (
                <div className="cast-grid">
                  {CAST_SHEET_KEYS.map((key) => (
                    <div
                      className="cast-item"
                      key={key}
                      style={castFocus === key ? { outline: '3px solid var(--gold)' } : undefined}
                    >
                      <span className="av">
                        <span dangerouslySetInnerHTML={{ __html: avatar(key, 64) }} />
                      </span>
                      <div>
                        <b>{CAST[key].name}</b>
                        <span>{CAST[key].role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {sheet === 'stars' && (
                <StarsSheet stars={progress.stars} done={progress.done} />
              )}
            </div>
          </div>
        </div>
      )}

      <SongSheet open={songOpen} soundOn={settings.sound} onClose={() => setSongOpen(false)} />

      <div id="toast" className={toastMessage ? 'on' : ''} role="status" aria-live="polite">
        {toastMessage}
      </div>
      <canvas id="fx" ref={fxRef} aria-hidden="true" />
      <div id="ytHost" aria-hidden="true" />

      {/* keeps the cartridge title reachable for screen readers */}
      <p className="sr-only">{GAME.title}</p>
    </div>
  )
}

/* ============================================================
   sheet bodies
   ============================================================ */

function PageSheet({
  story,
  page,
  seen,
  onJump,
  sound,
  auto,
  onSound,
  onAuto,
  onFull,
  onHelp,
  onShelf,
  onRepeat,
}: {
  story: Story
  page: number
  seen: number[]
  onJump: (index: number) => void
  sound: boolean
  auto: boolean
  onSound: () => void
  onAuto: () => void
  onFull: () => void
  onHelp: () => void
  onShelf: () => void
  onRepeat: () => void
}) {
  return (
    <>
      <div className="idx-grid">
        {story.pages.map((p, index) => (
          <button
            key={p.t + index}
            className={`idx${index === page ? ' on' : ''}${seen.includes(index) && index !== page ? ' seen' : ''}`}
            type="button"
            onClick={() => onJump(index)}
          >
            <b>{index + 1}</b>
            {p.t}
          </button>
        ))}
      </div>
      <div className="tools">
        <button className="tool" type="button" onClick={onSound}>
          {ico('sound')}
          {SHEET_COPY.sound}
          <span className={`state${sound ? ' on' : ''}`}>{sound ? SHEET_COPY.on : SHEET_COPY.off}</span>
        </button>
        <button className="tool" type="button" onClick={onAuto}>
          {ico('mic')}
          {SHEET_COPY.auto}
          <span className={`state${auto ? ' on' : ''}`}>{auto ? SHEET_COPY.on : SHEET_COPY.off}</span>
        </button>
        <button className="tool" type="button" onClick={onFull}>
          {ico('expand')}
          {SHEET_COPY.full}
        </button>
        <button className="tool" type="button" onClick={onHelp}>
          {ico('help')}
          {SHEET_COPY.helpTool}
        </button>
        <button className="tool" type="button" onClick={onShelf}>
          {ico('home')}
          {SHEET_COPY.shelfTool}
        </button>
        <button className="tool" type="button" onClick={onRepeat}>
          {ico('replay')}
          {SHEET_COPY.repeatTool}
        </button>
      </div>
    </>
  )
}

function StarsSheet({ stars, done }: { stars: number; done: Record<string, boolean> }) {
  const badges = [
    ...BADGES.map((badge) => ({ on: Boolean(done[badge.story]), icon: badge.icon, name: badge.name })),
    { on: stars >= 10, icon: 'star', name: `10 ${SHEET_COPY.starsUnit}` },
    { on: stars >= 25, icon: 'star', name: `25 ${SHEET_COPY.starsUnit}` },
  ]
  return (
    <div className="stars-wrap">
      <div className="stars-big">
        <svg viewBox="0 0 120 124" aria-hidden="true">
          <path
            d="M60 8l12.6 26 28.4 4-20.6 20.2 4.9 28.3L60 73.9 34.7 86.5l4.9-28.3L19 38l28.4-4z"
            fill="#F2C14E"
          />
          <path
            d="M60 30l8 16.5 18 2.5-13 12.8 3.1 18L60 71.6 43.9 79.8l3.1-18-13-12.8 18-2.5z"
            fill="#FFE08A"
          />
        </svg>
      </div>
      <b>
        {stars} {SHEET_COPY.starsUnit}
      </b>
      <p>{SHEET_COPY.starsIntro}</p>
      <div className="badges">
        {badges.map((badge) => (
          <div className={`bdg${badge.on ? ' got' : ''}`} key={badge.name}>
            <div className="bcircle">{ico(badge.icon)}</div>
            {badge.name}
          </div>
        ))}
      </div>
    </div>
  )
}
