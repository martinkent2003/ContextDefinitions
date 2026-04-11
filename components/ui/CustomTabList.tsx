import { useSegments } from 'expo-router'
import { TabTrigger } from 'expo-router/ui'
import * as React from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { CustomTabButton } from '@/components/ui/CustomTabButton'
import { ToggleMenuButton } from '@/components/ui/ToggleMenuButton'
import { spacing } from '@/constants/Themes'
import { useFullscreenModal } from '@/hooks/useFullscreenModal'

let createPortal:
  | ((children: React.ReactNode, container: Element) => React.ReactPortal)
  | null = null
if (Platform.OS === 'web') {
  try {
    createPortal = require('react-dom').createPortal
  } catch {}
}

const TABS = [
  { name: 'library', iconName: 'folder', label: 'Library', index: 0 },
  { name: 'create', iconName: 'plus', label: 'Create', index: 1 },
  { name: 'home', iconName: 'home', label: 'Home', index: 2 },
  { name: 'profile', iconName: 'user', label: 'Profile', index: 3 },
] as const

export function CustomTabList() {
  const segments = useSegments()
  const isOnTabsScreen = segments.includes('(tabs)' as never)
  const { isFullscreenModalOpen } = useFullscreenModal()

  const [isExpanded, setIsExpanded] = React.useState(false)
  const backdropOpacity = useSharedValue(0)
  const [portalContainer, setPortalContainer] = React.useState<HTMLDivElement | null>(
    null,
  )

  // Web only: fixed overlay container on document.body.
  // Kept at pointer-events: none so the container itself never blocks app interactions.
  // CSS pointer-events: none on a parent does NOT block descendants — each child
  // manages its own pointer events independently.
  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return
    const el = document.createElement('div')
    Object.assign(el.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '9999',
      pointerEvents: 'none',
    })
    document.body.appendChild(el)
    setPortalContainer(el)
    return () => {
      document.body.removeChild(el)
      setPortalContainer(null)
    }
  }, [])

  React.useEffect(() => {
    backdropOpacity.value = withSpring(isExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 200,
    })
  }, [isExpanded, backdropOpacity])

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const close = React.useCallback(() => setIsExpanded(false), [])

  if (Platform.OS === 'web' && (!isOnTabsScreen || isFullscreenModalOpen)) return null

  const tabs = TABS.map((tab) => (
    <TabTrigger key={tab.name} name={tab.name} asChild>
      <CustomTabButton
        iconName={tab.iconName}
        label={tab.label}
        isExpanded={isExpanded}
        index={tab.index}
      />
    </TabTrigger>
  ))

  const toggle = (
    <ToggleMenuButton isExpanded={isExpanded} onPress={() => setIsExpanded((v) => !v)} />
  )

  // Native: render everything inline (original behavior)
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[styles.backdrop, backdropStyle]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
        >
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={close}
          />
        </Animated.View>
        {tabs}
        {toggle}
      </View>
    )
  }

  // Web: portal everything to document.body.
  // - Backdrop: fills viewport, only captures events when expanded
  // - webMenuAnchor: always interactive (toggle always clickable), buttons animate
  // - React portals preserve context so TabTrigger still has access to Tabs context
  return (
    <>
      {createPortal &&
        portalContainer &&
        createPortal(
          <>
            <View
              style={StyleSheet.absoluteFill}
              pointerEvents={isExpanded ? 'auto' : 'none'}
            >
              <Animated.View style={[styles.webBackdrop, backdropStyle]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={close} />
              </Animated.View>
            </View>
            <View style={styles.webMenuAnchor} pointerEvents="box-none">
              {tabs}
              {toggle}
            </View>
          </>,
          portalContainer,
        )}
    </>
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
  webBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  webMenuAnchor: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
})
