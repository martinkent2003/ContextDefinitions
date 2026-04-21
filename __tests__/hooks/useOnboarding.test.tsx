/**
 * Tests for hooks/useOnboarding.tsx
 *
 * OnboardingProvider stores multi-step signup form state.
 * All fields start empty; each setter updates only its own field;
 * clearOnboarding resets everything.
 */
import { act, renderHook } from '@testing-library/react-native'
import React from 'react'

import { OnboardingProvider, useOnboarding } from '@/hooks/useOnboarding'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OnboardingProvider>{children}</OnboardingProvider>
)

// ─────────────────────────────────────────────────────────────────────────────

describe('useOnboarding', () => {
  it('initialises with empty string fields', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })
    expect(result.current.email).toBe('')
    expect(result.current.password).toBe('')
    expect(result.current.username).toBe('')
    expect(result.current.fullName).toBe('')
  })

  it('initialises with default languages', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })
    expect(result.current.nativeLanguage).toBe('en')
    expect(result.current.targetLanguage).toBe('es')
  })

  it('setEmail updates only the email field', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.setEmail('test@example.com')
    })

    expect(result.current.email).toBe('test@example.com')
    expect(result.current.password).toBe('') // unchanged
  })

  it('setPassword updates only the password field', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.setPassword('secret123')
    })

    expect(result.current.password).toBe('secret123')
    expect(result.current.email).toBe('') // unchanged
  })

  it('setUsername updates only the username field', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.setUsername('alice')
    })

    expect(result.current.username).toBe('alice')
  })

  it('setFullName updates only the fullName field', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.setFullName('Alice Smith')
    })

    expect(result.current.fullName).toBe('Alice Smith')
  })

  it('setNativeLanguage updates only the nativeLanguage field', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.setNativeLanguage('fr')
    })

    expect(result.current.nativeLanguage).toBe('fr')
    expect(result.current.targetLanguage).toBe('es') // unchanged
  })

  it('setTargetLanguage updates only the targetLanguage field', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.setTargetLanguage('de')
    })

    expect(result.current.targetLanguage).toBe('de')
    expect(result.current.nativeLanguage).toBe('en') // unchanged
  })

  it('clearOnboarding resets all fields to defaults', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.setEmail('a@b.com')
      result.current.setPassword('pass')
      result.current.setUsername('bob')
      result.current.setFullName('Bob')
      result.current.setNativeLanguage('fr')
      result.current.setTargetLanguage('de')
    })

    act(() => {
      result.current.clearOnboarding()
    })

    expect(result.current.email).toBe('')
    expect(result.current.password).toBe('')
    expect(result.current.username).toBe('')
    expect(result.current.fullName).toBe('')
    expect(result.current.nativeLanguage).toBe('en')
    expect(result.current.targetLanguage).toBe('es')
  })

  it('multiple setters can be called independently without affecting each other', () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper })

    act(() => {
      result.current.setEmail('user@example.com')
      result.current.setUsername('charlie')
    })

    expect(result.current.email).toBe('user@example.com')
    expect(result.current.username).toBe('charlie')
    expect(result.current.password).toBe('')
    expect(result.current.fullName).toBe('')
  })
})
