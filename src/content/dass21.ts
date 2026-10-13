import type { Dass21Item } from '../types/domain';

/**
 * Instrumen DASS-21 (Depression Anxiety Stress Scales, 21 item).
 * Terjemahan Bahasa Indonesia untuk keperluan skrining awal — BUKAN alat diagnosis.
 * Skala jawaban: 0 = Tidak pernah, 1 = Kadang, 2 = Sering, 3 = Selalu (7 hari terakhir).
 */
export const DASS21_ITEMS: Dass21Item[] = [
  { id: 1, order: 1, dimension: 'stress', text: 'Saya sulit menenangkan diri.' },
  { id: 2, order: 2, dimension: 'anxiety', text: 'Mulut saya terasa kering.' },
  { id: 3, order: 3, dimension: 'depression', text: 'Saya tidak bisa merasakan perasaan positif sama sekali.' },
  { id: 4, order: 4, dimension: 'anxiety', text: 'Saya kesulitan bernapas.' },
  { id: 5, order: 5, dimension: 'depression', text: 'Saya sulit berinisiatif melakukan sesuatu.' },
  { id: 6, order: 6, dimension: 'stress', text: 'Saya bereaksi berlebihan terhadap situasi kecil.' },
  { id: 7, order: 7, dimension: 'anxiety', text: 'Saya mengalami gemetar.' },
  { id: 8, order: 8, dimension: 'stress', text: 'Saya merasa banyak energi habis untuk kecemasan.' },
  { id: 9, order: 9, dimension: 'anxiety', text: 'Saya khawatir akan situasi yang membuat saya panik dan malu.' },
  { id: 10, order: 10, dimension: 'depression', text: 'Saya merasa tidak ada hal yang bisa saya nantikan.' },
  { id: 11, order: 11, dimension: 'stress', text: 'Saya merasa gelisah.' },
  { id: 12, order: 12, dimension: 'stress', text: 'Saya sulit untuk rileks.' },
  { id: 13, order: 13, dimension: 'depression', text: 'Saya merasa sedih dan tertekan.' },
  { id: 14, order: 14, dimension: 'stress', text: 'Saya tidak sabar terhadap hal yang menghalangi saya.' },
  { id: 15, order: 15, dimension: 'anxiety', text: 'Saya merasa hampir panik.' },
  { id: 16, order: 16, dimension: 'depression', text: 'Saya tidak bisa merasa antusias terhadap apa pun.' },
  { id: 17, order: 17, dimension: 'depression', text: 'Saya merasa diri saya tidak berharga.' },
  { id: 18, order: 18, dimension: 'stress', text: 'Saya merasa mudah tersinggung.' },
  { id: 19, order: 19, dimension: 'anxiety', text: 'Saya sadar detak jantung berubah padahal tidak beraktivitas fisik.' },
  { id: 20, order: 20, dimension: 'anxiety', text: 'Saya merasa takut tanpa alasan yang jelas.' },
  { id: 21, order: 21, dimension: 'depression', text: 'Saya merasa hidup tidak berarti.', crisisFlag: true },
];

export const ANSWER_SCALE: { value: 0 | 1 | 2 | 3; label: string }[] = [
  { value: 0, label: 'Tidak pernah' },
  { value: 1, label: 'Kadang-kadang' },
  { value: 2, label: 'Sering' },
  { value: 3, label: 'Selalu' },
];

export const DASS21_TOTAL_ITEMS = DASS21_ITEMS.length;
