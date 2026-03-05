export type ReadingMetadata = {
  id: string
  title: string
  genre: string
  rating: string
  body: string
}

export type ReadingSelection = {
  tokenIndices: number[]
  sentenceIndices: number[]
  spanIds: string[]
}

export interface ReadingPackageV1 {
  schema: 'reading_package_v1'
  reading_id: string
  language_code: string

  text: {
    storage_path: string
    format: 'text/plain'
    offset_unit: 'codepoint'
  }

  processor: {
    tokenizer: string
    tokenizer_version: string
    phrase_rules_version: string
  }

  blocks: {
    i: number
    type: 'paragraph'
    start: number
    end: number
  }[]

  sentences: {
    i: number
    start: number
    end: number
  }[]

  tokens: {
    i: number
    start: number
    end: number
    surface: string
    norm: string
    kind: 'word' | 'number' | 'punct' | 'symbol' | 'other'
  }[]

  spans: {
    id: string
    type: 'phrase' | 'contraction'
    start: number
    end: number
    surface: string
    token_range: [number, number]
  }[]
}
