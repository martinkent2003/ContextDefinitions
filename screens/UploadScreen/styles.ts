import { radii, spacing, typography } from "@/constants/Themes";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Screen
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  content: {
    flex: 1,
    marginTop: spacing.xl,
    gap: spacing.md
  },
  headerRoot: {
    paddingTop: spacing.xl, 
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  // Header
  header: {
    alignItems: "center",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  headerWrapper: {
    flex: 1 / 3, // top third of the screen
    justifyContent: "center", // center header within that third
  },
  backButton: {
    position: "absolute",
    width: radii.xxl,
    height: radii.xxl,
    borderRadius: radii.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  headerIcon: {
    marginTop: spacing.md,
  },

  // Upload buttons
  uploadButton: {
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  uploadButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'transparent',
  },
  uploadButtonIcon: {
    marginRight: 12,
  },
  uploadButtonLabel: {
    fontSize: typography.sizes.xl,
  },

  // TODO: Reimplement Help link
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: "auto",
  },
  
});
