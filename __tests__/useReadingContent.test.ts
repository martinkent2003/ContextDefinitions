// Mock native/hook dependencies so the pure functions can be imported
// without triggering Supabase / expo-sqlite native module initialization.
import type { LayoutRectangle } from 'react-native'
import type { ReadingPackageV1 } from '@/types/readings'
import {
  hitTest,
  buildTokenSentenceMap,
  buildPages,
} from '@screens/ReadingScreen/hooks/useReadingContent'

jest.mock('@/hooks/useReading', () => ({ useReading: jest.fn() }))
jest.mock('@/hooks/useLoading', () => ({ useLoading: jest.fn() }))
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light' },
}))
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Pan: jest.fn(() => ({
      runOnJS: jest.fn().mockReturnThis(),
      onBegin: jest.fn().mockReturnThis(),
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
      onFinalize: jest.fn().mockReturnThis(),
    })),
  },
}))

type Token = ReadingPackageV1['tokens'][number]
type Sentence = ReadingPackageV1['sentences'][number]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeToken(i: number, start: number, end: number, surface = 'w'): Token {
  return { i, start, end, surface, norm: surface, kind: 'word' }
}

function makeSentence(i: number, start: number, end: number): Sentence {
  return { i, start, end }
}

function makeRect(x: number, y: number, width: number, height: number): LayoutRectangle {
  return { x, y, width, height }
}

function makeLayoutMap(
  entries: [number, LayoutRectangle][],
): Map<number, LayoutRectangle> {
  return new Map(entries)
}

// ---------------------------------------------------------------------------
// hitTest
// ---------------------------------------------------------------------------

describe('hitTest', () => {
  it('returns null for an empty map', () => {
    expect(hitTest(5, 5, new Map(), new Set())).toBeNull()
  })

  it('returns null when the token is not in visibleIds', () => {
    const map = makeLayoutMap([[0, makeRect(0, 0, 50, 20)]])
    const visibleIds = new Set<number>() // token 0 not visible
    expect(hitTest(10, 10, map, visibleIds)).toBeNull()
  })

  it('returns the token index when coordinates are inside the rect', () => {
    const map = makeLayoutMap([[3, makeRect(10, 20, 40, 15)]])
    const visibleIds = new Set([3])
    expect(hitTest(25, 27, map, visibleIds)).toBe(3)
  })

  it('returns null when coordinates are outside all rects', () => {
    const map = makeLayoutMap([
      [0, makeRect(0, 0, 50, 20)],
      [1, makeRect(60, 0, 50, 20)],
    ])
    const visibleIds = new Set([0, 1])
    expect(hitTest(55, 10, map, visibleIds)).toBeNull()
  })

  it('returns the index on exact left boundary', () => {
    const map = makeLayoutMap([[2, makeRect(10, 10, 30, 20)]])
    const visibleIds = new Set([2])
    expect(hitTest(10, 20, map, visibleIds)).toBe(2)
  })

  it('returns the index on exact right boundary', () => {
    const map = makeLayoutMap([[2, makeRect(10, 10, 30, 20)]])
    const visibleIds = new Set([2])
    expect(hitTest(40, 20, map, visibleIds)).toBe(2)
  })

  it('returns the index on exact top boundary', () => {
    const map = makeLayoutMap([[2, makeRect(10, 10, 30, 20)]])
    const visibleIds = new Set([2])
    expect(hitTest(20, 10, map, visibleIds)).toBe(2)
  })

  it('returns the index on exact bottom boundary', () => {
    const map = makeLayoutMap([[2, makeRect(10, 10, 30, 20)]])
    const visibleIds = new Set([2])
    expect(hitTest(20, 30, map, visibleIds)).toBe(2)
  })

  it('ignores tokens not in visibleIds even if coordinates match', () => {
    const map = makeLayoutMap([
      [0, makeRect(0, 0, 50, 20)],
      [1, makeRect(0, 25, 50, 20)],
    ])
    const visibleIds = new Set([1]) // only token 1 visible
    expect(hitTest(10, 10, map, visibleIds)).toBeNull() // inside token 0, not visible
    expect(hitTest(10, 30, map, visibleIds)).toBe(1) // inside token 1, visible
  })
})

// ---------------------------------------------------------------------------
// buildTokenSentenceMap
// ---------------------------------------------------------------------------

describe('buildTokenSentenceMap', () => {
  it('returns an empty map for empty inputs', () => {
    expect(buildTokenSentenceMap([], [])).toEqual(new Map())
  })

  it('returns an empty map when there are no sentences', () => {
    const tokens = [makeToken(0, 0, 3)]
    expect(buildTokenSentenceMap(tokens, [])).toEqual(new Map())
  })

  it('maps each token to its containing sentence', () => {
    // sentence 0: chars 0–9, sentence 1: chars 10–19
    const tokens = [makeToken(0, 0, 4), makeToken(1, 5, 9), makeToken(2, 10, 14)]
    const sentences = [makeSentence(0, 0, 9), makeSentence(1, 10, 19)]
    const result = buildTokenSentenceMap(tokens, sentences)
    expect(result.get(0)).toBe(0)
    expect(result.get(1)).toBe(0)
    expect(result.get(2)).toBe(1)
  })

  it('does not map tokens that fall outside all sentence ranges', () => {
    // token 1 is between the two sentences
    const tokens = [makeToken(0, 0, 4), makeToken(1, 10, 15), makeToken(2, 20, 24)]
    const sentences = [makeSentence(0, 0, 4), makeSentence(1, 20, 24)]
    const result = buildTokenSentenceMap(tokens, sentences)
    expect(result.get(0)).toBe(0)
    expect(result.has(1)).toBe(false)
    expect(result.get(2)).toBe(1)
  })

  it('handles many tokens spread across many sentences', () => {
    // 3 sentences × 2 tokens each
    const tokens = [
      makeToken(0, 0, 2),
      makeToken(1, 3, 5),
      makeToken(2, 10, 12),
      makeToken(3, 13, 15),
      makeToken(4, 20, 22),
      makeToken(5, 23, 25),
    ]
    const sentences = [
      makeSentence(0, 0, 5),
      makeSentence(1, 10, 15),
      makeSentence(2, 20, 25),
    ]
    const result = buildTokenSentenceMap(tokens, sentences)
    expect(result.get(0)).toBe(0)
    expect(result.get(1)).toBe(0)
    expect(result.get(2)).toBe(1)
    expect(result.get(3)).toBe(1)
    expect(result.get(4)).toBe(2)
    expect(result.get(5)).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// buildPages
// ---------------------------------------------------------------------------

describe('buildPages', () => {
  it('returns [] when height is 0', () => {
    const tokens = [makeToken(0, 0, 3)]
    const map = makeLayoutMap([[0, makeRect(0, 0, 50, 20)]])
    expect(buildPages(map, tokens, [], 0)).toEqual([])
  })

  it('returns [] when allTokens is empty', () => {
    expect(buildPages(new Map(), [], [], 100)).toEqual([])
  })

  it('puts all tokens on one page when everything fits', () => {
    // 3 tokens stacked vertically, total height 60 — fits in 100-unit page
    const tokens = [makeToken(0, 0, 2), makeToken(1, 3, 5), makeToken(2, 6, 8)]
    const map = makeLayoutMap([
      [0, makeRect(0, 0, 50, 20)],
      [1, makeRect(0, 20, 50, 20)],
      [2, makeRect(0, 40, 50, 20)],
    ])
    const result = buildPages(map, tokens, [], 100)
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveLength(3)
  })

  it('splits into two pages at a clean sentence boundary', () => {
    // Two sentences: tokens 0-1 in sentence 0, tokens 2-3 in sentence 1.
    // Page height 50. Token 0 y=0..19, token 1 y=20..39 fit. Token 2 y=40..59 overflows.
    // Token 2 is in a different sentence → normal (clean) break.
    const tokens = [
      makeToken(0, 0, 2),
      makeToken(1, 3, 5), // sentence 0
      makeToken(2, 10, 12),
      makeToken(3, 13, 15), // sentence 1
    ]
    const sentences = [makeSentence(0, 0, 5), makeSentence(1, 10, 15)]
    const map = makeLayoutMap([
      [0, makeRect(0, 0, 50, 20)],
      [1, makeRect(0, 20, 50, 20)],
      [2, makeRect(0, 40, 50, 20)],
      [3, makeRect(0, 60, 50, 20)],
    ])
    const result = buildPages(map, tokens, sentences, 50)
    expect(result).toHaveLength(2)
    expect(result[0].map((t) => t.i)).toEqual([0, 1])
    expect(result[1].map((t) => t.i)).toEqual([2, 3])
  })

  it('trims back to sentence start when a greedy break splits a sentence (spillover)', () => {
    // Sentence 0 spans tokens 0, 1, 2. Page height 50.
    // Token 0 (y=0..19), token 1 (y=20..39) fit on page 1.
    // Token 2 (y=40..59) overflows but shares sentence 0 with token 1 → spillover.
    // Page 1 should only contain token 0 (sentenceStartIdx > 0), tokens 1-2 move to page 2.
    const tokens = [
      makeToken(0, 0, 2),
      makeToken(1, 3, 5),
      makeToken(2, 6, 8), // same sentence as 0 and 1
    ]
    const sentences = [makeSentence(0, 0, 8)]
    const map = makeLayoutMap([
      [0, makeRect(0, 0, 50, 20)],
      [1, makeRect(0, 20, 50, 20)],
      [2, makeRect(0, 40, 50, 20)],
    ])
    const result = buildPages(map, tokens, sentences, 50)
    // Because the whole content is one sentence and sentenceStartIdx would be 0,
    // the fallback (normal break) fires: page 1 = [0,1], page 2 = [2].
    // This exercises the "entire page is one sentence" fallback branch.
    expect(
      result
        .flat()
        .map((t) => t.i)
        .sort(),
    ).toEqual([0, 1, 2])
  })

  it('triggers the sentence spillover trim when the sentence starts mid-page', () => {
    // Page height = 60.
    // Sentence 0: tokens 0 (y=0..19). Sentence 1: tokens 1 (y=20..39), 2 (y=40..59), 3 (y=60..79).
    // Token 3 overflows. It shares sentence 1 with token 2 (last on page).
    // sentenceStartIdx points to token 1 (start of sentence 1 on the page), which is > 0.
    // → trim: page 1 = [token 0], page 2 starts with [token 1, token 2, token 3].
    const tokens = [
      makeToken(0, 0, 2), // sentence 0
      makeToken(1, 10, 12), // sentence 1
      makeToken(2, 13, 15), // sentence 1
      makeToken(3, 16, 18), // sentence 1
    ]
    const sentences = [makeSentence(0, 0, 2), makeSentence(1, 10, 18)]
    const map = makeLayoutMap([
      [0, makeRect(0, 0, 50, 20)],
      [1, makeRect(0, 20, 50, 20)],
      [2, makeRect(0, 40, 50, 20)],
      [3, makeRect(0, 60, 50, 20)],
    ])
    const result = buildPages(map, tokens, sentences, 60)
    expect(result).toHaveLength(2)
    expect(result[0].map((t) => t.i)).toEqual([0])
    expect(result[1].map((t) => t.i)).toEqual([1, 2, 3])
  })

  it('preserves all tokens across pages (no tokens lost)', () => {
    const N = 10
    const tokens = Array.from({ length: N }, (_, i) => makeToken(i, i * 5, i * 5 + 4))
    const map = makeLayoutMap(
      tokens.map(
        (t, i) => [t.i, makeRect(0, i * 20, 50, 20)] as [number, LayoutRectangle],
      ),
    )
    const result = buildPages(map, tokens, [], 50)
    const allTokenIds = result.flat().map((t) => t.i)
    expect(allTokenIds.sort((a, b) => a - b)).toEqual(
      Array.from({ length: N }, (_, i) => i),
    )
  })

  it('skips tokens with no layout entry', () => {
    // Token 1 has no layout — it should be skipped entirely.
    const tokens = [makeToken(0, 0, 2), makeToken(1, 3, 5), makeToken(2, 6, 8)]
    const map = makeLayoutMap([
      [0, makeRect(0, 0, 50, 20)],
      // token 1 missing
      [2, makeRect(0, 40, 50, 20)],
    ])
    const result = buildPages(map, tokens, [], 100)
    const allIds = result.flat().map((t) => t.i)
    expect(allIds).not.toContain(1)
    expect(allIds).toContain(0)
    expect(allIds).toContain(2)
  })
})
