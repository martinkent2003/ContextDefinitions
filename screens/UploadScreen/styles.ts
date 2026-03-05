import { StyleSheet } from 'react-native'
import { radii, spacing, typography } from '@/constants/Themes'

export const styles = StyleSheet.create({
  // Screen
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    marginTop: spacing.xl,
    gap: spacing.md,
    backgroundColor: 'transparent',
  },
  headerRoot: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  headerWrapper: {
    flex: 1 / 3, // top third of the screen
    justifyContent: 'center', // center header within that third
  },
  backButton: {
    position: 'absolute',
    width: radii.xxl,
    height: radii.xxl,
    borderRadius: radii.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
  },
  headerIcon: {
    marginTop: spacing.md,
  },

  // Upload buttons
  uploadButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  uploadButtonIcon: {
    marginRight: 12,
  },
  uploadButtonLabel: {
    fontSize: typography.sizes.xl,
  },

  // Help link
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 'auto',
  },
  container: {
    flex: 1,
    padding: spacing.xs,
  },
})
