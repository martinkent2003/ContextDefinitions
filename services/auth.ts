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

// Checks whether an email address is available for sign-up.
// Uses signInWithOtp with shouldCreateUser: false — if no error is returned,
// a login OTP was sent to an existing account (email is taken); if an error
// is returned, the user does not exist and the email is free.
export async function checkEmailAvailable(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  })
  return { available: error !== null }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}
