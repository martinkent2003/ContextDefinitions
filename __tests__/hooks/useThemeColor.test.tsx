/**
 * Tests for hooks/useThemeColor.tsx
 *
 * useThemeColor resolves a color from:
 *  1. The props override for the current color scheme (if provided), OR
 *  2. The Colors theme object for the current scheme and colorName
 *
 * useColorScheme is mocked to control which theme branch is active.
 */
import { renderHook } from '@testing-library/react-native'

import { Colors } from '@/constants/Themes'
import { useThemeColor } from '@/hooks/useThemeColor'

// ── Mock useColorScheme ───────────────────────────────────────────────────────

let mockColorScheme: 'light' | 'dark' = 'light'

jest.mock('@hooks/useColorScheme', () => ({
  useColorScheme: () => mockColorScheme,
}))

// ─────────────────────────────────────────────────────────────────────────────

describe('useThemeColor', () => {
  it('returns the light theme color when color scheme is light', () => {
    mockColorScheme = 'light'
    const { result } = renderHook(() => useThemeColor({}, 'text'))
    expect(result.current).toBe(Colors.light.text)
  })

  it('returns the dark theme color when color scheme is dark', () => {
    mockColorScheme = 'dark'
    const { result } = renderHook(() => useThemeColor({}, 'text'))
    expect(result.current).toBe(Colors.dark.text)
  })

  it('returns the props.light override in light mode', () => {
    mockColorScheme = 'light'
    const { result } = renderHook(() =>
      useThemeColor({ light: '#custom-light', dark: '#custom-dark' }, 'text'),
    )
    expect(result.current).toBe('#custom-light')
  })

  it('returns the props.dark override in dark mode', () => {
    mockColorScheme = 'dark'
    const { result } = renderHook(() =>
      useThemeColor({ light: '#custom-light', dark: '#custom-dark' }, 'text'),
    )
    expect(result.current).toBe('#custom-dark')
  })

  it('falls back to theme when only the opposite prop is provided', () => {
    // In light mode, props.dark is irrelevant — should fall back to theme
    mockColorScheme = 'light'
    const { result } = renderHook(() => useThemeColor({ dark: '#custom-dark' }, 'text'))
    expect(result.current).toBe(Colors.light.text)
  })

  it('works with the background colorName', () => {
    mockColorScheme = 'light'
    const { result } = renderHook(() => useThemeColor({}, 'background'))
    expect(result.current).toBe(Colors.light.background)
  })

  it('empty props object always uses theme colors', () => {
    mockColorScheme = 'dark'
    const { result } = renderHook(() => useThemeColor({}, 'background'))
    expect(result.current).toBe(Colors.dark.background)
  })
})
