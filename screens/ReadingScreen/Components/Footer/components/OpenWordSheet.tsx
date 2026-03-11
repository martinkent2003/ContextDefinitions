import { IconButton } from '@/components/ui'
import { useReadingWords } from '@/screens/ReadingScreen/hooks/useReadingWords'
import { styles } from '@/screens/ReadingScreen/styles'

export default function OpenWordSheet() {
  const { handleFeed } = useReadingWords()

  return (
    <IconButton
      icon={{ library: 'Ionicons', name: 'list-outline', size: 24 }}
      onPress={handleFeed}
      style={styles.footerButton}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    />
  )
}
