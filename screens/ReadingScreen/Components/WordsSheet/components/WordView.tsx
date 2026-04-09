import { View, Text, BackButton, IconButton } from '@/components/ui'
import { useThemeColor } from '@/hooks/useThemeColor'
import { styles } from '@/screens/ReadingScreen/Components/WordsSheet/styles'
import type { WordExample } from '@/types/words'

type WordViewProps = {
  selectedText: string | null
  definition: string | null
  translation: string | null
  partOfSpeech: string | null
  examples: WordExample[]
  sentenceText: string | null
  isSaved: boolean
  onBack: () => void
  onEdit: () => void
  onAdd: () => void
  onRemove: () => void
}

export function WordView({
  selectedText,
  definition,
  translation,
  partOfSpeech,
  examples,
  sentenceText,
  isSaved,
  onBack,
  onEdit,
  onAdd,
  onRemove,
}: WordViewProps) {
  const textColor = useThemeColor({}, 'text')
  const textSecondary = useThemeColor({}, 'textSecondary')
  const textTertiary = useThemeColor({}, 'textTertiary')

  return (
    <>
      <View style={styles.sheetHeader}>
        <BackButton onPress={onBack}></BackButton>
        <Text style={[styles.sheetHeaderCenter, { color: textColor }]}>
          {selectedText ?? '—'}
        </Text>
        <View style={styles.sheetHeaderActions}>
          <IconButton
            icon={{ library: 'Ionicons', name: 'pencil-outline', size: 24 }}
            onPress={onEdit}
          />
          {isSaved ? (
            <IconButton
              icon={{
                library: 'Ionicons',
                name: 'trash-outline',
                size: 24,
                color: '#B33',
              }}
              onPress={onRemove}
            />
          ) : (
            <IconButton
              icon={{ library: 'Ionicons', name: 'add', size: 24 }}
              onPress={onAdd}
            />
          )}
        </View>
      </View>

      {partOfSpeech ? (
        <Text style={[styles.sheetPartOfSpeech, { color: textTertiary }]}>
          {partOfSpeech}
        </Text>
      ) : null}

      <Text style={[styles.sheetLabel, { color: textColor }]}>Translation:</Text>
      <Text style={[styles.sheetValue, { color: textSecondary }]}>
        {translation ?? '—'}
      </Text>
      <Text style={[styles.sheetLabel, { color: textColor }]}>Definition:</Text>
      <Text style={[styles.sheetValue, { color: textSecondary }]}>
        {definition ?? '—'}
      </Text>

      {examples.length > 0 ? (
        <>
          <Text style={[styles.sheetLabel, { color: textColor }]}>Examples:</Text>
          {examples.map((ex, i) => (
            <View key={i}>
              <Text style={[styles.exampleText, { color: textSecondary }]}>
                &ldquo;{ex.text}&rdquo;
              </Text>
              {ex.translation ? (
                <Text style={[styles.exampleTranslation, { color: textTertiary }]}>
                  — {ex.translation}
                </Text>
              ) : null}
            </View>
          ))}
        </>
      ) : null}

      <Text style={[styles.sheetLabel, { color: textColor }]}>Context:</Text>
      <Text style={[styles.sheetValue, { color: textSecondary }]}>
        {sentenceText ?? '—'}
      </Text>
    </>
  )
}
