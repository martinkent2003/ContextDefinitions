import { radii, spacing, typography } from "@/constants/Themes";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    // Screen
  screen: {
    flex: 1,
  },
  pressable: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
    
    //  borderColor: "#FFFFFF",
    //  borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
    //  borderColor: "#FFFFFF",
    //  borderWidth: 1,
  },
  segmentedControl: {
    marginTop: spacing.md,
    marginHorizontal: spacing.xxl,
    
    //  borderColor: "#FFFFFF",
    //  borderWidth: 1,
  },
  searchBar: {
    flex: 1,
    marginRight: spacing.xxl,
    //  borderColor: "#FFFFFF",
    //  borderWidth: 1,
  },
  userIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    //  borderColor: "#FFFFFF",
    //  borderWidth: 1,
  },
  userIconText: {
    fontSize: typography.sizes.xs,
  },
  feed: {
    marginTop:spacing.xs,
    gap: spacing.sm,
    // borderColor: "#FFFFFF",
    // borderWidth: 1,
  },
});
