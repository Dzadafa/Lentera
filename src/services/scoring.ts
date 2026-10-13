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
