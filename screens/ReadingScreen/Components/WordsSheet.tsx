import { useEffect, useMemo, useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { View, Text } from "@/components/ui";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useReading } from "@/hooks/useReading";
import { styles } from "@/screens/ReadingScreen/styles";


export default function WordsSheet() {
  const { selection, selectedText, sentenceText } = useReading();
  const sheetRef = useRef<BottomSheet>(null);

  const cardBackground = useThemeColor({}, "cardBackground");
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const handleColor = useThemeColor({}, "textTertiary");

  const snapPoints = useMemo(() => ["12%", "50%", "90%"], []);

  useEffect(() => {
    if (selection !== null) {
      console.log("sheet")
      sheetRef.current?.snapToIndex(1);
    } else {
      sheetRef.current?.snapToIndex(0);
    }
  }, [selection]);

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      index={0}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: cardBackground }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <View style={styles.sheetContent}>
        <Text style={[styles.sheetTitle, { color: textColor }]}>
          {selectedText ?? "Definitions"}
        </Text>
        <Text style={[styles.sheetPlaceholder, { color: textSecondary }]}>
          {sentenceText ?? "Context definitions will appear here."}
        </Text>
      </View>
    </BottomSheet>
  );
}