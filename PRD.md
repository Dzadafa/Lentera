# PRD — TautJiwa Mobile (Android)

## Executive Summary
- **Produk**: TautJiwa Mobile — aplikasi Android native (React Native + Expo).
- **Domain**: Healthcare / Mental Health, Hackathon UGM 2026.
- **Ringkasan**: Aplikasi anonim dan 100% on-device untuk skrining kondisi mental mandiri (DASS-21), pertolongan penenang instan, dan panduan langkah-demi-langkah menuju faskes BPJS gratis.

## Problem Statement
Mahasiswa dan pekerja muda di Indonesia mengalami stres dan burnout, tetapi enggan mencari bantuan karena tiga hambatan utama:
1. **Kebingungan**: tidak tahu apakah kondisinya kelelahan biasa, stres, atau gangguan klinis — takut self-diagnose dari media sosial.
2. **Kejutan biaya**: mengira layanan psikolog selalu berbayar ratusan ribu rupiah, padahal jalur BPJS gratis namun alurnya tidak dipahami.
3. **Rasa malu dan takut**: takut dicap "gila", dan bingung harus berkata apa kepada dokter saat konsultasi pertama.

Treatment gap nasional melebihi 80 persen: mayoritas orang dengan gejala tidak pernah mencari bantuan profesional.

## Goals & Success Metrics
- **G1**: Pengguna bisa masuk ke latihan penenang dalam 1 ketukan tanpa mengisi apa pun. Metrik: waktu dari cold start ke latihan napas aktif di bawah 5 detik.
- **G2**: Skrining DASS-21 selesai dengan skoring otomatis 3 dimensi. Metrik: kalkulasi skor selesai di bawah 100 ms setelah soal ke-21 dijawab.
- **G3**: Pengguna tier akut mendapat satu jalan konkret ke faskes. Metrik: alur panduan BPJS dapat diselesaikan dalam maksimum 3 layar.
- **G4**: Privasi total. Metrik: 0 request jaringan keluar selama seluruh sesi skrining dan hasil.

## Non-Goals
- Bukan pengganti psikolog, psikiater, atau layanan gawat darurat medis.
- Tidak menyediakan telekonsultasi video, resep obat, atau diagnosis klinis definitif.
- Tidak menyimpan rekam skrining di server cloud terpusat.
- Tidak memiliki sistem akun pengguna, login, atau profil publik.
- Tidak melakukan pelabelan diagnosis mayor (depresi mayor, bipolar, dan sejenisnya).

## User Stories & Personas
- **Persona A — Rian (21)**: mahasiswa teknik semester akhir, insomnia dan cemas menghadapi skripsi, takut disebut lemah oleh teman satu angkatan. Kebutuhan: validasi dan langkah mandiri tanpa ketahuan.
- **Persona B — Sarah (24)**: pekerja muda yang burnout, butuh grounding cepat di meja kerja tanpa memicu perhatian rekan kantor. Kebutuhan: latihan diskret dan cepat.
- **Persona C — Dimas (19)**: mahasiswa perantauan, tidak tahu cara berobat dengan BPJS. Kebutuhan: panduan faskes yang sangat konkret dan naskah kalimat untuk loket.
- **Story 1**: Sebagai pengguna yang sedang panik, saya ingin menekan satu tombol dan langsung dibimbing bernapas, agar saya tidak perlu menjawab pertanyaan apa pun saat itu.
- **Story 2**: Sebagai pengguna, saya ingin tahu tingkat kondisi saya lewat instrumen yang jelas, agar saya tidak menebak-nebak dari media sosial.
- **Story 3**: Sebagai pengguna tier akut, saya ingin tahu persis langkah ke puskesmas dan apa yang harus saya ucapkan, agar saya tidak mundur di menit terakhir.
- **Story 4**: Sebagai pengguna yang sedang di ruang publik, saya ingin aplikasi ini bisa menyamar, agar privasi saya aman.

## Functional Requirements
- **FR-01**: Aplikasi menyediakan beranda dengan dua pintu: pintu pertolongan instan dan pintu skrining.
- **FR-02**: Pintu pertolongan instan membuka Ruang Tenang tanpa satu pun pertanyaan.
- **FR-03**: Ruang Tenang menyediakan napas terpandu dengan haptic yang sinkron dengan ritme napas.
- **FR-04**: Ruang Tenang menyediakan minimal tiga alat: napas terpandu, grounding 5-4-3-2-1, dan tulis-lepaskan.
- **FR-05**: Aplikasi menyediakan kuis DASS-21 berisi 21 butir dengan skala 0 sampai 3.
- **FR-06**: Aplikasi menghitung skor depresi, kecemasan, dan stres secara otomatis dari jawaban.
- **FR-07**: Aplikasi menampilkan pertanyaan cek krisis sebelum halaman hasil dirender.
- **FR-08**: Jawaban yang mengindikasikan risiko ekstrem memicu emergency interceptor.
- **FR-09**: Emergency interceptor menampilkan modal ramah dengan akses langsung ke hotline Kemenkes 119 ekstensi 8.
- **FR-10**: Halaman hasil dibagi tiga tier: rendah, sedang, dan akut, masing-masing dengan satu CTA utama.
- **FR-11**: Setiap halaman hasil menampilkan disclaimer bahwa ini skrining awal, bukan diagnosis.
- **FR-12**: Setiap halaman menampilkan tombol tutup cepat yang mengalihkan layar ke antarmuka netral.
- **FR-13**: Aplikasi menyediakan panduan faskes BPJS tiga langkah termasuk cara cek faskes tingkat pertama.
- **FR-14**: Aplikasi menyediakan naskah kalimat siap pakai untuk disampaikan ke petugas loket.
- **FR-15**: Aplikasi membuat surat ringkasan gejala satu halaman berformat PDF yang dapat dibagikan.
- **FR-16**: Aplikasi menyediakan mode kerja yang mengubah tampilan menjadi antarmuka catatan polos.
- **FR-17**: Aplikasi menyimpan check-in harian mood dan energi secara lokal.
- **FR-18**: Aplikasi menyimpan seluruh catatan skrining pada basis data lokal perangkat.

## Non-Functional Requirements
- **NFR-01 Privasi**: 100 persen data skrining tersimpan lokal di perangkat, tanpa sinkronisasi cloud.
- **NFR-02 Performa**: cold start ke layar interaktif pertama selesai di bawah 2 detik pada perangkat Android kelas menengah.
- **NFR-03 Ukuran**: APK release untuk satu ABI berada di bawah 40 MB.
- **NFR-04 Aksesibilitas**: seluruh kontrol memiliki label aksesibilitas dan rasio kontras teks minimal 4.5 banding 1.
- **NFR-05 Keandalan**: aplikasi tidak menampilkan layar putih atau crash saat data lokal masih kosong.
- **NFR-06 Kepatuhan**: aplikasi tidak mengirim data personal ke jaringan pada kondisi apa pun.

## Acceptance Criteria
1. Menekan tombol pintu pertolongan instan membuka latihan napas aktif dalam maksimum 1 ketukan tanpa pertanyaan.
2. Kuis DASS-21 memuat tepat 21 butir soal dengan 4 opsi jawaban bernilai 0 sampai 3.
3. Skoring menghasilkan tiga angka dimensi (depresi, kecemasan, stres) dan totalnya benar terhadap kunci perhitungan DASS-21 pada 100 persen kasus uji.
4. Pertanyaan cek krisis muncul sebelum halaman hasil tampil, dan jawaban positif memicu modal interceptor dalam maksimum 1 detik.
5. Tombol hotline pada modal interceptor melakukan panggilan ke nomor 119 ekstensi 8.
6. Tombol tutup cepat mengalihkan layar ke antarmuka netral dalam maksimum 300 ms.
7. Setiap halaman hasil menampilkan teks disclaimer skrining dan tepat satu tombol CTA utama.
8. Surat ringkasan gejala ter-render sebagai PDF satu halaman dan dapat dibagikan melalui lembar berbagi sistem.
9. Mode kerja menyembunyikan seluruh kata bermuatan mental dan menampilkan antarmuka catatan polos.
10. `npx tsc --noEmit` selesai dengan 0 error pada seluruh codebase.
11. APK release arm64-v8a ter-build dan terpasang pada perangkat Android 14 fisik melalui ADB.

## Out of Scope
- Telekonsultasi video dan pesan dengan psikolog berlisensi.
- Peresepan obat, farmasi, dan integrasi rekam medis rumah sakit.
- Akun pengguna, autentikasi, dan sinkronisasi lintas perangkat.
- Dinding cerita publik dan peer chat sebaya pada rilis hackathon ini.
- Integrasi API Mobile JKN secara langsung (panduan bersifat instruksional).
- Lokalisasi bahasa selain Bahasa Indonesia.

## Verification Plan
- **V1 Typecheck**: menjalankan `npx tsc --noEmit` dan memastikan 0 error.
- **V2 Unit Test**: menguji fungsi skoring DASS-21 dengan kasus batas (semua nol, semua tiga, campuran) memakai Jest.
- **V3 Build**: menjalankan `cd android && ./gradlew assembleRelease` dan memverifikasi APK terbentuk.
- **V4 Device Test**: memasang APK via `adb install -r` lalu menyusuri alur beranda, ruang tenang, kuis, hasil, dan panduan BPJS.
- **V5 Visual Test**: menangkap tangkapan layar tiap layar melalui `adb exec-out screencap` dan memeriksa tipografi, kontras, dan tata letak.
- **V6 Offline Test**: mengaktifkan mode pesawat dan memastikan seluruh alur inti tetap berfungsi.
- **V7 Privacy Test**: memantau log jaringan dan memastikan 0 request keluar selama sesi skrining.
