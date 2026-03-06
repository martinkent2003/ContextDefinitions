import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase'

export async function getDefinitionAndTranslation(
  selection: string,
  context: string,
  language: string,
): Promise<{ definition: string; translation: string }> {
  const { data, error } = await supabase.functions.invoke('defintion-translation', {
    body: { selection, context, language },
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

  const bullets: string[] = data?.definition ?? []
  const definition = bullets.map((b) => `• ${b}`).join('\n')
  const translation: string = data?.translation ?? ''

  return { definition, translation }
}
