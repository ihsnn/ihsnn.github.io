import { ROUTES } from '../app/routes'
import { SUARA_ART, SUARA_PHOTOS, SUARA_SOUNDS } from '../lib/assets'

/**
 * TELINGA EMAS — the sound shelf.
 *
 * Every word and every fact this cartridge prints lives here. The synth
 * (`features/suara/audio.ts`) keys its recipes on the same ids, so adding a
 * sound means: draw the picture, register it in `lib/assets.ts`, add one entry
 * below, and write one recipe. Nothing else needs to change.
 */

export type SoundCategory = 'hewan' | 'kendaraan' | 'rumah' | 'alam'

export type SoundId = keyof typeof SUARA_ART

export interface SoundItem {
  id: SoundId
  name: string
  category: SoundCategory
  /** One line of "why does it sound like that", read after an answer. */
  note: string
  /** Pixel-art drawing — the source for the Piksel rendering. */
  src: string
  alt: string
  /** Real photograph — shown in Real mode, credited in the viewer. */
  photo: {
    src: string
    alt: string
    credit: { text: string; url: string }
  }
  /** The recording itself, with the attribution printed in the viewer. */
  sound: {
    src: string
    credit: { text: string; url: string }
  }
}

interface CatalogEntry {
  name: string
  category: SoundCategory
  note: string
}

const CATALOG: Record<SoundId, CatalogEntry> = {
  sapi: {
    name: 'Sapi',
    category: 'hewan',
    note: 'Sapi memanggil temannya dengan lenguhan rendah yang terdengar dari jauh.',
  },
  kucing: {
    name: 'Kucing',
    category: 'hewan',
    note: 'Meong berubah nada saat kucing minta makan atau menyapa.',
  },
  anjing: {
    name: 'Anjing',
    category: 'hewan',
    note: 'Guk yang pendek biasanya tanda waspada, bukan marah.',
  },
  ayam: {
    name: 'Ayam jago',
    category: 'hewan',
    note: 'Ayam jago berkokok paling keras saat matahari mulai naik.',
  },
  bebek: {
    name: 'Bebek',
    category: 'hewan',
    note: 'Kwek bebek terdengar sengau karena suaranya keluar lewat saluran hidung.',
  },
  burung: {
    name: 'Burung',
    category: 'hewan',
    note: 'Burung kecil bernyanyi dengan nada tinggi supaya terdengar dari jauh.',
  },
  katak: {
    name: 'Katak',
    category: 'hewan',
    note: 'Katak jantan memanggil dari kolam saat udara lembap.',
  },
  motor: {
    name: 'Motor',
    category: 'kendaraan',
    note: 'Mesin satu silinder berdenyut makin cepat saat gas diputar.',
  },
  mobil: {
    name: 'Klakson mobil',
    category: 'kendaraan',
    note: 'Klakson mobil memakai dua nada sekaligus supaya terdengar tegas.',
  },
  kereta: {
    name: 'Kereta api',
    category: 'kendaraan',
    note: 'Peluit kereta rendah dan panjang, terdengar jauh sebelum keretanya terlihat.',
  },
  ambulans: {
    name: 'Ambulans',
    category: 'kendaraan',
    note: 'Sirene ambulans naik-turun supaya orang tahu harus menepi.',
  },
  sepeda: {
    name: 'Bel sepeda',
    category: 'kendaraan',
    note: 'Bel sepeda berbunyi tinggi karena pelat logam kecilnya bergetar cepat.',
  },
  bel: {
    name: 'Bel pintu',
    category: 'rumah',
    note: 'Bel pintu klasik punya dua nada: ding, lalu dong.',
  },
  weker: {
    name: 'Jam weker',
    category: 'rumah',
    note: 'Jam weker berdentang karena dua loncengnya dipukul cepat bergantian.',
  },
  telepon: {
    name: 'Telepon',
    category: 'rumah',
    note: 'Telepon rumah berbunyi dua nada yang diulang-ulang.',
  },
  keran: {
    name: 'Air keran',
    category: 'rumah',
    note: 'Air yang mengalir memecah jadi ribuan rintik saat menabrak wastafel.',
  },
  hujan: {
    name: 'Hujan',
    category: 'alam',
    note: 'Hujan berdesis karena jutaan tetes air jatuh bersamaan.',
  },
  guntur: {
    name: 'Guntur',
    category: 'alam',
    note: 'Guntur adalah suara udara yang mengembang setelah kilat menyambar.',
  },
  angin: {
    name: 'Angin',
    category: 'alam',
    note: 'Angin tidak punya suara sendiri; yang kita dengar adalah gesekannya pada benda.',
  },
  ombak: {
    name: 'Ombak',
    category: 'alam',
    note: 'Ombak pecah saat puncaknya menabrak air di depannya.',
  },
  kambing: {
    name: "Kambing",
    category: 'hewan',
    note: "Kambing mengembik dengan getaran cepat saat memanggil temannya.",
  },
  domba: {
    name: "Domba",
    category: 'hewan',
    note: "Domba mengenali suara anaknya di antara ratusan ekor.",
  },
  kuda: {
    name: "Kuda",
    category: 'hewan',
    note: "Ringkikan kuda terdengar jauh karena nadanya rendah dan panjang.",
  },
  keledai: {
    name: "Keledai",
    category: 'hewan',
    note: "Keledai meringkik panjang, biasanya saat makan atau menyapa.",
  },
  babi: {
    name: "Babi",
    category: 'hewan',
    note: "Babi mendengus untuk berkomunikasi dengan kelompoknya.",
  },
  tikus: {
    name: "Tikus",
    category: 'hewan',
    note: "Tikus memanggil dengan cicit tinggi yang sulit didengar manusia.",
  },
  gajah: {
    name: "Gajah",
    category: 'hewan',
    note: "Terompet gajah terdengar sampai beberapa kilometer.",
  },
  singa: {
    name: "Singa",
    category: 'hewan',
    note: "Raungan singa jantan bisa terdengar sejauh delapan kilometer.",
  },
  harimau: {
    name: "Harimau",
    category: 'hewan',
    note: "Harimau mengaum untuk menandai wilayah, bukan saat berburu.",
  },
  serigala: {
    name: "Serigala",
    category: 'hewan',
    note: "Lolongan serigala adalah cara berkumpul dengan kawanannya.",
  },
  monyet: {
    name: "Monyet",
    category: 'hewan',
    note: "Monyet punya suara berbeda untuk makanan dan bahaya.",
  },
  'burung-hantu': {
    name: "Burung hantu",
    category: 'hewan',
    note: "Burung hantu berhoho dengan nada rendah di malam hari.",
  },
  merak: {
    name: "Merak",
    category: 'hewan',
    note: "Merak jantan memanggil nyaring sambil membuka ekornya.",
  },
  angsa: {
    name: "Angsa",
    category: 'hewan',
    note: "Angsa mendesis dan berkoak untuk menjaga sarangnya.",
  },
  kalkun: {
    name: "Kalkun",
    category: 'hewan',
    note: "Kalkun jantan bersuara gobble untuk menarik perhatian.",
  },
  penguin: {
    name: "Penguin",
    category: 'hewan',
    note: "Penguin memanggil dengan nada keras agar ditemukan di keramaian.",
  },
  'lumba-lumba': {
    name: "Lumba-lumba",
    category: 'hewan',
    note: "Lumba-lumba berkomunikasi dengan siulan dan klik.",
  },
  paus: {
    name: "Paus",
    category: 'hewan',
    note: "Paus bungkuk bernyanyi dengan nada rendah yang merambat jauh di laut.",
  },
  jangkrik: {
    name: "Jangkrik",
    category: 'hewan',
    note: "Jangkrik jantan berderik dengan menggesekkan sayapnya.",
  },
  lebah: {
    name: "Lebah",
    category: 'hewan',
    note: "Lebah berdengung karena sayapnya bergetar sangat cepat.",
  },
}

/** Display order: animals first, then wheels, rooms, weather. */
const ORDER: readonly SoundId[] = [
  'sapi',
  'kucing',
  'anjing',
  'ayam',
  'bebek',
  'burung',
  'katak',
  'kambing',
  'domba',
  'kuda',
  'keledai',
  'babi',
  'tikus',
  'gajah',
  'singa',
  'harimau',
  'serigala',
  'monyet',
  'burung-hantu',
  'merak',
  'angsa',
  'kalkun',
  'penguin',
  'lumba-lumba',
  'paus',
  'jangkrik',
  'lebah',
  'motor',
  'mobil',
  'kereta',
  'ambulans',
  'sepeda',
  'bel',
  'weker',
  'telepon',
  'keran',
  'hujan',
  'guntur',
  'angin',
  'ombak',
]

export const SOUND_ITEMS: readonly SoundItem[] = ORDER.map((id) => ({
  id,
  name: CATALOG[id].name,
  category: CATALOG[id].category,
  note: CATALOG[id].note,
  ...SUARA_ART[id],
  photo: SUARA_PHOTOS[id],
  sound: SUARA_SOUNDS[id],
}))

export const CATEGORY_ORDER: readonly SoundCategory[] = [
  'hewan',
  'kendaraan',
  'rumah',
  'alam',
]

export const CATEGORY_LABEL: Record<SoundCategory, string> = {
  hewan: 'Hewan',
  kendaraan: 'Kendaraan',
  rumah: 'Rumah',
  alam: 'Alam',
}

/** The category chips: "Semua" plus one per group, each with its count. */
export type CategoryFilter = SoundCategory | 'semua'

export const CATEGORY_FILTERS: readonly {
  id: CategoryFilter
  label: string
  count: number
}[] = [
  { id: 'semua', label: 'Semua', count: SOUND_ITEMS.length },
  ...CATEGORY_ORDER.map((id) => ({
    id,
    label: CATEGORY_LABEL[id],
    count: SOUND_ITEMS.filter((item) => item.category === id).length,
  })),
]

export function itemsIn(filter: CategoryFilter): readonly SoundItem[] {
  if (filter === 'semua') return SOUND_ITEMS
  return SOUND_ITEMS.filter((item) => item.category === filter)
}

export function itemById(id: string): SoundItem | undefined {
  return SOUND_ITEMS.find((item) => item.id === id)
}

/** How many questions a quiz run asks. */
export const QUIZ_LENGTH = 8

/** Wrong answers to draw per round (three distractor pictures). */
export const QUIZ_CHOICES = 4

export const SUARA = {
  eyebrow: 'Cartridge 11 · Suara',
  titleTop: 'TELINGA',
  titleBottom: 'EMAS',
  backToShelf: ROUTES.home,
  kicker: 'STASIUN DENGAR · 40 SUARA',
  headline: 'Dengar dulu, tebak kemudian.',
  blurb:
    'Empat puluh rekaman suara hewan, kendaraan, rumah dan alam. Tekan tombol besar untuk mendengarnya, lihat gambarnya, lalu uji telinga di mode tebak. Gambar bisa diganti antara piksel atau foto asli, dan bisa dibuka layar penuh.',
  badges: [
    { label: 'Suara', value: '40 rekaman' },
    { label: 'Gambar', value: 'piksel · foto' },
    { label: 'Layar', value: 'penuh' },
  ],
  brand: 'TELINGA EMAS',
  brandMeta: 'STASIUN DENGAR · 11',
  soundOn: 'Suara menyala',
  soundOff: 'Suara mati',
  tabExplore: 'Jelajah',
  tabExploreHint: 'Dengar bebas',
  tabQuiz: 'Tebak',
  tabQuizHint: 'Uji telinga',
  tabsLabel: 'Mode permainan',
  artPixel: 'Piksel',
  artReal: 'Real',
  artLegend: 'Gambar',
  filterLegend: 'Kategori',
  play: 'Dengarkan',
  replay: 'Dengar lagi',
  fullscreen: 'Layar penuh',
  exitFullscreen: 'Keluar layar penuh',
  close: 'Tutup',
  prev: 'Sebelumnya',
  next: 'Berikutnya',
  exploreTitle: 'Pilih gambarnya, dengar suaranya',
  exploreHint:
    'Ketuk gambar untuk membuka layar penuh. Tombol bulat memutar suaranya.',
  emptyTitle: 'Belum ada suara di kategori ini',
  quizTitle: 'Tebak suaranya',
  quizQuestion: 'Suara apa ini?',
  quizHint: 'Dengar sekali lagi kalau perlu, lalu pilih gambarnya.',
  quizScore: 'Benar',
  quizCorrect: 'Tepat!',
  quizWrong: 'Belum tepat.',
  quizAnswer: (name: string) => `Itu suara ${name}.`,
  quizNext: 'Lanjut',
  quizFinish: 'Lihat hasil',
  quizResultKicker: 'RONDE SELESAI',
  quizResultScore: (score: number, total: number) => `${score} dari ${total} benar`,
  quizAgain: 'Main lagi',
  quizToExplore: 'Jelajah dulu',
  quizBest: 'Rekor',
  quizNoBest: 'Belum ada rekor',
  quizRecord: 'Rekor baru!',
  quizRun: (index: number, total: number) => `Ronde ${index} dari ${total}`,
  quizChoices: 'Pilihan gambar',
  playAria: (name: string) => `Putar suara ${name}`,
  playQuestion: 'Putar suara soal ini',
  openAria: (name: string) => `Buka gambar ${name} di layar penuh`,
  choiceAria: (index: number) => `Pilihan gambar ${index}`,
  artAria: (mode: string) => `Tampilkan gambar versi ${mode}`,
  loadingArt: 'Menyiapkan gambar',
} as const

/** Score bands for the end-of-run screen, best ratio first. */
export const RESULT_BANDS: readonly {
  minRatio: number
  title: string
  text: string
}[] = [
  {
    minRatio: 1,
    title: 'Telinga emas!',
    text: 'Semua suara kamu kenali. Tidak ada yang lolos.',
  },
  {
    minRatio: 0.75,
    title: 'Telinga tajam.',
    text: 'Hampir sempurna. Ulangi sekali lagi untuk menyapu sisanya.',
  },
  {
    minRatio: 0.5,
    title: 'Lumayan!',
    text: 'Setengah jalan. Jelajah dulu, lalu tebak lagi.',
  },
  {
    minRatio: 0,
    title: 'Pelan-pelan dulu.',
    text: 'Dengarkan semua suaranya di mode jelajah, lalu kembali ke sini.',
  },
]

export function resultBand(score: number, total: number) {
  const ratio = total > 0 ? score / total : 0
  return (
    RESULT_BANDS.find((band) => ratio >= band.minRatio) ??
    RESULT_BANDS[RESULT_BANDS.length - 1]
  )
}

export const SUARA_NOTES = {
  title: 'Cara mendengar',
  rows: [
    'Setiap kartu memutar rekaman asli berlisensi CC; kredit suara tampil di layar penuh.',
    'Tombol besar memutar suara; ketuk gambarnya untuk membuka layar penuh.',
    'Piksel adalah ilustrasi 8-bit; Real memakai foto asli dengan kredit foto.',
    'Kalau rekaman gagal dimuat, suara sintesis cadangan yang berbunyi.',
    'Di mode tebak, nilai disimpan di perangkat ini saja.',
  ],
  footer: 'Telinga Emas · cartridge suara · dibuat untuk didengar.',
  footerShelf: 'Kembali ke rak',
} as const
