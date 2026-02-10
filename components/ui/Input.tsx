import { radii, spacing } from "@/constants/Themes";
import { ThemeProps, useThemeColor } from "@/hooks/useThemeColor";
import {
  Input as DefaultInput,
  InputProps as DefaultInputProps,
} from "@rneui/themed";

export type InputProps = ThemeProps & DefaultInputProps;

export function Input(props: InputProps) {
  const {
    lightColor,
    darkColor,
    inputStyle,
    labelStyle,
    inputContainerStyle,
    placeholderTextColor,
    ...otherProps
  } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const labelColor = useThemeColor({}, "textSecondary");
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "backgroundSecondary");
  const placeholderColor = useThemeColor({}, "textTertiary");

  return (
    <DefaultInput
      placeholderTextColor={placeholderTextColor ?? placeholderColor}
      inputStyle={[{ color }, inputStyle]}
      labelStyle={[{ color: labelColor }, labelStyle]}
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
