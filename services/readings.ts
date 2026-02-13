import { ReadingMetadata } from '@/types/readings';
import { supabase } from '../utils/supabase';
import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from "@supabase/supabase-js";

export async function uploadReading(content: string, title: string, genre: string, privacy: boolean) {
    const newReading = {
        title: title,
        genre: genre,
        language_code: "en",
        visibility: privacy ? "private" : "public",
        content: content,
    };

    const { data, error } = await supabase.functions.invoke('create-reading', {
    body: JSON.stringify(newReading)
    })
    if (error instanceof FunctionsHttpError) {
        const errorMessage = await error.context.json()
        console.log('Function returned an error', errorMessage)
    } else if (error instanceof FunctionsRelayError) {
        console.log('Relay error:', error.message)
    } else if (error instanceof FunctionsFetchError) {
        console.log('Fetch error:', error.message)
    } else {
        console.log(data)
    }
}

export async function fetchSavedReadings(): Promise<ReadingMetadata[]> {
  const { data, error } = await supabase
    .from("user_saved_readings")
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
    .order("last_accessed", { ascending: false });

  if (error) {
    console.log("fetchSavedReadings error:", error.message);
    return [];
  }

  console.log(data)
  
  return (data ?? [])
    .map((row: any) => row.readings)
    .filter(Boolean)
    .map((r: any): ReadingMetadata => ({
      id: String(r.id),
      title: String(r.title ?? ""),
      genre: String(r.genre ?? ""),
      rating: String(r.difficulty ?? ""), // or "0" if you prefer
      body: String(r.content_preview ?? ""),
    }));
}