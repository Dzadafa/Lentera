export interface ToolkitCard {
  id: string;
  title: string;
  category: 'tubuh' | 'pikiran' | 'lingkungan';
  summary: string;
  steps: string[];
  duration: string;
}

/** Dek Kartu Toolkit (K2) — kotak P3K emosi, tiap kartu satu teknik. */
export const TOOLKIT_CARDS: ToolkitCard[] = [
  {
    id: 'tool-sigh',
    title: 'Physiological Sigh',
    category: 'tubuh',
    summary:
      'Dua tarikan napas cepat lewat hidung, satu hembusan panjang lewat mulut. Cara tercepat menurunkan ketegangan sistem saraf.',
    steps: [
      'Tarik napas dalam lewat hidung.',
      'Tanpa membuang napas, tarik satu tarikan pendek lagi untuk mengisi paru-paru.',
      'Hembuskan perlahan lewat mulut sampai paru-paru terasa kosong.',
      'Ulangi tiga sampai lima kali, sekitar tiga puluh detik.',
    ],
    duration: '30 detik',
  },
  {
    id: 'tool-cold-water',
    title: 'Sensasi Suhu Dingin',
    category: 'tubuh',
    summary:
      'Sensasi dingin di wajah memicu refleks alami tubuh yang menurunkan denyut jantung saat panik memuncak.',
    steps: [
      'Basuh wajah dengan air dingin, atau tempelkan kain dingin di area mata dan pipi.',
      'Tahan lima belas sampai tiga puluh detik sambil menundukkan kepala.',
      'Bernapas perlahan saat mengangkat kepala.',
    ],
    duration: '1 menit',
  },
  {
    id: 'tool-box-breath',
    title: 'Pernapasan Kotak 4-4-4-4',
    category: 'tubuh',
    summary: 'Pola napas empat hitungan yang dipakai untuk menstabilkan fokus saat tekanan tinggi.',
    steps: [
      'Tarik napas empat detik.',
      'Tahan paru-paru penuh empat detik.',
      'Hembuskan perlahan empat detik.',
      'Tahan paru-paru kosong empat detik, lalu ulangi empat siklus.',
    ],
    duration: '2 menit',
  },
  {
    id: 'tool-thought-distance',
    title: 'Memberi Jarak pada Pikiran',
    category: 'pikiran',
    summary: 'Mengubah hubungan dengan pikiran agar tidak lagi dianggap sebagai kebenaran mutlak.',
    steps: [
      'Tuliskan pikiran yang membebani, misalnya "saya pasti gagal".',
      'Ubah kalimatnya menjadi: "saya menyadari bahwa pikiran saya sedang mengatakan saya pasti gagal".',
      'Perhatikan bedanya. Kamu adalah yang mengamati pikiran itu, bukan pikiran itu sendiri.',
    ],
    duration: '2 menit',
  },
  {
    id: 'tool-change-room',
    title: 'Pindah Ruang Fisik',
    category: 'lingkungan',
    summary:
      'Saat pikiran berputar di meja kerja, memindahkan tubuh membantu memutus putaran itu.',
    steps: [
      'Berdiri dari posisi duduk sekarang.',
      'Pindah ke ruangan lain, balkon, atau dekat jendela yang terbuka.',
      'Minum satu gelas air putih secara sadar dan rasakan suhunya.',
      'Kembali ke tugas hanya setelah napas terasa teratur.',
    ],
    duration: '3 menit',
  },
];

export interface CbtReframe {
  id: string;
  trap: string;
  explanation: string;
  challengeQuestion: string;
  exampleOriginal: string;
  exampleReframed: string;
}

/**
 * Reframe Pikiran (K3) — template pertanyaan ala terapi kognitif-perilaku.
 * Ini bukan diagnosis dan bukan terapi. Teks yang ditulis pengguna tidak disimpan.
 */
export const CBT_REFRAMES: CbtReframe[] = [
  {
    id: 'cbt-all-or-nothing',
    trap: 'Pikiran Hitam-Putih',
    explanation:
      'Melihat situasi hanya dalam dua kutub: sempurna atau gagal total, tanpa wilayah di antaranya.',
    challengeQuestion: 'Apakah ada kemungkinan di antara "sempurna" dan "gagal total"?',
    exampleOriginal: 'Kalau skripsi belum selesai hari ini, berarti seluruh minggu ini sia-sia.',
    exampleReframed:
      'Hari ini aku selesai dua halaman. Itu lebih banyak dari nol, dan besok bisa lanjut lagi.',
  },
  {
    id: 'cbt-catastrophizing',
    trap: 'Membesar-besarkan Bencana',
    explanation: 'Langsung melompat ke skenario terburuk seolah itu pasti terjadi.',
    challengeQuestion:
      'Apa kemungkinan paling realistis? Kalau skenario buruk itu terjadi, apa langkah pertamaku?',
    exampleOriginal:
      'Dosen belum membalas email. Beliau pasti kecewa dan aku tidak akan lulus semester ini.',
    exampleReframed:
      'Dosen mengajar puluhan mahasiswa. Belum membalas biasanya berarti sibuk, bukan membenciku.',
  },
  {
    id: 'cbt-mind-reading',
    trap: 'Menebak Pikiran Orang Lain',
    explanation: 'Yakin orang lain menilai rendah, padahal belum ada bukti nyata selain perasaan sendiri.',
    challengeQuestion: 'Fakta apa yang benar-benar kumiliki untuk mendukung dugaan ini?',
    exampleOriginal: 'Teman tim pasti menganggapku beban karena aku pendiam di rapat tadi.',
    exampleReframed:
      'Aku diam bukan berarti tidak berkontribusi. Bagian tugasku selesai tepat waktu.',
  },
  {
    id: 'cbt-language',
    trap: 'Bahasa Absolut',
    explanation: 'Kata selalu, tidak pernah, dan harus membuat keadaan terasa jauh lebih kaku.',
    challengeQuestion: 'Coba tulis ulang kalimat itu tanpa kata selalu, tidak pernah, atau harus.',
    exampleOriginal: 'Aku selalu salah dan tidak pernah bisa menyelesaikan apa pun.',
    exampleReframed: 'Ada satu tugas yang belum selesai. Bukan berarti semuanya salah.',
  },
];
