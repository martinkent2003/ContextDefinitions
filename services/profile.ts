import type { Profile } from '@/types/profile'
import { supabase } from '@utils/supabase'

export async function fetchProfileById(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { data: data as Profile | null, error }
}
