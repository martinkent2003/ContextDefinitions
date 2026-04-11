import { StyleSheet } from 'react-native'
import { radii, spacing, typography } from '@/constants/Themes'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
  },
  username: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  infoSection: {
    gap: spacing.md,
  },
  infoRow: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
  },
  value: {
    fontSize: typography.sizes.md,
  },
  avatarWrapper: {
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  signOut: {
    marginTop: spacing.xl,
  },
})
