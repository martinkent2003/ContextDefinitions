// DESIGN TOKENS - Single source of truth
import { Platform } from 'react-native'

const palette = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Zinc — cool-toned neutral, sharp contrast
  gray: {
    10: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  // Base
  white: '#ffffff',
  black: '#09090b',
} as const

// Spacing scale (based on 4px grid)
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  xxxxl: 96,
} as const

// Typography
// Insert Excalifont in here
export const typography = {
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'SpaceMono',
    excalifont: 'Excalifont',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const

// Border radius
export const radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 36,
  xxxl: 48,
  full: 9999,
} as const

// Shadows
export const shadows = {
  none: {},
  sm: Platform.select({
    web: { boxShadow: '0px 1px 2px rgba(0,0,0,0.1)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
  }) as object,
  md: Platform.select({
    web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.15)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
  }) as object,
  lg: Platform.select({
    web: { boxShadow: '0px 4px 8px rgba(0,0,0,0.2)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
  }) as object,
}

// Theme-specific colors to light/dark
export const Colors = {
  light: {
    // Backgrounds
    background: palette.gray[10],
    backgroundSecondary: palette.gray[50],
    backgroundTertiary: palette.gray[100],

    // Text
    text: palette.gray[950],
    textSecondary: palette.gray[600],
    textTertiary: palette.gray[400],
    textInverse: palette.white,

    // Interactive
    tint: palette.primary[600],
    buttonBackground: palette.primary[600],
    buttonBackgroundSecondary: palette.gray[100],
    buttonBackgroundGhost: 'transparent',

    // Borders
    border: palette.gray[200],
    borderFocused: palette.primary[600],

    // Cards
    cardBackground: palette.white,
    cardBorder: palette.gray[200],

    // Status
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,

    // Tab bar
    tabIconDefault: palette.gray[400],
    tabIconSelected: palette.primary[600],
  },
  dark: {
    // Backgrounds
    background: palette.gray[950],
    backgroundSecondary: palette.gray[900],
    backgroundTertiary: palette.gray[800],

    // Text
    text: palette.gray[50],
    textSecondary: palette.gray[400],
    textTertiary: palette.gray[600],
    textInverse: palette.gray[950],

    // Interactive
    tint: palette.primary[400],
    buttonBackground: palette.primary[600],
    buttonBackgroundSecondary: palette.gray[800],
    buttonBackgroundGhost: 'transparent',

    // Borders
    border: palette.gray[800],
    borderFocused: palette.primary[400],

    // Cards
    cardBackground: palette.gray[900],
    cardBorder: palette.gray[800],

    // Status
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,

    // Tab bar
    tabIconDefault: palette.gray[600],
    tabIconSelected: palette.gray[50],
  },
} as const

// Export everything as a unified theme
export const theme = {
  colors: Colors,
  spacing,
  typography,
  radii,
  shadows,
} as const

export type Theme = typeof theme
export type ColorScheme = keyof typeof Colors
export type ThemeColors = keyof typeof Colors.light

// Default export for convenience (the Colors object for light/dark access)
export default Colors
