export interface ReferralStep {
  id: number;
  title: string;
  body: string;
  script?: string;
}

export const REFERRAL_STEPS: ReferralStep[] = [
  {
    id: 1,
    title: 'Cek faskes tingkat pertama',
    body: 'Buka aplikasi Mobile JKN, masuk ke menu Peserta, lalu pilih Fasilitas Kesehatan. Di situ tertera nama puskesmas atau klinik tempat kamu terdaftar. Catat nama dan alamatnya.',
  },
  {
    id: 2,
    title: 'Datang ke loket dan bicara',
    body: 'Cukup bawa KTP dan kartu BPJS. Kamu tidak perlu menjelaskan semuanya di depan loket. Ucapkan satu kalimat ini saja, lalu ikuti arahan petugas.',
    script: 'Mbak, saya mau periksa ke dokter umum untuk keluhan sulit tidur dan cemas.',
  },
  {
    id: 3,
    title: 'Minta rujukan ke psikolog atau psikiater',
    body: 'Setelah diperiksa dokter umum, sampaikan bahwa keluhan ini sudah mengganggu kuliah atau pekerjaan. Dokter dapat membuat surat rujukan ke layanan kesehatan jiwa di rumah sakit, dan biayanya ditanggung BPJS.',
    script: 'Dok, keluhan ini sudah mengganggu kuliah dan tidur saya. Boleh saya dirujuk ke layanan kesehatan jiwa?',
  },
];

export const EMERGENCY_CONTACT = {
  label: 'Hotline Kemenkes',
  dial: '119',
  extension: '8',
  display: '119 ekstensi 8',
  tel: 'tel:119',
} as const;
