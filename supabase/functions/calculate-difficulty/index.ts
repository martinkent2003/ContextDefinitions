import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/*
v1.0 (current) - Classic readability: single scalar difficulty score derived
from Flesch–Kincaid Grade Level. Works only for English text. Normalized 0-100

Ideal version: more nuanced difficulty score, compatible with all languages the app supports
*/

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("TEMP_READINGS_DIFFICULTY_WEBHOOK_SECRET")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function countSyllables(word: string): number {
  const w = word
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .trim();

  if (!w) return 0;
  if (w.length <= 3) return 1;

  const noSilentE = w.replace(/e\b/, "");
  const vowelGroups = noSilentE.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  if (/(ia|io|eo)$/.test(w)) count += 1;
  if (/(tion|sion)$/.test(w)) count -= 1;

  return Math.max(1, count);
}

function tokenizeSentences(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return sentences.length ? sentences : [text.trim()].filter(Boolean);
}

function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
}

function computeDifficultyScore(text: string): number {
  const sentences = tokenizeSentences(text);
  const words = tokenizeWords(text);

  const sentenceCount = sentences.length || 1;
  const wordCount = words.length || 1;

  let syllableCount = 0;
  for (const w of words) syllableCount += countSyllables(w);

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;

  // Flesch–Kincaid Grade Level
  const fleschKincaidGrade =
    0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  // Normalize: 0 = easy, 100 = hard (cap at grade 22)
  return Math.min(100, Math.max(0, (fleschKincaidGrade / 30) * 100));
}

Deno.serve(async (req) => {
  try {
    /* --- Authenticate caller (DB trigger) --- */
    const secret = req.headers.get("x-webhook-secret");
    if (!secret || secret !== WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const { reading_id, content } = await req.json();

    if (
      typeof reading_id !== "string" ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      throw new Error("Invalid payload: expected reading_id and non-empty content");
    }

    const difficulty = computeDifficultyScore(content);

    const { error } = await supabase
      .from("temp_readings")
      .update({
        difficulty: Math.round(difficulty),
        status: "complete",
      })
      .eq("id", reading_id);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        ok: true,
        difficulty, // 0 (easy) → 100 (hard)
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    /* Best-effort failure update */
    try {
      const body = await req.clone().json();
      if (body?.reading_id) {
        await supabase
          .from("temp_readings")
          .update({
            status: "failed",
          })
          .eq("id", body.reading_id);
      }
    } catch (_) {}

    return new Response(
      JSON.stringify({
        ok: false,
        detail: String(err?.message ?? err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
