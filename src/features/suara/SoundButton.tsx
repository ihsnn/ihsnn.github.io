interface SoundButtonProps {
  playing: boolean
  onClick: () => void
  /** Accessible name and tooltip. */
  label: string
  /** When present the button becomes a wide bar with a visible caption. */
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * The cartridge's one big control. A physical, pressable speaker: the whole
 * point of the game is that this button is impossible to miss, so it is drawn
 * large, with a hard shadow that collapses when pressed.
 */
export default function SoundButton({
  playing,
  onClick,
  label,
  text,
  size = 'md',
  className,
}: SoundButtonProps) {
  return (
    <button
      type="button"
      className={[
        'suara-play',
        `suara-play--${size}`,
        text ? 'suara-play--bar' : '',
        playing ? 'is-playing' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="suara-play__icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" focusable="false">
          <path
            className="suara-play__cone"
            d="M5 12.5h5.2L18 7v18l-7.8-5.5H5z"
          />
          <path
            className="suara-play__wave suara-play__wave--near"
            d="M21.5 11.5a7 7 0 0 1 0 9"
          />
          <path
            className="suara-play__wave suara-play__wave--far"
            d="M25 8.5a11.5 11.5 0 0 1 0 15"
          />
        </svg>
      </span>
      {text && <span className="suara-play__text">{text}</span>}
    </button>
  )
}
