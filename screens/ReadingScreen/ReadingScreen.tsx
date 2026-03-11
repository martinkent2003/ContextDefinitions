import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useReading } from '@/hooks/useReading'
import { useThemeColor } from '@/hooks/useThemeColor'
import Footer from '@/screens/ReadingScreen/Components/Footer/Footer'
import WordsSheet from '@/screens/ReadingScreen/Components/WordsSheet'
import { ReadingWordsProvider } from '@/screens/ReadingScreen/hooks/useReadingWords'
import Header from '@screens/ReadingScreen/Components/Header'
import ReadingContent from '@screens/ReadingScreen/Components/ReadingContent'
import { styles } from '@screens/ReadingScreen/styles'

export default function ReadingScreen() {
  const { reading } = useReading()
  const backgroundColor = useThemeColor({}, 'background')

  if (!reading) return null

  return (
    <ReadingWordsProvider>
      <SafeAreaView style={[styles.readingScreen, { backgroundColor }]}>
        <Header />
        <ReadingContent />
        <Footer />
        <View style={styles.absoluteFillObject} pointerEvents="box-none">
          <WordsSheet />
        </View>
      </SafeAreaView>
    </ReadingWordsProvider>
  )
}
