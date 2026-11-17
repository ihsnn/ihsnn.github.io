import { Link } from 'react-router-dom'
import type { Cartridge as CartridgeProject } from '../../content/projects'
import { SHELF } from '../../content/landing'
import { useTilt } from '../../lib/useTilt'

interface CartridgeProps {
  project: CartridgeProject
}

/**
 * One cartridge on the shelf, built the way the real shell is: a coloured
 * plastic body with an embossed logo plate, grip ribs, a recessed sticker and
 * a moulded arrow at the bottom. The body sits in a small CSS 3D scene —
 * perspective, an extruded back plate and a cast shadow — and leans toward
 * the pointer through `useTilt`.
 *
 * The sculpture is decorative; the caption below it carries the readable
 * title, description and link, so the card still makes sense with images off
 * and to a screen reader.
 */
export default function Cartridge({ project }: CartridgeProps) {
  const { ref, handlers } = useTilt<HTMLAnchorElement>()

  // The sticker has a narrow print area, so size the title to its longest
  // unbreakable word: most games get a bold single line, the long family
  // title steps down a size and wraps cleanly.
  const longestWord = project.title
    .split(/\s+/)
    .reduce((longest, word) => Math.max(longest, word.length), 1)
  const artTitleSize = Math.min(8.8, 86 / longestWord)

  return (
    <Link
      to={project.route}
      ref={ref}
      className="cartridge"
      aria-label={`${project.title} — ${project.tagline}`}
      {...handlers}
    >
      <span className="cartridge__stage" aria-hidden="true">
        <span className="cartridge__shadow" />

        <span className="cartridge__float">
          <span className="cartridge__pose">
            <span className="cartridge__tilt">
              <span className="cartridge__extrude" />

              <span className="cartridge__shell">
                <span className="cartridge__grips cartridge__grips--left">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="cartridge__grips cartridge__grips--right">
                  <i />
                  <i />
                  <i />
                </span>

                <span className="cartridge__brand">
                  <span className="cartridge__brand-main">{SHELF.logo}</span>
                  <span className="cartridge__brand-sub">{SHELF.logoSub}</span>
                </span>

                <span className="cartridge__label">
                  <span className="cartridge__sticker">
                    <span className="cartridge__band cartridge__band--left">
                      <span>{project.code}</span>
                    </span>

                    <span className="cartridge__art">
                      <span className="cartridge__art-top">
                        <span>NO. {project.catalogNo}</span>
                        <span>{SHELF.logo}</span>
                      </span>

                      <span className="cartridge__art-body">
                        <span className="cartridge__art-kicker">
                          {SHELF.labelKicker}
                        </span>
                        <span
                          className="cartridge__art-title"
                          style={{ fontSize: `${artTitleSize.toFixed(2)}cqw` }}
                        >
                          {project.title}
                        </span>
                        <span className="cartridge__art-foot">
                          <span>© {project.year}</span>
                          <span>{SHELF.labelMark}</span>
                        </span>
                      </span>
                    </span>

                    <span className="cartridge__band cartridge__band--right">
                      <span>{SHELF.sideOut}</span>
                    </span>
                  </span>
                </span>

                <span className="cartridge__groove" />
                <span className="cartridge__notch" />
                <span className="cartridge__glare" />
              </span>
            </span>
          </span>
        </span>
      </span>

      <span className="cartridge__caption">
        <span className="cartridge__meta">
          <span>NO. {project.catalogNo}</span>
          <span>© {project.year}</span>
        </span>

        <span className="cartridge__title">{project.title}</span>
        <span className="cartridge__tagline">{project.tagline}</span>

        <span className="cartridge__tags">
          {project.tags.map((tag) => (
            <span key={tag} className="cartridge__tag">
              {tag}
            </span>
          ))}
        </span>

        <span className="cartridge__cta">
          {SHELF.cta}
          <span className="cartridge__cta-arrow" aria-hidden="true">
            →
          </span>
        </span>
      </span>
    </Link>
  )
}
