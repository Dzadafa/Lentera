# AGENTS.md — TautJiwa Mobile

## Overview
Repo ini berisi **TautJiwa Mobile**, aplikasi Android native (React Native + Expo) untuk skrining kesehatan mental mandiri dan panduan faskes BPJS. Aplikasi ini adalah "Jembatan Pertama": anonim, 100 persen on-device, tanpa akun, dan tanpa server runtime. Target pengguna adalah mahasiswa dan pekerja muda Indonesia. Seluruh pekerjaan UI wajib merujuk `DESIGN.md`.

## Repository Structure
- `src/screens/` — satu file per layar fungsional (beranda, ruang tenang, kuis, hasil, panduan BPJS, mode kerja, pengaturan).
- `src/components/` — komponen presentasional dan ikon SVG inline.
- `src/navigation/` — definisi rute dan navigator bertipe.
- `src/store/` — state global (Zustand) dan aksi domain.
- `src/db/` — lapisan SQLite: skema, migrasi, dan query bertipe.
- `src/services/` — haptik, audio, PDF, izin, dan integrasi perangkat.
- `src/content/` — naskah statis: 21 butir DASS-21, kartu psikoedukasi, naskah loket.
- `src/theme/` — token hasil turunan `DESIGN.md` dalam bentuk objek TypeScript.
- `src/types/` — tipe domain bersama.
- `assets/` — ikon, splash, dan berkas audio ambient.
- `android/` — proyek native hasil prebuild; jangan sunting manual kecuali konfigurasi Gradle atau manifest.
- `DESIGN.md`, `PRD.md`, `TODO.md` — dokumen kontrak; baca sebelum mengubah perilaku.

## Commands
- `npm install` — memasang dependensi.
- `npx tsc --noEmit` — pemeriksaan tipe; wajib 0 error sebelum commit.
- `npm run lint` — ESLint + Prettier pada seluruh `src`.
- `npm test` — menjalankan Jest dan React Native Testing Library.
- `npx expo start` — menjalankan Metro bundler untuk pengujian cepat.
- `npx expo prebuild --platform android` — sinkronisasi konfigurasi native Android.
- `cd android && ./gradlew assembleDebug` — kompilasi APK debug standalone.
- `cd android && ./gradlew assembleRelease` — kompilasi APK release standalone.
- `adb install -r android/app/build/outputs/apk/release/app-release.apk` — memasang APK ke perangkat.
- `adb exec-out screencap -p > /tmp/screen.png` — menangkap tangkapan layar perangkat.

## Git Workflow
- Branch utama adalah `main`; remote `origin` menunjuk ke repositori GitHub tim.
- Gaya commit: `feat(scope): ...`, `fix(scope): ...`, `refactor(scope): ...`, `docs(scope): ...`, `chore(scope): ...`.
- Satu commit = satu perubahan logis. Jalankan `npx tsc --noEmit` sebelum setiap commit.
- Jangan commit `node_modules`, `android/build`, `android/app/build`, atau berkas `.keystore`.
- Perubahan pada `PRD.md`, `TODO.md`, atau `DESIGN.md` harus disertai alasan di badan commit.

## Design
- Untuk semua pekerjaan UI, baca `DESIGN.md` dan pakai HANYA token di dalamnya.
- Jangan mengarang nilai hex, ukuran font, atau radius baru.
- Jika butuh token yang belum ada, ajukan dulu — jangan menambah sendiri.

## Boundaries
- **Always**: jalankan `npx tsc --noEmit` dan pastikan 0 error sebelum commit.
- **Always**: simpan seluruh data skrining di SQLite lokal; tidak ada transmisi jaringan untuk data personal.
- **Always**: tampilkan disclaimer "skrining awal, bukan diagnosis" pada setiap halaman hasil.
- **Always**: sertakan akses emergency interceptor dan tombol tutup cepat pada setiap layar hasil.
- **Always**: gunakan `SafeAreaView` dari `react-native-safe-area-context`, bukan dari `react-native`.
- **Ask first**: sebelum menambah dependensi native baru yang mengubah `android/`.
- **Ask first**: sebelum mengubah bobot atau urutan butir instrumen DASS-21.
- **Never**: menaruh API key, token, atau kredensial apa pun di dalam source code.
- **Never**: mengirim data skrining, mood, atau identitas pengguna ke jaringan mana pun.
- **Never**: menampilkan klaim diagnosis klinis definitif atau menyarankan penghentian pengobatan.
- **Never**: memakai data dummy yang di-hardcode di dalam komponen view; gunakan query SQLite atau empty state terkurasi.
- **Never**: mengubah berkas di `android/` secara manual kecuali `build.gradle`, `gradle.properties`, `AndroidManifest.xml`, atau `local.properties`.
