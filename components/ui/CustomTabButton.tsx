import type { FontAwesome } from '@expo/vector-icons'
import type { TabTriggerSlotProps } from 'expo-router/ui'
import * as React from 'react'
import type { ComponentProps } from 'react'
import type { View } from 'react-native'
import { Pressable, StyleSheet, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { Icon } from '@/components/ui/Icon'
import { radii, shadows, spacing, typography } from '@/constants/Themes'
import { useThemeColor } from '@/hooks/useThemeColor'

export interface CustomTabButtonProps
  extends React.PropsWithChildren, TabTriggerSlotProps {
  iconName: ComponentProps<typeof FontAwesome>['name']
  label: string
  isExpanded: boolean
  index: number
}

export const CustomTabButton = React.forwardRef<View, CustomTabButtonProps>(
  (
    { iconName, label, isFocused, isExpanded, index, children: _children, ...props },
    ref,
  ) => {
    const activeColor = useThemeColor({}, 'textInverse')
    const inactiveColor = useThemeColor({}, 'text')
    const cardBg = useThemeColor({}, 'cardBackground')
    const tint = useThemeColor({}, 'tint')

    const color = isFocused ? activeColor : inactiveColor
    const buttonBg = isFocused ? tint : cardBg

    const translateY = useSharedValue(0)
    const opacity = useSharedValue(0)
    const scale = useSharedValue(1)

    React.useEffect(() => {
      if (isExpanded) {
        translateY.value = withSpring(-80 * index - 80)
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
      bottom: 0,
      zIndex: index,
    }))

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          ref={ref}
          {...props}
          onHoverIn={() => {
            scale.value = withSpring(1.1, { mass: 0.5, stiffness: 150 })
          }}
          onHoverOut={() => {
            scale.value = withSpring(1, { mass: 0.5, stiffness: 150 })
          }}
          onPressIn={() => {
            scale.value = withSpring(0.9, { mass: 0.5, stiffness: 150 })
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { mass: 0.5, stiffness: 150 })
          }}
          style={[styles.button, { backgroundColor: buttonBg }, shadows.md]}
        >
          <Icon library="FontAwesome" name={iconName} size={22} color={color} />
          <Text style={[styles.label, { color }]}>{label}</Text>
        </Pressable>
      </Animated.View>
    )
  },
)

CustomTabButton.displayName = 'CustomTabButton'

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    opacity: 0.9,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
})
