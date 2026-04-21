/**
 * Tests for services/readingCache.ts — ReadingCacheService
 *
 * Strategy: mock expo-sqlite's openDatabaseAsync to return a fake DB object
 * whose methods (getFirstAsync, runAsync, getAllAsync, execAsync,
 * withTransactionAsync) are jest.fn(). This lets us test the service's logic
 * (SQL queries, LRU eviction, JSON serialization) without a real SQLite engine.
 *
 * Platform.OS is mocked per describe block to test the web no-op path.
 */
import { Platform } from 'react-native'

// ─────────────────────────────────────────────────────────────────────────────
// Import AFTER mocks are registered
// ─────────────────────────────────────────────────────────────────────────────

import { readingCacheService } from '@/services/readingCache'
import type { ReadingPackageV1 } from '@/types/readings'
import type { CachedWord, SavedWordRow } from '@/types/words'

// ── SQLite mock ───────────────────────────────────────────────────────────────

const mockExecAsync = jest.fn().mockResolvedValue(undefined)
const mockRunAsync = jest.fn().mockResolvedValue(undefined)
const mockGetFirstAsync = jest.fn()
const mockGetAllAsync = jest.fn()
const mockWithTransactionAsync = jest
  .fn()
  .mockImplementation(async (fn: () => Promise<void>) => fn())

const mockDb = {
  execAsync: mockExecAsync,
  runAsync: mockRunAsync,
  getFirstAsync: mockGetFirstAsync,
  getAllAsync: mockGetAllAsync,
  withTransactionAsync: mockWithTransactionAsync,
}

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockImplementation(() => Promise.resolve(mockDb)),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeStructure(): ReadingPackageV1 {
  return {
    schemaVersion: 1,
    tokens: [],
    sentences: [],
  } as unknown as ReadingPackageV1
}

function makeCachedWords(): CachedWord[] {
  return [
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
}

function makeSavedWordRows(): SavedWordRow[] {
  return [
    {
      id: 'w-1',
      selection: 'bonjour',
      definition: '• hello',
      translation: 'hello',
      context: 'Bonjour monde',
      selection_start: 0,
      selection_end: 7,
      part_of_speech: null,
      examples: '[]',
    },
  ]
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  // Simulate the service being initialized (db set) by running initialize()
  // We control the platform via jest.replaceProperty in each describe block
})

// ─────────────────────────────────────────────────────────────────────────────
// Web platform — all methods should be no-ops
// ─────────────────────────────────────────────────────────────────────────────

describe('ReadingCacheService — web platform (no-op)', () => {
  beforeEach(async () => {
    jest.replaceProperty(Platform, 'OS', 'web')
    // Re-initialize so the service respects the platform flag
    // On web, initialize() returns early without setting this.db
    await readingCacheService.initialize()
  })

  it('getStructure returns null', async () => {
    expect(await readingCacheService.getStructure('r-1')).toBeNull()
  })

  it('setStructure does nothing', async () => {
    await readingCacheService.setStructure('r-1', makeStructure())
    expect(mockRunAsync).not.toHaveBeenCalled()
  })

  it('getCachedWords returns null', async () => {
    expect(await readingCacheService.getCachedWords('r-1', 'en')).toBeNull()
  })

  it('setCachedWords does nothing', async () => {
    await readingCacheService.setCachedWords('r-1', 'en', makeCachedWords())
    expect(mockRunAsync).not.toHaveBeenCalled()
  })

  it('getSavedWords returns null', async () => {
    expect(await readingCacheService.getSavedWords('r-1', 'u-1', 'en')).toBeNull()
  })

  it('setSavedWords does nothing', async () => {
    await readingCacheService.setSavedWords('r-1', 'u-1', 'en', makeSavedWordRows())
    expect(mockRunAsync).not.toHaveBeenCalled()
  })

  it('getCachedReadingIds returns []', async () => {
    expect(await readingCacheService.getCachedReadingIds()).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Native platform
// ─────────────────────────────────────────────────────────────────────────────

describe('ReadingCacheService — native platform', () => {
  beforeEach(async () => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    jest.clearAllMocks()
    mockWithTransactionAsync.mockImplementation(async (fn: () => Promise<void>) => fn())
    await readingCacheService.initialize()
  })

  // ── getStructure ─────────────────────────────────────────────────────────

  describe('getStructure', () => {
    it('returns null on cache miss', async () => {
      mockGetFirstAsync.mockResolvedValueOnce(null)
      expect(await readingCacheService.getStructure('r-1')).toBeNull()
    })

    it('parses and returns structure JSON on cache hit', async () => {
      const structure = makeStructure()
      mockGetFirstAsync.mockResolvedValueOnce({
        structure_json: JSON.stringify(structure),
      })

      const result = await readingCacheService.getStructure('r-1')
      expect(result).toEqual(structure)
    })

    it('updates last_accessed on cache hit', async () => {
      mockGetFirstAsync.mockResolvedValueOnce({
        structure_json: JSON.stringify(makeStructure()),
      })
      await readingCacheService.getStructure('r-1')

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reading_structure_cache SET last_accessed'),
        expect.arrayContaining(['r-1']),
      )
    })

    it('does not call runAsync on cache miss', async () => {
      mockGetFirstAsync.mockResolvedValueOnce(null)
      await readingCacheService.getStructure('r-1')
      expect(mockRunAsync).not.toHaveBeenCalled()
    })
  })

  // ── setStructure ─────────────────────────────────────────────────────────

  describe('setStructure', () => {
    it('inserts the structure as JSON', async () => {
      // evictIfNeeded: count = 1, under limit
      mockGetFirstAsync.mockResolvedValueOnce({ count: 1 })

      await readingCacheService.setStructure('r-1', makeStructure())

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO reading_structure_cache'),
        expect.arrayContaining(['r-1']),
      )
    })

    it('triggers LRU eviction when count exceeds MAX_CACHED_READINGS (5)', async () => {
      // count = 6, over limit → evict
      mockGetFirstAsync
        .mockResolvedValueOnce({ count: 6 }) // COUNT query
        .mockResolvedValueOnce({ reading_id: 'oldest-r' }) // oldest query

      await readingCacheService.setStructure('r-new', makeStructure())

      // Should delete from all 3 tables for oldest reading
      const deleteCallArgs = mockRunAsync.mock.calls
        .map((c) => c[0] as string)
        .filter((sql) => sql.includes('DELETE'))

      expect(deleteCallArgs.some((sql) => sql.includes('reading_structure_cache'))).toBe(
        true,
      )
      expect(deleteCallArgs.some((sql) => sql.includes('cached_words_cache'))).toBe(true)
      expect(deleteCallArgs.some((sql) => sql.includes('saved_words_cache'))).toBe(true)
    })

    it('does not evict when count is exactly at the limit (5)', async () => {
      mockGetFirstAsync.mockResolvedValueOnce({ count: 5 })

      await readingCacheService.setStructure('r-1', makeStructure())

      const deleteCalls = mockRunAsync.mock.calls.filter((c) =>
        (c[0] as string).includes('DELETE'),
      )
      expect(deleteCalls).toHaveLength(0)
    })
  })

  // ── getCachedWords / setCachedWords ───────────────────────────────────────

  describe('getCachedWords', () => {
    it('returns null on miss', async () => {
      mockGetFirstAsync.mockResolvedValueOnce(null)
      expect(await readingCacheService.getCachedWords('r-1', 'en')).toBeNull()
    })

    it('parses and returns words JSON on hit', async () => {
      const words = makeCachedWords()
      mockGetFirstAsync.mockResolvedValueOnce({ words_json: JSON.stringify(words) })

      const result = await readingCacheService.getCachedWords('r-1', 'en')
      expect(result).toEqual(words)
    })

    it('updates last_accessed on hit', async () => {
      mockGetFirstAsync.mockResolvedValueOnce({ words_json: '[]' })
      await readingCacheService.getCachedWords('r-1', 'en')

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE cached_words_cache SET last_accessed'),
        expect.arrayContaining(['r-1', 'en']),
      )
    })
  })

  describe('setCachedWords', () => {
    it('inserts words as JSON', async () => {
      await readingCacheService.setCachedWords('r-1', 'en', makeCachedWords())

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO cached_words_cache'),
        expect.arrayContaining(['r-1', 'en']),
      )
    })
  })

  // ── getSavedWords / setSavedWords ─────────────────────────────────────────

  describe('getSavedWords', () => {
    it('returns null on miss', async () => {
      mockGetFirstAsync.mockResolvedValueOnce(null)
      expect(await readingCacheService.getSavedWords('r-1', 'u-1', 'en')).toBeNull()
    })

    it('parses and returns rows JSON on hit', async () => {
      const rows = makeSavedWordRows()
      mockGetFirstAsync.mockResolvedValueOnce({ rows_json: JSON.stringify(rows) })

      const result = await readingCacheService.getSavedWords('r-1', 'u-1', 'en')
      expect(result).toEqual(rows)
    })
  })

  describe('setSavedWords', () => {
    it('inserts rows as JSON', async () => {
      await readingCacheService.setSavedWords('r-1', 'u-1', 'en', makeSavedWordRows())

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO saved_words_cache'),
        expect.arrayContaining(['r-1', 'u-1', 'en']),
      )
    })
  })

  // ── invalidateSavedWords ──────────────────────────────────────────────────

  describe('invalidateSavedWords', () => {
    it('deletes from saved_words_cache for the given reading/user/lang', async () => {
      await readingCacheService.invalidateSavedWords('r-1', 'u-1', 'en')

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM saved_words_cache'),
        expect.arrayContaining(['r-1', 'u-1', 'en']),
      )
    })
  })

  // ── getCachedReadingIds ───────────────────────────────────────────────────

  describe('getCachedReadingIds', () => {
    it('returns reading IDs ordered by last_accessed DESC', async () => {
      mockGetAllAsync.mockResolvedValueOnce([
        { reading_id: 'r-recent' },
        { reading_id: 'r-older' },
      ])

      const ids = await readingCacheService.getCachedReadingIds()

      expect(ids).toEqual(['r-recent', 'r-older'])
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY last_accessed DESC'),
      )
    })

    it('returns empty array when no readings cached', async () => {
      mockGetAllAsync.mockResolvedValueOnce([])
      expect(await readingCacheService.getCachedReadingIds()).toEqual([])
    })
  })
})
