import type { Severity } from './severity';
import type { Tier, TieredScreeningResult } from './domain';

export interface ScreeningTrendPoint {
  id: string;
  createdAt: number;
  depression: number;
  anxiety: number;
  stress: number;
  tier: Tier;
  tiered?: TieredScreeningResult;
}

export interface TrendDelta {
  dimension: 'depression' | 'anxiety' | 'stress';
  latest: number;
  previous: number;
  delta: number;
  direction: 'turun' | 'naik' | 'stabil';
}

export type { Severity };
