import { useMemo } from "react";
import { StyleSheet } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { View, Text } from "@/components/ui";
import { useThemeColor } from "@/hooks/useThemeColor";
import { spacing, typography } from "@/constants/Themes";

export default function WordsSheet() {
  const cardBackground = useThemeColor({}, "cardBackground");
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const handleColor = useThemeColor({}, "textTertiary");

  const snapPoints = useMemo(() => ["12%", "50%", "90%"], []);

  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={0}
      enablePanDownToClose={false}
      backgroundStyle={{ backgroundColor: cardBackground }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <View style={styles.sheetContent}>
        <Text style={[styles.sheetTitle, { color: textColor }]}>
          Definitions
        </Text>
        <Text style={[styles.sheetPlaceholder, { color: textSecondary }]}>
          Context definitions will appear here.
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  sheetTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  sheetPlaceholder: {
    fontSize: typography.sizes.md,
  },
});