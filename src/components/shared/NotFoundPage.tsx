import { Link } from 'react-router-dom'
import { ROUTES } from '../../app/routes'
import './shared.css'

/** Catch-all screen for URLs that were never burnt onto a cartridge. */
export default function NotFoundPage() {
  return (
    <main className="not-found">
      <div className="not-found__card">
        <p className="not-found__eyebrow">NO CARTRIDGE IN THIS SLOT</p>
        <h1 className="not-found__code">404</h1>
        <p className="not-found__text">
          This page was never pressed onto a board. The shelf still has the good
          stuff on it.
        </p>
        <div className="not-found__actions">
          <Link to={ROUTES.home} className="not-found__link">
            ← Back to the shelf
          </Link>
          <Link to={ROUTES.gameboy} className="not-found__link not-found__link--ghost">
            Boot the console
          </Link>
        </div>
      </div>
    </main>
  )
}
