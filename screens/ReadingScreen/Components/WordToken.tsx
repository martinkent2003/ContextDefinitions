import type { LayoutRectangle } from 'react-native'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Text } from '@/components/ui'
import { radii, spacing, typography } from '@/constants/Themes'
import { useThemeColor } from '@/hooks/useThemeColor'

type TokenKind = 'word' | 'number' | 'punct' | 'symbol' | 'other'

type WordTokenProps = {
  token: {
    i: number
    surface: string
    kind: TokenKind
  }
  addLeadingSpace: boolean
  isHighlighted: boolean
  fontSize: number
  onLayout: (layout: LayoutRectangle) => void
}

const SPRING = { mass: 0.5, stiffness: 150, damping: 15 }

export default function WordToken({
  token,
  addLeadingSpace,
  isHighlighted,
  fontSize,
  onLayout,
}: WordTokenProps) {
  const textColor = useThemeColor({}, 'text')
  const tintColor = useThemeColor({}, 'tint')

  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable
      onLayout={(e) => onLayout(e.nativeEvent.layout)}
      onHoverIn={() => {
        scale.value = withSpring(1.05, SPRING)
      }}
      onHoverOut={() => {
        scale.value = withSpring(1, SPRING)
      }}
    >
      <Animated.View style={animatedStyle}>
        <Text
          style={[
            styles.token,
            { color: textColor, fontSize },
            addLeadingSpace && styles.leadingSpace,
            isHighlighted && { backgroundColor: tintColor + '44' },
          ]}
        >
          {token.surface}
        </Text>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  token: {
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    borderRadius: radii.xs,
  },
  leadingSpace: {
    marginLeft: spacing.xs,
  },
})
