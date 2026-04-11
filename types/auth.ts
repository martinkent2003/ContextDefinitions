import type { LanguageCode } from '@/types/language'

export interface SignUpCredentials {
  email: string
  password: string
}

export interface ProfileMetadata {
  username: string
  fullName: string
  nativeLanguage: LanguageCode
  targetLanguage: LanguageCode
}
