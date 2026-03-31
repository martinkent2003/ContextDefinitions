import { useCallback, useRef } from 'react'
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native'
import { typography } from '@/constants/Themes'

// Reference characters covering common Latin, digits, and punctuation.
// Non-Latin characters (CJK, Arabic, etc.) fall back to the average width.
const REFERENCE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
  '0123456789' +
  ' .,;:!?\'"()-[]{}/@#$%^&*+=<>~`_|\\…–—\u2018\u2019\u201C\u201D\u00AB\u00BB\u00BF\u00A1'

const REFERENCE_FONT_SIZE = 16

// Module-level cache: character → width-to-fontSize ratio.
// Ratios are fontSize-independent (width = ratio × fontSize).
const charWidthRatios = new Map<string, number>()
let defaultRatio = 0.55
let _calibrated = false

export function isCalibrated(): boolean {
  return _calibrated
}

// Per-character measurement overestimates because it ignores kerning and font
// shaping that reduce total width when characters are rendered together.
const KERNING_SHRINK = 0.5

/**
 * Estimate the rendered pixel width of a token's surface text.
 * Uses character-level width ratios measured at startup, scaled by fontSize,
 * then applies a shrink factor to compensate for kerning/shaping.
 */
export function estimateTokenWidth(surface: string, fontSize: number): number {
  let total = 0
  for (const char of surface) {
    total += (charWidthRatios.get(char) ?? defaultRatio) * fontSize
  }
  return total * KERNING_SHRINK
}

function calibrate(charWidths: Map<string, number>): void {
  let sum = 0
  for (const [char, width] of charWidths) {
    const ratio = width / REFERENCE_FONT_SIZE
    charWidthRatios.set(char, ratio)
    sum += ratio
  }
  if (charWidths.size > 0) {
    defaultRatio = sum / charWidths.size
  }
  _calibrated = true
}

/**
 * Hidden component that renders reference characters to measure their widths.
 * Call once; onReady fires after all measurements are collected.
 */
export function FontMeasurer({ onReady }: { onReady: () => void }) {
  const widths = useRef(new Map<string, number>())
  const count = useRef(0)
  const done = useRef(false)
  const chars = [...new Set(REFERENCE_CHARS)]
  const total = chars.length

  const onCharLayout = useCallback(
    (char: string, e: LayoutChangeEvent) => {
      if (done.current) return
      widths.current.set(char, e.nativeEvent.layout.width)
      count.current++
      if (count.current >= total) {
        done.current = true
        calibrate(widths.current)
        onReady()
      }
    },
    [total, onReady],
  )

  return (
    <View style={hiddenStyles.container} pointerEvents="none">
      {chars.map((char, i) => (
        <Text
          key={i}
          style={[hiddenStyles.text, { fontSize: REFERENCE_FONT_SIZE }]}
          onLayout={(e) => onCharLayout(char, e)}
        >
          {char}
        </Text>
      ))}
    </View>
  )
}

const hiddenStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    opacity: 0,
  },
  text: {
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
})
