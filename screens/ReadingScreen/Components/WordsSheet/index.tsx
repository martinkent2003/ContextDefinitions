import BottomSheet from '@gorhom/bottom-sheet'
import { useMemo } from 'react'
import { View } from '@/components/ui'
import { useThemeColor } from '@/hooks/useThemeColor'
import { WordEdit } from '@/screens/ReadingScreen/Components/WordsSheet/components/WordEdit'
import { WordFeed } from '@/screens/ReadingScreen/Components/WordsSheet/components/WordFeed'
import { WordView } from '@/screens/ReadingScreen/Components/WordsSheet/components/WordView'
import { useReadingWords } from '@/screens/ReadingScreen/Components/WordsSheet/hooks/useReadingWords'
import { styles } from '@/screens/ReadingScreen/Components/WordsSheet/styles'

export default function WordsSheet() {
  const {
    sheetRef,
    mode,
    savedWords,
    selectedText,
    sentenceText,
    definition,
    translation,
    definitionDraft,
    translationDraft,
    contextDraft,
    setDefinitionDraft,
    setTranslationDraft,
    setContextDraft,
    isSaved,
    handleView,
    handleBack,
    handleEditPress,
    handleConfirm,
    handleCancel,
    handleAdd,
    handleRemove,
  } = useReadingWords()

  const cardBackground = useThemeColor({}, 'cardBackground')
  const handleColor = useThemeColor({}, 'textTertiary')
  const snapPoints = useMemo(() => ['12%', '50%', '90%'], [])

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: cardBackground }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <View style={styles.sheetContent}>
        {mode === 'feed' && <WordFeed savedWords={savedWords} handleView={handleView} />}
        {mode === 'view' && (
          <WordView
            selectedText={selectedText}
            definition={definition}
            translation={translation}
            sentenceText={sentenceText}
            isSaved={isSaved}
            onBack={handleBack}
            onEdit={handleEditPress}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        )}
        {mode === 'edit' && (
          <WordEdit
            selectedText={selectedText}
            definitionDraft={definitionDraft}
            translationDraft={translationDraft}
            contextDraft={contextDraft}
            setDefinitionDraft={setDefinitionDraft}
            setTranslationDraft={setTranslationDraft}
            setContextDraft={setContextDraft}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </View>
    </BottomSheet>
  )
}
