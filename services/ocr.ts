// src/api/ocr.ts (or wherever you keep API helpers)

import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase'

export async function ocrExtract(language_code: string, uris: string[]) {
  const formData = new FormData()
  formData.append('language_code', language_code)

  for (const uri of uris) {
    const name = uri.split('/').pop() ?? 'file'
    formData.append('files', { uri, name, type: 'application/octet-stream' } as any)
  }

  const { data, error } = await supabase.functions.invoke('ocr-extract', {
    body: formData as any, // supabase-js types are strict; FormData works at runtime
  })

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const errorMessage = await error.context.json().catch(() => null)
      console.log('Function returned an error', errorMessage)
      throw new Error(errorMessage?.error ?? errorMessage?.detail ?? error.message)
    } else if (error instanceof FunctionsRelayError) {
      console.log('Relay error:', error.message)
      throw error
    } else if (error instanceof FunctionsFetchError) {
      console.log('Fetch error:', error.message)
      throw error
    } else {
      throw error
    }
  }

  const text = (data as any)?.text
  if (typeof text !== 'string') {
    throw new Error('OCR response missing `text`')
  }

  return text
}
