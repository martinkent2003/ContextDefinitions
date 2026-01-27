import { createClient } from '@supabase/supabase-js';
import 'expo-sqlite/localStorage/install';

//publishable key is safe as long as RLS is enabled*
const supabaseUrl = 'https://irspwhgeyrojqluzgciu.supabase.co'
const supabasePublishableKey = 'sb_publishable_bNzJDiqiG-wKL7JKnxY6Aw_SuGvFjdY'

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})