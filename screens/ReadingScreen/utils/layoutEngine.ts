import type { LayoutRectangle } from 'react-native'
import type { ReadingPackageV1 } from '@/types/readings'
import { estimateTokenWidth } from './fontMetrics'

type Token = ReadingPackageV1['tokens'][number]
type Block = ReadingPackageV1['blocks'][number]

/** Identify the first token of each paragraph block. */
export function computeParagraphStarts(tokens: Token[], blocks: Block[]): Set<number> {
  const set = new Set<number>()
  for (const block of blocks) {
    const first = tokens.find((t) => t.start >= block.start && t.start <= block.end)
    if (first) set.add(first.i)
  }
  return set
}

interface LayoutParams {
  tokens: Token[]
  paragraphStarts: Set<number>
  containerWidth: number
  fontSize: number
  lineHeight: number
  indentWidth: number
  leadingSpace: number
}

/**
 * Simulate flexDirection:'row', flexWrap:'wrap' layout with pure math.
 * Walks all tokens, tracking a cursor (x, y). When a token (plus its
 * leading margin) doesn't fit on the current line, the cursor wraps.
 * Paragraph breaks and indentation are handled inline.
 *
 * Returns a LayoutMap identical in structure to what onLayout callbacks
 * would produce during a render-measure cycle.
 */
export function computeLayout(params: LayoutParams): Map<number, LayoutRectangle> {
  const {
    tokens,
    paragraphStarts,
    containerWidth,
    fontSize,
    lineHeight,
    indentWidth,
    leadingSpace,
  } = params
  const layoutMap = new Map<number, LayoutRectangle>()
  let cursorX = 0
  let cursorY = 0

  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx]
    const prev = idx > 0 ? tokens[idx - 1] : null
    const isParaStart = paragraphStarts.has(token.i)
    const addLeadingSpace = !isParaStart && prev !== null && token.start > prev.end

    // Paragraph break: a 100%-width spacer forces content to the next line.
    if (isParaStart && idx > 0) {
      if (cursorX > 0) {
        cursorY += lineHeight
        cursorX = 0
      }
    }

    // Paragraph indent spacer.
    if (isParaStart) {
      cursorX = indentWidth
    }

    const margin = addLeadingSpace ? leadingSpace : 0
    const tokenWidth = estimateTokenWidth(token.surface, fontSize)

    // Wrap to next line if token (with margin) doesn't fit.
    if (cursorX + margin + tokenWidth > containerWidth && cursorX > 0) {
      cursorY += lineHeight
      cursorX = 0
    }

    const tokenX = cursorX + margin
    layoutMap.set(token.i, {
      x: tokenX,
      y: cursorY,
      width: tokenWidth,
      height: lineHeight,
    })
    cursorX = tokenX + tokenWidth
  }

  return layoutMap
}
