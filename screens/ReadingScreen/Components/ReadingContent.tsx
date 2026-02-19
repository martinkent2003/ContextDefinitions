import { useRef, useState } from "react";
import { LayoutRectangle, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useReading } from "@/hooks/useReading";
import { styles as screenStyles } from "@/screens/ReadingScreen/styles";
import WordToken from "./WordToken";

type LayoutMap = Map<number, LayoutRectangle>;

function hitTest(x: number, y: number, map: LayoutMap): number | null {
  for (const [tokenIdx, rect] of map.entries()) {
    if (
      x >= rect.x && x <= rect.x + rect.width &&
      y >= rect.y && y <= rect.y + rect.height
    ) {
      return tokenIdx;
    }
  }
  return null;
}

export default function ReadingContent() {
  const { readingContent, setSelection } = useReading();

  const layoutMap = useRef<LayoutMap>(new Map());
  const selectionStartRef = useRef<number | null>(null);
  const selectionEndRef = useRef<number | null>(null);
  const committedRef = useRef(false);

  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  const tokens = readingContent?.tokens ?? [];
  const sentences = readingContent?.sentences ?? [];
  const spans = readingContent?.spans ?? [];

  function isHighlighted(tokenIdx: number): boolean {
    if (selectionStart === null || selectionEnd === null) return false;
    const lo = Math.min(selectionStart, selectionEnd);
    const hi = Math.max(selectionStart, selectionEnd);
    return tokenIdx >= lo && tokenIdx <= hi;
  }

  function commitSelection(start: number, end: number) {
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);
    const tokenIndices = tokens
      .filter(t => t.i >= lo && t.i <= hi)
      .map(t => t.i);
    const sentenceIndices = sentences
      .filter(s => tokens.some(t => t.i >= lo && t.i <= hi && t.start >= s.start && t.end <= s.end))
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
      const hit = hitTest(e.x, e.y, layoutMap.current);
      if (hit !== null) {
        selectionStartRef.current = hit;
        selectionEndRef.current = hit;
        setSelectionStart(hit);
        setSelectionEnd(hit);
      }
    })
    .onUpdate((e) => {
      const hit = hitTest(e.x, e.y, layoutMap.current);
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
        if (start !== null && end !== null) {
          commitSelection(start, end);
        }
      }
      selectionStartRef.current = null;
      selectionEndRef.current = null;
      setSelectionStart(null);
      setSelectionEnd(null);
    });

  return (
    <View style={screenStyles.readingContent}>
      <GestureDetector gesture={pan}>
        <View style={styles.tokenContainer}>
          {tokens.map((token, idx) => {
            const prev = idx > 0 ? tokens[idx - 1] : null;
            const addLeadingSpace = prev !== null && token.start > prev.end;
            return (
              <WordToken
                key={token.i}
                token={token}
                addLeadingSpace={addLeadingSpace}
                isHighlighted={isHighlighted(token.i)}
                onLayout={(layout) => layoutMap.current.set(token.i, layout)}
              />
            );
          })}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  tokenContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
