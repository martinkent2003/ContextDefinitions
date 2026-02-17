import { radii, spacing, typography } from "@constants/Themes";
import { ThemeProps, useThemeColor } from "@hooks/useThemeColor";
import {
  Input as DefaultInput,
  InputProps as DefaultInputProps,
} from "@rneui/themed";

type InputSize = 'sm' | 'md' | 'lg';

const sizeStyles = {
  sm: {
    height: 36,
    paddingHorizontal: spacing.xs,
    fontSize: typography.sizes.sm,
    borderRadius: radii.lg,
  },
  md: {
    height: 44,
    paddingHorizontal: spacing.sm,
    fontSize: typography.sizes.md,
    borderRadius: radii.lg,
  },
  lg: {
    height: 52,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.lg,
    borderRadius: radii.lg,
  },
};

export type InputProps = ThemeProps & DefaultInputProps & {
  size?: InputSize;
};

export function Input(props: InputProps) {
  const {
    lightColor,
    darkColor,
    size = 'md',
    style,
    inputStyle,
    labelStyle,
    containerStyle,
    inputContainerStyle,
    placeholderTextColor,
    ...otherProps
  } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const labelColor = useThemeColor({}, "textSecondary");
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "backgroundSecondary");
  const placeholderColor = useThemeColor({}, "textTertiary");

  const currentSize = sizeStyles[size];

  return (
    <DefaultInput
      placeholderTextColor={placeholderTextColor ?? placeholderColor}
      inputStyle={[{ color, fontSize: currentSize.fontSize }, inputStyle]}
      labelStyle={[{ color: labelColor }, labelStyle]}
      containerStyle={containerStyle}
      inputContainerStyle={[
        {
          borderWidth: 1,
          borderColor: borderColor,
          borderRadius: currentSize.borderRadius,
          backgroundColor: backgroundColor,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderBottomWidth: 2,
          height: currentSize.height,
          
        },
        inputContainerStyle,
      ]}
      errorStyle={{ height: 0, margin: 0 }}
      {...otherProps}
    />
  );
}
