/**
 * Tests for hooks/useFullscreenModal.tsx
 *
 * FullscreenModalProvider wraps state for controlling a full-screen modal.
 * Tests cover initial state, toggling, and multiple state changes.
 */
import { act, renderHook } from '@testing-library/react-native'
import React from 'react'

import { FullscreenModalProvider, useFullscreenModal } from '@/hooks/useFullscreenModal'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FullscreenModalProvider>{children}</FullscreenModalProvider>
)

// ─────────────────────────────────────────────────────────────────────────────

describe('useFullscreenModal', () => {
  it('initialises with isFullscreenModalOpen: false', () => {
    const { result } = renderHook(() => useFullscreenModal(), { wrapper })
    expect(result.current.isFullscreenModalOpen).toBe(false)
  })

  it('setIsFullscreenModalOpen(true) opens the modal', () => {
    const { result } = renderHook(() => useFullscreenModal(), { wrapper })

    act(() => {
      result.current.setIsFullscreenModalOpen(true)
    })

    expect(result.current.isFullscreenModalOpen).toBe(true)
  })

  it('setIsFullscreenModalOpen(false) closes the modal', () => {
    const { result } = renderHook(() => useFullscreenModal(), { wrapper })

    act(() => {
      result.current.setIsFullscreenModalOpen(true)
    })
    act(() => {
      result.current.setIsFullscreenModalOpen(false)
    })

    expect(result.current.isFullscreenModalOpen).toBe(false)
  })

  it('can toggle multiple times and maintains correct state', () => {
    const { result } = renderHook(() => useFullscreenModal(), { wrapper })

    act(() => {
      result.current.setIsFullscreenModalOpen(true)
    })
    expect(result.current.isFullscreenModalOpen).toBe(true)

    act(() => {
      result.current.setIsFullscreenModalOpen(false)
    })
    expect(result.current.isFullscreenModalOpen).toBe(false)

    act(() => {
      result.current.setIsFullscreenModalOpen(true)
    })
    expect(result.current.isFullscreenModalOpen).toBe(true)
  })

  it('exposes a setIsFullscreenModalOpen function', () => {
    const { result } = renderHook(() => useFullscreenModal(), { wrapper })
    expect(typeof result.current.setIsFullscreenModalOpen).toBe('function')
  })
})
