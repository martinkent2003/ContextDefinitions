import type { ProfileMetadata, SignUpCredentials } from '@/types/auth'
import { supabase } from '@utils/supabase'

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(
  { email, password }: SignUpCredentials,
  metadata?: ProfileMetadata,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    ...(metadata && {
      options: {
        data: {
          username: metadata.username,
          full_name: metadata.fullName,
          native_language: metadata.nativeLanguage,
          target_language: metadata.targetLanguage,
        },
      },
    }),
  })
  return { data, error }
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  })
  return { data, error }
}

export async function resendSignUpOtp(email: string) {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })
  return { data, error }
}

export async function updateProfile(userId: string, metadata: ProfileMetadata) {
  const { data, error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      username: metadata.username,
      full_name: metadata.fullName,
      native_language: metadata.nativeLanguage,
      target_language: metadata.targetLanguage,
    },
    { onConflict: 'id' },
  )
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}
