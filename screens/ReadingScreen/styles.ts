import { StyleSheet } from 'react-native'
import { spacing, typography } from '@/constants/Themes'

export const styles = StyleSheet.create({
  readingScreen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    flex: 1,
    marginRight: spacing.xs,
  },
  //reading content
  readingContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
    // borderColor: "#FFFFFF",
    // borderWidth: 1,
    overflow: 'hidden',
  },

  //token
  tokenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  //footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  footerButton: {
    padding: spacing.xs,
  },
  footerButtonDisabled: {
    opacity: 0.3,
  },
  footerFontSizeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  footerFontSizeLabel: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.semibold,
    marginHorizontal: spacing.xs,
  },
  footerPaginationGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerPageLabel: {
    textAlign: 'center',
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.medium,
    padding: spacing.sm,
  },

  //wordsheetwrapper
  absoluteFillObject: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})
