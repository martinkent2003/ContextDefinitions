import { radii, spacing, typography } from "@/constants/Themes";
import { ThemeProps, useThemeColor } from "@/hooks/useThemeColor";
import {
  TextInput as DefaultInput,
  TextInputProps as DefaultInputProps,
} from "react-native";

export type TextAreaProps = ThemeProps &
  DefaultInputProps & {
    minHeight?: number;
  };

export function TextArea(props: TextAreaProps) {
  const {
    lightColor,
    darkColor,
    style,
    placeholderTextColor,
    minHeight = 300,
    ...otherProps
  } = props;

  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const borderColor = useThemeColor({}, "border");
  const placeholderColor = useThemeColor({}, "textTertiary");
  const backgroundColor = useThemeColor({}, "backgroundSecondary");

  return (
    <DefaultInput
      multiline
      textAlignVertical="top"
      placeholderTextColor={placeholderTextColor ?? placeholderColor}
      style={[
        {
          minHeight,
          padding: spacing.sm,
          marginHorizontal: spacing.sm,
          borderColor: borderColor,
          borderWidth: 1,
          borderRadius: radii.lg,
          fontSize: typography.sizes.md,
          backgroundColor: backgroundColor,
          color: color,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
