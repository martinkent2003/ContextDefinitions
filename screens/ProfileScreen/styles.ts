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
    width: 96,
    height: 96,
    borderRadius: radii.full,
  },
  avatarWrapper: {
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  avatarInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  username: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
  },
  editButton: {
    paddingLeft: 0,
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
  inputRow: {
    gap: spacing.xs,
  },
  editActions: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  signOut: {
    marginTop: spacing.xl,
  },
})
