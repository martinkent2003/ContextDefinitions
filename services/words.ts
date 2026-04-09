import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js'
import type {
  CachedWord,
  DefinitionAndTranslationParams,
  SavedWordRow,
  WordExample,
} from '@/types/words'
import { supabase } from '@/utils/supabase'

export async function getCachedWords(
  readingId: string,
  nativeLanguage: string,
): Promise<CachedWord[]> {
  const { data, error } = await supabase
    .from('words_lookup_cache')
    .select(
      'selection, definition, translation, selection_start, selection_end, part_of_speech, examples',
    )
    .eq('reading_id', readingId)
    .eq('native_language', nativeLanguage)

  if (error) {
    console.error('getCachedWords error:', error)
    return []
  }
  return data ?? []
}

export async function getSavedWords(
  readingId: string,
  userId: string,
  nativeLanguage: string,
): Promise<SavedWordRow[]> {
  const { data, error } = await supabase
    .from('words_saved')
    .select(
      'id, selection, definition, translation, context, selection_start, selection_end, part_of_speech, examples',
    )
    .eq('reading_id', readingId)
    .eq('user_id', userId)
    .eq('native_language', nativeLanguage)

  if (error) {
    console.error('getSavedWords error:', error)
    return []
  }
  return data ?? []
}

export async function addSavedWord(params: {
  readingId: string
  userId: string
  nativeLanguage: string
  selection: string
  context: string
  definition: string
  translation: string
  selection_start: number
  selection_end: number
  part_of_speech: string | null
  examples: string
}): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('words_saved')
    .upsert(
      {
        reading_id: params.readingId,
        user_id: params.userId,
        native_language: params.nativeLanguage,
        selection: params.selection,
        context: params.context,
        definition: params.definition,
        translation: params.translation,
        selection_start: params.selection_start,
        selection_end: params.selection_end,
        part_of_speech: params.part_of_speech,
        examples: params.examples,
      },
      { onConflict: 'user_id,reading_id,selection_start,selection_end' },
    )
    .select('id')
    .single()

  if (error) throw error
  return { id: data.id }
}

export async function updateSavedWord(
  id: string,
  updates: { definition: string; translation: string; context: string },
): Promise<void> {
  const { error } = await supabase.from('words_saved').update(updates).eq('id', id)

  if (error) throw error
}

export async function removeSavedWord(id: string): Promise<void> {
  const { error } = await supabase.from('words_saved').delete().eq('id', id)

  if (error) throw error
}

export function parseDefinition(raw: string | string[]): string {
  if (Array.isArray(raw)) {
    return raw.map((b: string) => `• ${b}`).join('\n')
  }
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.map((b: string) => `• ${b}`).join('\n')
    }
  } catch {
    // already plain text
  }
  return raw
}

export function serializeDefinition(display: string): string {
  const lines = display
    .split('\n')
    .map((line) => line.replace(/^•\s*/, '').trim())
    .filter(Boolean)
  return JSON.stringify(lines)
}

export function parseExamples(raw: string): WordExample[] {
  try {
    return JSON.parse(raw) as WordExample[]
  } catch {
    return []
  }
}

export function serializeExamples(examples: WordExample[]): string {
  return JSON.stringify(examples)
}

export async function getDefinitionAndTranslation(
  params: DefinitionAndTranslationParams,
): Promise<{
  definition: string
  translation: string
  part_of_speech: string | null
  examples: WordExample[]
}> {
  const { data, error } = await supabase.functions.invoke('defintion-translation', {
    body: params,
  })

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const errorMessage = await error.context.json().catch(() => null)
      console.error('definition-translation error body:', errorMessage)
      const detail = errorMessage?.detail ? ` — ${errorMessage.detail}` : ''
      throw new Error((errorMessage?.error ?? error.message) + detail)
    } else if (error instanceof FunctionsRelayError) {
      throw error
    } else if (error instanceof FunctionsFetchError) {
      throw error
    } else {
      throw error
    }
  }

  const definition = parseDefinition(data?.definition ?? '')
  const translation: string = data?.translation ?? ''
  const part_of_speech: string | null = data?.part_of_speech ?? null
  const examples: WordExample[] = Array.isArray(data?.examples) ? data.examples : []

  return { definition, translation, part_of_speech, examples }
}
