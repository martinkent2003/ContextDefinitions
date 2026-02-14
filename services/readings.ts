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
    .order("last_accessed", { ascending: false })
    .limit(20);

  if (error) {
    console.log("fetchSavedReadings error:", error.message);
    return [];
  }

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

export async function fetchFeedReadings(): Promise<ReadingMetadata[]> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  const userId = userRes?.user?.id;

  if (userErr || !userId) {
    console.log("fetchFeedReadings auth error:", userErr?.message ?? "No user");
    return [];
  }

  const { data, error } = await supabase
    .from("readings")
    .select(`
      id,
      title,
      genre,
      difficulty,
      content_preview,
      user_saved_readings!left(reading_id)
    `)
    .eq("visibility", "public")
    .eq("is_deleted", false)
    .eq("status", "processed")
    .neq("owner_id", userId)                 // <-- exclude my own
    .is("user_saved_readings.reading_id", null) // <-- exclude already saved
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.log("fetchFeedReadings error:", error.message);
    return [];
  }

  return (data ?? []).map((r: any): ReadingMetadata => ({
    id: String(r.id),
    title: String(r.title ?? ""),
    genre: String(r.genre ?? ""),
    rating: String(r.difficulty ?? ""),
    body: String(r.content_preview ?? ""),
  }));
}

export async function fetchAllAvailableReadings(): Promise<ReadingMetadata[]> {
  const [saved, feed] = await Promise.all([fetchSavedReadings(), fetchFeedReadings()]);

  const map = new Map<string, ReadingMetadata>();
  for (const r of [...saved, ...feed]) map.set(r.id, r);

  return Array.from(map.values());
}