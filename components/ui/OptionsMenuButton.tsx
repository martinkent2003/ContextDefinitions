import * as React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { Icon } from '@/components/ui/Icon'
import { radii, spacing, typography } from '@/constants/Themes'
import { useThemeColor } from '@/hooks/useThemeColor'

export interface OptionsMenuButtonProps {
  iconName: string
  label: string
  isExpanded: boolean
  index: number
  onPress: () => void
}

export function OptionsMenuButton({
  iconName,
  label,
  isExpanded,
  index,
  onPress,
}: OptionsMenuButtonProps) {
  const cardBg = useThemeColor({}, 'cardBackground')
  const borderColor = useThemeColor({}, 'border')
  const iconColor = useThemeColor({}, 'text')
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(1)
  const SPRING = { mass: 0.5, stiffness: 150, damping: 15 }

  React.useEffect(() => {
    if (isExpanded) {
      translateY.value = withSpring(70 * index + 70)
      opacity.value = withSpring(1)
    } else {
      translateY.value = withSpring(0)
      opacity.value = withSpring(0)
    }
  }, [isExpanded, index, translateY, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10 - index,
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => {
          scale.value = withSpring(1.1, SPRING)
        }}
        onHoverOut={() => {
          scale.value = withSpring(1, SPRING)
        }}
        onPressIn={() => {
          scale.value = withSpring(0.9, SPRING)
        }}
        onPressOut={() => {
          scale.value = withSpring(1, SPRING)
        }}
        style={styles.container}
      >
        <View style={[styles.iconBox, { borderColor, backgroundColor: cardBg }]}>
          <Icon library="Ionicons" name={iconName as any} size={20} color={iconColor} />
        </View>
        <Text style={[styles.label, { color: iconColor }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBox: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
})
