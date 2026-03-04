import { View, Text, TextArea, Button } from "@/components/ui";
import { useThemeColor } from "@/hooks/useThemeColor";
import { styles } from "@/components/WordsSheet/styles";

type WordEditProps = {
  selectedText: string | null;
  definitionDraft: string;
  translationDraft: string;
  contextDraft: string;
  setDefinitionDraft: (v: string) => void;
  setTranslationDraft: (v: string) => void;
  setContextDraft: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function WordEdit({
  selectedText,
  definitionDraft,
  translationDraft,
  contextDraft,
  setDefinitionDraft,
  setTranslationDraft,
  setContextDraft,
  onConfirm,
  onCancel,
}: WordEditProps) {
  const textColor = useThemeColor({}, "text");

  return (
    <>
      <View style={styles.sheetHeader}>
        <Text style={[styles.sheetHeaderCenter, { color: textColor }]}>
          {selectedText ?? "—"}
        </Text>
      </View>
      <Text style={[styles.sheetLabel, { color: textColor }]}>Definition:</Text>
      <TextArea value={definitionDraft} onChangeText={setDefinitionDraft} minHeight={30} />
      <Text style={[styles.sheetLabel, { color: textColor }]}>Translation:</Text>
      <TextArea value={translationDraft} onChangeText={setTranslationDraft} minHeight={30} />
      <Text style={[styles.sheetLabel, { color: textColor }]}>Context:</Text>
      <TextArea value={contextDraft} onChangeText={setContextDraft} minHeight={30} />
      <View style={styles.sheetEditActions}>
        <Button variant="secondary" onPress={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onPress={onConfirm}>
          Confirm
        </Button>
      </View>
    </>
  );
}
