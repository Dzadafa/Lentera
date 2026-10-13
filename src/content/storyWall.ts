export interface CuratedStory {
  id: string;
  authorLabel: string;
  fromTier: 'moderate' | 'high';
  nowStatus: string;
  quote: string;
  story: string;
  actionTaken: string;
  tags: string[];
}

/**
 * Dinding Cerita (I4).
 *
 * Seluruh cerita dibundel luring di dalam aplikasi — tidak ada server, tidak ada
 * unggahan, dan tidak ada cerita pengguna yang pernah dikirim ke mana pun.
 * Fungsinya memberi gambaran bahwa kondisi berat pernah dilalui orang lain dan
 * bisa membaik, tanpa membuka ruang yang butuh moderasi dua puluh empat jam.
 */
export const CURATED_STORIES: CuratedStory[] = [
  {
    id: 'story-1',
    authorLabel: 'Mahasiswa tingkat akhir, 22 tahun',
    fromTier: 'high',
    nowStatus: 'Sedang menyelesaikan bab empat skripsi',
    quote: 'Waktu skor depresiku tinggi, aku pikir ini salahku karena malas.',
    story:
      'Tiga bulan lalu aku tidak bisa bangun dari tempat tidur sebelum jam dua siang. Setiap buka laptop dada terasa sesak. Yang paling mengubah adalah saat aku berani ke klinik kampus dan bilang ke dokternya: "Dok, saya tidak bisa tidur dan cemas terus." Ternyata aku dirujuk dan dapat pendampingan. Aku tidak langsung sembuh besoknya, tapi setidaknya aku tahu ini masalah medis, bukan karakterku yang cacat.',
    actionTaken: 'Konsultasi dokter umum, lalu dirujuk ke psikolog',
    tags: ['Kondisi tinggi', 'Kuliah', 'BPJS'],
  },
  {
    id: 'story-2',
    authorLabel: 'Software engineer junior, 24 tahun',
    fromTier: 'moderate',
    nowStatus: 'Menetapkan jam batas laptop mati pukul 19.00',
    quote: 'Burnout tidak datang tiba-tiba. Ia datang dari lima puluh keputusan kecil menunda istirahat.',
    story:
      'Aku selalu bilang "tanggung satu pekerjaan lagi" sampai akhirnya jam satu dini hari baru tutup laptop. Hasil skriningku waktu itu kondisi sedang. Aku mulai dari hal paling sederhana: memasang alarm jam 18.30 untuk merapikan meja, lalu berjalan kaki lima belas menit tanpa headset. Pikiran yang tadinya terasa seperti kabel kusut mulai punya ruang.',
    actionTaken: 'Ritual tutup hari dan jeda jalan kaki',
    tags: ['Kondisi sedang', 'Pekerja muda', 'Kebiasaan'],
  },
  {
    id: 'story-3',
    authorLabel: 'Fresh graduate, 23 tahun',
    fromTier: 'high',
    nowStatus: 'Sudah mulai magang di tempat baru',
    quote: 'Menelepon 119 ekstensi 8 pukul sebelas malam adalah keputusan terbaikku tahun ini.',
    story:
      'Malam itu kepalaku terlalu bising dan aku merasa tidak ada jalan keluar. Aku tidak mau bercerita ke orang tua karena takut mereka memikirkan biaya. Akhirnya aku menekan 119 ekstensi 8. Petugasnya tidak menghakimi, hanya mendengarkan aku menangis selama dua puluh menit dan menemani sampai napasku teratur lagi. Besok paginya aku punya keberanian untuk ke puskesmas.',
    actionTaken: 'Hotline 119 ekstensi 8, lalu ke puskesmas',
    tags: ['Kondisi tinggi', 'Hotline', 'Keluarga'],
  },
  {
    id: 'story-4',
    authorLabel: 'Mahasiswa magister, 26 tahun',
    fromTier: 'moderate',
    nowStatus: 'Fokus satu tugas per hari',
    quote: 'Aku berhenti merasa bersalah saat mengambil jeda lima menit.',
    story:
      'Aku terbiasa memforsir diri sampai kepala pusing sebelah. Rencana tujuh hari terdengar klise waktu pertama kali aku baca. Tapi waktu aku coba hari kedua, jeda mikro lima menit setiap lima puluh menit kerja, ternyata konsentrasiku di sore hari jauh lebih bertahan.',
    actionTaken: 'Jeda mikro 50/5',
    tags: ['Kondisi sedang', 'Fokus', 'Akademik'],
  },
  {
    id: 'story-5',
    authorLabel: 'Karyawan kontrak, 25 tahun',
    fromTier: 'moderate',
    nowStatus: 'Tidur lebih teratur, energi lebih stabil',
    quote: 'Aku berhenti memaksakan tidur delapan jam.',
    story:
      'Aku berhenti memaksakan tidur delapan jam dan hanya menetapkan jam bangun yang sama setiap hari. Dua minggu kemudian tidurku mengikuti sendiri. Yang berubah bukan hanya tidurnya, tapi juga cara aku menilai hari yang berat.',
    actionTaken: 'Menetapkan jam bangun tetap',
    tags: ['Kondisi sedang', 'Tidur', 'Kebiasaan'],
  },
];

export const STORY_TAG_FILTERS = ['Semua', 'Kondisi tinggi', 'Kondisi sedang'] as const;
