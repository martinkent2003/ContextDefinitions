import { ScrollView } from 'react-native'
import { Text } from '@/components/ui'
import { WordCard } from '@/components/ui/WordCard'
import { useThemeColor } from '@/hooks/useThemeColor'
import { styles } from '@/screens/ReadingScreen/Components/WordsSheet/styles'
import type { SavedWord } from '@/types/words'

type WordFeedProps = {
  savedWords: Map<string, SavedWord>
  handleView: (savedWord: SavedWord) => void
}

export function WordFeed({ savedWords, handleView }: WordFeedProps) {
  const textColor = useThemeColor({}, 'text')
  const textSecondary = useThemeColor({}, 'textSecondary')

  return (
    <>
      <Text style={[styles.feedTitle, { color: textColor }]}>Saved Words</Text>
      {savedWords.size === 0 ? (
        <Text style={[styles.feedEmpty, { color: textSecondary }]}>
          No words saved yet. Select text and tap + to add words.
        </Text>
      ) : (
        <ScrollView>
          {[...savedWords.values()].map((word) => (
            <WordCard
              key={word.id}
              text={word.text}
              definition={word.translation}
              onPress={() => handleView(word)}
            />
          ))}
        </ScrollView>
      )}
    </>
  )
}
