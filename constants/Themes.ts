
// DESIGN TOKENS - Single source of truth
const palette = {
  // 
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2f95dc', 
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  // Neutral colors (what we will use since our app is simple black and white)
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Semantic colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  // Base
  white: '#ffffff',
  black: '#000000',

} as const;

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
} as const;

// Typography
// Insert Excalifont in here 
export const typography = {
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'SpaceMono',
    excalifont: 'Excalifont'
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    xxxxl: 36,
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
} as const;

// Border radius
export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Shadows
export const shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Theme-specific colors to light/dark
export const Colors = {
  light: {
    // Backgrounds
    background: palette.white,
    backgroundSecondary: palette.gray[50],
    backgroundTertiary: palette.gray[100],
    
    // Text
    text: palette.gray[900],
    textSecondary: palette.gray[600],
    textTertiary: palette.gray[400],
    textInverse: palette.white,
    
    // Interactive
    tint: palette.primary[500],
    buttonBackground: palette.primary[500],
    buttonBackgroundSecondary: palette.gray[100],
    buttonBackgroundGhost: 'transparent',
    
    // Borders
    border: palette.gray[200],
    borderFocused: palette.primary[500],
    
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
    tabIconSelected: palette.primary[500],
  },
  dark: {
    // Backgrounds
    background: palette.black,
    backgroundSecondary: palette.gray[900],
    backgroundTertiary: palette.gray[800],
    
    // Text
    text: palette.white,
    textSecondary: palette.gray[300],
    textTertiary: palette.gray[500],
    textInverse: palette.gray[900],
    
    // Interactive
    tint: palette.primary[400],
    buttonBackground: palette.primary[500],
    buttonBackgroundSecondary: palette.gray[700],
    buttonBackgroundGhost: 'transparent',
    
    // Borders
    border: palette.gray[700],
    borderFocused: palette.primary[400],
    
    // Cards
    cardBackground: palette.gray[800],
    cardBorder: palette.gray[700],
    
    // Status
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
    
    // Tab bar
    tabIconDefault: palette.gray[500],
    tabIconSelected: palette.white,
  },
} as const;

// Export everything as a unified theme
export const theme = {
  colors: Colors,
  spacing,
  typography,
  radii,
  shadows,
} as const;

export type Theme = typeof theme;
export type ColorScheme = keyof typeof Colors;
export type ThemeColors = keyof typeof Colors.light;

// Default export for convenience (the Colors object for light/dark access)
export default Colors;