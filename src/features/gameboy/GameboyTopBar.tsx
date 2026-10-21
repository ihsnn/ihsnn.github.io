import { Link } from 'react-router-dom'
import { ROUTES } from '../../app/routes'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { toggleMuted, useSoundMuted } from './audio'
import { CONTROL_LEGEND } from './input'

interface GameboyTopBarProps {
  powerOn: boolean
}

/**
 * Console chrome outside the chassis: way back to the shelf, a hint tailored
 * to the input device, and a sound switch. Lives outside the scaled chassis so
 * it stays readable at every viewport size.
 */
export default function GameboyTopBar({ powerOn }: GameboyTopBarProps) {
  const muted = useSoundMuted()
  const hasKeyboard = useMediaQuery('(hover: hover) and (pointer: fine)')

  const hint = powerOn
    ? hasKeyboard
      ? CONTROL_LEGEND
      : 'TAP THE BUTTONS · TURN THE PHONE FOR MORE ROOM'
    : hasKeyboard
      ? 'FLIP THE POWER SWITCH · P'
      : 'FLIP THE SWITCH ON TOP'

  return (
    <header className="gb-topbar">
      <Link to={ROUTES.home} className="gb-topbar__back">
        <span aria-hidden="true">←</span> SHELF
      </Link>

      <p className="gb-topbar__hint">{hint}</p>

      <button
        type="button"
        className="gb-topbar__sound"
        aria-pressed={!muted}
        aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
        onClick={toggleMuted}
      >
        {muted ? '♪ OFF' : '♪ ON'}
      </button>
    </header>
  )
}
