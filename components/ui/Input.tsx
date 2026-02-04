import { radii, spacing, typography } from '@/constants/Themes';
import { ThemeProps, useThemeColor } from '@/hooks/useThemeColor';
import { Input as DefaultInput, InputProps as DefaultInputProps } from '@rneui/themed';

export type InputProps = ThemeProps & DefaultInputProps;

export function Input(props: InputProps) {
  const { lightColor, darkColor, inputStyle, labelStyle, inputContainerStyle, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const labelColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');

  return (
    <DefaultInput
      inputStyle={[{ color, fontFamily: typography.fonts.excalifont }, inputStyle]}
      labelStyle={[{ fontFamily: typography.fonts.excalifont, color: labelColor }, labelStyle]}
      inputContainerStyle={[
        {
          borderWidth: 2,
          borderColor: borderColor,
          borderRadius: radii.md,
          backgroundColor: backgroundColor,
          paddingHorizontal: spacing.sm,
          borderBottomWidth: 1,
        },
        inputContainerStyle,
      ]}
      {...otherProps}
    />
  );
}
