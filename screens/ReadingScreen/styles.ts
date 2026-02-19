import { spacing, typography } from "@/constants/Themes";
import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
  readingScreen: {
    flex: 1,
  },  
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  //header
  backButton: {
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    flex: 1,
  },
  //reading content
  readingContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    //  borderColor: "#FFFFFF",
    //  borderWidth: 1,
  },
  //footer
  //wordsheetwrapper
  absoluteFillObject : {
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0 
  },
  //wordsSheet
    sheetContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    backgroundColor: 'transparent'
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
