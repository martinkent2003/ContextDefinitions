import { createContext, useContext, useMemo, useState } from "react";
import { ReadingMetadata, ReadingSelection, ReadingStructureV1 } from "@/types/readings";
import { typography } from "@/constants/Themes";

type ReadingContextType = {
  reading: ReadingMetadata | null;
  readingContent: ReadingStructureV1 | null;
  selection: ReadingSelection | null;
  handleReadingChange: (reading: ReadingMetadata) => void;
  setSelection: (sel: ReadingSelection | null) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  wordsPerPage: number;
  setWordsPerPage: (count: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
};

const seedReadingContent : ReadingStructureV1 ={
  "schema": "reading_structure_v1",
  "reading_id": "test-reading-atomic-001",
  "language_code": "en",
  "text": {
    "storage_path": "readings/test-reading-atomic-001",
    "format": "text/plain",
    "offset_unit": "codepoint"
  },
  "processor": {
    "tokenizer": "example-tokenizer",
    "tokenizer_version": "0.2.0",
    "phrase_rules_version": "0.2.0",
    "generated_at": "2026-02-18T22:30:00Z"
  },
  "blocks": [
    {
      "i": 0,
      "type": "paragraph",
      "start": 0,
      "end": 169
    }
  ],
  "sentences": [
    { "i": 0, "start": 0, "end": 41 },
    { "i": 1, "start": 42, "end": 118 },
    { "i": 2, "start": 119, "end": 169 }
  ],
  "tokens": [
    { "i": 0,  "start": 0,   "end": 3,   "surface": "You", "norm": "you", "kind": "word" },
    { "i": 1,  "start": 4,   "end": 10,  "surface": "cannot", "norm": "cannot", "kind": "word" },
    { "i": 2,  "start": 11,  "end": 14,  "surface": "put", "norm": "put", "kind": "word" },
    { "i": 3,  "start": 15,  "end": 17,  "surface": "up", "norm": "up", "kind": "word" },
    { "i": 4,  "start": 18,  "end": 22,  "surface": "with", "norm": "with", "kind": "word" },
    { "i": 5,  "start": 23,  "end": 31,  "surface": "excuses", "norm": "excuse", "kind": "word" },
    { "i": 6,  "start": 32,  "end": 39,  "surface": "forever", "norm": "forever", "kind": "word" },
    { "i": 7,  "start": 39,  "end": 40,  "surface": ".", "norm": ".", "kind": "punct" },

    { "i": 8,  "start": 42,  "end": 47,  "surface": "After", "norm": "after", "kind": "word" },
    { "i": 9,  "start": 48,  "end": 54,  "surface": "dinner", "norm": "dinner", "kind": "word" },
    { "i": 10, "start": 54,  "end": 55,  "surface": ",", "norm": ",", "kind": "punct" },
    { "i": 11, "start": 56,  "end": 58,  "surface": "we", "norm": "we", "kind": "word" },
    { "i": 12, "start": 59,  "end": 65,  "surface": "shared", "norm": "share", "kind": "word" },
    { "i": 13, "start": 66,  "end": 69,  "surface": "ice", "norm": "ice", "kind": "word" },
    { "i": 14, "start": 70,  "end": 75,  "surface": "cream", "norm": "cream", "kind": "word" },
    { "i": 15, "start": 76,  "end": 79,  "surface": "and", "norm": "and", "kind": "word" },
    { "i": 16, "start": 80,  "end": 87,  "surface": "laughed", "norm": "laugh", "kind": "word" },
    { "i": 17, "start": 88,  "end": 93,  "surface": "about", "norm": "about", "kind": "word" },
    { "i": 18, "start": 94,  "end": 99,  "surface": "small", "norm": "small", "kind": "word" },
    { "i": 19, "start": 100, "end": 108, "surface": "mistakes", "norm": "mistake", "kind": "word" },
    { "i": 20, "start": 108, "end": 109, "surface": ".", "norm": ".", "kind": "punct" },

    { "i": 21, "start": 119, "end": 121, "surface": "My", "norm": "my", "kind": "word" },
    { "i": 22, "start": 122, "end": 128, "surface": "mother", "norm": "mother", "kind": "word" },
    { "i": 23, "start": 128, "end": 129, "surface": "-", "norm": "-", "kind": "symbol" },
    { "i": 24, "start": 129, "end": 131, "surface": "in", "norm": "in", "kind": "word" },
    { "i": 25, "start": 131, "end": 132, "surface": "-", "norm": "-", "kind": "symbol" },
    { "i": 26, "start": 132, "end": 135, "surface": "law", "norm": "law", "kind": "word" },
    { "i": 27, "start": 136, "end": 144, "surface": "reminded", "norm": "remind", "kind": "word" },
    { "i": 28, "start": 145, "end": 147, "surface": "me", "norm": "me", "kind": "word" },
    { "i": 29, "start": 148, "end": 152, "surface": "that", "norm": "that", "kind": "word" },
    { "i": 30, "start": 153, "end": 159, "surface": "growth", "norm": "growth", "kind": "word" },
    { "i": 31, "start": 160, "end": 165, "surface": "takes", "norm": "take", "kind": "word" },
    { "i": 32, "start": 166, "end": 174, "surface": "patience", "norm": "patience", "kind": "word" },
    { "i": 33, "start": 174, "end": 175, "surface": ".", "norm": ".", "kind": "punct" }
  ],
  "spans": [
    {
      "id": "span-1",
      "type": "phrase",
      "start": 11,
      "end": 22,
      "surface": "put up with",
      "token_range": [2, 4]
    },
    {
      "id": "span-2",
      "type": "phrase",
      "start": 66,
      "end": 75,
      "surface": "ice cream",
      "token_range": [13, 14]
    },
    {
      "id": "span-3",
      "type": "phrase",
      "start": 122,
      "end": 135,
      "surface": "mother-in-law",
      "token_range": [22, 26]
    }
  ]
};

const ReadingContext = createContext<ReadingContextType | null>(null);

export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const [reading, setReading] = useState<ReadingMetadata | null>(null);
  const [readingContent, setReadingContent] = useState<ReadingStructureV1 | null>(seedReadingContent);
  const [selection, setSelection] = useState<ReadingSelection | null>(null);
  const [fontSize, setFontSize] = useState<number>(typography.sizes.xxxl);
  const [wordsPerPage, setWordsPerPage] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);

  function handleReadingChange(reading: ReadingMetadata) {
    setReading(reading);
    // TODO: API call to fetch reading content for reading.reading_id
    setReadingContent(seedReadingContent);
  }

  return (
    <ReadingContext.Provider value={{
      reading,
      readingContent,
      selection,
      handleReadingChange,
      setSelection,
      fontSize,
      setFontSize,
      wordsPerPage,
      setWordsPerPage,
      currentPage,
      setCurrentPage,
    }}>
      {children}
    </ReadingContext.Provider>
  );
}

export function useReading() {
  const context = useContext(ReadingContext);
  if (!context) {
    throw new Error("useReading must be used within a ReadingProvider");
  }

  const { selection, readingContent } = context;

  const selectedText = useMemo(() => {
    if (!selection || !readingContent) return null;
    const selected = readingContent.tokens
      .filter(t => selection.tokenIndices.includes(t.i))
      .sort((a, b) => a.start - b.start);
    return selected.map((t, i) => {
      const prev = selected[i - 1];
      return (prev && t.start > prev.end ? " " : "") + t.surface;
    }).join("");
  }, [selection, readingContent]);

  const sentenceText = useMemo(() => {
    if (!selection || !readingContent) return null;
    const sentIdx = selection.sentenceIndices[0];
    if (sentIdx === undefined) return null;
    const sentence = readingContent.sentences.find(s => s.i === sentIdx);
    if (!sentence) return null;
    const sentTokens = readingContent.tokens
      .filter(t => t.start >= sentence.start && t.end <= sentence.end)
      .sort((a, b) => a.start - b.start);
    return sentTokens.map((t, i) => {
      const prev = sentTokens[i - 1];
      return (prev && t.start > prev.end ? " " : "") + t.surface;
    }).join("");
  }, [selection, readingContent]);

  return { ...context, selectedText, sentenceText };
}
