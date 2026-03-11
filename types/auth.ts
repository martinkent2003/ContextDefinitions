import type { LanguageCode } from '@/types/language'

export interface SignUpData {
  email: string
  password: string
  username: string
  fullName: string
  nativeLanguage: LanguageCode
  targetLanguage: LanguageCode
}
