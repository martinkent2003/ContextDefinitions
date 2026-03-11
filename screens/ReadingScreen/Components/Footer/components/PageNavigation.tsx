import * as Haptics from 'expo-haptics'
import { View, Text, IconButton } from '@/components/ui'
import { useThemeColor } from '@/hooks/useThemeColor'
import { styles } from '@/screens/ReadingScreen/styles'

interface PageNavigationProps {
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
}

export default function PageNavigation({
  currentPage,
  setCurrentPage,
  totalPages,
}: PageNavigationProps) {
  const textColor = useThemeColor({}, 'text')

  const isFirst = currentPage === 0
  const isLast = currentPage >= totalPages - 1

  return (
    <View style={styles.footerPaginationGroup}>
      <IconButton
        icon={{ library: 'Ionicons', name: 'chevron-back-outline', size: 24 }}
        onPress={() => {
          setCurrentPage(currentPage - 1)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }}
        disabled={isFirst}
        style={[styles.footerButton, isFirst && styles.footerButtonDisabled]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />

      <Text style={[styles.footerPageLabel, { color: textColor }]}>
        {totalPages === 0 ? '—' : `${currentPage + 1} / ${totalPages}`}
      </Text>

      <IconButton
        icon={{ library: 'Ionicons', name: 'chevron-forward-outline', size: 24 }}
        onPress={() => {
          setCurrentPage(currentPage + 1)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }}
        disabled={isLast}
        style={[styles.footerButton, isLast && styles.footerButtonDisabled]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      />
    </View>
  )
}
