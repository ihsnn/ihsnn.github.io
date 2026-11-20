import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../../components/shared/SiteHeader'
import {
  ANGKUT,
  GARAGE,
  HELP,
  LEVELS,
  NOTES,
  distanceLabel,
  formatNumber,
  levelById,
  nextLevel,
} from '../../content/angkut'
import { VIEW_HEIGHT, VIEW_WIDTH } from './engine'
import { isUnlocked, recordOf } from './save'
import { useAngkut } from './useAngkut'
import type { Upgrades } from './types'
import './angkut.css'

const MAX_UPGRADE = 3

function reasonLabel(reason: string | null): string {
  if (reason === 'fuel') return ANGKUT.reasonFuel
  if (reason === 'flip') return ANGKUT.reasonFlip
  if (reason === 'finish') return ANGKUT.reasonFinish
  return ''
}

export default function AngkutPage() {
  const {
    canvasRef,
    snapshot,
    progress,
    selected,
    muted,
    start,
    next,
    selectLevel,
    buy,
    toggleMuted,
    setGas,
    setBrake,
  } = useAngkut()

  const level = levelById(selected)
  const driving = snapshot.phase === 'driving'
  const ended = snapshot.phase === 'ended'
  const following = nextLevel(level.id)
  const nextUnlocked = following
    ? isUnlocked(progress, following.id)
    : false
  const target = Math.max(1, snapshot.target)
  const progressRatio = Math.min(1, snapshot.distance / target)
  const record = recordOf(progress, selected)
  const canBuy = (part: keyof Upgrades) => {
    const step = progress.upgrades[part]
    const item = GARAGE.find((entry) => entry.id === part)
    return Boolean(item) && step < MAX_UPGRADE && progress.coins >= item!.prices[step]
  }

  const canvasLabel = driving
    ? ANGKUT.canvasDrive(level.name, snapshot.distance, snapshot.speed)
    : ended
      ? ANGKUT.canvasEnded(
          reasonLabel(snapshot.endReason),
          snapshot.distance,
          snapshot.earned,
        )
      : ANGKUT.canvasIdle

  const holdGas = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setGas(true)
  }
  const holdBrake = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setBrake(true)
  }
  const releaseGas = () => setGas(false)
  const releaseBrake = () => setBrake(false)

  const loadTone =
    snapshot.load > 0.66 ? 'high' : snapshot.load > 0.33 ? 'mid' : 'low'

  return (
    <div className="angkut-page">
      <div className="angkut-glow" aria-hidden="true" />
      <div className="angkut-hazard" aria-hidden="true" />

      <div className="angkut-shell">
        <SiteHeader
          eyebrow={ANGKUT.eyebrow}
          title={
            <>
              {ANGKUT.titleTop} <em>{ANGKUT.titleBottom}</em>
            </>
          }
          backTo={ANGKUT.backToShelf}
          led="yellow"
          size="md"
        />

        <p className="sr-only" role="status" aria-live="polite">
          {ended
            ? `${reasonLabel(snapshot.endReason)}. ${distanceLabel(snapshot.distance)}, ${snapshot.earned} koin.`
            : ''}
        </p>

        <section className="angkut-hero">
          <p className="angkut-hero__kicker">
            <span aria-hidden="true">▰</span> {ANGKUT.kicker}
          </p>
          <h2 className="angkut-hero__title">{ANGKUT.headline}</h2>
          <p className="angkut-hero__blurb">{ANGKUT.blurb}</p>
          <ul className="angkut-badges">
            {ANGKUT.badges.map((badge) => (
              <li key={badge.label}>
                <span>{badge.label}</span>
                <b>{badge.value}</b>
              </li>
            ))}
            <li>
              <span>{ANGKUT.garageCoins}</span>
              <b>{formatNumber(progress.coins)}</b>
            </li>
          </ul>
        </section>

        <main className="angkut-layout">
          <div className="angkut-main">
          <div className="angkut-rig">
            <div className="angkut-rig__bar">
              <p className="angkut-brand">
                <span>ANGKUT</span>
                <em>TRUK GUNUNG · CARTRIDGE 10</em>
              </p>
              <div className="angkut-rig__lights">
                <span
                  className={`angkut-led${driving ? ' is-on' : ''}`}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className={`angkut-mute${muted ? ' is-muted' : ''}`}
                  onClick={toggleMuted}
                  aria-pressed={muted}
                  aria-label={muted ? ANGKUT.soundOff : ANGKUT.soundOn}
                  title={muted ? ANGKUT.soundOff : ANGKUT.soundOn}
                >
                  <span aria-hidden="true">{muted ? '✕' : '♪'}</span>
                </button>
              </div>
            </div>

            <div className={`angkut-screen${driving ? "" : " is-idle"}`}>
              <canvas
                ref={canvasRef}
                width={VIEW_WIDTH}
                height={VIEW_HEIGHT}
                className="angkut-canvas"
                role="img"
                aria-label={canvasLabel}
              />
              <span className="angkut-glare" aria-hidden="true" />

              <div className="angkut-hud" aria-hidden="true">
                <div className="angkut-hud__cluster">
                  <div className="angkut-chip">
                    <span>{ANGKUT.statsDistance}</span>
                    <b>{distanceLabel(snapshot.distance)}</b>
                    <i
                      className="angkut-chip__bar"
                      style={{ '--fill': progressRatio } as CSSProperties}
                    />
                  </div>
                  <div className="angkut-chip angkut-chip--target">
                    <span>{ANGKUT.statsTarget}</span>
                    <b>{distanceLabel(target - snapshot.distance)}</b>
                  </div>
                </div>
                <div className="angkut-hud__cluster angkut-hud__cluster--right">
                  <div className="angkut-chip">
                    <span>{ANGKUT.statsCoins}</span>
                    <b>{formatNumber(snapshot.earned)}</b>
                  </div>
                  <div className="angkut-chip">
                    <span>{ANGKUT.statsSpeed}</span>
                    <b>{snapshot.speed} km/j</b>
                  </div>
                </div>
              </div>

              <div className="angkut-gauges" aria-hidden="true">
                <div className="angkut-fuel">
                  <span>{ANGKUT.statsFuel}</span>
                  <i>
                    <b
                      style={{
                        width: `${Math.round(snapshot.fuel * 100)}%`,
                        background:
                          snapshot.fuel < 0.25 ? '#ff6a4d' : undefined,
                      }}
                    />
                  </i>
                </div>
                <div className={`angkut-load is-${loadTone}`}>
                  <span>{ANGKUT.statsLoad}</span>
                  <i>
                    <b style={{ width: `${Math.round(snapshot.load * 100)}%` }} />
                  </i>
                  <em>
                    {snapshot.loadShifted
                      ? ANGKUT.statsLoadShifted
                      : ANGKUT.statsLoadSafe}
                  </em>
                </div>
              </div>

              {snapshot.phase === 'idle' && (
                <div
                  className="angkut-cover"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="angkut-start-title"
                >
                  <p className="angkut-cover__kicker">
                    {ANGKUT.startKicker} · {level.no}
                  </p>
                  <h2 className="angkut-cover__title" id="angkut-start-title">
                    {level.name}
                  </h2>
                  <p className="angkut-cover__cargo">
                    <span>{ANGKUT.cargoLabel}</span> {level.cargo.label}
                  </p>
                  <p className="angkut-cover__text">{level.cargo.trait}</p>
                  <p className="angkut-cover__note">
                    {ANGKUT.targetLabel} {distanceLabel(level.targetM)} ·{' '}
                    {ANGKUT.startNote}
                  </p>
                  <button
                    type="button"
                    className="angkut-cover__cta"
                    onClick={start}
                  >
                    {ANGKUT.start}
                  </button>
                </div>
              )}

              {ended && (
                <div
                  className="angkut-cover angkut-cover--summary"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="angkut-end-title"
                >
                  <p className="angkut-cover__kicker">
                    {reasonLabel(snapshot.endReason)}
                  </p>
                  <h2 className="angkut-cover__title" id="angkut-end-title">
                    {distanceLabel(snapshot.distance)}
                  </h2>
                  <p className="angkut-cover__cargo">
                    {snapshot.endReason === 'finish'
                      ? ANGKUT.summaryCleared
                      : `${ANGKUT.summaryDistance} · ${level.name}`}
                  </p>

                  <dl className="angkut-summary">
                    <div>
                      <dt>{ANGKUT.summaryCoins}</dt>
                      <dd>{formatNumber(snapshot.earned)}</dd>
                    </div>
                    <div>
                      <dt>{ANGKUT.summaryBest}</dt>
                      <dd>{distanceLabel(Math.max(snapshot.bestM, snapshot.distance))}</dd>
                    </div>
                    <div>
                      <dt>{ANGKUT.garageCoins}</dt>
                      <dd>{formatNumber(progress.coins)}</dd>
                    </div>
                  </dl>

                  {snapshot.newRecord && (
                    <p className="angkut-cover__record">
                      {ANGKUT.summaryNew}
                    </p>
                  )}

                  <div className="angkut-cover__actions">
                    <button
                      type="button"
                      className="angkut-cover__cta"
                      onClick={start}
                    >
                      {ANGKUT.again}
                    </button>
                    {following && nextUnlocked && (
                      <button
                        type="button"
                        className="angkut-cover__cta angkut-cover__cta--ghost"
                        onClick={next}
                      >
                        {ANGKUT.next}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="angkut-pedals">
              <button
                type="button"
                className={`angkut-pedal angkut-pedal--brake${
                  driving ? '' : ' is-idle'
                }`}
                onPointerDown={holdBrake}
                onPointerUp={releaseBrake}
                onPointerCancel={releaseBrake}
                onLostPointerCapture={releaseBrake}
                onContextMenu={(event) => event.preventDefault()}
                disabled={!driving}
                aria-label={ANGKUT.pedalBrake}
              >
                <span>{ANGKUT.pedalBrake}</span>
                <em aria-hidden="true">◀</em>
              </button>

              <div className="angkut-plate" aria-hidden="true">
                <span>{level.no}</span>
                <b>{level.cargo.short}</b>
              </div>

              <button
                type="button"
                className={`angkut-pedal angkut-pedal--gas${
                  driving ? '' : ' is-idle'
                }`}
                onPointerDown={holdGas}
                onPointerUp={releaseGas}
                onPointerCancel={releaseGas}
                onLostPointerCapture={releaseGas}
                onContextMenu={(event) => event.preventDefault()}
                disabled={!driving}
                aria-label={ANGKUT.pedalGas}
              >
                <span>{ANGKUT.pedalGas}</span>
                <em aria-hidden="true">▶</em>
              </button>
            </div>

            <p className="angkut-keys-hint">{ANGKUT.keyboardHint}</p>
          </div>

            <section className="angkut-card" aria-labelledby="angkut-help">
              <header className="angkut-card__head">
                <h2 id="angkut-help">{HELP.title}</h2>
                <span>GAS · REM</span>
              </header>
              <ul className="angkut-help">
                {HELP.rows.map((row) => (
                  <li key={row}>
                    <span aria-hidden="true">↳</span>
                    {row}
                  </li>
                ))}
              </ul>
            </section>

          </div>

          <aside className="angkut-side">
            <section className="angkut-card" aria-labelledby="angkut-routes">
              <header className="angkut-card__head">
                <h2 id="angkut-routes">{ANGKUT.selectTitle}</h2>
                <span>
                  {progress.coins > 0 ? formatNumber(progress.coins) : '—'}{' '}
                  {ANGKUT.garageCoins}
                </span>
              </header>

              <ul className="angkut-routes">
                {LEVELS.map((entry) => {
                  const unlocked = isUnlocked(progress, entry.id)
                  const entryRecord = recordOf(progress, entry.id)
                  const active = entry.id === selected
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={`angkut-route${active ? ' is-active' : ''}${
                          unlocked ? '' : ' is-locked'
                        }`}
                        onClick={() => selectLevel(entry.id)}
                        disabled={!unlocked || driving}
                        aria-pressed={active}
                        title={
                          unlocked
                            ? entry.tip
                            : ANGKUT.selectUnlock(levelById(entry.id).name)
                        }
                      >
                        <span className="angkut-route__no">{entry.no}</span>
                        <span className="angkut-route__main">
                          <b>{entry.name}</b>
                          <em>{entry.cargo.label}</em>
                        </span>
                        <span className="angkut-route__meta">
                          {unlocked ? (
                            entryRecord?.cleared ? (
                              <b>{ANGKUT.selectCleared}</b>
                            ) : (
                              <span>
                                {distanceLabel(entryRecord?.bestM ?? 0)}
                              </span>
                            )
                          ) : (
                            <b aria-label={ANGKUT.selectLocked}>🔒</b>
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="angkut-card" aria-labelledby="angkut-cargo">
              <header className="angkut-card__head">
                <h2 id="angkut-cargo">{ANGKUT.cargoLabel}</h2>
                <span>{level.no}</span>
              </header>

              <div className="angkut-cargo">
                <span
                  className="angkut-cargo__swatch"
                  style={{
                    background: level.cargo.color,
                    borderColor: level.cargo.colorDark,
                  }}
                  aria-hidden="true"
                />
                <div>
                  <p className="angkut-cargo__name">{level.cargo.label}</p>
                  <p className="angkut-cargo__trait">{level.cargo.trait}</p>
                </div>
              </div>

              <dl className="angkut-facts">
                <div>
                  <dt>Bobot</dt>
                  <dd>{level.cargo.mass.toFixed(2)}×</dd>
                </div>
                <div>
                  <dt>Tinggi</dt>
                  <dd>{level.cargo.height} px</dd>
                </div>
                <div>
                  <dt>Grip</dt>
                  <dd>{Math.round(level.grip * 100)}%</dd>
                </div>
                <div>
                  <dt>{ANGKUT.statsTarget}</dt>
                  <dd>{distanceLabel(level.targetM)}</dd>
                </div>
              </dl>

              <p className="angkut-card__note">{level.tip}</p>
            </section>

            <section className="angkut-card" aria-labelledby="angkut-garage">
              <header className="angkut-card__head">
                <h2 id="angkut-garage">{ANGKUT.garageTitle}</h2>
                <span>
                  {formatNumber(progress.coins)} {ANGKUT.garageCoins}
                </span>
              </header>

              <ul className="angkut-garage">
                {GARAGE.map((part) => {
                  const step = progress.upgrades[part.id]
                  const maxed = step >= MAX_UPGRADE
                  const price = maxed ? 0 : part.prices[step]
                  return (
                    <li key={part.id}>
                      <div className="angkut-garage__line">
                        <b>{part.name}</b>
                        <span>
                          {maxed ? part.steps[2] : part.steps[step]}
                        </span>
                      </div>
                      <div className="angkut-garage__pips" aria-hidden="true">
                        {[0, 1, 2].map((index) => (
                          <i
                            key={index}
                            className={index < step ? 'is-on' : ''}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        className="angkut-garage__buy"
                        onClick={() => buy(part.id)}
                        disabled={maxed || !canBuy(part.id)}
                      >
                        {maxed
                          ? ANGKUT.garageMax
                          : `${ANGKUT.garageBuy} · ${formatNumber(price)}`}
                      </button>
                    </li>
                  )
                })}
              </ul>

              <p className="angkut-card__note">
                {record
                  ? `${ANGKUT.selectBest} ${distanceLabel(record.bestM)} · ${formatNumber(record.bestCoins)} ${ANGKUT.garageCoins}`
                  : ANGKUT.selectBest}
              </p>
            </section>


          </aside>
        </main>

        <section className="angkut-notes" aria-labelledby="angkut-notes-title">
          <header className="angkut-notes__head">
            <p>MANUAL</p>
            <h2 id="angkut-notes-title">{NOTES.title}</h2>
          </header>
          <ul>
            {NOTES.rows.map((row) => (
              <li key={row}>
                <span aria-hidden="true">▣</span>
                {row}
              </li>
            ))}
          </ul>
        </section>

        <footer className="angkut-footer">
          <p>{NOTES.footer}</p>
          <p>{NOTES.sourceNote}</p>
          <Link to={ANGKUT.backToShelf}>{NOTES.footerShelf}</Link>
        </footer>
      </div>
    </div>
  )
}

