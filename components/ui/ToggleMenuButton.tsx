import * as React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { Icon } from '@/components/ui/Icon'
import { radii, shadows } from '@/constants/Themes'
import { useThemeColor } from '@/hooks/useThemeColor'

interface ToggleMenuButtonProps {
  onPress: () => void
  isExpanded: boolean
}

export function ToggleMenuButton({ onPress, isExpanded }: ToggleMenuButtonProps) {
  const bg = useThemeColor({}, 'cardBackground')
  const borderColor = useThemeColor({}, 'border')
  const iconColor = useThemeColor({}, 'text')
  const rotation = useSharedValue(0)

  React.useEffect(() => {
    rotation.value = withSpring(isExpanded ? 360 : 0, {
      damping: 12,
      stiffness: 100,
      mass: 0.6,
      velocity: 20,
    })
  }, [isExpanded, rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Pressable
      style={[
        styles.button,
        { borderColor: borderColor, backgroundColor: bg },
        shadows.md,
      ]}
      onPress={onPress}
    >
      <Animated.View style={animatedStyle}>
        <Icon
          library="FontAwesome"
          name={isExpanded ? 'times' : 'bars'}
          size={22}
          color={iconColor}
        />
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 10,
    opacity: 0.8,
  },
})
