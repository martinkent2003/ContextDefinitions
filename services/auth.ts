import type { SignUpData } from '../types/auth';
import { supabase } from '../utils/supabase';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUpWithEmail(signUpData: SignUpData) {
  const { email, password, username, fullName, nativeLanguage, targetLanguage } = signUpData;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
        native_language: nativeLanguage,
        target_language: targetLanguage,
      },
    },
  });
  console.log(error?.message)
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}