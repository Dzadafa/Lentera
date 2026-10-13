export interface PlanDay {
  day: number;
  title: string;
  action: string;
}

export const PLAN_7_DAY: PlanDay[] = [
  { day: 1, title: 'Jam tidur tetap', action: 'Tetapkan satu jam bangun yang sama, termasuk akhir pekan.' },
  { day: 2, title: 'Jeda mikro', action: 'Setiap 50 menit kerja, berhenti 5 menit dan berdiri dari kursi.' },
  { day: 3, title: 'Ritual tutup hari', action: 'Tulis 3 hal yang selesai hari ini, lalu tutup laptop.' },
  { day: 4, title: 'Gerak ringan', action: 'Jalan cepat 15 menit di luar ruangan tanpa ponsel.' },
  { day: 5, title: 'Bicara sekali', action: 'Ceritakan kondisi kamu ke satu orang yang kamu percaya.' },
  { day: 6, title: 'Batasi layar', action: 'Matikan notifikasi media sosial setelah pukul 21.00.' },
  { day: 7, title: 'Evaluasi', action: 'Lihat kembali catatan energi minggu ini dan pilih satu kebiasaan untuk dilanjutkan.' },
];
