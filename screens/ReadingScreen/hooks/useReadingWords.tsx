import type BottomSheet from '@gorhom/bottom-sheet'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { useProfile } from '@/hooks/useProfile'
import { useReading } from '@/hooks/useReading'
import { readingCacheService } from '@/services/readingCache'
import {
  addSavedWord,
  getDefinitionAndTranslation,
  parseDefinition,
  parseExamples,
  serializeDefinition,
  serializeExamples,
  removeSavedWord,
  updateSavedWord,
} from '@/services/words'
import { LANGUAGE_CODE_TO_NAME } from '@/types/language'
import type { ReadingSelection } from '@/types/readings'
import type { SavedWord, SavedWordRow, SheetMode, WordExample } from '@/types/words'

function savedWordToRow(word: SavedWord): SavedWordRow {
  return {
    id: word.id,
    selection: word.text,
    definition: serializeDefinition(word.definition),
    translation: word.translation,
    context: word.context,
    selection_start: word.selection_start,
    selection_end: word.selection_end,
    part_of_speech: word.part_of_speech,
    examples: serializeExamples(word.examples),
  }
}

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
  partOfSpeech: string | null
  examples: WordExample[]
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
  const [partOfSpeech, setPartOfSpeech] = useState<string | null>(null)
  const [examples, setExamples] = useState<WordExample[]>([])
  const [definitionDraft, setDefinitionDraft] = useState('')
  const [translationDraft, setTranslationDraft] = useState('')
  const [contextDraft, setContextDraft] = useState('')
  const [fetchCache, setFetchCache] = useState<
    Map<
      string,
      {
        definition: string
        translation: string
        part_of_speech: string | null
        examples: WordExample[]
      }
    >
  >(() => new Map())

  // Initialize fetchCache from DB lookup cache when reading changes.
  useEffect(() => {
    if (!reading || !readingContent) {
      setFetchCache(new Map())
      return
    }

    const newCache = new Map<
      string,
      {
        definition: string
        translation: string
        part_of_speech: string | null
        examples: WordExample[]
      }
    >()

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
        part_of_speech: cached.part_of_speech ?? null,
        examples: parseExamples(cached.examples ?? '[]'),
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
        part_of_speech: row.part_of_speech ?? null,
        examples: parseExamples(row.examples ?? '[]'),
      })
    }

    setSavedWords(newMap)
  }, [reading, initialSavedWordRows, readingContent])

  useEffect(() => {
    if (selection === null) {
      setMode('feed')
      return
    }
    if (selection.sentenceIndices.length > 1 || selection.tokenIndices.length > 10) {
      Alert.alert('Selection too long', 'Please select text within a single sentence.')
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
      setPartOfSpeech(savedWord.part_of_speech)
      setExamples(savedWord.examples)
      setMode('view')
      return
    }

    // 2. LLM lookup cache
    const cached = fetchCache.get(cacheKey)
    if (cached) {
      setDefinition(cached.definition)
      setTranslation(cached.translation)
      setPartOfSpeech(cached.part_of_speech)
      setExamples(cached.examples)
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
      .then(({ definition, translation, part_of_speech, examples }) => {
        setFetchCache((prev) =>
          new Map(prev).set(cacheKey, {
            definition,
            translation,
            part_of_speech,
            examples,
          }),
        )
        setDefinition(definition)
        setTranslation(translation)
        setPartOfSpeech(part_of_speech)
        setExamples(examples)
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
      const newMap = new Map(savedWords)
      newMap.set(key, updated)
      readingCacheService.setSavedWords(
        reading!.id,
        profile!.id,
        profile?.native_language ?? 'en',
        Array.from(newMap.values()).map(savedWordToRow),
      )
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
            const newMap = new Map(savedWords)
            newMap.delete(key)
            readingCacheService.setSavedWords(
              reading!.id,
              profile!.id,
              profile?.native_language ?? 'en',
              Array.from(newMap.values()).map(savedWordToRow),
            )
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
            part_of_speech: partOfSpeech,
            examples,
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
              part_of_speech: partOfSpeech,
              examples: serializeExamples(examples),
            })
            setSavedWords((prev) => {
              const updated = new Map(prev)
              const word = updated.get(key)
              if (word) updated.set(key, { ...word, id })
              return updated
            })
            const finalWord: SavedWord = { ...tempWord, id }
            const newMap = new Map(savedWords)
            newMap.set(key, finalWord)
            readingCacheService.setSavedWords(
              reading.id,
              profile.id,
              profile?.native_language ?? 'en',
              Array.from(newMap.values()).map(savedWordToRow),
            )
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
