/**
 * Tests for screens/ReadingScreen/utils/fontMetrics.tsx
 *
 * Test order matters: isCalibrated() and estimateTokenWidth tests run before any
 * FontMeasurer render fires onLayout, so the module-level _calibrated flag and
 * charWidthRatios map are still in their initial state (false / empty) for those
 * describe blocks. FontMeasurer tests come last and accept that calibration may
 * happen during them.
 *
 * Module-level state (_calibrated, charWidthRatios, defaultRatio) is shared across
 * all tests within this file but starts fresh (Jest isolates modules per test file).
 */
import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'

import {
  isCalibrated,
  estimateTokenWidth,
  FontMeasurer,
} from '@screens/ReadingScreen/utils/fontMetrics'

// ── isCalibrated ──────────────────────────────────────────────────────────────
// Must run first — before any FontMeasurer render fires onLayout events.

describe('isCalibrated', () => {
  it('returns false before any calibration has happened', () => {
    // Module initialises _calibrated = false; no calibration has been triggered yet.
    expect(isCalibrated()).toBe(false)
  })
})

// ── estimateTokenWidth ────────────────────────────────────────────────────────
// Runs before FontMeasurer tests so charWidthRatios is still empty and
// defaultRatio is still the initial 0.55. All chars therefore use the default.
//
// Formula: total = Σ(defaultRatio × fontSize) × KERNING_SHRINK(0.5)

describe('estimateTokenWidth', () => {
  const FONT_SIZE = 16
  const DEFAULT_RATIO = 0.55
  const KERNING_SHRINK = 0.5

  it('returns 0 for an empty string', () => {
    expect(estimateTokenWidth('', FONT_SIZE)).toBe(0)
  })

  it('uses defaultRatio and KERNING_SHRINK for a single unknown character', () => {
    // 0.55 × 16 × 0.5 = 4.4
    const expected = DEFAULT_RATIO * FONT_SIZE * KERNING_SHRINK
    expect(estimateTokenWidth('X', FONT_SIZE)).toBeCloseTo(expected)
  })

  it('accumulates width correctly for multiple characters', () => {
    // 3 chars: 3 × 0.55 × 16 × 0.5 = 13.2
    const expected = 3 * DEFAULT_RATIO * FONT_SIZE * KERNING_SHRINK
    expect(estimateTokenWidth('abc', FONT_SIZE)).toBeCloseTo(expected)
  })

  it('scales linearly with fontSize', () => {
    const w8 = estimateTokenWidth('A', 8)
    const w16 = estimateTokenWidth('A', 16)
    expect(w16).toBeCloseTo(w8 * 2)
  })

  it('result is the same for the same input called twice', () => {
    expect(estimateTokenWidth('hello', FONT_SIZE)).toBeCloseTo(
      estimateTokenWidth('hello', FONT_SIZE),
    )
  })
})

// ── FontMeasurer ──────────────────────────────────────────────────────────────

describe('FontMeasurer', () => {
  const layoutEvent = (width: number) => ({
    nativeEvent: { layout: { width, height: 20, x: 0, y: 0 } },
  })

  it('renders without crashing', () => {
    expect(() => render(<FontMeasurer onReady={jest.fn()} />)).not.toThrow()
  })

  it('does not call onReady before all character layouts have fired', () => {
    const onReady = jest.fn()
    const { UNSAFE_getAllByType } = render(<FontMeasurer onReady={onReady} />)
    const texts = UNSAFE_getAllByType(Text)

    // Fire layout on all except the last character
    texts.slice(0, -1).forEach((el) => fireEvent(el, 'layout', layoutEvent(8)))

    expect(onReady).not.toHaveBeenCalled()
  })

  it('calls onReady exactly once after all character layouts have fired', () => {
    const onReady = jest.fn()
    const { UNSAFE_getAllByType } = render(<FontMeasurer onReady={onReady} />)
    const texts = UNSAFE_getAllByType(Text)

    texts.forEach((el) => fireEvent(el, 'layout', layoutEvent(8)))

    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('does not call onReady a second time if layout events fire again after completion', () => {
    const onReady = jest.fn()
    const { UNSAFE_getAllByType } = render(<FontMeasurer onReady={onReady} />)
    const texts = UNSAFE_getAllByType(Text)

    // First pass — completes, onReady fires
    texts.forEach((el) => fireEvent(el, 'layout', layoutEvent(8)))
    // Second pass — done.current guard should suppress duplicate call
    texts.forEach((el) => fireEvent(el, 'layout', layoutEvent(8)))

    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('isCalibrated returns true after FontMeasurer fires all layouts', () => {
    const onReady = jest.fn()
    const { UNSAFE_getAllByType } = render(<FontMeasurer onReady={onReady} />)
    const texts = UNSAFE_getAllByType(Text)

    texts.forEach((el) => fireEvent(el, 'layout', layoutEvent(8)))

    expect(isCalibrated()).toBe(true)
  })
})
