import type { CSSProperties } from 'react'
import { FIELD_NOTES, MARQUEE_WORDS } from '../../content/landing'
import { CARTRIDGES, type Cartridge as CartridgeProject } from '../../content/projects'
import Cartridge from './Cartridge'
import Hero from './Hero'
import LandingNav from './LandingNav'
import Marquee from './Marquee'
import './landing.css'

/** Shell + label colours travel as CSS custom properties, not inline styles. */
const cartridgeVars = (project: CartridgeProject) =>
  ({
    '--cart-color': project.color,
    '--cart-color-dark': project.colorDark,
    '--cart-label': project.labelColor,
  }) as CSSProperties

export default function LandingPage() {
  const marqueeWords = [
    ...CARTRIDGES.map((project) => project.title.toLowerCase()),
    ...MARQUEE_WORDS,
  ]
  const year = new Date().getFullYear()

  return (
    <div className="hub-page">
      <div className="hub-noise" aria-hidden="true" />

      <LandingNav count={CARTRIDGES.length} />

      <main className="hub-main">
        <div className="hub-shell">
          <Hero />

          <section className="hub-shelf" aria-labelledby="hub-shelf-heading">
            <div className="hub-section-head">
              <div>
                <p className="hub-section-label">01 — the shelf</p>
                <h2 className="hub-section-title" id="hub-shelf-heading">
                  Select a cartridge
                </h2>
              </div>
              <p className="hub-section-aside">
                {String(CARTRIDGES.length).padStart(2, '0')} installed · more coming
              </p>
            </div>

            <ul className="hub-shelf__grid">
              {CARTRIDGES.map((project) => (
                <li
                  key={project.id}
                  className="hub-shelf__item"
                  style={cartridgeVars(project)}
                >
                  <Cartridge project={project} />
                </li>
              ))}
            </ul>
          </section>

          <section className="hub-notes" aria-labelledby="hub-notes-heading">
            <div className="hub-section-head">
              <div>
                <p className="hub-section-label">02 — field notes</p>
                <h2 className="hub-section-title" id="hub-notes-heading">
                  How these are made
                </h2>
              </div>
            </div>

            <ul className="hub-notes__grid">
              {FIELD_NOTES.map((note) => (
                <li key={note.id} className="hub-note">
                  <span className="hub-note__index">{note.index}</span>
                  <h3 className="hub-note__title">{note.title}</h3>
                  <p className="hub-note__body">{note.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Marquee words={marqueeWords} />

      <footer className="hub-footer">
        <p className="hub-footer__line">
          © {year} IHSNN — built with React, TypeScript and too many CSS gradients
        </p>
        <p className="hub-footer__line hub-footer__line--dim">
          the shelf is built to grow
        </p>
      </footer>
    </div>
  )
}
