import { ScrollView, StyleSheet } from "react-native";
import { Text } from "@/components/ui";
import { useThemeColor } from "@/hooks/useThemeColor";
import { spacing, typography } from "@/constants/Themes";

type ReadingContentProps = {
  genre?: string;
  body?: string;
};

export default function ReadingContent({ genre, body }: ReadingContentProps) {
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");

  return (
    <ScrollView style={styles.content}>
      {genre ? (
        <Text style={[styles.genre, { color: textSecondary }]}>{genre}</Text>
      ) : null}
      <Text style={[styles.body, { color: textColor }]}>
        {body ?? "Reading content will appear here."}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  genre: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: typography.sizes.md,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
});
