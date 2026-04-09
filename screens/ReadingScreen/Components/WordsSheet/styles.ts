import { StyleSheet } from 'react-native'
import { spacing, typography } from '@/constants/Themes'

export const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    backgroundColor: 'transparent',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: 'transparent',
  },
  sheetHeaderCenter: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  sheetHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'transparent',
  },
  sheetLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  sheetValue: {
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
  },
  sheetEditActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: 'transparent',
  },
  feedTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  feedEmpty: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  sheetPartOfSpeech: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginBottom: spacing.sm,
  },
  exampleText: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic' as const,
    marginTop: spacing.xs,
  },
  exampleTranslation: {
    fontSize: typography.sizes.sm,
    marginLeft: spacing.md,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
  },
})
