import { createContext, useContext, useState } from 'react'
import type { LanguageCode } from '@/types/language'

type OnboardingContextType = {
  // Data
  email: string
  password: string
  username: string
  fullName: string
  nativeLanguage: LanguageCode
  targetLanguage: LanguageCode

  // Setters
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setUsername: (username: string) => void
  setFullName: (fullName: string) => void
  setNativeLanguage: (lang: LanguageCode) => void
  setTargetLanguage: (lang: LanguageCode) => void

  // Lifecycle
  clearOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>('en')
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('es')

  const clearOnboarding = () => {
    setEmail('')
    setPassword('')
    setUsername('')
    setFullName('')
    setNativeLanguage('en')
    setTargetLanguage('es')
  }

  return (
    <OnboardingContext.Provider
      value={{
        email,
        password,
        username,
        fullName,
        nativeLanguage,
        targetLanguage,
        setEmail,
        setPassword,
        setUsername,
        setFullName,
        setNativeLanguage,
        setTargetLanguage,
        clearOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
