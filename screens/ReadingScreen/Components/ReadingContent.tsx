import { View, StyleSheet } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { styles as screenStyles } from "@/screens/ReadingScreen/styles";
import WordToken from "./WordToken";
import { useReadingContent } from "@/hooks/useReadingContent";

export default function ReadingContent() {
  const { tokens, fontSize, isMeasuring, isHighlighted, pan, onContainerLayout, onTokenLayout } = useReadingContent();

  return (
    <View style={screenStyles.readingContent} onLayout={onContainerLayout}>
      <GestureDetector gesture={pan}>
        <View style={[styles.tokenContainer, isMeasuring && styles.tokenContainerHidden]}>
          {tokens.map((token, idx) => {
            const prev = idx > 0 ? tokens[idx - 1] : null;
            const addLeadingSpace = prev !== null && token.start > prev.end;
            return (
              <WordToken
                key={token.i}
                token={token}
                addLeadingSpace={addLeadingSpace}
                isHighlighted={isHighlighted(token.i)}
                fontSize={fontSize}
                onLayout={(layout) => onTokenLayout(token.i, layout)}
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
  tokenContainerHidden: {
    opacity: 0,
  },
});
