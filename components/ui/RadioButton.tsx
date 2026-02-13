import { radii, spacing, theme, typography } from "@/constants/Themes";
import { ThemeProps, useThemeColor } from "@/hooks/useThemeColor";
import { Alert, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { Text } from "./Text";

export type RadioItem = {
    label: string;
    description: string;
    value: string;
    warning?: string;
};

export type RadioButtonProps = ThemeProps & {
    items: RadioItem[];
    selected?: string;
    onSelect?: (value: string) => void;
    label?: string;
    subLabel?: string;
    direction?: "row" | "column";
    containerStyle?: ViewStyle;
};

export function RadioButton(props: RadioButtonProps) {
    const {
        lightColor,
        darkColor,
        items,
        selected,
        onSelect,
        label,
        subLabel,
        direction = "column",
        containerStyle,
    } = props;

    const textColor = useThemeColor({ light: lightColor, dark: darkColor }, "text");
    const labelColor = useThemeColor({}, "textSecondary");
    const backgroundColor = useThemeColor({}, "backgroundSecondary")
    const borderColor = useThemeColor({}, "border");
    const tintColor = useThemeColor({}, "tint");
    const warningColor = useThemeColor({}, "error");

    const handleSelect = (item: RadioItem) => {
        if (item.value === selected) return;

        if (item.warning) {
            Alert.alert("Warning", item.warning, [
                { text: "Cancel", style: "cancel" },
                { text: "Confirm", style: "destructive", onPress: () => onSelect?.(item.value) },
            ]);
        } else {
            onSelect?.(item.value);
        }
    };

    return (
        <View style={[styles.wrapper , {borderColor: borderColor, backgroundColor: backgroundColor}]}>
            {label && (
                <Text style={[styles.label, { color: labelColor }]}>
                    {label}
                </Text>
            )}
            {subLabel && (
                <Text style={[styles.subLabel, { color: labelColor }]}>
                    {subLabel}
                </Text>
            )}
            <View style={[styles.group, { flexDirection: direction }, containerStyle]}>
                {items.map((item) => {
                    const isSelected = item.value === selected;
                    return (
                        <TouchableOpacity
                            key={item.value}
                            style={[styles.option, {borderColor: borderColor, backgroundColor: backgroundColor}]}
                            onPress={() => handleSelect(item)}
                        >
                            <View style={styles.textContainer}>
                                <Text style={[styles.optionText, { color: textColor }]}>
                                    {item.label}
                                </Text>
                                {item.description && (
                                    <Text style={[styles.optionDescription, { color: labelColor }]}>
                                        {item.description}
                                    </Text>
                                )}
                            </View>
                            <View
                                style={[
                                    styles.circle,
                                    {
                                        borderColor: isSelected ? (item.warning ? warningColor :tintColor) : borderColor,
                                    },
                                ]}
                            >
                                {isSelected &&  (
                                    <View
                                        style={[
                                            styles.filled,
                                            { backgroundColor: item.warning ? warningColor : tintColor },
                                        ]}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        padding: spacing.sm,
        marginHorizontal: spacing.sm,
        borderRadius: radii.md,
        borderWidth: 2
    },
    label: {
        fontSize: typography.sizes.xxl,
        marginLeft: spacing.xs,
    },
    subLabel: {
        fontSize: typography.sizes.sm,
        paddingBottom:spacing.xs,
        marginLeft: spacing.sm,
        marginBottom: spacing.sm
    },
    group: {
        gap: spacing.md,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.lg,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: radii.md,
        borderWidth: 1,
    },
    textContainer: {
        flex: 1,
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: radii.full,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    filled: {
        width: 20,
        height: 20,
        borderRadius: radii.full,
    },
    optionText: {
        fontSize: typography.sizes.lg,
    },
    optionDescription:{
        fontSize: typography.sizes.sm
    },
});
