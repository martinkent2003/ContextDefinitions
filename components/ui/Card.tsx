import * as Haptics from 'expo-haptics'
import type { PressableProps } from 'react-native'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { Icon } from '@components/ui/Icon'
import { Text } from '@components/ui/Text'
import { radii, shadows, spacing, typography } from '@constants/Themes'
import { useThemeColor } from '@hooks/useThemeColor'
import type { ThemeProps } from '@hooks/useThemeColor'

export type CardProps = ThemeProps &
  Omit<PressableProps, 'children'> & {
    title: string
    subtitle?: string
    rating?: number | string
    body?: string
    isCached?: boolean
  }

const SPRING = { mass: 0.5, stiffness: 150, damping: 15 }

export function Card(props: CardProps) {
  const {
    lightColor,
    darkColor,
    title,
    subtitle,
    rating,
    body,
    isCached,
    style,
    onPress,
    ...otherProps
  } = props

  const handlePress: PressableProps['onPress'] = (e) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress?.(e)
  }

  const cardBackground = useThemeColor({}, 'cardBackground')
  const cardBorder = useThemeColor({}, 'cardBorder')
  const textColor = useThemeColor({}, 'text')
  const textSecondary = useThemeColor({}, 'textSecondary')
  const successColor = useThemeColor({}, 'success')
  const warningColor = useThemeColor({}, 'warning')
  const errorColor = useThemeColor({}, 'error')

  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  // Determine rating color based on difficulty value
  const getRatingColor = () => {
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating
    if (numericRating === undefined || isNaN(numericRating)) return textColor

    if (numericRating >= 0 && numericRating < 35) {
      return successColor // Green for easy (0-100)
    } else if (numericRating >= 35 && numericRating < 65) {
      return warningColor // Yellow for medium (100-200)
    } else if (numericRating >= 65) {
      return errorColor // Red for hard (200-300)
    }
    return textColor // Default for out of range
  }

  return (
    <Pressable
      onHoverIn={() => {
        scale.value = withSpring(1.005, SPRING)
      }}
      onHoverOut={() => {
        scale.value = withSpring(1, SPRING)
      }}
      onPressIn={() => {
        scale.value = withSpring(0.97, SPRING)
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING)
      }}
      onPress={handlePress}
      {...otherProps}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: cardBackground,
            borderColor: cardBorder,
          },
          shadows.md,
          style,
          animatedStyle,
        ]}
      >
        {/* Header Row: Title + Rating */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: textSecondary }]}>{subtitle}</Text>
            )}
          </View>
          {rating !== undefined && (
            <Text style={[styles.rating, { color: getRatingColor() }]}>{rating}</Text>
          )}
        </View>

        {/* Body */}
        {(body || isCached) && (
          <View style={styles.bodyRow}>
            {body && (
              <Text style={[styles.body, { color: textSecondary }]} numberOfLines={3}>
                {body}
              </Text>
            )}
            {isCached && (
              <Icon
                library="Ionicons"
                name="save-outline"
                size={16}
                color={textSecondary}
                style={styles.cachedIcon}
              />
            )}
          </View>
        )}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.sm,
    paddingHorizontal: spacing.sm + spacing.xs,
    margin: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.medium,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
  },
  rating: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.medium,
  },
  body: {
    flex: 1,
    fontSize: typography.sizes.sm,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },
  cachedIcon: {
    marginLeft: spacing.xs,
  },
})
