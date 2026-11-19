import { useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { HERO, SHELF_ID } from '../../content/landing'
import { CARTRIDGES } from '../../content/projects'
import HeroTerminal from './HeroTerminal'

/**
 * "Browse" goes to the shelf just under the cover, so scroll to it instead of
 * letting the hash jump. The href stays as the no-JS fallback.
 */
function scrollToShelf(event: MouseEvent<HTMLAnchorElement>) {
  const shelf = document.getElementById(SHELF_ID)
  if (!shelf) return
  event.preventDefault()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  shelf.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}

/** One cartridge per visit, so "surprise me" is a real link, not a script. */
function pickCartridge() {
  return CARTRIDGES[Math.floor(Math.random() * CARTRIDGES.length)]
}

/** Cover: eyebrow, oversized headline, then the shelf actions + boot terminal. */
export default function Hero() {
  const [lucky] = useState(pickCartridge)

  return (
    <section className="hub-hero" aria-labelledby="hub-title">
      <p className="hub-eyebrow">
        <span className="hub-eyebrow__rule" aria-hidden="true" />
        {HERO.eyebrow}
      </p>

      <h1 className="hub-title" id="hub-title">
        <span className="hub-title__line">{HERO.titleTop}</span>
        <span className="hub-title__line">
          {HERO.titleBottom}{' '}
          <span className="hub-title__chip">{HERO.titleChip}</span>
        </span>
      </h1>

      <div className="hub-hero__row">
        <div className="hub-hero__copy">
          <p className="hub-lede">{HERO.lede}</p>

          <div className="hub-ctas">
            {HERO.actions.map((action) => {
              const className = `hub-cta${action.primary ? ' hub-cta--primary' : ''}`
              const label = (
                <>
                  <span>{action.label}</span>
                  <span className="hub-cta__arrow" aria-hidden="true">
                    {action.glyph}
                  </span>
                </>
              )

              return action.id === 'browse' ? (
                <a
                  key={action.id}
                  className={className}
                  href={`#${SHELF_ID}`}
                  onClick={scrollToShelf}
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={action.id}
                  className={className}
                  to={lucky.route}
                  aria-label={`${action.label} — ${lucky.title}`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          <div className="hub-quick">
            <p className="hub-quick__label" id="hub-quick-label">
              {HERO.quickLabel}
            </p>
            <ul className="hub-quick__list" aria-labelledby="hub-quick-label">
              {CARTRIDGES.map((project) => (
                <li key={project.id}>
                  <Link
                    to={project.route}
                    className="hub-quick__slot"
                    style={{ '--slot': project.color } as CSSProperties}
                    aria-label={project.title}
                    data-title={project.title}
                  >
                    {project.catalogNo}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <ul className="hub-meta">
            {HERO.meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="hub-hero__aside">
          <HeroTerminal />
        </div>
      </div>
    </section>
  )
}
