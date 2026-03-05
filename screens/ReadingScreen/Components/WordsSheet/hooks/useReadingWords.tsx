import type BottomSheet from '@gorhom/bottom-sheet'
import { useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { useReading } from '@/hooks/useReading'
import type { ReadingSelection } from '@/types/readings'

type SheetMode = 'feed' | 'view' | 'edit'

export type SavedWord = {
  text: string
  definition: string
  translation: string
  context: string
  selection: ReadingSelection
}

export function useReadingWords() {
  const { selection, setSelection, selectedText, sentenceText } = useReading()
  const sheetRef = useRef<BottomSheet>(null)

  const [mode, setMode] = useState<SheetMode>('feed')
  const [savedWords, setSavedWords] = useState<SavedWord[]>([])
  const [definition, setDefinition] = useState<string | null>(null)
  const [translation, setTranslation] = useState<string | null>(null)
  const [definitionDraft, setDefinitionDraft] = useState('')
  const [translationDraft, setTranslationDraft] = useState('')
  const [contextDraft, setContextDraft] = useState('')

  useEffect(() => {
    if (selection !== null) {
      setMode('view')
      sheetRef.current?.snapToIndex(0)
    } else {
      setMode('feed')
      sheetRef.current?.snapToIndex(0)
    }
  }, [selection])

  function handleView(savedWord: SavedWord) {
    setSelection(savedWord.selection)
    console.log('setting selection')
  }

  function handleBack() {
    setSelection(null)
    setMode('feed')
    sheetRef.current?.snapToIndex(1)
  }

  function handleEditPress() {
    setDefinitionDraft(definition ?? '')
    setTranslationDraft(translation ?? '')
    setContextDraft(sentenceText ?? '')
    setMode('edit')
    sheetRef.current?.snapToIndex(2)
  }

  function handleConfirm() {
    setDefinition(definitionDraft)
    setTranslation(translationDraft)
    setMode('view')
    sheetRef.current?.snapToIndex(1)
  }

  function handleCancel() {
    setMode('view')
    sheetRef.current?.snapToIndex(1)
  }

  const isSaved = savedWords.some((w) => w.text === selectedText)

  function handleRemove() {
    if (!selectedText) return
    Alert.alert(selectedText, 'Remove this word from your list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setSavedWords((prev) => {
            const idx = prev.findIndex((w) => w.text === selectedText)
            if (idx === -1) return prev
            return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
          })
        },
      },
    ])
  }

  function handleAdd() {
    if (!selection || !selectedText) return
    Alert.alert(selectedText, 'add word to list', [
      { text: 'Cancel', style: 'destructive' },
      {
        text: 'Confirm',
        style: 'default',
        onPress: () => {
          setSavedWords((prev) => [
            ...prev,
            {
              text: selectedText ?? '',
              definition: definition ?? '',
              translation: translation ?? '',
              context: sentenceText ?? '',
              selection,
            },
          ])
        },
      },
    ])
  }

  return {
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
  }
}
