/**
 * Tests for screens/ReadingScreen/hooks/useReadingContent.tsx — hook body
 *
 * The three exported pure functions (hitTest, buildTokenSentenceMap, buildPages)
 * are already covered by __tests__/useReadingContent.test.ts. This file tests the
 * useReadingContent hook itself (lines 163–393): state, effects, and callbacks.
 *
 * All native dependencies are mocked so renderHook can drive the hook without a
 * real React Native environment.
 */
import { act, renderHook } from '@testing-library/react-native'

// ── Import AFTER mocks ────────────────────────────────────────────────────────

import { useReadingContent } from '@screens/ReadingScreen/hooks/useReadingContent'

// ── Module-level mock state ───────────────────────────────────────────────────
// Declared before jest.mock calls so the factory closures can capture them by
// reference (lazy evaluation — values are read at call time, not at hoist time).

let mockReadingReturn: any // overridden in beforeEach per describe block
let mockIsCalibrated = true // controls useState(isCalibrated()) initial value

const mockSetSelection = jest.fn()
const mockSetTotalPages = jest.fn()
const mockSetCurrentPage = jest.fn()
const mockShowLoading = jest.fn()
const mockHideLoading = jest.fn()
const mockComputeLayout = jest.fn()
const mockComputeParagraphStarts = jest.fn()
const mockEstimateTokenWidth = jest.fn()

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@/hooks/useReading', () => ({
  useReading: () => mockReadingReturn,
}))

jest.mock('@/hooks/useLoading', () => ({
  useLoadingActions: () => ({
    showLoading: mockShowLoading,
    hideLoading: mockHideLoading,
  }),
}))

jest.mock('@screens/ReadingScreen/utils/fontMetrics', () => ({
  isCalibrated: () => mockIsCalibrated,
  estimateTokenWidth: (...args: any[]) => mockEstimateTokenWidth(...args),
}))

jest.mock('@screens/ReadingScreen/utils/layoutEngine', () => ({
  computeLayout: (...args: any[]) => mockComputeLayout(...args),
  computeParagraphStarts: (...args: any[]) => mockComputeParagraphStarts(...args),
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

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light' },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const defaultReadingReturn = {
  readingContent: null,
  selection: null,
  setSelection: mockSetSelection,
  fontSize: 16,
  setTotalPages: mockSetTotalPages,
  currentPage: 0,
  setCurrentPage: mockSetCurrentPage,
}

function makeLayoutEvent(dimension: number) {
  return {
    nativeEvent: { layout: { width: dimension, height: dimension, x: 0, y: 0 } },
  } as any
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  mockIsCalibrated = true
  mockReadingReturn = { ...defaultReadingReturn }
  mockComputeLayout.mockReturnValue(new Map())
  mockComputeParagraphStarts.mockReturnValue(new Set())
  mockEstimateTokenWidth.mockReturnValue(16)
})

// ── Initial state ─────────────────────────────────────────────────────────────

describe('useReadingContent — initial state', () => {
  it('returns empty tokens, sentences, spans, and blocks when readingContent is null', () => {
    const { result } = renderHook(() => useReadingContent())
    expect(result.current.tokens).toEqual([])
    expect(result.current.sentences).toEqual([])
    expect(result.current.spans).toEqual([])
    expect(result.current.blocks).toEqual([])
  })

  it('returns fontSize from useReading', () => {
    const { result } = renderHook(() => useReadingContent())
    expect(result.current.fontSize).toBe(16)
  })

  it('needsCalibration is false when isCalibrated returns true', () => {
    mockIsCalibrated = true
    const { result } = renderHook(() => useReadingContent())
    expect(result.current.needsCalibration).toBe(false)
  })

  it('needsCalibration is true when isCalibrated returns false', () => {
    mockIsCalibrated = false
    const { result } = renderHook(() => useReadingContent())
    expect(result.current.needsCalibration).toBe(true)
  })

  it('isHighlighted returns false for any token when there is no selection', () => {
    const { result } = renderHook(() => useReadingContent())
    expect(result.current.isHighlighted(0)).toBe(false)
    expect(result.current.isHighlighted(5)).toBe(false)
  })
})

// ── onCalibrated ──────────────────────────────────────────────────────────────

describe('useReadingContent — onCalibrated', () => {
  it('sets needsCalibration to false when called', () => {
    mockIsCalibrated = false
    const { result } = renderHook(() => useReadingContent())
    expect(result.current.needsCalibration).toBe(true)

    act(() => {
      result.current.onCalibrated()
    })

    expect(result.current.needsCalibration).toBe(false)
  })

  it('is a stable reference (does not change between renders)', () => {
    const { result, rerender } = renderHook(() => useReadingContent())
    const first = result.current.onCalibrated
    rerender({})
    expect(result.current.onCalibrated).toBe(first)
  })
})

// ── isHighlighted ─────────────────────────────────────────────────────────────

describe('useReadingContent — isHighlighted', () => {
  it('returns true for tokens within the selected range', () => {
    mockReadingReturn = {
      ...defaultReadingReturn,
      selection: { tokenIndices: [2, 3, 4], sentenceIndices: [], spanIds: [] },
    }
    const { result } = renderHook(() => useReadingContent())
    // Selection effect runs: selectionStart=2, selectionEnd=4
    expect(result.current.isHighlighted(2)).toBe(true)
    expect(result.current.isHighlighted(3)).toBe(true)
    expect(result.current.isHighlighted(4)).toBe(true)
  })

  it('returns false for tokens outside the selected range', () => {
    mockReadingReturn = {
      ...defaultReadingReturn,
      selection: { tokenIndices: [2, 3, 4], sentenceIndices: [], spanIds: [] },
    }
    const { result } = renderHook(() => useReadingContent())
    expect(result.current.isHighlighted(1)).toBe(false)
    expect(result.current.isHighlighted(5)).toBe(false)
  })

  it('works when tokenIndices are provided in non-sorted order', () => {
    // lo = min(5, 2) = 2, hi = max(5, 2) = 5
    mockReadingReturn = {
      ...defaultReadingReturn,
      selection: { tokenIndices: [5, 2], sentenceIndices: [], spanIds: [] },
    }
    const { result } = renderHook(() => useReadingContent())
    expect(result.current.isHighlighted(3)).toBe(true)
    expect(result.current.isHighlighted(6)).toBe(false)
  })

  it('returns false after selection is cleared (set back to null)', () => {
    mockReadingReturn = {
      ...defaultReadingReturn,
      selection: { tokenIndices: [1, 2], sentenceIndices: [], spanIds: [] },
    }
    const { result, rerender } = renderHook(() => useReadingContent())
    expect(result.current.isHighlighted(1)).toBe(true)

    // Clear the selection
    mockReadingReturn = { ...defaultReadingReturn, selection: null }
    rerender({})

    expect(result.current.isHighlighted(1)).toBe(false)
  })
})

// ── Layout callbacks ──────────────────────────────────────────────────────────

describe('useReadingContent — layout callbacks', () => {
  it('onTokenLayout is callable without throwing', () => {
    const { result } = renderHook(() => useReadingContent())
    expect(() =>
      result.current.onTokenLayout(0, { x: 0, y: 0, width: 40, height: 24 }),
    ).not.toThrow()
  })

  it('onContainerLayout does not throw', () => {
    const { result } = renderHook(() => useReadingContent())
    // Wrap in act because the callback triggers a setState call
    act(() => {
      result.current.onContainerLayout(makeLayoutEvent(600))
    })
  })

  it('onTokenContainerLayout does not throw', () => {
    const { result } = renderHook(() => useReadingContent())
    act(() => {
      result.current.onTokenContainerLayout(makeLayoutEvent(300))
    })
  })

  it('calling onContainerLayout multiple times with the same value does not crash', () => {
    const { result } = renderHook(() => useReadingContent())
    expect(() => {
      act(() => {
        result.current.onContainerLayout(makeLayoutEvent(600))
      })
      act(() => {
        result.current.onContainerLayout(makeLayoutEvent(600))
      })
    }).not.toThrow()
  })
})

// ── Layout effects with readingContent ────────────────────────────────────────

describe('useReadingContent — layout effects', () => {
  const mockToken = {
    i: 0,
    start: 0,
    end: 4,
    surface: 'word',
    norm: 'word',
    kind: 'word' as const,
  }
  const mockReadingContent = {
    tokens: [mockToken],
    sentences: [],
    spans: [],
    blocks: [],
  }

  it('calls computeLayout and hideLoading when content and dimensions are available', async () => {
    const tokenLayout = new Map([[0, { x: 0, y: 0, width: 16, height: 24 }]])
    mockComputeLayout.mockReturnValue(tokenLayout)

    mockReadingReturn = { ...defaultReadingReturn, readingContent: mockReadingContent }

    const { result } = renderHook(() => useReadingContent())

    // Effect A requires containerWidth > 0 — trigger via onTokenContainerLayout
    act(() => {
      result.current.onTokenContainerLayout(makeLayoutEvent(300))
    })

    // Effect B requires containerHeight > 0 — trigger via onContainerLayout
    act(() => {
      result.current.onContainerLayout(makeLayoutEvent(600))
    })

    expect(mockComputeLayout).toHaveBeenCalled()
    expect(mockHideLoading).toHaveBeenCalled()
  })

  it('calls setTotalPages with the page count after layout', async () => {
    const tokenLayout = new Map([[0, { x: 0, y: 0, width: 16, height: 24 }]])
    mockComputeLayout.mockReturnValue(tokenLayout)

    mockReadingReturn = { ...defaultReadingReturn, readingContent: mockReadingContent }

    const { result } = renderHook(() => useReadingContent())

    act(() => {
      result.current.onTokenContainerLayout(makeLayoutEvent(300))
    })
    act(() => {
      result.current.onContainerLayout(makeLayoutEvent(600))
    })

    expect(mockSetTotalPages).toHaveBeenCalled()
  })

  it('calls showLoading when readingContent is set but calibration is pending', () => {
    mockIsCalibrated = false
    mockReadingReturn = { ...defaultReadingReturn, readingContent: mockReadingContent }

    renderHook(() => useReadingContent())

    expect(mockShowLoading).toHaveBeenCalled()
  })

  it('does not call showLoading when calibration is already done', () => {
    mockIsCalibrated = true
    mockReadingReturn = { ...defaultReadingReturn, readingContent: mockReadingContent }

    renderHook(() => useReadingContent())

    expect(mockShowLoading).not.toHaveBeenCalled()
  })
})

// ── pan gesture object ────────────────────────────────────────────────────────

describe('useReadingContent — pan', () => {
  it('returns a pan gesture object', () => {
    const { result } = renderHook(() => useReadingContent())
    // The pan object is the result of chaining Gesture.Pan() calls.
    // With the mock, it's the object returned by the last .mockReturnThis() chain.
    expect(result.current.pan).toBeDefined()
  })
})
