import * as React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { Icon } from '@/components/ui/Icon'
import { OptionsMenuButton } from '@/components/ui/OptionsMenuButton'
import { radii, shadows } from '@/constants/Themes'
import { useThemeColor } from '@/hooks/useThemeColor'

const OPTIONS = [
  { iconName: 'time-outline', label: 'Recent', index: 0 },
  { iconName: 'school-outline', label: 'Level', index: 1 },
  { iconName: 'heart-outline', label: 'Interests', index: 2 },
] as const

export function OptionsMenuList() {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const bg = useThemeColor({}, 'cardBackground')
  const borderColor = useThemeColor({}, 'border')
  const iconColor = useThemeColor({}, 'text')
  const rotation = useSharedValue(0)
  const backdropOpacity = useSharedValue(0)

  React.useEffect(() => {
    rotation.value = withSpring(isExpanded ? 180 : 0, {
      damping: 12,
      stiffness: 100,
      mass: 0.6,
      velocity: 20,
    })
    backdropOpacity.value = withSpring(isExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 200,
    })
  }, [isExpanded, rotation, backdropOpacity])

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents={isExpanded ? 'auto' : 'none'}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={() => setIsExpanded(false)}
        />
      </Animated.View>
      {OPTIONS.map((opt) => (
        <OptionsMenuButton
          key={opt.iconName}
          iconName={opt.iconName}
          label={opt.label}
          isExpanded={isExpanded}
          index={opt.index}
          onPress={() => setIsExpanded(false)}
        />
      ))}
      <Pressable
        onPress={() => setIsExpanded((v) => !v)}
        style={[styles.toggleButton, { backgroundColor: bg, borderColor }, shadows.md]}
      >
        <Animated.View style={rotationStyle}>
          <Icon library="Ionicons" name="options-outline" size={22} color={iconColor} />
        </Animated.View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    overflow: 'visible',
    borderRadius: radii.lg,
    zIndex: 100,
    elevation: 10,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: -500,
    width: 1000,
    height: 1500,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 5,
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 20,
  },
})
