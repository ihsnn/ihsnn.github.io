import type { CSSProperties } from 'react'
import { BOOT_LINES } from '../../content/landing'

/**
 * The cover's "device": a boot log on a scanlined screen.
 * Purely decorative storytelling — the real console is one link away.
 */
export default function HeroTerminal() {
  return (
    <div className="hub-terminal">
      <div className="hub-terminal__bar">
        <span className="hub-terminal__dot" aria-hidden="true" />
        <span className="hub-terminal__title">ihsnn·os</span>
        <span className="hub-terminal__bar-status">ready</span>
      </div>

      <pre className="hub-terminal__screen">
        {BOOT_LINES.map((line, index) => (
          <span
            key={line.text}
            className={`hub-terminal__line${line.dim ? ' is-dim' : ''}`}
            style={{ '--i': index } as CSSProperties}
          >
            {line.text}
            {'\n'}
          </span>
        ))}
        <span className="hub-terminal__prompt">&gt; </span>
        <span className="hub-terminal__cursor" aria-hidden="true" />
      </pre>

      <div className="hub-terminal__foot">
        <span className="hub-terminal__foot-group">
          power
          <i aria-hidden="true" />
        </span>
        <span className="hub-terminal__foot-note">insert cartridge ↓</span>
      </div>
    </div>
  )
}
