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

export interface DimensionScore {
  raw: number;
  /** Skor DASS-21 final = raw x 2 */
  score: number;
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'extremely_severe';
}

export interface ScreeningResult {
  id: string;
  createdAt: number;
  depression: DimensionScore;
  anxiety: DimensionScore;
  stress: DimensionScore;
  tier: Tier;
  crisisFlag: boolean;
  answers: Dass21Answer[];
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
