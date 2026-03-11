import { View } from '@/components/ui'
import { useReading } from '@/hooks/useReading'
import { useThemeColor } from '@/hooks/useThemeColor'
import { styles } from '@/screens/ReadingScreen/styles'
import FontSizeControl from './components/FontSizeControl'
import OpenWordSheet from './components/OpenWordSheet'
import PageNavigation from './components/PageNavigation'

export default function Footer() {
  const { currentPage, setCurrentPage, totalPages, fontSize, setFontSize } = useReading()
  const borderColor = useThemeColor({}, 'border')

  return (
    <View style={[styles.footer, { borderColor }]}>
      <FontSizeControl fontSize={fontSize} setFontSize={setFontSize} />
      <PageNavigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
      <OpenWordSheet></OpenWordSheet>
    </View>
  )
}
