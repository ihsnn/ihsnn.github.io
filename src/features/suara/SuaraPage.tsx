import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../../components/shared/SiteHeader'
import {
  CATEGORY_FILTERS,
  QUIZ_LENGTH,
  SOUND_ITEMS,
  SUARA,
  SUARA_NOTES,
  itemById,
  itemsIn,
  type CategoryFilter,
  type SoundId,
} from '../../content/suara'
import FullscreenViewer from './FullscreenViewer'
import QuizPanel from './QuizPanel'
import SoundCard from './SoundCard'
import { prefetchPixelArt } from './pixel'
import { useSuara } from './useSuara'
import type { ArtMode } from './storage'
import './suara.css'

type Tab = 'jelajah' | 'tebak'

function SpeakerIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        className="suara-mute__cone"
        d="M3.5 9.5h4L13 5v14l-5.5-4.5h-4z"
      />
      {off ? (
        <path className="suara-mute__slash" d="M16 9l4.5 6M20.5 9L16 15" />
      ) : (
        <>
          <path className="suara-mute__wave" d="M16 9.5a4 4 0 0 1 0 5" />
          <path className="suara-mute__wave" d="M18.8 7a7.5 7.5 0 0 1 0 10" />
        </>
      )}
    </svg>
  )
}

export default function SuaraPage() {
  const [tab, setTab] = useState<Tab>('jelajah')
  const [filter, setFilter] = useState<CategoryFilter>('semua')
  const [openId, setOpenId] = useState<SoundId | null>(null)
  const deviceRef = useRef<HTMLElement>(null)
  const previousTab = useRef<Tab>('jelajah')

  const {
    muted,
    art,
    playing,
    best,
    play,
    stop,
    toggleMuted,
    setArt,
    blip,
    recordRun,
    prime,
  } = useSuara()

  const items = useMemo(() => itemsIn(filter), [filter])
  const openItem = openId ? itemById(openId) : undefined

  // Warm the pixel cache after the first paint: twenty 64 × 64 rasters, one at
  // a time, so the mode toggle has nothing to wait for.
  useEffect(() => {
    const id = window.setTimeout(() => {
      prefetchPixelArt(SOUND_ITEMS.map((item) => item.src))
    }, 450)
    return () => window.clearTimeout(id)
  }, [])

  // Changing mode is a jump to a different part of the page; bring the device
  // back to the top so the new view starts at its header, not mid-scroll.
  useEffect(() => {
    if (previousTab.current === tab) return
    previousTab.current = tab
    const node = deviceRef.current
    if (!node) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
  }, [tab])

  // The viewer steps through whatever shelf is on screen; `itemById` is only
  // ever called with a catalogue id, never with a URL.
  const gallery = openItem
    ? items.some((item) => item.id === openItem.id)
      ? items
      : SOUND_ITEMS
    : SOUND_ITEMS
  const openIndex = openItem
    ? Math.max(
        0,
        gallery.findIndex((item) => item.id === openItem.id),
      )
    : 0

  const step = (delta: number) => {
    if (!openItem) return
    const next = gallery[(openIndex + delta + gallery.length) % gallery.length]
    if (next) {
      setOpenId(next.id)
      blip('tap')
    }
  }

  const openViewer = (id: SoundId) => {
    blip('tap')
    setOpenId(id)
  }

  const playingName = playing ? itemById(playing)?.name : null

  const chooseTab = (next: Tab) => {
    if (next === tab) return
    // Unlock the speaker inside the click so the quiz's first round can play
    // its sound without waiting for another gesture.
    prime()
    stop()
    setTab(next)
    blip('tap')
  }

  return (
    <div className="suara-page">
      <div className="suara-halo" aria-hidden="true" />

      <div className="suara-shell">
        <SiteHeader
          eyebrow={SUARA.eyebrow}
          title={
            <>
              {SUARA.titleTop} <em>{SUARA.titleBottom}</em>
            </>
          }
          backTo={SUARA.backToShelf}
          led="yellow"
          size="md"
        />

        <p className="sr-only" role="status" aria-live="polite">
          {tab === 'jelajah' && playingName ? `Memutar suara ${playingName}.` : ''}
        </p>

        <section className="suara-hero">
          <p className="suara-hero__kicker">
            <span aria-hidden="true">▰</span> {SUARA.kicker}
          </p>
          <h2 className="suara-hero__title">{SUARA.headline}</h2>
          <p className="suara-hero__blurb">{SUARA.blurb}</p>
          <ul className="suara-badges">
            {SUARA.badges.map((badge) => (
              <li key={badge.label}>
                <span>{badge.label}</span>
                <b>{badge.value}</b>
              </li>
            ))}
          </ul>
        </section>

        <main className="suara-device" ref={deviceRef}>
          <div className="suara-device__bar">
            <p className="suara-brand">
              <span>{SUARA.brand}</span>
              <em>{SUARA.brandMeta}</em>
            </p>

            <div className="suara-device__status">
              <span
                className={`suara-led${playing ? ' is-live' : ''}${muted ? ' is-muted' : ''}`}
                aria-hidden="true"
              />
              <button
                type="button"
                className={`suara-mute${muted ? ' is-muted' : ''}`}
                onClick={toggleMuted}
                aria-pressed={muted}
                aria-label={muted ? SUARA.soundOff : SUARA.soundOn}
                title={muted ? SUARA.soundOff : SUARA.soundOn}
              >
                <SpeakerIcon off={muted} />
              </button>
            </div>
          </div>

          <div className="suara-tabs" role="group" aria-label={SUARA.tabsLabel}>
            <button
              type="button"
              className={`suara-tab${tab === 'jelajah' ? ' is-active' : ''}`}
              aria-pressed={tab === 'jelajah'}
              onClick={() => chooseTab('jelajah')}
            >
              <span className="suara-tab__label">{SUARA.tabExplore}</span>
              <span className="suara-tab__hint">{SUARA.tabExploreHint}</span>
            </button>
            <button
              type="button"
              className={`suara-tab${tab === 'tebak' ? ' is-active' : ''}`}
              aria-pressed={tab === 'tebak'}
              onClick={() => chooseTab('tebak')}
            >
              <span className="suara-tab__label">{SUARA.tabQuiz}</span>
              <span className="suara-tab__hint">{SUARA.tabQuizHint}</span>
            </button>
          </div>

          <div className="suara-toolbar">
            <div
              className="suara-filters"
              role="group"
              aria-label={SUARA.filterLegend}
            >
              {CATEGORY_FILTERS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`suara-chip${filter === entry.id ? ' is-active' : ''}`}
                  aria-pressed={filter === entry.id}
                  onClick={() => {
                    setFilter(entry.id)
                    blip('tap')
                  }}
                >
                  {entry.label}
                  <b>{entry.count}</b>
                </button>
              ))}
            </div>

            <div className="suara-artm">
              <span className="suara-artm__label" id="suara-artm-label">
                {SUARA.artLegend}
              </span>
              <div
                className="suara-artm__switch"
                role="group"
                aria-labelledby="suara-artm-label"
              >
                {(['pixel', 'real'] as const).map((value: ArtMode) => (
                  <button
                    key={value}
                    type="button"
                    className={`suara-artm__button${
                      art === value ? ' is-active' : ''
                    }`}
                    aria-pressed={art === value}
                    aria-label={SUARA.artAria(
                      value === 'pixel' ? SUARA.artPixel : SUARA.artReal,
                    )}
                    onClick={() => {
                      setArt(value)
                      blip('tap')
                    }}
                  >
                    {value === 'pixel' ? SUARA.artPixel : SUARA.artReal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="suara-body">
            {tab === 'jelajah' ? (
              <section
                className="suara-explore"
                aria-labelledby="suara-explore-title"
              >
                <header className="suara-explore__head">
                  <h2 id="suara-explore-title">{SUARA.exploreTitle}</h2>
                  <p>{SUARA.exploreHint}</p>
                </header>

                {items.length === 0 ? (
                  <p className="suara-empty">{SUARA.emptyTitle}</p>
                ) : (
                  <div className="suara-grid">
                    {items.map((item) => (
                      <SoundCard
                        key={item.id}
                        item={item}
                        mode={art}
                        playing={playing === item.id}
                        onPlay={() => play(item.id)}
                        onOpen={() => openViewer(item.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <QuizPanel
                key={filter}
                filter={filter}
                art={art}
                playing={playing}
                play={play}
                stop={stop}
                blip={blip}
                best={best}
                recordRun={recordRun}
                onExplore={() => chooseTab('jelajah')}
              />
            )}
          </div>

          <p className="suara-device__reserve">
            {tab === 'tebak'
              ? `${QUIZ_LENGTH} pertanyaan maksimum per ronde · nilai disimpan di perangkat ini`
              : `${items.length} dari ${SOUND_ITEMS.length} suara ditampilkan`}
          </p>
        </main>

        <section className="suara-notes" aria-labelledby="suara-notes-title">
          <header className="suara-notes__head">
            <p>MANUAL</p>
            <h2 id="suara-notes-title">{SUARA_NOTES.title}</h2>
          </header>
          <ul>
            {SUARA_NOTES.rows.map((row) => (
              <li key={row}>
                <span aria-hidden="true">▣</span>
                {row}
              </li>
            ))}
          </ul>
        </section>

        <footer className="suara-footer">
          <p>{SUARA_NOTES.footer}</p>
          <Link to={SUARA.backToShelf}>{SUARA_NOTES.footerShelf}</Link>
        </footer>
      </div>

      {openItem && (
        <FullscreenViewer
          item={openItem}
          mode={art}
          onMode={setArt}
          playing={playing === openItem.id}
          onPlay={() => play(openItem.id)}
          onClose={() => setOpenId(null)}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          index={openIndex}
          total={gallery.length}
        />
      )}
    </div>
  )
}
