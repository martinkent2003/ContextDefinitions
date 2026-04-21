/**
 * Tests for hooks/useHome.tsx
 *
 * HomeProvider coordinates readings data fetching, segment switching,
 * pull-to-refresh, card navigation, and search.
 *
 * Mocks:
 *  - @/services/readings  — fetchFeedReadings, fetchSavedReadings, searchReadings
 *  - @hooks/useLoading    — showLoading, hideLoading
 *  - @hooks/useReading    — handleReadingChange
 *  - expo-router          — useRouter (push)
 *  - react-native Alert   — alert
 */
import { act, renderHook } from '@testing-library/react-native'
import React from 'react'

import { HomeProvider, useHome } from '@/hooks/useHome'

// ── Service mocks ─────────────────────────────────────────────────────────────

const mockFetchFeedReadings = jest.fn()
const mockFetchSavedReadings = jest.fn()
const mockSearchReadings = jest.fn()

jest.mock('@/services/readings', () => ({
  fetchFeedReadings: (...args: any[]) => mockFetchFeedReadings(...args),
  fetchSavedReadings: () => mockFetchSavedReadings(),
  searchReadings: (...args: any[]) => mockSearchReadings(...args),
}))

// ── Hook mocks ────────────────────────────────────────────────────────────────

const mockShowLoading = jest.fn()
const mockHideLoading = jest.fn()
jest.mock('@hooks/useLoading', () => ({
  useLoading: () => ({ showLoading: mockShowLoading, hideLoading: mockHideLoading }),
}))

const mockHandleReadingChange = jest.fn()
jest.mock('@hooks/useReading', () => ({
  useReading: () => ({ handleReadingChange: mockHandleReadingChange }),
}))

const mockRouterPush = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

jest.spyOn(require('react-native'), 'Alert', 'get').mockReturnValue({ alert: jest.fn() })

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReading(id = 'r-1') {
  return {
    id,
    title: 'Test',
    genre: 'Fiction',
    rating: '3',
    body: '',
    isInLibrary: false,
  }
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HomeProvider>{children}</HomeProvider>
)

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  mockFetchFeedReadings.mockResolvedValue([])
  mockFetchSavedReadings.mockResolvedValue([])
  mockSearchReadings.mockResolvedValue([])
})

// ─────────────────────────────────────────────────────────────────────────────

describe('useHome — initial load', () => {
  it('starts with empty readings and Feed segment selected', async () => {
    const { result } = renderHook(() => useHome(), { wrapper })
    // Allow the initial effect to settle
    await act(async () => {})

    expect(result.current.selectedSegment).toBe('Feed')
  })

  it('fetches feed readings on mount', async () => {
    const readings = [makeReading()]
    mockFetchFeedReadings.mockResolvedValue(readings)

    const { result } = renderHook(() => useHome(), { wrapper })
    await act(async () => {})

    expect(mockFetchFeedReadings).toHaveBeenCalled()
    expect(result.current.readings).toEqual(readings)
  })

  it('fetches saved readings when segment is Library', async () => {
    const saved = [makeReading('saved-1')]
    mockFetchSavedReadings.mockResolvedValue(saved)

    const { result } = renderHook(() => useHome(), { wrapper })
    await act(async () => {})

    // Switch to Library
    await act(async () => {
      result.current.setSelectedSegment('Library')
    })

    expect(mockFetchSavedReadings).toHaveBeenCalled()
    expect(result.current.readings).toEqual(saved)
  })
})

describe('useHome — pullRefresh', () => {
  it('sets isRefreshing:true during refresh then false after', async () => {
    let resolveFetch!: () => void
    mockFetchFeedReadings
      .mockResolvedValueOnce([]) // initial mount
      .mockReturnValueOnce(
        new Promise<any[]>((r) => {
          resolveFetch = () => r([])
        }),
      )

    const { result } = renderHook(() => useHome(), { wrapper })
    await act(async () => {})

    // Start pull refresh without awaiting so we can inspect mid-flight state
    let pullPromise: Promise<void>
    act(() => {
      pullPromise = result.current.pullRefresh()
    })

    expect(result.current.isRefreshing).toBe(true)

    await act(async () => {
      resolveFetch()
      await pullPromise!
    })

    expect(result.current.isRefreshing).toBe(false)
  })

  it('fetches feed when segment is Feed during pullRefresh', async () => {
    mockFetchFeedReadings.mockResolvedValue([makeReading()])

    const { result } = renderHook(() => useHome(), { wrapper })
    await act(async () => {})

    mockFetchFeedReadings.mockClear()
    await act(async () => {
      await result.current.pullRefresh()
    })

    expect(mockFetchFeedReadings).toHaveBeenCalledTimes(1)
  })

  it('fetches saved when segment is Library during pullRefresh', async () => {
    const { result } = renderHook(() => useHome(), { wrapper })
    await act(async () => {})

    await act(async () => {
      result.current.setSelectedSegment('Library')
    })
    mockFetchSavedReadings.mockClear()

    await act(async () => {
      await result.current.pullRefresh()
    })
    expect(mockFetchSavedReadings).toHaveBeenCalledTimes(1)
  })
})

describe('useHome — handleSearch', () => {
  it('calls searchReadings with scope=feed when segment is Feed', async () => {
    const results = [makeReading()]
    mockSearchReadings.mockResolvedValue(results)

    const { result } = renderHook(() => useHome(), { wrapper })
    await act(async () => {})

    await act(async () => {
      await result.current.handleSearch('fiction')
    })

    expect(mockSearchReadings).toHaveBeenCalledWith('fiction', 'feed')
    expect(result.current.readings).toEqual(results)
  })

  it('calls searchReadings with scope=private when segment is Library', async () => {
    const { result } = renderHook(() => useHome(), { wrapper })
    await act(async () => {})

    await act(async () => {
      result.current.setSelectedSegment('Library')
    })
    mockSearchReadings.mockResolvedValue([])

    await act(async () => {
      await result.current.handleSearch('test')
    })
    expect(mockSearchReadings).toHaveBeenCalledWith('test', 'private')
  })

  it('resets to feed readings when search query is empty', async () => {
    const feedReadings = [makeReading()]
    mockFetchFeedReadings.mockResolvedValue(feedReadings)

    const { result } = renderHook(() => useHome(), { wrapper })
    await act(async () => {})

    await act(async () => {
      await result.current.handleSearch('')
    })
    expect(mockFetchFeedReadings).toHaveBeenCalled()
    // searchReadings should NOT have been called for empty query
    expect(mockSearchReadings).not.toHaveBeenCalled()
  })
})

describe('useHome — handleCardPress', () => {
  it('calls showLoading, handleReadingChange, then router.push on success', async () => {
    mockHandleReadingChange.mockResolvedValue(true)

    const { result } = renderHook(() => useHome(), { wrapper })
    await act(async () => {})

    const reading = makeReading()
    await act(async () => {
      await result.current.handleCardPress(reading)
    })

    expect(mockShowLoading).toHaveBeenCalled()
    expect(mockHandleReadingChange).toHaveBeenCalledWith(reading)
    expect(mockRouterPush).toHaveBeenCalledWith('/(private)/reading')
  })

  it('calls hideLoading and does not navigate when handleReadingChange fails', async () => {
    mockHandleReadingChange.mockResolvedValue(false)

    const { result } = renderHook(() => useHome(), { wrapper })
    await act(async () => {})

    await act(async () => {
      await result.current.handleCardPress(makeReading())
    })

    expect(mockRouterPush).not.toHaveBeenCalled()
    expect(mockHideLoading).toHaveBeenCalled()
  })
})
