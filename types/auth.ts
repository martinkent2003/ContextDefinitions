export type LanguageCode = 'en' | 'es' | 'ja' | 'pt' | 'fr' | 'de' | 'zh' | 'ko' | 'it' | 'ru' | 'ar' | 'hi';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  nativeLanguage: LanguageCode;
  targetLanguage: LanguageCode;
}