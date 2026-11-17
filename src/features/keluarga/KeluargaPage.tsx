import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../app/routes'
import SiteHeader from '../../components/shared/SiteHeader'
import {
  COMPLETE,
  CONTROLS,
  FINAL_LINES,
  FINAL_PROMPT,
  FIXED_CHARACTER,
  GAME,
  INTRO_LINES,
  OBJECTIVE,
  PAUSE,
  POST_COMPLETE_WINDOW,
  PROMPTS,
  SIDE_COPY,
  THOUGHTS,
  TITLE_SCREEN,
} from '../../content/keluarga'
import MirrorScene from './MirrorScene'
import { drawRoomBackdrop } from './game'
import RoomView, { type RoomHandle } from './RoomView'
import { readSave, writeSave } from './save'
import type {
  DialogueState,
  Direction,
  GamePhase,
  RoomObject,
  StorySave,
  ThoughtOption,
} from './types'
import './keluarga.css'

const isTypingTarget = (target: EventTarget | null) => {
  const element = target as HTMLElement | null
  if (!element) return false
  return (
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.tagName === 'SELECT' ||
    element.isContentEditable
  )
}

const isControlTarget = (target: EventTarget | null) => {
  const element = target as HTMLElement | null
  return Boolean(
    element?.closest('button, a, input, textarea, select, summary'),
  )
}

function MemoryDots({
  count,
  goal,
  label,
}: {
  count: number
  goal: number
  label?: string
}) {
  return (
    <span
      className="kgb-dots"
      aria-label={label ?? `${count} dari ${goal} kenangan`}
    >
      {Array.from({ length: goal }, (_, index) => (
        <i key={index} className={index < count ? 'is-on' : ''} />
      ))}
    </span>
  )
}

function RoomBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    drawRoomBackdrop(ctx, 0)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="kgb-room kgb-room--backdrop"
      width={160}
      height={144}
      aria-hidden="true"
    />
  )
}

function TitleScreen({
  hasSave,
  completed,
  onNew,
  onContinue,
}: {
  hasSave: boolean
  completed: boolean
  onNew: () => void
  onContinue: () => void
}) {
  return (
    <div className="kgb-title">
      <RoomBackdrop />
      <div className="kgb-title__shade" aria-hidden="true" />
      <div className="kgb-title__content">
        <p className="kgb-kicker">{TITLE_SCREEN.kicker}</p>
        <h2 className="kgb-title__name">
          <span>{GAME.titleTop}</span>
          <span>{GAME.titleBottom}</span>
        </h2>
        <p className="kgb-title__chapter">
          {GAME.chapter} · {GAME.chapterTitle}
        </p>
        <p className="kgb-title__tagline">{GAME.tagline}</p>
        <div className="kgb-title__menu">
          <button type="button" className="kgb-btn kgb-btn--gold" onClick={onNew}>
            {TITLE_SCREEN.start}
          </button>
          {hasSave && (
            <button
              type="button"
              className="kgb-btn kgb-btn--ghost"
              onClick={onContinue}
            >
              {TITLE_SCREEN.continue}
            </button>
          )}
        </div>
        {completed && (
          <p className="kgb-title__completed">{TITLE_SCREEN.completed}</p>
        )}
        <p className="kgb-title__foot">{TITLE_SCREEN.footnote}</p>
      </div>
    </div>
  )
}

function DialogueBox({
  dialogue,
  onAdvance,
}: {
  dialogue: DialogueState
  onAdvance: () => void
}) {
  const last = dialogue.index >= dialogue.lines.length - 1
  const nextLabel = last
    ? dialogue.next === 'choice'
      ? 'pilih'
      : 'tutup'
    : PROMPTS.continue

  return (
    <div className="kgb-dialogue" onClick={onAdvance}>
      <p className="kgb-dialogue__speaker">{dialogue.speaker}</p>
      <p className="kgb-dialogue__text" aria-live="polite">
        {dialogue.lines[dialogue.index]}
      </p>
      <button
        type="button"
        className="kgb-dialogue__next"
        onClick={(event) => {
          event.stopPropagation()
          onAdvance()
        }}
      >
        <span className="kgb-key">A</span> {nextLabel}
      </button>
    </div>
  )
}

function ChoicePanel({ onChoose }: { onChoose: (option: ThoughtOption) => void }) {
  return (
    <div
      className="kgb-panel-overlay kgb-choice"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kgb-choice-title"
    >
      <p className="kgb-kicker">
        {GAME.chapter} · {GAME.chapterTitle}
      </p>
      <h2 id="kgb-choice-title" className="kgb-choice__title">
        {FINAL_PROMPT}
      </h2>
      <div className="kgb-choice__options">
        {THOUGHTS.map((thought, index) => (
          <button
            key={thought.id}
            type="button"
            className="kgb-choice__option"
            onClick={() => onChoose(thought)}
          >
            <span className="kgb-choice__index">0{index + 1}</span>
            {thought.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function CompleteCard({
  thought,
  onStay,
  onTitle,
}: {
  thought: string | null
  onStay: () => void
  onTitle: () => void
}) {
  return (
    <div
      className="kgb-panel-overlay kgb-complete"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kgb-complete-title"
    >
      <p className="kgb-kicker">{COMPLETE.kicker}</p>
      <h2 id="kgb-complete-title" className="kgb-overlay-title">
        {COMPLETE.heading}
      </h2>
      <p className="kgb-overlay-note">{COMPLETE.sub}</p>
      {thought && (
        <div className="kgb-complete__thought">
          <span>{COMPLETE.thoughtLabel}</span>
          <p>{thought}</p>
        </div>
      )}
      <div className="kgb-complete__next">
        <span>{GAME.nextChapter}</span>
        <b>{GAME.nextSoon}</b>
      </div>
      <div className="kgb-complete__actions">
        <button type="button" className="kgb-btn kgb-btn--gold" onClick={onStay}>
          {COMPLETE.stay}
        </button>
        <button type="button" className="kgb-btn kgb-btn--ghost" onClick={onTitle}>
          {COMPLETE.toTitle}
        </button>
      </div>
    </div>
  )
}

function PauseMenu({
  onResume,
  onTitle,
}: {
  onResume: () => void
  onTitle: () => void
}) {
  return (
    <div
      className="kgb-panel-overlay kgb-pause"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kgb-pause-title"
    >
      <p className="kgb-kicker">{GAME.chapter}</p>
      <h2 id="kgb-pause-title" className="kgb-overlay-title">
        {PAUSE.heading}
      </h2>
      <p className="kgb-overlay-note">{PAUSE.note}</p>
      <div className="kgb-complete__actions">
        <button type="button" className="kgb-btn kgb-btn--gold" onClick={onResume}>
          {PAUSE.resume}
        </button>
        <button type="button" className="kgb-btn kgb-btn--ghost" onClick={onTitle}>
          {PAUSE.toTitle}
        </button>
      </div>
    </div>
  )
}

function ControlList() {
  return (
    <dl className="kgb-control-list">
      {CONTROLS.map((row) => (
        <div key={row.action}>
          <dt>{row.action}</dt>
          <dd>{row.keys}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Cartridge 04: a small GBC-style story about the room before the family.
 * The page owns progression and saves; RoomView owns the tile simulation.
 */
export default function KeluargaPage() {
  const [phase, setPhase] = useState<GamePhase>('title')
  const [save, setSave] = useState<StorySave | null>(() => readSave())
  const [mirrorOpen, setMirrorOpen] = useState(false)
  const [dialogue, setDialogue] = useState<DialogueState | null>(null)
  const [choiceOpen, setChoiceOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [nearby, setNearby] = useState<RoomObject | null>(null)

  const roomRef = useRef<RoomHandle | null>(null)
  const keyHandlerRef = useRef<(event: KeyboardEvent) => void>(() => undefined)

  const memoryCount = Math.min(save?.examined.length ?? 0, GAME.memoryGoal)
  const chapterComplete = save?.chapterComplete ?? false
  const thought = save?.thought ?? null
  const paused =
    mirrorOpen || Boolean(dialogue) || choiceOpen || menuOpen || showComplete
  const aDisabled =
    phase !== 'play' || choiceOpen || menuOpen || showComplete
  const canGoBack =
    menuOpen || showComplete || Boolean(dialogue && dialogue.index > 0)
  const bDisabled = phase !== 'play' || !canGoBack
  const windowReady =
    Boolean(nearby?.id.startsWith('window')) &&
    memoryCount >= GAME.memoryGoal &&
    !chapterComplete

  function updateSave(patch: Partial<StorySave>) {
    setSave((previous) => {
      if (!previous) return previous
      const next = { ...previous, ...patch, updatedAt: Date.now() }
      writeSave(next)
      return next
    })
  }

  function persistPlayer() {
    const player = roomRef.current?.getPlayer()
    if (player) updateSave({ player })
  }

  function startNew() {
    const nextSave: StorySave = {
      version: 1,
      character: FIXED_CHARACTER,
      examined: [],
      thought: null,
      chapterComplete: false,
      player: null,
      updatedAt: Date.now(),
    }
    writeSave(nextSave)
    setSave(nextSave)
    setPhase('play')
    setMirrorOpen(true)
    setDialogue(null)
    setChoiceOpen(false)
    setMenuOpen(false)
    setShowComplete(false)
    setNearby(null)
  }

  function continueGame() {
    if (!save) return
    setPhase('play')
    setMirrorOpen(!save.chapterComplete && save.examined.length === 0)
    setShowComplete(save.chapterComplete)
    setDialogue(null)
    setChoiceOpen(false)
    setMenuOpen(false)
    setNearby(null)
  }

  function openEyes() {
    setMirrorOpen(false)
    setDialogue({
      speaker: 'AKU',
      lines: INTRO_LINES,
      index: 0,
      next: null,
    })
  }

  function advanceDialogue() {
    if (!dialogue) return
    if (dialogue.index < dialogue.lines.length - 1) {
      setDialogue({ ...dialogue, index: dialogue.index + 1 })
      return
    }
    const next = dialogue.next
    setDialogue(null)
    if (next === 'choice') setChoiceOpen(true)
  }

  function interactWith(object: RoomObject) {
    if (!save || object.lines.length === 0) return
    const player = roomRef.current?.getPlayer() ?? null

    if (object.id.startsWith('window')) {
      if (save.chapterComplete) {
        setDialogue({
          speaker: 'AKU',
          lines: POST_COMPLETE_WINDOW,
          index: 0,
          next: null,
        })
        return
      }
      if (save.examined.length >= GAME.memoryGoal) {
        setDialogue({
          speaker: 'AKU',
          lines: FINAL_LINES,
          index: 0,
          next: 'choice',
        })
        return
      }
    }

    if (object.memory && !save.examined.includes(object.id)) {
      updateSave({
        examined: [...save.examined, object.id],
        player,
      })
    }

    setDialogue({
      speaker: 'AKU',
      lines: object.lines,
      index: 0,
      next: null,
    })
  }

  function primaryAction() {
    if (phase !== 'play') return
    if (mirrorOpen) {
      openEyes()
      return
    }
    if (menuOpen || choiceOpen || showComplete) return
    if (dialogue) {
      advanceDialogue()
      return
    }
    const object = roomRef.current?.getFacingObject()
    if (object) interactWith(object)
  }

  function chooseThought(option: ThoughtOption) {
    const player = roomRef.current?.getPlayer() ?? null
    updateSave({
      thought: option.result,
      chapterComplete: true,
      player,
    })
    setChoiceOpen(false)
    setShowComplete(true)
  }

  function openMenu() {
    if (phase !== 'play' || paused) return
    persistPlayer()
    setMenuOpen(true)
  }

  function handleB() {
    if (phase !== 'play') return
    if (menuOpen) {
      setMenuOpen(false)
      return
    }
    if (showComplete) {
      setShowComplete(false)
      return
    }
    if (dialogue && dialogue.index > 0) {
      setDialogue({ ...dialogue, index: dialogue.index - 1 })
    }
  }

  function stayInRoom() {
    persistPlayer()
    setShowComplete(false)
  }

  function returnToTitle() {
    if (phase === 'play') persistPlayer()
    setPhase('title')
    setDialogue(null)
    setChoiceOpen(false)
    setMenuOpen(false)
    setMirrorOpen(false)
    setShowComplete(false)
    setNearby(null)
  }

  function nudge(direction: Direction) {
    roomRef.current?.setDirection(direction)
    window.setTimeout(() => roomRef.current?.setDirection(null), 150)
  }

  function directionHandlers(direction: Direction) {
    return {
      onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        roomRef.current?.setDirection(direction)
      },
      onPointerUp: () => roomRef.current?.setDirection(null),
      onPointerCancel: () => roomRef.current?.setDirection(null),
      onLostPointerCapture: () => roomRef.current?.setDirection(null),
      onClick: (event: ReactMouseEvent<HTMLButtonElement>) => {
        if (event.detail === 0) nudge(direction)
      },
    }
  }

  keyHandlerRef.current = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (isTypingTarget(event.target)) return

    if (event.code === 'Escape') {
      if (phase !== 'play') return
      if (menuOpen) {
        event.preventDefault()
        setMenuOpen(false)
        return
      }
      if (mirrorOpen || dialogue || choiceOpen || showComplete) return
      event.preventDefault()
      openMenu()
      return
    }

    if (event.code === 'KeyB') {
      event.preventDefault()
      handleB()
      return
    }

    if (event.code !== 'Space' && event.code !== 'Enter') return
    if (event.repeat) return
    if (isControlTarget(event.target)) return
    if (phase !== 'play') return
    if (menuOpen || choiceOpen || showComplete) return
    event.preventDefault()
    if (dialogue) advanceDialogue()
    else primaryAction()
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => keyHandlerRef.current(event)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="kgb-page">
      <div className="kgb-glow" aria-hidden="true" />
      <div className="kgb-shell">
        <SiteHeader
          eyebrow={GAME.eyebrow}
          title={
            <>
              <span className="kgb-header-title__top">{GAME.titleTop}</span>{' '}
              <em className="kgb-header-title__bottom">{GAME.titleBottom}</em>
            </>
          }
          backTo={ROUTES.home}
          led="yellow"
          size="md"
        />

        <main className="kgb-layout">
          <section className="kgb-console" aria-label={GAME.title}>
            <div className="kgb-console__top">
              <span className="kgb-console__brand">{GAME.title}</span>
              <span className="kgb-console__chapter">{GAME.chapter}</span>
            </div>

            <div className="kgb-bezel">
              <div className="kgb-screen">
                {phase === 'title' && (
                  <TitleScreen
                    hasSave={Boolean(save)}
                    completed={chapterComplete}
                    onNew={startNew}
                    onContinue={continueGame}
                  />
                )}

                {phase === 'play' && (
                  <>
                    {mirrorOpen ? (
                      <MirrorScene onContinue={openEyes} />
                    ) : (
                      <RoomView
                        character={save?.character ?? FIXED_CHARACTER}
                        paused={paused}
                        initialPlayer={save?.player ?? null}
                        onNearby={setNearby}
                        handleRef={roomRef}
                      />
                    )}

                    {!mirrorOpen && dialogue && !choiceOpen && !showComplete && (
                      <DialogueBox
                        dialogue={dialogue}
                        onAdvance={advanceDialogue}
                      />
                    )}
                    {!mirrorOpen && choiceOpen && (
                      <ChoicePanel onChoose={chooseThought} />
                    )}
                    {!mirrorOpen && showComplete && (
                      <CompleteCard
                        thought={thought}
                        onStay={stayInRoom}
                        onTitle={returnToTitle}
                      />
                    )}
                    {!mirrorOpen && menuOpen && (
                      <PauseMenu
                        onResume={() => setMenuOpen(false)}
                        onTitle={returnToTitle}
                      />
                    )}
                    {!mirrorOpen && !paused && !chapterComplete && (
                      <p className="kgb-objective" aria-live="polite">
                        <span>{OBJECTIVE.label}</span>
                        {memoryCount < GAME.memoryGoal
                          ? `Periksa ${GAME.memoryGoal - memoryCount} ${OBJECTIVE.remaining}. ${OBJECTIVE.inspect}`
                          : OBJECTIVE.ready}
                      </p>
                    )}
                    {!mirrorOpen && !paused && nearby && (
                      <div className="kgb-nearby" aria-live="polite">
                        <span className="kgb-key">A</span>
                        <span>{nearby.label}</span>
                        {windowReady && <em>{PROMPTS.windowReady}</em>}
                      </div>
                    )}
                  </>
                )}

                <div className="kgb-screen__fx" aria-hidden="true" />
              </div>
              <div className="kgb-bezel__foot">
                <span>160 × 144 · COLOR</span>
                <span className="kgb-bezel__live">
                  <i aria-hidden="true" />
                  LIVE
                </span>
              </div>
            </div>

            <div className="kgb-controls">
              <div className="kgb-dpad" aria-label="Tombol arah">
                <button
                  type="button"
                  className="kgb-dpad__up"
                  aria-label="Ke atas"
                  disabled={phase !== 'play' || paused}
                  {...directionHandlers('up')}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="kgb-dpad__left"
                  aria-label="Ke kiri"
                  disabled={phase !== 'play' || paused}
                  {...directionHandlers('left')}
                >
                  ◀
                </button>
                <span className="kgb-dpad__center" aria-hidden="true" />
                <button
                  type="button"
                  className="kgb-dpad__right"
                  aria-label="Ke kanan"
                  disabled={phase !== 'play' || paused}
                  {...directionHandlers('right')}
                >
                  ▶
                </button>
                <button
                  type="button"
                  className="kgb-dpad__down"
                  aria-label="Ke bawah"
                  disabled={phase !== 'play' || paused}
                  {...directionHandlers('down')}
                >
                  ▼
                </button>
              </div>

              {phase === 'play' && (
                <div className="kgb-controls__note" aria-hidden="true">
                  <span>
                    <b>A</b> PERIKSA / LANJUT
                  </span>
                  <span>
                    <b>B</b> KEMBALI
                  </span>
                </div>
              )}

              <div className="kgb-ba-wrap">
                <div className="kgb-btn-column">
                  <button
                    type="button"
                    className="kgb-btn-b"
                    onClick={handleB}
                    disabled={bDisabled}
                    aria-label="B — kembali"
                  >
                    B
                  </button>
                  <span className="kgb-control-label">KEMBALI</span>
                </div>
                <div className="kgb-btn-column">
                  <button
                    type="button"
                    className="kgb-btn-a"
                    onClick={primaryAction}
                    disabled={aDisabled}
                    aria-label="A — periksa, lanjut, atau buka mata"
                  >
                    A
                  </button>
                  <span className="kgb-control-label">
                    {mirrorOpen || dialogue ? 'LANJUT' : 'PERIKSA'}
                  </span>
                </div>
              </div>
            </div>

            <div className="kgb-console__foot">
              <span className="kgb-power">
                <i aria-hidden="true" />
                POWER
              </span>
              <span className="kgb-foot__readout">
                {phase === 'play' ? (
                  <>
                    <span>{GAME.memoryLabel}</span>
                    <MemoryDots
                      count={memoryCount}
                      goal={GAME.memoryGoal}
                      label={`${memoryCount} dari ${GAME.memoryGoal} kenangan`}
                    />
                    <b>
                      {memoryCount}/{GAME.memoryGoal}
                    </b>
                  </>
                ) : (
                  GAME.prototype
                )}
              </span>
              {phase === 'play' && (
                <button
                  type="button"
                  className="kgb-menu"
                  onClick={openMenu}
                  disabled={paused}
                >
                  MENU
                </button>
              )}
            </div>
          </section>

          <aside className="kgb-side">
            {phase === 'title' && (
              <>
                <section className="kgb-card">
                  <p className="kgb-card__label">
                    {GAME.chapter} · {GAME.chapterTitle}
                  </p>
                  <h2 className="kgb-card__title">{SIDE_COPY.title}</h2>
                  <p className="kgb-card__body">{GAME.about}</p>
                  <p className="kgb-card__body kgb-card__body--dim">
                    {SIDE_COPY.titleBody}
                  </p>
                </section>
                <section className="kgb-card">
                  <p className="kgb-card__label">{SIDE_COPY.controlsTitle}</p>
                  <ControlList />
                  <p className="kgb-card__note">{GAME.noFailNote}</p>
                </section>
                <p className="kgb-side-note">{GAME.dedication}</p>
              </>
            )}

            {phase === 'play' && (
              <>
                <section className="kgb-card">
                  <p className="kgb-card__label">
                    {GAME.chapter} · {GAME.chapterTitle}
                  </p>
                  <h2 className="kgb-card__title">
                    {chapterComplete ? SIDE_COPY.complete : SIDE_COPY.play}
                  </h2>
                  <p className="kgb-card__body">
                    {chapterComplete ? SIDE_COPY.completeBody : SIDE_COPY.playBody}
                  </p>
                  {!chapterComplete && (
                    <ol className="kgb-steps">
                      {SIDE_COPY.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  )}
                  <div className="kgb-progress">
                    <span>{SIDE_COPY.progressTitle}</span>
                    <MemoryDots
                      count={memoryCount}
                      goal={GAME.memoryGoal}
                      label={`${memoryCount} dari ${GAME.memoryGoal} kenangan`}
                    />
                    <b>
                      {memoryCount}/{GAME.memoryGoal}
                    </b>
                  </div>
                  {windowReady && (
                    <p className="kgb-ready">{SIDE_COPY.windowReady}</p>
                  )}
                </section>
                <section className="kgb-card">
                  <p className="kgb-card__label">{SIDE_COPY.controlsTitle}</p>
                  <ControlList />
                  <p className="kgb-card__note">{GAME.noFailNote}</p>
                </section>
                {chapterComplete && (
                  <section className="kgb-card kgb-card--next">
                    <p className="kgb-card__label">{GAME.nextChapter}</p>
                    <h2 className="kgb-card__title">{GAME.nextSoon}</h2>
                    <p className="kgb-card__body">{SIDE_COPY.completeBody}</p>
                  </section>
                )}
                <p className="kgb-side-note">{GAME.dedication}</p>
              </>
            )}
          </aside>
        </main>

        <footer className="kgb-footer">
          <p>{GAME.tagline}</p>
          <Link to={ROUTES.home}>← Kembali ke shelf</Link>
        </footer>
      </div>
    </div>
  )
}
