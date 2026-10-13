# Tasks

<!-- policy: Jalankan `npx tsc --noEmit` sebelum setiap commit. Jangan lewati pemeriksaan tipe.
     policy: Ambil semua nilai desain dari DESIGN.md; jangan mengarang nilai baru.
     policy: Seluruh data skrining disimpan lokal di SQLite; tidak ada transmisi jaringan data personal.
     policy: Setiap layar hasil wajib punya disclaimer skrining, tombol tutup cepat, dan akses emergency interceptor.
     policy: Selesaikan task P0 terlebih dahulu; jangan mulai P1 sebelum P0 hijau. -->

## P0

<!-- policy: Untuk section ini, jangan mengubah file di luar daftar `Files` pada tiap task. -->

- [ ] Scaffold proyek Expo React Native TypeScript dengan struktur direktori standar
  - **ID**: p0-scaffold
  - **Tags**: setup, expo, typescript
  - **Details**: Buat proyek Expo SDK terbaru dengan TypeScript strict, buat folder `src/screens`, `src/components`, `src/navigation`, `src/store`, `src/db`, `src/services`, `src/content`, `src/theme`, `src/types`; pasang `react-native-safe-area-context`, `react-native-svg`, `zustand`, `expo-sqlite`, `expo-haptics`, `expo-av`, `expo-print`, `expo-sharing`, `expo-router`.
  - **Files**: `package.json`, `app.json`, `tsconfig.json`, `src/App.tsx`
  - **Acceptance**: `npx tsc --noEmit` melaporkan 0 error; struktur folder ada; app ter-render tanpa crash di perangkat.
  - **Estimate**: 45m

- [ ] Bangun lapisan SQLite lokal dengan skema skrining, krisis, check-in, dan pengaturan
  - **ID**: p0-db-layer
  - **Tags**: database, sqlite, privacy
  - **Details**: Aktifkan `PRAGMA journal_mode = WAL`, `PRAGMA foreign_keys = ON`; buat tabel `screening_records`, `crisis_events`, `daily_checkins`, `settings`; sediakan helper query bertipe dan fungsi `initDatabase()`.
  - **Files**: `src/db/schema.ts`, `src/db/index.ts`, `src/types/db.ts`
  - **Acceptance**: `initDatabase()` dijalankan dua kali tidak melempar error; insert dan select pada keempat tabel berhasil; 0 request jaringan saat inisialisasi.
  - **Estimate**: 1h

- [ ] Implementasikan navigator bertipe dengan rute seluruh layar inti
  - **ID**: p0-navigation
  - **Tags**: navigation, typescript
  - **Details**: Definisikan union `ScreenRoute` untuk beranda, ruang tenang, kuis DASS-21, hasil tier, panduan BPJS, mode kerja, dan pengaturan; bungkus root dengan `SafeAreaProvider` dari `react-native-safe-area-context`.
  - **Files**: `src/navigation/routes.ts`, `src/navigation/RootNavigator.tsx`, `src/App.tsx`
  - **Acceptance**: Setiap rute dapat dinavigasi tanpa error tipe; `npx tsc --noEmit` 0 error; `SafeAreaProvider` membungkus root tree.
  - **Estimate**: 45m

- [ ] Bangun komponen global: emergency interceptor, tombol tutup cepat, dan banner disclaimer
  - **ID**: p0-global-safety
  - **Tags**: safety, crisis, ui
  - **Details**: Modal merah ramah berisi tombol panggil 119 ekstensi 8; tombol tutup cepat di pojok kanan atas yang mengalihkan layar ke antarmuka netral dalam 300 ms; komponen disclaimer teks tetap "Ini skrining awal, bukan diagnosis."
  - **Files**: `src/components/EmergencyInterceptor.tsx`, `src/components/QuickCloseButton.tsx`, `src/components/ScreeningDisclaimer.tsx`
  - **Acceptance**: Tombol interceptor memicu `Linking.openURL('tel:119')`; tombol tutup cepat berpindah layar di bawah 300 ms; `npx tsc --noEmit` 0 error.
  - **Estimate**: 1h

- [ ] Bangun beranda dua pintu dengan hierarki satu CTA per pintu
  - **ID**: p0-home-two-doors
  - **Tags**: ui, navigation
  - **Details**: Pintu satu adalah tombol besar "Aku sedang tidak baik sekarang" yang langsung membuka Ruang Tenang tanpa pertanyaan; pintu dua adalah tombol skrining DASS-21 dengan keterangan anonim tanpa akun.
  - **Files**: `src/screens/HomeScreen.tsx`
  - **Acceptance**: Pintu satu membuka Ruang Tenang dalam 1 ketukan tanpa isian; pintu dua membuka kuis; hanya satu tombol primer tampil per pintu.
  - **Estimate**: 1h

- [ ] Implementasikan fitur hero Ruang Tenang dengan napas terpandu haptic
  - **ID**: p0-ruang-tenang-haptic
  - **Tags**: hero, haptics, ui
  - **Details**: Lingkaran napas beranimasi dengan pola 4-4-4-4 dan Physiological Sigh; getaran perangkat sinkron tiap transisi fase memakai `expo-haptics`; sediakan fallback kilatan warna lembut bila perangkat tidak mendukung getaran; sertakan kontrol mulai, jeda, dan durasi.
  - **Files**: `src/screens/CalmRoomScreen.tsx`, `src/services/haptics.ts`, `src/components/BreathingCircle.tsx`
  - **Acceptance**: Pola getar terasa pada tiap transisi fase; fallback visual aktif bila getar tidak tersedia; sesi napas berjalan tanpa crash selama 5 menit berturut-turut.
  - **Estimate**: 2h

- [ ] Bangun konten 21 butir DASS-21 beserta mesin skoring tiga dimensi
  - **ID**: p0-dass21-engine
  - **Tags**: content, scoring, logic
  - **Details**: Simpan 21 butir dengan pemetaan ke dimensi depresi, kecemasan, dan stres serta skala 0 sampai 3; hitung skor per dimensi dan kalikan dua sesuai kunci DASS-21; tentukan tier rendah, sedang, atau akut.
  - **Files**: `src/content/dass21.ts`, `src/services/scoring.ts`, `src/types/assessment.ts`
  - **Acceptance**: Kasus semua nol menghasilkan total 0 pada tiga dimensi; kasus semua tiga menghasilkan skor maksimum 42 per dimensi; pengujian batas tier lulus 100 persen.
  - **Estimate**: 1.5h

- [ ] Bangun layar kuis DASS-21 dengan cek krisis sebagai gerbang wajib
  - **ID**: p0-quiz-screen
  - **Tags**: ui, safety, logic
  - **Details**: Tampilkan satu butir per layar dengan indikator progres; sisipkan pertanyaan cek krisis pikiran menyakiti diri sebelum halaman hasil dirender; jawaban positif langsung memicu emergency interceptor.
  - **Files**: `src/screens/QuizScreen.tsx`, `src/components/CrisisGateModal.tsx`
  - **Acceptance**: Kuis memuat tepat 21 butir; banyak soal sama dengan 21 pada semua jalur; jawaban krisis positif memicu interceptor di bawah 1 detik dan mencegah render hasil sebelum ditangani.
  - **Estimate**: 2h

- [ ] Bangun halaman hasil tiga tier dengan disiplin satu CTA
  - **ID**: p0-result-tiers
  - **Tags**: ui, logic, safety
  - **Details**: Tier rendah menampilkan validasi dan menyembunyikan seluruh rujukan klinis; tier sedang menampilkan rencana mandiri tujuh hari; tier akut menampilkan keselamatan lebih dahulu dengan satu CTA menuju panduan puskesmas.
  - **Files**: `src/screens/ResultScreen.tsx`, `src/components/TierCard.tsx`
  - **Acceptance**: Setiap tier menampilkan tepat satu tombol CTA utama; tier rendah tidak menampilkan tautan rujukan klinis; disclaimer tampil pada ketiga tier.
  - **Estimate**: 2h

## P1

- [ ] Bangun panduan faskes BPJS tiga langkah beserta naskah loket siap pakai
  - **ID**: p1-bpjs-guide
  - **Tags**: bantuan, content
  - **Details**: Alur tiga langkah dari cek faskes tingkat pertama, pengambilan surat rujukan, hingga layanan psikolog; sertakan naskah kalimat yang bisa dibaca pengguna kepada petugas loket.
  - **Files**: `src/screens/ReferralGuideScreen.tsx`, `src/content/referralScript.ts`
  - **Acceptance**: Alur selesai dalam maksimum 3 layar; naskah dapat disalin dengan satu ketukan; tidak ada tautan eksternal yang gagal dimuat dalam mode pesawat.
  - **Estimate**: 1.5h
  - **Blocked by**: p0-result-tiers

- [ ] Implementasikan generator surat ringkasan gejala satu halaman dalam format PDF
  - **ID**: p1-pdf-summary
  - **Tags**: pdf, export
  - **Details**: Susun ringkasan berisi tanggal, skor tiga dimensi, tier, dan catatan singkat; render via `expo-print` dan bagikan via `expo-sharing`.
  - **Files**: `src/services/pdfSummary.ts`, `src/screens/ResultScreen.tsx`
  - **Acceptance**: PDF ter-render tepat 1 halaman; lembar berbagi sistem terbuka; berkas tidak memuat data identitas pengguna.
  - **Estimate**: 1.5h
  - **Blocked by**: p0-result-tiers

- [ ] Implementasikan alat grounding 5-4-3-2-1 dan tulis-lepaskan di Ruang Tenang
  - **ID**: p1-grounding-tools
  - **Tags**: ui, tools
  - **Details**: Alat grounding interaktif lima langkah berbasis indra; kanvas tulis-lepaskan yang menghapus coretan setelah pengguna selesai menulis.
  - **Files**: `src/screens/CalmRoomScreen.tsx`, `src/components/GroundingCard.tsx`, `src/components/ThoughtShredder.tsx`
  - **Acceptance**: Kedua alat dapat dibuka dari Ruang Tenang dalam maksimum 1 ketukan; coretan benar-benar terhapus dari state setelah sesi berakhir.
  - **Estimate**: 2h
  - **Blocked by**: p0-ruang-tenang-haptic

- [ ] Implementasikan mode kerja yang menyamarkan antarmuka menjadi catatan polos
  - **ID**: p1-work-mode
  - **Tags**: privacy, ui
  - **Details**: Mode yang mengubah judul, ikon, dan label menjadi netral tanpa kata bermuatan mental; aktif melalui sakelar di pengaturan.
  - **Files**: `src/screens/SettingsScreen.tsx`, `src/theme/stealth.ts`, `src/store/appStore.ts`
  - **Acceptance**: Setelah mode aktif, 0 kata "jiwa", "mental", atau "sedih" tampil di layar beranda dan Ruang Tenang; preferensi tersimpan di tabel `settings` dan bertahan setelah restart.
  - **Estimate**: 1.5h
  - **Blocked by**: p0-home-two-doors

- [ ] Implementasikan check-in harian energi yang tersimpan lokal
  - **ID**: p1-daily-checkin
  - **Tags**: ui, database
  - **Details**: Satu ketukan untuk mencatat tingkat energi harian; simpan di tabel `daily_checkins`; tampilkan rangkaian hari terakhir.
  - **Files**: `src/screens/CheckInScreen.tsx`, `src/db/index.ts`
  - **Acceptance**: Check-in tersimpan dan terbaca kembali setelah restart aplikasi; entri ganda pada hari yang sama melakukan update, bukan duplikasi baris.
  - **Estimate**: 1h
  - **Blocked by**: p0-db-layer

## P2

- [ ] Implementasikan pemutar audio ambient offline untuk Ruang Tenang
  - **ID**: p2-ambient-audio
  - **Tags**: audio, offline
  - **Details**: Tiga pilihan suara ambient (hujan, derau coklat, ombak) yang dibundel sebagai aset lokal dan tidak memerlukan jaringan.
  - **Files**: `src/services/audioPlayer.ts`, `assets/audio/`
  - **Acceptance**: Ketiga suara berputar dalam mode pesawat; ukuran folder audio di bawah 5 MB; pemutaran berhenti otomatis saat layar ditinggalkan.
  - **Estimate**: 1.5h

- [ ] Tambahkan animasi mikro dan polesan transisi pada seluruh layar
  - **ID**: p2-motion-polish
  - **Tags**: ui, animation
  - **Details**: Transisi masuk halus antar layar, umpan balik tekan pada tombol, dan animasi angka pada kartu skor.
  - **Files**: `src/components/`, `src/navigation/`
  - **Acceptance**: Tidak ada penurunan frame yang terlihat pada perangkat kelas menengah; seluruh animasi dapat dinonaktifkan lewat pengaturan aksesibilitas sistem.
  - **Estimate**: 1.5h

- [ ] Siapkan pengujian unit mesin skoring dan navigasi
  - **ID**: p2-unit-tests
  - **Tags**: testing, jest
  - **Details**: Uji kasus batas skoring DASS-21 dan pemetaan tier; uji render seluruh layar kritis dengan React Native Testing Library.
  - **Files**: `src/services/__tests__/scoring.test.ts`, `jest.config.js`
  - **Acceptance**: Seluruh test lulus; cakupan fungsi skoring mencapai 100 persen baris.
  - **Estimate**: 2h
  - **Blocked by**: p0-dass21-engine

## P3

- [ ] Kompilasi dan verifikasi APK release standalone pada perangkat fisik
  - **ID**: p3-release-apk
  - **Tags**: build, gradle, adb
  - **Details**: Jalankan `expo prebuild` bersih, kompilasi `assembleRelease` untuk arsitektur arm64-v8a, lalu pasang via ADB pada perangkat Android 14.
  - **Files**: `android/app/build/outputs/apk/release/app-release.apk`, `android/local.properties`
  - **Acceptance**: APK terbentuk di bawah 40 MB; instalasi sukses; aplikasi terbuka tanpa crash dan seluruh alur inti berjalan.
  - **Estimate**: 1.5h

- [ ] Susun alur demonstrasi pitch dan tangkapan layar tiap layar
  - **ID**: p3-pitch-demo
  - **Tags**: docs, demo
  - **Details**: Alur demo 3 menit dari beranda, Ruang Tenang, kuis, hasil tier akut, hingga panduan BPJS; tangkap tangkapan layar tiap tahap via ADB.
  - **Files**: `docs/PITCH.md`, `docs/screenshots/`
  - **Acceptance**: Alur demo berjalan tanpa hambatan pada perangkat fisik; seluruh tangkapan layar tersimpan dan dapat ditampilkan dalam presentasi.
  - **Estimate**: 1.5h
  - **Blocked by**: p3-release-apk
