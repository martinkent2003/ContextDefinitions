import * as Haptics from 'expo-haptics'
import { View, Text, IconButton } from '@/components/ui'
import { typography } from '@/constants/Themes'
import { useLoading } from '@/hooks/useLoading'
import { useThemeColor } from '@/hooks/useThemeColor'
import { styles } from '@/screens/ReadingScreen/styles'

type FontSize = (typeof typography.sizes)[keyof typeof typography.sizes]
const FONT_SIZES = Object.values(typography.sizes).sort((a, b) => a - b) as FontSize[]

interface FontSizeControlProps {
  fontSize: number
  setFontSize: (size: number) => void
}

export default function FontSizeControl({ fontSize, setFontSize }: FontSizeControlProps) {
  const textColor = useThemeColor({}, 'text')
  const { showLoading } = useLoading()

  const fontSizeIdx = FONT_SIZES.indexOf(fontSize as FontSize)
  const canDecrease = fontSizeIdx > 0
  const canIncrease = fontSizeIdx < FONT_SIZES.length - 1

  return (
    <View style={styles.footerFontSizeGroup}>
      <IconButton
        icon={{ library: 'Ionicons', name: 'remove-outline', size: 24 }}
        onPress={() => {
          showLoading()
          setFontSize(FONT_SIZES[fontSizeIdx - 1])
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }}
        disabled={!canDecrease}
        style={[styles.footerButton, !canDecrease && styles.footerButtonDisabled]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />

      <Text style={[styles.footerFontSizeLabel, { color: textColor }]}>aA</Text>

      <IconButton
        icon={{ library: 'Ionicons', name: 'add-outline', size: 24 }}
        onPress={() => {
          showLoading()
          setFontSize(FONT_SIZES[fontSizeIdx + 1])
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }}
        disabled={!canIncrease}
        style={[styles.footerButton, !canIncrease && styles.footerButtonDisabled]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />
    </View>
  )
}
