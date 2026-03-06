import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js'
import type { ReadingMetadata, ReadingPackageV1 } from '@/types/readings'
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
): Promise<boolean> {
  const newReading = {
    title: title,
    genre: genre,
    language_code: 'en',
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
        content_preview
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
    .map(
      (r: any): ReadingMetadata => ({
        id: String(r.id),
        title: String(r.title ?? ''),
        genre: String(r.genre ?? ''),
        rating: String(r.difficulty ?? ''), // or "0" if you prefer
        body: String(r.content_preview ?? ''),
      }),
    )
}

export async function fetchFeedReadings(): Promise<ReadingMetadata[]> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  const userId = userRes?.user?.id

  if (userErr || !userId) {
    console.log('fetchFeedReadings auth error:', userErr?.message ?? 'No user')
    return []
  }

  const { data, error } = await supabase
    .from('readings')
    .select(
      `
      id,
      title,
      genre,
      difficulty,
      content_preview,
      user_saved_readings!left(reading_id)
    `,
    )
    .eq('visibility', 'public')
    .eq('is_deleted', false)
    .eq('status', 'processed')
    .neq('owner_id', userId) // <-- exclude my own
    .is('user_saved_readings.reading_id', null) // <-- exclude already saved
    .order('created_at', { ascending: false })
    .limit(20)

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
    }),
  )
}

export async function fetchAllAvailableReadings(): Promise<ReadingMetadata[]> {
  const [saved, feed] = await Promise.all([fetchSavedReadings(), fetchFeedReadings()])

  const map = new Map<string, ReadingMetadata>()
  for (const r of [...saved, ...feed]) map.set(r.id, r)

  return Array.from(map.values())
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
