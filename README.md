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
