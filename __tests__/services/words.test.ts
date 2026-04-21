/**
 * Tests for services/words.ts
 *
 * Supabase strategy: mock @/utils/supabase and return a chainable builder
 * whose `.then` makes `await chain` resolve to { data, error }.
 * `.single()` is overridden to return a resolved Promise for terminal calls.
 */
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js'

import {
  addSavedWord,
  getCachedWords,
  getDefinitionAndTranslation,
  getSavedWords,
  parseDefinition,
  parseExamples,
  removeSavedWord,
  serializeDefinition,
  serializeExamples,
  updateSavedWord,
} from '@/services/words'

// ── Supabase mock ─────────────────────────────────────────────────────────────

const mockFunctionsInvoke = jest.fn()
const mockFrom = jest.fn()

jest.mock('@/utils/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
    functions: { invoke: (...args: any[]) => mockFunctionsInvoke(...args) },
  },
}))

// ── Chain helper ──────────────────────────────────────────────────────────────

/** Builds a chainable Supabase query mock that resolves to `result` when awaited. */
function chain(result: { data: any; error: any }) {
  const c: any = {}
  for (const m of ['select', 'eq', 'upsert', 'update', 'delete', 'insert']) {
    c[m] = jest.fn().mockReturnValue(c)
  }
  // Awaiting the chain object itself resolves to `result`
  c.then = (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject)
  // .single() resolves immediately to `result`
  c.single = jest.fn().mockResolvedValue(result)
  return c
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure functions
// ─────────────────────────────────────────────────────────────────────────────

describe('parseDefinition', () => {
  it('returns plain text unchanged when not JSON', () => {
    expect(parseDefinition('a simple definition')).toBe('a simple definition')
  })

  it('formats a JSON array of strings as bullet points', () => {
    const raw = JSON.stringify(['first meaning', 'second meaning'])
    expect(parseDefinition(raw)).toBe('• first meaning\n• second meaning')
  })

  it('formats a raw string array directly', () => {
    expect(parseDefinition(['a', 'b'])).toBe('• a\n• b')
  })

  it('returns plain text when JSON parses to a non-array', () => {
    // JSON object, not array — falls through to plain text path
    const raw = JSON.stringify({ meaning: 'noun' })
    expect(parseDefinition(raw)).toBe(raw)
  })

  it('handles an empty array', () => {
    expect(parseDefinition([])).toBe('')
  })

  it('handles a single-item array', () => {
    expect(parseDefinition(['only one'])).toBe('• only one')
  })
})

describe('serializeDefinition', () => {
  it('strips bullet prefix and serializes to JSON array', () => {
    const display = '• first\n• second'
    expect(serializeDefinition(display)).toBe(JSON.stringify(['first', 'second']))
  })

  it('handles lines without bullet prefix', () => {
    expect(serializeDefinition('plain text')).toBe(JSON.stringify(['plain text']))
  })

  it('filters out blank lines', () => {
    expect(serializeDefinition('• a\n\n• b')).toBe(JSON.stringify(['a', 'b']))
  })
})

describe('parseDefinition / serializeDefinition round-trip', () => {
  it('is symmetric for array inputs', () => {
    const original = ['meaning one', 'meaning two']
    const serialized = serializeDefinition(parseDefinition(original))
    expect(JSON.parse(serialized)).toEqual(original)
  })
})

describe('parseExamples', () => {
  it('returns parsed WordExample array', () => {
    const examples = [{ text: 'Hello', translation: 'Bonjour' }]
    expect(parseExamples(JSON.stringify(examples))).toEqual(examples)
  })

  it('returns empty array for invalid JSON', () => {
    expect(parseExamples('not json')).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(parseExamples('')).toEqual([])
  })
})

describe('serializeExamples', () => {
  it('serializes WordExample array to JSON string', () => {
    const examples = [{ text: 'Hi', translation: 'Salut' }]
    expect(serializeExamples(examples)).toBe(JSON.stringify(examples))
  })

  it('serializes empty array', () => {
    expect(serializeExamples([])).toBe('[]')
  })
})

describe('parseExamples / serializeExamples round-trip', () => {
  it('is symmetric', () => {
    const original = [
      { text: 'Hello world', translation: 'Bonjour monde' },
      { text: 'Good night' },
    ]
    expect(parseExamples(serializeExamples(original))).toEqual(original)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Supabase CRUD
// ─────────────────────────────────────────────────────────────────────────────

describe('getCachedWords', () => {
  it('returns data array on success', async () => {
    const words = [
      {
        selection: 'bonjour',
        definition: '• hello',
        translation: 'hello',
        selection_start: 0,
        selection_end: 7,
        part_of_speech: 'noun',
        examples: '[]',
      },
    ]
    mockFrom.mockReturnValue(chain({ data: words, error: null }))

    const result = await getCachedWords('reading-1', 'en')

    expect(mockFrom).toHaveBeenCalledWith('words_lookup_cache')
    expect(result).toEqual(words)
  })

  it('returns empty array on Supabase error', async () => {
    mockFrom.mockReturnValue(chain({ data: null, error: { message: 'DB error' } }))

    const result = await getCachedWords('reading-1', 'en')
    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    mockFrom.mockReturnValue(chain({ data: null, error: null }))
    expect(await getCachedWords('reading-1', 'en')).toEqual([])
  })
})

describe('getSavedWords', () => {
  it('returns saved word rows on success', async () => {
    const rows = [
      {
        id: 'w-1',
        selection: 'hello',
        definition: '• greeting',
        translation: 'bonjour',
        context: 'Hello world',
        selection_start: 0,
        selection_end: 5,
        part_of_speech: null,
        examples: '[]',
      },
    ]
    mockFrom.mockReturnValue(chain({ data: rows, error: null }))

    const result = await getSavedWords('reading-1', 'user-1', 'en')

    expect(mockFrom).toHaveBeenCalledWith('words_saved')
    expect(result).toEqual(rows)
  })

  it('returns empty array on error', async () => {
    mockFrom.mockReturnValue(chain({ data: null, error: { message: 'fail' } }))
    expect(await getSavedWords('reading-1', 'user-1', 'en')).toEqual([])
  })
})

describe('addSavedWord', () => {
  const params = {
    readingId: 'r-1',
    userId: 'u-1',
    nativeLanguage: 'en',
    selection: 'bonjour',
    context: 'Bonjour monde',
    definition: '• hello',
    translation: 'hello',
    selection_start: 0,
    selection_end: 7,
    part_of_speech: 'noun' as string | null,
    examples: '[]',
  }

  it('returns the new word id on success', async () => {
    mockFrom.mockReturnValue(chain({ data: { id: 'new-word-id' }, error: null }))

    const result = await addSavedWord(params)
    expect(result).toEqual({ id: 'new-word-id' })
  })

  it('throws on Supabase error', async () => {
    const err = new Error('upsert failed')
    mockFrom.mockReturnValue(chain({ data: null, error: err }))

    await expect(addSavedWord(params)).rejects.toThrow('upsert failed')
  })
})

describe('updateSavedWord', () => {
  it('resolves without throwing on success', async () => {
    mockFrom.mockReturnValue(chain({ data: null, error: null }))
    await expect(
      updateSavedWord('w-1', {
        definition: 'new def',
        translation: 'new trans',
        context: 'ctx',
      }),
    ).resolves.toBeUndefined()
  })

  it('throws on Supabase error', async () => {
    const err = new Error('update failed')
    mockFrom.mockReturnValue(chain({ data: null, error: err }))
    await expect(
      updateSavedWord('w-1', { definition: 'd', translation: 't', context: 'c' }),
    ).rejects.toThrow('update failed')
  })
})

describe('removeSavedWord', () => {
  it('resolves without throwing on success', async () => {
    mockFrom.mockReturnValue(chain({ data: null, error: null }))
    await expect(removeSavedWord('w-1')).resolves.toBeUndefined()
  })

  it('throws on Supabase error', async () => {
    const err = new Error('delete failed')
    mockFrom.mockReturnValue(chain({ data: null, error: err }))
    await expect(removeSavedWord('w-1')).rejects.toThrow('delete failed')
  })
})

describe('getDefinitionAndTranslation', () => {
  const params = {
    selection: 'bonjour',
    context: 'Bonjour monde',
    language: 'French',
    language_code: 'fr',
    reading_id: 'r-1',
    selection_start: 0,
    selection_end: 7,
  }

  it('returns parsed definition, translation, pos, examples on success', async () => {
    const rawData = {
      definition: JSON.stringify(['greeting']),
      translation: 'hello',
      part_of_speech: 'noun',
      examples: [{ text: 'Bonjour monde', translation: 'Hello world' }],
    }
    mockFunctionsInvoke.mockResolvedValue({ data: rawData, error: null })

    const result = await getDefinitionAndTranslation(params)

    expect(mockFunctionsInvoke).toHaveBeenCalledWith('defintion-translation', {
      body: params,
    })
    expect(result.definition).toBe('• greeting')
    expect(result.translation).toBe('hello')
    expect(result.part_of_speech).toBe('noun')
    expect(result.examples).toEqual(rawData.examples)
  })

  it('defaults missing fields: empty definition, empty translation, null pos, empty examples', async () => {
    mockFunctionsInvoke.mockResolvedValue({ data: {}, error: null })

    const result = await getDefinitionAndTranslation(params)
    expect(result.definition).toBe('')
    expect(result.translation).toBe('')
    expect(result.part_of_speech).toBeNull()
    expect(result.examples).toEqual([])
  })

  it('throws a descriptive error on FunctionsHttpError', async () => {
    const httpErr = new FunctionsHttpError(
      new Response(JSON.stringify({ error: 'bad request', detail: 'missing field' }), {
        status: 400,
      }),
    )
    mockFunctionsInvoke.mockResolvedValue({ data: null, error: httpErr })

    await expect(getDefinitionAndTranslation(params)).rejects.toThrow()
  })

  it('rethrows FunctionsRelayError', async () => {
    const relayErr = new FunctionsRelayError({ error: 'relay down' })
    mockFunctionsInvoke.mockResolvedValue({ data: null, error: relayErr })

    await expect(getDefinitionAndTranslation(params)).rejects.toBe(relayErr)
  })

  it('rethrows FunctionsFetchError', async () => {
    const fetchErr = new FunctionsFetchError(new Error('network'))
    mockFunctionsInvoke.mockResolvedValue({ data: null, error: fetchErr })

    await expect(getDefinitionAndTranslation(params)).rejects.toBe(fetchErr)
  })
})
