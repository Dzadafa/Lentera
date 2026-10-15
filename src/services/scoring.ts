import type { Dass21Answer, Dimension, DimensionScore, ScreeningResult, Tier } from '../types/domain';
import { DASS21_ITEMS } from '../content/dass21';

/**
 * Nilai batas keparahan DASS-21 (skor = raw * 2).
 * Sumber: Lovibond & Lovibond (1995).
 */
const SEVERITY_CUTOFFS: Record<
  Dimension,
  { mild: number; moderate: number; severe: number; extremelySevere: number }
> = {
  depression: { mild: 10, moderate: 14, severe: 21, extremelySevere: 28 },
  anxiety: { mild: 8, moderate: 10, severe: 15, extremelySevere: 20 },
  stress: { mild: 15, moderate: 19, severe: 26, extremelySevere: 34 },
};

function classifySeverity(dimension: Dimension, score: number): DimensionScore['severity'] {
  const cuts = SEVERITY_CUTOFFS[dimension];
  if (score >= cuts.extremelySevere) return 'extremely_severe';
  if (score >= cuts.severe) return 'severe';
  if (score >= cuts.moderate) return 'moderate';
  if (score >= cuts.mild) return 'mild';
  return 'normal';
}

function computeDimension(answers: Dass21Answer[], dimension: Dimension): DimensionScore {
  const itemMap = new Map(DASS21_ITEMS.map((it) => [it.id, it]));
  let raw = 0;
  for (const ans of answers) {
    const item = itemMap.get(ans.itemId);
    if (item && item.dimension === dimension) {
      raw += ans.value;
    }
  }
  const score = raw * 2;
  const severity = classifySeverity(dimension, score);
  return { raw, score, severity };
}

function resolveTier(dep: DimensionScore, anx: DimensionScore, str: DimensionScore, crisis: boolean): Tier {
  if (crisis) return 'high';
  const severities = [dep.severity, anx.severity, str.severity];
  if (severities.includes('extremely_severe') || severities.includes('severe')) {
    return 'high';
  }
  if (severities.includes('moderate')) {
    return 'moderate';
  }
  return 'low';
}

export function calculateDass21(
  answers: Dass21Answer[],
  crisisAnsweredYes: boolean = false
): ScreeningResult {
  const depression = computeDimension(answers, 'depression');
  const anxiety = computeDimension(answers, 'anxiety');
  const stress = computeDimension(answers, 'stress');

  // Cek apakah item krisis (item #21) dijawab >= 2
  const item21Ans = answers.find((a) => a.itemId === 21);
  const item21Flag = item21Ans ? item21Ans.value >= 2 : false;
  const effectiveCrisis = crisisAnsweredYes || item21Flag;

  const tier = resolveTier(depression, anxiety, stress, effectiveCrisis);

  return {
    id: `scr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    depression,
    anxiety,
    stress,
    tier,
    crisisFlag: effectiveCrisis,
    answers,
  };
}

export function formatSeverityLabel(sev: DimensionScore['severity']): string {
  switch (sev) {
    case 'normal':
      return 'Normal';
    case 'mild':
      return 'Ringan';
    case 'moderate':
      return 'Sedang';
    case 'severe':
      return 'Berat';
    case 'extremely_severe':
      return 'Sangat Berat';
  }
}

/**
 * Klasifikasi skor Kessler Psychological Distress Scale (K-10).
 * Rentang 10 - 50:
 * 10 - 19: Kemungkinan sehat mental / distres rendah (low)
 * 20 - 24: Distres ringan (moderate)
 * 25 - 29: Distres sedang-tinggi (high) -> terindikasi distres tinggi (pemicu tahap 2)
 * 30 - 50: Distres sangat tinggi (very_high)
 */
export function classifyK10(score: number): 'low' | 'moderate' | 'high' | 'very_high' {
  if (score >= 30) return 'very_high';
  if (score >= 25) return 'high';
  if (score >= 20) return 'moderate';
  return 'low';
}

export function formatK10Label(sev: 'low' | 'moderate' | 'high' | 'very_high'): string {
  switch (sev) {
    case 'low':
      return 'Distres Rendah (Normal)';
    case 'moderate':
      return 'Distres Ringan';
    case 'high':
      return 'Distres Tinggi';
    case 'very_high':
      return 'Distres Sangat Tinggi';
  }
}

/**
 * Klasifikasi skor PHQ-9 (Depresi).
 * Rentang 0 - 27:
 * 0 - 4: Minimal / Normal
 * 5 - 9: Ringan (Mild)
 * 10 - 14: Sedang (Moderate)
 * 15 - 19: Cukup Berat (Moderately Severe)
 * 20 - 27: Berat (Severe)
 */
export function classifyPhq9(score: number): DimensionScore['severity'] {
  if (score >= 20) return 'extremely_severe';
  if (score >= 15) return 'severe';
  if (score >= 10) return 'moderate';
  if (score >= 5) return 'mild';
  return 'normal';
}

/**
 * Klasifikasi skor GAD-7 (Kecemasan).
 * Rentang 0 - 21:
 * 0 - 4: Minimal / Normal
 * 5 - 9: Ringan (Mild)
 * 10 - 14: Sedang (Moderate)
 * 15 - 21: Berat (Severe)
 */
export function classifyGad7(score: number): DimensionScore['severity'] {
  if (score >= 15) return 'severe';
  if (score >= 10) return 'moderate';
  if (score >= 5) return 'mild';
  return 'normal';
}

/**
 * Perhitungan Skrining Bertingkat:
 * 1. K-10 sepuluh butir cepat.
 * 2. Membuka PHQ-9 dan GAD-7 jika skor K-10 >= 25 (distres tinggi).
 */
export function calculateTieredScreening(
  k10Answers: Record<string, number>,
  phq9Answers: Record<string, number> = {},
  gad7Answers: Record<string, number> = {},
  crisisAnsweredYes: boolean = false
): ScreeningResult {
  // Hitung K-10 (default 1 bila belum dijawab)
  let k10Score = 0;
  for (let i = 1; i <= 10; i++) {
    const val = k10Answers[`k10_${i}`] ?? 1;
    k10Score += val;
  }
  const k10Severity = classifyK10(k10Score);
  const openedDeepScreening = k10Score >= 25;

  let phq9Score = 0;
  let hasPhqCrisis = false;
  if (openedDeepScreening) {
    for (let i = 1; i <= 9; i++) {
      const val = phq9Answers[`phq_${i}`] ?? 0;
      phq9Score += val;
      if (i === 9 && val >= 1) {
        hasPhqCrisis = true;
      }
    }
  }

  let gad7Score = 0;
  if (openedDeepScreening) {
    for (let i = 1; i <= 7; i++) {
      const val = gad7Answers[`gad_${i}`] ?? 0;
      gad7Score += val;
    }
  }

  const effectiveCrisis = crisisAnsweredYes || hasPhqCrisis;

  // Tentukan Tier
  let tier: Tier = 'low';
  if (effectiveCrisis || k10Severity === 'very_high' || (openedDeepScreening && (phq9Score >= 15 || gad7Score >= 15))) {
    tier = 'high';
  } else if (k10Score >= 25 || k10Severity === 'high' || (openedDeepScreening && (phq9Score >= 10 || gad7Score >= 10))) {
    tier = 'high';
  } else if (k10Severity === 'moderate') {
    tier = 'moderate';
  } else {
    tier = 'low';
  }

  const depSeverity = openedDeepScreening ? classifyPhq9(phq9Score) : (k10Severity === 'moderate' ? 'mild' : 'normal');
  const anxSeverity = openedDeepScreening ? classifyGad7(gad7Score) : (k10Severity === 'moderate' ? 'mild' : 'normal');
  const stressSeverity = k10Score >= 30 ? 'severe' : k10Score >= 25 ? 'moderate' : k10Score >= 20 ? 'mild' : 'normal';

  const depressionScore: DimensionScore = {
    raw: openedDeepScreening ? phq9Score : Math.round((k10Score / 50) * 21),
    score: openedDeepScreening ? phq9Score : Math.round((k10Score / 50) * 42),
    severity: depSeverity,
  };

  const anxietyScore: DimensionScore = {
    raw: openedDeepScreening ? gad7Score : Math.round((k10Score / 50) * 21),
    score: openedDeepScreening ? gad7Score : Math.round((k10Score / 50) * 42),
    severity: anxSeverity,
  };

  const stressScore: DimensionScore = {
    raw: k10Score,
    score: k10Score,
    severity: stressSeverity,
  };

  const allAnswers: { id: string; value: number }[] = [
    ...Object.entries(k10Answers).map(([id, value]) => ({ id, value })),
    ...Object.entries(phq9Answers).map(([id, value]) => ({ id, value })),
    ...Object.entries(gad7Answers).map(([id, value]) => ({ id, value })),
  ];

  return {
    id: `scr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    depression: depressionScore,
    anxiety: anxietyScore,
    stress: stressScore,
    tier,
    crisisFlag: effectiveCrisis,
    answers: allAnswers as any,
    tiered: {
      k10Score,
      k10Severity,
      openedDeepScreening,
      phq9Score: openedDeepScreening ? phq9Score : undefined,
      phq9Severity: openedDeepScreening ? depSeverity : undefined,
      gad7Score: openedDeepScreening ? gad7Score : undefined,
      gad7Severity: openedDeepScreening ? (anxSeverity as any) : undefined,
    },
  };
}
