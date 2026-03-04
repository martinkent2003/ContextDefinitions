import { useEffect, useMemo, useRef, useState } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { View } from "@/components/ui";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useReading } from "@/hooks/useReading";
import { ReadingSelection } from "@/types/readings";
import { styles } from "@/components/WordsSheet/styles";
import { WordFeed } from "@/components/WordsSheet/WordFeed";
import { WordView } from "@/components/WordsSheet/WordView";
import { WordEdit } from "@/components/WordsSheet/WordEdit";
import { Alert } from "react-native";

type SheetMode = "feed" | "view" | "edit";

export type SavedWord = {
  text: string;
  definition: string;
  translation: string;
  context: string;
  selection: ReadingSelection;
};

export default function WordsSheet() {
  const { selection, setSelection, selectedText, sentenceText } = useReading();
  const sheetRef = useRef<BottomSheet>(null);

  const [mode, setMode] = useState<SheetMode>("feed");
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [definition, setDefinition] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [definitionDraft, setDefinitionDraft] = useState("");
  const [translationDraft, setTranslationDraft] = useState("");
  const [contextDraft, setContextDraft] = useState("");

  const cardBackground = useThemeColor({}, "cardBackground");
  const handleColor = useThemeColor({}, "textTertiary");
  const snapPoints = useMemo(() => ["12%", "50%", "90%"], []);

  useEffect(() => {
    if (selection !== null) {
      setMode("view");
      sheetRef.current?.snapToIndex(0);
    } else {
      setMode("feed");
      sheetRef.current?.snapToIndex(0);
    }
  }, [selection]);

  function handleView(savedWord: SavedWord) {
    setSelection(savedWord.selection);
    console.log("setting selection");
  }

  function handleBack() {
    setSelection(null);
    setMode("feed");
    sheetRef.current?.snapToIndex(1);
  }

  function handleEditPress() {
    setDefinitionDraft(definition ?? "");
    setTranslationDraft(translation ?? "");
    setContextDraft(sentenceText ?? "");
    setMode("edit");
    sheetRef.current?.snapToIndex(2);
  }

  function handleConfirm() {
    setDefinition(definitionDraft);
    setTranslation(translationDraft);
    setMode("view");
    sheetRef.current?.snapToIndex(1);
  }

  function handleCancel() {
    setMode("view");
    sheetRef.current?.snapToIndex(1);
  }

  const isSaved = savedWords.some(w => w.text === selectedText);

  function handleRemove() {
    if (!selectedText) return;
    Alert.alert(selectedText, "Remove this word from your list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive", onPress: () => {
          setSavedWords((prev) => {
            const idx = prev.findIndex(w => w.text === selectedText);
            if (idx === -1) return prev;
            return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
          });
        }
      },
    ]);
  }

  function handleAdd() {
    if (!selection || !selectedText) return;
    Alert.alert(selectedText, "add word to list", [
                { text: "Cancel", style: "destructive" },
                { text: "Confirm", style: "default", onPress: () => {
                  setSavedWords((prev) => [
                    ...prev,
                    {
                      text: selectedText ?? "",
                      definition: definition ?? "",
                      translation: translation ?? "",
                      context: sentenceText ?? "",
                      selection,
                    },
                  ]);} 
                },
            ]);
  }

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: cardBackground }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <View style={styles.sheetContent}>
        {mode === "feed" && 
        <WordFeed 
          savedWords={savedWords} 
          handleView={handleView}
        />}
        {mode === "view" && (
          <WordView
            selectedText={selectedText}
            definition={definition}
            translation={translation}
            sentenceText={sentenceText}
            isSaved={isSaved}
            onBack={handleBack}
            onEdit={handleEditPress}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        )}
        {mode === "edit" && (
          <WordEdit
            selectedText={selectedText}
            definitionDraft={definitionDraft}
            translationDraft={translationDraft}
            contextDraft={contextDraft}
            setDefinitionDraft={setDefinitionDraft}
            setTranslationDraft={setTranslationDraft}
            setContextDraft={setContextDraft}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </View>
    </BottomSheet>
  );
}
