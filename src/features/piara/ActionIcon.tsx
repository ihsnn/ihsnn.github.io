import type { ActionId } from './types'

/**
 * The four moulded-button glyphs, drawn on a 7 × 7 pixel grid so they match
 * the LCD rather than the icon font of the rest of the site.
 */
const SHAPES: Record<ActionId, readonly string[]> = {
  feed: [
    '0000000',
    '1111111',
    '1111111',
    '0111110',
    '0011100',
    '0001000',
    '0000000',
  ],
  play: [
    '0010000',
    '0011000',
    '0011100',
    '0011110',
    '0011100',
    '0011000',
    '0010000',
  ],
  sleep: [
    '1111100',
    '0001100',
    '0011000',
    '0110000',
    '1100000',
    '1111100',
    '0000000',
  ],
  clean: [
    '0001000',
    '0001000',
    '0011100',
    '1111111',
    '0011100',
    '0001000',
    '0001000',
  ],
}

export default function ActionIcon({ name }: { name: ActionId }) {
  const pixels: JSX.Element[] = []

  SHAPES[name].forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      if (row[x] !== '1') continue
      pixels.push(<rect key={`${y}-${x}`} x={x} y={y} width={1} height={1} />)
    }
  })

  return (
    <svg
      viewBox="0 0 7 7"
      width="14"
      height="14"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {pixels}
    </svg>
  )
}
