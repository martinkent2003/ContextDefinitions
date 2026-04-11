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

export async function uploadAvatar(userId: string, uri: string) {
  const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg'
  const filePath = `${userId}/avatar.${ext}`
  const blob = await fetch(uri).then((r) => r.blob())

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, blob, { upsert: true, contentType: `image/${ext}` })

  if (uploadError) return { url: null, error: uploadError }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  const url = `${data.publicUrl}?t=${Date.now()}`
  return { url, error: null }
}

export async function updateProfileAvatarUrl(userId: string, url: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', userId)
  return { error }
}
