import type BottomSheet from '@gorhom/bottom-sheet'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { useProfile } from '@/hooks/useProfile'
import { useReading } from '@/hooks/useReading'
import {
  addSavedWord,
  getDefinitionAndTranslation,
  parseDefinition,
  serializeDefinition,
  removeSavedWord,
  updateSavedWord,
} from '@/services/words'
import { LANGUAGE_CODE_TO_NAME } from '@/types/language'
import type { ReadingSelection } from '@/types/readings'
import type { SavedWord, SheetMode } from '@/types/words'

function selectionCacheKey(sel: ReadingSelection): string {
  return [...sel.tokenIndices].sort((a, b) => a - b).join(',')
}

type ReadingWordsContextType = {
  sheetRef: React.RefObject<BottomSheet | null>
  mode: SheetMode
  savedWords: Map<string, SavedWord>
  selectedText: string | null
  sentenceText: string | null
  definition: string | null
  translation: string | null
  definitionDraft: string
  translationDraft: string
  contextDraft: string
  setDefinitionDraft: (v: string) => void
  setTranslationDraft: (v: string) => void
  setContextDraft: (v: string) => void
  isSaved: boolean
  handleView: (savedWord: SavedWord) => void
  handleFeed: () => void
  handleEditPress: () => void
  handleConfirm: () => void
  handleCancel: () => void
  handleAdd: () => void
  handleRemove: () => void
  handleClose: () => void
}

const ReadingWordsContext = createContext<ReadingWordsContextType | null>(null)

export function ReadingWordsProvider({ children }: { children: React.ReactNode }) {
  const {
    selection,
    setSelection,
    selectedText,
    sentenceText,
    reading,
    readingContent,
    initialCachedWords,
    initialSavedWordRows,
  } = useReading()
  const { profile } = useProfile()
  const sheetRef = useRef<BottomSheet>(null)
  const [mode, setMode] = useState<SheetMode>('feed')
  const [savedWords, setSavedWords] = useState<Map<string, SavedWord>>(() => new Map())
  const [definition, setDefinition] = useState<string | null>(null)
  const [translation, setTranslation] = useState<string | null>(null)
  const [definitionDraft, setDefinitionDraft] = useState('')
  const [translationDraft, setTranslationDraft] = useState('')
  const [contextDraft, setContextDraft] = useState('')
  const [fetchCache, setFetchCache] = useState<
    Map<string, { definition: string; translation: string }>
  >(() => new Map())

  // Initialize fetchCache from DB lookup cache when reading changes.
  useEffect(() => {
    if (!reading || !readingContent) {
      setFetchCache(new Map())
      return
    }

    const newCache = new Map<string, { definition: string; translation: string }>()

    for (const cached of initialCachedWords) {
      const tokens = readingContent.tokens.filter(
        (t) => t.start >= cached.selection_start && t.end <= cached.selection_end,
      )
      if (tokens.length === 0) continue

      const partialSel: ReadingSelection = {
        tokenIndices: tokens.map((t) => t.i),
        sentenceIndices: [],
        spanIds: [],
      }
      newCache.set(selectionCacheKey(partialSel), {
        definition: parseDefinition(cached.definition),
        translation: cached.translation,
      })
    }

    setFetchCache(newCache)
  }, [reading, initialCachedWords, readingContent])

  // Initialize savedWords Map from DB rows when reading changes.
  useEffect(() => {
    if (!reading || !readingContent) {
      setSavedWords(new Map())
      return
    }

    const newMap = new Map<string, SavedWord>()

    for (const row of initialSavedWordRows) {
      const tokens = readingContent.tokens.filter(
        (t) => t.start >= row.selection_start && t.end <= row.selection_end,
      )
      if (tokens.length === 0) continue

      const sentence = readingContent.sentences.find(
        (s) => s.start <= row.selection_start && s.end >= row.selection_end,
      )
      const sel: ReadingSelection = {
        tokenIndices: tokens.map((t) => t.i),
        sentenceIndices: sentence ? [sentence.i] : [],
        spanIds: [],
      }
      newMap.set(selectionCacheKey(sel), {
        id: row.id,
        text: row.selection,
        definition: parseDefinition(row.definition),
        translation: row.translation,
        context: row.context,
        selection: sel,
        selection_start: row.selection_start,
        selection_end: row.selection_end,
      })
    }

    setSavedWords(newMap)
  }, [reading, initialSavedWordRows, readingContent])

  useEffect(() => {
    if (selection === null) {
      setMode('feed')
      return
    }

    sheetRef.current?.snapToIndex(0)

    if (!selectedText || !sentenceText) {
      setMode('view')
      return
    }

    const cacheKey = selectionCacheKey(selection)

    // 1. Saved word takes priority — may have user-edited definition
    const savedWord = savedWords.get(cacheKey)
    if (savedWord) {
      setDefinition(savedWord.definition)
      setTranslation(savedWord.translation)
      setMode('view')
      return
    }

    // 2. LLM lookup cache
    const cached = fetchCache.get(cacheKey)
    if (cached) {
      setDefinition(cached.definition)
      setTranslation(cached.translation)
      setMode('view')
      return
    }

    // 3. Fetch from edge function
    setMode('loading')
    const selectedTokens = readingContent!.tokens.filter((t) =>
      selection.tokenIndices.includes(t.i),
    )
    const selection_start = Math.min(...selectedTokens.map((t) => t.start))
    const selection_end = Math.max(...selectedTokens.map((t) => t.end))
    getDefinitionAndTranslation({
      selection: selectedText,
      context: sentenceText,
      language: LANGUAGE_CODE_TO_NAME[profile?.native_language ?? 'en'],
      language_code: readingContent!.language_code,
      reading_id: reading!.id,
      selection_start,
      selection_end,
    })
      .then(({ definition, translation }) => {
        setFetchCache((prev) => new Map(prev).set(cacheKey, { definition, translation }))
        setDefinition(parseDefinition(definition))
        setTranslation(translation)
        setMode('view')
      })
      .catch((err) => {
        console.error('Failed to fetch definition/translation:', err)
        setMode('view')
      })
  }, [selection, selectedText, sentenceText])

  function handleView(savedWord: SavedWord) {
    setSelection(savedWord.selection)
  }

  function handleFeed() {
    setSelection(null)
    setMode('feed')
    sheetRef.current?.snapToIndex(0)
  }

  function handleEditPress() {
    setDefinitionDraft(definition ?? '')
    setTranslationDraft(translation ?? '')
    setContextDraft(sentenceText ?? '')
    setMode('edit')
    sheetRef.current?.snapToIndex(2)
  }

  async function handleConfirm() {
    setDefinition(definitionDraft)
    setTranslation(translationDraft)
    setMode('view')
    sheetRef.current?.snapToIndex(1)

    if (!selection) return
    const key = selectionCacheKey(selection)
    const savedWord = savedWords.get(key)
    if (!savedWord) return

    const updated: SavedWord = {
      ...savedWord,
      definition: definitionDraft,
      translation: translationDraft,
      context: contextDraft,
    }
    setSavedWords((prev) => new Map(prev).set(key, updated))

    try {
      await updateSavedWord(savedWord.id, {
        definition: serializeDefinition(definitionDraft),
        translation: translationDraft,
        context: contextDraft,
      })
    } catch (err) {
      console.error('Failed to update saved word:', err)
      setSavedWords((prev) => new Map(prev).set(key, savedWord))
      setDefinition(savedWord.definition)
      setTranslation(savedWord.translation)
    }
  }

  function handleCancel() {
    setMode('view')
    sheetRef.current?.snapToIndex(1)
  }

  const isSaved = selection ? savedWords.has(selectionCacheKey(selection)) : false

  function handleRemove() {
    if (!selection || !selectedText) return
    const key = selectionCacheKey(selection)
    const savedWord = savedWords.get(key)
    if (!savedWord) return

    Alert.alert(selectedText, 'Remove this word from your list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setSavedWords((prev) => {
            const updated = new Map(prev)
            updated.delete(key)
            return updated
          })
          try {
            await removeSavedWord(savedWord.id)
          } catch (err) {
            console.error('Failed to remove saved word:', err)
            setSavedWords((prev) => new Map(prev).set(key, savedWord))
          }
        },
      },
    ])
  }

  function handleClose() {
    setSelection(null)
  }

  function handleAdd() {
    if (!selection || !selectedText || !reading || !profile) return
    Alert.alert(selectedText, 'add word to list', [
      { text: 'Cancel', style: 'destructive' },
      {
        text: 'Confirm',
        style: 'default',
        onPress: async () => {
          const selectedTokens = readingContent!.tokens.filter((t) =>
            selection.tokenIndices.includes(t.i),
          )
          const selection_start = Math.min(...selectedTokens.map((t) => t.start))
          const selection_end = Math.max(...selectedTokens.map((t) => t.end))
          const key = selectionCacheKey(selection)

          const tempWord: SavedWord = {
            id: `temp-${Date.now()}`,
            text: selectedText,
            definition: definition ?? '',
            translation: translation ?? '',
            context: sentenceText ?? '',
            selection,
            selection_start,
            selection_end,
          }
          setSavedWords((prev) => new Map(prev).set(key, tempWord))

          try {
            const { id } = await addSavedWord({
              readingId: reading.id,
              userId: profile.id,
              nativeLanguage: profile.native_language ?? 'en',
              selection: selectedText,
              context: sentenceText ?? '',
              definition: serializeDefinition(definition ?? ''),
              translation: translation ?? '',
              selection_start,
              selection_end,
            })
            setSavedWords((prev) => {
              const updated = new Map(prev)
              const word = updated.get(key)
              if (word) updated.set(key, { ...word, id })
              return updated
            })
          } catch (err) {
            console.error('Failed to save word:', err)
            setSavedWords((prev) => {
              const rolled = new Map(prev)
              rolled.delete(key)
              return rolled
            })
          }
        },
      },
    ])
  }

  return (
    <ReadingWordsContext.Provider
      value={{
        sheetRef,
        mode,
        savedWords,
        selectedText: selectedText ?? null,
        sentenceText: sentenceText ?? null,
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
        handleFeed,
        handleEditPress,
        handleConfirm,
        handleCancel,
        handleAdd,
        handleRemove,
        handleClose,
      }}
    >
      {children}
    </ReadingWordsContext.Provider>
  )
}

export function useReadingWords() {
  const context = useContext(ReadingWordsContext)
  if (!context) {
    throw new Error('useReadingWords must be used within a ReadingWordsProvider')
  }
  return context
}
