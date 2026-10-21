import { Link } from 'react-router-dom'
import { HERO } from '../../content/landing'
import HeroTerminal from './HeroTerminal'

/** Cover: eyebrow, oversized headline, then the lede + boot terminal pair. */
export default function Hero() {
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
            {HERO.ctas.map((cta) => (
              <Link
                key={cta.route}
                to={cta.route}
                className={`hub-cta${cta.primary ? ' hub-cta--primary' : ''}`}
              >
                <span>{cta.label}</span>
                <span className="hub-cta__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
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
