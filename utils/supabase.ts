import { createClient } from '@supabase/supabase-js';
import 'expo-sqlite/localStorage/install';

//publishable key is safe as long as RLS is enabled*
const supabaseUrl = 'https://irspwhgeyrojqluzgciu.supabase.co'
const supabasePublishableKey = 'sb_publishable_bNzJDiqiG-wKL7JKnxY6Aw_SuGvFjdY'

// Get a storage object safely in any runtime (web/native/SSR-ish)
function getStorage(): Storage | undefined {
  // Web: use real browser storage if available
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  // Native (after expo-sqlite/localStorage/install):
  const maybeGlobalLocalStorage = (globalThis as any)?.localStorage;
  if (maybeGlobalLocalStorage) {
    return maybeGlobalLocalStorage as Storage;
  }

  // If storage isn't available, let Supabase run without persistence
  return undefined;
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})