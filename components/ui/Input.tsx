import { ThemeProps, useThemeColor } from '@/hooks/useThemeColor';
import { Input as DefaultInput, InputProps as DefaultInputProps } from '@rneui/themed';

export type InputProps = ThemeProps & DefaultInputProps;

export function Input(props: InputProps) {
  const { lightColor, darkColor, inputStyle, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultInput inputStyle={[{ color }, inputStyle]} {...otherProps} />;
}
