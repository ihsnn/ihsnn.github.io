import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../../components/shared/SiteHeader'
import {
  ACTION_COPY,
  ACTION_ORDER,
  EGG_MOOD,
  GROWTH,
  HATCH,
  HELP,
  MOODS,
  NOTES,
  PIARA,
  STAGE_COPY,
  STATUS,
} from '../../content/piara'
import ActionIcon from './ActionIcon'
import { ageLabel, durationLabel, nextGrowth } from './sim'
import type { ActionId } from './types'
import { usePiara } from './usePiara'
import './piara.css'

const KEYBOARD_ACTIONS: Record<string, ActionId> = {
  f: 'feed',
  p: 'play',
  s: 'sleep',
  c: 'clean',
}

export default function PiaraPage() {
  const {
    pet,
    mood,
    bubble,
    busy,
    muted,
    naming,
    canvasRef,
    act,
    tapEgg,
    submitName,
    toggleMuted,
    reset,
  } = usePiara()

  const [draft, setDraft] = useState('')
  const [resetArmed, setResetArmed] = useState(false)

  const stage = STAGE_COPY[pet.stage]
  const hatched = pet.stage !== 'telur'
  const moodCopy = hatched ? MOODS[mood] : EGG_MOOD
  const growth = nextGrowth(pet)
  const canAct = hatched && pet.name !== '' && !busy && !naming

  const meters = [
    { id: 'food', label: STATUS.food, value: pet.food },
    { id: 'joy', label: STATUS.joy, value: pet.joy },
    { id: 'rest', label: STATUS.rest, value: pet.rest },
  ]

  const sceneLabel = hatched
    ? `Layar PIARA: ${pet.name}, ${stage.label}, ${moodCopy.label}.`
    : 'Layar PIARA: telur yang belum menetas. Ketuk lima kali untuk menetaskan.'

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }
      const action = KEYBOARD_ACTIONS[event.key.toLowerCase()]
      if (!action) return
      event.preventDefault()
      act(action)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [act])

  const onSubmitName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitName(draft)
  }

  const onReset = () => {
    reset()
    setDraft('')
    setResetArmed(false)
  }

  return (
    <div className="piara-page">
      <div className="piara-glow" aria-hidden="true" />
      <div className="piara-grid-bg" aria-hidden="true" />

      <div className="piara-shell-page">
        <SiteHeader
          eyebrow={PIARA.eyebrow}
          title={
            <>
              {PIARA.titleTop} <em>{PIARA.titleBottom}</em>
            </>
          }
          backTo={PIARA.backToShelf}
          led="mint"
          size="md"
        />

        <p className="sr-only" role="status" aria-live="polite">
          {bubble?.text ?? `${stage.label}. ${moodCopy.line}`}
        </p>

        <section className="piara-hero">
          <p className="piara-hero__kicker">
            <span aria-hidden="true">✦</span> {PIARA.kicker}
          </p>
          <h2 className="piara-hero__title">{PIARA.headline}</h2>
          <p className="piara-hero__blurb">{PIARA.blurb}</p>
          <ul className="piara-badges">
            {PIARA.badges.map((badge) => (
              <li key={badge.label}>
                <span>{badge.label}</span>
                <b>{badge.value}</b>
              </li>
            ))}
          </ul>
        </section>

        <main className="piara-layout">
          <div className="piara-device">
            <div className="piara-keyring" aria-hidden="true" />

            <div className="piara-case">
              <div className="piara-case__top">
                <p className="piara-brand">
                  <span className="piara-brand__name">PIARA</span>
                  <span className="piara-brand__meta">TEMAN SAKU · 07</span>
                </p>
                <span
                  className={`piara-led${pet.asleep ? ' is-sleeping' : ''}`}
                  aria-hidden="true"
                />
              </div>

              <div className="piara-lcd">
                <div className="piara-screen">
                  <canvas
                    ref={canvasRef}
                    width={160}
                    height={120}
                    className="piara-canvas"
                    role="img"
                    aria-label={sceneLabel}
                  />
                  <span className="piara-glare" aria-hidden="true" />

                  {bubble && (
                    <p className="piara-bubble" key={bubble.id}>
                      {bubble.text}
                    </p>
                  )}

                  {!hatched && (
                    <button
                      type="button"
                      className="piara-tap"
                      onClick={tapEgg}
                      aria-label={`Ketuk telur, ${pet.taps} dari ${HATCH.taps}`}
                    >
                      <span className="piara-tap__hint">
                        {HATCH.tapHint} · {pet.taps}/{HATCH.taps}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <p className="piara-tag">
                <b>{pet.name || STATUS.nameFallback}</b>
                <span aria-hidden="true">·</span>
                {stage.label}
              </p>

              <div className="piara-buttons">
                {ACTION_ORDER.map((id) => {
                  const copy = ACTION_COPY[id]
                  const label =
                    id === 'sleep' && pet.asleep ? copy.activeLabel : copy.label
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`piara-button piara-button--${id}`}
                      onClick={() => act(id)}
                      disabled={!canAct}
                      aria-label={`${copy.hint} (tombol ${copy.key})`}
                    >
                      <span className="piara-button__icon" aria-hidden="true">
                        <ActionIcon name={id} />
                      </span>
                      <span className="piara-button__label">{label}</span>
                      <span className="piara-button__key" aria-hidden="true">
                        {copy.key}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="piara-case__foot">
                <span className="piara-vent" aria-hidden="true" />
                <span className="piara-screw" aria-hidden="true" />
                <button
                  type="button"
                  className={`piara-mute${muted ? ' is-muted' : ''}`}
                  onClick={toggleMuted}
                  aria-pressed={muted}
                  aria-label={muted ? PIARA.soundOff : PIARA.soundOn}
                  title={muted ? PIARA.soundOff : PIARA.soundOn}
                >
                  <span aria-hidden="true">{muted ? '✕' : '♪'}</span>
                </button>
              </div>
            </div>

            {naming && (
              <form
                className="piara-naming"
                onSubmit={onSubmitName}
                role="dialog"
                aria-modal="true"
                aria-labelledby="piara-naming-title"
              >
                <div className="piara-naming__card">
                  <p className="piara-naming__kicker">{HATCH.kicker}</p>
                  <h2 className="piara-naming__title" id="piara-naming-title">
                    {HATCH.title}
                  </h2>
                  <p className="piara-naming__blurb">{HATCH.blurb}</p>

                  <label className="sr-only" htmlFor="piara-name">
                    Nama teman
                  </label>
                  <input
                    id="piara-name"
                    className="piara-naming__input"
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={HATCH.maxLength}
                    placeholder={HATCH.placeholder}
                    autoComplete="off"
                    spellCheck={false}
                    autoFocus
                  />

                  <div className="piara-naming__suggestions">
                    {HATCH.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setDraft(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="piara-naming__submit"
                    disabled={draft.trim().length === 0}
                  >
                    {HATCH.submit}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="piara-side">
            <section className="piara-card" aria-labelledby="piara-status-title">
              <header className="piara-card__head">
                <h2 id="piara-status-title">{STATUS.title}</h2>
                <span>{stage.label}</span>
              </header>

              <p className="piara-card__name">
                {pet.name || STATUS.nameFallback}
              </p>
              <p className="piara-card__mood">
                <span className="piara-mood-dot" data-mood={mood} aria-hidden="true" />
                <b>{moodCopy.label}</b>
                <em>· {moodCopy.line}</em>
              </p>

              <div className="piara-meters" aria-label={STATUS.vitalsAria}>
                {meters.map((meter) => (
                  <div
                    className={`piara-meter piara-meter--${meter.id}`}
                    key={meter.id}
                  >
                    <span className="piara-meter__label">{meter.label}</span>
                    <span className="piara-meter__track">
                      <i style={{ width: `${Math.round(meter.value)}%` }} />
                    </span>
                    <b>{Math.round(meter.value)}%</b>
                  </div>
                ))}
              </div>

              <p className="piara-card__foot">
                {hatched
                  ? `${STATUS.agePrefix} ${ageLabel(pet.ageMs)}`
                  : STATUS.unhatched}
                <span aria-hidden="true">·</span>
                {pet.mess === 0
                  ? STATUS.clean
                  : `${pet.mess} ${STATUS.messy}`}
              </p>

              {pet.asleep && (
                <p className="piara-card__sleep">{STATUS.sleepNote}</p>
              )}
            </section>

            <section className="piara-card" aria-labelledby="piara-growth-title">
              <header className="piara-card__head">
                <h2 id="piara-growth-title">{GROWTH.title}</h2>
                <span>{hatched ? `${Math.round(pet.care)}%` : GROWTH.locked}</span>
              </header>

              {!hatched ? (
                <p className="piara-growth__hint">{GROWTH.egg}</p>
              ) : growth ? (
                <>
                  <div className="piara-growth__row">
                    <span>
                      {GROWTH.next} {STAGE_COPY[growth.next].label}
                    </span>
                    <b>{Math.round(growth.progress * 100)}%</b>
                  </div>
                  <div className="piara-progress">
                    <i style={{ width: `${growth.progress * 100}%` }} />
                  </div>
                  <p className="piara-growth__hint">
                    {growth.careReady
                      ? `${GROWTH.remaining} ${durationLabel(growth.remainingMs)}`
                      : GROWTH.needHint(growth.minNeed)}
                  </p>
                </>
              ) : (
                <p className="piara-growth__hint">{GROWTH.adult}</p>
              )}

              <div className="piara-care">
                <span>{GROWTH.care}</span>
                <span className="piara-progress piara-progress--care">
                  <i style={{ width: `${Math.round(pet.care)}%` }} />
                </span>
                <b>{Math.round(pet.care)}%</b>
              </div>
              <p className="piara-stage-note">{stage.note}</p>
            </section>

            <section className="piara-card" aria-labelledby="piara-help-title">
              <header className="piara-card__head">
                <h2 id="piara-help-title">{HELP.title}</h2>
                <span>{HELP.keyboardTitle}</span>
              </header>

              <ul className="piara-help">
                {HELP.rows.map((row) => (
                  <li key={row}>
                    <span aria-hidden="true">↳</span>
                    {row}
                  </li>
                ))}
              </ul>

              <div className="piara-reset-zone">
                {resetArmed ? (
                  <div className="piara-reset-confirm">
                    <p>{HELP.resetConfirm}</p>
                    <div>
                      <button type="button" onClick={onReset}>
                        {HELP.resetYes}
                      </button>
                      <button
                        type="button"
                        className="is-ghost"
                        onClick={() => setResetArmed(false)}
                      >
                        {HELP.resetNo}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="piara-reset"
                    onClick={() => setResetArmed(true)}
                  >
                    {HELP.reset}
                  </button>
                )}
                <p className="piara-reset-note">{HELP.resetNote}</p>
              </div>
            </section>
          </aside>
        </main>

        <section className="piara-notes" aria-labelledby="piara-notes-title">
          <header className="piara-notes__head">
            <p>MANUAL</p>
            <h2 id="piara-notes-title">{NOTES.title}</h2>
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

        <footer className="piara-footer">
          <p>{NOTES.footer}</p>
          <p>{NOTES.sourceNote}</p>
          <Link to={PIARA.backToShelf}>{NOTES.footerShelf}</Link>
        </footer>
      </div>
    </div>
  )
}
