
import { ThemeProps, useThemeColor } from '@/hooks/useThemeColor';
import { Button as DefaultButton, ButtonProps as DefaultButtonProps } from '@rneui/themed';
import { ReactNode } from 'react';

export type ButtonProps = ThemeProps & DefaultButtonProps;

export function Button(props: ButtonProps) {
  const { lightColor, darkColor, buttonStyle, children, ...otherProps } = props;
  const tint = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');

  return (
    <DefaultButton buttonStyle={[{ backgroundColor: tint }, buttonStyle]} {...otherProps}>
      {children as ReactNode}
    </DefaultButton>
  );
}
