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
    //  borderColor: "#FFFFFF",
    //  borderWidth: 1,
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
    paddingBottom: spacing.xxxl,
    // borderColor: "#FFFFFF",
    // borderWidth: 1,
    overflow: "hidden"
  },
  //footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },  
  footerButton: {
    padding: spacing.xs,
  },
  footerButtonDisabled: {
    opacity: 0.3,
  },
  footerFontSizeGroup: {
    flex:1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  footerFontSizeLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginHorizontal: spacing.xs,
  },
  footerPaginationGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  footerPageLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: typography.sizes.md,
    fontWeight: "600",
  },

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
