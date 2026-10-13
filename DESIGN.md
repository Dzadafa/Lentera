---
version: alpha
name: TautJiwa Calm Interface
description: Design system untuk aplikasi triase kesehatan mental — tenang, privat, dan tidak menghakimi.
colors:
  # --- Palet inti ---
  primary: "#1B3B2B"
  secondary: "#437A5B"
  tertiary: "#2A9D8F"
  neutral: "#F7F9F8"

  # --- Permukaan & teks ---
  surface: "#FFFFFF"
  surface-container: "#F1F5F2"
  surface-container-high: "#E4EDE7"
  on-surface: "#131F17"
  on-surface-variant: "#5A6B60"
  inverse-surface: "#131F17"
  inverse-on-surface: "#F7F9F8"

  # --- Garis ---
  outline: "#8FA396"
  outline-variant: "#DFE8E2"

  # --- Pasangan aksi ---
  on-primary: "#FFFFFF"
  primary-container: "#E2EFE7"
  on-primary-container: "#0F261B"

  on-secondary: "#FFFFFF"
  secondary-container: "#D4E8DC"
  on-secondary-container: "#1B3B2B"

  on-tertiary: "#FFFFFF"
  tertiary-container: "#D3F0EC"
  on-tertiary-container: "#0A302B"

  # --- Latar & teks ---
  background: "#F7F9F8"
  on-background: "#131F17"

  # --- Status ---
  error: "#B3261E"
  on-error: "#FFFFFF"
  error-container: "#FFE5E8"
  on-error-container: "#5C000B"

  success: "#2E7D32"
  on-success: "#FFFFFF"
  success-container: "#E8F5E9"
  on-success-container: "#123B14"

  warning: "#9A6700"
  on-warning: "#FFFFFF"
  warning-container: "#FEF3C7"
  on-warning-container: "#4A3200"

  info: "#1F6FEB"
  on-info: "#FFFFFF"
  info-container: "#DBEAFE"
  on-info-container: "#0F2C5C"

  # --- Tier hasil skrining ---
  tier-low: "#2E7D32"
  tier-low-container: "#E8F5E9"
  tier-moderate: "#B45309"
  tier-moderate-container: "#FEF3C7"
  tier-high: "#B3261E"
  tier-high-container: "#FFE5E8"

  # --- Krisis (hanya untuk interceptor) ---
  crisis: "#C1121F"
  on-crisis: "#FFFFFF"
  crisis-container: "#FFE4E6"
  on-crisis-container: "#60000A"

  # --- Mode samaran ---
  stealth-surface: "#FFFFFF"
  stealth-on-surface: "#1F2937"
  stealth-outline: "#D1D5DB"

typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 1.2
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 1.25
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 1.3
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 1.6
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 1.6
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 1.5
    letterSpacing: 0em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 1.4
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 1.4
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: "700"
    lineHeight: 1.3
    letterSpacing: 0.08em

rounded:
  none: 0px
  sm: 6px
  md: 12px
  lg: 20px
  xl: 28px
  full: 9999px

spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  margin-mobile: 20px
  gap-card: 12px

components:
  page-layout:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    padding: "{spacing.margin-mobile}"

  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 54px

  button-secondary:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 54px

  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 54px

  button-danger:
    backgroundColor: "{colors.crisis}"
    textColor: "{colors.on-crisis}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 16px
    height: 54px

  card-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 20px

  card-tier-low:
    backgroundColor: "{colors.tier-low-container}"
    textColor: "{colors.on-success-container}"
    rounded: "{rounded.lg}"
    padding: 20px

  card-tier-moderate:
    backgroundColor: "{colors.tier-moderate-container}"
    textColor: "{colors.on-warning-container}"
    rounded: "{rounded.lg}"
    padding: 20px

  card-tier-high:
    backgroundColor: "{colors.tier-high-container}"
    textColor: "{colors.on-error-container}"
    rounded: "{rounded.lg}"
    padding: 20px

  modal-crisis:
    backgroundColor: "{colors.crisis-container}"
    textColor: "{colors.on-crisis-container}"
    rounded: "{rounded.xl}"
    padding: 24px

  badge-default:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 6px

  badge-accent:
    backgroundColor: "{colors.tertiary-container}"
    textColor: "{colors.on-tertiary-container}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 6px

  alert-info:
    backgroundColor: "{colors.info-container}"
    textColor: "{colors.on-info-container}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 16px

  alert-warning:
    backgroundColor: "{colors.warning-container}"
    textColor: "{colors.on-warning-container}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 16px

  breathing-circle:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-secondary-container}"
    rounded: "{rounded.full}"
    padding: 0px

  question-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 16px

  question-option-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 16px

  stealth-panel:
    backgroundColor: "{colors.stealth-surface}"
    textColor: "{colors.stealth-on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Desain ini meminjam bahasa visual **ruang tunggu puskesmas yang tenang dan klinik
psikologi Swedia tahun 1970-an**: permukaan kayu muda, cahaya alami dari jendela
besar, perabot dengan sudut membulat, dan nol material berkilau. Paletnya diambil
dari dedaunan sage dan lumut hutan, bukan dari gradien ungu teknologi.

Referensi ini membawa serta keputusannya: **tidak ada warna yang mendesak**,
**tidak ada animasi yang mengagetkan**, dan **tidak ada elemen yang menuntut
perhatian**. Pengguna aplikasi ini datang dalam keadaan panik atau lelah. Tugas
antarmuka bukan memikat mereka, melainkan **menurunkan denyut nadi mereka dalam
lima detik pertama**.

## Colors

Palet dibangun di sekitar satu warna utama, **Deep Forest Sage** (primary,
`#1B3B2B`), yang dipakai untuk teks judul dan tombol utama. Warna ini memiliki
kontras 13.1:1 terhadap latar `#F7F9F8`, jauh di atas ambang WCAG AA.

Warna aksi sekunder adalah **Leaf Green** (`#437A5B`) untuk elemen pendukung yang
tidak boleh bersaing dengan CTA utama. Warna aksen **Teal Tenang** (`#2A9D8F`)
dipakai hanya untuk indikator progres dan napas terpandu.

Tiga warna tier hasil memiliki makna tetap dan tidak boleh dipakai untuk keperluan
lain di luar konteks skrining:
- `tier-low` hijau (`#2E7D32`) — kondisi rendah, pesan validasi.
- `tier-moderate` amber (`#B45309`) — kondisi sedang, ajakan aksi mandiri.
- `tier-high` merah (`#B3261E`) — kondisi akut, jalur keselamatan.

Warna **crisis** (`#C1121F`) dicadangkan secara eksklusif untuk emergency
interceptor. Warna ini tidak boleh muncul di tempat lain agar efek kejutnya
terjaga saat benar-benar dibutuhkan.

Mode samaran memakai tiga token terpisah (`stealth-surface`, `stealth-on-surface`,
`stealth-outline`) yang sengaja dibuat netral dan tanpa asosiasi visual apa pun.

## Typography

Satu keluarga huruf untuk seluruh aplikasi: **Plus Jakarta Sans**. Tidak ada
pasangan font kedua. Huruf ini dipilih karena memiliki x-height besar dan
terminal terbuka, sehingga tetap terbaca saat pengguna sedang menangis atau
tangan gemetar.

Skala dibuat sempit dengan sengaja — hanya tiga ukuran teks isi (12, 14, 16 px)
agar hierarki terasa tenang dan tidak seperti poster.

Aturan yang tidak boleh dilanggar:
- Judul layar memakai `headline-lg` (24px). Tidak ada teks di atas 32px kecuali
  angka skor pada halaman hasil.
- Teks isi selalu `body-md` (14px). Jangan pernah memakai teks di bawah 12px untuk
  paragraf yang harus dibaca.
- Elemen label memakai `label-sm` dengan huruf kapital dan `letterSpacing` 0.08em.
- Tinggi baris minimal 1.5 untuk semua paragraf agar paragraf panjang tetap
  nyaman dibaca.

## Layout

Satu kolom tunggal dengan lebar konten penuh, margin samping `20px`, dan jarak
antar kartu `12px`. Tidak ada tata letak multi-kolom di mana pun — pengguna dalam
kondisi panik tidak boleh diberi pilihan visual bersamaan.

Setiap layar mengikuti pola vertikal yang sama:
1. Bilah atas ringkas: tombol kembali opsional, judul, tombol tutup cepat.
2. Badan konten yang dapat digulir.
3. Satu bilah aksi tetap di bagian bawah berisi CTA tunggal.

Bilah aksi bawah selalu diberi padding bawah tambahan 28px pada Android untuk
menghindari tertutup bilah navigasi gestur sistem.

## Elevation & Depth

Kedalaman dibangun dengan **variasi warna permukaan dan garis tipis**, bukan
bayangan. Kartu default tidak memiliki shadow sama sekali; pemisahan dilakukan
oleh `outline-variant` setebal 1px.

Aturan:
- `elevation: 0` kecuali pada `modal-crisis` yang boleh memakai shadow lembut
  (`opacity 0.08`, `radius 16`, `offsetY 4`).
- Tidak ada efek blur, gradien, atau glassmorphism.
- Kedalaman pada tombol tekan dinyatakan lewat perubahan warna latar ke
  `primary-container`, bukan lewat pergerakan posisi.

## Shapes

Skala sudut hanya punya tiga tingkat yang benar-benar dipakai:
- `rounded.md` (12px) untuk kartu pertanyaan, tombol opsi, dan panel samaran.
- `rounded.lg` (20px) untuk kartu default dan kartu tier.
- `rounded.full` (9999px) untuk seluruh tombol aksi dan lencana.

Lingkaran napas terpandu adalah satu-satunya elemen yang berbentuk lingkaran
sempurna dan berskala besar, karena bentuk itulah yang menjadi metafora napasnya.

## Components

**Tombol utama** selalu setinggi 54px dengan sudut penuh. Dalam satu layar hasil
hanya boleh ada **tepat satu** tombol utama. Ini adalah aturan inti dari prinsip
pertolongan kesehatan mental: jangan beri delapan pilihan kepada orang yang
sedang tidak baik-baik saja.

**Kartu tier** memakai warna latar tier masing-masing. Kartu tier akut wajib
menampilkan label keselamatan di baris pertama sebelum informasi skor apa pun.

**Modal krisis** adalah satu-satunya komponen yang boleh memakai warna merah
menyala. Ia wajib memiliki tombol tutup yang jelas dan ramah — tidak boleh
terasa seperti peringatan polisi.

**Lingkaran napas** beranimasi antara skala 0.55 dan 1.0 mengikuti fase tarik dan
buang napas. Transisi memakai durasi `ease-in-out` selama 4000 ms per fase, dan
setiap transisi fase disertai sinyal haptic ringan.

**Panel samaran** memakai sudut `rounded.sm` (6px), bukan sudut membulat besar
layaknya kartu aplikasi kesehatan, agar tampil beda dan tidak menarik perhatian.

## Motion

Seluruh animasi harus **lambat dan dapat diprediksi**. Durasi standar adalah
300 ms untuk transisi layar dan 4000 ms untuk satu fase pernapasan.

Aturan:
- Tidak ada animasi yang melebihi kecepatan 300 ms kecuali lingkaran napas.
- Tidak boleh ada elemen yang berdenyut, berkedip, atau bergetar tanpa kendali
  pengguna — ini memicu kecemasan.
- Animasi wajib dihormati terhadap setelan aksesibilitas sistem: bila pengguna
  menonaktifkan animasi, aplikasi harus langsung menampilkan kondisi akhir.

## Voice

Nada bicara aplikasi adalah **pembimbing tenang yang tidak menghakimi**. Tidak
ada tanda seru, tidak ada emoji perayaan, tidak ada kata "harus" atau "seharusnya".

Aturan penulisan:
- Sapaan "kamu", bukan "Anda" atau "kalian".
- Kalimat maksimal 20 kata. Satu kalimat, satu ide.
- Selalu sebut kondisi sebagai hal yang wajar: "Banyak orang merasa seperti ini".
- Dilarang menampilkan kata "gila", "abnormal", "penderita", atau "korban".
- Setiap hasil diakhiri dengan satu langkah konkret, bukan sekadar validasi.
