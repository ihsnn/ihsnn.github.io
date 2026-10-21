import { Link } from 'react-router-dom'
import type { Cartridge as CartridgeProject } from '../../content/projects'
import { useTilt } from '../../lib/useTilt'

interface CartridgeProps {
  project: CartridgeProject
}

/**
 * One cartridge on the shelf: coloured shell with a dark printed label, like
 * the real thing. Colour comes from the project entry (set as CSS custom
 * properties by the shelf item), and the card tilts toward the pointer on
 * desktop.
 */
export default function Cartridge({ project }: CartridgeProps) {
  const { ref, handlers } = useTilt<HTMLAnchorElement>()

  return (
    <Link to={project.route} ref={ref} className="cartridge" {...handlers}>
      <span className="cartridge__notch" aria-hidden="true" />

      <span className="cartridge__label">
        <span className="cartridge__label-top">
          <span className="cartridge__no">NO. {project.catalogNo}</span>
          <span className="cartridge__year">© {project.year}</span>
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
          Press to start
          <span className="cartridge__cta-arrow" aria-hidden="true">
            →
          </span>
        </span>
      </span>

      <span className="cartridge__pins" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>

      <span className="cartridge__glare" aria-hidden="true" />
    </Link>
  )
}
