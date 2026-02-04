/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Colors, ThemeColors } from '@/constants/Themes';
import { useColorScheme } from './useColorScheme';

export type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

/**
 * Hook to get a color value that adapts to the current color scheme.
 *
 * @param props - Optional override colors for light/dark modes
 * @param colorName - The semantic color name from the theme (e.g., 'text', 'background', 'buttonBackground')
 * @returns The resolved color string for the current color scheme
 *
 * @example
 * // Basic usage - get a theme color
 * const textColor = useThemeColor({}, 'text');
 *
 * @example
 * // With overrides - use custom colors instead of theme defaults
 * const customBg = useThemeColor({ light: '#fff', dark: '#000' }, 'background');
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeColors
) {
  const colorScheme = useColorScheme() ?? 'light';
  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[colorScheme][colorName];
  }
}

