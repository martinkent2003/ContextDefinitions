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

  // Field row spacing
  verticallySpaced: {
    backgroundColor: 'transparent',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  mt20: {
    marginTop: spacing.lg,
  },

  // Inline field-level validation error
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

  // Inline tappable link inside a formError message
  formErrorLink: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },

  // Info / helper text (kept for existing references)
  infoText: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // Step header block (wraps screenTitle + screenSubtitle)
  screenHeader: {
    marginBottom: spacing.sm,
  },
  screenTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    textAlign: 'left',
    marginBottom: spacing.xs,
  },
  // marginBottom here is the gap between the header and the first field
  screenSubtitle: {
    fontSize: typography.sizes.md,
    textAlign: 'left',
    marginBottom: spacing.xl,
  },

  // WelcomeScreen — left-aligned, bold system font
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  welcomeTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'left',
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: typography.sizes.md,
    textAlign: 'left',
    marginBottom: spacing.xl,
  },
  welcomeButtonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  welcomeSignOutMessage: {
    color: '#ef4444',
    fontSize: typography.sizes.sm,
    textAlign: 'left',
    marginBottom: spacing.md,
  },
})
