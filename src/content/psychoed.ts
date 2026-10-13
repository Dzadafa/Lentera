export interface PsychoedCard {
  id: string;
  title: string;
  body: string;
  tier: 'low' | 'moderate' | 'high';
}

export const PSYCHOED_CARDS: PsychoedCard[] = [
  {
    id: 'early-signs',
    title: 'Tanda awal stres naik tingkat',
    body: 'Tidur mulai tidak nyenyak, mudah tersinggung, dan sulit fokus lebih dari 20 menit. Tanda ini normal dan masih bisa diubah dengan jeda kecil setiap hari.',
    tier: 'low',
  },
  {
    id: 'body-first',
    title: 'Tubuh bicara lebih dulu',
    body: 'Tegang di leher, rahang mengunci, dan napas pendek muncul sebelum pikiran terasa penuh. Menarik napas panjang 30 detik sering cukup untuk memutus siklus itu.',
    tier: 'low',
  },
  {
    id: 'not-lazy',
    title: 'Ini bukan kemalasan',
    body: 'Kehilangan minat pada hal yang biasanya menyenangkan adalah gejala, bukan sifat buruk. Memaksakan diri tanpa bantuan justru memperpanjang siklusnya.',
    tier: 'moderate',
  },
  {
    id: 'one-step',
    title: 'Satu langkah cukup untuk hari ini',
    body: 'Tidak perlu menyelesaikan semuanya sekaligus. Pilih satu hal kecil yang bisa diselesaikan dalam 10 menit, lalu berhenti tanpa rasa bersalah.',
    tier: 'moderate',
  },
  {
    id: 'help-works',
    title: 'Bantuan bekerja',
    body: 'Sebagian besar orang dengan gejala sedang sampai berat membaik setelah mendapat dukungan profesional. Yang membedakan bukan kekuatan, melainkan kecepatan mencari bantuan.',
    tier: 'high',
  },
];
