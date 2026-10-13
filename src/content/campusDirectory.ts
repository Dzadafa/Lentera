export interface CounselingResource {
  id: string;
  category: 'kampus' | 'hotline' | 'komunitas';
  name: string;
  tagline: string;
  channel: string;
  cost: string;
  note: string;
}

/**
 * Direktori layanan pendamping (D11 / I5).
 *
 * Sengaja diurutkan dari hambatan stigma paling rendah (layanan kampus) menuju
 * jalur rujukan penuh (faskes BPJS). Chat anonim publik sengaja tidak dibangun:
 * tanpa tenaga terlatih dan tanpa verifikasi, ruang seperti itu justru bisa
 * memperburuk kondisi krisis.
 */
export const COUNSELING_RESOURCES: CounselingResource[] = [
  {
    id: 'res-unit-bk',
    category: 'kampus',
    name: 'Unit Layanan Bimbingan dan Konseling Kampus',
    tagline: 'Konselor kampus untuk mahasiswa aktif, tanpa rekam medis',
    channel: 'Datang ke gedung kemahasiswaan atau hubungi akun resmi bimbingan konseling kampusmu',
    cost: 'Gratis',
    note: 'Pintu masuk paling ringan. Kamu tidak perlu menjelaskan kronologi lengkap di pertemuan pertama.',
  },
  {
    id: 'res-klinik-kampus',
    category: 'kampus',
    name: 'Klinik Pratama / Poliklinik Kampus',
    tagline: 'Dokter umum untuk keluhan tidur, cemas, dan kelelahan',
    channel: 'Bawa kartu mahasiswa dan kartu BPJS bila ada',
    cost: 'Gratis atau tarif sangat rendah',
    note: 'Cukup bilang ingin konsultasi keluhan sulit tidur. Dokter akan mengarahkan bila perlu rujukan.',
  },
  {
    id: 'res-konselor-sebaya',
    category: 'kampus',
    name: 'Program Konselor Sebaya',
    tagline: 'Teman terlatih yang mendengarkan tanpa menghakimi',
    channel: 'Cari akun resmi konselor sebaya fakultasmu atau tanya bagian kemahasiswaan',
    cost: 'Gratis',
    note: 'Bukan terapis, tetapi sering jadi langkah pertama yang paling mungkin dilakukan hari ini.',
  },
  {
    id: 'res-eap',
    category: 'komunitas',
    name: 'Program Bantuan Karyawan (EAP)',
    tagline: 'Konseling rahasia yang dibiayai perusahaan',
    channel: 'Tanya tim HR soal layanan konseling atau asuransi kesehatan mental di kantormu',
    cost: 'Gratis, ditanggung perusahaan',
    note: 'Biasanya dijalankan penyedia pihak ketiga, sehingga rekan kerja tidak melihat catatanmu.',
  },
  {
    id: 'res-puskesmas',
    category: 'komunitas',
    name: 'Puskesmas dengan Layanan Jiwa',
    tagline: 'Jalur BPJS: dokter umum lalu rujukan ke psikolog atau psikiater',
    channel: 'Ikuti panduan faskes BPJS tiga langkah di aplikasi ini',
    cost: 'Ditanggung BPJS',
    note: 'Layanan kesehatan jiwa di faskes pertama dan rumah sakit ditanggung BPJS tanpa biaya tambahan.',
  },
  {
    id: 'res-kemenkes-119',
    category: 'hotline',
    name: 'Hotline Kemenkes 119 Ekstensi 8',
    tagline: 'Layanan konseling krisis resmi Kementerian Kesehatan RI',
    channel: 'Telepon 119 lalu tekan 8',
    cost: 'Bebas pulsa dari seluruh operator',
    note: 'Siaga dua puluh empat jam untuk kondisi krisis emosional berat.',
  },
  {
    id: 'res-sejiwa',
    category: 'hotline',
    name: 'Layanan Sejiwa',
    tagline: 'Konseling psikologi pertama tanggap darurat',
    channel: 'Hotline 119 ekstensi 8',
    cost: 'Gratis',
    note: 'Ditangani relawan psikolog yang sudah terlatih untuk kondisi akut.',
  },
];
