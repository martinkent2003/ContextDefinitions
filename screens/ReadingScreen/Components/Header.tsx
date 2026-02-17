import { StyleSheet } from "react-native";
import { View, Text, BackButton } from "@/components/ui";
import { useThemeColor } from "@/hooks/useThemeColor";
import { spacing, typography } from "@/constants/Themes";

type HeaderProps = {
  title: string;
  onBack: () => void;
};

export default function Header({ title, onBack }: HeaderProps) {
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.header}>
      <BackButton onPress={onBack} style={styles.backButton} />
      <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    flex: 1,
  },
});
