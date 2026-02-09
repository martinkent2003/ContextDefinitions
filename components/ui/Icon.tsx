import { ThemeProps, useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

type FontAwesomeIconProps = ThemeProps & Omit<ComponentProps<typeof FontAwesome>, 'color'> & {
  library: 'FontAwesome';
  color?: string;
};

type IoniconsIconProps = ThemeProps & Omit<ComponentProps<typeof Ionicons>, 'color'> & {
  library: 'Ionicons';
  color?: string;
};

export type IconProps = FontAwesomeIconProps | IoniconsIconProps;

export function Icon(props: IconProps) {
  const { lightColor, darkColor, color, library, ...otherProps } = props;
  const themeColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const resolvedColor = color ?? themeColor;

  if (library === 'Ionicons') {
    return <Ionicons color={resolvedColor} {...otherProps as Omit<ComponentProps<typeof Ionicons>, 'color'>} />;
  }

  return <FontAwesome color={resolvedColor} {...otherProps as Omit<ComponentProps<typeof FontAwesome>, 'color'>} />;
}
