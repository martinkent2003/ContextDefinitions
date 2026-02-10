import { radii, spacing, typography } from "@/constants/Themes";
import { ThemeProps, useThemeColor } from "@/hooks/useThemeColor";
import { TextInput as DefaultInput, TextInputProps as DefaultInputProps } from "react-native";

export type TextAreaProps = ThemeProps & DefaultInputProps;

export function TextArea(props: TextAreaProps) {
    const {
        lightColor,
        darkColor,
        style,
        placeholderTextColor,
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
                    flex: 1,
                    minHeight: 300,
                    padding: spacing.sm,
                    margin: spacing.sm,
                    borderColor: borderColor,
                    borderWidth: 2,
                    borderRadius: radii.md,
                    fontSize: typography.sizes.md,
                    paddingHorizontal:spacing.sm,
                    backgroundColor: backgroundColor,
                    color: color
                },
                style,
            ]}
            {...otherProps}
        />
    );
}
