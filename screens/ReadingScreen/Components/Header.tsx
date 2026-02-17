import { TouchableOpacity, StyleSheet } from "react-native";
import { View, Text, Icon } from "@/components/ui";
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
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon library="Ionicons" name="arrow-back" size={24} color={textColor} />
      </TouchableOpacity>
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
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    flex: 1,
  },
});
