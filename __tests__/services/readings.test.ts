/**
 * Tests for services/readings.ts
 *
 * Mocks:
 *  - @utils/supabase — auth.getUser, from(), storage.from(), functions.invoke()
 *  - global FileReader — for blobToText (used inside getReadingStructure)
 *
 * Key behaviors tested:
 *  - fetchSavedReadings — join query, maps raw rows to ReadingMetadata
 *  - fetchFeedReadings  — sort variants, interests path, auth guard
 *  - fetchAllAvailableReadings — deduplication, sort pass-through
 *  - searchReadings     — feed (Supabase) vs private (local filter)
 *  - addToLibrary / removeFromLibrary — auth guard, upsert/delete
 *  - getReadingStructure — blob download, schema validation
 */
import {
  addToLibrary,
  fetchAllAvailableReadings,
  fetchFeedReadings,
  fetchSavedReadings,
  getReadingStructure,
  removeFromLibrary,
  searchReadings,
  uploadReading,
} from '@/services/readings'

// ── Supabase mock ─────────────────────────────────────────────────────────────

const mockGetUser = jest.fn()
const mockFunctionsInvoke = jest.fn()
const mockStorageDownload = jest.fn()
const mockStorageFrom = jest.fn()
const mockRpc = jest.fn()
const mockFrom = jest.fn()

jest.mock('@utils/supabase', () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    from: (...args: any[]) => mockFrom(...args),
    storage: { from: (...args: any[]) => mockStorageFrom(...args) },
    functions: { invoke: (...args: any[]) => mockFunctionsInvoke(...args) },
    rpc: (...args: any[]) => mockRpc(...args),
  },
}))

// ── Chain helper ──────────────────────────────────────────────────────────────

function chain(result: { data: any; error: any }) {
  const c: any = {}
  for (const m of [
    'select',
    'eq',
    'neq',
    'order',
    'limit',
    'upsert',
    'delete',
    'or',
    'is',
    'range',
    'filter',
  ]) {
    c[m] = jest.fn().mockReturnValue(c)
  }
  c.then = (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject)
  c.single = jest.fn().mockResolvedValue(result)
  return c
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRawRow(overrides: Record<string, any> = {}) {
  return {
    id: 'r-1',
    title: 'Test Reading',
    genre: 'Fiction',
    difficulty: '3',
    content_preview: 'Once upon a time...',
    owner_id: 'owner-1',
    visibility: 'public',
    ...overrides,
  }
}

function userResult(id = 'u-1') {
  return { data: { user: { id } }, error: null }
}

function noUserResult() {
  return { data: { user: null }, error: { message: 'Not authenticated' } }
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// uploadReading
// ─────────────────────────────────────────────────────────────────────────────

describe('uploadReading', () => {
  it('returns true on success', async () => {
    mockFunctionsInvoke.mockResolvedValue({ data: { id: 'r-new' }, error: null })

    const result = await uploadReading('content', 'Title', 'Fiction', false, 'en')
    expect(result).toBe(true)
    expect(mockFunctionsInvoke).toHaveBeenCalledWith('create-reading', expect.any(Object))
  })

  it('returns false on FunctionsHttpError', async () => {
    const { FunctionsHttpError } = require('@supabase/supabase-js')
    const httpErr = new FunctionsHttpError(
      new Response(JSON.stringify({ error: 'bad input' }), { status: 400 }),
    )
    mockFunctionsInvoke.mockResolvedValue({ data: null, error: httpErr })

    expect(await uploadReading('c', 't', 'g', false, 'en')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// fetchSavedReadings
// ─────────────────────────────────────────────────────────────────────────────

describe('fetchSavedReadings', () => {
  it('returns empty array when not authenticated', async () => {
    mockGetUser.mockResolvedValue(noUserResult())

    const result = await fetchSavedReadings()
    expect(result).toEqual([])
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('queries user_saved_readings and maps rows to ReadingMetadata', async () => {
    mockGetUser.mockResolvedValue(userResult())
    const raw = makeRawRow()
    mockFrom.mockReturnValue(chain({ data: [{ readings: raw }], error: null }))

    const result = await fetchSavedReadings()

    expect(mockFrom).toHaveBeenCalledWith('user_saved_readings')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'r-1',
      title: 'Test Reading',
      genre: 'Fiction',
      isInLibrary: true,
    })
  })

  it('filters out null readings rows', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(
      chain({ data: [{ readings: makeRawRow() }, { readings: null }], error: null }),
    )

    const result = await fetchSavedReadings()
    expect(result).toHaveLength(1)
  })

  it('returns empty array on Supabase query error', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(chain({ data: null, error: { message: 'DB error' } }))

    expect(await fetchSavedReadings()).toEqual([])
  })

  it('maps visibility correctly', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(
      chain({ data: [{ readings: makeRawRow({ visibility: 'private' }) }], error: null }),
    )

    const [r] = await fetchSavedReadings()
    expect(r.visibility).toBe('private')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// fetchFeedReadings
// ─────────────────────────────────────────────────────────────────────────────

describe('fetchFeedReadings', () => {
  it('calls personal-feed Edge Function for sort=interests', async () => {
    mockFunctionsInvoke.mockResolvedValue({
      data: [makeRawRow({ isInLibrary: false })],
      error: null,
    })

    const result = await fetchFeedReadings('interests')

    expect(mockFunctionsInvoke).toHaveBeenCalledWith(
      expect.stringContaining('personal-feed'),
      expect.any(Object),
    )
    expect(result).toHaveLength(1)
    expect(result[0].isInLibrary).toBe(false)
  })

  it('returns empty array when interests call errors', async () => {
    mockFunctionsInvoke.mockResolvedValue({ data: null, error: { message: 'fail' } })
    expect(await fetchFeedReadings('interests')).toEqual([])
  })

  it('returns empty array when not authenticated (non-interests)', async () => {
    mockGetUser.mockResolvedValue(noUserResult())
    expect(await fetchFeedReadings('recent')).toEqual([])
  })

  it('queries readings table with ascending=false for recent', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(chain({ data: [makeRawRow()], error: null }))

    await fetchFeedReadings('recent')

    expect(mockFrom).toHaveBeenCalledWith('readings')
    // order called with created_at, ascending: false
    const queryChain = mockFrom.mock.results[0].value
    expect(queryChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('orders by difficulty ascending for easiest', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(chain({ data: [], error: null }))

    await fetchFeedReadings('easiest')

    const queryChain = mockFrom.mock.results[0].value
    expect(queryChain.order).toHaveBeenCalledWith('difficulty', { ascending: true })
  })

  it('orders by difficulty descending for hardest', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(chain({ data: [], error: null }))

    await fetchFeedReadings('hardest')

    const queryChain = mockFrom.mock.results[0].value
    expect(queryChain.order).toHaveBeenCalledWith('difficulty', { ascending: false })
  })

  it('sets isInLibrary: false on all returned readings', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(
      chain({ data: [makeRawRow(), makeRawRow({ id: 'r-2' })], error: null }),
    )

    const results = await fetchFeedReadings('recent')
    expect(results.every((r) => r.isInLibrary === false)).toBe(true)
  })

  it('returns empty array on query error', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(chain({ data: null, error: { message: 'fail' } }))
    expect(await fetchFeedReadings('recent')).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// fetchAllAvailableReadings
// ─────────────────────────────────────────────────────────────────────────────

describe('fetchAllAvailableReadings', () => {
  it('delegates to fetchFeedReadings for interests sort', async () => {
    mockFunctionsInvoke.mockResolvedValue({ data: [makeRawRow()], error: null })

    const result = await fetchAllAvailableReadings('interests')
    expect(mockFunctionsInvoke).toHaveBeenCalledWith(
      expect.stringContaining('personal-feed'),
      expect.any(Object),
    )
    expect(result).toHaveLength(1)
  })

  it('deduplicates readings with the same id from saved + feed', async () => {
    mockGetUser.mockResolvedValue(userResult())

    // Both saved and feed return the same reading id
    const savedRow = { readings: makeRawRow({ id: 'r-dup' }) }
    const feedRow = makeRawRow({ id: 'r-dup' })

    mockFrom
      .mockReturnValueOnce(chain({ data: [savedRow], error: null })) // fetchSavedReadings
      .mockReturnValueOnce(chain({ data: [feedRow], error: null })) // fetchFeedReadings

    const result = await fetchAllAvailableReadings('recent')
    // Deduplicated — only one entry with id 'r-dup'
    expect(result.filter((r) => r.id === 'r-dup')).toHaveLength(1)
  })

  it('sorts easiest results ascending by rating', async () => {
    mockGetUser.mockResolvedValue(userResult())

    mockFrom.mockReturnValueOnce(chain({ data: [], error: null })).mockReturnValueOnce(
      chain({
        data: [
          makeRawRow({ id: 'hard', difficulty: '5' }),
          makeRawRow({ id: 'easy', difficulty: '1' }),
        ],
        error: null,
      }),
    )

    const result = await fetchAllAvailableReadings('easiest')
    expect(result[0].rating).toBe('1')
    expect(result[1].rating).toBe('5')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// searchReadings
// ─────────────────────────────────────────────────────────────────────────────

describe('searchReadings — feed scope', () => {
  it('queries Supabase with ilike filter and returns results', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(chain({ data: [makeRawRow()], error: null }))

    const result = await searchReadings('fiction', 'feed')

    expect(mockFrom).toHaveBeenCalledWith('readings')
    const c = mockFrom.mock.results[0].value
    expect(c.or).toHaveBeenCalledWith(expect.stringContaining('fiction'))
    expect(result).toHaveLength(1)
  })

  it('returns empty array when not authenticated', async () => {
    mockGetUser.mockResolvedValue(noUserResult())
    expect(await searchReadings('query', 'feed')).toEqual([])
  })

  it('returns empty array on Supabase error', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(chain({ data: null, error: { message: 'fail' } }))
    expect(await searchReadings('q', 'feed')).toEqual([])
  })
})

describe('searchReadings — private scope', () => {
  it('filters saved readings locally without calling Supabase search', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(
      chain({
        data: [
          {
            readings: makeRawRow({
              id: 'r-1',
              title: 'French Basics',
              genre: 'Education',
            }),
          },
          {
            readings: makeRawRow({
              id: 'r-2',
              title: 'Spanish Poetry',
              genre: 'Literature',
            }),
          },
        ],
        error: null,
      }),
    )

    const result = await searchReadings('french', 'private')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('French Basics')
  })

  it('matches on genre case-insensitively', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(
      chain({
        data: [
          { readings: makeRawRow({ id: 'r-1', title: 'Some Title', genre: 'FICTION' }) },
        ],
        error: null,
      }),
    )

    const result = await searchReadings('fiction', 'private')
    expect(result).toHaveLength(1)
  })

  it('returns empty when no match', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(
      chain({
        data: [{ readings: makeRawRow({ title: 'Math Primer', genre: 'Education' }) }],
        error: null,
      }),
    )

    expect(await searchReadings('french', 'private')).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// addToLibrary
// ─────────────────────────────────────────────────────────────────────────────

describe('addToLibrary', () => {
  it('upserts to user_saved_readings and returns true on success', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(chain({ data: null, error: null }))

    expect(await addToLibrary('r-1')).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('user_saved_readings')
  })

  it('returns false when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    expect(await addToLibrary('r-1')).toBe(false)
  })

  it('returns false on Supabase error', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(chain({ data: null, error: { message: 'fail' } }))
    expect(await addToLibrary('r-1')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// removeFromLibrary
// ─────────────────────────────────────────────────────────────────────────────

describe('removeFromLibrary', () => {
  it('deletes from user_saved_readings and returns true on success', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(chain({ data: null, error: null }))

    expect(await removeFromLibrary('r-1')).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('user_saved_readings')
  })

  it('returns false when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    expect(await removeFromLibrary('r-1')).toBe(false)
  })

  it('returns false on Supabase error', async () => {
    mockGetUser.mockResolvedValue(userResult())
    mockFrom.mockReturnValue(chain({ data: null, error: { message: 'fail' } }))
    expect(await removeFromLibrary('r-1')).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// getReadingStructure
// ─────────────────────────────────────────────────────────────────────────────

describe('getReadingStructure', () => {
  function makeValidStructure() {
    return { schema: 'reading_structure_v1', tokens: [], sentences: [] }
  }

  function setupStorageMock(blobText: string | null, error: any = null) {
    const mockBlob = blobText !== null ? new Blob([blobText]) : null
    mockStorageFrom.mockReturnValue({
      download: mockStorageDownload.mockResolvedValue({ data: mockBlob, error }),
    })

    // Mock FileReader for the blobToText utility
    if (blobText !== null) {
      ;(global as any).FileReader = jest.fn().mockImplementation(() => {
        const reader: any = {
          readAsText: jest.fn().mockImplementation(function () {
            // Trigger onloadend asynchronously
            setTimeout(() => reader.onloadend?.(), 0)
          }),
          result: blobText,
          onloadend: null,
          onerror: null,
        }
        return reader
      })
    }
  }

  afterEach(() => {
    delete (global as any).FileReader
  })

  it('downloads from readings storage bucket with correct file path', async () => {
    setupStorageMock(JSON.stringify(makeValidStructure()))

    await getReadingStructure('r-123')

    expect(mockStorageFrom).toHaveBeenCalledWith('readings')
    expect(mockStorageDownload).toHaveBeenCalledWith('r-123.structure.v1.json')
  })

  it('returns null on storage download error', async () => {
    setupStorageMock(null, { message: 'Not found' })

    const result = await getReadingStructure('r-123')
    expect(result).toBeNull()
  })

  it('returns null when data blob is null', async () => {
    mockStorageFrom.mockReturnValue({
      download: mockStorageDownload.mockResolvedValue({ data: null, error: null }),
    })

    const result = await getReadingStructure('r-123')
    expect(result).toBeNull()
  })

  it('returns null for unrecognized schema versions', async () => {
    const badStructure = { schema: 'unknown_v99', tokens: [], sentences: [] }
    setupStorageMock(JSON.stringify(badStructure))

    const result = await getReadingStructure('r-123')
    expect(result).toBeNull()
  })

  it('parses and returns valid reading structure', async () => {
    const structure = makeValidStructure()
    setupStorageMock(JSON.stringify(structure))

    const result = await getReadingStructure('r-123')
    expect(result).toEqual(structure)
  })
})
