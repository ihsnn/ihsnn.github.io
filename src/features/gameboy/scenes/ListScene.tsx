interface ListSceneProps {
  title: string
  items: string[]
  selectedIndex: number
  /** Long or wrapped rows (song titles) read better left-aligned. */
  align?: 'center' | 'left'
}

/**
 * Shared renderer for every "pick a row" screen (menu, messages, music).
 * The cursor occupies its own gutter, so selecting a row never reflows the
 * text — something the three hand-rolled copies used to get subtly wrong.
 */
export default function ListScene({ title, items, selectedIndex, align = 'center' }: ListSceneProps) {
  return (
    <div className="gb-scene">
      <h1 className="gb-scene__title">{title}</h1>
      <ul className={`gb-list gb-list--${align}`}>
        {items.map((label, index) => {
          const selected = index === selectedIndex
          return (
            <li
              key={`${index}-${label}`}
              className={`gb-list__item${selected ? ' is-selected' : ''}`}
              aria-current={selected ? 'true' : undefined}
            >
              <span className="gb-list__cursor" aria-hidden="true">
                {selected ? '>' : ''}
              </span>
              <span className="gb-list__label">{label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
