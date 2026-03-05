import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useReading } from '@/hooks/useReading'
import { useThemeColor } from '@/hooks/useThemeColor'
import WordsSheet from '@/screens/ReadingScreen/Components/WordsSheet'
import Footer from '@screens/ReadingScreen/Components/Footer'
import Header from '@screens/ReadingScreen/Components/Header'
import ReadingContent from '@screens/ReadingScreen/Components/ReadingContent'
import { styles } from '@screens/ReadingScreen/styles'

export default function ReadingScreen() {
  const { reading } = useReading()
  const backgroundColor = useThemeColor({}, 'background')

  if (!reading) return null

  return (
    <SafeAreaView style={[styles.readingScreen, { backgroundColor }]}>
      <Header />
      <ReadingContent />
      <Footer />
      <View style={styles.absoluteFillObject} pointerEvents="box-none">
        <WordsSheet />
      </View>
    </SafeAreaView>
  )
}
