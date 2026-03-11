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
  { label: 'Spanish', value: 'es' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Korean', value: 'ko' },
  { label: 'Italian', value: 'it' },
  { label: 'Russian', value: 'ru' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Hindi', value: 'hi' },
]

/** Maps a LanguageCode to its full lowercase name (used by AI services). */
export const LANGUAGE_CODE_TO_NAME: Record<LanguageCode, string> = Object.fromEntries(
  LANGUAGES.map(({ label, value }) => [value, label.toLowerCase()]),
) as Record<LanguageCode, string>

/** Maps a full language name (any case) to its LanguageCode. */
export const LANGUAGE_NAME_TO_CODE: Record<string, LanguageCode> = Object.fromEntries(
  LANGUAGES.map(({ label, value }) => [label.toLowerCase(), value]),
)
