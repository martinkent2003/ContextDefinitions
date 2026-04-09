import { StyleSheet } from 'react-native'
import { spacing, typography } from '@/constants/Themes'

export const styles = StyleSheet.create({
  // Shared form container
  container: {
    backgroundColor: 'transparent',
    marginTop: 100,
    marginBottom: 50,
    padding: spacing.md,
  },

  // Field spacing
  verticallySpaced: {
    backgroundColor: 'transparent',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  mt20: {
    marginTop: spacing.lg,
  },

  // Inline validation error
  errorText: {
    color: '#ef4444',
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },

  // API / form-level error
  formError: {
    color: '#ef4444',
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  // Info / helper text
  infoText: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // Screen title (for metadata/verify screens)
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },

  // Screen subtitle
  subtitle: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
})
