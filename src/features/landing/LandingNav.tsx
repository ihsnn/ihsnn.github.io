import { Link } from 'react-router-dom'
import { ROUTES } from '../../app/routes'

interface LandingNavProps {
  /** Number of installed cartridges, shown as a status readout. */
  count: number
}

/**
 * Site cover nav: wordmark, cartridge counter and a "shelf online" lamp.
 * Sticky, because the shelf and the notes are worth scrolling back from.
 */
export default function LandingNav({ count }: LandingNavProps) {
  return (
    <header className="hub-nav">
      <div className="hub-nav__inner">
        <Link to={ROUTES.home} className="hub-nav__brand">
          <span className="hub-nav__led" aria-hidden="true" />
          <span className="hub-nav__word">IHSNN</span>
          <span className="hub-nav__sub">playground</span>
        </Link>

        <div className="hub-nav__readout">
          <span className="hub-nav__stat">
            <b>{String(count).padStart(2, '0')}</b> cartridges
          </span>
          <span className="hub-nav__status">
            <i aria-hidden="true" />
            shelf online
          </span>
        </div>
      </div>
    </header>
  )
}
