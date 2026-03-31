import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import { spacing, typography } from '@/constants/Themes'
import { useLoadingActions } from '@/hooks/useLoading'
import { useReading } from '@/hooks/useReading'
import { isCalibrated } from '@/screens/ReadingScreen/utils/fontMetrics'
import {
  computeLayout,
  computeParagraphStarts,
} from '@/screens/ReadingScreen/utils/layoutEngine'
import type { ReadingPackageV1 } from '@/types/readings'

type Token = ReadingPackageV1['tokens'][number]
type LayoutMap = Map<number, LayoutRectangle>

// visibleIds restricts the search to tokens currently rendered on screen,
// preventing stale measurement-pass positions from other pages being hit.
export function hitTest(
  x: number,
  y: number,
  map: LayoutMap,
  visibleIds: Set<number>,
): number | null {
  for (const [tokenIdx, rect] of map.entries()) {
    if (!visibleIds.has(tokenIdx)) continue
    if (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    ) {
      return tokenIdx
    }
  }
  return null
}

type Sentence = ReadingPackageV1['sentences'][number]

// Build a token→sentence lookup by walking both arrays together. O(n+m)
export function buildTokenSentenceMap(
  allTokens: Token[],
  sentences: Sentence[],
): Map<number, number> {
  const map = new Map<number, number>()
  let sIdx = 0
  for (const token of allTokens) {
    // Advance past sentences that end before this token starts.
    while (sIdx < sentences.length && sentences[sIdx].end < token.start) sIdx++
    if (
      sIdx < sentences.length &&
      token.start >= sentences[sIdx].start &&
      token.end <= sentences[sIdx].end
    ) {
      map.set(token.i, sentences[sIdx].i)
    }
  }
  return map
}

// Walk all token layouts (computed by the layout engine) and split them
// into pages. A token belongs to the current page if its bottom edge fits
// within `height` units from where the page started in the continuous layout.
//
// Sentence-aware: when a greedy break would split a sentence across pages,
// the current page is trimmed back to the start of that sentence so the whole
// sentence begins on the next page instead.
export function buildPages(
  map: LayoutMap,
  allTokens: Token[],
  sentences: Sentence[],
  height: number,
): Token[][] {
  if (height === 0 || allTokens.length === 0) return []

  const tokenSentence = buildTokenSentenceMap(allTokens, sentences)
  const pages: Token[][] = []
  let pageTokens: Token[] = []
  let pageStartY = 0

  for (const token of allTokens) {
    const rect = map.get(token.i)
    if (!rect) continue

    if (rect.y + rect.height - pageStartY <= height) {
      pageTokens.push(token)
    } else {
      // Greedy break: check whether this token shares a sentence with the
      // last token on the current page.
      const breakingSentence = tokenSentence.get(token.i)
      const lastSentence =
        pageTokens.length > 0
          ? tokenSentence.get(pageTokens[pageTokens.length - 1].i)
          : undefined

      const sentenceSplit =
        breakingSentence !== undefined && breakingSentence === lastSentence

      if (sentenceSplit) {
        // Find where the split sentence starts within the current page.
        let sentenceStartIdx = pageTokens.length - 1
        while (
          sentenceStartIdx > 0 &&
          tokenSentence.get(pageTokens[sentenceStartIdx - 1].i) === breakingSentence
        ) {
          sentenceStartIdx--
        }

        if (sentenceStartIdx === 0) {
          // The entire current page is one sentence — can't trim further.
          // Fall back to a normal break to avoid an empty page.
          pages.push(pageTokens)
          pageTokens = [token]
          pageStartY = rect.y
        } else {
          // Split: everything from sentenceStartIdx onward moves to the next page.
          const spillover = pageTokens.splice(sentenceStartIdx)
          pages.push(pageTokens)

          const spillRect = map.get(spillover[0].i)
          pageStartY = spillRect ? spillRect.y : rect.y
          pageTokens = [...spillover, token]
        }
      } else {
        // Clean sentence boundary — normal break.
        pages.push(pageTokens)
        pageTokens = [token]
        pageStartY = rect.y
      }
    }
  }

  if (pageTokens.length > 0) pages.push(pageTokens)
  return pages
}

export type UseReadingContentReturn = {
  tokens: Token[]
  sentences: ReadingPackageV1['sentences']
  spans: ReadingPackageV1['spans']
  blocks: ReadingPackageV1['blocks']
  fontSize: number
  needsCalibration: boolean
  onCalibrated: () => void
  isHighlighted: (tokenIdx: number) => boolean
  pan: ReturnType<typeof Gesture.Pan>
  onContainerLayout: (e: LayoutChangeEvent) => void
  onTokenContainerLayout: (e: LayoutChangeEvent) => void
  onTokenLayout: (tokenIdx: number, layout: LayoutRectangle) => void
}

export function useReadingContent(): UseReadingContentReturn {
  const {
    readingContent,
    selection,
    setSelection,
    fontSize,
    setTotalPages,
    currentPage,
    setCurrentPage,
  } = useReading()
  const { showLoading, hideLoading } = useLoadingActions()

  const layoutMap = useRef<LayoutMap>(new Map())
  const visibleTokenIdsRef = useRef<Set<number>>(new Set())
  const selectionStartRef = useRef<number | null>(null)
  const selectionEndRef = useRef<number | null>(null)
  const committedRef = useRef(false)

  const pagesRef = useRef<Token[][]>([])
  const currentPageRef = useRef<number>(0)
  const prevReadingContentRef = useRef<ReadingPackageV1 | null | undefined>(undefined)
  const anchorTokenRef = useRef<number | null>(null)

  // Stable refs for loading actions so they never appear in effect deps.
  const showLoadingRef = useRef(showLoading)
  const hideLoadingRef = useRef(hideLoading)
  showLoadingRef.current = showLoading
  hideLoadingRef.current = hideLoading

  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [containerHeight, setContainerHeight] = useState<number>(0)
  const [pages, setPages] = useState<Token[][]>([])
  const [calibrated, setCalibrated] = useState(isCalibrated())

  // Keep mirror refs in sync every render.
  pagesRef.current = pages
  currentPageRef.current = currentPage

  const allTokens = readingContent?.tokens ?? []
  const sentences = readingContent?.sentences ?? []
  const spans = readingContent?.spans ?? []
  const blocks = readingContent?.blocks ?? []

  const onCalibrated = useCallback(() => setCalibrated(true), [])

  // When reading content or font size changes, save the anchor token for
  // position restoration and clear stale pages.
  useLayoutEffect(() => {
    const isNewReading = readingContent !== prevReadingContentRef.current
    prevReadingContentRef.current = readingContent

    // For font-size changes (same reading), remember the first token of the
    // current page so we can restore the position after re-pagination.
    if (!isNewReading && pagesRef.current.length > 0) {
      anchorTokenRef.current = pagesRef.current[currentPageRef.current]?.[0]?.i ?? null
    } else {
      anchorTokenRef.current = null
    }

    setPages([])
    setCurrentPage(0)
    // Show loading only when calibration is still pending (slow path).
    if (readingContent !== null && !isCalibrated()) {
      showLoadingRef.current()
    }
  }, [readingContent, fontSize, setCurrentPage])

  // Phase 3: Compute pages via mathematical layout engine.
  // Runs once all prerequisites are met (calibrated, dimensions known, content loaded).
  useEffect(() => {
    if (!readingContent || !calibrated || containerWidth === 0 || containerHeight === 0)
      return

    const tokens = readingContent.tokens
    const sents = readingContent.sentences
    const blks = readingContent.blocks
    if (tokens.length === 0) return

    const lineHeight = typography.sizes.md * typography.lineHeights.relaxed
    const paragraphStarts = computeParagraphStarts(tokens, blks)
    const computed = computeLayout({
      tokens,
      paragraphStarts,
      containerWidth,
      fontSize,
      lineHeight,
      indentWidth: fontSize * 2,
      leadingSpace: spacing.xs,
    })

    // Store computed layout; visible-page onLayout callbacks will refine
    // these positions for pixel-perfect hit-testing.
    layoutMap.current = computed

    const newPages = buildPages(computed, tokens, sents, containerHeight)
    setPages(newPages)
    setTotalPages(newPages.length)

    // Restore reading position for font-size changes.
    const anchor = anchorTokenRef.current
    if (anchor !== null && newPages.length > 0) {
      const targetPage = newPages.findIndex((page) => page.some((t) => t.i === anchor))
      setCurrentPage(targetPage !== -1 ? targetPage : 0)
    }

    hideLoadingRef.current()
  }, [
    calibrated,
    containerWidth,
    containerHeight,
    readingContent,
    fontSize,
    setTotalPages,
    setCurrentPage,
  ])

  useEffect(() => {
    if (selection === null) {
      setSelectionStart(null)
      setSelectionEnd(null)
      return
    }

    const { tokenIndices } = selection
    if (tokenIndices.length === 0) return

    const lo = Math.min(...tokenIndices)
    const hi = Math.max(...tokenIndices)

    setSelectionStart(lo)
    setSelectionEnd(hi)

    const currentPages = pagesRef.current
    if (currentPages.length === 0) return
    const targetPage = currentPages.findIndex((page) => page.some((t) => t.i === lo))
    if (targetPage !== -1) setCurrentPage(targetPage)
  }, [selection])

  // After pages are built, render only the current page's tokens.
  const visibleTokens = pages.length > 0 ? (pages[currentPage] ?? []) : []
  visibleTokenIdsRef.current = new Set(visibleTokens.map((t) => t.i))

  function isHighlighted(tokenIdx: number): boolean {
    if (selectionStart === null || selectionEnd === null) return false
    const lo = Math.min(selectionStart, selectionEnd)
    const hi = Math.max(selectionStart, selectionEnd)
    return tokenIdx >= lo && tokenIdx <= hi
  }

  function commitSelection(start: number, end: number): void {
    const lo = Math.min(start, end)
    const hi = Math.max(start, end)
    const tokenIndices = allTokens.filter((t) => t.i >= lo && t.i <= hi).map((t) => t.i)
    const sentenceIndices = sentences
      .filter((s) =>
        allTokens.some(
          (t) => t.i >= lo && t.i <= hi && t.start >= s.start && t.end <= s.end,
        ),
      )
      .map((s) => s.i)
    const spanIds = spans
      .filter((s) => s.token_range[0] >= lo && s.token_range[1] <= hi)
      .map((s) => s.id)
    setSelection({ tokenIndices, sentenceIndices, spanIds })
  }

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => {
      committedRef.current = false
      const hit = hitTest(e.x, e.y, layoutMap.current, visibleTokenIdsRef.current)
      if (hit !== null) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        selectionStartRef.current = hit
        selectionEndRef.current = hit
        setSelectionStart(hit)
        setSelectionEnd(hit)
      }
    })
    .onUpdate((e) => {
      const hit = hitTest(e.x, e.y, layoutMap.current, visibleTokenIdsRef.current)
      if (hit !== null) {
        selectionEndRef.current = hit
        setSelectionEnd(hit)
      }
    })
    .onEnd(() => {
      const start = selectionStartRef.current
      const end = selectionEndRef.current
      if (start !== null && end !== null) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        commitSelection(start, end)
        committedRef.current = true
      }
    })
    .onFinalize(() => {
      if (!committedRef.current) {
        const start = selectionStartRef.current
        const end = selectionEndRef.current
        if (start !== null && end !== null) commitSelection(start, end)
        else {
          setSelectionStart(null)
          setSelectionEnd(null)
        }
      }
      selectionStartRef.current = null
      selectionEndRef.current = null
    })

  function onContainerLayout(e: LayoutChangeEvent): void {
    const h = e.nativeEvent.layout.height
    if (Math.abs(h - containerHeight) >= 1) setContainerHeight(h)
  }

  // Get wrapping width directly from the tokenContainer — no padding guessing.
  function onTokenContainerLayout(e: LayoutChangeEvent): void {
    const w = e.nativeEvent.layout.width
    if (Math.abs(w - containerWidth) >= 1) setContainerWidth(w)
  }

  // Overwrite computed positions with precise rendered positions for hit-testing.
  function onTokenLayout(tokenIdx: number, layout: LayoutRectangle): void {
    layoutMap.current.set(tokenIdx, layout)
  }

  return {
    tokens: visibleTokens,
    sentences,
    spans,
    blocks,
    fontSize,
    needsCalibration: !calibrated,
    onCalibrated,
    isHighlighted,
    pan,
    onContainerLayout,
    onTokenContainerLayout,
    onTokenLayout,
  }
}
