import { StyleSheet } from 'react-native'
import { radii, spacing, typography } from '@/constants/Themes'

export const styles = StyleSheet.create({
  // Screen
  screen: {
    flex: 1,
    overflow: 'visible',
    // borderColor: "#FFFFFF",
    // borderWidth: 1,
  },
  pressable: {
    flex: 1,
    paddingHorizontal: spacing.md,
    overflow: 'visible',
    //  borderColor: "#FFFFFF",
    //  borderWidth: 1,
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
    marginTop: spacing.xs,
    gap: spacing.xs,
    overflow: 'visible',
    // borderColor: "#FFFFFF",
    // borderWidth: 1,
  },
})
