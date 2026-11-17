# Kerangka Teknis

Status: **vertical slice Bab 1 playable**. Dokumen ini menjelaskan bagian yang
sudah ada, batasannya, dan cara menambah isi tanpa membongkar mesinnya.

## 1. Route dan cartridge

- Route: `/keluarga` (`ROUTES.keluarga` di `src/app/routes.ts`).
- Halaman: `src/features/keluarga/KeluargaPage.tsx`, lazy-loaded dari
  `src/app/AppRouter.tsx`.
- Cartridge: nomor 04 di `src/content/projects.ts`.
- Semua static, tanpa backend. Save memakai `localStorage`.

## 2. Pembagian file

```
src/content/keluarga.ts              semua teks, label, pilihan penampilan,
                                     objek, tiga pikiran, dan lokasi
src/features/keluarga/
  types.ts                           tipe karakter, save, objek, dialog
  character.ts                       sprite 14 × 20 berlapis (kulit, rambut,
                                     baju, aksesori) + shadow
  game.ts                            peta kamar 14 × 9, collision, gerak,
                                     interaksi, kamera, renderer Canvas
  RoomView.tsx                       RAF loop, keyboard, API untuk halaman
  KeluargaPage.tsx                   state machine, UI, dialog, creator,
                                     save/continue, kontrol
  CharacterPreview.tsx               cermin besar di layar creator
  save.ts                            baca/tulis localStorage
  keluarga.css                       shell handheld + layar + kontrol + kartu
```

Prinsipnya sama dengan cartridge lain: **data cerita tidak dicampur ke
renderer**. Kalau mau mengganti kalimat, nama objek, atau pilihan, hampir semua
ada di `src/content/keluarga.ts`.

## 3. Layar dan peta

- Resolusi internal: **160 × 144**.
- Ubin: **16 × 16**.
- Peta kamar: **14 × 9** ubin; kamera hanya bergeser horizontal.
- Posisi pemain disimpan dalam koordinat ubin; render memakai interpolasi
  antar-ubin (langkah 0,16 detik).
- Collision: dinding dari string peta + objek dengan `solid: true`.
- Interaksi: tombol A memeriksa ubin tepat di depan pemain. Objek yang menempati
  beberapa ubin bisa diperiksa dari sisi mana pun.
- Rendering: semua perabot digambar dari Canvas 2D (tidak ada file gambar),
  lalu ditumpuk berdasarkan `y + h`. Pemain ikut diurutkan supaya bisa berada di
  depan/berlakang meja dan lemari.

## 4. Data kamar dan objek

`game.ts` menyimpan:

- `ROOM_ROWS` — dinding dan lantai.
- `LAYOUT` — posisi, ukuran, collision, dan tipe setiap objek.
- `ROOM_OBJECTS` — hasil gabungan `LAYOUT` dengan `OBJECT_COPY` dari content.

`content/keluarga.ts` menyimpan `OBJECT_COPY` per id:

```ts
bed: {
  label: 'Kasur',
  memory: true,
  lines: ['Kasur ini cuma cukup untuk satu orang.', '...'],
}
```

### Menambah objek baru

1. Tambah entri di `OBJECT_COPY` (`label`, `memory`, `lines`).
2. Tambah posisi di `LAYOUT` (`id`, `kind`, `x`, `y`, `w`, `h`, `solid`,
   `wall`).
3. Kalau butuh gambar baru, tambah cabang di `drawStandingObjects` atau
   `drawWallObject` dan fungsi gambarnya.
4. Pastikan ada ubin lantai di depan objek untuk berdiri dan memencet A.

Tiga objek pertama dengan `memory: true` yang diperiksa membuka jendela. Jumlah
ini ada di `GAME.memoryGoal`.

## 5. Alur state

```
title ── MULAI BARU ──> creator ── INI AKU ──> play
  │                                              │
  └── LANJUTKAN (save) ──────────────────────────┘

play:
  intro card -> intro dialogue -> free roam
  free roam -> dialogue -> (tiga kenangan) -> window choice
  window choice -> complete -> stay / title
```

State utama di `KeluargaPage.tsx`:

- `phase`: `title` / `creator` / `play`
- `save`: satu sumber kebenaran untuk karakter, progres, dan posisi
- `dialogue`, `choiceOpen`, `introOpen`, `menuOpen`, `showComplete`
- `nearby`: objek yang sedang dihadapi

`RoomView` hanya mengurus simulasi dan gambar; halaman mengurus cerita.

## 6. Save

Key: `ihsnn:keluarga:save`

```json
{
  "version": 1,
  "character": {
    "name": "Ihsnn",
    "appearance": {
      "skin": "warm",
      "hairStyle": "short",
      "hairColor": "black",
      "shirt": "teal",
      "accessory": "none"
    }
  },
  "examined": ["bed", "desk", "windowNorth"],
  "thought": "Ada sesuatu yang belum datang...",
  "chapterComplete": true,
  "player": { "x": 6, "y": 1, "dir": "up" },
  "updatedAt": 1760000000000
}
```

- Ditulis setiap kali benda baru diperiksa, pilihan diambil, menu dibuka, atau
  kembali ke judul.
- Hanya satu slot. Belum ada ekspor/impor atau multiple save.
- Kalau localStorage tidak tersedia, game tetap jalan untuk sesi itu.

## 7. Kontrol

- **Keyboard:** panah/WASD, Spasi/Enter untuk A, Esc untuk menu.
- **Layar sentuh:** D-pad 40–42 px, tombol A 52–58 px, kotak dialog bisa
  diketuk.
- **Aksesibilitas:** tombol asli (bukan div), label ARIA, teks dialog memakai
  font body yang terbaca, `aria-live` pada dialog, focus ring emas.
- Saat dialog/menu/pilihan terbuka, gerak dan D-pad dinonaktifkan.

## 8. Batasan saat ini

- Baru satu kamar dan satu bab.
- Belum ada audio.
- Belum ada Album Kenangan, multiple save, atau tap-to-walk.
- Belum ada editor cerita di browser. Cerita masih ditulis di
  `src/content/keluarga.ts` dan diubah oleh developer.
- Sprite karakter dibuat dari kode; belum ada sprite sheet atau animasi khusus.
- Peta masih hard-coded; belum ada format peta eksternal.

## 9. Cara menambah Bab 2 nanti

Tidak perlu mengganti engine untuk satu kamar lagi. Yang dibutuhkan:

1. Data lokasi baru (peta, objek, spawn, palet).
2. Data adegan/dialog baru.
3. Transisi dari akhir Bab 1 ke Bab 2, plus chapter registry.
4. Save versi 2 yang menyimpan bab aktif dan progres per bab.

Saat ini `game.ts` masih mengasumsikan satu peta. Langkah berikutnya adalah
memindahkan `ROOM_ROWS`/`LAYOUT` ke data peta dan membuat `Chapter` berisi
beberapa peta/adegan. Itu perubahan terarah, bukan rewrite.

## 10. Verifikasi

- `npx tsc -b` — bersih.
- `npx eslint .` — bersih.
- `npm run build` — sukses.
- Headless Chrome: 1440 px, 390 px, dan 320 px; character creator, kamar,
  dialog, pilihan, complete, save/continue; tidak ada error console.
