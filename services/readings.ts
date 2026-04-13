import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js'
import type { FeedSortOrder, ReadingMetadata, ReadingPackageV1 } from '@/types/readings'
import { supabase } from '@utils/supabase'

//since blob.text() is a web-only api
function blobToText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(blob)
  })
}

export async function uploadReading(
  content: string,
  title: string,
  genre: string,
  privacy: boolean,
  languageCode: string,
): Promise<boolean> {
  const newReading = {
    title: title,
    genre: genre,
    language_code: languageCode,
    visibility: privacy ? 'private' : 'public',
    content: content,
  }

  const { data, error } = await supabase.functions.invoke('create-reading', {
    body: JSON.stringify(newReading),
  })
  if (error instanceof FunctionsHttpError) {
    const errorMessage = await error.context.json()
    console.log('Function returned an error', errorMessage)
    return false
  } else if (error instanceof FunctionsRelayError) {
    console.log('Relay error:', error.message)
    return false
  } else if (error instanceof FunctionsFetchError) {
    console.log('Fetch error:', error.message)
    return false
  } else {
    console.log(data)
    return true
  }
}

export async function fetchSavedReadings(): Promise<ReadingMetadata[]> {
  const { data, error } = await supabase
    .from('user_saved_readings')
    .select(
      `
      readings (
        id,
        title,
        genre,
        difficulty,
        content_preview,
        owner_id,
        visibility
      )
    `,
    )
    .order('last_accessed', { ascending: false })
    .limit(20)

  if (error) {
    console.log('fetchSavedReadings error:', error.message)
    return []
  }

  return (data ?? [])
    .map((row: any) => row.readings)
    .filter(Boolean)
    .map((r: any): ReadingMetadata => {
      console.log(
        '[fetchSavedReadings] raw row:',
        JSON.stringify({ id: r.id, owner_id: r.owner_id, visibility: r.visibility }),
      )
      return {
        id: String(r.id),
        title: String(r.title ?? ''),
        genre: String(r.genre ?? ''),
        rating: String(r.difficulty ?? ''),
        body: String(r.content_preview ?? ''),
        owner_id: String(r.owner_id ?? ''),
        visibility: r.visibility === 'private' ? 'private' : 'public',
        isInLibrary: true,
      }
    })
}

export async function fetchFeedReadings(
  sort: FeedSortOrder = 'recent',
): Promise<ReadingMetadata[]> {
  if (sort === 'interests') {
    const { data, error } = await supabase.functions.invoke(
      'personal-feed?limit=50&offset=0',
      {
        method: 'GET',
      },
    )
    if (error) {
      console.log('fetchFeedReadings (interests) error:', error.message)
      return []
    }
    console.log(data)
    const readings = Array.isArray(data) ? data : (data?.feed ?? [])
    return readings.map(
      (r: any): ReadingMetadata => ({
        id: String(r.id),
        title: String(r.title ?? ''),
        genre: String(r.genre ?? ''),
        rating: String(r.difficulty ?? ''),
        body: String(r.content_preview ?? ''),
        owner_id: r.owner_id ? String(r.owner_id) : undefined,
        visibility: 'public',
        isInLibrary: false,
      }),
    )
  }

  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  const userId = userRes?.user?.id

  if (userErr || !userId) {
    console.log('fetchFeedReadings auth error:', userErr?.message ?? 'No user')
    return []
  }

  const orderColumn =
    sort === 'easiest' || sort === 'hardest' ? 'difficulty' : 'created_at'
  const ascending = sort === 'easiest'

  const { data, error } = await supabase
    .from('readings')
    .select(
      `
      id,
      title,
      genre,
      difficulty,
      content_preview,
      owner_id,
      visibility,
      user_saved_readings!left(reading_id)
    `,
    )
    .eq('visibility', 'public')
    .eq('is_deleted', false)
    .eq('status', 'processed')
    .neq('owner_id', userId)
    .is('user_saved_readings.reading_id', null)
    .order(orderColumn, { ascending })
    .limit(50)

  if (error) {
    console.log('fetchFeedReadings error:', error.message)
    return []
  }

  return (data ?? []).map(
    (r: any): ReadingMetadata => ({
      id: String(r.id),
      title: String(r.title ?? ''),
      genre: String(r.genre ?? ''),
      rating: String(r.difficulty ?? ''),
      body: String(r.content_preview ?? ''),
      owner_id: String(r.owner_id ?? ''),
      visibility: r.visibility === 'private' ? 'private' : 'public',
      isInLibrary: false,
    }),
  )
}

export async function fetchAllAvailableReadings(
  sort: FeedSortOrder = 'recent',
): Promise<ReadingMetadata[]> {
  if (sort === 'interests') {
    return fetchFeedReadings('interests')
  }

  const [saved, feed] = await Promise.all([fetchSavedReadings(), fetchFeedReadings(sort)])

  const map = new Map<string, ReadingMetadata>()
  for (const r of [...saved, ...feed]) map.set(r.id, r)

  const result = Array.from(map.values())

  if (sort === 'easiest') {
    result.sort((a, b) => parseFloat(a.rating || '0') - parseFloat(b.rating || '0'))
  } else if (sort === 'hardest') {
    result.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'))
  }

  return result
}

export async function addToLibrary(readingId: string): Promise<boolean> {
  const { data: userRes } = await supabase.auth.getUser()
  const userId = userRes?.user?.id
  if (!userId) return false

  const { error } = await supabase
    .from('user_saved_readings')
    .upsert(
      { user_id: userId, reading_id: readingId },
      { onConflict: 'user_id,reading_id' },
    )

  if (error) {
    console.log('addToLibrary error:', error.message)
    return false
  }
  return true
}

export async function removeFromLibrary(readingId: string): Promise<boolean> {
  const { data: userRes } = await supabase.auth.getUser()
  const userId = userRes?.user?.id
  if (!userId) return false

  const { error } = await supabase
    .from('user_saved_readings')
    .delete()
    .eq('user_id', userId)
    .eq('reading_id', readingId)

  if (error) {
    console.log('removeFromLibrary error:', error.message)
    return false
  }
  return true
}

export async function deleteReading(readingId: string): Promise<boolean> {
  const { error } = await supabase
    .from('readings')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', readingId)

  if (error) {
    console.log('deleteReading error:', error.message)
    return false
  }
  return true
}

export async function getReadingStructure(
  readingId: string,
): Promise<ReadingPackageV1 | null> {
  console.log(readingId)
  const filePath = `${readingId}.structure.v1.json`
  console.log(filePath)
  const { data, error } = await supabase.storage.from('readings').download(filePath)

  if (error) {
    console.log('Failed to download reading structure:', error.message)
    return null
  }

  if (!data) {
    console.log('No file data returned from storage.')
    return null
  }
  console.log('blob size: ', data.size, '\n type: ', data.type)
  // Convert Blob → text → JSON
  const text = await blobToText(data)
  const parsed = JSON.parse(text) as ReadingPackageV1

  //TODO: Standardize schemas in supabase (add future schemas here)
  const validSchemas = ['reading_structure_v1']
  if (!validSchemas.includes(parsed.schema)) {
    console.log('Invalid schema:', parsed.schema)
    return null
  }
  console.log('returned structure')
  return parsed
}
