/**
 * Token desain TautJiwa — sumber tunggal kebenaran adalah DESIGN.md.
 * Jangan mengarang nilai hex, ukuran font, atau radius baru di dalam komponen.
 */

export const colors = {
  primary: '#1B3B2B',
  secondary: '#437A5B',
  tertiary: '#2A9D8F',
  neutral: '#F7F9F8',

  surface: '#FFFFFF',
  surfaceContainer: '#F1F5F2',
  surfaceContainerHigh: '#E4EDE7',
  onSurface: '#131F17',
  onSurfaceVariant: '#5A6B60',
  inverseSurface: '#131F17',
  inverseOnSurface: '#F7F9F8',

  outline: '#8FA396',
  outlineVariant: '#DFE8E2',

  onPrimary: '#FFFFFF',
  primaryContainer: '#E2EFE7',
  onPrimaryContainer: '#0F261B',

  onSecondary: '#FFFFFF',
  secondaryContainer: '#D4E8DC',
  onSecondaryContainer: '#1B3B2B',

  onTertiary: '#FFFFFF',
  tertiaryContainer: '#D3F0EC',
  onTertiaryContainer: '#0A302B',

  background: '#F7F9F8',
  onBackground: '#131F17',

  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#FFE5E8',
  onErrorContainer: '#5C000B',

  success: '#2E7D32',
  onSuccess: '#FFFFFF',
  successContainer: '#E8F5E9',
  onSuccessContainer: '#123B14',

  warning: '#9A6700',
  onWarning: '#FFFFFF',
  warningContainer: '#FEF3C7',
  onWarningContainer: '#4A3200',

  info: '#1F6FEB',
  onInfo: '#FFFFFF',
  infoContainer: '#DBEAFE',
  onInfoContainer: '#0F2C5C',

  tierLow: '#2E7D32',
  tierLowContainer: '#E8F5E9',
  onTierLowContainer: '#123B14',
  tierModerate: '#B45309',
  tierModerateContainer: '#FEF3C7',
  onTierModerateContainer: '#4A3200',
  tierHigh: '#B3261E',
  tierHighContainer: '#FFE5E8',
  onTierHighContainer: '#5C000B',

  crisis: '#C1121F',
  onCrisis: '#FFFFFF',
  crisisContainer: '#FFE4E6',
  onCrisisContainer: '#60000A',

  stealthSurface: '#FFFFFF',
  stealthOnSurface: '#1F2937',
  stealthOutline: '#D1D5DB',
} as const;

export const typography = {
  displayLg: { fontSize: 32, fontWeight: '700', lineHeight: 38, letterSpacing: -0.64 },
  headlineLg: { fontSize: 24, fontWeight: '700', lineHeight: 30, letterSpacing: -0.24 },
  headlineMd: { fontSize: 20, fontWeight: '600', lineHeight: 26, letterSpacing: 0 },
  bodyLg: { fontSize: 16, fontWeight: '400', lineHeight: 26, letterSpacing: 0 },
  bodyMd: { fontSize: 14, fontWeight: '400', lineHeight: 22, letterSpacing: 0 },
  bodySm: { fontSize: 12, fontWeight: '400', lineHeight: 18, letterSpacing: 0 },
  labelLg: { fontSize: 14, fontWeight: '600', lineHeight: 20, letterSpacing: 0.14 },
  labelMd: { fontSize: 12, fontWeight: '600', lineHeight: 17, letterSpacing: 0.48 },
  labelSm: { fontSize: 11, fontWeight: '700', lineHeight: 14, letterSpacing: 0.88 },
} as const;

export const radius = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const spacing = {
  unit: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  marginMobile: 20,
  gapCard: 12,
} as const;

export const motion = {
  screenTransitionMs: 300,
  breathPhaseMs: 4000,
} as const;
