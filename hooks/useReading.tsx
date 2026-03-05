import { createContext, useContext, useMemo, useState } from 'react'
import { typography } from '@/constants/Themes'
import { getReadingStructure } from '@/services/readings'
import koreeda from '@/shared/reading-structure/koreeda.json'
import llm from '@/shared/reading-structure/llm.json'
import nba from '@/shared/reading-structure/nba.json'
import type {
  ReadingMetadata,
  ReadingSelection,
  ReadingPackageV1,
} from '@/types/readings'

type ReadingContextType = {
  reading: ReadingMetadata | null
  readingContent: ReadingPackageV1 | null
  selection: ReadingSelection | null
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
  const [reading, setReading] = useState<ReadingMetadata | null>(null)
  const [readingContent, setReadingContent] = useState<ReadingPackageV1 | null>(null)
  const [selection, setSelection] = useState<ReadingSelection | null>(null)
  const [fontSize, setFontSize] = useState<number>(typography.sizes.xl)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(0)

  async function handleReadingChange(reading: ReadingMetadata): Promise<boolean> {
    setSelection(null)
    const result = await getReadingStructure(reading.id)
    if (result === null) {
      setReading(null)
      return false
    }
    setReading(reading)
    setReadingContent(result)
    return true
  }

  return (
    <ReadingContext.Provider
      value={{
        reading,
        readingContent,
        selection,
        handleReadingChange,
        setSelection,
        fontSize,
        setFontSize,
        totalPages,
        setTotalPages,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </ReadingContext.Provider>
  )
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
