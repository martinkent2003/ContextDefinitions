import type { LanguageCode } from '@/types/language'

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  native_language: LanguageCode | null
  target_language: LanguageCode | null
  embedding: number[] | null
  num_vectors: number
  created_at: string
  updated_at: string
}
