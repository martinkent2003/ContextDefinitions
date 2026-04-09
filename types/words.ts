import type { ReadingSelection } from '@/types/readings'

export type SheetMode = 'feed' | 'loading' | 'view' | 'edit'

export type WordExample = {
  text: string
  translation?: string
}

export type SavedWord = {
  id: string
  text: string
  definition: string
  translation: string
  context: string
  selection: ReadingSelection
  selection_start: number
  selection_end: number
  part_of_speech: string | null
  examples: WordExample[]
}

export type SavedWordRow = {
  id: string
  selection: string
  definition: string
  translation: string
  context: string
  selection_start: number
  selection_end: number
  part_of_speech: string | null
  examples: string
}

export type CachedWord = {
  selection: string
  definition: string
  translation: string
  selection_start: number
  selection_end: number
  part_of_speech: string | null
  examples: string
}

export type CachedWordKey = {
  selectionStart: number
  selectionEnd: number
  readingid: string
}

export type DefinitionAndTranslationParams = {
  selection: string
  context: string
  language: string
  language_code: string
  reading_id: string
  selection_start: number
  selection_end: number
}
