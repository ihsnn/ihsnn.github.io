import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../../components/shared/SiteHeader'
import {
  HELP,
  MENU_CARD,
  MENU_ITEMS,
  NOTES,
  STATS,
  WARKOP,
  prepLabel,
  rupiah,
} from '../../content/warkop'
import { DAY_MS } from './engine'
import { useWarkop } from './useWarkop'
import './warkop.css'

function timeText(remainingMs: number): string {
  const total = Math.max(0, Math.ceil(remainingMs / 1_000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export default function WarkopPage() {
  const {
    snapshot,
    muted,
    canvasRef,
    start,
    cook,
    closeEarly,
    toggleMuted,
  } = useWarkop()

  const open = snapshot.phase === 'open'
  const burnersBusy = open && snapshot.burners >= snapshot.burnerLimit
  const clock = timeText(snapshot.remainingMs)
  const timeRatio = Math.max(0, Math.min(1, snapshot.remainingMs / DAY_MS))

  const canvasLabel = open
    ? `Layar warkop: ${snapshot.customerCount} pelanggan menunggu, pendapatan ${rupiah(snapshot.coins)}, sisa ${clock}.`
    : snapshot.phase === 'summary'
      ? `Layar warkop: tutup. Pendapatan ${rupiah(snapshot.coins)}, ${snapshot.served} dilayani, ${snapshot.missed} kabur.`
      : 'Layar warkop: tutup. Tekan buka warkop untuk mulai.'

  const announcement =
    snapshot.phase === 'summary'
      ? `Warkop tutup. Pendapatan ${rupiah(snapshot.coins)}. ${snapshot.served} dilayani, ${snapshot.missed} kabur.`
      : ''

  return (
    <div className="warkop-page">
      <div className="warkop-glow" aria-hidden="true" />
      <div className="warkop-stripes" aria-hidden="true" />

      <div className="warkop-shell-page">
        <SiteHeader
          eyebrow={WARKOP.eyebrow}
          title={
            <>
              {WARKOP.titleTop} <em>{WARKOP.titleBottom}</em>
            </>
          }
          backTo={WARKOP.backToShelf}
          led="yellow"
          size="md"
        />

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>

        <section className="warkop-hero">
          <p className="warkop-hero__kicker">
            <span aria-hidden="true">✦</span> {WARKOP.kicker}
          </p>
          <h2 className="warkop-hero__title">{WARKOP.headline}</h2>
          <p className="warkop-hero__blurb">{WARKOP.blurb}</p>
          <ul className="warkop-badges">
            {WARKOP.badges.map((badge) => (
              <li key={badge.label}>
                <span>{badge.label}</span>
                <b>{badge.value}</b>
              </li>
            ))}
          </ul>
        </section>

        <main className="warkop-layout">
          <div className="warkop-machine">
            <div className="warkop-awning" aria-hidden="true" />

            <div className="warkop-case">
              <div className="warkop-case__top">
                <p className="warkop-brand">
                  <span>{WARKOP.brand}</span>
                  <em>{WARKOP.brandMeta}</em>
                </p>
                <span
                  className={`warkop-led${open ? ' is-open' : ''}`}
                  aria-hidden="true"
                />
              </div>

              <div className="warkop-screen">
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={240}
                  className="warkop-canvas"
                  role="img"
                  aria-label={canvasLabel}
                />
                <span className="warkop-glare" aria-hidden="true" />

                {snapshot.phase === 'closed' && (
                  <div
                    className="warkop-cover"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="warkop-start-title"
                  >
                    <p className="warkop-cover__kicker">
                      {WARKOP.startKicker}
                    </p>
                    <h2
                      className="warkop-cover__title"
                      id="warkop-start-title"
                    >
                      {WARKOP.startTitle}
                    </h2>
                    <p className="warkop-cover__text">{WARKOP.startBlurb}</p>
                    <button
                      type="button"
                      className="warkop-cover__cta"
                      onClick={start}
                    >
                      {WARKOP.start}
                    </button>
                    <p className="warkop-cover__note">{WARKOP.startNote}</p>
                  </div>
                )}

                {snapshot.phase === 'summary' && (
                  <div
                    className="warkop-cover"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="warkop-summary-title"
                  >
                    <p className="warkop-cover__kicker">
                      {WARKOP.summaryKicker}
                    </p>
                    <h2
                      className="warkop-cover__total"
                      id="warkop-summary-title"
                    >
                      {rupiah(snapshot.coins)}
                    </h2>
                    <p className="warkop-cover__label">
                      {WARKOP.summaryTitle}
                    </p>

                    <dl className="warkop-summary">
                      <div>
                        <dt>{WARKOP.summaryServed}</dt>
                        <dd>{snapshot.served}</dd>
                      </div>
                      <div>
                        <dt>{WARKOP.summaryMissed}</dt>
                        <dd>{snapshot.missed}</dd>
                      </div>
                      <div>
                        <dt>{WARKOP.summaryBest}</dt>
                        <dd>{rupiah(snapshot.best)}</dd>
                      </div>
                    </dl>

                    {snapshot.newRecord && (
                      <p className="warkop-cover__record">
                        {WARKOP.summaryRecord}
                      </p>
                    )}

                    <button
                      type="button"
                      className="warkop-cover__cta"
                      onClick={start}
                    >
                      {WARKOP.again}
                    </button>
                  </div>
                )}
              </div>

              <div className="warkop-keys__head" aria-hidden="true">
                <span>{WARKOP.kitchenLabel}</span>
                <span>
                  {WARKOP.burnerLabel(snapshot.burners, snapshot.burnerLimit)}
                </span>
              </div>

              <div className={`warkop-keys${burnersBusy ? ' is-busy' : ''}`}>
                {MENU_ITEMS.map((item, index) => {
                  const progress = snapshot.cooking[item.id]
                  const cooking = progress > 0
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`warkop-key${cooking ? ' is-cooking' : ''}`}
                      style={
                        {
                          '--key-color': item.color,
                          '--key-ink': item.ink,
                          '--key-edge': item.edge,
                        } as CSSProperties
                      }
                      onClick={() => cook(item.id)}
                      disabled={!open}
                      aria-disabled={!open || cooking || (burnersBusy && !cooking)}
                      aria-label={`${item.label}, ${rupiah(item.price)}. Tombol ${index + 1}.`}
                      title={`${item.label} — matang ${prepLabel(item.prepMs)}`}
                    >
                      <span className="warkop-key__name">{item.name}</span>
                      <span className="warkop-key__price">
                        {rupiah(item.price)}
                      </span>
                      <span className="warkop-key__number" aria-hidden="true">
                        {index + 1}
                      </span>
                      <span className="warkop-key__bar" aria-hidden="true">
                        <i style={{ width: `${Math.round(progress * 100)}%` }} />
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="warkop-foot">
                <span className="warkop-vent" aria-hidden="true" />
                <div className="warkop-vfd">
                  <span>{WARKOP.total}</span>
                  <b>{rupiah(snapshot.coins)}</b>
                </div>
                <button
                  type="button"
                  className="warkop-close"
                  onClick={closeEarly}
                  disabled={!open}
                >
                  {WARKOP.close}
                </button>
                <button
                  type="button"
                  className={`warkop-mute${muted ? ' is-muted' : ''}`}
                  onClick={toggleMuted}
                  aria-pressed={muted}
                  aria-label={muted ? WARKOP.soundOff : WARKOP.soundOn}
                  title={muted ? WARKOP.soundOff : WARKOP.soundOn}
                >
                  <span aria-hidden="true">{muted ? '✕' : '♪'}</span>
                </button>
              </div>
            </div>
          </div>

          <aside className="warkop-side">
            <section className="warkop-card" aria-labelledby="warkop-today-title">
              <header className="warkop-card__head">
                <h2 id="warkop-today-title">{STATS.title}</h2>
                <span>{open ? WARKOP.openLabel : WARKOP.closedLabel}</span>
              </header>

              <p className="warkop-total">{rupiah(snapshot.coins)}</p>
              <p className="warkop-total__label">{STATS.coins}</p>

              <div className="warkop-time">
                <span>{STATS.time}</span>
                <b>{clock}</b>
              </div>
              <div className="warkop-timebar">
                <i style={{ width: `${Math.round(timeRatio * 100)}%` }} />
              </div>

              <dl className="warkop-stats">
                <div>
                  <dt>{STATS.served}</dt>
                  <dd>{snapshot.served}</dd>
                </div>
                <div>
                  <dt>{STATS.missed}</dt>
                  <dd>{snapshot.missed}</dd>
                </div>
                <div>
                  <dt>{STATS.best}</dt>
                  <dd>{rupiah(snapshot.best)}</dd>
                </div>
              </dl>

              <p className="warkop-card__note">
                {open
                  ? STATS.open
                  : snapshot.phase === 'summary'
                    ? STATS.summary
                    : STATS.closed}
              </p>
            </section>

            <section className="warkop-card" aria-labelledby="warkop-menu-title">
              <header className="warkop-card__head">
                <h2 id="warkop-menu-title">{MENU_CARD.title}</h2>
                <span>{MENU_CARD.prep}</span>
              </header>

              <ul className="warkop-menu">
                {MENU_ITEMS.map((item) => (
                  <li key={item.id}>
                    <span
                      className="warkop-menu__dot"
                      style={{ background: item.color }}
                      aria-hidden="true"
                    />
                    <span className="warkop-menu__name">{item.label}</span>
                    <span className="warkop-menu__prep">
                      {prepLabel(item.prepMs)}
                    </span>
                    <b>{rupiah(item.price)}</b>
                  </li>
                ))}
              </ul>

              <p className="warkop-card__note">{MENU_CARD.hint}</p>
            </section>

            <section className="warkop-card" aria-labelledby="warkop-help-title">
              <header className="warkop-card__head">
                <h2 id="warkop-help-title">{HELP.title}</h2>
                <span>1–5</span>
              </header>
              <ul className="warkop-help">
                {HELP.rows.map((row) => (
                  <li key={row}>
                    <span aria-hidden="true">↳</span>
                    {row}
                  </li>
                ))}
              </ul>
              <p className="warkop-hint">{WARKOP.keysHint}</p>
            </section>
          </aside>
        </main>

        <section className="warkop-notes" aria-labelledby="warkop-notes-title">
          <header className="warkop-notes__head">
            <p>MANUAL</p>
            <h2 id="warkop-notes-title">{NOTES.title}</h2>
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

        <footer className="warkop-footer">
          <p>{NOTES.footer}</p>
          <p>{NOTES.sourceNote}</p>
          <Link to={WARKOP.backToShelf}>{NOTES.footerShelf}</Link>
        </footer>
      </div>
    </div>
  )
}
