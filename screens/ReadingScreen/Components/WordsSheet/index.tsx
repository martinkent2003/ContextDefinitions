import BottomSheet from '@gorhom/bottom-sheet'
import { useMemo } from 'react'
import { ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { View } from '@/components/ui'
import { spacing } from '@/constants/Themes'
import { useThemeColor } from '@/hooks/useThemeColor'
import { WordEdit } from '@/screens/ReadingScreen/Components/WordsSheet/components/WordEdit'
import { WordFeed } from '@/screens/ReadingScreen/Components/WordsSheet/components/WordFeed'
import { WordView } from '@/screens/ReadingScreen/Components/WordsSheet/components/WordView'
import { styles } from '@/screens/ReadingScreen/Components/WordsSheet/styles'
import { useReadingWords } from '@/screens/ReadingScreen/hooks/useReadingWords'

export default function WordsSheet() {
  const {
    sheetRef,
    mode,
    savedWords,
    selectedText,
    sentenceText,
    definition,
    translation,
    partOfSpeech,
    examples,
    definitionDraft,
    translationDraft,
    contextDraft,
    setDefinitionDraft,
    setTranslationDraft,
    setContextDraft,
    isSaved,
    handleView,
    handleFeed,
    handleEditPress,
    handleConfirm,
    handleCancel,
    handleAdd,
    handleRemove,
    handleClose,
  } = useReadingWords()

  const cardBackground = useThemeColor({}, 'cardBackground')
  const handleColor = useThemeColor({}, 'textTertiary')
  const snapPoints = useMemo(() => ['20%', '50%', '90%'], [])

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      index={1}
      enableDynamicSizing={false}
      enableContentPanningGesture={false}
      enablePanDownToClose={true}
      onClose={handleClose}
      backgroundStyle={{ backgroundColor: cardBackground }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.sheetContent}>
          {mode === 'feed' && (
            <WordFeed savedWords={savedWords} handleView={handleView} />
          )}
          {mode === 'loading' && (
            <View
              style={[
                styles.sheetHeader,
                { marginTop: spacing.sm, justifyContent: 'center' },
              ]}
            >
              <ActivityIndicator size="small" />
            </View>
          )}
          {mode === 'view' && (
            <WordView
              selectedText={selectedText}
              definition={definition}
              translation={translation}
              partOfSpeech={partOfSpeech}
              examples={examples}
              sentenceText={sentenceText}
              isSaved={isSaved}
              onBack={handleFeed}
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
      </TouchableWithoutFeedback>
    </BottomSheet>
  )
}
