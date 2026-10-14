# TautJiwa — Panduan Pengembangan

Aplikasi Android native (React Native + Expo SDK 57) untuk skrining kesehatan mental
mandiri dan panduan faskes BPJS. **100% on-device, tanpa akun, tanpa server.**

## Menjalankan

```bash
npm install
npx expo start              # Metro bundler (Expo Go / dev client)
npm run android             # build + install debug ke perangkat
npm run typecheck           # tsc --noEmit
npm test                    # Jest
```

## Membangun APK standalone

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

> Node 22 LTS disarankan. Jika memakai Node ≥ 24, setel
> `NODE_OPTIONS="--no-experimental-strip-types"` agar Metro tidak gagal
> saat memproses `.ts` di dalam `node_modules`.

## Struktur

- `src/screens/` — 8 layar fungsional
- `src/components/` — komponen global termasuk emergency interceptor
- `src/content/` — naskah DASS-21, psikoedukasi, panduan BPJS, rencana 7 hari
- `src/db/` — SQLite lokal (WAL mode)
- `src/store/` — Zustand state
- `src/services/` — skoring, haptik, PDF
- `src/theme/` — token turunan `DESIGN.md`

## Dokumen kontrak

Baca sebelum mengubah perilaku: `PRD.md`, `AGENTS.md`, `DESIGN.md`, `TODO.md`.

## Prinsip yang tidak boleh dilanggar

1. Data skrining tidak pernah keluar dari perangkat.
2. Setiap halaman hasil punya disclaimer, tombol tutup cepat, dan akses interceptor.
3. Satu CTA utama per halaman hasil.
4. Aplikasi tidak pernah menegakkan diagnosis klinis.

## Fitur Lengkap

Aplikasi ini menutup seluruh blok pada `Fitur.md` secara 100 persen on-device.

**Pertolongan instan (Ruang Tenang)**
- Napas getar haptic dengan pola kotak 4-4-4-4 dan physiological sigh.
- Grounding 5-4-3-2-1 dengan input teks maupun suara (STT luring).
- Tulis & Lepaskan dengan animasi kertas terbakar, teks dihapus permanen.
- Reset 60 Detik terpandu otomatis tanpa isian.
- Suara latar luring: hujan, ombak, derau coklat.

**Skrining dan hasil**
> Bagian ini hanya gambaran sekilas, untuk detail pengetesan cek di [docs/mental-screening-guidenance.md](./docs/mental-screening-guidenance.md)
- Skrining bertingkat: K-10 sepuluh butir cepat, membuka PHQ-9 dan GAD-7 jika terindikasi distres tinggi (skor ≥ 25).
- Intersepsi krisis seketika pada butir ke-9 PHQ-9 dengan tombol darurat Hotline 119 ext 8.
- Halaman hasil tiga tier dengan disiplin satu CTA utama.
- Panduan faskes BPJS tiga langkah dan ekspor ringkasan gejala PDF.
- Riwayat dan grafik tren berkala multidimensi (distres global, depresi, kecemasan).

**Pendukung mandiri**
- Kotak P3K Emosi: lima kartu teknik (tubuh, pikiran, lingkungan).
- Uji ulang pikiran dengan empat template pertanyaan kognitif.
- Ruang Kerja Sehat: ritual tutup hari, jeda mikro 50/5, naskah bicara, log kemenangan kecil.
- Dinding Cerita: lima cerita kurasi luring dan surat lokal untuk diri sendiri.
- Teman Cerita: direktori konselor kampus, klinik, EAP, dan hotline resmi.
- Pengingat harian lokal dengan teks netral.

**Privasi**
- Tidak ada akun, tidak ada server, tidak ada unggahan.
- Seluruh data tersimpan di SQLite lokal dengan mode WAL.
- Audio dan cerita kurasi dibundel di dalam APK, jadi tetap berfungsi dalam mode pesawat.
