# GAME SQL — referensi & brief

> Dicatat 19 November 2026. Masih ide; belum ada kode, belum ada rute.
> Bentuk yang diminta: **game tentang bekerja dengan SQL — tutorial dulu, lalu
> beberapa task.**

## 1. Referensi: Broken, Repair!

[Broken, Repair! — Eduardo Scarpato](https://eduardscarpato.itch.io/broken-repair).

| | |
| --- | --- |
| Asal | Ludum Dare 60 ("Old Tech"), dibuat 72 jam |
| Mesin | Godot; rilis HTML5, Windows, Linux |
| Genre | pixel-art simulation, repair shop |
| Durasi | ±15 menit |
| Rating | 4,3 / 5 dari 84 penilaian |
| Tag | cute, horror, incremental, tidying-up, upgrades |

Loop-nya: klien menaruh GameToy rusak di meja → bersihkan debu dengan kuas →
bongkar cangkang → ganti bagian yang mati → pasang mod → kirim → terima uang dan
surat dari klien. Ada rahasia kecil dan satu twist yang bikin akhirnya diingat.

### Yang layak dipinjam

1. **Belajar sambil mengerjakan pekerjaan pertama.** Tidak ada manual. Mekanik
   diperkenalkan satu per satu oleh perbaikan pertama, bukan oleh layar bantuan.
2. **Meja kerja, bukan menu.** Alat dan benda ada di meja; pemain belajar dari
   bentuknya.
3. **Klien membawa brief pendek dan hadiah kecil.** Surat itu murah dibuat, tapi
   terasa personal — pengganti cutscene.
4. **Sesi pendek dengan ujung yang jelas.** Selesai dalam sekali duduk.
5. **Satu kejutan.** Ada sesuatu yang tidak dijanjikan di depan.

### Yang tidak dipinjam

Aset, nama "GameToy", twist horornya, dan ekonomi upgrade-nya. Yang diambil
polanya saja: kerja tangan yang memuaskan, klien yang bicara, sesi pendek.

## 2. Konsep: bekerja dengan SQL

Satu kalimat: **kamu petugas data di sebuah meja kerja; setiap klien datang dengan
data yang berantakan, dan satu-satunya alatmu adalah query.**

Alurnya tiga bagian, persis seperti yang diminta:

1. **Tutorial (bekerja sambil dibimbing).** Klien pertama duduk, brief-nya satu
   kalimat, dan meja hanya menampilkan satu kolom query + satu tabel hasil. Tiap
   langkah menambah satu klausa baru sampai laporan pertama jadi.
2. **Papan task.** 6–8 pekerjaan bertingkat dengan brief bahasa manusia, bukan
   "tulis JOIN". Pemain memilih urutannya sendiri.
3. **Meja bebas.** Setelah task terakhir, database yang sama bisa di-query
   sesuka hati — hadiah untuk yang mau tinggal lebih lama.

Yang membuatnya terasa game, bukan latihan: klien, meja, dan hasil yang langsung
terlihat. Query yang salah bukan "nilai 60", tapi laporan yang tidak masuk akal —
dan itu justru pelajarannya.

## 3. Kurikulum tutorial (7 langkah)

Satu langkah = satu klausa baru = satu query yang harus lulus. Database contoh
kecil (3–4 tabel) dipakai dari langkah pertama sampai task terakhir, supaya
pemain kenal datanya.

| # | Klausa | Brief klien (contoh) |
| --- | --- | --- |
| 1 | `SELECT *` | "Tunjukkan semua isi buku catatanmu." |
| 2 | kolom tertentu | "Aku cuma butuh nama dan kota." |
| 3 | `WHERE` | "Yang belum bayar saja." |
| 4 | `ORDER BY` + `LIMIT` | "Lima yang paling mahal, urut dari atas." |
| 5 | `COUNT` / `SUM` / `AVG` + `GROUP BY` | "Berapa omzet tiap hari minggu lalu?" |
| 6 | `JOIN` | "Gabungkan pesanan dengan nama pembelinya." |
| 7 | `INSERT` / `UPDATE` / `DELETE` | "Harga ini salah; betulkan, lalu tunjukkan barisnya." |

Langkah 7 wajib memakai `SELECT` dulu untuk memastikan baris yang benar sebelum
diubah, dan hasilnya diperiksa dari jumlah baris yang berubah — bukan dari teks
query-nya.

## 4. Beberapa task (setelah tutorial)

1. "Cari pelanggan yang belum pernah membeli." (anti-join / `NOT IN`)
2. "Siapa tiga pembeli dengan belanja terbanyak?" (`GROUP BY` + `ORDER BY`)
3. "Berapa rata-rata belanja per kota, yang di atas 50 ribu saja?" (`HAVING`)
4. "Daftar pesanan beserta nama dan kota pembeli." (`JOIN`)
5. "Perbaiki dua harga yang salah." (`UPDATE` + verifikasi)
6. "Tutup buku: laporan satu halaman per bulan." (`JOIN` + `GROUP BY` + `HAVING`
   — task penutup, boleh banyak baris kode).

Nada brief tetap seperti klien, bukan seperti soal ujian. Kalau pemain salah,
kliennya bingung, bukan marah.

## 5. Cara memeriksa jawaban (teknis)

- **SQLite asli di browser, bukan backend.** `sql.js` atau
  `@sqlite.org/sqlite-wasm` menjalankan database di memori; query pemain tidak
  pernah dikirim ke mana pun. Ini satu-satunya cara yang jujur — SQL tiruan
  (regex/parser sendiri) akan rapuh dan cepat terasa palsu.
- **Bandingkan hasil, bukan teks query.** Sahkan dengan membandingkan himpunan
  baris + nama kolom terhadap hasil yang diharapkan. Urutan hanya diwajibkan kalau
  brief-nya minta urut.
- **Tampilkan selisihnya.** "Diharapkan 3 baris, kamu dapat 11" jauh lebih
  mengajari daripada "salah".
- **Pesan error SQLite ditampilkan apa adanya.** Syntax error adalah bagian dari
  pelajaran; jangan disamarkan jadi bahasa manusia.
- **Bobot unduhan.** WASM SQLite beberapa ratus KB. Muat hanya di rute ini
  (lazy, seperti cartridge lain) supaya bundle awal tidak ikut membengkak.
- **Tanpa server.** Sesuai aturan repo: kalau nanti butuh sesuatu yang dinamis,
  itu Worker sungguhan — bukan kembali ke Pages Functions.

## 6. Yang belum diputuskan

- Nama dan rute (`/sql`? nama yang terdengar seperti meja kerja?).
- Tema datanya: toko, perpustakaan, warung, atau kotak GameToy sebagai penghormatan
  ke referensi.
- Apakah semua 7 langkah tutorial wajib, atau boleh diloncati kalau pemain sudah
  bisa.
- Bahasa: antarmuka Indonesia, kata kunci SQL tetap Inggris. Perlu dipastikan
  istilah seperti "baris", "kolom", "gabung" dipakai konsisten.
- Penyimpanan progres: kemungkinan `ihsnn:sql:progress`, satu slot, seperti
  cartridge lain.
- Apakah ada nilai/nyawa. Rekomendasi awal: tidak ada — salah itu bagian dari
  kerja, bukan hukuman.

## 7. Kalau mulai

- [ ] Putuskan nama, rute, dan tema data.
- [ ] Tulis database contoh (skema + 30–60 baris) sebagai satu file data.
- [ ] Bangun meja: editor query, tombol jalan, tabel hasil, panel brief klien.
- [ ] Isi tutorial 7 langkah dan pemeriksa hasilnya.
- [ ] Tambah 6 task + layar penutup.
- [ ] Tambahkan ke shelf (`src/content/projects.ts`) setelah bisa dimainkan.
