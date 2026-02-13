import { spacing } from "@/constants/Themes";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    // Screen
  screen: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    //borderColor: "#FFFFFF",
    //borderWidth: 1,
  },
  header: {
    alignItems: 'flex-end',
    paddingRight: spacing.md,
  },
  feed: {
    marginTop:spacing.md,
    gap: spacing.sm,
    //borderColor: "#FFFFFF",
    //borderWidth: 1,
  },
});
