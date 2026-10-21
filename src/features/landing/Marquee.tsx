interface MarqueeProps {
  words: string[]
}

/**
 * Full-bleed scrolling strip. Two identical groups so the CSS `-50%` loop is
 * seamless; the whole strip is decorative (the same message is repeated in the
 * footer), so it is hidden from assistive tech.
 */
export default function Marquee({ words }: MarqueeProps) {
  const group = (
    <span className="hub-marquee__group">
      {words.map((word) => (
        <span key={word} className="hub-marquee__item">
          {word}
          <span className="hub-marquee__sep" aria-hidden="true">
            +
          </span>
        </span>
      ))}
    </span>
  )

  return (
    <div className="hub-marquee" aria-hidden="true">
      <div className="hub-marquee__track">
        {group}
        {group}
      </div>
    </div>
  )
}
