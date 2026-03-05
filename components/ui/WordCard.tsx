import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { Text } from "@/components/ui";
import { useThemeColor } from "@/hooks/useThemeColor";
import { radii, spacing, typography } from "@/constants/Themes";

export type WordCardProps = Omit<TouchableOpacityProps, "children"> & {
  text: string;
  definition: string;
};

export function WordCard({
  text,
  definition,
  style,
  ...otherProps
}: WordCardProps) {
  const cardBackground = useThemeColor({}, "cardBackground");
  const cardBorder = useThemeColor({}, "cardBorder");
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.container,
        { backgroundColor: cardBackground, borderColor: cardBorder },
        style,
      ]}
      {...otherProps}
    >
      <Text style={[styles.word, { color: textColor }]}>{text}</Text>
      {definition ? (
        <Text
          style={[styles.definition, { color: textSecondary }]}
          numberOfLines={2}
        >
          {definition}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  word: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  definition: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
});
