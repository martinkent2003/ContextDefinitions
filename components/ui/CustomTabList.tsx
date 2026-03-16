import { TabTrigger } from 'expo-router/ui'
import * as React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { CustomTabButton } from '@/components/ui/CustomTabButton'
import { ToggleMenuButton } from '@/components/ui/ToggleMenuButton'
import { spacing } from '@/constants/Themes'

const TABS = [
  { name: 'library', iconName: 'folder', label: 'Library', index: 0 },
  { name: 'create', iconName: 'plus', label: 'Create', index: 1 },
  { name: 'home', iconName: 'home', label: 'Home', index: 2 },
  { name: 'profile', iconName: 'user', label: 'Profile', index: 3 },
] as const

export function CustomTabList() {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const backdropOpacity = useSharedValue(0)

  React.useEffect(() => {
    backdropOpacity.value = withSpring(isExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 200,
    })
  }, [isExpanded, backdropOpacity])

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
      {TABS.map((tab) => (
        <TabTrigger key={tab.name} name={tab.name} asChild>
          <CustomTabButton
            iconName={tab.iconName}
            label={tab.label}
            isExpanded={isExpanded}
            index={tab.index}
          />
        </TabTrigger>
      ))}
      <ToggleMenuButton
        isExpanded={isExpanded}
        onPress={() => setIsExpanded((v) => !v)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    zIndex: 100,
    elevation: 10,
  },
  backdrop: {
    position: 'absolute',
    bottom: -spacing.xl,
    right: -spacing.xl,
    width: 1000,
    height: 1500,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: -1,
  },
})
