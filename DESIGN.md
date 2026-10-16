# DESIGN.md — Lentera (Listening, Empathy, Nurture, Togetherness, Encouragement, Resilience, Awareness)

Dokumen ini diturunkan dari tangkapan layar dua halaman (Beranda dan Profil Psikolog). Seluruh nilai warna, ukuran, dan font adalah estimasi visual, bukan hasil ekstraksi dari file desain asli. Verifikasi ke file Figma sumber sebelum dipakai sebagai acuan final.

## 1. Karakter Desain

Lentera (Listening, Empathy, Nurture, Togetherness, Encouragement, Resilience, Awareness) adalah aplikasi mobile untuk menemukan psikolog dan mengikuti acara kesehatan mental. Nuansanya tenang, lembut, dan ramah: latar putih keunguan yang sangat pucat, satu warna aksen ungu yang tegas, sudut membulat di hampir semua elemen, dan tipografi sans-serif geometris yang bersih. Hierarki dibangun lewat ukuran dan bobot huruf, bukan lewat garis atau bayangan tebal. Setiap layar hanya punya satu aksi utama yang berwarna ungu penuh.

## 2. Warna

Palet warna diturunkan langsung dari identitas visual logo **Lentera**:
- **Ungu Utama (`#7843E4`)**: warna aksi utama, tombol primer, dan status aktif.
- **Ungu Muda (`#C7A6FB`)**: kelopak lentera, warna sekunder, dan aksen lembut.
- **Kuning Lentera (`#FEC565`)**: pendar cahaya/api lentera, kehangatan, dan aksen perhatian.

```css
:root {
  /* Brand (Warna Logo Lentera) */
  --color-primary: #7843E4;          /* tombol utama, tab aktif, ikon nav aktif */
  --color-primary-soft: #EFE6FD;     /* latar chip & badge lembut */
  --color-primary-on: #FFFFFF;       /* teks di atas primary */

  --color-secondary: #C7A6FB;        /* ungu muda logo, aksen kelopak lentera */
  --color-secondary-container: #F3EBFE;
  --color-on-secondary-container: #361273;

  --color-tertiary: #FEC565;         /* kuning lentera, cahaya pelita */
  --color-tertiary-container: #FFF4DE;
  --color-on-tertiary-container: #573B00;

  /* Surface & Background */
  --color-bg: #F7F4FD;               /* latar layar, putih keunguan lembut */
  --color-surface: #FFFFFF;          /* kartu, panel profil, bottom nav */
  --color-bg-gradient-from: #FDF7EB; /* semburat kuning lentera hangat */
  --color-bg-gradient-to: #EFE8FC;   /* semburat ungu lembut */

  /* Text */
  --color-text-primary: #1B1B23;     /* judul, nama, isi utama */
  --color-text-secondary: #6E6E7A;   /* subjudul, label kecil, tab tidak aktif */
  --color-text-muted: #9A9AA6;       /* teks redup, ikon nav tidak aktif */

  /* Accent & Status */
  --color-accent-yellow: #FEC565;    /* kuning lentera, bintang, warning */
  --color-accent-cyan: #22B8CF;      /* spiral FAQ, info */
  --color-accent-pink: #C2406E;      /* aksen pelengkap */

  /* Outline */
  --color-outline: #9A9AA6;
  --color-outline-variant: #E8DCFC;  /* garis tepi lembut keunguan */
}
```

Aturan pemakaian: ungu penuh (#7843E4) hanya untuk satu CTA per layar dan state aktif. Ungu muda (#C7A6FB) dan Kuning (#FEC565) dipakai untuk elemen pendukung dan pendar hangat identitas lentera.

## 3. Tipografi

Aplikasi menggunakan keluarga huruf geometris **Montserrat** yang memberikan kesan modern, ramah, kokoh, dan bersih. Varian yang digunakan meliputi Regular (body & narasi), Medium (label & caption), SemiBold (tombol, judul kartu, subjudul), dan Bold (judul utama, headline, badge). Fallback: Montserrat, system-ui, -apple-system, sans-serif.

```css
:root {
  --font-family: "Montserrat", system-ui, -apple-system, sans-serif;

  --text-display: 700 24px/32px var(--font-family);  /* "Lentera" (Bold) */
  --text-title:   700 20px/26px var(--font-family);  /* judul bagian utama (Bold) */
  --text-headline:600 18px/24px var(--font-family);  /* judul kartu / subbagian (SemiBold) */
  --text-card:    600 16px/22px var(--font-family);  /* judul kartu acara / konten (SemiBold) */
  --text-body:    400 15px/22px var(--font-family);  /* tagline, isi panduan, deskripsi (Regular) */
  --text-button:  600 16px/24px var(--font-family);  /* label tombol utama (SemiBold) */
  --text-label:   600 14px/20px var(--font-family);  /* tab aktif, label grup (SemiBold) */
  --text-caption: 500 12px/16px var(--font-family);  /* label sekunder, nav bawah (Medium) */
  --text-chip:    700 10px/12px var(--font-family);  /* chip status / badge, kapital + letter-spacing (Bold) */
}
```

Angka pada statistik profil ("10 years", "60 $", "16+") memakai bobot 600 dengan ukuran sekitar 15 sampai 16px, di bawah label caption abu-abu dua baris. Judul bagian ("Upcoming events", "FAQ") selalu rata kiri dan bobot semibold.

## 4. Spasi, Radius, dan Elevasi

Sistem spasi berbasis kelipatan 4px, dengan margin horizontal layar sekitar 18 sampai 20px dan jarak antarbagian vertikal sekitar 24 sampai 32px.

```css
:root {
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px; --space-8: 32px;

  --radius-chip: 8px;
  --radius-card: 20px;       /* kartu acara */
  --radius-photo: 24px;      /* foto psikolog (rounded square) */
  --radius-button: 999px;    /* tombol pill penuh */
  --radius-sheet: 24px;      /* panel putih di bawah foto profil (sudut atas) */
  --radius-device: 36px;     /* hanya bingkai mockup, bukan komponen UI */

  --shadow-card: 0 2px 12px rgba(80, 60, 140, 0.06);   /* sangat halus */
  --shadow-device: 0 12px 32px rgba(80, 60, 140, 0.15); /* hanya mockup */
}
```

Elevasi nyaris tidak dipakai. Kartu dibedakan dari latar lewat kontras putih terhadap lavender pucat, dengan bayangan yang hampir tidak terlihat. Hindari bayangan gelap atau border keras pada kartu.

## 5. Komponen

### Tombol utama

Tombol pill selebar penuh kontainer, tinggi sekitar 48 sampai 52px, latar primary, teks putih rata tengah bobot 500. Pada beranda ("Find a psychologist") tombol memuat ikon chevron kanan di ujung kanan, dan lebarnya mengikuti konten dengan padding horizontal besar. Pada profil ("Make an appointment") tombol melebar penuh dan menempel di dasar panel konten. Tidak ada state sekunder yang terlihat di screenshot, jadi varian outline atau ghost harus didefinisikan terpisah bila dibutuhkan.

### Kartu acara (Upcoming events)

Kartu putih radius 20px, padding sekitar 16px, ditata dalam carousel horizontal dengan kartu berikutnya terpotong di tepi kanan sebagai petunjuk scroll. Isi dari atas ke bawah: baris atas berisi chip kategori di kiri dan status lokasi ("Online") abu-abu di kanan, lalu judul acara dua baris bobot 500, lalu baris bawah berisi waktu di kiri dan hari ("Today") di kanan dengan warna secondary. Lebar kartu sekitar 185px.

### Chip kategori

Pill kecil radius 8px, padding sekitar 4px vertikal dan 8px horizontal, teks kapital 10px bobot 600. LECTURE memakai latar ungu muda dengan teks ungu tua, WORKSHOP memakai latar pink muda dengan teks pink tua. Pasangan warna baru harus mengikuti pola yang sama: latar tint 10 sampai 15 persen, teks versi gelap dari warna yang sama.

### Daftar FAQ

Setiap baris berupa ikon outline berwarna di kiri (sekitar 24px) dan teks body di kanan, jarak vertikal antarbaris sekitar 20px, tanpa pemisah garis. Setiap item memakai warna ikon berbeda (ungu, kuning, cyan) sebagai aksen identitas. Header bagian memuat judul di kiri dan tautan "See all" kecil abu-abu di kanan.

### Bottom navigation

Lima tab: Main, Discover, Catalog, Schedule, Settings. Ikon outline sekitar 24px dengan label caption di bawahnya. Tab aktif memakai ikon terisi dan label berwarna primary, tab tidak aktif memakai abu-abu muda. Latar putih menyatu dengan layar, tanpa garis pemisah atas, dan di bawahnya ada home indicator bar hitam tipis bawaan perangkat.

### Header profil psikolog

Tombol kembali berupa panah kiri di pojok kiri atas, lalu nama (title, rata tengah) dan gelar di bawahnya dalam teks secondary. Foto berbentuk rounded square sekitar 135px dengan radius 24px, rata tengah. Di bawah foto ada baris tiga statistik dengan jarak merata: label caption abu-abu dua baris di atas, nilai semibold di bawah. Gunakan pola ini untuk metrik ringkas lain agar konsisten.

### Tab konten (About, Reviews, Contacts)

Tiga tab teks rata tengah di dalam panel putih bersudut atas membulat. Tab aktif memakai teks gelap bobot 500 dengan garis bawah primary setebal 2px dan selebar teksnya, tab tidak aktif memakai teks secondary tanpa garis.

### Blok informasi profil

Label bagian ("Main method", "I work with requests") memakai bobot 500 dengan ukuran label, nilainya berupa baris teks body biasa yang ditumpuk dengan jarak sekitar 12px tanpa bullet atau pemisah. Antarblok diberi jarak sekitar 20px.

## 6. Tata Letak

Kanvas mobile sekitar 390px lebar (rasio iPhone). Konten ditata satu kolom dengan margin sisi konsisten. Beranda berurutan dari atas: status bar, judul merek dan tagline, CTA utama, bagian acara (carousel), bagian FAQ, lalu bottom nav tetap di dasar. Profil berurutan: bar navigasi atas, identitas, foto, statistik, panel putih berisi tab dan konten, lalu CTA yang menempel di bawah. Panel putih pada profil membedakan area konten dari area identitas yang berlatar lavender.

## 7. Ikonografi dan Dekorasi

Ikon bergaya outline dengan stroke tipis konsisten, sudut membulat, ukuran 24px. Ikon FAQ berwarna per item, ikon navigasi monokrom. Dekorasi utama adalah siluet hati besar berstroke tipis berwarna pink pucat di belakang judul beranda, dipotong oleh tepi kanan layar, sebagai penanda merek yang lembut. Dekorasi ini harus tetap berkontras sangat rendah supaya tidak mengganggu keterbacaan teks.

## 8. Prinsip Penggunaan

Pertahankan satu aksi utama berwarna ungu penuh per layar. Gunakan sudut membulat besar secara konsisten dan hindari sudut tajam pada komponen baru. Biarkan ruang kosong yang lapang, karena kesan tenang adalah inti dari identitas aplikasi ini. Jangan menambah warna aksen baru di luar palet tanpa alasan, dan jangan memakai merah pekat atau hitam pekat untuk elemen non-kritis agar nada visual tidak terasa menekan.

## 9. Catatan dan Celah

Beberapa hal tidak bisa disimpulkan dari screenshot dan perlu didefinisikan sendiri: state hover, pressed, disabled, dan error; mode gelap; perilaku animasi dan transisi; varian tombol sekunder; tampilan tab Reviews dan Contacts; serta aturan aksesibilitas seperti ukuran target sentuh minimum 44px. Selain itu, ejaan pada UI sumber memuat kesalahan ("Shedule" pada tab navigasi, "specialist" tertulis "spesialist"), dan sebaiknya diperbaiki saat implementasi alih-alih disalin.