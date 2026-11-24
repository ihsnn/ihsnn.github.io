/**
 * PEKAN RAYA — the island itself.
 *
 * Maps are painted with `fill()`/`put()` on a rectangular character grid
 * instead of hand-typed string rows: a ragged row is the most common way a
 * tilemap breaks, and this way it cannot happen. Adding a screen means writing
 * one `build*()` function and one entry in `MAPS`.
 *
 * Tiles
 *   `.` grass      `,` flowers    `=` path      `~` water     `s` sand
 *   `H` roof       `h` wall       `d` door      `f` fence     `r` paddy
 *   `m` rock       `o` boulder    `#` tree      `b` bridge
 */

export type Dir = 'up' | 'down' | 'left' | 'right'
export type MapId = 'kampung' | 'sawah'
export type RegionId = 'kampung' | 'sawah' | 'pantai' | 'hutan' | 'gunung' | 'puncak'
export type TeamId = 'merah' | 'kuning' | 'hijau'

/** The seven branches of the Pekan. Only `panahan` is playable in the slice. */
export type SportId =
  | 'panahan'
  | 'renang'
  | 'karung'
  | 'raga'
  | 'panjat'
  | 'layang'
  | 'silat'

export interface MapDef {
  id: MapId
  name: string
  region: RegionId
  width: number
  height: number
  rows: string[]
}

export interface DialogueLine {
  speaker: string
  text: string
}

export interface NpcLook {
  shirt: string
  skin: string
  hair: string
  hat: 'none' | 'cap' | 'straw'
}

export interface NpcDef {
  id: string
  map: MapId
  x: number
  y: number
  dir: Dir
  name: string
  look: NpcLook
  lines: DialogueLine[]
  /** Talking to this NPC starts a branch once the lines are done. */
  sport?: SportId
}

export interface WarpDef {
  map: MapId
  x: number
  y: number
  toMap: MapId
  toX: number
  toY: number
  label: string
}

export interface SportMeta {
  id: SportId
  no: number
  title: string
  /** The verb, in three words or fewer. */
  verb: string
  champion: string
  region: RegionId
  hint: string
  scroll: string
}

export interface TeamMeta {
  id: TeamId
  name: string
  color: string
  ink: string
}

export const MAP_WIDTH = 28
export const MAP_HEIGHT = 20

function grid(width: number, height: number, fill: string): string[] {
  return Array.from({ length: height }, () => fill.repeat(width))
}

function fill(
  rows: string[],
  x: number,
  y: number,
  w: number,
  h: number,
  ch: string,
): void {
  const width = rows[0]?.length ?? 0
  const x0 = Math.max(0, x)
  const y0 = Math.max(0, y)
  const x1 = Math.min(width, x + w)
  const y1 = Math.min(rows.length, y + h)
  for (let yy = y0; yy < y1; yy += 1) {
    rows[yy] = rows[yy].slice(0, x0) + ch.repeat(x1 - x0) + rows[yy].slice(x1)
  }
}

function put(rows: string[], x: number, y: number, ch: string): void {
  fill(rows, x, y, 1, 1, ch)
}

/** A 4 × 3 house: roof on top, walls below, a two-tile door on the bottom row. */
function house(rows: string[], x: number, y: number): void {
  fill(rows, x, y, 4, 1, 'H')
  fill(rows, x, y + 1, 4, 2, 'h')
  put(rows, x + 1, y + 2, 'd')
  put(rows, x + 2, y + 2, 'd')
}

function border(rows: string[]): void {
  const width = rows[0].length
  fill(rows, 0, 0, width, 1, '#')
  fill(rows, 0, rows.length - 1, width, 1, '#')
  fill(rows, 0, 0, 1, rows.length, '#')
  fill(rows, width - 1, 0, 1, rows.length, '#')
}

function buildKampung(): string[] {
  const rows = grid(MAP_WIDTH, MAP_HEIGHT, '.')
  border(rows)

  // Three houses along the top edge, each with a path down to the square.
  house(rows, 3, 2)
  house(rows, 11, 2)
  house(rows, 19, 2)
  fill(rows, 4, 5, 1, 2, '=')
  fill(rows, 12, 5, 1, 2, '=')
  fill(rows, 20, 5, 1, 2, '=')

  // The square, the well in the middle, and the road out to the rice fields.
  fill(rows, 6, 7, 14, 5, '=')
  put(rows, 12, 9, 'o')
  fill(rows, 20, 9, 7, 1, '=')
  put(rows, 27, 9, '=')

  // Pond in the south-west corner with a sandy rim.
  fill(rows, 2, 14, 6, 4, '~')
  fill(rows, 1, 13, 8, 1, 's')
  fill(rows, 1, 18, 8, 1, 's')
  fill(rows, 1, 14, 1, 4, 's')
  fill(rows, 8, 14, 1, 4, 's')

  // Trees and flowers so the edges are not a flat green wall.
  const trees: Array<[number, number]> = [
    [1, 2],
    [1, 3],
    [8, 2],
    [16, 2],
    [24, 2],
    [25, 3],
    [2, 6],
    [6, 5],
    [22, 5],
    [24, 13],
    [25, 14],
    [23, 17],
    [26, 16],
    [1, 10],
    [2, 11],
    [10, 14],
    [11, 15],
    [26, 5],
    [3, 17],
  ]
  for (const [x, y] of trees) put(rows, x, y, '#')

  const flowers: Array<[number, number]> = [
    [9, 12],
    [16, 12],
    [7, 5],
    [18, 6],
    [3, 9],
    [22, 12],
    [13, 14],
    [20, 5],
    [6, 13],
    [17, 14],
  ]
  for (const [x, y] of flowers) put(rows, x, y, ',')

  return rows
}

function buildSawah(): string[] {
  const rows = grid(MAP_WIDTH, MAP_HEIGHT, '.')
  border(rows)

  // The bund road across the fields, and the gate back to the village.
  fill(rows, 1, 9, 26, 1, '=')
  put(rows, 0, 9, '=')

  // Paddies: two blocks in the north, three in the south.
  fill(rows, 3, 3, 6, 4, 'r')
  fill(rows, 11, 3, 6, 4, 'r')
  fill(rows, 3, 12, 6, 4, 'r')
  fill(rows, 11, 12, 6, 4, 'r')
  fill(rows, 19, 12, 6, 4, 'r')

  // The archery range: a packed-earth square in the north-east.
  fill(rows, 21, 2, 6, 7, '=')

  const trees: Array<[number, number]> = [
    [1, 2],
    [2, 3],
    [9, 2],
    [17, 2],
    [10, 15],
    [17, 16],
    [25, 11],
    [26, 12],
    [2, 18],
    [1, 17],
    [20, 2],
    [8, 17],
  ]
  for (const [x, y] of trees) put(rows, x, y, '#')

  const flowers: Array<[number, number]> = [
    [9, 8],
    [17, 10],
    [2, 11],
    [18, 16],
    [10, 10],
    [24, 10],
  ]
  for (const [x, y] of flowers) put(rows, x, y, ',')

  return rows
}

export const MAPS: Record<MapId, MapDef> = {
  kampung: {
    id: 'kampung',
    name: 'KAMPUNG',
    region: 'kampung',
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    rows: buildKampung(),
  },
  sawah: {
    id: 'sawah',
    name: 'SAWAH',
    region: 'sawah',
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    rows: buildSawah(),
  },
}

export const START = { map: 'kampung' as MapId, x: 14, y: 12, dir: 'down' as Dir }

export const NPCS: readonly NpcDef[] = [
  {
    id: 'sesepuh',
    map: 'kampung',
    x: 17,
    y: 8,
    dir: 'down',
    name: 'MBAH WATI',
    look: { shirt: '#7b4b3a', skin: '#d9a066', hair: '#cfcfcf', hat: 'none' },
    lines: [
      {
        speaker: 'MBAH WATI',
        text: 'Selamat datang di Pekan Raya, Nak. Tujuh cabang, tujuh scroll.',
      },
      {
        speaker: 'MBAH WATI',
        text: 'Kalau semua scroll sudah di tangan, obor di puncak menunggumu.',
      },
    ],
  },
  {
    id: 'anak',
    map: 'kampung',
    x: 9,
    y: 10,
    dir: 'left',
    name: 'BOCAH',
    look: { shirt: '#e0a13c', skin: '#d9a066', hair: '#211a1a', hat: 'cap' },
    lines: [
      {
        speaker: 'BOCAH',
        text: 'Si Elang itu jago panah. Katanya dia bisa baca angin!',
      },
      {
        speaker: 'BOCAH',
        text: 'Lapangan panahnya di sawah, sebelah timur kampung.',
      },
    ],
  },
  {
    id: 'warung',
    map: 'kampung',
    x: 14,
    y: 6,
    dir: 'left',
    name: 'PAK WARUNG',
    look: { shirt: '#2a9d8f', skin: '#b97a4a', hair: '#211a1a', hat: 'straw' },
    lines: [
      { speaker: 'PAK WARUNG', text: 'Warung belum buka. Tunggu pekan ramai, ya.' },
      { speaker: 'PAK WARUNG', text: 'Kalau haus, minum dari sumur saja. Gratis.' },
    ],
  },
  {
    id: 'penjaga',
    map: 'kampung',
    x: 24,
    y: 8,
    dir: 'right',
    name: 'PENJAGA JALAN',
    look: { shirt: '#41444c', skin: '#d9a066', hair: '#4a2c1d', hat: 'cap' },
    lines: [
      {
        speaker: 'PENJAGA JALAN',
        text: 'Jalan ke sawah lewat sini. Ikuti pematang, jangan lompat.',
      },
    ],
  },
  {
    id: 'petani',
    map: 'sawah',
    x: 7,
    y: 8,
    dir: 'down',
    name: 'PAK TANI',
    look: { shirt: '#6a9e4a', skin: '#b97a4a', hair: '#211a1a', hat: 'straw' },
    lines: [
      { speaker: 'PAK TANI', text: 'Padi baru dipanen. Sawah sekarang jadi lapangan.' },
      { speaker: 'PAK TANI', text: 'Lapangan panahan ada di ujung timur. Hati-hati angin.' },
    ],
  },
  {
    id: 'elang',
    map: 'sawah',
    x: 23,
    y: 5,
    dir: 'down',
    name: 'SI ELANG',
    look: { shirt: '#c2603a', skin: '#b97a4a', hair: '#211a1a', hat: 'cap' },
    lines: [
      { speaker: 'SI ELANG', text: 'Angin di sawah tidak pernah diam, Nak.' },
      {
        speaker: 'SI ELANG',
        text: 'Tiga anak panah. Kalau kau bisa membaca angin, kau menang.',
      },
    ],
    sport: 'panahan',
  },
]

export const WARPS: readonly WarpDef[] = [
  {
    map: 'kampung',
    x: 27,
    y: 9,
    toMap: 'sawah',
    toX: 2,
    toY: 9,
    label: 'SAWAH',
  },
  {
    map: 'sawah',
    x: 0,
    y: 9,
    toMap: 'kampung',
    toX: 26,
    toY: 9,
    label: 'KAMPUNG',
  },
]

export const SPORTS: readonly SportMeta[] = [
  {
    id: 'panahan',
    no: 1,
    title: 'PANAHAN',
    verb: 'Bidik, baca angin, lepas',
    champion: 'SI ELANG',
    region: 'sawah',
    hint: '←/→ atau geser layar untuk membidik, lalu tekan A.',
    scroll: 'SCROLL PANAHAN',
  },
  {
    id: 'renang',
    no: 2,
    title: 'RENANG',
    verb: 'Jaga ritme, atur napas',
    champion: 'SI KILAT',
    region: 'pantai',
    hint: 'Kiri dan kanan bergantian, jangan sampai kehabisan napas.',
    scroll: 'SCROLL RENANG',
  },
  {
    id: 'karung',
    no: 3,
    title: 'BALAP KARUNG',
    verb: 'Tahan, lalu lompat',
    champion: 'BANG KARUNG',
    region: 'kampung',
    hint: 'Tahan A untuk mengisi tenaga, lepas tepat saat mendarat.',
    scroll: 'SCROLL KARUNG',
  },
  {
    id: 'raga',
    no: 4,
    title: 'SEPAK RAGA',
    verb: 'Jaga bola, susun kombo',
    champion: 'JURAGAN RAGA',
    region: 'kampung',
    hint: 'Tekan A saat bola mendekat. Jangan sampai jatuh.',
    scroll: 'SCROLL RAGA',
  },
  {
    id: 'panjat',
    no: 5,
    title: 'PANJAT PINANG',
    verb: 'Ketuk, raih, jangan licin',
    champion: 'KI PANJAT',
    region: 'gunung',
    hint: 'Ketuk A secepatnya, tekan B untuk meraih hadiah di puncak.',
    scroll: 'SCROLL PANJAT',
  },
  {
    id: 'layang',
    no: 6,
    title: 'LAYANG-LAYANG',
    verb: 'Kemudikan, jaga tegangan',
    champion: 'NYAI ANGIN',
    region: 'pantai',
    hint: 'Kiri/kanan mengejar angin, atas/bawah mengatur senar.',
    scroll: 'SCROLL LAYANG',
  },
  {
    id: 'silat',
    no: 7,
    title: 'PENCAK SILAT',
    verb: 'Baca pola, tangkis, balas',
    champion: 'KANG SILAT',
    region: 'hutan',
    hint: 'Baca gerakan lawan: A menyerang, B menangkis.',
    scroll: 'SCROLL SILAT',
  },
]

export const TEAMS: readonly TeamMeta[] = [
  { id: 'merah', name: 'MERAH', color: '#d9534b', ink: '#ffe9e2' },
  { id: 'kuning', name: 'KUNING', color: '#e0a13c', ink: '#3a2415' },
  { id: 'hijau', name: 'HIJAU', color: '#5f9e4a', ink: '#f4ffe8' },
]

export const SPORT_BY_ID = new Map(SPORTS.map((sport) => [sport.id, sport]))
export const TEAM_BY_ID = new Map(TEAMS.map((team) => [team.id, team]))
