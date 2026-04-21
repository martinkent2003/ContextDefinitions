/**
 * Tests for screens/ReadingScreen/utils/layoutEngine.ts
 *
 * Both exports (computeParagraphStarts, computeLayout) are pure functions.
 * estimateTokenWidth from fontMetrics is mocked so layout math is deterministic:
 * the mock returns `fontSize` for any surface string.
 *
 * Layout formula (with mock):
 *   tokenWidth  = fontSize           (mock always returns this)
 *   leadingSpace= params.leadingSpace (applied when there is a char gap before token)
 *   indent      = params.indentWidth  (applied to paragraph-start tokens)
 *   wrap        = when cursorX + margin + tokenWidth > containerWidth && cursorX > 0
 */
import type { ReadingPackageV1 } from '@/types/readings'

// ── Import AFTER mock registration ────────────────────────────────────────────

import {
  computeParagraphStarts,
  computeLayout,
} from '@screens/ReadingScreen/utils/layoutEngine'

// ── Mock estimateTokenWidth ───────────────────────────────────────────────────
// Must be declared before importing layoutEngine so Jest hoisting works.

const mockEstimateTokenWidth = jest.fn()

jest.mock('@screens/ReadingScreen/utils/fontMetrics', () => ({
  estimateTokenWidth: (...args: any[]) => mockEstimateTokenWidth(...args),
}))

// ── Types ─────────────────────────────────────────────────────────────────────

type Token = ReadingPackageV1['tokens'][number]
type Block = ReadingPackageV1['blocks'][number]

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeToken(i: number, start: number, end: number, surface = 'word'): Token {
  return { i, start, end, surface, norm: surface, kind: 'word' }
}

function makeBlock(start: number, end: number): Block {
  return { start, end, kind: 'paragraph' }
}

// Base layout params used by computeLayout tests.
// With mockEstimateTokenWidth returning fontSize (16), each token is 16px wide.
const BASE = {
  paragraphStarts: new Set<number>(),
  containerWidth: 100,
  fontSize: 16,
  lineHeight: 24,
  indentWidth: 32,
  leadingSpace: 4,
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  // Default: token width equals fontSize, independent of surface content.
  mockEstimateTokenWidth.mockImplementation(
    (_surface: string, fontSize: number) => fontSize,
  )
})

// ── computeParagraphStarts ────────────────────────────────────────────────────

describe('computeParagraphStarts', () => {
  it('returns an empty set when tokens array is empty', () => {
    expect(computeParagraphStarts([], [makeBlock(0, 100)])).toEqual(new Set())
  })

  it('returns an empty set when blocks array is empty', () => {
    const tokens = [makeToken(0, 0, 4), makeToken(1, 5, 9)]
    expect(computeParagraphStarts(tokens, [])).toEqual(new Set())
  })

  it('identifies the first token of a single block', () => {
    const tokens = [makeToken(0, 0, 4), makeToken(1, 5, 9)]
    const blocks = [makeBlock(0, 9)]
    // Token 0 (start=0) falls inside block [0,9] → it is the first token of the block
    expect(computeParagraphStarts(tokens, blocks)).toEqual(new Set([0]))
  })

  it('identifies the first token of each of multiple blocks', () => {
    const tokens = [
      makeToken(0, 0, 4),
      makeToken(1, 5, 9),
      makeToken(2, 20, 24),
      makeToken(3, 25, 29),
    ]
    const blocks = [makeBlock(0, 9), makeBlock(20, 29)]
    expect(computeParagraphStarts(tokens, blocks)).toEqual(new Set([0, 2]))
  })

  it('returns empty set when no token start falls within any block range', () => {
    // Block covers [0,10] but the only token starts at 50 — outside the block
    const tokens = [makeToken(0, 50, 54)]
    const blocks = [makeBlock(0, 10)]
    expect(computeParagraphStarts(tokens, blocks)).toEqual(new Set())
  })

  it('picks only the first matching token per block (not all tokens in block)', () => {
    // Block spans both tokens; only token 0 (the first in the block) should be in the set
    const tokens = [makeToken(0, 0, 4), makeToken(1, 5, 9)]
    const blocks = [makeBlock(0, 9)]
    const result = computeParagraphStarts(tokens, blocks)
    expect(result.has(0)).toBe(true)
    expect(result.has(1)).toBe(false)
  })
})

// ── computeLayout ─────────────────────────────────────────────────────────────

describe('computeLayout', () => {
  it('returns an empty map for an empty token array', () => {
    expect(computeLayout({ ...BASE, tokens: [] }).size).toBe(0)
  })

  it('places a single token at the origin (x=0, y=0)', () => {
    const tokens = [makeToken(0, 0, 4)]
    const result = computeLayout({ ...BASE, tokens })
    expect(result.get(0)).toEqual({ x: 0, y: 0, width: 16, height: 24 })
  })

  it('assigns lineHeight as the height of every token', () => {
    const tokens = [makeToken(0, 0, 4), makeToken(1, 4, 8)]
    const result = computeLayout({ ...BASE, tokens })
    expect(result.get(0)?.height).toBe(24)
    expect(result.get(1)?.height).toBe(24)
  })

  it('places consecutive adjacent tokens on the same line without a gap', () => {
    // Tokens are adjacent (token[n].start === token[n-1].end) → no leading space
    // token 0: x=0, width=16 → cursorX=16
    // token 1: x=16, width=16 → cursorX=32
    const tokens = [makeToken(0, 0, 4), makeToken(1, 4, 8)]
    const result = computeLayout({ ...BASE, tokens })
    expect(result.get(0)?.x).toBe(0)
    expect(result.get(1)?.x).toBe(16)
    expect(result.get(1)?.y).toBe(0)
  })

  it('inserts leadingSpace between tokens separated by a character gap', () => {
    // token 0: end=3; token 1: start=5 → 5 > 3 → addLeadingSpace → margin = leadingSpace (4)
    // token 0: x=0, cursorX=16; token 1: x = 16+4 = 20
    const tokens = [makeToken(0, 0, 3), makeToken(1, 5, 8)]
    const result = computeLayout({ ...BASE, tokens })
    expect(result.get(1)?.x).toBe(20)
    expect(result.get(1)?.y).toBe(0)
  })

  it('does not insert leading space for the very first token', () => {
    // Even if there were a "gap" before token 0, there is no prev → no leading space
    const tokens = [makeToken(0, 5, 9)] // doesn't start at 0
    const result = computeLayout({ ...BASE, tokens })
    expect(result.get(0)?.x).toBe(0)
  })

  it('wraps to the next line when a token does not fit the container width', () => {
    // containerWidth=50, tokens are adjacent (no leading space), each 16px wide:
    // token 0: x=0, cursorX=16
    // token 1: x=16, cursorX=32
    // token 2: x=32, cursorX=48
    // token 3: 48+0+16=64 > 50 → wrap → y=24, x=0
    const tokens = [
      makeToken(0, 0, 4),
      makeToken(1, 4, 8),
      makeToken(2, 8, 12),
      makeToken(3, 12, 16),
    ]
    const result = computeLayout({ ...BASE, containerWidth: 50, tokens })
    expect(result.get(3)?.y).toBe(24)
    expect(result.get(3)?.x).toBe(0)
  })

  it('does not wrap when a single token exactly fills the remaining space', () => {
    // containerWidth=16: token 0 is 16px wide — fits exactly (no cursorX > 0 before it)
    const tokens = [makeToken(0, 0, 4)]
    const result = computeLayout({ ...BASE, containerWidth: 16, tokens })
    expect(result.get(0)?.y).toBe(0)
  })

  it('moves the paragraph-start token to a new line and applies the indent', () => {
    // token 0: placed normally → x=0, cursorX=16
    // token 1: paragraph start (idx=1>0, cursorX=16>0) →
    //          cursorY += lineHeight(24), cursorX = indentWidth(32)
    //          tokenX = 32 (no leading space on para-start)
    const tokens = [makeToken(0, 0, 4), makeToken(1, 5, 9)]
    const paragraphStarts = new Set([1])
    const result = computeLayout({ ...BASE, tokens, paragraphStarts })
    expect(result.get(1)).toEqual({ x: 32, y: 24, width: 16, height: 24 })
  })

  it('does not add a blank line before the very first paragraph-start token', () => {
    // When idx === 0, the paragraph-break block is skipped (no preceding line)
    const tokens = [makeToken(0, 0, 4)]
    const paragraphStarts = new Set([0])
    const result = computeLayout({ ...BASE, tokens, paragraphStarts })
    // First token: para start but idx=0 → no newline; cursorX = indentWidth=32
    expect(result.get(0)).toEqual({ x: 32, y: 0, width: 16, height: 24 })
  })

  it('handles multiple paragraphs correctly', () => {
    // 3 tokens: [0] normal, [1] para-start, [2] normal after para
    const tokens = [makeToken(0, 0, 4), makeToken(1, 5, 9), makeToken(2, 9, 13)]
    const paragraphStarts = new Set([1])
    const result = computeLayout({ ...BASE, tokens, paragraphStarts })

    // token 0: y=0, x=0
    expect(result.get(0)?.y).toBe(0)
    // token 1: y=24 (new line), x=32 (indent)
    expect(result.get(1)?.y).toBe(24)
    expect(result.get(1)?.x).toBe(32)
    // token 2: adjacent to token 1 (no char gap), y=24, x=32+16=48
    expect(result.get(2)?.y).toBe(24)
    expect(result.get(2)?.x).toBe(48)
  })

  it('calls estimateTokenWidth with the token surface and fontSize', () => {
    const tokens = [makeToken(0, 0, 4, 'hello')]
    computeLayout({ ...BASE, tokens })
    expect(mockEstimateTokenWidth).toHaveBeenCalledWith('hello', 16)
  })
})
