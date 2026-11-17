# KELUARGA KECIL-KECILAN
### Sebuah cartridge kenangan

> Dari hari pertama bertemu, sampai tangan kecil yang mengubah segalanya.

## 1. Ini game apa?

Keluarga Kecil-Kecilan adalah game cerita pixel bergaya Game Boy Color. Kamu
berjalan di dunia kecil, memeriksa benda, membaca pikiran, dan mengingat. Tidak
ada pertarungan, tidak ada nyawa, tidak ada game over.

Bab 1, **Tentang Aku**, sudah bisa dimainkan di `/keluarga`.

Cerita utamanya adalah cerita keluargamu:

- bagaimana kamu bertemu istrimu,
- bagaimana kamu memintanya menjadi pacar,
- bagaimana kamu memintanya menjadi istri,
- masa kehamilan,
- persalinan,
- dan bayimu.

Game ini bukan biografi lengkap. Ini album kenangan yang bisa dimainkan.

## 2. Pilar desain

1. **Cerita dulu, game kemudian.** Setiap sistem ada untuk melayani cerita,
   bukan menggantikannya.
2. **Tidak ada kalah.** Kamu tidak bisa kehilangan dia. Ketegangan datang dari
   perasaan dan pilihan, bukan dari hukuman.
3. **Pilihan lembut.** Pilihan mengubah satu kalimat, satu barang kenangan, atau
   satu detail di epilog. Cerita yang sudah terjadi tetap terjadi.
4. **Barang kenangan, bukan koleksi.** Payung, tiket, kotak cincin, hasil USG,
   kaus kaki bayi. Semuanya masuk ke Album Kenangan.
5. **Nama dan tempat yang jelas.** Satu nama untuk satu orang, satu nama untuk
   satu tempat. Semua tercatat di `00-cast-dan-lokasi.md`.
6. **Kamu tidak perlu menyentuh kode.** Kamu mengisi cerita; aku yang membangun
   game-nya.

## 3. Bahasa dan rilis

- **Bahasa:** Indonesia.
- **Rilis:** publik di shelf untuk sementara.
- **Route:** `/keluarga` (cartridge 04).
- **Privasi:** situs ini publik. Nama asli, alamat, tempat kerja, foto, dan
  detail medis hanya dipakai kalau kamu dan keluarga setuju. Kita bisa memakai
  nama panggilan, inisial, atau nama fiksi.
- **Perspektif:** awalnya dari sudut pandangmu. Kalau istrimu mau, kita bisa
  menambahkan sudut pandangnya, terutama untuk bab kehamilan dan persalinan.

## 4. Struktur cerita

| Bab | Judul | Inti | Status |
| --- | --- | --- | --- |
| 1 | **Tentang Aku** | Dunia sebelum dia: kamar, kebiasaan, hal yang kamu cari | **Bisa dimainkan** |
| 2 | **Hari Pertama** | Tempat pertama bertemu, kesan pertama, percakapan pertama | Belum |
| 3 | **Pertanyaan Pertama** | Meminta dia menjadi pacar; keberanian dan deg-degan | Belum |
| 4 | **Pertanyaan Kedua** | Meminta dia menjadi istri; tempat dan persiapan | Belum |
| 5 | **Menunggu Kamu** | Kehamilan: pemeriksaan, kamar bayi, nama | Belum |
| 6 | **Malam Terpanjang** | Persalinan: ruang tunggu, dukungan, kehadiran | Belum |
| 7 | **Rumah** | Bayi, hari-hari pertama, epilog | Belum |

Angka dan judul masih bisa berubah. Yang penting urutannya terasa seperti
perjalanan, bukan daftar.

## 5. Cara bermain (versi sekarang)

- **Jalan** dengan panah / WASD, atau D-pad di layar.
- **Periksa / lanjut** dengan tombol A, Spasi, atau Enter. Di HP, ketuk kotak
  dialog untuk melanjutkan.
- **Dialog** maju satu kalimat setiap kali; pilihan muncul sebagai kalimat,
  bukan ujian.
- **Tiga kenangan** dari benda di kamar cukup untuk membuka jendela dan
  menyelesaikan Bab 1.
- **Simpan otomatis** setelah memeriksa benda, memilih, atau membuka menu.
- **Menu** berisi lanjut dan kembali ke judul.

Belum ada di versi ini: Album Kenangan, tap-to-walk, audio, dan bab 2.

## 6. Dunia dan visual

- Layar internal 160 × 144, diperbesar dengan skala pixel yang tajam.
- Ubin 16 × 16, gerak empat arah, sprite berjalan dua frame.
- Palet terbatas per bab. Bab 1 memakai kayu hangat, krem, dan tosca.
- Tempat asli disederhanakan menjadi 2–4 peta kecil per bab. Yang penting
  dikenali, bukan replika persis.
- Semua aset original. Kita meminjam *rasa* Game Boy Color, bukan sprite, peta,
  atau musik Pokémon.
- Teks dialog memakai ukuran yang nyaman dibaca di HP, bukan font pixel 8 px
  yang dipaksa kecil.

## 7. Suara (rencana)

- Musik chiptune original, satu tema per bab, dengan satu motif kecil yang
  berulang di sepanjang cerita.
- Efek suara: langkah, hujan, teks, bel rumah sakit, detak jantung, bayi.
- Tombol bisu tersimpan; suara hanya mulai setelah pemain menekan tombol.

Bab 1 masih tanpa audio. Itu masuk tahap polish setelah ceritanya disetujui.

## 8. Cara kita bekerja

1. **Kamu isi bahan mentah.** Poin-poin, voice note, foto, nama, tempat. Tidak
   perlu prosa jadi.
2. **Aku susun lembar bab.** Adegan, peta, dialog, pilihan, aset, musik.
3. **Kamu review.** Ganti kalimat yang terasa salah; tandai yang privat.
4. **Aku bangun dan kita mainkan di HP.** Kalau rasanya sudah benar, lanjut bab
   berikutnya.

## 9. Status

Sudah jadi:

- identitas game: **Keluarga Kecil-Kecilan**,
- route `/keluarga` dan cartridge 04 di shelf,
- kerangka teknis dan vertical slice Bab 1,
- character creator dengan nama dan pilihan penampilan,
- kamar Banda Aceh: kasur, rak buku, dua jendela, meja belajar, laptop, alat
  elektronik, lemari, kipas angin, AC,
- dialog, tiga kenangan, pilihan lembut di jendela, layar penutup bab,
- simpan/lanjutkan di browser,
- kontrol keyboard dan D-pad/A untuk HP.

Berikutnya:

1. Review Bab 1 dan perbaiki kalimat yang terasa belum tepat.
2. Lengkapi nama orang tua, usia/tahun, tempat pertama bertemu, makanan/lagu,
   dan satu benda kenangan.
3. Isi `03-hari-pertama.md` kalau sudah siap menulis Bab 2.
4. Audio, Album Kenangan, dan bab-bab berikutnya.

Dokumen pendamping:

- `00-cast-dan-lokasi.md` — nama, orang, tempat, privasi.
- `01-tentang-aku.md` — bahan dan hasil Bab 1.
- `02-kerangka-teknis.md` — arsitektur game dan cara menambah isi.
- `03-hari-pertama.md` — lembar kerja Bab 2 (menunggu bahan).
