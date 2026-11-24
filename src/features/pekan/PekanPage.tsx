import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../../components/shared/SiteHeader'
import { CONTROLS, MANUAL, PEKAN } from '../../content/pekan/copy'
import { SPORTS, TEAM_BY_ID } from '../../content/pekan/island'
import { usePekan } from './usePekan'
import './pekan.css'

const MODE_LABEL: Record<string, string> = {
  title: 'Di layar judul',
  world: 'Menjelajah pulau',
  dialogue: 'Sedang bicara',
  versus: 'Tantangan dimulai',
  sport: 'Bertanding',
  result: 'Hasil cabang',
  debug: 'Menu debug',
}

export default function PekanPage() {
  const {
    canvasRef,
    hud,
    muted,
    toggleMuted,
    pressDir,
    releaseDir,
    tapA,
    tapB,
    canvasPointer,
  } = usePekan()

  const team = TEAM_BY_ID.get(hud.team)
  const modeLabel = MODE_LABEL[hud.mode] ?? 'Menjelajah pulau'
  const status = `PEKAN RAYA. ${modeLabel}. ${hud.scrolls} dari ${SPORTS.length} scroll.`

  const hold = (dir: 'up' | 'down' | 'left' | 'right') => ({
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      pressDir(dir)
    },
    onPointerUp: () => releaseDir(dir),
    onPointerLeave: () => releaseDir(dir),
    onPointerCancel: () => releaseDir(dir),
    onContextMenu: (event: ReactMouseEvent) => event.preventDefault(),
  })

  return (
    <div className="pekan-page">
      <div className="pekan-bunting" aria-hidden="true" />

      <div className="pekan-shell">
        <SiteHeader
          eyebrow={PEKAN.eyebrow}
          title={
            <>
              PEKAN <em>RAYA</em>
            </>
          }
          backTo={PEKAN.backToShelf}
          led="yellow"
          size="md"
        />

        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>

        <section className="pekan-hero">
          <p className="pekan-hero__kicker">
            <span aria-hidden="true">✦</span> {PEKAN.kicker}
          </p>
          <h2 className="pekan-hero__title">{PEKAN.headline}</h2>
          <p className="pekan-hero__blurb">{PEKAN.blurb}</p>
          <ul className="pekan-badges">
            {PEKAN.badges.map((badge) => (
              <li key={badge.label}>
                <span>{badge.label}</span>
                <b>{badge.value}</b>
              </li>
            ))}
          </ul>
        </section>

        <main className="pekan-stage">
          <div className="pekan-console">
            <div className="pekan-screen">
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className="pekan-canvas"
                role="img"
                aria-label={`Layar Pekan Raya: ${modeLabel}, ${hud.scrolls} dari ${SPORTS.length} scroll.`}
                {...canvasPointer}
              />
              <span className="pekan-glare" aria-hidden="true" />
            </div>

            <div className="pekan-deck">
              <div className="pekan-pad" role="group" aria-label={CONTROLS.dpad}>
                <span />
                <button type="button" className="pekan-pad__key" aria-label={CONTROLS.up} {...hold('up')}>
                  ▲
                </button>
                <span />
                <button type="button" className="pekan-pad__key" aria-label={CONTROLS.left} {...hold('left')}>
                  ◀
                </button>
                <span className="pekan-pad__hub" aria-hidden="true" />
                <button type="button" className="pekan-pad__key" aria-label={CONTROLS.right} {...hold('right')}>
                  ▶
                </button>
                <span />
                <button type="button" className="pekan-pad__key" aria-label={CONTROLS.down} {...hold('down')}>
                  ▼
                </button>
                <span />
              </div>

              <div className="pekan-actions">
                <button
                  type="button"
                  className="pekan-key pekan-key--a"
                  aria-label={CONTROLS.a}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    tapA()
                  }}
                >
                  A
                </button>
                <button
                  type="button"
                  className="pekan-key pekan-key--b"
                  aria-label={CONTROLS.b}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    tapB()
                  }}
                >
                  B
                </button>
                <button
                  type="button"
                  className={`pekan-mute${muted ? ' is-muted' : ''}`}
                  onClick={toggleMuted}
                  aria-pressed={muted}
                  aria-label={muted ? CONTROLS.unmute : CONTROLS.mute}
                  title={muted ? CONTROLS.unmute : CONTROLS.mute}
                >
                  <span aria-hidden="true">{muted ? '✕' : '♪'}</span>
                </button>
              </div>
            </div>

            <p className="pekan-note">{PEKAN.startNote}</p>
          </div>

          <aside className="pekan-side">
            <section className="pekan-card" aria-labelledby="pekan-today">
              <header className="pekan-card__head">
                <h2 id="pekan-today">PEKAN HARI INI</h2>
                <span className={`pekan-dot pekan-dot--${hud.mode}`} aria-hidden="true" />
              </header>

              <p className="pekan-scrolls">
                <b>{hud.scrolls}</b>
                <span>/ {SPORTS.length} scroll</span>
              </p>

              <div className="pekan-team">
                <span>KAMU MEMBELA</span>
                <b style={{ color: team?.color }}>{team?.name ?? 'MERAH'}</b>
              </div>

              <p className="pekan-status">{modeLabel}.</p>

              <ul className="pekan-progress">
                {SPORTS.map((sport) => (
                  <li key={sport.id} data-ready={sport.id === 'panahan'}>
                    <span>{String(sport.no).padStart(2, '0')}</span>
                    {sport.title}
                    {sport.id === 'panahan' ? <em>SIAP</em> : <em>SEGERA</em>}
                  </li>
                ))}
              </ul>

              <p className="pekan-card__note">
                Cabang lain menyusul. Panahan sudah bisa dimainkan sekarang.
              </p>
            </section>

            <section className="pekan-card" aria-labelledby="pekan-keys">
              <header className="pekan-card__head">
                <h2 id="pekan-keys">{MANUAL.keys}</h2>
                <span>KEYBOARD</span>
              </header>
              <dl className="pekan-keys">
                {MANUAL.keyRows.map(([key, action]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{action}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </aside>
        </main>

        <section className="pekan-manual" aria-labelledby="pekan-manual-title">
          <header className="pekan-manual__head">
            <p>MANUAL</p>
            <h2 id="pekan-manual-title">{MANUAL.title}</h2>
          </header>
          <ul>
            {MANUAL.rows.map((row) => (
              <li key={row}>
                <span aria-hidden="true">◆</span>
                {row}
              </li>
            ))}
          </ul>
        </section>

        <footer className="pekan-footer">
          <p>{MANUAL.footer}</p>
          <Link to={PEKAN.backToShelf}>{MANUAL.footerShelf}</Link>
        </footer>
      </div>
    </div>
  )
}
