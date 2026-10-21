import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './shared.css'

interface SiteHeaderProps {
  /** Small mono line above the name. */
  eyebrow: string
  /** Page name — rendered in the pixel font. */
  title: ReactNode
  /** Shows a "back to shelf" pill when provided. */
  backTo?: string
  backLabel?: string
  led?: 'mint' | 'yellow' | 'red'
  size?: 'lg' | 'md'
}

/**
 * The chrome every page shares: status LED, eyebrow, title, way home.
 * Keeping it in one component is what makes the shelf and the cartridges feel
 * like the same machine.
 */
export default function SiteHeader({
  eyebrow,
  title,
  backTo,
  backLabel = 'Shelf',
  led = 'mint',
  size = 'lg',
}: SiteHeaderProps) {
  return (
    <header className={`site-header site-header--${size}`}>
      <span className={`site-header__led site-header__led--${led}`} aria-hidden="true" />

      <div className="site-header__text">
        <p className="site-header__eyebrow">{eyebrow}</p>
        <h1 className="site-header__title">{title}</h1>
      </div>

      {backTo && (
        <Link to={backTo} className="site-header__back">
          <span aria-hidden="true">←</span> {backLabel}
        </Link>
      )}
    </header>
  )
}
