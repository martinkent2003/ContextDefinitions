import { View, Text, BackButton, IconButton } from '@/components/ui'
import { useThemeColor } from '@/hooks/useThemeColor'
import { styles } from '@/screens/ReadingScreen/Components/WordsSheet/styles'

type WordViewProps = {
  selectedText: string | null
  definition: string | null
  translation: string | null
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
  sentenceText,
  isSaved,
  onBack,
  onEdit,
  onAdd,
  onRemove,
}: WordViewProps) {
  const textColor = useThemeColor({}, 'text')
  const textSecondary = useThemeColor({}, 'textSecondary')

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
            label="Edit"
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
              label="Remove"
              onPress={onRemove}
            />
          ) : (
            <IconButton
              icon={{ library: 'Ionicons', name: 'add', size: 24 }}
              label="Add"
              onPress={onAdd}
            />
          )}
        </View>
      </View>
      <Text style={[styles.sheetLabel, { color: textColor }]}>Definition:</Text>
      <Text style={[styles.sheetValue, { color: textSecondary }]}>
        {definition ?? '—'}
      </Text>
      <Text style={[styles.sheetLabel, { color: textColor }]}>Translation:</Text>
      <Text style={[styles.sheetValue, { color: textSecondary }]}>
        {translation ?? '—'}
      </Text>
      <Text style={[styles.sheetLabel, { color: textColor }]}>Context:</Text>
      <Text style={[styles.sheetValue, { color: textSecondary }]}>
        {sentenceText ?? '—'}
      </Text>
    </>
  )
}
