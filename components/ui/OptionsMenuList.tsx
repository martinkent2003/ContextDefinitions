import * as React from 'react'
import { Dimensions, Platform, Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { Icon } from '@/components/ui/Icon'
import { OptionsMenuButton } from '@/components/ui/OptionsMenuButton'
import { radii, shadows } from '@/constants/Themes'
import { useHome } from '@/hooks/useHome'
import { useThemeColor } from '@/hooks/useThemeColor'
import type { FeedSortOrder } from '@/types/readings'

let createPortal:
  | ((children: React.ReactNode, container: Element) => React.ReactPortal)
  | null = null
if (Platform.OS === 'web') {
  try {
    createPortal = require('react-dom').createPortal
  } catch {}
}

const OPTIONS: {
  iconName: string
  label: string
  sortValue: FeedSortOrder
  index: number
}[] = [
  { iconName: 'time-outline', label: 'Recent', sortValue: 'recent', index: 0 },
  { iconName: 'school-outline', label: 'Easiest', sortValue: 'easiest', index: 1 },
  { iconName: 'trending-up-outline', label: 'Hardest', sortValue: 'hardest', index: 2 },
  { iconName: 'heart-outline', label: 'Interests', sortValue: 'interests', index: 3 },
]

export function OptionsMenuList() {
  const { feedSortOrder, setFeedSortOrder } = useHome()
  const [isExpanded, setIsExpanded] = React.useState(false)
  const bg = useThemeColor({}, 'cardBackground')
  const borderColor = useThemeColor({}, 'border')
  const iconColor = useThemeColor({}, 'text')
  const rotation = useSharedValue(0)
  const backdropOpacity = useSharedValue(0)
  const toggleRef = React.useRef<View>(null)
  const [anchorPos, setAnchorPos] = React.useState({ top: 0, right: 0 })
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
      zIndex: '99999',
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

  const close = React.useCallback(() => setIsExpanded(false), [])

  const handleToggle = React.useCallback(() => {
    if (Platform.OS === 'web') {
      toggleRef.current?.measureInWindow((x, y, w, _h) => {
        setAnchorPos({
          top: y,
          right: Dimensions.get('window').width - x - w,
        })
        setIsExpanded((v) => !v)
      })
    } else {
      setIsExpanded((v) => !v)
    }
  }, [])

  return (
    <View style={styles.container}>
      {/* Native: render overlay inline (original behavior) */}
      {Platform.OS !== 'web' && (
        <>
          <Animated.View
            style={[styles.backdrop, backdropStyle]}
            pointerEvents={isExpanded ? 'auto' : 'none'}
          >
            <Pressable
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              onPress={close}
            />
          </Animated.View>
          {OPTIONS.map((opt) => (
            <OptionsMenuButton
              key={opt.iconName}
              iconName={opt.iconName}
              label={opt.label}
              isExpanded={isExpanded}
              index={opt.index}
              isActive={feedSortOrder === opt.sortValue}
              onPress={() => {
                setFeedSortOrder(opt.sortValue)
                close()
              }}
            />
          ))}
        </>
      )}
      {/* Web: render overlay via portal to escape overflow clipping */}
      {Platform.OS === 'web' &&
        createPortal &&
        portalContainer &&
        createPortal(
          <>
            <Animated.View
              style={[styles.webBackdrop, backdropStyle]}
              pointerEvents={isExpanded ? 'auto' : 'none'}
            >
              <Pressable style={StyleSheet.absoluteFill} onPress={close} />
            </Animated.View>
            <View
              style={[
                styles.webMenuAnchor,
                { top: anchorPos.top, right: anchorPos.right },
              ]}
              pointerEvents="box-none"
            >
              {OPTIONS.map((opt) => (
                <OptionsMenuButton
                  key={opt.iconName}
                  iconName={opt.iconName}
                  label={opt.label}
                  isExpanded={isExpanded}
                  index={opt.index}
                  isActive={feedSortOrder === opt.sortValue}
                  onPress={() => {
                    setFeedSortOrder(opt.sortValue)
                    close()
                  }}
                />
              ))}
            </View>
          </>,
          portalContainer,
        )}
      <Pressable
        ref={toggleRef}
        onPress={handleToggle}
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
    width: 44,
    height: 44,
    overflow: 'visible',
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
