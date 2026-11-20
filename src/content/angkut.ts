import { ROUTES } from '../app/routes'
import type { Level, LevelId, Upgrades } from '../features/angkut/types'

/**
 * The whole ANGKUT catalogue and its copy.
 *
 * Six hills, six loads. The engine reads `terrain`, `grip`, `targetM` and the
 * cargo numbers from here — this is the one place a level change belongs.
 * Strings stay here so the page, the HUD and the summary can be re-worded
 * without touching gameplay code.
 */

export const LEVELS: readonly Level[] = [
  {
    id: 'pasir',
    no: '01',
    name: 'LEMBAH PASIR',
    cargo: {
      label: 'Pasir sungai',
      shape: 'sand',
      short: 'PASIR',
      mass: 0.85,
      height: 26,
      width: 66,
      offset: 0,
      slide: 0.18,
      trait: 'Ringan dan padat: truk lincah, muatan jarang bergeser.',
      color: '#dcb478',
      colorDark: '#a67f42',
      accent: '#f6e2bb',
    },
    targetM: 900,
    terrain: {
      seed: 8101,
      amp: 46,
      wave: 470,
      chop: 4.2,
      chopWave: 145,
      grade: 0.04,
      jumps: 5,
      jump: 26,
    },
    palette: {
      skyTop: '#6fb9e4',
      skyLow: '#d8edf6',
      sun: '#fff3c4',
      haze: '#cfe4ee',
      ridgeFar: '#9dc0cc',
      ridgeNear: '#7aa88a',
      soil: '#8a6a44',
      soilDeep: '#553d26',
      surface: '#e2c68e',
      surfaceAlt: '#c8a76b',
      ink: '#3b2a14',
    },
    grip: 0.94,
    tip: 'Rute pembuka: bukit panjang, tanjakan ringan, banyak koin.',
  },
  {
    id: 'kayu',
    no: '02',
    name: 'JALAN KAYU',
    cargo: {
      label: 'Kayu gelondong',
      shape: 'logs',
      short: 'KAYU',
      mass: 1.15,
      height: 22,
      width: 76,
      offset: -4,
      slide: 0.55,
      trait: 'Panjang dan licin: kayu bergeser tiap kali truk mendarat.',
      color: '#a06a38',
      colorDark: '#6d431d',
      accent: '#d7a86b',
    },
    targetM: 1_000,
    terrain: {
      seed: 4523,
      amp: 56,
      wave: 440,
      chop: 5,
      chopWave: 130,
      grade: 0.05,
      jumps: 6,
      jump: 30,
    },
    palette: {
      skyTop: '#5a3b6b',
      skyLow: '#f0a35e',
      sun: '#ffd9a0',
      haze: '#d99a72',
      ridgeFar: '#6c4a6a',
      ridgeNear: '#3f5a48',
      soil: '#5a4630',
      soilDeep: '#33261a',
      surface: '#6f7f45',
      surfaceAlt: '#586733',
      ink: '#2a1a10',
    },
    grip: 0.9,
    tip: 'Hutan naik-turun. Kayu panjang membuat truk lebih berat di belakang.',
  },
  {
    id: 'batu',
    no: '03',
    name: 'LERENG BATU',
    cargo: {
      label: 'Batu belah',
      shape: 'rocks',
      short: 'BATU',
      mass: 1.35,
      height: 28,
      width: 60,
      offset: -2,
      slide: 0.12,
      trait: 'Berat dan kaku: tanjakan terasa dua kali lebih panjang.',
      color: '#8d8b86',
      colorDark: '#565552',
      accent: '#c4c1b8',
    },
    targetM: 1_100,
    terrain: {
      seed: 991,
      amp: 58,
      wave: 380,
      chop: 7,
      chopWave: 105,
      grade: 0.06,
      jumps: 6,
      jump: 32,
    },
    palette: {
      skyTop: '#8390a0',
      skyLow: '#c9d3db',
      sun: '#eef3f6',
      haze: '#b3bfc8',
      ridgeFar: '#8e99a4',
      ridgeNear: '#6a7480',
      soil: '#65605a',
      soilDeep: '#3a3733',
      surface: '#a5a098',
      surfaceAlt: '#8a857d',
      ink: '#2b2b2b',
    },
    grip: 0.88,
    tip: 'Batu pecah di jalan, tanjakan pendek tapi sering. Jaga momentum.',
  },
  {
    id: 'gas',
    no: '04',
    name: 'TANJAKAN GAS',
    cargo: {
      label: 'Tabung gas',
      shape: 'cylinders',
      short: 'GAS',
      mass: 1,
      height: 42,
      width: 42,
      offset: 0,
      slide: 0.7,
      trait: 'Tinggi dan goyah: titik berat naik, truk gampang terbalik.',
      color: '#3aa66b',
      colorDark: '#1f6b43',
      accent: '#a8e6c4',
    },
    targetM: 1_200,
    terrain: {
      seed: 7777,
      amp: 66,
      wave: 420,
      chop: 5.5,
      chopWave: 150,
      grade: 0.07,
      jumps: 7,
      jump: 36,
    },
    palette: {
      skyTop: '#4f9fd6',
      skyLow: '#cfe9f7',
      sun: '#fff6d8',
      haze: '#bcd9ea',
      ridgeFar: '#a2c3d8',
      ridgeNear: '#6f9a6a',
      soil: '#7a6448',
      soilDeep: '#4a3a26',
      surface: '#b7c06a',
      surfaceAlt: '#98a354',
      ink: '#2c2a12',
    },
    grip: 0.93,
    tip: 'Tanjakan panjang dan curam. Tabung tinggi: hati-hati saat mendarat.',
  },
  {
    id: 'ternak',
    no: '05',
    name: 'PADANG TERNAK',
    cargo: {
      label: 'Sapi & kambing',
      shape: 'livestock',
      short: 'TERNAK',
      mass: 0.8,
      height: 32,
      width: 58,
      offset: 0,
      slide: 0.9,
      trait: 'Ringan tapi hidup: muatan bergerak sendiri di jalan bergelombang.',
      color: '#d9c7a3',
      colorDark: '#a08c68',
      accent: '#f6ecd6',
    },
    targetM: 1_300,
    terrain: {
      seed: 3131,
      amp: 52,
      wave: 400,
      chop: 8,
      chopWave: 105,
      grade: 0.05,
      jumps: 6,
      jump: 30,
    },
    palette: {
      skyTop: '#4a4a7a',
      skyLow: '#f2b48a',
      sun: '#ffe0b0',
      haze: '#d79a86',
      ridgeFar: '#7a6a94',
      ridgeNear: '#5a7a5a',
      soil: '#6a5438',
      soilDeep: '#3c2e1e',
      surface: '#8fa35a',
      surfaceAlt: '#748846',
      ink: '#2a2014',
    },
    grip: 0.86,
    tip: 'Tanah padang bergelombang. Ternak ikut bergeser setiap guncangan.',
  },
  {
    id: 'semen',
    no: '06',
    name: 'MALAM SEMEN',
    cargo: {
      label: 'Semen sak',
      shape: 'bags',
      short: 'SEMEN',
      mass: 1.45,
      height: 26,
      width: 62,
      offset: 0,
      slide: 0.1,
      trait: 'Paling berat: tanjakan basah, rem panjang, lampu menyala.',
      color: '#b9b2a4',
      colorDark: '#7d776c',
      accent: '#e4dfd4',
    },
    targetM: 1_400,
    terrain: {
      seed: 6060,
      amp: 62,
      wave: 430,
      chop: 6.5,
      chopWave: 120,
      grade: 0.062,
      jumps: 6,
      jump: 34,
    },
    palette: {
      skyTop: '#121a2c',
      skyLow: '#33405a',
      sun: '#cfdcf2',
      haze: '#27324a',
      ridgeFar: '#2b3550',
      ridgeNear: '#1c2438',
      soil: '#3a3a42',
      soilDeep: '#1e1e24',
      surface: '#5a5f68',
      surfaceAlt: '#474b53',
      ink: '#e8eef8',
      night: true,
      rain: true,
    },
    grip: 0.8,
    tip: 'Hujan, jalan licin, muatan paling berat. Rampungkan sebelum bensin habis.',
  },
]

export const LEVEL_BY_ID = new Map<LevelId, Level>(
  LEVELS.map((level) => [level.id, level]),
)

/** The garage's three parts, their four steps and what each step buys. */
export interface GaragePart {
  id: keyof Upgrades
  name: string
  blurb: string
  /** Short label for step 1, 2 and 3. */
  steps: readonly [string, string, string]
  /** Coins for step 1, 2 and 3. */
  prices: readonly [number, number, number]
}

export const GARAGE: readonly GaragePart[] = [
  {
    id: 'engine',
    name: 'MESIN',
    blurb: 'Tarikan naik, truk lebih cepat sampai puncak.',
    steps: ['Standar', 'Turbo ringan', 'Turbo penuh'],
    prices: [30, 75, 150],
  },
  {
    id: 'tires',
    name: 'BAN',
    blurb: 'Grip lebih kuat, terutama di jalan basah.',
    steps: ['Biasa', 'Kembang dalam', 'Off-road'],
    prices: [30, 75, 150],
  },
  {
    id: 'tank',
    name: 'TANGKI',
    blurb: 'Bensin lebih banyak, jangkauan lebih jauh.',
    steps: ['40 liter', '52 liter', '64 liter'],
    prices: [30, 75, 150],
  },
]

export const ANGKUT = {
  eyebrow: 'Cartridge 10 · Angkut',
  titleTop: 'ANGKUT',
  titleBottom: 'truk gunung',
  backToShelf: ROUTES.home,
  kicker: 'MUAT DULU, TANJAK NANTI',
  headline: 'Truk besar, muatan beda-beda.',
  blurb:
    'Enam tanjakan dan enam muatan: pasir yang ringan, kayu yang licin, batu yang berat, tabung gas yang tinggi, ternak yang tidak mau diam, dan semen di malam hujan. Gas dan rem, dua pedal, tanpa jalan mundur.',
  badges: [
    { label: 'Rute', value: '6 tanjakan' },
    { label: 'Muatan', value: '6 jenis' },
    { label: 'Rekor', value: 'lokal' },
  ],
  startKicker: 'SIAP ANGKUT',
  startTitle: 'Pilih muatan, lalu gas.',
  startBlurb:
    'Tekan GAS untuk menanjak, REM untuk mengerem. Di udara, GAS menaikkan moncong dan REM menurunkannya.',
  startNote:
    'Kumpulkan koin dan jeriken bensin di jalan. Bensin habis atau truk terbalik, angkutan selesai.',
  start: 'MULAI ANGKUT',
  again: 'ULANGI RUTE',
  next: 'RUTE BERIKUTNYA',
  finish: 'SAMPAI TUJUAN',
  levelLabel: 'RUTE',
  cargoLabel: 'MUATAN',
  targetLabel: 'Tujuan',
  garageTitle: 'GARAGE',
  garageCoins: 'Koin',
  garageMax: 'PENUH',
  garageBuy: 'PASANG',
  garageNeed: 'Kurang',
  selectTitle: 'PILIH RUTE',
  selectLocked: 'Terkunci',
  selectUnlock: (name: string) => `Selesaikan ${name} dulu`,
  selectCleared: 'Selesai',
  selectBest: 'Terbaik',
  statsTitle: 'PERJALANAN',
  statsDistance: 'Jarak',
  statsSpeed: 'Kecepatan',
  statsFuel: 'Bensin',
  statsCoins: 'Koin',
  statsLoad: 'Muatan',
  statsLoadSafe: 'Aman',
  statsLoadShifted: 'Bergeser',
  statsTarget: 'Sisa',
  keyboardHint: 'Tombol → / D untuk gas · ← / A untuk rem · R untuk ulang',
  pedalGas: 'GAS',
  pedalBrake: 'REM',
  soundOn: 'Suara menyala',
  soundOff: 'Suara mati',
  canvasIdle: 'Layar angkut: truk menunggu di garis start.',
  canvasDrive: (level: string, distance: number, speed: number) =>
    `Layar angkut ${level}: ${Math.round(distance)} meter, ${speed} kilometer per jam.`,
  canvasEnded: (reason: string, distance: number, coins: number) =>
    `Perjalanan selesai (${reason}): ${Math.round(distance)} meter, ${coins} koin.`,
  reasonFuel: 'Bensin habis',
  reasonFlip: 'Truk terbalik',
  reasonFinish: 'Sampai tujuan',
  summaryDistance: 'Jarak',
  summaryCoins: 'Koin didapat',
  summaryBonus: 'Bonus jarak',
  summaryBest: 'Rekor rute',
  summaryNew: 'REKOR BARU',
  summaryCleared: 'RUTE SELESAI',
  summaryLocked: 'Rute berikutnya terbuka',
} as const

export const HELP = {
  title: 'CARA MAIN',
  rows: [
    'Tahan GAS untuk menanjak. Truk ini berat — momentum lebih penting daripada gas terus.',
    'Di udara, GAS menaikkan moncong dan REM menurunkannya. Pakai untuk mendarat rata.',
    'Koin dan jeriken bensin ada di jalan. Jeriken menambah bensin; bensin habis berarti selesai.',
    'Muatan yang bergeser membuat titik berat pindah. Truk yang terbalik langsung selesai.',
    'Selesaikan sebuah rute untuk membuka rute berikutnya. Koin dipakai di garage.',
  ],
} as const

export const NOTES = {
  title: 'CATATAN KECIL',
  rows: [
    'Fisika truk (suspensi, torsi, gesekan ban) dihitung di engine.ts tanpa React dan tanpa canvas.',
    'Enam rute dibuat dari noise deterministik, jadi tanjakannya sama setiap kali dimainkan.',
    'Suara mesin, benturan dan koil disintesis WebAudio — tidak ada file audio.',
    'Progres, koin dan garage tersimpan di localStorage dengan kunci ihsnn:angkut:progress.',
  ],
  footer: 'ANGKUT · cartridge 10',
  sourceNote: 'Mulai dari lembah pasir, habiskan bensin di tanjakan.',
  footerShelf: 'Kembali ke rak',
} as const

const numberFormat = new Intl.NumberFormat('id-ID')

export function formatNumber(value: number): string {
  return numberFormat.format(Math.round(value))
}

/** "1.240 m" — metres are always whole, the run is never a decimal. */
export function distanceLabel(value: number): string {
  return `${formatNumber(value)} m`
}

export function levelById(id: LevelId): Level {
  return LEVEL_BY_ID.get(id) ?? LEVELS[0]
}

export function nextLevel(id: LevelId): Level | null {
  const index = LEVELS.findIndex((level) => level.id === id)
  return index >= 0 && index < LEVELS.length - 1 ? LEVELS[index + 1] : null
}







