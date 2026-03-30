export type LanguageCode =
  | 'en'
  | 'es'
  | 'ja'
  | 'pt'
  | 'fr'
  | 'de'
  | 'zh'
  | 'ko'
  | 'it'
  | 'ru'
  | 'ar'
  | 'hi'

/** Ordered list used to populate language pickers. */
export const LANGUAGES: { label: string; value: LanguageCode }[] = [
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
  { label: '日本語', value: 'ja' },
  { label: 'Português', value: 'pt' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: '中文', value: 'zh' },
  { label: '한국어', value: 'ko' },
  { label: 'Italiano', value: 'it' },
  { label: 'Русский', value: 'ru' },
  { label: 'العربية', value: 'ar' },
  { label: 'हिन्दी', value: 'hi' },
]

/** Maps a LanguageCode to its full lowercase name (used by AI services). */
export const LANGUAGE_CODE_TO_NAME: Record<LanguageCode, string> = Object.fromEntries(
  LANGUAGES.map(({ label, value }) => [value, label.toLowerCase()]),
) as Record<LanguageCode, string>

/** Maps a full language name (any case) to its LanguageCode. */
export const LANGUAGE_NAME_TO_CODE: Record<string, LanguageCode> = Object.fromEntries(
  LANGUAGES.map(({ label, value }) => [label.toLowerCase(), value]),
)
