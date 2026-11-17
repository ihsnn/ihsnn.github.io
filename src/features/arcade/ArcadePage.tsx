import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../../components/shared/SiteHeader'
import { ARCADE_COPY, STAGE_NAMES } from '../../content/arcade'
import type { ArcadePhase, ArcadeSnapshot } from './game'
import { useArcadeGame } from './useArcadeGame'
import './arcade.css'

const padScore = (value: number, width = 6) => String(value).padStart(width, '0')

const ACTION_LABELS: Record<ArcadePhase, string> = {
  menu: ARCADE_COPY.actionStart,
  gameover: ARCADE_COPY.actionStart,
  ready: ARCADE_COPY.actionLaunch,
  paused: ARCADE_COPY.actionResume,
  playing: ARCADE_COPY.actionWait,
  levelclear: ARCADE_COPY.actionWait,
}

const actionLabel = (phase: ArcadePhase): string => ACTION_LABELS[phase]

const actionDisabled = (phase: ArcadePhase) =>
  phase === 'playing' || phase === 'levelclear'

interface OverlayProps {
  snapshot: ArcadeSnapshot
  onPrimary: () => void
}

/** The coin-op screens: menu, pause, stage clear, game over. */
function ArcadeOverlay({ snapshot, onPrimary }: OverlayProps) {
  if (snapshot.phase === 'menu') {
    return (
      <div className="arcade-overlay">
        <p className="arcade-overlay__kicker">{ARCADE_COPY.menu.kicker}</p>
        <h2 className="arcade-overlay__title">{ARCADE_COPY.menu.heading}</h2>
        <p className="arcade-overlay__blurb">{ARCADE_COPY.menu.blurb}</p>
        <button type="button" className="arcade-overlay__cta" onClick={onPrimary}>
          <span>{ARCADE_COPY.menu.cta}</span>
          <span aria-hidden="true">▶</span>
        </button>
        <p className="arcade-overlay__hint">{ARCADE_COPY.menu.hint}</p>
      </div>
    )
  }

  if (snapshot.phase === 'paused') {
    return (
      <div className="arcade-overlay">
        <p className="arcade-overlay__kicker">{ARCADE_COPY.paused.kicker}</p>
        <h2 className="arcade-overlay__title">{ARCADE_COPY.paused.heading}</h2>
        <p className="arcade-overlay__blurb">{ARCADE_COPY.paused.blurb}</p>
        <button type="button" className="arcade-overlay__cta" onClick={onPrimary}>
          <span>{ARCADE_COPY.paused.cta}</span>
          <span aria-hidden="true">▶</span>
        </button>
        <p className="arcade-overlay__hint">{ARCADE_COPY.paused.hint}</p>
      </div>
    )
  }

  if (snapshot.phase === 'gameover') {
    return (
      <div className="arcade-overlay arcade-overlay--over">
        <p className="arcade-overlay__kicker">{ARCADE_COPY.gameOver.kicker}</p>
        {snapshot.newRecord && (
          <p className="arcade-overlay__record">{ARCADE_COPY.gameOver.record}</p>
        )}
        <h2 className="arcade-overlay__title">{ARCADE_COPY.gameOver.heading}</h2>
        <p className="arcade-overlay__blurb">{ARCADE_COPY.gameOver.blurb}</p>
        <p className="arcade-overlay__score">
          <span>{ARCADE_COPY.gameOver.finalScore}</span>
          <b>{padScore(snapshot.score)}</b>
        </p>
        <button type="button" className="arcade-overlay__cta" onClick={onPrimary}>
          <span>{ARCADE_COPY.gameOver.cta}</span>
          <span aria-hidden="true">▶</span>
        </button>
      </div>
    )
  }

  if (snapshot.phase === 'levelclear') {
    const nextStage = STAGE_NAMES[snapshot.level % STAGE_NAMES.length]
    return (
      <div className="arcade-overlay arcade-overlay--clear">
        <p className="arcade-overlay__kicker">{ARCADE_COPY.levelClear.kicker}</p>
        <h2 className="arcade-overlay__title">
          STAGE {padScore(snapshot.level, 2)} CLEAR
        </h2>
        <p className="arcade-overlay__score">
          <span>{ARCADE_COPY.levelClear.bonus}</span>
          <b>+{100 * snapshot.level}</b>
        </p>
        <p className="arcade-overlay__next">
          {ARCADE_COPY.nextStage} · {nextStage}
        </p>
      </div>
    )
  }

  return null
}

export default function ArcadePage() {
  const {
    canvasRef,
    snapshot,
    muted,
    primary,
    togglePause,
    toggleMuted,
    setDirection,
    canvasHandlers,
    playfieldWidth,
    playfieldHeight,
  } = useArcadeGame()

  const canPause =
    snapshot.phase === 'playing' ||
    snapshot.phase === 'ready' ||
    snapshot.phase === 'paused'

  const announcement =
    snapshot.phase === 'menu'
      ? 'Neon Breaker. Press start to play.'
      : snapshot.phase === 'ready'
        ? `Stage ${snapshot.level}, ${snapshot.stageName}. Press launch to serve.`
        : snapshot.phase === 'paused'
          ? 'Game paused.'
          : snapshot.phase === 'levelclear'
            ? `Stage ${snapshot.level} cleared.`
            : snapshot.phase === 'gameover'
              ? `Game over. Final score ${snapshot.score}.${
                  snapshot.newRecord ? ' New high score.' : ''
                }`
              : ''

  const hold = (direction: -1 | 1) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      setDirection(direction)
    },
    onPointerUp: () => setDirection(0),
    onPointerCancel: () => setDirection(0),
    onPointerLeave: () => setDirection(0),
    onLostPointerCapture: () => setDirection(0),
    onBlur: () => setDirection(0),
  })

  return (
    <div className="arcade-page">
      <div className="arcade-glow" aria-hidden="true" />
      <div className="arcade-grid" aria-hidden="true" />

      <div className="app-shell arcade-shell">
        <SiteHeader
          eyebrow={ARCADE_COPY.eyebrow}
          title={
            <>
              {ARCADE_COPY.titleTop} <em>{ARCADE_COPY.titleBottom}</em>
            </>
          }
          backTo={ARCADE_COPY.backToShelf}
          led="yellow"
          size="md"
        />

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>

        <div className="arcade-layout">
          <section className="cabinet" aria-label="Neon Breaker arcade cabinet">
            <div className="cabinet__marquee" aria-hidden="true">
              <p className="cabinet__logo">
                <span>{ARCADE_COPY.marqueeTop}</span>
                <span>{ARCADE_COPY.marqueeBottom}</span>
              </p>
              <p className="cabinet__marquee-sub">{ARCADE_COPY.marqueeSub}</p>
            </div>

            <div className="cabinet__body">
              <div className="cabinet__bezel">
                <div className="arcade-hud">
                  <div className="arcade-hud__stat">
                    <span className="arcade-hud__label">{ARCADE_COPY.hud.score}</span>
                    <b>{padScore(snapshot.score)}</b>
                  </div>
                  <div className="arcade-hud__stat arcade-hud__stat--high">
                    <span className="arcade-hud__label">{ARCADE_COPY.hud.high}</span>
                    <b>{padScore(snapshot.highScore)}</b>
                  </div>
                  <div className="arcade-hud__stat arcade-hud__stat--stage">
                    <span className="arcade-hud__label">{ARCADE_COPY.hud.stage}</span>
                    <b>{padScore(snapshot.level, 2)}</b>
                  </div>
                  <div className="arcade-hud__stat arcade-hud__stat--lives">
                    <span className="arcade-hud__label">{ARCADE_COPY.hud.lives}</span>
                    <span className="arcade-hud__pips" aria-hidden="true">
                      {Array.from({ length: 5 }, (_, index) => (
                        <i
                          key={index}
                          className={index < snapshot.lives ? 'is-on' : ''}
                        />
                      ))}
                    </span>
                    <span className="sr-only">{snapshot.lives} lives</span>
                  </div>
                  <span
                    className={`arcade-hud__combo${
                      snapshot.combo > 1 ? ' is-hot' : ''
                    }`}
                    aria-hidden="true"
                  >
                    {ARCADE_COPY.hud.combo} <b>×{Math.max(1, snapshot.combo)}</b>
                  </span>
                  <div className="arcade-hud__actions">
                    <button
                      type="button"
                      className="arcade-hud__button"
                      onClick={togglePause}
                      disabled={!canPause}
                      aria-label={
                        snapshot.phase === 'paused'
                          ? ARCADE_COPY.resumeAction
                          : ARCADE_COPY.pauseAction
                      }
                      title={
                        snapshot.phase === 'paused'
                          ? ARCADE_COPY.resumeAction
                          : ARCADE_COPY.pauseAction
                      }
                    >
                      <span aria-hidden="true">
                        {snapshot.phase === 'paused' ? '▶' : 'Ⅱ'}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`arcade-hud__button${
                        muted ? ' is-muted' : ''
                      }`}
                      onClick={toggleMuted}
                      aria-pressed={muted}
                      aria-label={muted ? ARCADE_COPY.soundOff : ARCADE_COPY.soundOn}
                      title={muted ? ARCADE_COPY.soundOff : ARCADE_COPY.soundOn}
                    >
                      <span aria-hidden="true">{muted ? '✕' : '♪'}</span>
                    </button>
                  </div>
                </div>

                <div className="arcade-screen">
                  <canvas
                    ref={canvasRef}
                    className="arcade-screen__canvas"
                    width={playfieldWidth}
                    height={playfieldHeight}
                    role="img"
                    aria-label="Neon Breaker playfield. Use arrow keys or drag to move the paddle, and space to launch."
                    {...canvasHandlers}
                  />
                  <div className="arcade-screen__scanlines" aria-hidden="true" />
                  <div className="arcade-screen__glare" aria-hidden="true" />
                  <ArcadeOverlay snapshot={snapshot} onPrimary={primary} />
                  {snapshot.phase === 'ready' && (
                    <p className="arcade-screen__hint">{ARCADE_COPY.readyHint}</p>
                  )}
                </div>

                <div className="cabinet__bezel-foot">
                  <span>{ARCADE_COPY.cabinetModel}</span>
                  <span className="cabinet__live">
                    <i aria-hidden="true" />
                    {ARCADE_COPY.bezelStatus}
                  </span>
                </div>
              </div>

              <div className="cabinet__deck">
                <div className="cabinet__stick" aria-hidden="true">
                  <span />
                </div>

                <div className="cabinet__pad">
                  <span className="cabinet__deck-label">{ARCADE_COPY.deckMove}</span>
                  <div className="cabinet__pad-buttons">
                    <button
                      type="button"
                      className="arcade-key"
                      aria-label="Hold to move the paddle left"
                      {...hold(-1)}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      className="arcade-key"
                      aria-label="Hold to move the paddle right"
                      {...hold(1)}
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <div className="cabinet__action">
                  <span className="cabinet__deck-label">{ARCADE_COPY.deckAction}</span>
                  <button
                    type="button"
                    className="cabinet__fire"
                    onClick={primary}
                    disabled={actionDisabled(snapshot.phase)}
                  >
                    {actionLabel(snapshot.phase)}
                  </button>
                </div>
              </div>
            </div>

            <div className="cabinet__base">
              <div className="cabinet__coin-door" aria-hidden="true">
                <span className="cabinet__coin-slot" />
                <span className="cabinet__coin-slot" />
                <small>{ARCADE_COPY.credit}</small>
              </div>
              <p className="cabinet__plate">{ARCADE_COPY.cabinetPlate}</p>
              <span className="cabinet__vent" aria-hidden="true" />
            </div>
          </section>

          <aside className="arcade-side">
            <section className="arcade-panel">
              <p className="arcade-panel__index">01 — controls</p>
              <h2 className="arcade-panel__title">{ARCADE_COPY.controlsTitle}</h2>
              <p className="arcade-panel__lede">{ARCADE_COPY.controlsLead}</p>
              <dl className="arcade-keys">
                {ARCADE_COPY.controls.map((row) => (
                  <div className="arcade-keys__row" key={row.action}>
                    <dt>{row.action}</dt>
                    <dd>{row.keys}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="arcade-panel">
              <p className="arcade-panel__index">02 — scoring</p>
              <h2 className="arcade-panel__title">{ARCADE_COPY.scoringTitle}</h2>
              <ul className="arcade-score">
                {ARCADE_COPY.scoring.map((row) => (
                  <li key={row.label}>
                    <span>{row.label}</span>
                    <b>{row.value}</b>
                  </li>
                ))}
              </ul>
            </section>

            <section className="arcade-panel">
              <p className="arcade-panel__index">03 — cabinet notes</p>
              <h2 className="arcade-panel__title">{ARCADE_COPY.notesTitle}</h2>
              <ul className="arcade-notes">
                {ARCADE_COPY.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>

            <p className="arcade-warning">⚠ {ARCADE_COPY.flashingNote}</p>
          </aside>
        </div>

        <footer className="arcade-footer">
          <p>{ARCADE_COPY.footer}</p>
          <Link to={ARCADE_COPY.backToShelf}>← Back to the shelf</Link>
        </footer>
      </div>
    </div>
  )
}
