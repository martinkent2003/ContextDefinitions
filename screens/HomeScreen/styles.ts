import { spacing } from "@/constants/Themes";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    // Screen
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 32,
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
  },
});
