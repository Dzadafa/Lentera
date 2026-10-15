import type { ScreeningQuestionItem, ScreeningAnswerScale } from '../types/domain';

/**
 * Kessler Psychological Distress Scale (K-10).
 * Mengukur tingkat distres psikologis global (depresi & kecemasan) dalam 30 hari terakhir.
 * Skala 1 - 5:
 * 1 = Tidak pernah (None of the time)
 * 2 = Jarang (A little of the time)
 * 3 = Kadang-kadang (Some of the time)
 * 4 = Sebagian besar waktu (Most of the time)
 * 5 = Sepanjang waktu (All of the time)
 *
 * Rentang Skor K-10: 10 - 50.
 * Skor >= 25 menandakan distres tinggi / kemungkinan gangguan mental (membuka PHQ-9 & GAD-7).
 */
export const K10_ITEMS: ScreeningQuestionItem[] = [
  { id: 'k10_1', instrument: 'k10', order: 1, text: 'Seberapa sering kamu merasa lelah tanpa alasan yang jelas?' },
  { id: 'k10_2', instrument: 'k10', order: 2, text: 'Seberapa sering kamu merasa gugup atau cemas?' },
  { id: 'k10_3', instrument: 'k10', order: 3, text: 'Seberapa sering kamu merasa sangat gugup hingga tidak ada yang bisa menenangkanmu?' },
  { id: 'k10_4', instrument: 'k10', order: 4, text: 'Seberapa sering kamu merasa putus asa tentang masa depan?' },
  { id: 'k10_5', instrument: 'k10', order: 5, text: 'Seberapa sering kamu merasa gelisah atau tidak tenang?' },
  { id: 'k10_6', instrument: 'k10', order: 6, text: 'Seberapa sering kamu merasa sangat gelisah hingga tidak bisa duduk diam?' },
  { id: 'k10_7', instrument: 'k10', order: 7, text: 'Seberapa sering kamu merasa tertekan atau murung?' },
  { id: 'k10_8', instrument: 'k10', order: 8, text: 'Seberapa sering kamu merasa bahwa segala sesuatu terasa begitu berat?' },
  { id: 'k10_9', instrument: 'k10', order: 9, text: 'Seberapa sering kamu merasa sangat sedih hingga tidak ada yang bisa menghiburmu?' },
  { id: 'k10_10', instrument: 'k10', order: 10, text: 'Seberapa sering kamu merasa diri kamu tidak berharga?' },
];

export const K10_SCALE: ScreeningAnswerScale[] = [
  { value: 1, label: 'Tidak pernah' },
  { value: 2, label: 'Jarang' },
  { value: 3, label: 'Kadang-kadang' },
  { value: 4, label: 'Sebagian besar waktu' },
  { value: 5, label: 'Sepanjang waktu' },
];

/**
 * Patient Health Questionnaire (PHQ-9).
 * Skrining gejala depresi (2 minggu terakhir).
 * Skala 0 - 3:
 * 0 = Tidak pernah
 * 1 = Beberapa hari
 * 2 = Lebih dari separuh waktu
 * 3 = Hampir setiap hari
 */
export const PHQ9_ITEMS: ScreeningQuestionItem[] = [
  { id: 'phq_1', instrument: 'phq9', order: 1, text: 'Kurang berminat atau bergairah dalam melakukan hal-hal yang biasanya disukai.' },
  { id: 'phq_2', instrument: 'phq9', order: 2, text: 'Merasa sedih, murung, tertekan, atau putus asa.' },
  { id: 'phq_3', instrument: 'phq9', order: 3, text: 'Sulit tidur atau tidur terlalu banyak.' },
  { id: 'phq_4', instrument: 'phq9', order: 4, text: 'Merasa lelah atau kurang bertenaga.' },
  { id: 'phq_5', instrument: 'phq9', order: 5, text: 'Kurang nafsu makan atau makan terlalu berlebihan.' },
  { id: 'phq_6', instrument: 'phq9', order: 6, text: 'Merasa buruk tentang diri sendiri — merasa gagal atau mengecewakan diri / keluarga.' },
  { id: 'phq_7', instrument: 'phq9', order: 7, text: 'Sulit berkonsentrasi pada sesuatu, seperti membaca atau belajar/bekerja.' },
  { id: 'phq_8', instrument: 'phq9', order: 8, text: 'Bergerak atau berbicara sangat lambat, atau sebaliknya sangat gelisah dan bergerak lebih banyak dari biasanya.' },
  { id: 'phq_9', instrument: 'phq9', order: 9, text: 'Memiliki pikiran bahwa lebih baik mati atau ingin menyakiti diri sendiri.', crisisFlag: true },
];

export const PHQ9_SCALE: ScreeningAnswerScale[] = [
  { value: 0, label: 'Tidak pernah' },
  { value: 1, label: 'Beberapa hari' },
  { value: 2, label: 'Lebih dari separuh waktu' },
  { value: 3, label: 'Hampir setiap hari' },
];

/**
 * Generalized Anxiety Disorder (GAD-7).
 * Skrining gejala kecemasan menyeluruh (2 minggu terakhir).
 * Skala 0 - 3:
 * 0 = Tidak pernah
 * 1 = Beberapa hari
 * 2 = Lebih dari separuh waktu
 * 3 = Hampir setiap hari
 */
export const GAD7_ITEMS: ScreeningQuestionItem[] = [
  { id: 'gad_1', instrument: 'gad7', order: 1, text: 'Merasa gugup, cemas, atau gelisah terus-menerus.' },
  { id: 'gad_2', instrument: 'gad7', order: 2, text: 'Tidak mampu menghentikan atau mengontrol rasa khawatir.' },
  { id: 'gad_3', instrument: 'gad7', order: 3, text: 'Terlalu mengkhawatirkan berbagai hal yang berbeda.' },
  { id: 'gad_4', instrument: 'gad7', order: 4, text: 'Sulit untuk rileks atau menenangkan diri.' },
  { id: 'gad_5', instrument: 'gad7', order: 5, text: 'Sangat gelisah hingga sulit untuk duduk diam.' },
  { id: 'gad_6', instrument: 'gad7', order: 6, text: 'Mudah merasa kesal, marah, atau tersinggung.' },
  { id: 'gad_7', instrument: 'gad7', order: 7, text: 'Merasa takut seolah-olah sesuatu yang buruk akan segera terjadi.' },
];

export const GAD7_SCALE: ScreeningAnswerScale[] = [
  { value: 0, label: 'Tidak pernah' },
  { value: 1, label: 'Beberapa hari' },
  { value: 2, label: 'Lebih dari separuh waktu' },
  { value: 3, label: 'Hampir setiap hari' },
];
