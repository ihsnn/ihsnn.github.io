import type {
  Appearance,
  Direction,
  HairColorId,
  ShirtId,
  SkinId,
} from './types'

/**
 * A tiny layered pixel person: 14 × 20 at scale 1, drawn from rectangles so
 * the character creator can update instantly without exporting sprite sheets.
 * Later chapters can swap this for painted sprites without changing callers.
 */

const PANTS = '#1b1b20'
const SHOES = '#0f0f13'
const OUTLINE = '#241a14'
const MOUTH = '#7a3b32'
const CAP = '#e76f51'
const CAP_DARK = '#b34b36'

const SKIN_COLORS: Record<SkinId, string> = {
  light: '#f2c9a0',
  warm: '#d9a066',
  tan: '#b97a4a',
  deep: '#7a4a2b',
}

const HAIR_COLORS: Record<HairColorId, string> = {
  black: '#211a1a',
  darkBrown: '#4a2c1d',
  brown: '#7a4a2a',
  ash: '#6b6b6b',
}

const SHIRT_COLORS: Record<ShirtId, string> = {
  charcoal: '#41444c',
  teal: '#2a9d8f',
  cream: '#f1e3c3',
  coral: '#e76f51',
  olive: '#6a7b4b',
}

const skinColor = (id: SkinId) => SKIN_COLORS[id]
const hairColor = (id: HairColorId) => HAIR_COLORS[id]
const shirtColor = (id: ShirtId) => SHIRT_COLORS[id]

export function drawCharacterShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
) {
  ctx.fillStyle = 'rgba(36, 26, 20, 0.28)'
  ctx.fillRect(x + 2 * scale, y + 19 * scale, 10 * scale, 2 * scale)
  ctx.fillRect(x + 4 * scale, y + 21 * scale, 6 * scale, 1 * scale)
}

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  appearance: Appearance,
  direction: Direction = 'down',
  frame = 0,
  scale = 1,
) {
  const skin = skinColor(appearance.skin)
  const hair = hairColor(appearance.hairColor)
  const shirt = shirtColor(appearance.shirt)

  const rect = (rx: number, ry: number, rw: number, rh: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(x + rx * scale, y + ry * scale, rw * scale, rh * scale)
  }

  // Shoes and legs. Frame 1 / 2 give the two-step walk cycle.
  const leftLeg = frame === 1 ? 3 : frame === 2 ? 5 : 4
  const rightLeg = frame === 1 ? 8 : frame === 2 ? 9 : 8
  rect(leftLeg, 15, 3, 3, PANTS)
  rect(rightLeg, 15, 3, 3, PANTS)
  rect(leftLeg - 1, 18, 4, 2, SHOES)
  rect(rightLeg - 1, 18, 4, 2, SHOES)

  // Torso, sleeves and hands.
  rect(3, 9, 8, 6, shirt)
  rect(2, 9, 1, 4, shirt)
  rect(11, 9, 1, 4, shirt)
  rect(2, 13, 1, 2, skin)
  rect(11, 13, 1, 2, skin)
  rect(3, 14, 8, 1, 'rgba(0, 0, 0, 0.16)')
  rect(5, 9, 4, 1, 'rgba(255, 255, 255, 0.16)')

  // Head: a few stepped rectangles to keep it round at this size.
  rect(4, 1, 6, 1, skin)
  rect(3, 2, 8, 5, skin)
  rect(4, 7, 6, 1, skin)
  rect(2, 4, 1, 2, skin)
  rect(11, 4, 1, 2, skin)
  rect(6, 8, 2, 1, skin)

  // Hair.
  if (appearance.hairStyle === 'buzz') {
    rect(3, 0, 8, 1, hair)
    rect(3, 1, 1, 2, hair)
    rect(10, 1, 1, 2, hair)
    if (direction !== 'up') rect(4, 2, 6, 1, hair)
  } else if (appearance.hairStyle === 'curly') {
    rect(3, 0, 8, 2, hair)
    rect(2, 1, 1, 2, hair)
    rect(11, 1, 1, 2, hair)
    rect(3, 2, 2, 1, hair)
    rect(9, 2, 2, 1, hair)
    if (direction !== 'up') rect(4, 3, 1, 1, hair)
  } else if (appearance.hairStyle === 'side') {
    rect(3, 0, 8, 2, hair)
    rect(3, 2, 1, 4, hair)
    rect(10, 2, 1, 2, hair)
    if (direction !== 'up') {
      rect(6, 2, 5, 2, hair)
      rect(9, 4, 2, 1, hair)
    }
  } else {
    rect(3, 0, 8, 2, hair)
    rect(3, 2, 1, 3, hair)
    rect(10, 2, 1, 2, hair)
    if (direction !== 'up') rect(3, 2, 2, 1, hair)
  }

  if (direction === 'up') {
    // Back of the head: hair covers the face.
    rect(4, 1, 6, 5, hair)
    rect(3, 2, 1, 3, hair)
    rect(10, 2, 1, 3, hair)
    rect(4, 6, 6, 1, skin)
    return
  }

  // Face. Side steps are a three-quarter view: both eyes stay visible so the
  // character does not look like a full profile at this tiny size.
  if (direction === 'left' || direction === 'right') {
    const flip = direction === 'right'
    const noseX = flip ? 9 : 4
    const mouthX = flip ? 7 : 5
    rect(5, 4, 1, 2, OUTLINE)
    rect(8, 4, 1, 2, OUTLINE)
    rect(noseX, 5, 1, 1, 'rgba(36, 26, 20, 0.45)')
    rect(mouthX, 6, 2, 1, MOUTH)
  } else {
    rect(5, 4, 1, 2, OUTLINE)
    rect(8, 4, 1, 2, OUTLINE)
    rect(6, 6, 2, 1, MOUTH)
  }

  // Accessories.
  if (appearance.accessory === 'glasses') {
    rect(4, 3, 3, 1, OUTLINE)
    rect(8, 3, 3, 1, OUTLINE)
    rect(4, 5, 3, 1, OUTLINE)
    rect(8, 5, 3, 1, OUTLINE)
    rect(4, 3, 1, 3, OUTLINE)
    rect(6, 3, 1, 3, OUTLINE)
    rect(8, 3, 1, 3, OUTLINE)
    rect(10, 3, 1, 3, OUTLINE)
    rect(7, 4, 1, 1, OUTLINE)
  } else if (appearance.accessory === 'cap') {
    rect(3, 0, 8, 2, CAP)
    rect(2, 2, 10, 1, CAP_DARK)
    rect(3, 1, 5, 1, 'rgba(255, 255, 255, 0.25)')
  }
}
