/**
 * The shelf: playable stories plus the three books that are still being
 * written. Adding a story means dropping it in `stories/` and adding a row
 * here — the landing shelf and the reader both read from this list.
 */

import { coverMain, coverSoon } from './art/covers'
import type { BookEntry } from './types'
import { kebun } from './stories/kebun'
import { gigi } from './stories/gigi'
import { rakbuku } from './stories/rakbuku'
import { vaksin } from './stories/vaksin'

export const STORIES = [vaksin, kebun, gigi, rakbuku] as const

export const storyById = (id: string | null) =>
  STORIES.find((story) => story.id === id) ?? null

export const BOOKS: readonly BookEntry[] = [
  {
    id: 'vaksin',
    title: 'Kaluna Berani Vaksin',
    meta: '15 halaman · suara',
    ready: true,
    isNew: false,
    keywords: 'vaksin suntik klinik dokter imunisasi berani sakit',
    cover: coverMain,
  },
  {
    id: 'kebun',
    title: 'Kaluna & Mamau di Kebun Nenda',
    meta: '8 halaman · suara',
    ready: true,
    isNew: false,
    keywords: 'kebun nenda bunga kupu kupu taman menanam tomat',
    cover: () => coverSoon('kebun'),
  },
  {
    id: 'gigi',
    title: 'Kaluna Rajin Sikat Gigi',
    meta: '7 halaman · suara',
    ready: true,
    isNew: false,
    keywords: 'gigi sikat mandi pagi malam pasta lagu aiueo',
    cover: () => coverSoon('gigi'),
  },
  {
    id: 'rakbuku',
    title: 'Rak Buku Kaluna',
    meta: '6 halaman · game',
    ready: true,
    isNew: true,
    keywords: 'rak buku perpustakaan merapikan hitung main game baca',
    cover: () => coverSoon('rakbuku'),
  },
  {
    id: 'bintang',
    title: 'Malam Bintang Bersama Papa',
    meta: 'Segera hadir',
    ready: false,
    isNew: false,
    keywords: 'malam bintang papa langit tidur',
    cover: () => coverSoon('bintang'),
  },
  {
    id: 'piknik',
    title: 'Piknik Bersama Oma & Opa',
    meta: 'Segera hadir',
    ready: false,
    isNew: false,
    keywords: 'piknik oma opa taman makan',
    cover: () => coverSoon('piknik'),
  },
  {
    id: 'hujan',
    title: 'Hujan di Rumah Ayah Chiek',
    meta: 'Segera hadir',
    ready: false,
    isNew: false,
    keywords: 'hujan ayah chiek rumah payung',
    cover: () => coverSoon('hujan'),
  },
]
