import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { typography } from '@/constants/Themes'
import { useProfile } from '@/hooks/useProfile'
import { getReadingStructure } from '@/services/readings'
import { getCachedWords, getSavedWords } from '@/services/words'
import koreeda from '@/shared/reading-structure/koreeda.json'
import llm from '@/shared/reading-structure/llm.json'
import nba from '@/shared/reading-structure/nba.json'
import type {
  ReadingMetadata,
  ReadingSelection,
  ReadingPackageV1,
} from '@/types/readings'
import type { CachedWord, SavedWordRow } from '@/types/words'

type ReadingContextType = {
  reading: ReadingMetadata | null
  readingContent: ReadingPackageV1 | null
  selection: ReadingSelection | null
  initialCachedWords: CachedWord[]
  initialSavedWordRows: SavedWordRow[]
  handleReadingChange: (reading: ReadingMetadata) => Promise<boolean>
  setSelection: (sel: ReadingSelection | null) => void
  fontSize: number
  setFontSize: (size: number) => void
  totalPages: number
  setTotalPages: (count: number) => void
  currentPage: number
  setCurrentPage: (page: number) => void
}

const ReadingContext = createContext<ReadingContextType | null>(null)

export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile()
  const [reading, setReading] = useState<ReadingMetadata | null>(null)
  const [readingContent, setReadingContent] = useState<ReadingPackageV1 | null>(null)
  const [selection, setSelection] = useState<ReadingSelection | null>(null)
  const [initialCachedWords, setInitialCachedWords] = useState<CachedWord[]>([])
  const [initialSavedWordRows, setInitialSavedWordRows] = useState<SavedWordRow[]>([])
  const [fontSize, setFontSize] = useState<number>(typography.sizes.md)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(0)

  const handleReadingChange = useCallback(
    async (reading: ReadingMetadata): Promise<boolean> => {
      setSelection(null)
      const [result, cachedWords, savedWords] = await Promise.all([
        getReadingStructure(reading.id),
        getCachedWords(reading.id, profile?.native_language ?? 'en'),
        getSavedWords(reading.id, profile?.id ?? '', profile?.native_language ?? 'en'),
      ])
      setInitialCachedWords(cachedWords)
      setInitialSavedWordRows(savedWords)
      if (result === null) {
        setReading(null)
        return false
      }
      setReading(reading)
      setReadingContent(result)
      return true
    },
    [profile],
  )

  const value = useMemo(
    () => ({
      reading,
      readingContent,
      selection,
      initialCachedWords,
      initialSavedWordRows,
      handleReadingChange,
      setSelection,
      fontSize,
      setFontSize,
      totalPages,
      setTotalPages,
      currentPage,
      setCurrentPage,
    }),
    [
      reading,
      readingContent,
      selection,
      initialCachedWords,
      initialSavedWordRows,
      handleReadingChange,
      fontSize,
      totalPages,
      currentPage,
    ],
  )

  return <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>
}

export function useReading() {
  const context = useContext(ReadingContext)
  if (!context) {
    throw new Error('useReading must be used within a ReadingProvider')
  }

  const { selection, readingContent } = context

  const selectedText = useMemo(() => {
    if (!selection || !readingContent) return null
    const selected = readingContent.tokens
      .filter((t) => selection.tokenIndices.includes(t.i))
      .sort((a, b) => a.start - b.start)
    return selected
      .map((t, i) => {
        const prev = selected[i - 1]
        return (prev && t.start > prev.end ? ' ' : '') + t.surface
      })
      .join('')
  }, [selection, readingContent])

  const sentenceText = useMemo(() => {
    if (!selection || !readingContent) return null
    const sentIdx = selection.sentenceIndices[0]
    if (sentIdx === undefined) return null
    const sentence = readingContent.sentences.find((s) => s.i === sentIdx)
    if (!sentence) return null
    const sentTokens = readingContent.tokens
      .filter((t) => t.start >= sentence.start && t.end <= sentence.end)
      .sort((a, b) => a.start - b.start)
    return sentTokens
      .map((t, i) => {
        const prev = sentTokens[i - 1]
        return (prev && t.start > prev.end ? ' ' : '') + t.surface
      })
      .join('')
  }, [selection, readingContent])

  return { ...context, selectedText, sentenceText }
}
