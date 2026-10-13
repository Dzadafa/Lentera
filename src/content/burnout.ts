export interface ShutdownStep {
  step: number;
  title: string;
  description: string;
  prompt: string;
}

/** Ritual Tutup Hari (J1) — menutup hari kerja secara sadar, bukan menyerah. */
export const SHUTDOWN_RITUAL: ShutdownStep[] = [
  {
    step: 1,
    title: 'Catat Kemenangan Hari Ini',
    description:
      'Tulis hal-hal kecil yang benar-benar selesai. Otak cenderung mengingat apa yang belum selesai; membalik fokus ini menurunkan kecemasan malam hari.',
    prompt: 'Apa satu hal kecil yang berhasil kamu selesaikan hari ini?',
  },
  {
    step: 2,
    title: 'Pindahkan Tanggungan Besok',
    description:
      'Keluarkan tugas yang menggantung dari kepalamu ke atas kertas. Jangan biarkan ia berputar di memori kerja saat hendak tidur.',
    prompt: 'Apa satu hal penting yang akan kamu kerjakan besok pagi?',
  },
  {
    step: 3,
    title: 'Kunci Batas Hari',
    description:
      'Tutup laptop, matikan tab kerja, atau simpan buku. Tandai bahwa hari ini sudah selesai.',
    prompt: 'Ucapkan pelan: "Pekerjaan hari ini sudah cukup. Aku berhak beristirahat malam ini."',
  },
];

export interface TalkingScript {
  id: string;
  role: 'atasan' | 'dosen' | 'rekan';
  title: string;
  context: string;
  script: string;
}

/** Latihan Bicara (J3/D9) — naskah siap salin untuk percakapan yang berat. */
export const TALKING_SCRIPTS: TalkingScript[] = [
  {
    id: 'script-boss-workload',
    role: 'atasan',
    title: 'Menegosiasikan beban kerja yang berlebih',
    context:
      'Saat tugas baru terus masuk padahal kapasitas sudah penuh dan mulai memengaruhi kualitas tidur.',
    script:
      'Pak/Bu, saya ingin melaporkan progres tugas A dan B. Saat ini ada tugas baru C yang masuk. Agar kualitas dan batas waktu tetap terjaga, boleh kita urutkan prioritasnya? Antara B dan C, mana yang sebaiknya saya selesaikan lebih dulu?',
  },
  {
    id: 'script-boss-timeoff',
    role: 'atasan',
    title: 'Mengajukan izin pemulihan',
    context: 'Saat tubuh dan pikiran sudah lelah akut dan butuh jeda satu sampai dua hari.',
    script:
      'Pak/Bu, saya merasa kondisi fisik dan konsentrasi saya sedang sangat menurun minggu ini. Saya ingin mengajukan cuti satu hari besok untuk pemulihan, agar minggu depan bisa kembali optimal. Pekerjaan mendesak hari ini sudah saya serah-terimakan ke rekan tim.',
  },
  {
    id: 'script-lecturer-deadline',
    role: 'dosen',
    title: 'Meminta perpanjangan tugas kuliah',
    context: 'Saat tugas menumpuk bersamaan dengan kondisi yang sedang tidak fit.',
    script:
      'Selamat siang Bapak/Ibu. Mohon maaf mengganggu. Terkait tugas mata kuliah ini, saya sudah mengerjakan hingga tahap tertentu. Namun minggu ini kondisi kesehatan saya sedang tidak fit, sehingga butuh sedikit waktu tambahan agar hasilnya maksimal. Apakah memungkinkan jika saya mengumpulkan di hari Jumat?',
  },
  {
    id: 'script-peer-boundary',
    role: 'rekan',
    title: 'Menolak tugas tambahan dengan sopan',
    context: 'Saat rekan satu tim meminta lembur atau menimpakan pekerjaan tanpa batas.',
    script:
      'Terima kasih sudah mengajak aku di proyek ini. Untuk minggu ini kapasitas fokusku sudah penuh, jadi aku belum bisa bantu tanpa mengorbankan kualitasnya. Semoga proyeknya lancar ya.',
  },
];

export const MICRO_BREAK = {
  workMinutes: 50,
  breakMinutes: 5,
  suggestions: [
    'Berdiri dan berjalan ke ruangan lain.',
    'Minum segelas air tanpa melihat layar.',
    'Lihat sesuatu yang berjarak lebih dari enam meter.',
    'Regangkan leher dan bahu selama dua puluh detik.',
    'Tarik napas panjang lima kali sebelum kembali bekerja.',
  ],
};

/** Log Kemenangan Kecil (J4) — tiga isian singkat, disimpan hanya di perangkat. */
export const WIN_PROMPTS: string[] = [
  'Satu hal kecil yang berhasil aku selesaikan hari ini...',
  'Satu hal yang aku lakukan untuk menjaga diriku hari ini...',
  'Satu hal yang aku syukuri hari ini...',
];
