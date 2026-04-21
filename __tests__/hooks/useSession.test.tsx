/**
 * Tests for hooks/useSession.tsx
 *
 * Tests the SessionProvider + useSession hook:
 *  - Initial state is session:null, isLoading:true
 *  - After getSession resolves, state updates correctly
 *  - onAuthStateChange callbacks update the session
 *  - Subscription is unsubscribed on unmount
 *
 * Uses @testing-library/react-native renderHook with SessionProvider as wrapper.
 */
import { act, renderHook } from '@testing-library/react-native'
import React from 'react'

import { SessionProvider, useSession } from '@/hooks/useSession'

// ── Supabase mock ─────────────────────────────────────────────────────────────

const mockUnsubscribe = jest.fn()
let authStateChangeCallback: ((event: string, session: any) => void) | null = null

const mockGetSession = jest.fn()
const mockOnAuthStateChange = jest.fn().mockImplementation((cb) => {
  authStateChangeCallback = cb
  return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
})

jest.mock('@utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (cb: any) => mockOnAuthStateChange(cb),
    },
  },
}))

// ─────────────────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider>{children}</SessionProvider>
)

function makeSession(id = 'u-1') {
  return { user: { id }, access_token: 'tok', token_type: 'bearer' } as any
}

beforeEach(() => {
  jest.clearAllMocks()
  authStateChangeCallback = null
  // Default: getSession resolves with no session
  mockGetSession.mockResolvedValue({ data: { session: null } })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('useSession', () => {
  it('starts with session:null and isLoading:true', () => {
    // Don't resolve getSession yet — keep in pending state
    mockGetSession.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useSession(), { wrapper })

    expect(result.current.session).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })

  it('sets session and isLoading:false after getSession resolves with a session', async () => {
    const session = makeSession('u-1')
    mockGetSession.mockResolvedValue({ data: { session } })

    const { result } = renderHook(() => useSession(), { wrapper })

    await act(async () => {})

    expect(result.current.session).toEqual(session)
    expect(result.current.isLoading).toBe(false)
  })

  it('sets session:null and isLoading:false when getSession resolves with no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const { result } = renderHook(() => useSession(), { wrapper })

    await act(async () => {})

    expect(result.current.session).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('updates session when onAuthStateChange fires SIGNED_IN', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const { result } = renderHook(() => useSession(), { wrapper })
    await act(async () => {})

    const newSession = makeSession('u-2')
    await act(async () => {
      authStateChangeCallback?.('SIGNED_IN', newSession)
    })

    expect(result.current.session).toEqual(newSession)
  })

  it('clears session when onAuthStateChange fires SIGNED_OUT', async () => {
    const session = makeSession()
    mockGetSession.mockResolvedValue({ data: { session } })

    const { result } = renderHook(() => useSession(), { wrapper })
    await act(async () => {})

    expect(result.current.session).toEqual(session)

    await act(async () => {
      authStateChangeCallback?.('SIGNED_OUT', null)
    })

    expect(result.current.session).toBeNull()
  })

  it('unsubscribes from auth listener on unmount', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const { unmount } = renderHook(() => useSession(), { wrapper })
    await act(async () => {})

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  it('registers exactly one auth state change listener', async () => {
    const { result } = renderHook(() => useSession(), { wrapper })
    await act(async () => {})

    expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1)
    // suppress unused var warning
    expect(result.current).toBeDefined()
  })
})
