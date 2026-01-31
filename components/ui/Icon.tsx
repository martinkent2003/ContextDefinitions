import { ThemeProps, useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome } from '@expo/vector-icons';
import { ComponentProps } from 'react';

export type IconProps = ThemeProps & Omit<ComponentProps<typeof FontAwesome>, 'color'> & {
  color?: string;
};

export function Icon(props: IconProps) {
  const { lightColor, darkColor, color, ...otherProps } = props;
  const themeColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <FontAwesome color={color ?? themeColor} {...otherProps} />;
}
