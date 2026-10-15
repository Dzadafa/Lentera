export type Tier = 'low' | 'moderate' | 'high';
export type Dimension = 'depression' | 'anxiety' | 'stress';

export interface Dass21Item {
  id: number;
  /** Urutan tampil 1..21 */
  order: number;
  dimension: Dimension;
  text: string;
  /** Item yang menandai risiko keselamatan bila dijawab tinggi. */
  crisisFlag?: boolean;
}

export interface Dass21Answer {
  itemId: number;
  value: 0 | 1 | 2 | 3;
}

export type ScreeningInstrument = 'k10' | 'phq9' | 'gad7';

export interface ScreeningQuestionItem {
  id: string;
  instrument: ScreeningInstrument;
  order: number;
  text: string;
  crisisFlag?: boolean;
}

export interface ScreeningAnswerScale {
  value: number;
  label: string;
}

export interface DimensionScore {
  raw: number;
  /** Skor final */
  score: number;
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'extremely_severe';
}

export interface TieredScreeningResult {
  k10Score: number;
  k10Severity: 'low' | 'moderate' | 'high' | 'very_high';
  openedDeepScreening: boolean;
  phq9Score?: number;
  phq9Severity?: 'normal' | 'mild' | 'moderate' | 'severe' | 'extremely_severe';
  gad7Score?: number;
  gad7Severity?: 'normal' | 'mild' | 'moderate' | 'severe';
}

export interface ScreeningResult {
  id: string;
  createdAt: number;
  depression: DimensionScore;
  anxiety: DimensionScore;
  stress: DimensionScore;
  tier: Tier;
  crisisFlag: boolean;
  answers: Dass21Answer[] | { id: string; value: number }[];
  tiered?: TieredScreeningResult;
}

export interface CrisisEvent {
  id: string;
  createdAt: number;
  source: string;
  actionTaken: string;
}

export interface CheckIn {
  id: string;
  date: string;
  mood: number;
  energy: number;
  note: string | null;
  createdAt: number;
}

export interface AppSettings {
  workMode: boolean;
  hapticsEnabled: boolean;
  ambientEnabled: boolean;
  reduceMotion: boolean;
  dailyReminder: boolean;
}
