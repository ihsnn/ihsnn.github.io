import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { PROJECTS } from './projects'
import './landing.css'

export default function LandingPage() {
  return (
    <div className="hub-page">
      <div className="hub-shell">
        <header className="hub-header">
          <span className="hub-led" aria-hidden="true" />
          <div>
            <div className="hub-eyebrow">Playground</div>
            <h1 className="hub-name">IHSNN</h1>
          </div>
        </header>

        <p className="hub-bio">
          I build (sort of) small, playful interfaces — mostly nostalgic hardware brought back to life in
          the browser. This page is my shelf: pick a cartridge below to boot up whatever I made
          most recently, or dig into an older build.
          <br />
          <span className="hub-bio__hint">(This is pure experiment)</span>
        </p>

        <section aria-labelledby="hub-shelf-heading">
          <div className="hub-shelf-eyebrow" id="hub-shelf-heading">
            SELECT CARTRIDGE — {PROJECTS.length} INSTALLED
          </div>

          <div className="hub-shelf">
            {PROJECTS.map((project) => (
              <Link
                key={project.route}
                to={project.route}
                className="cartridge"
                style={
                  {
                    '--cart-color': project.color,
                    '--cart-color-dark': project.colorDark,
                    '--cart-label': project.labelColor,
                  } as CSSProperties
                }
              >
                <span className="cartridge__notch" />
                <span className="cartridge__no">NO. {project.catalogNo}</span>
                <span className="cartridge__title">{project.title}</span>
                <span className="cartridge__tagline">{project.tagline}</span>
                <span className="cartridge__cta">PRESS TO START →</span>
                <span className="cartridge__pins" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="hub-footer">more cartridges coming soon</footer>
      </div>
    </div>
  )
}
