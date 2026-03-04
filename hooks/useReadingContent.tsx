import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LayoutChangeEvent, LayoutRectangle } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useReading } from "@/hooks/useReading";
import { useLoading } from "@/hooks/useLoading";
import { ReadingPackageV1 } from "@/types/readings";

type Token = ReadingPackageV1["tokens"][number];
type LayoutMap = Map<number, LayoutRectangle>;

// visibleIds restricts the search to tokens currently rendered on screen,
// preventing stale measurement-pass positions from other pages being hit.
function hitTest(x: number, y: number, map: LayoutMap, visibleIds: Set<number>): number | null {
  for (const [tokenIdx, rect] of map.entries()) {
    if (!visibleIds.has(tokenIdx)) continue;
    if (
      x >= rect.x && x <= rect.x + rect.width &&
      y >= rect.y && y <= rect.y + rect.height
    ) {
      return tokenIdx;
    }
  }
  return null;
}

type Sentence = ReadingPackageV1["sentences"][number];

// Build a token→sentence lookup by walking both arrays together.O(n+m) 
function buildTokenSentenceMap(allTokens: Token[], sentences: Sentence[]): Map<number, number> {
  const map = new Map<number, number>();
  let sIdx = 0;
  for (const token of allTokens) {
    // Advance past sentences that end before this token starts.
    while (sIdx < sentences.length && sentences[sIdx].end < token.start) sIdx++;
    if (
      sIdx < sentences.length &&
      token.start >= sentences[sIdx].start &&
      token.end <= sentences[sIdx].end
    ) {
      map.set(token.i, sentences[sIdx].i);
    }
  }
  return map;
}

// Walk all token layouts (measured during the full render pass) and split them
// into pages. A token belongs to the current page if its bottom edge fits
// within `height` units from where the page started in the continuous layout.
//
// Sentence-aware: when a greedy break would split a sentence across pages,
// the current page is trimmed back to the start of that sentence so the whole
// sentence begins on the next page instead.
function buildPages(
  map: LayoutMap,
  allTokens: Token[],
  sentences: Sentence[],
  height: number
): Token[][] {
  if (height === 0 || allTokens.length === 0) return [];

  const tokenSentence = buildTokenSentenceMap(allTokens, sentences);
  const pages: Token[][] = [];
  let pageTokens: Token[] = [];
  let pageStartY = 0;

  for (const token of allTokens) {
    const rect = map.get(token.i);
    if (!rect) continue;

    if (rect.y + rect.height - pageStartY <= height) {
      pageTokens.push(token);
    } else {
      // Greedy break: check whether this token shares a sentence with the
      // last token on the current page.
      const breakingSentence = tokenSentence.get(token.i);
      const lastSentence =
        pageTokens.length > 0
          ? tokenSentence.get(pageTokens[pageTokens.length - 1].i)
          : undefined;

      const sentenceSplit =
        breakingSentence !== undefined && breakingSentence === lastSentence;

      if (sentenceSplit) {
        // Find where the split sentence starts within the current page.
        let sentenceStartIdx = pageTokens.length - 1;
        while (
          sentenceStartIdx > 0 &&
          tokenSentence.get(pageTokens[sentenceStartIdx - 1].i) === breakingSentence
        ) {
          sentenceStartIdx--;
        }

        if (sentenceStartIdx === 0) {
          // The entire current page is one sentence — can't trim further.
          // Fall back to a normal break to avoid an empty page.
          pages.push(pageTokens);
          pageTokens = [token];
          pageStartY = rect.y;
        } else {
          // Split: everything from sentenceStartIdx onward moves to the next page.
          const spillover = pageTokens.splice(sentenceStartIdx);
          pages.push(pageTokens);

          const spillRect = map.get(spillover[0].i);
          pageStartY = spillRect ? spillRect.y : rect.y;
          pageTokens = [...spillover, token];
        }
      } else {
        // Clean sentence boundary — normal break.
        pages.push(pageTokens);
        pageTokens = [token];
        pageStartY = rect.y;
      }
    }
  }

  if (pageTokens.length > 0) pages.push(pageTokens);
  return pages;
}

export type UseReadingContentReturn = {
  tokens: Token[];
  sentences: ReadingPackageV1["sentences"];
  spans: ReadingPackageV1["spans"];
  fontSize: number;
  isMeasuring: boolean;
  isHighlighted: (tokenIdx: number) => boolean;
  pan: ReturnType<typeof Gesture.Pan>;
  onContainerLayout: (e: LayoutChangeEvent) => void;
  onTokenLayout: (tokenIdx: number, layout: LayoutRectangle) => void;
};

export function useReadingContent(): UseReadingContentReturn {
  const {
    readingContent,
    setSelection,
    fontSize,
    setTotalPages,
    currentPage,
    setCurrentPage,
  } = useReading();
  const { showLoading, hideLoading } = useLoading();

  const layoutMap = useRef<LayoutMap>(new Map());
  const visibleTokenIdsRef = useRef<Set<number>>(new Set());
  const selectionStartRef = useRef<number | null>(null);
  const selectionEndRef = useRef<number | null>(null);
  const committedRef = useRef(false);

  // Refs that mirror state/props so effects can read current values without
  // them being listed as deps (which would cause spurious re-runs).
  const pagesRef = useRef<Token[][]>([]);
  const currentPageRef = useRef<number>(0);
  const prevReadingContentRef = useRef<ReadingPackageV1 | null | undefined>(undefined);
  const anchorTokenRef = useRef<number | null>(null);

  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [layoutsComplete, setLayoutsComplete] = useState(false);
  const [pages, setPages] = useState<Token[][]>([]);

  // Keep mirror refs in sync every render.
  pagesRef.current = pages;
  currentPageRef.current = currentPage;

  const allTokens = readingContent?.tokens ?? [];
  const sentences = readingContent?.sentences ?? [];
  const spans = readingContent?.spans ?? [];

  // Reset measurement state whenever the reading content or font size changes.
  // This re-renders all tokens so they re-measure at the new size/content.
  // Show loading overlay to hide the re-measurement reflow from the user.
  useLayoutEffect(() => {
    //console.log('Effect 1 fired, readingContent:', readingContent ? `${allTokens.length} tokens` : 'null')
    const isNewReading = readingContent !== prevReadingContentRef.current;
    prevReadingContentRef.current = readingContent;

    // For font-size changes (same reading), remember the first token of the
    // current page so we can restore the position after re-pagination.
    if (!isNewReading && pagesRef.current.length > 0) {
      anchorTokenRef.current = pagesRef.current[currentPageRef.current]?.[0]?.i ?? null;
    } else {
      anchorTokenRef.current = null;
    }

    layoutMap.current.clear();
    setLayoutsComplete(false);
    setPages([]);
    setCurrentPage(0);
    if (readingContent !== null) showLoading();
  }, [readingContent, fontSize, setCurrentPage, showLoading]);

  // Once all token layouts are collected AND container height is known,
  // compute the paginated token array, then dismiss the loading overlay.
  useEffect(() => {
    //console.log('Effect 2:', { layoutsComplete, containerHeight, tokenCount: allTokens.length });
    if (!layoutsComplete || containerHeight === 0 || allTokens.length === 0) return;
    const computed = buildPages(layoutMap.current, allTokens, sentences, containerHeight);
    setPages(computed);
    setTotalPages(computed.length);

    // Restore reading position: find the page that contains the anchor token
    // (first token of the page the user was on before the font size changed).
    const anchor = anchorTokenRef.current;
    if (anchor !== null && computed.length > 0) {
      const targetPage = computed.findIndex(page => page.some(t => t.i === anchor));
      setCurrentPage(targetPage !== -1 ? targetPage : 0);
    }

    hideLoading();
  }, [layoutsComplete, containerHeight, hideLoading, setCurrentPage, setTotalPages]);

  // During the measurement pass (pages not yet built), render all tokens so
  // React Native can measure each one. After pages are built, render only the
  // current page — the container's overflow:hidden clips any measurement-pass
  // overflow before pages are ready.
  const isMeasuring = pages.length === 0 && allTokens.length > 0;
  const visibleTokens = pages.length > 0 ? (pages[currentPage] ?? []) : allTokens;
  visibleTokenIdsRef.current = new Set(visibleTokens.map(t => t.i));

  function isHighlighted(tokenIdx: number): boolean {
    if (selectionStart === null || selectionEnd === null) return false;
    const lo = Math.min(selectionStart, selectionEnd);
    const hi = Math.max(selectionStart, selectionEnd);
    return tokenIdx >= lo && tokenIdx <= hi;
  }

  function commitSelection(start: number, end: number): void {
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);
    const tokenIndices = allTokens.filter(t => t.i >= lo && t.i <= hi).map(t => t.i);
    const sentenceIndices = sentences
      .filter(s => allTokens.some(t => t.i >= lo && t.i <= hi && t.start >= s.start && t.end <= s.end))
      .map(s => s.i);
    const spanIds = spans
      .filter(s => s.token_range[0] >= lo && s.token_range[1] <= hi)
      .map(s => s.id);
    setSelection({ tokenIndices, sentenceIndices, spanIds });
  }

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin((e) => {
      committedRef.current = false;
      const hit = hitTest(e.x, e.y, layoutMap.current, visibleTokenIdsRef.current);
      if (hit !== null) {
        selectionStartRef.current = hit;
        selectionEndRef.current = hit;
        setSelectionStart(hit);
        setSelectionEnd(hit);
      }
    })
    .onUpdate((e) => {
      const hit = hitTest(e.x, e.y, layoutMap.current, visibleTokenIdsRef.current);
      if (hit !== null) {
        selectionEndRef.current = hit;
        setSelectionEnd(hit);
      }
    })
    .onEnd(() => {
      const start = selectionStartRef.current;
      const end = selectionEndRef.current;
      if (start !== null && end !== null) {
        commitSelection(start, end);
        committedRef.current = true;
      }
    })
    .onFinalize(() => {
      if (!committedRef.current) {
        const start = selectionStartRef.current;
        const end = selectionEndRef.current;
        if (start !== null && end !== null) commitSelection(start, end);
      }
      selectionStartRef.current = null;
      selectionEndRef.current = null;
      setSelectionStart(null);
      setSelectionEnd(null);
    });

  function onContainerLayout(e: LayoutChangeEvent): void {
    setContainerHeight(e.nativeEvent.layout.height);
  }

  function onTokenLayout(tokenIdx: number, layout: LayoutRectangle): void {
    layoutMap.current.set(tokenIdx, layout);
    // console.log(`token layouts: ${layoutMap.current.size} / ${allTokens.length}`);
    // Signal completion once every token has reported its layout.
    // Guard with !layoutsComplete so this only fires once per measurement pass.
    if (!layoutsComplete && layoutMap.current.size >= allTokens.length && allTokens.length > 0) {
      setLayoutsComplete(true);
    }
  }

  return { 
      tokens: visibleTokens, 
      sentences, 
      spans, 
      fontSize, 
      isMeasuring, 
      isHighlighted, 
      pan, 
      onContainerLayout, 
      onTokenLayout
   };
}
