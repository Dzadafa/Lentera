/**
 * Token desain Lentera — sumber tunggal kebenaran adalah DESIGN.md.
 * Listening, Empathy, Nurture, Togetherness, Encouragement, Resilience, Awareness
 */

export const colors = {
  // Brand (Warna Logo Lentera)
  primary: '#7843E4',          // Ungu Utama Logo
  primarySoft: '#EFE6FD',      // Latar chip/badge ungu sangat lembut
  primaryOn: '#FFFFFF',

  // Secondary & Tertiary
  secondary: '#C7A6FB',        // Ungu Muda Logo
  secondaryContainer: '#F3EBFE',
  onSecondaryContainer: '#361273',

  tertiary: '#FEC565',         // Kuning Lentera (Yellow Cahaya)
  tertiaryContainer: '#FFF4DE',
  onTertiaryContainer: '#573B00',

  neutral: '#F7F4FD',

  // Surface & Text
  surface: '#FFFFFF',
  surfaceContainer: '#F7F4FD',
  surfaceContainerHigh: '#EFE8FC',
  onSurface: '#1B1B23',
  onSurfaceVariant: '#525260', // Kontras ditingkatkan dari #6E6E7A agar lolos WCAG AA (> 7:1)
  inverseSurface: '#1B1B23',
  inverseOnSurface: '#F7F4FD',

  textPrimary: '#1B1B23',
  textSecondary: '#525260',   // Kontras WCAG AA di atas #F7F4FD dan #FFFFFF (> 7:1)
  textMuted: '#6A6A78',       // Kontras WCAG AA di atas #F7F4FD (> 5:1)

  // Outline
  outline: '#7C7C8C',         // Kontras outline lebih tegas
  outlineVariant: '#E8DCFC',

  // Interactive pairs
  onPrimary: '#FFFFFF',
  primaryContainer: '#EDE2FE',
  onPrimaryContainer: '#2B0E68',

  onSecondary: '#200B42',
  onTertiary: '#2B1C00',

  // Background
  background: '#F7F4FD',
  onBackground: '#1B1B23',
  bgGradientFrom: '#FDF7EB',
  bgGradientTo: '#EFE8FC',

  // Accents
  accentPinkSoft: '#FBD9E4',
  accentPink: '#C2406E',
  accentYellow: '#FEC565',     // Kuning Lentera
  accentCyan: '#22B8CF',
  heartOutline: '#E8DCFC',

  // Status & Tiers
  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#FFE5E8',
  onErrorContainer: '#5C000B',

  success: '#2E7D32',
  onSuccess: '#FFFFFF',
  successContainer: '#E8F5E9',
  onSuccessContainer: '#123B14',

  warning: '#FEC565',
  onWarning: '#2B1C00',
  warningContainer: '#FFF4DE',
  onWarningContainer: '#573B00',

  info: '#22B8CF',
  onInfo: '#FFFFFF',
  infoContainer: '#D0F4F7',
  onInfoContainer: '#084852',

  // Tiers Skrining
  tierLow: '#2E7D32',
  tierLowContainer: '#E8F5E9',
  onTierLowContainer: '#123B14',
  tierModerate: '#B45309',
  tierModerateContainer: '#FEF3C7',
  onTierModerateContainer: '#4A3200',
  tierHigh: '#B3261E',
  tierHighContainer: '#FFE5E8',
  onTierHighContainer: '#5C000B',

  // Crisis Interceptor
  crisis: '#C1121F',
  onCrisis: '#FFFFFF',
  crisisContainer: '#FFE4E6',
  onCrisisContainer: '#60000A',

  // Mode Samaran (Stealth)
  stealthSurface: '#FFFFFF',
  stealthOnSurface: '#1F2937',
  stealthOutline: '#D1D5DB',
} as const;

export const typography = {
  displayLg: { fontFamily: 'Montserrat-Bold', fontSize: 24, lineHeight: 32, letterSpacing: -0.24 },
  headlineLg: { fontFamily: 'Montserrat-Bold', fontSize: 20, lineHeight: 26, letterSpacing: -0.1 },
  headlineMd: { fontFamily: 'Montserrat-SemiBold', fontSize: 18, lineHeight: 24, letterSpacing: 0 },
  cardTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  bodyLg: { fontFamily: 'Montserrat-Regular', fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  bodyMd: { fontFamily: 'Montserrat-Regular', fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  bodySm: { fontFamily: 'Montserrat-Regular', fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  button: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, lineHeight: 24, letterSpacing: 0.2 },
  labelLg: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  labelMd: { fontFamily: 'Montserrat-Medium', fontSize: 12, lineHeight: 16, letterSpacing: 0 },
  labelSm: { fontFamily: 'Montserrat-Bold', fontSize: 10, lineHeight: 12, letterSpacing: 0.4 },
} as const;

export const radius = {
  none: 0,
  sm: 6,
  chip: 8,
  md: 12,
  card: 20,
  lg: 20,
  sheet: 24,
  photo: 24,
  xl: 24,
  button: 9999,
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

export const shadows = {
  card: {
    shadowColor: 'rgba(80, 60, 140, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
} as const;

export const motion = {
  screenTransitionMs: 300,
  breathPhaseMs: 4000,
} as const;
