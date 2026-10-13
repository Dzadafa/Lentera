export interface Affirmation {
  id: string;
  text: string;
  context: string;
}

/**
 * Afirmasi untuk penutup Reset 60 Detik (H6).
 * Dipilih yang bersifat pengamatan diri, bukan klaim kosong, agar tidak terasa
 * memaksa bagi orang yang sedang tidak percaya pada dirinya.
 */
export const AFFIRMATIONS: Affirmation[] = [
  {
    id: 'aff-1',
    text: 'Tubuhku sedang berusaha melindungiku, bukan melawanku.',
    context: 'Saat dada terasa sesak tanpa sebab yang jelas',
  },
  {
    id: 'aff-2',
    text: 'Aku boleh menyelesaikan satu hal kecil saja hari ini.',
    context: 'Saat daftar tugas terasa mustahil',
  },
  {
    id: 'aff-3',
    text: 'Yang aku rasakan sekarang tidak akan berlangsung selamanya.',
    context: 'Saat gelombang emosi sedang memuncak',
  },
  {
    id: 'aff-4',
    text: 'Meminta bantuan adalah keterampilan, bukan kelemahan.',
    context: 'Saat ragu menghubungi orang lain',
  },
  {
    id: 'aff-5',
    text: 'Aku sudah melewati hari-hari yang lebih berat daripada hari ini.',
    context: 'Saat merasa tidak sanggup melanjutkan',
  },
];
