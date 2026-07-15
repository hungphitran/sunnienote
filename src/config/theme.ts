export const COLORS = {
  primary: '#78555e',          // Warm pink/earthy brown
  onPrimary: '#ffffff',
  primaryContainer: '#ffd1dc', // Soft peach/pink
  onPrimaryContainer: '#7a5761',
  primaryFixed: '#ffd9e2',
  primaryFixedDim: '#e7bbc6',
  onPrimaryFixedVariant: '#5e3e47',

  secondary: '#2f6a3f',        // Soft green
  onSecondary: '#ffffff',
  secondaryContainer: '#b2f2bb', // Mint green
  onSecondaryContainer: '#357044',
  secondaryFixed: '#b2f2bb',
  secondaryFixedDim: '#96d5a0',
  onSecondaryFixedVariant: '#145129',

  tertiary: '#605a7c',         // Lavender
  onTertiary: '#ffffff',
  tertiaryContainer: '#e1d8ff', // Soft purple
  onTertiaryContainer: '#635c7e',
  tertiaryFixed: '#e6deff',
  tertiaryFixedDim: '#cac1e8',
  onTertiaryFixedVariant: '#484263',

  background: '#f8f9fa',
  onBackground: '#191c1d',

  surface: '#ffffff',
  surfaceDim: '#d9dadb',
  surfaceBright: '#f8f9fa',
  onSurface: '#191c1d',
  onSurfaceVariant: '#4f4446',

  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f5',
  surfaceContainer: '#edeeef',
  surfaceContainerHigh: '#e7e8e9',
  surfaceContainerHighest: '#e1e3e4',

  outline: '#817476',
  outlineVariant: '#d3c3c5',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Custom transparent overlay styles
  overlayPrimary: 'rgba(120, 85, 94, 0.08)',
  overlaySecondary: 'rgba(47, 106, 63, 0.08)',
  overlayTertiary: 'rgba(96, 90, 124, 0.08)',
};

export const FONTS = {
  // We will map these to dynamic Quicksand and Nunito Sans fonts loaded in App.tsx
  headlineLarge: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 28,
    lineHeight: 36,
  },
  headlineMedium: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 22,
    lineHeight: 28,
  },
  headlineSmall: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 18,
    lineHeight: 26,
  },
  bodyMedium: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    lineHeight: 18,
  },
  labelMedium: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    lineHeight: 16,
  },
};

export const SPACING = {
  xs: 4,
  sm: 12,
  md: 20,
  lg: 32,
  base: 8,
  marginMobile: 20,
  gutterMobile: 16,
};

export const SHADOWS = {
  soft: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  tonalPrimary: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
  tonalSecondary: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
  ambient: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
};
