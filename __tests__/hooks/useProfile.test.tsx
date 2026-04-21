/**
 * Tests for hooks/useProfile.tsx
 *
 * ProfileProvider depends on useSession (via SessionContext) and fetchProfileById.
 * Strategy:
 *  - Mock @/hooks/useSession to control the session value
 *  - Mock @/services/profile to control fetchProfileById responses
 *  - Wrap the hook in ProfileProvider and read via useProfile
 */
import { act, renderHook } from '@testing-library/react-native'
import React from 'react'

import { ProfileProvider, useProfile } from '@/hooks/useProfile'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockFetchProfileById = jest.fn()
jest.mock('@/services/profile', () => ({
  fetchProfileById: (...args: any[]) => mockFetchProfileById(...args),
}))

// Controllable session: updated per test via mockSession
let mockSession: any = null
jest.mock('@/hooks/useSession', () => ({
  useSession: () => ({ session: mockSession }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeProfile(overrides = {}) {
  return {
    id: 'u-1',
    username: 'alice',
    full_name: 'Alice Smith',
    avatar_url: null,
    native_language: 'en',
    target_language: 'fr',
    ...overrides,
  }
}

function makeSession(userId = 'u-1') {
  return { user: { id: userId } }
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProfileProvider>{children}</ProfileProvider>
)

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  mockSession = null
})

// ─────────────────────────────────────────────────────────────────────────────

describe('useProfile', () => {
  it('does not call fetchProfileById when there is no session', async () => {
    mockSession = null
    mockFetchProfileById.mockResolvedValue({ data: null, error: null })

    const { result } = renderHook(() => useProfile(), { wrapper })
    await act(async () => {})

    expect(mockFetchProfileById).not.toHaveBeenCalled()
    expect(result.current.profile).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('calls fetchProfileById with the session user id', async () => {
    mockSession = makeSession('u-42')
    mockFetchProfileById.mockResolvedValue({
      data: makeProfile({ id: 'u-42' }),
      error: null,
    })

    const { result } = renderHook(() => useProfile(), { wrapper })
    await act(async () => {})

    expect(mockFetchProfileById).toHaveBeenCalledWith('u-42')
    expect(result.current.profile).toMatchObject({ id: 'u-42' })
  })

  it('sets profile and isLoading:false after successful fetch', async () => {
    mockSession = makeSession()
    const profile = makeProfile()
    mockFetchProfileById.mockResolvedValue({ data: profile, error: null })

    const { result } = renderHook(() => useProfile(), { wrapper })
    await act(async () => {})

    expect(result.current.profile).toEqual(profile)
    expect(result.current.isLoading).toBe(false)
  })

  it('leaves profile null and sets isLoading:false when fetch returns an error', async () => {
    mockSession = makeSession()
    mockFetchProfileById.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    })

    const { result } = renderHook(() => useProfile(), { wrapper })
    await act(async () => {})

    expect(result.current.profile).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('leaves profile null and sets isLoading:false when fetch returns data:null without error', async () => {
    mockSession = makeSession()
    mockFetchProfileById.mockResolvedValue({ data: null, error: null })

    const { result } = renderHook(() => useProfile(), { wrapper })
    await act(async () => {})

    expect(result.current.profile).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('refreshProfile re-fetches and updates profile', async () => {
    mockSession = makeSession()
    const initial = makeProfile({ username: 'alice' })
    const updated = makeProfile({ username: 'alice_updated' })

    mockFetchProfileById
      .mockResolvedValueOnce({ data: initial, error: null })
      .mockResolvedValueOnce({ data: updated, error: null })

    const { result } = renderHook(() => useProfile(), { wrapper })
    await act(async () => {})

    expect(result.current.profile?.username).toBe('alice')

    await act(async () => {
      await result.current.refreshProfile()
    })

    expect(result.current.profile?.username).toBe('alice_updated')
  })
})
